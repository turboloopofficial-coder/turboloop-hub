#!/usr/bin/env node
/**
 * Upload 43 new banners to R2
 * - monthly-banners/ (20 files: EN + DE)
 * - campaign-banners/ (8 files: A1-A8)
 * - cinematic-thumbs/ (15 files)
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env') });

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;
const SOURCE_BASE = '/home/ubuntu/new-banners-43/TurboLoop_Remaining';

const CATEGORIES = [
  { dir: 'monthly-banners', r2Prefix: 'monthly-banners' },
  { dir: 'campaign-banners', r2Prefix: 'campaign-banners' },
  { dir: 'cinematic-thumbs', r2Prefix: 'cinematic-thumbs' },
];

async function uploadFile(localPath, r2Key) {
  const body = readFileSync(localPath);
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    Body: body,
    ContentType: 'image/png',
    CacheControl: 'public, max-age=31536000',
  });
  await client.send(cmd);
  return `${PUBLIC_URL}/${r2Key}`;
}

async function main() {
  let total = 0;
  let success = 0;
  const results = [];

  for (const cat of CATEGORIES) {
    const dir = join(SOURCE_BASE, cat.dir);
    let files;
    try {
      files = readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    } catch (e) {
      console.error(`Cannot read dir ${dir}: ${e.message}`);
      continue;
    }

    console.log(`\n=== ${cat.dir} (${files.length} files) ===`);
    for (const file of files) {
      const localPath = join(dir, file);
      const r2Key = `${cat.r2Prefix}/${file}`;
      total++;
      try {
        const url = await uploadFile(localPath, r2Key);
        console.log(`  ✅ ${r2Key}`);
        results.push({ key: r2Key, url, status: 'ok' });
        success++;
      } catch (e) {
        console.error(`  ❌ ${r2Key}: ${e.message}`);
        results.push({ key: r2Key, status: 'error', error: e.message });
      }
    }
  }

  console.log(`\n=== DONE: ${success}/${total} uploaded successfully ===`);
  if (success < total) {
    console.log('FAILED:');
    results.filter(r => r.status !== 'ok').forEach(r => console.log(`  ${r.key}: ${r.error}`));
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
