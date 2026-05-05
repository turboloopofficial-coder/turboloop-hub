"use client";

// /my-submissions — track status of submitted contributions.
// Reads submission ids from localStorage (no auth), fetches status
// from the legacy tRPC byIds endpoint.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Check, X, FileText, ExternalLink } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { PageHero } from "@components/layout/PageHero";
import {
  fetchSubmissionsByIds,
  getRememberedSubmissionIds,
} from "@lib/submitApi";

const KIND_META: Record<
  string,
  { label: string; emoji: string; color: string }
> = {
  testimonial: { label: "Testimonial", emoji: "💬", color: "#0891B2" },
  story: { label: "Story", emoji: "📖", color: "#7C3AED" },
  photo: { label: "Photo", emoji: "📸", color: "#EC4899" },
  reel: { label: "Reel", emoji: "🎬", color: "#F59E0B" },
  creator_apply: { label: "Creator Star", emoji: "⭐", color: "#F59E0B" },
  presenter_apply: { label: "Local Presenter", emoji: "🎤", color: "#10B981" },
};

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending review",
    color: "#92400E",
    bg: "rgba(245,158,11,0.12)",
    icon: Clock,
  },
  approved: {
    label: "Approved · live",
    color: "#065F46",
    bg: "rgba(16,185,129,0.12)",
    icon: Check,
  },
  rejected: {
    label: "Not a fit",
    color: "#991B1B",
    bg: "rgba(239,68,68,0.12)",
    icon: X,
  },
};

interface Row {
  id: number;
  type: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function MySubmissionsPage() {
  const [ids, setIds] = useState<number[]>([]);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getRememberedSubmissionIds();
    setIds(stored);
    if (stored.length === 0) {
      setLoading(false);
      return;
    }
    fetchSubmissionsByIds(stored)
      .then(data => setRows(data))
      .catch(err => setError(err?.message || "Could not load submissions"))
      .finally(() => setLoading(false));
  }, []);

  const sorted = (rows ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Your Contributions"
        title="What you've shared."
        subtitle="Every story, photo, video, or program application you've sent us — with live status. Stays on this device."
      />

      <Container width="narrow">
        {ids.length === 0 ? (
          <Card
            elevation="raised"
            padding="lg"
            className="text-center"
          >
            <FileText className="w-12 h-12 text-[var(--c-text-subtle)] mx-auto mb-4" />
            <Heading tier="h2" className="mb-2">
              Nothing here yet.
            </Heading>
            <p className="text-[var(--c-text-muted)] mb-6 max-w-md mx-auto leading-relaxed">
              Submissions and applications you send from this device will
              appear here. Track status anytime — no login needed.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
              >
                Share your story
              </Link>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
              >
                Apply to earn
              </Link>
            </div>
          </Card>
        ) : loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="h-20 rounded-[var(--r-xl)] animate-pulse bg-[rgba(15,23,42,0.04)]"
              />
            ))}
          </div>
        ) : error ? (
          <Card elevation="raised" padding="lg" className="text-center">
            <p className="text-[var(--c-text-muted)]">{error}</p>
          </Card>
        ) : sorted.length === 0 ? (
          <Card elevation="raised" padding="lg" className="text-center">
            <p className="text-[var(--c-text-muted)]">
              We couldn&rsquo;t find your submissions on the server right now.
              Try again in a moment.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {sorted.map(s => {
              const kind = KIND_META[s.type] ?? {
                label: s.type,
                emoji: "•",
                color: "#64748B",
              };
              const status = STATUS_META[s.status] ?? STATUS_META.pending;
              const StatusIcon = status.icon;
              const date = new Date(s.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <Card
                  key={s.id}
                  elevation="raised"
                  padding="md"
                  className="flex items-center gap-4"
                >
                  <div
                    className="w-11 h-11 rounded-[var(--r-md)] flex items-center justify-center shrink-0 text-xl"
                    style={{ background: `${kind.color}15`, color: kind.color }}
                    aria-hidden
                  >
                    {kind.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[var(--c-text)] text-sm">
                      {kind.label}
                    </div>
                    <div className="text-xs text-[var(--c-text-subtle)] mt-0.5">
                      Submitted {date}
                    </div>
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0"
                    style={{ background: status.bg, color: status.color }}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </div>
                </Card>
              );
            })}
            {sorted.some(s => s.status === "approved") && (
              <Link
                href="/community"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-5 h-12 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
              >
                See approved entries on /community
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </Container>
    </main>
  );
}
