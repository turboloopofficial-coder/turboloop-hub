// /api/creatives/download-kit — fast zip generator for a category kit.
//
// GET ?category=lifestyle
//
// Strategy: fetch ALL images in parallel (no concurrency cap — R2 handles it),
// then zip them in-memory with fflate at store level (level=0, no compression
// since PNGs are already compressed). This avoids archiver's stream-serialization
// bottleneck and completes in ~5-10s for 50 images.
//
// Memory: 50 × ~5MB = ~250MB peak. Well within Vercel Pro's 1GB limit.
// Duration: ~5-10s for 50 images. Within Vercel Pro's 60s limit.
// For 500-image categories (hindi-new), we cap at 100 images per kit.
//
// Runtime: nodejs (NOT edge) — requires Node.js Buffer.

import { NextRequest } from "next/server";
import { zipSync, strToU8 } from "fflate";
import { ALL_UNIFIED_CREATIVES } from "@lib/unifiedCreativesData";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGES = 100; // safety cap for very large categories

/** Derive a safe filename from a URL */
function urlToFilename(url: string, idx: number): string {
  try {
    const path = new URL(url).pathname;
    const base = path.split("/").pop() ?? `banner-${idx}.png`;
    return base.replace(/[^a-zA-Z0-9._-]/g, "_");
  } catch {
    return `banner-${idx}.png`;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category")?.trim();

  if (!category) {
    return new Response(JSON.stringify({ error: "Missing category param" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const allItems = ALL_UNIFIED_CREATIVES.filter(i => i.categoryId === category);

  if (allItems.length === 0) {
    return new Response(JSON.stringify({ error: "Category not found or empty" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Cap at MAX_IMAGES for very large categories
  const items = allItems.slice(0, MAX_IMAGES);
  const isCapped = allItems.length > MAX_IMAGES;

  const categoryLabel = items[0]?.categoryLabel ?? category;
  const zipFilename = `turboloop-${category}-kit.zip`;

  // ── Fetch all images in parallel ─────────────────────────────────────────

  const fetchResults = await Promise.allSettled(
    items.map(async (item, idx) => {
      const res = await fetch(item.url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      const fname = urlToFilename(item.url, idx);
      const key = `${String(idx + 1).padStart(4, "0")}_${fname}`;
      return { key, data: new Uint8Array(buf) };
    })
  );

  // ── Build zip in memory with fflate ──────────────────────────────────────

  const zipFiles: Record<string, [Uint8Array, { level: 0 }]> = {};

  // README
  const readmeLines = [
    `TurboLoop — ${categoryLabel} Marketing Kit`,
    `Downloaded: ${new Date().toISOString().slice(0, 10)}`,
    `Total banners: ${items.length}${isCapped ? ` (first ${MAX_IMAGES} of ${allItems.length})` : ""}`,
    ``,
    `Free to share on Telegram, WhatsApp, Twitter/X, and any social platform.`,
    `No attribution required.`,
    ``,
    `More banners: turboloop.tech/creatives/${category}`,
    `turboloop.tech`,
  ];
  zipFiles["README.txt"] = [strToU8(readmeLines.join("\n")), { level: 0 }];

  let successCount = 0;
  for (const result of fetchResults) {
    if (result.status === "fulfilled") {
      zipFiles[result.value.key] = [result.value.data, { level: 0 }];
      successCount++;
    }
  }

  if (successCount === 0) {
    return new Response(JSON.stringify({ error: "All image fetches failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // zipSync is synchronous but very fast at level=0 (just stores, no compression)
  const zipBuffer = zipSync(zipFiles);

  return new Response(zipBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFilename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Images-Included": String(successCount),
    },
  });
}
