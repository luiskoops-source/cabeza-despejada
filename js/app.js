/* Lógica de Cabeza Despejada. Secciones marcadas con /* ---------- */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const KEY="cd.v1";
const defaults={
  day0:null, day0Hora:null, spendWeek:60000, salary:null,
  /* Razones de ejemplo. Cada persona las reemplaza por las suyas en la pantalla Hoy. */
  reasons:[
    "Quiero volver a sentir gusto por las cosas normales.",
    "Sobrio trabajo mejor y duermo de verdad.",
    "Prefiero que mi plata termine en mi casa, no en el proveedor."
  ],
  plan:"", planHour:null,
  /* Configuración: sustancia principal, modo ("dejar" o "reducir"), meta semanal en modo reducir, PIN opcional */
  sustancia:"cocaina", modo:"dejar", metaSemana:2, pin:"", tema:"auto", tourVisto:false, novedadVista:null, ganasMin:15,
  celebrado:0, pledgeDate:null, salirDate:null, salirOk:[], rapidoDate:null, rapidoCount:0, rapidoSeen:[], quizDate:null, quizIdx:null, quizDone:false, quizStreak:0, quizBest:0, volverDia:null, volverOk:[],
  historia:{disponibles:0,fecha:null}, events:[], seenFacts:[], customFacts:[], dailyIdx:null, dailyDate:null, dailyAI:null, craveWins:0
};
const SUST=window.SUSTANCIAS||[];
function sustActual(){ return SUST.find(s=>s.id===S.sustancia)||SUST[0]; }
let S=load();
function load(){ try{ const r=localStorage.getItem(KEY); if(r){ return Object.assign({},defaults,JSON.parse(r)); } }catch(e){} return Object.assign({},defaults); }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} try{ nubeProgramar(); }catch(e){} } /* Respaldo en la nube (ver más abajo). Los guardados del arranque, antes de que exista, se saltan. */
function toast(t){ const el=$("toast"); el.textContent=t; el.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),2200); }
/* Los cálculos viven en js/calculos.js; aquí solo les ponemos nombres cortos. */
const C=window.Calculos;
const clp=C.pesos;
const dstr=C.fechaTexto;
const todayStr=()=>C.fechaTexto(new Date());
const daysSince=iso=>C.diasDesde(iso);
/* Fecha (AAAA-MM-DD, hora local) de un momento guardado como texto ISO */
const todayStrDe=iso=>C.fechaTexto(new Date(iso));
/* Guarda el momento exacto solo si el Día 0 elegido es hoy; para fechas pasadas se cuenta desde la medianoche */
const horaDia0=fecha=>fecha===todayStr()?new Date().toISOString():null;

/* ---------- Día 0 desde el link ---------- */
/* Si la app se abre con ?dia0=AAAA-MM-DD, fija ese Día 0 en este teléfono.
   El dato queda solo en el teléfono (localStorage); el código no guarda fechas de nadie. */
(function dia0DesdeLink(){
  let url; try{ url=new URL(location.href); }catch(e){ return; }
  /* Razón desde el link: ?razon=texto agrega esa razón a "Mis razones" (si no estaba ya) */
  const razon=(url.searchParams.get("razon")||"").trim().slice(0,200);
  if(razon){
    if(!S.reasons.includes(razon)){ S.reasons.push(razon); save(); setTimeout(()=>toast("Razón agregada"),300); }
    url.searchParams.delete("razon");
    try{ history.replaceState(null,"",url.pathname+url.search+url.hash); }catch(e){}
  }
  const v=url.searchParams.get("dia0");
  if(!v) return;
  /* Solo se acepta una fecha real con formato AAAA-MM-DD que no sea futura */
  const valida=/^\d{4}-\d{2}-\d{2}$/.test(v)&&C.fechaTexto(new Date(v+"T12:00:00"))===v&&v<=todayStr();
  if(valida){ S.day0=v; S.day0Hora=horaDia0(v); save(); setTimeout(()=>toast("Día 0 ajustado"),300); }
  /* Se borra el parámetro del link para que al recargar no se vuelva a aplicar */
  url.searchParams.delete("dia0");
  try{ history.replaceState(null,"",url.pathname+url.search+url.hash); }catch(e){}
})();

/* ---------- Facts base ---------- */
/* FACTS viene de datos/hechos.js */

/* ---------- Tabs ---------- */
function irA(tab){ const b=document.querySelector(`.tabs [data-tab="${tab}"]`); if(b) b.click(); }
document.querySelectorAll('.tabs [role="tab"]').forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll('.tabs [role="tab"]').forEach(x=>x.setAttribute("aria-selected",x===b?"true":"false"));
  document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id==="s-"+b.dataset.tab));
  window.scrollTo({top:0});
}));

/* ---------- Hoy ---------- */
function renderHoy(){
  const now=new Date();
  const h=now.getHours();
  $("greet").textContent=h<12?"Buenos días":h<20?"Buenas tardes":"Buenas noches";
  $("today").textContent=now.toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const d=daysSince(S.day0);
  $("days").textContent=d;
  $("daysLabel").textContent=d===1?"día":"días";
  $("sinceText").textContent=S.day0?("Día 0: "+new Date(S.day0+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"long"})+(S.craveWins?" · "+S.craveWins+" olas de ganas superadas":"")):"Marca la fecha de tu último consumo para empezar a contar.";
  $("day0").value=S.day0||"";
  $("spendWeek").value=S.spendWeek||"";
  $("salary").value=S.salary||"";
  const dinero=C.dineroAhorrado(S.spendWeek,d);
  $("saved").textContent=clp(dinero.total); $("heroSaved").textContent=clp(dinero.total);
  $("savedMonth").textContent=clp(dinero.mes);
  $("savedYear").textContent=clp(dinero.anio);
  const horas=C.horasTrabajo(dinero.total,S.salary);
  $("savedHours").textContent=horas==null?"—":horas+" h";
  /* Racha más larga y cantidad de reinicios */
  const mejor=C.rachaMasLarga(S.events,S.day0);
  $("bestStreak").textContent=mejor;
  $("resets").textContent=S.events.filter(e=>e.type==="relapse").length;
  renderReasons();
  renderCheckin();
  renderSemana();
  renderPlan();
  renderHitos(d);
  renderLoQueViene(d);
  renderHistoria();
  renderLive(); renderPledge(); renderSolo(); renderVolver(d);
  checkCelebra(d);
  renderQuiz();
  renderReduccion();
  /* Bienvenida: se muestra solo hasta que la persona marca su Día 0 */
  $("welcome").hidden=!!S.day0;
  renderTour();
  $("sustName").textContent=sustActual().nombre;
}

/* ---------- Contador en vivo (horas:minutos:segundos desde el Día 0) ---------- */
function renderLive(){
  if(!S.day0){ $("liveTime").textContent=""; return; }
  /* Si sabemos el momento exacto del Día 0 (day0Hora), contamos desde ahí; si no, desde la medianoche de ese día */
  const exacto=S.day0Hora&&todayStrDe(S.day0Hora)===S.day0;
  const inicio=exacto?new Date(S.day0Hora).getTime():new Date(S.day0+"T00:00:00").getTime();
  const ms=Date.now()-inicio; if(ms<0){ $("liveTime").textContent=""; return; }
  const h=Math.floor(ms/3600000)%24, m=Math.floor(ms/60000)%60, s=Math.floor(ms/1000)%60;
  $("liveTime").textContent=`${String(h).padStart(2,"0")} h ${String(m).padStart(2,"0")} min ${String(s).padStart(2,"0")} s`;
}
setInterval(renderLive,1000);

/* ---------- Compromiso del día ---------- */
function renderPledge(){
  const done=S.pledgeDate===todayStr();
  $("pledgeBtn").classList.toggle("done",done);
  $("pledgeTxt").textContent=done?"Hoy me comprometí. Un día a la vez.":(S.modo==="reducir"?"Hoy me comprometo a respetar mi meta":"Hoy me comprometo a no consumir");
}
$("pledgeBtn").onclick=()=>{ if(S.pledgeDate===todayStr()) return; S.pledgeDate=todayStr(); save(); renderPledge(); toast("Compromiso guardado. Nos vemos mañana."); };

/* ---------- Reiniciar el Día 0 desde Hoy ---------- */
/* Pide un segundo toque para confirmar, igual que "Registrar consumo" en Registro, y luego usa la misma función */
$("reiniciarHoy").onclick=()=>{
  const el=$("reiniciarHoy");
  if(el.dataset.confirm!=="1"){ el.dataset.confirm="1"; el.textContent="Toca de nuevo para reiniciar"; setTimeout(()=>{ el.dataset.confirm=""; el.textContent="Consumí. Reiniciar mi Día 0"; },4000); return; }
  el.dataset.confirm=""; el.textContent="Consumí. Reiniciar mi Día 0";
  S.pledgeDate=null; registerRelapse("");
};

/* ---------- No estás solo: una frase por día ---------- */
const SOLO=[
  "Millones de personas están dejando algo hoy mismo. Tú eres una de ellas.",
  "Las ganas pasan. Lo que haces mientras pasan es lo que cuenta.",
  "Volver a empezar no es fracasar. Es la parte más valiente.",
  "Hoy no tienes que resolver tu vida. Solo este día.",
  "El cerebro se repara. Más lento de lo que quisieras, más rápido de lo que crees.",
  "Si hoy fue difícil, igual llegaste hasta aquí.",
  "Nadie en esta app sabe tu nombre. Pero mucha gente sabe exactamente cómo te sientes.",
  "Dormir también es recuperarse.",
  "Pedir ayuda no es debilidad. Es usar todas las herramientas."
];
function renderSolo(){ const d=Math.floor(Date.now()/86400000); $("soloLine").textContent=SOLO[d%SOLO.length]; }

