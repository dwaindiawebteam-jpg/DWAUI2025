// components/DualContentBlock.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";

// Define the weight type based on Tailwind's font weight classes
type FontWeight = "light" | "normal" | "medium" | "semibold" | "bold";

// Define the segment interface for text content
interface TextSegment {
  text: string;
  weight?: FontWeight;
  color?: string;
}

interface ImageBlock {
  imageSrc?: string;
  imageAlt?: string;
}

interface ButtonBlock {
  text?: string;
  bgColor?: string;
  url?: string;
}

// Define the content block interface
interface ContentBlockLeft {
  title?: string;
  titleColor?: string;
  titleSize?: string;
  bgColor?: string;
  content?: ImageBlock;
}
interface ContentBlockRight {
  title?: string;
  titleColor?: string;
  titleSize?: string;
  bgColor?: string;
  type?: "image" | "buttons";
  content?: ButtonBlock[];
}

// Define the props interface for the component
interface DualContentBlockProps {
  left?: ContentBlockLeft;
  right?: ContentBlockRight;
}

// Weight map for CSS font-weight values
const weightMap: Record<FontWeight, string> = {
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

const DualContentBlock: React.FC<DualContentBlockProps> = ({
  left = {},
  right = {},
}) => {
  // Merge defaults with passed props
  const finalLeft: ContentBlockLeft = left;
  const finalRight: ContentBlockRight = right;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* Left Column */}
      <div className={`${finalLeft.bgColor} flex p-12 text-left`}>
        <div className="max-w-md mx-auto flex flex-col justify-center items-center">
          <h2
            className={`heading-responsive mb-6 ${finalLeft.titleSize}`}
            style={{ color: finalLeft.titleColor }}
          >
            {finalLeft.title}
          </h2>

          {/* image content */}
          <div className="w-1/2">
            <Image
              src={finalLeft.content?.imageSrc || "/images/donatepage/DonatepageChildrenImage.png"} // Use the image from the cause object
              alt={finalLeft.content?.imageAlt || "Cause image"} // Use custom alt text or fallback
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className={`${finalRight.bgColor} flex p-12 text-left`}>
        <div className="max-w-md mx-auto flex flex-col justify-start">
          <h2
            className={` heading-responsive mb-6 ${finalRight.titleSize}`}
            style={{ color: finalRight.titleColor }}
          >
            {finalRight.title}
          </h2>
          <div className="flex flex-col gap-5 justify-between justify-content-center pb-10">
            {finalRight.content?.map((itemSegments, idx: number) => (
              itemSegments.url ? (
                <Link
                  key={idx}
                  href={itemSegments.url}
                  target={itemSegments.url.startsWith('http') ? '_blank' : '_self'}
                  rel={itemSegments.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`cursor-pointer editor-content text-2xl! sm:text-3xl! md:text-4x! py-3 px-4 text-white text-center inline-block ${itemSegments.bgColor}`}
                >
                  {itemSegments.text}
                </Link>
              ) : (
                <button
                  key={idx}
                  type="submit"
                  className={`cursor-pointer editor-content text-2xl! sm:text-3xl! md:text-4x! py-3 px-4 text-white ${itemSegments.bgColor}`}
                >
                  {itemSegments.text}
                </button>
              )
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DualContentBlock;