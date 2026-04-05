// lib/getAboutContent.ts
import { adminDb } from "@/lib/firebaseAdmin";
import { AboutContent } from "@/types/about";

export async function getAboutContent(): Promise<AboutContent | null> {
  try {
    const ref = adminDb.collection("siteContent").doc("about");
    const snap = await ref.get();

    console.log("About doc exists:", snap.exists);

    if (!snap.exists) {
      console.log("About document not found");
      return null;
    }

    const data = snap.data();
    console.log("Fetched about data:", data);

    if (!data) {
      return null;
    }

    // Return the complete about content with defaults for missing fields
    return {
      heroSection: data.heroSection || {
        image: "/images/aboutpage/kids.jpg",
        imageFileId: "",
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
      },
      dualContentBlock: data.dualContentBlock || {
        left: {
          title: "Vision",
          titleColor: "#000000",
          bgColor: "bg-orange",
          type: "paragraph",
          content: [
            {
              text: `To build an inclusive society where Dalit women thrive with dignity, equality, 
            and opportunity—breaking poverty cycles and creating sustainable, 
            empowered communities for generations to come.`,
              weight: "medium",
              color: "#000",
            },
          ],
        },
        right: {
          title: "Mission",
          titleColor: "#000000",
          bgColor: "bg-yellow",
          type: "paragraph",
          content: [
            {
              text: `To empower marginalized women through micro-credit, financial education, 
            and livelihoods—strengthening families, fostering community resilience, and 
            ensuring sustainable, grassroots-driven change rooted in dignity, justice, 
            and equality.`,
              weight: "medium",
              color: "#000",
            },
          ],
        }
      },
      accreditations: data.accreditations || {
        heading: "Accreditations",
        paragraph: [
          { text: "Dalit Welfare Association is a legally registered nonprofit organization, governed by all statutory requirements under Indian law. We hold valid " },
          { text: "Registration Certificates", weight: "bold" },
          { text: ", " },
          { text: "12A & 80G tax exemption approvals", weight: "bold" },
          { text: ", and maintain compliance with the " },
          { text: "FCRA (Foreign Contribution Regulation Act)", weight: "bold" },
          { text: " to receive international donations. Our financial records are audited annually, ensuring transparency, accountability, and trust with donors, partners, and the communities we serve." }
        ],
        logos: [
          "/images/aboutpage/givedo.png",
          "/images/aboutpage/guidestarindia.png",
          "/images/aboutpage/benevity.png",
          "/images/aboutpage/goodstack.png"
        ],
        logoFileIds: []
      },
      impactStats: data.impactStats || {
        bgColor: "bg-yellow",
        textColor: "#000",
        people: 5000,
        villages: 140,
        programs: 30
      },
      team: data.team || {
        heading: "DWA Team",
        paragraph: "Our dedicated team works tirelessly in the field and office, bringing passion, skills, and commitment to empower Dalit communities and drive lasting change in rural Nandyal and Kurnool.",
        teamMembers: [
          { 
            name: "S. Moses", 
            role: "Program Manager", 
            image: "/images/SplatterImages/green splatter.png",
            imageFileId: ""
          },
          { 
            name: "K. Saroja", 
            role: "Field Work", 
            image: "/images/SplatterImages/green splatter.png",
            imageFileId: ""
          },
          { 
            name: "G. Bhaskar", 
            role: "Office Staff", 
            image: "/images/SplatterImages/green splatter.png",
            imageFileId: ""
          },
          { 
            name: "P. Danielu", 
            role: "Field Work", 
            image: "/images/SplatterImages/green splatter.png",
            imageFileId: ""
          },
          { 
            name: "N. Sudha Rani", 
            role: "Field Work", 
            image: "/images/SplatterImages/green splatter.png",
            imageFileId: ""
          },
          { 
            name: "K. Bujji", 
            role: "Office Work", 
            image: "/images/SplatterImages/green splatter.png",
            imageFileId: ""
          },
        ]
      },
      volunteers: data.volunteers || {
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
      },
      workAreas: data.workAreas || {},
      presidentMessage: data.presidentMessage || {
        image: "/images/SplatterImages/purple splatter.png",
        imageFileId: "",
        imageAlt: "President message",
        title: "Breaking Barriers, Restoring Dignity",
        paragraphs: [
          "As President of DWA, I have seen how deeply caste discrimination and poverty affect Dalit families. Education, livelihoods, and women's empowerment are powerful tools we use to confront these injustices.",
          "Our efforts in rural Nandyal and Kurnool are small steps toward equality, but with strong partnerships, these steps become transformative. Together, we can dismantle barriers and create a society where Dalits live with dignity and opportunity."
        ],
        authorName: "S. Samuel",
        authorTitle: "President"
      }
    } as AboutContent;
  } catch (error) {
    console.error("Error fetching about content:", error);
    return null;
  }
}