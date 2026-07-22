// "Editorial" — blog section on the homepage with interactive language tabs.
// Server component fetches the top 5 posts per language at build time (ISR 5 min);
// passes them to the HomeBlogLanguagePicker client island which filters
// and displays the 3 most-recent posts for the selected language.
// Zero extra API calls on tab switch — all data is already in the bundle.
//
// PERF FIX (Jul 2026): Previously called api.blogPostsList() which returned
// ALL 4,700+ posts (6 MB JSON → 4 MB RSC payload → 13s homepage load time).
// Now calls api.blogPostsHomepage() which returns only the top 5 posts per
// language (~75 posts total, ~100 KB). The homepage only shows 3 posts at a
// time, so 5 per language is more than enough.
//
// locale: the next-intl locale code from the current route. Passed through
// to HomeBlogLanguagePicker so the correct language tab is pre-selected.
// The picker is keyed by locale so it remounts cleanly on locale change.

import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { api } from "@lib/api";
import { HomeBlogLanguagePicker } from "./HomeBlogLanguagePicker";

interface Props {
  /** next-intl locale code, e.g. "th", "ko", "en". Defaults to "en". */
  locale?: string;
}

export async function HomeBlogSection({ locale }: Props = {}) {
  let allPosts = [];
  try {
    // Use the homepage-optimised endpoint (top 5 per language, ~75 posts total)
    // instead of blogPostsList (all 4,700+ posts, 6 MB → 4 MB RSC payload).
    const all = await api.blogPostsHomepage();
    allPosts = all.filter(p => p.published);
  } catch {
    return null;
  }

  if (allPosts.length === 0) return null;

  return (
    <section className="py-12 md:py-20">
      <Container width="default">
        <div className="mb-8 md:mb-10">
          <Heading
            tier="eyebrow"
            className="text-[var(--c-brand-cyan)] mb-3 inline-block"
          >
            Editorial
          </Heading>
          <Heading tier="h1" as="h2">
            Read <span className="text-brand-wide">deeper.</span>
          </Heading>
        </div>

        {/* key={locale} forces remount on locale change so initialLang resets */}
        <HomeBlogLanguagePicker
          key={locale ?? "en"}
          allPosts={allPosts}
          initialLocale={locale}
        />
      </Container>
    </section>
  );
}
