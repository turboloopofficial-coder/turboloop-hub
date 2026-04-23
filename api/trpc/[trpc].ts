import type { IncomingMessage, ServerResponse } from "node:http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const express = (await import("express")).default;
    const { createExpressMiddleware } = await import("@trpc/server/adapters/express");
    const { appRouter } = await import("../../server/routers");
    const { createContext } = await import("../../server/_core/context");

    const app = express();
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ limit: "10mb", extended: true }));
    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext,
      }),
    );

    return (app as any)(req, res);
  } catch (err: any) {
    console.error("[trpc handler] fatal error:", err);
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(err?.message || err), stack: err?.stack }));
  }
}
