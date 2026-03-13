import imageCompression from "browser-image-compression";

export async function compressImageClient(file: File): Promise<File> {
  // Never touch SVGs or GIFs
  if (
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  const options = {
    maxWidthOrHeight: 1600,
    maxSizeMB: 1.2,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: "image/jpeg",
  };

  try {
    const compressed = await imageCompression(file, options);

    if (compressed.size >= file.size) {
      return file;
    }

    return compressed;
  } catch (err) {
    console.warn("Client image compression failed, using original", err);
    return file;
  }
}