/* Respiración 4-7-8: inhalar 4, sostener 7, botar el aire en 8. Pantalla completa (#respira en index.html).
   Tiene más ejercicios: "Cortar la tos" (traga 2, aguanta 5, suelta lento 6) y los de la terapia de tos:
   "Olfatea y sopla", "Antes de hablar" y "Bajar los nervios" de 5 minutos (sus ritmos están en js/calculos.js).
   Separado de app.js porque no depende del resto: solo de Calculos.fase478 (js/calculos.js) y de su pantalla.
   Cualquier botón con el atributo data-respira la abre (con un valor, como data-respira="478", abre ese ejercicio). Las preferencias (vueltas, vibrar, voz) quedan en este teléfono. */
"use strict";
(function(){
  const $=id=>document.getElementById(id);
  const C=window.Calculos;
  const PREF="cd.respira";
  /* Lo que se lee en el círculo en cada paso. Los de abajo son de los ejercicios para la tos y los nervios */
  const TEXTO={ inhala:"Inhala", sosten:"Sostén", exhala:"Bota el aire", traga:"Traga", aguanta:"Aguanta", suelta:"Suelta lento",
    olfatea:"Olfatea", sopla:"Sopla", soplaLargo:"Sopla largo", descansa:"Descansa",
    sorbo:"Un sorbo", bosteza:"Bosteza", hombros:"Hombros abajo", tararea:"Mmm",
    parte1:"Respira 4 y 6", parte2:"Sopla largo", parte3:"Suspiro doble", parte4:"Suelta el cuerpo", parte5:"Cuenta tus soltadas",
    soplaLento:"Sopla lento", otroPoco:"Un poquito más", sueltaTodo:"Suelta todo",
    hombrosArriba:"Hombros arriba", hombrosCaen:"Déjalos caer", aprietaManos:"Aprieta las manos", abreManos:"Ábrelas", mandibula:"Mandíbula floja",
    cuenta:"Suelta y cuenta",
    pranaA:"Nariz alterna", pranaB:"Abeja", pranaC:"Cierre suave",
    izqInhala:"Inhala izquierda", derSuelta:"Suelta derecha", derInhala:"Inhala derecha", izqSuelta:"Suelta izquierda", zumba:"Mmm" };
  /* Qué tan grande queda el círculo: más grande al tomar aire, más chico al botarlo */
  const ESCALA={ inhala:1.18, sosten:1.18, exhala:0.82, traga:1, aguanta:1, suelta:0.82,
    olfatea:1.12, sopla:1, soplaLargo:0.8, descansa:0.92, sorbo:0.95, bosteza:1.18, hombros:0.95, tararea:1.05,
    parte1:1, parte2:1, parte3:1, parte4:1, parte5:1, soplaLento:0.8, otroPoco:1.24, sueltaTodo:0.8,
    hombrosArriba:1.1, hombrosCaen:0.88, aprietaManos:1.1, abreManos:0.88, mandibula:0.92, cuenta:0.82,
    pranaA:1, pranaB:1, pranaC:1, izqInhala:1.18, derSuelta:0.82, derInhala:1.18, izqSuelta:0.82, zumba:0.82 };
  /* Para el dibujo del perrito, las fases de la tos se parecen a las del 4-7-8: tragar y aguantar es quedarse quieto, soltar es botar el aire */
  const DIBUJO={ inhala:"inhala", sosten:"sosten", exhala:"exhala", traga:"sosten", aguanta:"sosten", suelta:"exhala",
    olfatea:"inhala", sopla:"exhala", soplaLargo:"exhala", descansa:"sosten", sorbo:"sosten", bosteza:"inhala", hombros:"exhala", tararea:"exhala",
    parte1:"sosten", parte2:"sosten", parte3:"sosten", parte4:"sosten", parte5:"sosten", soplaLento:"exhala", otroPoco:"inhala", sueltaTodo:"exhala",
    hombrosArriba:"inhala", hombrosCaen:"exhala", aprietaManos:"sosten", abreManos:"exhala", mandibula:"sosten", cuenta:"exhala",
    pranaA:"sosten", pranaB:"sosten", pranaC:"sosten", izqInhala:"inhala", derSuelta:"exhala", derInhala:"inhala", izqSuelta:"exhala", zumba:"exhala" };
  /* Bajo el círculo, qué hacer en cada paso de los ejercicios nuevos (los de 4-7-8 y tos se explican arriba) */
  const AYUDA={ olfatea:"Una olfateada corta por la nariz.", sopla:"Labios fruncidos, un soplido corto.", soplaLargo:"Otro soplido, más largo.", descansa:"Respira normal por la nariz.",
    sorbo:"Toma un sorbo de agua. Si no tienes, traga en seco.", bosteza:"Bostezo con la boca cerrada: la garganta se abre.", hombros:"Súbelos a las orejas y déjalos caer.", tararea:"Tararea suave con los labios juntos.",
    parte1:"Parte 1 de 5", parte2:"Parte 2 de 5", parte3:"Parte 3 de 5", parte4:"Parte 4 de 5", parte5:"Parte 5 de 5",
    soplaLento:"Por labios fruncidos, como enfriando una sopa.", otroPoco:"Sin soltar, otro sorbito de aire por la nariz.", sueltaTodo:"Lento por la boca, hasta vaciarte.",
    hombrosArriba:"Súbelos a las orejas y aprieta.", hombrosCaen:"Suéltalos de golpe. Siente el peso.", aprietaManos:"Puños firmes.", abreManos:"Dedos sueltos.", mandibula:"Dientes separados, lengua abajo.",
    cuenta:"Lento. Cuenta cada soltada, de una hasta diez.",
    pranaA:"Parte 1 de 3", pranaB:"Parte 2 de 3", pranaC:"Parte 3 de 3",
    izqInhala:"Tapa la nariz derecha con el pulgar. Entra suave.", derSuelta:"Tapa la izquierda y suelta lento por la derecha.",
    derInhala:"Sin cambiar de dedo, entra por la derecha.", izqSuelta:"Tapa la derecha y suelta lento por la izquierda.",
    zumba:"Suelta el aire tarareando grave, boca cerrada, como una abeja." };
  /* Cuánto falta, en minutos redondos (o de a 10 segundos en los ejercicios cortos, como Antes de hablar):
     así el texto cambia poco y no interrumpe a quien usa lector de pantalla */
  const quedanTexto=s=>s>=90?"Quedan unos "+Math.round(s/60)+" minutos":s>45?"Queda cerca de un minuto":s>15?"Quedan unos "+Math.round(s/10)*10+" segundos":"Ya casi terminas";
  /* Los dos ejercicios: qué función dice la fase, cuánto toman 4 u 8 vueltas, el título y la explicación de arriba */
  const EJERCICIOS={
    "478":{ fase:s=>C.fase478(s,pref.vueltas), pill:"Respiración 4\u20117\u20118",
      intro:'Inhala por la nariz en <b>4</b>, sostén el aire <b>7</b> y bótalo lento por la boca en <b>8</b>. Botar el aire más lento de lo que entra es lo que calma: le avisa al cuerpo que puede bajar la guardia.',
      duracion:v=>v===4?"Cuatro vueltas toman poco más de un minuto.":"Ocho vueltas toman unos dos minutos y medio." },
    "tos":{ fase:s=>C.faseTos(s,pref.vueltas), pill:"Cortar la tos",
      intro:'Apenas sientas el picor: <b>traga</b> saliva, <b>aguanta</b> el aire 5 segundos con la boca cerrada y <b>suéltalo lento por la nariz</b>. Sin aire saliendo de golpe no hay tos, y el picor baja solo.',
      duracion:v=>v===4?"Cuatro vueltas toman menos de un minuto.":"Ocho vueltas toman casi dos minutos." },
    /* Los tres de abajo vienen de la terapia de supresión de tos que usan fonoaudiólogos y kinesiólogos */
    "olfatea":{ fase:s=>C.faseOlfatea(s,pref.vueltas), pill:"Olfatea y sopla",
      intro:'Una <b>olfateada</b> corta por la nariz y dos <b>soplidos</b> con labios fruncidos, el segundo más largo. Abre la garganta y baja el picor. Sirve también para practicar sin ganas de toser, varias veces al día.',
      duracion:v=>v===4?"Cuatro vueltas toman menos de un minuto.":"Ocho vueltas toman poco más de un minuto y medio." },
    "hablar":{ fase:s=>C.faseHablar(s), unaVez:true, total:()=>C.duracionHablar(), pill:"Antes de hablar",
      intro:'Antes de una llamada o una conversación: un <b>sorbo</b> de agua, un <b>bostezo</b> con la boca cerrada, <b>hombros</b> abajo, tararear suave y dos respiraciones lentas. Después, habla con pausas y bebe agua seguido.',
      duracion:()=>"Toma unos 30 segundos." },
    "nervios":{ fase:s=>C.faseNervios(s), unaVez:true, total:()=>C.duracionNervios(), pill:"Bajar los nervios",
      intro:'Unos <b>5 minutos</b> en cinco partes distintas, para que no se haga repetitivo: respirar 4 y 6, soplar largo, suspiro doble, soltar el cuerpo y contar tus soltadas. Cuando los nervios bajan, la tos nerviosa también.',
      duracion:()=>"Toma unos 5 minutos." },
    /* Pranayama: respiraciones suaves del yoga, sin aguantar el aire ni soplar con fuerza */
    "pranayama":{ fase:s=>C.fasePranayama(s), unaVez:true, total:()=>C.duracionPranayama(), pill:"Pranayama suave",
      intro:'Respiraciones del yoga, lentas y por la nariz, en tres partes: <b>nariz alterna</b> (entra por un lado y sale por el otro), <b>abeja</b> (sueltas el aire tarareando con la boca cerrada) y un <b>cierre</b> de 4 y 6. Sirve para las ganas, la ansiedad y la tos nerviosa. Sin aguantar el aire. Con la nariz tapada, salta la primera parte; con dolor de oído, no hagas la abeja; si te mareas, para y respira normal.',
      duracion:()=>"Toma unos 5 minutos." }
  };
  /* Lo que dice la voz: más suave y con más palabras que lo que se lee en el círculo */
  const HABLA={ inhala:"Inhala suave, por la nariz", sosten:"Sostén", exhala:"Suelta el aire, despacio", traga:"Traga", aguanta:"Aguanta, boca cerrada", suelta:"Suelta lento, por la nariz", fin:"Bien hecho. Nota cómo está tu cuerpo.",
    olfatea:"Olfatea", sopla:"Sopla", soplaLargo:"Sopla largo", descansa:"Descansa",
    sorbo:"Toma un sorbo de agua", bosteza:"Bosteza con la boca cerrada", hombros:"Sube los hombros, y déjalos caer", tararea:"Tararea suave",
    parte1:"Respira cuatro, y suelta en seis", parte2:"Ahora, sopla largo", parte3:"Ahora, suspiro doble", parte4:"Ahora, suelta el cuerpo", parte5:"Por último, cuenta tus soltadas",
    soplaLento:"Sopla lento", otroPoco:"Un poquito más", sueltaTodo:"Suelta todo",
    hombrosArriba:"Hombros arriba", hombrosCaen:"Déjalos caer", aprietaManos:"Aprieta las manos", abreManos:"Ábrelas", mandibula:"Mandíbula floja", cuenta:"Suelta, y cuenta",
    pranaA:"Nariz alterna", pranaB:"Ahora, la abeja", pranaC:"Para cerrar, entra en cuatro y sale en seis",
    izqInhala:"Inhala por la izquierda", derSuelta:"Cambia, y suelta por la derecha", derInhala:"Inhala por la derecha", izqSuelta:"Cambia, y suelta por la izquierda", zumba:"Zumba, como abeja" };
  let pref={ vueltas:4, vibrar:true, voz:false, vozNombre:"", ejercicio:"478" };
  try{ pref=Object.assign(pref,JSON.parse(localStorage.getItem(PREF)||"{}")); }catch(e){}
  if(!EJERCICIOS[pref.ejercicio]) pref.ejercicio="478";
  const ej=()=>EJERCICIOS[pref.ejercicio];
  /* Muestra el título y la explicación del ejercicio elegido */
  function mostrarEjercicio(){
    $("respiraEjercicio").value=pref.ejercicio;
    $("respiraPill").textContent=ej().pill;
    $("respiraIntro").innerHTML=ej().intro;
    /* Antes de hablar y Bajar los nervios se hacen una vez completa: ahí no se eligen vueltas */
    $("respiraVueltas").closest("label").hidden=!!ej().unaVez;
  }
  const guardar=()=>{ try{ localStorage.setItem(PREF,JSON.stringify(pref)); }catch(e){} };

  let reloj=null, inicio=0, faseAnterior="", pantallaEncendida=null;

  /* Las voces en español que trae el teléfono (gratis, sin internet, no envía nada) */
  function vocesEspanol(){
    try{ return speechSynthesis.getVoices().filter(v=>/^es/i.test(v.lang)); }catch(e){ return []; }
  }
  /* Puntaje para elegir sola la voz más natural: las "mejoradas" o "naturales" suenan mucho menos a robot */
  function puntaje(v){
    const n=v.name.toLowerCase(); let p=0;
    if(/natural|neural|premium|enhanced|mejorada|siri|online/.test(n)) p+=10;
    if(/google/.test(n)) p+=4;
    if(/paulina|m[oó]nica|dalia|elvira|marisol|ximena|catalina|sabina|paloma|camila|luc[ií]a/.test(n)) p+=3;
    if(/es-(cl|419|mx|us|ar|co)/i.test(v.lang)) p+=2; /* acento latino, más cercano */
    if(v.localService) p+=1;                            /* funciona sin internet */
    if(/compact|espeak|robot/.test(n)) p-=10;
    return p;
  }
  function vozElegida(){
    const vs=vocesEspanol(); if(!vs.length) return null;
    return vs.find(v=>v.name===pref.vozNombre) || vs.slice().sort((a,b)=>puntaje(b)-puntaje(a))[0];
  }
  /* Llena la lista de voces para que la persona pruebe y elija la que le guste */
  function llenarVoces(){
    const sel=$("respiraVozElegida"); if(!sel) return;
    const vs=vocesEspanol().sort((a,b)=>puntaje(b)-puntaje(a));
    sel.innerHTML='<option value="">Automática (la más natural)</option>'+vs.map(v=>'<option value="'+v.name.replace(/"/g,"&quot;")+'">'+v.name.replace(/</g,"&lt;")+'</option>').join("");
    sel.value=vs.some(v=>v.name===pref.vozNombre)?pref.vozNombre:"";
  }

  /* La voz dice cada fase: lenta, un poco más grave y no tan fuerte, para que acompañe y no mande */
  function decir(t, aunqueApagada){
    if((!pref.voz&&!aunqueApagada)||!("speechSynthesis" in window)) return;
    if(window.detenerLectura) window.detenerLectura(); /* si se estaba leyendo una tarjeta, se detiene bien (js/escuchar.js) */
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(t);
    const v=vozElegida(); if(v){ u.voice=v; u.lang=v.lang; } else u.lang="es-CL";
    u.rate=0.8; u.pitch=0.95; u.volume=0.9;
    speechSynthesis.speak(u);
  }
  function vibrar(){ if(pref.vibrar&&navigator.vibrate) navigator.vibrate(40); }

  /* El círculo crece o se achica durante lo que dura la fase */
  function mover(fase, dura){
    const c=$("respiraCirculo");
    c.style.transitionDuration=(DIBUJO[fase]==="sosten"?0.3:dura)+"s";
    c.style.transform="scale("+ESCALA[fase]+")";
    /* La clase de la fase hace que el salchicha infle el pecho, lo sostenga o bote el aire por la nariz */
    c.classList.remove("fase-inhala","fase-sosten","fase-exhala"); c.classList.add("fase-"+DIBUJO[fase]);
    /* Kay y Floy caminan al inhalar y al botar el aire, y se detienen en "Sostén" (css/estilos.css, .respira-paseo) */
    $("respira").dataset.fase=DIBUJO[fase];
  }

  function tic(){
    const f=ej().fase((performance.now()-inicio)/1000);
    if(f.terminado){ terminar(); return; }
    const segundos=(performance.now()-inicio)/1000;
    if(f.fase!==faseAnterior){ faseAnterior=f.fase; $("respiraFase").textContent=TEXTO[f.fase]; mover(f.fase,f.dura); vibrar(); decir(HABLA[f.fase]); }
    $("respiraNum").textContent=f.quedan;
    /* Abajo: en los de vueltas, en qué vuelta vas; en los de una vez, qué hacer y cuánto falta */
    $("respiraVuelta").textContent=ej().unaVez
      ? (AYUDA[f.fase]?AYUDA[f.fase]+" · ":"")+quedanTexto(Math.max(0,ej().total()-segundos))
      : (AYUDA[f.fase]?AYUDA[f.fase]+" · ":"")+"Vuelta "+f.vuelta+" de "+pref.vueltas;
  }

  function empezar(){
    detener();
    /* Seguro: si los archivos de la app quedaron de versiones distintas, avisar en vez de quedarse pegado */
    if(!C||typeof C.fase478!=="function"||typeof C.faseTos!=="function"||typeof C.faseNervios!=="function"||typeof C.fasePranayama!=="function"){ $("respiraVuelta").textContent="Falta actualizar la app: ciérrala del todo y vuelve a abrirla."; return; }
    inicio=performance.now(); faseAnterior="";
    $("respiraEmpezar").textContent="Detener";
    /* Que la pantalla no se apague a mitad del ejercicio (si el teléfono lo permite) */
    try{ navigator.wakeLock&&navigator.wakeLock.request("screen").then(w=>{ if(reloj) pantallaEncendida=w; else w.release(); }).catch(()=>{}); }catch(e){}
    tic(); reloj=setInterval(tic,200);
  }
  function detener(){
    clearInterval(reloj); reloj=null;
    try{ speechSynthesis.cancel(); }catch(e){}
    try{ pantallaEncendida&&pantallaEncendida.release(); }catch(e){} pantallaEncendida=null;
    $("respiraEmpezar").textContent="Empezar";
    $("respiraFase").textContent="Listo"; $("respiraNum").textContent="";
    $("respiraVuelta").textContent=ej().duracion(pref.vueltas);
    const c=$("respiraCirculo"); c.style.transitionDuration="0.6s"; c.style.transform="scale(1)";
    c.classList.remove("fase-inhala","fase-sosten","fase-exhala");
    delete $("respira").dataset.fase; /* sin ejercicio, Kay y Floy esperan quietos */
  }
  function terminar(){
    detener();
    $("respiraFase").textContent="Bien hecho";
    $("respiraVuelta").textContent=(ej().unaVez?"Terminaste.":"Terminaste "+pref.vueltas+" vueltas.")+" Nota cómo está tu cuerpo ahora. Puedes repetir cuando quieras.";
    vibrar(); decir(HABLA.fin);
    /* Al terminar, Kay y Floy pasan juntos a felicitarte con una lamida (js/paseo.js) */
    setTimeout(()=>{ if(window.paseoSalchicha) window.paseoSalchicha("juntos"); },900);
  }

  /* Si el botón pide un ejercicio (data-respira="478"), se abre en ese: un botón que dice 4-7-8 no abre la tos */
  function abrir(e){
    const pedido=e&&e.currentTarget&&e.currentTarget.dataset?e.currentTarget.dataset.respira:"";
    if(pedido&&EJERCICIOS[pedido]&&pedido!==pref.ejercicio){ pref.ejercicio=pedido; guardar(); }
    $("respiraVueltas").value=String(pref.vueltas); mostrarEjercicio();
    $("respiraVibrar").checked=!!pref.vibrar; $("respiraVoz").checked=!!pref.voz;
    llenarVoces(); $("respiraVozOpciones").hidden=!pref.voz||!("speechSynthesis" in window);
    $("respiraVibrar").closest("label").hidden=!navigator.vibrate; /* Si el teléfono no vibra, no se ofrece */
    $("respiraVoz").closest("label").hidden=!("speechSynthesis" in window);
    $("respiraVuelta").textContent=ej().duracion(pref.vueltas);
    /* Kay y Floy abajo: se dibujan la primera vez que se abre (los dibujos vienen de js/paseo.js) */
    const D=window.dibujosSalchichas;
    if(D&&!$("respiraPaseo").childElementCount) $("respiraPaseo").innerHTML='<div class="respira-pareja"><span class="respira-floy">'+D.floy+'</span><span class="respira-kay">'+D.kay+'</span></div>';
    $("respira").hidden=false; document.body.style.overflow="hidden";
    $("respira").scrollTop=0;
  }
  function cerrar(){
    detener(); $("respira").hidden=true;
    /* Si quedó abierta otra pantalla completa (por ejemplo el Modo ganas), la página de atrás sigue quieta */
    if(!document.querySelector(".crave:not([hidden])")) document.body.style.overflow="";
  }

  document.querySelectorAll("[data-respira]").forEach(b=>b.addEventListener("click",abrir));
  $("respiraCerrar").onclick=cerrar;
  $("respiraEmpezar").onclick=()=>{ reloj?detener():empezar(); };
  $("respiraVueltas").onchange=()=>{ pref.vueltas=Number($("respiraVueltas").value)===8?8:4; guardar(); if(reloj) empezar(); };
  /* Cambiar de ejercicio: si estaba corriendo, parte de nuevo con el ritmo nuevo */
  $("respiraEjercicio").onchange=()=>{ pref.ejercicio=EJERCICIOS[$("respiraEjercicio").value]?$("respiraEjercicio").value:"478"; guardar(); mostrarEjercicio(); if(reloj) empezar(); else $("respiraVuelta").textContent=ej().duracion(pref.vueltas); };
  $("respiraVibrar").onchange=()=>{ pref.vibrar=$("respiraVibrar").checked; guardar(); };
  $("respiraVoz").onchange=()=>{ pref.voz=$("respiraVoz").checked; guardar(); $("respiraVozOpciones").hidden=!pref.voz; };
  /* Elegir y probar la voz */
  $("respiraVozElegida").onchange=()=>{ pref.vozNombre=$("respiraVozElegida").value; guardar(); decir(HABLA.inhala,true); };
  $("respiraVozProbar").onclick=()=>decir(HABLA.inhala,true);
  /* Algunos teléfonos cargan las voces un momento después de abrir la app */
  if("speechSynthesis" in window){ try{ speechSynthesis.addEventListener("voiceschanged",llenarVoces); }catch(e){} }
  /* Si la persona sale de la app, el ejercicio se detiene (el reloj del teléfono se frena en segundo plano) */
  document.addEventListener("visibilitychange",()=>{ if(document.hidden&&reloj) detener(); });
})();
