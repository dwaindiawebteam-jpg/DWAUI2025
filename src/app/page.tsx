import HeroSection from "@/components/HeroSection";
import DualContentBlock from "@/components/DualContentBlock";
import ProgramsGrid from "@/components/home/ProgramsGrid";
import Testimonials from "@/components/home/Testimonials";
import ImpactStats from "@/components/ImpactStats";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import BenevityBoardSection from "@/components/home/BenevityBoardSection";
import WhyTrustUs from "@/components/home/WhyTrustUs";
import TechPartners from "@/components/home/TechPartners";
import InfoForm from "@/components/InfoForm";

// Define types for the content structure
interface TextContent {
  text: string;
  weight?: "normal" | "bold" | "light" | "medium" | "semibold";
  color?: string;
}

interface ContentBlock {
  title: string;
  titleColor: string;
  bgColor: string;
  type: "list";
  content: TextContent[][];
}

interface HeroSectionProps {
  belowText: {
    content: TextContent[];
  };
}

interface DualContentBlockProps {
  left: ContentBlock;
  right: ContentBlock;
}

// Import or define the types for FeaturedProjects
interface ContentSegment {
  text: string
  weight: "normal" | "bold"
}

interface LeftProject {
  title: string
  content: ContentSegment[]
}

interface RightNumber {
  label: string
  value: string
}

