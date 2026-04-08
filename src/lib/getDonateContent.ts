// lib/getDonateContent.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { DonateContent, DonateHeroSection, DonateDualContentBlock, DonatePolicyContent } from "@/types/donate";

const DEFAULT_DONATE_CONTENT: DonateContent = {
  heroSection: {
    image: "/images/donatepage/DonatepageChildrenImage.png",
    imageAlt: "Children from Dalit community",
    imageFileId: "",
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
          url: "/apply"
        },
        {
          text: "Stripe",
          bgColor: "bg-purple/60",
          url: "/apply"
        }
      ]
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
};

export async function getDonateContent(): Promise<DonateContent> {
  try {
    const docRef = doc(db, "siteContent", "donate");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as DonateContent;
      return {
        ...DEFAULT_DONATE_CONTENT,
        ...data,
        heroSection: {
          ...DEFAULT_DONATE_CONTENT.heroSection,
          ...data.heroSection,
        },
        dualContentBlock: {
          left: {
            ...DEFAULT_DONATE_CONTENT.dualContentBlock.left,
            ...data.dualContentBlock?.left,
            content: {
              ...DEFAULT_DONATE_CONTENT.dualContentBlock.left.content,
              ...data.dualContentBlock?.left?.content,
            },
          },
          right: {
            ...DEFAULT_DONATE_CONTENT.dualContentBlock.right,
            ...data.dualContentBlock?.right,
            content: data.dualContentBlock?.right?.content || DEFAULT_DONATE_CONTENT.dualContentBlock.right.content,
          },
        },
        privacyPolicy: {
          ...DEFAULT_DONATE_CONTENT.privacyPolicy,
          ...data.privacyPolicy,
          content: {
            ...DEFAULT_DONATE_CONTENT.privacyPolicy.content,
            ...data.privacyPolicy?.content,
          },
        },
        refundPolicy: {
          ...DEFAULT_DONATE_CONTENT.refundPolicy,
          ...data.refundPolicy,
          content: {
            ...DEFAULT_DONATE_CONTENT.refundPolicy.content,
            ...data.refundPolicy?.content,
          },
        },
        infoForm: {
          ...DEFAULT_DONATE_CONTENT.infoForm,
          ...data.infoForm,
        },
      };
    }
    
    return DEFAULT_DONATE_CONTENT;
  } catch (error) {
    console.error("Error fetching donate content:", error);
    return DEFAULT_DONATE_CONTENT;
  }
}
