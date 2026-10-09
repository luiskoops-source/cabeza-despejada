/* Service worker: un pequeño programa que el navegador deja corriendo "detrás" de la app.
   Guarda una copia de todos los archivos para que la app abra sin internet, y la mantiene al día.
   Estrategia: la app abre SIEMPRE desde la copia guardada (rápido y consistente, nunca mezcla versiones)
   y, si hay internet, baja la versión nueva en segundo plano para la próxima vez que se abra. */
const CACHE = "cabeza-despejada-v14";
const ARCHIVOS = ["./", "./index.html", "./css/estilos.css", "./js/calculos.js", "./js/app.js", "./datos/hechos.js", "./datos/sustancias.js", "./datos/preguntas.js", "./datos/actualidad.js", "./datos/ofrecieron.js", "./datos/primeros-auxilios.js", "./datos/senales.js", "./datos/antes-de-salir.js", "./manifest.json", "./iconos/icono-192.png", "./iconos/icono-512.png", "./privacidad.html"];

/* Al instalarse una versión nueva, descarga el juego completo de archivos a un caché nuevo */
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

/* Al activarse, borra los cachés de versiones anteriores. Las pestañas ya abiertas siguen con lo que cargaron. */
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

/* Cada vez que la app pide un archivo propio: responde desde la copia guardada y actualiza en segundo plano */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const guardado = await c.match(e.request);
      const red = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
      return guardado || (await red) || c.match("./index.html");
    })
  );
});
