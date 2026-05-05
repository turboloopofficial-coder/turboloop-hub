"use client";

// DownloadButton — fetches a file as a blob and triggers a real
// "Save as..." prompt with a clean filename. Without this, clicking a
// raw R2 .mp4 URL opens the video inline in the browser instead of
// downloading.

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { showToast } from "./Toast";

interface DownloadButtonProps {
  /** Direct file URL (R2 .mp4 / .pdf / etc.) */
  url: string;
  /** Title used to compose the filename (sanitized). */
  title: string;
  /** File extension override (default inferred from URL). */
  extension?: string;
  variant?: "primary" | "ghost" | "icon";
  label?: string;
  className?: string;
}

function safeFilename(title: string, ext: string): string {
  const cleanTitle = title
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);
  return `TurboLoop_${cleanTitle}.${ext}`;
}

function inferExt(url: string): string {
  const m = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
  return m ? m[1] : "bin";
}

export function DownloadButton({
  url,
  title,
  extension,
  variant = "ghost",
  label = "Download",
  className = "",
}: DownloadButtonProps) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    const ext = extension ?? inferExt(url);
    const filename = safeFilename(title, ext);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Free the blob after the browser has a chance to read it.
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
      showToast("Download started", "success");
    } catch (err: any) {
      // Cross-origin blob fetch blocked? Fall back to opening in new tab —
      // browser will handle the download via Content-Disposition if set,
      // or otherwise show the file inline (less ideal but not broken).
      window.open(url, "_blank", "noopener,noreferrer");
      showToast("Opening in new tab", "info");
    } finally {
      setBusy(false);
    }
  };

  const cls =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 px-4 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985] disabled:opacity-60"
      : variant === "icon"
        ? "inline-flex items-center justify-center w-11 h-11 rounded-full bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] active:scale-95 transition disabled:opacity-60"
        : "inline-flex items-center justify-center gap-2 px-4 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] active:scale-[0.985] transition disabled:opacity-60";

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`${cls} ${className}`}
      aria-label={label}
      type="button"
    >
      {busy ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {variant !== "icon" && <span>{busy ? "Downloading…" : label}</span>}
    </button>
  );
}
