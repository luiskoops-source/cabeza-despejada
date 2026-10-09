/* Prueba en navegador: abre la app, toca lo esencial y falla si hay un error de JavaScript.
   Se corre con:  node tests/navegador.js   (necesita Playwright: npm i --no-save playwright)
   En GitHub Actions se corre sola en cada versión (.github/workflows/pruebas.yml). */
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const errores = [];
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 400, height: 860 }, locale: "es-CL" });
  pagina.on("pageerror", e => errores.push("Error de página: " + e.message));
  pagina.on("console", m => { if (m.type() === "error" && !/font|googleapis|net::/i.test(m.text())) errores.push("Consola: " + m.text()); });
  const url = "file://" + path.resolve(__dirname, "..", "index.html");
  await pagina.goto(url);
  /* 1. Primera vez: bienvenida visible */
  if (!(await pagina.isVisible("#welcome"))) errores.push("La bienvenida no aparece la primera vez");
  await pagina.selectOption("#welcomeSust", "cocaina");
  await pagina.fill("#welcomeDay0", "2026-10-01");
  await pagina.click("#welcomeGo");
  await pagina.waitForTimeout(200);
  if (await pagina.isVisible("#welcome")) errores.push("La bienvenida sigue visible tras marcar el Día 0");
  /* 2. Botones principales */
  await pagina.click("#pledgeBtn");
  await pagina.click("#openCrave"); await pagina.waitForTimeout(200);
  if (!(await pagina.isVisible("#crave"))) errores.push("El Modo ganas no abre");
  await pagina.click("#closeCrave");
  /* 3. Las cuatro pestañas */
  for (const t of ["saber", "registro", "ayuda", "hoy"]) { await pagina.click(`[data-tab="${t}"]`); await pagina.waitForTimeout(100); }
  /* 4. Registro: anotar ganas y check-in */
  await pagina.click('[data-tab="registro"]'); await pagina.click("#addCrave");
  await pagina.click('[data-tab="hoy"]'); await pagina.click("#saveCheckin");
  /* 5. Saber: buscador y guía */
  await pagina.click('[data-tab="saber"]'); await pagina.fill("#buscar", "infarto"); await pagina.waitForTimeout(150);
  const n = await pagina.evaluate(() => document.querySelectorAll("#buscarOut .res").length);
  if (n < 1) errores.push("El buscador no encuentra 'infarto'");
  const fichas = await pagina.evaluate(() => document.querySelectorAll("#sustList .sust").length);
  if (fichas < 11) errores.push("Faltan fichas de sustancias: " + fichas);
  /* 6. Sin scroll horizontal en celular */
  const ancho = await pagina.evaluate(() => document.documentElement.scrollWidth);
  if (ancho > 400) errores.push("La página se desborda a lo ancho: " + ancho + "px");
  await navegador.close();
  if (errores.length) { console.error("FALLÓ:\n  " + errores.join("\n  ")); process.exit(1); }
  console.log("OK: la app abre y lo esencial funciona.");
})();
