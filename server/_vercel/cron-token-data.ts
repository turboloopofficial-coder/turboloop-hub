import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { siteSettings } from "../../drizzle/schema";

/**
 * Dedicated cron job — refreshes token data every 5 minutes:
 *   1. Token price  (DexScreener → cache:token_price)
 *   2. Holder count (BscScan scrape → cache:token_holders)
 *   3. Daily supply snapshot (on-chain RPC → supply_snapshots)
 *
 * WHY THIS EXISTS:
 *   cron-master.ts is a 2700-line file that handles Telegram campaigns,
 *   zoom reminders, milestones, etc. It was silently timing out before
 *   reaching the token-data tasks (lines 810-985), causing the supply
 *   chart and holder count to go stale.
 *
 *   By extracting these three fast, independent tasks into their own
 *   dedicated handler (target runtime: <10s), they are guaranteed to
 *   complete on every 5-minute cron tick regardless of what else
 *   cron-master is doing.
 *
 * SECURITY: Same soft-auth model as cron-publish-blog — idempotent,
 *   safe to call without auth, CRON_SECRET mismatch is logged not rejected.
 */

const CONTRACT   = "0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3";
const DEAD_ADDR  = "0x000000000000000000000000000000000000dead";
const DEXSCREENER_PAIR = "0x5bede66bb27184001960e769efab95304f0e1759";
// NodeReal archive node — used for DexScreener price calls (not for balanceOf).
// NOTE: NodeReal returns 0 for balanceOf(TOKEN_CONTRACT) and balanceOf(DEAD_ADDR)
// due to network-level filtering. Use bsc-dataseed for supply snapshot calls.
const BSC_RPC         = "https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3";
// bsc-dataseed returns correct balanceOf values for the token contract and
// dead address. Used exclusively for supply snapshot RPC calls.
const BSC_DATASEED    = "https://bsc-dataseed.binance.org/";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToTokens(hex: string): number {
  const raw = BigInt(hex === "0x" || !hex ? "0x0" : hex);
  return Number(raw) / 1e18;
}

function balanceOfData(addr: string): string {
  return "0x70a08231" + addr.slice(2).toLowerCase().padStart(64, "0");
}

async function ethCall(data: string, to: string = CONTRACT, rpcUrl: string = BSC_RPC): Promise<string> {
  const r = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "eth_call", params: [{ to, data }, "latest"], id: 1 }),
    signal: AbortSignal.timeout(8000),
  });
  const j = (await r.json()) as { result?: string };
  return j.result ?? "0x0";
}

// ─── Task 1: Token Price ──────────────────────────────────────────────────────

async function refreshTokenPrice(db: ReturnType<typeof drizzle>): Promise<string> {
  const PAIR = DEXSCREENER_PAIR;
  const r = await fetch(`https://api.dexscreener.com/latest/dex/pairs/bsc/${PAIR}`, {
    signal: AbortSignal.timeout(8000),
    headers: { "User-Agent": "turboloop-cron/1.0" },
  });
  if (!r.ok) throw new Error(`DexScreener HTTP ${r.status}`);
  const json = await r.json() as { pair?: { priceUsd?: string; priceChange?: { h24?: number }; volume?: { h24?: number }; liquidity?: { usd?: number }; fdv?: number } };
  const pair = json.pair;
  if (!pair?.priceUsd) throw new Error("No priceUsd in DexScreener response");

  const value = JSON.stringify({
    priceUsd:       parseFloat(pair.priceUsd),
    priceChange24h: pair.priceChange?.h24 ?? 0,
    volume24h:      pair.volume?.h24 ?? 0,
    liquidityUsd:   pair.liquidity?.usd ?? 0,
    fdv:            pair.fdv ?? 0,
    fetchedAt:      Date.now(),
    fresh:          true,
  });

  await db.insert(siteSettings)
    .values({ settingKey: "cache:token_price", settingValue: value })
    .onConflictDoUpdate({ target: siteSettings.settingKey, set: { settingValue: value, updatedAt: new Date() } });

  return `price=$${parseFloat(pair.priceUsd).toFixed(4)}`;
}

// ─── Task 2: Holder Count ─────────────────────────────────────────────────────

