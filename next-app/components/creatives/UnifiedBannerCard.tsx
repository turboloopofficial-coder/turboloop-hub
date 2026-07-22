"use client";
// UnifiedBannerCard — single card component for ALL creative libraries.
// Share button opens the premium ShareModal (AI text options + referral link).
// Download button triggers direct blob download.
// Mobile-first: 44px touch targets.

import { useState, useCallback } from "react";
import Image from "next/image";
import { Share2, Download, ExternalLink } from "lucide-react";
import type { UnifiedCreative } from "@lib/unifiedCreativesData";
import { ShareModal } from "./ShareModal";

interface Props {
  item: UnifiedCreative;
}

export function UnifiedBannerCard({ item }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // ── Download ───────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      const ext = item.url.split(".").pop()?.split("?")[0] ?? "png";
      const name = item.id.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
      a.href = blobUrl;
      a.download = `turboloop-${name}.${ext}`;
      document.body.appendChild(a);
      a.click();
      // Delay revoke — mobile browsers process the click asynchronously
      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        if (a.parentNode) document.body.removeChild(a);
      }, 1500);
    } catch {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }, [item, downloading]);

  const openImage = useCallback(() => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  }, [item.url]);

  return (
    <>
      {/* ── Card ────────────────────────────────────────────────────────── */}
      <div
        className="group relative flex flex-col rounded-2xl overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.99]"
        style={{
          borderTopColor: item.accent.from,
          borderTopWidth: "2px",
        }}
      >
        {/* Image area */}
        <div
          onClick={openImage}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openImage(); } }}
          aria-label={`Open ${item.title} full size`}
          className="cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)]"
        >
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
            {!loaded && (
              <div
                aria-hidden="true"
                className="absolute inset-0 animate-pulse"
                style={{ background: `linear-gradient(135deg, ${item.accent.from}20, ${item.accent.to}20)` }}
              />
            )}
            <Image
              src={item.url}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover group-hover:scale-105 transition-[transform,opacity] duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
            />
            {/* Hover overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              style={{ background: `${item.accent.from}15` }}
            >
              <div className="bg-black/40 backdrop-blur-sm rounded-full p-2">
                <ExternalLink size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Card footer */}
        <div className="p-3 flex flex-col gap-2.5 flex-1">
          {/* Category badge + title */}
          <div>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold tracking-[0.14em] uppercase mb-1.5"
              style={{ color: item.accent.from, background: `${item.accent.from}18` }}
            >
              <span aria-hidden="true">{item.emoji}</span>
              <span>{item.categoryLabel}</span>
            </span>
            <p className="text-[0.7rem] font-semibold text-[var(--c-text)] line-clamp-2 leading-snug">
              {item.title}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={() => setShareOpen(true)}
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] md:min-h-[36px] rounded-xl text-xs font-bold transition-all duration-200 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${item.accent.from}, ${item.accent.to})`,
                color: "white",
                boxShadow: `0 2px 12px ${item.accent.from}40`,
              }}
              title="Share this banner"
              aria-label="Share banner"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
            <button
              onClick={handleDownload}
              type="button"
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] md:min-h-[36px] rounded-xl text-xs font-semibold bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] hover:border-[var(--c-brand-cyan)] hover:text-[var(--c-brand-cyan)] transition-all duration-200 active:scale-95 disabled:opacity-60"
              title="Download image"
              aria-label="Download banner"
            >
              <Download size={13} className={downloading ? "animate-bounce" : ""} />
              <span>{downloading ? "…" : "Download"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Share modal ──────────────────────────────────────────────────── */}
      {shareOpen && (
        <ShareModal item={item} onClose={() => setShareOpen(false)} />
      )}
    </>
  );
}
