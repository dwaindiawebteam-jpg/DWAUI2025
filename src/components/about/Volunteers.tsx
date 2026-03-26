import Image from "next/image";

interface Volunteer {
  name: string;
  role: string;
  description: string;
  src: string;
  linkedin: string;
  bgColor: string;
}

interface VolunteersProps {
  volunteers: Volunteer[];
  heading?: string; // Required from outside, no fallback
}

const Volunteers: React.FC<VolunteersProps> = ({ volunteers, heading }) => {
  return (
    <section className="py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <h2 className="heading-responsive font-bold mb-8 text-black leading-tight">
        {heading}
      </h2>

      {/* Volunteers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {volunteers.map((volunteer, index) => (
          <div
            key={index}
            className={`p-2 ${volunteer.bgColor} flex flex-col sm:flex-row items-start max-w-xl w-full`}
          >
            {/* Image */}
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 w-full sm:w-60 max-w-xs h-40 sm:h-auto">
              <Image
                src={volunteer.src}
                alt={volunteer.name}
                width={350}
                height={350}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Text */}
            <div className="flex flex-col flex-1">
              <a
                href={volunteer.linkedin}
                className="text-[#3EBFF9] font-black text-lg mb-2 self-end"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <h3 className="text-2xl font-bold text-black">{volunteer.name}</h3>
              <p className="text-xl font-medium text-gray-700 mb-2">{volunteer.role}</p>
              <p className="text-base text-black">{volunteer.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Volunteers;