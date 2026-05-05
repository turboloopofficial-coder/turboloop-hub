"use client";

// /apply — Creator Star + Local Presenter program application form.

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, Star, Mic } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import {
  submitSubmission,
  rememberSubmissionId,
  type SubmissionType,
} from "@lib/submitApi";
import { haptic } from "@lib/haptic";

type Program = Extract<SubmissionType, "creator_apply" | "presenter_apply">;

const PROGRAMS: Array<{
  id: Program;
  label: string;
  icon: typeof Star;
  headline: string;
  description: string;
  bodyLabel: string;
  bodyPlaceholder: string;
  fileLabel: string;
  filePlaceholder: string;
}> = [
  {
    id: "creator_apply",
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
    id: "presenter_apply",
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
  "🇮🇳 India", "🇩🇪 Germany", "🇳🇬 Nigeria", "🇮🇩 Indonesia", "🇹🇷 Turkey",
  "🇧🇷 Brazil", "🇵🇰 Pakistan", "🇧🇩 Bangladesh", "🇪🇬 Egypt", "🇰🇪 Kenya",
  "🇿🇦 South Africa", "🇲🇽 Mexico", "🇦🇷 Argentina", "🇵🇭 Philippines",
  "🇻🇳 Vietnam", "🇲🇾 Malaysia", "🇺🇸 USA", "🇬🇧 UK", "🇫🇷 France",
  "🇮🇹 Italy", "🇪🇸 Spain", "🇨🇦 Canada", "🌍 Other",
];

export default function ApplyPage() {
  const [program, setProgram] = useState<Program>("creator_apply");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [country, setCountry] = useState("");
  const [body, setBody] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const current = PROGRAMS.find(p => p.id === program)!;

  const reset = () => {
    setName("");
    setContact("");
    setCountry("");
    setBody("");
    setFileUrl("");
    setError(null);
    setSuccess(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Please enter your name.");
    if (!contact.trim())
      return setError("Please give us an email or Telegram handle to reach you.");
    if (body.trim().length < 30)
      return setError("Tell us a bit more (at least 30 characters).");

    setSubmitting(true);
    try {
      const result = await submitSubmission({
        type: program,
        authorName: name.trim(),
        authorContact: contact.trim(),
        authorCountry: country.trim() || undefined,
        body: body.trim(),
        fileUrl: fileUrl.trim() || undefined,
      });
      rememberSubmissionId(result.id);
      haptic("success");
      setSuccess(true);
    } catch (err: any) {
      haptic("error");
      setError(err?.message || "Application failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Get Paid"
        title="Earn while you build the movement."
        subtitle="Two paid programs: Creator Star ($10–$100/video) and Local Presenter ($100/month). Apply in one minute — we review within 48 h."
      />

      <Container width="narrow">
        {success ? (
          <Card
            elevation="prominent"
            padding="lg"
            className="text-center relative overflow-hidden"
          >
            <div
              className="absolute inset-0 -z-10 opacity-10"
              style={{ background: "linear-gradient(135deg, #10B981, #0891B2)" }}
              aria-hidden="true"
            />
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #22C55E, #10B981)",
              }}
            >
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
            <Heading tier="h2" className="mb-3">
              Application received.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed mb-6 max-w-md mx-auto">
              We review every application. If you&rsquo;re a fit, we&rsquo;ll
              reach out within 48 hours. Track status anytime.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/my-submissions"
                className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
              >
                Track status →
              </Link>
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
              >
                Apply for the other program
              </button>
            </div>
          </Card>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Program tabs */}
            <div>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-[var(--r-xl)] bg-[var(--c-surface)] border border-[var(--c-border)]">
                {PROGRAMS.map(p => {
                  const Icon = p.icon;
                  const active = program === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProgram(p.id)}
                      className="flex items-center justify-center gap-2 py-3 rounded-[var(--r-lg)] text-sm font-bold transition"
                      style={{
                        background: active ? "var(--c-brand-gradient)" : "transparent",
                        color: active ? "white" : "var(--c-text-muted)",
                        boxShadow: active ? "var(--s-brand)" : "none",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <div className="text-center mt-4">
                <div className="text-sm font-bold text-brand">
                  {current.headline}
                </div>
                <p className="text-sm text-[var(--c-text-muted)] mt-1.5 leading-relaxed max-w-md mx-auto">
                  {current.description}
                </p>
              </div>
            </div>

            {/* Name + country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
                  Your name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={200}
                  required
                  placeholder="First + last (or just a handle)"
                  className="w-full px-4 h-12 rounded-[var(--r-md)] text-base bg-[var(--c-surface)] outline-none transition border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)]"
                />
              </div>
              <div>
                <label className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
                  Country
                </label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full px-4 h-12 rounded-[var(--r-md)] text-base bg-[var(--c-surface)] outline-none transition border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)]"
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

            {/* Contact */}
            <div>
              <label className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
                Email or Telegram *
              </label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                maxLength={320}
                required
                placeholder="hello@you.com or @yourhandle"
                className="w-full px-4 h-12 rounded-[var(--r-md)] text-base bg-[var(--c-surface)] outline-none transition border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)]"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
                {current.bodyLabel} *
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                minLength={30}
                maxLength={5000}
                rows={6}
                required
                placeholder={current.bodyPlaceholder}
                className="w-full px-4 py-3 rounded-[var(--r-md)] text-base bg-[var(--c-surface)] outline-none transition resize-y border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)]"
                style={{ minHeight: "150px" }}
              />
              <div className="text-xs text-[var(--c-text-subtle)] mt-1.5 text-right">
                {body.length} / 5000
              </div>
            </div>

            {/* Sample URL */}
            <div>
              <label className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
                {current.fileLabel}
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                maxLength={1000}
                placeholder={current.filePlaceholder}
                className="w-full px-4 h-12 rounded-[var(--r-md)] text-base bg-[var(--c-surface)] outline-none transition border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)]"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-[var(--r-md)] text-sm text-red-700 bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-7 h-[52px] rounded-[var(--r-lg)] text-base font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985] disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `Apply for ${current.label}`
              )}
            </button>
            <p className="text-xs text-[var(--c-text-subtle)] text-center">
              Hidden fee: nothing. We pay you. Reviewed within 48 h.
            </p>
          </form>
        )}
      </Container>
    </main>
  );
}
