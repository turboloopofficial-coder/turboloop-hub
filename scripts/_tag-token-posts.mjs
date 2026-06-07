// Add the "Token Rewards" tag to all 32 token blog posts (ids 275-306).
// Idempotent: skips rows that already have the tag.
//
// `tags` on blog_posts is a PostgreSQL text[] column. We append the
// new tag with array_append, but only when it isn't already present.

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const TOKEN_POSTS = [
  275, 276, 277, 278, 279, 280, 281, 282,
  283, 284, 285, 286, 287, 288, 289, 290,
  291, 292, 293, 294, 295, 296, 297, 298,
  299, 300, 301, 302, 303, 304, 305, 306,
];
const NEW_TAG = 'Token Rewards';

let updated = 0;
let alreadyTagged = 0;
const beforeAfter = [];

for (const id of TOKEN_POSTS) {
  const r = await sql`SELECT id, slug, tags FROM blog_posts WHERE id = ${id}`;
  if (r.length === 0) {
    console.error(`  ✗ id=${id} not found`);
    continue;
  }
  const currentTags = Array.isArray(r[0].tags) ? r[0].tags : [];
  if (currentTags.includes(NEW_TAG)) {
    alreadyTagged++;
    continue;
  }
  const newTags = [...currentTags, NEW_TAG];
  await sql`
    UPDATE blog_posts
    SET tags = ${newTags}, updated_at = NOW()
    WHERE id = ${id}
  `;
  beforeAfter.push({ id, slug: r[0].slug, before: currentTags, after: newTags });
  updated++;
}

console.log('=== TAG SUMMARY ===');
console.log(`Updated: ${updated} | Already tagged: ${alreadyTagged} | Total target: ${TOKEN_POSTS.length}`);
console.log();
for (const b of beforeAfter.slice(0, 5)) {
  console.log(`  ✓ id=${b.id} ${b.slug}`);
  console.log(`     before: [${b.before.join(', ')}]`);
  console.log(`     after:  [${b.after.join(', ')}]`);
}
if (beforeAfter.length > 5) {
  console.log(`  … and ${beforeAfter.length - 5} more rows updated identically`);
}

// Sanity verify
const verify = await sql`
  SELECT COUNT(*)::int AS n FROM blog_posts
  WHERE id = ANY(${TOKEN_POSTS}) AND 'Token Rewards' = ANY(tags)
`;
console.log();
console.log(`Posts now carrying "Token Rewards" tag: ${verify[0].n} / ${TOKEN_POSTS.length}`);
