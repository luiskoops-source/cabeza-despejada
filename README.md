# Cabeza Despejada

App anónima de apoyo para dejar o reducir el consumo de sustancias, con enfoque de reducción de daños. Nació como app personal para dejar la cocaína. Hecha en HTML, CSS y JavaScript puros, sin frameworks, para que cada archivo se pueda leer y entender.

## Cómo abrirla

Doble clic en `index.html`. Funciona sin servidor ni instalación.

## Estructura

```
cabeza-despejada/
├── index.html        Estructura: las 5 pestañas (Hoy, Noche, Saber, Registro, Ayuda), la portada, el Modo ganas y el Modo calma
├── css/estilos.css   Todo lo visual: colores, tipografías, tamaños, modo oscuro
├── js/app.js         La lógica: contador, dinero, registro, gráfico, modo ganas, avisos
├── js/calculos.js    Cálculos puros (días, dinero, hora difícil, recordatorio de calendario), probados en tests/
├── js/respaldo.js    Copia de seguridad en archivo y respaldo cifrado en la nube
├── js/respira.js     Respiración 4-7-8 (ansiedad, ganas, tos nerviosa, dormir): pantalla, vibración y voz
├── js/escuchar.js    La voz del teléfono lee las tarjetas (primer pedazo separado de app.js)
├── js/rato.js        Un rato contigo: practicar estar a solas con el aburrimiento y la soledad (frases en datos/rato.js)
├── datos/            El contenido, separado de la lógica para editarlo fácil: hechos, sustancias, historia de Mati,
│                     preguntas, primeros auxilios, novedades (el historial de cambios de Ayuda)...
├── sw.js             Service worker: guarda la app para usarla sin internet y avisa cuando hay versión nueva
├── iconos/           El perrito salchicha que abraza al cactus, en todos los tamaños
├── tests/            pruebas.js (cálculos) y navegador.js (abre la app y toca lo esencial)
├── scripts/construir.js  Arma la versión de un solo archivo para claude.ai
├── CLAUDE.md         Instrucciones para Claude Code (cómo trabajar en este proyecto)
└── README.md         Este archivo
```

## Cómo guarda los datos

En `localStorage` del navegador. Casi todo va bajo la clave `cd.v1`; algunas partes que viven en su propio archivo guardan aparte, siempre con claves que empiezan con `cd.` (por ejemplo `cd.rato`, el historial de Un rato contigo, que igual entra en la copia de seguridad). "Borrar todos mis datos" borra todas las claves `cd.`. Cada aparato tiene sus propios datos. Pasar a una base de datos real es el siguiente paso del proyecto.

## Funciones que dependen de Claude

Los botones "Cuéntame algo nuevo", "Explícame" y el chat del Modo ganas usan `window.claude.use("sample")`, que solo existe cuando la app corre como artefacto dentro de claude.ai. Abierta como archivo local, esos botones se desactivan solos. Para que funcionen fuera de claude.ai hay que conectarla a la API de Claude con un servidor propio (paso futuro).

## Plan de mejoras

1. Separar y entender el código (hecho).
1b. Anonimato, PIN, configuración de sustancia y modo reducción, hitos, guía de sustancias (hecho).
2. Pruebas automáticas para los cálculos (hecho: tests/pruebas.js).
3. PWA instalable (hecho: manifest.json, sw.js, iconos/).
4. Avisos a la hora difícil (hecho en parte: recordatorio diario en el calendario del teléfono, sin servidor). Con el paquete de Google Play: avisos locales de Android con Capacitor, también sin servidor.
5. Base de datos y cuenta, para que celular y PC muestren lo mismo.
6. Servicio que agregue un dato o estudio nuevo cada día.

## Comandos

```
node tests/pruebas.js        # corre las pruebas automáticas
node scripts/construir.js    # arma dist/cabeza-despejada.html (versión de un solo archivo)
```

## Instalar como app en el celular

La app es una PWA. Para instalarla necesita servirse por http(s), no abrirse como archivo:

```
npx serve .        # o cualquier servidor estático
```

Luego abre la dirección en el celular y usa "Agregar a pantalla de inicio". Desde ahí abre a pantalla completa y funciona sin internet (gracias a `sw.js`).

## Cómo publicar una versión nueva

1. Subir el número de `CACHE` en `sw.js` (por ejemplo v56 → v57). Si no cambia, los teléfonos no se enteran de que hay versión nueva.
2. Agregar una entrada arriba en `datos/novedades.js` si el cambio se nota (queda en Ayuda > Acerca de esta app > Historial de cambios; no interrumpe en Hoy).
3. Correr las pruebas y subir a `main`. GitHub Pages publica sola y la app instalada muestra "Hay una versión nueva" con el botón Actualizar.
4. La versión de claude.ai no se actualiza sola: se arma con `node scripts/construir.js` y se publica `dist/cabeza-despejada.html` en el mismo artefacto.

