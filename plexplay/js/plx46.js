/* PLEX PLAY 1.24.0 — Arcade y Fruit Frenzy
   - Pestaña Retos: sección «Arcade». Se elige juego, curso y unidad (o un tema de vocabulario) y se juega.
     Los juegos se registran con PLXG.registrar (este archivo trae Fruit Frenzy; los demás, plx47 en adelante).
   - Al final de cada lección: tarjeta «Jugar el repaso» (60 s de Fruit Frenzy con lo de esa lección).
   - Fruit Frenzy (motor de reflejos): arriba una instrucción; las frutas saltan desde abajo, cada una con
     una palabra, y se corta la correcta deslizando el dedo (o tocándola, o con las teclas 1 a 5).
     choice, fill y match: se corta la respuesta · sort: solo las de una categoría · order: en orden ·
     spot: primero la palabra incorrecta y después su arreglo · vocabulario: suena y se corta la que sonó.
   - Dejar caer la correcta solo rompe el combo. Un trazo que corta una incorrecta se anula entero.
     En una oleada del carnet todas las frutas son doradas (el color no delata la respuesta).
   - Canvas 2D y pointer events. El tiempo, las vidas, los puntos, la pausa y los resultados son de la
     sesión común (PLXG.sesion, en plx45); aquí solo está el motor de las frutas. */
