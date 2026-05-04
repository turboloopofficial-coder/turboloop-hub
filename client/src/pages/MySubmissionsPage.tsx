// /my-submissions — lets contributors check the status of what they've
// submitted. Backed by localStorage (no auth needed): every successful
// submit writes the new submission's id into the list. The page reads
// it, calls submissions.byIds, and renders a status badge per item.
//
// Privacy: no PII is stored client-side, only ids. Server endpoint
// returns minimal fields (id, type, status, createdAt) — no contact
// info or body, even back to the original submitter, since this is an
// unauthenticated lookup.

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Clock, Check, X, FileText, ExternalLink } from "lucide-react";
import PageShell from "@/components/PageShell";
import { trpc } from "@/lib/trpc";

const SUBMISSION_IDS_KEY = "turboloop_submission_ids";

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

export default function MySubmissionsPage() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SUBMISSION_IDS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setIds(parsed.filter(n => typeof n === "number"));
      }
    } catch {}
  }, []);

  const { data, isLoading } = trpc.submissions.byIds.useQuery(
    { ids },
    { enabled: ids.length > 0 }
  );

  const sorted = (data ?? []).slice().sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <PageShell
      title="My Submissions"
      description="Track the status of your TurboLoop submissions and applications."
      path="/my-submissions"
      hero={{
        label: "Your Contributions",
        heading: "What you've shared.",
        subtitle:
          "Every story, photo, video, or program application you've sent us — with live status. Stays on this device.",
        palette: ["#0891B2", "#22D3EE", "#7C3AED"],
        emoji: "📋",
      }}
      related={[
        {
          label: "Submit",
          href: "/submit",
          emoji: "✍️",
          description: "Share another story",
        },
        {
          label: "Apply",
          href: "/apply",
          emoji: "⭐",
          description: "Creator + presenter programs",
        },
        {
          label: "Community",
          href: "/community",
          emoji: "🌍",
          description: "See approved submissions live",
        },
      ]}
    >
      <div className="container max-w-2xl pb-16">
        {ids.length === 0 ? (
          <div
            className="rounded-3xl p-10 md:p-12 text-center"
            style={{
              background: "rgba(15,23,42,0.03)",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2
              className="text-2xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Nothing here yet.
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
              Submissions and applications you send from this device will
              appear here. Track status anytime — no login needed.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/submit">
                <button
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                    color: "white",
                    boxShadow: "0 8px 22px -6px rgba(8,145,178,0.4)",
                  }}
                >
                  Share your story
                </button>
              </Link>
              <Link href="/apply">
                <button
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 transition"
                  style={{
                    background: "white",
                    border: "1px solid rgba(15,23,42,0.08)",
                  }}
                >
                  Apply to earn
                </button>
              </Link>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="h-20 rounded-2xl animate-pulse"
                style={{ background: "rgba(15,23,42,0.04)" }}
              />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="rounded-3xl p-8 text-center"
            style={{
              background: "rgba(15,23,42,0.03)",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <p className="text-slate-500">
              We couldn't find your submissions on the server right now. Try
              again in a moment.
            </p>
          </div>
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
                <div
                  key={s.id}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{
                    background: "white",
                    border: "1px solid rgba(15,23,42,0.06)",
                    boxShadow: "0 4px 14px -4px rgba(15,23,42,0.05)",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl"
                    style={{ background: `${kind.color}15`, color: kind.color }}
                    aria-hidden
                  >
                    {kind.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm">
                      {kind.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
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
                </div>
              );
            })}
            {sorted.some(s => s.status === "approved") && (
              <Link href="/community">
                <button
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition hover:scale-[1.01]"
                  style={{
                    background: "linear-gradient(135deg, #0891B2, #7C3AED)",
                    color: "white",
                    boxShadow: "0 8px 22px -6px rgba(8,145,178,0.4)",
                  }}
                >
                  See approved entries on /community
                  <ExternalLink className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
