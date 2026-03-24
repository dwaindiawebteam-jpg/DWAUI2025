import React from "react";
import Image from "next/image";

interface CauseDetail {
  id: number;
  title: string;
  details: string;
}

interface CausesProps {
  causesDetails: CauseDetail[];
}

const STYLE_MAP: Record<
  number,
  { bg: string; title: string; text: string }
> = {
  1: { bg: "bg-navy-blue", title: "text-white", text: "text-white" },
  2: { bg: "bg-blue/50", title: "text-[#004265]", text: "text-black" },
  3: { bg: "bg-[#622676]", title: "text-white", text: "text-white" },
  4: { bg: "bg-pink/50", title: "text-[#622676D1]", text: "text-black" },
  5: { bg: "bg-yellow", title: "text-black", text: "text-black" },
  6: { bg: "bg-yellow/50", title: "text-[#004265]", text: "text-black" }
};

export default function Causes({ causesDetails }: CausesProps) {
  return (
    <section className="w-full">
      {causesDetails.map((cause) => {
        const styles = STYLE_MAP[cause.id] ?? {
          bg: "",
          title: "text-black",
          text: "text-black"
        };

        return (
          <div
            key={cause.id}
            className={`w-full flex items-stretch ${
                cause.id % 2 === 1 ? "flex-row" : "flex-row-reverse"
            } ${styles.bg} max-md:flex-col`}
            >
            <div className="w-3/5 max-md:w-full flex">
                <div className="pl-40 pr-40 max-2xl:p-18 max-lg:p-8 flex flex-col justify-center">
                <h1
                    className={`font-bold heading-responsive mb-6 ${styles.title}`}
                >
                    {cause.title}
                </h1>
                <p
                    className={`text-lg! md:text-xl! leading-relaxed ${styles.text}`}
                >
                    {cause.details}
                </p>
                </div>
            </div>

            <div className="w-1/2 flex justify-center items-center max-md:w-full">
                <Image
                src="/images/supportpage/children-img.png"
                alt="children from Dalit communities"
                width={400}
                height={400}
                className="object-contain"
                />
            </div>
            </div>
        );
      })}
    </section>
  );
}