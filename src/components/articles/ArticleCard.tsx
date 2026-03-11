import Image from "next/image";
import { Article } from "@/types/Article";
import { Eye } from "lucide-react";


interface ArticleCardProps {
  article: Article;
  onDelete: () => void;
}

export default function ArticleCard({ article, onDelete }: ArticleCardProps) {
  const views = article.readCount ?? 0;
   // Normalize cover image (supports old string format + new ImageKit object)
  const coverUrl =
    typeof article.coverImage === "string"
      ? article.coverImage.trim()
      : article.coverImage?.url?.trim() || "";

  return (
    <div className="bg-white border border-[#BFDBFE] shadow-md p-5 flex flex-col hover:shadow-lg transition font-sans">
      
   
    {/* Featured Image */}
      {coverUrl && (
    <div className="relative w-full h-48 mb-5 overflow-hidden border border-[#BFDBFE]">
      <Image
        src={coverUrl}
        alt={article.coverImageAlt || article.title || "Article cover"}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 hover:scale-[1.03]"
        style={{
          objectPosition: article.coverImagePosition
            ? `${article.coverImagePosition.x}% ${article.coverImagePosition.y}%`
            : "50% 50%",
        }}
      />
    </div>
  )}

      {/* TITLE */}
      <h3 className="text-xl font-bold line-clamp-2 mb-3 font-sans">
        {article.title}
      </h3>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mb-4">
        {article.tags?.slice(0, 4).map((t) => (
          <span
            key={t}
            className="bg-[#BFDBFE] border border-[#BFDBFE] text-base px-3 py-1.5 font-medium font-sans!"
          >
            #{t}
          </span>
        ))}
      </div>

      {/* META DESCRIPTION - NOW EXPLICIT */}
      {article.metaDescription && (
        <p className=" text-base line-clamp-3 mb-4 font-sans">
          {article.metaDescription}
        </p>
      )}

     
      {/* STATUS + DATE + VIEWS */}
      <div className="flex items-center justify-between text-base mb-5 pt-4 border-t border-[#BFDBFE] font-sans">
        <span className={`font-semibold ${article.status === 'published' ? 'text-green-700' : 'text-amber-700'}`}>
          {article.status?.charAt(0).toUpperCase() + article.status?.slice(1)}
        </span>

        <div className="flex items-center gap-4">
          {/* Date */}
          <span className="font-medium text-base">
            {article.publishedAt?.toDate
              ? new Date(article.publishedAt.toDate()).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : article.updatedAt?.toDate
              ? new Date(article.updatedAt.toDate()).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "No date"}
          </span>

        </div>
      </div>


  
        {/* CONTROLS */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#BFDBFE] gap-3 font-sans!">
        <div className="flex gap-2">
            <a
            href={`/author/articles/edit/${article.id}`}
            className="px-4 py-2.5 bg-[#004265] text-white font-semibold hover:bg-[#3A4F63] text-base transition-colors font-sans!"
            >
            Edit
            </a>

            <a
            href={`/author/articles/preview/${article.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[#BFDBFE] border border-[#BFDBFE] text-[#2C3E50] font-semibold hover:bg-[#A6CBE7] transition-colors font-sans!"
            >
            Preview
            </a>
        </div>

        <button
            onClick={onDelete}
            className="px-4 py-2.5 bg-white border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors font-sans!"
        >
            Delete
        </button>
        </div>

    </div>
  );
}