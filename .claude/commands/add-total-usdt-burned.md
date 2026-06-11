# /add-total-usdt-burned

Display the total USDT spent on buybacks alongside the total TURBO burned
in the footer of the `BurnEventsFeed` component on the `/token` page.

---

## Context

The burn feed footer currently shows:

```
Total burned (last 9):    18,249 TURBO
```

The goal is to show both totals:

```
Total burned (last 9):    18,249 TURBO  ·  $1,510.09 USDT spent
```

The data is already available — each `BurnEvent` has a `usdtSpent` field,
and the API route already returns it. This is a UI-only change.

---

## Files to change

Only one file needs editing:

```
next-app/components/token/BurnEventsFeed.tsx
```

No API route changes needed. No new data fetching needed.

---

## Exact change to make

### 1. Add `totalUsdtSpent` to the `BurnFeedData` interface

The interface currently is:

```typescript
interface BurnFeedData {
  burns: BurnEvent[];
  totalBurned: number;
  fetchedAt: number;
  fresh: boolean;
}
```

Add `totalUsdtSpent`:

```typescript
interface BurnFeedData {
  burns: BurnEvent[];
  totalBurned: number;
  totalUsdtSpent?: number;   // ← add this
  fetchedAt: number;
  fresh: boolean;
}
```

### 2. Compute `totalUsdtSpent` from the rows

In the component body, after the `rows` constant, add:

```typescript
const totalUsdtSpent = rows.reduce((sum, b) => sum + (b.usdtSpent ?? 0), 0);
```

### 3. Update the footer JSX

The current footer (around line 182–205) shows:

```tsx
{/* Footer */}
{loaded && data && (
  <div className="mt-4 pt-3 border-t border-[var(--c-border)] text-[11px] md:text-xs text-[var(--c-text-muted)] flex items-center justify-between gap-2">
    <span>
      {data.fresh
        ? `Total burned (last ${rows.length}):`
        : "Burn data unavailable —"}
    </span>
    {data.fresh ? (
      <span className="font-bold text-[var(--c-text)] tabular-nums">
        {formatAmount(data.totalBurned)} TURBO
      </span>
    ) : (
      <a ...>View on BscScan</a>
    )}
  </div>
)}
```

Replace it with a two-row footer that shows both totals:

```tsx
{/* Footer */}
{loaded && data && (
  <div className="mt-4 pt-3 border-t border-[var(--c-border)] text-[11px] md:text-xs text-[var(--c-text-muted)]">
    {data.fresh ? (
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <span>Total burned (last {rows.length}):</span>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-[var(--c-text)] tabular-nums">
            {formatAmount(data.totalBurned)} TURBO
          </span>
          {totalUsdtSpent > 0 && (
            <span className="text-[var(--c-text-muted)] tabular-nums">
              ·&nbsp;
              <span className="font-bold text-[var(--c-text)]">
                {formatUsdt(totalUsdtSpent)}
              </span>
              {" "}USDT spent
            </span>
          )}
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-between gap-2">
        <span>Burn data unavailable —</span>
        <a
          href={BSCSCAN_BURN_VIEW}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[var(--c-brand-cyan)] hover:underline inline-flex items-center gap-1"
        >
          View on BscScan
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>
    )}
  </div>
)}
```

---

## Also update the API route (optional but cleaner)

The `/api/token-burns` route in `next-app/app/api/token-burns/route.ts`
already returns `totalBurned`. Optionally add `totalUsdtSpent` to the
`BurnFeedData` interface and response there too, so the component can
use `data.totalUsdtSpent` directly instead of recomputing from rows:

In `route.ts`, find the return statement that builds `BurnFeedData` and add:

```typescript
const totalUsdtSpent = burns.reduce((sum, b) => sum + b.usdtSpent, 0);

return {
  burns,
  totalBurned,
  totalUsdtSpent,   // ← add this
  fetchedAt: Date.now(),
  fresh: true,
};
```

If you add it to the route, use `data.totalUsdtSpent ?? totalUsdtSpent`
in the component footer so it works either way.

---

## Commit message

```
feat: show total USDT spent alongside total TURBO burned in burn feed footer
```

---

## Verify

After deploying, visit `https://www.turboloop.tech/token` and scroll to
the "Recent Burn Events" section. The footer should show both:

- `18,249 TURBO` (total tokens burned across displayed events)
- `$1,510.09 USDT spent` (total USDT spent on buybacks)

The exact numbers will update as new buybacks happen daily.
