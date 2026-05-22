# Switch apex `turboloop.tech` → 301 (was: 307)

**Why this matters:** the current apex domain serves a 307 (temporary) redirect to `www.turboloop.tech`. Search engines treat 307 as "this is temporary, keep both URLs in the index" and split SEO authority across the two hostnames. A 301 (permanent) consolidates authority on www. This is a one-time Vercel Dashboard change — no code commit.

## What to do (2 minutes)

1. Open Vercel Dashboard → `turboloop-hub` project → **Settings** → **Domains**.
2. Find the `turboloop.tech` row (the apex, no www).
3. Click the row → "**Edit**" or the three-dot menu.
4. There's a "Redirect" toggle / configuration. Set it to:
   - **Redirect to:** `www.turboloop.tech`
   - **Redirect type / Status:** `Permanent (301)` (the default option may say "Temporary" / 307 — change it)
5. Save.

## Verify

After saving, from any shell:

```bash
curl -sI https://turboloop.tech/ | head -3
```

The first line should now read `HTTP/2 301`, not `HTTP/2 307`. The `location:` header should still point to `https://www.turboloop.tech/`.

You can also visit `https://redirect-checker.org/?url=turboloop.tech` and confirm the status reads "301 Moved Permanently".

## What changes downstream

- Search engines (Google in particular) will start consolidating link signals on www within 1–2 weeks.
- Existing backlinks pointing at the apex automatically transfer SEO authority forward via the 301.
- No change visible to users — same redirect destination, same UX.

## Why this isn't a code change

Vercel handles the apex→subdomain redirect at the platform layer, before the Next.js function ever runs. The status code is configured per-domain in the Dashboard, not in `next.config.ts` or `vercel.json`. Trying to force it via middleware would conflict with the platform redirect.
