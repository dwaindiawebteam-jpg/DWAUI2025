// app/support/page.tsx
import React from 'react';
import Causes from '@/components/support/Causes';
import EntireWorld from '@/components/support/EntireWorld';
import HeroSection from '@/components/HeroSection';
import InfoForm from '@/components/InfoForm';
import { getSupportContent } from '@/lib/getSupportContent';

const SupportPage: React.FC = async () => {
  // Fetch content from Firestore
  const supportContent = await getSupportContent();
  
  // Check if content exists and has required data
  const hasContent = supportContent && 
    supportContent.heroSection && 
    supportContent.causes?.causesList?.length > 0;

  // Hero Section Data with defaults
  const heroData = supportContent?.heroSection || {
    image: "/images/supportpage/hero-img.png",
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
  };

  // Causes Data with defaults
  const causesData = supportContent?.causes || {
    causesList: []
  };

  // Entire World Quote Data with defaults
  const quoteData = supportContent?.entireWorld || {
    text: "Whoever saves one life, saves the entire world."
  };

  return (
    <main className="">
      {!hasContent && (
        <div className="text-center py-16 px-4">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl text-center mb-4">Support Content Coming Soon</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our support page information is being prepared. We're working on bringing you meaningful ways to 
            contribute to our cause. Please check back later.
          </p>
        </div>
      )}

      {hasContent && (
        <>
          <HeroSection
            imageSrc={heroData.image}
            imageAlt={heroData.imageAlt}
            belowSectionBackground={heroData.belowSectionBackground}
            belowText={{
              title: heroData.belowText.title,
              titleColor: heroData.belowText.titleColor,
              content: heroData.belowText.content,
            }}
          />
          
          <Causes 
            causesDetails={causesData.causesList}
          />
          
          <EntireWorld 
            text={quoteData.text}
          />
          
          {supportContent?.infoForm?.enabled && <InfoForm />}
        </>
      )}
    </main>
  );
};

export default SupportPage;