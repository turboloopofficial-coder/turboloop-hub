// Posts a synthetic "deploy succeeded" event to Sentry on every Vercel
// build. Two purposes:
//   1. Visible heartbeat — every push lands an event in the Sentry
//      dashboard within 60 s. If you stop seeing them, something is
//      wrong with the DSN, network, or build pipeline.
//   2. Sanity-checks DSN end-to-end without depending on the browser
//      tunnel (this script POSTs server-side, so Brave Shields /
//      uBlock are irrelevant — purely tests the Sentry side).
//
// Runs as part of `npm run build` (chained in package.json). Wrapped
// in try/catch + always-exit-0 so a Sentry outage never breaks a deploy.

const DSN = process.env.VITE_SENTRY_DSN;
const COMMIT = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local";
const BRANCH = process.env.VERCEL_GIT_COMMIT_REF || "local";
const ENV = process.env.VERCEL_ENV || "development";

async function ping() {
  if (!DSN) {
    console.log("[sentry-deploy-ping] VITE_SENTRY_DSN unset, skipping");
    return;
  }

  let dsn;
  try {
    dsn = new URL(DSN);
  } catch {
    console.warn("[sentry-deploy-ping] invalid DSN, skipping");
    return;
  }

  const projectId = dsn.pathname.replace(/^\/+/, "").split("/")[0];
  if (!projectId) {
    console.warn("[sentry-deploy-ping] DSN missing project id, skipping");
    return;
  }

  const publicKey = dsn.username;
  const ingestHost = dsn.hostname;
  const upstream = `https://${ingestHost}/api/${projectId}/envelope/`;

  // Sentry envelope = newline-separated JSON blocks: header, item header, item body
  const eventId = crypto.randomUUID().replace(/-/g, "");
  const sentAt = new Date().toISOString();
  const event = {
    event_id: eventId,
    timestamp: sentAt,
    platform: "node",
    level: "info",
    environment: ENV,
    release: COMMIT,
    message: `Deploy succeeded · ${BRANCH}@${COMMIT}`,
    tags: {
      kind: "deploy_breadcrumb",
      branch: BRANCH,
      commit: COMMIT,
      vercel_env: ENV,
    },
  };

  const envelope = [
    JSON.stringify({ event_id: eventId, sent_at: sentAt, dsn: DSN }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(event),
  ].join("\n");

  // Use the auth header (the SDK's native form) so Sentry accepts the
  // server-side post without a tunnel.
  const auth = [
    "Sentry sentry_version=7",
    `sentry_key=${publicKey}`,
    `sentry_client=turboloop-deploy-ping/1.0`,
  ].join(", ");

  const ctrl = AbortSignal.timeout(8000);
  const res = await fetch(upstream, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
      "X-Sentry-Auth": auth,
    },
    body: envelope,
    signal: ctrl,
  });
  console.log(
    `[sentry-deploy-ping] ${res.status} ${res.ok ? "OK" : "FAIL"} · ${BRANCH}@${COMMIT}`
  );
}

ping().catch(err => {
  console.warn("[sentry-deploy-ping] swallowed error:", err?.message || err);
  // Always exit 0 — a Sentry outage must NOT break the deploy.
  process.exit(0);
});
