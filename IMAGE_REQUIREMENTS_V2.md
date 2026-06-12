# TurboLoop — Remaining Image Requirements

All images should follow the **TurboLoop Brand Kit** and **Marketing Brandline** guidelines.
Logo: top-left, official swirl + "Turbo" (white) + "Loop" (cyan).
No APY. Use: "0.9% Daily Returns", "54% Total ROI", "Full Capital Back", "From 1 USDT".

---

## 1. Monthly Compound Banners (MISSING — HIGH PRIORITY)

These fire every night at midnight UTC via the `midnight:math` cron slot.
**20 banners total** — 10 deposit amounts × 2 languages (EN + DE).

### Dimensions
- **1200 × 630 px** (landscape, 16:9 approx) — optimised for Telegram photo posts

### R2 Upload Path
`monthly-banners/monthly-{lang}-{key}.png`

### Required Files

| Filename | Language | Monthly Deposit | Headline |
|---|---|---|---|
| `monthly-en-50.png` | English | $50/mo | "What $50/Month Looks Like After 60 Days" |
| `monthly-en-100.png` | English | $100/mo | "What $100/Month Looks Like After 60 Days" |
| `monthly-en-500.png` | English | $500/mo | "What $500/Month Looks Like After 60 Days" |
| `monthly-en-1000.png` | English | $1,000/mo | "What $1,000/Month Looks Like After 60 Days" |
| `monthly-en-1500.png` | English | $1,500/mo | "What $1,500/Month Looks Like After 60 Days" |
| `monthly-en-2000.png` | English | $2,000/mo | "What $2,000/Month Looks Like After 60 Days" |
| `monthly-en-5000.png` | English | $5,000/mo | "What $5,000/Month Looks Like After 60 Days" |
| `monthly-en-10000.png` | English | $10,000/mo | "What $10,000/Month Looks Like After 60 Days" |
| `monthly-en-50000.png` | English | $50,000/mo | "What $50,000/Month Looks Like After 60 Days" |
| `monthly-en-grand-master.png` | English | Grand Master | "The Grand Master Tier — Elite Compounding" |
| `monthly-de-50.png` | German | 50€/mo | "Was 50€/Monat nach 60 Tagen bedeutet" |
| `monthly-de-100.png` | German | 100€/mo | "Was 100€/Monat nach 60 Tagen bedeutet" |
| `monthly-de-500.png` | German | 500€/mo | "Was 500€/Monat nach 60 Tagen bedeutet" |
| `monthly-de-1000.png` | German | 1.000€/mo | "Was 1.000€/Monat nach 60 Tagen bedeutet" |
| `monthly-de-1500.png` | German | 1.500€/mo | "Was 1.500€/Monat nach 60 Tagen bedeutet" |
| `monthly-de-2000.png` | German | 2.000€/mo | "Was 2.000€/Monat nach 60 Tagen bedeutet" |
| `monthly-de-5000.png` | German | 5.000€/mo | "Was 5.000€/Monat nach 60 Tagen bedeutet" |
| `monthly-de-10000.png` | German | 10.000€/mo | "Was 10.000€/Monat nach 60 Tagen bedeutet" |
| `monthly-de-50000.png` | German | 50.000€/mo | "Was 50.000€/Monat nach 60 Tagen bedeutet" |
| `monthly-de-grand-master.png` | German | Grand Master | "Die Grand Master Stufe — Elite Compounding" |

### Design Notes
- Each banner should show the **deposit amount prominently** (large number, centre or left)
- Show the **60-day yield result**: deposit × 0.54 = total ROI (e.g. $1,000 → $540 yield → $1,540 total)
- Include a **simple growth bar or chart** showing the compounding curve
- Use a **unique visual per amount** — smaller amounts feel accessible/warm, larger amounts feel premium/elite
- Grand Master should feel aspirational — gold, elite, trophy-level design
- German banners: same layout, German text, € symbol instead of $

---

## 2. Campaign Banners (CHECK STATUS)

These are used by the `_campaigns.ts` system for special promotional pushes.
Path: `campaign-banners/{id}.png`

**Action required:** Check which campaign IDs are active and whether their banners exist in R2.
Run: `node -e "const c = require('./server/_vercel/_campaigns.ts'); console.log(c)"` or check `_campaigns.ts` directly.

---

## 3. Cinematic Film Thumbnails (CHECK STATUS)

Used by the Films page and Telegram film promos.
Path: `cinematic-thumbs/{slug}.jpg`

**Slugs needed** (from `_messagePools.ts`):
- `global-community-call`
- `real-yield-explained`
- `no-impermanent-loss`
- `compound-effect`
- `build-digital-empire`
- `stablecoins-stay-safe`
- `code-is-law`
- `myth-buster-ponzi`
- `blockchain-never-lies-film`
- `unbreakable-vault`
- `defi-vs-banks`
- `global-revolution-lagos-london`
- `compounding-secret`
- `build-your-legacy`
- `leadership-path`

**Dimensions:** 1280 × 720 px (16:9, YouTube-style thumbnail)
**Design:** Cinematic, dark, each film has its own visual identity matching its topic

---

## 4. Hub Promo Banners — New Pages (NEW — MEDIUM PRIORITY)

The new banner ZIP included pages that don't yet have entries in the message pool.
These banners are uploaded to R2 but not yet used in any Telegram posts.

To activate them, new entries need to be added to `HUB_PROMOTION_POOL` in `_messagePools.ts`.

| Page | Banners Available | R2 Keys |
|---|---|---|
| Compound | V1, V2, V3 | `hub-promo-compound-v1.png` etc. |
| Dashboard | V1, V2, V3 | `hub-promo-dashboard-v1.png` etc. |
| Deposit | V1, V2, V3 | `hub-promo-deposit-v1.png` etc. |
| Homepage | V1, V2, V3 | `hub-promo-homepage-v1.png` etc. |
| Plans | V1, V2, V3 | `hub-promo-plans-v1.png` etc. |
| Profile | V1, V2, V3 | `hub-promo-profile-v1.png` etc. |
| Referral | V1, V2, V3 | `hub-promo-referral-v1.png` etc. |
| Withdraw | V1, V2, V3 | `hub-promo-withdraw-v1.png` etc. |

---

## 5. Summary Table

| Category | Count | Status | Priority |
|---|---|---|---|
| Zoom banners (EN + HI, 4 tiers, 3 variants) | 24 | ✅ Uploaded & live | Done |
| Hub promo banners (existing pages, 3 variants) | 48 | ✅ Uploaded & live | Done |
| Hub promo banners (new pages, 3 variants each) | 24 | ✅ Uploaded, needs pool entries | Medium |
| Monthly compound banners (EN + DE, 10 amounts) | 20 | ❌ Missing — needs creation | **HIGH** |
| Cinematic film thumbnails | 15 | ❓ Check R2 status | Medium |
| Campaign banners | varies | ❓ Check R2 status | Medium |
