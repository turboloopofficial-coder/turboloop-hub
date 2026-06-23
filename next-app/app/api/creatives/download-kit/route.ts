// /api/creatives/download-kit — streaming zip generator for a category kit.
//
// GET ?category=lifestyle
//
// Uses archiver's ZipArchive (Node.js streaming zip) to pipe images directly
// into the zip stream as they are fetched from R2. The browser receives bytes
// immediately — the native download progress bar appears within ~1 second.
//
// Key properties:
//   - TRUE STREAMING: first bytes sent to browser before all images are fetched
//   - NO MEMORY CAP: images are piped through, not buffered in memory
//   - WORKS FOR ALL SIZES: handles 500+ image categories (hindi-new etc.)
//
// Runtime: nodejs (NOT edge) — requires Node.js streams.

import { NextRequest } from "next/server";
import { ZipArchive } from "archiver";
import { PassThrough, Readable } from "stream";
import { ALL_UNIFIED_CREATIVES } from "@lib/unifiedCreativesData";

export const runtime = "nodejs";
export const maxDuration = 300;

const CONCURRENCY = 8;

/** Fetch a URL as a Node.js Readable stream */
async function fetchAsNodeStream(url: string): Promise<Readable> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const reader = res.body!.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) this.push(null);
      else this.push(Buffer.from(value));
    },
    destroy(err, cb) {
      reader.cancel().finally(() => cb(err));
    },
  });
}

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

  const items = ALL_UNIFIED_CREATIVES.filter(i => i.categoryId === category);

  if (items.length === 0) {
    return new Response(JSON.stringify({ error: "Category not found or empty" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const categoryLabel = items[0]?.categoryLabel ?? category;
  const zipFilename = `turboloop-${category}-kit.zip`;

  // ── Build streaming zip ──────────────────────────────────────────────────

  const passThrough = new PassThrough();

  const archive = new ZipArchive({ zlib: { level: 0 } }); // store — images already compressed

  archive.on("error", (err: Error) => {
    console.error("[download-kit] archiver error:", err);
    passThrough.destroy(err);
  });

  archive.pipe(passThrough);

  // Add README
  const readme = [
    `TurboLoop — ${categoryLabel} Marketing Kit`,
    `Downloaded: ${new Date().toISOString().slice(0, 10)}`,
    `Total banners: ${items.length}`,
    ``,
    `Free to share on Telegram, WhatsApp, Twitter/X, and any social platform.`,
    `No attribution required.`,
    ``,
    `More banners: turboloop.tech/creatives/${category}`,
    `turboloop.tech`,
  ].join("\n");
  archive.append(readme, { name: "README.txt" });

  // Fetch and stream images with controlled concurrency
  (async () => {
    try {
      for (let i = 0; i < items.length; i += CONCURRENCY) {
        const batch = items.slice(i, i + CONCURRENCY);
        await Promise.all(
          batch.map(async (item, batchIdx) => {
            const globalIdx = i + batchIdx;
            const fname = urlToFilename(item.url, globalIdx);
            const key = `${String(globalIdx + 1).padStart(4, "0")}_${fname}`;
            try {
              const stream = await fetchAsNodeStream(item.url);
              archive.append(stream, { name: key });
            } catch (err) {
              console.warn(`[download-kit] skipping ${item.url}:`, err);
              // Skip failed images — don't abort the whole zip
            }
          })
        );
      }
      await archive.finalize();
    } catch (err) {
      console.error("[download-kit] streaming error:", err);
      archive.abort();
      passThrough.destroy(err as Error);
    }
  })();

  // ── Convert Node.js PassThrough → Web ReadableStream ────────────────────

  const webStream = new ReadableStream({
    start(controller) {
      passThrough.on("data", (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      passThrough.on("end", () => {
        controller.close();
      });
      passThrough.on("error", (err: Error) => {
        controller.error(err);
      });
    },
    cancel() {
      passThrough.destroy();
      archive.abort();
    },
  });

  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFilename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
