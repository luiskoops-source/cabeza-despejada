/* Respiración 4-7-8: inhalar 4, sostener 7, botar el aire en 8. Pantalla completa (#respira en index.html).
   Separado de app.js porque no depende del resto: solo de Calculos.fase478 (js/calculos.js) y de su pantalla.
   Cualquier botón con el atributo data-respira la abre. Las preferencias (vueltas, vibrar, voz) quedan en este teléfono. */
"use strict";
(function(){
  const $=id=>document.getElementById(id);
  const C=window.Calculos;
  const PREF="cd.respira";
  const TEXTO={ inhala:"Inhala", sosten:"Sostén", exhala:"Bota el aire" };
  const ESCALA={ inhala:1.18, sosten:1.18, exhala:0.82 };
  let pref={ vueltas:4, vibrar:true, voz:false };
  try{ pref=Object.assign(pref,JSON.parse(localStorage.getItem(PREF)||"{}")); }catch(e){}
  const guardar=()=>{ try{ localStorage.setItem(PREF,JSON.stringify(pref)); }catch(e){} };

  let reloj=null, inicio=0, faseAnterior="", pantallaEncendida=null;

  /* La voz del teléfono dice cada fase (gratis, sin internet, no envía nada) */
  function decir(t){
    if(!pref.voz||!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(t); u.lang="es-CL"; u.rate=0.9; speechSynthesis.speak(u);
  }
  function vibrar(){ if(pref.vibrar&&navigator.vibrate) navigator.vibrate(40); }

  /* El círculo crece o se achica durante lo que dura la fase */
  function mover(fase, dura){
    const c=$("respiraCirculo");
    c.style.transitionDuration=(fase==="sosten"?0.3:dura)+"s";
    c.style.transform="scale("+ESCALA[fase]+")";
  }

  function tic(){
    const f=C.fase478((performance.now()-inicio)/1000, pref.vueltas);
    if(f.terminado){ terminar(); return; }
    if(f.fase!==faseAnterior){ faseAnterior=f.fase; $("respiraFase").textContent=TEXTO[f.fase]; mover(f.fase,f.dura); vibrar(); decir(TEXTO[f.fase]); }
    $("respiraNum").textContent=f.quedan;
    $("respiraVuelta").textContent="Vuelta "+f.vuelta+" de "+pref.vueltas;
  }

  function empezar(){
    detener();
    /* Seguro: si los archivos de la app quedaron de versiones distintas, avisar en vez de quedarse pegado */
    if(!C||typeof C.fase478!=="function"){ $("respiraVuelta").textContent="Falta actualizar la app: ciérrala del todo y vuelve a abrirla."; return; }
    inicio=performance.now(); faseAnterior="";
    $("respiraEmpezar").textContent="Detener";
    /* Que la pantalla no se apague a mitad del ejercicio (si el teléfono lo permite) */
    try{ navigator.wakeLock&&navigator.wakeLock.request("screen").then(w=>pantallaEncendida=w).catch(()=>{}); }catch(e){}
    tic(); reloj=setInterval(tic,200);
  }
  function detener(){
    clearInterval(reloj); reloj=null;
    try{ speechSynthesis.cancel(); }catch(e){}
    try{ pantallaEncendida&&pantallaEncendida.release(); }catch(e){} pantallaEncendida=null;
    $("respiraEmpezar").textContent="Empezar";
    $("respiraFase").textContent="Listo"; $("respiraNum").textContent="";
    const c=$("respiraCirculo"); c.style.transitionDuration="0.6s"; c.style.transform="scale(1)";
  }
  function terminar(){
    detener();
    $("respiraFase").textContent="Bien hecho";
    $("respiraVuelta").textContent="Terminaste "+pref.vueltas+" vueltas. Nota cómo está tu cuerpo ahora. Puedes repetir cuando quieras.";
    vibrar(); decir("Bien hecho");
  }

  function abrir(){
    $("respiraVueltas").value=String(pref.vueltas);
    $("respiraVibrar").checked=!!pref.vibrar; $("respiraVoz").checked=!!pref.voz;
    $("respiraVibrar").closest("label").hidden=!navigator.vibrate; /* Si el teléfono no vibra, no se ofrece */
    $("respiraVoz").closest("label").hidden=!("speechSynthesis" in window);
    $("respiraVuelta").textContent=pref.vueltas===4?"Cuatro vueltas toman poco más de un minuto.":"Ocho vueltas toman unos dos minutos y medio.";
    $("respira").hidden=false; document.body.style.overflow="hidden";
    $("respira").scrollTop=0;
  }
  function cerrar(){ detener(); $("respira").hidden=true; document.body.style.overflow=""; }

  document.querySelectorAll("[data-respira]").forEach(b=>b.addEventListener("click",abrir));
  $("respiraCerrar").onclick=cerrar;
  $("respiraEmpezar").onclick=()=>{ reloj?detener():empezar(); };
  $("respiraVueltas").onchange=()=>{ pref.vueltas=Number($("respiraVueltas").value)===8?8:4; guardar(); if(reloj) empezar(); };
  $("respiraVibrar").onchange=()=>{ pref.vibrar=$("respiraVibrar").checked; guardar(); };
  $("respiraVoz").onchange=()=>{ pref.voz=$("respiraVoz").checked; guardar(); };
  /* Si la persona sale de la app, el ejercicio se detiene (el reloj del teléfono se frena en segundo plano) */
  document.addEventListener("visibilitychange",()=>{ if(document.hidden&&reloj) detener(); });
})();
