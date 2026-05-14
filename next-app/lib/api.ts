// Build-time data fetching helpers — calls the existing production
// tRPC API at turboloop.tech to populate Server Component pages with
// blog/video data.
//
// Why this approach: the legacy SPA already has a fully-working tRPC
// endpoint (Neon Postgres + Drizzle, behind /api/trpc). Migrating the
// data layer would be wasted work — the API stays where it is, the
// new Next.js app just *consumes* it at build time. Once the new app
// owns the production domain (Phase 15), we'll either keep calling the
// same endpoint (it's stable) or co-locate the API into next-app/api/.
//
// Build-time means: when Vercel runs `next build`, this code executes
// and the response is baked into the static HTML. Visitors see plain
// HTML — no client-side fetch, no loading skeletons, no JS spinning.

// Post-cutover, turboloop.tech serves the new Next.js app — but the
// legacy tRPC API + admin dashboard live at api.turboloop.tech (same
// Vercel project that previously served turboloop.tech, just renamed).
// Pointing the build-time fetcher there means forms + /admin keep
// working forever, even after the cutover. Override with
// NEXT_PUBLIC_API_BASE in dev if you're running the API locally.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://api.turboloop.tech";

interface TRPCResponse<T> {
  result?: { data?: { json?: T } };
  error?: { message?: string; code?: string };
}

/** Decodes a tRPC GET response (superjson-wrapped). Returns the data
 *  directly, or throws on error. */
async function fetchTRPC<T>(
  procedure: string,
  input?: unknown,
  opts: { revalidate?: number } = {}
): Promise<T> {
  // tRPC GET URL: /api/trpc/<procedure>?input=<encoded>
  const url = new URL(`/api/trpc/${procedure}`, API_BASE);
  if (input !== undefined) {
    url.searchParams.set("input", JSON.stringify({ json: input }));
  }

  // Next.js fetch with ISR: revalidate every N seconds. Default 5 min
  // for content lists. Individual pages can override.
  const res = await fetch(url, {
    next: { revalidate: opts.revalidate ?? 300 },
  });

  if (!res.ok) {
    throw new Error(`tRPC ${procedure} → HTTP ${res.status}`);
  }

  const body = (await res.json()) as TRPCResponse<T>;
  if (body.error) {
    throw new Error(`tRPC ${procedure} → ${body.error.message ?? body.error.code}`);
  }
  if (body.result?.data?.json === undefined) {
    throw new Error(`tRPC ${procedure} → empty response`);
  }
  return body.result.data.json;
}

// ─── Typed wrappers ──────────────────────────────────────────────────
// Hand-written type definitions mirror the Drizzle schema. We don't
// import @drizzle/* directly because it pulls in node-only deps that
// can't be tree-shaken from the client bundle. Types are small; risk
// of drift is low (the schema rarely changes).

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  readingTime: number | null;
  published: boolean;
  /** Intended publish moment — set by the editor or seed script. The cron
   *  flips `published` to true once now ≥ this timestamp. Use this rather
   *  than createdAt for any user-facing date display, since createdAt
   *  reflects the bulk seed time and is meaningless to the reader. */
  scheduledPublishAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/** R2-hosted /api/og-banner PNG that the legacy Vercel project generates per
 *  request (1200×630, palette rotates daily). Suitable as both cover image
 *  fallback in cards AND social OG meta — Telegram/X/WhatsApp render it
 *  reliably; the older /api/og SVG endpoint did not. */
export function blogOgBannerUrl(post: { slug: string; title: string }): string {
  const params = new URLSearchParams({
    type: "blog",
    slug: post.slug,
    title: post.title,
  });
  return `https://www.turboloop.tech/api/og-banner?${params.toString()}`;
}

/** Resolved cover image — author-set coverImage if present, else the
 *  generated og-banner PNG. Never returns null so cards can stop dealing
 *  with a "no image" branch and the cheap brand-gradient fallback. */
export function blogCoverUrl(post: {
  slug: string;
  title: string;
  coverImage: string | null;
}): string {
  return post.coverImage ?? blogOgBannerUrl(post);
}

/** Best-effort "this article was published on" date for UI display.
 *  Returns null when nothing trustworthy is available — callers hide the
 *  date strip rather than show a misleading bulk-insert createdAt. */
export function blogDisplayDate(post: BlogPost): string | null {
  if (post.scheduledPublishAt) {
    const t = new Date(post.scheduledPublishAt).getTime();
    if (Number.isFinite(t) && t <= Date.now()) return post.scheduledPublishAt;
  }
  return null;
}

export interface Video {
  id: number;
  title: string;
  slug: string | null;
  category: string | null;
  language: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  youtubeUrl: string | null;
  directUrl: string | null;
  durationSec: number | null;
  createdAt: string;
}

export interface Presentation {
  id: number;
  title: string;
  language: string | null;
  fileUrl: string | null;
  sortOrder: number;
  published: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: number;
  rank: number;
  country: string;
  countryCode: string;
  description: string;
  score: number;
  updatedAt: string;
}

/** Public-facing approved submission row — same shape as
 *  listPublicApprovedSubmissions on the server (no PII fields). */
export interface PublicSubmission {
  id: number;
  type: string;
  authorName: string;
  authorCountry: string | null;
  body: string;
  fileUrl: string | null;
  createdAt: string;
}

/** Public Social Wall video row (approved + featured curation flags). */
export interface SocialWallVideo {
  id: number;
  youtubeId: string;
  title: string;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  viewCount: number | null;
  durationSec: number | null;
  language: string | null;
  approved: boolean;
  featured: boolean;
  sortOrder: number;
  fetchedAt: string;
  approvedAt: string | null;
}

export const api = {
  blogPosts: () => fetchTRPC<BlogPost[]>("content.blogPosts"),
  blogPost: (slug: string) =>
    fetchTRPC<BlogPost>("content.blogPost", { slug }),
  videos: () => fetchTRPC<Video[]>("content.videos"),
  presentations: () => fetchTRPC<Presentation[]>("content.presentations"),
  leaderboard: () =>
    fetchTRPC<LeaderboardEntry[]>("content.leaderboard"),
  publicApprovedSubmissions: () =>
    fetchTRPC<PublicSubmission[]>("submissions.publicApproved"),
  socialWallVideos: () =>
    fetchTRPC<SocialWallVideo[]>("socialWall.publicList"),
};
