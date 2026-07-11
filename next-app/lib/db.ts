// lib/db.ts — Lightweight database helper for Next.js API routes.
//
// Unlike server/db.ts (which imports bcryptjs and many heavy deps for the
// cron-master), this module only provides the raw drizzle client so API
// routes can query the database without pulling in server-only packages.

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(url);
  _db = drizzle(sql);
  return _db;
}
