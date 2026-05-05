// /blog (alias /feed) — editorial index. Build-time fetch from the
// existing tRPC API at turboloop.tech. Posts are rendered as static
// HTML; revalidates every 5 minutes (ISR) so newly-published posts
// surface within minutes without redeploying.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { api } from "@lib/api";

export const revalidate = 300; // 5 min

export const metadata: Metadata = {
  title: "Editorial — TurboLoop Blog",
  description:
    "Deep dives on DeFi, yield, security, and the TurboLoop ecosystem. Plain English. No fluff.",
  alternates: { canonical: "https://turboloop.tech/blog" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function BlogIndex() {
  const posts = await api
    .blogPosts()
    .then(p => p.filter(post => post.published));

  // Sort newest first
  const sorted = posts
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const [featured, ...rest] = sorted;

  return (
    <main className="relative pb-12 md:pb-20">
      <section className="pt-12 pb-8 md:pt-20 md:pb-12">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto">
            <Heading
              tier="eyebrow"
              className="text-[var(--c-brand-cyan)] mb-3 inline-block"
            >
              Editorial
            </Heading>
            <Heading tier="display" className="mb-4">
              Read{" "}
              <span className="text-brand-wide">deeper.</span>
            </Heading>
            <p className="text-lg text-[var(--c-text-muted)] leading-relaxed">
              {sorted.length} long-form articles on DeFi, yield, security,
              and the math behind the protocol.
            </p>
          </div>
        </Container>
      </section>

      <Container width="wide">
        {/* Featured (most recent) */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group block rounded-[var(--r-2xl)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-lg)] hover:shadow-[var(--s-xl)] transition mb-10 md:mb-14 active:scale-[0.99]"
          >
            <div className="md:flex md:items-stretch">
              <div
                className="relative md:flex-1 md:max-w-[55%]"
                style={{ aspectRatio: "16 / 10" }}
              >
                {featured.coverImage ? (
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: "var(--c-brand-gradient-wide)" }}
                  />
                )}
              </div>
              <div className="p-6 md:p-10 md:flex-1 md:flex md:flex-col md:justify-center">
                <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-cyan)] mb-3">
                  Featured · {formatDate(featured.createdAt)}
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-[var(--c-text)] leading-tight tracking-tight mb-3">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-base md:text-lg text-[var(--c-text-muted)] leading-relaxed mb-4 line-clamp-3">
                    {featured.excerpt}
                  </p>
                )}
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--c-brand-cyan)]">
                  Read article →
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Rest of posts as a grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {rest.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block rounded-[var(--r-xl)] overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)] hover:shadow-[var(--s-lg)] hover:-translate-y-0.5 transition active:scale-[0.99]"
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
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
              <div className="p-5">
                <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
                  {formatDate(post.createdAt)}
                  {post.readingTime ? ` · ${post.readingTime} min read` : ""}
                </div>
                <h3 className="text-base font-bold text-[var(--c-text)] leading-snug mb-2 line-clamp-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-[var(--c-text-muted)] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {sorted.length === 0 && (
          <div
            className="rounded-[var(--r-xl)] p-10 text-center text-[var(--c-text-muted)] border border-[var(--c-border)] bg-[var(--c-surface)]"
          >
            No articles published yet.
          </div>
        )}
      </Container>
    </main>
  );
}
