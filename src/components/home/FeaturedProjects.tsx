// components/home/FeaturedProjects.tsx
import React from "react";

// Define the full weight type that matches your TextSegment
type FontWeight = "light" | "normal" | "medium" | "semibold" | "bold";

interface ContentSegment {
  text: string;
  weight?: FontWeight; // Make it optional and accept all weights
}

interface LeftProject {
  title: string;
  content: ContentSegment[];
}

interface RightNumber {
  label: string;
  value: string;
}

interface FeaturedProjectsProps {
  leftProjects: LeftProject[];
  rightNumbers: RightNumber[];
}

const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ leftProjects, rightNumbers }) => {
  // Weight map for all possible font weights
  const weightMap: Record<FontWeight, string> = {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  };
  
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* Left Column */}
      <div className="flex p-12 bg-navy-blue" style={{ color: "#FFFFFF" }}>
        <div className="max-w-md mx-auto flex flex-col justify-start space-y-8">
          {leftProjects.map((project: LeftProject, idx: number) => (
            <div key={idx}>
              <h3 className="text-center md:text-left heading-responsive font-bold mb-4">{project.title}</h3>
              <p className="text-center md:text-left text-lg leading-relaxed">
                {project.content.map((seg: ContentSegment, sidx: number) => (
                  <span 
                    key={sidx} 
                    style={{ 
                      fontWeight: seg.weight ? weightMap[seg.weight] : weightMap.normal 
                    }}
                  >
                    {seg.text}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="flex p-12 bg-blue/50" style={{ color: "#000000" }}>
        <div className="mx-auto flex flex-col justify-start space-y-6">
          <h2 className="text-center heading-responsive font-bold flex items-center mb-12">
            <img
              src="/icons/homepage/arrow-left.svg"
              alt="Arrow Left"
              className="mr-4 h-6 w-6 sm:h-8 sm:w-8"
            />
            Featured Projects
          </h2>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Verification Numbers</h3>
          <ol className="list-decimal list-inside text-lg space-y-2">
            {rightNumbers.map((item: RightNumber, idx: number) => (
              <li key={idx} className="flex justify-between">
                <span>{item.label}</span>
                <span className="font-medium"> {item.value}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;