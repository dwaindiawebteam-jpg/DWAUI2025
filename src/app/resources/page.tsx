// app/resources/page.tsx

export const revalidate = 60;

import HeroSection from "@/components/HeroSection";
import FeaturedStories from "@/components/resources/FeaturedStories";
import ProjectsGallery from "@/components/resources/ProjectsGallery";
import OrphanageOldageHome from "@/components/resources/OrphanageOldageHome";
import AnnualReports from "@/components/resources/AnnualReports";
import InfoForm from "@/components/InfoForm";
import Testimonials from "@/components/Testimonials";
import ImageDivider from "@/components/projects/ImageDivider";
import Partners from "@/components/Partners";
import { getResourcesContent } from "@/lib/getResourcesContent";

export default async function ResourcesPage() {
  const resourcesContent = await getResourcesContent();

  // Hero Section Data
  const heroData = resourcesContent?.heroSection || {
    image: "/images/resourcespage/resources page header image.png",
    imageAlt: "school kids from Dalit community",
    belowSectionBackground: "#FD7E14",
    belowText: {
      title: "DWA Resources",
      content: [
        {
          text: `The resources we share bring together knowledge, insights, and practical guidance from our network.
                    Whether you're a supporter, partner, or community member, you'll find tools here to help you learn, grow,
                    and make a difference..`,
          color: "black",
        },
      ],
    },
  };

  // Featured Stories Data
  const featuredStoriesData = resourcesContent?.featuredStories || {
    heading: "Featured Stories",
    subheading: "Stories of Hope & Resilience",
    stories: []
  };

  // Projects Gallery Data
  const projectsGalleryData = resourcesContent?.projectsGallery || {
    heading: "Projects Gallery",
    sections: []
  };

  // Orphanage & Oldage Home Data
  const orphanageOldageHomeData = resourcesContent?.orphanageOldageHome || {
    heading: "Orphanage & Oldage Home",
    sections: []
  };

  // Annual Reports Data
  const annualReportsData = resourcesContent?.annualReports || {
    reports: []
  };




  return (
    <main>
      {!resourcesContent && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl text-center mb-4">Resources Content Coming Soon</h2>
          <p>Our resources page information is being prepared. Please check back later.</p>
        </div>
      )}

      {resourcesContent && (
        <>
          <HeroSection
            imageSrc={heroData.image}
            imageAlt={heroData.imageAlt}
            belowSectionBackground={heroData.belowSectionBackground}
            belowText={heroData.belowText}
          />

          <FeaturedStories 
            stories={featuredStoriesData.stories}
            heading={featuredStoriesData.heading}
            subheading={featuredStoriesData.subheading}
          />

          <ProjectsGallery 
            sections={projectsGalleryData.sections}
            heading={projectsGalleryData.heading}
          />

          <OrphanageOldageHome 
            sections={orphanageOldageHomeData.sections}
            heading={orphanageOldageHomeData.heading}
          />

          <AnnualReports reports={annualReportsData.reports} />

          <InfoForm />
        </>
      )}
    </main>
  );
}