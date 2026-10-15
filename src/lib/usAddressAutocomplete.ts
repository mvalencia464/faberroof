/**
 * Portable US address autocomplete (Photon + Nominatim).
 * Framework-agnostic — pass options from site config.
 */

export type ServiceAreaBias = { lat: number; lon: number };

export type ServiceAreaGeo = {
  country?: string;
  states?: string[];
  bias?: ServiceAreaBias;
  bbox?: [number, number, number, number]; // minLon, minLat, maxLon, maxLat
  /** Soft-rank these towns/cities; never hard-appended to the search query. */
  localities?: string[];
};

export type AddressParts = {
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  display: string;
  source: 'photon' | 'nominatim';
  /** Optional coords for distance ranking (not submitted with the form). */
  lat?: number;
  lon?: number;
};

export type FetchOptions = ServiceAreaGeo & {
  limit?: number;
  signal?: AbortSignal;
};

const PHOTON_URL = 'https://photon.komoot.io/api/';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const ZIPPOPOTAM_URL = 'https://api.zippopotam.us/us';

/** Cache postal city lookups (ZIP → place name). */
const zipCityCache = new Map<string, string | null>();

const STREET_ABBREV: Record<string, string> = {
  avenue: 'ave',
  street: 'st',
  boulevard: 'blvd',
  drive: 'dr',
  road: 'rd',
  lane: 'ln',
  court: 'ct',
  circle: 'cir',
  place: 'pl',
  terrace: 'ter',
  highway: 'hwy',
  parkway: 'pkwy',
  north: 'n',
  south: 's',
  east: 'e',
  west: 'w',
  northeast: 'ne',
  northwest: 'nw',
  southeast: 'se',
  southwest: 'sw',
};

/** Reverse map: rd → road (for Photon search — OSM usually stores full names). */
const STREET_ABBREV_TO_FULL: Record<string, string> = Object.fromEntries(
  Object.entries(STREET_ABBREV).map(([full, abbr]) => [abbr, full]),
);

function displayStreetAbbrev(token: string): string | null {
  const key = token.replace(/\./g, '').toLowerCase();
  const abbr = STREET_ABBREV[key] ?? (Object.values(STREET_ABBREV).includes(key) ? key : null);
  if (!abbr) return null;
  return abbr.charAt(0).toUpperCase() + abbr.slice(1);
}

/**
 * Expand street abbreviations in the search query (Rd → road).
 * Photon/OSM often index full names; abbreviated queries can swap to wrong states.
 */
export function expandStreetAbbrevsForSearch(query: string): string {
  return query
    .split(/(\s+)/)
    .map((tok) => {
      if (/^\s+$/.test(tok)) return tok;
      const clean = tok.replace(/\./g, '').toLowerCase();
      return STREET_ABBREV_TO_FULL[clean] ?? tok;
    })
    .join('');
}

const US_STATE_NAMES: Record<string, string> = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
  'district of columbia': 'DC',
};

export function normalizeServiceArea(config: ServiceAreaGeo = {}): Required<
  Pick<ServiceAreaGeo, 'country'>
> &
  ServiceAreaGeo {
  return {
    country: (config.country || 'US').toUpperCase(),
    states: config.states?.length ? config.states.map((s) => s.toUpperCase()) : undefined,
    bias: config.bias,
    bbox: config.bbox,
    localities: config.localities?.length
      ? config.localities.map((l) => l.trim()).filter(Boolean)
      : undefined,
  };
}

/** Extract leading house number if present. */
export function extractHouseNumber(query: string): string | null {
  const m = query.trim().match(/^(\d+[A-Za-z]?)\b/);
  return m?.[1] ?? null;
}

/** True when the query is only a house number (or too short / numeric-only). */
export function isHouseNumberOnly(query: string): boolean {
  const t = query.trim();
  if (t.length < 3) return true;
  return /^\d+[A-Za-z]?$/.test(t);
}

