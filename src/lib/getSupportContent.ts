// lib/getSupportContent.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { SupportContent, SupportCause } from "@/types/support";

const DEFAULT_SUPPORT_CONTENT: SupportContent = {
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
};

export async function getSupportContent(): Promise<SupportContent> {
  try {
    const docRef = doc(db, "siteContent", "support");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as SupportContent;
      return {
        ...DEFAULT_SUPPORT_CONTENT,
        ...data,
        heroSection: {
          ...DEFAULT_SUPPORT_CONTENT.heroSection,
          ...data.heroSection,
          belowText: {
            ...DEFAULT_SUPPORT_CONTENT.heroSection.belowText,
            ...data.heroSection?.belowText,
            content: data.heroSection?.belowText?.content || DEFAULT_SUPPORT_CONTENT.heroSection.belowText.content,
          },
        },
        causes: {
          causesList: data.causes?.causesList || DEFAULT_SUPPORT_CONTENT.causes.causesList,
        },
        entireWorld: {
          ...DEFAULT_SUPPORT_CONTENT.entireWorld,
          ...data.entireWorld,
        },
        infoForm: {
          ...DEFAULT_SUPPORT_CONTENT.infoForm,
          ...data.infoForm,
        },
      };
    }
    
    return DEFAULT_SUPPORT_CONTENT;
  } catch (error) {
   // console.error("Error fetching support content:", error);
    return DEFAULT_SUPPORT_CONTENT;
  }
}

// Optional: Fetch only the causes list
export async function getSupportCauses(): Promise<SupportCause[]> {
  try {
    const supportContent = await getSupportContent();
    return supportContent.causes?.causesList || [];
  } catch (error) {
   // console.error("Error fetching support causes:", error);
    return [];
  }
}

// Fetch only the hero section data
export async function getSupportHeroSection(): Promise<SupportContent['heroSection']> {
  try {
    const supportContent = await getSupportContent();
    return supportContent.heroSection;
  } catch (error) {
   // console.error("Error fetching hero section:", error);
    return DEFAULT_SUPPORT_CONTENT.heroSection;
  }
}

// Fetch only the quote text
export async function getSupportQuote(): Promise<string> {
  try {
    const supportContent = await getSupportContent();
    return supportContent.entireWorld?.text || DEFAULT_SUPPORT_CONTENT.entireWorld.text;
  } catch (error) {
    // console.error("Error fetching quote:", error);
    return DEFAULT_SUPPORT_CONTENT.entireWorld.text;
  }
}