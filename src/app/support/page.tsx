import React from 'react';
import Causes from '@/components/support/Causes';
import EntireWorld from '@/components/support/EntireWorld';
import HeroSection from '@/components/HeroSection';
import InfoForm from '@/components/InfoForm';

const SupportPage: React.FC = () => {
  // Define your causes data here (can be fetched from API, CMS, etc.)
  const supportCauses = [
    {id: 1, title: "1. Corporate Foundations", details: "Partner with us through CSR initiatives to create sustainable impact in rural Dalit communities. Your support can empower women entrepreneurs, digital education, and healthcare projects, aligning with SDGs and long-term social change."},
    {id: 2, title: "2. Philanthropies", details: "Your investment fuels transformative programs tackling poverty, caste discrimination, and gender inequality. By backing our initiatives, you help scale solutions that create dignity, opportunity, and resilience in marginalized communities." },
    {id: 3, title: "3. Generous Donors", details: "Every contribution, big or small, creates ripples of change. Your donation supports education, healthcare, and livelihoods for Dalit families, ensuring a brighter, more equal future for generations to come."},
    {id: 4, title: "4. Volunteers", details: "Share your skills, time, and passion to uplift communities. From digital support to field activities, volunteers are the heart of our mission, bringing energy and expertise where it matters most."},
    {id: 5, title: "5. Fundraisers", details: "Champion our cause by mobilizing networks and resources. As a fundraiser, you amplify our reach and ensure more people can join hands in building inclusive, thriving rural communities." },
    {id: 6, title: "6. Field Visit Teams", details: "Experience the impact firsthand by visiting our projects in Nandyal and Kurnool. Field visits build deeper understanding, accountability, and connection between supporters and the communities they help transform."},
  ];

  return (
    <main className="">
      <HeroSection
        imageSrc="/images/supportpage/hero-img.png"
        imageAlt="farmers from Dalit community"
        belowText={{
          title: "Support Our Cause!",
          titleColor: "#004265",
          content: [
            {
              text: `DALIT WELFARE is a grassroot NGO working directly with Dalit communities in tribal and rural regions of Nandyal & Kurnnol districts.`,
              color: "black",
            },
          ],
        }}
      />
      {/* Pass the data as props */}
      <Causes causesDetails={supportCauses} />
      <EntireWorld 
        quote="Whoever saves one life, saves the entire world."
        backgroundColor="bg-[#E8E7E780]"
        textClasses="text-2xl font-semibold italic sm:text-3xl md:text-3xl"
      />
      <InfoForm />
    </main>
  );
};

export default SupportPage;