export function normalizeStreetKey(line: string): string {
  return line
    .toLowerCase()
    .replace(/[.,#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => STREET_ABBREV[w] ?? w)
    .join(' ');
}

function normalizeState(raw: string | undefined): string {
  if (!raw) return '';
  const t = raw.trim();
  if (t.length === 2) return t.toUpperCase();
  return US_STATE_NAMES[t.toLowerCase()] ?? t.toUpperCase().slice(0, 2);
}

function countryCode(raw: string | undefined): string {
  if (!raw) return '';
  const t = raw.trim().toUpperCase();
  if (t === 'USA' || t === 'UNITED STATES' || t === 'UNITED STATES OF AMERICA') return 'US';
  return t.slice(0, 2);
}

type PhotonProps = {
  housenumber?: string;
  street?: string;
  name?: string;
  city?: string;
  locality?: string;
  district?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countrycode?: string;
  type?: string;
  osm_value?: string;
};

type PhotonFeature = {
  properties?: PhotonProps;
  geometry?: { type?: string; coordinates?: [number, number] };
};

type NominatimResult = {
  display_name?: string;
  address?: {
    house_number?: string;
    road?: string;
    pedestrian?: string;
    residential?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    municipality?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
};

function photonLine1(p: PhotonProps): string {
  const street = p.street || p.name || '';
  if (p.housenumber && street) return `${p.housenumber} ${street}`;
  return street || p.name || '';
}

function photonCity(p: PhotonProps): string {
  // Do not fall back to county — rural OSM rows often only have county;
  // postal city is resolved from ZIP (e.g. 99148 → Loon Lake).
  return p.city || p.town || p.village || p.locality || p.district || '';
}

function nominatimLine1(a: NominatimResult['address']): string {
  if (!a) return '';
  const road = a.road || a.pedestrian || a.residential || '';
  if (a.house_number && road) return `${a.house_number} ${road}`;
  return road;
}

function nominatimCity(a: NominatimResult['address']): string {
  if (!a) return '';
  return a.city || a.town || a.village || a.hamlet || a.municipality || '';
}

function toDisplay(parts: Omit<AddressParts, 'display' | 'source' | 'lat' | 'lon'>): string {
  const bits = [parts.line1, parts.city, [parts.state, parts.zip].filter(Boolean).join(' ')].filter(
    Boolean,
  );
  return bits.join(', ');
}

/** Abbreviate trailing street type: "Oak Valley Road" → "Oak Valley Rd". */
export function abbreviateStreetLine(line1: string): string {
  const tokens = line1.trim().split(/\s+/);
  if (tokens.length < 2) return line1.trim();
  const lastRaw = tokens[tokens.length - 1] ?? '';
  const abbr = displayStreetAbbrev(lastRaw);
  if (!abbr) return line1.trim();
  tokens[tokens.length - 1] = abbr;
  return tokens.join(' ');
}

function formatParts(parts: AddressParts): AddressParts {
  const line1 = abbreviateStreetLine(parts.line1);
  const next = { ...parts, line1 };
  return { ...next, display: toDisplay(next) };
}

function looksLikeCountyName(city: string): boolean {
  const c = city.trim();
  if (!c) return true;
  return /\bcounty\b/i.test(c);
}

/**
 * Resolve USPS postal city from ZIP (e.g. 99148 → Loon Lake).
 * OSM often only has county for rural addresses.
 */
export async function resolveCityFromZip(zip: string): Promise<string | null> {
  const code = zip.trim().slice(0, 5);
  if (!/^\d{5}$/.test(code)) return null;
  if (zipCityCache.has(code)) return zipCityCache.get(code) ?? null;

  try {
    const res = await fetch(`${ZIPPOPOTAM_URL}/${code}`);
    if (!res.ok) {
      zipCityCache.set(code, null);
      return null;
    }
    const data = (await res.json()) as {
      places?: Array<{ 'place name'?: string }>;
    };
    const place = data.places?.[0]?.['place name']?.trim() || null;
    zipCityCache.set(code, place);
    return place;
  } catch {
    zipCityCache.set(code, null);
    return null;
  }
}

async function applyPostalCity(parts: AddressParts): Promise<AddressParts> {
  let next = { ...parts };
  if (parts.zip && looksLikeCountyName(parts.city)) {
    const postalCity = await resolveCityFromZip(parts.zip);
    if (postalCity) next = { ...next, city: postalCity };
  }
  return formatParts(next);
}

async function applyPostalCities(items: AddressParts[]): Promise<AddressParts[]> {
  const zips = [
    ...new Set(
      items
        .filter((i) => i.zip && looksLikeCountyName(i.city))
        .map((i) => i.zip.slice(0, 5)),
    ),
  ];
  await Promise.all(zips.map((z) => resolveCityFromZip(z)));
  return Promise.all(items.map((p) => applyPostalCity(p)));
}

function fromPhoton(f: PhotonFeature): AddressParts | null {
  const p = f.properties;
  if (!p) return null;
  const line1 = photonLine1(p);
  if (!line1) return null;
  const city = photonCity(p);
  const state = normalizeState(p.state);
  const zip = (p.postcode || '').split(';')[0]?.trim() || '';
  const country = countryCode(p.countrycode || p.country) || 'US';
  const coords = f.geometry?.coordinates;
  const base = {
    line1,
    city,
    state,
    zip,
    country,
    lon: coords?.[0],
    lat: coords?.[1],
  };
  return { ...base, display: toDisplay(base), source: 'photon' };
}

function fromNominatim(r: NominatimResult): AddressParts | null {
  const a = r.address;
  if (!a) return null;
  const line1 = nominatimLine1(a);
  if (!line1) return null;
  const city = nominatimCity(a);
  const state = normalizeState(a.state);
  const zip = (a.postcode || '').split(';')[0]?.trim() || '';
  const country = countryCode(a.country_code || a.country) || 'US';
  const base = { line1, city, state, zip, country };
  return { ...base, display: toDisplay(base), source: 'nominatim' };
}

/** Suggestion's own house number, if any. */
function suggestionHouseNumber(parts: AddressParts): string | null {
  return extractHouseNumber(parts.line1);
}

/**
 * Keep exact house matches and street-only hits (OSM often lacks house numbers).
 * Drop suggestions that already have a *different* house number.
 */
function matchesHouseNumber(parts: AddressParts, house: string | null): boolean {
  if (!house) return true;
  const suggested = suggestionHouseNumber(parts);
  if (!suggested) return true;
  return suggested.toLowerCase() === house.toLowerCase();
}

/** Stamp the user's house number onto a street-only match for display/fill. */
function applyTypedHouseNumber(parts: AddressParts, house: string | null): AddressParts {
  if (!house) return parts;
  if (suggestionHouseNumber(parts)) return parts;
  const next = { ...parts, line1: `${house} ${parts.line1}` };
  return { ...next, display: toDisplay(next) };
}

function matchesCountry(parts: AddressParts, country: string): boolean {
  return !parts.country || parts.country === country;
}

const QUERY_STOPWORDS = new Set([
  ...Object.keys(STREET_ABBREV),
  ...Object.values(STREET_ABBREV),
  'the',
  'and',
  'of',
]);

/** Significant street tokens from the typed query (house # and state stripped). */
export function queryStreetTokens(query: string, options: FetchOptions = {}): string[] {
  let q = query.trim().toLowerCase();
  q = q.replace(/^\d+[a-z]?\s+/, '');
  if (options.states?.length) {
    for (const st of options.states) {
      q = q.replace(new RegExp(`\\b${st.toLowerCase()}\\b`, 'g'), ' ');
    }
  }
  q = q.replace(/,/g, ' ');
  return q
    .split(/\s+/)
    .map((w) => STREET_ABBREV[w] ?? w)
    .filter((w) => w.length >= 2 && !QUERY_STOPWORDS.has(w) && !/^\d+$/.test(w));
}

function sharesStreetToken(parts: AddressParts, tokens: string[]): boolean {
  if (!tokens.length) return true;
  const hay = normalizeStreetKey(parts.line1);
  return tokens.some((t) => hay.includes(t));
}

function streetMatchScore(parts: AddressParts, tokens: string[]): number {
  if (!tokens.length) return 0;
  const hay = normalizeStreetKey(parts.line1);
  let hits = 0;
  for (const t of tokens) {
    if (hay.includes(t)) hits += 1;
  }
  return hits / tokens.length;
}

/** Lower score = better. Street match first, then in-market state, then distance. */
function preferLocalRank(
  parts: AddressParts,
  geo: ReturnType<typeof normalizeServiceArea>,
  streetTokens: string[],
): number {
  let rank = (1 - streetMatchScore(parts, streetTokens)) * 50;

  if (geo.states?.length) {
    if (!parts.state) rank += 5;
    else if (!geo.states.includes(parts.state)) rank += 40;
  }

  if (geo.localities?.length && parts.city) {
    const city = parts.city.toLowerCase();
    const hit = geo.localities.some((loc) => {
      const l = loc.toLowerCase();
      return city === l || city.includes(l) || l.includes(city);
    });
    if (hit) rank -= 3;
  }

  if (geo.bias && parts.lat != null && parts.lon != null) {
    const dLat = parts.lat - geo.bias.lat;
    const dLon = parts.lon - geo.bias.lon;
    rank += Math.sqrt(dLat * dLat + dLon * dLon) * 8;
  }

  if (suggestionHouseNumber(parts)) rank -= 2;
  return rank;
}

function queryAlreadyHasPlace(query: string, options: FetchOptions): boolean {
  if (options.states?.length) {
    for (const st of options.states) {
      if (new RegExp(`\\b${st}\\b`, 'i').test(query)) return true;
    }
  }
  return query.includes(',');
}

/**
 * Single-state markets: append `, WA` (etc.).
 * Multi-state (WA+ID): do not append a state — regional bias handles CDA vs Spokane.
 */
function withPlaceHint(query: string, options: FetchOptions): string {
  if (queryAlreadyHasPlace(query, options)) return query;
  const states = options.states?.length
    ? options.states
    : normalizeServiceArea(options).states;
  if (states?.length === 1) return `${query.trim()}, ${states[0]}`;
  return query.trim();
}

function dedupeKey(parts: AddressParts): string {
  return `${normalizeStreetKey(parts.line1)}|${parts.city.toLowerCase()}|${parts.state}|${parts.zip}`;
}

function dedupePreferNumbered(items: AddressParts[]): AddressParts[] {
  const byStreet = new Map<string, AddressParts>();
  for (const item of items) {
    const streetOnly = normalizeStreetKey(item.line1.replace(/^\d+[A-Za-z]?\s+/, ''));
    const cityState = `${item.city.toLowerCase()}|${item.state}`;
    const key = `${streetOnly}|${cityState}`;
    const existing = byStreet.get(key);
    if (!existing) {
      byStreet.set(key, item);
      continue;
    }
    const existingHasNum = /^\d/.test(existing.line1);
    const itemHasNum = /^\d/.test(item.line1);
    // Prefer numbered Nominatim over Photon street duplicates
    if (!existingHasNum && itemHasNum) {
      byStreet.set(key, item);
    } else if (existingHasNum === itemHasNum && item.source === 'nominatim' && existing.source !== 'nominatim') {
      byStreet.set(key, item);
    } else if (!existing.zip && item.zip) {
      byStreet.set(key, item);
    }
  }

  // Also dedupe exact keys
  const seen = new Set<string>();
  const out: AddressParts[] = [];
  for (const item of byStreet.values()) {
    const k = dedupeKey(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

async function fetchPhoton(query: string, options: FetchOptions): Promise<AddressParts[]> {
  const geo = normalizeServiceArea(options);
  const q = withPlaceHint(query, options);
  const params = new URLSearchParams({
    q,
    limit: String(options.limit ?? 8),
    lang: 'en',
  });

  const country = geo.country.toLowerCase();
  if (country) params.set('countrycode', country);

  // Prefer real addresses over POIs / landmarks
  params.append('layer', 'house');
  params.append('layer', 'street');

  if (geo.bias) {
    params.set('lat', String(geo.bias.lat));
    params.set('lon', String(geo.bias.lon));
    // Wide inland-NW focus; street-name prominence still matters
    params.set('zoom', '9');
    params.set('location_bias_scale', '0.45');
  }
  if (geo.bbox) {
    params.set('bbox', geo.bbox.join(','));
  }

  const res = await fetch(`${PHOTON_URL}?${params}`, {
    headers: { Accept: 'application/json' },
    signal: options.signal,
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: PhotonFeature[] };
  return (data.features ?? [])
    .map(fromPhoton)
    .filter((p): p is AddressParts => p !== null);
}

async function fetchNominatim(
  query: string,
  options: FetchOptions,
  appendPlace: boolean,
): Promise<AddressParts[]> {
  const geo = normalizeServiceArea(options);
  const q = appendPlace ? withPlaceHint(query, options) : query.trim();

  const params = new URLSearchParams({
    q,
    format: 'json',
    addressdetails: '1',
    limit: String(Math.min(options.limit ?? 5, 5)),
    countrycodes: geo.country.toLowerCase() === 'us' ? 'us' : geo.country.toLowerCase(),
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en-US,en',
    },
    signal: options.signal,
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimResult[];
  return (Array.isArray(data) ? data : [])
    .map(fromNominatim)
    .filter((p): p is AddressParts => p !== null);
}

/**
 * Fetch US address suggestions for typeahead (Photon only).
 * Nominatim runs on select via enrichAddressWithZip — keeps typing snappy
 * and respects Nominatim fair-use (see speed.md / docs/maps.md).
 */
export async function fetchUsAddressSuggestions(
  query: string,
  options: FetchOptions = {},
): Promise<AddressParts[]> {
  const q = query.trim();
  if (q.length < 3 || isHouseNumberOnly(q)) return [];

  const geo = normalizeServiceArea(options);
  const house = extractHouseNumber(q);
  const streetTokens = queryStreetTokens(q, { ...options, ...geo });

  try {
    // Expand Rd/St/… so Photon keeps matching OSM full names (e.g. Oak Valley Road, WA)
    const searchQ = expandStreetAbbrevsForSearch(q);
    let merged = await fetchPhoton(searchQ, options);

    merged = merged.filter(
      (p) =>
        matchesCountry(p, geo.country) &&
        matchesHouseNumber(p, house) &&
        sharesStreetToken(p, streetTokens),
    );

    // Hard filter to service states — soft rank alone still surfaces TX when Photon drops WA
    if (geo.states?.length) {
      const inMarket = merged.filter((p) => p.state && geo.states!.includes(p.state));
      if (inMarket.length) merged = inMarket;
    }

    merged = merged.map((p) => applyTypedHouseNumber(p, house));

    merged.sort(
      (a, b) => preferLocalRank(a, geo, streetTokens) - preferLocalRank(b, geo, streetTokens),
    );

    merged = dedupePreferNumbered(merged);
    const top = merged.slice(0, options.limit ?? 8);
    return await applyPostalCities(top);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return [];
    return [];
  }
}

/**
 * Enrich a selected address with ZIP via Nominatim when missing,
 * then resolve postal city from ZIP when OSM only has county.
 */
export async function enrichAddressWithZip(
  parts: AddressParts,
  options: FetchOptions = {},
): Promise<AddressParts> {
  let result = parts;

  if (!result.zip) {
    const q = [parts.line1, parts.city, parts.state, parts.country || 'US']
      .filter(Boolean)
      .join(', ');

    try {
      const results = await fetchNominatim(q, options, false);
      const match =
        results.find(
          (r) =>
            normalizeStreetKey(r.line1) === normalizeStreetKey(parts.line1) &&
            (!parts.city || r.city.toLowerCase() === parts.city.toLowerCase()) &&
            (!parts.state || r.state === parts.state),
        ) ?? results.find((r) => r.zip);

      if (match?.zip) {
        result = {
          ...parts,
          zip: match.zip,
          city: parts.city || match.city,
          state: parts.state || match.state,
          source: 'nominatim',
          display: parts.display,
        };
      }
    } catch {
      // fail open
    }
  }

  return applyPostalCity(result);
}
