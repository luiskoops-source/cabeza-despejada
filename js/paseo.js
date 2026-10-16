/* Paseo del salchicha: de vez en cuando, por sorpresa, el salchicha negro cruza la pantalla, se detiene,
   te pasa la lengua (lame la pantalla) y sigue su camino. También aparece al terminar la respiración 4-7-8.
   Cuidados: máximo 3 veces al día, nunca en el Modo calma, el Modo ganas ni con el PIN puesto,
   y nunca si el teléfono pide menos movimiento. Separado de app.js: no depende del resto.
   Desde otros archivos se llama con window.paseoSalchicha() (lo usa js/respira.js). */
"use strict";
(function(){
  const POR_DIA=3, GUARDADO="cd.paseo";
  const menosMovimiento=()=>window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoy=()=>{ const d=new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); };
  function leer(){ try{ const v=JSON.parse(localStorage.getItem(GUARDADO)||"{}"); return v.fecha===hoy()?v:{fecha:hoy(),n:0}; }catch(e){ return {fecha:hoy(),n:0}; } }
  function contar(){ const v=leer(); v.n++; try{ localStorage.setItem(GUARDADO,JSON.stringify(v)); }catch(e){} }
  /* No interrumpir momentos difíciles: Modo calma, Modo ganas o el bloqueo con PIN */
  function momentoTranquilo(){ return ["calma","crave","lock"].every(id=>{ const el=document.getElementById(id); return !el||el.hidden; }); }

  /* El dibujo: el mismo salchicha negro con café de la respiración, caminando hacia la derecha */
  const DIBUJO='<svg viewBox="0 0 220 130" width="150" height="89" aria-hidden="true">'+
    '<g stroke="#F4EEE1" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">'+
      '<path class="cola" d="M38 78 q-22 -6 -26 -26" fill="none" stroke="#1d1b19" stroke-width="9"/>'+
      '<g class="pata pata-a"><rect x="52" y="92" width="14" height="22" rx="7" fill="#1d1b19"/><ellipse cx="59" cy="115" rx="10" ry="6" fill="#B9773F"/></g>'+
      '<g class="pata pata-b"><rect x="120" y="92" width="14" height="22" rx="7" fill="#1d1b19"/><ellipse cx="127" cy="115" rx="10" ry="6" fill="#B9773F"/></g>'+
      '<rect x="34" y="58" width="122" height="44" rx="22" fill="#1d1b19"/>'+
      '<ellipse cx="138" cy="92" rx="16" ry="8" fill="#B9773F" stroke="none"/>'+
      '<path class="lengua" d="M184 66 q2 16 -5 18 q-8 -2 -3 -18 z" fill="#E8807A"/>'+
      '<circle cx="160" cy="52" r="22" fill="#1d1b19"/>'+
      '<ellipse cx="182" cy="60" rx="17" ry="10" fill="#B9773F"/>'+
      '<circle cx="198" cy="57" r="4" fill="#1d1b19"/>'+
      '<path d="M146 36 q-16 4 -12 34 q2 10 10 6 q6 -14 8 -38 z" fill="#2c2926"/>'+
      '<path d="M162 47 q5 4 10 0" fill="none"/>'+
      '<circle cx="170" cy="40" r="2.6" fill="#B9773F" stroke="none"/>'+
    '</g></svg><span class="paseo-corazon" aria-hidden="true">♥</span>';

  let enCamino=false;
  function lamer(el){
    el.classList.remove("lame"); void el.offsetWidth; /* reinicia la animación si ya estaba lamiendo */
    el.classList.add("lame");
    if(navigator.vibrate) navigator.vibrate([20,80,20,80,20]); /* tres lengüetazos, suaves */
  }

  /* Cruza la pantalla: camina hasta el medio (3,2 s), se detiene y lame (2,8 s), y sigue hasta salir (3 s) */
  function paseo(forzar){
    if(enCamino||menosMovimiento()||document.hidden) return false;
    if(!forzar&&(leer().n>=POR_DIA||!momentoTranquilo())) return false;
    enCamino=true; contar();
    const el=document.createElement("div");
    el.className="paseo"; el.innerHTML=DIBUJO;
    el.onclick=()=>lamer(el); /* Si lo tocas, te vuelve a lamer */
    document.body.appendChild(el);
    void el.offsetWidth; el.classList.add("entra");
    setTimeout(()=>{ el.classList.add("quieto"); lamer(el); },3200);
    setTimeout(()=>{ el.classList.remove("quieto"); el.classList.add("sale"); },6000);
    setTimeout(()=>{ el.remove(); enCamino=false; },9200);
    return true;
  }
  window.paseoSalchicha=()=>paseo(true);

  /* Por sorpresa: una vez por cada vez que se abre la app, en algún momento entre 40 segundos y 2 minutos y medio */
  setTimeout(()=>paseo(false), 40000+Math.random()*110000);
})();
