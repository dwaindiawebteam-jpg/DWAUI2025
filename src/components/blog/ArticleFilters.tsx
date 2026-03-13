"use client";

import { useEffect, useMemo, useState, ChangeEvent, FormEvent } from "react";
import AllArticles from "./AllArticles";
import { useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 9;

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  slug: string;
  updatedAt: string | number | Date;
  readCount: number;
}

export default function ArticleFilters({ articles }: { articles: Article[] }) {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";

  const title = "Blog";
  const backgroundImage = "/images/blogpage/handsingrass.jpg";

  const [search, setSearch] = useState(urlSearch);
  const [sortOrder, setSortOrder] =
    useState<"newest" | "oldest" | "popular">("newest");
  const [page, setPage] = useState(1);

  /* ---------------- hero-style search handlers ---------------- */

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  /* ---------------- filtering pipeline ---------------- */

  const filteredAndSorted = useMemo(() => {
    const searchQ = search.trim().toLowerCase();

    const filtered = articles.filter((a) => {
      const matchesSearch = searchQ
        ? a.title.toLowerCase().includes(searchQ) ||
          a.excerpt.toLowerCase().includes(searchQ)
        : true;

      return matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === "popular") {
        return (b.readCount ?? 0) - (a.readCount ?? 0);
      }

      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();

      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [articles, search, sortOrder]);

  /* ---------------- pagination ---------------- */

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);

  const paginatedArticles = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredAndSorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSorted, page]);

  useEffect(() => {
    setPage(1);
  }, [urlSearch]);

  /* ---------------- render ---------------- */

  return (
    <>
  {/* HERO SECTION */}
  <header
    className="relative w-full h-[500px] flex flex-col justify-center items-center text-center bg-cover bg-center"
    style={{ backgroundImage: `url(${backgroundImage})` }}
  >
    {/* Gradient overlay */}
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(to right, #3EBFF9 36%, #3EBFF9 80%, #666666 100%)`,
        opacity: 0.5,
      }}
    />

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/20"></div>

    {/* Content */}
    <div className="relative z-10 w-full px-4 flex flex-col items-center">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-16">
        {title}
      </h1>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="relative w-[90%] sm:w-[75%] md:w-[60%] lg:w-[50%] max-w-[600px] flex flex-col sm:flex-row"
      >
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                />
              </svg>
            </span>

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-3 border-none focus:outline-none text-gray-800 bg-white"
          />
        </div>

        <button
          type="submit"
          className="mt-3 sm:mt-0 sm:ml-3 px-6 py-3 bg-[#7F4592] text-white font-semibold hover:bg-[#693770] transition"
        >
          Search
        </button>
      </form>
    </div>
  </header>

  {/* EXISTING ARTICLE SECTION */}
  <section className="w-full px-8 lg:px-32 mt-12">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-6">

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(e.target.value as "newest" | "oldest" | "popular")
          }
          className="px-4 py-2 rounded-full border border-gray-300 bg-white
          focus:outline-none focus:ring-2 focus:ring-[#CF822A]"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="popular">Most popular</option>
        </select>

      </div>

      {/* Articles */}
      <AllArticles articles={paginatedArticles} />

      {/* Empty state */}
      {filteredAndSorted.length === 0 && (
        <p className="text-center mt-12">No articles match your search 🤷‍♂️</p>
      )}

    {/* Pagination */}
    {totalPages > 1 && (
    <div className="w-full bg-[#E8E7E7] py-12 flex flex-col items-center gap-4 mt-10">

        <div className="flex gap-4 items-center">

        <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-6 py-3 bg-[#7F4592] text-white font-semibold hover:bg-[#693770] transition disabled:opacity-40"
        >
            ← Prev
        </button>

        <span className="text-sm font-semibold text-[#403727]">
            Page {page} of {totalPages}
        </span>

        <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-3 bg-[#7F4592] text-white font-semibold hover:bg-[#693770] transition disabled:opacity-40"
        >
            Next →
        </button>

        </div>

    </div>
    )}
    </section>
    </>
  );
}