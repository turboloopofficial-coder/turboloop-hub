# /fix-seo-remaining

Address the remaining SEO items from the June 2026 audit that were not fixed in commit `f5c3257`.

**Already fixed in `f5c3257`:**
- ✅ Blog page crash → noindex bug
- ✅ og:type missing on 14 pages
- ✅ Multiple h1 tags on community/promotions/security
- ✅ Homepage/films/calculator metadata lengths
- ✅ Geist font render-blocking
- ✅ /careers and /social-wall missing from sitemap

**Remaining items (this command):**

---

## Item 1 — Add `og:url` to pages missing it

Some pages have `openGraph` blocks without an explicit `url` field. While Next.js infers the URL from `alternates.canonical`, explicitly setting `url` in the OG block ensures compatibility with all scrapers.

```bash
cd next-app
# Find pages with openGraph but no url: field
grep -rn "openGraph:" app/ --include="*.tsx" -l | while read f; do
  if grep -q "openGraph:" "$f" && ! grep -q "url:.*turboloop" "$f"; then
    echo "MISSING url: $f"
  fi
done
```

For each flagged page, add `url: "https://www.turboloop.tech/<path>"` to the `openGraph` block.

---

## Item 2 — Add `twitter:site` to all pages

The global Twitter card metadata in `app/layout.tsx` should include `twitter:site` (the brand's Twitter handle) so Twitter/X properly attributes shared links.

```typescript
// app/layout.tsx — add to the root metadata export
twitter: {
  card: "summary_large_image",
  site: "@turboloopdefi",   // ← add this
  creator: "@turboloopdefi", // ← add this
},
```

Check the actual Twitter handle first:
```bash
grep -rn "twitter\|@turbo" app/layout.tsx | head -5
```

---

## Item 3 — Add `applicationName` and `category` to root metadata

```typescript
// app/layout.tsx — already has applicationName but verify category
applicationName: "TurboLoop",
category: "Finance",  // ← add if missing
```

---

## Item 4 — Verify the blog page fix is working in production

After the `f5c3257` commit deployed, verify the blog page is no longer returning a noindex tag:

```bash
# Check the live blog page for noindex
curl -s https://www.turboloop.tech/blog | grep -i "noindex\|robots"

# Should return nothing (no noindex tag)
# If it still shows noindex, the API is still down — check:
curl -s "https://api.turboloop.tech/trpc/content.blogPosts?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D"
```

If the API is returning errors, investigate the tRPC endpoint. The blog page now has a try/catch so it won't crash, but if the API is persistently down, the blog will show an empty state.

---

## Item 5 — Add `lastModified` dates to static pages in sitemap

Currently all static pages use `lastModified: now` (the current date at sitemap generation time). For pages that rarely change (privacy, terms, faq), using a hardcoded date reduces unnecessary re-crawling signals.

```typescript
// app/sitemap.ts — use specific dates for stable pages
const STABLE_PAGES: Record<string, string> = {
  "/privacy": "2025-01-01",
  "/terms": "2025-01-01",
  "/faq": "2026-01-01",
  "/security": "2026-01-01",
};

// In the .map() call:
.map(path => ({
  url: `${BASE}${path}`,
  lastModified: STABLE_PAGES[path] ? new Date(STABLE_PAGES[path]) : now,
  changeFrequency: path === "" ? "daily" : path === "/blog" ? "weekly" : "monthly",
  priority: path === "" ? 1.0 : path === "/blog" ? 0.9 : 0.7,
}))
```

---

## Item 6 — Add `<link rel="dns-prefetch">` for flagcdn.com

The community and social-wall pages load flag images from `flagcdn.com`. Adding a DNS prefetch hint in `app/layout.tsx` reduces the DNS lookup time for these images.

```tsx
// app/layout.tsx — add after the R2 preconnect
<link rel="dns-prefetch" href="https://flagcdn.com" />
```

---

## Commit

After all fixes:
1. `cd next-app && npx tsc --noEmit` — zero errors
2. `cd next-app && npm run build` — exit 0
3. Commit: `seo: remaining audit items — og:url, twitter:site, dns-prefetch, sitemap lastModified`
4. Push to `origin/main`
5. Verify with: `curl -s https://www.turboloop.tech | grep -i "twitter:site\|og:url"`
