export const siteConfig = {
  businessName: "The Watch Guild",
  publicationName: "The Watch Guild Publication",
  tagline: "Official Student Publication of PECIT",
  institution: "Philippine Electronics and Communication Institute of Technology",
  institutionShort: "PECIT",
  phone: "(085) 225-5543",
  email: "Watchguildpecit12@gmail.com",
  address: {
    street: "Capitol-Bonbon Rd, Imadejas Subd.",
    city: "Butuan City",
    state: "Agusan Del Norte",
    zip: "8600",
  },
  serviceArea: "Butuan City, Philippines",
  domain: "https://pecitwatchguild.com",
  socialLinks: {
    facebook: "https://www.facebook.com/watchguildpecit",
    instagram: "",
    google: "",
    youtube: "https://www.youtube.com/@watchguildpecit",
    twitter: "https://twitter.com/watchguildpecit",
  } as Record<string, string>,
  formEndpoint: "",
  logo: "/images/logo.png",
  gtmId: "",
  googleMapsEmbed: "",

  motto: "Truth. Insight. Student Voice.",
  mission:
    "We inform, inspire, and engage the PECIT community through accurate reporting, critical commentary, and creative storytelling.",

  pattern: "pattern-grid",
  silhouette: "cityscape" as const,

  /** Extracted from logo.png — used in global.css @theme */
  brandColors: {
    primary: "#16009A",
    primaryLight: "#473191",
    primaryDark: "#0E006E",
    secondary: "#9C4D7C",
    secondaryLight: "#B86396",
    accent: "#C05070",
    accentLight: "#D66B8A",
  },

  /** CMS webhook endpoint — set when your headless CMS is ready */
  cmsWebhookSecret: "",
};
