/* Chat: la persona escribe desde la app y responde el dueño, una persona (servidor/chat.sql, panel.html).
   Sin nombre ni cuenta: el teléfono guarda solo el número secreto de su conversación.
   Este archivo no toca la pantalla: revisa los mensajes y habla con el servidor. Lo usan js/app.js y panel.html,
   y lo prueba tests/pruebas.js. Funciona en el navegador (window.Chat) y en Node (module.exports). */
(function(raiz){
"use strict";

const MAX=1000, POR_DIA=30;

/* Junta espacios repetidos y saca los de los bordes (los saltos de línea se respetan) */
function limpiar(t){ return String(t||"").replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim(); }

/* ¿Parece un teléfono o un correo? El chat es anónimo: ni datos propios ni de otras personas */
function pareceDatoPersonal(t){
  const s=String(t||"");
  return /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(s) || /(\+?\d[\s.-]?){8,}/.test(s);
}

/* ¿Parece una urgencia? No se bloquea el envío, pero la app muestra el 131 y el 1412 bien visibles,
   porque la respuesta puede tardar */
const URGENCIA=/(suicid|matarme|quitarme la vida|no quiero vivir|me quiero morir|sobredosis|no respira|no despierta|convuls|inconsciente|desmay|dolor (de|en el|al) pecho)/i;
function pareceUrgencia(t){ return URGENCIA.test(String(t||"")); }

/* Revisa un mensaje antes de enviarlo. enviadosHoy: cuántos mandó este teléfono hoy */
function validarMensaje(texto, enviadosHoy){
  const t=limpiar(texto);
  if(!t) return { ok:false, error:"Escribe tu mensaje." };
  if(t.length>MAX) return { ok:false, error:"Máximo "+MAX+" letras por mensaje. Puedes mandarlo en partes." };
  if(pareceDatoPersonal(t)) return { ok:false, error:"Saca el teléfono o correo: el chat es anónimo." };
  if((enviadosHoy||0)>=POR_DIA) return { ok:false, error:"Llegaste al tope de mensajes de hoy. Mañana puedes seguir. Si es urgente: 131 o 1412." };
  return { ok:true, texto:t };
}

/* El chat se abre después de una semana usando la app, para que no se use para trolear.
   primerUso: "AAAA-MM-DD", el primer día que se abrió la app en este teléfono. Devuelve cuántos días faltan (0 = ya puede). */
const DIAS_MINIMOS=7;
function diasParaChat(primerUso, hoy){
  if(!primerUso) return DIAS_MINIMOS;
  const usados=Math.floor((new Date(hoy+"T12:00:00")-new Date(primerUso+"T12:00:00"))/86400000);
  return Math.max(0,DIAS_MINIMOS-usados);
}

/* Junta los mensajes nuevos con los que ya había, sin repetir, ordenados */
function juntar(antes, nuevos){
  const porId=new Map((antes||[]).map(m=>[m.id,m]));
  (nuevos||[]).forEach(m=>porId.set(m.id,m));
  return [...porId.values()].sort((a,b)=>a.id-b.id);
}

/* ---------- Servidor (usa la misma conexión que el respaldo, en js/respaldo.js) ---------- */
const R=()=>raiz.Respaldo;
function disponible(){ return Boolean(R()&&R().nubeLista()); }
/* La persona */
async function enviar(conv, texto){ return await R().llamar("chat_enviar",{ p_conv:conv||null, p_texto:texto }); }
async function leer(conv, desde){ return (await R().llamar("chat_leer",{ p_conv:conv, p_desde:desde||0 }))||[]; }
/* El dueño, desde panel.html */
async function entrar(clave){ return (await R().llamar("panel_entrar",{ p_clave:clave }))===true; }
async function conversaciones(clave){ return (await R().llamar("panel_conversaciones",{ p_clave:clave }))||[]; }
async function leerPanel(clave, conv){ return (await R().llamar("panel_leer",{ p_clave:clave, p_conv:conv }))||[]; }
async function responder(clave, conv, texto){ return await R().llamar("panel_responder",{ p_clave:clave, p_conv:conv, p_texto:texto }); }

const Chat={ limpiar, pareceDatoPersonal, pareceUrgencia, validarMensaje, diasParaChat, juntar, disponible, enviar, leer, entrar, conversaciones, leerPanel, responder, MAX, POR_DIA, DIAS_MINIMOS };
if(typeof module!=="undefined"&&module.exports) module.exports=Chat;
else raiz.Chat=Chat;
})(typeof window!=="undefined"?window:globalThis);
