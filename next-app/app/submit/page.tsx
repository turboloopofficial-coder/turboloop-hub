"use client";

// /submit — community contribution form. testimonial / photo / reel / story.
// Posts to the legacy tRPC submissions.submit endpoint, persists the id
// in localStorage so /my-submissions can track status.

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Loader2,
  MessageSquare,
  Camera,
  Film,
  BookOpen,
} from "lucide-react";
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

const TYPE_OPTIONS: Array<{
  value: SubmissionType;
  label: string;
  description: string;
  icon: typeof MessageSquare;
}> = [
  {
    value: "testimonial",
    label: "Testimonial",
    description: "A few sentences about your experience with TurboLoop",
    icon: MessageSquare,
  },
  {
    value: "story",
    label: "Your Story",
    description: "A longer narrative — your journey, the moment it clicked",
    icon: BookOpen,
  },
  {
    value: "photo",
    label: "Photo",
    description: "A meetup pic, your country group, your screen",
    icon: Camera,
  },
  {
    value: "reel",
    label: "Video / Reel",
    description: "A short video — link to where it's hosted",
    icon: Film,
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

export default function SubmitPage() {
  const [type, setType] = useState<SubmissionType>("testimonial");
  const [authorName, setAuthorName] = useState("");
  const [authorContact, setAuthorContact] = useState("");
  const [authorCountry, setAuthorCountry] = useState("");
  const [body, setBody] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setType("testimonial");
    setAuthorName("");
    setAuthorContact("");
    setAuthorCountry("");
    setBody("");
    setFileUrl("");
    setError(null);
    setSuccess(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
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

    setSubmitting(true);
    try {
      const result = await submitSubmission({
        type,
        authorName: authorName.trim(),
        authorContact: authorContact.trim() || undefined,
        authorCountry: authorCountry.trim() || undefined,
        body: body.trim(),
        fileUrl: fileUrl.trim() || undefined,
      });
      rememberSubmissionId(result.id);
      haptic("success");
      setSuccess(true);
    } catch (err: any) {
      haptic("error");
      setError(err?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Share Your Voice"
        title="Got a story worth sharing?"
        subtitle="Send us your testimonial, photo, video, or full story. We feature the best on /community and across our channels."
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
              Got it. Thank you.
            </Heading>
            <p className="text-[var(--c-text-muted)] leading-relaxed mb-6 max-w-md mx-auto">
              We&rsquo;ll review within 48 hours. If you gave us a contact,
              you&rsquo;ll get an email when it&rsquo;s approved. Track status
              anytime — it stays on this device.
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
                Submit another
              </button>
            </div>
          </Card>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Type picker */}
            <div>
              <label className="block text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-text-subtle)] mb-3">
                What are you sharing?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TYPE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const active = type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className="relative flex flex-col items-center gap-2 p-3 rounded-[var(--r-lg)] text-center transition-all"
                      style={{
                        background: active
                          ? "linear-gradient(135deg, rgba(8,145,178,0.12), rgba(124,58,237,0.10))"
                          : "var(--c-surface)",
                        border: `1.5px solid ${active ? "rgba(8,145,178,0.4)" : "var(--c-border)"}`,
                        boxShadow: active
                          ? "0 4px 14px -4px rgba(8,145,178,0.2)"
                          : "var(--s-sm)",
                      }}
                    >
                      <Icon
                        className={`w-5 h-5 ${active ? "text-[var(--c-brand-cyan)]" : "text-[var(--c-text-subtle)]"}`}
                      />
                      <div
                        className={`text-xs font-bold ${active ? "text-[var(--c-brand-cyan)]" : "text-[var(--c-text)]"}`}
                      >
                        {opt.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[var(--c-text-muted)] mt-2">
                {TYPE_OPTIONS.find(o => o.value === type)?.description}
              </p>
            </div>

            {/* Name + country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="submit-name"
                  className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2"
                >
                  Your name *
                </label>
                <input
                  id="submit-name"
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  maxLength={200}
                  required
                  placeholder="First + last (or just a handle)"
                  className="w-full px-4 h-12 rounded-[var(--r-md)] text-base bg-[var(--c-surface)] outline-none transition border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)]"
                />
              </div>
              <div>
                <label
                  htmlFor="submit-country"
                  className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2"
                >
                  Country
                </label>
                <select
                  id="submit-country"
                  value={authorCountry}
                  onChange={e => setAuthorCountry(e.target.value)}
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
              <label
                htmlFor="submit-contact"
                className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2"
              >
                Email or Telegram (optional)
              </label>
              <input
                id="submit-contact"
                type="text"
                value={authorContact}
                onChange={e => setAuthorContact(e.target.value)}
                maxLength={320}
                placeholder="So we can reach out if we feature you"
                className="w-full px-4 h-12 rounded-[var(--r-md)] text-base bg-[var(--c-surface)] outline-none transition border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)]"
              />
            </div>

            {/* Body */}
            <div>
              <label
                htmlFor="submit-body"
                className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2"
              >
                {type === "photo" || type === "reel"
                  ? "Caption / context *"
                  : "Your message *"}
              </label>
              <textarea
                id="submit-body"
                value={body}
                onChange={e => setBody(e.target.value)}
                minLength={10}
                maxLength={5000}
                rows={6}
                required
                placeholder={
                  type === "testimonial"
                    ? "What's your TurboLoop experience? A few honest sentences."
                    : type === "story"
                      ? "Tell the longer version. When did it click? What changed?"
                      : type === "photo"
                        ? "Describe the photo — meetup, country group, your setup..."
                        : "Describe the video — what's it about?"
                }
                className="w-full px-4 py-3 rounded-[var(--r-md)] text-base bg-[var(--c-surface)] outline-none transition resize-y border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)]"
                style={{ minHeight: "150px" }}
              />
              <div className="text-xs text-[var(--c-text-subtle)] mt-1.5 text-right">
                {body.length} / 5000
              </div>
            </div>

            {(type === "photo" || type === "reel") && (
              <div>
                <label
                  htmlFor="submit-file-url"
                  className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2"
                >
                  {type === "photo" ? "Photo URL" : "Video URL"}
                </label>
                <input
                  id="submit-file-url"
                  type="url"
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  maxLength={1000}
                  placeholder={
                    type === "photo"
                      ? "https://imgur.com/..."
                      : "https://youtube.com/... or https://t.me/..."
                  }
                  className="w-full px-4 h-12 rounded-[var(--r-md)] text-base bg-[var(--c-surface)] outline-none transition border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)]"
                />
                <p className="text-xs text-[var(--c-text-subtle)] mt-1.5">
                  {type === "photo"
                    ? "Upload to imgur.com (free, no account) and paste the link."
                    : "Paste a YouTube, Telegram, or other public link."}
                </p>
              </div>
            )}

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
                "Send my submission"
              )}
            </button>
            <p className="text-xs text-[var(--c-text-subtle)] text-center">
              We review every submission. Featured contributors get a heads-up
              via the contact above.
            </p>
          </form>
        )}
      </Container>
    </main>
  );
}
