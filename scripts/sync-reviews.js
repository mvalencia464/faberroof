/**
 * DataForSEO Google Reviews sync.
 *
 * Credentials:
 * - DATAFORSEO_LOGIN
 * - DATAFORSEO_PASSWORD
 *
 * Config:
 * - scripts/reviews-clients.json
 *
 * Debug: SYNC_REVIEWS_DEBUG=1 npm run sync-reviews
 * Strict (no stale fallback): SYNC_REVIEWS_STRICT=1 npm run sync-reviews
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const API_REVIEWS = "https://api.dataforseo.com/v3/business_data/google/reviews";
const DEBUG_FILE = path.join(__dirname, ".debug-last-sync.json");

const envLocalPath = path.join(ROOT, ".env.local");
const envPath = path.join(ROOT, ".env");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const DEBUG =
  process.env.SYNC_REVIEWS_DEBUG === "1" ||
  process.env.SYNC_REVIEWS_DEBUG === "true" ||
  process.env.DEBUG === "sync-reviews";

function debug(...args) {
  if (DEBUG) console.log("[sync-reviews]", ...args);
}

function pollSettings() {
  const interval = Number(process.env.DATAFORSEO_POLL_INTERVAL_MS) || 5000;
  const maxAttempts = Number(process.env.DATAFORSEO_POLL_MAX_ATTEMPTS) || 55;
  return {
    POLL_INTERVAL_MS: Number.isFinite(interval) && interval >= 1000 ? interval : 5000,
    POLL_MAX_ATTEMPTS: Number.isFinite(maxAttempts) && maxAttempts >= 5 ? maxAttempts : 55,
  };
}

const POLL_TIMEOUT_MESSAGE =
  "Task did not complete in time. Try again later or check the task in DataForSEO dashboard.";

const IN_PROGRESS_STATUS = new Set([20100, 40601, 40602]);

function getAuthHeader() {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    console.error("Missing DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD. Set them in .env.local or .env");
    process.exit(1);
  }
  return `Basic ${Buffer.from(`${login}:${password}`, "utf8").toString("base64")}`;
}

function maskLogin(login) {
  if (!login || login.length < 3) return "(set)";
  return `${login.slice(0, 2)}***${login.slice(-1)}`;
}

function writeDebugSnapshot(snapshot) {
  try {
    fs.writeFileSync(DEBUG_FILE, JSON.stringify(snapshot, null, 2), "utf8");
    debug(`Wrote debug snapshot to ${DEBUG_FILE}`);
  } catch (e) {
    console.warn("[sync-reviews] Could not write debug file:", e.message);
  }
}

function summarizeTask(task) {
  if (!task) return null;
  const result = task.result;
  const first = Array.isArray(result) && result.length > 0 ? result[0] : null;
  const items = first?.items;
  return {
    id: task.id,
    status_code: task.status_code,
    status_message: task.status_message,
    cost: task.cost,
    result_count: task.result_count,
    items_count: Array.isArray(items) ? items.length : 0,
    has_result_array: Array.isArray(result) && result.length > 0,
  };
}

function summarizeApiBody(label, body) {
  const task = body?.tasks?.[0];
  return {
    label,
    time: body?.time,
    cost: body?.cost,
    status_code: body?.status_code,
    status_message: body?.status_message,
    tasks_count: body?.tasks_count,
    tasks_error: body?.tasks_error,
    task: summarizeTask(task),
  };
}

function loadConfig() {
  const configPath = path.join(__dirname, "reviews-clients.json");
  const raw = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(raw);
  if (!Array.isArray(config.clients) || config.clients.length === 0) {
    console.error('reviews-clients.json must have a non-empty "clients" array.');
    process.exit(1);
  }
  return config;
}

function selectClient(config) {
  const slug = process.argv[2] || process.env.CLIENT_SLUG || config.defaultSlug;
  const client = config.clients.find((c) => c.slug === slug) || config.clients[0];
  if (slug && client.slug !== slug) {
    console.warn(`Client "${slug}" not found, using "${client.slug}"`);
  }
  return client;
}

function safeFilename(reviewId) {
  if (!reviewId || typeof reviewId !== "string") return "unknown";
  return reviewId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) || "unknown";
}

function formatYearMonth(timestamp) {
  if (!timestamp) return "";
  const raw = String(timestamp).trim().replace(/\s*\+00:00\s*$/, "").trim();
  if (!raw) return "";
  let d = new Date(raw);
  if (Number.isNaN(d.getTime())) d = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return raw.slice(0, 7);
  return d.toLocaleString("en-US", { year: "numeric", month: "long" });
}

/**
 * Google CID for DataForSEO is the decimal `ludocid`.
 *
 * Valid in a URL: `https://www.google.com/maps?cid=14552235127258022221`
 *
 * Invalid: converting `!1s0xFEATURE:0xHEX` from a /maps/place/ data= blob.
 * That pair is a feature id, not the reviews CID. Do not BigInt-convert it.
 */
