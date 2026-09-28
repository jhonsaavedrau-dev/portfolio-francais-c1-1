/* PLEX PLAY 1.25.0 — Audio Hunt (motor «Escucha»)
   - Suena una palabra o una frase en francés y aparecen de 3 a 5 tarjetas: hay que tocar la que
     corresponde a lo que sonó antes de que se acabe el tiempo del reto.
   - Vocabulario (tema): suena la palabra francesa y las tarjetas muestran significados en español
     (comprensión, no reconocimiento visual). Los distractores son otros significados del mismo tema,
     sin sinónimos, sin significados que contengan al correcto y sin palabras francesas que suenen igual.
   - Lecciones: de los «choice» y «fill» cuya frase completa se puede armar, suena la FRASE COMPLETA y las
     tarjetas muestran las opciones de la palabra que faltaba. La frase escrita con el hueco es la pista.
     Filtro de sonido: una clave fonética aproximada del francés y una lista de homófonos. Si una opción
     propia del ejercicio suena igual o casi igual que la correcta, el reto se descarta (era un ejercicio de
     ortografía, no de oído); los distractores de relleno que suenan igual se quitan uno por uno.
   - Los dictados («listen») quedan fuera: no traen traducción y no hay con qué armar opciones válidas.
   - «Escuchar otra vez» y «Más despacio» repiten el audio: cada repetición resta rapidez (puntos), no vida.
   - Una tarjeta equivocada rompe el combo y queda marcada; la segunda en el mismo reto es un error (vida,
     corrección y carnet). Si se acaba el tiempo, se muestra la respuesta sin quitar vida.
   - Todo el tiempo va por tick (la pausa lo congela). Teclado: 1 a 5 eligen, R repite, D más despacio. */
