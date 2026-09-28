/* PLEX PLAY 1.25.0 — Language Detective (motor «Detective»)
   - Cada reto es un caso: arriba la pista del expediente (el contexto del ejercicio) y en el centro una
     frase con un error, con cada palabra como ficha tocable (las elisiones y la puntuación van pegadas).
   - Paso 1: tocar la palabra que está mal. Paso 2: elegir el arreglo entre 3 opciones (A1–A2) o 4 (B1–C1).
   - Acusar una palabra correcta: la primera vez rompe el combo y la ficha queda marcada como limpia;
     la segunda, error con vida. Elegir mal el arreglo también es un error. Si se acaba el tiempo del caso,
     se muestra la respuesta sin quitar vida. Cada 3 casos resueltos seguidos: «Caso cerrado».
   - Casos: los ejercicios «spot» (con distractores revisados a mano, uno por uno, para que ninguno sea
     también correcto en esa frase) y los «choice» de forma con hueco (la frase lleva una opción mala del
     propio ejercicio; las otras opciones del ejercicio son los distractores).
   - Todo el tiempo va por tick (la pausa lo congela). Teclado: Tab y Enter en las fichas, 1 a 4 eligen el arreglo. */
(function(){
  "use strict";
  var G = window.PLXG; if (!G || !G.sesion) return;
  var esc = G.esc, norm = G.norm, mezcla = G.mezcla, plano = G.plano;
  var MAX_FICHAS = 16, MAX_CHARS = 105;

  /* ---------------- distractores del arreglo, revisados a mano ----------------
     Clave: «error|arreglo» tal como vienen en el ejercicio. Cada distractor está mal en ESA frase
     (nada de sinónimos ni de formas que también valdrían). Si dos ejercicios comparten la clave,
     el valor es un objeto {fragmento de la frase: distractores}. El primero es el que sale en A1–A2. */
  var DIS = {
    /* A1 */
    "sont|sommes": ["êtes", "suis"], "vas-tu|allez-vous": ["allez-tu", "vas-vous"], "est|a": ["as", "ont"],
    "un|une": ["des", "le"], "mangons|mangeons": ["mangent", "mange"], "faisez|faites": ["faisons", "font"],
    "comment|quand": ["où", "pourquoi"], "loin|près": ["devant", "après"], "de|le": ["du", "un"], "ma|mon": ["ta", "mes"],
    "leurs|leur": { "adorent": ["son", "ses"], "envoie": ["lui", "les"] },
    "verte|verts": ["vertes", "vert"], "blanc|blanche": ["blanches", "blancs"], "de le|du": ["au", "de la"],
    "il est|il y a": ["il a", "il fait"], "quatre-vingt|quatre-vingts": ["quatres-vingts", "quatre-vingtes"],
    "Juin|juin": ["de juin", "Juins"], "il est|il fait": ["il a", "il y a"], "ce|cette": ["cet", "ces"], "Cette|Cet": ["Ce", "Ces"],
    "j'ai que|je dois": ["j'ai", "je dois de"], "veut|veux": ["veulent", "voulez"], "touche|joue": ["joue à", "jouer"],
    "du|de": ["des", "la"],
    /* A2 */
    "prendu|pris": ["prit", "prenu"], "avons|sommes": ["sont", "êtes"], "né|née": ["nés", "nées"],
    "habitait|habitaient": ["habitais", "habitiez"], "fairera|fera": ["ferai", "faira"], "couché|couchée": ["couchés", "couchées"],
    "comme|que": ["de", "autant que"], "le|lui": ["la", "leur"], "lui|l'": ["y", "leur"], "la|lui": ["le", "leur"],
    "lui|y": ["la", "leur"], "les|en": ["y", "leur"], "lui|le": ["la", "leur"], "a fait|faisait": ["fait", "faisais"],
    "a préparé|préparait": ["préparais", "préparaient"], "couches|couche": ["couchez", "coucher"],
    "le goûte|goûte-le": ["le goûtes", "goûte-lui"], "en|à": ["par", "au"], "au|en": ["à", "dans"], "ma|la": ["mon", "le"],
    "il y a|depuis": ["dans", "en"],
    /* fonética y ortografía (juego escrito: aquí los homófonos son justamente la trampa) */
    "roue|rue": ["ru", "rues"], "le|les": ["la", "leur"], "bon|bonne": ["bone", "bonnes"], "la|l'": ["le", "les"],
    "nèje|neige": ["nège", "neije"], "habite|habitent": ["habites", "habitez"], "ne|n'": ["ni", "non"],
    "va-il|va-t-il": ["va-t'il", "vat-il"], "anfants|enfants": ["enfans", "anfans"], "sant|cent": ["sang", "sans"],
    "les|le": ["la", "des"], "parle|parles": ["parlent", "parlez"], "notre|nôtre": ["nôtres", "notres"],
    "soce|sauce": ["sosse", "sausse"], "fiye|fille": ["file", "fie"], "solei|soleil": ["soleille", "solail"],
    "coussin|cousin": ["couzin", "cousine"], "dessert|désert": ["déssert", "dézert"], "vin|vingt": ["vint", "vain"],
    "set|sept": ["cet", "sette"], "et|est": ["es", "ai"], "son|sont": ["sons", "ont"],
    /* B1 */
    "freinait|a freiné": ["a freinée", "freinerait"], "avait|était": ["a", "aurait"], "finies|fini": ["finis", "finit"],
    "que|dont": ["lequel", "qui"], "que|où": ["dont", "qui"], "cherchent|cherchant": ["cherche", "cherché"],
    "viens|viennes": ["viendras", "venais"], "pourais|pourrais": ["pourrai", "pourait"], "opinion|avis": ["point", "penser"],
    "où|que": ["dont", "qui"], "ont|avons": ["a", "avez"], "fait|fasse": ["faisait", "fera"], "soit|est": ["serait", "sera"],
    "vas-tu|tu vas": ["va-tu", "tu vais"], "a-il|a-t-il": ["a-t'il", "at-il"], "à|de": ["pour", "en"],
    "laissé|arrêté": ["quitté", "abandonné"], "prudentement|prudemment": ["prudament", "prudemmant"],
    "compris bien|bien compris": ["bien comprise", "compris bon"], "termine|vient": ["finit", "va"],
    "lisant|en train de lire": ["en lisant", "en train lire"], "Avant de|Avant": ["Avant que", "Auparavant"],
    "en bout de|au bout de": ["à bout de", "au bout"], "carrière|licence": ["course", "matière"], "approuvé|réussi": ["gagné", "approuvés"],
    "serais|étais": ["serai", "sois"], "qu'est-ce|ce": ["quoi", "qu'est"], "depuis|pendant": ["dans", "pour"], "de|à": ["par", "aux"],
    "envoyé|envoyés": ["envoyées", "envoyer"], "le|celui": ["celle", "lequel"], "te|vous": ["toi", "tu"],
    "vu rien|rien vu": ["pas rien vu", "rien vue"], "Chaque un|Chacun": ["Chaque", "Chaqu'un"], "aie|aurai": ["avais", "aurais"],
    "aura sortie|sera sortie": ["sera sorti", "aura sorti"], "que si|si": ["que", "est-ce que"],
    "que je me repose|de me reposer": ["à me reposer", "de me repose"], "comprends|comprennes": ["comprendras", "comprenais"],
    "pour que je sois|pour être": ["pour que je suis", "pour d'être"], "de que|que": ["qui", "à ce que"],
    "que je parle|parler": ["de parler", "à parler"], "sois|es": ["soit", "serais"], "manger|avoir mangé": ["mangé", "avoir manger"],
    "que|de": ["à", "pour"], "avoir allé|être allés": ["être allé", "avoir allés"], "très plus|beaucoup plus": ["trop plus", "très beaucoup"],
    "chaque fois plus|de plus en plus": ["plus et plus", "de plus à plus"], "des|de": ["du", "les"],
    /* B2 */
    "lesquels|lesquelles": ["laquelle", "qui"], "aurais|avais": ["ai", "aurai"], "a|ait": ["ai", "aie"],
    "convainquants|convaincants": ["convaincant", "convinquants"], "faite|fait": ["faites", "faits"], "pleuvra|pleuve": ["pleut", "pleuvait"],
    "Augmentement|Augmentation": ["Augmentance", "Augmentage"], "êtes|avez": ["faites", "avons"], "Malgré qu'il|Bien qu'il": ["Malgré il", "Même qu'il"],
    "Même s'il soit|Même s'il est": ["Même s'il sera", "Même qu'il est"], "finis|finisses": ["finiras", "finissais"], "as|aurais": ["auras", "aies"],
    "arrivait|arriva": ["arrivera", "arrivât"], "eûrent|eurent": ["eûmes", "eussent"], "de les|des": ["de", "aux"],
    "développation|développement": ["développage", "dévelopement"], "en revanche|au contraire": ["par contre", "pourtant"],
    "Or|Actuellement": ["Alors que", "Puisque"], "avec qui|que": ["qui", "dont"], "téléphonées|téléphoné": ["téléphonés", "téléphoner"],
    "envoyé|envoyées": ["envoyés", "envoyer"], "se soient|se seront": ["se sont", "se seraient"], "viennes|viendras": ["viendrais", "venais"],
    /* remediación y progresión */
    "lourd|lourde": ["lourds", "lourdes"], "créatifs|créatives": ["créative", "créatif"], "mobilisé|mobilisés": ["mobilisée", "mobiliser"],
    "a|au": ["à", "en"], "j'aurais|j'avais": ["j'ai", "j'aurai"], "super|extrêmement": ["vachement", "hyper"], "Ça|Cela": ["Ce", "Celui"],
    "a|à": ["au", "de"], "importants|importantes": ["importante", "important"], "enterprises|entreprises": ["entreprise", "entreprisses"],
    "rapidement partait|partait rapidement": ["rapide partait", "partait rapide"],
    "souvent nous retrouvons|nous retrouvons souvent": ["nous souvent retrouvons", "retrouvons souvent nous"],
    "toujours réfléchit|réfléchit toujours": ["toujours réfléchis", "réfléchis toujours"], "encore pas|pas encore": ["encore non", "pas encor"],
    "le problème|du problème": ["au problème", "par le problème"],
    /* C1: cultura, registro y francofonía */
    "XXe|XIXe": ["XVIIIe", "XVIe"], "kot|natel": ["GSM", "cellulaire"], "1848|1945": ["1936", "1958"], "Oran|Évian": ["Alger", "Genève"],
    "Lesage|Lévesque": ["Bourassa", "Parizeau"], "lycée|collège": ["primaire", "cours moyen"], "Goscinny|Hergé": ["Uderzo", "Franquin"],
    "fric|argent": ["pognon", "blé"], "bossé|travaillé": ["taffé", "bûché"], "tires les cheveux|fais marcher": ["tires la jambe", "prends les cheveux"],
    "mis la patte|fait une gaffe": ["fait la patte", "mis la gaffe"], "de la Côte d'Ivoire|du Sénégal": ["du Mali", "de la Guinée"],
    "dialectes|langues": ["patois", "accents"], "cimarrons|marrons": ["marronniers", "cimarrones"], "Nobel|Goncourt": ["Renaudot", "Femina"],
    "trois|quatre": ["deux", "cinq"], "déjeuner|petit-déjeuner": ["dîner", "goûter"], "un idiome|une expression idiomatique": ["un dialecte", "une idiomatique"],
    "le patois breton|le breton": ["le dialecte breton", "le patois"], "quotidien|hebdomadaire": ["mensuel", "trimestriel"],
    "une éditoriale|une maison d'édition": ["une édition", "un éditorial"], "de la gauche|des gaullistes": ["des communistes", "des socialistes"],
    "manifesteurs|manifestants": ["manifestateurs", "manifestés"],
    /* literatura */
    "lyrique|pathétique": ["comique", "épique"], "comparaison|personnification": ["antithèse", "hyperbole"], "quatorze|douze": ["dix", "huit"],
    "Pascal|Leibniz": ["Descartes", "Rousseau"], "Stendhal|Flaubert": ["Balzac", "Zola"], "autrui|autre": ["autres", "tiers"],
    "Rastignac|Meursault": ["Julien Sorel", "Bardamu"], "Mali|Sénégal": ["Cameroun", "Niger"], "la personnage|le personnage": ["les personnages", "un personnage"],
    "le narrateur|l'auteur": ["le lecteur", "le personnage"], "Maupassant|Georges Duroy": ["Frédéric Moreau", "Julien Sorel"],
    "un roman|une nouvelle": ["un poème", "une pièce"], "je pense que|nous montrerons que": ["je crois que", "j'affirme que"],
    "argument|intrigue": ["anecdote", "énigme"], "Tristan Tzara|André Breton": ["Louis Aragon", "Paul Éluard"],
    "surrealistes|surréalistes": ["surréaliste", "surréalists"], "créole|français": ["wolof", "anglais"], "Dakar|Paris": ["Abidjan", "Alger"],
    "dirige|met en scène": ["écrit", "publie"], "français|irlandais": ["anglais", "écossais"],
    "Nathalie Sarraute|Robbe-Grillet": ["Marguerite Duras", "Michel Butor"], "Rousseau|Doubrovsky": ["Proust", "Lejeune"],
    "ses mémoire|ses mémoires": ["sa mémoire", "ses mémoirs"]
  };
  var curados = function(err, fix, frase){
    var v = DIS[err + "|" + fix]; if (!v) return null;
    if (Array.isArray(v)) return v.slice();
    var k = Object.keys(v).find(function(f){ return frase.indexOf(f) >= 0; });
    return k ? v[k].slice() : null;
  };

  /* ---------------- respaldo para ejercicios nuevos sin revisar ----------------
     Solo formas hermanas del arreglo (la misma raíz con otra concordancia o persona) que existan en los
     cursos: en una frase con el hueco ya determinado, esas formas están mal. Si no hay, el caso no entra. */
  var lexico = null;
  var cargaLexico = function(){
    if (lexico) return lexico;
    lexico = {};
    try {
      LESSONS.forEach(function(l){ (l.items || []).forEach(function(it){
        [it.s, it.q, it.fix].concat(it.o || [], it.acc || [], it.tokens || []).forEach(function(x){
          String(plano(x || "")).toLowerCase().split(/[^\p{L}'-]+/u).forEach(function(w){ if (w.length > 2) lexico[w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "")] = 1; });
        });
      }); });
    } catch (e) {}
    return lexico;
  };
  var variantes = function(err, fix){
    if (/\s/.test(fix) || /\s/.test(err)) return [];
    var f = fix.toLowerCase(), e = err.toLowerCase(), p = 0;
    while (p < f.length && p < e.length && f[p] === e[p]) p++;
    if (p < 4) return [];
    var raiz = f.slice(0, Math.max(4, Math.min(p, f.length - 1))), lx = cargaLexico(), out = [];
    Object.keys(lx).forEach(function(w){
      if (w === f || w === e || w.indexOf(raiz) !== 0 || Math.abs(w.length - f.length) > 3) return;
      if (/^(e|es|s|ent|ons|ez|é|ée|és|ées|er)$/.test(w.slice(raiz.length)) || w.length === raiz.length) out.push(w);
    });
    var M = /^\p{Lu}/u.test(fix);
    return mezcla(out).slice(0, 2).map(function(w){ return M ? w.charAt(0).toUpperCase() + w.slice(1) : w; });
  };

  /* ---------------- fichas: una por palabra ----------------
     La frase trae el error entre corchetes. La puntuación va pegada a su palabra («Pamplona.», «comment ?»,
     «— Tu»), la elisión se une a la palabra siguiente («s'est», «l'université») salvo que el corchete las
     separe («l'» + «aie»): entonces son dos fichas que se ven juntas. */
  var POST = /^[,.;:!?…»)]+$/, PRE = /^[«(—–]$/;
  var fichasDe = function(sb){
    var s = String(sb).replace(/[’]/g, "'").replace(/\[/g, " \u0001 ").replace(/\]/g, " \u0002 ");
    var toks = [], g = false, grupos = 0;
    s.split(/\s+/).filter(Boolean).forEach(function(w){
      if (w === "\u0001") { g = true; grupos++; return; }
      if (w === "\u0002") { g = false; return; }
      toks.push({ t: w, g: g });
    });
    if (grupos !== 1) return null;
    var out = [], pre = "";
    toks.forEach(function(k){
      var ant = out[out.length - 1];
      if (POST.test(k.t) && ant) { ant.post += (/^[;:!?»]/.test(k.t) ? " " : "") + k.t; return; }
      if (PRE.test(k.t)) { pre += k.t + " "; return; }
      if (ant && /'$/.test(ant.core) && !ant.post && ant.g === k.g && !pre) { ant.core += k.t; return; }
      out.push({ pre: pre, core: k.t, post: "", g: k.g }); pre = "";
    });
    if (pre && out.length) out[out.length - 1].post += " " + pre.trim();
    /* el grupo del error: contiguo y no vacío */
    var idx = out.map(function(f, i){ return f.g ? i : -1; }).filter(function(i){ return i >= 0; });
    if (!idx.length || idx[idx.length - 1] - idx[0] !== idx.length - 1) return null;
    /* cómplices: la elisión pegada al error («j'» + «la», «je» + «ai joué») también está mal escrita,
       así que tocarla cuenta como encontrar el error (no se castiga) */
    var i0 = idx[0], i1 = idx[idx.length - 1], ant = out[i0 - 1], sig = out[i1 + 1], ELID = /^(je|me|te|se|le|la|ne|de|que)$/i, VOC = /^[aeiouyhâàéèêîïôûœ]/i;
    if (ant && (pega(ant) || (!ant.post && ELID.test(ant.core) && VOC.test(out[i0].core)))) ant.c = true;
    if (sig && !out[i1].post && ELID.test(out[i1].core) && VOC.test(sig.core)) sig.c = true;
    return out;
  };
  var pega = function(f){ return /'$/.test(f.core) && !f.post; };
  var texto = function(fs){ return fs.map(function(f, i){ return (i && !pega(fs[i - 1]) ? " " : "") + f.pre + f.core + f.post; }).join(""); };
  var okTexto = function(x){ x = String(x || "").trim(); return x.length > 0 && x.length <= 28 && !/[()\/=\[\]…_]|—/.test(x) && !/\p{Ll}\p{Lu}/u.test(x) && x.split(/\s+/).length <= 4; };
  var DET = /^(un|une|le|la|les|l'|des|du|de|d')$/i;
  /* el arreglo no puede repetir la palabra de al lado («[qui est] entourée» → «entourée») ni doblar el artículo */
  var repite = function(fs, fix, err){
    var enErr = norm(err).split(" "), i0 = -1, i1 = -1; fs.forEach(function(f, i){ if (f.g) { if (i0 < 0) i0 = i; i1 = i; } });
    var ws = norm(fix).split(" "), antes = fs[i0 - 1], despues = fs[i1 + 1];
    if (despues && norm(despues.core) === ws[ws.length - 1] && enErr.indexOf(ws[ws.length - 1]) < 0) return true;
    if (antes && norm(antes.core) === ws[0] && enErr.indexOf(ws[0]) < 0) return true;
    if (antes && DET.test(antes.core) && DET.test(ws[0])) return true;
    return false;
  };
  var cabe = function(fs){ return fs.length >= 3 && fs.length <= MAX_FICHAS && texto(fs).length <= MAX_CHARS; };

  /* ---------------- retos ---------------- */
  var itemDe = function(key){ try { return key && ITEMS[key] ? ITEMS[key].it : null; } catch (e) { return null; } };
  var limpiaDis = function(dis, err, fix){
    var fuera = {}; fuera[norm(err)] = 1; fuera[norm(fix)] = 1;
    return (dis || []).filter(function(d){ var k = norm(d); if (!okTexto(d) || fuera[k]) return false; fuera[k] = 1; return true; });
  };
  var whyPor = function(it, fix){ return it.why || ("Se escribe <b>" + esc(fix) + "</b>."); };
  var casoSpot = function(it, key, l){
    if (!it || it.k !== "spot" || !it.s || !it.fix) return null;
    var ms = String(it.s).match(/\[[^\]]+\]/g); if (!ms || ms.length !== 1) return null;
    var err = ms[0].slice(1, -1).trim(), fix = String(it.fix).trim();
    if (!okTexto(err) || !okTexto(fix) || err === fix) return null;
    var fs = fichasDe(it.s); if (!fs || !cabe(fs) || repite(fs, fix, err)) return null;
    var dis = limpiaDis(curados(err, fix, String(it.s)) || variantes(err, fix), err, fix);
    if (!dis.length) return null;
    return { tipo: "caso", ask: "Encuentra el error y corrígelo", q: texto(fs), pista: plano(it.ctx || ""), fichas: fs, err: err, fix: fix, dis: dis, correcta: [err],
      why: whyPor(it, fix), hab: it.t || "autre", key: key, lessonId: l ? l.id : "", origen: "spot" };
  };
  /* choice con hueco: solo los de forma (conjugación, concordancia, pronombres, preposiciones…), donde la
     opción mala hace la frase incorrecta por sí misma; nada de registro, sentido ni pronunciación */
  var FORMA = /(forma|forme|pronombre|pronom|preposici|préposition|participio|participe|artículo|article|posesivo|demostrativo|negaci|imperativo|interrogativ|relativ|concordancia|accord|orthographe|ortograf|grafía|graphie|tiempo correcto|modo correcto|mode du verbe|verbo correcto|combinación correcta|construcción correcta|construction correcte|nominalizaci|palabra correcta|mot juste|mot qui convient|conector correcto|articulador|palabra que completa)/i;
  var NO = /(cortés|adecuad|formal|anuncio|sentido|significa|oyes|pronunci|transcrip|melod|entonaci|sílaba|registro|registre|soutenu|montre|information|natural|contexto|escuchaste|acento|confirm|lee |escrit|orden)/i;
  var pistaAsk = function(ask){
    return ask.replace(/^Elige\s+/i, "Revisa ").replace(/^Choisissez\s+/i, "Vérifiez ").replace(/^Completa con\s+/i, "Revisa ")
      .replace(/\s+(correct[oa]s?|correcte|juste)(?=[\s.,:]|$)/i, "").replace(/\s+qui convient(?=[\s.,:]|$)/i, "");
  };
  var casoChoice = function(it, key, l){
    if (!it || it.k !== "choice" || !it.o || it.o.length < 3 || it.a == null || !it.o[it.a]) return null;
    var ask = plano(it.ask || ""); if (!FORMA.test(ask) || NO.test(ask)) return null;
    var q = plano(it.q || "").replace(/\s*\([^()]{1,40}\)\s*\.?\s*$/, function(m){ return /\.\s*$/.test(m) ? "." : ""; });
    if ((q.match(/_{2,}/g) || []).length !== 1 || /[=→\[\]()]|…/.test(q)) return null;
    var fix = String(it.o[it.a]).trim(), malas = it.o.filter(function(_, i){ return i !== it.a; }).map(function(x){ return String(x).trim(); });
    if (!okTexto(fix) || !malas.every(okTexto)) return null;
    var err = malas[Math.floor(Math.random() * malas.length)];
    var fs = fichasDe(q.replace(/_{2,}/, "[" + err + "]")); if (!fs || !cabe(fs)) return null;
    var dis = limpiaDis(malas.filter(function(m){ return m !== err; }), err, fix); if (!dis.length) return null;
    return { tipo: "caso", ask: "Encuentra el error y corrígelo", q: texto(fs), pista: plano(it.ctx || "") || pistaAsk(ask), fichas: fs, err: err, fix: fix, dis: dis, correcta: [err],
      why: whyPor(it, fix), hab: it.t || "autre", key: key, lessonId: l ? l.id : "", origen: "choice" };
  };
  var casoDe = function(it, key, l){ return it && it.k === "spot" ? casoSpot(it, key, l) : casoChoice(it, key, l); };
  var retosLD = function(lecciones){
    var out = [], vistos = {};
    (lecciones || []).forEach(function(l){ (l.items || []).forEach(function(it, i){
      var r = casoDe(it, l.id + ":" + i, l); if (!r) return;
      var k = norm(r.q); if (vistos[k]) return; vistos[k] = 1; out.push(r);
    }); });
    return out;
  };
  var retosCarnetLD = function(track){
    var out = [];
    try {
      Object.keys(S.carnet || {}).forEach(function(k){
        var x = ITEMS[k]; if (!x || (track && x.l.track !== track)) return;
        var r = casoDe(x.it, k, x.l); if (r) { r.oro = true; out.push(r); }
      });
    } catch (e) {}
    return mezcla(out);
  };

  /* ---------------- motor ---------------- */
  /* etiqueta del expediente: la habilidad del ejercicio */
  var HAB = { gram: "Gramática", conj: "Conjugación", prep: "Preposiciones", accord: "Concordancia", voc: "Vocabulario", phono: "Fonética",
    ortho: "Ortografía", coh: "Conectores", synt: "Sintaxis", cult: "Cultura", lit: "Literatura" };
  /* «registre» y «comp» no se muestran: en estos ejercicios suelen ser errores de forma y la etiqueta despistaría */
  var LUPA = '<svg class="ld-lupa" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12.6 12.6l4.6 4.6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
  function motorLD(zona, s){
    var reto = null, fichas = [], ops = [], paso = 1, malos = 0, T = 0, t = 0, hecho = false, cierre = -1, racha = 0, casos = 0, eleccion = null;
    zona.innerHTML =
      '<div class="ld"><div class="ld-reloj"><i></i></div>' +
        '<section class="ld-hoja" aria-live="polite"><header class="ld-cab"><span class="ld-num"></span><span class="ld-tag"></span><span class="ld-pasos" aria-hidden="true"><i></i><i></i></span></header>' +
          '<div class="ld-frase" role="group" aria-label="Frase del caso"></div>' +
          '<div class="ld-sello" hidden><b>Caso cerrado</b><small></small></div></section>' +
        '<div class="ld-ops" role="group" aria-label="Arreglos"></div>' +
        '<p class="ld-espera" aria-hidden="true" hidden>' + LUPA + '<span>Cuando encuentres el error, aquí eliges el arreglo.</span></p></div>';
    s.el.classList.add("ld-on");
    var raiz = zona.querySelector(".ld"), frase = zona.querySelector(".ld-frase"), opsEl = zona.querySelector(".ld-ops"), reloj = zona.querySelector(".ld-reloj i"),
      num = zona.querySelector(".ld-num"), tag = zona.querySelector(".ld-tag"), espera = zona.querySelector(".ld-espera"), hoja = zona.querySelector(".ld-hoja"), sello = zona.querySelector(".ld-sello");
    if (s.mov) raiz.classList.add("ld-quieto");

    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 10) + "px"; };
    var banner = function(){
      var ins = paso === 1 ? "Paso 1 de 2 · Toca la palabra que está mal" : !hecho ? "Paso 2 de 2 · Elige cómo se corrige" :
        eleccion === "bien" ? "Caso resuelto" : eleccion === "tiempo" ? "Se acabó el tiempo" : "Arreglo equivocado";
      s.banner('<p class="plxg-ask ld-ins">' + esc(ins) + "</p>" + (reto.pista ? '<p class="ld-pista">' + LUPA + "<span>" + esc(reto.pista) + "</span></p>" : ""), { oro: reto.oro });
      hoja.classList.toggle("ld-p2", paso === 2);
      coloca();
    };
    var pintaFrase = function(){
      var html = "", arreglado = hecho && eleccion === "bien";
      fichas.forEach(function(f, i){
        if (arreglado && f.g) {
          if (i > 0 && fichas[i - 1].g) return;
          var ult = i; while (fichas[ult + 1] && fichas[ult + 1].g) ult++;
          html += '<span class="ld-f ld-arreglo' + (i && pega(fichas[i - 1]) ? " ld-junta" : "") + '">' + esc(f.pre) + "<b>" + esc(reto.fix) + "</b>" + esc(fichas[ult].post) + "</span>";
          return;
        }
        var cl = "ld-f" + (f.limpia ? " ld-limpia" : "") + (f.g && paso === 2 && !(hecho && eleccion !== "bien") ? " ld-sosp" : "") + (f.g && hecho && eleccion !== "bien" ? " ld-culpable" : "") +
          (i && pega(fichas[i - 1]) ? " ld-junta" : "") + (pega(f) ? " ld-pega" : "");
        html += '<button type="button" class="' + cl + '" data-ld-i="' + i + '"' + (f.limpia || paso !== 1 || hecho ? ' aria-disabled="true"' : "") + ">" +
          esc(f.pre) + "<b>" + esc(f.core) + "</b>" + esc(f.post) + (f.limpia ? '<span class="ld-vh"> (limpia)</span>' : "") + "</button>";
      });
      frase.innerHTML = html;
    };
    var pintaOps = function(){
      opsEl.classList.toggle("ld-vis", paso === 2); espera.hidden = paso === 2 || !reto;
      if (paso !== 2) { opsEl.innerHTML = ""; return; }
      opsEl.innerHTML = ops.map(function(o, k){
        var cl = "ld-o" + (hecho && o === reto.fix ? " ld-ok" : "") + (hecho && o === eleccion ? " ld-mal" : "");
        return '<button type="button" class="' + cl + '" data-ld-o="' + k + '"' + (hecho ? ' aria-disabled="true"' : "") + '><small aria-hidden="true">' + (k + 1) + "</small>" + esc(o) + "</button>";
      }).join("");
    };

    var jugar = function(r){
      reto = r; paso = 1; malos = 0; t = 0; hecho = false; cierre = -1; eleccion = null; casos++;
      fichas = r.fichas.map(function(f){ return { pre: f.pre, core: f.core, post: f.post, g: f.g, c: !!f.c, limpia: false }; });
      var n = s.nivel > 0 ? 2 : 1;
      ops = mezcla([r.fix, r.err].concat(r.dis.slice(0, n)));
      T = s.dir.t() * 1.6 + (0.55 * fichas.length + 4) * (G.aj.sinTiempo ? 1.5 : 1);
      num.textContent = "Expediente n.º " + String(casos).padStart(2, "0");
      tag.textContent = HAB[r.hab] || ""; tag.hidden = !HAB[r.hab];
      sello.hidden = true; raiz.classList.remove("ld-listo");
      reloj.style.transform = "scaleX(1)"; reloj.parentNode.classList.remove("poco");
      banner(); pintaFrase(); pintaOps();
    };
    var centro = function(el){ var a = el.getBoundingClientRect(), b = zona.getBoundingClientRect(); return { x: a.left - b.left + a.width / 2, y: a.top - b.top }; };
    var bien = function(){ return reto.err + " → " + reto.fix; };
    var fin = function(){ limpia(); s.listo(); };

    var tocaFicha = function(i, el){
      if (!reto || hecho || paso !== 1 || s.estado() !== "juega") return;
      var f = fichas[i]; if (!f || f.limpia) return;
      G.despiertaAudio();
      var c = centro(el);
      if (f.g || f.c) {
        paso = 2; G.sfx("paso", 1); s.extra(20, c.x, c.y);
        banner(); pintaFrase(); pintaOps();
        return;
      }
      malos++;
      if (malos < 2) {
        f.limpia = true; s.penaliza(c.x, c.y); G.vibra(40);
        pintaFrase();
        return;
      }
      hecho = true; racha = 0; eleccion = "acusa";
      pintaFrase();
      s.fallo(reto, { mal: f.core.replace(/[.,;:!?]+$/, ""), etMal: "Acusaste", etiqueta: "El error", bien: bien() }).then(fin);
    };
    var eligeOp = function(k, el){
      if (!reto || hecho || paso !== 2 || s.estado() !== "juega") return;
      var o = ops[k]; if (o == null) return;
      G.despiertaAudio();
      var c = el ? centro(el) : { x: zona.clientWidth / 2, y: zona.clientHeight / 2 };
      hecho = true;
      if (o === reto.fix) {
        eleccion = "bien"; racha++;
        s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: c.x, y: c.y, final: true });
        raiz.classList.add("ld-listo");
        banner(); pintaFrase(); pintaOps();
        if (racha % 3 === 0) {
          sello.querySelector("small").textContent = racha + " casos seguidos";
          sello.hidden = false; cierre = 1.3;
        } else cierre = .8;
        return;
      }
      eleccion = o; racha = 0;
      banner(); pintaFrase(); pintaOps();
      s.fallo(reto, { mal: o, etMal: "Elegiste", etiqueta: "El arreglo", bien: bien() }).then(fin);
    };
    var limpia = function(){
      reto = null; fichas = []; ops = []; frase.innerHTML = ""; opsEl.innerHTML = ""; opsEl.classList.remove("ld-vis");
      sello.hidden = true; raiz.classList.remove("ld-listo"); hoja.classList.remove("ld-p2"); reloj.style.transform = "scaleX(1)"; num.textContent = ""; tag.textContent = ""; espera.hidden = true;
    };

    /* ---- entrada: toque (click, que también da Enter y Espacio en una ficha enfocada) ---- */
    var clic = function(e){
      var b = e.target.closest && e.target.closest("[data-ld-i],[data-ld-o]"); if (!b || !zona.contains(b)) return;
      e.preventDefault();
      if (b.hasAttribute("data-ld-i")) tocaFicha(+b.getAttribute("data-ld-i"), b);
      else eligeOp(+b.getAttribute("data-ld-o"), b);
    };
    zona.addEventListener("click", clic);
    window.addEventListener("resize", coloca);

    return {
      jugar: jugar,
      tick: function(dt){
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) fin(); return; }
        if (hecho || !dt) return;
        t += dt;
        reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        reloj.parentNode.classList.toggle("poco", t / T > .75);
        if (t >= T) {
          hecho = true; racha = 0; eleccion = "tiempo";
          banner(); pintaFrase(); pintaOps();
          s.escapa(reto, { titulo: "Se acabó el tiempo del caso", etiqueta: "El error", bien: bien() }).then(fin);
        }
      },
      tecla: function(e){
        if (paso !== 2 || hecho || !/^[1-4]$/.test(e.key)) return;
        var b = opsEl.querySelector('[data-ld-o="' + (+e.key - 1) + '"]');
        if (b) { e.preventDefault(); eligeOp(+e.key - 1, b); }
      },
      /* en pausa no se ve el caso: pausar no regala tiempo para leer la frase */
      pausa: function(){ raiz.classList.add("ld-pausa"); }, sigue: function(){ raiz.classList.remove("ld-pausa"); },
      destruye: function(){
        zona.removeEventListener("click", clic); window.removeEventListener("resize", coloca);
        s.el.classList.remove("ld-on"); zona.innerHTML = "";
      },
      depura: function(){
        var pos = function(b){ var r = b.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) }; };
        return {
          reto: reto && { tipo: reto.tipo, q: reto.q, err: reto.err, fix: reto.fix, correcta: reto.correcta, pista: reto.pista, origen: reto.origen, oro: !!reto.oro },
          paso: paso, hecho: hecho, cerrado: cierre >= 0, sello: !sello.hidden, t: t, T: T, racha: racha, casos: casos, malos: malos,
          fichas: [].map.call(frase.querySelectorAll("button.ld-f"), function(b){ var i = +b.getAttribute("data-ld-i"), f = fichas[i]; return Object.assign({ i: i, t: f ? f.core : "", g: !!(f && f.g), c: !!(f && f.c), limpia: !!(f && f.limpia) }, pos(b)); }),
          ops: [].map.call(opsEl.querySelectorAll(".ld-o"), function(b){ var k = +b.getAttribute("data-ld-o"); return Object.assign({ k: k, t: ops[k], ok: !!reto && ops[k] === reto.fix }, pos(b)); }),
          hoja: pos(hoja), zonaAbajo: Math.round(opsEl.getBoundingClientRect().bottom)
        };
      }
    };
  }

  /* ---------------- registro ---------------- */
  var deco = function(){
    return '<svg viewBox="0 0 72 56" aria-hidden="true">' +
      '<path d="M6 12h18l4 5h32a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="#0F3A8A" stroke="#93C5FD" stroke-width="1.5"/>' +
      '<rect x="11" y="20" width="44" height="28" rx="3" fill="#F6F1E4"/>' +
      '<rect x="15" y="25" width="16" height="3.2" rx="1.6" fill="#0B2D74"/><rect x="34" y="25" width="16" height="3.2" rx="1.6" fill="#0B2D74" opacity=".55"/>' +
      '<rect x="15" y="32" width="10" height="3.2" rx="1.6" fill="#0B2D74" opacity=".55"/><rect x="28" y="31" width="14" height="5.2" rx="2" fill="#2DD4BF"/>' +
      '<rect x="15" y="39" width="22" height="3.2" rx="1.6" fill="#0B2D74" opacity=".55"/>' +
      '<circle cx="42" cy="33.6" r="9" fill="rgba(45,212,191,.12)" stroke="#2DD4BF" stroke-width="3"/><path d="M48.5 40.2l8 8" stroke="#2DD4BF" stroke-width="4.5" stroke-linecap="round"/></svg>';
  };
  G.registrar({
    id: "ld", nombre: "Language Detective", verbo: "Encuentra el error y corrígelo", familia: "Detective", color: "#2DD4BF", orden: 50, vocab: false,
    retos: function(alc){ return alc.tema ? [] : retosLD(alc.lecciones); },
    retosCarnet: function(track){ return retosCarnetLD(track); },
    apto: function(r){ return r.tipo === "caso"; },
    deco: deco,
    reglas: function(alc){
      return [
        (G.aj.sinTiempo ? "Sin tiempo: " + (alc.repaso ? 10 : 15) + " casos" : alc.seg + " segundos") + " y 3 vidas.",
        "Cada frase tiene un error: toca la palabra que está mal y luego elige cómo se corrige.",
        "Acusar una palabra correcta rompe el combo; la segunda vez te quita una vida. Un arreglo equivocado, también.",
        "Cada caso tiene su tiempo. Tres casos resueltos seguidos: caso cerrado."
      ];
    },
    opciones: function(alc){
      var meta = G.aj.sinTiempo ? (alc.repaso ? 7 : 10) : (alc.seg >= 90 ? 5 : 4);
      return {
        estrellas: function(r){ if (!r.aciertos) return 0; return r.precision >= 80 && r.aciertos >= meta ? 3 : r.precision >= 80 ? 2 : 1; },
        pista: function(r){ return r.estrellas >= 3 ? "Tres estrellas en esta unidad." : r.estrellas === 2 ? "3 estrellas: 80 % de precisión y " + meta + " casos resueltos." : "2 estrellas: termina con 80 % de precisión."; }
      };
    },
    montar: function(zona, s){ return motorLD(zona, s); }
  });
  G.ldCasos = { fichasDe: fichasDe, texto: texto, casoDe: casoDe, retos: retosLD };

  var st = document.createElement("style"); st.id = "plx50";
  st.textContent = `
  .ld{position:absolute;inset:0;display:flex;flex-direction:column;gap:12px;padding:0 16px calc(84px + env(safe-area-inset-bottom));box-sizing:border-box;max-width:600px;margin:0 auto}
  .ld-reloj{height:6px;border-radius:99px;background:rgba(147,197,253,.18);overflow:hidden;flex:none}
  .ld-reloj i{display:block;height:100%;background:#2DD4BF;transform-origin:left;border-radius:99px}
  .plxg.ld-on .ld-reloj.poco i{background:#FF8A8F}
  .ld-pista{display:flex;gap:8px;align-items:flex-start;justify-content:center;margin-top:2px!important;font:500 15px/1.4 Inter,system-ui,sans-serif;color:#EEF3FF;text-align:left}
  .ld-pista .ld-lupa{flex:none;width:18px;height:18px;margin-top:2px;color:#2DD4BF}
  .plxg-ban .ld-ins{margin-bottom:6px!important;font-weight:700;color:#A9C4FF}
  .ld-hoja{position:relative;flex:none;background:#F6F1E4;color:#0B2D74;border-radius:14px 14px 14px 4px;padding:10px 10px 12px;
    box-shadow:0 1px 0 #D9CFB5,0 16px 30px -18px rgba(0,0,0,.8);border-left:5px solid #2DD4BF}
  .ld-cab{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 4px 8px;margin-bottom:6px;border-bottom:1px dashed #BFB395}
  .ld-num{flex:none;font:800 12px/1 Poppins,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#0B2D74}
  .ld-pasos{display:flex;gap:5px;flex:none}
  .ld-tag{margin-left:auto;padding:4px 9px;border-radius:99px;background:#0B2D74;color:#F6F1E4;font:700 11px/1.1 Inter,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}
  .ld-tag[hidden],.ld-tag:empty{display:none}
  .ld-espera{position:absolute;left:16px;right:16px;bottom:calc(84px + env(safe-area-inset-bottom));min-height:96px;margin:0;display:flex;gap:10px;align-items:center;justify-content:center;
    padding:12px 18px;box-sizing:border-box;border:1.5px dashed rgba(147,197,253,.4);border-radius:16px;color:#A9C4FF;font:500 15px/1.4 Inter,system-ui,sans-serif;text-align:left}
  .ld-espera[hidden]{display:none}
  .ld-espera .ld-lupa{flex:none;width:20px;height:20px;color:#2DD4BF}
  .ld.ld-pausa .ld-espera{visibility:hidden}
  .ld-pasos i{width:18px;height:6px;border-radius:9px;background:#0B2D74}
  .ld-pasos i+i{background:#CFC4A6}
  .ld-hoja.ld-p2 .ld-pasos i+i{background:#0B2D74}
  .ld-frase{display:flex;flex-wrap:wrap;align-items:center;row-gap:2px;column-gap:2px;min-height:48px}
  .ld-f{all:unset;box-sizing:border-box;position:relative;display:inline-flex;align-items:center;min-height:44px;min-width:30px;padding:0 6px;border-radius:9px;
    font:600 17px/1.2 Poppins,Inter,system-ui,sans-serif;color:#0B2D74;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none;
    background:transparent;box-shadow:inset 0 -2px 0 rgba(11,45,116,.18);transition:background .12s}
  .ld-f b{font-weight:inherit}
  .ld-f.ld-pega{padding-right:1px;margin-right:-2px}
  .ld-f.ld-junta{padding-left:1px}
  .ld-f:not([aria-disabled]):hover{background:rgba(45,212,191,.18)}
  .ld-f:not([aria-disabled]):active{background:rgba(45,212,191,.32)}
  .ld-f:focus-visible,.ld-o:focus-visible{outline:3px solid #FFD200;outline-offset:2px}
  .ld-f[aria-disabled]{cursor:default}
  .ld-f.ld-limpia{color:#14532D;background:#DDF3E4;box-shadow:inset 0 0 0 1.5px #86C99A}
  .ld-f.ld-limpia::before{content:"";flex:none;width:12px;height:7px;margin:0 6px 4px 0;border:solid #15803D;border-width:0 0 2.5px 2.5px;transform:rotate(-45deg)}
  .ld-f.ld-sosp{background:#FFD200;color:#0B2D74;box-shadow:inset 0 0 0 2px #0B2D74}
  .ld-f.ld-culpable{background:#B42330;color:#fff;box-shadow:none}
  .ld-f.ld-arreglo{background:#15803D;color:#fff;box-shadow:none;cursor:default;animation:ldEntra .25s ease-out}
  .ld-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  .ld-sello{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:2px;border-radius:inherit;background:rgba(246,241,228,.8);pointer-events:none}
  .ld-sello[hidden]{display:none}
  .ld-sello b{display:block;padding:8px 16px 6px;border:3px solid #B42330;border-radius:10px;color:#B42330;font:800 24px/1 Poppins,system-ui,sans-serif;
    letter-spacing:.06em;text-transform:uppercase;transform:rotate(-7deg);background:rgba(246,241,228,.92);animation:ldSello .35s cubic-bezier(.3,1.5,.5,1)}
  .ld-sello small{display:block;margin-top:10px;font:700 15px/1 Inter,system-ui,sans-serif;color:#0B2D74}
  .ld-ops{margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:114px;align-content:end;visibility:hidden}
  .ld-ops.ld-vis{visibility:visible}
  .ld-o{all:unset;box-sizing:border-box;position:relative;display:flex;align-items:center;justify-content:center;text-align:center;min-height:52px;padding:6px 12px;border-radius:14px;
    background:#fff;color:#0B2D74;font:700 17px/1.2 Poppins,Inter,system-ui,sans-serif;box-shadow:0 4px 0 #2DD4BF,0 12px 24px -12px rgba(0,0,0,.7);cursor:pointer;
    touch-action:manipulation;user-select:none;-webkit-user-select:none;overflow-wrap:anywhere;animation:ldEntra .2s ease-out}
  .ld-o:active{box-shadow:0 1px 0 #2DD4BF;transform:translateY(3px)}
  .ld-ops .ld-o:last-child:nth-child(odd){grid-column:1 / -1}
  .ld-o small{position:absolute;top:-7px;left:-7px;width:20px;height:20px;border-radius:50%;background:#0B2D74;color:#FFD200;font:800 11px/20px Poppins,system-ui,sans-serif;display:none}
  @media (pointer:fine){ .ld-o small{display:block} }
  .ld-o[aria-disabled]{cursor:default}
  .ld-o.ld-ok{background:#15803D;color:#fff;box-shadow:0 4px 0 #0E5A2B}
  .ld-o.ld-mal{background:#FFE1E3;color:#8A1C26;box-shadow:0 4px 0 #E5484D}
  .ld.ld-pausa .ld-hoja,.ld.ld-pausa .ld-ops{visibility:hidden}
  .ld.ld-listo .ld-hoja{box-shadow:0 0 0 2px #6BE58E,0 16px 30px -18px rgba(0,0,0,.8)}
  @media (max-height:700px){ .ld{gap:10px} .ld-ops{gap:8px;min-height:112px} }
  @keyframes ldEntra{from{transform:translateY(6px);opacity:0}to{transform:none;opacity:1}}
  @keyframes ldSello{from{transform:rotate(-7deg) scale(1.6);opacity:0}to{transform:rotate(-7deg) scale(1);opacity:1}}
  @media (prefers-reduced-motion:reduce){ .ld-f.ld-arreglo,.ld-o,.ld-sello b{animation:none} .ld-f{transition:none} }
  .ld-quieto .ld-f.ld-arreglo,.ld-quieto .ld-o,.ld-quieto .ld-sello b{animation:none}
  `;
  document.head.appendChild(st);
})();
