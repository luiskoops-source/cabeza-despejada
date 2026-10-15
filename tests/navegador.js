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
  /* 1-. Sin confirmar la edad no se puede empezar */
  await pagina.click("#welcomeGo"); await pagina.waitForTimeout(100);
  if (!(await pagina.isVisible("#welcome"))) errores.push("Se pudo empezar sin confirmar que es mayor de 18");
  await pagina.check("#welcomeEdad");
  await pagina.click("#welcomeGo");
  await pagina.waitForTimeout(200);
  if (await pagina.isVisible("#welcome")) errores.push("La bienvenida sigue visible tras marcar el Día 0");
  /* 1a. Quien recién empieza no ve "Qué hay de nuevo": para esa persona todo es nuevo */
  if (await pagina.isVisible("#novedades")) errores.push("Qué hay de nuevo aparece a alguien que recién empieza");
  /* 1b. Lo que viene: visible en los primeros días */
  if (!(await pagina.isVisible("#loQueViene"))) errores.push("La tarjeta Lo que viene no aparece");
  /* 1c. La historia: el primer día se abre el capítulo 1 */
  if (!(await pagina.isVisible("#historiaCard"))) errores.push("La tarjeta de la historia no aparece");
  else if (!/Capítulo 1 de/.test(await pagina.textContent("#historiaPill"))) errores.push("La historia no parte en el capítulo 1");
  /* 2. Botones principales */
  await pagina.click("#pledgeBtn");
  /* 2a. Reiniciar desde Hoy: dos toques dejan el Día 0 en hoy y el contador parte en 00 h */
  await pagina.click("#reiniciarHoy"); await pagina.click("#reiniciarHoy"); await pagina.waitForTimeout(1200);
  const vivo = await pagina.textContent("#liveTime");
  if (!/^00 h 00 min/.test(vivo)) errores.push("Tras reiniciar, el contador no parte desde cero: " + vivo);
  await pagina.click("#openCrave"); await pagina.waitForTimeout(200);
  if (!(await pagina.isVisible("#crave"))) errores.push("El Modo ganas no abre");
  await pagina.click("#closeCrave");
  /* 3. Las cuatro pestañas */
  for (const t of ["noche", "saber", "registro", "ayuda", "hoy"]) { await pagina.click(`[data-tab="${t}"]`); await pagina.waitForTimeout(100); }
  /* 4. Registro: anotar ganas y check-in */
  await pagina.click('[data-tab="registro"]'); await pagina.click("#addCrave");
  await pagina.click('[data-tab="hoy"]'); await pagina.click("#saveCheckin");
  /* 5. Saber: buscador y guía */
  await pagina.click('[data-tab="saber"]'); await pagina.fill("#buscar", "infarto"); await pagina.waitForTimeout(150);
  const n = await pagina.evaluate(() => document.querySelectorAll("#buscarOut .res").length);
  if (n < 1) errores.push("El buscador no encuentra 'infarto'");
  const fichas = await pagina.evaluate(() => document.querySelectorAll("#sustList .sust").length);
  if (fichas < 11) errores.push("Faltan fichas de sustancias: " + fichas);
  /* 5b. Noche: atajos */
  await pagina.click('[data-tab="noche"]'); await pagina.click("#nocheCalma"); await pagina.waitForTimeout(200);
  if (!(await pagina.isVisible("#calma"))) errores.push("El Modo calma no abre desde Noche");
  await pagina.click("#closeCalma");
  /* 5c. Escuchar: hay botones de parlante si el navegador tiene voz */
  const conVoz = await pagina.evaluate(() => "speechSynthesis" in window);
  if (conVoz) { const nb = await pagina.evaluate(() => document.querySelectorAll(".leer").length); if (nb < 5) errores.push("Faltan botones de Escuchar: " + nb); }
  /* 6. Sin scroll horizontal en celular */
  const ancho = await pagina.evaluate(() => document.documentElement.scrollWidth);
  if (ancho > 400) errores.push("La página se desborda a lo ancho: " + ancho + "px");
  /* 6b. Teléfonos de ayuda: cada uno tiene su botón Llamar (131 emergencias, 1412 SENDA, Salud Responde) */
  const tels = await pagina.evaluate(() => [...document.querySelectorAll("a.llamar")].map(a => a.getAttribute("href")));
  for (const t of ["tel:131", "tel:1412", "tel:6003607777"]) if (!tels.includes(t)) errores.push("Falta el botón Llamar para " + t);
  /* 6c. Una recaída no borra lo avanzado: el Día 0 vuelve a hoy, pero los días limpios anteriores siguen contando */
  await pagina.evaluate(() => { const d = new Date(); d.setDate(d.getDate() - 10); const s = JSON.parse(localStorage.getItem("cd.v1")); s.day0 = d.toISOString().slice(0, 10); s.events = []; localStorage.setItem("cd.v1", JSON.stringify(s)); });
  await pagina.reload(); await pagina.waitForTimeout(300);
  await pagina.click("#reiniciarHoy"); await pagina.click("#reiniciarHoy"); await pagina.waitForTimeout(300);
  if (!(await pagina.isVisible("#volver"))) errores.push("Tras una recaída no aparece Volver a empezar");
  const total = Number(await pagina.textContent("#volverTotal"));
  if (!(total >= 9)) errores.push("La recaída borró los días limpios anteriores: " + total);
  /* 6d. Superar una ola suma una al contador y el perrito celebra */
  await pagina.click("#openCrave"); await pagina.click("#craveWon"); await pagina.click('[data-ayudo="esperar"]'); await pagina.waitForTimeout(200);
  if (!(await pagina.isVisible("#craveCelebra"))) errores.push("Al superar una ola no aparece la celebración");
  await pagina.click("#craveCelebraOk");
  /* 7. Atajo "Tengo ganas" del ícono: abre el Modo ganas, pero con PIN nunca se salta el bloqueo */
  await pagina.goto(url + "?ir=ganas"); await pagina.waitForTimeout(300);
  if (!(await pagina.isVisible("#crave"))) errores.push("El atajo Tengo ganas no abre el Modo ganas");
  await pagina.evaluate(() => { const s = JSON.parse(localStorage.getItem("cd.v1")); s.pin = "1234"; localStorage.setItem("cd.v1", JSON.stringify(s)); });
  await pagina.goto(url + "?ir=ganas"); await pagina.waitForTimeout(300);
  if (await pagina.isVisible("#crave")) errores.push("El atajo abrió el Modo ganas sin pedir el PIN");
  await pagina.fill("#lockPin", "1234"); await pagina.click("#lockGo"); await pagina.waitForTimeout(200);
  if (!(await pagina.isVisible("#crave"))) errores.push("Tras el PIN, el atajo no abre el Modo ganas");
  await navegador.close();
  if (errores.length) { console.error("FALLÓ:\n  " + errores.join("\n  ")); process.exit(1); }
  console.log("OK: la app abre y lo esencial funciona.");
})();
