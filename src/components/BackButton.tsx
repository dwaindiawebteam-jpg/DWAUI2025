"use client";

import { useRouter } from "next/navigation";

export default function BackButton({
  fallbackHref = "/blog",
}: {
  fallbackHref?: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    // Go back if possible, otherwise go to fallback page
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleClick}
      className=" mt-6 mb-6 flex items-center text-[#004265] transition font-inter font-bold group relative pb-1"
    >
      <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#004265] after:transition-all after:duration-300 group-hover:after:w-full">
        ← Previous Page
      </span>
    </button>
  );
}
