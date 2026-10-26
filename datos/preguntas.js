/* Preguntas de verdadero o falso para la "Pregunta del día".
   Cada una: q (afirmación), v (true si es verdadera), e (explicación corta), s (id de sustancia, o "general").
   Todas salen de la guía de sustancias. Sirven para aprender, no para asustar. */
window.PREGUNTAS=[
{q:"Las ganas de consumir duran para siempre si no haces nada.",v:false,e:"Falso. Suben, llegan a un máximo y bajan solas, normalmente en 15 a 30 minutos. Por eso el Modo ganas tiene un reloj.",s:"general"},
{q:"Mezclar cocaína con alcohol produce en el hígado una sustancia más tóxica que cada una por separado.",v:true,e:"Verdadero. Se llama cocaetileno, dura más y es más dañina para el corazón.",s:"cocaina"},
{q:"El alcohol se puede dejar de golpe sin riesgo, aunque se beba mucho todos los días.",v:false,e:"Falso. En personas que beben mucho a diario, la abstinencia brusca puede causar convulsiones. Se deja con apoyo médico.",s:"alcohol"},
{q:"Las benzodiacepinas (clonazepam, alprazolam) mezcladas con alcohol pueden detener la respiración mientras se duerme.",v:true,e:"Verdadero. Es la combinación que más muertes causa, muchas veces durmiendo.",s:"benzodiacepinas"},
{q:"La cocaína que se vende en Chile suele venir pura.",v:false,e:"Falso. Casi siempre está cortada con levamisol, cafeína u otras cosas. No se puede saber mirándola.",s:"cocaina"},
{q:"Dormir poco empeora la paranoia que produce la cocaína.",v:true,e:"Verdadero. Sin dormir, el cerebro no recupera sus niveles de dopamina y la psicosis llega más rápido.",s:"cocaina"},
{q:"Si alguien no despierta después de consumir, lo mejor es dejarlo dormir.",v:false,e:"Falso. Si no despierta con estímulos fuertes o respira muy lento, es una emergencia: llamar al 131 y ponerlo de lado.",s:"general"},
{q:"El 1412 de SENDA es gratuito, anónimo y atiende las 24 horas.",v:true,e:"Verdadero. Nadie te pide el nombre. Sirve para orientarse, no solo para crisis.",s:"general"},
{q:"La anhedonia (que nada se sienta bien) después de dejar la cocaína es permanente.",v:false,e:"Falso. Es el cerebro recuperando sus receptores de dopamina. Suele mejorar entre el mes y los tres meses.",s:"cocaina"},
{q:"Lo que se vende como 'tusi' casi nunca contiene 2C-B.",v:true,e:"Verdadero. Los análisis muestran que suele ser ketamina, MDMA y cafeína con colorante, en proporciones que cambian de bolsa en bolsa.",s:"tusi"},
{q:"Con MDMA, tomar mucha agua de golpe es siempre seguro.",v:false,e:"Falso. Demasiada agua puede bajar el sodio a niveles peligrosos. Agua a sorbos, no litros, y descansar del calor.",s:"mdma"},
{q:"La ketamina usada seguido puede dañar la vejiga de forma seria.",v:true,e:"Verdadero. Se llama cistitis por ketamina y puede ser irreversible si no se deja a tiempo.",s:"ketamina"},
{q:"Una recaída borra todo lo avanzado.",v:false,e:"Falso. Lo que predice el éxito es cuánto demoras en levantarte y qué aprendes. Por eso la app guarda tu racha más larga.",s:"general"},
{q:"Si llamas al 131 por una sobredosis y dices qué se consumió, te van a denunciar.",v:false,e:"Falso. Los servicios de urgencia están para tratar, no para denunciar. Decir qué se consumió les permite ayudar mejor.",s:"general"},
{q:"Los parches o chicles de nicotina aumentan la probabilidad de dejar el tabaco.",v:true,e:"Verdadero. La aumentan en alrededor de la mitad. Se compran sin receta y son de las ayudas más estudiadas.",s:"tabaco"},
{q:"Un dolor leve en el pecho después de consumir cocaína no es para preocuparse.",v:false,e:"Falso. En la hora después de consumir, el riesgo de infarto es muchas veces mayor. Dolor en el pecho, aunque sea leve, es para llamar al 131.",s:"cocaina"},
{q:"La marihuana de hoy es mucho más potente que la de hace 20 años.",v:true,e:"Verdadero. Y las variedades potentes se asocian con más riesgo de psicosis en personas con predisposición.",s:"marihuana"},
{q:"Los opioides (tramadol, codeína, morfina) con alcohol son una mezcla segura si es poca cantidad.",v:false,e:"Falso. Los dos deprimen la respiración y juntos son de las combinaciones más mortales que existen.",s:"opioides"},
{q:"La naloxona revierte una sobredosis de opioides y no hace daño si no era opioide.",v:true,e:"Verdadero. Si está disponible, se usa y se llama al 131 igual.",s:"opioides"},
{q:"El tiempo libre sin plan es uno de los gatillantes más comunes para consumir.",v:true,e:"Verdadero. Por eso la app te pide un plan para tu hora difícil.",s:"general"},
{q:"La pasta base engancha rápido porque su efecto dura mucho.",v:false,e:"Falso. Engancha porque dura muy poco (minutos) y deja una angustia que empuja a repetir de inmediato.",s:"pasta-base"},
{q:"Pedir ayuda profesional sube las probabilidades de mantenerse sin consumir.",v:true,e:"Verdadero. Combinar estrategias propias con apoyo profesional o grupos funciona mejor que hacerlo solo.",s:"general"},
{q:"Varios días sin dormir con estimulantes pueden provocar psicosis incluso en personas sanas.",v:true,e:"Verdadero. Dormir no es opcional en esos casos: es urgente.",s:"anfetaminas"},
{q:"Si usas benzodiacepinas todos los días, lo correcto es dejarlas de golpe cuanto antes.",v:false,e:"Falso. Es la excepción: se bajan de a poco con un médico. Dejarlas de golpe puede causar convulsiones.",s:"benzodiacepinas"}
];

