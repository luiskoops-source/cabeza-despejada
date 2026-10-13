/* Lo que viene: etapas generales de los primeros meses sin consumir y una frase de ánimo para cada día.
   Son etapas aproximadas y comunes a casi todas las sustancias; los plazos de cada una están en datos/sustancias.js (campo abstinencia).
   Fuentes: MedlinePlus (abstinencia de la cocaína), NIDA, SENDA. Sin cifras que no estén en esas fuentes.
   Campos de cada etapa: desde y hasta (días desde el Día 0), titulo, que (lo que se siente), ayuda (lo que sirve). */
window.ETAPAS=[
{desde:0,hasta:3,titulo:"Los primeros días: el bajón",
 que:"Cansancio, mucho sueño o nada de sueño, hambre, ánimo bajo e irritabilidad. Es el cerebro reponiendo lo que gastó, no es tu vida.",
 ayuda:"Dormir, comer algo, tomar agua y no quedarte solo. No tomes decisiones grandes estos días."},
{desde:4,hasta:13,titulo:"Primera y segunda semana: las olas de ganas",
 que:"El cuerpo empieza a sentirse mejor, pero las ganas llegan en olas, sobre todo en tus horas, lugares y personas de siempre. Cada ola sube y baja sola.",
 ayuda:"Usar el Modo ganas, tener un plan para tu hora difícil y borrar o bloquear el contacto."},
{desde:14,hasta:30,titulo:"Semanas 2 a 4: cuando todo se siente plano",
 que:"Puede que nada dé gusto (anhedonia). Es el momento en que la cabeza dice \"ya no se siente mejor, para qué\". Es una etapa del cerebro, no una señal de que no funciona.",
 ayuda:"Rutina, moverte, sol, comer a sus horas y hablar con alguien. Si el ánimo sigue muy bajo, consulta en el consultorio o llama al 1412."},
{desde:31,hasta:90,titulo:"Meses 1 a 3: vuelve el color",
 que:"De a poco vuelve el gusto por cosas pequeñas y el sueño se ordena. No es en línea recta: hay días buenos y días malos.",
 ayuda:"Seguir anotando las ganas para ver tu patrón y celebrar cada hito, aunque parezca pequeño."}
];

/* Una frase por día para los primeros 14 días. Después se usa la de la etapa. */
window.ANIMO_DIA=[
"Día 0. Hoy no tienes que dejar nada para siempre. Solo hoy.",
"Día 1. El cansancio y la tristeza de hoy son el bajón. Pasan.",
"Día 2. Si hoy duermes mucho o comes mucho, está bien. El cuerpo se está reponiendo.",
"Día 3. Si hoy pesa, es normal: estos días suelen ser de los más duros. Pasan.",
"Día 4. Ya pasaste los primeros días. Eso no es poco.",
"Día 5. Si hoy llegan ganas, recuerda: una ola dura minutos, no horas.",
"Día 6. Tu cerebro lleva casi una semana sin interrupciones. Se nota de a poco.",
"Día 7. Una semana. Lo que hiciste siete veces seguidas ya es un patrón.",
"Día 8. Las ganas pueden llegar sin aviso. No significan que vayas mal.",
"Día 9. Mira cuánto llevas, no cuánto falta.",
"Día 10. Diez días. Cada noche sin consumir ayuda a que el sueño se ordene.",
"Día 11. Si hoy algo te dio un poco de gusto, anótalo. Es el cerebro volviendo.",
"Día 12. Hablar de esto con alguien le quita fuerza. El 1412 es gratis y anónimo.",
"Día 13. Mañana son dos semanas. Hoy solo toca llegar a la noche."
];
