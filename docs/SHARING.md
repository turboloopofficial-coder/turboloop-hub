# Sharing & social previews — what's actually happening

This is the user-facing reality of sharing TurboLoop URLs on social platforms.
TL;DR: **the server-side fix works for new URLs, but old shares still show
old previews — that's how social platforms cache previews, not a bug on
our side.**

---

## How social previews actually work

When someone pastes a URL into Telegram, X, WhatsApp, LinkedIn, Facebook, or
Discord, the platform's bot fetches the URL **once** and caches the OG tags
(title, description, og:image) **per-URL, often indefinitely**. The next
time anyone shares the same URL, the platform shows the cached preview —
**it does not re-fetch even if the page has been updated**.

This means:

- Server fix (our job): make sure the page returns the right OG tags for
  bots. ✅ Already done — handled by `server/_vercel/social-meta.ts`,
  matched by user-agent in `vercel.json`.
- Cache invalidation (the platform's job): refresh the cached preview for
  a given URL. **Out of our control.**

To verify our server fix is working, send the URL through one of the
official validators below. They show what the platform's bot sees right now,
bypassing the cache.

---

## How to force a cache refresh per platform

If you've shared a URL and the preview is wrong/stale, you have two options:

1. **Use the platform's cache validator/refresher** to force a re-fetch
   (links below).
2. **Share a slightly different URL** — e.g. add a query param. Our share
   buttons already do this automatically with `?s=<hourly-timestamp>`,
   so every new share within a different hour is treated as a fresh URL
   by social platforms.

### Telegram

- Open [@WebpageBot](https://t.me/WebpageBot) in Telegram
- Send it the URL — it returns the cached preview and refreshes the cache
- Now re-share the original URL anywhere; the new preview will appear

### X (formerly Twitter)

- Use the [X Card Validator](https://cards-dev.twitter.com/validator)
- Paste the URL → click "Preview card"
- This forces X to re-fetch the OG tags

### LinkedIn

- Use the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- Paste the URL → click "Inspect"
- Click "Re-scrape" if the cached preview is stale

### Facebook

- Use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Paste the URL → click "Debug"
- Click "Scrape Again" to refresh the cache

### WhatsApp

- WhatsApp piggybacks off Facebook's cache. Run the URL through the
  Facebook Sharing Debugger (above) and WhatsApp will pick up the
  refreshed preview.

### Discord

- Discord refreshes previews aggressively (within minutes), so usually no
  manual intervention is needed. If a preview is genuinely stuck, paste
  the URL with a different query param (e.g. `?refresh=1`) — that creates
  a new cache entry.

---

## Built-in cache-bust

Every share button on the site appends `?s=<hourly-timestamp>` to the URL.
That means each share, in a new hour, is technically a different URL to
social platforms — they fetch fresh OG tags instead of serving a stale
cache.

Trade-offs:

- ✅ Fresh OG previews on every new share (after at most an hour)
- ✅ Same canonical URL for SEO (the `<link rel="canonical">` tag in `<head>`
  always points to the un-busted URL)
- ⚠️ If you share the *same* URL twice in the *same* hour, it'll still use
  the cached preview. Run it through the validators above for an instant
  refresh.

---

## Verifying the server-side OG tags

Quick curl test as a Telegram bot — should return the right title and
og:image for any URL:

```bash
curl -A "TelegramBot" https://turboloop.tech/reels/why-defi-is-broken \
  | grep -E '(og:title|og:image|og:description)'
```

Expected output: title and image specific to that reel. If you get the
homepage's tags, the server-side rewrite isn't matching that path —
check `vercel.json` rewrites for the path pattern.
