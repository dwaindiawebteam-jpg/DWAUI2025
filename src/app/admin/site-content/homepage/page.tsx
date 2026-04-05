"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import { extractAssetUrlsFromHome } from "@/lib/extractAssetUrls";
import { compressImageClient } from "@/lib/compressImage";
import FloatingSaveBar from "@/components/editor/FloatingSaveBar";

// Types for the new homepage content
interface TextSegment {
  text: string;
  weight?: "normal" | "bold" | "light" | "medium" | "semibold";
  color?: string;
}

interface ProgramItem {
  id: number;
  title: string;
  description: string;
  image: string;
  imageFileId: string;
  
}

interface TestimonialItem {
  name: string;
  title: string;
  text: string;
  splatterImage: string;
  splatterimageFileId: string;
}

interface FeaturedProject {
  title: string;
  content: TextSegment[];
  image: string; // Add this optional field
  imageFileId: string;
}

interface RightNumber {
  label: string;
  value: string;
}

interface BoardMember {
  name: string;
  role: string;
  image: string;
  imageFileId: string;
}

interface WhyTrustUsContent {
  title: string;
  content: TextSegment[];
  bgColor: string;
}

interface HomeContent {
  heroSection: {
    content: TextSegment[];
    image?: string;        // Add this
    imageFileId?: string; 
  };
  dualContentBlock: {
    left: {
      title: string;
      titleColor: string;
      bgColor: string;
      content: TextSegment[];  // Changed from TextSegment[][]
    };
    right: {
      title: string;
      titleColor: string;
      bgColor: string;
      content: TextSegment[];  // Changed from TextSegment[][]
    };
  };
  programs: {
    title: string;
    items: ProgramItem[];
  };
  impactStats: {
    bgColor: string;
    textColor: string;
    people: number;
    villages: number;
    programs: number;
  };
  testimonials: TestimonialItem[];
  featuredProjects: {
    leftProjects: FeaturedProject[];
    rightNumbers: RightNumber[];
  };
  benevityBoard: {
    benevityTitle: string;
    benevityText: string;
    splatterImages: string[];
    splatterImageFileIds: string[];
    boardTitle: string;
    boardText: string;
    boardMembers: BoardMember[];
  };
  whyTrustUs: WhyTrustUsContent;
  partners: {
    title: string;
    partners: string[];
  };
}

