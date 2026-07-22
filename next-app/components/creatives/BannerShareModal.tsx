"use client";
// ── BannerShareModal (Next.js) ────────────────────────────────────────────
// Advanced share modal for the homepage Creative Explorer banner cards.
// Features:
//   • AI caption variants via /api/share-text (falls back to static options)
//   • Referral username field — embeds ?ref=username in the share URL
//   • Platform share buttons: Telegram, WhatsApp, X/Twitter, Facebook
//   • "Share with Image" — native Web Share API on mobile, Telegram fallback
//   • Copy text (caption + referral link)
//   • Download image
//
// Uses /api/share-text (Next.js Edge route) — no tRPC dependency.

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Check, Download, Copy, ExternalLink, Share2 } from "lucide-react";
import captionsData from "@lib/campaign-captions.json";
import { downloadFile } from "@lib/downloadFile";

// ── Types ─────────────────────────────────────────────────────────────────

interface BannerItem {
  url: string;
  alt: string;
  title: string;
  category: string;
  filename?: string;
}

interface Props {
  banner: BannerItem;
  /** Active language tab id — used to pick the right caption language */
  language?: string;
  onClose: () => void;
}

// ── Caption helpers ───────────────────────────────────────────────────────

function getCaptionKey(banner: BannerItem): string {
  const filename = banner.filename ?? banner.url.split("/").pop() ?? "";
  return `${banner.category}/${filename}`;
}

function getStoredCaption(banner: BannerItem): string {
  const key = getCaptionKey(banner);
  const entry = (captionsData as Record<string, { caption?: string; shareText?: string }>)[key];
  return entry?.caption ?? entry?.shareText ?? "";
}

// ── Referral helpers ──────────────────────────────────────────────────────

const REF_KEY = "tl_ref";

function getStoredRef(): string {
  if (typeof window === "undefined") return "";
  try { return localStorage.getItem(REF_KEY) ?? ""; } catch { return ""; }
}

function saveRef(code: string): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(REF_KEY, code); } catch { /* ignore */ }
}

function buildShareUrl(ref: string): string {
  const base = "https://turboloop.tech";
  return ref.trim() ? `${base}?ref=${encodeURIComponent(ref.trim())}` : base;
}

// ── Platform share URLs ───────────────────────────────────────────────────

const PLATFORMS = [
  { id: "telegram",  label: "Telegram",   color: "#229ED9", icon: "✈️" },
  { id: "whatsapp",  label: "WhatsApp",   color: "#25D366", icon: "💬" },
  { id: "twitter",   label: "X / Twitter",color: "#1DA1F2", icon: "𝕏"  },
  { id: "facebook",  label: "Facebook",   color: "#1877F2", icon: "f"  },
] as const;

function buildPlatformUrl(platform: string, text: string, imageUrl: string): string {
  const encoded = encodeURIComponent(text);
  const imgEnc  = encodeURIComponent(imageUrl);
  switch (platform) {
    case "telegram":  return `https://t.me/share/url?url=${imgEnc}&text=${encoded}`;
    // WhatsApp: text only — do NOT append the R2 image URL as it shows as a raw link in chat.
    // The actual image is shared via the native Web Share API (file attachment) above.
    case "whatsapp":  return `https://wa.me/?text=${encoded}`;
    case "twitter":   return `https://twitter.com/intent/tweet?text=${encoded}&url=${imgEnc}`;
    case "facebook":  return `https://www.facebook.com/sharer/sharer.php?u=${imgEnc}&quote=${encoded}`;
    default:          return "#";
  }
}

// ── Category → label map (for the API call) ───────────────────────────────

const CAT_LABELS: Record<string, string> = {
  lifestyle:           "Passive Income",
  token:               "$TURBO Token",
  referral:            "Referral",
  "objection-handler": "Objection Handlers",
  "education-defi":    "DeFi Education",
  comparison:          "vs Banks",
  buyback:             "Buyback & Burn",
  "success-story":     "Success Stories",
  urgency:             "Urgency & FOMO",
  community:           "Community",
  "hindi-new":         "Hindi",
  spanish:             "Spanish",
  nigerian:            "Nigerian Pidgin",
  indonesian:          "Indonesian",
  chinese:             "Chinese",
  italian:             "Italian",
  arabic:              "Arabic",
  urdu:                "Urdu",
  german:              "German",
};

