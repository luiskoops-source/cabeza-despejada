/* Lógica de Cabeza Despejada. Secciones marcadas con /* ---------- */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const KEY="cd.v1";
const defaults={
  day0:null, spendWeek:60000, salary:null,
  reasons:[
    "Sobrio trabajo bien y me lo han dicho: Tamara y Javi reconocieron mi desempeño. Consumiendo trabajo lento y me duermo.",
    "Ahora la psicosis llega casi de inmediato y cada vez es peor. No quiero llegar a algo que no se pueda devolver.",
    "Mi autoestima y mi amor propio. Ninguna otra cosa me los ha dañado tanto.",
    "Mi papá. Prefiero pasarle plata a él que al proveedor.",
    "Quiero volver a sentir gusto por vivir. Eso solo vuelve con tiempo limpio.",
    "Quiero volver a tener vida social y pareja sin esconder nada."
  ],
  events:[], seenFacts:[], customFacts:[], dailyIdx:null, dailyDate:null, dailyAI:null, craveWins:0
};
let S=load();
function load(){ try{ const r=localStorage.getItem(KEY); if(r){ return Object.assign({},defaults,JSON.parse(r)); } }catch(e){} return Object.assign({},defaults); }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
function toast(t){ const el=$("toast"); el.textContent=t; el.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),2200); }
const clp=n=>"$"+Math.round(n).toLocaleString("es-CL");
const dstr=d=>d.toISOString().slice(0,10);
const todayStr=()=>{ const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); };
function daysSince(iso){ if(!iso) return 0; const a=new Date(iso+"T12:00:00"); const b=new Date(); b.setHours(12,0,0,0); return Math.max(0,Math.round((b-a)/86400000)); }

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
  const perDay=(S.spendWeek||0)/7;
  const saved=perDay*d;
  $("saved").textContent=clp(saved);
  $("savedMonth").textContent=clp(perDay*30);
  $("savedYear").textContent=clp(perDay*365);
  if(S.salary){ const hour=S.salary/180; $("savedHours").textContent=Math.round(saved/hour)+" h"; } else { $("savedHours").textContent="—"; }
  renderReasons();
}
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
function pickDaily(){
  const t=todayStr();
  if(S.dailyDate!==t||S.dailyIdx==null){ S.dailyIdx=Math.floor(Math.random()*FACTS.length); S.dailyDate=t; S.dailyAI=null; save(); }
  showDaily();
}
function showDaily(){
  if(S.dailyAI){ $("dailyTitle").textContent=S.dailyAI.t; $("dailyBody").textContent=S.dailyAI.b; $("dailyPill").textContent="nuevo, de hoy"; $("dailyPill").className="pill warm"; $("dailyFact").classList.add("new"); }
  else { const f=FACTS[S.dailyIdx%FACTS.length]; $("dailyTitle").textContent=f.t; $("dailyBody").textContent=f.b; $("dailyPill").textContent="de la base"; $("dailyPill").className="pill"; $("dailyFact").classList.remove("new"); }
}
$("dailyNext").onclick=()=>{ S.dailyAI=null; S.dailyIdx=(S.dailyIdx+1+Math.floor(Math.random()*(FACTS.length-1)))%FACTS.length; save(); showDaily(); };

