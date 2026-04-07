// components/home/WhyTrustUs.tsx
import React from "react";

interface ContentSegment {
  text: string;
}

interface BodyProps {
  title: string;
  content: ContentSegment;
  bgColor?: string;
}

const BodyComponent: React.FC<BodyProps> = ({
  title,
  content,
  bgColor = "#9FDFFC",
}) => {

  return (
    <section className={`py-12 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center md:items-start">
        <h2 className="text-center md:text-left heading-responsive font-bold mb-12">
          {title}
        </h2>

        <p className="sm:text-lg text-center sm:text-left text-black leading-relaxed max-w-7xl mx-auto">
          <span
            className=""
          >
            {content.text}
          </span>
        </p>
      </div>
    </section>
  );
};

export default BodyComponent;
