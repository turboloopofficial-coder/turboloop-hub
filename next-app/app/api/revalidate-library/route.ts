// Manual cache-bust lever for the library ISR cache.
// Usage:
//   GET  /api/revalidate-library?secret=<REVALIDATE_SECRET>
//   POST /api/revalidate-library?secret=<REVALIDATE_SECRET>
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
  revalidatePath("/library");
  return NextResponse.json({ ok: true, revalidated: ["/library"] });
}
export function GET(req: Request) { return handle(req); }
export function POST(req: Request) { return handle(req); }
