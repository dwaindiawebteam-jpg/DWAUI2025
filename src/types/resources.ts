// types/resources.ts

export interface ResourcesTextSegment {
  text: string;
  weight?: "normal" | "bold" | "light" | "medium" | "semibold";
  color?: string;
}

export interface HeroSection {
  image: string;
  imageFileId: string;
  imageAlt: string;
  belowSectionBackground: string;
  belowText: {
    title: string;
    titleColor: string;
    content: ResourcesTextSegment[];
  };
}

export interface StoryPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  imageFileId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FeaturedStories {
  heading: string;
  subheading: string;
  stories: StoryPost[];
}

export interface GallerySection {
  title: string;
  images: string[];
  imageFileIds: string[];
}

export interface ProjectsGallery {
  heading: string;
  sections: GallerySection[];
}

export interface FacilitySection {
  title: string;
  images: string[];
  imageFileIds: string[];
}

export interface OrphanageOldageHome {
  heading: string;
  sections: FacilitySection[];
}

export interface AnnualReport {
  year: number;
  url: string;
}

export interface AnnualReports {
  reports: AnnualReport[];
}

export interface InfoForm {
  enabled: boolean;
}

export interface ResourcesContent {
  heroSection: HeroSection;
  featuredStories: FeaturedStories;
  projectsGallery: ProjectsGallery;
  orphanageOldageHome: OrphanageOldageHome;
  annualReports: AnnualReports;
  infoForm: InfoForm;
}