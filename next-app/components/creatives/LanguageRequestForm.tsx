"use client";
// LanguageRequestForm — allows community members to request a new language.
// Shown at the bottom of the creatives page language filter area.
// Submits to /api/language-request and shows success/error feedback.

import { useState } from "react";
import { Globe, Send, CheckCircle, AlertCircle } from "lucide-react";

interface FormState {
  status: "idle" | "submitting" | "success" | "error";
  message?: string;
  votes?: number;
}

export function LanguageRequestForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    languageName: "",
    languageCode: "",
    nativeName: "",
    flag: "",
    requesterName: "",
    requesterTelegram: "",
    reason: "",
  });
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "submitting" });

    try {
      const res = await fetch("/api/language-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setState({
          status: "success",
          message: data.message,
          votes: data.votes,
        });
        // Reset form after success
        setForm({
          languageName: "",
          languageCode: "",
          nativeName: "",
          flag: "",
          requesterName: "",
          requesterTelegram: "",
          reason: "",
        });
      } else {
        setState({ status: "error", message: data.error });
      }
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "color-mix(in oklab, var(--c-surface) 80%, transparent)",
          border: "1px dashed var(--c-border)",
          color: "var(--c-text-subtle)",
        }}
      >
        <Globe className="w-4 h-4" />
        <span>Request a Language</span>
      </button>
    );
  }

  return (
    <div
      className="mt-6 p-5 rounded-2xl"
      style={{
        background: "color-mix(in oklab, var(--c-surface) 90%, transparent)",
        border: "1px solid var(--c-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[var(--c-text)] flex items-center gap-2">
          <Globe className="w-5 h-5" style={{ color: "var(--c-brand-cyan)" }} />
          Request a New Language
        </h3>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--c-text-subtle)] hover:text-[var(--c-text)] transition"
        >
          Close
        </button>
      </div>

      <p className="text-sm text-[var(--c-text-subtle)] mb-4">
        Don&apos;t see your language? Request it and we&apos;ll add full support — 200+ banners,
        dubbed videos, blog translations, and Telegram scheduling — all automated!
      </p>

      {state.status === "success" ? (
        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "color-mix(in oklab, #10b981 15%, transparent)" }}>
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-400">{state.message}</p>
            {state.votes && state.votes > 1 && (
              <p className="text-xs text-emerald-500/70 mt-1">
                This language now has {state.votes} community votes!
              </p>
            )}
          </div>
        </div>
      ) : state.status === "error" ? (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-4" style={{ background: "color-mix(in oklab, #ef4444 15%, transparent)" }}>
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{state.message}</p>
        </div>
      ) : null}

      {state.status !== "success" && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Language name (e.g. Vietnamese)"
            value={form.languageName}
            onChange={(e) => setForm({ ...form, languageName: e.target.value })}
            required
            className="px-3 py-2.5 rounded-lg text-sm bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:outline-none focus:border-[var(--c-brand-cyan)] transition"
          />
          <input
            type="text"
            placeholder="ISO code (e.g. vi)"
            value={form.languageCode}
            onChange={(e) => setForm({ ...form, languageCode: e.target.value.toLowerCase() })}
            required
            maxLength={3}
            className="px-3 py-2.5 rounded-lg text-sm bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:outline-none focus:border-[var(--c-brand-cyan)] transition"
          />
          <input
            type="text"
            placeholder="Native name (e.g. Tiếng Việt)"
            value={form.nativeName}
            onChange={(e) => setForm({ ...form, nativeName: e.target.value })}
            required
            className="px-3 py-2.5 rounded-lg text-sm bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:outline-none focus:border-[var(--c-brand-cyan)] transition"
          />
          <input
            type="text"
            placeholder="Flag emoji (e.g. 🇻🇳)"
            value={form.flag}
            onChange={(e) => setForm({ ...form, flag: e.target.value })}
            required
            className="px-3 py-2.5 rounded-lg text-sm bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:outline-none focus:border-[var(--c-brand-cyan)] transition"
          />
          <input
            type="text"
            placeholder="Your name (optional)"
            value={form.requesterName}
            onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
            className="px-3 py-2.5 rounded-lg text-sm bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:outline-none focus:border-[var(--c-brand-cyan)] transition"
          />
          <input
            type="text"
            placeholder="Your Telegram (optional)"
            value={form.requesterTelegram}
            onChange={(e) => setForm({ ...form, requesterTelegram: e.target.value })}
            className="px-3 py-2.5 rounded-lg text-sm bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:outline-none focus:border-[var(--c-brand-cyan)] transition"
          />
          <textarea
            placeholder="Why should we add this language? (optional)"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={2}
            className="sm:col-span-2 px-3 py-2.5 rounded-lg text-sm bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:outline-none focus:border-[var(--c-brand-cyan)] transition resize-none"
          />
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={state.status === "submitting"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "var(--c-brand-gradient)",
                boxShadow: "var(--s-brand)",
              }}
            >
              <Send className="w-4 h-4" />
              {state.status === "submitting" ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
