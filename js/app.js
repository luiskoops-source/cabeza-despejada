/* Lógica de Cabeza Despejada. Secciones marcadas con /* ---------- */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const KEY="cd.v1";
const defaults={
  day0:null, spendWeek:60000, salary:null,
  /* Razones de ejemplo. Cada persona las reemplaza por las suyas en la pantalla Hoy. */
  reasons:[
    "Quiero volver a sentir gusto por las cosas normales.",
    "Sobrio trabajo mejor y duermo de verdad.",
    "Prefiero que mi plata termine en mi casa, no en el proveedor."
  ],
  plan:"", planHour:null,
  /* Configuración: sustancia principal, modo ("dejar" o "reducir"), meta semanal en modo reducir, PIN opcional */
  sustancia:"cocaina", modo:"dejar", metaSemana:2, pin:"",
  celebrado:0, pledgeDate:null, rapidoDate:null, rapidoCount:0, rapidoSeen:[], quizDate:null, quizIdx:null, quizDone:false, quizStreak:0, quizBest:0,
  events:[], seenFacts:[], customFacts:[], dailyIdx:null, dailyDate:null, dailyAI:null, craveWins:0
};
const SUST=window.SUSTANCIAS||[];
function sustActual(){ return SUST.find(s=>s.id===S.sustancia)||SUST[0]; }
let S=load();
function load(){ try{ const r=localStorage.getItem(KEY); if(r){ return Object.assign({},defaults,JSON.parse(r)); } }catch(e){} return Object.assign({},defaults); }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
function toast(t){ const el=$("toast"); el.textContent=t; el.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),2200); }
/* Los cálculos viven en js/calculos.js; aquí solo les ponemos nombres cortos. */
const C=window.Calculos;
const clp=C.pesos;
const dstr=C.fechaTexto;
const todayStr=()=>C.fechaTexto(new Date());
const daysSince=iso=>C.diasDesde(iso);

/* ---------- Facts base ---------- */
/* FACTS viene de datos/hechos.js */

/* ---------- Tabs ---------- */
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
  renderLive(); renderPledge(); renderSolo();
  checkCelebra(d);
  renderQuiz();
  renderReduccion();
  /* Bienvenida: se muestra solo hasta que la persona marca su Día 0 */
  $("welcome").hidden=!!S.day0;
  $("sustName").textContent=sustActual().nombre.toLowerCase();
}

