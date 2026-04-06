import type { HomeContent } from "@/types/home";
import type { AboutContent } from "@/types/about";
import type { ProjectsContent } from "@/types/projects";
import type { ResourcesContent } from "@/types/resources";

// Types for the new homepage structure
interface NewHomeContent {
  heroSection: {
    image?: string;  // Add hero image field
    // ... other hero fields
  };
  dualContentBlock: any;
  programs: {
    items: Array<{
      image: string;
    }>;
  };
  impactStats: any;
  testimonials: Array<{
    splatterImage: string;
  }>;
  featuredProjects: {
    leftProjects: Array<{
      image?: string;  // Add project image field
    }>;
    // ... other featuredProjects fields
  };
  benevityBoard: {
    splatterImages: string[];
    boardMembers: Array<{
      image: string;
    }>;
  };
  whyTrustUs: any;
  partners: any;
}

/**
 * Extracts all R2 asset URLs referenced by Home content.
 * Used for safe asset garbage collection.
 */
export function extractAssetUrlsFromHome(content: NewHomeContent): string[] {
  const urls: string[] = [];

  // Hero section image
  if (content.heroSection?.image) {
    urls.push(content.heroSection.image);
  }

  // Programs
    if (content.programs?.items) {
    content.programs.items.forEach(item => {
      if (item.image) {
        urls.push(item.image);
      }
    });
  }

  // Testimonials
  if (content.testimonials) {
    content.testimonials.forEach(item => {
      if (item.splatterImage) {
        urls.push(item.splatterImage);
      }
    });
  }

  // Benevity splatter images
   if (content.benevityBoard?.splatterImages) {
    content.benevityBoard.splatterImages.forEach(img => {
      if (img) {
        urls.push(img);
      }
    });
  }
  // Board members
    if (content.benevityBoard?.boardMembers) {
    content.benevityBoard.boardMembers.forEach(member => {
      if (member.image) {
        urls.push(member.image);
      }
    });
  }

  // Featured projects images
  if (content.featuredProjects?.leftProjects) {
    content.featuredProjects.leftProjects.forEach(project => {
      if (project.image) urls.push(project.image);
    });
  }

  return [...new Set(urls)];
}

export function extractAssetUrlsFromAbout(content: AboutContent): string[] {
  const urls: string[] = [];

  // Hero section image
  if (content.heroSection?.image) {
    urls.push(content.heroSection.image);
  }

  // Accreditations logos
  if (content.accreditations?.logos) {
    content.accreditations.logos.forEach(logo => {
      if (logo) urls.push(logo);
    });
  }

  // Team members
  if (content.team?.teamMembers) {
    content.team.teamMembers.forEach(member => {
      if (member.image) urls.push(member.image);
    });
  }

  // Volunteers
  if (content.volunteers?.volunteers) {
    content.volunteers.volunteers.forEach(volunteer => {
      if (volunteer.image) urls.push(volunteer.image);
    });
  }

  // President message image
  if (content.presidentMessage?.image) {
    urls.push(content.presidentMessage.image);
  }

  return [...new Set(urls)];
}

// lib/extractAssetUrls.ts (add projects extraction)
export function extractAssetUrlsFromProjects(content: ProjectsContent): string[] {
  const urls: string[] = [];

  // Hero section image
  if (content.heroSection?.image) {
    urls.push(content.heroSection.image);
  }

  // Ongoing projects images
  if (content.ongoingProjects?.projects) {
    content.ongoingProjects.projects.forEach(project => {
      if (project.image) {
        urls.push(project.image);
      }
    });
  }

  // Testimonials splatter images
  if (content.testimonials?.testimonials) {
    content.testimonials.testimonials.forEach(testimonial => {
      if (testimonial.splatterImage) {
        urls.push(testimonial.splatterImage);
      }
    });
  }

  // Image divider
  if (content.imageDivider?.image) {
    urls.push(content.imageDivider.image);
  }

  return [...new Set(urls)];
}

export function extractAssetUrlsFromResources(content: ResourcesContent): string[] {
  const urls: string[] = [];

  // Hero section image
  if (content.heroSection?.image) {
    urls.push(content.heroSection.image);
  }

  // Featured stories images
  if (content.featuredStories?.stories) {
    content.featuredStories.stories.forEach(story => {
      if (story.image) {
        urls.push(story.image);
      }
    });
  }

  // Projects gallery images
  if (content.projectsGallery?.sections) {
    content.projectsGallery.sections.forEach(section => {
      if (section.images) {
        section.images.forEach(image => {
          if (image) urls.push(image);
        });
      }
    });
  }

  // Orphanage & Oldage Home images
  if (content.orphanageOldageHome?.sections) {
    content.orphanageOldageHome.sections.forEach(section => {
      if (section.images) {
        section.images.forEach(image => {
          if (image) urls.push(image);
        });
      }
    });
  }

  return [...new Set(urls)];
}