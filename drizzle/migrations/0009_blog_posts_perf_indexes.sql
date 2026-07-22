-- Migration 0009: Performance indexes for blog_posts table
--
-- Problem: The blog_posts table has 4700+ rows but NO indexes except
-- the primary key (id) and unique constraint (slug). Every query that
-- filters by `published`, `language`, or orders by `created_at` does a
-- full sequential scan, causing:
--   - listBlogPostsSummary(): 7.8s (returns all 4700 published posts)
--   - listBlogPostsHomepage(): 4.5s (returns top 5 per language)
--   - blogPost(slug): 2.3s (single post lookup by slug - already has unique index)
--
-- Fix: Add composite indexes for the three most common query patterns.
-- Expected result: queries drop from 7-8s to <100ms.

-- Index 1: (published, created_at DESC)
-- Used by: listBlogPostsSummary() — WHERE published = true ORDER BY created_at DESC
-- Also used by: listBlogPostsHomepage() — same filter + LIMIT 500
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_published_created
  ON blog_posts (published, created_at DESC);

-- Index 2: (language, published, created_at DESC)
-- Used by: any per-language query (future pagination, language-filtered listing)
-- Covers the most selective filter combination for the blog listing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_language_published_created
  ON blog_posts (language, published, created_at DESC);

-- Index 3: (translation_of)
-- Used by: blogTranslationGroup() — WHERE id = rootId OR translation_of = rootId
-- Without this, every blog post page does a full scan to find hreflang siblings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_translation_of
  ON blog_posts (translation_of)
  WHERE translation_of IS NOT NULL;
