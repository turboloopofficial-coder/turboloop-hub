// Admin Social Wall — left pane has two tabs (Search + Auto-Suggestions),
// right pane is the curated wall. Search hits `socialWall.youtubeSearch`
// (admin-only, 100 quota units per call). Auto-Suggestions hits
// `socialWall.getSuggestions` which sweeps 5 brand-relevant queries,
// dedups against the existing wall, scores by engagement+recency, and
// returns the top 20. Dismissed suggestion IDs live in localStorage so
// the admin can hide low-value picks without polluting the database.

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Loader2,
  Plus,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Trash2,
  ExternalLink,
  Youtube,
  Sparkles,
  RefreshCw,
  EyeOff as DismissIcon,
  AlertTriangle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

type TabKey = "search" | "suggestions";

type Suggestion = {
  youtubeId: string;
  title: string;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
  score: number;
};

type SearchHit = {
  youtubeId: string;
  title: string;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  language: string | null;
};

const DISMISSED_LS_KEY = "turboloop:social-wall:dismissed-suggestions";

function loadDismissed(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(x => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveDismissed(ids: string[]) {
  try {
    localStorage.setItem(DISMISSED_LS_KEY, JSON.stringify(ids));
  } catch {
    // localStorage may be disabled (private mode / quota); fail quiet
  }
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function relativeDate(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const day = 86_400_000;
  if (ms < day) return "today";
  if (ms < 7 * day) return `${Math.floor(ms / day)}d ago`;
  if (ms < 30 * day) return `${Math.floor(ms / (7 * day))}w ago`;
  if (ms < 365 * day) return `${Math.floor(ms / (30 * day))}mo ago`;
  return `${Math.floor(ms / (365 * day))}y ago`;
}

function scoreBadge(score: number): { label: string; bg: string; fg: string } {
  if (score >= 100_000) return { label: "High", bg: "rgba(16,185,129,0.16)", fg: "#047857" };
  if (score >= 10_000) return { label: "Medium", bg: "rgba(245,158,11,0.16)", fg: "#B45309" };
  return { label: "Low", bg: "rgba(15,23,42,0.06)", fg: "#475569" };
}

export default function SocialWallManager() {
  const [tab, setTab] = useState<TabKey>("search");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>(() => loadDismissed());

  const utils = trpc.useUtils();
  const search = trpc.socialWall.youtubeSearch.useQuery(
    { query: submitted ?? "", maxResults: 10 },
    { enabled: !!submitted, retry: false }
  );
  const suggestions = trpc.socialWall.getSuggestions.useQuery(undefined, {
    // Manual fetch only — the admin clicks Refresh. 500 quota units/call.
    enabled: false,
    retry: false,
  });
  const wall = trpc.socialWall.list.useQuery();
  const save = trpc.socialWall.save.useMutation({
    onSuccess: () => utils.socialWall.list.invalidate(),
  });
  const update = trpc.socialWall.update.useMutation({
    onSuccess: () => utils.socialWall.list.invalidate(),
  });
  const remove = trpc.socialWall.delete.useMutation({
    onSuccess: () => utils.socialWall.list.invalidate(),
  });

  const savedIds = useMemo(
    () => new Set(wall.data?.map(v => v.youtubeId) ?? []),
    [wall.data]
  );
  const dismissedSet = useMemo(() => new Set(dismissed), [dismissed]);

  // Persist dismissals as they accumulate.
  useEffect(() => {
    saveDismissed(dismissed);
  }, [dismissed]);

  const suggestionsData = suggestions.data as
    | { missingApiKey: boolean; suggestions: Suggestion[] }
    | undefined;
  const visibleSuggestions: Suggestion[] =
    suggestionsData && !suggestionsData.missingApiKey
      ? suggestionsData.suggestions.filter(
          s => !dismissedSet.has(s.youtubeId) && !savedIds.has(s.youtubeId)
        )
      : [];
  const missingApiKey = suggestionsData?.missingApiKey === true;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl">
      {/* ─── LEFT: Tabs ─────────────────────────────────────────────── */}
      <div>
        <div className="flex gap-1 mb-4 border-b border-slate-200">
          <TabButton
            active={tab === "search"}
            onClick={() => setTab("search")}
            icon={<Youtube className="w-3.5 h-3.5 text-red-600" />}
            label="Search YouTube"
          />
          <TabButton
            active={tab === "suggestions"}
            onClick={() => setTab("suggestions")}
            icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            label="🤖 Auto-Suggestions"
          />
        </div>

        {tab === "search" ? (
          <SearchPanel
            query={query}
            setQuery={setQuery}
            setSubmitted={setSubmitted}
            searchResults={(search.data ?? []) as Array<SearchHit | null>}
            searchError={search.error?.message ?? null}
            searchFetching={search.isFetching}
            savedIds={savedIds}
            onSave={(input) => save.mutate(input)}
            saving={save.isPending}
          />
        ) : (
          <SuggestionsPanel
            visibleSuggestions={visibleSuggestions}
            missingApiKey={missingApiKey}
            isFetching={suggestions.isFetching}
            isFetched={suggestions.isFetched}
            errorMessage={suggestions.error?.message ?? null}
            dismissedCount={dismissed.length}
            onRefresh={() => suggestions.refetch()}
            onResetDismissed={() => setDismissed([])}
            onSave={(input) => save.mutate(input)}
            onDismiss={(id) =>
              setDismissed(d => (d.includes(id) ? d : [...d, id]))
            }
            saving={save.isPending}
          />
        )}
      </div>

      {/* ─── RIGHT: Curated wall ──────────────────────────────────── */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">
          Curated wall ({wall.data?.length ?? 0})
        </h2>
        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
          Only approved videos appear publicly. Featured rows sort
          first; ties broken by sortOrder ascending.
        </p>

        {wall.isLoading && (
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        )}

        <div className="space-y-2.5">
          {wall.data?.map(v => (
            <div
              key={v.id}
              className="flex gap-3 p-2.5 rounded-lg bg-white border border-slate-200"
            >
              {v.thumbnailUrl && (
                <img
                  src={v.thumbnailUrl}
                  alt=""
                  className="w-24 h-16 object-cover rounded-md flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {v.title}
                </div>
                <div className="text-xs text-slate-500 mt-1 truncate">
                  {v.channelTitle ?? "—"} · {v.language ?? "?"}
                </div>
                <div className="flex items-center flex-wrap gap-1.5 mt-2">
                  <button
                    onClick={() =>
                      update.mutate({ id: v.id, approved: !v.approved })
                    }
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold"
                    style={{
                      background: v.approved
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(15,23,42,0.06)",
                      color: v.approved ? "#047857" : "#475569",
                    }}
                  >
                    {v.approved ? (
                      <>
                        <Eye className="w-3 h-3" /> Approved
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" /> Hidden
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      update.mutate({ id: v.id, featured: !v.featured })
                    }
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold"
                    style={{
                      background: v.featured
                        ? "rgba(245,158,11,0.16)"
                        : "rgba(15,23,42,0.06)",
                      color: v.featured ? "#B45309" : "#475569",
                    }}
                  >
                    {v.featured ? (
                      <>
                        <Star className="w-3 h-3" /> Featured
                      </>
                    ) : (
                      <>
                        <StarOff className="w-3 h-3" /> Standard
                      </>
                    )}
                  </button>
                  <label className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    Order
                    <input
                      type="number"
                      defaultValue={v.sortOrder}
                      onBlur={e => {
                        const next = parseInt(e.currentTarget.value, 10);
                        if (Number.isFinite(next) && next !== v.sortOrder) {
                          update.mutate({ id: v.id, sortOrder: next });
                        }
                      }}
                      className="w-14 px-1.5 py-0.5 rounded border border-slate-200 text-xs"
                    />
                  </label>
                  <button
                    onClick={() => {
                      if (confirm("Remove this video from the wall?")) {
                        remove.mutate({ id: v.id });
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold text-red-700"
                    style={{ background: "rgba(239,68,68,0.08)" }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition border-b-2 -mb-px"
      style={{
        color: active ? "#0F172A" : "#64748B",
        borderColor: active ? "#0891B2" : "transparent",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function SearchPanel({
  query,
  setQuery,
  setSubmitted,
  searchResults,
  searchError,
  searchFetching,
  savedIds,
  onSave,
  saving,
}: {
  query: string;
  setQuery: (q: string) => void;
  setSubmitted: (q: string) => void;
  searchResults: Array<SearchHit | null>;
  searchError: string | null;
  searchFetching: boolean;
  savedIds: Set<string>;
  onSave: (input: {
    youtubeId: string;
    title: string;
    channelTitle?: string;
    thumbnailUrl?: string;
    language?: string;
  }) => void;
  saving: boolean;
}) {
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          const q = query.trim();
          if (q.length < 2) return;
          setSubmitted(q);
        }}
        className="flex gap-2 mb-4"
      >
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. turboloop testimonial"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={searchFetching}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #0891B2, #7C3AED)",
            color: "white",
          }}
        >
          {searchFetching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          Search
        </button>
      </form>
      <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
        Each search uses ~100 YouTube quota units; the free daily
        budget is 10 000 units. Save results below to add them to the
        curation list — duplicates are deduplicated by YouTube ID.
      </p>

      {searchError && (
        <div className="text-sm text-red-700 rounded-lg bg-red-50 border border-red-200 p-3 mb-3">
          {searchError}
        </div>
      )}

      {searchResults.length === 0 && !searchFetching && (
        <div className="text-sm text-slate-500 rounded-lg bg-slate-50 border border-slate-100 p-4">
          No results.
        </div>
      )}

      <div className="space-y-2.5">
        {searchResults.map(r => {
          if (!r) return null;
          const already = savedIds.has(r.youtubeId);
          return (
            <div
              key={r.youtubeId}
              className="flex gap-3 p-2.5 rounded-lg bg-white border border-slate-200"
            >
              {r.thumbnailUrl && (
                <img
                  src={r.thumbnailUrl}
                  alt=""
                  className="w-28 h-20 object-cover rounded-md flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {r.title}
                </div>
                <div className="text-xs text-slate-500 mt-1 truncate">
                  {r.channelTitle ?? "Unknown channel"}
                  {r.language ? ` · ${r.language}` : ""}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      onSave({
                        youtubeId: r.youtubeId,
                        title: r.title,
                        channelTitle: r.channelTitle ?? undefined,
                        thumbnailUrl: r.thumbnailUrl ?? undefined,
                        language: r.language ?? undefined,
                      })
                    }
                    disabled={saving || already}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold disabled:opacity-50"
                    style={{
                      background: already
                        ? "rgba(15,23,42,0.06)"
                        : "linear-gradient(135deg, #10B981, #059669)",
                      color: already ? "#475569" : "white",
                    }}
                  >
                    {already ? "Saved" : (<><Plus className="w-3 h-3" /> Save</>)}
                  </button>
                  <a
                    href={`https://www.youtube.com/watch?v=${r.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Preview
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SuggestionsPanel({
  visibleSuggestions,
  missingApiKey,
  isFetching,
  isFetched,
  errorMessage,
  dismissedCount,
  onRefresh,
  onResetDismissed,
  onSave,
  onDismiss,
  saving,
}: {
  visibleSuggestions: Suggestion[];
  missingApiKey: boolean;
  isFetching: boolean;
  isFetched: boolean;
  errorMessage: string | null;
  dismissedCount: number;
  onRefresh: () => void;
  onResetDismissed: () => void;
  onSave: (input: {
    youtubeId: string;
    title: string;
    channelTitle?: string;
    thumbnailUrl?: string;
  }) => void;
  onDismiss: (id: string) => void;
  saving: boolean;
}) {
  const fetchedYet = isFetched || isFetching;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-slate-400 leading-relaxed flex-1 pr-3">
          Sweeps 5 brand queries (~500 quota units), drops anything
          already on the wall, ranks by views × likes × comments with
          a recency bonus. Dismissed picks stay hidden in this browser.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 shrink-0"
          style={{
            background: "linear-gradient(135deg, #F59E0B, #7C3AED)",
            color: "white",
          }}
        >
          {isFetching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Refresh
        </button>
      </div>

      {dismissedCount > 0 && (
        <button
          type="button"
          onClick={onResetDismissed}
          className="text-[11px] text-slate-500 underline hover:text-slate-700 mb-3"
        >
          Reset {dismissedCount} dismissed
        </button>
      )}

      {errorMessage && (
        <div className="text-sm text-red-700 rounded-lg bg-red-50 border border-red-200 p-3 mb-3">
          {errorMessage}
        </div>
      )}

      {missingApiKey && (
        <div
          className="flex gap-2 items-start text-sm rounded-lg p-3 mb-3 border"
          style={{
            background: "rgba(245,158,11,0.08)",
            borderColor: "rgba(245,158,11,0.35)",
            color: "#92400E",
          }}
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold">YouTube API key not configured.</div>
            <div className="text-xs mt-1">
              Add <code className="px-1 py-0.5 rounded bg-amber-100">YOUTUBE_API_KEY</code> to your environment variables and redeploy.
            </div>
          </div>
        </div>
      )}

      {!fetchedYet && !missingApiKey && (
        <div className="text-sm text-slate-500 rounded-lg bg-slate-50 border border-slate-100 p-4 text-center">
          Click <span className="font-bold">Refresh</span> to discover videos.
        </div>
      )}

      {fetchedYet &&
        !isFetching &&
        !missingApiKey &&
        visibleSuggestions.length === 0 && (
          <div className="text-sm text-slate-500 rounded-lg bg-slate-50 border border-slate-100 p-4">
            All discovered TurboLoop videos are already on the wall.
            Check back later.
          </div>
        )}

      <div className="space-y-2.5">
        {visibleSuggestions.map(s => {
          const badge = scoreBadge(s.score);
          return (
            <div
              key={s.youtubeId}
              className="flex gap-3 p-2.5 rounded-lg bg-white border border-slate-200"
            >
              <img
                src={
                  s.thumbnailUrl ??
                  `https://img.youtube.com/vi/${s.youtubeId}/mqdefault.jpg`
                }
                alt=""
                className="w-28 h-20 object-cover rounded-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug flex-1">
                    {s.title}
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: badge.bg, color: badge.fg }}
                  >
                    {badge.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 truncate">
                  {s.channelTitle ?? "Unknown channel"}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                  <span>{formatCount(s.viewCount)} views</span>
                  <span>♥ {formatCount(s.likeCount)}</span>
                  <span>💬 {formatCount(s.commentCount)}</span>
                  <span>{relativeDate(s.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      onSave({
                        youtubeId: s.youtubeId,
                        title: s.title,
                        channelTitle: s.channelTitle ?? undefined,
                        thumbnailUrl: s.thumbnailUrl ?? undefined,
                      })
                    }
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #10B981, #059669)",
                      color: "white",
                    }}
                  >
                    <Plus className="w-3 h-3" /> Add to Wall
                  </button>
                  <button
                    onClick={() => onDismiss(s.youtubeId)}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    <DismissIcon className="w-3 h-3" />
                    Dismiss
                  </button>
                  <a
                    href={`https://www.youtube.com/watch?v=${s.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Preview
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
