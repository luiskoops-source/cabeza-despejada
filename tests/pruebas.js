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

console.log("pesos");
prueba("formatea con punto de miles",()=>assert.strictEqual(C.pesos(1234567),"$1.234.567"));

console.log(process.exitCode?"\nHay pruebas fallando.":"\nOK: "+n+" pruebas pasaron.");
