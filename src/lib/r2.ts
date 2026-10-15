// Resolves image paths against PUBLIC_R2_PUBLIC_BASE_URL and PUBLIC_R2_SITE_SLUG.

import client from "../content/client.json";

const DEFAULT_R2_BASE = "https://media.stokeleads.com";
const R2_BASE =
  (import.meta.env.PUBLIC_R2_PUBLIC_BASE_URL as string | undefined) || DEFAULT_R2_BASE;
const R2_FOLDER =
  (import.meta.env.PUBLIC_R2_SITE_SLUG as string | undefined) || client.identity.slug;

/**
 * Full URL for a media path.
 * Absolute http(s) URLs and site-root paths (starting with /) are returned as-is.
 * Any other path is prefixed with the public R2 base and site slug.
 */
export function r2img(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return path;

  const folder = R2_FOLDER.replace(/^\/+|\/+$/g, "");
  const normalizedPath = path.replace(/^\/+/, "");
  const base = R2_BASE.replace(/\/$/, "");
  const basePath = new URL(base).pathname.replace(/^\/+|\/+$/g, "");
  const folderPrefix = basePath.endsWith(folder) ? "" : `/${folder}`;

  return `${base}${folderPrefix}/${normalizedPath}`;
}

export function r2srcset(path: string, widths: number[] = [640, 1024, 1600]): string {
  return widths.map((w) => `${r2img(path)}?width=${w} ${w}w`).join(", ");
}
