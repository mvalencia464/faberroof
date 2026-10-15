# Contractor starter (Astro + Cloudflare Pages)

Reusable site for a local contractor. The sample client is **Acme Roofing** (`example.com`) on the roofing pack. Client facts live in [`src/content/client.json`](src/content/client.json). Trade-specific services, form options, FAQs, and page copy live in [`src/content/packs/`](src/content/packs/).

[`src/config/brand.ts`](src/config/brand.ts) and [`src/config/site.ts`](src/config/site.ts) only load that JSON. Pages and components read `SITE` / `BRAND`. Image paths go through `r2img()` using `PUBLIC_R2_PUBLIC_BASE_URL` and `PUBLIC_R2_SITE_SLUG`.

Do not clone a live client repo onto this template. Run `new-client`, then put the result in its own GitHub repo.

## New client

```bash
npm install
npm run new-client -- \
  --name "Faber Roof" \
  --slug faber-roof \
  --trade roofing \
  --city Austin \
  --state TX \
  --phone "(512) 555-0199" \
  --email hello@faberroof.example \
  --site-url https://faberroof.example \
  --cid ""
```

`--trade` is `roofing`, `painting`, or `hvac`. Omit flags in a terminal and the script will prompt. It writes:

- `src/content/client.json` from the pack (identity, URLs, branding, map, reviews shell, SEO, copy, form, nav, service areas, primary service slugs)
- `wrangler.toml` (`PUBLIC_R2_SITE_SLUG`, `SITE_URL`)
- `public/robots.txt` sitemap from the site URL
- `scripts/reviews-clients.json`
- an empty `src/data/google-reviews.json`

Optional flags: `--owner`, `--region`, `--zip`, `--county`.

Then replace placeholder images under `public/placeholders/` or point `branding.images` at R2 keys (no full URL; `r2img()` adds the base). Add real jobs in `src/data/jobs.ts` only as data objects — do not hardcode a client’s slugs in components.

The homepage before/after block reads `copy.beforeAfter` and stays hidden while `enabled` is `false`. Set `enabled` to `true` and point `beforeImage` / `afterImage` at real files when you want it. A job with both `beforeImage` and `afterImage` uses the same slider on its own page.

## Checklist

1. `npm run new-client` with the real name, slug, trade, city, phone, email, and site URL.
2. Confirm `client.json` identity, palette, and `schemaType` (`RoofingContractor`, `HousePainter`, or `HVACBusiness`).
3. Set `PUBLIC_R2_PUBLIC_BASE_URL`, `PUBLIC_R2_SITE_SLUG`, and `SITE_URL` in `.env` and in the Pages project. `npm run build` reads `SITE_URL` for the sitemap.
4. Decimal Google CID in `scripts/reviews-clients.json` (string). `https://www.google.com/maps?cid=THAT_NUMBER` must open the same listing. Do not convert a Maps `!1s0x…:0x…` feature id.
5. `npm run sync-reviews` when DataForSEO credentials exist. Preview builds set `SKIP_SYNC_REVIEWS=1`.
6. Cloudflare Pages: build `npm run build`, output `dist`. Secrets `GHL_WEBHOOK_URL` or `GHL_PRIVATE_TOKEN` + `GHL_LOCATION_ID` stay in the dashboard, not in git.
7. Client-name gate before you ship. From the repo root, this must print nothing:

```bash
grep -RInE 'holtmeier|cedar|jcsolutions' --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git --exclude=README.md .
```

Schema.org types such as `HousePainter` are trade data, not client names, and should stay in the painting pack.

## Develop

```bash
npm install
cp .env.example .env
npm run dev
```

```bash
SKIP_SYNC_REVIEWS=1 npm run build
npm run deploy   # production only, after the site is reviewed
```
