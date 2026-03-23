import HeroSection from "@/components/HeroSection"
import FeaturedStories from "@/components/resources/FeaturedStories"
import ProjectsGallery from "@/components/resources/ProjectsGallery"
import OrphanageOldageHome from "@/components/resources/OrphanageOldageHome"
import AnnualReports from "@/components/resources/AnnualReports"
import InfoForm from "@/components/InfoForm"


export default function ResourcesPage() {

    const storiesData = [
    {
      id: 1,
      title: "Livelihoods, micro-credit and economic empowerment for Dalit and rural families",
      image: "/images/resourcespage/Feature Stories Card Component Image.png"
    },
    {
      id: 2,
      title: "Livelihoods, micro-credit and economic empowerment for Dalit and rural families",
      image: "/images/resourcespage/Feature Stories Card Component Image.png"
    },
    {
      id: 3,
      title: "Livelihoods, micro-credit and economic empowerment for Dalit and rural families",
      image: "/images/resourcespage/Feature Stories Card Component Image.png"
    }
  ];

  const galleryData = [
  {
    title: "Title 1",
    images: [
      "/images/resourcespage/1st image middle section.jpg",
      "/images/resourcespage/2nd image middle section.jpg",
      "/images/resourcespage/3rd image middle section.jpg",
      "/images/resourcespage/4th image middle section.jpg"
    ]
  },
  {
    title: "Title 2",
    images: [
      "/images/resourcespage/1st image middle section.jpg",
      "/images/resourcespage/2nd image middle section.jpg",
      "/images/resourcespage/3rd image middle section.jpg",
      "/images/resourcespage/4th image middle section.jpg"
    ]
  }
];

const facilityData = [
  {
    title: "Budaga Jangal Hostel (Orphanage)",
    images: [
      "/images/resourcespage/1st image middle section.jpg",
      "/images/resourcespage/2nd image middle section.jpg",
      "/images/resourcespage/3rd image middle section.jpg",
      "/images/resourcespage/4th image middle section.jpg"
    ]
  },
  {
    title: "Old Age Home",
    images: [
      "/images/resourcespage/1st image middle section.jpg",
      "/images/resourcespage/2nd image middle section.jpg",
      "/images/resourcespage/3rd image middle section.jpg",
      "/images/resourcespage/4th image middle section.jpg"
    ]
  }
];

const reports = [
  { year: 2024, url: '/apply' },
  { year: 2023, url: '/apply' },
  { year: 2022, url: '/apply' },
  { year: 2021, url: '/apply' },
  { year: 2020, url: '/apply' },
];

  return (
    <main className="">
      <HeroSection
        imageSrc="/images/resourcespage/resources page header image.png"
        imageAlt="school kids from Dalit community"
        belowSectionBackground="#FD7E14"
        belowText={{
          title: "DWA Resources",
          content: [
            {
              text: `The resources we share bring together knowledge, insights, and practical guidance from our network.
                        Whether you’re a supporter, partner, or community member, you’ll find tools here to help you learn, grow,
                        and make a difference..`,
              color: "black",
            },
          ],
        }}
      />
      <FeaturedStories stories={storiesData} />
      <ProjectsGallery sections={galleryData} />
      <OrphanageOldageHome sections={facilityData} />
      <AnnualReports reports={reports} />
      <InfoForm />
    </main>
  )
}