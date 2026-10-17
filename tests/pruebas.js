/* Pruebas automáticas de los cálculos. Se corren con:  node tests/pruebas.js
   Cada prueba dice "esperaba X y obtuve Y". Si todo coincide, imprime OK. */
const assert=require("assert");
const C=require("../js/calculos.js");

let n=0;
function prueba(nombre,fn){ try{ fn(); n++; console.log("  ✓ "+nombre); }catch(e){ console.log("  ✗ "+nombre+"\n    "+e.message); process.exitCode=1; } }

console.log("tamanoCactus");
prueba("el primer día es chiquito (0,62)",()=>assert.strictEqual(C.tamanoCactus(0),0.62));
prueba("a los 90 días llega a su tamaño completo",()=>assert.strictEqual(C.tamanoCactus(90),1));
prueba("después de 90 días no sigue creciendo",()=>assert.strictEqual(C.tamanoCactus(400),1));
prueba("siempre crece: cada día mide más que el anterior hasta los 90",()=>{ for(let d=1;d<=90;d++) assert.ok(C.tamanoCactus(d)>C.tamanoCactus(d-1),"día "+d); });
prueba("texto o vacío no rompe",()=>{ assert.strictEqual(C.tamanoCactus("abc"),0.62); assert.strictEqual(C.tamanoCactus(undefined),0.62); });

console.log("esMadrugada");
prueba("medianoche es madrugada",()=>assert.strictEqual(C.esMadrugada(0),true));
prueba("las 5 es madrugada",()=>assert.strictEqual(C.esMadrugada(5),true));
prueba("las 6 ya no",()=>assert.strictEqual(C.esMadrugada(6),false));
prueba("las 23 todavía no",()=>assert.strictEqual(C.esMadrugada(23),false));
prueba("algo que no es una hora no es madrugada",()=>{ assert.strictEqual(C.esMadrugada("3"),false); assert.strictEqual(C.esMadrugada(undefined),false); });

console.log("minutosRato");
prueba("la primera vez son 3 minutos",()=>assert.strictEqual(C.minutosRato(0),3));
prueba("después de 2 veces sube a 5",()=>{ assert.strictEqual(C.minutosRato(1),3); assert.strictEqual(C.minutosRato(2),5); });
prueba("después de 4 veces sube a 10",()=>{ assert.strictEqual(C.minutosRato(3),5); assert.strictEqual(C.minutosRato(4),10); });
prueba("después de 7 veces llega a 15 y no pasa de ahí",()=>{ assert.strictEqual(C.minutosRato(6),10); assert.strictEqual(C.minutosRato(7),15); assert.strictEqual(C.minutosRato(500),15); });
prueba("texto, negativo o vacío empiezan en 3",()=>{ assert.strictEqual(C.minutosRato("abc"),3); assert.strictEqual(C.minutosRato(-4),3); assert.strictEqual(C.minutosRato(undefined),3); });

console.log("momentoSalida");
const viernes18=new Date(2026,9,16,18,0), LV=[1,2,3,4,5];
prueba("a la hora de salida se muestra, y un viernes lo dice",()=>assert.deepStrictEqual(C.momentoSalida(viernes18,"18:00",LV),{mostrar:true,viernes:true,desfase:0}));
prueba("una hora antes ya se muestra",()=>assert.strictEqual(C.momentoSalida(new Date(2026,9,16,17,0),"18:00",LV).mostrar,true));
prueba("más de una hora antes todavía no",()=>assert.strictEqual(C.momentoSalida(new Date(2026,9,16,16,59),"18:00",LV).mostrar,false));
prueba("cuatro horas después ya no",()=>{ assert.strictEqual(C.momentoSalida(new Date(2026,9,16,21,59),"18:00",LV).mostrar,true); assert.strictEqual(C.momentoSalida(new Date(2026,9,16,22,0),"18:00",LV).mostrar,false); });
prueba("un martes se muestra pero no es viernes",()=>assert.deepStrictEqual(C.momentoSalida(new Date(2026,9,13,18,30),"18:00",LV),{mostrar:true,viernes:false,desfase:0}));
prueba("un día no elegido no se muestra",()=>assert.strictEqual(C.momentoSalida(new Date(2026,9,17,18,0),"18:00",LV).mostrar,false));
prueba("si sale tarde, la tarjeta sigue después de medianoche y cuenta como viernes",()=>{ assert.deepStrictEqual(C.momentoSalida(new Date(2026,9,17,1,30),"22:00",LV),{mostrar:true,viernes:true,desfase:-1}); assert.strictEqual(C.momentoSalida(new Date(2026,9,17,2,0),"22:00",LV).mostrar,false); });
prueba("si sale a las 00:30, la tarjeta empieza a las 23:30 del día anterior",()=>{ assert.deepStrictEqual(C.momentoSalida(new Date(2026,9,15,23,30),"00:30",[5]),{mostrar:true,viernes:true,desfase:1}); assert.strictEqual(C.momentoSalida(new Date(2026,9,15,23,29),"00:30",[5]).mostrar,false); });
prueba("sin hora, con hora inválida o sin días no se muestra",()=>{ assert.strictEqual(C.momentoSalida(viernes18,null,LV).mostrar,false); assert.strictEqual(C.momentoSalida(viernes18,"25:00",LV).mostrar,false); assert.strictEqual(C.momentoSalida(viernes18,"18:00",undefined).mostrar,false); });

