import React from 'react';

interface EntireWorldProps {
  text: string;
}

const EntireWorld: React.FC<EntireWorldProps> = ({ text }) => {
  return (
    <section className="p-12 bg-[#F3F3F3] text-center">
      <h1 className="text-2xl font-semibold italic sm:text-3xl md:text-3xl">
        “{text}”
      </h1>
    </section>
  );
};

export default EntireWorld;