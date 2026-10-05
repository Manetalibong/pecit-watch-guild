/**
 * CMS webhook payload shape for future article publishing.
 * Your CMS should POST JSON matching this interface to trigger rebuilds.
 */
export interface CMSArticlePayload {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage: string;
  categories: string[];
  status: "draft" | "published" | "archived";
  featured?: boolean;
}

export interface CMSWebhookEvent {
  event: "article.created" | "article.updated" | "article.deleted";
  timestamp: string;
  article: CMSArticlePayload;
}