/* ---------- Volver a empezar ---------- */
/* Cuidados para las 48 horas después de un consumo. Sin dosis ni formas de uso: solo cuidarse. */
const VOLVER=[
  {id:"dormir",t:"Dormir esta noche, aunque sea temprano",por:"El sueño es lo que más rápido devuelve la calma y baja la paranoia."},
  {id:"comer",t:"Comer algo y tomar agua",por:"Después de consumir el cuerpo queda deshidratado y con el azúcar baja."},
  {id:"noseguir",t:"No seguir ni mezclar con alcohol",por:"Las primeras horas son cuando la cabeza más empuja a terminar lo que queda."},
  {id:"contacto",t:"Borrar o bloquear el contacto",por:"Alejar la señal es lo que más ayuda los días siguientes."},
  {id:"hablar",t:"Hablar con alguien o llamar al 1412",por:"Es gratis y anónimo. Contarlo le quita fuerza a la culpa."},
  {id:"anotar",t:"Anotar en Registro qué pasó antes",por:"No para culparte: para reconocer la señal la próxima vez."}
];
function renderVolver(d){
  /* Se muestra si hay un consumo registrado en el Día 0 actual y pasaron 2 días o menos */
  const hubo=S.day0&&S.events.some(e=>e.type==="relapse"&&e.ts.slice(0,10)===S.day0);
  $("volver").hidden=!(hubo&&d<=2);
  if($("volver").hidden) return;
  /* La lista se reinicia con cada Día 0 nuevo */
  if(S.volverDia!==S.day0){ S.volverDia=S.day0; S.volverOk=[]; save(); }
  const acum=C.limpiosAcumulados(S.events,S.day0,30);
  $("volverMes").textContent=acum.enVentana;
  $("volverTotal").textContent=acum.total;
  $("volverCount").textContent=S.volverOk.length+" de "+VOLVER.length;
  $("volverList").innerHTML=VOLVER.map(x=>{ const on=S.volverOk.includes(x.id); return `<div class="salir ${on?"on":""}"><input type="checkbox" id="volver-${x.id}" ${on?"checked":""}><label for="volver-${x.id}"><span class="small"><b>${esc(x.t)}</b></span><span class="small muted">${esc(x.por)}</span></label></div>`; }).join("");
  $("volverList").querySelectorAll("input").forEach(i=>i.onchange=()=>{ const id=i.id.replace("volver-",""); S.volverOk=i.checked?S.volverOk.concat(id):S.volverOk.filter(x=>x!==id); save(); renderVolver(d); });
}
$("volverCalma").onclick=()=>$("openCalma").click();

/* ---------- Lo que viene ---------- */
/* Muestra la etapa en que va la persona, la siguiente, una frase de ánimo y el acceso a los foros */
function renderLoQueViene(d){
  const E=window.ETAPAS||[], A=window.ANIMO_DIA||[];
  const ver=!!S.day0&&d<=90&&E.length>0;
  $("loQueViene").hidden=!ver;
  if(!ver) return;
  /* Etapa actual: la que contiene el día de hoy */
  const i=Math.max(0,E.findIndex(e=>d>=e.desde&&d<=e.hasta));
  /* Ánimo: frase del día si existe; si no, lo que ayuda en la etapa */
  $("animoHoy").textContent=A[d]||("Hoy: "+E[i].ayuda);
  /* Se ven la etapa actual (abierta) y la siguiente (para saber qué viene) */
  $("etapasList").innerHTML=E.slice(i,i+2).map((e,k)=>`<details class="etapa ${k===0?"on":""}" ${k===0?"open":""}><summary><span class="pill ${k===0?"warm":""}">${k===0?"Ahora":"Después"}</span> ${esc(e.titulo)}</summary><p class="small">${esc(e.que)}</p><p class="small"><b>Qué ayuda:</b> ${esc(e.ayuda)}</p></details>`).join("");
  /* Plazos propios de la sustancia elegida (vienen de datos/sustancias.js) */
  const su=sustActual();
  $("etapaSust").textContent=su&&su.abstinencia?su.nombre+". "+su.abstinencia+" Varía según la persona.":"";
}
/* El botón lleva a Saber y baja hasta las comunidades */
$("verComunidades").onclick=()=>{ irA("saber"); setTimeout(()=>{ const el=$("comunidadesList"); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); },150); };

/* ---------- La historia de Mati ---------- */
/* Muestra el capítulo de hoy y deja releer los anteriores. Los textos viven en datos/historia.js */
function renderHistoria(){
  const H=window.HISTORIA||[];
  const ver=!!S.day0&&H.length>0;
  $("historiaCard").hidden=!ver;
  if(!ver) return;
  /* Si hoy es un día nuevo, se abre un capítulo más (la regla está en js/calculos.js) */
  const antes=JSON.stringify(S.historia);
  S.historia=C.avanzarHistoria(S.historia,todayStr(),H.length);
  if(JSON.stringify(S.historia)!==antes) save();
  const n=S.historia.disponibles, cap=H[n-1];
  /* Párrafos: el texto viene separado por líneas en blanco */
  const parrafos=t=>t.split("\n\n").map(p=>`<p>${esc(p)}</p>`).join("");
  $("historiaPill").textContent="Capítulo "+n+" de "+H.length;
  $("historiaTitulo").textContent=cap.titulo;
  $("historiaTexto").innerHTML=parrafos(cap.texto);
  $("historiaPregunta").textContent=cap.pregunta||"";
  $("historiaPregunta").hidden=!cap.pregunta;
  $("historiaNota").textContent=n<H.length?"Mañana se abre el capítulo "+(n+1)+".":"Por ahora la historia llega hasta aquí. Pronto vienen más capítulos.";
  /* Los capítulos ya leídos, del más reciente al primero, plegados */
  $("historiaAnteriores").hidden=n<2;
  $("historiaLista").innerHTML=H.slice(0,n-1).map((c,i)=>`<details class="etapa"><summary>${i+1}. ${esc(c.titulo)}</summary>${parrafos(c.texto)}</details>`).reverse().join("");
}

/* ---------- Hitos ---------- */
function renderHitos(d){
  const h=C.hitos(d);
  $("hitoRow").innerHTML=C.HITOS.map(x=>`<span class="hito ${d>=x?"on":""}" title="${x} ${x===1?"día":"días"}">${x}</span>`).join("");
  /* Singular o plural según el número: "1 día", "4 días"; y el hito de 1 día se nombra "el primer hito" */
  const ultimo=h.ultimo?`Último hito: ${h.ultimo} ${h.ultimo===1?"día":"días"}. `:"";
  const faltan=h.faltan===1?"Falta 1 día":`Faltan ${h.faltan} días`;
  const meta=h.proximo===1?"el primer hito":`los ${h.proximo}`;
  $("hitoText").textContent=h.proximo?`${ultimo}${faltan} para ${meta}.`:"Pasaste todos los hitos. Ahora cada día es tuyo.";
}

/* ---------- Celebración de hito ---------- */
const FRASES={1:"Un día entero. El primero siempre es el más difícil.",3:"Tres días. Lo peor del cuerpo ya va pasando.",7:"Una semana. Ya tienes un patrón nuevo.",14:"Dos semanas. El sueño empieza a volver a la normalidad.",30:"Un mes. Mucha gente dice que aquí empieza a volver el color.",60:"Dos meses. Tu cerebro sigue reparándose, aunque no siempre se note.",90:"Tres meses. El plazo que la medicina marca como el más difícil ya pasó.",180:"Medio año. Esto ya no es un intento: es tu vida.",365:"Un año. Léelo de nuevo: un año.",730:"Dos años. Gracias por seguir aquí."};
function checkCelebra(d){
  const h=C.hitos(d);
  /* Solo el día en que se cumple el hito (d===h.ultimo): así el número de la tarjeta es el mismo que el del contador. Al día siguiente se esconde sola. */
  if(h.ultimo&&d===h.ultimo&&h.ultimo>(S.celebrado||0)&&S.modo==="dejar"){
    /* Singular para el primer hito: "1 día", no "1 días" */
    $("celebraTitle").textContent="Llegaste a "+h.ultimo+(h.ultimo===1?" día":" días");
    $("celebraText").textContent=FRASES[h.ultimo]||"Un hito más.";
    $("celebra").hidden=false;
  } else $("celebra").hidden=true;
}
$("celebraOk").onclick=()=>{ S.celebrado=C.hitos(daysSince(S.day0)).ultimo||0; save(); $("celebra").hidden=true; };

/* ---------- Pregunta del día ---------- */
const PREG=window.PREGUNTAS||[];
function renderQuiz(){
  const t=todayStr();
  if(S.quizDate!==t){ const pool=PREG.filter(q=>!q.s||q.s===S.sustancia||q.s==="general"); const pick=pool.length?pool[Math.floor(Math.random()*pool.length)]:PREG[0]; S.quizDate=t; S.quizDone=false; S.quizIdx=Math.max(0,PREG.indexOf(pick)); save(); }
  const q=PREG[S.quizIdx%PREG.length]; if(!q) return;
  $("quizQ").textContent=q.q;
  $("quizStreak").textContent=S.quizStreak?S.quizStreak+" seguidas":"";
  $("quizBtns").hidden=S.quizDone; $("quizA").hidden=!S.quizDone;
  if(S.quizDone){ $("quizA").textContent=q.e; }
}
function responder(v){
  const q=PREG[S.quizIdx%PREG.length]; const ok=v===q.v;
  S.quizDone=true; S.quizStreak=ok?(S.quizStreak||0)+1:0; S.quizBest=Math.max(S.quizBest||0,S.quizStreak); save();
  renderQuiz();
  $("quizA").className="small "+(ok?"ok":"no"); $("quizA").textContent=(ok?"Correcto. ":"No era así. ")+q.e;
}
$("quizV").onclick=()=>responder(true); $("quizF").onclick=()=>responder(false);

/* ---------- Modo reducción ---------- */
function renderReduccion(){
  const r=S.modo==="reducir";
  $("reduccion").hidden=!r;
  document.querySelectorAll(".soloDejar").forEach(el=>el.hidden=r);
  if(!r) return;
  const w=C.semanaReduccion(S.events,S.metaSemana);
  $("redActual").textContent=w.actual; $("redMeta").textContent=w.meta; $("redAnterior").textContent=w.anterior;
  $("redMsg").textContent=w.dentroDeMeta?(w.mejora>0?`Vas dentro de tu meta y ${w.mejora} menos que la semana pasada.`:"Vas dentro de tu meta."):"Pasaste la meta esta semana. No es un fracaso: es información. Mira en Registro qué pasó esos días.";
}

/* ---------- Tema claro / oscuro ---------- */
function aplicarTema(){
  const r=document.documentElement;
  if(S.tema==="claro") r.setAttribute("data-theme","light"); else if(S.tema==="oscuro") r.setAttribute("data-theme","dark"); else r.removeAttribute("data-theme");
  /* La barra del sistema (arriba, en el celular) toma el color del fondo del tema que quedó activo */
  const oscuro=S.tema==="oscuro"||(S.tema!=="claro"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{ m.content=oscuro?"#15120e":"#f3ecdc"; });
}
$("cfgTema").onchange=()=>{ S.tema=$("cfgTema").value; save(); aplicarTema(); };

