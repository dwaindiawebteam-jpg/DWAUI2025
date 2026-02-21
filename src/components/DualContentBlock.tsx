import React from 'react';

// Define the weight type based on Tailwind's font weight classes
type FontWeight = "light" | "normal" | "medium" | "semibold" | "bold";

// Define the segment interface for text content
interface TextSegment {
  text: string;
  weight?: FontWeight;
  color?: string;
}

// Define the content block interface
interface ContentBlock {
  title?: string;
  titleColor?: string;
  titleSize?: string;
  bgColor?: string;
  type?: "paragraph" | "list";
  content?: TextSegment[][];
}

// Define the props interface for the component
interface DualContentBlockProps {
  left?: ContentBlock;
  right?: ContentBlock;
}

// Weight map for CSS font-weight values
const weightMap: Record<FontWeight, string> = {
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

const DualContentBlock: React.FC<DualContentBlockProps> = ({ left = {}, right = {} }) => {
  const defaultLeft: ContentBlock = {
    title: "Vision",
    titleColor: "#000000",
    titleSize: "text-4xl md:text-5xl",
    bgColor: "#FEA128",
    type: "paragraph",
    content: [
      [
        {
          text: `To build an inclusive society where Dalit women thrive with dignity, equality, 
            and opportunity—breaking poverty cycles and creating sustainable, 
            empowered communities for generations to come.`,
          weight: "medium",
          color: "#000",
        },
      ],
    ],
  };

  const defaultRight: ContentBlock = {
    title: "Mission",
    titleColor: "#000000",
    titleSize: "text-4xl md:text-5xl",
    bgColor: "#FFD446",
    type: "paragraph",
    content: [
      [
        {
          text: `To empower marginalized women through micro-credit, financial education, 
            and livelihoods—strengthening families, fostering community resilience, and 
            ensuring sustainable, grassroots-driven change rooted in dignity, justice, 
            and equality.`,
          weight: "medium",
          color: "#000",
        },
      ],
    ],
  };

  // Merge defaults with passed props
  const finalLeft: ContentBlock = { ...defaultLeft, ...left };
  const finalRight: ContentBlock = { ...defaultRight, ...right };

  const renderContent = (section: ContentBlock): React.ReactElement => {
    // Ensure section has required properties with defaults
    const sectionType = section.type || "paragraph";
    const sectionContent = section.content || [];

    if (sectionType === "list") {
      return (
        <ul className="list-none text-left space-y-2 text-lg leading-relaxed">
          {sectionContent.map((itemSegments: TextSegment[], idx: number) => (
            <li key={idx}>
              {itemSegments.map((segment: TextSegment, sidx: number) => (
                <span
                  key={sidx}
                  style={{
                    color: segment.color || "#000",
                    fontWeight:
                      weightMap[segment.weight || "medium"],
                  }}
                >
                  {segment.text}
                </span>
              ))}
            </li>
          ))}
        </ul>
      );
    }

    // Default to paragraph
    return (
      <p className="text-lg leading-relaxed">
        {sectionContent.map((itemSegments: TextSegment[], idx: number) => (
          <span key={idx}>
            {itemSegments.map((segment: TextSegment, sidx: number) => (
              <span
                key={sidx}
                style={{
                  color: segment.color || "#000",
                  fontWeight:
                    weightMap[segment.weight || "medium"],
                }}
              >
                {segment.text}
              </span>
            ))}
          </span>
        ))}
      </p>
    );
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* Left Column */}
      <div
        className="flex p-12 text-left"
        style={{ backgroundColor: finalLeft.bgColor }}
      >
        <div className="max-w-md mx-auto flex flex-col justify-start">
          <h2
            className={`font-bold mb-8 ${finalLeft.titleSize || "text-4xl md:text-5xl"}`}
            style={{ color: finalLeft.titleColor }}
          >
            {finalLeft.title}
          </h2>
          {renderContent(finalLeft)}
        </div>
      </div>

      {/* Right Column */}
      <div
        className="flex p-12 text-left"
        style={{ backgroundColor: finalRight.bgColor }}
      >
        <div className="max-w-md mx-auto flex flex-col justify-start">
          <h2
            className={`font-bold mb-8 ${finalRight.titleSize || "text-4xl md:text-5xl"}`}
            style={{ color: finalRight.titleColor }}
          >
            {finalRight.title}
          </h2>
          {renderContent(finalRight)}
        </div>
      </div>
    </section>
  );
};

export default DualContentBlock;