/* Graba comercial.html como video: comercial.mp4 (1080 x 1920, 30 cuadros por segundo, sin sonido).
   Se corre desde la carpeta del proyecto con:  node tienda/video-piloto/grabar.js
   Necesita Playwright (npm i --no-save playwright, el mismo de las pruebas) y ffmpeg instalado en el computador.
   Para revisar algunos momentos sin grabar todo:  node tienda/video-piloto/grabar.js 1.5 9 21
   (saca una foto de esos segundos, en la misma carpeta, llamadas cuadro-1.5.png, etc.) */
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");

const carpeta = __dirname;
const segundosSueltos = process.argv.slice(2).map(Number);

(async () => {
  const navegador = await chromium.launch();
  // La página mide 540 x 960 y se fotografía al doble: así el video sale en 1080 x 1920
  const pagina = await navegador.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  await pagina.goto("file://" + path.join(carpeta, "comercial.html"));
  await pagina.evaluate(() => window.listo);
  const { duracion, cuadros } = await pagina.evaluate(() => ({ duracion: DURACION, cuadros: CUADROS }));

  if (segundosSueltos.length) {
    for (const s of segundosSueltos) {
      await pagina.evaluate(s => dibujar(s), s);
      await pagina.screenshot({ path: path.join(carpeta, `cuadro-${s}.png`) });
    }
    await navegador.close();
    return;
  }

  // ffmpeg recibe las fotos una tras otra y arma el MP4 (H.264, el formato que aceptan TikTok, Instagram y WhatsApp)
  const ffmpeg = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(cuadros), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    path.join(carpeta, "comercial.mp4")], { stdio: ["pipe", "inherit", "inherit"] });
  const total = Math.round(duracion * cuadros);
  for (let i = 0; i < total; i++) {
    await pagina.evaluate(s => dibujar(s), i / cuadros);
    const foto = await pagina.screenshot({ type: "png" });
    if (!ffmpeg.stdin.write(foto)) await new Promise(r => ffmpeg.stdin.once("drain", r));
    if (i % cuadros === 0) process.stdout.write(`\rGrabando: segundo ${i / cuadros} de ${duracion}`);
  }
  ffmpeg.stdin.end();
  await new Promise(r => ffmpeg.on("close", r));
  console.log("\nListo: " + path.join(carpeta, "comercial.mp4"));
  await navegador.close();
})();
