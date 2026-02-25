import Image from "next/image";
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="mt-6 w-full h-[600px] relative">
      <Image 
        src='/images/supportpage/hero-img.png'  
        alt="Children from Dalit communities"
        fill
        className="object-cover object-center grayscale"
        priority
      />
    </section>
  );
};

export default HeroSection;