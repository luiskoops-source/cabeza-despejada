/* Paseo del salchicha: de vez en cuando, por sorpresa, el salchicha negro cruza la pantalla, se detiene,
   te pasa la lengua (lame la pantalla) y sigue su camino. También aparece al terminar la respiración 4-7-8.
   Cuidados: máximo 3 veces al día, nunca en el Modo calma, el Modo ganas ni con el PIN puesto,
   y nunca si el teléfono pide menos movimiento. Separado de app.js: no depende del resto.
   Desde otros archivos se llama con window.paseoSalchicha() (lo usa js/respira.js). */
"use strict";
(function(){
  const POR_DIA=3, GUARDADO="cd.paseo", VISITAS_DIA=2, GUARDADO_VISITA="cd.visita", APAGADO="cd.salchicha";
  /* La persona puede apagar las visitas en Configuración o con "No volver a mostrar" */
  const apagado=()=>{ try{ return localStorage.getItem(APAGADO)==="no"; }catch(e){ return false; } };
  function apagar(si){ try{ si?localStorage.setItem(APAGADO,"no"):localStorage.removeItem(APAGADO); }catch(e){} }
  const menosMovimiento=()=>window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoy=()=>{ const d=new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); };
  function leer(clave){ try{ const v=JSON.parse(localStorage.getItem(clave||GUARDADO)||"{}"); return v.fecha===hoy()?v:{fecha:hoy(),n:0}; }catch(e){ return {fecha:hoy(),n:0}; } }
  function contar(clave){ const v=leer(clave); v.n++; try{ localStorage.setItem(clave||GUARDADO,JSON.stringify(v)); }catch(e){} }
  /* No interrumpir momentos difíciles: Modo calma, Modo ganas o el bloqueo con PIN */
  function momentoTranquilo(){ return ["calma","crave","lock","respira","welcome"].every(id=>{ const el=document.getElementById(id); return !el||el.hidden; }); }

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
    if(enCamino||menosMovimiento()||document.hidden||apagado()) return false;
    if(!forzar&&(leer().n>=POR_DIA||!momentoTranquilo())) return false;
    enCamino=true; contar();
    const el=document.createElement("div");
    el.className="paseo"; el.innerHTML=DIBUJO;
    /* Si lo tocas, da un saltito de gusto y te vuelve a lamer */
    el.onclick=()=>{ el.classList.remove("mimo"); void el.offsetWidth; el.classList.add("mimo"); lamer(el); };
    document.body.appendChild(el);
    void el.offsetWidth; el.classList.add("entra");
    setTimeout(()=>{ el.classList.add("quieto"); lamer(el); },3200);
    setTimeout(()=>{ el.classList.remove("quieto"); el.classList.add("sale"); },6000);
    setTimeout(()=>{ el.remove(); enCamino=false; },9200);
    return true;
  }
  window.paseoSalchicha=()=>paseo(true);

  /* ---------- Visita: el compañero (inspirado en el clip de Windows de los 90) ----------
     Asoma por la esquina de abajo, da vueltas persiguiéndose la cola y deja un consejo en un globo.
     Algunos consejos traen un botón que lleva a esa parte de la app. Se va solo si no lo tocas. */
  const ir=(tab,id)=>{ const b=document.querySelector('.tabs [data-tab="'+tab+'"]'); if(b) b.click(); setTimeout(()=>{ const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); },60); };
  const CONSEJOS=[
    {t:"¿Tomaste agua hoy? El cuerpo lo agradece, y con sed las ganas aprietan más."},
    {t:"Si vienen las ganas, respiramos juntos. Son poco más de un minuto.", boton:"Respirar", hacer:()=>{ const b=document.getElementById("openRespira"); if(b) b.click(); }},
    {t:"Las ganas suben, llegan a un máximo y bajan. Esta también va a pasar."},
    {t:"Dormir bien es de las mejores ayudas que hay. Hoy, a la cama un poco más temprano."},
    {t:"Un día a la vez. Hoy cuenta, aunque sea un día chico."},
    {t:"Lo que avanzaste no se borra, pase lo que pase."},
    {t:"Comer algo a tus horas ayuda a que las ganas no aprieten tanto."},
    {t:"¿Quieres contar o celebrar algo? Puedes dejar tu historia, sin nombre.", boton:"Ver", hacer:()=>ir("saber","cuentanCard")},
    {t:"Si alguien que quieres está pasando por esto, en Ayuda hay ideas para acompañar.", boton:"Ver", hacer:()=>ir("ayuda","acompanarCard")},
    {t:"Salir a caminar diez minutos cambia más de lo que parece. Yo te acompaño."}
  ];
  /* Su propio cactus chiquito, con carita: después de dar vueltas, se acurruca junto a él y sale un corazón */
  const MINI_CACTUS='<svg class="mini-cactus" viewBox="0 0 40 70" width="30" height="52" aria-hidden="true">'+
    '<rect x="10" y="12" width="20" height="54" rx="10" fill="#F4EEE1" stroke="#262626" stroke-width="2.5"/>'+
    '<path d="M13 13 l1 -8 l5 5 l3 -7 l3 7 l5 -5 l-1 8 z" fill="#9DC54A" stroke="#262626" stroke-width="2" stroke-linejoin="round"/>'+
    '<path d="M14 30 q2.5 -3 5 0 M21 30 q2.5 -3 5 0" fill="none" stroke="#262626" stroke-width="2" stroke-linecap="round"/>'+
    '<ellipse cx="13.5" cy="35" rx="2.5" ry="1.6" fill="#E8907A" opacity=".8"/><ellipse cx="26.5" cy="35" rx="2.5" ry="1.6" fill="#E8907A" opacity=".8"/>'+
    '<path d="M17 36 q3 3 6 0" fill="none" stroke="#262626" stroke-width="2" stroke-linecap="round"/></svg>';
  let visitando=false;
  function visita(){
    if(visitando||enCamino||menosMovimiento()||document.hidden||apagado()) return false;
    if(leer(GUARDADO_VISITA).n>=VISITAS_DIA||!momentoTranquilo()) return false;
    visitando=true; contar(GUARDADO_VISITA);
    const c=CONSEJOS[Math.floor(Math.random()*CONSEJOS.length)];
    const el=document.createElement("div");
    el.className="compa"; el.setAttribute("role","status");
    el.innerHTML='<div class="compa-globo"><p></p><div class="compa-botones">'+(c.boton?'<button class="primary small" data-a="hacer"></button>':'')+
      '<button class="small" data-a="gracias">Gracias</button><button class="ghost small" data-a="nunca">No volver a mostrar</button></div></div>'+
      '<div class="compa-perro"><span class="compa-svg">'+DIBUJO+'</span>'+MINI_CACTUS+'<span class="compa-corazon" aria-hidden="true">♥</span></div>';
    el.querySelector("p").textContent=c.t;
    if(c.boton) el.querySelector('[data-a="hacer"]').textContent=c.boton;
    let fuera=null;
    const irse=()=>{ clearTimeout(fuera); el.classList.add("sale"); setTimeout(()=>{ el.remove(); visitando=false; },700); };
    el.querySelectorAll("button").forEach(b=>b.onclick=()=>{ if(b.dataset.a==="hacer") c.hacer(); if(b.dataset.a==="nunca"){ apagar(true); const cfg=document.getElementById("cfgSalchicha"); if(cfg) cfg.checked=false; } irse(); });
    /* Si tocas al perrito, vuelve a dar vueltas */
    el.querySelector(".compa-perro").onclick=()=>{ const d=el.querySelector(".compa-perro"); d.classList.remove("gira"); void d.offsetWidth; d.classList.add("gira"); };
    document.body.appendChild(el);
    void el.offsetWidth; el.classList.add("entra");
    el.querySelector(".compa-perro").classList.add("gira");
    setTimeout(()=>el.querySelector(".compa-perro").classList.add("acurruca"),2700); /* después de las vueltas, junto a su cactus */
    fuera=setTimeout(irse,16000); /* Se va solo después de un rato */
    return true;
  }
  window.visitaSalchicha=visita;

  /* Interruptor en Configuración */
  const cfg=document.getElementById("cfgSalchicha");
  if(cfg){ cfg.checked=!apagado(); cfg.onchange=()=>apagar(!cfg.checked); }

  /* La visita llega una vez por cada vez que se abre la app, entre 1 minuto y medio y 4 minutos de uso */
  setTimeout(function intentar(){ if(!visita()&&!visitando&&!apagado()&&leer(GUARDADO_VISITA).n<VISITAS_DIA) setTimeout(()=>visita(),60000); }, 90000+Math.random()*150000);

  /* Por sorpresa: una vez por cada vez que se abre la app, en algún momento entre 40 segundos y 2 minutos y medio */
  setTimeout(()=>paseo(false), 40000+Math.random()*110000);
})();
