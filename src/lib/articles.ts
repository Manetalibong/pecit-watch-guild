import type { Article, ArticleCategory } from "../types/article";
import { articles } from "../data/homepage";

export function getPublishedArticles(): Article[] {
  return articles
    .filter((a) => a.status === "published")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getFeaturedArticles(): Article[] {
  return getPublishedArticles().filter((a) => a.featured);
}

export function getLatestArticles(limit = 6): Article[] {
  return getPublishedArticles().slice(0, limit);
}

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return getPublishedArticles().filter((a) => a.categories.includes(category));
}

export function getResearchArticles(): Article[] {
  return getArticlesByCategory("Research");
}

export function formatArticleDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getPrimaryCategory(article: Article): string {
  const priority: (ArticleCategory | string)[] = [
    "Latest News",
    "Editorial",
    "Feature article",
    "Column",
    "Research",
    "Promotional",
  ];
  for (const cat of priority) {
    if (article.categories.includes(cat)) return cat;
  }
  return article.categories[0] ?? "Article";
}
