// components/home/WhyTrustUs.tsx
import React from 'react'

// Define all possible font weights
type FontWeight = "light" | "normal" | "medium" | "semibold" | "bold";

interface ContentSegment {
  text: string;
  weight?: FontWeight; // Make it optional and accept all weights
}

interface WhyTrustUsProps {
  title: string;
  content: ContentSegment[];
  bgColor?: string;
}

const WhyTrustUs: React.FC<WhyTrustUsProps> = ({ 
  title, 
  content, 
  bgColor = "#9FDFFC"
}) => {
  // Weight map for all font weights
  const weightMap: Record<FontWeight, string> = {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  };

  return (
    <section className={`py-12 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center md:items-start">
        <h2 className="text-center md:text-left heading-responsive font-bold mb-12">
          {title}
        </h2>

        <p className="text-center md:text-left leading-relaxed">
          {content.map((seg: ContentSegment, idx: number) => (
            <span
              key={idx}
              className="text-xl!"
              style={{ 
                fontWeight: seg.weight ? weightMap[seg.weight] : weightMap.normal 
              }}
            >
              {seg.text}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}

export default WhyTrustUs