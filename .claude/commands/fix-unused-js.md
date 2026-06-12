# /fix-unused-js

Reduce unused JavaScript on the homepage to improve Lighthouse Performance score and Time to Interactive.

**Current state (as of June 2026 SEO audit):**
- Lighthouse flags ~233 KiB of unused JavaScript on the homepage
- Main offenders: large chunks loaded on every page but only used on specific routes
- Lighthouse Performance score: 63/100 (target: 80+)

---

## Step 1 — Identify the heavy chunks

Run a Next.js bundle analysis to find what's in the flagged chunks.

```bash
cd next-app
# Install bundle analyzer if not present
npm install --save-dev @next/bundle-analyzer

# Add to next.config.ts temporarily:
# const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true })
# export default withBundleAnalyzer(config)

# Or use the built-in approach:
ANALYZE=true npm run build 2>&1 | tail -50
```

Alternatively, check what's being imported in the layout and heavy sections:

```bash
# Find client components on the homepage path
grep -rn '"use client"' app/ components/sections/ --include="*.tsx" | grep -v "admin\|submit\|apply"
```

---

## Step 2 — Audit client components on the homepage

The homepage (`app/page.tsx`) is a Server Component. Any `"use client"` component it imports will be included in the initial JS bundle. Check each section:

```bash
cd next-app
for section in HomeGlobalReelsSection HomeBlogSection TestimonialSection NewsletterSection ProtocolBentoSection TokenSpotlightSection ZoomLiveSection; do
  echo "=== $section ==="
  head -3 components/sections/${section}.tsx
done
```

Client components that are **below the fold** (not visible without scrolling) should be dynamically imported:

```tsx
// In app/page.tsx — replace static imports with dynamic imports for below-fold sections
import dynamic from "next/dynamic";

// These sections are below the fold — defer their JS
const HomeGlobalReelsSection = dynamic(
  () => import("@components/sections/HomeGlobalReelsSection").then(m => ({ default: m.HomeGlobalReelsSection })),
  { ssr: true }
);
const ZoomLiveSection = dynamic(
  () => import("@components/sections/ZoomLiveSection").then(m => ({ default: m.ZoomLiveSection })),
  { ssr: true }
);
const HomeBlogSection = dynamic(
  () => import("@components/sections/HomeBlogSection").then(m => ({ default: m.HomeBlogSection })),
  { ssr: true }
);
const NewsletterSection = dynamic(
  () => import("@components/sections/NewsletterSection").then(m => ({ default: m.NewsletterSection })),
  { ssr: true }
);
```

Keep `ssr: true` so the HTML is still server-rendered (important for SEO and CLS). The `dynamic()` call only defers the **JavaScript** hydration, not the HTML.

---

## Step 3 — Check for heavy libraries imported at the top level

```bash
cd next-app
# Find any heavy libraries imported in layout or homepage
grep -rn "framer-motion\|@radix-ui\|recharts\|chart.js\|d3\|three" app/layout.tsx app/page.tsx components/sections/ --include="*.tsx" | grep "^import\|from '" | head -20
```

If `framer-motion` is imported in a section that's below the fold, wrap it in `dynamic()` or ensure it's in the `optimizePackageImports` list in `next.config.ts`.

The current `next.config.ts` already has:
```typescript
optimizePackageImports: ["lucide-react", "framer-motion"],
```

If `framer-motion` is still showing as unused JS, it may be imported in a component that's loaded on every page but only used on some. Check `components/Reveal.tsx` — if it uses framer-motion and is imported on the homepage, it will be in the initial bundle.

---

## Step 4 — Add `optimizePackageImports` for additional libraries

Update `next.config.ts` to include more libraries:

```typescript
experimental: {
  optimizePackageImports: [
    "lucide-react",
    "framer-motion",
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-tooltip",
    "date-fns",
  ],
},
```

---

## Step 5 — Verify and commit

1. Run `cd next-app && npm run build` — must exit 0 with no TypeScript errors.
2. Check the build output for chunk sizes — look for reduction in the main page bundle.
3. Run `cd next-app && npx tsc --noEmit` — zero errors.
4. Commit: `perf: lazy-load below-fold homepage sections, expand optimizePackageImports`
5. Push to `origin/main`.
6. After deploy, run PageSpeed Insights on https://www.turboloop.tech — target Lighthouse Performance ≥ 75.

---

## Important constraints

- **Never use `ssr: false`** for sections that contain text content — this breaks SEO and causes CLS.
- **Keep the hero, ProtocolBento, and NumbersSection as static imports** — they are above the fold and must render immediately.
- **Do not split the layout** — `app/layout.tsx` is shared across all pages; changes there affect every route.
- **Test on mobile** — use Chrome DevTools device emulation (Moto G4 or similar) to verify no layout shift after dynamic imports load.
