/**
 * Stoke Leads field-upload portal for Faber Roof.
 * Replace TOKEN with the real client token when Mauricio sends the link.
 * /photos 302-redirects here (see public/_redirects, rewritten at build).
 */
export const PHOTO_UPLOAD_URL = "https://upload.stokeleads.com/c/TOKEN";

export function cloudflareRedirects() {
  return [
    "/service-areas /areas 301",
    "/services/concrete /services/commercial-flat-roofing 301",
    `/photos ${PHOTO_UPLOAD_URL} 302`,
    "",
  ].join("\n");
}
