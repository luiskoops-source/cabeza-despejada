/* Graba el video de presentación de Cabeza Despejada, cuadro por cuadro, desde la app real.
   Se corre con:  node scripts/video/grabar.js [vertical|horizontal] [cuadros por segundo] [segundos]
   Ejemplos:      node scripts/video/grabar.js vertical 60        (el de máxima calidad)
                  node scripts/video/grabar.js horizontal 30 12   (una prueba corta)
   Necesita Playwright (npm i --no-save playwright) y ffmpeg instalado en el computador.
   Cómo funciona: abre scripts/video/estudio.html (la app dentro de un teléfono, con textos), detiene el reloj,
   y para cada cuadro adelanta el tiempo exacto, saca una foto sin pérdida y se la pasa a ffmpeg.
   Los datos que se ven (días, ganas, razones) son de ejemplo, inventados aquí abajo: no son de nadie. */
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const formato = process.argv[2] || "vertical";
const fps = Number(process.argv[3]) || 60;
const raiz = path.resolve(__dirname, "..", "..");
const carpetaSalida = path.join(raiz, "tienda", "video");
const FORMATOS = {
  vertical: { ancho: 540, alto: 960, escala: 2 },        // 1080 x 1920
  horizontal: { ancho: 1200, alto: 675, escala: 1.6 }    // 1920 x 1080
};

/* Un servidor mínimo para que el estudio y la app estén en el mismo sitio (así el estudio puede manejar la app) */
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
function servidor() {
  return new Promise(listo => {
    const s = http.createServer((pedido, respuesta) => {
      const ruta = path.join(raiz, decodeURIComponent(pedido.url.split("?")[0]));
      if (!ruta.startsWith(raiz) || !fs.existsSync(ruta) || fs.statSync(ruta).isDirectory()) { respuesta.writeHead(404); return respuesta.end(); }
      respuesta.writeHead(200, { "Content-Type": TIPOS[path.extname(ruta)] || "application/octet-stream" });
      fs.createReadStream(ruta).pipe(respuesta);
    }).listen(0, "127.0.0.1", () => listo(s));
  });
}

/* Datos de ejemplo: 42 días desde el Día 0, ganas anotadas algunas noches, y razones genéricas */
function estadoDeEjemplo(ahora) {
  const dia = 864e5, eventos = [];
  const gatillantes = ["Tiempo libre / nada que hacer", "Falta de sueño", "Recibí dinero", "Discusión o algo que me dijeron", "Vi a alguien que consume"];
  const hice = ["Salí a caminar", "Llamé a un amigo", "Me duché y me acosté", "Cociné algo rico", "Respiré 4-7-8"];
  [1, 2, 4, 5, 7, 9, 12, 14, 15, 19, 22, 26, 28].forEach((d, k) => {
    const t = new Date(ahora - d * dia); t.setHours([21, 22, 19, 23, 20][k % 5], 10 + k * 3);
    eventos.push({ type: "crave", ts: t.toISOString(), i: [6, 4, 7, 3, 5, 8, 4][k % 7], trig: gatillantes[k % 5], did: hice[k % 5] });
    if (k % 3 === 0) eventos.push({ type: "win", ts: new Date(t.getTime() + 16 * 60000).toISOString(), i: null, trig: "", did: "Modo ganas: 15 min · me ayudó: respirar" });
  });
  for (let d = 1; d < 30; d++) { const t = new Date(ahora - d * dia); t.setHours(9, 0); eventos.push({ type: "checkin", ts: t.toISOString(), sueno: 6 + (d % 3), animo: 3 + (d % 3) }); }
  eventos.sort((a, b) => b.ts.localeCompare(a.ts));
  const fecha = x => x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  const dia0 = new Date(ahora - 42 * dia);
  return {
    day0: fecha(dia0), spendWeek: 50000, sustancia: "cocaina", modo: "dejar", tourVisto: true, novedadVista: "video",
    inicio: fecha(new Date(ahora - 45 * dia)), celebrado: 30, celebradoDia0: fecha(dia0), events: eventos, craveWins: 9,
    reasons: ["Despertar con la cabeza despejada.", "Dormir de verdad.", "Estar presente con la gente que quiero."]
  };
}

