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
  /* Hora de salida (trabajo o clases): la hora "HH:MM", los días (como getDay: 0 domingo … 6 sábado) y las respuestas de hoy */
  salidaHora:null, salidaDias:[1,2,3,4,5], salidaPlan:{fecha:null,vuelta:"",comida:"",dormir:""},
  /* Respuesta del sábado a "¿Cómo te fue el viernes?": { fecha, como } (como: "bien", "costo" o "consumi") */
  viernesRespuesta:null,
  /* Cartas que no se envían: { id, fecha, para, texto }, y lo que se está escribiendo (para no perderlo si se cierra la app) */
  cartas:[], cartaBorrador:{para:"",texto:""},
  /* Configuración: sustancia principal, modo ("dejar" o "reducir"), meta semanal en modo reducir, PIN opcional */
  sustancia:"cocaina", modo:"dejar", metaSemana:2, pin:"", tema:"auto", tourVisto:false, novedadVista:null, inicio:null, ganasMin:15,
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
  if(b.dataset.tab==="noche") $("nocheDormir").hidden=!C.esMadrugada(new Date().getHours()); /* de madrugada, invita a dormir */
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
  $("sinceText").textContent=S.day0?("Día 0: "+new Date(S.day0+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"long"})+(S.craveWins?" · "+S.craveWins+(S.craveWins===1?" ola de ganas superada":" olas de ganas superadas"):"")):"Marca la fecha de tu último consumo para empezar a contar.";
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
  renderSalida();
  renderViernes();
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
  {id:"separar",t:"Si hiciste algo que te avergüenza, separar lo que hiciste de quién eres",por:"La vergüenza a solas empuja a volver a consumir. Mira el hecho y qué puedes reparar, sin convertirlo en una sentencia sobre ti."},
  {id:"anotar",t:"Anotar en Registro qué pasó antes",por:"No para culparte: para reconocer la señal la próxima vez."}
];
function renderVolver(d){
  /* Se muestra si hay un consumo registrado en el Día 0 actual y pasaron 2 días o menos */
  const hubo=S.day0&&S.events.some(e=>e.type==="relapse"&&todayStrDe(e.ts)===S.day0);
  $("volver").hidden=!(hubo&&d<=2);
  if($("volver").hidden) return;
  /* La lista se reinicia con cada Día 0 nuevo */
  if(S.volverDia!==S.day0){ S.volverDia=S.day0; S.volverOk=[]; save(); }
  const acum=C.limpiosAcumulados(S.events,S.day0,30,undefined,S.inicio);
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
/* ¿Por qué abraza al cactus? Al tocar el logo se abre o se cierra la explicación, y el salchicha aprieta el abrazo */
$("porQue").onclick=()=>{
  const b=$("porQue"), c=$("porQueCard"), abrir=c.hidden;
  c.hidden=!abrir; b.setAttribute("aria-expanded",String(abrir));
  b.classList.remove("abraza"); void b.offsetWidth; if(abrir) b.classList.add("abraza"); /* reinicia el apretón */
};
$("porQueOk").onclick=()=>$("porQue").click();
/* Pantallas completas (Modo calma, Respiración, Un rato contigo, Después de una discusión, Modo ganas, PIN): mientras una está abierta, la barra del sistema
   toma su color de fondo, así el azul de la calma llega hasta arriba sin un corte crema. Al cerrarla, vuelve el del tema. */
const pantallasCompletas=["calma","respira","rato","discusion","crave","lock"].map($).filter(Boolean);
function colorBarra(){
  const abierta=pantallasCompletas.find(el=>!el.hidden);
  if(!abierta){ aplicarTema(); return; }
  const fondo=getComputedStyle(abierta).getPropertyValue("--bg").trim();
  if(fondo) document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{ m.content=fondo; });
}
const vigiaPantallas=new MutationObserver(colorBarra);
pantallasCompletas.forEach(el=>vigiaPantallas.observe(el,{attributes:true,attributeFilter:["hidden"]}));

/* ---------- Primeros pasos (una sola vez) ---------- */
function renderTour(){ $("tour").hidden=!S.day0||!!S.tourVisto; }
$("tourOk").onclick=()=>{ S.tourVisto=true; save(); renderTour(); };
/* Historial de cambios: todas las novedades, de la más nueva a la más vieja, plegadas en Ayuda > Acerca de esta app.
   Ya no aparecen como tarjeta en Hoy: a quien usa la app no le interesan, y quien quiera verlas las busca ahí. */
