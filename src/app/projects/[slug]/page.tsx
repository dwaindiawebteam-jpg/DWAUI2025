import projectPosts from "@/data/projectPosts";
import PostHeader from "@/components/projects/PostHeader";
import PostImage from "@/components/projects/PostImage";
import PostContent from "@/components/projects/PostContent";
import GetMoreInfo from "@/components/home/GetMoreInfo";

interface ProjectPostParams {
  params: {
    slug: string;
  };
}

export default async function ProjectsPost({ params }: ProjectPostParams) {
  const resolvedParams = await params; // ← important
  const slug = resolvedParams.slug;


  const ongoingProjectPosts = projectPosts.find((p) => {
    const match = p.slug === slug;
    return match;
  });

  if (!ongoingProjectPosts) {
    return null; // or notFound();
  }

  return (
    <>
      <div className="px-8 lg:px-32 mt-10">
        <PostHeader title={ongoingProjectPosts.title} date={ongoingProjectPosts.date} />
        <PostImage src={ongoingProjectPosts.splatterImage} alt={ongoingProjectPosts.title} />
        <PostContent content={ongoingProjectPosts.content} />
      </div>
      <GetMoreInfo />
    </>
  );
}