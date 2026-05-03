// Premium blog markdown renderer with custom overrides for:
// - H2/H3 headings (with auto-generated anchor IDs for the floating TOC)
// - Callout boxes via blockquote syntax: > [!INFO] / > [!TIP] / > [!WARN] / > [!KEY]
// - Pull-quote styling for plain blockquotes
// - Section dividers between major H2s
// - Premium code block styling
// - Better link/list/table styling
//
// Also extracts a "Key Takeaways" section if the post starts with one.

import { Streamdown } from "streamdown";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Info, AlertTriangle, Lightbulb, Sparkles, Quote } from "lucide-react";
import type { BlogPalette } from "@/lib/blogVisuals";
import { autoLinkContent } from "@/lib/autoLinker";

type Props = {
  content: string;
  palette: BlogPalette;
  /** Current post's slug — used by auto-linker to avoid self-links */
  slug?: string;
};

// Slugify text for heading anchor IDs (must match extractHeadings in blogVisuals.ts)
function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

// Detect callout markers in blockquote first child text:
//   > [!INFO]  or  > [!TIP]  or  > [!WARN]  or  > [!KEY]
const CALLOUT_RE = /^\[!(INFO|TIP|WARN|WARNING|KEY|IMPORTANT|NOTE)\]\s*(.*)$/i;
type CalloutKind = "info" | "tip" | "warn" | "key";

function detectCallout(
  children: ReactNode
): { kind: CalloutKind; rest: ReactNode } | null {
  // Walk into the first child's text
  const arr = Array.isArray(children) ? children : [children];
  if (arr.length === 0) return null;
  const first = arr[0] as any;
  if (!first || typeof first !== "object" || !first.props) return null;
  const innerArr = Array.isArray(first.props.children)
    ? first.props.children
    : [first.props.children];
  const firstText = typeof innerArr[0] === "string" ? innerArr[0] : "";
  const m = firstText.match(CALLOUT_RE);
  if (!m) return null;
  const tag = m[1].toUpperCase();
  let kind: CalloutKind = "info";
  if (tag === "TIP") kind = "tip";
  else if (tag === "WARN" || tag === "WARNING") kind = "warn";
  else if (tag === "KEY" || tag === "IMPORTANT") kind = "key";
  // Rebuild children with the marker stripped from the first text
  const strippedFirstText = m[2];
  return {
    kind,
    rest: arr.map((child: any, i: number) => {
      if (i !== 0) return child;
      const inner = innerArr.slice();
      inner[0] = strippedFirstText;
      return { ...child, props: { ...child.props, children: inner } };
    }),
  };
}

const CALLOUT_STYLES: Record<
  CalloutKind,
  { bg: string; border: string; text: string; icon: typeof Info; label: string }
> = {
  info: {
    bg: "rgba(8,145,178,0.06)",
    border: "rgba(8,145,178,0.25)",
    text: "#0E7490",
    icon: Info,
    label: "Info",
  },
  tip: {
    bg: "rgba(16,185,129,0.06)",
    border: "rgba(16,185,129,0.25)",
    text: "#047857",
    icon: Lightbulb,
    label: "Tip",
  },
  warn: {
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.3)",
    text: "#92400E",
    icon: AlertTriangle,
    label: "Heads-up",
  },
  key: {
    bg: "rgba(124,58,237,0.06)",
    border: "rgba(124,58,237,0.25)",
    text: "#5B21B6",
    icon: Sparkles,
    label: "Key insight",
  },
};

