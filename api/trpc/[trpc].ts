import type { IncomingMessage, ServerResponse } from "node:http";
import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

let cachedApp: Express | null = null;

function getApp(): Express {
  if (cachedApp) return cachedApp;
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
  cachedApp = app;
  return app;
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return getApp()(req as any, res as any);
}
