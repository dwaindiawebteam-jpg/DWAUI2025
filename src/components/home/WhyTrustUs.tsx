import React from 'react'

interface ContentSegment {
  text: string
  weight: "normal" | "bold"
}

interface WhyTrustUsProps {
  title: string
  content: ContentSegment[]
  bgColor?: string
}

const WhyTrustUs: React.FC<WhyTrustUsProps> = ({ 
  title, 
  content, 
  bgColor = "#9FDFFC"
}) => {
  const weightMap: Record<ContentSegment["weight"], string> = {
    normal: "400",
    bold: "700",
  };

  return (
    <section className="py-16" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center md:text-left text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
          {title}
        </h2>

        <p className="text-center md:text-left leading-relaxed">
          {content.map((seg: ContentSegment, idx: number) => (
            <span
              key={idx}
              className="text-xl!"
              style={{ fontWeight: weightMap[seg.weight] }}
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