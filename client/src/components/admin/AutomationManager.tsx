// Admin → Automation tab. Surfaces what the master cron has fired (and
// what failed) so ops can audit Telegram broadcasts and blog publishing
// without SSHing into the DB. Five sections:
//
//   1. Activity Log              — raw lastFired:/oneShot:/cronError: keys
//   2. Blog Publish Status       — published counts + next-to-publish
//   3. Telegram Channel Health   — today's fire status per task slot
//   4. Campaign Tracker          — A1-A8 and B1-B7 fired/upcoming/missed
//   5. WhatsApp Copy Helper      — today's 14:00 UTC post as copy-paste text
//
// All sections read from the same `manage.getAutomationLog` + already-
// existing `manage.listBlogPosts` endpoints — no new server reads beyond
// the one log query. Cron error rows (`cronError:taskName:YYYY-MM-DD`)
// are written by cron-master per-task try/catch and rendered in red.

import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  FileText,
  Calendar,
  Megaphone,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

// ─── Campaign schedules (mirror server/_vercel/_campaigns.ts) ───
// Kept here as a literal so the client can render the full tracker
// without an extra fetch. The id+date pairs MUST match _campaigns.ts;
// if you change a campaign date there, change it here too.
const CAMPAIGN_A: { id: string; date: string }[] = [
  { id: "A1", date: "2026-05-15" },
  { id: "A2", date: "2026-05-17" },
  { id: "A3", date: "2026-05-19" },
  { id: "A4", date: "2026-05-21" },
  { id: "A5", date: "2026-05-23" },
  { id: "A6", date: "2026-05-25" },
  { id: "A7", date: "2026-05-27" },
  { id: "A8", date: "2026-05-29" },
];
const CAMPAIGN_B: { id: string; date: string }[] = [
  { id: "B1", date: "2026-05-15" },
  { id: "B2", date: "2026-05-16" },
  { id: "B3", date: "2026-05-17" },
  { id: "B4", date: "2026-05-18" },
  { id: "B5", date: "2026-05-20" },
  { id: "B6", date: "2026-05-22" },
  { id: "B7", date: "2026-05-23" },
];

// ─── Tasks rendered in Section 3 — Telegram Channel Health ───
// Order mirrors the daily cron cadence so the grid reads top-to-bottom
// in firing order. Every entry's `key` matches the dedup slot id used
// by cron-master's `markFired(db, "<key>")` / `markTgResult(db, "<key>", …)`.
const DAILY_TASKS: { key: string; label: string; channel: string; time: string }[] = [
  { key: "midnight:math",      label: "Midnight math",      channel: "EN/DE (alternates)", time: "00:00 UTC" },
  { key: "global:reach",       label: "Global reach",       channel: "EN Channel",         time: "02:00 UTC" },
  { key: "security:promo",     label: "Security promo",     channel: "EN Channel",         time: "04:00 UTC" },
  { key: "morning:hook",       label: "Morning hook",       channel: "EN Channel",         time: "06:00 UTC" },
  { key: "ecosystem:promo",    label: "Ecosystem promo",    channel: "EN Channel",         time: "08:00 UTC" },
  { key: "hubPromo",           label: "Hub promo",          channel: "EN Channel",         time: "09:00 UTC" },
  { key: "burn:proof",         label: "Live burn proof",    channel: "EN Channel",         time: "10:00 UTC" },
  { key: "campaignA",          label: "Campaign A",         channel: "EN Channel",         time: "10:00 UTC" },
  { key: "germanDaily",        label: "German daily",       channel: "DE Group",           time: "11:00 UTC" },
  { key: "bot:commands",       label: "Bot commands guide", channel: "EN Channel",         time: "11:30 UTC" },
  { key: "monthly:compound",   label: "Monthly compound",   channel: "EN/DE (alternates)", time: "12:00 UTC" },
  { key: "social:wall",        label: "Social wall promo",  channel: "EN Channel",         time: "13:00 UTC" },
  { key: "blog:evening",       label: "Blog publish",       channel: "Per-post language",  time: "14:00 UTC" },
  { key: "zoom:hi:T30",        label: "Zoom HI T-30",       channel: "EN Channel",         time: "15:00 UTC" },
  { key: "community:promo",    label: "Community promo",    channel: "EN Channel",         time: "16:00 UTC" },
  { key: "zoom:en:T30",        label: "Zoom EN T-30",       channel: "EN Channel",         time: "16:30 UTC" },
  { key: "events:promo",       label: "Events promo",       channel: "EN Channel",         time: "17:00 UTC" },
  { key: "cinematic:daily",    label: "Cinematic film",     channel: "EN Channel",         time: "18:00 UTC" },
  { key: "live:stats",         label: "Live stats",         channel: "EN Channel",         time: "20:00 UTC" },
  { key: "nightly:education",  label: "Nightly education",  channel: "EN Channel",         time: "22:00 UTC" },
  { key: "campaignB",          label: "Campaign B",         channel: "EN Channel",         time: "13:00 UTC*" },
];

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    });
  } catch { return iso; }
}

