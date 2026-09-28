/* PLEX PLAY 2.3.0 — Más contenido, sin repeticiones y audio que suena en el celular
   Contenido
   - Banco de A1 (banco-a1.js, 288 ejercicios con escenarios) y retos generados para todos los cursos con los
     ejemplos de las explicaciones (traducir, comprender, ordenar) y el vocabulario (significado, cómo se dice,
     completar la frase del ejemplo, parejas). Van en l.extra de cada lección y se registran en ITEMS
     (clave lección:n, después de los ítems propios), así el carnet y los repasos también los usan.
   - Los juegos los ven porque los alcances (lección, unidad, curso) reciben una copia de cada lección con sus
     ítems + extra. La lección normal no cambia (ni su largo ni su dominio); al repetir una lección ya hecha,
     la mitad de sus ejercicios salen del banco: cada vez es distinta.
   Sin repeticiones
   - Cada reto que se muestra queda anotado (localStorage «plx-vistos», con fecha). Al empezar una partida, los
     retos vistos hace poco van al final o salen si hay suficientes nuevos.
   Audio en el celular
   - En Safari/Chrome del celular el audio que empieza sin un toque (después de la cuenta 3-2-1) se bloqueaba en
     silencio. Ahora: el reproductor se desbloquea en el primer toque; si el navegador bloquea igual, el mp3 suena
     por Web Audio; y si tampoco se puede, aparece «Toca para activar el sonido» (y suena al tocar).
   - Controles en los juegos con audio: repetir, más despacio y volumen (se guarda). */