/* Más preguntas, para que la del día no sea siempre de cocaína */
window.PREGUNTAS.push(
{q:"Un café fuerte baja la borrachera.",v:false,e:"Falso. Solo el tiempo baja el alcohol en la sangre. El café deja a la persona despierta y borracha, que es peor para manejar.",s:"alcohol"},
{q:"Beber mucho a diario y dejar de golpe puede provocar convulsiones.",v:true,e:"Verdadero. Es de las pocas abstinencias que pueden matar. Se deja con apoyo médico.",s:"alcohol"},
{q:"La pasta base engancha más rápido que la cocaína aspirada.",v:true,e:"Verdadero. Se fuma, llega al cerebro en segundos, dura minutos y deja una angustia que empuja a repetir de inmediato.",s:"pasta-base"},
{q:"SENDA tiene tratamiento residencial gratuito para pasta base.",v:true,e:"Verdadero. Llamando al 1412 se pide evaluación. Para esta sustancia, salir del entorno un tiempo suele ser lo que mejor funciona.",s:"pasta-base"},
{q:"Si alguien fuma marihuana todos los días y deja, no siente nada al dejarla.",v:false,e:"Falso. Hay abstinencia real: irritabilidad, insomnio, sueños muy vívidos, poco apetito. Dura una o dos semanas y no es peligrosa.",s:"marihuana"},
{q:"Dos pastillas de éxtasis con el mismo logo traen lo mismo.",v:false,e:"Falso. El logo se copia. Pueden traer cantidades muy distintas o sustancias distintas (metanfetamina, catinonas, PMA).",s:"mdma"},
{q:"El Ritalín sin receta para estudiar es inofensivo.",v:false,e:"Falso. Es un estimulante emparentado con las anfetaminas. Trae insomnio, ansiedad y dependencia, y lo que se memoriza sin dormir se olvida rápido.",s:"anfetaminas"},
{q:"En el 'k-hole' de la ketamina la persona no siente dolor.",v:true,e:"Verdadero. Por eso las lesiones son por caídas, quemaduras o ahogarse con vómito, no por la droga en sí.",s:"ketamina"},
{q:"El tramadol no se puede mezclar con alcohol.",v:true,e:"Verdadero. Es un opioide: con alcohol o benzodiacepinas puede detener la respiración.",s:"opioides"},
{q:"Vapear no tiene nicotina.",v:false,e:"Falso. La mayoría de los vapeadores entregan nicotina en cantidades altas. Para dejar de fumar, los parches y chicles son más seguros.",s:"tabaco"},
{q:"Alguien con pupilas muy pequeñas y que cabecea probablemente tomó un estimulante.",v:false,e:"Falso. Pupilas pequeñas y cabeceo son señales de opioides. Los estimulantes dilatan las pupilas.",s:"general"},
{q:"La anhedonia después de dejar una sustancia mejora sola con tiempo limpio.",v:true,e:"Verdadero. Es el cerebro recuperando sus receptores. Suele mejorar entre el mes y los tres meses. Si pasados varios meses sigue, conviene consultar: puede ser distimia.",s:"general"},
{q:"La posición lateral de seguridad evita que alguien inconsciente se ahogue con su vómito.",v:true,e:"Verdadero. De lado, pierna de arriba doblada, mano bajo la mejilla, boca hacia el suelo. Y llamar al 131.",s:"general"},
{q:"Si un amigo se puso paranoico tras varios días sin dormir con estimulantes, lo que más necesita es dormir.",v:true,e:"Verdadero. La psicosis por falta de sueño pasa al dormir. Si hay riesgo para él o para otros, 131.",s:"general"}
);

