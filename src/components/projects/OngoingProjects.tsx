import Image from "next/image";
import Link from "next/link";
import { OngoingProject } from "@/types/projects";

// Props for the main component
interface OngoingProjectsProps {
  projects: OngoingProject[];
  sectionTitle?: string; // Optional title override
}

export default function OngoingProjects({ projects, sectionTitle }: OngoingProjectsProps) {
  return (
    <section className="pb-16 bg-pink/50">
      {/* Ongoing projects Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pt-10">
        <h1 className="heading-responsive font-bold text-gray-900 mb-8">
          {sectionTitle || "Ongoing Projects"}
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed">
            Our ongoing projects include <span className="font-bold">Digital Literacy</span> and <span className="font-bold">Menstrual Health</span> Awareness,
            directly advancing <span className="font-bold">SDG 4 (Quality Education), SDG 3 (Good Health), and SDG 5 (Gender Equality)</span> in rural Dalit communities.
          </p>
        </div>
      </div>

      {/* Ongoing project cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => {
            if (index % 2)
              return <ProjectCardRight key={project.id} project={project} />;

            return <ProjectCardLeft key={project.id} project={project} />;
          })}
        </div>
      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: OngoingProject;
}

function ProjectCardLeft({ project }: ProjectCardProps) {
  return (
    <div className="bg-white overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition">
      {/* Project Image */}
      <div className="relative w-full sm:w-55 h-64 sm:h-auto flex-shrink-0">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-2xl! font-bold mb-5">
            {project.title}
          </h3>
          <p className="text-sm leading-relaxed">
            {project.description}
          </p>
        </div>
        <Link 
          href={`/projects/${project.slug}`} 
          className="px-6 py-1 text-white mt-4 sm:mt-6 self-start bg-[#622676] font-semibold hover:bg-purple transition cursor-pointer inline-block"
        >
          Read More
        </Link>
      </div>
    </div>
  );
}

function ProjectCardRight({ project }: ProjectCardProps) {
  return (
    <div className="bg-white overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition">
      {/* Card content */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-2xl! font-bold mb-5">
            {project.title}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {project.description}
          </p>
        </div>
        <Link 
          href={`/projects/${project.slug}`} 
          className="px-6 py-1 text-white mt-4 sm:mt-6 self-start bg-[#622676] font-semibold hover:bg-purple transition cursor-pointer inline-block"
        >
          Read More
        </Link>
      </div>

      {/* Project Image */}
      <div className="relative w-full sm:w-55 h-64 sm:h-auto flex-shrink-0">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
    </div>
  );
}