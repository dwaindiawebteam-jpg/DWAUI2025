"use client";
import React from 'react';
import Image from "next/image";

interface Testimonial {
  name: string;
  title: string;
  text: string;
  splatterImage: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function Testimonials({ testimonials }: TestimonialsProps): React.JSX.Element {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {testimonials.map((testimonial: Testimonial, index: number) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonial card component
function TestimonialCard({ testimonial }: TestimonialCardProps): React.JSX.Element {
  return (
    <div className="bg-white shadow-lg overflow-hidden w-80">
      {/* Splatter Image */}
      <div className="h-60 relative">
        <Image
          src={testimonial.splatterImage}
          alt="Decorative splatter"
          fill
          className="object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {testimonial.name}
        </h3>
        <p className="mb-4">
          {testimonial.title}
        </p>
        <p className="text-sm! leading-relaxed">
          {testimonial.text}
        </p>
      </div>
    </div>
  );
}