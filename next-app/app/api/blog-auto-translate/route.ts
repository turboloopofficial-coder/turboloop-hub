// POST /api/blog-auto-translate
// Automatically translates a blog post into all supported languages.
// Called by the scheduled task after generating new English posts.
// Requires CRON_SECRET for authentication.

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const LANGUAGES = [
  { code: "hi", name: "Hindi" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "bn", name: "Bangla" },
  { code: "ko", name: "Korean" },
  { code: "ur", name: "Urdu" },
  { code: "ta", name: "Tamil" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "tr", name: "Turkish" },
  { code: "lo", name: "Lao" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
  { code: "de", name: "German" },
  { code: "pcm", name: "Nigerian Pidgin" },
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
        const existing = await sql`
          SELECT id FROM blog_posts
          WHERE slug = ${post.slug} AND language = ${lang.code}
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
            model: "anthropic/claude-sonnet-4",
            messages: [
              {
                role: "system",
                content: `You are a professional translator. Translate the following blog post to ${lang.name}. Keep all markdown formatting, links, and structure intact. Only translate the text content. Return a JSON object with keys: title, content, excerpt. Do not add any explanation.`,
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
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          errors.push({ postId: post.id, language: lang.code, error: `API ${response.status}` });
          continue;
        }

        const data = await response.json();
        const translated = JSON.parse(data.choices[0].message.content);

        // Insert translated post
        const inserted = await sql`
          INSERT INTO blog_posts (title, slug, content, excerpt, language, author_name, published, tags, cover_image, created_at)
          VALUES (
            ${translated.title},
            ${post.slug},
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
          slug: post.slug,
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
