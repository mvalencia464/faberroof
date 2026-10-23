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
  imageAlt: string;
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
  sections?: { heading: string; body: string }[];
  faq: { q: string; a: string };
  icon: string;
  iconStyle?: string;
  image: string;
  imageAlt?: string;
  gallery?: Array<string | { image: string; alt: string }>;
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
    seoTitle: `${service.title} in Metro Detroit | ${BRAND.name}`,
    seoDescription: `${service.shortDesc} Call ${BRAND.phone}.`,
    shortDesc: service.shortDesc,
    icon: service.icon,
    iconStyle: service.iconStyle ?? "navy",
    image,
    imageAlt: service.imageAlt || `${service.title} by ${BRAND.name}`,
    galleryImages: [
      {
        image,
        alt: service.imageAlt || `${service.title} by ${BRAND.name}`,
      },
      ...(service.gallery ?? []).map((item) =>
        typeof item === "string"
          ? { image: item, alt: `${service.title} by ${BRAND.name}` }
          : { image: item.image, alt: item.alt },
      ),
    ],
    fullDesc: service.fullDesc,
    highlights: service.highlights,
    bodySections: service.sections?.length
      ? service.sections
      : [
          { heading: service.heading, body: service.body },
          {
            heading: `Roofing across ${BRAND.region}`,
            body: `${BRAND.name} is based at ${BRAND.address}, ${BRAND.city}, ${BRAND.state}. Call ${BRAND.phone} for a roof in ${BRAND.city} or Detroit.`,
          },
        ],
    faqs: where ? [service.faq, where] : [service.faq],
  };
});
