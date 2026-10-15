import client from "../content/client.json";
import { fillTemplate } from "../lib/template";

export type AreaPage = {
  slug: string;
  name: string;
  county: string;
  headline: string;
  intro: string;
  body: string;
  servicesNote: string;
  servicesHeading: string;
  pageTitle: string;
  eyebrow: string;
  highlights: string[];
  faqs: { q: string; a: string }[];
};

const copy = client.copy;

export const AREA_PAGES: AreaPage[] = client.serviceAreas.map((area) => {
  const vars = { areaName: area.name };
  return {
    slug: area.slug,
    name: area.name,
    county: area.county,
    headline: fillTemplate(copy.areaHeadline, vars),
    intro: fillTemplate(copy.areaIntro, vars),
    body: fillTemplate(copy.areaBody, vars),
    servicesNote: fillTemplate(copy.areaServicesNote, vars),
    servicesHeading: fillTemplate(copy.areaServicesHeading, vars),
    pageTitle: fillTemplate(copy.areaPageTitle, vars),
    eyebrow: copy.areaEyebrow,
    highlights: fillTemplate(copy.areaHighlights, vars),
    faqs: fillTemplate(copy.areaFaqs, vars),
  };
});
