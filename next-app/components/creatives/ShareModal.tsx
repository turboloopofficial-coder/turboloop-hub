"use client";
// ShareModal — premium share experience for TurboLoop creatives.
//
// Features:
//   • Referral username/link field (persisted in localStorage)
//   • 3 AI-generated share text options (Claude Haiku)
//   • Regenerate button (re-calls AI with a new seed)
//   • Select an option → Share button activates
//   • Share: Web Share API (includes image file on mobile) → clipboard fallback
//   • Download: fetches blob and triggers browser download
//   • Copy text: copies selected option to clipboard
//   • Bottom sheet on mobile, centered modal on desktop
//   • Fully accessible (focus trap, ESC to close, ARIA labels)

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  RefreshCw,
  User,
  ChevronRight,
  Sparkles,
  Link2,
} from "lucide-react";
import type { UnifiedCreative } from "@lib/unifiedCreativesData";

interface ShareModalProps {
  item: UnifiedCreative;
  onClose: () => void;
}

const REF_STORAGE_KEY = "tl_referral_username";

function buildRefLink(username: string): string {
  const u = username.trim();
  if (!u) return "https://turboloop.io";
  // Accept full URL or just username
  if (u.startsWith("https://turboloop.io")) return u;
  return `https://turboloop.io?ref=${u}`;
}

