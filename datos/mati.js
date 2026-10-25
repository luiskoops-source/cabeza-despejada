/* Mati por dentro (Saber): el personaje muestra qué pasa con cada sustancia y con las mezclas de a dos.
   Reglas (ver CLAUDE.md): nunca cantidades, formas de uso ni cómo conseguir; lo bueno se cuenta corto y seguido de lo que cobra.
   Lo que se siente, los daños, las mezclas de cada ficha y las emergencias salen de datos/sustancias.js.
   Aquí van dos cosas más:
   - fuentes: de dónde sale la información de cada sustancia (se muestran al final de la ficha de Mati).
   - combinaciones: qué pasa cuando se juntan dos sustancias. Niveles tomados de la tabla abierta de combinaciones
     de TripSit (tripsit.me/combo, datos en github.com/TripSit/drugs, revisados en octubre de 2026), con las notas
     traducidas y SIN sus consejos de uso. Los niveles son los de TripSit:
       peligrosa  = Dangerous (riesgo de muerte o daño grave)
       insegura   = Unsafe (daño serio probable)
       cuidado    = Caution (puede salir mal; las dos juntas suman riesgo)
       bajo       = Low Risk (TripSit no registra una interacción peligrosa; no significa seguro)
     Equivalencias: pasta base se trata como cocaína (es cocaína en forma fumable); tusi se evalúa como ketamina y MDMA,
     que es lo que suele traer, tomando el peor nivel; tabaco no tiene fila en esa tabla, así que lleva una nota general. */
