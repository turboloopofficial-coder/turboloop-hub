import type { IncomingMessage, ServerResponse } from "node:http";
import { neon } from "@neondatabase/serverless";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT COUNT(*) AS count FROM presentations`;
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, presentationsCount: rows[0]?.count, env: !!process.env.DATABASE_URL }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: String(err?.message || err), stack: err?.stack }));
  }
}
