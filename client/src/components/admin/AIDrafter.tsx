// Admin tool: AI-drafted blog posts.
// User enters topic + audience level → Claude writes a polished draft →
// user reviews/edits → saves directly into the blog_posts table as a draft
// (published=false). Existing BlogManager handles the edit flow from there.

import { useState } from "react";
import { Sparkles, Loader2, Save, RefreshCw, Copy, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Audience = "newcomer" | "intermediate" | "expert";

const AUDIENCE_LABELS: Record<Audience, { label: string; hint: string }> = {
  newcomer:     { label: "Crypto newcomer",  hint: "Plain English, every term defined, zero jargon" },
  intermediate: { label: "DeFi-aware",       hint: "Knows DeFi basics, learning TurboLoop specifics" },
  expert:       { label: "Power user",       hint: "Deep mechanics, math, and on-chain verifiability" },
};

const PROMPT_IDEAS = [
  "Why TurboLoop's renounced ownership matters more than most projects' audits",
  "The math behind concentrated liquidity, in plain English",
  "How to verify a TurboLoop transaction step-by-step on BscScan",
  "Why stablecoins are the unsung hero of sustainable DeFi yield",
  "What to ask before depositing into ANY DeFi protocol — TurboLoop included",
  "The difference between Ponzi yield and protocol-revenue yield, with real examples",
];

export default function AIDrafter() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [audience, setAudience] = useState<Audience>("intermediate");
  const [draft, setDraft] = useState<{ title: string; slug: string; excerpt: string; content: string; tokensUsed?: { input: number; output: number } } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const draftMutation = trpc.aiDrafter.draftBlog.useMutation();
  const saveMutation = trpc.manage.createBlogPost.useMutation();
  const utils = trpc.useUtils();

  const generate = async () => {
    if (topic.trim().length < 3) return;
    try {
      const result = await draftMutation.mutateAsync({
        topic: topic.trim(),
        audienceLevel: audience,
        notes: notes.trim() || undefined,
      });
      setDraft(result);
    } catch (err: any) {
      // Error displayed below in UI via draftMutation.error
    }
  };

  const saveDraft = async (publish: boolean) => {
    if (!draft) return;
    try {
      await saveMutation.mutateAsync({
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        content: draft.content,
        published: publish,
      });
      utils.manage.listBlogPosts.invalidate();
      // Reset form after successful save
      setDraft(null);
      setTopic("");
      setNotes("");
      alert(publish ? "✓ Published — visit /feed to see it live." : "✓ Saved as draft — find it in the Blog Posts tab.");
    } catch (err: any) {
      alert(`Save failed: ${err?.message || "Unknown error"}`);
    }
  };

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Intro */}
      <div className="rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg, rgba(8,145,178,0.06), rgba(124,58,237,0.04))", border: "1px solid rgba(8,145,178,0.15)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-cyan-700" />
          <h3 className="text-lg font-bold text-slate-900">AI Blog Drafter</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Enter a topic. Claude writes a polished 800-1500 word post in our voice.
          You review, edit, and either save as a draft or publish straight to <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">/feed</code>.
        </p>
      </div>

      {/* Input form */}
      <div className="rounded-2xl bg-white p-6 space-y-4" style={{ border: "1px solid rgba(15,23,42,0.08)" }}>
        <div>
          <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Topic / angle *</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={2}
            placeholder="What should this post be about? Be specific (e.g. 'Why renounced ownership matters more than audits')"
            className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none resize-y"
            style={{ border: "1px solid rgba(15,23,42,0.08)" }}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {PROMPT_IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setTopic(idea)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 transition"
              >
                {idea.length > 60 ? idea.slice(0, 60) + "…" : idea}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Audience level</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAudience(a)}
                className="text-left p-3 rounded-xl transition"
                style={{
                  background: audience === a ? "linear-gradient(135deg, rgba(8,145,178,0.08), rgba(124,58,237,0.05))" : "white",
                  border: `1.5px solid ${audience === a ? "rgba(8,145,178,0.4)" : "rgba(15,23,42,0.08)"}`,
                }}
              >
                <div className={`text-sm font-bold ${audience === a ? "text-cyan-800" : "text-slate-800"}`}>{AUDIENCE_LABELS[a].label}</div>
                <div className="text-[11px] text-slate-500 mt-1">{AUDIENCE_LABELS[a].hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Editor notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Specific facts to include, things to avoid, examples to use..."
            className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none resize-y"
            style={{ border: "1px solid rgba(15,23,42,0.08)" }}
          />
        </div>

        <button
          onClick={generate}
          disabled={draftMutation.isPending || topic.trim().length < 3}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #0891B2, #7C3AED)", color: "white", boxShadow: "0 8px 22px -6px rgba(8,145,178,0.4)" }}
        >
          {draftMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Claude is writing... (15-30 seconds)
            </>
          ) : draft ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate draft
            </>
          )}
        </button>

        {draftMutation.error && (
          <div className="mt-3 px-4 py-3 rounded-xl text-sm text-red-700"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <strong>Error:</strong> {draftMutation.error.message}
          </div>
        )}
      </div>

      {/* Draft preview + edit */}
      {draft && (
        <div className="rounded-2xl bg-white p-6 space-y-5" style={{ border: "1px solid rgba(15,23,42,0.08)" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Draft preview</h3>
            {draft.tokensUsed && (
              <span className="text-[11px] text-slate-400">
                {draft.tokensUsed.input.toLocaleString()} in · {draft.tokensUsed.output.toLocaleString()} out
              </span>
            )}
          </div>

          <Field label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} onCopy={() => copy("title", draft.title)} copied={copied === "title"} />
          <Field label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} onCopy={() => copy("slug", draft.slug)} copied={copied === "slug"} />
          <Field label="Excerpt" value={draft.excerpt} onChange={(v) => setDraft({ ...draft, excerpt: v })} onCopy={() => copy("excerpt", draft.excerpt)} copied={copied === "excerpt"} multiline />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold tracking-wider uppercase text-slate-500">Content (markdown)</label>
              <button
                onClick={() => copy("content", draft.content)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700"
              >
                {copied === "content" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === "content" ? "copied" : "copy"}
              </button>
            </div>
            <textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              rows={20}
              className="w-full px-4 py-3 rounded-xl text-sm bg-white outline-none resize-y font-mono"
              style={{ border: "1px solid rgba(15,23,42,0.08)" }}
            />
            <div className="text-[11px] text-slate-400 mt-1.5">
              {draft.content.split(/\s+/).length} words · {draft.content.length} chars
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t" style={{ borderColor: "rgba(15,23,42,0.06)" }}>
            <button
              onClick={() => saveDraft(false)}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700 hover:bg-slate-800 text-white transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save as draft
            </button>
            <button
              onClick={() => saveDraft(true)}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "white" }}
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish to /feed now
            </button>
            <button
              onClick={() => setDraft(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 transition"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  onCopy,
  copied,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCopy: () => void;
  copied: boolean;
  multiline?: boolean;
}) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold tracking-wider uppercase text-slate-500">{label}</label>
        <button onClick={onCopy} className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <Tag
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        rows={multiline ? 3 : undefined}
        className="w-full px-4 py-2.5 rounded-xl text-sm bg-white outline-none"
        style={{ border: "1px solid rgba(15,23,42,0.08)", resize: multiline ? "vertical" : undefined }}
      />
    </div>
  );
}
