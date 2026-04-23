import type { IncomingMessage, ServerResponse } from "node:http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");
  const results: Record<string, string> = {};
  const tryImport = async (name: string, importer: () => Promise<unknown>) => {
    try {
      await importer();
      results[name] = "OK";
    } catch (e: any) {
      results[name] = `FAIL: ${e?.message || String(e)}`;
    }
  };

  await tryImport("express", () => import("express"));
  await tryImport("@trpc/server/adapters/express", () => import("@trpc/server/adapters/express"));
  await tryImport("server/_core/env", () => import("../server/_core/env"));
  await tryImport("server/_core/trpc", () => import("../server/_core/trpc"));
  await tryImport("server/_core/context", () => import("../server/_core/context"));
  await tryImport("server/db", () => import("../server/db"));
  await tryImport("server/storage", () => import("../server/storage"));
  await tryImport("server/routers", () => import("../server/routers"));

  res.statusCode = 200;
  res.end(JSON.stringify(results, null, 2));
}