/* ---------- Primeros pasos (una sola vez) ---------- */
function renderTour(){ $("tour").hidden=!S.day0||!!S.tourVisto; }
$("tourOk").onclick=()=>{ S.tourVisto=true; save(); renderTour(); };
/* Qué hay de nuevo: muestra la novedad más reciente una sola vez, hasta tocar Entendido.
   A quien recién empieza (todavía sin Día 0) no se le muestra: para esa persona todo es nuevo. */
const NOVEDADES=window.NOVEDADES||[];
function renderNovedades(){
  const n=NOVEDADES[0];
  if(n&&!S.day0&&S.novedadVista!==n.id){ S.novedadVista=n.id; save(); }
  const ver=!!n&&!!S.day0&&S.novedadVista!==n.id;
  $("novedades").hidden=!ver;
  if(!ver) return;
  $("novedadesTitulo").textContent=n.titulo;
  $("novedadesLista").innerHTML=n.cambios.map(c=>"<li>"+esc(c)+"</li>").join("");
}
$("novedadesOk").onclick=()=>{ S.novedadVista=NOVEDADES[0].id; save(); renderNovedades(); };

/* ---------- Configuración ---------- */
function fillConfig(){
  const sel=$("cfgSust"); sel.innerHTML=SUST.map(s=>`<option value="${s.id}">${esc(s.nombre)}</option>`).join(""); sel.value=S.sustancia;
  $("cfgModo").value=S.modo; $("cfgMeta").value=S.metaSemana; $("cfgTema").value=S.tema||"auto"; $("cfgGanas").value=S.ganasMin||15; $("cfgMetaWrap").hidden=S.modo!=="reducir";
  const ws=$("welcomeSust"); ws.innerHTML=sel.innerHTML; ws.value=S.sustancia;
}
$("cfgModo").onchange=()=>{ $("cfgMetaWrap").hidden=$("cfgModo").value!=="reducir"; };
$("saveConfig").onclick=()=>{
  S.sustancia=$("cfgSust").value; S.modo=$("cfgModo").value; S.metaSemana=Math.max(0,Number($("cfgMeta").value)||0); S.ganasMin=Math.min(60,Math.max(5,Number($("cfgGanas").value)||15));
  save(); renderHoy(); renderSust(); toast("Configuración guardada");
};

/* ---------- PIN y privacidad ---------- */
function lockIfNeeded(){ if(S.pin){ $("lock").hidden=false; document.body.style.overflow="hidden"; $("lockPin").focus(); } }
$("lockGo").onclick=()=>{ if($("lockPin").value===S.pin){ $("lock").hidden=true; document.body.style.overflow=""; $("lockPin").value=""; $("lockMsg").textContent=""; abrirAtajo(); } else { $("lockMsg").textContent="PIN incorrecto"; $("lockPin").value=""; } };
$("lockPin").onkeydown=e=>{ if(e.key==="Enter") $("lockGo").click(); };
$("savePin").onclick=()=>{ const v=$("pinNew").value.trim(); if(v&&!/^\d{4,6}$/.test(v)){ toast("El PIN debe tener 4 a 6 números"); return; } S.pin=v; save(); $("pinNew").value=""; toast(v?"PIN activado":"PIN desactivado"); };
$("wipeAll").onclick=()=>{ const el=$("wipeAll"); if(el.dataset.c!=="1"){ el.dataset.c="1"; el.textContent="Toca de nuevo para borrar todo"; setTimeout(()=>{ el.dataset.c=""; el.textContent="Borrar todos mis datos"; },4000); return; } try{ localStorage.removeItem(KEY); }catch(e){} location.reload(); };

/* ---------- Respaldo: copia en archivo y nube cifrada ---------- */
/* La lógica (armar, revisar, cifrar, enviar) vive en js/respaldo.js; aquí solo se conecta con los botones. */
const R=window.Respaldo;
const KEY_COPIA="cd.ultimaCopia"; /* fecha de la última copia guardada, solo para mostrarla */
const KEY_NUBE="cd.nube";         /* código secreto y fecha del último respaldo en la nube: nunca viajan dentro del respaldo */
function leerLocal(k){ try{ return JSON.parse(localStorage.getItem(k)||"null"); }catch(e){ return null; } }
function guardarLocal(k,v){ try{ if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function mensaje(id,texto,tipo){ const el=$(id); el.textContent=texto; el.className="small"+(tipo?" "+tipo:""); }
const fechaHora=iso=>new Date(iso).toLocaleString("es-CL",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});
function pintarUltimaCopia(){ const f=leerLocal(KEY_COPIA); $("ultimaCopia").textContent=f?"Última copia guardada: "+fechaHora(f):"Todavía no guardas ninguna copia."; }

/* Guardar copia: en el celular abre "Compartir" para mandarla directo a Drive, Proton u otra; si no se puede, la descarga; y si tampoco, la copia como texto */
$("guardarCopia").onclick=async()=>{
  const texto=JSON.stringify(R.crearRespaldo(S),null,1);
  const nombre=R.nombreArchivo();
  const listo=()=>{ guardarLocal(KEY_COPIA,new Date().toISOString()); pintarUltimaCopia(); };
  /* Dentro de otra página (la versión fijada en Claude) no se puede descargar ni compartir: se copia como texto */
  if(window.self!==window.top){ copyText(texto); listo(); mensaje("copiaMsg","Copiamos tu copia como texto. Pégala en una nota o en tu correo. Para guardarla como archivo, usa la app instalada.","ok"); return; }
  try{
    const archivo=new File([texto],nombre,{type:"application/json"});
    if(navigator.canShare&&navigator.canShare({files:[archivo]})){
      await navigator.share({files:[archivo],title:"Copia de Cabeza Despejada"});
      listo(); mensaje("copiaMsg","Copia lista. Guárdala en tu nube.","ok"); return;
    }
  }catch(e){ if(e&&e.name==="AbortError") return; } /* La persona cerró el menú de compartir: no pasa nada */
  try{
    const url=URL.createObjectURL(new Blob([texto],{type:"application/json"}));
    const a=document.createElement("a"); a.href=url; a.download=nombre; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);
    listo(); mensaje("copiaMsg","Copia descargada ("+nombre+"). Súbela a tu nube.","ok");
  }catch(e){
    copyText(texto); listo(); mensaje("copiaMsg","No se pudo crear el archivo, así que la copiamos como texto. Pégala en una nota o en tu correo.","ok");
  }
};

/* Restaurar: reemplaza todo lo de este teléfono por lo de la copia. Se pide tocar dos veces, como en Borrar. */
let pendiente=null;
function restaurarCopia(texto){
  let r; try{ r=R.leerRespaldo(texto); }catch(e){ mensaje("copiaMsg",e.message,"no"); return; }
  pendiente=r;
  const cuando=r.creado?" del "+fechaHora(r.creado):"";
  const n=(r.datos.events||[]).length;
  mensaje("copiaMsg",`Copia${cuando} con ${n} registro${n===1?"":"s"}. Esto reemplaza lo que hay en este teléfono.`,"");
  const b=document.createElement("button"); b.className="primary"; b.textContent="Sí, restaurar"; b.style.marginLeft="8px";
  b.onclick=aplicarRestauracion;
  $("copiaMsg").appendChild(b);
}
function aplicarRestauracion(){
  if(!pendiente) return;
  S=Object.assign({},defaults,pendiente.datos,{pin:S.pin}); /* El PIN de este teléfono se mantiene */
  save(); location.reload();
}
$("archivoCopia").onchange=e=>{
  const f=e.target.files&&e.target.files[0]; if(!f) return;
  if(f.size>5e6){ mensaje("copiaMsg","Ese archivo es demasiado grande para ser una copia.","no"); return; }
  const lector=new FileReader();
  lector.onload=()=>restaurarCopia(String(lector.result));
  lector.onerror=()=>mensaje("copiaMsg","No se pudo abrir el archivo.","no");
  lector.readAsText(f); e.target.value="";
};
$("restaurarTexto").onclick=()=>restaurarCopia($("textoCopia").value);
pintarUltimaCopia();

/* Nube cifrada. Mientras la app no tenga servidor (Respaldo.nubeLista() falso), se muestra "próximamente". */
let nubeReloj=null, nubeSubiendo=false;
function pintarNube(){
  const lista=R.nubeLista(), n=leerLocal(KEY_NUBE);
  $("nubeProxima").hidden=lista;
  $("nubeApagada").hidden=!lista||Boolean(n);
  $("nubePrendida").hidden=!lista||!n;
  if(n) $("nubeEstado").textContent=n.ultimo?"Último respaldo: "+fechaHora(n.ultimo):"Todavía sin respaldar.";
}
async function nubeSubir(aviso){
  const n=leerLocal(KEY_NUBE); if(!n||nubeSubiendo||!R.nubeLista()) return;
  nubeSubiendo=true;
  try{ n.ultimo=await R.subirNube(n.codigo,S); guardarLocal(KEY_NUBE,n); pintarNube(); if(aviso) mensaje("nubeMsg","Respaldado.","ok"); }
  catch(e){ if(aviso) mensaje("nubeMsg",e.message,"no"); }
  finally{ nubeSubiendo=false; }
}
/* Cada vez que la app guarda algo, se espera 8 segundos sin cambios y se sube una sola vez */
function nubeProgramar(){ if(!R.nubeLista()||!leerLocal(KEY_NUBE)) return; clearTimeout(nubeReloj); nubeReloj=setTimeout(()=>nubeSubir(false),8000); }
window.addEventListener("online",()=>nubeSubir(false));
$("nubeActivar").onclick=async()=>{
  const codigo=R.nuevoCodigo();
  guardarLocal(KEY_NUBE,{codigo,ultimo:null});
  $("nubeCodigo").textContent=codigo; $("nubeCodigoCaja").hidden=false;
  pintarNube(); await nubeSubir(true);
};
$("nubeTengo").onclick=()=>{ $("nubeRecuperar").hidden=false; $("nubeCodigoIn").focus(); };
$("nubeRecuperarGo").onclick=async()=>{
  const codigo=$("nubeCodigoIn").value;
  if(!R.codigoValido(codigo)){ mensaje("nubeMsg","El código no está completo. Son 24 letras y números.","no"); return; }
  mensaje("nubeMsg","Buscando tu historial...","");
  try{
    const r=await R.bajarNube(codigo);
    if(!r){ mensaje("nubeMsg","Ese código no tiene nada guardado todavía. Revisa que esté bien escrito.","no"); return; }
    guardarLocal(KEY_NUBE,{codigo:R.normalizarCodigo(codigo).match(/.{4}/g).join("-"),ultimo:new Date().toISOString()});
    pendiente=r; aplicarRestauracion();
  }catch(e){ mensaje("nubeMsg",e.message,"no"); }
};
$("nubeAhora").onclick=()=>{ mensaje("nubeMsg","Respaldando...",""); nubeSubir(true); };
$("nubeVerCodigo").onclick=()=>{ const n=leerLocal(KEY_NUBE); if(!n) return; $("nubeCodigo").textContent=n.codigo; $("nubeCodigoCaja").hidden=false; };
$("nubeOcultarCodigo").onclick=()=>{ $("nubeCodigoCaja").hidden=true; };
$("nubeCopiarCodigo").onclick=()=>{ const n=leerLocal(KEY_NUBE); if(n) copyText(n.codigo); };
$("nubeApagar").onclick=()=>{
  const el=$("nubeApagar");
  if(el.dataset.c!=="1"){ el.dataset.c="1"; el.textContent="Toca de nuevo para desactivar"; setTimeout(()=>{ el.dataset.c=""; el.textContent="Desactivar"; },4000); return; }
  guardarLocal(KEY_NUBE,null); $("nubeCodigoCaja").hidden=true; mensaje("nubeMsg","Desactivado. Lo que ya estaba en la nube sigue cifrado y solo se abre con tu código.",""); pintarNube();
};
pintarNube();

