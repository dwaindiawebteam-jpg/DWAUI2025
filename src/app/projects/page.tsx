export const revalidate = 60;

import HeroSection from "@/components/HeroSection";
import OngoingProjects from "@/components/projects/OngoingProjects";
import DualContentBlock from "@/components/DualContentBlock";
import InfoForm from "@/components/InfoForm";
import Testimonials from "@/components/Testimonials";
import ImageDivider from "@/components/projects/ImageDivider";
import Partners from "@/components/Partners";
import { getProjectsContent } from "@/lib/getProjectsContent";

export default async function ProjectsPage() {
  const projectsContent = await getProjectsContent();

  const heroData = projectsContent?.heroSection || {
    image: "/images/projectspage/project-hero-img.png",
    imageAlt: "Women from Dalit community",
    belowText: {
      title: "Our Projects",
      content: [
        {
          text: `This year, we successfully conducted impactful women empowerment, advocacy, and health awareness programs
            reaching over 5,000 women across 28 villages. These initiatives have strengthened women's voices, improved health
            practices, and created pathways for self-reliance and dignity within their communities. Our work has been made
            possible through the generous support of our major funding partners, including MEI USA, BASAID, and UCH, whose
            commitment has enabled us to expand our reach.`,
          color: "black",
        },
      ],
    },
  };

  const ongoingProjectsData = projectsContent?.ongoingProjects || {
    projects: []
  };

  const dualContent = {
    left: projectsContent?.dualContentBlock?.left || {
      title: "Dairy Project – Govindapalle",
      titleSize: "text-2xl md:text-3xl text-center sm:text-left",
      type: "list" as const,
      bgColor: "bg-purple",
      titleColor: "#FFFFFF",
      rows: [
        {
          label: { text: "Location", weight: "bold", color: "#FFFFFF" },
          value: { text: ": Govindapalle Village", weight: "normal", color: "#FFFFFF" },
        },
        {
          label: { text: "Beneficiaries", weight: "bold", color: "#FFFFFF" },
          value: { text: ": 40 women", weight: "normal", color: "#FFFFFF" },
        },
        {
          label: { text: "Budget", weight: "bold", color: "#FFFFFF" },
          value: { text: ": ₹20 lakhs", weight: "normal", color: "#FFFFFF" },
        },
        {
          label: { text: "Duration", weight: "bold", color: "#FFFFFF" },
          value: { text: ": 12 months", weight: "normal", color: "#FFFFFF" },
        },
        {
          label: { text: "Results: ", weight: "bold", color: "#FFFFFF" },
          value: { 
            text: `Women gained steady income, improved nutrition for families,
              and collective savings groups strengthened financial
              independence.`, 
            weight: "normal", 
            color: "#FFFFFF" 
          },
        },
      ],
    },
    right: projectsContent?.dualContentBlock?.right || {
      title: "Finance Awareness – Sirivella",
      titleSize: "text-2xl md:text-3xl text-center sm:text-left",
      type: "list" as const,
      bgColor: "bg-pink/50",
      titleColor: "#000000",
      rows: [
        {
          label: { text: "Location", weight: "bold", color: "#000000" },
          value: { text: ": 8 villages, Sirivella Mandal", weight: "normal", color: "#000000" },
        },
        {
          label: { text: "Beneficiaries", weight: "bold", color: "#000000" },
          value: { text: ": 700–800 women", weight: "normal", color: "#000000" },
        },
        {
          label: { text: "Budget", weight: "bold", color: "#000000" },
          value: { text: ": ₹12 lakhs", weight: "normal", color: "#000000" },
        },
        {
          label: { text: "Duration", weight: "bold", color: "#000000" },
          value: { text: ": 12 months", weight: "normal", color: "#000000" },
        },
        {
          label: { text: "Results: ", weight: "bold", color: "#000000" },
          value: { 
            text: `Women developed financial literacy, reduced debt reliance,
              adopted savings habits, and started small investments
              for household security.`, 
            weight: "normal", 
            color: "#000000" 
          },
        },
      ],
    },
  };

  const testimonialsData = projectsContent?.testimonials || {
    heading: "Testimonials",
    testimonials: [
      {
        name: "Y. Saramma",
        title: "Govindapalle",
        text: "With the support of Dalit Welfare Association, I started an income-generating activity that helps feed my family. This opportunity has given me confidence, stability, and hope for a better future.",
        splatterImage: "/images/SplatterImages/green splatter.png",
        splatterImageFileId: "",
      },
      {
        name: "Y. Saramma",
        title: "Govindapalle",
        text: "With the support of Dalit Welfare Association, I started an income-generating activity that helps feed my family. This opportunity has given me confidence, stability, and hope for a better future.",
        splatterImage: "/images/SplatterImages/red splatter.png",
        splatterImageFileId: "",
      },
      {
        name: "Y. Saramma",
        title: "Govindapalle",
        text: "With the support of Dalit Welfare Association, I started an income-generating activity that helps feed my family. This opportunity has given me confidence, stability, and hope for a better future.",
        splatterImage: "/images/SplatterImages/purple splatter.png",
        splatterImageFileId: "",
      },
    ],
  };

  const imageDividerData = projectsContent?.imageDivider || {
    image: "/images/projectspage/childern-in-class.png",
    imageAlt: "children in class",
    imageFileId: "",
  };

  const partnersData = projectsContent?.partners || {
    title: "Our Partners",
    partners: [
      "1% Fund", "Presbityerian Church", "Global Compassion", "Jiv Daya Fund", "Basaid", "UCH", "Grace Fund"
    ],
  };

  return (
    <main>
      {!projectsContent && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl text-center mb-4">Projects Content Coming Soon</h2>
          <p>Our projects page information is being prepared. Please check back later.</p>
        </div>
      )}

      {projectsContent && (
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

          <Testimonials testimonials={testimonialsData.testimonials} heading={testimonialsData.heading} />
          
          <ImageDivider
            src={imageDividerData.image}
            alt={imageDividerData.imageAlt}
          />

          
          <OngoingProjects projects={ongoingProjectsData.projects} />
           
        
          <Partners 
            title={partnersData.title}
            partners={partnersData.partners}
          />

          <InfoForm />
        </>
      )}
    </main>
  );
}