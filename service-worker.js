/* EduReach offline support — GitHub Pages project deployment */
'use strict';
const CACHE_NAME = 'edureach-shell-v2';
const BASE = self.registration.scope;
const FILES = [
  '', 'index.html', 'login.html', 'register.html', 'student-dashboard.html',
  'student-lessons.html', 'teacher-dashboard.html', 'teacher-courses.html',
  'teacher-lessons.html', 'teacher-students.html', 'teacher-analytics.html',
  'admin-dashboard.html', 'teacher-register.html', 'app.js', 'login.js',
  'register.js', 'teacher-register.js', 'firebase.js', 'style.css',
  'manifest.webmanifest', 'icon.svg', 'offline.js'
];
const SDK_URLS = [
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache files individually: one missing optional page must not break installation.
    await Promise.all(FILES.map(async file => {
      const url = new URL(file || './', BASE).href;
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (response.ok) await cache.put(url, response.clone());
        else console.warn('[EduReach offline] Not cached (HTTP ' + response.status + '):', url);
      } catch (err) {
        console.warn('[EduReach offline] Could not cache:', url, err);
      }
    }));
    // SDK scripts are cached when available; this cannot make Firebase servers work offline.
    await Promise.all(SDK_URLS.map(async url => {
      try {
        const response = await fetch(url, { mode: 'no-cors', cache: 'reload' });
        if (response && (response.ok || response.type === 'opaque')) await cache.put(url, response);
      } catch (err) { console.warn('[EduReach offline] Firebase SDK not cached:', url); }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('edureach-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFirebaseApi = /(^|\.)firestore\.googleapis\.com$|(^|\.)identitytoolkit\.googleapis\.com$|(^|\.)securetoken\.googleapis\.com$/.test(url.hostname);
  if (isFirebaseApi) return;

  if (url.origin !== self.location.origin) {
    if (!SDK_URLS.includes(req.url)) return;
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) await cache.put(req, res.clone());
        return res;
      } catch (err) {
        return (await cache.match(req)) || new Response('Firebase library is not cached. Reconnect and open EduReach once.', { status: 503 });
      }
    })());
    return;
  }

  const cacheable = async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req) || await cache.match(new URL(url.pathname, BASE).href);
    if (req.mode === 'navigate') {
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(new URL(url.pathname, BASE).href, res.clone()).catch(() => {});
        return res;
      } catch (err) {
        if (cached) return cached;
        const fallback = await cache.match(new URL('index.html', BASE).href);
        return fallback || new Response('This EduReach page has not been cached. Reconnect and reload it once.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    }
    if (cached) {
      // Return cached asset immediately; refresh it for the next visit when online.
      fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); }).catch(() => {});
      return cached;
    }
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    } catch (err) {
      return new Response('This EduReach resource has not been cached yet.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  };
  event.respondWith(cacheable());
});
