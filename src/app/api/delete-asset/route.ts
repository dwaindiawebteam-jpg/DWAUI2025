import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileId, url } = body;

    if (!fileId && !url) {
      return NextResponse.json(
        { error: "Missing fileId or url", received: body },
        { status: 400 }
      );
    }

    let resolvedFileId = fileId;

    // Fallback: look up fileId from URL if not provided directly
    if (!resolvedFileId && url) {
      try {
        const urlObj = new URL(url);
        // Strip leading slash and imagekit endpoint prefix to get the file path
        const filePath = decodeURIComponent(urlObj.pathname.replace(/^\//, ""));

        const results = await imagekit.listFiles({ searchQuery: `name="${filePath.split("/").pop()}"`, limit: 10 });
        const match = (results as any[]).find((f) => f.url === url || f.filePath === `/${filePath}`);
        resolvedFileId = match?.fileId;
      } catch (err) {
        console.error("Failed to resolve fileId from URL:", url, err);
      }
    }

    if (!resolvedFileId) {
      // Not fatal — file may have already been deleted or never uploaded to ImageKit
      console.warn("Could not resolve fileId, skipping delete for:", url ?? fileId);
      return NextResponse.json({ success: true, skipped: true });
    }

    await imagekit.deleteFile(resolvedFileId);

    return NextResponse.json({ success: true, deleted: resolvedFileId });

  } catch (err: any) {
    console.error("ImageKit delete error:", err?.message);
    return NextResponse.json(
      { error: "Failed to delete image", message: err?.message },
      { status: 500 }
    );
  }
}