// Pre-processor for markdown content before it reaches `marked`.
//
// Handles two things `marked`'s default config doesn't:
//
//   1. GFM-style alerts (> [!KEY] / [!TIP] / [!INFO] / [!WARN] /
//      [!NOTE] / [!IMPORTANT] / [!CAUTION]). Default `marked` would
//      render `> [!KEY]\n> Body text` as a vanilla blockquote with
//      "[!KEY]" appearing as literal text inside it. We pre-substitute
//      the block with native HTML (`<aside class="callout callout-X">`)
//      so the styled callouts render correctly and the bracketed tag
//      never reaches the user.
//
//   2. Data-corruption recovery — a handful of older blog posts were
//      stored with the literal 2-char sequence `\n` (backslash + n)
//      instead of real newlines. When marked sees that, it renders the
//      whole body as a single paragraph with `\n` text inside. We
//      detect rows that have many literal `\n` and ZERO real newlines
//      and convert the escapes to real newlines so they render properly.
//      Belt-and-suspenders alongside the one-time DB UPDATE that fixed
//      the same rows (in case a future seed script reintroduces the
//      bug, the renderer survives it).
//
// All of this runs server-side as a string transform before marked.

const ALERT_TYPES = ["KEY", "TIP", "INFO", "WARN", "NOTE", "IMPORTANT", "CAUTION"] as const;
type AlertType = (typeof ALERT_TYPES)[number];

const ALERT_TITLES: Record<AlertType, string> = {
  KEY: "Key insight",
  TIP: "Tip",
  INFO: "Info",
  WARN: "Warning",
  NOTE: "Note",
  IMPORTANT: "Important",
  CAUTION: "Caution",
};

const ALERT_ICONS: Record<AlertType, string> = {
  KEY: "🔑",
  TIP: "💡",
  INFO: "ℹ️",
  WARN: "⚠️",
  NOTE: "📝",
  IMPORTANT: "❗",
  CAUTION: "🛑",
};

/** Convert GFM alerts to inline HTML. A GFM alert is a blockquote whose
 *  first line is `> [!TYPE]`; subsequent `>` lines belong to the same
 *  alert body. The block ends at the first non-blockquote line.
 *
 *  Output: a self-contained <aside> element styled via the .callout
 *  rules in globals.css. The blockquote container itself is replaced so
 *  marked never sees the bracketed tag.
 */
function transformAlerts(input: string): string {
  const lines = input.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^>\s*\[!(KEY|TIP|INFO|WARN|NOTE|IMPORTANT|CAUTION)\]\s*$/i);
    if (m) {
      const type = m[1].toUpperCase() as AlertType;
      // Collect subsequent `> ...` lines as the body
      const body: string[] = [];
      i++;
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      // Run the body through a tiny inline-markdown pass so **bold**
      // and `code` survive — the wrapper aside skips marked entirely.
      const bodyHtml = body
        .join("\n")
        .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
        .replace(/`([^`\n]+)`/g, "<code>$1</code>")
        .split(/\n{2,}/)
        .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
        .join("");
      const title = ALERT_TITLES[type];
      const icon = ALERT_ICONS[type];
      const klass = `callout callout-${type.toLowerCase()}`;
      out.push(
        `<aside class="${klass}" role="note"><div class="callout-title"><span aria-hidden="true">${icon}</span> ${title}</div><div class="callout-body">${bodyHtml}</div></aside>`
      );
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join("\n");
}

/** Recover literal `\n` data corruption. If the content has zero real
 *  newlines but contains the 2-char escape sequence `\n` (often `\r\n`
 *  variants too), substitute. Safe: only triggers when no real newlines
 *  exist, so it won't disturb properly-formatted content. */
function recoverEscapedNewlines(input: string): string {
  if (input.indexOf("\n") !== -1) return input; // already has real newlines, leave alone
  if (input.indexOf("\\n") === -1) return input;
  return input
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");
}

/** Run all preprocessors in order. Call this before marked.parse(). */
export function preprocessMarkdown(input: string): string {
  let out = recoverEscapedNewlines(input);
  out = transformAlerts(out);
  return out;
}
