// types/support.ts
export interface SupportCause {
  id: number;  // Changed from string to number to match your initial data
  title: string;
  details: string;
  imageSrc: string;
  imageAlt: string;
  imageFileId: string;
}

export interface SupportContent {
  heroSection: {
    image: string;
    imageFileId: string;
    imageAlt: string;
    belowSectionBackground: string;  // Added this field
    belowText: {
      title: string;
      titleColor: string;
      content: Array<{
        text: string;
        weight?: "normal" | "bold" | "light" | "medium" | "semibold";
        color?: string;
      }>;
    };
  };
  causes: {
    causesList: SupportCause[];  // Changed from "causes" to "causesList" to match admin code
  };
  entireWorld: {
    text: string;
  };
  infoForm: {
    enabled: boolean;
  };
}