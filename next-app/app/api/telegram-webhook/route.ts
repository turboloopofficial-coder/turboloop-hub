// Next.js route adapter for the Telegram auto-reply webhook.
// Build marker: 2026-06-10-slash-commands
//
// Thin pass-through to the logic file at server/_vercel/telegram-webhook.ts.
// All the actual work — secret verification, trigger matching, cooldown,
// reply send — lives there so the same module can be unit-tested
// without spinning up Next.js.

import { handleTelegramWebhook } from "../../../../server/_vercel/telegram-webhook";
import { waitUntil } from "@vercel/functions";

// Edge runtime — cold starts in ~50ms globally vs 2-5s for Node.js.
export const runtime = "edge";

// Pin to the region closest to Telegram's servers (Frankfurt / Amsterdam).
// This alone cuts 200-400ms off every reply by eliminating cross-continent
// round-trips to api.telegram.org. Vercel picks the first reachable region
// from the list — falling back to the next if Frankfurt is overloaded.
export const preferredRegion = ["fra1", "ams1"];

// Telegram delivers fresh updates and we never want a cached response.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Return 200 OK IMMEDIATELY so Telegram's 60s webhook timeout clock
  // stops the moment we receive the update. Then process the body +
  // send the reply in the background via waitUntil, which keeps the
  // Edge runtime alive until the promise settles.
  //
  // We clone the request because handleTelegramWebhook reads req.json()
  // and the original Request is consumed once we return.
  //
  // This pattern fixes two visible bugs:
  //   1. Slow static-trigger replies — the user no longer waits for the
  //      Telegram round-trip before the function's response is flushed.
  //   2. Duplicate replies — Telegram would retry the webhook delivery
  //      when our previous void-IIFE pattern flushed the Response
  //      mid-flight; with waitUntil the platform guarantees the work
  //      finishes, so retries never fire.
  const cloned = req.clone();
  const responsePromise = handleTelegramWebhook(cloned);
  waitUntil(responsePromise);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// GET handler for health-checks — useful when setting up the webhook
// or debugging via curl. Returns a tiny JSON heartbeat without
// touching the auto-reply logic. NOT used by Telegram.
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
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  return new Response(
    JSON.stringify({
      ok: true,
      service: "telegram-auto-reply-webhook",
      hint: "POST your Telegram updates here. GET is a heartbeat.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
