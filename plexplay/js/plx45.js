/* PLEX PLAY 1.23.0 — Arcade: los componentes que comparten todos los juegos
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
  var cabe = function(s){ s = String(s || ""); return s.length > 0 && s.length <= G.MAX; };
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
  var retosDeItem = G.retosDeItem = function(it, key, l, nivel, pozo){
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
    if (it.k === "order" && it.tokens && it.tokens.length >= 3 && it.tokens.length <= 6 && it.tokens.every(cabe)) {
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
  /* retos de un conjunto de lecciones */
  G.retos = function(lecciones, nivel){
    var out = [];
    lecciones.forEach(function(l){
      var its = l.items || [], pozo = respuestas(its);
      its.forEach(function(it, i){ out.push.apply(out, retosDeItem(it, l.id + ":" + i, l, nivel, pozo)); });
    });
    return out;
  };
  /* retos de un tema del vocabulario: suena la palabra y se corta la que sonó */
  G.retosVocab = function(tema, nivel){
    var frs = tema.i.map(function(x){ return x.fr; });
    return tema.i.filter(function(x){ return cabe(x.fr); }).map(function(x){
      return { tipo: "uno", audio: x.fr, ask: "Escucha y corta la palabra que suena", q: "", correcta: [x.fr], malas: G.distractores(x.fr, frs, nivel, []).slice(0, 5),
        why: "<b>" + esc(x.fr) + "</b> = " + esc(x.es) + (x.ex ? "<br><i>" + esc(x.ex) + "</i>" : ""), hab: "vocab", key: null, lessonId: "" };
    }).filter(function(r){ return r.malas.length; });
  };
  /* retos del carnet (frutas doradas): solo errores de ítems de lecciones de ese curso */
  G.retosCarnet = function(track, nivel){
    var out = [];
    Object.keys(S.carnet || {}).forEach(function(k){
      var x = ITEMS[k]; if (!x || (track && x.l.track !== track)) return;
      retosDeItem(x.it, k, x.l, nivel, respuestas(x.l.items || [])).forEach(function(r){ r.oro = true; out.push(r); });
    });
    return mezcla(out);
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
  G.estrellasUnidad = function(track, unit){ return L().est[track + "|" + unit] || 0; };
  G.estrellas = function(r, seg){ if (!r.aciertos) return 0; var p = r.precision; return p >= 80 && r.puntos >= seg * 35 ? 3 : p >= 80 ? 2 : 1; };
  /* XP parecida a la de una lección, sin superarla: 5 por acierto + 5 por estrella, máximo 100 */
  G.premiar = function(juego, alc, r){
    var a = A(), k = G.claveRec(juego, alc), antes = a.rec[k] || null, xp = Math.min(100, r.aciertos * 5 + r.estrellas * 5);
    if (xp) addXP(xp);
    try { var d = today(); d.sec = (d.sec || 0) + Math.round(r.seg); } catch (e) {}
    var nuevo = !antes || r.puntos > antes.best;
    if (nuevo && r.puntos > 0) a.rec[k] = { best: r.puntos, est: r.estrellas, acc: r.precision, at: Date.now(), traza: r.traza.slice(0, 200) };
    else if (antes && r.estrellas > (antes.est || 0)) antes.est = r.estrellas;
    if (alc.track && alc.unit) { var ku = alc.track + "|" + alc.unit; a.est[ku] = Math.max(a.est[ku] || 0, r.estrellas); }
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
      '<div class="plxg-hud" style="--ac:' + o.color + '">' +
        '<button class="plxg-ib" data-g="pausa" aria-label="Pausa"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="4" width="3.4" height="12" rx="1"/><rect x="11.6" y="4" width="3.4" height="12" rx="1"/></svg></button>' +
        '<div class="plxg-vidas" aria-label="Vidas"></div>' +
        '<div class="plxg-tiempo" aria-label="Tiempo"><b>0:00</b></div>' +
        '<div class="plxg-pts"><b>0</b><small>puntos</small></div>' +
        '<div class="plxg-barra"><i></i></div>' +
        '<div class="plxg-sub"><span class="plxg-combo" hidden></span><span class="plxg-fan" hidden></span></div>' +
      "</div>");
    var h = el.querySelector(".plxg-hud"), q = function(s){ return h.querySelector(s); }, ult = {};
    return {
      el: h,
      pinta: function(s){
        if (ult.v !== s.vidas) { ult.v = s.vidas; q(".plxg-vidas").innerHTML = [0, 1, 2].map(function(i){ return '<i class="' + (i < s.vidas ? "on" : "") + '"></i>'; }).join(""); q(".plxg-vidas").setAttribute("aria-label", s.vidas + " vidas"); }
        var sg = Math.ceil(Math.max(0, s.resta)), tt = s.sinTiempo ? "∞" : Math.floor(sg / 60) + ":" + String(sg % 60).padStart(2, "0");
        if (ult.t !== tt) { ult.t = tt; q(".plxg-tiempo b").textContent = tt; q(".plxg-tiempo").classList.toggle("poco", !s.sinTiempo && s.resta <= 10); }
        if (ult.p !== s.pts) { ult.p = s.pts; q(".plxg-pts b").textContent = s.pts.toLocaleString("es-CO"); }
        q(".plxg-barra i").style.transform = "scaleX(" + Math.max(0, Math.min(1, s.avance)).toFixed(3) + ")";
        var cb = s.mult > 1 ? "×" + s.mult + " · " + s.racha + " seguidos" : s.racha >= 1 ? s.racha + " seguido" + (s.racha > 1 ? "s" : "") : "";
        if (s.frenesi) cb = "FRENESÍ · puntos dobles";
        if (ult.c !== cb) { ult.c = cb; var c = q(".plxg-combo"); c.textContent = cb; c.hidden = !cb; c.classList.toggle("fr", !!s.frenesi); c.classList.toggle("hot", s.mult > 1); }
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
        (o.mal ? '<p class="m-mal"><span>Cortaste</span><s>' + esc(o.mal) + "</s></p>" : "") +
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
    el.insertAdjacentHTML("beforeend", '<div class="plxg-pausa"><div class="plxg-pc"><h2>Pausa</h2><p>El tiempo está detenido.</p><button class="plxg-btn" data-g="seguir">Seguir</button><button class="plxg-btn line" data-g="salir">Salir de la partida</button></div></div>');
    var p = el.querySelector(".plxg-pausa");
    p.addEventListener("click", function(e){ var b = e.target.closest("[data-g]"); if (!b) return; p.remove(); (b.dataset.g === "seguir" ? seguir : salir)(); });
    p.querySelector("[data-g=seguir]").focus();
  };

  /* estrellas en SVG */
  var ESTRELLA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';
  G.estrellasHTML = function(n, clase){ return '<span class="plxg-est ' + (clase || "") + '" aria-label="' + n + ' de 3 estrellas">' + [0, 1, 2].map(function(i){ return '<i class="' + (i < n ? "on" : "") + '">' + ESTRELLA + "</i>"; }).join("") + "</span>"; };

  /* resultados */
  G.resultados = function(el, juego, alc, r, premio, acciones){
    var fan = premio.antes, dif = fan ? r.puntos - fan.best : null;
    var linea = !fan ? "Primera partida en esta unidad: ahora tu récord es tu fantasma."
      : dif > 0 ? "Le ganaste a tu fantasma por " + dif.toLocaleString("es-CO") + " puntos. Nuevo récord."
      : dif === 0 ? "Empate exacto con tu fantasma."
      : "Te faltaron " + Math.abs(dif).toLocaleString("es-CO") + " puntos para ganarle a tu fantasma (" + fan.best.toLocaleString("es-CO") + ").";
    var errs = r.errores.map(function(x){
      return '<li><p class="e-q">' + esc(x.q || x.ask || "") + "</p>" + (x.mal ? '<p class="e-mal"><span>Cortaste</span> <s>' + esc(x.mal) + "</s></p>" : "") +
        '<p class="e-bien"><span>' + esc(x.etiqueta || "Correcta") + "</span> <b>" + esc(x.bien) + "</b></p>" + (x.why ? '<div class="e-why">' + seguro(x.why) + "</div>" : "") + "</li>";
    }).join("");
    el.innerHTML =
      '<div class="plxg-res" style="--ac:' + juego.color + '"><div class="plxg-wrap">' +
        '<p class="plxg-k">' + esc(juego.nombre) + " · " + esc(alc.titulo) + "</p>" +
        '<h1 class="plxg-h">' + (r.porVidas ? "Sin vidas" : "Fin de la partida") + "</h1>" +
        '<div class="plxg-big"><b>' + r.puntos.toLocaleString("es-CO") + "</b><span>puntos</span></div>" +
        G.estrellasHTML(r.estrellas, "grande") +
        '<p class="plxg-fanl ' + (dif > 0 ? "gana" : "") + '">' + esc(linea) + "</p>" +
        '<div class="plxg-kv"><div><b>' + r.precision + '%</b><span>precisión</span></div><div><b>' + r.aciertos + "</b><span>aciertos</span></div>" +
          "<div><b>×" + r.mejorMult + " · " + r.mejor + "</b><span>mejor combo</span></div><div><b>+" + premio.xp + "</b><span>XP</span></div></div>" +
        '<p class="plxg-como">' + (r.estrellas < 2 ? "2 estrellas: termina con 80 % de precisión." : r.estrellas < 3 ? "3 estrellas: 80 % de precisión y " + (alc.seg * 35).toLocaleString("es-CO") + " puntos." : "Tres estrellas en esta unidad.") + "</p>" +
        (errs ? '<h2 class="plxg-h2">Repaso de tus errores <small>' + r.errores.length + " · " + (r.alCarnet ? r.alCarnet + " nuevos en el carnet" : "ya están en el carnet") + '</small></h2><ol class="plxg-errs">' + errs + "</ol>"
              : r.aciertos ? '<p class="plxg-limpio">Ningún error en toda la partida.</p>' : "") +
        '<div class="plxg-acc"><button class="plxg-btn" data-g="otra">Otra vez</button>' + (acciones.cambiar ? '<button class="plxg-btn line" data-g="cambiar">Cambiar de unidad</button>' : "") + '<button class="plxg-btn line" data-g="salir">Salir</button></div>' +
      "</div></div>";
    el.scrollTop = 0;
    if (r.estrellas) [0, 1, 2].slice(0, r.estrellas).forEach(function(i){ setTimeout(function(){ G.sfx("estrella", i); }, 350 + i * 220); });
    el.querySelector(".plxg-acc").addEventListener("click", function(e){ var b = e.target.closest("[data-g]"); if (!b) return; var f = acciones[{ otra: "otra", cambiar: "cambiar", salir: "salir" }[b.dataset.g]]; if (f) f(); });
    var bt = el.querySelector("[data-g=otra]"); if (bt) bt.focus({ preventScroll: true });
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
  .plxg-ib{all:unset;cursor:pointer;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}
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
  @media (prefers-reduced-motion:reduce){.plxg *:not(.m-bar i){animation-duration:.01ms!important;animation-iteration-count:1!important}}
  `;
  document.head.appendChild(st);
})();
