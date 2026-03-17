import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { extractExcerptFromBody } from "@/lib/articles/extractExcerpt";
import ArticleFiltersSuspense from "@/components/blog/ArticleFiltersSuspense";
import InfoForm from "@/components/InfoForm";

export const revalidate = 300;

export const metadata = {
  title: "Latest Blog Posts | DWA India",
  description: "Read the latest stories, ideas, and insights from DWA India.",
};

const ITEMS_PER_PAGE = 9;
const PREFETCH_PAGES = 2;



export default async function BlogPage() {
    const q = query(
    collection(db, "articles"),
    where("status", "==", "published"),
    orderBy("updatedAt", "desc"),
    limit(ITEMS_PER_PAGE * PREFETCH_PAGES)
  );

  const snapshot = await getDocs(q);

  const articles = snapshot.docs.map((doc) => {
    const d = doc.data();

     return {
      id: doc.id,
      title: d.title,
      slug: d.slug,
      tags: d.tags,
      coverImage: d.coverImage,
      category: d.category ?? "general",
      excerpt: extractExcerptFromBody(d.body, 48),
      updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
      readCount: d.readCount ?? 0,
    };
  });

  return (
    <main>
      <ArticleFiltersSuspense
        articles={articles}
      />
      <InfoForm />
    </main>
  );
}

