import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export interface FooterContent {
  instagram: string;
  linkedin: string;
  email: string;
  refundPolicyUrl: string;
  privacyPolicyUrl: string;
}

const DEFAULT_FOOTER_CONTENT: FooterContent = {
  instagram: "#",
  linkedin: "#",
  email: "info@dwalindia.org",
  refundPolicyUrl: "/refund-policy",
  privacyPolicyUrl: "/privacy-policy",
};

export async function getFooterContent(): Promise<FooterContent> {
  try {
    const ref = doc(db, "siteContent", "footer");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data() as FooterContent;
      return {
        ...DEFAULT_FOOTER_CONTENT,
        ...data,
      };
    }

    return DEFAULT_FOOTER_CONTENT;
  } catch (err) {
    return DEFAULT_FOOTER_CONTENT;
  }
}