# YouTube description template

Every TurboLoop YouTube upload (films, reels, tutorials, community recordings) should use a standardized description block. The first 150 chars appear in search snippets — make them count. The bottom block carries our backlink stack.

## Generated template

```bash
# Per-post template (carries that post's canonical URL):
node scripts/syndicate.mjs --slug=<post-slug> --platform=youtube
# → outputs scripts/_syndication/<slug>/youtube.txt
```

For videos that don't correspond to a specific blog post, use the **generic template below** instead.

## Generic template (no per-post canonical)

Paste this into the description box of any video, then edit the chapters + the top section to match the video's content:

```
TurboLoop — <one-line headline for THIS specific video>

<2-3 sentence description of the video itself. What does the viewer learn?
What's the takeaway? End with a hook back to the hub.>

▶ Visit the hub: https://www.turboloop.tech
▶ Run the numbers: https://www.turboloop.tech/calculator
▶ All films: https://www.turboloop.tech/films
▶ Security details: https://www.turboloop.tech/security

⏱ Chapters:
  0:00  Intro
  [add chapters once you have the cut]

🔗 Useful links
  • TurboLoop hub: https://www.turboloop.tech
  • Yield calculator: https://www.turboloop.tech/calculator
  • Security: https://www.turboloop.tech/security
  • All films: https://www.turboloop.tech/films
  • Telegram channel: https://t.me/TurboLoop_Official
  • Telegram community: https://t.me/TurboLoop_Chat
  • X / Twitter: https://x.com/TurboLoop_io
  • TikTok: https://www.tiktok.com/@turboloop

💼 About TurboLoop
  TurboLoop is a decentralized yield protocol on Binance Smart Chain.
  Fixed ROI per cycle from a USDC/USDT LP + Turbo Swap + Turbo Buy fees.
  Audited. Ownership permanently renounced. 1 USDT minimum deposit.

⚠️ Disclaimer
  Nothing in this video is financial advice. DeFi carries risk; do your own
  research. The 4 Loop Plans (Sprint 7d/3%, Boost 14d/10%, Power 30d/24%,
  Ultimate 60d/54%) are fixed in an immutable smart contract — verify on
  BscScan before depositing.

#TurboLoop #DeFi #BSC #Stablecoin #YieldFarming
```

## What this earns us

- **Backlinks from youtube.com → turboloop.tech**: ~8 per video. YouTube descriptions are crawled by Google.
- **Branded search anchor text**: "TurboLoop hub", "Yield calculator", etc., reinforce the brand for query matching.
- **Disclaimer compliance**: the "not financial advice" footer + the explicit BscScan verification CTA keeps us aligned with platform crypto-policy and prevents takedowns.
- **Hashtags at the bottom**: YouTube uses these for related-video discovery. 3-5 is the sweet spot — more dilutes ranking.

## Backfill plan

The current YouTube channel has ~28 videos in 12 languages. Manually updating every description is tedious but high-ROI:
1. Pick the 10 most-viewed videos (highest organic traffic = biggest SEO win).
2. Update those descriptions first.
3. Set a standing rule: every new upload uses the template before going live.

The legacy `videos` table doesn't store the YouTube description — we'd update each video manually in YouTube Studio. That's the right place because descriptions can be A/B-tested (early-published video can iterate after).
