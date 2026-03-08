import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import sharp from "sharp";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

//-------------------------------------
// Upload Route
//-------------------------------------
export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File | null;
  const articleId = formData.get("articleId") as string | null;
  const assetType = (formData.get("assetType") as string) || "content";
  const folder = formData.get("folder") as string | null;
  const sessionId = formData.get("sessionId") as string | null;
  const draft = formData.get("draft") === "true";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const isSvg = file.type === "image/svg+xml";

  //-------------------------------------
  // Metadata + checks
  //-------------------------------------
  const metadata = await sharp(originalBuffer, { animated: true }).metadata();
  const format = metadata.format; // jpeg | png | gif | webp | avif | svg
  const isGif = format === "gif";
  const isAnimated = !!metadata.pages && metadata.pages > 1;

  const tooLarge =
    (metadata.width ?? 0) > 1600 ||
    (metadata.height ?? 0) > 1600;

  const alreadyOptimized =
    (format === "webp" && !tooLarge) ||
    (format === "avif" && !tooLarge && !isAnimated);

  let body: Buffer;
  let contentType: string;
  let extension: string;

  //-------------------------------------
  // SVG: passthrough
  //-------------------------------------
  if (isSvg) {
    body = originalBuffer;
    contentType = "image/svg+xml";
    extension = "svg";

  //-------------------------------------
  // GIF → animated WebP
  //-------------------------------------
  } else if (isGif) {
    let transformer = sharp(originalBuffer, { animated: true }).rotate();

    if (tooLarge) {
      transformer = transformer.resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    body = await transformer
      .webp({
        quality: 80,
        effort: 4,
        loop: 0, // preserve infinite loop
      })
      .toBuffer();

    contentType = "image/webp";
    extension = "webp";

  //-------------------------------------
  // Already optimized (safe passthrough)
  //-------------------------------------
  } else if (alreadyOptimized) {
    body = originalBuffer;
    contentType = file.type;
    extension = format!;

  //-------------------------------------
// Static images → resize only (no format conversion)
//-------------------------------------
} else {
  let transformer = sharp(originalBuffer).rotate();

  if (tooLarge) {
    transformer = transformer.resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  body = await transformer.toBuffer();

  contentType = file.type;
  extension = format!;
}

  //-------------------------------------
  // Generate imagekit key
  //-------------------------------------
 let folderPath: string;

if (articleId) {
  folderPath = `articles/${articleId}/${assetType}`;
} else if (folder) {
  folderPath =
    draft && sessionId
      ? `tmp/${sessionId}/${folder}`
      : folder;
} else {
  return NextResponse.json(
    { error: "Missing articleId or folder" },
    { status: 400 }
  );
}

const fileName = `${crypto.randomUUID()}.${extension}`;

//-------------------------------------
// Upload to ImageKit
//-------------------------------------
const upload = await imagekit.upload({
  file: body,
  fileName,
  folder: folderPath,
});

return NextResponse.json({
  url: upload.url,
  fileId: upload.fileId,
});
}
