import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2, X, Check, Twitter, Send as TelegramIcon, MessageCircle,
  Mail, Sparkles, Link as LinkIcon, Linkedin, Facebook,
} from "lucide-react";
import { buildShareUrl, getReferralCode } from "@/lib/referral";

type Props = {
  path?: string;
  message: string;
  className?: string;
  label?: string;
  iconSize?: number;
  variant?: "ghost" | "solid" | "icon";
  /** Optional title for the modal header (overrides "Spread the word") */
  title?: string;
};

/**
 * Per-platform message tuning.
 * Each platform gets a message style that fits its culture:
 *  - Telegram: emoji-rich, friendly, full link
 *  - X / Twitter: punchy, hashtags, short
 *  - WhatsApp: personal, conversational
 *  - LinkedIn: professional, value-focused
 *  - Facebook: enthusiastic, short
 *  - Email: formal subject + body
 */
function platformMessages(base: string, url: string) {
  // Strip trailing emoji+title block to get a clean base if needed
  const clean = base.trim();
  return {
    telegram: `${clean}\n\n👉 ${url}`,
    twitter: `${clean.length > 200 ? clean.slice(0, 197) + "…" : clean}\n\n${url}\n\n#TurboLoop #DeFi #BSC`,
    whatsapp: `Hey — check this out 👇\n\n${clean}\n\n${url}`,
    linkedin: `${clean}\n\nLearn more: ${url}`,
    facebook: `${clean}\n\n${url}`,
    email: {
      subject: `Check this out — Turbo Loop`,
      body: `${clean}\n\n${url}\n\nSent via Turbo Loop`,
    },
  };
}

export default function ShareButton({
  path = "/",
  message,
  className = "",
  label = "Share",
  iconSize = 16,
  variant = "ghost",
  title = "Spread the word",
}: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedRef, setSavedRef] = useState<string | null>(null);

  useEffect(() => {
    setSavedRef(getReferralCode());
  }, [open]);

  // Lock body scroll when modal is open + Esc to close
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shareUrl = buildShareUrl(path);
  const msgs = platformMessages(message, shareUrl);
  const fullMessage = `${message.trim()}\n\n${shareUrl}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const onTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isMobile =
      typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    if (isMobile && (navigator as any).share) {
      (navigator as any)
        .share({ title: "Turbo Loop", text: message, url: shareUrl })
        .catch(() => setOpen(true));
    } else {
      setOpen(true);
    }
  };

  const platforms = [
    {
      key: "telegram",
      label: "Telegram",
      icon: TelegramIcon,
      color: "#229ED9",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(msgs.telegram)}`,
    },
    {
      key: "twitter",
      label: "X",
      icon: Twitter,
      color: "#0F172A",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(msgs.twitter)}`,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      color: "#25D366",
      url: `https://wa.me/?text=${encodeURIComponent(msgs.whatsapp)}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: Facebook,
      color: "#1877F2",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(msgs.facebook)}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: Linkedin,
      color: "#0A66C2",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(msgs.linkedin)}`,
    },
    {
      key: "email",
      label: "Email",
      icon: Mail,
      color: "#475569",
      url: `mailto:?subject=${encodeURIComponent(msgs.email.subject)}&body=${encodeURIComponent(msgs.email.body)}`,
    },
  ];

  const btnClass =
    variant === "solid"
      ? "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
      : variant === "icon"
      ? "inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-500 bg-white/70 hover:bg-white hover:text-cyan-600 border border-slate-200/60 backdrop-blur-sm transition-all"
      : "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-cyan-700 bg-white/60 hover:bg-white border border-slate-200/60 backdrop-blur-sm transition-all";

  const btnStyle =
    variant === "solid"
      ? { background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)" }
      : undefined;

  // Modal — rendered via portal so transform/filter ancestors can't trap it
  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
          style={{
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden my-auto"
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
              boxShadow:
                "0 30px 80px -20px rgba(15,23,42,0.4), 0 10px 25px -10px rgba(15,23,42,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient accent */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background: "linear-gradient(90deg, #0891B2, #7C3AED, #EC4899)",
              }}
            />

            {/* Corner glow */}
            <div
              className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 65%)",
              }}
            />

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="relative p-7 md:p-8">
              {/* Header */}
              <div className="mb-6">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(8,145,178,0.08), rgba(124,58,237,0.08))",
                    border: "1px solid rgba(8,145,178,0.18)",
                  }}
                >
                  <Sparkles className="w-3 h-3 text-cyan-700" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-700">
                    Share
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                  {title}.
                </h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Pick a platform — the message is pre-formatted for each one.
                  {savedRef && (
                    <span className="block mt-1 text-emerald-600 font-medium">
                      ✓ Your referral{" "}
                      <code className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px]">
                        {savedRef.length > 16 ? savedRef.slice(0, 6) + "…" + savedRef.slice(-4) : savedRef}
                      </code>{" "}
                      is attached.
                    </span>
                  )}
                </p>
              </div>

              {/* Hero copy button */}
              <button
                onClick={copy}
                className="group relative w-full inline-flex items-center justify-center gap-2.5 px-4 py-4 rounded-2xl font-bold text-sm transition-all overflow-hidden mb-5"
                style={{
                  background: copied
                    ? "linear-gradient(135deg, #10B981, #059669)"
                    : "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                  color: "white",
                  boxShadow: copied
                    ? "0 12px 30px -8px rgba(16,185,129,0.5)"
                    : "0 12px 30px -8px rgba(8,145,178,0.5)",
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5" />
                    Copy link & message
                  </>
                )}
              </button>

              {/* Share targets — 3x2 grid */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {platforms.map((p) => (
                  <a
                    key={p.key}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2 p-3 rounded-2xl transition border border-transparent hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${p.color}, ${p.color}dd)`,
                        boxShadow: `0 4px 12px -2px ${p.color}40`,
                      }}
                    >
                      <p.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[11px] text-slate-700 font-bold">
                      {p.label}
                    </span>
                  </a>
                ))}
              </div>

              {/* Native share fallback (mobile) */}
              {typeof navigator !== "undefined" && (navigator as any).share && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    (navigator as any)
                      .share({ title: "Turbo Loop", text: message, url: shareUrl })
                      .catch(() => {});
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition mb-3"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  More options (system share)
                </button>
              )}

              {/* Tiny preview */}
              <details className="group">
                <summary className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-600 transition list-none flex items-center gap-1">
                  <svg
                    className="w-3 h-3 transition-transform group-open:rotate-90"
                    fill="none"
                    viewBox="0 0 12 12"
                  >
                    <path
                      d="M4 2L8 6L4 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Preview message
                </summary>
                <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-32 overflow-auto">
                  {fullMessage}
                </div>
              </details>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={onTrigger}
        className={`${btnClass} ${className}`}
        style={btnStyle}
        aria-label="Share"
      >
        <Share2 style={{ width: iconSize, height: iconSize }} />
        {variant !== "icon" && <span>{label}</span>}
      </button>
      {typeof document !== "undefined"
        ? createPortal(modal, document.body)
        : null}
    </>
  );
}
