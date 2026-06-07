// Patch the 32 token blog posts in Neon to make the Power/Ultimate-
// only eligibility rule explicit. Two patch types:
//
//   A. INSERT — for the 4 "how-to-earn" posts (276 EN + 286 DE +
//      287 HI + 288 ID), insert a clear eligibility paragraph
//      directly after the H1 + opening intro so it surfaces in
//      blog listings/snippets too.
//
//   B. REPLACE — targeted phrase swaps in the other affected posts
//      (275, 279 EN + 296 HI) to upgrade "every qualifying deposit" /
//      "every time you deposit" into the explicit Power/Ultimate
//      version.
//
// Idempotent: every patch checks whether the change has already been
// applied (by searching for the inserted/replaced sentinel) and skips
// when so. Safe to re-run.

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// ── A. Eligibility paragraphs (one per language) ────────────────────

const ELIGIBILITY_PARA = {
  en:
    "**Token rewards are only available on Power (30-day) and Ultimate (60-day) plans.** Sprint (7-day) and Boost (14-day) deposits still earn their standard fixed USDT ROI, but they do not qualify for $TURBO. This page assumes you're depositing into a Power or Ultimate Loop Plan.",
  de:
    "**Token-Rewards sind nur auf Power- (30 Tage) und Ultimate- (60 Tage) Plänen verfügbar.** Sprint- (7 Tage) und Boost- (14 Tage) Deposits verdienen weiterhin ihren Standard-USDT-ROI, qualifizieren sich aber nicht für $TURBO. Diese Seite geht davon aus, dass du in einen Power- oder Ultimate-Plan deponierst.",
  hi:
    "**Token rewards केवल Power (30-day) और Ultimate (60-day) plans पर ही available हैं।** Sprint (7-day) और Boost (14-day) deposits अभी भी अपना standard USDT ROI कमाते हैं, लेकिन वे $TURBO के लिए qualify नहीं करते। यह page मानता है कि आप Power या Ultimate Loop Plan में deposit कर रहे हैं।",
  id:
    "**Reward token hanya tersedia di plan Power (30 hari) dan Ultimate (60 hari).** Deposit Sprint (7 hari) dan Boost (14 hari) tetap mendapatkan ROI USDT standar mereka, tapi tidak memenuhi syarat untuk $TURBO. Halaman ini mengasumsikan kamu deposit ke Power atau Ultimate Loop Plan.",
};

// Sentinel — the first ~30 chars of each eligibility para. If this
// substring is already in the content, we skip (already patched).
const ELIGIBILITY_SENTINEL = {
  en: "Token rewards are only available on Power",
  de: "Token-Rewards sind nur auf Power",
  hi: "Token rewards केवल Power (30-day)",
  id: "Reward token hanya tersedia di plan Power",
};

const HOW_TO_EARN_IDS = [
  { id: 276, lang: 'en' },
  { id: 286, lang: 'de' },
  { id: 287, lang: 'hi' },
  { id: 288, lang: 'id' },
];

// ── B. Targeted phrase replacements ────────────────────────────────

// Each entry: { id, lang, replacements: [{ from, to, label }] }
// `from` matches verbatim or as a regex; `to` is the replacement;
// `label` is the human-readable change for the apply report.
const PHRASE_PATCHES = [
  {
    id: 275,
    lang: 'en',
    replacements: [
      {
        from: "an additive rewards mechanism that pays you in TurboLoop's native asset every time you deposit",
        to: "an additive rewards mechanism that pays you in TurboLoop's native asset every time you deposit into a Power or Ultimate Loop Plan",
        label: '"every time you deposit" → "every time you deposit into a Power or Ultimate Loop Plan"',
      },
    ],
  },
  {
    id: 279,
    lang: 'en',
    replacements: [
      {
        from: 'When you make a qualifying deposit on TurboLoop',
        to: 'When you make a qualifying deposit on TurboLoop (Power or Ultimate Loop Plan)',
        label: 'add "(Power or Ultimate Loop Plan)" qualifier to opening sentence',
      },
    ],
  },
  {
    id: 296,
    lang: 'hi',
    replacements: [
      {
        from: 'जब आप TurboLoop पर एक क्वालिफ़ाइंग डिपॉज़िट करते हैं',
        to: 'जब आप TurboLoop पर एक क्वालिफ़ाइंग डिपॉज़िट (Power या Ultimate Loop Plan) करते हैं',
        label: 'add Power/Ultimate qualifier to Hindi vesting-post opening',
      },
    ],
  },
];

// ── Apply ──────────────────────────────────────────────────────────

const report = { inserts: 0, replacements: 0, skipped: 0, errors: 0 };

// PATCH A: insert eligibility paragraphs into the 4 how-to-earn posts.
for (const { id, lang } of HOW_TO_EARN_IDS) {
  const rows = await sql`SELECT content FROM blog_posts WHERE id = ${id}`;
  if (rows.length === 0) {
    console.error(`  ✗ id=${id} not found`);
    report.errors++;
    continue;
  }
  const content = rows[0].content;
  if (content.includes(ELIGIBILITY_SENTINEL[lang])) {
    console.log(`  ⊝ id=${id} (${lang}) already has eligibility para — skip`);
    report.skipped++;
    continue;
  }
  // Insert AFTER the first H1 + the next paragraph (skipping the
  // opening hook). Splits on \n\n; replaces the boundary between para 2
  // and 3 with: para2\n\n<NEW>\n\npara3.
  const paras = content.split(/\n\n/);
  if (paras.length < 3) {
    console.error(`  ✗ id=${id}: too few paragraphs to insert (have ${paras.length})`);
    report.errors++;
    continue;
  }
  // paras[0] = "# Title", paras[1] = opening hook, paras[2] = next.
  // Insert eligibility BETWEEN [1] and [2].
  paras.splice(2, 0, ELIGIBILITY_PARA[lang]);
  const newContent = paras.join('\n\n');
  await sql`
    UPDATE blog_posts
    SET content = ${newContent}, updated_at = NOW()
    WHERE id = ${id}
  `;
  console.log(`  ✓ id=${id} (${lang}) inserted eligibility paragraph`);
  report.inserts++;
}

// PATCH B: targeted phrase replacements.
for (const { id, lang, replacements } of PHRASE_PATCHES) {
  const rows = await sql`SELECT content FROM blog_posts WHERE id = ${id}`;
  if (rows.length === 0) {
    console.error(`  ✗ id=${id} not found`);
    report.errors++;
    continue;
  }
  let content = rows[0].content;
  let changedAny = false;
  for (const { from, to, label } of replacements) {
    if (content.includes(to) && !content.includes(from)) {
      // Already patched; nothing to do for this replacement.
      console.log(`  ⊝ id=${id} (${lang}) "${label}" already applied — skip`);
      report.skipped++;
      continue;
    }
    if (!content.includes(from)) {
      console.error(`  ⚠ id=${id} (${lang}): source phrase not found for "${label}"`);
      report.errors++;
      continue;
    }
    content = content.split(from).join(to);
    console.log(`  ✓ id=${id} (${lang}) applied: ${label}`);
    changedAny = true;
    report.replacements++;
  }
  if (changedAny) {
    await sql`
      UPDATE blog_posts
      SET content = ${content}, updated_at = NOW()
      WHERE id = ${id}
    `;
  }
}

console.log();
console.log('=== PATCH SUMMARY ===');
console.log(JSON.stringify(report, null, 2));
