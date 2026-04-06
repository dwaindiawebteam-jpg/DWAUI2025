// lib/getResourcesContent.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { 
  ResourcesContent, 
  StoryPost,
  GallerySection,
  FacilitySection,
  AnnualReport
} from "@/types/resources";

const DEFAULT_RESOURCES_CONTENT: ResourcesContent = {
  heroSection: {
    image: "/images/resourcespage/resources page header image.png",
    imageFileId: "",
    imageAlt: "school kids from Dalit community",
    belowSectionBackground: "#FD7E14",
    belowText: {
      title: "DWA Resources",
      titleColor: "#000000",
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
    stories: [],
  },
  projectsGallery: {
    heading: "Projects Gallery",
    sections: [],
  },
  orphanageOldageHome: {
    heading: "Orphanage & Oldage Home",
    sections: [],
  },
  annualReports: {
    reports: [],
  },
  infoForm: {
    enabled: true,
  },
};

export async function getResourcesContent(): Promise<ResourcesContent> {
  try {
    const docRef = doc(db, "siteContent", "resources");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as ResourcesContent;
      return {
        ...DEFAULT_RESOURCES_CONTENT,
        ...data,
        featuredStories: {
          ...DEFAULT_RESOURCES_CONTENT.featuredStories,
          ...data.featuredStories,
          stories: data.featuredStories?.stories || [],
        },
        projectsGallery: {
          ...DEFAULT_RESOURCES_CONTENT.projectsGallery,
          ...data.projectsGallery,
          sections: data.projectsGallery?.sections || [],
        },
        orphanageOldageHome: {
          ...DEFAULT_RESOURCES_CONTENT.orphanageOldageHome,
          ...data.orphanageOldageHome,
          sections: data.orphanageOldageHome?.sections || [],
        },
        annualReports: {
          reports: data.annualReports?.reports || [],
        },
      };
    }
    
    return DEFAULT_RESOURCES_CONTENT;
  } catch (error) {
    console.error("Error fetching resources content:", error);
    return DEFAULT_RESOURCES_CONTENT;
  }
}

// Optional: Fetch individual story posts if needed
export async function getStoryPosts(): Promise<StoryPost[]> {
  try {
    const resourcesContent = await getResourcesContent();
    return resourcesContent.featuredStories?.stories || [];
  } catch (error) {
    console.error("Error fetching story posts:", error);
    return [];
  }
}

// Fetch gallery sections
export async function getGallerySections(): Promise<GallerySection[]> {
  try {
    const resourcesContent = await getResourcesContent();
    return resourcesContent.projectsGallery?.sections || [];
  } catch (error) {
    console.error("Error fetching gallery sections:", error);
    return [];
  }
}

// Fetch facility sections
export async function getFacilitySections(): Promise<FacilitySection[]> {
  try {
    const resourcesContent = await getResourcesContent();
    return resourcesContent.orphanageOldageHome?.sections || [];
  } catch (error) {
    console.error("Error fetching facility sections:", error);
    return [];
  }
}

// Fetch annual reports
export async function getAnnualReports(): Promise<AnnualReport[]> {
  try {
    const resourcesContent = await getResourcesContent();
    return resourcesContent.annualReports?.reports || [];
  } catch (error) {
    console.error("Error fetching annual reports:", error);
    return [];
  }
}