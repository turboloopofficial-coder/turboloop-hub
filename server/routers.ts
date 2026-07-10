import { publicProcedure, router, middleware } from "./_core/trpc";
import { z } from "zod";
import * as jose from "jose";
import { parse as parseCookieHeader } from "cookie";
import {
  verifyAdminPassword, upsertAdmin, getAdminByEmail,
  listBlogPosts, listBlogPostsSummary, getBlogPostBySlug, createBlogPost, updateBlogPost, deleteBlogPost,
  listAutomationLog,
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
  listOpenJobVacancies, listAllJobVacancies, getJobVacancyBySlug,
  createJobVacancy, updateJobVacancy, deleteJobVacancy,
  unsubscribeNewsletter,
  crmOverviewMetrics, crmRecentActivity,
  listRecentChatConversations, getChatMessages, chatActivityLast14Days,
  listScheduledPosts, getScheduledPostById, createScheduledPost,
  updateScheduledPost, deleteScheduledPost, SCHEDULED_POST_CHANNELS,
} from "./db";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { ENV } from "./_core/env";
import { logAuditEvent, listAuditLog } from "./db";

// ─── RATE LIMITING (in-memory, per-IP, for admin login) ───────────────────────
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5; // max 5 attempts per window
function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true };
  }
  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.firstAttempt)) / 1000);
    return { allowed: false, retryAfterSec };
  }
  record.count++;
  return { allowed: true };
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts) {
    if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) loginAttempts.delete(ip);
  }
}, 30 * 60 * 1000);

