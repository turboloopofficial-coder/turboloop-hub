# /replace-rejected-banners

Replace the 3 rejected hub promo banners in R2 and optionally update their pool captions.
This command is for use **after** the replacement banner images have been provided.

---

## Background

Three banners were rejected in the June 2026 validity audit for containing inaccurate claims:

| Banner | R2 Key | Rejection Reason |
|--------|--------|-----------------|
| `hub-promo-leaderboard-v1.png` | `hub-promo/hub-promo-leaderboard-v1.png` | Uses wrong rank names ("Community Manager to Director") |
| `hub-promo-leaderboard-v2.png` | `hub-promo/hub-promo-leaderboard-v2.png` | Uses fake tiers (Legend, Titan, Champion, Elite, Pro, Advanced, Starter) |
| `hub-promo-profile-v3.png` | `hub-promo/hub-promo-profile-v3.png` | States "Unique Username · 100 USDT · Yours Forever" — unconfirmed feature |

The **correct 7 leadership ranks** are:
`Turbo Partner → Builder → Accelerator → Director → Executive → Ambassador → Turbo Legend`

**Safe messaging for leaderboard banners:**
- "Track your team performance"
- "View country rankings"
- "See your leadership progress"
- "Climb the ranks: Turbo Partner → Builder → Accelerator → Director → Executive → Ambassador → Turbo Legend"

**Safe messaging for profile banner (no username purchase claim):**
- "Your DeFi Dashboard"
- "Track referrals & earnings"
- "Monitor your network growth"

---

## Step 1 — Upload replacement images to R2

The replacement images must be provided as local files. Upload them using the existing script pattern:

```javascript
// scripts/upload-replacement-banners.mjs
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
config({ path: '.env' });

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Map: local file path → R2 key
const REPLACEMENTS = [
  { local: '/path/to/new-leaderboard-v1.png', key: 'hub-promo/hub-promo-leaderboard-v1.png' },
  { local: '/path/to/new-leaderboard-v2.png', key: 'hub-promo/hub-promo-leaderboard-v2.png' },
  { local: '/path/to/new-profile-v3.png',     key: 'hub-promo/hub-promo-profile-v3.png' },
];

for (const { local, key } of REPLACEMENTS) {
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: readFileSync(local),
    ContentType: 'image/png',
    CacheControl: 'public, max-age=31536000',
  }));
  console.log(`✅ Uploaded ${key}`);
}
```

R2 overwrites the existing file at the same key — no pool code changes needed.
The CDN cache will serve the new image within minutes (R2 public bucket, no custom domain cache to purge).

---

## Step 2 — Verify the replacement images

After upload, confirm the new images are live:

```bash
curl -s -o /tmp/lb1.png "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-leaderboard-v1.png"
curl -s -o /tmp/lb2.png "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-leaderboard-v2.png"
curl -s -o /tmp/pv3.png "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-profile-v3.png"
# Open each file and visually confirm the new design
```

---

## Step 3 — Review Profile V1 and V2 (marked "needs review")

The audit flagged these two banners as potentially containing "Unique Username" text:
- `hub-promo-profile-v1.png` (Profile_V1_IdentityGlow)
- `hub-promo-profile-v2.png` (Profile_V2_CosmicAvatar)

Download and visually inspect them:
```bash
curl -s -o /tmp/pv1.png "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-profile-v1.png"
curl -s -o /tmp/pv2.png "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/hub-promo/hub-promo-profile-v2.png"
```

If either contains "Unique Username" or "100 USDT" text → replace using the same upload pattern above.
If they are clean → no action needed.

---

## Step 4 — Commit the upload script

```bash
git add scripts/upload-replacement-banners.mjs
git commit -m "fix: replace rejected banners (leaderboard-v1/v2, profile-v3) with corrected designs"
git push
```

No `dist/` rebuild needed — this is a pure R2 asset replacement.

---

## Acceptance Criteria

- [ ] `hub-promo-leaderboard-v1.png` shows correct rank names (Turbo Partner → ... → Turbo Legend) or generic leaderboard imagery
- [ ] `hub-promo-leaderboard-v2.png` shows correct rank names or generic leaderboard imagery
- [ ] `hub-promo-profile-v3.png` contains no "Unique Username" or "100 USDT" claim
- [ ] Profile V1 and V2 visually inspected and confirmed clean (or replaced)
- [ ] All 4 URLs return HTTP 200 with the new images
