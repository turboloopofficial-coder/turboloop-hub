// /api/language-request — Language onboarding request endpoint.
//
// POST: Submit a new language request from a community member.
//   Body: {
//     languageName: string,     // e.g. "Vietnamese"
//     languageCode: string,     // e.g. "vi" (ISO 639-1)
//     nativeName: string,       // e.g. "Tiếng Việt"
//     flag: string,             // e.g. "🇻🇳"
//     requesterName?: string,   // optional
//     requesterTelegram?: string, // optional TG handle
//     reason?: string,          // why this language
//   }
//
// GET: List all language requests (admin only — requires x-admin-token header).
//
// The request is stored in the database. An admin can approve it from
// the admin panel, which triggers the automated onboarding pipeline.

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@lib/db";
import { languageRequests } from "../../../drizzle/schema";
import { desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { languageName, languageCode, nativeName, flag, requesterName, requesterTelegram, reason } = body;

    // Validate required fields
    if (!languageName || !languageCode || !nativeName || !flag) {
      return NextResponse.json(
        { error: "Missing required fields: languageName, languageCode, nativeName, flag" },
        { status: 400 }
      );
    }

    // Validate language code format (2-3 chars)
    if (!/^[a-z]{2,3}$/.test(languageCode)) {
      return NextResponse.json(
        { error: "languageCode must be a 2-3 letter ISO 639-1 code" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if already requested
    const existing = await db
      .select()
      .from(languageRequests)
      .where(eq(languageRequests.languageCode, languageCode))
      .limit(1);

    if (existing.length > 0) {
      const status = existing[0].status;
      if (status === "approved" || status === "completed") {
        return NextResponse.json(
          { error: `${languageName} is already available or being onboarded.` },
          { status: 409 }
        );
      }
      if (status === "pending") {
        // Increment vote count
        await db
          .update(languageRequests)
          .set({ votes: (existing[0].votes ?? 0) + 1 })
          .where(eq(languageRequests.id, existing[0].id));
        return NextResponse.json({
          message: `Your vote for ${languageName} has been recorded! It now has ${(existing[0].votes ?? 0) + 1} votes.`,
          votes: (existing[0].votes ?? 0) + 1,
        });
      }
    }

    // Insert new request
    const [row] = await db
      .insert(languageRequests)
      .values({
        languageName,
        languageCode,
        nativeName,
        flag,
        requesterName: requesterName || null,
        requesterTelegram: requesterTelegram || null,
        reason: reason || null,
        status: "pending",
        votes: 1,
      })
      .returning();

    return NextResponse.json({
      message: `Language request for ${languageName} submitted successfully!`,
      id: row.id,
    }, { status: 201 });
  } catch (err: unknown) {
    console.error("Language request error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Simple admin check via header
  const adminToken = req.headers.get("x-admin-token");
  const expectedToken = process.env.ADMIN_API_TOKEN || process.env.CRON_SECRET;
  if (!adminToken || adminToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const requests = await db
      .select()
      .from(languageRequests)
      .orderBy(desc(languageRequests.votes));

    return NextResponse.json({ requests });
  } catch (err: unknown) {
    console.error("Language request list error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
