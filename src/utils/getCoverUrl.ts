export function getCoverUrl(image: any): string | null {
  if (!image) return null;

  if (typeof image === "string") {
    const trimmed = image.trim();
    return trimmed || null;
  }

  if (typeof image === "object" && image.url) {
    const trimmed = image.url.trim();
    return trimmed || null;
  }

  return null;
}