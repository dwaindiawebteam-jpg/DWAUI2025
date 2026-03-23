import Image from "next/image";

interface ImageDividerProps {
  src: string;
  alt: string;
}

export default function ImageDivider({ src, alt }: ImageDividerProps) {
  return (
    <div className="w-full h-[500px] relative">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-center grayscale"
      />
    </div>
  );
}