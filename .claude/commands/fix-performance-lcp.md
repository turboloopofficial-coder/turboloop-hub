# /fix-performance-lcp

Fix the remaining Core Web Vitals performance issues identified in the June 2026 SEO audit.

**Current state (as of audit):**
- Mobile LCP: 5.0s (failing — target < 2.5s)
- Mobile FCP: 3.3s (needs improvement — target < 1.8s)
- Lighthouse Performance: 63/100
- Identified causes: `unoptimized` prop on reel/film thumbnails, no priority on LCP image, unused JS

---

## Step 1 — Remove `unoptimized` from reel and film thumbnails

The `unoptimized` prop bypasses Next.js image optimization entirely, meaning R2-hosted PNGs are served as raw PNGs instead of compressed WebP/AVIF. The R2 domain is already in `next.config.ts` `remotePatterns`, so optimization works — the only blocker is the `?v=3` query string on reel thumbs.

### Fix A: Strip the query string from reel thumbUrl

In `lib/reelsData.ts`, change the `thumbUrl` to omit the `?v=N` suffix. The `Cache-Control: immutable` header on R2 already handles cache busting correctly (R2 serves the latest file; the browser caches by URL). The `?v=` suffix was a workaround for Brave's aggressive caching — but it also prevents Next.js image optimization.

```typescript
// lib/reelsData.ts — BEFORE
thumbUrl: `${R2}/reel-thumbs/${LANG_META[lang].dir}/${def.id}.png?v=${REELS_THUMB_VERSION}`,

// AFTER — remove the query string so Next.js optimizer can process it
thumbUrl: `${R2}/reel-thumbs/${LANG_META[lang].dir}/${def.id}.png`,
```

### Fix B: Remove `unoptimized` from ReelCard

```tsx
// components/reels/ReelCard.tsx — remove the unoptimized prop
<Image
  src={reel.thumbUrl}
  alt={reel.title}
  fill
  sizes="260px"
  className="object-cover motion-safe:group-hover:scale-105 transition-transform duration-500"
  loading="lazy"
  // unoptimized  ← REMOVE THIS LINE
/>
```

### Fix C: Remove `unoptimized` from FilmCard

```tsx
// components/films/FilmCard.tsx — remove the unoptimized prop
<Image
  alt={film.title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover motion-safe:group-hover:scale-105 transition-transform duration-500"
  priority={priority}
  // unoptimized  ← REMOVE THIS LINE
/>
```

### Fix D: Remove `unoptimized` from reels/[slug]/page.tsx

```tsx
// app/reels/[slug]/page.tsx — find the poster Image and remove unoptimized
// The poster URL comes from reel.thumbUrl which is now query-string-free
```

### Fix E: Remove `unoptimized` from reels/page.tsx

```tsx
// app/reels/page.tsx — find the thumbnail Image and remove unoptimized
```

---

## Step 2 — Add `priority` to the LCP image on the homepage

The homepage hero section renders above the fold. The first visible image is the LCP candidate. Find the first `<Image>` component that appears in the viewport on load (typically in `ProtocolBentoSection` or the hero) and add `priority` to it.

Check `components/sections/ProtocolBentoSection.tsx` and `app/page.tsx` for any `<Image>` tags. If none exist (the hero is text-only), the LCP element is the hero heading text — no image priority fix needed.

---

## Step 3 — Lazy-load below-fold homepage sections

The homepage imports all sections eagerly. Sections below the fold (ZoomLive, HomeBlog, Newsletter, HomeGlobalReels) can be wrapped in `React.lazy` + Suspense to defer their JS until after the hero is interactive.

However, since this is a **Server Component** page, the correct approach is to use `loading="lazy"` on any images in below-fold sections and ensure the sections themselves don't pull in heavy client-side JS.

Check `components/sections/HomeGlobalReelsSection.tsx` — if it's a client component (`"use client"`), consider splitting the interactive parts into a smaller client island.

---

## Step 4 — Verify and commit

1. Run `cd next-app && npm run build` — must exit 0.
2. Run `cd next-app && npx tsc --noEmit` — zero errors.
3. Commit with message: `perf: remove unoptimized from reel/film thumbnails, enable Next.js image optimization`
4. Push to `origin/main`.
5. After Vercel deploys (~90s), run PageSpeed Insights on https://www.turboloop.tech to verify LCP improvement.

---

## Expected outcome

Removing `unoptimized` allows Next.js to:
- Serve WebP/AVIF instead of PNG (typically 60–80% smaller)
- Resize images to the requested `sizes` breakpoints
- Cache optimized variants at Vercel's edge

The three reel thumbnails (v1: 184 KB, v2: 207 KB, v3: 241 KB) total ~632 KB as PNGs. As WebP at the rendered size (~260px wide), they should be ~15–25 KB each — a **~580 KB saving** on the reels page.

On the homepage, if any film/reel thumbnails appear in the viewport, this directly reduces LCP.