/* Preguntas agregadas en octubre de 2026. Salen de la guía de sustancias y de los hechos con fuente de la app. */
window.PREGUNTAS.push(
{q:"Los cannabinoides sintéticos (spice, K2) son una versión más suave de la marihuana.",v:false,e:"Falso. No son marihuana y son mucho más peligrosos: convulsiones, agitación extrema y pulso muy alto. Si se sospecha uno, 131.",s:"marihuana"},
{q:"Para dejar la cocaína hace falta una desintoxicación en el hospital.",v:false,e:"Falso. La abstinencia de cocaína no es peligrosa para el cuerpo, aunque sí es dura. Lo que más ayuda es el apoyo psicológico, no una desintoxicación médica.",s:"cocaina"},
{q:"Beber poco alcohol elimina el riesgo de cáncer que tiene el alcohol.",v:false,e:"Falso. No existe una cantidad segura: el riesgo de cáncer de boca, esófago, hígado y mama sube desde el primer trago. Mientras menos, menor el riesgo.",s:"alcohol"},
{q:"El levamisol con que suele cortarse la cocaína puede dejar al cuerpo sin defensas.",v:true,e:"Verdadero. Puede destruir glóbulos blancos y causar heridas en la piel que no sanan. No hay forma de saber cuánto lleva mirándola.",s:"cocaina"},
{q:"Si alguien despierta después de recibir naloxona, ya no hace falta llamar al 131.",v:false,e:"Falso. El efecto de la naloxona puede durar menos que el del opioide, y la persona puede volver a dejar de respirar. Se llama al 131 igual, aunque despierte.",s:"opioides"},
{q:"Mezclar MDMA con antidepresivos puede provocar un síndrome serotoninérgico que puede ser mortal.",v:true,e:"Verdadero. También con tramadol. Temperatura alta, rigidez, confusión y pulso muy rápido después de esa mezcla son para llamar al 131.",s:"mdma"},
{q:"Los vómitos repetidos e incontrolables en alguien que fuma marihuana todos los días pueden ser causados por la marihuana.",v:true,e:"Verdadero. Se llama hiperemesis cannabinoide. Hay que ir a urgencias, y lo único que lo resuelve de fondo es dejar de fumarla.",s:"marihuana"},
{q:"Si un amigo está paranoico por consumo, lo mejor es explicarle que lo que ve no es real.",v:false,e:"Falso. Discutir las ideas aumenta la angustia. Lo que ayuda es acompañar, bajar la luz y el ruido, no tomar nada más y dormir. Si hay riesgo para alguien, 131.",s:"general"},
{q:"La abstinencia de opioides como el tramadol o la heroína suele ser mortal.",v:false,e:"Falso. Es muy dura (dolor, vómitos, insomnio, angustia), pero no suele ser mortal, y hay tratamiento médico que la hace manejable. Las abstinencias que sí pueden matar son las del alcohol y las benzodiacepinas.",s:"opioides"}
);

