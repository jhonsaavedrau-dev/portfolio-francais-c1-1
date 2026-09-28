/* PLEX PLAY 1.23.0 — Arcade y Fruit Frenzy
   - Pestaña Retos: sección «Arcade». Se elige curso y unidad (o un tema de vocabulario) y se juega.
   - Al final de cada lección: botón opcional «Jugar el repaso» (60 s con lo de esa lección).
   - Fruit Frenzy (motor de reflejos): arriba una instrucción; las frutas saltan desde abajo, cada una con
     una palabra, y se corta la correcta deslizando el dedo (o tocándola, o con las teclas 1 a 5).
     choice, fill y match: se corta la respuesta · sort: solo las de una categoría · order: en orden ·
     spot: primero la palabra incorrecta y después su arreglo · vocabulario: suena y se corta la que sonó.
   - 90 s y 3 vidas. Cortar una incorrecta quita una vida y muestra la corrección; dejar caer la correcta
     solo rompe el combo. 10 aciertos seguidos: frenesí (cámara lenta y puntos dobles). Las frutas
     doradas son errores de tu carnet y valen el doble. Un trazo que corta una incorrecta se anula entero.
   - Canvas 2D y pointer events. Usa los componentes globales de plx45 (window.PLXG). */
(function(){
  "use strict";
  var G = window.PLXG; if (!G) return;
  var esc = G.esc, norm = G.norm, mezcla = G.mezcla;
  var FF = G.juegos.ff = { id: "ff", nombre: "Fruit Frenzy", verbo: "Corta la palabra correcta", color: "#FF7A45" };

  /* ---------------- frutas en SVG, pasadas a imagen ---------------- */
  var CLIP = '<clipPath id="c"><circle cx="60" cy="64" r="46"/></clipPath>';
  var HOJA = '<path d="M60 24q1-11 8-16" stroke="#5B3A1A" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M65 15q15-11 27-1q-13 11-27 1z" fill="#2FA84F"/>';
  var BRILLO = '<ellipse cx="42" cy="44" rx="14" ry="8" fill="#fff" opacity=".38" transform="rotate(-32 42 44)"/>';
  var fruta = function(id, claro, piel, sombra, pulpa, jugo, extra, sinHoja){
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><radialGradient id="g" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="' + claro + '"/><stop offset=".55" stop-color="' + piel + '"/><stop offset="1" stop-color="' + sombra + '"/></radialGradient>' + CLIP + "</defs>" +
      '<circle cx="60" cy="64" r="46" fill="url(#g)" stroke="rgba(0,0,0,.28)" stroke-width="2"/>' + (extra || "") + BRILLO + (sinHoja ? "" : HOJA) + "</svg>";
    var img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    return { id: id, img: img, pulpa: pulpa, jugo: jugo, url: img.src };
  };
  var FRUTAS = [
    fruta("manzana", "#FF8A8F", "#E5484D", "#9E1F2B", "#FFF1CF", "#FF6B6B"),
    fruta("naranja", "#FFC266", "#FF9419", "#C25E00", "#FFC46B", "#FFA53D", '<circle cx="60" cy="24" r="3" fill="#8A4B00"/>', true),
    fruta("sandia", "#4ADE80", "#16A34A", "#0B5E2A", "#FF5A6E", "#FF4D63", '<g clip-path="url(#c)" fill="none" stroke="#0B5E2A" stroke-width="7" opacity=".75"><path d="M36 14c-12 30-12 70 0 100"/><path d="M60 12c-6 34-6 70 0 104"/><path d="M84 14c12 30 12 70 0 100"/></g>', true),
    fruta("ciruela", "#C4A6FF", "#8B5CF6", "#4C1D95", "#FCE38A", "#A78BFA", '<path d="M60 22c-10 18-10 64 2 88" stroke="#4C1D95" stroke-width="3" fill="none" opacity=".5"/>'),
    fruta("limon", "#FFF08A", "#FFD200", "#C79A00", "#FFF6B3", "#FFE45C", '<g fill="#B38700" opacity=".35"><circle cx="78" cy="52" r="2"/><circle cx="70" cy="86" r="2"/><circle cx="46" cy="80" r="2"/><circle cx="86" cy="74" r="2"/></g>'),
    fruta("kiwi", "#C9A36B", "#8D6A3A", "#4E3517", "#8BCB4A", "#9BD35A", '<g fill="#E9D3A8" opacity=".35"><circle cx="40" cy="70" r="1.6"/><circle cx="70" cy="40" r="1.6"/><circle cx="82" cy="80" r="1.6"/><circle cx="56" cy="96" r="1.6"/><circle cx="92" cy="58" r="1.6"/></g>', true)
  ];
  var ORO = fruta("oro", "#FFF6B0", "#FFD200", "#B07A00", "#FFF3C4", "#FFE066", '<path d="M92 26l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff"/><path d="M30 92l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff" opacity=".8"/>');
  G.frutasFF = FRUTAS;

  /* ---------------- alcances: unidad, curso, lección o vocabulario ---------------- */
  var etiquetaCurso = function(tr){ var t = TRACKS.find(function(x){ return x.id === tr; }); return t ? t.label : tr; };
  var unidades = function(tr){ var vistas = {}, out = []; LESSONS.forEach(function(l){ if (l.track !== tr || vistas[l.unit]) return; vistas[l.unit] = 1; out.push(l.unit); }); return out; };
  var alcUnidad = function(tr, u){ return { clave: "u:" + tr + ":" + u, track: tr, unit: u, titulo: u, sub: etiquetaCurso(tr), seg: 90, lecciones: LESSONS.filter(function(l){ return l.track === tr && l.unit === u; }) }; };
  var alcCurso = function(tr){ return { clave: "c:" + tr, track: tr, titulo: "Todo el curso", sub: etiquetaCurso(tr), seg: 90, lecciones: LESSONS.filter(function(l){ return l.track === tr; }) }; };
  var alcLeccion = function(l){ return { clave: "l:" + l.id, track: l.track, titulo: l.title, sub: "Repaso de la lección · " + etiquetaCurso(l.track), seg: 60, lecciones: [l], repaso: true }; };
  var alcVocab = function(tr, ti){ var t = ((window.__VOCAB || {})[tr] || { themes: [] }).themes[ti]; return t ? { clave: "v:" + tr + ":" + ti, track: tr, titulo: "Vocabulario · " + t.t, sub: etiquetaCurso(tr), seg: 90, tema: t } : null; };
  var retosDe = function(alc){ var n = G.nivel(alc.track); return alc.tema ? G.retosVocab(alc.tema, n) : G.retos(alc.lecciones, n); };
  var cuenta = {};
  var nRetos = function(alc){ return cuenta[alc.clave] != null ? cuenta[alc.clave] : (cuenta[alc.clave] = retosDe(alc).length); };
  var MIN = 4;

  /* ---------------- el juego ---------------- */
  function partida(el, alc, acciones){
    var nivel = G.nivel(alc.track), dir = G.director(alc.track), pts = G.Puntos();
    var base = retosDe(alc), cola = mezcla(base), oros = alc.tema ? [] : G.retosCarnet(alc.track, nivel).slice(0, 12);
    var seg = alc.seg, sinT = !!G.aj.sinTiempo, META = alc.repaso ? 10 : 15, mov = G.movReducido();
    var fan = G.record("ff", alc), traza = [], errores = [], alCarnet = 0;
    var vidas = 3, tJ = 0, resueltos = 0, frenesi = 0, olas = 0, ultimoOro = false, espera = .2;
    var frutas = [], mitades = [], gotas = [], pops = [], rastro = [], trazo = null, ola = null;
    var estado = "cuenta", raf = 0, ult = 0, W = 0, H = 0, dpr = 1, techo = 150;
    var teclado = (function(){ try { return matchMedia("(pointer:fine)").matches; } catch (e) { return false; } })();

    el.innerHTML = '<canvas class="ff-cv" aria-label="Zona de juego: corta las frutas"></canvas><div class="ff-ban" aria-live="polite"></div>' +
      '<div class="plxg-mz"><img src="' + G.mzImg("idle") + '" alt=""><span class="plxg-bub" hidden></span></div>';
    el.classList.add("ff");
    var cv = el.querySelector(".ff-cv"), ctx = cv.getContext("2d"), ban = el.querySelector(".ff-ban"), mzEl = el.querySelector(".plxg-mz");
    var hud = G.hud(el, { color: FF.color });

    var tam = function(){
      var r = el.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      medirTecho();
    };
    var medirTecho = function(){ var b = ban.getBoundingClientRect(), r = el.getBoundingClientRect(); techo = ban.hidden || !b.height ? 140 : b.bottom - r.top; };
    /* la etiqueta nunca se sale de la pantalla */
    var limitaX = function(x, ancho, r){ var m = Math.max(ancho / 2, r) + 6; return Math.max(m, Math.min(W - m, x)); };
    var radio = function(){ return Math.max(30, Math.min(44, W * .095)); };
    var fuente = function(){ return (W < 360 ? 15 : 16); };

    /* ---- retos y oleadas ---- */
    var siguienteReto = function(){
      olas++;
      if (oros.length && !ultimoOro && olas > 2 && Math.random() < .2) { ultimoOro = true; return oros.shift(); }
      ultimoOro = false;
      if (!cola.length) cola = mezcla(base);
      return cola.shift();
    };
    var repetir = function(r){ cola.splice(Math.min(3, cola.length), 0, r); };

    var lanzar = function(reto, fase){
      fase = fase || 1;
      var tipo = reto.tipo, correcta = reto.correcta, malas = reto.malas;
      if (tipo === "error") { if (fase === 2) { correcta = reto.fix.correcta; malas = reto.fix.malas; } tipo = "uno"; }
      var lista = [], T = dir.t();
      if (tipo === "uno") {
        /* los distractores ya vienen en orden de preferencia: primero los del propio ejercicio */
        var n = Math.min(dir.opciones(), 1 + malas.length);
        lista = [{ t: correcta[0], ok: true }].concat(malas.slice(0, n - 1).map(function(m){ return { t: m, ok: false }; }));
      } else if (tipo === "varios") {
        var tot = Math.min(correcta.some(function(t){ return t.length > 14; }) ? 4 : 5, dir.opciones() + 1), k = Math.max(1, Math.min(correcta.length, Math.round(tot / 2)));
        lista = mezcla(correcta).slice(0, k).map(function(t){ return { t: t, ok: true }; }).concat(mezcla(malas).slice(0, tot - k).map(function(t){ return { t: t, ok: false }; }));
        T *= 1.2;
      } else if (tipo === "orden") {
        lista = correcta.map(function(t){ return { t: t, ok: true }; });
        T = T * 1.35 + .4 * lista.length;
      }
      lista = mezcla(lista);
      ola = { reto: reto, fase: fase, tipo: tipo, correcta: correcta, T: T, t: 0, paso: 0, hecho: false, objetivo: lista.filter(function(f){ return f.ok; }).length, cortadasOk: 0, frutas: [] };
      pintaBan();
      if (reto.audio) try { speak(reto.audio); } catch (e) {}
      /* geometría: carriles, alturas alternadas y salidas escalonadas */
      var r = radio(), n2 = lista.length, margen = Math.min(W * .12, 60), carril = (W - margen * 2) / n2, orden = mezcla(lista.map(function(_, i){ return i; }));
      var alto = Math.max(techo + r + 26, H * .2), bajo = Math.max(alto + 40, H * .6);
      var escalon = tipo === "orden" ? T * .05 : T * (tipo === "varios" ? .14 : .16);
      ctx.font = "700 " + fuente() + "px Poppins, Inter, system-ui, sans-serif";
      /* cada carril tiene su propia altura máxima y los carriles vecinos quedan lejos en altura,
         así las etiquetas largas no se montan unas sobre otras */
      var mitad = Math.ceil(n2 / 2), rango = function(c){ return c % 2 === 0 ? c / 2 : mitad + (c - 1) / 2; };
      frutas = lista.map(function(f, i){
        var c = orden[i], ancho = Math.max(ctx.measureText(f.t).width + 24, r * 1.6);
        var x0 = limitaX(margen + carril * (c + .5) + (Math.random() - .5) * carril * .25, ancho, r);
        var ap = alto + (bajo - alto) * (n2 > 1 ? rango(c) / (n2 - 1) : .3) + (Math.random() - .5) * 16;
        var y0 = H + r + 4, h = y0 - ap, g = 8 * h / (T * T);
        /* en una oleada del carnet todas son doradas: el color no delata la respuesta */
        var spr = reto.oro ? ORO : FRUTAS[Math.floor(Math.random() * FRUTAS.length)];
        return { t: f.t, ok: f.ok, x: x0, y: y0, vx: (Math.random() - .5) * carril * .4 / T, vy: -4 * h / T, g: g, r: r, w: ancho, spr: spr,
          rot: Math.random() * 6, vr: (Math.random() - .5) * 1.4, nace: i * escalon, activa: false, vivo: true, disuelve: -1, naceJ: 0, oro: !!reto.oro, flash: 0 };
      });
      ola.frutas = frutas;
    };

    var textoQ = function(){
      var r = ola.reto;
      if (r.tipo === "error") {
        var f = esc(r.q);
        if (ola.fase === 2) return f.replace(esc(r.correcta[0]), '<s>' + esc(r.correcta[0]) + '</s> <span class="hueco">?</span>');
        return f;
      }
      if (ola.tipo === "orden") return (r.q ? '<span class="tr">' + esc(r.q) + "</span>" : "") + '<span class="arma">' + (ola.correcta.slice(0, ola.paso).map(esc).join(" ") || "&nbsp;") + ' <span class="hueco">…</span></span>';
      if (ola.tipo === "varios") return '<span class="cat">' + esc(r.q) + "</span>";
      if (r.audio) return '<button class="ff-oir" data-f="oir"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z"/><path d="M13 7a4 4 0 0 1 0 6M15.5 4.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>Escuchar otra vez</button>';
      return esc(r.q).replace(/_{2,}/g, '<span class="hueco">___</span>');
    };
    var pintaBan = function(){
      if (!ola) return;
      var r = ola.reto, ask = r.tipo === "error" && ola.fase === 2 ? "Ahora corta el arreglo" : r.ask;
      ban.innerHTML = (r.oro ? '<span class="ff-oro">Del carnet · vale el doble</span>' : "") + (ask ? '<p class="ff-ask">' + esc(ask) + "</p>" : "") + '<p class="ff-q">' + textoQ() + "</p>";
      ban.classList.toggle("oro", !!r.oro);
      medirTecho();
    };

    /* ---- cortar ---- */
    var esCorrecta = function(f){ return ola.tipo === "orden" ? norm(f.t) === norm(ola.correcta[ola.paso]) : f.ok; };
    var cortables = function(){ return frutas.filter(function(f){ return f.activa && f.vivo && f.disuelve < 0; }); };
    var toca = function(f, x, y){
      var dx = x - f.x, dy = y - f.y;
      if (dx * dx + dy * dy <= f.r * f.r) return true;
      var py = f.y + f.r * .12;
      return Math.abs(dx) <= f.w / 2 && Math.abs(y - py) <= 17;
    };
    var golpes = function(a, b){
      var dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), n = Math.max(1, Math.ceil(d / 8)), out = [];
      cortables().forEach(function(f){ for (var i = 0; i <= n; i++) { if (toca(f, a.x + dx * i / n, a.y + dy * i / n)) { out.push({ f: f, i: i }); break; } } });
      return out.sort(function(p, q){ return p.i - q.i; }).map(function(p){ return p.f; });
    };
    var procesa = function(hits, ang){
      if (!ola || ola.hecho || estado !== "juega" || !hits.length) return;
      if (ola.tipo === "orden") {
        for (var i = 0; i < hits.length; i++) { if (esCorrecta(hits[i])) pasoOrden(hits[i], ang); else return fallo(hits[i], ang); if (ola.hecho) return; }
        return;
      }
      var mala = hits.find(function(f){ return !f.ok; });
      if (mala) return fallo(mala, ang);
      hits.forEach(function(f){ if (!ola.hecho) bien(f, ang); });
    };

    var parte = function(f, ang, malo){
      f.vivo = false;
      var nx = -Math.sin(ang), ny = Math.cos(ang);
      [1, -1].forEach(function(l){ mitades.push({ spr: f.spr, x: f.x, y: f.y, vx: f.vx * .6 + nx * l * 90, vy: Math.min(f.vy, 0) * .3 - 60, g: 900, rot: f.rot, vr: l * 3, a: ang, l: l, r: f.r, vida: 1.1 }); });
      var n = mov ? 4 : 14, col = malo ? "#FF4D5E" : f.spr.jugo;
      for (var i = 0; i < n; i++) { var a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 260; gotas.push({ x: f.x, y: f.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, r: 2 + Math.random() * 3.5, c: col, vida: .6 + Math.random() * .4 }); }
      G.sfx("corte");
    };
    var pop = function(x, y, t, c){ pops.push({ x: x, y: y, t: t, c: c || "#FFD200", vida: 1 }); };

    var acierto = function(f, rapidez){
      var doble = (ola.reto.oro ? 2 : 1) * (frenesi > 0 ? 2 : 1), g = pts.acierto(rapidez, doble);
      if (trazo) trazo.gan.push(g);
      pop(f.x, f.y - f.r - 10, "+" + g + (pts.mult() > 1 ? "  ×" + pts.mult() : ""), ola.reto.oro ? "#FFE066" : "#FFD200");
      G.sfx("bien", pts.racha); G.vibra(12); dir.acierto();
      if (pts.racha % 10 === 0) empiezaFrenesi();
      else if (pts.racha === 3 || pts.racha === 6) G.mz(mzEl, "bien", pts.racha === 3 ? "¡Combo ×2!" : "¡Combo ×3!");
      else if (Math.random() < .25) G.mz(mzEl, "bien", ["¡Bien!", "Parfait !", "Bravo !", "¡Eso!"][Math.floor(Math.random() * 4)]);
    };
    var bien = function(f, ang){
      parte(f, ang, false);
      if (ola.tipo === "uno") {
        acierto(f, 1 - (tJ - f.naceJ) / ola.T);
        if (ola.reto.oro) G.carnetBien(ola.reto.key);
        cierra(ola.reto.tipo === "error" && ola.fase === 1 ? { reto: ola.reto, fase: 2 } : null);
      } else {
        acierto(f, 1 - (tJ - f.naceJ) / ola.T);
        if (++ola.cortadasOk >= ola.objetivo) { if (ola.reto.oro) G.carnetBien(ola.reto.key); cierra(null); }
      }
    };
    var pasoOrden = function(f, ang){
      parte(f, ang, false);
      ola.paso++; G.sfx("paso", ola.paso); pts.extra(20); pop(f.x, f.y - f.r - 10, "+20", "#93C5FD");
      if (ola.paso >= ola.correcta.length) { acierto(f, 1 - ola.t / ola.T); if (ola.reto.oro) G.carnetBien(ola.reto.key); cierra(null); }
      else pintaBan();
    };
    var cierra = function(siguiente){
      ola.hecho = true; ola.siguiente = siguiente; resueltos++;
      frutas.forEach(function(x){ if (x.vivo && x.activa) x.disuelve = .3; if (!x.activa) x.vivo = false; });
    };
    var empiezaFrenesi = function(){ frenesi = 5; el.classList.add("ff-fr"); G.sfx("frenesi"); G.vibra([20, 30, 20]); G.mz(mzEl, "frenesi", "¡Frenesí!"); };

    var sacude = function(){ if (mov) return; el.classList.remove("ff-sh"); void el.offsetWidth; el.classList.add("ff-sh"); };
    var correccion = function(){
      var r = ola.reto;
      if (r.tipo === "error") return { etiqueta: "El arreglo", bien: r.correcta[0] + " → " + r.fix.correcta[0] };
      if (ola.tipo === "orden") return { etiqueta: "La frase", bien: ola.correcta.join(" ") };
      if (ola.tipo === "varios") return { etiqueta: r.q, bien: r.correcta.join(" · ") };
      return { etiqueta: "Correcta", bien: ola.correcta[0] };
    };
    var anota = function(mal, c){
      var r = ola.reto, e = { q: r.audio ? "Sonó: " + r.audio : r.q, ask: r.ask, mal: mal, etiqueta: c.etiqueta, bien: c.bien, why: r.why };
      if (!errores.some(function(x){ return x.q === e.q && x.bien === e.bien; })) errores.push(e);
    };
    var fallo = function(f, ang){
      if (trazo && trazo.gan.length) { trazo.gan.forEach(function(g){ pts.pts -= g; pts.aciertos--; }); trazo.gan = []; }
      f.flash = 1; parte(f, ang, true);
      pts.fallo(); vidas--; dir.error(); G.sfx("mal"); G.vibra([40, 40, 70]); sacude(); G.mz(mzEl, "mal", vidas ? "Casi…" : "¡Ay!");
      pop(f.x, f.y - f.r - 10, "✕", "#FF6B78");
      var c = correccion(), r = ola.reto;
      anota(f.t, c);
      if (r.key && G.alCarnet(r.key, r.hab)) alCarnet++;
      repetir(Object.assign({}, r));
      ola.hecho = true;
      momento({ mal: f.t, etiqueta: c.etiqueta, bien: c.bien, why: r.why }, function(){
        frutas = []; ola = null; espera = .35;
        if (vidas <= 0) termina(true);
      });
    };
    var escapa = function(){
      var c = correccion(), r = ola.reto;
      pts.corta(); pts.fallos++; dir.error(); G.sfx("escapa");
      anota(null, c); repetir(Object.assign({}, r));
      momento({ titulo: ola.tipo === "orden" ? "La frase quedó incompleta" : ola.tipo === "varios" ? "Se te escaparon algunas" : "Se te escapó la correcta", etiqueta: c.etiqueta, bien: c.bien, why: r.why, clase: "escapa" }, function(){ frutas = []; ola = null; espera = .3; });
    };
    var momento = function(o, luego){
      estado = "momento"; trazo = null;
      G.momento(el, o, function(){ if (estado === "fin") return; estado = "juega"; luego(); });
    };

    /* ---- bucle ---- */
    var paso = function(dt){
      tJ += dt;
      var s = Math.floor(tJ); while (traza.length <= s) traza.push(pts.pts);
      if (frenesi > 0) { frenesi -= dt; if (frenesi <= 0) { frenesi = 0; el.classList.remove("ff-fr"); G.mz(mzEl, "idle"); } }
      var d = dt * (frenesi > 0 ? .5 : 1);
      if (!ola) { espera -= dt; if (espera <= 0) lanzar(siguienteReto()); }
      else {
        ola.t += d;
        frutas.forEach(function(f){
          if (!f.activa) { if (!ola.hecho && ola.t >= f.nace) { f.activa = true; f.naceJ = tJ; } else return; }
          if (!f.vivo) return;
          f.vy += f.g * d; f.x += f.vx * d; f.y += f.vy * d; f.rot += f.vr * d;
          var xl = limitaX(f.x, f.w, f.r); if (xl !== f.x) { f.x = xl; f.vx = 0; }
          if (f.disuelve >= 0) { f.disuelve -= dt; if (f.disuelve < 0) f.vivo = false; }
          else if (f.vy > 0 && f.y > H + f.r + 12) f.vivo = false;
        });
        separa();
        var quedan = frutas.some(function(f){ return f.vivo; });
        if (!quedan && estado === "juega") {
          if (ola.hecho) { var sg = ola.siguiente; ola = null; espera = .3; if (sg) { espera = 0; lanzar(sg.reto, sg.fase); } }
          else escapa();
        }
      }
      if (!sinT && tJ >= seg) termina(false);
      else if (sinT && resueltos >= META && !ola) termina(false);
    };
    /* dos etiquetas a la misma altura se empujan hacia los lados: siempre se pueden leer */
    var separa = function(){
      var v = frutas.filter(function(f){ return f.activa && f.vivo && f.disuelve < 0; });
      for (var i = 0; i < v.length; i++) for (var j = i + 1; j < v.length; j++) {
        var a = v[i], b = v[j];
        if (Math.abs(a.y - b.y) > 34) continue;
        var falta = (a.w + b.w) / 2 + 18 - Math.abs(a.x - b.x); if (falta <= 0) continue;
        var s = a.x <= b.x ? -1 : 1, xa = limitaX(a.x + s * falta / 2, a.w, a.r), xb = limitaX(b.x - s * falta / 2, b.w, b.r);
        var resto = (a.w + b.w) / 2 + 18 - Math.abs(xa - xb);
        if (resto > 0) { if (xa === a.x + s * falta / 2) xa = limitaX(xa + s * resto, a.w, a.r); else xb = limitaX(xb - s * resto, b.w, b.r); }
        a.x = xa; b.x = xb;
      }
    };
    var mueve = function(d){
      mitades = mitades.filter(function(h){ h.vy += h.g * d; h.x += h.vx * d; h.y += h.vy * d; h.vida -= d; return h.vida > 0 && h.y < H + 120; });
      gotas = gotas.filter(function(p){ p.vy += 700 * d; p.x += p.vx * d; p.y += p.vy * d; p.vida -= d; return p.vida > 0; });
      pops = pops.filter(function(p){ p.y -= 40 * d; p.vida -= d * 1.1; return p.vida > 0; });
      var ahora = performance.now(); rastro = rastro.filter(function(p){ return ahora - p.t < 160; });
    };

    var pill = function(x, y, w, h, rad){ ctx.beginPath(); ctx.moveTo(x + rad, y); ctx.arcTo(x + w, y, x + w, y + h, rad); ctx.arcTo(x + w, y + h, x, y + h, rad); ctx.arcTo(x, y + h, x, y, rad); ctx.arcTo(x, y, x + w, y, rad); ctx.closePath(); };
    var dibuja = function(){
      ctx.clearRect(0, 0, W, H);
      /* mitades */
      mitades.forEach(function(h){
        var S = h.r * 2.61, al = Math.max(0, Math.min(1, h.vida / .5));
        ctx.save(); ctx.globalAlpha = al; ctx.translate(h.x, h.y); ctx.rotate(h.a + h.vr * (1.1 - h.vida));
        ctx.beginPath(); ctx.rect(-S, h.l > 0 ? 0 : -S, 2 * S, S); ctx.clip();
        ctx.save(); ctx.rotate(-h.a + h.rot); if (h.spr.img.complete) ctx.drawImage(h.spr.img, -S / 2, -S / 2 - h.r * .06, S, S); ctx.restore();
        ctx.fillStyle = h.spr.pulpa; ctx.beginPath(); ctx.ellipse(0, 0, h.r * .88, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      /* frutas */
      var fs = fuente(), activas = frutas.filter(function(f){ return f.activa && f.vivo; });
      activas.forEach(function(f){
        var S = f.r * 2.61; ctx.save(); ctx.globalAlpha = f.disuelve >= 0 ? Math.max(0, f.disuelve / .3) : 1;
        if (f.oro && !mov) { ctx.fillStyle = "rgba(255,210,0,.18)"; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 1.45, 0, Math.PI * 2); ctx.fill(); }
        ctx.translate(f.x, f.y); ctx.rotate(f.rot); if (f.spr.img.complete) ctx.drawImage(f.spr.img, -S / 2, -S / 2 - f.r * .06, S, S); ctx.restore();
      });
      /* etiquetas (después, para que ninguna fruta tape una palabra) */
      ctx.font = "700 " + fs + "px Poppins, Inter, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      var orden = teclado ? activas.filter(function(f){ return f.disuelve < 0; }).sort(function(a, b){ return a.x - b.x; }) : [];
      activas.forEach(function(f){
        var y = f.y + f.r * .12, w = f.w, h = 30;
        ctx.save(); ctx.globalAlpha = f.disuelve >= 0 ? Math.max(0, f.disuelve / .3) : 1;
        ctx.fillStyle = "rgba(4,14,40,.45)"; pill(f.x - w / 2, y - h / 2 + 3, w, h, 15); ctx.fill();
        ctx.fillStyle = f.oro ? "#FFF6CC" : "#fff"; pill(f.x - w / 2, y - h / 2, w, h, 15); ctx.fill();
        if (f.oro) { ctx.lineWidth = 2.5; ctx.strokeStyle = "#E0A800"; ctx.stroke(); }
        ctx.fillStyle = "#0B2D74"; ctx.fillText(f.t, f.x, y + 1);
        var k = orden.indexOf(f);
        if (k >= 0 && k < 9) { ctx.fillStyle = "#0B2D74"; ctx.beginPath(); ctx.arc(f.x - w / 2 + 2, y - h / 2 + 2, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#FFD200"; ctx.font = "800 12px Poppins, Inter, system-ui, sans-serif"; ctx.fillText(String(k + 1), f.x - w / 2 + 2, y - h / 2 + 3); ctx.font = "700 " + fs + "px Poppins, Inter, system-ui, sans-serif"; }
        ctx.restore();
      });
      /* jugo */
      gotas.forEach(function(p){ ctx.globalAlpha = Math.max(0, Math.min(1, p.vida * 2)); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1;
      /* puntos flotantes */
      ctx.font = "800 20px Poppins, Inter, system-ui, sans-serif";
      pops.forEach(function(p){ ctx.globalAlpha = Math.max(0, Math.min(1, p.vida * 1.6)); ctx.lineWidth = 4; ctx.strokeStyle = "#081F55"; ctx.strokeText(p.t, p.x, p.y); ctx.fillStyle = p.c; ctx.fillText(p.t, p.x, p.y); });
      ctx.globalAlpha = 1;
      /* rastro del corte, en amarillo */
      if (rastro.length > 1) {
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        [[14, "rgba(255,210,0,.22)"], [6, "#FFD200"], [2, "#FFFBE0"]].forEach(function(s){
          ctx.lineWidth = s[0]; ctx.strokeStyle = s[1]; ctx.beginPath(); ctx.moveTo(rastro[0].x, rastro[0].y);
          for (var i = 1; i < rastro.length; i++) ctx.lineTo(rastro[i].x, rastro[i].y);
          ctx.stroke();
        });
      }
    };
    var estadoHud = function(){
      var s = Math.min(traza.length - 1, Math.floor(tJ)), fv = fan && fan.traza && fan.traza.length ? fan.traza[Math.min(fan.traza.length - 1, Math.max(0, s))] : null;
      hud.pinta({ vidas: vidas, resta: seg - tJ, sinTiempo: sinT, pts: pts.pts, avance: sinT ? resueltos / META : tJ / seg, mult: pts.mult(), racha: pts.racha, frenesi: frenesi > 0, fantasma: sinT ? null : fv });
    };
    var bucle = function(ts){
      raf = requestAnimationFrame(bucle);
      var dt = Math.min(.05, ult ? (ts - ult) / 1000 : 0); ult = ts;
      if (estado === "juega") { paso(dt); mueve(dt * (frenesi > 0 ? .5 : 1)); }
      else if (estado === "momento") mueve(dt * .5);
      dibuja(); estadoHud();
    };

    /* ---- entrada: dedo, ratón, teclado ---- */
    var punto = function(e){ var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };
    var baja = function(e){
      if (estado !== "juega") return;
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      var p = punto(e); trazo = { id: e.pointerId, u: p, gan: [] }; rastro = [p];
      procesa(cortables().filter(function(f){ return toca(f, p.x, p.y); }).slice(0, 1), -Math.PI / 4);
    };
    var mueveP = function(e){
      if (!trazo || e.pointerId !== trazo.id || estado !== "juega") return;
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!evs.length) evs = [e];
      evs.forEach(function(ev){ var p = punto(ev), a = trazo.u; if (Math.hypot(p.x - a.x, p.y - a.y) < 3) return; rastro.push(p); if (trazo) { procesa(golpes(a, p), Math.atan2(p.y - a.y, p.x - a.x)); if (trazo) trazo.u = p; } });
    };
    var sube = function(e){ if (trazo && e.pointerId === trazo.id) trazo = null; };
    cv.addEventListener("pointerdown", baja); cv.addEventListener("pointermove", mueveP);
    cv.addEventListener("pointerup", sube); cv.addEventListener("pointercancel", sube);
    var tecla = function(e){
      if (e.key === "Escape" || e.key === "p" || e.key === "P") { if (estado === "juega") { e.preventDefault(); pausar(); } return; }
      if (estado !== "juega" || !/^[1-9]$/.test(e.key)) return;
      teclado = true;
      var lista = cortables().sort(function(a, b){ return a.x - b.x; }), f = lista[+e.key - 1];
      if (f) { e.preventDefault(); trazo = null; rastro = [{ x: f.x - 40, y: f.y + 20, t: performance.now() }, { x: f.x + 40, y: f.y - 20, t: performance.now() }]; procesa([f], -.46); }
    };
    var oculta = function(){ if (document.hidden && estado === "juega") pausar(); };
    window.addEventListener("keydown", tecla); document.addEventListener("visibilitychange", oculta); window.addEventListener("resize", tam);
    var clic = function(e){
      var b = e.target.closest("[data-g],[data-f]"); if (!b) return;
      if (b.dataset.g === "pausa" && estado === "juega") pausar();
      if (b.dataset.f === "oir" && ola && ola.reto.audio) try { speak(ola.reto.audio); } catch (x) {}
    };
    el.addEventListener("click", clic);

    var pausar = function(){
      estado = "pausa"; trazo = null;
      G.pausa(el, function(){ ult = 0; estado = "juega"; }, function(){ destruye(); try { save(true); } catch (x) {} acciones.salir(); });
    };
    var termina = function(porVidas){
      if (estado === "fin") return;
      estado = "fin"; trazo = null; G.sfx("fin");
      traza.push(pts.pts);
      var r = { puntos: pts.pts, aciertos: pts.aciertos, fallos: pts.fallos, precision: pts.precision(), mejor: pts.mejor, termino: !porVidas, porVidas: porVidas,
        seg: tJ, traza: traza, errores: errores, alCarnet: alCarnet };
      r.mejorMult = r.mejor >= 10 ? 4 : r.mejor >= 6 ? 3 : r.mejor >= 3 ? 2 : 1;
      r.estrellas = G.estrellas(r, seg);
      var premio = G.premiar("ff", alc, r);
      G.mz(mzEl, "fin", porVidas ? "¡Otra vez!" : "¡Terminó!");
      setTimeout(function(){ destruye(); G.resultados(el, FF, alc, r, premio, acciones); }, porVidas ? 500 : 900);
    };
    var destruye = function(){
      cancelAnimationFrame(raf); raf = 0; estado = "fin";
      window.removeEventListener("keydown", tecla); document.removeEventListener("visibilitychange", oculta); window.removeEventListener("resize", tam);
      el.removeEventListener("click", clic);
      el.classList.remove("ff", "ff-fr", "ff-sh"); el.innerHTML = "";
    };

    /* para las pruebas: lo que hay en pantalla */
    FF.depura = function(){ return { estado: estado, vidas: vidas, pts: pts.pts, racha: pts.racha, tJ: tJ, techo: techo, W: W, H: H, ola: ola && { tipo: ola.tipo, fase: ola.fase, paso: ola.paso, correcta: ola.correcta, q: ola.reto.q, oro: !!ola.reto.oro },
      frutas: cortables().map(function(f){ return { t: f.t, ok: esCorrecta(f), x: Math.round(f.x), y: Math.round(f.y), w: Math.round(f.w) }; }) }; };
    tam();
    raf = requestAnimationFrame(bucle);
    G.cuenta(el, function(){ if (estado !== "cuenta") return; estado = "juega"; ult = 0; });
    return { destruye: destruye };
  }

  /* ---------------- pantallas: arcade (elegir) y portada del juego ---------------- */
  var HB = { track: null };
  var cursoInicial = function(){ var t = null; try { t = localStorage.getItem("plxg-track"); } catch (e) {} if (!t) try { t = track; } catch (e) {} return TRACKS.some(function(x){ return x.id === t; }) ? t : TRACKS[0].id; };
  var X = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var ATRAS = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var frutasDeco = function(n){ return FRUTAS.slice(0, n).map(function(f, i){ return '<img src="' + f.url + '" alt="" style="--i:' + i + '">'; }).join(""); };
  var fila = function(alc, extra){
    var n = nRetos(alc), rec = G.record("ff", alc), est = alc.unit ? G.estrellasUnidad(alc.track, alc.unit) : rec ? rec.est || 0 : 0;
    return '<button class="hb-u" data-h="alc" data-k="' + esc(alc.clave) + '"' + (n < MIN ? " disabled" : "") + ">" +
      '<span class="hb-ut"><b>' + esc(alc.titulo) + "</b><small>" + (n < MIN ? "Pocos ejercicios para este juego" : n + " retos" + (rec ? " · récord " + rec.best.toLocaleString("es-CO") : "")) + (extra || "") + "</small></span>" +
      G.estrellasHTML(est) + "</button>";
  };
  var ALC = {};
  var hub = function(el){
    var tr = HB.track || (HB.track = cursoInicial()), nv = G.DIF[G.nivel(tr)].nombre, us = unidades(tr);
    ALC = {};
    var todo = alcCurso(tr); ALC[todo.clave] = todo;
    var filas = us.map(function(u){ var a = alcUnidad(tr, u); ALC[a.clave] = a; return fila(a); }).join("");
    var voc = "", temas = ((window.__VOCAB || {})[tr] || { themes: [] }).themes;
    if (window.__VOCAB) voc = temas.length ? temas.map(function(t, i){ var a = alcVocab(tr, i); ALC[a.clave] = a; return fila(a, " · con audio"); }).join("") : '<p class="hb-nota">Este curso no tiene vocabulario todavía.</p>';
    else voc = '<p class="hb-nota">Cargando el vocabulario…</p>';
    var totalEst = 0; try { Object.keys((S.arcade || {}).est || {}).forEach(function(k){ totalEst += S.arcade.est[k]; }); } catch (e) {}
    el.innerHTML = '<div class="plxg-scroll"><div class="plxg-wrap hb">' +
      '<div class="hb-top"><button class="plxg-ib" data-h="salir" aria-label="Cerrar el arcade">' + X + '</button><span class="plxg-k">PLEX PLAY</span></div>' +
      '<h1 class="plxg-h">Arcade</h1>' +
      '<p class="hb-lead">Juegos cortos con el francés de tus lecciones. Para ganar hay que entender: tocar al azar te quita vidas. Fallar nunca te quita XP.</p>' +
      '<div class="hb-game" style="--ac:' + FF.color + '"><div class="hb-fr">' + frutasDeco(4) + '</div><div><p class="plxg-k">Reflejos' + (totalEst ? " · " + totalEst + " estrellas" : "") + "</p><h2>" + FF.nombre + "</h2><p>" + FF.verbo + ". Deja pasar las demás.</p></div></div>" +
      '<h2 class="plxg-h2">Curso</h2><div class="hb-tracks" role="tablist" aria-label="Curso">' +
        TRACKS.map(function(t){ return '<button role="tab" aria-selected="' + (t.id === tr) + '" class="hb-tr' + (t.id === tr ? " on" : "") + '" data-h="tr" data-t="' + t.id + '">' + esc(t.label.replace(/^Francés /, "")) + "</button>"; }).join("") + "</div>" +
      '<h2 class="plxg-h2">Unidad <small>' + esc(etiquetaCurso(tr)) + " · velocidad " + nv + "</small></h2>" +
      '<div class="hb-units">' + fila(todo) + filas + "</div>" +
      '<h2 class="plxg-h2">Vocabulario <small>suena la palabra y cortas la que oíste</small></h2><div class="hb-units">' + voc + "</div>" +
    "</div></div>";
    var sel = el.querySelector(".hb-tr.on"), fila2 = el.querySelector(".hb-tracks"); if (sel && fila2) fila2.scrollLeft = sel.offsetLeft - fila2.clientWidth / 2 + sel.offsetWidth / 2;
    if (!window.__VOCAB) G.vocab().then(function(){ if (el.querySelector(".hb")) { var y = el.querySelector(".plxg-scroll").scrollTop; hub(el); el.querySelector(".plxg-scroll").scrollTop = y; } }).catch(function(){ var n = el.querySelector(".hb-nota"); if (n) n.textContent = "El vocabulario no se pudo cargar sin conexión."; });
  };

  var portada = function(el, alc, desdeHub){
    var rec = G.record("ff", alc), nv = G.DIF[G.nivel(alc.track)], n = nRetos(alc);
    var reglas = [
      (G.aj.sinTiempo ? "Sin tiempo: " + (alc.repaso ? 10 : 15) + " retos" : alc.seg + " segundos") + " y 3 vidas.",
      alc.tema ? "Suena una palabra: córtala. Las demás se dejan pasar." : "Corta la fruta con la respuesta correcta y deja pasar las demás.",
      "Cortar una incorrecta quita una vida y te muestra la corrección.",
      "10 aciertos seguidos: frenesí, cámara lenta y puntos dobles."
    ];
    if (!alc.tema) reglas.push("Frutas doradas: errores de tu carnet. Valen el doble.");
    var sw = function(k, t, d){ return '<button class="pt-sw" role="switch" aria-checked="' + !!G.aj[k] + '" data-h="aj" data-a="' + k + '"><span><b>' + t + "</b><small>" + d + "</small></span><i></i></button>"; };
    el.innerHTML = '<div class="plxg-scroll"><div class="plxg-wrap pt" style="--ac:' + FF.color + '">' +
      '<div class="hb-top"><button class="plxg-ib" data-h="' + (desdeHub ? "hub" : "salir") + '" aria-label="' + (desdeHub ? "Volver" : "Cerrar") + '">' + (desdeHub ? ATRAS : X) + '</button><span class="plxg-k">' + esc(alc.sub || "") + "</span></div>" +
      '<div class="pt-fr" aria-hidden="true">' + frutasDeco(6) + "</div>" +
      '<h1 class="plxg-h pt-h">' + FF.nombre + "</h1>" +
      '<p class="pt-verbo">' + FF.verbo + ".</p>" +
      '<p class="pt-u"><b>' + esc(alc.titulo) + "</b><span>" + n + " retos · velocidad " + nv.nombre + "</span></p>" +
      '<ol class="pt-reglas">' + reglas.map(function(r){ return "<li>" + esc(r) + "</li>"; }).join("") + "</ol>" +
      '<div class="pt-rec">' + (rec ? '<div><small>Tu récord</small><b>' + rec.best.toLocaleString("es-CO") + "</b></div>" + G.estrellasHTML(rec.est || 0) + '<p>Tu fantasma corre contigo: arriba verás si vas por encima o por debajo de tu récord.</p>'
        : "<p>Aún no tienes récord aquí. Tu primera partida será el fantasma a vencer.</p>") + "</div>" +
      '<div class="pt-aj">' + sw("sonido", "Sonido", "Efectos del juego") + sw("sinTiempo", "Sin tiempo", "Sin reloj y más lento") + (navigator.vibrate ? sw("vibrar", "Vibración", "Al cortar y al fallar") : "") + "</div>" +
      '<button class="plxg-btn pt-go" data-h="jugar">Jugar</button>' +
    "</div></div>";
    el.querySelector(".pt-go").focus({ preventScroll: true });
  };

  var juego = null;
  var abrirArcade = function(alc){
    var el = G.abrir(function(){ if (juego) { juego.destruye(); juego = null; } });
    var actual = null, desdeHub = !alc;
    var acciones = {
      otra: function(){ jugar(actual); },
      cambiar: function(){ hub(el); },
      salir: function(){ if (desdeHub) hub(el); else G.cerrar(); }
    };
    var jugar = function(a){ actual = a; G.despiertaAudio(); juego = partida(el, a, acciones); };
    acciones.cambiar = desdeHub ? function(){ hub(el); } : null;
    el.onclick = function(e){
      var b = e.target.closest("[data-h]"); if (!b || b.disabled) return;
      var h = b.dataset.h;
      if (h === "salir") return G.cerrar();
      if (h === "hub") return hub(el);
      if (h === "tr") { HB.track = b.dataset.t; try { localStorage.setItem("plxg-track", HB.track); } catch (x) {} hub(el); el.querySelector(".plxg-scroll").scrollTop = 0; return; }
      if (h === "alc") { actual = ALC[b.dataset.k]; if (actual) portada(el, actual, true); return; }
      if (h === "aj") { var k = b.dataset.a; G.aj[k] = !G.aj[k]; G.guardaAj(); b.setAttribute("aria-checked", String(G.aj[k])); if (k === "sinTiempo") portada(el, actual, desdeHub); if (k === "sonido" && G.aj.sonido) G.sfx("tic"); return; }
      if (h === "jugar") return jugar(actual);
    };
    if (alc) { actual = alc; portada(el, alc, false); } else hub(el);
  };
  G.arcade = abrirArcade;

  /* ---------------- pestaña Retos: sección Arcade ---------------- */
  var tarjeta = function(){
    var est = 0; try { Object.keys((S.arcade || {}).est || {}).forEach(function(k){ est += S.arcade.est[k]; }); } catch (e) {}
    return '<h2 class="rg-h">Arcade <span class="am-new">Nuevo</span></h2>' +
      '<button class="plx46-arc" data-arcade="1"><span class="a-fr" aria-hidden="true">' + frutasDeco(5) + "</span>" +
      '<span class="a-tx"><small>Juego de reflejos · A1 a C1</small><b>Fruit Frenzy</b><span>Corta la palabra correcta antes de que caiga.' + (est ? " " + est + " estrellas ganadas." : "") + "</span></span>" +
      '<span class="a-go">Jugar</span></button>';
  };
  var enRetos = function(){
    var v = document.getElementById("view"), sec = v && v.querySelector(".gretos"); if (!sec || sec.querySelector(".plx46-arc")) return;
    var ancla = sec.querySelector(".am-feat"), h = ancla && ancla.previousElementSibling;
    if (h && h.classList.contains("rg-h")) h.insertAdjacentHTML("beforebegin", tarjeta());
    else { var t = sec.querySelector(".v1-card") || sec.querySelector("h1"); if (t) t.insertAdjacentHTML("afterend", tarjeta()); }
  };
  var _render = render;
  render = function(){ var r = _render.apply(this, arguments); try { if (view === "retos") enRetos(); } catch (e) {} return r; };
  document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest("[data-arcade]"); if (!b) return; e.preventDefault(); abrirArcade(null); });
  try { if (view === "retos") enRetos(); } catch (e) {}

  /* ---------------- final de la lección: «Jugar el repaso» ---------------- */
  var repaso = function(){
    var pl = document.getElementById("player"); if (!pl || pl.hidden || pl.querySelector(".plx46-rep")) return;
    if (typeof P === "undefined" || !P || P.mode !== "lesson" || !P.lesson || P.phase !== "end") return;
    var a = alcLeccion(P.lesson); if (nRetos(a) < MIN) return;
    var html = '<button class="plx46-rep" data-repaso="' + esc(P.lesson.id) + '"><span class="r-fr" aria-hidden="true">' + frutasDeco(3) + "</span>" +
      '<span class="r-tx"><small>Arcade · 60 s</small><b>Jugar el repaso</b><span>Fruit Frenzy con lo de esta lección</span></span><span class="r-go" aria-hidden="true">›</span></button>';
    /* la pantalla final de plx31 tiene «Sigue practicando»; si no está, va sobre los botones */
    var ex = pl.querySelector(".plx-endx .ex-row"), pfa = pl.querySelector(".pf .pfa");
    if (ex) ex.insertAdjacentHTML("beforebegin", html);
    else if (pfa) pfa.insertAdjacentHTML("beforebegin", html);
  };
  new MutationObserver(repaso).observe(document.getElementById("player") || document.body, { childList: true, subtree: true });
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-repaso]"); if (!b) return;
    var l = LESSONS.find(function(x){ return x.id === b.dataset.repaso; }); if (!l) return;
    e.preventDefault(); e.stopPropagation(); abrirArcade(alcLeccion(l));
  }, true);

  /* ---------------- estilos ---------------- */
  var st = document.createElement("style"); st.id = "plx46";
  st.textContent = `
  /* juego */
  .plxg.ff{touch-action:none;user-select:none;-webkit-user-select:none}
  .ff-cv{position:absolute;inset:0;z-index:1;touch-action:none;display:block}
  .plxg.ff.ff-sh .ff-cv{animation:ffSh .32s}
  @keyframes ffSh{0%,100%{transform:none}20%{transform:translate(-7px,2px)}40%{transform:translate(6px,-3px)}60%{transform:translate(-4px,1px)}80%{transform:translate(3px,0)}}
  .plxg.ff::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;box-shadow:inset 0 0 0 0 rgba(255,122,69,0);transition:box-shadow .4s}
  .plxg.ff.ff-fr::after{box-shadow:inset 0 0 90px 10px rgba(255,122,69,.55)}
  .ff-ban{position:absolute;z-index:3;left:12px;right:12px;top:calc(env(safe-area-inset-top) + 104px);max-width:560px;margin:0 auto;pointer-events:none;
    background:rgba(4,14,40,.72);border:1px solid rgba(147,197,253,.22);border-radius:16px;padding:10px 14px 12px;text-align:center;
    -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
  .ff-ban.oro{border-color:#FFD200;box-shadow:0 0 0 1px #FFD200,0 0 24px -6px rgba(255,210,0,.6)}
  .ff-ban p{margin:0}
  .ff-ask{font:600 12.5px/1.35 Inter,system-ui,sans-serif;color:#A9C4FF;margin-bottom:4px!important}
  .ff-q{font:700 clamp(18px,5.2vw,23px)/1.3 Poppins,system-ui,sans-serif;color:#fff;overflow-wrap:anywhere}
  .ff-q .hueco{color:#FFD200;letter-spacing:.04em}
  .ff-q s{color:#FF9EA2;text-decoration-thickness:2px}
  .ff-q .cat{display:inline-block;background:#FFD200;color:#081F55;padding:2px 12px;border-radius:10px}
  .ff-q .tr{display:block;font:600 14px/1.35 Inter,system-ui,sans-serif;color:#C9D6F5;margin-bottom:4px}
  .ff-q .arma{display:block;min-height:1.3em}
  .ff-oro{display:inline-block;margin-bottom:6px;font:800 10.5px/1 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#081F55;background:#FFD200;padding:5px 8px;border-radius:999px}
  .ff-oir{all:unset;pointer-events:auto;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:12px;background:#FFD200;color:#081F55!important;font:800 15px/1 Poppins,system-ui,sans-serif}
  .ff-oir svg{width:20px;height:20px;fill:#081F55}
  .ff-oir:focus-visible{outline:3px solid #93C5FD;outline-offset:3px}

  /* arcade y portada */
  .hb-top{display:flex;align-items:center;gap:12px;margin-bottom:18px}
  .hb-top .plxg-k{margin:0}
  .hb-lead{margin:10px 0 18px;color:#C9D6F5;max-width:46ch}
  .hb-game{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;padding:16px;border-radius:20px;background:linear-gradient(135deg,rgba(255,122,69,.22),rgba(255,210,0,.08));box-shadow:inset 0 0 0 2px var(--ac)}
  .hb-game h2{margin:0;font:800 24px/1.05 Poppins,system-ui,sans-serif;text-transform:uppercase;color:#fff}
  .hb-game p{margin:4px 0 0;color:#EEF3FF;font-size:14px}
  .hb-game .plxg-k{margin:0 0 4px;color:#FFD200}
  .hb-fr{position:relative;width:84px;height:70px}
  .hb-fr img{position:absolute;width:44px;height:44px;left:calc(var(--i) * 13px);top:calc(12px + (var(--i) - 1.5) * (var(--i) - 1.5) * 5px)}
  .hb-tracks{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;margin:0 -2px;scrollbar-width:none}
  .hb-tracks::-webkit-scrollbar{display:none}
  .hb-tr{all:unset;cursor:pointer;flex:none;padding:9px 14px;border-radius:999px;font:700 13.5px/1 Inter,system-ui,sans-serif;color:#C9D6F5;box-shadow:inset 0 0 0 1.5px #2A4A8E;white-space:nowrap}
  .hb-tr.on{background:#FFD200;color:#081F55;box-shadow:none}
  .hb-tr:focus-visible,.hb-u:focus-visible,.pt-sw:focus-visible{outline:3px solid #93C5FD;outline-offset:2px}
  .hb-units{display:grid;gap:8px}
  .hb-u{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:14px;background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(147,197,253,.16)}
  .hb-u:hover{background:rgba(255,255,255,.1)}
  .hb-u[disabled]{opacity:.45;cursor:default}
  .hb-ut{flex:1;min-width:0;display:grid;gap:2px}
  .hb-ut b{font:700 15px/1.3 Poppins,system-ui,sans-serif;color:#fff}
  .hb-ut small{font-size:12.5px;color:#A6B6E0}
  .hb-nota{margin:0;color:#A6B6E0;font-size:14px}
  .pt-fr{position:relative;height:74px;margin:-6px 0 6px}
  .pt-fr img{position:absolute;width:58px;height:58px;left:calc(var(--i) * 15%);top:calc(8px + (var(--i) - 2.5) * (var(--i) - 2.5) * 3px);animation:ptFl 3s ease-in-out infinite alternate;animation-delay:calc(var(--i) * -.5s)}
  @keyframes ptFl{from{transform:translateY(0) rotate(-8deg)}to{transform:translateY(-8px) rotate(8deg)}}
  .pt-h{color:#FFD200;font-size:clamp(38px,12vw,56px)}
  .pt-verbo{margin:6px 0 0;font:700 18px/1.3 Poppins,system-ui,sans-serif;color:#fff}
  .pt-u{margin:16px 0 0;padding:12px 0;border-top:1px solid #2A4A8E;border-bottom:1px solid #2A4A8E;display:grid;gap:2px}
  .pt-u b{font:700 16px/1.3 Poppins,system-ui,sans-serif;color:#fff}
  .pt-u span{font-size:13px;color:#A6B6E0}
  .pt-reglas{margin:14px 0 0;padding:0;list-style:none;counter-reset:r;display:grid;gap:8px}
  .pt-reglas li{counter-increment:r;display:grid;grid-template-columns:26px 1fr;gap:8px;color:#DCE6FF;font-size:14.5px}
  .pt-reglas li::before{content:counter(r);font:800 13px/24px Poppins,system-ui,sans-serif;text-align:center;width:24px;height:24px;border-radius:8px;background:rgba(255,210,0,.16);color:#FFD200}
  .pt-rec{margin:18px 0 0;padding:14px;border-radius:16px;background:rgba(255,255,255,.06);display:grid;grid-template-columns:1fr auto;align-items:center;gap:6px 12px}
  .pt-rec small{display:block;font:700 10.5px Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#A6B6E0}
  .pt-rec b{font:800 28px/1 Poppins,system-ui,sans-serif;color:#FFD200}
  .pt-rec p{grid-column:1/-1;margin:0;font-size:13.5px;color:#C9D6F5}
  .pt-aj{margin:14px 0 20px;display:grid;gap:8px}
  .pt-sw{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:14px;box-shadow:inset 0 0 0 1px rgba(147,197,253,.16)}
  .pt-sw span{flex:1;display:grid}
  .pt-sw b{font:700 14.5px/1.3 Inter,system-ui,sans-serif;color:#fff}
  .pt-sw small{font-size:12px;color:#A6B6E0}
  .pt-sw i{width:44px;height:26px;border-radius:999px;background:#2A4A8E;position:relative;transition:background .2s}
  .pt-sw i::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}
  .pt-sw[aria-checked=true] i{background:#15803D}
  .pt-sw[aria-checked=true] i::after{transform:translateX(18px)}
  .pt-go{width:100%;min-height:58px;font-size:18px;position:sticky;bottom:calc(14px + env(safe-area-inset-bottom));z-index:2}

  /* tarjeta en Retos (mismos colores en claro y oscuro) */
  .plx46-arc{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;width:100%;margin:0 0 6px;padding:16px 18px;border-radius:22px;position:relative;overflow:hidden;
    background:radial-gradient(120% 140% at 0% 0%,#1E5BD7 0%,#0B2D74 45%,#081F55 100%);color:#fff;box-shadow:inset 0 0 0 1px rgba(147,197,253,.28),0 16px 30px -22px rgba(8,31,85,.9)}
  .plx46-arc:hover .a-go{transform:translateX(3px)}
  .plx46-arc:focus-visible{outline:3px solid #FFD200;outline-offset:3px}
  .plx46-arc .a-fr{position:relative;width:86px;height:64px}
  .plx46-arc .a-fr img{position:absolute;width:40px;height:40px;left:calc(var(--i) * 11px);top:calc(10px + (var(--i) - 2) * (var(--i) - 2) * 4px)}
  .plx46-arc .a-tx{display:grid;gap:3px;min-width:0}
  .plx46-arc small{font:700 10.5px/1.3 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#FFD200}
  .plx46-arc b{font:800 22px/1 Poppins,system-ui,sans-serif;text-transform:uppercase;letter-spacing:-.01em;color:#fff}
  .plx46-arc .a-tx>span{font-size:13.5px;line-height:1.4;color:#DCE6FF}
  .plx46-arc .a-go{padding:10px 14px;border-radius:12px;background:#FFD200;color:#081F55;font:800 14px/1 Poppins,system-ui,sans-serif;text-transform:uppercase;transition:transform .15s}
  @media (max-width:520px){.plx46-arc{grid-template-columns:auto 1fr;padding:14px}.plx46-arc .a-go{display:none}.plx46-arc .a-fr{width:64px;height:56px}.plx46-arc .a-fr img{width:34px;height:34px;left:calc(var(--i) * 7px)}}
  .plx46-rep{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;width:100%;margin:0 0 8px;padding:12px 14px;border-radius:16px;
    background:radial-gradient(120% 160% at 0% 0%,#1E5BD7 0%,#0B2D74 50%,#081F55 100%);color:#fff;box-shadow:inset 0 0 0 1px rgba(147,197,253,.28),0 12px 24px -18px rgba(8,31,85,.9)}
  .plx46-rep:focus-visible{outline:3px solid #FFD200;outline-offset:3px}
  .plx46-rep .r-fr{position:relative;width:54px;height:40px}
  .plx46-rep .r-fr img{position:absolute;width:30px;height:30px;left:calc(var(--i) * 12px);top:calc(4px + (var(--i) - 1) * (var(--i) - 1) * 4px)}
  .plx46-rep .r-tx{display:grid;gap:1px;min-width:0}
  .plx46-rep small{font:700 10px/1.3 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#FFD200}
  .plx46-rep b{font:800 16px/1.2 Poppins,system-ui,sans-serif;color:#fff}
  .plx46-rep .r-tx>span{font-size:12.5px;color:#DCE6FF}
  .plx46-rep .r-go{font:800 26px/1 Poppins,system-ui,sans-serif;color:#FFD200}
  .pfa .plx46-rep{margin:0 0 10px}
  @media (prefers-reduced-motion:reduce){.pt-fr img{animation:none}}
  `;
  document.head.appendChild(st);
})();
