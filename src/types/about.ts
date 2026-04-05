// types/about.ts
export interface AboutTextSegment {
  text: string;
  weight?: "normal" | "bold" | "light" | "medium" | "semibold";
  color?: string;
}

export interface AboutTeamMember {
  name: string;
  role: string;
  image: string;
  imageFileId: string;
}

export interface AboutVolunteer {
  name: string;
  role: string;
  description: string;
  image: string;
  imageFileId: string;
  linkedin?: string;
  bgColor: string;
}

export interface AboutAccreditationParagraph {
  text: string;
  weight?: "normal" | "bold" | "light" | "medium" | "semibold"; 
}

export interface AboutContent {
  heroSection: {
    image: string;
    imageFileId: string;
    imageAlt: string;
    belowText: {
      title: string;
      titleColor: string;
      content: AboutTextSegment[];
    };
  };
  dualContentBlock: {
    left: {
      title: string;
      titleColor: string;
      bgColor: string;
      type: string;
      content: AboutTextSegment[];  // Changed from AboutTextSegment[][]
    };
    right: {
      title: string;
      titleColor: string;
      bgColor: string;
      type: string;
      content: AboutTextSegment[];  // Changed from AboutTextSegment[][]
    };
  };
  accreditations: {
    heading: string;
    paragraph: AboutAccreditationParagraph[];
    logos: string[];
    logoFileIds: string[];
  };
  impactStats: {
    bgColor: string;
    textColor: string;
    people: number;
    villages: number;
    programs: number;
  };
  team: {
    heading: string;
    paragraph: string;
    teamMembers: AboutTeamMember[];
  };
  volunteers: {
    heading: string;
    volunteers: AboutVolunteer[];
  };
  workAreas: {
    // WorkAreas component might have its own content structure
    // Keeping as empty object for now as it wasn't specified
  };
  presidentMessage: {
    image: string;
    imageFileId: string;
    imageAlt: string;
    title: string;
    paragraphs: string[];
    authorName: string;
    authorTitle: string;
  };
}