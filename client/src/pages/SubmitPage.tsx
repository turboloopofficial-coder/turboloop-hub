// /submit — community submits testimonials, photos, reels, stories.
// Submissions land in the content_submissions table with status=pending.
// Admin moderates via /admin (separate page). Approved → eventually featured
// on /community wall (manual surfacing for now — admin chooses what to highlight).

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, MessageSquare, Camera, Film, BookOpen } from "lucide-react";
import PageShell from "@/components/PageShell";
import AnimatedSection from "@/components/AnimatedSection";
import { trpc } from "@/lib/trpc";

type SubmissionType = "testimonial" | "photo" | "reel" | "story";

const TYPE_OPTIONS: Array<{ value: SubmissionType; label: string; description: string; icon: typeof MessageSquare }> = [
  { value: "testimonial", label: "Testimonial",  description: "A few sentences about your experience with TurboLoop", icon: MessageSquare },
  { value: "story",       label: "Your Story",    description: "A longer narrative — your journey, the moment it clicked", icon: BookOpen },
  { value: "photo",       label: "Photo",         description: "A meetup pic, your country group, your screen", icon: Camera },
  { value: "reel",        label: "Video / Reel",  description: "A short video — link to where it's hosted", icon: Film },
];

const COUNTRIES = [
  "🇮🇳 India", "🇩🇪 Germany", "🇳🇬 Nigeria", "🇮🇩 Indonesia", "🇹🇷 Turkey", "🇧🇷 Brazil",
  "🇵🇰 Pakistan", "🇧🇩 Bangladesh", "🇪🇬 Egypt", "🇰🇪 Kenya", "🇿🇦 South Africa",
  "🇲🇽 Mexico", "🇦🇷 Argentina", "🇵🇭 Philippines", "🇻🇳 Vietnam", "🇲🇾 Malaysia",
  "🇺🇸 USA", "🇬🇧 UK", "🇫🇷 France", "🇮🇹 Italy", "🇪🇸 Spain", "🇨🇦 Canada",
  "🌍 Other",
];

