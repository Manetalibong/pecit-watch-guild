import type { ArticleWebhookPayload } from "../types/article";

export interface WebhookResult {
  ok: boolean;
  event: string;
  slug: string;
  message: string;
}

/**
 * Validates and processes CMS webhook payloads.
 * Wire this into an API route when you add a server adapter (Node, Vercel, Cloudflare).
 *
 * Example endpoint: POST /api/webhook
 * Header: Authorization: Bearer <CMS_WEBHOOK_SECRET>
 */
export function handleArticleWebhook(
  payload: ArticleWebhookPayload,
  secret?: string,
  authHeader?: string | null,
): { status: number; body: WebhookResult | { error: string } } {
  if (secret && authHeader !== `Bearer ${secret}`) {
    return { status: 401, body: { error: "Unauthorized" } };
  }

  const { event, article } = payload;

  if (!event || !article?.slug) {
    return { status: 400, body: { error: "Missing event or article.slug" } };
  }

  // TODO: write to CMS store / trigger rebuild (e.g. write markdown, call deploy hook)
  switch (event) {
    case "article.created":
    case "article.updated":
    case "article.deleted":
      break;
    default:
      return { status: 400, body: { error: `Unknown event: ${event}` } };
  }

  return {
    status: 200,
    body: {
      ok: true,
      event,
      slug: article.slug,
      message: "Webhook processed. Connect persistence layer to sync articles.",
    },
  };
}
