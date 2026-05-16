// Server-side HTML sanitizer for marked-rendered markdown.
//
// Replaces isomorphic-dompurify, which had a runtime crash in Vercel's
// node lambda (a transitive dep — @exodus/bytes — is ESM-only but
// imported via require() from html-encoding-sniffer/jsdom). sanitize-html
// is pure-node, no JSDOM dependency, no ESM/CJS interop issue.
//
// Config is intentionally close to DOMPurify's defaults so the swap is
// drop-in: we allow the markdown-y tag set (headings, lists, code,
// tables, blockquote) plus images, links with safe href schemes, and
// pre/code with class attributes for syntax highlighting. Anything not
// on the list — script, iframe, on* event attrs, style, etc. — is
// stripped before render.

import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  // Block
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "ul", "ol", "li", "blockquote", "hr", "br",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "pre", "code",
  "details", "summary",
  // Inline
  "a", "strong", "em", "b", "i", "u", "s", "del", "ins", "mark",
  "sub", "sup", "small", "abbr", "cite", "q", "kbd", "samp", "var",
  // Media
  "img", "figure", "figcaption",
  // Layout (markdown sometimes emits div)
  "div", "span",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "name", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  // Code blocks with syntax-highlighter classes survive intact.
  code: ["class"],
  pre: ["class"],
  // Common attributes that are safe + frequently emitted by markdown.
  "*": ["id", "class"],
};

/** Sanitize raw HTML (typically the output of marked.parse). Returns a
 *  cleaned string safe to drop into dangerouslySetInnerHTML. */
export function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    // Match DOMPurify's default — strip javascript:, data:, vbscript: URLs.
    allowedSchemes: ["http", "https", "mailto", "tel"],
    // Auto-add rel="noopener noreferrer" to any a[target=_blank].
    transformTags: {
      a: (tagName, attribs) => {
        if (attribs.target === "_blank") {
          attribs.rel = "noopener noreferrer";
        }
        return { tagName, attribs };
      },
    },
  });
}
