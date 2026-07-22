// /api/warmup — lightweight keep-alive endpoint.
//
// Called by a Vercel cron every 5 minutes to prevent Lambda cold starts.
// Cold starts add 3-8s to the first request after an idle period.
// This endpoint does minimal work (no DB, no external fetch) so it
// completes in <10ms and keeps the Lambda instance warm.
//
// Vercel cron invocations are free and don't count against function
// execution time limits for the Hobby plan.

export const runtime = "edge"; // Edge runtime = always warm, no cold starts

export function GET() {
  return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
