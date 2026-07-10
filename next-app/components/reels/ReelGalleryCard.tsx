"use client";

// ReelGalleryCard — premium 9:16 reel tile with native-control video
// playback, glassmorphism language pill, and the same Share/Download
// flow as events/MediaGalleryCard.
//
// Share strategy mirrors MediaGalleryCard:
//   1. navigator.share({ files }) DIRECTLY (no canShare gate).
//   2. If that throws (Brave Android, desktop, anything-not-supported),
//      fall back to: download the file + copy the caption to clipboard
//      + single toast.
// AbortError = user dismissed, exits silently.

import { useState } from "react";
import { Share2, Download, Loader2 } from "lucide-react";
import { showToast } from "@components/Toast";
import { haptic } from "@lib/haptic";
import type { ReelTrack } from "@lib/reelsData";
import { dispatchNudgeEvent } from "@components/notifications/SmartNotifications";

const LANG_LABEL: Record<ReelTrack["lang"], string> = {
  en: "EN", th: "TH", ko: "KO", lo: "LO", hi: "HI", ta: "TA",
  ar: "AR", zh: "ZH", it: "IT", ur: "UR", fr: "FR", es: "ES",
  pcm: "PCM", de: "DE", id: "ID",
};
const LANG_FLAG: Record<ReelTrack["lang"], string> = {
  en: "🇬🇧", th: "🇹🇭", ko: "🇰🇷", lo: "🇱🇦", hi: "🇮🇳", ta: "🇮🇳",
  ar: "🇸🇦", zh: "🇨🇳", it: "🇮🇹", ur: "🇵🇰", fr: "🇫🇷", es: "🇪🇸",
  pcm: "🇳🇬", de: "🇩🇪", id: "🇮🇩",
};

function filenameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "turboloop-reel.mp4";
  } catch {
    return "turboloop-reel.mp4";
  }
}

async function fetchAsFile(url: string): Promise<File | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const name = filenameFromUrl(url);
    return new File([blob], name, {
      type: blob.type || "video/mp4",
    });
  } catch {
    return null;
  }
}

export interface ReelGalleryCardProps {
  reel: ReelTrack;
}

export function ReelGalleryCard({ reel }: ReelGalleryCardProps) {
  const [busy, setBusy] = useState<"" | "share" | "download">("");

  // Body of the share text: title + tease + hashtags. Keeps each share
  // self-contained when pasted into a chat that didn't render the
  // video preview (group chats with link previews off, etc.).
  const shareText = `${reel.title}\n\n${reel.description}\n\n${reel.hashtags}`;

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy("share");

    const file = await fetchAsFile(reel.videoUrl);
    const canWebShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function";

    if (canWebShare && file) {
      try {
        await navigator.share({
          title: reel.title,
          text: shareText,
          files: [file],
        });
        haptic("success");
        setBusy("");
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") {
          setBusy("");
          return;
        }
        // fall through
      }
    }

    // Fallback — download file + copy caption.
    let downloaded = false;
    let copied = false;

    try {
      const res = await fetch(reel.videoUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = filenameFromUrl(reel.videoUrl);
      document.body.appendChild(a);
      a.click();
      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        if (a.parentNode) document.body.removeChild(a);
      }, 1000);
      downloaded = true;
    } catch {}

    try {
      await navigator.clipboard.writeText(shareText);
      copied = true;
    } catch {}

    if (downloaded && copied) {
      showToast(
        "Reel downloaded + caption copied to clipboard — paste both in your chat app",
        "success"
      );
      haptic("success");
    } else if (downloaded) {
      showToast(
        "Reel downloaded — open your chat app and attach manually",
        "info"
      );
    } else if (copied) {
      window.open(reel.videoUrl, "_blank", "noopener,noreferrer");
      showToast(
        "Caption copied — long-press the video in the new tab to save",
        "info"
      );
    } else {
      window.open(reel.videoUrl, "_blank", "noopener,noreferrer");
      showToast("Reel opened in new tab — long-press to save", "info");
    }
    setBusy("");
  }

  async function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy("download");

    try {
      const res = await fetch(reel.videoUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = filenameFromUrl(reel.videoUrl);
      document.body.appendChild(a);
      a.click();
      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        if (a.parentNode) document.body.removeChild(a);
      }, 1000);
      haptic("success");
    } catch {
      window.open(reel.videoUrl, "_blank", "noopener,noreferrer");
    }
    setBusy("");
  }

  return (
    <div
      className="group relative rounded-[var(--r-xl)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)] transition-[transform,box-shadow,border-color] duration-[var(--m-smooth)] ease-[var(--m-standard)] hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[var(--s-xl)] hover:border-[color-mix(in_oklab,var(--c-brand-cyan)_55%,transparent)] flex flex-col h-full"
      style={{
        // Layered glow: subtle brand-cyan ring that intensifies on hover.
        // Sits behind the card so it reads as a cinematic light bloom
        // rather than a border stripe.
        boxShadow:
          "0 0 0 1px color-mix(in oklab, var(--c-brand-cyan) 12%, transparent)",
      }}
    >
      {/* 9:16 vertical media — native <video> with poster thumbnail.
          preload="none" so zero MP4 bytes until the user taps play. */}
      <div
        className="relative w-full bg-black"
        style={{ aspectRatio: "9 / 16" }}
      >
        <video
          src={reel.videoUrl}
          poster={reel.thumbUrl}
          controls
          preload="none"
          playsInline
          // Fire a nudge event the FIRST time this reel starts playing
          // in the session. The Smart Notifications controller counts
          // these across all cards and triggers the "make one yourself"
          // creator nudge once three different reels have been watched.
          onPlay={() => dispatchNudgeEvent("tl:reel-played")}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Glassmorphism language pill, top-left over the video. */}
        <span
          className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.625rem] font-bold tracking-[0.18em] uppercase"
          style={{
            color: "white",
            background: "rgba(15,23,42,0.55)",
            border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span className="text-sm leading-none" aria-hidden="true">
            {LANG_FLAG[reel.lang]}
          </span>
          {LANG_LABEL[reel.lang]}
        </span>
      </div>

      {/* Caption + actions */}
      <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-sm md:text-base font-bold text-[var(--c-text)] leading-snug mb-1.5">
            {reel.title}
          </h3>
          <p className="text-xs text-[var(--c-text-muted)] leading-relaxed line-clamp-4">
            {reel.description}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <button
            type="button"
            onClick={handleShare}
            disabled={busy !== ""}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] hover:bg-brand hover:text-white text-xs font-semibold transition-colors disabled:opacity-60"
            aria-label={`Share ${reel.title}`}
          >
            {busy === "share" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Share2 size={14} />
            )}
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={busy !== ""}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(15,23,42,0.08)] dark:hover:bg-[rgba(255,255,255,0.08)] text-xs font-medium transition-colors disabled:opacity-60"
            aria-label={`Download ${reel.title}`}
          >
            {busy === "download" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
