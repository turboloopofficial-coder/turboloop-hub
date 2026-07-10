// /api/og-zoom?lang=hi&tier=T30
//
// Serves cinematic Zoom reminder banners from R2 CDN.
// 24 pre-generated PNGs (4 tiers × 2 langs × 3 variants A/B/C).
// Variant rotates daily (day-of-year % 3) so users see a fresh
// banner each day without any runtime image generation.
//
// R2 path pattern: brand/zoom/{lang}-{tier}-{variant}.png
// e.g. brand/zoom/hi-T30-B.png

export const runtime = "edge";

const R2_PUBLIC_URL =
  "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

const VALID_LANGS = new Set(["en", "hi", "af"]);
const VALID_TIERS = new Set(["T60", "T30", "T15", "LIVE", "T0"]);
const VARIANTS = ["A", "B", "C"] as const;

// T0 is an alias for LIVE
function normaliseTier(raw: string): string {
  const t = raw.toUpperCase();
  return t === "T0" ? "LIVE" : t;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLang = (url.searchParams.get("lang") || "hi").toLowerCase();
  const rawTier = url.searchParams.get("tier") || "T30";

  // "af" uses "en" banner until af-specific R2 images are generated
  const lang = VALID_LANGS.has(rawLang) ? (rawLang === "af" ? "en" : rawLang) : "hi";
  const tier = VALID_TIERS.has(rawTier.toUpperCase())
    ? normaliseTier(rawTier)
    : "T30";

  // Rotate variant A/B/C daily based on UTC day-of-year
  const now = new Date();
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86_400_000
  );
  const variant = VARIANTS[dayOfYear % 3];

  const imageUrl = `${R2_PUBLIC_URL}/brand/zoom/${lang}-${tier}-${variant}.png`;

  // Fetch the image from R2 and stream it back with correct headers
  const r2Response = await fetch(imageUrl);

  if (!r2Response.ok) {
    // Fallback: try variant A if the computed variant is missing
    const fallbackUrl = `${R2_PUBLIC_URL}/brand/zoom/${lang}-${tier}-A.png`;
    const fallback = await fetch(fallbackUrl);
    if (!fallback.ok) {
      return new Response("Banner not found", { status: 404 });
    }
    return new Response(fallback.body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Banner-Variant": "A-fallback",
        "X-Banner-Key": `${lang}-${tier}-A`,
      },
    });
  }

  return new Response(r2Response.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Banner-Variant": variant,
      "X-Banner-Key": `${lang}-${tier}-${variant}`,
    },
  });
}
