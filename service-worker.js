
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("expense-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/app-styles.css",
        "/app.js",
        "/db.js",
        "/Icons/Wallet-192.png",
        "/Icons/Wallet-512.png",
        "/Images/Dark Blue Logo.png",
        "/Images/Light Blue Logo.png"
        // add any other important assets
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
