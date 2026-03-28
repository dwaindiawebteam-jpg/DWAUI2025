"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, where, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface AnalyticsArticle {
  id: string;
  title: string;
  readCount?: number;
  updatedAt: Timestamp;
  status: "published" | "draft";
  authorName?: string;
  authorId?: string;
}

export default function AdminAnalyticsPage() {
  const { role, authReady } = useAuth();
  const router = useRouter();

  const [articles, setArticles] = useState<AnalyticsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<AnalyticsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "readCount" | "updatedAt" | "authorName">("readCount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetch = async () => {
      if (!authReady) return;

      try {
        const ref = collection(db, "articles");
        const q = query(
          ref, 
          where("status", "==", "published"),
          orderBy("readCount", "desc")
        );

        const snap = await getDocs(q);

        const articlesList = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as AnalyticsArticle[];

        setArticles(articlesList);
        setFilteredArticles(articlesList);
      } catch (err) {
        console.error("Admin analytics fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [authReady]);

  // Apply search filter
  useEffect(() => {
    if (!search.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const lower = search.toLowerCase();
    const filtered = articles.filter((article) => {
      return (
        article.title?.toLowerCase().includes(lower) ||
        article.id?.toLowerCase().includes(lower) ||
        article.authorName?.toLowerCase().includes(lower)
      );
    });

    setFilteredArticles(filtered);
  }, [search, articles]);

  const totalReads = filteredArticles.reduce(
    (sum, a) => sum + (a.readCount || 0),
    0
  );

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    let A: any = a[sortKey];
    let B: any = b[sortKey];

    if (sortKey === "updatedAt") {
      A = a.updatedAt?.toMillis() || 0;
      B = b.updatedAt?.toMillis() || 0;
    }

    if (A === undefined || A === null) A = "";
    if (B === undefined || B === null) B = "";

    if (A < B) return sortDir === "asc" ? -1 : 1;
    if (A > B) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const formatDate = (timestamp: Timestamp) => {
    return new Date(timestamp.toMillis()).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 overflow-hidden">
          <div className="h-full w-full bg-[#004265] animate-pulse"></div>
        </div>
        <p className="mt-4 font-medium text-lg font-sans!">
          Loading Analytics...
        </p>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans!">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 font-sans!">
            Access Denied
          </h1>
          <p className="font-sans!">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-12 min-h-screen pb-32 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center font-sans!">
          Article Analytics
        </h1>
        
        {/* Stats Section - Matching admin articles design */}
        <div className="border shadow-md p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-medium font-sans!">
              Performance Overview
            </h2>
          </div>

          <hr className="mb-8" />

          {/* Stats Summary - Matching admin articles grid layout */}
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-white border p-4 text-center">
                <div className="text-sm font-sans!">Total Reads</div>
                <div className="mt-1 text-2xl font-bold font-sans!">
                  {totalReads}
                </div>
              </div>

              <div className="bg-white border p-4 text-center">
                <div className="text-sm font-sans!">Published Articles</div>
                <div className="mt-1 text-2xl font-bold font-sans!">
                  {filteredArticles.length}
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search articles by title, author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 border bg-white focus:outline-none focus:ring-2 text-base font-sans!"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="border shadow-md p-6 sm:p-8">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-10 font-sans!">
              {search 
                ? "No published articles found matching your search." 
                : "No published articles found."}
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 block mx-auto font-medium font-sans!"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto scrollable-description">
              <table className="min-w-full divide-y divide-black">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("title")}
                      className="px-4 py-3 text-left text-lg font-medium uppercase tracking-wider font-sans! cursor-pointer select-none"
                    >
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        Article
                        {sortKey === "title" && (
                          <span className="text-base leading-none">
                            {sortDir === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                    </th>

                    <th
                      onClick={() => handleSort("authorName")}
                      className="px-4 py-3 text-left text-lg font-medium uppercase tracking-wider font-sans! cursor-pointer select-none"
                    >
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        Author
                        {sortKey === "authorName" && (
                          <span className="text-base leading-none">
                            {sortDir === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                    </th>

                    <th
                      onClick={() => handleSort("readCount")}
                      className="px-4 py-3 text-left text-lg font-medium uppercase tracking-wider font-sans! cursor-pointer select-none"
                    >
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        Views
                        {sortKey === "readCount" && (
                          <span className="text-base leading-none">
                            {sortDir === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                    </th>

                    <th
                      onClick={() => handleSort("updatedAt")}
                      className="px-4 py-3 text-left text-lg font-medium uppercase tracking-wider font-sans! cursor-pointer select-none"
                    >
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        Updated
                        {sortKey === "updatedAt" && (
                          <span className="text-base leading-none">
                            {sortDir === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-black">
                  {sortedArticles.map((article) => (
                    <tr
                      key={article.id}
                      onClick={() => router.push(`/admin/analytics/${article.id}`)}
                      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-px"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-lg font-sans!">
                            {article.title || "Untitled"}
                          </div>
                          
                          {article.readCount && article.readCount > 0 && (
                            <div className="text-base font-sans! mt-1">
                              {article.readCount.toLocaleString()} total views
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-base font-sans!">
                          {article.authorName || "Unknown"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-base font-medium font-sans!">
                          {article.readCount || 0}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-base font-sans!">
                          {formatDate(article.updatedAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Results count */}
          {filteredArticles.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-base! font-sans!">
                Showing {filteredArticles.length} published articles
                {search && ` matching "${search}"`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}