/* Preguntas agregadas el 15 de octubre de 2026. Cada una sale de un mito o una advertencia de la guía de sustancias. */
window.PREGUNTAS.push(
{q:"Si fumaste durante muchos años, dejar el tabaco ya no sirve de nada.",v:false,e:"Falso. A cualquier edad el cuerpo se recupera: el riesgo de infarto baja desde el primer año sin fumar, y el de cáncer de pulmón sigue bajando con los años.",s:"tabaco"},
{q:"Tener mucha 'resistencia' al alcohol es señal de que el cuerpo está protegido.",v:false,e:"Falso. Es tolerancia: el cuerpo ya se adaptó a la sustancia. Es un factor de riesgo de dependencia, no una ventaja.",s:"alcohol"},
{q:"Orinar muy seguido o con urgencia puede ser la primera señal del daño de la ketamina en la vejiga.",v:true,e:"Verdadero. Esa señal aparece antes que el dolor. Consultar y dejarla a tiempo permite recuperar la vejiga; si se sigue, el daño puede ser irreversible.",s:"ketamina"},
{q:"Mezclar opioides (tramadol, codeína) con pregabalina o gabapentina aumenta el riesgo de dejar de respirar.",v:true,e:"Verdadero. Las dos cosas bajan la respiración y juntas se potencian. Si alguien así no despierta o respira muy lento, 131.",s:"opioides"},
{q:"Alrededor de 1 de cada 10 personas que usan marihuana desarrolla dependencia.",v:true,e:"Verdadero. Y la proporción es mayor en quienes empezaron antes de los 18 o fuman todos los días. La abstinencia es real: irritabilidad, insomnio, sueños vívidos.",s:"marihuana"}
);

/* Preguntas agregadas el 16 de octubre de 2026. Salen de las secciones de emergencia y mezclas de la guía de sustancias. */
window.PREGUNTAS.push(
{q:"Una crisis de pánico por marihuana puede ser mortal.",v:false,e:"Falso. Es muy desagradable, pero no es mortal y pasa en 1 a 3 horas. Ayudan un lugar tranquilo, agua y compañía. Si hay convulsiones o pulso muy alto, puede ser un sintético: 131.",s:"marihuana"},
{q:"Existe un antídoto para las benzodiacepinas que cualquiera puede usar en casa.",v:false,e:"Falso. El antídoto (flumazenil) solo se usa en hospital. Si alguien no despierta o respira lento después de tomar pastillas, se llama al 131 y se dice qué tomó.",s:"benzodiacepinas"},
{q:"Tomar alcohol junto con MDMA ayuda a mantenerse hidratado.",v:false,e:"Falso. El alcohol deshidrata más y aumenta el calor del cuerpo, que es el riesgo principal del MDMA.",s:"mdma"},
{q:"En quien bebe mucho a diario, los primeros dos días sin beber son seguros: lo peligroso de la abstinencia de alcohol empieza después.",v:false,e:"Falso. Las convulsiones suelen aparecer en las primeras 48 horas, y el delirium tremens entre el segundo y el cuarto día. Por eso se deja con apoyo médico desde el primer día y no a solas.",s:"alcohol"},
{q:"Mezclar ketamina con alcohol aumenta el riesgo de ahogarse con el vómito.",v:true,e:"Verdadero. Los dos deprimen la respiración y la persona puede quedar sin responder. Si alguien así vomita, se la pone de lado y se llama al 131.",s:"ketamina"}
);

/* Preguntas agregadas el 17 de octubre de 2026. Salen de los mitos y los daños de la guía de sustancias. */
window.PREGUNTAS.push(
{q:"Fumar un cigarro calma la ansiedad de verdad.",v:false,e:"Falso. Calma la abstinencia de nicotina que dejó el cigarro anterior. Sin fumar, esa ansiedad baja mucho en las primeras semanas.",s:"tabaco"},
{q:"Mezclar pasta base con marihuana ('marciano') la hace más suave.",v:false,e:"Falso. Suma los daños de las dos sustancias y no reduce ninguno.",s:"pasta-base"},
{q:"La ketamina de la calle es segura porque es la misma que se usa en los hospitales.",v:false,e:"Falso. En el hospital se usa con monitoreo. En la calle no se sabe qué es ni cuánta, y el riesgo es caerse, ahogarse con el vómito o mezclarla con alcohol.",s:"ketamina"},
{q:"Si el clonazepam te lo recetó un médico, no puedes volverte dependiente.",v:false,e:"Falso. La dependencia aparece con el uso diario durante meses, con o sin receta. Si llevas mucho tiempo tomándolo, se baja de a poco con el médico, nunca de golpe.",s:"benzodiacepinas"},
{q:"Usar MDMA muy seguido puede dejar depresión y problemas de memoria, aunque no produzca una dependencia física fuerte.",v:true,e:"Verdadero. El uso frecuente agota la serotonina. Dejar espacios largos entre usos es la primera medida de reducción de daños; dejarlo del todo es lo que recupera el ánimo.",s:"mdma"}
);