// SECURITY: JWT_SECRET MUST be set in production. No fallback allowed.
const _jwtSecretRaw = process.env.JWT_SECRET;
if (!_jwtSecretRaw && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: JWT_SECRET environment variable is not set. Admin authentication is disabled until this is configured.");
}
const ADMIN_JWT_SECRET = new TextEncoder().encode(_jwtSecretRaw || `dev-only-insecure-${Date.now()}`);

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
        // Rate limiting: max 5 login attempts per IP per 15 minutes
        const clientIp = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || ctx.req.socket?.remoteAddress || "unknown";
        const rateCheck = checkLoginRateLimit(clientIp);
        if (!rateCheck.allowed) {
          logAuditEvent({ action: "admin.login.rate_limited", actor: input.email, ipAddress: clientIp });
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Too many login attempts. Try again in ${rateCheck.retryAfterSec} seconds.` });
        }

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
          logAuditEvent({ action: "admin.login.failed", actor: input.email, ipAddress: clientIp, details: "Email mismatch" });
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        const valid = await verifyAdminPassword(input.email, input.password);
        if (!valid) {
          logAuditEvent({ action: "admin.login.failed", actor: input.email, ipAddress: clientIp, details: "Wrong password" });
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        // Successful login
        logAuditEvent({ action: "admin.login.success", actor: input.email, ipAddress: clientIp });

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
    // Listing-safe endpoint: omits the `content` field so the response
    // stays well under Next.js's 2 MB data-cache limit (full payload is
    // ~3.5 MB which silently breaks ISR and renders 0 posts on /blog).
    blogPostsList: publicProcedure.query(() => listBlogPostsSummary(true)),
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
        // GDPR consent record (Task B). Optional for backward compat —
        // legacy callers that don't pass these fields still work, the
        // row just gets NULLs and the CRM Newsletter tab flags it as
        // "legacy:pre-gdpr" in the source column.
        consentMethod: z.string().max(50).optional(),
        consentText: z.string().max(2000).optional(),
        consentSourceUrl: z.string().max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        await addNewsletterSignup(input.email, {
          source: input.source ?? null,
          consentMethod: input.consentMethod ?? null,
          consentText: input.consentText ?? null,
          consentSourceUrl: input.consentSourceUrl ?? null,
        });
        return { success: true };
      }),
    /** Public unsubscribe — token-protected. The token is a JWT signed
     *  with ADMIN_JWT_SECRET containing { email, exp }. Every newsletter
     *  email link will carry one. Returns 200 on success or already-
     *  unsubscribed; throws on bad/expired token. */
    unsubscribe: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const { payload } = await jose.jwtVerify(input.token, ADMIN_JWT_SECRET);
          const email = String(payload.email ?? "");
          if (!email.includes("@")) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid token" });
          }
          await unsubscribeNewsletter(email, "one-click-link");
          return { success: true, email };
        } catch (err) {
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired link" });
        }
      }),
    // Admin-only: list + count + CSV-friendly export
    list: adminProcedure
      .input(
        z
          .object({
            limit: z.number().int().min(1).max(50_000).default(2000),
            includeUnsubscribed: z.boolean().default(false),
          })
          .optional()
      )
      .query(({ input }) =>
        listNewsletterSignups({
          limit: input?.limit ?? 2000,
          excludeUnsubscribed: !input?.includeUnsubscribed,
        })
      ),
    count: adminProcedure.query(() => newsletterSignupCount()),
  }),

  // ─── CRM dashboard (Task B) ────────────────────────────────────────
  crm: router({
    overview: adminProcedure.query(() => crmOverviewMetrics()),
    recentActivity: adminProcedure
      .input(z.object({ perSource: z.number().int().min(5).max(100).default(25) }).optional())
      .query(({ input }) => crmRecentActivity(input?.perSource ?? 25)),
    chatConversations: adminProcedure
      .input(z.object({ limit: z.number().int().min(1).max(500).default(100) }).optional())
      .query(({ input }) => listRecentChatConversations(input?.limit ?? 100)),
    chatMessages: adminProcedure
      .input(z.object({ conversationId: z.number().int().positive() }))
      .query(({ input }) => getChatMessages(input.conversationId)),
    chatActivity: adminProcedure.query(() => chatActivityLast14Days()),
  }),

  // ─── Careers CMS (Task F) ─────────────────────────────────────────
  // `openList` is the public endpoint for /careers — returns only roles
  // with status='open' AND (closing_at IS NULL OR closing_at > now()).
  // Everything else is admin-gated.
  careers: router({
    openList: publicProcedure.query(() => listOpenJobVacancies()),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string().max(100) }))
      .query(({ input }) => getJobVacancyBySlug(input.slug)),

    // Admin CRUD. The bullets array is stored as JSONB so we accept it
    // as a string[] in the schema and Drizzle handles the round-trip.
    adminList: adminProcedure.query(() => listAllJobVacancies()),
    create: adminProcedure
      .input(
        z.object({
          slug: z
            .string()
            .min(2)
            .max(100)
            .regex(/^[a-z0-9][a-z0-9-]{0,99}$/, "Use lowercase letters, digits, and dashes"),
          title: z.string().min(2).max(200),
          flag: z.string().max(8).optional(),
          location: z.string().min(2).max(200),
          stipend: z.string().min(1).max(100),
          bullets: z.array(z.string().max(500)).max(20),
          status: z.enum(["open", "closed", "draft"]).default("draft"),
          tgSupportLink: z.string().max(300).optional(),
          closingAt: z.coerce.date().optional(),
          sortOrder: z.number().int().min(0).max(9999).default(0),
        })
      )
      .mutation(({ input }) =>
        createJobVacancy({
          slug: input.slug,
          title: input.title,
          flag: input.flag ?? null,
          location: input.location,
          stipend: input.stipend,
          bullets: input.bullets,
          status: input.status,
          tgSupportLink: input.tgSupportLink ?? null,
          closingAt: input.closingAt ?? null,
          sortOrder: input.sortOrder,
        })
      ),
    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          patch: z.object({
            title: z.string().min(2).max(200).optional(),
            flag: z.string().max(8).nullable().optional(),
            location: z.string().min(2).max(200).optional(),
            stipend: z.string().min(1).max(100).optional(),
            bullets: z.array(z.string().max(500)).max(20).optional(),
            status: z.enum(["open", "closed", "draft"]).optional(),
            tgSupportLink: z.string().max(300).nullable().optional(),
            closingAt: z.coerce.date().nullable().optional(),
            sortOrder: z.number().int().min(0).max(9999).optional(),
          }),
        })
      )
      .mutation(({ input }) => updateJobVacancy(input.id, input.patch)),
    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ input }) => deleteJobVacancy(input.id)),
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

You produce ONE blog post PLUS three per-channel companion blurbs. Each blurb has a HARD character cap — going over is a failure. Count characters before you respond.

Output format: respond with VALID JSON only. No prose outside the JSON. Schema:
{
  "title": "60-90 char SEO-friendly title",
  "slug": "kebab-case-slug-no-trailing-dashes",
  "excerpt": "150-220 char summary that makes people click",
  "content": "Full markdown blog post — 800-1500 words, with H2 headings (##), H3 sub-headings (###), bullet lists, and at least one block quote (>) for emphasis. End with a 'Where to next' paragraph that links 2-3 relevant pages on turboloop.tech (use [link text](https://turboloop.tech/path) format).",
  "telegramCaption": "HARD MAX 280 characters. One hook sentence + one CTA. 1-2 emoji max. HTML <b> tags allowed for emphasis — NO Markdown asterisks. NO line-walls of hashtags.",
  "whatsappText": "HARD MAX 160 characters. Plain text only — NO HTML, NO Markdown, NO emoji. Single sentence + the article URL on the next line. The URL counts toward the 160 char budget.",
  "instagramCaption": "Exactly 3 punchy lines (separate with \\n), max 300 characters before the hashtag block, then a blank line, then EXACTLY 5 relevant hashtags on one line (e.g. #DeFi #Crypto #YieldFarming #BSC #TurboLoop)."
}`;

        const userPrompt = `Topic: ${input.topic}${input.notes ? `\n\nAdditional notes from the editor:\n${input.notes}` : ""}`;

        // Sonnet 4.5: ~3x faster than Opus, near-identical quality for editorial drafting.
        // Faster model + capped max_tokens keeps generation well under the 60s function
        // timeout on Vercel Hobby (Opus would routinely exceed it). Bumped to 3500
        // to accommodate the three new short blurbs without truncating the blog body.
        const response = await client.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 3500,
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

        let draft: {
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          telegramCaption?: string;
          whatsappText?: string;
          instagramCaption?: string;
        };
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
          // Hard-truncate as a safety net — the prompt enforces the
          // caps but a misbehaving response shouldn't silently leak
          // an over-limit caption downstream. Clients should still
          // display the cap visually.
          telegramCaption: draft.telegramCaption ? draft.telegramCaption.slice(0, 280) : undefined,
          whatsappText: draft.whatsappText ? draft.whatsappText.slice(0, 160) : undefined,
          instagramCaption: draft.instagramCaption ?? undefined,
          tokensUsed: {
            input: response.usage.input_tokens,
            output: response.usage.output_tokens,
          },
        };
      }),

    /** Rewrite a body as a tight 280-char Telegram caption. 280 is the
     *  engagement sweet spot (Twitter-length) — anything longer gets
     *  scrolled past on mobile. Used by the Omni-Composer's "Optimize
     *  for Telegram" button. Returns plain text with optional HTML <b>
     *  tags; the caller renders inside Telegram's HTML parse_mode. */
    enhanceForTelegram: adminProcedure
      .input(z.object({
        source: z.string().min(3).max(8000),
        ctaUrl: z.string().url().optional(),
      }))
      .mutation(async ({ input }) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "ANTHROPIC_API_KEY not configured.",
          });
        }
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey });

        const systemPrompt = `You rewrite long-form copy as a tight Telegram caption for Turbo Loop, a transparent audited DeFi yield protocol on BSC.

Voice: confident, premium, community-first. No hype words ("MOON", "100x", "huge"). Specific facts beat generic claims.

HARD CONSTRAINTS — count characters before you respond, going over is a failure:
- Maximum 280 characters TOTAL (Twitter-length — the proven engagement sweet spot on Telegram).
- 1-2 emoji max.
- Structure: ONE hook sentence + ONE call-to-action line. That's it. No middle paragraphs.
- HTML <b> tags are allowed for emphasis on key terms.
- NO Markdown asterisks. NO line walls. NO hashtag dumps.

Output: respond with the caption text ONLY. No quotes, no preamble, no JSON, no character count footer.`;

        const userPrompt = `Source content:\n\n${input.source}${
          input.ctaUrl ? `\n\nCTA URL (mention naturally if helpful): ${input.ctaUrl}` : ""
        }`;

        const response = await client.messages.create({
          model: "claude-sonnet-4-5",
          // 280 chars maxes out around 80 tokens — 300 is plenty
          // headroom for the rare run-on output we then truncate.
          max_tokens: 300,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });
        const textBlock = response.content.find((b) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Empty response from Claude" });
        }
        // Hard truncate as a safety net — the prompt enforces 280
        // but a misbehaving response shouldn't silently leak past.
        const raw = textBlock.text.trim();
        const caption = raw.length <= 280 ? raw : raw.slice(0, 279) + "…";
        return {
          caption,
          tokensUsed: {
            input: response.usage.input_tokens,
            output: response.usage.output_tokens,
          },
        };
      }),

    /** Expand a short prompt or Telegram-length caption into a full
     *  blog post body. Returns { title, slug, excerpt, content }
     *  matching draftBlog's shape so the Omni-Composer can reuse the
     *  same preview pipeline. */
    expandForBlog: adminProcedure
      .input(z.object({
        source: z.string().min(3).max(2000),
        audienceLevel: z.enum(["newcomer", "intermediate", "expert"]).default("intermediate"),
      }))
      .mutation(async ({ input }) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "ANTHROPIC_API_KEY not configured.",
          });
        }
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey });

        const audienceGuide = {
          newcomer: "complete crypto beginners — explain everything in plain English, define every term, no jargon",
          intermediate: "people who know crypto but are new to TurboLoop — assume DeFi basics, focus on what makes TurboLoop unique",
          expert: "experienced DeFi users — go deep on mechanics, math, and on-chain verifiability. Skip the basics.",
        }[input.audienceLevel];

        const systemPrompt = `You expand a short brief or social-post caption into a full long-form blog post for Turbo Loop, a transparent audited DeFi yield protocol on BSC.

Voice: confident, premium, community-first. No hype words ("MOON", "100x", "huge"). Specific facts beat generic claims. Match Bloomberg / Stratechery — readable, dense, factually precise.

Audience: ${audienceGuide}

Output format: respond with VALID JSON only. No prose outside the JSON. Schema:
{
  "title": "60-90 char SEO-friendly title",
  "slug": "kebab-case-slug-no-trailing-dashes",
  "excerpt": "150-220 char summary that makes people click",
  "content": "Full markdown blog post — 800-1500 words, with H2 headings (##), H3 sub-headings (###), bullet lists, and at least one block quote (>). End with a 'Where to next' paragraph that links 2-3 relevant pages on turboloop.tech."
}`;

        const userPrompt = `Source brief / caption to expand:\n\n${input.source}`;

        const response = await client.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 3000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });
        const textBlock = response.content.find((b) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Empty response from Claude" });
        }
        const raw = textBlock.text.trim();
        const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
        let draft: { title: string; slug: string; excerpt: string; content: string };
        try {
          draft = JSON.parse(cleaned);
        } catch {
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

    /** Translate text into one of the supported target languages
     *  (DE / HI / ID) while preserving Markdown structure (headings,
     *  links, bullets) and the source's tone. The Omni-Composer's
     *  Translate buttons hit this and replace the editor content in
     *  place. EN is intentionally not a target — the source is
     *  assumed to be EN-ish.
     *
     *  Translation runs on Claude Sonnet 4.5 (not a dedicated MT
     *  model) because the brand-voice constraints matter more than
     *  literal word-for-word accuracy here. */
    translate: adminProcedure
      .input(z.object({
        source: z.string().min(1).max(20_000),
        target: z.enum(["de", "hi", "id"]),
      }))
      .mutation(async ({ input }) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "ANTHROPIC_API_KEY not configured.",
          });
        }
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey });

        const targetName = {
          de: "German (Deutsch)",
          hi: "Hindi (हिन्दी)",
          id: "Indonesian (Bahasa Indonesia)",
        }[input.target];

        const systemPrompt = `You translate Turbo Loop marketing content into ${targetName} while keeping the brand voice intact.

Rules:
- Preserve Markdown structure exactly: # / ## / ### headings, **bold**, *italic*, [link text](url), \`code\`, bullet lists, block quotes. Do NOT translate URLs.
- Preserve inline brand names: "Turbo Loop", "Turbo Buy", "Turbo Swap", "$TURBO", "BscScan", "MoonPay", "BNB", "USDT", "BSC", "DeFi".
- Match the tone: confident, premium, community-first. No hype words. No emoji walls.
- Numbers, dates, technical specs, contract addresses stay verbatim.
- Idioms get rendered idiomatically in the target language, not translated word-for-word.

Output: respond with the translated text ONLY. No quotes, no preamble, no commentary, no language label.`;

        const response = await client.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: "user", content: input.source }],
        });
        const textBlock = response.content.find((b) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Empty response from Claude" });
        }
        return {
          text: textBlock.text.trim(),
          target: input.target,
          tokensUsed: {
            input: response.usage.input_tokens,
            output: response.usage.output_tokens,
          },
        };
      }),

    /** Generate an image with Cloudflare Workers AI (Flux 1 Schnell)
     *  and upload it to R2. Returns the public R2 URL ready to attach
     *  to a scheduled_post.
     *
     *  Cost: free under Cloudflare's Workers AI free tier (10,000
     *  neurons/day — Flux Schnell costs roughly 1 neuron per generation
     *  so you can do many thousands per day at no charge).
     *
     *  The `size` and `quality` fields are accepted for backwards
     *  compatibility with the previous DALL-E-backed schema. Flux
     *  Schnell on Cloudflare always returns 1024×1024; `num_steps` is
     *  fixed at 8 (the Schnell maximum — anything more would be
     *  rejected). The fields are echoed back unchanged.
     *
     *  `revisedPrompt` is always null — Flux Schnell doesn't rewrite
     *  the prompt the way DALL-E 3 does. The field is preserved in
     *  the response shape so existing client code doesn't break. */
    generateImage: adminProcedure
      .input(z.object({
        prompt: z.string().min(3).max(4000),
        size: z.enum(["1024x1024", "1024x1792", "1792x1024"]).default("1024x1024"),
        quality: z.enum(["standard", "hd"]).default("standard"),
      }))
      .mutation(async ({ input }) => {
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;
        if (!accountId || !apiToken) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Cloudflare AI not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in Vercel environment variables to enable image generation.",
          });
        }

        // Cloudflare Workers AI — Black Forest Labs Flux 1 Schnell.
        // num_steps caps at 8 for the Schnell variant; using the max
        // for best quality since latency is already sub-second.
        const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
        const cfResp = await fetch(cfUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: input.prompt, num_steps: 8 }),
        });
        if (!cfResp.ok) {
          const errText = await cfResp.text().catch(() => "");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Cloudflare AI request failed (${cfResp.status}): ${errText.slice(0, 400)}`,
          });
        }

        // Cloudflare's Workers AI image models can return either raw
        // image bytes (binary Content-Type) OR a JSON envelope with
        // `result.image` as a base64 string. Branch on Content-Type so
        // either flavor works without surprises.
        const contentType = cfResp.headers.get("content-type") || "";
        let buf: Buffer;
        if (contentType.startsWith("image/")) {
          buf = Buffer.from(await cfResp.arrayBuffer());
        } else if (contentType.includes("application/json")) {
          const json = (await cfResp.json()) as {
            result?: { image?: string };
            errors?: Array<{ message?: string }>;
            success?: boolean;
          };
          if (json.success === false || !json.result?.image) {
            const errMsg = json.errors?.[0]?.message || "Cloudflare AI returned no image";
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: errMsg });
          }
          buf = Buffer.from(json.result.image, "base64");
        } else {
          // Fallback — assume bytes.
          buf = Buffer.from(await cfResp.arrayBuffer());
        }
        if (buf.length === 0) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Cloudflare AI returned empty image" });
        }

        const filename = `flux-${Date.now()}.png`;
        const key = `uploads/ai-generated/${filename}`;
        const stored = await storagePut(key, buf, "image/png");

        return {
          url: stored.url,
          key: stored.key,
          prompt: input.prompt,
          revisedPrompt: null as string | null,
          size: input.size,
          quality: input.quality,
        };
      }),

    /** Generate a multi-post campaign in one shot. Takes a high-
     *  level topic + a target post count (3-7) and returns a JSON
     *  array of posts, each with title, content (Markdown), a
     *  Telegram-optimized caption, and a DALL-E prompt suggestion.
     *  The Omni-Composer's Campaign Builder modal renders these as
     *  editable cards, optionally batches DALL-E to generate
     *  images for each, and bulk-creates scheduled_posts rows with
     *  staggered nextRunAt values. */
    generateCampaign: adminProcedure
      .input(z.object({
        topic: z.string().min(3).max(1000),
        count: z.number().int().min(3).max(7).default(3),
        audienceLevel: z.enum(["newcomer", "intermediate", "expert"]).default("intermediate"),
        tone: z.enum(["professional", "hype", "educational"]).default("professional"),
      }))
      .mutation(async ({ input }) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "ANTHROPIC_API_KEY not configured.",
          });
        }
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey });

        const audienceGuide = {
          newcomer: "complete crypto beginners — explain everything in plain English, define every term, no jargon",
          intermediate: "people who know crypto but are new to TurboLoop — assume DeFi basics, focus on what makes TurboLoop unique",
          expert: "experienced DeFi users — go deep on mechanics, math, and on-chain verifiability. Skip the basics.",
        }[input.audienceLevel];

        const toneGuide = {
          professional: "confident, premium, restrained. Bloomberg / Stratechery cadence. Avoid emoji and hype.",
          hype:         "energetic but not desperate. Punchy headlines, momentum-driven, 1-2 tasteful emoji per post max. Never use MOON / 100x / huge.",
          educational:  "teacher voice. Define every term. Use analogies. Bullet lists and numbered steps. Skip rhetoric.",
        }[input.tone];

        const systemPrompt = `You design ${input.count}-post content campaigns for Turbo Loop, a transparent audited DeFi yield protocol on BSC.

A campaign is a SEQUENCE of posts that build on each other across days — Post 1 sets up the hook, the middle posts deepen it, and the final post drives a clear action. Each post should stand alone but also feel like a continuation.

Audience: ${audienceGuide}
Tone: ${toneGuide}

For EACH post produce SIX fields. The short-form blurbs have HARD character caps — count characters before you respond, going over is a failure:

  1. title             — 60-90 char SEO-friendly blog title.
  2. content           — Full Markdown blog post, 800-1500 words, with ## H2 sections, ### H3 subsections, at least one bullet list, and at least one block quote. End with a "Where to next" line linking 1-2 turboloop.tech pages.
  3. telegramCaption   — HARD MAX 280 characters. ONE hook sentence + ONE CTA line. 1-2 emoji max. HTML <b> allowed; NO Markdown asterisks; NO hashtag dumps.
  4. whatsappText      — HARD MAX 160 characters. Plain text only — NO HTML, NO Markdown, NO emoji. Single sentence + the article URL on the next line. URL counts toward the 160 char budget.
  5. instagramCaption  — Exactly 3 punchy lines (separate with \\n), max 300 characters before the hashtag block, then a blank line, then EXACTLY 5 relevant hashtags on one line (e.g. #DeFi #Crypto #YieldFarming #BSC #TurboLoop).
  6. imagePrompt       — A Cloudflare Workers AI / Flux 1 Schnell prompt (1-3 sentences) describing a hero image for this post. Be specific about style ("minimal isometric illustration, cyan + slate palette, flat shading, no text"). DO NOT request text in the image — Flux mangles text.

Output format: respond with VALID JSON ONLY. No prose outside the JSON. Schema:
{
  "campaign": {
    "topic": "echoed back",
    "posts": [
      {
        "day": 1,
        "title": "...",
        "content": "...",
        "telegramCaption": "...",
        "whatsappText": "...",
        "instagramCaption": "...",
        "imagePrompt": "..."
      },
      ...
    ]
  }
}

The "day" field is 1-indexed and matches the post's position in the sequence.`;

        const userPrompt = `Topic: ${input.topic}\n\nGenerate ${input.count} posts.`;

        const response = await client.messages.create({
          model: "claude-sonnet-4-5",
          // Per-post ~1500 words + 4 short blurbs ≈ 2000 tokens → cap at
          // ~14000 for a 7-post campaign, with safety margin. Vercel
          // Hobby's 60s function ceiling is the real limiter; Sonnet 4.5
          // streams ~1k tokens/sec so 14k tokens ≈ 14s — well within.
          max_tokens: 14000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });
        const textBlock = response.content.find((b) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Empty response from Claude" });
        }
        const raw = textBlock.text.trim();
        const cleaned = raw
          .replace(/^```(?:json)?\s*\n?/i, "")
          .replace(/\n?```\s*$/i, "")
          .trim();

        let parsed: {
          campaign: {
            topic: string;
            posts: Array<{
              day: number;
              title: string;
              content: string;
              telegramCaption: string;
              whatsappText?: string;
              instagramCaption?: string;
              imagePrompt: string;
            }>;
          };
        };
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Claude returned invalid JSON. Raw output (first 500 chars):\n${cleaned.slice(0, 500)}`,
          });
        }
        if (!parsed?.campaign?.posts || !Array.isArray(parsed.campaign.posts)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Claude response missing campaign.posts array",
          });
        }
        // Safety net — Claude is told the caps but we don't trust the
        // output to be exactly within bounds. Hard truncate so a
        // misbehaving response can't leak past the Telegram / WhatsApp
        // limits into a live broadcast.
        const safePosts = parsed.campaign.posts.map((p) => ({
          ...p,
          telegramCaption: p.telegramCaption
            ? (p.telegramCaption.length <= 280 ? p.telegramCaption : p.telegramCaption.slice(0, 279) + "…")
            : "",
          whatsappText: p.whatsappText
            ? (p.whatsappText.length <= 160 ? p.whatsappText : p.whatsappText.slice(0, 159) + "…")
            : "",
          instagramCaption: p.instagramCaption ?? "",
        }));

        return {
          topic: parsed.campaign.topic ?? input.topic,
          posts: safePosts,
          tokensUsed: {
            input: response.usage.input_tokens,
            output: response.usage.output_tokens,
          },
        };
      }),

    /** Single-shot multi-channel generator powering the Smart
     *  Composer. One Claude call returns ALL seven channel-shaped
     *  outputs from a single raw content seed — more efficient and
     *  more coherent than seven sequential calls because the model
     *  sees the full set when balancing emphasis across formats.
     *
     *  Output shape:
     *    blogPost.title         — 60-90 char SEO title
     *    blogPost.slug          — kebab-case slug
     *    blogPost.excerpt       — 150-220 char summary
     *    blogPost.content       — Full Markdown blog (800-1500 words)
     *    telegramEN             — 280-char HTML caption (EN)
     *    telegramDE             — 280-char HTML caption (German)
     *    telegramHI             — 280-char HTML caption (Hindi)
     *    telegramID             — 280-char HTML caption (Indonesian)
     *    suggestedButtonText    — short Telegram inline-button label
     *    whatsappText           — 160-char plain text + URL
     *    instagramCaption       — 3 lines + 5 hashtags
     *    imagePrompt            — Cloudflare Flux 1 Schnell prompt
     *
     *  Server-side validation: if any short blurb exceeds its cap
     *  on the first pass, we retry ONCE with a stricter "you went
     *  over by N characters, regenerate within the cap" follow-up
     *  message. After the retry we hard-truncate as a safety net. */
    generateAllChannels: adminProcedure
      .input(z.object({
        rawContent: z.string().min(3).max(8000),
        mediaUrl: z.string().url().optional(),
        tone: z.enum(["professional", "hype", "educational"]).default("professional"),
        audience: z.enum(["newcomer", "intermediate", "expert"]).default("intermediate"),
      }))
      .mutation(async ({ input }) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "ANTHROPIC_API_KEY not configured. Add it to Vercel environment variables (Project Settings → Environment Variables) and redeploy.",
          });
        }
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey });

        const audienceGuide = {
          newcomer: "complete crypto beginners — explain everything in plain English, define every term, no jargon",
          intermediate: "people who know crypto but are new to TurboLoop — assume DeFi basics, focus on what makes TurboLoop unique",
          expert: "experienced DeFi users — go deep on mechanics, math, and on-chain verifiability. Skip the basics.",
        }[input.audience];

        const toneGuide = {
          professional: "confident, premium, restrained. Bloomberg / Stratechery cadence. Avoid emoji and hype.",
          hype:         "energetic but not desperate. Punchy headlines, momentum-driven, 1-2 tasteful emoji per post max. Never use MOON / 100x / huge.",
          educational:  "teacher voice. Define every term. Use analogies. Bullet lists and numbered steps. Skip rhetoric.",
        }[input.tone];

        const baseSystem = `You are the multi-channel content generator for Turbo Loop, a transparent audited DeFi yield protocol on BSC.

A user gives you ONE raw idea / topic / news snippet and you produce a coordinated set of outputs sized for every channel we ship on. Each output must stand alone but share the same underlying message — readers seeing the Telegram, the WhatsApp, and the blog should recognize the same campaign.

Audience: ${audienceGuide}
Tone: ${toneGuide}

HARD CHARACTER CAPS — count characters before responding. Going over is a failure:
  • telegramEN / telegramDE / telegramHI / telegramID  →  ≤280 chars EACH
  • whatsappText                                       →  ≤160 chars
  • instagramCaption                                    →  3 lines (≤300 chars) + blank line + 5 hashtags on one line

Per-channel specs:
  • blogPost.title           — 60-90 char SEO-friendly title.
  • blogPost.slug            — kebab-case, no trailing dashes.
  • blogPost.excerpt         — 150-220 char summary that earns the click.
  • blogPost.content         — Full Markdown, 800-1500 words, ## H2 sections, ### H3 sub-sections, at least one bullet list, at least one block quote. End with "Where to next" linking 1-2 turboloop.tech pages.
  • telegramEN               — ≤280 chars. ONE hook + ONE CTA. HTML <b> allowed; NO Markdown asterisks; 1-2 emoji max.
  • telegramDE               — Same structure as telegramEN, translated to German. ≤280 chars in the translated form. Brand terms (Turbo Loop, $TURBO, USDT, BscScan, BNB, BSC, DeFi, MoonPay) stay verbatim.
  • telegramHI               — Same structure, translated to Hindi (Devanagari). ≤280 chars in the translated form. Brand terms verbatim.
  • telegramID               — Same structure, translated to Indonesian (Bahasa Indonesia). ≤280 chars. Brand terms verbatim.
  • suggestedButtonText      — 1-3 word inline-keyboard label for the Telegram captions (e.g. "Read more", "Open calculator").
  • whatsappText             — ≤160 chars TOTAL. Plain text only — NO HTML, NO Markdown, NO emoji. Single sentence + the canonical article URL on the next line. URL counts toward the 160 char budget; if no slug yet, omit the URL.
  • instagramCaption         — Exactly 3 punchy lines separated by \\n, max 300 characters in the body, then a blank line (\\n\\n), then EXACTLY 5 relevant hashtags on one line (e.g. "#DeFi #Crypto #YieldFarming #BSC #TurboLoop").
  • imagePrompt              — A Cloudflare Workers AI / Flux 1 Schnell prompt (1-3 sentences). Be specific about style ("minimal isometric illustration, cyan + slate palette, flat shading, no text"). DO NOT request text in the image — Flux mangles text.

Output: respond with VALID JSON ONLY. No prose outside the JSON. Schema:
{
  "blogPost": { "title": "...", "slug": "...", "excerpt": "...", "content": "..." },
  "telegramEN": "...",
  "telegramDE": "...",
  "telegramHI": "...",
  "telegramID": "...",
  "suggestedButtonText": "...",
  "whatsappText": "...",
  "instagramCaption": "...",
  "imagePrompt": "..."
}`;

        const userPrompt = `Raw content seed:\n\n${input.rawContent}${input.mediaUrl ? `\n\nMedia attached: ${input.mediaUrl}` : ""}`;

        // Inline parser + validator. Returns the parsed object PLUS
        // a list of cap violations. We use the violations to decide
        // whether to retry once with a stricter prompt.
        type AllChannels = {
          blogPost: { title: string; slug: string; excerpt: string; content: string };
          telegramEN: string;
          telegramDE: string;
          telegramHI: string;
          telegramID: string;
          suggestedButtonText?: string;
          whatsappText: string;
          instagramCaption: string;
          imagePrompt: string;
        };
        function parseAndValidate(text: string): { parsed: AllChannels; violations: string[] } {
          const cleaned = text
            .trim()
            .replace(/^```(?:json)?\s*\n?/i, "")
            .replace(/\n?```\s*$/i, "")
            .trim();
          // Guard: if the response doesn't start with "{", it's not the
          // JSON envelope we asked for — it's almost always Claude
          // apologizing in prose ("An error occurred…", "I'm sorry, I
          // can't…"). Surface a clear message rather than letting the
          // JSON.parse failure leak the cryptic "Unexpected token 'A'"
          // string to the client.
          if (!cleaned.startsWith("{")) {
            throw new Error(
              `Claude returned a non-JSON response. This usually means the model couldn't complete the request. First 200 chars: ${cleaned.slice(0, 200)}`
            );
          }
          const parsed = JSON.parse(cleaned) as AllChannels;
          const v: string[] = [];
          if (!parsed?.blogPost?.content) v.push("blogPost.content missing");
          for (const k of ["telegramEN", "telegramDE", "telegramHI", "telegramID"] as const) {
            const s = parsed[k] ?? "";
            if (s.length > 280) v.push(`${k} is ${s.length} chars (cap 280, over by ${s.length - 280})`);
          }
          if ((parsed.whatsappText ?? "").length > 160) {
            v.push(`whatsappText is ${parsed.whatsappText.length} chars (cap 160, over by ${parsed.whatsappText.length - 160})`);
          }
          return { parsed, violations: v };
        }

        // First pass — generous max_tokens (long-form blog body + 4
        // translations + 3 short blurbs ≈ 4000 tokens worst case).
        // Wrap the SDK call so auth / rate-limit / network failures
        // surface as a clear tRPC error instead of bubbling up as an
        // opaque exception the frontend can't act on.
        let firstResp;
        try {
          firstResp = await client.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 5000,
            system: baseSystem,
            messages: [{ role: "user", content: userPrompt }],
          });
        } catch (sdkErr: any) {
          const status = sdkErr?.status ?? sdkErr?.response?.status;
          const msg = sdkErr?.message || String(sdkErr);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              status === 401
                ? "Anthropic API rejected the key (401). Verify ANTHROPIC_API_KEY in Vercel environment variables."
                : status === 429
                ? "Anthropic API rate-limited the request (429). Wait a minute and try again."
                : `Anthropic API call failed${status ? ` (${status})` : ""}: ${msg}`,
          });
        }
        const firstText = firstResp.content.find((b) => b.type === "text");
        if (!firstText || firstText.type !== "text") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Empty response from Claude" });
        }
        let parsed: AllChannels;
        let violations: string[];
        try {
          const r = parseAndValidate(firstText.text);
          parsed = r.parsed;
          violations = r.violations;
        } catch (e) {
          // Surface the parser's own error message (which already
          // contains a sensible prefix), not the raw "Unexpected
          // token" or the full Claude apology text.
          const msg = e instanceof Error ? e.message : String(e);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: msg,
          });
        }

        let tokensInTotal = firstResp.usage.input_tokens;
        let tokensOutTotal = firstResp.usage.output_tokens;
        let retried = false;

        // ONE retry pass if any caps were violated. The retry message
        // tells Claude exactly which fields broke and by how much, and
        // asks it to regenerate ONLY those fields — but since the API
        // doesn't support partial output, it returns the whole JSON
        // again. We pass the previous response as assistant context
        // so Claude can use it as a starting point.
        if (violations.length > 0) {
          retried = true;
          const retryUser = `Your previous response broke these character caps:\n\n${violations.map((v) => "- " + v).join("\n")}\n\nRegenerate the FULL JSON response, keeping the blogPost content as-is, but tighten the short-form fields so EVERY field is at or under its cap. Count characters before responding.`;
          const retryResp = await client.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 5000,
            system: baseSystem,
            messages: [
              { role: "user", content: userPrompt },
              { role: "assistant", content: firstText.text },
              { role: "user", content: retryUser },
            ],
          });
          const retryText = retryResp.content.find((b) => b.type === "text");
          if (retryText && retryText.type === "text") {
            try {
              const r = parseAndValidate(retryText.text);
              parsed = r.parsed;
              violations = r.violations;
            } catch {
              // Keep the first-pass result if the retry doesn't parse;
              // we'll still hard-truncate below.
            }
            tokensInTotal += retryResp.usage.input_tokens;
            tokensOutTotal += retryResp.usage.output_tokens;
          }
        }

        // Safety-net hard truncation after the (optional) retry.
        const cap = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1) + "…");
        const safe: AllChannels = {
          blogPost: parsed.blogPost,
          telegramEN: cap(parsed.telegramEN ?? "", 280),
          telegramDE: cap(parsed.telegramDE ?? "", 280),
          telegramHI: cap(parsed.telegramHI ?? "", 280),
          telegramID: cap(parsed.telegramID ?? "", 280),
          suggestedButtonText: parsed.suggestedButtonText ?? "Read more",
          whatsappText: cap(parsed.whatsappText ?? "", 160),
          instagramCaption: parsed.instagramCaption ?? "",
          imagePrompt: parsed.imagePrompt ?? "",
        };

        return {
          ...safe,
          retried,
          remainingViolations: violations,
          tokensUsed: { input: tokensInTotal, output: tokensOutTotal },
        };
      }),
  }),

  // Public share-text generator — generates 3 AI caption variants for a banner
  shareText: router({
    generate: publicProcedure
      .input(z.object({
        bannerTitle: z.string().min(2).max(200),
        category: z.string().min(2).max(80),
        language: z.string().default("english"),
        existingCaption: z.string().max(1000).optional(),
      }))
      .mutation(async ({ input }) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          // Fallback: return the existing caption as 3 variants if no API key
          const fallback = input.existingCaption || `Discover TurboLoop — earn passive income daily. Start your 30 or 60-day Loop Plan today at turboloop.tech`;
          return { captions: [fallback, fallback, fallback] };
        }
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey });
        const langMap: Record<string, string> = {
          hindi: "Hindi", spanish: "Spanish", nigerian: "Nigerian Pidgin",
          indonesian: "Indonesian", chinese: "Simplified Chinese", italian: "Italian",
          arabic: "Arabic", urdu: "Urdu", german: "German", english: "English",
        };
        const lang = langMap[input.language] ?? "English";
        const systemPrompt = `You are a social media copywriter for TurboLoop, a transparent DeFi yield protocol on BSC.
Core message: Users earn $TURBO tokens for FREE for 10 months simply by investing in the 30 or 60-day Loop Plan. No trading, no risk of price manipulation — just invest in the plan and earn tokens passively.
Voice: confident, premium, community-first. No hype (no MOON, 100x). 1-3 emoji max per caption. Natural, conversational.
Write in ${lang}.
Return ONLY valid JSON: { "captions": ["caption1", "caption2", "caption3"] } — 3 unique variants, each 80-160 characters, each ending with turboloop.tech`;
        const userPrompt = `Banner: "${input.bannerTitle}" (category: ${input.category})${input.existingCaption ? `\nExisting caption for reference: ${input.existingCaption}` : ""}`;
        const response = await client.messages.create({
          model: "claude-haiku-4-5",
          max_tokens: 600,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });
        const textBlock = response.content.find((b) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") return { captions: [input.existingCaption ?? ""] };
        const raw = textBlock.text.trim().replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
        try {
          const parsed = JSON.parse(raw);
          return { captions: Array.isArray(parsed.captions) ? parsed.captions : [input.existingCaption ?? ""] };
        } catch {
          return { captions: [input.existingCaption ?? ""] };
        }
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
        authorContact: z.string().max(320).optional(), // legacy free-text
        authorCountry: z.string().max(100).optional(),
        body: z.string().min(10).max(5000),
        fileUrl: z.string().url().max(1000).optional(),
        // Contact fields added 2026-05-22. WhatsApp is required on
        // ALL new submissions (form enforces, schema enforces). Other
        // social channels are optional fallbacks. Format expected for
        // whatsapp_number is "+CC NNNNNNNNN" (E.164-ish with leading
        // +country-code, but we accept loose formatting and rely on
        // the client-side phone input for the country selector).
        whatsappNumber: z.string().min(7).max(50),
        email: z.string().email().max(320).optional().or(z.literal("")),
        telegramHandle: z.string().max(100).optional(),
        otherSocial: z.string().max(300).optional(),
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
        // Prefer the structured `email` field over the legacy free-text
        // `authorContact` — most new submissions will only set the
        // structured field, so the old code path silently skipped the
        // confirmation email for everyone post-migration. Fall back to
        // authorContact for legacy rows where it was the only contact.
        const confirmEmailTo =
          (input.email && input.email.trim()) || input.authorContact;
        sendSubmissionReceivedEmail({
          to: confirmEmailTo,
          name: input.authorName,
          kind: input.type,
        }).catch(() => {});

        // Telegram notification — routed to the dedicated
        // "TurboLoop Submissions & Applications" group via
        // TELEGRAM_SUBMISSIONS_CHAT. Event applications use a
        // different chat (TELEGRAM_SUPPORT_CHAT) — they're more
        // operationally sensitive and deserve their own funnel.
        // If the env var isn't set, the notify is skipped silently;
        // ops still has the row in the admin dashboard either way.
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const supportChatId = process.env.TELEGRAM_SUBMISSIONS_CHAT;
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
          // WhatsApp wa.me link is one-tap-to-message — admin team
          // shouldn't have to copy/paste the number from the message
          // into their phone. Strip non-digits for the link target
          // but show the formatted version in the visible text.
          const waDigits = (input.whatsappNumber || "").replace(/[^\d]/g, "");
          const waLink = waDigits
            ? `https://wa.me/${waDigits}`
            : null;
          const lines = [
            `${headlineEmoji} <b>New ${input.type.replace("_", " ")}</b>`,
            "",
            `<b>Name:</b> ${input.authorName}`,
            input.authorCountry ? `<b>Country:</b> ${input.authorCountry}` : null,
            // PRIMARY contact: WhatsApp. Show both the human-readable
            // number and a tappable wa.me link.
            input.whatsappNumber
              ? `<b>WhatsApp:</b> <a href="${waLink}">${input.whatsappNumber}</a>`
              : null,
            input.email ? `<b>Email:</b> ${input.email}` : null,
            input.telegramHandle ? `<b>Telegram:</b> ${input.telegramHandle}` : null,
            input.otherSocial ? `<b>Other:</b> ${input.otherSocial}` : null,
            // Legacy free-text contact, if still populated. Most NEW
            // submissions won't set it (the structured fields above
            // cover the same ground), but admin sees it if present.
            input.authorContact ? `<b>Contact (legacy):</b> ${input.authorContact}` : null,
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

    /** Send a templated email to a submission's email contact —
     *  admin-only. Uses the existing Resend integration via
     *  server/email.ts → sendAdminTemplateEmail. Returns whether the
     *  send happened (it's skipped if no valid email is on file).
     *
     *  Templates: content_approved, payment_pending_wallet,
     *  payment_sent, content_rejected, needs_more_info. */
    sendTemplateEmail: adminProcedure
      .input(z.object({
        id: z.number(),
        template: z.enum([
          "content_approved",
          "payment_pending_wallet",
          "payment_sent",
          "content_rejected",
          "needs_more_info",
        ]),
        customMessage: z.string().max(2000).optional(),
        reason: z.string().max(500).optional(),
        payoutAmountUsd: z.number().int().optional(),
        payoutTxId: z.string().max(200).optional(),
      }))
      .mutation(async ({ input }) => {
        const all = await listContentSubmissions();
        const sub = all.find(s => s.id === input.id);
        if (!sub) {
          return { ok: false as const, sent: false as const, reason: "submission not found" };
        }
        // Prefer the structured `email` field, fall back to legacy
        // `authorContact` for older rows. Matches the same fallback
        // applied for the auto-confirmation emails.
        const to = sub.email?.trim() || sub.authorContact || null;
        const { sendAdminTemplateEmail } = await import("./email");
        const result = await sendAdminTemplateEmail({
          template: input.template,
          to,
          name: sub.authorName,
          kind: sub.type,
          customMessage: input.customMessage ?? null,
          reason: input.reason ?? null,
          payoutAmountUsd: input.payoutAmountUsd ?? null,
          payoutTxId: input.payoutTxId ?? null,
        });
        return result;
      }),

    /** CSV export of all submissions — admin-only. Returns the CSV as
     *  a single string; the legacy admin SPA wraps that in a Blob and
     *  triggers a download. Includes contact fields + wallet + status
     *  + type + author so the team can pull a snapshot for ops work
     *  outside the dashboard. */
    exportCsv: adminProcedure
      .input(z.object({
        status: z.enum(["pending", "approved", "payment_due", "paid", "rejected"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const rows = await listContentSubmissions(input?.status);
        const headers = [
          "id",
          "type",
          "status",
          "author_name",
          "author_country",
          "whatsapp_number",
          "email",
          "telegram_handle",
          "other_social",
          "author_contact_legacy",
          "wallet_address",
          "youtube_url",
          "file_url",
          "view_count",
          "payout_amount_usd",
          "body_preview",
          "created_at",
        ];
        const csvEscape = (v: unknown): string => {
          if (v === null || v === undefined) return "";
          const s = String(v);
          // Wrap in quotes if contains comma, quote, or newline. Double
          // any existing quotes inside.
          if (/[,"\n\r]/.test(s)) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        };
        const lines = [headers.join(",")];
        for (const r of rows) {
          const bodyPreview = (r.body || "").slice(0, 140).replace(/\s+/g, " ").trim();
          lines.push(
            [
              r.id,
              r.type,
              r.status,
              r.authorName,
              r.authorCountry ?? "",
              r.whatsappNumber ?? "",
              r.email ?? "",
              r.telegramHandle ?? "",
              r.otherSocial ?? "",
              r.authorContact ?? "",
              r.walletAddress ?? "",
              r.youtubeUrl ?? "",
              r.fileUrl ?? "",
              r.viewCount ?? "",
              r.payoutAmountUsd ?? "",
              bodyPreview,
              r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt ?? ""),
            ].map(csvEscape).join(",")
          );
        }
        return {
          rowCount: rows.length,
          csv: lines.join("\n"),
          filename: `turboloop-submissions-${new Date().toISOString().slice(0, 10)}.csv`,
        };
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

    /** Auto-discover TurboLoop-related videos not yet on the wall.
     *  Sweeps 5 brand-relevant search terms, dedups by videoId, drops
     *  anything already curated, then fetches statistics for the
     *  remainder and ranks by an engagement+recency score.
     *
     *  Returns the top 20. If YOUTUBE_API_KEY is absent we degrade
     *  gracefully — the admin UI renders a warning instead of a 500. */
    getSuggestions: adminProcedure.query(async () => {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return { missingApiKey: true as const, suggestions: [] as Array<never> };
      }

      const SEARCH_TERMS = [
        "TurboLoop DeFi",
        "TurboLoop protocol review",
        "TurboLoop USDT yield",
        "turboloop.tech",
        "Turbo Loop crypto",
      ];

      // 1. Pull a search.list per term. 10 results × 5 terms = 50 raw
      //    candidates before dedup. Cost: 100 quota units per call ×
      //    5 = 500 units (5% of the daily 10k free-tier budget).
      type RawHit = {
        videoId: string;
        title: string;
        channelTitle: string | null;
        thumbnailUrl: string | null;
      };
      const seen = new Map<string, RawHit>();
      for (const q of SEARCH_TERMS) {
        const url = new URL("https://www.googleapis.com/youtube/v3/search");
        url.searchParams.set("part", "snippet");
        url.searchParams.set("type", "video");
        url.searchParams.set("maxResults", "10");
        url.searchParams.set("q", q);
        url.searchParams.set("key", apiKey);
        const res = await fetch(url.toString());
        if (!res.ok) continue;
        const data = (await res.json()) as {
          items?: Array<{
            id?: { videoId?: string };
            snippet?: {
              title?: string;
              channelTitle?: string;
              thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
            };
          }>;
        };
        for (const item of data.items ?? []) {
          const id = item.id?.videoId;
          if (!id || seen.has(id) || !item.snippet) continue;
          const thumb =
            item.snippet.thumbnails?.medium?.url ??
            item.snippet.thumbnails?.default?.url ??
            null;
          seen.set(id, {
            videoId: id,
            title: item.snippet.title ?? "(no title)",
            channelTitle: item.snippet.channelTitle ?? null,
            thumbnailUrl: thumb,
          });
        }
      }

      // 2. Exclude anything already curated. Read once; the wall is
      //    bounded so a full scan is fine.
      const existing = await listSocialWallVideos();
      const onWall = new Set(existing.map(v => v.youtubeId));
      const candidates = Array.from(seen.values()).filter(h => !onWall.has(h.videoId));
      if (candidates.length === 0) {
        return { missingApiKey: false as const, suggestions: [] as Array<never> };
      }

      // 3. Fetch statistics + publish dates in a single videos.list call
      //    (up to 50 ids per call — cheaper than search.list at 1 unit).
      const ids = candidates.map(c => c.videoId).join(",");
      const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      statsUrl.searchParams.set("part", "statistics,snippet");
      statsUrl.searchParams.set("id", ids);
      statsUrl.searchParams.set("key", apiKey);
      const statsRes = await fetch(statsUrl.toString());
      if (!statsRes.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `YouTube videos.list failed: HTTP ${statsRes.status}`,
        });
      }
      const statsData = (await statsRes.json()) as {
        items?: Array<{
          id?: string;
          snippet?: { publishedAt?: string; channelTitle?: string };
          statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
        }>;
      };
      const statsById = new Map<string, {
        viewCount: number;
        likeCount: number;
        commentCount: number;
        publishedAt: string | null;
        channelTitle: string | null;
      }>();
      for (const it of statsData.items ?? []) {
        if (!it.id) continue;
        statsById.set(it.id, {
          viewCount: Number(it.statistics?.viewCount ?? 0),
          likeCount: Number(it.statistics?.likeCount ?? 0),
          commentCount: Number(it.statistics?.commentCount ?? 0),
          publishedAt: it.snippet?.publishedAt ?? null,
          channelTitle: it.snippet?.channelTitle ?? null,
        });
      }

      // 4. Score each candidate. Recency multiplier rewards posts that
      //    captured engagement quickly — relevant signal for a DeFi
      //    feed where stale reviews lose context.
      const now = Date.now();
      const DAY_MS = 86_400_000;
      const ranked = candidates
        .map(c => {
          const s = statsById.get(c.videoId);
          if (!s) return null;
          const base =
            s.viewCount * 1.0 + s.likeCount * 5.0 + s.commentCount * 3.0;
          let multiplier = 1.0;
          if (s.publishedAt) {
            const ageDays = (now - new Date(s.publishedAt).getTime()) / DAY_MS;
            if (ageDays <= 30) multiplier = 1.5;
            else if (ageDays <= 90) multiplier = 1.2;
          }
          return {
            youtubeId: c.videoId,
            title: c.title,
            channelTitle: s.channelTitle ?? c.channelTitle,
            thumbnailUrl: c.thumbnailUrl,
            viewCount: s.viewCount,
            likeCount: s.likeCount,
            commentCount: s.commentCount,
            publishedAt: s.publishedAt,
            score: Math.round(base * multiplier),
          };
        })
        .filter(Boolean) as Array<{
          youtubeId: string;
          title: string;
          channelTitle: string | null;
          thumbnailUrl: string | null;
          viewCount: number;
          likeCount: number;
          commentCount: number;
          publishedAt: string | null;
          score: number;
        }>;

      ranked.sort((a, b) => b.score - a.score);
      return {
        missingApiKey: false as const,
        suggestions: ranked.slice(0, 20),
      };
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
    /** Aggregated automation activity log — `lastFired:*`,
     *  `oneShot:*`, and `cronError:*` rows from site_settings, sorted
     *  by stored timestamp/error-time desc. Feeds the admin
     *  Automation tab. Default limit 100; can be lowered for
     *  smaller sections. */
    getAutomationLog: adminProcedure
      .input(
        z
          .object({ limit: z.number().int().min(1).max(500).optional() })
          .optional()
      )
      .query(({ input }) => listAutomationLog(input?.limit ?? 100)),

    // ─── Omni-Composer scheduled posts (Automation V2) ───
    // Channel enum is shared with the cron-master fan-out switch. If
    // you add a channel here, also add a `case "..."` to the
    // dispatchScheduledPost helper in server/_vercel/cron-master.ts.
    scheduledPosts: router({
      list: adminProcedure
        .input(z.object({
          status: z.enum(["pending", "running", "completed", "paused", "failed"]).optional(),
          limit: z.number().int().min(1).max(500).optional(),
        }).optional())
        .query(({ input }) => listScheduledPosts(input)),

      getById: adminProcedure
        .input(z.object({ id: z.number().int() }))
        .query(({ input }) => getScheduledPostById(input.id)),

      create: adminProcedure
        .input(z.object({
          title: z.string().max(500).nullable().optional(),
          content: z.string().min(1),
          mediaUrl: z.string().url().nullable().optional(),
          mediaType: z.enum(["none", "image", "video"]).default("none"),
          channels: z.array(z.enum(SCHEDULED_POST_CHANNELS)).min(1),
          buttons: z.array(z.object({
            text: z.string().min(1).max(64),
            url: z.string().url(),
          })).max(8).default([]),
          scheduleType: z.enum(["once", "recurring"]),
          // 5-field UTC cron string. Required for recurring; ignored
          // for once. Server validates it actually parses below.
          cronExpression: z.string().max(200).nullable().optional(),
          // ISO timestamp string — for `once` this is the firing
          // moment; for `recurring` this is the next firing moment
          // (server re-derives later runs from cronExpression).
          nextRunAt: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
          // Validate cron upfront so we don't write a bad row.
          if (input.scheduleType === "recurring") {
            if (!input.cronExpression) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "cronExpression is required for recurring posts",
              });
            }
            // Lazy import — cron-parser is only needed when admin saves
            // a recurring post, so we don't pay for it on every request.
            const { CronExpressionParser } = await import("cron-parser");
            try {
              CronExpressionParser.parse(input.cronExpression, { tz: "UTC" });
            } catch (e: any) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Invalid cronExpression: ${e?.message || String(e)}`,
              });
            }
          }
          const createdBy = (ctx as any).admin?.email ?? null;
          const row = await createScheduledPost({
            title: input.title ?? null,
            content: input.content,
            mediaUrl: input.mediaUrl ?? null,
            mediaType: input.mediaType,
            channels: input.channels as string[],
            buttons: input.buttons,
            scheduleType: input.scheduleType,
            cronExpression: input.scheduleType === "recurring" ? input.cronExpression! : null,
            nextRunAt: new Date(input.nextRunAt),
            status: "pending",
            createdBy,
          });
          return row;
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number().int(),
          title: z.string().max(500).nullable().optional(),
          content: z.string().min(1).optional(),
          mediaUrl: z.string().url().nullable().optional(),
          mediaType: z.enum(["none", "image", "video"]).optional(),
          channels: z.array(z.enum(SCHEDULED_POST_CHANNELS)).min(1).optional(),
          buttons: z.array(z.object({
            text: z.string().min(1).max(64),
            url: z.string().url(),
          })).max(8).optional(),
          scheduleType: z.enum(["once", "recurring"]).optional(),
          cronExpression: z.string().max(200).nullable().optional(),
          nextRunAt: z.string().min(1).optional(),
          status: z.enum(["pending", "paused", "completed", "failed"]).optional(),
        }))
        .mutation(async ({ input }) => {
          if (input.cronExpression) {
            const { CronExpressionParser } = await import("cron-parser");
            try {
              CronExpressionParser.parse(input.cronExpression, { tz: "UTC" });
            } catch (e: any) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Invalid cronExpression: ${e?.message || String(e)}`,
              });
            }
          }
          const patch: any = { ...input };
          delete patch.id;
          if (patch.nextRunAt) patch.nextRunAt = new Date(patch.nextRunAt);
          if (patch.channels) patch.channels = patch.channels as string[];
          const row = await updateScheduledPost(input.id, patch);
          if (!row) {
            throw new TRPCError({ code: "NOT_FOUND", message: `Scheduled post ${input.id} not found` });
          }
          return row;
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number().int() }))
        .mutation(({ input }) => deleteScheduledPost(input.id)),

      /** Toggle pause/resume — pause prevents the cron from picking
       *  it up; resume reopens it. If a recurring post was paused
       *  past its nextRunAt, resuming will fire immediately on the
       *  next 5-min tick (intentional — the admin knows what they
       *  want). */
      pause: adminProcedure
        .input(z.object({ id: z.number().int() }))
        .mutation(async ({ input }) => {
          const row = await updateScheduledPost(input.id, { status: "paused" });
          if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Not found" });
          return row;
        }),
      resume: adminProcedure
        .input(z.object({ id: z.number().int() }))
        .mutation(async ({ input }) => {
          const row = await updateScheduledPost(input.id, { status: "pending", lastError: null });
          if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Not found" });
          return row;
        }),

      /** Force-fire a scheduled post on the next cron tick by setting
       *  nextRunAt to now. Returns the updated row so the UI can show
       *  the moved timestamp. We don't synchronously fan out here —
       *  the cron is the single source of truth for actual broadcast
       *  side-effects, so "Run Now" really means "Run on the next
       *  5-min tick" (typically <5 min away). */
      runNow: adminProcedure
        .input(z.object({ id: z.number().int() }))
        .mutation(async ({ input }) => {
          const row = await updateScheduledPost(input.id, {
            nextRunAt: new Date(),
            status: "pending",
            lastError: null,
          });
          if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Not found" });
          return row;
        }),
    }),

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
      .mutation(async ({ input, ctx }) => {
        const result = await createBlogPost(input);
        logAuditEvent({ action: "blog.create", actor: ctx.admin.email, targetType: "blog_post", targetId: input.slug });
        return result;
      }),
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
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await updateBlogPost(id, data);
        logAuditEvent({ action: "blog.update", actor: ctx.admin.email, targetType: "blog_post", targetId: String(id) });
        return result;
      }),
    deleteBlogPost: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      await deleteBlogPost(input.id);
      logAuditEvent({ action: "blog.delete", actor: ctx.admin.email, targetType: "blog_post", targetId: String(input.id) });
    }),

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
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `uploads/${Date.now()}-${input.filename}`;
        const result = await storagePut(key, buffer, input.contentType);
        logAuditEvent({ action: "upload.file", actor: ctx.admin.email, targetType: "r2_file", targetId: key, details: `${input.contentType}, ${buffer.length} bytes` });
        return result;
      }),

    auditLog: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(500).default(100) }).optional())
      .query(({ input }) => listAuditLog(input?.limit ?? 100)),

    getSetting: adminProcedure.input(z.object({ key: z.string() })).query(({ input }) => getSetting(input.key)),
    setSetting: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(({ input }) => setSetting(input.key, input.value)),
  }),
});

export type AppRouter = typeof appRouter;