function cidFromGoogleMapsUrl(url) {
  if (!url || typeof url !== "string") return null;
  const decMatch = url.match(/[?&]cid=(\d{6,})/i);
  return decMatch ? decMatch[1] : null;
}

function resolveListingIdentity(client) {
  const fromConfig = client.cid ? String(client.cid) : null;
  const fromUrl = cidFromGoogleMapsUrl(client.profileUrl);
  const placeBlob = client.profileUrl && /!1s0x[0-9a-f]+:0x[0-9a-f]+/i.test(client.profileUrl);

  if (!fromConfig && placeBlob && !fromUrl) {
    console.warn(
      "Maps place URL has !1s0x…:0x… (feature id), not a reviews CID. Do not convert that hex. Set cid from maps?cid=DECIMAL or DataForSEO Maps Search. See README.md."
    );
  }

  if (fromConfig && fromUrl && fromConfig !== fromUrl) {
    console.warn(
      `profileUrl ?cid=${fromUrl} differs from config cid=${fromConfig}; using config cid.`
    );
  }

  const cid = fromConfig || fromUrl;
  if (cid) return { cid };
  if (client.place_id) return { place_id: String(client.place_id) };
  if (client.keyword) return { keyword: client.keyword };
  throw new Error(
    `Client "${client.slug || client.name}" needs cid (decimal string), place_id, keyword, or a profileUrl with ?cid=`
  );
}

function buildTaskPostBody(client) {
  const location =
    client.location_code != null
      ? { location_code: client.location_code }
      : client.location_name
        ? { location_name: client.location_name }
        : {};

  const identity = resolveListingIdentity(client);

  return [
    {
      ...identity,
      language_code: client.language_code || "en",
      depth: client.depth ?? 10,
      sort_by: client.sort_by || "highest_rating",
      ...location,
    },
  ];
}

/** Optional pin: expectedRating / expectedReviewCount (±tolerance) on sync result. */
function assertExpectedListing(result0, client) {
  const expectedRating = client.expectedRating;
  const expectedCount = client.expectedReviewCount;
  if (expectedRating == null && expectedCount == null) return;

  const rating = result0?.rating?.value;
  const count = result0?.reviews_count ?? result0?.rating?.votes_count;
  const title = result0?.title || "(unknown)";

  if (expectedRating != null) {
    const tol = client.expectedRatingTolerance ?? 0.15;
    if (typeof rating !== "number" || Math.abs(rating - expectedRating) > tol) {
      throw new Error(
        `Wrong Google listing for ${client.name}: got rating ${rating} for "${title}", expected ~${expectedRating}. Check cid/place_id.`
      );
    }
  }

  if (expectedCount != null) {
    const tol = client.expectedReviewCountTolerance ?? 5;
    if (typeof count !== "number" || Math.abs(count - expectedCount) > tol) {
      throw new Error(
        `Wrong Google listing for ${client.name}: got ${count} reviews for "${title}", expected ~${expectedCount}. Check cid/place_id.`
      );
    }
  }

  console.log(
    `Listing check OK: "${title}" · rating=${rating} · reviews_count=${count}`
  );
}