## Cuenta tu historia

Sin foro ni chat, a propósito: lo simple es lo mejor. En Saber, la gente puede contar o celebrar algo en un formulario anónimo; el dueño lo lee, y si la persona autorizó, lo publica en la app sin nada que la identifique.

- Historias y link del formulario: `datos/cuentan.js`. Mientras `formulario` esté vacío, los botones dicen "Muy pronto".
- Cada historia lleva su etiqueta: `real` (enviada de forma anónima) o `ficcion` (escrita para la app, inspirada en situaciones comunes). Nunca presentar una ficción como real.
- Antes de publicar una real: que tenga permiso, y quitar nombres, lugares y detalles que identifiquen. Nunca cómo se consume, dosis ni cómo conseguir.
- El formulario (Google Forms): sin pedir correo ni inicio de sesión, con tres preguntas: la historia, la sustancia (opcional) y si autoriza publicarla de forma anónima.

## El dibujo

El salchicha que abraza al cactus aunque le pinche. El cactus son los momentos malos: recaídas, ganas, heridas, púas. El salchicha es el tiempo y la paciencia, que los abraza igual. Aparece en la portada, en el Modo ganas (respira dentro del círculo), en los hitos y después de una recaída. En honor a Floy.

## Principios

- Gratis para siempre: sin suscripción, sin anuncios, sin compras dentro de la app. Donaciones voluntarias, nunca obligatorias.
- Anónima: sin cuenta, sin datos, sin servidores que guarden nada de la persona.
- Reducción de daños: informar y acompañar, nunca fomentar ni facilitar el consumo.
- Código visible: cualquiera puede leerlo y proponer mejoras (ver CONTRIBUTING.md). Todos los derechos reservados: no se permite copiarla ni publicar versiones propias (ver LICENSE).

## Qué tiene la app (octubre 2026)

- **Al abrir**: portada con el perrito ("El cactus pincha. La paciencia abraza.") y aviso con botón Actualizar cuando hay versión nueva.
- **Noche**: atajos de emergencia (Modo calma, ganas, primeros auxilios, 131 y 1412), "Antes de salir", "¿Qué me ofrecieron?", "En la fiesta", y "La mañana siguiente".
- **Hoy**: contador en vivo, hitos, compromiso diario, botón de ganas (reloj de 15 min, respiración, pasos), la historia de Mati (un capítulo nuevo cada día; si no abres la app, se guardan y se leen con "Leer el siguiente") y otras historias cortas para leer enteras, "No estás solo", check-in de sueño y ánimo, dinero no gastado, plan para la hora difícil con recordatorio diario en el calendario, razones, semana, configuración (sustancia, modo dejar/reducir, meta).
- **Saber**: buscador general, tarjetas de 15 segundos con tope diario, dato del día, pregunta del día, biblioteca (54 datos), guía de 11 sustancias con mitos, actualidad 2026, estudios, comunidades.
- **Registro**: ganas con gatillante, consumos, gráfico de 14 días, calendario de 30 días, patrones (gatillante, hora pico, sueño vs ganas), respaldo.
- **Ayuda**: 1412, 131, Salud Responde, primeros auxilios paso a paso (6 situaciones), paranoia, privacidad y PIN, compartir, acerca de y política de privacidad.

## Camino a Android (Play Store)

La app ya es una PWA instalable. Para publicarla en Google Play se envuelve en un "TWA" (Trusted Web Activity) con [PWABuilder](https://www.pwabuilder.com): se pega la dirección de la app, genera el paquete Android (.aab), y se sube a la consola de Google Play (cuenta de desarrollador, pago único de 25 USD). La app sigue siendo esta misma; el paquete solo la abre a pantalla completa.

## Muro de notas (diseño, pendiente de servidor)

Idea: un espacio donde un usuario anónimo pueda dejar una nota pública corta para animar a otros a dejar o reducir. No es un foro ni una red social.

Reglas de diseño:
- Solo texto, máximo 280 caracteres. Sin fotos, sin enlaces, sin teléfonos ni usuarios de redes (se filtran automáticamente).
- Anónimo: no se guarda nombre, correo ni identificador del aparato. Solo el texto, la fecha y la sustancia elegida (opcional).
- Moderación previa: ninguna nota se publica hasta que el dueño de la app la aprueba desde un panel simple. Se rechaza todo lo que fomente el consumo, venda, ofrezca o describa cómo usar, o insulte.
- Sin "me gusta", sin comentarios, sin perfiles. Solo leer y, si quieres, escribir una.
- Tope: una nota por aparato por día.

Necesita un servidor pequeño (base de datos + dos funciones: enviar y listar aprobadas). Opción sugerida: Supabase (gratis), con una tabla `notas` (texto, fecha, sustancia, estado) y una regla que solo permite leer las aprobadas. El panel de moderación puede ser una página privada protegida por clave.