console.log("mananaSabado");
prueba("el sábado a las 9 sí",()=>assert.strictEqual(C.mananaSabado(new Date(2026,9,17,9,0)),true));
prueba("el sábado a las 5:59 y a las 14:00 no",()=>{ assert.strictEqual(C.mananaSabado(new Date(2026,9,17,5,59)),false); assert.strictEqual(C.mananaSabado(new Date(2026,9,17,14,0)),false); });
prueba("el viernes o el domingo no",()=>{ assert.strictEqual(C.mananaSabado(new Date(2026,9,16,9,0)),false); assert.strictEqual(C.mananaSabado(new Date(2026,9,18,9,0)),false); });
prueba("algo que no es una fecha no",()=>{ assert.strictEqual(C.mananaSabado("sábado"),false); assert.strictEqual(C.mananaSabado(undefined),false); });

console.log("diasDesde");
prueba("sin Día 0 devuelve 0",()=>assert.strictEqual(C.diasDesde(null,"2026-10-09"),0));
prueba("mismo día devuelve 0",()=>assert.strictEqual(C.diasDesde("2026-10-09","2026-10-09"),0));
prueba("cuenta 12 días",()=>assert.strictEqual(C.diasDesde("2026-09-27","2026-10-09"),12));
prueba("fecha futura no da negativo",()=>assert.strictEqual(C.diasDesde("2026-12-01","2026-10-09"),0));

console.log("dineroAhorrado");
prueba("60.000 por semana en 14 días son 120.000",()=>assert.strictEqual(Math.round(C.dineroAhorrado(60000,14).total),120000));
prueba("sin gasto todo es 0",()=>assert.strictEqual(C.dineroAhorrado(0,30).total,0));
prueba("texto en vez de número no rompe",()=>assert.strictEqual(C.dineroAhorrado("abc",30).total,0));

console.log("horasTrabajo");
prueba("sin sueldo devuelve null",()=>assert.strictEqual(C.horasTrabajo(100000,null),null));
prueba("sueldo 900.000 = 5.000 la hora; 100.000 son 20 h",()=>assert.strictEqual(C.horasTrabajo(100000,900000),20));

console.log("rachaMasLarga");
const ev=[
  {type:"relapse",ts:"2026-09-01T03:00:00.000Z"},
  {type:"relapse",ts:"2026-09-11T03:00:00.000Z"},
  {type:"relapse",ts:"2026-09-27T03:00:00.000Z"},
];
prueba("elige el tramo más largo entre consumos (16 días)",()=>assert.strictEqual(C.rachaMasLarga(ev,"2026-09-27","2026-10-05"),16));
prueba("la racha actual gana si es mayor",()=>assert.strictEqual(C.rachaMasLarga(ev,"2026-09-27","2026-10-20"),23));
prueba("sin consumos usa solo la racha actual",()=>assert.strictEqual(C.rachaMasLarga([],"2026-10-01","2026-10-09"),8));

