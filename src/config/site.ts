import { AREA_PAGES } from "../data/areas";
import { JOBS } from "../data/jobs";
import { SERVICES } from "../data/services";
import client from "../content/client.json";
import { BRAND, mapsDirectionsUrl, mapsEmbedUrl, telHref } from "./brand";
import { r2img } from "../lib/r2";

export { AREA_PAGES };
export type { AreaPage } from "../data/areas";
export type { SiteService } from "../data/services";

const copy = client.copy;
const images = client.branding.images;

export const COMPANY_IMAGES = JOBS.map((job) => ({
  slug: job.slug,
  title: job.title,
  caption: job.caption,
  alt: job.coverAlt,
  image: job.cover,
  materialImage: job.images[1]?.src ?? job.cover,
  materialAlt: job.images[1]?.alt ?? job.coverAlt,
  serviceSlug: job.serviceSlug,
}));

const listingUrl = client.googleReviews.profileUrl || client.map.listingUrl;
const mapQuery = client.map.query || `${BRAND.legalName}, ${BRAND.city} ${BRAND.state}`;

const ownerImage = r2img(images.owner);

export const SITE = {
  ...BRAND,
  serviceNoun: copy.serviceNoun,
  serviceType: copy.serviceType,
  schemaKnowsAbout: copy.schemaKnowsAbout,
  ctaPrimaryLabel: copy.ctaPrimaryLabel,
  phoneCtaLabel: copy.phoneCtaLabel,
  ogImageAlt: copy.ogImageAlt,
  heroImageAlt: copy.heroImageAlt,
  formConsent: copy.formConsent,
  sidebarTitle: copy.sidebarTitle,
  sidebarBody: copy.sidebarBody,
  serviceAreasIntro: copy.serviceAreasIntro,
  contactTitle: copy.contactTitle,
  contactDescription: copy.contactDescription,
  contactHeading: copy.contactHeading,
  contactIntro: copy.contactIntro,
  aboutDescription: copy.aboutDescription,
  policyDescription: copy.policyDescription,
  termsDescription: copy.termsDescription,
  jobAreaLink: copy.jobAreaLink,
  mediaOrigin: new URL(BRAND.mediaBase).origin,

  brandLogoUrl: r2img(images.logo),
  brandLogoLightUrl: r2img(images.logo),
  brandLogoDarkUrl: r2img(images.logo),
  faviconUrl: r2img(images.favicon),
  brandLogoWidth: 1500,
  brandLogoHeight: 675,
  ogImage: r2img(images.hero),

  businessHours: "Call for hours",

  seoTitle: client.seo.title,
  seoDescription: client.seo.description,
  seoKeywords: client.seo.keywords,

  topBar: {
    location: `${BRAND.city}, ${BRAND.state} · ${BRAND.region}`,
    emergency: "Free estimates",
    financing: "Residential · Commercial",
    rating: client.googleReviews.rating,
    reviewCount: String(client.googleReviews.count),
  },

  navLinks: client.nav.links,
  nav: client.nav,

  hero: {
    ...copy.hero,
    ctaSchedule: copy.ctaPrimaryLabel,
    emergencyHref: telHref(),
    image: r2img(images.hero),
    imageSm: r2img(images.heroSm),
    ownerCard: {
      name: BRAND.ownerName,
      role: BRAND.ownerRole,
      image: ownerImage,
      alt: `${BRAND.ownerName}, owner of ${BRAND.name}`,
      note: copy.hero.ownerNote,
      cta: copy.hero.ownerCta,
      ctaHref: telHref(),
    },
    leadForm: client.form,
  },

  trustBar: copy.trustBar,

  process: {
    label: copy.process.label,
    title: copy.process.title,
    subtitle: copy.process.subtitle,
    meet: {
      name: BRAND.ownerName,
      role: BRAND.ownerRole,
      image: ownerImage,
      alt: `${BRAND.ownerName}, owner of ${BRAND.name}`,
      message: copy.process.meetMessage,
    },
    steps: copy.process.steps,
  },

  offersSection: copy.offersSection,
  offers: copy.offers,

  servicesHeading: copy.servicesHeading,
  servicesLabel: copy.servicesLabel,
  servicesIntro: copy.servicesIntro,
  servicesPrimary: client.primaryServiceSlugs,
  services: SERVICES,

  valueProps: copy.valueProps,
  whyChoose: copy.whyChoose,
  reviewsSection: copy.reviewsSection,
  reviewsPage: copy.reviewsPage,
  shop: copy.shop,
  workGallery: copy.workGallery,

  featuredProjects: JOBS.slice(0, 4).map((job) => ({
    slug: job.slug,
    title: `${job.serviceLabel} · ${job.city}`,
    description: job.summary,
    location: `${job.city}, ${BRAND.state}`,
    material: job.serviceLabel,
    serviceSlug: job.serviceSlug,
    cover: job.cover,
    images: job.images,
  })),

  ownerStory: {
    label: copy.ownerStory.label,
    quoteParts: [{ text: `“${copy.ownerStory.quote}”`, highlight: "accent" as const }],
    familyImage: ownerImage,
    familyAlt: `${BRAND.ownerName}, owner of ${BRAND.name}`,
    caption: copy.ownerStory.caption,
    ctaText: copy.ownerStory.ctaText,
    ctaHref: copy.ownerStory.ctaHref,
    quoteAttribution: copy.ownerStory.quoteAttribution,
    quoteRole: copy.ownerStory.quoteRole,
    homepageParagraphLimit: copy.ownerStory.homepageParagraphLimit,
    paragraphs: copy.ownerStory.paragraphs.map((text) => ({ parts: [{ text }] })),
  },

  teamSection: copy.teamSection,
  teamMembers: copy.teamMembers.map((member) => ({
    ...member,
    image: ownerImage,
  })),

  serviceAreas: client.serviceAreas.map((area) => area.name),

  serviceArea: {
    heading: copy.serviceArea.heading,
    body: copy.serviceArea.body,
    country: copy.serviceArea.country,
    states: [BRAND.state],
    bias: { lat: BRAND.mapCenter.lat, lon: BRAND.mapCenter.lng },
    localities: client.serviceAreas.map((area) => area.name),
  },

  googleReviews: {
    ...client.googleReviews,
    profileUrl: listingUrl,
  },

  map: {
    directionsUrl: mapsDirectionsUrl(),
    listingUrl,
    embedUrl: mapsEmbedUrl(mapQuery),
    center: BRAND.mapCenter,
    zoom: BRAND.mapZoom,
    radiusMiles: BRAND.mapRadiusMiles,
  },

  ctaBanner: copy.ctaBanner,
  beforeAfter: copy.beforeAfter,
  serviceFaqs: copy.faqs,

  footerServices: [
    ...client.primaryServiceSlugs.flatMap((slug) => {
      const service = SERVICES.find((item) => item.slug === slug);
      return service ? [{ label: service.title, href: `/services/${service.slug}` }] : [];
    }),
    { label: copy.ctaPrimaryLabel, href: "/contact" },
  ],

  footerCompany: [
    { label: "Home", href: "/" },
    { label: client.nav.aboutLabel, href: "/about" },
    { label: client.nav.reviewsLabel, href: "/#reviews" },
    { label: client.nav.areasLabel, href: "/areas" },
    { label: client.nav.contactLabel, href: "/contact" },
  ],

  footerBlurb: copy.footerBlurb,

  social: {
    facebook: "",
    google: listingUrl,
    instagram: "",
    youtube: "",
  },
};

export function formatSiteAddress(
  parts: Pick<typeof SITE, "address" | "city" | "state" | "zip"> = SITE,
): string {
  return [parts.address, `${parts.city}, ${parts.state} ${parts.zip}`]
    .filter((part) => Boolean(part && String(part).trim()))
    .join(", ");
}

export type SiteConfig = typeof SITE;
export type FeaturedProject = (typeof SITE.featuredProjects)[number];
export type NavMenuItem = { label: string; href: string };

export const NAV_MENUS = {
  services: {
    label: client.nav.servicesLabel,
    parentHref: "/#services",
    items: [
      { label: "All Services", href: "/#services" },
      ...SITE.services.map((service) => ({
        label: service.title,
        href: `/services/${service.slug}`,
      })),
    ] satisfies NavMenuItem[],
  },
  areas: {
    label: client.nav.areasLabel,
    parentHref: "/areas",
    items: [
      { label: "All Service Areas", href: "/areas" },
      ...AREA_PAGES.map((area) => ({
        label: area.name,
        href: `/areas/${area.slug}`,
      })),
    ] satisfies NavMenuItem[],
  },
} as const;
