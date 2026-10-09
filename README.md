# Cabeza Despejada

App anónima de apoyo para dejar o reducir el consumo de sustancias, con enfoque de reducción de daños. Nació como app personal para dejar la cocaína. Hecha en HTML, CSS y JavaScript puros, sin frameworks, para que cada archivo se pueda leer y entender.

## Cómo abrirla

Doble clic en `index.html`. Funciona sin servidor ni instalación.

## Estructura

```
cabeza-despejada/
├── index.html        Estructura: las 4 pantallas (Hoy, Saber, Registro, Ayuda) y el Modo ganas
├── css/estilos.css   Todo lo visual: colores, tipografías, tamaños, modo oscuro
├── js/app.js         La lógica: contador, dinero, registro, gráfico, modo ganas, chat
├── datos/hechos.js   La biblioteca de hechos (fácil de editar sin tocar la lógica)
├── datos/sustancias.js  Guía de 11 sustancias (reducción de daños)
├── CLAUDE.md         Instrucciones para Claude Code (cómo trabajar en este proyecto)
└── README.md         Este archivo
```

## Cómo guarda los datos

En `localStorage` del navegador, bajo la clave `cd.v1`. Eso significa que cada aparato tiene sus propios datos. Pasar a una base de datos real es el siguiente paso del proyecto.

## Funciones que dependen de Claude

Los botones "Cuéntame algo nuevo", "Explícame" y el chat del Modo ganas usan `window.claude.use("sample")`, que solo existe cuando la app corre como artefacto dentro de claude.ai. Abierta como archivo local, esos botones se desactivan solos. Para que funcionen fuera de claude.ai hay que conectarla a la API de Claude con un servidor propio (paso futuro).

## Plan de mejoras

1. Separar y entender el código (hecho).
1b. Anonimato, PIN, configuración de sustancia y modo reducción, hitos, guía de sustancias (hecho).
2. Pruebas automáticas para los cálculos (hecho: tests/pruebas.js).
3. PWA instalable (hecho: manifest.json, sw.js, iconos/).
4. Notificaciones a la hora difícil.
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

## Principios

- Gratis para siempre: sin suscripción, sin anuncios, sin compras dentro de la app. Donaciones voluntarias, nunca obligatorias.
- Anónima: sin cuenta, sin datos, sin servidores que guarden nada de la persona.
- Reducción de daños: informar y acompañar, nunca fomentar ni facilitar el consumo.
- Código abierto: cualquiera puede leerlo, revisarlo y proponer mejoras.

## Qué tiene la app (octubre 2026)

- **Noche**: atajos de emergencia (Modo calma, ganas, primeros auxilios, 131 y 1412), "Antes de salir", "¿Qué me ofrecieron?", "En la fiesta", y "La mañana siguiente".
- **Hoy**: contador en vivo, hitos, compromiso diario, botón de ganas (reloj de 15 min, respiración, pasos), "No estás solo", check-in de sueño y ánimo, dinero no gastado, plan para la hora difícil, razones, semana, configuración (sustancia, modo dejar/reducir, meta).
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