export default function Home(): React.JSX.Element {

  const programsData = [
    {
      id: 1,
      title: "NO POVERTY",
      description: "Livelihoods, micro-credit, and economic empowerment for Dalit and rural families",
      image: "/images/homepage/OurPrograms/No Poverty.jpg",
      bgColor: "bg-red-500"
    },
    {
      id: 2,
      title: "ZERO HUNGER",
      description: "Nutrition support, food security, and sustainable farming practices",
      image: "/images/homepage/OurPrograms/Zero Hunger.jpg",
      bgColor: "bg-yellow-500"
    },
    {
      id: 3,
      title: "GOOD HEALTH AND WELL-BEING",
      description: "Healthcare, sanitation, elderly care, and child well-being",
      image: "/images/homepage/OurPrograms/Good Health And Well Being.jpg",
      bgColor: "bg-green-500"
    },
    {
      id: 4,
      title: "QUALITY EDUCATION",
      description: "Access to education for rural children & marginalized groups",
      image: "/images/homepage/OurPrograms/Quality Education.jpg",
      bgColor: "bg-red-600"
    },
    {
      id: 5,
      title: "GENDER EQUALITY",
      description: "Women's empowerment, self-help groups, and financial inclusion",
      image: "/images/homepage/OurPrograms/Gender Equality.jpg",
      bgColor: "bg-red-500"
    },
    {
      id: 6,
      title: "CLEAN WATER AND SANITATION",
      description: "Promoting hygiene, sanitation, and access to safe drinking water",
      image: "/images/homepage/OurPrograms/Clean Water And Sanitation.jpg",
      bgColor: "bg-cyan-500"
    }
  ];

  const testimonials = [
    {
      name: "John Romnes",
      title: "CEO – Minnesota Elevators Inc., USA",
      text: "Supporting the sheep rearing project with Dalit Welfare Association has been truly rewarding. The impact on rural families is visible, and I'm very happy with the results achieved.",
      splatterImage: "/images/SplatterImages/orange splatter.png"
    },
    {
      name: "Gerardo Betancourt",
      title: "Executive Team uch-arqsj., USA",
      text: "I deeply appreciate the transparency and timely reports provided. Their professionalism and commitment gave us confidence that our support is making a real difference on the ground.",
      splatterImage: "/images/SplatterImages/purple splatter.png"
    },
    {
      name: "Indira Oskvarek",
      title: "Secretary - Global Compassion INC., USA",
      text: "The dairy project we supported delivered outstanding results. We were so impressed with their project management that we are now considering funding the second phase as well.",
      splatterImage: "/images/SplatterImages/red splatter.png"
    }
  ];

  // Define data for FeaturedProjects with explicit typing
  const featuredProjectsData: { leftProjects: LeftProject[]; rightNumbers: RightNumber[] } = {
    leftProjects: [
      {
        title: "Digital Education Project",
        content: [
          { text: "Bridging the digital divide for rural Dalit children by providing access to technology, e-learning resources, and training, ensuring equal education opportunities and ", weight: "normal" as const },
          { text: "brighter futures", weight: "bold" as const },
          { text: ".", weight: "normal" as const },
        ],
      },
      {
        title: "Women Entrepreneurship Project",
        content: [
          { text: "Empowering rural women through micro-credit, skill-building, and enterprise support in sheep rearing and small businesses, fostering financial independence and ", weight: "normal" as const },
          { text: "community leadership", weight: "bold" as const },
          { text: ".", weight: "normal" as const },
        ],
      },
    ],
    rightNumbers: [
      { label: "1. Registration Number:", value: "384/1993" },
      { label: "2. FCRA Number:", value: "010270166" },
      { label: "3. Guide Star:", value: "9683" },
      { label: "4. NGO Darpan:", value: "AP/2021/0276162" },
      { label: "5. TAX Exemption: ", value: "AAKFD2353BE20214" },
    ]
  };

  const benevityBoardData = {
  benevityTitle: "Benevity & Goodstack",
  benevityText: "Donate today through Benevity or Goodstack—your contribution directly transforms lives of children in our orphanage and elders in our old age home, creating care, security, and a brighter tomorrow.",
  splatterImages: [
    "/images/SplatterImages/red splatter.png",
    "/images/SplatterImages/purple splatter.png", 
    "/images/SplatterImages/orange splatter.png",
    "/images/SplatterImages/green splatter.png"
  ],
  boardTitle: "Board Members",
  boardText: "Our board comprises passionate leaders with diverse expertise in social development, finance, and community service. They guide our vision with integrity, accountability, and a deep commitment to Dalit empowerment.",
  boardMembers: [
    {
      name: "S. Samuel",
      role: "President",
      image: "/images/SplatterImages/red splatter.png"
    },
    {
      name: "J. Nirmala",
      role: "V.President",
      image: "/images/SplatterImages/purple splatter.png"
    },
    {
      name: "B. Lakshmi",
      role: "Secretary",
      image: "/images/SplatterImages/orange splatter.png"
    },
    {
      name: "S. Sarojamma",
      role: "Treasurer",
      image: "/images/SplatterImages/green splatter.png"
    }
  ]
};


  return (
    <main>
      <HeroSection 
        belowText={{
          content: [
            {
              text: `For the past 32 years`,
              weight: "bold",
              color: "#004265"
            },
            {
              text: `, our organization has been working tirelessly to uplift Dalit
               communities and rural villages, striving to break cycles of poverty, inequality, and discrimination. 
               With a deep commitment to social justice and empowerment, we have focused on education, livelihood 
               opportunities, women's empowerment, and community development. Our journey has been one of resilience 
               and hope— ensuring that the most marginalized have access to dignity, equal opportunities, and a`,
            },
            {
              text: ` better future`,
              weight: "bold",
              color: "#004265"
            },
            {
              text: `.`,
            },
          ],
        }}
      />
      
      <DualContentBlock
        left={{
          title: "Goals",
          titleColor: "#FFFFFF",
          bgColor: "#004265",
          type: "list",
          content: [
            [
              { text: "End poverty & discrimination 🚫", weight: "normal", color: "#FFFFFF" },
            ],
            [
              { text: "Equal learning for every child 👧👦", weight: "normal", color: "#FFFFFF" },
            ],
            [
              { text: "Economic independence for families 💰", weight: "normal", color: "#FFFFFF" },
            ],
            [
              { text: "Strong, healthy communities 🌱", weight: "normal", color: "#FFFFFF" },
            ],
            [
              { text: "Self-reliant rural villages 🌾", weight: "normal", color: "#FFFFFF" },
            ],
            [
              { text: "Inclusive growth & participation 🌍", weight: "normal", color: "#FFFFFF" },
            ],
            [
              { text: "Respect and empowerment for Dalits 🌟", weight: "normal", color: "#FFFFFF" },
            ],
          ],
        }}
        right={{
          title: "Objectives",
          titleColor: "#000000",
          bgColor: "#9FDFFC",
          type: "list",
          content: [
            [
              { text: "Promote equality & justice ⚖️", weight: "normal", color: "#000000" },
            ],
            [
              { text: "Quality education for children 📚", weight: "normal", color: "#000000" },
            ],
            [
              { text: "Women's empowerment & livelihoods 👩‍👩‍👧", weight: "normal", color: "#000000" },
            ],
            [
              { text: "Better health & nutrition 🏥", weight: "normal", color: "#000000" },
            ],
            [
              { text: "Sustainable livelihoods & skills 🛠️", weight: "normal", color: "#000000" },
            ],
            [
              { text: "Community leadership 🤝", weight: "normal", color: "#000000" },
            ],
            [
              { text: "Rights & dignity advocacy ✊", weight: "normal", color: "#000000" },
            ],
          ],
        }}
      />
      
      <ProgramsGrid 
        programs={programsData}
        title="Our Programs"
      />
      
      <ImpactStats
        bgColor="#9FDFFC"
        textColor="#004265"
        people={5000}
        villages={140}
        programs={30}
      />
      
      <Testimonials testimonials={testimonials} />
      
      {/* Pass data to FeaturedProjects */}
      <FeaturedProjects 
        leftProjects={featuredProjectsData.leftProjects}
        rightNumbers={featuredProjectsData.rightNumbers}
      />
      
      <BenevityBoardSection
        benevityTitle={benevityBoardData.benevityTitle}
        benevityText={benevityBoardData.benevityText}
        splatterImages={benevityBoardData.splatterImages}
        boardTitle={benevityBoardData.boardTitle}
        boardText={benevityBoardData.boardText}
        boardMembers={benevityBoardData.boardMembers}
      />
      <WhyTrustUs />
      <TechPartners />
      <InfoForm />
    </main>
  );
}