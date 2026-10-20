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
  /* Lo que dice la voz: más suave y con más palabras que lo que se lee en el círculo */
  const HABLA={ inhala:"Inhala suave, por la nariz", sosten:"Sostén", exhala:"Suelta el aire, despacio", fin:"Bien hecho. Nota cómo está tu cuerpo." };
  let pref={ vueltas:4, vibrar:true, voz:false, vozNombre:"" };
  try{ pref=Object.assign(pref,JSON.parse(localStorage.getItem(PREF)||"{}")); }catch(e){}
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
    c.style.transitionDuration=(fase==="sosten"?0.3:dura)+"s";
    c.style.transform="scale("+ESCALA[fase]+")";
    /* La clase de la fase hace que el salchicha infle el pecho, lo sostenga o bote el aire por la nariz */
    c.classList.remove("fase-inhala","fase-sosten","fase-exhala"); c.classList.add("fase-"+fase);
    /* Kay y Floy caminan al inhalar y al botar el aire, y se detienen en "Sostén" (css/estilos.css, .respira-paseo) */
    $("respira").dataset.fase=fase;
  }

  function tic(){
    const f=C.fase478((performance.now()-inicio)/1000, pref.vueltas);
    if(f.terminado){ terminar(); return; }
    if(f.fase!==faseAnterior){ faseAnterior=f.fase; $("respiraFase").textContent=TEXTO[f.fase]; mover(f.fase,f.dura); vibrar(); decir(HABLA[f.fase]); }
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
    try{ navigator.wakeLock&&navigator.wakeLock.request("screen").then(w=>{ if(reloj) pantallaEncendida=w; else w.release(); }).catch(()=>{}); }catch(e){}
    tic(); reloj=setInterval(tic,200);
  }
  function detener(){
    clearInterval(reloj); reloj=null;
    try{ speechSynthesis.cancel(); }catch(e){}
    try{ pantallaEncendida&&pantallaEncendida.release(); }catch(e){} pantallaEncendida=null;
    $("respiraEmpezar").textContent="Empezar";
    $("respiraFase").textContent="Listo"; $("respiraNum").textContent="";
    $("respiraVuelta").textContent=pref.vueltas===4?"Cuatro vueltas toman poco más de un minuto.":"Ocho vueltas toman unos dos minutos y medio.";
    const c=$("respiraCirculo"); c.style.transitionDuration="0.6s"; c.style.transform="scale(1)";
    c.classList.remove("fase-inhala","fase-sosten","fase-exhala");
    delete $("respira").dataset.fase; /* sin ejercicio, Kay y Floy esperan quietos */
  }
  function terminar(){
    detener();
    $("respiraFase").textContent="Bien hecho";
    $("respiraVuelta").textContent="Terminaste "+pref.vueltas+" vueltas. Nota cómo está tu cuerpo ahora. Puedes repetir cuando quieras.";
    vibrar(); decir(HABLA.fin);
    /* Al terminar, Kay y Floy pasan juntos a felicitarte con una lamida (js/paseo.js) */
    setTimeout(()=>{ if(window.paseoSalchicha) window.paseoSalchicha("juntos"); },900);
  }

  function abrir(){
    $("respiraVueltas").value=String(pref.vueltas);
    $("respiraVibrar").checked=!!pref.vibrar; $("respiraVoz").checked=!!pref.voz;
    llenarVoces(); $("respiraVozOpciones").hidden=!pref.voz||!("speechSynthesis" in window);
    $("respiraVibrar").closest("label").hidden=!navigator.vibrate; /* Si el teléfono no vibra, no se ofrece */
    $("respiraVoz").closest("label").hidden=!("speechSynthesis" in window);
    $("respiraVuelta").textContent=pref.vueltas===4?"Cuatro vueltas toman poco más de un minuto.":"Ocho vueltas toman unos dos minutos y medio.";
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
