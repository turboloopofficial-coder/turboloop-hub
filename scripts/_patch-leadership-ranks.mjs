// Align the 4 invented rank names in the leadership pillar post
// (id=28 EN + 266 DE + 267 HI + 268 ID) with the official 7-rank
// roster from lib/tokenFacts.ts VESTING_RANKS:
//   Partner → Influencer → Leader → Manager → Ambassador → Champion
//   → Legend
//
// The pillar writer invented "Turbo Builder / Architect / Captain /
// Master" during Batch 1 expansion because the leadership Program
// docs only describe percentages, not names. The audit fix asked for
// "Partner, not Builder" — but Partner is already rank 1, so we
// can't just rename Builder to Partner without creating a duplicate.
// Instead we map all four invented ranks to the four next official
// names in vesting order.
//
// Idempotent: skips a replacement if the source phrase is already
// absent (e.g., a partial re-run).

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Only patches the unambiguous "Turbo <Rank>" form. Plain "Builder"
// in prose ("community builders", "early builders") is left alone.
const RANK_MAP = [
  ['Turbo Builder',   'Turbo Influencer'],
  ['Turbo Architect', 'Turbo Leader'],
  ['Turbo Captain',   'Turbo Manager'],
  ['Turbo Master',    'Turbo Ambassador'],
];

const POSTS = [28, 266, 267, 268];

let totalChanges = 0;
for (const id of POSTS) {
  const r = await sql`SELECT slug, language, content FROM blog_posts WHERE id = ${id}`;
  if (r.length === 0) {
    console.error(`✗ id=${id} not found`);
    continue;
  }
  let content = r[0].content;
  const changes = [];
  for (const [from, to] of RANK_MAP) {
    if (!content.includes(from)) continue;
    const before = content.split(from).length - 1;
    content = content.split(from).join(to);
    changes.push(`${before}× "${from}" → "${to}"`);
    totalChanges += before;
  }
  if (changes.length === 0) {
    console.log(`  ⊝ id=${id} (${r[0].language}) ${r[0].slug} — already aligned`);
    continue;
  }
  await sql`
    UPDATE blog_posts
    SET content = ${content}, updated_at = NOW()
    WHERE id = ${id}
  `;
  console.log(`  ✓ id=${id} (${r[0].language}) ${r[0].slug}`);
  for (const c of changes) console.log(`     ${c}`);
}

console.log();
console.log(`Total rank-name substitutions: ${totalChanges}`);

// Quick post-patch sanity: confirm "Turbo Builder" is gone from all
// language variants and that "Turbo Influencer" now appears.
const after = await sql`
  SELECT id, slug, language,
    content LIKE '%Turbo Builder%' as still_has_builder,
    content LIKE '%Turbo Influencer%' as has_influencer
  FROM blog_posts
  WHERE id = ANY(${POSTS})
`;
console.log();
console.log('Post-patch sanity:');
for (const x of after) {
  console.log(`  id=${x.id} (${x.language}): Builder=${x.still_has_builder} | Influencer=${x.has_influencer}`);
}
