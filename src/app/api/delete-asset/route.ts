import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: Request) {
  console.log("---- DELETE ASSET ROUTE HIT ----");

  try {
    //----------------------------------
    // Read request body
    //----------------------------------
    const body = await req.json();
    console.log("Request body:", body);

    const { fileId } = body;

    //----------------------------------
    // Validate fileId
    //----------------------------------
    if (!fileId) {
      console.error("Missing fileId in request");

      return NextResponse.json(
        { error: "Missing fileId", received: body },
        { status: 400 }
      );
    }

    console.log("Deleting fileId:", fileId);

    //----------------------------------
    // Call ImageKit delete
    //----------------------------------
    const result = await imagekit.deleteFile(fileId);

    console.log("ImageKit delete result:", result);

    return NextResponse.json({
      success: true,
      deleted: fileId,
      result,
    });

  } catch (err: any) {
    console.error("ImageKit delete error FULL:", err);
    console.error("Error message:", err?.message);
    console.error("Error stack:", err?.stack);
    console.error("Error response:", err?.response);

    return NextResponse.json(
      {
        error: "Failed to delete image",
        message: err?.message,
        details: err,
      },
      { status: 500 }
    );
  }
}