const NOVEDADES=window.NOVEDADES||[];
function renderNovedades(){
  $("historialCambios").innerHTML=NOVEDADES.map(n=>`<h3 style="margin-top:12px">${esc(n.titulo)}</h3><ul class="small">${n.cambios.map(c=>"<li>"+esc(c)+"</li>").join("")}</ul>`).join("");
}

/* ---------- Configuración ---------- */
function fillConfig(){
  const sel=$("cfgSust"); sel.innerHTML=SUST.map(s=>`<option value="${s.id}">${esc(s.nombre)}</option>`).join(""); sel.value=S.sustancia;
  $("cfgModo").value=S.modo; $("cfgMeta").value=S.metaSemana; $("cfgTema").value=S.tema||"auto"; $("cfgGanas").value=S.ganasMin||15; $("cfgMetaWrap").hidden=S.modo!=="reducir";
  /* En la bienvenida no viene ninguna elegida: la app es para cualquier sustancia, no solo una */
  const ws=$("welcomeSust"), elegida=ws.value; ws.innerHTML='<option value="">Elige una…</option>'+sel.innerHTML; ws.value=S.day0?S.sustancia:(elegida||"");
  /* El Día 0 no puede ser una fecha futura */
  $("welcomeDay0").max=$("day0").max=todayStr();
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
$("wipeAll").onclick=()=>{ const el=$("wipeAll"); if(el.dataset.c!=="1"){ el.dataset.c="1"; el.textContent="Toca de nuevo para borrar todo"; setTimeout(()=>{ el.dataset.c=""; el.textContent="Borrar todos mis datos"; },4000); return; } borrarTodoLocal(); location.reload(); };
/* Borra todo lo que la app guarda en este aparato: todas las claves que empiezan con "cd." (datos, Un rato contigo,
   preferencias, fecha de la última copia y el código de la nube). La política de privacidad promete borrarlo todo. */
function borrarTodoLocal(){
  try{ Object.keys(localStorage).filter(k=>k.startsWith("cd.")).forEach(k=>localStorage.removeItem(k)); }catch(e){}
}

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

/* Lo que viaja en una copia: el estado de la app más el historial de "Un rato contigo", que js/rato.js guarda aparte (cd.rato) */
const KEY_RATO="cd.rato";
function estadoParaCopia(){
  let rato=null; try{ rato=JSON.parse(localStorage.getItem(KEY_RATO)||"null"); }catch(e){}
  return rato?Object.assign({},S,{rato}):S;
}
/* Guardar copia: en el celular abre "Compartir" para mandarla directo a Drive, Proton u otra; si no se puede, la descarga; y si tampoco, la copia como texto */
$("guardarCopia").onclick=async()=>{
  const texto=JSON.stringify(R.crearRespaldo(estadoParaCopia()),null,1);
  const nombre=R.nombreArchivo();
  const listo=()=>{ guardarLocal(KEY_COPIA,new Date().toISOString()); pintarUltimaCopia(); };
  /* Dentro de otra página (la versión fijada en Claude) el navegador no deja descargar ni compartir.
     Claude ofrece su propia forma de guardar archivos (window.claude.use("downloads")): si está, se usa; si no, se copia como texto */
  if(window.self!==window.top){
    let descargas=null;
    try{ descargas=window.claude&&window.claude.use?await window.claude.use("downloads"):null; }catch(e){ descargas=null; }
    if(descargas){
      try{ await descargas.save({filename:nombre,data:texto}); listo(); mensaje("copiaMsg","Copia guardada ("+nombre+"). Súbela a tu nube.","ok"); return; }
      catch(e){ if(e&&e.code==="declined") return; } /* La persona dijo que no: no pasa nada. Otro error: se sigue con el texto */
    }
    copyText(texto); listo(); mensaje("copiaMsg","Copiamos tu copia como texto. Pégala en una nota o en tu correo. Para guardarla como archivo, usa la app instalada.","ok"); return;
  }
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
  const {rato,...datos}=pendiente.datos;
  S=Object.assign({},defaults,datos,{pin:S.pin}); /* El PIN de este teléfono se mantiene */
  /* El historial de "Un rato contigo" vuelve a su propio lugar, donde lo lee js/rato.js */
  if(rato&&typeof rato==="object") try{ localStorage.setItem(KEY_RATO,JSON.stringify(rato)); }catch(e){}
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
  try{ n.ultimo=await R.subirNube(n.codigo,estadoParaCopia()); guardarLocal(KEY_NUBE,n); pintarNube(); if(aviso) mensaje("nubeMsg","Respaldado.","ok"); }
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
  (window.VOZ||[]).forEach(v=>it.push({tipo:"La voz de la adicción",t:"\""+v.f+"\"",b:v.r}));
  (window.LIMITES||[]).forEach(l=>it.push({tipo:"Poner límites",t:l.s,b:l.f.map(f=>"\""+f+"\"").join(" ")+" "+l.por}));
  (window.DISCUSION_SENTIR||[]).forEach(d=>it.push({tipo:"Después de una discusión",t:d.t,b:d.d,abrir:"openDiscusion"}));
  /* Las herramientas: al buscarlas aparece un botón que las abre */
  [{t:"Respirar 4-7-8",b:"Respiración para la ansiedad, las ganas, la tos nerviosa y para dormir.",abrir:"openRespira"},
   {t:"Un rato contigo",b:"Practicar estar a solas con el aburrimiento y la soledad, sin celular ni nada que hacer. Para los tiempos muertos.",abrir:"openRato"},
   {t:"Después de una discusión",b:"Para el rato después de una pelea con la familia, la pareja o alguien cercano. Si hubo violencia: 133, 149 y 1455.",abrir:"openDiscusion"},
   {t:"Modo ganas",b:"Cuando tienes ganas de consumir: un reloj para que la ola baje, tus razones y qué hacer mientras.",abrir:"openCrave"},
   {t:"Modo calma",b:"Si te sientes paranoico o raro después de consumir: acompañamiento para bajar.",abrir:"openCalma"},
   {t:"Una carta que no se envía",b:"Escribir lo que no le dijiste a alguien de tu familia o a una pareja. Queda solo en tu teléfono.",abrir:"cartaCard"}
  ].forEach(h=>it.push(Object.assign({tipo:"Herramienta"},h)));
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
  out.innerHTML=r.length?r.map(z=>`<div class="res"><div class="row" style="justify-content:space-between"><b class="small">${esc(z.x.t)}</b><span class="pill">${esc(z.x.tipo)}</span></div><p class="small">${resaltar(z.x.b,q)}</p>${z.x.abrir?`<button class="ghost small" type="button" data-abrir="${esc(z.x.abrir)}">Abrir</button>`:""}</div>`).join("")+`<p class="small muted">${r.length} resultados${r.length===12?" (los más relevantes)":""}. Las secciones completas están más abajo.</p>`:`<p class="small muted">Nada con "${esc($("buscar").value.trim())}". Prueba con otra palabra.</p>`;
};

/* "Abrir" en un resultado de búsqueda: toca el botón de esa herramienta; la carta está en Registro, así que va hasta allá */
$("buscarOut").addEventListener("click",e=>{
  const b=e.target.closest("[data-abrir]"); if(!b) return;
  const id=b.dataset.abrir;
  if(id==="cartaCard"){ irA("registro"); setTimeout(()=>{ $("cartaCard").scrollIntoView({behavior:"smooth",block:"start"}); $("cartaTexto").focus({preventScroll:true}); },80); return; }
  const el=$(id); if(el) el.click();
});

/* ---------- Diagnóstico para reportar problemas (sin datos personales) ---------- */
const VERSION_APP="2026.10.18";
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
/* ---------- Hora de salida ---------- */
/* La tarjeta aparece cerca de la hora en que la persona sale del trabajo o de clases (C.momentoSalida decide cuándo).
   Las respuestas valen solo por hoy: al día siguiente las preguntas aparecen vacías otra vez. */
const CAMPOS_SALIDA={ vuelta:"salidaVuelta", comida:"salidaComida", dormir:"salidaDormir" };
let fechaSalida=null; /* la fecha de la salida que muestra la tarjeta ahora (la pone renderSalida) */
function renderSalida(){
  /* Configuración (en "Mi plan para la hora difícil") */
  if(document.activeElement!==$("salidaHora")) $("salidaHora").value=S.salidaHora||"";
  $("salidaDias").querySelectorAll("input").forEach(i=>{ i.checked=(S.salidaDias||[]).includes(Number(i.dataset.dia)); });
  /* La tarjeta de Hoy */
  const ahora=new Date(), m=C.momentoSalida(ahora,S.salidaHora,S.salidaDias);
  $("salidaCard").hidden=!m.mostrar;
  if(!m.mostrar) return;
  /* Las respuestas se guardan con la fecha del día de la salida (si la tarjeta pasó la medianoche, sigue siendo la de ayer) */
  const dia=new Date(ahora); dia.setDate(ahora.getDate()+m.desfase); fechaSalida=C.fechaTexto(dia);
  $("salidaTitulo").textContent=m.viernes?"Es viernes: tu hora de salida":"Tu hora de salida";
  $("salidaIntro").textContent=m.viernes
    ?"Los viernes suelen ser más intensos. Tres respuestas cortas, y nada más."
    :"Tres respuestas cortas para ordenar la vuelta a casa, y nada más.";
  if(!S.salidaPlan||S.salidaPlan.fecha!==fechaSalida) S.salidaPlan={fecha:fechaSalida,vuelta:"",comida:"",dormir:""};
  /* Si la persona está escribiendo en un campo, no le pisamos el texto */
  for(const k in CAMPOS_SALIDA){ const el=$(CAMPOS_SALIDA[k]); if(document.activeElement!==el) el.value=S.salidaPlan[k]||""; }
}
/* Cada respuesta se guarda sola mientras se escribe */
for(const k in CAMPOS_SALIDA){
  $(CAMPOS_SALIDA[k]).addEventListener("input",e=>{
    if(!S.salidaPlan||S.salidaPlan.fecha!==fechaSalida) S.salidaPlan={fecha:fechaSalida,vuelta:"",comida:"",dormir:""};
    S.salidaPlan[k]=e.target.value.slice(0,120); save();
  });
}
$("salidaHora").onchange=()=>{ S.salidaHora=$("salidaHora").value||null; save(); renderSalida(); if(S.salidaHora) toast("Hora de salida guardada"); };
$("salidaQuitar").onclick=()=>{ S.salidaHora=null; save(); renderSalida(); toast("Hora de salida quitada"); };
$("salidaDias").querySelectorAll("input").forEach(i=>i.onchange=()=>{
  S.salidaDias=[...$("salidaDias").querySelectorAll("input:checked")].map(x=>Number(x.dataset.dia)); save(); renderSalida();
});
$("salidaRato").onclick=()=>$("openRato").click();
/* Si la app queda abierta, revisa cada minuto si ya es la hora de mostrar (o esconder) la tarjeta */
setInterval(renderSalida,60000);

/* ---------- ¿Cómo te fue el viernes? ---------- */
/* Los sábados en la mañana (C.mananaSabado), una sola pregunta sobre el viernes. Sin puntaje y sin culpa:
   si la respuesta es "Consumí", no se reinicia nada solo; la persona decide si reinicia su Día 0. */
const RESPUESTA_VIERNES={
  bien:"Qué bueno. Un viernes más a tu favor: nota qué hiciste distinto, porque eso es lo que funciona.",
  costo:"Pasar un viernes difícil sin consumir es un logro grande. Lo que hiciste funcionó: guárdalo para el próximo.",
  consumi:"Gracias por contarlo. Un viernes no borra los días anteriores: tu cerebro los vivió igual. Si quieres, reinicia tu Día 0 más abajo, sin apuro, y mira la tarjeta de las próximas 48 horas."
};
/* En modo reducir la meta no es cero: los textos hablan de la meta, no de no consumir */
const RESPUESTA_VIERNES_REDUCIR={
  bien:RESPUESTA_VIERNES.bien,
  costo:"Pasar un viernes difícil cuidando tu meta es un logro grande. Lo que hiciste funcionó: guárdalo para el próximo.",
  consumi:"Gracias por contarlo. Un viernes no borra lo que avanzaste. Mira cómo va tu semana en Hoy y vuelve a tu meta desde hoy, sin culpa."
};
function renderViernes(){
  const card=$("viernesCard");
  card.hidden=!S.day0||!C.mananaSabado(new Date());
  if(card.hidden) return;
  const r=S.viernesRespuesta&&S.viernesRespuesta.fecha===todayStr()?S.viernesRespuesta.como:null;
  /* aria-pressed: el lector de pantalla anuncia cuál está elegida */
  card.querySelectorAll("[data-viernes]").forEach(b=>{ b.classList.toggle("on",b.dataset.viernes===r); b.setAttribute("aria-pressed",String(b.dataset.viernes===r)); });
  const reducir=S.modo==="reducir";
  card.querySelector('[data-viernes="consumi"]').textContent=reducir?"Me pasé de mi meta":"Consumí";
  $("viernesRespuesta").textContent=r?(reducir?RESPUESTA_VIERNES_REDUCIR:RESPUESTA_VIERNES)[r]:"";
}
$("viernesCard").querySelectorAll("[data-viernes]").forEach(b=>b.onclick=()=>{
  S.viernesRespuesta={ fecha:todayStr(), como:b.dataset.viernes }; save(); renderViernes();
});
setInterval(renderViernes,60000);

$("savePlan").onclick=()=>{ clearTimeout(planT); S.plan=$("planText").value.trim(); save(); $("planText").blur(); renderPlan(); toast("Plan guardado"); };
/* El plan también se guarda solo mientras escribes (medio segundo después de la última letra) */
let planT;
$("planText").addEventListener("input",()=>{ clearTimeout(planT); planT=setTimeout(()=>{ S.plan=$("planText").value.trim(); save(); },500); });
$("welcomeGo").onclick=()=>{
  /* Solo para mayores de 18: sin juzgar, y dejando una vía de ayuda a quien es menor */
  if(!$("welcomeEdad").checked){ mensaje("welcomeEdadMsg","Esta app es para personas de 18 años o más. Si eres menor y necesitas hablar con alguien, llama gratis y anónimo al 1412 o conversa con un adulto de confianza.","no"); return; }
  if(!$("welcomeSust").value){ mensaje("welcomeEdadMsg","Elige qué quieres dejar o reducir. Puedes cambiarlo después.","no"); return; }
  S.mayorEdad=true;
  const v=$("welcomeDay0").value; if(!v){ toast("Elige una fecha"); return; } if(v>todayStr()){ toast("La fecha no puede ser futura"); return; } S.day0=v; S.day0Hora=horaDia0(v); S.sustancia=$("welcomeSust").value; S.modo=$("welcomeModo").value; save(); aplicarTema(); fillConfig(); renderHoy(); renderRegistro(); renderSust(); toast("Empezamos a contar desde ahí."); };

/* ---------- Check-in diario (sueño y ánimo) ---------- */
function todayCheckin(){ const t=todayStr(); return S.events.find(e=>e.type==="checkin"&&todayStrDe(e.ts)===t); }
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
$("saveDay0").onclick=()=>{ if($("day0").value>todayStr()){ toast("La fecha no puede ser futura"); return; } S.day0=$("day0").value||null; S.day0Hora=S.day0?horaDia0(S.day0):null; save(); renderHoy(); renderRegistro(); toast("Día 0 guardado"); };
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
$("addRelapse").onclick=()=>{ const el=$("addRelapse"); if(el.dataset.confirm!=="1"){ el.dataset.confirm="1"; el.textContent="Toca de nuevo para confirmar"; setTimeout(()=>{ el.dataset.confirm=""; el.textContent="Registrar consumo"; },4000); return; } el.dataset.confirm=""; el.textContent="Registrar consumo"; registerRelapse($("cDid").value.trim(),$("cTrig").value); $("cDid").value=""; };
/* trig: el gatillante, solo si la persona lo eligió (en Registro). Desde Hoy o el Modo ganas va vacío, para no inventar uno. */
function registerRelapse(note,trig){
  /* Antes de mover el Día 0 a hoy, guarda el más antiguo: así los días limpios anteriores siguen contando */
  if(S.day0&&(!S.inicio||S.day0<S.inicio)) S.inicio=S.day0;
  addEvent("relapse",{did:note||"",trig:trig||""}); S.day0=todayStr(); S.day0Hora=new Date().toISOString(); save(); renderHoy(); renderRegistro(); toast("Día 0 reiniciado. Una púa no borra lo que avanzaste."); }
function renderRegistro(){
  const days=[]; const now=new Date(); now.setHours(12,0,0,0);
  for(let i=13;i>=0;i--){ const d=new Date(now); d.setDate(d.getDate()-i); days.push({k:dstr(d),c:0,r:false,label:d.toLocaleDateString("es-CL",{day:"numeric",month:"short"})}); }
  S.events.forEach(e=>{ const k=todayStrDe(e.ts); const d=days.find(x=>x.k===k); if(!d) return; if(e.type==="crave") d.c++; if(e.type==="relapse") d.r=true; });
  const max=Math.max(1,...days.map(d=>d.c));
  $("chart").innerHTML=days.map(d=>`<div class="${d.r?"r":""}" style="height:${d.r?100:Math.max(d.c?8:2,d.c/max*100)}%" ${d.c||d.r?`data-n="${d.r?"C":d.c}"`:""} title="${d.label}"></div>`).join("");
  $("axisFrom").textContent=days[0].label; $("axisTo").textContent=days[13].label;
  $("log").innerHTML=S.events.length?S.events.slice(0,60).map(e=>{ const t=new Date(e.ts); return `<div class="e"><time>${t.toLocaleDateString("es-CL",{day:"2-digit",month:"2-digit"})} ${t.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</time><div><span class="pill ${e.type==="relapse"?"bad":e.type==="win"?"good":""}">${e.type==="relapse"?"consumo":e.type==="win"?"ola superada":e.type==="checkin"?"dormí "+e.sueno+" h · ánimo "+e.animo+"/5":e.type==="calma"?"modo calma":e.type==="discusion"?"después de una discusión":"ganas "+e.i+"/10"}</span>${e.trig?" · "+esc(e.trig):""}${e.did?"<br>"+esc(e.did):""}</div></div>`; }).join(""):`<p class="small muted">Nada todavía. Lo primero que anotes empieza a mostrar tu patrón.</p>`;
  renderPatterns();
  renderCal();
  renderCartas();
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
  /* Discusiones y consumo: solo aparece si hay discusiones y consumos anotados. Sin juicio: es un dato para cuidarse */
  const dc=C.consumosTrasDiscusion(S.events,24);
  let discusionTxt="";
  if(dc.discusiones&&dc.consumos) discusionTxt=dc.tras
    ?`<li>De tus <b>${dc.consumos}</b> consumos, <b>${dc.tras}</b> ${dc.tras===1?"pasó":"pasaron"} dentro de las 24 horas después de una discusión o un tema familiar. Para ti es un momento de riesgo: en Hoy está "Después de una discusión" para ese rato.</li>`
    :`<li>Ninguno de tus consumos pasó en las 24 horas después de una discusión. Lo que haces en esos momentos te está sirviendo.</li>`;
  $("patterns").innerHTML=`<ul><li>Tu gatillante más frecuente: <b>${esc(topTrig[0])}</b> (${topTrig[1]} veces).</li><li>La hora en que más te llegan las ganas: <b>alrededor de las ${peak}:00</b>. Ten un plan para esa hora.</li><li>Intensidad promedio de las ganas: <b>${avgInt}/10</b>.</li><li>Olas superadas sin consumir: <b>${wins}</b>. Consumos registrados: <b>${rel}</b>.</li>${suenoTxt}${discusionTxt}</ul>`;
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
function tick(){ const m=String(Math.floor(left/60)).padStart(2,"0"), s=String(left%60).padStart(2,"0"); $("timer").textContent=m+":"+s; $("barFill").style.width=((TOTAL-left)/TOTAL*100)+"%";
  /* La ola se ve bajar: --calma va de 0 a 1 con el reloj, y el CSS pasa el círculo del naranjo al azul de la calma (#crave .breath) */
  $("crave").style.setProperty("--calma",((TOTAL-left)/TOTAL).toFixed(3)); }
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

/* ---------- Después de una discusión ---------- */
/* Pantalla para el rato justo después de una pelea con la familia, la pareja o alguien cercano (#discusion en index.html).
   Al abrirla queda anotada en el historial; si la persona elige qué siente, eso se suma a la misma anotación. */
const SENTIR=window.DISCUSION_SENTIR||[];
let discusionEvento=null; /* la anotación de esta vez, para sumarle la emoción elegida */
$("discusionSentir").innerHTML=SENTIR.map(x=>`<button type="button" class="chip" data-sentir="${esc(x.id)}" aria-pressed="false">${esc(x.t)}</button>`).join("");
$("discusionSentir").querySelectorAll("[data-sentir]").forEach(b=>b.onclick=()=>{
  const x=SENTIR.find(y=>y.id===b.dataset.sentir); if(!x) return;
  $("discusionSentir").querySelectorAll("[data-sentir]").forEach(o=>{ o.classList.toggle("on",o===b); o.setAttribute("aria-pressed",String(o===b)); });
  $("discusionRespuesta").textContent=x.d;
  if(discusionEvento){ discusionEvento.did="Sentía: "+x.t.toLowerCase(); save(); }
});
$("openDiscusion").onclick=()=>{
  /* Cada vez parte limpia: sin emoción elegida */
  $("discusionSentir").querySelectorAll("[data-sentir]").forEach(o=>{ o.classList.remove("on"); o.setAttribute("aria-pressed","false"); });
  $("discusionRespuesta").textContent="";
  addEvent("discusion",{}); discusionEvento=S.events[0];
  $("discusion").hidden=false; document.body.style.overflow="hidden"; $("discusion").scrollTop=0;
};
$("discusionCerrar").onclick=()=>{
  $("discusion").hidden=true; discusionEvento=null;
  if(!document.querySelector(".crave:not([hidden])")) document.body.style.overflow="";
  renderRegistro();
};

/* ---------- Frases para poner límites ---------- */
/* Se muestran en Saber y en "Después de una discusión": toda caja con la clase limites-lista recibe la lista (datos/limites.js) */
function renderLimites(){
  const L=window.LIMITES||[];
  const html=L.map(x=>`<details class="voz"><summary>${esc(x.s)}</summary>${x.f.map(f=>`<p class="limite-frase">"${esc(f)}"</p>`).join("")}<p class="small muted">${esc(x.por)}</p></details>`).join("");
  document.querySelectorAll(".limites-lista").forEach(el=>{ el.innerHTML=html; });
}
renderLimites();

/* ---------- Una carta que no se envía ---------- */
/* Se escribe en Registro. Lo escrito se guarda solo mientras se escribe (borrador); "Guardar" la pasa a la lista,
   "Soltarla" la borra sin guardarla. Todo vive en el estado de la app (cd.v1): viaja en la copia y "Borrar todo" lo borra. */
const fechaCarta=f=>new Date(f+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"long",year:"numeric"});
function renderCartas(){
  const b=S.cartaBorrador||{};
  if(document.activeElement!==$("cartaPara")) $("cartaPara").value=b.para||"";
  if(document.activeElement!==$("cartaTexto")) $("cartaTexto").value=b.texto||"";
  const C2=S.cartas||[];
  $("cartasGuardadas").hidden=!C2.length;
  $("cartasCuenta").textContent=C2.length;
  $("cartasLista").innerHTML=C2.map(c=>`<details class="voz"><summary>${esc(c.para||"Sin destinatario")} · ${esc(fechaCarta(c.fecha))}</summary><p class="small carta-texto">${esc(c.texto)}</p><button class="ghost small" type="button" data-borrar-carta="${c.id}">Borrar esta carta</button></details>`).join("");
  $("cartasLista").querySelectorAll("[data-borrar-carta]").forEach(btn=>btn.onclick=()=>{
    /* Se pide tocar dos veces, como en "Borrar todo" */
    if(btn.dataset.c!=="1"){ btn.dataset.c="1"; btn.textContent="Toca de nuevo para borrarla"; setTimeout(()=>{ btn.dataset.c=""; btn.textContent="Borrar esta carta"; },4000); return; }
    S.cartas=(S.cartas||[]).filter(c=>String(c.id)!==btn.dataset.borrarCarta); save(); renderCartas(); toast("Carta borrada");
  });
}
["cartaPara","cartaTexto"].forEach(id=>$(id).addEventListener("input",()=>{
  S.cartaBorrador={ para:$("cartaPara").value.slice(0,60), texto:$("cartaTexto").value.slice(0,5000) }; save();
}));
$("cartaGuardar").onclick=()=>{
  const texto=$("cartaTexto").value.trim();
  if(!texto){ mensaje("cartaMsg","Escribe algo primero. No tiene que estar bien escrito.","no"); return; }
  S.cartas=[{ id:Date.now(), fecha:todayStr(), para:$("cartaPara").value.trim().slice(0,60), texto:texto.slice(0,5000) }].concat(S.cartas||[]);
  S.cartaBorrador={para:"",texto:""}; save();
  $("cartaPara").value=""; $("cartaTexto").value="";
  renderCartas(); mensaje("cartaMsg","Guardada solo en tu teléfono. Nadie más la va a leer.","ok");
};
$("cartaSoltar").onclick=()=>{
  const habia=$("cartaTexto").value.trim();
  S.cartaBorrador={para:"",texto:""}; save();
  $("cartaPara").value=""; $("cartaTexto").value="";
  mensaje("cartaMsg",habia?"La soltaste. No quedó guardada en ninguna parte.":"No había nada escrito.","");
};
/* Desde "Después de una discusión": cierra esa pantalla y lleva a la carta */
$("discusionCarta").onclick=()=>{
  $("discusionCerrar").click(); irA("registro");
  setTimeout(()=>{ $("cartaCard").scrollIntoView({behavior:"smooth",block:"start"}); $("cartaTexto").focus({preventScroll:true}); },80);
};

/* ---------- Atajos de la pestaña Noche ---------- */
$("nocheCalma").onclick=()=>$("openCalma").click();
$("nocheGanas").onclick=()=>$("openCrave").click();
$("nocheAuxilios").onclick=()=>{ irA("ayuda"); setTimeout(()=>{ const el=$("paList"); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); },50); };
$("nocheCheckin").onclick=()=>{ irA("hoy"); setTimeout(()=>{ const d=$("checkinForm").closest("details"); if(d) d.open=true; $("checkinForm").closest("details").scrollIntoView({behavior:"smooth",block:"start"}); },50); };
$("nocheRegistro").onclick=()=>{ irA("registro"); setTimeout(()=>{ $("cInt").scrollIntoView({behavior:"smooth",block:"center"}); },50); };

