import { BRAND } from "../config/brand";

/** Canonical origin for JSON-LD and fallbacks when Astro.site is unset. */
export function siteOrigin(astroSite?: URL): string {
  if (astroSite?.origin) return astroSite.origin;
  return BRAND.siteUrl.replace(/\/$/, "");
}

export function siteHref(path: string, astroSite?: URL): string {
  return new URL(path, `${siteOrigin(astroSite)}/`).href;
}
