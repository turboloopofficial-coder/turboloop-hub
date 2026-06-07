// Apply the 8 EN token blog posts to Neon. Each file at
// scripts/_token-blog/<slug>.md follows the standard
// TITLE: / EXCERPT: / body format used by the previous apply
// scripts. INSERTs new rows; skips if a row with that slug already
// exists (idempotent — safe to re-run).

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';

const sql = neon(process.env.DATABASE_URL);

const DIR = 'C:/Users/DEV NARSI/Projects/turboloop-hub/scripts/_token-blog';
const POSTS = [
  'what-is-turboloop-token-turbo-complete-guide',
  'how-to-earn-turbo-tokens-through-deposits',
  'turboloop-tokenomics-daily-buyback-burn-vesting',
  'turbo-fair-launch-no-team-tokens-no-premine',
  'turbo-vesting-schedule-leadership-rank-unlock-speed',
  'how-the-daily-buyback-and-burn-works',
  'turbo-trade-tax-explained',
  'how-to-buy-and-sell-turbo-step-by-step',
];

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

let nInsert = 0, nSkip = 0, nMissing = 0;
const report = [];

for (const slug of POSTS) {
  const file = path.join(DIR, `${slug}.md`);
  const parsed = parseFile(file);
  if (!parsed) {
    console.error(`  ⚠ ${slug}: file missing or unparseable — skip`);
    nMissing++;
    continue;
  }
  const existing = await sql`SELECT id FROM blog_posts WHERE slug = ${slug}`;
  if (existing.length > 0) {
    console.error(`  ⚠ ${slug}: row already exists (id=${existing[0].id}) — skip insert`);
    nSkip++;
    continue;
  }
  const newWc = wc(parsed.body);
  if (newWc < 1000) {
    console.warn(`  ! ${slug}: only ${newWc} words — applying anyway`);
  }
  const tags = ['token', 'turbo', 'tokenomics', 'defi'];
  const result = await sql`
    INSERT INTO blog_posts (
      title, slug, excerpt, content,
      cover_image, published,
      created_at, updated_at, scheduled_publish_at,
      language, tags,
      author_name
    ) VALUES (
      ${parsed.title}, ${slug}, ${parsed.excerpt}, ${parsed.body},
      NULL, true,
      NOW(), NOW(), NOW(),
      ${'en'}, ${tags},
      ${'TurboLoop'}
    )
    RETURNING id
  `;
  nInsert++;
  report.push({ slug, id: result[0].id, wc: newWc });
}

console.log();
console.log('=== TOKEN BLOG APPLY SUMMARY ===');
console.log(`INSERT: ${nInsert} | SKIP: ${nSkip} | MISSING: ${nMissing}`);
console.log();
for (const r of report) {
  console.log(`  ✓ id=${r.id} slug=${r.slug} (${r.wc} words)`);
}

// Forbidden-phrase check
console.log();
const checkRows = await sql`SELECT id, slug, content FROM blog_posts WHERE slug = ANY(${POSTS})`;
const forbidden = [
  /PancakeSwap V3 trading fees/i,
  /tax\s+(?:is|goes)\s+(?:burn|to burn)/i, // "tax burns" — wrong
  /55% APY guaranteed/i,
  /not financial advice/i, // explicitly forbidden
  /past performance/i,    // explicitly forbidden
];
let issues = 0;
for (const r of checkRows) {
  for (const re of forbidden) {
    if (re.test(r.content || '')) {
      console.warn(`  ⚠ id=${r.id} ${r.slug} matches forbidden: ${re}`);
      issues++;
    }
  }
}
if (issues === 0) console.log('Clean — no forbidden phrases.');
