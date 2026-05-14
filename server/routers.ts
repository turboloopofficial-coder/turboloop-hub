import { publicProcedure, router, middleware } from "./_core/trpc";
import { z } from "zod";
import * as jose from "jose";
import { parse as parseCookieHeader } from "cookie";
import {
  verifyAdminPassword, upsertAdmin, getAdminByEmail,
  listBlogPosts, getBlogPostBySlug, createBlogPost, updateBlogPost, deleteBlogPost,
  listVideos, createVideo, updateVideo, deleteVideo,
  listEvents, createEvent, updateEvent, deleteEvent,
  listLeaderboard, upsertLeaderboardEntry,
  listPromotions, updatePromotion, createPromotion,
  listRoadmapPhases, updateRoadmapPhase,
  listPresentations, createPresentation, updatePresentation, deletePresentation,
  getSetting, setSetting,
  addNewsletterSignup, listNewsletterSignups, newsletterSignupCount,
  createContentSubmission, listContentSubmissions, updateContentSubmissionStatus,
  updateContentSubmissionPayout,
  listPublicApprovedSubmissions,
  createEventApplication, listEventApplications, updateEventApplicationStatus,
  listSocialWallVideos, upsertSocialWallVideo, updateSocialWallVideo, deleteSocialWallVideo,
} from "./db";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { ENV } from "./_core/env";

const ADMIN_JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "turboloop-admin-secret");

async function verifyAdminToken(token: string): Promise<{ email: string }> {
  try {
    const { payload } = await jose.jwtVerify(token, ADMIN_JWT_SECRET);
    return { email: payload.email as string };
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin token" });
  }
}

const adminProcedure = publicProcedure.use(middleware(async ({ ctx, next }) => {
  const cookies = parseCookieHeader(ctx.req.headers.cookie || "");
  const token = cookies["admin_token"] || ctx.req.headers["x-admin-token"];
  if (!token || typeof token !== "string") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin authentication required" });
  }
  const admin = await verifyAdminToken(token);
  return next({ ctx: { ...ctx, admin } });
}));

