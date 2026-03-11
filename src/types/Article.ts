export type Article = {
  id: string;
  title: string;
  slug: string;
  tags: string[];

  coverImage?: string | { url: string; fileId: string } | null;
  coverImageAlt?: string;

  status: "draft" | "published" | string;

  updatedAt?: any;
  readCount?: number;

  [key: string]: any;
};