console.log("suenoVsGanas");
const ev2=[
  {type:"checkin",ts:"2026-10-01T10:00:00.000Z",sueno:4,animo:2},
  {type:"crave",ts:"2026-10-01T22:00:00.000Z",i:7},
  {type:"checkin",ts:"2026-10-02T10:00:00.000Z",sueno:8,animo:4},
  {type:"checkin",ts:"2026-10-03T10:00:00.000Z",sueno:6,animo:3},
  {type:"relapse",ts:"2026-10-03T23:00:00.000Z"},
];
prueba("promedia 5 h con ganas y 8 h sin ganas",()=>{ const r=C.suenoVsGanas(ev2); assert.strictEqual(r.conGanas,5); assert.strictEqual(r.sinGanas,8); assert.strictEqual(r.diasConDato,3); });
prueba("sin check-ins devuelve null",()=>assert.deepStrictEqual(C.suenoVsGanas([{type:"crave",ts:"2026-10-01T22:00:00.000Z"}]),{conGanas:null,sinGanas:null,diasConDato:0}));

console.log("horaPico");
prueba("con menos de 3 registros devuelve null",()=>assert.strictEqual(C.horaPico(ev2.slice(0,2)),null));
prueba("encuentra la hora con más registros",()=>{
  const h=d=>new Date(d).getHours();
  const evs=[1,2,3].map(()=>({type:"crave",ts:"2026-10-01T23:30:00"}));
  assert.strictEqual(C.horaPico(evs),h("2026-10-01T23:30:00"));
});

console.log("resumenSemana");
prueba("cuenta días limpios, olas y sueño de los últimos 7 días",()=>{
  const evs=[
    {type:"relapse",ts:"2026-10-05T12:00:00.000Z"},
    {type:"win",ts:"2026-10-07T12:00:00.000Z"},
    {type:"win",ts:"2026-10-08T12:00:00.000Z"},
    {type:"checkin",ts:"2026-10-08T12:00:00.000Z",sueno:6},
    {type:"checkin",ts:"2026-10-09T12:00:00.000Z",sueno:8},
    {type:"win",ts:"2026-09-01T12:00:00.000Z"}, /* fuera de la semana, no cuenta */
  ];
  const r=C.resumenSemana(evs,70000,"2026-10-09");
  assert.strictEqual(r.diasLimpios,6); assert.strictEqual(r.olas,2); assert.strictEqual(r.suenoProm,7); assert.strictEqual(Math.round(r.dinero),60000);
});

prueba("los días antes del Día 0 no cuentan como limpios",()=>{
  /* Día 0 = 12 (día del último consumo): solo el 13 cuenta como limpio */
  const r=C.resumenSemana([],70000,"2026-10-13","2026-10-12");
  assert.strictEqual(r.diasLimpios,1); assert.strictEqual(Math.round(r.dinero),10000);
});

console.log("pesos");
prueba("formatea con punto de miles",()=>assert.strictEqual(C.pesos(1234567),"$1.234.567"));


console.log("hitos");
prueba("con 0 días no hay logrados y el próximo es 1",()=>{ const h=C.hitos(0); assert.deepStrictEqual(h.logrados,[]); assert.strictEqual(h.proximo,1); assert.strictEqual(h.faltan,1); });
prueba("con 45 días logró 1,3,7,14,30 y faltan 15 para 60",()=>{ const h=C.hitos(45); assert.deepStrictEqual(h.logrados,[1,3,7,14,30]); assert.strictEqual(h.ultimo,30); assert.strictEqual(h.proximo,60); assert.strictEqual(h.faltan,15); });
prueba("pasados todos, próximo es null",()=>assert.strictEqual(C.hitos(1000).proximo,null));

console.log("semanaReduccion");
prueba("cuenta consumos de esta semana (lunes a hoy) y de la anterior",()=>{
  /* 2026-10-09 es viernes; el lunes de esa semana es 2026-10-05 */
  const evs=[{type:"relapse",ts:"2026-10-06T12:00:00"},{type:"relapse",ts:"2026-10-08T12:00:00"},{type:"relapse",ts:"2026-10-01T12:00:00"},{type:"relapse",ts:"2026-09-30T12:00:00"},{type:"relapse",ts:"2026-09-27T12:00:00"}];
  const r=C.semanaReduccion(evs,3,"2026-10-09");
  assert.strictEqual(r.actual,2); assert.strictEqual(r.anterior,2); assert.strictEqual(r.dentroDeMeta,true); assert.strictEqual(r.mejora,0);
});
prueba("marca cuando se pasa la meta",()=>{ const evs=[1,2,3].map(d=>({type:"relapse",ts:"2026-10-0"+(5+d)+"T12:00:00"})); assert.strictEqual(C.semanaReduccion(evs,2,"2026-10-09").dentroDeMeta,false); });