/* ---------- En 15 segundos (con tope diario) ---------- */
const RAPIDO_MAX=7;
function poolRapido(){
  const p=[];
  (window.FACTS||[]).forEach(f=>p.push({k:"h:"+f.t,tipo:"Dato",t:f.t,b:f.b}));
  (window.PREGUNTAS||[]).forEach(q=>p.push({k:"p:"+q.q,tipo:"¿Verdadero?",t:q.q,b:(q.v?"Verdadero. ":"Falso. ")+q.e}));
  (window.SUSTANCIAS||[]).forEach(s=>s.danos.forEach((d,i)=>p.push({k:"s:"+s.id+i,tipo:s.nombre,t:d.includes(":")?d.split(":")[0]:s.nombre,b:d.includes(":")?d.split(":").slice(1).join(":").trim():d})));
  (window.ACTUALIDAD||[]).forEach(x=>p.push({k:"a:"+x.titulo,tipo:x.fecha,t:x.titulo,b:x.resumen.split(". ").slice(0,2).join(". ")+"."}));
  return p;
}
function renderRapido(){
  const t=todayStr();
  if(S.rapidoDate!==t){ S.rapidoDate=t; S.rapidoCount=0; save(); }
  $("rapidoCount").textContent=S.rapidoCount+" de "+RAPIDO_MAX+" hoy";
  if(S.rapidoCount>=RAPIDO_MAX){
    $("rapidoTipo").textContent="Listo por hoy";
    $("rapidoT").textContent="Ya viste tus "+RAPIDO_MAX+" de hoy.";
    $("rapidoB").textContent="Mañana hay otras. El tope es a propósito: esta app está hecha para que aprendas y sigas con tu día, no para que te quedes pegado.";
    $("rapidoNext").disabled=true; $("rapidoNote").textContent="";
    return;
  }
  $("rapidoNext").disabled=false;
  $("rapidoNote").textContent=S.rapidoCount===0?"Toca para ver la primera.":"";
  if(S.rapidoCount===0){ $("rapidoTipo").textContent="Rápido"; $("rapidoT").textContent="Una idea útil, en lo que dura un video corto."; $("rapidoB").textContent="Datos, preguntas y alertas de la guía, de a una. Sin autoplay y sin scroll infinito: cada una la pides tú."; }
}
$("rapidoNext").onclick=()=>{
  const pool=poolRapido().filter(x=>!(S.rapidoSeen||[]).includes(x.k));
  const src=pool.length?pool:poolRapido();
  const x=src[Math.floor(Math.random()*src.length)];
  S.rapidoSeen=(S.rapidoSeen||[]).concat(x.k).slice(-200);
  S.rapidoCount++; save();
  $("rapidoTipo").textContent=x.tipo; $("rapidoT").textContent=x.t; $("rapidoB").textContent=x.b;
  renderRapido();
};

/* ---------- ¿Qué me ofrecieron? ---------- */
const OF=window.OFRECIERON||[];
function renderOfChips(){
  $("ofChips").innerHTML=OF.map(o=>`<button class="chip" data-of="${o.id}">${esc(o.aspecto)}</button>`).join("");
  $("ofChips").querySelectorAll("[data-of]").forEach(b=>b.onclick=()=>{ $("ofBuscar").value=""; mostrarOf([OF.find(o=>o.id===b.dataset.of)],b.dataset.of); });
}
function mostrarOf(lista,activo){
  $("ofChips").querySelectorAll(".chip").forEach(c=>c.classList.toggle("on",c.dataset.of===activo));
  $("ofOut").hidden=!lista.length;
  $("ofOut").innerHTML=lista.map(o=>`<div class="ofItem">
    <div class="row"><b>${esc(o.aspecto)}</b><span class="small muted">${esc(o.nombres.join(" · "))}</span></div>
    <p class="small"><b>Suele ser:</b> ${esc(o.suele)}</p>
    <p class="small"><b>Pero puede traer:</b> ${esc(o.puede)}</p>
    <p class="small"><b>Riesgo principal:</b> ${esc(o.riesgo)}</p>
    <p class="small em"><b>Llamar al 131 si:</b> ${esc(o.emergencia)}</p>
    ${o.sust.length?`<p class="small muted">Ficha completa en la guía: ${o.sust.map(id=>{ const s=(window.SUSTANCIAS||[]).find(x=>x.id===id); return s?esc(s.nombre):""; }).filter(Boolean).join(", ")}.</p>`:""}
  </div>`).join("");
}
function normalizar(s){ return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); }
$("ofBuscar").oninput=()=>{
  const q=normalizar($("ofBuscar").value.trim()); if(q.length<2){ mostrarOf([],null); return; }
  const r=OF.filter(o=>normalizar(o.aspecto).includes(q)||o.nombres.some(n=>normalizar(n).includes(q))||normalizar(o.suele).includes(q));
  mostrarOf(r.slice(0,3),null);
};

/* ---------- En la fiesta: señales ---------- */
const SEN=window.SENALES||[];
function renderSenales(){
  $("senChips").innerHTML=SEN.map(s=>`<button class="chip" data-sen="${s.id}">${esc(s.nombre)}</button>`).join("");
  $("senChips").querySelectorAll("[data-sen]").forEach(b=>b.onclick=()=>{
    const s=SEN.find(x=>x.id===b.dataset.sen);
    $("senChips").querySelectorAll(".chip").forEach(c=>c.classList.toggle("on",c===b));
    $("senOut").hidden=false;
    $("senOut").innerHTML=`<div class="ofItem">
      <div class="row" style="justify-content:space-between"><b>${esc(s.nombre)}</b><span class="small muted">mirar sin preguntar</span></div>
      <div><b class="small">En el cuerpo</b><ul class="small">${s.cuerpo.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
      <div><b class="small">En la conducta</b><ul class="small">${s.conducta.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
      <p class="small" style="border-left:3px solid var(--warm);padding-left:10px"><b>Dos caras:</b> ${esc(s.dosCaras)}</p>
      <p class="small em"><b>Pasa a ser emergencia si:</b> ${esc(s.alarma)}</p>
    </div>`;
  });
  $("factoresList").innerHTML=(window.FACTORES||[]).map(f=>`<div class="mito small"><span><b style="color:var(--accent)">${esc(f.t)}.</b> ${esc(f.b)}</span></div>`).join("");
}

/* ---------- Calendario del mes ---------- */
function renderCal(){
  const r=C.calendario(S.events,S.day0,30);
  const hoy=todayStr();
  $("cal").innerHTML=r.dias.map(d=>`<div class="${d.consumo?"no":d.antes?"antes":d.k===S.day0?"cero":d.ganas?"ganas":"ok"} ${d.k===hoy?"hoy":""}" title="${d.k}${d.k===S.day0?" · Día 0":""}${d.ganas?" · "+d.ganas+" ganas":""}${d.sueno!=null?" · durmió "+d.sueno+" h":""}">${d.dia}</div>`).join("");
  $("calText").textContent=`${r.limpios} ${r.limpios===1?"día limpio":"días limpios"} de los últimos 30 · ${r.ganas} ganas anotadas · ${r.consumos} ${r.consumos===1?"consumo":"consumos"}.`;
}

/* ---------- Antes de salir ---------- */
function renderSalir(){
  const L=window.ANTES_DE_SALIR||[]; const t=todayStr();
  if(S.salirDate!==t){ S.salirDate=t; S.salirOk=[]; save(); }
  $("salirCount").textContent=(S.salirOk||[]).length+" de "+L.length;
  $("salirList").innerHTML=L.map(x=>{ const on=(S.salirOk||[]).includes(x.id); return `<div class="salir ${on?"on":""}"><input type="checkbox" id="salir-${x.id}" ${on?"checked":""}><label for="salir-${x.id}"><span class="small"><b>${esc(x.t)}</b></span><span class="small muted">${esc(x.por)}</span></label></div>`; }).join("");
  $("salirList").querySelectorAll("input").forEach(i=>i.onchange=()=>{ const id=i.id.replace("salir-",""); S.salirOk=i.checked?(S.salirOk||[]).concat(id):(S.salirOk||[]).filter(x=>x!==id); save(); renderSalir(); });
}

