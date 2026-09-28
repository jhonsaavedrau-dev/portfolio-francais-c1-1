/* PLEX PLAY 1.25.0 — Memory Rush (motor «Memoria»)
   - Cada reto es un tablero de 3 a 5 parejas (6 a 10 cartas): 4 en A1–A2, 4 (5 en vocabulario) en B1–B2 y 5
     en C1 siempre que el ejercicio lo permita (con 3 parejas se gana probando al azar). Las cartas se muestran boca arriba unos segundos para memorizarlas (cuenta
     visible); luego se tapan y se voltean de a dos para encontrar cada pareja. La carta en francés suena.
   - Retos: temas de vocabulario (francés–español, sin dos parejas con el mismo significado ni significados
     que se contengan) y ejercicios «match» de las lecciones (izquierda–derecha). Un ítem con más parejas de
     las que caben se parte en varios tableros (que se completan con parejas del mismo ejercicio, así ninguno
     queda de 3 cuando hay con qué llenarlo); dos parejas que comparten un texto nunca van juntas.
   - Pareja correcta: quedan descubiertas (s.acierto; la última cierra el reto). Pareja equivocada: se tapan;
     las dos primeras del tablero rompen el combo (s.penaliza) y la tercera es un error (s.fallo) que cierra
     el tablero. Si se acaba el tiempo del tablero, se muestran las parejas que faltaban (s.escapa).
   - Durante la memorización no se aceptan toques en las cartas. En la pausa las cartas se tapan (para que
     no se pueda memorizar con el reloj detenido). Todo el tiempo va por tick (la pausa lo congela).
     Teclado: 1 a 9 y 0 voltean la carta de ese número; Enter empieza antes de tiempo. */
