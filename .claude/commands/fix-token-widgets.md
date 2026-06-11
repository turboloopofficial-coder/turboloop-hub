# /fix-token-widgets

Diagnose and fix broken data widgets on the `/token` page of turboloop.tech.

Run this command whenever the burn events feed, price chart, or any other data
widget on `/token` is showing an error, empty state, or "data unavailable".

---

## What this command does

1. Reads the current source files for every data widget on `/token`
2. Tests each API route and its upstream data source with `curl`
3. Identifies exactly which source is broken and why
4. Rewrites only the broken API route(s) and/or component(s) to use a working source
5. Commits and pushes — Vercel auto-deploys
6. Verifies the fix is live

---

## Step 1 — Read the widget source files

Read these files to understand the current state before touching anything:

- `next-app/app/token/page.tsx` — which components are used on the page
- `next-app/app/api/token-burns/route.ts` — burn feed API route
- `next-app/app/api/token-price/route.ts` — price/supply API route
- `next-app/components/token/BurnEventsFeed.tsx` — burn feed component
- `next-app/components/token/DexScreenerChart.tsx` — price chart component
- `next-app/components/token/TokenPriceWidget.tsx` — price ticker component

---

## Step 2 — Test every live API route

Run each curl command and record the output. A working route returns `"fresh": true`
with non-empty data. A broken route returns `"fresh": false`, an empty array, or an
HTTP error.

```bash
# Burn events feed
curl -s https://www.turboloop.tech/api/token-burns

# Token price + supply
curl -s https://www.turboloop.tech/api/token-price
```

---

## Step 3 — Test the upstream data sources directly

For each broken route, test its upstream source to confirm whether the source
itself is down or whether the route code is wrong.

```bash
# ── Burn feed upstream ──────────────────────────────────────────────────────
# Source: turboloop.io backend (always fresh, no API key needed)
curl -s "https://turboloop.io/api/proxy/buybacks?limit=5&page=1"
# Expected: { "data": { "items": [...], "pagination": {...} } }
# Items have: execution_number, tx_hash, tokens_burned, usdt_spent, timestamp

# ── Token price upstream ────────────────────────────────────────────────────
# Source: DexScreener public API (no key needed)
curl -s "https://api.dexscreener.com/latest/dex/pairs/bsc/0x5bede66bb27184001960e769efab95304f0e1759"
# Expected: { "pair": { "priceUsd": "...", "volume": {...}, ... } }

# ── Fallback: DexScreener tokens endpoint ───────────────────────────────────
curl -s "https://api.dexscreener.com/latest/dex/tokens/0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3"
# Expected: { "pairs": [{ "priceUsd": "...", "pairAddress": "...", ... }] }
```

**Do NOT use BscScan.** Both V1 and V2 free tier are broken for BSC as of 2026:
- V1: deprecated August 2025
- V2 free: requires a paid API key for BSC, returns auth error

---

## Step 4 — Identify the root cause

Match the symptom to the cause:

| Symptom | Likely cause |
|---------|-------------|
| `"fresh": false`, `burns: []` | Upstream API returning error or empty |
| HTTP 500 on the route | TypeScript/runtime crash — check the route file for `export const runtime = "edge"` conflicts with Node.js APIs |
| Chart iframe blank | Wrong pair address, or `frame-src` CSP missing `dexscreener.com` |
| Price shows `—` or `0` | DexScreener API shape changed, or wrong field name in the route |

---

## Step 5 — Fix the broken route

Edit only the file(s) that are broken. Do not touch working routes.

### Burn feed fix pattern

If `turboloop.io/api/proxy/buybacks` returns data but the route is broken,
rewrite `next-app/app/api/token-burns/route.ts` to:

```typescript
// Fetch from turboloop.io proxy
const res = await fetch("https://turboloop.io/api/proxy/buybacks?limit=20&page=1", {
  signal: AbortSignal.timeout(6000),
  cache: "no-store",
});
const json = await res.json();
const items = json?.data?.items ?? [];

// Each item shape:
// { execution_number, tx_hash, tokens_burned, usdt_spent, timestamp }
// tokens_burned and usdt_spent are raw wei strings (divide by 1e18)
// timestamp is ISO 8601 string
```

### Price feed fix pattern

If DexScreener returns data but the route is broken,
rewrite `next-app/app/api/token-price/route.ts` to use:

```typescript
const PAIR = "0x5bede66bb27184001960e769efab95304f0e1759";
const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/bsc/${PAIR}`);
const json = await res.json();
const pair = json?.pair ?? {};
// Fields: pair.priceUsd, pair.volume.h24, pair.liquidity.usd, pair.priceChange.h24
```

### Chart fix pattern

If the DexScreener chart iframe is blank, check `DexScreenerChart.tsx`:

```typescript
// Correct embed URL — pair address must be lowercase
const PAIR = "0x5bede66bb27184001960e769efab95304f0e1759";
const src = `https://dexscreener.com/bsc/${PAIR}?embed=1&theme=dark&info=0&trades=0`;
// Render as: <iframe src={src} ... />
```

Also check `next-app/next.config.ts` — the `Content-Security-Policy` header must
include `frame-src https://dexscreener.com` if a CSP is set.

---

## Step 6 — Update the component interface if the data shape changed

If the API route now returns different fields, update the TypeScript interface
in the component file to match. The component must not crash on missing fields —
use optional chaining (`?.`) and fallback values.

---

## Step 7 — Commit and push

```bash
git add next-app/app/api/ next-app/components/token/
git commit -m "fix: [widget name] — [one-line description of what changed and why]"
git push
```

Vercel auto-deploys on push. The deployment takes ~2 minutes.

---

## Step 8 — Verify the fix is live

Wait ~2 minutes, then re-run the curl tests from Step 2. Confirm:

- `"fresh": true`
- Data arrays are non-empty
- Values are realistic (price ~$0.10, burns are positive numbers)

Also open `https://www.turboloop.tech/token` in a browser and visually confirm
the widget is rendering correctly.

---

## Key constants (do not change these)

```
TURBO contract:     0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3
TURBO/USDT pair:    0x5bede66bb27184001960e769efab95304f0e1759  (BSC)
Dead/burn address:  0x000000000000000000000000000000000000dead
Buyback contract:   0xd8735b03e0b18f1e0598c211cee9558c6247b6b9
Token decimals:     18
```

## Known working data sources (June 2026)

| Data needed | URL | Auth |
|-------------|-----|------|
| Burn executions | `https://turboloop.io/api/proxy/buybacks?limit=20&page=1` | None |
| Token price + volume | `https://api.dexscreener.com/latest/dex/pairs/bsc/{pair}` | None |
| Token info by contract | `https://api.dexscreener.com/latest/dex/tokens/{contract}` | None |
| BSC block number | `https://bsc.publicnode.com` (eth_blockNumber) | None |
| BSC event logs | `https://bsc.publicnode.com` (eth_getLogs, max 50k blocks) | None |

## Known broken sources (do not use)

| Source | Why broken |
|--------|-----------|
| `https://api.bscscan.com/api?...` | Deprecated Aug 2025 |
| `https://api.bscscan.com/v2/api?chainid=56&...` | Requires paid API key for BSC |
