// HomeGlobalReelsSection — the homepage's multi-language reels strip.
// Server component wrapper that statically renders the section header
// + aurora background, then delegates the interactive tab + grid to
// a client island (HomeGlobalReelsTabs). The multi-lingual reel data
// is imported here (server-side bundle) and passed as a prop, so the
// client receives the already-resolved URL list instead of having to
// fetch anything.
//
// NOTE: This is intentionally distinct from HomeReelsSection.tsx —
// that one carousels the DB-backed English reels and stays untouched.
// This section is the new "in every language" companion.

import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import {
  MULTI_LANG_REELS,
  REEL_LANGUAGES,
  type ReelLang,
} from "@lib/reelsData";
import { HomeGlobalReelsTabs } from "./HomeGlobalReelsTabs";

export function HomeGlobalReelsSection({ defaultLang }: { defaultLang?: ReelLang }) {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Aurora wash — same drift keyframe as the homepage hero, but
          tinted slightly purple-forward so this section feels
          distinct from the cyan-heavy "Watch the Movement" carousel
          immediately above it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none aurora-bg"
        style={{
          background:
            "radial-gradient(ellipse 900px 500px at 15% 25%, rgba(167,139,250,0.06), transparent 60%), " +
            "radial-gradient(ellipse 700px 450px at 85% 70%, rgba(34,211,238,0.05), transparent 60%)",
        }}
      />

      <Container width="default">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-purple)] mb-3 inline-block"
          >
            In Every Language
          </Heading>
          <Heading tier="h1" as="h2">
            The Movement,{" "}
            <span className="text-brand-wide">Worldwide.</span>
          </Heading>
          <p className="mt-4 text-[var(--c-text-muted)] max-w-xl mx-auto leading-relaxed">
            Mobile-first walkthroughs of how to deposit, how to withdraw,
            how your returns work, and how to verify the LP lock yourself —
            translated and dubbed in 15 languages — select your language above.
          </p>
        </div>

        <HomeGlobalReelsTabs
          reelsByLang={MULTI_LANG_REELS}
          languages={[...REEL_LANGUAGES]}
          defaultLang={defaultLang}
        />
      </Container>
    </section>
  );
}
