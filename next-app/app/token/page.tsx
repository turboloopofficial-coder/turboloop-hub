// /token — the dedicated $TURBO token landing page. Multilingual via
// the ?lang= query param (en | de | hi | id), with hreflang declared
// across all four variants. Mirrors the pattern /films uses.
//
// Server component (ISR=60s so the OG/hero block reflects the latest
// price snapshot for crawlers; live polling on top via the
// TokenPriceWidget keeps it fresh for human readers).
//
// All facts come from lib/tokenFacts.ts (single source of truth).
// All user-facing strings come from lib/tokenPageContent.ts (typed
// per-language content map). Numbers, addresses, plan names, and
// proper nouns are NEVER translated — they always render from
// tokenFacts.ts directly.
//
// Copy rules (per manus, never violate):
//   - Trade tax (1% buy / 2% sell) goes to admin. Full stop. Do NOT
//     connect it to the buyback in any user-facing copy.
//   - Buyback (10% of admin fees → daily auto burn) is a separate,
//     independent mechanism. Render in its own block.
//   - No risk disclaimer text anywhere. No "not financial advice".
//   - Lead with TurboLoop native swap. PancakeSwap is secondary.
//   - Vesting rank == Leadership Program rank (same system).

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  Shield,
  Lock,
  Award,
  Flame,
  Sparkles,
} from "lucide-react";
import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { TokenPriceWidget } from "@components/token/TokenPriceWidget";
import { CopyAddressButton } from "@components/token/CopyAddressButton";
import { TrackedLink } from "@components/token/TrackedLink";
import {
  TOKEN,
  TOKEN_LINKS,
  DEPOSIT_TIERS,
  VESTING_RANKS,
  REWARD_SPLIT,
  BUYBACK,
} from "@lib/tokenFacts";
import {
  TOKEN_PAGE_CONTENT,
  isSupportedLang,
  type SupportedLang,
} from "@lib/tokenPageContent";

export const revalidate = 60;

const CANONICAL = "https://www.turboloop.tech/token";
const OG_IMAGE = "https://www.turboloop.tech/api/og-banner?type=token";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

function pickLang(s: string | undefined): SupportedLang {
  return isSupportedLang(s) ? s : "en";
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { lang: langParam } = await searchParams;
  const lang = pickLang(langParam);
  const content = TOKEN_PAGE_CONTENT[lang];
  const canonical =
    lang === "en" ? CANONICAL : `${CANONICAL}?lang=${lang}`;
  const title = `$${TOKEN.symbol} — ${content.earn_title.replace("$TURBO", "TurboLoop Token")} | ${TOKEN.network}`;
  const desc = content.hero_subtitle_pre + " " + content.hero_subtitle_supply + content.hero_subtitle_post;
  return {
    title,
    description: desc,
    alternates: {
      canonical,
      languages: {
        en: CANONICAL,
        de: `${CANONICAL}?lang=de`,
        hi: `${CANONICAL}?lang=hi`,
        id: `${CANONICAL}?lang=id`,
        "x-default": CANONICAL,
      },
    },
    openGraph: {
      title,
      description: desc,
      url: canonical,
      type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [OG_IMAGE],
    },
  };
}

// Schema.org structured data — Product is the right vocabulary for a
// fungible token in Google's eyes.
function buildJsonLd(lang: SupportedLang) {
  const content = TOKEN_PAGE_CONTENT[lang];
  const desc = content.hero_subtitle_pre + " " + content.hero_subtitle_supply + content.hero_subtitle_post;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${CANONICAL}#token`,
        name: `${TOKEN.name} ($${TOKEN.symbol})`,
        description: desc,
        url: CANONICAL,
        image: OG_IMAGE,
        brand: { "@id": "https://www.turboloop.tech/#organization" },
        category: "Cryptocurrency / DeFi Token",
        sku: TOKEN.contract,
        identifier: TOKEN.contract,
        offers: {
          "@type": "Offer",
          url: TOKEN_LINKS.buyNative,
          priceCurrency: "USD",
          price: TOKEN.launchPrice,
          availability: "https://schema.org/InStock",
          seller: { "@id": "https://www.turboloop.tech/#organization" },
        },
        additionalProperty: [
          { "@type": "PropertyValue", name: "Total Supply", value: TOKEN.totalSupplyFormatted },
          { "@type": "PropertyValue", name: "Network", value: TOKEN.network },
          { "@type": "PropertyValue", name: "Contract Address", value: TOKEN.contract },
          { "@type": "PropertyValue", name: "Buy Tax", value: `${TOKEN.buyTaxPct}%` },
          { "@type": "PropertyValue", name: "Sell Tax", value: `${TOKEN.sellTaxPct}%` },
          { "@type": "PropertyValue", name: "LP Status", value: "100% Locked" },
          { "@type": "PropertyValue", name: "Team Allocation", value: "0%" },
        ],
      },
    ],
  };
}

