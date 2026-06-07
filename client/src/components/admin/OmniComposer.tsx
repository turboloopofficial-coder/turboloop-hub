// Admin → Omni-Composer tab (Automation V2).
//
// Write a post once, schedule it once or recurring, ship it to multiple
// channels. The cron-master polls `scheduled_posts` every 5 minutes and
// fans each due row out to the channels listed.
//
// Two views:
//   • Compose — split pane editor (left) + live previews (right).
//   • Queue   — flat sorted list of all scheduled posts with pause /
//               resume / run-now / delete / edit controls.
//
// The component is intentionally self-contained — every server call
// goes through trpc.manage.scheduledPosts.*, plus aiDrafter for the
// AI assist buttons and manage.uploadImage for media upload (which
// accepts any contentType, so it doubles as the video uploader).

import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { marked } from "marked";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  X,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Wand2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Calendar,
  Repeat,
  Send,
  Edit3,
  Eye,
  ListChecks,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Languages,
  ImagePlus,
  Layers,
  ChevronDown,
  DollarSign,
} from "lucide-react";

// ─── Channel taxonomy (mirror of server SCHEDULED_POST_CHANNELS) ───
const ALL_CHANNELS = [
  { id: "blog",         label: "Blog",        hint: "Publishes a blog post" },
  { id: "telegram_en",  label: "Telegram EN", hint: "Channel + Group broadcast" },
  { id: "telegram_de",  label: "Telegram DE", hint: "German group only" },
  { id: "telegram_hi",  label: "Telegram HI", hint: "Default broadcast (no HI group)" },
  { id: "telegram_id",  label: "Telegram ID", hint: "Default broadcast (no ID group)" },
] as const;
type ChannelId = typeof ALL_CHANNELS[number]["id"];

// ─── Recurring presets — the user picks a preset, we write the cron ───
const RECURRING_PRESETS: { label: string; cron: string; hint: string }[] = [
  { label: "Every day at 14:00 UTC",   cron: "0 14 * * *",  hint: "Daily 14:00 UTC (7:30 PM IST)" },
  { label: "Every day at 09:00 UTC",   cron: "0 9 * * *",   hint: "Daily 09:00 UTC (2:30 PM IST)" },
  { label: "Mon/Wed/Fri at 14:00 UTC", cron: "0 14 * * 1,3,5", hint: "3x/week at 14:00 UTC" },
  { label: "Every Monday at 14:00 UTC",cron: "0 14 * * 1",  hint: "Weekly Mondays" },
  { label: "Every 3 days at 14:00 UTC", cron: "0 14 */3 * *", hint: "Every 3rd day at 14:00 UTC" },
];

// ─── Helpers ───
function utcInputValue(d: Date): string {
  // Returns a `YYYY-MM-DDTHH:mm` string in UTC suitable for an
  // <input type="datetime-local"> bound to UTC (we tell the user
  // values are UTC in the label).
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear() +
    "-" +
    pad(d.getUTCMonth() + 1) +
    "-" +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    ":" +
    pad(d.getUTCMinutes())
  );
}

function parseUtcInput(value: string): Date {
  // The datetime-local value is interpreted as LOCAL time by the
  // browser. We want UTC, so reconstruct from the parsed components.
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return new Date(value);
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
}

