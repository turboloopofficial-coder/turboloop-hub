"use client";

// Real newsletter signup section. Replaces the previous link-only CTA
// (which was broken — it linked to #newsletter that didn't exist).
//
// Renders an email input + Subscribe button that POSTs to the legacy
// tRPC newsletter.signup endpoint at api.turboloop.tech. Inline success
// + error states, basic email validation. The id="newsletter" anchor
// is set on the wrapper so existing /#newsletter share links land here.

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { Magnetic } from "@components/ui/Magnetic";
import { newsletterSignup } from "@lib/submitApi";
import { haptic } from "@lib/haptic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = EMAIL_RE.test(email.trim());
  const showInlineError = touched && email.trim().length > 0 && !emailValid;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (!emailValid) {
      haptic("error");
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      await newsletterSignup(email.trim(), "homepage");
      haptic("success");
      setDone(true);
    } catch (err: any) {
      haptic("error");
      setError(err?.message || "Couldn't sign up — try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      id="newsletter"
      className="py-12 md:py-20 scroll-mt-20"
      aria-labelledby="newsletter-heading"
    >
      <Container width="default">
        <div
          className="rounded-[var(--r-2xl)] p-7 md:p-12 text-center text-white relative overflow-hidden shadow-[var(--s-xl)]"
          style={{ background: "var(--c-brand-gradient-wide)" }}
        >
          {/* Decorative dot grid overlay */}
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
            <Heading
              tier="h1"
              className="text-white mb-4"
              as="h2"
            >
              <span id="newsletter-heading">
                One email. Real updates. No filler.
              </span>
            </Heading>
            <p className="text-white/85 max-w-lg mx-auto leading-relaxed mb-7 text-sm md:text-base">
              When something real ships — a new film, a new program, a
              security milestone — you&rsquo;ll be the first to know. No
              spam, ever. Unsubscribe in one click.
            </p>

            {done ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/95 text-[var(--c-text)] font-bold shadow-[var(--s-lg)]">
                <Check className="w-5 h-5 text-emerald-600" strokeWidth={3} />
                You&rsquo;re in. Welcome.
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                noValidate
                className="max-w-md mx-auto"
              >
                <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    aria-invalid={showInlineError}
                    aria-describedby={
                      showInlineError ? "newsletter-error" : undefined
                    }
                    className="flex-1 min-h-[52px] px-5 rounded-[var(--r-lg)] text-base text-[var(--c-text)] bg-white outline-none border-2 border-transparent focus:border-white/60 focus:ring-2 focus:ring-white/40 placeholder:text-[var(--c-text-subtle)]"
                  />
                  <Magnetic strength={6}>
                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-[var(--r-lg)] text-base font-bold bg-white text-[var(--c-text)] hover:bg-white/95 shadow-[var(--s-lg)] transition active:scale-[0.985] disabled:opacity-60"
                    >
                      {busy ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Subscribe
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </Magnetic>
                </div>

                {/* Inline validation / error */}
                {(showInlineError || error) && (
                  <p
                    id="newsletter-error"
                    role="alert"
                    className="mt-3 text-sm text-white bg-red-500/30 border border-white/20 rounded-[var(--r-md)] px-3 py-2 inline-block"
                  >
                    {error ??
                      "That doesn't look like a valid email address."}
                  </p>
                )}
              </form>
            )}

            <div className="mt-5 text-xs text-white/70">
              Or follow on{" "}
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
