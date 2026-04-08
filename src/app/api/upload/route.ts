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
  
      
      // Don't retry on certain errors
      if (error.code === 'INVALID_FILE' || error.code === 'BAD_REQUEST') {
        throw error;
      }
      
      // Wait with exponential backoff before retry
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
     
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

  
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const oldFileId = formData.get("oldFileId") as string | null;
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
    const format = metadata.format;
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
  
      let transformer = sharp(originalBuffer, {
        animated: true,
        pages: -1,
      }).rotate();

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
          loop: 0,
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
    // Upload to ImageKit with retry logic
    //-------------------------------------
  
    
    const uploadPromise = async () => {
      return await imagekit.upload({
        file: body,
        fileName,
        folder: folderPath,
      });
    };

    try {
      const upload = await uploadWithRetry(uploadPromise, 3);
      
  

      const optimizedUrl = imagekit.url({
        src: upload.url,
        transformation: [
          {
            format: "auto",
            quality: "auto",
          }
        ]
      });


      const response = {
        url: optimizedUrl,
        rawUrl: upload.url,
        fileId: upload.fileId,
        oldFileId,
      };

    
      return NextResponse.json(response);
      
    } catch (uploadError: any) {
   
      
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
  
    return NextResponse.json(
      { error: "Failed", details: err.message },
      { status: 500 }
    );
  }
}