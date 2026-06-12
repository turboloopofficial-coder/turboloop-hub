# /upload-banners

Upload a new batch of banner images to the TurboLoop R2 CDN.

## When to use

Run this command whenever a new zip of banners is delivered — hub promo updates, zoom banner refreshes, monthly compound banners, campaign banners, or cinematic thumbnails.

## R2 Bucket

- **Public base URL:** `https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev`
- **Bucket name:** set in `.env` as `R2_BUCKET_NAME`
- **Credentials:** `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` in `.env`

## R2 Key Conventions

All banners follow strict key patterns. Never deviate from these paths.

| Category | Local filename pattern | R2 key pattern |
|---|---|---|
| Hub promo | `{Page}_V{n}.png` (PascalCase) | `hub-promo/hub-promo-{page}-v{n}.png` |
| EN Zoom banners | `zoom-en-{tier}-v{n}.png` | `zoom-banners/hub-promo-zoom-en-{tier}-v{n}.png` |
| HI Zoom banners | `zoom-hi-{tier}-v{n}.png` | `zoom-banners/hub-promo-zoom-hi-{tier}-v{n}.png` |
| Monthly compound | `monthly-{lang}-{tier}.png` | `monthly-banners/monthly-{lang}-{tier}.png` |
| Campaign banners | `A{n}.png` | `campaign-banners/A{n}.png` |
| Cinematic thumbs | `{slug}.png` or `{slug}.jpg` | `cinematic-thumbs/{slug}.jpg` (always .jpg in R2) |

**Zoom tier names:** `t60` (1 hour), `t30` (30 min), `t15` (10 min), `live`

## Steps

1. **Extract the zip** to a working directory:
   ```bash
   mkdir -p /home/ubuntu/banner-upload && unzip -o /path/to/banners.zip -d /home/ubuntu/banner-upload
   ```

2. **Inspect the folder structure** — identify which categories are present and confirm the naming convention matches the table above.

3. **Spot-check 2–3 images** using the `file` tool `view` action to verify:
   - Logo is present (top-left corner)
   - Content is correct for the category
   - No unexpected text or watermarks

4. **Write an upload script** at `scripts/upload-{batch-name}.mjs` using the pattern from `scripts/upload-final-75.mjs` as reference. Key points:
   - Use `@aws-sdk/client-s3` with `PutObjectCommand`
   - Load credentials via `dotenv` from `.env`
   - Set `ContentType: "image/png"` (or `"image/jpeg"` for .jpg)
   - Set `CacheControl: "public, max-age=31536000"`
   - Map filenames to R2 keys using the conventions above
   - For cinematic thumbs: always convert `.png` extension to `.jpg` in the R2 key

5. **Run the script:**
   ```bash
   cd /home/ubuntu/turboloop-hub-fresh2 && node scripts/upload-{batch-name}.mjs
   ```

6. **Spot-check 5–6 R2 URLs** with curl to confirm HTTP 200:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev/{key}"
   ```

7. **Commit the upload script:**
   ```bash
   git add scripts/upload-{batch-name}.mjs && git commit -m "chore: upload {batch-name} banners to R2" && git push origin main
   ```

## Important notes

- **Never overwrite** zoom banners with time-specific versions permanently. The evergreen zoom banners (no hardcoded times) are the permanent R2 versions. If a one-off time change is needed, use the `EN_ZOOM_EARLY_DATE` constant in `cron-master.ts` to shift the schedule — do not replace the R2 images.
- **Hub promo banners** are always 3 variants per page (V1/V2/V3). If only some variants are delivered, upload only those — do not delete the others.
- **Cinematic thumbnails** must always be uploaded as `.jpg` in R2 regardless of the source file extension. The pool in `_messagePools.ts` references `.jpg` keys.
- If a new hub page is added (beyond the current 20 pages), also run `/activate-new-hub-pages` to wire it into `_messagePools.ts`.

## Current hub promo pages (20 pages × 3 variants = 60 banners)

Calculator, Community, Compound, Dashboard, Deposit, Ecosystem, FAQ, Films, Homepage, Leaderboard, Learn, Plans, Profile, Referral, Roadmap, Security, Withdraw

(3 more pages — Staking, Token, Events — are planned but not yet in the pool)
