// app/about/page.tsx
import DualContentBlock from "@/components/DualContentBlock";
import HeroSection from "@/components/HeroSection";
import AboutAccreditations from "@/components/about/AboutAccreditations";
import ImpactStats from "@/components/ImpactStats";
import AboutTeam from "@/components/about/AboutTeam";
import Volunteers from "@/components/about/Volunteers";
import WorkAreas from "@/components/about/WorkAreas";
import PresidentMessage from "@/components/about/PresidentMessage";
import InfoForm from "@/components/InfoForm";
import { getAboutContent } from "@/lib/getAboutContent";

export default async function AboutPage() {
  // Fetch about content from Firestore
  const aboutContent = await getAboutContent();

  // Use fetched data or fallback to empty/default data
  const heroData = aboutContent?.heroSection || {
    image: "/images/aboutpage/kids.jpg",
    imageAlt: "Children from Dalit community",
    belowText: {
      title: "About Us",
      titleColor: "#004265",
      content: [
        {
          text: `Dalit Welfare Association is a nonprofit organization
            dedicated to empowering marginalized communities in the rural villages of Nandyal and Kurnool districts.
            Our work focuses on uplifting Dalit women through micro-credit, financial literacy,
            and sustainable livelihood opportunities. By strengthening women's
            capacity to lead and support their families, we strive to break poverty cycles,
            foster equality, and build resilient, inclusive communities for future generations.`,
          color: "black",
        },
      ],
    }
  };

  // Ensure the type property is correctly typed as "paragraph" | "list"
  const dualContent = {
    left: {
      title: aboutContent?.dualContentBlock?.left.title || "Vision",
      titleColor: aboutContent?.dualContentBlock?.left.titleColor || "#000000",
      bgColor: aboutContent?.dualContentBlock?.left.bgColor || "bg-orange",
      type: (aboutContent?.dualContentBlock?.left.type || "paragraph") as "paragraph" | "list",
      content: aboutContent?.dualContentBlock?.left.content || [
        {
          text: `To build an inclusive society where Dalit women thrive with dignity, equality, 
            and opportunity—breaking poverty cycles and creating sustainable, 
            empowered communities for generations to come.`,
          weight: "medium" as const,
          color: "#000",
        },
      ],
    },
    right: {
      title: aboutContent?.dualContentBlock?.right.title || "Mission",
      titleColor: aboutContent?.dualContentBlock?.right.titleColor || "#000000",
      bgColor: aboutContent?.dualContentBlock?.right.bgColor || "bg-yellow",
      type: (aboutContent?.dualContentBlock?.right.type || "paragraph") as "paragraph" | "list",
      content: aboutContent?.dualContentBlock?.right.content || [
        {
          text: `To empower marginalized women through micro-credit, financial education, 
            and livelihoods—strengthening families, fostering community resilience, and 
            ensuring sustainable, grassroots-driven change rooted in dignity, justice, 
            and equality.`,
          weight: "medium" as const,
          color: "#000",
        },
      ],
    }
  };

  const accreditationsData = aboutContent?.accreditations || {
    heading: "Accreditations",
    paragraph: [
      { text: "Dalit Welfare Association is a legally registered nonprofit organization, governed by all statutory requirements under Indian law. We hold valid " },
      { text: "Registration Certificates", weight: "bold" as const },
      { text: ", " },
      { text: "12A & 80G tax exemption approvals", weight: "bold" as const },
      { text: ", and maintain compliance with the " },
      { text: "FCRA (Foreign Contribution Regulation Act)", weight: "bold" as const },
      { text: " to receive international donations. Our financial records are audited annually, ensuring transparency, accountability, and trust with donors, partners, and the communities we serve." }
    ],
    logos: [
      "/images/aboutpage/givedo.png",
      "/images/aboutpage/guidestarindia.png",
      "/images/aboutpage/benevity.png",
      "/images/aboutpage/goodstack.png"
    ]
  };

  const impactStatsData = aboutContent?.impactStats || {
    bgColor: "bg-yellow",
    textColor: "#000",
    people: 5000,
    villages: 140,
    programs: 30
  };

  const teamData = aboutContent?.team || {
    heading: "DWA Team",
    paragraph: "Our dedicated team works tirelessly in the field and office, bringing passion, skills, and commitment to empower Dalit communities and drive lasting change in rural Nandyal and Kurnool.",
    teamMembers: [
      { name: "S. Moses", role: "Program Manager", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
      { name: "K. Saroja", role: "Field Work", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
      { name: "G. Bhaskar", role: "Office Staff", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
      { name: "P. Danielu", role: "Field Work", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
      { name: "N. Sudha Rani", role: "Field Work", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
      { name: "K. Bujji", role: "Office Work", image: "/images/SplatterImages/green splatter.png", imageFileId: "" },
    ]
  };

  const volunteersData = aboutContent?.volunteers || {
    heading: "Volunteers",
    volunteers: [
      {
        name: "Michael M",
        role: "Junior Software Developer., S.A.",
        description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
        image: "/images/SplatterImages/orange splatter 2.png",
        imageFileId: "",
        linkedin: "#",
        bgColor: "bg-[#FFEEB5]",
      },
      {
        name: "Prince Sithole",
        role: "Junior Software Developer., S.A.",
        description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
        image: "/images/SplatterImages/orange splatter 2.png",
        imageFileId: "",
        linkedin: "#",
        bgColor: "bg-[#FFEEB5]",
      },
      {
        name: "Scott Singer",
        role: "Senior Software Developer., USA",
        description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
        image: "/images/SplatterImages/orange splatter.png",
        imageFileId: "",
        linkedin: "#",
        bgColor: "bg-[#FFEEB5]",
      },
      {
        name: "Fatimoh B",
        role: "Software Developer., Nigeria.",
        description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
        image: "/images/SplatterImages/orange splatter 2.png",
        imageFileId: "",
        linkedin: "#",
        bgColor: "bg-[#FED6F8]",
      },
      {
        name: "Dayo Abdul",
        role: "Senior Software Developer., Nigeria.",
        description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
        image: "/images/SplatterImages/orange splatter.png",
        imageFileId: "",
        linkedin: "#",
        bgColor: "bg-[#FED6F8]",
      },
      {
        name: "Megan Ward",
        role: "Salesforce Admin., Ireland.",
        description: "Volunteering as a website developer at DWA was truly rewarding. I felt proud to support their mission of empowering Dalit communities through education, women's entrepreneurship, and sustainable livelihoods.",
        image: "/images/SplatterImages/orange splatter.png",
        imageFileId: "",
        linkedin: "#",
        bgColor: "bg-[#FED6F8]",
      },
    ]
  };

  const presidentMessageData = aboutContent?.presidentMessage || {
    image: "/images/SplatterImages/purple splatter.png",
    imageAlt: "President message",
    title: "Breaking Barriers, Restoring Dignity",
    paragraphs: [
      "As President of DWA, I have seen how deeply caste discrimination and poverty affect Dalit families. Education, livelihoods, and women's empowerment are powerful tools we use to confront these injustices.",
      "Our efforts in rural Nandyal and Kurnool are small steps toward equality, but with strong partnerships, these steps become transformative. Together, we can dismantle barriers and create a society where Dalits live with dignity and opportunity."
    ],
    authorName: "S. Samuel",
    authorTitle: "President"
  };

  return (
    <main>
      {/* Show loading or empty state if no content */}
      {!aboutContent && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl text-center mb-4">About Content Coming Soon</h2>
          <p>Our about page information is being prepared. Please check back later.</p>
        </div>
      )}

      {aboutContent && (
        <>
          <HeroSection
            imageSrc={heroData.image}
            imageAlt={heroData.imageAlt}
            belowText={heroData.belowText}
          />
          
          <DualContentBlock
            left={dualContent.left}
            right={dualContent.right}
          />
          
          <AboutAccreditations 
            paragraph={accreditationsData.paragraph}
            logos={accreditationsData.logos}
            heading={accreditationsData.heading}
          />
          
          <ImpactStats
            bgColor={impactStatsData.bgColor}
            textColor={impactStatsData.textColor}
            people={impactStatsData.people}
            villages={impactStatsData.villages}
            programs={impactStatsData.programs}
          />
          
          <AboutTeam 
            teamMembers={teamData.teamMembers}
            heading={teamData.heading}
            paragraph={teamData.paragraph}
          />
          
          <Volunteers 
            volunteers={volunteersData.volunteers}
            heading={volunteersData.heading}
          />
          
          <WorkAreas />
          
          <PresidentMessage
            imageSrc={presidentMessageData.image}
            imageAlt={presidentMessageData.imageAlt}
            title={presidentMessageData.title}
            paragraphs={presidentMessageData.paragraphs}
            authorName={presidentMessageData.authorName}
            authorTitle={presidentMessageData.authorTitle}
          />
        </>
      )}
      
      <InfoForm />
    </main>
  );
}