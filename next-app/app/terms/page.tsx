// /terms — plain-English terms of use. Static.

import type { Metadata } from "next";
import { Container } from "@components/ui/Container";
import { PageHero } from "@components/layout/PageHero";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for TurboLoop.tech — what you can and can't do on the marketing hub.",
  alternates: { canonical: "https://turboloop.tech/terms" },
};

export default function TermsPage() {
  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        subtitle="Plain English. What you can and can't do on TurboLoop.tech."
      />

      <Container width="narrow">
        <article className="prose-blog">
          <p className="text-sm text-[var(--c-text-subtle)] italic">
            Last updated: April 2026
          </p>

          <h2>Scope</h2>
          <p>
            These terms cover{" "}
            <strong>TurboLoop.tech</strong> — the marketing hub. The TurboLoop
            DeFi protocol itself runs on the Binance Smart Chain via an
            immutable, ownership-renounced smart contract. The protocol has
            no terms because it has no operator — it&rsquo;s code.
          </p>

          <h2>What this site is</h2>
          <p>
            TurboLoop.tech is an information and community resource. It
            explains the protocol, hosts educational films + articles, lets
            you share testimonials, and routes you to the dApp at
            turboloop.io. We don&rsquo;t hold your money. We don&rsquo;t take
            deposits. We don&rsquo;t custody anything.
          </p>

          <h2>What you can do</h2>
          <ul>
            <li>Read articles, watch films, browse the library — all free.</li>
            <li>
              Submit testimonials, photos, stories via{" "}
              <a href="/submit">/submit</a>.
            </li>
            <li>
              Apply to creator and presenter programs via{" "}
              <a href="/apply">/apply</a>.
            </li>
            <li>
              Share any URL on the site freely. Our content is intended for
              broad distribution.
            </li>
          </ul>

          <h2>What you can&rsquo;t do</h2>
          <ul>
            <li>
              Submit content that&rsquo;s illegal, hateful, sexually explicit,
              or impersonates someone else.
            </li>
            <li>
              Scrape the site at a rate that disrupts service for other
              visitors.
            </li>
            <li>
              Pretend to officially represent TurboLoop without authorization.
            </li>
            <li>
              Use TurboLoop branding to scam or defraud third parties — this
              is both a terms violation and likely a crime in your
              jurisdiction.
            </li>
          </ul>

          <h2>No financial advice</h2>
          <p>
            Nothing on this site is financial advice, investment advice, or a
            recommendation to deposit funds. DeFi participation involves risk.
            Read the smart contract source. Read the audit. Form your own
            opinion. If in doubt, talk to a licensed financial advisor in
            your country.
          </p>

          <h2>No warranty</h2>
          <p>
            The site is provided &ldquo;as is.&rdquo; We work to keep it
            accurate and online, but we don&rsquo;t guarantee uptime, freedom
            from bugs, or that any specific feature will keep working forever.
          </p>

          <h2>Submissions you make</h2>
          <p>
            Anything you submit via <a href="/submit">/submit</a> or{" "}
            <a href="/apply">/apply</a>, you grant TurboLoop a non-exclusive
            license to display on this site and across our channels (Telegram,
            X, YouTube, etc.) with attribution to your provided name. You
            retain ownership of your work; you can ask us to remove it any
            time.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            If we make meaningful changes, we&rsquo;ll update the date at the
            top and announce it on our Telegram channel.
          </p>

          <h2>Contact</h2>
          <p>
            For terms questions, reach us via the official Telegram channel:{" "}
            <a
              href="https://t.me/TurboLoop_Official"
              target="_blank"
              rel="noopener noreferrer"
            >
              @TurboLoop_Official
            </a>
            .
          </p>
        </article>
      </Container>
    </main>
  );
}
