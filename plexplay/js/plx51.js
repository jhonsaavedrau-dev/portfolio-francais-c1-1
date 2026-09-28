/* PLEX PLAY 1.25.0 — Voice Duel y Roleplay Quest (familia «Voz»)
   - Voice Duel: sale una frase en francés (y su sentido en español); se toca el micrófono y se dice en voz alta.
     La voz se puntúa con spScore (qué parte de la frase se entendió) y aprueba con SP_PASS (75 %).
     Manzana es el rival: antes de hablar muestra el porcentaje al que apunta (sube con el nivel y la racha).
     Superarlo da más puntos; aprobar sin superarlo, menos. Hay dos intentos por frase y, si no se entiende,
     se muestra la frase y lo que se entendió sin quitar vida (el reconocimiento de voz también se equivoca).
     Sin micrófono (sin reconocimiento, con error de permiso o servicio, o con «No puedo hablar ahora») el mismo
     reto se juega de otra forma: suena la frase y se arma con fichas en orden, o se elige entre 3 escritas
     (sin homófonos). Ahí sí hay penalización y vida, como en Phrase Builder.
   - Roleplay Quest: una misión es una situación real armada con los ítems «choice» con escena (ctx) de una
     misma lección, de 3 a 5 pasos. En cada paso te dicen algo y respondes DICIENDO la opción adecuada; se
     reconoce cuál dijiste por las palabras que solo tiene esa opción. Si no se reconoce ninguna, se repite;
     al segundo intento sin reconocer, se puede tocar. Solo entran ítems cuyas opciones suenan distinto.
   - Mientras se escucha (Promise pendiente) el reloj del reto se detiene y no se aceptan otros toques; si la
     sesión se pausa o el motor se destruye durante la escucha, el resultado se ignora cuando llegue.
   - Todo el tiempo va por tick (la pausa lo congela). Teclado: Enter o espacio = micrófono, O = escuchar,
     1 a 9 = fichas u opciones. */