/* Preguntas agregadas el 18 de octubre de 2026. Salen de los primeros auxilios y de los daños al corazón y al cuerpo de la guía. */
window.PREGUNTAS.push(
{q:"Si alguien convulsiona, hay que meterle algo en la boca para que no se muerda la lengua.",v:false,e:"Falso. Nunca se le pone nada en la boca ni se le sujeta: puede romperle los dientes o ahogarse. Se aleja lo que pueda golpearlo, se protege la cabeza y, cuando pasa, se pone de lado. Llamar al 131.",s:"general"},
{q:"Dormir 'la mona' hace que el alcohol salga más rápido de la sangre.",v:false,e:"Falso. El hígado elimina el alcohol a su propio ritmo, dormido o despierto. Y alguien muy borracho que duerme puede vomitar y ahogarse: de lado y con alguien que lo mire.",s:"alcohol"},
{q:"Las anfetaminas y la metanfetamina suben la temperatura del cuerpo, y bailar horas sin pausa aumenta el riesgo de golpe de calor.",v:true,e:"Verdadero. Los estimulantes suben la temperatura y tapan la señal de cansancio. Pausas, aire fresco y agua a sorbos. Piel muy caliente y confusión es emergencia: 131.",s:"anfetaminas"},
{q:"Manejar después de fumar marihuana es seguro porque relaja.",v:false,e:"Falso. El THC enlentece los reflejos y la atención, y aumenta el riesgo de chocar, sobre todo mezclado con alcohol. Relajado no es lo mismo que atento.",s:"marihuana"},
{q:"La cocaína puede provocar un infarto en una persona joven y sin problemas al corazón.",v:true,e:"Verdadero. Estrecha las arterias del corazón y sube el pulso y la presión de golpe, a cualquier edad. Dolor en el pecho después de consumir es para llamar al 131, no para esperar a que pase.",s:"cocaina"}
);

/* Preguntas agregadas el 19 de octubre de 2026. Salen de los mitos de la guía y de los datos de la biblioteca (vergüenza y recaída, daño en la nariz). */
window.PREGUNTAS.push(
{q:"Como el tusi es rosado y caro, viene de mejor calidad.",v:false,e:"Falso. El color es colorante y el precio no dice nada de lo que trae. Los análisis muestran ketamina, MDMA y cafeína, en proporciones que cambian de bolsa en bolsa.",s:"tusi"},
{q:"Mezclar anfetaminas con alcohol hace que la persona sienta menos la borrachera y termine bebiendo más.",v:true,e:"Verdadero. El estimulante tapa las señales del alcohol, así que se bebe más de lo que el cuerpo aguanta. Cuando el estimulante se pasa, toda esa borrachera aparece de golpe.",s:"anfetaminas"},
{q:"Las benzodiacepinas (clonazepam, alprazolam) tomadas todos los días durante meses pueden empeorar la depresión.",v:true,e:"Verdadero. Al principio apagan la angustia, pero con el uso prolongado la depresión se agrava, además de las lagunas de memoria y la dependencia. Si llevas meses tomándolas, se bajan de a poco con el médico.",s:"benzodiacepinas"},
{q:"Aspirar cocaína puede perforar el tabique de la nariz.",v:true,e:"Verdadero. Cada vez que se aspira, la cocaína corta el riego de sangre al tabique; con el tiempo el cartílago muere y se perfora. Sangrados seguidos, costras o un silbido al respirar son para consultar pronto.",s:"cocaina"},
{q:"Sentir vergüenza de uno mismo después de una recaída ayuda a no volver a consumir.",v:false,e:"Falso. La vergüenza ('soy malo') se asocia con más recaídas; la culpa ('hice algo malo') no. Lo que ayuda es mirar el hecho, ver qué se puede reparar y hablarlo con alguien de confianza o con el 1412.",s:"general"}
);

