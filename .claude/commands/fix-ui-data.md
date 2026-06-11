# /fix-ui-data

Diagnose and fix a UI component that is not loading data on turboloop.tech.

## Usage

```
/fix-ui-data [component-name-or-url]
```

Examples:
- `/fix-ui-data` — inspect the whole /token page for broken data widgets
- `/fix-ui-data BurnEventsFeed` — target a specific component
- `/fix-ui-data /token` — inspect all data widgets on a specific page

---

## Diagnostic Playbook

### Step 1 — Identify the symptom

Visit the live page and look for:
- "data unavailable" / "error" / empty state messages
- Skeleton loaders that never resolve
- `0` values where real data is expected
- Console errors (open DevTools → Console)

**Common components and their API routes:**

| Component | API Route | Data Source |
|-----------|-----------|-------------|
| `BurnEventsFeed` | `/api/token-burns` | `turboloop.io/api/proxy/buybacks` |
| `TokenPriceWidget` | `/api/token-price` | DexScreener public API |
| `TokenSupplyWidget` | `/api/token-price` | DexScreener public API |
| `DexScreenerChart` | iframe embed | `dexscreener.com/bsc/{pairAddress}?embed=1` |
| LP Flow feed | `/api/lp-events` | BSC RPC `eth_getLogs` via publicnode |

---

### Step 2 — Test the API route directly

```bash
# Test the failing route on the live site
curl -s https://www.turboloop.tech/api/token-burns | python3 -m json.tool | head -40

# Check the X-Token-Burns-Status header
curl -sI https://www.turboloop.tech/api/token-burns | grep -i "x-token\|cache-control\|fresh"
```

Look for:
- `fresh: false` → upstream data source is down or returning errors
- `burns: []` → API call succeeded but returned no data
- HTTP 500 → server-side crash, check Vercel function logs

---

### Step 3 — Test the upstream data source directly

```bash
# BurnEventsFeed upstream
curl -s "https://turboloop.io/api/proxy/buybacks?limit=5&page=1" | python3 -m json.tool | head -30

# TokenPriceWidget upstream
PAIR="0x5bede66bb27184001960e769efab95304f0e1759"
curl -s "https://api.dexscreener.com/latest/dex/pairs/bsc/$PAIR" | python3 -c "
import json,sys; d=json.load(sys.stdin); p=d.get('pair',{}); print('price:', p.get('priceUsd')); print('volume24h:', p.get('volume',{}).get('h24'))
"

# BSC RPC health (for eth_getLogs based feeds)
curl -s -X POST "https://bsc.publicnode.com" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | python3 -c "import json,sys; print('block:', int(json.load(sys.stdin)['result'],16))"
```

---

### Step 4 — Check for CSP / iframe issues (chart not loading)

The DexScreener chart is an `<iframe>` embed. It fails if:

1. **Our page has wrong CSP** — check `next.config.ts` `headers()` for `frame-src` or `Content-Security-Policy`
2. **DexScreener blocks the embed** — they allow `?embed=1` embeds; the URL must be `https://dexscreener.com/bsc/{pairAddress}?embed=1&theme=dark&info=0&trades=0`
3. **Wrong pair address** — TURBO/USDT pair on BSC: `0x5bede66bb27184001960e769efab95304f0e1759`

```bash
# Verify the pair address is correct
curl -s "https://api.dexscreener.com/latest/dex/tokens/0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3" | python3 -c "
import json,sys; d=json.load(sys.stdin); pairs=d.get('pairs',[]); [print(p.get('chainId'), p.get('pairAddress'), p.get('priceUsd')) for p in pairs[:3]]
"
```

---

### Step 5 — Check Vercel function logs

```bash
VERCEL_TOKEN="vcp_45RP3KdMbxIJuv3Bz1Ikmv85CcBPvHu0"
PROJECT_ID="prj_2jVPMOWFqpBkqRBbBiMGE0eBWVJe"

# Get latest deployment
DEPLOY_ID=$(curl -s "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=1&state=READY" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import json,sys; print(json.load(sys.stdin)['deployments'][0]['uid'])")

# Get function runtime logs (last 100 lines)
curl -s "https://api.vercel.com/v2/deployments/$DEPLOY_ID/events?limit=100&type=runtime" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "
import json,sys
events = json.load(sys.stdin)
for e in events:
  if 'error' in str(e).lower() or 'fail' in str(e).lower():
    print(e)
"
```