function CalloutBox({
  kind,
  children,
}: {
  kind: CalloutKind;
  children: ReactNode;
}) {
  const s = CALLOUT_STYLES[kind];
  const Icon = s.icon;
  return (
    <div
      className="my-8 rounded-2xl p-5 md:p-6 flex gap-4"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: `linear-gradient(135deg, ${s.text}, ${s.text}dd)`,
        }}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1"
          style={{ color: s.text }}
        >
          {s.label}
        </div>
        <div className="text-base text-slate-700 leading-relaxed prose-callout">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BlogContent({ content, palette, slug = "" }: Props) {
  // Auto-inject internal links to related blogs (first-occurrence, plain-text only)
  const linkedContent = useMemo(
    () => autoLinkContent(content, slug),
    [content, slug]
  );

  const components = {
    // The blog page already renders one h1 in the hero (post.title). If the
    // post's markdown also starts with `# Title`, that becomes a second h1 —
    // SEO-bad. Demote any markdown h1 to h2 so the page has exactly one h1.
    h1({ children, ...rest }: any) {
      const text =
        typeof children === "string"
          ? children
          : Array.isArray(children)
            ? children.join("")
            : String(children ?? "");
      const id = slugify(text);
      return (
        <h2
          id={id}
          className="group relative text-2xl md:text-3xl font-bold text-slate-900 mt-14 mb-5 leading-tight scroll-mt-24"
          style={{ fontFamily: "var(--font-heading)" }}
          {...rest}
        >
          <span
            className="absolute -left-5 top-1.5 bottom-1.5 w-1 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${palette.from}, ${palette.via})`,
            }}
          />
          {children}
        </h2>
      );
    },
    h2({ children, ...rest }: any) {
      const text =
        typeof children === "string"
          ? children
          : Array.isArray(children)
            ? children.join("")
            : String(children ?? "");
      const id = slugify(text);
      return (
        <h2
          id={id}
          className="group relative text-2xl md:text-3xl font-bold text-slate-900 mt-14 mb-5 leading-tight scroll-mt-24"
          style={{ fontFamily: "var(--font-heading)" }}
          {...rest}
        >
          {/* Side accent bar */}
          <span
            className="absolute -left-5 top-1.5 bottom-1.5 w-1 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${palette.from}, ${palette.via})`,
            }}
          />
          {children}
          <a
            href={`#${id}`}
            className="ml-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity text-base no-underline"
            aria-label="Link to section"
          >
            #
          </a>
        </h2>
      );
    },
    h3({ children, ...rest }: any) {
      const text =
        typeof children === "string" ? children : String(children ?? "");
      const id = slugify(text);
      return (
        <h3
          id={id}
          className="text-xl font-bold text-slate-800 mt-10 mb-4 leading-tight scroll-mt-24"
          {...rest}
        >
          {children}
        </h3>
      );
    },
    p({ children, ...rest }: any) {
      return (
        <p
          className="text-base md:text-[17px] text-slate-700 leading-[1.8] my-5"
          {...rest}
        >
          {children}
        </p>
      );
    },
    blockquote({ children, ...rest }: any) {
      const cb = detectCallout(children);
      if (cb) return <CalloutBox kind={cb.kind}>{cb.rest}</CalloutBox>;
      // Otherwise → premium pull-quote
      return (
        <blockquote className="my-10 relative pl-8 pr-4 py-2" {...rest}>
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${palette.from}, ${palette.via}, ${palette.to})`,
            }}
          />
          <Quote
            className="absolute -left-1 -top-3 w-6 h-6 opacity-20"
            style={{ color: palette.from }}
          />
          <div className="text-xl md:text-2xl font-light italic leading-relaxed text-slate-700">
            {children}
          </div>
        </blockquote>
      );
    },
    ul({ children, ...rest }: any) {
      return (
        <ul
          className="my-5 pl-6 space-y-2 list-disc marker:text-slate-400"
          {...rest}
        >
          {children}
        </ul>
      );
    },
    ol({ children, ...rest }: any) {
      return (
        <ol
          className="my-5 pl-6 space-y-2 list-decimal marker:text-slate-400 marker:font-bold"
          {...rest}
        >
          {children}
        </ol>
      );
    },
    li({ children, ...rest }: any) {
      return (
        <li
          className="text-base md:text-[17px] text-slate-700 leading-[1.7] pl-2"
          {...rest}
        >
          {children}
        </li>
      );
    },
    a({ children, href, ...rest }: any) {
      const isExt = href?.startsWith("http");
      return (
        <a
          href={href}
          target={isExt ? "_blank" : undefined}
          rel={isExt ? "noopener noreferrer" : undefined}
          className="font-semibold underline decoration-2 underline-offset-4 transition-colors"
          style={{
            color: palette.from,
            textDecorationColor: `${palette.from}55`,
          }}
          {...rest}
        >
          {children}
        </a>
      );
    },
    strong({ children, ...rest }: any) {
      return (
        <strong className="font-bold text-slate-900" {...rest}>
          {children}
        </strong>
      );
    },
    code({ children, className, ...rest }: any) {
      const isBlock = className?.startsWith("language-");
      if (isBlock)
        return (
          <code className={className} {...rest}>
            {children}
          </code>
        );
      return (
        <code
          className="px-1.5 py-0.5 rounded font-mono text-[0.9em] font-semibold"
          style={{ background: `${palette.from}12`, color: palette.from }}
          {...rest}
        >
          {children}
        </code>
      );
    },
    hr() {
      return (
        <div className="my-12 flex items-center justify-center gap-3">
          <div
            className="h-px flex-1 max-w-32"
            style={{
              background: `linear-gradient(90deg, transparent, ${palette.from}40, transparent)`,
            }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: palette.via,
              boxShadow: `0 0 12px ${palette.via}`,
            }}
          />
          <div
            className="h-px flex-1 max-w-32"
            style={{
              background: `linear-gradient(90deg, transparent, ${palette.from}40, transparent)`,
            }}
          />
        </div>
      );
    },
    table({ children, ...rest }: any) {
      return (
        <div
          className="my-8 overflow-x-auto rounded-xl"
          style={{ border: "1px solid rgba(15,23,42,0.08)" }}
        >
          <table className="w-full text-sm" {...rest}>
            {children}
          </table>
        </div>
      );
    },
    th({ children, ...rest }: any) {
      return (
        <th
          className="px-4 py-3 text-left font-bold text-slate-800 text-xs uppercase tracking-wider"
          style={{
            background: `${palette.from}10`,
            borderBottom: `1px solid ${palette.from}25`,
          }}
          {...rest}
        >
          {children}
        </th>
      );
    },
    td({ children, ...rest }: any) {
      return (
        <td
          className="px-4 py-3 text-slate-700 border-t border-slate-100"
          {...rest}
        >
          {children}
        </td>
      );
    },
  };

  return (
    <div className="blog-content">
      <Streamdown components={components as any}>{linkedContent}</Streamdown>
    </div>
  );
}
