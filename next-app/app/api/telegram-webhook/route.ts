// Next.js route adapter for the Telegram auto-reply webhook.
// Build marker: 2026-07-29-remove-debug-endpoint
//
// Thin pass-through to the logic file at server/_vercel/telegram-webhook.ts.
// All the actual work — secret verification, trigger matching, cooldown,
// reply send — lives there so the same module can be unit-tested
// without spinning up Next.js.

import { handleTelegramWebhook } from "@/server/_vercel/telegram-webhook";

// Edge runtime — cold starts in ~50ms globally vs 2-5s for Node.js.
export const runtime = "edge";

// Telegram delivers fresh updates and we never want a cached response.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Directly await the handler. The price is cached in site_settings
  // (refreshed every ~5 min by cron-master), so fetchLivePrice() takes
  // ~10ms instead of 3-5s. Total handler time is ~400ms — well within
  // Telegram's 60s webhook timeout. No need for waitUntil.
  return handleTelegramWebhook(req);
}

// GET handler — heartbeat only.
// Debug endpoint removed 2026-07-29 (security hardening — no env info exposure).
export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      service: "telegram-auto-reply-webhook",
      hint: "POST your Telegram updates here. GET is a heartbeat.",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
