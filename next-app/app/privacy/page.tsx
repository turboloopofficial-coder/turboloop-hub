// /privacy — privacy policy. Static.

import type { Metadata } from "next";
import { Container } from "@components/ui/Container";
import { PageHero } from "@components/layout/PageHero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How TurboLoop.tech handles your data: what we collect, what we don't, and how to opt out.",
  alternates: { canonical: "https://turboloop.tech/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="relative pb-12 md:pb-20">
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="What we collect on TurboLoop.tech, what we don't, and how to opt out."
      />

      <Container width="narrow">
        <article className="prose-blog">
          <p className="text-sm text-[var(--c-text-subtle)] italic">
            Last updated: April 2026
          </p>

          <p>
            TurboLoop.tech is the marketing and community hub for the TurboLoop
            DeFi protocol. We try to collect as little data as possible. This
            page tells you exactly what we do collect, why, and how to opt out.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Anonymous analytics</strong> via Google Analytics 4 — page
              views, time on site, country, device type. No personally
              identifying data tied to you specifically.
            </li>
            <li>
              <strong>Email addresses you submit</strong> through the newsletter
              signup — used only to send you updates about TurboLoop. Never
              shared. Never sold.
            </li>
            <li>
              <strong>Names and content you submit</strong> through the{" "}
              <a href="/submit">/submit</a> form (testimonials, photos,
              stories) — used only to feature your contribution if approved.
            </li>
            <li>
              <strong>Server logs</strong> via our hosting provider (Vercel) —
              IP address, user agent, request path. Standard for any web
              service. Used for security and debugging.
            </li>
          </ul>

          <h2>What we DON&rsquo;T collect</h2>
          <ul>
            <li>We don&rsquo;t track you across other sites.</li>
            <li>We don&rsquo;t sell or share your data with third parties.</li>
            <li>
              We never ask for your wallet&rsquo;s private keys, seed phrase,
              or any blockchain credentials.{" "}
              <strong>Anyone asking for these is a scammer.</strong>
            </li>
            <li>We don&rsquo;t use third-party advertising trackers.</li>
            <li>
              We don&rsquo;t have a login system on the public hub — there are
              no user accounts to compromise.
            </li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use minimal cookies — essentially just what Google Analytics
            requires for anonymous session tracking. No marketing cookies, no
            third-party trackers. If you want to opt out of analytics
            entirely, install any standard ad blocker (uBlock Origin, Brave
            shields, etc.) and we&rsquo;ll stop receiving any data from you.
          </p>

          <h2>Your data, your control</h2>
          <p>
            To request access to or deletion of any data we have on you (e.g.
            your email signup or content submissions), email us via the
            channel below. We respond within 7 days.
          </p>

          <h2>Newsletter unsubscribe</h2>
          <p>
            Every email we send includes a one-click unsubscribe link. You can
            also email us to remove yourself manually.
          </p>

          <h2>Children</h2>
          <p>
            TurboLoop is not directed at children under 18. If you believe
            we&rsquo;ve inadvertently collected data from a minor, contact us
            and we&rsquo;ll delete it.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If we ever change this policy meaningfully, we&rsquo;ll update the
            &ldquo;last updated&rdquo; date at the top and announce it on our
            Telegram channel.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy questions, reach us via the official Telegram channel:{" "}
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
