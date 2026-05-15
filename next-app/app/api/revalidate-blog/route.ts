// Manual cache-bust lever for the blog ISR cache. Used when a blog post
// renders as 500 (or stale content) and you need to force regeneration
// without waiting for the 5-minute revalidate window.
//
// Usage:
//   GET  /api/revalidate-blog?secret=<REVALIDATE_SECRET>&slug=<slug>
//   POST /api/revalidate-blog?secret=<REVALIDATE_SECRET>&slug=<slug>
//
// Omit `slug` to revalidate the blog index only.
//
// REVALIDATE_SECRET lives in Vercel project env (next-app project, all
// environments). Generate with `openssl rand -hex 32` — any random
// string works, it's just a shared secret to keep the endpoint from
// being pinged by randos.

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function handle(req: Request): NextResponse {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET not configured" },
      { status: 500 }
    );
  }
  if (secret !== expected) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const slug = url.searchParams.get("slug");
  if (slug) {
    // Validate slug shape so we don't pass garbage into revalidatePath.
    if (!/^[a-z0-9][a-z0-9-]{0,200}$/.test(slug)) {
      return NextResponse.json(
        { ok: false, error: "invalid slug" },
        { status: 400 }
      );
    }
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/blog"); // index too, so the card refreshes
    return NextResponse.json({
      ok: true,
      revalidated: [`/blog/${slug}`, "/blog"],
    });
  }

  revalidatePath("/blog");
  return NextResponse.json({ ok: true, revalidated: ["/blog"] });
}

export function GET(req: Request) {
  return handle(req);
}

export function POST(req: Request) {
  return handle(req);
}
