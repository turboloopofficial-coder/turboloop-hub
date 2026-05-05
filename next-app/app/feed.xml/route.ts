// /feed.xml — RSS 2.0 feed of published blog posts.
// Build-time fetch from the legacy API; revalidates every 10 min.

import { api } from "@lib/api";

export const revalidate = 600;

const SITE = "https://turboloop.tech";

function escape(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let items = "";
  try {
    const posts = await api.blogPosts();
    items = posts
      .filter(p => p.published)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 50)
      .map(p => {
        const url = `${SITE}/blog/${p.slug}`;
        const date = new Date(p.createdAt).toUTCString();
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
  } catch {
    items = "";
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Turbo Loop — Editorial</title>
    <link>${SITE}/blog</link>
    <description>Long-form articles on DeFi, yield, security, and the math behind TurboLoop.</description>
    <language>en-us</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
