// Design tokens — the single source of truth for the visual language.
//
// The previous SPA had ~12 different gradient definitions, ~8 button
// shapes, ~5 different shadow values, all sprinkled inline as
// style={{ ... }}. That's why the site felt inconsistent. From here on,
// every component reads from this file. If you want to change the brand
// gradient, you change ONE line — not 200.

export const tokens = {
  // ── Color ──────────────────────────────────────────────────────────
  // Brand palette is intentionally tight: cyan → purple is the gradient
  // we own. Everything else is neutrals + semantic.
  color: {
    brand: {
      cyan: "#0891B2",
      cyanLight: "#22D3EE",
      cyanDeep: "#0E7490",
      purple: "#7C3AED",
      purpleLight: "#A78BFA",
      purpleDeep: "#5B21B6",
      // The gradient that defines TurboLoop. Used for primary CTAs
      // and the hero "Loop" wordmark.
      gradient: "linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)",
      gradientWide:
        "linear-gradient(135deg, #0891B2 0%, #22D3EE 50%, #7C3AED 100%)",
    },
    // Light theme neutrals (Tailwind's slate scale, named for intent).
    light: {
      bg: "#F7F8FC",
      surface: "#FFFFFF",
      border: "rgba(15,23,42,0.08)",
      borderStrong: "rgba(15,23,42,0.16)",
      text: "#0F172A",
      textMuted: "#64748B",
      textSubtle: "#94A3B8",
    },
    // Dark theme neutrals. Built mobile-first because crypto-native
    // users browse late at night on their phones — this needs to be
    // the default for many users.
    dark: {
      bg: "#0F172A",
      surface: "#1E293B",
      border: "rgba(255,255,255,0.08)",
      borderStrong: "rgba(255,255,255,0.16)",
      text: "#F8FAFC",
      textMuted: "#CBD5E1",
      textSubtle: "#64748B",
    },
    // Semantic colors — same in light and dark (they pop on both bgs).
    semantic: {
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#EF4444",
      info: "#0891B2",
    },
  },

  // ── Typography scale ───────────────────────────────────────────────
  // Strict, geometric scale. Every text element on the site MUST use one
  // of these. The previous SPA had text-sm, text-base, text-lg, text-xl,
  // text-2xl etc all over with no consistent hierarchy. Below is the
  // narrative: Display → Heading → Title → Body → Caption.
  text: {
    display: {
      // Hero "Turbo Loop" — only one of these per page max.
      size: "clamp(2.75rem, 8vw, 5rem)",
      lineHeight: "1.05",
      weight: "800",
      tracking: "-0.04em",
    },
    heading1: {
      // Section heading like "Watch The Movement"
      size: "clamp(2rem, 5vw, 3rem)",
      lineHeight: "1.1",
      weight: "700",
      tracking: "-0.025em",
    },
    heading2: {
      // Sub-section heading
      size: "clamp(1.5rem, 4vw, 2rem)",
      lineHeight: "1.15",
      weight: "700",
      tracking: "-0.02em",
    },
    title: {
      // Card titles, blog post titles in lists
      size: "1.125rem",
      lineHeight: "1.35",
      weight: "600",
      tracking: "-0.005em",
    },
    body: {
      // Default reading text
      size: "1rem",
      lineHeight: "1.6",
      weight: "400",
      tracking: "0",
    },
    bodySmall: {
      // Secondary text, descriptions
      size: "0.875rem",
      lineHeight: "1.55",
      weight: "400",
      tracking: "0",
    },
    caption: {
      // Labels, metadata
      size: "0.75rem",
      lineHeight: "1.5",
      weight: "500",
      tracking: "0.02em",
    },
    // For pill labels, eyebrow text — uppercase + heavily letter-spaced.
    eyebrow: {
      size: "0.6875rem",
      lineHeight: "1",
      weight: "700",
      tracking: "0.2em",
    },
  },

  // ── Spacing scale ──────────────────────────────────────────────────
  // 4px base. Every margin/padding picks from here. No arbitrary values.
  space: {
    xs: "0.25rem", //  4px
    sm: "0.5rem", //   8px
    md: "0.75rem", // 12px
    base: "1rem", //   16px
    lg: "1.5rem", //  24px
    xl: "2rem", //    32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
    "4xl": "6rem", // 96px
    "5xl": "8rem", // 128px
  },

  // ── Border radius ──────────────────────────────────────────────────
  radius: {
    sm: "0.375rem", //  6px — for tags, small chips
    md: "0.625rem", // 10px — for inputs
    lg: "0.875rem", // 14px — for buttons
    xl: "1.25rem", //  20px — for cards
    "2xl": "1.75rem", // 28px — for large cards / modals
    full: "9999px", //         pill / circle
  },

  // ── Shadow scale ───────────────────────────────────────────────────
  // Tier 1 (sm) = floating slightly off the page. Tier 4 (xl) = modal /
  // notification (very prominent). The old codebase used wildly different
  // shadow definitions; this scale replaces all of them.
  shadow: {
    sm: "0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.06)",
    md: "0 4px 14px -4px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04)",
    lg: "0 12px 30px -8px rgba(15,23,42,0.12), 0 4px 14px -4px rgba(15,23,42,0.06)",
    xl: "0 24px 60px -16px rgba(15,23,42,0.18), 0 8px 24px -8px rgba(15,23,42,0.08)",
    // Brand-tinted shadow for primary CTAs — the gradient beneath the button.
    brand: "0 12px 30px -8px rgba(8,145,178,0.45), 0 4px 14px -4px rgba(124,58,237,0.25)",
  },

  // ── Motion ─────────────────────────────────────────────────────────
  // Three durations only. No more "0.18s, 0.2s, 0.25s, 0.3s" bickering.
  // Honors prefers-reduced-motion at the CSS level.
  motion: {
    instant: "100ms", // Press feedback, hover state changes
    quick: "200ms", //   Most UI transitions, tab switches
    smooth: "350ms", //  Page transitions, modal opens, dramatic effects
    // Easings
    standard: "cubic-bezier(0.4, 0, 0.2, 1)", // Default, ~all uses
    decelerate: "cubic-bezier(0, 0, 0.2, 1)", // Entering motion
    accelerate: "cubic-bezier(0.4, 0, 1, 1)", // Exiting motion
    spring: "cubic-bezier(0.16, 1, 0.3, 1)", //  Bouncy / playful
  },

  // ── Layout ─────────────────────────────────────────────────────────
  // Mobile-first content widths. The site is designed at 375px first;
  // wider screens just get more breathing room.
  layout: {
    // Page gutter on mobile (thumb-safe).
    gutterMobile: "1.25rem", // 20px
    gutterDesktop: "2rem", //   32px
    // Max content widths.
    contentNarrow: "640px", //  Reading column (blog posts).
    contentDefault: "1080px", // Most marketing pages.
    contentWide: "1280px", //   Hero, full-bleed sections.
    // Mobile bottom CTA bar height (safe-area inclusive).
    mobileCTABarHeight: "76px",
    // Top nav heights.
    navHeightMobile: "56px",
    navHeightDesktop: "72px",
  },

  // ── Z-index scale ──────────────────────────────────────────────────
  // Named layers — never use arbitrary z-index values.
  z: {
    base: 0,
    raised: 10,
    sticky: 20, //   sticky nav
    overlay: 40, //  page-fixed overlays (background gradients)
    nav: 50, //      top navbar above content
    mobileCTA: 60, // bottom mobile CTA bar above nav
    modal: 70, //    full-screen modals
    toast: 80, //    toast notifications
    install: 90, //  install prompt (lowest priority interactive)
  },
} as const;

export type Tokens = typeof tokens;
