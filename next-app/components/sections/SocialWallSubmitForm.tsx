"use client";

// Inline "Submit Your Content" form rendered below the Social Wall.
// Posts to submissions.submit with type="creator_apply" — the same
// pipeline the dedicated /submit page uses. Successful submissions
// land in the moderation queue; once admin approves + queues a
// payout, the 44-day reminder cron handles the rest.

import { useState } from "react";
import { Loader2, Send, Check } from "lucide-react";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { Magnetic } from "@components/ui/Magnetic";
import { submitSubmission, rememberSubmissionId } from "@lib/submitApi";
import { haptic } from "@lib/haptic";

const PLATFORM_OPTIONS = [
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X / Twitter" },
  { value: "instagram", label: "Instagram" },
  { value: "telegram", label: "Telegram" },
  { value: "other", label: "Other" },
];

export function SocialWallSubmitForm() {
  const [name, setName] = useState("");
  const [telegram, setTelegram] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [description, setDescription] = useState("");

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (telegram.trim().length < 2) {
      setError("Telegram handle is required so we can reach you.");
      return;
    }
    if (videoUrl.trim().length < 5) {
      setError("Paste the URL of your video.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Add a short description (at least 10 characters).");
      return;
    }

    setBusy(true);
    try {
      const platformLabel =
        PLATFORM_OPTIONS.find(p => p.value === platform)?.label ?? platform;
      const body = `Platform: ${platformLabel}\n\n${description.trim()}`;
      const result = await submitSubmission({
        type: "creator_apply",
        authorName: name.trim(),
        authorContact: `@${telegram.trim().replace(/^@/, "")}`,
        body,
        youtubeUrl: platform === "youtube" ? videoUrl.trim() : undefined,
        fileUrl: platform !== "youtube" ? videoUrl.trim() : undefined,
      });
      rememberSubmissionId(result.id);
      haptic("success");
      setDone(true);
    } catch (err: any) {
      haptic("error");
      setError(err?.message ?? "Couldn't submit — try again.");
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
          Thanks for submitting!
        </Heading>
        <p className="text-[var(--c-text-muted)] leading-relaxed">
          We'll review within 7 days. Approved content shows up on the
          wall above + you become eligible for the Creator Star
          payout.
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
      <div className="text-center mb-6">
        <Heading
          tier="eyebrow"
          className="text-[var(--c-brand-cyan)] mb-3 inline-block"
        >
          Got a TurboLoop video?
        </Heading>
        <Heading tier="h2" className="mb-2">
          Submit your content.
        </Heading>
        <p className="text-[var(--c-text-muted)] leading-relaxed">
          Get featured on the wall + eligible for the Creator Star
          payout tier. Approval typically within 7 days.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Name *"
            value={name}
            onChange={setName}
            placeholder="Your name"
            disabled={busy}
          />
          <Field
            label="Telegram handle *"
            value={telegram}
            onChange={setTelegram}
            placeholder="@yourname"
            disabled={busy}
          />
          <Field
            label="Video URL *"
            value={videoUrl}
            onChange={setVideoUrl}
            placeholder="https://youtube.com/…"
            disabled={busy}
            className="md:col-span-1"
          />
          <div>
            <label className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
              Platform *
            </label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              disabled={busy}
              className="w-full px-3 h-12 rounded-[var(--r-md)] text-sm bg-[var(--c-bg)] border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)] focus:ring-2 focus:ring-[var(--c-brand-cyan)]/20 outline-none disabled:opacity-60 text-[var(--c-text)]"
            >
              {PLATFORM_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What's in the video? Length, audience, language. Helps us decide if it fits the wall."
            rows={4}
            maxLength={1500}
            disabled={busy}
            className="w-full px-4 py-3 rounded-[var(--r-md)] text-sm bg-[var(--c-bg)] border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)] focus:ring-2 focus:ring-[var(--c-brand-cyan)]/20 outline-none disabled:opacity-60 text-[var(--c-text)] leading-relaxed"
          />
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
                  Submit content →
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
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        autoComplete="off"
        className="w-full px-4 h-12 rounded-[var(--r-md)] text-sm bg-[var(--c-bg)] outline-none border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)] focus:ring-2 focus:ring-[var(--c-brand-cyan)]/20 disabled:opacity-60 text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
      />
    </label>
  );
}