function formatUtc(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function markdownToHtml(md: string): string {
  try {
    return marked.parse(md, { async: false, breaks: true, gfm: true }) as string;
  } catch {
    return md;
  }
}

// Render the same MD→HTML mini-transform the cron-master uses so the
// preview matches the actual Telegram caption. Keep in sync with
// server/_vercel/cron-master.ts:markdownToTelegramHtml.
function renderTelegramHtml(title: string | null, body: string): string {
  let s = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<i>$2</i>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  const head = title
    ? `<b>${title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</b>\n\n`
    : "";
  const full = head + s;
  return full.length <= 1000 ? full : full.slice(0, 997) + "…";
}

// DALL-E cost acknowledgement — per browser session. We don't want to
// nag the admin on every image, but the first one in a session should
// confirm they understand the spend (~$0.04-0.12 per image depending
// on size/quality).
const COST_ACK_KEY = "omni-ai-image-cost-acked";
function isCostAcked(): boolean {
  try { return sessionStorage.getItem(COST_ACK_KEY) === "1"; } catch { return false; }
}
function ackCost(): void {
  try { sessionStorage.setItem(COST_ACK_KEY, "1"); } catch { /* ignore */ }
}

function buildWhatsappText(title: string | null, body: string, ctaUrl?: string): string {
  const lines: string[] = [];
  if (title) lines.push(title);
  if (body) {
    if (title) lines.push("");
    lines.push(body);
  }
  if (ctaUrl) {
    lines.push("");
    lines.push(ctaUrl);
  }
  return lines.join("\n");
}

// ─── Types mirroring the tRPC create input ───
type Button = { text: string; url: string };
type ComposerState = {
  id?: number;
  title: string;
  content: string;
  mediaUrl: string;
  mediaType: "none" | "image" | "video";
  channels: ChannelId[];
  buttons: Button[];
  scheduleType: "once" | "recurring";
  cronExpression: string;
  nextRunAtUtc: string; // datetime-local UTC string
};

const EMPTY: ComposerState = {
  title: "",
  content: "",
  mediaUrl: "",
  mediaType: "none",
  channels: ["telegram_en"],
  buttons: [],
  scheduleType: "once",
  cronExpression: "0 14 * * *",
  nextRunAtUtc: utcInputValue(new Date(Date.now() + 60 * 60 * 1000)),
};

export default function OmniComposer() {
  const [tab, setTab] = useState<"compose" | "queue">("compose");
  const [editing, setEditing] = useState<ComposerState>(EMPTY);
  const [campaignOpen, setCampaignOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Inner-tab pills + Campaign Mode trigger */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("compose")}
            className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-bold border transition ${
              tab === "compose"
                ? "bg-cyan-600/10 text-cyan-700 border-cyan-600/30"
                : "text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" /> Compose
          </button>
          <button
            onClick={() => setTab("queue")}
            className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-bold border transition ${
              tab === "queue"
                ? "bg-cyan-600/10 text-cyan-700 border-cyan-600/30"
                : "text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <ListChecks className="h-3.5 w-3.5" /> Queue
          </button>
        </div>
        <button
          onClick={() => setCampaignOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-bold bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow hover:shadow-md transition"
          title="Generate a multi-day campaign with AI"
        >
          <Layers className="h-3.5 w-3.5" /> Campaign Mode
        </button>
      </div>

      {tab === "compose" ? (
        <ComposeView
          state={editing}
          setState={setEditing}
          onAfterSubmit={() => {
            setEditing(EMPTY);
            setTab("queue");
          }}
        />
      ) : (
        <QueueView
          onEdit={(post) => {
            setEditing(scheduledPostToState(post));
            setTab("compose");
          }}
        />
      )}

      {campaignOpen && (
        <CampaignBuilderModal
          defaultChannels={editing.channels}
          onClose={() => setCampaignOpen(false)}
          onScheduled={() => {
            setCampaignOpen(false);
            setTab("queue");
          }}
        />
      )}
    </div>
  );
}

// ─── Convert a server row back into the form state for editing ───
function scheduledPostToState(p: any): ComposerState {
  return {
    id: p.id,
    title: p.title ?? "",
    content: p.content,
    mediaUrl: p.mediaUrl ?? "",
    mediaType: p.mediaType ?? "none",
    channels: (p.channels as ChannelId[]) ?? ["telegram_en"],
    buttons: (p.buttons as Button[]) ?? [],
    scheduleType: p.scheduleType,
    cronExpression: p.cronExpression ?? "0 14 * * *",
    nextRunAtUtc: utcInputValue(new Date(p.nextRunAt)),
  };
}

// ============ COMPOSE VIEW ============

function ComposeView(props: {
  state: ComposerState;
  setState: (s: ComposerState | ((prev: ComposerState) => ComposerState)) => void;
  onAfterSubmit: () => void;
}) {
  const { state, setState, onAfterSubmit } = props;
  const utils = trpc.useUtils();

  const createMut = trpc.manage.scheduledPosts.create.useMutation({
    onSuccess: () => {
      utils.manage.scheduledPosts.list.invalidate();
      toast.success("Scheduled post created");
      onAfterSubmit();
    },
    onError: (e) => toast.error(`Create failed: ${e.message}`),
  });
  const updateMut = trpc.manage.scheduledPosts.update.useMutation({
    onSuccess: () => {
      utils.manage.scheduledPosts.list.invalidate();
      toast.success("Updated");
      onAfterSubmit();
    },
    onError: (e) => toast.error(`Update failed: ${e.message}`),
  });
  const enhanceTg = trpc.aiDrafter.enhanceForTelegram.useMutation();
  const expandBlog = trpc.aiDrafter.expandForBlog.useMutation();
  const draftBlog = trpc.aiDrafter.draftBlog.useMutation();
  const translateMut = trpc.aiDrafter.translate.useMutation();
  const generateImageMut = trpc.aiDrafter.generateImage.useMutation();
  const uploadMedia = trpc.manage.uploadImage.useMutation();

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // ─── Magic Wand inline panel state ───
  const [wandOpen, setWandOpen] = useState(false);
  const [wandTopic, setWandTopic] = useState("");
  const [wandTone, setWandTone] = useState<"professional" | "hype" | "educational">("professional");
  const [wandAudience, setWandAudience] = useState<"newcomer" | "intermediate" | "expert">("intermediate");

  // ─── AI image generation panel state ───
  const [aiImgOpen, setAiImgOpen] = useState(false);
  const [aiImgPrompt, setAiImgPrompt] = useState("");
  const [aiImgSize, setAiImgSize] = useState<"1024x1024" | "1024x1792" | "1792x1024">("1024x1024");
  const [aiImgQuality, setAiImgQuality] = useState<"standard" | "hd">("standard");

  const ctaUrlPreview = state.buttons[0]?.url ?? "";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      toast.error("Pick an image or video file");
      return;
    }
    // Vercel function body cap is 4.5MB on Hobby; warn early.
    if (file.size > 4_000_000) {
      toast.error("File must be under 4MB (Vercel function limit)");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadMedia.mutateAsync({
        filename: file.name,
        base64,
        contentType: file.type,
      });
      setState((s) => ({
        ...s,
        mediaUrl: result.url,
        mediaType: isVideo ? "video" : "image",
      }));
      toast.success("Uploaded");
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleEnhanceTelegram = async () => {
    if (!state.content.trim()) {
      toast.error("Write some content first");
      return;
    }
    try {
      const r = await enhanceTg.mutateAsync({
        source: (state.title ? state.title + "\n\n" : "") + state.content,
        ctaUrl: ctaUrlPreview || undefined,
      });
      setState((s) => ({ ...s, content: r.caption }));
      toast.success("Rewritten for Telegram");
    } catch (e) {
      toast.error(`AI failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleExpandBlog = async () => {
    if (!state.content.trim()) {
      toast.error("Write a brief first");
      return;
    }
    try {
      const r = await expandBlog.mutateAsync({
        source: (state.title ? state.title + "\n\n" : "") + state.content,
        audienceLevel: "intermediate",
      });
      setState((s) => ({
        ...s,
        title: r.title,
        content: r.content,
      }));
      toast.success("Expanded to a full blog post");
    } catch (e) {
      toast.error(`AI failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  // Magic Wand — calls draftBlog with a `notes` field that injects the
  // selected tone. draftBlog itself doesn't take a tone param yet (V2
  // scope), so we sneak it in through notes. Claude follows the
  // instruction reliably enough for V2.
  const handleMagicWand = async () => {
    if (!wandTopic.trim()) {
      toast.error("Enter a topic first");
      return;
    }
    const toneNote = {
      professional: "Tone: confident, premium, restrained. Bloomberg / Stratechery cadence. Avoid emoji and hype.",
      hype:         "Tone: energetic but not desperate. Punchy headlines, momentum-driven, 1-2 tasteful emoji max. Never use MOON / 100x / huge.",
      educational:  "Tone: teacher voice. Define every term. Use analogies. Bullet lists and numbered steps. Skip rhetoric.",
    }[wandTone];
    try {
      const r = await draftBlog.mutateAsync({
        topic: wandTopic.trim(),
        audienceLevel: wandAudience,
        notes: toneNote,
      });
      setState((s) => ({
        ...s,
        title: r.title,
        content: r.content,
      }));
      setWandOpen(false);
      setWandTopic("");
      toast.success("Draft generated");
    } catch (e) {
      toast.error(`Magic Wand failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  // Translate — replaces editor content with translation in place.
  // Toast warns the admin to save-as-new or revert (Ctrl+Z works on
  // the textarea but not on title — keep that in mind).
  const handleTranslate = async (target: "de" | "hi" | "id") => {
    if (!state.content.trim()) {
      toast.error("Write some content first");
      return;
    }
    const label = { de: "German", hi: "Hindi", id: "Indonesian" }[target];
    try {
      const r = await translateMut.mutateAsync({
        source: (state.title ? state.title + "\n\n" : "") + state.content,
        target,
      });
      // If the translation starts with a single line (the title) followed
      // by a blank, split it back into title + body. Otherwise just dump
      // everything into content.
      const parts = r.text.split(/\n\s*\n/, 2);
      if (state.title && parts.length === 2 && parts[0].length <= 200) {
        setState((s) => ({ ...s, title: parts[0].trim(), content: parts[1].trim() }));
      } else {
        setState((s) => ({ ...s, content: r.text }));
      }
      toast.success(`Translated to ${label} — save as a new post or undo (Ctrl+Z) to revert`);
    } catch (e) {
      toast.error(`Translate failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  // AI image generation — DALL-E 3 → R2. First call in the session
  // gates on a cost-confirm modal (~$0.04). Subsequent calls skip
  // the modal because sessionStorage flag is set.
  const handleGenerateImage = async () => {
    if (!aiImgPrompt.trim()) {
      toast.error("Describe the image first");
      return;
    }
    // Cost gate (once per session).
    if (!isCostAcked()) {
      const cost = aiImgQuality === "hd" ? "$0.08-0.12" : "$0.04-0.08";
      const ok = window.confirm(
        `Generate one DALL-E 3 image at ${aiImgSize} (${aiImgQuality})?\n\n` +
          `Approx cost: ${cost}. This message won't show again this session.`
      );
      if (!ok) return;
      ackCost();
    }
    try {
      const r = await generateImageMut.mutateAsync({
        prompt: aiImgPrompt.trim(),
        size: aiImgSize,
        quality: aiImgQuality,
      });
      setState((s) => ({
        ...s,
        mediaUrl: r.url,
        mediaType: "image",
      }));
      setAiImgOpen(false);
      if (r.revisedPrompt && r.revisedPrompt !== aiImgPrompt.trim()) {
        toast.success(`Image generated. DALL-E rewrote your prompt — see console for the revised version.`);
        console.info("[DALL-E revised prompt]", r.revisedPrompt);
      } else {
        toast.success("Image generated and attached");
      }
    } catch (e) {
      toast.error(`Image gen failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  // Pre-fill the AI image prompt from the post body. Uses the title
  // + first 300 chars stripped of Markdown as a starting point.
  const autoSeedImagePrompt = () => {
    const plain = (state.title ? state.title + ". " : "") +
      state.content.replace(/[#*`>_-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
    const seed = `Hero image for a blog post titled "${state.title || "(untitled)"}". ${plain.slice(0, 200)}. Style: minimal isometric illustration, cyan + slate color palette, flat shading, no text in the image, premium fintech aesthetic.`;
    setAiImgPrompt(seed);
  };

  const submit = (mode: "now" | "scheduled") => {
    if (!state.content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (state.channels.length === 0) {
      toast.error("Pick at least one channel");
      return;
    }
    if (state.channels.includes("blog") && !state.title.trim()) {
      toast.error("Blog channel needs a title");
      return;
    }

    const nextRunAt =
      mode === "now"
        ? new Date(Date.now() + 60_000).toISOString() // fire on the next 5-min tick
        : parseUtcInput(state.nextRunAtUtc).toISOString();

    const payload = {
      title: state.title.trim() || null,
      content: state.content,
      mediaUrl: state.mediaUrl || null,
      mediaType: state.mediaType,
      channels: state.channels,
      buttons: state.buttons.filter((b) => b.text && b.url),
      scheduleType: state.scheduleType,
      cronExpression:
        state.scheduleType === "recurring" ? state.cronExpression : null,
      nextRunAt,
    };

    if (state.id) {
      updateMut.mutate({ id: state.id, ...payload });
    } else {
      createMut.mutate(payload as any);
    }
  };

  const submitting = createMut.isPending || updateMut.isPending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ============ EDITOR PANE ============ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-bold text-slate-800">
            {state.id ? `Edit post #${state.id}` : "New post"}
          </h3>
          {state.id && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onAfterSubmit}
              className="text-slate-500 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Cancel edit
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl p-4 space-y-4">
          <div>
            <Label className="text-slate-500 text-xs">Title (required for blog channel)</Label>
            <Input
              value={state.title}
              onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
              placeholder="Optional for Telegram-only posts"
              className="bg-white/80 border-slate-200 text-slate-800 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
              <Label className="text-slate-500 text-xs">Body (Markdown)</Label>
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setWandOpen((v) => !v)}
                  className={`h-7 text-[11px] hover:bg-violet-50 ${
                    wandOpen ? "bg-violet-100 text-violet-700" : "text-violet-700"
                  }`}
                  title="AI draft a full post from a topic"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Magic Wand
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEnhanceTelegram}
                  disabled={enhanceTg.isPending || !state.content.trim()}
                  className="h-7 text-[11px] text-cyan-700 hover:bg-cyan-50"
                  title="Rewrite as a Telegram-optimized caption"
                >
                  {enhanceTg.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Wand2 className="h-3 w-3 mr-1" />
                  )}
                  Optimize for Telegram
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleExpandBlog}
                  disabled={expandBlog.isPending || !state.content.trim()}
                  className="h-7 text-[11px] text-cyan-700 hover:bg-cyan-50"
                  title="Expand into a full blog post"
                >
                  {expandBlog.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  Expand for Blog
                </Button>
                <TranslateDropdown
                  disabled={translateMut.isPending || !state.content.trim()}
                  loading={translateMut.isPending}
                  onPick={(target) => handleTranslate(target)}
                />
              </div>
            </div>

            {/* Magic Wand inline panel — collapsible, sits above the textarea
                so the user can preview what they're about to overwrite. */}
            {wandOpen && (
              <div className="mb-2 rounded-lg border border-violet-200 bg-violet-50/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-violet-700">
                    Magic Wand — AI draft
                  </div>
                  <button
                    onClick={() => setWandOpen(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Input
                  value={wandTopic}
                  onChange={(e) => setWandTopic(e.target.value)}
                  placeholder="What's the post about? (e.g. why $TURBO trade tax flows to ops)"
                  className="bg-white/80 border-violet-200 text-slate-800 text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-500 text-[10px]">Tone</Label>
                    <select
                      value={wandTone}
                      onChange={(e) => setWandTone(e.target.value as any)}
                      className="w-full bg-white/80 border border-violet-200 text-slate-800 text-xs rounded h-8 px-2 outline-none focus:border-violet-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="hype">Hype (energetic)</option>
                      <option value="educational">Educational</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-slate-500 text-[10px]">Audience</Label>
                    <select
                      value={wandAudience}
                      onChange={(e) => setWandAudience(e.target.value as any)}
                      className="w-full bg-white/80 border border-violet-200 text-slate-800 text-xs rounded h-8 px-2 outline-none focus:border-violet-500"
                    >
                      <option value="newcomer">Newcomer</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleMagicWand}
                  disabled={draftBlog.isPending || !wandTopic.trim()}
                  className="w-full bg-violet-600 text-white hover:bg-violet-700"
                >
                  {draftBlog.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5 mr-1" />
                  )}
                  Draft post {state.content.trim() && "(overwrites current content)"}
                </Button>
              </div>
            )}

            <textarea
              value={state.content}
              onChange={(e) => setState((s) => ({ ...s, content: e.target.value }))}
              rows={10}
              placeholder="Write your post in Markdown. **bold**, *italic*, [links](https://…), and `code` work in both blog and Telegram previews."
              className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md p-3 focus:border-cyan-500 outline-none font-mono leading-relaxed resize-y"
            />
            <div className="text-[10px] text-slate-400 mt-1 text-right">
              {state.content.length} chars
            </div>
          </div>

          {/* Media */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-slate-500 text-xs">Media (image or video, &lt; 4MB)</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAiImgOpen((v) => !v);
                  if (!aiImgPrompt) autoSeedImagePrompt();
                }}
                className={`h-7 text-[11px] hover:bg-violet-50 ${
                  aiImgOpen ? "bg-violet-100 text-violet-700" : "text-violet-700"
                }`}
                title="Generate an image with DALL-E 3"
              >
                <ImagePlus className="h-3 w-3 mr-1" /> Generate with AI
              </Button>
            </div>

            {/* AI image generation panel — collapsible. Calls
                aiDrafter.generateImage which proxies DALL-E 3 and
                re-hosts the result on R2. */}
            {aiImgOpen && (
              <div className="mb-2 rounded-lg border border-violet-200 bg-violet-50/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-violet-700">
                    DALL-E 3 image generator
                  </div>
                  <button
                    onClick={() => setAiImgOpen(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <textarea
                  value={aiImgPrompt}
                  onChange={(e) => setAiImgPrompt(e.target.value)}
                  rows={3}
                  placeholder="Describe the image. Be specific about style (e.g. 'minimal isometric illustration, cyan + slate palette, flat shading, no text in the image, premium fintech aesthetic')"
                  className="w-full bg-white/80 border border-violet-200 text-slate-800 text-xs rounded-md p-2 focus:border-violet-500 outline-none leading-relaxed resize-y"
                />
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={autoSeedImagePrompt}
                    className="h-7 text-[11px] text-violet-700 hover:bg-violet-100"
                    title="Auto-write a prompt from the current title and body"
                  >
                    <Sparkles className="h-3 w-3 mr-1" /> Auto-prompt from post
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-500 text-[10px]">Size</Label>
                    <select
                      value={aiImgSize}
                      onChange={(e) => setAiImgSize(e.target.value as any)}
                      className="w-full bg-white/80 border border-violet-200 text-slate-800 text-xs rounded h-8 px-2 outline-none focus:border-violet-500"
                    >
                      <option value="1024x1024">1024×1024 (square)</option>
                      <option value="1024x1792">1024×1792 (vertical)</option>
                      <option value="1792x1024">1792×1024 (horizontal)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-slate-500 text-[10px]">Quality</Label>
                    <select
                      value={aiImgQuality}
                      onChange={(e) => setAiImgQuality(e.target.value as any)}
                      className="w-full bg-white/80 border border-violet-200 text-slate-800 text-xs rounded h-8 px-2 outline-none focus:border-violet-500"
                    >
                      <option value="standard">Standard (~$0.04-0.08)</option>
                      <option value="hd">HD (~$0.08-0.12)</option>
                    </select>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleGenerateImage}
                  disabled={generateImageMut.isPending || !aiImgPrompt.trim()}
                  className="w-full bg-violet-600 text-white hover:bg-violet-700"
                >
                  {generateImageMut.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5 mr-1" />
                  )}
                  Generate & attach
                </Button>
                <div className="text-[10px] text-slate-500 flex items-start gap-1">
                  <DollarSign className="h-2.5 w-2.5 mt-0.5 shrink-0" />
                  <span>
                    Each generation calls OpenAI's paid DALL-E 3 API.
                    Image is auto-uploaded to your R2 bucket on success.
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 mt-1">
              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="text-cyan-700 border border-cyan-600/20 bg-cyan-600/5 hover:bg-cyan-600/10 w-full"
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {state.mediaUrl ? "Replace media" : "Upload image or video"}
                </Button>
                <Input
                  value={state.mediaUrl}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      mediaUrl: e.target.value,
                      mediaType:
                        e.target.value === ""
                          ? "none"
                          : /\.(mp4|mov|webm|mkv)(\?|$)/i.test(e.target.value)
                          ? "video"
                          : "image",
                    }))
                  }
                  placeholder="… or paste a public URL"
                  className="mt-2 bg-white/80 border-slate-200 text-slate-800 text-xs"
                />
              </div>
              {state.mediaUrl && (
                <div className="relative">
                  {state.mediaType === "video" ? (
                    <div className="w-24 h-24 rounded border border-slate-200 bg-slate-100 flex items-center justify-center">
                      <VideoIcon className="h-6 w-6 text-slate-400" />
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={state.mediaUrl}
                      alt=""
                      className="w-24 h-24 rounded border border-slate-200 object-cover"
                    />
                  )}
                  <button
                    onClick={() =>
                      setState((s) => ({ ...s, mediaUrl: "", mediaType: "none" }))
                    }
                    className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Channels */}
          <div>
            <Label className="text-slate-500 text-xs mb-1.5 block">Channels</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_CHANNELS.map((c) => {
                const checked = state.channels.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${
                      checked
                        ? "border-cyan-600/40 bg-cyan-600/5"
                        : "border-slate-200 bg-white/50 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          channels: e.target.checked
                            ? [...s.channels, c.id]
                            : s.channels.filter((x) => x !== c.id),
                        }))
                      }
                      className="mt-0.5 accent-cyan-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-700">{c.label}</div>
                      <div className="text-[10px] text-slate-400 leading-tight">{c.hint}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Inline keyboard buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-slate-500 text-xs">Telegram buttons (optional)</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    buttons: s.buttons.length >= 8 ? s.buttons : [...s.buttons, { text: "", url: "" }],
                  }))
                }
                className="h-6 text-[11px] text-cyan-700 hover:bg-cyan-50"
              >
                <Plus className="h-3 w-3 mr-1" /> Add button
              </Button>
            </div>
            {state.buttons.length === 0 && (
              <div className="text-[11px] text-slate-400 italic">
                No buttons. Add one to attach an inline-keyboard CTA to the Telegram message.
              </div>
            )}
            <div className="space-y-1.5">
              {state.buttons.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Input
                    value={b.text}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        buttons: s.buttons.map((bb, j) =>
                          i === j ? { ...bb, text: e.target.value } : bb
                        ),
                      }))
                    }
                    placeholder="Button text"
                    className="bg-white/80 border-slate-200 text-slate-800 text-xs flex-1"
                  />
                  <Input
                    value={b.url}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        buttons: s.buttons.map((bb, j) =>
                          i === j ? { ...bb, url: e.target.value } : bb
                        ),
                      }))
                    }
                    placeholder="https://…"
                    className="bg-white/80 border-slate-200 text-slate-800 text-xs flex-[2]"
                  />
                  <button
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        buttons: s.buttons.filter((_, j) => j !== i),
                      }))
                    }
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-700" />
            <h4 className="text-sm font-bold text-slate-800">Schedule</h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setState((s) => ({ ...s, scheduleType: "once" }))}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                state.scheduleType === "once"
                  ? "border-cyan-600/40 bg-cyan-600/10 text-cyan-700"
                  : "border-slate-200 bg-white/50 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Send className="h-3.5 w-3.5 inline mr-1" />
              One-time
            </button>
            <button
              onClick={() => setState((s) => ({ ...s, scheduleType: "recurring" }))}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                state.scheduleType === "recurring"
                  ? "border-cyan-600/40 bg-cyan-600/10 text-cyan-700"
                  : "border-slate-200 bg-white/50 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Repeat className="h-3.5 w-3.5 inline mr-1" />
              Recurring
            </button>
          </div>

          {state.scheduleType === "once" ? (
            <div>
              <Label className="text-slate-500 text-xs">Fire at (UTC)</Label>
              <Input
                type="datetime-local"
                value={state.nextRunAtUtc}
                onChange={(e) =>
                  setState((s) => ({ ...s, nextRunAtUtc: e.target.value }))
                }
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Resolves to {formatUtc(parseUtcInput(state.nextRunAtUtc))}. Cron polls every 5 min.
              </div>
            </div>
          ) : (
            <>
              <div>
                <Label className="text-slate-500 text-xs">Preset</Label>
                <select
                  value={state.cronExpression}
                  onChange={(e) =>
                    setState((s) => ({ ...s, cronExpression: e.target.value }))
                  }
                  className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md px-2 h-9 outline-none focus:border-cyan-500"
                >
                  {RECURRING_PRESETS.map((p) => (
                    <option key={p.cron} value={p.cron}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-500 text-xs">
                  Or custom 5-field UTC cron (min hour day month dow)
                </Label>
                <Input
                  value={state.cronExpression}
                  onChange={(e) =>
                    setState((s) => ({ ...s, cronExpression: e.target.value }))
                  }
                  placeholder="0 14 * * *"
                  className="bg-white/80 border-slate-200 text-slate-800 text-sm font-mono"
                />
              </div>
              <div>
                <Label className="text-slate-500 text-xs">First fire at (UTC)</Label>
                <Input
                  type="datetime-local"
                  value={state.nextRunAtUtc}
                  onChange={(e) =>
                    setState((s) => ({ ...s, nextRunAtUtc: e.target.value }))
                  }
                  className="bg-white/80 border-slate-200 text-slate-800 text-sm"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  After this fires, subsequent runs follow the cron expression.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Submit row */}
        <div className="flex flex-wrap gap-2">
          {!state.id && (
            <Button
              size="sm"
              onClick={() => submit("now")}
              disabled={submitting}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1" />
              )}
              Post now (next 5-min tick)
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => submit("scheduled")}
            disabled={submitting}
            className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20 hover:bg-cyan-600/20"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : state.id ? (
              <Save className="h-3.5 w-3.5 mr-1" />
            ) : state.scheduleType === "recurring" ? (
              <Repeat className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Calendar className="h-3.5 w-3.5 mr-1" />
            )}
            {state.id ? "Save changes" : state.scheduleType === "recurring" ? "Schedule recurring" : "Schedule once"}
          </Button>
        </div>
      </div>

      {/* ============ PREVIEWS PANE ============ */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-cyan-700" />
          <h3 className="text-lg font-heading font-bold text-slate-800">Live previews</h3>
        </div>

        {/* Blog preview */}
        <PreviewCard
          title="Blog"
          subtitle={
            state.channels.includes("blog")
              ? "Renders as a /blog/<slug> page"
              : "Selected channels don't include blog — preview only"
          }
          accent={state.channels.includes("blog") ? "emerald" : "slate"}
        >
          {state.title && (
            <h2 className="text-base font-heading font-bold text-slate-800 mb-1">
              {state.title}
            </h2>
          )}
          {state.mediaUrl && state.mediaType === "image" && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={state.mediaUrl}
              alt=""
              className="w-full max-h-48 object-cover rounded mb-2 border border-slate-200"
            />
          )}
          {state.mediaUrl && state.mediaType === "video" && (
            <div className="w-full h-32 mb-2 rounded border border-slate-200 bg-slate-100 flex items-center justify-center">
              <VideoIcon className="h-8 w-8 text-slate-400" />
            </div>
          )}
          <div
            className="prose prose-sm prose-slate max-w-none text-[13px]"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(state.content || "*Empty body*") }}
          />
        </PreviewCard>

        {/* Telegram preview */}
        <PreviewCard
          title="Telegram"
          subtitle={
            state.channels.filter((c) => c.startsWith("telegram_")).join(", ") ||
            "No telegram channel selected — preview only"
          }
          accent={
            state.channels.some((c) => c.startsWith("telegram_")) ? "emerald" : "slate"
          }
        >
          <div className="rounded-lg border border-slate-200 bg-white p-3 max-w-[420px]">
            {state.mediaUrl && state.mediaType === "image" && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={state.mediaUrl}
                alt=""
                className="w-full max-h-56 object-cover rounded mb-2"
              />
            )}
            {state.mediaUrl && state.mediaType === "video" && (
              <div className="w-full h-32 mb-2 rounded bg-slate-100 flex items-center justify-center">
                <VideoIcon className="h-8 w-8 text-slate-400" />
              </div>
            )}
            <div
              className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderTelegramHtml(state.title || null, state.content || "<i>(empty)</i>"),
              }}
            />
            {state.buttons.filter((b) => b.text && b.url).length > 0 && (
              <div className="mt-3 grid gap-1.5">
                {state.buttons
                  .filter((b) => b.text && b.url)
                  .map((b, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded bg-cyan-50 text-cyan-700 text-xs font-bold text-center border border-cyan-200"
                    >
                      {b.text}
                    </div>
                  ))}
              </div>
            )}
            <div className="text-[10px] text-slate-400 mt-2">
              Caption length: {renderTelegramHtml(state.title || null, state.content).length} / 1000 max
            </div>
          </div>
        </PreviewCard>

        {/* WhatsApp preview */}
        <PreviewCard
          title="WhatsApp"
          subtitle="Manual share — copy and paste into your groups"
          accent="cyan"
        >
          <pre className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded p-3 whitespace-pre-wrap break-words">
{buildWhatsappText(state.title || null, state.content, ctaUrlPreview || undefined) || "(empty)"}
          </pre>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const text = buildWhatsappText(
                state.title || null,
                state.content,
                ctaUrlPreview || undefined
              );
              if (!text) return;
              navigator.clipboard.writeText(text).then(
                () => toast.success("Copied"),
                () => toast.error("Clipboard blocked")
              );
            }}
            className="mt-2 text-cyan-700 hover:bg-cyan-50"
          >
            Copy for WhatsApp
          </Button>
        </PreviewCard>
      </div>
    </div>
  );
}

