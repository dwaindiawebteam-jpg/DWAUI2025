import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import sharp from "sharp";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// Add retry logic with exponential backoff
async function uploadWithRetry(uploadFn: () => Promise<any>, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploadFn();
    } catch (error: any) {
      lastError = error;
      console.log(`Upload attempt ${i + 1} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.code === 'INVALID_FILE' || error.code === 'BAD_REQUEST') {
        throw error;
      }
      
      // Wait with exponential backoff before retry
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

//-------------------------------------
// Upload Route
//-------------------------------------
export async function POST(req: Request) {
  console.log("🔵 [Upload] POST request started");
  
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const oldFileId = formData.get("oldFileId") as string | null;
    const articleId = formData.get("articleId") as string | null;
    const assetType = (formData.get("assetType") as string) || "content";
    const folder = formData.get("folder") as string | null;
    const sessionId = formData.get("sessionId") as string | null;
    const draft = formData.get("draft") === "true";

    console.log("📋 [Upload] Request parameters:", {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      oldFileId,
      articleId,
      assetType,
      folder,
      sessionId,
      draft,
    });

    if (!file) {
      console.error("❌ [Upload] No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const isSvg = file.type === "image/svg+xml";
    
    console.log(`📄 [Upload] File loaded: ${file.name}, type: ${file.type}, size: ${file.size} bytes, isSvg: ${isSvg}`);

    //-------------------------------------
    // Metadata + checks
    //-------------------------------------
    console.log("🔍 [Upload] Processing metadata...");
    const metadata = await sharp(originalBuffer, { animated: true }).metadata();
    const format = metadata.format;
    const isGif = format === "gif";
    const isAnimated = !!metadata.pages && metadata.pages > 1;
    
    console.log("📊 [Upload] Image metadata:", {
      format,
      width: metadata.width,
      height: metadata.height,
      isGif,
      isAnimated,
      pages: metadata.pages,
      hasAlpha: metadata.hasAlpha,
    });

    const tooLarge =
      (metadata.width ?? 0) > 1600 ||
      (metadata.height ?? 0) > 1600;

    const alreadyOptimized =
      (format === "webp" && !tooLarge) ||
      (format === "avif" && !tooLarge && !isAnimated);

    console.log("⚙️ [Upload] Processing flags:", {
      tooLarge,
      alreadyOptimized,
      needsProcessing: !alreadyOptimized && !isSvg,
    });

    let body: Buffer;
    let contentType: string;
    let extension: string;

    //-------------------------------------
    // SVG: passthrough
    //-------------------------------------
    if (isSvg) {
      console.log("🎨 [Upload] SVG detected - passthrough without optimization");
      body = originalBuffer;
      contentType = "image/svg+xml";
      extension = "svg";

    //-------------------------------------
    // GIF → animated WebP
    //-------------------------------------
    } else if (isGif) {
      console.log("🎬 [Upload] GIF detected - converting to animated WebP");
      let transformer = sharp(originalBuffer, {
        animated: true,
        pages: -1,
      }).rotate();

      if (tooLarge) {
        console.log(`📏 [Upload] GIF too large (${metadata.width}x${metadata.height}) - resizing`);
        transformer = transformer.resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      console.log("🔄 [Upload] Converting GIF to WebP");
      body = await transformer
        .webp({
          quality: 80,
          effort: 4,
          loop: 0,
        })
        .toBuffer();
      
      console.log(`✅ [Upload] GIF conversion complete, output size: ${body.length} bytes`);
      contentType = "image/webp";
      extension = "webp";

    //-------------------------------------
    // Already optimized (safe passthrough)
    //-------------------------------------
    } else if (alreadyOptimized) {
      console.log(`✨ [Upload] File already optimized (${format}) - passthrough`);
      body = originalBuffer;
      contentType = file.type;
      extension = format!;

    //-------------------------------------
    // Static images → resize only (no format conversion)
    //-------------------------------------
    } else {
      console.log(`🖼️ [Upload] Static image (${format}) - processing...`);
      let transformer = sharp(originalBuffer).rotate();

      if (tooLarge) {
        console.log(`📏 [Upload] Image too large - resizing`);
        transformer = transformer.resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      body = await transformer.toBuffer();
      console.log(`✅ [Upload] Image processing complete, output size: ${body.length} bytes`);
      contentType = file.type;
      extension = format!;
    }

    //-------------------------------------
    // Generate imagekit key
    //-------------------------------------
    console.log("📁 [Upload] Determining folder path...");
    let folderPath: string;

    if (articleId) {
      folderPath = `articles/${articleId}/${assetType}`;
      console.log(`📂 [Upload] Using article folder: ${folderPath}`);
    } else if (folder) {
      folderPath =
        draft && sessionId
          ? `tmp/${sessionId}/${folder}`
          : folder;
      console.log(`📂 [Upload] Using ${draft ? 'draft' : 'permanent'} folder: ${folderPath}`);
    } else {
      console.error("❌ [Upload] Missing articleId or folder parameter");
      return NextResponse.json(
        { error: "Missing articleId or folder" },
        { status: 400 }
      );
    }

    const fileName = `${crypto.randomUUID()}.${extension}`;
    console.log(`📄 [Upload] Generated filename: ${fileName}`);

    //-------------------------------------
    // Upload to ImageKit with retry logic
    //-------------------------------------
    console.log(`📤 [Upload] Uploading to ImageKit with retry logic`);
    
    const uploadPromise = async () => {
      return await imagekit.upload({
        file: body,
        fileName,
        folder: folderPath,
      });
    };

    try {
      const upload = await uploadWithRetry(uploadPromise, 3);
      
      console.log(`✅ [Upload] Upload successful:`, {
        fileId: upload.fileId,
        url: upload.url,
        name: upload.name,
        size: upload.size,
      });

      const optimizedUrl = imagekit.url({
        src: upload.url,
        transformation: [
          {
            format: "auto",
            quality: "auto",
          }
        ]
      });

      console.log(`🔗 [Upload] Generated URLs:`, {
        optimizedUrl,
        rawUrl: upload.url,
      });

      const response = {
        url: optimizedUrl,
        rawUrl: upload.url,
        fileId: upload.fileId,
        oldFileId,
      };

      console.log(`✅ [Upload] Request complete, returning response`);
      return NextResponse.json(response);
      
    } catch (uploadError: any) {
      console.error(`❌ [Upload] ImageKit upload failed after retries:`, uploadError);
      
      return NextResponse.json(
        { 
          error: "Upload failed", 
          details: uploadError.message,
          code: uploadError.code 
        },
        { status: 500 }
      );
    }
    
  } catch (err: any) {
    console.error("💥 [Upload] Fatal error:", err);
    return NextResponse.json(
      { error: "Failed", details: err.message },
      { status: 500 }
    );
  }
}