// Admin moderation queue for community-submitted content (testimonials, photos,
// reels, stories). Submissions arrive from /submit with status='pending'.
// Admin reviews, then either approves (eligible to feature) or rejects (hidden).

import { useState } from "react";
import { Loader2, Check, X, Clock, MessageSquare, Camera, Film, BookOpen, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

const TYPE_ICONS = {
  testimonial: MessageSquare,
  story: BookOpen,
  photo: Camera,
  reel: Film,
};

export default function SubmissionsManager() {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const utils = trpc.useUtils();
  const list = trpc.submissions.list.useQuery({ status: filter === "all" ? undefined : filter });
  const moderate = trpc.submissions.moderate.useMutation({
    onSuccess: () => {
      utils.submissions.list.invalidate();
    },
  });

  const counts = {
    pending:  list.data?.filter((s) => s.status === "pending").length ?? 0,
    approved: list.data?.filter((s) => s.status === "approved").length ?? 0,
    rejected: list.data?.filter((s) => s.status === "rejected").length ?? 0,
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: "pending" as StatusFilter, label: "Pending", count: counts.pending, color: "amber" },
          { id: "approved" as StatusFilter, label: "Approved", count: counts.approved, color: "emerald" },
          { id: "rejected" as StatusFilter, label: "Rejected", count: counts.rejected, color: "red" },
          { id: "all" as StatusFilter, label: "All", count: list.data?.length ?? 0, color: "slate" },
        ]).map((t) => {
          const active = filter === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition"
              style={{
                background: active ? "linear-gradient(135deg, #0891B2, #7C3AED)" : "white",
                color: active ? "white" : "#475569",
                border: `1px solid ${active ? "transparent" : "rgba(15,23,42,0.08)"}`,
              }}
            >
              {t.label}
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: active ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.06)" }}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {list.isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </div>
      )}

      {list.data?.length === 0 && (
        <div className="rounded-2xl bg-white p-12 text-center" style={{ border: "1px solid rgba(15,23,42,0.06)" }}>
          <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <div className="text-sm text-slate-500">
            {filter === "pending" ? "No submissions waiting for review." : `No ${filter === "all" ? "" : filter} submissions yet.`}
          </div>
        </div>
      )}

      {list.data && list.data.length > 0 && (
        <div className="space-y-3">
          {list.data.map((sub) => {
            const Icon = TYPE_ICONS[sub.type as keyof typeof TYPE_ICONS] || MessageSquare;
            return (
              <div
                key={sub.id}
                className="rounded-2xl bg-white p-5"
                style={{ border: "1px solid rgba(15,23,42,0.08)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(124,58,237,0.08))" }}
                    >
                      <Icon className="w-4 h-4 text-cyan-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{sub.authorName}</span>
                        {sub.authorCountry && <span className="text-xs text-slate-500">{sub.authorCountry}</span>}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{
                            background: sub.status === "pending" ? "rgba(245,158,11,0.12)"
                              : sub.status === "approved" ? "rgba(16,185,129,0.12)"
                              : "rgba(239,68,68,0.12)",
                            color: sub.status === "pending" ? "#B45309"
                              : sub.status === "approved" ? "#047857"
                              : "#B91C1C",
                          }}
                        >
                          {sub.status}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-500">
                          {sub.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {sub.authorContact || "no contact provided"} · {new Date(sub.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">{sub.body}</p>

                {sub.fileUrl && (
                  <a
                    href={sub.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-700 hover:text-cyan-900 font-semibold mb-3"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open attachment
                  </a>
                )}

                {sub.adminNotes && (
                  <div className="text-xs text-slate-600 italic px-3 py-2 rounded-lg bg-slate-50 mb-3">
                    Note: {sub.adminNotes}
                  </div>
                )}

                {sub.status === "pending" && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: "rgba(15,23,42,0.06)" }}>
                    <button
                      onClick={() => moderate.mutate({ id: sub.id, status: "approved" })}
                      disabled={moderate.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "white" }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt("Reason for rejecting (optional):");
                        moderate.mutate({ id: sub.id, status: "rejected", adminNotes: note ?? undefined });
                      }}
                      disabled={moderate.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#B91C1C", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
