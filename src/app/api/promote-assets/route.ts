import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function POST(req: Request) {
  console.log("🔵 [ImageKit] POST request started");
  console.log("🔵 [ImageKit] Timestamp:", new Date().toISOString());
  
  try {
    const payload = await req.json();
    const urls = payload.urls;
    
    console.log("📦 [ImageKit] Received payload:", { 
      urlsCount: urls?.length, 
      urls: urls?.map((u: any) => ({
        url: u.url,
        fileId: u.fileId,
        oldUrl: u.oldUrl,
        oldFileId: u.oldFileId,
        hasFileId: !!u.fileId,
        isTmp: u.url?.includes('/tmp/')
      }))
    });

    if (!Array.isArray(urls)) {
      console.error("❌ [ImageKit] Invalid urls - not an array");
      return NextResponse.json({ error: "Invalid urls" }, { status: 400 });
    }

    const replacements: Record<string, { url: string; fileId: string }> = {};

    for (let i = 0; i < urls.length; i++) {
      const asset = urls[i];
      const { fileId, url, oldUrl, oldFileId } = asset;
      
      console.log(`\n🔍 [ImageKit] Processing asset #${i + 1}/${urls.length}:`, {
        fileId,
        url,
        oldUrl,
        oldFileId,
        hasFileId: !!fileId,
        isTmpUrl: url?.includes("/tmp/")
      });

      if (!fileId) {
        console.log(`⚠️ [ImageKit] No fileId for ${url}, keeping original`);
        replacements[url] = { url, fileId: "" };
        console.log(`📝 [ImageKit] Replacement mapping: ${url} → { url: "${url}", fileId: "" }`);
        continue;
      }

      if (!url.includes("/tmp/")) {
        console.log(`⚠️ [ImageKit] URL not a tmp file: ${url}, keeping original`);
        replacements[url] = { url, fileId };
        console.log(`📝 [ImageKit] Replacement mapping: ${url} → { url: "${url}", fileId: "${fileId}" }`);
        continue;
      }

      console.log(`🔄 [ImageKit] Processing tmp file: ${fileId}`);
      console.log(`🔄 [ImageKit] Final URL will be: ${url.replace('/tmp/', '/site-content/')}`);

      try {
        console.log(`📥 [ImageKit] Fetching file details for fileId: ${fileId}`);
        const file = await imagekit.getFileDetails(fileId);
        
        console.log(`✅ [ImageKit] File details retrieved:`, {
          fileId: file.fileId,
          filePath: file.filePath,
          name: file.name,
          url: file.url,
          size: file.size,
          createdAt: file.createdAt
        });

        const filePath = file.filePath;
        const pathParts = filePath.split('/');
        const tmpIndex = pathParts.findIndex(part => part === 'tmp');
        
        console.log(`🔧 [ImageKit] Path parsing:`, {
          filePath,
          pathParts,
          tmpIndex,
          tmpIndexFound: tmpIndex !== -1
        });

        if (tmpIndex === -1) {
          console.log(`⚠️ [ImageKit] No 'tmp' found in path for ${fileId}, keeping original`);
          replacements[url] = { url, fileId };
          console.log(`📝 [ImageKit] Replacement mapping: ${url} → { url: "${url}", fileId: "${fileId}" }`);
          continue;
        }

        const cleanPathParts = pathParts.slice(tmpIndex + 2);
        const folderParts = cleanPathParts.slice(0, -1);
        const permanentFolder = `site-content/${folderParts.join('/')}`;
        const fileName = file.name;
        
        console.log(`📁 [ImageKit] Permanent location details:`, {
          cleanPathParts,
          folderParts,
          permanentFolder,
          fileName,
          fullPermanentPath: `${permanentFolder}/${fileName}`
        });

        // Delete the OLD permanent file BEFORE uploading the new one
        if (oldFileId) {
          console.log(`🗑️ [ImageKit] Attempting to delete old permanent file: ${oldFileId}`);
          try {
            const deleteResult = await imagekit.deleteFile(oldFileId);
            console.log(`✅ [ImageKit] Successfully deleted old permanent file: ${oldFileId}`, deleteResult);
          } catch (err: any) {
            console.error(`❌ [ImageKit] Failed to delete old permanent file: ${oldFileId}`, {
              error: err.message,
              status: err.status,
              help: "This may not be a critical error if the file doesn't exist"
            });
          }
        } else {
          console.log(`ℹ️ [ImageKit] No oldFileId provided, skipping deletion`);
        }

        console.log(`📤 [ImageKit] Uploading file to permanent location:`, {
          sourceUrl: file.url,
          fileName,
          folder: permanentFolder,
          useUniqueFileName: false,
          tags: ["permanent", "site-content"]
        });
        
        const uploaded = await imagekit.upload({
          file: file.url,
          fileName: fileName,
          folder: permanentFolder,
          useUniqueFileName: false,
          tags: ["permanent", "site-content"]
        });
        
        console.log(`✅ [ImageKit] Upload successful:`, {
          newUrl: uploaded.url,
          fileId: uploaded.fileId,
          name: uploaded.name,
          size: uploaded.size,
          filePath: uploaded.filePath
        });

        // Delete the tmp file
        console.log(`🗑️ [ImageKit] Deleting tmp file: ${fileId}`);
        const deleteResult = await imagekit.deleteFile(fileId);
        console.log(`✅ [ImageKit] Successfully deleted tmp file: ${fileId}`, deleteResult);

        // ✅ Now includes both url and fileId
        replacements[url] = { url: uploaded.url, fileId: uploaded.fileId };
        console.log(`🔄 [ImageKit] Replacement mapping: ${url} → { url: ${uploaded.url}, fileId: ${uploaded.fileId} }`);
        console.log(`✨ [ImageKit] Final image URL: ${uploaded.url}`);

      } catch (err: any) {
        console.error(`❌ [ImageKit] Move failed for ${fileId}:`, {
          error: err.message,
          stack: err.stack,
          status: err.status,
          response: err.response
        });
        replacements[url] = { url, fileId };
        console.log(`⚠️ [ImageKit] Keeping original URL due to error: ${url}`);
        console.log(`📝 [ImageKit] Replacement mapping (error fallback): ${url} → { url: "${url}", fileId: "${fileId}" }`);
      }
    }

    console.log(`\n✅ [ImageKit] Processing complete.`);
    console.log(`📊 [ImageKit] Summary:`, {
      totalAssets: urls.length,
      successfulReplacements: Object.keys(replacements).length,
      replacements: Object.entries(replacements).map(([oldUrl, newData]) => ({
        oldUrl,
        newUrl: (newData as any).url,
        newFileId: (newData as any).fileId,
        wasChanged: oldUrl !== (newData as any).url
      }))
    });
    
    return NextResponse.json({ replacements });

  } catch (err: any) {
    console.error("💥 [ImageKit] Fatal error in POST handler:", {
      error: err.message,
      stack: err.stack,
      name: err.name
    });
    return NextResponse.json({ 
      error: "Failed to promote assets", 
      details: err.message 
    }, { status: 500 });
  }
}