console.log("calendario");
prueba("30 días con un consumo y dos ganas",()=>{
  const evs=[{type:"relapse",ts:"2026-10-01T12:00:00"},{type:"crave",ts:"2026-10-05T12:00:00",i:5},{type:"crave",ts:"2026-10-05T20:00:00",i:7},{type:"checkin",ts:"2026-10-09T09:00:00",sueno:6}];
  const r=C.calendario(evs,"2026-10-01",30,"2026-10-09");
  assert.strictEqual(r.dias.length,30); assert.strictEqual(r.consumos,1); assert.strictEqual(r.ganas,2);
  const d5=r.dias.find(x=>x.k==="2026-10-05"); assert.strictEqual(d5.ganas,2);
  assert.strictEqual(r.dias[r.dias.length-1].sueno,6);
  assert.strictEqual(r.dias[0].antes,true); /* 10 de septiembre es antes del Día 0 */
  assert.strictEqual(r.limpios,8); /* 2 al 9 de octubre */
});

console.log("limpiosAcumulados");
prueba("un consumo no borra los días anteriores",()=>{
  const evs=[{type:"crave",ts:"2026-10-01T12:00:00.000Z"},{type:"relapse",ts:"2026-10-12T12:00:00.000Z"}];
  const r=C.limpiosAcumulados(evs,"2026-10-12",30,"2026-10-12");
  assert.strictEqual(r.total,11); assert.strictEqual(r.enVentana,11); assert.strictEqual(r.desde,"2026-10-01");
});
prueba("la ventana de 30 días no cuenta lo más antiguo",()=>{
  const r=C.limpiosAcumulados([{type:"crave",ts:"2026-08-01T12:00:00.000Z"}],"2026-08-01",30,"2026-10-12");
  assert.strictEqual(r.enVentana,30); assert.strictEqual(r.total,72); /* 2 de agosto al 12 de octubre: el Día 0 no cuenta */
});
prueba("el Día 0 no cuenta como limpio en el calendario",()=>{
  const r=C.calendario([],"2026-10-12",30,"2026-10-13");
  assert.strictEqual(r.limpios,1);
});
prueba("sin registros previos, el inicio guardado mantiene los días limpios",()=>{
  /* Día 0 el 2 de octubre, recaída el 12 sin haber anotado nada antes: del 3 al 11 son 9 días limpios */
  const r=C.limpiosAcumulados([{type:"relapse",ts:"2026-10-12T12:00:00.000Z"}],"2026-10-12",30,"2026-10-12","2026-10-02");
  assert.strictEqual(r.total,9); assert.strictEqual(r.desde,"2026-10-02");
});
prueba("sin inicio guardado funciona como antes",()=>assert.strictEqual(C.limpiosAcumulados([{type:"relapse",ts:"2026-10-12T12:00:00.000Z"}],"2026-10-12",30,"2026-10-12").total,0));
prueba("sin datos devuelve ceros",()=>assert.deepStrictEqual(C.limpiosAcumulados([],null,30,"2026-10-12"),{total:0,enVentana:0,ventana:30,desde:null}));
console.log("avanzarHistoria");
prueba("la primera vez abre el capítulo 1",()=>assert.deepStrictEqual(C.avanzarHistoria(null,"2026-10-14",15),{disponibles:1,fecha:"2026-10-14"}));
prueba("el mismo día no abre otro",()=>assert.strictEqual(C.avanzarHistoria({disponibles:1,fecha:"2026-10-14"},"2026-10-14",15).disponibles,1));
prueba("al día siguiente abre el que sigue",()=>assert.strictEqual(C.avanzarHistoria({disponibles:1,fecha:"2026-10-14"},"2026-10-15",15).disponibles,2));
prueba("días sin abrir no se acumulan",()=>assert.strictEqual(C.avanzarHistoria({disponibles:3,fecha:"2026-10-10"},"2026-10-20",15).disponibles,4));
prueba("no pasa del último capítulo",()=>assert.strictEqual(C.avanzarHistoria({disponibles:15,fecha:"2026-10-10"},"2026-10-20",15).disponibles,15));
prueba("si llegan capítulos nuevos, sigue desde donde quedó",()=>assert.strictEqual(C.avanzarHistoria({disponibles:15,fecha:"2026-10-10"},"2026-10-20",20).disponibles,16));

