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

/* El día (AAAA-MM-DD, hora local) de un registro guardado con su hora (ts, en formato ISO).
   Importante: cortar los primeros 10 caracteres de ts daba el día en hora universal, y en Chile
   todo lo anotado después de las 21:00 aprox. quedaba en el día siguiente. */
function diaDe(ts){ return fechaTexto(new Date(ts)); }

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
  const consumos=eventos.filter(e=>e.type==="relapse").map(e=>diaDe(e.ts)).sort();
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
    const k=diaDe(e.ts);
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
/* dia0 (opcional): los días antes del Día 0 no se cuentan como limpios ni suman dinero */
function resumenSemana(eventos, gastoSemana, hoy, dia0){
  const fin=hoy?new Date(hoy+"T12:00:00"):new Date(); fin.setHours(12,0,0,0);
  const dias=[]; for(let i=6;i>=0;i--){ const d=new Date(fin); d.setDate(d.getDate()-i); dias.push(fechaTexto(d)); }
  const consumos=new Set(eventos.filter(e=>e.type==="relapse").map(e=>diaDe(e.ts)));
  const diasLimpios=dias.filter(k=>!consumos.has(k)&&(!dia0||k>dia0)).length;
  const enSemana=e=>dias.includes(diaDe(e.ts));
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
  const enRango=(ts,a,b)=>{ const t=diaDe(ts); return t>=k(a)&&t<k(b); };
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
  eventos.forEach(e=>{ const x=idx[diaDe(e.ts)]; if(!x) return;
    if(e.type==="relapse") x.consumo=true;
    if(e.type==="crave") x.ganas++;
    if(e.type==="checkin"&&typeof e.sueno==="number") x.sueno=e.sueno; });
  /* El Día 0 es el día del último consumo: no cuenta como limpio (igual que el contador de Hoy) */
  const limpios=out.filter(x=>!x.consumo&&!x.antes&&x.k!==dia0).length;
  return { dias:out, limpios, consumos:out.filter(x=>x.consumo).length, ganas:out.reduce((a,x)=>a+x.ganas,0) };
}

/* Días limpios acumulados: un consumo no borra los días anteriores.
   "inicio" es el día más antiguo que la app conoce (el primer registro o el Día 0, el que sea anterior).
   Cuenta los días sin consumo desde el inicio hasta hoy, en total y en los últimos "ventana" días.
   inicioConocido (opcional): el Día 0 más antiguo que tuvo la persona, guardado antes de reiniciar por una recaída.
   Sin él, quien nunca anotó nada en Registro perdería sus días limpios al reiniciar. Ese día fue de consumo: no cuenta. */
function limpiosAcumulados(eventos, dia0, ventana, hoy, inicioConocido){
  const hoyK=hoy||fechaTexto(new Date());
  const fechas=eventos.map(e=>diaDe(e.ts)); if(dia0) fechas.push(dia0); if(inicioConocido) fechas.push(inicioConocido);
  if(!fechas.length) return { total:0, enVentana:0, ventana, desde:null };
  const inicio=fechas.sort()[0];
  const consumos=new Set(eventos.filter(e=>e.type==="relapse").map(e=>diaDe(e.ts)));
  const fin=new Date(hoyK+"T12:00:00");
  const corte=new Date(fin); corte.setDate(fin.getDate()-(ventana-1));
  let total=0, enVentana=0;
  for(let d=new Date(inicio+"T12:00:00"); d<=fin; d.setDate(d.getDate()+1)){
    const k=fechaTexto(d);
    if(consumos.has(k)||k===dia0||k===inicioConocido) continue;
    total++;
    if(d>=corte) enVentana++;
  }
  return { total, enVentana, ventana, desde:inicio };
}

/* La historia por capítulos: abre un capítulo nuevo por cada día distinto en que se abre la app.
   "estado" guarda cuántos capítulos hay disponibles y la fecha del último que se abrió.
   No se acumulan días perdidos: así la historia engancha sin dar para maratón.
   Si se agregan capítulos nuevos más adelante, siguen abriéndose desde donde quedó. */
