/* Dudas: la persona pregunta lo que no encontró en la app y el dueño responde (ver servidor/dudas.sql).
   Sin nombre ni cuenta: la duda viaja sola, y el teléfono guarda un número secreto para ver la respuesta después.
   Este archivo no toca la pantalla: revisa el texto y habla con el servidor. Lo usa js/app.js y lo prueba tests/pruebas.js.
   Funciona en el navegador (window.Dudas) y en Node (module.exports). */
(function(raiz){
"use strict";

const MIN=10, MAX=500, POR_DIA=3;

/* Junta espacios repetidos y saca los de los bordes */
function limpiar(t){ return String(t||"").replace(/\s+/g," ").trim(); }

/* ¿Parece un teléfono o un correo? La duda debe ser anónima: ni datos propios ni de otras personas */
function pareceDatoPersonal(t){
  const s=String(t||"");
  return /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(s) || /(\+?\d[\s.-]?){8,}/.test(s);
}

/* ¿Parece una urgencia? No se bloquea el envío, pero la app muestra el 131 y el 1412 bien visibles,
   porque una duda puede tardar días en responderse */
const URGENCIA=/(suicid|matarme|quitarme la vida|no quiero vivir|me quiero morir|sobredosis|no respira|no despierta|convuls|inconsciente|desmay|dolor (de|en el|al) pecho)/i;
function pareceUrgencia(t){ return URGENCIA.test(String(t||"")); }

/* Revisa la duda antes de enviarla. enviadasHoy: cuántas mandó este teléfono hoy */
function validarDuda(texto, enviadasHoy){
  const t=limpiar(texto);
  if(t.length<MIN) return { ok:false, error:"Escribe tu duda con un poco más de detalle." };
  if(t.length>MAX) return { ok:false, error:"Máximo "+MAX+" letras. Intenta resumirla." };
  if(pareceDatoPersonal(t)) return { ok:false, error:"Saca el teléfono o correo: la duda tiene que ser anónima." };
  if((enviadasHoy||0)>=POR_DIA) return { ok:false, error:"Ya enviaste "+POR_DIA+" dudas hoy. Mañana puedes enviar más." };
  return { ok:true, texto:t };
}

/* ---------- Servidor (usa la misma conexión que el respaldo, en js/respaldo.js) ---------- */
const R=()=>raiz.Respaldo;
function disponible(){ return Boolean(R()&&R().nubeLista()); }
async function enviar(texto){ return await R().llamar("enviar_duda",{ p_pregunta:texto }); }
/* Devuelve { respuesta, respondida } o null si todavía no hay respuesta */
async function ver(id){
  const filas=await R().llamar("ver_duda",{ p_id:id });
  const f=filas&&filas[0];
  return f&&f.respuesta?{ respuesta:f.respuesta, respondida:f.respondida }:null;
}
async function publicas(){ return (await R().llamar("dudas_publicas",{}))||[]; }

const Dudas={ limpiar, pareceDatoPersonal, pareceUrgencia, validarDuda, disponible, enviar, ver, publicas, MIN, MAX, POR_DIA };
if(typeof module!=="undefined"&&module.exports) module.exports=Dudas;
else raiz.Dudas=Dudas;
})(typeof window!=="undefined"?window:globalThis);
