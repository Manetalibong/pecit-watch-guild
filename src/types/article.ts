/** CMS-ready article shape — matches future webhook payload structure */

export type ArticleCategory =
  | "Latest News"
  | "Feature article"
  | "Column"
  | "Editorial"
  | "Promotional"
  | "Research";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  date: string;
  image?: string;
  categories: (ArticleCategory | string)[];
  featured?: boolean;
  status: "draft" | "published";
}

/** Expected webhook payload when CMS publishes an article */
export interface ArticleWebhookPayload {
  event: "article.created" | "article.updated" | "article.deleted";
  timestamp: string;
  article: Article;
}
