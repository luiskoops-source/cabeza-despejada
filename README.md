# Cabeza Despejada

App personal de apoyo para dejar la cocaína. Hecha en HTML, CSS y JavaScript puros, sin frameworks, para que cada archivo se pueda leer y entender.

## Cómo abrirla

Doble clic en `index.html`. Funciona sin servidor ni instalación.

## Estructura

```
cabeza-despejada/
├── index.html        Estructura: las 4 pantallas (Hoy, Saber, Registro, Ayuda) y el Modo ganas
├── css/estilos.css   Todo lo visual: colores, tipografías, tamaños, modo oscuro
├── js/app.js         La lógica: contador, dinero, registro, gráfico, modo ganas, chat
├── datos/hechos.js   La biblioteca de hechos (fácil de editar sin tocar la lógica)
├── CLAUDE.md         Instrucciones para Claude Code (cómo trabajar en este proyecto)
└── README.md         Este archivo
```

## Cómo guarda los datos

En `localStorage` del navegador, bajo la clave `cd.v1`. Eso significa que cada aparato tiene sus propios datos. Pasar a una base de datos real es el siguiente paso del proyecto.

## Funciones que dependen de Claude

Los botones "Cuéntame algo nuevo", "Explícame" y el chat del Modo ganas usan `window.claude.use("sample")`, que solo existe cuando la app corre como artefacto dentro de claude.ai. Abierta como archivo local, esos botones se desactivan solos. Para que funcionen fuera de claude.ai hay que conectarla a la API de Claude con un servidor propio (paso futuro).

## Plan de mejoras

1. Separar y entender el código (hecho).
2. Pruebas automáticas para el contador de días y el cálculo de dinero.
3. Convertirla en PWA instalable (ícono en el celular, funciona sin internet).
4. Notificaciones a la hora difícil.
5. Base de datos y cuenta, para que celular y PC muestren lo mismo.
6. Servicio que agregue un dato o estudio nuevo cada día.
