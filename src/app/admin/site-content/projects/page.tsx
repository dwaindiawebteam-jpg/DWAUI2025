"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc,collection, getDocs,deleteDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import { extractAssetUrlsFromProjects } from "@/lib/extractAssetUrls";
import { compressImageClient } from "@/lib/compressImage";
import FloatingSaveBar from "@/components/editor/FloatingSaveBar";
import type { ProjectsContent, ProjectsTestimonial, ProjectsTextSegment, OngoingProject, ProjectPost } from "@/types/projects";

// Helper function to format date as "20 August 2025"
function formatDateToDisplay(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Helper function to parse date string back to Date object
function parseDateFromString(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Try to parse the date string
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // If it's already in formatted format like "20 August 2025", try to parse it locally
  const parts = dateString.split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parts[1];
    const year = parseInt(parts[2]);
    
    const monthMap: { [key: string]: number } = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    
    if (monthMap[month] !== undefined && !isNaN(day) && !isNaN(year)) {
      // Create date in local timezone
      return new Date(year, monthMap[month], day);
    }
  }
  
  return null;
}

function normalizeTag(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export default function AdminProjectsPage() {
  const { user, role, authReady } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const [projectPosts, setProjectPosts] = useState<Record<string, ProjectPost>>({});
  const [editingPostSlug, setEditingPostSlug] = useState<string | null>(null);
  const [postContent, setPostContent] = useState("");

  const [originalContent, setOriginalContent] = useState<ProjectsContent | null>(null);
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<Array<{ 
    url: string; 
    fileId: string; 
    oldUrl?: string;
    oldFileId?: string;
  }>>([]);
    
  const [activeTab, setActiveTab] = useState("hero");

  const [content, setContent] = useState<ProjectsContent>({
    heroSection: {
      image: "/images/projectspage/project-hero-img.png",
      imageFileId: "",
      imageAlt: "Women from Dalit community",
      belowText: {
        title: "Our Projects",
        titleColor: "#004265",
        content: [
          {
            text: `This year, we successfully conducted impactful women empowerment, advocacy, and health awareness programs
              reaching over 5,000 women across 28 villages. These initiatives have strengthened women's voices, improved health
              practices, and created pathways for self-reliance and dignity within their communities. Our work has been made
              possible through the generous support of our major funding partners, including MEI USA, BASAID, and UCH, whose
              commitment has enabled us to expand our reach.`,
            color: "black",
          },
        ],
      },
    },
  ongoingProjects: {
    title: "Ongoing Projects",
    projects: [
      {
        id: "1",
        title: "Digital Literacy",
        description: "Equipping rural Dalit children and youth with digital skills, e-learning tools, and computer training to bridge the digital divide.",
        image: "/images/ongoing/digital-literacy.jpg",
        imageFileId: "",
        slug: "Digital-Literacy",
        date: "2024", // Add this line
      },
      {
        id: "2",
        title: "Women's Livelihood Initiative",
        description: "Supporting women with micro-credit, training, and financial resources to start small enterprises and generate income.",
        image: "/images/ongoing/women-livelihood.jpg",
        imageFileId: "",
        slug: "womens-livelihood-initiative",
        date: "2024", // Add this line
      }
    ],
  },
    dualContentBlock: {
      left: {
        title: "Dairy Project – Govindapalle",
        titleSize: "text-2xl md:text-3xl text-center sm:text-left",
        type: "list",
        bgColor: "bg-purple",
        titleColor: "#FFFFFF",
        rows: [
          {
            label: { text: "Location", weight: "bold", color: "#FFFFFF" },
            value: { text: ": Govindapalle Village", weight: "normal", color: "#FFFFFF" },
          },
          {
            label: { text: "Beneficiaries", weight: "bold", color: "#FFFFFF" },
            value: { text: ": 40 women", weight: "normal", color: "#FFFFFF" },
          },
          {
            label: { text: "Budget", weight: "bold", color: "#FFFFFF" },
            value: { text: ": ₹20 lakhs", weight: "normal", color: "#FFFFFF" },
          },
          {
            label: { text: "Duration", weight: "bold", color: "#FFFFFF" },
            value: { text: ": 12 months", weight: "normal", color: "#FFFFFF" },
          },
          {
            label: { text: "Results: ", weight: "bold", color: "#FFFFFF" },
            value: { 
              text: `Women gained steady income, improved nutrition for families,
                and collective savings groups strengthened financial
                independence.`, 
              weight: "normal", 
              color: "#FFFFFF" 
            },
          },
        ],
      },
      right: {
        title: "Finance Awareness – Sirivella",
        titleSize: "text-2xl md:text-3xl text-center sm:text-left",
        type: "list",
        bgColor: "bg-pink/50",
        titleColor: "#000000",
        rows: [
          {
            label: { text: "Location", weight: "bold", color: "#000000" },
            value: { text: ": 8 villages, Sirivella Mandal", weight: "normal", color: "#000000" },
          },
          {
            label: { text: "Beneficiaries", weight: "bold", color: "#000000" },
            value: { text: ": 700–800 women", weight: "normal", color: "#000000" },
          },
          {
            label: { text: "Budget", weight: "bold", color: "#000000" },
            value: { text: ": ₹12 lakhs", weight: "normal", color: "#000000" },
          },
          {
            label: { text: "Duration", weight: "bold", color: "#000000" },
            value: { text: ": 12 months", weight: "normal", color: "#000000" },
          },
          {
            label: { text: "Results: ", weight: "bold", color: "#000000" },
            value: { 
              text: `Women developed financial literacy, reduced debt reliance,
                adopted savings habits, and started small investments
                for household security.`, 
              weight: "normal", 
              color: "#000000" 
            },
          },
        ],
      },
    },
    testimonials: {
      heading: "Testimonials",
      testimonials: [
        {
          name: "Y. Saramma",
          title: "Govindapalle",
          text: "With the support of Dalit Welfare Association, I started an income-generating activity that helps feed my family. This opportunity has given me confidence, stability, and hope for a better future.",
          splatterImage: "/images/SplatterImages/green splatter.png",
          splatterImageFileId: "",
        },
        {
          name: "Y. Saramma",
          title: "Govindapalle",
          text: "With the support of Dalit Welfare Association, I started an income-generating activity that helps feed my family. This opportunity has given me confidence, stability, and hope for a better future.",
          splatterImage: "/images/SplatterImages/red splatter.png",
          splatterImageFileId: "",
        },
        {
          name: "Y. Saramma",
          title: "Govindapalle",
          text: "With the support of Dalit Welfare Association, I started an income-generating activity that helps feed my family. This opportunity has given me confidence, stability, and hope for a better future.",
          splatterImage: "/images/SplatterImages/purple splatter.png",
          splatterImageFileId: "",
        },
      ],
    },
    imageDivider: {
      image: "/images/projectspage/childern-in-class.png",
      imageFileId: "",
      imageAlt: "children in class",
    },
    partners: {
      title: "Our Partners",
      partners: [
        "1% Fund",
        "Presbityerian Church",
        "Global Compassion",
        "Jiv Daya Fund",
        "Basaid",
        "UCH",
        "Grace Fund"
      ],
    },
  });

  // Helper functions for dual content rows (keep existing)
  const addRow = (side: 'left' | 'right') => {
    setContent(prev => ({
      ...prev,
      dualContentBlock: {
        ...prev.dualContentBlock,
        [side]: {
          ...prev.dualContentBlock[side],
          rows: [
            ...prev.dualContentBlock[side].rows,
            {
              label: { text: "", weight: "bold", color: prev.dualContentBlock[side].titleColor },
              value: { text: "", weight: "normal", color: prev.dualContentBlock[side].titleColor }
            }
          ]
        }
      }
    }));
  };

  const removeRow = (side: 'left' | 'right', index: number) => {
    setContent(prev => ({
      ...prev,
      dualContentBlock: {
        ...prev.dualContentBlock,
        [side]: {
          ...prev.dualContentBlock[side],
          rows: prev.dualContentBlock[side].rows.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const updateRowLabel = (side: 'left' | 'right', index: number, field: keyof ProjectsTextSegment, value: string) => {
    setContent(prev => {
      const updatedRows = [...prev.dualContentBlock[side].rows];
      updatedRows[index] = {
        ...updatedRows[index],
        label: { ...updatedRows[index].label, [field]: value }
      };
      return {
        ...prev,
        dualContentBlock: {
          ...prev.dualContentBlock,
          [side]: { ...prev.dualContentBlock[side], rows: updatedRows }
        }
      };
    });
  };

  const updateRowValue = (side: 'left' | 'right', index: number, field: keyof ProjectsTextSegment, value: string) => {
    setContent(prev => {
      const updatedRows = [...prev.dualContentBlock[side].rows];
      updatedRows[index] = {
        ...updatedRows[index],
        value: { ...updatedRows[index].value, [field]: value }
      };
      return {
        ...prev,
        dualContentBlock: {
          ...prev.dualContentBlock,
          [side]: { ...prev.dualContentBlock[side], rows: updatedRows }
        }
      };
    });
  };

  // Ongoing Projects management functions
  const addOngoingProject = () => {
    const newId = Date.now().toString();
    setContent(prev => ({
      ...prev,
      ongoingProjects: {
        ...prev.ongoingProjects,
        projects: [
          ...prev.ongoingProjects.projects,
          {
            id: newId,
            title: "",
            description: "",
            image: "",
            imageFileId: "",
            slug: "",
            date: "", // Add this line
          }
        ]
      }
    }));
  };

  const removeOngoingProject = (index: number) => {
    setContent(prev => ({
      ...prev,
      ongoingProjects: {
        ...prev.ongoingProjects,
        projects: prev.ongoingProjects.projects.filter((_, i) => i !== index)
      }
    }));
  };

  const updateOngoingProject = (index: number, field: keyof OngoingProject, value: any) => {
    setContent(prev => {
      const updated = [...prev.ongoingProjects.projects];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        ongoingProjects: { ...prev.ongoingProjects, projects: updated }
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
        const ref = doc(db, "siteContent", "projects");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const loaded: ProjectsContent = {
            heroSection: data.heroSection || content.heroSection,
            ongoingProjects: data.ongoingProjects || content.ongoingProjects,
            dualContentBlock: data.dualContentBlock || content.dualContentBlock,
            testimonials: data.testimonials || content.testimonials,
            imageDivider: data.imageDivider || content.imageDivider,
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

  // Load project posts from Firestore
useEffect(() => {
  async function loadProjectPosts() {
    if (!user) return;
    
    try {
      const postsRef = collection(db, "projectPosts");
      const snapshot = await getDocs(postsRef);
      const postsMap: Record<string, ProjectPost> = {};
      snapshot.forEach(doc => {
        const data = doc.data() as ProjectPost;
        postsMap[data.slug] = data;
      });
      setProjectPosts(postsMap);
    } catch (err) {
      console.error("Failed to load project posts:", err);
    }
  }
  
  loadProjectPosts();
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

  function validateProjectsContent(content: ProjectsContent): string | null {
    if (!isNonEmptyString(content.heroSection.belowText.title)) {
      return "Hero section title is required.";
    }
    if (!isNonEmptyArray(content.testimonials.testimonials)) {
      return "Please add at least one testimonial.";
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

    const validationError = validateProjectsContent(content);
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

      const ref = doc(db, "siteContent", "projects");
      let finalContent = content;

      if (pendingAssets.length) {
        const assetsToPromote = pendingAssets.filter(asset => {
          const isUsed = extractAssetUrlsFromProjects(finalContent as any).includes(asset.url);
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

          // Ongoing projects images
          finalContent = {
            ...finalContent,
            ongoingProjects: {
              ...finalContent.ongoingProjects,
              projects: finalContent.ongoingProjects.projects.map(project => {
                if (project.image && replacements[project.image]) {
                  return {
                    ...project,
                    image: replacements[project.image].url,
                    imageFileId: replacements[project.image].fileId,
                  };
                }
                return project;
              }),
            },
          };

          // Testimonials splatter images
          finalContent = {
            ...finalContent,
            testimonials: {
              ...finalContent.testimonials,
              testimonials: finalContent.testimonials.testimonials.map(testimonial => {
                if (testimonial.splatterImage && replacements[testimonial.splatterImage]) {
                  return {
                    ...testimonial,
                    splatterImage: replacements[testimonial.splatterImage].url,
                    splatterImageFileId: replacements[testimonial.splatterImage].fileId,
                  };
                }
                return testimonial;
              }),
            },
          };

          // Image divider
          if (finalContent.imageDivider.image && replacements[finalContent.imageDivider.image]) {
            finalContent = {
              ...finalContent,
              imageDivider: {
                ...finalContent.imageDivider,
                image: replacements[finalContent.imageDivider.image].url,
                imageFileId: replacements[finalContent.imageDivider.image].fileId,
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
        ongoingProjects: finalContent.ongoingProjects,
        dualContentBlock: finalContent.dualContentBlock,
        testimonials: finalContent.testimonials,
        imageDivider: finalContent.imageDivider,
        partners: finalContent.partners,
        updatedAt: new Date(),
      };
      
      await setDoc(ref, dataToSave);

      if (originalContent) {
        const before = new Set(extractAssetUrlsFromProjects(originalContent as any));
        const after = new Set(extractAssetUrlsFromProjects(finalContent as any));
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

      setSuccessMessage("Projects page content saved successfully!");
      setOriginalContent(structuredClone(finalContent));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

 async function saveProjectPost(slug: string) {
  if (!user) return;
  
  try {
    const postRef = doc(db, "projectPosts", slug);
    const existingPost = projectPosts[slug];
    const projectData = content.ongoingProjects.projects.find(p => p.slug === slug);
    
    const postData: ProjectPost = {
      slug: slug,
      title: projectData?.title || "",
      description: projectData?.description || "",
      date: projectData?.date || "",
      content: postContent,
      // Remove splatter image fields
      updatedAt: new Date()
    };
    
    if (!existingPost) {
      postData.createdAt = new Date();
    }
    
    await setDoc(postRef, postData);
    
    // Update local state
    setProjectPosts(prev => ({
      ...prev,
      [slug]: postData
    }));
    
    setSuccessMessage("Project post saved successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setEditingPostSlug(null); // Close the editor after save
  } catch (err: any) {
    setErrorMessage(err.message || "Failed to save project post");
  }
}
  // Testimonial management
  const addTestimonial = () => {
    setContent(prev => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        testimonials: [...prev.testimonials.testimonials, {
          name: "",
          title: "",
          text: "",
          splatterImage: "",
          splatterImageFileId: "",
        }]
      }
    }));
  };

  const removeTestimonial = (index: number) => {
    setContent(prev => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        testimonials: prev.testimonials.testimonials.filter((_, i) => i !== index)
      }
    }));
  };

  const updateTestimonial = (index: number, field: keyof ProjectsTestimonial, value: string) => {
    setContent(prev => {
      const updated = [...prev.testimonials.testimonials];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        testimonials: { ...prev.testimonials, testimonials: updated }
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
    { id: "dual", label: "Completed Projects" },
    { id: "testimonials", label: "Testimonials" },
    { id: "ongoing", label: "Ongoing Projects" },
    { id: "divider", label: "Image Divider" },
    { id: "partners", label: "Partners" },
  ];

// Date Picker Component for Ongoing Projects
// Date Picker Component for Ongoing Projects
function OngoingProjectDatePicker({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (dateString: string) => void;
}) {
  // Parse the stored formatted date back to a date object for the input
  const getDateForInput = (formattedDate: string): string => {
    if (!formattedDate) return '';
    
    // Try to parse the formatted date string
    const parsedDate = parseDateFromString(formattedDate);
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      // Create date in local timezone to avoid UTC conversion
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return '';
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      // Parse the YYYY-MM-DD string in local timezone
      const [year, month, day] = dateValue.split('-').map(Number);
      // Create date using local timezone (month is 0-indexed in Date constructor)
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        // Store the formatted date string
        const formattedDate = formatDateToDisplay(date);
        onChange(formattedDate);
      }
    } else {
      onChange("");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Project Date</label>
      <input
        type="date"
        value={getDateForInput(value)}
        onChange={handleDateChange}
        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
      />
      {value && (
        <p className="text-base! text-green-600 mt-1">
          Formatted: {value}
        </p>
      )}
    </div>
  );
}

  return (
    <div className="px-4 sm:px-6 py-12 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center font-sans!">
          Projects Page Management
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
                          "projects/hero",
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
                          "projects/hero",
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
              <div className="flex items-center gap-3">
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
                  className="w-12 h-10 border cursor-pointer"
                />
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
                  className="flex-1 px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                  placeholder="#004265"
                />
              </div>
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

          {/* Ongoing Projects Section */}
          {activeTab === "ongoing" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Ongoing Projects</h2>
                <button
                  onClick={addOngoingProject}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Ongoing Project
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.ongoingProjects.title}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    ongoingProjects: { ...prev.ongoingProjects, title: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              {content.ongoingProjects.projects.map((project, idx) => (
                <div key={project.id} className="border p-5 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">Ongoing Project #{idx + 1}</h3>
                    <button
                      onClick={() => removeOngoingProject(idx)}
                      className="px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove Project
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Project Title</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => updateOngoingProject(idx, "title", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        placeholder="e.g., Digital Literacy Program"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Slug (URL path)</label>
                      <input
                        type="text"
                        value={project.slug}
                        onChange={(e) => updateOngoingProject(idx, "slug", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        placeholder="e.g., digital-literacy-program"
                      />
                      <p className="text-base! text-gray-500 mt-1">Used for the project detail page URL</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateOngoingProject(idx, "description", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                        rows={3}
                        placeholder="Brief description of the project..."
                      />
                    </div>
                    
                    {/* Add this after the description field */}
                    <OngoingProjectDatePicker
                        value={project.date || ""}
                        onChange={(formattedDate) => updateOngoingProject(idx, "date", formattedDate)}
                      />

                    <div>
                      <label className="block text-sm font-medium mb-2">Project Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files?.[0]) return;
                          setUploading(true);
                          try {
                            const result = await uploadAsset(
                              e.target.files[0],
                              "projects/ongoing",
                              (p) => setUploadProgress(prev => ({ ...prev, [`ongoing_${idx}`]: p })),
                              project.image,
                              project.imageFileId
                            );
                            updateOngoingProject(idx, "imageFileId", result.fileId);
                            updateOngoingProject(idx, "image", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`ongoing_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                        className="hidden"
                        id={`ongoing-image-${idx}`}
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
                              "projects/ongoing",
                              (p) => setUploadProgress(prev => ({ ...prev, [`ongoing_${idx}`]: p })),
                              project.image,
                              project.imageFileId
                            );
                            updateOngoingProject(idx, "imageFileId", result.fileId);
                            updateOngoingProject(idx, "image", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`ongoing_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                      >
                        <label
                          htmlFor={`ongoing-image-${idx}`}
                          className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                        >
                          Click or drag image here
                        </label>
                      </div>
                      
                      {uploadProgress[`ongoing_${idx}`] !== undefined && (
                        <div className="mt-2">
                          <div className="h-2 w-full bg-gray-200">
                            <div
                              className="h-2 bg-[#004265] transition-all"
                              style={{ width: `${uploadProgress[`ongoing_${idx}`]}%` }}
                            />
                          </div>
                          <p className="text-xs mt-1">Uploading… {uploadProgress[`ongoing_${idx}`]}%</p>
                        </div>
                      )}
                      {project.image && (
                        <div className="mt-4">
                          <img src={project.image} alt={project.title} className="max-h-48 border object-cover" />
                          <button
                            onClick={() => {
                              updateOngoingProject(idx, "image", "");
                              updateOngoingProject(idx, "imageFileId", "");
                            }}
                            className="mt-2 px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}

                      {/* Add this after the image upload section, before the closing div of each project */}
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        setEditingPostSlug(project.slug);
                        const existingPost = projectPosts[project.slug];
                        setPostContent(existingPost?.content || "");
                      }}
                      className="px-4 py-2 border border-blue-500 text-blue-500 text-sm hover:bg-blue-50"
                    >
                      Edit Detailed Post Content
                    </button>
                  </div>

                    {editingPostSlug === project.slug && (
                      <div className="mt-4 p-4 border rounded bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg">Detailed Post Content for: {project.title}</h4>
                          <button
                            onClick={() => setEditingPostSlug(null)}
                            className="px-3 py-1 border border-gray-400 text-gray-600 hover:bg-gray-100"
                          >
                            Close
                          </button>
                        </div>
                        
                        {/* Display info about which image will be used */}
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-base! text-blue-800">
                            <strong>Note:</strong> This detailed post will use the project image shown above 
                            ({project.image ? "Image uploaded" : "No image uploaded yet"}). 
                            To change the image, update the "Project Image" section above.
                          </p>
                          {project.image && (
                            <div className="mt-2">
                              <img 
                                src={project.image} 
                                alt={project.title} 
                                className="max-h-32 border object-cover"
                              />
                            </div>
                          )}
                        </div>
                        
                        {/* Content Editor */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Post Content (HTML supported)</label>
                          <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            rows={15}
                            className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 font-mono text-sm"
                            placeholder="Enter detailed project content here."
                          />
                          
                        </div>
                        
                        {/* Save Button */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveProjectPost(project.slug)}
                            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700"
                          >
                            Save Post Content
                          </button>
                          {projectPosts[project.slug] && (
                            <button
                              onClick={async () => {
                                if (confirm("Are you sure you want to delete this post?")) {
                                  // Add delete functionality if needed
                                  const postRef = doc(db, "projectPosts", project.slug);
                                  await deleteDoc(postRef);
                                  setProjectPosts(prev => {
                                    const newPosts = { ...prev };
                                    delete newPosts[project.slug];
                                    return newPosts;
                                  });
                                  setEditingPostSlug(null);
                                  setSuccessMessage("Post deleted successfully!");
                                  setTimeout(() => setSuccessMessage(""), 3000);
                                }
                              }}
                              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                            >
                              Delete Post
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Projects Section (Dual Content) */}
{activeTab === "dual" && (

  <div className="space-y-8">

    <h2 className="text-xl sm:text-2xl font-medium mb-6 font-sans!">
      Completed Projects
    </h2>

    {/* GRID WRAPPER — stacks on mobile, 2 cols on desktop */}

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* LEFT COLUMN */}

      <div className="border p-5 space-y-4">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

          <h3 className="text-lg font-bold">
            Left Project (Dairy Project – Govindapalle)
          </h3>

          <button
            onClick={() => addRow('left')}
            className="px-3 py-2 border text-sm hover:bg-gray-50 w-full sm:w-auto"
          >
            + Add Row
          </button>

        </div>

        {/* TITLE */}

        <div>

          <label className="block text-sm font-medium mb-1">
            Title
          </label>

          <textarea
            rows={1}
            value={content.dualContentBlock.left.title}
            onChange={(e) =>
              setContent(prev => ({
                ...prev,
                dualContentBlock: {
                  ...prev.dualContentBlock,
                  left: {
                    ...prev.dualContentBlock.left,
                    title: e.target.value
                  }
                }
              }))
            }
            onInput={(e) => {
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height =
                e.currentTarget.scrollHeight + "px";
            }}
            className="w-full px-4 py-2 border bg-white overflow-hidden resize-none"
          />

        </div>

        {/* ROWS */}

        {content.dualContentBlock.left.rows.map((row, rowIdx) => (

          <div
            key={rowIdx}
            className="p-4 border rounded space-y-4"
          >

            {/* LABEL SECTION */}

            <div className="space-y-2">

              <textarea
                rows={1}
                value={row.label.text}
                onChange={(e) =>
                  updateRowLabel(
                    'left',
                    rowIdx,
                    'text',
                    e.target.value
                  )
                }
                onInput={(e) => {
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height =
                    e.currentTarget.scrollHeight + "px";
                }}
                placeholder="Label"
                className="w-full px-4 py-2 border resize-none overflow-hidden"
              />

              {/* Controls Grid */}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

                <select
                  value={row.label.weight || "normal"}
                  onChange={(e) =>
                    updateRowLabel(
                      'left',
                      rowIdx,
                      'weight',
                      e.target.value as any
                    )
                  }
                  className="px-3 py-2 border"
                >
                  <option value="normal">
                    Normal
                  </option>

                  <option value="bold">
                    Bold
                  </option>

                </select>

                <input
                  type="color"
                  value={row.label.color || "#000000"}
                  onChange={(e) =>
                    updateRowLabel(
                      'left',
                      rowIdx,
                      'color',
                      e.target.value
                    )
                  }
                  className="w-full h-10 border"
                />

              </div>

            </div>

            {/* VALUE SECTION */}

            <div className="space-y-2">

              <textarea
                rows={3}
                value={row.value.text}
                onChange={(e) =>
                  updateRowValue(
                    'left',
                    rowIdx,
                    'text',
                    e.target.value
                  )
                }
                onInput={(e) => {
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height =
                    e.currentTarget.scrollHeight + "px";
                }}
                placeholder="Value"
                className="w-full px-4 py-2 border resize-none overflow-hidden"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

                <select
                  value={row.value.weight || "normal"}
                  onChange={(e) =>
                    updateRowValue(
                      'left',
                      rowIdx,
                      'weight',
                      e.target.value as any
                    )
                  }
                  className="px-3 py-2 border"
                >

                  <option value="normal">
                    Normal
                  </option>

                  <option value="bold">
                    Bold
                  </option>

                </select>

                <input
                  type="color"
                  value={row.value.color || "#000000"}
                  onChange={(e) =>
                    updateRowValue(
                      'left',
                      rowIdx,
                      'color',
                      e.target.value
                    )
                  }
                  className="w-full h-auto border"
                />

              </div>

            </div>

            <button
              onClick={() =>
                removeRow('left', rowIdx)
              }
              className="px-3 py-2 border border-red-500 text-red-500 text-sm w-full sm:w-auto"
            >
              Remove Row
            </button>

          </div>

        ))}

      </div>



      {/* RIGHT COLUMN */}

      <div className="border p-5 space-y-4">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

          <h3 className="text-lg font-bold">
            Right Project (Finance Awareness – Sirivella)
          </h3>

          <button
            onClick={() => addRow('right')}
            className="px-3 py-2 border text-sm hover:bg-gray-50 w-full sm:w-auto"
          >
            + Add Row
          </button>

        </div>

        {content.dualContentBlock.right.rows.map((row, rowIdx) => (

          <div
            key={rowIdx}
            className="p-4 border rounded space-y-4"
          >

            {/* LABEL */}

            <div className="space-y-2">

              <input
                type="text"
                value={row.label.text}
                onChange={(e) =>
                  updateRowLabel(
                    'right',
                    rowIdx,
                    'text',
                    e.target.value
                  )
                }
                placeholder="Label"
                className="w-full px-4 py-2 border"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

                <select
                  value={row.label.weight || "normal"}
                  onChange={(e) =>
                    updateRowLabel(
                      'right',
                      rowIdx,
                      'weight',
                      e.target.value as any
                    )
                  }
                  className="px-3 py-2 border"
                >

                  <option value="normal">
                    Normal
                  </option>

                  <option value="bold">
                    Bold
                  </option>

                </select>

                <input
                  type="color"
                  value={row.label.color || "#000000"}
                  onChange={(e) =>
                    updateRowLabel(
                      'right',
                      rowIdx,
                      'color',
                      e.target.value
                    )
                  }
                  className="w-full h-10 border"
                />

              </div>

            </div>

            {/* VALUE */}

            <div className="space-y-2">

           <textarea
            rows={3}
            value={row.value.text}
            onChange={(e) =>
              updateRowValue(
                'right',
                rowIdx,
                'text',
                e.target.value
              )
            }
            onInput={(e) => {
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height =
                e.currentTarget.scrollHeight + "px";
            }}
            placeholder="Value"
            className="w-full px-4 py-2 border resize-none overflow-hidden"
          />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

                <select
                  value={row.value.weight || "normal"}
                  onChange={(e) =>
                    updateRowValue(
                      'right',
                      rowIdx,
                      'weight',
                      e.target.value as any
                    )
                  }
                  className="px-3 py-2 border"
                >

                  <option value="normal">
                    Normal
                  </option>

                  <option value="bold">
                    Bold
                  </option>

                </select>

                <input
                  type="color"
                  value={row.value.color || "#000000"}
                  onChange={(e) =>
                    updateRowValue(
                      'right',
                      rowIdx,
                      'color',
                      e.target.value
                    )
                  }
                  className="w-full h-10 border"
                />

              </div>

            </div>

            <button
              onClick={() =>
                removeRow('right', rowIdx)
              }
              className="px-3 py-2 border border-red-500 text-red-500 text-sm w-full sm:w-auto"
            >
              Remove Row
            </button>

          </div>

        ))}

      </div>

    </div>

  </div>

)}       

          {/* Testimonials */}
          {activeTab === "testimonials" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Testimonials Section</h2>
                <button
                  onClick={addTestimonial}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Testimonial
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Heading</label>
                <input
                  type="text"
                  value={content.testimonials.heading}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    testimonials: { ...prev.testimonials, heading: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              {content.testimonials.testimonials.map((testimonial, idx) => (
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
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={testimonial.title}
                        onChange={(e) => updateTestimonial(idx, "title", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Text</label>
                      <textarea
                        value={testimonial.text}
                        onChange={(e) => updateTestimonial(idx, "text", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Splatter Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files?.[0]) return;
                          setUploading(true);
                          try {
                            const result = await uploadAsset(
                              e.target.files[0],
                              "projects/testimonials",
                              (p) => setUploadProgress(prev => ({ ...prev, [`testimonial_${idx}`]: p })),
                              testimonial.splatterImage,
                              testimonial.splatterImageFileId
                            );
                            updateTestimonial(idx, "splatterImageFileId", result.fileId);
                            updateTestimonial(idx, "splatterImage", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`testimonial_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                        className="hidden"
                        id={`testimonial-image-${idx}`}
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
                              "projects/testimonials",
                              (p) => setUploadProgress(prev => ({ ...prev, [`testimonial_${idx}`]: p })),
                              testimonial.splatterImage,
                              testimonial.splatterImageFileId
                            );
                            updateTestimonial(idx, "splatterImageFileId", result.fileId);
                            updateTestimonial(idx, "splatterImage", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`testimonial_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                      >
                        <label
                          htmlFor={`testimonial-image-${idx}`}
                          className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed cursor-pointer hover:bg-gray-50"
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
                          <img src={testimonial.splatterImage} alt={testimonial.name} className="max-h-24 border" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image Divider */}
          {activeTab === "divider" && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-medium font-sans!">Image Divider</h2>
              
              <div className="border p-5">
                <h3 className="text-lg font-bold mb-4">Divider Image</h3>
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
                          "projects/divider",
                          (p) => setUploadProgress(prev => ({ ...prev, divider_image: p })),
                          content.imageDivider.image,
                          content.imageDivider.imageFileId
                        );
                        setContent(prev => ({
                          ...prev,
                          imageDivider: {
                            ...prev.imageDivider,
                            image: result.url,
                            imageFileId: result.fileId
                          }
                        }));
                      } catch (err) {
                        setErrorMessage("Divider image upload failed");
                      } finally {
                        setUploading(false);
                        setUploadProgress(prev => {
                          const newPrev = { ...prev };
                          delete newPrev.divider_image;
                          return newPrev;
                        });
                      }
                    }}
                    className="hidden"
                    id="divider-image"
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
                          "projects/divider",
                          (p) => setUploadProgress(prev => ({ ...prev, divider_image: p })),
                          content.imageDivider.image,
                          content.imageDivider.imageFileId
                        );
                        setContent(prev => ({
                          ...prev,
                          imageDivider: {
                            ...prev.imageDivider,
                            image: result.url,
                            imageFileId: result.fileId
                          }
                        }));
                      } catch (err) {
                        setErrorMessage("Divider image upload failed");
                      } finally {
                        setUploading(false);
                        setUploadProgress(prev => {
                          const newPrev = { ...prev };
                          delete newPrev.divider_image;
                          return newPrev;
                        });
                      }
                    }}
                  >
                    <label
                      htmlFor="divider-image"
                      className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                    >
                      Click or drag divider image here
                    </label>
                  </div>
                  
                  {uploadProgress.divider_image !== undefined && (
                    <div className="mt-2">
                      <div className="h-2 w-full bg-gray-200">
                        <div
                          className="h-2 bg-[#004265] transition-all"
                          style={{ width: `${uploadProgress.divider_image}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1">Uploading… {uploadProgress.divider_image}%</p>
                    </div>
                  )}
                  {content.imageDivider.image && (
                    <div className="mt-4">
                      <img 
                        src={content.imageDivider.image} 
                        alt="Divider" 
                        className="max-h-48 border object-cover" 
                      />
                      <button
                        onClick={() => {
                          setContent(prev => ({
                            ...prev,
                            imageDivider: {
                              ...prev.imageDivider,
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
                  value={content.imageDivider.imageAlt}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    imageDivider: { ...prev.imageDivider, imageAlt: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          )}

          {/* Partners */}
          {activeTab === "partners" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Partners Section</h2>
                <button
                  onClick={addPartner}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Partner
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={content.partners.title}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    partners: { ...prev.partners, title: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Partner Names</label>
                {content.partners.partners.map((partner, idx) => (
                  <div key={idx} className="mb-3 flex gap-2 items-center">
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