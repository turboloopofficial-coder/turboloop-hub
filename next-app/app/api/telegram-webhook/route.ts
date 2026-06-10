// Next.js route adapter for the Telegram auto-reply webhook.
// Build marker: 2026-06-10-support-fix
//
// Thin pass-through to the logic file at server/_vercel/telegram-webhook.ts.
// All the actual work — secret verification, trigger matching, cooldown,
// reply send — lives there so the same module can be unit-tested
// without spinning up Next.js.
//
// History note: an earlier revision wrapped the handler in
// waitUntil(@vercel/functions) so we could return 200 immediately and
// process in the background. That package wasn't in next-app's own
// package.json, so the Edge build silently dropped the dependency and
// every reply went into the void. With the price cache (commit
// 5da6fc7) the handler is fast enough (~400ms end-to-end) that
// awaiting inline is simpler, more reliable, and well within
// Telegram's 60s webhook timeout.

import { handleTelegramWebhook } from "../../../../server/_vercel/telegram-webhook";

// Edge runtime — cold starts in ~50ms globally vs 2-5s for Node.js.
export const runtime = "edge";

// Pin to the region closest to Telegram's servers (Frankfurt / Amsterdam).
// Cuts 200-400ms off every reply by eliminating cross-continent round-trips
// to api.telegram.org. Vercel walks the list in order — if Frankfurt is
// overloaded it falls back to Amsterdam transparently.
export const preferredRegion = ["fra1", "ams1"];

// Telegram delivers fresh updates and we never want a cached response.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Directly await the handler. The price is cached in site_settings
  // (refreshed every ~5 min by cron-master), so fetchLivePrice() takes
  // ~10ms instead of 3-5s. Total handler time is ~400ms — well within
  // Telegram's 60s webhook timeout. No need for waitUntil.
  return handleTelegramWebhook(req);
}

// GET handler for health-checks and diagnostics.
//
// Special diagnostic: GET ?debug=env reports presence + length of the
// TELEGRAM_* env vars the route depends on, plus the names of any
// other TELEGRAM_* keys Vercel has loaded. Values are NEVER returned
// — only booleans, lengths, and key names. Used to debug why the
// webhook is returning skipped=token-missing despite vars being added.
// Safe to leave deployed — exposes no secret material.
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("debug") === "env") {
    const tok = process.env.TELEGRAM_BOT_TOKEN;
    const sec = process.env.TELEGRAM_WEBHOOK_SECRET;
    const telegramKeys = Object.keys(process.env)
      .filter((k) => /telegram/i.test(k))
      .sort();
    return new Response(
      JSON.stringify({
        ok: true,
        diagnostic: "env-presence",
        has_TELEGRAM_BOT_TOKEN: typeof tok === "string" && tok.length > 0,
        TELEGRAM_BOT_TOKEN_length: tok ? tok.length : 0,
        has_TELEGRAM_WEBHOOK_SECRET: typeof sec === "string" && sec.length > 0,
        TELEGRAM_WEBHOOK_SECRET_length: sec ? sec.length : 0,
        telegram_keys_in_env: telegramKeys,
        node_env: process.env.NODE_ENV ?? null,
        vercel_env: process.env.VERCEL_ENV ?? null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
  return new Response(
    JSON.stringify({
      ok: true,
      service: "telegram-auto-reply-webhook",
      hint: "POST your Telegram updates here. GET is a heartbeat.",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
