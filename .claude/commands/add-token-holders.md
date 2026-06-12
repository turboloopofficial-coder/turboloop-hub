# /add-token-holders

Add a **Total Holders** stat to the token page (`turboloop.tech/token`), sourced live from BscScan.

---

## What to build

### 1. New API route — `next-app/app/api/token-holders/route.ts`

Scrape the BscScan token page meta tag to extract the holder count. No API key required — BscScan exposes it in the `og:description` meta tag on the public token page.

```
URL: https://bscscan.com/token/0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3
Meta tag: <meta name="description" content="Token Rep: Unknown | Holders: 346 | As at Jun-12-2026 05:28:54 PM (UTC)" />
Regex: /Holders:\s*([\d,]+)/
```

Route spec:
- `export const runtime = "edge"`
- `export const dynamic = "force-dynamic"`
- In-memory cache: 30-minute TTL (holder count updates slowly — BscScan itself only refreshes every few hours)
- On scrape failure: serve stale cache if available, otherwise return `{ holders: null, fresh: false }`
- Response shape:

```ts
interface TokenHoldersData {
  holders: string | null;       // formatted with commas e.g. "1,234"
  holdersNum: number | null;    // raw integer
  fetchedAt: number;            // ms since epoch
  fresh: boolean;
}
```

- Cache-Control: `public, s-maxage=1800, stale-while-revalidate=3600`

Fetch pattern (same as existing token routes — use `AbortSignal.timeout(8000)` and a browser-like User-Agent header so BscScan doesn't block the request):

```ts
const res = await fetch("https://bscscan.com/token/0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3", {
  signal: AbortSignal.timeout(8000),
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; TurboLoopBot/1.0)",
    "Accept": "text/html",
  },
  cache: "no-store",
});
const html = await res.text();
const match = html.match(/Holders:\s*([\d,]+)/);
```

---

### 2. Update `TokenSupplyWidget.tsx`

The widget currently shows 4 columns in a `grid-cols-2 md:grid-cols-4` layout:
- Circulating Supply (cyan)
- Total Supply (white)
- Burned (orange)
- Vested / Locked (violet)

**Add a 5th stat: Total Holders** (green accent `#10B981`).

Layout change: `grid-cols-2 md:grid-cols-5` — on mobile it stays 2-col (holders wraps to a new row, which is fine). On desktop it becomes a clean 5-column strip.

New state + fetch:

```ts
const [holdersData, setHoldersData] = useState<{ holders: string | null; holdersNum: number | null } | null>(null);

// Add to the existing Promise.all tick:
const [nextSupply, nextVested, nextHolders] = await Promise.all([
  fetchSupply(ctrl.signal),
  fetchVested(ctrl.signal),
  fetchHolders(ctrl.signal),   // new
]);
if (nextHolders) setHoldersData(nextHolders);
```

New `fetchHolders` function (same pattern as `fetchSupply`/`fetchVested`):

```ts
async function fetchHolders(signal?: AbortSignal): Promise<{ holders: string | null; holdersNum: number | null } | null> {
  try {
    const res = await fetch("/api/token-holders", { signal, cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
```

New `SupplyCell` in the JSX:

```tsx
<SupplyCell
  label="Total Holders"
  value={loaded ? holdersData?.holders ?? "—" : "—"}
  unit="wallets"
  accent="green"
  footnote="Unique wallet addresses"
/>
```

Update `SupplyCell` to handle `accent="green"`:

```ts
const accentColor =
  props.accent === "cyan"    ? "var(--c-brand-cyan)"
  : props.accent === "violet"  ? "#7C3AED"
  : props.accent === "orange"  ? "#F97316"
  : props.accent === "green"   ? "#10B981"
  : "var(--c-text)";
```

---

### 3. Poll interval

The holders fetch is in the same `setInterval` tick as supply/vested (every 5 minutes). That is fine — BscScan caches for ~2 hours anyway, so the API route's 30-minute cache means the actual scrape only fires a few times per hour regardless of how many users are on the page.

---

## Files to create / edit

| File | Action |
|---|---|
| `next-app/app/api/token-holders/route.ts` | **Create** |
| `next-app/components/token/TokenSupplyWidget.tsx` | **Edit** — add 5th column + holders fetch |

---

## Token contract address

```
0x64920e7f4f270f302e8b728f69b5a9fc24fda2d3
```

This is already in `next-app/lib/tokenFacts.ts` as `TOKEN.contract` — import and use it rather than hardcoding.

---

## Verification

After deploying:

```bash
curl https://www.turboloop.tech/api/token-holders
# Expected: { "holders": "346", "holdersNum": 346, "fresh": true, "fetchedAt": ... }
```

Load `turboloop.tech/token` → the supply widget should show 5 columns on desktop with "Total Holders" in green as the rightmost stat.

---

## Notes

- BscScan's holder count is updated every few hours — it is not real-time. This is expected and acceptable. Do not show a "live" indicator for this stat.
- If BscScan changes their HTML structure and the regex breaks, the widget gracefully shows "—" for holders while all other stats continue working normally.
- Do NOT use a paid BscScan API key — the free scrape approach is sufficient and avoids adding another secret to manage.