/* ---------- Buscador general ---------- */
function indice(){
  const it=[];
  (window.FACTS||[]).forEach(f=>it.push({tipo:"Dato",t:f.t,b:f.b}));
  (window.SUSTANCIAS||[]).forEach(s=>{
    it.push({tipo:"Ficha",t:s.nombre+": qué es",b:s.que});
    it.push({tipo:"Ficha",t:s.nombre+": qué daña",b:s.danos.join(" ")});
    it.push({tipo:"Ficha",t:s.nombre+": emergencia",b:s.emergencia.join(" ")});
    it.push({tipo:"Ficha",t:s.nombre+": mezclas peligrosas",b:s.mezclas.join(" ")});
    it.push({tipo:"Ficha",t:s.nombre+": dejarla",b:s.dejar+" "+s.abstinencia});
    (s.mitos||[]).forEach(m=>it.push({tipo:"Mito",t:s.nombre+": "+m.m,b:"Realidad: "+m.r}));
  });
  (window.OFRECIERON||[]).forEach(o=>it.push({tipo:"Me ofrecieron",t:o.aspecto+" · "+o.nombres.join(", "),b:o.suele+" "+o.puede+" "+o.riesgo}));
  (window.SENALES||[]).forEach(s=>it.push({tipo:"En la fiesta",t:"Reconocer: "+s.nombre,b:s.cuerpo.join(" ")+" "+s.conducta.join(" ")+" "+s.dosCaras}));
  (window.PRIMEROS_AUXILIOS||[]).forEach(p=>it.push({tipo:"Primeros auxilios",t:p.titulo,b:p.cuando+" "+p.pasos.join(" ")}));
  (window.PREGUNTAS||[]).forEach(q=>it.push({tipo:"Pregunta",t:q.q,b:q.e}));
  (window.ACTUALIDAD||[]).forEach(x=>it.push({tipo:x.tipo+" "+x.fecha,t:x.titulo,b:x.resumen}));
  (window.FACTORES||[]).forEach(f=>it.push({tipo:"Por qué pega distinto",t:f.t,b:f.b}));
  return it;
}
let IDX=null;
function resaltar(txt,q){ const n=normalizar(txt); const i=n.indexOf(q); if(i<0) return esc(txt.slice(0,160))+(txt.length>160?"…":""); const a=Math.max(0,i-60), b=Math.min(txt.length,i+q.length+100); return (a>0?"…":"")+esc(txt.slice(a,i))+"<mark>"+esc(txt.slice(i,i+q.length))+"</mark>"+esc(txt.slice(i+q.length,b))+(b<txt.length?"…":""); }
$("buscar").oninput=()=>{
  const q=normalizar($("buscar").value.trim()); const out=$("buscarOut");
  if(q.length<3){ out.hidden=true; return; }
  IDX=IDX||indice();
  const r=IDX.map(x=>({x,s:(normalizar(x.t).includes(q)?2:0)+(normalizar(x.b).includes(q)?1:0)})).filter(z=>z.s>0).sort((a,b)=>b.s-a.s).slice(0,12);
  out.hidden=false;
  out.innerHTML=r.length?r.map(z=>`<div class="res"><div class="row" style="justify-content:space-between"><b class="small">${esc(z.x.t)}</b><span class="pill">${esc(z.x.tipo)}</span></div><p class="small">${resaltar(z.x.b,q)}</p></div>`).join("")+`<p class="small muted">${r.length} resultados${r.length===12?" (los más relevantes)":""}. Las secciones completas están más abajo.</p>`:`<p class="small muted">Nada con "${esc($("buscar").value.trim())}". Prueba con otra palabra.</p>`;
};

/* ---------- Diagnóstico para reportar problemas (sin datos personales) ---------- */
const VERSION_APP="2026.10.15";
$("copiarDiag").onclick=()=>copyText(`Cabeza Despejada ${VERSION_APP} · ${navigator.userAgent} · pantalla ${window.innerWidth}x${window.innerHeight} · modo ${document.documentElement.getAttribute("data-theme")||"auto"} · instalada: ${window.matchMedia("(display-mode: standalone)").matches?"sí":"no"}`);

/* ---------- Compartir ---------- */
$("compartir").onclick=()=>copyText("Cabeza Despejada: app gratis y anónima para dejar o reducir el consumo. Sin cuenta, sin datos. https://luiskoops-source.github.io/cabeza-despejada/");

/* ---------- Primeros auxilios ---------- */
function renderPA(){
  const L=window.PRIMEROS_AUXILIOS||[];
  $("paList").innerHTML=L.map(x=>`<details class="pa">
    <summary><span class="pill bad">131</span> ${esc(x.titulo)}</summary>
    <p class="small muted" style="margin-top:8px"><b>Cómo reconocerlo:</b> ${esc(x.cuando)}</p>
    <ol class="small">${x.pasos.map(p=>`<li>${esc(p)}</li>`).join("")}</ol>
    <p class="small no"><b>Qué no hacer:</b> ${esc(x.no.join(" "))}</p>
    <p class="small muted"><b>Llamar al 131:</b> ${esc(x.llamar)}</p>
  </details>`).join("");
}

/* ---------- Actualidad y comunidades ---------- */
function renderActualidad(){
  const A=window.ACTUALIDAD||[], K=window.COMUNIDADES||[];
  $("actualidadList").innerHTML=A.map(x=>`<div class="study">
    <div class="row"><span class="pill ${x.tipo==="Alerta"?"bad":x.tipo==="Estudio"?"good":""}">${esc(x.tipo)}</span><span class="small muted">${esc(x.fecha)} · ${esc(x.fuente)}</span></div>
    <h3>${esc(x.titulo)}</h3>
    <p class="small">${esc(x.resumen)}</p>
    ${x.nota?`<p class="small" style="border-left:3px solid var(--warm);padding-left:10px"><b>Para ti:</b> ${esc(x.nota)}</p>`:""}
    <a href="${esc(x.enlace)}" target="_blank" rel="noopener">Leer la fuente</a></div>`).join("");
  $("comunidadesRev").textContent=window.COMUNIDADES_REVISADO?"Enlaces revisados el "+new Date(window.COMUNIDADES_REVISADO+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"long",year:"numeric"})+".":"";
  $("comunidadesList").innerHTML=K.map(x=>`<div class="study"><h3>${esc(x.nombre)}</h3><p class="small">${esc(x.que)}</p><a href="${esc(x.enlace)}" target="_blank" rel="noopener">${esc(x.enlace.replace(/^https?:\/\//,""))}</a></div>`).join("");
}

/* ---------- Guía de sustancias ---------- */
function renderSust(){
  const mia=S.sustancia;
  const orden=SUST.slice().sort((a,b)=>(a.id===mia?-1:b.id===mia?1:0));
  $("sustList").innerHTML=orden.map(s=>`<details class="sust ${s.id===mia?"mine":""}" ${s.id===mia?"open":""}>
    <summary><span class="pill ${s.id===mia?"warm":""}">${esc(s.tipo)}</span> <b>${esc(s.nombre)}</b>${s.id===mia?' <span class="small muted">· la mía</span>':""}</summary>
    <div class="stack" style="margin-top:10px">
      <p><b>Qué es.</b> ${esc(s.que)}</p>
      <p><b>Por qué la gente la usa.</b> ${esc(s.efecto)}</p>
      <div><b>Qué daña</b><ul class="small">${s.danos.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="alerta"><b>Señales de emergencia (llamar al 131)</b><ul class="small">${s.emergencia.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
      <div><b>Mezclas peligrosas</b><ul class="small">${s.mezclas.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
      ${s.mitos&&s.mitos.length?`<div><b>Mitos y realidad</b><div class="stack" style="margin-top:6px">${s.mitos.map(x=>`<div class="mito small"><span><b>Mito:</b> ${esc(x.m)}</span><span><i>Realidad:</i> ${esc(x.r)}</span></div>`).join("")}</div></div>`:""}
      <p><b>Dejarla.</b> ${esc(s.dejar)}</p>
      <p class="small muted"><b>Cuánto dura lo peor:</b> ${esc(s.abstinencia)}</p>
    </div></details>`).join("");
}

/* ---------- Resumen de la semana ---------- */
function renderSemana(){
  const r=C.resumenSemana(S.events,S.spendWeek,undefined,S.day0);
  $("wkClean").textContent=r.diasLimpios+"/7";
  $("wkWaves").textContent=r.olas;
  $("wkSleep").textContent=r.suenoProm==null?"—":r.suenoProm+" h";
  $("wkMoney").textContent=clp(r.dinero);
}

/* ---------- Plan para la hora difícil ---------- */
function renderPlan(){
  const h=C.horaPico(S.events);
  S.planHour=h;
  $("planHour").textContent=h==null?"tu hora difícil (aparece con 3 o más registros)":"las "+h+":00";
  /* Si la persona está escribiendo, no le pisamos el texto */
  if(document.activeElement!==$("planText")) $("planText").value=S.plan||"";
  const ahora=new Date().getHours();
  const esLaHora=h!=null&&S.plan&&Math.abs(ahora-h)<=1;
  $("planNow").hidden=!esLaHora;
  if(esLaHora) $("planNowText").textContent=S.plan;
  /* Propone la hora del recordatorio solo si la persona no eligió una */
  if(!$("recHora").value) $("recHora").value=C.horaRecordatorio(h);
}
/* Recordatorio diario: arma el archivo de calendario y lo descarga. Al abrirlo, el teléfono ofrece agregarlo a su calendario. */
$("recordatorio").onclick=()=>{
  const [hh,mm]=($("recHora").value||"").split(":").map(Number);
  const texto=C.recordatorioICS(hh,mm,todayStr(),Date.now());
  if(!texto){ mensaje("recMsg","Elige una hora.","no"); return; }
  /* Dentro de otra página (la versión en claude.ai) no se pueden descargar archivos */
  if(window.self!==window.top){ mensaje("recMsg","Esta vista no permite descargar archivos. Agrega el recordatorio desde la app instalada en tu teléfono.","no"); return; }
  try{
    const url=URL.createObjectURL(new Blob([texto],{type:"text/calendar"}));
    const a=document.createElement("a"); a.href=url; a.download="recordatorio.ics"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);
    mensaje("recMsg","Listo. Abre el archivo descargado y toca Guardar o Agregar en tu calendario. Si cambias de hora, borra el anterior en el calendario.","ok");
  }catch(e){ mensaje("recMsg","No se pudo crear el archivo en esta vista. Prueba desde la app instalada.","no"); }
};
/* Segundo camino: abre Google Calendar con el evento ya lleno. La persona revisa y toca Guardar allá. */
$("recGoogle").onclick=()=>{
  const [hh,mm]=($("recHora").value||"").split(":").map(Number);
  const url=C.enlaceGoogleCalendar(hh,mm,todayStr());
  if(!url){ mensaje("recMsg","Elige una hora.","no"); return; }
  window.open(url,"_blank","noopener");
  mensaje("recMsg","Revisa el evento en Google Calendar y toca Guardar. Se repite todos los días.","ok");
};
$("savePlan").onclick=()=>{ clearTimeout(planT); S.plan=$("planText").value.trim(); save(); $("planText").blur(); renderPlan(); toast("Plan guardado"); };
/* El plan también se guarda solo mientras escribes (medio segundo después de la última letra) */
let planT;
$("planText").addEventListener("input",()=>{ clearTimeout(planT); planT=setTimeout(()=>{ S.plan=$("planText").value.trim(); save(); },500); });
$("welcomeGo").onclick=()=>{ const v=$("welcomeDay0").value; if(!v){ toast("Elige una fecha"); return; } S.day0=v; S.day0Hora=horaDia0(v); S.sustancia=$("welcomeSust").value; S.modo=$("welcomeModo").value; save(); aplicarTema(); fillConfig(); renderHoy(); renderRegistro(); renderSust(); toast("Empezamos a contar desde ahí."); };

