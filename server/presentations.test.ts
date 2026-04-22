import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module to avoid actual database calls
vi.mock("./db", async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>;
  return {
    ...original,
    listPresentations: vi.fn((publishedOnly?: boolean) => {
      const all = [
        { id: 1, title: "Turbo Loop - English", language: "English", fileUrl: "https://example.com/en.pdf", sortOrder: 0, published: true, createdAt: new Date() },
        { id: 2, title: "Turbo Loop - German", language: "German", fileUrl: "https://example.com/de.pdf", sortOrder: 1, published: true, createdAt: new Date() },
        { id: 3, title: "Draft Presentation", language: "French", fileUrl: null, sortOrder: 2, published: false, createdAt: new Date() },
      ];
      if (publishedOnly) return all.filter(p => p.published);
      return all;
    }),
    createPresentation: vi.fn((data: any) => ({
      id: 4,
      ...data,
      published: data.published ?? true,
      createdAt: new Date(),
    })),
    updatePresentation: vi.fn((id: number, data: any) => ({
      id,
      title: data.title || "Turbo Loop - English",
      language: data.language || "English",
      fileUrl: data.fileUrl ?? "https://example.com/en.pdf",
      sortOrder: data.sortOrder ?? 0,
      published: data.published ?? true,
      createdAt: new Date(),
    })),
    deletePresentation: vi.fn((id: number) => ({ id })),
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("content.presentations (public)", () => {
  it("returns only published presentations", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const presentations = await caller.content.presentations();

    expect(Array.isArray(presentations)).toBe(true);
    expect(presentations.length).toBe(2);
    expect(presentations.every((p: any) => p.published === true)).toBe(true);
  });

  it("each presentation has required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const presentations = await caller.content.presentations();

    for (const p of presentations as any[]) {
      expect(p).toHaveProperty("id");
      expect(p).toHaveProperty("title");
      expect(p).toHaveProperty("language");
      expect(typeof p.title).toBe("string");
      expect(typeof p.language).toBe("string");
    }
  });
});