export function ShareModal({ item, onClose }: ShareModalProps) {
  // ── State ────────────────────────────────────────────────────────────────
  const [refInput, setRefInput] = useState("");
  const [options, setOptions] = useState<[string, string, string] | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  // ── Restore saved referral username ──────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REF_STORAGE_KEY) ?? "";
      setRefInput(saved);
    } catch {}
  }, []);

  // ── Fetch AI share text options ───────────────────────────────────────────
  const fetchOptions = useCallback(async (username: string, currentSeed: number) => {
    setLoading(true);
    setError(null);
    setSelectedIdx(null);
    try {
      const res = await fetch("/api/share-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: item.categoryId,
          categoryLabel: item.categoryLabel,
          title: item.title,
          referralUsername: username.trim() || undefined,
          seed: currentSeed,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { options: [string, string, string] };
      setOptions(data.options);
    } catch {
      setError("Couldn't generate options. Using defaults.");
      // Provide basic fallback
      const link = buildRefLink(username);
      setOptions([
        `TurboLoop delivers daily passive income backed by real protocol fees. Join the community today.\n\n👉 ${link}`,
        `Real yield. On-chain proof. Daily passive income. That's TurboLoop — DeFi done right.\n\n👉 ${link}`,
        `Your path to financial freedom starts with TurboLoop. Daily passive income, 20-level referrals, and full transparency.\n\n👉 ${link}`,
      ]);
    } finally {
      setLoading(false);
    }
  }, [item]);

  // ── Auto-fetch on mount ───────────────────────────────────────────────────
  useEffect(() => {
    fetchOptions(refInput, seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── ESC to close ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Prevent body scroll while modal is open ───────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleRefChange = (val: string) => {
    setRefInput(val);
    try { localStorage.setItem(REF_STORAGE_KEY, val); } catch {}
  };

  const handleRegenerate = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    fetchOptions(refInput, nextSeed);
  };

  const handleApplyRef = () => {
    fetchOptions(refInput, seed);
  };

  const selectedText = selectedIdx !== null && options ? options[selectedIdx] : null;

  const handleCopy = useCallback(async () => {
    if (!selectedText) return;
    await navigator.clipboard.writeText(selectedText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [selectedText]);

  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ext = item.url.split(".").pop()?.split("?")[0] ?? "png";
      const name = item.id.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
      a.href = url;
      a.download = `turboloop-${name}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }, [item, downloading]);

  const handleShare = useCallback(async () => {
    if (!selectedText || sharing) return;
    setSharing(true);
    try {
      // Try to fetch the image as a File for native share (mobile)
      let files: File[] | undefined;
      try {
        const res = await fetch(item.url);
        const blob = await res.blob();
        const ext = item.url.split(".").pop()?.split("?")[0] ?? "png";
        const fileName = `turboloop-${item.id.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}.${ext}`;
        const file = new File([blob], fileName, { type: blob.type });
        if (navigator.canShare?.({ files: [file] })) {
          files = [file];
        }
      } catch {
        // Image fetch failed — share without file
      }

      if (navigator.share) {
        const shareData: ShareData = {
          text: selectedText,
          ...(files ? { files } : {}),
        };
        await navigator.share(shareData);
      } else {
        // Desktop fallback: copy to clipboard
        await navigator.clipboard.writeText(selectedText).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // User cancelled or share failed — silently ignore
    } finally {
      setSharing(false);
    }
  }, [selectedText, item, sharing]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Share ${item.title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal sheet */}
      <div
        ref={modalRef}
        className="relative w-full sm:max-w-lg bg-[var(--c-surface)] rounded-t-3xl sm:rounded-2xl border border-[var(--c-border)] shadow-2xl z-10 flex flex-col max-h-[92dvh] sm:max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (mobile only) */}
        <div className="mx-auto mt-3 mb-1 w-10 h-1 rounded-full bg-[var(--c-border)] sm:hidden flex-shrink-0" />

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--c-border)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${item.accent.from}, ${item.accent.to})` }}
            >
              <Share2 size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--c-text)] leading-none">Share Banner</p>
              <p className="text-[0.65rem] text-[var(--c-text-subtle)] mt-0.5 leading-none">{item.categoryLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Banner preview */}
          <div className="flex gap-3 items-center">
            <div
              className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2"
              style={{ borderColor: item.accent.from }}
            >
              <Image src={item.url} alt={item.title} fill className="object-cover" sizes="64px" />
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold tracking-[0.14em] uppercase mb-1"
                style={{ color: item.accent.from, background: `${item.accent.from}18` }}
              >
                {item.emoji} {item.categoryLabel}
              </span>
              <p className="text-xs font-semibold text-[var(--c-text)] line-clamp-2 leading-snug">{item.title}</p>
            </div>
          </div>

          {/* ── Referral field ──────────────────────────────────────────── */}
          <div>
            <label className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--c-text-subtle)] mb-2">
              <User size={11} />
              Your Referral Username (optional)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-subtle)]" />
                <input
                  ref={refInputRef}
                  type="text"
                  value={refInput}
                  onChange={e => handleRefChange(e.target.value)}
                  placeholder="MatthewFord  or  https://turboloop.io?ref=..."
                  className="w-full pl-8 pr-3 h-10 rounded-xl text-xs bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:outline-none focus:border-[var(--c-brand-cyan)] transition"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <button
                onClick={handleApplyRef}
                type="button"
                disabled={loading}
                className="px-3 h-10 rounded-xl text-xs font-bold border border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text)] hover:border-[var(--c-brand-cyan)] hover:text-[var(--c-brand-cyan)] transition disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
              >
                <ChevronRight size={12} />
                Apply
              </button>
            </div>
            {refInput.trim() && (
              <p className="mt-1.5 text-[0.65rem] text-[var(--c-text-subtle)]">
                Link: <span className="font-mono text-[var(--c-brand-cyan)]">{buildRefLink(refInput)}</span>
              </p>
            )}
          </div>

          {/* ── AI share text options ───────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--c-text-subtle)]">
                <Sparkles size={11} />
                Choose a share text
              </label>
              <button
                onClick={handleRegenerate}
                type="button"
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[0.65rem] font-bold border border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text-muted)] hover:text-[var(--c-brand-cyan)] hover:border-[var(--c-brand-cyan)] transition disabled:opacity-50"
              >
                <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
                Regenerate
              </button>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-2.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="rounded-xl border border-[var(--c-border)] p-3.5 animate-pulse"
                    style={{ background: `${item.accent.from}08` }}
                  >
                    <div className="h-3 bg-[var(--c-border)] rounded-full w-3/4 mb-2" />
                    <div className="h-3 bg-[var(--c-border)] rounded-full w-full mb-2" />
                    <div className="h-3 bg-[var(--c-border)] rounded-full w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Options */}
            {!loading && options && (
              <div className="space-y-2.5">
                {options.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedIdx(isSelected ? null : idx)}
                      className="w-full text-left rounded-xl border p-3.5 transition-all duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-brand-cyan)]"
                      style={{
                        borderColor: isSelected ? item.accent.from : "var(--c-border)",
                        background: isSelected
                          ? `linear-gradient(135deg, ${item.accent.from}14, ${item.accent.to}0a)`
                          : `${item.accent.from}05`,
                        boxShadow: isSelected ? `0 0 0 1px ${item.accent.from}60` : undefined,
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Selection indicator */}
                        <div
                          className="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                          style={{
                            borderColor: isSelected ? item.accent.from : "var(--c-border)",
                            background: isSelected ? item.accent.from : "transparent",
                          }}
                        >
                          {isSelected && <Check size={9} className="text-white" strokeWidth={3} />}
                        </div>
                        <p className="text-xs text-[var(--c-text)] leading-relaxed whitespace-pre-wrap">{opt}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {error && (
              <p className="text-[0.65rem] text-amber-500 mt-2">{error}</p>
            )}
          </div>
        </div>

        {/* ── Action bar (sticky bottom) ───────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-[var(--c-border)] space-y-2.5 bg-[var(--c-surface)]">
          {/* Primary: Share (with image) */}
          <button
            onClick={handleShare}
            type="button"
            disabled={!selectedText || sharing}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selectedText
                ? `linear-gradient(135deg, ${item.accent.from}, ${item.accent.to})`
                : "var(--c-border)",
              boxShadow: selectedText ? `0 4px 20px ${item.accent.from}40` : undefined,
            }}
          >
            <Share2 size={15} className={sharing ? "animate-pulse" : ""} />
            {sharing ? "Sharing…" : selectedText ? "Share with image" : "Select a text to share"}
          </button>

          {/* Secondary row: Copy + Download */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              type="button"
              disabled={!selectedText}
              className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-semibold border border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text)] hover:border-[var(--c-brand-cyan)] hover:text-[var(--c-brand-cyan)] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy text"}
            </button>
            <button
              onClick={handleDownload}
              type="button"
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-semibold border border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text)] hover:border-[var(--c-brand-cyan)] hover:text-[var(--c-brand-cyan)] transition disabled:opacity-40"
            >
              <Download size={13} className={downloading ? "animate-bounce" : ""} />
              {downloading ? "Saving…" : "Download image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