/* ---------- Check-in diario (sueño y ánimo) ---------- */
function todayCheckin(){ const t=todayStr(); return S.events.find(e=>e.type==="checkin"&&e.ts.slice(0,10)===t); }
function renderCheckin(){
  const c=todayCheckin();
  $("checkinDone").hidden=!c;
  $("checkinForm").hidden=!!c;
  if(c){ $("checkinSummary").textContent=`Dormiste ${c.sueno} h y tu ánimo es ${c.animo}/5.`; }
}
$("saveCheckin").onclick=()=>{
  const sueno=Number($("ciSleep").value), animo=Number($("ciMood").value);
  if(!(sueno>=0&&sueno<=24)){ toast("Pon las horas que dormiste (0 a 24)"); return; }
  addEvent("checkin",{sueno,animo});
  renderHoy(); renderRegistro();
  toast(sueno<6?"Dormiste poco. Hoy cuídate más de lo normal.":"Anotado.");
};
$("editCheckin").onclick=()=>{ const i=S.events.indexOf(todayCheckin()); if(i>-1) S.events.splice(i,1); save(); renderCheckin(); };
$("saveDay0").onclick=()=>{ S.day0=$("day0").value||null; S.day0Hora=S.day0?horaDia0(S.day0):null; save(); renderHoy(); renderRegistro(); toast("Día 0 guardado"); };
$("saveMoney").onclick=()=>{ S.spendWeek=Number($("spendWeek").value)||0; S.salary=Number($("salary").value)||null; save(); renderHoy(); toast("Guardado"); };

function renderReasons(){
  const html=S.reasons.map((r,i)=>`<li><span>${esc(r)}</span><button data-del="${i}" aria-label="Quitar">×</button></li>`).join("");
  $("reasons").innerHTML=html;
  $("craveReasons").innerHTML=S.reasons.map(r=>`<li><span>${esc(r)}</span></li>`).join("");
  $("reasons").querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{ S.reasons.splice(Number(b.dataset.del),1); save(); renderReasons(); });
}
$("addReason").onclick=()=>{ const v=$("newReason").value.trim(); if(!v) return; S.reasons.push(v); $("newReason").value=""; save(); renderReasons(); };
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

/* ---------- Daily fact ---------- */
function factsMios(){ const m=FACTS.filter(f=>f.s===S.sustancia||f.s==="general"); return m.length?m:FACTS; }
function pickDaily(){
  const t=todayStr();
  if(S.dailyDate!==t||S.dailyIdx==null){ const pool=factsMios(); S.dailyIdx=FACTS.indexOf(pool[Math.floor(Math.random()*pool.length)]); S.dailyDate=t; S.dailyAI=null; save(); }
  showDaily();
}
/* Fuentes de un dato: devuelve "Fuentes: A · B" con enlaces que abren fuera de la app, o "" si el dato no tiene */
function fuentesHTML(f){
  if(!f||!f.f||!f.f.length) return "";
  return (f.f.length===1?"Fuente: ":"Fuentes: ")+f.f.map(x=>`<a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.n)}</a>`).join(" · ");
}
function showDaily(){
  if(S.dailyAI){ $("dailyTitle").textContent=S.dailyAI.t; $("dailyBody").textContent=S.dailyAI.b; $("dailyPill").textContent="nuevo, de hoy"; $("dailyPill").className="pill warm"; $("dailyFact").classList.add("new"); $("dailySrc").hidden=true; }
  else { const f=FACTS[S.dailyIdx%FACTS.length]; $("dailyTitle").textContent=f.t; $("dailyBody").textContent=f.b; $("dailyPill").textContent="de la base"; $("dailyPill").className="pill"; $("dailyFact").classList.remove("new"); const src=fuentesHTML(f); $("dailySrc").innerHTML=src; $("dailySrc").hidden=!src; }
}
$("dailyNext").onclick=()=>{ S.dailyAI=null; const pool=factsMios().filter((f,i,a)=>FACTS.indexOf(f)!==S.dailyIdx); S.dailyIdx=FACTS.indexOf(pool[Math.floor(Math.random()*pool.length)]); save(); showDaily(); };

/* ---------- Claude (sample) ---------- */
let sample=null;
const RULES=()=>`Eres parte de una app privada y anónima de apoyo para una persona adulta en Chile que está dejando o reduciendo ${sustActual().nombre.toLowerCase()}. Hablas en español neutro, cercano, directo, sin moralizar y sin frases hechas. Nunca das instrucciones de dosis, mezclas, formas de consumo ni de conseguir droga. Si la persona eligió reducir de a poco, la apoyas en eso sin juzgar; si eligió dejar, no le propones "consumir controlado". Nunca das cantidades. Si la persona describe dolor al pecho, convulsiones o riesgo de muerte, le dices que llame al 131 (emergencias Chile). Siempre puedes recordar que el fono 1412 de SENDA es gratuito, anónimo y 24 horas.`;
function knownTitles(){ return FACTS.map(f=>f.t).concat(S.customFacts.map(f=>f.t)); }
function factPrompt(topic){
  return RULES()+`

Tarea: explica UN efecto negativo del consumo de ${sustActual().nombre.toLowerCase()} que NO esté en esta lista de temas ya cubiertos:
${knownTitles().map(t=>"- "+t).join("\n")}
${topic?`\nLa persona pidió este tema específico: "${topic}". Si ya está cubierto arriba, busca un ángulo distinto del mismo tema.`:"\nElige algo poco conocido, sorprendente y verdadero (puede ser físico, mental, social, económico o legal en Chile)."}

Basado en evidencia médica real. Si das una cifra, que sea una que exista en la literatura; si no estás seguro de un número, describe el efecto sin cifra. Extensión: un título de máximo 12 palabras y un cuerpo de 70 a 120 palabras, en lenguaje simple, con un cierre que conecte con la vida diaria.

Responde SOLO con JSON: {"t":"título","b":"cuerpo"}`;
}
async function askFact(topic, target){
  if(!sample) return null;
  const ctl=new AbortController(); askFact.ctl=ctl;
  const v=await sample.json(factPrompt(topic),{signal:ctl.signal,cache:false});
  if(!v||typeof v.t!=="string"||typeof v.b!=="string") throw {code:"invalid_json",message:"shape"};
  return {t:v.t.trim(),b:v.b.trim(),c:"nuevo",d:todayStr(),q:topic||""};
}
function aiError(e){
  const m={not_granted:"No se permitió usar Claude en esta app. Puedes volver a permitirlo abriendo la página de nuevo.",rate_limited:"Muchas consultas seguidas. Espera un poco y prueba de nuevo.",refused:"Claude no respondió a eso. Prueba con otro tema.",invalid_json:"La respuesta llegó incompleta. Prueba de nuevo.",cancelled:"",session_expired:"Tu sesión expiró. Vuelve a entrar a Claude.",upstream_error:"Hubo un problema de conexión. Prueba de nuevo."};
  return m[e&&e.code]!==undefined?m[e.code]:"No se pudo obtener la explicación. Prueba de nuevo.";
}
$("dailyNew").onclick=async()=>{
  if(!sample){ toast("Claude no está disponible en esta vista"); return; }
  $("dailyNew").disabled=true; $("dailyNote").textContent="Pensando...";
  try{ const f=await askFact("",null); S.dailyAI=f; S.customFacts.unshift(f); save(); showDaily(); renderFacts(); $("dailyNote").textContent="Se guardó también en Saber → Lo que pedí."; }
  catch(e){ $("dailyNote").textContent=aiError(e); }
  finally{ $("dailyNew").disabled=false; }
};
$("aiAsk").onclick=async()=>{
  if(!sample){ $("aiNote").textContent="Claude no está disponible en esta vista."; return; }
  const topic=$("aiTopic").value.trim();
  $("aiAsk").disabled=true; $("aiStop").hidden=false; $("aiOut").hidden=false; $("aiTitle").textContent="Pensando..."; $("aiBody").textContent=""; $("aiNote").textContent="";
  try{ const f=await askFact(topic); $("aiTitle").textContent=f.t; $("aiBody").textContent=f.b; S.customFacts.unshift(f); save(); renderFacts(); $("aiNote").textContent="Guardado en tu biblioteca."; $("aiTopic").value=""; }
  catch(e){ if(e&&e.code==="cancelled"){ $("aiOut").hidden=true; } else { $("aiTitle").textContent="No salió"; $("aiBody").textContent=aiError(e); } }
  finally{ $("aiAsk").disabled=false; $("aiStop").hidden=true; }
};
$("aiStop").onclick=()=>askFact.ctl&&askFact.ctl.abort();

/* Resúmenes del registro para darle contexto a Claude sin inventar nada */
function gatillantesTop(){ const m={}; S.events.forEach(e=>{ if(e.trig) m[e.trig]=(m[e.trig]||0)+1; }); const t=Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]); return t.length?t.join(", "):"aún sin registros"; }
function loQueSirvio(){ const t=S.events.filter(e=>e.type==="crave"&&e.did).slice(0,5).map(e=>e.did); return t.length?t.join("; "):"aún sin registros"; }

/* craving chat */
let craveTurns=[];
$("craveAsk").onclick=async()=>{
  const msg=$("craveMsg").value.trim(); if(!msg) return;
  if(!sample){ $("craveReply").textContent="Claude no está disponible aquí. Llama al 1412: es gratis y contestan al tiro."; return; }
  craveTurns.push({role:"user",content:msg}); $("craveMsg").value="";
  const ctl=new AbortController(); $("craveStop").hidden=false; $("craveAsk").disabled=true; $("craveStop").onclick=()=>ctl.abort();
  $("craveReply").textContent="Pensando...";
  const ctx=`${RULES()}

Contexto: la persona está AHORA MISMO con ganas intensas de consumir y abrió el modo de emergencia de la app. Lleva ${daysSince(S.day0)} días sin consumir. Sus propias razones para no consumir: ${S.reasons.join(" | ")}. Sus gatillantes más frecuentes según su registro: ${gatillantesTop()}. Lo que ha anotado que le sirvió antes: ${loQueSirvio()}.

Responde en máximo 5 frases cortas. Primero reconoce lo que dice, después UNA acción concreta para los próximos 10 minutos, y recuérdale que la ola baja sola. Sin listas, sin negritas, sin sermones.`;
  try{
    const r=await sample([{role:"user",content:ctx},...craveTurns.slice(-8)],{cache:false,signal:ctl.signal,modelTier:"quick",onText:({text})=>{ $("craveReply").textContent=text; }});
    craveTurns.push({role:"assistant",content:r.text});
  }catch(e){ if(e&&e.code!=="cancelled") $("craveReply").textContent=(e.text||"")+(e.text?"\n\n":"")+aiError(e); }
  finally{ $("craveStop").hidden=true; $("craveAsk").disabled=false; }
};

