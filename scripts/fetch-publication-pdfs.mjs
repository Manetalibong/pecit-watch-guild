/**
 * Download publication PDFs from pecitwatchguild.com into public/publications/
 * Usage: node scripts/fetch-publication-pdfs.mjs
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  {
    url: "https://pecitwatchguild.com/wp-content/uploads/2026/02/Kahayag-Multidisciplinary-Research-Journal.pdf",
    out: "public/publications/kahayag-multidisciplinary-research-journal.pdf",
  },
  {
    url: "https://pecitwatchguild.com/wp-content/uploads/2026/01/PECIT-Book-of-Abstracts-1.pdf",
    out: "public/publications/pecit-book-of-abstracts.pdf",
  },
  {
    url: "https://pecitwatchguild.com/wp-content/uploads/2025/03/MAGAZINE-2024-1.pdf",
    out: "public/publications/magazine-2024.pdf",
  },
  {
    url: "https://pecitwatchguild.com/wp-content/uploads/2025/03/The-watchguild-Magazine-1-1.pdf",
    out: "public/publications/the-watchguild-magazine.pdf",
  },
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

for (const { url, out } of files) {
  const dest = join(root, out);
  await mkdir(dirname(dest), { recursive: true });
  if (await exists(dest)) {
    console.log(`Skip (exists): ${out}`);
    continue;
  }
  console.log(`Fetching ${url} …`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`Saved ${out} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
}

console.log("Done.");