(function(){
  "use strict";
  var G = window.PLXG; if (!G || !G.sesion) return;
  var esc = G.esc, norm = G.norm, mezcla = G.mezcla, plano = G.plano;

  /* ---------------- clave fonética aproximada del francés ---------------- */
  /* alfabeto de las claves: a e(ə) ɛ(é/è) ø i u(=[y]) U(=[u]) o · A(an/en) I(in/un) O(on) · S(ch) j ñ w y el resto de consonantes */
  /* grupos de homófonos con su clave explícita («clave:formas») */
  var GRUPOS = [
    "a:a à as", "ɛ:et est es ai aie aies ait aient eh hé", "sO:son sont", "sɛ:ces ses sais sait c'est s'est", "sø:ce se ceux", "U:ou où août houx",
    "sA:sang cent cents sans s'en c'en sent", "vɛr:vers verre verres vert verts vair ver", "mɛr:mer mère mères maire maires", "O:on ont",
    "lør:leur leurs l'heure", "kɛl:quel quels quelle quelles qu'elle qu'elles", "la:la là l'a las", "pø:peu peut peux", "mɛ:mais mes met mets mai",
    "dA:dans dent dents d'en", "si:si s'y ci scie", "ni:ni n'y nid nie", "sa:sa ça", "tɛ:tes t'es thé", "ma:ma m'a mas", "ta:ta t'a tas",
    "lɛ:les l'ai lait laid l'est", "dɛ:des dé dès dés", "vwa:voie voies voix vois voit voient", "fwa:foi fois foie", "kUr:cour cours court courent",
    "kOt:compte comptes conte contes comte comtes comptent", "pI:pain pains pin pins peint", "fI:faim fin feint", "sI:sain saint sein seins",
    "ø:eux œufs", "kA:quand quant qu'en camp", "prɛ:près prêt prêts prés pré", "tA:tant temps t'en tend tends", "vI:vingt vin vins vain vint",
    "sur:sur sûr sûre sûrs", "du:du dû", "mur:mur mûr mûre", "kar:car quart", "Sɛr:cher chère chair chaire", "pɛr:père pair paire perd perds",
    "sɛt:cet cette sept set", "o:au aux eau eaux haut hauts oh ô", "mO:mon m'ont", "tO:ton thon t'ont", "mo:mot mots maux", "bO:bon bond",
    "A:en an ans", "I:un hein", "i:y i", "vi:vie vit vis", "di:dit dis", "li:lit lis lie", "nɛ:nez né née", "pri:prix pris prie", "swa:soi soit soient sois",
    "mwa:moi mois", "twa:toi toit", "pwa:pois poids", "sal:sale salle", "søl:seul seuls seule seules", "pwI:point points poing", "kU:cou coup coups coût",
    "fO:fond fonds font", "so:sot seau saut", "vA:vent vend vends", "ɛr:ère air aire", "sɛl:sel selle", "taS:tâche tache", "notr:notre nôtre", "votr:votre vôtre",
    "pluto:plutôt plus-tôt", "sAsɛ:censé sensé", "otɛl:hôtel autel", "parskø:parce-que par-ce-que", "kwakø:quoique quoi-que", "kɛlkø:quelque quel-que quelle-que",
    "davAtaj:davantage d'avantage", "pøtɛtr:peut-être", "kɛlkøfwa:quelquefois quelques-fois", "ɛt:êtes", "ɛtr:être", "ki:qui qu'il qu'ils", "kø:que queue",
    /* formas de adjetivo ante vocal que suenan como el femenino (un vieil homme / une vieille femme) y grafías que la clave no iguala */
    "vjɛj:vieil vieille vieilles", "nUvɛl:nouvel nouvelle nouvelles", "bɛl:bel belle belles", "mol:mol molle molles", "fol:fol folle folles", "kør:cœur cœurs chœur chœurs"
  ];
  var HOMO = {};
  GRUPOS.forEach(function(g){ var p = g.split(":"); p[1].split(" ").forEach(function(w){ HOMO[w.replace(/-/g, " ")] = p[0]; }); });
  var MULTI = Object.keys(HOMO).filter(function(w){ return / /.test(w); });
  var ELID = { c: "s", qu: "k", j: "j", l: "l", d: "d", m: "m", t: "t", s: "s", n: "n", jusqu: "jusk", lorsqu: "lorsk", puisqu: "puisk", quoiqu: "kwak" };

  /* una palabra (sin apóstrofos) → sonido aproximado. verbal: «-ent» final mudo (ils parlent, ils jouent, ils étudient) */
  var sonido = function(w, verbal){
    if (!w) return "";
    if (HOMO[w]) return HOMO[w];
    var x = w, y;
    /* terminaciones que suenan [e]/[ɛ]: é, ée, és, ées, ez, er, ai, ais, ait, aient, et */
    if (x.length > 2 && /(aient|ais|ait|ai)$/.test(x)) x = x.replace(/(aient|ais|ait|ai)$/, "ɛ");
    else if (/(ées|ée|és|é|ez)$/.test(x)) x = x.replace(/(ées|ée|és|é|ez)$/, "ɛ");
    else if (x.length >= 5 && /er$/.test(x)) x = x.replace(/er$/, "ɛ");
    else if (x.length >= 4 && /et$/.test(x)) x = x.replace(/et$/, "ɛ");
    else if (verbal && x.length >= 5 && /ent$/.test(x)) x = x.slice(0, -3);
    else {
      /* consonantes finales mudas: s, x, z y luego t, d, p, g */
      y = x.replace(/[sxz]+$/, ""); if (y !== x && /[aeiouyàâéèêëîïôûùœ]/.test(y)) x = y;
      if (!/e$/.test(x)) { y = x.replace(/[tdpg]+$/, ""); if (y !== x && /[aeiouyàâéèêëîïôûùœ]/.test(y)) x = y; }
    }
    /* e final muda (la consonante de antes sí suena: «une», «bonne») */
    if (/e$/.test(x) && /[aeiouyàâéèêëîïôûùœɛ]/.test(x.slice(0, -1))) { x = x.slice(0, -1); x = x.replace(/n+$/, "N").replace(/m+$/, "M"); }
    x = x.replace(/ph/g, "f").replace(/th/g, "t").replace(/sch/g, "S").replace(/ch/g, "S").replace(/gn/g, "ñ").replace(/qu/g, "k")
      .replace(/gu(?=[eiyéèêëîï])/g, "g").replace(/ç/g, "s").replace(/c(?=[eiyéèêëîïɛ])/g, "s").replace(/ck/g, "k").replace(/c/g, "k")
      .replace(/ge(?=[aoâôu])/g, "j").replace(/g(?=[eiyéèêëîïɛ])/g, "j").replace(/h/g, "").replace(/x/g, "ks")
      .replace(/([aeouɛ])ill/g, "$1j").replace(/ill/g, "ij")
      .replace(/eau/g, "o").replace(/au/g, "o").replace(/[ôö]/g, "o").replace(/o[iî]/g, "wa").replace(/o[uùû]/g, "U").replace(/œu|eu|œ/g, "ø")
      .replace(/a[iî]|ei|[éèêë]/g, "ɛ").replace(/ien(?![aeiouyɛøU]|n)/g, "jI")
      /* e ante consonante doble, ante grupo (r, l, s…) o ante consonante final suena [ɛ]: «dessert», «merci», «sel» (no ante n/m: «vent») */
      .replace(/e(?=([bcdfgjklpqrstvzS])0001)/g, "ɛ").replace(/e(?=[rlsctfpkx][bcdfgjklpqrstvzS])/g, "ɛ").replace(/e(?=[bcdfgjklpqrstvz]$)/, "ɛ");
    x = x.replace(/wa[nm](?![aeiouyɛøU]|[nm])/g, "wI").replace(/[iyuɛ][nm](?![aeiouyɛøU]|[nm])/g, "I").replace(/o[nm](?![aeiouyɛøU]|[nm])/g, "O")
      .replace(/[ae][nm](?![aeiouyɛøU]|[nm])/g, "A")
      .replace(/[àâä]/g, "a").replace(/[îïÿy]/g, "i").replace(/[ùûü]/g, "u");
    x = x.replace(/([aeiouɛøUAIO])s(?=[aeiouɛøU])/g, "$1z").replace(/(.)\1+/g, "$1").replace(/N/g, "n").replace(/M/g, "m");
    return x;
  };
  var limpiaFr = function(t){ return norm(t).replace(/[’`]/g, "'").replace(/[.,!?;:«»"()—–…-]/g, " ").replace(/\s+/g, " ").trim(); };
  /* frase → lista de claves por palabra (liaison ignorada) */
  var clavesPal = function(t, verbal){
    var s = " " + limpiaFr(t) + " ";
    MULTI.forEach(function(m){ s = s.split(" " + m + " ").join(" #" + m.replace(/ /g, "~") + " "); });
    var out = [];
    s.trim().split(" ").forEach(function(tok){
      if (!tok) return;
      if (tok.charAt(0) === "#") { out.push(HOMO[tok.slice(1).replace(/~/g, " ")]); return; }
      if (HOMO[tok]) { out.push(HOMO[tok]); return; }
      var partes = tok.split("'").filter(Boolean);
      partes.forEach(function(p, i){ out.push(i < partes.length - 1 ? ELID[p] || sonido(p, verbal) : sonido(p, verbal)); });
    });
    return out;
  };
  var claves = function(t){ var a = clavesPal(t, false).join(""), b = clavesPal(t, true).join(""); return a === b ? [a] : [a, b]; };
  /* distancia de edición con pesos: cambiar una vocal por otra muy distinta cuesta 2 («avons» / «avez» se
     distinguen); vocales cercanas (é/è/eu, u/ou, an/on, an/in, o/on, a/an, è/in), consonantes sordas/sonoras,
     y poner o quitar un sonido cuestan 1 */
  var VOCALES = "aeiouɛøUAIO";
  var CERCA = ["eɛ", "eø", "ɛø", "uU", "AO", "AI", "oO", "aA", "ɛI"], PARES = ["pb", "td", "kg", "fv", "sz", "Sj"];
  var costo = function(a, b){
    if (a === b) return 0;
    var va = VOCALES.indexOf(a) >= 0, vb = VOCALES.indexOf(b) >= 0, ab = a + b, ba = b + a;
    if (va && vb) return CERCA.indexOf(ab) >= 0 || CERCA.indexOf(ba) >= 0 ? 1 : 2;
    if (!va && !vb) return PARES.indexOf(ab) >= 0 || PARES.indexOf(ba) >= 0 ? 1 : 2;
    return 2;
  };
  var lev = function(a, b){
    var p = [], i, j; for (j = 0; j <= b.length; j++) p[j] = j;
    for (i = 1; i <= a.length; i++) { var d = p[0], t; p[0] = i; for (j = 1; j <= b.length; j++) { t = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, d + costo(a[i - 1], b[j - 1])); d = t; } }
    return p[b.length];
  };
  /* suenan igual o casi igual: claves iguales; una consonante de enlace delante (liaison: «projet est» /
     «projet t'es»); o a distancia ≤ 1 si las dos claves tienen 3 sonidos o más (con 1 o 2 sonidos, un
     cambio es la palabra entera: «en» / «y», «le» / «la» se distinguen) */
  var ENLACE = "tzn";
  var cerca = function(x, y){
    if (x === y) return true;
    if ((ENLACE.indexOf(x.charAt(0)) >= 0 && x.slice(1) === y) || (ENLACE.indexOf(y.charAt(0)) >= 0 && y.slice(1) === x)) return true;
    return Math.min(x.length, y.length) >= 3 && lev(x, y) <= 1;
  };
  var suenaIgual = function(a, b){
    if (norm(a) === norm(b)) return true;
    var ka = claves(a), kb = claves(b);
    return ka.some(function(x){ return kb.some(function(y){ return cerca(x, y); }); });
  };
  G.suenaIgualFr = suenaIgual;   /* para las pruebas y para otros motores de escucha */

  /* ---------------- retos de lecciones: suena la frase completa ---------------- */
  var itemDe = function(key){ try { return key && ITEMS[key] ? ITEMS[key].it : null; } catch (e) { return null; } };
  /* opción de tarjeta: solo letras (sin cifras, sin mayúsculas de acento tónico como «paRIS», sin elisiones
     sueltas como «l'» y sin palabras en español como «muda») */
  var opcionOk = function(w){
    w = String(w || "").trim();
    return /^[\p{L}'’ -]{1,28}$/u.test(w) && /\p{L}/u.test(w) && !/\p{Ll}\p{Lu}/u.test(w) && !/['’]$/.test(w) && !/[áíóúñ]/i.test(w) && !/^[IVXLCDM]+(e|er|re|ème)?$/.test(w) &&
      !/^(muda|mudo|sílaba|sí|no|dos|tres|uno|una|o)$/i.test(w);
  };
  /* la frase tiene que estar en francés (Fonética trae enunciados en español) y poder leerse en voz alta */
  var ES = /[¿¡ñ]|\b(hay|sílabas?|palabras?|frase|cuánt[oa]s?|cuál|qué|cómo|dónde|sonidos?|letras?|vocal(es)?|acento|pronuncia\w*|significa|número|escribe|se dice|español|verbo|pronombre)\b/i;
  var fraseOk = function(f){ return f && f.length <= 110 && !ES.test(f) && !/[=\[\]\/→<>ɑɔəʁʃʒɥɲŋ]/.test(f) && !/_{2,}/.test(f); };
  /* elisión que falta al completar el hueco («Je en propose», «que il isole», «si il»): la frase no se lee ni se
     muestra hasta que la complete bien el núcleo; ante la duda (h aspirada, «le onze») el reto también se descarta */
  var SIN_ELISION = /(^|[^\p{L}'’])(je|me|te|se|le|la|ne|de|que|ce|jusque|lorsque|puisque)\s+[aeiouyàâäéèêëîïôöûùüœh]|(^|[^\p{L}'’])si\s+ils?(?!\p{L})/iu;
  var pistaDe = function(q){
    var t = plano(q || "").replace(/\s*\([^()]{1,40}\)\s*\.?\s*$/, function(m){ return /\.\s*$/.test(m) ? "." : ""; });
    return t.replace(/\s+([,.])/g, "$1");
  };
  var aOido = function(r){
    if (!r || r.tipo !== "uno") return null;
    var it = itemDe(r.key); if (!it || (it.k !== "choice" && it.k !== "fill")) return null;
    var ok = r.correcta[0]; if (!opcionOk(ok)) return null;
    var frase = G.completa(r.q, ok); if (!fraseOk(frase)) return null;
    var pista = pistaDe(r.q); if (!/_{2,}/.test(pista) || ES.test(pista)) return null;
    /* la frase que suena y la que se ve al revelar (pista + respuesta) tienen que traer sus elisiones */
    if (SIN_ELISION.test(frase) || SIN_ELISION.test(pista.replace(/_{2,}/, ok))) return null;
    /* una opción propia del ejercicio que suena como la correcta: era de ortografía, no de oído */
    var propias = it.k === "choice" && it.o ? it.o.filter(function(_, i){ return i !== it.a; }) : [];
    if (propias.some(function(m){ return suenaIgual(ok, m); })) return null;
    /* lo que se oye en la frase completa (la respuesta incluida): una tarjeta que suena como un trozo de la
       frase también «se oyó» («couchée» en «me coucher», «la» en «de la») */
    var kf = [clavesPal(frase, false), clavesPal(frase, true)];
    var seOye = function(m){
      return [clavesPal(m, false), clavesPal(m, true)].some(function(km){
        var n = km.length, j = km.join("");
        return kf.some(function(kr){ for (var i = 0; i + n <= kr.length; i++) { if (cerca(kr.slice(i, i + n).join(""), j)) return true; } return false; });
      });
    };
    var malas = [];
    r.malas.forEach(function(m){
      if (!opcionOk(m) || suenaIgual(ok, m) || seOye(m)) return;
      if (malas.some(function(x){ return suenaIgual(x, m); })) return;   /* dos tarjetas que suenan igual se descartan solas */
      malas.push(m);
    });
    if (malas.length < 2) return null;
    return { tipo: "oido", modo: "frase", ask: "¿Qué palabra oíste?", q: pista, audio: frase, correcta: [ok], malas: malas,
      why: r.why || "", hab: r.hab, key: r.key, lessonId: r.lessonId, oro: r.oro };
  };
  var retosLec = function(base){
    var out = [], vistos = {};
    base.forEach(function(r){
      var x = aOido(r); if (!x) return;
      var k = norm(x.audio); if (vistos[k]) return; vistos[k] = 1;
      out.push(x);
    });
    return out;
  };

  /* ---------------- retos de vocabulario: suena la palabra, se elige el significado ---------------- */
  var STOP = " el la los las lo un una unos unas de del al a en y e o u que se por para con sin su sus mi mis tu tus no ni es muy mas algo alguien formal informal familiar coloquial etc ";
  var sinTilde = function(s){ return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); };
  /* lo que va en la tarjeta: sin aclaraciones entre paréntesis, salvo las de uso («aunque (+ subjuntivo)») */
  var significado = function(es){
    var t = String(es || "").replace(/\((?!\s*\+)[^()]*\)/g, " ").replace(/[«»"]/g, "").replace(/\s+/g, " ").replace(/\s+([,;])/g, "$1").replace(/[\s,;:.]+$/, "").trim();
    if (t.length > 38) t = t.split(";")[0].trim();
    while (t.length > 38 && /,/.test(t)) t = t.replace(/,[^,]*$/, "").trim();
    return t.length >= 2 && t.length <= 38 ? t : "";
  };
  /* familias de significados que se confunden (sinónimos o casi): dos tarjetas de la misma familia no van juntas */
  var FAMILIAS = [
    "opinion|me parece|pienso|creo que|considero|a mi juicio|punto de vista",
    "sin embargo|no obstante|en cambio|mientras que|aun asi|de todos modos|ahora bien|por el contrario|a la inversa|pero",
    "aunque|a pesar de|por mas que|pese a|no obstante|aun asi",
    "ya que|puesto que|porque|pues|dado que|en la medida en que|como|debido a|a causa de|gracias a|por culpa de",
    "por eso|por lo tanto|por consiguiente|asi que|de modo que|de manera que|entonces|en consecuencia|luego",
    "probable|probablemente|seguramente|puede que|probabilidad|al parecer|quiza|quizas|tal vez|posible|posiblemente|sin duda",
    "afirmar|sostener|asegurar|declarar|aseverar",
    "subrayar|resaltar|destacar|evidencia|enfatizar|recalcar",
    "demostrar|mostrar|probar|evidencia",
    "constatar|constatacion|comprobar|observar|notar",
    "cuestionar|poner en duda|preguntarse|interrogarse|dudar",
    "admitir|reconocer", "precisar|especificar|aclarar",
    "dicho de otro modo|es decir|en otras palabras|o sea|dicho de otra manera",
    "en suma|en resumen|resumen|en conclusion|en sintesis|sintesis",
    "desear|ganas|querer|gustaria|encantaria", "miedo|preocupar|preocuparse|inquietar|temer|temor",
    "en realidad|realmente|de verdad|de hecho|en efecto", "por suerte|afortunadamente",
    "estres|agotamiento|cansancio", "primero|en primer lugar|primero que todo|para empezar|ante todo",
    "por fin|por ultimo|finalmente|al final|en conclusion", "ademas|por otra parte|tambien|asimismo",
    "para que|a fin de|para", "enfoque|procedimiento|metodo", "encuesta|sondeo",
    "trabajo|trabajar|empleo|chamba|camellar", "hola|buenos dias|saludo"
  ].map(function(f){ return f.split("|"); });
  var palabrasEs = function(t){ return sinTilde(String(t || "").replace(/\([^()]*\)/g, " ")).replace(/[^a-z]+/g, " ").trim(); };
  var familias = function(t){ var n = " " + palabrasEs(t) + " ", o = {}; FAMILIAS.forEach(function(f, i){ if (f.some(function(w){ return n.indexOf(" " + w + " ") >= 0; })) o[i] = 1; }); return o; };
  var alternativas = function(t){ return sinTilde(String(t || "").replace(/\([^()]*\)/g, " ")).split(/[,;]/).map(function(a){ return a.replace(/[^a-z]+/g, " ").trim().split(" ").filter(Boolean); }).filter(function(a){ return a.length; }); };
  /* raíz aproximada: «trabajar» y «trabajo», «padres» y «padre» comparten raíz */
  var raizEs = function(w){ w = w.replace(/s$/, ""); var r = w.replace(/(mente|cion|ado|ada|ido|ida|ar|er|ir|o|a|e)$/, ""); return r.length >= 4 ? r : w; };
  var raices = function(t){ var o = {}; palabrasEs(t).split(" ").forEach(function(w){ if (w.length >= 3 && STOP.indexOf(" " + w + " ") < 0) o[raizEs(w)] = 1; }); return o; };
  var parecidoEs = function(a, b){
    if (palabrasEs(a) === palabrasEs(b)) return true;
    /* una alternativa contenida en la otra («para» / «para que», «el verso» / «el verso libre») */
    var aa = alternativas(a), ab = alternativas(b), dentro = function(x, y){ return x.every(function(w){ return y.indexOf(w) >= 0; }); };
    if (aa.some(function(x){ return ab.some(function(y){ return dentro(x, y) || dentro(y, x); }); })) return true;
    var ra = raices(a), rb = raices(b); if (Object.keys(ra).some(function(w){ return rb[w]; })) return true;
    var fa = familias(a), fb = familias(b); return Object.keys(fa).some(function(i){ return fb[i]; });
  };
  var retosVoc = function(tema, nivel){
    var its = (tema.i || []).filter(function(x){ return x && x.fr && x.es && significado(x.es); });
    var out = [];
    its.forEach(function(x){
      var sig = significado(x.es);
      var cand = its.filter(function(y){
        if (y === x || norm(y.fr) === norm(x.fr)) return false;
        if (parecidoEs(x.es, y.es) || parecidoEs(sig, significado(y.es))) return false;   /* sinónimos o contenidos */
        return !suenaIgual(x.fr, y.fr);                                                  /* palabras que suenan igual */
      });
      /* primero los de la misma categoría gramatical (más difíciles) */
      var mismas = mezcla(cand.filter(function(y){ return x.g && y.g === x.g; })), otras = mezcla(cand.filter(function(y){ return !(x.g && y.g === x.g); }));
      var malas = [], vistos = {};
      (nivel > 0 ? mismas.concat(otras) : mezcla(cand)).forEach(function(y){
        var s = significado(y.es), k = sinTilde(s); if (vistos[k] || malas.some(function(m){ return parecidoEs(m, s); })) return;
        vistos[k] = 1; malas.push(s);
      });
      if (malas.length < 2) return;
      out.push({ tipo: "oido", modo: "voc", ask: "¿Qué significa la palabra que oíste?", q: "", audio: x.fr, correcta: [sig], malas: malas.slice(0, 5),
        why: "<b>" + esc(x.fr) + "</b> = " + esc(x.es) + (x.ex ? "<br><i>" + esc(x.ex) + "</i>" + (x.exes ? " · " + esc(x.exes) : "") : ""),
        hab: "vocab", key: null, lessonId: "", voc: x });
    });
    return out;
  };

  /* ---------------- motor ---------------- */
  var ICONO = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z"/><path d="M13 7a4 4 0 0 1 0 6M15.5 4.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var LENTO = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 5.8V10l2.8 1.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var ONDA = '<span class="ah-onda" aria-hidden="true">' + [6, 12, 20, 10, 26, 14, 8].map(function(h, i){ return '<i style="--h:' + h + 'px;--k:' + i + '"></i>'; }).join("") + "</span>";
  var suena = function(texto, vel){
    try { var p = vel ? speak(texto, vel) : speak(texto); if (p && typeof p.catch === "function") p.catch(function(){}); } catch (e) {}
  };
  /* corta la voz: el mp3 del mapa AUDIO (stopAudio pausa el reproductor de la app; subir playToken anula una
     reproducción que aún estaba cargando) y la síntesis de voz */
  var callaVoz = function(){
    try { if (typeof stopAudio === "function") stopAudio(); } catch (e) {}
    try { if (typeof playToken === "number") playToken++; } catch (e) {}
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
  };

  function motorOido(zona, s){
    var reto = null, cartas = [], malos = 0, rep = 0, T = 0, t = 0, hecho = false, revela = false, cierre = -1, pulso = 0;
    var queda = 0, lentoUlt = false, cortado = false;   /* segundos que le quedan al audio (aprox.): si la pausa lo corta, suena otra vez al seguir */
    zona.innerHTML = '<div class="ah"><div class="ah-reloj" aria-hidden="true"><i></i></div>' +
      '<div class="ah-oido"><button type="button" class="ah-oir" data-ah-oir aria-label="Escuchar otra vez">' + ONDA + '<span class="ah-disco">' + ICONO + "</span>" + ONDA + "<b>Escuchar otra vez</b></button>" +
      '<button type="button" class="ah-lento" data-ah-lento aria-label="Escuchar más despacio">' + LENTO + "<span>Más despacio</span></button>" +
      '<p class="ah-nota" aria-live="polite"></p></div>' +
      '<div class="ah-cartas" role="group" aria-label="Tarjetas"></div></div>';
    s.el.classList.add("ah-on");
    var raiz = zona.querySelector(".ah"), reloj = zona.querySelector(".ah-reloj i"), mazo = zona.querySelector(".ah-cartas"), nota = zona.querySelector(".ah-nota"), oidoEl = zona.querySelector(".ah-oido");

    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 10) + "px"; };
    var banner = function(){
      var q = "";
      if (reto.modo === "frase") {
        var partes = esc(reto.q).split(/_{2,}/);
        q = partes[0] + (revela ? '<span class="ah-ok">' + esc(reto.correcta[0]) + "</span>" : '<span class="hueco">___</span>') + partes.slice(1).join("");
        q = '<p class="plxg-q ah-frase" lang="fr">' + q + "</p>";
      } else if (revela) q = '<p class="plxg-q" lang="fr"><span class="ah-ok">' + esc(reto.audio) + "</span></p>";
      s.banner('<p class="plxg-ask">' + esc(reto.ask) + "</p>" + q, { oro: reto.oro });
      coloca();
    };
    var pinta = function(){
      mazo.classList.toggle("impar", cartas.length % 2 === 1);
      /* una sola columna solo con 3 tarjetas largas; con 4 o 5, dos columnas (el texto se parte) para que quepan */
      mazo.classList.toggle("largas", cartas.length <= 3 && cartas.some(function(c){ return c.t.length > 24; }));
      mazo.innerHTML = cartas.map(function(c, i){
        var cl = "ah-c" + (c.mal ? " ah-mal" : "") + (c.ok && revela ? " ah-bien" : "");
        return '<button type="button" class="' + cl + '" data-ah-i="' + i + '" lang="' + (reto.modo === "voc" ? "es" : "fr") + '"' + (c.mal ? ' disabled aria-disabled="true"' : "") + ">" +
          '<small aria-hidden="true">' + (i + 1) + "</small><span>" + esc(c.t) + "</span></button>";
      }).join("");
    };
    var escucha = function(lento){
      if (!reto) return;
      suena(reto.audio, lento ? .7 : 0);
      queda = (.8 + .075 * reto.audio.length) * (lento ? 1.45 : 1); lentoUlt = !!lento;
      if (!s.mov) { pulso = Math.min(4, 1 + .07 * reto.audio.length) * (lento ? 1.4 : 1); oidoEl.classList.add("ah-suena"); }
    };
    var repite = function(lento){
      if (!reto || hecho || s.estado() !== "juega") return;
      G.despiertaAudio(); rep++;
      nota.textContent = rep === 1 ? "Repetiste 1 vez: esta respuesta vale menos puntos." : "Repetiste " + rep + " veces: esta respuesta vale menos puntos.";
      escucha(lento);
    };

    var jugar = function(r){
      reto = r; malos = 0; rep = 0; t = 0; hecho = false; revela = false; cierre = -1; cortado = false;
      var n = Math.max(3, Math.min(5, s.dir.opciones(), 1 + r.malas.length));
      cartas = mezcla([{ t: r.correcta[0], ok: true }].concat(r.malas.slice(0, n - 1).map(function(m){ return { t: m, ok: false }; })));
      T = r.modo === "voc" ? s.dir.t() * 1.6 + 2.5 : s.dir.t() * 1.5 + 2 + .06 * r.audio.length;
      nota.textContent = "";
      raiz.classList.remove("ah-listo");
      reloj.style.transform = "scaleX(1)"; reloj.parentNode.classList.remove("poco");
      banner(); pinta();
      escucha(false);
    };
    var centro = function(el){ var a = el.getBoundingClientRect(), b = zona.getBoundingClientRect(); return { x: a.left - b.left + a.width / 2, y: a.top - b.top }; };
    var elige = function(i, el){
      if (!reto || hecho || s.estado() !== "juega") return;
      var c = cartas[i]; if (!c || c.mal) return;
      G.despiertaAudio();
      var p = el ? centro(el) : { x: zona.clientWidth / 2, y: zona.clientHeight / 2 };
      if (c.ok) {
        hecho = true; revela = true; cierre = .7;
        s.acierto(reto, { rapidez: Math.max(0, 1 - t / T - .25 * rep), x: p.x, y: p.y, final: true });
        raiz.classList.add("ah-listo");
        banner(); pinta();
        return;
      }
      malos++; c.mal = true;
      if (malos < 2) { s.penaliza(p.x, p.y); G.vibra(40); pinta(); return; }
      hecho = true; revela = true; raiz.classList.add("ah-listo"); banner(); pinta();
      var sono = reto.modo === "voc" ? "Sonó: " + reto.audio : "Sonó: «" + reto.audio + "»";
      s.fallo(reto, { mal: c.t, etMal: "Tocaste", etiqueta: reto.modo === "voc" ? "Significa" : "Se oye", bien: reto.correcta[0], q: sono,
        why: reto.modo === "voc" ? reto.why : "<i>" + esc(reto.audio) + "</i>" + (reto.why ? "<br>" + reto.why : "") })
        .then(function(){ limpia(); s.listo(); });
    };
    var limpia = function(){ reto = null; cartas = []; mazo.innerHTML = ""; nota.textContent = ""; raiz.classList.remove("ah-listo"); reloj.style.transform = "scaleX(1)"; };

    /* ---- entrada: tocar las tarjetas y los botones de audio ---- */
    var clic = function(e){
      var b = e.target.closest && e.target.closest("button"); if (!b || !zona.contains(b)) return;
      if (b.hasAttribute("data-ah-oir")) { e.preventDefault(); repite(false); return; }
      if (b.hasAttribute("data-ah-lento")) { e.preventDefault(); repite(true); return; }
      if (b.hasAttribute("data-ah-i")) { e.preventDefault(); elige(+b.getAttribute("data-ah-i"), b); }
    };
    zona.addEventListener("click", clic);
    window.addEventListener("resize", coloca);

    return {
      jugar: jugar,
      tick: function(dt){
        if (pulso > 0) { pulso -= dt || 0; if (pulso <= 0) oidoEl.classList.remove("ah-suena"); }
        if (queda > 0) queda -= dt || 0;
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) { limpia(); s.listo(); } return; }
        if (hecho || !dt) return;
        t += dt;
        reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        reloj.parentNode.classList.toggle("poco", t / T > .75);
        if (t >= T) {
          hecho = true; revela = true; raiz.classList.add("ah-listo"); banner(); pinta();
          s.escapa(reto, { titulo: "Se acabó el tiempo", etiqueta: reto.modo === "voc" ? "Significa" : "Se oye", bien: reto.correcta[0],
            q: reto.modo === "voc" ? "Sonó: " + reto.audio : "Sonó: «" + reto.audio + "»",
            why: reto.modo === "voc" ? reto.why : "<i>" + esc(reto.audio) + "</i>" + (reto.why ? "<br>" + reto.why : "") })
            .then(function(){ limpia(); s.listo(); });
        }
      },
      tecla: function(e){
        if (/^[1-5]$/.test(e.key)) { var b = mazo.querySelectorAll(".ah-c")[+e.key - 1]; if (b) { e.preventDefault(); elige(+b.getAttribute("data-ah-i"), b); } return; }
        if (e.key === "r" || e.key === "R") { e.preventDefault(); repite(false); }
        else if (e.key === "d" || e.key === "D") { e.preventDefault(); repite(true); }
      },
      /* en pausa se ocultan las tarjetas y se corta el audio: la pausa no sirve para pensar sin reloj.
         Si el audio se cortó a medias, al seguir suena otra vez (sin contar como repetición) */
      pausa: function(){ cortado = !!(reto && !hecho && queda > 0); queda = 0; callaVoz(); pulso = 0; oidoEl.classList.remove("ah-suena"); raiz.classList.add("ah-pausa"); },
      sigue: function(){ raiz.classList.remove("ah-pausa"); if (cortado && reto && !hecho) escucha(lentoUlt); cortado = false; },
      destruye: function(){
        zona.removeEventListener("click", clic); window.removeEventListener("resize", coloca);
        s.el.classList.remove("ah-on"); cortado = false; queda = 0; callaVoz();
      },
      depura: function(){
        var pos = function(el){ var r = el.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) }; };
        return { reto: reto && { tipo: reto.tipo, modo: reto.modo, correcta: reto.correcta, q: reto.q, audio: reto.audio }, hecho: hecho, cerrado: hecho, t: t, T: T, rep: rep, malos: malos, queda: queda, cortado: cortado,
          tarjetas: [].map.call(mazo.querySelectorAll(".ah-c"), function(b){ var i = +b.getAttribute("data-ah-i"); return Object.assign({ t: cartas[i] ? cartas[i].t : "", i: i, ok: !!(cartas[i] && cartas[i].ok), mal: b.disabled }, pos(b)); }),
          oir: pos(zona.querySelector("[data-ah-oir]")), lento: pos(zona.querySelector("[data-ah-lento]")) };
      }
    };
  }

  /* ---------------- registro ---------------- */
  var deco = function(){
    /* el disco amarillo del juego con su onda, y la tarjeta correcta */
    var barras = [6, 12, 18, 10, 14, 6].map(function(h, i){ return '<rect x="' + (42 + i * 5) + '" y="' + (16 - h / 2) + '" width="3" height="' + h + '" rx="1.5" fill="#93C5FD"/>'; }).join("");
    return '<svg viewBox="0 0 72 56" aria-hidden="true">' +
      '<circle cx="19" cy="28" r="18" fill="#FFD200" opacity=".22"/><circle cx="19" cy="28" r="14.5" fill="#FFD200"/>' +
      '<path d="M11.5 24.5h3.6l4.9-4.3v15.6l-4.9-4.3h-3.6z" fill="#081F55"/><path d="M23.4 24a5.6 5.6 0 0 1 0 8" fill="none" stroke="#081F55" stroke-width="2.2" stroke-linecap="round"/>' +
      barras + '<rect x="40" y="32" width="30" height="18" rx="5" fill="#fff"/>' +
      '<path d="M48.5 41l4 4 8-8" fill="none" stroke="#15803D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  };
  var retosAH = function(alc){ var n = G.nivel(alc.track); return alc.tema ? retosVoc(alc.tema, n) : retosLec(G.retos(alc.lecciones, n, { max: 28 })); };
  G.registrar({
    id: "ah", nombre: "Audio Hunt", verbo: "Escucha y encuentra", familia: "Escucha", color: "#93C5FD", orden: 30, vocab: true,
    vocabNota: "suena la palabra y eliges su significado",
    retos: retosAH,
    retosCarnet: function(track, nivel){ return retosLec(G.retosCarnet(track, nivel, { max: 28 })).map(function(r){ r.oro = true; return r; }); },
    apto: function(r){ return r.tipo === "oido" && !!r.audio && r.malas && r.malas.length >= 2; },
    deco: deco,
    aviso: function(){ return "Necesitas sonido: sube el volumen o usa audífonos."; },
    reglas: function(alc){
      return [
        (G.aj.sinTiempo ? "Sin tiempo: " + (alc.repaso ? 10 : 15) + " retos" : alc.seg + " segundos") + " y 3 vidas.",
        alc.tema ? "Suena una palabra en francés: toca la tarjeta con su significado en español." : "Suena una frase en francés: toca la palabra que oíste en el hueco.",
        "«Escuchar otra vez» y «Más despacio» repiten el audio; cada repetición resta puntos, no vidas.",
        "Una tarjeta equivocada rompe el combo; la segunda en el mismo reto te quita una vida y te muestra la corrección.",
        "Cada reto tiene su tiempo: si se acaba, ves la respuesta sin perder vida."
      ];
    },
    montar: function(zona, s){ return motorOido(zona, s); }
  });

  if (!document.getElementById("plx48")) {
    var st = document.createElement("style"); st.id = "plx48";
    st.textContent = `
  .ah{position:absolute;inset:0;display:flex;flex-direction:column;gap:12px;padding:0 16px calc(88px + env(safe-area-inset-bottom));box-sizing:border-box;max-width:560px;margin:0 auto}
  .ah-reloj{height:6px;border-radius:99px;background:rgba(147,197,253,.18);overflow:hidden;flex:none}
  .ah-reloj i{display:block;height:100%;background:#93C5FD;transform-origin:left;border-radius:99px}
  .plxg.ah-on .ah-reloj.poco i{background:#FF8A8F}
  .ah-oido{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
  .ah-oir{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;column-gap:14px;row-gap:16px;width:min(100%,340px);padding:6px 4px;border-radius:22px;
    -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
  .ah-oir b{grid-column:1/-1;text-align:center;font:800 15px/1.2 Poppins,Inter,system-ui,sans-serif;color:#EEF3FF}
  .ah-disco{position:relative;width:84px;height:84px;border-radius:50%;background:#FFD200;display:grid;place-items:center;
    box-shadow:0 5px 0 #C9A400,0 0 0 8px rgba(255,210,0,.14),0 18px 40px -12px rgba(255,210,0,.55)}
  .ah-disco svg{width:36px;height:36px;fill:#081F55;color:#081F55}
  .ah-oir:active .ah-disco{transform:translateY(3px);box-shadow:0 2px 0 #C9A400,0 0 0 8px rgba(255,210,0,.14)}
  .ah-disco::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px solid #FFD200;opacity:0;pointer-events:none}
  .ah-onda{display:flex;align-items:center;gap:5px;height:40px}
  .ah-onda:first-child{transform:scaleX(-1)}
  .ah-onda i{display:block;flex:none;width:4px;height:var(--h);border-radius:4px;background:#93C5FD;opacity:.5}
  .ah-oido.ah-suena .ah-onda i{opacity:1;animation:ahBarra .7s ease-in-out infinite alternate;animation-delay:calc(var(--k) * -.13s)}
  .ah-oido.ah-suena .ah-disco::after{animation:ahOnda 1.1s ease-out infinite}
  .ah-lento{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:99px;
    background:rgba(8,31,85,.6);color:#EEF3FF;box-shadow:inset 0 0 0 2px #3A5CA8;font:700 15px/1.1 Poppins,Inter,system-ui,sans-serif;-webkit-user-select:none;user-select:none;touch-action:manipulation}
  .ah-lento svg{width:18px;height:18px;flex:none}
  .ah-lento:active{background:rgba(58,92,168,.45)}
  .ah-oir:focus-visible,.ah-lento:focus-visible,.ah-c:focus-visible{outline:3px solid #FFD200;outline-offset:3px}
  .ah-nota{margin:0;min-height:18px;font:600 13px/1.35 Inter,system-ui,sans-serif;color:#C9D6F5;text-align:center}
  .ah-cartas{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .ah-cartas.impar .ah-c:last-child{grid-column:1/-1}
  .ah-cartas.largas{grid-template-columns:1fr}
  .ah-c{all:unset;box-sizing:border-box;position:relative;cursor:pointer;display:flex;align-items:center;justify-content:center;text-align:center;min-height:58px;padding:10px 14px;border-radius:16px;
    background:#fff;color:#0B2D74;font:700 16px/1.25 Poppins,Inter,system-ui,sans-serif;overflow-wrap:anywhere;box-shadow:0 4px 0 #93C5FD,0 12px 24px -12px rgba(0,0,0,.7);
    -webkit-user-select:none;user-select:none;touch-action:manipulation}
  .ah-c:active{transform:translateY(3px);box-shadow:0 1px 0 #93C5FD}
  .ah-c small{position:absolute;top:-7px;left:-7px;width:20px;height:20px;border-radius:50%;background:#0B2D74;color:#FFD200;font:800 11px/20px Poppins,system-ui,sans-serif;text-align:center;display:none}
  @media (pointer:fine){ .ah-c small{display:block} }
  .ah-c.ah-mal{background:#FFE1E3;color:#8A1C24;box-shadow:0 2px 0 #FF8A8F;cursor:default;animation:ahMal .35s}
  .ah-c.ah-mal span{text-decoration:line-through;text-decoration-thickness:2px}
  .ah-c.ah-bien{background:#6BE58E;color:#06173F;box-shadow:0 4px 0 #15803D,0 0 26px -4px rgba(107,229,142,.8)}
  .ah-listo .ah-c:not(.ah-bien){opacity:.55}
  .ah.ah-pausa .ah-oido,.ah.ah-pausa .ah-cartas{visibility:hidden}
  .plxg-q .ah-ok{color:#6BE58E}
  .plxg-q.ah-frase{font-size:clamp(17px,4.8vw,21px)}
  @keyframes ahOnda{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.18)}}
  @keyframes ahBarra{from{transform:scaleY(.35)}to{transform:scaleY(1.15)}}
  @keyframes ahMal{0%,100%{translate:0}25%{translate:-6px}75%{translate:6px}}
  @media (max-height:700px){ .ah{gap:10px} .ah-oido{gap:6px} .ah-c{min-height:52px;padding:8px 12px} .ah-disco{width:66px;height:66px} .ah-disco svg{width:30px;height:30px} .ah-onda{height:30px} .ah-oir{row-gap:14px} }
  @media (prefers-reduced-motion:reduce){ .ah-c.ah-mal,.ah-oido.ah-suena .ah-disco::after,.ah-oido.ah-suena .ah-onda i{animation:none} }
  `;
    document.head.appendChild(st);
  }
})();
