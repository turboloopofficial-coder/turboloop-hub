# /add-price-change-periods

Add 7d, 14d, 30d, and All-Time price change stats to the token page price widget.

---

## Context

- Token launched **2026-06-01** (launch price: **$0.001**)
- Today (2026-06-12) = 11 days old → **14d and 30d must be hidden** with a "Coming Soon" badge
- **7d** is available (11 days of data exists) → show live
- **All-Time** = `(currentPrice − $0.001) / $0.001 × 100` → always available
- DexScreener only provides `h6` and `h24` natively — **do not use it for multi-day changes**
- Use **GeckoTerminal OHLCV** to compute 7d change

---

## Data Source

**GeckoTerminal OHLCV endpoint** (free, no API key):
```
GET https://api.geckoterminal.com/api/v2/networks/bsc/pools/0x5bede66bb27184001960e769efab95304f0e1759/ohlcv/day?limit=30&currency=usd
```
Response: `data.attributes.ohlcv_list` — array of `[timestamp, open, high, low, close, volume]` sorted newest-first.

**7d change calculation:**
- Find the candle whose timestamp is ≥ 7 days ago (UTC midnight)
- Use its `open` price as the 7d-ago reference price
- `change7d = (currentPrice − open7dAgo) / open7dAgo × 100`

**All-Time change calculation:**
- `changeAllTime = (currentPrice − TOKEN.launchPrice) / TOKEN.launchPrice × 100`
- `TOKEN.launchPrice = 0.001` (from `@lib/tokenFacts`)

---

## Files to Create / Modify

### 1. Create `next-app/app/api/token-price-history/route.ts`

New API route that fetches GeckoTerminal OHLCV and returns computed multi-period changes.

```typescript
// next-app/app/api/token-price-history/route.ts
import { NextResponse } from "next/server";
import { TOKEN } from "@lib/tokenFacts";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const GECKO_OHLCV_URL =
  `https://api.geckoterminal.com/api/v2/networks/bsc/pools/${TOKEN.pair}/ohlcv/day?limit=30&currency=usd`;

// Token launch date (UTC midnight)
const LAUNCH_DATE_MS = new Date("2026-06-01T00:00:00Z").getTime();

export interface TokenPriceHistoryData {
  /** 7-day price change as a decimal (+0.05 = +5%). null if unavailable. */
  priceChange7d: number | null;
  /** 14-day price change. null if token < 14 days old. */
  priceChange14d: number | null;
  /** 30-day price change. null if token < 30 days old. */
  priceChange30d: number | null;
  /** All-time change from launch price ($0.001). null if current price unavailable. */
  priceChangeAllTime: number | null;
  /** Days since token launch (for the UI to decide which badges to show). */
  daysSinceLaunch: number;
  /** Current price used for calculations (from most recent candle close). */
  currentPriceFromCandles: number | null;
  fetchedAt: number;
  fresh: boolean;
}

