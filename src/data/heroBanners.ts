export interface HeroBanner {
  id: string;
  image: string;
  alt: string;
  href?: string;
}

/** Only these two banners rotate in the homepage hero */
export const heroBanners: HeroBanner[] = [
  {
    id: "watchguild",
    image: "/images/banner-watchguild.jpg",
    alt: "The Watch Guild — Official Student Publication of PECIT",
    href: "/about/",
  },
  {
    id: "pecit",
    image: "/images/banner-pecit.jpg",
    alt: "PECIT — Where Science and Technology is at its Best",
    href: "/about/",
  },
];
