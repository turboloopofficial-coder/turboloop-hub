// Admin moderation queue for community-submitted content (testimonials, photos,
// reels, stories). Submissions arrive from /submit with status='pending'.
// Admin reviews, then either approves (eligible to feature) or rejects (hidden).

import { useState } from "react";
import {
  Loader2, Check, X, Clock, MessageSquare, Camera, Film, BookOpen,
  ExternalLink, Wallet, DollarSign, Eye,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

type StatusFilter = "pending" | "approved" | "payment_due" | "paid" | "rejected" | "all";

const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  pending:      { bg: "rgba(245,158,11,0.12)", fg: "#B45309" },
  approved:     { bg: "rgba(16,185,129,0.12)", fg: "#047857" },
  payment_due:  { bg: "rgba(8,145,178,0.14)",  fg: "#0E7490" },
  paid:         { bg: "rgba(124,58,237,0.14)", fg: "#6D28D9" },
  rejected:     { bg: "rgba(239,68,68,0.12)",  fg: "#B91C1C" },
};

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
    pending:     list.data?.filter((s) => s.status === "pending").length ?? 0,
    approved:    list.data?.filter((s) => s.status === "approved").length ?? 0,
    payment_due: list.data?.filter((s) => s.status === "payment_due").length ?? 0,
    paid:        list.data?.filter((s) => s.status === "paid").length ?? 0,
    rejected:    list.data?.filter((s) => s.status === "rejected").length ?? 0,
  };

  const updatePayout = trpc.submissions.updatePayout.useMutation({
    onSuccess: () => utils.submissions.list.invalidate(),
  });

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: "pending" as StatusFilter, label: "Pending", count: counts.pending },
          { id: "approved" as StatusFilter, label: "Approved", count: counts.approved },
          { id: "payment_due" as StatusFilter, label: "Payment Due", count: counts.payment_due },
          { id: "paid" as StatusFilter, label: "Paid", count: counts.paid },
          { id: "rejected" as StatusFilter, label: "Rejected", count: counts.rejected },
          { id: "all" as StatusFilter, label: "All", count: list.data?.length ?? 0 },
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
                            background: STATUS_COLOR[sub.status]?.bg ?? "rgba(15,23,42,0.06)",
                            color: STATUS_COLOR[sub.status]?.fg ?? "#475569",
                          }}
                        >
                          {sub.status.replace("_", " ")}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-500">
                          {sub.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(sub.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact bar — WhatsApp (primary, tappable) + email +
                    Telegram + other social + legacy authorContact fallback.
                    Shows whichever of these fields are populated; hides the
                    block entirely if none are set (extremely rare — every
                    new submission requires whatsappNumber). */}
                {(sub.whatsappNumber || sub.email || sub.telegramHandle || sub.otherSocial || sub.authorContact) && (
                  <div className="flex flex-wrap gap-2 mb-3 text-xs">
                    {sub.whatsappNumber && (
                      <a
                        href={`https://wa.me/${(sub.whatsappNumber || "").replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-bold hover:bg-green-100"
                        title="Open WhatsApp chat"
                      >
                        💬 {sub.whatsappNumber}
                      </a>
                    )}
                    {sub.email && (
                      <a
                        href={`mailto:${sub.email}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                      >
                        ✉️ {sub.email}
                      </a>
                    )}
                    {sub.telegramHandle && (
                      <a
                        href={`https://t.me/${sub.telegramHandle.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100"
                      >
                        ✈️ {sub.telegramHandle}
                      </a>
                    )}
                    {sub.otherSocial && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        🌐 {sub.otherSocial}
                      </span>
                    )}
                    {sub.authorContact && !sub.whatsappNumber && !sub.email && !sub.telegramHandle && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        legacy: {sub.authorContact}
                      </span>
                    )}
                  </div>
                )}

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

                {/* Creator Star payout fields — wallet, youtube,
                    view count, payout amount. Editable inline. */}
                {(sub.walletAddress || sub.youtubeUrl || sub.viewCount !== null || sub.payoutAmountUsd !== null) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3 pt-3 border-t" style={{ borderColor: "rgba(15,23,42,0.06)" }}>
                    {sub.youtubeUrl && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Film className="w-3 h-3 text-slate-400 shrink-0" />
                        <a href={sub.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-700 hover:underline truncate">
                          {sub.youtubeUrl}
                        </a>
                      </div>
                    )}
                    {sub.walletAddress && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Wallet className="w-3 h-3 text-slate-400 shrink-0" />
                        <code className="font-mono text-[11px] text-slate-700 break-all">{sub.walletAddress}</code>
                      </div>
                    )}
                    {sub.viewCount !== null && sub.viewCount !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-700 tabular-nums">{sub.viewCount.toLocaleString()} views</span>
                        {sub.viewCountCheckedAt && (
                          <span className="text-slate-400 text-[10px]">· checked {new Date(sub.viewCountCheckedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                    {sub.payoutAmountUsd !== null && sub.payoutAmountUsd !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold tabular-nums">${sub.payoutAmountUsd.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {sub.adminNotes && (
                  <div className="text-xs text-slate-600 italic px-3 py-2 rounded-lg bg-slate-50 mb-3">
                    Note: {sub.adminNotes}
                  </div>
                )}

                {/* Status-action row — full lifecycle: pending →
                    approved → payment_due → paid. Reject available
                    from any non-terminal status. */}
                {sub.status !== "paid" && sub.status !== "rejected" && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: "rgba(15,23,42,0.06)" }}>
                    {sub.status === "pending" && (
                      <button
                        onClick={() => moderate.mutate({ id: sub.id, status: "approved" })}
                        disabled={moderate.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "white" }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                    )}
                    {sub.status === "approved" && (
                      <button
                        onClick={() => {
                          const views = prompt("Current view count (number, optional):");
                          const payout = prompt("Suggested payout in USD (number, optional):");
                          // Update payout fields first (separate mutation).
                          if (views || payout) {
                            updatePayout.mutate({
                              id: sub.id,
                              viewCount: views ? parseInt(views, 10) : undefined,
                              payoutAmountUsd: payout ? parseInt(payout, 10) : undefined,
                            });
                          }
                          moderate.mutate({ id: sub.id, status: "payment_due" });
                        }}
                        disabled={moderate.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #0891B2, #0E7490)", color: "white" }}
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Queue payout
                      </button>
                    )}
                    {sub.status === "payment_due" && (
                      <button
                        onClick={() => moderate.mutate({ id: sub.id, status: "paid" })}
                        disabled={moderate.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "white" }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark paid
                      </button>
                    )}
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
