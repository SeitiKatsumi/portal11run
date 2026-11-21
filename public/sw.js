const CACHE = "11run-timing-v2";
const SHELL = ["/manifest.webmanifest", "/assets/logos/onzerun-menu.png"];

function isWordPressPilot(url) {
  const { origin, pathname } = new URL(url);
  return origin === self.location.origin && (pathname === "/global" || pathname.startsWith("/global/"));
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("11run-timing-") && key !== CACHE).map((key) => caches.delete(key)));
    const cache = await caches.open(CACHE);
    const requests = await cache.keys();
    await Promise.all(requests.filter((request) => isWordPressPilot(request.url)).map((request) => cache.delete(request)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.url.includes("/api/") || isWordPressPilot(request.url)) return;
  event.respondWith(fetch(request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
    return response;
  }).catch(() => caches.match(request).then((response) => response || caches.match("/manifest.webmanifest"))));
});
