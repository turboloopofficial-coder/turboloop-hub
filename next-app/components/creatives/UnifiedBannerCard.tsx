"use client";
// UnifiedBannerCard — single card component for ALL creative libraries.
// Handles share (native Web Share API + clipboard fallback) and download.
// Mobile-first: 44px touch targets, bottom-sheet share modal on mobile.

import { useState, useCallback } from "react";
import Image from "next/image";
import { Share2, Download, Copy, Check, ExternalLink } from "lucide-react";
import type { UnifiedCreative } from "@lib/unifiedCreativesData";

interface Props {
  item: UnifiedCreative;
}

export function UnifiedBannerCard({ item }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // ── Share ──────────────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    const shareData = {
      title: item.title,
      text: item.shareText,
      url: item.cta.url,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or API unavailable — fall through to modal
      }
    }
    setShareOpen(true);
  }, [item]);

  const handleCopy = useCallback(async () => {
    const text = `${item.shareText}\n\n${item.cta.url}`;
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [item]);

  // ── Download ───────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ext = item.url.split(".").pop()?.split("?")[0] ?? "png";
      const name = item.id.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
      a.href = url;
      a.download = `turboloop-${name}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
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
              onClick={handleShare}
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

      {/* ── Share modal (bottom sheet on mobile, centered on desktop) ───── */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={() => setShareOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

          {/* Sheet */}
          <div
            className="relative w-full md:max-w-md bg-[var(--c-surface)] rounded-t-3xl md:rounded-2xl border border-[var(--c-border)] p-6 shadow-2xl z-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar (mobile) */}
            <div className="mx-auto mb-4 w-10 h-1 rounded-full bg-[var(--c-border)] md:hidden" />

            {/* Image preview */}
            <div className="flex gap-4 mb-5">
              <div
                className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2"
                style={{ borderColor: item.accent.from }}
              >
                <Image src={item.url} alt={item.title} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold tracking-[0.14em] uppercase mb-1"
                  style={{ color: item.accent.from, background: `${item.accent.from}18` }}
                >
                  {item.emoji} {item.categoryLabel}
                </div>
                <p className="text-sm font-bold text-[var(--c-text)] line-clamp-2">{item.title}</p>
              </div>
            </div>

            {/* Share text */}
            <div
              className="rounded-xl p-4 mb-4 text-sm text-[var(--c-text)] leading-relaxed border"
              style={{ background: `${item.accent.from}08`, borderColor: `${item.accent.from}30` }}
            >
              <p className="font-medium mb-1 text-xs text-[var(--c-text-subtle)] uppercase tracking-wider">Share text</p>
              <p>{item.shareText}</p>
              <p className="mt-2 font-semibold" style={{ color: item.accent.from }}>{item.cta.url}</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCopy}
                type="button"
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: copied
                    ? "linear-gradient(135deg, #10B981, #059669)"
                    : `linear-gradient(135deg, ${item.accent.from}, ${item.accent.to})`,
                  boxShadow: `0 4px 20px ${item.accent.from}40`,
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy share text"}
              </button>
              <button
                onClick={handleDownload}
                type="button"
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] hover:border-[var(--c-brand-cyan)] transition-all"
              >
                <Download size={16} />
                Download image
              </button>
              <a
                href={item.cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold border text-center transition-all"
                style={{ borderColor: item.accent.from, color: item.accent.from }}
              >
                <ExternalLink size={14} />
                {item.cta.label}
              </a>
            </div>

            {/* Close */}
            <button
              onClick={() => setShareOpen(false)}
              type="button"
              className="mt-4 w-full text-xs text-[var(--c-text-subtle)] hover:text-[var(--c-text)] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
