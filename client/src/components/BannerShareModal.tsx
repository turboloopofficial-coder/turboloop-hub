// ── BannerShareModal ──────────────────────────────────────────────────────
// Advanced share modal for homepage Creative Explorer banner cards.
// Features: AI caption variants, referral username field, platform sharing,
// download, and copy text.
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Check, Download, Copy, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getReferralCode, setReferralCode, buildShareUrl } from "@/lib/referral";
import captionsData from "@/lib/campaign-captions.json";

interface BannerItem {
  url: string;
  alt: string;
  title: string;
  category: string;
  filename?: string;
}

interface Props {
  banner: BannerItem;
  language?: string;
  onClose: () => void;
}

// Derive caption key from banner: "category/filename"
function getCaptionKey(banner: BannerItem): string {
  const filename = banner.filename ?? banner.url.split("/").pop() ?? "";
  return `${banner.category}/${filename}`;
}

// Get stored caption from the JSON file
function getStoredCaption(banner: BannerItem): string {
  const key = getCaptionKey(banner);
  const entry = (captionsData as Record<string, { caption?: string; shareText?: string }>)[key];
  return entry?.caption ?? entry?.shareText ?? "";
}

const PLATFORMS = [
  { id: "telegram", label: "Telegram", color: "#229ED9", icon: "✈️" },
  { id: "whatsapp", label: "WhatsApp", color: "#25D366", icon: "💬" },
  { id: "twitter", label: "X / Twitter", color: "#1DA1F2", icon: "𝕏" },
  { id: "facebook", label: "Facebook", color: "#1877F2", icon: "f" },
];

function buildPlatformUrl(platform: string, text: string, imageUrl: string): string {
  const encoded = encodeURIComponent(text);
  switch (platform) {
    case "telegram":
      return `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${encoded}`;
    case "whatsapp":
      return `https://wa.me/?text=${encoded}%20${encodeURIComponent(imageUrl)}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encoded}&url=${encodeURIComponent(imageUrl)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encoded}`;
    default:
      return "#";
  }
}

export function BannerShareModal({ banner, language = "english", onClose }: Props) {
  const storedCaption = getStoredCaption(banner);
  const [captions, setCaptions] = useState<string[]>(
    storedCaption ? [storedCaption] : ["Loading captions..."]
  );
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [refInput, setRefInput] = useState(getReferralCode() ?? "");
  const [refApplied, setRefApplied] = useState(!!getReferralCode());
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const generateMutation = trpc.shareText.generate.useMutation({
    onSuccess: (data) => {
      if (data.captions.length > 0) {
        setCaptions(data.captions);
        setSelectedIdx(0);
      }
    },
  });

  // Auto-generate captions on mount
  useEffect(() => {
    generateMutation.mutate({
      bannerTitle: banner.title,
      category: banner.category,
      language,
      existingCaption: storedCaption || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = useCallback(() => {
    generateMutation.mutate({
      bannerTitle: banner.title,
      category: banner.category,
      language,
      existingCaption: storedCaption || undefined,
    });
  }, [banner, language, storedCaption, generateMutation]);

  const handleApplyRef = useCallback(() => {
    if (refInput.trim()) {
      setReferralCode(refInput.trim());
      setRefApplied(true);
    }
  }, [refInput]);

  const selectedCaption = captions[selectedIdx] ?? "";
  const shareUrl = buildShareUrl("/");
  const fullShareText = `${selectedCaption}\n\n${shareUrl}`;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(fullShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullShareText]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch(banner.url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = banner.url.split("/").pop() ?? "turboloop-banner.png";
      a.click();
    } catch {
      window.open(banner.url, "_blank");
    } finally {
      setDownloading(false);
    }
  }, [banner.url]);

  const isLoading = generateMutation.isPending;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      >
        <motion.div
          className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              <img
                src={banner.url}
                alt={banner.alt}
                className="w-12 h-12 rounded-lg object-cover"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#06b6d4" }}>
                  Share Banner
                </p>
                <p className="text-sm font-medium text-white leading-tight mt-0.5 line-clamp-1">
                  {banner.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)" }}
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-4 pb-5 space-y-4">
            {/* Referral field */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Your Referral Username (Optional)
              </p>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>🔗</span>
                  <input
                    type="text"
                    value={refInput}
                    onChange={(e) => { setRefInput(e.target.value); setRefApplied(false); }}
                    placeholder="YourUsername"
                    className="flex-1 bg-transparent outline-none text-white placeholder-white/30 text-sm"
                  />
                </div>
                <button
                  onClick={handleApplyRef}
                  className="px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: refApplied ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.08)",
                    border: `1px solid ${refApplied ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.12)"}`,
                    color: refApplied ? "#06b6d4" : "white",
                  }}
                >
                  {refApplied ? <Check size={14} /> : "Apply"}
                </button>
              </div>
              {refApplied && refInput && (
                <p className="text-xs mt-1" style={{ color: "#06b6d4" }}>
                  Link: turboloop.tech?ref={refInput}
                </p>
              )}
            </div>

            {/* Caption selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                  ✨ Choose a Share Text
                </p>
                <button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: isLoading ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
                  }}
                >
                  <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
                  Regenerate
                </button>
              </div>

              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex items-center gap-2 px-3 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <RefreshCw size={14} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Generating captions...</span>
                  </div>
                ) : (
                  captions.map((cap, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIdx(i)}
                      className="w-full text-left px-3 py-3 rounded-xl text-sm transition-all"
                      style={{
                        background: selectedIdx === i ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${selectedIdx === i ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.08)"}`,
                        color: selectedIdx === i ? "white" : "rgba(255,255,255,0.65)",
                      }}
                    >
                      {selectedIdx === i && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full mr-2" style={{ background: "#06b6d4" }}>
                          <Check size={10} color="white" />
                        </span>
                      )}
                      {cap}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Platform share buttons */}
            <div className="grid grid-cols-4 gap-2">
              {PLATFORMS.map((p) => (
                <a
                  key={p.id}
                  href={buildPlatformUrl(p.id, selectedCaption, banner.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  <span className="text-lg leading-none">{p.icon}</span>
                  <span>{p.label}</span>
                </a>
              ))}
            </div>

            {/* Share with image button */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ text: fullShareText, url: banner.url }).catch(() => {});
                } else {
                  window.open(buildPlatformUrl("telegram", selectedCaption, banner.url), "_blank");
                }
              }}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #7c3aed)",
                color: "white",
                boxShadow: "0 8px 24px rgba(6,182,212,0.3)",
              }}
            >
              <ExternalLink size={16} />
              Share with Image
            </button>

            {/* Copy text + Download */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: copied ? "#06b6d4" : "rgba(255,255,255,0.8)",
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
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                <Download size={14} />
                {downloading ? "Downloading..." : "Download image"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
