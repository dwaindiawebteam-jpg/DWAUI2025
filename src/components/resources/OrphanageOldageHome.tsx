import Image from "next/image";
import GalleryLightbox from "./GalleryLightbox";

interface FacilitySection {
  title: string;
  images: string[];
}

interface OrphanageOldageHomeProps {
  sections: FacilitySection[];
}

const OrphanageOldageHome: React.FC<OrphanageOldageHomeProps> = ({ sections }) => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="heading-responsive font-bold text-black mb-6">
          Orphanage & Oldage Home
        </h2>

        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={sectionIndex === 0 ? "mb-12" : ""}>
            <h3 className="text-2xl font-semibold text-black mb-6">
              {section.title}
            </h3>
            <GalleryLightbox 
              images={section.images} 
              title={section.title} 
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default OrphanageOldageHome;