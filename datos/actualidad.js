/* Actualidad: estudios, informes, alertas y comunidades recientes sobre drogas y recuperación.
   Cada entrada: fecha (texto), tipo (Informe, Alerta, Estudio, Análisis, Datos Chile, Comunidad), fuente, titulo, resumen, enlace, nota (opcional).
   Regla: solo cosas verificadas en la fuente enlazada. Si una cifra no está en la fuente, no se pone.
   Para actualizar: agregar entradas nuevas arriba del todo. Las más viejas se pueden borrar cuando dejen de ser "actualidad". */
window.ACTUALIDAD=[
{fecha:"Septiembre 2026",tipo:"Estudio",fuente:"JAMA Network Open · Universidad de Alabama en Birmingham",
 titulo:"Un ensayo clínico probó psilocibina con terapia para la adicción a la cocaína",
 resumen:"40 adultos que querían dejar la cocaína recibieron una sola dosis de psilocibina o un placebo activo, ambos con terapia cognitivo-conductual. A los 180 días, el 30% del grupo con psilocibina logró abstinencia completa; nadie del grupo placebo. Es un estudio pequeño y los propios autores piden ensayos más grandes.",
 nota:"Es investigación, no un tratamiento disponible. Tomar psilocibina por cuenta propia no es esto: el efecto medido viene de dosis controladas, en hospital y con terapia.",
 enlace:"https://www.psypost.org/psilocybin-therapy-shows-strong-potential-for-treating-cocaine-addiction/"},

{fecha:"Agosto 2026",tipo:"Alerta",fuente:"ONUDD (Naciones Unidas), vía Infobae",
 titulo:"Los nitazenos ya se detectaron en al menos 37 países",
 resumen:"La ONU reportó en febrero de 2026 que 34 variantes de nitazenos, una familia de opioides sintéticos, aparecieron en decomisos y casos de toxicología en al menos 37 países. Algunos son más potentes que el fentanilo. Se venden como pastillas falsas, polvo, cristales o cartuchos de vapeo, mezclados con otras drogas, y la gente los consume sin saberlo. Los tests rápidos no detectan todas las variantes.",
 nota:"Esto es lo que hace peligroso comprar 'pastillas' o polvos de origen desconocido en cualquier parte del mundo: lo que mata no es la droga que crees que compraste, sino lo que trae adentro.",
 enlace:"https://www.infobae.com/mexico/2026/08/17/nitazenos-se-extienden-por-37-paises-y-amenazan-con-sustituir-al-fentanilo-mexico-ya-los-contempla-como-estupefacientes/"},

{fecha:"Agosto 2026",tipo:"Análisis",fuente:"lasDrogas.info (columna de opinión)",
 titulo:"Chile aprobó una ley antifentanilo, pero la espera por tratamiento sigue siendo de meses",
 resumen:"La ley sube las penas hasta 15 años por tráfico de fentanilo, carfentanilo, ketamina y metanfetamina, incluso en cantidades pequeñas. El artículo señala que el fentanilo 'está llegando' a Chile (robos de ampollas en hospitales, sobredosis en fiestas), y que la lista de espera para tratamiento especializado en el sistema público es de 3 a 8 meses; SENDA alcanzaría a menos del 20% de quienes necesitan tratamiento.",
 nota:"Es una columna de opinión, no un informe oficial, pero las cifras de espera las atribuye al Ministerio de Salud. Por eso esta app insiste en el 1412: es gratuito y atiende hoy, no en ocho meses.",
 enlace:"https://lasdrogas.info/analisis/chile-ley-anti-fentanilo/"},

{fecha:"Junio 2026",tipo:"Informe",fuente:"ONUDD · Informe Mundial sobre Drogas 2026",
 titulo:"331 millones de personas usaron drogas en 2024, un récord",
 resumen:"Es el 6,2% de las personas entre 15 y 64 años, frente al 5,2% de hace una década. 25 millones usaron cocaína. Con la caída de la heroína tras la prohibición del opio en Afganistán, los traficantes se vuelcan a opioides sintéticos como fentanilos y nitazenos. Brecha de tratamiento: solo 1 de cada 23 mujeres con un trastorno por consumo recibe tratamiento, frente a 1 de cada 9 hombres.",
 enlace:"https://news.un.org/en/story/2026/06/1167817"},

{fecha:"Abril 2026",tipo:"Informe",fuente:"OEA / CICAD · Observatorio Interamericano sobre Drogas, vía Infobae",
 titulo:"En Latinoamérica el mercado ya no vende sustancias: vende mezclas",
 resumen:"El sistema de alerta temprana de las Américas muestra que desde 2022-2023 dominan las mezclas: estimulantes, opioides, sedantes y aditivos industriales juntos. El 'tusi' llegó a tener hasta 9 sustancias en una sola muestra (ketamina, MDMA, metanfetamina, cafeína, catinonas, benzodiacepinas, opioides). Los nitazenos ya se detectaron en Sudamérica. En 2022, en Argentina, cocaína adulterada con carfentanilo dejó 24 muertos y 80 hospitalizados en 48 horas.",
 nota:"Por eso, aunque en Chile el fentanilo no sea masivo, la lección del caso argentino aplica: la cocaína también puede venir con un opioide adentro. Alguien que 'no despierta' después de consumir es emergencia, siempre.",
 enlace:"https://www.infobae.com/america/america-latina/2026/04/22/el-avance-de-las-drogas-sinteticas-en-la-region-mezclas-impredecibles-y-un-desafio-sanitario-creciente/"},

{fecha:"Diciembre 2025",tipo:"Datos Chile",fuente:"SENDA · 16° Estudio de Drogas en Población General (datos 2024)",
 titulo:"En Chile baja el alcohol y la marihuana; la cocaína baja solo en el nivel socioeconómico medio",
 resumen:"Encuesta a 18.668 personas de 12 a 65 años en 109 comunas. Consumo de alcohol en el último mes: 34,6%, el más bajo de la serie, pero casi la mitad de quienes beben lo hacen en exceso (5 o más tragos). Marihuana en el último año: 10,1%, la más baja en una década. La cocaína bajó de forma significativa solo en el nivel socioeconómico medio. La gente reporta menos ofertas de drogas.",
 enlace:"https://psiconecta.org/wp-content/uploads/2025/12/ENPG-2024-Prensa.pdf"}
];

