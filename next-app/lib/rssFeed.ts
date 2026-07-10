// Shared RSS 2.0 feed builder.
//
// Used by all four /feed.*.xml routes:
//   /feed.xml      — English (default + back-compat with existing
//                    feedreader subscriptions that point at this URL)
//   /feed.de.xml   — German
//   /feed.hi.xml   — Hindi
//   /feed.id.xml   — Indonesian
//
// The English feed is the primary subscription point — splitting by
// language exists so DE/HI/ID-speaking readers can subscribe to a
// single-language feed without mixed-language clutter, and so Google
// Reader equivalents (Feedly, Inoreader, NetNewsWire) can apply the
// correct language hint for spell-check, TTS, and read-aloud.

import { api, BLOG_LANGUAGES, type BlogLanguage, type BlogPost } from "./api";

const SITE = "https://www.turboloop.tech";

// RFC-3066 language tags per feed. RSS 2.0's <language> element wants
// these specifically (not BCP-47 like the rest of our SEO stack).
const RSS_LANG: Record<BlogLanguage, string> = {
  en: "en-us",
  de: "de-de",
  hi: "hi-in",
  id: "id-id",
  th: "th-th",
  ko: "ko-kr",
  lo: "lo-la",
  fr: "fr-fr",
  ta: "ta-in",
  la: "lo-la",
  cn: "zh-cn",
  es: "es-es",
  ng: "en-ng",
  it: "it-it",
  sa: "ar-sa",
  kr: "ko-kr",
  pk: "ur-pk",
};

// Per-language feed metadata. Keeps the channel <title> + <description>
// native to the audience rather than always reading in English.
const CHANNEL_META: Record<
  BlogLanguage,
  { title: string; description: string }
> = {
  en: {
    title: "Turbo Loop — Editorial",
    description:
      "Long-form articles on DeFi, yield, security, and the math behind TurboLoop.",
  },
  de: {
    title: "Turbo Loop — Redaktion",
    description:
      "Langform-Artikel über DeFi, Renditen, Sicherheit und die Mathematik hinter TurboLoop.",
  },
  hi: {
    title: "Turbo Loop — संपादकीय",
    description:
      "DeFi, यील्ड, सुरक्षा और TurboLoop के पीछे के गणित पर विस्तृत लेख।",
  },
  id: {
    title: "Turbo Loop — Editorial",
    description:
      "Artikel mendalam tentang DeFi, yield, keamanan, dan matematika di balik TurboLoop.",
  },
  th: {
    title: "Turbo Loop — บทบรรณาธิการ",
    description:
      "บทความเชิงลึกเกี่ยวกับ DeFi, ผลตอบแทน, ความปลอดภัย และคณิตศาสตร์เบื้องหลัง TurboLoop.",
  },
  ko: {
    title: "Turbo Loop — 에디토리얼",
    description:
      "DeFi, 수익, 보안 및 TurboLoop의 수학에 관한 심층 기사.",
  },
  lo: {
    title: "Turbo Loop — ບົດບັນນາທິການ",
    description:
      "ບົດຄວາມລະອຽດກ່ຽວກັບ DeFi, ຜົນຕອບແທນ, ຄວາມປອດໄພ ແລະ ຄະນິດສາດທີ່ຢູ່ເບື້ອງຼັງ TurboLoop.",
  },
  fr: {
    title: "Turbo Loop — Éditorial",
    description:
      "Articles approfondis sur la DeFi, le rendement, la sécurité et les mathématiques derrière TurboLoop.",
  },
  ta: {
    title: "Turbo Loop — தலையங்கம்",
    description:
      "DeFi, வருமானம், பாதுகாப்பு மற்றும் TurboLoop பின்னணியிலுள்ள கணிதம் பற்றிய ஆழமான கட்டுரைகள்.",
  },
  la: {
    title: "Turbo Loop — ບົດບັນນາທິການ",
    description:
      "ບົດຄວາມລະອຽດກ່ຽວກັບ DeFi, ຜົນຕອບແທນ, ຄວາມປອດໄພ ແລະ ຄະນິດສາດທີ່ຢູ່ເບື້ອງຼັງ TurboLoop.",
  },
  cn: {
    title: "Turbo Loop — 社论",
    description:
      "关于DeFi、收益、安全以及TurboLoop背后数学的深度文章。",
  },
  es: {
    title: "Turbo Loop — Editorial",
    description:
      "Artículos en profundidad sobre DeFi, rendimiento, seguridad y las matemáticas detrás de TurboLoop.",
  },
  ng: {
    title: "Turbo Loop — Editorial",
    description:
      "Long articles about DeFi, yield, security, and the math wey dey behind TurboLoop.",
  },
  it: {
    title: "Turbo Loop — Editoriale",
    description:
      "Articoli approfonditi su DeFi, rendimento, sicurezza e la matematica dietro TurboLoop.",
  },
  sa: {
    title: "Turbo Loop — افتتاحية",
    description:
      "مقالات متعمقة حول التمويل اللامركزي والعائد والأمان والرياضيات وراء TurboLoop.",
  },
  kr: {
    title: "Turbo Loop — 에디토리얼",
    description:
      "DeFi, 수익, 보안 및 TurboLoop의 수학에 관한 심층 기사.",
  },
  pk: {
    title: "Turbo Loop — اداریہ",
    description:
      "DeFi، منافع، سیکیورٹی اور TurboLoop کے پیچھے ریاضی پر گہرائی سے مضامین۔",
  },
};

function escape(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function selfHrefFor(lang: BlogLanguage): string {
  return lang === "en" ? `${SITE}/feed.xml` : `${SITE}/feed.${lang}.xml`;
}

/** Build an RSS 2.0 XML body for a single-language feed. Filters the
 *  shared post catalogue to the requested language, sorts newest-first
 *  by published date (scheduledPublishAt when set, createdAt fallback),
 *  and caps at 50 items (typical RSS reader display budget).
 *
 *  On API failure, returns a valid feed with zero items rather than
 *  500ing — feedreaders treat an empty channel as "no new items" and
 *  retry on their next poll, which is the right behaviour. */
export async function buildRssFeed(lang: BlogLanguage): Promise<string> {
  let posts: BlogPost[] = [];
  try {
    posts = await api.blogPosts();
  } catch {
    posts = [];
  }

  const items = posts
    .filter(p => p.published && p.language === lang)
    .sort((a, b) => {
      const aT = new Date(a.scheduledPublishAt ?? a.createdAt).getTime();
      const bT = new Date(b.scheduledPublishAt ?? b.createdAt).getTime();
      return bT - aT;
    })
    .slice(0, 50)
    .map(p => {
      const url = `${SITE}/blog/${p.slug}`;
      const date = new Date(
        p.scheduledPublishAt ?? p.createdAt
      ).toUTCString();
      return `
    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${escape(p.excerpt ?? "")}</description>
    </item>`;
    })
    .join("");

  const meta = CHANNEL_META[lang];
  const rssLang = RSS_LANG[lang];
  const selfHref = selfHrefFor(lang);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(meta.title)}</title>
    <link>${SITE}/blog</link>
    <description>${escape(meta.description)}</description>
    <language>${rssLang}</language>
    <atom:link href="${selfHref}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

export const RSS_CACHE_HEADER =
  "public, s-maxage=600, stale-while-revalidate=86400";

// Re-export the language list so callers can iterate it for routing.
export { BLOG_LANGUAGES };
export type { BlogLanguage };
