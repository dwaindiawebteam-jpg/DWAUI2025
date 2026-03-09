import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const urls = payload.urls;

    if (!Array.isArray(urls)) {
      return NextResponse.json({ error: "Invalid urls" }, { status: 400 });
    }

    const replacements: Record<string, string> = {};

    for (const asset of urls) {
      const { fileId, url } = asset;

      if (!fileId) {
        replacements[url] = url; // fallback: no fileId, assume already permanent
        continue;
      }

      // Skip if not in tmp folder
      if (!url.includes("/tmp/")) {
        replacements[url] = url;
        continue;
      }

   try {
        const file = await imagekit.getFileDetails(fileId);

        const uploaded = await imagekit.upload({
          file: file.url, // use existing URL
          fileName: file.name,
          folder: "/articles", // permanent folder
        });

        await imagekit.deleteFile(fileId);

        replacements[url] = uploaded.url;

      } catch (err) {
        console.error("ImageKit move failed:", fileId, err);
        replacements[url] = url;
      }
    }

    return NextResponse.json({ replacements });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed", details: err.message }, { status: 500 });
  }
}