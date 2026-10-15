/* Respaldo de los datos de la persona. Dos formas, las dos sin cuenta ni correo:
   1. Copia en archivo: la app arma un archivo con todo y la persona lo guarda donde quiera (Drive, Proton, Nextcloud...).
   2. Nube cifrada (opcional): los datos se cifran EN EL TELÉFONO con un código secreto que solo tiene la persona,
      y al servidor llega texto ilegible. Con el mismo código se recuperan en otro teléfono.
   Este archivo no toca la pantalla: solo arma, revisa, cifra y envía. Lo usa js/app.js y lo prueba tests/pruebas.js. */
(function(raiz){
"use strict";

/* Servidor de la nube cifrada (Supabase, código abierto). Mientras esté vacío, la nube aparece como "próximamente".
   La claveAnon de Supabase es pública por diseño: solo deja llamar a las dos funciones de servidor/supabase.sql. */
const NUBE={ url:"", claveAnon:"" };
const nubeLista=()=>Boolean(NUBE.url&&NUBE.claveAnon);

const APP="cabeza-despejada";
const VERSION=1;
/* Lo que no viaja en un respaldo: el PIN (es de este teléfono) y la respuesta guardada de Claude */
const FUERA=["pin","dailyAI"];

/* ---------- 1. Copia en archivo ---------- */

/* Arma el contenido de la copia a partir del estado de la app */
function crearRespaldo(estado, ahora){
  const datos={};
  for(const k of Object.keys(estado||{})) if(!FUERA.includes(k)) datos[k]=estado[k];
  return { app:APP, version:VERSION, creado:(ahora||new Date()).toISOString(), datos };
}

/* Revisa un texto pegado o un archivo abierto. Devuelve los datos o lanza un error que se puede mostrar tal cual */
function leerRespaldo(texto){
  let obj;
  try{ obj=JSON.parse(String(texto||"").trim()); }catch(e){ throw new Error("Ese archivo no es una copia de Cabeza Despejada."); }
  /* Copias de antes (el estado tal cual, sin envoltorio): se aceptan si traen el historial */
  if(obj&&obj.app===undefined&&Array.isArray(obj.events)) obj={ app:APP, version:VERSION, creado:null, datos:obj };
  if(!obj||obj.app!==APP||typeof obj.datos!=="object"||obj.datos===null||Array.isArray(obj.datos)) throw new Error("Ese archivo no es una copia de Cabeza Despejada.");
  if(Number(obj.version)>VERSION) throw new Error("Esta copia viene de una versión más nueva de la app. Actualízala y vuelve a intentar.");
  const d=obj.datos;
  if(d.events!==undefined&&!Array.isArray(d.events)) throw new Error("La copia está dañada: el historial no se puede leer.");
  if(d.day0!==undefined&&d.day0!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(d.day0)) throw new Error("La copia está dañada: el Día 0 no se puede leer.");
  const limpio={};
  for(const k of Object.keys(d)) if(!FUERA.includes(k)) limpio[k]=d[k];
  return { datos:limpio, creado:obj.creado||null };
}

/* Nombre del archivo: cabeza-despejada-2026-10-14.json */
function nombreArchivo(ahora){
  const f=ahora||new Date();
  const p=n=>String(n).padStart(2,"0");
  return `${APP}-${f.getFullYear()}-${p(f.getMonth()+1)}-${p(f.getDate())}.json`;
}

/* ---------- 2. Nube cifrada ---------- */

const cripto=()=>raiz.crypto&&raiz.crypto.subtle?raiz.crypto:null;
/* Letras del código: sin I, L, O ni U para que no se confundan al copiarlo a mano */
const ALFABETO="0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/* Código secreto nuevo: 120 bits al azar, en 6 grupos de 4 (ej. K7QM-2XJD-...) */
function nuevoCodigo(){
  const bytes=cripto().getRandomValues(new Uint8Array(15));
  let bits="", txt="";
  for(const b of bytes) bits+=b.toString(2).padStart(8,"0");
  for(let i=0;i<bits.length;i+=5) txt+=ALFABETO[parseInt(bits.slice(i,i+5),2)];
  return txt.match(/.{4}/g).join("-");
}

/* Limpia lo que la persona escribió: mayúsculas, sin guiones ni espacios, y corrige letras parecidas */
function normalizarCodigo(c){
  return String(c||"").toUpperCase().replace(/[\s-]/g,"").replace(/O/g,"0").replace(/[IL]/g,"1").replace(/U/g,"V");
}
function codigoValido(c){
  const n=normalizarCodigo(c);
  return n.length===24&&[...n].every(ch=>ALFABETO.includes(ch));
}

/* Del código salen dos cosas distintas: el número de casillero (lo ve el servidor) y la llave (nunca sale del teléfono) */
async function derivar(codigo){
  if(!codigoValido(codigo)) throw new Error("El código no está completo. Son 24 letras y números.");
  const s=cripto().subtle;
  const base=await s.importKey("raw",new TextEncoder().encode(normalizarCodigo(codigo)),"HKDF",false,["deriveBits","deriveKey"]);
  const sal=new TextEncoder().encode(APP);
  const bitsId=await s.deriveBits({name:"HKDF",hash:"SHA-256",salt:sal,info:new TextEncoder().encode("casillero")},base,256);
  const id=[...new Uint8Array(bitsId)].map(b=>b.toString(16).padStart(2,"0")).join("");
  const llave=await s.deriveKey({name:"HKDF",hash:"SHA-256",salt:sal,info:new TextEncoder().encode("llave")},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
  return { id, llave };
}

const aBase64=u8=>{ let t=""; for(let i=0;i<u8.length;i+=0x8000) t+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000)); return btoa(t); };
const deBase64=t=>Uint8Array.from(atob(t),ch=>ch.charCodeAt(0));

/* Cifra cualquier objeto. Resultado: "v1.<vector>.<texto cifrado>" (ilegible sin la llave) */
async function cifrar(obj, llave){
  const iv=cripto().getRandomValues(new Uint8Array(12));
  const ct=await cripto().subtle.encrypt({name:"AES-GCM",iv},llave,new TextEncoder().encode(JSON.stringify(obj)));
  return "v1."+aBase64(iv)+"."+aBase64(new Uint8Array(ct));
}
async function descifrar(texto, llave){
  const partes=String(texto||"").split(".");
  if(partes.length!==3||partes[0]!=="v1") throw new Error("Lo que hay en la nube no se puede leer.");
  try{
    const pt=await cripto().subtle.decrypt({name:"AES-GCM",iv:deBase64(partes[1])},llave,deBase64(partes[2]));
    return JSON.parse(new TextDecoder().decode(pt));
  }catch(e){ throw new Error("Ese código no abre este respaldo. Revisa que esté bien escrito."); }
}

/* Llama a una función del servidor (ver servidor/supabase.sql) */
async function llamar(funcion, cuerpo){
  if(!nubeLista()) throw new Error("La nube todavía no está disponible.");
  let r;
  try{
    r=await fetch(NUBE.url.replace(/\/$/,"")+"/rest/v1/rpc/"+funcion,{
      method:"POST",
      headers:{ "Content-Type":"application/json", apikey:NUBE.claveAnon, Authorization:"Bearer "+NUBE.claveAnon },
      body:JSON.stringify(cuerpo)
    });
  }catch(e){ throw new Error("Sin conexión. Se intentará de nuevo más tarde."); }
  if(!r.ok) throw new Error("La nube no respondió bien. Se intentará de nuevo más tarde.");
  const t=await r.text();
  return t?JSON.parse(t):null;
}

/* Sube el estado cifrado al casillero del código */
async function subirNube(codigo, estado){
  const { id, llave }=await derivar(codigo);
  await llamar("guardar_respaldo",{ p_id:id, p_datos:await cifrar(crearRespaldo(estado),llave) });
  return new Date().toISOString();
}
/* Baja y descifra. Devuelve null si ese código todavía no tiene nada guardado */
async function bajarNube(codigo){
  const { id, llave }=await derivar(codigo);
  const texto=await llamar("leer_respaldo",{ p_id:id });
  if(!texto) return null;
  return leerRespaldo(JSON.stringify(await descifrar(texto,llave)));
}

const Respaldo={ crearRespaldo, leerRespaldo, nombreArchivo, nuevoCodigo, normalizarCodigo, codigoValido, derivar, cifrar, descifrar, subirNube, bajarNube, nubeLista, NUBE };
if(typeof module!=="undefined"&&module.exports) module.exports=Respaldo;
else raiz.Respaldo=Respaldo;
})(typeof window!=="undefined"?window:globalThis);
