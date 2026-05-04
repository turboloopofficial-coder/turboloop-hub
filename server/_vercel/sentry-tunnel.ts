// Sentry tunnel — forwards browser-side error envelopes through our origin
// so ad-blockers (Brave Shields, uBlock Origin, etc.) can't drop them.
//
// Why: ~30% of users browse with content blockers that match the
// "*ingest*sentry*" rule, so direct POSTs from @sentry/react to
// ingest.us.sentry.io get blocked silently → errors never land in the
// dashboard. Sentry's recommended fix is to proxy via our own domain;
// blockers can't drop /api/monitor without breaking turboloop.tech itself.
//
// URL: POST /api/monitor
//   Body: raw envelope (text/plain). The SDK puts the original DSN in the
//   first JSON line of the envelope, which we parse, validate against an
//   allow-list, and forward to the matching ingest endpoint.
//
// Reference: https://docs.sentry.io/platforms/javascript/troubleshooting/#using-the-tunnel-option

import type { IncomingMessage, ServerResponse } from "node:http";

// Allow-list: only proxy to these Sentry hosts (prevents abuse as an
// open relay). If you change Sentry orgs, update both this list AND
// VITE_SENTRY_DSN in Vercel env.
const ALLOWED_SENTRY_HOSTS: readonly string[] = [
  "ingest.us.sentry.io",
  "o4.ingest.us.sentry.io",
  "ingest.sentry.io",
];

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", chunk => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("method not allowed");
    return;
  }

  try {
    const envelope = await readBody(req);
    if (!envelope) {
      res.statusCode = 400;
      res.end("empty envelope");
      return;
    }

    // Envelope format: first line is a JSON header with { dsn, sdk, ... }
    const firstNewline = envelope.indexOf("\n");
    if (firstNewline === -1) {
      res.statusCode = 400;
      res.end("malformed envelope (no header)");
      return;
    }

    let header: { dsn?: string };
    try {
      header = JSON.parse(envelope.slice(0, firstNewline));
    } catch {
      res.statusCode = 400;
      res.end("malformed envelope header");
      return;
    }

    if (!header.dsn) {
      res.statusCode = 400;
      res.end("envelope missing dsn");
      return;
    }

    let dsnUrl: URL;
    try {
      dsnUrl = new URL(header.dsn);
    } catch {
      res.statusCode = 400;
      res.end("invalid dsn");
      return;
    }

    // Validate host. Allow exact matches OR subdomains of allowed roots.
    const host = dsnUrl.hostname.toLowerCase();
    const isAllowed = ALLOWED_SENTRY_HOSTS.some(
      h => host === h || host.endsWith("." + h)
    );
    if (!isAllowed) {
      res.statusCode = 403;
      res.end("dsn host not in allow-list");
      return;
    }

    // Project ID is the path (e.g. /4509...) — last segment, sans leading /
    const projectId = dsnUrl.pathname.replace(/^\/+/, "").split("/")[0];
    if (!projectId) {
      res.statusCode = 400;
      res.end("dsn missing project id");
      return;
    }

    const upstream = `https://${dsnUrl.hostname}/api/${projectId}/envelope/`;

    const upstreamRes = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/x-sentry-envelope" },
      body: envelope,
    });

    res.statusCode = upstreamRes.status;
    // Don't leak Sentry's headers back. Just signal success/failure.
    res.setHeader("Content-Type", "text/plain");
    res.end(upstreamRes.ok ? "ok" : `upstream ${upstreamRes.status}`);
  } catch (err: any) {
    // Never let the tunnel crash — if it errors, Sentry just loses one
    // event, not the user's session.
    console.error("[sentry-tunnel]", err);
    res.statusCode = 500;
    res.end(`tunnel error: ${err?.message || err}`);
  }
}
