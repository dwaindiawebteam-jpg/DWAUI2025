import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getProjectsContent } from "@/lib/getProjectsContent";
import PostImage from "@/components/projects/PostImage";
import PostContent from "@/components/projects/PostContent";
import InfoForm from "@/components/InfoForm";
import BackButton from "@/components/BackButton";
import { notFound } from "next/navigation";
import type { ProjectPost, OngoingProject } from "@/types/projects";

interface ProjectPostParams {
  params: {
    slug: string;
  };
}

export default async function ProjectsPost({ params }: ProjectPostParams) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch the detailed post content
  const postRef = doc(db, "projectPosts", slug);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    notFound();
  }

  const post = postSnap.data() as ProjectPost;
  
  // Fetch the ongoing projects to get the image URL
  const projectsContent = await getProjectsContent();
  const ongoingProject = projectsContent?.ongoingProjects?.projects.find(
    (p: OngoingProject) => p.slug === slug
  );
  
  // Use the project image from the ongoing project, or fallback to a default
  const projectImage = ongoingProject?.image || "/images/placeholder.jpg";

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
              {post.title}
            </h1>

            {/* Project Date */}
            {post.date && (
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-inter mb-6 justify-center text-center">
                <span>{post.date}</span>
              </div>
            )}

            {/* Project Image - using the main project image */}
            {projectImage && (
              <div className="mb-8">
                <PostImage 
                  src={projectImage} 
                  alt={post.title} 
                />
              </div>
            )}

            {/* Project Content */}
            <article className="article-content">
              <PostContent content={post.content} />
            </article>
          </div>

          {/* Info Form */}
          <InfoForm />
        </div>
      </div>
    </>
  );
}