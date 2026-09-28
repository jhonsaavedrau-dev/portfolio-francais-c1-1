/* PLEX PLAY 1.24.0 — Arcade: los componentes que comparten todos los juegos
   (1.24.0: sesión de juego común, registro de juegos, alcances compartidos y estrellas por juego)
   - Adaptador: convierte los ítems de una lección (o el vocabulario) en «retos» con un formato común.
     Los motores de juego solo reciben retos, nunca ítems.
   - Director de dificultad: tiempo y número de opciones según el nivel (A1 a C1) y según cómo va la partida.
   - Puntos y combo con las mismas reglas en todos los juegos (100 + hasta 50 por rapidez, ×2 ×3 ×4).
   - Sonido generado con Web Audio (sin archivos), vibración y reacciones de Manzana.
   - Marco del juego: barra superior, pausa, cuenta 3-2-1, momento de aprendizaje y resultados.
   - Recompensas: XP con addXP, minutos del día (racha), estrellas por unidad, récord y fantasma.
   - Los errores van al carnet igual que en las lecciones; los aciertos de retos del carnet lo vacían.
   Todo vive en window.PLXG; los juegos (plx46 en adelante) se registran en PLXG.juegos. */
(function(){
  "use strict";
  var G = window.PLXG = window.PLXG || {};
  G.MAX = 22;               /* caracteres máximos en una fruta, ficha o carta */
  G.juegos = G.juegos || {};

  /* ---------------- utilidades ---------------- */
  var esc = G.esc = function(x){ return String(x == null ? "" : x).replace(/[&<>"']/g, function(c){ return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]; }); };
  var PARSER = new DOMParser();
  var plano = G.plano = function(html){ var d = PARSER.parseFromString("<body>" + String(html || "") + "</body>", "text/html"); return (d.body.textContent || "").replace(/\s+/g, " ").trim(); };
  /* HTML sencillo de los datos: se conservan b, i, em, strong, u y br; el resto queda como texto */
  var seguro = G.seguro = function(html){
    var out = "", d = PARSER.parseFromString("<body>" + String(html || "") + "</body>", "text/html");
    (function rec(n){
      n.childNodes.forEach(function(c){
        if (c.nodeType === 3) { out += esc(c.nodeValue); return; }
        if (c.nodeType !== 1) return;
        var t = c.tagName.toLowerCase(), ok = /^(b|i|em|strong|u)$/.test(t);
        if (t === "br") { out += "<br>"; return; }
        if (ok) out += "<" + t + ">"; rec(c); if (ok) out += "</" + t + ">";
      });
    })(d.body);
    return out;
  };
  var norm = G.norm = function(s){ return String(s || "").normalize("NFC").replace(/[’`]/g, "'").replace(/\s+/g, " ").trim().toLowerCase(); };
  var mezcla = G.mezcla = function(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  /* Límite de largo de una opción. Fruit Frenzy usa 22 (lo que cabe en una fruta); otros juegos pueden
     pedir más con {max, fichas} (fichas: número máximo de piezas de un order). */
  var LIM = G.MAX, FICHAS = 6;
  var cabe = function(s){ s = String(s || ""); return s.length > 0 && s.length <= LIM; };
  var conOpciones = function(op, f){ var a = LIM, b = FICHAS; LIM = (op && op.max) || G.MAX; FICHAS = (op && op.fichas) || 6; try { return f(); } finally { LIM = a; FICHAS = b; } };
  var ls = { get: function(k){ try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function(k, v){ try { localStorage.setItem(k, v); } catch (e) {} } };
  G.movReducido = function(){ try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

  /* ---------------- ajustes del jugador (por dispositivo) ---------------- */
  G.aj = (function(){ var d = { sonido: true, vibrar: true, sinTiempo: false }; try { Object.assign(d, JSON.parse(ls.get("plxg-aj") || "{}")); } catch (e) {} return d; })();
  G.guardaAj = function(){ ls.set("plxg-aj", JSON.stringify(G.aj)); };

  /* ---------------- niveles y director de dificultad ---------------- */
  var NIVEL = { a1: 0, a2: 0, fon: 0, b11: 1, b12: 1, b21: 1, rem: 1, prog: 2, c12: 2, lit: 2 };
  G.DIF = [
    { nombre: "A1–A2", opciones: [2, 3], t: 6 },
    { nombre: "B1–B2", opciones: [3, 4], t: 4.5 },
    { nombre: "C1",    opciones: [4, 5], t: 3.5 }
  ];
  G.nivel = function(track){ var n = NIVEL[track]; return n == null ? 1 : n; };
  G.director = function(track){
    var n = G.nivel(track), d = G.DIF[n];
    return {
      nivel: n, factor: 1, bien: 0, mal: 0,
      opciones: function(){ return d.opciones[0] + (Math.random() < .5 ? 0 : 1); },
      t: function(){ return d.t * this.factor * (G.aj.sinTiempo ? 1.5 : 1); },
      /* 5 aciertos seguidos: 10 % más rápido · 3 errores seguidos: 15 % más lento */
      acierto: function(){ this.mal = 0; if (++this.bien >= 5) { this.bien = 0; this.factor = Math.max(.6, this.factor / 1.1); } },
      error: function(){ this.bien = 0; if (++this.mal >= 3) { this.mal = 0; this.factor = Math.min(1.8, this.factor * 1.15); } }
    };
  };

  /* ---------------- distractores ---------------- */
  var parecido = function(a, b){
    a = norm(a); b = norm(b);
    var p = 0; while (p < a.length && p < b.length && a[p] === b[p]) p++;
    var s = 0; while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
    return (p + s) / Math.max(a.length, b.length, 1) - Math.abs(a.length - b.length) * .02 + (a.split(" ").length === b.split(" ").length ? .15 : 0);
  };
  var lev = function(a, b){
    var p = [], i, j; for (j = 0; j <= b.length; j++) p[j] = j;
    for (i = 1; i <= a.length; i++) { var d = p[0], t; p[0] = i; for (j = 1; j <= b.length; j++) { t = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, d + (a[i - 1] === b[j - 1] ? 0 : 1)); d = t; } }
    return p[b.length];
  };
  /* Un distractor de relleno (sacado de otro ejercicio) debe tener la misma forma que la correcta
     (para no poner «treize» junto a una pregunta) y ser claramente distinto: algo casi idéntico
     («le repas du midi» frente a «le repas de midi») podría ser también correcto. Los casi correctos
     solo salen de las opciones que el propio ejercicio trae. */
  var forma = function(a, b){
    var na = norm(a), nb = norm(b), pa = na.split(" ").length, pb = nb.split(" ").length, r = b.length / Math.max(1, a.length);
    if (Math.abs(pa - pb) > 1 || r < .5 || r > 2 || /[?]$/.test(a.trim()) !== /[?]$/.test(b.trim())) return false;
    var may = function(x){ return /^\p{Lu}/u.test(x.trim()); }, cif = function(x){ return /\d/.test(x); };
    if (may(a) !== may(b) || cif(a) !== cif(b)) return false;
    return lev(na, nb) > Math.max(2, Math.round(Math.max(na.length, nb.length) * .4));
  };
  /* nivel 0: claros (al azar) · 1: de la misma forma (largo y número de palabras) · 2: casi correctos.
     Con «relleno» (distractores sacados de otros ejercicios) solo entran los de la misma forma. */
  G.distractores = function(correcta, candidatos, nivel, excluir, relleno){
    var fuera = {}; [correcta].concat(excluir || []).forEach(function(x){ fuera[norm(x)] = 1; });
    var vistos = {}, lista = [];
    (candidatos || []).forEach(function(c){ var k = norm(c); if (!cabe(c) || fuera[k] || vistos[k] || (relleno && !forma(correcta, c))) return; vistos[k] = 1; lista.push(c); });
    if (nivel === 0) return mezcla(lista);
    return lista.map(function(c){ return { c: c, p: parecido(correcta, c) * (nivel === 2 ? 1 : .5) + Math.random() * (nivel === 2 ? .15 : .5) }; })
      .sort(function(x, y){ return y.p - x.p; }).map(function(x){ return x.c; });
  };

  /* ---------------- adaptador: ítems → retos ----------------
     Un reto: { tipo, ask, q, correcta:[...], malas:[...], why, audio, hab, key, lessonId, fix }
       tipo "uno"    se elige una sola respuesta (choice, fill, match, vocabulario)
            "varios" se eligen todas las de una categoría (sort)
            "orden"  se eligen en secuencia (order)
            "error"  se elige la palabra incorrecta y luego su arreglo (spot)
     key es la clave del ítem en ITEMS (la misma del carnet). */
  /* respuestas de un grupo de ítems, separadas por tipo: el relleno de un ejercicio sale solo de
     ejercicios del mismo tipo (así un fill de verbos no recibe números sacados de un match) */
  var respuestas = function(items){
    var o = { choice: [], fill: [], match: [], spot: [] };
    items.forEach(function(it){
      if (it.k === "choice" && it.o) o.choice.push.apply(o.choice, it.o);
      if (it.k === "fill" && it.acc) o.fill.push(it.acc[0]);
      if (it.k === "match" && it.pairs) it.pairs.forEach(function(p){ o.match.push(p[1]); });
      if (it.k === "spot" && it.fix) o.spot.push(it.fix);
    });
    return o;
  };
  var pozos = {};
  var pozoCurso = function(track){
    if (!pozos[track]) { var its = []; LESSONS.forEach(function(l){ if (l.track === track) its.push.apply(its, l.items || []); }); pozos[track] = respuestas(its); }
    return pozos[track];
  };
  /* «Vous ___ quel âge ? (avoir)»: las respuestas de otros fill del curso con la misma pista
     son otras formas del mismo verbo (ai, as, avons…), los mejores distractores posibles */
  var pistaDe = function(it){ var m = plano(it.q || "").match(/\(([^()]{2,30})\)\s*\.?$/); return m ? norm(m[1]) : ""; };
  var pistas = {};
  var pozoPista = function(track, pista){
    if (!pista) return [];
    if (!pistas[track]) { var t = pistas[track] = {}; LESSONS.forEach(function(l){ if (l.track !== track) return; (l.items || []).forEach(function(it){ var p = it.k === "fill" && it.acc && pistaDe(it); if (p) (t[p] = t[p] || []).push(it.acc[0]); }); }); }
    return pistas[track][pista] || [];
  };
  /* presente de los verbos más frecuentes; los regulares en -er se conjugan solos */
  var PRES = {
    "être": "suis es est sommes êtes sont", "avoir": "ai as a avons avez ont", "aller": "vais vas va allons allez vont",
    "faire": "fais fais fait faisons faites font", "pouvoir": "peux peux peut pouvons pouvez peuvent", "vouloir": "veux veux veut voulons voulez veulent",
    "devoir": "dois dois doit devons devez doivent", "venir": "viens viens vient venons venez viennent", "prendre": "prends prends prend prenons prenez prennent",
    "savoir": "sais sais sait savons savez savent", "finir": "finis finis finit finissons finissez finissent", "dire": "dis dis dit disons dites disent",
    "voir": "vois vois voit voyons voyez voient", "sortir": "sors sors sort sortons sortez sortent", "partir": "pars pars part partons partez partent",
    "mettre": "mets mets met mettons mettez mettent", "lire": "lis lis lit lisons lisez lisent", "écrire": "écris écris écrit écrivons écrivez écrivent"
  };
  var conjuga = function(pista, correcta){
    var v = norm(pista).replace(/^(s'|se )/, ""), o = [];
    if (PRES[v]) o = PRES[v].split(" ");
    else if (/^[a-zàâçéèêëîïôûùüÿœ]{3,}er$/.test(v) && v !== "aller") { var r = v.slice(0, -2), r2 = /g$/.test(r) ? r + "e" : /c$/.test(r) ? r.slice(0, -1) + "ç" : r;
      o = [r + "e", r + "es", r2 + "ons", r + "ez", r + "ent"]; }
    if (!o.length) return [];
    /* solo si la correcta es una de esas formas: si no, la pista no era un verbo en presente */
    return o.indexOf(norm(correcta)) >= 0 ? igualaCaso(correcta, o) : [];
  };
  /* la mayúscula inicial no debe delatar la respuesta */
  var igualaCaso = function(correcta, lista){
    var M = /^\p{Lu}/u.test(correcta.trim());
    return lista.map(function(x){ x = String(x); return M ? x.charAt(0).toUpperCase() + x.slice(1) : /^\p{Lu}\p{Ll}/u.test(x) && !/^\p{Lu}/u.test(correcta) ? x.charAt(0).toLowerCase() + x.slice(1) : x; });
  };
  /* números en letras: «(48, en letras)» → quarante-sept, quarante-neuf, cinquante-huit, quatre-vingt-quatre… */
  var U = "zéro un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize".split(" ");
  var D = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];
  var numFr = function(n){
    if (n < 17) return U[n];
    if (n < 20) return "dix-" + U[n - 10];
    if (n < 70) { var t = D[Math.floor(n / 10)], u = n % 10; return u === 0 ? t : u === 1 ? t + " et un" : t + "-" + U[u]; }
    if (n < 80) return n === 71 ? "soixante et onze" : "soixante-" + numFr(n - 60);
    if (n < 100) return n === 80 ? "quatre-vingts" : "quatre-vingt-" + numFr(n - 80);
    if (n < 1000) { var h = Math.floor(n / 100), r = n % 100, c = (h === 1 ? "" : U[h] + " ") + "cent" + (h > 1 && !r ? "s" : ""); return r ? c + " " + numFr(r) : c; }
    if (n < 10000) { var m = Math.floor(n / 1000), r2 = n % 1000, c2 = (m === 1 ? "" : U[m] + " ") + "mille"; return r2 ? c2 + " " + numFr(r2) : c2; }
    return "";
  };
  var clave = function(x){ return norm(x).replace(/[\s-]/g, ""); };
  var numeros = function(pista, correcta){
    var m = String(pista).match(/\d{1,4}/); if (!m) return [];
    /* Bélgica y Suiza: septante, huitante, nonante (sin «soixante-dix», que también es correcto) */
    var BE = ["soixante", "septante", "huitante", "nonante", "septante et un", "cent"];
    if (/^(septante|huitante|octante|nonante)$/.test(clave(correcta))) return igualaCaso(correcta, BE.filter(function(x){ return clave(x) !== clave(correcta); }));
    var n = +m[0]; if (!numFr(n) || clave(numFr(n)) !== clave(correcta)) return [];
    var guion = !/\s/.test(correcta.trim()) && /\s/.test(numFr(n));   /* ortografía de 1990: todo con guiones */
    var inv = +String(n).split("").reverse().join("");
    var cand = [n + 1, n - 1, n + 10, n - 10, inv, n + 20, n - 20, n + 100].filter(function(x){ return x >= 0 && x !== n && x < 10000; });
    return igualaCaso(correcta, cand.map(function(x){ var t = numFr(x); return guion ? t.replace(/\s/g, "-") : t; }));
  };
  var pregunta = function(it){ return plano(it.q || it.s || ""); };
  G.retosDeItem = function(it, key, l, nivel, pozo, op){ return conOpciones(op, function(){ return retosDeItem(it, key, l, nivel, pozo || respuestas(l ? l.items || [] : [])); }); };
  var retosDeItem = function(it, key, l, nivel, pozo){
    var base = { key: key, lessonId: l ? l.id : "", hab: it.t || "autre", ask: plano(it.ask || ""), why: it.why || "" };
    var mk = function(extra){ var r = Object.assign({}, base, extra); return r; };
    /* primero los distractores propios del ítem; si faltan, los de la lección y luego los del curso,
       siempre de ejercicios de los tipos indicados */
    var conPozo = function(correcta, propias, excluir, tipos){
      var m = G.distractores(correcta, propias, nivel, excluir), junta = function(pz){ var o = []; tipos.forEach(function(t){ o.push.apply(o, pz[t] || []); }); return o; };
      if (m.length < 4) m = m.concat(G.distractores(correcta, junta(pozo), nivel, excluir.concat(m), true));
      if (m.length < 4 && l) m = m.concat(G.distractores(correcta, junta(pozoCurso(l.track)), nivel, excluir.concat(m), true));
      return m.slice(0, 5);
    };
    if (it.k === "choice" && it.o && it.o.every(cabe)) {
      var ok = it.o[it.a], m = it.o.filter(function(_, i){ return i !== it.a; }), mm = conPozo(ok, m, [], ["choice"]);
      return [mk({ tipo: "uno", q: pregunta(it) || base.ask, correcta: [ok], malas: mm.slice(0, m.length + 1) })];   /* como mucho un distractor de relleno */
    }
    if (it.k === "fill" && it.acc && cabe(it.acc[0])) {
      return [mk({ tipo: "uno", q: pregunta(it), correcta: [it.acc[0]], malas: conPozo(it.acc[0], numeros(pistaDe(it), it.acc[0]).concat(mezcla(conjuga(pistaDe(it), it.acc[0]))).concat(l ? igualaCaso(it.acc[0], pozoPista(l.track, pistaDe(it))) : []), it.acc, ["fill", "spot"]) })].filter(function(r){ return r.malas.length; });
    }
    if (it.k === "match" && it.pairs) {
      var ders = it.pairs.map(function(p){ return p[1]; });
      return mezcla(it.pairs).filter(function(p){ return cabe(p[1]); }).slice(0, 3).map(function(p){
        var otras = G.distractores(p[1], ders, nivel, []);
        return mk({ tipo: "uno", ask: plano(it.q || "") || "Corta la pareja", q: p[0] + " →", correcta: [p[1]], malas: conPozo(p[1], otras, [], ["match"]), why: it.why || ("<b>" + esc(p[0]) + "</b> → <b>" + esc(p[1]) + "</b>") });
      }).filter(function(r){ return r.malas.length; });
    }
    if (it.k === "sort" && it.cats && it.items) {
      var cortas = it.items.filter(function(x){ return cabe(x[0]); });
      var cats = it.cats.map(function(_, c){ return c; }).filter(function(c){ var n = cortas.filter(function(x){ return x[1] === c; }).length; return n >= 1 && n < cortas.length; });
      if (!cats.length || cortas.length < 3) return [];
      var c = cats[Math.floor(Math.random() * cats.length)];
      return [mk({ tipo: "varios", ask: (plano(it.q || "") ? plano(it.q) + " · " : "") + "Corta solo lo de esta categoría", q: plano(it.cats[c]),
        correcta: cortas.filter(function(x){ return x[1] === c; }).map(function(x){ return x[0]; }),
        malas: cortas.filter(function(x){ return x[1] !== c; }).map(function(x){ return x[0]; }),
        why: it.why || ("Van en «" + esc(plano(it.cats[c])) + "»: " + cortas.filter(function(x){ return x[1] === c; }).map(function(x){ return "<b>" + esc(x[0]) + "</b>"; }).join(", ")) })];
    }
    if (it.k === "order" && it.tokens && it.tokens.length >= 3 && it.tokens.length <= FICHAS && it.tokens.every(cabe)) {
      return [mk({ tipo: "orden", ask: "Corta en orden para armar la frase", q: plano(it.ask || "").replace(/^Ordena[^:]*:\s*/i, ""), correcta: it.tokens.slice(), malas: [],
        why: it.why || "" })];
    }
    if (it.k === "spot" && it.s && it.fix && cabe(it.fix)) {
      var mt = it.s.match(/\[([^\]]+)\]/); if (!mt || !cabe(mt[1])) return [];
      var frase = it.s.replace(/\[([^\]]+)\]/, "$1").replace(/ ([,.])/g, "$1");
      var palabras = it.s.replace(/\[[^\]]+\]/, " ").split(/\s+/).filter(function(w){ return /[\p{L}]{2,}/u.test(w) && cabe(w) && norm(w) !== norm(mt[1]); }).map(function(w){ return w.replace(/[,.;:!?]+$/, ""); });
      var vist = {}; palabras = palabras.filter(function(w){ var k = norm(w); if (vist[k]) return false; vist[k] = 1; return true; });
      if (palabras.length < 1) return [];
      return [mk({ tipo: "error", ask: "Corta la palabra incorrecta", q: frase, correcta: [mt[1]], malas: mezcla(palabras),
        fix: { correcta: [it.fix], malas: [mt[1]].concat(conPozo(it.fix, [], [mt[1]], ["spot", "fill"])).slice(0, 4) } })];
    }
    return [];   /* listen (dictado), accent y los demás no entran */
  };
  /* retos de un conjunto de lecciones (op: {max, fichas}, ver arriba) */
  G.retos = function(lecciones, nivel, op){
    return conOpciones(op, function(){
      var out = [];
      lecciones.forEach(function(l){
        var its = l.items || [], pozo = respuestas(its);
        its.forEach(function(it, i){ out.push.apply(out, retosDeItem(it, l.id + ":" + i, l, nivel, pozo)); });
      });
      return out;
    });
  };
  /* retos de un tema del vocabulario: suena la palabra y se corta la que sonó */
  /* voc: la palabra completa del vocabulario ({fr, es, ex, exes, g}) para los juegos que la necesiten */
  G.retosVocab = function(tema, nivel, op){
    return conOpciones(op, function(){
      var frs = tema.i.map(function(x){ return x.fr; });
      return tema.i.filter(function(x){ return cabe(x.fr); }).map(function(x){
        return { tipo: "uno", audio: x.fr, ask: "Escucha y corta la palabra que suena", q: "", correcta: [x.fr], malas: G.distractores(x.fr, frs, nivel, []).slice(0, 5),
          why: "<b>" + esc(x.fr) + "</b> = " + esc(x.es) + (x.ex ? "<br><i>" + esc(x.ex) + "</i>" : ""), hab: "vocab", key: null, lessonId: "", voc: x };
      }).filter(function(r){ return r.malas.length; });
    });
  };
  /* retos del carnet (frutas doradas): solo errores de ítems de lecciones de ese curso */
  G.retosCarnet = function(track, nivel, op){
    return conOpciones(op, function(){
      var out = [];
      Object.keys(S.carnet || {}).forEach(function(k){
        var x = ITEMS[k]; if (!x || (track && x.l.track !== track)) return;
        retosDeItem(x.it, k, x.l, nivel, respuestas(x.l.items || [])).forEach(function(r){ r.oro = true; out.push(r); });
      });
      return mezcla(out);
    });
  };

  /* vocabulario: el mismo archivo que usa la pestaña de vocabulario (plx38) */
  var cargaVoc = null;
  G.vocab = function(){
    if (window.__VOCAB) return Promise.resolve(window.__VOCAB);
    return cargaVoc || (cargaVoc = new Promise(function(res, rej){
      var s = document.createElement("script"); s.src = "vocab.js?v=651a2c37"; s.async = true;
      s.onload = function(){ res(window.__VOCAB || {}); }; s.onerror = function(){ cargaVoc = null; rej(new Error("vocab")); };
      document.head.appendChild(s);
    }));
  };

  /* ---------------- carnet ---------------- */
  G.alCarnet = function(key, t){
    if (!key || !ITEMS[key]) return false;
    var c = S.carnet[key];
    if (c) { c.s = 0; c.w++; c.at = Date.now(); return false; }
    S.carnet[key] = { t: t || ITEMS[key].it.t || "autre", s: 0, w: 1, at: Date.now() };
    return true;
  };
  G.carnetBien = function(key){
    var c = key && S.carnet[key]; if (!c) return;
    c.s++;
    if (c.s >= 2) { delete S.carnet[key]; (S.gone || (S.gone = {}))[key] = Date.now(); S.mastered = S.mastered || {}; S.mastered[c.t] = (S.mastered[c.t] || 0) + 1; }
  };

  /* ---------------- puntos y combo ---------------- */
  G.Puntos = function(){
    return {
      pts: 0, racha: 0, mejor: 0, aciertos: 0, fallos: 0,
      mult: function(){ return this.racha >= 10 ? 4 : this.racha >= 6 ? 3 : this.racha >= 3 ? 2 : 1; },
      /* rapidez: 1 = al instante, 0 = al final del tiempo de la oleada */
      acierto: function(rapidez, doble){
        this.racha++; this.aciertos++; this.mejor = Math.max(this.mejor, this.racha);
        var g = Math.round((100 + 50 * Math.max(0, Math.min(1, rapidez))) * this.mult() * (doble || 1));
        this.pts += g; return g;
      },
      extra: function(n){ this.pts += n; return n; },
      corta: function(){ this.racha = 0; },
      fallo: function(){ this.racha = 0; this.fallos++; },
      precision: function(){ var n = this.aciertos + this.fallos; return n ? Math.round(this.aciertos / n * 100) : 0; }
    };
  };

  /* ---------------- sonido (Web Audio generado) y vibración ---------------- */
  var AC = null;
  var ctxA = function(){
    if (!G.aj.sonido) return null;
    try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (e) { AC = null; }
    return AC;
  };
  G.despiertaAudio = function(){ ctxA(); };
  var tono = function(a, f, t0, dur, tipo, vol, f2){
    var o = a.createOscillator(), g = a.createGain();
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || .2, t0 + .01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + .02);
  };
  var ruido = function(a, t0, dur, desde, hasta, vol){
    var n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = b; f.type = "bandpass"; f.Q.value = 1.2; f.frequency.setValueAtTime(desde, t0); f.frequency.exponentialRampToValueAtTime(hasta, t0 + dur);
    g.gain.setValueAtTime(vol || .3, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t0);
  };
  G.sfx = function(nombre, x){
    var a = ctxA(); if (!a) return; var t = a.currentTime + .005;
    try {
      if (nombre === "corte") ruido(a, t, .14, 900, 5200, .22);
      if (nombre === "bien") { var b = 520 * Math.pow(1.06, Math.min(12, x || 0)); tono(a, b, t, .12, "triangle", .22); tono(a, b * 1.5, t + .07, .18, "triangle", .2); }
      if (nombre === "mal") { tono(a, 180, t, .28, "square", .12, 90); ruido(a, t, .2, 400, 200, .2); }
      if (nombre === "escapa") tono(a, 330, t, .3, "sine", .14, 160);
      if (nombre === "tic") tono(a, 660, t, .09, "sine", .16);
      if (nombre === "ya") { tono(a, 880, t, .25, "triangle", .22); tono(a, 1320, t + .05, .3, "sine", .12); }
      if (nombre === "frenesi") { tono(a, 300, t, .5, "sawtooth", .08, 1200); ruido(a, t, .5, 300, 3000, .15); }
      if (nombre === "paso") tono(a, 740 + 60 * (x || 0), t, .1, "triangle", .16);
      if (nombre === "fin") [523, 659, 784, 1047].forEach(function(f, i){ tono(a, f, t + i * .11, .22, "triangle", .18); });
      if (nombre === "estrella") tono(a, 1047 + 200 * (x || 0), t, .25, "sine", .18);
    } catch (e) {}
  };
  G.vibra = function(p){ try { if (G.aj.vibrar && navigator.vibrate) navigator.vibrate(p); } catch (e) {} };

  /* ---------------- recompensas, récord y fantasma ---------------- */
  /* S.arcade solo se crea al terminar la primera partida; leer no escribe nada en la cuenta */
  var A = function(){ if (!S.arcade || typeof S.arcade !== "object") S.arcade = { rec: {}, est: {} }; S.arcade.rec = S.arcade.rec || {}; S.arcade.est = S.arcade.est || {}; return S.arcade; };
  var L = function(){ var a = S.arcade && typeof S.arcade === "object" ? S.arcade : {}; return { rec: a.rec || {}, est: a.est || {} }; };
  G.claveRec = function(juego, alc){ return juego + "|" + alc.clave + "|" + alc.seg + (G.aj.sinTiempo ? "|st" : ""); };
  G.record = function(juego, alc){ return L().rec[G.claveRec(juego, alc)] || null; };
  /* estrellas por juego y unidad (las de Fruit Frenzy de la 1.23.0 se guardaron sin el juego) */
  G.estrellasUnidad = function(juego, track, unit){ var e = L().est; return Math.max(e[juego + "|" + track + "|" + unit] || 0, juego === "ff" ? e[track + "|" + unit] || 0 : 0); };
  G.estrellas = function(r, seg){ if (!r.aciertos) return 0; var p = r.precision; return p >= 80 && r.puntos >= seg * 35 ? 3 : p >= 80 ? 2 : 1; };
  /* XP parecida a la de una lección, sin superarla: 5 por acierto + 5 por estrella, máximo 100 */
  G.premiar = function(juego, alc, r){
    var a = A(), k = G.claveRec(juego, alc), antes = a.rec[k] || null, xp = Math.min(100, r.aciertos * 5 + r.estrellas * 5);
    if (xp) addXP(xp);
    try { var d = today(); d.sec = (d.sec || 0) + Math.round(r.seg); } catch (e) {}
    var nuevo = !antes || r.puntos > antes.best;
    if (nuevo && r.puntos > 0) a.rec[k] = { best: r.puntos, est: r.estrellas, acc: r.precision, at: Date.now(), traza: r.traza.slice(0, 200) };
    else if (antes && r.estrellas > (antes.est || 0)) antes.est = r.estrellas;
    if (alc.track && alc.unit) { var ku = juego + "|" + alc.track + "|" + alc.unit; a.est[ku] = Math.max(a.est[ku] || 0, r.estrellas); }
    try { save(true); } catch (e) {}
    try { if (typeof renderStats === "function") renderStats(); } catch (e) {}
    return { xp: xp, antes: antes, nuevo: nuevo && r.puntos > 0 };
  };

  /* ---------------- marco: capa a pantalla completa ---------------- */
  var capa = null, alCerrar = null;
  G.abrir = function(cerrar){
    if (!capa) {
      capa = document.createElement("div"); capa.id = "plxg"; capa.className = "plxg";
      capa.setAttribute("role", "dialog"); capa.setAttribute("aria-modal", "true"); capa.setAttribute("aria-label", "Arcade");
      document.body.appendChild(capa);
    }
    alCerrar = cerrar || null;
    /* La app marca con «inert» todo lo que no sea la capa de arriba (la lección abierta, un modal).
       Si el Arcade se abre desde el final de una lección, quedaría visible pero sin responder:
       mientras esté abierto se le quita el inert cada vez que la app se lo ponga. */
    if (!capa._vigila) {
      capa._vigila = new MutationObserver(function(){ if (!capa.hidden && capa.hasAttribute("inert")) capa.removeAttribute("inert"); });
      capa._vigila.observe(capa, { attributes: true, attributeFilter: ["inert"] });
    }
    capa.removeAttribute("inert");
    capa.hidden = false; capa.innerHTML = "";
    document.documentElement.classList.add("plxg-on");
    return capa;
  };
  G.cerrar = function(){
    if (!capa) return;
    var f = alCerrar; alCerrar = null;
    if (f) try { f(); } catch (e) {}
    capa.hidden = true; capa.innerHTML = "";
    document.documentElement.classList.remove("plxg-on");
    try { if (window.__syncInert) window.__syncInert(); } catch (e) {}
  };
  G.capa = function(){ return capa; };

  /* Manzana, el anfitrión: reacciona en una esquina */
  var MZ = { idle: "img/mz-juega.webp", bien: "img/mz-feliz.webp", mal: "img/mz-curioso.webp", frenesi: "img/mz-vamos.webp", hola: "img/mz-hola.webp", fin: "img/mz-feliz.webp", duerme: "img/mz-duerme.webp" };
  G.mzImg = function(e){ return MZ[e] || MZ.idle; };
  G.mz = function(el, estado, texto){
    if (!el) return; var img = el.querySelector("img"), bub = el.querySelector(".plxg-bub");
    if (img && img.getAttribute("src") !== G.mzImg(estado)) img.src = G.mzImg(estado);
    el.dataset.e = estado; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
    if (bub) { bub.textContent = texto || ""; bub.hidden = !texto; clearTimeout(el._t); if (texto) el._t = setTimeout(function(){ bub.hidden = true; if (el.dataset.e !== "frenesi") { el.dataset.e = "idle"; if (img) img.src = G.mzImg("idle"); } }, 1100); }
  };

  /* barra superior */
  G.hud = function(el, o){
    el.insertAdjacentHTML("beforeend",
      '<div class="plxg-hud' + (o.jefe && o.jefe.clase ? " " + esc(o.jefe.clase) : "") + '" style="--ac:' + o.color + '">' +
        '<button class="plxg-ib" data-plxg="pausa" aria-label="Pausa"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="4" width="3.4" height="12" rx="1"/><rect x="11.6" y="4" width="3.4" height="12" rx="1"/></svg></button>' +
        '<div class="plxg-vidas" aria-label="Vidas"></div>' +
        '<div class="plxg-tiempo" aria-label="Tiempo"><b>0:00</b></div>' +
        '<div class="plxg-pts"><b>0</b><small>puntos</small></div>' +
        '<div class="plxg-barra"><i></i></div>' +
        '<div class="plxg-sub"><span class="plxg-combo" hidden></span><span class="plxg-fan" hidden></span></div>' +
        (o.jefe ? o.jefe.html || '<div class="plxg-jefe">' + (o.jefe.img ? '<img src="' + esc(o.jefe.img) + '" alt="">' : "") + '<div><b>' + esc(o.jefe.nombre || "El jefe") + '</b><span class="plxg-jv"><i></i></span></div></div>' : "") +
      "</div>");
    var h = el.querySelector(".plxg-hud"), q = function(s){ return h.querySelector(s); }, ult = {};
    return {
      el: h,
      pinta: function(s){
        if (ult.v !== s.vidas) { ult.v = s.vidas; h.querySelectorAll(".plxg-vidas").forEach(function(v){ v.innerHTML = [0, 1, 2].map(function(i){ return '<i class="' + (i < s.vidas ? "on" : "") + '"></i>'; }).join(""); v.setAttribute("aria-label", s.vidas + " vidas"); }); }
        var sg = Math.ceil(Math.max(0, s.resta)), tt = s.sinTiempo ? "∞" : Math.floor(sg / 60) + ":" + String(sg % 60).padStart(2, "0");
        if (ult.t !== tt) { ult.t = tt; q(".plxg-tiempo b").textContent = tt; q(".plxg-tiempo").classList.toggle("poco", !s.sinTiempo && s.resta <= 10); }
        if (ult.p !== s.pts) { ult.p = s.pts; q(".plxg-pts b").textContent = s.pts.toLocaleString("es-CO"); }
        q(".plxg-barra i").style.transform = "scaleX(" + Math.max(0, Math.min(1, s.avance)).toFixed(3) + ")";
        var cb = s.mult > 1 ? "×" + s.mult + " · " + s.racha + " seguidos" : s.racha >= 1 ? s.racha + " seguido" + (s.racha > 1 ? "s" : "") : "";
        if (s.frenesi) cb = "FRENESÍ · puntos dobles";
        if (ult.c !== cb) { ult.c = cb; var c = q(".plxg-combo"); c.textContent = cb; c.hidden = !cb; c.classList.toggle("fr", !!s.frenesi); c.classList.toggle("hot", s.mult > 1); }
        if (s.jefe && ult.j !== s.jefe.vida) { ult.j = s.jefe.vida; var jb = q(".plxg-jv i"); if (jb) jb.style.transform = "scaleX(" + (s.jefe.vida / s.jefe.max).toFixed(3) + ")"; var jv = q(".plxg-jv"); if (jv) jv.setAttribute("aria-label", "Vida del jefe: " + s.jefe.vida + " de " + s.jefe.max); var jn = q(".plxg-jn"); if (jn) jn.textContent = s.jefe.vida + "/" + s.jefe.max; }
        var f = q(".plxg-fan");
        if (s.fantasma == null) f.hidden = true;
        else { var d = s.pts - s.fantasma, txt = "Fantasma " + (d >= 0 ? "+" : "−") + Math.abs(d).toLocaleString("es-CO"); if (ult.f !== txt) { ult.f = txt; f.hidden = false; f.textContent = txt; f.classList.toggle("gana", d >= 0); } }
      }
    };
  };

  /* cuenta regresiva 3-2-1 con Manzana */
  G.cuenta = function(el, listo){
    var mov = G.movReducido();
    el.insertAdjacentHTML("beforeend", '<div class="plxg-cuenta"><img src="' + G.mzImg("hola") + '" alt=""><b>3</b></div>');
    var c = el.querySelector(".plxg-cuenta"), b = c.querySelector("b"), n = 3;
    G.sfx("tic");
    var paso = function(){
      n--;
      if (n > 0) { b.textContent = n; if (!mov) { b.classList.remove("z"); void b.offsetWidth; b.classList.add("z"); } G.sfx("tic"); setTimeout(paso, 650); }
      else { b.textContent = "¡Ya!"; c.querySelector("img").src = G.mzImg("frenesi"); G.sfx("ya"); setTimeout(function(){ c.remove(); listo(); }, 450); }
    };
    setTimeout(paso, 650);
  };

  /* momento de aprendizaje: la corrección y la explicación, 1,5 a 4 s (tocar para seguir) */
  G.momento = function(el, o, listo){
    var largo = plano(o.why || "").length, ms = Math.min(4000, Math.max(1600, 1400 + largo * 22)), hecho = false;
    el.insertAdjacentHTML("beforeend",
      '<div class="plxg-mom" role="alert"><div class="plxg-momc ' + (o.clase || "") + '">' +
        (o.mal ? '<p class="m-mal"><span>' + esc(o.etMal || "Cortaste") + "</span><s>" + esc(o.mal) + "</s></p>" : "") +
        (o.titulo ? '<p class="m-tit">' + esc(o.titulo) + "</p>" : "") +
        '<p class="m-bien"><span>' + esc(o.etiqueta || "Correcta") + "</span><b>" + esc(o.bien) + "</b></p>" +
        (o.why ? '<div class="m-why">' + seguro(o.why) + "</div>" : "") +
        '<div class="m-bar"><i style="animation-duration:' + ms + 'ms"></i></div><small>Toca para seguir</small>' +
      "</div></div>");
    var m = el.querySelector(".plxg-mom:last-child");
    var fin = function(){ if (hecho) return; hecho = true; clearTimeout(t); m.remove(); listo(); };
    var t = setTimeout(fin, ms);
    m.addEventListener("pointerdown", function(e){ e.preventDefault(); fin(); });
    return { fin: fin };
  };

  /* pausa */
  G.pausa = function(el, seguir, salir){
    el.insertAdjacentHTML("beforeend", '<div class="plxg-pausa"><div class="plxg-pc"><h2>Pausa</h2><p>El tiempo está detenido.</p><button class="plxg-btn" data-plxg="seguir">Seguir</button><button class="plxg-btn line" data-plxg="salir">Salir de la partida</button></div></div>');
    var p = el.querySelector(".plxg-pausa");
    p.addEventListener("click", function(e){ var b = e.target.closest("[data-plxg]"); if (!b) return; p.remove(); (b.dataset.plxg === "seguir" ? seguir : salir)(); });
    p.querySelector("[data-plxg=seguir]").focus();
  };

  /* estrellas en SVG */
  var ESTRELLA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';
  G.estrellasHTML = function(n, clase){ return '<span class="plxg-est ' + (clase || "") + '" aria-label="' + n + ' de 3 estrellas">' + [0, 1, 2].map(function(i){ return '<i class="' + (i < n ? "on" : "") + '">' + ESTRELLA + "</i>"; }).join("") + "</span>"; };

  /* resultados */
  G.resultados = function(el, juego, alc, r, premio, acciones){
    var fan = r.jefe ? null : premio.antes, dif = fan ? r.puntos - fan.best : null;
    var linea = !fan ? "Primera partida en esta unidad: ahora tu récord es tu fantasma."
      : dif > 0 ? "Le ganaste a tu fantasma por " + dif.toLocaleString("es-CO") + " puntos. Nuevo récord."
      : dif === 0 ? "Empate exacto con tu fantasma."
      : "Te faltaron " + Math.abs(dif).toLocaleString("es-CO") + " puntos para ganarle a tu fantasma (" + fan.best.toLocaleString("es-CO") + ").";
    var errs = r.errores.map(function(x){
      return '<li><p class="e-q">' + esc(x.q || x.ask || "") + "</p>" + (x.mal ? '<p class="e-mal"><span>' + esc(x.etMal || "Cortaste") + "</span> <s>" + esc(x.mal) + "</s></p>" : "") +
        '<p class="e-bien"><span>' + esc(x.etiqueta || "Correcta") + "</span> <b>" + esc(x.bien) + "</b></p>" + (x.why ? '<div class="e-why">' + seguro(x.why) + "</div>" : "") + "</li>";
    }).join("");
    el.innerHTML =
      '<div class="plxg-res" style="--ac:' + juego.color + '"><div class="plxg-wrap">' +
        '<p class="plxg-k">' + esc(juego.nombre) + " · " + esc(alc.titulo) + "</p>" + (r.cabeza || "") +
        '<h1 class="plxg-h">' + (r.titulo ? esc(r.titulo) : r.jefe ? (r.jefe.vencido ? "¡Victoria!" : r.porVidas ? "El jefe ganó" : "Se acabó el tiempo") : r.porVidas ? "Sin vidas" : "Fin de la partida") + "</h1>" +
        (r.jefe ? '<p class="plxg-fanl ' + (r.jefe.vencido ? "gana" : "") + '">' + esc(r.jefe.vencido ? "Derrotaste a " + r.jefe.nombre + " con " + r.vidas + " vida" + (r.vidas === 1 ? "" : "s") + "." : r.jefe.nombre + " quedó con " + r.jefe.vida + " de " + r.jefe.max + " puntos de vida.") + "</p>" : "") +
        '<div class="plxg-big"><b>' + r.puntos.toLocaleString("es-CO") + "</b><span>puntos</span></div>" +
        G.estrellasHTML(r.estrellas, "grande") +
        (r.jefe ? "" : '<p class="plxg-fanl ' + (dif > 0 ? "gana" : "") + '">' + esc(linea) + "</p>") +
        '<div class="plxg-kv"><div><b>' + r.precision + '%</b><span>precisión</span></div><div><b>' + r.aciertos + "</b><span>aciertos</span></div>" +
          "<div><b>×" + r.mejorMult + " · " + r.mejor + "</b><span>mejor combo</span></div><div><b>+" + premio.xp + "</b><span>XP</span></div></div>" +
        '<p class="plxg-como">' + (r.pista ? esc(r.pista) : r.estrellas < 2 ? "2 estrellas: termina con 80 % de precisión." : r.estrellas < 3 ? "3 estrellas: 80 % de precisión y " + (alc.seg * 35).toLocaleString("es-CO") + " puntos." : "Tres estrellas en esta unidad.") + "</p>" +
        (errs ? '<h2 class="plxg-h2">Repaso de tus errores <small>' + r.errores.length + " · " + (r.alCarnet ? r.alCarnet + " nuevos en el carnet" : "ya están en el carnet") + '</small></h2><ol class="plxg-errs">' + errs + "</ol>"
              : r.aciertos ? '<p class="plxg-limpio">Ningún error en toda la partida.</p>' : "") +
        '<div class="plxg-acc"><button class="plxg-btn" data-plxg="otra">Otra vez</button>' + (acciones.cambiar ? '<button class="plxg-btn line" data-plxg="cambiar">Cambiar de unidad</button>' : "") + '<button class="plxg-btn line" data-plxg="salir">Salir</button></div>' +
      "</div></div>";
    el.scrollTop = 0;
    if (r.estrellas) [0, 1, 2].slice(0, r.estrellas).forEach(function(i){ setTimeout(function(){ G.sfx("estrella", i); }, 350 + i * 220); });
    el.querySelector(".plxg-acc").addEventListener("click", function(e){ var b = e.target.closest("[data-plxg]"); if (!b) return; var f = acciones[{ otra: "otra", cambiar: "cambiar", salir: "salir" }[b.dataset.plxg]]; if (f) f(); });
    var bt = el.querySelector("[data-plxg=otra]"); if (bt) bt.focus({ preventScroll: true });
  };

  /* ---------------- alcances: unidad, curso, lección o tema de vocabulario ---------------- */
  var etiquetaCurso = function(tr){ var t = TRACKS.find(function(x){ return x.id === tr; }); return t ? t.label : tr; };
  G.alc = {
    curso: etiquetaCurso,
    unidades: function(tr){ var vistas = {}, out = []; LESSONS.forEach(function(l){ if (l.track !== tr || vistas[l.unit]) return; vistas[l.unit] = 1; out.push(l.unit); }); return out; },
    unidad: function(tr, u){ return { clave: "u:" + tr + ":" + u, track: tr, unit: u, titulo: u, sub: etiquetaCurso(tr), seg: 90, lecciones: LESSONS.filter(function(l){ return l.track === tr && l.unit === u; }) }; },
    todo: function(tr){ return { clave: "c:" + tr, track: tr, titulo: "Todo el curso", sub: etiquetaCurso(tr), seg: 90, lecciones: LESSONS.filter(function(l){ return l.track === tr; }) }; },
    leccion: function(l){ return { clave: "l:" + l.id, track: l.track, titulo: l.title, sub: "Repaso de la lección · " + etiquetaCurso(l.track), seg: 60, lecciones: [l], repaso: true }; },
    vocab: function(tr, ti){ var t = ((window.__VOCAB || {})[tr] || { themes: [] }).themes[ti]; return t ? { clave: "v:" + tr + ":" + ti, track: tr, titulo: "Vocabulario · " + t.t, sub: etiquetaCurso(tr), seg: 90, tema: t } : null; }
  };
  /* Elisión en los bordes del hueco: «Je ___ propose» + «en» → «J'en propose», «que ___» + «il» → «qu'il»,
     «si ___» + «il» → «s'il», «ce ___» + «est» → «c'est». Nada ante h aspirada (le haut, le héros) ni ante
     onze / oui («que oui»). Ante una h que no está en ninguna lista, la frase no se arma (null): mejor un reto
     menos que enseñar «le hublot» o «l'hublot» sin saberlo. */
  var ELIDE = /(^|[^\p{L}\p{M}'’\-])(je|me|te|se|le|la|ne|de|que|ce|si|jusque|lorsque|puisque|quoique)(\s*)$/iu;
  var H_ASP = /^h(?:ach|aie|aill|ain|aï|alte|all(?!uc)|amac|ameau|amburger|amster|anche|andi|angar|ant|app|aras|arc|ardi|areng|argn|aricot|arn|arp|asard|ât|auss|aut|avr|enn|érisson|ernie|éron|éros$|être|eurt|ibou|ideu|iérarch|iss|ippie|it$|obby|och|ockey|old|ollan|omard|ongr|ont|oquet|ors$|ouss|oux|oul|ublot|uée|uer|uit|url|utt)/;
  var H_MUET = /^h(?:ab|allucin|aleine|ameçon|armoni|ebdo|éberg|ectare|élicopt|émisph|erb|érédit|érit|ermét|éroï|ésit|étéro|eur|exag|ier|ippo|irondel|ispan|isto|iver|omm|omo|omé|onnê|onneur|onor|ôpita|oraire|orizon|orloge|ormone|oroscope|orr|ortic|ospit|ostil|ôte|uile|uissier|uître|umain|umanit|umble|umeur|umid|umili|umour|umor|ybrid|ydr|ygièn|ymne|yper|ypno|ypoth|ypocri|ystér)/;
  var elide = function(w, sig){
    if (w === "si") return /^ils?$/.test(sig);
    if (w === "ce") return /^(est|était|étaient|eût|eut)$/.test(sig);
    if (sig === "y") return !/^(le|la)$/.test(w);   /* «j'y vais», «d'y aller», «qu'y a-t-il» */
    if (/^(onze|onzièmes?|oui|ouistitis?)$/.test(sig)) return false;
    if (/^[aeiouàâäéèêëîïôöûüùœæ]/.test(sig)) return true;
    if (sig.charAt(0) === "h") return H_ASP.test(sig) ? false : H_MUET.test(sig) ? true : null;
    return false;
  };
  var une = function(izq, der){
    var a = izq.match(ELIDE), b = der.match(/^(\s*)([\p{L}\p{M}]+)/u);
    if (!a || !b || !(a[3] + b[1])) return [izq, der];
    var w = a[2], ok = elide(w.toLowerCase(), b[2].toLowerCase());
    if (ok === null) return null;
    if (!ok) return [izq, der];
    var nueva = w.toLowerCase() === "si" ? w.charAt(0) + "'" : w.slice(0, -1) + "'";
    return [izq.slice(0, izq.length - a[3].length - w.length) + nueva, der.slice(b[1].length)];
  };
  /* «Vous ___ quel âge ? (avoir)» + «avez» → «Vous avez quel âge ?» (sin la pista del final).
     OJO: úsalo con la respuesta CORRECTA. Con una opción incorrecta la elisión puede borrar justo el error que el
     ejercicio enseña («à ___ université» + «le» → «à l'université», igual que la correcta). Si un juego necesita
     mostrar una frase con una opción mala, que la arme sin elisión y compruebe que sigue siendo distinta. */
  G.completa = function(q, palabra){
    var t = plano(q || "").replace(/\s*\([^()]{1,40}\)\s*\.?\s*$/, function(m){ return /\.\s*$/.test(m) ? "." : ""; });
    var m = t.match(/_{2,}/); if (!m) return "";
    var pre = t.slice(0, m.index), w = String(palabra == null ? "" : palabra), post = t.slice(m.index + m[0].length);
    var L = une(pre, w); if (!L) return "";
    var R = une(L[0] + L[1], post); if (!R) return "";
    var f = (R[0] + R[1]).replace(/\s+([,.])/g, "$1").replace(/'\s+/g, "'").replace(/\s+-(?=\p{L})/gu, "-").trim();
    return /^_{2,}/.test(t) ? f.charAt(0).toUpperCase() + f.slice(1) : f;
  };
  /* retos por defecto de un alcance (los de Fruit Frenzy); un juego puede traer los suyos */
  G.retosDe = function(alc, op){ var n = G.nivel(alc.track); return alc.tema ? G.retosVocab(alc.tema, n, op) : G.retos(alc.lecciones, n, op); };

  /* ---------------- registro de juegos ----------------
     juego = { id, nombre, verbo, familia, color, orden,
               retos(alc) → [reto]          (si falta: G.retosDe)
               apto(reto) → bool            (qué retos sirven a este juego)
               vocab: bool                  (acepta temas de vocabulario)
               reglas(alc) → [texto]        (portada)
               deco() → html                (dibujo de la portada y de la tarjeta)
               opciones(alc) → opc          (para G.sesion: seg, vidas, jefe…)
               montar(zona, s) → ctrl       (el motor; ver G.sesion) } */
  G.registrar = function(j){
    j.orden = j.orden == null ? 50 : j.orden; j.familia = j.familia || "Arcade"; if (j.vocab == null) j.vocab = true;
    G.juegos[j.id] = j; return j;
  };
  /* oculto(): un juego puede esconderse mientras no tenga con qué jugarse (Mystery sin motores suficientes) */
  G.listaJuegos = function(){ return Object.keys(G.juegos).map(function(k){ return G.juegos[k]; }).filter(function(j){ return j.montar && !(j.oculto && j.oculto()); }).sort(function(a, b){ return a.orden - b.orden; }); };
  G.retosJuego = function(j, alc){ var r = (j.retos ? j.retos(alc) : G.retosDe(alc)) || []; return j.apto ? r.filter(j.apto) : r; };
  /* retos para CONTAR (lista y portada): se calculan una vez por juego y alcance y se comparten, así Boss Battle y
     Mystery reusan lo que ya contaron los otros juegos. Para jugar se piden de nuevo (G.retosJuego), con su azar.
     juego.cuenta(alc) → número: atajo opcional de un juego para contarse sin armar sus retos. */
  var contados = {}, cuentas = {};
  G.retosCuenta = function(j, alc){ var k = j.id + "|" + alc.clave; return contados[k] || (contados[k] = G.retosJuego(j, alc)); };
  G.nRetos = function(j, alc){ var k = j.id + "|" + alc.clave; return cuentas[k] != null ? cuentas[k] : (cuentas[k] = j.cuenta ? j.cuenta(alc) : G.retosCuenta(j, alc).length); };
  G.nRetosListo = function(j, alc){ return cuentas[j.id + "|" + alc.clave] != null; };
  G.MIN_RETOS = 4;

  /* ---------------- sesión: el marco de una partida ----------------
     Todos los juegos corren dentro de una sesión. La sesión pone la barra de arriba, la instrucción,
     a Manzana, la cuenta 3-2-1, el reloj, las vidas, los puntos, la pausa, los errores y los resultados,
     y elige el siguiente reto (con los dorados del carnet). El motor de cada juego solo presenta un reto:

       juego.montar(zona, s) → ctrl
         ctrl.jugar(reto)            presenta el reto
         ctrl.tick(dt, d, estado)    cada cuadro (opcional). dt: segundos reales jugando (0 si no se juega);
                                     d: segundos «de física» (la mitad en frenesí y en el momento de aprendizaje)
         ctrl.tecla(e)               teclado mientras se juega (opcional)
         ctrl.pausa() / ctrl.sigue() (opcional)
         ctrl.destruye()
         ctrl.depura()               (opcional, para las pruebas)
       Cuando el reto termina, el motor llama s.listo(). Mientras tanto:
         s.acierto(reto, {rapidez 0..1, x, y, final, dano}) → {g, mult}
               puntos (100 + 50·rapidez, ×combo, ×2 dorado, ×2 frenesí), sonido, Manzana, director, frenesí.
               final:false si el reto sigue (una pieza de varias): el carnet solo cuenta el acierto final.
         s.extra(n, x, y)                   puntos sueltos que no tocan el combo
         s.anula([g…])                      deshace aciertos de un mismo gesto (un trazo que también cortó una mala)
         s.fallo(reto, {mal, etiqueta, bien, why})    → Promise: quita una vida, va al carnet, el reto se repite
                                            más tarde y se muestra la corrección. Si no quedan vidas, no se resuelve.
         s.escapa(reto, {titulo, etiqueta, bien, why}) → Promise: rompe el combo y muestra la respuesta
               (s.fallo y s.escapa aceptan además {q, key, hab, repetir:false}; ver «repetir» abajo)
         s.penaliza(x, y)                   toque al azar: rompe el combo, sin quitar vida
         s.banner(html, {oro}) · s.techo() (px libres desde arriba) · s.pop(x, y, texto, color) · s.mz(estado, texto)
         s.t() (tiempo de juego) · s.estado() · s.frenesi() · s.dir (director) · s.nivel · s.mov (menos movimiento)
         s.el (la capa) · s.zona (el área del motor) · s.reto (el reto actual) */
  /* opc: { seg, vidas, retos (lista fija), ordenFijo (no mezclar), oro:false, jefe:{vida, nombre, img},
            estrellas(r) → 0..3, pista(r) → texto bajo las estrellas } */
  G.sesion = function(el, alc, juego, acciones, opc){
    opc = opc || {};
    var nivel = G.nivel(alc.track), dir = G.director(alc.track), pts = G.Puntos(), mov = G.movReducido();
    var apto = juego.apto || function(){ return true; };
    var base = (opc.retos || G.retosJuego(juego, alc)).slice(), cola = opc.ordenFijo ? base.slice() : mezcla(base);
    var oros = alc.tema || juego.oro === false || opc.oro === false ? [] : (juego.retosCarnet ? juego.retosCarnet(alc.track, nivel) : G.retosCarnet(alc.track, nivel)).filter(apto).slice(0, 12);
    var jefe = opc.jefe ? { max: opc.jefe.vida, vida: opc.jefe.vida, nombre: opc.jefe.nombre, img: opc.jefe.img, html: opc.jefe.html, clase: opc.jefe.clase } : null;
    var seg = opc.seg || alc.seg || 90, sinT = !!G.aj.sinTiempo && !jefe, META = alc.repaso ? 10 : 15;
    var fan = jefe ? null : G.record(juego.id, alc), traza = [], errores = [], alCarnet = 0;
    var vidas = opc.vidas || 3, tJ = 0, resueltos = 0, frenesi = 0, olas = 0, ultimoOro = false, espera = .25;
    var reto = null, estado = "cuenta", raf = 0, ult = 0, ctrl = null, vencido = false;

    el.innerHTML = '<div class="plxg-zona"></div><div class="plxg-ban" aria-live="polite" hidden></div><div class="plxg-pops" aria-hidden="true"></div>' +
      '<div class="plxg-mz"><img src="' + G.mzImg("idle") + '" alt=""><span class="plxg-bub" hidden></span></div>';
    el.classList.add("plxg-juego");
    var zona = el.querySelector(".plxg-zona"), ban = el.querySelector(".plxg-ban"), popsEl = el.querySelector(".plxg-pops"), mzEl = el.querySelector(".plxg-mz");
    var hud = G.hud(el, { color: juego.color, jefe: jefe });
    /* la instrucción va justo debajo de la barra (que es más alta cuando hay jefe) */
    var colocaBan = function(){ ban.style.top = Math.round(hud.el.getBoundingClientRect().bottom - el.getBoundingClientRect().top + 6) + "px"; };
    colocaBan(); window.addEventListener("resize", colocaBan);

    var s = { el: el, zona: zona, alc: alc, juego: juego, nivel: nivel, dir: dir, pts: pts, mov: mov, aj: G.aj, reto: null };
    s.t = function(){ return tJ; };
    s.estado = function(){ return estado; };
    s.frenesi = function(){ return frenesi > 0; };
    s.mz = function(e, t){ G.mz(mzEl, e, t); };
    s.banner = function(html, o){
      o = o || {};
      ban.hidden = !html;
      ban.innerHTML = html ? (o.oro ? '<span class="plxg-oro">Del carnet · vale el doble</span>' : "") + html : "";
      ban.classList.toggle("oro", !!o.oro);
    };
    s.techo = function(){ var r = el.getBoundingClientRect(), b = ban.getBoundingClientRect(), h = hud.el.getBoundingClientRect(); return Math.round((ban.hidden || !b.height ? h.bottom : b.bottom) - r.top); };
    s.pop = function(x, y, t, c){
      if (x == null) return;
      var p = document.createElement("span"); p.className = "plxg-pop"; p.textContent = t; p.style.left = x + "px"; p.style.top = y + "px"; if (c) p.style.color = c;
      popsEl.appendChild(p); setTimeout(function(){ p.remove(); }, 950);
    };
    var anota = function(r, mal, o){
      var q = o.q != null ? o.q : r.audio && !r.q ? "Sonó: " + r.audio : r.q;
      var e = { q: q, ask: r.ask, mal: mal, etMal: o.etMal || juego.etMal, etiqueta: o.etiqueta, bien: o.bien, why: o.why == null ? r.why : o.why };
      if (!errores.some(function(x){ return x.q === e.q && x.bien === e.bien; })) errores.push(e);
    };
    var repetir = function(r){ var c = Object.assign({}, r); cola.splice(Math.min(3, cola.length), 0, c); };
    /* o.key / o.hab: qué ejercicio va al carnet (en un tablero con varias parejas, el de la pareja);
       o.repetir:false si el motor no quiere que el reto vuelva a salir */
    var momento = function(o){
      return new Promise(function(res){
        estado = "momento";
        G.momento(el, o, function(){ if (estado === "fin") return; estado = "juega"; ult = 0; res(); });
      });
    };
    var empiezaFrenesi = function(){ frenesi = 5; el.classList.add("plxg-fr"); G.sfx("frenesi"); G.vibra([20, 30, 20]); s.mz("frenesi", "¡Frenesí!"); };
    s.acierto = function(r, o){
      o = o || {};
      if (estado === "fin") return { g: 0, mult: 1 };
      var doble = (r && r.oro ? 2 : 1) * (frenesi > 0 ? 2 : 1), g = pts.acierto(o.rapidez == null ? .5 : o.rapidez, doble), m = pts.mult();
      s.pop(o.x, o.y, "+" + g + (m > 1 ? "  ×" + m : ""), r && r.oro ? "#FFE066" : "#FFD200");
      G.sfx("bien", pts.racha); G.vibra(12); dir.acierto();
      if (r && r.oro && o.final !== false) G.carnetBien(r.key);
      var dn = o.dano != null ? o.dano : 1;   /* dano:0 = acierto parcial que no le quita vida al jefe */
      if (jefe && dn) { jefe.vida = Math.max(0, jefe.vida - dn); if (!jefe.vida) vencido = true; el.classList.remove("plxg-golpe"); void el.offsetWidth; el.classList.add("plxg-golpe"); }
      if (pts.racha % 10 === 0) empiezaFrenesi();
      else if (pts.racha === 3 || pts.racha === 6) s.mz("bien", pts.racha === 3 ? "¡Combo ×2!" : "¡Combo ×3!");
      else if (Math.random() < .25) s.mz("bien", ["¡Bien!", "Parfait !", "Bravo !", "¡Eso!"][Math.floor(Math.random() * 4)]);
      return { g: g, mult: m };
    };
    /* un toque al azar: rompe el combo y el director lo cuenta como error, pero no quita vida */
    s.penaliza = function(x, y){ if (estado === "fin") return; pts.corta(); dir.error(); G.sfx("escapa"); G.vibra(30); s.pop(x, y, "✕", "#FF6B78"); };
    s.extra = function(n, x, y){ if (estado === "fin") return 0; pts.extra(n); s.pop(x, y, "+" + n, "#93C5FD"); return n; };
    s.anula = function(gs){ (gs || []).forEach(function(g){ pts.pts -= g; pts.aciertos--; }); };
    s.fallo = function(r, o){
      o = o || {};
      if (estado === "fin") return new Promise(function(){});
      pts.fallo(); vidas--; dir.error(); G.sfx("mal"); G.vibra([40, 40, 70]); s.mz("mal", vidas ? "Casi…" : "¡Ay!");
      if (!mov) { el.classList.remove("plxg-sh"); void el.offsetWidth; el.classList.add("plxg-sh"); }
      anota(r, o.mal, o);
      var key = o.key !== undefined ? o.key : r.key;
      if (key && G.alCarnet(key, o.hab || r.hab)) alCarnet++;
      if (o.repetir !== false) repetir(r);
      return momento({ mal: o.mal, etMal: o.etMal || juego.etMal, etiqueta: o.etiqueta, bien: o.bien, why: o.why == null ? r.why : o.why }).then(function(){
        if (vidas <= 0) { termina(true); return new Promise(function(){}); }
      });
    };
    s.escapa = function(r, o){
      o = o || {};
      if (estado === "fin") return new Promise(function(){});
      pts.corta(); pts.fallos++; dir.error(); G.sfx("escapa");
      anota(r, null, o); if (o.repetir !== false) repetir(r);
      return momento({ titulo: o.titulo || "Se te escapó", etiqueta: o.etiqueta, bien: o.bien, why: o.why == null ? r.why : o.why, clase: "escapa" });
    };
    s.listo = function(){
      if (estado === "fin" || !reto) return;
      reto = null; s.reto = null; resueltos++; espera = .3;
      if (vencido) termina(false);
    };
    var siguiente = function(){
      olas++;
      var r = null;
      if (oros.length && !ultimoOro && olas > 2 && Math.random() < .2) { ultimoOro = true; r = oros.shift(); }
      else { ultimoOro = false; if (!cola.length) cola = mezcla(base); r = cola.shift(); }
      reto = r; s.reto = r;
      if (r) ctrl.jugar(r);
    };

    /* ---- bucle ---- */
    var bucle = function(ts){
      raf = requestAnimationFrame(bucle);
      var dt = Math.min(.05, ult ? (ts - ult) / 1000 : 0); ult = ts;
      if (estado === "juega") {
        tJ += dt;
        var k = Math.floor(tJ); while (traza.length <= k) traza.push(pts.pts);
        if (frenesi > 0) { frenesi -= dt; if (frenesi <= 0) { frenesi = 0; el.classList.remove("plxg-fr"); s.mz("idle"); } }
        if (!reto) { espera -= dt; if (espera <= 0) siguiente(); }
      }
      var fis = estado === "juega" ? dt * (frenesi > 0 ? .5 : 1) : estado === "momento" ? dt * .5 : 0;
      if (ctrl && ctrl.tick) ctrl.tick(estado === "juega" ? dt : 0, fis, estado);
      if (estado === "juega") {
        if (!sinT && tJ >= seg) termina(false);
        else if (sinT && resueltos >= META && !reto) termina(false);
      }
      if (estado === "fin") return;
      var sg = Math.min(traza.length - 1, Math.floor(tJ)), fv = fan && fan.traza && fan.traza.length ? fan.traza[Math.min(fan.traza.length - 1, Math.max(0, sg))] : null;
      hud.pinta({ vidas: vidas, resta: seg - tJ, sinTiempo: sinT, pts: pts.pts, avance: sinT ? resueltos / META : tJ / seg, mult: pts.mult(), racha: pts.racha,
        frenesi: frenesi > 0, fantasma: sinT ? null : fv, jefe: jefe });
    };

    /* ---- pausa, teclado y pestaña oculta ---- */
    var pausar = function(){
      if (estado !== "juega") return;
      estado = "pausa"; if (ctrl && ctrl.pausa) ctrl.pausa();
      G.pausa(el, function(){ ult = 0; estado = "juega"; if (ctrl && ctrl.sigue) ctrl.sigue(); }, function(){ destruye(); try { save(true); } catch (x) {} acciones.salir(); });
    };
    var tecla = function(e){
      var campo = /INPUT|TEXTAREA/.test((e.target && e.target.tagName) || "");
      if (e.key === "Escape" || ((e.key === "p" || e.key === "P") && !campo)) { if (estado === "juega") { e.preventDefault(); pausar(); } return; }
      if (estado === "juega" && ctrl && ctrl.tecla) ctrl.tecla(e);
    };
    var oculta = function(){ if (document.hidden) pausar(); };
    var clic = function(e){ var b = e.target.closest && e.target.closest("[data-plxg=pausa]"); if (b) pausar(); };
    window.addEventListener("keydown", tecla); document.addEventListener("visibilitychange", oculta); el.addEventListener("click", clic);

    var termina = function(porVidas){
      if (estado === "fin") return;
      estado = "fin"; G.sfx("fin"); traza.push(pts.pts);
      var r = { puntos: pts.pts, aciertos: pts.aciertos, fallos: pts.fallos, precision: pts.precision(), mejor: pts.mejor, porVidas: porVidas,
        seg: tJ, traza: traza, errores: errores, alCarnet: alCarnet, vidas: Math.max(0, vidas),
        jefe: jefe ? { vencido: vencido, nombre: jefe.nombre, vida: jefe.vida, max: jefe.max } : null };
      r.mejorMult = r.mejor >= 10 ? 4 : r.mejor >= 6 ? 3 : r.mejor >= 3 ? 2 : 1;
      r.estrellas = opc.estrellas ? opc.estrellas(r) : G.estrellas(r, seg);
      r.pista = opc.pista ? opc.pista(r) : "";
      r.titulo = opc.titulo ? opc.titulo(r) : ""; r.cabeza = opc.cabeza ? opc.cabeza(r) : "";   /* ganchos opcionales de los resultados */
      var premio = G.premiar(juego.id, alc, r);
      s.mz("fin", porVidas ? "¡Otra vez!" : vencido ? "¡Victoria!" : "¡Terminó!");
      setTimeout(function(){ destruye(); G.resultados(el, juego, alc, r, premio, acciones); }, porVidas ? 500 : 900);
    };
    var destruye = function(){
      cancelAnimationFrame(raf); raf = 0; estado = "fin";
      window.removeEventListener("keydown", tecla); document.removeEventListener("visibilitychange", oculta); el.removeEventListener("click", clic); window.removeEventListener("resize", colocaBan);
      if (ctrl) { var c = ctrl; ctrl = null; try { c.destruye(); } catch (x) {} }
      el.classList.remove("plxg-juego", "plxg-fr", "plxg-sh", "plxg-golpe"); el.innerHTML = "";
      if (G.sesionActual === s) G.sesionActual = null;
    };
    s.depura = function(){ return Object.assign({ juego: juego.id, estado: estado, vidas: vidas, pts: pts.pts, racha: pts.racha, aciertos: pts.aciertos, fallos: pts.fallos, tJ: tJ, techo: s.techo(),
      reto: reto && { tipo: reto.tipo, q: reto.q, oro: !!reto.oro, correcta: reto.correcta }, jefe: jefe && { vida: jefe.vida, max: jefe.max } }, ctrl && ctrl.depura ? ctrl.depura() : {}); };

    ctrl = juego.montar(zona, s);
    G.sesionActual = s;
    raf = requestAnimationFrame(bucle);
    G.cuenta(el, function(){ if (estado !== "cuenta") return; estado = "juega"; ult = 0; });
    return { destruye: destruye, s: s };
  };

  /* ---------------- estilos comunes del arcade ---------------- */
  var st = document.createElement("style"); st.id = "plx45";
  st.textContent = `
  html.plxg-on,html.plxg-on body{overflow:hidden!important;overscroll-behavior:none}
  .plxg{position:fixed;inset:0;z-index:2147483000;color:#EEF3FF;background:#06173F;
    background:radial-gradient(120% 80% at 50% 0%,#12388F 0%,#0B2D74 38%,#081F55 70%,#06173F 100%);
    font:500 15px/1.45 Inter,"Figtree",system-ui,sans-serif;-webkit-tap-highlight-color:transparent;overflow:hidden;
    padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}
  .plxg[hidden]{display:none}
  .plxg *{box-sizing:border-box}
  :where(.plxg) button{font:inherit;color:inherit}
  .plxg .plxg-scroll{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}
  .plxg-wrap{max-width:560px;margin:0 auto;padding:20px 16px 32px}
  .plxg-k{margin:0 0 6px;font:700 11px/1.3 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#93C5FD}
  .plxg-h{margin:0;font:800 clamp(30px,9vw,44px)/1 Poppins,system-ui,sans-serif;letter-spacing:-.02em;text-transform:uppercase;color:#fff}
  .plxg-h2{margin:26px 0 10px;font:700 17px/1.2 Poppins,system-ui,sans-serif;color:#fff;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
  .plxg-h2 small{font:500 12px Inter,system-ui,sans-serif;color:#A6B6E0}
  .plxg-btn{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:0 22px;border-radius:14px;
    background:#FFD200;color:#081F55!important;font:800 16px/1 Poppins,system-ui,sans-serif;letter-spacing:.02em;text-transform:uppercase;cursor:pointer;
    box-shadow:0 6px 0 #C9A400,0 14px 24px -10px rgba(0,0,0,.6);transition:transform .08s,box-shadow .08s}
  .plxg-btn:active{transform:translateY(4px);box-shadow:0 2px 0 #C9A400}
  .plxg-btn.line{background:transparent;color:#EEF3FF!important;box-shadow:inset 0 0 0 2px #3A5CA8;text-transform:none;font-weight:700}
  .plxg-btn.line:active{transform:none;background:rgba(255,255,255,.06)}
  .plxg-btn:focus-visible,.plxg-ib:focus-visible{outline:3px solid #93C5FD;outline-offset:3px}
  .plxg-btn[disabled]{opacity:.45;cursor:default}

  /* barra superior */
  .plxg-hud{position:absolute;left:0;right:0;top:env(safe-area-inset-top);z-index:5;display:grid;grid-template-columns:auto auto 1fr auto;align-items:center;gap:10px;padding:10px 12px 0;pointer-events:none}
  .plxg-hud>*{pointer-events:auto}
  .plxg-ib{all:unset;pointer-events:auto;cursor:pointer;width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}
  .plxg-ib svg{width:18px;height:18px;fill:#fff}
  .plxg-vidas{display:flex;gap:4px}
  .plxg-vidas i{width:20px;height:18px;background:#E5484D;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 22'%3E%3Cpath d='M12 21.3 10.5 20C5.1 15.1 1.6 12 1.6 8.1 1.6 4.9 4.1 2.4 7.3 2.4c1.8 0 3.5.8 4.7 2.2 1.2-1.4 2.9-2.2 4.7-2.2 3.2 0 5.7 2.5 5.7 5.7 0 3.9-3.5 7-8.9 11.9z'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 22'%3E%3Cpath d='M12 21.3 10.5 20C5.1 15.1 1.6 12 1.6 8.1 1.6 4.9 4.1 2.4 7.3 2.4c1.8 0 3.5.8 4.7 2.2 1.2-1.4 2.9-2.2 4.7-2.2 3.2 0 5.7 2.5 5.7 5.7 0 3.9-3.5 7-8.9 11.9z'/%3E%3C/svg%3E") center/contain no-repeat}
  .plxg-vidas i:not(.on){background:rgba(255,255,255,.2)}
  .plxg-tiempo{justify-self:center;font:800 20px/1 Poppins,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#fff;padding:7px 12px;border-radius:10px;background:rgba(0,0,0,.22)}
  .plxg-tiempo.poco b{color:#FFD200}
  .plxg-pts{text-align:right;line-height:1}
  .plxg-pts b{display:block;font:800 22px/1 Poppins,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#FFD200}
  .plxg-pts small{font:600 10px/1.4 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#A6B6E0}
  .plxg-barra{grid-column:1/-1;height:3px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden}
  .plxg-barra i{display:block;height:100%;background:var(--ac,#FFD200);transform-origin:left;transform:scaleX(0)}
  .plxg-sub{grid-column:1/-1;display:flex;justify-content:space-between;gap:8px;min-height:24px}
  .plxg-combo,.plxg-fan{font:700 12px/1 Inter,system-ui,sans-serif;padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.1);color:#C9D6F5}
  .plxg-combo.hot{background:#FFD200;color:#081F55}
  .plxg-combo.fr{background:#FF8A3D;color:#1a0b00}
  .plxg-fan{margin-left:auto}
  .plxg-fan.gana{color:#6BE58E}

  /* Manzana */
  .plxg-mz{position:absolute;left:10px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:4;width:64px;height:64px;pointer-events:none}
  .plxg-mz img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 6px 10px rgba(0,0,0,.45))}
  .plxg-mz.pop img{animation:plxgPop .45s cubic-bezier(.3,1.6,.5,1)}
  .plxg-mz[data-e=mal].pop img{animation:plxgNo .4s}
  .plxg-bub{position:absolute;left:58px;bottom:44px;white-space:nowrap;background:#fff;color:#0B2D74;font:800 13px/1 Poppins,system-ui,sans-serif;padding:7px 10px;border-radius:12px 12px 12px 3px;box-shadow:0 8px 16px -8px rgba(0,0,0,.6)}
  @keyframes plxgPop{0%{transform:scale(.8)}60%{transform:scale(1.12)}100%{transform:scale(1)}}
  @keyframes plxgNo{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}

  /* cuenta regresiva */
  .plxg-cuenta{position:absolute;inset:0;z-index:8;display:grid;place-items:center;align-content:center;gap:4px;background:rgba(6,23,63,.55)}
  .plxg-cuenta img{width:120px;height:120px;object-fit:contain}
  .plxg-cuenta b{font:800 88px/1 Poppins,system-ui,sans-serif;color:#FFD200;text-shadow:0 6px 0 #081F55}
  .plxg-cuenta b.z{animation:plxgPop .5s cubic-bezier(.3,1.6,.5,1)}

  /* momento de aprendizaje */
  .plxg-mom{position:absolute;inset:0;z-index:9;display:grid;place-items:center;padding:16px;background:rgba(4,14,40,.62)}
  .plxg-momc{width:min(440px,100%);background:#fff;color:#0B2D74;border-radius:20px;padding:18px 18px 12px;box-shadow:0 24px 50px -18px rgba(0,0,0,.8);border-top:6px solid #E5484D;cursor:pointer}
  .plxg-momc.escapa{border-top-color:#FFD200}
  .plxg-momc p{margin:0 0 8px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
  .plxg-momc p>span{font:700 11px/1 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#4B5E8C;min-width:74px}
  .plxg-momc .m-mal s{font:700 19px/1.25 Poppins,system-ui,sans-serif;color:#B42330;text-decoration-thickness:2px}
  .plxg-momc .m-bien b{font:800 21px/1.25 Poppins,system-ui,sans-serif;color:#15803D}
  .plxg-momc .m-tit{font:800 17px/1.3 Poppins,system-ui,sans-serif;color:#0B2D74}
  .m-why{font:500 14px/1.5 Inter,system-ui,sans-serif;color:#1F2F57;margin:4px 0 10px}
  .m-why b{font-weight:700;color:#0B2D74}
  .m-bar{height:4px;border-radius:4px;background:#E3EAF8;overflow:hidden}
  .m-bar i{display:block;height:100%;background:#0B2D74;transform-origin:left;animation:plxgBar linear forwards}
  .plxg-momc small{display:block;text-align:center;margin-top:8px;font:600 11px Inter,system-ui,sans-serif;color:#4B5E8C}
  @keyframes plxgBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}

  /* pausa */
  .plxg-pausa{position:absolute;inset:0;z-index:10;display:grid;place-items:center;padding:16px;background:rgba(4,14,40,.8)}
  .plxg-pc{width:min(360px,100%);display:grid;gap:12px;text-align:center}
  .plxg-pc h2{margin:0;font:800 40px/1 Poppins,system-ui,sans-serif;text-transform:uppercase;color:#fff}
  .plxg-pc p{margin:0 0 8px;color:#A6B6E0}

  /* estrellas */
  .plxg-est{display:inline-flex;gap:4px}
  .plxg-est i{width:16px;height:16px;display:block}
  .plxg-est svg{width:100%;height:100%;fill:rgba(255,255,255,.18)}
  .plxg-est i.on svg{fill:#FFD200}
  .plxg-est.grande{gap:10px;margin:14px 0 4px}
  .plxg-est.grande i{width:44px;height:44px}
  .plxg-est.grande i.on{animation:plxgPop .5s cubic-bezier(.3,1.6,.5,1) both}
  .plxg-est.grande i:nth-child(2){animation-delay:.22s}.plxg-est.grande i:nth-child(3){animation-delay:.44s}

  /* resultados */
  .plxg-res{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}
  .plxg-big{margin-top:18px;display:flex;align-items:baseline;gap:10px}
  .plxg-big b{font:800 64px/1 Poppins,system-ui,sans-serif;color:#FFD200;font-variant-numeric:tabular-nums;letter-spacing:-.03em}
  .plxg-big span{font:700 13px Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#A6B6E0}
  .plxg-fanl{margin:8px 0 0;color:#C9D6F5}
  .plxg-fanl.gana{color:#6BE58E;font-weight:700}
  .plxg-kv{display:grid;grid-template-columns:repeat(4,1fr);margin:20px 0 0;border-top:1px solid #2A4A8E;border-bottom:1px solid #2A4A8E}
  .plxg-kv>div{padding:12px 4px;display:grid;gap:2px}
  .plxg-kv>div+div{border-left:1px solid #2A4A8E;padding-left:10px}
  .plxg-kv b{font:800 20px/1.1 Poppins,system-ui,sans-serif;color:#fff;white-space:nowrap}
  .plxg-kv span{font:600 10.5px/1.3 Inter,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#A6B6E0}
  .plxg-como{margin:12px 0 0;font-size:13px;color:#A6B6E0}
  .plxg-limpio{margin:22px 0 0;font:700 16px Poppins,system-ui,sans-serif;color:#6BE58E}
  .plxg-errs{list-style:none;margin:0;padding:0;display:grid;gap:10px}
  .plxg-errs li{background:#fff;color:#0B2D74;border-radius:16px;padding:14px;border-left:5px solid #E5484D}
  .plxg-errs p{margin:0 0 6px}
  .plxg-errs .e-q{font:600 14px/1.4 Inter,system-ui,sans-serif;color:#1F2F57}
  .plxg-errs p>span{font:700 10.5px Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#4B5E8C;margin-right:4px}
  .plxg-errs .e-mal s{font:700 16px Poppins,system-ui,sans-serif;color:#B42330}
  .plxg-errs .e-bien b{font:800 16px Poppins,system-ui,sans-serif;color:#15803D}
  .plxg-errs .e-why{font-size:13.5px;line-height:1.5;color:#1F2F57}
  .plxg-errs .e-why b{color:#0B2D74}
  .plxg-acc{display:grid;gap:12px;margin-top:26px}
  @media (max-width:380px){.plxg-kv{grid-template-columns:repeat(2,1fr)}.plxg-kv>div:nth-child(3){border-left:0;padding-left:4px;border-top:1px solid #2A4A8E}.plxg-kv>div:nth-child(4){border-top:1px solid #2A4A8E}}
  /* sesión de juego: zona del motor, instrucción, puntos flotantes, jefe */
  .plxg-zona{position:absolute;inset:0;z-index:1}
  .plxg.plxg-sh .plxg-zona{animation:plxgSh .32s}
  @keyframes plxgSh{0%,100%{transform:none}20%{transform:translate(-7px,2px)}40%{transform:translate(6px,-3px)}60%{transform:translate(-4px,1px)}80%{transform:translate(3px,0)}}
  .plxg.plxg-juego::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;box-shadow:inset 0 0 0 0 rgba(255,122,69,0);transition:box-shadow .4s}
  .plxg.plxg-fr::after{box-shadow:inset 0 0 90px 10px rgba(255,122,69,.55)}
  .plxg-ban{position:absolute;z-index:3;left:12px;right:12px;top:calc(env(safe-area-inset-top) + 104px);max-width:560px;margin:0 auto;pointer-events:none;
    background:rgba(4,14,40,.72);border:1px solid rgba(147,197,253,.22);border-radius:16px;padding:10px 14px 12px;text-align:center;
    -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
  .plxg-ban[hidden]{display:none}
  .plxg-ban.oro{border-color:#FFD200;box-shadow:0 0 0 1px #FFD200,0 0 24px -6px rgba(255,210,0,.6)}
  .plxg-ban p{margin:0}
  .plxg-ban button,.plxg-ban a{pointer-events:auto}
  .plxg-ask{font:600 12.5px/1.35 Inter,system-ui,sans-serif;color:#A9C4FF;margin-bottom:4px!important}
  .plxg-q{font:700 clamp(18px,5.2vw,23px)/1.3 Poppins,system-ui,sans-serif;color:#fff;overflow-wrap:anywhere}
  .plxg-q .hueco{color:#FFD200;letter-spacing:.04em}
  .plxg-q s{color:#FF9EA2;text-decoration-thickness:2px}
  .plxg-q .cat{display:inline-block;background:#FFD200;color:#081F55;padding:2px 12px;border-radius:10px}
  .plxg-q .tr{display:block;font:600 14px/1.35 Inter,system-ui,sans-serif;color:#C9D6F5;margin-bottom:4px}
  .plxg-q .arma{display:block;min-height:1.3em}
  .plxg-oro{display:inline-block;margin-bottom:6px;font:800 10.5px/1 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#081F55;background:#FFD200;padding:5px 8px;border-radius:999px}
  .plxg-oir{all:unset;pointer-events:auto;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:12px;background:#FFD200;color:#081F55!important;font:800 15px/1 Poppins,system-ui,sans-serif}
  .plxg-oir svg{width:20px;height:20px;fill:#081F55}
  .plxg-oir:focus-visible{outline:3px solid #93C5FD;outline-offset:3px}
  .plxg-pops{position:absolute;inset:0;z-index:6;pointer-events:none;overflow:hidden}
  .plxg-pop{position:absolute;transform:translate(-50%,-50%);font:800 20px/1 Poppins,system-ui,sans-serif;color:#FFD200;white-space:nowrap;
    text-shadow:0 2px 0 #081F55,0 0 6px #081F55,0 0 2px #081F55;animation:plxgSube .95s ease-out forwards}
  @keyframes plxgSube{from{opacity:1;transform:translate(-50%,-50%)}to{opacity:0;transform:translate(-50%,-130%)}}
  .plxg-jefe{grid-column:1/-1;display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:12px;background:rgba(229,72,77,.14);box-shadow:inset 0 0 0 1px rgba(255,138,143,.35)}
  .plxg-jefe img{width:34px;height:34px;object-fit:contain}
  .plxg-jefe>div{flex:1;display:grid;gap:4px}
  .plxg-jefe b{font:800 12px/1 Poppins,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#FFB1B4}
  .plxg-jv{display:block;height:8px;border-radius:8px;background:rgba(255,255,255,.14);overflow:hidden}
  .plxg-jv i{display:block;height:100%;background:linear-gradient(90deg,#E5484D,#FF8A3D);transform-origin:left;transition:transform .35s}
  .plxg.plxg-golpe .plxg-jefe img{animation:plxgNo .35s}
  @media (prefers-reduced-motion:reduce){.plxg *:not(.m-bar i){animation-duration:.01ms!important;animation-iteration-count:1!important}}
  `;
  document.head.appendChild(st);
})();
