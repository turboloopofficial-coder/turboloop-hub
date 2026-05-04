"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/_vercel/sentry-tunnel.ts
var sentry_tunnel_exports = {};
__export(sentry_tunnel_exports, {
  default: () => handler
});
module.exports = __toCommonJS(sentry_tunnel_exports);
var ALLOWED_SENTRY_HOSTS = [
  "ingest.us.sentry.io",
  "o4.ingest.us.sentry.io",
  "ingest.sentry.io"
];
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => data += chunk);
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}
async function handler(req, res) {
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
    const firstNewline = envelope.indexOf("\n");
    if (firstNewline === -1) {
      res.statusCode = 400;
      res.end("malformed envelope (no header)");
      return;
    }
    let header;
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
    let dsnUrl;
    try {
      dsnUrl = new URL(header.dsn);
    } catch {
      res.statusCode = 400;
      res.end("invalid dsn");
      return;
    }
    const host = dsnUrl.hostname.toLowerCase();
    const isAllowed = ALLOWED_SENTRY_HOSTS.some(
      (h) => host === h || host.endsWith("." + h)
    );
    if (!isAllowed) {
      res.statusCode = 403;
      res.end("dsn host not in allow-list");
      return;
    }
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
      body: envelope
    });
    res.statusCode = upstreamRes.status;
    res.setHeader("Content-Type", "text/plain");
    res.end(upstreamRes.ok ? "ok" : `upstream ${upstreamRes.status}`);
  } catch (err) {
    console.error("[sentry-tunnel]", err);
    res.statusCode = 500;
    res.end(`tunnel error: ${err?.message || err}`);
  }
}
