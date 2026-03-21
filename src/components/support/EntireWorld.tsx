import React from 'react';

interface EntireWorldProps {
  quote: string;
  backgroundColor?: string; // Optional with default in parent
  textClasses?: string; // Optional with default in parent
}

const EntireWorld: React.FC<EntireWorldProps> = ({ 
  quote, 
  backgroundColor = "bg-[#E8E7E780]", 
  textClasses = "text-2xl font-semibold italic sm:text-3xl md:text-3xl" 
}) => {
  return (
    <section className={`p-12 ${backgroundColor} text-center`}>
      <h1 className={textClasses}>
        “{quote}”
      </h1>
    </section>
  );
};

export default EntireWorld;