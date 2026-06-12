#!/usr/bin/env node
/**
 * Upload cinematic thumbnails as .jpg to R2
 * The _messagePools.ts cinematicPosterUrl() function uses .jpg extension,
 * so we upload JPG versions of all 15 cinematic thumbs.
 * Also uploads blockchain-never-lies-film.jpg (alias for blockchain-never-lies).
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
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
const SOURCE_DIR = '/home/ubuntu/new-banners-43/cinematic-thumbs-jpg';

async function uploadFile(localPath, r2Key) {
  const body = readFileSync(localPath);
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    Body: body,
    ContentType: 'image/jpeg',
    CacheControl: 'public, max-age=31536000',
  });
  await client.send(cmd);
  return `${PUBLIC_URL}/${r2Key}`;
}

async function main() {
  const files = readdirSync(SOURCE_DIR).filter(f => f.endsWith('.jpg'));
  console.log(`Uploading ${files.length} cinematic thumbnails as .jpg to R2...\n`);

  let success = 0;
  for (const file of files) {
    const localPath = join(SOURCE_DIR, file);
    const r2Key = `cinematic-thumbs/${file}`;
    try {
      const url = await uploadFile(localPath, r2Key);
      console.log(`  ✅ ${r2Key}`);
      success++;
    } catch (e) {
      console.error(`  ❌ ${r2Key}: ${e.message}`);
    }
  }

  console.log(`\n=== DONE: ${success}/${files.length} uploaded ===`);
  if (success < files.length) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