// In-memory cache — 5 min TTL (daily candles don't change that fast)
let cached: { data: TokenPriceHistoryData; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60_000;

function emptyResponse(): TokenPriceHistoryData {
  const daysSinceLaunch = Math.floor((Date.now() - LAUNCH_DATE_MS) / 86_400_000);
  return {
    priceChange7d: null,
    priceChange14d: null,
    priceChange30d: null,
    priceChangeAllTime: null,
    daysSinceLaunch,
    currentPriceFromCandles: null,
    fetchedAt: Date.now(),
    fresh: false,
  };
}

async function fetchHistory(): Promise<TokenPriceHistoryData> {
  const now = Date.now();
  const daysSinceLaunch = Math.floor((now - LAUNCH_DATE_MS) / 86_400_000);

  try {
    const res = await fetch(GECKO_OHLCV_URL, {
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return emptyResponse();

    const json = await res.json();
    // ohlcv_list: [[timestamp_sec, open, high, low, close, volume], ...]
    // GeckoTerminal returns newest candle LAST (ascending order)
    const candles: [number, number, number, number, number, number][] =
      json?.data?.attributes?.ohlcv_list ?? [];

    if (!candles.length) return emptyResponse();

    // Sort ascending by timestamp (oldest first) — GeckoTerminal is already
    // ascending but sort defensively
    candles.sort((a, b) => a[0] - b[0]);

    // Current price = close of most recent candle
    const currentPrice = candles[candles.length - 1][4];
    if (!currentPrice || !Number.isFinite(currentPrice)) return emptyResponse();

    // Helper: find the open price of the candle N days ago
    function priceNDaysAgo(n: number): number | null {
      const targetMs = now - n * 86_400_000;
      // Find the candle closest to (but not after) targetMs
      let best: [number, number, number, number, number, number] | null = null;
      for (const c of candles) {
        const candleMs = c[0] * 1000;
        if (candleMs <= targetMs) best = c;
      }
      if (!best) return null;
      return best[1]; // open price of that candle
    }

    function pctChange(from: number | null): number | null {
      if (from === null || from === 0 || !Number.isFinite(from)) return null;
      return (currentPrice - from) / from;
    }

    const open7d = priceNDaysAgo(7);
    const open14d = daysSinceLaunch >= 14 ? priceNDaysAgo(14) : null;
    const open30d = daysSinceLaunch >= 30 ? priceNDaysAgo(30) : null;
    const allTimeChange = pctChange(TOKEN.launchPrice);

    return {
      priceChange7d: pctChange(open7d),
      priceChange14d: pctChange(open14d),
      priceChange30d: pctChange(open30d),
      priceChangeAllTime: allTimeChange,
      daysSinceLaunch,
      currentPriceFromCandles: currentPrice,
      fetchedAt: now,
      fresh: true,
    };
  } catch {
    return emptyResponse();
  }
}

export async function GET() {
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }
  const data = await fetchHistory();
  if (data.fresh) {
    cached = { data, expiresAt: now + CACHE_TTL_MS };
  } else if (cached) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": data.fresh
        ? "public, s-maxage=300, stale-while-revalidate=600"
        : "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
```

---

### 2. Modify `next-app/components/token/TokenPriceWidget.tsx`

**Goal:** Add a second row of change stats below the existing 4-column grid.

**Design spec:**
- The existing 4-column grid (Price, 24h Change, 24h Volume, Liquidity) stays **unchanged**
- Below it, add a new row: **"Price Performance"** section with 4 change pills
- Pills: `7D`, `14D`, `30D`, `All-Time`
- 14D and 30D show a **"Coming Soon"** badge (greyed out, lock icon or clock icon) when `daysSinceLaunch < 14` / `< 30`
- When a period is available, show the same coloured `▲/▼ +X.XX%` format as the 24h stat
- The section has a subtle label "Price Performance" in the same style as other section labels
- Fetch from `/api/token-price-history` on mount, refresh every 5 minutes (not every 30s — daily candles don't change fast)

**New state and fetch in the component:**

```typescript
// Add alongside existing data/loaded state:
const [historyData, setHistoryData] = useState<TokenPriceHistoryData | null>(null);

useEffect(() => {
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/token-price-history");
      if (!res.ok) return;
      setHistoryData(await res.json());
    } catch {}
  };
  fetchHistory();
  const id = window.setInterval(fetchHistory, 5 * 60_000);
  return () => window.clearInterval(id);
}, []);
```

**New UI block** (add after the closing `</div>` of the main stats grid, inside the `full` variant):

```tsx
{/* Price Performance row */}
<div className="mt-3 md:mt-4">
  <div className="text-[0.625rem] md:text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
    Price Performance
  </div>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
    <PerfPill
      label="7D"
      change={historyData?.priceChange7d ?? null}
      available={true}
      loaded={historyData !== null}
    />
    <PerfPill
      label="14D"
      change={historyData?.priceChange14d ?? null}
      available={(historyData?.daysSinceLaunch ?? 0) >= 14}
      loaded={historyData !== null}
    />
    <PerfPill
      label="30D"
      change={historyData?.priceChange30d ?? null}
      available={(historyData?.daysSinceLaunch ?? 0) >= 30}
      loaded={historyData !== null}
    />
    <PerfPill
      label="All-Time"
      change={historyData?.priceChangeAllTime ?? null}
      available={true}
      loaded={historyData !== null}
    />
  </div>
</div>
```

**`PerfPill` component** (add near the bottom of the file, alongside `Stat`):

```tsx
function PerfPill({
  label,
  change,
  available,
  loaded,
}: {
  label: string;
  change: number | null;
  available: boolean;
  loaded: boolean;
}) {
  const formatted = formatPctChange(change);
  const direction = formatted.direction;
  const color = DIRECTION_COLOR[direction];

  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-3 md:px-4 md:py-3.5 shadow-[var(--s-sm)] flex flex-col gap-1">
      <div className="text-[0.625rem] md:text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)]">
        {label}
      </div>
      {!available ? (
        // Coming Soon state — greyed out with clock badge
        <div className="flex items-center gap-1.5">
          <span className="text-[0.6875rem] text-[var(--c-text-subtle)] opacity-50">
            ⏳
          </span>
          <span className="text-xs font-semibold text-[var(--c-text-subtle)] opacity-60">
            Coming Soon
          </span>
        </div>
      ) : !loaded ? (
        // Skeleton
        <div className="h-5 w-16 rounded bg-[var(--c-border)] animate-pulse" />
      ) : change === null ? (
        <span className="text-sm font-bold text-[var(--c-text-subtle)]">—</span>
      ) : (
        <span
          className="inline-flex items-baseline gap-1 tabular-nums text-sm font-bold"
          style={{ color }}
        >
          <span aria-hidden="true">{DIRECTION_GLYPH[direction]}</span>
          <span>{formatted.text}</span>
        </span>
      )}
    </div>
  );
}
```

**Import** the new type at the top of `TokenPriceWidget.tsx`:
```typescript
import type { TokenPriceHistoryData } from "@app/api/token-price-history/route";
// OR define inline if import path is awkward:
interface TokenPriceHistoryData {
  priceChange7d: number | null;
  priceChange14d: number | null;
  priceChange30d: number | null;
  priceChangeAllTime: number | null;
  daysSinceLaunch: number;
  currentPriceFromCandles: number | null;
  fetchedAt: number;
  fresh: boolean;
}
```

---

## Design Notes

- The "Coming Soon" pills use the same card shape and border as live pills — they don't collapse or disappear. This keeps the grid layout stable at 4 columns on desktop, 2×2 on mobile.
- The `⏳` emoji is intentional — it's small, universally understood, and avoids importing an icon library just for this.
- When 14D unlocks (day 14), the pill transitions automatically — no code change needed, `daysSinceLaunch` drives it.
- When 30D unlocks (day 30), same automatic transition.
- All-Time is always live since we compute it from the hardcoded `TOKEN.launchPrice = 0.001`.

---

## Auto-Unlock Schedule

| Period | Unlocks on | Date |
|--------|-----------|------|
| 7D | Already live | — |
| 14D | Day 14 | 2026-06-15 |
| 30D | Day 30 | 2026-07-01 |
| All-Time | Always live | — |

---

## Testing Checklist

- [ ] `/api/token-price-history` returns JSON with `priceChange7d` as a number
- [ ] `priceChange14d` and `priceChange30d` are `null` (token < 14 days old)
- [ ] `daysSinceLaunch` is correct (11 on 2026-06-12)
- [ ] 14D and 30D pills show "Coming Soon" with ⏳
- [ ] 7D and All-Time pills show coloured percentage
- [ ] Existing 4-column grid (Price, 24h Change, 24h Volume, Liquidity) is unchanged
- [ ] Mobile layout: 2×2 grid for both rows
- [ ] Skeleton state shows correctly before data loads
- [ ] No TypeScript errors

---

## Commit Message

```
feat(token): add 7d/14d/30d/all-time price change pills to TokenPriceWidget

- New /api/token-price-history route (GeckoTerminal OHLCV, 5-min cache)
- PerfPill component with Coming Soon state for 14d/30d (token < 14 days old)
- All-Time computed from TOKEN.launchPrice ($0.001)
- Auto-unlocks: 14d on 2026-06-15, 30d on 2026-07-01
```