export default async function TokenPage({ searchParams }: PageProps) {
  const { lang: langParam } = await searchParams;
  const lang = pickLang(langParam);
  const c = TOKEN_PAGE_CONTENT[lang];
  const jsonLd = buildJsonLd(lang);

  return (
    <main className="relative pb-16 md:pb-24" lang={lang}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── A. HERO ──────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-10 md:pt-20 md:pb-14">
        <Container width="default">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--c-brand-cyan)]" />
              <Heading tier="eyebrow" as="span" className="text-[var(--c-text)]">
                {c.hero_eyebrow}
              </Heading>
            </div>

            <Heading tier="display" className="mb-5">
              <span>{c.hero_title_pre}</span>
              <span className="text-brand-wide">${TOKEN.symbol}</span>
              <span>{c.hero_title_post}</span>
            </Heading>

            <p className="text-lg md:text-xl text-[var(--c-text-muted)] mb-8 leading-relaxed max-w-2xl mx-auto">
              {c.hero_subtitle_pre}{" "}
              <strong className="text-[var(--c-text)]">
                {c.hero_subtitle_supply}
              </strong>
              {c.hero_subtitle_post}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center max-w-md sm:max-w-none mx-auto mb-5">
              <TrackedLink
                href={TOKEN_LINKS.buyNative}
                event="token_buy_clicked"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] h-[52px] text-base px-7 text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
              >
                {c.hero_cta_buy} ${TOKEN.symbol}
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </TrackedLink>
              <TrackedLink
                href={TOKEN_LINKS.dexscreener}
                event="token_dexscreener_clicked"
                className="inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-lg)] h-[52px] text-base px-7 bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] transition active:scale-[0.985]"
              >
                {c.hero_cta_chart}
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </TrackedLink>
            </div>

            <TrackedLink
              href={TOKEN_LINKS.bscscanContract}
              event="token_bscscan_clicked"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-brand-cyan)] underline decoration-[var(--c-border)] underline-offset-4 transition"
            >
              {c.hero_cta_bscscan}
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </TrackedLink>
          </div>
        </Container>
      </section>

      {/* ── B. LIVE STATS BAR ────────────────────────────────────── */}
      <Container width="default">
        <TokenPriceWidget variant="full" className="mb-16 md:mb-24" />
      </Container>

      {/* ── C. HOW YOU EARN TOKENS ──────────────────────────────── */}
      <Container width="default">
        <section className="mb-16 md:mb-24">
          <SectionHead
            eyebrow={c.earn_eyebrow}
            title={c.earn_title}
            subtitle={c.earn_subtitle}
          />

          <div className="overflow-x-auto rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[var(--s-sm)] mb-8">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[var(--c-bg)] border-b border-[var(--c-border)]">
                  <th className="text-left px-4 py-3 font-bold text-[var(--c-text)]">
                    {c.earn_table_col_deposit}
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-[var(--c-text)]">
                    {c.earn_table_col_reward}
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEPOSIT_TIERS.map((t, i) => (
                  <tr
                    key={t.label}
                    className={
                      i < DEPOSIT_TIERS.length - 1
                        ? "border-b border-[var(--c-border)]"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 text-[var(--c-text)] tabular-nums">
                      {t.label}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--c-brand-cyan)] tabular-nums">
                      {t.pctLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-[var(--r-xl)] p-5 md:p-6 bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] mb-6">
            <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-brand-cyan)] mb-2">
              {c.earn_example_label}
            </div>
            <p
              className="text-[var(--c-text)] leading-relaxed mb-3"
              dangerouslySetInnerHTML={{
                __html: c.earn_example_intro.replace(
                  /\*\*([^*]+)\*\*/g,
                  '<strong>$1</strong>'
                ),
              }}
            />
            <ul className="grid sm:grid-cols-2 gap-3 text-sm">
              <li className="flex items-baseline gap-2">
                <span className="text-[var(--c-brand-cyan)] font-bold tabular-nums">
                  {REWARD_SPLIT.investorPctLabel}
                </span>
                <span className="text-[var(--c-text-muted)]">
                  {c.earn_example_your_share}
                </span>
                <span className="font-bold text-[var(--c-text)] tabular-nums ml-auto">
                  8,400 ${TOKEN.symbol}
                </span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="text-[var(--c-brand-cyan)] font-bold tabular-nums">
                  {REWARD_SPLIT.referrerPctLabel}
                </span>
                <span className="text-[var(--c-text-muted)]">
                  {c.earn_example_referrer_share}
                </span>
                <span className="font-bold text-[var(--c-text)] tabular-nums ml-auto">
                  3,600 ${TOKEN.symbol}
                </span>
              </li>
            </ul>
            <p className="text-xs text-[var(--c-text-subtle)] mt-3 leading-relaxed">
              {c.earn_example_footnote}
            </p>
          </div>

          <p
            className="text-sm text-[var(--c-text-muted)] leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: c.earn_additive_note.replace(
                /\*\*([^*]+)\*\*/g,
                '<strong>$1</strong>'
              ),
            }}
          />

          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedLink
              href={TOKEN_LINKS.manageInApp}
              event="token_manage_in_app_clicked"
              className="inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-lg)] text-sm font-bold text-white bg-brand shadow-[var(--s-brand)] hover:shadow-[var(--s-xl)] transition active:scale-[0.985]"
            >
              {c.earn_manage_cta}
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </TrackedLink>
            <Link
              href={lang === "en" ? "/calculator" : `/calculator?lang=${lang}`}
              className="inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-lg)] text-sm font-bold bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] shadow-[var(--s-sm)] hover:shadow-[var(--s-md)] transition active:scale-[0.985]"
            >
              {c.earn_calculator_cta}
            </Link>
          </div>
        </section>
      </Container>

      {/* ── D. VESTING SCHEDULE ──────────────────────────────────── */}
      <Container width="default">
        <section className="mb-16 md:mb-24">
          <SectionHead
            eyebrow={c.vesting_eyebrow}
            title={c.vesting_title}
            subtitle={c.vesting_subtitle}
          />

          <div className="overflow-x-auto rounded-[var(--r-xl)] border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[var(--s-sm)] mb-6">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[var(--c-bg)] border-b border-[var(--c-border)]">
                  <th className="text-left px-4 py-3 font-bold text-[var(--c-text)]">
                    {c.vesting_table_col_rank}
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-[var(--c-text)]">
                    {c.vesting_table_col_monthly}
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-[var(--c-text)] hidden sm:table-cell">
                    {c.vesting_table_col_full}
                  </th>
                </tr>
              </thead>
              <tbody>
                {VESTING_RANKS.map((r, i) => (
                  <tr
                    key={r.slug}
                    className={
                      i < VESTING_RANKS.length - 1
                        ? "border-b border-[var(--c-border)]"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 text-[var(--c-text)] font-bold">
                      {r.name}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--c-brand-cyan)] font-bold tabular-nums">
                      {r.monthlyUnlockLabel}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--c-text-muted)] tabular-nums hidden sm:table-cell">
                      ~{r.monthsToFull}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-[var(--c-text-muted)] leading-relaxed">
            <Link
              href="/blog/community-leadership-path-building-globally"
              className="text-[var(--c-brand-cyan)] font-bold hover:underline"
            >
              {c.vesting_leadership_link_text}
            </Link>
            .
          </p>
        </section>
      </Container>

      {/* ── E. DEFLATIONARY MECHANISM ───────────────────────────── */}
      <Container width="default">
        <section className="mb-16 md:mb-24">
          <SectionHead
            eyebrow={c.deflationary_eyebrow}
            title={c.deflationary_title}
            subtitle={c.deflationary_subtitle}
          />

          <div className="rounded-[var(--r-xl)] p-5 md:p-6 bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] mb-6">
            <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-brand-cyan)] mb-3">
              {c.deflationary_flow_label}
            </div>
            <div className="grid md:grid-cols-4 gap-3 md:gap-2 items-center">
              <FlowStep emoji="💰" label={c.deflationary_step_fees} />
              <FlowArrow label={`${BUYBACK.fundingPctOfAdminFees}%`} />
              <FlowStep emoji="🤖" label={c.deflationary_step_buyback} />
              <FlowArrow label="burn" />
            </div>
            <div className="mt-3 text-center">
              <FlowStep emoji="🔥" label={c.deflationary_step_burn} />
            </div>
            <p className="text-xs text-[var(--c-text-subtle)] mt-5 leading-relaxed text-center">
              {c.deflationary_burn_caption}{" "}
              <TrackedLink
                href={TOKEN_LINKS.bscscanBuyback}
                event="token_bscscan_clicked"
                className="text-[var(--c-brand-cyan)] hover:underline font-bold"
              >
                {c.deflationary_bscscan_link}
              </TrackedLink>
              .
            </p>
          </div>

          {/* Trade-tax block — SEPARATE per manus directive. Does NOT
              connect to the buyback above. */}
          <div className="rounded-[var(--r-xl)] p-5 md:p-6 bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)]">
            <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-3">
              {c.trade_tax_label}
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[var(--c-text)] tabular-nums">
                  {TOKEN.buyTaxPct}%
                </span>
                <span className="text-sm text-[var(--c-text-muted)]">
                  {c.trade_tax_buy_label}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[var(--c-text)] tabular-nums">
                  {TOKEN.sellTaxPct}%
                </span>
                <span className="text-sm text-[var(--c-text-muted)]">
                  {c.trade_tax_sell_label}
                </span>
              </div>
            </div>
            <p className="text-sm text-[var(--c-text-muted)] leading-relaxed">
              {c.trade_tax_explainer}
            </p>
          </div>
        </section>
      </Container>

      {/* ── F. SECURITY & TRANSPARENCY ──────────────────────────── */}
      <Container width="default">
        <section className="mb-16 md:mb-24">
          <SectionHead
            eyebrow={c.security_eyebrow}
            title={c.security_title}
            subtitle={c.security_subtitle}
          />

          <div className="grid md:grid-cols-2 gap-3 md:gap-4 mb-8">
            <SecurityBadge
              icon={Lock}
              label={c.security_lp_label}
              detail={c.security_lp_detail}
              href={TOKEN_LINKS.lpCreateTx}
              linkLabel={c.security_lp_link}
            />
            <SecurityBadge
              icon={Award}
              label={c.security_team_label}
              detail={c.security_team_detail}
            />
            <SecurityBadge
              icon={Shield}
              label={c.security_insider_label}
              detail={c.security_insider_detail}
            />
            <SecurityBadge
              icon={Flame}
              label={c.security_renounce_label}
              detail={c.security_renounce_detail}
              href={TOKEN_LINKS.tokenRenounceTx}
              linkLabel={c.security_renounce_link}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-3 md:gap-4">
            <AddressCard
              label={c.security_token_contract_label}
              address={TOKEN.contract}
              scanUrl={TOKEN_LINKS.bscscanContract}
            />
            <AddressCard
              label={c.security_pair_label}
              address={TOKEN.pair}
              scanUrl={TOKEN_LINKS.bscscanPair}
            />
            <AddressCard
              label={c.security_buyback_contract_label}
              address={TOKEN.buybackContract}
              scanUrl={TOKEN_LINKS.bscscanBuyback}
            />
          </div>
        </section>
      </Container>

      {/* ── G. WHERE TO BUY / SELL ──────────────────────────────── */}
      <Container width="default">
        <section className="mb-12 md:mb-16">
          <SectionHead
            eyebrow={c.trade_eyebrow}
            title={c.trade_title}
            subtitle={c.trade_subtitle}
          />

          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            <div
              className="relative rounded-[var(--r-xl)] p-5 md:p-7 overflow-hidden text-white shadow-[var(--s-xl)]"
              style={{
                background:
                  "linear-gradient(135deg, var(--c-brand-cyan) 0%, var(--c-brand-purple, #7C3AED) 100%)",
              }}
            >
              <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-white/80 mb-2">
                {c.trade_native_badge}
              </div>
              <Heading tier="h2" className="mb-2 text-white">
                {c.trade_native_title}
              </Heading>
              <p className="text-sm md:text-base text-white/85 leading-relaxed mb-5">
                {c.trade_native_subtitle}
              </p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <TrackedLink
                  href={TOKEN_LINKS.buyNative}
                  event="token_buy_clicked"
                  className="inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-md)] text-sm font-bold bg-white text-[var(--c-brand-cyan)] hover:bg-white/95 active:scale-[0.985] shadow-[var(--s-md)] transition"
                >
                  {c.trade_native_buy_cta} ${TOKEN.symbol}
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </TrackedLink>
                <TrackedLink
                  href={TOKEN_LINKS.sellNative}
                  event="token_sell_clicked"
                  className="inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-md)] text-sm font-bold text-white bg-white/15 hover:bg-white/25 active:scale-[0.985] transition"
                >
                  {c.trade_native_sell_cta} ${TOKEN.symbol}
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </TrackedLink>
              </div>
            </div>

            <div className="rounded-[var(--r-xl)] p-5 md:p-7 bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-md)]">
              <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
                {c.trade_pancake_badge}
              </div>
              <Heading tier="h2" className="mb-2">
                {c.trade_pancake_title}
              </Heading>
              <p className="text-sm md:text-base text-[var(--c-text-muted)] leading-relaxed mb-5">
                {c.trade_pancake_subtitle}
              </p>
              <div className="flex flex-wrap gap-3">
                <TrackedLink
                  href={TOKEN_LINKS.pancakeswap}
                  event="token_pancakeswap_clicked"
                  className="inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-md)] text-sm font-bold bg-[var(--c-bg)] text-[var(--c-text)] border border-[var(--c-border)] hover:bg-[var(--c-surface)] active:scale-[0.985] shadow-[var(--s-sm)] transition"
                >
                  {c.trade_pancake_cta}
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </TrackedLink>
                <TrackedLink
                  href={TOKEN_LINKS.dexscreener}
                  event="token_dexscreener_clicked"
                  className="inline-flex items-center gap-2 px-5 h-12 rounded-[var(--r-md)] text-sm font-bold bg-[var(--c-bg)] text-[var(--c-text)] border border-[var(--c-border)] hover:bg-[var(--c-surface)] active:scale-[0.985] shadow-[var(--s-sm)] transition"
                >
                  {c.trade_pancake_chart_cta}
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}

