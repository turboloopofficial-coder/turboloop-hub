/**
 * UTM Link Generator — allows community members to create trackable referral links.
 *
 * Problem: 77% of traffic shows as "Direct" because links shared in WhatsApp/Telegram
 * strip referrer headers. This tool appends UTM parameters so GA4 can properly attribute
 * the traffic source.
 *
 * Usage: Embedded on the /community page and accessible from the share modals.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Link2, Share2, Sparkles } from "lucide-react";
import { trackUTMLinkGenerated } from "@/lib/analytics-events";

const PLATFORMS = [
  { id: "telegram", label: "Telegram", icon: "💬" },
  { id: "whatsapp", label: "WhatsApp", icon: "📱" },
  { id: "twitter", label: "X / Twitter", icon: "🐦" },
  { id: "facebook", label: "Facebook", icon: "📘" },
  { id: "youtube", label: "YouTube", icon: "▶️" },
  { id: "instagram", label: "Instagram", icon: "📷" },
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "email", label: "Email", icon: "✉️" },
  { id: "other", label: "Other", icon: "🔗" },
] as const;

const CAMPAIGNS = [
  { id: "referral", label: "Referral Share" },
  { id: "community_call", label: "Community Call" },
  { id: "tutorial", label: "Tutorial / How-to" },
  { id: "promotion", label: "Promotion / Offer" },
  { id: "news", label: "News / Update" },
] as const;

interface Props {
  /** The base URL to generate UTM links for */
  baseUrl?: string;
  /** Compact mode for embedding in modals */
  compact?: boolean;
}

export default function UTMLinkGenerator({
  baseUrl = "https://turboloop.tech",
  compact = false,
}: Props) {
  const [platform, setPlatform] = useState<string>("telegram");
  const [campaign, setCampaign] = useState<string>("referral");
  const [customTag, setCustomTag] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState<string>("/");

  const PAGES = [
    { path: "/", label: "Homepage" },
    { path: "/ecosystem", label: "Ecosystem" },
    { path: "/security", label: "Security" },
    { path: "/community", label: "Community" },
    { path: "/learn", label: "DeFi 101" },
    { path: "/films", label: "Films" },
    { path: "/promotions", label: "Promotions" },
  ];

  const generatedUrl = useCallback(() => {
    const params = new URLSearchParams({
      utm_source: platform,
      utm_medium: "community_share",
      utm_campaign: campaign,
      ...(customTag ? { utm_content: customTag.replace(/\s+/g, "_").toLowerCase() } : {}),
    });
    return `${baseUrl}${page}?${params.toString()}`;
  }, [platform, campaign, customTag, page, baseUrl]);

  const handleCopy = async () => {
    const url = generatedUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackUTMLinkGenerated(`${platform}_${campaign}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      trackUTMLinkGenerated(`${platform}_${campaign}`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden ${compact ? "p-4" : "p-6 sm:p-8"}`}
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(8,145,178,0.1)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(124,58,237,0.1))",
          }}
        >
          <Link2 className="h-5 w-5 text-cyan-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Trackable Link Generator
          </h3>
          <p className="text-xs text-slate-500">
            Create links that track where your referrals come from
          </p>
        </div>
      </div>

      {/* Page selector */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
          Page to Share
        </label>
        <div className="flex flex-wrap gap-2">
          {PAGES.map((p) => (
            <button
              key={p.path}
              onClick={() => setPage(p.path)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                page === p.path
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platform selector */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
          Where are you sharing?
        </label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                platform === p.id
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign type */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
          Campaign Type
        </label>
        <div className="flex flex-wrap gap-2">
          {CAMPAIGNS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCampaign(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                campaign === c.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom tag */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
          Your Name / Tag (optional)
        </label>
        <input
          type="text"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          placeholder="e.g. john_doe or team_india"
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
        />
      </div>

      {/* Generated URL */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
          Your Trackable Link
        </label>
        <div
          className="flex items-center gap-2 p-3 rounded-xl"
          style={{
            background: "rgba(8,145,178,0.04)",
            border: "1px solid rgba(8,145,178,0.12)",
          }}
        >
          <code className="flex-1 text-xs text-slate-700 break-all font-mono">
            {generatedUrl()}
          </code>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 p-2 rounded-lg transition-all hover:bg-cyan-100"
            title="Copy link"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="h-4 w-4 text-cyan-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Info box */}
      <div
        className="flex items-start gap-2 p-3 rounded-xl text-xs text-slate-500"
        style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.08)" }}
      >
        <Sparkles className="h-3.5 w-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
        <span>
          Using this link instead of the plain URL helps us see which platforms and community
          members drive the most traffic. Your shares will show up in our analytics dashboard
          instead of being counted as "Direct" traffic.
        </span>
      </div>
    </div>
  );
}