// ── Main Component ────────────────────────────────────────────────────────

export function BannerShareModal({ banner, language = "english", onClose }: Props) {
  const storedCaption = getStoredCaption(banner);

  const [captions, setCaptions]       = useState<string[]>(storedCaption ? [storedCaption] : []);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [refInput, setRefInput]       = useState(() => getStoredRef());
  const [refApplied, setRefApplied]   = useState(() => !!getStoredRef());
  const [copied, setCopied]           = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [seed, setSeed]               = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch captions from /api/share-text ──────────────────────────────────
  const fetchCaptions = useCallback(async (nextSeed: number) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await fetch("/api/share-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId:    banner.category,
          categoryLabel: CAT_LABELS[banner.category] ?? banner.category,
          title:         banner.title,
          referralUsername: refInput.trim() || undefined,
          seed:          nextSeed,
          language,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { options?: string[] };
      if (Array.isArray(data.options) && data.options.length > 0) {
        setCaptions(data.options);
        setSelectedIdx(0);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      // Keep stored caption as fallback — already in state
    } finally {
      setLoading(false);
    }
  }, [banner, language, refInput]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchCaptions(0);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = useCallback(() => {
    const next = seed + 1;
    setSeed(next);
    fetchCaptions(next);
  }, [seed, fetchCaptions]);

  const handleApplyRef = useCallback(() => {
    if (refInput.trim()) {
      saveRef(refInput.trim());
      setRefApplied(true);
    }
  }, [refInput]);

  const selectedCaption = captions[selectedIdx] ?? storedCaption ?? "";
  const shareUrl        = buildShareUrl(refApplied ? refInput : "");
  const fullShareText   = selectedCaption
    ? `${selectedCaption}\n\n${shareUrl}`
    : shareUrl;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(fullShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullShareText]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      // fetch → blob → same-origin object URL (works on Android Chrome)
      // Falls back to proxy if CORS fails, then opens in new tab.
      const filename = banner.url.split("/").pop() ?? "turboloop-banner.png";
      await downloadFile(banner.url, filename);
    } finally {
      setDownloading(false);
    }
  }, [banner.url]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)" }}
      >
        <motion.div
          className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background:  "linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)",
            border:      "1px solid rgba(255,255,255,0.1)",
            maxHeight:   "90vh",
            overflowY:   "auto",
          }}
        >
          {/* ── Header ── */}
          <div className="flex items-start justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.url}
                alt={banner.alt}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#06b6d4" }}>
                  Share Banner
                </p>
                <p className="text-sm font-medium text-white leading-tight mt-0.5 truncate">
                  {banner.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-full transition-colors ml-2"
              style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)" }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-4 pb-5 space-y-4">

            {/* ── Referral field ── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Your Referral Username (Optional)
              </p>
              <div className="flex gap-2">
                <div
                  className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>🔗</span>
                  <input
                    type="text"
                    value={refInput}
                    onChange={(e) => { setRefInput(e.target.value); setRefApplied(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleApplyRef(); }}
                    placeholder="YourUsername"
                    className="flex-1 bg-transparent outline-none text-white placeholder-white/30 text-sm"
                  />
                </div>
                <button
                  onClick={handleApplyRef}
                  className="px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: refApplied ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.08)",
                    border:     `1px solid ${refApplied ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.12)"}`,
                    color:      refApplied ? "#06b6d4" : "white",
                  }}
                >
                  {refApplied ? <Check size={14} /> : "Apply"}
                </button>
              </div>
              {refApplied && refInput.trim() && (
                <p className="text-xs mt-1" style={{ color: "#06b6d4" }}>
                  Link: turboloop.tech?ref={refInput.trim()}
                </p>
              )}
            </div>

            {/* ── Caption selector ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                  ✨ Choose a Share Text
                </p>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border:     "1px solid rgba(255,255,255,0.1)",
                    color:      loading ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
                  }}
                >
                  <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                  Regenerate
                </button>
              </div>

              <div className="space-y-2">
                {loading && captions.length === 0 ? (
                  <div
                    className="flex items-center gap-2 px-3 py-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <RefreshCw size={14} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Generating captions…</span>
                  </div>
                ) : captions.length === 0 && storedCaption ? (
                  /* Stored caption as single option while loading */
                  <button
                    onClick={() => setSelectedIdx(0)}
                    className="w-full text-left px-3 py-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(6,182,212,0.08)",
                      border:     "1px solid rgba(6,182,212,0.4)",
                      color:      "white",
                    }}
                  >
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full mr-2"
                      style={{ background: "#06b6d4" }}
                    >
                      <Check size={10} color="white" />
                    </span>
                    {storedCaption}
                  </button>
                ) : (
                  captions.map((cap, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIdx(i)}
                      className="w-full text-left px-3 py-3 rounded-xl text-sm transition-all"
                      style={{
                        background: selectedIdx === i ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.04)",
                        border:     `1px solid ${selectedIdx === i ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.08)"}`,
                        color:      selectedIdx === i ? "white" : "rgba(255,255,255,0.65)",
                      }}
                    >
                      {selectedIdx === i && (
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 rounded-full mr-2"
                          style={{ background: "#06b6d4" }}
                        >
                          <Check size={10} color="white" />
                        </span>
                      )}
                      {cap}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ── Platform share buttons ── */}
            <div className="grid grid-cols-4 gap-2">
              {PLATFORMS.map((p) => (
                <a
                  key={p.id}
                  href={buildPlatformUrl(p.id, selectedCaption || storedCaption, banner.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border:     "1px solid rgba(255,255,255,0.1)",
                    color:      "rgba(255,255,255,0.8)",
                  }}
                >
                  <span className="text-lg leading-none">{p.icon}</span>
                  <span>{p.label}</span>
                </a>
              ))}
            </div>

            {/* ── Share with image ── */}
            <button
              onClick={async () => {
                const text = selectedCaption || storedCaption;
                const canWebShare =
                  typeof navigator !== "undefined" &&
                  typeof navigator.share === "function";

                if (canWebShare) {
                  // Try to share the actual image file (not just a URL link)
                  try {
                    const res = await fetch(banner.url);
                    if (res.ok) {
                      const blob = await res.blob();
                      const filename = banner.filename ?? banner.url.split("/").pop() ?? "turboloop-banner.png";
                      const file = new File([blob], filename, { type: blob.type || "image/png" });
                      await navigator.share({ files: [file], text });
                      return;
                    }
                  } catch (err: any) {
                    if (err?.name === "AbortError") return; // user dismissed
                    // Fall through to text-only share
                  }
                  // Fallback: text-only share (no raw R2 URL — caption + turboloop.io only)
                  try {
                    await navigator.share({ text });
                    return;
                  } catch {
                    // Fall through to Telegram
                  }
                }
                // Desktop / no Web Share API — open Telegram share
                window.open(
                  buildPlatformUrl("telegram", text, banner.url),
                  "_blank"
                );
              }}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background:  "linear-gradient(135deg, #06b6d4, #7c3aed)",
                color:       "white",
                boxShadow:   "0 8px 24px rgba(6,182,212,0.3)",
              }}
            >
              <Share2 size={16} />
              Share with Image
            </button>

            {/* ── Copy text + Download ── */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border:     "1px solid rgba(255,255,255,0.1)",
                  color:      copied ? "#06b6d4" : "rgba(255,255,255,0.8)",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy text"}
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border:     "1px solid rgba(255,255,255,0.1)",
                  color:      "rgba(255,255,255,0.8)",
                }}
              >
                <Download size={14} />
                {downloading ? "Downloading…" : "Download"}
              </button>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
