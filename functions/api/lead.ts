/**
 * POST /api/lead — Cloudflare Pages Function
 *
 * Accepts marketing form posts, then forwards to GoHighLevel when configured.
 *
 * Secrets / vars (Cloudflare Pages → Settings → Variables and Secrets):
 *   GHL_WEBHOOK_URL     — preferred: inbound webhook URL from a GHL workflow
 *   GHL_PRIVATE_TOKEN   — optional Private Integration token (API path)
 *   GHL_LOCATION_ID     — required with GHL_PRIVATE_TOKEN
 *
 * Browser forms POST here; we 303 redirect to /thanks on success.
 */

interface Env {
  GHL_WEBHOOK_URL?: string;
  GHL_PRIVATE_TOKEN?: string;
  GHL_LOCATION_ID?: string;
  LEAD_SOURCE?: string;
}

type LeadFields = Record<string, string>;

const THANKS_PATH = '/thanks/';
const GHL_API = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * Only return JSON for explicit API clients.
 * Browser form navigations often list application/json in Accept — those must redirect.
 */
function wantsJson(request: Request): boolean {
  if (request.headers.get('Sec-Fetch-Mode') === 'navigate') return false;
  if (request.headers.get('Sec-Fetch-Dest') === 'document') return false;

  const contentType = request.headers.get('Content-Type') ?? '';
  const isBrowserForm =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data');
  if (isBrowserForm) {
    const accept = (request.headers.get('Accept') ?? '').trim();
    return accept === 'application/json' || accept.startsWith('application/json;');
  }

  const accept = request.headers.get('Accept') ?? '';
  return accept.includes('application/json') && !accept.includes('text/html');
}

function thanksUrl(request: Request, error = false): string {
  const url = new URL(THANKS_PATH, request.url);
  if (error) url.searchParams.set('error', '1');
  return url.toString();
}

/** 303 + HTML fallback so form posts never strand on /api/lead. */
function redirectThanks(request: Request, error = false): Response {
  const url = thanksUrl(request, error);
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${url}"><title>Redirecting…</title></head><body><p>Redirecting — <a href="${url}">continue</a>.</p><script>location.replace(${JSON.stringify(url)});</script></body></html>`,
    {
      status: 303,
      headers: {
        Location: url,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
}

function success(request: Request, payload: Record<string, unknown>): Response {
  if (wantsJson(request)) return json({ ok: true, ...payload });
  return redirectThanks(request);
}

function failure(request: Request, message: string, status = 400): Response {
  if (wantsJson(request)) return json({ ok: false, error: message }, status);
  return redirectThanks(request, true);
}

async function readFields(request: Request): Promise<LeadFields> {
  const contentType = request.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    const body = (await request.json()) as Record<string, unknown>;
    const fields: LeadFields = {};
    for (const [key, value] of Object.entries(body)) {
      if (value == null) continue;
      fields[key] = String(value).trim();
    }
    return fields;
  }

  const form = await request.formData();
  const fields: LeadFields = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') fields[key] = value.trim();
  }
  return fields;
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (value && value.length > 0) return value;
  }
  return '';
}

function normalizeLead(fields: LeadFields) {
  const firstName = firstNonEmpty(fields.first_name, fields.firstName);
  const lastName = firstNonEmpty(fields.last_name, fields.lastName);
  const fullName = firstNonEmpty(fields.name, [firstName, lastName].filter(Boolean).join(' '));

  let resolvedFirst = firstName;
  let resolvedLast = lastName;
  if (!resolvedFirst && fullName) {
    const parts = fullName.split(/\s+/);
    resolvedFirst = parts[0] ?? '';
    resolvedLast = parts.slice(1).join(' ');
  }

  return {
    formName: firstNonEmpty(fields['form-name'], fields.formName, 'website-lead'),
    firstName: resolvedFirst,
    lastName: resolvedLast,
    name: fullName || [resolvedFirst, resolvedLast].filter(Boolean).join(' '),
    email: firstNonEmpty(fields.email),
    phone: firstNonEmpty(fields.phone),
    address: firstNonEmpty(fields.address),
    city: firstNonEmpty(fields.city),
    state: firstNonEmpty(fields.state),
    zip: firstNonEmpty(fields.zip, fields.postal, fields.postalCode),
    projectType: firstNonEmpty(fields.project_type, fields.projectType),
    roofType: firstNonEmpty(fields.roof_type, fields.roofType),
    timeline: firstNonEmpty(fields.timeline),
    roofAge: firstNonEmpty(fields.roof_age, fields.roofAge),
    message: firstNonEmpty(fields.message, fields.notes),
    consentSms: firstNonEmpty(
      fields.consent_sms,
      fields.consent_project_sms,
      fields.consent_marketing_sms,
    ),
    raw: fields,
  };
}