/* ---------- Cuenta tu historia ---------- */
/* Historias de la gente, revisadas antes de publicarse (datos/cuentan.js). El formulario anónimo se abre afuera de la app. */
function renderCuentan(){
  const d=window.CUENTAN||{formulario:"",historias:[]};
  const hay=/^https:\/\//.test(d.formulario||"");
  $("cuentanBotones").hidden=!hay; $("cuentanProximo").hidden=hay;
  if(hay){ $("cuentanContar").href=d.formulario; $("cuentanCelebrar").href=d.formulario; }
  $("cuentanLista").innerHTML=(d.historias||[]).map(h=>`<details class="historia"><summary><b>${esc(h.titulo)}</b><span class="pill${h.tema==="celebrar"?" good":""}">${h.tipo==="real"?"Historia real, enviada de forma anónima":"Ficción inspirada en situaciones comunes"}</span></summary><p class="small">${esc(h.texto).replace(/\n\n/g,"</p><p class=\"small\">")}</p></details>`).join("");
}

/* ---------- Atajos del ícono ---------- */
/* Al dejar el dedo apretado sobre el ícono aparecen "Tengo ganas", "Respirar 4-7-8" y "Modo calma" (ver "shortcuts" en manifest.json).
   Abren la app con ?ir=ganas o ?ir=calma en la dirección. Si hay PIN, la pantalla se abre después de desbloquear. */
