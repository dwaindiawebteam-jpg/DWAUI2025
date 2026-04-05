// components/about/AboutTeam.tsx
import Image from "next/image";

interface TeamMember {
  name: string;
  role: string;
  src?: string;  // Make optional
  image?: string; // Add image as an alternative
}

interface AboutTeamProps {
  teamMembers: TeamMember[];
  heading?: string;
  paragraph?: string;
}

const AboutTeam: React.FC<AboutTeamProps> = ({ teamMembers, heading, paragraph }) => {
  return (
    <section className="pt-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <h2 className="heading-responsive font-bold mb-8 text-black leading-tight mx-auto">
        {heading}
      </h2>

      {/* Paragraph */}
      <p className="text-base sm:text-lg text-black leading-relaxed mx-auto mb-12 text-center sm:text-left">
        {paragraph}
      </p>

      {/* Team Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mx-auto">
        {teamMembers.map((member, index) => (
          <div key={index} className="text-center">
            <Image
              src={member.src || member.image || ""}
              alt={member.name}
              width={200}
              height={200}
              className="mx-auto object-cover rounded-md"
            />
            <h3 className="text-2xl mt-4 font-bold text-black">{member.name}</h3>
            <p className="text-xl font-medium text-gray-700">{member.role}</p>
          </div>
        ))}
      </div>

      <div className="mt-18 h-[2px] bg-black w-full"></div>
    </section>
  );
};

export default AboutTeam;