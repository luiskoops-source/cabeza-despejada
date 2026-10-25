/* Mati por dentro (Saber): un personaje en pixeles que muestra qué le pasa con cada sustancia y con las mezclas de a dos.
   Todo el contenido sale de datos/sustancias.js (qué se siente, daños, emergencias) y de datos/mati.js (fuentes y mezclas).
   Nada de lo que se elige aquí se guarda: es solo para mirar.
   Partes:
   1. Zonas del cuerpo: cada daño se clasifica por palabras clave para iluminar un órgano en el dibujo.
   2. Botones de sustancias (de a dos como máximo) y los cuatro pasos (por un rato, lo que cobra, mezclas, emergencia).
   3. El panel de texto, que cambia según sustancia(s) y paso.
   4. El dibujo: la sala, Mati en pixeles, los órganos en "rayos X" y las partículas. */
(function(){
  const S=window.SUSTANCIAS||[], M=window.MATI||{fuentes:{},combinaciones:[],equivale:{},notas:{},niveles:{}};
  const $=id=>document.getElementById(id);
  const tarjeta=$("matiCard"); if(!tarjeta||!S.length) return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  /* ---------- 1. Zonas del cuerpo ---------- */
  const ZONAS={
    cerebro:{nombre:"Cerebro",k:["cerebro","memoria","psicosis","paranoia","depresi","ansiedad","serotonina","ánimo","animo","motivaci","dependencia","sueño","dormir","angustia","agresividad","concentraci","decisiones","anhedonia","conciencia","confusi","convulsi","alucina","desmayo","inconscien"]},
    corazon:{nombre:"Corazón",k:["corazón","corazon","cardí","cardi","infarto","presión","presion","pulso","latidos","pecho"]},
    pulmones:{nombre:"Pulmones",k:["pulm","respira","fuma","vapeo","tos"]},
    nariz:{nombre:"Nariz",k:["nariz","tabique"]},
    boca:{nombre:"Boca",k:["diente","mandíbula","mandibula","boca","bruxismo"]},
    higado:{nombre:"Hígado",k:["hígado","higado"]},
    vejiga:{nombre:"Vejiga",k:["vejiga","orina","riñ"]},
    estomago:{nombre:"Estómago",k:["estreñimiento","vómito","vomito","estómago","estomago","hambre","náuse","nause"]},
    piel:{nombre:"Piel y sangre",k:["piel","glóbulos","globulos","levamisol","temperatura","sodio","infecciones","calor","deshidrat"]},
    cuerpo:{nombre:"Todo el cuerpo",k:["accidente","caída","caida","torpeza","deterioro","peso","adulter","potencia","cáncer","cancer","hormonal","violencia","social","impredecible","equilibrio","lesion"]}
  };
  function zonasDe(texto){ const t=texto.toLowerCase(); const z=Object.keys(ZONAS).filter(id=>ZONAS[id].k.some(k=>t.includes(k))); return z.length?z:["cuerpo"]; }
  function grupo(s){ const t=s.tipo.toLowerCase(); if(t.includes("depresor")) return "depresor"; if(t.includes("disociativo")) return "disociativo"; if(t.includes("cannabin")) return "cannabis"; if(t.includes("desconocida")) return "mezcla"; return "estimulante"; }
  function partir(txt){ const m=txt.match(/^([^:]{1,40}):\s*(.*)$/s); return m?{t:m[1],d:m[2]}:{t:null,d:txt}; }

  /* ---------- 2. Estado y botones ---------- */
  let elegidas=[], paso="rato", zonaFoco=null, aviso="";
  const botones=$("matiSust"), pasos=$("matiPasos"), panel=$("matiPanel"), globoEl=$("matiGlobo"), estadoEl=$("matiEstado");
  S.forEach(s=>{ const b=document.createElement("button"); b.type="button"; b.className="chip"; b.textContent=s.nombre; b.dataset.id=s.id; b.setAttribute("aria-pressed","false"); b.addEventListener("click",()=>alternar(s.id)); botones.appendChild(b); });
  pasos.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>irA(b.dataset.paso)));

  function alternar(id){
    aviso="";
    if(elegidas.includes(id)) elegidas=elegidas.filter(x=>x!==id);
    else if(elegidas.length>=2){ aviso="De a dos. Toca una de las elegidas para soltarla."; render(); return; }
    else elegidas.push(id);
    botones.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(elegidas.includes(b.dataset.id))));
    pasos.querySelectorAll("button").forEach(b=>{ b.disabled=!elegidas.length; });
    pasos.hidden=elegidas.length!==1;
    if(elegidas.length) irA("rato"); else render();
  }
  function irA(p){ paso=p; zonaFoco=null; pasos.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.paso===p))); render(); }
  function globo(t){ globoEl.textContent=t; }
  function estado(t){ estadoEl.textContent=t; }
  const porId=id=>S.find(s=>s.id===id);

  /* ---------- Mezclas de a dos ---------- */
  function buscarPar(x,y){ return M.combinaciones.find(c=>(c.a===x&&c.b===y)||(c.a===y&&c.b===x)); }
  const PESO={peligrosa:4,insegura:3,cuidado:2,bajo:1};
  function evaluar(id1,id2){
    /* Cada id de la app puede equivaler a una o dos filas de la tabla (el tusi, a ketamina y MDMA) */
    const filas=id=>id==="tusi"?["ketamine","mdma"]:(M.equivale[id]?[M.equivale[id]]:[]);
    const f1=filas(id1), f2=filas(id2); let mejor=null;
    f1.forEach(a=>f2.forEach(b=>{ if(a===b) return; const c=buscarPar(a,b); if(c&&(!mejor||PESO[c.nivel]>PESO[mejor.nivel])) mejor=c; }));
    const notas=[id1,id2].map(id=>M.notas[id]).filter(Boolean);
    if(!mejor){
      const mismo=f1.length&&f2.length&&f1.some(a=>f2.includes(a));
      if(mismo) return {nivel:"cuidado",t:"Son la misma sustancia en dos formas: no es una mezcla, es más de lo mismo, con los daños de cada forma sumados.",notas};
      return {nivel:"sinficha",t:"No hay ficha verificada para esta mezcla.",notas};
    }
    return {nivel:mejor.nivel,t:mejor.t,notas};
  }
  /* Lo que la ficha de cada una dice de la otra (datos/sustancias.js, mezclas[]) */
  function cruces(s1,s2){
    const claves={cocaina:["cocaína","cocaina"],"pasta-base":["pasta base"],alcohol:["alcohol"],marihuana:["marihuana","cannabis"],benzodiacepinas:["benzodiacepina"],mdma:["mdma","éxtasis","extasis"],anfetaminas:["anfetamina","metanfetamina"],ketamina:["ketamina"],tusi:["tusi"],opioides:["opioide","heroína","fentanilo","tramadol"],tabaco:["tabaco","cigarro","nicotina"]};
    const de=(s,otra)=>s.mezclas.filter(m=>(claves[otra.id]||[]).some(k=>m.toLowerCase().includes(k))).map(m=>({de:s.nombre,m}));
    return de(s1,s2).concat(de(s2,s1));
  }

  /* ---------- 3. El panel ---------- */
  function fuentes(ids){
    const lista=[]; ids.forEach(id=>(M.fuentes[id]||[]).forEach(f=>{ if(!lista.some(x=>x.u===f.u)) lista.push(f); }));
    if(!lista.length) return "";
    return `<p class="small muted mati-fuentes">Fuentes: ${lista.map(f=>`<a href="${esc(f.u)}" target="_blank" rel="noopener">${esc(f.n)}</a>`).join(" · ")}.</p>`;
  }
  function render(){
    if(!elegidas.length){
      panel.innerHTML=`<h3>Elige una sustancia para empezar</h3><p class="small muted">Vas a ver lo que se siente por un rato, lo que le cobra al cuerpo después, las mezclas peligrosas y cuándo llamar al 131. Si eliges dos, ves qué pasa al juntarlas.</p>${aviso?`<p class="small" style="color:var(--warm-texto)">${esc(aviso)}</p>`:""}`;
      globo("¡Hola! Soy Mati. Elige algo abajo."); estado("Mati está bien"); return;
    }
    if(elegidas.length===2){ renderMezcla(); return; }
    const s=porId(elegidas[0]), g=grupo(s);
    const avisoHtml=aviso?`<p class="small" style="color:var(--warm-texto)">${esc(aviso)}</p>`:"";
    if(paso==="rato"){
      panel.innerHTML=`<h3>${esc(s.nombre)}, por un rato</h3><p class="small muted">${esc(s.tipo)}</p><p>${esc(s.efecto)}</p>
        <div class="mati-precio"><p class="small muted">Eso dura poco. Lo que viene después dura más.</p><button class="primary" type="button" id="matiVerCobra">Ver lo que cobra</button></div>${avisoHtml}`;
      $("matiVerCobra").addEventListener("click",()=>irA("cobra"));
      globo(g==="depresor"?"Todo se siente lento y suave...":g==="estimulante"?"¡Me siento increíble! Por ahora.":g==="disociativo"?"Me siento lejos de mí...":g==="cannabis"?"Todo me da risa... o me da susto.":"No sé qué me tomé.");
      estado("Por un rato");
    } else if(paso==="cobra"){
      const items=s.danos.map((d,i)=>({i,p:partir(d),z:zonasDe(d)}));
      panel.innerHTML=`<h3>Lo que le cobra a Mati</h3><p class="small muted">Toca un daño para ver dónde le pega.</p>
        <ul class="mati-lista">${items.map(it=>`<li><button type="button" class="ghost" data-i="${it.i}" aria-pressed="false"><span class="pill warm">${esc(ZONAS[it.z[0]].nombre)}</span><span>${it.p.t?`<b>${esc(it.p.t)}:</b> `:""}${esc(it.p.d)}</span></button></li>`).join("")}</ul>
        <div class="mati-dejar"><b>Si Mati la deja</b><span class="small">${esc(s.abstinencia)}</span><span class="small muted">${esc(s.dejar)}</span></div>${fuentes([s.id])}${avisoHtml}`;
      panel.querySelectorAll(".mati-lista button").forEach(b=>b.addEventListener("click",()=>{
        const it=items[+b.dataset.i], on=b.getAttribute("aria-pressed")!=="true";
        panel.querySelectorAll(".mati-lista button").forEach(o=>o.setAttribute("aria-pressed","false"));
        b.setAttribute("aria-pressed",String(on)); zonaFoco=on?it.z:null;
        globo(on?"Me duele: "+ZONAS[it.z[0]].nombre.toLowerCase()+".":"Ay...");
      }));
      globo(g==="estimulante"?"Ya pasó... y ahora me siento vacío.":"No me siento bien."); estado("Lo que cobra");
    } else if(paso==="mezclas"){
      panel.innerHTML=`<h3>Mezclas que empeoran todo</h3><ul class="mati-lista">${s.mezclas.map(m=>`<li><span class="mati-punto" aria-hidden="true"></span><span>${esc(m)}</span></li>`).join("")}</ul>
        <p class="small muted">Para ver una mezcla en Mati, elige una segunda sustancia arriba.</p>${fuentes([s.id])}${avisoHtml}`;
      globo("Mezclar es como apostar con el corazón."); estado("Mezclas");
    } else {
      panel.innerHTML=`<h3>Si a Mati le pasa esto, se llama al 131</h3>
        <ul class="mati-lista">${s.emergencia.filter(e=>!/llamar al 131/i.test(e)).map(e=>`<li><span class="pill bad">${esc(ZONAS[zonasDe(e)[0]].nombre)}</span><span>${esc(e)}</span></li>`).join("")}</ul>
        <div class="mati-131"><strong>131</strong><span class="small">Ambulancia SAMU, gratis. Di qué se consumió: te van a tratar, no a denunciar.</span><a class="llamar" href="tel:131">Llamar</a></div>${fuentes([s.id])}${avisoHtml}`;
      globo("¡Ayuda! Que alguien llame al 131."); estado("Emergencia");
    }
  }
  function renderMezcla(){
    const s1=porId(elegidas[0]), s2=porId(elegidas[1]);
    const ev=evaluar(s1.id,s2.id), n=M.niveles[ev.nivel]||M.niveles.sinficha, cr=cruces(s1,s2);
    panel.innerHTML=`<p class="pill ${n.color==="bad"?"bad":n.color==="warm"?"warm":""}">${esc(n.titulo)}</p>
      <h3>${esc(s1.nombre)} + ${esc(s2.nombre)}</h3><p>${esc(ev.t)}</p>
      ${ev.notas.map(t=>`<p class="small muted">${esc(t)}</p>`).join("")}
      ${cr.length?`<p class="small"><b>Lo que dice la ficha:</b></p><ul class="mati-lista">${cr.map(x=>`<li><span class="mati-punto" aria-hidden="true"></span><span><b>${esc(x.de)}:</b> ${esc(x.m)}</span></li>`).join("")}</ul>`:""}
      <p class="small muted">Niveles según la tabla abierta de <a href="${esc(M.fuenteCombos.u)}" target="_blank" rel="noopener">${esc(M.fuenteCombos.n)}</a>. "Sin interacción registrada" no significa seguro: cada sustancia cobra lo suyo igual.</p>
      ${fuentes([s1.id,s2.id])}${aviso?`<p class="small" style="color:var(--warm-texto)">${esc(aviso)}</p>`:""}`;
    globo(n.globo); estado(n.titulo);
  }

  /* ---------- 4. El dibujo ---------- */
  const cv=$("matiLienzo"), ctx=cv.getContext("2d");
  const VW=112, VH=96, PISO=60;
  const C={line:"#262626",skin:"#e8b48a",skinD:"#d39a6f",hair:"#5a3a22",hairL:"#7a5233",hood:"#5f9a2e",hoodD:"#4a7d22",hoodL:"#7cb848",pants:"#3b4a6b",pantsD:"#2f3c58",shoe:"#f4eee1",sole:"#9a8f7c",eye:"#262626",white:"#ffffff",mouth:"#8a3b2c",cheek:"#ef9a86"};
  const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  /* Mati mide 36 x 54 pixeles. Se dibuja con rectángulos y el contorno negro se calcula solo. */
  function sprite(pose){
    const W=36,H=54,g=Array.from({length:H},()=>Array(W).fill(null));
    const r=(x,y,w,h,c)=>{ for(let j=y;j<y+h;j++) for(let i=x;i<x+w;i++) if(j>=0&&j<H&&i>=0&&i<W) g[j][i]=c; };
    const hy=pose.slump?1:0;
    r(10,48,7,3,C.shoe); r(19,48,7,3,C.shoe); r(10,50,7,1,C.sole); r(19,50,7,1,C.sole);
    r(11,39,6,9,C.pants); r(19,39,6,9,C.pants); r(17,39,2,4,C.pants); r(23,39,2,9,C.pantsD);
    r(10,25,16,15,C.hood); r(23,26,3,14,C.hoodD); r(13,33,10,4,C.hoodD); r(14,33,8,1,C.hood); r(15,26,1,4,C.hoodL); r(20,26,1,4,C.hoodL);
    const ay=pose.armsUp?-2:0;
    r(7,26+ay,3,11,C.hood); r(26,26+ay,3,11,C.hoodD); r(7,37+ay,3,2,C.skin); r(26,37+ay,3,2,C.skin);
    r(15,23+hy,6,3,C.skinD);
    r(9,7+hy,18,17,C.skin); r(10,6+hy,16,1,C.skin);
    g[7+hy][9]=null; g[7+hy][26]=null; g[23+hy][9]=null; g[23+hy][26]=null;
    r(8,13+hy,1,4,C.skin); r(27,13+hy,1,4,C.skin);
    r(9,3+hy,18,6,C.hair); r(8,5+hy,2,8,C.hair); r(26,5+hy,2,7,C.hair); r(11,2+hy,3,1,C.hair); r(16,1+hy,3,2,C.hair); r(22,2+hy,3,1,C.hair);
    r(12,9+hy,4,1,C.hair); r(18,9+hy,5,2,C.hair); r(13,4+hy,5,1,C.hairL); r(20,4+hy,3,1,C.hairL);
    const ey=15+hy;
    if(pose.eyes==="closed"){ r(12,ey+1,3,1,C.eye); r(21,ey+1,3,1,C.eye); }
    else if(pose.eyes==="half"){ r(12,ey+1,3,1,C.eye); r(21,ey+1,3,1,C.eye); r(12,ey,3,1,C.skinD); r(21,ey,3,1,C.skinD); }
    else if(pose.eyes==="wide"){ r(12,ey-1,3,3,C.white); r(21,ey-1,3,3,C.white); r(13,ey,1,1,C.eye); r(22,ey,1,1,C.eye); }
    else if(pose.eyes==="x"){ g[ey][12]=g[ey+1][13]=g[ey][14]=C.eye; g[ey][21]=g[ey+1][22]=g[ey][23]=C.eye; g[ey+2][12]=g[ey+2][14]=C.eye; g[ey+2][21]=g[ey+2][23]=C.eye; }
    else { r(12,ey,2,2,C.eye); r(21,ey,2,2,C.eye); g[ey][12]=C.white; g[ey][21]=C.white; }
    r(17,18+hy,2,1,C.skinD); r(10,19+hy,2,1,C.cheek); r(24,19+hy,2,1,C.cheek);
    const my=21+hy;
    if(pose.mouth==="smile"){ r(15,my,6,1,C.mouth); g[my-1][14]=C.mouth; g[my-1][21]=C.mouth; }
    else if(pose.mouth==="sad"){ r(15,my,6,1,C.mouth); g[my+1][14]=C.mouth; g[my+1][21]=C.mouth; }
    else if(pose.mouth==="o"){ r(16,my-1,3,3,C.mouth); }
    else if(pose.mouth==="wave"){ g[my][15]=g[my-1][16]=g[my][17]=g[my-1][18]=g[my][19]=g[my-1][20]=C.mouth; }
    else r(16,my,4,1,C.mouth);
    const out=Array.from({length:H},(_,j)=>g[j].slice());
    for(let j=0;j<H;j++) for(let i=0;i<W;i++) if(!g[j][i]){ if((g[j-1]&&g[j-1][i])||(g[j+1]&&g[j+1][i])||g[j][i-1]||g[j][i+1]) out[j][i]=C.line; }
    return {g:out,W,H,hy};
  }
  /* Órganos, en coordenadas del dibujo de Mati */
  const ORG={cerebro:{c:"#f2a7b8",px:[[13,9,10,2],[12,11,12,2],[14,13,8,1]]},nariz:{c:"#ff6b57",px:[[17,18,2,1]]},boca:{c:"#ff6b57",px:[[15,21,6,1]]},pulmones:{c:"#f08fa0",px:[[12,27,4,6],[20,27,4,6]]},corazon:{c:"#e23b3b",px:[[18,29,3,2],[19,31,1,1]]},higado:{c:"#a0522d",px:[[12,34,5,2]]},estomago:{c:"#f0b45a",px:[[18,34,4,2]]},vejiga:{c:"#f6d34a",px:[[16,39,4,2]]}};
  function tintar(hex,gris,rojo){
    let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    const y=.3*r+.59*g+.11*b; r+=(y-r)*gris; g+=(y-g)*gris; b+=(y-b)*gris;
    if(rojo){ r+=(255-r)*rojo*.5; g*=1-rojo*.3; b*=1-rojo*.3; }
    return `rgb(${r|0},${g|0},${b|0})`;
  }
  function sala(noche){
    ctx.fillStyle=css("--surface2"); ctx.fillRect(0,0,VW,VH);
    const cx=VW/2, tw=16, th=8;
    for(let i=-6;i<=6;i++) for(let j=-6;j<=6;j++){
      const x=cx+(i-j)*tw/2, y=PISO+(i+j)*th/2; if(y<PISO-2||y>VH+8) continue;
      ctx.fillStyle=(i+j)%2===0?css("--bg"):css("--line");
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+tw/2,y+th/2); ctx.lineTo(x,y+th); ctx.lineTo(x-tw/2,y+th/2); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle=css("--muted"); ctx.fillRect(0,PISO+2,VW,1);
    ctx.fillStyle=css("--muted"); ctx.fillRect(6,12,24,20); ctx.fillStyle=noche?"#3a2a5a":"#bfe0ef"; ctx.fillRect(8,14,20,16);
    ctx.fillStyle=css("--muted"); ctx.fillRect(17,14,2,16); ctx.fillRect(8,21,20,2);
    /* el cactus del logo, en su macetero */
    ctx.fillStyle="#262626"; ctx.fillRect(89,36,12,22); ctx.fillStyle="#86b85a"; ctx.fillRect(90,37,10,20);
    ctx.fillStyle="#5c8f3a"; ctx.fillRect(93,40,1,14); ctx.fillRect(97,42,1,12); ctx.fillStyle="#f08fa0"; ctx.fillRect(92,34,6,3);
    ctx.fillStyle="#262626"; ctx.fillRect(86,57,18,9); ctx.fillStyle="#c98a52"; ctx.fillRect(87,58,16,7);
  }
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t0=performance.now(), activo=false;
  function dibujar(now){
    const t=reduce?0:(now-t0)/1000;
    const s=elegidas.length===1?porId(elegidas[0]):null, g=s?grupo(s):null;
    const mezcla=elegidas.length===2?evaluar(elegidas[0],elegidas[1]):null;
    const blink=(t%3.4)>3.25;
    let pose={eyes:blink?"closed":"open",mouth:"smile"}, dx=0, dy=Math.round(Math.sin(t*2)*0.5-0.5), gris=0, rojo=0, xray=false, noche=false;
    if(mezcla){
      if(mezcla.nivel==="peligrosa"||mezcla.nivel==="insegura"){ pose={eyes:"x",mouth:"o",slump:true}; rojo=(Math.sin(t*6)+1)/2*.5; xray=true; noche=true; dy=0; }
      else if(mezcla.nivel==="cuidado"){ pose={eyes:"wide",mouth:"sad"}; gris=.3; dx=Math.round(Math.sin(t*9)); }
      else { pose={eyes:"half",mouth:"flat"}; gris=.35; }
    } else if(s&&paso==="rato"){
      if(g==="estimulante"){ pose={eyes:blink?"closed":"wide",mouth:"smile",armsUp:Math.floor(t*4)%2===0}; dy=-Math.abs(Math.round(Math.sin(t*9)*2)); dx=Math.round(Math.sin(t*13)); }
      else if(g==="depresor"){ pose={eyes:"half",mouth:"wave"}; dx=Math.round(Math.sin(t*1.2)*2); }
      else if(g==="disociativo"){ pose={eyes:"half",mouth:"o"}; dx=Math.round(Math.sin(t*.7)*3); dy=Math.round(Math.sin(t*.9)); }
      else if(g==="cannabis"){ pose={eyes:"half",mouth:"smile"}; dy=Math.round(Math.sin(t*1.5)); }
      else { pose={eyes:"wide",mouth:"o"}; dx=Math.round(Math.sin(t*17)); }
    } else if(s&&paso==="cobra"){ pose={eyes:blink?"closed":"half",mouth:"sad",slump:true}; gris=.55; xray=true; dy=0; }
    else if(s&&paso==="mezclas"){ pose={eyes:"wide",mouth:"o"}; gris=.2; }
    else if(s&&paso==="emergencia"){ pose={eyes:"x",mouth:"o",slump:true}; rojo=(Math.sin(t*6)+1)/2*.5; xray=true; noche=true; dy=0; }

    ctx.imageSmoothingEnabled=false; sala(noche);
    const sp=sprite(pose), ox=Math.round(VW/2-sp.W/2)-6+dx, oy=PISO+22-sp.H+dy;
    ctx.fillStyle="rgba(60,45,20,.22)"; ctx.fillRect(ox+8,PISO+20,20,3); ctx.fillRect(ox+10,PISO+23,16,1);
    for(let j=0;j<sp.H;j++) for(let i=0;i<sp.W;i++){ const c=sp.g[j][i]; if(!c) continue; ctx.fillStyle=(gris||rojo)&&c!==C.line?tintar(c,gris,rojo):c; ctx.fillRect(ox+i,oy+j,1,1); }
    if(xray){
      const lista=mezcla?[porId(elegidas[0]),porId(elegidas[1])].flatMap(x=>x.emergencia):(paso==="emergencia"?s.emergencia:s.danos);
      const af=new Set(lista.flatMap(zonasDe)), foco=zonaFoco?new Set(zonaFoco):null, on=Math.floor(t*3)%2===0;
      for(const [id,o] of Object.entries(ORG)){
        const hit=af.has(id), f=foco&&foco.has(id); if(foco&&!f) continue; if(!hit&&!f) continue;
        const ys=(id==="cerebro"||id==="nariz"||id==="boca")?sp.hy:0;
        ctx.fillStyle=(on||reduce)?o.c:"#ffffff"; for(const [x,y,w,h] of o.px) ctx.fillRect(ox+x,oy+y+ys,w,h);
        if(f||noche){ ctx.fillStyle="rgba(226,59,59,.35)"; for(const [x,y,w,h] of o.px) ctx.fillRect(ox+x-1,oy+y+ys-1,w+2,h+2); }
      }
      const piel=foco?(foco.has("piel")||foco.has("cuerpo")):(af.has("piel")||af.has("cuerpo"));
      if(piel&&on){ ctx.fillStyle=noche?"#e23b3b":"#e0955a"; for(let j=0;j<sp.H;j++) for(let i=0;i<sp.W;i++) if(sp.g[j][i]===C.line) ctx.fillRect(ox+i,oy+j,1,1); }
    }
    if(s&&paso==="rato"&&!reduce){
      ctx.fillStyle=g==="estimulante"?"#f6c744":g==="depresor"?"#9bb7d4":"#c4a6e8";
      for(let k=0;k<5;k++){ const a=t*1.3+k*1.26, rr=22+(k%2)*4, px=Math.round(ox+18+Math.cos(a)*rr), py=Math.round(oy+12+Math.sin(a)*9-(g==="depresor"?(t*6+k*7)%14:0));
        ctx.fillRect(px,py,1,1); if(g==="estimulante"&&k%2===0){ ctx.fillRect(px-1,py,3,1); ctx.fillRect(px,py-1,1,3); } }
    }
    if(s&&paso==="cobra"&&!reduce){ const d2=Math.floor((t*8)%6); ctx.fillStyle="#7fb7e0"; ctx.fillRect(ox+27,oy+8+d2,1,2); ctx.fillRect(ox+26,oy+10+d2,3,1); }
    if(noche){ const on=Math.floor(t*4)%2===0||reduce; if(on){ ctx.fillStyle="#e23b3b"; ctx.fillRect(ox+17,oy-9,2,5); ctx.fillRect(ox+17,oy-3,2,2); } }
    if(!reduce&&activo) requestAnimationFrame(dibujar);
  }
  /* Solo se anima mientras la tarjeta está a la vista, para no gastar batería en otras pestañas */
  function empezar(){ if(activo) return; activo=true; t0=performance.now(); requestAnimationFrame(dibujar); }
  function parar(){ activo=false; }
  if("IntersectionObserver" in window){ new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?empezar():parar())).observe(tarjeta); }
  else empezar();
  if(reduce){ const redibujar=()=>{ activo=true; dibujar(performance.now()); activo=false; }; tarjeta.addEventListener("click",()=>setTimeout(redibujar,0)); redibujar(); }
  render();
})();