let atajoPendiente=null;
try{ const ir=new URLSearchParams(location.search).get("ir"); if(ir==="ganas"||ir==="calma"||ir==="respira"){ atajoPendiente=ir; history.replaceState(null,"",location.pathname); } }catch(e){}
function abrirAtajo(){ if(!atajoPendiente) return; const a=atajoPendiente; atajoPendiente=null; $(a==="ganas"?"openCrave":a==="respira"?"openRespira":"openCalma").click(); }

/* ---------- Boot ---------- */
fillConfig(); renderHoy(); pickDaily(); renderFacts(); renderRegistro(); renderSust(); renderActualidad(); renderPA(); renderSenales(); renderSalir(); renderRapido(); renderOfChips(); renderNovedades(); renderCuentan(); lockIfNeeded();
/* Portada: al cactus le sale una flor con los hitos (7 días: brote, 30: abierta, 90: florecido) */
try{ const dias=S.day0?daysSince(S.day0):0, fl=dias>=90?3:dias>=30?2:dias>=7?1:0; if(fl) document.querySelector(".portada").dataset.flor=fl; }catch(e){}
/* Portada: el cactus crece con todos los días que llevas en esto (desde S.inicio, el primer Día 0). Una recaída no lo achica.
   Se agranda desde su base (231, 342 en el dibujo), así queda parado en el suelo y el salchicha lo sigue abrazando. */
