import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, LogOut, PenLine, Eye, EyeOff, X, ExternalLink } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";


// ============ Blog Manager ============
function BlogManager() {
  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.manage.listBlogPosts.useQuery();
  const createPost = trpc.manage.createBlogPost.useMutation({
    onSuccess: () => { utils.manage.listBlogPosts.invalidate(); toast.success("Post created"); resetForm(); }
  });
  const deletePost = trpc.manage.deleteBlogPost.useMutation({
    onSuccess: () => { utils.manage.listBlogPosts.invalidate(); toast.success("Post deleted"); }
  });
  const updatePost = trpc.manage.updateBlogPost.useMutation({
    onSuccess: () => { utils.manage.listBlogPosts.invalidate(); toast.success("Post updated"); setEditId(null); }
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
      setSlug(t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-white">Blog Posts</h3>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30">
          <Plus className="h-4 w-4 mr-1" /> New Post
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl border border-cyan-500/15 bg-[#0d1425]/80 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-cyan-400">{editId ? "Edit Post" : "New Blog Post"}</h4>
            <button onClick={resetForm} className="text-gray-500 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-400 text-xs">Title</Label>
              <Input value={title} onChange={e => autoSlug(e.target.value)} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" />
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Slug (URL)</Label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="my-post-url" className="bg-[#0a0f1e] border-gray-700 text-white text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Excerpt (short summary)</Label>
            <Input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="A brief summary shown in the blog grid..." className="bg-[#0a0f1e] border-gray-700 text-white text-sm" />
          </div>
          <ImageUpload value={coverImage} onChange={setCoverImage} label="Cover Image" />
          <div>
            <Label className="text-gray-400 text-xs">Content (Markdown supported)</Label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={12}
              placeholder="Write your blog post content here... Markdown is supported."
              className="w-full bg-[#0a0f1e] border border-gray-700 text-white text-sm rounded-md p-3 focus:border-cyan-500 outline-none font-mono leading-relaxed"
            />
          </div>
          <div className="flex gap-2">
            {editId ? (
              <Button size="sm" onClick={() => updatePost.mutate({ id: editId, title, slug, excerpt, content, coverImage: coverImage || null })} disabled={updatePost.isPending} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {updatePost.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />} Update Post
              </Button>
            ) : (
              <Button size="sm" onClick={() => createPost.mutate({ title, slug, excerpt, content, coverImage: coverImage || undefined, published: true })} disabled={createPost.isPending || !title || !slug || !content} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {createPost.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />} Publish
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={resetForm} className="text-gray-400">Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mx-auto" /> : (
        <div className="space-y-2">
          {posts?.map(post => (
            <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-800 bg-[#0d1425]/40">
              <div className="flex items-center gap-3 min-w-0">
                {post.coverImage && (
                  <img src={post.coverImage} alt="" className="w-12 h-8 object-cover rounded shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{post.title}</p>
                  <p className="text-xs text-gray-500">/blog/{post.slug} &middot; {post.published ? "Published" : "Draft"}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => startEdit(post)} className="text-gray-400 hover:text-cyan-400">
                  <PenLine className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => updatePost.mutate({ id: post.id, published: !post.published })} className="text-gray-400 hover:text-cyan-400">
                  {post.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this post?")) deletePost.mutate({ id: post.id }); }} className="text-gray-400 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {posts?.length === 0 && <p className="text-sm text-gray-600 text-center py-4">No blog posts yet. Click "New Post" to create one.</p>}
        </div>
      )}
    </div>
  );
}

// ============ Video Manager ============
function VideoManager() {
  const utils = trpc.useUtils();
  const { data: videos, isLoading } = trpc.manage.listVideos.useQuery();
  const createVideo = trpc.manage.createVideo.useMutation({ onSuccess: () => { utils.manage.listVideos.invalidate(); toast.success("Video added"); setShowForm(false); } });
  const deleteVideo = trpc.manage.deleteVideo.useMutation({ onSuccess: () => { utils.manage.listVideos.invalidate(); toast.success("Video deleted"); } });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [category, setCategory] = useState<"presentation" | "how-to-join" | "withdraw-compound" | "other">("presentation");
  const [language, setLanguage] = useState("English");
  const [languageFlag, setLanguageFlag] = useState("🇬🇧");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-white">Videos</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30">
          <Plus className="h-4 w-4 mr-1" /> Add Video
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl border border-cyan-500/15 bg-[#0d1425]/80 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-cyan-400">Add New Video</h4>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div><Label className="text-gray-400 text-xs">Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
          <div><Label className="text-gray-400 text-xs">YouTube URL</Label><Input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtu.be/..." className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-gray-400 text-xs">Category</Label>
              <select value={category} onChange={e => setCategory(e.target.value as typeof category)} className="w-full bg-[#0a0f1e] border border-gray-700 text-white text-sm rounded-md p-2">
                <option value="presentation">Presentation</option>
                <option value="how-to-join">How to Join</option>
                <option value="withdraw-compound">Withdraw/Compound</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div><Label className="text-gray-400 text-xs">Language</Label><Input value={language} onChange={e => setLanguage(e.target.value)} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
            <div><Label className="text-gray-400 text-xs">Flag Emoji</Label><Input value={languageFlag} onChange={e => setLanguageFlag(e.target.value)} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createVideo.mutate({ title, youtubeUrl, category, language, languageFlag, published: true })} disabled={createVideo.isPending || !title} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {createVideo.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />} Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="text-gray-400">Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mx-auto" /> : (
        <div className="space-y-2">
          {videos?.map(v => (
            <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-800 bg-[#0d1425]/40">
              <div>
                <p className="text-sm font-medium text-white">{v.languageFlag} {v.title}</p>
                <p className="text-xs text-gray-500">{v.category} &middot; {v.language}</p>
              </div>
              <div className="flex gap-1">
                {v.youtubeUrl && (
                  <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-cyan-400">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
                <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete?")) deleteVideo.mutate({ id: v.id }); }} className="text-gray-400 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {videos?.length === 0 && <p className="text-sm text-gray-600 text-center py-4">No videos yet. Click "Add Video" to add one.</p>}
        </div>
      )}
    </div>
  );
}

// ============ Event Manager ============
function EventManager() {
  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.manage.listEvents.useQuery();
  const createEvent = trpc.manage.createEvent.useMutation({ onSuccess: () => { utils.manage.listEvents.invalidate(); toast.success("Event created"); setShowForm(false); } });
  const deleteEvent = trpc.manage.deleteEvent.useMutation({ onSuccess: () => { utils.manage.listEvents.invalidate(); toast.success("Event deleted"); } });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [frequency, setFrequency] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [passcode, setPasscode] = useState("");
  const [language, setLanguage] = useState("English");
  const [status, setStatus] = useState<"upcoming" | "live" | "completed" | "recurring">("recurring");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-white">Events & Meetings</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30">
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl border border-cyan-500/15 bg-[#0d1425]/80 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-cyan-400">Add New Event</h4>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div><Label className="text-gray-400 text-xs">Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-gray-400 text-xs">Date/Time</Label><Input value={dateTime} onChange={e => setDateTime(e.target.value)} placeholder="5:00 PM" className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
            <div><Label className="text-gray-400 text-xs">Timezone</Label><Input value={timezone} onChange={e => setTimezone(e.target.value)} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
            <div><Label className="text-gray-400 text-xs">Frequency</Label><Input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="Every Day" className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-gray-400 text-xs">Meeting Link</Label><Input value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://zoom.us/j/..." className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
            <div><Label className="text-gray-400 text-xs">Passcode (optional)</Label><Input value={passcode} onChange={e => setPasscode(e.target.value)} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-gray-400 text-xs">Language</Label><Input value={language} onChange={e => setLanguage(e.target.value)} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
            <div>
              <Label className="text-gray-400 text-xs">Status</Label>
              <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className="w-full bg-[#0a0f1e] border border-gray-700 text-white text-sm rounded-md p-2">
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="recurring">Recurring</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createEvent.mutate({ title, dateTime, timezone, frequency: frequency || undefined, meetingLink, passcode: passcode || undefined, language, status, published: true })} disabled={createEvent.isPending || !title || !meetingLink} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {createEvent.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />} Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="text-gray-400">Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mx-auto" /> : (
        <div className="space-y-2">
          {events?.map(ev => (
            <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-800 bg-[#0d1425]/40">
              <div>
                <p className="text-sm font-medium text-white">{ev.title}</p>
                <p className="text-xs text-gray-500">{ev.dateTime} {ev.timezone} &middot; {ev.status} {ev.frequency ? `&middot; ${ev.frequency}` : ""}</p>
              </div>
              <div className="flex gap-1">
                {ev.meetingLink && (
                  <a href={ev.meetingLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-cyan-400">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
                <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete?")) deleteEvent.mutate({ id: ev.id }); }} className="text-gray-400 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {events?.length === 0 && <p className="text-sm text-gray-600 text-center py-4">No events yet. Click "Add Event" to create one.</p>}
        </div>
      )}
    </div>
  );
}

// ============ Leaderboard Manager ============
function LeaderboardManager() {
  const utils = trpc.useUtils();
  const { data: entries, isLoading } = trpc.manage.leaderboard.useQuery();
  const updateEntry = trpc.manage.updateLeaderboard.useMutation({ onSuccess: () => { utils.manage.leaderboard.invalidate(); toast.success("Updated"); } });

  const [editRank, setEditRank] = useState<number | null>(null);
  const [editCountry, setEditCountry] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editScore, setEditScore] = useState(0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-bold text-white">Country Leaderboard</h3>
      <p className="text-xs text-gray-500">Click the edit icon to modify country rankings, scores, and descriptions.</p>
      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mx-auto" /> : (
        <div className="space-y-2">
          {entries?.map(entry => (
            <div key={entry.rank} className="p-3 rounded-lg border border-gray-800 bg-[#0d1425]/40">
              {editRank === entry.rank ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <Input value={editCountry} onChange={e => setEditCountry(e.target.value)} placeholder="Country" className="bg-[#0a0f1e] border-gray-700 text-white text-sm" />
                    <Input value={editCode} onChange={e => setEditCode(e.target.value)} placeholder="Code (e.g. de)" className="bg-[#0a0f1e] border-gray-700 text-white text-sm" />
                    <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description" className="bg-[#0a0f1e] border-gray-700 text-white text-sm" />
                    <Input type="number" value={editScore} onChange={e => setEditScore(Number(e.target.value))} min={0} max={100} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { updateEntry.mutate({ rank: entry.rank, country: editCountry, countryCode: editCode, description: editDesc, score: editScore }); setEditRank(null); }} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs"><Save className="h-3 w-3 mr-1" /> Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditRank(null)} className="text-gray-400 text-xs">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-8">#{entry.rank}</span>
                    <img src={`https://flagcdn.com/w40/${entry.countryCode.toLowerCase()}.png`} alt="" className="w-8 h-5 object-cover rounded" />
                    <div>
                      <p className="text-sm font-medium text-white">{entry.country} — <span className="text-cyan-400">{entry.score}%</span></p>
                      <p className="text-xs text-gray-500">{entry.description}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { setEditRank(entry.rank); setEditCountry(entry.country); setEditCode(entry.countryCode); setEditDesc(entry.description); setEditScore(entry.score); }} className="text-gray-400 hover:text-cyan-400">
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
    onSuccess: () => { utils.manage.listPromotions.invalidate(); toast.success("Promotion updated"); setEditId(null); }
  });
  const createPromo = trpc.manage.createPromotion.useMutation({
    onSuccess: () => { utils.manage.listPromotions.invalidate(); toast.success("Promotion created"); setShowForm(false); }
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
        <h3 className="text-lg font-heading font-bold text-white">Promotions</h3>
        <Button size="sm" onClick={() => setShowForm(true)} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30">
          <Plus className="h-4 w-4 mr-1" /> New Promotion
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl border border-cyan-500/15 bg-[#0d1425]/80 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-cyan-400">New Promotion</h4>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-gray-400 text-xs">Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
            <div><Label className="text-gray-400 text-xs">Slug</Label><Input value={slug} onChange={e => setSlug(e.target.value)} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
          </div>
          <div><Label className="text-gray-400 text-xs">Subtitle</Label><Input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="bg-[#0a0f1e] border-gray-700 text-white text-sm" /></div>
          <div><Label className="text-gray-400 text-xs">Description</Label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-[#0a0f1e] border border-gray-700 text-white text-sm rounded-md p-2 focus:border-cyan-500 outline-none" /></div>
          <Button size="sm" onClick={() => createPromo.mutate({ slug, title, subtitle, description, active: true })} disabled={createPromo.isPending || !title || !slug} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {createPromo.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />} Create
          </Button>
        </div>
      )}

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mx-auto" /> : (
        <div className="space-y-2">
          {promos?.map(p => (
            <div key={p.id} className="p-3 rounded-lg border border-gray-800 bg-[#0d1425]/40">
              {editId === p.id ? (
                <div className="space-y-2">
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="bg-[#0a0f1e] border-gray-700 text-white text-sm" />
                  <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Subtitle" className="bg-[#0a0f1e] border-gray-700 text-white text-sm" />
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-[#0a0f1e] border border-gray-700 text-white text-sm rounded-md p-2 focus:border-cyan-500 outline-none" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updatePromo.mutate({ id: p.id, title, subtitle, description })} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs"><Save className="h-3 w-3 mr-1" /> Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="text-gray-400 text-xs">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.subtitle || p.slug} &middot; {p.active ? "Active" : "Inactive"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditId(p.id); setTitle(p.title); setSubtitle(p.subtitle || ""); setDescription(p.description); }} className="text-gray-400 hover:text-cyan-400">
                      <PenLine className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updatePromo.mutate({ id: p.id, active: !p.active })} className="text-gray-400 hover:text-cyan-400">
                      {p.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {promos?.length === 0 && <p className="text-sm text-gray-600 text-center py-4">No promotions yet.</p>}
        </div>
      )}
    </div>
  );
}

// ============ Main Dashboard ============
export default function AdminDashboard() {
  const { data: admin, isLoading, error } = trpc.admin.me.useQuery();
  const logoutMutation = trpc.admin.logout.useMutation();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060a16" }}>
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  useEffect(() => {
    if (!isLoading && (error || !admin)) {
      navigate("/admin/login");
    }
  }, [isLoading, error, admin, navigate]);

  if (error || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060a16" }}>
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/admin/login"),
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "#060a16" }}>
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ background: 'rgba(6,10,22,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white"><span className="text-white">Turbo</span><span className="text-cyan-400">Loop</span></span>
            <div className="h-5 w-px bg-gray-800" />
            <span className="font-bold text-white">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{admin.email}</span>
            <Button size="sm" variant="ghost" onClick={handleLogout} className="text-gray-400 hover:text-red-400">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-white">Content Management</h2>
          <p className="text-sm text-gray-500 mt-1">Create, edit, and manage all content on the Turbo Loop Community Hub.</p>
        </div>

        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto gap-1 p-1" style={{ background: 'rgba(13,20,40,0.6)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <TabsTrigger value="blog" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-gray-400 text-sm">Blog Posts</TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-gray-400 text-sm">Videos</TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-gray-400 text-sm">Events</TabsTrigger>
            <TabsTrigger value="promotions" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-gray-400 text-sm">Promotions</TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-gray-400 text-sm">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="blog"><BlogManager /></TabsContent>
          <TabsContent value="videos"><VideoManager /></TabsContent>
          <TabsContent value="events"><EventManager /></TabsContent>
          <TabsContent value="promotions"><PromotionManager /></TabsContent>
          <TabsContent value="leaderboard"><LeaderboardManager /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
