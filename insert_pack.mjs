import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const sql = neon("postgresql://neondb_owner:npg_GrxgXB26vaRS@ep-small-band-aov5e3d6.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");

// Read pack data from command line args
const jsonFile = process.argv[2];
const slugBase = process.argv[3];
const tagsStr = process.argv[4]; // comma-separated
const scheduledAt = process.argv[5];

const pack = JSON.parse(readFileSync(jsonFile, "utf-8"));
const tags = tagsStr.split(",");

function readingTimeMin(content) {
  return Math.max(1, Math.round(content.split(/\s+/).length / 230));
}

async function main() {
  const enRt = readingTimeMin(pack.en.content);
  const result = await sql`
    INSERT INTO blog_posts (title, slug, excerpt, content, language, published,
       scheduled_publish_at, tags, reading_time_min)
    VALUES (${pack.en.title}, ${slugBase}, ${pack.en.excerpt}, ${pack.en.content},
       'en', false, ${scheduledAt}, ${tags}, ${enRt})
    ON CONFLICT (slug) DO NOTHING RETURNING id
  `;
  if (result.length === 0) { console.log("EN exists, skipping"); return; }
  const enId = result[0].id;
  console.log("EN id=" + enId);
  
  for (const [lang, body] of [["de", pack.de], ["hi", pack.hi], ["id", pack.id]]) {
    const slug2 = slugBase + "-" + lang;
    const rt = readingTimeMin(body.content);
    const r = await sql`
      INSERT INTO blog_posts (title, slug, excerpt, content, language, published,
         scheduled_publish_at, translation_of, tags, reading_time_min)
      VALUES (${body.title}, ${slug2}, ${body.excerpt}, ${body.content},
         ${lang}, false, ${scheduledAt}, ${enId}, ${tags}, ${rt})
      ON CONFLICT (slug) DO NOTHING RETURNING id
    `;
    if (r.length > 0) console.log(lang.toUpperCase() + " id=" + r[0].id);
    else console.log(lang.toUpperCase() + " exists, skipping");
  }
}
main().catch(e => { console.error(e); process.exit(1); });
