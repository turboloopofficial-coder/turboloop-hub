# Hashnode — TurboLoop syndication setup

Hashnode is the second-priority syndication target. Tech-savvy crypto audience, do-follow backlinks, first-class canonical URL field. Their RSS-to-publication feature can also auto-sync — see "Auto-sync option" below.

## One-time setup (10 minutes)

1. Go to <https://hashnode.com>, sign up (Google or email).
2. Click **Start a personal blog**. Use:
   - **Title:** TurboLoop Blog
   - **Domain:** `turboloop.hashnode.dev` (so the URL is `turboloop.hashnode.dev/<slug>`)
   - **About:** "Long-form posts about TurboLoop — the decentralized yield protocol on Binance Smart Chain. Fixed ROI per cycle, audited, ownership renounced."
3. **Settings → General**:
   - Logo: upload `correct_logo.png`
   - Add social profiles: Twitter `@TurboLoop_io`, GitHub if applicable, Telegram link, YouTube link
4. **Settings → Display preferences**: enable "Show 'Read on Hashnode' badge"
5. **Settings → Domain**: skip custom domain unless we want `blog.turboloop.tech` to mirror Hashnode (not recommended right now — keep the canonical on our own site).

## Per-post workflow (manual mode)

```bash
node scripts/syndicate.mjs --slug=<post-slug> --platform=hashnode
```

Open `scripts/_syndication/<slug>/hashnode.md`.

1. On Hashnode, click **Write** in the top nav.
2. The file starts with YAML front-matter. **Don't paste the front-matter into Hashnode's editor** — instead transcribe each field into Hashnode's UI:
   - **Title:** copy from `title:` line
   - **Subtitle:** copy from `subtitle:` line
   - **Cover image:** upload the brand cover or skip
   - **Tags:** paste each tag from `tags: [...]` into the tag selector
3. Paste the markdown body (everything BELOW the closing `---` of the front-matter) into the editor.
4. **Critical:** click **More options** → **Canonical URL** and paste the canonical URL printed by the script (e.g., `https://www.turboloop.tech/blog/<slug>`). This is the most important step — Hashnode's `canonical_url` field tells Google "the source is over there."
5. Click **Publish**.

## Auto-sync option (no per-post manual work)

Hashnode supports **RSS-to-publication mirroring**. Point Hashnode at our `feed.xml` and every new post auto-imports, preserves canonical.

To enable:
1. **Settings → Integrations → Import from RSS**.
2. RSS URL: `https://www.turboloop.tech/feed.xml`
3. Set "preserve canonical URL" → ON.
4. Save.

Caveat: Hashnode's RSS import doesn't always preserve our markdown formatting 1:1 (it loses GFM callouts since those are TurboLoop-custom). Manual mode preserves everything but takes 5 min per post. Pick the trade-off you want.

## Verifying

After publishing, view page source on Hashnode and search for `rel="canonical"`. The href should be `https://www.turboloop.tech/blog/<slug>`. If yes, signal is correct.
