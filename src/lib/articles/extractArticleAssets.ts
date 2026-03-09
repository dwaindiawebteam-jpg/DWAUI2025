// lib/articles/extractArticleAssets.ts

export function extractArticleAssets(
  article: {
    coverImage: { url: string; fileId: string } | null;
    body: any;
  },
  uploadedAssets: string[]
): string[] {
  const usedUrls = new Set<string>();

  if (article.coverImage) {
    usedUrls.add(article.coverImage.url);
  }

  function scan(node: any) {
    if (!node) return;

    if (
      (node.type === "image" || node.type === "imageWithRemove") &&
      node.attrs?.src
    ) {
      usedUrls.add(node.attrs.src);
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(scan);
    }
  }

  scan(article.body);

  return uploadedAssets.filter(url => usedUrls.has(url));
}