export const appRouter = router({
  system: systemRouter,

  admin: router({
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const configuredEmail = ENV.adminEmail;
        const configuredPassword = ENV.adminPassword;
        if (!configuredEmail || !configuredPassword) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Admin credentials not configured on server" });
        }

        const existing = await getAdminByEmail(configuredEmail);
        if (!existing) {
          await upsertAdmin(configuredEmail, configuredPassword);
        }

        if (input.email !== configuredEmail) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        const valid = await verifyAdminPassword(input.email, input.password);
        if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });

        const token = await new jose.SignJWT({ email: input.email })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("7d")
          .sign(ADMIN_JWT_SECRET);
        ctx.res.cookie("admin_token", token, {
          httpOnly: true,
          secure: ENV.isProduction,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
        return { success: true, email: input.email };
      }),
    me: adminProcedure.query(({ ctx }) => ({ email: ctx.admin.email })),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie("admin_token", { httpOnly: true, secure: ENV.isProduction, sameSite: "lax", path: "/" });
      return { success: true };
    }),
  }),

  content: router({
    blogPosts: publicProcedure.query(() => listBlogPosts(true)),
    blogPost: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => getBlogPostBySlug(input.slug)),
    videos: publicProcedure.query(() => listVideos(true)),
    events: publicProcedure.query(() => listEvents(true)),
    leaderboard: publicProcedure.query(() => listLeaderboard()),
    promotions: publicProcedure.query(() => listPromotions(true)),
    roadmap: publicProcedure.query(() => listRoadmapPhases()),
    presentations: publicProcedure.query(() => listPresentations(true)),
    setting: publicProcedure.input(z.object({ key: z.string() })).query(({ input }) => getSetting(input.key)),
  }),

  // Public newsletter signup — no auth needed
  newsletter: router({
    signup: publicProcedure
      .input(z.object({
        email: z.string().email().max(320),
        source: z.string().max(100).optional(),
      }))
      .mutation(async ({ input }) => {
        await addNewsletterSignup(input.email, input.source ?? null);
        return { success: true };
      }),
    // Admin-only: list + count
    list: adminProcedure.query(() => listNewsletterSignups(2000)),
    count: adminProcedure.query(() => newsletterSignupCount()),
  }),

  // AI Blog Drafter — admin-only. Calls Anthropic API to draft a polished
  // blog post from a short topic prompt. The user reviews, edits, and saves
  // via the existing blog manager.
  aiDrafter: router({
    draftBlog: adminProcedure
      .input(z.object({
        topic: z.string().min(3).max(500),
        audienceLevel: z.enum(["newcomer", "intermediate", "expert"]).default("intermediate"),
        notes: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input }) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "ANTHROPIC_API_KEY not configured. Add it to Vercel environment variables to enable AI drafting.",
          });
        }
        // Lazy-import the SDK so cold starts on non-AI routes don't pay for it
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey });

        const audienceGuide = {
          newcomer: "complete crypto beginners — explain everything in plain English, define every term, no jargon",
          intermediate: "people who know crypto but are new to TurboLoop — assume DeFi basics, focus on what makes TurboLoop unique",
          expert: "experienced DeFi users — go deep on mechanics, math, and on-chain verifiability. Skip the basics.",
        }[input.audienceLevel];

        const systemPrompt = `You are a senior content writer for Turbo Loop, a transparent, audited DeFi yield protocol on Binance Smart Chain.

Voice: confident, premium, community-first. No hype words ("MOON", "100x", "huge"). No emoji walls. Use story over feature lists. Specific facts beat generic claims (e.g. "141 banners in 48 languages" beats "lots of resources"). Match the tone of long-form Bloomberg or Stratechery essays — readable, dense, factually precise.

Audience: ${audienceGuide}

Output format: respond with VALID JSON only. No prose outside the JSON. Schema:
{
  "title": "60-90 char SEO-friendly title",
  "slug": "kebab-case-slug-no-trailing-dashes",
  "excerpt": "150-220 char summary that makes people click",
  "content": "Full markdown blog post — 800-1500 words, with H2 headings (##), H3 sub-headings (###), bullet lists, and at least one block quote (>) for emphasis. End with a 'Where to next' paragraph that links 2-3 relevant pages on turboloop.tech (use [link text](https://turboloop.tech/path) format)."
}`;

        const userPrompt = `Topic: ${input.topic}${input.notes ? `\n\nAdditional notes from the editor:\n${input.notes}` : ""}`;

        // Sonnet 4.5: ~3x faster than Opus, near-identical quality for editorial drafting.
        // Faster model + capped max_tokens keeps generation well under the 60s function
        // timeout on Vercel Hobby (Opus would routinely exceed it).
        const response = await client.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 3000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });

        // Extract text content from the response
        const textBlock = response.content.find((b) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Empty response from Claude" });
        }
        const raw = textBlock.text.trim();

        // Strip markdown code fences if Claude wrapped JSON in them
        const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

        let draft: { title: string; slug: string; excerpt: string; content: string };
        try {
          draft = JSON.parse(cleaned);
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Claude returned invalid JSON. Raw output (first 500 chars):\n${cleaned.slice(0, 500)}`,
          });
        }

        return {
          ...draft,
          tokensUsed: {
            input: response.usage.input_tokens,
            output: response.usage.output_tokens,
          },
        };
      }),
  }),

  // Public content submission + admin moderation
  submissions: router({
    submit: publicProcedure
      .input(z.object({
        // testimonial/photo/reel/story = community contributions.
        // creator_apply = "Creator Star" program application.
        // presenter_apply = "Local Presenter" program application.
        // Both apply kinds reuse the same moderation flow as content
        // submissions — admin sees them in the same dashboard, can
        // approve/reject the same way.
        type: z.enum([
          "testimonial",
          "photo",
          "reel",
          "story",
          "creator_apply",
          "presenter_apply",
        ]),
        authorName: z.string().min(1).max(200),
        authorContact: z.string().max(320).optional(),
        authorCountry: z.string().max(100).optional(),
        body: z.string().min(10).max(5000),
        fileUrl: z.string().url().max(1000).optional(),
        // Creator Star payout-relevant fields. Optional on every
        // submission type so testimonials/photos can still go through
        // the same wire format.
        walletAddress: z.string().max(100).optional(),
        youtubeUrl: z.string().url().max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        const created = await createContentSubmission(input);

        // Fire-and-forget: send confirmation email if RESEND_API_KEY is set.
        // Falls through silently when env is missing or send fails — must
        // never block the submission flow.
        const { sendSubmissionReceivedEmail } = await import("./email");
        sendSubmissionReceivedEmail({
          to: input.authorContact,
          name: input.authorName,
          kind: input.type,
        }).catch(() => {});

        // Telegram support notification — routed ONLY to
        // TELEGRAM_SUPPORT_CHAT, never the public announcement chat.
        // If the env var isn't set, the notify is skipped silently;
        // ops still has the row in the admin dashboard either way.
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const supportChatId = process.env.TELEGRAM_SUPPORT_CHAT;
        if (token && supportChatId) {
          const { tgSendMessage } = await import("./_vercel/_telegram");
          const headlineEmoji =
            input.type === "creator_apply"   ? "⭐" :
            input.type === "presenter_apply" ? "🎙" :
            input.type === "testimonial"     ? "💬" :
            input.type === "photo"           ? "📸" :
            input.type === "reel"            ? "🎬" :
                                                "📝";
          const bodyPreview = input.body.length > 280
            ? input.body.slice(0, 277).trim() + "…"
            : input.body;
          const lines = [
            `${headlineEmoji} <b>New ${input.type.replace("_", " ")}</b>`,
            "",
            `<b>Name:</b> ${input.authorName}`,
            input.authorCountry ? `<b>Country:</b> ${input.authorCountry}` : null,
            input.authorContact ? `<b>Contact:</b> ${input.authorContact}` : null,
            input.walletAddress ? `<b>Wallet:</b> <code>${input.walletAddress}</code>` : null,
            input.youtubeUrl ? `<b>YouTube:</b> ${input.youtubeUrl}` : null,
            input.fileUrl && !input.youtubeUrl ? `<b>File:</b> ${input.fileUrl}` : null,
            "",
            bodyPreview,
          ].filter(Boolean);
          tgSendMessage(token, {
            chatId: supportChatId,
            text: lines.join("\n"),
            parseMode: "HTML",
          }).catch(() => {});
        }

        return { success: true, id: created.id };
      }),
    byIds: publicProcedure
      .input(z.object({ ids: z.array(z.number()).max(50) }))
      .query(async ({ input }) => {
        if (input.ids.length === 0) return [];
        const all = await listContentSubmissions();
        return all
          .filter(s => input.ids.includes(s.id))
          .map(s => ({
            id: s.id,
            type: s.type,
            status: s.status,
            createdAt: s.createdAt,
          }));
      }),
    list: adminProcedure
      .input(z.object({ status: z.enum(["pending", "approved", "payment_due", "paid", "rejected"]).optional() }))
      .query(({ input }) => listContentSubmissions(input.status)),
    /** Public read of approved submissions only — excludes PII (contact + admin notes).
     *  Used by /community page's FeaturedSubmissions strip. */
    publicApproved: publicProcedure.query(() => listPublicApprovedSubmissions(12)),
    moderate: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "payment_due", "paid", "rejected"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const updated = await updateContentSubmissionStatus(
          input.id,
          input.status,
          input.adminNotes
        );
        if (input.status === "approved" && updated) {
          // Notify the contributor when approved (best-effort, never blocks).
          const { sendSubmissionApprovedEmail } = await import("./email");
          sendSubmissionApprovedEmail({
            to: updated.authorContact ?? null,
            name: updated.authorName,
            kind: updated.type,
          }).catch(() => {});
        }
        return updated;
      }),

    /** Update Creator Star payout fields — admin sets the view-count
     *  read + the suggested USD payout amount based on the published
     *  tier table. Status is moved separately via `moderate`. */
    updatePayout: adminProcedure
      .input(z.object({
        id: z.number(),
        walletAddress: z.string().max(100).nullish(),
        youtubeUrl: z.string().url().max(500).nullish(),
        viewCount: z.number().int().nullish(),
        payoutAmountUsd: z.number().int().nullish(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...patch } = input;
        return updateContentSubmissionPayout(id, {
          ...patch,
          viewCountCheckedAt:
            patch.viewCount !== undefined && patch.viewCount !== null
              ? new Date()
              : undefined,
        });
      }),

    /** Event application from /events — Local Presenter / meetup
     *  sponsorship form. Stores the row + pings the support Telegram so
     *  ops can triage. Public procedure so the marketing site can
     *  submit without auth; Zod gates the schema. */
    submitEventApplication: publicProcedure
      .input(z.object({
        walletAddress: z.string().min(10).max(100),
        teamSize: z.number().int().min(0),
        tier: z.enum(["local", "city", "regional", "national"]),
        cityCountry: z.string().min(2).max(200),
        expectedAttendees: z.number().int().min(1),
        requestedDate: z.string().min(2).max(100),
        whatsappNumber: z.string().min(5).max(50),
        telegramId: z.string().min(2).max(100),
      }))
      .mutation(async ({ input }) => {
        const created = await createEventApplication(input);

        // Telegram support notification — fire-and-forget, routed ONLY
        // to the dedicated support group. The DB write is the source of
        // truth; if TELEGRAM_SUPPORT_CHAT isn't configured, we skip the
        // notification silently rather than spilling event applications
        // into the public announcement channel or main chat.
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const supportChatId = process.env.TELEGRAM_SUPPORT_CHAT;
        if (token && supportChatId) {
          const { tgSendMessage } = await import("./_vercel/_telegram");
          const msg =
            `🎉 <b>New Event Application</b>\n\n` +
            `<b>Tier:</b> ${input.tier}\n` +
            `<b>Location:</b> ${input.cityCountry}\n` +
            `<b>Date:</b> ${input.requestedDate}\n` +
            `<b>Attendees:</b> ${input.expectedAttendees}\n` +
            `<b>Team Size:</b> ${input.teamSize}\n\n` +
            `<b>Contact:</b>\n` +
            `TG: ${input.telegramId}\n` +
            `WA: ${input.whatsappNumber}\n` +
            `Wallet: <code>${input.walletAddress}</code>`;
          tgSendMessage(token, {
            chatId: supportChatId,
            text: msg,
            parseMode: "HTML",
          }).catch(() => {});
        }

        return { success: true, id: created.id };
      }),

    /** Admin-only list of all event applications, optionally filtered
     *  by status. Mirrors the content-submissions list shape so the
     *  same dashboard can render both. */
    listEventApplications: adminProcedure
      .input(z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }))
      .query(({ input }) => listEventApplications(input.status)),

    /** Move an event application between statuses. Admin-only. */
    moderateEventApplication: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return updateEventApplicationStatus(input.id, input.status, input.adminNotes);
      }),
  }),

  // ───────────────────────────────────────────────────────────────────
  // Social Wall — YouTube-video-backed community content surfaced on
  // the homepage. Admin curates the feed; the public-facing query is
  // narrow and excludes unapproved rows.
  // ───────────────────────────────────────────────────────────────────
  socialWall: router({
    /** Public read — approved videos only, sorted featured-first then
     *  by sortOrder ascending. Used by SocialWallSection on home. */
    publicList: publicProcedure.query(() => listSocialWallVideos({ approvedOnly: true })),

    /** Admin read — every row, regardless of approval state. */
    list: adminProcedure.query(() => listSocialWallVideos()),

    /** Search YouTube via the Data API v3. Returns up to 10 results
     *  (default) — admin picks which to save. Requires YOUTUBE_API_KEY.
     *  search.list costs 100 quota units per call → 100 searches/day
     *  on the free tier, which is plenty for admin-driven curation. */
    youtubeSearch: adminProcedure
      .input(z.object({
        query: z.string().min(2).max(200),
        maxResults: z.number().int().min(1).max(25).default(10),
      }))
      .query(async ({ input }) => {
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "YOUTUBE_API_KEY is not configured on the server.",
          });
        }
        const url = new URL("https://www.googleapis.com/youtube/v3/search");
        url.searchParams.set("part", "snippet");
        url.searchParams.set("type", "video");
        url.searchParams.set("maxResults", String(input.maxResults));
        url.searchParams.set("q", input.query);
        url.searchParams.set("key", apiKey);

        const res = await fetch(url.toString());
        if (!res.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `YouTube search failed: HTTP ${res.status}`,
          });
        }
        const data = (await res.json()) as {
          items?: Array<{
            id?: { videoId?: string };
            snippet?: {
              title?: string;
              channelTitle?: string;
              thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
              defaultAudioLanguage?: string;
              defaultLanguage?: string;
            };
          }>;
        };
        // Normalise to the shape the admin UI consumes.
        return (data.items ?? [])
          .map(item => {
            const id = item.id?.videoId;
            if (!id || !item.snippet) return null;
            const thumb =
              item.snippet.thumbnails?.medium?.url ??
              item.snippet.thumbnails?.default?.url ??
              null;
            return {
              youtubeId: id,
              title: item.snippet.title ?? "(no title)",
              channelTitle: item.snippet.channelTitle ?? null,
              thumbnailUrl: thumb,
              language:
                item.snippet.defaultAudioLanguage ??
                item.snippet.defaultLanguage ??
                null,
            };
          })
          .filter(Boolean);
      }),

    /** Save a YouTube video as a row in social_wall_videos. Idempotent
     *  via the unique youtube_id constraint — re-saving the same video
     *  refreshes the cached metadata but preserves the curation flags. */
    save: adminProcedure
      .input(z.object({
        youtubeId: z.string().min(5).max(20),
        title: z.string().min(1).max(500),
        channelTitle: z.string().max(200).optional(),
        thumbnailUrl: z.string().url().max(500).optional(),
        viewCount: z.number().int().optional(),
        durationSec: z.number().int().optional(),
        language: z.string().max(10).optional(),
      }))
      .mutation(({ input }) => upsertSocialWallVideo(input)),

    /** Patch curation flags. Used by the admin's Approve / Feature /
     *  Reorder controls. */
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        approved: z.boolean().optional(),
        featured: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...patch } = input;
        return updateSocialWallVideo(id, patch);
      }),

    /** Hard-delete a video from the wall. */
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteSocialWallVideo(input.id)),
  }),

  manage: router({
    listBlogPosts: adminProcedure.query(() => listBlogPosts(false)),
    createBlogPost: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        coverImage: z.string().optional(),
        published: z.boolean().default(false),
      }))
      .mutation(({ input }) => createBlogPost(input)),
    updateBlogPost: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        coverImage: z.string().nullable().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateBlogPost(id, data); }),
    deleteBlogPost: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteBlogPost(input.id)),

    listVideos: adminProcedure.query(() => listVideos(false)),
    createVideo: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        youtubeUrl: z.string().optional(),
        directUrl: z.string().optional(),
        category: z.enum(["presentation", "how-to-join", "withdraw-compound", "other"]),
        language: z.string().min(1),
        languageFlag: z.string().min(1),
        sortOrder: z.number().default(0),
        published: z.boolean().default(true),
      }))
      .mutation(({ input }) => createVideo(input)),
    updateVideo: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        youtubeUrl: z.string().nullable().optional(),
        directUrl: z.string().nullable().optional(),
        category: z.enum(["presentation", "how-to-join", "withdraw-compound", "other"]).optional(),
        language: z.string().optional(),
        languageFlag: z.string().optional(),
        sortOrder: z.number().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateVideo(id, data); }),
    deleteVideo: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteVideo(input.id)),

    listEvents: adminProcedure.query(() => listEvents(false)),
    createEvent: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        dateTime: z.string().min(1),
        timezone: z.string().default("UTC"),
        frequency: z.string().optional(),
        meetingLink: z.string().min(1),
        passcode: z.string().optional(),
        hostName: z.string().optional(),
        language: z.string().default("English"),
        status: z.enum(["upcoming", "live", "completed", "recurring"]).default("upcoming"),
        published: z.boolean().default(true),
      }))
      .mutation(({ input }) => createEvent(input)),
    updateEvent: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dateTime: z.string().optional(),
        timezone: z.string().optional(),
        frequency: z.string().optional(),
        meetingLink: z.string().optional(),
        passcode: z.string().optional(),
        hostName: z.string().optional(),
        language: z.string().optional(),
        status: z.enum(["upcoming", "live", "completed", "recurring"]).optional(),
        published: z.boolean().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateEvent(id, data); }),
    deleteEvent: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteEvent(input.id)),

    leaderboard: adminProcedure.query(() => listLeaderboard()),
    updateLeaderboard: adminProcedure
      .input(z.object({
        rank: z.number(),
        country: z.string(),
        countryCode: z.string(),
        description: z.string(),
        score: z.number(),
      }))
      .mutation(({ input }) => upsertLeaderboardEntry(input.rank, input.country, input.countryCode, input.description, input.score)),

    listPromotions: adminProcedure.query(() => listPromotions(false)),
    createPromotion: adminProcedure
      .input(z.object({
        slug: z.string().min(1),
        title: z.string().min(1),
        subtitle: z.string().optional(),
        description: z.string().min(1),
        details: z.any().optional(),
        active: z.boolean().default(true),
        sortOrder: z.number().default(0),
      }))
      .mutation(({ input }) => createPromotion(input)),
    updatePromotion: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        details: z.any().optional(),
        active: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updatePromotion(id, data); }),

    roadmap: adminProcedure.query(() => listRoadmapPhases()),
    updateRoadmapPhase: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["completed", "current", "upcoming"]).optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateRoadmapPhase(id, data); }),

    listPresentations: adminProcedure.query(() => listPresentations(false)),
    createPresentation: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        language: z.string().min(1),
        fileUrl: z.string().optional(),
        sortOrder: z.number().default(0),
        published: z.boolean().default(true),
      }))
      .mutation(({ input }) => createPresentation(input)),
    updatePresentation: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        language: z.string().optional(),
        fileUrl: z.string().nullable().optional(),
        sortOrder: z.number().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updatePresentation(id, data); }),
    deletePresentation: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deletePresentation(input.id)),

    uploadImage: adminProcedure
      .input(z.object({
        filename: z.string().min(1),
        base64: z.string().min(1),
        contentType: z.string().default("image/png"),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `uploads/${Date.now()}-${input.filename}`;
        const result = await storagePut(key, buffer, input.contentType);
        return result;
      }),

    getSetting: adminProcedure.input(z.object({ key: z.string() })).query(({ input }) => getSetting(input.key)),
    setSetting: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(({ input }) => setSetting(input.key, input.value)),
  }),
});

export type AppRouter = typeof appRouter;
