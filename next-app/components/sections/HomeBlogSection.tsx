// "Editorial" — blog section on the homepage with interactive language tabs.
// Server component fetches all published posts at build time (ISR 5 min);
// passes them to the HomeBlogLanguagePicker client island which filters
// and displays the 3 most-recent posts for the selected language.
// Zero extra API calls on tab switch — all data is already in the bundle.

import { Container } from "@components/ui/Container";
import { Heading } from "@components/ui/Heading";
import { api } from "@lib/api";
import { HomeBlogLanguagePicker } from "./HomeBlogLanguagePicker";

export async function HomeBlogSection() {
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

        <HomeBlogLanguagePicker allPosts={allPosts} />
      </Container>
    </section>
  );
}
