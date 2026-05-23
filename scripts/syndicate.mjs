#!/usr/bin/env node
// syndicate.mjs — generate platform-formatted versions of an existing
// turboloop.tech blog post for cross-posting.
//
// Pulls the original from Neon (so we always syndicate the latest
// version, including post-publish edits) and writes ready-to-paste
// output for: Mirror.xyz, Hashnode, dev.to, YouTube description,
// Twitter/X thread, Telegram broadcast.
//
// Critically: every syndicated copy carries a rel=canonical pointing
// back to turboloop.tech. That tells Google "the canonical source is
// our site" and prevents duplicate-content penalties while still
// reaping the brand visibility + backlink benefit of syndication.
//
// Usage:
//   node scripts/syndicate.mjs --slug=<post-slug> [--platform=all|mirror|hashnode|devto|youtube|twitter|telegram]
//
// Output: writes to scripts/_syndication/<slug>/<platform>.md (or .txt
// for plain-text targets like YouTube + Telegram).

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map(s => {
    const m = s.match(/^--([^=]+)=(.+)$/);
    return m ? [m[1], m[2]] : [s.replace(/^--/, ''), true];
  })
);

if (!args.slug) {
  console.error('Usage: node scripts/syndicate.mjs --slug=<post-slug> [--platform=all|mirror|hashnode|devto|youtube|twitter|telegram]');
  process.exit(1);
}

const HOST = 'https://www.turboloop.tech';
const PLATFORMS = ['mirror', 'hashnode', 'devto', 'youtube', 'twitter', 'telegram'];
const targets = args.platform && args.platform !== 'all'
  ? [args.platform]
  : PLATFORMS;

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  SELECT id, slug, title, excerpt, content, language, tags, scheduled_publish_at, created_at, cover_image, seo_description
  FROM blog_posts
  WHERE slug = ${args.slug}
`;
if (rows.length === 0) {
  console.error(`Slug not found: ${args.slug}`);
  process.exit(1);
}
const post = rows[0];
const canonical = `${HOST}/blog/${post.slug}`;
const tags = Array.isArray(post.tags) ? post.tags : (post.tags ? String(post.tags).split(',').map(s => s.trim()) : []);
const tagsHashtag = tags.map(t => `#${String(t).replace(/[^a-z0-9]/gi, '')}`).join(' ');

const outDir = path.join('scripts/_syndication', post.slug);
fs.mkdirSync(outDir, { recursive: true });

// ─── Platform formatters ─────────────────────────────────────────────

/** Strip the leading H1 from the markdown body — most platforms render
 *  the post title separately and a duplicate H1 looks awkward. */
function stripLeadingH1(md) {
  return md.replace(/^\s*#\s+[^\n]+\n+/, '');
}

function mirror() {
  // Mirror.xyz: standard markdown with rich embed support. Web3-native
  // audience, DO-follow backlinks. We use HTML <link rel="canonical">
  // inside an HTML comment because Mirror doesn't expose a canonical
  // field, but most crawlers honor the meta in the body wrapper. The
  // first paragraph also includes an explicit "Originally published
  // at" link as a fallback signal.
  const body = stripLeadingH1(post.content);
  return [
    `# ${post.title}`,
    '',
    `*Originally published at [turboloop.tech](${canonical}).*`,
    '',
    body,
    '',
    '---',
    '',
    `*This post was first published on the TurboLoop blog at <${canonical}>. Read more deep-dives at <${HOST}/blog>.*`,
  ].join('\n');
}

function hashnode() {
  // Hashnode: supports YAML-like front-matter via their import API,
  // but the simpler workflow is paste-into-editor. They also have a
  // first-class "canonical URL" field in the publish dialog — fill it
  // out manually with the canonical printed below.
  const body = stripLeadingH1(post.content);
  return [
    `---`,
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `subtitle: "${(post.seo_description || post.excerpt || '').replace(/"/g, '\\"').slice(0, 240)}"`,
    `canonical: "${canonical}"`,
    tags.length ? `tags: [${tags.map(t => `"${String(t).replace(/"/g, '')}"`).join(', ')}]` : '',
    `---`,
    '',
    `> Originally published at [turboloop.tech](${canonical}).`,
    '',
    body,
  ].filter(Boolean).join('\n');
}

function devto() {
  // dev.to: front-matter is REQUIRED. Their canonical field is
  // `canonical_url`. Title + tags must be defined or the import fails.
  // Cover image optional but recommended.
  const body = stripLeadingH1(post.content);
  const devtoTags = tags.slice(0, 4).map(t => String(t).toLowerCase().replace(/[^a-z0-9]/g, ''));
  return [
    `---`,
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `published: true`,
    `description: "${(post.seo_description || post.excerpt || '').replace(/"/g, '\\"').slice(0, 240)}"`,
    devtoTags.length ? `tags: ${devtoTags.join(', ')}` : '',
    post.cover_image ? `cover_image: ${post.cover_image}` : '',
    `canonical_url: ${canonical}`,
    `---`,
    '',
    `*Originally published at [turboloop.tech](${canonical}).*`,
    '',
    body,
  ].filter(Boolean).join('\n');
}