console.log("recordatorio de calendario");
const ics=C.recordatorioICS(22,30,"2026-10-15",Date.UTC(2026,9,15,12,0,0));
prueba("empieza el día y la hora pedidos",()=>assert.ok(ics.includes("DTSTART:20261015T223000\r\n")));
prueba("se repite todos los días",()=>assert.ok(ics.includes("RRULE:FREQ=DAILY")));
prueba("trae una alarma que suena a la hora",()=>assert.ok(ics.includes("BEGIN:VALARM")&&ics.includes("TRIGGER:PT0M")));
prueba("las horas de un dígito llevan cero adelante",()=>assert.ok(C.recordatorioICS(7,5,"2026-10-15",0).includes("T070500")));
prueba("el título no dice nada del consumo",()=>assert.ok(!/consum|droga|ganas|coca|recaí/i.test(ics)));
prueba("hora inválida devuelve null",()=>{ assert.strictEqual(C.recordatorioICS(24,0,"2026-10-15",0),null); assert.strictEqual(C.recordatorioICS(NaN,0,"2026-10-15",0),null); });
prueba("siempre el mismo identificador, para no duplicar",()=>assert.ok(ics.includes("UID:recordatorio-diario@cabeza-despejada")&&C.recordatorioICS(8,0,"2026-11-01",0).includes("UID:recordatorio-diario@cabeza-despejada")));
const g=C.enlaceGoogleCalendar(22,30,"2026-10-15");
prueba("Google Calendar: hora de inicio y fin 15 minutos después",()=>assert.ok(g.includes("dates=20261015T223000/20261015T224500")));
prueba("Google Calendar: se repite todos los días",()=>assert.ok(g.includes("recur="+encodeURIComponent("RRULE:FREQ=DAILY"))));
prueba("Google Calendar: si empieza 23:50 termina al día siguiente",()=>assert.ok(C.enlaceGoogleCalendar(23,50,"2026-10-15").includes("/20261016T000500")));
prueba("Google Calendar: título discreto y hora inválida da null",()=>{ assert.ok(g.includes("text=Un%20momento%20para%20ti")); assert.strictEqual(C.enlaceGoogleCalendar(25,0,"2026-10-15"),null); });
prueba("sugiere media hora antes de la hora difícil",()=>assert.strictEqual(C.horaRecordatorio(23),"22:30"));
prueba("si la hora difícil es medianoche, sugiere 23:30",()=>assert.strictEqual(C.horaRecordatorio(0),"23:30"));
prueba("sin hora difícil sugiere 20:00",()=>assert.strictEqual(C.horaRecordatorio(null),"20:00"));
console.log("día local");
prueba("algo anotado a las 22:30 queda en ese día, no en el siguiente",()=>assert.strictEqual(C.diaDe(new Date(2026,9,15,22,30).toISOString()),"2026-10-15"));
prueba("algo anotado a las 00:10 queda en el día nuevo",()=>assert.strictEqual(C.diaDe(new Date(2026,9,16,0,10).toISOString()),"2026-10-16"));
console.log("respiración 4-7-8");
prueba("empieza inhalando 4 segundos",()=>assert.deepStrictEqual(C.fase478(0,4),{terminado:false,vuelta:1,fase:"inhala",dura:4,quedan:4}));
prueba("a los 4 segundos se sostiene el aire 7",()=>{ const f=C.fase478(4,4); assert.strictEqual(f.fase,"sosten"); assert.strictEqual(f.quedan,7); });
prueba("a los 11 segundos se bota el aire en 8",()=>{ const f=C.fase478(11,4); assert.strictEqual(f.fase,"exhala"); assert.strictEqual(f.quedan,8); });
prueba("la cuenta regresiva baja de a un segundo",()=>assert.strictEqual(C.fase478(12.3,4).quedan,7));
prueba("a los 19 segundos empieza la vuelta 2",()=>{ const f=C.fase478(19,4); assert.strictEqual(f.vuelta,2); assert.strictEqual(f.fase,"inhala"); });
prueba("4 vueltas terminan a los 76 segundos",()=>{ assert.ok(!C.fase478(75.9,4).terminado); assert.ok(C.fase478(76,4).terminado); });
console.log(process.exitCode?"\nHay pruebas fallando.":"\nOK: "+n+" pruebas pasaron.");

