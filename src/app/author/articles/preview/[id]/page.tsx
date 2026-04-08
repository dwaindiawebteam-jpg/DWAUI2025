"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import ArticleRenderer from "@/components/articles/ArticleRenderer";
import { useAuth } from "@/context/AuthContext";
import { getCoverUrl } from "@/utils/getCoverUrl";

export default function PreviewArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, authReady } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErrorMsg("No article ID provided");
      setLoading(false);
      return;
    }

    if (!authReady) {
      return;
    }

    if (!user) {
      setErrorMsg("You must be logged in to view previews");
      setLoading(false);
      return;
    }

    const fetchPreview = async () => {
      try {
        const token = await user.getIdToken();
        
        const res = await fetch(`/api/articles/preview?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store'
        });

        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = `Failed to load preview (${res.status})`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }

        const responseData = await res.json();
        const { data } = responseData;
        
        if (!data) {
          throw new Error("No data returned from API");
        }

        // Parse body content
        let body = data.body;
        
        if (typeof body === "string") {
          try {
            body = JSON.parse(body);
          } catch (parseError) {
            body = { type: "doc", content: [] };
          }
        }

        // Ensure body has correct structure
        if (body?.type !== "doc") {
          body = { 
            type: "doc", 
            content: body?.content ?? body ?? [] 
          };
        }
        function normalizeDate(val: any) {
          if (!val) return null;

          // Case 1: Firestore Timestamp (client SDK)
          if (typeof val.toDate === "function") {
            return val.toDate();
          }

          // Case 2: Raw Firestore Timestamp object from API:
          // { _seconds: number, _nanoseconds: number }
          if (val._seconds) {
            return new Date(val._seconds * 1000);
          }

          // Case 3: Already a string
          if (typeof val === "string") {
            return new Date(val);
          }

          return null;
        }
        const published = normalizeDate(data.publishedAt);
        const updated = normalizeDate(data.updatedAt);
        // Prepare post data
        const postData = {
            ...data,
            body,
            date: (published ?? updated ?? new Date()).toISOString(),
          };

        setPost(postData);
        setErrorMsg(null);
        
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load preview");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [id, authReady, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] overflow-hidden">
          <div className="h-full w-full bg-[#004265] animate-pulse"></div>
        </div>
        <p className="mt-4 font-medium text-lg font-sans!">
          Loading preview…
        </p>
      </div>
    );
  }

  if (errorMsg || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-sans!">Preview not found</h1>
          <p className="mt-2 text-gray-600 font-sans!">{errorMsg || "No article data could be loaded."}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-[#004265] text-white cursor-pointer transition font-sans!"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

const coverUrl = getCoverUrl(post.coverImage);

  return (
    <div className="min-h-screen py-12 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back button - exact design from blog page */}
        <button 
          onClick={() => {
            // First, try to close the window/tab
            window.close();
            
            // If still open after a short delay, go back
            setTimeout(() => {
              if (!window.closed) {
                window.history.back();
              }
            }, 100);
          }}
          className="mb-6 flex items-center text-[#004265] transition font-inter font-bold group relative pb-1"
        >
          <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#004265] after:transition-all text-lg after:duration-300 group-hover:after:w-full">
            Close Preview
          </span>
        </button>

        {/* Article Card - exact design from blog page */}
        <div className="shadow-xl p-6 sm:p-8 border border-gray-200">
          {/* Article Header */}
          <h1 className="font-cinzel text-[22px] sm:text-[26px] lg:text-[30px] font-bold min-w-0 wrap-break-word text-center mb-4">
            {post.title || "Untitled draft"}
          </h1>
          
          {/* Article Meta - with preview indicator */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-inter mb-6 justify-center text-center">
            <span className="font-semibold text-base">{post.author || "Author"}</span>
            <span className="hidden sm:inline">•</span>
            <span>
              {post.date ? new Date(post.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : "Draft"}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="bg-blue-100 px-3 py-1 text-base font-medium">
              Draft Preview
            </span>
          </div>

          {/* Featured Image - added mb-8 wrapper to match blog */}
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
            {post.body && <ArticleRenderer content={post.body} />}
          </article>
        </div>
      </div>
    </div>
  );
}