/* ---------- Facts list ---------- */
let cat="mia";
document.querySelectorAll(".catBtn").forEach(b=>b.onclick=()=>{ cat=b.dataset.cat; document.querySelectorAll(".catBtn").forEach(x=>x.classList.toggle("primary",x===b)); renderFacts(); });
function renderFacts(){
  const all=S.customFacts.concat(FACTS.slice().sort((a,b)=>(a.s===S.sustancia?-1:b.s===S.sustancia?1:0)));
  $("factCount").textContent=all.length+" temas";
  const list=all.filter(f=>cat==="todo"||f.c===cat||(cat==="mia"&&(f.s===S.sustancia||f.s==="general")));
  $("factList").innerHTML=list.length?list.map(f=>`<div class="fact ${f.c==="nuevo"?"new":""}"><div class="row" style="justify-content:space-between"><h3>${esc(f.t)}</h3>${f.c==="nuevo"?`<span class="pill warm">${esc(f.d||"")}</span>`:(f.s?`<span class="pill">${esc(f.s==="general"?"Todas":(SUST.find(x=>x.id===f.s)||{}).nombre||"")}</span>`:"")}</div><p class="small">${esc(f.b)}</p>${fuentesHTML(f)?`<p class="small muted fuentes">${fuentesHTML(f)}</p>`:""}</div>`).join(""):`<p class="small muted">Todavía no has pedido nada. Usa el botón de arriba.</p>`;
}

/* ---------- Registro ---------- */
function addEvent(type,extra){ S.events.unshift(Object.assign({type,ts:new Date().toISOString()},extra||{})); save(); }
/* El deslizador de fuerza muestra su número al lado mientras se mueve */
$("cInt").oninput=()=>{ $("cIntVal").textContent=$("cInt").value; };
$("addCrave").onclick=()=>{ addEvent("crave",{i:Number($("cInt").value)||5,trig:$("cTrig").value,did:$("cDid").value.trim()}); $("cDid").value=""; renderRegistro(); toast("Anotado. Eso cuenta."); };
$("addRelapse").onclick=()=>{ const el=$("addRelapse"); if(el.dataset.confirm!=="1"){ el.dataset.confirm="1"; el.textContent="Toca de nuevo para confirmar"; setTimeout(()=>{ el.dataset.confirm=""; el.textContent="Registrar consumo"; },4000); return; } el.dataset.confirm=""; el.textContent="Registrar consumo"; registerRelapse($("cDid").value.trim()); $("cDid").value=""; };
function registerRelapse(note){ addEvent("relapse",{did:note||"",trig:$("cTrig").value}); S.day0=todayStr(); S.day0Hora=new Date().toISOString(); save(); renderHoy(); renderRegistro(); toast("Día 0 reiniciado. Una púa no borra lo que avanzaste."); }
function renderRegistro(){
  const days=[]; const now=new Date(); now.setHours(12,0,0,0);
  for(let i=13;i>=0;i--){ const d=new Date(now); d.setDate(d.getDate()-i); days.push({k:dstr(d),c:0,r:false,label:d.toLocaleDateString("es-CL",{day:"numeric",month:"short"})}); }
  S.events.forEach(e=>{ const k=e.ts.slice(0,10); const d=days.find(x=>x.k===k); if(!d) return; if(e.type==="crave") d.c++; if(e.type==="relapse") d.r=true; });
  const max=Math.max(1,...days.map(d=>d.c));
  $("chart").innerHTML=days.map(d=>`<div class="${d.r?"r":""}" style="height:${d.r?100:Math.max(d.c?8:2,d.c/max*100)}%" ${d.c||d.r?`data-n="${d.r?"C":d.c}"`:""} title="${d.label}"></div>`).join("");
  $("axisFrom").textContent=days[0].label; $("axisTo").textContent=days[13].label;
  $("log").innerHTML=S.events.length?S.events.slice(0,60).map(e=>{ const t=new Date(e.ts); return `<div class="e"><time>${t.toLocaleDateString("es-CL",{day:"2-digit",month:"2-digit"})} ${t.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</time><div><span class="pill ${e.type==="relapse"?"bad":e.type==="win"?"good":""}">${e.type==="relapse"?"consumo":e.type==="win"?"ola superada":e.type==="checkin"?"dormí "+e.sueno+" h · ánimo "+e.animo+"/5":e.type==="calma"?"modo calma":"ganas "+e.i+"/10"}</span>${e.trig?" · "+esc(e.trig):""}${e.did?"<br>"+esc(e.did):""}</div></div>`; }).join(""):`<p class="small muted">Nada todavía. Lo primero que anotes empieza a mostrar tu patrón.</p>`;
  renderPatterns();
  renderCal();
}
function renderPatterns(){
  const cr=S.events.filter(e=>e.type==="crave"||e.type==="relapse");
  if(cr.length<3){ $("patterns").innerHTML=`<p class="muted">Con tres o más registros empiezan a aparecer patrones aquí.</p>`; return; }
  const byTrig={}, byHour=new Array(24).fill(0);
  cr.forEach(e=>{ byTrig[e.trig||"Otro"]=(byTrig[e.trig||"Otro"]||0)+1; byHour[new Date(e.ts).getHours()]++; });
  const topTrig=Object.entries(byTrig).sort((a,b)=>b[1]-a[1])[0];
  let peak=0; byHour.forEach((v,i)=>{ if(v>byHour[peak]) peak=i; });
  const rel=S.events.filter(e=>e.type==="relapse").length, wins=S.events.filter(e=>e.type==="win").length;
  const avgInt=(cr.filter(e=>e.i).reduce((a,e)=>a+e.i,0)/Math.max(1,cr.filter(e=>e.i).length)).toFixed(1);
  const sv=C.suenoVsGanas(S.events);
  let suenoTxt="";
  if(sv.conGanas!=null&&sv.sinGanas!=null) suenoTxt=`<li>Sueño: los días con ganas dormiste en promedio <b>${sv.conGanas} h</b>; los días tranquilos, <b>${sv.sinGanas} h</b>.${sv.conGanas<sv.sinGanas?" Dormir menos y tener ganas van juntos en tus datos.":""}</li>`;
  else if(sv.diasConDato<3) suenoTxt=`<li>Anota cómo dormiste cada día (en Hoy) y aquí aparecerá la relación entre sueño y ganas.</li>`;
  $("patterns").innerHTML=`<ul><li>Tu gatillante más frecuente: <b>${esc(topTrig[0])}</b> (${topTrig[1]} veces).</li><li>La hora en que más te llegan las ganas: <b>alrededor de las ${peak}:00</b>. Ten un plan para esa hora.</li><li>Intensidad promedio de las ganas: <b>${avgInt}/10</b>.</li><li>Olas superadas sin consumir: <b>${wins}</b>. Consumos registrados: <b>${rel}</b>.</li>${suenoTxt}</ul>`;
}

$("exportBtn").onclick=()=>{
  const txt=S.events.map(e=>`${e.ts.slice(0,16).replace("T"," ")}\t${e.type}\t${e.i||""}\t${e.trig||""}\t${e.did||""}`).join("\n");
  copyText(txt||"(sin registros)");
};

/* ---------- Copy ---------- */
function copyText(t){ try{ navigator.clipboard.writeText(t).then(()=>toast("Copiado")).catch(()=>fallback()); }catch(e){ fallback(); } function fallback(){ const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); toast("Copiado"); }catch(e){ toast("Selecciona y copia el número"); } ta.remove(); } }
document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>copyText(b.dataset.copy));
/* Junto a cada número de ayuda, un botón Llamar que abre el marcador del teléfono */
document.querySelectorAll("[data-copy]").forEach(b=>{
  if(!/^\d+$/.test(b.dataset.copy)) return;
  const a=document.createElement("a"); a.href="tel:"+b.dataset.copy; a.className="llamar"; a.textContent="Llamar";
  const grupo=document.createElement("div"); grupo.className="botones-contacto";
  b.replaceWith(grupo); grupo.append(a,b);
});

/* ---------- Craving mode ---------- */
let tInt=null, bInt=null, left=0, TOTAL=15*60;
$("openCrave").onclick=openCrave;
function openCrave(){
  $("crave").hidden=false; document.body.style.overflow="hidden";
  TOTAL=(S.ganasMin||15)*60; $("craveMins").textContent=S.ganasMin||15;
  left=TOTAL; tick(); clearInterval(tInt); tInt=setInterval(()=>{ left=Math.max(0,left-1); tick(); if(left===0){ clearInterval(tInt); $("craveTitle").textContent="Pasaron "+(S.ganasMin||15)+" minutos. Fíjate si bajó."; } },1000);
  let inhale=false; clearInterval(bInt); const breathe=()=>{ inhale=!inhale; $("breath").classList.toggle("in",inhale); $("breathTxt").textContent=inhale?"Inhala":"Exhala"; }; breathe(); bInt=setInterval(breathe,4000);
  craveTurns=[]; $("craveReply").textContent="";
  try{ navigator.wakeLock&&navigator.wakeLock.request("screen").catch(()=>{}); }catch(e){}
}
function tick(){ const m=String(Math.floor(left/60)).padStart(2,"0"), s=String(left%60).padStart(2,"0"); $("timer").textContent=m+":"+s; $("barFill").style.width=((TOTAL-left)/TOTAL*100)+"%"; }
/* Lo que dice la voz: cada frase es un botón; al tocarlo se muestra su respuesta debajo */
function renderVoz(){
  const V=window.VOZ||[];
  $("vozList").innerHTML=V.map((x,i)=>`<details class="voz"><summary>"${esc(x.f)}"</summary><p class="small">${esc(x.r)}</p></details>`).join("");
}
renderVoz();
function closeCrave(){ $("crave").hidden=true; document.body.style.overflow=""; $("craveCelebra").hidden=true; $("craveWinBox").hidden=true; $("craveBotones").hidden=false; $("craveWon").hidden=false; $("craveLost").hidden=false; clearInterval(tInt); clearInterval(bInt); $("craveTitle").textContent="Esto dura menos de lo que parece"; }
$("closeCrave").onclick=closeCrave;
$("craveWon").onclick=()=>{ $("craveWinBox").hidden=false; $("craveWon").hidden=true; $("craveLost").hidden=true; };
document.querySelectorAll("[data-ayudo]").forEach(b=>b.onclick=()=>{
  S.craveWins=(S.craveWins||0)+1; addEvent("win",{i:null,trig:"",did:"Modo ganas: "+Math.round((TOTAL-left)/60)+" min · me ayudó: "+b.dataset.ayudo});
  save(); renderHoy(); renderRegistro();
  /* En vez de cerrar de inmediato, el perrito celebra: la ola fue una púa del cactus y la abrazaste sin soltar */
  const n=S.craveWins;
  $("craveCelebraTexto").textContent=n===1?"Tu primera ola superada. Fue una púa del cactus, y la abrazaste sin soltar.":"Llevas "+n+" olas superadas. Cada una es una púa que abrazaste sin soltar.";
  $("craveCelebraAyudo").textContent="Esta vez te ayudó: "+b.dataset.ayudo+". Quedó en tu registro.";
  $("craveWinBox").hidden=true; $("craveBotones").hidden=true; $("craveCelebra").hidden=false;
  $("craveCelebra").scrollIntoView({block:"center",behavior:"smooth"});
});
$("craveCelebraOk").onclick=closeCrave;
$("craveLost").onclick=()=>{ registerRelapse("Desde modo ganas"); closeCrave(); };