async function taskPost(client) {
  const body = buildTaskPostBody(client);
  console.log("task_post body:", JSON.stringify(body));

  const res = await fetch(`${API_REVIEWS}/task_post`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`DataForSEO task_post non-JSON (${res.status}): ${text.slice(0, 500)}`);
  }

  const summary = summarizeApiBody("task_post", data);
  console.log(
    `task_post: HTTP ${res.status}, api status ${summary.status_code} (${summary.status_message}), task ${summary.task?.status_code} (${summary.task?.status_message}), id=${summary.task?.id}, cost=${summary.cost}`
  );
  debug("task_post full summary:", JSON.stringify(summary, null, 2));

  if (!res.ok) {
    writeDebugSnapshot({ phase: "task_post", httpStatus: res.status, body: data });
    throw new Error(`DataForSEO task_post error ${res.status}: ${summary.status_message}`);
  }

  const task = data?.tasks?.[0];
  if (!task?.id) {
    writeDebugSnapshot({ phase: "task_post", body: data });
    throw new Error(`No task id in task_post response: ${summary.task?.status_message || summary.status_message}`);
  }

  if (task.status_code >= 40000 && !IN_PROGRESS_STATUS.has(task.status_code)) {
    writeDebugSnapshot({ phase: "task_post", body: data });
    throw new Error(`task_post failed: ${task.status_code} ${task.status_message}`);
  }

  return { taskId: task.id, postResponse: data };
}

