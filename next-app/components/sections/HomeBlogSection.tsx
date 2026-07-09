// "Editorial" — blog section on the homepage with interactive language tabs.
// Server component fetches all published posts at build time (ISR 5 min);
// passes them to the HomeBlogLanguagePicker client island which filters
// and displays the 3 most-recent posts for the selected language.
// Zero extra API calls on tab switch — all data is already in the bundle.
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
    const all = await api.blogPostsList();
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
