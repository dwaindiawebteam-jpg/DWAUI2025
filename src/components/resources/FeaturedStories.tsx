import Image from "next/image";
import Link from "next/link";

interface Story {
  title: string;
  image: string;
  slug: string;
}

interface FeaturedStoriesProps {
  stories: Story[]; // Required prop, no fallback
  heading: string; // Required prop, no fallback
  subheading: string; // Required prop, no fallback
}

const FeaturedStories: React.FC<FeaturedStoriesProps> = ({ 
  stories,
  heading,
  subheading
}) => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-2 heading-responsive">
            {heading}
          </h2>
          <p className="text-xl! font-semibold text-center sm:text-left">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story: Story) => (
            <Link
              key={story.slug}
              href={`/resources/${story.slug}`}
              className="bg-white overflow-hidden shadow-md border border-gray-200 flex flex-row hover:shadow-lg transition cursor-pointer"
            >
              <div className="relative w-32 flex-shrink-0 self-stretch">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <div className="p-4 flex items-center">
                <p className="text-sm text-gray-900 leading-relaxed">
                  {story.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedStories;