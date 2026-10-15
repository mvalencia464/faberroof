import client from "../content/client.json";
import { BRAND } from "../config/brand";
import { fillTemplate } from "../lib/template";
import roofingServices from "../content/packs/roofing/services.json";
import paintingServices from "../content/packs/painting/services.json";
import hvacServices from "../content/packs/hvac/services.json";

export type SiteService = {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  shortDesc: string;
  icon: string;
  iconStyle: string;
  image: string;
  galleryImages: { image: string; alt: string }[];
  fullDesc: string;
  highlights: string[];
  bodySections: { heading: string; body: string }[];
  faqs: { q: string; a: string }[];
};

type PackService = {
  slug: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  highlights: string[];
  heading: string;
  body: string;
  faq: { q: string; a: string };
  icon: string;
  iconStyle?: string;
  image: string;
  gallery?: string[];
};

const PACKS: Record<string, PackService[]> = {
  roofing: roofingServices as PackService[],
  painting: paintingServices as PackService[],
  hvac: hvacServices as PackService[],
};

const pack = PACKS[client.identity.trade];
if (!pack) {
  throw new Error(`No service pack for trade "${client.identity.trade}"`);
}

const vars = {
  name: BRAND.name,
  legalName: BRAND.legalName,
  city: BRAND.city,
  state: BRAND.state,
  region: BRAND.region,
  phone: BRAND.phone,
  tradeLabel: BRAND.tradeLabel,
};

export const SERVICES: SiteService[] = pack.map((raw) => {
  const service = fillTemplate(raw, vars);
  const image = service.image;
  const where = client.copy.faqs.find((faq) => faq.q === "Where do you work?");
  return {
    slug: service.slug,
    title: service.title,
    seoTitle: `${service.title} | ${BRAND.name} in ${BRAND.city}, ${BRAND.state}`,
    seoDescription: `${service.shortDesc} Call ${BRAND.phone}.`,
    shortDesc: service.shortDesc,
    icon: service.icon,
    iconStyle: service.iconStyle ?? "navy",
    image,
    galleryImages: [
      { image, alt: `${service.title} by ${BRAND.name}` },
      ...(service.gallery ?? []).map((src) => ({
        image: src,
        alt: `${service.title} by ${BRAND.name}`,
      })),
    ],
    fullDesc: service.fullDesc,
    highlights: service.highlights,
    bodySections: [
      { heading: service.heading, body: service.body },
      {
        heading: `${BRAND.tradeLabel} across ${BRAND.region}`,
        body: `${BRAND.legalName} serves ${BRAND.city} and ${BRAND.region}. Call ${BRAND.phone}.`,
      },
    ],
    faqs: where ? [service.faq, where] : [service.faq],
  };
});
