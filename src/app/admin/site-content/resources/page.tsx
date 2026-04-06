"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import { extractAssetUrlsFromResources } from "@/lib/extractAssetUrls";
import { compressImageClient } from "@/lib/compressImage";
import FloatingSaveBar from "@/components/editor/FloatingSaveBar";
import type { ResourcesContent, GallerySection, FacilitySection, AnnualReport, StoryPost } from "@/types/resources";
import storyPosts from "@/data/storyPosts";

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
  
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
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

export default function AdminResourcesPage() {
  const { user, role, authReady } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const [storyPostsData, setStoryPostsData] = useState<StoryPost[]>(storyPosts);
  const [editingStorySlug, setEditingStorySlug] = useState<string | null>(null);
  const [storyContent, setStoryContent] = useState("");

  const [originalContent, setOriginalContent] = useState<ResourcesContent | null>(null);
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<Array<{ 
    url: string; 
    fileId: string; 
    oldUrl?: string;
    oldFileId?: string;
  }>>([]);
    
  const [activeTab, setActiveTab] = useState("hero");

  const [content, setContent] = useState<ResourcesContent>({
    heroSection: {
      image: "/images/resourcespage/resources page header image.png",
      imageFileId: "",
      imageAlt: "school kids from Dalit community",
      belowSectionBackground: "#FD7E14",
      belowText: {
        title: "DWA Resources",
        titleColor: "#004265",
        content: [
          {
            text: `The resources we share bring together knowledge, insights, and practical guidance from our network.
                      Whether you're a supporter, partner, or community member, you'll find tools here to help you learn, grow,
                      and make a difference..`,
            color: "black",
          },
        ],
      },
    },
    featuredStories: {
      heading: "Featured Stories",
      subheading: "Stories of Hope & Resilience",
      stories: storyPosts,
    },
    projectsGallery: {
      heading: "Projects Gallery",
      sections: [
        {
          title: "Title 1",
          images: [
            "/images/resourcespage/1st image middle section.jpg",
            "/images/resourcespage/2nd image middle section.jpg",
            "/images/resourcespage/3rd image middle section.jpg",
            "/images/resourcespage/4th image middle section.jpg"
          ],
          imageFileIds: ["", "", "", ""],
        },
        {
          title: "Title 2",
          images: [
            "/images/resourcespage/1st image middle section.jpg",
            "/images/resourcespage/2nd image middle section.jpg",
            "/images/resourcespage/3rd image middle section.jpg",
            "/images/resourcespage/4th image middle section.jpg"
          ],
          imageFileIds: ["", "", "", ""],
        },
      ],
    },
    orphanageOldageHome: {
      heading: "Orphanage & Oldage Home",
      sections: [
        {
          title: "Budaga Jangal Hostel (Orphanage)",
          images: [
            "/images/resourcespage/1st image middle section.jpg",
            "/images/resourcespage/2nd image middle section.jpg",
            "/images/resourcespage/3rd image middle section.jpg",
            "/images/resourcespage/4th image middle section.jpg"
          ],
          imageFileIds: ["", "", "", ""],
        },
        {
          title: "Old Age Home",
          images: [
            "/images/resourcespage/1st image middle section.jpg",
            "/images/resourcespage/2nd image middle section.jpg",
            "/images/resourcespage/3rd image middle section.jpg",
            "/images/resourcespage/4th image middle section.jpg"
          ],
          imageFileIds: ["", "", "", ""],
        },
      ],
    },
    annualReports: {
      reports: [
        { year: 2024, url: '/apply' },
        { year: 2023, url: '/apply' },
        { year: 2022, url: '/apply' },
        { year: 2021, url: '/apply' },
        { year: 2020, url: '/apply' },
      ],
    },
    infoForm: {
      enabled: true,
    },
  });

  // Gallery section management
  const addGallerySection = () => {
    setContent(prev => ({
      ...prev,
      projectsGallery: {
        ...prev.projectsGallery,
        sections: [
          ...prev.projectsGallery.sections,
          {
            title: "New Gallery",
            images: [],
            imageFileIds: [],
          }
        ]
      }
    }));
  };

  const removeGallerySection = (index: number) => {
    setContent(prev => ({
      ...prev,
      projectsGallery: {
        ...prev.projectsGallery,
        sections: prev.projectsGallery.sections.filter((_, i) => i !== index)
      }
    }));
  };

  const updateGallerySection = (index: number, field: keyof GallerySection, value: any) => {
    setContent(prev => {
      const updated = [...prev.projectsGallery.sections];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        projectsGallery: { ...prev.projectsGallery, sections: updated }
      };
    });
  };

  const addGalleryImage = (sectionIndex: number) => {
    setContent(prev => {
      const updated = [...prev.projectsGallery.sections];
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        images: [...updated[sectionIndex].images, ""],
        imageFileIds: [...updated[sectionIndex].imageFileIds, ""],
      };
      return {
        ...prev,
        projectsGallery: { ...prev.projectsGallery, sections: updated }
      };
    });
  };

  const removeGalleryImage = (sectionIndex: number, imageIndex: number) => {
    setContent(prev => {
      const updated = [...prev.projectsGallery.sections];
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        images: updated[sectionIndex].images.filter((_, i) => i !== imageIndex),
        imageFileIds: updated[sectionIndex].imageFileIds.filter((_, i) => i !== imageIndex),
      };
      return {
        ...prev,
        projectsGallery: { ...prev.projectsGallery, sections: updated }
      };
    });
  };

  // Facility section management
  const addFacilitySection = () => {
    setContent(prev => ({
      ...prev,
      orphanageOldageHome: {
        ...prev.orphanageOldageHome,
        sections: [
          ...prev.orphanageOldageHome.sections,
          {
            title: "New Facility",
            images: [],
            imageFileIds: [],
          }
        ]
      }
    }));
  };

  const removeFacilitySection = (index: number) => {
    setContent(prev => ({
      ...prev,
      orphanageOldageHome: {
        ...prev.orphanageOldageHome,
        sections: prev.orphanageOldageHome.sections.filter((_, i) => i !== index)
      }
    }));
  };

  const updateFacilitySection = (index: number, field: keyof FacilitySection, value: any) => {
    setContent(prev => {
      const updated = [...prev.orphanageOldageHome.sections];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        orphanageOldageHome: { ...prev.orphanageOldageHome, sections: updated }
      };
    });
  };

  const addFacilityImage = (sectionIndex: number) => {
    setContent(prev => {
      const updated = [...prev.orphanageOldageHome.sections];
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        images: [...updated[sectionIndex].images, ""],
        imageFileIds: [...updated[sectionIndex].imageFileIds, ""],
      };
      return {
        ...prev,
        orphanageOldageHome: { ...prev.orphanageOldageHome, sections: updated }
      };
    });
  };

  const removeFacilityImage = (sectionIndex: number, imageIndex: number) => {
    setContent(prev => {
      const updated = [...prev.orphanageOldageHome.sections];
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        images: updated[sectionIndex].images.filter((_, i) => i !== imageIndex),
        imageFileIds: updated[sectionIndex].imageFileIds.filter((_, i) => i !== imageIndex),
      };
      return {
        ...prev,
        orphanageOldageHome: { ...prev.orphanageOldageHome, sections: updated }
      };
    });
  };

  // Annual reports management
  const addReport = () => {
    setContent(prev => ({
      ...prev,
      annualReports: {
        reports: [...prev.annualReports.reports, { year: new Date().getFullYear(), url: '' }]
      }
    }));
  };

  const removeReport = (index: number) => {
    setContent(prev => ({
      ...prev,
      annualReports: {
        reports: prev.annualReports.reports.filter((_, i) => i !== index)
      }
    }));
  };

  const updateReport = (index: number, field: keyof AnnualReport, value: any) => {
    setContent(prev => {
      const updated = [...prev.annualReports.reports];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        annualReports: { reports: updated }
      };
    });
  };

  // Story management
  const addStory = () => {
    const newStory: StoryPost = {
      id: Date.now().toString(),
      slug: `story-${Date.now()}`,
      title: "New Story",
      excerpt: "Story excerpt...",
      date: formatDateToDisplay(new Date()),
      readTime: "5 min read",
      image: "",
      imageFileId: "",
      content: "",
    };
    setStoryPostsData(prev => [...prev, newStory]);
    setContent(prev => ({
      ...prev,
      featuredStories: {
        ...prev.featuredStories,
        stories: [...prev.featuredStories.stories, newStory]
      }
    }));
  };

  const removeStory = async (index: number) => {
    const storyToRemove = storyPostsData[index];
    if (storyToRemove.slug) {
      try {
        const storyRef = doc(db, "storyPosts", storyToRemove.slug);
        await deleteDoc(storyRef);
      } catch (err) {
        console.error("Failed to delete story from Firestore:", err);
      }
    }
    setStoryPostsData(prev => prev.filter((_, i) => i !== index));
    setContent(prev => ({
      ...prev,
      featuredStories: {
        ...prev.featuredStories,
        stories: prev.featuredStories.stories.filter((_, i) => i !== index)
      }
    }));
  };

  const updateStory = (index: number, field: keyof StoryPost, value: any) => {
    const updated = [...storyPostsData];
    updated[index] = { ...updated[index], [field]: value };
    setStoryPostsData(updated);
    setContent(prev => ({
      ...prev,
      featuredStories: {
        ...prev.featuredStories,
        stories: updated
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
        const ref = doc(db, "siteContent", "resources");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const loaded: ResourcesContent = {
            heroSection: data.heroSection || content.heroSection,
            featuredStories: data.featuredStories || content.featuredStories,
            projectsGallery: data.projectsGallery || content.projectsGallery,
            orphanageOldageHome: data.orphanageOldageHome || content.orphanageOldageHome,
            annualReports: data.annualReports || content.annualReports,
            infoForm: data.infoForm || content.infoForm,
          };
          setContent(loaded);
          setOriginalContent(structuredClone(loaded));
          if (loaded.featuredStories?.stories) {
            setStoryPostsData(loaded.featuredStories.stories);
          }
        }
      } catch (err) {
        setErrorMessage("Failed to load content.");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [user]);

  // Load story posts from Firestore
useEffect(() => {
  async function loadStoryPosts() {
    if (!user) return;
    
    try {
      const postsRef = collection(db, "storyPosts");
      const snapshot = await getDocs(postsRef);
      const storiesMap: Record<string, StoryPost> = {};
      snapshot.forEach(doc => {
        const data = doc.data() as StoryPost;
        storiesMap[data.slug] = data;
      });
      
      // Merge Firestore content with local story posts
      const updatedStories = storyPostsData.map(story => {
        if (story.slug && storiesMap[story.slug]) {
          return { 
            ...story, 
            ...storiesMap[story.slug],
            // Preserve the original id if it exists, otherwise use the one from Firestore
            id: story.id || storiesMap[story.slug].id 
          };
        }
        return story;
      });
      setStoryPostsData(updatedStories);
      setContent(prev => ({
        ...prev,
        featuredStories: {
          ...prev.featuredStories,
          stories: updatedStories
        }
      }));
    } catch (err) {
      console.error("Failed to load story posts:", err);
    }
  }
  
  loadStoryPosts();
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

  function validateResourcesContent(content: ResourcesContent): string | null {
    if (!isNonEmptyString(content.heroSection.belowText.title)) {
      return "Hero section title is required.";
    }
    if (!isNonEmptyArray(content.projectsGallery.sections)) {
      return "Please add at least one gallery section.";
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

  async function saveStoryPost(slug: string) {
  if (!user) return;
  
  try {
    const postRef = doc(db, "storyPosts", slug);
    const storyData = storyPostsData.find(s => s.slug === slug);
    
    const postData: StoryPost = {
        id: storyData?.id || slug, // Add the id field
        slug: slug,
        title: storyData?.title || "",
        excerpt: storyData?.excerpt || "",
        date: storyData?.date || "",
        readTime: storyData?.readTime || "",
        image: storyData?.image || "",
        imageFileId: storyData?.imageFileId || "",
        content: storyContent,
        updatedAt: new Date()
      };
    
    const existingPost = await getDoc(postRef);
    if (!existingPost.exists()) {
      postData.createdAt = new Date();
    }
    
    await setDoc(postRef, postData);
    setSuccessMessage("Story post saved successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setEditingStorySlug(null);
  } catch (err: any) {
    setErrorMessage(err.message || "Failed to save story post");
  }
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

  const validationError = validateResourcesContent(content);
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

    const ref = doc(db, "siteContent", "resources");
    
    // CRITICAL FIX: Sync storyPostsData with content before processing
    let finalContent = {
      ...content,
      featuredStories: {
        ...content.featuredStories,
        stories: storyPostsData
      }
    };

    if (pendingAssets.length) {
      const assetsToPromote = pendingAssets.filter(asset => {
        const isUsed = extractAssetUrlsFromResources(finalContent as any).includes(asset.url);
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
        
        // Featured Stories images - MOVED THIS BEFORE GALLERY/FACILITY
        if (finalContent.featuredStories?.stories) {
          const updatedStories = finalContent.featuredStories.stories.map(story => {
            if (story.image && replacements[story.image]) {
              return {
                ...story,
                image: replacements[story.image].url,
                imageFileId: replacements[story.image].fileId,
              };
            }
            return story;
          });
          
          finalContent = {
            ...finalContent,
            featuredStories: {
              ...finalContent.featuredStories,
              stories: updatedStories
            }
          };
          
          // CRITICAL: Update storyPostsData state to match
          setStoryPostsData(updatedStories);
        }

        // Gallery section images
        finalContent = {
          ...finalContent,
          projectsGallery: {
            ...finalContent.projectsGallery,
            sections: finalContent.projectsGallery.sections.map(section => ({
              ...section,
              images: section.images.map(img => replacements[img]?.url || img),
              imageFileIds: section.images.map((img, idx) => replacements[img]?.fileId || section.imageFileIds[idx]),
            })),
          },
        };

        // Facility section images
        finalContent = {
          ...finalContent,
          orphanageOldageHome: {
            ...finalContent.orphanageOldageHome,
            sections: finalContent.orphanageOldageHome.sections.map(section => ({
              ...section,
              images: section.images.map(img => replacements[img]?.url || img),
              imageFileIds: section.images.map((img, idx) => replacements[img]?.fileId || section.imageFileIds[idx]),
            })),
          },
        };

        // Update the main content state
        setContent(finalContent);
      }
      setPendingAssets([]);
    }

    const finalUndefinedPaths = findUndefinedValues(finalContent);
    if (finalUndefinedPaths.length > 0) {
      throw new Error(`Cannot save to Firestore: undefined values at ${finalUndefinedPaths.join(", ")}`);
    }

    // CRITICAL FIX: Use the updated stories from finalContent, not the old storyPostsData
    const dataToSave = {
      heroSection: finalContent.heroSection,
      featuredStories: {
        ...finalContent.featuredStories,
        stories: finalContent.featuredStories.stories, // Use finalContent's stories
      },
      projectsGallery: finalContent.projectsGallery,
      orphanageOldageHome: finalContent.orphanageOldageHome,
      annualReports: finalContent.annualReports,
      infoForm: finalContent.infoForm,
      updatedAt: new Date(),
    };
    
    await setDoc(ref, dataToSave);

    if (originalContent) {
      const before = new Set(extractAssetUrlsFromResources(originalContent as any));
      const after = new Set(extractAssetUrlsFromResources(finalContent as any));
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

    setSuccessMessage("Resources page content saved successfully!");
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
    { id: "stories", label: "Featured Stories" },
    { id: "gallery", label: "Projects Gallery" },
    { id: "facilities", label: "Orphanage & Oldage Home" },
    { id: "reports", label: "Annual Reports" },
  ];

  return (
    <div className="px-4 sm:px-6 py-12 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center font-sans!">
          Resources Page Management
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
                          "resources/hero",
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
                          "resources/hero",
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

          {/* Featured Stories Section */}
          {activeTab === "stories" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Featured Stories</h2>
                <button
                  onClick={addStory}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Story
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Section Heading</label>
                <input
                  type="text"
                  value={content.featuredStories.heading}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    featuredStories: { ...prev.featuredStories, heading: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Section Subheading</label>
                <input
                  type="text"
                  value={content.featuredStories.subheading}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    featuredStories: { ...prev.featuredStories, subheading: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              {storyPostsData.map((story, idx) => (
                <div key={story.id} className="border p-5 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">Story #{idx + 1}</h3>
                    <button
                      onClick={() => removeStory(idx)}
                      className="px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove Story
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Slug (URL path)</label>
                      <input
                        type="text"
                        value={story.slug}
                        onChange={(e) => updateStory(idx, "slug", normalizeTag(e.target.value))}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        placeholder="e.g., empowering-women-through-education"
                      />
                      <p className="text-base! text-gray-500 mt-1">Used for the story detail page URL</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={story.title}
                        onChange={(e) => updateStory(idx, "title", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Excerpt</label>
                      <textarea
                        value={story.excerpt}
                        onChange={(e) => updateStory(idx, "excerpt", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 scrollable-description"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        type="date"
                        value={(() => {
                          const parsedDate = parseDateFromString(story.date);
                          if (parsedDate && !isNaN(parsedDate.getTime())) {
                            const year = parsedDate.getFullYear();
                            const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                            const day = String(parsedDate.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          }
                          return "";
                        })()}
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          if (dateValue) {
                            const [year, month, day] = dateValue.split('-').map(Number);
                            const date = new Date(year, month - 1, day);
                            if (!isNaN(date.getTime())) {
                              updateStory(idx, "date", formatDateToDisplay(date));
                            }
                          }
                        }}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                      {story.date && (
                        <p className="text-base! text-green-600 mt-1">
                          Formatted: {story.date}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Read Time</label>
                      <input
                        type="text"
                        value={story.readTime}
                        onChange={(e) => updateStory(idx, "readTime", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        placeholder="e.g., 5 min read"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Story Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files?.[0]) return;
                          setUploading(true);
                          try {
                            const result = await uploadAsset(
                              e.target.files[0],
                              "resources/stories",
                              (p) => setUploadProgress(prev => ({ ...prev, [`story_${idx}`]: p })),
                              story.image,
                              story.imageFileId
                            );
                            updateStory(idx, "imageFileId", result.fileId);
                            updateStory(idx, "image", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`story_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                        className="hidden"
                        id={`story-image-${idx}`}
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
                              "resources/stories",
                              (p) => setUploadProgress(prev => ({ ...prev, [`story_${idx}`]: p })),
                              story.image,
                              story.imageFileId
                            );
                            updateStory(idx, "imageFileId", result.fileId);
                            updateStory(idx, "image", result.url);
                          } catch (err) {
                            setErrorMessage("Image upload failed");
                          } finally {
                            setUploading(false);
                            setUploadProgress(prev => {
                              const newPrev = { ...prev };
                              delete newPrev[`story_${idx}`];
                              return newPrev;
                            });
                          }
                        }}
                      >
                        <label
                          htmlFor={`story-image-${idx}`}
                          className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                        >
                          Click or drag image here
                        </label>
                      </div>
                      
                      {uploadProgress[`story_${idx}`] !== undefined && (
                        <div className="mt-2">
                          <div className="h-2 w-full bg-gray-200">
                            <div
                              className="h-2 bg-[#004265] transition-all"
                              style={{ width: `${uploadProgress[`story_${idx}`]}%` }}
                            />
                          </div>
                          <p className="text-xs mt-1">Uploading… {uploadProgress[`story_${idx}`]}%</p>
                        </div>
                      )}
                      {story.image && (
                        <div className="mt-4">
                          <img src={story.image} alt={story.title} className="max-h-48 border object-cover" />
                          <button
                            onClick={() => {
                              updateStory(idx, "image", "");
                              updateStory(idx, "imageFileId", "");
                            }}
                            className="mt-2 px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={() => {
                          setEditingStorySlug(story.slug);
                          setStoryContent(story.content || "");
                        }}
                        className="px-4 py-2 border border-blue-500 text-blue-500 text-sm hover:bg-blue-50"
                      >
                        Edit Detailed Story Content
                      </button>
                    </div>

                    {editingStorySlug === story.slug && (
                      <div className="mt-4 p-4 border rounded bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg">Detailed Content for: {story.title}</h4>
                          <button
                            onClick={() => setEditingStorySlug(null)}
                            className="px-3 py-1 border border-gray-400 text-gray-600 hover:bg-gray-100"
                          >
                            Close
                          </button>
                        </div>
                        
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-base! text-blue-800">
                            <strong>Note:</strong> This detailed post will use the story image shown above.
                          </p>
                          {story.image && (
                            <div className="mt-2">
                              <img 
                                src={story.image} 
                                alt={story.title} 
                                className="max-h-32 border object-cover"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Post Content (HTML supported)</label>
                          <textarea
                            value={storyContent}
                            onChange={(e) => setStoryContent(e.target.value)}
                            rows={15}
                            className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2 font-mono text-sm"
                            placeholder="Enter detailed story content here. HTML formatting is supported."
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveStoryPost(story.slug)}
                            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700"
                          >
                            Save Story Content
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects Gallery Section */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Projects Gallery</h2>
                <button
                  onClick={addGallerySection}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Gallery Section
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Section Heading</label>
                <input
                  type="text"
                  value={content.projectsGallery.heading}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    projectsGallery: { ...prev.projectsGallery, heading: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              {content.projectsGallery.sections.map((section, sectionIdx) => (
                <div key={sectionIdx} className="border p-5 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">Gallery Section #{sectionIdx + 1}</h3>
                    <button
                      onClick={() => removeGallerySection(sectionIdx)}
                      className="px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove Section
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Title</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateGallerySection(sectionIdx, "title", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Gallery Images</label>
                        <button
                          onClick={() => addGalleryImage(sectionIdx)}
                          className="px-3 py-1 border text-sm hover:bg-gray-50"
                        >
                          + Add Image
                        </button>
                      </div>
                      
                      {section.images.map((image, imgIdx) => (
                        <div key={imgIdx} className="mb-4 p-4 border rounded">
                          <div className="flex justify-between items-start mb-2">
                            <label className="text-sm font-medium">Image #{imgIdx + 1}</label>
                            <button
                              onClick={() => removeGalleryImage(sectionIdx, imgIdx)}
                              className="px-2 py-1 border border-red-500 text-red-500 text-xs hover:bg-red-50"
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
                                  "resources/gallery",
                                  (p) => setUploadProgress(prev => ({ ...prev, [`gallery_${sectionIdx}_${imgIdx}`]: p })),
                                  section.images[imgIdx],
                                  section.imageFileIds?.[imgIdx]
                                );
                                
                                const updated = [...content.projectsGallery.sections];
                                updated[sectionIdx].images[imgIdx] = result.url;
                                if (updated[sectionIdx].imageFileIds) {
                                  updated[sectionIdx].imageFileIds[imgIdx] = result.fileId;
                                }
                                setContent(prev => ({
                                  ...prev,
                                  projectsGallery: { ...prev.projectsGallery, sections: updated }
                                }));
                              } catch (err) {
                                setErrorMessage("Image upload failed");
                              } finally {
                                setUploading(false);
                                setUploadProgress(prev => {
                                  const newPrev = { ...prev };
                                  delete newPrev[`gallery_${sectionIdx}_${imgIdx}`];
                                  return newPrev;
                                });
                              }
                            }}
                            className="hidden"
                            id={`gallery-image-${sectionIdx}-${imgIdx}`}
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
                                  "resources/gallery",
                                  (p) => setUploadProgress(prev => ({ ...prev, [`gallery_${sectionIdx}_${imgIdx}`]: p })),
                                  section.images[imgIdx],
                                  section.imageFileIds?.[imgIdx]
                                );
                                
                                const updated = [...content.projectsGallery.sections];
                                updated[sectionIdx].images[imgIdx] = result.url;
                                if (updated[sectionIdx].imageFileIds) {
                                  updated[sectionIdx].imageFileIds[imgIdx] = result.fileId;
                                }
                                setContent(prev => ({
                                  ...prev,
                                  projectsGallery: { ...prev.projectsGallery, sections: updated }
                                }));
                              } catch (err) {
                                setErrorMessage("Image upload failed");
                              } finally {
                                setUploading(false);
                                setUploadProgress(prev => {
                                  const newPrev = { ...prev };
                                  delete newPrev[`gallery_${sectionIdx}_${imgIdx}`];
                                  return newPrev;
                                });
                              }
                            }}
                          >
                            <label
                              htmlFor={`gallery-image-${sectionIdx}-${imgIdx}`}
                              className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                            >
                              Click or drag image here
                            </label>
                          </div>
                          
                          {uploadProgress[`gallery_${sectionIdx}_${imgIdx}`] !== undefined && (
                            <div className="mt-2">
                              <div className="h-2 w-full bg-gray-200">
                                <div
                                  className="h-2 bg-[#004265] transition-all"
                                  style={{ width: `${uploadProgress[`gallery_${sectionIdx}_${imgIdx}`]}%` }}
                                />
                              </div>
                              <p className="text-xs mt-1">Uploading… {uploadProgress[`gallery_${sectionIdx}_${imgIdx}`]}%</p>
                            </div>
                          )}
                          
                          {image && (
                            <div className="mt-4">
                              <img src={image} alt={`Gallery ${sectionIdx + 1} Image ${imgIdx + 1}`} className="max-h-32 border object-cover" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orphanage & Oldage Home Section */}
          {activeTab === "facilities" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Orphanage & Oldage Home</h2>
                <button
                  onClick={addFacilitySection}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Facility Section
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Section Heading</label>
                <input
                  type="text"
                  value={content.orphanageOldageHome.heading}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    orphanageOldageHome: { ...prev.orphanageOldageHome, heading: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                />
              </div>

              {content.orphanageOldageHome.sections.map((section, sectionIdx) => (
                <div key={sectionIdx} className="border p-5 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">Facility Section #{sectionIdx + 1}</h3>
                    <button
                      onClick={() => removeFacilitySection(sectionIdx)}
                      className="px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove Section
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Facility Title</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateFacilitySection(sectionIdx, "title", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Facility Images</label>
                        <button
                          onClick={() => addFacilityImage(sectionIdx)}
                          className="px-3 py-1 border text-sm hover:bg-gray-50"
                        >
                          + Add Image
                        </button>
                      </div>
                      
                      {section.images.map((image, imgIdx) => (
                        <div key={imgIdx} className="mb-4 p-4 border rounded">
                          <div className="flex justify-between items-start mb-2">
                            <label className="text-sm font-medium">Image #{imgIdx + 1}</label>
                            <button
                              onClick={() => removeFacilityImage(sectionIdx, imgIdx)}
                              className="px-2 py-1 border border-red-500 text-red-500 text-xs hover:bg-red-50"
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
                                  "resources/facilities",
                                  (p) => setUploadProgress(prev => ({ ...prev, [`facility_${sectionIdx}_${imgIdx}`]: p })),
                                  section.images[imgIdx],
                                  section.imageFileIds?.[imgIdx]
                                );
                                
                                const updated = [...content.orphanageOldageHome.sections];
                                updated[sectionIdx].images[imgIdx] = result.url;
                                if (updated[sectionIdx].imageFileIds) {
                                  updated[sectionIdx].imageFileIds[imgIdx] = result.fileId;
                                }
                                setContent(prev => ({
                                  ...prev,
                                  orphanageOldageHome: { ...prev.orphanageOldageHome, sections: updated }
                                }));
                              } catch (err) {
                                setErrorMessage("Image upload failed");
                              } finally {
                                setUploading(false);
                                setUploadProgress(prev => {
                                  const newPrev = { ...prev };
                                  delete newPrev[`facility_${sectionIdx}_${imgIdx}`];
                                  return newPrev;
                                });
                              }
                            }}
                            className="hidden"
                            id={`facility-image-${sectionIdx}-${imgIdx}`}
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
                                  "resources/facilities",
                                  (p) => setUploadProgress(prev => ({ ...prev, [`facility_${sectionIdx}_${imgIdx}`]: p })),
                                  section.images[imgIdx],
                                  section.imageFileIds?.[imgIdx]
                                );
                                
                                const updated = [...content.orphanageOldageHome.sections];
                                updated[sectionIdx].images[imgIdx] = result.url;
                                if (updated[sectionIdx].imageFileIds) {
                                  updated[sectionIdx].imageFileIds[imgIdx] = result.fileId;
                                }
                                setContent(prev => ({
                                  ...prev,
                                  orphanageOldageHome: { ...prev.orphanageOldageHome, sections: updated }
                                }));
                              } catch (err) {
                                setErrorMessage("Image upload failed");
                              } finally {
                                setUploading(false);
                                setUploadProgress(prev => {
                                  const newPrev = { ...prev };
                                  delete newPrev[`facility_${sectionIdx}_${imgIdx}`];
                                  return newPrev;
                                });
                              }
                            }}
                          >
                            <label
                              htmlFor={`facility-image-${sectionIdx}-${imgIdx}`}
                              className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed cursor-pointer hover:bg-gray-50"
                            >
                              Click or drag image here
                            </label>
                          </div>
                          
                          {uploadProgress[`facility_${sectionIdx}_${imgIdx}`] !== undefined && (
                            <div className="mt-2">
                              <div className="h-2 w-full bg-gray-200">
                                <div
                                  className="h-2 bg-[#004265] transition-all"
                                  style={{ width: `${uploadProgress[`facility_${sectionIdx}_${imgIdx}`]}%` }}
                                />
                              </div>
                              <p className="text-xs mt-1">Uploading… {uploadProgress[`facility_${sectionIdx}_${imgIdx}`]}%</p>
                            </div>
                          )}
                          
                          {image && (
                            <div className="mt-4">
                              <img src={image} alt={`Facility ${sectionIdx + 1} Image ${imgIdx + 1}`} className="max-h-32 border object-cover" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Annual Reports Section */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-medium font-sans!">Annual Reports</h2>
                <button
                  onClick={addReport}
                  className="px-4 py-2 border font-medium hover:bg-gray-50"
                >
                  + Add Report
                </button>
              </div>

              {content.annualReports.reports.map((report, idx) => (
                <div key={idx} className="border p-5 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold">Report #{idx + 1}</h3>
                    <button
                      onClick={() => removeReport(idx)}
                      className="px-3 py-1 border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Year</label>
                      <input
                        type="number"
                        value={report.year}
                        onChange={(e) => updateReport(idx, "year", parseInt(e.target.value))}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">PDF URL</label>
                      <input
                        type="text"
                        value={report.url}
                        onChange={(e) => updateReport(idx, "url", e.target.value)}
                        className="w-full px-4 py-2 border bg-white focus:outline-none focus:ring-2"
                        placeholder="/path/to/report.pdf"
                      />
                    </div>
                  </div>
                </div>
              ))}
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