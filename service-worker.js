self.addEventListener("install", e=>{
 e.waitUntil(
  caches.open("foodfinder").then(c=>c.addAll(["./"]))
 );
});
