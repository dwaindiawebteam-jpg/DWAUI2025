// app/resources/[slug]/page.tsx
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import PostImage from "@/components/projects/PostImage";
import PostContent from "@/components/projects/PostContent";
import InfoForm from "@/components/InfoForm";
import BackButton from "@/components/BackButton";
import { notFound } from "next/navigation";
import { StoryPost } from "@/types/resources";

interface ResourcePostParams {
  params: {
    slug: string;
  };
}

export default async function ResourcePostPage({ params }: ResourcePostParams) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch from Firebase Firestore
  const postRef = doc(db, "storyPosts", slug);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    notFound();
  }

  const storyPost = postSnap.data() as StoryPost;

  return (
    <>
      <div className="min-h-screen py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <BackButton />

          {/* Resource Card */}
          <div className="shadow-xl p-6 sm:p-8 border border-gray-200">
            {/* Resource Header */}
            <h1 className="font-cinzel text-[22px] sm:text-[26px] lg:text-[30px] font-bold min-w-0 break-words text-center mb-4">
              {storyPost.title}
            </h1>

            {/* Resource Date and Read Time */}
            {(storyPost.date || storyPost.readTime) && (
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-inter mb-6 justify-center text-center">
                {storyPost.date && (
                  <span>
                    {new Date(storyPost.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                {storyPost.readTime && (
                  <span className="text-gray-600">{storyPost.readTime}</span>
                )}
              </div>
            )}

            {/* Resource Image */}
            {storyPost.image && (
              <div className="mb-8">
                <PostImage 
                  src={storyPost.image} 
                  alt={storyPost.title} 
                />
              </div>
            )}

            {/* Resource Content */}
            <article className="article-content">
              <PostContent content={storyPost.content} />
            </article>
          </div>

          {/* Info Form */}
          <InfoForm />
        </div>
      </div>
    </>
  );
}