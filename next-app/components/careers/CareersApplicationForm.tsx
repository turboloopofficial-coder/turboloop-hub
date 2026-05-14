"use client";

// /careers application form — collects name, email, telegram handle,
// language, experience. Posts to submissions.submit with
// type="presenter_apply" so the same admin moderation queue handles it.
// Email/telegram go into authorContact (email preferred); language +
// experience body go into the submission body.

import { useState } from "react";
import { Loader2, Check, Send } from "lucide-react";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { Magnetic } from "@components/ui/Magnetic";
import {
  submitSubmission,
  rememberSubmissionId,
} from "@lib/submitApi";
import { haptic } from "@lib/haptic";

const LANGUAGE_OPTIONS = [
  { value: "id", label: "🇮🇩 Bahasa Indonesia" },
  { value: "de", label: "🇩🇪 Deutsch" },
  { value: "other", label: "🌍 Other (specify in experience)" },
];

export function CareersApplicationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [language, setLanguage] = useState<string>("id");
  const [experience, setExperience] = useState("");

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (telegram.trim().length < 2) {
      setError("Telegram handle is required so we can reach you.");
      return;
    }
    if (experience.trim().length < 30) {
      setError(
        "Tell us a bit more about your experience (at least 30 characters)."
      );
      return;
    }

    setBusy(true);
    try {
      const langLabel =
        LANGUAGE_OPTIONS.find(l => l.value === language)?.label ?? language;
      // Pack the language tag into the body so it surfaces in the
      // moderation queue without needing a new column.
      const body = `Applying for: Zoom Presenter (${langLabel})\n\n${experience.trim()}`;
      const result = await submitSubmission({
        type: "presenter_apply",
        authorName: name.trim(),
        authorContact:
          email.trim() || `@${telegram.trim().replace(/^@/, "")}`,
        body,
      });
      rememberSubmissionId(result.id);
      haptic("success");
      setDone(true);
    } catch (err: any) {
      haptic("error");
      setError(
        err?.message ?? "Couldn't submit — try again in a moment."
      );
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Card
        elevation="prominent"
        padding="lg"
        className="text-center max-w-2xl mx-auto relative overflow-hidden"
      >
        <div
          className="absolute inset-0 -z-10 opacity-10 pointer-events-none"
          style={{ background: "var(--c-brand-gradient)" }}
          aria-hidden="true"
        />
        <div className="w-14 h-14 rounded-full bg-brand mx-auto mb-4 flex items-center justify-center shadow-[var(--s-brand)]">
          <Check className="w-7 h-7 text-white" strokeWidth={3} />
        </div>
        <Heading tier="h2" className="mb-2">
          Application received.
        </Heading>
        <p className="text-[var(--c-text-muted)] leading-relaxed">
          Reviews happen weekly. If approved, you&rsquo;ll get a
          Telegram DM with onboarding within 7 days.
        </p>
      </Card>
    );
  }

  return (
    <Card
      elevation="prominent"
      padding="lg"
      className="max-w-3xl mx-auto"
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Full name *"
            value={name}
            onChange={setName}
            placeholder="Andi Pratama"
            disabled={busy}
            autoComplete="name"
          />
          <Field
            label="Email (optional)"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            disabled={busy}
            autoComplete="email"
            inputMode="email"
          />
          <Field
            label="Telegram handle *"
            value={telegram}
            onChange={setTelegram}
            placeholder="@yourname"
            disabled={busy}
            autoComplete="off"
          />
          <div>
            <label className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
              Language *
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              disabled={busy}
              className="w-full px-3 h-12 rounded-[var(--r-md)] text-sm bg-[var(--c-bg)] border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)] focus:ring-2 focus:ring-[var(--c-brand-cyan)]/20 outline-none disabled:opacity-60 text-[var(--c-text)]"
            >
              {LANGUAGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
            Experience *
          </label>
          <textarea
            value={experience}
            onChange={e => setExperience(e.target.value)}
            placeholder="Have you hosted public Zoom calls / streams before? How large is your local crypto community? Anything else relevant?"
            rows={5}
            maxLength={5000}
            disabled={busy}
            className="w-full px-4 py-3 rounded-[var(--r-md)] text-sm bg-[var(--c-bg)] border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)] focus:ring-2 focus:ring-[var(--c-brand-cyan)]/20 outline-none disabled:opacity-60 text-[var(--c-text)] leading-relaxed"
          />
          <div className="text-xs text-[var(--c-text-subtle)] mt-1.5 tabular-nums">
            {experience.length} / 5000
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm font-bold rounded-[var(--r-md)] px-3 py-2"
            style={{
              color: "#B91C1C",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.35)",
            }}
          >
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Magnetic>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985] disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit application →
                </>
              )}
            </button>
          </Magnetic>
        </div>
      </form>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
}) {
  return (
    <label className="block">
      <span className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        autoComplete={autoComplete ?? "off"}
        inputMode={inputMode}
        className="w-full px-4 h-12 rounded-[var(--r-md)] text-sm bg-[var(--c-bg)] outline-none border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)] focus:ring-2 focus:ring-[var(--c-brand-cyan)]/20 disabled:opacity-60 text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
      />
    </label>
  );
}
