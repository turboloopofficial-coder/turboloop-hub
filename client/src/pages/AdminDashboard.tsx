import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  LogOut,
  PenLine,
  Eye,
  EyeOff,
  X,
  ExternalLink,
  FileText,
  Settings,
  Sparkles,
  Inbox,
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import AIDrafter from "@/components/admin/AIDrafter";
import SubmissionsManager from "@/components/admin/SubmissionsManager";

// ============ Blog Manager ============
function BlogManager() {
  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.manage.listBlogPosts.useQuery();
  const createPost = trpc.manage.createBlogPost.useMutation({
    onSuccess: () => {
      utils.manage.listBlogPosts.invalidate();
      toast.success("Post created");
      resetForm();
    },
  });
  const deletePost = trpc.manage.deleteBlogPost.useMutation({
    onSuccess: () => {
      utils.manage.listBlogPosts.invalidate();
      toast.success("Post deleted");
    },
  });
  const updatePost = trpc.manage.updateBlogPost.useMutation({
    onSuccess: () => {
      utils.manage.listBlogPosts.invalidate();
      toast.success("Post updated");
      setEditId(null);
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverImage("");
  };

  const startEdit = (post: any) => {
    setEditId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || "");
    setContent(post.content || "");
    setCoverImage(post.coverImage || "");
    setShowForm(true);
  };

  const autoSlug = (t: string) => {
    setTitle(t);
    if (!editId) {
      setSlug(
        t
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-slate-800">
          Blog Posts
        </h3>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20 hover:bg-cyan-600/20"
        >
          <Plus className="h-4 w-4 mr-1" /> New Post
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-cyan-700">
              {editId ? "Edit Post" : "New Blog Post"}
            </h4>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-500 text-xs">Title</Label>
              <Input
                value={title}
                onChange={e => autoSlug(e.target.value)}
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Slug (URL)</Label>
              <Input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="my-post-url"
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-slate-500 text-xs">
              Excerpt (short summary)
            </Label>
            <Input
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="A brief summary shown in the blog grid..."
              className="bg-white/80 border-slate-200 text-slate-800 text-sm"
            />
          </div>
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            label="Cover Image"
          />
          <div>
            <Label className="text-slate-500 text-xs">
              Content (Markdown supported)
            </Label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={12}
              placeholder="Write your blog post content here... Markdown is supported."
              className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md p-3 focus:border-cyan-500 outline-none font-mono leading-relaxed"
            />
          </div>
          <div className="flex gap-2">
            {editId ? (
              <Button
                size="sm"
                onClick={() =>
                  updatePost.mutate({
                    id: editId,
                    title,
                    slug,
                    excerpt,
                    content,
                    coverImage: coverImage || null,
                  })
                }
                disabled={updatePost.isPending}
                className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20"
              >
                {updatePost.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}{" "}
                Update Post
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() =>
                  createPost.mutate({
                    title,
                    slug,
                    excerpt,
                    content,
                    coverImage: coverImage || undefined,
                    published: true,
                  })
                }
                disabled={createPost.isPending || !title || !slug || !content}
                className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20"
              >
                {createPost.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}{" "}
                Publish
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={resetForm}
              className="text-slate-400"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-cyan-600 mx-auto" />
      ) : (
        <div className="space-y-2">
          {posts?.map(post => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white/60 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={`${post.title} cover`}
                    className="w-12 h-8 object-cover rounded shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    /blog/{post.slug} &middot;{" "}
                    {post.published ? "Published" : "Draft"}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(post)}
                  className="text-slate-400 hover:text-cyan-600"
                >
                  <PenLine className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    updatePost.mutate({
                      id: post.id,
                      published: !post.published,
                    })
                  }
                  className="text-slate-400 hover:text-cyan-600"
                >
                  {post.published ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this post?"))
                      deletePost.mutate({ id: post.id });
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {posts?.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No blog posts yet. Click "New Post" to create one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============ Video Manager ============
function VideoManager() {
  const utils = trpc.useUtils();
  const { data: videos, isLoading } = trpc.manage.listVideos.useQuery();
  const createVideo = trpc.manage.createVideo.useMutation({
    onSuccess: () => {
      utils.manage.listVideos.invalidate();
      toast.success("Video added");
      setShowForm(false);
    },
  });
  const deleteVideo = trpc.manage.deleteVideo.useMutation({
    onSuccess: () => {
      utils.manage.listVideos.invalidate();
      toast.success("Video deleted");
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [category, setCategory] = useState<
    "presentation" | "how-to-join" | "withdraw-compound" | "other"
  >("presentation");
  const [language, setLanguage] = useState("English");
  const [languageFlag, setLanguageFlag] = useState("🇬🇧");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-slate-800">
          Videos
        </h3>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20 hover:bg-cyan-600/20"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Video
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-cyan-700">Add New Video</h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <Label className="text-slate-500 text-xs">Title</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-white/80 border-slate-200 text-slate-800 text-sm"
            />
          </div>
          <div>
            <Label className="text-slate-500 text-xs">YouTube URL</Label>
            <Input
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://youtu.be/..."
              className="bg-white/80 border-slate-200 text-slate-800 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-slate-500 text-xs">Category</Label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as typeof category)}
                className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md p-2"
              >
                <option value="presentation">Presentation</option>
                <option value="how-to-join">How to Join</option>
                <option value="withdraw-compound">Withdraw/Compound</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Language</Label>
              <Input
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Flag Emoji</Label>
              <Input
                value={languageFlag}
                onChange={e => setLanguageFlag(e.target.value)}
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                createVideo.mutate({
                  title,
                  youtubeUrl,
                  category,
                  language,
                  languageFlag,
                  published: true,
                })
              }
              disabled={createVideo.isPending || !title}
              className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20"
            >
              {createVideo.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}{" "}
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="text-slate-400"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-cyan-600 mx-auto" />
      ) : (
        <div className="space-y-2">
          {videos?.map(v => (
            <div
              key={v.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white/60 backdrop-blur-sm"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {v.languageFlag} {v.title}
                </p>
                <p className="text-xs text-slate-400">
                  {v.category} &middot; {v.language}
                </p>
              </div>
              <div className="flex gap-1">
                {v.youtubeUrl && (
                  <a
                    href={v.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-cyan-600"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete?")) deleteVideo.mutate({ id: v.id });
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {videos?.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No videos yet. Click "Add Video" to add one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============ Event Manager ============
function EventManager() {
  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.manage.listEvents.useQuery();
  const createEvent = trpc.manage.createEvent.useMutation({
    onSuccess: () => {
      utils.manage.listEvents.invalidate();
      toast.success("Event created");
      setShowForm(false);
    },
  });
  const deleteEvent = trpc.manage.deleteEvent.useMutation({
    onSuccess: () => {
      utils.manage.listEvents.invalidate();
      toast.success("Event deleted");
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [frequency, setFrequency] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [passcode, setPasscode] = useState("");
  const [language, setLanguage] = useState("English");
  const [status, setStatus] = useState<
    "upcoming" | "live" | "completed" | "recurring"
  >("recurring");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-slate-800">
          Events & Meetings
        </h3>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20 hover:bg-cyan-600/20"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-cyan-700">Add New Event</h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <Label className="text-slate-500 text-xs">Title</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-white/80 border-slate-200 text-slate-800 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-slate-500 text-xs">Date/Time</Label>
              <Input
                value={dateTime}
                onChange={e => setDateTime(e.target.value)}
                placeholder="5:00 PM"
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Timezone</Label>
              <Input
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Frequency</Label>
              <Input
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                placeholder="Every Day"
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-500 text-xs">Meeting Link</Label>
              <Input
                value={meetingLink}
                onChange={e => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
            <div>
              <Label className="text-slate-500 text-xs">
                Passcode (optional)
              </Label>
              <Input
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-500 text-xs">Language</Label>
              <Input
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Status</Label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as typeof status)}
                className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md p-2"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="recurring">Recurring</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                createEvent.mutate({
                  title,
                  dateTime,
                  timezone,
                  frequency: frequency || undefined,
                  meetingLink,
                  passcode: passcode || undefined,
                  language,
                  status,
                  published: true,
                })
              }
              disabled={createEvent.isPending || !title || !meetingLink}
              className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20"
            >
              {createEvent.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}{" "}
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="text-slate-400"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-cyan-600 mx-auto" />
      ) : (
        <div className="space-y-2">
          {events?.map(ev => (
            <div
              key={ev.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white/60 backdrop-blur-sm"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{ev.title}</p>
                <p className="text-xs text-slate-400">
                  {ev.dateTime} {ev.timezone} &middot; {ev.status}{" "}
                  {ev.frequency ? `&middot; ${ev.frequency}` : ""}
                </p>
              </div>
              <div className="flex gap-1">
                {ev.meetingLink && (
                  <a
                    href={ev.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-cyan-600"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete?")) deleteEvent.mutate({ id: ev.id });
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {events?.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No events yet. Click "Add Event" to create one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============ Leaderboard Manager ============
function LeaderboardManager() {
  const utils = trpc.useUtils();
  const { data: entries, isLoading } = trpc.manage.leaderboard.useQuery();
  const updateEntry = trpc.manage.updateLeaderboard.useMutation({
    onSuccess: () => {
      utils.manage.leaderboard.invalidate();
      toast.success("Updated");
    },
  });

  const [editRank, setEditRank] = useState<number | null>(null);
  const [editCountry, setEditCountry] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editScore, setEditScore] = useState(0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-bold text-slate-800">
        Country Leaderboard
      </h3>
      <p className="text-xs text-slate-400">
        Click the edit icon to modify country rankings, scores, and
        descriptions.
      </p>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-cyan-600 mx-auto" />
      ) : (
        <div className="space-y-2">
          {entries?.map(entry => (
            <div
              key={entry.rank}
              className="p-3 rounded-lg border border-slate-200 bg-white/60 backdrop-blur-sm"
            >
              {editRank === entry.rank ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      value={editCountry}
                      onChange={e => setEditCountry(e.target.value)}
                      placeholder="Country"
                      className="bg-white/80 border-slate-200 text-slate-800 text-sm"
                    />
                    <Input
                      value={editCode}
                      onChange={e => setEditCode(e.target.value)}
                      placeholder="Code (e.g. de)"
                      className="bg-white/80 border-slate-200 text-slate-800 text-sm"
                    />
                    <Input
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      placeholder="Description"
                      className="bg-white/80 border-slate-200 text-slate-800 text-sm"
                    />
                    <Input
                      type="number"
                      value={editScore}
                      onChange={e => setEditScore(Number(e.target.value))}
                      min={0}
                      max={100}
                      className="bg-white/80 border-slate-200 text-slate-800 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        updateEntry.mutate({
                          rank: entry.rank,
                          country: editCountry,
                          countryCode: editCode,
                          description: editDesc,
                          score: editScore,
                        });
                        setEditRank(null);
                      }}
                      className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20 text-xs"
                    >
                      <Save className="h-3 w-3 mr-1" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditRank(null)}
                      className="text-slate-500 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 w-8">
                      #{entry.rank}
                    </span>
                    <img
                      src={`https://flagcdn.com/w40/${entry.countryCode.toLowerCase()}.png`}
                      alt={`${entry.country} flag`}
                      className="w-8 h-5 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {entry.country} —{" "}
                        <span className="text-cyan-600">{entry.score}%</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditRank(entry.rank);
                      setEditCountry(entry.country);
                      setEditCode(entry.countryCode);
                      setEditDesc(entry.description);
                      setEditScore(entry.score);
                    }}
                    className="text-slate-400 hover:text-cyan-600"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Promotion Manager ============
function PromotionManager() {
  const utils = trpc.useUtils();
  const { data: promos, isLoading } = trpc.manage.listPromotions.useQuery();
  const updatePromo = trpc.manage.updatePromotion.useMutation({
    onSuccess: () => {
      utils.manage.listPromotions.invalidate();
      toast.success("Promotion updated");
      setEditId(null);
    },
  });
  const createPromo = trpc.manage.createPromotion.useMutation({
    onSuccess: () => {
      utils.manage.listPromotions.invalidate();
      toast.success("Promotion created");
      setShowForm(false);
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-slate-800">
          Promotions
        </h3>
        <Button
          size="sm"
          onClick={() => setShowForm(true)}
          className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20 hover:bg-cyan-600/20"
        >
          <Plus className="h-4 w-4 mr-1" /> New Promotion
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-cyan-700">New Promotion</h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-500 text-xs">Title</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Slug</Label>
              <Input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-slate-500 text-xs">Subtitle</Label>
            <Input
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className="bg-white/80 border-slate-200 text-slate-800 text-sm"
            />
          </div>
          <div>
            <Label className="text-slate-500 text-xs">Description</Label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md p-2 focus:border-cyan-500 outline-none"
            />
          </div>
          <Button
            size="sm"
            onClick={() =>
              createPromo.mutate({
                slug,
                title,
                subtitle,
                description,
                active: true,
              })
            }
            disabled={createPromo.isPending || !title || !slug}
            className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20"
          >
            {createPromo.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Save className="h-3 w-3 mr-1" />
            )}{" "}
            Create
          </Button>
        </div>
      )}

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-cyan-600 mx-auto" />
      ) : (
        <div className="space-y-2">
          {promos?.map(p => (
            <div
              key={p.id}
              className="p-3 rounded-lg border border-slate-200 bg-white/60 backdrop-blur-sm"
            >
              {editId === p.id ? (
                <div className="space-y-2">
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Title"
                    className="bg-white/80 border-slate-200 text-slate-800 text-sm"
                  />
                  <Input
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    placeholder="Subtitle"
                    className="bg-white/80 border-slate-200 text-slate-800 text-sm"
                  />
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md p-2 focus:border-cyan-500 outline-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        updatePromo.mutate({
                          id: p.id,
                          title,
                          subtitle,
                          description,
                        })
                      }
                      className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20 text-xs"
                    >
                      <Save className="h-3 w-3 mr-1" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditId(null)}
                      className="text-slate-500 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {p.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {p.subtitle || p.slug} &middot;{" "}
                      {p.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditId(p.id);
                        setTitle(p.title);
                        setSubtitle(p.subtitle || "");
                        setDescription(p.description);
                      }}
                      className="text-slate-400 hover:text-cyan-600"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updatePromo.mutate({ id: p.id, active: !p.active })
                      }
                      className="text-slate-400 hover:text-cyan-600"
                    >
                      {p.active ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {promos?.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No promotions yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============ Presentation Manager ============
function PresentationManager() {
  const utils = trpc.useUtils();
  const { data: presentations, isLoading } =
    trpc.content.presentations.useQuery();
  const createPresentation = trpc.manage.createPresentation.useMutation({
    onSuccess: () => {
      utils.content.presentations.invalidate();
      toast.success("Presentation added");
      setShowForm(false);
      resetForm();
    },
  });
  const updatePresentation = trpc.manage.updatePresentation.useMutation({
    onSuccess: () => {
      utils.content.presentations.invalidate();
      toast.success("Presentation updated");
      setEditId(null);
    },
  });
  const deletePresentation = trpc.manage.deletePresentation.useMutation({
    onSuccess: () => {
      utils.content.presentations.invalidate();
      toast.success("Presentation deleted");
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("English");
  const [fileUrl, setFileUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setTitle("");
    setLanguage("English");
    setFileUrl("");
    setSortOrder(0);
  };

  const startEdit = (p: any) => {
    setEditId(p.id);
    setTitle(p.title);
    setLanguage(p.language || "English");
    setFileUrl(p.fileUrl || "");
    setSortOrder(p.sortOrder || 0);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-slate-800">
          Presentations / PDFs
        </h3>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20 hover:bg-cyan-600/20"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Presentation
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-cyan-700">
              {editId ? "Edit Presentation" : "Add New Presentation"}
            </h4>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <Label className="text-slate-500 text-xs">Title</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Turbo Loop Presentation - English"
              className="bg-white/80 border-slate-200 text-slate-800 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-slate-500 text-xs">Language</Label>
              <Input
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
            <div>
              <Label className="text-slate-500 text-xs">
                File URL (PDF link)
              </Label>
              <Input
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                placeholder="https://..."
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Sort Order</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(Number(e.target.value))}
                className="bg-white/80 border-slate-200 text-slate-800 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {editId ? (
              <Button
                size="sm"
                onClick={() =>
                  updatePresentation.mutate({
                    id: editId,
                    title,
                    language,
                    fileUrl: fileUrl || null,
                    sortOrder,
                  })
                }
                disabled={updatePresentation.isPending}
                className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20"
              >
                {updatePresentation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}{" "}
                Update
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() =>
                  createPresentation.mutate({
                    title,
                    language,
                    fileUrl: fileUrl || undefined,
                    sortOrder,
                  })
                }
                disabled={createPresentation.isPending || !title}
                className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20"
              >
                {createPresentation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}{" "}
                Save
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={resetForm}
              className="text-slate-400"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-cyan-600 mx-auto" />
      ) : (
        <div className="space-y-2">
          {presentations?.map((p: any) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white/60 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-cyan-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {p.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {p.language} &middot; Order: {p.sortOrder}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(p)}
                  className="text-slate-400 hover:text-cyan-600"
                >
                  <PenLine className="h-3.5 w-3.5" />
                </Button>
                {p.fileUrl && (
                  <a href={p.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-cyan-600"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this presentation?"))
                      deletePresentation.mutate({ id: p.id });
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {(!presentations || presentations.length === 0) && (
            <p className="text-sm text-slate-400 text-center py-4">
              No presentations yet. Click "Add Presentation" to create one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============ Welcome Popup Settings ============
function WelcomePopupManager() {
  const utils = trpc.useUtils();
  const { data: currentTitle, isLoading: loadingTitle } =
    trpc.manage.getSetting.useQuery({ key: "welcome_title" });
  const { data: currentMessage, isLoading: loadingMessage } =
    trpc.manage.getSetting.useQuery({ key: "welcome_message" });
  const setSetting = trpc.manage.setSetting.useMutation({
    onSuccess: () => {
      utils.manage.getSetting.invalidate();
      utils.content.setting.invalidate();
      toast.success("Welcome popup updated");
    },
  });

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!loadingTitle && !loadingMessage && !initialized) {
      setTitle(currentTitle || "Welcome to TurboLoop Tech Hub");
      setMessage(
        currentMessage ||
          "Turbo Loop is the complete DeFi ecosystem on Binance Smart Chain — offering sustainable yield farming, a fiat-to-crypto gateway, decentralized swaps, and a powerful referral network.\n\nExplore our community hub to discover educational videos, blog articles, upcoming events, and the latest promotions. Whether you're new to DeFi or an experienced investor, Turbo Loop is designed to be transparent, secure, and open to everyone.\n\nJoin thousands of community members across 100+ countries building the future of decentralized finance."
      );
      setInitialized(true);
    }
  }, [loadingTitle, loadingMessage, currentTitle, currentMessage, initialized]);

  const handleSave = () => {
    setSetting.mutate({ key: "welcome_title", value: title });
    setSetting.mutate({ key: "welcome_message", value: message });
  };

  if (loadingTitle || loadingMessage) {
    return <Loader2 className="h-6 w-6 animate-spin text-cyan-600 mx-auto" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-heading font-bold text-slate-800">
            Welcome Popup Settings
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Customize the welcome notification that appears when visitors first
            open the site.
          </p>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xl space-y-4">
        <div>
          <Label className="text-slate-500 text-xs">Popup Title</Label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Welcome to TurboLoop Tech Hub"
            className="bg-white/80 border-slate-200 text-slate-800 text-sm"
          />
        </div>
        <div>
          <Label className="text-slate-500 text-xs">
            Popup Message (use \n for new paragraphs)
          </Label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={8}
            placeholder="Write the welcome message here..."
            className="w-full bg-white/80 border border-slate-200 text-slate-800 text-sm rounded-md p-3 focus:border-cyan-500 outline-none leading-relaxed"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={setSetting.isPending}
            className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20"
          >
            {setSetting.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Save className="h-3 w-3 mr-1" />
            )}
            Save Changes
          </Button>
          <span className="text-xs text-slate-400">
            Changes appear immediately for new visitors.
          </span>
        </div>
      </div>

      {/* Preview */}
      <div className="p-5 rounded-xl border border-slate-200 bg-white/50">
        <h4 className="text-sm font-bold text-slate-500 mb-3">Preview</h4>
        <div
          className="p-6 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="h-1.5 -mx-6 -mt-6 mb-5 rounded-t-xl"
            style={{
              background: "linear-gradient(90deg, #0891B2, #7C3AED, #0891B2)",
            }}
          />
          <h3 className="text-xl font-bold text-slate-800 mb-3">
            {title || "Welcome to TurboLoop Tech Hub"}
          </h3>
          <div className="text-sm text-slate-500 leading-relaxed space-y-2">
            {(message || "")
              .split("\n")
              .filter(Boolean)
              .map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Main Dashboard ============
export default function AdminDashboard() {
  const { data: admin, isLoading, error } = trpc.admin.me.useQuery();
  const logoutMutation = trpc.admin.logout.useMutation();
  const [, navigate] = useLocation();

  // CRITICAL: all hooks must run on every render — they MUST come before any
  // conditional `return`. Previously this useEffect was placed AFTER the
  // `if (isLoading) return ...` block, which caused React error #310
  // ("Rendered fewer hooks than expected") on the second render once the
  // auth check resolved. Hook count went from N to N+1 between renders.
  useEffect(() => {
    if (!isLoading && (error || !admin)) {
      navigate("/admin/login");
    }
  }, [isLoading, error, admin, navigate]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #f0fdfa 100%)",
        }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #f0fdfa 100%)",
        }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/admin/login"),
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #f0fdfa 100%)",
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-50"
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <span className="font-bold">
              <span className="text-slate-800">Turbo</span>
              <span className="text-cyan-600">Loop</span>
            </span>
            <div className="h-5 w-px bg-slate-200" />
            <span className="font-bold text-slate-800">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{admin.email}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500"
            >
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-slate-800">
            Content Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create, edit, and manage all content on the Turbo Loop Community
            Hub.
          </p>
        </div>

        <Tabs defaultValue="blog" className="w-full">
          <TabsList
            className="mb-6 flex-wrap h-auto gap-1 p-1"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "12px",
            }}
          >
            <TabsTrigger
              value="ai-drafter"
              className="data-[state=active]:bg-cyan-600/10 data-[state=active]:text-cyan-700 text-slate-400 text-sm"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              AI Drafter
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="data-[state=active]:bg-cyan-600/10 data-[state=active]:text-cyan-700 text-slate-400 text-sm"
            >
              <Inbox className="h-3.5 w-3.5 mr-1" />
              Submissions
            </TabsTrigger>
            <TabsTrigger
              value="blog"
              className="data-[state=active]:bg-cyan-600/10 data-[state=active]:text-cyan-700 text-slate-400 text-sm"
            >
              Blog Posts
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="data-[state=active]:bg-cyan-600/10 data-[state=active]:text-cyan-700 text-slate-400 text-sm"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-cyan-600/10 data-[state=active]:text-cyan-700 text-slate-400 text-sm"
            >
              Events
            </TabsTrigger>
            <TabsTrigger
              value="promotions"
              className="data-[state=active]:bg-cyan-600/10 data-[state=active]:text-cyan-700 text-slate-400 text-sm"
            >
              Promotions
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-cyan-600/10 data-[state=active]:text-cyan-700 text-slate-400 text-sm"
            >
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="presentations"
              className="data-[state=active]:bg-cyan-600/10 data-[state=active]:text-cyan-700 text-slate-400 text-sm"
            >
              Presentations
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-cyan-600/10 data-[state=active]:text-cyan-700 text-slate-400 text-sm"
            >
              <Settings className="h-3.5 w-3.5 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-drafter">
            <AIDrafter />
          </TabsContent>
          <TabsContent value="submissions">
            <SubmissionsManager />
          </TabsContent>
          <TabsContent value="blog">
            <BlogManager />
          </TabsContent>
          <TabsContent value="videos">
            <VideoManager />
          </TabsContent>
          <TabsContent value="events">
            <EventManager />
          </TabsContent>
          <TabsContent value="promotions">
            <PromotionManager />
          </TabsContent>
          <TabsContent value="leaderboard">
            <LeaderboardManager />
          </TabsContent>
          <TabsContent value="presentations">
            <PresentationManager />
          </TabsContent>
          <TabsContent value="settings">
            <WelcomePopupManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
