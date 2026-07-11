# Adding a New Language to TurboLoop

Thanks to the language infrastructure refactor (July 2026), adding a new language now requires editing **exactly one file** in the codebase, plus two small database operations.

---

## Step 1 — Add the language to `lib/languages.ts`

Open `next-app/lib/languages.ts` and add a new entry to the `LANGUAGES` object:

```typescript
// Example: adding Japanese (ja)
ja: {
  code: "ja",           // DB language code (must be unique)
  locale: "ja",         // next-intl locale code (used in URLs like /ja/blog)
  name: "Japanese",     // English name
  nativeName: "日本語",  // Native name (shown in language picker)
  flag: "🇯🇵",          // Emoji flag
  bcp47: "ja-jp",       // BCP-47 code for hreflang and RSS
  slugSuffix: "-ja",    // Blog post slug suffix (e.g., "my-post-ja")
  telegramChannel: null, // Set to "telegram_ja" if you have a dedicated channel
  rssTitle: "Turbo Loop — 編集",
  rssDescription: "DeFi、利回り、セキュリティ、TurboLoopの数学に関する詳細記事。"
},
```

Also add `"ja"` to the `LANGUAGE_ORDER` array in the same file (at the appropriate position).

That's it for the codebase. Everything else derives automatically:
- `BlogLanguage` type in `api.ts`
- `HREFLANG_BY_LANG` map
- `BLOG_LANGUAGES` array (language picker)
- `RSS_LANG` and `CHANNEL_META` in `rssFeed.ts`
- `LANG_SLUG_SUFFIX` in `blog-translate/route.ts`
- `LOCALE_TO_BLOG_LANG` in `middleware.ts`
- `LOCALES` and `LOCALE_LABELS` in `routing.ts`

---

## Step 2 — Create the translation file

Copy `next-app/messages/en.json` and translate all values to the new language. Save as `next-app/messages/ja.json`.

```bash
cp next-app/messages/en.json next-app/messages/ja.json
# Then translate all values (not keys) to Japanese
```

**Key facts to preserve in all translations:**
- Plans: Sprint (3%), Boost (10%), Power (24%), Ultimate (54%) — fixed-term returns, NOT APY
- Minimum deposit: 1 USDT
- Referral income: paid daily at 1 PM UTC
- Plans pay at **end of term**, not daily
- $TURBO token is a bonus reward, not the primary yield

---

## Step 3 — Add blog headline pool (optional but recommended)

In `next-app/server/_vercel/_messagePools.ts`, add a `BLOG_HEADLINES_JA` array and include it in `HEADLINE_POOLS`:

```typescript
const BLOG_HEADLINES_JA = [
  "📖 今日の記事",
  "📖 ブログに新着",
  // ... add 20+ variations
];

const HEADLINE_POOLS: Record<string, readonly string[]> = {
  en: BLOG_HEADLINES_EN,
  de: BLOG_HEADLINES_DE,
  hi: BLOG_HEADLINES_HI,
  id: BLOG_HEADLINES_ID,
  bn: BLOG_HEADLINES_BN,
  ja: BLOG_HEADLINES_JA,  // ← add this
};
```

Also add a footer entry:
```typescript
const FOOTER_BY_LANG: Record<string, string> = {
  // ... existing entries ...
  ja: "turboloop.tech — 安全で透明",
};
```

---

## Step 4 — Database: Add Telegram channel cron (if applicable)

If you have a dedicated Telegram channel for this language, insert a scheduled cron:

```sql
INSERT INTO scheduled_posts (
    title, content, media_url, media_type, channels, buttons,
    schedule_type, cron_expression, next_run_at, status, created_at
) VALUES (
    'Daily Japanese Blog Post',
    '今日の新しい記事 — TurboLoop ブログ',
    NULL, 'none',
    '["telegram_ja"]'::jsonb,
    '[]'::jsonb,
    'recurring',
    '0 20 * * *',   -- 20:00 UTC daily
    NOW() + INTERVAL '1 hour',
    'pending',
    NOW()
);
```

---

## Step 5 — Add Telegram channel handler in `cron-master.ts`

If you have a dedicated Telegram group/channel for this language, add a handler in `next-app/server/_vercel/cron-master.ts` following the `telegram_bn` pattern:

```typescript
if (ch === "telegram_ja") {
  const jaChat = process.env.TELEGRAM_JAPANESE_CHAT;
  if (jaChat && token) {
    // send to dedicated Japanese chat
  } else {
    // fallback to main channel
  }
  continue;
}
```

Set the `TELEGRAM_JAPANESE_CHAT` environment variable in Vercel to the chat ID of your Japanese group.

---

## Step 6 — Translate existing blog posts

The `blog-translate` cron will automatically translate new English posts going forward. To backfill existing posts, trigger the cron manually or use the admin panel.

---

## Step 7 — Deploy

```bash
cd turboloop-hub
git add next-app/lib/languages.ts next-app/messages/ja.json next-app/server/_vercel/_messagePools.ts next-app/server/_vercel/cron-master.ts
git commit -m "feat: add Japanese (ja) language"
git push origin main
```

Vercel will auto-deploy. The new language will be live at `turboloop.tech/ja/` within ~2 minutes.

---

## Checklist

- [ ] Added entry to `LANGUAGES` in `lib/languages.ts`
- [ ] Added locale to `LANGUAGE_ORDER` in `lib/languages.ts`
- [ ] Created `messages/ja.json` translation file
- [ ] Added blog headline pool to `_messagePools.ts`
- [ ] Added footer line to `FOOTER_BY_LANG` in `_messagePools.ts`
- [ ] Inserted DB cron for `telegram_ja` (if applicable)
- [ ] Added `telegram_ja` handler in `cron-master.ts` (if applicable)
- [ ] Set `TELEGRAM_JAPANESE_CHAT` env var in Vercel (if applicable)
- [ ] Committed and pushed

---

## Files that are automatically updated (no manual edits needed)

| File | What auto-updates |
|---|---|
| `next-app/lib/api.ts` | `BlogLanguage` type, `HREFLANG_BY_LANG`, `BLOG_LANGUAGES` array |
| `next-app/lib/blogFactGuard.ts` | `BLOG_LANGUAGES` array for translation prompts |
| `next-app/lib/rssFeed.ts` | `RSS_LANG`, `CHANNEL_META` |
| `next-app/app/api/cron/blog-translate/route.ts` | `LANG_SLUG_SUFFIX` map |
| `next-app/middleware.ts` | `LOCALE_TO_BLOG_LANG` map |
| `next-app/lib/i18n/routing.ts` | `LOCALES`, `LOCALE_LABELS` |
| Sitemap, hreflang tags | All derived from `BLOG_LANGUAGES` |
| RSS feed routes | All derived from `BLOG_LANGUAGES` |
