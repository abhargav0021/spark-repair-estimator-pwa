const CACHE_NAME = "spark-pwa-v2";
const FONT_CSS_URL = "https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Inter:wght@400;500;600&display=swap";

const PRECACHE_URLS = [
  "./",
  "index.html",
  "manifest.json",
  FONT_CSS_URL,
  "https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js",
  "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js",
  "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(PRECACHE_URLS.map(url =>
        cache.add(new Request(url, { mode: url.startsWith("http") ? "cors" : "same-origin" }))
          .catch(() => null)
      )).then(() => cacheFonts(cache)))
      .then(() => self.skipWaiting())
  );
});

function cacheFonts(cache) {
  return fetch(FONT_CSS_URL)
    .then(res => res.text())
    .then(css => {
      const urls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(m => m[1]);
      return Promise.all(urls.map(url =>
        cache.add(new Request(url, { mode: "cors" })).catch(() => null)
      ));
    })
    .catch(() => null);
}

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        const copy = res.clone();
        if (res.ok || res.type === "opaque") {
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => {
        if (req.mode === "navigate") return caches.match("index.html");
        return caches.match(req).then(cached => cached || Response.error());
      });
    })
  );
});
