/* Cálculos puros de Cabeza Despejada.
   "Puro" significa: reciben datos, devuelven un resultado y no tocan la pantalla.
   Por eso se pueden probar solos con Node (ver tests/pruebas.js).
   Funciona en el navegador (window.Calculos) y en Node (module.exports). */
(function(raiz){
"use strict";

/* Convierte una fecha a texto AAAA-MM-DD en hora local. */
function fechaTexto(d){
  const c=new Date(d); c.setMinutes(c.getMinutes()-c.getTimezoneOffset());
  return c.toISOString().slice(0,10);
}

/* Días completos entre el Día 0 (texto AAAA-MM-DD) y hoy. Nunca negativo. */
function diasDesde(dia0, hoy){
  if(!dia0) return 0;
  const a=new Date(dia0+"T12:00:00");
  const b=hoy?new Date(hoy+"T12:00:00"):new Date(); b.setHours(12,0,0,0);
  return Math.max(0,Math.round((b-a)/86400000));
}

/* Dinero no gastado: gasto semanal dividido en 7, por los días limpios. */
function dineroAhorrado(gastoSemana, dias){
  const porDia=(Number(gastoSemana)||0)/7;
  return { porDia, total:porDia*dias, mes:porDia*30, anio:porDia*365 };
}

/* Horas de trabajo equivalentes: ahorro dividido por el valor hora (sueldo / 180 h). */
function horasTrabajo(ahorro, sueldoMensual){
  if(!sueldoMensual) return null;
  return Math.round(ahorro/(sueldoMensual/180));
}

/* Racha más larga en días, a partir de los consumos registrados y el Día 0 actual.
   Las rachas son los tramos entre consumos, más el tramo actual. */
function rachaMasLarga(eventos, dia0, hoy){
  const consumos=eventos.filter(e=>e.type==="relapse").map(e=>e.ts.slice(0,10)).sort();
  let mejor=diasDesde(dia0,hoy);
  for(let i=1;i<consumos.length;i++){
    mejor=Math.max(mejor,diasDesde(consumos[i-1],consumos[i]));
  }
  return mejor;
}

/* Promedio de horas dormidas en los días con ganas o consumo, y en los días sin nada.
   Sirve para ver si dormir poco se relaciona con las ganas. */
function suenoVsGanas(eventos){
  const porDia={};
  eventos.forEach(e=>{
    const k=e.ts.slice(0,10);
    porDia[k]=porDia[k]||{sueno:null,ganas:false};
    if(e.type==="checkin"&&typeof e.sueno==="number") porDia[k].sueno=e.sueno;
    if(e.type==="crave"||e.type==="relapse") porDia[k].ganas=true;
  });
  const con=[],sin=[];
  Object.values(porDia).forEach(d=>{ if(d.sueno==null) return; (d.ganas?con:sin).push(d.sueno); });
  const prom=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:null;
  return { conGanas:prom(con), sinGanas:prom(sin), diasConDato:con.length+sin.length };
}

/* Hora del día (0 a 23) en que más se han registrado ganas o consumos. null si hay menos de 3 registros. */
function horaPico(eventos){
  const cr=eventos.filter(e=>e.type==="crave"||e.type==="relapse");
  if(cr.length<3) return null;
  const porHora=new Array(24).fill(0);
  cr.forEach(e=>porHora[new Date(e.ts).getHours()]++);
  let pico=0; porHora.forEach((v,i)=>{ if(v>porHora[pico]) pico=i; });
  return pico;
}

/* Resumen de los últimos 7 días: días sin consumo, olas superadas, sueño promedio y dinero no gastado. */
function resumenSemana(eventos, gastoSemana, hoy){
  const fin=hoy?new Date(hoy+"T12:00:00"):new Date(); fin.setHours(12,0,0,0);
  const dias=[]; for(let i=6;i>=0;i--){ const d=new Date(fin); d.setDate(d.getDate()-i); dias.push(fechaTexto(d)); }
  const consumos=new Set(eventos.filter(e=>e.type==="relapse").map(e=>e.ts.slice(0,10)));
  const diasLimpios=dias.filter(k=>!consumos.has(k)).length;
  const enSemana=e=>dias.includes(e.ts.slice(0,10));
  const olas=eventos.filter(e=>e.type==="win"&&enSemana(e)).length;
  const suenos=eventos.filter(e=>e.type==="checkin"&&enSemana(e)&&typeof e.sueno==="number").map(e=>e.sueno);
  const suenoProm=suenos.length?Math.round(suenos.reduce((a,b)=>a+b,0)/suenos.length*10)/10:null;
  const dinero=dineroAhorrado(gastoSemana,diasLimpios).total;
  return { diasLimpios, olas, suenoProm, dinero };
}

/* Hitos de días limpios. Devuelve el último alcanzado y el próximo, con cuánto falta. */
const HITOS=[1,3,7,14,30,60,90,180,365,730];
function hitos(dias){
  const logrados=HITOS.filter(h=>dias>=h);
  const proximo=HITOS.find(h=>dias<h)||null;
  return { logrados, ultimo:logrados[logrados.length-1]||null, proximo, faltan:proximo?proximo-dias:0, total:HITOS.length };
}

/* Modo reducción: consumos de esta semana (lunes a hoy) y de la anterior, comparados con la meta. */
function semanaReduccion(eventos, meta, hoy){
  const ref=hoy?new Date(hoy+"T12:00:00"):new Date(); ref.setHours(12,0,0,0);
  const dow=(ref.getDay()+6)%7; /* lunes=0 */
  const lunes=new Date(ref); lunes.setDate(ref.getDate()-dow);
  const lunesAnt=new Date(lunes); lunesAnt.setDate(lunes.getDate()-7);
  const k=d=>fechaTexto(d);
  const enRango=(ts,a,b)=>{ const t=ts.slice(0,10); return t>=k(a)&&t<k(b); };
  const finSemana=new Date(lunes); finSemana.setDate(lunes.getDate()+7);
  const consumos=eventos.filter(e=>e.type==="relapse");
  const actual=consumos.filter(e=>enRango(e.ts,lunes,finSemana)).length;
  const anterior=consumos.filter(e=>enRango(e.ts,lunesAnt,lunes)).length;
  return { actual, anterior, meta:Number(meta)||0, dentroDeMeta:actual<=(Number(meta)||0), mejora:anterior-actual };
}

/* Calendario de los últimos N días: por día, si hubo consumo, cuántas ganas, horas de sueño y si está antes del Día 0. */
function calendario(eventos, dia0, dias, hoy){
  const fin=hoy?new Date(hoy+"T12:00:00"):new Date(); fin.setHours(12,0,0,0);
  const out=[];
  for(let i=dias-1;i>=0;i--){
    const d=new Date(fin); d.setDate(fin.getDate()-i); const k=fechaTexto(d);
    out.push({k, dia:d.getDate(), consumo:false, ganas:0, sueno:null, antes:!!dia0&&k<dia0});
  }
  const idx={}; out.forEach(x=>idx[x.k]=x);
  eventos.forEach(e=>{ const x=idx[e.ts.slice(0,10)]; if(!x) return;
    if(e.type==="relapse") x.consumo=true;
    if(e.type==="crave") x.ganas++;
    if(e.type==="checkin"&&typeof e.sueno==="number") x.sueno=e.sueno; });
  const limpios=out.filter(x=>!x.consumo&&!x.antes).length;
  return { dias:out, limpios, consumos:out.filter(x=>x.consumo).length, ganas:out.reduce((a,x)=>a+x.ganas,0) };
}

/* Formato pesos chilenos. */
function pesos(n){ return "$"+Math.round(n).toLocaleString("es-CL"); }

const Calculos={ fechaTexto, diasDesde, dineroAhorrado, horasTrabajo, rachaMasLarga, suenoVsGanas, horaPico, resumenSemana, hitos, semanaReduccion, calendario, HITOS, pesos };
if(typeof module!=="undefined"&&module.exports) module.exports=Calculos;
else raiz.Calculos=Calculos;
})(typeof window!=="undefined"?window:globalThis);