export default function SubmitPage() {
  const [type, setType] = useState<SubmissionType>("testimonial");
  const [authorName, setAuthorName] = useState("");
  const [authorContact, setAuthorContact] = useState("");
  const [authorCountry, setAuthorCountry] = useState("");
  const [body, setBody] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = trpc.submissions.submit.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (body.trim().length < 10) {
      setError("Please write at least 10 characters in the body field.");
      return;
    }
    if (!authorName.trim()) {
      setError("Please enter your name.");
      return;
    }
    try {
      await submit.mutateAsync({
        type,
        authorName: authorName.trim(),
        authorContact: authorContact.trim() || undefined,
        authorCountry: authorCountry.trim() || undefined,
        body: body.trim(),
        fileUrl: fileUrl.trim() || undefined,
      });
    } catch (err: any) {
      setError(err?.message || "Submission failed. Please try again.");
    }
  };

  const success = submit.isSuccess;
  const submitting = submit.isPending;
  const reset = () => {
    setType("testimonial");
    setAuthorName("");
    setAuthorContact("");
    setAuthorCountry("");
    setBody("");
    setFileUrl("");
    setError(null);
    submit.reset();
  };

  return (
    <PageShell
      title="Submit Your Story"
      description="Share your TurboLoop experience — testimonials, photos, videos, and stories from the community. We feature the best on the hub."
      path="/submit"
      hero={{
        label: "Share Your Voice",
        heading: "Got a story worth sharing?",
        subtitle: "Send us your testimonial, photo, video, or full story. We feature the best on /community and across our channels.",
        palette: ["#0891B2", "#22D3EE", "#7C3AED"],
        emoji: "✍️",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Submit Your Story — Turbo Loop",
        url: "https://turboloop.tech/submit",
        description: "Submit testimonials, photos, videos, and stories to the Turbo Loop community.",
      }}
      related={[
        { label: "Community", href: "/community", emoji: "🌍", description: "Where your story might appear" },
        { label: "Creatives", href: "/creatives", emoji: "🎨", description: "141 ready-made banners to share" },
        { label: "Films", href: "/films", emoji: "🎬", description: "20-film cinematic universe" },
      ]}
    >
      <div className="container max-w-2xl pb-16">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-10 md:p-14 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,211,238,0.06))",
                border: "1px solid rgba(34,197,94,0.25)",
              }}
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #22C55E, #10B981)" }}
              >
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                Got it. Thank you.
              </h2>
              <p className="text-slate-600 mb-7 max-w-md mx-auto leading-relaxed">
                We'll review your submission within 48 hours. If it gets featured, we'll reach out via the contact you provided.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={reset}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #0891B2, #7C3AED)", color: "white", boxShadow: "0 8px 22px -6px rgba(8,145,178,0.4)" }}
                >
                  Submit another
                </button>
                <a href="/community" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 transition"
                  style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.08)" }}
                >
                  Visit /community
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-7"
            >
              {/* Type picker */}
              <AnimatedSection>
                <div>
                  <label className="block text-xs font-bold tracking-[0.2em] uppercase text-slate-500 mb-3">
                    What are you sharing?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TYPE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const active = type === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setType(opt.value)}
                          className="relative flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all"
                          style={{
                            background: active ? "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(124,58,237,0.08))" : "white",
                            border: `1.5px solid ${active ? "rgba(8,145,178,0.4)" : "rgba(15,23,42,0.08)"}`,
                            boxShadow: active ? "0 4px 14px -4px rgba(8,145,178,0.2)" : "0 2px 6px -2px rgba(15,23,42,0.04)",
                          }}
                        >
                          <Icon className={`w-5 h-5 ${active ? "text-cyan-700" : "text-slate-400"}`} />
                          <div className={`text-xs font-bold ${active ? "text-cyan-800" : "text-slate-700"}`}>{opt.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{TYPE_OPTIONS.find((o) => o.value === type)?.description}</p>
                </div>
              </AnimatedSection>

              {/* Author info */}
              <AnimatedSection delay={0.05}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-2">Your name *</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      maxLength={200}
                      placeholder="First + last (or just a handle)"
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none transition"
                      style={{ border: "1px solid rgba(15,23,42,0.08)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-2">Country</label>
                    <select
                      value={authorCountry}
                      onChange={(e) => setAuthorCountry(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none transition"
                      style={{ border: "1px solid rgba(15,23,42,0.08)" }}
                    >
                      <option value="">— pick yours —</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.08}>
                <div>
                  <label className="block text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-2">
                    Email or Telegram (optional)
                  </label>
                  <input
                    type="text"
                    value={authorContact}
                    onChange={(e) => setAuthorContact(e.target.value)}
                    maxLength={320}
                    placeholder="So we can reach out if we feature you"
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none transition"
                    style={{ border: "1px solid rgba(15,23,42,0.08)" }}
                  />
                </div>
              </AnimatedSection>

              {/* Body */}
              <AnimatedSection delay={0.1}>
                <div>
                  <label className="block text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-2">
                    {type === "photo" || type === "reel" ? "Caption / context *" : "Your message *"}
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    minLength={10}
                    maxLength={5000}
                    rows={6}
                    placeholder={
                      type === "testimonial" ? "What's your TurboLoop experience? A few honest sentences."
                        : type === "story" ? "Tell the longer version. When did it click? What changed?"
                        : type === "photo" ? "Describe the photo — meetup, country group, your setup..."
                        : "Describe the video — what's it about?"
                    }
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none transition resize-y"
                    style={{ border: "1px solid rgba(15,23,42,0.08)", minHeight: "150px" }}
                  />
                  <div className="text-[11px] text-slate-400 mt-1.5 text-right">{body.length} / 5000</div>
                </div>
              </AnimatedSection>

              {/* File URL (only for photo/reel) */}
              {(type === "photo" || type === "reel") && (
                <AnimatedSection delay={0.12}>
                  <div>
                    <label className="block text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-2">
                      {type === "photo" ? "Photo URL" : "Video URL"}
                    </label>
                    <input
                      type="url"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      maxLength={1000}
                      placeholder={type === "photo" ? "https://imgur.com/..." : "https://youtube.com/... or https://t.me/..."}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none transition"
                      style={{ border: "1px solid rgba(15,23,42,0.08)" }}
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {type === "photo" ? "Upload to imgur.com (free, no account) and paste link here." : "Paste a YouTube, Telegram, or other public link to your video."}
                    </p>
                  </div>
                </AnimatedSection>
              )}

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm text-red-700"
                  style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {error}
                </div>
              )}

              <AnimatedSection delay={0.15}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-bold transition hover:scale-[1.01] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                    color: "white",
                    boxShadow: "0 12px 30px -8px rgba(8,145,178,0.5)",
                  }}
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send my submission"}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-3">
                  We review every submission. If yours is featured, we'll let you know via the contact above.
                </p>
              </AnimatedSection>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
