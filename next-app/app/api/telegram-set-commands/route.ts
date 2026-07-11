// One-time setup endpoint: registers the bot's slash command menu
// with Telegram. Hit this once after deploy:
//   GET https://www.turboloop.tech/api/telegram-set-commands
//
// Telegram will then show a "/" popup in the group with the full
// command list — users can pick a command from the menu instead of
// remembering the exact keyword. Safe to call repeatedly: Telegram
// replaces the previous command list each time setMyCommands fires.

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Simple auth check — require CRON_SECRET as query param or header
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") || req.headers.get("x-admin-token");
  const expected = process.env.CRON_SECRET || process.env.ADMIN_API_TOKEN;
  if (!secret || secret !== expected) {
    return new Response(
      JSON.stringify({ ok: false, error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return new Response(
      JSON.stringify({ ok: false, error: "TELEGRAM_BOT_TOKEN not set" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Order shown in Telegram's "/" popup. Earlier entries surface first
  // when the user opens the menu, so the most-tapped commands lead.
  const commands = [
    { command: "price",       description: "Live $TURBO price + 24h change" },
    { command: "ca",          description: "Contract address (copy-paste ready)" },
    { command: "buy",         description: "How to buy $TURBO + live price" },
    { command: "sell",        description: "How to sell $TURBO + live price" },
    { command: "plans",       description: "Yield plans: Sprint / Boost / Power / Ultimate" },
    { command: "deposit",     description: "How to start — step by step" },
    { command: "payout",      description: "When and how payouts work" },
    { command: "referral",    description: "Referral program + commission rates" },
    { command: "calc",        description: "Yield calculator — type amount after /calc" },
    { command: "zoom",        description: "Next live Zoom session schedule" },
    { command: "roadmap",     description: "What's coming next for Turbo Loop" },
    { command: "burn",        description: "Daily $TURBO burn mechanism" },
    { command: "token",       description: "$TURBO token info + chart link" },
    { command: "leadership",  description: "Leadership ranks + requirements" },
    { command: "leaderboard", description: "Top countries leaderboard" },
    { command: "audit",       description: "Security audit + LP lock proof" },
    { command: "docs",        description: "Documentation + guides" },
    { command: "links",       description: "All official links" },
    { command: "airdrop",     description: "Airdrop info (spoiler: there isn't one)" },
    { command: "staking",     description: "Staking info" },
    { command: "support",     description: "Get help from the team" },
  ];

  const res = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commands }),
  });
  const data: any = await res.json();

  return new Response(
    JSON.stringify({
      ok: data.ok,
      result: data,
      commandCount: commands.length,
    }),
    {
      status: data.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}
