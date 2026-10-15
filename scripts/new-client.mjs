#!/usr/bin/env node
/**
 * Scaffold a contractor site from a trade pack.
 *
 *   npm run new-client -- --name "Faber Roof" --slug faber-roof --trade roofing \
 *     --city Austin --state TX --phone "(512) 555-0199" --email hello@faberroof.example \
 *     --site-url https://faberroof.example --cid 123
 */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRADES = ["roofing", "painting", "hvac"];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const body = token.slice(2);
    if (body.includes("=")) {
      const [key, ...rest] = body.split("=");
      out[key] = rest.join("=");
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      out[body] = next;
      i += 1;
    } else {
      out[body] = "1";
    }
  }
  return out;
}

function fill(value, vars) {
  if (typeof value === "string") {
    return value.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : `{{${key}}}`,
    );
  }
  if (Array.isArray(value)) return value.map((item) => fill(item, vars));
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = fill(item, vars);
    return out;
  }
  return value;
}

function kebab(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function readJson(rel) {
  return JSON.parse(await readFile(path.join(root, rel), "utf8"));
}

async function ask(rl, label, current) {
  if (current) return current;
  const answer = (await rl.question(`${label}: `)).trim();
  if (!answer) {
    throw new Error(`Missing ${label}`);
  }
  return answer;
}

function wranglerToml({ slug, siteUrl }) {
  const shared = `PUBLIC_R2_PUBLIC_BASE_URL = "https://media.stokeleads.com"
PUBLIC_R2_SITE_SLUG = "${slug}"
SITE_URL = "${siteUrl}"`;
  return `name = "contractor-starter"
compatibility_date = "2026-10-01"
pages_build_output_dir = "./dist"

# Public build vars only. GHL_WEBHOOK_URL, GHL_PRIVATE_TOKEN, and GHL_LOCATION_ID
# stay in the Cloudflare dashboard (or .dev.vars), never in this file.

[vars]
${shared}

[env.preview.vars]
${shared}
SKIP_SYNC_REVIEWS = "1"
`;
}

function robotsTxt(siteUrl) {
  const origin = siteUrl.replace(/\/$/, "");
  return `User-agent: *
Allow: /

Disallow: /admin/

Sitemap: ${origin}/sitemap-index.xml
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const interactive = Boolean(input.isTTY) && process.env.NEW_CLIENT_NO_PROMPT !== "1";
  const rl = interactive ? createInterface({ input, output }) : null;

  try {
    const name = rl ? await ask(rl, "Business name", args.name) : args.name;
    const trade = (rl ? await ask(rl, `Trade (${TRADES.join("|")})`, args.trade) : args.trade)?.toLowerCase();
    const city = rl ? await ask(rl, "City", args.city) : args.city;
    const state = (rl ? await ask(rl, "State", args.state) : args.state)?.toUpperCase();
    const phone = rl ? await ask(rl, "Phone", args.phone) : args.phone;
    const email = rl ? await ask(rl, "Email", args.email) : args.email;
    const siteUrl = (rl ? await ask(rl, "Site URL", args["site-url"] || args.siteUrl) : args["site-url"] || args.siteUrl)?.replace(/\/$/, "");
    const slug = kebab(rl ? await ask(rl, "Slug", args.slug || kebab(name || "")) : args.slug || kebab(name || ""));
    const cid = args.cid ?? "";
    const ownerName = args.owner || "Alex Morgan";
    const region = args.region || `Greater ${city}`;
    const zip = args.zip || "";
    const county = args.county || "";

    if (!name || !trade || !city || !state || !phone || !email || !siteUrl || !slug) {
      throw new Error(
        "Required: --name --slug --trade --city --state --phone --email --site-url (cid optional)",
      );
    }
    if (!TRADES.includes(trade)) {
      throw new Error(`Unknown trade "${trade}". Use ${TRADES.join(", ")}.`);
    }

    const meta = await readJson(`src/content/packs/${trade}/meta.json`);
    const copyTpl = await readJson(`src/content/packs/${trade}/copy.json`);
    const formTpl = await readJson(`src/content/packs/${trade}/form.json`);
    const faqs = await readJson(`src/content/packs/${trade}/faqs.json`);
    const knowsAbout = await readJson(`src/content/packs/${trade}/knowsAbout.json`);

    const shortName = name.split(/\s+/)[0] || name;
    const vars = {
      name,
      shortName,
      legalName: name,
      tagline: `${meta.tradeLabel} in ${region}.`,
      catchphrase: `${name.toUpperCase()} — ${meta.tradeLabel.toUpperCase()}`,
      phone,
      email,
      city,
      state,
      region,
      ownerName,
      ownerRole: "Owner",
      trade: meta.trade,
      tradeLabel: meta.tradeLabel,
      serviceNoun: meta.serviceNoun,
      serviceType: meta.serviceType,
      ctaPrimaryLabel: meta.ctaPrimaryLabel,
      phoneCtaLabel: meta.phoneCtaLabel,
      schemaType: meta.schemaType,
      areaName: "{{areaName}}",
    };

    const copy = fill(copyTpl, vars);
    copy.schemaKnowsAbout = knowsAbout;
    copy.faqs = fill(faqs, vars);
    const form = fill(formTpl, vars);

    const client = {
      identity: {
        name,
        shortName,
        legalName: name,
        tagline: vars.tagline,
        catchphrase: vars.catchphrase,
        phone,
        email,
        address: "",
        city,
        state,
        zip,
        license: "",
        ownerName,
        ownerRole: "Owner",
        region,
        trade: meta.trade,
        tradeLabel: meta.tradeLabel,
        schemaType: meta.schemaType,
        slug,
      },
      urls: {
        siteUrl,
      },
      branding: {
        palette: meta.palette,
        fonts: meta.fonts,
        images: {
          logo: "/placeholders/logo.svg",
          favicon: "/favicon.svg",
          hero: "/placeholders/hero.svg",
          heroSm: "/placeholders/hero.svg",
          owner: "/placeholders/hero.svg",
        },
      },
      map: {
        lat: 39.7817,
        lng: -89.6501,
        zoom: 10,
        radiusMiles: 25,
        listingUrl: "",
        query: `${name}, ${city} ${state}`,
      },
      googleReviews: {
        businessName: name,
        rating: 0,
        count: 0,
        category: `${meta.tradeLabel} in ${city}, ${state}`,
        profileUrl: "",
        maxDisplay: 8,
        cid: String(cid),
        placeId: "",
      },
      seo: {
        title: `${name} | ${meta.tradeLabel} in ${city}, ${state}`,
        description: `${meta.tradeLabel} in ${city} and ${region}. Call ${phone} for an estimate.`,
        keywords: `${name}, ${meta.tradeLabel} ${city} ${state}, ${region}`,
      },
      copy,
      form,
      nav: {
        servicesLabel: "Services",
        areasLabel: "Service Areas",
        aboutLabel: "About Us",
        reviewsLabel: "Reviews",
        contactLabel: "Contact",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Reviews", href: "/#reviews" },
          { label: "Contact", href: "/contact" },
        ],
      },
      serviceAreas: [
        {
          slug: kebab(city),
          name: city,
          county,
        },
      ],
      primaryServiceSlugs: meta.primaryServiceSlugs,
    };

    const reviewsClients = {
      defaultSlug: slug,
      clients: [
        {
          slug,
          name,
          cid: String(cid),
          location_code: 2840,
          language_code: "en",
          depth: 20,
          sort_by: "newest",
          profileUrl: "",
          outputJson: "src/data/google-reviews.json",
          outputAvatarsDir: "src/assets/avatars",
          outputReviewImagesDir: "src/assets/review-images",
        },
      ],
    };

    const emptyReviews = {
      businessName: "",
      rating: 0,
      reviewsCount: 0,
      cid: "",
      placeId: null,
      profileUrl: "",
      syncedAt: null,
      rawReviews: [],
    };

    await writeFile(path.join(root, "src/content/client.json"), `${JSON.stringify(client, null, 2)}\n`);
    await writeFile(path.join(root, "wrangler.toml"), wranglerToml({ slug, siteUrl }));
    await writeFile(path.join(root, "public/robots.txt"), robotsTxt(siteUrl));
    await writeFile(
      path.join(root, "scripts/reviews-clients.json"),
      `${JSON.stringify(reviewsClients, null, 2)}\n`,
    );
    await writeFile(
      path.join(root, "src/data/google-reviews.json"),
      `${JSON.stringify(emptyReviews, null, 2)}\n`,
    );

    console.log(`Wrote client.json for ${name} (${trade}, ${slug}).`);
    console.log("Reset reviews, robots.txt, reviews-clients.json, and wrangler.toml.");
  } finally {
    rl?.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
