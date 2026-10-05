import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export async function getAllPosts(): Promise<BlogPost[]> {
  return (await getCollection("blog")).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllPosts();
  return posts.find((p) => p.id === slug);
}

export function getAllCategories(posts: BlogPost[]): string[] {
  const set = new Set<string>();
  for (const post of posts) {
    for (const tag of post.data.tags) set.add(tag);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function formatPostDate(date: Date): string {
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function postToCard(post: BlogPost) {
  return {
    id: post.id,
    slug: post.id,
    title: post.data.title,
    excerpt: post.data.description,
    author: post.data.author,
    date: post.data.date.toISOString().slice(0, 10),
    image: post.data.image,
    categories: post.data.tags,
    status: "published" as const,
  };
}
