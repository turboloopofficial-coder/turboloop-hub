// CRM Dashboard (Task B). Three sub-tabs inside one parent admin tab:
//   • Overview — top-level metric cards + cross-table recent activity
//   • Newsletter — data grid, GDPR-aware filters, client-side CSV export
//   • Chats — recent chatbot conversations + drill-in view + 14-day
//     traffic sparkline
//
// All sub-tabs share the same `crm.*` tRPC routes (admin-only). No new
// REST endpoints — CSV is built client-side from the same `list` query
// the table consumes, which keeps the auth surface flat.

import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Download,
  Loader2,
  Mail,
  Users,
  Inbox,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

export function CRMDashboard() {
  return (
    <Tabs defaultValue="overview" className="space-y-5">
      <TabsList className="bg-slate-50 border border-slate-200">
        <TabsTrigger value="overview">
          <TrendingUp className="h-3.5 w-3.5 mr-1" /> Overview
        </TabsTrigger>
        <TabsTrigger value="newsletter">
          <Mail className="h-3.5 w-3.5 mr-1" /> Newsletter
        </TabsTrigger>
        <TabsTrigger value="chats">
          <MessageCircle className="h-3.5 w-3.5 mr-1" /> Chats
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab />
      </TabsContent>
      <TabsContent value="newsletter">
        <NewsletterTab />
      </TabsContent>
      <TabsContent value="chats">
        <ChatsTab />
      </TabsContent>
    </Tabs>
  );
}

// ─── Overview ─────────────────────────────────────────────────────
function OverviewTab() {
  const metrics = trpc.crm.overview.useQuery();
  const activity = trpc.crm.recentActivity.useQuery();

  if (metrics.isPending) return <PendingState />;
  const m = metrics.data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Mail className="h-4 w-4" />}
          label="Newsletter subscribers"
          value={m?.newsletterTotal ?? 0}
          sub={
            m && m.newsletterUnsubscribed > 0
              ? `${m.newsletterUnsubscribed} unsubscribed`
              : "no unsubscribes"
          }
        />
        <MetricCard
          icon={<Inbox className="h-4 w-4" />}
          label="Pending submissions"
          value={m?.pendingSubmissions ?? 0}
          sub="awaiting moderation"
        />
        <MetricCard
          icon={<Users className="h-4 w-4" />}
          label="Pending event apps"
          value={m?.pendingEventApplications ?? 0}
          sub="awaiting review"
        />
        <MetricCard
          icon={<MessageCircle className="h-4 w-4" />}
          label="Chats — last 7 days"
          value={m?.chatConversationsLast7d ?? 0}
          sub={`${m?.chatMessagesLast7d ?? 0} messages total`}
        />
      </div>

      <div>
        <h3 className="font-bold text-slate-900 mb-2">Recent activity</h3>
        <p className="text-xs text-slate-500 mb-3">
          Newest 50 events across newsletter, submissions, event
          applications, and chats. Use the dedicated tabs to drill in.
        </p>
        {activity.isPending ? (
          <PendingState />
        ) : (
          <ActivityFeed rows={activity.data ?? []} />
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-cyan-700 mb-2">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
        {value.toLocaleString()}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </Card>
  );
}

type ActivityRow = {
  type: "newsletter" | "submission" | "event_app" | "chat";
  id: number;
  label: string;
  detail: string;
  createdAt: string | Date;
};

function ActivityFeed({ rows }: { rows: ActivityRow[] }) {
  if (rows.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-500 text-sm">
        No recent activity.
      </Card>
    );
  }
  return (
    <Card className="divide-y divide-slate-100">
      {rows.map((r, idx) => (
        <div
          key={`${r.type}-${r.id}-${idx}`}
          className="flex items-center gap-3 px-4 py-3 text-sm"
        >
          <TypeBadge type={r.type} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900 truncate">
              {r.label}
            </div>
            <div className="text-xs text-slate-500 truncate">{r.detail}</div>
          </div>
          <div className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
            {timeAgo(new Date(r.createdAt))}
          </div>
        </div>
      ))}
    </Card>
  );
}

