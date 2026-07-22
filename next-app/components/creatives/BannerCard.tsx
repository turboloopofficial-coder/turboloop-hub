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
//  - Download: uses direct R2 URL (Content-Disposition: attachment set on R2 objects)
//    receives Content-Disposition: attachment and saves to gallery.
//    The blob-URL trick is unreliable on Android for cross-origin assets.

import { useState } from "react";
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
  // Image-load state — drives the opacity fade-in + the skeleton pulse
  // behind the image. Start false on every render so SSR/hydration
  // doesn't race ahead of the actual image load event.
  const [loaded, setLoaded] = useState(false);

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
      // Direct R2 URL — Content-Disposition: attachment is set on the R2 object,
      // so Android Chrome saves to gallery without needing a proxy.
      const filename = safeFilename(banner);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = banner.url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
      }, 500);
      downloaded = true;
    } catch {
      // Fallback: open the image in a new tab
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

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Direct R2 URL — Content-Disposition: attachment is set on the R2 object,
    // so Android Chrome saves to gallery without needing a proxy.
    const filename = safeFilename(banner);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = banner.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
    }, 500);
    haptic("success");
  };

  // Open the full image in a new tab. Used by the image area's onClick
  // — replaces the previous <a href target=_blank> wrapper that was
  // intercepting click events meant for the Share/Download buttons.
  const openImage = () => {
    window.open(banner.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="group relative rounded-[var(--r-lg)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 transition active:scale-[0.99] banner-card"
      style={{
        // 1 px brand-gradient top accent — declared inline so the colours
        // can pull from the per-banner palette without polluting the
        // global stylesheet. Implemented as a ::before in globals.css.
        ["--banner-accent-from" as any]: banner.palette.from,
        ["--banner-accent-to" as any]: banner.palette.to,
      }}
    >
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
        aria-label={`Open ${banner.headline ?? catLabel} full size`}
        className="cursor-pointer block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)]"
      >
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
          {/* Skeleton placeholder pulses underneath until the actual
              image fires onLoad. Keeps the grid from collapsing while
              the fetch is in flight. */}
          {!loaded && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[var(--c-surface)] animate-pulse"
            />
          )}
          <Image
            src={banner.url}
            alt={banner.headline ?? `${catLabel} banner`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover group-hover:scale-105 transition-[transform,opacity] duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
          {/* Subtle dark gradient overlay on hover — adds depth without
              washing the banner content. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {banner.headline && (
          <div>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-bold tracking-[0.16em] uppercase mb-2"
              style={{
                color: banner.palette.from,
                background: `${banner.palette.from}15`,
              }}
            >
              {catLabel}
            </span>
            <div className="text-xs font-semibold text-[var(--c-text)] line-clamp-2">
              {banner.headline}
            </div>
          </div>
        )}

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
