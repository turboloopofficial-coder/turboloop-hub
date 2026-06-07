// Apply the 24 token-blog translations to Neon. Each file at
// scripts/_token-translations/<slug>-{de|hi|id}.md follows the
// TITLE: / EXCERPT: / body format.
//
// Strategy: INSERT new rows linked to the parent EN post via
// translation_of. Skips slugs that already exist (idempotent).

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';

const sql = neon(process.env.DATABASE_URL);

const DIR = 'C:/Users/DEV NARSI/Projects/turboloop-hub/scripts/_token-translations';
const EN_SLUGS = [
  'what-is-turboloop-token-turbo-complete-guide',
  'how-to-earn-turbo-tokens-through-deposits',
  'turboloop-tokenomics-daily-buyback-burn-vesting',
  'turbo-fair-launch-no-team-tokens-no-premine',
  'turbo-vesting-schedule-leadership-rank-unlock-speed',
  'how-the-daily-buyback-and-burn-works',
  'turbo-trade-tax-explained',
  'how-to-buy-and-sell-turbo-step-by-step',
];
const LANGS = ['de', 'hi', 'id'];

const wc = s => (s || '').trim().split(/\s+/).filter(Boolean).length;

function parseFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^﻿/, '');
  const lines = raw.split(/\r?\n/);
  let title = null;
  let excerpt = null;
  let bodyStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (title === null && /^TITLE:\s*/.test(l)) {
      title = l.replace(/^TITLE:\s*/, '').trim();
      continue;
    }
    if (excerpt === null && /^EXCERPT:\s*/.test(l)) {
      excerpt = l.replace(/^EXCERPT:\s*/, '').trim();
      continue;
    }
    if (title !== null && excerpt !== null && l.trim() !== '') {
      bodyStart = i;
      break;
    }
  }
  if (title === null || excerpt === null || bodyStart === -1) return null;
  const body = lines.slice(bodyStart).join('\n').trim();
  return { title, excerpt, body };
}

// Cache parent EN ids + metadata by slug so we INSERT translation_of
// pointing at the right parent.
const parentBySlug = new Map();
for (const slug of EN_SLUGS) {
  const rows = await sql`
    SELECT id, cover_image, tags, author_name
    FROM blog_posts
    WHERE slug = ${slug} AND language = 'en'
  `;
  if (rows.length === 0) {
    console.error(`✗ EN parent ${slug} not found — skipping its translations`);
    continue;
  }
  parentBySlug.set(slug, rows[0]);
}

let nInsert = 0, nSkip = 0, nMissing = 0;
const report = [];

for (const enSlug of EN_SLUGS) {
  const parent = parentBySlug.get(enSlug);
  if (!parent) continue;

  for (const lang of LANGS) {
    const targetSlug = `${enSlug}-${lang}`;
    const file = path.join(DIR, `${targetSlug}.md`);
    const parsed = parseFile(file);
    if (!parsed) {
      console.error(`  ⚠ ${targetSlug}: file missing — skip`);
      nMissing++;
      continue;
    }
    const exists = await sql`SELECT id FROM blog_posts WHERE slug = ${targetSlug}`;
    if (exists.length > 0) {
      console.error(`  ⚠ ${targetSlug}: row exists (id=${exists[0].id}) — skip`);
      nSkip++;
      continue;
    }
    const newWc = wc(parsed.body);
    const result = await sql`
      INSERT INTO blog_posts (
        title, slug, excerpt, content,
        cover_image, published,
        created_at, updated_at, scheduled_publish_at,
        language, translation_of, tags,
        author_name
      ) VALUES (
        ${parsed.title}, ${targetSlug}, ${parsed.excerpt}, ${parsed.body},
        ${parent.cover_image}, true,
        NOW(), NOW(), NOW(),
        ${lang}, ${parent.id}, ${parent.tags},
        ${parent.author_name}
      )
      RETURNING id
    `;
    nInsert++;
    report.push({ slug: targetSlug, id: result[0].id, wc: newWc });
  }
}

console.log();
console.log('=== TOKEN TRANSLATIONS APPLY SUMMARY ===');
console.log(`INSERT: ${nInsert} | SKIP: ${nSkip} | MISSING: ${nMissing}`);
console.log();
for (const r of report) {
  console.log(`  ✓ id=${r.id} slug=${r.slug} (${r.wc} words)`);
}

// Forbidden-phrase check
console.log();
const checkRows = await sql`
  SELECT id, slug, content
  FROM blog_posts
  WHERE slug = ANY(${EN_SLUGS.flatMap(s => LANGS.map(l => `${s}-${l}`))})
`;
const forbidden = [
  /PancakeSwap V3 trading/i,
  /not financial advice/i,
  /past performance/i,
];
let issues = 0;
for (const r of checkRows) {
  for (const re of forbidden) {
    if (re.test(r.content || '')) {
      console.warn(`  ⚠ id=${r.id} ${r.slug} matches: ${re}`);
      issues++;
    }
  }
}
if (issues === 0) console.log('Clean — no forbidden phrases.');