export default function AutomationManager() {
  const utils = trpc.useUtils();
  const logQuery = trpc.manage.getAutomationLog.useQuery({ limit: 500 });
  const blogQuery = trpc.manage.listBlogPosts.useQuery();

  const log = logQuery.data ?? [];
  const posts = blogQuery.data ?? [];
  const today = todayUtc();

  // Build a fast lookup: which tasks fired today, which have an error today.
  const firedTodayByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of log) {
      if (e.kind === "lastFired" && e.dateKey === today) {
        map.set(e.taskName, e.value);
      }
    }
    return map;
  }, [log, today]);

  const errorTodayByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of log) {
      if (e.kind === "cronError" && e.dateKey === today) {
        map.set(e.taskName, e.value);
      }
    }
    return map;
  }, [log, today]);

  // Per-slot Telegram delivery receipts from cron-master's markTgResult.
  // Same date-key shape as cronError; the value carries a compact
  // chatId:ok|err summary plus an optional note (slot-specific label).
  const tgResultTodayByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of log) {
      if (e.kind === "tgResult" && e.dateKey === today) {
        map.set(e.taskName, e.value);
      }
    }
    return map;
  }, [log, today]);

  // Did campaignA/B ever fire on a given date? Used by the Campaign
  // Tracker to mark each scheduled post Fired / Missed / Upcoming.
  // We scan the full log (not just today) since campaigns span weeks.
  const firedByKeyDate = useMemo(() => {
    const map = new Map<string, true>(); // composite key: `taskName|dateKey`
    for (const e of log) {
      if (e.kind === "lastFired" && e.dateKey) {
        map.set(`${e.taskName}|${e.dateKey}`, true);
      }
    }
    return map;
  }, [log]);

  const refresh = () => {
    utils.manage.getAutomationLog.invalidate();
    utils.manage.listBlogPosts.invalidate();
  };

  return (
    <div className="space-y-8">
      <ActivityLogSection
        entries={log}
        loading={logQuery.isLoading}
        onRefresh={refresh}
      />
      <BlogPublishSection posts={posts} loading={blogQuery.isLoading} onRefresh={refresh} />
      <TelegramHealthSection
        firedTodayByKey={firedTodayByKey}
        errorTodayByKey={errorTodayByKey}
        tgResultTodayByKey={tgResultTodayByKey}
        loading={logQuery.isLoading}
      />
      <CampaignTrackerSection
        firedByKeyDate={firedByKeyDate}
        loading={logQuery.isLoading}
      />
      <WhatsAppCopyHelperSection posts={posts} loading={blogQuery.isLoading} />
    </div>
  );
}

// ============ Section 1 — Activity Log ============

