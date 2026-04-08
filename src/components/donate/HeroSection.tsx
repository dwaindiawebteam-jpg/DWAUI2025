import React from 'react';
import Image from "next/image";

// Define the props interface for the component
interface HeroSectionProps {
  imageSrc?: string;
  imageAlt?: string;
  imageHeight?: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  imageSrc = "/images/homepage/HomepageChildrenImage.jpg",
  imageAlt = "Children from Dalit communities",
  imageHeight = 500,
}) => {

  return (
    <section className="bg-white">
      {/* Hero Image */}
      <div
        className="w-full relative"
        style={{ height: `${imageHeight}px` }}
        >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover object-center grayscale"
          priority
          sizes="100vw"
          style={{ objectPosition: "center 30%" }}
        />
      </div>
    </section>
  );
};

export default HeroSection;