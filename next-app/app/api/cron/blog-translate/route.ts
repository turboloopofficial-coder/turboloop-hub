/**
 * Auto-translate cron — Option A
 *
 * Detects English blog posts published in the last 2 hours that have
 * no translations yet, then generates translations into all 14 other
 * supported languages via Anthropic Claude with the fact-guard system prompt.
 *
 * Schedule: runs every 2 hours via vercel.json crons.
 * Auth: requires CRON_SECRET bearer token (same pattern as indexnow).
 *
 * Flow:
 *   1. Find EN posts published in last 2 hours with no translation rows
 *   2. For each post × each of the 14 non-EN languages:
 *      a. Call Claude to translate title, excerpt, content
 *      b. Insert a new blog_posts row with language=XX, translationOf=EN_id
 *   3. Revalidate the blog ISR cache
 *   4. Return a summary of what was translated
 */
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { BLOG_LANGUAGES, getTranslationPrompt } from "@lib/blogFactGuard";
import { LANGUAGES } from "@lib/languages";

export const dynamic = "force-dynamic";
export const revalidate = 0;
// Translations can take a while — allow up to 5 minutes
export const maxDuration = 300;

const HOST = "https://www.turboloop.tech";
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

// ⚡ Slug suffixes derived from languages.ts — no manual updates needed when adding a language
const LANG_SLUG_SUFFIX: Record<string, string> = Object.fromEntries(
  Object.values(LANGUAGES)
    .filter(l => l.slugSuffix !== "")
    .map(l => [l.code, l.slugSuffix])
);

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 230));
}

async function translateField(
  text: string,
  targetLang: string,
  targetNativeName: string,
  fieldType: "title" | "excerpt" | "content"
): Promise<string> {
  const systemPrompt = getTranslationPrompt(targetLang, targetNativeName);
  const userPrompt = fieldType === "content"
    ? `Translate the following Turbo Loop blog post content into ${targetLang}. Preserve all Markdown formatting:\n\n${text}`
    : `Translate the following Turbo Loop blog post ${fieldType} into ${targetLang}. Return only the translated ${fieldType}, nothing else:\n\n${text}`;

  const { text: result } = await generateText({
    model: anthropic("claude-3-5-haiku-20241022"),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.2,
    maxOutputTokens: fieldType === "content" ? 4000 : 300,
  });

  return result.trim() || text;
}

