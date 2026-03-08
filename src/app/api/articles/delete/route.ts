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

    const usedAssets = extractArticleAssets({
      coverImage: article.coverImage,
      body: article.body,
    });

    const uploadedAssets = article.uploadedAssets ?? [];

    /**
     * uploadedAssets should look like:
     * [{ url: string, fileId: string }]
     */

    const assetFileIds = uploadedAssets
      .filter((a: any) => a.fileId)
      .map((a: any) => a.fileId);

    // 🔥 Delete files from ImageKit
    await Promise.all(
      assetFileIds.map(async (fileId: string) => {
        try {
          await imagekit.deleteFile(fileId);
        } catch (err) {
          console.error("ImageKit delete failed:", fileId, err);
        }
      })
    );

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