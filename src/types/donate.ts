// types/donate.ts
export interface DonateDonorOption {
  text: string;
  bgColor: string;
  url: string;
}

export interface DonateLeftBlockImage {
  imageSrc: string;
  imageAlt: string;
  imageFileId?: string;
}

export interface DonateLeftBlock {
  title: string;
  titleColor: string;
  bgColor: string;
  type: "image";
  content: DonateLeftBlockImage;
}

export interface DonateRightBlock {
  title: string;
  titleColor: string;
  bgColor: string;
  content: DonateDonorOption[];
}

export interface DonateDualContentBlock {
  left: DonateLeftBlock;
  right: DonateRightBlock;
}

export interface DonatePolicyContent {
  title: string;
  content: {
    text: string;
  };
  bgColor: string;
}

export interface DonateHeroSection {
  image: string;
  imageFileId?: string;
  imageAlt: string;
}

export interface DonateContent {
  heroSection: DonateHeroSection;
  dualContentBlock: DonateDualContentBlock;
  privacyPolicy: DonatePolicyContent;
  refundPolicy: DonatePolicyContent;
  infoForm: {
    enabled: boolean;
  };
}