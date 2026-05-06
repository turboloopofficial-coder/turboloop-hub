// Custom 404. Minimal, premium, centred. Works in both light and dark
// mode via existing CSS variables (no hard-coded colours that lock to
// one theme). The 3D vortex logo + brand wordmark anchor the page so
// users who land here from a stale link still feel like they're in the
// right place.

import Link from "next/link";
import { Brand } from "@components/Brand";
import { Container } from "@components/ui/Container";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="relative min-h-[70vh] flex items-center justify-center py-20"
    >
      <Container width="default">
        <div className="text-center max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <Brand size={48} />
          </div>

          <div className="bg-brand bg-clip-text text-transparent text-7xl md:text-8xl font-extrabold tracking-tight leading-none mb-3">
            404
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-[var(--c-text)] mb-2">
            This page doesn&rsquo;t exist.
          </h1>

          <p className="text-[var(--c-text-muted)] leading-relaxed mb-8">
            The link may be stale, or the page moved during the rebuild.
            Either way, here&rsquo;s the way back in.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 min-h-[48px] rounded-[var(--r-lg)] text-base font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
            >
              Go home
            </Link>
            <Link
              href="/ecosystem"
              className="inline-flex items-center justify-center gap-2 px-6 min-h-[48px] rounded-[var(--r-lg)] text-base font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:bg-[var(--c-bg)] hover:shadow-[var(--s-md)] transition active:scale-[0.985]"
            >
              Explore the ecosystem
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
