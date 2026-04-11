// lib/getHomeContent.ts
import { adminDb } from "@/lib/firebaseAdmin";
import { HomeContent } from "@/types/home";

export async function getHomeContent(): Promise<HomeContent | null> {
  try {
    const ref = adminDb.collection("siteContent").doc("home");
    const snap = await ref.get();

  //  console.log("Doc exists:", snap.exists);

    if (!snap.exists) {
    //  console.log("Document not found");
      return null;
    }

    const data = snap.data();
    //console.log("Fetched data:", data);

    // Return null if document exists but has no data
    if (!data) {
      return null;
    }

    // Return the complete home content with defaults for missing fields
    return {
      heroSection: data.heroSection || {
        content: [
          {
            text: `For the past 32 years`,
            weight: "bold",
            color: "#004265"
          },
          {
            text: `, our organization has been working tirelessly to uplift Dalit communities and rural villages...`,
            weight: "normal"
          }
        ],
        image: "/images/homepage/HomepageChildrenImage.jpg",
        imageFileId: ""
      },
      dualContentBlock: data.dualContentBlock || {
        left: {
          title: "Goals",
          titleColor: "#FFFFFF",
          bgColor: "bg-navy-blue",
          content: [
            { text: "End poverty & discrimination 🚫", weight: "normal", color: "#FFFFFF" },
            { text: "Equal learning for every child 👧👦", weight: "normal", color: "#FFFFFF" },
            { text: "Economic independence for families 💰", weight: "normal", color: "#FFFFFF" },
            { text: "Strong, healthy communities 🌱", weight: "normal", color: "#FFFFFF" },
            { text: "Self-reliant rural villages 🌾", weight: "normal", color: "#FFFFFF" },
            { text: "Inclusive growth & participation 🌍", weight: "normal", color: "#FFFFFF" },
            { text: "Respect and empowerment for Dalits 🌟", weight: "normal", color: "#FFFFFF" }
          ]
        },
        right: {
          title: "Objectives",
          titleColor: "#000000",
          bgColor: "bg-blue/50",
          content: [
            { text: "Promote equality & justice ⚖️", weight: "normal", color: "#000000" },
            { text: "Quality education for children 📚", weight: "normal", color: "#000000" },
            { text: "Women's empowerment & livelihoods 👩‍👩‍👧", weight: "normal", color: "#000000" },
            { text: "Better health & nutrition 🏥", weight: "normal", color: "#000000" },
            { text: "Sustainable livelihoods & skills 🛠️", weight: "normal", color: "#000000" },
            { text: "Community leadership 🤝", weight: "normal", color: "#000000" },
            { text: "Rights & dignity advocacy ✊", weight: "normal", color: "#000000" }
          ]
        }
      },
      programs: data.programs || {
        title: "Our Programs",
        items: []
      },
      impactStats: data.impactStats || {
        bgColor: "bg-blue/50",
        textColor: "#004265",
        people: 5000,
        villages: 140,
        programs: 30
      },
      testimonials: data.testimonials || [],
      featuredProjects: data.featuredProjects || {
        leftProjects: [],
        rightNumbers: []
      },
      benevityBoard: data.benevityBoard || {
        benevityTitle: "Benevity & Goodstack",
        benevityText: "Donate today through Benevity or Goodstack...",
        splatterImages: [],
        splatterImageFileIds: [],
        boardTitle: "Board Members",
        boardText: "Our board comprises passionate leaders...",
        boardMembers: []
      },
      whyTrustUs: data.whyTrustUs || {
        title: "Why Trust Us",
        content: [
          { text: "We ensure complete transparency and accountability...", weight: "normal" }
        ],
        bgColor: "#9FDFFC"
      },
      partners: data.partners || {
        title: "Tech Partners",
        partners: []
      }
    } as HomeContent;
  } catch (error) {
   // console.error("Error fetching home content:", error);
    return null;
  }
}