/* Preguntas agregadas el 20 de octubre de 2026. Salen de los datos con fuente de la biblioteca y de la guía de sustancias. */
window.PREGUNTAS.push(
{q:"La nicotina de un cigarro llega al cerebro en unos 10 segundos y su efecto dura solo minutos.",v:true,e:"Verdadero. Ese ciclo tan corto (subida rápida, bajada rápida) es lo que hace al tabaco tan difícil de dejar. No es falta de voluntad.",s:"tabaco"},
{q:"El Ritalín (metilfenidato) sin receta mejora las notas de cualquier persona que lo tome.",v:false,e:"Falso. Puede mantener despierto, pero no hay estudios que muestren mejores notas en quien no tiene TDAH. Y dormir poco perjudica justamente el aprendizaje y la concentración.",s:"anfetaminas"},
{q:"Mientras las benzodiacepinas hacen efecto, el cerebro guarda los recuerdos con normalidad.",v:false,e:"Falso. Bloquean la formación de recuerdos nuevos mientras actúan: por eso las lagunas. Con uso prolongado, la memoria y la concentración se deterioran de forma que se nota.",s:"benzodiacepinas"},
{q:"El fentanilo es menos potente que la morfina.",v:false,e:"Falso. Es entre 50 y 100 veces más potente. Por eso una pastilla o un polvo que lo traiga sin que la persona lo sepa puede detener la respiración. Si alguien no despierta o respira muy lento, 131.",s:"opioides"},
{q:"Al dejar una sustancia, el cuerpo suele mejorar antes que el ánimo.",v:true,e:"Verdadero. En las semanas siguientes el cuerpo se recupera, pero el desánimo y las ganas pueden seguir por semanas o meses. Es un momento de riesgo de recaída porque 'ya no se siente mejor'; saberlo ayuda a no rendirse ahí.",s:"general"}
);

/* Preguntas agregadas el 21 de octubre de 2026. Salen de las mezclas, los daños y los mitos de la guía de sustancias. */
window.PREGUNTAS.push(
{q:"Tomar una benzodiacepina o alcohol 'para bajar' la cocaína es una forma segura de terminar la noche.",v:false,e:"Falso. Tapa las señales de alarma del corazón y empuja a seguir consumiendo. Y si hay alcohol de por medio, la mezcla deprime la respiración. Lo que baja la cocaína es el tiempo, agua y dormir.",s:"cocaina"},
{q:"La metanfetamina deteriora los dientes y la piel.",v:true,e:"Verdadero. Seca la boca, aprieta la mandíbula y lleva a rascarse la piel; el deterioro físico se nota en semanas, más rápido que con cualquier otra droga común.",s:"anfetaminas"},
{q:"Con MDMA, si la persona dejó de sudar y tiene la piel muy caliente, es señal de que el cuerpo ya se enfrió.",v:false,e:"Falso. Es lo contrario: dejar de sudar con la piel muy caliente y confusión es golpe de calor, la emergencia principal del MDMA. Llamar al 131 y llevarla a un lugar fresco.",s:"mdma"},
{q:"Fumar marihuana mezclada con tabaco suma la adicción a la nicotina.",v:true,e:"Verdadero. La nicotina es de las sustancias más adictivas que existen, y mucha gente que 'solo fuma marihuana' termina dependiendo también del tabaco.",s:"marihuana"},
{q:"Si como bien antes de beber, el alcohol no llega a la sangre.",v:false,e:"Falso. Comer retrasa la subida, no la evita: todo lo que se toma llega igual a la sangre, solo más lento. Sirve para que no pegue de golpe, no para tomar más.",s:"alcohol"}
);

