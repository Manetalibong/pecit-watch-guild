/**
 * Prefix site paths with Astro `base` (needed for GitHub Pages project sites).
 * Leaves absolute URLs, mailto/tel, and hashes alone.
 */
export function withBase(path: string): string {
  if (
    !path ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:") ||
    path.startsWith("#") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const base = import.meta.env.BASE_URL || "/";
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${clean}`;
}
