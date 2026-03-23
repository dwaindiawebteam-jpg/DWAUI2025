"use client";

import Image from "next/image";
import { useState } from "react";

export default function GalleryLightbox({ images, title }: any) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {images.map((image: string, index: number) => (
          <div
            key={index}
            className="relative aspect-[4/3] overflow-hidden group cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <Image src={image} alt={title} fill className="object-cover" />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.65" y1="16.65" x2="21" y2="21" />
                </svg>
                </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-3xl"
          >
            ✕
          </button>

          <div className="relative w-[90%] max-w-4xl aspect-[4/3]">
            <Image src={selectedImage} alt="Expanded" fill className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}