(function(){
  "use strict";
  var G = window.PLXG; if (!G) return;
  var esc = G.esc, norm = G.norm, mezcla = G.mezcla;

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
  var frutasDeco = function(n){ return FRUTAS.slice(0, n).map(function(f, i){ return '<img src="' + f.url + '" alt="" style="--i:' + i + '">'; }).join(""); };
  G.frutasDeco = frutasDeco;
  var OIR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z"/><path d="M13 7a4 4 0 0 1 0 6M15.5 4.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  G.ICONO_OIR = OIR;

  /* ---------------- Fruit Frenzy: el motor ---------------- */
  var FF = G.registrar({
    id: "ff", nombre: "Fruit Frenzy", verbo: "Corta la palabra correcta", familia: "Reflejos", color: "#FF7A45", orden: 10,
    deco: function(){ return frutasDeco(4); },
    /* retos de las lecciones y, cerca de uno de cada cinco, de audio: suena una palabra y entre las frutas hay
       versiones mal escritas (tildes, dobles, letras mudas) según el nivel */
    retos: function(alc){
      var r = G.retosDe(alc);
      if (alc.tema) return r;
      var au = mezcla(G.retosAudioLecciones(alc.lecciones, G.nivel(alc.track)));
      return r.concat(au.slice(0, Math.max(2, Math.round(r.length / 4))));
    },
    reglas: function(alc){
      var r = [
        (G.aj.sinTiempo ? "Sin tiempo: " + (alc.repaso ? 10 : 15) + " retos" : alc.seg + " segundos") + " y 3 vidas.",
        alc.tema ? "Suena una palabra: córtala. Las demás se dejan pasar." : "Corta la fruta con la respuesta correcta y deja pasar las demás.",
        "Cortar una incorrecta quita una vida y te muestra la corrección.",
        "10 aciertos seguidos: frenesí, cámara lenta y puntos dobles."
      ];
      r.push("En los retos de audio, corta la palabra bien escrita: hay trampas de ortografía.");
      if (!alc.tema) r.push("Frutas doradas: errores de tu carnet. Valen el doble.");
      return r;
    },
    montar: function(zona, s){ return motorFF(zona, s); }
  });

  function motorFF(zona, s){
    var frutas = [], mitades = [], gotas = [], rastro = [], trazo = null, ola = null;
    var W = 0, H = 0, dpr = 1, techo = 150, mov = s.mov, dir = s.dir;
    var teclado = (function(){ try { return matchMedia("(pointer:fine)").matches; } catch (e) { return false; } })();

    zona.innerHTML = '<canvas class="ff-cv" aria-label="Zona de juego: corta las frutas"></canvas>';
    s.el.classList.add("ff");
    var cv = zona.querySelector(".ff-cv"), ctx = cv.getContext("2d");
    var tam = function(){
      var r = zona.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    /* la etiqueta nunca se sale de la pantalla */
    var limitaX = function(x, ancho, r){ var m = Math.max(ancho / 2, r) + 6; return Math.max(m, Math.min(W - m, x)); };
    var radio = function(){ return Math.max(30, Math.min(44, W * .095)); };
    var fuente = function(){ return (W < 360 ? 15 : 16); };

    /* ---- oleadas: una por reto ---- */
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
      ola = { reto: reto, fase: fase, tipo: tipo, correcta: correcta, T: T, t: 0, paso: 0, hecho: false, objetivo: lista.filter(function(f){ return f.ok; }).length, cortadasOk: 0 };
      pintaBan();
      if (reto.audio) try { speak(reto.audio); } catch (e) {}
      techo = s.techo();
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
          rot: Math.random() * 6, vr: (Math.random() - .5) * 1.4, nace: i * escalon, activa: false, vivo: true, disuelve: -1, naceJ: 0, oro: !!reto.oro };
      });
    };

    var textoQ = function(){
      var r = ola.reto;
      if (r.tipo === "error") {
        var f = esc(r.q);
        if (ola.fase === 2) return f.replace(esc(r.correcta[0]), "<s>" + esc(r.correcta[0]) + '</s> <span class="hueco">?</span>');
        return f;
      }
      if (ola.tipo === "orden") return (r.q ? '<span class="tr">' + esc(r.q) + "</span>" : "") + '<span class="arma">' + (ola.correcta.slice(0, ola.paso).map(esc).join(" ") || "&nbsp;") + ' <span class="hueco">…</span></span>';
      if (ola.tipo === "varios") return '<span class="cat">' + esc(r.q) + "</span>";
      if (r.audio) return '<button class="plxg-oir" data-f="oir">' + OIR + "Escuchar otra vez</button>";
      return esc(r.q).replace(/_{2,}/g, '<span class="hueco">___</span>');
    };
    var pintaBan = function(){
      if (!ola) return;
      var r = ola.reto, ask = r.tipo === "error" && ola.fase === 2 ? "Ahora corta el arreglo" : r.ask;
      s.banner((ask ? '<p class="plxg-ask">' + esc(ask) + "</p>" : "") + '<p class="plxg-q">' + textoQ() + "</p>", { oro: r.oro });
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
      if (!ola || ola.hecho || s.estado() !== "juega" || !hits.length) return;
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
      var nx = -Math.sin(ang);
      [1, -1].forEach(function(l){ mitades.push({ spr: f.spr, x: f.x, y: f.y, vx: f.vx * .6 + nx * l * 90, vy: Math.min(f.vy, 0) * .3 - 60, g: 900, rot: f.rot, vr: l * 3, a: ang, l: l, r: f.r, vida: 1.1 }); });
      var n = mov ? 4 : 14, col = malo ? "#FF4D5E" : f.spr.jugo;
      for (var i = 0; i < n; i++) { var a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 260; gotas.push({ x: f.x, y: f.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, r: 2 + Math.random() * 3.5, c: col, vida: .6 + Math.random() * .4 }); }
      G.sfx("corte");
    };
    var acierto = function(f, rapidez, final){
      var a = s.acierto(ola.reto, { rapidez: rapidez, x: f.x, y: f.y - f.r - 10, final: final });
      if (trazo) trazo.gan.push(a.g);
    };
    var bien = function(f, ang){
      parte(f, ang, false);
      var rap = 1 - (s.t() - f.naceJ) / ola.T;
      if (ola.tipo === "uno") {
        var sigue = ola.reto.tipo === "error" && ola.fase === 1;
        acierto(f, rap, !sigue);
        cierra(sigue ? 2 : 0);
      } else {
        var ultima = ++ola.cortadasOk >= ola.objetivo;
        acierto(f, rap, ultima);
        if (ultima) cierra(0);
      }
    };
    var pasoOrden = function(f, ang){
      parte(f, ang, false);
      ola.paso++; G.sfx("paso", ola.paso); s.extra(20, f.x, f.y - f.r - 10);
      if (ola.paso >= ola.correcta.length) { acierto(f, 1 - ola.t / ola.T, true); cierra(0); }
      else pintaBan();
    };
    var cierra = function(fase2){
      ola.hecho = true; ola.fase2 = fase2;
      frutas.forEach(function(x){ if (x.vivo && x.activa) x.disuelve = .3; if (!x.activa) x.vivo = false; });
    };
    var correccion = function(){
      var r = ola.reto;
      if (r.tipo === "error") return { etiqueta: "El arreglo", bien: r.correcta[0] + " → " + r.fix.correcta[0] };
      if (ola.tipo === "orden") return { etiqueta: "La frase", bien: ola.correcta.join(" ") };
      if (ola.tipo === "varios") return { etiqueta: r.q, bien: r.correcta.join(" · ") };
      return { etiqueta: "Correcta", bien: ola.correcta[0] };
    };
    var fallo = function(f, ang){
      if (trazo && trazo.gan.length) { s.anula(trazo.gan); trazo.gan = []; }
      parte(f, ang, true);
      var c = correccion(), r = ola.reto;
      ola.hecho = true; trazo = null;
      s.fallo(r, { mal: f.t, etiqueta: c.etiqueta, bien: c.bien }).then(function(){ frutas = []; ola = null; s.listo(); });
    };
    var escapa = function(){
      var c = correccion(), r = ola.reto, tipo = ola.tipo;
      ola.hecho = true; trazo = null;
      s.escapa(r, { titulo: tipo === "orden" ? "La frase quedó incompleta" : tipo === "varios" ? "Se te escaparon algunas" : "Se te escapó la correcta", etiqueta: c.etiqueta, bien: c.bien })
        .then(function(){ frutas = []; ola = null; s.listo(); });
    };

    /* ---- cada cuadro ---- */
    var tick = function(dt, d, estado){
      if (estado === "juega" && ola && !ola.cerrando) {
        ola.t += d;
        frutas.forEach(function(f){
          if (!f.activa) { if (!ola.hecho && ola.t >= f.nace) { f.activa = true; f.naceJ = s.t(); } else return; }
          if (!f.vivo) return;
          f.vy += f.g * d; f.x += f.vx * d; f.y += f.vy * d; f.rot += f.vr * d;
          var xl = limitaX(f.x, f.w, f.r); if (xl !== f.x) { f.x = xl; f.vx = 0; }
          if (f.disuelve >= 0) { f.disuelve -= dt; if (f.disuelve < 0) f.vivo = false; }
          else if (f.vy > 0 && f.y > H + f.r + 12) f.vivo = false;
        });
        separa();
        if (!frutas.some(function(f){ return f.vivo; })) {
          if (ola.hecho) { var r = ola.reto, f2 = ola.fase2; if (f2) lanzar(r, 2); else { ola = null; frutas = []; s.listo(); } }
          else escapa();
        }
      }
      mueve(d);
      dibuja();
    };
    /* dos etiquetas a la misma altura se empujan hacia los lados: siempre se pueden leer */
    var separa = function(){
      var v = frutas.filter(function(f){ return f.activa && f.vivo && f.disuelve < 0; });
      for (var i = 0; i < v.length; i++) for (var j = i + 1; j < v.length; j++) {
        var a = v[i], b = v[j];
        if (Math.abs(a.y - b.y) > 34) continue;
        var falta = (a.w + b.w) / 2 + 18 - Math.abs(a.x - b.x); if (falta <= 0) continue;
        var sg = a.x <= b.x ? -1 : 1, xa = limitaX(a.x + sg * falta / 2, a.w, a.r), xb = limitaX(b.x - sg * falta / 2, b.w, b.r);
        var resto = (a.w + b.w) / 2 + 18 - Math.abs(xa - xb);
        if (resto > 0) { if (xa === a.x + sg * falta / 2) xa = limitaX(xa + sg * resto, a.w, a.r); else xb = limitaX(xb - sg * resto, b.w, b.r); }
        a.x = xa; b.x = xb;
      }
    };
    var mueve = function(d){
      mitades = mitades.filter(function(h){ h.vy += h.g * d; h.x += h.vx * d; h.y += h.vy * d; h.vida -= d; return h.vida > 0 && h.y < H + 120; });
      gotas = gotas.filter(function(p){ p.vy += 700 * d; p.x += p.vx * d; p.y += p.vy * d; p.vida -= d; return p.vida > 0; });
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
      /* rastro del corte, en amarillo */
      if (rastro.length > 1) {
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        [[14, "rgba(255,210,0,.22)"], [6, "#FFD200"], [2, "#FFFBE0"]].forEach(function(st){
          ctx.lineWidth = st[0]; ctx.strokeStyle = st[1]; ctx.beginPath(); ctx.moveTo(rastro[0].x, rastro[0].y);
          for (var i = 1; i < rastro.length; i++) ctx.lineTo(rastro[i].x, rastro[i].y);
          ctx.stroke();
        });
      }
    };

    /* ---- entrada: dedo, ratón, teclado ---- */
    var punto = function(e){ var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };
    var baja = function(e){
      if (s.estado() !== "juega") return;
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      G.despiertaAudio();
      var p = punto(e); trazo = { id: e.pointerId, u: p, gan: [] }; rastro = [p];
      procesa(cortables().filter(function(f){ return toca(f, p.x, p.y); }).slice(0, 1), -Math.PI / 4);
    };
    var mueveP = function(e){
      if (!trazo || e.pointerId !== trazo.id || s.estado() !== "juega") return;
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!evs.length) evs = [e];
      evs.forEach(function(ev){ if (!trazo) return; var p = punto(ev), a = trazo.u; if (Math.hypot(p.x - a.x, p.y - a.y) < 3) return; rastro.push(p); procesa(golpes(a, p), Math.atan2(p.y - a.y, p.x - a.x)); if (trazo) trazo.u = p; });
    };
    var sube = function(e){ if (trazo && e.pointerId === trazo.id) trazo = null; };
    cv.addEventListener("pointerdown", baja); cv.addEventListener("pointermove", mueveP);
    cv.addEventListener("pointerup", sube); cv.addEventListener("pointercancel", sube);
    var oir = function(e){ var b = e.target.closest && e.target.closest("[data-f=oir]"); if (b && ola && ola.reto.audio) try { speak(ola.reto.audio); } catch (x) {} };
    s.el.addEventListener("click", oir);
    window.addEventListener("resize", tam);
    tam();

    return {
      jugar: function(reto){ lanzar(reto, 1); },
      tick: tick,
      tecla: function(e){
        if (!/^[1-9]$/.test(e.key)) return;
        teclado = true;
        var lista = cortables().sort(function(a, b){ return a.x - b.x; }), f = lista[+e.key - 1];
        if (f) { e.preventDefault(); trazo = null; rastro = [{ x: f.x - 40, y: f.y + 20, t: performance.now() }, { x: f.x + 40, y: f.y - 20, t: performance.now() }]; procesa([f], -.46); }
      },
      pausa: function(){ trazo = null; },
      destruye: function(){
        cv.removeEventListener("pointerdown", baja); cv.removeEventListener("pointermove", mueveP);
        cv.removeEventListener("pointerup", sube); cv.removeEventListener("pointercancel", sube);
        s.el.removeEventListener("click", oir); window.removeEventListener("resize", tam);
        s.el.classList.remove("ff");
      },
      /* para las pruebas: lo que hay en pantalla */
      depura: function(){ return { W: W, H: H, ola: ola && { tipo: ola.tipo, fase: ola.fase, paso: ola.paso, correcta: ola.correcta, q: ola.reto.q, oro: !!ola.reto.oro },
        frutas: ola ? cortables().map(function(f){ return { t: f.t, ok: esCorrecta(f), x: Math.round(f.x), y: Math.round(f.y), w: Math.round(f.w) }; }) : [] }; }
    };
  }

  /* ---------------- pantallas: arcade (elegir) y portada del juego ---------------- */
  var HB = { track: null, juego: null };
  var lsGet2 = function(k){ try { return localStorage.getItem(k); } catch (e) { return null; } };
  var lsSet2 = function(k, v){ try { localStorage.setItem(k, v); } catch (e) {} };
  var cursoInicial = function(){ var t = lsGet2("plxg-track"); if (!t) try { t = track; } catch (e) {} return TRACKS.some(function(x){ return x.id === t; }) ? t : TRACKS[0].id; };
  var juegoInicial = function(){ var j = lsGet2("plxg-juego"); return G.juegos[j] && G.juegos[j].montar ? j : "ff"; };
  var X = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var ATRAS = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var decoDe = function(j){ return j.deco ? j.deco() : ""; };
  var totalEstrellas = function(){ var n = 0; try { var e = (S.arcade || {}).est || {}; Object.keys(e).forEach(function(k){ n += e[k] || 0; }); } catch (x) {} return n; };

  var fila = function(j, alc, extra){
    var n = G.nRetos(j, alc), rec = G.record(j.id, alc), est = alc.unit ? G.estrellasUnidad(j.id, alc.track, alc.unit) : rec ? rec.est || 0 : 0;
    return '<button class="hb-u" data-h="alc" data-k="' + esc(alc.clave) + '"' + (n < G.MIN_RETOS ? " disabled" : "") + ">" +
      '<span class="hb-ut"><b>' + esc(alc.titulo) + "</b><small>" + (n < G.MIN_RETOS ? "Pocos ejercicios para este juego" : n + " retos" + (rec ? " · récord " + rec.best.toLocaleString("es-CO") : "")) + (extra || "") + "</small></span>" +
      G.estrellasHTML(est) + "</button>";
  };
  var ALC = {};
  var hub = function(el){
    var tr = HB.track || (HB.track = cursoInicial()), jid = HB.juego || (HB.juego = juegoInicial()), j = G.juegos[jid];
    var juegos = G.listaJuegos(), nv = G.DIF[G.nivel(tr)].nombre, us = G.alc.unidades(tr);
    ALC = {};
    var todo = G.alc.todo(tr); ALC[todo.clave] = todo;
    var filas = us.map(function(u){ var a = G.alc.unidad(tr, u); ALC[a.clave] = a; return fila(j, a); }).join("");
    var voc = "";
    if (j.vocab) {
      var temas = ((window.__VOCAB || {})[tr] || { themes: [] }).themes;
      if (window.__VOCAB) voc = temas.length ? temas.map(function(t, i){ var a = G.alc.vocab(tr, i); ALC[a.clave] = a; return fila(j, a, " · con audio"); }).join("") : '<p class="hb-nota">Este curso no tiene vocabulario todavía.</p>';
      else voc = '<p class="hb-nota">Cargando el vocabulario…</p>';
    }
    var est = totalEstrellas();
    el.innerHTML = '<div class="plxg-scroll"><div class="plxg-wrap hb">' +
      '<div class="hb-top"><button class="plxg-ib" data-h="salir" aria-label="Cerrar el arcade">' + X + '</button><span class="plxg-k">PLEX PLAY' + (est ? " · " + est + " estrellas" : "") + "</span></div>" +
      '<h1 class="plxg-h">Arcade</h1>' +
      '<p class="hb-lead">Juegos cortos con el francés de tus lecciones. Para ganar hay que entender: responder al azar te quita vidas. Fallar nunca te quita XP.</p>' +
      '<h2 class="plxg-h2">Juego</h2><div class="hb-juegos" role="radiogroup" aria-label="Juego">' +
        juegos.map(function(g){ var on = g.id === jid;
          return '<button role="radio" aria-checked="' + on + '" class="hb-game' + (on ? " on" : "") + '" data-h="juego" data-j="' + g.id + '" style="--ac:' + g.color + '">' +
            '<span class="hb-fr" aria-hidden="true">' + decoDe(g) + '</span><span class="hb-gt"><small>' + esc(g.familia) + "</small><b>" + esc(g.nombre) + "</b><span>" + esc(g.verbo) + ".</span></span></button>"; }).join("") + "</div>" +
      '<h2 class="plxg-h2">Curso</h2><div class="hb-tracks" role="tablist" aria-label="Curso">' +
        TRACKS.map(function(t){ return '<button role="tab" aria-selected="' + (t.id === tr) + '" class="hb-tr' + (t.id === tr ? " on" : "") + '" data-h="tr" data-t="' + t.id + '">' + esc(t.label.replace(/^Francés /, "")) + "</button>"; }).join("") + "</div>" +
      '<h2 class="plxg-h2">Unidad <small>' + esc(G.alc.curso(tr)) + " · velocidad " + nv + "</small></h2>" +
      '<div class="hb-units">' + fila(j, todo) + filas + "</div>" +
      (j.vocab ? '<h2 class="plxg-h2">Vocabulario <small>' + esc(j.vocabNota || "con el audio de cada palabra") + '</small></h2><div class="hb-units">' + voc + "</div>" : "") +
    "</div></div>";
    var sel = el.querySelector(".hb-tr.on"), fila2 = el.querySelector(".hb-tracks"); if (sel && fila2) fila2.scrollLeft = sel.offsetLeft - fila2.clientWidth / 2 + sel.offsetWidth / 2;
    if (j.vocab && !window.__VOCAB) G.vocab().then(function(){ if (el.querySelector(".hb")) { var sc = el.querySelector(".plxg-scroll"), y = sc.scrollTop; hub(el); el.querySelector(".plxg-scroll").scrollTop = y; } }).catch(function(){ var n = el.querySelector(".hb-nota"); if (n) n.textContent = "El vocabulario no se pudo cargar sin conexión."; });
  };

  var portada = function(el, j, alc, desdeHub){
    var rec = G.record(j.id, alc), nv = G.DIF[G.nivel(alc.track)], n = G.nRetos(j, alc);
    var reglas = j.reglas ? j.reglas(alc) : [];
    var sw = function(k, t, d){ return '<button class="pt-sw" role="switch" aria-checked="' + !!G.aj[k] + '" data-h="aj" data-a="' + k + '"><span><b>' + t + "</b><small>" + d + "</small></span><i></i></button>"; };
    el.innerHTML = '<div class="plxg-scroll"><div class="plxg-wrap pt pt-' + esc(j.id) + '" style="--ac:' + j.color + '">' +
      '<div class="hb-top"><button class="plxg-ib" data-h="' + (desdeHub ? "hub" : "salir") + '" aria-label="' + (desdeHub ? "Volver" : "Cerrar") + '">' + (desdeHub ? ATRAS : X) + '</button><span class="plxg-k">' + esc(alc.sub || "") + "</span></div>" +
      (j.portadaExtra ? j.portadaExtra(alc) || "" : "") +   /* gancho opcional: HTML propio del juego arriba de la portada */
      '<div class="pt-fr" aria-hidden="true">' + (j.decoGrande ? j.decoGrande() : decoDe(j)) + "</div>" +
      '<h1 class="plxg-h pt-h" style="color:' + (j.colorTitulo || "#FFD200") + '">' + esc(j.nombre) + "</h1>" +
      '<p class="pt-verbo">' + esc(j.verbo) + ".</p>" +
      '<p class="pt-u"><b>' + esc(alc.titulo) + "</b><span>" + n + " retos · velocidad " + nv.nombre + "</span></p>" +
      '<ol class="pt-reglas">' + reglas.map(function(r){ return "<li>" + esc(r) + "</li>"; }).join("") + "</ol>" +
      (j.aviso ? '<p class="pt-aviso">' + esc(j.aviso(alc) || "") + "</p>" : "") +
      '<div class="pt-rec">' + (rec ? '<div><small>Tu récord</small><b>' + rec.best.toLocaleString("es-CO") + "</b></div>" + G.estrellasHTML(rec.est || 0) + (j.sinFantasma ? "" : "<p>Tu fantasma corre contigo: arriba verás si vas por encima o por debajo de tu récord.</p>")
        : "<p>" + (j.sinFantasma ? "Aún no tienes récord aquí." : "Aún no tienes récord aquí. Tu primera partida será el fantasma a vencer.") + "</p>") + "</div>" +
      '<div class="pt-aj">' + sw("sonido", "Sonido", "Efectos del juego") + (j.sinReloj ? "" : sw("sinTiempo", "Sin tiempo", "Sin reloj y más lento")) + (navigator.vibrate ? sw("vibrar", "Vibración", "Al acertar y al fallar") : "") + "</div>" +
      '<button class="plxg-btn pt-go" data-h="jugar">Jugar</button>' +
    "</div></div>";
    var p = el.querySelector(".pt-aviso"); if (p && !p.textContent) p.remove();
    el.querySelector(".pt-go").focus({ preventScroll: true });
  };

  var partida = null;
  /* abre el arcade: sin alcance, en la lista de juegos; con alcance, directo en la portada de ese juego */
  var abrirArcade = function(alc, jid){
    var el = G.abrir(function(){ if (partida) { partida.destruye(); partida = null; } });
    var actual = alc || null, desdeHub = !alc, j = G.juegos[jid || "ff"] || FF;
    if (jid) HB.juego = jid;
    var acciones = {
      otra: function(){ jugar(); },
      cambiar: desdeHub ? function(){ hub(el); } : null,
      salir: function(){ partida = null; if (desdeHub) hub(el); else G.cerrar(); }
    };
    var jugar = function(){
      G.despiertaAudio();
      j = G.juegos[HB.juego] || j;
      partida = G.sesion(el, actual, j, acciones, j.opciones ? j.opciones(actual) : {});
    };
    el.onclick = function(e){
      var b = e.target.closest("[data-h]"); if (!b || b.disabled) return;
      var h = b.dataset.h;
      if (h === "salir") return G.cerrar();
      if (h === "hub") return hub(el);
      if (h === "juego") { HB.juego = b.dataset.j; lsSet2("plxg-juego", HB.juego); j = G.juegos[HB.juego]; var y = el.querySelector(".plxg-scroll").scrollTop; hub(el); el.querySelector(".plxg-scroll").scrollTop = y; return; }
      if (h === "tr") { HB.track = b.dataset.t; lsSet2("plxg-track", HB.track); var y2 = el.querySelector(".plxg-scroll").scrollTop; hub(el); el.querySelector(".plxg-scroll").scrollTop = y2; return; }
      if (h === "alc") { actual = ALC[b.dataset.k]; j = G.juegos[HB.juego] || FF; if (actual) portada(el, j, actual, true); return; }
      if (h === "aj") { var k = b.dataset.a; G.aj[k] = !G.aj[k]; G.guardaAj(); b.setAttribute("aria-checked", String(G.aj[k])); if (k === "sinTiempo") portada(el, j, actual, desdeHub); if (k === "sonido" && G.aj.sonido) G.sfx("tic"); return; }
      if (h === "jugar") return jugar();
    };
    if (alc) portada(el, j, alc, false); else hub(el);
  };
  G.arcade = abrirArcade;

  /* ---------------- pestaña Retos: sección Arcade ---------------- */
  var tarjeta = function(){
    var est = totalEstrellas(), js = G.listaJuegos();
    return '<h2 class="rg-h">Arcade <span class="am-new">Nuevo</span></h2>' +
      '<button class="plx46-arc" data-arcade="1"><span class="a-fr" aria-hidden="true">' + frutasDeco(5) + "</span>" +
      '<span class="a-tx"><small>' + js.length + (js.length === 1 ? " juego" : " juegos") + " · A1 a C1</small><b>Arcade</b><span>" + esc(js.length <= 3 ? js.map(function(g){ return g.nombre; }).join(" · ") : "Corta, arma, escucha, recuerda, investiga y habla. Y un jefe en cada unidad") + "." + (est ? " " + est + " estrellas ganadas." : "") + "</span></span>" +
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
  /* los juegos de los archivos siguientes se registran después: la tarjeta se pinta cuando ya están todos */
  var repinta = function(){ try { var c = document.querySelector(".plx46-arc"); if (c) { var h = c.previousElementSibling; if (h && h.classList.contains("rg-h")) h.remove(); c.remove(); } if (view === "retos") enRetos(); } catch (e) {} };
  if (document.readyState === "complete") repinta(); else window.addEventListener("load", repinta);

  /* ---------------- final de la lección: «Jugar el repaso» ---------------- */
  var repaso = function(){
    var pl = document.getElementById("player"); if (!pl || pl.hidden || pl.querySelector(".plx46-rep")) return;
    if (typeof P === "undefined" || !P || P.mode !== "lesson" || !P.lesson || P.phase !== "end") return;
    var a = G.alc.leccion(P.lesson); if (G.nRetos(FF, a) < G.MIN_RETOS) return;
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
    e.preventDefault(); e.stopPropagation(); abrirArcade(G.alc.leccion(l), "ff");
  }, true);

  /* ---------------- estilos ---------------- */
  var st = document.createElement("style"); st.id = "plx46";
  st.textContent = `
  /* Fruit Frenzy */
  .plxg.ff{touch-action:none;user-select:none;-webkit-user-select:none}
  .ff-cv{position:absolute;inset:0;touch-action:none;display:block}

  /* arcade y portada */
  .hb-top{display:flex;align-items:center;gap:12px;margin-bottom:18px}
  .hb-top .plxg-k{margin:0}
  .hb-lead{margin:10px 0 6px;color:#C9D6F5;max-width:46ch}
  .hb-juegos{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .hb-game{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-rows:auto 1fr;gap:8px;align-content:start;padding:12px 12px 14px;border-radius:18px;min-height:150px;
    background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.18)}
  .hb-game.on{background:linear-gradient(135deg,color-mix(in srgb,var(--ac) 26%,transparent),rgba(255,210,0,.06));box-shadow:inset 0 0 0 2px var(--ac)}
  .hb-game:focus-visible{outline:3px solid #93C5FD;outline-offset:2px}
  .hb-gt{display:grid;gap:2px;min-width:0}
  .hb-gt small{font:700 10.5px/1.3 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#FFD200}
  .hb-gt b{font:800 16px/1.1 Poppins,system-ui,sans-serif;text-transform:uppercase;color:#fff;overflow-wrap:anywhere}
  .hb-gt span{font-size:12.5px;line-height:1.35;color:#DCE6FF}
  .hb-game.on .hb-gt b{color:#FFD200}
  .hb-fr{position:relative;width:72px;height:56px;display:block}
  .hb-fr img{position:absolute;width:38px;height:38px;left:calc(var(--i) * 11px);top:calc(9px + (var(--i) - 1.5) * (var(--i) - 1.5) * 4px)}
  .hb-fr svg{width:56px;height:56px;display:block;margin:0 auto}
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
  .pt-fr svg{height:74px;width:auto;display:block}
  @keyframes ptFl{from{transform:translateY(0) rotate(-8deg)}to{transform:translateY(-8px) rotate(8deg)}}
  .pt-h{font-size:clamp(34px,11vw,54px)}
  .pt-verbo{margin:6px 0 0;font:700 18px/1.3 Poppins,system-ui,sans-serif;color:#fff}
  .pt-u{margin:16px 0 0;padding:12px 0;border-top:1px solid #2A4A8E;border-bottom:1px solid #2A4A8E;display:grid;gap:2px}
  .pt-u b{font:700 16px/1.3 Poppins,system-ui,sans-serif;color:#fff}
  .pt-u span{font-size:13px;color:#A6B6E0}
  .pt-reglas{margin:14px 0 0;padding:0;list-style:none;counter-reset:r;display:grid;gap:8px}
  .pt-reglas li{counter-increment:r;display:grid;grid-template-columns:26px 1fr;gap:8px;color:#DCE6FF;font-size:14.5px}
  .pt-reglas li::before{content:counter(r);font:800 13px/24px Poppins,system-ui,sans-serif;text-align:center;width:24px;height:24px;border-radius:8px;background:rgba(255,210,0,.16);color:#FFD200}
  .pt-aviso{margin:14px 0 0;padding:10px 12px;border-radius:12px;background:rgba(255,210,0,.1);color:#FFE58A;font-size:13.5px}
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
