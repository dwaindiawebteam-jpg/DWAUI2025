// types/homeNew.ts

export interface TextSegment {
  text: string;
  weight?: "normal" | "bold" | "light" | "medium" | "semibold";
  color?: string;
}

export interface ProgramItem {
  id: number;
  title: string;
  description: string;
  image: string;
  imageFileId: string;
}

export interface TestimonialItem {
  name: string;
  title: string;
  text: string;
  splatterImage: string;
  splatterimageFileId: string;
}

export interface FeaturedProject {
  title: string;
  content: TextSegment[];
  image: string;  // ← ADD THIS
  imageFileId: string;  // ← ADD THIS
}

export interface RightNumber {
  label: string;
  value: string;
}

export interface BoardMember {
  name: string;
  role: string;
  image: string;
  imageFileId: string;  // ← ADD THIS
}

export interface WhyTrustUsContent {
  title: string;
  content: TextSegment[];
  bgColor: string;
}

interface DualContentBlock {
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
}

export interface HomeContent {
  heroSection: {
    content: TextSegment[];
    image?: string;  // ← ADD THIS
    imageFileId?: string;  // ← ADD THIS
  };
  dualContentBlock: DualContentBlock;
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
    splatterImageFileIds: string[];  // ← ADD THIS
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