/* Comunidades y servicios activos. Sin fechas: se revisan cada tanto para confirmar que siguen funcionando. */
window.COMUNIDADES=[
{nombre:"Chat 1412 de SENDA",que:"Consejería por chat, gratuita y anónima, también fines de semana de 8:00 a 20:00. Complementa al fono 1412, que atiende 24 horas.",enlace:"https://www.senda.gob.cl"},
{nombre:"r/StopSpeeding",que:"Comunidad en inglés para dejar estimulantes (cocaína, anfetaminas, metanfetamina). Muy activa: gente contando sus días limpios, recaídas y qué les sirvió.",enlace:"https://www.reddit.com/r/StopSpeeding/"},
{nombre:"r/REDDITORSINRECOVERY",que:"Recuperación de cualquier sustancia, en inglés. Historias largas de gente con años limpios.",enlace:"https://www.reddit.com/r/REDDITORSINRECOVERY/"},
{nombre:"r/Adicciones",que:"Comunidad en español, más pequeña, con gente de Chile y Latinoamérica.",enlace:"https://www.reddit.com/r/Adicciones/"},
{nombre:"Narcóticos Anónimos",que:"Reuniones gratuitas y anónimas en todo Chile y por videollamada. No hay que inscribirse.",enlace:"https://www.na.org/meetingsearch/"},
{nombre:"SMART Recovery",que:"Alternativa a los 12 pasos, basada en herramientas prácticas. Reuniones online en español.",enlace:"https://smartrecovery.org"},
{nombre:"DanceSafe",que:"Organización de reducción de daños (EE.UU.). Fichas por sustancia y kits de prueba para saber qué contiene algo.",enlace:"https://dancesafe.org/drug-information/"},
{nombre:"Échele Cabeza (Colombia)",que:"Programa colombiano que analiza sustancias en fiestas y publica alertas sobre lo que realmente contienen (incluido el tusi).",enlace:"https://www.echelecabeza.com"},
{nombre:"TripSit",que:"Wiki y chat de reducción de daños en inglés, con tabla de combinaciones peligrosas.",enlace:"https://wiki.tripsit.me"}
];