(function(){
  "use strict";
  var G = window.PLXG; if (!G || !G.sesion) return;
  var esc = G.esc, norm = G.norm, mezcla = G.mezcla, plano = G.plano;
  var seguro = G.seguro || esc;

  /* ---------------- retos ---------------- */
  var MAXC = 40;            /* caracteres máximos en una carta */
  var TAM = [4, 5, 5];      /* parejas por tablero de vocabulario según el nivel (A1–A2, B1–B2, C1) */
  var TAML = [4, 4, 5];     /* parejas por tablero de las lecciones (sus textos son más largos) */
  var LARGO = 28;           /* con textos más largos, el tablero es de 4 parejas como máximo (cabe en 375×667) */
  var MINP = 3;             /* un tablero tiene al menos 3 parejas */
  var ES_RE = /[ñáíóú¿¡]|(^|[^\p{L}])(el|los|las|del|por|para|sin|muy|pero|hay|una|lo|al|usted|ustedes|nosotros|ellos|ellas|está|están|qué|cómo|dónde|cuándo)(?=$|[^\p{L}])/iu;
  var FR_RE = /[àâçèêëîïôûùœ]|(^|[^\p{L}])(le|la|les|un|une|des|du|je|tu|il|elle|on|nous|vous|ils|elles|est|et|au|aux|ce|cette|que|qui|ne|pas|mon|ma|mes|son|sa|ses|être|avoir)(?=$|[^\p{L}])|(^|[^\p{L}])(l|d|j|c|qu|n|s|m|t)'/iu;
  /* idioma de una columna de textos: "es", "fr" o "" (no se sabe) */
  var idioma = function(col){
    var es = col.filter(function(x){ return ES_RE.test(x); }).length, fr = col.filter(function(x){ return FR_RE.test(x); }).length;
    if (es * 2 >= col.length && es > fr) return "es";
    if (fr * 2 >= col.length || (fr > 0 && !es)) return "fr";
    return "";
  };
  /* texto sin palabras: cifras, horas, fechas, signos o transcripciones fonéticas [pəti] */
  var API = /^\[[^\]]*\]$|[ɛɑɔəɥʃʒɲœøŋ]/;
  var neutro = function(x){ x = String(x || "").trim(); return API.test(x) || !/\p{L}{2,}/u.test(x); };
  var cabe = function(x){ x = String(x || "").trim(); return x.length > 0 && x.length <= MAXC; };
  var ART = /^(el|la|los|las|un|una|unos|unas|lo|le|les|l'|une|des|du|de la|de l'|se |s')\s*/;
  /* sentidos de un significado: «el tiquete, el pasaje; el billete» → [tiquete, pasaje, billete] */
  var sentidos = function(txt){
    return String(txt || "").replace(/\([^)]*\)/g, " ").replace(/¡[^!]*!/g, " ").replace(/«[^»]*»/g, " ").split(/\s*[,;/]\s*/)
      .map(function(x){ return norm(x).replace(/[.!?¿¡…]+/g, "").replace(ART, "").trim(); }).filter(function(x){ return x.length > 1; });
  };
  /* textos intercambiables: dos parejas con textos del mismo grupo no van en el mismo tablero, porque unirlas
     «cruzadas» también sería correcto («con tal de que» → «à condition que»). Incluye mitades de frase que admiten
     otro final («Un jour, en cours de phonétique, quelqu'un a frappé à la porte.» también es correcta) */
  var INTERCAMBIABLES = [
    ["pourvu que", "à condition que", "à condition de", "du moment que"], ["à moins que", "à moins de", "sauf si"],
    ["con tal de que", "siempre y cuando", "siempre que"], ["a menos que", "a no ser que", "salvo si", "salvo que", "excepto si"],
    ["pourtant", "cependant", "toutefois", "néanmoins"], ["sin embargo", "no obstante"], ["en revanche", "par contre"], ["en cambio", "por el contrario"],
    ["donc", "par conséquent", "c'est pourquoi"], ["por lo tanto", "por consiguiente", "así que"], ["de plus", "en outre", "en plus", "par ailleurs"], ["además", "asimismo"],
    ["bien que", "quoique"], ["malgré", "en dépit de"], ["a pesar de", "pese a"], ["en somme", "en résumé", "bref"], ["en resumen", "en suma"],
    ["quand j'étais petit", "pendant que je dormais", "un jour, en cours de phonétique"],
    ["si j'étais toi", "si on avait une voiture"]
  ];
  var claveInt = function(x){ return norm(x).replace(/\([^)]*\)/g, " ").replace(/[.,;:!?…]+/g, " ").replace(/\s+/g, " ").trim(); };
  var GRUPO = {};
  INTERCAMBIABLES.forEach(function(g, i){ g.forEach(function(x){ GRUPO[claveInt(x)] = i + 1; }); });
  /* ¿dos parejas (listas de textos) tienen textos intercambiables? */
  var cruzan = function(a, b){
    var ga = a.map(function(x){ return GRUPO[claveInt(x)] || 0; }).filter(Boolean);
    return ga.length > 0 && b.some(function(x){ return ga.indexOf(GRUPO[claveInt(x)] || 0) >= 0; });
  };
  var contiene = function(x, y){ return y.length >= 3 && (" " + x + " ").indexOf(" " + y + " ") >= 0; };
  var chocan = function(a, b){ return a.some(function(x){ return b.some(function(y){ return x === y || contiene(x, y) || contiene(y, x); }); }); };
  /* el significado corto que va en la carta: sin paréntesis ni notas, uno o dos sentidos */
  var corto = function(es){
    var s = String(es || "").replace(/\([^)]*\)/g, " ").replace(/¡no[^!]*!/gi, " ").replace(/«[^»]*»/g, " ").replace(/\s+/g, " ").trim();
    var partes = s.split(/\s*[,;]\s*/).map(function(x){ return x.trim(); }).filter(Boolean), out = partes[0] || "";
    if (partes[1] && (out + ", " + partes[1]).length <= 24) out += ", " + partes[1];
    return out.replace(/[\s,;:]+$/, "");
  };
  /* reparte los elementos en tableros de hasta P sin dos que choquen. Cada tablero se completa hasta «fin»
     con elementos compatibles de los otros (un ítem de 5 parejas en A1 da dos tableros de 4, no de 3 y 2) */
  var reparte = function(orden, P, choque, fin){
    var n = orden.length; if (n < MINP) return [];
    var k = Math.ceil(n / P), meta = Math.ceil(n / k), tabs = [];
    var entra = function(tb, i){ return tb.every(function(j){ return !choque(i, j); }); };
    orden.forEach(function(i){
      var tb = null;
      for (var q = 0; q < tabs.length; q++) if (tabs[q].length < meta && entra(tabs[q], i)) { tb = tabs[q]; break; }
      if (!tb) { tb = []; tabs.push(tb); }
      tb.push(i);
    });
    fin = Math.max(MINP, Math.min(fin || MINP, P));
    tabs.forEach(function(tb){ orden.forEach(function(i){ if (tb.length < fin && tb.indexOf(i) < 0 && entra(tb, i)) tb.push(i); }); });
    return tabs.filter(function(tb){ return tb.length >= MINP; });
  };

  /* audio: en un tablero no suenan dos cartas que se pronuncian igual (es/est, son/sont, parlé/parler…),
     y en las lecciones no suenan las palabras sueltas muy cortas («est» sola se lee como el punto cardinal) */
  var HOMO = [["a", "à", "as"], ["et", "est", "es", "ai", "aie", "aies", "ait", "aient"], ["son", "sont"], ["ces", "ses", "c'est", "s'est", "sais", "sait"], ["ce", "se"], ["ou", "où"],
    ["sang", "cent", "sans", "sent"], ["vers", "verre", "vert", "verts", "vertes", "verres"], ["mer", "mère", "maire"], ["on", "ont"], ["peu", "peut", "peux"], ["la", "là", "l'a"],
    ["leur", "leurs"], ["quand", "quant", "qu'en"], ["dans", "d'en"], ["voie", "voix", "vois", "voit"], ["tout", "tous", "toux"], ["fois", "foi", "foie"], ["mais", "mes", "met", "mets", "mai"],
    ["vin", "vingt", "vain", "vint"], ["cour", "cours", "court"], ["fin", "faim"], ["pain", "pin", "peint"], ["compte", "conte", "comte"], ["père", "paire", "pair", "perd", "perds"], ["cet", "cette", "sept"]];
  var sonido = function(x){
    var n = norm(x).replace(/[.!?,;:…]+$/g, "").replace(/\(e\)|\(s\)|\(es\)/g, "");
    for (var g = 0; g < HOMO.length; g++) if (HOMO[g].indexOf(n) >= 0) return "#" + g;
    return n.replace(/(ées|és|ée|é|er|ez|ais|ait|aient|ai)$/, "É").replace(/(s|x|t|d|e|es|ent)$/, "");
  };
  var suena = function(reto, c, cartas){
    if (!reto.voz || !reto.voz[c.lado] || !/\p{L}/u.test(c.t) || neutro(c.t)) return false;
    if (!reto.voc && !/\s/.test(c.t.trim()) && c.t.replace(/[^\p{L}]/gu, "").length < 4) return false;
    var k = sonido(c.t);
    return !cartas.some(function(o){ return o !== c && reto.voz[o.lado] && sonido(o.t) === k; });
  };

  /* un ejercicio «match» → tableros. Las cartas guardan el texto plano (t) y, si el ejercicio trae
     cursivas (títulos de obras), el HTML seguro para mostrarlas (h) */
  var tablerosItem = function(it, key, l, nivel){
    if (!it || it.k !== "match" || !it.pairs) return [];
    var pares = it.pairs.map(function(p){ return p ? [{ t: plano(p[0]), h: seguro(p[0]) }, { t: plano(p[1]), h: seguro(p[1]) }] : null; })
      .filter(function(p){ return p && cabe(p[0].t) && cabe(p[1].t) && norm(p[0].t) !== norm(p[1].t); });
    if (pares.length < MINP) return [];
    var col = function(k){ return pares.map(function(p){ return p[k].t; }); };
    var li = idioma(col(0)), ld = idioma(col(1)), nl = col(0).every(neutro), nd = col(1).every(neutro);
    /* la cara oscura (franja rosa) es la francesa: se invierte si la izquierda está en español (y la derecha no), o si la
       izquierda no tiene palabras (cifras, horas, API) y la derecha sí, en francés */
    var gira = (li === "es" && ld !== "es") || (nl && !nd && ld !== "es");
    if (gira) { pares = pares.map(function(p){ return [p[1], p[0]]; }); var tmp = li; li = ld; ld = tmp; tmp = nl; nl = nd; nd = tmp; }
    /* dos parejas que comparten un texto (dos izquierdas con la misma derecha…) no van en el mismo tablero */
    var n = function(i, k){ return norm(pares[i][k].t); };
    var choque = function(i, j){ return n(i, 0) === n(j, 0) || n(i, 1) === n(j, 1) || n(i, 0) === n(j, 1) || n(i, 1) === n(j, 0) ||
      cruzan([pares[i][0].t, pares[i][1].t], [pares[j][0].t, pares[j][1].t]); };
    var largo = pares.some(function(p){ return p[0].t.length > LARGO || p[1].t.length > LARGO; });
    var P = largo ? 4 : TAML[nivel] || 4, q = plano(it.q || ""), m = pares.length;
    /* dos pasadas (la segunda empieza a mitad del ejercicio): si sobran parejas, sale otro tablero con otra mezcla */
    var idx = pares.map(function(_, i){ return i; }), rot = idx.slice(Math.ceil(m / 2)).concat(idx.slice(0, Math.ceil(m / 2))), tabs = [], vistos = {};
    [idx, rot].forEach(function(o, k){
      if (k && m <= P) return;
      reparte(o, P, choque, P).forEach(function(tb){ var c = tb.slice().sort(function(a, b){ return a - b; }).join(","); if (!vistos[c] && tabs.length < 3) { vistos[c] = 1; tabs.push(tb); } });
    });
    return tabs.map(function(tb){
      var ps = tb.map(function(i){ return pares[i]; });
      return { tipo: "parejas", ask: q || "Une cada carta con su pareja", q: q || "Parejas", pares: ps.map(function(p){ return [p[0].t, p[1].t]; }),
        html: ps.some(function(p){ return p[0].h !== esc(p[0].t) || p[1].h !== esc(p[1].t); }) ? ps.map(function(p){ return [p[0].h, p[1].h]; }) : null,
        voz: [!nl && li !== "es", !nd && ld === "fr"], tags: ld === "es" && li !== "es" && !nl ? ["FR", "ES"] : ["", ""],
        gira: gira, correcta: ps.map(function(p){ return gira ? p[1].t + " → " + p[0].t : p[0].t + " → " + p[1].t; }), why: it.why || "", hab: it.t || "autre", key: key, lessonId: l ? l.id : "" };
    });
  };
  var retosLecciones = function(lecciones, nivel){
    var out = [];
    (lecciones || []).forEach(function(l){ (l.items || []).forEach(function(it, i){ out.push.apply(out, tablerosItem(it, l.id + ":" + i, l, nivel)); }); });
    return out;
  };
  /* un tema de vocabulario → tableros francés–español (dos o tres pasadas con órdenes distintos) */
  var retosTema = function(tema, nivel){
    var ws = (tema && tema.i || []).map(function(x){ return { x: x, fr: String(x.fr || "").trim(), es: corto(x.es), s: sentidos(x.es), f: norm(x.fr).replace(ART, "") }; })
      .filter(function(w){ return cabe(w.fr) && cabe(w.es) && w.s.length && norm(w.fr) !== norm(w.es); });   /* «la litote = la litote» no enseña nada */
    var n = ws.length, P = TAM[nivel] || 4; if (n < MINP) return [];
    var choque = function(i, j){ var a = ws[i], b = ws[j]; return a.f === b.f || contiene(a.f, b.f) || contiene(b.f, a.f) || norm(a.es) === norm(b.es) || chocan(a.s, b.s) || cruzan([a.fr, a.es], [b.fr, b.es]); };
    var idx = ws.map(function(_, i){ return i; });
    var ordenes = [idx, idx.filter(function(i){ return i % 2 === 0; }).concat(idx.filter(function(i){ return i % 2; })), idx.slice().sort(function(a, b){ return (a * 3) % n - (b * 3) % n || a - b; })];
    var out = [], vistos = {};
    ordenes.forEach(function(o, k){
      if (k === 2 && out.length >= 4) return;
      reparte(o, P, choque, P).forEach(function(tb){
        var c = tb.slice().sort(function(a, b){ return a - b; }).join(","); if (vistos[c]) return; vistos[c] = 1;
        var sel = tb.map(function(i){ return ws[i]; });
        out.push({ tipo: "parejas", ask: "Vocabulario · " + (tema.t || ""), q: tema.t || "Vocabulario", pares: sel.map(function(w){ return [w.fr, w.es]; }), html: null,
          voz: [true, false], tags: ["FR", "ES"], voc: sel.map(function(w){ return w.x; }),
          correcta: sel.map(function(w){ return w.fr + " → " + w.es; }), why: "", hab: "vocab", key: null, lessonId: "" });
      });
    });
    return out;
  };
  var retosMR = function(alc){ var n = G.nivel(alc.track); return alc.tema ? retosTema(alc.tema, n) : retosLecciones(alc.lecciones, n); };
  /* dorados: ejercicios «match» del carnet de ese curso */
  var retosCarnetMR = function(track, nivel){
    var out = [];
    try {
      Object.keys((S && S.carnet) || {}).forEach(function(k){
        var x = ITEMS[k]; if (!x || (track && x.l.track !== track) || x.it.k !== "match") return;
        tablerosItem(x.it, k, x.l, nivel).forEach(function(r){ r.oro = true; out.push(r); });
      });
    } catch (e) {}
    return mezcla(out);
  };

  /* ---------------- motor ---------------- */
  var RELOJ = '<svg class="mr-ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 7.5V11l2.4 1.6M8 2.5h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var OK = '<span class="mr-sello ok" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4 8.4l2.7 2.7L12.2 5.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  /* corta la voz: el mp3 del mapa AUDIO (stopAudio pausa el reproductor de la app; subir playToken anula una
     reproducción que aún estaba cargando) y la síntesis de voz */
  var callaVoz = function(){
    try { if (typeof stopAudio === "function") stopAudio(); } catch (e) {}
    try { if (typeof playToken === "number") playToken++; } catch (e) {}
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
  };
  var MAL = '<span class="mr-sello no" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M5 5l6 6M11 5l-6 6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg></span>';
  function motor(zona, s){
    var reto = null, cartas = [], fase = "", hecho = false, t = 0, T = 0, tm = 0, TM = 0;
    var abiertas = [], tapar = -1, cierre = -1, errores = 0, hallados = 0, seg = -1;
    zona.innerHTML = '<div class="mr' + (s.mov ? " mr-quieto" : "") + '"><div class="mr-reloj"><i></i></div><div class="mr-tab" role="group" aria-label="Cartas"></div>' +
      '<div class="mr-pie"><p class="mr-est"></p><p class="mr-err" hidden><span>Errores</span><i></i><i></i><i></i></p>' +
      '<button class="mr-ya" type="button" data-mr-ya hidden>Empezar ya</button></div><p class="mr-vh" aria-live="polite"></p></div>';
    s.el.classList.add("mr-on");
    var raiz = zona.querySelector(".mr"), tab = zona.querySelector(".mr-tab"), reloj = zona.querySelector(".mr-reloj i"), est = zona.querySelector(".mr-est"),
      errEl = zona.querySelector(".mr-err"), ya = zona.querySelector(".mr-ya"), vivo = zona.querySelector(".mr-vh");
    /* lo que oye un lector de pantalla: solo los cambios de fase y las parejas (no la cuenta atrás de cada segundo) */
    var anuncia = function(txt){ vivo.textContent = txt; };

    /* el texto de cada carta se achica (hasta 15 px) para que ninguna palabra se parta a la mitad */
    var ajusta = function(){
      tab.querySelectorAll(".mr-cara").forEach(function(cara){
        var tx = cara.querySelector(".mr-tx"); if (!tx) return;
        tx.style.fontSize = ""; cara.classList.remove("parte");
        var cs = getComputedStyle(cara), alto = cara.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        var f = parseFloat(getComputedStyle(tx).fontSize);
        var sobra = function(){ return tx.scrollWidth > tx.clientWidth + 1 || tx.offsetHeight > alto + 1; };
        while (f > 15 && sobra()) { f -= 1; tx.style.fontSize = f + "px"; }
        if (sobra()) cara.classList.add("parte");
      });
    };
    var coloca = function(){
      raiz.style.paddingTop = (s.techo() + 10) + "px";
      if (!cartas.length) return;
      var cs = getComputedStyle(raiz), n = cartas.length;
      var W = Math.min(560, raiz.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
      var H = raiz.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 16;
      var largo = cartas.reduce(function(m, c){ return Math.max(m, c.t.length); }, 0);
      var cols = W >= 520 ? (n <= 6 ? 3 : n === 8 ? 4 : 5) : (largo <= 11 && n % 3 === 0 ? 3 : 2);
      var filas = Math.ceil(n / cols), gap = 8, alto = Math.max(64, Math.min(132, Math.floor((H - gap * (filas - 1)) / filas)));
      tab.style.gridTemplateColumns = "repeat(" + cols + ",minmax(0,1fr))";
      tab.style.gridAutoRows = alto + "px";
      ajusta();
    };
    var banner = function(){
      s.banner('<p class="plxg-ask">' + esc(reto.ask || "") + '</p><p class="plxg-q">' + (fase === "memo" ? "Memoriza las parejas" : "Encuentra las parejas") + "</p>", { oro: reto.oro });
      coloca();
    };
    var etiqueta = function(c, i){ return "Carta " + (i + 1) + (c.arriba ? ": " + c.t + (c.hecha ? ", pareja encontrada" : "") : ", tapada"); };
    var pintaTablero = function(){
      tab.innerHTML = cartas.map(function(c, i){
        var tag = reto.tags && reto.tags[c.lado] ? '<small class="mr-tag">' + reto.tags[c.lado] + "</small>" : "";
        return '<button class="mr-c' + (c.arriba ? " arriba" : "") + '" type="button" data-mr-i="' + i + '" aria-label="' + esc(etiqueta(c, i)) + '">' +
          '<span class="mr-in"><span class="mr-dorso" aria-hidden="true"></span><span class="mr-cara ' + (c.lado ? "mr-b" : "mr-a") + (c.t.length > 22 ? " largo" : c.t.length > 13 ? " medio" : "") + '">' + tag + OK + MAL +
          '<span class="mr-tx">' + (c.h || esc(c.t)) + "</span></span></span>" + (i < 10 ? '<small class="mr-n" aria-hidden="true">' + ((i + 1) % 10) + "</small>" : "") + "</button>";
      }).join("");
    };
    var boton = function(i){ return tab.querySelector('[data-mr-i="' + i + '"]'); };
    var pinta = function(i){
      var c = cartas[i], b = boton(i); if (!b) return;
      b.classList.toggle("arriba", !!c.arriba); b.classList.toggle("hecha", !!c.hecha);
      b.setAttribute("aria-label", etiqueta(c, i));
    };
    var pie = function(){
      if (fase === "memo") {
        var r = Math.max(1, Math.ceil(TM - tm));
        if (r !== seg) { seg = r; est.innerHTML = RELOJ + "Memoriza <b>" + r + " s</b>"; }
        ya.hidden = false; errEl.hidden = true;
      } else {
        est.innerHTML = "Parejas <b>" + hallados + "/" + (reto ? reto.pares.length : 0) + "</b>";
        ya.hidden = true; errEl.hidden = false;
        errEl.querySelectorAll("i").forEach(function(x, k){ x.classList.toggle("on", k < errores); });
        errEl.setAttribute("aria-label", "Errores: " + errores + " de 3");
      }
    };

    var jugar = function(r){
      reto = r; hecho = false; errores = 0; hallados = 0; abiertas = []; tapar = -1; cierre = -1; t = 0; tm = 0; seg = -1;
      var lista = [];
      r.pares.forEach(function(p, k){
        var h = r.html && r.html[k];
        lista.push({ t: p[0], h: h ? h[0] : "", lado: 0, par: k }); lista.push({ t: p[1], h: h ? h[1] : "", lado: 1, par: k });
      });
      cartas = mezcla(lista); cartas.forEach(function(c){ c.arriba = true; c.hecha = false; });
      cartas.forEach(function(c){ c.voz = suena(r, c, cartas); });
      /* tiempos: memorizar según las parejas y lo que hay que leer; buscar según las parejas.
         k lleva el ajuste del director y el modo sin tiempo (s.dir.t() ya los incluye) */
      var base = G.DIF && G.DIF[s.nivel] ? G.DIF[s.nivel].t : 4.5, k = s.dir.t() / base, letras = lista.reduce(function(m, c){ return m + c.t.length; }, 0);
      TM = Math.min(15, (1 + r.pares.length * [1, .9, .8][s.nivel || 0] + letras * .03)) * k;
      T = k * (6 + r.pares.length * (base + 2.5));
      fase = "memo"; raiz.classList.add("memo"); raiz.classList.remove("mr-listo");
      reloj.style.transform = "scaleX(1)"; reloj.parentNode.classList.remove("poco");
      pintaTablero(); banner(); pie();
      anuncia("Tablero de " + r.pares.length + " parejas. Memoriza las cartas: " + Math.ceil(TM) + " segundos.");
    };
    /* termina la memorización: se tapan todas */
    var empieza = function(){
      if (fase !== "memo" || !reto) return;
      fase = "busca"; raiz.classList.remove("memo");
      cartas.forEach(function(c, i){ c.arriba = false; pinta(i); });
      reloj.style.transform = "scaleX(1)";
      banner(); pie(); G.sfx("ya");
      anuncia("Se taparon las cartas. Encuentra las parejas.");
    };
    var centro = function(i){ var b = boton(i); if (!b) return { x: zona.clientWidth / 2, y: zona.clientHeight / 2 }; var a = b.getBoundingClientRect(), z = zona.getBoundingClientRect(); return { x: a.left - z.left + a.width / 2, y: a.top - z.top + a.height / 3 }; };
    var tapaAbiertas = function(){
      abiertas.forEach(function(i){ var c = cartas[i]; if (c && !c.hecha) { c.arriba = false; pinta(i); var b = boton(i); if (b) b.classList.remove("mal"); } });
      abiertas = []; tapar = -1;
    };
    /* la pareja en el orden del ejercicio (izquierda → derecha) */
    var par = function(k){ return reto.correcta[k]; };
    var porque = function(ks){
      var vistos = {}, h = [];
      ks.forEach(function(k){
        if (vistos[k]) return; vistos[k] = 1;
        var p = reto.pares[k], v = reto.voc && reto.voc[k];
        if (v) h.push("<b>" + esc(v.fr) + "</b> = " + esc(v.es) + (v.ex ? "<br><i>" + esc(v.ex) + "</i>" : ""));
        else { var o = reto.gira ? [p[1], p[0]] : p; h.push("<b>" + esc(o[0]) + "</b> → <b>" + esc(o[1]) + "</b>"); }
      });
      return h.join("<br>") + (reto.why ? "<br>" + reto.why : "");
    };
    var voltea = function(i){
      if (!reto || hecho || fase !== "busca" || s.estado() !== "juega") return;
      var c = cartas[i]; if (!c || c.hecha || abiertas.indexOf(i) >= 0) return;
      G.despiertaAudio();
      if (abiertas.length >= 2) tapaAbiertas();
      c.arriba = true; pinta(i); abiertas.push(i);
      /* «allé(e)» se lee «allé»; las aclaraciones entre paréntesis no se leen */
      if (c.voz) try { speak(c.t.replace(/\((e|s|es|x)\)/g, "").replace(/\s*\([^)]*\)/g, "").trim()); } catch (e) {}
      if (abiertas.length < 2) { G.sfx("paso", 0); return; }
      var a = cartas[abiertas[0]], b = cartas[abiertas[1]], p = centro(i);
      if (a.par === b.par) {
        a.hecha = b.hecha = true; pinta(abiertas[0]); pinta(abiertas[1]); abiertas = [];
        hallados++;
        var final = hallados >= reto.pares.length;
        s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: p.x, y: p.y, final: final });
        if (final) { hecho = true; cierre = .7; raiz.classList.add("mr-listo"); }
        anuncia("Pareja encontrada: " + hallados + " de " + reto.pares.length + "." + (final ? " Tablero completo." : ""));
        pie(); return;
      }
      errores++;
      anuncia("No son pareja. Errores: " + errores + " de 3.");
      abiertas.forEach(function(j){ var bt = boton(j); if (bt) { bt.classList.remove("mal"); void bt.offsetWidth; bt.classList.add("mal"); } });
      pie();
      if (errores < 3) { s.penaliza(p.x, p.y); G.vibra(40); tapar = .9; return; }
      hecho = true;
      /* la corrección es la pareja de la primera carta; el porqué agrega la de la segunda (y, en vocabulario, los dos significados completos) */
      s.fallo(reto, { etMal: "Volteaste", mal: a.t + " + " + b.t, etiqueta: "La pareja", bien: par(a.par), why: porque(reto.voc ? [a.par, b.par] : [b.par]),
        key: reto.key || null, hab: reto.hab, q: reto.q })
        .then(function(){ limpia(); s.listo(); });
    };
    var limpia = function(){ reto = null; cartas = []; fase = ""; abiertas = []; tab.innerHTML = ""; est.innerHTML = ""; vivo.textContent = ""; errEl.hidden = true; ya.hidden = true; raiz.classList.remove("memo", "mr-listo"); reloj.style.transform = "scaleX(1)"; };

    /* ---- entrada ---- */
    var abajo = function(e){
      if (e.button > 0) return;
      var y = e.target.closest && e.target.closest("[data-mr-ya]");
      if (y) { e.preventDefault(); if (s.estado() === "juega") empieza(); return; }
      var b = e.target.closest && e.target.closest(".mr-c"); if (!b) return;
      e.preventDefault(); voltea(+b.getAttribute("data-mr-i"));
    };
    /* Enter o espacio sobre un botón enfocado (clic sin puntero) */
    var clic = function(e){
      if (e.detail !== 0) return;
      if (e.target.closest && e.target.closest("[data-mr-ya]")) { if (s.estado() === "juega") empieza(); return; }
      var b = e.target.closest && e.target.closest(".mr-c"); if (b) voltea(+b.getAttribute("data-mr-i"));
    };
    zona.addEventListener("pointerdown", abajo); zona.addEventListener("click", clic);
    window.addEventListener("resize", coloca);

    return {
      jugar: jugar,
      tick: function(dt){
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) { limpia(); s.listo(); } return; }
        if (hecho || !dt) return;
        if (fase === "memo") {
          tm += dt;
          reloj.style.transform = "scaleX(" + Math.max(0, 1 - tm / TM).toFixed(3) + ")";
          pie();
          if (tm >= TM) empieza();
          return;
        }
        if (tapar >= 0) { tapar -= dt; if (tapar < 0) tapaAbiertas(); }
        t += dt;
        reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        reloj.parentNode.classList.toggle("poco", t / T > .75);
        if (t >= T) {
          hecho = true; tapar = -1; abiertas = [];
          cartas.forEach(function(c, i){ c.arriba = true; pinta(i); var b = boton(i); if (b) b.classList.remove("mal"); });
          var faltan = []; reto.pares.forEach(function(_, k){ if (!cartas.some(function(c){ return c.par === k && c.hecha; })) faltan.push(k); });
          s.escapa(reto, { titulo: "Se acabó el tiempo", etiqueta: faltan.length > 1 ? "Faltaban" : "Faltaba", bien: faltan.map(par).join(" · "), why: reto.voc ? porque(faltan) : reto.why })
            .then(function(){ limpia(); s.listo(); });
        }
      },
      tecla: function(e){
        if (fase === "memo" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); empieza(); return; }
        if (!/^[0-9]$/.test(e.key)) return;
        var i = e.key === "0" ? 9 : +e.key - 1;
        if (i < cartas.length) { e.preventDefault(); voltea(i); }
      },
      /* en la pausa las cartas se muestran tapadas (no se puede memorizar con el reloj detenido) y se corta el audio */
      pausa: function(){ raiz.classList.add("mr-tapa"); callaVoz(); },
      sigue: function(){ raiz.classList.remove("mr-tapa"); coloca(); },
      destruye: function(){
        zona.removeEventListener("pointerdown", abajo); zona.removeEventListener("click", clic);
        window.removeEventListener("resize", coloca);
        s.el.classList.remove("mr-on");
        reto = null; cartas = []; callaVoz();
      },
      depura: function(){
        var bs = tab.querySelectorAll(".mr-c");
        return {
          fase: fase, hecho: hecho, cerrado: !reto || hecho, t: t, T: T, tm: tm, TM: TM, errores: errores, hallados: hallados,
          pares: reto ? reto.pares.length : 0, abiertas: abiertas.slice(), tapadasEnPausa: raiz.classList.contains("mr-tapa"), vivo: vivo.textContent,
          ya: (function(){ if (ya.hidden) return null; var r = ya.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })(),
          cartas: [].map.call(bs, function(b){
            var i = +b.getAttribute("data-mr-i"), c = cartas[i] || {}, r = b.getBoundingClientRect();
            return { i: i, t: c.t, lado: c.lado, par: c.par, voz: !!c.voz, arriba: !!c.arriba, hecha: !!c.hecha, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) };
          })
        };
      }
    };
  }

  /* ---------------- registro ---------------- */
  /* huella de Manzana: el motivo del dorso (como las monedas de la marca) */
  var HUELLA = function(cx, cy, k, color){
    var dedo = function(x, y, r){ return '<ellipse cx="' + x + '" cy="' + y + '" rx="1.9" ry="2.45" transform="rotate(' + r + " " + x + " " + y + ')"/>'; };
    return '<g transform="translate(' + cx + " " + cy + ") scale(" + k + ')" fill="' + color + '">' +
      '<path d="M0-.8c-3.2 0-6 3.1-6 5.6 0 1.8 1.4 2.6 3 2.6 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.6 0 3-.8 3-2.6 0-2.5-2.8-5.6-6-5.6z"/>' +
      dedo(-5.4, -3.4, -20) + dedo(-2, -6.4, -6) + dedo(2, -6.4, 6) + dedo(5.4, -3.4, 20) + "</g>";
  };
  var deco = function(){
    var dorso = function(x, y, r){ return '<g transform="rotate(' + r + " " + (x + 10) + " " + (y + 14) + ')"><rect x="' + x + '" y="' + y + '" width="20" height="28" rx="4" fill="#1E5BD7" stroke="#93C5FD" stroke-opacity=".5"/>' +
      '<rect x="' + (x + 2.5) + '" y="' + (y + 2.5) + '" width="15" height="23" rx="2.5" fill="none" stroke="#FFD200" stroke-opacity=".6" stroke-width=".9"/>' + HUELLA(x + 10, y + 14.4, .62, "#FFD200") + "</g>"; };
    return '<svg viewBox="0 0 72 56" aria-hidden="true">' + dorso(2, 16, -8) +
      '<g transform="rotate(-2 30 26)"><rect x="18" y="8" width="22" height="30" rx="4" fill="#081F55" stroke="#F472B6" stroke-width="1.6"/><rect x="22" y="20" width="14" height="3" rx="1.5" fill="#fff"/><rect x="24" y="26" width="10" height="3" rx="1.5" fill="#fff" opacity=".7"/></g>' +
      '<g transform="rotate(4 52 30)"><rect x="40" y="14" width="22" height="30" rx="4" fill="#fff" stroke="#F472B6" stroke-width="1.6"/><rect x="44" y="26" width="14" height="3" rx="1.5" fill="#0B2D74"/><rect x="46" y="32" width="10" height="3" rx="1.5" fill="#0B2D74" opacity=".6"/></g>' +
      dorso(50, 22, 12) + "</svg>";
  };
  G.registrar({
    id: "mr", nombre: "Memory Rush", verbo: "Memoriza y empareja", familia: "Memoria", color: "#F472B6", orden: 40, vocab: true,
    vocabNota: "francés con español, con el audio de cada palabra",
    retos: retosMR,
    retosCarnet: retosCarnetMR,
    apto: function(r){ return r.tipo === "parejas" && r.pares && r.pares.length >= MINP; },
    deco: deco,
    reglas: function(alc){
      var n = (alc.tema ? TAM : TAML)[G.nivel(alc.track)] || 4, seg = alc.repaso ? 90 : 120;
      return [
        (G.aj.sinTiempo ? "Sin tiempo: " + (alc.repaso ? 10 : 15) + " tableros" : seg + " segundos") + " y 3 vidas.",
        alc.tema ? "Memoriza hasta " + n + " parejas boca arriba; cuando se tapan, voltea dos cartas por turno para unir cada palabra en francés (carta oscura con franja rosa, con audio) con su significado (carta blanca)."
          : "Memoriza hasta " + n + " parejas boca arriba; cuando se tapan, voltea dos cartas por turno para unir cada carta oscura (franja rosa) con su pareja blanca.",
        "Cada pareja equivocada rompe el combo; la tercera en un tablero te quita una vida y lo cierra.",
        "Cada tablero tiene su tiempo: si se acaba, ves las parejas que faltaban."
      ];
    },
    opciones: function(alc){ return { seg: alc.repaso ? 90 : 120 }; },
    montar: function(zona, s){ return motor(zona, s); }
  });

  var DORSO = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#0B2D74" stroke="#FFD200" stroke-width="1.6"/>' +
    '<circle cx="20" cy="20" r="13.6" fill="none" stroke="#FFD200" stroke-opacity=".35" stroke-width="1"/>' + HUELLA(20, 20.8, 1, "#FFD200") + "</svg>");
  var st = document.createElement("style"); st.id = "plx49";
  st.textContent = `
  .mr{position:absolute;inset:0;display:flex;flex-direction:column;gap:10px;padding:0 16px calc(84px + env(safe-area-inset-bottom));box-sizing:border-box}
  .mr-reloj{height:6px;border-radius:99px;background:rgba(147,197,253,.18);overflow:hidden;flex:none;width:100%;max-width:560px;margin:0 auto}
  .mr-reloj i{display:block;height:100%;background:#6BE58E;transform-origin:left;border-radius:99px}
  .mr.memo .mr-reloj i{background:#F472B6}
  .plxg.mr-on .mr-reloj.poco i{background:#FF8A8F}
  .mr-tab{flex:1;min-height:0;display:grid;gap:8px;align-content:center;width:100%;max-width:560px;margin:0 auto}
  .mr-c{position:relative;display:block;width:100%;height:100%;min-height:64px;margin:0;padding:0;border:0;background:none;cursor:pointer;perspective:800px;touch-action:manipulation;user-select:none;-webkit-user-select:none;border-radius:14px}
  .mr-in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .38s cubic-bezier(.3,.7,.3,1)}
  .mr-c.arriba .mr-in{transform:rotateY(180deg)}
  .mr.mr-tapa .mr-c .mr-in{transform:none;transition:none}
  .mr-dorso,.mr-cara{position:absolute;inset:0;border-radius:14px;backface-visibility:hidden;-webkit-backface-visibility:hidden}
  .mr-dorso{background-color:#1E5BD7;background-image:url("${DORSO}"),repeating-linear-gradient(135deg,rgba(255,255,255,.06) 0 2px,transparent 2px 11px),linear-gradient(160deg,#2A6BEA,#163F9E);
    background-repeat:no-repeat,repeat,no-repeat;background-position:center;background-size:auto min(62%,52px),auto,auto;box-shadow:inset 0 0 0 2px rgba(147,197,253,.4),0 4px 0 #0A2A6E}
  .mr-dorso::after{content:"";position:absolute;inset:6px;border-radius:9px;box-shadow:inset 0 0 0 1.5px rgba(255,210,0,.5)}
  .mr-cara{transform:rotateY(180deg);display:flex;align-items:center;justify-content:center;padding:14px 10px 10px;text-align:center;overflow:hidden}
  .mr-a{background:#081F55;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.45),0 4px 0 #04112F}
  .mr-a::before{content:"";position:absolute;left:12px;right:12px;top:0;height:4px;border-radius:0 0 4px 4px;background:#F472B6}
  .mr-b{background:#fff;color:#0B2D74;box-shadow:inset 0 0 0 1.5px #93C5FD,0 4px 0 #93C5FD}
  .mr-b::before{content:"";position:absolute;left:12px;right:12px;bottom:0;height:4px;border-radius:4px 4px 0 0;background:#0B2D74}
  .mr-tx{display:block;width:100%;min-width:0;font:700 17px/1.2 Poppins,Inter,system-ui,sans-serif;overflow-wrap:normal;word-break:normal;hyphens:manual}
  .mr-tx i{font-style:italic}
  .mr-cara.medio .mr-tx{font:600 16px/1.25 Inter,system-ui,sans-serif}
  .mr-cara.largo .mr-tx{font:600 15px/1.25 Inter,system-ui,sans-serif}
  .mr-cara.parte .mr-tx{overflow-wrap:anywhere}
  .mr-tag{position:absolute;top:6px;right:8px;font:800 10px/1 Poppins,system-ui,sans-serif;letter-spacing:.1em;opacity:.85}
  .mr-a .mr-tag{color:#FFD200}
  .mr-b .mr-tag{color:#1E5BD7}
  .mr-sello{position:absolute;top:5px;left:6px;width:20px;height:20px;border-radius:50%;display:none;place-items:center}
  .mr-sello svg{width:14px;height:14px}
  .mr-sello.ok{background:#15803D;box-shadow:0 0 0 2px rgba(107,229,142,.55)}
  .mr-sello.no{background:#E5484D;box-shadow:0 0 0 2px rgba(255,138,143,.5)}
  .mr-c.hecha .mr-sello.ok,.mr-c.mal .mr-sello.no{display:grid}
  .mr-c.hecha .mr-cara{box-shadow:inset 0 0 0 3px #6BE58E}
  .mr-c.hecha{cursor:default}
  .mr-c.mal .mr-cara{box-shadow:inset 0 0 0 3px #FF6B78}
  .mr-c.mal{animation:mrMal .35s}
  .mr-c:focus-visible{outline:3px solid #FFD200;outline-offset:3px}
  .mr.memo .mr-c{cursor:default}
  .mr-n{position:absolute;top:-7px;left:-7px;z-index:2;width:20px;height:20px;border-radius:50%;background:#FFD200;color:#081F55;font:800 11px/20px Poppins,system-ui,sans-serif;text-align:center;display:none}
  @media (pointer:fine){ .mr-n{display:block} }
  .mr.mr-listo .mr-c.hecha .mr-cara{box-shadow:inset 0 0 0 3px #6BE58E,0 0 22px -4px rgba(107,229,142,.8)}
  .mr-pie{position:absolute;left:86px;right:16px;bottom:calc(14px + env(safe-area-inset-bottom));min-height:52px;display:flex;align-items:center;justify-content:space-between;gap:10px;max-width:560px}
  .mr-vh{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
  .mr-est{margin:0;display:flex;align-items:center;gap:6px;font:700 16px/1.2 Poppins,Inter,system-ui,sans-serif;color:#fff;white-space:nowrap}
  .mr-est b{color:#FFD200;font-weight:800;font-variant-numeric:tabular-nums}
  .mr-ico{width:18px;height:18px;color:#F472B6;flex:none}
  .mr-err{margin:0;display:flex;align-items:center;gap:6px;font:600 15px/1 Inter,system-ui,sans-serif;color:#C9D8FF}
  .mr-err[hidden],.mr-ya[hidden]{display:none}
  .mr-err span{margin-right:2px}
  .mr-err i{width:14px;height:14px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(147,197,253,.6)}
  .mr-err i.on{background:#FF6B78;box-shadow:none}
  .mr-ya{min-height:48px;padding:0 18px;border:0;border-radius:14px;background:#FFD200;color:#081F55;font:800 15px/1 Poppins,system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 0 #C9A400;white-space:nowrap}
  .mr-ya:active{transform:translateY(3px);box-shadow:0 1px 0 #C9A400}
  .mr-ya:focus-visible{outline:3px solid #93C5FD;outline-offset:3px}
  @keyframes mrMal{0%,100%{translate:0}25%{translate:-6px}75%{translate:6px}}
  .mr.mr-quieto .mr-in{transition:none}
  .mr.mr-quieto .mr-c.mal{animation:none}
  @media (prefers-reduced-motion:reduce){ .mr-in{transition:none} .mr-c.mal{animation:none} }
  `;
  document.head.appendChild(st);
})();
