# dev.to — TurboLoop syndication setup

dev.to is the third-priority syndication target. Broader dev audience (most aren't crypto-native, but a healthy minority are interested), do-follow backlinks, first-class `canonical_url` front-matter field.

## One-time setup (5 minutes)

1. Go to <https://dev.to>, sign up.
2. **Settings → Profile**:
   - **Name:** TurboLoop
   - **Tagline:** "Decentralized yield protocol on Binance Smart Chain"
   - **Profile image:** upload `correct_logo.png`
   - **Cover image:** TurboLoop banner (export from /creatives if needed)
   - **Bio:** "Decentralized yield protocol on Binance Smart Chain. Fixed ROI per cycle (Sprint 7d/3% → Ultimate 60d/54%). Audited, ownership permanently renounced, 1 USDT minimum."
   - **Website:** `https://www.turboloop.tech`
3. **Settings → Account → Connect social accounts**: link Twitter `@TurboLoop_io` for verification (gives a small reputation boost).

## Per-post workflow

```bash
node scripts/syndicate.mjs --slug=<post-slug> --platform=devto
```

Open `scripts/_syndication/<slug>/devto.md`.

1. On dev.to, click **Create Post** (top right).
2. Paste the ENTIRE file content (including the `---`-delimited front-matter at the top) into the editor. dev.to parses front-matter automatically — title, tags, description, cover image, and `canonical_url` all auto-populate from it.
3. Verify the preview:
   - Title appears at the top
   - Tags appear below the title
   - "Originally published at turboloop.tech" line appears at the start
4. Click **Publish**.

## Tag conventions

dev.to caps at 4 tags per post. The syndicate script picks the first 4 from `blog_posts.tags`. If they're not great fits for dev.to's broader audience, override manually before publishing. Recommended go-to tags:
- `defi` (DeFi audience)
- `web3` (broader web3 audience)
- `crypto` (general crypto)
- `tutorial` (for how-to-style posts) OR `discuss` (for opinion / analysis)

## Verifying

View the published post's HTML source. Look for `<link rel="canonical" href="https://www.turboloop.tech/blog/<slug>">`. dev.to ALWAYS emits this when `canonical_url:` is set in front-matter. If it's missing, the front-matter was malformed.

## Cadence

Match Mirror — **2-3 posts per month**, picking pillar posts. dev.to readers prefer dense, opinionated, takeaway-heavy content; the security deep-dive, the BSC-vs-Ethereum comparison, and the "what to watch for in a DeFi project" pillar all map naturally.
