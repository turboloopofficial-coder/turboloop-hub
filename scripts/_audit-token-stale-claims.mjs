// Audit token blog posts for stale "any Loop Plan" / "every deposit"
// claims that need updating now that token rewards are confirmed
// Power/Ultimate-only. Read-only — emits a report; the patch script
// runs separately.
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// All 32 token-blog post IDs from the earlier apply scripts.
const TOKEN_POSTS = [
  275, 276, 277, 278, 279, 280, 281, 282,
  283, 284, 285, 286, 287, 288, 289, 290,
  291, 292, 293, 294, 295, 296, 297, 298,
  299, 300, 301, 302, 303, 304, 305, 306,
];

const rows = await sql`
  SELECT id, slug, language, content
  FROM blog_posts
  WHERE id = ANY(${TOKEN_POSTS})
  ORDER BY id
`;

console.log(`Inspecting ${rows.length} token posts for plan-eligibility claims:\n`);

// Per-language patterns that imply "any plan" / "every deposit".
// Hits = candidate sentences to rewrite.
const PATTERNS = [
  { re: /any\s+Loop\s+Plan/gi,                  lang: 'en' },
  { re: /every\s+(?:USDT\s+)?deposit/gi,         lang: 'en' },
  { re: /each\s+deposit/gi,                      lang: 'en' },
  { re: /alle[nm]?\s+Loop\s+Plan/gi,             lang: 'de' },
  { re: /jede[smn]?\s+Loop\s+Plan/gi,            lang: 'de' },
  { re: /jede[smn]?\s+(?:USDT[- ])?Deposit/gi,   lang: 'de' },
  { re: /किसी\s+भी\s+Loop\s+Plan/g,             lang: 'hi' },
  { re: /हर\s+(?:USDT\s+)?डिपॉज़िट/g,           lang: 'hi' },
  { re: /Loop\s+Plan\s+mana\s+pun/gi,            lang: 'id' },
  { re: /setiap\s+deposit\s+USDT/gi,             lang: 'id' },
];

let totalHits = 0;
const affected = new Set();
for (const r of rows) {
  const hits = [];
  for (const { re, lang } of PATTERNS) {
    if (lang !== r.language) continue;
    const matches = r.content.match(re);
    if (matches && matches.length > 0) {
      hits.push(`${matches.length}× /${re.source}/`);
      totalHits += matches.length;
    }
  }
  if (hits.length > 0) {
    affected.add(r.id);
    console.log(`  id=${r.id} (${r.language.padEnd(2)}) ${r.slug}`);
    for (const h of hits) console.log(`     ${h}`);
  }
}

console.log();
console.log(`Summary: ${affected.size} posts affected, ${totalHits} total pattern hits.`);