(function(){
  "use strict";
  var G = window.PLXG; if (!G || !G.sesion) return;
  var esc = G.esc, norm = G.norm, mezcla = G.mezcla, plano = G.plano;

  /* ---------------- puente con la voz de la app ---------------- */
  var PASA = function(){ try { return typeof SP_PASS === "number" ? SP_PASS : 75; } catch (e) { return 75; } };
  /* se prefiere window.* (así una prueba puede reemplazar la voz) y si no, la global de la app */
  var fnApp = function(n){ try { if (typeof window[n] === "function") return window[n]; } catch (e) {} try { var f = { speechSupport: typeof speechSupport === "function" ? speechSupport : null, speechListen: typeof speechListen === "function" ? speechListen : null, speak: typeof speak === "function" ? speak : null }[n]; return f || null; } catch (e) { return null; } };
  var hayVoz = function(){ try { var f = fnApp("speechSupport"); return !!f && !!f(); } catch (e) { return false; } };
  var oye = function(esperado){
    return new Promise(function(res, rej){
      try { var f = fnApp("speechListen"); if (!f) throw new Error("unsupported"); Promise.resolve(f(esperado)).then(res, rej); } catch (e) { rej(e); }
    });
  };
  var habla = function(txt, rate){ try { var f = fnApp("speak"); if (f) f(txt, rate); } catch (e) {} };
  var detenVoz = function(){
    try { if (typeof spStopRec !== "undefined" && spStopRec) spStopRec(); } catch (e) {}
    try { if (typeof spRec !== "undefined" && spRec) spRec.stop(); } catch (e) {}
    try { if (window.PlexAndroid && window.PlexAndroid.stopListening) window.PlexAndroid.stopListening(); } catch (e) {}
  };
  /* la primera frase del mensaje de la app (el resto, cómo dar permiso, ya lo explica la lección de pronunciación) */
  var textoError = function(m){ try { if (typeof spErrText === "function") { var r = spErrText(m); if (r && r.t) return (r.t.match(/^[^.]*\./) || [r.t])[0]; } } catch (e) {} return "El micrófono no está disponible."; };
  /* el usuario eligió jugar sin micrófono (o el micrófono falló) en esta sesión: vale también al remontar el motor en Boss Battle */
  var sinVozEn = null;
  var usaVoz = function(s){ return hayVoz() && sinVozEn !== s; };

  /* normalización igual a la de spScore (sin tildes, apóstrofo separado, guiones como espacio) */
  var nrm = function(x){ return String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/[’`´ʼ]/g, "'").replace(/'/g, "' ").replace(/[.,;:!?«»"()\[\]—–…]/g, " ").replace(/-/g, " ").replace(/\s+/g, " ").trim(); };
  var puntua = function(obj, dicho){
    try { if (typeof spScore === "function") { var r = spScore(obj, dicho); if (r && r.words) return r; } } catch (e) {}
    var T = nrm(obj).split(" ").filter(Boolean), H = nrm(dicho).split(" "), hit = T.map(function(w){ return H.indexOf(w) >= 0; });
    return { pct: T.length ? Math.round(hit.filter(Boolean).length / T.length * 100) : 0, hit: hit, words: T };
  };
  var lev = function(a, b){
    var p = [], i, j; for (j = 0; j <= b.length; j++) p[j] = j;
    for (i = 1; i <= a.length; i++) { var d = p[0], t; p[0] = i; for (j = 1; j <= b.length; j++) { t = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, d + (a[i - 1] === b[j - 1] ? 0 : 1)); d = t; } }
    return p[b.length];
  };
  /* homófonos: los de la app (spEq) + terminaciones mudas + una lista explícita */
  var HOMO = [["a", "as", "ah"], ["et", "est", "es", "ai", "aie", "e"], ["son", "sont"], ["ces", "ses", "sest", "sait", "sais"], ["ce", "se", "ceux"], ["ou", "aout", "houx"],
    ["sang", "cent", "sans", "sent", "sens"], ["vers", "verre", "vert", "ver", "verts", "vertes"], ["mer", "mere", "maire"], ["on", "ont"], ["la", "las"], ["peu", "peut", "peux"],
    ["quand", "quant", "camp", "kan"], ["mais", "mes", "met", "mets", "mai"], ["dans", "dent", "dents"], ["foi", "fois", "foie"], ["cour", "cours", "court", "courre"],
    ["pain", "pin", "peint", "peins"], ["voix", "voie", "vois", "voit"], ["temps", "tant", "tend", "tends", "taon"], ["faim", "fin", "feint"], ["compte", "conte", "comte"],
    ["cher", "chair", "chere", "chaire"], ["pere", "paire", "perd", "pair", "perds"], ["tout", "tous", "toux"], ["leur", "leurs"], ["du", "du"], ["sur", "sure"], ["ni", "nid"],
    ["si", "ci", "scie", "six"], ["mot", "maux"], ["haut", "eau", "au", "aux", "oh", "os"], ["lait", "laid", "les", "laie"], ["vin", "vingt", "vain", "vainc"],
    ["poids", "pois", "poix"], ["fait", "fais", "fee"], ["ete", "etait", "etais", "etaient", "etiez"], ["cet", "cette", "sept", "set"], ["pou", "pouce"], ["seau", "sot", "saut", "sceau"],
    ["verre"], ["cou", "coup", "cout", "coud"], ["port", "porc", "pore"], ["conte"], ["boue", "bout"], ["roue", "roux"], ["chant", "champ"], ["encre", "ancre"], ["sale", "salle"],
    ["tante", "tente"], ["col", "colle"], ["reine", "renne", "rene"], ["date", "datte"], ["balade", "ballade"], ["cygne", "signe"], ["mite", "mythe"], ["hotel", "autel"]];
  var HOMOI = {}; HOMO.forEach(function(g, k){ if (g.length > 1) g.forEach(function(w){ HOMOI[w] = k; }); });
  var clave = function(w){ w = nrm(w).replace(/[\s']/g, ""); return w.length > 3 ? w.replace(/(aient|ais|ait|ai|ez|er|ees|ee|es|ent|e|s|t|x|d|z|p)$/, "").replace(/(e|s|t)$/, "") : w; };
  var suenaIgual = function(a, b){
    if (a === b) return true;
    try { if (typeof spEq === "function" && spEq(a, b)) return true; } catch (e) {}
    var ka = clave(a), kb = clave(b); if (ka && ka === kb) return true;
    var ga = HOMOI[a.replace(/'/g, "")], gb = HOMOI[b.replace(/'/g, "")]; return ga != null && ga === gb;
  };

  /* ---------------- contenido: qué se puede decir ---------------- */
  var LET = /^[A-Za-zÀ-ÖØ-öø-ÿŒœÆæ' ,.!?;:-]+$/;
  var ES = /(^|[\s¿¡])(el|los|las|una|unos|unas|del|está|están|muy|pero|porque|para|cuando|también|hay|este|esta|esto|eso|más|qué|cómo|dónde|sí|yo|usted|ustedes|ellos|tiene|hace|frase|correcta|significa|palabra|oración|cuál|registro|ejemplo|respuesta|pregunta)(?=$|[\s,.;:!?])/i;
  var esES = function(t){ return /[¿¡ñ]/.test(t) || ES.test(t); };
  var limpia0 = function(t){ return plano(t || "").replace(/[’`]/g, "'").replace(/[\u00a0\u202f]/g, " ").replace(/^[—–-]\s*/, "").replace(/\s+/g, " ").trim(); };
  var limpia = function(t){
    /* las comillas se quitan solo si envuelven todo el texto; una escena con «… sin cerrar se cierra */
    t = limpia0(t);
    if (/^[«"“][^«»"“”]*[»"”]$/.test(t)) t = t.replace(/^[«"“]\s*|\s*[»"”]$/g, "");
    if ((t.match(/«/g) || []).length > (t.match(/»/g) || []).length) t = t + " »";
    return t.trim();
  };
  var nPal = function(t){ return String(t || "").split(/\s+/).filter(function(w){ return /\p{L}/u.test(w); }).length; };
  /* un rótulo al principio («Registro soutenu: …», «Exemple : …») no se dice */
  var rotulo = function(t){ var i = t.indexOf(":"); return i >= 0 && nPal(t.slice(0, i)) <= 3; };
  var decible = function(t, min, max){
    return !!t && t.length <= 90 && LET.test(t) && !/\b[A-ZÀ-Ý]{2,}\b/.test(t) && !esES(t) && !rotulo(t) && !/\s[,;:.]|^[,;:.!?'-]|''|--/.test(t) && nPal(t) >= min && nPal(t) <= max;
  };
  var unir = function(tokens){ return tokens.join(" ").replace(/\s+([,.])/g, "$1").replace(/'\s+/g, "'").replace(/\s+/g, " ").trim(); };
  var ARTS = /^(le|la|les|l'|un|une|des|du|de|d'|au|aux)$/;
  var tieneHomofono = function(w){ return nrm(w).split(" ").some(function(x){ return !ARTS.test(x) && HOMOI[x.replace(/'/g, "")] != null; }); };
  /* filtro de seguridad: una frase armada al meter la respuesta en el hueco puede quedar sin elisión («Je en propose»,
     «que il isole», «si il»). Esas frases no se dicen ni se muestran como modelo. Ante la duda se descarta: una h
     que no está en la lista de h aspiradas cuenta como muda. */
  var HASP = /^h(?:ach|aie|aine|aï|ais|ait|all|alte|amac|ameau|amster|anche|andica|angar|ant|arcel|ardi|areng|aricot|arpe|asard|âte|âti|auss|aut|éros|érisson|être|eurt|ibou|iérarch|iss|och|ockey|olland|omard|ongr|ont|oquet|ors|oul|ouss|u[eé]|uit|url|utt)/i;
  var ELI = /(^|[^A-Za-zÀ-ÖØ-öø-ÿ'’])(je|me|te|se|le|la|ne|de|que|jusque|lorsque|puisque)\s+([A-Za-zÀ-ÖØ-öø-ÿŒœ]+)/gi;
  var sinElision = function(f){
    f = String(f || "");
    if (/(^|[^A-Za-zÀ-ÖØ-öø-ÿ'’])si\s+ils?\b/i.test(f) || /(^|[^A-Za-zÀ-ÖØ-öø-ÿ'’])ce\s+(est|était|étaient)\b/i.test(f)) return true;
    var m; ELI.lastIndex = 0;
    while ((m = ELI.exec(f))) {
      var w = m[3], cl = m[2].toLowerCase();
      if (/^[aeiouàâäéèêëîïôöûüœ]/i.test(w)) return true;
      if (/^y$/i.test(w) && cl !== "le" && cl !== "la" && cl !== "de") return true;
      if (/^h/i.test(w) && !HASP.test(w)) return true;
      ELI.lastIndex = m.index + m[1].length + m[2].length;
    }
    return false;
  };
  /* corta el audio que esté sonando (mp3 del mapa AUDIO o síntesis de voz) */
  var callaAudio = function(){
    try { if (typeof stopAudio === "function") stopAudio(); } catch (e) {}
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  };

  /* Voice Duel: una frase de 3 a 12 palabras por ítem (order, o la frase completa de un choice/fill) */
  var retoVoz = function(it, key, l){
    if (!it) return null;
    var f = "", es = "", ctx = it.ctx ? limpia(it.ctx) : "";
    if (it.k === "order" && it.tokens) {
      f = unir(it.tokens.map(String));
      var m = plano(it.ask || "").match(/[«"“]([^»"”]+)[»"”]/); es = m ? m[1].trim() : "";
      /* las fichas no traen el punto final: se toma del sentido en español (¿…? → ?) */
      if (f && !/[.?!]$/.test(f)) { var fin = (es.match(/[.?!]$/) || ["."])[0]; f += fin === "." ? "." : " " + fin; }
    } else if (it.k === "choice" || it.k === "fill") {
      var ok = limpia(it.k === "choice" ? (it.o ? it.o[it.a] : "") : (it.acc ? it.acc[0] : ""));
      if (!ok) return null;
      var q = plano(it.q || "").replace(/[\u00a0\u202f]/g, " ");
      if (/_{2,}/.test(q)) {
        var seg = q.split(/\s*[—–]\s*/).filter(function(x){ return /_{2,}/.test(x); })[0] || q;
        /* «Quelle problématique convient ? ___»: la pregunta es la consigna, no parte de la frase */
        if (/[?:]\s*$/.test(seg.split(/_{2,}/)[0])) return null;
        f = G.completa(seg, ok);
        /* solo oraciones completas: un grupo nominal suelto («La valeur de ce diplôme») no es una frase para decir */
        if (!/[.?!]$/.test(limpia(f))) return null;
      }
      else if (it.k === "choice" && /[.?!]$/.test(ok) && /^\p{Lu}/u.test(ok)) f = ok;
    }
    f = limpia(f);
    if (!decible(f, 3, 12) || sinElision(f)) return null;
    return { tipo: "voz", ask: "Dilo en voz alta", q: f, es: es, ctx: ctx && ctx.length <= 140 ? ctx : "", correcta: [f], malas: [], why: it.why || "", hab: it.t || "autre", key: key, lessonId: l ? l.id : "" };
  };
  var conPozo = function(out){
    var vistos = {}, lista = out.filter(function(r){ var k = norm(r.q); if (vistos[k]) return false; vistos[k] = 1; return true; });
    var pozo = lista.map(function(r){ return r.q; });
    lista.forEach(function(r){ r.pozo = pozo; });
    return lista;
  };
  var retosVD = function(alc){
    var out = [];
    if (alc.tema) {
      var a1 = alc.track === "a1";
      (alc.tema.i || []).forEach(function(x){
        var why = "<b>" + esc(x.fr) + "</b> = " + esc(x.es) + (x.ex ? "<br><i>" + esc(x.ex) + "</i>" : "");
        var ex = limpia(x.ex || "");
        if (decible(ex, 3, 12) && !sinElision(ex)) out.push({ tipo: "voz", ask: "Dilo en voz alta", q: ex, es: limpia(x.exes || ""), correcta: [ex], malas: [], why: why, hab: "vocab", key: null, lessonId: "", voc: x });
        var w = limpia(x.fr || "");
        if (a1 && decible(w, 1, 3) && !tieneHomofono(w)) out.push({ tipo: "voz", ask: "Dilo en voz alta", q: w, es: limpia(x.es || ""), correcta: [w], malas: [], why: why, hab: "vocab", key: null, lessonId: "", voc: x, palabra: true });
      });
    } else {
      (alc.lecciones || []).forEach(function(l){ (l.items || []).forEach(function(it, i){ var r = retoVoz(it, l.id + ":" + i, l); if (r) out.push(r); }); });
    }
    return conPozo(out);
  };

  /* Roleplay Quest: palabras que solo tiene cada opción (así se reconoce cuál se dijo) */
  var palabras = function(t){ return nrm(t).split(" ").filter(Boolean); };
  var unicas = function(ops){
    return ops.map(function(o, i){
      var otras = {}; ops.forEach(function(p, j){ if (j !== i) palabras(p).forEach(function(w){ otras[w] = 1; }); });
      return palabras(o).filter(function(w){ return !otras[w]; });
    });
  };
  var FUNC = /^(le|la|les|l|un|une|des|du|de|d|au|aux|en|a|y|ma|ta|sa|mon|ton|son|mes|tes|ses|ce|cet|se|me|te|ne|n|et|il|on|je|j|tu|qu|c|s|m|t)$/;
  var distinguibles = function(U){
    /* cada opción necesita una palabra propia con contenido: «le / la / l'» no se distinguen bien por voz */
    if (U.some(function(u){ return !u.length || (u.join("").replace(/'/g, "").length < 4 && !u.some(function(w){ w = w.replace(/'/g, ""); return w.length >= 2 && !FUNC.test(w); })); })) return false;
    for (var i = 0; i < U.length; i++) for (var j = i + 1; j < U.length; j++) {
      if (U[i].some(function(a){ return U[j].some(function(b){ return suenaIgual(a, b); }); })) return false;
      var a2 = U[i].join("").replace(/'/g, ""), b2 = U[j].join("").replace(/'/g, "");
      if (lev(a2, b2) <= Math.max(1, Math.round(Math.max(a2.length, b2.length) * .25))) return false;
    }
    return true;
  };
  var pasoMision = function(it, key, l, por){
    var no = function(r){ if (por) por.push(r); return null; };
    if (!it || it.k !== "choice" || !it.ctx || !it.o || it.o.length < 2 || it.o.length > 5 || it.o[it.a] == null) return no("tipo");
    /* los ítems que dependen de un audio («Écoutez la phrase…») no son una conversación */
    if (it.say || it.audio) return no("audio");
    var ops = it.o.map(limpia);
    if (!ops.every(function(o){ return o.length <= 44 && decible(o, 1, 8); })) return no("opciones: " + ops.join(" / "));
    /* si las opciones suenan igual (mange / mangent), el paso se responde tocando */
    var U = unicas(ops), voz = distinguibles(U);
    var ctx = limpia(it.ctx); if (!ctx || ctx.length > 150) return no("escena");
    var q = plano(it.q || "").replace(/[\u00a0\u202f]/g, " ").replace(/\s+/g, " ").trim(), personaje = "", linea = "", luego = "", pide = "", pista = "";
    if (/_{2,}/.test(q)) {
      var seg = q.split(/\s*[—–]\s*/).map(function(x){ return x.trim(); }).filter(Boolean), k = -1;
      seg.forEach(function(x, i){ if (k < 0 && /_{2,}/.test(x)) k = i; });
      personaje = seg.slice(0, k).join(" "); linea = seg[k]; luego = seg.slice(k + 1).join(" ");
      /* la pista del final («(debajo)», «(avoir)») va aparte: no es parte de lo que se dice */
      var mp = linea.match(/\s*\(([^()]{1,40})\)\s*\.?\s*$/);
      if (mp) { pista = mp[1].trim(); linea = linea.slice(0, mp.index).trim(); }
      if (esES(linea) || linea.length > 110) return no("línea: " + linea);
      if (!ops.every(function(o){ var c = G.completa(linea, o); return c && LET.test(c.replace(/[()]/g, "")); })) return no("completa: " + linea);
      /* la respuesta se muestra dentro de la línea tal cual («Je ___ propose» → «Je en propose»): sin elisión, fuera */
      if (sinElision(linea.replace(/_{2,}/, ops[it.a])) || sinElision(G.completa(linea, ops[it.a]))) return no("elisión: " + linea);
    } else if (/→\s*$/.test(q)) pide = "Quieres decir: «" + q.replace(/\s*→\s*$/, "") + "»";
    else if (esES(q) || /^¿/.test(q)) {
      /* «¿Cuál es correcta?» es una consigna de ejercicio, no una situación */
      if (/^¿?\s*(cuál|qué opción|qué frase)\s.*(correcta|adecuada|correcto)/i.test(q)) return no("consigna: " + q);
      pide = q;
    }
    else personaje = q;
    /* sin línea que completar ni intención que expresar, el paso es una pregunta de examen («Quelle notion
       proustienne…», «Quel écrivain a refusé…»), no una conversación: no entra en la misión */
    if (!linea && !pide) return no("pregunta de examen: " + q);
    if (personaje.length > 150 || luego.length > 110 || pide.length > 120) return no("largo");
    var cuerpo = linea ? G.completa(linea, ops[it.a]) : ops[it.a];
    if (por && !voz) por.push("tocar: " + ops.join(" / "));
    return { tipo: "mision", voz: voz, ask: "Resuelve la situación hablando", q: (personaje ? "«" + personaje + "» " : "") + (linea || pide || ctx), escena: ctx, personaje: personaje, linea: linea, luego: luego, pide: pide, pista: pista,
      opciones: ops, a: it.a, unicas: U, correcta: [ops[it.a]], malas: ops.filter(function(_, i){ return i !== it.a; }), bien: cuerpo,
      why: it.why || "", hab: it.t || "autre", key: key, lessonId: l ? l.id : "" };
  };
  var misiones = function(lecciones){
    var out = [];
    (lecciones || []).forEach(function(l){
      var pasos = []; (l.items || []).forEach(function(it, i){ var p = pasoMision(it, l.id + ":" + i, l); if (p) pasos.push(p); });
      /* una misión se juega hablando: al menos 2 pasos de voz y 40 % de la misión */
      var vz = pasos.filter(function(p){ return p.voz; }).length, maxTap = Math.floor(vz * 1.5), tap = 0;
      if (vz < 2) return;
      pasos = pasos.filter(function(p){ return p.voz || tap++ < maxTap; });
      if (pasos.length < 3) return;
      var nM = Math.ceil(pasos.length / 5), base = Math.floor(pasos.length / nM), extra = pasos.length % nM, k = 0, m2 = 0;
      for (var m = 0; m < nM; m++) {
        var n = base + (m < extra ? 1 : 0), g = pasos.slice(k, k + n); k += n;
        if (g.filter(function(p){ return p.voz; }).length < 2) continue;
        g.forEach(function(p, i){ Object.assign(p, { mision: l.id + "#" + m2, titulo: limpia(l.title || ""), paso: i, pasos: g.length }); out.push(p); });
        m2++;
      }
    });
    return out;
  };
  /* la lista de la partida: misiones mezcladas, pasos en orden, varias vueltas para no quedarse sin retos */
  var planMisiones = function(alc){
    var lista = misiones(alc.lecciones), grupos = {}, ids = [];
    lista.forEach(function(p){ if (!grupos[p.mision]) { grupos[p.mision] = []; ids.push(p.mision); } grupos[p.mision].push(p); });
    var plan = [];
    for (var v = 0; v < 6 && ids.length && plan.length < 60; v++) mezcla(ids).forEach(function(id){ plan.push.apply(plan, grupos[id]); });
    return plan;
  };

  /* ---------------- piezas para armar sin micrófono ---------------- */
  var PEGA = /^(le|la|les|l'|un|une|des|du|de|d'|au|aux|à|en|je|j'|tu|il|elle|on|nous|vous|ils|elles|ne|n'|me|m'|te|t'|se|s'|y|qu'|c'|ce|cet|cette|ces|mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leur|leurs|très|plus|pas)$/i;
  var piezasDe = function(f){
    var ws = f.replace(/\s+([?!:;»])/g, "¤$1").split(/\s+/).filter(Boolean), out = [], acum = "";
    ws.forEach(function(w, i){
      acum = acum ? acum + " " + w : w;
      var l = w.replace(/[.,!?;:¤»]+$/g, "").toLowerCase();
      if (i < ws.length - 1 && (PEGA.test(l) || /'$/.test(l))) return;
      out.push(acum); acum = "";
    });
    if (acum) out.push(acum);
    while (out.length > 7) {
      var k = 0, min = 1e9;
      for (var i = 0; i < out.length - 1; i++) { var n = out[i].length + out[i + 1].length; if (n < min) { min = n; k = i; } }
      out.splice(k, 2, out[k] + " " + out[k + 1]);
    }
    return out.map(function(p){ return p.replace(/¤/g, " "); });
  };
  /* otras frases escritas para elegir la que sonó: ninguna puede sonar parecida */
  var distintaDe = function(a, b){
    if (norm(a) === norm(b)) return false;
    if (puntua(a, b).pct >= 50 || puntua(b, a).pct >= 50) return false;
    var wa = palabras(a).filter(function(w){ return !ARTS.test(w); }), wb = palabras(b).filter(function(w){ return !ARTS.test(w); });
    return !wa.some(function(x){ return wb.some(function(y){ return suenaIgual(x, y); }); });
  };
  var opcionesEscritas = function(r){
    var n = nPal(r.q), cand = mezcla((r.pozo || []).filter(function(p){ return Math.abs(nPal(p) - n) <= Math.max(1, Math.round(n * .5)) && distintaDe(r.q, p); }));
    var elegidas = [];
    cand.forEach(function(p){ if (elegidas.length < 2 && elegidas.every(function(e){ return distintaDe(e, p); })) elegidas.push(p); });
    return mezcla([r.q].concat(elegidas));
  };

  /* ---------------- piezas de interfaz compartidas ---------------- */
  /* la coma final de una opción («Pour moi,») no se muestra en la ficha */
  var vistaOp = function(o){ return String(o).replace(/\s*,$/, ""); };
  var MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="2.5" width="7" height="12" rx="3.5"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3.5M8.5 21h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var OIR = G.ICONO_OIR || '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z"/></svg>';
  var centroDe = function(el, zona){ if (!el) return { x: zona.clientWidth / 2, y: zona.clientHeight / 2 }; var a = el.getBoundingClientRect(), b = zona.getBoundingClientRect(); return { x: a.left - b.left + a.width / 2, y: a.top - b.top }; };
  var posDe = function(el){ if (!el || el.hidden || !el.isConnected) return null; var r = el.getBoundingClientRect(); if (!r.width) return null; return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) }; };

  /* las caras de Manzana del duelo se cargan en la portada, para que no aparezcan vacías al cambiar */
  var caras = null;
  var precargaCaras = function(){ if (caras) return; caras = ["frenesi", "bien", "mal"].map(function(e){ try { var im = new Image(); im.src = G.mzImg(e); return im; } catch (x) { return null; } }); };

  /* ================= Voice Duel ================= */
  function motorVoz(zona, s){
    var reto = null, modo = "voz", t = 0, T = 1, hecho = false, cierre = -1, escuchando = false, token = 0, vivo = true;
    var intentos = 0, rival = 80, ultimo = null, piezas = [], fichas = [], paso = 0, malos = 0, ops = [], aviso = "", lento = false;
    /* escucha que no termina: tEsc suma el tiempo jugado escuchando y corte es el plazo tras el segundo toque del micrófono */
    var tEsc = 0, corte = null;
    zona.innerHTML = '<div class="vd' + (s.mov ? " vd-quieto" : "") + '"><div class="vd-reloj"><i></i></div><div class="vd-medio"></div><p class="vd-msg" aria-live="polite"></p><div class="vd-pie"></div></div>';
    precargaCaras();
    /* dentro de Boss Battle el rival del duelo es el jefe (su nombre sale de la barra de la sesión), no Manzana */
    var jefe = "";
    var buscaJefe = function(){ try { if (s.juego && s.juego.id === "vd") return ""; var jv = s.el.querySelector(".plxg-jv"), b = jv && jv.parentNode.querySelector("b"); return b ? b.textContent.trim() : ""; } catch (e) { return ""; } };
    var rivalNombre = function(){ return jefe || "Manzana"; };
    s.el.classList.add("vd-on");
    var raiz = zona.querySelector(".vd"), medio = zona.querySelector(".vd-medio"), msgEl = zona.querySelector(".vd-msg"), pie = zona.querySelector(".vd-pie"), reloj = zona.querySelector(".vd-reloj i");
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 10) + "px"; };
    var msg = function(txt, clase){ msgEl.textContent = txt || ""; msgEl.className = "vd-msg" + (clase ? " " + clase : ""); };
    /* cada toque de «escuchar» alterna velocidad normal y lenta; la etiqueta dice cómo sonará el siguiente */
    var etOir = function(){ return lento ? "Más despacio" : modo === "voz" ? "Escuchar el modelo" : "Otra vez"; };
    var ariaOir = function(){ return lento ? "Escuchar la frase más despacio" : "Escuchar la frase otra vez"; };
    var botonOir = function(){ return ' <button class="plxg-oir vd-oirb" data-vd-b="oir" aria-label="' + ariaOir() + '">' + OIR + "<span>" + etOir() + "</span></button>"; };
    var refrescaOir = function(){
      s.el.querySelectorAll("[data-vd-b=oir]").forEach(function(b){ var sp = b.querySelector("span"); if (sp) sp.textContent = etOir(); if (b.classList.contains("vd-oirb")) b.setAttribute("aria-label", ariaOir()); });
    };

    var banner = function(){
      if (!reto) return;
      var h;
      if (modo === "voz") {
        h = '<p class="plxg-ask">' + (intentos ? "Segundo intento: dilo otra vez" : reto.palabra ? "Di la palabra en voz alta" : "Dilo en voz alta") + '</p><p class="plxg-q"><span lang="fr">' + esc(reto.q) + "</span>" +
          (reto.es ? '<span class="tr vd-es">' + esc(reto.es) + "</span>" : reto.ctx ? '<span class="tr vd-es">' + esc(reto.ctx) + "</span>" : "") + "</p>";
      } else {
        var sentido = reto.es || reto.ctx || "";
        h = '<p class="plxg-ask">' + (modo === "fichas" ? "Escucha y arma la frase" : reto.palabra ? "Escucha y elige la palabra que sonó" : "Escucha y elige la frase que sonó") + '</p><p class="plxg-q vd-qalt">' +
          (sentido ? '<span class="tr">' + esc(sentido) + "</span>" : "") + botonOir() + "</p>";
      }
      s.banner(h, { oro: reto.oro });
      coloca();
    };
    var pintaDuelo = function(){
      var pct = ultimo ? ultimo.sc.pct : null, pasa = PASA();
      /* Manzana cambia de cara: te reta, se sorprende si le ganas y celebra si no lo superas */
      var cara = pct == null ? "frenesi" : pct > rival && pct >= pasa ? "mal" : "bien";
      return '<div class="vd-duelo" role="group" aria-label="Duelo con ' + esc(rivalNombre()) + '">' +
        '<div class="vd-lado vd-tu' + (pct != null ? (pct >= pasa ? (pct > rival ? " gana" : " pasa") : " no") : "") + '"><span class="vd-cab"><span class="vd-ava vd-ava-tu" aria-hidden="true">' + MIC + '</span><small>Tú</small></span><b>' + (pct == null ? "—" : pct + " %") + '</b><span class="vd-barra"><i style="width:' + (pct || 0) + '%"></i><em style="left:' + pasa + '%"></em></span></div>' +
        '<span class="vd-vs" aria-hidden="true">VS</span>' +
        '<div class="vd-lado vd-rival"><span class="vd-cab">' + (jefe ? '<span class="vd-ava vd-ava-jefe" aria-hidden="true">' + esc(jefe.replace(/^(Le |La |L')/, "").charAt(0).toUpperCase()) + "</span><small>El jefe</small>" : '<img class="vd-ava" src="' + G.mzImg(cara) + '" alt=""><small>Manzana</small>') + '</span><b>' + rival + ' %</b><span class="vd-barra"><i style="width:' + rival + '%"></i><em style="left:' + pasa + '%"></em></span></div></div>' +
        (ultimo ? "" : '<p class="vd-nota">Apruebas desde ' + pasa + " %. Si superas el porcentaje " + (jefe ? "del jefe" : "de Manzana") + ", ganas más.</p>");
    };
    var pintaDicho = function(){
      if (!ultimo) return '<div class="vd-dicho" hidden></div>';
      var sc = ultimo.sc;
      return '<div class="vd-dicho"><p class="vd-pal" lang="fr">' + sc.words.map(function(w, i){ return '<span class="' + (sc.hit[i] ? "ok" : "ko") + '">' + esc(w) + "</span>"; }).join(" ") + "</p>" +
        '<p class="vd-oido"><span>Se entendió</span> <q lang="fr">' + esc(ultimo.a || "(nada)") + "</q></p></div>";
    };
    var pintaMedio = function(){
      if (modo === "voz") medio.innerHTML = pintaDuelo() + pintaDicho();
      else if (modo === "fichas") {
        medio.innerHTML = '<div class="vd-linea" aria-live="polite">' + piezas.map(function(p, i){ return i < paso ? '<span class="vd-p ok" lang="fr">' + esc(p) + "</span>" : '<span class="vd-p vacio" aria-hidden="true"></span>'; }).join("") + "</div>" +
          '<div class="vd-bandeja" role="group" aria-label="Fichas">' + fichas.map(function(f, i){
            /* la ficha usada deja un hueco del mismo tamaño: las demás no se mueven bajo el dedo */
            return f.usada ? '<span class="vd-f vd-fh" aria-hidden="true" lang="fr">' + esc(f.t) + "</span>" : '<button class="vd-f" data-vd-f="' + i + '" lang="fr"><small aria-hidden="true"></small>' + esc(f.t) + "</button>"; }).join("") + "</div>";
        medio.querySelectorAll("button.vd-f small").forEach(function(sm, k){ sm.textContent = k < 9 ? String(k + 1) : ""; });
      } else {
        medio.innerHTML = '<div class="vd-ops" role="group" aria-label="Opciones">' + ops.map(function(o, i){ return '<button class="vd-op" data-vd-op="' + i + '" lang="fr"><small aria-hidden="true">' + (i + 1) + "</small>" + esc(o) + "</button>"; }).join("") + "</div>";
      }
    };
    var pintaPie = function(){
      if (!reto) { pie.innerHTML = ""; return; }
      if (modo === "voz") {
        pie.innerHTML = '<button class="vd-mic' + (escuchando ? " oye" : "") + '" data-vd-b="mic" aria-label="' + (escuchando ? "Te escucho. Toca para terminar" : "Tocar y hablar") + '"' + (hecho ? " disabled" : "") + ">" + MIC + "</button>" +
          '<div class="vd-acc"><button class="vd-sec" data-vd-b="oir"' + (escuchando ? " disabled" : "") + ">" + OIR + "<span>" + etOir() + "</span></button>" +
          '<button class="vd-sec" data-vd-b="sinmic"' + (hecho ? " disabled" : "") + "><span>No puedo hablar ahora</span></button></div>";
      } else {
        pie.innerHTML = hayVoz() ? '<div class="vd-acc solo"><button class="vd-sec" data-vd-b="conmic"' + (hecho ? " disabled" : "") + ">" + MIC + "<span>Usar el micrófono</span></button></div>" : "";
      }
    };
    var pinta = function(){ banner(); pintaMedio(); pintaPie(); raiz.setAttribute("data-vd-modo", modo); pie.classList.toggle("vd-alt", modo !== "voz"); };

    var altModo = function(r){ return piezasDe(r.q).length >= 3 ? "fichas" : "elige"; };
    var prepara = function(){
      t = 0; paso = 0; malos = 0; ultimo = null; intentos = 0; lento = false; tEsc = 0; corte = null;
      if (modo === "voz") {
        var racha = s.pts ? s.pts.racha : 0;
        rival = Math.min(96, Math.round(PASA() + 5 + s.nivel * 4 + Math.min(racha, 8) * 1.5));
        T = s.dir.t() * 1.6 + .6 * nPal(reto.q) + 5;
        msg(aviso || "Toca el micrófono y di la frase.");
      } else if (modo === "fichas") {
        piezas = piezasDe(reto.q);
        fichas = mezcla(piezas.map(function(p){ return { t: p, usada: false }; }));
        if (fichas.every(function(f, i){ return f.t === piezas[i]; })) fichas.push(fichas.shift());
        T = s.dir.t() * 1.4 + 1.1 * piezas.length + 3;
        msg(aviso || "Toca las fichas en el orden en que suena la frase.");
      } else {
        ops = opcionesEscritas(reto);
        T = s.dir.t() * 1.5 + 4;
        msg(aviso || "Toca lo que oíste.");
      }
      aviso = "";
      pinta();
      reloj.style.transform = "scaleX(1)"; reloj.parentNode.classList.remove("poco");
      if (modo !== "voz") habla(reto.q);
    };

    var jugar = function(r){
      reto = r; hecho = false; cierre = -1; token++; escuchando = false; tEsc = 0; corte = null; jefe = buscaJefe();
      raiz.classList.remove("vd-listo");
      modo = usaVoz(s) ? "voz" : altModo(r);
      prepara();
    };
    var limpiaR = function(){ reto = null; medio.innerHTML = ""; pie.innerHTML = ""; msg(""); raiz.classList.remove("vd-listo"); reloj.style.transform = "scaleX(1)"; };
    var cierra = function(){ limpiaR(); s.listo(); };

    /* ---- voz ---- */
    var microfono = function(){
      if (!reto || modo !== "voz") return;
      if (escuchando) { detenVoz(); return; }
      if (hecho || s.estado() !== "juega") return;
      G.despiertaAudio();
      escuchando = true; var tk = ++token;
      msg("Te escucho… di la frase ahora.", "oye"); pintaPie();
      oye(reto.q).then(function(alts){
        if (tk !== token || !vivo) return;
        escuchando = false;
        if (!reto || hecho || s.estado() !== "juega") { pintaPie(); return; }
        evalua([].concat(alts || []).filter(function(a){ return typeof a === "string" && a.trim(); }));
      }, function(err){
        if (tk !== token || !vivo) return;
        escuchando = false;
        if (!reto || hecho || s.estado() !== "juega") { pintaPie(); return; }
        errorVoz(err);
      });
    };
    var errorVoz = function(err){
      var m = String((err && err.message) || err || "");
      if (/no-speech|no.match|timeout|cancelled|aborted/i.test(m)) { msg("No te escuché. Toca el micrófono y di la frase con voz clara.", "mal"); pintaPie(); return; }
      /* sin micrófono, permiso o servicio: el mismo reto sigue de otra forma */
      sinVozEn = s;
      aviso = textoError(m) + " Seguimos sin micrófono.";
      modo = altModo(reto); prepara();
    };
    var evalua = function(alts){
      if (!alts.length) { msg("No te escuché. Toca el micrófono y di la frase con voz clara.", "mal"); pintaPie(); return; }
      var mejor = null;
      alts.forEach(function(a){ var sc = puntua(reto.q, a); if (!mejor || sc.pct > mejor.sc.pct) mejor = { a: a, sc: sc }; });
      ultimo = mejor;
      var pct = mejor.sc.pct, pasa = PASA(), c = centroDe(pie.querySelector(".vd-mic"), zona);
      if (pct >= pasa) {
        hecho = true;
        var gana = pct > rival;
        s.acierto(reto, { rapidez: gana ? Math.min(1, (pct - pasa) / (100 - pasa)) : 0, x: c.x, y: c.y, final: true });
        if (gana) { var tu = centroDe(medio.querySelector(".vd-tu"), zona); s.extra(25, tu.x + 44, tu.y + 62); }
        msg(gana ? "Ganaste el duelo: " + pct + " % contra " + rival + " %." : "Se entendió (" + pct + " %), pero " + (jefe ? "el jefe" : "Manzana") + " apuntaba a " + rival + " %.", "bien");
        raiz.classList.add("vd-listo");
        pintaMedio(); pintaPie();
        cierre = 1.6;
        return;
      }
      intentos++;
      if (intentos < 2) {
        T += 4;
        msg("Se entendió el " + pct + " % y hace falta " + pasa + " %. Escucha el modelo y dilo otra vez.", "mal");
        banner(); pintaMedio(); pintaPie();
        return;
      }
      hecho = true; msg("No se entendió (" + pct + " %). Mira la frase y lo que se entendió.", "mal"); pintaMedio(); pintaPie();
      s.escapa(reto, { titulo: "No se entendió la frase", etiqueta: "La frase", bien: reto.q, q: reto.es || reto.ctx || reto.q,
        why: "Se entendió: <i>«" + esc(mejor.a) + "»</i> (" + pct + " %). La voz mide si se entiende, no cada sonido." + (reto.why ? "<br>" + reto.why : "") })
        .then(function(){ cierra(); });
    };

    /* ---- sin micrófono: fichas o elegir ---- */
    var eligeFicha = function(i, el){
      if (!reto || hecho || modo !== "fichas" || s.estado() !== "juega") return;
      var f = fichas[i]; if (!f || f.usada) return;
      G.despiertaAudio();
      var c = centroDe(el, zona);
      if (norm(f.t) === norm(piezas[paso])) {
        f.usada = true; paso++;
        if (paso >= piezas.length) {
          hecho = true;
          s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: c.x, y: c.y, final: true });
          raiz.classList.add("vd-listo"); msg("La frase está completa.", "bien");
          pintaMedio(); pintaPie(); cierre = .7;
        } else { G.sfx("paso", paso); s.extra(15, c.x, c.y); pintaMedio(); }
        return;
      }
      malos++;
      if (el) { el.classList.remove("vd-mal"); void el.offsetWidth; el.classList.add("vd-mal"); }
      if (malos < 2) { s.penaliza(c.x, c.y); G.vibra(40); msg("Esa ficha no va ahí. Escucha otra vez.", "mal"); return; }
      hecho = true; pintaPie();
      s.fallo(reto, { mal: f.t, etMal: "Tocaste", etiqueta: "La frase", bien: reto.q, q: reto.es || reto.ctx || "Frase que sonó" }).then(function(){ cierra(); });
    };
    var eligeOpcion = function(i, el){
      if (!reto || hecho || modo !== "elige" || s.estado() !== "juega") return;
      var o = ops[i]; if (o == null) return;
      G.despiertaAudio();
      var c = centroDe(el, zona);
      hecho = true;
      if (norm(o) === norm(reto.q)) {
        if (el) el.classList.add("ok");
        s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: c.x, y: c.y, final: true });
        msg("Eso fue lo que sonó.", "bien"); pintaPie(); cierre = .7;
        return;
      }
      if (el) el.classList.add("vd-mal");
      pintaPie();
      s.fallo(reto, { mal: o, etMal: "Elegiste", etiqueta: "Sonó", bien: reto.q, q: reto.es || reto.ctx || "Frase que sonó" }).then(function(){ cierra(); });
    };

    /* ---- entrada ---- */
    var clic = function(e){
      var b = e.target.closest && e.target.closest("[data-vd-b],[data-vd-f],[data-vd-op]");
      if (!b || !s.el.contains(b) || b.disabled) return;
      if (b.hasAttribute("data-vd-b")) {
        var a = b.getAttribute("data-vd-b");
        if (a === "oir") { if (reto && !escuchando) { habla(reto.q, lento ? .7 : 1); lento = !lento; } return; }
        if (!reto || s.estado() !== "juega") return;
        if (a === "mic") return microfono();
        if (escuchando || hecho) return;
        if (a === "sinmic") { sinVozEn = s; modo = altModo(reto); aviso = "Sin micrófono: escucha la frase y respóndela tocando."; prepara(); return; }
        if (a === "conmic" && hayVoz()) { sinVozEn = null; modo = "voz"; prepara(); return; }
        return;
      }
      if (escuchando) return;
      if (b.hasAttribute("data-vd-f")) eligeFicha(+b.getAttribute("data-vd-f"), b);
      else eligeOpcion(+b.getAttribute("data-vd-op"), b);
    };
    s.el.addEventListener("click", clic);
    window.addEventListener("resize", coloca);

    return {
      jugar: jugar,
      tick: function(dt){
        if (!reto) return;
        if (cierre >= 0) { if (!dt) return; cierre -= dt; if (cierre < 0) cierra(); return; }
        if (hecho || escuchando || !dt) return;
        t += dt;
        reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        reloj.parentNode.classList.toggle("poco", t / T > .75);
        if (t >= T) {
          hecho = true; pintaPie();
          s.escapa(reto, { titulo: "Se acabó el tiempo", etiqueta: modo === "voz" ? "La frase" : "Sonó", bien: reto.q, q: reto.es || reto.ctx || reto.q }).then(function(){ cierra(); });
        }
      },
      tecla: function(e){
        if (!reto) return;
        if (e.key === "o" || e.key === "O") { if (!escuchando) habla(reto.q); return; }
        if (modo === "voz") { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); microfono(); } return; }
        if (!/^[1-9]$/.test(e.key) || escuchando) return;
        var bs = medio.querySelectorAll(modo === "fichas" ? ".vd-f" : ".vd-op"), b = bs[+e.key - 1];
        if (!b) return;
        e.preventDefault();
        if (modo === "fichas") eligeFicha(+b.getAttribute("data-vd-f"), b); else eligeOpcion(+b.getAttribute("data-vd-op"), b);
      },
      pausa: function(){
        if (!escuchando) return;
        token++; escuchando = false; detenVoz();
        msg("Se pausó mientras te escuchaba: vuelve a tocar el micrófono.", "mal"); pintaPie();
      },
      sigue: function(){},
      destruye: function(){
        vivo = false; token++;
        if (escuchando) { escuchando = false; detenVoz(); }
        s.el.removeEventListener("click", clic); window.removeEventListener("resize", coloca);
        s.el.classList.remove("vd-on");
      },
      depura: function(){
        var q = function(sel){ return posDe(s.el.querySelector(sel)); };
        return { modo: modo, frase: reto && reto.q, hecho: hecho, cierre: cierre >= 0, escuchando: escuchando, intentos: intentos, rival: rival, pct: ultimo ? ultimo.sc.pct : null,
          dicho: ultimo && ultimo.a, palabras: ultimo ? ultimo.sc.words.map(function(w, i){ return { w: w, ok: !!ultimo.sc.hit[i] }; }) : null, t: t, T: T,
          esperado: !reto ? null : modo === "fichas" ? piezas[paso] : modo === "elige" ? reto.q : reto.q, msg: msgEl.textContent,
          mic: q(".vd-mic"), oir: q(".vd-pie [data-vd-b=oir]") || q("[data-vd-b=oir]"), sinMic: q("[data-vd-b=sinmic]"), conMic: q("[data-vd-b=conmic]"),
          fichas: [].map.call(medio.querySelectorAll(".vd-f"), function(b){ var p = posDe(b); return { t: b.textContent.replace(/^\d/, ""), i: +b.getAttribute("data-vd-f"), x: p.x, y: p.y, h: p.h }; }),
          opciones: [].map.call(medio.querySelectorAll(".vd-op"), function(b){ var p = posDe(b), tx = ops[+b.getAttribute("data-vd-op")]; return { t: tx, ok: !!reto && norm(tx) === norm(reto.q), x: p.x, y: p.y, h: p.h }; }) };
      }
    };
  }

  /* ================= Roleplay Quest ================= */
  function motorMision(zona, s){
    var reto = null, t = 0, T = 1, hecho = false, cierre = -1, trasCierre = null, escuchando = false, token = 0, vivo = true;
    var intentos = 0, tocar = false, orden = [], hist = {}, marcas = {}, dicho = "", fin = false;
    zona.innerHTML = '<div class="rq' + (s.mov ? " rq-quieto" : "") + '"><div class="rq-cab"><ol class="rq-prog" aria-label="Pasos de la misión"></ol></div><div class="rq-reloj"><i></i></div>' +
      '<div class="rq-medio"></div><p class="rq-msg" aria-live="polite"></p><div class="rq-pie"></div><div class="rq-fin" hidden></div></div>';
    s.el.classList.add("rq-on");
    var raiz = zona.querySelector(".rq"), prog = zona.querySelector(".rq-prog"), medio = zona.querySelector(".rq-medio"), msgEl = zona.querySelector(".rq-msg"), pie = zona.querySelector(".rq-pie"), finEl = zona.querySelector(".rq-fin"), reloj = zona.querySelector(".rq-reloj i");
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 8) + "px"; };
    var msg = function(txt, clase){ msgEl.textContent = txt || ""; msgEl.className = "rq-msg" + (clase ? " " + clase : ""); };
    var H = function(){ return hist[reto.mision] || (hist[reto.mision] = { res: [] }); };

    var banner = function(){
      s.banner('<p class="plxg-ask">Misión · ' + esc(reto.titulo || "Situación") + '</p><p class="plxg-q rq-esc"><span class="tr">' + esc(reto.escena) + "</span></p>", { oro: reto.oro });
      coloca();
    };
    var pintaProg = function(){
      var h = H();
      prog.innerHTML = Array.apply(null, { length: reto.pasos }).map(function(_, i){
        var c = i < reto.paso ? (h.res[i] === true ? "ok" : h.res[i] === false ? "no" : "hecho") : i === reto.paso ? (hecho && h.res[i] != null ? (h.res[i] ? "ok" : "no") : "ahora") : "";
        return '<li class="' + c + '"' + (i === reto.paso ? ' aria-current="step"' : "") + '><b aria-label="Paso ' + (i + 1) + " de " + reto.pasos + '">' + (i + 1) + "</b></li>";
      }).join("");
    };
    var lineaHTML = function(){
      if (reto.linea) {
        var i = marcas.bien;
        var hueco = hecho && i != null ? '<b class="rq-res">' + esc(reto.opciones[reto.a]) + "</b>" : '<span class="hueco">___</span>';
        return esc(reto.linea).replace(/_{2,}/, hueco);
      }
      return "";
    };
    var pintaMedio = function(){
      var h = "";
      if (reto.personaje) h += '<div class="rq-burb rq-ellos"><small>Te dicen</small><p lang="fr">' + esc(reto.personaje) + "</p></div>";
      if (reto.linea) h += '<div class="rq-burb rq-tu"><small>Tú dices</small><p lang="fr">' + lineaHTML() + "</p>" + (reto.pista ? '<span class="rq-pista">Pista: ' + esc(reto.pista) + "</span>" : "") + "</div>";
      else h += '<div class="rq-burb rq-tu"><small>Tú dices</small><p class="rq-pide">' + esc(reto.pide || "La respuesta adecuada") + "</p></div>";
      h += '<div class="rq-ops' + (tocar ? " tocar" : "") + '" role="group" aria-label="Opciones">' + orden.map(function(i, k){
        var c = "rq-op" + (marcas.bien === i && hecho ? " ok" : "") + (marcas.mal === i ? " mal" : "");
        return tocar && !hecho ? '<button class="' + c + '" data-rq-op="' + i + '" lang="fr"><small aria-hidden="true">' + (k + 1) + "</small>" + esc(vistaOp(reto.opciones[i])) + "</button>"
          : '<span class="' + c + '" lang="fr">' + esc(vistaOp(reto.opciones[i])) + "</span>";
      }).join("") + "</div>";
      if (hecho && reto.luego && marcas.bien != null && marcas.mal == null) h += '<div class="rq-burb rq-ellos rq-luego"><small>Te responden</small><p lang="fr">' + esc(reto.luego) + "</p></div>";
      medio.innerHTML = h;
    };
    var pintaPie = function(){
      if (!reto || fin) { pie.innerHTML = ""; return; }
      var oir = reto.personaje ? '<button class="rq-sec" data-rq-b="oir"' + (escuchando ? " disabled" : "") + ">" + OIR + "<span>Escuchar</span></button>" : "";
      if (!tocar) {
        pie.innerHTML = '<button class="rq-mic' + (escuchando ? " oye" : "") + '" data-rq-b="mic" aria-label="' + (escuchando ? "Te escucho. Toca para terminar" : "Tocar y responder hablando") + '"' + (hecho ? " disabled" : "") + ">" + MIC + "</button>" +
          '<div class="rq-acc">' + oir + '<button class="rq-sec" data-rq-b="sinmic"' + (escuchando || hecho ? " disabled" : "") + "><span>No puedo hablar ahora</span></button></div>";
      } else {
        var vuelve = sinVozEn === s && hayVoz() && reto.voz ? '<button class="rq-sec" data-rq-b="conmic"' + (hecho ? " disabled" : "") + ">" + MIC + "<span>Usar el micrófono</span></button>" : "";
        pie.innerHTML = oir || vuelve ? '<div class="rq-acc solo">' + oir + vuelve + "</div>" : "";
      }
    };
    var pinta = function(){ banner(); pintaProg(); pintaMedio(); pintaPie(); };

    var jugar = function(r){
      reto = r; t = 0; hecho = false; cierre = -1; trasCierre = null; token++; escuchando = false; intentos = 0; marcas = {}; dicho = ""; fin = false;
      finEl.hidden = true; finEl.innerHTML = ""; raiz.classList.remove("rq-cerrando");
      if (r.paso === 0 || !hist[r.mision]) hist[r.mision] = { res: [] };
      tocar = !usaVoz(s) || !r.voz;
      orden = mezcla(r.opciones.map(function(_, i){ return i; }));
      T = s.dir.t() * 2 + 6 + Math.min(8, ((r.escena || "").length + (r.personaje || "").length + (r.linea || "").length) / 28);
      reloj.style.transform = "scaleX(1)"; reloj.parentNode.classList.remove("poco");
      msg(!r.voz ? "En este paso las opciones se confunden al oído: toca la adecuada." : tocar ? "Toca la opción adecuada." : "Toca el micrófono y di la opción adecuada.");
      pinta();
      if (r.personaje) habla(r.personaje);
    };
    var limpiaR = function(){ reto = null; medio.innerHTML = ""; pie.innerHTML = ""; prog.innerHTML = ""; msg(""); finEl.hidden = true; finEl.innerHTML = ""; fin = false; raiz.classList.remove("rq-cerrando"); };
    var sigue = function(){ limpiaR(); s.listo(); };
    /* al terminar un paso: si era el último, el cierre de la misión */
    var finPaso = function(){
      if (!reto) return;
      if (reto.paso < reto.pasos - 1) { sigue(); return; }
      var h = H(), ok = h.res.filter(function(x){ return x === true; }).length, n = reto.pasos, bien = ok >= Math.ceil(n / 2);
      fin = true; pintaPie();
      finEl.innerHTML = '<div class="rq-finc' + (bien ? " bien" : "") + '"><small>' + esc(reto.titulo || "Misión") + "</small><b>" + (bien ? "Misión cumplida" : "Misión terminada") + "</b><span>" + ok + " de " + n + " respuestas adecuadas" + (bien ? "" : ". Repasa la lección") + "</span></div>";
      finEl.hidden = false; raiz.classList.add("rq-cerrando");
      if (bien) G.sfx("estrella", 1);
      cierre = 1.9; trasCierre = sigue;
    };
    var resuelve = function(i, verbo, el){
      if (!reto || hecho) return;
      hecho = true;
      var ok = i === reto.a, c = centroDe(el || medio.querySelector(".rq-ops"), zona);
      H().res[reto.paso] = ok;
      marcas.bien = reto.a; if (!ok) marcas.mal = i;
      pintaProg(); pintaMedio(); pintaPie();
      if (ok) {
        s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: c.x, y: c.y, final: true });
        msg(verbo === "Dijiste" ? "Se entendió: «" + reto.opciones[i] + "». Respuesta adecuada." : "Respuesta adecuada.", "bien");
        cierre = reto.luego ? 1.6 : .9; trasCierre = finPaso;
        return;
      }
      msg("", "");
      s.fallo(reto, { mal: reto.opciones[i], etMal: verbo, etiqueta: "Lo adecuado", bien: reto.bien, q: reto.escena + " · " + (reto.personaje ? "«" + reto.personaje + "» " : "") + (reto.linea || reto.pide || ""), repetir: false })
        .then(function(){ finPaso(); });
    };
    var reconoce = function(alts){
      var sc = reto.unicas.map(function(u){ var m = 0; alts.forEach(function(a){ m = Math.max(m, puntua(u.join(" "), a).pct); }); return m; });
      var best = -1, b = -1, seg = -1;
      sc.forEach(function(v, i){ if (v > b) { seg = b; b = v; best = i; } else if (v > seg) seg = v; });
      return b >= 50 && b - seg >= 25 ? best : -1;
    };
    var microfono = function(){
      if (!reto || tocar || fin) return;
      if (escuchando) { detenVoz(); return; }
      if (hecho || s.estado() !== "juega") return;
      G.despiertaAudio();
      escuchando = true; var tk = ++token;
      msg("Te escucho… di tu respuesta.", "oye"); pintaPie();
      var pista = reto.linea ? reto.linea.replace(/_{2,}/, " ").replace(/\s+/g, " ").trim() : "";
      oye(pista).then(function(alts){
        if (tk !== token || !vivo) return;
        escuchando = false;
        if (!reto || hecho || s.estado() !== "juega") { pintaPie(); return; }
        alts = [].concat(alts || []).filter(function(a){ return typeof a === "string" && a.trim(); });
        dicho = alts[0] || "";
        var i = alts.length ? reconoce(alts) : -1;
        if (i >= 0) { resuelve(i, "Dijiste", medio.querySelectorAll(".rq-op")[orden.indexOf(i)]); return; }
        intentos++;
        if (intentos >= 2) { tocar = true; msg("No reconocí ninguna opción" + (dicho ? " (se entendió «" + dicho + "»)" : "") + ". Toca la que querías decir.", "mal"); }
        else msg("No reconocí ninguna opción" + (dicho ? " (se entendió «" + dicho + "»)" : "") + ". Dila otra vez, clara y completa.", "mal");
        pintaMedio(); pintaPie();
      }, function(err){
        if (tk !== token || !vivo) return;
        escuchando = false;
        if (!reto || hecho || s.estado() !== "juega") { pintaPie(); return; }
        var m = String((err && err.message) || err || "");
        if (/no-speech|no.match|timeout|cancelled|aborted/i.test(m)) { msg("No te escuché. Toca el micrófono y responde con voz clara.", "mal"); pintaPie(); return; }
        sinVozEn = s; tocar = true;
        msg(textoError(m) + " Seguimos sin micrófono: toca la opción adecuada.", "mal");
        pintaMedio(); pintaPie();
      });
    };

    var clic = function(e){
      var b = e.target.closest && e.target.closest("[data-rq-b],[data-rq-op]");
      if (!b || !s.el.contains(b) || b.disabled) return;
      if (b.hasAttribute("data-rq-b")) {
        var a = b.getAttribute("data-rq-b");
        if (a === "oir") { if (reto && reto.personaje && !escuchando) habla(reto.personaje); return; }
        if (!reto || s.estado() !== "juega") return;
        if (a === "mic") return microfono();
        if (escuchando || hecho) return;
        if (a === "sinmic") { sinVozEn = s; tocar = true; msg("Sin micrófono: toca la opción adecuada."); pintaMedio(); pintaPie(); return; }
        if (a === "conmic" && hayVoz()) { sinVozEn = null; if (intentos < 2 && reto.voz) tocar = false; msg("Toca el micrófono y di la opción adecuada."); pintaMedio(); pintaPie(); }
        return;
      }
      if (escuchando || !tocar || !reto || hecho || s.estado() !== "juega") return;
      G.despiertaAudio();
      resuelve(+b.getAttribute("data-rq-op"), "Elegiste", b);
    };
    s.el.addEventListener("click", clic);
    window.addEventListener("resize", coloca);

    return {
      jugar: jugar,
      tick: function(dt){
        if (!reto) return;
        if (cierre >= 0) { if (!dt) return; cierre -= dt; if (cierre < 0) { var f = trasCierre; trasCierre = null; if (f) f(); } return; }
        if (hecho || escuchando || !dt) return;
        t += dt;
        reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        reloj.parentNode.classList.toggle("poco", t / T > .75);
        if (t >= T) {
          hecho = true; H().res[reto.paso] = false; marcas.bien = reto.a; pintaProg(); pintaMedio(); pintaPie();
          s.escapa(reto, { titulo: "Se acabó el tiempo", etiqueta: "Lo adecuado", bien: reto.bien, q: reto.escena + " · " + (reto.linea || reto.pide || reto.personaje || ""), repetir: false }).then(function(){ finPaso(); });
        }
      },
      tecla: function(e){
        if (!reto || fin) return;
        if (e.key === "o" || e.key === "O") { if (reto.personaje && !escuchando) habla(reto.personaje); return; }
        if (!tocar) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); microfono(); } return; }
        if (!/^[1-9]$/.test(e.key) || escuchando || hecho) return;
        var i = orden[+e.key - 1]; if (i == null) return;
        e.preventDefault(); resuelve(i, "Elegiste", medio.querySelectorAll(".rq-op")[+e.key - 1]);
      },
      pausa: function(){
        if (!escuchando) return;
        token++; escuchando = false; detenVoz();
        msg("Se pausó mientras te escuchaba: vuelve a tocar el micrófono.", "mal"); pintaPie();
      },
      sigue: function(){},
      destruye: function(){
        vivo = false; token++;
        if (escuchando) { escuchando = false; detenVoz(); }
        s.el.removeEventListener("click", clic); window.removeEventListener("resize", coloca);
        s.el.classList.remove("rq-on");
      },
      depura: function(){
        var q = function(sel){ return posDe(s.el.querySelector(sel)); };
        return { mision: reto && reto.mision, paso: reto && reto.paso, pasos: reto && reto.pasos, correcta: reto && reto.opciones[reto.a], hecho: hecho, cierre: cierre >= 0, fin: fin,
          finTexto: fin ? finEl.textContent : "", escuchando: escuchando, intentos: intentos, tocar: tocar, t: t, T: T, msg: msgEl.textContent, dicho: dicho,
          progreso: [].map.call(prog.children, function(li){ return li.className; }),
          mic: q(".rq-mic"), oir: q("[data-rq-b=oir]"), sinMic: q("[data-rq-b=sinmic]"), conMic: q("[data-rq-b=conmic]"),
          opciones: !reto ? [] : [].map.call(medio.querySelectorAll(".rq-op"), function(el, k){ var p = posDe(el), i = orden[k]; return { t: reto.opciones[i], ok: i === reto.a, x: p.x, y: p.y, h: p.h, tocable: el.tagName === "BUTTON" }; }) };
      }
    };
  }

  /* ---------------- registro ---------------- */
  var estrellasCon = function(seg, factor){
    return {
      estrellas: function(r){ if (!r.aciertos) return 0; return r.precision >= 80 && r.puntos >= seg * factor ? 3 : r.precision >= 80 ? 2 : 1; },
      pista: function(r){ return r.estrellas < 2 ? "2 estrellas: termina con 80 % de precisión." : r.estrellas < 3 ? "3 estrellas: 80 % de precisión y " + (seg * factor).toLocaleString("es-CO") + " puntos." : "Tres estrellas en esta unidad."; }
    };
  };
  var decoVD = function(){
    return '<svg viewBox="0 0 72 56" aria-hidden="true">' +
      '<rect x="4" y="10" width="26" height="36" rx="13" fill="#FB7185"/><rect x="12" y="16" width="10" height="16" rx="5" fill="#0B2D74"/><path d="M9 30a8 8 0 0 0 16 0M17 38v4" stroke="#0B2D74" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<rect x="36" y="14" width="32" height="7" rx="3.5" fill="rgba(255,255,255,.2)"/><rect x="36" y="14" width="27" height="7" rx="3.5" fill="#fff"/>' +
      '<rect x="36" y="27" width="32" height="7" rx="3.5" fill="rgba(255,255,255,.2)"/><rect x="36" y="27" width="22" height="7" rx="3.5" fill="#FFD200"/>' +
      '<rect x="36" y="40" width="20" height="4" rx="2" fill="#93C5FD"/></svg>';
  };
  var decoRQ = function(){
    return '<svg viewBox="0 0 72 56" aria-hidden="true">' +
      '<rect x="4" y="6" width="40" height="24" rx="7" fill="#fff"/><path d="M10 29l-2 8 9-7z" fill="#fff"/><rect x="10" y="15" width="24" height="4" rx="2" fill="#0B2D74"/><rect x="10" y="22" width="16" height="3" rx="1.5" fill="#0B2D74" opacity=".6"/>' +
      '<path d="M68 26H38a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h18l6 5v-5h6z" fill="#F59E0B"/><rect x="38" y="33" width="22" height="4" rx="2" fill="#0B2D74"/>' +
      '<circle cx="10" cy="49" r="3" fill="#6BE58E"/><circle cx="20" cy="49" r="3" fill="#6BE58E"/><circle cx="30" cy="49" r="3" fill="#FFD200"/></svg>';
  };
  var lineaTiempo = function(alc, seg, que){ return (G.aj.sinTiempo ? "Sin tiempo: " + (alc.repaso ? 10 : 15) + " " + que : seg + " segundos") + " y 3 vidas."; };

  G.registrar({
    id: "vd", nombre: "Voice Duel", verbo: "Dilo en voz alta", familia: "Voz", color: "#FB7185", orden: 60, vocab: true,
    vocabNota: "frases de ejemplo en voz alta",
    retos: function(alc){ return retosVD(alc); },
    retosCarnet: function(track){
      var out = [];
      try { Object.keys(S.carnet || {}).forEach(function(k){ var x = ITEMS[k]; if (!x || (track && x.l.track !== track)) return; var r = retoVoz(x.it, k, x.l); if (r) { r.oro = true; out.push(r); } }); } catch (e) {}
      return mezcla(conPozo(out));
    },
    apto: function(r){ return r.tipo === "voz"; },
    deco: decoVD,
    aviso: function(){ return hayVoz() ? "" : "Este navegador no reconoce la voz: escucharás cada frase y la armarás con fichas (o elegirás la que sonó)."; },
    reglas: function(alc){
      precargaCaras();
      return [
        lineaTiempo(alc, 120, "frases"),
        "Lee la frase, toca el micrófono y dila en voz alta. Aprueba si se entiende el " + PASA() + " % o más.",
        "Manzana te reta con un porcentaje en cada frase: si lo superas, ganas el duelo y más puntos.",
        "Tienes dos intentos. Si no se entiende, verás la frase y lo que se entendió, sin perder vida.",
        "La voz mide si se entiende lo que dices, no la pronunciación sonido por sonido.",
        "Sin micrófono, escuchas la frase y la armas con fichas o eliges la que sonó. Ahí los errores sí quitan vida (con fichas, desde la segunda equivocada)."
      ];
    },
    opciones: function(){ return Object.assign({ seg: 120 }, estrellasCon(120, 20)); },
    montar: function(zona, s){ return motorVoz(zona, s); }
  });
  G.registrar({
    id: "rq", nombre: "Roleplay Quest", verbo: "Resuelve la situación hablando", familia: "Voz", color: "#F59E0B", orden: 65, vocab: false, oro: false,
    retos: function(alc){ return misiones(alc.lecciones); },
    /* para las pruebas: por qué un ítem no entra */
    diagnostico: function(l){ return (l.items || []).map(function(it, i){ var por = [], p = pasoMision(it, l.id + ":" + i, l, por); return p ? (p.voz ? "voz" : por[0]) : por[0] || "-"; }); },
    apto: function(r){ return r.tipo === "mision"; },
    deco: decoRQ,
    aviso: function(){ return hayVoz() ? "" : "Este navegador no reconoce la voz: responderás tocando la opción adecuada."; },
    reglas: function(alc){
      return [
        lineaTiempo(alc, 150, "pasos"),
        "Cada misión es una situación real de la lección, en 3 a 5 pasos.",
        "Lee la escena, toca el micrófono y di la opción adecuada, sola o con la frase completa.",
        "Si dices otra opción, pierdes una vida y ves la corrección. Si no se reconoce ninguna, repites; a la segunda, puedes tocarla.",
        "Si las opciones suenan igual o casi igual (como mange y mangent), ese paso se responde tocando.",
        "La voz mide si se entiende lo que dices, no la pronunciación sonido por sonido. Sin micrófono, tocas la opción."
      ];
    },
    opciones: function(alc){ return Object.assign({ seg: 150, ordenFijo: true, retos: planMisiones(alc) }, estrellasCon(150, 15)); },
    montar: function(zona, s){ return motorMision(zona, s); }
  });

  /* ---------------- estilos ---------------- */
  var st = document.createElement("style"); st.id = "plx51";
  st.textContent = `
  .vd,.rq{position:absolute;inset:0;display:flex;flex-direction:column;gap:12px;padding:0 16px calc(14px + env(safe-area-inset-bottom));box-sizing:border-box;max-width:600px;margin:0 auto}
  .vd-reloj,.rq-reloj{height:6px;border-radius:99px;background:rgba(147,197,253,.18);overflow:hidden;flex:none}
  .vd-reloj i,.rq-reloj i{display:block;height:100%;background:#6BE58E;transform-origin:left;border-radius:99px}
  .vd-reloj.poco i,.rq-reloj.poco i{background:#FF8A8F}
  .vd-medio,.rq-medio{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:12px;padding:2px}
  .vd-msg,.rq-msg{flex:none;margin:0;min-height:20px;font:600 15px/1.35 Inter,system-ui,sans-serif;color:#C9D6F5}
  .vd-msg.oye,.rq-msg.oye{color:#FFD200}
  .vd-msg.bien,.rq-msg.bien{color:#8FF0AB}
  .vd-msg.mal,.rq-msg.mal{color:#FFB4B8}
  .vd-pie,.rq-pie{flex:none;display:flex;align-items:center;gap:14px;padding-left:76px;min-height:80px}
  .vd-mic,.rq-mic{all:unset;box-sizing:border-box;flex:none;position:relative;width:76px;height:76px;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:#0B2D74;
    box-shadow:0 5px 0 rgba(0,0,0,.28),0 14px 26px -12px rgba(0,0,0,.8)}
  .vd-mic{background:#FB7185}.rq-mic{background:#F59E0B}
  .vd-mic svg,.rq-mic svg{width:34px;height:34px;fill:#0B2D74}
  .vd-mic:active,.rq-mic:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.28)}
  .vd-mic[disabled],.rq-mic[disabled]{opacity:.45;cursor:default}
  .vd-mic:focus-visible,.rq-mic:focus-visible,.vd-sec:focus-visible,.rq-sec:focus-visible,.vd-f:focus-visible,.vd-op:focus-visible,.rq-op:focus-visible{outline:3px solid #FFD200;outline-offset:3px}
  .vd-mic.oye,.rq-mic.oye{background:#FFD200}
  .vd-mic.oye::after,.rq-mic.oye::after{content:"";position:absolute;inset:-8px;border-radius:50%;border:3px solid #FFD200;animation:vdOnda 1.1s ease-out infinite}
  .vd-quieto .vd-mic.oye::after,.rq-quieto .rq-mic.oye::after{animation:none;opacity:.7}
  .vd-acc,.rq-acc{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:8px}
  /* el micrófono va a la derecha: la burbuja de Manzana (abajo a la izquierda) nunca lo tapa */
  .vd-mic,.rq-mic{order:2}
  .vd-acc.solo,.rq-acc.solo{flex-direction:row;flex-wrap:wrap}
  .vd-sec,.rq-sec{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:8px;min-height:44px;padding:8px 12px;border-radius:12px;cursor:pointer;
    background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.4);color:#EEF3FF;font:600 15px/1.2 Inter,system-ui,sans-serif}
  .vd-pie.vd-alt{min-height:62px}
  .vd-sec svg,.rq-sec svg{flex:none;width:18px;height:18px;fill:#EEF3FF;color:#EEF3FF}
  .vd-sec[disabled],.rq-sec[disabled]{opacity:.45;cursor:default}
  .vd-sec:active,.rq-sec:active{background:rgba(255,255,255,.14)}
  .plxg .vd-es{margin:6px 0 0!important}
  .plxg-q .vd-oirb{margin-top:8px;min-height:44px;box-sizing:border-box;font-size:15px}
  .plxg-q .vd-oirb span{line-height:1}
  .plxg-q.vd-qalt{font-size:16px}

  .vd-duelo{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:none}
  .vd-lado{min-width:0;padding:10px 12px;border-radius:14px;background:rgba(8,31,85,.6);box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.22);display:grid;gap:5px}
  .vd-cab{display:flex;align-items:center;gap:8px;min-width:0}
  .vd-ava{flex:none;width:30px;height:30px;border-radius:50%;box-sizing:border-box;object-fit:cover;object-position:50% 18%;background:#EEF3FF;box-shadow:0 0 0 2px #FFD200}
  .vd-ava-tu{display:grid;place-items:center;background:#FB7185;box-shadow:0 0 0 2px #EEF3FF}
  .vd-ava-jefe{display:grid;place-items:center;background:#081F55;color:#FFD200;font:800 15px/1 Poppins,system-ui,sans-serif;box-shadow:0 0 0 2px #FF8A8F}
  .vd-ava-tu svg{width:17px;height:17px;fill:#0B2D74;color:#0B2D74}
  .vd-vs{position:absolute;left:50%;top:50%;z-index:1;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#C2262E;color:#fff;font:800 11px/1 Poppins,system-ui,sans-serif;letter-spacing:.02em;box-shadow:0 0 0 3px #081F55}
  .vd-lado small{font:700 12px/1.2 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#A9C4FF}
  .vd-lado b{font:800 24px/1 Poppins,system-ui,sans-serif;color:#fff;font-variant-numeric:tabular-nums}
  .vd-rival b{color:#FFD200}
  .vd-tu.gana{box-shadow:inset 0 0 0 2px #6BE58E}.vd-tu.gana b{color:#8FF0AB}
  .vd-tu.pasa b{color:#8FF0AB}.vd-tu.no b{color:#FFB4B8}
  .vd-barra{position:relative;display:block;height:8px;border-radius:99px;background:rgba(147,197,253,.18);overflow:visible}
  .vd-barra i{display:block;height:100%;border-radius:99px;background:#fff;transition:width .5s ease-out}
  .vd-rival .vd-barra i{background:#FFD200}
  .vd-tu.no .vd-barra i{background:#FF8A8F}.vd-tu.pasa .vd-barra i,.vd-tu.gana .vd-barra i{background:#6BE58E}
  .vd-barra em{position:absolute;top:-3px;bottom:-3px;width:2px;margin-left:-1px;background:#93C5FD;border-radius:2px}
  .vd-quieto .vd-barra i{transition:none}
  .vd-nota{margin:-4px 0 0;font:500 15px/1.35 Inter,system-ui,sans-serif;color:#A9C4FF;flex:none}
  .vd-dicho{padding:12px 14px;border-radius:16px;background:rgba(8,31,85,.6);box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.22)}
  .vd-dicho[hidden]{display:none}
  .vd-pal{margin:0 0 8px;display:flex;flex-wrap:wrap;gap:6px}
  .vd-pal span{display:inline-block;padding:4px 9px;border-radius:9px;font:700 16px/1.25 Poppins,Inter,system-ui,sans-serif}
  .vd-pal .ok{background:rgba(107,229,142,.16);color:#8FF0AB;box-shadow:inset 0 0 0 1.5px rgba(107,229,142,.5)}
  .vd-pal .ko{background:rgba(229,72,77,.18);color:#FFB4B8;box-shadow:inset 0 0 0 1.5px rgba(255,138,143,.55);text-decoration:underline wavy rgba(255,138,143,.8);text-underline-offset:4px}
  .vd-oido{margin:0;font:500 15px/1.4 Inter,system-ui,sans-serif;color:#EEF3FF;overflow-wrap:anywhere}
  .vd-oido span{font:700 12px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#A9C4FF;margin-right:4px}
  .vd-oido q{quotes:"«\\00a0" "\\00a0»";font-style:italic}
  .vd.vd-listo .vd-dicho{box-shadow:inset 0 0 0 2px #6BE58E,0 0 28px -8px rgba(107,229,142,.7)}

  .vd-linea{flex:none;display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start;min-height:56px;padding:12px;border-radius:18px;background:rgba(8,31,85,.6);box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.25)}
  .vd.vd-listo .vd-linea{box-shadow:inset 0 0 0 2px #6BE58E,0 0 28px -6px rgba(107,229,142,.7)}
  .vd-p{display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border-radius:12px;font:700 17px/1.2 Poppins,Inter,system-ui,sans-serif}
  .vd-p.ok{background:#fff;color:#0B2D74}
  .vd-p.vacio{width:40px;background:rgba(147,197,253,.1);box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.3)}
  .vd-bandeja{flex:none;margin-top:auto;display:flex;flex-wrap:wrap;justify-content:center;gap:10px;align-content:flex-end;padding-top:6px}
  .vd-f,.vd-op,.rq-op{all:unset;box-sizing:border-box;position:relative;display:inline-flex;align-items:center;justify-content:center;text-align:center;min-height:52px;min-width:52px;padding:8px 18px;border-radius:14px;
    background:#fff;color:#0B2D74;font:700 17px/1.25 Poppins,Inter,system-ui,sans-serif;box-shadow:0 4px 0 #93C5FD,0 12px 24px -12px rgba(0,0,0,.7);cursor:pointer;user-select:none;-webkit-user-select:none;overflow-wrap:anywhere}
  .vd-f:active,.vd-op:active,button.rq-op:active{box-shadow:0 1px 0 #93C5FD;transform:translateY(3px)}
  .vd-f small,.vd-op small,.rq-op small{position:absolute;top:-7px;left:-7px;width:20px;height:20px;border-radius:50%;background:#0B2D74;color:#FFD200;font:800 11px/20px Poppins,system-ui,sans-serif;text-align:center;display:none}
  @media (pointer:fine){ .vd-f small,.vd-op small,.rq-op small{display:block} .vd-f small:empty{display:none} }
  .vd-f.vd-mal,.vd-op.vd-mal{animation:vdMal .35s;background:#FFE1E3}
  .vd-ops{flex:none;display:flex;flex-direction:column;gap:12px;margin-top:auto}
  .vd-op{justify-content:flex-start;text-align:left;padding-left:20px}
  .vd-op.ok{background:#D9FBE3}

  .rq-cab{flex:none}
  .rq-prog{list-style:none;margin:0;padding:0;display:flex;align-items:center}
  .rq-prog li{flex:1;display:flex;align-items:center}
  .rq-prog li:last-child{flex:none}
  .rq-prog li b{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font:800 15px/1 Poppins,system-ui,sans-serif;background:rgba(147,197,253,.12);color:#C9D6F5;box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.45)}
  .rq-prog li::after{content:"";flex:1;height:3px;margin:0 6px;border-radius:2px;background:rgba(147,197,253,.25)}
  .rq-prog li:last-child::after{display:none}
  .rq-prog li.ahora b{background:#FFD200;color:#081F55;box-shadow:0 0 0 4px rgba(255,210,0,.25)}
  .rq-prog li.ok b{background:#6BE58E;color:#073B1C;box-shadow:none}
  .rq-prog li.no b{background:#FF8A8F;color:#5A0E14;box-shadow:none}
  .rq-prog li.hecho b{background:#93C5FD;color:#081F55;box-shadow:none}
  .rq-prog li.ok::after{background:#6BE58E}.rq-prog li.no::after{background:#FF8A8F}.rq-prog li.hecho::after{background:#93C5FD}
  .rq-pista{font:600 15px/1.3 Inter,system-ui,sans-serif;color:#A9C4FF}
  .plxg .rq-esc .tr{margin:0!important;font-size:15px}
  .rq-burb{padding:10px 14px;border-radius:16px;display:grid;gap:4px;flex:none}
  .rq-burb small{font:700 12px/1.2 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
  .rq-burb p{margin:0;font:700 17px/1.35 Poppins,Inter,system-ui,sans-serif;overflow-wrap:anywhere}
  .rq-ellos{background:#fff;color:#0B2D74;border-bottom-left-radius:4px;margin-right:24px}
  .rq-ellos small{color:#4B5E8C}
  .rq-tu{background:rgba(8,31,85,.65);box-shadow:inset 0 0 0 1.5px rgba(245,158,11,.55);color:#fff;border-bottom-right-radius:4px;margin-left:24px}
  .rq-tu small{color:#FCD34D}
  .rq-tu .hueco{color:#FFD200;letter-spacing:.04em}
  .rq-tu .rq-res{color:#8FF0AB}
  .rq-pide{font:600 16px/1.4 Inter,system-ui,sans-serif!important;color:#EEF3FF}
  .rq-luego{animation:vdEntra .25s ease-out}
  .rq-quieto .rq-luego{animation:none}
  .rq-ops{display:flex;flex-wrap:wrap;gap:10px;flex:none}
  .rq-op{min-height:48px;padding:8px 16px;font-size:16px}
  span.rq-op{cursor:default;background:transparent;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.55)}
  .rq-op.ok{background:#D9FBE3!important;color:#0B5A2A!important;box-shadow:inset 0 0 0 2px #15803D!important}
  .rq-op.mal{background:#FFE1E3!important;color:#8E1B24!important;box-shadow:inset 0 0 0 2px #E5484D!important;text-decoration:line-through}
  .rq-fin{position:absolute;inset:0;z-index:2;display:grid;place-items:center;padding:16px;background:rgba(4,14,40,.55)}
  .rq-fin[hidden]{display:none}
  .rq-finc{width:min(360px,100%);display:grid;gap:6px;text-align:center;padding:22px 20px;border-radius:20px;background:#081F55;box-shadow:inset 0 0 0 2px #93C5FD,0 20px 40px -18px rgba(0,0,0,.8);animation:vdEntra .3s ease-out}
  .rq-finc.bien{box-shadow:inset 0 0 0 2px #FFD200,0 20px 40px -18px rgba(0,0,0,.8)}
  .rq-finc small{font:700 11px/1.3 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#93C5FD}
  .rq-finc b{font:800 28px/1.05 Poppins,system-ui,sans-serif;text-transform:uppercase;color:#FFD200}
  .rq-finc span{font:600 15px/1.4 Inter,system-ui,sans-serif;color:#EEF3FF}
  .rq-quieto .rq-finc{animation:none}
  @keyframes vdOnda{from{transform:scale(.9);opacity:.9}to{transform:scale(1.35);opacity:0}}
  @keyframes vdMal{0%,100%{translate:0}25%{translate:-7px}75%{translate:7px}}
  @keyframes vdEntra{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}
  @media (prefers-reduced-motion:reduce){ .vd-mic.oye::after,.rq-mic.oye::after{animation:none;opacity:.7} .vd-f.vd-mal,.vd-op.vd-mal,.rq-luego,.rq-finc{animation:none} .vd-barra i{transition:none} }
  @media (max-height:700px){ .vd,.rq{gap:9px} .vd-lado b{font-size:21px} .vd-mic,.rq-mic{width:68px;height:68px} .vd-pie,.rq-pie{min-height:72px;padding-left:74px} }
  `;
  document.head.appendChild(st);
})();
