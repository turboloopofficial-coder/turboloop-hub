/**
 * downloadFile — fetch-then-blob download utility.
 *
 * WHY THIS EXISTS
 * ───────────────
 * Chrome (desktop and Android) ignores the `download` attribute on <a> tags
 * when the href is cross-origin. R2 (pub-*.r2.dev) is cross-origin to
 * turboloop.tech, so a plain `<a href="R2_URL" download>` just navigates to
 * the file instead of saving it.
 *
 * The correct approach:
 *   1. fetch() the file — R2 has CORS configured for turboloop.tech, so this works.
 *   2. Convert the response to a Blob.
 *   3. Create a same-origin blob:// URL via URL.createObjectURL().
 *   4. Programmatically click an <a download> pointing at the blob URL.
 *      Since blob:// is same-origin, Chrome honours the `download` attribute
 *      and saves the file to the gallery/downloads folder.
 *   5. Revoke the object URL to free memory.
 *
 * FALLBACK
 * ────────
 * If fetch fails (network error, CORS misconfiguration), we fall back to the
 * same-origin /api/download proxy which streams the file with
 * Content-Disposition: attachment. This is slower (~5s cold) but reliable.
 *
 * USAGE
 *   import { downloadFile } from "@lib/downloadFile";
 *   await downloadFile(url, filename);
 */

const PROXY_BASE = "/api/download";

/**
 * Download a file to the user's device.
 *
 * @param url      - Direct URL to the file (e.g. R2 public URL)
 * @param filename - Desired filename for the saved file
 * @returns        - "blob" | "proxy" | "open" depending on which path succeeded
 */
export async function downloadFile(
  url: string,
  filename: string
): Promise<"blob" | "proxy" | "open"> {
  // ── Path 1: fetch → blob → same-origin object URL ──────────────────────
  // Works on Android Chrome, iOS Safari, desktop Chrome/Firefox.
  // Requires CORS headers on the remote resource (R2 has these configured).
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (res.ok) {
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      // Revoke after a short delay to ensure the download has started
      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        if (a.parentNode) document.body.removeChild(a);
      }, 1000);
      return "blob";
    }
  } catch {
    // CORS error or network failure — fall through to proxy
  }

  // ── Path 2: same-origin proxy (/api/download) ──────────────────────────
  // Slower (5s cold, 2.5s cached) but works when CORS is unavailable.
  // The proxy streams the file with Content-Disposition: attachment.
  try {
    const proxyUrl = `${PROXY_BASE}?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = proxyUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
    }, 1000);
    return "proxy";
  } catch {
    // Even the proxy failed — last resort: open in new tab
  }

  // ── Path 3: open in new tab (last resort) ──────────────────────────────
  window.open(url, "_blank", "noopener,noreferrer");
  return "open";
}