// ── Small presentational helpers ────────────────────────────────

function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 md:mb-8 max-w-2xl">
      <Heading
        tier="eyebrow"
        className="text-[var(--c-brand-cyan)] mb-2 inline-block"
      >
        {eyebrow}
      </Heading>
      <Heading tier="h2" className="mb-3">
        {title}
      </Heading>
      <p className="text-[var(--c-text-muted)] leading-relaxed">{subtitle}</p>
    </div>
  );
}

function FlowStep({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-2 justify-center px-3 py-3 rounded-[var(--r-md)] bg-[var(--c-bg)] border border-[var(--c-border)] text-center">
      <span className="text-xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-xs md:text-sm font-bold text-[var(--c-text)] leading-tight">
        {label}
      </span>
    </div>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div
      className="text-center text-[var(--c-text-subtle)] text-xs font-bold"
      aria-hidden="true"
    >
      <span className="block md:hidden">↓ {label} ↓</span>
      <span className="hidden md:block">→ {label} →</span>
    </div>
  );
}

function SecurityBadge({
  icon: Icon,
  label,
  detail,
  href,
  linkLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="rounded-[var(--r-xl)] p-4 md:p-5 bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)] flex gap-3 md:gap-4">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 bg-brand shadow-[var(--s-brand)]">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <div className="font-bold text-[var(--c-text)] text-sm md:text-base mb-1">
          ✅ {label}
        </div>
        <p className="text-xs md:text-sm text-[var(--c-text-muted)] leading-relaxed">
          {detail}
        </p>
        {href && linkLabel && (
          <TrackedLink
            href={href}
            event="token_bscscan_clicked"
            className="inline-flex items-center gap-1 text-xs text-[var(--c-brand-cyan)] hover:underline font-bold mt-2"
          >
            {linkLabel}
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </TrackedLink>
        )}
      </div>
    </div>
  );
}

function AddressCard({
  label,
  address,
  scanUrl,
}: {
  label: string;
  address: string;
  scanUrl: string;
}) {
  return (
    <div className="rounded-[var(--r-xl)] p-4 bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[var(--s-sm)]">
      <div className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-[var(--c-text-subtle)] mb-2">
        {label}
      </div>
      <code className="block text-[11px] md:text-xs font-mono text-[var(--c-text)] break-all leading-relaxed mb-3">
        {address}
      </code>
      <div className="flex gap-2">
        <CopyAddressButton address={address} />
        <TrackedLink
          href={scanUrl}
          event="token_bscscan_clicked"
          className="inline-flex items-center gap-1 text-xs text-[var(--c-brand-cyan)] hover:underline font-bold ml-auto"
        >
          BscScan
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </TrackedLink>
      </div>
    </div>
  );
}