(async () => {
  const f = FORMATOS[formato];
  if (!f) { console.error("Formato desconocido: usa vertical u horizontal"); process.exit(1); }
  const s = await servidor();
  const base = "http://127.0.0.1:" + s.address().port;
  const navegador = await chromium.launch();
  const contexto = await navegador.newContext({
    viewport: { width: f.ancho, height: f.alto }, deviceScaleFactor: f.escala,
    locale: "es-CL", timezoneId: "America/Santiago", colorScheme: "light", serviceWorkers: "block"
  });
  // Martes 20 de octubre de 2026, 19:40: el reloj queda detenido ahí y avanza solo cuando se graba un cuadro
  const ahora = new Date("2026-10-20T19:40:00-03:00").getTime();
  await contexto.clock.install({ time: ahora });
  // Pausado: sin esto el reloj sigue corriendo solo mientras se graba (y grabar es más lento que ver)
  await contexto.clock.pauseAt(ahora + 1000);
  await contexto.addInitScript(([estado]) => {
    if (location.pathname.endsWith("/index.html") && !localStorage.getItem("cd.v1")) {
      localStorage.setItem("cd.v1", estado);
      localStorage.setItem("cd.salchicha", "no"); // sin paseos sorpresa: que nada tape lo que se muestra
    }
  }, [JSON.stringify(estadoDeEjemplo(ahora))]);
  const pagina = await contexto.newPage();
  pagina.on("pageerror", e => console.error("Error en la página:", e.message));
  await pagina.goto(base + "/scripts/video/estudio.html");
  await pagina.evaluate(fm => window.preparar(fm), formato);
  await pagina.clock.runFor(100);
  const duracion = Number(process.argv[4]) || await pagina.evaluate(() => window.DURACION);
  const total = Math.round(duracion * fps), ms = 1000 / fps;

  fs.mkdirSync(carpetaSalida, { recursive: true });
  const salida = path.join(carpetaSalida, `cabeza-despejada-${formato}${process.argv[4] ? "-prueba" : ""}.mp4`);
  const musica = path.join(carpetaSalida, "musica.wav");
  const conMusica = fs.existsSync(musica);
  // H.264 de alta calidad (CRF 12, casi sin pérdida a la vista), colores BT.709 y listo para reproducir apenas empieza a bajar
  const args = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-"];
  if (conMusica) args.push("-i", musica);
  args.push("-c:v", "libx264", "-preset", "slow", "-crf", "12", "-tune", "animation", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-vf", "scale=out_color_matrix=bt709:out_range=tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-r", String(fps));
  if (conMusica) args.push("-c:a", "aac", "-b:a", "320k", "-shortest");
  args.push("-movflags", "+faststart", salida);
  const ffmpeg = spawn("ffmpeg", args, { stdio: ["pipe", "inherit", "inherit"] });

  const cdp = await contexto.newCDPSession(pagina);
  // La foto de cada cuadro se saca con esta sesión, que necesita su propia escala (si no, sale a la mitad del tamaño)
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: f.ancho, height: f.alto, deviceScaleFactor: f.escala, mobile: false });
  const inicio = Date.now();
  for (let i = 0; i < total; i++) {
    const t = i / fps;
    if (i > 0) await pagina.clock.runFor(ms);
    await pagina.evaluate(([t, ms]) => window.cuadro(t, ms), [t, i > 0 ? ms : 0]);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true });
    if (!ffmpeg.stdin.write(Buffer.from(data, "base64"))) await new Promise(r => ffmpeg.stdin.once("drain", r));
    if (i % fps === 0) process.stdout.write(`\r${formato}: segundo ${Math.round(t)} de ${Math.round(duracion)} (${Math.round((Date.now() - inicio) / 1000)} s)   `);
  }
  ffmpeg.stdin.end();
  await new Promise(r => ffmpeg.on("close", r));
  await navegador.close(); s.close();
  console.log("\nListo: " + path.relative(raiz, salida));
})();
