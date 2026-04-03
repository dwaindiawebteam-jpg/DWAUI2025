// components/DualContentBlock.tsx
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
  content?: TextSegment[] | TextSegment[][]; // Allow both formats
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

// Helper function to normalize content to 2D array
const normalizeContent = (content: TextSegment[] | TextSegment[][] | undefined): TextSegment[][] => {
  if (!content || content.length === 0) return [];
  
  // Check if it's a 2D array (first element is an array)
  if (Array.isArray(content[0])) {
    return content as TextSegment[][];
  }
  
  // Convert 1D array to 2D array (each segment in its own list item)
  return (content as TextSegment[]).map(segment => [segment]);
};

const DualContentBlock: React.FC<DualContentBlockProps> = ({ left = {}, right = {} }) => {
  const defaultLeft: ContentBlock = {
    title: "Vision",
    titleColor: "#000000",
    titleSize: "heading-responsive",
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
    titleSize: "heading-responsive",
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
    const rawContent = section.content || [];
    const normalizedContent = normalizeContent(rawContent);

    if (sectionType === "list") {
      return (
        <ul className="list-none space-y-2 text-lg text-center sm:text-left leading-relaxed">
          {normalizedContent.map((itemSegments: TextSegment[], idx: number) => (
            <li key={idx}>
              {itemSegments.map((segment: TextSegment, sidx: number) => (
                <span
                  key={sidx}
                  style={{
                    color: segment.color || "#000",
                    fontWeight: weightMap[segment.weight || "medium"],
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

    // Default to paragraph - combine all segments into one paragraph
    return (
      <p className="text-lg text-center sm:text-left leading-relaxed">
        {normalizedContent.map((itemSegments: TextSegment[], idx: number) => (
          <React.Fragment key={idx}>
            {itemSegments.map((segment: TextSegment, sidx: number) => (
              <span
                key={sidx}
                style={{
                  color: segment.color || "#000",
                  fontWeight: weightMap[segment.weight || "medium"],
                }}
              >
                {segment.text}
              </span>
            ))}
          </React.Fragment>
        ))}
      </p>
    );
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* Left Column */}
      <div
        className={`${finalLeft.bgColor} flex p-12 text-left`}
      >
        <div className="max-w-md mx-auto flex flex-col justify-start">
          <h2
            className={`font-bold mb-6 ${finalLeft.titleSize}`}
            style={{ color: finalLeft.titleColor }}
          >
            {finalLeft.title}
          </h2>
          {renderContent(finalLeft)}
        </div>
      </div>

      {/* Right Column */}
      <div
        className={`${finalRight.bgColor} flex p-12 text-left`}
      >
        <div className="max-w-md mx-auto flex flex-col justify-start">
          <h2
            className={`font-bold mb-6 ${finalRight.titleSize}`}
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