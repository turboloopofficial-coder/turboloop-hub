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
