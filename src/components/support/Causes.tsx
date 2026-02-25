import React from "react"
import Image from "next/image"

interface CauseDetail {
  id: number;
  title: string;
  details: string;
}

export default function Causes(): React.ReactElement {
    const causesDetails: CauseDetail[] = [
        {id: 1, title: "1. Corporate Foundations", details: "Partner with us through CSR initiatives to create sustainable impact in rural Dalit communities. Your support can empower women entrepreneurs, digital education, and healthcare projects, aligning with SDGs and long-term social change."},
        {id: 2, title: "2. Philanthropies", details: "Your investment fuels transformative programs tackling poverty, caste discrimination, and gender inequality. By backing our initiatives, you help scale solutions that create dignity, opportunity, and resilience in marginalized communities." },
        {id: 3, title: "3. Generous Donors", details: "Every contribution, big or small, creates ripples of change. Your donation supports education, healthcare, and livelihoods for Dalit families, ensuring a brighter, more equal future for generations to come."},
        {id: 4, title: "4. Volunteers", details: "Share your skills, time, and passion to uplift communities. From digital support to field activities, volunteers are the heart of our mission, bringing energy and expertise where it matters most."},
        {id: 5, title: "5. Fundraisers", details: "Champion our cause by mobilizing networks and resources. As a fundraiser, you amplify our reach and ensure more people can join hands in building inclusive, thriving rural communities." },
        {id: 6, title: "6. Field Visit Teams", details: "Experience the impact firsthand by visiting our projects in Nandyal and Kurnool. Field visits build deeper understanding, accountability, and connection between supporters and the communities they help transform."},
    ]

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
        if (id === 2 || id === 5) return "text-[#004265]";
        if (id === 4) return "text-[#622676D1]";
        return "text-black";
    }

    const getTextColor = (id: number): string => {
        return (id === 1 || id === 3) ? "text-white" : "text-black";
    }

    return (
        <section>
            {causesDetails.map((cause: CauseDetail) => (
                <div 
                    key={cause.id} 
                    className={`w-full flex ${cause.id % 2 === 1 ? "flex-row" : "flex-row-reverse"} ${getBackgroundColor(cause.id)} max-md:flex-col`}
                >
                    <div className="p-40 max-2xl:p-18 w-3/5 max-lg:p-8 max-md:w-full">
                        <h1 className={`font-[700] text-[70px] max-2xl:text-[50px] max-lg:text-[40px] max-sm:text-2xl mb-10 max-2xl:mb-4 ${getTitleColor(cause.id)}`}>
                            {cause.title}
                        </h1>
                        <p className={`font-[500] text-[40px] max-2xl:text-[30px] max-lg:text-[20px] max-sm:text-[16px] pl-15 max-lg:pl-8 max-sm:p-4 ${getTextColor(cause.id)}`}>
                            {cause.details}
                        </p>
                    </div>

                    <div className="w-2/5 relative max-md:w-full max-md:h-[497px]">
                        <Image 
                            src="/images/supportpage/children-img.png" 
                            alt="children from Dalit communities"
                            fill
                            className="w-full object-cover"
                        /> 
                    </div>
                </div> 
            ))}
        </section>
    )
}