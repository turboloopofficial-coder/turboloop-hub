"use client";

// Single creative tile on /creatives. Two action buttons:
//
//  - Share: tries hardest to attach the actual image to the share sheet
//    rather than dump a link. On mobile (iOS Safari 15+, Chrome Android
//    89+) the Web Share API supports files; we fetch the R2 PNG, wrap it
//    in a File, and pass it via navigator.share({ files }). Telegram /
//    WhatsApp / Photos / etc. then receive a real image attachment plus
//    the captioned text body.
//
//    Browsers without files support fall back to a text-only share.
//    Browsers without Web Share at all (most desktop) get the desktop
//    flow: caption text copied to clipboard + the image opened in a new
//    tab so the user can right-click → save, or drag into a chat.
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

    // ── Path 1: Web Share API with files (mobile, the premium path) ──
    // canShare({ files }) gates the actual file-share capability — even
    // when navigator.share exists, files may not be supported (e.g.
    // Firefox Android implements share without files). The fetch happens
    // before the share call so the share sheet is offered with the
    // attachment ready to go.
    const file = await fetchAsFile(banner);
    if (
      file &&
      typeof navigator !== "undefined" &&
      "canShare" in navigator &&
      typeof navigator.share === "function" &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({ title, text: shareText, files: [file] });
        haptic("success");
        return;
      } catch (err: any) {
        // AbortError = user dismissed the sheet. Anything else = fall
        // through to the next path.
        if (err?.name === "AbortError") return;
      }
    }

    // ── Path 2: Web Share API, text + url only (mobile, partial impl) ──
    // Telegram / WhatsApp will at least preview the URL; not as good as
    // a file attach but better than the desktop fallback.
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: shareText, url: banner.url });
        haptic("success");
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    // ── Path 3: Desktop fallback ──────────────────────────────────────
    // Copy the full captioned message to the clipboard AND pop the image
    // open in a new tab so the user can right-click → "Save image" or
    // drag the tab onto a chat window. Toast confirms both actions.
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${banner.url}`);
      window.open(banner.url, "_blank", "noopener,noreferrer");
      showToast("Caption copied + image opened in new tab", "success");
    } catch {
      // Clipboard blocked (e.g. http context, obscure browser): just
      // pop the image so the user has *something* to grab.
      window.open(banner.url, "_blank", "noopener,noreferrer");
      showToast("Image opened in new tab — long-press to save", "info");
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
