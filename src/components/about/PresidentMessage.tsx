import React from "react";
import Image from "next/image";

interface PresidentMessageProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  paragraphs: string[];
  authorName: string;
  authorTitle: string;
}

const PresidentMessage: React.FC<PresidentMessageProps> = ({ 
  imageSrc,
  imageAlt,
  title,
  paragraphs,
  authorName,
  authorTitle,
}) => {
  return (
    <section className="bg-[#F4F4F4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <h2 className="heading-responsive leading-tight text-black mb-8">
          Message from Our President
        </h2>

        {/* Card */}
        <div className="bg-white shadow-lg overflow-hidden flex flex-col lg:flex-row max-w-5xl mx-auto">
          {/* Left Image */}
          <div className="w-full h-64 md:h-80 lg:w-1/3 lg:h-auto">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={400}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Right Content */}
          <div className="flex flex-col flex-1 p-6 md:p-8">
            <h3 className="heading-responsive font-bold text-black mb-4">
              {title}
            </h3>
            
            {paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-black mb-4">
                {paragraph}
              </p>
            ))}
            
            <p className="font-semibold text-xl text-black">
              {authorName}{" "}
              <span className="font-normal text-xl! text-black">- {authorTitle}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PresidentMessage;