type NormalizedLead = ReturnType<typeof normalizeLead>;

function validateLead(lead: NormalizedLead): string | null {
  if (!lead.phone && !lead.email) return 'Phone or email is required';
  if (!lead.name && !lead.firstName) return 'Name is required';
  return null;
}

async function forwardWebhook(url: string, lead: NormalizedLead, source: string): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source,
      form: lead.formName,
      firstName: lead.firstName,
      lastName: lead.lastName,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      postalCode: lead.zip,
      projectType: lead.projectType,
      roofType: lead.roofType,
      timeline: lead.timeline,
      roofAge: lead.roofAge,
      message: lead.message,
      tags: ['website-lead', lead.formName],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL webhook failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

async function upsertGhlContact(env: Env, lead: NormalizedLead): Promise<void> {
  const token = env.GHL_PRIVATE_TOKEN;
  const locationId = env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    throw new Error('GHL_PRIVATE_TOKEN and GHL_LOCATION_ID are required for API mode');
  }

  const res = await fetch(`${GHL_API}/contacts/upsert`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      locationId,
      firstName: lead.firstName || undefined,
      lastName: lead.lastName || undefined,
      name: lead.name || undefined,
      email: lead.email || undefined,
      phone: lead.phone || undefined,
      address1: lead.address || undefined,
      city: lead.city || undefined,
      state: lead.state || undefined,
      postalCode: lead.zip || undefined,
      source: `Website · ${lead.formName}`,
      tags: ['website-lead', lead.formName],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL contact upsert failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let fields: LeadFields;
  try {
    fields = await readFields(request);
  } catch {
    return failure(request, 'Invalid form data', 400);
  }

  // Honeypot — bots fill hidden "website" fields
  if (fields.website || fields.company_url) {
    return success(request, { ok: true });
  }

  const lead = normalizeLead(fields);
  const invalid = validateLead(lead);
  if (invalid) return failure(request, invalid, 400);

  console.log(
    JSON.stringify({
      event: 'lead_received',
      form: lead.formName,
      hasEmail: Boolean(lead.email),
      hasPhone: Boolean(lead.phone),
      city: lead.city || undefined,
      projectType: lead.projectType || undefined,
    }),
  );

  try {
    if (env.GHL_WEBHOOK_URL) {
      await forwardWebhook(env.GHL_WEBHOOK_URL, lead, env.LEAD_SOURCE || 'website');
    } else if (env.GHL_PRIVATE_TOKEN && env.GHL_LOCATION_ID) {
      await upsertGhlContact(env, lead);
    } else {
      console.warn(
        JSON.stringify({
          event: 'lead_not_forwarded',
          reason: 'No GHL_WEBHOOK_URL or GHL_PRIVATE_TOKEN+GHL_LOCATION_ID configured',
          form: lead.formName,
        }),
      );
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'lead_forward_failed',
        form: lead.formName,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    );
    return failure(request, 'Unable to submit right now. Please call us.', 502);
  }

  return success(request, { forwarded: Boolean(env.GHL_WEBHOOK_URL || env.GHL_PRIVATE_TOKEN) });
};

export const onRequestGet: PagesFunction = async (context) => {
  const accept = context.request.headers.get('Accept') ?? '';
  if (accept.includes('text/html')) {
    return redirectThanks(context.request);
  }
  return json({ ok: false, error: 'Method not allowed. POST form data to this endpoint.' }, 405);
};

