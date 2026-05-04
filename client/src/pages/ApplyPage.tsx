// /apply — in-app application form for the Creator Star + Local Presenter
// programs that /promotions advertises. Reuses the existing submissions
// table (with `type` set to creator_apply or presenter_apply) so admin
// moderates from the same dashboard at /admin.
//
// This replaces the "apply via Telegram" friction-fest. Visitors see the
// premium feel of an in-app form, and you get structured leads with name,
// region, samples, and the why instead of a free-form chat.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Star, Mic } from "lucide-react";
import PageShell from "@/components/PageShell";
import AnimatedSection from "@/components/AnimatedSection";
import ShareButton from "@/components/ShareButton";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

type Program = "creator_apply" | "presenter_apply";

const PROGRAMS = [
  {
    id: "creator_apply" as Program,
    label: "Creator Star",
    icon: Star,
    headline: "$10–$100 per video that performs.",
    description:
      "We pay creators per view. Reels, explainer videos, livestreams — anything that brings new eyes to the ecosystem.",
    bodyLabel: "Your content + why you?",
    bodyPlaceholder:
      "Links to 1-3 of your best videos. What's your niche? What's your reach? Why is your audience right for TurboLoop?",
    fileLabel: "Best content sample (URL)",
    filePlaceholder: "https://youtube.com/... or https://instagram.com/p/...",
  },
  {
    id: "presenter_apply" as Program,
    label: "Local Presenter",
    icon: Mic,
    headline: "$100/month to host weekly Zoom sessions.",
    description:
      "Lead a community in your language. We provide the deck, the schedule, and the support — you bring the energy.",
    bodyLabel: "Tell us about you",
    bodyPlaceholder:
      "What languages can you host in? Have you done public speaking / streaming before? Roughly how many people are in your local crypto community?",
    fileLabel: "Past Zoom or stream link (optional)",
    filePlaceholder: "https://zoom.us/rec/... or any past hosting clip",
  },
];

const COUNTRIES = [
  "🇮🇳 India",
  "🇩🇪 Germany",
  "🇳🇬 Nigeria",
  "🇮🇩 Indonesia",
  "🇹🇷 Turkey",
  "🇧🇷 Brazil",
  "🇵🇰 Pakistan",
  "🇧🇩 Bangladesh",
  "🇪🇬 Egypt",
  "🇰🇪 Kenya",
  "🇿🇦 South Africa",
  "🇲🇽 Mexico",
  "🇦🇷 Argentina",
  "🇵🇭 Philippines",
  "🇻🇳 Vietnam",
  "🇲🇾 Malaysia",
  "🇺🇸 USA",
  "🇬🇧 UK",
  "🇫🇷 France",
  "🇮🇹 Italy",
  "🇪🇸 Spain",
  "🇨🇦 Canada",
  "🌍 Other",
];

const SUBMISSION_IDS_KEY = "turboloop_submission_ids";