function avanzarHistoria(estado, hoy, total){
  const e={ disponibles:Number(estado&&estado.disponibles)||0, fecha:(estado&&estado.fecha)||null };
  if(e.fecha!==hoy&&e.disponibles<total){ e.disponibles++; e.fecha=hoy; }
  return e;
}

/* Arma el texto de un archivo de calendario (.ics) con un recordatorio que se repite todos los días.
   hora (0 a 23) y minuto (0 a 59): cuándo suena. desde: "AAAA-MM-DD", el primer día. sello: momento en que se crea.
   La hora va sin zona horaria: suena a esa hora en el lugar donde esté el teléfono.
   El título es discreto a propósito: el calendario puede verlo otra persona o sincronizarse con una cuenta.
   Devuelve null si la hora no es válida. */
function recordatorioICS(hora, minuto, desde, sello){
  if(!(Number.isInteger(hora)&&hora>=0&&hora<=23&&Number.isInteger(minuto)&&minuto>=0&&minuto<=59)) return null;
  const dos=n=>String(n).padStart(2,"0");
  const inicio=desde.replace(/-/g,"")+"T"+dos(hora)+dos(minuto)+"00";
  const marca=new Date(sello).toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
  return [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Cabeza Despejada//ES","CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:recordatorio-diario@cabeza-despejada", /* Siempre el mismo: si se agrega otra vez, muchos calendarios lo reemplazan en vez de duplicarlo */
    "DTSTAMP:"+marca,
    "DTSTART:"+inicio,
    "DURATION:PT15M",
    "RRULE:FREQ=DAILY",
    "SUMMARY:Un momento para ti",
    "DESCRIPTION:Abre la app y mira tu plan.",
    "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Un momento para ti","TRIGGER:PT0M","END:VALARM",
    "END:VEVENT","END:VCALENDAR",""
  ].join("\r\n");
}

/* Enlace que abre Google Calendar con el recordatorio ya lleno (Google Calendar en Android no abre archivos .ics).
   Mismo título discreto, 15 minutos de duración y repetición diaria. Devuelve null si la hora no es válida. */
function enlaceGoogleCalendar(hora, minuto, desde){
  if(!(Number.isInteger(hora)&&hora>=0&&hora<=23&&Number.isInteger(minuto)&&minuto>=0&&minuto<=59)) return null;
  const dos=n=>String(n).padStart(2,"0");
  const formato=d=>""+d.getFullYear()+dos(d.getMonth()+1)+dos(d.getDate())+"T"+dos(d.getHours())+dos(d.getMinutes())+"00";
  const inicio=new Date(desde+"T"+dos(hora)+":"+dos(minuto)+":00");
  const fin=new Date(inicio.getTime()+15*60000); /* Si empieza 23:50, termina al día siguiente */
  return "https://calendar.google.com/calendar/render?action=TEMPLATE"+
    "&text="+encodeURIComponent("Un momento para ti")+
    "&details="+encodeURIComponent("Abre la app y mira tu plan.")+
    "&dates="+formato(inicio)+"/"+formato(fin)+
    "&recur="+encodeURIComponent("RRULE:FREQ=DAILY");
}

/* Respiración 4-7-8: inhalar 4 segundos, sostener 7 y botar el aire en 8. Una vuelta dura 19 segundos.
   Recibe los segundos desde que empezó y cuántas vueltas se harán. Devuelve en qué vuelta y fase va,
   y cuántos segundos le quedan a esa fase (para mostrar la cuenta regresiva). */
const FASES_478=[{fase:"inhala",dura:4},{fase:"sosten",dura:7},{fase:"exhala",dura:8}];
function fase478(segundos, vueltas){
  const largo=19, total=largo*vueltas;
  if(!(segundos>=0)) segundos=0;
  if(segundos>=total) return { terminado:true, vuelta:vueltas };
  const vuelta=Math.floor(segundos/largo)+1;
  let t=segundos%largo;
  for(const f of FASES_478){
    if(t<f.dura) return { terminado:false, vuelta, fase:f.fase, dura:f.dura, quedan:Math.ceil(f.dura-t) };
    t-=f.dura;
  }
}

/* Hora sugerida para el recordatorio: media hora antes de la hora difícil, para alcanzar a prepararse.
   Sin hora difícil todavía (menos de 3 registros), propone las 20:00. Devuelve texto "HH:MM". */
