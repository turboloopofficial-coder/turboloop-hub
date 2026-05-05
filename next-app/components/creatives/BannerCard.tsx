"use client";

import Image from "next/image";
import { Download, Share2 } from "lucide-react";
import { CreativeBanner, bannerShareText } from "@lib/creativesData";

export function BannerCard({ banner, catLabel }: { banner: CreativeBanner; catLabel: string }) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareText = bannerShareText(banner);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: banner.headline || "TurboLoop Creative",
          text: shareText,
          url: banner.url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${banner.url}`);
        alert("Copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
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
      a.download = banner.original || `turboloop-${banner.slug}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: open in new tab
      window.open(banner.url, "_blank");
    }
  };

  return (
    <div className="group block rounded-[var(--r-lg)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 transition active:scale-[0.99] relative">
      <a href={banner.url} target="_blank" rel="noopener noreferrer" className="block">
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
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-[var(--c-surface-hover)] hover:bg-[var(--c-border)] text-xs font-medium transition-colors"
            title="Share with caption"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-[var(--c-surface-hover)] hover:bg-[var(--c-border)] text-xs font-medium transition-colors"
            title="Download image"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