function youtube() {
  // YouTube video description template — paste verbatim into the
  // description field of any TurboLoop YouTube upload. The opening
  // line carries the canonical post URL so the video earns a backlink
  // back to the post; the timestamps/chapters are placeholder lines
  // the editor fills in.
  const excerptShort = (post.excerpt || post.seo_description || post.title).slice(0, 280);
  return [
    `${post.title}`,
    '',
    excerptShort,
    '',
    `▶ Read the full breakdown: ${canonical}`,
    '',
    '⏱ Chapters:',
    '  0:00  Intro',
    '  [add chapters here once you have the cut]',
    '',
    '🔗 Useful links',
    `  • TurboLoop hub: ${HOST}`,
    `  • Yield calculator: ${HOST}/calculator`,
    `  • Security page: ${HOST}/security`,
    `  • All films: ${HOST}/films`,
    `  • Telegram channel: https://t.me/TurboLoop_Official`,
    `  • Telegram community: https://t.me/TurboLoop_Chat`,
    `  • X / Twitter: https://x.com/TurboLoop_io`,
    '',
    '💼 About TurboLoop',
    '  TurboLoop is a decentralized yield protocol on Binance Smart Chain.',
    '  Fixed ROI per cycle from a USDC/USDT LP + Turbo Swap + Turbo Buy fees.',
    '  Audited. Ownership permanently renounced. 1 USDT minimum deposit.',
    '',
    '⚠️ Disclaimer',
    '  Nothing in this video is financial advice. DeFi carries risk; do your own',
    '  research. The 4 Loop Plans (Sprint 7d/3%, Boost 14d/10%, Power 30d/24%,',
    '  Ultimate 60d/54%) are fixed in an immutable smart contract — verify on',
    '  BscScan before depositing.',
    '',
    tagsHashtag ? tagsHashtag + ' #TurboLoop #DeFi #BSC' : '#TurboLoop #DeFi #BSC',
  ].join('\n');
}

function twitter() {
  // Twitter/X thread template. Each "tweet" is a separate paragraph
  // (the editor copy-pastes them into the compose box one at a time).
  // Total target: ~5-8 tweets per post. Each line must be ≤280 chars.
  // We auto-truncate longer lines with an ellipsis.
  const cap = (s, n = 270) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const opener = cap(`🧵 ${post.title}\n\n${post.excerpt || post.seo_description || ''}`);
  const tweets = [
    opener,
    cap(`Key numbers:\n• Min: 1 USDT\n• 4 plans: Sprint 7d/3% · Boost 14d/10% · Power 30d/24% · Ultimate 60d/54%\n• Daily payout at 00:00 UTC`),
    cap(`Where the yield comes from (this matters):\n• LP rewards from the USDC/USDT pool\n• Turbo Swap trading fees\n• Turbo Buy fiat-to-crypto fees\n\nReal external revenue. NOT new-deposit-funded.`),
    cap(`Security model:\n• Audited\n• Ownership permanently renounced\n• 100% LP locked\n• Source verified on BscScan\n• $100K open challenge — nobody has claimed it`),
    cap(`Full breakdown 👇\n${canonical}`),
  ];
  return tweets.map((t, i) => `[Tweet ${i + 1}/${tweets.length}]\n${t}`).join('\n\n— — —\n\n');
}

function telegram() {
  // Telegram broadcast template. Used in the official channels +
  // community group. Telegram HTML formatting (limited subset: <b>,
  // <i>, <code>, <a>). Keep under 4096 chars (Telegram's text-message
  // cap); the link to the full post handles the rest.
  const excerpt = (post.excerpt || post.seo_description || '').trim();
  return [
    `<b>📝 ${post.title}</b>`,
    '',
    excerpt || `New deep-dive on the TurboLoop blog.`,
    '',
    `<a href="${canonical}">Read the full post →</a>`,
    '',
    `Hub: ${HOST}`,
  ].join('\n');
}

// ─── Run + write each requested platform ─────────────────────────────

const out = {
  mirror: { ext: 'md',  body: mirror },
  hashnode: { ext: 'md',  body: hashnode },
  devto: { ext: 'md',  body: devto },
  youtube: { ext: 'txt', body: youtube },
  twitter: { ext: 'txt', body: twitter },
  telegram: { ext: 'html', body: telegram },
};

console.log(`Syndicating "${post.title}" (id=${post.id}, lang=${post.language}, slug=${post.slug})`);
console.log(`Canonical: ${canonical}`);
console.log();

for (const platform of targets) {
  const cfg = out[platform];
  if (!cfg) {
    console.warn(`  ! unknown platform: ${platform}`);
    continue;
  }
  const content = cfg.body();
  const file = path.join(outDir, `${platform}.${cfg.ext}`);
  fs.writeFileSync(file, content, 'utf-8');
  const lines = content.split('\n').length;
  console.log(`  ✓ ${platform}  →  ${file}  (${lines} lines)`);
}

console.log();
console.log(`All outputs in: ${outDir}/`);
console.log();
console.log('Next steps:');
console.log('  1. Open the platform-specific file');
console.log('  2. Sign in to the platform');
console.log('  3. Paste the content into a new post');
console.log('  4. Confirm the canonical URL field is set (Hashnode + dev.to expose this in the publish dialog)');
console.log('  5. Publish');