function horaRecordatorio(horaDificil){
  if(horaDificil==null) return "20:00";
  return String((horaDificil+23)%24).padStart(2,"0")+":30";
}

/* El cactus de la portada crece con todos los días que llevas usando la app (desde el primer Día 0, no desde el último):
   una recaída nunca lo achica. El primer día mide 0,62 de su tamaño final, como un cactus de llavero; crece rápido
   al principio y más lento después (curva logarítmica), y llega a su tamaño completo a los 90 días. */
function tamanoCactus(dias){
  const d=Math.max(0,Number(dias)||0);
  return Math.round((0.62+0.38*Math.min(1,Math.log(1+d)/Math.log(91)))*1000)/1000;
}

/* De madrugada (de las 0:00 a las 5:59): la app invita a dormir y el salchicha no aparece de sorpresa.
   Recibe la hora (0 a 23). Cualquier otra cosa no es madrugada. */
function esMadrugada(hora){ return Number.isInteger(hora)&&hora>=0&&hora<6; }

/* "Un rato contigo": cuántos minutos dura la próxima práctica, según cuántas veces se terminó bien.
   Empieza corto a propósito y sube de a poco: 2 veces de 3 minutos, 2 de 5, 3 de 10, y después 15. Nunca pasa de 15. */
function minutosRato(completados){
  const n=Math.max(0,Math.floor(Number(completados)||0));
  return n<2?3:n<4?5:n<7?10:15;
}

/* "Hora de salida": la tarjeta aparece desde una hora antes de la salida (del trabajo, de clases) hasta cuatro horas después,
   solo los días que la persona eligió. ahora: un Date. hora: "HH:MM". dias: números como los de getDay() (0 domingo … 6 sábado).
   Devuelve { mostrar, viernes, desfase }: viernes es true solo si la tarjeta se muestra por una salida de viernes;
   desfase dice de qué día es esa salida (0 hoy, -1 ayer, 1 mañana), para guardar las respuestas en el día correcto.
   La ventana puede cruzar la medianoche (salida a las 22:00 → se ve hasta las 2:00 del día siguiente). */
function momentoSalida(ahora, hora, dias){
  const no={ mostrar:false, viernes:false, desfase:0 };
  const m=/^(\d{1,2}):(\d{2})$/.exec(hora||"");
  if(!m||!(ahora instanceof Date)||isNaN(ahora)||!Array.isArray(dias)) return no;
  const hh=Number(m[1]), mm=Number(m[2]); if(hh>23||mm>59) return no;
  const salida=hh*60+mm, minuto=ahora.getHours()*60+ahora.getMinutes(), dia=ahora.getDay();
  /* Se revisa la salida de hoy, la de ayer (si la ventana pasó la medianoche) y la de mañana (si empieza antes de la medianoche) */
  for(const [d,min,desfase] of [[dia,minuto,0],[(dia+6)%7,minuto+1440,-1],[(dia+1)%7,minuto-1440,1]]){
    if(dias.includes(d)&&min>=salida-60&&min<salida+240) return { mostrar:true, viernes:d===5, desfase };
  }
  return no;
}

/* "¿Cómo te fue el viernes?": la pregunta aparece los sábados en la mañana, de las 6:00 a las 13:59. Recibe un Date. */
function mananaSabado(ahora){
  return ahora instanceof Date&&!isNaN(ahora)&&ahora.getDay()===6&&ahora.getHours()>=6&&ahora.getHours()<14;
}

/* Formato pesos chilenos. */
function pesos(n){ return "$"+Math.round(n).toLocaleString("es-CL"); }

const Calculos={ fechaTexto, diaDe, diasDesde, dineroAhorrado, horasTrabajo, rachaMasLarga, suenoVsGanas, horaPico, resumenSemana, hitos, semanaReduccion, calendario, limpiosAcumulados, avanzarHistoria, recordatorioICS, enlaceGoogleCalendar, horaRecordatorio, fase478, tamanoCactus, esMadrugada, minutosRato, momentoSalida, mananaSabado, HITOS, pesos };
if(typeof module!=="undefined"&&module.exports) module.exports=Calculos;
else raiz.Calculos=Calculos;
})(typeof window!=="undefined"?window:globalThis);
