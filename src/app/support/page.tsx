import React from 'react';
import Causes from '@/components/support/Causes';
import EntireWorld from '@/components/support/EntireWorld';
import GetInvolved from '@/components/support/GetInvolved-d';
import HeroSection from '@/components/HeroSection';
import InfoForm from '@/components/support/InfoForm';

const SupportPage: React.FC = () => {
  return (
    <main className="">
      <HeroSection
        imageSrc="/images/supportpage/hero-img.png"
        imageAlt="farmers from Dalit community"
        belowText={{
          title: "Support Our Cause!",
          titleColor: "#004265",
          content: [
            {
              text: `DALIT WELFARE is a grassroot NGO working directly with Dalit communities in tribal and rural regions of Nandyal & Kurnnol districts.`,
              color: "black",
            },
          ],
        }}
      />
      <Causes />
      <EntireWorld />
      <InfoForm />
      <GetInvolved />
    </main>
  );
};

export default SupportPage;