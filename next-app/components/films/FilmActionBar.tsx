// FilmActionBar — Share + Download buttons for the film detail page.
// Client component because Web Share API + copy-to-clipboard are
// browser-only.
//
// Share button:
//   - Mobile: navigator.share() → native share sheet (iOS Safari,
//     Chrome Android). Includes title + URL.
//   - Desktop: navigator.clipboard.writeText(url) → toast "Link copied"
//   - Falls back to a `mailto:` link if neither API is available.
//
// Download button:
//   - Anchor that hits /api/download?url=<R2-url>&filename=<slug>.mp4
//   - Browser receives Content-Disposition: attachment → downloads
//     the file instead of trying to play it inline. Works
//     cross-origin (the R2 URL is cross-origin to next-app, which is
//     why the proxy route exists).
//
// Both buttons are big enough for mobile (44×44 minimum tap target).

"use client";

import { useState } from "react";
import { Share2, Download, Check } from "lucide-react";

interface FilmActionBarProps {
  /** Public URL of the film detail page — used by the share action. */
  url: string;
  /** Public title used in the share-sheet body. */
  title: string;
  /** Short context line appended to share text (typically the
   *  tagline or first sentence of the description). */
  shareContext?: string;
  /** Direct R2 URL of the .mp4. The download button proxies through
   *  /api/download to force Content-Disposition: attachment. */
  downloadUrl: string;
  /** Filename to suggest to the browser (without extension). */
  downloadFilename: string;
}

export function FilmActionBar({
  url,
  title,
  shareContext,
  downloadUrl,
  downloadFilename,
}: FilmActionBarProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = shareContext
      ? `${title}\n\n${shareContext}\n\nturboloop.tech`
      : `${title}\n\nturboloop.tech`;

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard?.writeText
    ) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
        return;
      } catch {
        // fall through to mailto
      }
    }
    // Last-resort: open mail composer
    window.open(
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  const proxyHref = `/api/download?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(downloadFilename + ".mp4")}`;

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-lg)] text-sm font-bold bg-brand text-white shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] active:scale-[0.985] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--c-bg)]"
        aria-label="Share this film"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Link copied
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            Share
          </>
        )}
      </button>

      <a
        href={proxyHref}
        download={`${downloadFilename}.mp4`}
        className="inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:border-[var(--c-brand-cyan)] active:scale-[0.985] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--c-bg)]"
        aria-label="Download this film as MP4"
      >
        <Download className="w-4 h-4" />
        Download
      </a>
    </div>
  );
}
