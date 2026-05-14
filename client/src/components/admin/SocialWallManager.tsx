// Admin Social Wall — two-pane: search YouTube on the left, manage the
// curated wall on the right. Search hits `socialWall.youtubeSearch`
// (admin-only, costs 100 quota units per call so don't autofire on
// keystroke — explicit submit). Save persists into social_wall_videos
// via upsert (idempotent on youtubeId), then the curation table lets
// you toggle approved/featured + reorder.

import { useState } from "react";
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
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SocialWallManager() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const search = trpc.socialWall.youtubeSearch.useQuery(
    { query: submitted ?? "", maxResults: 10 },
    { enabled: !!submitted, retry: false }
  );
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

  const savedIds = new Set(wall.data?.map(v => v.youtubeId) ?? []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl">
      {/* ─── LEFT: YouTube search ─────────────────────────────────── */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Youtube className="w-4 h-4 text-red-600" />
          Search YouTube
        </h2>

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
            disabled={search.isFetching}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #0891B2, #7C3AED)",
              color: "white",
            }}
          >
            {search.isFetching ? (
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

        {search.error && (
          <div className="text-sm text-red-700 rounded-lg bg-red-50 border border-red-200 p-3 mb-3">
            {search.error.message}
          </div>
        )}

        {search.data && search.data.length === 0 && !search.isFetching && (
          <div className="text-sm text-slate-500 rounded-lg bg-slate-50 border border-slate-100 p-4">
            No results.
          </div>
        )}

        <div className="space-y-2.5">
          {search.data?.map(r => {
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
                        save.mutate({
                          youtubeId: r.youtubeId,
                          title: r.title,
                          channelTitle: r.channelTitle ?? undefined,
                          thumbnailUrl: r.thumbnailUrl ?? undefined,
                          language: r.language ?? undefined,
                        })
                      }
                      disabled={save.isPending || already}
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
