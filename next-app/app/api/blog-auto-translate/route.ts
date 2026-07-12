// POST /api/blog-auto-translate
// Automatically translates a blog post into all supported languages.
// Called by the scheduled task after generating new English posts.
// Requires CRON_SECRET for authentication.

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// IMPORTANT: These codes MUST match the DB language column values.
// DB uses: pk (Urdu), sa (Arabic), cn (Chinese), ng (Pidgin), kr (Korean), la (Lao)
const LANGUAGES = [
  { code: "hi", name: "Hindi" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "bn", name: "Bangla" },
  { code: "tr", name: "Turkish" },
  { code: "kr", name: "Korean" },
  { code: "pk", name: "Urdu" },
  { code: "ta", name: "Tamil" },
  { code: "sa", name: "Arabic" },
  { code: "cn", name: "Chinese (Simplified)" },
  { code: "la", name: "Lao" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
  { code: "de", name: "German" },
  { code: "ng", name: "Nigerian Pidgin" },
];

export async function POST(req: NextRequest) {
  // Auth check
  const secret = req.headers.get("x-cron-secret") || req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { postIds } = body as { postIds: number[] };

  if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
    return NextResponse.json({ error: "postIds array required" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  // Fetch the source posts
  const posts = await sql`
    SELECT id, title, slug, content, excerpt, tags, cover_image
    FROM blog_posts
    WHERE id = ANY(${postIds}) AND language = 'en'
  `;

  if (posts.length === 0) {
    return NextResponse.json({ error: "No English posts found with given IDs" }, { status: 404 });
  }

  const results: { postId: number; language: string; newId: number; slug: string }[] = [];
  const errors: { postId: number; language: string; error: string }[] = [];

  // Translate each post into each language
  for (const post of posts) {
    for (const lang of LANGUAGES) {
      try {
        // Check if translation already exists
        const translatedSlug = `${post.slug}-${lang.code}`;
        const existing = await sql`
          SELECT id FROM blog_posts
          WHERE slug = ${translatedSlug}
          LIMIT 1
        `;
        if (existing.length > 0) {
          continue; // Skip — already translated
        }

        // Use OpenAI to translate
        const response = await fetch(`${process.env.OPENAI_API_BASE || "https://api.openai.com/v1"}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            messages: [
              {
                role: "system",
                content: `You are a professional translator for TurboLoop, a DeFi protocol on BNB Smart Chain. Translate the following blog post to ${lang.name}.

CRITICAL RULES:
- Keep all markdown formatting, links, and structure intact
- Only translate the text content
- The 4 investment plans are: Sprint Loop (7 days, 3%), Accelerate Loop (14 days, 10%), Power Loop (30 days, 24%), Ultimate Loop (60 days, 54%) — NEVER change these names or numbers
- Minimum deposit is 1 USDT — never change this
- Smart contract ownership is RENOUNCED — always keep this fact
- NEVER use the term "APY" to describe TurboLoop returns — use "fixed return" or "total return"
- Returns are paid in USDT (BEP-20), not a native token
- The protocol uses PancakeSwap V3 USDC/USDT concentrated liquidity

Return a JSON object with keys: title, content, excerpt. Do not add any explanation.`,
              },
              {
                role: "user",
                content: JSON.stringify({
                  title: post.title,
                  content: post.content?.substring(0, 8000) || "",
                  excerpt: post.excerpt || "",
                }),
              },
            ],
            max_tokens: 4096,
          }),
        });

        if (!response.ok) {
          errors.push({ postId: post.id, language: lang.code, error: `API ${response.status}` });
          continue;
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content || "{}";
        const jsonStart = raw.indexOf('{');
        const jsonEnd = raw.lastIndexOf('}') + 1;
        const translated = JSON.parse(raw.substring(jsonStart, jsonEnd));

        // Insert translated post
        const inserted = await sql`
          INSERT INTO blog_posts (title, slug, content, excerpt, language, author_name, published, tags, cover_image, created_at)
          VALUES (
            ${translated.title},
            ${translatedSlug},
            ${translated.content},
            ${translated.excerpt || null},
            ${lang.code},
            ${"TurboLoop Editorial Team"},
            ${true},
            ${post.tags || null},
            ${post.cover_image || null},
            NOW()
          )
          RETURNING id
        `;

        results.push({
          postId: post.id,
          language: lang.code,
          newId: inserted[0].id,
          slug: translatedSlug,
        });
      } catch (err) {
        errors.push({
          postId: post.id,
          language: lang.code,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    translated: results.length,
    skipped: (posts.length * LANGUAGES.length) - results.length - errors.length,
    errors: errors.length,
    details: { results, errors },
  });
}
