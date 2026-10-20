# Instrucciones para Claude Code en este proyecto

## Contexto
Cabeza Despejada es una app anónima de apoyo para dejar o reducir el consumo de sustancias (inspirada en I Am Sober), con enfoque de reducción de daños. Nació como app personal del dueño del repositorio y es también su proyecto para aprender a programar. Las dos cosas importan igual.

## Cómo trabajar aquí
- Responde siempre en español neutro, sin modismos.
- El dueño es principiante. Antes de cambiar algo, explica en 2 o 3 frases qué vas a hacer y por qué. Después del cambio, explica qué línea hace qué.
- Avanza de a una función por vez. No reescribas archivos enteros si basta con editar unas líneas.
- Sin frameworks ni herramientas de compilación mientras no se pidan. HTML, CSS y JavaScript puros.
- Mantén los nombres en español en el código nuevo (variables, funciones, comentarios).
- No agregues dependencias sin preguntar.
- Nunca pongas en el código datos personales del dueño (nombres de familiares, montos reales, episodios). Las razones personales se cargan desde la app, no desde el código.

## Modelo
- Gratis para siempre, sin suscripción ni anuncios ni compras. Solo donaciones voluntarias cuando el dueño decida la vía. Nunca agregar nada de pago.

## Contenido
- Nada en la app puede dar instrucciones de consumo, dosis, formas de uso ni cómo conseguir droga. La guía de `datos/sustancias.js` es de reducción de daños: qué es, qué daña, mezclas peligrosas como advertencia, señales de emergencia y cómo dejarla con seguridad. Nunca cantidades.
- Anonimato: la app no pide nombre, correo ni cuenta, y no envía datos a ningún servidor. Cualquier función nueva debe respetar eso. Única excepción, decidida por el dueño: el respaldo automático en la nube (`js/respaldo.js`, servidor en `servidor/supabase.sql`), que es opcional y cifra todo en el teléfono con un código secreto que solo tiene la persona; el servidor nunca debe recibir nada legible.
- Enlaces a sitios externos que reciben algo que la persona escribió (como el código de pastilla en Drugs.com, en "¿Qué me ofrecieron?"): solo después de un aviso que diga qué se envía y a quién, con "Sí, abrir"; nunca se envía nada más que eso y la app no guarda la búsqueda.
- Lo que se guarda en el teléfono va en `localStorage` con claves que empiezan con `cd.` (así "Borrar todos mis datos" lo borra todo). Si es un dato de la persona y no una preferencia del aparato, tiene que viajar en la copia de seguridad: lo más simple es guardarlo dentro del estado de `js/app.js` (`cd.v1`); si un archivo aparte lo guarda en su propia clave (como `js/rato.js` con `cd.rato`), sumarlo en `estadoParaCopia()` y en `aplicarRestauracion()`.
- Los hechos de `datos/hechos.js` deben ser verdaderos y basados en evidencia médica. Si no estás seguro de una cifra, descríbelo sin cifra.
- `datos/primeros-auxilios.js`: pasos de primeros auxilios basados en protocolos de reducción de daños y primeros auxilios generales; siempre con el 131 como primer paso en situaciones graves. Nunca indicar medicamentos salvo naloxona para opioides y aspirina masticada en dolor de pecho (práctica estándar), ambos con la indicación de avisar al 131.
- `datos/actualidad.js`: solo entradas verificadas en la fuente enlazada, con fecha y fuente. Si una cifra no está en la fuente, no se pone. Las columnas de opinión se marcan como "Análisis".
- Modo calma (crisis de paranoia/psicosis): nunca discutir las ideas de la persona ni decir "no es real"; acompañar, bajar estímulos, no tomar nada más, dormir, y 131 ante riesgo. Mantener ese tono en cualquier cambio.
- `datos/historia.js`: la historia de Mati, ficción que se abre de a un capítulo por día del calendario, aunque no se abra la app; los que se juntan se leen de a uno con "Leer el siguiente" (decisión del dueño, octubre 2026). Nunca describir cómo se consume ni glorificarlo; las recaídas se cuentan sin culpa y sin borrar lo avanzado; cada capítulo termina con una pregunta que invite a volver mañana, sin suspenso angustiante.
- Foto de una sustancia (futuro, diseño en README.md, "Foto de lo que me ofrecieron"): una foto no identifica una sustancia, así que nunca decir "es X", "es seguro" ni "es puro"; solo "podría ser", elegido entre las fichas de `datos/ofrecieron.js`, con el aviso de que sin análisis no se puede saber. La foto se limpia en el teléfono (sin ubicación ni datos ocultos), no se guarda en ningún lado y el servidor la descarta apenas responde.
- Teléfonos de ayuda en Chile que la app muestra: SENDA 1412, emergencias 131, Salud Responde 600 360 7777. En "Después de una discusión", ante violencia: Carabineros 133, Fono Familia 149 (violencia intrafamiliar) y 1455 (orientación por violencia contra las mujeres), verificados en ChileAtiende.
- "Después de una discusión" (temas de familia o pareja): sin culpar a la persona ni a su familia, sin decirle qué sentir; primero el cuerpo, no decidir nada en caliente, y la seguridad antes que todo si hubo violencia.

## Comandos útiles
- Pruebas de cálculos: `node tests/pruebas.js` (correrlas después de cada cambio en js/calculos.js)
- Prueba en navegador: `node tests/navegador.js` (necesita `npm i --no-save playwright`; GitHub la corre sola en cada push)
- Construir la versión de un archivo: `node scripts/construir.js`
- Abrir: `index.html` en el navegador.
