# /feature-yield-simulator

Upgrade the existing `YieldCalculator.tsx` into a fully interactive, visual **Yield Simulator** with a live growth chart, comparison mode, and shareable results.

---

## Context

The current `YieldCalculator.tsx` (used on the homepage and `/calculator`) already has:
- A deposit amount input with presets ($100, $500, $1K, $5K, $10K)
- 4 plan options (7, 30, 60, 90 days)
- Compound vs simple toggle
- Animated count-up numbers
- A basic SVG chart drawn manually

The goal is to replace the basic SVG chart with a **rich Recharts-powered visualization** and add several high-conversion features.

**Key files:**
- `client/src/components/sections/YieldCalculator.tsx` — the component to upgrade
- `client/src/pages/Home.tsx` — uses the calculator in a section
- `package.json` — check if `recharts` is already installed; if not, add it

---

## What to Build

### 1. Replace the SVG Chart with Recharts `AreaChart`

Install `recharts` if not already present (`pnpm add recharts`).

Replace the existing manual SVG chart with a `ResponsiveContainer > AreaChart` from Recharts showing:

- **X-axis:** Day number (0 to plan duration)
- **Y-axis:** Portfolio value in USD (formatted with `$` prefix, abbreviated for large values)
- **Two area series:**
  1. `compound` — filled with a cyan-to-purple gradient, labeled "With Compounding"
  2. `simple` — filled with a subtle grey/navy, labeled "Without Compounding"
- **Tooltip:** Custom tooltip showing the day, compound value, simple value, and the difference between them (labeled "Extra from compounding: +$X")
- **Reference line:** A horizontal dashed line at the initial deposit amount, labeled "Your Deposit"
- **Animation:** `isAnimationActive={true}` with a 800ms duration on first render

### 2. Add a "Plan Comparison" Mode

Add a toggle button: **"Compare All Plans"**

When active, the chart switches to show all 4 plans as separate lines on the same chart (7-day, 30-day, 60-day, 90-day), each in a different brand color, so users can visually compare the compounding effect across plans.

### 3. Add a "Daily Earnings" Breakdown Table

Below the chart, add a compact table showing the first 7 days of earnings:

| Day | Starting Balance | Daily Yield | Ending Balance |
|-----|-----------------|-------------|----------------|
| 1   | $1,000.00       | +$9.00      | $1,009.00      |
| 2   | $1,009.00       | +$9.08      | $1,018.08      |
| ... | ...             | ...         | ...            |

Show only the first 7 rows with a "Show all X days" expand button.

### 4. Add a "Share My Projection" Button

Add a **"Share"** button below the calculator that:
1. Generates a shareable URL: `/calculator?deposit=1000&plan=60&compound=true`
2. Uses the existing `ShareButton` component or native Web Share API.
3. The calculator reads these URL params on load and pre-fills the inputs accordingly.

### 5. Visual Polish

- The calculator card should have a subtle animated gradient border (cyan → purple → teal, rotating slowly).
- On mobile, the chart height should be 200px; on desktop, 280px.
- The "Your projected return" number should use the existing `useCountUp` hook for smooth animation.
- All plan selector buttons should use the plan's brand color as the active state background.

---

## Accuracy Rules

- Daily rate is `0.9%` (0.009) — this matches the existing `DAILY_RATE` constant. Do not change it.
- Never use the term "APY" anywhere in the component. Use "Total ROI" or "Total Return".
- The disclaimer "Projections are illustrative only. Not financial advice." must remain visible below the chart.

---

## Acceptance Criteria

- [ ] Recharts `AreaChart` renders correctly on both mobile and desktop.
- [ ] The compound vs simple toggle visually updates the chart in real time.
- [ ] "Compare All Plans" mode shows all 4 plans on one chart.
- [ ] The daily breakdown table shows the first 7 days and expands correctly.
- [ ] The share URL pre-fills the calculator on load.
- [ ] No "APY" terminology appears anywhere.
- [ ] The existing calculator on the homepage is replaced with the new component (same import path).
