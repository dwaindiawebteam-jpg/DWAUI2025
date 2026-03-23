import React from "react";

interface ContentSegment {
  text: string
  weight: "normal" | "bold"
}

interface LeftProject {
  title: string
  content: ContentSegment[]
}

interface RightNumber {
  label: string
  value: string
}

interface FeaturedProjectsProps {
  leftProjects: LeftProject[]
  rightNumbers: RightNumber[]
}

const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ leftProjects, rightNumbers }) => {
  const weightMap: Record<ContentSegment["weight"], string> = {
    normal: "400",
    bold: "700",
  };
  
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* Left Column */}
      <div className="flex p-12" style={{ backgroundColor: "#004265", color: "#FFFFFF" }}>
        <div className="max-w-md mx-auto flex flex-col justify-start space-y-8">
          {leftProjects.map((project: LeftProject, idx: number) => (
            <div key={idx}>
              <h3 className="text-center heading-responsive font-bold mb-4">{project.title}</h3>
              <p className="text-center md:text-left text-lg leading-relaxed">
                {project.content.map((seg: ContentSegment, sidx: number) => (
                  <span key={sidx} style={{ fontWeight: weightMap[seg.weight] }}>
                    {seg.text}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="flex p-12" style={{ backgroundColor: "#9FDFFC", color: "#000000" }}>
        <div className="mx-auto flex flex-col justify-start space-y-6">
          <h2 className="text-center heading-responsive font-bold flex items-center mb-12">
          <img
            src="/icons/homepage/arrow-left.svg"
            alt="Arrow Left"
            className="mr-4
              h-6 w-6
              sm:h-8 sm:w-8"
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