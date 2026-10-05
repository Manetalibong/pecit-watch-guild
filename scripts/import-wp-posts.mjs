/**
 * Import published posts from pecitwatchguild.com into src/content/blog/
 * Usage: node scripts/import-wp-posts.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "src/content/blog");
const jsonPath = path.join(__dirname, "wp-posts.json");

function decodeHtml(html) {
  return html
    .replace(/&#8211;/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(html) {
  return decodeHtml(html.replace(/<[^>]+>/g, "")).replace(/"/g, '\\"');
}

function cleanWpContent(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\sclass="[^"]*"/gi, "")
    .replace(/\sdata-[\w-]+="[^"]*"/gi, "")
    .trim();
}

function yamlString(value) {
  if (!value) return '""';
  const safe = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
  return `"${safe}"`;
}

function slugifyFile(slug) {
  return slug.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").toLowerCase();
}

async function fetchPosts() {
  const res = await fetch(
    "https://pecitwatchguild.com/wp-json/wp/v2/posts?per_page=100&status=publish&_embed",
  );
  if (!res.ok) throw new Error(`WP API ${res.status}`);
  const posts = await res.json();
  await fs.writeFile(jsonPath, JSON.stringify(posts, null, 0));
  return posts;
}

async function main() {
  let posts;
  try {
    posts = JSON.parse(await fs.readFile(jsonPath, "utf8"));
  } catch {
    posts = await fetchPosts();
  }

  await fs.mkdir(outDir, { recursive: true });
  const existing = await fs.readdir(outDir);
  for (const file of existing) {
    if (file.endsWith(".md")) await fs.unlink(path.join(outDir, file));
  }

  let count = 0;
  for (const post of posts) {
    if (post.status !== "publish") continue;

    const slug = slugifyFile(post.slug);
    const title = cleanTitle(post.title?.rendered ?? "Untitled");
    const description = decodeHtml(post.excerpt?.rendered ?? "").slice(0, 300);
    const date = (post.date ?? post.date_gmt ?? new Date().toISOString()).slice(0, 10);
    const author =
      post._embedded?.author?.[0]?.name?.replace(/Watchguild/i, "The Watch Guild") ??
      "The Watch Guild";
    const categories =
      post._embedded?.["wp:term"]?.[0]?.map((c) => c.name).filter(Boolean) ?? [];
    const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "";
    const body = cleanWpContent(post.content?.rendered ?? "");

    const frontmatter = `---
title: ${yamlString(title)}
description: ${yamlString(description)}
author: ${yamlString(author)}
date: ${date}
image: ${yamlString(image)}
tags:
${categories.map((t) => `  - ${yamlString(t.replace(/^"|"$/g, ""))}`).join("\n") || '  - "Article"'}
---

${body}
`;

    await fs.writeFile(path.join(outDir, `${slug}.md`), frontmatter, "utf8");
    count++;
  }

  console.log(`Imported ${count} articles to src/content/blog/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
