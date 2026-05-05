// "Editorial" — 3 most recent blog posts on the homepage.
// Build-time fetch; ISR-revalidates every 5 min.

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Card } from "@components/ui/Card";
import { Heading } from "@components/ui/Heading";
import { api } from "@lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function HomeBlogSection() {
  let posts: Awaited<ReturnType<typeof api.blogPosts>> = [];
  try {
    const all = await api.blogPosts();
    posts = all
      .filter(p => p.published)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
  } catch {
    return null;
  }

  if (posts.length === 0) return null;

  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-10 gap-4">
          <div>
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              Editorial
            </Heading>
            <Heading tier="h1">
              Read <span className="text-brand-wide">deeper.</span>
            </Heading>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--c-brand-cyan)] hover:underline"
          >
            All articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <Card
                elevation="raised"
                padding="none"
                interactive
                className="h-full overflow-hidden flex flex-col"
              >
                <div
                  className="relative w-full"
                  style={{ aspectRatio: "16 / 10" }}
                >
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ background: "var(--c-brand-gradient)" }}
                    />
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
                    {formatDate(post.createdAt)}
                    {post.readingTime ? ` · ${post.readingTime} min read` : ""}
                  </div>
                  <h3 className="text-base font-bold text-[var(--c-text)] leading-snug mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-[var(--c-text-muted)] leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
