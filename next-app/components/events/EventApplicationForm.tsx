"use client";

// Event-application form — posts to the new
// submissions.submitEventApplication tRPC mutation, which writes the row
// to the DB and pings the support Telegram. Replaces the previous
// "copy this template, send it manually" CTA.
//
// Same UX pattern as NewsletterSection / ApplyPage: inline state,
// disabled-while-submitting, post-submit success card, haptic feedback.

import { useState } from "react";
import { Send, Check, Loader2 } from "lucide-react";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { Magnetic } from "@components/ui/Magnetic";
import {
  submitEventApplication,
  type EventApplicationInput,
} from "@lib/submitApi";
import { haptic } from "@lib/haptic";
import { SPONSORSHIP_TIERS } from "@lib/eventsData";

type Tier = EventApplicationInput["tier"];

export function EventApplicationForm() {
  const [tier, setTier] = useState<Tier>("local");
  const [walletAddress, setWalletAddress] = useState("");
  const [teamSize, setTeamSize] = useState<string>("");
  const [cityCountry, setCityCountry] = useState("");
  const [expectedAttendees, setExpectedAttendees] = useState<string>("");
  const [requestedDate, setRequestedDate] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Coerce + validate. Zod on the server is the source of truth; this
    // is just to surface obvious mistakes before the round-trip.
    const team = Number(teamSize);
    const attendees = Number(expectedAttendees);

    if (walletAddress.trim().length < 10) {
      setError("Please paste your full wallet address.");
      return;
    }
    if (!Number.isFinite(team) || team < 0) {
      setError("Team size must be a number.");
      return;
    }
    if (!Number.isFinite(attendees) || attendees < 1) {
      setError("Expected attendees must be at least 1.");
      return;
    }
    if (cityCountry.trim().length < 2) {
      setError("City & country is required.");
      return;
    }
    if (requestedDate.trim().length < 2) {
      setError("Requested date is required.");
      return;
    }
    if (telegramId.trim().length < 2) {
      setError("Telegram handle is required.");
      return;
    }
    if (whatsappNumber.trim().length < 5) {
      setError("WhatsApp number is required.");
      return;
    }

    setBusy(true);
    try {
      await submitEventApplication({
        walletAddress: walletAddress.trim(),
        teamSize: team,
        tier,
        cityCountry: cityCountry.trim(),
        expectedAttendees: attendees,
        requestedDate: requestedDate.trim(),
        whatsappNumber: whatsappNumber.trim(),
        telegramId: telegramId.trim().replace(/^@/, ""),
      });
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
          Our operations team reviews every submission within{" "}
          <strong className="text-[var(--c-text)]">48 hours</strong>. If
          approved, you&rsquo;ll get a Telegram DM with next steps.
        </p>
      </Card>
    );
  }

  return (
    <Card
      elevation="prominent"
      padding="lg"
      className="max-w-3xl mx-auto relative overflow-hidden"
    >
      <div
        className="absolute inset-0 -z-10 opacity-10 pointer-events-none"
        style={{ background: "var(--c-brand-gradient)" }}
        aria-hidden="true"
      />
      <div className="mb-6">
        <Heading tier="h2" className="mb-2">
          Ready to host?
        </Heading>
        <p className="text-[var(--c-text-muted)] leading-relaxed max-w-xl">
          Submit your proposal — DB-tracked, reviewed within 48 hours,
          and routed straight to the operations team.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {/* Tier — radio-as-button group */}
        <div>
          <label className="block text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
            Proposed Tier
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SPONSORSHIP_TIERS.map(t => {
              const active = tier === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTier(t.id)}
                  aria-pressed={active}
                  className="px-3 py-2.5 rounded-[var(--r-md)] text-xs font-bold text-left transition active:scale-[0.985]"
                  style={{
                    background: active
                      ? "var(--c-brand-gradient)"
                      : "var(--c-surface)",
                    color: active ? "white" : "var(--c-text)",
                    border: `1px solid ${active ? "transparent" : "var(--c-border)"}`,
                    boxShadow: active ? "var(--s-brand)" : "var(--s-sm)",
                  }}
                >
                  <span className="mr-1.5" aria-hidden="true">
                    {t.icon}
                  </span>
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldInput
            label="Organizer Wallet Address *"
            placeholder="0x…"
            value={walletAddress}
            onChange={setWalletAddress}
            disabled={busy}
            autoComplete="off"
            inputMode="text"
          />
          <FieldInput
            label="Current Team Size *"
            placeholder="e.g. 120"
            value={teamSize}
            onChange={setTeamSize}
            disabled={busy}
            inputMode="numeric"
          />
          <FieldInput
            label="City & Country *"
            placeholder="Lagos, Nigeria"
            value={cityCountry}
            onChange={setCityCountry}
            disabled={busy}
          />
          <FieldInput
            label="Expected Attendees *"
            placeholder="e.g. 60"
            value={expectedAttendees}
            onChange={setExpectedAttendees}
            disabled={busy}
            inputMode="numeric"
          />
          <FieldInput
            label="Requested Date *"
            placeholder="e.g. Aug 12, 2026"
            value={requestedDate}
            onChange={setRequestedDate}
            disabled={busy}
          />
          <FieldInput
            label="Your Telegram Handle *"
            placeholder="@yourname"
            value={telegramId}
            onChange={setTelegramId}
            disabled={busy}
            autoComplete="off"
          />
          <FieldInput
            label="WhatsApp Number *"
            placeholder="+234 …"
            value={whatsappNumber}
            onChange={setWhatsappNumber}
            disabled={busy}
            inputMode="tel"
            autoComplete="tel"
            className="md:col-span-2"
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <p className="text-xs text-[var(--c-text-subtle)] leading-relaxed">
            By submitting you agree to the Terms & Conditions below. Your
            details are stored privately and reviewed by ops only.
          </p>
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

/* ── Small helper — keeps the form body tidy. ───────────────────────── */

function FieldInput({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  autoComplete,
  inputMode,
  className,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
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
        autoComplete={autoComplete ?? "off"}
        inputMode={inputMode}
        className="w-full px-4 h-12 rounded-[var(--r-md)] text-sm bg-[var(--c-bg)] outline-none border border-[var(--c-border)] focus:border-[var(--c-brand-cyan)] focus:ring-2 focus:ring-[var(--c-brand-cyan)]/20 disabled:opacity-60 text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)]"
      />
    </label>
  );
}
