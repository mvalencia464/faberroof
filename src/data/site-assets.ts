import { SITE } from "../config/site";

export type AssetCategory = "brand" | "marketing" | "service" | "gallery";

export type SiteAsset = {
  url: string;
  label: string;
  category: AssetCategory;
  usedIn: string[];
};

export function buildSiteAssets(): SiteAsset[] {
  const assets: SiteAsset[] = [
    { url: SITE.brandLogoUrl, label: "Logo", category: "brand", usedIn: ["header"] },
    { url: SITE.faviconUrl, label: "Favicon", category: "brand", usedIn: ["head"] },
    { url: SITE.ogImage, label: "Hero", category: "marketing", usedIn: ["home"] },
    { url: SITE.hero.ownerCard.image, label: "Owner", category: "marketing", usedIn: ["about"] },
  ];

  for (const service of SITE.services) {
    assets.push({
      url: service.image,
      label: service.title,
      category: "service",
      usedIn: [`/services/${service.slug}`],
    });
  }

  return assets.filter((asset) => Boolean(asset.url));
}
