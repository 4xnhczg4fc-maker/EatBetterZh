self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("food-finder-v1").then(cache =>
      cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./script.js",
        "./restaurants.json"
      ])
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});
