/* Service worker for the staff tools, so /tools and /tools/hearing-report keep
 * working without internet once they've been opened online on a device.
 *
 * Source file. scripts/build-offline.mjs copies it to out/tools-sw.js after each
 * build and puts VERSION and PRECACHE (the exact files the tools need) at the top.
 * Registered with scope "/tools", so the public website is never cached. */
/* global VERSION, PRECACHE */

const CACHE_PREFIX = "aawaz-tools-";
const CACHE = CACHE_PREFIX + VERSION;
const PAGES = ["/tools", "/tools/hearing-report"];
// On slow clinic internet, fall back to the saved copy instead of waiting forever.
const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // All or nothing: if any file fails, this version isn't installed and the
      // previous offline copy (if any) stays in use until the next try.
      await Promise.all(
        PRECACHE.map(async (path) => {
          const response = await fetch(path, { cache: "reload" });
          if (!response.ok) throw new Error(`Couldn't save ${path} for offline use (${response.status})`);
          await cache.put(path, await withoutRedirect(response));
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE).map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    // Pages: always the latest version when online, the saved copy when not.
    const path = url.pathname.replace(/\/+$/, "").replace(/\.html$/, "");
    event.respondWith(networkFirst(request, PAGES.includes(path) ? path : null));
  } else if (url.pathname.startsWith("/_next/static/")) {
    // Build files have a content hash in their name, so a saved copy is never stale.
    event.respondWith(cacheFirst(request, url.pathname));
  } else {
    // Page data for in-app navigation, the manifest and icons.
    event.respondWith(networkFirst(request, url.pathname));
  }
});

async function networkFirst(request, key) {
  const cached = key ? caches.match(key, { cacheName: CACHE, ignoreSearch: true }) : Promise.resolve(undefined);
  const network = fetch(request);
  network.catch(() => undefined); // handled below; avoids an "uncaught" warning when the cache wins
  try {
    const response = await Promise.race([
      network,
      new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS)).then(async () => (await cached) || network),
    ]);
    if (!response.ok && response.type !== "opaqueredirect") return (await cached) || response;
    return response;
  } catch {
    return (await cached) || Response.error();
  }
}

async function cacheFirst(request, key) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(key);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(key, response.clone());
  return response;
}

// A redirected response can't be used to answer a page load, so store a plain copy.
async function withoutRedirect(response) {
  if (!response.redirected) return response;
  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