function normalizeTag(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export default function AdminHomePage() {
  const { user, role, authReady } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const [originalContent, setOriginalContent] = useState<HomeContent | null>(null);
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<Array<{ 
    url: string; 
    fileId: string; 
    oldUrl?: string;
    oldFileId?: string;  // Add this
  }>>([]);
    
  const [activeTab, setActiveTab] = useState("hero");

  const [content, setContent] = useState<HomeContent>({
     heroSection: {
    content: [
      { text: "For the past 32 years", weight: "bold", color: "#004265" },
      { text: ", our organization has been working tirelessly to uplift Dalit communities and rural villages, striving to break cycles of poverty, inequality, and discrimination. With a deep commitment to social justice and empowerment, we have focused on education, livelihood opportunities, women's empowerment, and community development. Our journey has been one of resilience and hope— ensuring that the most marginalized have access to dignity, equal opportunities, and a", weight: "normal" },
      { text: " better future", weight: "bold", color: "#004265" },
      { text: ".", weight: "normal" },
    ],
    image: "/images/homepage/HomepageChildrenImage.jpg",  // Add this
    imageFileId: "",  // Add this
  },
    dualContentBlock: {
    left: {
      title: "Goals",
      titleColor: "#FFFFFF",
      bgColor: "bg-navy-blue",
      content: [
        { text: "End poverty & discrimination 🚫", weight: "normal", color: "#FFFFFF" },
        { text: "Equal learning for every child 👧👦", weight: "normal", color: "#FFFFFF" },
        { text: "Economic independence for families 💰", weight: "normal", color: "#FFFFFF" },
        { text: "Strong, healthy communities 🌱", weight: "normal", color: "#FFFFFF" },
        { text: "Self-reliant rural villages 🌾", weight: "normal", color: "#FFFFFF" },
        { text: "Inclusive growth & participation 🌍", weight: "normal", color: "#FFFFFF" },
        { text: "Respect and empowerment for Dalits 🌟", weight: "normal", color: "#FFFFFF" },
      ],
    },
    right: {
      title: "Objectives",
      titleColor: "#000000",
      bgColor: "bg-blue/50",
      content: [
        { text: "Promote equality & justice ⚖️", weight: "normal", color: "#000000" },
        { text: "Quality education for children 📚", weight: "normal", color: "#000000" },
        { text: "Women's empowerment & livelihoods 👩‍👩‍👧", weight: "normal", color: "#000000" },
        { text: "Better health & nutrition 🏥", weight: "normal", color: "#000000" },
        { text: "Sustainable livelihoods & skills 🛠️", weight: "normal", color: "#000000" },
        { text: "Community leadership 🤝", weight: "normal", color: "#000000" },
        { text: "Rights & dignity advocacy ✊", weight: "normal", color: "#000000" },
      ],
    },
  },
    programs: {
      title: "Our Programs",
      items: [
        {
          id: 1,
          title: "NO POVERTY",
          description: "Livelihoods, micro-credit, and economic empowerment for Dalit and rural families",
          image: "/images/homepage/OurPrograms/No Poverty.jpg",
          imageFileId: "",
        },
        {
          id: 2,
          title: "ZERO HUNGER",
          description: "Nutrition support, food security, and sustainable farming practices",
          image: "/images/homepage/OurPrograms/Zero Hunger.jpg",
          imageFileId: "",
        },
        {
          id: 3,
          title: "GOOD HEALTH AND WELL-BEING",
          description: "Healthcare, sanitation, elderly care, and child well-being",
          image: "/images/homepage/OurPrograms/Good Health And Well Being.jpg",
          imageFileId: "",
        },
        {
          id: 4,
          title: "QUALITY EDUCATION",
          description: "Access to education for rural children & marginalized groups",
          image: "/images/homepage/OurPrograms/Quality Education.jpg",
          imageFileId: "",
        },
        {
          id: 5,
          title: "GENDER EQUALITY",
          description: "Women's empowerment, self-help groups, and financial inclusion",
          image: "/images/homepage/OurPrograms/Gender Equality.jpg",
          imageFileId: "",
        },
        {
          id: 6,
          title: "CLEAN WATER AND SANITATION",
          description: "Promoting hygiene, sanitation, and access to safe drinking water",
          image: "/images/homepage/OurPrograms/Clean Water And Sanitation.jpg",
          imageFileId: "",
        }
      ],
    },
    impactStats: {
      bgColor: "bg-blue/50",
      textColor: "#004265",
      people: 5000,
      villages: 140,
      programs: 30,
    },
    testimonials: [
      {
        name: "John Romnes",
        title: "CEO – Minnesota Elevators Inc., USA",
        text: "Supporting the sheep rearing project with Dalit Welfare Association has been truly rewarding. The impact on rural families is visible, and I'm very happy with the results achieved.",
        splatterImage: "/images/SplatterImages/orange splatter.png",
        splatterimageFileId: "",
      },
      {
        name: "Gerardo Betancourt",
        title: "Executive Team uch-arqsj., USA",
        text: "I deeply appreciate the transparency and timely reports provided. Their professionalism and commitment gave us confidence that our support is making a real difference on the ground.",
        splatterImage: "/images/SplatterImages/purple splatter.png",
        splatterimageFileId: "",
      },
      {
        name: "Indira Oskvarek",
        title: "Secretary - Global Compassion INC., USA",
        text: "The dairy project we supported delivered outstanding results. We were so impressed with their project management that we are now considering funding the second phase as well.",
        splatterImage: "/images/SplatterImages/red splatter.png",
        splatterimageFileId: "",
      }
    ],
    featuredProjects: {
      leftProjects: [
        {
          title: "Digital Education Project",
          content: [
            { text: "Bridging the digital divide for rural Dalit children by providing access to technology, e-learning resources, and training, ensuring equal education opportunities and ", weight: "normal" },
            { text: "brighter futures", weight: "bold" },
            { text: ".", weight: "normal" },
          ],
          image:"",
          imageFileId: "",
        },
        {
          title: "Women Entrepreneurship Project",
          content: [
            { text: "Empowering rural women through micro-credit, skill-building, and enterprise support in sheep rearing and small businesses, fostering financial independence and ", weight: "normal" },
            { text: "community leadership", weight: "bold" },
            { text: ".", weight: "normal" },
          ],
          image:"",
          imageFileId: "",
        },
      ],
      rightNumbers: [
        { label: "1. Registration Number:", value: "384/1993" },
        { label: "2. FCRA Number:", value: "010270166" },
        { label: "3. Guide Star:", value: "9683" },
        { label: "4. NGO Darpan:", value: "AP/2021/0276162" },
        { label: "5. TAX Exemption: ", value: "AAKFD2353BE20214" },
      ]
    },
    benevityBoard: {
      benevityTitle: "Benevity & Goodstack",
      benevityText: "Donate today through Benevity or Goodstack—your contribution directly transforms lives of children in our orphanage and elders in our old age home, creating care, security, and a brighter tomorrow.",
      splatterImages: [
        "/images/SplatterImages/red splatter.png",
        "/images/SplatterImages/purple splatter.png", 
        "/images/SplatterImages/orange splatter.png",
        "/images/SplatterImages/green splatter.png"
      ],
      splatterImageFileIds: ["", "", "", ""],
      boardTitle: "Board Members",
      boardText: "Our board comprises passionate leaders with diverse expertise in social development, finance, and community service. They guide our vision with integrity, accountability, and a deep commitment to Dalit empowerment.",
      boardMembers: [
        {
          name: "S. Samuel",
          role: "President",
          image: "/images/SplatterImages/red splatter.png",
          imageFileId: "",
        },
        {
          name: "J. Nirmala",
          role: "V.President",
          image: "/images/SplatterImages/purple splatter.png",
          imageFileId: "",
        },
        {
          name: "B. Lakshmi",
          role: "Secretary",
          image: "/images/SplatterImages/orange splatter.png",
          imageFileId: "",
        },
        {
          name: "S. Sarojamma",
          role: "Treasurer",
          image: "/images/SplatterImages/green splatter.png",
          imageFileId: "",
        }
      ]
    },
    whyTrustUs: {
      title: "Why Trust Us",
      content: [
        { text: "We ensure complete transparency and accountability in every project. From the very start, our team coordinates closely with donors, providing ", weight: "normal" },
        { text: "monthly newsletters, digital reports, and real-time updates", weight: "bold" },
        { text: " through trusted tools like Salesforce. With clear communication, measurable outcomes, and dedicated support, donors can be confident their contributions are making a lasting impact.", weight: "normal" },
      ],
      bgColor: "#9FDFFC"
    },
    partners: {
      title: "Tech Partners",
      partners: [
        "Google", "Microsoft", "Salesforce", "Slack", "Canva", 
        "Github", "BOX", "Linktree", "NewRelic", "ChatBot"
      ]
    }
  });

  useEffect(() => {
    async function loadContent() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ref = doc(db, "siteContent", "home");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const loaded: HomeContent = {
            heroSection: data.heroSection || content.heroSection,
            dualContentBlock: data.dualContentBlock || content.dualContentBlock,
            programs: data.programs || content.programs,
            impactStats: data.impactStats || content.impactStats,
            testimonials: data.testimonials || content.testimonials,
            featuredProjects: data.featuredProjects || content.featuredProjects,
            benevityBoard: data.benevityBoard || content.benevityBoard,
            whyTrustUs: data.whyTrustUs || content.whyTrustUs,
            partners: data.partners || content.partners,
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
        
        // Store both oldUrl and oldFileId
        setPendingAssets(prev => [...prev, { 
          url: res.url, 
          fileId: res.fileId, 
          oldUrl: oldUrl,
          oldFileId: oldFileId  // Add this line
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

  function validateHomeContent(content: HomeContent): string | null {
    // Validate hero section
    if (!isNonEmptyArray(content.heroSection.content)) {
      return "Hero section must have content.";
    }

    // Validate programs
    if (!isNonEmptyArray(content.programs.items)) {
      return "Please add at least one program.";
    }

    for (let i = 0; i < content.programs.items.length; i++) {
      const p = content.programs.items[i];
      if (!isNonEmptyString(p.title) || !isNonEmptyString(p.description) || !isNonEmptyString(p.image)) {
        return `Program #${i + 1} has empty fields.`;
      }
    }

    // Validate testimonials
    for (let i = 0; i < content.testimonials.length; i++) {
      const t = content.testimonials[i];
      if (!isNonEmptyString(t.name) || !isNonEmptyString(t.text)) {
        return `Testimonial #${i + 1} has empty fields.`;
      }
    }

    return null;
  }

  // Helper function to find undefined values
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
    // Check for undefined values before saving
    const undefinedPaths = findUndefinedValues(content);
    if (undefinedPaths.length > 0) {
      setErrorMessage(`Cannot save: Found undefined values at: ${undefinedPaths.join(", ")}`);
      return;
    }
    
    if (!user) {
      setErrorMessage("Please log in to save changes.");
      return;
    }

    const validationError = validateHomeContent(content);
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

      const ref = doc(db, "siteContent", "home");
      let finalContent = content;

      
      if (pendingAssets.length) {
        // Filter assets that are actually used in content
        const assetsToPromote = pendingAssets.filter(asset => {
          const isUsed = extractAssetUrlsFromHome(finalContent as any).includes(asset.url);
          return isUsed;
        });

        
        if (assetsToPromote.length) {
          
          // Send the full asset objects with fileId, url, oldUrl, oldFileId
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

          // Update all references in finalContent
          
          // Hero section
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
          
          // Programs
          finalContent = {
            ...finalContent,
            programs: {
              ...finalContent.programs,
              items: finalContent.programs.items.map(p => {
                if (p.image && replacements[p.image]) {
                  return {
                    ...p,
                    image: replacements[p.image].url,
                    imageFileId: replacements[p.image].fileId,
                  };
                }
                return p;
              }),
            }
          };
          
          // Testimonials
          finalContent = {
            ...finalContent,
            testimonials: finalContent.testimonials.map(t => {
              if (t.splatterImage && replacements[t.splatterImage]) {
                return {
                  ...t,
                  splatterImage: replacements[t.splatterImage].url,
                  splatterimageFileId: replacements[t.splatterImage].fileId,
                };
              }
              return t;
            }),
          };
          
          // Featured Projects
          finalContent = {
            ...finalContent,
            featuredProjects: {
              ...finalContent.featuredProjects,
              leftProjects: finalContent.featuredProjects.leftProjects.map(p => {
                if (p.image && replacements[p.image]) {
                  return {
                    ...p,
                    image: replacements[p.image].url,
                    imageFileId: replacements[p.image].fileId,
                  };
                }
                return p;
              }),
            },
          };
          
          // Benevity Board splatter images
          const updatedSplatterImages = finalContent.benevityBoard.splatterImages.map(img => {
            if (replacements[img]) {
              return replacements[img].url;
            }
            return img;
          });
          
          const updatedSplatterImageFileIds = finalContent.benevityBoard.splatterImages.map((img, i) => {
            if (replacements[img]) {
              return replacements[img].fileId;
            }
            return finalContent.benevityBoard.splatterImageFileIds[i];
          });
          
          // Benevity Board members
          finalContent = {
            ...finalContent,
            benevityBoard: {
              ...finalContent.benevityBoard,
              splatterImages: updatedSplatterImages,
              splatterImageFileIds: updatedSplatterImageFileIds,
              boardMembers: finalContent.benevityBoard.boardMembers.map(m => {
                if (m.image && replacements[m.image]) {
                  return {
                    ...m,
                    image: replacements[m.image].url,
                    imageFileId: replacements[m.image].fileId,
                  };
                }
                return m;
              }),
            },
          };
          
          setContent(finalContent);
        } else {
          // No assets to promote
        }
        setPendingAssets([]);
      } else {
        // No pending assets to process
      }

      // Rest of your save logic remains the same...
      const finalUndefinedPaths = findUndefinedValues(finalContent);
      if (finalUndefinedPaths.length > 0) {
        throw new Error(`Cannot save to Firestore: undefined values at ${finalUndefinedPaths.join(", ")}`);
      }

      const dataToSave = {
        heroSection: {
          content: finalContent.heroSection.content,
          image: finalContent.heroSection.image || null,
          imageFileId: finalContent.heroSection.imageFileId || null,
        },
        dualContentBlock: finalContent.dualContentBlock,
        programs: finalContent.programs,
        impactStats: finalContent.impactStats,
        testimonials: finalContent.testimonials,
        featuredProjects: finalContent.featuredProjects,
        benevityBoard: finalContent.benevityBoard,
        whyTrustUs: finalContent.whyTrustUs,
        partners: finalContent.partners,
        updatedAt: new Date(),
      };
      
      await setDoc(ref, dataToSave);

      if (originalContent) {
        const before = new Set(extractAssetUrlsFromHome(originalContent as any));
        const after = new Set(extractAssetUrlsFromHome(finalContent as any));
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

      setSuccessMessage("Home page content saved successfully!");
      setOriginalContent(structuredClone(finalContent));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  

  // Program management
 const addProgram = () => {
  const newId = Math.max(...content.programs.items.map(p => p.id), 0) + 1;
  setContent(prev => ({
    ...prev,
    programs: {
      ...prev.programs,
      items: [...prev.programs.items, {
        id: newId,
        title: "",
        description: "",
        image: "",
        imageFileId: "",  // ← ADD
      }]
    }
  }));
};
  const removeProgram = (index: number) => {
    setContent(prev => ({
      ...prev,
      programs: {
        ...prev.programs,
        items: prev.programs.items.filter((_, i) => i !== index)
      }
    }));
  };

  const updateProgram = (index: number, field: keyof ProgramItem, value: any) => {
    setContent(prev => {
      const updated = [...prev.programs.items];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        programs: { ...prev.programs, items: updated }
      };
    });
  };

  // Testimonial management
  const addTestimonial = () => {
    setContent(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, {
        name: "",
        title: "",
        text: "",
        splatterImage: "",
        splatterimageFileId: "",
      }]
    }));
  };

  const removeTestimonial = (index: number) => {
    setContent(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }));
  };

  const updateTestimonial = (index: number, field: keyof TestimonialItem, value: string) => {
    setContent(prev => {
      const updated = [...prev.testimonials];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, testimonials: updated };
    });
  };

  // Board member management
  const addBoardMember = () => {
    setContent(prev => ({
      ...prev,
      benevityBoard: {
        ...prev.benevityBoard,
        boardMembers: [...prev.benevityBoard.boardMembers, {
          name: "",
          role: "",
          image: "",
          imageFileId: "",
        }]
      }
    }));
  };

  const removeBoardMember = (index: number) => {
    setContent(prev => ({
      ...prev,
      benevityBoard: {
        ...prev.benevityBoard,
        boardMembers: prev.benevityBoard.boardMembers.filter((_, i) => i !== index)
      }
    }));
  };

  const updateBoardMember = (index: number, field: keyof BoardMember, value: string) => {
    setContent(prev => {
      const updated = [...prev.benevityBoard.boardMembers];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        benevityBoard: { ...prev.benevityBoard, boardMembers: updated }
      };
    });
  };

  // Partner management
  const addPartner = () => {
    setContent(prev => ({
      ...prev,
      partners: {
        ...prev.partners,
        partners: [...prev.partners.partners, ""]
      }
    }));
  };

  const removePartner = (index: number) => {
    setContent(prev => ({
      ...prev,
      partners: {
        ...prev.partners,
        partners: prev.partners.partners.filter((_, i) => i !== index)
      }
    }));
  };

  const updatePartner = (index: number, value: string) => {
    setContent(prev => {
      const updated = [...prev.partners.partners];
      updated[index] = value;
      return {
        ...prev,
        partners: { ...prev.partners, partners: updated }
      };
    });
  };

  // In the component, add these missing helper functions for splatterImages

    // Splatter Image management (add this after the board member functions)
    const addSplatterImage = () => {
      setContent(prev => ({
        ...prev,
        benevityBoard: {
          ...prev.benevityBoard,
          splatterImages: [...prev.benevityBoard.splatterImages, ""],
          splatterImageFileIds: [...(prev.benevityBoard.splatterImageFileIds || []), ""],  // ← ADD
        }
      }));
    };

    const removeSplatterImage = (index: number) => {
  setContent(prev => ({
    ...prev,
    benevityBoard: {
      ...prev.benevityBoard,
      splatterImages: prev.benevityBoard.splatterImages.filter((_, i) => i !== index),
      splatterImageFileIds: (prev.benevityBoard.splatterImageFileIds || []).filter((_, i) => i !== index),  // ← ADD
    }
  }));
};

    const updateSplatterImage = (index: number, url: string, fileId: string) => {
    setContent(prev => {
      const updatedUrls = [...prev.benevityBoard.splatterImages];
      const updatedIds = [...(prev.benevityBoard.splatterImageFileIds || [])];
      updatedUrls[index] = url;
      updatedIds[index] = fileId;
      return {
        ...prev,
        benevityBoard: {
          ...prev.benevityBoard,
          splatterImages: updatedUrls,
          splatterImageFileIds: updatedIds,
        }
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
    { id: "dual", label: "Goals & Objectives" },
    { id: "programs", label: "Programs" },
    { id: "stats", label: "Impact Stats" },
    { id: "testimonials", label: "Testimonials" },
    { id: "projects", label: "Featured Projects" },
    { id: "benevity", label: "Benevity & Board" },
    { id: "trust", label: "Why Trust Us" },
    { id: "partners", label: "Partners" },
  ];

  return (
    <div className="px-4 sm:px-6 py-12 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center font-sans!">
          Home Page Management
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

        {/* Tabs */}
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
          
         {/* Add Hero Image Upload */}
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
                      "home/hero",
                      (p) => setUploadProgress(prev => ({ ...prev, hero_image: p })),
                      content.heroSection.image,        // oldUrl
                      content.heroSection.imageFileId   // oldFileId
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
              
              {/* Drag and Drop Area */}
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
                      "home/hero",
                      (p) => setUploadProgress(prev => ({ ...prev, hero_image: p })),
                      content.heroSection.image,        // oldUrl
                      content.heroSection.imageFileId   // oldFileId
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
          
          {/* Hero Text Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Hero Text Content</label>
            <p className="text-sm text-gray-500 mb-2">Each segment can have different styling (bold, color, etc.)</p>
            {content.heroSection.content.map((segment, idx) => (
              <div key={idx} className="mb-4 p-4 border rounded">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Text</label>
                  <textarea
                    value={segment.text}
                    onChange={(e) => {
                      const updated = [...content.heroSection.content];
                      updated[idx] = { ...updated[idx], text: e.target.value };
                      setContent(prev => ({
                        ...prev,
                        heroSection: { ...prev.heroSection, content: updated }
                      }));
                    }}
                    className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Weight</label>
                    <select
                      value={segment.weight || "normal"}
                      onChange={(e) => {
                        const updated = [...content.heroSection.content];
                        updated[idx] = { ...updated[idx], weight: e.target.value as any };
                        setContent(prev => ({
                          ...prev,
                          heroSection: { ...prev.heroSection, content: updated }
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
                    <label className="block text-sm font-medium mb-1">Color (optional)</label>
                    <input
                      type="text"
                      value={segment.color || ""}
                      onChange={(e) => {
                        const updated = [...content.heroSection.content];
                        updated[idx] = { ...updated[idx], color: e.target.value };
                        setContent(prev => ({
                          ...prev,
                          heroSection: { ...prev.heroSection, content: updated }
                        }));
                      }}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      placeholder="#004265"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    const updated = content.heroSection.content.filter((_, i) => i !== idx);
                    setContent(prev => ({
                      ...prev,
                      heroSection: { ...prev.heroSection, content: updated }
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
                    content: [...prev.heroSection.content, { text: "", weight: "normal" }]
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

         
          {/* Goals & Objectives */}
        {activeTab === "dual" && (
        <div className="space-y-8">
            <h2 className="text-xl sm:text-2xl font-medium mb-6 font-sans!">Goals & Objectives</h2>
            
            {/* Left Column - Goals */}
            <div className="border p-5">
            <h3 className="text-lg font-bold mb-4">Goals (Left Column)</h3>
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
                placeholder="bg-navy-blue"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Goal Items</label>
                {content.dualContentBlock.left.content.map((item, idx) => (
                <div key={idx} className="mb-3 p-3 border rounded">
                    <textarea
                    value={item.text}
                    onChange={(e) => {
                        const updated = [...content.dualContentBlock.left.content];
                        updated[idx] = { ...item, text: e.target.value };
                        setContent(prev => ({
                        ...prev,
                        dualContentBlock: {
                            ...prev.dualContentBlock,
                            left: { ...prev.dualContentBlock.left, content: updated }
                        }
                        }));
                    }}
                    className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                    rows={2}
                    />
                    <div className="mt-2 flex gap-2">
                    <select
                        value={item.weight || "normal"}
                        onChange={(e) => {
                        const updated = [...content.dualContentBlock.left.content];
                        updated[idx] = { ...item, weight: e.target.value as any };
                        setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                            ...prev.dualContentBlock,
                            left: { ...prev.dualContentBlock.left, content: updated }
                            }
                        }));
                        }}
                        className="px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="light">Light</option>
                        <option value="medium">Medium</option>
                        <option value="semibold">Semibold</option>
                    </select>
                    <input
                        type="text"
                        value={item.color || ""}
                        onChange={(e) => {
                        const updated = [...content.dualContentBlock.left.content];
                        updated[idx] = { ...item, color: e.target.value };
                        setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                            ...prev.dualContentBlock,
                            left: { ...prev.dualContentBlock.left, content: updated }
                            }
                        }));
                        }}
                        className="px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        placeholder="Color (optional)"
                    />
                    </div>
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
                    className="mt-2 px-3 py-1 border border-red-500 text-red-500 text-sm"
                    >
                    Remove
                    </button>
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
                        content: [...prev.dualContentBlock.left.content, { text: "", weight: "normal", color: "#FFFFFF" }]
                        }
                    }
                    }));
                }}
                className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                + Add Goal
                </button>
            </div>
            </div>

            {/* Right Column - Objectives - similar changes */}
            <div className="border p-5">
            <h3 className="text-lg font-bold mb-4">Objectives (Right Column)</h3>
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
                placeholder="bg-blue/50"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Objective Items</label>
                {content.dualContentBlock.right.content.map((item, idx) => (
                <div key={idx} className="mb-3 p-3 border rounded">
                    <textarea
                    value={item.text}
                    onChange={(e) => {
                        const updated = [...content.dualContentBlock.right.content];
                        updated[idx] = { ...item, text: e.target.value };
                        setContent(prev => ({
                        ...prev,
                        dualContentBlock: {
                            ...prev.dualContentBlock,
                            right: { ...prev.dualContentBlock.right, content: updated }
                        }
                        }));
                    }}
                    className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                    rows={2}
                    />
                    <div className="mt-2 flex gap-2">
                    <select
                        value={item.weight || "normal"}
                        onChange={(e) => {
                        const updated = [...content.dualContentBlock.right.content];
                        updated[idx] = { ...item, weight: e.target.value as any };
                        setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                            ...prev.dualContentBlock,
                            right: { ...prev.dualContentBlock.right, content: updated }
                            }
                        }));
                        }}
                        className="px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="light">Light</option>
                        <option value="medium">Medium</option>
                        <option value="semibold">Semibold</option>
                    </select>
                    <input
                        type="text"
                        value={item.color || ""}
                        onChange={(e) => {
                        const updated = [...content.dualContentBlock.right.content];
                        updated[idx] = { ...item, color: e.target.value };
                        setContent(prev => ({
                            ...prev,
                            dualContentBlock: {
                            ...prev.dualContentBlock,
                            right: { ...prev.dualContentBlock.right, content: updated }
                            }
                        }));
                        }}
                        className="px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        placeholder="Color (optional)"
                    />
                    </div>
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
                    className="mt-2 px-3 py-1 border border-red-500 text-red-500 text-sm"
                    >
                    Remove
                    </button>
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
                        content: [...prev.dualContentBlock.right.content, { text: "", weight: "normal", color: "#000000" }]
                        }
                    }
                    }));
                }}
                className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                + Add Objective
                </button>
            </div>
            </div>
        </div>
        )}

          {/* Programs Section */}
          {activeTab === "programs" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Programs</h2>
                <button
                  onClick={addProgram}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Program
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.programs.title}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    programs: { ...prev.programs, title: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 mb-6"
                />
              </div>

              {content.programs.items.map((program, idx) => (
                <div key={program.id} className="border p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold">Program #{idx + 1}</h3>
                    <button
                      onClick={() => removeProgram(idx)}
                      className="px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={program.title}
                        onChange={(e) => updateProgram(idx, "title", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={program.description}
                        onChange={(e) => updateProgram(idx, "description", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium mb-2">Image</label>
                    
                    {/* Single file input - remove the duplicate */}
                    <input
                        type="file"
                        accept="image/*"
                       onChange={async (e) => {
                        if (!e.target.files?.[0]) return;
                        setUploading(true);
                        try {
                          const result = await uploadAsset(
                            e.target.files[0],
                            "home/programs",
                            (p) => setUploadProgress(prev => ({ ...prev, [`program_${idx}`]: p })),
                            program.image,       // oldUrl
                            program.imageFileId  // oldFileId ← was missing/broken
                          );
                          updateProgram(idx, "image", result.url);
                          updateProgram(idx, "imageFileId", result.fileId); // ← ADD
                        } catch (err) {
                          setErrorMessage("Image upload failed");
                        } finally {
                          setUploading(false);
                          setUploadProgress(prev => { const n = { ...prev }; delete n[`program_${idx}`]; return n; });
                        }
                      }}
                        className="hidden"
                        id={`program-image-${idx}`}
                    />
                    
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (!file || !file.type.startsWith("image/")) return;
                        
                        setUploading(true);
                        try {
                            const oldImageUrl = program.image;
                            const result = await uploadAsset(
                            file, 
                            "home/programs", 
                            (p) => {
                                setUploadProgress(prev => ({ ...prev, [`program_${idx}`]: p }));
                            },
                            oldImageUrl
                            );
                            updateProgram(idx, "image", result.url);
                        } catch (err) {
                            setErrorMessage("Image upload failed");
                        } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                            const newPrev = { ...prev };
                            delete newPrev[`program_${idx}`];
                            return newPrev;
                            });
                        }
                        }}
                    >
                        <label
                        htmlFor={`program-image-${idx}`}
                        className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                        >
                        Click or drag an image here
                        </label>
                    </div>
                    
                    {uploadProgress[`program_${idx}`] !== undefined && (
                        <div className="mt-2">
                        <div className="h-2 w-full bg-gray-200">
                            <div
                            className="h-2 bg-[#004265] transition-all"
                            style={{ width: `${uploadProgress[`program_${idx}`]}%` }}
                            />
                        </div>
                        <p className="text-xs mt-1">Uploading… {uploadProgress[`program_${idx}`]}%</p>
                        </div>
                    )}
                    {program.image && (
                        <div className="mt-4">
                        <img src={program.image} alt={program.title} className="max-h-32 border" />
                        </div>
                    )}
                    </div>
                    
                  </div>
                </div>
              ))}
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
                  placeholder="bg-blue/50"
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
                  placeholder="#004265"
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

         {/* Testimonials - FIXED DRAG AND DROP */}
{activeTab === "testimonials" && (
  <div className="space-y-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl sm:text-2xl font-medium font-sans!">Testimonials</h2>
      <button
        onClick={addTestimonial}
        className="px-4 py-2 border font-medium hover:bg-gray-50"
      >
        + Add Testimonial
      </button>
    </div>
    
    {content.testimonials.map((testimonial, idx) => (
      <div key={idx} className="border p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold">Testimonial #{idx + 1}</h3>
          <button
            onClick={() => removeTestimonial(idx)}
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
              value={testimonial.name}
              onChange={(e) => updateTestimonial(idx, "name", e.target.value)}
              className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Title/Role</label>
            <input
              type="text"
              value={testimonial.title}
              onChange={(e) => updateTestimonial(idx, "title", e.target.value)}
              className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Testimonial Text</label>
            <textarea
              value={testimonial.text}
              onChange={(e) => updateTestimonial(idx, "text", e.target.value)}
              className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Splatter Image</label>
            
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                if (!e.target.files?.[0]) return;
                setUploading(true);
                try {
                  const result = await uploadAsset(
                    e.target.files[0],
                    "home/testimonials",
                    (p) => setUploadProgress(prev => ({ ...prev, [`testimonial_${idx}`]: p })),
                    testimonial.splatterImage,
                    testimonial.splatterimageFileId
                  );
                  updateTestimonial(idx, "splatterImage", result.url);
                  updateTestimonial(idx, "splatterimageFileId", result.fileId);
                } catch (err) {
                  setErrorMessage("Image upload failed");
                } finally {
                  setUploading(false);
                  setUploadProgress(prev => { 
                    const n = { ...prev }; 
                    delete n[`testimonial_${idx}`]; 
                    return n; 
                  });
                }
              }}
              className="hidden"
              id={`testimonial-splatter-${idx}`}
            />
            
            {/* Drag and Drop Area - FIXED */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (!file || !file.type.startsWith("image/")) {
                  setErrorMessage("Please drop an image file");
                  return;
                }
                
                setUploading(true);
                try {
                  const result = await uploadAsset(
                    file,
                    "home/testimonials",
                    (p) => setUploadProgress(prev => ({ ...prev, [`testimonial_${idx}`]: p })),
                    testimonial.splatterImage,
                    testimonial.splatterimageFileId
                  );
                  updateTestimonial(idx, "splatterImage", result.url);
                  updateTestimonial(idx, "splatterimageFileId", result.fileId);
                } catch (err) {
                  setErrorMessage("Image upload failed");
                } finally {
                  setUploading(false);
                  setUploadProgress(prev => { 
                    const n = { ...prev }; 
                    delete n[`testimonial_${idx}`]; 
                    return n; 
                  });
                }
              }}
              className="cursor-pointer"
            >
              <label
                htmlFor={`testimonial-splatter-${idx}`}
                className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                style={{ cursor: "pointer" }}
              >
                Click or drag image here
              </label>
            </div>
            
            {uploadProgress[`testimonial_${idx}`] !== undefined && (
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200">
                  <div
                    className="h-2 bg-[#004265] transition-all"
                    style={{ width: `${uploadProgress[`testimonial_${idx}`]}%` }}
                  />
                </div>
                <p className="text-xs mt-1">Uploading… {uploadProgress[`testimonial_${idx}`]}%</p>
              </div>
            )}
            {testimonial.splatterImage && (
              <div className="mt-4">
                <img src={testimonial.splatterImage} alt="Splatter" className="max-h-24 border" />
                <button
                  onClick={() => {
                    updateTestimonial(idx, "splatterImage", "");
                    updateTestimonial(idx, "splatterimageFileId", "");
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
          {/* Featured Projects */}
          {activeTab === "projects" && (
            <div className="space-y-8">
              <h2 className="text-xl sm:text-2xl font-medium font-sans!">Featured Projects</h2>
              
             
            <div>
            <h3 className="text-lg font-bold mb-4">Left Column - Projects</h3>
            {content.featuredProjects.leftProjects.map((project, idx) => (
                <div key={idx} className="border p-5 mb-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Project Title</label>
                    <input
                    type="text"
                    value={project.title}
                    onChange={(e) => {
                        const updated = [...content.featuredProjects.leftProjects];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setContent(prev => ({
                        ...prev,
                        featuredProjects: { ...prev.featuredProjects, leftProjects: updated }
                        }));
                    }}
                    className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    />
                </div>
                
                {/* Optional: Add image field for projects */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Project Image (Optional)</label>
                 
                    <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      setUploading(true);
                      try {
                        const result = await uploadAsset(
                          e.target.files[0],
                          "home/projects",
                          (p) => setUploadProgress(prev => ({ ...prev, [`project_${idx}`]: p })),
                          project.image || "",       // oldUrl
                          project.imageFileId || ""  // oldFileId ← ADD
                        );
                        const updated = [...content.featuredProjects.leftProjects];
                        updated[idx] = { 
                          ...updated[idx], 
                          image: result.url || "",
                          imageFileId: result.fileId || "" // ← ADD
                        };
                        setContent(prev => ({
                          ...prev,
                          featuredProjects: { ...prev.featuredProjects, leftProjects: updated }
                        }));
                      } catch (err) {
                        setErrorMessage("Image upload failed");
                      } finally {
                        setUploading(false);
                        setUploadProgress(prev => { const n = { ...prev }; delete n[`project_${idx}`]; return n; });
                      }
                    }}
                    className="hidden"
                    id={`project-image-${idx}`}
                    />
                    <label
                    htmlFor={`project-image-${idx}`}
                    className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                    >
                    Click or drag image here
                    </label>
                    {uploadProgress[`project_${idx}`] !== undefined && (
                    <div className="mt-2">
                        <div className="h-2 w-full bg-gray-200">
                        <div
                            className="h-2 bg-[#004265] transition-all"
                            style={{ width: `${uploadProgress[`project_${idx}`]}%` }}
                        />
                        </div>
                        <p className="text-xs mt-1">Uploading… {uploadProgress[`project_${idx}`]}%</p>
                    </div>
                    )}
                    {(project as any).image && (
                    <div className="mt-4">
                        <img src={(project as any).image} alt={project.title} className="max-h-32 border" />
                    </div>
                    )}
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">Content Segments</label>
                    {project.content.map((segment, segIdx) => (
                    <div key={segIdx} className="mb-2">
                        <textarea
                        value={segment.text}
                        onChange={(e) => {
                            const updated = [...content.featuredProjects.leftProjects];
                            const updatedContent = [...updated[idx].content];
                            updatedContent[segIdx] = { ...updatedContent[segIdx], text: e.target.value };
                            updated[idx] = { ...updated[idx], content: updatedContent };
                            setContent(prev => ({
                            ...prev,
                            featuredProjects: { ...prev.featuredProjects, leftProjects: updated }
                            }));
                        }}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                        rows={2}
                        />
                        <select
                        value={segment.weight}
                        onChange={(e) => {
                            const updated = [...content.featuredProjects.leftProjects];
                            const updatedContent = [...updated[idx].content];
                            updatedContent[segIdx] = { ...updatedContent[segIdx], weight: e.target.value as any };
                            updated[idx] = { ...updated[idx], content: updatedContent };
                            setContent(prev => ({
                            ...prev,
                            featuredProjects: { ...prev.featuredProjects, leftProjects: updated }
                            }));
                        }}
                        className="mt-1 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        </select>
                    </div>
                    ))}
                    <button
                    onClick={() => {
                        const updated = [...content.featuredProjects.leftProjects];
                        updated[idx] = {
                        ...updated[idx],
                        content: [...updated[idx].content, { text: "", weight: "normal" }]
                        };
                        setContent(prev => ({
                        ...prev,
                        featuredProjects: { ...prev.featuredProjects, leftProjects: updated }
                        }));
                    }}
                    className="mt-2 px-3 py-1 border text-sm"
                    >
                    + Add Segment
                    </button>
                </div>
                </div>
            ))}
            </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Right Column - Registration Numbers</h3>
                {content.featuredProjects.rightNumbers.map((number, idx) => (
                  <div key={idx} className="border p-4 mb-3">
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">Label</label>
                      <input
                        type="text"
                        value={number.label}
                        onChange={(e) => {
                          const updated = [...content.featuredProjects.rightNumbers];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setContent(prev => ({
                            ...prev,
                            featuredProjects: { ...prev.featuredProjects, rightNumbers: updated }
                          }));
                        }}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Value</label>
                      <input
                        type="text"
                        value={number.value}
                        onChange={(e) => {
                          const updated = [...content.featuredProjects.rightNumbers];
                          updated[idx] = { ...updated[idx], value: e.target.value };
                          setContent(prev => ({
                            ...prev,
                            featuredProjects: { ...prev.featuredProjects, rightNumbers: updated }
                          }));
                        }}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const updated = content.featuredProjects.rightNumbers.filter((_, i) => i !== idx);
                        setContent(prev => ({
                          ...prev,
                          featuredProjects: { ...prev.featuredProjects, rightNumbers: updated }
                        }));
                      }}
                      className="mt-2 px-3 py-1 border border-red-500 text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setContent(prev => ({
                      ...prev,
                      featuredProjects: {
                        ...prev.featuredProjects,
                        rightNumbers: [...prev.featuredProjects.rightNumbers, { label: "", value: "" }]
                      }
                    }));
                  }}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Registration Number
                </button>
              </div>
            </div>
          )}

   {/* Benevity & Board */}
{activeTab === "benevity" && (
  <div className="space-y-8">
    <h2 className="text-xl sm:text-2xl font-medium font-sans!">Benevity & Board Section</h2>
    
    {/* Benevity Section */}
    <div className="border p-5">
      <h3 className="text-lg font-bold mb-4">Benevity Section</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={content.benevityBoard.benevityTitle}
          onChange={(e) => setContent(prev => ({
            ...prev,
            benevityBoard: { ...prev.benevityBoard, benevityTitle: e.target.value }
          }))}
          className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Text</label>
        <textarea
          value={content.benevityBoard.benevityText}
          onChange={(e) => setContent(prev => ({
            ...prev,
            benevityBoard: { ...prev.benevityBoard, benevityText: e.target.value }
          }))}
          className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
          rows={3}
        />
      </div>
      
      {/* Splatter Images Section - FIXED */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Splatter Images</label>
          <button
            onClick={addSplatterImage}
            className="px-3 py-1 border text-sm hover:bg-gray-50"
          >
            + Add Image
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {content.benevityBoard.splatterImages.map((imageUrl, idx) => (
            <div key={idx} className="border p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium">Image #{idx + 1}</span>
                <button
                  onClick={() => removeSplatterImage(idx)}
                  className="px-2 py-1 border border-red-500 text-red-500 text-xs"
                >
                  Remove
                </button>
              </div>
              
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  if (!e.target.files?.[0]) return;
                  setUploading(true);
                  try {
                    const oldFileId = content.benevityBoard.splatterImageFileIds?.[idx];
                    const result = await uploadAsset(
                      e.target.files[0],
                      "home/splatter",
                      (p) => setUploadProgress(prev => ({ ...prev, [`splatter_${idx}`]: p })),
                      imageUrl,
                      oldFileId
                    );
                    updateSplatterImage(idx, result.url, result.fileId);
                  } catch (err) {
                    setErrorMessage("Image upload failed");
                  } finally {
                    setUploading(false);
                    setUploadProgress(prev => { 
                      const n = { ...prev }; 
                      delete n[`splatter_${idx}`]; 
                      return n; 
                    });
                  }
                }}
                className="hidden"
                id={`splatter-image-${idx}`}
              />
              
              {/* Drag and Drop Area - FIXED */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (!file || !file.type.startsWith("image/")) {
                    setErrorMessage("Please drop an image file");
                    return;
                  }
                  
                  setUploading(true);
                  try {
                    const oldFileId = content.benevityBoard.splatterImageFileIds?.[idx];
                    const result = await uploadAsset(
                      file,
                      "home/splatter",
                      (p) => setUploadProgress(prev => ({ ...prev, [`splatter_${idx}`]: p })),
                      imageUrl,
                      oldFileId
                    );
                    updateSplatterImage(idx, result.url, result.fileId);
                  } catch (err) {
                    setErrorMessage("Image upload failed");
                  } finally {
                    setUploading(false);
                    setUploadProgress(prev => { 
                      const n = { ...prev }; 
                      delete n[`splatter_${idx}`]; 
                      return n; 
                    });
                  }
                }}
                className="cursor-pointer"
              >
                <label
                  htmlFor={`splatter-image-${idx}`}
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed cursor-pointer hover:bg-gray-50 text-sm"
                  style={{ cursor: "pointer" }}
                >
                  Click or drag image here
                </label>
              </div>
              
              {uploadProgress[`splatter_${idx}`] !== undefined && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-gray-200">
                    <div
                      className="h-1 bg-[#004265] transition-all"
                      style={{ width: `${uploadProgress[`splatter_${idx}`]}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1">{uploadProgress[`splatter_${idx}`]}%</p>
                </div>
              )}
              {imageUrl && (
                <div className="mt-3">
                  <img src={imageUrl} alt={`Splatter ${idx + 1}`} className="max-h-20 border" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Board Section */}
      <div className="border p-5 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Board Members</h3>
          <button
            onClick={addBoardMember}
            className="px-4 py-2 border font-medium hover:bg-gray-50"
          >
            + Add Board Member
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Board Title</label>
          <input
            type="text"
            value={content.benevityBoard.boardTitle}
            onChange={(e) => setContent(prev => ({
              ...prev,
              benevityBoard: { ...prev.benevityBoard, boardTitle: e.target.value }
            }))}
            className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Board Text</label>
          <textarea
            value={content.benevityBoard.boardText}
            onChange={(e) => setContent(prev => ({
              ...prev,
              benevityBoard: { ...prev.benevityBoard, boardText: e.target.value }
            }))}
            className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
            rows={3}
          />
        </div>
        
        {content.benevityBoard.boardMembers.map((member, idx) => (
          <div key={idx} className="border p-4 mb-3">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">Member #{idx + 1}</h4>
              <button
                onClick={() => removeBoardMember(idx)}
                className="px-3 py-1 border border-red-500 text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateBoardMember(idx, "name", e.target.value)}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => updateBoardMember(idx, "role", e.target.value)}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (!e.target.files?.[0]) return;
                    setUploading(true);
                    try {
                      const result = await uploadAsset(
                        e.target.files[0],
                        "home/board",
                        (p) => setUploadProgress(prev => ({ ...prev, [`board_${idx}`]: p })),
                        member.image,
                        member.imageFileId
                      );
                      updateBoardMember(idx, "imageFileId", result.fileId); 
                      updateBoardMember(idx, "image", result.url);
                    } catch (err) {
                      setErrorMessage("Image upload failed");
                    } finally {
                      setUploading(false);
                      setUploadProgress(prev => {
                        const newPrev = { ...prev };
                        delete newPrev[`board_${idx}`];
                        return newPrev;
                      });
                    }
                  }}
                  className="hidden"
                  id={`board-image-${idx}`}
                />
                
                {/* Drag and Drop Area for Board Member Images */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (!file || !file.type.startsWith("image/")) {
                      setErrorMessage("Please drop an image file");
                      return;
                    }
                    
                    setUploading(true);
                    try {
                      const result = await uploadAsset(
                        file,
                        "home/board",
                        (p) => setUploadProgress(prev => ({ ...prev, [`board_${idx}`]: p })),
                        member.image,
                        member.imageFileId
                      );
                      updateBoardMember(idx, "imageFileId", result.fileId);
                      updateBoardMember(idx, "image", result.url);
                    } catch (err) {
                      setErrorMessage("Image upload failed");
                    } finally {
                      setUploading(false);
                      setUploadProgress(prev => {
                        const newPrev = { ...prev };
                        delete newPrev[`board_${idx}`];
                        return newPrev;
                      });
                    }
                  }}
                >
                  <label
                    htmlFor={`board-image-${idx}`}
                    className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                  >
                    Click or drag image here
                  </label>
                </div>
                
                {uploadProgress[`board_${idx}`] !== undefined && (
                  <div className="mt-2">
                    <div className="h-2 w-full bg-gray-200">
                      <div
                        className="h-2 bg-[#004265] transition-all"
                        style={{ width: `${uploadProgress[`board_${idx}`]}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1">Uploading… {uploadProgress[`board_${idx}`]}%</p>
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
    </div>
  </div>
)}

          {/* Why Trust Us */}
          {activeTab === "trust" && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-medium font-sans!">Why Trust Us Section</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={content.whyTrustUs.title}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    whyTrustUs: { ...prev.whyTrustUs, title: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <input
                  type="text"
                  value={content.whyTrustUs.bgColor}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    whyTrustUs: { ...prev.whyTrustUs, bgColor: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                  placeholder="#9FDFFC"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Content Segments</label>
                {content.whyTrustUs.content.map((segment, idx) => (
                  <div key={idx} className="mb-3 p-3 border rounded">
                    <textarea
                      value={segment.text}
                      onChange={(e) => {
                        const updated = [...content.whyTrustUs.content];
                        updated[idx] = { ...updated[idx], text: e.target.value };
                        setContent(prev => ({
                          ...prev,
                          whyTrustUs: { ...prev.whyTrustUs, content: updated }
                        }));
                      }}
                      className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                      rows={2}
                    />
                    <select
                      value={segment.weight}
                      onChange={(e) => {
                        const updated = [...content.whyTrustUs.content];
                        updated[idx] = { ...updated[idx], weight: e.target.value as any };
                        setContent(prev => ({
                          ...prev,
                          whyTrustUs: { ...prev.whyTrustUs, content: updated }
                        }));
                      }}
                      className="mt-2 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semibold</option>
                    </select>
                    <button
                      onClick={() => {
                        const updated = content.whyTrustUs.content.filter((_, i) => i !== idx);
                        setContent(prev => ({
                          ...prev,
                          whyTrustUs: { ...prev.whyTrustUs, content: updated }
                        }));
                      }}
                      className="mt-2 ml-2 px-3 py-1 border border-red-500 text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setContent(prev => ({
                      ...prev,
                      whyTrustUs: {
                        ...prev.whyTrustUs,
                        content: [...prev.whyTrustUs.content, { text: "", weight: "normal" }]
                      }
                    }));
                  }}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Text Segment
                </button>
              </div>
            </div>
          )}

          {/* Partners */}
          {activeTab === "partners" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Partners</h2>
                <button
                  onClick={addPartner}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Partner
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.partners.title}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    partners: { ...prev.partners, title: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 mb-6"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {content.partners.partners.map((partner, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={partner}
                      onChange={(e) => updatePartner(idx, e.target.value)}
                      className="flex-1 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      placeholder="Partner name"
                    />
                    <button
                      onClick={() => removePartner(idx)}
                      className="px-3 py-2 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
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