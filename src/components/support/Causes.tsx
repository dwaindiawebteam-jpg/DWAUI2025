import React from "react"
import Image from "next/image"

interface CauseDetail {
  id: number;
  title: string;
  details: string;
}

interface CausesProps {
  causesDetails: CauseDetail[]; // Now required, no fallback
}

export default function Causes({ causesDetails }: CausesProps): React.ReactElement {
    const getBackgroundColor = (id: number): string => {
        switch(id) {
            case 1: return "bg-[#004265]";
            case 2: return "bg-[#3EBFF980]";
            case 3: return "bg-[#622676]";
            case 4: return "bg-[#FF9DF080]";
            case 5: return "bg-[#FCCE37]";
            case 6: return "bg-[#FFD44699]";
            default: return "";
        }
    }

    const getTitleColor = (id: number): string => {
        if (id === 1 || id === 3) return "text-white";
        if (id === 2 || id === 6) return "text-[#004265]";
        if (id === 4) return "text-[#622676D1]";
        return "text-black";
    }

    const getTextColor = (id: number): string => {
        return (id === 1 || id === 3) ? "text-white" : "text-black";
    }

    return (
        <section className="w-full">
            {causesDetails.map((cause: CauseDetail) => (
               <div 
                    key={cause.id} 
                    className={`w-full flex items-stretch ${
                        cause.id % 2 === 1 ? "flex-row" : "flex-row-reverse"
                    } ${getBackgroundColor(cause.id)} max-md:flex-col`}
                    >
                    <div className="p-40 max-2xl:p-18 w-3/5 max-lg:p-8 max-md:w-full">
                       <h1 className={`font-bold text-2xl sm:text-3xl md:text-4xl mb-6 ${getTitleColor(cause.id)}`}>
                            {cause.title}
                        </h1>
                        <p className={`text-lg! md:text-xl! leading-relaxed ${getTextColor(cause.id)}`}>
                            {cause.details}
                        </p>
                    </div>

                    <div className="w-1/2 relative max-md:w-full">
                        <Image 
                            src="/images/supportpage/children-img.png" 
                            alt="children from Dalit communities"
                            fill
                            className="object-cover"
                            />
                    </div>
                </div> 
            ))}
        </section>
    )
}