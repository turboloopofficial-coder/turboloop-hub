# Twitter / X content calendar

**Goal:** sustained visibility + steady referral traffic to turboloop.tech. NOT viral one-shots. Three to five posts per week, mix of formats.

## Generated per-post threads

For any deep-dive blog post, the syndicate tool produces a 5-tweet thread:

```bash
node scripts/syndicate.mjs --slug=<post-slug> --platform=twitter
# → outputs scripts/_syndication/<slug>/twitter.txt
```

Copy each `[Tweet N/5]` block into Twitter's reply chain.

## Weekly cadence

| Day | Post type | Source |
|-----|-----------|--------|
| Mon | Pillar-post thread | New or recently-updated pillar blog post (5-tweet thread via syndicate.mjs) |
| Tue | Single chart / stat | One quote-able number from the protocol (LP locked %, TVL, 90-days-zero-incidents milestone, etc.) |
| Wed | Educational reply / quote-tweet | Engage with someone tweeting about DeFi yield, stablecoin LPs, or Ponzi-detection — drop a TurboLoop-as-positive-example reply |
| Thu | Community spotlight | Re-tweet a Creator Star video / shout out a presenter / share a community member's story (with permission) |
| Fri | Mini-tutorial | One specific feature: how to deposit / how to check on BscScan / how to compound / referral math — link to the relevant blog post |

Optional weekend posts:
- Sat: Long-form "weekly recap" thread (counts as 1 pillar-thread)
- Sun: behind-the-scenes, ecosystem partner shout-outs, light content

## Tweet templates

### Single-stat tweet
```
TurboLoop, day [N]:

→ [stat headline, e.g. "90 days zero security incidents"]
→ [supporting figure, e.g. "$204K TVL"]
→ [framing, e.g. "All from real revenue: USDC/USDT LP fees + Turbo Swap + Turbo Buy."]

Verify on BscScan: [contract URL]
Run the numbers: https://www.turboloop.tech/calculator
```

### Quote-tweet template (for engaging with DeFi-skeptic posts)
```
This is exactly why renounced ownership matters.

TurboLoop:
• Ownership permanently destroyed on-chain
• 100% LP locked
• Source verified on BscScan
• $100K open challenge — nobody has claimed it

Full breakdown: https://www.turboloop.tech/blog/turbo-loop-security-deep-dive
```

### Community spotlight (with shout-out)
```
Shout out to @[handle] for [what they did — hosted Zoom, made a video, wrote a guide].

The TurboLoop community is genuinely global — [N]+ active users across [country count]+ countries.

Want to host your own Zoom? Apply: https://www.turboloop.tech/apply
```

### Mini-tutorial template
```
How to compound on TurboLoop in 60 seconds:

1. Your Power Loop cycle ends → principal returns
2. Open dashboard, claim earnings
3. Re-deposit principal + earnings into a NEW Power Loop
4. Repeat

Example: $1,000 → $1,240 after 30d → $1,538 after 60d → ...

Math: https://www.turboloop.tech/calculator
```

## Hashtag strategy

Pick 2-3 per post, never more. Recommended set:
- `#TurboLoop` — branded, always include
- `#DeFi` — broad reach
- `#BSC` — chain-specific, finds the BSC community
- `#StablecoinYield` — niche but high-intent
- `#PassiveIncome` — broader retail interest (use sparingly)

Avoid: `#crypto` (too broad, no signal), `#NFA` (signals desperation), random ticker tags.

## Tracking

Track click-through from x.com → turboloop.tech in Google Analytics:
- **Source:** twitter
- **Medium:** social
- **Campaign (optional):** the specific blog post slug

Append `?utm_source=twitter&utm_medium=social&utm_campaign=<slug>` to every link in tweets that points to turboloop.tech. The syndicate.mjs script doesn't auto-append (different campaigns per tweet); add manually before posting.

## Time-of-day

Best windows for crypto/DeFi audience (UTC):
- 13:00-15:00 UTC (US morning + EU afternoon)
- 22:00-00:00 UTC (US evening, Asia morning)

Worst window: 04:00-08:00 UTC.
