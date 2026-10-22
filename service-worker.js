/* EduReach PWA cache. Firebase API responses are deliberately not cached here. */
"use strict";
const CACHE_VERSION = "edureach-shell-v1";
const SHELL_FILES = [
  "./", "./index.html", "./login.html", "./register.html",
  "./student-dashboard.html", "./student-lessons.html",
  "./teacher-dashboard.html", "./teacher-courses.html",
  "./teacher-lessons.html", "./teacher-students.html",
  "./teacher-analytics.html", "./admin-dashboard.html",
  "./teacher-register.html", "./app.js", "./login.js", "./register.js",
  "./teacher-register.js", "./firebase.js", "./style.css",
  "./manifest.webmanifest", "./icon.svg", "./offline.js"
];
const FIREBASE_SDKS = [
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(SHELL_FILES.map(path => new URL(path, self.registration.scope).href));
    // Cache Firebase SDK scripts when online. Opaque CDN responses are allowed in CacheStorage.
    await Promise.all(FIREBASE_SDKS.map(async url => {
      try {
        const response = await fetch(url, { mode: "no-cors", cache: "reload" });
        if (response && (response.ok || response.type === "opaque")) await cache.put(url, response);
      } catch (error) {
        // Do not fail installation if a CDN is temporarily unreachable.
        console.warn("Could not pre-cache Firebase SDK:", url);
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("edureach-") && name !== CACHE_VERSION).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFirebaseApi = /firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com/.test(url.hostname);
  if (isFirebaseApi) return; // Auth and database requests must not be served from a stale HTTP cache.

  if (!sameOrigin) {
    // Only use cached copies of the Firebase SDK files; don't cache other third-party content.
    if (FIREBASE_SDKS.includes(request.url)) {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE_VERSION);
        try {
          const response = await fetch(request);
          if (response && (response.ok || response.type === "opaque")) await cache.put(request, response.clone());
          return response;
        } catch (error) {
          const cached = await cache.match(request);
          if (cached) return cached;
          return new Response("EduReach needs its Firebase scripts. Open this page once while online, then retry offline.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }
      })());
    }
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_VERSION);
      try {
        const response = await fetch(request);
        if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
        return response;
      } catch (error) {
        const exact = await cache.match(request);
        if (exact) return exact;
        const path = url.pathname.split("/").pop() || "index.html";
        const fallback = await cache.match(new URL(path, self.registration.scope).href) || await cache.match(new URL("index.html", self.registration.scope).href);
        if (fallback) return fallback;
        return new Response("EduReach page is not cached yet. Reconnect once and open this page before going offline.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  // Cache-first for same-origin static assets, refreshing the cache in the background.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(request);
    const network = fetch(request).then(response => {
      if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
      return response;
    }).catch(() => null);
    if (cached) { event.waitUntil(network.then(() => undefined)); return cached; }
    const response = await network;
    return response || new Response("This resource is unavailable offline.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  })());
});
