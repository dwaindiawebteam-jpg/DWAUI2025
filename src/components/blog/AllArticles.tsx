import Image from "next/image";
import ArticleCardClient from "./ArticleCardClient";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string | { url: string };
  slug: string;
  category?: string;
  updatedAt?: string | number | Date;
}

export default function AllArticles({
  articles,
}: {
  articles: Article[];
}) {
  return (
    <div className="w-full mt-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

        {articles.map((article) => {
          const coverUrl =
            typeof article.coverImage === "string"
              ? article.coverImage.trim()
              : article.coverImage?.url?.trim() || "";

          return (
            <ArticleCardClient key={article.id} href={`/blog/${article.slug}`}>
             <article className="flex flex-col lg:flex-row items-stretch bg-white shadow-md overflow-hidden w-full h-full max-w-2xl mx-auto hover:shadow-lg transition cursor-pointer">

                {/* Image */}
                <div className="relative lg:w-1/2 w-full min-h-[200px] lg:min-h-0">
                  <Image
                    src={coverUrl || "/images/blogpage/handsingrass.jpg"}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
               <div className="flex flex-col justify-between p-4 w-full lg:w-1/2 text-center lg:text-left">
                  <div className="mx-auto lg:mx-0">
                    <h2 className="font-bold text-xl mb-2">
                    {article.title}
                    </h2>

                    <p className="text-gray-700">
                    {article.excerpt}
                    </p>
                </div>

                  <div className="flex items-center justify-center mt-4 text-gray-500 text-sm space-x-4">
                    <div className="px-4 py-2 bg-[#7F4592] text-white font-semibold hover:bg-[#693770] transition">
                      View Post
                    </div>

                    {article.updatedAt && (
                      <span className="border-l border-gray-300 pl-4">
                        {new Date(article.updatedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

              </article>
            </ArticleCardClient>
          );
        })}

      </div>
    </div>
  );
}