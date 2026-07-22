"use client";

// MediaGalleryCard — one tile in the Past Events media gallery.
// Renders either an <img> (photo) or a <video> (clip) and exposes the
// same Share/Download action pair as /creatives BannerCard.
//
// Share strategy mirrors BannerCard:
//   1. Try navigator.share({ files }) DIRECTLY (no canShare gate so
//      Brave Android isn't locked out).
//   2. Fall back to: download the file to the device AND copy a
//      caption + URL to the clipboard, then toast.
//
// All copy strings live in this file so the gallery card can be
// dropped into other event sections later without dragging a config
// object behind it.

import { useState } from "react";
import Image from "next/image";
import { Share2, Download, Loader2 } from "lucide-react";
import { showToast } from "@components/Toast";
import { haptic } from "@lib/haptic";
import type { EventPhoto, EventVideo } from "@lib/eventsData";

type MediaItem =
  | (EventPhoto & { type: "photo" })
  | (EventVideo & { type: "video" });

export interface MediaGalleryCardProps {
  item: MediaItem;
  /** Short event identifier used in the share message body
   *  (e.g. "TurboLoop Soft Launch · Lagos · Apr 4 2026"). */
  shareContext: string;
  /** Optional extra hashtag string appended to the share text. */
  hashtags?: string;
  /** Optional aspect-ratio override (default 4/5 for photos, 16/9 for videos). */
  aspectRatio?: string;
}

function filenameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "turboloop-media";
  } catch {
    return "turboloop-media";
  }
}

async function fetchAsFile(url: string): Promise<File | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const name = filenameFromUrl(url);
    return new File([blob], name, {
      type: blob.type || (name.endsWith(".mp4") ? "video/mp4" : "image/jpeg"),
    });
  } catch {
    return null;
  }
}

export function MediaGalleryCard({
  item,
  shareContext,
  hashtags = "#TurboLoop #SoftLaunch #DeFi",
  aspectRatio,
}: MediaGalleryCardProps) {
  const [busy, setBusy] = useState<"" | "share" | "download">("");

  const ratio =
    aspectRatio ?? (item.type === "video" ? "16 / 9" : "4 / 5");

  // What goes into the clipboard/text body when sharing. Premium voice,
  // single line so chat-app pastes look tidy.
  const shareText = `${item.caption}\n\n${shareContext}\n\n${hashtags}`;
  const title = item.caption;

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy("share");

    // Step 1 — try native share with the file attached.
    const file = await fetchAsFile(item.url);
    const canWebShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function";

    if (canWebShare && file) {
      try {
        await navigator.share({ title, text: shareText, files: [file] });
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

    // Step 2 — download via proxy + copy caption as a combined fallback.
    // Route through /api/download so Android Chrome saves to gallery
    // (cross-origin blob URLs are silently ignored on Android).
    let downloaded = false;
    let copied = false;

    try {
      const filename = filenameFromUrl(item.url);
      const proxyUrl = `/api/download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(filename)}`;
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = proxyUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.setTimeout(() => {
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
        "File downloaded + caption copied to clipboard — paste both in your chat app",
        "success"
      );
      haptic("success");
    } else if (downloaded) {
      showToast(
        "File downloaded — open your chat app and attach manually",
        "info"
      );
    } else if (copied) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      showToast(
        "Caption copied — long-press the media in the new tab to save",
        "info"
      );
    } else {
      window.open(item.url, "_blank", "noopener,noreferrer");
      showToast("Media opened in new tab — long-press to save", "info");
    }
    setBusy("");
  }

  function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    // Route through same-origin proxy so Android Chrome saves to gallery
    const filename = filenameFromUrl(item.url);
    const proxyUrl = `/api/download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = proxyUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
    }, 1000);
    haptic("success");
  }

  return (
    <div className="group relative rounded-[var(--r-lg)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-[var(--m-smooth)] ease-[var(--m-standard)] flex flex-col h-full">
      {/* Media — image for photos, native <video> for videos. The
          video uses the poster frame so first paint is a real photo
          and preload="none" keeps bandwidth at zero until tap. */}
      <div
        className="relative w-full bg-black"
        style={{ aspectRatio: ratio }}
      >
        {item.type === "photo" ? (
          <Image
            src={item.url}
            alt={item.caption}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            unoptimized
          />
        ) : (
          <video
            src={item.url}
            poster={item.posterUrl}
            controls
            preload="none"
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* Caption + actions */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="text-sm text-[var(--c-text)] leading-relaxed">
          {item.caption}
        </p>
        <div className="flex items-center gap-2 mt-auto">
          <button
            type="button"
            onClick={handleShare}
            disabled={busy !== ""}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] hover:bg-brand hover:text-white text-xs font-semibold transition-colors disabled:opacity-60"
            aria-label="Share with image/video and caption"
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
            aria-label="Download"
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
