import { getArticleBySlug } from "@/lib/articles/getArticleBySlug";
import { getArticleById } from "@/lib/articles/getArticleById";
import Image from "next/image";
import ArticleRenderer from "@/components/articles/ArticleRenderer";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import BackButton from "@/components/BackButton";
import TrackRead from "@/components/blog/TrackRead";
import { getCoverUrl } from "@/utils/getCoverUrl";


function looksLikeId(value: string) {
  // UUID v4
  const uuidV4 =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4.test(value);
}


export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  const isId = looksLikeId(slug);

  const post = isId
    ? await getArticleById(slug)
    : await getArticleBySlug(slug);

  if (!post) {
    return {
      title: "Article not found",
      description: "This article could not be found.",
    };
  }

const coverUrl = getCoverUrl(post.coverImage);

  return {
  title: post.title,
  description: post.metaDescription || post.title,
  openGraph: {
    title: post.title,
    description: post.metaDescription || post.title,
    images: coverUrl
      ? [
          {
            url: coverUrl,
            alt: post.coverImageAlt || post.title,
          },
        ]
      : [],
  },
  twitter: {
    card: "summary_large_image",
    title: post.title,
    description: post.metaDescription || post.title,
    images: coverUrl ? [coverUrl] : [],
  },
};
}


export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const isId = looksLikeId(slug);

  const post = isId
    ? await getArticleById(slug)
    : await getArticleBySlug(slug);

  if (!post) {
    notFound();
  }

  // ✅ canonical redirect
  if (isId && post.slug) {
    redirect(`/blog/${post.slug}`);
  }

const coverUrl = getCoverUrl(post.coverImage);

  return (
    <>
    <TrackRead articleId={post.id} />

    <div className="min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        
        {/* Back button - matching preview page */}
        <BackButton />


        {/* Article Card - matching preview page design */}
      <div className="shadow-xl p-6 sm:p-8 border border-gray-200">


          {/* Article Header */}
          <h1 className="font-cinzel text-[22px] sm:text-[26px] lg:text-[30px] font-bold min-w-0 break-words text-center mb-4">
            {post.title}
          </h1>
          
          {/* Article Meta */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-inter mb-6 justify-center text-center">
            <span className="font-semibold">{post.authorName || "Author"}</span>
            <span className="hidden sm:inline">•</span>
            <span>
              <span>
             {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : null}
              </span>

            </span>
            {post.readTime && (
              <>
                <span className="hidden sm:inline">•</span>
                <span>{post.readTime} min read</span>
              </>
            )}
          </div>

          {/* Featured Image */}
          {coverUrl && (
            <div className="mb-8">
              <div className="relative w-full h-64 sm:h-96 lg:h-[500px] overflow-hidden border border-[#BFDBFE]">
               <Image
                  src={coverUrl}
                  alt={post.coverImageAlt || post.title || "Article cover"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  style={{
                    objectPosition: post.coverImagePosition
                      ? `${post.coverImagePosition.x}% ${post.coverImagePosition.y}%`
                      : "50% 50%",
                  }}
                  priority
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <article className="article-content">
            <ArticleRenderer content={post.body} />
          </article>
        </div>
      </div>


    </div>
    </>
  );
}