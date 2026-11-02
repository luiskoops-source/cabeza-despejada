# Video piloto de Cabeza Despejada (para armar en EffectCraft)

## Ya hay un comercial listo: `comercial.mp4`

Un comercial de 25 segundos (1080 x 1920) con efecto de televisor antiguo: la imagen se enciende como una tele de tubo,
tiene líneas y grano de pantalla, y al final se apaga en un punto de luz. Entra una forma verde con desenfoque de movimiento,
que se convierte en el ícono, y después el teléfono muestra el contador, el Modo ganas, Lo que viene y Ayuda. Cierra en verde.
No tiene sonido: la música es más fácil sumarla en TikTok o Instagram.

- `comercial.html` dibuja el comercial. Los textos y los tiempos de cada escena están arriba del código, en `ESCENAS`.
- `grabar.js` lo convierte en video: `node tienda/video-piloto/grabar.js` (necesita Playwright y ffmpeg; tarda unos 4 minutos).
- Para mirar solo algunos segundos sin grabar todo: `node tienda/video-piloto/grabar.js 2 10 22`.

Si prefieres armarlo a mano en EffectCraft, sigue el guion de abajo.

Un video vertical corto (24 segundos) para TikTok, Reels o Shorts que muestra qué hace la app.
Las capturas de esta carpeta son de la app actual, de 1080 x 1920 (el tamaño exacto del video vertical).
Cada una existe en modo claro y en modo oscuro (`-oscuro`). Elige un modo y úsalo en todo el video.

| Archivo | Qué muestra |
|---|---|
| `0-portada.png` | La portada: el cactus y el perrito, "El cactus pincha. La paciencia abraza." |
| `1-hoy.png` | El contador: 21 días, hitos, dinero no gastado |
| `2-lo-que-viene.png` | Qué esperar en las semanas 3 y 4, y qué ayuda |
| `3-modo-ganas.png` | El reloj de 15 minutos con la respiración |
| `4-saber.png` | La guía de sustancias y Mati (opcional, ver "Cuidado" abajo) |
| `5-ayuda.png` | SENDA 1412, *4141 y 131 |

Los datos de las capturas son de prueba (Día 0 el 12 de octubre, el gasto por defecto de la app). No hay nada personal.

## Qué es EffectCraft

Un programa gratuito y de código abierto para animar video, parecido a After Effects. Se instala en el computador (Windows, Mac o Linux),
no en el teléfono. Se descarga desde la página de versiones de su repositorio: https://github.com/storytold/effectcraft/releases

Está en etapa temprana (versión alfa): guarda seguido y trabaja sobre copias. No pude abrirlo desde aquí, así que los nombres
de los menús pueden ser un poco distintos; los pasos usan las ideas básicas que tiene todo programa de este tipo
(composición, capas, línea de tiempo y fotogramas clave).

## El guion, escena por escena

Duración total: 24 segundos. Son seis escenas de 4 segundos cada una, con un fundido corto entre ellas.

| Tiempo | Imagen | Texto en pantalla | Movimiento |
|---|---|---|---|
| 0 a 4 s | `0-portada.png` | Una app para dejar o bajar el consumo. A tu ritmo. | Aparece desde negro; el texto entra a los 0,5 s |
| 4 a 8 s | `1-hoy.png` | Cuenta tus días. Si vuelves a empezar, lo avanzado no se borra. | Acercamiento lento (escala de 100 % a 108 %) |
| 8 a 12 s | `3-modo-ganas.png` | ¿Ganas fuertes? Las ganas suben y bajan. Aguanta la ola con la app. | La imagen "respira": escala 100 % → 104 % → 100 % cada 4 s |
| 12 a 16 s | `2-lo-que-viene.png` | Qué esperar cada semana, y qué ayuda. | Desliza de abajo hacia arriba |
| 16 a 20 s | `5-ayuda.png` | SENDA 1412: gratis, anónimo, las 24 horas. | Acercamiento lento |
| 20 a 24 s | Fondo verde liso | Cabeza Despejada. Gratis, sin cuenta y sin anuncios. Tus datos no salen de tu teléfono. | El texto aparece línea por línea |

En la última escena puedes sumar abajo, en letra chica, la dirección: `luiskoops-source.github.io/cabeza-despejada`

## Colores y letras (los mismos de la app)

| Uso | Modo claro | Modo oscuro |
|---|---|---|
| Fondo | `#f3ecdc` | `#15120e` |
| Texto | `#1f1c17` | `#f4eee1` |
| Verde principal (cierre, botones) | `#44701a` | `#a3cb52` |
| Naranjo (Modo ganas) | `#a3561d` | `#e2a46c` |

- Títulos: **Bricolage Grotesque**, peso 800.
- Texto: **Instrument Sans**, peso 500.
- Las dos son gratis en Google Fonts (fonts.google.com). Descárgalas desde ahí e instálalas en el computador:
  los archivos de la carpeta `fuentes/` son para la web (`.woff2`) y los programas de escritorio suelen pedir `.ttf`.
- Para que el texto se lea sobre las capturas, ponle detrás una caja de color de fondo con 85 % de opacidad y esquinas redondeadas,
  como las tarjetas de la app.

## Pasos en EffectCraft

1. **Composición nueva**: 1080 de ancho, 1920 de alto, 30 cuadros por segundo, 24 segundos.
2. **Importar**: las imágenes de esta carpeta (las seis del modo que elegiste).
3. **Ordenar en la línea de tiempo**: arrastra cada imagen como una capa y recórtala a sus 4 segundos, una después de otra.
   Haz que cada capa empiece 10 cuadros antes de que termine la anterior: ahí va el fundido.
4. **Fundidos**: en cada capa, fotograma clave de Opacidad en 0 % al inicio y 100 % 10 cuadros después.
5. **Movimiento**: fotogramas clave de Escala (o Posición, para el deslizamiento) al inicio y al final de cada capa, como dice la tabla.
   Usa curvas suaves (en el editor de curvas, "entrada y salida suave") para que no se vea brusco.
6. **Texto**: una capa de texto por escena, en la parte de arriba o de abajo de la pantalla, sin tapar lo importante de la captura.
   Deja libre la franja de abajo (unos 300 px) y la del lado derecho: ahí TikTok pone sus botones y la descripción.
7. **Cierre**: una capa sólida de color verde y el texto encima.
8. **Música** (opcional): algo tranquilo y sin letra. Es más simple sumarla después en TikTok o Instagram, que tienen música con permiso.
9. **Exportar**: MP4 (H.264), 1080 x 1920, 30 cuadros por segundo.

## Cuidado con el contenido

Son las mismas reglas de la app (CLAUDE.md):

- Nada que muestre consumo, sustancias, cantidades o cómo conseguirlas. Ni imágenes de polvo, pastillas o pipas "de ambiente".
- `4-saber.png` muestra el nombre de una sustancia. Úsala solo si hace falta: algunas redes bajan el alcance o retiran videos que nombran drogas,
  aunque sea para prevenir.
- Sin datos personales: ni tu nombre, ni tu historia real, ni montos reales. Las capturas ya usan datos de prueba.
- Sin promesas médicas ("te cura", "deja en 21 días"). La app acompaña; no reemplaza a un médico ni a un tratamiento.
- Sin vergüenza ni miedo: el tono es el de la app, tranquilo y sin juzgar.
- Los teléfonos que aparezcan deben ser los de la app: SENDA 1412, emergencias 131, *4141.
- La app es para mayores de 18. Si la red lo permite, marca el video para público adulto.
