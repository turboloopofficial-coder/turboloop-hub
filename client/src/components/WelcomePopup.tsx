import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ExternalLink } from "lucide-react";
import { SITE } from "@/lib/constants";
import { trpc } from "@/lib/trpc";

export default function WelcomePopup() {
  const [open, setOpen] = useState(false);

  // Fetch admin-configurable welcome message
  const { data: welcomeTitle, isLoading: isLoadingTitle } =
    trpc.content.setting.useQuery(
      { key: "welcome_title" },
      { staleTime: 60000 }
    );
  const { data: welcomeMessage, isLoading: isLoadingMessage } =
    trpc.content.setting.useQuery(
      { key: "welcome_message" },
      { staleTime: 60000 }
    );

  useEffect(() => {
    // Wait for tRPC data to land before showing the modal — otherwise the
    // popup renders with the fallback copy and visibly resizes when the
    // admin's longer/shorter text arrives. By gating on isLoading we render
    // exactly once with the final content.
    if (isLoadingTitle || isLoadingMessage) return;
    // Only show once per session
    const seen = sessionStorage.getItem("turboloop_welcome_seen");
    if (!seen) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoadingTitle, isLoadingMessage]);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("turboloop_welcome_seen", "1");
  };

  const title = welcomeTitle || "Welcome to TurboLoop Tech Hub";
  const message =
    welcomeMessage ||
    `Turbo Loop is the complete DeFi ecosystem on Binance Smart Chain — offering sustainable yield farming, a fiat-to-crypto gateway, decentralized swaps, and a powerful referral network.\n\nExplore our community hub to discover educational videos, blog articles, upcoming events, and the latest promotions. Whether you're new to DeFi or an experienced investor, Turbo Loop is designed to be transparent, secure, and open to everyone.\n\nJoin thousands of community members across 100+ countries building the future of decentralized finance.`;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100]"
            style={{
              background: "rgba(0,0,0,0.2)",
              backdropFilter: "blur(4px)",
            }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center px-5 py-6"
          >
            <div
              className="relative w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow:
                  "0 25px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(8,145,178,0.08)",
              }}
            >
              {/* Top accent gradient */}
              <div
                className="h-1.5"
                style={{
                  background:
                    "linear-gradient(90deg, #0891B2, #7C3AED, #0891B2)",
                }}
              />

              {/* Close button */}
              <button
                onClick={handleClose}
                aria-label="Close welcome popup"
                className="absolute top-3 right-3 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="px-8 pt-8 pb-8">
                {/* Icon + Badge */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(124,58,237,0.1))",
                      border: "1px solid rgba(8,145,178,0.15)",
                    }}
                  >
                    <Sparkles className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
                      style={{
                        background: "rgba(8,145,178,0.08)",
                        color: "#0891B2",
                        border: "1px solid rgba(8,145,178,0.12)",
                      }}
                    >
                      Community Hub
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2
                  className="text-2xl font-bold text-slate-800 mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {title}
                </h2>

                {/* Message */}
                <div className="text-sm text-slate-500 leading-relaxed space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                  {message
                    .split("\n")
                    .filter(Boolean)
                    .map((paragraph: string, i: number) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:brightness-110"
                    style={{
                      background: "linear-gradient(135deg, #0891B2, #0E7490)",
                      color: "#ffffff",
                      boxShadow: "0 4px 20px rgba(8,145,178,0.25)",
                    }}
                  >
                    Explore the Hub
                  </button>
                  <a
                    href={SITE.mainApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-600 transition-all duration-300 hover:text-slate-800"
                    style={{
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(255,255,255,0.6)",
                    }}
                  >
                    Launch App <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