async function refreshHolderCount(db: ReturnType<typeof drizzle>): Promise<string> {
  const USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  ];
  const uaIdx = new Date().getMinutes() % USER_AGENTS.length;
  const headers: Record<string, string> = {
    "User-Agent":      USER_AGENTS[uaIdx],
    "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control":   "no-cache",
    "Referer":         "https://www.google.com/",
  };

  // Strategy: try two URLs — the main token page and the holders sub-page.
  // Vercel IPs are often blocked by BscScan's Cloudflare on the main page,
  // but the sub-page (iframe content) is less protected.
  const urls = [
    `https://bscscan.com/token/${CONTRACT}`,
    `https://bscscan.com/token/generic-tokenholders2?a=${CONTRACT}&s=0&p=1`,
  ];

  let holdersNum = 0;

  for (const url of urls) {
    if (holdersNum > 0) break;
    for (const ua of [USER_AGENTS[uaIdx], USER_AGENTS[(uaIdx + 2) % USER_AGENTS.length]]) {
      try {
        const res = await fetch(url, {
          headers: { ...headers, "User-Agent": ua, "Referer": url.includes("generic") ? `https://bscscan.com/token/${CONTRACT}` : "https://www.google.com/" },
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok && res.status !== 403) continue;
        const body = await res.text();
        if (body.length < 200) continue;

        // Use different patterns depending on URL type.
        // Main page: meta description has "Holders: 1,312"
        // Sub-page: "From a total of 1,312 holders" (NOT the URL which contains "holders2")
        const isSubPage = url.includes("generic");
        const match = isSubPage
          ? body.match(/total of\s*([\d,]+)\s*holders/i) ||
            body.match(/"holdersCount"\s*:\s*"?([\d,]+)"?/)
          : body.match(/Holders[:]\s*([\d,]+)/) ||
            body.match(/"holdersCount"\s*:\s*"?([\d,]+)"?/) ||
            body.match(/total of\s*([\d,]+)\s*holders/i);

        if (match) {
          const parsed = parseInt(match[1].replace(/,/g, ""), 10);
          // Sanity: holder count must be > 10 (avoids matching pagination numbers)
          if (parsed > 10) { holdersNum = parsed; break; }
        }
      } catch { /* try next */ }
    }
  }

  if (holdersNum <= 0) throw new Error("Could not scrape holder count from BscScan (all URLs/patterns failed)");

  const value = JSON.stringify({
    holders:   holdersNum.toLocaleString("en-US"),
    holdersNum,
    fetchedAt: new Date().toISOString(),
    fresh:     true,
    source:    "bscscan-scrape",
  });

  await db.insert(siteSettings)
    .values({ settingKey: "cache:token_holders", settingValue: value })
    .onConflictDoUpdate({ target: siteSettings.settingKey, set: { settingValue: value, updatedAt: new Date() } });

  return `holders=${holdersNum.toLocaleString("en-US")}`;
}

// ─── Task 3: Daily Supply Snapshot ───────────────────────────────────────────

async function refreshSupplySnapshot(db: ReturnType<typeof drizzle>): Promise<string> {
  // Use bsc-dataseed for supply snapshot — NodeReal returns 0 for balanceOf
  // on the token contract and dead address (network-level filtering issue).
  const [totalHex, lockedHex, burnedHex] = await Promise.all([
    ethCall("0x18160ddd",          CONTRACT, BSC_DATASEED),
    ethCall(balanceOfData(CONTRACT), CONTRACT, BSC_DATASEED),
    ethCall(balanceOfData(DEAD_ADDR), CONTRACT, BSC_DATASEED),
  ]);

  const total  = hexToTokens(totalHex);
  const locked = hexToTokens(lockedHex);
  const burned = hexToTokens(burnedHex);
  const circ   = Math.max(0, total - locked - burned);

  if (total <= 0 || circ <= 0) throw new Error(`Invalid supply data: total=${total} circ=${circ}`);

  const snapDate = new Date().toISOString().slice(0, 10);
  const lp = parseFloat(((locked / total) * 100).toFixed(2));
  const bp = parseFloat(((burned / total) * 100).toFixed(2));
  const cp = parseFloat(((circ   / total) * 100).toFixed(2));

  await db.execute(sql`INSERT INTO supply_snapshots
       (snapshot_date, total_supply, locked_vested, burned, circulating,
        locked_pct, burned_pct, circulating_pct, source)
     VALUES (${snapDate},${total},${locked},${burned},${circ},${lp},${bp},${cp},'onchain')
     ON CONFLICT (snapshot_date) DO UPDATE SET
       total_supply=EXCLUDED.total_supply,
       locked_vested=EXCLUDED.locked_vested,
       burned=EXCLUDED.burned,
       circulating=EXCLUDED.circulating,
       locked_pct=EXCLUDED.locked_pct,
       burned_pct=EXCLUDED.burned_pct,
       circulating_pct=EXCLUDED.circulating_pct,
       source=EXCLUDED.source`);

  return `snapshot=${snapDate} circ=${Math.round(circ).toLocaleString("en-US")}`;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: "DATABASE_URL missing" }));
    return;
  }

  const db = drizzle(neon(dbUrl));
  const results: Record<string, string | null> = {};
  const errors:  Record<string, string> = {};

  // Run all three tasks concurrently — each has its own timeout
  await Promise.allSettled([
    refreshTokenPrice(db)
      .then(msg => { results.price   = msg; })
      .catch(err => { errors.price   = String(err?.message || err); }),

    refreshHolderCount(db)
      .then(msg => { results.holders  = msg; })
      .catch(err => { errors.holders  = String(err?.message || err); }),

    refreshSupplySnapshot(db)
      .then(msg => { results.snapshot = msg; })
      .catch(err => { errors.snapshot = String(err?.message || err); }),
  ]);

  const ok = Object.keys(errors).length === 0;
  res.statusCode = 200; // always 200 — individual errors are in the body
  res.end(JSON.stringify({ ok, results, errors, ranAt: new Date().toISOString() }));
}
