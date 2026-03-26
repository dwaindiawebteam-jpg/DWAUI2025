import Image from "next/image";

interface TextSegment {
  text: string;
  bold?: boolean;
}

interface AboutAccreditationsProps {
  paragraph: TextSegment[]; // Required prop, no fallback
  logos: string[]; // Required prop, no fallback
  heading?: string; // Required from outside, no fallback
}

const AboutAccreditations: React.FC<AboutAccreditationsProps> = ({ 
  paragraph,
  logos,
  heading
}) => {
  return (
    <section className="py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <h2 className="heading-responsive leading-tight font-bold mb-8 text-black max-w-7xl mx-auto">
        {heading}
      </h2>

      {/* Paragraph */}
      <p className="text-base sm:text-lg text-center sm:text-left text-black leading-relaxed max-w-7xl mx-auto mb-12">
        {paragraph.map((s, i) => (
          <span key={i} className={s.bold ? "font-bold" : undefined}>
            {s.text}
          </span>
        ))}
      </p>

      {/* Logos */}
      <div className="flex flex-wrap justify-center gap-12">
        {logos.map((logo, index) => (
          <Image
            key={index}
            src={logo}
            alt={`Accreditation Logo ${index + 1}`}
            width={263}
            height={263}
            className="object-contain"
          />
        ))}
      </div>
    </section>
  );
};

export default AboutAccreditations;