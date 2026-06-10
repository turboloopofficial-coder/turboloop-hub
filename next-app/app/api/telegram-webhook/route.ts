// Next.js route adapter for the Telegram auto-reply webhook.
// Build marker: 2026-06-10 — forces env-var pickup on next deploy.
//
// Thin pass-through to the logic file at server/_vercel/telegram-webhook.ts.
// All the actual work — secret verification, trigger matching, cooldown,
// reply send — lives there so the same module can be unit-tested
// without spinning up Next.js.
//
// Set the webhook with:
//   curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
//     -H "Content-Type: application/json" \
//     -d '{
//       "url": "https://turboloop.tech/api/telegram-webhook",
//       "secret_token": "<value of TELEGRAM_WEBHOOK_SECRET>",
//       "allowed_updates": ["message"]
//     }'
//
// Required env vars on Vercel:
//   • TELEGRAM_BOT_TOKEN     — existing, used by the cron sender too.
//   • TELEGRAM_WEBHOOK_SECRET — new, MUST match the secret_token you
//     passed to setWebhook. If unset, the handler skips verification
//     so dev still works — never deploy without it.

import { handleTelegramWebhook } from "../../../../server/_vercel/telegram-webhook";

// Node runtime — keeps process.env access ergonomic and matches the
// pattern used by the rest of the legacy webhook surface.
export const runtime = "nodejs";
// Telegram delivers fresh updates and we never want a cached response.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handleTelegramWebhook(req);
}

// GET handler for health-checks — useful when setting up the webhook
// or debugging via curl. Returns a tiny JSON heartbeat without
// touching the auto-reply logic. NOT used by Telegram.
export async function GET() {
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
