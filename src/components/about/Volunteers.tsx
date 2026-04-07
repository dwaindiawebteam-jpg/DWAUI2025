// components/about/Volunteers.tsx
import Image from "next/image";

interface Volunteer {
  name: string;
  role: string;
  description: string;
  src?: string;
  image?: string;
  linkedin?: string;
  bgColor: string;
}

interface VolunteersProps {
  volunteers: Volunteer[];
  heading?: string;
}

/* ------------------------------------------------------------------ */
/*  DESKTOP VERSION                                                   */
/* ------------------------------------------------------------------ */

const VolunteersDesktop: React.FC<VolunteersProps> = ({ volunteers, heading }) => {
  return (
    <section className="py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="heading-responsive font-bold mb-8 text-black leading-tight">
        {heading}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {volunteers.map((volunteer, index) => (
          <div
            key={index}
            className={`p-2 ${volunteer.bgColor} flex flex-col sm:flex-row items-start max-w-xl w-full min-h-60`}
          >
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 w-full sm:w-60 max-w-xs h-full sm:h-full">
              <Image
                src={volunteer.src || volunteer.image || ""}
                alt={volunteer.name}
                width={350}
                height={350}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex flex-col flex-1">
              {volunteer.linkedin && (
                <a
                  href={volunteer.linkedin}
                  className="text-[#3EBFF9] font-black text-lg mb-2 self-end"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              )}
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

/* ------------------------------------------------------------------ */
/*  MOBILE VERSION                                                    */
/* ------------------------------------------------------------------ */

const VolunteersMobile: React.FC<VolunteersProps> = ({ volunteers, heading }) => {
  return (
    <section className="py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="heading-responsive font-bold mb-8 text-black leading-tight">
        {heading}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {volunteers.map((volunteer, index) => (
          <div
            key={index}
            className={`p-2 ${volunteer.bgColor} flex flex-col sm:flex-row items-start max-w-xl w-full`}
          >
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 w-full sm:w-60 max-w-xs h-40 sm:h-auto">
              <Image
                src={volunteer.src || volunteer.image || ""}
                alt={volunteer.name}
                width={350}
                height={350}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex flex-col flex-1">
              {volunteer.linkedin && (
                <a
                  href={volunteer.linkedin}
                  className="text-[#3EBFF9] font-black text-lg mb-2 self-end"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              )}
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

/* ------------------------------------------------------------------ */
/*  WRAPPER: SWITCH VIEW BASED ON SCREEN SIZE                         */
/* ------------------------------------------------------------------ */

const Volunteers: React.FC<VolunteersProps> = ({ volunteers, heading }) => {
  return (
    <>
      {/* Mobile */}
      <div className="block lg:hidden">
        <VolunteersMobile volunteers={volunteers} heading={heading} />
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <VolunteersDesktop volunteers={volunteers} heading={heading} />
      </div>
    </>
  );
};

export default Volunteers;