/* ---------- Contador en vivo (horas:minutos:segundos desde el Día 0) ---------- */
function renderLive(){
  if(!S.day0){ $("liveTime").textContent=""; return; }
  const ms=Date.now()-new Date(S.day0+"T00:00:00").getTime(); if(ms<0){ $("liveTime").textContent=""; return; }
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

/* ---------- Hitos ---------- */
function renderHitos(d){
  const h=C.hitos(d);
  $("hitoRow").innerHTML=C.HITOS.map(x=>`<span class="hito ${d>=x?"on":""}" title="${x} días">${x}</span>`).join("");
  $("hitoText").textContent=h.proximo?(h.ultimo?`Último hito: ${h.ultimo} días. `:"")+`Faltan ${h.faltan} para los ${h.proximo}.`:"Pasaste todos los hitos. Ahora cada día es tuyo.";
}

/* ---------- Celebración de hito ---------- */
const FRASES={1:"Un día entero. El primero siempre es el más difícil.",3:"Tres días. Lo peor del cuerpo ya va pasando.",7:"Una semana. Ya tienes un patrón nuevo.",14:"Dos semanas. El sueño empieza a volver a la normalidad.",30:"Un mes. Mucha gente dice que aquí empieza a volver el color.",60:"Dos meses. Tu cerebro ya fabricó receptores nuevos.",90:"Tres meses. El plazo que la medicina marca como el más difícil ya pasó.",180:"Medio año. Esto ya no es un intento: es tu vida.",365:"Un año. Léelo de nuevo: un año.",730:"Dos años. Gracias por seguir aquí."};
function checkCelebra(d){
  const h=C.hitos(d);
  if(h.ultimo&&h.ultimo>(S.celebrado||0)&&S.modo==="dejar"){
    $("celebraTitle").textContent=h.ultimo+" días";
    $("celebraText").textContent=FRASES[h.ultimo]||"Un hito más.";
    $("celebra").hidden=false;
  } else $("celebra").hidden=true;
}
$("celebraOk").onclick=()=>{ S.celebrado=C.hitos(daysSince(S.day0)).ultimo||0; save(); $("celebra").hidden=true; };

/* ---------- Pregunta del día ---------- */
const PREG=window.PREGUNTAS||[];
function renderQuiz(){
  const t=todayStr();
  if(S.quizDate!==t){ S.quizDate=t; S.quizDone=false; S.quizIdx=Math.floor(Math.random()*PREG.length); save(); }
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

/* ---------- Configuración ---------- */
function fillConfig(){
  const sel=$("cfgSust"); sel.innerHTML=SUST.map(s=>`<option value="${s.id}">${esc(s.nombre)}</option>`).join(""); sel.value=S.sustancia;
  $("cfgModo").value=S.modo; $("cfgMeta").value=S.metaSemana; $("cfgMetaWrap").hidden=S.modo!=="reducir";
  const ws=$("welcomeSust"); ws.innerHTML=sel.innerHTML; ws.value=S.sustancia;
}
$("cfgModo").onchange=()=>{ $("cfgMetaWrap").hidden=$("cfgModo").value!=="reducir"; };
$("saveConfig").onclick=()=>{
  S.sustancia=$("cfgSust").value; S.modo=$("cfgModo").value; S.metaSemana=Math.max(0,Number($("cfgMeta").value)||0);
  save(); renderHoy(); renderSust(); toast("Configuración guardada");
};

/* ---------- PIN y privacidad ---------- */
function lockIfNeeded(){ if(S.pin){ $("lock").hidden=false; document.body.style.overflow="hidden"; $("lockPin").focus(); } }
$("lockGo").onclick=()=>{ if($("lockPin").value===S.pin){ $("lock").hidden=true; document.body.style.overflow=""; $("lockPin").value=""; $("lockMsg").textContent=""; } else { $("lockMsg").textContent="PIN incorrecto"; $("lockPin").value=""; } };
$("lockPin").onkeydown=e=>{ if(e.key==="Enter") $("lockGo").click(); };
$("savePin").onclick=()=>{ const v=$("pinNew").value.trim(); if(v&&!/^\d{4,6}$/.test(v)){ toast("El PIN debe tener 4 a 6 números"); return; } S.pin=v; save(); $("pinNew").value=""; toast(v?"PIN activado":"PIN desactivado"); };
$("wipeAll").onclick=()=>{ const el=$("wipeAll"); if(el.dataset.c!=="1"){ el.dataset.c="1"; el.textContent="Toca de nuevo para borrar todo"; setTimeout(()=>{ el.dataset.c=""; el.textContent="Borrar todos mis datos"; },4000); return; } try{ localStorage.removeItem(KEY); }catch(e){} location.reload(); };

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
  const r=C.resumenSemana(S.events,S.spendWeek);
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
  $("planText").value=S.plan||"";
  const ahora=new Date().getHours();
  const esLaHora=h!=null&&S.plan&&Math.abs(ahora-h)<=1;
  $("planNow").hidden=!esLaHora;
  if(esLaHora) $("planNowText").textContent=S.plan;
}
$("savePlan").onclick=()=>{ S.plan=$("planText").value.trim(); save(); renderPlan(); toast("Plan guardado"); };
$("welcomeGo").onclick=()=>{ const v=$("welcomeDay0").value; if(!v){ toast("Elige una fecha"); return; } S.day0=v; S.sustancia=$("welcomeSust").value; S.modo=$("welcomeModo").value; save(); fillConfig(); renderHoy(); renderRegistro(); renderSust(); toast("Empezamos a contar desde ahí."); };

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
$("saveDay0").onclick=()=>{ S.day0=$("day0").value||null; save(); renderHoy(); renderRegistro(); toast("Día 0 guardado"); };
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
function showDaily(){
  if(S.dailyAI){ $("dailyTitle").textContent=S.dailyAI.t; $("dailyBody").textContent=S.dailyAI.b; $("dailyPill").textContent="nuevo, de hoy"; $("dailyPill").className="pill warm"; $("dailyFact").classList.add("new"); }
  else { const f=FACTS[S.dailyIdx%FACTS.length]; $("dailyTitle").textContent=f.t; $("dailyBody").textContent=f.b; $("dailyPill").textContent="de la base"; $("dailyPill").className="pill"; $("dailyFact").classList.remove("new"); }
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
  $("factList").innerHTML=list.length?list.map(f=>`<div class="fact ${f.c==="nuevo"?"new":""}"><div class="row" style="justify-content:space-between"><h3>${esc(f.t)}</h3>${f.c==="nuevo"?`<span class="pill warm">${esc(f.d||"")}</span>`:(f.s?`<span class="pill">${esc(f.s==="general"?"Todas":(SUST.find(x=>x.id===f.s)||{}).nombre||"")}</span>`:"")}</div><p class="small">${esc(f.b)}</p></div>`).join(""):`<p class="small muted">Todavía no has pedido nada. Usa el botón de arriba.</p>`;
}

/* ---------- Registro ---------- */
function addEvent(type,extra){ S.events.unshift(Object.assign({type,ts:new Date().toISOString()},extra||{})); save(); }
$("addCrave").onclick=()=>{ addEvent("crave",{i:Number($("cInt").value)||5,trig:$("cTrig").value,did:$("cDid").value.trim()}); $("cDid").value=""; renderRegistro(); toast("Anotado. Eso cuenta."); };
$("addRelapse").onclick=()=>{ const el=$("addRelapse"); if(el.dataset.confirm!=="1"){ el.dataset.confirm="1"; el.textContent="Toca de nuevo para confirmar"; setTimeout(()=>{ el.dataset.confirm=""; el.textContent="Registrar consumo"; },4000); return; } el.dataset.confirm=""; el.textContent="Registrar consumo"; registerRelapse($("cDid").value.trim()); $("cDid").value=""; };
function registerRelapse(note){ addEvent("relapse",{did:note||"",trig:$("cTrig").value}); S.day0=todayStr(); save(); renderHoy(); renderRegistro(); toast("Día 0 reiniciado. Lo que aprendiste se queda."); }
function renderRegistro(){
  const days=[]; const now=new Date(); now.setHours(12,0,0,0);
  for(let i=13;i>=0;i--){ const d=new Date(now); d.setDate(d.getDate()-i); days.push({k:dstr(d),c:0,r:false,label:d.toLocaleDateString("es-CL",{day:"numeric",month:"short"})}); }
  S.events.forEach(e=>{ const k=e.ts.slice(0,10); const d=days.find(x=>x.k===k); if(!d) return; if(e.type==="crave") d.c++; if(e.type==="relapse") d.r=true; });
  const max=Math.max(1,...days.map(d=>d.c));
  $("chart").innerHTML=days.map(d=>`<div class="${d.r?"r":""}" style="height:${d.r?100:Math.max(d.c?8:2,d.c/max*100)}%" ${d.c||d.r?`data-n="${d.r?"C":d.c}"`:""} title="${d.label}"></div>`).join("");
  $("axisFrom").textContent=days[0].label; $("axisTo").textContent=days[13].label;
  $("log").innerHTML=S.events.length?S.events.slice(0,60).map(e=>{ const t=new Date(e.ts); return `<div class="e"><time>${t.toLocaleDateString("es-CL",{day:"2-digit",month:"2-digit"})} ${t.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</time><div><span class="pill ${e.type==="relapse"?"bad":e.type==="win"?"good":""}">${e.type==="relapse"?"consumo":e.type==="win"?"ola superada":e.type==="checkin"?"dormí "+e.sueno+" h · ánimo "+e.animo+"/5":"ganas "+e.i+"/10"}</span>${e.trig?" · "+esc(e.trig):""}${e.did?"<br>"+esc(e.did):""}</div></div>`; }).join(""):`<p class="small muted">Nada todavía. Lo primero que anotes empieza a mostrar tu patrón.</p>`;
  renderPatterns();
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

/* ---------- Respaldo: copiar y pegar todos los datos entre aparatos ---------- */
$("backupCopy").onclick=()=>{ copyText(JSON.stringify(S)); };
$("backupRestore").onclick=()=>{
  const raw=$("backupText").value.trim(); if(!raw) return;
  try{
    const data=JSON.parse(raw);
    if(!data||typeof data!=="object"||!Array.isArray(data.events)) throw new Error("formato");
    S=Object.assign({},defaults,data); save();
    $("backupText").value="";
    renderHoy(); renderFacts(); renderRegistro(); showDaily();
    toast("Datos restaurados");
  }catch(e){ toast("Ese texto no es un respaldo válido"); }
};
$("exportBtn").onclick=()=>{
  const txt=S.events.map(e=>`${e.ts.slice(0,16).replace("T"," ")}\t${e.type}\t${e.i||""}\t${e.trig||""}\t${e.did||""}`).join("\n");
  copyText(txt||"(sin registros)");
};

/* ---------- Copy ---------- */
function copyText(t){ try{ navigator.clipboard.writeText(t).then(()=>toast("Copiado")).catch(()=>fallback()); }catch(e){ fallback(); } function fallback(){ const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); toast("Copiado"); }catch(e){ toast("Selecciona y copia el número"); } ta.remove(); } }
document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>copyText(b.dataset.copy));

