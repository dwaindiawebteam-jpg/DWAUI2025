import React from 'react'

const WhyTrustUs: React.FC = () => {
  return (
    <section className="py-8 bg-[#9FDFFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center md:text-left text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
          Why Trust Us
        </h2>

        <p className="text-center md:text-left text-xl md:text-2xl leading-relaxed">
          We ensure complete transparency and accountability in every project. From the very 
          start, our team coordinates closely with donors, providing <span className='font-bold'>monthly newsletters, 
          digital reports, and real-time updates </span> through trusted tools like Salesforce. With 
          clear communication, measurable outcomes, and dedicated support, donors can be 
          confident their contributions are making a lasting impact.
        </p>
      </div>
    </section>
  )
}

export default WhyTrustUs