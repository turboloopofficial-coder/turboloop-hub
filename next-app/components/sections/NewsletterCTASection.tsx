// Newsletter signup — last conversion point before the footer.
//
// Form submits to the existing tRPC endpoint at turboloop.tech.
// Until the tRPC client is wired into this Next.js app (Phase 13),
// the form is a "coming soon" placeholder that links to the production
// signup. This avoids partially-broken state during migration.

import { ArrowRight } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";

export function NewsletterCTASection() {
  return (
    <section className="py-16 md:py-24">
      <Container width="default">
        <div
          className="rounded-[var(--r-2xl)] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-[var(--s-xl)]"
          style={{ background: "var(--c-brand-gradient-wide)" }}
        >
          {/* Decorative grid overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10">
            <Heading
              tier="eyebrow"
              className="text-white/85 mb-3 inline-block"
            >
              Stay in the loop
            </Heading>
            <Heading tier="h1" className="text-white mb-4">
              One email. Real updates. No filler.
            </Heading>
            <p className="text-white/85 max-w-lg mx-auto leading-relaxed mb-8">
              When something real ships — a new film, a new program, a
              security milestone — you&rsquo;ll be the first to know. No
              spam, ever. Unsubscribe in one click.
            </p>

            <a
              href="https://turboloop.tech/#newsletter"
              className="inline-flex items-center justify-center gap-2 px-7 h-[52px] rounded-[var(--r-lg)] text-base font-bold bg-white text-[var(--c-text)] hover:bg-white/95 shadow-[var(--s-lg)] transition active:scale-[0.985]"
            >
              Subscribe
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="mt-5 text-xs text-white/70">
              Or skip the inbox · Follow on{" "}
              <a
                href="https://t.me/TurboLoop_Official"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                Telegram
              </a>{" "}
              ·{" "}
              <a
                href="https://x.com/TurboLoop_io"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                X
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
