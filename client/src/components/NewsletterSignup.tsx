// Public newsletter signup widget. Used in the footer and as a homepage section.
// POSTs to trpc.newsletter.signup — collects emails into the newsletter_signups
// table. The team can export to CSV via Neon and import into Mailchimp/Resend
// when they're ready to actually send. No service integration here.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Check, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Props {
  /** Surface this widget is on — recorded in DB so we can attribute signups */
  source: "homepage" | "footer" | "blog" | "films" | "library" | "other";
  /** Visual variant: "card" = bordered block (homepage), "inline" = compact (footer) */
  variant?: "card" | "inline";
  /** Optional override for the headline */
  headline?: string;
  /** Optional override for the subline */
  subline?: string;
}

export default function NewsletterSignup({
  source,
  variant = "card",
  headline,
  subline,
}: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const signup = trpc.newsletter.signup.useMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      await signup.mutateAsync({ email: trimmed, source });
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    }
  };

  const success = signup.isSuccess;
  const submitting = signup.isPending;

  // ─── Inline variant (footer) — single row ───
  if (variant === "inline") {
    return (
      <div className="w-full">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success-inline"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-300"
            >
              <Check className="w-4 h-4" />
              You're in. Check your inbox for our next update.
            </motion.div>
          ) : (
            <motion.form
              key="form-inline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={submit}
              className="flex items-stretch gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={submitting}
                aria-label="Email address for newsletter signup"
                autoComplete="email"
                required
                className="flex-1 px-4 py-2.5 rounded-xl text-base outline-none transition"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-3 rounded-xl text-base font-bold transition disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                  color: "white",
                  boxShadow: "0 4px 14px -4px rgba(8,145,178,0.5)",
                }}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  // ─── Card variant (homepage / dedicated section) — premium block ───
  return (
    <section className="py-16 md:py-20">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 60px -20px rgba(15,23,42,0.4)",
          }}
        >
          {/* Decorative glows */}
          <div
            className="absolute -top-32 -left-32 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 backdrop-blur-md"
              style={{
                background: "rgba(34,211,238,0.12)",
                border: "1px solid rgba(34,211,238,0.25)",
              }}
            >
              <Mail className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-cyan-300">
                Newsletter
              </span>
            </div>

            <h2
              className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {headline || "Stay in the loop."}
            </h2>
            <p className="text-base md:text-lg text-slate-300 mb-7 leading-relaxed max-w-xl">
              {subline ||
                "One update per week — new films, blog posts, and what's happening in the community. No hype, no spam, easy to unsubscribe."}
            </p>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl"
                  style={{
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.3)",
                  }}
                >
                  <Check className="w-5 h-5 text-emerald-300 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-emerald-300">
                      You're subscribed.
                    </div>
                    <div className="text-xs text-emerald-200/80 mt-0.5">
                      Watch your inbox — first update goes out within 7 days.
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={submit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={submitting}
                    autoComplete="email"
                    aria-label="Email address for newsletter signup"
                    required
                    className="flex-1 px-5 py-3.5 rounded-xl text-base outline-none transition"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    style={{
                      background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                      color: "white",
                      boxShadow: "0 8px 22px -6px rgba(8,145,178,0.5)",
                    }}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <p className="mt-5 text-xs text-slate-500">
              We never share your email. Unsubscribe with one click anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