function ActivityLogSection(props: {
  entries: Array<{
    settingKey: string;
    kind: "lastFired" | "oneShot" | "cronError" | "tgResult";
    taskName: string;
    dateKey: string | null;
    value: string;
    updatedAt: string | Date;
  }>;
  loading: boolean;
  onRefresh: () => void;
}) {
  const { entries, loading, onRefresh } = props;
  // Display the most-recent 500, newest first. The server already returns
  // ordered by settingValue DESC; lastFired/cronError rows store an ISO
  // timestamp so that ordering reads "newest first" naturally.
  const rows = entries.slice(0, 500);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-heading font-bold text-slate-800">Activity log</h3>
          <p className="text-xs text-slate-500">
            Last 500 cron fires + errors across all tasks. Newest first (~7 days of history).
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefresh}
          className="text-cyan-700 hover:bg-cyan-600/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex items-center justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading log…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No activity yet. Cron rows appear here as soon as a task fires.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5 font-semibold">Task</th>
                <th className="px-4 py-2.5 font-semibold">Kind</th>
                <th className="px-4 py-2.5 font-semibold">When</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isError = r.kind === "cronError";
                const isOneShot = r.kind === "oneShot";
                // For lastFired/cronError the value starts with an ISO
                // timestamp; oneShot stores just the ISO. Both render
                // the same way after we split off the suffix.
                const tsCandidate = r.value.includes(" | ")
                  ? r.value.split(" | ")[0]
                  : r.value;
                const errMsg = r.value.includes(" | ")
                  ? r.value.split(" | ").slice(1).join(" | ")
                  : null;
                return (
                  <tr
                    key={r.settingKey}
                    className={`border-b border-slate-100 last:border-0 ${
                      isError ? "bg-red-50/60" : ""
                    }`}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-700">
                      {r.taskName}
                      {r.dateKey && (
                        <span className="ml-1.5 text-slate-400">· {r.dateKey}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {isError ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                          <AlertTriangle className="h-3 w-3" /> error
                        </span>
                      ) : isOneShot ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-100 text-violet-700">
                          oneShot
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                          fired
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                      {formatWhen(tsCandidate)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {errMsg ? (
                        <span className="text-red-700" title={errMsg}>
                          {errMsg.length > 80 ? errMsg.slice(0, 80) + "…" : errMsg}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> ok
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

// ============ Section 2 — Blog Publish Status ============

function BlogPublishSection(props: {
  posts: any[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const { posts, loading, onRefresh } = props;
  const now = new Date();

  const stats = useMemo(() => {
    let published = 0;
    let scheduled = 0;
    let draft = 0;
    for (const p of posts) {
      if (p.published) published++;
      else if (p.scheduledPublishAt && new Date(p.scheduledPublishAt) > now) scheduled++;
      else draft++;
    }
    return { published, scheduled, draft };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const nextScheduled = useMemo(() => {
    const future = posts
      .filter((p) => !p.published && p.scheduledPublishAt && new Date(p.scheduledPublishAt) > now)
      .sort(
        (a, b) =>
          new Date(a.scheduledPublishAt).getTime() -
          new Date(b.scheduledPublishAt).getTime()
      );
    return future[0] || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const lastFive = useMemo(() => {
    return posts
      .filter((p) => p.published)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [posts]);

  const [firing, setFiring] = useState(false);
  const handleForcePublish = async () => {
    setFiring(true);
    try {
      const r = await fetch("/api/cron/publish-blog");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json().catch(() => ({}));
      toast.success("Publish job fired — see Activity log for result");
      console.info("[force-publish]", j);
      onRefresh();
    } catch (e) {
      toast.error(`Force-publish failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setFiring(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-heading font-bold text-slate-800">Blog publish status</h3>
          <p className="text-xs text-slate-500">
            Live counts pulled from the same query the public blog grid uses.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleForcePublish}
          disabled={firing}
          className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20 hover:bg-cyan-600/20"
        >
          {firing ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Megaphone className="h-3.5 w-3.5 mr-1" />
          )}
          Force publish now
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Published"  value={stats.published}  loading={loading} accent="emerald" />
        <StatCard label="Scheduled"  value={stats.scheduled}  loading={loading} accent="cyan" />
        <StatCard label="Draft"      value={stats.draft}      loading={loading} accent="slate" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-cyan-600" />
            <h4 className="text-sm font-bold text-slate-800">Next to publish</h4>
          </div>
          {loading ? (
            <div className="text-xs text-slate-400">Loading…</div>
          ) : nextScheduled ? (
            <div className="text-sm">
              <div className="font-medium text-slate-700 line-clamp-2">{nextScheduled.title}</div>
              <div className="text-xs text-slate-500 mt-1">
                {formatWhen(nextScheduled.scheduledPublishAt)} ·{" "}
                <span className="font-mono">{nextScheduled.language}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              No future-scheduled drafts. Cron will idle at 14:00 UTC.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-cyan-600" />
            <h4 className="text-sm font-bold text-slate-800">Last 5 published</h4>
          </div>
          {loading ? (
            <div className="text-xs text-slate-400">Loading…</div>
          ) : lastFive.length === 0 ? (
            <div className="text-xs text-slate-500">No published posts yet.</div>
          ) : (
            <ul className="space-y-1.5">
              {lastFive.map((p) => (
                <li key={p.id} className="text-xs text-slate-600 flex items-baseline gap-1.5">
                  <span className="font-mono text-slate-400 shrink-0">{p.language}</span>
                  <a
                    href={`/blog/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-700 hover:underline truncate"
                  >
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard(props: {
  label: string;
  value: number;
  loading: boolean;
  accent: "emerald" | "cyan" | "slate";
}) {
  const accentClass = {
    emerald: "text-emerald-700",
    cyan: "text-cyan-700",
    slate: "text-slate-700",
  }[props.accent];
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{props.label}</div>
      <div className={`text-3xl font-heading font-bold ${accentClass}`}>
        {props.loading ? "—" : props.value}
      </div>
    </div>
  );
}

// ============ Section 3 — Telegram Channel Health ============

function TelegramHealthSection(props: {
  firedTodayByKey: Map<string, string>;
  errorTodayByKey: Map<string, string>;
  tgResultTodayByKey: Map<string, string>;
  loading: boolean;
}) {
  const { firedTodayByKey, errorTodayByKey, tgResultTodayByKey, loading } = props;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-heading font-bold text-slate-800">Telegram channel health</h3>
        <p className="text-xs text-slate-500">
          Today&apos;s ({todayUtc()}) fire status per task slot, with the live Telegram
          delivery receipt and inline error detail. Red = not fired, errored, or
          Telegram refused.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5 font-semibold">Task</th>
              <th className="px-4 py-2.5 font-semibold">Channel</th>
              <th className="px-4 py-2.5 font-semibold">Window</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 font-semibold">Telegram result</th>
            </tr>
          </thead>
          <tbody>
            {DAILY_TASKS.map((t) => {
              const fired = firedTodayByKey.get(t.key);
              const err = errorTodayByKey.get(t.key);
              const tgRaw = tgResultTodayByKey.get(t.key);
              return (
                <tr
                  key={t.key}
                  className={`border-b border-slate-100 last:border-0 ${
                    err ? "bg-red-50/60" : ""
                  }`}
                >
                  <td className="px-4 py-2.5 align-top">
                    <div className="font-medium text-slate-700">{t.label}</div>
                    <div className="font-mono text-[10px] text-slate-400">{t.key}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 align-top">{t.channel}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap align-top">{t.time}</td>
                  <td className="px-4 py-2.5 align-top">
                    {loading ? (
                      <span className="text-xs text-slate-400">…</span>
                    ) : err ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          <XCircle className="h-3.5 w-3.5" /> error
                        </span>
                        {/* Inline cronError detail — clipped at 120 chars
                            so a long stack trace doesn't blow up the row.
                            Full text is in the Activity log below. */}
                        <div
                          className="text-[10px] text-red-700/90 leading-snug max-w-[260px] break-words"
                          title={err}
                        >
                          {truncateForRow(err, 120)}
                        </div>
                      </div>
                    ) : fired ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> fired
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        <Clock className="h-3.5 w-3.5" /> not yet
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <TgResultCell loading={loading} raw={tgRaw} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Helper — truncate long strings for the dashboard row without
 *  breaking mid-word. Used by the inline cronError detail and the
 *  Telegram-result cell. */
function truncateForRow(s: string, max: number): string {
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

/** Parse a `tgResult:<slot>:<date>` setting_value into a render-ready
 *  shape. The value format is:
 *    `<iso> | <optional note> | <chatId>:<ok|error> | <chatId>:<ok|error> | …`
 *  We extract the last per-dest segment, infer overall ok-ness, and
 *  surface the first error if any. */
function parseTgResultValue(raw: string): { ok: boolean; summary: string; firstError: string | null } {
  // Split at " | " — first segment is ISO timestamp, optional second
  // is a slot-specific note, rest are chatId:state segments.
  const segments = raw.split(" | ").map((s) => s.trim()).filter(Boolean);
  // Heuristic: anything matching `<chatId>:<state>` is a dest row.
  const destSegments = segments.filter((s) => /^[-@\w]+:.+/.test(s) && !s.startsWith("http"));
  // If destSegments is empty, the value is just `<iso> | no-results`
  // (no token / no channel env). Treat as unknown rather than error.
  if (destSegments.length === 0) {
    return { ok: false, summary: "no destinations", firstError: null };
  }
  const errs = destSegments.filter((s) => !/:ok$/i.test(s));
  if (errs.length === 0) {
    return { ok: true, summary: destSegments.join(" · "), firstError: null };
  }
  const firstErr = errs[0].replace(/^[^:]+:/, "");
  return { ok: false, summary: errs.join(" · "), firstError: firstErr };
}

function TgResultCell({ loading, raw }: { loading: boolean; raw: string | undefined }) {
  if (loading) {
    return <span className="text-xs text-slate-400">…</span>;
  }
  if (!raw) {
    return <span className="text-xs text-slate-400">—</span>;
  }
  const { ok, summary, firstError } = parseTgResultValue(raw);
  if (ok) {
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> ok
        </span>
        <div
          className="text-[10px] text-slate-500 leading-snug max-w-[220px] break-words font-mono"
          title={summary}
        >
          {truncateForRow(summary, 80)}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700"
        title={firstError ?? summary}
      >
        <XCircle className="h-3.5 w-3.5" /> {firstError ? "telegram error" : "no dest"}
      </span>
      <div
        className="text-[10px] text-red-700/90 leading-snug max-w-[220px] break-words"
        title={firstError ?? summary}
      >
        {truncateForRow(firstError ?? summary, 80)}
      </div>
    </div>
  );
}

// ============ Section 4 — Campaign Tracker ============

function CampaignTrackerSection(props: {
  firedByKeyDate: Map<string, true>;
  loading: boolean;
}) {
  const { firedByKeyDate, loading } = props;
  const today = todayUtc();

  // Status per scheduled post: Fired / Upcoming / Missed.
  // - Fired   = there's a `lastFired:<task>:<date>` row for that date
  // - Upcoming = date > today
  // - Missed  = date < today and no fired row exists
  // The campaign task name is the same key both A and B use, but each
  // post has a unique date, so `lastFired:campaignA:<date>` is the
  // composite we look up.
  function statusFor(task: "campaignA" | "campaignB", date: string) {
    if (firedByKeyDate.has(`${task}|${date}`)) return "fired" as const;
    if (date > today) return "upcoming" as const;
    if (date === today) return "today" as const;
    return "missed" as const;
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-heading font-bold text-slate-800">Campaign tracker</h3>
        <p className="text-xs text-slate-500">
          Per-post fire status across the full Campaign A (events) and Campaign B (Port Harcourt) schedules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CampaignTable
          title="Campaign A — Events"
          posts={CAMPAIGN_A}
          statusFor={(d) => statusFor("campaignA", d)}
          loading={loading}
        />
        <CampaignTable
          title="Campaign B — Port Harcourt"
          posts={CAMPAIGN_B}
          statusFor={(d) => statusFor("campaignB", d)}
          loading={loading}
        />
      </div>
    </section>
  );
}

function CampaignTable(props: {
  title: string;
  posts: { id: string; date: string }[];
  statusFor: (date: string) => "fired" | "upcoming" | "today" | "missed";
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <h4 className="text-sm font-bold text-slate-800">{props.title}</h4>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-100">
            <th className="px-4 py-2 font-semibold">Post</th>
            <th className="px-4 py-2 font-semibold">Date</th>
            <th className="px-4 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {props.posts.map((p) => {
            const s = props.statusFor(p.date);
            return (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 font-mono text-xs text-slate-700">{p.id}</td>
                <td className="px-4 py-2 text-xs text-slate-600 whitespace-nowrap">{p.date}</td>
                <td className="px-4 py-2">
                  {props.loading ? (
                    <span className="text-xs text-slate-400">…</span>
                  ) : s === "fired" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Fired
                    </span>
                  ) : s === "today" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700">
                      <Clock className="h-3.5 w-3.5" /> Today
                    </span>
                  ) : s === "upcoming" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      Upcoming
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      <XCircle className="h-3.5 w-3.5" /> Missed
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============ Section 5 — WhatsApp Copy Helper ============

function WhatsAppCopyHelperSection(props: {
  posts: any[];
  loading: boolean;
}) {
  const { posts, loading } = props;

  // The "today's 14:00 UTC blog post" is the post the cron will (or
  // already did) broadcast at 14:00 UTC. We pick the most recently
  // published post whose updatedAt falls on the current UTC date, or
  // the next-scheduled future post if none has fired yet today. This
  // mirrors what the user actually wants to share manually to WhatsApp.
  const today = todayUtc();
  const todaysPost = useMemo(() => {
    // 1. Try a published post updated today.
    const published = posts.filter(
      (p) => p.published && (p.updatedAt ?? p.createdAt) && (new Date(p.updatedAt ?? p.createdAt)).toISOString().slice(0, 10) === today
    );
    if (published.length > 0) {
      published.sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime()
      );
      return published[0];
    }
    // 2. Fallback: the next future-scheduled post.
    const future = posts
      .filter((p) => !p.published && p.scheduledPublishAt)
      .sort(
        (a, b) =>
          new Date(a.scheduledPublishAt).getTime() -
          new Date(b.scheduledPublishAt).getTime()
      );
    return future[0] || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const whatsappText = useMemo(() => {
    if (!todaysPost) return "";
    const url = `https://www.turboloop.tech/blog/${todaysPost.slug}`;
    const lines = [todaysPost.title];
    if (todaysPost.excerpt) lines.push("", todaysPost.excerpt);
    lines.push("", url);
    return lines.join("\n");
  }, [todaysPost]);

  const handleCopy = async () => {
    if (!whatsappText) return;
    try {
      await navigator.clipboard.writeText(whatsappText);
      toast.success("Copied to clipboard — paste it into your WhatsApp groups");
    } catch {
      toast.error("Clipboard blocked — select the text manually");
    }
  };

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-heading font-bold text-slate-800">WhatsApp copy helper</h3>
        <p className="text-xs text-slate-500">
          Share this to your WhatsApp groups manually.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl p-4 space-y-3">
        {loading ? (
          <div className="text-xs text-slate-400">Loading today&apos;s post…</div>
        ) : !todaysPost ? (
          <div className="text-xs text-slate-500">
            No post for today and no future-scheduled draft. Nothing to share.
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-800">{todaysPost.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  <span className="font-mono">{todaysPost.language}</span> ·{" "}
                  {todaysPost.published ? "published" : "scheduled"} ·{" "}
                  {formatWhen(todaysPost.updatedAt ?? todaysPost.scheduledPublishAt ?? todaysPost.createdAt)}
                </div>
              </div>
              <a
                href={`/blog/${todaysPost.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-700 hover:underline inline-flex items-center gap-1 shrink-0"
              >
                Open <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <pre className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap break-words">
{whatsappText}
            </pre>
            <Button
              size="sm"
              onClick={handleCopy}
              className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20 hover:bg-cyan-600/20"
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy for WhatsApp
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
