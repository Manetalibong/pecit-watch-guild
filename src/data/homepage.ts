import type { Article } from "../types/article";
import { editorialBoard } from "./guild";

/** Static article data — replace with CMS fetch or webhook-synced store later */
export const articles: Article[] = [
  {
    id: "1341",
    slug: "we-cannot-ctrlaltdelete-violence",
    title: "We cannot Ctrl+Alt+Delete Violence",
    excerpt:
      "Can banning one game really stop violence? Not by itself. While violent games may influence some individuals, they are not the sole reason people commit violent acts.",
    author: "Mane Monteza Talibong",
    date: "2026-06-27",
    image: "/images/article-violence.jpg",
    categories: ["Column"],
    featured: true,
    status: "published",
  },
  {
    id: "1320",
    slug: "the-truth-cannot-be-buried-campus-publications-are-not-pios",
    title: "The Truth Cannot Be Buried: Campus Publications Are Not PIOs",
    excerpt:
      "The deletion of a campus publication's Facebook page has sparked serious concern among students and journalists about the state of campus press freedom.",
    author: "Watchguild",
    date: "2026-04-08",
    image: "/images/article-truth.png",
    categories: ["Column", "Feature article", "Latest News"],
    featured: true,
    status: "published",
  },
  {
    id: "1318",
    slug: "dont-date-a-broke-man",
    title: "Don't Date a Broke Man",
    excerpt:
      "Can love really survive without financial readiness? No, and pretending it can only delays the heartbreak.",
    author: "Watchguild",
    date: "2026-04-08",
    image: "/images/article-broke-man.png",
    categories: ["Column", "Feature article", "Latest News"],
    featured: true,
    status: "published",
  },
  {
    id: "1316",
    slug: "a-solo-run-a-high-bar-the-weight-of-the-unopposed",
    title: "A Solo Run, A High Bar - The Weight of the Unopposed",
    excerpt:
      "The air inside the hall during the Miting de Avance was thick, not just with the heat of the afternoon, but with the weight of promises.",
    author: "Watchguild",
    date: "2026-04-08",
    image: "/images/article-solo-run.png",
    categories: ["Editorial", "Feature article", "Latest News"],
    featured: true,
    status: "published",
  },
  {
    id: "1300",
    slug: "education-butuan-city-philippines-pecit",
    title: "Shaping Futures: The Role of PECIT in the Academic Landscape of Butuan City",
    excerpt:
      "Education in Butuan City has long been a cornerstone of the region's growth, transforming this historic First Kingdom into a modern hub for innovation.",
    author: "Watchguild",
    date: "2026-04-19",
    image: "/images/hero-campus.jpg",
    categories: ["Promotional"],
    status: "published",
  },
  {
    id: "1200",
    slug: "challenges-of-working-students-towards-academicperformance",
    title: "Challenges of Working Students Towards Academic Performance",
    excerpt:
      "Authors: Hector F. Baloria, Angelica O. Bacor, Leah G. Bacquial, Francis A. Balmis, Jessa R. Bacquial, and others.",
    author: "Research Team",
    date: "2026-02-19",
    categories: ["Research"],
    status: "published",
  },
  {
    id: "1198",
    slug: "extent-of-implementation-on-disaster-risk-reductionmanagement-policies-basis-for-a-proposed-action-plan",
    title:
      "Extent of Implementation on Disaster Risk Reduction Management Policies: Basis for a Proposed Action Plan",
    excerpt:
      "Authors: Mitchie P. Gravino, Joshua O. Gabales, Michelle Ann C. Igot, John Ryan Languez, and others.",
    author: "Research Team",
    date: "2026-02-19",
    categories: ["Research"],
    status: "published",
  },
];

export const teamMembers = editorialBoard.map(({ name, role, image }) => ({
  name,
  role,
  image,
}));

export const editorialPillars = [
  {
    title: "We Deliver Truth",
    description:
      "We uphold the highest standards of accuracy, fairness, and integrity in every article we publish. Misinformation has no place in our pages.",
    icon: "shield",
  },
  {
    title: "We Think Critically",
    description:
      "We approach every story with depth and insight, asking tough questions, examining all sides, and thinking beyond the surface.",
    icon: "eye",
  },
  {
    title: "We Amplify Student Voices",
    description:
      "We are a platform where every PECIT student can be seen and heard, regardless of background, course, or opinion.",
    icon: "users",
  },
];
