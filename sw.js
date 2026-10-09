/* Service worker: un pequeño programa que el navegador deja corriendo "detrás" de la app.
   Su trabajo aquí es guardar una copia de los archivos para que la app abra sin internet. */
const CACHE = "cabeza-despejada-v6";
const ARCHIVOS = ["./", "./index.html", "./css/estilos.css", "./js/calculos.js", "./js/app.js", "./datos/hechos.js", "./datos/sustancias.js", "./datos/preguntas.js", "./datos/actualidad.js", "./datos/ofrecieron.js", "./manifest.json", "./iconos/icono-192.png", "./iconos/icono-512.png"];

/* Al instalarse, descarga y guarda todos los archivos de la lista */
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

/* Al activarse, borra cachés de versiones anteriores */
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

/* Cada vez que la app pide un archivo: primero intenta la red, y si no hay internet, usa la copia guardada */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
