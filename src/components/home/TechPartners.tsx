import React from 'react'

interface TechPartnersProps {
  partners: string[]
}

const TechPartners: React.FC<TechPartnersProps> = ({ partners }) => {
  return (
    <section className="py-20 bg-[#F4F4F4]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="heading-responsive font-bold mb-4">
            Tech Partners
          </h2>
        </div>
        
        {/* Partner names in elegant grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {partners.map((partner: string, index: number) => (
            <span
              key={index}
              className="text-lg font-black text-center"
            >
              {partner}
            </span>
          ))}
        </div>
        
      </div>
    </section>
  )
}

export default TechPartners