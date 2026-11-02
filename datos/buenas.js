/* Mensaje del día y buena noticia del día (tarjeta en Hoy, js/app.js renderBuenaDelDia).
   MENSAJES_DIA: frases cálidas según el día de la semana (0 = domingo ... 6 = sábado). Cada semana se usa la siguiente de la lista.
   BUENAS: "¿Sabías que?" con buenas noticias de la ciencia sobre recuperarse. Una por día, en orden.
   Cada buena: t = título, b = texto, f = fuentes [{n: nombre, u: enlace}]. Solo cosas verdaderas y que la fuente respalde.
   Para agregar una, copia un bloque {t:..., b:..., f:[...]} y pégalo antes del último ]. */
window.MENSAJES_DIA={
  0:["Domingo es para descansar. Descansar también es avanzar.",
     "Hoy no hay que rendir nada. Comer rico, dormir y estar en paz ya es suficiente.",
     "Si la semana fue difícil, hoy puedes soltarla. Mañana es otra página."],
  1:["No tienes que arreglar toda la semana. Solo este día.",
     "Empieza la semana. Un vaso de agua y un paso a la vez ya es empezar bien.",
     "Los lunes pesan. Pero llegaste, y eso cuenta."],
  2:["Martes tranquilo: lo simple también es un logro.",
     "Hoy puedes hacer una sola cosa bien. Con eso basta.",
     "Tu cabeza se está ordenando, aunque no lo notes todavía."],
  3:["Mitad de semana. Mira todo lo que ya sostuviste.",
     "Si hoy cuesta, respira. Las ganas pasan; tú te quedas.",
     "Un día más es un día más que tu cuerpo usa para repararse."],
  4:["Jueves: buen día para pensar con calma en el fin de semana.",
     "Lo que haces hoy le facilita el camino al tú de mañana.",
     "Vas bien. Aunque sea despacio, vas."],
  5:["Viernes: tu plan vale más que las ganas.",
     "El fin de semana también se puede disfrutar con la cabeza despejada.",
     "Hoy puedes darte un gusto que no te cobre el lunes."],
  6:["Sábado: despertar sin culpa es el mejor regalo.",
     "Hoy puedes hacer algo que te guste, solo porque sí.",
     "Las cosas simples se sienten distintas cuando la cabeza está clara."]
};