---

### Step 6 — Common fixes

#### Fix A: Upstream API changed or deprecated

The most common cause. Replace the data source in the API route.

**Pattern:** `next-app/app/api/{route}/route.ts`

```typescript
// OLD (broken): BscScan V1/V2 free tier
const url = `https://api.bscscan.com/api?module=account&action=tokentx...`

// NEW (working): turboloop.io proxy (always fresh, no API key needed)
const url = `https://turboloop.io/api/proxy/buybacks?limit=20&page=1`
```

**Other reliable free sources:**
- Token price: `https://api.dexscreener.com/latest/dex/pairs/bsc/{pairAddress}`
- BSC events: `https://bsc.publicnode.com` (eth_getLogs, max 50k block range)
- Token info: `https://api.dexscreener.com/latest/dex/tokens/{contractAddress}`

#### Fix B: Component uses old interface shape

After changing the API route's response shape, update the component's TypeScript interface.

File: `next-app/components/token/{ComponentName}.tsx`

```typescript
// Check the interface matches the new API response
interface BurnEvent {
  hash: string;
  timestamp: number;
  amount: number;
  usdtSpent?: number;      // new field from buybacks proxy
  executionNumber?: number; // new field from buybacks proxy
}
```

#### Fix C: iframe blocked by CSP

Add `dexscreener.com` to `frame-src` in `next.config.ts`:

```typescript
// next.config.ts headers()
{
  key: "Content-Security-Policy",
  value: "frame-src 'self' https://dexscreener.com https://widget.dexscreener.com;"
}
```

#### Fix D: Edge runtime can't use Node.js APIs

If the route uses `import { createClient } from '@neondatabase/serverless'` or any Node.js-only module, either:
- Remove `export const runtime = "edge"` (use Node.js runtime), OR
- Replace the import with an Edge-compatible alternative

---

### Step 7 — Deploy and verify

```bash
cd /home/ubuntu/turboloop-hub-fresh

# Commit the fix
git add next-app/app/api/ next-app/components/
git commit -m "fix: [component] switch data source to [new-source]"
git push

# Poll for READY (runs every 15s for up to 3 minutes)
VERCEL_TOKEN="vcp_45RP3KdMbxIJuv3Bz1Ikmv85CcBPvHu0"
PROJECT_ID="prj_2jVPMOWFqpBkqRBbBiMGE0eBWVJe"
for i in $(seq 1 12); do
  STATUS=$(curl -s "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=1" \
    -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import json,sys; print(json.load(sys.stdin)['deployments'][0]['readyState'])")
  echo "[$i/12] $STATUS"
  [ "$STATUS" = "READY" ] && break
  sleep 15
done

# Smoke-test the fixed API
curl -s https://www.turboloop.tech/api/token-burns | python3 -c "
import json,sys; d=json.load(sys.stdin)
print('fresh:', d.get('fresh'))
print('burns:', len(d.get('burns',[])))
if d.get('burns'): print('first burn:', d['burns'][0])
"
```

---

## Key constants

```
TURBO contract:    0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3
TURBO/USDT pair:   0x5bede66bb27184001960e769efab95304f0e1759
Dead address:      0x000000000000000000000000000000000000dead
Buyback contract:  0xd8735b03e0b18f1e0598c211cee9558c6247b6b9
Vercel project ID: prj_2jVPMOWFqpBkqRBbBiMGE0eBWVJe
Vercel token:      vcp_45RP3KdMbxIJuv3Bz1Ikmv85CcBPvHu0
```

## Known working data sources (as of June 2026)

| Data | Source | Notes |
|------|--------|-------|
| Burn events | `turboloop.io/api/proxy/buybacks` | Public, no key, paginated |
| Token price | `api.dexscreener.com/latest/dex/pairs/bsc/{pair}` | Public, no key |
| Token info | `api.dexscreener.com/latest/dex/tokens/{contract}` | Public, no key |
| BSC logs | `bsc.publicnode.com` (eth_getLogs) | Free RPC, max 50k blocks |
| BSC block | `bsc.publicnode.com` (eth_blockNumber) | Free RPC |

## Known broken sources (as of June 2026)

| Source | Reason |
|--------|--------|
| `api.bscscan.com/api?...` (V1) | Deprecated Aug 2025 |
| `api.bscscan.com/v2/api?chainid=56...` (V2 free) | Requires paid API key for BSC |
