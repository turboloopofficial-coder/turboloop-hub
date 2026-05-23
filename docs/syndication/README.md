# Syndication — cross-post TurboLoop content to web2/web3 platforms

**Goal:** Build authority backlinks + reach audiences who don't already follow turboloop.tech, without splitting SEO authority.

**Mechanism:** Every syndicated copy declares `rel=canonical` pointing back to `https://www.turboloop.tech/blog/<slug>`. Google + other search engines respect the canonical and consolidate ranking signals on our site. Syndicated copies still appear in their host platforms' feeds + search; they just don't compete with us on Google.

---

## The tool: `scripts/syndicate.mjs`

Pulls the latest version of a blog post from Neon, formats it for each target platform, writes ready-to-paste files to `scripts/_syndication/<slug>/<platform>.{md,txt,html}`.

```bash
# All platforms for one post
node scripts/syndicate.mjs --slug=turbo-loop-security-deep-dive

# Just one platform
node scripts/syndicate.mjs --slug=turbo-loop-security-deep-dive --platform=hashnode
```

Output:
```
scripts/_syndication/turbo-loop-security-deep-dive/
  mirror.md       — Mirror.xyz markdown with inline canonical
  hashnode.md     — Hashnode front-matter + canonical field
  devto.md        — dev.to front-matter + canonical_url
  youtube.txt     — YouTube video description template (paste into description field of any video that references this post)
  twitter.txt     — Twitter/X thread, 5 tweets, ready to copy one-at-a-time
  telegram.html   — Telegram broadcast HTML (channel + group)
```

---

## Platform priority order (2026)

| # | Platform | Type | Effort | Backlink value |
|---|----------|------|--------|---------------|
| 1 | Mirror.xyz | Web3 publication | Low | High (do-follow, crypto audience) |
| 2 | Hashnode | Dev community | Low | High (do-follow, tech/crypto crowd) |
| 3 | dev.to | Dev community | Low | High (do-follow) |
| 4 | LinkedIn Articles | Pro network | Medium | Medium (no-follow but referral traffic) |
| 5 | Medium | General | Low | Low (no-follow, distribution collapsed in 2024-25) |

Medium was the historical default but its organic distribution collapsed after the 2023-2024 paywall changes. Mirror + Hashnode + dev.to all give do-follow backlinks AND active community engagement.

---

## Per-platform setup

See:
- [mirror-setup.md](./mirror-setup.md)
- [hashnode-setup.md](./hashnode-setup.md)
- [devto-setup.md](./devto-setup.md)
- [youtube-description-template.md](./youtube-description-template.md)
- [twitter-content-calendar.md](./twitter-content-calendar.md)