/* ---------- Craving mode ---------- */
let tInt=null, bInt=null, left=0; const TOTAL=15*60;
$("openCrave").onclick=openCrave;
function openCrave(){
  $("crave").hidden=false; document.body.style.overflow="hidden";
  left=TOTAL; tick(); clearInterval(tInt); tInt=setInterval(()=>{ left=Math.max(0,left-1); tick(); if(left===0){ clearInterval(tInt); $("craveTitle").textContent="Pasaron 15 minutos. Fíjate si bajó."; } },1000);
  let inhale=false; clearInterval(bInt); const breathe=()=>{ inhale=!inhale; $("breath").classList.toggle("in",inhale); $("breathTxt").textContent=inhale?"Inhala":"Exhala"; }; breathe(); bInt=setInterval(breathe,4000);
  craveTurns=[]; $("craveReply").textContent="";
  try{ navigator.wakeLock&&navigator.wakeLock.request("screen").catch(()=>{}); }catch(e){}
}
function tick(){ const m=String(Math.floor(left/60)).padStart(2,"0"), s=String(left%60).padStart(2,"0"); $("timer").textContent=m+":"+s; $("barFill").style.width=((TOTAL-left)/TOTAL*100)+"%"; }
function closeCrave(){ $("crave").hidden=true; document.body.style.overflow=""; clearInterval(tInt); clearInterval(bInt); $("craveTitle").textContent="Esto dura menos de lo que parece"; }
$("closeCrave").onclick=closeCrave;
$("craveWon").onclick=()=>{ S.craveWins=(S.craveWins||0)+1; addEvent("win",{i:null,trig:"",did:"Modo ganas: "+Math.round((TOTAL-left)/60)+" min"}); closeCrave(); renderHoy(); renderRegistro(); toast("Una ola más superada."); };
$("craveLost").onclick=()=>{ registerRelapse("Desde modo ganas"); closeCrave(); };

/* ---------- Boot ---------- */
fillConfig(); renderHoy(); pickDaily(); renderFacts(); renderRegistro(); renderSust(); renderActualidad(); renderPA(); renderRapido(); renderOfChips(); lockIfNeeded();
/* Cada minuto revisa si llegó la hora difícil, para mostrar el plan */
setInterval(renderPlan,60000);
/* Registra el service worker (modo sin internet). Solo funciona servido por http(s), no abierto como archivo ni dentro de claude.ai; si no se puede, no pasa nada. */
try{ if("serviceWorker" in navigator&&location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(()=>{}); }catch(e){}
(async()=>{
  try{ sample=window.claude&&window.claude.use?await window.claude.use("sample"):null; }catch(e){ sample=null; }
  if(!sample){ $("aiState").textContent="no disponible"; $("dailyNew").disabled=true; $("aiAsk").disabled=true; $("craveAiCard").hidden=true; }
  else { $("aiState").textContent="listo"; }
})();
})();
