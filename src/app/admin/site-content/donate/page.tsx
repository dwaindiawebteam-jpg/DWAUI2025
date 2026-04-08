// app/admin/donate/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import { extractAssetUrlsFromDonate } from "@/lib/extractAssetUrls";
import { compressImageClient } from "@/lib/compressImage";
import FloatingSaveBar from "@/components/editor/FloatingSaveBar";
import type { DonateContent, DonateDonorOption, DonatePolicyContent } from "@/types/donate";

export default function AdminDonatePage() {
  const { user, role, authReady } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const [originalContent, setOriginalContent] = useState<DonateContent | null>(null);
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<Array<{ 
    url: string; 
    fileId: string; 
    oldUrl?: string;
    oldFileId?: string;
  }>>([]);
    
  const [activeTab, setActiveTab] = useState("hero");

  const [content, setContent] = useState<DonateContent>({
    heroSection: {
      image: "/images/donatepage/DonatepageChildrenImage.png",
      imageFileId: "",
      imageAlt: "Children from Dalit community",
    },
    dualContentBlock: {
      left: {
        title: "For Indian Donors",
        titleColor: "#000000",
        bgColor: "bg-yellow",
        type: "image",
        content: {
          imageSrc: "/images/donatepage/QR_code.png",
          imageAlt: "QR_code",
          imageFileId: "",
        },
      },
      right: {
        title: "For International Donors",
        titleColor: "#000000",
        bgColor: "#FFFFFF",
        content: [
          {
            text: "Razorpay",
            bgColor: "bg-blue/60",
            url: "/apply",
          },
          {
            text: "Stripe",
            bgColor: "bg-purple/60",
            url: "/apply",
          },
        ],
      },
    },
    privacyPolicy: {
      title: "Privacy Policy",
      content: {
        text: "At Dalit Welfare Association, we respect your privacy. Any personal information shared through our website, donations, or newsletters is kept secure and never shared with third parties. We use your data only to improve services, provide updates, and maintain transparent communication with our supporters.",
      },
      bgColor: "bg-pink/50",
    },
    refundPolicy: {
      title: "Refund Policy",
      content: {
        text: "All donations made to Dalit Welfare Association are non-refundable, as they are immediately directed toward our community programs. However, if you made an error in your contribution, please contact us within one week. We will carefully review refund requests raised during this period.",
      },
      bgColor: "bg-blue/50",
    },
    infoForm: {
      enabled: true,
    },
  });

  // Donor options management functions
  const addDonorOption = () => {
    setContent(prev => ({
      ...prev,
      dualContentBlock: {
        ...prev.dualContentBlock,
        right: {
          ...prev.dualContentBlock.right,
          content: [
            ...prev.dualContentBlock.right.content,
            { text: "New Option", bgColor: "bg-gray/60", url: "/donate" }
          ]
        }
      }
    }));
  };

  const removeDonorOption = (index: number) => {
    setContent(prev => ({
      ...prev,
      dualContentBlock: {
        ...prev.dualContentBlock,
        right: {
          ...prev.dualContentBlock.right,
          content: prev.dualContentBlock.right.content.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const updateDonorOption = (index: number, field: keyof DonateDonorOption, value: string) => {
    setContent(prev => {
      const updated = [...prev.dualContentBlock.right.content];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        dualContentBlock: {
          ...prev.dualContentBlock,
          right: { ...prev.dualContentBlock.right, content: updated }
        }
      };
    });
  };

  // Policy content update functions
  const updatePrivacyPolicy = (field: keyof DonatePolicyContent | "content.text", value: string) => {
    setContent(prev => ({
      ...prev,
      privacyPolicy: {
        ...prev.privacyPolicy,
        ...(field === "content.text" 
          ? { content: { ...prev.privacyPolicy.content, text: value } }
          : { [field]: value }
        )
      }
    }));
  };

  const updateRefundPolicy = (field: keyof DonatePolicyContent | "content.text", value: string) => {
    setContent(prev => ({
      ...prev,
      refundPolicy: {
        ...prev.refundPolicy,
        ...(field === "content.text" 
          ? { content: { ...prev.refundPolicy.content, text: value } }
          : { [field]: value }
        )
      }
    }));
  };

  useEffect(() => {
    async function loadContent() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ref = doc(db, "siteContent", "donate");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const loaded: DonateContent = {
            heroSection: data.heroSection || content.heroSection,
            dualContentBlock: data.dualContentBlock || content.dualContentBlock,
            privacyPolicy: data.privacyPolicy || content.privacyPolicy,
            refundPolicy: data.refundPolicy || content.refundPolicy,
            infoForm: data.infoForm || content.infoForm,
          };
          setContent(loaded);
          setOriginalContent(structuredClone(loaded));
        }
      } catch (err) {
        setErrorMessage("Failed to load content.");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [user]);

  async function uploadAsset(
    file: File,
    folder: string,
    onProgress?: (p: number) => void,
    oldUrl?: string,
    oldFileId?: string
  ): Promise<{ url: string; fileId: string }> {
    const compressedFile = await compressImageClient(file);
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();

      form.append("file", compressedFile);
      form.append("folder", folder);
      form.append("sessionId", sessionId);
      form.append("draft", "true");
      
      if (oldUrl) {
        form.append("oldUrl", oldUrl);
      }

      if (oldFileId) {
        form.append("oldFileId", oldFileId);
      }

      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          
          if (oldUrl) {
            setPendingAssets(prev => prev.filter(asset => asset.url !== oldUrl));
          }
          
          setPendingAssets(prev => [...prev, { 
            url: res.url, 
            fileId: res.fileId, 
            oldUrl: oldUrl,
            oldFileId: oldFileId
          }]);
          
          resolve({ url: res.url, fileId: res.fileId });
        } else {
          reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText || "no body"}`));
        }
      };

      xhr.onerror = () => reject(new Error("Upload error"));
      xhr.send(form);
    });
  }

  function validateDonateContent(content: DonateContent): string | null {
    if (!isNonEmptyString(content.heroSection.imageAlt)) {
      return "Hero section image alt text is required.";
    }
    if (!isNonEmptyString(content.dualContentBlock.left.title)) {
      return "Left block title is required.";
    }
    if (!isNonEmptyArray(content.dualContentBlock.right.content)) {
      return "Please add at least one donor option.";
    }
    return null;
  }

  function findUndefinedValues(obj: any, path: string = ""): string[] {
    const undefinedPaths: string[] = [];
    
    if (obj === undefined) {
      return [path || "root"];
    }
    
    if (obj === null || typeof obj !== "object") {
      return [];
    }
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const itemPaths = findUndefinedValues(item, `${path}[${index}]`);
        undefinedPaths.push(...itemPaths);
      });
    } else {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value === undefined) {
          undefinedPaths.push(`${path}.${key}`);
        } else if (value !== null && typeof value === "object") {
          const childPaths = findUndefinedValues(value, `${path}.${key}`);
          undefinedPaths.push(...childPaths);
        }
      });
    }
    
    return undefinedPaths;
  }

  async function handleSave() {
    const undefinedPaths = findUndefinedValues(content);
    if (undefinedPaths.length > 0) {
      setErrorMessage(`Cannot save: Found undefined values at: ${undefinedPaths.join(", ")}`);
      return;
    }
    
    if (!user) {
      setErrorMessage("Please log in to save changes.");
      return;
    }

    const validationError = validateDonateContent(content);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = await user.getIdTokenResult();
      
      if (token.claims.role !== "admin" && token.claims.role !== "author") {
        throw new Error("Insufficient permissions. Admin or author role required.");
      }

      const ref = doc(db, "siteContent", "donate");
      
      let finalContent = structuredClone(content);

      if (pendingAssets.length) {
        const assetsToPromote = pendingAssets.filter(asset => {
          const isUsed = extractAssetUrlsFromDonate(finalContent as any).includes(asset.url);
          return isUsed;
        });

        if (assetsToPromote.length) {
          const res = await fetch("/api/promote-assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: assetsToPromote }),
          });
          
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to promote assets: ${res.status} ${errorText}`);
          }
          
          const { replacements } = await res.json();

          // Hero section image
          if (finalContent.heroSection.image && replacements[finalContent.heroSection.image]) {
            finalContent = {
              ...finalContent,
              heroSection: {
                ...finalContent.heroSection,
                image: replacements[finalContent.heroSection.image].url,
                imageFileId: replacements[finalContent.heroSection.image].fileId,
              }
            };
          }
          
          // Left block image (QR code)
          if (finalContent.dualContentBlock.left.type === "image" && 
              finalContent.dualContentBlock.left.content.imageSrc && 
              replacements[finalContent.dualContentBlock.left.content.imageSrc]) {
            finalContent = {
              ...finalContent,
              dualContentBlock: {
                ...finalContent.dualContentBlock,
                left: {
                  ...finalContent.dualContentBlock.left,
                  content: {
                    ...finalContent.dualContentBlock.left.content,
                    imageSrc: replacements[finalContent.dualContentBlock.left.content.imageSrc].url,
                    imageFileId: replacements[finalContent.dualContentBlock.left.content.imageSrc].fileId,
                  }
                }
              }
            };
          }

          setContent(finalContent);
        }
        setPendingAssets([]);
      }

      const finalUndefinedPaths = findUndefinedValues(finalContent);
      if (finalUndefinedPaths.length > 0) {
        throw new Error(`Cannot save to Firestore: undefined values at ${finalUndefinedPaths.join(", ")}`);
      }

      const dataToSave = {
        heroSection: finalContent.heroSection,
        dualContentBlock: finalContent.dualContentBlock,
        privacyPolicy: finalContent.privacyPolicy,
        refundPolicy: finalContent.refundPolicy,
        infoForm: finalContent.infoForm,
        updatedAt: new Date(),
      };
      
      await setDoc(ref, dataToSave);

      if (originalContent) {
        const before = new Set(extractAssetUrlsFromDonate(originalContent as any));
        const after = new Set(extractAssetUrlsFromDonate(finalContent as any));
        const unusedAssets = [...before].filter(url => !after.has(url));
        
        await Promise.all(
          unusedAssets.map(url =>
            fetch("/api/delete-asset", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url }),
            }).then(res => {
              return res;
            })
          )
        );
      }

      setSuccessMessage("Donate page content saved successfully!");
      setOriginalContent(structuredClone(finalContent));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 overflow-hidden">
          <div className="h-full w-full bg-[#004265] animate-pulse"></div>
        </div>
        <p className="mt-4 font-medium text-lg font-sans!">Loading site content...</p>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans!">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 font-sans!">Access Denied</h1>
          <p className="font-sans!">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "hero", label: "Hero Section" },
    { id: "donorOptions", label: "Donor Options" },
    { id: "policies", label: "Policies" },
  ];

  return (
    <div className="px-4 sm:px-6 py-12 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center font-sans!">
          Donate Page Management
        </h1>

        {successMessage && (
          <div className="mb-6 p-4 border border-green-400 text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 border border-red-400 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="border-b mb-6 overflow-x-auto scrollable-tabs">
          <div className="flex space-x-2 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium whitespace-nowrap mb-4 ${
                  activeTab === tab.id
                    ? "border-b-2 border-[#004265] text-[#004265]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border shadow-md p-6 sm:p-8">
          {/* Hero Section */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-medium mb-6 font-sans!">Hero Section</h2>
              
              <div className="border p-5 mb-6">
                <h3 className="text-lg font-bold mb-4">Hero Background Image</h3>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      setUploading(true);
                      try {
                        const result = await uploadAsset(
                          e.target.files[0],
                          "donate/hero",
                          (p) => setUploadProgress(prev => ({ ...prev, hero_image: p })),
                          content.heroSection.image,
                          content.heroSection.imageFileId
                        );
                        setContent(prev => ({
                          ...prev,
                          heroSection: {
                            ...prev.heroSection,
                            image: result.url,
                            imageFileId: result.fileId
                          }
                        }));
                      } catch (err) {
                        setErrorMessage("Hero image upload failed");
                      } finally {
                        setUploading(false);
                        setUploadProgress(prev => {
                          const newPrev = { ...prev };
                          delete newPrev.hero_image;
                          return newPrev;
                        });
                      }
                    }}
                    className="hidden"
                    id="hero-image"
                  />
                  
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (!file || !file.type.startsWith("image/")) return;
                      
                      setUploading(true);
                      try {
                        const result = await uploadAsset(
                          file,
                          "donate/hero",
                          (p) => setUploadProgress(prev => ({ ...prev, hero_image: p })),
                          content.heroSection.image,
                          content.heroSection.imageFileId
                        );
                        setContent(prev => ({
                          ...prev,
                          heroSection: {
                            ...prev.heroSection,
                            image: result.url,
                            imageFileId: result.fileId
                          }
                        }));
                      } catch (err) {
                        setErrorMessage("Hero image upload failed");
                      } finally {
                        setUploading(false);
                        setUploadProgress(prev => {
                          const newPrev = { ...prev };
                          delete newPrev.hero_image;
                          return newPrev;
                        });
                      }
                    }}
                  >
                    <label
                      htmlFor="hero-image"
                      className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                    >
                      Click or drag hero image here
                    </label>
                  </div>
                  
                  {uploadProgress.hero_image !== undefined && (
                    <div className="mt-2">
                      <div className="h-2 w-full bg-gray-200">
                        <div
                          className="h-2 bg-[#004265] transition-all"
                          style={{ width: `${uploadProgress.hero_image}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1">Uploading… {uploadProgress.hero_image}%</p>
                    </div>
                  )}
                  {content.heroSection.image && (
                    <div className="mt-4">
                      <img 
                        src={content.heroSection.image} 
                        alt="Hero background" 
                        className="max-h-48 border object-cover" 
                      />
                      <button
                        onClick={() => {
                          setContent(prev => ({
                            ...prev,
                            heroSection: {
                              ...prev.heroSection,
                              image: "",
                              imageFileId: ""
                            }
                          }));
                        }}
                        className="mt-2 px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image Alt Text</label>
                <input
                  type="text"
                  value={content.heroSection.imageAlt}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    heroSection: { ...prev.heroSection, imageAlt: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          )}

          {/* Donor Options Section */}
          {activeTab === "donorOptions" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Donor Options</h2>
                <button
                  onClick={addDonorOption}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Donor Option
                </button>
              </div>

              {/* Left Block (Indian Donors - QR Code) */}
              <div className="border p-5 mb-8">
                <h3 className="font-bold text-lg mb-4">Left Block: Indian Donors (QR Code)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={content.dualContentBlock.left.title}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        dualContentBlock: {
                          ...prev.dualContentBlock,
                          left: { ...prev.dualContentBlock.left, title: e.target.value }
                        }
                      }))}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Title Color</label>
                    <input
                      type="color"
                      value={content.dualContentBlock.left.titleColor}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        dualContentBlock: {
                          ...prev.dualContentBlock,
                          left: { ...prev.dualContentBlock.left, titleColor: e.target.value }
                        }
                      }))}
                      className="w-full h-12 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Background Color Class</label>
                    <input
                      type="text"
                      value={content.dualContentBlock.left.bgColor}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        dualContentBlock: {
                          ...prev.dualContentBlock,
                          left: { ...prev.dualContentBlock.left, bgColor: e.target.value }
                        }
                      }))}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      placeholder="bg-yellow, bg-blue, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">QR Code Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (!e.target.files?.[0]) return;
                        setUploading(true);
                        try {
                          const result = await uploadAsset(
                            e.target.files[0],
                            "donate/qrcode",
                            (p) => setUploadProgress(prev => ({ ...prev, qr_code: p })),
                            content.dualContentBlock.left.content.imageSrc,
                            content.dualContentBlock.left.content.imageFileId
                          );
                          setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                              ...prev.dualContentBlock,
                              left: {
                                ...prev.dualContentBlock.left,
                                content: {
                                  ...prev.dualContentBlock.left.content,
                                  imageSrc: result.url,
                                  imageFileId: result.fileId
                                }
                              }
                            }
                          }));
                        } catch (err) {
                          setErrorMessage("QR code upload failed");
                        } finally {
                          setUploading(false);
                          setUploadProgress(prev => {
                            const newPrev = { ...prev };
                            delete newPrev.qr_code;
                            return newPrev;
                          });
                        }
                      }}
                      className="hidden"
                      id="qr-image"
                    />
                    
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (!file || !file.type.startsWith("image/")) return;
                        
                        setUploading(true);
                        try {
                          const result = await uploadAsset(
                            file,
                            "donate/qrcode",
                            (p) => setUploadProgress(prev => ({ ...prev, qr_code: p })),
                            content.dualContentBlock.left.content.imageSrc,
                            content.dualContentBlock.left.content.imageFileId
                          );
                          setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                              ...prev.dualContentBlock,
                              left: {
                                ...prev.dualContentBlock.left,
                                content: {
                                  ...prev.dualContentBlock.left.content,
                                  imageSrc: result.url,
                                  imageFileId: result.fileId
                                }
                              }
                            }
                          }));
                        } catch (err) {
                          setErrorMessage("QR code upload failed");
                        } finally {
                          setUploading(false);
                          setUploadProgress(prev => {
                            const newPrev = { ...prev };
                            delete newPrev.qr_code;
                            return newPrev;
                          });
                        }
                      }}
                    >
                      <label
                        htmlFor="qr-image"
                        className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                      >
                        Click or drag QR code image here
                      </label>
                    </div>
                    
                    {uploadProgress.qr_code !== undefined && (
                      <div className="mt-2">
                        <div className="h-2 w-full bg-gray-200">
                          <div
                            className="h-2 bg-[#004265] transition-all"
                            style={{ width: `${uploadProgress.qr_code}%` }}
                          />
                        </div>
                        <p className="text-xs mt-1">Uploading… {uploadProgress.qr_code}%</p>
                      </div>
                    )}
                    {content.dualContentBlock.left.content.imageSrc && (
                      <div className="mt-4">
                        <img 
                          src={content.dualContentBlock.left.content.imageSrc} 
                          alt="QR Code" 
                          className="max-h-48 border object-cover" 
                        />
                        <button
                          onClick={() => {
                            setContent(prev => ({
                              ...prev,
                              dualContentBlock: {
                                ...prev.dualContentBlock,
                                left: {
                                  ...prev.dualContentBlock.left,
                                  content: {
                                    ...prev.dualContentBlock.left.content,
                                    imageSrc: "",
                                    imageFileId: ""
                                  }
                                }
                              }
                            }));
                          }}
                          className="mt-2 px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">QR Code Alt Text</label>
                    <input
                      type="text"
                      value={content.dualContentBlock.left.content.imageAlt}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        dualContentBlock: {
                          ...prev.dualContentBlock,
                          left: {
                            ...prev.dualContentBlock.left,
                            content: {
                              ...prev.dualContentBlock.left.content,
                              imageAlt: e.target.value
                            }
                          }
                        }
                      }))}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>
              </div>

              {/* Right Block (International Donors - Buttons) */}
              <div className="border p-5">
                <h3 className="font-bold text-lg mb-4">Right Block: International Donors</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={content.dualContentBlock.right.title}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        dualContentBlock: {
                          ...prev.dualContentBlock,
                          right: { ...prev.dualContentBlock.right, title: e.target.value }
                        }
                      }))}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Title Color</label>
                    <input
                      type="color"
                      value={content.dualContentBlock.right.titleColor}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        dualContentBlock: {
                          ...prev.dualContentBlock,
                          right: { ...prev.dualContentBlock.right, titleColor: e.target.value }
                        }
                      }))}
                      className="w-full h-12 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Background Color</label>
                    <input
                      type="color"
                      value={content.dualContentBlock.right.bgColor}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        dualContentBlock: {
                          ...prev.dualContentBlock,
                          right: { ...prev.dualContentBlock.right, bgColor: e.target.value }
                        }
                      }))}
                      className="w-full h-12 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Donor Options</label>
                    {content.dualContentBlock.right.content.map((option, idx) => (
                      <div key={idx} className="mb-4 p-4 border rounded">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Option #{idx + 1}</h4>
                          <button
                            onClick={() => removeDonorOption(idx)}
                            className="px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Button Text</label>
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateDonorOption(idx, "text", e.target.value)}
                              className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Button Color Class</label>
                            <input
                              type="text"
                              value={option.bgColor}
                              onChange={(e) => updateDonorOption(idx, "bgColor", e.target.value)}
                              className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                              placeholder="bg-blue/60, bg-purple/60, etc."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Redirect URL</label>
                            <input
                              type="text"
                              value={option.url}
                              onChange={(e) => updateDonorOption(idx, "url", e.target.value)}
                              className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                              placeholder="/donate or external URL"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Policies Section */}
          {activeTab === "policies" && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-medium mb-6 font-sans!">Policies</h2>
              
              {/* Privacy Policy */}
              <div className="border p-5 mb-6">
                <h3 className="font-bold text-lg mb-4">Privacy Policy</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={content.privacyPolicy.title}
                      onChange={(e) => updatePrivacyPolicy("title", e.target.value)}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <textarea
                      value={content.privacyPolicy.content.text}
                      onChange={(e) => updatePrivacyPolicy("content.text", e.target.value)}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                      rows={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Background Color Class</label>
                    <input
                      type="text"
                      value={content.privacyPolicy.bgColor}
                      onChange={(e) => updatePrivacyPolicy("bgColor", e.target.value)}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      placeholder="bg-pink/50, bg-blue/50, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Refund Policy */}
              <div className="border p-5">
                <h3 className="font-bold text-lg mb-4">Refund Policy</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={content.refundPolicy.title}
                      onChange={(e) => updateRefundPolicy("title", e.target.value)}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <textarea
                      value={content.refundPolicy.content.text}
                      onChange={(e) => updateRefundPolicy("content.text", e.target.value)}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                      rows={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Background Color Class</label>
                    <input
                      type="text"
                      value={content.refundPolicy.bgColor}
                      onChange={(e) => updateRefundPolicy("bgColor", e.target.value)}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      placeholder="bg-blue/50, bg-green/50, etc."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <FloatingSaveBar
          onClick={handleSave}
          saving={saving || uploading}
          label="Save All Changes"
        />
      </div>
    </div>
  );
}