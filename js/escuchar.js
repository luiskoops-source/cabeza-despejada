/* Escuchar: la voz del teléfono lee cada tarjeta.
   Separado de app.js porque no depende de nada más de la app: solo de las tarjetas (.card) de la página.
   Se carga después de app.js, cuando las tarjetas ya están dibujadas. */
"use strict";
/* Usa la voz que trae el sistema (speechSynthesis): es gratis, funciona sin internet y no envía nada a ningún servidor. */
(function(){
  if(!("speechSynthesis" in window)) return; /* Si el teléfono no tiene voz, no se muestran los botones */
  const voz=window.speechSynthesis;
  let leyendo=null; /* La tarjeta que se está leyendo ahora (o null) */
  /* Elige una voz en español: primero de Chile, después de Latinoamérica y al final cualquiera en español */
  function vozEspanol(){
    const vs=voz.getVoices();
    return ["es-CL","es-US","es-MX","es-419","es-AR","es-ES"].map(l=>vs.find(v=>v.lang.replace("_","-")===l)).find(Boolean)||vs.find(v=>/^es/i.test(v.lang))||null;
  }
  /* Saca el texto que se ve en la tarjeta, sin los botones ni los campos.
     La clase "leyendo-texto" los esconde un instante solo para leer innerText (no alcanza a verse en pantalla). */
  function textoDe(card){
    card.classList.add("leyendo-texto");
    const t=card.innerText;
    card.classList.remove("leyendo-texto");
    /* Cada línea se vuelve una frase: así la voz hace una pausa entre títulos y párrafos */
    /* Los títulos se ven en MAYÚSCULAS por estilo; se pasan a minúsculas para que la voz no los deletree */
    return t.split("\n").map(x=>x.trim().replace(/\b[A-ZÁÉÍÓÚÑ]{2,}\b/g,w=>w.toLowerCase())).filter(Boolean);
  }
  function detener(){ voz.cancel(); if(leyendo){ const b=leyendo.querySelector(":scope > .leer"); if(b){ b.textContent="🔊"; b.setAttribute("aria-label","Escuchar esta parte"); } } leyendo=null; }
  function leer(card,boton){
    if(leyendo===card){ detener(); return; } /* Tocar de nuevo la misma tarjeta la detiene */
    detener();
    const lineas=textoDe(card); if(!lineas.length) return;
    leyendo=card; boton.textContent="⏹"; boton.setAttribute("aria-label","Detener la lectura");
    const v=vozEspanol();
    /* Se lee línea por línea: algunos teléfonos cortan los textos muy largos si van de una sola vez */
    lineas.forEach((l,i)=>{
      const u=new SpeechSynthesisUtterance(l);
      u.lang=v?v.lang:"es-CL"; if(v) u.voice=v; u.rate=0.95;
      if(i===lineas.length-1) u.onend=()=>{ if(leyendo===card) detener(); };
      voz.speak(u);
    });
  }
  /* Un botón por tarjeta. Solo las tarjetas de primer nivel, para no leer lo mismo dos veces. */
  document.querySelectorAll(".card").forEach(card=>{
    if(card.parentElement.closest(".card")) return;
    const b=document.createElement("button");
    b.className="leer"; b.type="button"; b.textContent="🔊"; b.setAttribute("aria-label","Escuchar esta parte");
    b.onclick=e=>{ e.stopPropagation(); leer(card,b); };
    card.classList.add("con-leer"); card.prepend(b);
  });
  /* Al cambiar de pestaña o cerrar la app, se calla */
  document.querySelectorAll('.tabs [role="tab"]').forEach(t=>t.addEventListener("click",detener));
  document.addEventListener("visibilitychange",()=>{ if(document.hidden) detener(); });
  voz.getVoices(); /* Pide la lista de voces de antemano: en Android llega con un pequeño atraso */
})();
