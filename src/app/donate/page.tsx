import React from "react";
import HeroSection from "@/components/donate/HeroSection";
import DualContentBlock from "@/components/donate/DualContentBlock";
import BodyComponent from "@/components/donate/BodySection";
import InfoForm from "@/components/InfoForm";

export default async function DonatePage() {
  const heroImage = "/images/donatepage/DonatepageChildrenImage.png";

  const dualContentBlock = {
    left: {
      title: "For Indian Donors",
      titleColor: "#000000",
      bgColor: "bg-yellow",
			type:"image",
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
					bgColor: "bg-blue/60"
				},
				{
					text: "Stripe",
					bgColor: "bg-purple/60"
				}
			]
    },
  };

  const privacyPolicyContent = {
    title: "Privacy Policy",
    content: {
      text: "At Dalit Welfare Association, we respect your privacy. Any personal information shared through our website, donations, or newsletters is kept secure and never shared with third parties. We use your data only to improve services, provide updates, and maintain transparent communication with our supporters.",
    },
    bgColor: "bg-pink/50",
  };

  const refundPolicyContent = {
    title: "Refund Policy",
    content: {
      text: "All donations made to Dalit Welfare Association are non-refundable, as they are immediately directed toward our community programs. However, if you made an error in your contribution, please contact us within one week. We will carefully review refund requests raised during this period.",
    },
    bgColor: "bg-blue/50",
  };

  return (
    <main>
      <HeroSection imageSrc={heroImage} />

      <DualContentBlock
        left={dualContentBlock.left}
        right={dualContentBlock.right}
      />
      <BodyComponent
        title={privacyPolicyContent.title}
        content={privacyPolicyContent.content}
        bgColor={privacyPolicyContent.bgColor}
      />
      <BodyComponent
        title={refundPolicyContent.title}
        content={refundPolicyContent.content}
        bgColor={refundPolicyContent.bgColor}
      />

      <InfoForm />
    </main>
  );
}
