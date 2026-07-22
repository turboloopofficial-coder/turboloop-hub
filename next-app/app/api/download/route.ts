// /api/download — cross-origin download proxy.
//
// The HTML `download` attribute only triggers a "save as" dialog when
// the URL is same-origin. R2 URLs are cross-origin to next-app, so a
// direct `<a href="<r2-url>" download>` ends up navigating to the file
// and trying to play it inline. To force an actual download, we proxy
// the request through this route and respond with
// `Content-Disposition: attachment; filename="<slug>.mp4"`.
//
// Usage from the frontend:
//   <a href="/api/download?url=<R2-URL>&filename=v01-foo.mp4" download>
//     Download
//   </a>
//
// Security: we only accept URLs from the allowed R2 host. Without that
// allowlist, this endpoint would be a generic open redirect / download
// proxy that anyone could weaponise.
//
// Bandwidth: every download passes through Vercel's edge function.
// For typical film files (~50-200MB), this adds a single edge-network
// hop. Acceptable for a community-scale catalogue; would need rethinking
// at TikTok-scale throughput.
//
// Implementation note: streaming the response body straight through
// the fetch's Response.body keeps memory bounded — we don't buffer the
// MP4 in the function. Works on Edge runtime.

export const runtime = "edge";

const ALLOWED_HOST = "pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

const ALLOWED_EXTS = new Set(["mp4", "png", "jpg", "jpeg", "webp", "gif", "avif", "svg"]);

function safeFilename(input: string | null): string {
  if (!input) return "turboloop-download.mp4";
  // Allow letters/numbers/dot/dash/underscore. Strip everything else.
  // Cap length at 120 chars.
  const cleaned = input.replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 120);
  // Preserve the original extension if it's in the allowed list;
  // otherwise default to .mp4 (for video files with no extension).
  const ext = cleaned.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTS.has(ext) ? cleaned : `${cleaned}.mp4`;
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const target = url.searchParams.get("url");
  const filename = safeFilename(url.searchParams.get("filename"));

  if (!target) {
    return new Response("Missing ?url= parameter", { status: 400 });
  }

  // Validate the target URL is from our R2 bucket. Reject anything else.
  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response("Invalid url parameter", { status: 400 });
  }
  if (parsed.host !== ALLOWED_HOST) {
    return new Response(`Host not allowed: ${parsed.host}`, { status: 403 });
  }
  // Only allow http(s) — block file://, data:, javascript:, etc.
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return new Response("Protocol not allowed", { status: 403 });
  }

  // Fetch from R2. Stream the response back with download headers.
  const upstream = await fetch(parsed.toString(), {
    method: "GET",
    // Don't forward cookies / credentials — this is a public asset
    // proxy. Caching is up to R2's response headers; we add a 24h
    // browser cache so reloads after partial download don't re-fetch.
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(`Upstream fetch failed (${upstream.status})`, {
      status: 502,
    });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") || "video/mp4"
  );
  // The whole point of this proxy — force-download instead of inline play
  headers.set(
    "Content-Disposition",
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  );
  // Preserve content-length when R2 sets it so the browser shows a
  // progress bar with a known total.
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);
  // Browser cache: 24h, public. Cross-origin proxied MP4s don't change
  // very often. CDN caches above us (Vercel edge) also pick this up.
  headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400");

  return new Response(upstream.body, {
    status: 200,
    headers,
  });
}