function TypeBadge({ type }: { type: ActivityRow["type"] }) {
  const cfg = {
    newsletter: { label: "Newsletter", cls: "bg-cyan-50 text-cyan-700" },
    submission: { label: "Submission", cls: "bg-amber-50 text-amber-700" },
    event_app: { label: "Event app", cls: "bg-violet-50 text-violet-700" },
    chat: { label: "Chat", cls: "bg-emerald-50 text-emerald-700" },
  }[type];
  return (
    <span
      className={`shrink-0 text-[0.625rem] font-bold tracking-[0.18em] uppercase px-1.5 py-0.5 rounded ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

function timeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86_400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86_400)}d`;
}

// ─── Newsletter ───────────────────────────────────────────────────
function NewsletterTab() {
  const [includeUnsubscribed, setIncludeUnsubscribed] = useState(false);
  const [query, setQuery] = useState("");

  const list = trpc.newsletter.list.useQuery({
    limit: 10_000,
    includeUnsubscribed,
  });
  const count = trpc.newsletter.count.useQuery();

  const filtered = useMemo(() => {
    const rows = list.data ?? [];
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      r =>
        r.email.toLowerCase().includes(q) ||
        (r.source ?? "").toLowerCase().includes(q) ||
        (r.consentSourceUrl ?? "").toLowerCase().includes(q) ||
        (r.ipCountry ?? "").toLowerCase().includes(q)
    );
  }, [list.data, query]);

  function exportCsv() {
    const rows = filtered;
    if (rows.length === 0) return;
    const headers = [
      "email",
      "source",
      "consent_method",
      "consent_text",
      "consent_source_url",
      "ip_country",
      "subscribed_at",
      "unsubscribed_at",
      "unsubscribe_reason",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      // RFC 4180 CSV escaping — quote if contains comma/quote/newline.
      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [
      headers.join(","),
      ...rows.map(r =>
        [
          r.email,
          r.source,
          r.consentMethod,
          r.consentText,
          r.consentSourceUrl,
          r.ipCountry,
          r.createdAt,
          r.unsubscribedAt,
          r.unsubscribeReason,
        ]
          .map(escape)
          .join(",")
      ),
    ];
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `turboloop-newsletter-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (list.isPending) return <PendingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-slate-900">Newsletter subscribers</h3>
          <p className="text-xs text-slate-500">
            {(count.data ?? 0).toLocaleString()} active subscribers ·{" "}
            {filtered.length.toLocaleString()} shown
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-1.5 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={includeUnsubscribed}
              onChange={e => setIncludeUnsubscribed(e.target.checked)}
            />
            Include unsubscribed
          </label>
          <Button onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Filter by email, source, country…"
        className="max-w-md"
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-slate-500">
            <tr>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Source</th>
              <th className="text-left px-4 py-2">Consent</th>
              <th className="text-left px-4 py-2">Country</th>
              <th className="text-left px-4 py-2">Subscribed</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-slate-400 py-10">
                  No subscribers match the filter.
                </td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-xs">{r.email}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">
                    {r.source ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-600">
                    {r.consentMethod ?? (
                      <span className="text-amber-600">legacy</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-600">
                    {r.ipCountry ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500 tabular-nums">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {r.unsubscribedAt ? (
                      <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold tracking-[0.18em] uppercase bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">
                        <XCircle className="h-3 w-3" /> Unsub
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold tracking-[0.18em] uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <strong>GDPR reminder:</strong> rows with "legacy" consent pre-date
          the consent tracking migration. Before exporting to an email
          tool, confirm those addresses opted in via a documented channel
          (signup form, in-person event, etc.) or exclude them.
        </div>
      </div>
    </div>
  );
}

// ─── Chats ────────────────────────────────────────────────────────
function ChatsTab() {
  const conversations = trpc.crm.chatConversations.useQuery();
  const activity = trpc.crm.chatActivity.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (conversations.isPending) return <PendingState />;

  const rows = conversations.data ?? [];
  const sparkData = activity.data ?? [];
  const maxMessages = Math.max(1, ...sparkData.map(d => d.messages));
  const totalConvs = sparkData.reduce((s, d) => s + d.conversations, 0);
  const totalMsgs = sparkData.reduce((s, d) => s + d.messages, 0);
  const totalTokens = sparkData.reduce(
    (s, d) => s + d.tokensIn + d.tokensOut,
    0
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<MessageCircle className="h-4 w-4" />}
          label="Conversations (14d)"
          value={totalConvs}
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Messages (14d)"
          value={totalMsgs}
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Tokens used (14d)"
          value={totalTokens}
          sub="in + out"
        />
      </div>

      <Card className="p-4">
        <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-slate-500 mb-3">
          Daily messages — last 14 days
        </div>
        <div className="flex items-end gap-1 h-24">
          {sparkData.map(d => (
            <div
              key={d.date}
              className="flex-1 bg-cyan-200 rounded-t"
              style={{
                height: `${(d.messages / maxMessages) * 100}%`,
                minHeight: d.messages > 0 ? "4px" : "1px",
              }}
              title={`${d.date}: ${d.messages} messages, ${d.tokensIn + d.tokensOut} tokens`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[0.625rem] text-slate-400 mt-1 tabular-nums">
          <span>{sparkData[0]?.date.slice(5) ?? ""}</span>
          <span>
            {sparkData[sparkData.length - 1]?.date.slice(5) ?? ""}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 max-h-[600px] overflow-y-auto">
          <div className="px-4 py-2 text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-slate-500 border-b border-slate-100">
            Recent conversations ({rows.length})
          </div>
          {rows.length === 0 ? (
            <div className="text-sm text-slate-500 py-8 text-center">
              No conversations yet. Try the chatbot on /
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map(c => (
                <li
                  key={c.id}
                  className={`px-4 py-2 cursor-pointer hover:bg-slate-50 ${
                    selectedId === c.id ? "bg-cyan-50" : ""
                  }`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="font-mono text-xs text-slate-900">
                    {c.sessionId.slice(0, 12)}…
                  </div>
                  <div className="text-[0.625rem] text-slate-500 flex gap-2 mt-0.5">
                    <span>{c.turnCount} turns</span>
                    <span>·</span>
                    <span>{c.country ?? "??"}</span>
                    <span>·</span>
                    <span className="tabular-nums">
                      {timeAgo(new Date(c.lastActivityAt))} ago
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="md:col-span-2 max-h-[600px] overflow-y-auto">
          {selectedId === null ? (
            <div className="text-sm text-slate-500 py-16 text-center">
              Select a conversation to view messages.
            </div>
          ) : (
            <ConversationDetail
              conversationId={selectedId}
              onClose={() => setSelectedId(null)}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

function ConversationDetail({
  conversationId,
  onClose,
}: {
  conversationId: number;
  onClose: () => void;
}) {
  const messages = trpc.crm.chatMessages.useQuery({ conversationId });
  if (messages.isPending) return <PendingState />;
  const rows = messages.data ?? [];
  return (
    <div>
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
        <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-slate-500">
          Conversation #{conversationId} — {rows.length} turns
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="p-4 space-y-2">
        {rows.map(m => (
          <div
            key={m.id}
            className={`text-xs rounded-md p-2 ${
              m.role === "user"
                ? "bg-cyan-50 text-cyan-900 ml-8"
                : "bg-slate-50 text-slate-900 mr-8"
            } ${m.refused ? "border border-amber-300" : ""}`}
          >
            <div className="font-bold text-[0.625rem] tracking-wide uppercase mb-1 opacity-70">
              {m.role}
              {m.refused ? " · refused" : ""}
              {m.tokensIn || m.tokensOut
                ? ` · ${m.tokensIn ?? 0}/${m.tokensOut ?? 0} tok`
                : ""}
            </div>
            <div className="whitespace-pre-wrap break-words">{m.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingState() {
  return (
    <div className="flex items-center gap-2 text-slate-500 py-10 justify-center">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Loading…</span>
    </div>
  );
}
