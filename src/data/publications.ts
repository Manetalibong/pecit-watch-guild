import { withBase } from "../lib/paths";

export type Publication = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  /** Path under /public/ (e.g. /publications/kahayag.pdf) */
  localPath: string;
  /** Source on pecitwatchguild.com — used by fetch script & fallback */
  remoteUrl: string;
  downloadFilename: string;
  coverImage?: string;
  /** External viewer only (no PDF on WP) */
  externalUrl?: string;
};

export const publications: Record<string, Publication> = {
  kahayag: {
    id: "kahayag",
    title: "Kahayag Multidisciplinary Research Journal",
    subtitle: "Biannual research presentation · PECIT",
    description:
      "Research studies presented at the Research & Extension Department. Copyright November 2025, Philippine Electronics and Communication Institute of Technology, Butuan City.",
    localPath: "/publications/kahayag-multidisciplinary-research-journal.pdf",
    remoteUrl:
      "https://pecitwatchguild.com/wp-content/uploads/2026/02/Kahayag-Multidisciplinary-Research-Journal.pdf",
    downloadFilename: "Kahayag-Multidisciplinary-Research-Journal.pdf",
    coverImage: "/images/journal-cover.png",
  },
  "book-of-abstracts": {
    id: "book-of-abstracts",
    title: "PECIT Book of Abstracts",
    subtitle: "Compiled research presentations",
    localPath: "/publications/pecit-book-of-abstracts.pdf",
    remoteUrl:
      "https://pecitwatchguild.com/wp-content/uploads/2026/01/PECIT-Book-of-Abstracts-1.pdf",
    downloadFilename: "PECIT-Book-of-Abstracts.pdf",
  },
  "magazine-2024": {
    id: "magazine-2024",
    title: "MAGAZINE 2024",
    subtitle: "The Watch Guild Publication",
    localPath: "/publications/magazine-2024.pdf",
    remoteUrl: "https://pecitwatchguild.com/wp-content/uploads/2025/03/MAGAZINE-2024-1.pdf",
    downloadFilename: "MAGAZINE-2024.pdf",
  },
  "watchguild-magazine": {
    id: "watchguild-magazine",
    title: "The Watch Guild Magazine",
    subtitle: "Campus publication preview",
    localPath: "/publications/the-watchguild-magazine.pdf",
    remoteUrl:
      "https://pecitwatchguild.com/wp-content/uploads/2025/03/The-watchguild-Magazine-1-1.pdf",
    downloadFilename: "The-WatchGuild-Magazine.pdf",
  },
};

export function getPublication(id: string): Publication | undefined {
  return publications[id];
}

export function publicationPdfUrl(pub: Publication): string {
  return withBase(pub.localPath);
}

export function publicationCoverUrl(pub: Publication): string | undefined {
  return pub.coverImage ? withBase(pub.coverImage) : undefined;
}