export async function GET(req: NextRequest) {
  // Auth check
  const cronHeader = req.headers.get("x-vercel-cron-signature");
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  const ok = cronHeader !== null || (expected && authHeader === `Bearer ${expected}`);
  if (!ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 });

  const sql = neon(dbUrl);
  const log: string[] = [];
  const translated: string[] = [];

  try {
    // Find English posts published in the last 2 hours that have no translations yet
    const untranslatedPosts = await sql`
      SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.content, bp.tags,
             bp.author_name, bp.author_url, bp.seo_title, bp.seo_description,
             bp.cover_image, bp.published, bp.scheduled_publish_at
      FROM blog_posts bp
      WHERE bp.language = 'en'
        AND bp.translation_of IS NULL
        AND bp.published = true
        AND bp.created_at > NOW() - INTERVAL '2 hours'
        AND NOT EXISTS (
          SELECT 1 FROM blog_posts t
          WHERE t.translation_of = bp.id
          LIMIT 1
        )
      ORDER BY bp.id DESC
      LIMIT 5
    ` as Array<{
      id: number;
      title: string;
      slug: string;
      excerpt: string | null;
      content: string;
      tags: string[] | null;
      author_name: string | null;
      author_url: string | null;
      seo_title: string | null;
      seo_description: string | null;
      cover_image: string | null;
      published: boolean;
      scheduled_publish_at: Date | null;
    }>;

    if (untranslatedPosts.length === 0) {
      return NextResponse.json({ ok: true, message: "No new English posts to translate", translated: [] });
    }

    log.push(`Found ${untranslatedPosts.length} English post(s) to translate`);

    // Non-English languages to translate into
    const targetLanguages = BLOG_LANGUAGES.filter(l => l.code !== "en");

    // SECURITY: Sanitise author_name to prevent stored XSS propagation.
    // Strip ALL HTML tags and limit to 100 chars of plain text.
    function sanitiseAuthorName(raw: string | null): string | null {
      if (!raw) return null;
      const stripped = raw.replace(/<[^>]*>/g, "").replace(/[\x00-\x1f]/g, "").trim();
      return stripped.slice(0, 100) || "TurboLoop Team";
    }

    for (const post of untranslatedPosts) {
      // Sanitise author fields before propagation
      post.author_name = sanitiseAuthorName(post.author_name);
      log.push(`Translating: "${post.title}" (id=${post.id})`);

      for (const lang of targetLanguages) {
        try {
          const suffix = LANG_SLUG_SUFFIX[lang.code] ?? `-${lang.code}`;
          const translatedSlug = `${post.slug}${suffix}`;

          // Check if this translation already exists (safety guard)
          const existing = await sql`
            SELECT id FROM blog_posts WHERE slug = ${translatedSlug} LIMIT 1
          `;
          if (existing.length > 0) {
            log.push(`  ⏭ ${lang.code}: already exists (${translatedSlug})`);
            continue;
          }

          // Translate title, excerpt, and content sequentially to avoid rate limits
          const translatedTitle = await translateField(post.title, lang.name, lang.nativeName, "title");
          const translatedExcerpt = post.excerpt
            ? await translateField(post.excerpt, lang.name, lang.nativeName, "excerpt")
            : null;
          const translatedContent = await translateField(post.content, lang.name, lang.nativeName, "content");

          // Translate SEO fields if present
          let translatedSeoTitle: string | null = null;
          let translatedSeoDesc: string | null = null;
          if (post.seo_title) {
            translatedSeoTitle = await translateField(post.seo_title, lang.name, lang.nativeName, "title");
          }
          if (post.seo_description) {
            translatedSeoDesc = await translateField(post.seo_description, lang.name, lang.nativeName, "excerpt");
          }

          const readingTime = estimateReadingTime(translatedContent);

          // Insert the translation row
          await sql`
            INSERT INTO blog_posts (
              title, slug, excerpt, content, cover_image, language,
              translation_of, tags, author_name, author_url,
              seo_title, seo_description, reading_time_min,
              published, scheduled_publish_at, created_at, updated_at
            ) VALUES (
              ${translatedTitle},
              ${translatedSlug},
              ${translatedExcerpt},
              ${translatedContent},
              ${post.cover_image},
              ${lang.code},
              ${post.id},
              ${post.tags},
              ${post.author_name},
              ${post.author_url},
              ${translatedSeoTitle},
              ${translatedSeoDesc},
              ${readingTime},
              ${post.published},
              ${post.scheduled_publish_at},
              NOW(),
              NOW()
            )
          `;

          log.push(`  ✅ ${lang.code}: "${translatedTitle}" → /blog/${translatedSlug}`);
          translated.push(translatedSlug);

        } catch (langErr) {
          const msg = langErr instanceof Error ? langErr.message : String(langErr);
          log.push(`  ❌ ${lang.code}: failed — ${msg}`);
          console.error(`[blog-translate] ${lang.code} failed for post ${post.id}:`, langErr);
        }
      }
    }

    // Revalidate the blog ISR cache so new translations appear immediately
    if (translated.length > 0 && REVALIDATE_SECRET) {
      try {
        await fetch(`${HOST}/api/revalidate-blog?secret=${encodeURIComponent(REVALIDATE_SECRET)}`);
        for (const slug of translated) {
          await fetch(`${HOST}/api/revalidate-blog?secret=${encodeURIComponent(REVALIDATE_SECRET)}&slug=${encodeURIComponent(slug)}`);
        }
        log.push(`🔄 Revalidated ${translated.length} translation pages`);
      } catch (revalErr) {
        log.push(`⚠️ Revalidation failed (non-fatal): ${revalErr}`);
      }
    }

    return NextResponse.json({
      ok: true,
      postsProcessed: untranslatedPosts.length,
      translationsCreated: translated.length,
      translated,
      log,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[blog-translate] cron failed:", err);
    return NextResponse.json({ ok: false, error: msg, log }, { status: 500 });
  }
}