(function(){
  "use strict";
  var G = window.PLXG || null;
  var esc = function(x){ return String(x == null ? "" : x).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var mezcla = function(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var norm = function(s){ return String(s || "").normalize("NFC").replace(/[’`]/g, "'").replace(/\s+/g, " ").trim().toLowerCase(); };
  var lsG = function(k, d){ try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  var lsS = function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  /* ======================= 1. contenido ======================= */
  var limpiaEs = function(t){ return String(t || "").replace(/\([^()]*\)/g, " ").replace(/\s+/g, " ").replace(/\s+([,.;!?])/g, "$1").trim(); };
  var corto = function(t){ return limpiaEs(String(t || "").split(/[;,]/)[0]); };
  var palabras = function(t){ return String(t).trim().split(/\s+/); };
  var fichas = function(fr){
    var w = palabras(fr); if (w.length < 3 || w.length > 10) return null;
    while (w.length > 7) { var k = 0, min = 1e9; for (var i = 0; i < w.length - 1; i++) { var L = w[i].length + w[i + 1].length; if (L < min) { min = L; k = i; } } w.splice(k, 2, w[k] + " " + w[k + 1]); }
    return w;
  };
  var otros = function(pool, bien, n){
    var b = norm(bien), L = String(bien).length;
    var c = mezcla(pool.filter(function(x){ return norm(x) !== b && x.length <= L * 2 + 8 && x.length >= L / 2 - 4; }));
    var out = [], vistos = {}; vistos[b] = 1;
    c.forEach(function(x){ if (out.length < n && !vistos[norm(x)]) { vistos[norm(x)] = 1; out.push(x); } });
    return out;
  };
  /* distractores difíciles: la misma frase con UN cambio gramatical típico, o una palabra mal escrita */
  var CAMBIOS = [["du", "de la"], ["de la", "du"], ["au", "à la"], ["à la", "au"], ["aux", "au"], ["est", "et"], ["et", "est"], ["les", "des"], ["des", "les"], ["un", "une"], ["une", "un"],
    ["le", "la"], ["la", "le"], ["mon", "ma"], ["ma", "mon"], ["ton", "ta"], ["son", "sa"], ["sa", "son"], ["ses", "son"], ["ce", "cette"], ["cette", "ce"], ["cet", "ce"], ["à", "de"], ["de", "à"],
    ["ai", "suis"], ["suis", "ai"], ["sont", "ont"], ["ont", "sont"], ["a", "à"], ["es", "est"], ["vais", "vas"], ["fais", "fait"], ["peux", "peut"], ["veux", "veut"], ["que", "qui"], ["qui", "que"],
    ["en", "dans"], ["dans", "en"], ["pour", "par"], ["y", "en"], ["lui", "leur"], ["leur", "lui"], ["ne", "n'"], ["pas", "plus"], ["très", "trop"], ["bien", "bon"], ["bon", "bien"]];
  var variantes = function(fr, n){
    var out = [], vistos = {}; vistos[norm(fr)] = 1;
    var mete = function(v){ var k = norm(v); if (!vistos[k] && v.trim()) { vistos[k] = 1; out.push(v); } };
    mezcla(CAMBIOS).forEach(function(c){
      if (out.length >= n) return;
      var re = new RegExp("(^|[\\s'’(])" + c[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?=[\\s,.;:!?]|$)", "i");
      if (re.test(fr)) mete(fr.replace(re, function(m, pre){ var w = m.slice(pre.length), r = c[1]; if (w.charAt(0) !== w.charAt(0).toLowerCase()) r = r.charAt(0).toUpperCase() + r.slice(1); return pre + r; }));
    });
    if (out.length < n && G && G.malEscritas) {
      var ws = fr.split(/\s+/).filter(function(w){ return /^[\p{L}'’-]{4,}[.,!?]?$/u.test(w); }).sort(function(a, b){ return b.length - a.length; });
      ws.slice(0, 3).forEach(function(w){ if (out.length >= n) return; var limpio = w.replace(/[.,!?]$/, ""), m = []; try { m = G.malEscritas(limpio, 1); } catch (e) {} if (m[0]) mete(fr.replace(limpio, m[0])); });
    }
    return out.slice(0, n);
  };
  /* en español: las frases que más palabras comparten con la correcta */
  var parecidos = function(pool, bien, n){
    var set = function(t){ var o = {}; norm(t).replace(/[^\p{L}\s]/gu, " ").split(/\s+/).forEach(function(w){ if (w.length > 2) o[w] = 1; }); return o; };
    var sb = set(bien), b = norm(bien);
    return pool.filter(function(x){ return norm(x) !== b; }).map(function(x){ var sx = set(x), c = 0; for (var k in sx) if (sb[k]) c++; return { x: x, c: c + Math.random() * .5 - Math.abs(x.length - bien.length) / 80 }; })
      .sort(function(p, q){ return q.c - p.c; }).slice(0, n).map(function(o){ return o.x; });
  };
  var sirveFr = function(fr){ return fr && fr.length >= 2 && fr.length <= 90 && !/[→≠=\[\]<>]/.test(fr); };

  var generaDeExplica = function(ls){
    var E = window.__EXPLICA || {}, out = {}, poolFr = [], poolEs = [];
    ls.forEach(function(l){ ((E[l.id] && E[l.id].ej) || []).forEach(function(e){ if (sirveFr(e[0])) { poolFr.push(e[0]); poolEs.push(limpiaEs(e[1])); } }); });
    ls.forEach(function(l){
      var ej = ((E[l.id] && E[l.id].ej) || []).filter(function(e){ return sirveFr(e[0]) && e[1]; }), its = [];
      ej.forEach(function(e){
        var fr = e[0], es = limpiaEs(e[1]);
        var mf = variantes(fr, 2); if (mf.length < 2) mf = mf.concat(parecidos(poolFr, fr, 2 - mf.length));
        var me = parecidos(poolEs, es, 2);
        if (mf.length === 2 && fr.length <= 60) its.push({ k: "choice", ask: "¿Cómo se dice en francés?", ctx: "", q: "«" + es + "»", o: [fr].concat(mf), a: 0, why: "<b>" + esc(fr) + "</b> = " + esc(es), gen: 1 });
        if (me.length === 2 && es.length <= 60) its.push({ k: "choice", ask: "¿Qué significa?", ctx: "", q: fr, o: [es].concat(me), a: 0, why: "<b>" + esc(fr) + "</b> = " + esc(es), gen: 1 });
        var t = fichas(fr); if (t) its.push({ k: "order", ask: "Ordena: «" + es + "»", tokens: t, why: "<b>" + esc(fr) + "</b>", gen: 1 });
      });
      if (its.length) out[l.id] = its;
    });
    return out;
  };
  var sinArticulo = function(fr){ return String(fr).replace(/^(le|la|les|un|une|des|l'|se |s')\s*/i, "").trim(); };
  var generaDeVocab = function(track, ls){
    var V = window.__VOCAB && window.__VOCAB[track]; if (!V || !ls.length) return {};
    var out = {}, rr = 0;
    var texto = ls.map(function(l){ return { l: l, t: norm(l.title + " " + JSON.stringify(l.items || [])) }; });
    V.themes.forEach(function(th){
      var ws = (th.i || []).filter(function(x){ return x && x.fr && x.es; }), frs = ws.map(function(x){ return x.fr; }), ess = ws.map(function(x){ return corto(x.es); });
      var destino = function(x){
        var core = norm(sinArticulo(x.fr)), hit = core.length >= 3 ? texto.filter(function(o){ return o.t.indexOf(core) >= 0; }) : [];
        return hit.length ? hit[Math.floor(Math.random() * hit.length)].l : ls[(rr++) % ls.length];
      };
      ws.forEach(function(x){
        var l = destino(x), its = out[l.id] || (out[l.id] = []), es = corto(x.es);
        var me = otros(ess, es, 2), mf = variantes(x.fr, 1).concat(otros(frs, x.fr, 1));
        if (me.length === 2) its.push({ k: "choice", ask: "¿Qué significa «" + x.fr + "»?", ctx: th.t, q: x.fr, o: [es].concat(me), a: 0, why: "<b>" + esc(x.fr) + "</b> = " + esc(x.es) + (x.ex ? "<br><i>" + esc(x.ex) + "</i>" : ""), gen: 1 });
        if (mf.length === 2) its.push({ k: "choice", ask: "¿Cómo se dice en francés?", ctx: th.t, q: "«" + es + "»", o: [x.fr].concat(mf), a: 0, why: "<b>" + esc(x.fr) + "</b> = " + esc(x.es), gen: 1 });
        var core = sinArticulo(x.fr);
        if (x.ex && core.length >= 3) {
          var re = new RegExp("(^|[^\\p{L}])(" + core.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?=[^\\p{L}]|$)", "iu"), m = x.ex.match(re);
          if (m) {
            var q = x.ex.slice(0, m.index + m[1].length) + "___" + x.ex.slice(m.index + m[1].length + m[2].length);
            its.push({ k: "fill", ask: "Completa la frase con la palabra del vocabulario.", ctx: th.t, q: q + " (" + es + ")", acc: [m[2]], why: "<i>" + esc(x.ex) + "</i>" + (x.exes ? "<br>" + esc(x.exes) : ""), gen: 1 });
            var t = fichas(x.ex); if (t) its.push({ k: "order", ask: "Ordena: «" + limpiaEs(x.exes || "") + "»", tokens: t, why: "<b>" + esc(x.ex) + "</b>", gen: 1 });
          }
        }
      });
      for (var i = 0; i + 4 <= ws.length; i += 4) {
        var l = ls[(rr++) % ls.length], its = out[l.id] || (out[l.id] = []);
        its.push({ k: "match", ask: "Une cada palabra con su significado.", q: "Vocabulario · " + th.t, pairs: ws.slice(i, i + 4).map(function(x){ return [x.fr, corto(x.es)]; }), why: "Vocabulario de «" + esc(th.t) + "».", gen: 1 });
      }
    });
    return out;
  };

  var registrados = {};
  var ponExtra = function(l, lista){
    if (!lista || !lista.length) return;
    l.extra = (l.extra || []).concat(lista.map(function(it){ it.t = it.t || l.t; return it; }));
    var n = (l.items || []).length;
    l.extra.forEach(function(it, j){ var k = l.id + ":" + (n + j); ITEMS[k] = { it: it, l: l }; });
    l.__px = null; registrados[l.id] = 1;
  };
  var hecho = { banco: false, explica: false, vocab: false };
  var aplicaBanco = function(){
    if (hecho.banco || !window.__BANCO) return; hecho.banco = true;
    LESSONS.forEach(function(l){ if (window.__BANCO[l.id]) ponExtra(l, window.__BANCO[l.id]); });
  };
  var aplicaExplica = function(){
    if (hecho.explica || !window.__EXPLICA || Object.keys(window.__EXPLICA).length < 50) return; hecho.explica = true;
    TRACKS.forEach(function(t){ var ls = LESSONS.filter(function(l){ return l.track === t.id && !l.special; }), g = generaDeExplica(ls); ls.forEach(function(l){ ponExtra(l, g[l.id]); }); });
  };
  var aplicaVocab = function(){
    if (hecho.vocab || !window.__VOCAB) return; hecho.vocab = true;
    TRACKS.forEach(function(t){ var ls = LESSONS.filter(function(l){ return l.track === t.id && !l.special; }), g = generaDeVocab(t.id, ls); ls.forEach(function(l){ ponExtra(l, g[l.id]); }); });
  };
  var aplica = function(){ try { aplicaBanco(); aplicaExplica(); aplicaVocab(); } catch (e) { try { console.warn("plx59", e); } catch (x) {} } };
  window.PLX_CONTENIDO = { aplica: aplica, hecho: hecho };

  var carga = function(src){ return new Promise(function(res){ var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = res; document.head.appendChild(s); }); };
  var cargaTodo = function(){
    var ps = [];
    if (!window.__BANCO) ps.push(carga("banco-a1.js?v=" + (window.PLX_BANCO_V || "1")));
    try { if (window.plxExplica) ps.push(window.plxExplica().catch(function(){})); } catch (e) {}
    try { if (G && G.vocab && !window.__VOCAB) ps.push(Promise.resolve(G.vocab()).catch(function(){})); } catch (e) {}
    return Promise.all(ps).then(aplica);
  };
  if ("requestIdleCallback" in window) requestIdleCallback(cargaTodo, { timeout: 5000 }); else setTimeout(cargaTodo, 2500);

  /* la copia de la lección que ven los juegos: sus ítems + los extra */
  var copia = function(l){
    if (!l || !l.extra || !l.extra.length) return l;
    if (!l.__px) { var c = Object.create(l); c.items = (l.items || []).concat(l.extra); l.__px = c; }
    return l.__px;
  };
  if (G && G.alc) {
    aplica();
    ["unidad", "todo", "leccion"].forEach(function(k){
      var f = G.alc[k]; if (typeof f !== "function") return;
      G.alc[k] = function(){ aplica(); var a = f.apply(this, arguments); if (a && a.lecciones) a.lecciones = a.lecciones.map(copia); return a; };
    });
  }
  /* repetir una lección ya hecha: la mitad de los ejercicios salen del banco */
  if (typeof start === "function") {
    var _start = start;
    start = function(o){
      try {
        var l = o && o.lesson;
        if (o && o.mode === "lesson" && l && l.extra && l.extra.length >= 4 && S.lessons[l.id] && S.lessons[l.id].done && o.steps) {
          var n = (l.items || []).length, pos = [];
          o.steps.forEach(function(st, i){ if (st.kind === "item" && st.key && st.key.indexOf(l.id + ":") === 0) pos.push(i); });
          var cambia = mezcla(pos).slice(0, Math.floor(pos.length / 2)), extra = mezcla(l.extra.map(function(_, j){ return l.id + ":" + (n + j); })).filter(function(k){ var it = ITEMS[k] && ITEMS[k].it; return it && it.k !== "listen"; });
          cambia.forEach(function(i, j){ if (extra[j]) o.steps[i] = { kind: "item", key: extra[j] }; });
        }
      } catch (e) {}
      return _start.apply(this, arguments);
    };
  }

  /* ======================= 2. sin repeticiones ======================= */
  var VISTOS = lsG("plx-vistos", {}), guarda = 0;
  var firma = function(r){ return (r.key || "") + "|" + (r.tipo || "") + "|" + String(r.q || r.audio || "").slice(0, 60) + "|" + (r.correcta || []).join("/").slice(0, 60); };
  var anota = function(r){
    if (!r) return; VISTOS[firma(r)] = Date.now();
    clearTimeout(guarda); guarda = setTimeout(function(){
      var ks = Object.keys(VISTOS); if (ks.length > 4000) ks.sort(function(a, b){ return VISTOS[a] - VISTOS[b]; }).slice(0, ks.length - 3000).forEach(function(k){ delete VISTOS[k]; });
      lsS("plx-vistos", VISTOS);
    }, 800);
  };
  var jugando = false;
  if (G && G.retosJuego) {
    var _rj = G.retosJuego;
    G.retosJuego = function(j, alc){
      var rs = _rj.apply(this, arguments);
      if (!jugando || !rs || rs.length < 8) return rs;
      var ahora = Date.now(), DIA = 864e5;
      var nuevos = rs.filter(function(r){ var t = VISTOS[firma(r)]; return !t || ahora - t > 3 * DIA; });
      var viejos = rs.filter(function(r){ var t = VISTOS[firma(r)]; return t && ahora - t <= 3 * DIA; }).sort(function(a, b){ return VISTOS[firma(a)] - VISTOS[firma(b)]; });
      var min = Math.max(10, Math.ceil(rs.length * .4));
      return nuevos.length >= min ? nuevos : nuevos.concat(viejos.slice(0, min - nuevos.length));
    };
  }
  /* cada motor anota lo que muestra */
  var envuelveMotores = function(){
    if (!G || !G.juegos) return;
    Object.keys(G.juegos).forEach(function(id){
      var j = G.juegos[id]; if (!j.montar || j.__vis) return; j.__vis = 1;
      var m = j.montar;
      j.montar = function(z, s){ var c = m.apply(this, arguments); if (c && c.jugar) { var jg = c.jugar; c.jugar = function(r){ anota(r); return jg.apply(this, arguments); }; } return c; };
    });
  };
  envuelveMotores(); window.addEventListener("load", envuelveMotores);

  /* ======================= 3. audio en el celular ======================= */
  var VOL = +lsG("plx-vol", 1); if (!(VOL >= 0 && VOL <= 1)) VOL = 1;
  var AC = null, GAN = null, fuente = null, desbloqueado = false, ultimo = null;
  var ctx = function(){ try { if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); GAN = AC.createGain(); GAN.gain.value = VOL; GAN.connect(AC.destination); } return AC; } catch (e) { return null; } };
  var SILENCIO = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbg8isVNoMPMjAAAA0gAAABEVFGmgqK////9bP/6XCykxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
  var reproductor = function(){ try { return typeof player !== "undefined" ? player : null; } catch (e) { return null; } };
  var aplicaVol = function(){ var p = reproductor(); if (p) try { p.volume = VOL; } catch (e) {} if (GAN) GAN.gain.value = VOL; };
  aplicaVol();
  /* primer toque: desbloquea el reproductor y Web Audio (Safari y Chrome del celular lo exigen) */
  var desbloquea = function(){
    var a = ctx(); if (a && a.state === "suspended") a.resume().catch(function(){});
    if (a && !desbloqueado) { try { var b = a.createBuffer(1, 1, 22050), s = a.createBufferSource(); s.buffer = b; s.connect(a.destination); s.start(0); } catch (e) {} }
    var p = reproductor();
    if (p && !desbloqueado && p.paused && !p.src) {
      try { p.src = SILENCIO; var pr = p.play(); if (pr && pr.then) pr.then(function(){ if (p.src === SILENCIO) { p.pause(); p.removeAttribute("src"); } }, function(){}); } catch (e) {}
    }
    desbloqueado = true;
  };
  ["pointerdown", "touchend", "keydown"].forEach(function(ev){ document.addEventListener(ev, desbloquea, { capture: true, passive: true }); });

  if (typeof playSpec === "function") {
    var _ps = playSpec;
    playSpec = function(spec, cb, rate){ ultimo = { spec: spec, cb: cb, rate: rate, tok: 0 }; paraFuente(); var r = _ps.apply(this, arguments); try { ultimo.tok = playToken; } catch (e) {} return r; };
  }
  var paraFuente = function(){ if (fuente) { try { fuente.onended = null; fuente.stop(); } catch (e) {} fuente = null; } };
  if (typeof stopAudio === "function") { var _st = stopAudio; stopAudio = function(){ paraFuente(); return _st.apply(this, arguments); }; }
  var buffers = {};
  /* el mismo mp3 por Web Audio (sin exigir un toque en ese instante) */
  var porWebAudio = function(u){
    var a = ctx(); if (!a || !u) return Promise.reject();
    if (a.state === "suspended") return Promise.reject(new Error("suspendido"));
    var partes = String(u.spec).split("#"), src = new URL(partes[0], location.href).href, desde = 0, hasta = null;
    if (partes[1]) { var r = partes[1].split(",").map(Number); desde = r[0] || 0; hasta = r[1]; }
    var tok = u.tok;
    return (buffers[src] || (buffers[src] = fetch(src).then(function(r){ if (!r.ok) throw 0; return r.arrayBuffer(); }).then(function(ab){ return new Promise(function(res, rej){ a.decodeAudioData(ab, res, rej); }); })))
      .then(function(buf){
        try { if (typeof playToken !== "undefined" && tok && playToken !== tok) return; } catch (e) {}
        paraFuente();
        var s = a.createBufferSource(); s.buffer = buf; s.playbackRate.value = (u.rate || 1) * (typeof SPEED === "number" ? SPEED : 1); s.connect(GAN);
        s.onended = function(){ if (fuente === s) { fuente = null; try { if (typeof clipDone === "function") clipDone(); } catch (e) {} } };
        s.start(0, desde, hasta != null ? Math.max(.05, hasta - desde) : undefined); fuente = s;
      });
  };
  var p0 = reproductor();
  if (p0 && p0.play) {
    var _play = p0.play.bind(p0);
    p0.play = function(){
      var pr; try { pr = _play(); } catch (e) { pr = Promise.reject(e); }
      if (!pr || !pr.catch) return pr;
      return pr.catch(function(err){
        if (!err || err.name !== "NotAllowedError" || p0.src === SILENCIO) throw err;
        var u = ultimo;
        return porWebAudio(u).catch(function(){ muestraAviso(u); throw err; });
      });
    };
  }
  /* aviso: el navegador no deja sonar sin un toque */
  var aviso = null;
  var muestraAviso = function(u){
    if (aviso) return;
    aviso = document.createElement("button"); aviso.type = "button"; aviso.className = "au-activa";
    aviso.innerHTML = '<span aria-hidden="true">🔈</span><b>Toca para activar el sonido</b>';
    aviso.onclick = function(e){ e.stopPropagation(); desbloquea(); quitaAviso(); if (u && u.spec) try { playSpec(u.spec, u.cb, u.rate); } catch (x) {} };
    document.body.appendChild(aviso);
    setTimeout(quitaAviso, 9000);
  };
  var quitaAviso = function(){ if (aviso) { aviso.remove(); aviso = null; } };

  /* controles de audio en los juegos: repetir, despacio y volumen */
  if (G && G.sesion) {
    var _ses = G.sesion;
    G.sesion = function(el, alc, juego, acciones, opc){
      jugando = true; var r;
      try { r = _ses.apply(this, arguments); } finally { jugando = false; }
      var s = r && r.s; if (!s) return r;
      var barra = document.createElement("div"); barra.className = "au-barra"; barra.hidden = true;
      barra.innerHTML = '<button type="button" data-au="rep" aria-label="Repetir el audio">🔁<span>Repetir</span></button><button type="button" data-au="lento" aria-label="Más despacio">🐢<span>Despacio</span></button>' +
        '<label class="au-vol"><span aria-hidden="true">🔊</span><input type="range" min="0" max="100" value="' + Math.round(VOL * 100) + '" aria-label="Volumen"></label>';
      el.appendChild(barra);
      var texto = function(){ var re = s.reto; if (!re) return ""; if (re.audio) return re.audio; if (juego && (juego.id === "vd") && re.q) return re.q; if (juego && juego.id === "rq" && re.personaje) return re.personaje; return ""; };
      var iv = setInterval(function(){ if (!document.body.contains(el) || el.querySelector(".plxg-res")) { clearInterval(iv); barra.remove(); return; } barra.hidden = !texto() || s.estado() === "fin"; }, 300);
      barra.addEventListener("click", function(e){
        var b = e.target.closest && e.target.closest("[data-au]"); if (!b) return; e.stopPropagation(); desbloquea();
        var t = texto(); if (!t) return;
        try { speak(t, b.dataset.au === "lento" ? .7 : undefined); } catch (x) {}
      });
      barra.querySelector("input").addEventListener("input", function(e){ VOL = Math.max(0, Math.min(1, +e.target.value / 100)); lsS("plx-vol", VOL); aplicaVol(); });
      var des = r.destruye; r.destruye = function(){ clearInterval(iv); barra.remove(); return des.apply(this, arguments); };
      return r;
    };
  }

  var st = document.createElement("style"); st.id = "plx59";
  st.textContent = `
  .au-activa{all:unset;box-sizing:border-box;position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483600;cursor:pointer;display:flex;align-items:center;gap:10px;padding:14px 20px;border-radius:999px;background:#FFD200;color:#081F55;font:800 15px/1 Poppins,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45);animation:auLate 1s ease-in-out infinite alternate}
  .au-activa span{font-size:22px}
  @keyframes auLate{to{transform:translateX(-50%) scale(1.06)}}
  .au-barra{position:absolute;right:10px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:9;display:flex;align-items:center;gap:6px;padding:6px;border-radius:999px;background:rgba(6,23,63,.82);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),0 8px 20px rgba(0,0,0,.4);backdrop-filter:blur(4px)}
  .au-barra[hidden]{display:none}
  .au-barra button{all:unset;cursor:pointer;display:flex;align-items:center;gap:4px;height:36px;padding:0 10px;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font:700 12px/1 Inter,system-ui,sans-serif}
  .au-barra button:active{transform:scale(.94)}
  .au-barra button:focus-visible{outline:2px solid #FFD200}
  .au-vol{display:flex;align-items:center;gap:4px;padding:0 6px;color:#fff}
  .au-vol input{width:76px;accent-color:#FFD200}
  @media (max-width:380px){.au-barra button span{display:none}.au-vol input{width:56px}}
  @media (prefers-reduced-motion:reduce){.au-activa{animation:none}}
  `;
  document.head.appendChild(st);
})();
