/* PLEX PLAY 2.7.0 — Grammar Run: runner fluido en canvas, con perspectiva
   - Todo el escenario se dibuja en un <canvas> (nada de mover elementos del DOM en cada cuadro): el muelle del
     Sena en perspectiva que se pierde hacia la derecha, París al fondo con paralaje, baldosas y líneas de carril
     que pasan a toda velocidad, faroles y objetos de decoración, monedas y las cartas de respuesta que crecen al
     acercarse. Manzana corre (5 cuadros), salta al acertar y se marea al fallar; el cambio de carril es suave.
   - El escenario tiene tamaño fijo: no cambia cuando la pregunta tiene una o dos líneas.
   - Controles: ← → o ↑ ↓ (y W / S) cambian de carril; Espacio acelera. En el celular: tocar el carril, deslizar
     arriba o abajo, o los botones. Respeta «reducir movimiento». */
(function(){
  "use strict";
  var G = window.PLXG; if (!G || !G.juegos || !G.juegos.gr) return;
  var esc = G.esc, mezcla = G.mezcla;
  var IMG = "img/runner/";
  var fx = function(n){ try { if (G.fx) G.fx(n); } catch (e) {} };
  var chispas = function(s, x, y, o){ try { if (s.efectos) s.efectos.estalla(x, y, o); } catch (e) {} };
  var suena = function(t){ if (!t) return; try { var p = speak(t); if (p && p.catch) p.catch(function(){}); } catch (e) {} };
  var calla = function(){ try { if (typeof stopAudio === "function") stopAudio(); } catch (e) {} };
  var entre = function(a, x, b){ return Math.max(a, Math.min(b, x)); };
  var BOCINA = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  var tactil = function(){ try { return matchMedia("(pointer:coarse)").matches; } catch (e) { return false; } };

  /* ---- imágenes (se cargan una vez y se reusan entre partidas) ---- */
  var SPR = {}, PROPS = ["jardinera", "basura", "paloma", "maletas", "caja", "cono", "valla"];
  var cargaTodo = function(){
    if (SPR.corre) return;
    ["corre", "salta", "mareo", "paris-tira", "moneda", "estrella"].concat(PROPS).forEach(function(n){ var i = new Image(); i.decoding = "async"; i.src = IMG + n + ".webp"; SPR[n] = i; });
  };
  var ok = function(i){ return i && i.complete && i.naturalWidth > 0; };

  /* ---- tarjeta de respuesta pintada una vez en un canvas aparte ---- */
  var ESTILOS = {
    norm: { bg: "#FFF8EA", borde: "#E3D2B0", pie: "#D5C09A", txt: "#0B2D74", ancho: 2 },
    sel:  { bg: "#FFFFFF", borde: "#22C55E", pie: "#16A34A", txt: "#0B2D74", ancho: 4, brillo: "rgba(34,197,94,.35)" },
    bien: { bg: "#16A34A", borde: "#0E7A36", pie: "#0E6B30", txt: "#FFFFFF", ancho: 3 },
    mal:  { bg: "#FEE2E2", borde: "#F87171", pie: "#E5A3A3", txt: "#991B1B", ancho: 3 }
  };
  var rrect = function(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  var parte = function(c, texto, max){
    var ws = String(texto).split(/\s+/), lin = [], cur = "";
    ws.forEach(function(w){ var p = cur ? cur + " " + w : w; if (c.measureText(p).width > max && cur) { lin.push(cur); cur = w; } else cur = p; });
    if (cur) lin.push(cur); return lin;
  };
  var tarjeta = function(texto, estilo, maxW, dpr){
    var e = ESTILOS[estilo], m = document.createElement("canvas"), c = m.getContext("2d"), pad = 14, fs = 17, lin;
    for (;;) { c.font = "800 " + fs + "px Poppins, system-ui, sans-serif"; lin = parte(c, texto, maxW - pad * 2); if (lin.length <= 2 || fs <= 12) break; fs--; }
    var tw = Math.max.apply(null, lin.map(function(l){ return c.measureText(l).width; }));
    var w = Math.ceil(Math.max(92, tw + pad * 2)), lh = fs * 1.2, h = Math.ceil(lin.length * lh + 20), m2 = 10;
    m.width = (w + m2 * 2) * dpr; m.height = (h + m2 * 2 + 5) * dpr; c = m.getContext("2d"); c.scale(dpr, dpr);
    if (e.brillo) { c.shadowColor = e.brillo; c.shadowBlur = 14; }
    c.fillStyle = e.pie; rrect(c, m2, m2 + 5, w, h, 14); c.fill(); c.shadowBlur = 0;
    c.fillStyle = e.bg; rrect(c, m2, m2, w, h, 14); c.fill();
    c.lineWidth = e.ancho; c.strokeStyle = e.borde; rrect(c, m2 + e.ancho / 2, m2 + e.ancho / 2, w - e.ancho, h - e.ancho, 13); c.stroke();
    c.fillStyle = e.txt; c.font = "800 " + fs + "px Poppins, system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    lin.forEach(function(l, i){ c.fillText(l, m2 + w / 2, m2 + 10 + lh * (i + .5)); });
    return { img: m, w: w + m2 * 2, h: h + m2 * 2 + 5 };
  };

  function motorRunner(zona, s){
    cargaTodo();
    zona.innerHTML =
      '<div class="x56 r3"><div class="r3-escena"><canvas aria-hidden="true"></canvas>' +
        '<div class="r3-reloj" aria-hidden="true"><span>⏱️</span><b><i></i></b></div><div class="r3-aviso" aria-live="polite"></div></div>' +
      '<div class="r3-mandos"><button type="button" data-rn="-1" aria-label="Carril de arriba">↑</button>' +
        '<p class="x-nota r3-nota"></p>' +
        '<button type="button" data-rn="1" aria-label="Carril de abajo">↓</button>' +
        '<button type="button" class="r3-turbo" data-rn-turbo aria-label="Acelerar">⏩</button></div></div>';
    var raiz = zona.firstChild, escena = raiz.querySelector(".r3-escena"), cv = raiz.querySelector("canvas"), cx = cv.getContext("2d"),
      reloj = raiz.querySelector(".r3-reloj i"), relojBox = raiz.querySelector(".r3-reloj"), aviso = raiz.querySelector(".r3-aviso"), nota = raiz.querySelector(".r3-nota");
    var W = 0, H = 0, dpr = 1, VPx = 0, VPy = 0, catX = 0, top0 = 0, gap = 0, cielo = null, suelo = null;
    var reto = null, ops = [], n = 3, carril = 1, ly = 1, T = 0, t = 0, tReal = 0, hecho = false, cierre = -1, turbo = 0, recorrido = 0;
    var cartas = [], props = [], monedas = [], sigProp = .3, pose = "corre", tPose = 0, salto = -1, temblor = 0, flash = 0, flashCol = "", cuadro = 0, toque = null, vientos = [];
    var S0 = .4; /* tamaño aparente de una carta al aparecer (1 = junto a Manzana) */

    /* ---- geometría: todo converge a un punto de fuga a la derecha del horizonte ---- */
    var y0 = function(u){ return top0 + gap * (u + .5); };
    var P = function(z, u){ var k = 1 / (1 + z); return { x: VPx + (catX - VPx) * k, y: VPy + (y0(u) - VPy) * k, k: k }; };
    var geom = function(){
      VPx = W * .9; VPy = H * .33; catX = Math.max(60, W * .18);
      top0 = H * .5; gap = (H * .97 - top0) / n;
      cielo = cx.createLinearGradient(0, 0, 0, VPy + 10); cielo.addColorStop(0, "#9FCBFF"); cielo.addColorStop(.7, "#D6EBFF"); cielo.addColorStop(1, "#FFF1DA");
      suelo = cx.createLinearGradient(0, VPy, 0, H); suelo.addColorStop(0, "#CDB48E"); suelo.addColorStop(1, "#E9D8B8");
    };
    /* París escalado una sola vez (dibujar una imagen ya a su tamaño es mucho más barato) */
    var parisCache = null;
    var fondoParis = function(){
      if (parisCache && parisCache.h === H && parisCache.d === dpr) return parisCache.c;
      var pa = SPR["paris-tira"]; if (!ok(pa)) return null;
      var ph = H * .34, pw = pa.naturalWidth * ph / pa.naturalHeight, m = document.createElement("canvas");
      m.width = Math.ceil(pw * dpr); m.height = Math.ceil(ph * dpr); m.getContext("2d").drawImage(pa, 0, 0, m.width, m.height);
      parisCache = { c: m, h: H, d: dpr }; return m;
    };
    var mide = function(){
      /* reserva fija arriba para la pregunta: el escenario no se mueve entre preguntas */
      var zh = zona.clientHeight || 600;
      raiz.style.paddingTop = Math.round(Math.max(s.techo() + 8, entre(150, zh * .26, 220))) + "px";
      var r = escena.getBoundingClientRect(); W = Math.max(220, Math.round(r.width)); H = Math.max(200, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, W * H > 350000 ? 1.5 : 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      geom(); rehaceCartas();
    };
    var pendiente = 0;
    var alRedimensionar = function(){ if (pendiente) return; pendiente = requestAnimationFrame(function(){ pendiente = 0; mide(); }); };

    /* ---- cartas ---- */
    var maxCarta = function(){ return entre(120, W * .34, 230); };
    var rehaceCartas = function(){
      cartas.forEach(function(c){ c.bm = {}; });
    };
    var bitmap = function(c, estilo){ if (!c.bm[estilo]) c.bm[estilo] = tarjeta(c.o.t, estilo, maxCarta(), dpr); return c.bm[estilo]; };
    var zCarta = function(){ var p = T ? Math.min(1, t / T) : 0, k = S0 + (1 - S0) * p; return 1 / k - 1; };

    /* ---- dibujo ---- */
    var pinta = function(dt){
      if (!W) return;
      var c = cx; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (temblor > 0 && !s.mov) c.translate((Math.random() - .5) * 10 * temblor, (Math.random() - .5) * 6 * temblor);
      /* cielo y París */
      c.fillStyle = cielo; c.fillRect(-10, -10, W + 20, VPy + 20);
      var pc = fondoParis();
      if (pc) {
        var pw = pc.width / dpr, ph = pc.height / dpr, ox = -((recorrido * 18) % pw);
        for (var x = ox; x < W; x += pw) c.drawImage(pc, x, VPy + 8 - ph, pw + .5, ph);
      }
      /* muelle */
      c.fillStyle = suelo; c.fillRect(-10, VPy, W + 20, H - VPy + 10);
      var a = P(-.7, -.5), b = P(80, -.5), d = P(80, n - .5), e = P(-.7, n - .5);
      c.fillStyle = "#EFE3CC"; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(d.x, d.y); c.lineTo(e.x, e.y); c.closePath(); c.fill();
      /* baldosas que pasan (dan la sensación de velocidad) */
      var D = .5, fase = recorrido % D;
      c.strokeStyle = "rgba(150,115,70,.28)"; c.lineWidth = 1.5;
      c.beginPath();
      for (var z = -.6 - fase + D; z < 14; z += D) { var p1 = P(z, -.5), p2 = P(z, n - .5); c.moveTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); }
      c.stroke();
      /* bordillos */
      c.lineWidth = 4; c.strokeStyle = "#B99A6E"; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      c.strokeStyle = "rgba(185,154,110,.6)"; c.beginPath(); c.moveTo(e.x, e.y); c.lineTo(d.x, d.y); c.stroke();
      /* líneas de carril discontinuas */
      /* un solo relleno para todas las rayas (cuadriláteros que adelgazan con la distancia) */
      c.fillStyle = "rgba(255,255,255,.92)"; c.beginPath();
      for (var u = .5; u < n - .5; u++) {
        for (var z2 = -.6 - fase + D; z2 < 10; z2 += D) {
          var q1 = P(z2, u), q2 = P(z2 + D * .45, u), w1 = Math.max(.6, 2.6 * q1.k), w2 = Math.max(.5, 2.6 * q2.k);
          c.moveTo(q1.x, q1.y - w1); c.lineTo(q2.x, q2.y - w2); c.lineTo(q2.x, q2.y + w2); c.lineTo(q1.x, q1.y + w1); c.closePath();
        }
      }
      c.fill();
      /* todo lo que tiene profundidad, ordenado por su línea de suelo (lo más cercano encima) */
      var lista = [];
      props.forEach(function(p){ lista.push({ y: P(p.z, p.u).y, f: function(){ pintaProp(p); } }); });
      monedas.forEach(function(m){ if (!m.coge) lista.push({ y: P(m.z, m.u).y + 1, f: function(){ pintaMoneda(m); } }); });
      if (reto) { var zc = zCarta(); cartas.forEach(function(k, i){ var zz = Math.max(0, zc - (k.sale || 0) * .4); lista.push({ y: P(zz, i).y + 2, f: function(){ pintaCarta(k, i, zz); } }); }); }
      lista.push({ y: y0(ly) + 3, f: pintaGato });
      lista.sort(function(p, q){ return p.y - q.y; }).forEach(function(o){ o.f(); });
      /* viento del turbo */
      if (turbo > 0 && !s.mov) {
        c.strokeStyle = "rgba(255,255,255,.75)"; c.lineWidth = 2;
        c.beginPath();
        vientos.forEach(function(v){ v.x -= dt * W * 2.4; if (v.x < -v.l) { v.x = W + Math.random() * W * .5; v.y = VPy + Math.random() * (H - VPy); } c.moveTo(v.x, v.y); c.lineTo(v.x + v.l, v.y); });
        c.stroke();
      }
      if (flash > 0) { c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = flashCol.replace("A", (flash * .35).toFixed(3)); c.fillRect(0, 0, W, H); }
    };
    var pintaProp = function(p){
      var im = SPR[p.nm]; if (!ok(im)) return;
      var q = P(p.z, p.u), h = gap * (p.nm === "paloma" ? .7 : 1.05) * q.k, w = im.naturalWidth * h / im.naturalHeight;
      var dy = p.vuela ? -p.vuela * gap * 3 : 0, dx = p.vuela ? p.vuela * gap * 2 : 0;
      if (p.vuela) cx.globalAlpha = Math.max(0, 1 - p.vuela);
      cx.drawImage(im, q.x - w / 2 + dx, q.y - h + dy, w, h); cx.globalAlpha = 1;
    };
    var pintaMoneda = function(m){
      var im = SPR[m.est ? "estrella" : "moneda"]; if (!ok(im)) return;
      var q = P(m.z, m.u), h = gap * .5 * q.k, gira = Math.abs(Math.cos(recorrido * 5 + m.z * 3)), w = h * (m.est ? 1 : .35 + .65 * gira);
      cx.drawImage(im, q.x - w / 2, q.y - h - gap * .35 * q.k, w, h);
    };
    var pintaCarta = function(k, i, zz){
      var q = P(zz, i), estilo = k.estado || (i === carril && !hecho ? "sel" : "norm"), b = bitmap(k, estilo);
      var esc2 = .55 + .45 * q.k, w = b.w * esc2, h = b.h * esc2, x = Math.min(q.x + gap * .5 * q.k, W - w + 6), y = q.y - h + 6 * esc2;
      if (k.estado === "mal" && k.sacude > 0) x += Math.sin(k.sacude * 40) * 6;
      if (k.sale) { cx.globalAlpha = Math.max(0, 1 - k.sale * 1.4); if (cx.globalAlpha <= 0) { cx.globalAlpha = 1; return; } }
      cx.drawImage(b.img, x, y, w, h); cx.globalAlpha = 1;
      if (estilo === "sel") { cx.fillStyle = "#22C55E"; cx.beginPath(); cx.moveTo(x - 2, y + h / 2 - 7); cx.lineTo(x - 12, y + h / 2); cx.lineTo(x - 2, y + h / 2 + 7); cx.fill(); }
    };
    var pintaGato = function(){
      var yb = y0(ly) + gap * .38, sc = .92 + .08 * (n > 1 ? ly / (n - 1) : 1), ch = Math.min(gap * 1.5, 128) * sc;
      var alto = 0, im, cols, idx;
      if (salto >= 0) { var p = Math.min(1, salto / .55); alto = Math.sin(Math.PI * p) * gap * 1.2; im = SPR.salta; cols = 4; idx = Math.min(3, Math.floor(p * 4)); }
      else if (pose === "mareo") { im = SPR.mareo; cols = 1; idx = 0; }
      else { im = SPR.corre; cols = 5; idx = Math.floor(cuadro) % 5; }
      /* sombra pegada a los pies (no deja rastro) */
      cx.fillStyle = "rgba(90,60,20," + (.22 * (1 - alto / (gap * 1.6))).toFixed(3) + ")";
      cx.beginPath(); cx.ellipse(catX, yb - 2, ch * .32 * (1 - alto / (gap * 3)), ch * .06, 0, 0, Math.PI * 2); cx.fill();
      if (!ok(im)) return;
      var cw = im.naturalWidth / cols, chh = im.naturalHeight, w = ch * cw / chh;
      if (pose === "mareo") { var mh = ch * .62, mw = im.naturalWidth * mh / chh; cx.drawImage(im, catX - mw / 2, yb - mh, mw, mh); return; }
      cx.drawImage(im, idx * cw, 0, cw, chh, catX - w * .5, yb - ch - alto, w, ch);
    };

    /* ---- lógica ---- */
    var ponCarril = function(k){
      if (!reto || hecho || s.estado() !== "juega") return;
      k = entre(0, k, n - 1); if (k === carril) return;
      carril = k; fx("barrido");
    };
    var aSesion = function(x, y){ var a = escena.getBoundingClientRect(), b = s.el.getBoundingClientRect(); return { x: x + a.left - b.left, y: y + a.top - b.top }; };
    var avisa = function(txt, cls){ aviso.className = "r3-aviso " + (cls || ""); aviso.textContent = txt; void aviso.offsetWidth; aviso.classList.add("on"); };
    var juzga = function(){
      hecho = true; turbo = 0;
      var o = ops[carril], p = aSesion(catX, y0(carril) - gap * .6);
      cartas.forEach(function(k, i){ k.estado = ops[i].ok ? "bien" : "mal"; if (i === carril && !ops[i].ok) k.sacude = .4; });
      if (o.ok) {
        salto = 0; flash = 1; flashCol = "rgba(255,210,0,A)"; fx("atrapa");
        chispas(s, p.x + 30, p.y, { n: 24, cols: ["#FFD200", "#34D399", "#fff"], v: 420, s: 5 });
        s.acierto(reto, { rapidez: Math.max(0, 1 - tReal / T), x: p.x, y: p.y });
        avisa(["Bravo !", "Parfait !", "Excellent !", "Super !"][Math.floor(Math.random() * 4)], "ok");
        for (var i = 0; i < 5; i++) monedas.push({ z: .9 + i * .45, u: carril, est: i === 4 });
        cierre = .8; return;
      }
      pose = "mareo"; tPose = 1.2; temblor = 1; flash = 1; flashCol = "rgba(229,72,77,A)"; fx("pierde");
      chispas(s, p.x + 20, p.y + 20, { n: 12, cols: ["#E5484D", "#FFB3B8"], v: 240, s: 4 });
      s.fallo(reto, { mal: o.t, etMal: "Ibas por", etiqueta: "Correcta", bien: reto.correcta[0] }).then(function(){ limpia(); s.listo(); });
    };
    var limpia = function(){ reto = null; cartas = []; reloj.style.transform = "scaleX(1)"; pose = "corre"; tPose = 0; };

    /* ---- entrada ---- */
    var carrilDeY = function(clientY){ var r = cv.getBoundingClientRect(), y = clientY - r.top; return y < top0 - gap * .4 ? null : entre(0, Math.floor((y - top0) / gap), n - 1); };
    var abajo = function(e){ toque = { y: e.clientY, x: e.clientX, id: e.pointerId }; };
    var arriba = function(e){
      if (!toque || e.pointerId !== toque.id) return;
      var dy = e.clientY - toque.y, dx = e.clientX - toque.x; toque = null;
      if (Math.abs(dy) > 26 && Math.abs(dy) > Math.abs(dx)) { ponCarril(carril + (dy > 0 ? 1 : -1)); return; }
      if (dx > 40 && Math.abs(dx) > Math.abs(dy)) { acelera(); return; }
      var k = carrilDeY(e.clientY); if (k != null) ponCarril(k);
    };
    var acelera = function(){ if (!reto || hecho || s.estado() !== "juega") return; turbo = .8; fx("motor"); };
    var clic = function(e){
      var b = e.target.closest && e.target.closest("[data-rn]");
      if (b) { e.preventDefault(); ponCarril(carril + +b.dataset.rn); return; }
      if (e.target.closest && e.target.closest("[data-rn-turbo]")) { e.preventDefault(); acelera(); }
    };
    var oir = function(e){ var b = e.target.closest && e.target.closest("[data-rn-oir]"); if (b && reto && reto.audio) { e.preventDefault(); suena(reto.audio); } };
    raiz.querySelector(".r3-mandos").addEventListener("click", clic);
    cv.addEventListener("pointerdown", abajo); cv.addEventListener("pointerup", arriba); cv.addEventListener("pointercancel", function(){ toque = null; });
    s.el.addEventListener("click", oir); window.addEventListener("resize", alRedimensionar);
    for (var v = 0; v < 9; v++) vientos.push({ x: Math.random() * 900, y: 0, l: 40 + Math.random() * 60 });
    requestAnimationFrame(function(){ mide(); pinta(0); });
    nota.textContent = tactil() ? "Toca un carril o desliza ↑ ↓ · ⏩ acelera" : "← → o ↑ ↓ cambian de carril · Espacio acelera";

    return {
      jugar: function(r){
        reto = r; hecho = false; cierre = -1; t = 0; tReal = 0; turbo = 0; salto = -1;
        ops = G.opcionesReto ? G.opcionesReto(r, 3, s.nivel) : mezcla([{ t: r.correcta[0], ok: true }].concat((r.malas || []).slice(0, 2).map(function(x){ return { t: x, ok: false }; })));
        if (ops.length !== n) { n = ops.length; geom(); }
        carril = Math.min(carril, n - 1); ly = Math.min(ly, n - 1);
        T = s.dir.t() * 1.15 + 3.6 + (r.audio ? 1.8 : 0);
        cartas = ops.map(function(o){ return { o: o, bm: {} }; });
        s.banner('<p class="plxg-ask">' + esc(r.ask || "Elige la respuesta") + "</p>" +
          (r.q ? '<p class="plxg-q" lang="fr">' + esc(r.q).replace(/_{2,}/, '<span class="hueco">___</span>') + "</p>" : "") +
          (r.audio ? '<button type="button" class="x-oir" data-rn-oir aria-label="Escuchar otra vez">' + BOCINA + "<span>Escuchar</span></button>" : ""), { oro: r.oro });
        if (r.audio) suena(r.audio);
      },
      tick: function(dt, d){
        var dd = d || 0, vel = turbo > 0 ? 2.4 : 1, mov = s.mov ? .5 : 1;
        var dz = dd * 1.25 * vel * mov;
        recorrido += dz; cuadro += dd * 13 * vel;
        /* carril: se desliza suave hacia el elegido */
        ly += (carril - ly) * Math.min(1, (dt || dd) * 16);
        if (salto >= 0) { salto += dd; if (salto > .55) salto = -1; }
        if (tPose > 0) { tPose -= dd; if (tPose <= 0 && !reto) pose = "corre"; }
        if (temblor > 0) temblor = Math.max(0, temblor - dd * 3);
        if (flash > 0) flash = Math.max(0, flash - dd * 3);
        if (turbo > 0) turbo -= dd;
        /* decoración al fondo del muelle */
        sigProp -= dz; if (sigProp <= 0) { props.push({ nm: PROPS[Math.floor(Math.random() * PROPS.length)], z: 9, u: -1.05, vuela: 0 }); sigProp = 1.6 + Math.random() * 2.2; }
        props = props.filter(function(p){ p.z -= dz; if (p.nm === "paloma" && p.z < 1.2 && !p.vuela) p.vuela = .001; if (p.vuela) p.vuela += dd * 1.4; return p.z > -.7 && p.vuela < 1; });
        monedas = monedas.filter(function(m){
          m.z -= dz;
          if (!m.coge && m.z < .08 && Math.abs(ly - m.u) < .5) { m.coge = true; fx("brillo"); var pm = aSesion(catX, y0(m.u) - gap * .6); chispas(s, pm.x, pm.y, { n: 6, cols: ["#FFD200", "#fff"], v: 160, s: 3 }); }
          return m.z > -.6 && !m.coge;
        });
        if (reto) {
          if (cierre >= 0) {
            cierre -= dd; cartas.forEach(function(k){ k.sale = (k.sale || 0) + dz * 1.5; if (k.sacude > 0) k.sacude -= dd; });
            if (cierre < 0) { limpia(); s.listo(); }
          } else if (!hecho && dd) {
            tReal += dd; t += dd * vel;
            reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
            relojBox.classList.toggle("poco", t / T > .72);
            if (t >= T) juzga();
          } else cartas.forEach(function(k){ if (k.sacude > 0) k.sacude -= dd; });
        }
        pinta(dd);
      },
      tecla: function(e){
        var k = e.key;
        if (k === "ArrowLeft" || k === "ArrowUp" || k === "w" || k === "W") { e.preventDefault(); ponCarril(carril - 1); }
        else if (k === "ArrowRight" || k === "ArrowDown" || k === "s" || k === "S") { e.preventDefault(); ponCarril(carril + 1); }
        else if (k === " " || k === "Enter") { e.preventDefault(); acelera(); }
        else if (/^[1-5]$/.test(k)) { e.preventDefault(); ponCarril(+k - 1); }
      },
      pausa: function(){ calla(); }, sigue: function(){},
      destruye: function(){
        cv.removeEventListener("pointerdown", abajo); cv.removeEventListener("pointerup", arriba);
        s.el.removeEventListener("click", oir); window.removeEventListener("resize", alRedimensionar); if (pendiente) cancelAnimationFrame(pendiente); calla();
      },
      depura: function(){ return { carril: carril, n: n, T: T, t: t, W: W, H: H, ops: ops.map(function(o){ return o.t + (o.ok ? "*" : ""); }) }; }
    };
  }

  var gr = G.juegos.gr;
  gr.montar = function(zona, s){ return motorRunner(zona, s); };
  gr.verbo = "Corre con Manzana por el carril correcto";
  var _reglas = gr.reglas;
  gr.reglas = function(alc){
    var r = _reglas ? _reglas(alc) : [];
    var out = Array.isArray(r) ? r.filter(function(x){ return !/carril|gato corre|puerta/i.test(x); }) : [];
    return out.concat(["Manzana corre sola por el muelle del Sena. Las respuestas vienen hacia ella, una por carril.",
      "Cambia de carril con ← → o ↑ ↓ (en el celular, toca el carril o desliza). Espacio o ⏩ acelera: si aciertas, sumas más.",
      "Si llegas por la respuesta equivocada, Manzana se marea: pierdes una vida y ves la corrección."]);
  };

  var st = document.createElement("style"); st.id = "plx65";
  st.textContent = `
  .x56.r3{max-width:980px}
  .r3-escena{position:relative;flex:1 1 auto;min-height:230px;max-height:560px;border-radius:24px;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;
    background:#D6EBFF;box-shadow:0 0 0 2px rgba(255,255,255,.14),0 18px 40px -20px rgba(0,0,0,.6);contain:strict}
  .r3-escena canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:pointer}
  .r3-reloj{position:absolute;left:12px;right:12px;top:10px;display:flex;align-items:center;gap:6px;z-index:2;pointer-events:none}
  .r3-reloj span{font-size:20px}
  .r3-reloj b{flex:1;height:12px;border-radius:99px;background:rgba(11,45,116,.55);overflow:hidden;box-shadow:inset 0 0 0 2px rgba(255,255,255,.5)}
  .r3-reloj i{display:block;height:100%;background:linear-gradient(90deg,#FFD200,#FFB800);transform-origin:left;border-radius:99px;will-change:transform}
  .r3-reloj.poco i{background:linear-gradient(90deg,#FF6B6B,#E5484D)}
  .r3-aviso{position:absolute;left:0;right:0;top:20%;text-align:center;z-index:3;pointer-events:none;opacity:0;font:900 clamp(26px,6vw,44px)/1 Poppins,system-ui,sans-serif;color:#fff;-webkit-text-stroke:2px #0B2D74;text-shadow:0 4px 0 #0B2D74}
  .r3-aviso.on{animation:r3Aviso .9s ease-out}
  .r3-aviso.ok{color:#FFD200}
  @keyframes r3Aviso{0%{opacity:0;transform:scale(.5)}20%{opacity:1;transform:scale(1.12)}70%{opacity:1;transform:scale(1)}100%{opacity:0;transform:translateY(-20px)}}
  .r3-mandos{display:grid;grid-template-columns:60px 1fr 60px 60px;align-items:center;gap:8px;flex:none}
  .r3-mandos button{all:unset;cursor:pointer;height:54px;border-radius:16px;display:grid;place-items:center;background:#FFD200;color:#0B2D74;font:900 26px/1 Poppins,system-ui,sans-serif;box-shadow:0 4px 0 #C9A400;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
  .r3-mandos button:active{transform:translateY(3px);box-shadow:0 1px 0 #C9A400}
  .r3-mandos .r3-turbo{background:#fff;box-shadow:0 4px 0 #C8D3E8;font-size:22px}
  .r3-mandos button:focus-visible{outline:3px solid #fff;outline-offset:3px}
  .r3-nota{text-align:center;font:600 13px/1.3 Inter,system-ui,sans-serif!important;color:#C9D6F2!important;margin:0}
  @media (min-width:900px){.r3-mandos{grid-template-columns:64px 1fr 64px 64px}}
  /* portada de Boss Battle en claro: textos que venían blancos para el fondo oscuro */
  .plxg:not(.plxg-juego) .bb-dt>small{color:#C2410C}
  .plxg:not(.plxg-juego) .bb-dt>b{color:var(--pp-tinta,#14213D)}
  .plxg:not(.plxg-juego) .bb-rpt li{background:#fff;box-shadow:0 0 0 1px var(--pp-linea,#E7DFCF),0 6px 14px -12px rgba(20,33,61,.4)}
  .plxg:not(.plxg-juego) .bb-rn{color:var(--pp-azul,#1E5BD7)}
  .plxg:not(.plxg-juego) .bb-rt b{color:var(--pp-tinta,#14213D)}
  .plxg:not(.plxg-juego) .bb-rt small{color:var(--pp-gris,#5E6678)}
  /* portada de Language Adventure en claro */
  .plxg:not(.plxg-juego) .la-mapa li{background:#fff;box-shadow:0 0 0 1px var(--pp-linea,#E7DFCF);border-radius:14px}
  .plxg:not(.plxg-juego) .la-mapa li.cur{background:#FFF6CC;box-shadow:inset 0 0 0 2px #FFD200}
  .plxg:not(.plxg-juego) .la-mapa b{color:var(--pp-tinta,#14213D)!important}
  .plxg:not(.plxg-juego) .la-mapa small{color:var(--pp-gris,#5E6678)!important}
  /* pistas de Phrase Builder y Sentence Race (plx47) */
  .pb-ctx{margin:0 0 6px!important;font:600 14px/1.35 Inter,system-ui,sans-serif;color:#C9D6F2}
  .pb-ctx span{display:inline-block;margin-right:8px;padding:2px 8px;border-radius:99px;background:rgba(255,210,0,.18);color:#FFD200;font:800 11px/1.4 Poppins,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase}
  .pb-esq{letter-spacing:.02em;word-spacing:.18em}
  .pb-esq .esq{color:rgba(255,255,255,.55)}
  .pb-esq .esq-ok{color:#6BE58E}
  .fx-f.fx-sig{box-shadow:0 0 0 3px #FFD200,0 0 18px rgba(255,210,0,.6)!important;animation:fxSig 1s ease-in-out infinite alternate}
  @keyframes fxSig{to{translate:0 -3px}}
  `;
  document.head.appendChild(st);
})();
