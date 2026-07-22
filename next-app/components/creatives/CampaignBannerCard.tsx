"use client";
// CampaignBannerCard — card component for the 504 campaign creatives.
// Mirrors the exact share + download UX of BannerCard but works with
// the simpler CampaignCreative type (no palette/headline/caption fields).
// Used on /creatives/[category] sub-pages.
import { useState } from "react";
import Image from "next/image";
import { Share2, Download } from "lucide-react";
import type { CampaignCreative } from "@lib/campaignData";

// Accent colours per category — gives each sub-page a distinct brand tint
// without requiring per-image palette data.
const CATEGORY_ACCENT: Record<string, { from: string; to: string }> = {
  lifestyle:          { from: "#06B6D4", to: "#7C3AED" },
  token:              { from: "#F59E0B", to: "#EF4444" },
  referral:           { from: "#10B981", to: "#06B6D4" },
  "objection-handler":{ from: "#8B5CF6", to: "#EC4899" },
  "hindi-new":        { from: "#F97316", to: "#FBBF24" },
  nigerian:           { from: "#22C55E", to: "#16A34A" },
  "success-story":    { from: "#3B82F6", to: "#6366F1" },
  "education-defi":   { from: "#0EA5E9", to: "#2563EB" },
  urgency:            { from: "#EF4444", to: "#F97316" },
  buyback:            { from: "#F43F5E", to: "#EC4899" },
  comparison:         { from: "#14B8A6", to: "#06B6D4" },
  community:          { from: "#A855F7", to: "#6366F1" },
};

function safeFilename(item: CampaignCreative): string {
  return item.filename.replace(/[^a-z0-9._-]/gi, "_");
}

interface Props {
  item: CampaignCreative;
  catLabel: string;
}

export function CampaignBannerCard({ item, catLabel }: Props) {
  const [loaded, setLoaded] = useState(false);
  const accent = CATEGORY_ACCENT[item.category] ?? { from: "#06B6D4", to: "#7C3AED" };

  const handleShare = async () => {
    // Clean share text — caption + turboloop.io link only, never the raw R2 URL
    const shareText = `${item.title}\n\n${item.description}\n\n🔗 https://turboloop.io`;
    const canWebShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function";

    // ── Step 1: Try Web Share with image file directly (no canShare gate) ──
    // Some Android browsers misreport canShare even when share with files works.
    if (canWebShare) {
      try {
        const res = await fetch(item.url);
        if (res.ok) {
          const blob = await res.blob();
          const file = new File([blob], safeFilename(item), { type: blob.type || "image/png" });
          await navigator.share({ files: [file], text: shareText });
          return; // ← happy path
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return; // user dismissed sheet
        // Fall through to Step 2
      }
    }

    // ── Step 2: Download image + copy caption to clipboard ──
    // User gets both pieces ready to paste/attach manually in WhatsApp/Telegram.
    let downloaded = false;
    let copied = false;

    try {
      // Direct R2 URL — Content-Disposition: attachment is set on the R2 object,
      // so Android Chrome saves to gallery without needing a proxy.
      const filename = safeFilename(item);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = item.url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.setTimeout(() => { if (a.parentNode) document.body.removeChild(a); }, 500);
      downloaded = true;
    } catch {
      // Network error — skip download
    }

    try {
      // Caption only — no R2 URL appended
      await navigator.clipboard.writeText(shareText);
      copied = true;
    } catch {
      // Clipboard blocked
    }

    if (!downloaded && !copied) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = () => {
    const filename = safeFilename(item);
    // Direct R2 URL — Content-Disposition: attachment is set on the R2 object
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = item.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => { if (a.parentNode) document.body.removeChild(a); }, 500);
  };

  const openImage = () => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  // Derive a readable title from the filename
  const displayTitle = item.title
    .replace(/^TurboLoop [^—–]+ — /i, "")
    .replace(/^TurboLoop /i, "")
    .trim();

  return (
    <div
      className="group relative rounded-[var(--r-lg)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 transition active:scale-[0.99] banner-card"
      style={{
        ["--banner-accent-from" as any]: accent.from,
        ["--banner-accent-to" as any]: accent.to,
      }}
    >
      {/* Image area */}
      <div
        onClick={openImage}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openImage();
          }
        }}
        aria-label={`Open ${displayTitle} full size`}
        className="cursor-pointer block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)]"
      >
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
          {!loaded && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[var(--c-surface)] animate-pulse"
            />
          )}
          <Image
            src={item.url}
            alt={item.alt}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover group-hover:scale-105 transition-[transform,opacity] duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 flex flex-col gap-2">
        <div>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.16em] uppercase mb-2"
            style={{
              color: accent.from,
              background: `${accent.from}15`,
            }}
          >
            {catLabel}
          </span>
          <div className="text-xs font-semibold text-[var(--c-text)] line-clamp-2">
            {displayTitle}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleShare}
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] py-2.5 md:min-h-0 md:py-1.5 px-2 rounded-md bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] text-[var(--c-text)] hover:bg-brand hover:text-white text-xs font-semibold transition-colors"
            title="Share with image and caption"
            aria-label="Share banner with image and caption"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>
          <button
            onClick={handleDownload}
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] py-2.5 md:min-h-0 md:py-1.5 px-2 rounded-md bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(15,23,42,0.08)] dark:hover:bg-[rgba(255,255,255,0.08)] text-xs font-medium transition-colors"
            title="Download image"
            aria-label="Download banner"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
