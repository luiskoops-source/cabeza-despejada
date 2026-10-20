/* Paseo del salchicha: de vez en cuando, por sorpresa, el salchicha negro cruza la pantalla, se detiene,
   te pasa la lengua (lame la pantalla) y sigue su camino. También aparece al terminar la respiración 4-7-8.
   Cuidados: máximo 3 veces al día, nunca en el Modo calma, el Modo ganas ni con el PIN puesto,
   y nunca si el teléfono pide menos movimiento. Separado de app.js: no depende del resto.
   A veces, en vez de caminar, cruza corriendo, baja en paracaídas o aparece haciendo yoga: es la mascota de la app.
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
  /* No interrumpir momentos difíciles (Modo calma, Modo ganas, el bloqueo con PIN), ni a quien está escribiendo algo */
  const escribiendo=()=>{ const a=document.activeElement; return !!a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); };
  /* De madrugada no hay sorpresas: es hora de dormir, no de paracaídas (usa Calculos.esMadrugada si está cargado) */
  const deMadrugada=()=>!!(window.Calculos&&window.Calculos.esMadrugada(new Date().getHours()));
  function momentoTranquilo(){ return !escribiendo()&&!deMadrugada()&&["calma","crave","lock","respira","rato","discusion","welcome"].every(id=>{ const el=document.getElementById(id); return !el||el.hidden; }); }

  /* El dibujo: el mismo salchicha negro con café de la respiración, caminando hacia la derecha */
  const DIBUJO='<svg class="paseo-perro" viewBox="0 0 220 130" width="150" height="89" aria-hidden="true">'+
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
      '<path class="oreja" d="M146 36 q-16 4 -12 34 q2 10 10 6 q6 -14 8 -38 z" fill="#2c2926"/>'+
      '<path d="M162 47 q5 4 10 0" fill="none"/>'+
      '<circle cx="170" cy="40" r="2.6" fill="#B9773F" stroke="none"/>'+
    '</g></svg>';

  /* Floy: el mismo salchicha, con su chaleco café de patitas de colores y la correa azul (como en el dibujo del cumpleaños).
     El chaleco va entre el cuerpo y la cabeza; stroke="none" para que las patitas no tomen el borde claro del dibujo */
  const CHALECO='<g class="chaleco">'+
    '<rect x="62" y="56" width="92" height="46" rx="20" fill="#6B3F22" stroke="#F4EEE1" stroke-width="2.5"/>'+
    '<rect x="138" y="54" width="14" height="50" rx="7" fill="#2F5FB3" stroke="#F4EEE1" stroke-width="2.5"/>'+
    '<g stroke="none"><g fill="#F6C744"><circle cx="84" cy="74" r="5"/><circle cx="79" cy="66" r="2.2"/><circle cx="85" cy="64" r="2.2"/><circle cx="90" cy="67" r="2.2"/></g>'+
    '<g fill="#F08F4A"><circle cx="110" cy="88" r="5"/><circle cx="105" cy="80" r="2.2"/><circle cx="111" cy="78" r="2.2"/><circle cx="116" cy="81" r="2.2"/></g>'+
    '<g fill="#86B85A"><circle cx="124" cy="70" r="4.5"/><circle cx="120" cy="63" r="2"/><circle cx="125" cy="61" r="2"/><circle cx="130" cy="64" r="2"/></g></g></g>';
  const FLOY=DIBUJO.replace('<path class="lengua"',CHALECO+'<path class="lengua"');
  /* Quién aparece: Kay es el salchicha negro de siempre; Floy, la del chaleco */
  const quienPasea=tipo=>tipo==="floy"?"Floy":tipo==="juntos"?"Kay y Floy":"Kay";

  /* Paracaídas con los colores del cactus (verde) y de su flor (rosado y amarillo). Las cuerdas llegan al lomo del salchicha */
  const TELA='<svg class="tela" viewBox="0 0 150 110" width="150" height="110" aria-hidden="true">'+
    '<path d="M8 50 L64 108 M38 50 L65 108 M112 50 L66 108 M142 50 L67 108" stroke="#262626" stroke-width="1.5" fill="none"/>'+
    '<path d="M6 50 Q6 4 75 4 Q144 4 144 50 Q127 42 110 50 Q92 42 75 50 Q58 42 40 50 Q23 42 6 50 Z" fill="#86B85A" stroke="#262626" stroke-width="2.5" stroke-linejoin="round"/>'+
    '<path d="M52 47 Q54 8 75 4 Q96 8 98 47 Q86 42 75 50 Q64 42 52 47 Z" fill="#F4A6B8" stroke="#262626" stroke-width="2.5" stroke-linejoin="round"/>'+
    '<circle cx="75" cy="5" r="5" fill="#F6C744" stroke="#262626" stroke-width="2"/></svg>';

  /* Yoga: la postura que en español se llama "perro boca abajo". Patas de adelante estiradas, pecho abajo, cola arriba y ojos cerrados de tranquilidad */
  const YOGA='<svg class="paseo-perro" viewBox="0 0 220 130" width="150" height="89" aria-hidden="true">'+
    '<rect class="mat" x="14" y="116" width="192" height="8" rx="4" fill="#8FB8DA"/>'+
    '<g class="yoga-perro" stroke-linecap="round" stroke-linejoin="round" fill="none">'+
      '<path class="cola" d="M60 42 q-16 -20 -6 -38" stroke="#F4EEE1" stroke-width="13"/><path class="cola" d="M60 42 q-16 -20 -6 -38" stroke="#1d1b19" stroke-width="9"/>'+
      '<path d="M64 52 L50 110 M76 56 L66 110" stroke="#F4EEE1" stroke-width="18"/><path d="M64 52 L50 110 M76 56 L66 110" stroke="#1d1b19" stroke-width="13"/>'+
      '<ellipse cx="48" cy="114" rx="10" ry="5.5" fill="#B9773F" stroke="#F4EEE1" stroke-width="2.5"/><ellipse cx="66" cy="114" rx="10" ry="5.5" fill="#B9773F" stroke="#F4EEE1" stroke-width="2.5"/>'+
      '<path d="M124 106 L170 110 M132 100 L182 106" stroke="#F4EEE1" stroke-width="18"/><path d="M124 106 L170 110 M132 100 L182 106" stroke="#1d1b19" stroke-width="13"/>'+
      '<ellipse cx="174" cy="112" rx="10" ry="5.5" fill="#B9773F" stroke="#F4EEE1" stroke-width="2.5"/><ellipse cx="186" cy="108" rx="10" ry="5.5" fill="#B9773F" stroke="#F4EEE1" stroke-width="2.5"/>'+
      '<g class="yoga-cuerpo"><path d="M70 50 L128 90" stroke="#F4EEE1" stroke-width="45"/><path d="M70 50 L128 90" stroke="#1d1b19" stroke-width="40"/>'+
      '<ellipse cx="128" cy="104" rx="13" ry="6" fill="#B9773F" transform="rotate(20 128 104)"/></g>'+
      '<g stroke="#F4EEE1" stroke-width="2.5"><circle cx="152" cy="70" r="20" fill="#1d1b19"/>'+
      '<ellipse cx="173" cy="78" rx="15" ry="9" fill="#B9773F"/><circle cx="187" cy="75" r="3.8" fill="#1d1b19"/>'+
      '<path d="M140 54 q-15 4 -11 30 q2 9 9 5 q5 -13 7 -33 z" fill="#2c2926"/>'+
      '<path d="M155 66 q4.5 3.5 9 0" stroke="#F4EEE1" stroke-width="2.2"/><circle cx="160" cy="58" r="2.4" fill="#B9773F" stroke="none"/></g>'+
    '</g></svg>';
  const POLVO='<span class="polvo"></span><span class="polvo"></span><span class="polvo"></span>';

  /* No eres el único (datos/no-eres-el-unico.js): personas conocidas que se recuperaron, historia y datos.
     Elige uno al azar, sin repetir el último que salió */
  const DATOS=window.NO_ERES_EL_UNICO||[];
  let ultimoDato=-1;
  function datoAlAzar(){
    if(!DATOS.length) return null;
    let i=Math.floor(Math.random()*DATOS.length);
    if(i===ultimoDato&&DATOS.length>1) i=(i+1)%DATOS.length;
    ultimoDato=i; return DATOS[i];
  }
  /* El globo que muestra el dato: título, texto y fuente chiquita. Se llena con textContent (nunca HTML) */
  function llenarDato(globo,d){
    globo.querySelector("p").textContent=d.t;
    globo.querySelector("small").textContent=d.f?"Fuente: "+d.f:"";
  }
  /* Segundos extra que el salchicha se queda quieto para que alcances a leer el globo */
  const PARA_LEER=9500;

  let enCamino=false;
  /* Un corazón por cada toque: si lo tocas muchas veces, salen muchos corazones (máximo 12 a la vez) */
  function corazon(el){
    if(el.querySelectorAll(".paseo-corazon").length>=12) return;
    const c=document.createElement("span");
    c.className="paseo-corazon"; c.textContent="♥";
    c.style.left=(80+Math.random()*60)+"px"; c.style.setProperty("--giro",(Math.random()*40-20)+"deg");
    el.appendChild(c); setTimeout(()=>c.remove(),1700);
  }
  function lamer(el){
    el.classList.remove("lame"); void el.offsetWidth; /* reinicia la animación si ya estaba lamiendo */
    el.classList.add("lame"); corazon(el);
    if(navigator.vibrate) navigator.vibrate([20,80,20,80,20]); /* tres lengüetazos, suaves */
  }
  function saltito(el){ el.classList.remove("mimo"); void el.offsetWidth; el.classList.add("mimo"); }

  /* Las apariciones, al azar: caminar es la más común; correr, el paracaídas y el yoga son sorpresas.
     Cada una sabe cuándo se detiene y cuándo se va (los tiempos calzan con las animaciones de css/estilos.css, .paseo) */
  const TIPOS=["camina","camina","floy","juntos","corre","paracaidas","yoga"];
  const PASOS={
    /* Camina hasta el medio (3,2 s), se detiene y lame (2,8 s), y sigue hasta salir (3 s).
       Si trae un dato (extra), se queda más rato con el globo abierto */
    camina:(el,luego,extra)=>{ luego(3200,()=>{ el.classList.add("quieto","habla"); lamer(el); }); luego(6000+extra,()=>{ el.classList.remove("quieto"); el.classList.add("sale"); }); return 9200+extra; },
    /* Cruza corriendo de una, con la lengua afuera y polvito detrás */
    corre:()=>2900,
    /* Baja balanceándose (5,5 s), aterriza, se le desinfla el paracaídas, te lame y se va caminando */
    paracaidas:(el,luego,extra)=>{ luego(5500,()=>{ el.classList.add("aterriza","quieto"); saltito(el); }); luego(6200,()=>{ lamer(el); el.classList.add("habla"); }); luego(8600+extra,()=>{ el.classList.remove("quieto"); el.classList.add("sale"); }); return 11800+extra; },
    /* Aparece sobre su colchoneta, sostiene la postura respirando y se desvanece */
    yoga:(el,luego)=>{ luego(6000,()=>el.classList.add("sale")); return 7000; }
  };
  /* Floy sola, o Kay con Floy detrás: caminan igual que Kay (se detienen, lamen y siguen) */
  PASOS.floy=PASOS.camina; PASOS.juntos=PASOS.camina;
  function paseo(forzar,tipo){
    if(enCamino||menosMovimiento()||document.hidden||apagado()) return false;
    if(!forzar&&(leer().n>=POR_DIA||!momentoTranquilo())) return false;
    enCamino=true; contar();
    if(!PASOS[tipo]) tipo=TIPOS[Math.floor(Math.random()*TIPOS.length)];
    const el=document.createElement("div");
    el.className="paseo "+tipo;
    const dibujo=tipo==="yoga"?YOGA:tipo==="floy"?FLOY:DIBUJO;
    el.innerHTML='<div class="paseo-mueve">'+dibujo+(tipo==="juntos"?'<span class="paseo-floy">'+FLOY+'</span>':"")+(tipo==="paracaidas"?TELA:"")+(tipo==="corre"?POLVO:"")+'</div>'+
      (tipo==="yoga"?'<span class="yoga-globo">Perro boca abajo</span>':"");
    /* Cuando camina o baja en paracaídas, se detiene y te deja un dato de "No eres el único" */
    const dato=(tipo!=="corre"&&tipo!=="yoga")?datoAlAzar():null;
    if(dato){
      const globo=document.createElement("div");
      globo.className="paseo-globo"; globo.setAttribute("role","status");
      globo.innerHTML='<b></b><p></p><small></small>';
      globo.querySelector("b").textContent=quienPasea(tipo)+" · No eres el único"; /* quién te lo cuenta */
      llenarDato(globo,dato); el.appendChild(globo);
    }
    /* Si lo tocas, da un saltito de gusto y te vuelve a lamer */
    el.onclick=()=>{ saltito(el); lamer(el); };
    document.body.appendChild(el);
    void el.offsetWidth; el.classList.add("entra");
    const luego=(ms,f)=>setTimeout(f,ms);
    luego(PASOS[tipo](el,luego,dato?PARA_LEER:0),()=>{ el.remove(); enCamino=false; });
    return true;
  }
  /* Sin tipo (como al terminar la respiración), camina y te lame, como siempre. Con tipo: "corre", "paracaidas" o "yoga" */
  window.paseoSalchicha=tipo=>paseo(true,tipo||"camina");

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
    '<rect x="10" y="12" width="20" height="54" rx="10" fill="#86B85A" stroke="#262626" stroke-width="2.5"/>'+
    '<path d="M13 13 l1 -8 l5 5 l3 -7 l3 7 l5 -5 l-1 8 z" fill="#F08FA0" stroke="#262626" stroke-width="2" stroke-linejoin="round"/>'+
    '<path d="M14 30 q2.5 -3 5 0 M21 30 q2.5 -3 5 0" fill="none" stroke="#262626" stroke-width="2" stroke-linecap="round"/>'+
    '<ellipse cx="13.5" cy="35" rx="2.5" ry="1.6" fill="#E8907A" opacity=".8"/><ellipse cx="26.5" cy="35" rx="2.5" ry="1.6" fill="#E8907A" opacity=".8"/>'+
    '<path d="M17 36 q3 3 6 0" fill="none" stroke="#262626" stroke-width="2" stroke-linecap="round"/></svg>';
  let visitando=false;
  function visita(){
    if(visitando||enCamino||menosMovimiento()||document.hidden||apagado()) return false;
    if(leer(GUARDADO_VISITA).n>=VISITAS_DIA||!momentoTranquilo()) return false;
    visitando=true; contar(GUARDADO_VISITA);
    /* La mitad de las veces trae un consejo; la otra mitad, un dato de "No eres el único" con un botón para ver otro */
    const dato=Math.random()<0.5?datoAlAzar():null;
    const c=dato?{t:dato.t}:CONSEJOS[Math.floor(Math.random()*CONSEJOS.length)];
    /* A veces la visita es de Floy y no de Kay */
    const esFloy=Math.random()<0.4, nombre=esFloy?"Floy":"Kay";
    const el=document.createElement("div");
    el.className="compa"; el.setAttribute("role","status");
    el.innerHTML='<div class="compa-globo"><b class="compa-titulo"></b>'+'<p></p>'+(dato?'<small class="compa-fuente"></small>':'')+'<div class="compa-botones">'+(c.boton?'<button class="primary small" data-a="hacer"></button>':'')+(dato?'<button class="primary small" data-a="otro">Otro</button>':'')+
      '<button class="small" data-a="gracias">Gracias</button><button class="ghost small" data-a="nunca">No volver a mostrar</button></div></div>'+
      '<div class="compa-perro"><span class="compa-svg">'+(esFloy?FLOY:DIBUJO)+'</span>'+MINI_CACTUS+'<span class="compa-corazon" aria-hidden="true">♥</span></div>';
    el.querySelector(".compa-titulo").textContent=dato?nombre+" · No eres el único":nombre;
    if(dato) llenarDato(el.querySelector(".compa-globo"),dato); else el.querySelector("p").textContent=c.t;
    if(c.boton) el.querySelector('[data-a="hacer"]').textContent=c.boton;
    let fuera=null;
    const irse=()=>{ clearTimeout(fuera); el.classList.add("sale"); setTimeout(()=>{ el.remove(); visitando=false; },700); };
    el.querySelectorAll("button").forEach(b=>b.onclick=()=>{
      /* "Otro": cambia el dato y se queda un rato más para que alcances a leerlo */
      if(b.dataset.a==="otro"){ const d=datoAlAzar(); if(d) llenarDato(el.querySelector(".compa-globo"),d); clearTimeout(fuera); fuera=setTimeout(irse,16000); return; }
      if(b.dataset.a==="hacer") c.hacer(); if(b.dataset.a==="nunca"){ apagar(true); const cfg=document.getElementById("cfgSalchicha"); if(cfg) cfg.checked=false; } irse(); });
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