/* Preguntas agregadas el 22 de octubre de 2026. Salen de los daños, las emergencias y los mitos de la guía de sustancias. */
window.PREGUNTAS.push(
{q:"La pasta base daña los pulmones porque trae restos de solventes que queman las vías respiratorias.",v:true,e:"Verdadero. Es el residuo del proceso de la cocaína, con restos de queroseno y ácido. Tos con sangre o dificultad para respirar son para llamar al 131.",s:"pasta-base"},
{q:"El alcohol ayuda con la depresión y la ansiedad si se toma seguido.",v:false,e:"Falso. Alivia en el momento y las empeora a mediano plazo. Es un depresor: lo que calma esta noche vuelve más fuerte en los días siguientes.",s:"alcohol"},
{q:"La ketamina no produce dependencia porque es un anestésico.",v:false,e:"Falso. Produce dependencia psicológica fuerte, y con el uso frecuente daña la vejiga y la memoria. Que se use en hospitales no la vuelve inofensiva en la calle.",s:"ketamina"},
{q:"Fumar marihuana no daña los pulmones porque no es tabaco.",v:false,e:"Falso. El humo de marihuana trae muchos de los mismos irritantes que el del tabaco: tos y bronquitis crónica con el uso diario. Y mezclada con tabaco, suma la nicotina.",s:"marihuana"},
{q:"Si alguien se pone mal después de tomar tusi, hay que decirle al 131 que fue tusi, aunque no se sepa qué traía.",v:true,e:"Verdadero. Justamente porque no se sabe qué trae (suele ser ketamina, MDMA y cafeína), decirlo ayuda a que atiendan tanto el calor extremo del MDMA como el no responder de la ketamina.",s:"tusi"}
);

/* Preguntas agregadas el 23 de octubre de 2026. Salen de los efectos, las mezclas y los daños de la guía de sustancias. */
window.PREGUNTAS.push(
{q:"El efecto de la cocaína aspirada dura varias horas.",v:false,e:"Falso. Dura poco, 20 a 40 minutos, y después viene el bajón que empuja a repetir. Ese ciclo corto es parte de lo que engancha.",s:"cocaina"},
{q:"Mezclar anfetaminas o metanfetamina con antidepresivos IMAO puede provocar una crisis de presión arterial.",v:true,e:"Verdadero. Es una crisis hipertensiva. Dolor de cabeza muy fuerte o dolor en el pecho después de esa mezcla son para llamar al 131.",s:"anfetaminas"},
{q:"Las benzodiacepinas (clonazepam, alprazolam) aumentan el riesgo de caídas y accidentes.",v:true,e:"Verdadero. Producen torpeza y sueño, y por eso caídas y accidentes, también manejando. Con alcohol, el riesgo se multiplica.",s:"benzodiacepinas"},
{q:"Mezclar alcohol con paracetamol en dosis altas puede dañar el hígado.",v:true,e:"Verdadero. Los dos se procesan en el hígado y juntos lo sobrecargan. Quien bebe mucho debería consultar antes de tomar paracetamol seguido.",s:"alcohol"},
{q:"Mezclar marihuana con alcohol es más suave que cada una por separado.",v:false,e:"Falso. La mezcla suele traer mareo, vómitos y la 'pálida'. Y las dos juntas enlentecen más los reflejos: manejar así es más peligroso que con cualquiera de las dos.",s:"marihuana"}
);

/* Preguntas agregadas el 24 de octubre de 2026. Salen de las emergencias, la dependencia y el "dejar" de la guía de sustancias. */
window.PREGUNTAS.push(
{q:"Si una sustancia no produce abstinencia física, no puede generar dependencia.",v:false,e:"Falso. La dependencia también es psicológica: el patrón (fiesta = sustancia) y las ganas. Cocaína, ketamina y MDMA enganchan sin una abstinencia física fuerte, y la pasta base engancha en minutos.",s:"general"},
{q:"Con MDMA, un dolor de cabeza fuerte con vómitos después de tomar mucha agua es una emergencia.",v:true,e:"Verdadero. Puede ser el sodio bajo en la sangre (hiponatremia) por el exceso de agua, y puede matar. Llamar al 131 y decir qué tomó y cuánta agua bebió.",s:"mdma"},
{q:"Si estás dejando otra sustancia, es obligatorio dejar el tabaco al mismo tiempo.",v:false,e:"Falso. Muchas personas prefieren dejar primero la otra sustancia y después el tabaco, y es una decisión válida. Lo que conviene saber: en recuperación es común fumar más, y dejar el tabaco es seguro en cualquier momento, con parches o chicles si hace falta.",s:"tabaco"},
{q:"Después de dejar la pasta base, el cuerpo tarda años en mostrar mejoría.",v:false,e:"Falso. Lo peor es la primera semana, las ganas intensas duran 2 a 4 semanas y la mejora clara del cuerpo se nota entre el primer y el segundo mes. Salir del entorno un tiempo y el tratamiento gratuito de SENDA (1412) ayudan a llegar ahí.",s:"pasta-base"},
{q:"Para la dependencia fuerte a opioides existe tratamiento médico de sustitución que baja el riesgo de sobredosis.",v:true,e:"Verdadero. No es 'cambiar una droga por otra': es un tratamiento con control médico que saca a la persona del ciclo de abstinencia y sobredosis. Se consulta en el consultorio o por el 1412.",s:"opioides"}
);