window.MATI={
  fuentes:{
    "cocaina":[{n:"NIDA, Cocaine (DrugFacts)",u:"https://nida.nih.gov/publications/drugfacts/cocaine"},{n:"SENDA, Chile",u:"https://www.senda.gob.cl/"}],
    "pasta-base":[{n:"SENDA, Chile",u:"https://www.senda.gob.cl/"},{n:"NIDA, Cocaine (DrugFacts)",u:"https://nida.nih.gov/publications/drugfacts/cocaine"}],
    "alcohol":[{n:"NIAAA, Alcohol's effects on health",u:"https://www.niaaa.nih.gov/alcohols-effects-health"},{n:"SENDA, Chile",u:"https://www.senda.gob.cl/"}],
    "marihuana":[{n:"NIDA, Cannabis (DrugFacts)",u:"https://nida.nih.gov/publications/drugfacts/cannabis-marijuana"}],
    "benzodiacepinas":[{n:"NIDA, Prescription CNS depressants (DrugFacts)",u:"https://nida.nih.gov/publications/drugfacts/prescription-cns-depressants"}],
    "mdma":[{n:"NIDA, MDMA (DrugFacts)",u:"https://nida.nih.gov/publications/drugfacts/mdma-ecstasy-molly"},{n:"DanceSafe",u:"https://dancesafe.org/"}],
    "anfetaminas":[{n:"NIDA, Methamphetamine (DrugFacts)",u:"https://nida.nih.gov/publications/drugfacts/methamphetamine"},{n:"NIDA, Prescription stimulants (DrugFacts)",u:"https://nida.nih.gov/publications/drugfacts/prescription-stimulants"}],
    "ketamina":[{n:"NIDA, Ketamine",u:"https://nida.nih.gov/research-topics/ketamine"},{n:"DanceSafe",u:"https://dancesafe.org/"}],
    "tusi":[{n:"DEA, What is pink cocaine",u:"https://www.dea.gov/pink-cocaine"},{n:"DanceSafe",u:"https://dancesafe.org/"}],
    "opioides":[{n:"NIDA, Fentanyl (DrugFacts)",u:"https://nida.nih.gov/publications/drugfacts/fentanyl"},{n:"NIDA, Heroin (DrugFacts)",u:"https://nida.nih.gov/publications/drugfacts/heroin"}],
    "tabaco":[{n:"NIDA, Cigarettes and other tobacco products (DrugFacts)",u:"https://nida.nih.gov/publications/drugfacts/cigarettes-other-tobacco-products"}]
  },
  fuenteCombos:{n:"TripSit, tabla de combinaciones",u:"https://tripsit.me/combo"},
  /* Cómo se nombra cada id de la app en la tabla de TripSit */
  equivale:{"cocaina":"cocaine","pasta-base":"cocaine","alcohol":"alcohol","marihuana":"cannabis","benzodiacepinas":"benzodiazepines","mdma":"mdma","anfetaminas":"amphetamines","ketamina":"ketamine","opioides":"opioids"},
  /* Pares de la tabla (en cualquier orden) */
  combinaciones:[
    {a:"alcohol",b:"cocaine",nivel:"insegura",t:"La cocaína tapa la borrachera, así que la gente toma más de lo que tomaría. El hígado produce cocaetileno, que varios estudios señalan como más tóxico para el corazón que la cocaína sola."},
    {a:"alcohol",b:"amphetamines",nivel:"cuidado",t:"El estimulante esconde lo adormecedor del alcohol, que es lo que el cuerpo usa para saber cuánto lleva. Se termina tomando mucho más, sin frenos, con más riesgo para el hígado y más deshidratación, y se puede seguir tomando pasado el punto en que uno se habría desmayado."},
    {a:"alcohol",b:"mdma",nivel:"cuidado",t:"Las dos juntas exigen más al corazón. El MDMA no deja notar cuánto se ha tomado, y el alcohol suma deshidratación y riesgo de que la temperatura del cuerpo suba de más."},
    {a:"alcohol",b:"ketamine",nivel:"peligrosa",t:"Las dos quitan el equilibrio y traen un riesgo muy alto de vómito y de perder el conocimiento. Si alguien queda inconsciente y no está de lado, puede ahogarse con su vómito."},
    {a:"alcohol",b:"cannabis",nivel:"bajo",t:"TripSit no registra una interacción peligrosa. En exceso, la mezcla da náuseas y vómitos (la 'pálida')."},
    {a:"alcohol",b:"benzodiazepines",nivel:"peligrosa",t:"Se potencian fuerte y de forma impredecible: llevan muy rápido a perder el conocimiento. Lagunas de memoria casi seguras. Inconsciente y de espaldas, el vómito puede ahogar."},
    {a:"alcohol",b:"opioids",nivel:"peligrosa",t:"Cada una aumenta el sueño y la torpeza de la otra; se puede perder el conocimiento sin aviso y dejar de respirar. Lagunas de memoria probables."},
    {a:"cocaine",b:"amphetamines",nivel:"cuidado",t:"Dos estimulantes juntos: más carga para el corazón y la presión. Además la cocaína bloquea en parte el efecto de las anfetaminas, así que ni siquiera 'funciona' como la gente cree."},
    {a:"cocaine",b:"mdma",nivel:"cuidado",t:"La cocaína bloquea parte de lo que la gente busca del MDMA y a la vez sube el riesgo de infarto."},
    {a:"cocaine",b:"ketamine",nivel:"cuidado",t:"Sube la presión. Moverse con las dos encima es fácil terminar con una lesión por caídas o golpes."},
    {a:"cocaine",b:"cannabis",nivel:"cuidado",t:"Los estimulantes suben la ansiedad y las ideas que dan vueltas; con marihuana eso puede volverse una mala experiencia, con paranoia."},
    {a:"cocaine",b:"benzodiazepines",nivel:"bajo",t:"TripSit no registra una interacción peligrosa. Pero 'bajar' la cocaína con benzodiacepinas tapa las señales de alarma y lleva a consumir más de las dos."},
    {a:"cocaine",b:"opioids",nivel:"peligrosa",t:"El estimulante acelera la respiración y hace aguantar más opioide del normal. Cuando el estimulante se pasa primero, el opioide queda solo y puede parar la respiración."},
    {a:"amphetamines",b:"mdma",nivel:"cuidado",t:"Dos estimulantes: más carga al corazón, malestar físico y más chance de ansiedad y pensamientos en bucle. Las anfetaminas aumentan el daño del MDMA a las neuronas y suben más la temperatura del cuerpo."},
    {a:"amphetamines",b:"ketamine",nivel:"cuidado",t:"Sube la presión. Moverse con las dos encima trae riesgo de caídas y lesiones."},
    {a:"amphetamines",b:"cannabis",nivel:"cuidado",t:"Los estimulantes suben la ansiedad y los pensamientos en bucle; con marihuana puede terminar en una mala experiencia."},
    {a:"amphetamines",b:"benzodiazepines",nivel:"bajo",t:"TripSit no registra una interacción peligrosa, pero las dos se tapan mutuamente: si una se pasa antes que la otra, la que queda puede ser demasiado."},
    {a:"amphetamines",b:"opioids",nivel:"cuidado",t:"El estimulante acelera la respiración y hace aguantar más opioide. Si el estimulante se pasa primero, el opioide puede parar la respiración."},
    {a:"mdma",b:"ketamine",nivel:"bajo",t:"TripSit no registra una interacción peligrosa. Sube la presión y moverse con las dos encima trae riesgo de caídas. Esta mezcla es lo que suele traer el tusi."},
    {a:"mdma",b:"cannabis",nivel:"bajo",t:"TripSit no registra una interacción peligrosa, pero mucha marihuana con MDMA da experiencias fuertes e impredecibles."},
    {a:"mdma",b:"benzodiazepines",nivel:"bajo",t:"TripSit no registra una interacción peligrosa; las benzodiacepinas apagan el efecto del MDMA."},
    {a:"mdma",b:"opioids",nivel:"bajo",t:"TripSit no registra una interacción peligrosa entre las dos. Los opioides solos ya traen riesgo de dejar de respirar."},
    {a:"ketamine",b:"cannabis",nivel:"bajo",t:"TripSit no registra una interacción peligrosa. La marihuana puede hacer más intensa y confusa la disociación."},
    {a:"ketamine",b:"benzodiazepines",nivel:"cuidado",t:"Cada una aumenta el sueño y la torpeza de la otra; se puede perder el conocimiento sin aviso. Inconsciente y de espaldas, el vómito puede ahogar."},
    {a:"ketamine",b:"opioids",nivel:"peligrosa",t:"Las dos traen riesgo de vómito y de perder el conocimiento. Si alguien queda inconsciente y no está de lado, puede ahogarse con su vómito."},
    {a:"cannabis",b:"benzodiazepines",nivel:"bajo",t:"TripSit no registra una interacción peligrosa. Las dos dan sueño y torpeza: más riesgo de caídas y de no poder reaccionar."},
    {a:"cannabis",b:"opioids",nivel:"bajo",t:"TripSit no registra una interacción peligrosa entre las dos. Los opioides solos ya traen riesgo de dejar de respirar."},
    {a:"benzodiazepines",b:"opioids",nivel:"peligrosa",t:"Las dos frenan la respiración y se potencian fuerte y de forma impredecible: llevan muy rápido a perder el conocimiento y a dejar de respirar. Es una de las mezclas con más muertes."}
  ],
  /* Notas que se agregan según la sustancia, además del par */
  notas:{
    "pasta-base":"La pasta base es cocaína en forma fumable: aquí se evalúa como cocaína. Sus daños propios (pulmones, deterioro rápido) se suman.",
    "tusi":"El tusi ya es una mezcla y cambia de bolsa en bolsa (suele traer ketamina y MDMA, a veces más cosas). Aquí se evalúa como ketamina y como MDMA, tomando el peor de los dos resultados. Juntarlo con otra cosa es apostar a ciegas.",
    "tabaco":"La tabla de TripSit no tiene fila para el tabaco. Lo que sí se sabe: con estimulantes suma pulso y presión, y con alcohol la mayoría fuma mucho más. No hay mezcla con tabaco que salga mejor que sin él."
  },
  /* Qué dice Mati y cómo se ve según el nivel de la mezcla */
  niveles:{
    peligrosa:{titulo:"Mezcla peligrosa",globo:"Esto puede matar a alguien.",color:"bad"},
    insegura:{titulo:"Mezcla insegura",globo:"Esto hace daño de verdad.",color:"bad"},
    cuidado:{titulo:"Mezcla con cuidado",globo:"Las dos juntas suman riesgo.",color:"warm"},
    bajo:{titulo:"Sin interacción registrada",globo:"No se potencian... pero cada una cobra igual.",color:"muted"},
    sinficha:{titulo:"Sin ficha de mezcla",globo:"De esta mezcla no hay tabla. Igual no es gratis.",color:"muted"}
  }
};
