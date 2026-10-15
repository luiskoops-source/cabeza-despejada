/* Service worker: un pequeño programa que el navegador deja corriendo "detrás" de la app.
   Guarda una copia de todos los archivos para que la app abra sin internet, y la mantiene al día.
   Estrategia: la app abre SIEMPRE desde la copia guardada (rápido y consistente, nunca mezcla versiones)
   y, si hay internet, baja la versión nueva en segundo plano para la próxima vez que se abra. */
const CACHE = "cabeza-despejada-v63";
const ARCHIVOS = ["./", "./index.html", "./css/estilos.css", "./js/calculos.js", "./js/respaldo.js", "./js/chat.js", "./panel.html", "./js/app.js", "./js/escuchar.js", "./datos/hechos.js", "./datos/sustancias.js", "./datos/preguntas.js", "./datos/actualidad.js", "./datos/primeros-dias.js", "./datos/historia.js", "./datos/ofrecieron.js", "./datos/primeros-auxilios.js", "./datos/senales.js", "./datos/antes-de-salir.js", "./datos/voz.js", "./datos/novedades.js", "./manifest.json", "./iconos/icono-192.png", "./iconos/icono-512.png", "./iconos/icono-maskable-192.png", "./iconos/icono-maskable-512.png", "./privacidad.html", "./fuentes/bricolage-grotesque-latin-500.woff2", "./fuentes/bricolage-grotesque-latin-700.woff2", "./fuentes/bricolage-grotesque-latin-800.woff2", "./fuentes/instrument-sans-latin-400.woff2", "./fuentes/instrument-sans-latin-500.woff2", "./fuentes/instrument-sans-latin-600.woff2", "./fuentes/jetbrains-mono-latin-500.woff2", "./fuentes/jetbrains-mono-latin-700.woff2"];

/* Al instalarse una versión nueva, descarga el juego completo de archivos a un caché nuevo.
   cache: "reload" obliga a pedirlos a internet, no a la memoria del navegador, que podría tener copias de hace unos minutos. */
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(a => new Request(a, { cache: "reload" })))).then(() => self.skipWaiting()));
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
