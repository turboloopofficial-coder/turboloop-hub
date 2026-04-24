import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2, X, Check, Copy, Twitter, Send as TelegramIcon, MessageCircle,
  Mail, Wallet, Sparkles, Link as LinkIcon,
} from "lucide-react";
import { buildShareUrl, getReferralCode, setReferralCode } from "@/lib/referral";
import { connectWallet, shortenAddress } from "@/lib/wallet";

type Props = {
  path?: string;
  message: string;
  className?: string;
  label?: string;
  iconSize?: number;
  variant?: "ghost" | "solid" | "icon";
};

export default function ShareButton({
  path = "/",
  message,
  className = "",
  label = "Share",
  iconSize = 16,
  variant = "ghost",
}: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refInput, setRefInput] = useState("");
  const [savedRef, setSavedRef] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    setSavedRef(getReferralCode());
  }, [open]);

  // Lock body scroll when modal is open
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
  const fullMessage = `${message}\n\n${shareUrl}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const onConnect = async () => {
    setConnecting(true);
    const addr = await connectWallet();
    if (addr) setSavedRef(addr);
    setConnecting(false);
  };

  const saveRef = () => {
    if (refInput.trim()) {
      setReferralCode(refInput.trim());
      setSavedRef(refInput.trim());
      setRefInput("");
    }
  };

  const onTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    if (isMobile && (navigator as any).share) {
      (navigator as any).share({ title: "Turbo Loop", text: message, url: shareUrl }).catch(() => setOpen(true));
    } else {
      setOpen(true);
    }
  };

  const encoded = encodeURIComponent(fullMessage);
  const links = [
    { icon: TelegramIcon, label: "Telegram",  color: "#229ED9", url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}` },
    { icon: Twitter,      label: "X",         color: "#0F172A", url: `https://twitter.com/intent/tweet?text=${encoded}` },
    { icon: MessageCircle, label: "WhatsApp", color: "#25D366", url: `https://wa.me/?text=${encoded}` },
    { icon: Mail,         label: "Email",     color: "#475569", url: `mailto:?subject=${encodeURIComponent("Check this out — Turbo Loop")}&body=${encoded}` },
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

  const isWalletAddr = savedRef?.startsWith("0x") || false;

  // Modal rendered via portal so it always lives at <body> level —
  // never trapped inside a parent with transform/filter/backdrop-filter
  // (which would break position:fixed and confine the overlay to the card).
  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
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
              boxShadow: "0 30px 80px -20px rgba(15,23,42,0.4), 0 10px 25px -10px rgba(15,23,42,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
              {/* Top gradient accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: "linear-gradient(90deg, #0891B2, #7C3AED, #EC4899)" }}
              />
              {/* Corner glow */}
              <div
                className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 65%)" }}
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
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                    style={{
                      background: "linear-gradient(135deg, rgba(8,145,178,0.08), rgba(124,58,237,0.08))",
                      border: "1px solid rgba(8,145,178,0.18)",
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-cyan-700" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-700">Share & Earn</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                    Spread the word.
                  </h3>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    {savedRef ? (
                      <>Your referral code is attached — earn rewards when others join through your link.</>
                    ) : (
                      <>Connect your wallet (or enter a code) to earn referral rewards on every share.</>
                    )}
                  </p>
                </div>

                {/* Referral status card */}
                <div
                  className="relative p-4 rounded-2xl mb-5"
                  style={{
                    background: savedRef
                      ? "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(8,145,178,0.04))"
                      : "linear-gradient(135deg, rgba(8,145,178,0.04), rgba(124,58,237,0.04))",
                    border: `1px solid ${savedRef ? "rgba(16,185,129,0.25)" : "rgba(8,145,178,0.15)"}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: savedRef ? "rgba(16,185,129,0.12)" : "rgba(8,145,178,0.1)",
                        color: savedRef ? "#059669" : "#0891B2",
                      }}
                    >
                      {savedRef ? <Check className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-slate-400">
                        {savedRef ? "Connected referral" : "No referral set"}
                      </div>
                      <div className="text-sm font-mono font-semibold text-slate-800 truncate">
                        {savedRef ? (isWalletAddr ? shortenAddress(savedRef) : savedRef) : "Anyone joining will not credit you"}
                      </div>
                    </div>
                    {savedRef && (
                      <button
                        onClick={() => { setReferralCode(""); setSavedRef(null); }}
                        className="text-xs text-slate-400 hover:text-slate-600 transition shrink-0"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {!savedRef && (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <button
                        onClick={onConnect}
                        disabled={connecting}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
                        style={{
                          background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                          boxShadow: "0 6px 18px -4px rgba(8,145,178,0.4)",
                        }}
                      >
                        <Wallet className="w-4 h-4" />
                        {connecting ? "Connecting…" : "Connect Wallet"}
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold">or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={refInput}
                          onChange={(e) => setRefInput(e.target.value)}
                          placeholder="paste referral code or wallet"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
                        />
                        <button
                          onClick={saveRef}
                          disabled={!refInput.trim()}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-sm font-semibold text-slate-700 transition"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Share targets */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {links.map((l) => (
                    <a
                      key={l.label}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ background: `${l.color}12`, color: l.color }}
                      >
                        <l.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] text-slate-700 font-semibold">{l.label}</span>
                    </a>
                  ))}
                </div>

                {/* Copy link button */}
                <button
                  onClick={copy}
                  className="group relative w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all overflow-hidden"
                  style={{
                    background: copied
                      ? "linear-gradient(135deg, #10B981, #059669)"
                      : "linear-gradient(135deg, #0F172A, #1E293B)",
                    color: "white",
                    boxShadow: copied
                      ? "0 10px 25px -8px rgba(16,185,129,0.5)"
                      : "0 10px 25px -8px rgba(15,23,42,0.4)",
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Link copied to clipboard
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4" />
                      Copy link with my referral
                    </>
                  )}
                </button>

                {/* Tiny preview */}
                <details className="mt-4 group">
                  <summary className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-600 transition list-none flex items-center gap-1">
                    <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 12 12">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Preview message
                  </summary>
                  <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-24 overflow-auto">
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
      <button onClick={onTrigger} className={`${btnClass} ${className}`} style={btnStyle} aria-label="Share">
        <Share2 style={{ width: iconSize, height: iconSize }} />
        {variant !== "icon" && <span>{label}</span>}
      </button>
      {typeof document !== "undefined" ? createPortal(modal, document.body) : null}
    </>
  );
}