// ─── Translate dropdown — three target languages ───
function TranslateDropdown(props: {
  disabled: boolean;
  loading: boolean;
  onPick: (target: "de" | "hi" | "id") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        disabled={props.disabled}
        className="h-7 text-[11px] text-cyan-700 hover:bg-cyan-50"
        title="Translate the current content"
      >
        {props.loading ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : (
          <Languages className="h-3 w-3 mr-1" />
        )}
        Translate
        <ChevronDown className="h-3 w-3 ml-1" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 rounded-lg border border-slate-200 bg-white shadow-lg min-w-[180px] overflow-hidden">
          {[
            { id: "de" as const, label: "German (Deutsch)", flag: "🇩🇪" },
            { id: "hi" as const, label: "Hindi (हिन्दी)", flag: "🇮🇳" },
            { id: "id" as const, label: "Indonesian", flag: "🇮🇩" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                props.onPick(opt.id);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-cyan-50 flex items-center gap-2"
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewCard(props: {
  title: string;
  subtitle: string;
  accent: "emerald" | "cyan" | "slate";
  children: React.ReactNode;
}) {
  const accentClass = {
    emerald: "border-emerald-300/60",
    cyan: "border-cyan-300/60",
    slate: "border-slate-200",
  }[props.accent];
  return (
    <div className={`rounded-xl border ${accentClass} bg-white/70 backdrop-blur-xl p-4`}>
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="text-sm font-bold text-slate-800">{props.title}</h4>
        <span className="text-[11px] text-slate-500">{props.subtitle}</span>
      </div>
      {props.children}
    </div>
  );
}

// ============ QUEUE VIEW ============

function QueueView(props: { onEdit: (post: any) => void }) {
  const utils = trpc.useUtils();
  const listQuery = trpc.manage.scheduledPosts.list.useQuery({ limit: 200 });
  const pauseMut = trpc.manage.scheduledPosts.pause.useMutation({
    onSuccess: () => utils.manage.scheduledPosts.list.invalidate(),
  });
  const resumeMut = trpc.manage.scheduledPosts.resume.useMutation({
    onSuccess: () => utils.manage.scheduledPosts.list.invalidate(),
  });
  const runNowMut = trpc.manage.scheduledPosts.runNow.useMutation({
    onSuccess: () => {
      utils.manage.scheduledPosts.list.invalidate();
      toast.success("Will fire on next 5-min cron tick");
    },
  });
  const deleteMut = trpc.manage.scheduledPosts.delete.useMutation({
    onSuccess: () => {
      utils.manage.scheduledPosts.list.invalidate();
      toast.success("Deleted");
    },
  });

  const rows = listQuery.data ?? [];

  const groups = useMemo(() => {
    const pending: any[] = [];
    const recurring: any[] = [];
    const completed: any[] = [];
    const failed: any[] = [];
    const paused: any[] = [];
    for (const r of rows) {
      if (r.status === "failed") failed.push(r);
      else if (r.status === "paused") paused.push(r);
      else if (r.status === "completed") completed.push(r);
      else if (r.scheduleType === "recurring") recurring.push(r);
      else pending.push(r);
    }
    return { pending, recurring, paused, failed, completed };
  }, [rows]);

  if (listQuery.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl p-10 flex items-center justify-center text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading queue…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl p-10 text-center text-sm text-slate-500">
        Queue is empty. Switch to <b>Compose</b> to create your first scheduled post.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <QueueTable
        title="Pending — one-time"
        rows={groups.pending}
        onEdit={props.onEdit}
        onPause={(id) => pauseMut.mutate({ id })}
        onResume={(id) => resumeMut.mutate({ id })}
        onRunNow={(id) => runNowMut.mutate({ id })}
        onDelete={(id) => {
          if (confirm("Delete this scheduled post?")) deleteMut.mutate({ id });
        }}
      />
      <QueueTable
        title="Recurring"
        rows={groups.recurring}
        onEdit={props.onEdit}
        onPause={(id) => pauseMut.mutate({ id })}
        onResume={(id) => resumeMut.mutate({ id })}
        onRunNow={(id) => runNowMut.mutate({ id })}
        onDelete={(id) => {
          if (confirm("Delete this recurring post?")) deleteMut.mutate({ id });
        }}
      />
      <QueueTable
        title="Paused"
        rows={groups.paused}
        onEdit={props.onEdit}
        onPause={(id) => pauseMut.mutate({ id })}
        onResume={(id) => resumeMut.mutate({ id })}
        onRunNow={(id) => runNowMut.mutate({ id })}
        onDelete={(id) => {
          if (confirm("Delete?")) deleteMut.mutate({ id });
        }}
      />
      <QueueTable
        title="Failed"
        rows={groups.failed}
        onEdit={props.onEdit}
        onPause={(id) => pauseMut.mutate({ id })}
        onResume={(id) => resumeMut.mutate({ id })}
        onRunNow={(id) => runNowMut.mutate({ id })}
        onDelete={(id) => {
          if (confirm("Delete?")) deleteMut.mutate({ id });
        }}
        showError
      />
      <QueueTable
        title="Completed"
        rows={groups.completed}
        onEdit={props.onEdit}
        onPause={(id) => pauseMut.mutate({ id })}
        onResume={(id) => resumeMut.mutate({ id })}
        onRunNow={(id) => runNowMut.mutate({ id })}
        onDelete={(id) => {
          if (confirm("Delete?")) deleteMut.mutate({ id });
        }}
      />
    </div>
  );
}

function QueueTable(props: {
  title: string;
  rows: any[];
  onEdit: (post: any) => void;
  onPause: (id: number) => void;
  onResume: (id: number) => void;
  onRunNow: (id: number) => void;
  onDelete: (id: number) => void;
  showError?: boolean;
}) {
  if (props.rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <h4 className="text-sm font-bold text-slate-800">{props.title}</h4>
        <span className="text-xs text-slate-400">({props.rows.length})</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-100">
            <th className="px-4 py-2 font-semibold">#</th>
            <th className="px-4 py-2 font-semibold">Title / preview</th>
            <th className="px-4 py-2 font-semibold">Channels</th>
            <th className="px-4 py-2 font-semibold">Next run (UTC)</th>
            <th className="px-4 py-2 font-semibold">Fires</th>
            <th className="px-4 py-2 font-semibold">Status</th>
            <th className="px-4 py-2 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2 font-mono text-[11px] text-slate-500">#{r.id}</td>
              <td className="px-4 py-2 max-w-[260px]">
                <div className="text-xs font-medium text-slate-700 truncate">
                  {r.title || <span className="italic text-slate-400">(no title)</span>}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {r.content.slice(0, 80)}
                </div>
                {props.showError && r.lastError && (
                  <div className="text-[11px] text-red-600 mt-1 flex items-start gap-1">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{r.lastError}</span>
                  </div>
                )}
              </td>
              <td className="px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {(r.channels as string[]).map((c) => (
                    <span
                      key={c}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-2 text-xs text-slate-600 whitespace-nowrap">
                {formatUtc(r.nextRunAt)}
                {r.scheduleType === "recurring" && (
                  <div className="text-[10px] text-slate-400 font-mono">{r.cronExpression}</div>
                )}
              </td>
              <td className="px-4 py-2 text-xs text-slate-600 text-center">{r.fireCount}</td>
              <td className="px-4 py-2">
                <StatusPill status={r.status} />
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center justify-end gap-1">
                  <IconBtn title="Edit" onClick={() => props.onEdit(r)}>
                    <Edit3 className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn title="Run now" onClick={() => props.onRunNow(r.id)}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </IconBtn>
                  {r.status === "paused" ? (
                    <IconBtn title="Resume" onClick={() => props.onResume(r.id)}>
                      <PlayCircle className="h-3.5 w-3.5" />
                    </IconBtn>
                  ) : (
                    <IconBtn title="Pause" onClick={() => props.onPause(r.id)}>
                      <PauseCircle className="h-3.5 w-3.5" />
                    </IconBtn>
                  )}
                  <IconBtn
                    title="Delete"
                    onClick={() => props.onDelete(r.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IconBtn(props: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      title={props.title}
      onClick={props.onClick}
      className={`p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition ${
        props.className || ""
      }`}
    >
      {props.children}
    </button>
  );
}

function StatusPill(props: { status: string }) {
  const map: Record<string, { className: string; icon: any; label: string }> = {
    pending:   { className: "bg-amber-100 text-amber-700",     icon: Clock,         label: "pending" },
    running:   { className: "bg-cyan-100 text-cyan-700",       icon: Loader2,       label: "running" },
    completed: { className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2,  label: "completed" },
    paused:    { className: "bg-slate-100 text-slate-700",     icon: PauseCircle,   label: "paused" },
    failed:    { className: "bg-red-100 text-red-700",         icon: AlertTriangle, label: "failed" },
  };
  const c = map[props.status] || map.pending;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${c.className}`}>
      <Icon className={`h-3 w-3 ${props.status === "running" ? "animate-spin" : ""}`} />
      {c.label}
    </span>
  );
}

// ============ CAMPAIGN BUILDER MODAL ============
// Takes a high-level topic, calls aiDrafter.generateCampaign for N posts,
// renders each as an editable card, optionally batch-generates DALL-E
// images for each post (sequential — rate-limit safe + progress UX),
// then bulk-creates scheduled_posts rows with staggered nextRunAt.
//
// Default cadence: one post per day at 14:00 UTC starting tomorrow.
// User can change start date + spacing (hours). Channels inherit from
// the parent Composer at modal-open time; user can override per-post.

type CampaignDraftPost = {
  day: number;
  title: string;
  content: string;
  telegramCaption: string;
  imagePrompt: string;
  // Per-post overrides applied locally before bulk-schedule:
  generatedImageUrl?: string;
  channels: ChannelId[];
  imageStatus?: "idle" | "generating" | "done" | "failed";
  imageError?: string;
};

function CampaignBuilderModal(props: {
  defaultChannels: ChannelId[];
  onClose: () => void;
  onScheduled: () => void;
}) {
  const utils = trpc.useUtils();

  // ─── Generation inputs ───
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState<number>(3);
  const [tone, setTone] = useState<"professional" | "hype" | "educational">("professional");
  const [audience, setAudience] = useState<"newcomer" | "intermediate" | "expert">("intermediate");

  // ─── Generated drafts ───
  const [drafts, setDrafts] = useState<CampaignDraftPost[] | null>(null);

  // ─── Scheduling inputs (default: tomorrow @ 14:00 UTC, +1 day per post) ───
  const tomorrow14 = useMemo(() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(14, 0, 0, 0);
    return d;
  }, []);
  const [startAtUtc, setStartAtUtc] = useState<string>(utcInputValue(tomorrow14));
  const [spacingHours, setSpacingHours] = useState<number>(24);

  // ─── Image gen progress ───
  const [imgProgress, setImgProgress] = useState<{ done: number; total: number } | null>(null);

  const generateCampaignMut = trpc.aiDrafter.generateCampaign.useMutation();
  const generateImageMut = trpc.aiDrafter.generateImage.useMutation();
  const createScheduledMut = trpc.manage.scheduledPosts.create.useMutation();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic first");
      return;
    }
    try {
      const r = await generateCampaignMut.mutateAsync({
        topic: topic.trim(),
        count,
        audienceLevel: audience,
        tone,
      });
      const posts: CampaignDraftPost[] = (r.posts || []).map((p: any, i: number) => ({
        day: p.day ?? i + 1,
        title: p.title ?? "",
        content: p.content ?? "",
        telegramCaption: p.telegramCaption ?? "",
        imagePrompt: p.imagePrompt ?? "",
        channels: [...props.defaultChannels],
        imageStatus: "idle",
      }));
      setDrafts(posts);
      toast.success(`Generated ${posts.length} posts`);
    } catch (e) {
      toast.error(`Generation failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleGenerateAllImages = async () => {
    if (!drafts) return;
    if (!isCostAcked()) {
      const ok = window.confirm(
        `Generate ${drafts.length} DALL-E 3 standard images?\n\n` +
          `Approx cost: $${(drafts.length * 0.04).toFixed(2)}. ` +
          `Runs sequentially to respect rate limits.\n\n` +
          `This message won't show again this session.`
      );
      if (!ok) return;
      ackCost();
    }
    setImgProgress({ done: 0, total: drafts.length });
    for (let i = 0; i < drafts.length; i++) {
      setDrafts((cur) =>
        cur ? cur.map((d, j) => (i === j ? { ...d, imageStatus: "generating" } : d)) : cur
      );
      try {
        const r = await generateImageMut.mutateAsync({
          prompt: drafts[i].imagePrompt,
          size: "1024x1024",
          quality: "standard",
        });
        setDrafts((cur) =>
          cur
            ? cur.map((d, j) =>
                i === j ? { ...d, imageStatus: "done", generatedImageUrl: r.url, imageError: undefined } : d
              )
            : cur
        );
      } catch (err) {
        setDrafts((cur) =>
          cur
            ? cur.map((d, j) =>
                i === j
                  ? { ...d, imageStatus: "failed", imageError: err instanceof Error ? err.message : String(err) }
                  : d
              )
            : cur
        );
      }
      setImgProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    setImgProgress(null);
    toast.success("Image batch complete");
  };

  const handleScheduleAll = async () => {
    if (!drafts || drafts.length === 0) return;
    const start = parseUtcInput(startAtUtc);
    let scheduledCount = 0;
    for (let i = 0; i < drafts.length; i++) {
      const p = drafts[i];
      if (p.channels.length === 0) continue; // Skip posts with no channels selected
      const fireAt = new Date(start.getTime() + i * spacingHours * 60 * 60 * 1000);
      // Per spec: the Telegram caption goes in the body for Telegram-only
      // sends, but the full Markdown content goes for blog sends. Our
      // scheduled_posts table stores ONE body, so we pick:
      //   - If any blog channel: use the full Markdown content (the
      //     cron's buildTelegramCaption will truncate for Telegram).
      //   - Otherwise: use the Telegram caption verbatim.
      const usesBlog = p.channels.includes("blog");
      const body = usesBlog ? p.content : (p.telegramCaption || p.content);
      try {
        await createScheduledMut.mutateAsync({
          title: p.title || null,
          content: body,
          mediaUrl: p.generatedImageUrl || null,
          mediaType: p.generatedImageUrl ? "image" : "none",
          channels: p.channels,
          buttons: [],
          scheduleType: "once",
          cronExpression: null,
          nextRunAt: fireAt.toISOString(),
        } as any);
        scheduledCount++;
      } catch (e) {
        toast.error(`Post #${i + 1} failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    utils.manage.scheduledPosts.list.invalidate();
    if (scheduledCount > 0) {
      toast.success(`Scheduled ${scheduledCount} of ${drafts.length} posts`);
      props.onScheduled();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-violet-600/5 to-cyan-600/5">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-violet-700" />
            <h3 className="text-base font-heading font-bold text-slate-800">Campaign Builder</h3>
          </div>
          <button onClick={props.onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!drafts ? (
            /* ─── STEP 1: configure + generate ─── */
            <div className="space-y-4 max-w-2xl mx-auto">
              <div>
                <Label className="text-slate-500 text-xs">Campaign topic</Label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  placeholder="e.g. The $TURBO launch — why ops-routed trade tax is the model, build excitement across 5 days leading to mainnet"
                  className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md p-3 focus:border-violet-500 outline-none resize-y"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-slate-500 text-xs">Posts</Label>
                  <select
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value, 10))}
                    className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md h-9 px-2 outline-none focus:border-violet-500"
                  >
                    {[3, 4, 5, 6, 7].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Tone</Label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md h-9 px-2 outline-none focus:border-violet-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="hype">Hype</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Audience</Label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                    className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md h-9 px-2 outline-none focus:border-violet-500"
                  >
                    <option value="newcomer">Newcomer</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={generateCampaignMut.isPending || !topic.trim()}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white hover:shadow-md"
              >
                {generateCampaignMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-1" />
                )}
                Generate {count}-post campaign
              </Button>
              <div className="text-[11px] text-slate-500 text-center">
                Uses Claude Sonnet 4.5. Generation takes ~15-45 seconds depending on post count.
              </div>
            </div>
          ) : (
            /* ─── STEP 2: edit + bulk schedule ─── */
            <div className="space-y-4">
              {/* Top action bar */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Topic: <span className="text-violet-700">{topic}</span>
                  </h4>
                  <div className="text-xs text-slate-500">
                    {drafts.length} draft post{drafts.length === 1 ? "" : "s"} — edit inline, generate images, then bulk-schedule.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDrafts(null)}
                    className="text-slate-500 hover:bg-slate-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Re-generate
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGenerateAllImages}
                    disabled={!!imgProgress || drafts.every((d) => d.imageStatus === "done")}
                    className="bg-violet-600 text-white hover:bg-violet-700"
                  >
                    {imgProgress ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <ImagePlus className="h-3.5 w-3.5 mr-1" />
                    )}
                    {imgProgress
                      ? `Generating ${imgProgress.done}/${imgProgress.total}…`
                      : `Generate ${drafts.length} images`}
                  </Button>
                </div>
              </div>

              {/* Schedule inputs */}
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div>
                  <Label className="text-slate-500 text-xs">First post fires at (UTC)</Label>
                  <Input
                    type="datetime-local"
                    value={startAtUtc}
                    onChange={(e) => setStartAtUtc(e.target.value)}
                    className="bg-white/80 border-slate-200 text-slate-800 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Spacing between posts</Label>
                  <select
                    value={spacingHours}
                    onChange={(e) => setSpacingHours(parseInt(e.target.value, 10))}
                    className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md h-9 px-2 outline-none focus:border-violet-500"
                  >
                    <option value={6}>Every 6 hours</option>
                    <option value={12}>Every 12 hours</option>
                    <option value={24}>Every day (24h)</option>
                    <option value={48}>Every 2 days (48h)</option>
                    <option value={72}>Every 3 days (72h)</option>
                  </select>
                </div>
              </div>

              {/* Draft cards */}
              <div className="space-y-3">
                {drafts.map((d, i) => (
                  <CampaignDraftCard
                    key={i}
                    index={i}
                    draft={d}
                    onChange={(patch) =>
                      setDrafts((cur) =>
                        cur ? cur.map((x, j) => (i === j ? { ...x, ...patch } : x)) : cur
                      )
                    }
                    onRemove={() =>
                      setDrafts((cur) => (cur ? cur.filter((_, j) => j !== i) : cur))
                    }
                    fireAt={new Date(parseUtcInput(startAtUtc).getTime() + i * spacingHours * 60 * 60 * 1000)}
                  />
                ))}
              </div>

              {/* Bulk schedule action */}
              <div className="sticky bottom-0 -mx-5 -mb-5 px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {drafts.filter((d) => d.channels.length > 0).length} of {drafts.length} posts will be scheduled
                  (posts with no channels are skipped)
                </div>
                <Button
                  size="sm"
                  onClick={handleScheduleAll}
                  disabled={createScheduledMut.isPending || drafts.every((d) => d.channels.length === 0)}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {createScheduledMut.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                  )}
                  Schedule all to queue
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CampaignDraftCard(props: {
  index: number;
  draft: CampaignDraftPost;
  onChange: (patch: Partial<CampaignDraftPost>) => void;
  onRemove: () => void;
  fireAt: Date;
}) {
  const { draft, onChange, onRemove, index } = props;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/70 p-3 space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            {draft.day}
          </span>
          <span className="text-[11px] text-slate-500">
            Fires {formatUtc(props.fireAt)}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
          title={`Remove post #${index + 1}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <Input
        value={draft.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Post title"
        className="bg-white/80 border-slate-200 text-slate-800 text-sm font-bold"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <Label className="text-slate-500 text-[10px]">Blog body (Markdown)</Label>
          <textarea
            value={draft.content}
            onChange={(e) => onChange({ content: e.target.value })}
            rows={5}
            className="w-full bg-white/80 border border-slate-200 text-slate-800 text-xs rounded-md p-2 focus:border-violet-500 outline-none font-mono leading-relaxed resize-y"
          />
        </div>
        <div>
          <Label className="text-slate-500 text-[10px]">Telegram caption</Label>
          <textarea
            value={draft.telegramCaption}
            onChange={(e) => onChange({ telegramCaption: e.target.value })}
            rows={5}
            className="w-full bg-white/80 border border-slate-200 text-slate-800 text-xs rounded-md p-2 focus:border-violet-500 outline-none leading-relaxed resize-y"
          />
          <div className="text-[10px] text-slate-400 mt-0.5 text-right">
            {draft.telegramCaption.length} / 900 chars
          </div>
        </div>
      </div>

      <div>
        <Label className="text-slate-500 text-[10px]">Image prompt (DALL-E 3)</Label>
        <div className="flex items-start gap-2">
          <textarea
            value={draft.imagePrompt}
            onChange={(e) => onChange({ imagePrompt: e.target.value })}
            rows={2}
            className="flex-1 bg-white/80 border border-slate-200 text-slate-800 text-xs rounded-md p-2 focus:border-violet-500 outline-none leading-relaxed resize-y"
          />
          {draft.generatedImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={draft.generatedImageUrl}
              alt=""
              className="w-20 h-20 rounded border border-slate-200 object-cover"
            />
          ) : draft.imageStatus === "generating" ? (
            <div className="w-20 h-20 rounded border border-violet-200 bg-violet-50 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
            </div>
          ) : draft.imageStatus === "failed" ? (
            <div className="w-20 h-20 rounded border border-red-200 bg-red-50 flex items-center justify-center text-red-500 text-[10px] text-center px-1" title={draft.imageError}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-[10px]">
              No image
            </div>
          )}
        </div>
      </div>

      {/* Channel checkboxes — per-post override */}
      <div>
        <Label className="text-slate-500 text-[10px] mb-1 block">Channels for this post</Label>
        <div className="flex flex-wrap gap-1">
          {ALL_CHANNELS.map((c) => {
            const checked = draft.channels.includes(c.id);
            return (
              <label
                key={c.id}
                className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer text-[11px] transition ${
                  checked
                    ? "border-cyan-600/40 bg-cyan-600/5 text-cyan-700"
                    : "border-slate-200 bg-white/50 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    onChange({
                      channels: e.target.checked
                        ? [...draft.channels, c.id]
                        : draft.channels.filter((x) => x !== c.id),
                    })
                  }
                  className="accent-cyan-600"
                />
                {c.label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
