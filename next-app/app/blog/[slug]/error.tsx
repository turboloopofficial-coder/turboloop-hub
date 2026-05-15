// Route-level error boundary for /blog/[slug]. If page.tsx throws at
// request time (tRPC outage, markdown render bug, etc.), Next.js renders
// this instead of a generic 500. The reset() callback retries the page,
// which is the right UX for transient upstream blips.
//
// Lives next to page.tsx — Next.js auto-discovers based on file name.

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Surface the error to the browser console for debugging. Vercel
  // already has the server-side trace; this just helps in dev.
  useEffect(() => {
    console.error("[blog/[slug]] runtime error:", error);
  }, [error]);

  return (
    <main className="relative pb-12 md:pb-20">
      <Container width="narrow" className="pt-10 md:pt-16 text-center">
        <div className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-[var(--c-brand-cyan)] mb-3">
          Article unavailable
        </div>
        <Heading tier="h1" className="mb-4">
          This one hit a snag.
        </Heading>
        <p className="text-[var(--c-text-muted)] leading-relaxed mb-8 max-w-xl mx-auto">
          We&rsquo;re looking into it. Try refreshing, or browse the rest
          of the archive while we sort this out.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] transition active:scale-[0.985]"
          >
            Try again
          </button>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 h-11 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] transition active:scale-[0.985]"
          >
            All articles
          </Link>
        </div>
        {error.digest && (
          <div className="mt-10 text-[0.6875rem] tracking-[0.16em] uppercase text-[var(--c-text-subtle)]">
            Ref · {error.digest}
          </div>
        )}
      </Container>
    </main>
  );
}
