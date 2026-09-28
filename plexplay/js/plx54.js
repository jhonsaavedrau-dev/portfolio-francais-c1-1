/* PLEX PLAY 1.27.0 — «Primeros pasos en francés»: el curso para empezar de cero
   Para quien no sabe nada de francés, ni ha estudiado nunca otro idioma. Va antes de A1.
   - 12 lecciones cortas en 5 unidades: saludar, ser amable, decir tu nombre, el alfabeto, los sonidos nuevos,
     las letras que no suenan, los números hasta 20 y la edad, los colores, las primeras cosas (le, la, un, une),
     ¿cómo estás? y frases de rescate.
   - Explicaciones muy cortas y sin palabras de gramática. Cada palabra tiene un botón para oírla y cómo suena
     escrito «a la española» (bon-YUR). Casi todo se responde escuchando y eligiendo; casi nada se escribe.
   - Al final de cada lección, el juego de repaso va sin reloj (juego guiado).
   - La app tiene la lista de cursos fija en index.html: el curso se agrega aquí, al principio, y se vuelve a pintar. */
(function(){
  "use strict";
  if (typeof TRACKS === "undefined" || typeof LESSONS === "undefined" || TRACKS.some(function(t){ return t.id === "pp"; })) return;

  /* ---------------- piezas de la teoría ---------------- */
  var esc = function(x){ return String(x).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var OIR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor"/><path d="M13 7a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  /* una palabra: botón para oírla, la palabra, cómo suena y qué significa */
  var P = function(fr, suena, es, extra){
    return '<div class="pp-p"><button class="say pp-o" data-say="' + esc(fr) + '" aria-label="Escuchar ' + esc(fr) + '">' + OIR + "</button>" +
      '<span class="pp-w"><b lang="fr">' + esc(fr) + "</b>" + (suena ? '<small>suena «' + esc(suena) + '»</small>' : "") + "</span>" +
      '<span class="pp-es">' + esc(es) + (extra || "") + "</span></div>";
  };
  var LISTA = function(){ return '<div class="pp-lista">' + [].slice.call(arguments).join("") + "</div>"; };
  var INTRO = function(t){ return '<p class="pp-intro">' + t + "</p>"; };
  var TIP = function(t){ return '<p class="pp-tip"><b>Truco</b>' + t + "</p>"; };
  var MZ = function(img, t){ return '<div class="pp-mz"><img src="img/' + img + '.webp" alt="" loading="lazy"><p>' + t + "</p></div>"; };
  var COLOR = function(fr, suena, es, hex){ return P(fr, suena, es, '<i class="pp-sw" style="background:' + hex + '"></i>'); };
  var DIALOGO = function(lineas){
    return '<div class="pp-dia">' + lineas.map(function(l){ return '<p><span class="pp-q">' + esc(l[0]) + '</span><button class="say pp-o sm" data-say="' + esc(l[1]) + '" aria-label="Escuchar">' + OIR + '</button><b lang="fr">' + esc(l[1]) + "</b><small>" + esc(l[2]) + "</small></p>"; }).join("") + "</div>";
  };

  /* ---------------- las lecciones ---------------- */
  var L = [];
  /* 1 · saludar */
  L.push({ id: "pp-hola", title: "Bonjour ! Saludar y despedirse", t: "registre", juego: "mr",
    theory: MZ("mz-hola", "¡Hola! Soy Manzana. Vamos a empezar con lo más fácil: saludar. Toca cada botón para oír la palabra.") +
      INTRO("En francés se saluda con pocas palabras. Con estas ya puedes llegar y despedirte en cualquier lugar.") +
      LISTA(P("Bonjour", "bon-YUR", "Hola / Buenos días (sirve todo el día)"), P("Bonsoir", "bon-SUAR", "Buenas noches (al llegar, en la noche)"),
        P("Salut", "sa-LÜ", "Hola o chao, solo con amigos"), P("Au revoir", "o re-VUAR", "Adiós"),
        P("À bientôt", "a bian-TÓ", "Hasta pronto"), P("Bonne nuit", "bon NÜI", "Buenas noches (al ir a dormir)")) +
      TIP("La «ü» de <i>salut</i> no existe en español: pon los labios como para decir «u» y di «i».") +
      TIP("<i>Bonne nuit</i> es solo para ir a dormir. Si llegas a algún sitio en la noche, di <i>Bonsoir</i>."),
    items: [
      { k: "choice", ask: "Escucha y elige qué significa.", say: "Bonjour", q: "¿Qué escuchaste?", o: ["Hola / Buenos días", "Adiós", "Gracias"], a: 0, why: "<b>Bonjour</b> se dice al llegar, a cualquier hora del día." },
      { k: "choice", ask: "Escucha y elige qué significa.", say: "Au revoir", q: "¿Qué escuchaste?", o: ["Buenas noches", "Adiós", "Hola"], a: 1, why: "<b>Au revoir</b> significa «adiós». Suena «o re-VUAR»." },
      { k: "choice", ask: "Elige qué dirías.", q: "Llegas a clase a las 8 de la mañana. ¿Qué dices?", o: ["Bonjour !", "Bonne nuit !", "Au revoir !"], a: 0, why: "Al llegar, de día, se dice <b>Bonjour</b>." },
      { k: "choice", ask: "Elige qué dirías.", q: "Te vas a dormir. ¿Qué le dices a tu familia?", o: ["Bonjour !", "Bonne nuit !", "Salut !"], a: 1, why: "<b>Bonne nuit</b> es para ir a dormir. Para saludar en la noche se dice <i>Bonsoir</i>." },
      { k: "match", ask: "Une cada palabra con lo que significa.", q: "Saludos y despedidas", pairs: [["Bonjour", "Hola"], ["Au revoir", "Adiós"], ["Bonsoir", "Buenas noches al llegar"], ["À bientôt", "Hasta pronto"]], why: "Con estas cuatro palabras ya puedes saludar y despedirte." },
      { k: "sort", ask: "Clasifica.", q: "¿Se dice al llegar o al irse?", cats: ["Al llegar", "Al irse"], items: [["Bonjour", 0], ["Bonsoir", 0], ["Au revoir", 1], ["À bientôt", 1], ["Bonne nuit", 1]], why: "<i>Bonjour</i> y <i>Bonsoir</i> son para llegar; <i>Au revoir</i>, <i>À bientôt</i> y <i>Bonne nuit</i>, para irse." },
      { k: "choice", ask: "Elige.", q: "«Salut» se usa…", o: ["con amigos", "con tu profesor", "con el rector"], a: 0, why: "<b>Salut</b> es informal: solo con amigos. Con los demás, <i>Bonjour</i>." },
      { k: "choice", ask: "Escucha y elige.", say: "Bonsoir", q: "¿Cuándo se dice lo que escuchaste?", o: ["Al llegar, en la noche", "Al ir a dormir", "Por la mañana"], a: 0, why: "<b>Bonsoir</b> es «buenas noches» al llegar. Al ir a dormir se dice <i>Bonne nuit</i>." }
    ] });
  /* 2 · ser amable */
  L.push({ id: "pp-merci", title: "Merci : ser amable", t: "registre", juego: "ff",
    theory: INTRO("Estas palabras abren todas las puertas. Son las que más vas a usar.") +
      LISTA(P("Merci", "mer-SÍ", "Gracias"), P("Merci beaucoup", "mer-SÍ bo-KÚ", "Muchas gracias"), P("S'il vous plaît", "sil vu PLÉ", "Por favor"),
        P("De rien", "de RIAN", "De nada"), P("Pardon", "par-DÓN", "Perdón"), P("Excusez-moi", "eks-kü-SÉ muá", "Disculpe"),
        P("Oui", "UÍ", "Sí"), P("Non", "NON", "No")) +
      TIP("En <i>Merci</i>, la «r» se dice atrás, en la garganta, como si hicieras gárgaras muy suave. Si no te sale, no pasa nada: igual te entienden."),
    items: [
      { k: "choice", ask: "Escucha y elige qué significa.", say: "Merci", q: "¿Qué escuchaste?", o: ["Gracias", "Por favor", "Perdón"], a: 0, why: "<b>Merci</b> = gracias. Suena «mer-SÍ»." },
      { k: "choice", ask: "Escucha y elige qué significa.", say: "S'il vous plaît", q: "¿Qué escuchaste?", o: ["Por favor", "De nada", "Disculpe"], a: 0, why: "<b>S'il vous plaît</b> = por favor." },
      { k: "choice", ask: "Elige qué dirías.", q: "Alguien te pasa un libro. ¿Qué dices?", o: ["Merci !", "Pardon !", "Non !"], a: 0, why: "Cuando te dan algo, se dice <b>Merci</b>." },
      { k: "choice", ask: "Elige qué dirías.", q: "Te dicen «Merci». ¿Qué respondes?", o: ["De rien !", "Bonjour !", "Oui !"], a: 0, why: "A <i>Merci</i> se responde <b>De rien</b> (de nada)." },
      { k: "choice", ask: "Elige qué dirías.", q: "Chocas sin querer con alguien en la calle.", o: ["Pardon !", "Merci !", "Salut !"], a: 0, why: "Para pedir perdón: <b>Pardon</b>." },
      { k: "match", ask: "Une cada palabra con lo que significa.", q: "Palabras amables", pairs: [["Oui", "Sí"], ["Non", "No"], ["Pardon", "Perdón"], ["Merci beaucoup", "Muchas gracias"]], why: "Oui, non, pardon y merci beaucoup: cuatro palabras que usarás todos los días." },
      { k: "order", ask: "Ordena: «Muchas gracias, señora».", tokens: ["Merci", "beaucoup,", "Madame"], why: "<b>Merci beaucoup, Madame.</b> <i>Madame</i> = señora." },
      { k: "choice", ask: "Escucha y elige qué significa.", say: "De rien", q: "¿Qué escuchaste?", o: ["De nada", "Gracias", "Adiós"], a: 0, why: "<b>De rien</b> = de nada." }
    ] });
  /* 3 · tu nombre */
  L.push({ id: "pp-prenom", title: "Je m'appelle… : di tu nombre", t: "registre", juego: "pb",
    theory: INTRO("Ahora vas a decir cómo te llamas y preguntar el nombre de otra persona.") +
      LISTA(P("Je m'appelle Ana.", "ye ma-PEL Ana", "Me llamo Ana."), P("Comment tu t'appelles ?", "ko-MAN tü ta-PEL", "¿Cómo te llamas?"),
        P("Je suis Luis.", "ye SÜI Luis", "Soy Luis."), P("Enchanté.", "an-shan-TÉ", "Mucho gusto."), P("Et toi ?", "e TUÁ", "¿Y tú?")) +
      DIALOGO([["Ana", "Bonjour ! Je m'appelle Ana. Et toi ?", "¡Hola! Me llamo Ana. ¿Y tú?"], ["Luis", "Je m'appelle Luis. Enchanté !", "Me llamo Luis. ¡Mucho gusto!"]]) +
      TIP("Si eres mujer se escribe <i>Enchantée</i> (con otra e al final), pero suena igual."),
    items: [
      { k: "choice", ask: "Escucha y elige qué dijo.", say: "Je m'appelle Camila.", q: "¿Qué escuchaste?", o: ["Me llamo Camila.", "Soy amiga de Camila.", "Adiós, Camila."], a: 0, why: "<b>Je m'appelle</b> = me llamo." },
      { k: "order", ask: "Ordena: «Me llamo Andrés».", tokens: ["Je", "m'appelle", "Andrés."], why: "<b>Je m'appelle Andrés.</b> Primero <i>je</i> (yo), luego <i>m'appelle</i> (me llamo)." },
      { k: "choice", ask: "Elige.", q: "Te preguntan «Comment tu t'appelles ?». ¿Qué te están preguntando?", o: ["¿Cómo te llamas?", "¿Cómo estás?", "¿De dónde eres?"], a: 0, why: "<b>Comment tu t'appelles ?</b> = ¿cómo te llamas?" },
      { k: "choice", ask: "Elige qué dirías.", q: "Te presentan a una persona nueva. ¿Qué dices?", o: ["Enchanté !", "Bonne nuit !", "Pardon !"], a: 0, why: "Al conocer a alguien: <b>Enchanté</b> (mucho gusto)." },
      { k: "match", ask: "Une cada frase con lo que significa.", q: "Presentarse", pairs: [["Je m'appelle", "Me llamo"], ["Et toi ?", "¿Y tú?"], ["Enchanté", "Mucho gusto"], ["Je suis", "Soy"]], why: "Con estas frases ya puedes presentarte." },
      { k: "order", ask: "Ordena el saludo de Laura: «¡Hola! Me llamo Laura».", tokens: ["Bonjour !", "Je m'appelle", "Laura."], why: "<b>Bonjour ! Je m'appelle Laura.</b> Primero se saluda, después se dice el nombre." },
      { k: "choice", ask: "Escucha y elige qué significa.", say: "Et toi ?", q: "¿Qué escuchaste?", o: ["¿Y tú?", "¿Quién eres?", "¡Gracias!"], a: 0, why: "<b>Et toi ?</b> = ¿y tú? Sirve para devolver la pregunta." }
    ] });
  /* 4 · alfabeto */
  L.push({ id: "pp-alfabeto", title: "El alfabeto en francés", t: "voc", juego: "ff",
    theory: INTRO("Las letras son las mismas del español (menos la ñ). Lo que cambia es cómo se <b>llaman</b>. Toca cada una para oírla.") +
      '<div class="pp-abc">' + "A·a B·be C·se D·de E·e F·ef G·yé H·ash I·i J·yi K·ka L·el M·em N·en O·o P·pe Q·kü R·er S·es T·te U·ü V·ve W·dubl-ve X·iks Y·i-grek Z·zed".split(" ").map(function(x){
        var p = x.split("·"); return '<button class="say pp-l" data-say="' + p[0] + '" aria-label="Escuchar la letra ' + p[0] + '"><b>' + p[0] + "</b><small>" + p[1] + "</small></button>"; }).join("") + "</div>" +
      TIP("Las que más confunden: la <b>E</b> suena parecido a «e» con la boca redonda; la <b>G</b> suena «yé» y la <b>J</b> suena «yi»; la <b>U</b> es la «ü» de <i>salut</i>.") +
      TIP("Para deletrear tu nombre (por ejemplo en un hotel) solo tienes que decir estas letras una por una."),
    items: [
      { k: "choice", ask: "Escucha la letra y elige cuál es.", say: "G", q: "¿Qué letra escuchaste?", o: ["G", "J", "Y"], a: 0, why: "La <b>G</b> suena «yé». La J suena «yi»." },
      { k: "choice", ask: "Escucha la letra y elige cuál es.", say: "J", q: "¿Qué letra escuchaste?", o: ["J", "G", "I"], a: 0, why: "La <b>J</b> suena «yi»." },
      { k: "choice", ask: "Escucha la letra y elige cuál es.", say: "U", q: "¿Qué letra escuchaste?", o: ["U", "O", "I"], a: 0, why: "La <b>U</b> suena «ü»: labios de «u» diciendo «i»." },
      { k: "choice", ask: "Escucha la letra y elige cuál es.", say: "E", q: "¿Qué letra escuchaste?", o: ["E", "I", "A"], a: 0, why: "La <b>E</b> suena como una «e» con la boca redonda." },
      { k: "choice", ask: "Elige.", q: "¿Cómo se llama la letra Y en francés?", o: ["i-grek", "ye", "uai"], a: 0, why: "La <b>Y</b> se llama «i-grek» (i griega), como en español." },
      { k: "choice", ask: "Elige.", q: "¿Qué letra del español NO está en el alfabeto francés?", o: ["ñ", "k", "w"], a: 0, why: "El francés no tiene <b>ñ</b>. El sonido «ñ» se escribe <i>gn</i>: <i>montagne</i>." },
      { k: "match", ask: "Une cada letra con su nombre en francés.", q: "Letras que cambian", pairs: [["H", "ash"], ["W", "dubl-ve"], ["Q", "kü"], ["R", "er"]], why: "Estas letras tienen nombres muy distintos a los del español." }
    ] });
  /* 5 · sonidos nuevos */
  L.push({ id: "pp-sonidos", title: "Sonidos nuevos", t: "voc", juego: "ff",
    theory: INTRO("El francés tiene algunos sonidos que el español no tiene. No tienen que salirte perfectos: basta con que los reconozcas.") +
      LISTA(P("tu", "tü", "tú — la «u» francesa (labios de u, diciendo i)"), P("tout", "tu", "todo — «ou» suena como nuestra «u»"),
        P("moi", "muá", "yo — «oi» suena «ua»"), P("eau", "o", "agua — «eau» y «au» suenan «o»"),
        P("chat", "sha", "gato — «ch» suena «sh»"), P("bon", "bon (por la nariz)", "bueno — «on» se dice por la nariz"),
        P("vin", "van (por la nariz)", "vino — «in» también va por la nariz")) +
      TIP("Los sonidos «por la nariz» (<i>bon</i>, <i>vin</i>, <i>blanc</i>) se hacen dejando salir el aire por la nariz, sin decir la «n» del todo."),
    items: [
      { k: "choice", ask: "Escucha y elige la palabra.", say: "tu", q: "¿Qué palabra escuchaste?", o: ["tu", "tout"], a: 0, why: "<b>tu</b> tiene la «ü» francesa. <i>tout</i> suena «tu», como en español." },
      { k: "choice", ask: "Escucha y elige la palabra.", say: "tout", q: "¿Qué palabra escuchaste?", o: ["tout", "tu"], a: 0, why: "<b>tout</b>: «ou» suena como nuestra «u»." },
      { k: "choice", ask: "Elige.", q: "En francés, «oi» suena como…", o: ["ua", "oi", "o"], a: 0, why: "«oi» suena <b>ua</b>: <i>moi</i> se dice «muá»." },
      { k: "choice", ask: "Elige.", q: "¿Cómo suena «eau»?", o: ["o", "e-a-u", "eo"], a: 0, why: "<b>eau</b> (agua) suena simplemente «o»." },
      { k: "choice", ask: "Elige.", q: "La «ch» de «chat» suena como…", o: ["sh, como en «show»", "ch, como en «chocolate»", "k, como en «casa»"], a: 0, why: "En francés <b>ch</b> suena «sh»: <i>chat</i> = «sha»." },
      { k: "choice", ask: "Escucha y elige la palabra.", say: "chat", q: "¿Qué palabra escuchaste?", o: ["chat", "ça"], a: 0, why: "<b>chat</b> (gato) empieza con «sh»; <i>ça</i> empieza con «s»." },
      { k: "match", ask: "Une cada escritura con cómo suena.", q: "Cómo suenan", pairs: [["oi", "ua"], ["ou", "u"], ["eau", "o"], ["ch", "sh"]], why: "Estas combinaciones se leen distinto que en español." }
    ] });
  /* 6 · letras mudas */
  L.push({ id: "pp-mudas", title: "Letras que no suenan", t: "voc", juego: "ff",
    theory: INTRO("En francés muchas letras del final se escriben pero <b>no se dicen</b>. Por eso las palabras suenan más cortas de lo que se ven.") +
      LISTA(P("Paris", "pa-RÍ", "París — la s no suena"), P("petit", "pe-TÍ", "pequeño — la t no suena"), P("Madame", "ma-DAM", "Señora — la e final no suena"),
        P("hôtel", "o-TEL", "hotel — la h nunca suena"), P("avec", "a-VEK", "con — la c sí suena")) +
      TIP("Regla fácil: al final de una palabra casi nunca suenan la <b>s, t, d, x, z</b> ni la <b>e</b>. Las que casi siempre sí suenan son <b>c, r, f, l</b> (piensa en la palabra inglesa <i>CaReFuL</i>)."),
    items: [
      { k: "choice", ask: "Escucha y elige.", say: "Paris", q: "¿Se oye la s del final?", o: ["No, no suena", "Sí, suena"], a: 0, why: "En <b>Paris</b> la s final no se pronuncia: «pa-RÍ»." },
      { k: "choice", ask: "Elige.", q: "¿Qué letra no suena en «hôtel»?", o: ["la h", "la t", "la l"], a: 0, why: "La <b>h</b> nunca suena en francés: «o-TEL»." },
      { k: "choice", ask: "Elige.", q: "En «Madame», la e del final…", o: ["no se pronuncia", "suena como «e»"], a: 0, why: "La <b>e</b> del final no suena: «ma-DAM»." },
      { k: "choice", ask: "Escucha y elige qué número es.", say: "trois", q: "¿Qué número escuchaste?", o: ["3", "2"], a: 0, why: "<b>trois</b> (3) suena «truá»: la s final no se dice." },
      { k: "sort", ask: "Clasifica: ¿suena la última letra?", q: "¿La última letra suena?", cats: ["La última letra suena", "La última letra NO suena"], items: [["avec", 0], ["bonjour", 0], ["sac", 0], ["Paris", 1], ["petit", 1], ["Madame", 1]], why: "<i>c, r, f, l</i> suelen sonar (<i>avec, bonjour, sac</i>). <i>s, t, e</i> al final no suenan (<i>Paris, petit, Madame</i>)." },
      { k: "choice", ask: "Escucha y elige la palabra.", say: "petit", q: "¿Qué palabra escuchaste?", o: ["petit", "Paris"], a: 0, why: "<b>petit</b> (pequeño) suena «pe-TÍ»: la t final no suena." }
    ] });
  /* 7 · números 0 a 10 */
  L.push({ id: "pp-numeros1", title: "Números del 0 al 10", t: "voc", juego: "mr",
    theory: INTRO("Toca cada número para oírlo. Después vas a escribir en cifras los números que escuches.") +
      '<div class="pp-num">' + [["0", "zéro", "se-RÓ"], ["1", "un", "an (nariz)"], ["2", "deux", "dö"], ["3", "trois", "truá"], ["4", "quatre", "KATR"], ["5", "cinq", "sank"], ["6", "six", "sis"], ["7", "sept", "set"], ["8", "huit", "üit"], ["9", "neuf", "nöf"], ["10", "dix", "dis"]].map(function(n){
        return '<button class="say pp-n" data-say="' + n[1] + '" aria-label="Escuchar ' + n[1] + '"><b>' + n[0] + "</b><span lang=\"fr\">" + n[1] + "</span><small>" + n[2] + "</small></button>"; }).join("") + "</div>" +
      TIP("En <i>sept</i> (7) la p no suena: «set». En <i>huit</i> (8) la h tampoco: «üit»."),
    items: [
      { k: "listen", ask: "Escucha y escribe el número en cifras.", say: "trois", acc: ["3"], num: true, why: "<b>trois</b> = 3." },
      { k: "listen", ask: "Escucha y escribe el número en cifras.", say: "sept", acc: ["7"], num: true, why: "<b>sept</b> = 7. Suena «set»." },
      { k: "listen", ask: "Escucha y escribe el número en cifras.", say: "dix", acc: ["10"], num: true, why: "<b>dix</b> = 10. Suena «dis»." },
      { k: "choice", ask: "Escucha y elige el número.", say: "deux", q: "¿Qué número escuchaste?", o: ["2", "3", "6"], a: 0, why: "<b>deux</b> = 2." },
      { k: "choice", ask: "Elige.", q: "¿Cómo se dice 5?", o: ["cinq", "six", "sept"], a: 0, why: "5 = <b>cinq</b> (sank)." },
      { k: "match", ask: "Une cada número con su palabra.", q: "Números", pairs: [["un", "1"], ["quatre", "4"], ["huit", "8"], ["neuf", "9"]], why: "un 1 · quatre 4 · huit 8 · neuf 9." },
      { k: "choice", ask: "Escucha y elige el número.", say: "six", q: "¿Qué número escuchaste?", o: ["6", "10", "3"], a: 0, why: "<b>six</b> = 6. Suena «sis»." },
      { k: "choice", ask: "Elige.", q: "¿Cómo se dice 0?", o: ["zéro", "onze", "deux"], a: 0, why: "0 = <b>zéro</b>." }
    ] });
  /* 8 · números 11 a 20 y la edad */
  L.push({ id: "pp-numeros2", title: "Del 11 al 20 y tu edad", t: "voc", juego: "mr",
    theory: INTRO("Del 11 al 16 los números tienen nombre propio, como en español (once, doce…). Del 17 al 19 se dicen «diez-siete», «diez-ocho», «diez-nueve».") +
      '<div class="pp-num">' + [["11", "onze", "onz"], ["12", "douze", "duz"], ["13", "treize", "trez"], ["14", "quatorze", "ka-TORZ"], ["15", "quinze", "kanz"], ["16", "seize", "sez"], ["17", "dix-sept", "di-SET"], ["18", "dix-huit", "di-SÜIT"], ["19", "dix-neuf", "dis-NÖF"], ["20", "vingt", "van (nariz)"]].map(function(n){
        return '<button class="say pp-n" data-say="' + n[1] + '" aria-label="Escuchar ' + n[1] + '"><b>' + n[0] + "</b><span lang=\"fr\">" + n[1] + "</span><small>" + n[2] + "</small></button>"; }).join("") + "</div>" +
      LISTA(P("J'ai dix-neuf ans.", "ye dis-növ AN", "Tengo 19 años."), P("Tu as quel âge ?", "tü a kel ASH", "¿Cuántos años tienes?")) +
      TIP("Como en español, en francés la edad se <b>tiene</b>: <i>J'ai 19 ans</i> = «tengo 19 años»."),
    items: [
      { k: "listen", ask: "Escucha y escribe el número en cifras.", say: "douze", acc: ["12"], num: true, why: "<b>douze</b> = 12." },
      { k: "listen", ask: "Escucha y escribe el número en cifras.", say: "seize", acc: ["16"], num: true, why: "<b>seize</b> = 16." },
      { k: "listen", ask: "Escucha y escribe el número en cifras.", say: "vingt", acc: ["20"], num: true, why: "<b>vingt</b> = 20. La g y la t no suenan." },
      { k: "choice", ask: "Elige.", q: "¿Cómo se dice 18?", o: ["dix-huit", "huit-dix", "dix-sept"], a: 0, why: "18 = diez-ocho: <b>dix-huit</b>." },
      { k: "match", ask: "Une cada número con su palabra.", q: "Números", pairs: [["onze", "11"], ["treize", "13"], ["quinze", "15"], ["dix-neuf", "19"]], why: "onze 11 · treize 13 · quinze 15 · dix-neuf 19." },
      { k: "choice", ask: "Escucha y elige.", say: "J'ai dix-neuf ans.", q: "¿Cuántos años tiene?", o: ["19", "9", "10"], a: 0, why: "<b>dix-neuf</b> = 19: «tengo 19 años»." },
      { k: "order", ask: "Ordena: «Tengo 20 años».", tokens: ["J'ai", "vingt", "ans."], why: "<b>J'ai vingt ans.</b> <i>J'ai</i> = tengo; <i>ans</i> = años." },
      { k: "choice", ask: "Elige.", q: "Para decir tu edad en francés dices…", o: ["J'ai … ans (tengo … años)", "Je suis … ans (soy … años)"], a: 0, why: "La edad se <b>tiene</b>: <i>J'ai 20 ans</i>. «Je suis 20 ans» está mal." }
    ] });
  /* 9 · colores */
  L.push({ id: "pp-colores", title: "Los colores", t: "voc", juego: "mr",
    theory: INTRO("Muchos colores se parecen al español. Toca cada uno para oírlo.") +
      LISTA(COLOR("rouge", "RUSH", "rojo", "#E5484D"), COLOR("bleu", "blö", "azul", "#1E5BD7"), COLOR("vert", "VER", "verde", "#15803D"),
        COLOR("jaune", "YON", "amarillo", "#FFD200"), COLOR("noir", "nuár", "negro", "#111827"), COLOR("blanc", "blan (nariz)", "blanco", "#FFFFFF"),
        COLOR("rose", "ROS", "rosado", "#F472B6"), COLOR("orange", "o-RANSH", "naranja", "#F97316"), COLOR("gris", "GRÍ", "gris", "#9CA3AF"), COLOR("violet", "vio-LÉ", "morado", "#7C3AED")) +
      TIP("La bandera de Francia es <i>bleu, blanc, rouge</i>: azul, blanco y rojo."),
    items: [
      { k: "choice", ask: "Escucha y elige el color.", say: "rouge", q: "¿Qué color escuchaste?", o: ["rojo", "verde", "azul"], a: 0, why: "<b>rouge</b> = rojo. Suena «rush»." },
      { k: "choice", ask: "Escucha y elige el color.", say: "jaune", q: "¿Qué color escuchaste?", o: ["amarillo", "blanco", "negro"], a: 0, why: "<b>jaune</b> = amarillo. Suena «yon»." },
      { k: "choice", ask: "Elige.", q: "¿Cómo se dice «azul»?", o: ["bleu", "blanc", "noir"], a: 0, why: "azul = <b>bleu</b>. <i>blanc</i> es blanco y <i>noir</i> es negro." },
      { k: "match", ask: "Une cada color con su nombre en español.", q: "Colores", pairs: [["vert", "verde"], ["noir", "negro"], ["blanc", "blanco"], ["rose", "rosado"]], why: "vert verde · noir negro · blanc blanco · rose rosado." },
      { k: "choice", ask: "Escucha y elige el color.", say: "gris", q: "¿Qué color escuchaste?", o: ["gris", "azul", "rosado"], a: 0, why: "<b>gris</b> = gris. La s final no suena: «grí»." },
      { k: "choice", ask: "Elige.", q: "La bandera de Francia es…", o: ["bleu, blanc, rouge", "vert, blanc, rouge", "jaune, bleu, rouge"], a: 0, why: "<b>Bleu, blanc, rouge</b>: azul, blanco y rojo." },
      { k: "choice", ask: "Escucha y elige el color.", say: "violet", q: "¿Qué color escuchaste?", o: ["morado", "verde", "naranja"], a: 0, why: "<b>violet</b> = morado." }
    ] });
  /* 10 · primeras cosas */
  L.push({ id: "pp-cosas", title: "Tus primeras cosas: le, la, un, une", t: "gram", juego: "ff",
    theory: INTRO("Como en español, en francés las cosas son «masculinas» o «femeninas»: <i>el</i> libro, <i>la</i> mesa. Solo hay que aprender cuatro palabras pequeñas.") +
      '<div class="pp-tabla"><div><b>le</b><span>el</span></div><div><b>la</b><span>la</span></div><div><b>un</b><span>un</span></div><div><b>une</b><span>una</span></div></div>' +
      LISTA(P("le livre", "le LIVR", "el libro"), P("la table", "la TABL", "la mesa"), P("un stylo", "an sti-LÓ", "un bolígrafo"),
        P("une porte", "ün PORT", "una puerta"), P("une pomme", "ün POM", "una manzana (¡como Manzana!)"), P("l'eau", "LO", "el agua")) +
      TIP("Si la palabra empieza por vocal, <i>le</i> y <i>la</i> se juntan: <b>l'</b>. Por eso se escribe <i>l'eau</i> y no «la eau»."),
    items: [
      { k: "choice", ask: "Escucha y elige qué significa.", say: "une pomme", q: "¿Qué escuchaste?", o: ["una manzana", "un libro", "una puerta"], a: 0, why: "<b>une pomme</b> = una manzana." },
      { k: "choice", ask: "Elige.", q: "«le» significa…", o: ["el", "la", "un"], a: 0, why: "<b>le</b> = el: <i>le livre</i>, el libro." },
      { k: "choice", ask: "Elige.", q: "«une» significa…", o: ["una", "un", "la"], a: 0, why: "<b>une</b> = una: <i>une porte</i>, una puerta." },
      { k: "match", ask: "Une cada cosa con lo que significa.", q: "Cosas", pairs: [["le livre", "el libro"], ["la table", "la mesa"], ["un stylo", "un bolígrafo"], ["une porte", "una puerta"]], why: "le livre · la table · un stylo · une porte." },
      { k: "choice", ask: "Escucha y elige qué significa.", say: "un café", q: "¿Qué escuchaste?", o: ["un café", "una casa", "un gato"], a: 0, why: "<b>un café</b> = un café. ¡Igual que en español!" },
      { k: "choice", ask: "Elige.", q: "¿Por qué se escribe «l'eau» y no «la eau»?", o: ["Porque «eau» empieza por vocal", "Porque son muchas", "Porque es un error"], a: 0, why: "Antes de vocal, <i>le</i> y <i>la</i> pierden la vocal: <b>l'eau</b>." },
      { k: "sort", ask: "Clasifica.", q: "¿Masculino o femenino?", cats: ["Masculino (le, un)", "Femenino (la, une)"], items: [["le livre", 0], ["un café", 0], ["le stylo", 0], ["la table", 1], ["une pomme", 1], ["la porte", 1]], why: "Mira la palabrita de adelante: <i>le/un</i> = masculino; <i>la/une</i> = femenino." }
    ] });
  /* 11 · ¿cómo estás? */
  L.push({ id: "pp-ca-va", title: "Ça va ? ¿Cómo estás?", t: "registre", juego: "pb",
    theory: INTRO("Después de saludar, casi siempre se pregunta cómo estás. Así se hace:") +
      DIALOGO([["Léa", "Salut Tom ! Ça va ?", "¡Hola, Tom! ¿Qué tal?"], ["Tom", "Ça va bien, merci. Et toi ?", "Bien, gracias. ¿Y tú?"], ["Léa", "Très bien !", "¡Muy bien!"]]) +
      LISTA(P("Ça va ?", "sa VA", "¿Qué tal? / ¿Cómo estás?"), P("Ça va bien.", "sa va BIAN", "Estoy bien."), P("Très bien !", "tre BIAN", "¡Muy bien!"),
        P("Pas mal.", "pa MAL", "Nada mal."), P("Comme ci, comme ça.", "kom SI kom SA", "Más o menos.")) +
      TIP("<i>Ça va ?</i> es para amigos y compañeros. Con un profesor o una persona mayor se dice <i>Comment allez-vous ?</i> (ko-man ta-lé VU)."),
    items: [
      { k: "choice", ask: "Escucha y elige qué significa.", say: "Ça va ?", q: "¿Qué escuchaste?", o: ["¿Qué tal? / ¿Cómo estás?", "¿Qué es esto?", "¿Dónde está?"], a: 0, why: "<b>Ça va ?</b> = ¿qué tal?" },
      { k: "choice", ask: "Elige qué dirías.", q: "Te preguntan «Ça va ?» y estás muy feliz.", o: ["Très bien, merci !", "Au revoir !", "Pardon !"], a: 0, why: "<b>Très bien</b> = muy bien." },
      { k: "match", ask: "Une cada respuesta con lo que significa.", q: "Cómo estás", pairs: [["Ça va bien", "Estoy bien"], ["Pas mal", "Nada mal"], ["Comme ci, comme ça", "Más o menos"], ["Très bien", "Muy bien"]], why: "Cuatro formas de decir cómo estás." },
      { k: "order", ask: "Ordena la respuesta: «Bien, gracias. ¿Y tú?».", tokens: ["Ça va bien,", "merci.", "Et toi ?"], why: "<b>Ça va bien, merci. Et toi ?</b>" },
      { k: "choice", ask: "Escucha y elige qué significa.", say: "Comme ci, comme ça.", q: "¿Qué escuchaste?", o: ["Más o menos.", "Muy bien.", "Nada mal."], a: 0, why: "<b>Comme ci, comme ça</b> = más o menos." },
      { k: "choice", ask: "Elige.", q: "¿Con quién usas «Ça va ?»?", o: ["Con amigos y compañeros", "Solo con profesores"], a: 0, why: "<b>Ça va ?</b> es informal. Con un profesor: <i>Comment allez-vous ?</i>" }
    ] });
  /* 12 · frases de rescate */
  L.push({ id: "pp-rescate", title: "Frases de rescate", t: "registre", juego: "ff",
    theory: MZ("mz-gafas", "Estas frases te salvan cuando no entiendes algo. ¡Todo el mundo las usa al empezar!") +
      LISTA(P("Je ne comprends pas.", "ye ne kom-PRAN pa", "No entiendo."), P("Vous pouvez répéter ?", "vu pu-VÉ re-pe-TÉ", "¿Puede repetir?"),
        P("Plus lentement, s'il vous plaît.", "plü lant-MAN sil vu PLÉ", "Más despacio, por favor."), P("Je ne parle pas français.", "ye ne parl pa fran-SÉ", "No hablo francés."),
        P("Je parle espagnol.", "ye parl es-pa-ÑOL", "Hablo español."), P("Comment on dit « gato » en français ?", "ko-MAN on DÍ", "¿Cómo se dice «gato» en francés?")) +
      TIP("Para decir «no» en francés se ponen dos palabras alrededor de la acción: <b>ne</b> … <b>pas</b>. <i>Je ne comprends pas</i> = no entiendo."),
    items: [
      { k: "choice", ask: "Escucha y elige qué significa.", say: "Je ne comprends pas.", q: "¿Qué escuchaste?", o: ["No entiendo.", "No hablo.", "No sé."], a: 0, why: "<b>Je ne comprends pas</b> = no entiendo." },
      { k: "choice", ask: "Elige qué dirías.", q: "Alguien te habla muy rápido.", o: ["Plus lentement, s'il vous plaît.", "Bonne nuit !", "Enchanté !"], a: 0, why: "<b>Plus lentement, s'il vous plaît</b> = más despacio, por favor." },
      { k: "choice", ask: "Elige qué dirías.", q: "No entendiste y quieres que te lo digan otra vez.", o: ["Vous pouvez répéter ?", "Ça va ?", "Et toi ?"], a: 0, why: "<b>Vous pouvez répéter ?</b> = ¿puede repetir?" },
      { k: "match", ask: "Une cada frase con lo que significa.", q: "Frases de rescate", pairs: [["Je ne comprends pas", "No entiendo"], ["Je parle espagnol", "Hablo español"], ["Vous pouvez répéter ?", "¿Puede repetir?"], ["Plus lentement", "Más despacio"]], why: "Con estas cuatro frases puedes seguir una conversación aunque no entiendas todo." },
      { k: "order", ask: "Ordena: «Hablo español».", tokens: ["Je", "parle", "espagnol."], why: "<b>Je parle espagnol.</b> <i>Je</i> = yo; <i>parle</i> = hablo." },
      { k: "choice", ask: "Escucha y elige qué pregunta.", say: "Comment on dit « gato » en français ?", q: "¿Qué pregunta la persona?", o: ["¿Cómo se dice «gato» en francés?", "¿Dónde está el gato?", "¿Te gusta el gato?"], a: 0, why: "<b>Comment on dit… en français ?</b> = ¿cómo se dice… en francés?" },
      { k: "choice", ask: "Elige.", q: "Y entonces… ¿cómo se dice «gato» en francés?", o: ["chat", "chien", "cheval"], a: 0, why: "Gato = <b>chat</b> (sha), como Manzana. <i>chien</i> es perro y <i>cheval</i>, caballo." }
    ] });

  /* ---------------- el curso ---------------- */
  var U = function(title, ids){ return { title: title, lessons: ids.map(function(id){ return L.find(function(l){ return l.id === id; }); }) }; };
  var CURSO = {
    id: "pp", label: "Primeros pasos en francés", sem: "Inicio", semN: 0,
    desc: "Para empezar de cero, aunque nunca hayas estudiado un idioma: saludar, decir tu nombre, las letras y los sonidos, los números, los colores y frases para defenderte. Todo con audio, explicaciones muy sencillas y juegos guiados. Es la puerta de entrada a Francés A1.",
    course: [
      { id: "PP·1", title: "Tus primeras palabras", sub: "Saluda, sé amable y di cómo te llamas.", units: [U("Hola en francés", ["pp-hola", "pp-merci", "pp-prenom"])] },
      { id: "PP·2", title: "Cómo suena el francés", sub: "Las letras, los sonidos nuevos y las letras que no se dicen.", units: [U("Letras y sonidos", ["pp-alfabeto", "pp-sonidos", "pp-mudas"])] },
      { id: "PP·3", title: "Números y colores", sub: "Cuenta hasta 20, di tu edad y nombra los colores.", units: [U("Contar y describir", ["pp-numeros1", "pp-numeros2", "pp-colores"])] },
      { id: "PP·4", title: "Para defenderte", sub: "Tus primeras cosas, cómo estás y qué decir cuando no entiendes.", units: [U("Tus primeras conversaciones", ["pp-cosas", "pp-ca-va", "pp-rescate"])] }
    ]
  };
  TRACKS.unshift(CURSO);
  try { COURSE_IDS.add("pp"); } catch (e) {}
  var n = 0, nuevas = [];
  CURSO.course.forEach(function(s){ s.units.forEach(function(u){ u.lessons.forEach(function(l){
    l.track = "pp"; l.sec = s.id; l.unit = u.title; l.n = String(++n).padStart(2, "0"); nuevas.push(l);
    l.items.forEach(function(it, i){ it.t = it.t || l.t; ITEMS[l.id + ":" + i] = { it: it, l: l }; });
  }); }); });
  LESSONS.unshift.apply(LESSONS, nuevas);
  window.PLX_PP = { curso: CURSO, lecciones: nuevas };

  /* «Semestre Inicio» → «Antes de A1» en todas las pantallas que muestran el semestre */
  var cambia = function(raiz){
    var w = document.createTreeWalker(raiz || document.body, NodeFilter.SHOW_TEXT, { acceptNode: function(t){ return /Semestre Inicio/.test(t.nodeValue) ? 1 : 3; } }), x, todos = [];
    while ((x = w.nextNode())) todos.push(x);
    todos.forEach(function(t){ t.nodeValue = t.nodeValue.replace("Semestre Inicio de la Licenciatura", "Para empezar de cero, antes de A1").replace(/Semestre Inicio/g, "Antes de A1"); });
  };
  var pend = false;
  new MutationObserver(function(){ if (pend) return; pend = true; requestAnimationFrame(function(){ pend = false; cambia(); }); }).observe(document.body, { childList: true, subtree: true, characterData: true });

  /* juego guiado al final de cada lección del curso: sin reloj y más despacio (plx45 lo lee en alc.guiado) */
  if (window.PLXG && PLXG.alc) {
    var leccion = PLXG.alc.leccion;
    PLXG.alc.leccion = function(l){ var a = leccion(l); if (l.track === "pp") { a.guiado = true; a.sub = "Juego guiado · sin reloj"; } return a; };
  }

  /* invitación en el Inicio: quien está en A1 y todavía no ha hecho ninguna lección puede empezar por aquí */
  var invita = function(){
    try {
      if (view !== "parcours" || track !== "a1" || document.querySelector(".pp-inv")) return;
      var hecho = LESSONS.some(function(l){ return (l.track === "a1" || l.track === "pp") && S.lessons[l.id] && S.lessons[l.id].done; });
      if (hecho) return;
      var main = document.querySelector("#view .gmain"); if (!main) return;
      main.insertAdjacentHTML("afterbegin", '<button class="pp-inv" data-pp-empezar="1"><img src="img/mz-hola.webp" alt=""><span><small>¿Nunca has estudiado francés?</small><b>Empieza por «Primeros pasos»</b><span>Saludos, sonidos, números y colores, desde cero y con audio.</span></span><i aria-hidden="true">›</i></button>');
    } catch (e) {}
  };
  if (typeof render === "function") { var _r = render; render = function(){ var x = _r.apply(this, arguments); invita(); return x; }; }
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-pp-empezar]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    track = "pp"; try { localStorage.setItem("cr-track", "pp"); } catch (x) {}
    openLesson("pp-hola");
  }, true);

  var st = document.createElement("style"); st.id = "plx54";
  st.textContent = `
  .pp-inv{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:56px 1fr auto;gap:12px;align-items:center;width:100%;margin:0 0 14px;padding:12px 14px;border-radius:20px;background:#0B2D74;color:#fff;box-shadow:inset 0 0 0 1px rgba(147,197,253,.3)}
  .pp-inv img{width:56px;height:56px;object-fit:contain}
  .pp-inv>span{display:grid;gap:2px}
  .pp-inv small{font:700 11px/1.3 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#FFD200}
  .pp-inv b{font:800 17px/1.2 Poppins,system-ui,sans-serif;color:#fff}
  .pp-inv span span{font-size:13px;color:#DCE6FF}
  .pp-inv i{font:800 26px/1 Poppins,system-ui,sans-serif;font-style:normal;color:#FFD200}
  .pp-inv:focus-visible{outline:3px solid #FFD200;outline-offset:3px}
  .pp-intro{font-size:1.02rem;line-height:1.6}
  .pp-mz{display:flex;gap:14px;align-items:center;margin:0 0 16px;padding:12px 14px;border-radius:18px;background:var(--wash,#EAF1FF)}
  .pp-mz img{width:72px;height:72px;object-fit:contain;flex:none}
  .pp-mz p{margin:0;font-weight:600;color:var(--ink)}
  .pp-lista{display:grid;gap:8px;margin:14px 0}
  .pp-p{display:grid;grid-template-columns:44px 1fr;grid-template-rows:auto auto;column-gap:12px;align-items:center;padding:10px 12px;border-radius:16px;background:var(--raise,#fff);box-shadow:inset 0 0 0 1px var(--line,#DDE3EE)}
  .pp-o{grid-row:1/3;width:44px!important;height:44px!important;min-height:44px!important;padding:0!important;border-radius:50%!important;display:grid!important;place-items:center;background:#1E5BD7!important;color:#fff!important;border:0!important}
  .pp-o svg{width:20px;height:20px}
  .pp-o.sm{width:36px!important;height:36px!important;min-height:36px!important}
  .pp-w{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px}
  .pp-w b{font:700 1.15rem/1.2 Poppins,system-ui,sans-serif;color:var(--ink)}
  .pp-w small{font-size:.82rem;color:var(--stone,#5B6B8C)}
  .pp-es{color:var(--ink-2,#334);font-size:.95rem;display:flex;align-items:center;gap:8px}
  .pp-sw{display:inline-block;width:22px;height:22px;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25);flex:none}
  .pp-tip{margin:12px 0;padding:12px 14px;border-radius:14px;background:rgba(255,210,0,.16);box-shadow:inset 3px 0 0 #FFD200;line-height:1.55}
  .pp-tip b:first-child{display:block;font:800 .72rem/1.4 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8A6D00;margin-bottom:2px}
  :root[data-theme=dark] .pp-tip b:first-child{color:#FFD866}
  .pp-abc{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px;margin:14px 0}
  .pp-l,.pp-n{all:unset;box-sizing:border-box;cursor:pointer;display:grid;justify-items:center;gap:2px;padding:10px 4px;border-radius:14px;background:var(--raise,#fff);box-shadow:inset 0 0 0 1px var(--line,#DDE3EE);min-height:64px}
  .pp-l:hover,.pp-n:hover{box-shadow:inset 0 0 0 2px #1E5BD7}
  .pp-l:focus-visible,.pp-n:focus-visible,.pp-o:focus-visible{outline:3px solid #93C5FD;outline-offset:2px}
  .pp-l b{font:800 1.5rem/1 Poppins,system-ui,sans-serif;color:var(--ink)}
  .pp-l small,.pp-n small{font-size:.75rem;color:var(--stone,#5B6B8C)}
  .pp-num{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px;margin:14px 0}
  .pp-n b{font:800 1.6rem/1 Poppins,system-ui,sans-serif;color:#1E5BD7}
  :root[data-theme=dark] .pp-n b{color:#93C5FD}
  .pp-n span{font-weight:700;color:var(--ink)}
  .pp-dia{display:grid;gap:8px;margin:14px 0;padding:12px;border-radius:16px;background:var(--wash,#EAF1FF)}
  .pp-dia p{margin:0;display:grid;grid-template-columns:auto 36px 1fr;grid-template-rows:auto auto;column-gap:10px;align-items:center}
  .pp-dia .pp-q{grid-row:1/3;font:800 .75rem/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--stone,#5B6B8C);min-width:36px}
  .pp-dia .pp-o{grid-row:1/3}
  .pp-dia b{color:var(--ink)}
  .pp-dia small{grid-column:3;color:var(--stone,#5B6B8C)}
  .pp-tabla{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}
  .pp-tabla div{display:grid;justify-items:center;padding:12px 4px;border-radius:14px;background:var(--raise,#fff);box-shadow:inset 0 0 0 1px var(--line,#DDE3EE)}
  .pp-tabla b{font:800 1.4rem/1 Poppins,system-ui,sans-serif;color:#1E5BD7}
  :root[data-theme=dark] .pp-tabla b{color:#93C5FD}
  .pp-tabla span{font-size:.85rem;color:var(--stone,#5B6B8C)}
  `;
  document.head.appendChild(st);
  try { if (typeof render === "function") render(); } catch (e) {}
})();
