// WallOfProof — masonry-style photo gallery shown just below the
// /events hero. Pulls from WALL_OF_PROOF in lib/eventsData.ts and lays
// images out using CSS columns so they tile naturally without explicit
// layout JS.
//
// Each tile renders a placeholder gradient as the background so the
// section still looks intentional when the real /images/events/* JPGs
// haven't been dropped into next-app/public yet. Real photos load on
// top of the gradient via <Image> with `unoptimized` (so missing files
// silently fall back to the gradient rather than crashing optimization).

import Image from "next/image";
import { WALL_OF_PROOF } from "@lib/eventsData";

// Per-tile aspect-ratio pool so the masonry grid feels organic instead
// of every tile being identical. Cycle through these by index.
const ASPECT_RATIOS = [
  "4 / 5",
  "1 / 1",
  "3 / 4",
  "4 / 3",
  "5 / 4",
  "1 / 1",
  "3 / 4",
  "4 / 5",
];

// Per-tile gradient backstop — appears in light + dark, brand-tinted so
// missing-file states still look on-brand. Sequence matches ASPECT_RATIOS.
const GRADIENTS = [
  "linear-gradient(135deg, #0891B2 0%, #1E40AF 100%)",
  "linear-gradient(135deg, #7C3AED 0%, #1E1B4B 100%)",
  "linear-gradient(135deg, #10B981 0%, #0891B2 100%)",
  "linear-gradient(135deg, #EC4899 0%, #7C3AED 100%)",
  "linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)",
  "linear-gradient(135deg, #22D3EE 0%, #7C3AED 100%)",
  "linear-gradient(135deg, #1E40AF 0%, #0F172A 100%)",
  "linear-gradient(135deg, #A78BFA 0%, #1E1B4B 100%)",
];

export function WallOfProof() {
  return (
    <section
      aria-label="Past meetup photos"
      className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4 [&>*]:mb-3 md:[&>*]:mb-4"
    >
      {WALL_OF_PROOF.map((item, i) => (
        <div
          key={item.src}
          className="relative block w-full rounded-[var(--r-lg)] overflow-hidden shadow-[var(--s-md)] break-inside-avoid"
          style={{
            aspectRatio: ASPECT_RATIOS[i % ASPECT_RATIOS.length],
            background: GRADIENTS[i % GRADIENTS.length],
          }}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover hover:scale-105 transition-transform duration-700"
            loading="lazy"
            // unoptimized so missing /images/events/*.jpg files just don't
            // render — the gradient backstop above shows through, the
            // build doesn't fail. Swap to optimized once real files land.
            unoptimized
          />
          {/* Subtle bottom-fade so text on top of the wall is legible
              if we ever overlay one. Purely decorative. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"
          />
        </div>
      ))}
    </section>
  );
}
