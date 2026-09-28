/* PLEX PLAY 2.3 — Banco de ejercicios de Francés A1 (se suma a las lecciones en los juegos y los repasos)
   Mismo formato que los ítems de las lecciones. Escenarios: café, panadería, mercado, estación, metro, farmacia,
   universidad, biblioteca, familia de acogida, piso compartido, tienda, cine, médico, hotel, supermercado. */
(function(){
  var C = function(ask, ctx, q, o, a, why){ return { k: "choice", ask: ask, ctx: ctx, q: q, o: o, a: a, why: why }; };
  var F = function(ask, ctx, q, acc, why){ return { k: "fill", ask: ask, ctx: ctx, q: q, acc: acc, why: why }; };
  var O = function(ask, tokens, why){ return { k: "order", ask: ask, tokens: tokens, why: why }; };
  var M = function(q, pairs, why){ return { k: "match", ask: "Une cada elemento con su pareja.", q: q, pairs: pairs, why: why }; };
  var S = function(q, cats, items, why){ return { k: "sort", ask: "Clasifica cada elemento.", q: q, cats: cats, items: items, why: why }; };
  var P = function(ctx, s, fix, why){ return { k: "spot", ask: "Encuentra la palabra incorrecta y corrígela.", ctx: ctx, s: s, fix: fix, why: why }; };
  var B = {};

  B["a1-saluer"] = [
    C("Elige el saludo adecuado.", "Entras a la secretaría de la universidad a las 9 de la mañana.", "___, Madame. Je voudrais une information.", ["Bonjour", "Salut", "Bonne nuit"], 0, "Con una persona que no conoces y de día: <b>Bonjour, Madame</b>. <i>Salut</i> es para amigos."),
    C("Elige la respuesta correcta.", "Tu nuevo compañero de piso te pregunta cómo estás.", "— Ça va ? — ___", ["Oui, ça va bien, merci !", "Je m'appelle Paul.", "Au revoir !"], 0, "A <i>Ça va ?</i> se responde <b>Ça va bien, merci</b> (o <i>Pas mal</i>)."),
    C("Elige la forma de être.", "Te presentas en la primera clase.", "Nous ___ étudiants en Lenguas Extranjeras.", ["sommes", "sont", "êtes"], 0, "Con <i>nous</i>: <b>nous sommes</b>."),
    C("Elige la forma de être.", "Hablas de tus profesores.", "Ils ___ très sympathiques.", ["sont", "est", "sommes"], 0, "Con <i>ils</i>: <b>ils sont</b>."),
    C("Elige: ¿tu o vous?", "Hablas con el rector de la universidad.", "Comment ___ appelez-vous, Monsieur ?", ["vous", "tu", "te"], 0, "Con el rector se usa el trato formal: <b>Comment vous appelez-vous ?</b>"),
    C("Elige la nacionalidad correcta.", "Presentas a tu amiga de Bogotá.", "Elle s'appelle Valentina. Elle est ___.", ["colombienne", "colombien", "colombiens"], 0, "Femenino singular: <b>colombienne</b> (con doble n)."),
    C("Elige la nacionalidad correcta.", "Un estudiante de Lyon se presenta.", "Je m'appelle Hugo. Je suis ___.", ["français", "française", "France"], 0, "Hugo es hombre: <b>français</b>. <i>France</i> es el país."),
    C("Elige la despedida correcta.", "Terminas una llamada con tu amiga; la verás el viernes.", "Bon, ___ vendredi !", ["à", "au", "en"], 0, "Para citar un día: <b>à vendredi</b> (hasta el viernes)."),
    F("Escribe el verbo être conjugado.", "Presentas a tu compañero en clase.", "Lui, c'est Andrés. Il ___ de Cúcuta. (être)", ["est"], "Con <i>il</i>: <b>il est</b>."),
    F("Escribe el verbo être conjugado.", "Hablas con dos turistas en la plaza.", "Vous ___ espagnols ? (être)", ["êtes"], "Con <i>vous</i>: <b>vous êtes</b>."),
    F("Escribe el verbo s'appeler.", "Preguntas el nombre a una niña.", "Tu t'___ comment ? (appeler)", ["appelles"], "<i>Tu t'appelles</i>: con <i>tu</i> se dobla la <b>l</b> y termina en <b>-es</b>."),
    F("Escribe el pronombre tónico.", "Te preguntan de dónde eres y devuelves la pregunta.", "Je suis de Pamplona. Et ___ ? (tú)", ["toi"], "«¿Y tú?» = <b>Et toi ?</b>"),
    O("Ordena la presentación.", ["Bonjour,", "je", "m'appelle", "Sara", "et", "je suis", "colombienne."], "<b>Bonjour, je m'appelle Sara et je suis colombienne.</b>"),
    O("Ordena la pregunta formal.", ["Comment", "allez-", "vous,", "Madame ?"], "<b>Comment allez-vous, Madame ?</b> es la forma cortés de «¿cómo está?»."),
    M("Informal → formal", [["Salut !", "Bonjour, Madame."], ["Ça va ?", "Comment allez-vous ?"], ["Tu t'appelles comment ?", "Comment vous appelez-vous ?"], ["Et toi ?", "Et vous ?"]], "Con amigos se tutea; con desconocidos y profesores se usa <i>vous</i>."),
    S("¿Se usa con amigos o en situación formal?", ["Con amigos", "Formal"], [["Salut !", 0], ["Ça va ?", 0], ["Bonjour, Monsieur.", 1], ["Comment allez-vous ?", 1], ["À plus !", 0], ["Enchanté de vous connaître.", 1]], "<i>Salut, Ça va, À plus</i> son informales; con <i>vous</i> y <i>Monsieur/Madame</i>, formal."),
    P("Te presentas en la residencia universitaria.", "Je [es] étudiante en médecine.", "suis", "Con <i>je</i>: <b>je suis</b>. <i>Es</i> va con <i>tu</i>."),
    P("Presentas a tus amigos.", "Ils [est] brésiliens.", "sont", "Con <i>ils</i>: <b>ils sont</b>.")
  ];

  B["a1-nombres-age"] = [
    C("Elige el número.", "En la panadería te dicen el precio.", "Ça fait ___ euros. (15)", ["quinze", "cinquante", "cinq"], 0, "15 = <b>quinze</b>; 50 = <i>cinquante</i>."),
    C("Elige el número.", "Das tu edad en una entrevista.", "J'ai ___ ans. (22)", ["vingt-deux", "douze", "deux-vingt"], 0, "22 = <b>vingt-deux</b>."),
    C("Elige el número.", "Buscas el salón 70 en el edificio de idiomas.", "La salle ___, s'il vous plaît ? (70)", ["soixante-dix", "septante", "sept-dix"], 0, "En Francia 70 = <b>soixante-dix</b> (60 + 10). <i>Septante</i> se usa en Bélgica y Suiza."),
    C("Elige el número.", "Te dictan un número de teléfono.", "Zéro six, ___, douze… (80)", ["quatre-vingts", "huitante", "quatre-vingt-dix"], 0, "80 = <b>quatre-vingts</b> (4 × 20). 90 = <i>quatre-vingt-dix</i>."),
    C("Elige el número.", "Pagas en el cine.", "Le billet coûte ___ euros. (11)", ["onze", "un-dix", "douze"], 0, "11 = <b>onze</b>."),
    C("Elige la pregunta correcta.", "Quieres saber la edad de tu nuevo amigo.", "Tu as ___ ?", ["quel âge", "combien âge", "quelle âge"], 0, "La edad se pregunta con <b>Tu as quel âge ?</b> (<i>âge</i> es masculino)."),
    C("Elige el verbo.", "Hablas de tu abuela.", "Ma grand-mère ___ quatre-vingt-un ans.", ["a", "est", "fait"], 0, "La edad va con <b>avoir</b>: <i>elle a 81 ans</i>."),
    C("Elige cómo se deletrea.", "Deletreas tu apellido: GIL.", "G – I – L se dice…", ["[ʒe] – [i] – [ɛl]", "[ge] – [i] – [el]", "[ʒi] – [aj] – [ɛl]"], 0, "En francés <b>G</b> suena [ʒe] («ye»), <b>I</b> [i] y <b>L</b> [ɛl]."),
    F("Escribe el número en letras.", "Tu hermano menor cumple años.", "Mon petit frère a ___ ans. (13)", ["treize"], "13 = <b>treize</b>."),
    F("Escribe el número en letras.", "El tren sale del andén 21.", "Le train part du quai ___. (21)", ["vingt et un", "vingt-et-un"], "21 = <b>vingt et un</b> (con <i>et</i>)."),
    F("Escribe el verbo avoir.", "Presentas a tus padres.", "Mes parents ___ cinquante ans. (avoir)", ["ont"], "Con <i>ils</i>: <b>ils ont</b>."),
    F("Escribe el verbo avoir.", "Le preguntas a tu profesora.", "Vous ___ des enfants, Madame ? (avoir)", ["avez"], "Con <i>vous</i>: <b>vous avez</b>."),
    O("Ordena la frase.", ["J'ai", "dix-neuf", "ans", "et", "ma sœur", "a", "seize ans."], "<b>J'ai dix-neuf ans et ma sœur a seize ans.</b>"),
    O("Ordena el número de teléfono.", ["Mon numéro,", "c'est", "le zéro six,", "quarante,", "vingt-deux."], "En Francia los números de teléfono se dicen de dos en dos."),
    M("Número → palabra", [["30", "trente"], ["40", "quarante"], ["60", "soixante"], ["100", "cent"]], "Las decenas: <i>trente, quarante, cinquante, soixante</i>… y <b>cent</b>."),
    S("¿Menor o mayor que veinte?", ["Menos de 20", "20 o más"], [["seize", 0], ["dix-huit", 0], ["quatorze", 0], ["vingt-cinq", 1], ["trente", 1], ["soixante", 1]], "16, 18 y 14 son menores que 20; 25, 30 y 60, mayores."),
    P("Hablas de tu edad con una amiga francesa.", "Je [suis] vingt ans.", "ai", "La edad en francés va con <i>avoir</i>: <b>J'ai vingt ans</b>."),
    P("Te preguntan cuántos hermanos tienes.", "J'ai [deux] frère.", "un", "<i>Frère</i> está en singular: <b>un frère</b> (o <i>deux frères</i>).")
  ];

  B["a1-articles"] = [
    C("Elige el artículo.", "En el mercado pides fruta.", "Je voudrais ___ pomme, s'il vous plaît.", ["une", "un", "des"], 0, "<i>Pomme</i> es femenino: <b>une pomme</b>."),
    C("Elige el artículo.", "Buscas algo en la mochila.", "J'ai ___ livre de français.", ["un", "une", "la"], 0, "<i>Livre</i> es masculino: <b>un livre</b>."),
    C("Elige el artículo.", "Hablas de la ciudad.", "___ université est grande.", ["L'", "La", "Le"], 0, "Ante vocal, <i>le/la</i> se vuelven <b>l'</b>: <i>l'université</i>."),
    C("Elige el artículo.", "Describes tu clase.", "Il y a ___ étudiants dans la salle.", ["des", "les", "un"], 0, "«Unos/algunos» en plural: <b>des</b> étudiants."),
    C("Elige el artículo.", "En la cafetería.", "___ café est très bon ici.", ["Le", "La", "Les"], 0, "<i>Café</i> es masculino: <b>le café</b>."),
    C("Elige el artículo.", "En la biblioteca pides algo.", "Où sont ___ dictionnaires ?", ["les", "des", "le"], 0, "Plural definido (los diccionarios concretos de la biblioteca): <b>les</b>."),
    C("Elige el artículo.", "Hablas de tus clases.", "J'adore ___ musique française.", ["la", "le", "une"], 0, "<i>Musique</i> es femenino; con <i>adorer</i> se usa el artículo definido: <b>la musique</b>."),
    C("Elige el género.", "Aprendes palabras nuevas.", "«La mer» (el mar) en francés es…", ["femenino", "masculino", "neutro"], 0, "¡Ojo! <b>la mer</b> es femenino, aunque en español «el mar» es masculino."),
    F("Escribe el artículo indefinido.", "Pides en la papelería.", "Je voudrais ___ stylo bleu. (indefinido)", ["un"], "<i>Stylo</i> es masculino: <b>un stylo</b>."),
    F("Escribe el artículo definido.", "Buscas un lugar en la ciudad.", "Où est ___ gare, s'il vous plaît ? (definido)", ["la"], "<i>Gare</i> es femenino: <b>la gare</b>."),
    F("Escribe el artículo definido.", "Hablas de un hotel.", "___ hôtel est près de la plage. (definido)", ["L'"], "<i>Hôtel</i> empieza por h muda: <b>l'hôtel</b>."),
    F("Escribe el artículo indefinido.", "Describes tu cuarto.", "Dans ma chambre, il y a ___ fenêtre. (indefinido)", ["une"], "<i>Fenêtre</i> es femenino: <b>une fenêtre</b>."),
    O("Ordena la frase.", ["Il y a", "une", "banque", "et", "un", "café", "dans la rue."], "<b>Il y a une banque et un café dans la rue.</b>"),
    O("Ordena la frase.", ["J'aime", "le", "cinéma", "et", "la", "danse."], "Con los gustos se usa el artículo definido: <b>le cinéma, la danse</b>."),
    M("Palabra → artículo", [["table", "la"], ["arbre", "l'"], ["sac", "le"], ["chaises", "les"]], "Femenino <i>la</i>, masculino <i>le</i>, ante vocal <i>l'</i>, plural <i>les</i>."),
    S("¿Masculino o femenino?", ["Masculino", "Femenino"], [["le téléphone", 0], ["la voiture", 1], ["le fromage", 0], ["la maison", 1], ["le lit", 0], ["la clé", 1]], "El artículo te dice el género: <i>le</i> masculino, <i>la</i> femenino."),
    P("Describes tu mochila.", "J'ai [une] cahier et deux stylos.", "un", "<i>Cahier</i> es masculino: <b>un cahier</b>."),
    P("Hablas de tus amigos.", "[Le] amis de Pablo sont gentils.", "Les", "Plural: <b>les amis</b>.")
  ];

  B["a1-verbes-er"] = [
    C("Elige la forma correcta.", "Hablas de tus estudios.", "J'___ le français et l'anglais.", ["étudie", "étudies", "étudient"], 0, "Con <i>je</i>, los verbos en -er terminan en <b>-e</b>: <i>j'étudie</i>."),
    C("Elige la forma correcta.", "Preguntas a tus amigos.", "Vous ___ où ?", ["habitez", "habitons", "habitent"], 0, "Con <i>vous</i>: <b>-ez</b> → <i>vous habitez</i>."),
    C("Elige la forma correcta.", "Describes a tus compañeros.", "Ils ___ beaucoup en classe.", ["parlent", "parle", "parlons"], 0, "Con <i>ils</i>: <b>-ent</b> (que no se pronuncia): <i>ils parlent</i>."),
    C("Elige la forma correcta.", "Hablas de ti y de tu hermano.", "Nous ___ au foot le samedi.", ["jouons", "jouez", "jouent"], 0, "Con <i>nous</i>: <b>-ons</b> → <i>nous jouons</i>."),
    C("Elige la negación correcta.", "No te gusta el café.", "Je ___ le café.", ["n'aime pas", "ne aime pas", "aime pas ne"], 0, "Ante vocal, <i>ne</i> → <b>n'</b>: <i>je n'aime pas</i>."),
    C("Elige la negación correcta.", "Tu amiga no vive en Bogotá.", "Elle ___ à Bogotá.", ["n'habite pas", "habite ne pas", "ne pas habite"], 0, "La negación rodea al verbo: <b>ne/n' + verbo + pas</b>."),
    C("Elige la forma correcta.", "Una amiga te pregunta.", "Tu ___ la radio le matin ?", ["écoutes", "écoute", "écoutez"], 0, "Con <i>tu</i>: <b>-es</b> → <i>tu écoutes</i>."),
    C("Elige la forma correcta de manger.", "Con tu familia de acogida.", "Nous ___ à vingt heures.", ["mangeons", "mangons", "mangez"], 0, "<i>Manger</i> con <i>nous</i> conserva la e: <b>nous mangeons</b>."),
    F("Escribe el verbo en presente.", "Tu compañera de piso cocina.", "Elle ___ des pâtes. (préparer)", ["prépare"], "Con <i>elle</i>: <b>-e</b> → <i>elle prépare</i>."),
    F("Escribe el verbo en presente.", "Hablas de tus padres.", "Mes parents ___ dans une banque. (travailler)", ["travaillent"], "Con <i>ils</i>: <b>-ent</b> → <i>ils travaillent</i>."),
    F("Escribe el verbo en presente.", "Preguntas a un profesor.", "Vous ___ le train ou le bus ? (préférer)", ["préférez"], "Con <i>vous</i>: <b>vous préférez</b>."),
    F("Escribe la segunda parte de la negación.", "No hablas alemán.", "Je ne parle ___ allemand. (negación)", ["pas"], "La negación es <b>ne … pas</b>: <i>je ne parle pas allemand</i>."),
    O("Ordena la frase negativa.", ["Nous", "ne", "regardons", "pas", "la télé."], "<b>Nous ne regardons pas la télé.</b> <i>Ne</i> antes del verbo, <i>pas</i> después."),
    O("Ordena la pregunta.", ["Tu", "aimes", "danser", "le samedi ?"], "<b>Tu aimes danser le samedi ?</b> Con entonación sube al final."),
    M("Sujeto → forma de parler", [["je", "parle"], ["tu", "parles"], ["nous", "parlons"], ["vous", "parlez"]], "Terminaciones: -e, -es, -e, -ons, -ez, -ent."),
    S("¿Afirmativa o negativa?", ["Afirmativa", "Negativa"], [["J'aime le sport.", 0], ["Il ne travaille pas.", 1], ["Nous chantons.", 0], ["Tu n'écoutes pas !", 1], ["Elles dansent.", 0], ["Je ne fume pas.", 1]], "La negación siempre lleva <i>ne/n' … pas</i>."),
    P("Hablas de tus clases.", "Nous [étudiez] à l'université.", "étudions", "Con <i>nous</i>: <b>étudions</b>."),
    P("Dices que no te gusta el rap.", "Je [aime] pas le rap.", "n'aime", "Falta <i>ne</i>: <b>Je n'aime pas le rap.</b>")
  ];

  B["a1-irreguliers"] = [
    C("Elige la forma de aller.", "Sales de casa.", "Je ___ à l'université en bus.", ["vais", "va", "vas"], 0, "<i>Aller</i> con <i>je</i>: <b>je vais</b>."),
    C("Elige la forma de aller.", "Preguntas a tus amigos por el fin de semana.", "Vous ___ au cinéma samedi ?", ["allez", "allons", "vont"], 0, "Con <i>vous</i>: <b>vous allez</b>."),
    C("Elige la forma de faire.", "Hablas de tus pasatiempos.", "Je ___ du yoga le mardi.", ["fais", "fait", "faites"], 0, "<i>Faire</i> con <i>je</i>: <b>je fais</b>."),
    C("Elige la forma de faire.", "Hablas de tus hermanos.", "Mes frères ___ du vélo.", ["font", "faisent", "fait"], 0, "Irregular: <b>ils font</b>."),
    C("Elige la forma de avoir.", "En la farmacia.", "J'___ mal à la tête.", ["ai", "a", "as"], 0, "Con <i>je</i>: <b>j'ai</b>. <i>Avoir mal à</i> = doler."),
    C("Elige la forma de être.", "Describes el clima de tu ciudad.", "Nous ___ en juin et il fait chaud.", ["sommes", "avons", "allons"], 0, "«Estamos en junio» = <b>nous sommes en juin</b>."),
    C("Elige el verbo correcto.", "Tienes hambre.", "J'___ faim !", ["ai", "suis", "fais"], 0, "El hambre va con <b>avoir</b>: <i>j'ai faim</i> (tengo hambre)."),
    C("Elige el verbo correcto.", "Hablas del tiempo.", "Aujourd'hui, il ___ beau.", ["fait", "est", "a"], 0, "El tiempo atmosférico va con <b>faire</b>: <i>il fait beau</i>."),
    F("Escribe el verbo aller.", "Planeas las vacaciones.", "Cet été, nous ___ à la mer. (aller)", ["allons"], "Con <i>nous</i>: <b>nous allons</b>."),
    F("Escribe el verbo faire.", "Preguntas a tu profesora.", "Qu'est-ce que vous ___ ce week-end ? (faire)", ["faites"], "Irregular: <b>vous faites</b> (nunca «faisez»)."),
    F("Escribe el verbo avoir.", "Hablas de tu gato.", "Mon chat ___ trois ans. (avoir)", ["a"], "Con <i>il</i>: <b>il a</b>."),
    F("Escribe el verbo être.", "Estás cansada.", "Je ___ fatiguée aujourd'hui. (être)", ["suis"], "Con <i>je</i>: <b>je suis</b>."),
    O("Ordena la frase.", ["Le samedi,", "nous", "faisons", "les courses", "au marché."], "<b>Le samedi, nous faisons les courses au marché.</b>"),
    O("Ordena la frase.", ["Ils", "vont", "à la plage", "en voiture."], "<b>Ils vont à la plage en voiture.</b>"),
    M("Sujeto → aller", [["je", "vais"], ["tu", "vas"], ["il", "va"], ["ils", "vont"]], "<i>Aller</i> es irregular: vais, vas, va, allons, allez, vont."),
    S("¿Con qué verbo va?", ["avoir", "faire"], [["faim", 0], ["du sport", 1], ["froid", 0], ["la cuisine", 1], ["vingt ans", 0], ["les courses", 1]], "<i>Avoir</i> faim, froid, 20 ans; <i>faire</i> du sport, la cuisine, les courses."),
    P("Hablas con tus amigos.", "Vous [faisez] quoi ce soir ?", "faites", "<i>Faire</i> con <i>vous</i>: <b>faites</b>."),
    P("Explicas adónde vas.", "Je [vas] à la bibliothèque.", "vais", "<i>Aller</i> con <i>je</i>: <b>vais</b>.")
  ];

  B["a1-questions"] = [
    C("Elige la palabra interrogativa.", "Buscas el baño en un café.", "___ sont les toilettes, s'il vous plaît ?", ["Où", "Quand", "Qui"], 0, "Lugar → <b>où</b> (dónde)."),
    C("Elige la palabra interrogativa.", "Quieres saber el precio.", "C'est ___ ?", ["combien", "comment", "pourquoi"], 0, "Precio → <b>combien</b> (cuánto)."),
    C("Elige la palabra interrogativa.", "Preguntas por la hora del concierto.", "Le concert commence ___ ?", ["quand", "où", "qui"], 0, "Tiempo → <b>quand</b> (cuándo)."),
    C("Elige la palabra interrogativa.", "Tu amiga parece triste.", "___ tu es triste ?", ["Pourquoi", "Comment", "Combien"], 0, "Causa → <b>pourquoi</b> (por qué)."),
    C("Elige quel / quelle.", "Preguntas la hora.", "___ heure est-il ?", ["Quelle", "Quel", "Quels"], 0, "<i>Heure</i> es femenino: <b>quelle heure</b>."),
    C("Elige quel / quelle.", "Preguntas el día.", "On est ___ jour aujourd'hui ?", ["quel", "quelle", "quelles"], 0, "<i>Jour</i> es masculino: <b>quel jour</b>."),
    C("Elige la pregunta con est-ce que.", "Invitas a un amigo.", "___ tu veux venir ?", ["Est-ce que", "Qu'est-ce que", "Est-ce qui"], 0, "Pregunta de sí/no: <b>Est-ce que tu veux venir ?</b>"),
    C("Elige la pregunta correcta.", "Quieres saber qué hace tu compañero.", "___ tu fais ?", ["Qu'est-ce que", "Est-ce que", "Où"], 0, "«¿Qué haces?» = <b>Qu'est-ce que tu fais ?</b>"),
    F("Escribe la palabra interrogativa.", "Preguntas cómo se escribe un nombre.", "___ ça s'écrit ? (cómo)", ["Comment"], "«Cómo» = <b>comment</b>."),
    F("Escribe la palabra interrogativa.", "Ves a una persona en la foto.", "___ est-ce ? (quién)", ["Qui"], "«¿Quién es?» = <b>Qui est-ce ?</b>"),
    F("Escribe quel / quelle.", "Preguntas la nacionalidad.", "Tu es de ___ nationalité ? (cuál)", ["quelle"], "<i>Nationalité</i> es femenino: <b>quelle</b>."),
    F("Escribe la palabra interrogativa.", "Preguntas cuántos hermanos tiene.", "Tu as ___ de frères ? (cuántos)", ["combien"], "«¿Cuántos…?» = <b>combien de</b> + nombre."),
    O("Ordena la pregunta.", ["Où", "est-ce que", "tu", "habites ?"], "<b>Où est-ce que tu habites ?</b>"),
    O("Ordena la pregunta formal.", ["Quelle", "est", "votre", "adresse ?"], "<b>Quelle est votre adresse ?</b>"),
    M("Pregunta → respuesta", [["Où tu habites ?", "À Pamplona."], ["Tu as quel âge ?", "Vingt ans."], ["Comment tu vas ?", "Très bien !"], ["Qui est-ce ?", "C'est ma sœur."]], "Cada palabra interrogativa pide un tipo de información."),
    S("¿La pregunta es de sí/no o pide información?", ["Sí / no", "Información"], [["Est-ce que tu aimes le sport ?", 0], ["Où est la gare ?", 1], ["Tu parles anglais ?", 0], ["Pourquoi tu pleures ?", 1], ["Vous êtes française ?", 0], ["Combien ça coûte ?", 1]], "<i>Est-ce que</i> y la entonación: sí/no; <i>où, pourquoi, combien</i>: información."),
    P("Preguntas la hora a un señor.", "[Quel] heure est-il, s'il vous plaît ?", "Quelle", "<i>Heure</i> es femenino: <b>Quelle heure est-il ?</b>"),
    P("Te perdiste en la ciudad.", "[Quand] est la gare, s'il vous plaît ?", "Où", "Para preguntar por un lugar: <b>Où est la gare ?</b>")
  ];

  B["a1-ville"] = [
    C("Elige la contracción.", "Explicas cómo llegar.", "Je vais ___ supermarché.", ["au", "à le", "à la"], 0, "<i>À + le</i> = <b>au</b>."),
    C("Elige la contracción.", "Hablas de tu barrio.", "La banque est en face ___ musée.", ["du", "de le", "de la"], 0, "<i>De + le</i> = <b>du</b>."),
    C("Elige la preposición.", "Estás en el metro con un amigo.", "On descend ___ station Opéra.", ["à la", "au", "aux"], 0, "<i>Station</i> es femenino: <b>à la station</b>."),
    C("Elige la preposición.", "Buscas la farmacia.", "La pharmacie est ___ de la poste.", ["à côté", "à droite", "en face"], 0, "«Al lado de» = <b>à côté de</b>."),
    C("Elige la indicación.", "Un turista pregunta por el museo.", "Allez tout droit, puis tournez ___ gauche.", ["à", "au", "de"], 0, "«A la izquierda» = <b>à gauche</b>."),
    C("Elige el lugar.", "Quieres comprar pan.", "Pour acheter du pain, je vais à la ___.", ["boulangerie", "bibliothèque", "pharmacie"], 0, "El pan se compra en la <b>boulangerie</b>."),
    C("Elige el lugar.", "Necesitas enviar una carta.", "Je vais ___ poste.", ["à la", "au", "à l'"], 0, "<i>Poste</i> es femenino: <b>à la poste</b>."),
    C("Elige la contracción.", "Vas con tus amigos.", "Nous allons ___ États-Unis en juillet.", ["aux", "au", "à les"], 0, "<i>À + les</i> = <b>aux</b>."),
    F("Escribe la contracción.", "Das una dirección.", "L'hôtel est près ___ gare. (de + la)", ["de la"], "<i>De + la</i> no se contrae: <b>de la gare</b>."),
    F("Escribe la contracción.", "Vas a clase.", "Je vais ___ cours de français. (à + le)", ["au"], "<i>À + le</i> = <b>au</b>."),
    F("Escribe la contracción.", "Explicas dónde está el café.", "Le café est à côté ___ hôpital. (de + l')", ["de l'"], "Ante vocal: <b>de l'hôpital</b>."),
    F("Escribe la preposición.", "Tu libro está dentro de la mochila.", "Le livre est ___ le sac. (dentro)", ["dans"], "«Dentro de» = <b>dans</b>."),
    O("Ordena la indicación.", ["Prenez", "la deuxième", "rue", "à droite."], "<b>Prenez la deuxième rue à droite.</b>"),
    O("Ordena la pregunta.", ["Pardon,", "où est", "la station", "de métro ?"], "<b>Pardon, où est la station de métro ?</b>"),
    M("Lugar → para qué", [["la boulangerie", "comprar pan"], ["la pharmacie", "comprar medicinas"], ["la gare", "tomar el tren"], ["la bibliothèque", "leer y estudiar"]], "Lugares básicos de la ciudad."),
    S("¿Con au, à la o à l'?", ["au", "à la / à l'"], [["cinéma", 0], ["piscine", 1], ["parc", 0], ["école", 1], ["marché", 0], ["hôpital", 1]], "Masculino con consonante: <i>au</i>; femenino: <i>à la</i>; ante vocal: <i>à l'</i>."),
    P("Explicas adónde vas.", "Je vais [à] cinéma ce soir.", "au", "<i>À + le cinéma</i> se contrae: <b>au cinéma</b>."),
    P("Das una indicación.", "C'est à côté [de] parc.", "du", "<i>De + le parc</i> = <b>du parc</b>.")
  ];

  B["a1-gouts-heure"] = [
    C("Elige la hora.", "Tu clase empieza a las 8:30.", "Le cours commence à huit heures et ___.", ["demie", "quart", "trente et un"], 0, "Y media = <b>et demie</b>."),
    C("Elige la hora.", "Son las 10:15.", "Il est dix heures et ___.", ["quart", "demie", "moins le quart"], 0, "Y cuarto = <b>et quart</b>."),
    C("Elige la hora.", "Son las 6:45.", "Il est sept heures ___.", ["moins le quart", "et quart", "et demie"], 0, "Menos cuarto = <b>moins le quart</b>: 6:45 = <i>sept heures moins le quart</i>."),
    C("Elige el artículo.", "Hablas de tus gustos.", "J'adore ___ chocolat.", ["le", "du", "un"], 0, "Con <i>adorer/aimer/détester</i> se usa el definido: <b>le chocolat</b>."),
    C("Elige el verbo.", "Odias levantarte temprano.", "Je ___ me lever tôt.", ["déteste", "adore", "préfère"], 0, "«Odio» = <b>je déteste</b>."),
    C("Elige el día.", "Hoy es lunes; mañana es…", "Demain, c'est ___.", ["mardi", "mercredi", "dimanche"], 0, "lundi → <b>mardi</b> → mercredi…"),
    C("Elige la expresión.", "Vas al gimnasio todos los sábados.", "Je vais à la salle de sport ___.", ["le samedi", "au samedi", "en samedi"], 0, "Costumbre semanal: <b>le samedi</b> (los sábados)."),
    C("Elige la respuesta.", "— Tu aimes le cinéma ? — ¡Muchísimo!", "Oui, j'aime ___ !", ["beaucoup", "très", "pas du tout"], 0, "«Mucho» con verbo = <b>beaucoup</b>: <i>j'aime beaucoup</i>."),
    F("Escribe el artículo.", "Hablas de tu deporte favorito.", "Je préfère ___ natation. (definido)", ["la"], "<i>Natation</i> es femenino: <b>la natation</b>."),
    F("Escribe la hora en letras.", "El tren sale a las 12:00 del día.", "Le train part à ___. (12:00, mediodía)", ["midi"], "12:00 del día = <b>midi</b>; 00:00 = <i>minuit</i>."),
    F("Escribe el día.", "El fin de semana tiene sábado y…", "Le week-end, c'est samedi et ___. (domingo)", ["dimanche"], "Domingo = <b>dimanche</b>."),
    F("Escribe el verbo aimer.", "Hablas de tu mejor amigo.", "Il ___ les jeux vidéo. (aimer)", ["aime"], "Con <i>il</i>: <b>aime</b>."),
    O("Ordena la frase.", ["Le mercredi,", "j'ai", "cours", "à neuf heures."], "<b>Le mercredi, j'ai cours à neuf heures.</b>"),
    O("Ordena la frase.", ["Je", "n'aime pas", "du tout", "le froid."], "<b>Je n'aime pas du tout le froid.</b> = no me gusta nada."),
    M("Hora → cómo se dice", [["9:15", "neuf heures et quart"], ["9:30", "neuf heures et demie"], ["8:45", "neuf heures moins le quart"], ["12:00", "midi"]], "et quart, et demie, moins le quart."),
    S("¿Me gusta o no me gusta?", ["Me gusta", "No me gusta"], [["J'adore", 0], ["Je déteste", 1], ["J'aime bien", 0], ["Je n'aime pas", 1], ["Je préfère", 0], ["Ça m'énerve", 1]], "<i>Adorer, aimer bien, préférer</i> expresan gusto; <i>détester, ne pas aimer</i>, lo contrario."),
    P("Hablas de tus gustos.", "J'aime [du] rock.", "le", "Con <i>aimer</i> se usa el artículo definido: <b>j'aime le rock</b>."),
    P("Dices la hora.", "Il est huit heures et [demi].", "demie", "Después de <i>heure(s)</i> se escribe <b>demie</b>.")
  ];

  B["a1-possessifs-famille"] = [
    C("Elige el posesivo.", "Presentas a tu madre.", "Je vous présente ___ mère.", ["ma", "mon", "mes"], 0, "<i>Mère</i> es femenino: <b>ma mère</b>."),
    C("Elige el posesivo.", "Presentas a tus abuelos.", "Voici ___ grands-parents.", ["mes", "mon", "ma"], 0, "Plural: <b>mes</b>."),
    C("Elige el posesivo.", "Hablas de la casa de tu amigo.", "Paul adore ___ maison.", ["sa", "son", "ses"], 0, "<i>Maison</i> es femenino: <b>sa maison</b> (su casa)."),
    C("Elige el posesivo.", "Preguntas a tu amigo.", "C'est ___ école ?", ["ton", "ta", "tes"], 0, "<i>École</i> es femenino, pero empieza por vocal: <b>ton école</b>."),
    C("Elige el posesivo.", "Preguntas a un señor.", "C'est ___ voiture, Monsieur ?", ["votre", "vos", "ta"], 0, "Formal singular: <b>votre voiture</b>."),
    C("Elige el posesivo.", "Hablas de tus padres y su casa.", "Mes parents vendent ___ appartement.", ["leur", "leurs", "son"], 0, "Poseedor plural, objeto singular: <b>leur</b>."),
    C("Elige el familiar.", "La hermana de tu madre es tu…", "C'est ma ___.", ["tante", "cousine", "nièce"], 0, "Tía = <b>tante</b>."),
    C("Elige el familiar.", "El hijo de tu tío es tu…", "C'est mon ___.", ["cousin", "neveu", "oncle"], 0, "Primo = <b>cousin</b>."),
    F("Escribe el posesivo.", "Hablas con tu hermano.", "C'est ___ chambre ou ma chambre ? (tu)", ["ta"], "<i>Chambre</i> es femenino: <b>ta chambre</b>."),
    F("Escribe el posesivo.", "Presentas a tus amigos.", "Ce sont ___ amis de Lyon. (mis)", ["mes"], "Plural: <b>mes amis</b>."),
    F("Escribe el posesivo.", "Tu profesora habla de su hijo.", "___ fils a dix ans. (su, de ella)", ["Son"], "<i>Fils</i> es masculino: <b>son fils</b>."),
    F("Escribe el posesivo.", "Hablas en nombre de tu familia.", "___ chien s'appelle Rex. (nuestro)", ["Notre"], "«Nuestro» singular = <b>notre</b>."),
    O("Ordena la frase.", ["Ma", "sœur", "et", "son", "mari", "habitent", "à Paris."], "<b>Ma sœur et son mari habitent à Paris.</b>"),
    O("Ordena la frase.", ["Voici", "mon", "oncle", "et", "mes", "cousines."], "<b>Voici mon oncle et mes cousines.</b>"),
    M("Familiar → español", [["le grand-père", "el abuelo"], ["la belle-mère", "la suegra / madrastra"], ["le neveu", "el sobrino"], ["la petite-fille", "la nieta"]], "Vocabulario de la familia."),
    S("¿Masculino o femenino?", ["Hombre", "Mujer"], [["le frère", 0], ["la sœur", 1], ["l'oncle", 0], ["la tante", 1], ["le fils", 0], ["la fille", 1]], "Parejas de la familia."),
    P("Presentas a tu amiga.", "C'est [ma] amie Clara.", "mon", "Ante vocal se usa <b>mon</b>: <i>mon amie</i>."),
    P("Hablas de los hijos de tus vecinos.", "Mes voisins adorent [leur] enfants.", "leurs", "Objeto plural: <b>leurs enfants</b>.")
  ];

  B["a1-adjectifs-description"] = [
    C("Elige el adjetivo.", "Describes a tu hermana.", "Ma sœur est très ___.", ["grande", "grand", "grands"], 0, "Femenino singular: <b>grande</b>."),
    C("Elige el adjetivo.", "Describes a tus amigos.", "Mes amis sont ___.", ["sympathiques", "sympathique", "sympathiquees"], 0, "Plural: <b>sympathiques</b>."),
    C("Elige el adjetivo.", "Describes a tu abuela.", "Ma grand-mère est ___.", ["gentille", "gentil", "gentile"], 0, "Femenino de <i>gentil</i>: <b>gentille</b>."),
    C("Elige el adjetivo.", "Describes una película.", "C'est un film ___.", ["intéressant", "intéressante", "intéressants"], 0, "<i>Film</i> es masculino singular: <b>intéressant</b>."),
    C("Elige la posición.", "Describes tu casa.", "J'habite dans ___.", ["une petite maison", "une maison petite", "une petit maison"], 0, "<i>Petit, grand, beau, jeune</i> van antes del nombre: <b>une petite maison</b>."),
    C("Elige el adjetivo.", "Describes a un chico.", "Il est ___.", ["beau", "belle", "bel"], 0, "Masculino ante consonante: <b>beau</b>."),
    C("Elige el adjetivo.", "Describes el ojo de un gato.", "Mon chat a les yeux ___.", ["verts", "vertes", "vert"], 0, "<i>Les yeux</i> es masculino plural: <b>verts</b>."),
    C("Elige el contrario.", "Lo contrario de «grand» es…", "Il n'est pas grand, il est ___.", ["petit", "gros", "long"], 0, "grand ≠ <b>petit</b>."),
    F("Escribe el adjetivo en femenino.", "Describes a tu profesora.", "Elle est très ___. (sérieux)", ["sérieuse"], "<i>-eux</i> → <b>-euse</b>."),
    F("Escribe el adjetivo en femenino.", "Describes a tu vecina.", "Ma voisine est ___. (italien)", ["italienne"], "<i>-ien</i> → <b>-ienne</b>."),
    F("Escribe el adjetivo en plural.", "Describes tus zapatos.", "Mes chaussures sont ___. (noir)", ["noires"], "Femenino plural: <b>noires</b>."),
    F("Escribe el adjetivo en femenino.", "Describes una ciudad.", "C'est une ville ___. (ancien)", ["ancienne"], "<b>ancienne</b>."),
    O("Ordena la descripción.", ["Mon", "frère", "est", "grand,", "brun", "et", "sportif."], "<b>Mon frère est grand, brun et sportif.</b>"),
    O("Ordena la frase.", ["C'est", "une", "jeune", "fille", "très", "timide."], "<i>Jeune</i> va antes del nombre: <b>une jeune fille</b>."),
    M("Masculino → femenino", [["heureux", "heureuse"], ["actif", "active"], ["blanc", "blanche"], ["long", "longue"]], "Algunos femeninos cambian más que una -e."),
    S("¿Va antes o después del nombre?", ["Antes", "Después"], [["petit", 0], ["intelligent", 1], ["beau", 0], ["rouge", 1], ["jeune", 0], ["français", 1]], "Los adjetivos cortos y frecuentes (beau, petit, jeune…) van antes; los de color o nacionalidad, después."),
    P("Describes a tu madre.", "Ma mère est [petit] et blonde.", "petite", "Femenino: <b>petite</b>."),
    P("Describes a tus primas.", "Mes cousines sont très [gentils].", "gentilles", "Femenino plural: <b>gentilles</b>.")
  ];

  B["a1-logement"] = [
    C("Elige la preposición.", "Buscas las llaves.", "Les clés sont ___ la table.", ["sur", "sous", "dans"], 0, "«Encima de» = <b>sur</b>."),
    C("Elige la preposición.", "El gato está escondido.", "Le chat est ___ le canapé.", ["derrière", "devant", "sur"], 0, "«Detrás de» = <b>derrière</b>."),
    C("Elige la habitación.", "Duermes en…", "Je dors dans ___.", ["la chambre", "la cuisine", "la salle de bains"], 0, "Dormitorio = <b>la chambre</b>."),
    C("Elige la habitación.", "Te duchas en…", "Je prends une douche dans ___.", ["la salle de bains", "le salon", "le garage"], 0, "Baño = <b>la salle de bains</b>."),
    C("Elige el mueble.", "Guardas la ropa en…", "Je range mes vêtements dans ___.", ["l'armoire", "le frigo", "le four"], 0, "El armario = <b>l'armoire</b>."),
    C("Elige la expresión.", "Hay dos baños en el piso.", "___ deux salles de bains.", ["Il y a", "C'est", "Il est"], 0, "«Hay» = <b>il y a</b>."),
    C("Elige el piso.", "Vives en el tercer piso.", "J'habite au ___ étage.", ["troisième", "trois", "troisièmes"], 0, "Ordinal: <b>troisième</b>."),
    C("Elige el tipo de vivienda.", "Compartes piso con estudiantes.", "J'habite dans une ___.", ["colocation", "maison de retraite", "boulangerie"], 0, "Piso compartido = <b>une colocation</b>."),
    F("Escribe la preposición.", "Describes tu cuarto.", "Le bureau est ___ la fenêtre. (delante de)", ["devant"], "«Delante de» = <b>devant</b>."),
    F("Escribe la preposición.", "La ropa está en el armario.", "Mes pulls sont ___ l'armoire. (dentro)", ["dans"], "«Dentro de» = <b>dans</b>."),
    F("Escribe el mueble.", "Duermes en una…", "Dans ma chambre, il y a un ___. (cama)", ["lit"], "Cama = <b>le lit</b>."),
    F("Escribe la expresión.", "Describes el piso.", "___ une cuisine et un salon. (hay)", ["Il y a"], "<b>Il y a</b> + nombre."),
    O("Ordena la descripción.", ["Dans", "le salon,", "il y a", "un canapé", "et", "une télé."], "<b>Dans le salon, il y a un canapé et une télé.</b>"),
    O("Ordena la frase.", ["L'appartement", "est", "au deuxième étage", "avec", "un balcon."], "<b>L'appartement est au deuxième étage avec un balcon.</b>"),
    M("Mueble → habitación", [["le lit", "la chambre"], ["le frigo", "la cuisine"], ["le canapé", "le salon"], ["la baignoire", "la salle de bains"]], "Cada mueble en su lugar."),
    S("¿Dónde está?", ["En la cocina", "En el dormitorio"], [["le four", 0], ["la table de nuit", 1], ["l'évier", 0], ["le lit", 1], ["le frigo", 0], ["l'oreiller", 1]], "Horno, fregadero y nevera en la cocina; mesa de noche, cama y almohada en el dormitorio."),
    P("Describes tu piso.", "[C'est] trois chambres dans l'appartement.", "Il y a", "Para decir «hay» se usa <b>il y a</b>."),
    P("Explicas dónde está el libro.", "Le livre est [dessus] la table.", "sur", "Delante de un nombre se usa la preposición <b>sur</b>.")
  ];

  B["a1-cafe-restaurant"] = [
    C("Elige la frase cortés.", "Pides en un café de París.", "___ un café, s'il vous plaît.", ["Je voudrais", "Je veux", "Donne-moi"], 0, "Lo más cortés: <b>Je voudrais</b>."),
    C("Elige el partitivo.", "Pides agua.", "Je voudrais ___ eau minérale.", ["de l'", "du", "de la"], 0, "Ante vocal: <b>de l'eau</b>."),
    C("Elige el partitivo.", "En el desayuno.", "Je prends ___ pain avec ___ beurre.", ["du / du", "de la / du", "des / de"], 0, "<i>Pain</i> y <i>beurre</i> son masculinos: <b>du pain avec du beurre</b>."),
    C("Elige la respuesta del camarero.", "Ya pediste y te traen el plato.", "Voilà, ___ !", ["bon appétit", "bonne nuit", "à bientôt"], 0, "Al servir: <b>Bon appétit !</b>"),
    C("Elige el plato.", "Quieres un postre.", "Comme ___, je prends une crème brûlée.", ["dessert", "entrée", "boisson"], 0, "El postre = <b>le dessert</b>."),
    C("Elige la pregunta del camarero.", "Llega el camarero a tu mesa.", "Vous avez ___ ?", ["choisi", "fini", "payé"], 0, "«¿Ya eligieron?» = <b>Vous avez choisi ?</b>"),
    C("Elige la negación con partitivo.", "No quieres azúcar.", "Je ne prends pas ___ sucre.", ["de", "du", "le"], 0, "Tras negación, el partitivo se vuelve <b>de</b>: <i>pas de sucre</i>."),
    C("Elige la cantidad.", "En el mercado compras queso.", "Je voudrais deux cents grammes ___ fromage.", ["de", "du", "des"], 0, "Tras una cantidad: <b>de</b> (<i>200 grammes de fromage</i>)."),
    F("Escribe el partitivo.", "Pides una bebida.", "Je voudrais ___ jus d'orange. (partitivo)", ["du"], "<i>Jus</i> es masculino: <b>du jus</b>."),
    F("Escribe el partitivo.", "Hablas de la cena.", "Ce soir, on mange ___ soupe. (partitivo)", ["de la"], "Femenino: <b>de la soupe</b>."),
    F("Escribe la palabra.", "Quieres pagar.", "L'___, s'il vous plaît ! (la cuenta)", ["addition"], "La cuenta = <b>l'addition</b>."),
    F("Escribe la palabra.", "Pides la carta.", "Je peux voir la ___, s'il vous plaît ? (carta)", ["carte"], "La carta = <b>la carte</b> (el menú fijo es <i>le menu</i>)."),
    O("Ordena el pedido.", ["Pour moi,", "une salade", "et", "une bouteille", "d'eau,", "s'il vous plaît."], "<b>Pour moi, une salade et une bouteille d'eau, s'il vous plaît.</b>"),
    O("Ordena la pregunta.", ["Est-ce que", "je peux", "payer", "par carte ?"], "<b>Est-ce que je peux payer par carte ?</b>"),
    M("Español → francés", [["la entrada", "l'entrée"], ["el plato principal", "le plat principal"], ["la bebida", "la boisson"], ["la propina", "le pourboire"]], "Vocabulario del restaurante."),
    S("¿Se come o se bebe?", ["Comida", "Bebida"], [["un croissant", 0], ["un thé", 1], ["une omelette", 0], ["un jus de pomme", 1], ["une tarte", 0], ["un chocolat chaud", 1]], "Comida y bebida del café."),
    P("Pides en la panadería.", "Je voudrais [de] pain, s'il vous plaît.", "du", "<i>Pain</i> es masculino: <b>du pain</b>."),
    P("Dices que no tomas leche.", "Je ne bois pas [du] lait.", "de", "Tras negación: <b>pas de lait</b>.")
  ];

  B["a1-meteo-saisons"] = [
    C("Elige la expresión.", "Hay sol.", "Il y a du ___.", ["soleil", "neige", "froid"], 0, "Hay sol = <b>il y a du soleil</b>."),
    C("Elige la expresión.", "Está lloviendo.", "Il ___.", ["pleut", "neige", "fait"], 0, "Llueve = <b>il pleut</b>."),
    C("Elige la expresión.", "Hace mucho frío.", "Il fait très ___.", ["froid", "chaud", "beau"], 0, "Frío = <b>il fait froid</b>."),
    C("Elige la estación.", "En diciembre en París hace frío.", "C'est l'___.", ["hiver", "été", "automne"], 0, "Diciembre en Francia = <b>l'hiver</b>."),
    C("Elige la preposición.", "Hablas del verano.", "___ été, je vais à la plage.", ["En", "Au", "À l'"], 0, "<b>en été, en automne, en hiver</b>; pero <i>au printemps</i>."),
    C("Elige la preposición con el mes.", "Tu cumpleaños es en marzo.", "Mon anniversaire est ___ mars.", ["en", "au", "à"], 0, "Con los meses: <b>en mars</b>."),
    C("Elige la temperatura.", "El pronóstico dice -2 °C.", "Il fait moins ___ degrés.", ["deux", "douze", "vingt"], 0, "-2 °C = <b>moins deux degrés</b>."),
    C("Elige la pregunta.", "Quieres saber el tiempo.", "Quel temps ___ aujourd'hui ?", ["fait-il", "est-il", "a-t-il"], 0, "<b>Quel temps fait-il ?</b> = ¿Qué tiempo hace?"),
    F("Escribe la expresión.", "Hay viento.", "Il y a du ___. (viento)", ["vent"], "Viento = <b>le vent</b>."),
    F("Escribe el mes.", "El mes después de junio.", "Après juin, c'est ___. (julio)", ["juillet"], "Julio = <b>juillet</b>."),
    F("Escribe la estación.", "Las hojas caen en…", "Les feuilles tombent en ___. (otoño)", ["automne"], "Otoño = <b>l'automne</b>."),
    F("Escribe el verbo.", "Nieva en la montaña.", "À la montagne, il ___. (neiger)", ["neige"], "Nieva = <b>il neige</b>."),
    O("Ordena la frase.", ["Au printemps,", "il fait", "doux", "et", "les fleurs", "sortent."], "<b>Au printemps, il fait doux et les fleurs sortent.</b>"),
    O("Ordena el pronóstico.", ["Demain,", "il va", "pleuvoir", "toute la journée."], "<b>Demain, il va pleuvoir toute la journée.</b>"),
    M("Mes → estación (Francia)", [["janvier", "l'hiver"], ["avril", "le printemps"], ["août", "l'été"], ["octobre", "l'automne"]], "Las estaciones en el hemisferio norte."),
    S("¿Buen o mal tiempo?", ["Buen tiempo", "Mal tiempo"], [["Il fait beau.", 0], ["Il pleut.", 1], ["Il y a du soleil.", 0], ["Il y a un orage.", 1], ["Il fait doux.", 0], ["Il y a du brouillard.", 1]], "Expresiones del tiempo."),
    P("Hablas de las vacaciones.", "[Au] été, nous allons en Bretagne.", "En", "<b>en été</b>; solo <i>printemps</i> lleva <i>au</i>."),
    P("Describes el clima.", "Aujourd'hui, il [est] chaud.", "fait", "El tiempo va con <i>faire</i>: <b>il fait chaud</b>.")
  ];

  B["a1-demonstratifs-vetements"] = [
    C("Elige el demostrativo.", "Señalas una camisa en la tienda.", "Je voudrais essayer ___ chemise.", ["cette", "ce", "cet"], 0, "Femenino: <b>cette chemise</b>."),
    C("Elige el demostrativo.", "Señalas un pantalón.", "Combien coûte ___ pantalon ?", ["ce", "cet", "cette"], 0, "Masculino con consonante: <b>ce pantalon</b>."),
    C("Elige el demostrativo.", "Señalas unos zapatos.", "J'adore ___ chaussures !", ["ces", "ce", "cette"], 0, "Plural: <b>ces</b>."),
    C("Elige el demostrativo.", "Señalas un abrigo (manteau).", "___ manteau est trop cher.", ["Ce", "Cet", "Cette"], 0, "Masculino con consonante: <b>ce manteau</b>."),
    C("Elige la talla.", "La vendedora pregunta.", "Vous faites quelle ___ ?", ["taille", "couleur", "pointure"], 0, "Talla de ropa = <b>la taille</b>; de zapatos = <i>la pointure</i>."),
    C("Elige la respuesta.", "La camiseta te queda grande.", "Elle est trop ___. Vous avez plus petit ?", ["grande", "petite", "chère"], 0, "Demasiado grande = <b>trop grande</b>."),
    C("Elige el color.", "El cielo es…", "Le ciel est ___.", ["bleu", "bleue", "bleus"], 0, "<i>Ciel</i> es masculino: <b>bleu</b>."),
    C("Elige la prenda.", "Hace frío: te pones…", "Je mets une ___ et des gants.", ["écharpe", "jupe", "sandale"], 0, "Bufanda = <b>une écharpe</b>."),
    F("Escribe el demostrativo.", "Señalas un sombrero.", "J'aime ___ chapeau. (este)", ["ce"], "<b>ce chapeau</b>."),
    F("Escribe el demostrativo.", "Señalas un anorak.", "___ anorak est imperméable. (este)", ["Cet"], "Masculino ante vocal: <b>cet</b>."),
    F("Escribe el demostrativo.", "Señalas unas gafas.", "Je prends ___ lunettes. (estas)", ["ces"], "Plural: <b>ces</b>."),
    F("Escribe la pregunta.", "Quieres saber el precio.", "Ça ___ combien ? (costar)", ["coûte"], "<b>Ça coûte combien ?</b>"),
    O("Ordena la frase.", ["Est-ce que", "je peux", "essayer", "cette robe ?"], "<b>Est-ce que je peux essayer cette robe ?</b>"),
    O("Ordena la frase.", ["Ces baskets", "sont", "en solde", "à trente euros."], "<b>Ces baskets sont en solde à trente euros.</b>"),
    M("Prenda → español", [["un pull", "un suéter"], ["une jupe", "una falda"], ["des chaussettes", "unas medias"], ["un blouson", "una chaqueta"]], "Ropa básica."),
    S("¿ce, cet o cette?", ["ce / cet", "cette"], [["pantalon", 0], ["robe", 1], ["anorak", 0], ["veste", 1], ["t-shirt", 0], ["casquette", 1]], "Masculino: <i>ce</i> (o <i>cet</i> ante vocal); femenino: <i>cette</i>."),
    P("En la tienda.", "Je voudrais [ce] écharpe rouge.", "cette", "<i>Écharpe</i> es femenino: <b>cette écharpe</b>."),
    P("Señalas un abrigo.", "[Cette] manteau est joli.", "Ce", "<i>Manteau</i> es masculino: <b>ce manteau</b>.")
  ];

  B["a1-vouloir-pouvoir-devoir"] = [
    C("Elige la forma de vouloir.", "Invitas a tus amigos.", "Vous ___ venir au cinéma ?", ["voulez", "voulons", "veulent"], 0, "Con <i>vous</i>: <b>voulez</b>."),
    C("Elige la forma de pouvoir.", "Pides ayuda.", "Tu ___ m'aider ?", ["peux", "peut", "pouvez"], 0, "Con <i>tu</i>: <b>peux</b>."),
    C("Elige la forma de devoir.", "Tienes examen mañana.", "Je ___ étudier ce soir.", ["dois", "doit", "devons"], 0, "Con <i>je</i>: <b>dois</b>."),
    C("Elige la forma de vouloir.", "Tus hermanos quieren ir al parque.", "Ils ___ aller au parc.", ["veulent", "voulent", "veut"], 0, "Irregular: <b>ils veulent</b>."),
    C("Elige la forma de pouvoir.", "Explicas que tus amigos no pueden venir.", "Ils ne ___ pas venir.", ["peuvent", "pouvent", "peut"], 0, "Irregular: <b>ils peuvent</b>."),
    C("Elige la respuesta para aceptar.", "Te invitan a una fiesta.", "— Tu viens samedi ? — ___", ["Avec plaisir !", "Désolé, je ne peux pas.", "Je dois travailler."], 0, "Para aceptar: <b>Avec plaisir !</b>"),
    C("Elige la respuesta para rechazar.", "Te invitan pero estás ocupado.", "— On va au concert ? — ___", ["Désolé, je ne peux pas.", "Bonne idée !", "D'accord !"], 0, "Para rechazar con cortesía: <b>Désolé, je ne peux pas.</b>"),
    C("Elige la forma de devoir.", "Normas del colegio.", "Les élèves ___ arriver à l'heure.", ["doivent", "devent", "doit"], 0, "Irregular: <b>ils doivent</b>."),
    F("Escribe vouloir.", "Pides en la tienda.", "Je ___ un billet pour Lyon. (vouloir, cortés: condicional)", ["voudrais"], "Forma cortés: <b>je voudrais</b>."),
    F("Escribe pouvoir.", "Preguntas en clase.", "Est-ce que je ___ ouvrir la fenêtre ? (pouvoir)", ["peux"], "<b>je peux</b>."),
    F("Escribe devoir.", "Hablas de ti y tu amiga.", "Nous ___ partir à huit heures. (devoir)", ["devons"], "<b>nous devons</b>."),
    F("Escribe vouloir.", "Tu amiga quiere viajar.", "Elle ___ voyager au Canada. (vouloir)", ["veut"], "<b>elle veut</b>."),
    O("Ordena la invitación.", ["Tu", "veux", "dîner", "avec nous", "ce soir ?"], "<b>Tu veux dîner avec nous ce soir ?</b>"),
    O("Ordena el rechazo.", ["Désolée,", "je", "ne peux pas,", "je dois", "travailler."], "<b>Désolée, je ne peux pas, je dois travailler.</b>"),
    M("Sujeto → pouvoir", [["je", "peux"], ["il", "peut"], ["nous", "pouvons"], ["ils", "peuvent"]], "<i>Pouvoir</i>: peux, peux, peut, pouvons, pouvez, peuvent."),
    S("¿Acepta o rechaza?", ["Acepta", "Rechaza"], [["Avec plaisir !", 0], ["Je ne suis pas libre.", 1], ["D'accord, à quelle heure ?", 0], ["Une autre fois, peut-être.", 1], ["Super, j'arrive !", 0], ["Désolé, j'ai un examen.", 1]], "Expresiones para aceptar o rechazar una invitación."),
    P("Invitas a tus amigos.", "Vous [voulons] venir chez moi ?", "voulez", "Con <i>vous</i>: <b>voulez</b>."),
    P("Explicas tu obligación.", "Je [doit] rentrer tôt.", "dois", "Con <i>je</i>: <b>dois</b>.")
  ];

  B["a1-loisirs"] = [
    C("Elige la preposición.", "Hablas de deporte.", "Je joue ___ tennis le dimanche.", ["au", "du", "de la"], 0, "Deporte → <i>jouer à</i>: <b>au tennis</b>."),
    C("Elige la preposición.", "Hablas de música.", "Elle joue ___ piano depuis cinq ans.", ["du", "au", "de le"], 0, "Instrumento → <i>jouer de</i>: <b>du piano</b>."),
    C("Elige la preposición.", "Hablas de actividades.", "Nous faisons ___ natation.", ["de la", "du", "à la"], 0, "<i>Faire de</i> + femenino: <b>de la natation</b>."),
    C("Elige la preposición.", "Hablas de tus videojuegos.", "Mon frère joue ___ jeux vidéo.", ["aux", "des", "au"], 0, "Plural: <i>à + les</i> = <b>aux jeux vidéo</b>."),
    C("Elige la preposición.", "Practicas escalada.", "Je fais ___ escalade.", ["de l'", "du", "à l'"], 0, "Ante vocal: <b>de l'escalade</b>."),
    C("Elige la frecuencia.", "Vas a nadar todos los días.", "Je nage ___.", ["tous les jours", "jamais", "une fois par an"], 0, "Todos los días = <b>tous les jours</b>."),
    C("Elige el verbo.", "Tu pasatiempo es leer.", "J'aime ___ des romans.", ["lire", "jouer", "faire"], 0, "Leer = <b>lire</b>."),
    C("Elige la actividad.", "Te gusta ir a ver películas.", "Le week-end, je vais au ___.", ["cinéma", "piano", "football"], 0, "Ir al cine = <b>aller au cinéma</b>."),
    F("Escribe la preposición.", "Hablas de fútbol.", "Ils jouent ___ football. (à + le)", ["au"], "<b>au football</b>."),
    F("Escribe la preposición.", "Hablas de guitarra.", "Tu joues ___ guitare ? (de + la)", ["de la"], "<b>de la guitare</b>."),
    F("Escribe la preposición.", "Hablas de yoga.", "Ma mère fait ___ yoga. (de + le)", ["du"], "<b>du yoga</b>."),
    F("Escribe la preposición.", "Hablas de cartas.", "On joue ___ cartes ce soir ? (à + les)", ["aux"], "<b>aux cartes</b>."),
    O("Ordena la frase.", ["Le mercredi,", "je", "fais", "du judo", "avec mon frère."], "<b>Le mercredi, je fais du judo avec mon frère.</b>"),
    O("Ordena la frase.", ["Elle", "joue", "du violon", "dans un orchestre."], "<b>Elle joue du violon dans un orchestre.</b>"),
    M("Actividad → verbo", [["le basket", "jouer au"], ["la batterie", "jouer de la"], ["la randonnée", "faire de la"], ["le vélo", "faire du"]], "Deportes con <i>jouer à</i>; instrumentos con <i>jouer de</i>; actividades con <i>faire de</i>."),
    S("¿jouer à o jouer de?", ["jouer à", "jouer de"], [["tennis", 0], ["flûte", 1], ["échecs", 0], ["trompette", 1], ["rugby", 0], ["accordéon", 1]], "Juegos y deportes: <i>à</i>; instrumentos: <i>de</i>."),
    P("Hablas de tu hermana.", "Ma sœur joue [au] violon.", "du", "Instrumento: <b>jouer du violon</b>."),
    P("Hablas de deporte.", "Nous jouons [du] volley le samedi.", "au", "Deporte: <b>jouer au volley</b>.")
  ];

  window.__BANCO = Object.assign(window.__BANCO || {}, B);
})();
