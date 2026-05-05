// Self-unregistering service worker.
//
// Why this file exists: the legacy Vite SPA registered a Workbox service
// worker at scope "/" that aggressively cached HTML. After the Next.js
// cutover, users who installed the PWA (especially on Brave + Android)
// still see the OLD cached SPA — the new Next.js HTML is intercepted and
// replaced with stale Vite output. The mobile menu they see is actually
// the OLD menu; they think the new build is broken.
//
// When the browser requests /sw.js to check for updates, it gets THIS
// file. We immediately unregister, clear every cache, and tell every
// open client to reload. After one such cycle the user is on the real
// new site.
//
// Safe to leave deployed long-term — even brand-new visitors who never
// had a SW just get this self-removing SW, which removes itself.

self.addEventListener("install", () => {
  // Take over immediately, don't wait for old SW to drain.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Wipe every cache from the old SPA's Workbox runtime caching.
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {}

      // Unregister this SW.
      try {
        await self.registration.unregister();
      } catch (e) {}

      // Tell every open tab/window to reload — they pick up the real
      // Next.js HTML on the way back.
      try {
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) {
          client.navigate(client.url);
        }
      } catch (e) {}
    })()
  );
});

// Pass-through fetch — never serve cached anything.
self.addEventListener("fetch", () => {});