async function taskGet(taskId) {
  const res = await fetch(`${API_REVIEWS}/task_get/${taskId}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`DataForSEO task_get non-JSON (${res.status}): ${text.slice(0, 500)}`);
  }

  if (!res.ok) {
    writeDebugSnapshot({ phase: "task_get", taskId, httpStatus: res.status, body: data });
    throw new Error(`DataForSEO task_get error ${res.status}`);
  }

  return data;
}

async function tasksReady() {
  const res = await fetch(`${API_REVIEWS}/tasks_ready`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

function isReadyBody(body) {
  const task = body?.tasks?.[0];
  const result = task?.result;
  const status = task?.status_code;
  if (status === 20000 && Array.isArray(result) && result.length > 0) {
    return Array.isArray(result[0]?.items);
  }
  return false;
}

function shouldLogPoll(attempt, maxAttempts) {
  if (DEBUG) return true;
  return attempt === 0 || attempt === maxAttempts - 1 || (attempt + 1) % 10 === 0;
}

async function pollUntilReady(taskId) {
  const { POLL_INTERVAL_MS, POLL_MAX_ATTEMPTS } = pollSettings();
  console.log(
    `Polling every ${POLL_INTERVAL_MS}ms, up to ${POLL_MAX_ATTEMPTS} attempts (~${Math.round((POLL_INTERVAL_MS * POLL_MAX_ATTEMPTS) / 60000)} min max)`
  );

  let lastBody = null;

  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    const body = await taskGet(taskId);
    lastBody = body;
    const task = body?.tasks?.[0];
    const status = task?.status_code;
    const summary = summarizeTask(task);

    if (shouldLogPoll(attempt, POLL_MAX_ATTEMPTS)) {
      console.log(
        `  poll ${attempt + 1}/${POLL_MAX_ATTEMPTS}: task status ${summary.status_code} (${summary.status_message}), items=${summary.items_count}, result_count=${summary.result_count}`
      );
    }
    debug("poll detail:", JSON.stringify(summarizeApiBody(`poll-${attempt + 1}`, body), null, 2));

    if (isReadyBody(body)) return body;

    if (status === 20000 && summary.items_count === 0) {
      console.warn(
        "  task status 20000 but no review items yet — business may not match keyword/location, or reviews still loading"
      );
    }

    if (status >= 40000 && !IN_PROGRESS_STATUS.has(status)) {
      writeDebugSnapshot({ phase: "poll_error", taskId, attempt: attempt + 1, body });
      throw new Error(`Task failed: ${status} ${task?.status_message || "unknown"}`);
    }

    if (attempt < POLL_MAX_ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  const ready = await tasksReady();
  const readyIds =
    ready?.tasks?.[0]?.result?.map((r) => r?.id).filter(Boolean) ??
    ready?.tasks?.flatMap((t) => t?.result?.map((r) => r?.id) ?? []) ??
    [];
  const snapshot = {
    phase: "poll_timeout",
    taskId,
    poll: pollSettings(),
    last: summarizeApiBody("last_poll", lastBody),
    tasks_ready_count: readyIds.length,
    task_in_tasks_ready: readyIds.includes(taskId),
    tasks_ready_sample: readyIds.slice(0, 5),
  };
  writeDebugSnapshot(snapshot);
  console.error("Poll timed out. Debug snapshot:", JSON.stringify(snapshot, null, 2));
  if (readyIds.includes(taskId)) {
    console.error(
      "Task appears in tasks_ready but task_get never returned items — try task_get again or collect via tasks_ready flow."
    );
  }

  throw new Error(POLL_TIMEOUT_MESSAGE);
}

function extractItems(apiBody) {
  const result = apiBody?.tasks?.[0]?.result;
  if (!Array.isArray(result) || result.length === 0) return [];
  const items = result[0]?.items;
  return Array.isArray(items) ? items : [];
}

async function downloadAsset(url, filepath) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, buf);
  return true;
}

function mapItemToReview(item, avatarFilename, projectImageFilenames = []) {
  const rating = item?.rating?.value;
  const numRating = typeof rating === "number" ? Math.round(rating) : 5;
  return {
    date: formatYearMonth(item?.timestamp ?? ""),
    text: (item?.review_text ?? "").trim(),
    author: (item?.profile_name ?? "").trim() || "Google User",
    rating: numRating,
    source: "Google",
    avatarUrl: avatarFilename || "",
    images: Array.isArray(projectImageFilenames) ? projectImageFilenames : [],
  };
}

function staleFallbackReason() {
  if (process.env.SYNC_REVIEWS_ALLOW_STALE_ON_TIMEOUT === "1") return "SYNC_REVIEWS_ALLOW_STALE_ON_TIMEOUT";
  if (process.env.CF_PAGES === "1") return "CF_PAGES=1 (Cloudflare Pages build)";
  const existingOut = path.join(ROOT, "src/data/google-reviews.json");
  if (fs.existsSync(existingOut)) return "existing src/data/google-reviews.json";
  return null;
}

function shouldAllowStaleOnPollTimeout(err) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg !== POLL_TIMEOUT_MESSAGE) return false;
  if (process.env.SYNC_REVIEWS_STRICT === "1" || process.env.SYNC_REVIEWS_STRICT === "true") {
    return false;
  }
  return Boolean(staleFallbackReason());
}

function logStartup() {
  const { POLL_INTERVAL_MS, POLL_MAX_ATTEMPTS } = pollSettings();
  console.log("--- sync-reviews ---");
  console.log(`DATAFORSEO_LOGIN: ${maskLogin(process.env.DATAFORSEO_LOGIN)}`);
  console.log(`DEBUG: ${DEBUG}, STRICT: ${process.env.SYNC_REVIEWS_STRICT === "1"}`);
  console.log(`CF_PAGES: ${process.env.CF_PAGES ?? "(unset)"}, SKIP_SYNC_REVIEWS: ${process.env.SKIP_SYNC_REVIEWS ?? "(unset)"}`);
  console.log(`Poll: ${POLL_MAX_ATTEMPTS} x ${POLL_INTERVAL_MS}ms`);
  const stale = staleFallbackReason();
  if (stale && process.env.SYNC_REVIEWS_STRICT !== "1") {
    console.log(`Stale fallback on timeout: enabled (${stale})`);
  }
}

async function main() {
  if (process.env.SKIP_SYNC_REVIEWS === "1") {
    console.log("SKIP_SYNC_REVIEWS set - skipping DataForSEO sync.");
    return;
  }

  logStartup();

  const config = loadConfig();
  const client = selectClient(config);
  console.log(`Client: ${client.name} (${client.slug})`);
  debug("client config:", JSON.stringify(client, null, 2));

  const { taskId, postResponse } = await taskPost(client);
  writeDebugSnapshot({ phase: "task_post_ok", taskId, post: summarizeApiBody("task_post", postResponse) });
  console.log(`Task id: ${taskId}. Waiting for results...`);

  let body;
  try {
    body = await pollUntilReady(taskId);
  } catch (err) {
    const reason = staleFallbackReason();
    if (shouldAllowStaleOnPollTimeout(err)) {
      console.warn(
        `Poll timed out; continuing build with existing reviews (${reason}). Set SYNC_REVIEWS_STRICT=1 to fail instead. See ${DEBUG_FILE}`
      );
      return;
    }
    throw err;
  }

  const result0 = body?.tasks?.[0]?.result?.[0];
  console.log(
    `Listing: "${result0?.title ?? "?"}" rating=${result0?.rating?.value ?? "?"} reviews_count=${result0?.reviews_count ?? "?"} cid=${result0?.cid ?? "?"}`
  );
  assertExpectedListing(result0, client);

  const items = extractItems(body);
  console.log(`Fetched ${items.length} review items from DataForSEO`);
  writeDebugSnapshot({
    phase: "success",
    taskId,
    items_count: items.length,
    listing: {
      title: result0?.title,
      rating: result0?.rating?.value,
      reviews_count: result0?.reviews_count,
      cid: result0?.cid,
      place_id: result0?.place_id,
    },
    task: summarizeApiBody("final", body),
  });

  const avatarsDir = path.join(ROOT, client.outputAvatarsDir || "src/assets/avatars");
  const reviewImagesDir = path.join(ROOT, client.outputReviewImagesDir || "src/assets/review-images");
  fs.mkdirSync(avatarsDir, { recursive: true });
  fs.mkdirSync(reviewImagesDir, { recursive: true });

  const rawReviews = [];
  const MAX_PROJECT_IMAGES_PER_REVIEW = 6;

  for (const item of items) {
    const reviewId = item?.review_id;
    const imageUrl = item?.profile_image_url;
    let avatarFilename = "";

    if (imageUrl && reviewId) {
      const base = safeFilename(reviewId);
      avatarFilename = `${base}.jpg`;
      const filepath = path.join(avatarsDir, avatarFilename);
      try {
        const ok = await downloadAsset(imageUrl, filepath);
        if (!ok) avatarFilename = "";
      } catch {
        avatarFilename = "";
      }
    }

    const projectImageFilenames = [];
    const reviewImages = item?.images;
    if (Array.isArray(reviewImages) && reviewImages.length > 0 && reviewId) {
      const base = safeFilename(reviewId);
      const toDownload = reviewImages.slice(0, MAX_PROJECT_IMAGES_PER_REVIEW);
      for (let i = 0; i < toDownload.length; i++) {
        const imgUrl = toDownload[i]?.image_url;
        if (!imgUrl) continue;
        const filename = `${base}_${i}.jpg`;
        const filepath = path.join(reviewImagesDir, filename);
        try {
          const ok = await downloadAsset(imgUrl, filepath);
          if (ok) projectImageFilenames.push(filename);
        } catch {
          // ignore individual image download failures
        }
      }
    }

    rawReviews.push(mapItemToReview(item, avatarFilename, projectImageFilenames));
  }

  const outPath = path.join(ROOT, client.outputJson || "src/data/google-reviews.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const payload = {
    businessName: result0?.title || client.name,
    rating: result0?.rating?.value ?? null,
    reviewsCount: result0?.reviews_count ?? null,
    cid: result0?.cid ? String(result0.cid) : client.cid || null,
    placeId: result0?.place_id || client.place_id || null,
    profileUrl: client.profileUrl || null,
    syncedAt: new Date().toISOString(),
    rawReviews,
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${rawReviews.length} reviews to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
