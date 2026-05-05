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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://turboloop.tech";

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
  createdAt: string;
  updatedAt: string | null;
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

export const api = {
  blogPosts: () => fetchTRPC<BlogPost[]>("content.blogPosts"),
  blogPost: (slug: string) =>
    fetchTRPC<BlogPost>("content.blogPost", { slug }),
  videos: () => fetchTRPC<Video[]>("content.videos"),
};
