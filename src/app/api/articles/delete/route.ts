import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { imagekit } from "@/lib/imagekit";
import { extractArticleAssets } from "@/lib/articles/extractArticleAssets";

export async function POST(req: Request) {
  try {
    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    const ref = adminDb.collection("articles").doc(articleId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const article = snap.data()!;

   const uploadedAssets = article.uploadedAssets ?? [];

    const usedAssets = extractArticleAssets(
      {
        coverImage: article.coverImage,
        body: article.body,
      },
      uploadedAssets.map((a: any) => a.url)
    );
    /**
     * uploadedAssets should look like:
     * [{ url: string, fileId: string }]
     */

    try {
  await imagekit.deleteFolder(`articles/${articleId}`);
} catch (err) {
  console.error("ImageKit folder delete failed:", err);
}

    // 🔥 Delete article and subcollections
    await adminDb.recursiveDelete(ref);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Article delete failed:", err);

    return NextResponse.json(
      { error: "Delete failed", details: err.message },
      { status: 500 }
    );
  }
}