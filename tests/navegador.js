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
  /* 1a. Las novedades no interrumpen en Hoy: viven plegadas en Ayuda > Acerca de, como historial de cambios */
  if (await pagina.evaluate(() => !!document.getElementById("novedades"))) errores.push("La tarjeta Qué hay de nuevo volvió a Hoy");
  if ((await pagina.evaluate(() => document.querySelectorAll("#historialCambios h3").length)) < 1) errores.push("El historial de cambios está vacío");
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
  /* El reloj del Modo ganas le pasa su avance al círculo (--calma), para que vaya del naranjo al azul */
  await pagina.waitForTimeout(1100);
  const calmaOla = Number(await pagina.evaluate(() => document.getElementById("crave").style.getPropertyValue("--calma")));
  if (!(calmaOla > 0 && calmaOla < 0.05)) errores.push("El círculo del Modo ganas no sigue al reloj: " + calmaOla);
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
  /* 6-. Respiración 4-7-8: se abre desde Hoy, corre y se detiene al salir */
  await pagina.click('[data-tab="hoy"]'); await pagina.click("#openRespira"); await pagina.waitForTimeout(150);
  if (!(await pagina.isVisible("#respira"))) errores.push("La respiración 4-7-8 no abre");
  await pagina.click("#respiraEmpezar"); await pagina.waitForTimeout(500);
  if ((await pagina.textContent("#respiraFase")) !== "Inhala") errores.push("La respiración no empieza inhalando");
  await pagina.click("#respiraCerrar");
  if (await pagina.isVisible("#respira")) errores.push("La respiración no se cierra");
  /* 6-a00. Después de una discusión: se abre desde Hoy, al elegir lo que se siente responde, y queda en el historial con su nombre */
  await pagina.click("#openDiscusion"); await pagina.waitForTimeout(150);
  if (!(await pagina.isVisible("#discusion"))) errores.push("Después de una discusión no abre");
  if ((await pagina.evaluate(() => document.querySelectorAll("#discusionSentir [data-sentir]").length)) < 5) errores.push("Después de una discusión no muestra las emociones");
  await pagina.click('[data-sentir="rabia"]');
  if (!(await pagina.textContent("#discusionRespuesta")).trim()) errores.push("Después de una discusión no responde al elegir una emoción");
  const evDisc = await pagina.evaluate(() => JSON.parse(localStorage.getItem("cd.v1")).events[0]);
  if (!evDisc || evDisc.type !== "discusion" || !/rabia/.test(evDisc.did || "")) errores.push("Después de una discusión no queda anotada con la emoción");
  const telsDisc = await pagina.evaluate(() => [...document.querySelectorAll("#discusion a.llamar")].map(a => a.getAttribute("href")));
  for (const t of ["tel:133", "tel:149", "tel:1455", "tel:1412"]) if (!telsDisc.includes(t)) errores.push("Después de una discusión no tiene el botón Llamar para " + t);
  await pagina.click("#discusionCerrar");
  if (await pagina.isVisible("#discusion")) errores.push("Después de una discusión no se cierra");
  if (!(await pagina.evaluate(() => document.getElementById("log").textContent.includes("después de una discusión")))) errores.push("El historial no nombra Después de una discusión");
  if (!(await pagina.evaluate(() => [...document.querySelectorAll("#cTrig option")].some(o => o.textContent === "Tema familiar")))) errores.push("Falta el gatillante Tema familiar");
  /* 6-a0. Hora de salida: sin hora no hay tarjeta; al poner la hora de ahora (todos los días) aparece, y lo escrito se guarda */
  if (await pagina.isVisible("#salidaCard")) errores.push("La tarjeta de la hora de salida aparece sin hora configurada");
  await pagina.evaluate(() => document.querySelectorAll("#salidaDias input").forEach(i => { if (!i.checked) i.click(); }));
  const ahoraHHMM = await pagina.evaluate(() => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); });
  await pagina.evaluate(h => { const i = document.getElementById("salidaHora"); i.value = h; i.dispatchEvent(new Event("change")); }, ahoraHHMM);
  if (!(await pagina.isVisible("#salidaCard"))) errores.push("La tarjeta de la hora de salida no aparece a la hora configurada");
  await pagina.fill("#salidaVuelta", "En metro, directo");
  if ((await pagina.evaluate(() => JSON.parse(localStorage.getItem("cd.v1")).salidaPlan.vuelta)) !== "En metro, directo") errores.push("La respuesta de la hora de salida no se guarda");
  await pagina.evaluate(() => document.getElementById("salidaQuitar").click());
  if (await pagina.isVisible("#salidaCard")) errores.push("La tarjeta de la hora de salida no se va al quitar la hora");
  /* 6-a1. ¿Cómo te fue el viernes?: aparece un sábado en la mañana y responde sin reiniciar el Día 0 */
  const dia0Antes = await pagina.evaluate(() => JSON.parse(localStorage.getItem("cd.v1")).day0);
  await pagina.evaluate(() => { const R = Date; window.__DateReal = R; const fijo = new R(2026, 9, 17, 9, 0).getTime(); class F extends R { constructor(...a) { super(...(a.length ? a : [fijo])); } static now() { return fijo; } } window.Date = F; document.dispatchEvent(new Event("visibilitychange")); });
  await pagina.waitForTimeout(150);
  if (!(await pagina.isVisible("#viernesCard"))) errores.push("La pregunta del sábado no aparece un sábado en la mañana");
  else {
    await pagina.click('[data-viernes="consumi"]');
    if (!/no borra/.test(await pagina.textContent("#viernesRespuesta"))) errores.push("La pregunta del sábado no responde sin culpa");
    if ((await pagina.evaluate(() => JSON.parse(localStorage.getItem("cd.v1")).day0)) !== dia0Antes) errores.push("Responder Consumí reinició el Día 0 solo");
  }
  await pagina.evaluate(() => { window.Date = window.__DateReal; document.dispatchEvent(new Event("visibilitychange")); });
  /* 6-a. Un rato contigo: se abre desde Hoy con 3 minutos, corre, al terminar pregunta cómo estuvo, y se cierra */
  await pagina.click("#openRato"); await pagina.waitForTimeout(150);
  if (!(await pagina.isVisible("#rato"))) errores.push("Un rato contigo no abre");
  if ((await pagina.textContent("#ratoReloj")) !== "3:00") errores.push("Un rato contigo no empieza con 3 minutos");
  await pagina.click("#ratoEmpezar"); await pagina.waitForTimeout(1300);
  if (!/^2:5\d$/.test(await pagina.textContent("#ratoReloj"))) errores.push("El reloj de Un rato contigo no corre: " + (await pagina.textContent("#ratoReloj")));
  if (!(await pagina.textContent("#ratoFrase")).trim()) errores.push("Un rato contigo no muestra su frase");
  /* Se adelanta el reloj para no esperar 3 minutos: al llegar a cero aparece la pregunta */
  await pagina.evaluate(() => { const r = Date.now; window.__ahoraReal = r; Date.now = () => r() + 4 * 60 * 1000; });
  await pagina.waitForTimeout(700);
  if (!(await pagina.isVisible("#ratoComo"))) errores.push("Al terminar Un rato contigo no pregunta cómo estuvo");
  await pagina.click('[data-rato-como="normal"]');
  if (!(await pagina.textContent("#ratoRespuesta")).trim()) errores.push("Un rato contigo no responde a cómo estuvo");
  await pagina.evaluate(() => { Date.now = window.__ahoraReal; });
  await pagina.click("#ratoCerrar");
  if (await pagina.isVisible("#rato")) errores.push("Un rato contigo no se cierra");
  /* 6-b. El salchicha que pasea y el que visita tienen sus estilos (flotan sobre la pantalla) */
  const estilosSalchicha = await pagina.evaluate(() => {
    const r = []; for (const c of ["paseo", "compa"]) { const d = document.createElement("div"); d.className = c; document.body.appendChild(d); r.push(getComputedStyle(d).position); d.remove(); } return r;
  });
  if (estilosSalchicha.some(p => p !== "fixed")) errores.push("Faltan los estilos del paseo o del compañero: " + estilosSalchicha);
  /* 6-c. Al tocar al salchicha no aparece el recuadro del teléfono */
  const resaltado = await pagina.evaluate(() => { const d = document.createElement("div"); d.className = "paseo"; document.body.appendChild(d); const c = getComputedStyle(d).webkitTapHighlightColor; d.remove(); return c; });
  if (resaltado !== "rgba(0, 0, 0, 0)") errores.push("El salchicha vuelve a mostrar el recuadro al tocarlo: " + resaltado);
  /* 6-c1. Al tocar el logo se abre "¿Por qué abraza al cactus?", y al tocarlo otra vez se cierra */
  await pagina.click('[data-tab="hoy"]'); await pagina.click("#porQue");
  if (!(await pagina.isVisible("#porQueCard"))) errores.push("Tocar el logo no abre ¿Por qué abraza al cactus?");
  await pagina.click("#porQue");
  if (await pagina.isVisible("#porQueCard")) errores.push("Tocar el logo otra vez no cierra la explicación");
  /* 6-c2. Las sorpresas del salchicha: corre y se va solo; en yoga aparece el globo "Perro boca abajo"; cada toque suelta un corazón */
  await pagina.click('[data-tab="hoy"]');
  if (!(await pagina.evaluate(() => window.paseoSalchicha("corre")))) errores.push("El salchicha no sale corriendo");
  await pagina.waitForTimeout(3200);
  if (await pagina.evaluate(() => !!document.querySelector(".paseo"))) errores.push("El salchicha que corre no se va solo");
  await pagina.evaluate(() => window.paseoSalchicha("yoga")); await pagina.waitForTimeout(300);
  if (!/Perro boca abajo/.test(await pagina.evaluate(() => (document.querySelector(".paseo.yoga .yoga-globo") || {}).textContent || ""))) errores.push("Falta el salchicha haciendo yoga");
  for (let i = 0; i < 3; i++) await pagina.click(".paseo.yoga", { force: true });
  if ((await pagina.evaluate(() => document.querySelectorAll(".paseo-corazon").length)) < 3) errores.push("Tocar varias veces al salchicha no suelta varios corazones");
  await pagina.waitForFunction(() => !document.querySelector(".paseo"), null, { timeout: 12000 });
  /* 6-d. El Modo calma y la respiración son azules, y la barra del sistema toma ese color mientras están abiertos */
  await pagina.click('[data-tab="noche"]'); await pagina.click("#nocheCalma"); await pagina.waitForTimeout(200);
  const calma = await pagina.evaluate(() => ({ bg: getComputedStyle(document.getElementById("calma")).getPropertyValue("--bg").trim(), barra: document.querySelector('meta[name="theme-color"]').content }));
  if (!/^#[0-9a-f]{6}$/i.test(calma.bg) || parseInt(calma.bg.slice(5, 7), 16) <= parseInt(calma.bg.slice(1, 3), 16)) errores.push("El Modo calma ya no es azul: " + calma.bg);
  if (calma.barra !== calma.bg) errores.push("La barra del sistema no toma el color del Modo calma: " + calma.barra);
  await pagina.click("#closeCalma"); await pagina.waitForTimeout(100);
  if ((await pagina.evaluate(() => document.querySelector('meta[name="theme-color"]').content)) === calma.bg) errores.push("La barra del sistema sigue azul después de cerrar el Modo calma");
  /* 6a. Para quien acompaña: la tarjeta está en Ayuda con sus cuatro partes */
  const partes = await pagina.evaluate(() => document.querySelectorAll("#acompanarCard details").length);
  if (partes !== 4) errores.push("La tarjeta Si acompañas a alguien no tiene sus 4 partes: " + partes);
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
  /* 6c-. El cactus de la portada tampoco se achica con la recaída: crece desde el primer Día 0, no desde el último */
  await pagina.reload(); await pagina.waitForTimeout(300);
  const tamano = await pagina.evaluate(() => { const m = (document.getElementById("cactusCrece").getAttribute("transform") || "").match(/scale\(([\d.]+)\)/); return m ? Number(m[1]) : 0; });
  if (!(tamano > 0.62)) errores.push("Tras una recaída el cactus volvió a ser chiquito: " + tamano);
  /* 6d. Superar una ola suma una al contador y el perrito celebra */
  await pagina.click("#openCrave"); await pagina.click("#craveWon"); await pagina.click('[data-ayudo="esperar"]'); await pagina.waitForTimeout(200);
  if (!(await pagina.isVisible("#craveCelebra"))) errores.push("Al superar una ola no aparece la celebración");
  await pagina.click("#craveCelebraOk");
  /* 6e. De madrugada, Noche invita a dormir (el reloj del navegador se pone a las 2:30) */
  const madrugada = await navegador.newPage({ viewport: { width: 400, height: 860 }, locale: "es-CL" });
  madrugada.on("pageerror", e => errores.push("Error de página (madrugada): " + e.message));
  await madrugada.clock.setFixedTime(new Date(2026, 9, 17, 2, 30));
  await madrugada.goto(url); await madrugada.waitForTimeout(300);
  await madrugada.click('[data-tab="noche"]');
  if (!(await madrugada.isVisible("#nocheDormir"))) errores.push("De madrugada, Noche no invita a dormir");
  await madrugada.close();
  await pagina.click('[data-tab="noche"]');
  if (await pagina.isVisible("#nocheDormir") && !(new Date().getHours() < 6)) errores.push("La invitación a dormir aparece de día");
  /* 7. Atajo "Tengo ganas" del ícono: abre el Modo ganas, pero con PIN nunca se salta el bloqueo */
  await pagina.goto(url + "?ir=ganas"); await pagina.waitForTimeout(300);
  if (!(await pagina.isVisible("#crave"))) errores.push("El atajo Tengo ganas no abre el Modo ganas");
  await pagina.evaluate(() => { const s = JSON.parse(localStorage.getItem("cd.v1")); s.pin = "1234"; localStorage.setItem("cd.v1", JSON.stringify(s)); });
  await pagina.goto(url + "?ir=ganas"); await pagina.waitForTimeout(300);
  if (await pagina.isVisible("#crave")) errores.push("El atajo abrió el Modo ganas sin pedir el PIN");
  await pagina.fill("#lockPin", "1234"); await pagina.click("#lockGo"); await pagina.waitForTimeout(200);
  if (!(await pagina.isVisible("#crave"))) errores.push("Tras el PIN, el atajo no abre el Modo ganas");
  /* 8. La copia lleva el historial de Un rato contigo, y restaurarla lo devuelve a su lugar */
  await pagina.evaluate(() => localStorage.setItem("cd.rato", JSON.stringify({ historial: [{ fecha: "2026-10-17T12:00:00.000Z", minutos: 3, como: "normal" }] })));
  const [descarga] = await Promise.all([pagina.waitForEvent("download", { timeout: 5000 }).catch(() => null), pagina.evaluate(() => document.getElementById("guardarCopia").click())]);
  if (!descarga) errores.push("Guardar copia no descargó el archivo");
  else {
    const copia = JSON.parse(require("fs").readFileSync(await descarga.path(), "utf8"));
    if (!copia.datos.rato || copia.datos.rato.historial.length !== 1) errores.push("La copia no lleva el historial de Un rato contigo");
    await pagina.evaluate(() => localStorage.removeItem("cd.rato"));
    await pagina.evaluate(t => { document.getElementById("textoCopia").value = t; }, JSON.stringify(copia));
    await pagina.evaluate(() => document.getElementById("restaurarTexto").click());
    await Promise.all([pagina.waitForNavigation(), pagina.evaluate(() => document.querySelector("#copiaMsg button.primary").click())]);
    if (!(await pagina.evaluate(() => localStorage.getItem("cd.rato")))) errores.push("Restaurar la copia no devuelve el historial de Un rato contigo");
    if (await pagina.evaluate(() => "rato" in JSON.parse(localStorage.getItem("cd.v1")))) errores.push("El historial de Un rato contigo quedó mezclado con los datos de la app");
  }
  /* 9. Borrar todos mis datos borra todo lo de la app en este aparato (también Un rato contigo y el código de la nube) */
  await pagina.evaluate(() => { localStorage.setItem("cd.nube", JSON.stringify({ codigo: "X", ultimo: null })); localStorage.setItem("cd.rato", "{}"); localStorage.setItem("otra.app", "1"); });
  await pagina.evaluate(() => document.getElementById("wipeAll").click());
  await Promise.all([pagina.waitForNavigation(), pagina.evaluate(() => document.getElementById("wipeAll").click())]);
  const quedan = await pagina.evaluate(() => Object.keys(localStorage));
  for (const k of ["cd.nube", "cd.rato"]) if (quedan.includes(k)) errores.push("Borrar todos mis datos dejó " + k);
  if (!quedan.includes("otra.app")) errores.push("Borrar todos mis datos borró cosas que no son de la app");
  await navegador.close();
  if (errores.length) { console.error("FALLÓ:\n  " + errores.join("\n  ")); process.exit(1); }
  console.log("OK: la app abre y lo esencial funciona.");
})();
