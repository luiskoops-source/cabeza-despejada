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
{q:"Los parches o chicles de nicotina duplican la probabilidad de dejar el tabaco.",v:true,e:"Verdadero. Se compran sin receta y son de las ayudas más estudiadas.",s:"tabaco"},
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
{q:"El Ritalín sin receta para estudiar es inofensivo.",v:false,e:"Falso. Es una anfetamina. Trae insomnio, ansiedad y dependencia, y lo que se memoriza sin dormir se olvida rápido.",s:"anfetaminas"},
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