function rememberSubmission(id: number) {
  try {
    const existing = JSON.parse(localStorage.getItem(SUBMISSION_IDS_KEY) || "[]");
    const set = new Set<number>(Array.isArray(existing) ? existing : []);
    set.add(id);
    localStorage.setItem(SUBMISSION_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export default function ApplyPage() {
  const [program, setProgram] = useState<Program>("creator_apply");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [country, setCountry] = useState("");
  const [body, setBody] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = trpc.submissions.submit.useMutation({
    onSuccess: data => {
      if (data?.id) rememberSubmission(data.id);
    },
  });

  const current = PROGRAMS.find(p => p.id === program)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Please enter your name.");
    if (!contact.trim())
      return setError("Please give us an email or Telegram handle to reach you.");
    if (body.trim().length < 30)
      return setError("Tell us a bit more (at least 30 characters).");
    try {
      await submit.mutateAsync({
        type: program,
        authorName: name.trim(),
        authorContact: contact.trim(),
        authorCountry: country.trim() || undefined,
        body: body.trim(),
        fileUrl: fileUrl.trim() || undefined,
      });
    } catch (err: any) {
      setError(err?.message || "Application failed. Please try again.");
    }
  };

  const success = submit.isSuccess;
  const submitting = submit.isPending;
  const reset = () => {
    setName("");
    setContact("");
    setCountry("");
    setBody("");
    setFileUrl("");
    setError(null);
    submit.reset();
  };

  return (
    <PageShell
      title="Apply — Creator Star & Local Presenter"
      description="Apply to the TurboLoop creator and presenter programs. We pay $10–$100 per high-performing video and $100/month for Zoom hosts."
      path="/apply"
      hero={{
        label: "Get Paid",
        heading: "Earn while you build the movement.",
        subtitle:
          "Two paid programs: Creator Star ($10–$100/video) and Local Presenter ($100/month). Apply in one minute — we review within 48 h.",
        palette: ["#0891B2", "#22D3EE", "#F59E0B"],
        emoji: "⭐",
      }}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Apply — TurboLoop Creator & Presenter Programs",
        url: "https://turboloop.tech/apply",
      }}
      related={[
        {
          label: "Promotions",
          href: "/promotions",
          emoji: "🎁",
          description: "All earn programs + the $100K bounty",
        },
        {
          label: "Community",
          href: "/community",
          emoji: "🌍",
          description: "Where featured creators get spotlighted",
        },
        {
          label: "Submit",
          href: "/submit",
          emoji: "✍️",
          description: "Just sharing a story (no application)",
        },
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
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,211,238,0.06))",
                border: "1px solid rgba(34,197,94,0.25)",
              }}
            >
              <div
                className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #22C55E, #10B981)",
                }}
              >
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <h2
                className="text-3xl font-bold text-slate-900 mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Application received.
              </h2>
              <p className="text-slate-600 mb-7 max-w-md mx-auto leading-relaxed">
                We review every application. If you're a fit, we'll reach out
                within 48 hours via the contact you gave us. Track status any
                time on your submissions page.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/my-submissions">
                  <button
                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                      color: "white",
                      boxShadow: "0 8px 22px -6px rgba(8,145,178,0.4)",
                    }}
                  >
                    Track status
                  </button>
                </Link>
                <button
                  onClick={reset}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 transition"
                  style={{
                    background: "rgba(15,23,42,0.04)",
                    border: "1px solid rgba(15,23,42,0.08)",
                  }}
                >
                  Apply for the other program
                </button>
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
              {/* Program tabs */}
              <AnimatedSection>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white border border-slate-200">
                  {PROGRAMS.map(p => {
                    const Icon = p.icon;
                    const active = program === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProgram(p.id)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition"
                        style={{
                          background: active
                            ? "linear-gradient(135deg, #0891B2, #7C3AED)"
                            : "transparent",
                          color: active ? "white" : "#64748B",
                          boxShadow: active
                            ? "0 6px 18px -4px rgba(8,145,178,0.45)"
                            : "none",
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="text-center mt-4">
                  <div
                    className="text-sm font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {current.headline}
                  </div>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
                    {current.description}
                  </p>
                </div>
              </AnimatedSection>

              {/* Name + country */}
              <AnimatedSection delay={0.05}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="apply-name"
                      className="block text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-2"
                    >
                      Your name *
                    </label>
                    <input
                      id="apply-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      maxLength={200}
                      required
                      placeholder="First + last (or just a handle)"
                      className="w-full px-4 py-3 rounded-xl text-base bg-white outline-none transition"
                      style={{ border: "1px solid rgba(15,23,42,0.08)" }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="apply-country"
                      className="block text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-2"
                    >
                      Country
                    </label>
                    <select
                      id="apply-country"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-base bg-white outline-none transition"
                      style={{ border: "1px solid rgba(15,23,42,0.08)" }}
                    >
                      <option value="">— pick yours —</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </AnimatedSection>

              {/* Contact */}
              <AnimatedSection delay={0.08}>
                <div>
                  <label
                    htmlFor="apply-contact"
                    className="block text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-2"
                  >
                    Email or Telegram *
                  </label>
                  <input
                    id="apply-contact"
                    type="text"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    maxLength={320}
                    required
                    placeholder="hello@you.com or @yourhandle"
                    className="w-full px-4 py-3 rounded-xl text-base bg-white outline-none transition"
                    style={{ border: "1px solid rgba(15,23,42,0.08)" }}
                  />
                </div>
              </AnimatedSection>

              {/* Body */}
              <AnimatedSection delay={0.1}>
                <div>
                  <label
                    htmlFor="apply-body"
                    className="block text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-2"
                  >
                    {current.bodyLabel} *
                  </label>
                  <textarea
                    id="apply-body"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    minLength={30}
                    maxLength={5000}
                    rows={6}
                    required
                    placeholder={current.bodyPlaceholder}
                    className="w-full px-4 py-3 rounded-xl text-base bg-white outline-none transition resize-y"
                    style={{
                      border: "1px solid rgba(15,23,42,0.08)",
                      minHeight: "150px",
                    }}
                  />
                  <div className="text-[11px] text-slate-400 mt-1.5 text-right">
                    {body.length} / 5000
                  </div>
                </div>
              </AnimatedSection>

              {/* Sample URL */}
              <AnimatedSection delay={0.12}>
                <div>
                  <label
                    htmlFor="apply-file-url"
                    className="block text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mb-2"
                  >
                    {current.fileLabel}
                  </label>
                  <input
                    id="apply-file-url"
                    type="url"
                    value={fileUrl}
                    onChange={e => setFileUrl(e.target.value)}
                    maxLength={1000}
                    placeholder={current.filePlaceholder}
                    className="w-full px-4 py-3 rounded-xl text-base bg-white outline-none transition"
                    style={{ border: "1px solid rgba(15,23,42,0.08)" }}
                  />
                </div>
              </AnimatedSection>

              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm text-red-700"
                  style={{
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
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
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `Apply for ${current.label}`
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-3">
                  Hidden fee: nothing. We pay you. Reviewed within 48 h.
                </p>
              </AnimatedSection>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Share — only after success, encourages social proof */}
        {success && (
          <div className="mt-6 flex justify-center">
            <ShareButton
              path="/apply"
              message="🚀 Just applied to the TurboLoop creator program — they pay creators per view."
              label="Tell a friend"
              variant="ghost"
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}

export { SUBMISSION_IDS_KEY };