/* ---------- Respaldo (js/respaldo.js) ---------- */
const R=require("../js/respaldo.js");
console.log("respaldo en archivo");
const estado={ day0:"2026-10-01", pin:"1234", dailyAI:"x", events:[{type:"crave",ts:"2026-10-14T01:14:00.000Z",note:"salí a fumar"}], reasons:["una"] };
prueba("la copia no lleva el PIN",()=>assert.strictEqual(R.crearRespaldo(estado).datos.pin,undefined));
prueba("ida y vuelta conserva el historial",()=>assert.deepStrictEqual(R.leerRespaldo(JSON.stringify(R.crearRespaldo(estado))).datos.events,estado.events));
prueba("rechaza un archivo cualquiera",()=>assert.throws(()=>R.leerRespaldo('{"hola":1}'),/no es una copia/));
prueba("rechaza texto que no es JSON",()=>assert.throws(()=>R.leerRespaldo("hola"),/no es una copia/));
prueba("rechaza un historial dañado",()=>assert.throws(()=>R.leerRespaldo(JSON.stringify({app:"cabeza-despejada",version:1,datos:{events:"x"}})),/dañada/));
prueba("rechaza copias de una versión futura",()=>assert.throws(()=>R.leerRespaldo(JSON.stringify({app:"cabeza-despejada",version:99,datos:{}})),/más nueva/));
prueba("acepta las copias antiguas (sin envoltorio)",()=>assert.strictEqual(R.leerRespaldo(JSON.stringify({day0:"2026-09-01",events:[]})).datos.day0,"2026-09-01"));
prueba("nombre del archivo con fecha",()=>assert.strictEqual(R.nombreArchivo(new Date(2026,9,14)),"cabeza-despejada-2026-10-14.json"));

console.log("código secreto");
const cod=R.nuevoCodigo();
prueba("tiene 6 grupos de 4",()=>assert.match(cod,/^[0-9A-Z]{4}(-[0-9A-Z]{4}){5}$/));
prueba("dos códigos nunca salen iguales",()=>assert.notStrictEqual(cod,R.nuevoCodigo()));
prueba("acepta minúsculas, espacios y O en vez de 0",()=>assert.ok(R.codigoValido(cod.toLowerCase().replace(/-/g," ").replace(/0/g,"o"))));
prueba("rechaza un código incompleto",()=>assert.ok(!R.codigoValido(cod.slice(0,10))));

/* El cifrado es asíncrono: estas pruebas esperan su resultado antes de dar el total */
(async()=>{
  console.log("cifrado");
  async function pruebaA(nombre,fn){ try{ await fn(); n++; console.log("  ✓ "+nombre); }catch(e){ console.log("  ✗ "+nombre+"\n    "+e.message); process.exitCode=1; } }
  const a=await R.derivar(cod), b=await R.derivar(cod.toLowerCase());
  await pruebaA("el mismo código da el mismo casillero",async()=>assert.strictEqual(a.id,b.id));
  await pruebaA("el casillero no revela el código",async()=>assert.ok(!a.id.includes(R.normalizarCodigo(cod).toLowerCase())));
  const cifrado=await R.cifrar(R.crearRespaldo(estado),a.llave);
  await pruebaA("lo cifrado no deja leer el historial",async()=>assert.ok(!cifrado.includes("fumar")&&!cifrado.includes("2026-10-01")));
  await pruebaA("con el código correcto se recupera todo",async()=>assert.deepStrictEqual((await R.descifrar(cifrado,b.llave)).datos.events,estado.events));
  const otro=await R.derivar(R.nuevoCodigo());
  await pruebaA("con otro código no se abre",async()=>assert.rejects(R.descifrar(cifrado,otro.llave),/no abre/));
  console.log(process.exitCode?"\nHay pruebas que fallaron.":`\nOK: ${n} pruebas pasaron (incluidas las de respaldo).`);
})();