try{ const t=C.tamanoCactus(daysSince(S.inicio||S.day0)), crece=`translate(231 342) scale(${t}) translate(-231 -342)`;
  $("cactusCrece").setAttribute("transform",crece); $("corazonCrece").setAttribute("transform",crece); /* su corazón baja o sube con él */
  /* Los brazos se acortan con el cactus para que terminen justo en su borde: el borde está en 231 + 36 × tamaño, el hombro en 160 */
  $("brazosCrecen").setAttribute("transform",`translate(160 0) scale(${(71+36*t)/106} 1) translate(-160 0)`); }catch(e){}
/* Portada: a veces (una de cada tres veces que se abre la app) el cactus dice algo, y la portada dura un poco más para leerlo */
try{ if(Math.random()<0.34){ const F=["Gracias por no soltarme.","Sigo aquí contigo.","Aunque pinche, me quedo.","Un día más, juntos.","Tu paciencia también me cura.","Me gusta cuando vuelves."]; $("portadaGlobo").textContent=F[Math.floor(Math.random()*F.length)]; $("portadaGlobo").hidden=false; document.querySelector(".portada").classList.add("habla"); } }catch(e){}
/* El atajo se abre cuando terminó de cargar toda la página: la respiración vive en js/respira.js, que carga después de este archivo */
if(!S.pin){ if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",abrirAtajo); else abrirAtajo(); }
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
})();
