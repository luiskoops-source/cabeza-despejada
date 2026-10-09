/* Construye la versión de un solo archivo (dist/cabeza-despejada.html) para publicarla como artefacto en claude.ai.
   Toma index.html y mete adentro el CSS y los JS, en el mismo orden en que se cargan.
   Se corre con:  node scripts/construir.js */
const fs=require("fs");
const path=require("path");
const raiz=path.join(__dirname,"..");
const leer=p=>fs.readFileSync(path.join(raiz,p),"utf8");

let html=leer("index.html");
/* 1. Hoja de estilos → <style> en línea */
html=html.replace('<link rel="stylesheet" href="css/estilos.css">',"<style>\n"+leer("css/estilos.css")+"</style>");
/* 1b. Las líneas de app instalable (manifest, ícono) no aplican dentro de claude.ai */
html=html.replace(/<link rel="manifest"[^>]*>\n?/,"").replace(/<link rel="apple-touch-icon"[^>]*>\n?/,"");
/* 1c. El service worker tampoco aplica dentro de claude.ai */
html=html.split("\n").filter(l=>!l.includes("navigator.serviceWorker.register")).join("\n");
/* 2. Cada <script src="..."> → su contenido en línea */
html=html.replace(/<script src="([^"]+)"><\/script>/g,(m,src)=>"<script>\n"+leer(src)+"\n</script>");
/* 3. El artefacto pone su propio esqueleto: quitamos doctype, html, head y body, y dejamos el <title> primero */
const titulo='<title>Cabeza Despejada</title>';
html=html.replace(/<!doctype html>\s*<html[^>]*>\s*<head>[\s\S]*?<\/head>\s*<body>/i,m=>{
  const fuentes=m.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];
  const estilos=m.match(/<style>[\s\S]*?<\/style>/)[0];
  return titulo+"\n"+fuentes+"\n"+estilos;
}).replace(/<\/body>\s*<\/html>\s*$/i,"");

fs.mkdirSync(path.join(raiz,"dist"),{recursive:true});
fs.writeFileSync(path.join(raiz,"dist/cabeza-despejada.html"),html);
console.log("Listo: dist/cabeza-despejada.html ("+Math.round(html.length/1024)+" KB)");
