import React, { Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import DualContentBlock from "@/components/DualContentBlock";
import ProgramsGrid from "@/components/home/ProgramsGrid";
import Testimonials from "@/components/Testimonials";
import ImpactStats from "@/components/ImpactStats";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import BenevityBoardSection from "@/components/home/BenevityBoardSection";
import WhyTrustUs from "@/components/home/WhyTrustUs";
import InfoForm from "@/components/InfoForm";
import Partners from "@/components/Partners";
import { getHomeContent } from "@/lib/getHomeContent";

export default async function Home(): Promise<React.JSX.Element> {
  // Fetch home content from Firestore
  const homeContent = await getHomeContent();

  // Use fetched data or fallback to empty/default data
  const heroContent = homeContent?.heroSection.content || [];
  const heroImage = homeContent?.heroSection.image || "/images/homepage/HomepageChildrenImage.jpg";
  
  
  const dualContentBlock = homeContent?.dualContentBlock || {
    left: {
      title: "Goals",
      titleColor: "#FFFFFF",
      bgColor: "bg-navy-blue",
      content: []
    },
    right: {
      title: "Objectives",
      titleColor: "#000000",
      bgColor: "bg-blue/50",
      content: []
    }
  };

  const programsData = homeContent?.programs.items || [];
  const programsTitle = homeContent?.programs.title || "Our Programs";
  
  const impactStats = homeContent?.impactStats || {
    bgColor: "bg-blue/50",
    textColor: "#004265",
    people: 0,
    villages: 0,
    programs: 0
  };
  
  const testimonials = homeContent?.testimonials || [];
  
  const featuredProjectsData = homeContent?.featuredProjects || {
    leftProjects: [],
    rightNumbers: []
  };
  
  const benevityBoardData = homeContent?.benevityBoard || {
    benevityTitle: "Benevity & Goodstack",
    benevityText: "Donate today through Benevity or Goodstack...",
    splatterImages: [],
    boardTitle: "Board Members",
    boardText: "Our board comprises passionate leaders...",
    boardMembers: []
  };
  
  const whyTrustUsData = homeContent?.whyTrustUs || {
    title: "Why Trust Us",
    content: [],
    bgColor: "#9FDFFC"
  };
  
  const partnersData = homeContent?.partners || {
    title: "Tech Partners",
    partners: []
  };

  return (
    <main>
      {/* Show loading or empty state if no content */}
      {!homeContent && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl text-center mb-4">Home Content Coming Soon</h2>
          <p>Our home page information is being prepared. Please check back later.</p>
        </div>
      )}

      {homeContent && (
        <>
          <HeroSection 
            imageSrc={heroImage}
            belowText={{
              content: heroContent
            }}
          />
          
          <DualContentBlock
            left={dualContentBlock.left}
            right={dualContentBlock.right}
          />
          
          {programsData.length > 0 && (
            <ProgramsGrid 
              programs={programsData}
              title={programsTitle}
            />
          )}
          
          <ImpactStats
            bgColor={impactStats.bgColor}
            textColor={impactStats.textColor}
            people={impactStats.people}
            villages={impactStats.villages}
            programs={impactStats.programs}
          />
          
          {testimonials.length > 0 && (
            <Testimonials testimonials={testimonials} />
          )}
          
          {featuredProjectsData.leftProjects.length > 0 && (
            <FeaturedProjects 
              leftProjects={featuredProjectsData.leftProjects}
              rightNumbers={featuredProjectsData.rightNumbers}
            />
          )}
          
          <BenevityBoardSection
            benevityTitle={benevityBoardData.benevityTitle}
            benevityText={benevityBoardData.benevityText}
            splatterImages={benevityBoardData.splatterImages}
            boardTitle={benevityBoardData.boardTitle}
            boardText={benevityBoardData.boardText}
            boardMembers={benevityBoardData.boardMembers}
          />
          
          <WhyTrustUs 
            title={whyTrustUsData.title}
            content={whyTrustUsData.content}
            bgColor={whyTrustUsData.bgColor}
          />
          
          {partnersData.partners.length > 0 && (
            <Partners 
              title={partnersData.title}
              partners={partnersData.partners}
            />
          )}
        </>
      )}
      
      <InfoForm />
    </main>
  );
}