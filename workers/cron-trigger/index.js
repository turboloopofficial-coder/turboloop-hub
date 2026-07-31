/**
 * TurboLoop Cron Trigger Worker
 *
 * Replaces Vercel's built-in cron scheduler for the turboloop-hub project.
 * Runs on Cloudflare Workers free tier — pings Vercel endpoints every 5 minutes.
 *
 * Cost saving: ~$100/month (eliminates Vercel Fluid CPU charges from 24/7 warm crons)
 */

const VERCEL_HUB_URL = "https://api.turboloop.tech";
const CRON_SECRET = "1e79d95b549ebd5e66d4a45b202b7c26840d37773c7b4f8fdfa1304bc3024f0a";

const HEADERS = {
  "Authorization": "Bearer " + CRON_SECRET,
  "Content-Type": "application/json",
  "User-Agent": "TurboLoop-CronTrigger/1.0",
};

async function pingEndpoint(url) {
  try {
    var res = await fetch(url, {
      method: "POST",
      headers: HEADERS,
    });
    var text = await res.text().catch(function() { return ""; });
    console.log("[cron-trigger] " + url + " -> " + res.status + " " + text.slice(0, 100));
    return { url: url, status: res.status, ok: res.ok };
  } catch (err) {
    console.error("[cron-trigger] " + url + " -> ERROR: " + err.message);
    return { url: url, status: 0, ok: false, error: err.message };
  }
}

// HTTP fetch handler — health check and manual trigger
addEventListener("fetch", function(event) {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  var url = new URL(request.url);

  if (url.pathname === "/health") {
    return new Response(JSON.stringify({ status: "ok", ts: new Date().toISOString() }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Manual trigger for testing: POST /trigger?target=master with X-Trigger-Secret header
  if (url.pathname === "/trigger" && request.method === "POST") {
    var secret = request.headers.get("X-Trigger-Secret");
    if (secret !== CRON_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
    var target = url.searchParams.get("target") || "master";
    var result = await pingEndpoint(VERCEL_HUB_URL + "/api/cron/" + target);
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("TurboLoop Cron Trigger Worker — OK", { status: 200 });
}

// Scheduled handler — fires every 5 minutes via Cloudflare cron trigger
addEventListener("scheduled", function(event) {
  event.waitUntil(handleScheduled(event));
});

async function handleScheduled(event) {
  var now = new Date();
  var utcHour = now.getUTCHours();
  var utcMin = now.getUTCMinutes();

  console.log("[cron-trigger] Scheduled at " + now.toISOString());

  var results = [];

  // Always ping master cron (runs every 5 minutes)
  results.push(await pingEndpoint(VERCEL_HUB_URL + "/api/cron/master"));

  // Always ping token-data (runs every 5 minutes)
  results.push(await pingEndpoint(VERCEL_HUB_URL + "/api/cron/token-data"));

  // Ping publish-blog only at 04:00 UTC (within the 5-min window 04:00-04:05)
  if (utcHour === 4 && utcMin < 5) {
    results.push(await pingEndpoint(VERCEL_HUB_URL + "/api/cron/publish-blog"));
  }

  var summary = results.map(function(r) {
    return r.url.split("/").pop() + ": " + r.status;
  }).join(", ");
  console.log("[cron-trigger] Done: " + summary);
}
