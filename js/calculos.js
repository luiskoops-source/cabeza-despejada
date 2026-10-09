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

/* Formato pesos chilenos. */
function pesos(n){ return "$"+Math.round(n).toLocaleString("es-CL"); }

const Calculos={ fechaTexto, diasDesde, dineroAhorrado, horasTrabajo, rachaMasLarga, suenoVsGanas, pesos };
if(typeof module!=="undefined"&&module.exports) module.exports=Calculos;
else raiz.Calculos=Calculos;
})(typeof window!=="undefined"?window:globalThis);
