"use client";

// DownloadButton — fetches a file as a blob and triggers a real
// "Save as..." prompt with a clean filename.
//
// Uses the fetch → blob → same-origin object URL pattern which works on
// Android Chrome. A plain <a href="R2_URL" download> is ignored by Chrome
// for cross-origin URLs — it navigates instead of downloading.

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { showToast } from "./Toast";
import { haptic } from "@lib/haptic";
import { downloadFile } from "@lib/downloadFile";

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
    try {
      const ext = extension ?? inferExt(url);
      const filename = safeFilename(title, ext);
      // fetch → blob → same-origin object URL (works on Android Chrome)
      // Falls back to proxy if CORS fails, then opens in new tab.
      await downloadFile(url, filename);
      haptic("success");
      showToast("Download started", "success");
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
