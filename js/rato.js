/* "Un rato contigo": unos minutos sin celular, sin música y sin hacer nada, para aprender a estar con el aburrimiento
   y la soledad en vez de escapar de ellos. Pantalla completa (#rato en index.html).
   Separado de app.js porque no depende del resto: solo de Calculos.minutosRato (js/calculos.js) y de las frases
   de datos/rato.js. Lo practicado queda en este teléfono (cd.rato), no va a ningún servidor. */
"use strict";
(function(){
  const $=id=>document.getElementById(id);
  const C=window.Calculos;
  const FRASES=window.RATO_FRASES||[];
  const GUARDADO="cd.rato";
  /* historial: una entrada por cada práctica terminada: { fecha, minutos, como } (como: "dificil", "normal", "tranquilo" o null) */
  let datos={ historial:[] };
  try{ datos=Object.assign(datos,JSON.parse(localStorage.getItem(GUARDADO)||"{}")); }catch(e){}
  if(!Array.isArray(datos.historial)) datos.historial=[];
  /* Después de guardar, avisa al respaldo en la nube (js/app.js), que solo se enteraba de lo que guarda app.js */
  const guardar=()=>{ try{ localStorage.setItem(GUARDADO,JSON.stringify(datos)); }catch(e){} try{ window.nubeProgramar&&window.nubeProgramar(); }catch(e){} };

  /* Para subir los minutos cuentan las prácticas terminadas que no fueron "difícil": si costó, se repite sin apuro */
  const completados=()=>datos.historial.filter(h=>h.como!=="dificil").length;
  const sugeridos=()=>C.minutosRato(completados());

  const RESPUESTA={
    dificil:"Gracias por quedarte igual. Lo difícil es justo lo que se está entrenando. La próxima vez dura lo mismo, sin apuro.",
    normal:"Bien. Lo normal también cuenta: estuviste contigo sin escaparte.",
    tranquilo:"Qué bueno. Acuérdate de esta sensación la próxima vez que llegue un tiempo muerto."
  };

  let reloj=null, fin=0, minutos=3, ultimaFrase=-1, pantallaEncendida=null;

  /* 185 segundos → "3:05" */
  const mmss=seg=>Math.floor(seg/60)+":"+String(seg%60).padStart(2,"0");

  function tic(){
    /* Se calcula con la hora de término y no contando segundos, así no se atrasa si el teléfono frena la app */
    const quedan=Math.max(0,Math.ceil((fin-Date.now())/1000));
    $("ratoReloj").textContent=mmss(quedan);
    /* Una frase nueva cada 45 segundos, en orden */
    const paso=Math.floor((minutos*60-quedan)/45)%(FRASES.length||1);
    if(FRASES.length&&paso!==ultimaFrase){ ultimaFrase=paso; $("ratoFrase").textContent=FRASES[paso]; }
    if(quedan===0) terminar();
  }

  function empezar(){
    detener();
    /* Seguro: si los archivos de la app quedaron de versiones distintas, avisar en vez de quedarse pegado */
    if(!C||typeof C.minutosRato!=="function"){ $("ratoFrase").textContent="Falta actualizar la app: ciérrala del todo y vuelve a abrirla."; return; }
    minutos=Number($("ratoMinutos").value)||sugeridos();
    fin=Date.now()+minutos*60*1000; ultimaFrase=-1;
    $("ratoEmpezar").textContent="Terminar antes"; $("ratoMinutos").disabled=true;
    $("ratoComo").hidden=true; $("ratoCirculo").classList.add("corriendo");
    tic(); reloj=setInterval(tic,500);
    pedirPantalla();
  }

  /* Que la pantalla no se apague, para poder vibrar al final aunque el teléfono esté boca abajo.
     El teléfono la suelta si la persona sale de la app, así que se vuelve a pedir al regresar. */
  function pedirPantalla(){
    try{ navigator.wakeLock&&navigator.wakeLock.request("screen").then(w=>{ if(reloj) pantallaEncendida=w; else w.release(); }).catch(()=>{}); }catch(e){}
  }

  function detener(){
    clearInterval(reloj); reloj=null;
    try{ pantallaEncendida&&pantallaEncendida.release(); }catch(e){} pantallaEncendida=null;
    $("ratoEmpezar").textContent="Empezar"; $("ratoMinutos").disabled=false;
    $("ratoCirculo").classList.remove("corriendo");
  }

  /* Parar antes no es fallar: no se anota ni se reta a nadie */
  function pararAntes(){
    detener();
    $("ratoReloj").textContent=mmss(minutos*60);
    $("ratoFrase").textContent="Está bien parar. Lo que alcanzaste a estar contigo también cuenta.";
  }

  function terminar(){
    detener();
    datos.historial.push({ fecha:new Date().toISOString(), minutos, como:null }); guardar();
    $("ratoFrase").textContent="Terminaste "+minutos+" minutos contigo.";
    $("ratoComo").hidden=false; $("ratoRespuesta").textContent="";
    if(navigator.vibrate) navigator.vibrate([200,100,200]);
    mostrarNivel();
    /* Al terminar, el salchicha pasa a felicitarte (js/paseo.js) */
    setTimeout(()=>{ if(window.paseoSalchicha) window.paseoSalchicha(); },900);
  }

  /* La única pregunta al final: ¿cómo estuvo? Sin puntaje ni juicio */
  function responder(como){
    const ultima=datos.historial[datos.historial.length-1]; if(!ultima) return;
    ultima.como=como; guardar();
    $("ratoRespuesta").textContent=RESPUESTA[como]||"";
    mostrarNivel(); $("ratoMinutos").value=String(sugeridos());
  }

  function mostrarNivel(){
    const n=datos.historial.length;
    $("ratoNivel").textContent=n
      ? "Llevas "+n+(n===1?" vez":" veces")+". La próxima: "+sugeridos()+" minutos."
      : "Se empieza con 3 minutos. Sube de a poco a medida que los vas terminando.";
  }

  function abrir(){
    detener();
    minutos=sugeridos();
    $("ratoMinutos").value=String(minutos);
    $("ratoReloj").textContent=mmss(minutos*60);
    $("ratoFrase").textContent="Puedes dejar el teléfono boca abajo: vibra cuando termina.";
    $("ratoComo").hidden=true; mostrarNivel();
    $("rato").hidden=false; document.body.style.overflow="hidden";
    $("rato").scrollTop=0;
  }
  function cerrar(){
    detener(); $("rato").hidden=true;
    /* Si quedó abierta otra pantalla completa (por ejemplo el Modo ganas), la página de atrás sigue quieta */
    if(!document.querySelector(".crave:not([hidden])")) document.body.style.overflow="";
  }

  $("openRato").onclick=abrir;
  $("ratoCerrar").onclick=cerrar;
  $("ratoEmpezar").onclick=()=>{ reloj?pararAntes():empezar(); };
  $("ratoMinutos").onchange=()=>{ minutos=Number($("ratoMinutos").value)||3; $("ratoReloj").textContent=mmss(minutos*60); };
  document.querySelectorAll("[data-rato-como]").forEach(b=>b.addEventListener("click",()=>responder(b.dataset.ratoComo)));
  /* Si las ganas están muy fuertes, esto puede esperar: pasa directo al Modo ganas */
  $("ratoGanas").onclick=()=>{ cerrar(); const g=$("openCrave"); if(g) g.click(); };
  /* Al volver a la app, el reloj se pone al día de inmediato (y si ya era la hora, termina) */
  document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&reloj){ tic(); if(reloj) pedirPantalla(); } });
})();
