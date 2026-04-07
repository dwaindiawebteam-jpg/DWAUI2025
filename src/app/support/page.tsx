// app/support/page.tsx (or wherever your SupportPage is)
import React from 'react';
import Causes from '@/components/support/Causes';
import EntireWorld from '@/components/support/EntireWorld';
import HeroSection from '@/components/HeroSection';
import InfoForm from '@/components/InfoForm';
import { getSupportContent } from '@/lib/getSupportContent';

const SupportPage: React.FC = async () => {
  // Fetch content from Firestore
  const supportContent = await getSupportContent();
  
  return (
    <main className="">
      <HeroSection
        imageSrc={supportContent.heroSection.image}
        imageAlt={supportContent.heroSection.imageAlt}
        belowSectionBackground={supportContent.heroSection.belowSectionBackground}
        belowText={{
          title: supportContent.heroSection.belowText.title,
          titleColor: supportContent.heroSection.belowText.titleColor,
          content: supportContent.heroSection.belowText.content,
        }}
      />
      <Causes 
        causesDetails={supportContent.causes.causesList}
      />
      <EntireWorld 
        text={supportContent.entireWorld.text}
      />
      {supportContent.infoForm.enabled && <InfoForm />}
    </main>
  );
};

export default SupportPage;