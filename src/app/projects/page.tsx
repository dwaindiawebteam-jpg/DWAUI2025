import HeroSection from "@/components/HeroSection";
import OngoingProjects from "@/components/projects/OngoingProjects";
import DualContentBlock from "@/components/DualContentBlock";
import InfoForm from "@/components/InfoForm";
import Testimonials from "@/components/Testimonials";
import ImageDivider from "@/components/projects/ImageDivider";
import Partners from "@/components/Partners";


export default function ProjectsPage() {

  const testimonials = [
  {
    name: "Y. Saramma",
    title: "Govindapalle",
    text: "With the support of Dalit Welfare Association, I started an income-generating activity that helps feed my family. This opportunity has given me confidence, stability, and hope for a better future.",
    splatterImage: "/images/SplatterImages/green splatter.png"
  },
  {
    name: "Y. Saramma",
    title: "Govindapalle",
    text: "With the support of Dalit Welfare Association, I started an income-generating activity that helps feed my family. This opportunity has given me confidence, stability, and hope for a better future.",
    splatterImage: "/images/SplatterImages/red splatter.png"
  },
  {
    name: "Y. Saramma",
    title: "Govindapalle",
    text: "With the support of Dalit Welfare Association, I started an income-generating activity that helps feed my family. This opportunity has given me confidence, stability, and hope for a better future.",
    splatterImage: "/images/SplatterImages/purple splatter.png"
  }
];

  return (
    <main>
      <HeroSection
        imageSrc="/images/projectspage/project-hero-img.png"
        imageAlt="Women from Dalit community"
        belowText={{
          title: "Previous Projects",
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
        }}
      />

      <DualContentBlock
        left={{
          title: "Dairy Project – Govindapalle",
          titleSize: "text-2xl md:text-3xl text-center sm:text-left",
          type: "list",
          bgColor: "bg-purple",
          titleColor: "#FFFFFF",
          content: [
            [
              { text: "Location", weight: "bold", color: "#FFFFFF" },
              { text: ": Govindapalle Village", weight: "normal", color: "#FFFFFF" },
            ],
            [
              { text: "Beneficiaries", weight: "bold", color: "#FFFFFF" },
              { text: ": 40 women", weight: "normal", color: "#FFFFFF" },
            ],
            [
              { text: "Budget", weight: "bold", color: "#FFFFFF" },
              { text: ": ₹20 lakhs", weight: "normal", color: "#FFFFFF" },
            ],
            [
              { text: "Duration", weight: "bold", color: "#FFFFFF" },
              { text: ": 12 months", weight: "normal", color: "#FFFFFF" },
            ],
            [
              { text: "Results: ", weight: "bold", color: "#FFFFFF" },
              { text: `Women gained steady income, improved nutrition for families,
                and collective savings groups strengthened financial
                independence.`, weight: "normal", color: "#FFFFFF" },
            ],
          ],
        }}
        right={{
          title: "Finance Awareness – Sirivella",
          titleSize: "text-2xl md:text-3xl text-center sm:text-left",
          type: "list",
          bgColor: "bg-pink/50",
          content: [
            [
              { text: "Location", weight: "bold", color: "#000000" },
              { text: ": 8 villages, Sirivella Mandal", weight: "normal", color: "#000000" },
            ],
            [
              { text: "Beneficiaries", weight: "bold", color: "#000000" },
              { text: ": 700–800 women", weight: "normal", color: "#000000" },
            ],
            [
              { text: "Budget", weight: "bold", color: "#000000" },
              { text: ": ₹12 lakhs", weight: "normal", color: "#000000" },
            ],
            [
              { text: "Duration", weight: "bold", color: "#000000" },
              { text: ": 12 months", weight: "normal", color: "#000000" },
            ],
            [
              { text: "Results: ", weight: "bold", color: "#000000" },
              { text: `Women developed financial literacy, reduced debt reliance,
                adopted savings habits, and started small investments
                for household security.`, weight: "normal", color: "#000000" },
            ],
          ],
        }}
      />

      <Testimonials testimonials={testimonials} />
      <ImageDivider
          src="/images/projectspage/childern-in-class.png"
          alt="children in class"
        />
      <OngoingProjects />

       <Partners 
        title="Our Partners"
        partners={[
          "1% Fund", "Presbityerian Church", "Global Compassion", "Jiv Daya Fund", "Basaid", "UCH", "Grace Fund"
        ]} />

      <InfoForm />
    </main>
  );
}