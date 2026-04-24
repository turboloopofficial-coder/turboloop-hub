import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Check, Copy, Twitter, Send as TelegramIcon, MessageCircle, Mail, Link as LinkIcon } from "lucide-react";
import { buildShareUrl, getReferralCode, setReferralCode } from "@/lib/referral";

type Props = {
  /** Path relative to site root, e.g. "/feed" or "/blog/my-slug" or "/" */
  path?: string;
  /** Text that appears before the URL in shared messages */
  message: string;
  /** Optional className for the trigger button */
  className?: string;
  /** Label next to the share icon (default: "Share") */
  label?: string;
  /** Size of the icon (default 16) */
  iconSize?: number;
  /** Variant: "ghost" (outline), "solid" (filled), "icon" (icon only) */
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

  useEffect(() => {
    setSavedRef(getReferralCode());
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

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Turbo Loop", text: message, url: shareUrl });
      } catch {}
    } else {
      setOpen(true);
    }
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
    // On mobile, prefer native share sheet; on desktop, open our modal
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    if (isMobile && navigator.share) {
      nativeShare();
    } else {
      setOpen(true);
    }
  };

  const encoded = encodeURIComponent(fullMessage);
  const links = [
    { icon: TelegramIcon, label: "Telegram", color: "#229ED9", url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}` },
    { icon: Twitter, label: "X / Twitter", color: "#000000", url: `https://twitter.com/intent/tweet?text=${encoded}` },
    { icon: MessageCircle, label: "WhatsApp", color: "#25D366", url: `https://wa.me/?text=${encoded}` },
    { icon: Mail, label: "Email", color: "#475569", url: `mailto:?subject=${encodeURIComponent("Check this out — Turbo Loop")}&body=${encoded}` },
  ];

  const btnClass =
    variant === "solid"
      ? "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
      : variant === "icon"
      ? "inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-500 bg-white/70 hover:bg-white hover:text-cyan-600 border border-slate-200/60 backdrop-blur-sm transition-all"
      : "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-cyan-700 bg-white/60 hover:bg-white border border-slate-200/60 backdrop-blur-sm transition-all";

  const btnStyle = variant === "solid"
    ? { background: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)" }
    : undefined;

  return (
    <>
      <button onClick={onTrigger} className={`${btnClass} ${className}`} style={btnStyle} aria-label="Share">
        <Share2 style={{ width: iconSize, height: iconSize }} />
        {variant !== "icon" && <span>{label}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              <h3 className="text-xl font-bold text-slate-800 mb-1">Share</h3>
              <p className="text-sm text-slate-500 mb-5">
                {savedRef ? (
                  <>Shared links include your referral code <span className="font-mono font-semibold text-cyan-700">{savedRef}</span>.</>
                ) : (
                  <>Add your referral code to earn rewards from shares.</>
                )}
              </p>

              {/* Referral setter */}
              <div className="mb-5">
                <label className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                  Your referral code
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    placeholder={savedRef || "your-code-or-wallet"}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                  />
                  <button
                    onClick={saveRef}
                    disabled={!refInput.trim()}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-sm font-medium text-slate-700 transition"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="mb-4">
                <label className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                  Message preview
                </label>
                <div className="mt-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap break-words max-h-32 overflow-auto">
                  {fullMessage}
                </div>
              </div>

              {/* Share targets */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-50 transition"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: `${l.color}15`, color: l.color }}
                    >
                      <l.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium">{l.label}</span>
                  </a>
                ))}
              </div>

              {/* Copy link */}
              <button
                onClick={copy}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: copied ? "linear-gradient(135deg, #22C55E, #16A34A)" : "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                  color: "white",
                }}
              >
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy message + link</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