/* ---------- Claude (sample) ---------- */
let sample=null;
const RULES=`Eres parte de una app privada de apoyo para una persona adulta en Chile que está dejando la cocaína. Hablas en español neutro, cercano, directo, sin moralizar y sin frases hechas. Nunca das instrucciones de dosis, mezclas, formas de consumo ni de conseguir droga. Nunca sugieres que un consumo "controlado" sea opción. Si la persona describe dolor al pecho, convulsiones o riesgo de muerte, le dices que llame al 131 (emergencias Chile). Siempre puedes recordar que el fono 1412 de SENDA es gratuito, anónimo y 24 horas.`;
function knownTitles(){ return FACTS.map(f=>f.t).concat(S.customFacts.map(f=>f.t)); }
function factPrompt(topic){
  return RULES+`

Tarea: explica UN efecto negativo del consumo de cocaína que NO esté en esta lista de temas ya cubiertos:
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

/* craving chat */
let craveTurns=[];
$("craveAsk").onclick=async()=>{
  const msg=$("craveMsg").value.trim(); if(!msg) return;
  if(!sample){ $("craveReply").textContent="Claude no está disponible aquí. Llama al 1412: es gratis y contestan al tiro."; return; }
  craveTurns.push({role:"user",content:msg}); $("craveMsg").value="";
  const ctl=new AbortController(); $("craveStop").hidden=false; $("craveAsk").disabled=true; $("craveStop").onclick=()=>ctl.abort();
  $("craveReply").textContent="Pensando...";
  const ctx=`${RULES}

Contexto: la persona está AHORA MISMO con ganas intensas de consumir y abrió el modo de emergencia de la app. Lleva ${daysSince(S.day0)} días sin consumir. Sus propias razones para no consumir: ${S.reasons.join(" | ")}. Sus gatillantes conocidos: tiempo libre, cosas fuera de su control, cuando todo va bien le dan ganas de generar caos, falta de sueño. Lo que le ha servido antes: fumar cigarro, ver teleserie, dormir, trabajar, borrar el contacto, darle plata a su papá.

Responde en máximo 5 frases cortas. Primero reconoce lo que dice, después UNA acción concreta para los próximos 10 minutos, y recuérdale que la ola baja sola. Sin listas, sin negritas, sin sermones.`;
  try{
    const r=await sample([{role:"user",content:ctx},...craveTurns.slice(-8)],{cache:false,signal:ctl.signal,modelTier:"quick",onText:({text})=>{ $("craveReply").textContent=text; }});
    craveTurns.push({role:"assistant",content:r.text});
  }catch(e){ if(e&&e.code!=="cancelled") $("craveReply").textContent=(e.text||"")+(e.text?"\n\n":"")+aiError(e); }
  finally{ $("craveStop").hidden=true; $("craveAsk").disabled=false; }
};

/* ---------- Facts list ---------- */
let cat="todo";
document.querySelectorAll(".catBtn").forEach(b=>b.onclick=()=>{ cat=b.dataset.cat; document.querySelectorAll(".catBtn").forEach(x=>x.classList.toggle("primary",x===b)); renderFacts(); });
function renderFacts(){
  const all=S.customFacts.concat(FACTS);
  $("factCount").textContent=all.length+" temas";
  const list=all.filter(f=>cat==="todo"||f.c===cat);
  $("factList").innerHTML=list.length?list.map(f=>`<div class="fact ${f.c==="nuevo"?"new":""}"><div class="row" style="justify-content:space-between"><h3>${esc(f.t)}</h3>${f.c==="nuevo"?`<span class="pill warm">${esc(f.d||"")}</span>`:""}</div><p class="small">${esc(f.b)}</p></div>`).join(""):`<p class="small muted">Todavía no has pedido nada. Usa el botón de arriba.</p>`;
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
  $("log").innerHTML=S.events.length?S.events.slice(0,60).map(e=>{ const t=new Date(e.ts); return `<div class="e"><time>${t.toLocaleDateString("es-CL",{day:"2-digit",month:"2-digit"})} ${t.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</time><div><span class="pill ${e.type==="relapse"?"bad":e.type==="win"?"good":""}">${e.type==="relapse"?"consumo":e.type==="win"?"ola superada":"ganas "+e.i+"/10"}</span>${e.trig?" · "+esc(e.trig):""}${e.did?"<br>"+esc(e.did):""}</div></div>`; }).join(""):`<p class="small muted">Nada todavía. Lo primero que anotes empieza a mostrar tu patrón.</p>`;
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
  $("patterns").innerHTML=`<ul><li>Tu gatillante más frecuente: <b>${esc(topTrig[0])}</b> (${topTrig[1]} veces).</li><li>La hora en que más te llegan las ganas: <b>alrededor de las ${peak}:00</b>. Ten un plan para esa hora.</li><li>Intensidad promedio de las ganas: <b>${avgInt}/10</b>.</li><li>Olas superadas sin consumir: <b>${wins}</b>. Consumos registrados: <b>${rel}</b>.</li></ul>`;
}
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
renderHoy(); pickDaily(); renderFacts(); renderRegistro();
(async()=>{
  try{ sample=window.claude&&window.claude.use?await window.claude.use("sample"):null; }catch(e){ sample=null; }
  if(!sample){ $("aiState").textContent="no disponible"; $("dailyNew").disabled=true; $("aiAsk").disabled=true; $("craveAiCard").hidden=true; }
  else { $("aiState").textContent="listo"; }
})();
})();
