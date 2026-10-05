export interface NavItem {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
}

/**
 * Nav structure adapted from CSU (carsu.edu.ph):
 * - Research as a structured mega-dropdown (journals, studies, resources)
 * - Articles grouped by type
 */
export const mainNav: NavItem[] = [
  {
    label: "About Us",
    href: "/about/",
    children: [
      { label: "The Watch Guild", href: "/about/", description: "Mission, vision, and editorial promise" },
      { label: "Our Institution", href: "/about/#institution", description: "About PECIT" },
      { label: "Editorial Board", href: "/journalists/", description: "Meet the Guild" },
    ],
  },
  {
    label: "Articles",
    href: "/articles/",
    children: [
      { label: "Latest News", href: "/articles/?category=latest-news" },
      { label: "Feature Articles", href: "/articles/?category=feature" },
      { label: "Columns", href: "/articles/?category=column" },
      { label: "Editorials", href: "/articles/?category=editorial" },
      { label: "All Articles", href: "/articles/" },
    ],
  },
  {
    label: "Research",
    href: "/research/",
    children: [
      {
        label: "Scholarly Works",
        href: "/research/",
        description: "Student research studies and abstracts",
      },
      {
        label: "Kahayag Journal",
        href: "/research/kahayag/",
        description: "Multidisciplinary Research Journal",
      },
      {
        label: "Book of Abstracts",
        href: "/research/book-of-abstracts/",
        description: "Compiled research presentations",
      },
      {
        label: "Student Research",
        href: "/research/studies/",
        description: "Graduating student research papers",
      },
      {
        label: "Research & Extension",
        href: "/research/extension/",
        description: "RIED presentations and partnerships",
      },
    ],
  },
  { label: "Journalists", href: "/journalists/" },
  { label: "Student Handbook", href: "/handbook/" },
  { label: "Contact Us", href: "/contact/" },
];

/** CSU-style "Explore / Quick Links" panel */
export const quickLinks = [
  { label: "Latest Articles", href: "/articles/", icon: "newspaper" },
  { label: "Scholarly Works", href: "/research/", icon: "book" },
  { label: "Kahayag Journal", href: "/research/kahayag/", icon: "journal" },
  { label: "Student Handbook", href: "/handbook/", icon: "handbook" },
  { label: "Join the Guild", href: "/journalists/", icon: "users" },
  { label: "Contact Us", href: "/contact/", icon: "mail" },
];

export const footerNav = [
  { label: "About Us", href: "/about/" },
  { label: "Articles", href: "/articles/" },
  { label: "Research", href: "/research/" },
  { label: "Kahayag Journal", href: "/research/kahayag/" },
  { label: "Journalists", href: "/journalists/" },
  { label: "Student Handbook", href: "/handbook/" },
  { label: "Contact Us", href: "/contact/" },
  { label: "Privacy Policy", href: "/privacy-policy/" },
];
