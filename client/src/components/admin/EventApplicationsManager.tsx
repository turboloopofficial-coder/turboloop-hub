// Admin moderation queue for /events Local Presenter sponsorship
// applications. Pulls from submissions.listEventApplications (admin-
// only). Approve/reject via submissions.moderateEventApplication.

import { useState } from "react";
import {
  Loader2,
  Check,
  X,
  Clock,
  MapPin,
  Users,
  Calendar,
  Wallet,
  MessageSquare,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

const TIER_LABEL: Record<string, string> = {
  local: "Local Meetup",
  city: "City Seminar",
  regional: "Regional Conference",
  national: "National Summit",
};

export default function EventApplicationsManager() {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const utils = trpc.useUtils();
  const list = trpc.submissions.listEventApplications.useQuery({
    status: filter === "all" ? undefined : filter,
  });
  const moderate = trpc.submissions.moderateEventApplication.useMutation({
    onSuccess: () => utils.submissions.listEventApplications.invalidate(),
  });

  const counts = {
    pending: list.data?.filter(s => s.status === "pending").length ?? 0,
    approved: list.data?.filter(s => s.status === "approved").length ?? 0,
    rejected: list.data?.filter(s => s.status === "rejected").length ?? 0,
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Filter tabs — same shape as SubmissionsManager so the admin UX
          stays consistent. */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: "pending" as StatusFilter, label: "Pending", count: counts.pending },
          { id: "approved" as StatusFilter, label: "Approved", count: counts.approved },
          { id: "rejected" as StatusFilter, label: "Rejected", count: counts.rejected },
          { id: "all" as StatusFilter, label: "All", count: list.data?.length ?? 0 },
        ]).map(t => {
          const active = filter === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition"
              style={{
                background: active
                  ? "linear-gradient(135deg, #0891B2, #7C3AED)"
                  : "white",
                color: active ? "white" : "#475569",
                border: `1px solid ${active ? "transparent" : "rgba(15,23,42,0.08)"}`,
              }}
            >
              {t.label}
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: active
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(15,23,42,0.06)",
                }}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {list.isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading event applications…
        </div>
      )}

      {list.data?.length === 0 && (
        <div
          className="rounded-2xl bg-white p-12 text-center"
          style={{ border: "1px solid rgba(15,23,42,0.06)" }}
        >
          <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <div className="text-sm text-slate-500">
            {filter === "pending"
              ? "No event applications waiting for review."
              : `No ${filter === "all" ? "" : filter} event applications yet.`}
          </div>
        </div>
      )}

      {list.data && list.data.length > 0 && (
        <div className="space-y-3">
          {list.data.map(app => (
            <div
              key={app.id}
              className="rounded-2xl bg-white p-5"
              style={{ border: "1px solid rgba(15,23,42,0.08)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(124,58,237,0.08))",
                    }}
                  >
                    <MapPin className="w-4 h-4 text-cyan-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {TIER_LABEL[app.tier] ?? app.tier}
                      </span>
                      <span className="text-xs text-slate-500">
                        {app.cityCountry}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{
                          background:
                            app.status === "pending"
                              ? "rgba(245,158,11,0.12)"
                              : app.status === "approved"
                                ? "rgba(16,185,129,0.12)"
                                : "rgba(239,68,68,0.12)",
                          color:
                            app.status === "pending"
                              ? "#B45309"
                              : app.status === "approved"
                                ? "#047857"
                                : "#B91C1C",
                        }}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(app.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs mb-3">
                <Field icon={Calendar} label="Requested date" value={app.requestedDate} />
                <Field icon={Users} label="Expected attendees" value={String(app.expectedAttendees)} />
                <Field icon={Users} label="Team size" value={String(app.teamSize)} />
                <Field icon={MessageSquare} label="Telegram" value={`@${app.telegramId.replace(/^@/, "")}`} />
                <Field icon={MessageSquare} label="WhatsApp" value={app.whatsappNumber} />
                <Field icon={Wallet} label="Wallet" value={app.walletAddress} mono />
              </div>

              {app.adminNotes && (
                <div className="text-xs text-slate-600 italic px-3 py-2 rounded-lg bg-slate-50 mb-3">
                  Note: {app.adminNotes}
                </div>
              )}

              {app.status === "pending" && (
                <div
                  className="flex flex-wrap gap-2 pt-3 border-t"
                  style={{ borderColor: "rgba(15,23,42,0.06)" }}
                >
                  <button
                    onClick={() =>
                      moderate.mutate({ id: app.id, status: "approved" })
                    }
                    disabled={moderate.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50"
                    style={{
                      background:
                        "linear-gradient(135deg, #10B981, #059669)",
                      color: "white",
                    }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt("Reason for rejecting (optional):");
                      moderate.mutate({
                        id: app.id,
                        status: "rejected",
                        adminNotes: note ?? undefined,
                      });
                    }}
                    disabled={moderate.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#B91C1C",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <Icon className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
          {label}
        </div>
        <div
          className={`text-slate-700 ${mono ? "font-mono break-all" : ""}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
