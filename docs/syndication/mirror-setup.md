# Mirror.xyz — TurboLoop syndication setup

Mirror.xyz is the highest-priority syndication target. Crypto-native audience, do-follow backlinks, no algorithmic suppression, and built-in NFT/token gating if we ever want it.

## One-time setup (5 minutes)

1. Go to <https://mirror.xyz>, click **Enter**.
2. Connect a wallet — use a dedicated **brand wallet** (NOT a personal one). If you don't have one, install MetaMask, create a new account in it, fund with $5 USDC for gas later. Mirror itself is free.
3. Mirror prompts you to set up a **publication**. Use:
   - **Name:** TurboLoop
   - **Username (subdomain):** `turboloop` (so the URL is `turboloop.mirror.xyz`)
   - **Logo:** upload `correct_logo.png` from this repo's root
   - **Bio:** "Decentralized yield protocol on Binance Smart Chain. Fixed ROI per cycle, audited and immutable smart contract."
   - **Custom domain (optional, $50 ENS or skip):** leave blank for now
4. Click **Settings → Profile** and add:
   - Twitter/X: `TurboLoop_io`
   - Website: `https://www.turboloop.tech`

That's it. Each post then goes through the workflow below.

## Per-post workflow

```bash
node scripts/syndicate.mjs --slug=<post-slug> --platform=mirror
```

Open the file printed at the end (`scripts/_syndication/<slug>/mirror.md`).

1. On Mirror, click **Write** → **New entry**.
2. Title: paste the title from the file (the first `# H1` line — but DELETE the `#` symbol; Mirror's title field renders as H1 automatically).
3. Body: paste everything from the file BELOW the first `# H1` line (so the title isn't duplicated).
4. Add a cover image — copy the `cover_image` URL from the source post (find it via `SELECT cover_image FROM blog_posts WHERE slug='<slug>'` or the [blog page](https://www.turboloop.tech/blog) preview).
5. Click **Publish** in the top-right.
   - **Don't** enable "Collect" (turns the post into an NFT — overkill for syndication).
   - **Don't** enable "Tokens" (same).
6. Mirror prompts you to sign a transaction with your brand wallet. Free (no gas — Mirror pays).

## Verifying the canonical signals

After publishing, view the page source on Mirror. Confirm:
- The opening paragraph reads "*Originally published at [turboloop.tech](https://www.turboloop.tech/blog/...)*."
- The closing paragraph repeats the canonical link.

Mirror doesn't expose a `<link rel="canonical">` HTML tag in their editor (technical limitation of their platform). The textual "originally published at" is the strongest signal we can give them. Google's crawler heuristics handle it correctly in practice.

## Per-month cadence

Recommended: syndicate **2-3 posts per month** to Mirror, picking pillar posts (security deep-dive, revenue flywheel, what-is-TurboLoop, etc.). Don't blast every post — Mirror's audience is small enough that quality > volume matters.
