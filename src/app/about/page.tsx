import DualContentBlock from "@/components/DualContentBlock";
import HeroSection from "@/components/HeroSection";
import AboutAccreditations from "@/components/about/AboutAccreditations";
import ImpactStats from "@/components/ImpactStats";
import AboutTeam from "@/components/about/AboutTeam";
import Volunteers from "@/components/about/Volunteers";
import WorkAreas from "@/components/about/WorkAreas";
import PresidentMessage from "@/components/about/PresidentMessage";
import InfoForm from "@/components/InfoForm";

export default function AboutPage() {
  return (
    <main>
      <HeroSection
        imageSrc="/images/aboutpage/kids.jpg"
        imageAlt="Children from Dalit community"
        belowText={{
          title: "About Us",
          titleColor: "#004265",
          content: [
            {
              text: `Dalit Welfare Association is a nonprofit organization
                dedicated to empowering marginalized communities in the rural villages of Nandyal and Kurnool districts.
                Our work focuses on uplifting Dalit women through micro-credit, financial literacy,
                and sustainable livelihood opportunities. By strengthening women’s
                capacity to lead and support their families, we strive to break poverty cycles,
                foster equality, and build resilient, inclusive communities for future generations.`,
              color: "black",
            },
          ],
        }}
      />
      <DualContentBlock
        left={{
          title: "Vision",
          titleColor: "#000000",
          bgColor: "#FEA128",
          type: "paragraph",
          content: [
            [
              {
                text: `To build an inclusive society where Dalit women thrive with dignity, equality, 
            and opportunity—breaking poverty cycles and creating sustainable, 
            empowered communities for generations to come.`,
                weight: "medium",
                color: "#000",
              },
            ],
          ],
        }}
        right={{
          title: "Mission",
          titleColor: "#000000",
          bgColor: "#FFD446",
          type: "paragraph",
          content: [
            [
              {
                text: `To empower marginalized women through micro-credit, financial education, 
            and livelihoods—strengthening families, fostering community resilience, and 
            ensuring sustainable, grassroots-driven change rooted in dignity, justice, 
            and equality.`,
                weight: "medium",
                color: "#000",
              },
            ],
          ],
        }}
      />
      <AboutAccreditations />
      <ImpactStats
        bgColor="bg-yellow"
        textColor="#000"
        people={5000}
        villages={140}
        programs={30}
      />
      <AboutTeam />
      <Volunteers />
      <WorkAreas />
      <PresidentMessage />
      <InfoForm />
    </main>
  );
}
