// app/admin/about/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import { extractAssetUrlsFromAbout } from "@/lib/extractAssetUrls";
import { compressImageClient } from "@/lib/compressImage";
import FloatingSaveBar from "@/components/editor/FloatingSaveBar";
import type { AboutContent, AboutTextSegment, AboutTeamMember, AboutVolunteer, AboutAccreditationParagraph } from "@/types/about";

function normalizeTag(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export default function AdminAboutPage() {
  const { user, role, authReady } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const [originalContent, setOriginalContent] = useState<AboutContent | null>(null);
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<Array<{ 
    url: string; 
    fileId: string; 
    oldUrl?: string;
    oldFileId?: string;
  }>>([]);
    
  const [activeTab, setActiveTab] = useState("hero");

  const [content, setContent] = useState<AboutContent>({
    heroSection: {
      image: "/images/aboutpage/kids.jpg",
      imageFileId: "",
      imageAlt: "Children from Dalit community",
      belowText: {
        title: "About Us",
        titleColor: "#004265",
        content: [
          {
            text: `Dalit Welfare Association is a nonprofit organization dedicated to empowering marginalized communities in the rural villages of Nandyal and Kurnool districts. Our work focuses on uplifting Dalit women through micro-credit, financial literacy, and sustainable livelihood opportunities. By strengthening women's capacity to lead and support their families, we strive to break poverty cycles, foster equality, and build resilient, inclusive communities for future generations.`,
            color: "black",
          },
        ],
      },
    },
    dualContentBlock: {
      left: {
        title: "Vision",
        titleColor: "#000000",
        bgColor: "bg-orange",
        type: "paragraph",
        content: [
          {
            text: `To build an inclusive society where Dalit women thrive with dignity, equality, and opportunity—breaking poverty cycles and creating sustainable, empowered communities for generations to come.`,
            weight: "medium",
            color: "#000",
          },
        ],
      },
      right: {
        title: "Mission",
        titleColor: "#000000",
        bgColor: "bg-yellow",
        type: "paragraph",
        content: [
          {
            text: `To empower marginalized women through micro-credit, financial education, and livelihoods—strengthening families, fostering community resilience, and ensuring sustainable, grassroots-driven change rooted in dignity, justice, and equality.`,
            weight: "medium",
            color: "#000",
          },
        ],
      },
    },
    accreditations: {
      heading: "Accreditations",
      paragraph: [
        { text: "Dalit Welfare Association is a legally registered nonprofit organization, governed by all statutory requirements under Indian law. We hold valid ", weight: "normal" },
        { text: "Registration Certificates", weight: "bold" },
        { text: ", ", weight: "normal" },
        { text: "12A & 80G tax exemption approvals", weight: "bold" },
        { text: ", and maintain compliance with the ", weight: "normal" },
        { text: "FCRA (Foreign Contribution Regulation Act)", weight: "bold" },
        { text: " to receive international donations. Our financial records are audited annually, ensuring transparency, accountability, and trust with donors, partners, and the communities we serve.", weight: "normal" }
      ],
      logos: [
        "/images/aboutpage/givedo.png",
        "/images/aboutpage/guidestarindia.png",
        "/images/aboutpage/benevity.png",
        "/images/aboutpage/goodstack.png"
      ],
      logoFileIds: ["", "", "", ""],
    },
    impactStats: {
      bgColor: "bg-yellow",
      textColor: "#000",
      people: 5000,
      villages: 140,
      programs: 30,
    },
    team: {
      heading: "DWA Team",
      paragraph: "Our dedicated team works tirelessly in the field and office, bringing passion, skills, and commitment to empower Dalit communities and drive lasting change in rural Nandyal and Kurnool.",
      teamMembers: [
        { name: "S. Moses", role: "Program Manager", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
        { name: "K. Saroja", role: "Field Work", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
        { name: "G. Bhaskar", role: "Office Staff", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
        { name: "P. Danielu", role: "Field Work", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
        { name: "N. Sudha Rani", role: "Field Work", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
        { name: "K. Bujji", role: "Office Work", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
      ],
    },
    volunteers: {
      heading: "Volunteers",
      volunteers: [
        {
          name: "Michael M",
          role: "Junior Software Developer., S.A.",
          description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
          image: "/images/SplatterImages/orange splatter 2.png",
          imageFileId: "",
          linkedin: "#",
          bgColor: "bg-[#FFEEB5]",
        },
        {
          name: "Prince Sithole",
          role: "Junior Software Developer., S.A.",
          description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
          image: "/images/SplatterImages/orange splatter 2.png",
          imageFileId: "",
          linkedin: "#",
          bgColor: "bg-[#FFEEB5]",
        },
        {
          name: "Scott Singer",
          role: "Senior Software Developer., USA",
          description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
          image: "/images/SplatterImages/orange splatter.png",
          imageFileId: "",
          linkedin: "#",
          bgColor: "bg-[#FFEEB5]",
        },
        {
          name: "Fatimoh B",
          role: "Software Developer., Nigeria.",
          description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
          image: "/images/SplatterImages/orange splatter 2.png",
          imageFileId: "",
          linkedin: "#",
          bgColor: "bg-[#FED6F8]",
        },
        {
          name: "Dayo Abdul",
          role: "Senior Software Developer., Nigeria.",
          description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
          image: "/images/SplatterImages/orange splatter.png",
          imageFileId: "",
          linkedin: "#",
          bgColor: "bg-[#FED6F8]",
        },
        {
          name: "Megan Ward",
          role: "Salesforce Admin., Ireland.",
          description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
          image: "/images/SplatterImages/orange splatter.png",
          imageFileId: "",
          linkedin: "#",
          bgColor: "bg-[#FED6F8]",
        },
      ],
    },
    workAreas: {},
    presidentMessage: {
      image: "/images/SplatterImages/purple splatter.png",
      imageFileId: "",
      imageAlt: "President message",
      title: "Breaking Barriers, Restoring Dignity",
      paragraphs: [
        "As President of DWA, I have seen how deeply caste discrimination and poverty affect Dalit families. Education, livelihoods, and women's empowerment are powerful tools we use to confront these injustices.",
        "Our efforts in rural Nandyal and Kurnool are small steps toward equality, but with strong partnerships, these steps become transformative. Together, we can dismantle barriers and create a society where Dalits live with dignity and opportunity."
      ],
      authorName: "S. Samuel",
      authorTitle: "President",
    },
  });

  useEffect(() => {
    async function loadContent() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ref = doc(db, "siteContent", "about");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const loaded: AboutContent = {
            heroSection: data.heroSection || content.heroSection,
            dualContentBlock: data.dualContentBlock || content.dualContentBlock,
            accreditations: data.accreditations || content.accreditations,
            impactStats: data.impactStats || content.impactStats,
            team: data.team || content.team,
            volunteers: data.volunteers || content.volunteers,
            workAreas: data.workAreas || content.workAreas,
            presidentMessage: data.presidentMessage || content.presidentMessage,
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

  function validateAboutContent(content: AboutContent): string | null {
    if (!isNonEmptyString(content.heroSection.belowText.title)) {
      return "Hero section title is required.";
    }
    if (!isNonEmptyArray(content.team.teamMembers)) {
      return "Please add at least one team member.";
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

    const validationError = validateAboutContent(content);
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

      const ref = doc(db, "siteContent", "about");
      let finalContent = content;

      if (pendingAssets.length) {
        const assetsToPromote = pendingAssets.filter(asset => {
          const isUsed = extractAssetUrlsFromAbout(finalContent as any).includes(asset.url);
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

          // Accreditations logos
          const updatedLogos = finalContent.accreditations.logos.map(logo => {
            if (replacements[logo]) {
              return replacements[logo].url;
            }
            return logo;
          });
          
          const updatedLogoFileIds = finalContent.accreditations.logos.map((logo, i) => {
            if (replacements[logo]) {
              return replacements[logo].fileId;
            }
            return finalContent.accreditations.logoFileIds[i];
          });

          finalContent = {
            ...finalContent,
            accreditations: {
              ...finalContent.accreditations,
              logos: updatedLogos,
              logoFileIds: updatedLogoFileIds,
            },
          };

          // Team members
          finalContent = {
            ...finalContent,
            team: {
              ...finalContent.team,
              teamMembers: finalContent.team.teamMembers.map(member => {
                if (member.image && replacements[member.image]) {
                  return {
                    ...member,
                    image: replacements[member.image].url,
                    imageFileId: replacements[member.image].fileId,
                  };
                }
                return member;
              }),
            },
          };

          // Volunteers
          finalContent = {
            ...finalContent,
            volunteers: {
              ...finalContent.volunteers,
              volunteers: finalContent.volunteers.volunteers.map(volunteer => {
                if (volunteer.image && replacements[volunteer.image]) {
                  return {
                    ...volunteer,
                    image: replacements[volunteer.image].url,
                    imageFileId: replacements[volunteer.image].fileId,
                  };
                }
                return volunteer;
              }),
            },
          };

          // President message image
          if (finalContent.presidentMessage.image && replacements[finalContent.presidentMessage.image]) {
            finalContent = {
              ...finalContent,
              presidentMessage: {
                ...finalContent.presidentMessage,
                image: replacements[finalContent.presidentMessage.image].url,
                imageFileId: replacements[finalContent.presidentMessage.image].fileId,
              },
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
        accreditations: finalContent.accreditations,
        impactStats: finalContent.impactStats,
        team: finalContent.team,
        volunteers: finalContent.volunteers,
        workAreas: finalContent.workAreas,
        presidentMessage: finalContent.presidentMessage,
        updatedAt: new Date(),
      };
      
      await setDoc(ref, dataToSave);

      if (originalContent) {
        const before = new Set(extractAssetUrlsFromAbout(originalContent as any));
        const after = new Set(extractAssetUrlsFromAbout(finalContent as any));
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

      setSuccessMessage("About page content saved successfully!");
      setOriginalContent(structuredClone(finalContent));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  // Team member management
  const addTeamMember = () => {
    setContent(prev => ({
      ...prev,
      team: {
        ...prev.team,
        teamMembers: [...prev.team.teamMembers, {
          name: "",
          role: "",
          image: "",
          imageFileId: "",
        }]
      }
    }));
  };

  const removeTeamMember = (index: number) => {
    setContent(prev => ({
      ...prev,
      team: {
        ...prev.team,
        teamMembers: prev.team.teamMembers.filter((_, i) => i !== index)
      }
    }));
  };

  const updateTeamMember = (index: number, field: keyof AboutTeamMember, value: string) => {
    setContent(prev => {
      const updated = [...prev.team.teamMembers];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        team: { ...prev.team, teamMembers: updated }
      };
    });
  };

  // Volunteer management
  const addVolunteer = () => {
    setContent(prev => ({
      ...prev,
      volunteers: {
        ...prev.volunteers,
        volunteers: [...prev.volunteers.volunteers, {
          name: "",
          role: "",
          description: "",
          image: "",
          imageFileId: "",
          linkedin: "",
          bgColor: "bg-[#FFEEB5]",
        }]
      }
    }));
  };

  const removeVolunteer = (index: number) => {
    setContent(prev => ({
      ...prev,
      volunteers: {
        ...prev.volunteers,
        volunteers: prev.volunteers.volunteers.filter((_, i) => i !== index)
      }
    }));
  };

  const updateVolunteer = (index: number, field: keyof AboutVolunteer, value: string) => {
    setContent(prev => {
      const updated = [...prev.volunteers.volunteers];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        volunteers: { ...prev.volunteers, volunteers: updated }
      };
    });
  };

  // Logo management
  const addLogo = () => {
    setContent(prev => ({
      ...prev,
      accreditations: {
        ...prev.accreditations,
        logos: [...prev.accreditations.logos, ""],
        logoFileIds: [...prev.accreditations.logoFileIds, ""],
      }
    }));
  };

  const removeLogo = (index: number) => {
    setContent(prev => ({
      ...prev,
      accreditations: {
        ...prev.accreditations,
        logos: prev.accreditations.logos.filter((_, i) => i !== index),
        logoFileIds: prev.accreditations.logoFileIds.filter((_, i) => i !== index),
      }
    }));
  };

  const updateLogo = (index: number, url: string, fileId: string) => {
    setContent(prev => {
      const updatedUrls = [...prev.accreditations.logos];
      const updatedIds = [...prev.accreditations.logoFileIds];
      updatedUrls[index] = url;
      updatedIds[index] = fileId;
      return {
        ...prev,
        accreditations: {
          ...prev.accreditations,
          logos: updatedUrls,
          logoFileIds: updatedIds,
        }
      };
    });
  };

  // Accreditation paragraph management
 const addAccreditationParagraphSegment = () => {
  setContent(prev => ({
    ...prev,
    accreditations: {
      ...prev.accreditations,
      paragraph: [...prev.accreditations.paragraph, { text: "", weight: "normal" }]  // ✅ Fixed
    }
  }));
};

  const removeAccreditationParagraphSegment = (index: number) => {
    setContent(prev => ({
      ...prev,
      accreditations: {
        ...prev.accreditations,
        paragraph: prev.accreditations.paragraph.filter((_, i) => i !== index)
      }
    }));
  };

  const updateAccreditationParagraphSegment = (index: number, field: keyof AboutAccreditationParagraph, value: string) => {
  setContent(prev => {
    const updated = [...prev.accreditations.paragraph];
    updated[index] = { ...updated[index], [field]: value };
    return {
      ...prev,
      accreditations: { ...prev.accreditations, paragraph: updated }
    };
  });
};

  // President message paragraphs management
  const addPresidentParagraph = () => {
    setContent(prev => ({
      ...prev,
      presidentMessage: {
        ...prev.presidentMessage,
        paragraphs: [...prev.presidentMessage.paragraphs, ""]
      }
    }));
  };

  const removePresidentParagraph = (index: number) => {
    setContent(prev => ({
      ...prev,
      presidentMessage: {
        ...prev.presidentMessage,
        paragraphs: prev.presidentMessage.paragraphs.filter((_, i) => i !== index)
      }
    }));
  };

  const updatePresidentParagraph = (index: number, value: string) => {
    setContent(prev => {
      const updated = [...prev.presidentMessage.paragraphs];
      updated[index] = value;
      return {
        ...prev,
        presidentMessage: { ...prev.presidentMessage, paragraphs: updated }
      };
    });
  };

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
    { id: "dual", label: "Vision & Mission" },
    { id: "accreditations", label: "Accreditations" },
    { id: "stats", label: "Impact Stats" },
    { id: "team", label: "Team" },
    { id: "volunteers", label: "Volunteers" },
    { id: "president", label: "President Message" },
  ];

  return (
    <div className="px-4 sm:px-6 py-12 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center font-sans!">
          About Page Management
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
                          "about/hero",
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
                          "about/hero",
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
                <label className="block text-sm font-medium mb-2">Below Text Title</label>
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
                <label className="block text-sm font-medium mb-2">Below Text Title Color</label>
                <input
                  type="text"
                  value={content.heroSection.belowText.titleColor}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    heroSection: {
                      ...prev.heroSection,
                      belowText: { ...prev.heroSection.belowText, titleColor: e.target.value }
                    }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
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
                          type="text"
                          value={segment.color || ""}
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
                          className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                          placeholder="black"
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
                          content: [...prev.heroSection.belowText.content, { text: "", weight: "normal" }]
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

        {/* Vision & Mission */}
        {activeTab === "dual" && (
          <div className="space-y-8">
            <h2 className="text-xl sm:text-2xl font-medium mb-6 font-sans!">Vision & Mission</h2>
            
            {/* Left Column - Vision */}
            <div className="border p-5">
              <h3 className="text-lg font-bold mb-4">Vision (Left Column)</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
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
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title Color</label>
                <input
                  type="text"
                  value={content.dualContentBlock.left.titleColor}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    dualContentBlock: {
                      ...prev.dualContentBlock,
                      left: { ...prev.dualContentBlock.left, titleColor: e.target.value }
                    }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Background Color Class</label>
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
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Content Segments</label>
                {content.dualContentBlock.left.content.map((segment, idx) => (
                  <div key={idx} className="mb-3 p-3 border rounded">
                    <textarea
                      value={segment.text}
                      onChange={(e) => {
                        const updated = [...content.dualContentBlock.left.content];
                        updated[idx] = { ...segment, text: e.target.value };
                        setContent(prev => ({
                          ...prev,
                          dualContentBlock: {
                            ...prev.dualContentBlock,
                            left: { ...prev.dualContentBlock.left, content: updated }
                          }
                        }));
                      }}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                      rows={3}
                    />
                    <div className="mt-2 flex gap-2">
                      <select
                        value={segment.weight || "normal"}
                        onChange={(e) => {
                          const updated = [...content.dualContentBlock.left.content];
                          updated[idx] = { ...segment, weight: e.target.value as any };
                          setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                              ...prev.dualContentBlock,
                              left: { ...prev.dualContentBlock.left, content: updated }
                            }
                          }));
                        }}
                        className="flex-1 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="light">Light</option>
                        <option value="medium">Medium</option>
                        <option value="semibold">Semibold</option>
                      </select>
                      <input
                        type="text"
                        value={segment.color || ""}
                        onChange={(e) => {
                          const updated = [...content.dualContentBlock.left.content];
                          updated[idx] = { ...segment, color: e.target.value };
                          setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                              ...prev.dualContentBlock,
                              left: { ...prev.dualContentBlock.left, content: updated }
                            }
                          }));
                        }}
                        className="flex-1 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        placeholder="Color (optional)"
                      />
                      <button
                        onClick={() => {
                          const updated = content.dualContentBlock.left.content.filter((_, i) => i !== idx);
                          setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                              ...prev.dualContentBlock,
                              left: { ...prev.dualContentBlock.left, content: updated }
                            }
                          }));
                        }}
                        className="px-3 py-2 border border-red-500 text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setContent(prev => ({
                      ...prev,
                      dualContentBlock: {
                        ...prev.dualContentBlock,
                        left: {
                          ...prev.dualContentBlock.left,
                          content: [...prev.dualContentBlock.left.content, { text: "", weight: "normal" }]
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

            {/* Right Column - Mission (similar structure) */}
            <div className="border p-5">
              <h3 className="text-lg font-bold mb-4">Mission (Right Column)</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
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
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title Color</label>
                <input
                  type="text"
                  value={content.dualContentBlock.right.titleColor}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    dualContentBlock: {
                      ...prev.dualContentBlock,
                      right: { ...prev.dualContentBlock.right, titleColor: e.target.value }
                    }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Background Color Class</label>
                <input
                  type="text"
                  value={content.dualContentBlock.right.bgColor}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    dualContentBlock: {
                      ...prev.dualContentBlock,
                      right: { ...prev.dualContentBlock.right, bgColor: e.target.value }
                    }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Content Segments</label>
                {content.dualContentBlock.right.content.map((segment, idx) => (
                  <div key={idx} className="mb-3 p-3 border rounded">
                    <textarea
                      value={segment.text}
                      onChange={(e) => {
                        const updated = [...content.dualContentBlock.right.content];
                        updated[idx] = { ...segment, text: e.target.value };
                        setContent(prev => ({
                          ...prev,
                          dualContentBlock: {
                            ...prev.dualContentBlock,
                            right: { ...prev.dualContentBlock.right, content: updated }
                          }
                        }));
                      }}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                      rows={3}
                    />
                    <div className="mt-2 flex gap-2">
                      <select
                        value={segment.weight || "normal"}
                        onChange={(e) => {
                          const updated = [...content.dualContentBlock.right.content];
                          updated[idx] = { ...segment, weight: e.target.value as any };
                          setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                              ...prev.dualContentBlock,
                              right: { ...prev.dualContentBlock.right, content: updated }
                            }
                          }));
                        }}
                        className="flex-1 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="light">Light</option>
                        <option value="medium">Medium</option>
                        <option value="semibold">Semibold</option>
                      </select>
                      <input
                        type="text"
                        value={segment.color || ""}
                        onChange={(e) => {
                          const updated = [...content.dualContentBlock.right.content];
                          updated[idx] = { ...segment, color: e.target.value };
                          setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                              ...prev.dualContentBlock,
                              right: { ...prev.dualContentBlock.right, content: updated }
                            }
                          }));
                        }}
                        className="flex-1 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        placeholder="Color (optional)"
                      />
                      <button
                        onClick={() => {
                          const updated = content.dualContentBlock.right.content.filter((_, i) => i !== idx);
                          setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                              ...prev.dualContentBlock,
                              right: { ...prev.dualContentBlock.right, content: updated }
                            }
                          }));
                        }}
                        className="px-3 py-2 border border-red-500 text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setContent(prev => ({
                      ...prev,
                      dualContentBlock: {
                        ...prev.dualContentBlock,
                        right: {
                          ...prev.dualContentBlock.right,
                          content: [...prev.dualContentBlock.right.content, { text: "", weight: "normal" }]
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
          </div>
        )}
          {/* Accreditations */}
          {activeTab === "accreditations" && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-medium font-sans!">Accreditations</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Heading</label>
                <input
                  type="text"
                  value={content.accreditations.heading}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    accreditations: { ...prev.accreditations, heading: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

            <div>
              <label className="block text-sm font-medium mb-2">Paragraph Segments</label>
              {content.accreditations.paragraph.map((segment, idx) => (
                <div key={idx} className="mb-3 p-3 border rounded">
                  <textarea
                    value={segment.text}
                    onChange={(e) => updateAccreditationParagraphSegment(idx, "text", e.target.value)}
                    className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                    rows={2}
                  />
                  <div className="mt-2 flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Weight</label>
                      <select
                        value={segment.weight || "normal"}
                        onChange={(e) => {
                          const updated = [...content.accreditations.paragraph];
                          updated[idx] = { ...updated[idx], weight: e.target.value as any };
                          setContent(prev => ({
                            ...prev,
                            accreditations: { ...prev.accreditations, paragraph: updated }
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
                    <button
                      onClick={() => removeAccreditationParagraphSegment(idx)}
                      className="px-3 py-2 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addAccreditationParagraphSegment}
                className="mt-2 px-4 py-2 border font-medium hover:bg-gray-50"
              >
                + Add Text Segment
              </button>
            </div>
                 
             

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium">Logos</label>
                  <button
                    onClick={addLogo}
                    className="px-3 py-1 border text-sm hover:bg-gray-50"
                  >
                    + Add Logo
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {content.accreditations.logos.map((logoUrl, idx) => (
                    <div key={idx} className="border p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">Logo #{idx + 1}</span>
                        <button
                          onClick={() => removeLogo(idx)}
                          className="px-2 py-1 border border-red-500 text-red-500 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files?.[0]) return;
                          setUploading(true);
                          try {
                            const result = await uploadAsset(
                              e.target.files[0],
                              "about/logos",
                              (p) => setUploadProgress(prev => ({ ...prev, [`logo_${idx}`]: p })),
                              logoUrl,
                              content.accreditations.logoFileIds[idx]
                            );
                            updateLogo(idx, result.url, result.fileId);
                          } catch (err) {
                            setErrorMessage("Logo upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => { 
                              const n = { ...prev }; 
                              delete n[`logo_${idx}`]; 
                              return n; 
                            });
                          }
                        }}
                        className="hidden"
                        id={`logo-${idx}`}
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
                              "about/logos",
                              (p) => setUploadProgress(prev => ({ ...prev, [`logo_${idx}`]: p })),
                              logoUrl,
                              content.accreditations.logoFileIds[idx]
                            );
                            updateLogo(idx, result.url, result.fileId);
                          } catch (err) {
                            setErrorMessage("Logo upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => { 
                              const n = { ...prev }; 
                              delete n[`logo_${idx}`]; 
                              return n; 
                            });
                          }
                        }}
                      >
                        <label
                          htmlFor={`logo-${idx}`}
                          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed cursor-pointer hover:bg-gray-50 text-sm"
                        >
                          Click or drag logo here
                        </label>
                      </div>
                      
                      {uploadProgress[`logo_${idx}`] !== undefined && (
                        <div className="mt-2">
                          <div className="h-1 w-full bg-gray-200">
                            <div
                              className="h-1 bg-[#004265] transition-all"
                              style={{ width: `${uploadProgress[`logo_${idx}`]}%` }}
                            />
                          </div>
                          <p className="text-xs mt-1">{uploadProgress[`logo_${idx}`]}%</p>
                        </div>
                      )}
                      {logoUrl && (
                        <div className="mt-3">
                          <img src={logoUrl} alt={`Logo ${idx + 1}`} className="max-h-16 border object-contain" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Impact Stats */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-medium font-sans!">Impact Statistics</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Background Color Class</label>
                <input
                  type="text"
                  value={content.impactStats.bgColor}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    impactStats: { ...prev.impactStats, bgColor: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Text Color</label>
                <input
                  type="text"
                  value={content.impactStats.textColor}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    impactStats: { ...prev.impactStats, textColor: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">People Impacted</label>
                  <input
                    type="number"
                    value={content.impactStats.people}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      impactStats: { ...prev.impactStats, people: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Villages</label>
                  <input
                    type="number"
                    value={content.impactStats.villages}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      impactStats: { ...prev.impactStats, villages: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Programs</label>
                  <input
                    type="number"
                    value={content.impactStats.programs}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      impactStats: { ...prev.impactStats, programs: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Team */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Team Section</h2>
                <button
                  onClick={addTeamMember}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Team Member
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Heading</label>
                <input
                  type="text"
                  value={content.team.heading}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    team: { ...prev.team, heading: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Paragraph</label>
                <textarea
                  value={content.team.paragraph}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    team: { ...prev.team, paragraph: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                  rows={3}
                />
              </div>

              {content.team.teamMembers.map((member, idx) => (
                <div key={idx} className="border p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold">Team Member #{idx + 1}</h3>
                    <button
                      onClick={() => removeTeamMember(idx)}
                      className="px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateTeamMember(idx, "name", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Role</label>
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => updateTeamMember(idx, "role", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files?.[0]) return;
                          setUploading(true);
                          try {
                            const result = await uploadAsset(
                              e.target.files[0],
                              "about/team",
                              (p) => setUploadProgress(prev => ({ ...prev, [`team_${idx}`]: p })),
                              member.image,
                              member.imageFileId
                            );
                            updateTeamMember(idx, "imageFileId", result.fileId);
                            updateTeamMember(idx, "image", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`team_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                        className="hidden"
                        id={`team-image-${idx}`}
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
                              "about/team",
                              (p) => setUploadProgress(prev => ({ ...prev, [`team_${idx}`]: p })),
                              member.image,
                              member.imageFileId
                            );
                            updateTeamMember(idx, "imageFileId", result.fileId);
                            updateTeamMember(idx, "image", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`team_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                      >
                        <label
                          htmlFor={`team-image-${idx}`}
                          className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                        >
                          Click or drag image here
                        </label>
                      </div>
                      
                      {uploadProgress[`team_${idx}`] !== undefined && (
                        <div className="mt-2">
                          <div className="h-2 w-full bg-gray-200">
                            <div
                              className="h-2 bg-[#004265] transition-all"
                              style={{ width: `${uploadProgress[`team_${idx}`]}%` }}
                            />
                          </div>
                          <p className="text-xs mt-1">Uploading… {uploadProgress[`team_${idx}`]}%</p>
                        </div>
                      )}
                      {member.image && (
                        <div className="mt-4">
                          <img src={member.image} alt={member.name} className="max-h-24 border" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Volunteers */}
          {activeTab === "volunteers" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Volunteers Section</h2>
                <button
                  onClick={addVolunteer}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Volunteer
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Heading</label>
                <input
                  type="text"
                  value={content.volunteers.heading}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    volunteers: { ...prev.volunteers, heading: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              {content.volunteers.volunteers.map((volunteer, idx) => (
                <div key={idx} className="border p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold">Volunteer #{idx + 1}</h3>
                    <button
                      onClick={() => removeVolunteer(idx)}
                      className="px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={volunteer.name}
                        onChange={(e) => updateVolunteer(idx, "name", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Role</label>
                      <input
                        type="text"
                        value={volunteer.role}
                        onChange={(e) => updateVolunteer(idx, "role", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={volunteer.description}
                        onChange={(e) => updateVolunteer(idx, "description", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">LinkedIn URL (optional)</label>
                      <input
                        type="text"
                        value={volunteer.linkedin || ""}
                        onChange={(e) => updateVolunteer(idx, "linkedin", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Background Color Class</label>
                      <input
                        type="text"
                        value={volunteer.bgColor}
                        onChange={(e) => updateVolunteer(idx, "bgColor", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files?.[0]) return;
                          setUploading(true);
                          try {
                            const result = await uploadAsset(
                              e.target.files[0],
                              "about/volunteers",
                              (p) => setUploadProgress(prev => ({ ...prev, [`volunteer_${idx}`]: p })),
                              volunteer.image,
                              volunteer.imageFileId
                            );
                            updateVolunteer(idx, "imageFileId", result.fileId);
                            updateVolunteer(idx, "image", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`volunteer_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                        className="hidden"
                        id={`volunteer-image-${idx}`}
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
                              "about/volunteers",
                              (p) => setUploadProgress(prev => ({ ...prev, [`volunteer_${idx}`]: p })),
                              volunteer.image,
                              volunteer.imageFileId
                            );
                            updateVolunteer(idx, "imageFileId", result.fileId);
                            updateVolunteer(idx, "image", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`volunteer_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                      >
                        <label
                          htmlFor={`volunteer-image-${idx}`}
                          className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                        >
                          Click or drag image here
                        </label>
                      </div>
                      
                      {uploadProgress[`volunteer_${idx}`] !== undefined && (
                        <div className="mt-2">
                          <div className="h-2 w-full bg-gray-200">
                            <div
                              className="h-2 bg-[#004265] transition-all"
                              style={{ width: `${uploadProgress[`volunteer_${idx}`]}%` }}
                            />
                          </div>
                          <p className="text-xs mt-1">Uploading… {uploadProgress[`volunteer_${idx}`]}%</p>
                        </div>
                      )}
                      {volunteer.image && (
                        <div className="mt-4">
                          <img src={volunteer.image} alt={volunteer.name} className="max-h-24 border" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* President Message */}
          {activeTab === "president" && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-medium font-sans!">President Message</h2>
              
              <div className="border p-5">
                <h3 className="text-lg font-bold mb-4">President Image</h3>
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
                          "about/president",
                          (p) => setUploadProgress(prev => ({ ...prev, president_image: p })),
                          content.presidentMessage.image,
                          content.presidentMessage.imageFileId
                        );
                        setContent(prev => ({
                          ...prev,
                          presidentMessage: {
                            ...prev.presidentMessage,
                            image: result.url,
                            imageFileId: result.fileId
                          }
                        }));
                      } catch (err) {
                        setErrorMessage("President image upload failed");
                      } finally {
                        setUploading(false);
                        setUploadProgress(prev => {
                          const newPrev = { ...prev };
                          delete newPrev.president_image;
                          return newPrev;
                        });
                      }
                    }}
                    className="hidden"
                    id="president-image"
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
                          "about/president",
                          (p) => setUploadProgress(prev => ({ ...prev, president_image: p })),
                          content.presidentMessage.image,
                          content.presidentMessage.imageFileId
                        );
                        setContent(prev => ({
                          ...prev,
                          presidentMessage: {
                            ...prev.presidentMessage,
                            image: result.url,
                            imageFileId: result.fileId
                          }
                        }));
                      } catch (err) {
                        setErrorMessage("President image upload failed");
                      } finally {
                        setUploading(false);
                        setUploadProgress(prev => {
                          const newPrev = { ...prev };
                          delete newPrev.president_image;
                          return newPrev;
                        });
                      }
                    }}
                  >
                    <label
                      htmlFor="president-image"
                      className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                    >
                      Click or drag president image here
                    </label>
                  </div>
                  
                  {uploadProgress.president_image !== undefined && (
                    <div className="mt-2">
                      <div className="h-2 w-full bg-gray-200">
                        <div
                          className="h-2 bg-[#004265] transition-all"
                          style={{ width: `${uploadProgress.president_image}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1">Uploading… {uploadProgress.president_image}%</p>
                    </div>
                  )}
                  {content.presidentMessage.image && (
                    <div className="mt-4">
                      <img 
                        src={content.presidentMessage.image} 
                        alt="President" 
                        className="max-h-48 border object-cover" 
                      />
                      <button
                        onClick={() => {
                          setContent(prev => ({
                            ...prev,
                            presidentMessage: {
                              ...prev.presidentMessage,
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
                  value={content.presidentMessage.imageAlt}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    presidentMessage: { ...prev.presidentMessage, imageAlt: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={content.presidentMessage.title}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    presidentMessage: { ...prev.presidentMessage, title: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Paragraphs</label>
                {content.presidentMessage.paragraphs.map((paragraph, idx) => (
                  <div key={idx} className="mb-3 p-3 border rounded">
                    <textarea
                      value={paragraph}
                      onChange={(e) => updatePresidentParagraph(idx, e.target.value)}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                      rows={3}
                    />
                    <button
                      onClick={() => removePresidentParagraph(idx)}
                      className="mt-2 px-3 py-1 border border-red-500 text-red-500 text-sm"
                    >
                      Remove Paragraph
                    </button>
                  </div>
                ))}
                <button
                  onClick={addPresidentParagraph}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Paragraph
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Author Name</label>
                <input
                  type="text"
                  value={content.presidentMessage.authorName}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    presidentMessage: { ...prev.presidentMessage, authorName: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Author Title</label>
                <input
                  type="text"
                  value={content.presidentMessage.authorTitle}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    presidentMessage: { ...prev.presidentMessage, authorTitle: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
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