import projectPosts from "@/data/projectPosts";
import PostHeader from "@/components/projects/PostHeader";
import PostImage from "@/components/projects/PostImage";
import PostContent from "@/components/projects/PostContent";
import InfoForm from "@/components/InfoForm";
import BackButton from "@/components/BackButton";
import { notFound } from "next/navigation";

interface ProjectPostParams {
  params: {
    slug: string;
  };
}

export default async function ProjectsPost({ params }: ProjectPostParams) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const ongoingProjectPosts = projectPosts.find((p) => p.slug === slug);

  if (!ongoingProjectPosts) {
    notFound();
  }

  return (
    <>
      <div className="min-h-screen py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <BackButton />

          {/* Project Card */}
          <div className="shadow-xl p-6 sm:p-8 border border-gray-200">
            {/* Project Header */}
            <h1 className="font-cinzel text-[22px] sm:text-[26px] lg:text-[30px] font-bold min-w-0 break-words text-center mb-4">
              {ongoingProjectPosts.title}
            </h1>

            {/* Project Date */}
            {ongoingProjectPosts.date && (
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-inter mb-6 justify-center text-center">
                <span>
                  {new Date(ongoingProjectPosts.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}

            {/* Project Image */}
            {ongoingProjectPosts.splatterImage && (
              <div className="mb-8">
                <PostImage 
                  src={ongoingProjectPosts.splatterImage} 
                  alt={ongoingProjectPosts.title} 
                />
              </div>
            )}

            {/* Project Content */}
            <article className="article-content">
              <PostContent content={ongoingProjectPosts.content} />
            </article>
          </div>

          {/* Info Form */}
          <InfoForm />
        </div>
      </div>
    </>
  );
}