/* ---------- Modo calma ---------- */
let bIntC=null;
$("openCalma").onclick=()=>{
  $("calma").hidden=false; document.body.style.overflow="hidden";
  let inhale=false; clearInterval(bIntC); const breathe=()=>{ inhale=!inhale; $("breathC").classList.toggle("in",inhale); $("breathTxtC").textContent=inhale?"Inhala":"Exhala"; }; breathe(); bIntC=setInterval(breathe,4000);
  addEvent("calma",{});
  try{ navigator.wakeLock&&navigator.wakeLock.request("screen").catch(()=>{}); }catch(e){}
};
$("closeCalma").onclick=()=>{ $("calma").hidden=true; document.body.style.overflow=""; clearInterval(bIntC); };

/* ---------- Atajos de la pestaña Noche ---------- */
$("nocheCalma").onclick=()=>$("openCalma").click();
$("nocheGanas").onclick=()=>$("openCrave").click();
$("nocheAuxilios").onclick=()=>{ irA("ayuda"); setTimeout(()=>{ const el=$("paList"); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); },50); };
$("nocheCheckin").onclick=()=>{ irA("hoy"); setTimeout(()=>{ const d=$("checkinForm").closest("details"); if(d) d.open=true; $("checkinForm").closest("details").scrollIntoView({behavior:"smooth",block:"start"}); },50); };
$("nocheRegistro").onclick=()=>{ irA("registro"); setTimeout(()=>{ $("cInt").scrollIntoView({behavior:"smooth",block:"center"}); },50); };

/* ---------- Atajos del ícono ---------- */
/* Al dejar el dedo apretado sobre el ícono aparecen "Tengo ganas" y "Modo calma" (ver "shortcuts" en manifest.json).
   Abren la app con ?ir=ganas o ?ir=calma en la dirección. Si hay PIN, la pantalla se abre después de desbloquear. */
let atajoPendiente=null;
try{ const ir=new URLSearchParams(location.search).get("ir"); if(ir==="ganas"||ir==="calma"){ atajoPendiente=ir; history.replaceState(null,"",location.pathname); } }catch(e){}
function abrirAtajo(){ if(!atajoPendiente) return; const a=atajoPendiente; atajoPendiente=null; $(a==="ganas"?"openCrave":"openCalma").click(); }

/* ---------- Boot ---------- */
fillConfig(); renderHoy(); pickDaily(); renderFacts(); renderRegistro(); renderSust(); renderActualidad(); renderPA(); renderSenales(); renderSalir(); renderRapido(); renderOfChips(); renderNovedades(); lockIfNeeded(); if(!S.pin) abrirAtajo();
/* Si la app está abierta en dos lugares (la app instalada y una pestaña), cada copia
   vuelve a leer lo guardado al volver a la pantalla, para que una copia vieja no borre lo nuevo. */
function recargarDatos(){ S=load(); fillConfig(); renderHoy(); renderRegistro(); }
document.addEventListener("visibilitychange",()=>{ if(!document.hidden) recargarDatos(); });
window.addEventListener("storage",e=>{ if(e.key===KEY) recargarDatos(); });
/* Cada minuto revisa si llegó la hora difícil, para mostrar el plan */
setInterval(renderPlan,60000);
/* Estado del modo sin conexión */
function renderOffline(){
  const inst=window.matchMedia("(display-mode: standalone)").matches;
  const sw="serviceWorker" in navigator && !!navigator.serviceWorker.controller;
  $("offlineState").textContent=sw?(inst?"Lista: esta copia funciona sin conexión.":"Lista para funcionar sin conexión. Para tenerla como app, usa \"Instalar app\" en el menú de Chrome."):"Para que funcione sin internet, ábrela desde su dirección en Chrome e instálala (menú de tres puntos → Instalar app).";
}
try{ renderOffline(); if("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("controllerchange",renderOffline); }catch(e){}
/* Registra el service worker (modo sin internet). Solo funciona servido por http(s), no abierto como archivo ni dentro de claude.ai; si no se puede, no pasa nada. */
/* Cada vez que vuelves a la app (sin cerrarla), le pide al navegador que revise si se publicó una versión nueva de sw.js */
function revisarAlVolver(reg){ document.addEventListener("visibilitychange",()=>{ if(!document.hidden) reg.update().catch(()=>{}); }); }
try{ if("serviceWorker" in navigator&&location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").then(revisarAlVolver).catch(()=>{}); }catch(e){}
/* Aviso de versión nueva. Si al abrir ya había una versión guardada y después cambia, es que llegó una nueva.
   La primera vez que se instala no había versión, así que no se avisa nada. */
try{ if("serviceWorker" in navigator){ const habiaVersion=!!navigator.serviceWorker.controller; navigator.serviceWorker.addEventListener("controllerchange",()=>{ if(habiaVersion) $("avisoVersion").hidden=false; }); } }catch(e){}
/* El botón recarga la página, que ahora abre con los archivos nuevos */
$("actualizarApp").onclick=()=>location.reload();
(async()=>{
  try{ sample=window.claude&&window.claude.use?await window.claude.use("sample"):null; }catch(e){ sample=null; }
  /* Sin Claude (por ejemplo en la versión pública instalada) se ocultan sus botones en vez de mostrarlos apagados */
  if(!sample){ $("aiCard").hidden=true; $("dailyNew").hidden=true; $("aiPriv").hidden=true; $("craveAiCard").hidden=true; if(!S.customFacts.length) $("catNuevo").hidden=true; }
  else { $("aiState").textContent="listo"; }
})();
/* ---------- Escuchar: la voz del teléfono lee cada tarjeta ---------- */
/* Usa la voz que trae el sistema (speechSynthesis): es gratis, funciona sin internet y no envía nada a ningún servidor. */
(function(){
  if(!("speechSynthesis" in window)) return; /* Si el teléfono no tiene voz, no se muestran los botones */
  const voz=window.speechSynthesis;
  let leyendo=null; /* La tarjeta que se está leyendo ahora (o null) */
  /* Elige una voz en español: primero de Chile, después de Latinoamérica y al final cualquiera en español */
  function vozEspanol(){
    const vs=voz.getVoices();
    return ["es-CL","es-US","es-MX","es-419","es-AR","es-ES"].map(l=>vs.find(v=>v.lang.replace("_","-")===l)).find(Boolean)||vs.find(v=>/^es/i.test(v.lang))||null;
  }
  /* Saca el texto que se ve en la tarjeta, sin los botones ni los campos.
     La clase "leyendo-texto" los esconde un instante solo para leer innerText (no alcanza a verse en pantalla). */
  function textoDe(card){
    card.classList.add("leyendo-texto");
    const t=card.innerText;
    card.classList.remove("leyendo-texto");
    /* Cada línea se vuelve una frase: así la voz hace una pausa entre títulos y párrafos */
    /* Los títulos se ven en MAYÚSCULAS por estilo; se pasan a minúsculas para que la voz no los deletree */
    return t.split("\n").map(x=>x.trim().replace(/\b[A-ZÁÉÍÓÚÑ]{2,}\b/g,w=>w.toLowerCase())).filter(Boolean);
  }
  function detener(){ voz.cancel(); if(leyendo){ const b=leyendo.querySelector(":scope > .leer"); if(b){ b.textContent="🔊"; b.setAttribute("aria-label","Escuchar esta parte"); } } leyendo=null; }
  function leer(card,boton){
    if(leyendo===card){ detener(); return; } /* Tocar de nuevo la misma tarjeta la detiene */
    detener();
    const lineas=textoDe(card); if(!lineas.length) return;
    leyendo=card; boton.textContent="⏹"; boton.setAttribute("aria-label","Detener la lectura");
    const v=vozEspanol();
    /* Se lee línea por línea: algunos teléfonos cortan los textos muy largos si van de una sola vez */
    lineas.forEach((l,i)=>{
      const u=new SpeechSynthesisUtterance(l);
      u.lang=v?v.lang:"es-CL"; if(v) u.voice=v; u.rate=0.95;
      if(i===lineas.length-1) u.onend=()=>{ if(leyendo===card) detener(); };
      voz.speak(u);
    });
  }
  /* Un botón por tarjeta. Solo las tarjetas de primer nivel, para no leer lo mismo dos veces. */
  document.querySelectorAll(".card").forEach(card=>{
    if(card.parentElement.closest(".card")) return;
    const b=document.createElement("button");
    b.className="leer"; b.type="button"; b.textContent="🔊"; b.setAttribute("aria-label","Escuchar esta parte");
    b.onclick=e=>{ e.stopPropagation(); leer(card,b); };
    card.classList.add("con-leer"); card.prepend(b);
  });
  /* Al cambiar de pestaña o cerrar la app, se calla */
  document.querySelectorAll('.tabs [role="tab"]').forEach(t=>t.addEventListener("click",detener));
  document.addEventListener("visibilitychange",()=>{ if(document.hidden) detener(); });
  voz.getVoices(); /* Pide la lista de voces de antemano: en Android llega con un pequeño atraso */
})();
})();
