// End-of-blog feedback widget — "Was this helpful?" + Telegram CTA.
// State stored in localStorage so a user's vote sticks across sessions.
// No backend needed for v1 — just signal capture for now.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, MessageCircle, Send as TelegramIcon } from "lucide-react";
import type { BlogPalette } from "@/lib/blogVisuals";
import { SITE } from "@/lib/constants";

type Vote = "up" | "down" | null;
const KEY_PREFIX = "tl-blog-vote:";

export default function BlogFeedback({ slug, palette }: { slug: string; palette: BlogPalette }) {
  const [vote, setVote] = useState<Vote>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY_PREFIX + slug);
      if (stored === "up" || stored === "down") setVote(stored);
    } catch { /* ignore */ }
  }, [slug]);

  const cast = (v: "up" | "down") => {
    setVote(v);
    try { localStorage.setItem(KEY_PREFIX + slug, v); } catch { /* ignore */ }
  };

  return (
    <div
      className="mt-12 rounded-3xl p-6 md:p-8"
      style={{
        background: `linear-gradient(135deg, ${palette.from}06, ${palette.via}04)`,
        border: `1px solid ${palette.from}20`,
      }}
    >
      <AnimatePresence mode="wait">
        {!vote ? (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">
              Was this article helpful?
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              Your feedback helps us write better content.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => cast("up")}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: "white",
                  border: `1px solid ${palette.from}25`,
                  color: palette.from,
                  boxShadow: `0 4px 12px -4px ${palette.from}20`,
                }}
              >
                <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Yes, helpful
              </button>
              <button
                onClick={() => cast("down")}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 transition-all duration-300 hover:scale-105"
                style={{
                  background: "white",
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 4px 12px -4px rgba(15,23,42,0.06)",
                }}
              >
                <ThumbsDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Not really
              </button>
            </div>
          </motion.div>
        ) : vote === "up" ? (
          <motion.div
            key="up"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.via})` }}
              >
                <ThumbsUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Thanks for the feedback! 🙌</h3>
                <p className="text-sm text-slate-500">Want to go deeper? Join the community.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href={SITE.socials.telegramCommunity}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #229ED9, #0891B2)",
                  color: "white",
                  boxShadow: "0 8px 20px -6px rgba(34,158,217,0.5)",
                }}
              >
                <TelegramIcon className="w-4 h-4" />
                Join Telegram
              </a>
              <a
                href="/feed"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-700 transition-all duration-300"
                style={{
                  background: "white",
                  border: "1px solid rgba(15,23,42,0.08)",
                }}
              >
                More articles
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="down"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(15,23,42,0.06)" }}
              >
                <MessageCircle className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tell us what to fix</h3>
                <p className="text-sm text-slate-500">
                  Drop a message in our Telegram chat — we read every one and update articles based on real feedback.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href={SITE.socials.telegramChat}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #229ED9, #0891B2)",
                  color: "white",
                  boxShadow: "0 8px 20px -6px rgba(34,158,217,0.5)",
                }}
              >
                <TelegramIcon className="w-4 h-4" />
                Tell us in Telegram
              </a>
              <button
                onClick={() => { setVote(null); try { localStorage.removeItem(KEY_PREFIX + slug); } catch {} }}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Change vote
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
