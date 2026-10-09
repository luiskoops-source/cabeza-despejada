/* Pruebas automáticas de los cálculos. Se corren con:  node tests/pruebas.js
   Cada prueba dice "esperaba X y obtuve Y". Si todo coincide, imprime OK. */
const assert=require("assert");
const C=require("../js/calculos.js");

let n=0;
function prueba(nombre,fn){ try{ fn(); n++; console.log("  ✓ "+nombre); }catch(e){ console.log("  ✗ "+nombre+"\n    "+e.message); process.exitCode=1; } }

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

console.log(process.exitCode?"\nHay pruebas fallando.":"\nOK: "+n+" pruebas pasaron.");
