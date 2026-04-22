import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context for public procedures
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// Mock context for admin procedures (with admin_token cookie)
function createAdminContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {
        cookie: "admin_token=mock-token",
      },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("content routes (public)", () => {
  it("returns blog posts as an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const posts = await caller.content.blogPosts();
    expect(Array.isArray(posts)).toBe(true);
  });

  it("returns videos as an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const videos = await caller.content.videos();
    expect(Array.isArray(videos)).toBe(true);
    // Should have seeded videos
    expect(videos.length).toBeGreaterThan(0);
  });

  it("returns events as an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const events = await caller.content.events();
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);
  });

  it("returns leaderboard with 6 countries", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const leaderboard = await caller.content.leaderboard();
    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBe(6);
    // Check order
    expect(leaderboard[0].country).toBe("Germany");
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[5].country).toBe("Brazil");
    expect(leaderboard[5].rank).toBe(6);
  });

  it("returns promotions as an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const promos = await caller.content.promotions();
    expect(Array.isArray(promos)).toBe(true);
    expect(promos.length).toBe(4);
  });

  it("returns roadmap phases with 9 entries", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const phases = await caller.content.roadmap();
    expect(Array.isArray(phases)).toBe(true);
    expect(phases.length).toBe(9);
    // Phase 6 should be current
    const phase6 = phases.find(p => p.phase === 6);
    expect(phase6).toBeDefined();
    expect(phase6?.status).toBe("current");
  });

  it("returns videos categorized correctly", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const videos = await caller.content.videos();
    const presentations = videos.filter(v => v.category === "presentation");
    const howToJoin = videos.filter(v => v.category === "how-to-join");
    const withdraw = videos.filter(v => v.category === "withdraw-compound");
    expect(presentations.length).toBe(10);
    expect(howToJoin.length).toBe(10);
    expect(withdraw.length).toBe(8);
  });

  it("returns blog post by slug (not found)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const post = await caller.content.blogPost({ slug: "nonexistent-post" });
    expect(post).toBeUndefined();
  });
});

describe("admin routes", () => {
  it("admin login rejects invalid credentials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.login({ email: "wrong@email.com", password: "wrongpass" })
    ).rejects.toThrow();
  });

  it("admin me rejects unauthenticated requests", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.me()).rejects.toThrow("Admin authentication required");
  });

  it("admin logout clears cookie", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.logout();
    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalledWith("admin_token", expect.objectContaining({
      httpOnly: true,
      path: "/",
    }));
  });
});
