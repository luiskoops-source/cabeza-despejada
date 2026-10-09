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
