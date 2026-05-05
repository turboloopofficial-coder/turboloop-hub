"use client";

// Single creative tile on /creatives. Two action buttons:
//
//  - Share: two-step strategy.
//
//    1. Try navigator.share({ files }) DIRECTLY (no canShare gate).
//       Brave Android and some Chromium forks misreport canShare even
//       when the actual share call with a File would succeed; gating on
//       canShare locks those users out of the file-share path. Catching
//       the error after the attempt is the more permissive approach.
//
//    2. If that throws (anything other than AbortError, which means the
//       user dismissed the sheet): download the PNG to the device AND
//       copy the caption to the clipboard, then surface a single toast
//       — "Image saved + caption copied — paste both in your chat".
//       The user opens Telegram / WhatsApp manually, attaches from
//       gallery, pastes the caption. Two taps instead of one, but
//       guaranteed to deliver the branded creative + caption every time.
//
//    Skipping the old text-only navigator.share fallback on purpose:
//    sharing just a URL preview defeats the entire point of the share
//    button — that's what triggered this rewrite.
//
//  - Download: forces an attachment download via blob → temporary <a>.

import Image from "next/image";
import { Download, Share2 } from "lucide-react";
import { CreativeBanner, bannerShareText } from "@lib/creativesData";
import { showToast } from "@components/Toast";
import { haptic } from "@lib/haptic";

function safeFilename(banner: CreativeBanner): string {
  // banner.original is the source PNG name (e.g. "monthly-en-50.png").
  // Fall back to slug.png for any older entries that lack `original`.
  return banner.original || `turboloop-${banner.slug}.png`;
}

async function fetchAsFile(banner: CreativeBanner): Promise<File | null> {
  // R2's public bucket already serves Access-Control-Allow-Origin: *,
  // so fetch + blob is a clean cross-origin read with no proxy needed.
  try {
    const res = await fetch(banner.url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new File([blob], safeFilename(banner), {
      type: blob.type || "image/png",
    });
  } catch {
    return null;
  }
}

export function BannerCard({
  banner,
  catLabel,
}: {
  banner: CreativeBanner;
  catLabel: string;
}) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareText = bannerShareText(banner);
    const title = banner.headline || `TurboLoop · ${catLabel}`;
    const canWebShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function";

    // ── Step 1: Try Web Share with files DIRECTLY (no canShare gate) ──
    // Brave Android, some Chromium forks, and a handful of mobile WebViews
    // return canShare({ files }) === false even when navigator.share with
    // files would actually work. Gating up front locks those users out of
    // the premium path; trying the call and catching is more permissive.
    if (canWebShare) {
      const file = await fetchAsFile(banner);
      if (file) {
        try {
          await navigator.share({
            title,
            text: shareText,
            files: [file],
          });
          haptic("success");
          return; // ← happy path: native share sheet did its job
        } catch (err: any) {
          if (err?.name === "AbortError") {
            // User opened the share sheet and dismissed it. Don't fall
            // through to the download fallback — they've made their
            // choice and a surprise download would be confusing.
            return;
          }
          // Anything else (TypeError "files is not supported", NotAllowed
          // -Error, etc.) → this browser can't share files. Fall through
          // to Step 2.
        }
      }
    }

    // ── Step 2: Combined fallback — download image AND copy caption ──
    // The user gets BOTH pieces ready to paste/attach in Telegram or
    // WhatsApp manually. Two taps instead of one share-sheet tap, but
    // guaranteed delivery of the branded creative + the captioned text.
    let downloaded = false;
    let copied = false;

    try {
      const response = await fetch(banner.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = safeFilename(banner);
      document.body.appendChild(a);
      a.click();
      // Mobile browsers process the click async — wait before revoking
      // or some implementations cancel the download mid-stream.
      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        if (a.parentNode) document.body.removeChild(a);
      }, 1000);
      downloaded = true;
    } catch {
      // Cross-origin or network glitch — fall through; we'll pop the
      // image in a new tab as a last resort below.
    }

    try {
      // Caption only — no URL appended. The user already has the image
      // file from the download step; they don't need a link too.
      await navigator.clipboard.writeText(shareText);
      copied = true;
    } catch {
      // Clipboard blocked (rare on Android, possible in insecure contexts).
    }

    if (downloaded && copied) {
      showToast(
        "Image downloaded + caption copied to clipboard — paste both in your chat app",
        "success"
      );
      haptic("success");
    } else if (downloaded) {
      showToast(
        "Image downloaded — open your chat app, attach + write your message",
        "info"
      );
    } else if (copied) {
      // Couldn't download but got the caption — open the image so the
      // user can long-press → "Save image" manually.
      window.open(banner.url, "_blank", "noopener,noreferrer");
      showToast(
        "Caption copied — long-press the image in the new tab to save",
        "info"
      );
    } else {
      // Neither worked — minimum viable fallback: just open the image.
      window.open(banner.url, "_blank", "noopener,noreferrer");
      showToast("Image opened — long-press to save", "info");
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(banner.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = safeFilename(banner);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      haptic("success");
    } catch (err) {
      // Cross-origin or network glitch — fall back to opening the URL
      // so the user at least gets the file via right-click → save.
      console.error("Download failed:", err);
      window.open(banner.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="group block rounded-[var(--r-lg)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 transition active:scale-[0.99] relative">
      <a
        href={banner.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
          <Image
            src={banner.url}
            alt={banner.headline ?? `${catLabel} banner`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </a>

      <div className="p-3 flex flex-col gap-2">
        {banner.headline && (
          <div>
            <div
              className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase mb-1"
              style={{ color: banner.palette.from }}
            >
              {catLabel}
            </div>
            <div className="text-xs font-semibold text-[var(--c-text)] line-clamp-2">
              {banner.headline}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleShare}
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(15,23,42,0.08)] dark:hover:bg-[rgba(255,255,255,0.08)] text-xs font-medium transition-colors"
            title="Share with image and caption"
            aria-label="Share banner with image and caption"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>
          <button
            onClick={handleDownload}
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-[rgba(15,23,42,0.04)] dark:bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(15,23,42,0.08)] dark:hover:bg-[rgba(255,255,255,0.08)] text-xs font-medium transition-colors"
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
