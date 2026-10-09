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

## Contenido
- Nada en la app puede dar instrucciones de consumo, dosis, formas de uso ni cómo conseguir droga. La guía de `datos/sustancias.js` es de reducción de daños: qué es, qué daña, mezclas peligrosas como advertencia, señales de emergencia y cómo dejarla con seguridad. Nunca cantidades.
- Anonimato: la app no pide nombre, correo ni cuenta, y no envía datos a ningún servidor. Cualquier función nueva debe respetar eso.
- Los hechos de `datos/hechos.js` deben ser verdaderos y basados en evidencia médica. Si no estás seguro de una cifra, descríbelo sin cifra.
- `datos/primeros-auxilios.js`: pasos de primeros auxilios basados en protocolos de reducción de daños y primeros auxilios generales; siempre con el 131 como primer paso en situaciones graves. Nunca indicar medicamentos salvo naloxona para opioides y aspirina masticada en dolor de pecho (práctica estándar), ambos con la indicación de avisar al 131.
- `datos/actualidad.js`: solo entradas verificadas en la fuente enlazada, con fecha y fuente. Si una cifra no está en la fuente, no se pone. Las columnas de opinión se marcan como "Análisis".
- Modo calma (crisis de paranoia/psicosis): nunca discutir las ideas de la persona ni decir "no es real"; acompañar, bajar estímulos, no tomar nada más, dormir, y 131 ante riesgo. Mantener ese tono en cualquier cambio.
- Teléfonos de ayuda en Chile que la app muestra: SENDA 1412, emergencias 131, Salud Responde 600 360 7777.

## Comandos útiles
- Pruebas de cálculos: `node tests/pruebas.js` (correrlas después de cada cambio en js/calculos.js)
- Prueba en navegador: `node tests/navegador.js` (necesita `npm i --no-save playwright`; GitHub la corre sola en cada push)
- Construir la versión de un archivo: `node scripts/construir.js`
- Abrir: `index.html` en el navegador.
