// app/donate/page.tsx
import React from "react";
import HeroSection from "@/components/donate/HeroSection";
import DualContentBlock from "@/components/donate/DualContentBlock";
import BodyComponent from "@/components/donate/BodySection";
import InfoForm from "@/components/InfoForm";
import { getDonateContent } from "@/lib/getDonateContent";

export default async function DonatePage() {
  // Fetch content from Firestore
  const donateContent = await getDonateContent();
  
  // Check if content exists and has required data
  const hasContent = donateContent && 
    donateContent.heroSection && 
    donateContent.dualContentBlock;

  // Hero Section Data with defaults
  const heroData = donateContent?.heroSection || {
    image: "/images/donatepage/DonatepageChildrenImage.png",
    imageAlt: "Children from Dalit community",
  };

  // Dual Content Block Data with defaults
  const dualContentData = donateContent?.dualContentBlock || {
    left: {
      title: "For Indian Donors",
      titleColor: "#000000",
      bgColor: "bg-yellow",
      type: "image" as const,
      content: {
        imageSrc: "/images/donatepage/QR_code.png",
        imageAlt: "QR_code",
      },
    },
    right: {
      title: "For International Donors",
      titleColor: "#000000",
      bgColor: "#FFFFFF",
      content: [
        {
          text: "Razorpay",
          bgColor: "bg-blue/60",
          url: "/apply"
        },
        {
          text: "Stripe",
          bgColor: "bg-purple/60",
          url: "/apply"
        }
      ]
    },
  };

  // Privacy Policy Data with defaults
  const privacyPolicyData = donateContent?.privacyPolicy || {
    title: "Privacy Policy",
    content: {
      text: "At Dalit Welfare Association, we respect your privacy. Any personal information shared through our website, donations, or newsletters is kept secure and never shared with third parties. We use your data only to improve services, provide updates, and maintain transparent communication with our supporters.",
    },
    bgColor: "bg-pink/50",
  };

  // Refund Policy Data with defaults
  const refundPolicyData = donateContent?.refundPolicy || {
    title: "Refund Policy",
    content: {
      text: "All donations made to Dalit Welfare Association are non-refundable, as they are immediately directed toward our community programs. However, if you made an error in your contribution, please contact us within one week. We will carefully review refund requests raised during this period.",
    },
    bgColor: "bg-blue/50",
  };

  return (
    <main>
      {!hasContent && (
        <div className="text-center py-16 px-4">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl text-center mb-4">Donation Options Coming Soon</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our donation page information is being prepared. We're setting up secure payment options and 
            donation methods. Please check back later to support our cause.
          </p>
        </div>
      )}

      {hasContent && (
        <>
          <HeroSection 
            imageSrc={heroData.image}
            imageAlt={heroData.imageAlt}
          />

          <DualContentBlock
            left={dualContentData.left}
            right={dualContentData.right}
          />
          
          <BodyComponent
            title={privacyPolicyData.title}
            content={privacyPolicyData.content}
            bgColor={privacyPolicyData.bgColor}
          />
          
          <BodyComponent
            title={refundPolicyData.title}
            content={refundPolicyData.content}
            bgColor={refundPolicyData.bgColor}
          />

          {donateContent?.infoForm?.enabled && <InfoForm />}
        </>
      )}
    </main>
  );
}