window.BUENAS=[
 {t:"Un poco de sed ya cambia el ánimo",b:"Con apenas un poco de deshidratación, incluso antes de sentir sed, aparecen cansancio, peor ánimo y dificultad para concentrarse. Ese malestar es fácil de confundir con ganas de consumir. Tomar agua no borra las ganas por sí sola, pero le quita combustible. Por eso, cuando lleguen, revisa primero: ¿tengo sed, hambre o sueño?",f:[{n:"Armstrong y otros, 2012, sobre deshidratación leve y ánimo (en inglés)",u:"https://library.fabresearch.org/viewItem.php?id=7189"}]},
 {t:"Una caminata corta baja las ganas",b:"Una revisión de estudios encontró que una sola sesión de ejercicio, aunque sea moderada como caminar rápido unos minutos, bajó las ganas, el malestar de la abstinencia y el mal ánimo en personas que dejaban el cigarro, y alargó el tiempo hasta el siguiente. Moverse es una herramienta que puedes usar en el momento.",f:[{n:"Taylor, Ussher y Faulkner, 2007, revista Addiction (en inglés)",u:"https://pubmed.ncbi.nlm.nih.gov/17286639/"}]},
 {t:"El cerebro repara lo que la droga gastó",b:"En personas que dejaron la metanfetamina, los transportadores de dopamina (piezas clave del sistema del placer) aumentaron de forma clara después de alrededor de un año sin consumo. El cerebro no queda roto: se recupera con tiempo limpio.",f:[{n:"Volkow y otros, 2001, Journal of Neuroscience (en inglés)",u:"https://www.jneurosci.org/content/21/23/9414"}]},
 {t:"La materia gris vuelve",b:"En personas que dejaron la cocaína, zonas del cerebro que ayudan a decidir y controlar los impulsos recuperaron volumen con los meses de abstinencia. Cada día sin consumir es tiempo de reparación.",f:[{n:"Parvaz y otros, 2017, Addiction Biology (en inglés)",u:"https://researchconnect.stonybrook.edu/en/publications/prefrontal-gray-matter-volume-recovery-in-treatment-seeking-cocai/"}]},
 {t:"Salir es lo más común, no la excepción",b:"Un estudio nacional en Estados Unidos encontró que cerca de 1 de cada 10 adultos dice haber superado un problema con el alcohol o las drogas: más de 22 millones de personas. Y alrededor de la mitad lo logró sin un tratamiento formal. Mucha gente sale.",f:[{n:"Kelly y otros, 2017, resumen de Recovery Research Institute (en inglés)",u:"https://www.recoveryanswers.org/research-post/1-in-10-americans-report-having-resolved-a-significant"}]},
 {t:"Las ganas tienen fecha de término",b:"Un deseo intenso funciona como una ola: sube, llega a un máximo y baja, por lo general en menos de una hora, aunque no hagas nada. No tienes que ganarle para siempre. Solo esperar que baje.",f:[{n:"Carroll, 1998, manual de NIDA de terapia para la adicción a la cocaína (en inglés)",u:"https://ojp.gov/pdffiles1/Photocopy/180294NCJRS.pdf"}]},
 {t:"Cada 'no' entrena al cerebro",b:"Las señales que antes encendían las ganas (una hora, un lugar, un contacto) pierden fuerza cada vez que aparecen y no terminan en consumo. Cada vez que dejas pasar una, el circuito se debilita un poco más.",f:[{n:"NIDA: Las drogas y el cerebro",u:"https://nida.nih.gov/es/publicaciones/las-drogas-el-cerebro-y-la-conducta-la-ciencia-de-la-adiccion/las-drogas-y-el-cerebro"}]},
 {t:"La compañía protege",b:"En experimentos, los animales que vivían acompañados y con cosas que hacer consumían mucho menos droga que los aislados, aunque la tuvieran igual de disponible. Escribirle a alguien o salir a ver gente también es parte de recuperarse.",f:[{n:"Powell y otros, 2020, Scientific Reports (en inglés)",u:"https://www.nature.com/articles/s41598-020-67966-8"}]},
 {t:"Dormir cuida tu sistema del placer",b:"En un estudio, una sola noche sin dormir redujo los receptores de dopamina disponibles en las zonas de recompensa del cerebro. Dormir bien es una de las formas más simples de ayudar a que lo normal vuelva a sentirse rico.",f:[{n:"Volkow y otros, 2012, Journal of Neuroscience (en inglés)",u:"https://www.jneurosci.org/content/32/19/6711"}]},
 {t:"Volver a levantarse también cuenta",b:"La recuperación casi nunca es una línea recta, igual que en otras enfermedades crónicas. Una recaída no significa que el tratamiento falló: significa que hay que retomarlo o ajustarlo. Lo que juntaste antes sigue siendo tuyo.",f:[{n:"NIDA: La ciencia de la adicción (PDF)",u:"https://nida.nih.gov/sites/default/files/soa_sp_2014.pdf"}]},
 {t:"En Chile hay tratamiento gratis",b:"SENDA tiene programas sin costo, ambulatorios y residenciales, para personas con Fonasa. Y el 1412 orienta gratis, de forma confidencial y a toda hora. No tienes que hacerlo solo.",f:[{n:"Gobierno de Chile: tratamiento y rehabilitación de SENDA",u:"https://www.ventanillaunicasocial.gob.cl/ficha/243/tratamiento-rehabilitacion-senda"}]}
];
