/* BrightPath service worker: network-first (always fresh while you edit), cache fallback for offline. */
var VERSION = 'bp-v1';
var CORE = ['./', 'index.html', 'manifest.json', 'css/base.css', 'css/polish.css',
  'js/core.js', 'js/voice.js', 'js/agent.js', 'js/tests.js', 'js/data-syllabus.js', 'js/courses.js', 'js/extras.js', 'js/extras-doubt.js', 'js/extras-owner.js', 'js/polish.js',
  'js/qb-jee-neet.js', 'js/qb-ca-upsc.js', 'js/qb-class11-12.js', 'js/qb-class1-5.js', 'js/qb-class6-10.js', 'js/qb-lang-6-12.js',
  'assets/classroom.jpg', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(CORE.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  var url = new URL(req.url);
  if (url.origin !== location.origin || /\.(mp4|webm)$/i.test(url.pathname)) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok) {
      var copy = res.clone(), key = new URL(req.url); key.search = '';
      caches.open(VERSION).then(function (c) { c.put(key.href, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (r) {
      return r || (req.mode === 'navigate' ? caches.match('index.html', { ignoreSearch: true }) : Response.error());
    });
  }));
});
