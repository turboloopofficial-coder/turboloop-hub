"use client";

// DownloadKitButton — triggers a server-side zip download for an entire category.
//
// The zip is built by /api/creatives/download-kit?category=<id> (Node.js route).
// The server fetches images from R2 (no CORS restriction), zips them with fflate,
// and streams the zip back as application/zip.
//
// The client simply opens the API URL as a download link — no client-side image
// fetching, no CORS issues, no large memory usage in the browser.
//
// UX states: idle → downloading (progress bar) → done (auto-resets after 3s)
//
// Progress is faked with a timed animation (we can't get real progress from a
// streaming response without ReadableStream + Content-Length, which is complex).
// The bar fills to 85% over ~8s, then jumps to 100% when the download starts.

import { useState, useCallback, useRef } from "react";
import { PackageOpen, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  categoryId: string;
  categoryLabel: string;
  accentColor?: string;
}

type Phase = "idle" | "downloading" | "done";

export function DownloadKitButton({ categoryId, categoryLabel, accentColor }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgressAnimation = () => {
    setProgress(0);
    let pct = 0;
    timerRef.current = setInterval(() => {
      // Ease towards 85% over ~8 seconds
      pct = Math.min(85, pct + (85 - pct) * 0.04 + 0.3);
      setProgress(Math.round(pct));
    }, 200);
  };

  const stopProgressAnimation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleDownload = useCallback(async () => {
    if (phase !== "idle") return;

    setPhase("downloading");
    startProgressAnimation();

    try {
      // Trigger the download via a hidden <a> pointing to the API route.
      // The browser will show its native download progress bar.
      const url = `/api/creatives/download-kit?category=${encodeURIComponent(categoryId)}`;

      // Use fetch to detect errors before triggering the download
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      // Get the blob and create an object URL
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      stopProgressAnimation();
      setProgress(100);

      // Trigger download
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `turboloop-${categoryId}-kit.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      setPhase("done");
      setTimeout(() => {
        setPhase("idle");
        setProgress(0);
      }, 3000);
    } catch (err) {
      console.error("[DownloadKit] failed:", err);
      stopProgressAnimation();
      setPhase("idle");
      setProgress(0);
      alert(`Download failed. Please try again.\n\n${err instanceof Error ? err.message : String(err)}`);
    }
  }, [phase, categoryId]);

  const accent = accentColor ?? "#22d3ee";

  if (phase === "idle") {
    return (
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition active:scale-95 select-none"
        style={{
          background: `${accent}18`,
          border: `1px solid ${accent}40`,
          color: accent,
          touchAction: "manipulation",
        }}
        title={`Download ${categoryLabel} banners as a zip`}
      >
        <PackageOpen size={15} strokeWidth={2.5} />
        <span className="hidden sm:inline">Download Kit</span>
        <span className="sm:hidden">Kit</span>
      </button>
    );
  }

  if (phase === "downloading") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold cursor-not-allowed relative overflow-hidden"
        style={{ background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
      >
        {/* Animated progress fill */}
        <span
          className="absolute inset-0 transition-all duration-300"
          style={{ background: `${accent}25`, width: `${progress}%` }}
          aria-hidden="true"
        />
        <Loader2 size={15} className="animate-spin relative z-10" />
        <span className="relative z-10 hidden sm:inline tabular-nums">
          {progress < 90 ? "Preparing…" : "Zipping…"}
        </span>
        <span className="relative z-10 sm:hidden tabular-nums">{progress}%</span>
      </button>
    );
  }

  // done
  return (
    <button
      disabled
      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold"
      style={{ background: "#10b98118", border: "1px solid #10b98140", color: "#10b981" }}
    >
      <CheckCircle2 size={15} />
      <span className="hidden sm:inline">Downloaded!</span>
    </button>
  );
}
