"use client";

// DownloadKitButton — fetches all banner URLs for a category and zips
// them in the browser using fflate (WASM-free, pure JS, ~25 KB gzipped).
//
// Strategy:
//  1. Fetch all image URLs for the category from /api/creatives (all pages)
//  2. Fetch each image as an ArrayBuffer in parallel (capped at 6 concurrent)
//  3. Zip them in-memory with fflate
//  4. Trigger a browser download of the resulting .zip
//
// The zip is built entirely client-side — no server storage needed.
// Images are fetched directly from the R2 CDN (CORS-enabled).
//
// UX states: idle → counting → downloading (X/N) → zipping → done (auto-resets)

import { useState, useCallback } from "react";
import { Download, Loader2, CheckCircle2, PackageOpen } from "lucide-react";
import { zipSync, strToU8 } from "fflate";
import type { UnifiedCreative } from "@lib/unifiedCreativesData";

interface Props {
  categoryId: string;
  categoryLabel: string;
  accentColor?: string;
}

type Phase =
  | { type: "idle" }
  | { type: "counting" }
  | { type: "downloading"; done: number; total: number }
  | { type: "zipping" }
  | { type: "done" };

/** Fetch all pages of a category from /api/creatives */
async function fetchAllItems(categoryId: string): Promise<UnifiedCreative[]> {
  const PAGE = 200;
  let page = 1;
  const all: UnifiedCreative[] = [];

  while (true) {
    const params = new URLSearchParams({
      category: categoryId,
      page: String(page),
      pageSize: String(PAGE),
    });
    const res = await fetch(`/api/creatives?${params}`);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    all.push(...data.items);
    if (!data.hasMore) break;
    page++;
  }

  return all;
}

/** Fetch a URL as Uint8Array, with a simple retry */
async function fetchBytes(url: string, retries = 2): Promise<Uint8Array> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      return new Uint8Array(buf);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw new Error("unreachable");
}

/** Run up to `limit` promises concurrently */
async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
  onProgress: (done: number) => void
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let idx = 0;
  let done = 0;

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
      done++;
      onProgress(done);
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

/** Derive a safe filename from a URL */
function urlToFilename(url: string, idx: number): string {
  try {
    const path = new URL(url).pathname;
    const base = path.split("/").pop() ?? `banner-${idx}.png`;
    // Sanitise: keep only safe filename characters
    return base.replace(/[^a-zA-Z0-9._-]/g, "_");
  } catch {
    return `banner-${idx}.png`;
  }
}

export function DownloadKitButton({ categoryId, categoryLabel, accentColor }: Props) {
  const [phase, setPhase] = useState<Phase>({ type: "idle" });

  const handleDownload = useCallback(async () => {
    if (phase.type !== "idle") return;

    try {
      // 1. Count / fetch all items
      setPhase({ type: "counting" });
      const items = await fetchAllItems(categoryId);

      if (items.length === 0) {
        setPhase({ type: "idle" });
        return;
      }

      // 2. Download all images in parallel (max 6 concurrent)
      setPhase({ type: "downloading", done: 0, total: items.length });

      const tasks = items.map((item, i) => () => fetchBytes(item.url, 2).then(bytes => ({ bytes, i })));

      const fetched = await pLimit(tasks, 6, done => {
        setPhase({ type: "downloading", done, total: items.length });
      });

      // 3. Zip in-memory
      setPhase({ type: "zipping" });

      const zipFiles: Record<string, Uint8Array> = {};
      for (const { bytes, i } of fetched) {
        const filename = urlToFilename(items[i].url, i);
        // Deduplicate filenames by prepending index if needed
        const key = `${String(i + 1).padStart(4, "0")}_${filename}`;
        zipFiles[key] = bytes;
      }

      // Add a README.txt
      const readme = [
        `TurboLoop — ${categoryLabel} Marketing Kit`,
        `Downloaded: ${new Date().toISOString().slice(0, 10)}`,
        `Total banners: ${items.length}`,
        ``,
        `Free to share on Telegram, WhatsApp, Twitter/X, and any social platform.`,
        `No attribution required.`,
        ``,
        `turboloop.tech`,
      ].join("\n");
      zipFiles["README.txt"] = strToU8(readme);

      const zipped = zipSync(zipFiles, { level: 0 }); // level 0 = store (images are already compressed)

      // 4. Trigger download
      const blob = new Blob([zipped], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `turboloop-${categoryId}-kit.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setPhase({ type: "done" });
      setTimeout(() => setPhase({ type: "idle" }), 3000);
    } catch (err) {
      console.error("[DownloadKit] failed:", err);
      setPhase({ type: "idle" });
      alert("Download failed. Please try again.");
    }
  }, [phase.type, categoryId, categoryLabel]);

  const accent = accentColor ?? "#22d3ee";

  // ── Render ──
  if (phase.type === "idle") {
    return (
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition active:scale-95"
        style={{
          background: `${accent}18`,
          border: `1px solid ${accent}40`,
          color: accent,
        }}
        title={`Download all ${categoryLabel} banners as a zip`}
      >
        <PackageOpen size={15} strokeWidth={2.5} />
        <span className="hidden sm:inline">Download Kit</span>
        <span className="sm:hidden">Kit</span>
      </button>
    );
  }

  if (phase.type === "counting") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold opacity-70 cursor-not-allowed"
        style={{ background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
      >
        <Loader2 size={15} className="animate-spin" />
        <span className="hidden sm:inline">Preparing…</span>
      </button>
    );
  }

  if (phase.type === "downloading") {
    const pct = Math.round((phase.done / phase.total) * 100);
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold cursor-not-allowed relative overflow-hidden"
        style={{ background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
      >
        {/* Progress fill */}
        <span
          className="absolute inset-0 transition-all duration-300"
          style={{ background: `${accent}22`, width: `${pct}%` }}
          aria-hidden="true"
        />
        <Loader2 size={15} className="animate-spin relative z-10" />
        <span className="relative z-10 hidden sm:inline tabular-nums">
          {phase.done}/{phase.total}
        </span>
        <span className="relative z-10 sm:hidden tabular-nums">{pct}%</span>
      </button>
    );
  }

  if (phase.type === "zipping") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold opacity-70 cursor-not-allowed"
        style={{ background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
      >
        <Loader2 size={15} className="animate-spin" />
        <span className="hidden sm:inline">Zipping…</span>
      </button>
    );
  }

  // done
  return (
    <button
      disabled
      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold"
      style={{ background: "#10b98118", border: "1px solid #10b98140", color: "#10b981" }}
    >
      <CheckCircle2 size={15} />
      <span className="hidden sm:inline">Downloaded!</span>
    </button>
  );
}
