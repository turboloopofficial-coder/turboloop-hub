// Seed the two currently-open Zoom Presenter roles into job_vacancies.
//
// Idempotent — uses INSERT ... ON CONFLICT (slug) DO NOTHING so this is
// safe to re-run. If admin has already created a row with one of these
// slugs (e.g. via the CRM admin tab), the existing row is preserved
// and the seed is a no-op.
//
// Slugs match what was the FALLBACK_ROLES constant in next-app/app/
// careers/page.tsx, so existing submission rows that reference these
// IDs in their body header continue to attribute correctly.

import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const ROLES = [
  {
    slug: "presenter-id",
    title: "Zoom Presenter — Indonesian",
    flag: "🇮🇩",
    location: "Remote · Bahasa Indonesia",
    stipend: "$100 / month",
    bullets: [
      "Host weekly community Zoom sessions in Bahasa Indonesia.",
      "Walk new members through wallet setup, deposit, and yield mechanics.",
      "Coordinate with the global presenter team via Telegram.",
      "Minimum: comfortable with public speaking + active local crypto community of 40+ contacts.",
    ],
    status: "open",
    tg_support_link: "https://t.me/TurboLoop_Support",
    sort_order: 1,
  },
  {
    slug: "presenter-de",
    title: "Zoom Presenter — German",
    flag: "🇩🇪",
    location: "Remote · Deutsch",
    stipend: "$100 / month",
    bullets: [
      "Host weekly community Zoom sessions in Deutsch.",
      "Walk new members through wallet setup, deposit, and yield mechanics.",
      "Coordinate with the global presenter team via Telegram.",
      "Minimum: comfortable with public speaking + active local crypto community of 40+ contacts.",
    ],
    status: "open",
    tg_support_link: "https://t.me/TurboLoop_Support",
    sort_order: 2,
  },
];

(async () => {
  console.log(`Seeding ${ROLES.length} job_vacancies rows…\n`);

  for (const r of ROLES) {
    const result = await sql`
      INSERT INTO job_vacancies
        (slug, title, flag, location, stipend, bullets, status,
         tg_support_link, sort_order)
      VALUES
        (${r.slug}, ${r.title}, ${r.flag}, ${r.location}, ${r.stipend},
         ${JSON.stringify(r.bullets)}::jsonb, ${r.status},
         ${r.tg_support_link}, ${r.sort_order})
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, slug, status
    `;
    if (result.length > 0) {
      console.log(`  ✓ inserted ${r.slug} (id=${result[0].id}, status=${result[0].status})`);
    } else {
      console.log(`  · ${r.slug} already exists — preserved (no overwrite)`);
    }
  }

  const all = await sql`SELECT slug, status FROM job_vacancies ORDER BY sort_order, created_at DESC`;
  console.log(`\nCurrent job_vacancies (${all.length} total):`);
  for (const row of all) console.log(`  - ${row.slug} [${row.status}]`);
})().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
