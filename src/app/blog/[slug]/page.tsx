import { Inter } from "next/font/google";
import blogPosts from "@/data/blogPosts";
import PostHeader from "@/components/blog/PostHeader";
import PostImage from "@/components/blog/PostImage";
import PostContent from "@/components/blog/PostContent";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  image: string;
  content: string;
}

interface BlogPostParams {
  params: {
    slug: string;
  };
}

const inter = Inter({ subsets: ["latin"] });

export default async function BlogPost({ params }: BlogPostParams) {
  const resolvedParams = await params; // ← matches projects
  const slug = resolvedParams.slug;

  const post = blogPosts.find((p: BlogPost) => {
    const match = p.slug === slug;
    return match;
  });

  if (!post) {
    return null; // same pattern as projects
  }

  return (
    <div className={`px-8 lg:px-32 mt-10 ${inter.className}`}>
      <PostHeader title={post.title} date={post.date} />
      <PostImage src={post.image} alt={post.title} />
      <PostContent content={post.content} />
    </div>
  );
}