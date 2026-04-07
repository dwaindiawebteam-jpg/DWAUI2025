"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import { extractAssetUrlsFromSupport } from "@/lib/extractAssetUrls";
import { compressImageClient } from "@/lib/compressImage";
import FloatingSaveBar from "@/components/editor/FloatingSaveBar";
import type { SupportContent, SupportCause } from "@/types/support";

export default function AdminSupportPage() {
  const { user, role, authReady } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const [originalContent, setOriginalContent] = useState<SupportContent | null>(null);
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<Array<{ 
    url: string; 
    fileId: string; 
    oldUrl?: string;
    oldFileId?: string;
  }>>([]);
    
  const [activeTab, setActiveTab] = useState("hero");

  const [content, setContent] = useState<SupportContent>({
    heroSection: {
      image: "/images/supportpage/hero-img.png",
      imageFileId: "",
      imageAlt: "farmers from Dalit community",
      belowSectionBackground: "#FD7E14",
      belowText: {
        title: "Support Our Cause!",
        titleColor: "#004265",
        content: [
          {
            text: `DALIT WELFARE is a grassroot NGO working directly with Dalit communities in tribal and rural regions of Nandyal & Kurnnol districts.`,
            color: "black",
          },
        ],
      },
    },
    causes: {
      causesList: [
        {
          id: 1,
          title: "1. Corporate Foundations",
          details: "Partner with us through CSR initiatives to create sustainable impact in rural Dalit communities. Your support can empower women entrepreneurs, digital education, and healthcare projects, aligning with SDGs and long-term social change.",
          imageSrc: "/images/supportpage/children-img.png",
          imageAlt: "Corporate partnership meeting for social impact",
          imageFileId: "",
        },
        {
          id: 2,
          title: "2. Philanthropies",
          details: "Your investment fuels transformative programs tackling poverty, caste discrimination, and gender inequality. By backing our initiatives, you help scale solutions that create dignity, opportunity, and resilience in marginalized communities.",
          imageSrc: "/images/supportpage/children-img.png",
          imageAlt: "Philanthropic investment in community development",
          imageFileId: "",
        },
        {
          id: 3,
          title: "3. Generous Donors",
          details: "Every contribution, big or small, creates ripples of change. Your donation supports education, healthcare, and livelihoods for Dalit families, ensuring a brighter, more equal future for generations to come.",
          imageSrc: "/images/supportpage/children-img.png",
          imageAlt: "Donors supporting Dalit communities",
          imageFileId: "",
        },
        {
          id: 4,
          title: "4. Volunteers",
          details: "Share your skills, time, and passion to uplift communities. From digital support to field activities, volunteers are the heart of our mission, bringing energy and expertise where it matters most.",
          imageSrc: "/images/supportpage/children-img.png",
          imageAlt: "Volunteers working with rural community",
          imageFileId: "",
        },
        {
          id: 5,
          title: "5. Fundraisers",
          details: "Champion our cause by mobilizing networks and resources. As a fundraiser, you amplify our reach and ensure more people can join hands in building inclusive, thriving rural communities.",
          imageSrc: "/images/supportpage/children-img.png",
          imageAlt: "Fundraising event for community causes",
          imageFileId: "",
        },
        {
          id: 6,
          title: "6. Field Visit Teams",
          details: "Experience the impact firsthand by visiting our projects in Nandyal and Kurnool. Field visits build deeper understanding, accountability, and connection between supporters and the communities they help transform.",
          imageSrc: "/images/supportpage/children-img.png",
          imageAlt: "Field visit team interacting with community members",
          imageFileId: "",
        },
      ],
    },
    entireWorld: {
      text: "Whoever saves one life, saves the entire world.",
    },
    infoForm: {
      enabled: true,
    },
  });

  // Causes management functions
  const addCause = () => {
    const newId = Math.max(...content.causes.causesList.map(c => c.id), 0) + 1;
    const newCause: SupportCause = {
      id: newId,
      title: "New Cause",
      details: "Description of the cause goes here...",
      imageSrc: "",
      imageAlt: "Cause image",
      imageFileId: "",
    };
    setContent(prev => ({
      ...prev,
      causes: {
        causesList: [...prev.causes.causesList, newCause]
      }
    }));
  };

  const removeCause = (index: number) => {
    setContent(prev => ({
      ...prev,
      causes: {
        causesList: prev.causes.causesList.filter((_, i) => i !== index)
      }
    }));
  };

  const updateCause = (index: number, field: keyof SupportCause, value: any) => {
    setContent(prev => {
      const updated = [...prev.causes.causesList];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        causes: { causesList: updated }
      };
    });
  };

  useEffect(() => {
    async function loadContent() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ref = doc(db, "siteContent", "support");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const loaded: SupportContent = {
            heroSection: data.heroSection || content.heroSection,
            causes: data.causes || content.causes,
            entireWorld: data.entireWorld || content.entireWorld,
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

  function validateSupportContent(content: SupportContent): string | null {
    if (!isNonEmptyString(content.heroSection.belowText.title)) {
      return "Hero section title is required.";
    }
    if (!isNonEmptyArray(content.causes.causesList)) {
      return "Please add at least one cause.";
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

    const validationError = validateSupportContent(content);
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

      const ref = doc(db, "siteContent", "support");
      
      let finalContent = structuredClone(content);

      if (pendingAssets.length) {
        const assetsToPromote = pendingAssets.filter(asset => {
          const isUsed = extractAssetUrlsFromSupport(finalContent as any).includes(asset.url);
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
          
          // Causes images
          if (finalContent.causes?.causesList) {
            const updatedCauses = finalContent.causes.causesList.map(cause => {
              if (cause.imageSrc && replacements[cause.imageSrc]) {
                return {
                  ...cause,
                  imageSrc: replacements[cause.imageSrc].url,
                  imageFileId: replacements[cause.imageSrc].fileId,
                };
              }
              return cause;
            });
            
            finalContent = {
              ...finalContent,
              causes: {
                causesList: updatedCauses
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
        causes: finalContent.causes,
        entireWorld: finalContent.entireWorld,
        infoForm: finalContent.infoForm,
        updatedAt: new Date(),
      };
      
      await setDoc(ref, dataToSave);

      if (originalContent) {
        const before = new Set(extractAssetUrlsFromSupport(originalContent as any));
        const after = new Set(extractAssetUrlsFromSupport(finalContent as any));
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

      setSuccessMessage("Support page content saved successfully!");
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
    { id: "causes", label: "Causes / Support Options" },
    { id: "quote", label: "Quote Section" },
  ];

  return (
    <div className="px-4 sm:px-6 py-12 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center font-sans!">
          Support Page Management
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
                          "support/hero",
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
                          "support/hero",
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

              <div>
                <label className="block text-sm font-medium mb-2">Below Section Background Color</label>
                <input
                  type="color"
                  value={content.heroSection.belowSectionBackground}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    heroSection: { ...prev.heroSection, belowSectionBackground: e.target.value }
                  }))}
                  className="w-full h-12 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.heroSection.belowText.title}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    heroSection: {
                      ...prev.heroSection,
                      belowText: { ...prev.heroSection.belowText, title: e.target.value }
                    }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title Color</label>
                <input
                  type="color"
                  value={content.heroSection.belowText.titleColor}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    heroSection: {
                      ...prev.heroSection,
                      belowText: { ...prev.heroSection.belowText, titleColor: e.target.value }
                    }
                  }))}
                  className="w-full h-12 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                {content.heroSection.belowText.content.map((segment, idx) => (
                  <div key={idx} className="mb-4 p-4 border rounded">
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">Text</label>
                      <textarea
                        value={segment.text}
                        onChange={(e) => {
                          const updated = [...content.heroSection.belowText.content];
                          updated[idx] = { ...updated[idx], text: e.target.value };
                          setContent(prev => ({
                            ...prev,
                            heroSection: {
                              ...prev.heroSection,
                              belowText: { ...prev.heroSection.belowText, content: updated }
                            }
                          }));
                        }}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Weight</label>
                        <select
                          value={segment.weight || "normal"}
                          onChange={(e) => {
                            const updated = [...content.heroSection.belowText.content];
                            updated[idx] = { ...updated[idx], weight: e.target.value as any };
                            setContent(prev => ({
                              ...prev,
                              heroSection: {
                                ...prev.heroSection,
                                belowText: { ...prev.heroSection.belowText, content: updated }
                              }
                            }));
                          }}
                          className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="light">Light</option>
                          <option value="medium">Medium</option>
                          <option value="semibold">Semibold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Color</label>
                        <input
                          type="color"
                          value={segment.color || "#000000"}
                          onChange={(e) => {
                            const updated = [...content.heroSection.belowText.content];
                            updated[idx] = { ...updated[idx], color: e.target.value };
                            setContent(prev => ({
                              ...prev,
                              heroSection: {
                                ...prev.heroSection,
                                belowText: { ...prev.heroSection.belowText, content: updated }
                              }
                            }));
                          }}
                          className="w-full h-12 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = content.heroSection.belowText.content.filter((_, i) => i !== idx);
                        setContent(prev => ({
                          ...prev,
                          heroSection: {
                            ...prev.heroSection,
                            belowText: { ...prev.heroSection.belowText, content: updated }
                          }
                        }));
                      }}
                      className="mt-2 px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove Segment
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setContent(prev => ({
                      ...prev,
                      heroSection: {
                        ...prev.heroSection,
                        belowText: {
                          ...prev.heroSection.belowText,
                          content: [...prev.heroSection.belowText.content, { text: "", weight: "normal", color: "#000000" }]
                        }
                      }
                    }));
                  }}
                  className="mt-2 px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Text Segment
                </button>
              </div>
            </div>
          )}

          {/* Causes Section */}
          {activeTab === "causes" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Causes / Support Options</h2>
                <button
                  onClick={addCause}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Cause
                </button>
              </div>

              {content.causes.causesList.map((cause, idx) => (
                <div key={cause.id} className="border p-5 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">Cause #{idx + 1}</h3>
                    <button
                      onClick={() => removeCause(idx)}
                      className="px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove Cause
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={cause.title}
                        onChange={(e) => updateCause(idx, "title", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Details / Description</label>
                      <textarea
                        value={cause.details}
                        onChange={(e) => updateCause(idx, "details", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Image Alt Text</label>
                      <input
                        type="text"
                        value={cause.imageAlt}
                        onChange={(e) => updateCause(idx, "imageAlt", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Cause Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files?.[0]) return;
                          setUploading(true);
                          try {
                            const result = await uploadAsset(
                              e.target.files[0],
                              "support/causes",
                              (p) => setUploadProgress(prev => ({ ...prev, [`cause_${idx}`]: p })),
                              cause.imageSrc,
                              cause.imageFileId
                            );
                            updateCause(idx, "imageFileId", result.fileId);
                            updateCause(idx, "imageSrc", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`cause_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                        className="hidden"
                        id={`cause-image-${idx}`}
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
                              "support/causes",
                              (p) => setUploadProgress(prev => ({ ...prev, [`cause_${idx}`]: p })),
                              cause.imageSrc,
                              cause.imageFileId
                            );
                            updateCause(idx, "imageFileId", result.fileId);
                            updateCause(idx, "imageSrc", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`cause_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                      >
                        <label
                          htmlFor={`cause-image-${idx}`}
                          className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                        >
                          Click or drag image here
                        </label>
                      </div>
                      
                      {uploadProgress[`cause_${idx}`] !== undefined && (
                        <div className="mt-2">
                          <div className="h-2 w-full bg-gray-200">
                            <div
                              className="h-2 bg-[#004265] transition-all"
                              style={{ width: `${uploadProgress[`cause_${idx}`]}%` }}
                            />
                          </div>
                          <p className="text-xs mt-1">Uploading… {uploadProgress[`cause_${idx}`]}%</p>
                        </div>
                      )}
                      {cause.imageSrc && (
                        <div className="mt-4">
                          <img src={cause.imageSrc} alt={cause.title} className="max-h-48 border object-cover" />
                          <button
                            onClick={() => {
                              updateCause(idx, "imageSrc", "");
                              updateCause(idx, "imageFileId", "");
                            }}
                            className="mt-2 px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quote Section */}
          {activeTab === "quote" && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-medium mb-6 font-sans!">Quote Section</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Quote Text</label>
                <textarea
                  value={content.entireWorld.text}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    entireWorld: { text: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                  rows={3}
                  placeholder="Enter the quote text here..."
                />
                <p className="text-base! text-gray-500 mt-1">This quote is displayed prominently on the support page.</p>
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