/* Preguntas agregadas el 25 de octubre de 2026. Salen de los mitos, el "dejar" y las emergencias de la guía de sustancias, y de la biblioteca (aislamiento). */
window.PREGUNTAS.push(
{q:"Mientras más pura sea la cocaína, menos daña al corazón.",v:false,e:"Falso. La pureza no quita el riesgo: a más pura, más fuerte el golpe sobre la presión y el pulso. Lo que daña es la cocaína en la sangre, aspirada o fumada.",s:"cocaina"},
{q:"Dejar el alcohol es peligroso para cualquiera, incluso para quien bebe solo los fines de semana.",v:false,e:"Falso. El riesgo de convulsiones al dejar es de quien bebe mucho todos los días: esa persona lo deja con apoyo médico. Si el consumo es de fin de semana o moderado, se puede dejar sin riesgo físico.",s:"alcohol"},
{q:"Si la marihuana te ayuda a dormir, dejarla no cambia el sueño.",v:false,e:"Falso. Con el uso diario el sueño pasa a depender de ella: al dejarla vuelven el insomnio y los sueños muy vívidos por un tiempo. El sueño normal regresa solo, en 2 a 4 semanas.",s:"marihuana"},
{q:"Ante una sobredosis de opioides, mientras llega la ayuda conviene mantener a la persona despierta y respirando.",v:true,e:"Verdadero. Lo que mata es que se deje de respirar. Llamar al 131, usar naloxona si hay, y hablarle y moverla para mantenerla despierta hasta que llegue la ayuda. Si no responde, ponerla de lado.",s:"opioides"},
{q:"Aislarse de todos es la mejor forma de evitar la tentación de consumir.",v:false,e:"Falso. La soledad y el aburrimiento alimentan la adicción. Alejarse de quienes consumen sí ayuda; alejarse de todos no. Conectar con alguien de confianza, un grupo o el 1412 es parte de la recuperación, no un paso para después.",s:"general"}
);

/* Preguntas agregadas el 26 de octubre de 2026. Salen de las mezclas, las emergencias y el "dejar" de la guía de sustancias. */
window.PREGUNTAS.push(
{q:"La cocaína quita la borrachera y permite manejar seguro.",v:false,e:"Falso. Tapa el sueño y la torpeza, pero el alcohol en la sangre y los reflejos lentos siguen igual: manejar así es tan peligroso como borracho. Y juntos forman cocaetileno, más tóxico para el corazón.",s:"cocaina"},
{q:"La codeína de los jarabes para la tos es un opioide.",v:true,e:"Verdadero. El cuerpo la convierte en morfina. Con alcohol o benzodiacepinas deprime la respiración, y tomada seguido produce dependencia, igual que el tramadol.",s:"opioides"},
{q:"Alguien muy borracho que respira muy lento o tiene los labios azulados solo necesita dormir.",v:false,e:"Falso. Respirar menos de 8 veces por minuto o tener los labios azulados es una intoxicación grave: llamar al 131, ponerla de lado y no dejarla sola. Así es como la gente se ahoga 'durmiendo la mona'.",s:"alcohol"},
{q:"Los parches y chicles de nicotina son tan dañinos como fumar.",v:false,e:"Falso. Entregan nicotina sin el humo, que es lo que más daña. Se compran sin receta y aumentan en alrededor de la mitad las probabilidades de dejar el tabaco.",s:"tabaco"}
);
