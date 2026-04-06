// types/projects.ts
export interface ProjectsTextSegment {
  text: string;
  weight?: "normal" | "bold" | "light" | "medium" | "semibold";
  color?: string;
}

export interface ProjectsHeroSection {
  image: string;
  imageFileId: string;
  imageAlt: string;
  belowText: {
    title: string;
    titleColor: string;
    content: ProjectsTextSegment[];
  };
}

export interface ProjectsDualContentRow {
  label: ProjectsTextSegment;
  value: ProjectsTextSegment;
}

export interface ProjectsDualContentItem {
  title: string;
  titleSize?: string;
  type: "paragraph" | "list";
  bgColor: string;
  titleColor: string;
  rows: ProjectsDualContentRow[];
}

export interface ProjectsDualContentBlock {
  left: ProjectsDualContentItem;
  right: ProjectsDualContentItem;
}

export interface ProjectsTestimonial {
  name: string;
  title: string;
  text: string;
  splatterImage: string;
  splatterImageFileId: string;
}

export interface ProjectsTestimonialsSection {
  heading: string;
  testimonials: ProjectsTestimonial[];
}

export interface ProjectsImageDivider {
  image: string;
  imageFileId: string;
  imageAlt: string;
}

export interface ProjectsPartnersSection {
  title: string;
  partners: string[];
}

export interface OngoingProject {
  id: string;
  title: string;
  description: string;
  image: string;
  imageFileId: string;
  slug: string;
  date: string; // Add this field - can be start date, year, or any date string
}

export interface OngoingProjectsSection {
  title: string;
  projects: OngoingProject[];
}

export interface ProjectsContent {
  heroSection: ProjectsHeroSection;
  ongoingProjects: OngoingProjectsSection;
  dualContentBlock: ProjectsDualContentBlock;
  testimonials: ProjectsTestimonialsSection;
  imageDivider: ProjectsImageDivider;
  partners: ProjectsPartnersSection;
}

// Add this new interface after your existing interfaces
export interface ProjectPost {
  slug: string;
  title: string;
  description: string;
  date: string; // formatted date string like "20 August 2025"
  content: string; // HTML or markdown content for the detailed post
  createdAt?: Date;
  updatedAt?: Date;
}