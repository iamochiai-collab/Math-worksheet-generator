// 算数プリント:オフラインでも ひらけるように する しかけ(サービスワーカー)
// ・ネットに つながる ときは いつも さいしんを よむ(そして 手もとに ほぞん)
// ・つながらない ときは、手もとに ほぞんした ものを 出す
const CACHE = "sansu-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === "navigate" ? "./index.html" : req;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(key, copy));
      }
      return res;
    }).catch(() => caches.match(key, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
