import React from 'react';
import Image from "next/image";

// Define the weight type based on Tailwind's font weight classes
type FontWeight = "light" | "normal" | "medium" | "semibold" | "bold";

// Define the segment interface for text content
interface TextSegment {
  text: string;
  color?: string;
  weight?: FontWeight;
}

// Define the props interface for the component
interface HeroSectionProps {
  imageSrc?: string;
  imageAlt?: string;
  imageHeight?: number;
  belowSectionBackground?: string;
  belowText?: {
    title?: string;
    content?: TextSegment[];
    titleColor?: string;
    contentColor?: string;
    contentWeight?: FontWeight;
  };
}

const HeroSection: React.FC<HeroSectionProps> = ({
  imageSrc = "/images/homepage/HomepageChildrenImage.jpg",
  imageAlt = "Children from Dalit communities",
  imageHeight = 500,
  belowSectionBackground = "#FFFFFF",
  belowText = {},
}) => {
  // Map Tailwind-style weights to CSS font-weight values with proper typing
  const weightMap: Record<FontWeight, string> = {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  };

  // Merge user props with defaults
  const mergedBelowText = {
    title: "Dalit Welfare Association",
    content: [] as TextSegment[], // array of { text, color, weight } segments for a single paragraph
    titleColor: "#000000",
    contentColor: "#000000",
    contentWeight: "medium" as FontWeight, // default to Tailwind's font-medium
    ...belowText, // overrides go here
  };

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

      {/* Full-width background wrapper */}
      <div style={{ backgroundColor: belowSectionBackground }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-bold mb-8"
            style={{ color: mergedBelowText.titleColor }}
          >
            {mergedBelowText.title}
          </h1>

          {/* Single Paragraph with Colored Segments */}
          {mergedBelowText.content && mergedBelowText.content.length > 0 && (
            <p className="text-lg leading-relaxed">
              {mergedBelowText.content.map((segment: TextSegment, index: number) => (
                <span
                  key={index}
                  style={{
                    color: segment.color || mergedBelowText.contentColor,
                    fontWeight:
                      weightMap[segment.weight as FontWeight] ||
                      weightMap[mergedBelowText.contentWeight],
                  }}
                >
                  {segment.text}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;