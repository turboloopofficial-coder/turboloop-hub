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

  return (
    <div className="space-y-6">
      {/* Inner-tab pills */}
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
  const uploadMedia = trpc.manage.uploadImage.useMutation();

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
            <div className="flex items-center justify-between mb-1">
              <Label className="text-slate-500 text-xs">Body (Markdown)</Label>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEnhanceTelegram}
                  disabled={enhanceTg.isPending || !state.content.trim()}
                  className="h-7 text-[11px] text-cyan-700 hover:bg-cyan-50"
                >
                  {enhanceTg.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Wand2 className="h-3 w-3 mr-1" />
                  )}
                  Enhance for Telegram
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleExpandBlog}
                  disabled={expandBlog.isPending || !state.content.trim()}
                  className="h-7 text-[11px] text-cyan-700 hover:bg-cyan-50"
                >
                  {expandBlog.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  Expand for Blog
                </Button>
              </div>
            </div>
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
            <Label className="text-slate-500 text-xs">Media (image or video, &lt; 4MB)</Label>
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
