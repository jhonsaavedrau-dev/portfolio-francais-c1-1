/* PLEX PLAY 2.2.0 — Audio que siempre suena y efectos de juego para todo el Arcade
   Audio
   - Los juegos piden audio con speak(texto): suena el mp3 del mapa AUDIO y, si no hay, la voz del dispositivo.
     En la app de Android la WebView no trae voces (speechSynthesis vacío): ahora usa la voz francesa nativa del
     teléfono (PlexAndroid.ttsSpeak, app 1.8 / puente 6). Sin ninguna de las dos, el aviso de siempre.
   - El vocabulario (vocab.js) trae mp3 de muchas palabras que los juegos usan en las lecciones: se carga al
     arrancar (en segundo plano) para que esos audios existan aunque no se haya abierto el vocabulario.
   - Un texto que es claramente español no se lee con voz francesa.
   Efectos (en todas las partidas, por encima de cada motor)
   - Partículas al acertar (confeti y chispas del color del juego), onda expansiva, anuncio de combo ×2 ×3 ×4,
     fragmentos rojos y destello al fallar, fondo animado con luces del color del juego.
   - Sonidos nuevos generados con Web Audio (respetan «Sonido» del Arcade): brillo, combo, explosión, láser,
     carta, motor, tic-tac, atrapar y barrido; PLXG.fx(nombre) los toca desde cualquier juego. */
(function(){
  "use strict";
  var G = window.PLXG || null;

  /* ================= audio ================= */
  var nativo = function(){ try { return !!(window.PlexAndroid && PlexAndroid.ttsAvailable && PlexAndroid.ttsAvailable()); } catch (e) { return false; } };
  var limpio = function(t){ try { return typeof stripTags === "function" ? stripTags(t) : String(t).replace(/<[^>]*>/g, ""); } catch (e) { return String(t || ""); } };
  /* español (o pistas de pronunciación «a la española» de Primeros pasos): no se leen con voz francesa */
  var PISTAS = /^(ash|kü|dubl-ve|i-grek)$/i;
  var pareceEs = function(t){
    if (PISTAS.test(t.trim())) return true;
    return /[ñ¿¡]/.test(t) || (/\b(el|los|las|una|está|estoy|soy|tengo|hola|gracias|por|favor|qué|cómo|dónde|muy|pero|llamo|mi|para|con|sin|haber|cuando|tanto|alegra|verte|llegues|comido|saliendo)\b/i.test(t) &&
      !/[çœàèùâêîôûë]|\b(je|tu|il|nous|vous|le|la|les|un|une|des|est|et|de|du|au|aux|ne|pas)\b|'/i.test(t));
  };
  if (typeof deviceSpeak === "function") {
    var _ds = deviceSpeak;
    deviceSpeak = function(text, slow){
      var t = limpio(text || "");
      if (!t) return false;
      if (pareceEs(t)) return false;
      if (nativo()) {
        try { PlexAndroid.ttsSpeak(t, (slow ? .65 : .95) * (typeof SPEED === "number" ? SPEED : 1)); return true; } catch (e) {}
      }
      return _ds.apply(this, arguments);
    };
  }
  if (typeof stopAudio === "function") {
    var _stop = stopAudio;
    stopAudio = function(){ try { if (window.PlexAndroid && PlexAndroid.ttsStop) PlexAndroid.ttsStop(); } catch (e) {} return _stop.apply(this, arguments); };
  }
  /* vocab.js en segundo plano: sus mp3 sirven a los juegos de las lecciones */
  var precarga = function(){ try { if (G && G.vocab && !window.__VOCAB) G.vocab(); } catch (e) {} };
  if ("requestIdleCallback" in window) requestIdleCallback(precarga, { timeout: 6000 }); else setTimeout(precarga, 3000);

  if (!G || !G.sesion) return;

  /* datos: Voice Duel no pide decir frases en español; Memory Rush no «lee» en francés una columna en español */
  var arregla = function(){
    var vd = G.juegos.vd; if (vd && vd.apto && !vd.__es) {
      var a0 = vd.apto;
      vd.apto = function(r){
        if (!a0(r) || (r.q && pareceEs(String(r.q)))) return false;
        var it = r.key && typeof ITEMS !== "undefined" && ITEMS[r.key] && ITEMS[r.key].it;   /* «¿Qué significa?»: la respuesta está en español */
        return !(it && it.gen && /significa/i.test(it.ask || ""));
      };
      vd.__es = 1;
    }
    var mr = G.juegos.mr; if (mr && mr.retos && !mr.__es) {
      var r0 = mr.retos;
      mr.retos = function(alc){ var rs = r0.apply(this, arguments) || []; rs.forEach(function(r){ if (r.pares && r.voz) [0, 1].forEach(function(l){ if (r.voz[l] && r.pares.some(function(pp){ return pareceEs(String(pp[l])); })) r.voz[l] = false; }); }); return rs; };
      mr.__es = 1;
    }
  };
  arregla();

  /* ================= sonidos ================= */
  var AC = null;
  var ctx = function(){
    if (!G.aj || !G.aj.sonido) return null;
    try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); return AC; } catch (e) { return null; }
  };
  var tono = function(a, f, t, d, tipo, v, f2){
    var o = a.createOscillator(), g = a.createGain(); o.type = tipo || "sine"; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || .15, t + .012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .02);
  };
  var ruido = function(a, t, d, f1, f2, v, tipo){
    var n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), c = b.getChannelData(0);
    for (var i = 0; i < n; i++) c[i] = Math.random() * 2 - 1;
    var s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
    s.buffer = b; fl.type = tipo || "bandpass"; fl.frequency.setValueAtTime(f1, t); fl.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t + d);
    g.gain.setValueAtTime(v || .2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl).connect(g).connect(a.destination); s.start(t); s.stop(t + d);
  };
  G.fx = function(nombre, x){
    var a = ctx(); if (!a) return; var t = a.currentTime + .005;
    try {
      switch (nombre) {
        case "brillo": [1568, 2093, 2637].forEach(function(f, i){ tono(a, f * (1 + (x || 0) * .03), t + i * .04, .16, "sine", .06); }); break;
        case "combo": [523, 659, 784, 1047, 1319].forEach(function(f, i){ tono(a, f * Math.pow(1.12, (x || 2) - 2), t + i * .05, .3, "triangle", .12); }); ruido(a, t, .4, 2000, 8000, .06, "highpass"); break;
        case "boom": ruido(a, t, .9, 900, 60, .55, "lowpass"); tono(a, 90, t, .6, "sine", .5, 30); break;
        case "pew": tono(a, 1400, t, .16, "square", .06, 220); break;
        case "carta": ruido(a, t, .08, 3000, 6000, .18, "highpass"); tono(a, 900, t + .02, .06, "triangle", .06); break;
        case "motor": tono(a, 70, t, .35, "sawtooth", .07, 140); break;
        case "tictac": tono(a, x ? 1800 : 1200, t, .04, "square", .05); break;
        case "atrapa": tono(a, 600, t, .1, "sine", .18, 1200); break;
        case "barrido": ruido(a, t, .25, 400, 3000, .12); break;
        case "gana": [392, 523, 659, 784, 1047].forEach(function(f, i){ tono(a, f, t + i * .09, .35, "triangle", .15); }); break;
        case "pierde": [392, 330, 262].forEach(function(f, i){ tono(a, f, t + i * .14, .3, "triangle", .12); }); break;
        case "unido": tono(a, 660, t, .12, "sine", .15); tono(a, 990, t + .1, .2, "sine", .15); break;
      }
    } catch (e) {}
  };
  /* el acierto de siempre con un brillo encima */
  if (G.sfx) { var _sfx = G.sfx; G.sfx = function(n, x){ _sfx.apply(this, arguments); if (n === "bien") G.fx("brillo", x); }; }

  /* ================= partículas ================= */
  var Particulas = function(host){
    var cv = document.createElement("canvas"); cv.className = "fx-cv"; cv.setAttribute("aria-hidden", "true"); host.appendChild(cv);
    var c = cv.getContext("2d"), ps = [], ondas = [], raf = 0, dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0;
    var mide = function(){ var r = host.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
    mide(); window.addEventListener("resize", mide);
    var paso = function(){
      raf = 0; c.clearRect(0, 0, W, H);
      ondas = ondas.filter(function(o){ o.t += 1 / 60; var k = o.t / o.d; if (k >= 1) return false;
        c.beginPath(); c.arc(o.x, o.y, o.r0 + (o.r1 - o.r0) * (1 - Math.pow(1 - k, 3)), 0, Math.PI * 2); c.strokeStyle = o.c; c.globalAlpha = 1 - k; c.lineWidth = 4 * (1 - k) + 1; c.stroke(); c.globalAlpha = 1; return true; });
      ps = ps.filter(function(p){
        p.t += 1 / 60; if (p.t >= p.d) return false;
        p.vy += p.g / 60; p.vx *= .985; p.x += p.vx / 60; p.y += p.vy / 60; p.a += p.va / 60;
        var k = 1 - p.t / p.d; c.save(); c.globalAlpha = Math.min(1, k * 1.6); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = p.c;
        if (p.f === "r") c.fillRect(-p.s, -p.s * .45, p.s * 2, p.s * .9);
        else if (p.f === "e") { c.beginPath(); for (var i = 0; i < 10; i++) { var rr = i % 2 ? p.s * .45 : p.s; c.lineTo(Math.cos(i * Math.PI / 5) * rr, Math.sin(i * Math.PI / 5) * rr); } c.closePath(); c.fill(); }
        else { c.beginPath(); c.arc(0, 0, p.s * k, 0, Math.PI * 2); c.fill(); }
        c.restore(); return true;
      });
      if (ps.length || ondas.length) raf = requestAnimationFrame(paso);
    };
    var arranca = function(){ if (!raf) raf = requestAnimationFrame(paso); };
    return {
      estalla: function(x, y, o){
        o = o || {}; var n = o.n || 18, cols = o.cols || ["#FFD200", "#fff"], v = o.v || 420;
        for (var i = 0; i < n; i++) {
          var a = o.arriba ? -Math.PI / 2 + (Math.random() - .5) * 2.2 : Math.random() * Math.PI * 2, sp = v * (.35 + Math.random() * .75);
          ps.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: o.g == null ? 700 : o.g, a: Math.random() * 6, va: (Math.random() - .5) * 14,
            s: (o.s || 5) * (.6 + Math.random() * .8), c: cols[i % cols.length], f: o.f || (i % 3 === 0 ? "e" : i % 3 === 1 ? "r" : "c"), t: 0, d: (o.d || .9) * (.7 + Math.random() * .6) });
        }
        arranca();
      },
      onda: function(x, y, c, r1){ ondas.push({ x: x, y: y, r0: 8, r1: r1 || 90, c: c || "#FFD200", t: 0, d: .5 }); arranca(); },
      destruye: function(){ cancelAnimationFrame(raf); window.removeEventListener("resize", mide); cv.remove(); }
    };
  };

  /* ================= cada partida con efectos ================= */
  var anuncio = function(el, html, clase){
    var d = document.createElement("div"); d.className = "fx-anuncio " + (clase || ""); d.innerHTML = html; el.appendChild(d);
    setTimeout(function(){ d.remove(); }, 1300);
  };
  var _sesion = G.sesion;
  G.sesion = function(el, alc, juego, acciones, opc){
    var r = _sesion.apply(this, arguments), s = r && r.s; if (!s) return r;
    var color = (juego && juego.color) || "#FFD200", mov = s.mov;
    el.style.setProperty("--jc", color);
    var bg = document.createElement("div"); bg.className = "fx-bg"; bg.setAttribute("aria-hidden", "true"); bg.innerHTML = "<i></i><i></i><i></i><i></i><i></i><i></i>"; el.insertBefore(bg, el.firstChild);
    var P = mov ? null : Particulas(el), mult = 1;
    var aciert = s.acierto, fallo = s.fallo, pena = s.penaliza;
    s.acierto = function(re, o){
      var out = aciert.apply(this, arguments); o = o || {};
      if (P && o.x != null) { P.estalla(o.x, o.y, { cols: [color, "#FFD200", "#fff", "#6BE58E"], n: o.final === false ? 8 : 20 }); P.onda(o.x, o.y, color); }
      var m = s.pts.mult();
      if (m > mult && m > 1) {
        G.fx("combo", m); anuncio(el, "<small>COMBO</small><b>×" + m + "</b>", "combo");
        if (P) P.estalla(el.clientWidth / 2, el.clientHeight * .42, { n: 46, v: 620, cols: ["#FFD200", color, "#fff", "#F472B6", "#60A5FA"], s: 6, d: 1.3 });
      }
      mult = m;
      return out;
    };
    s.fallo = function(){
      mult = 1;
      if (P) P.estalla(el.clientWidth / 2, el.clientHeight * .45, { n: 22, cols: ["#E5484D", "#FF8A8F", "#3B1D2A"], f: "r", v: 360, g: 900 });
      el.classList.remove("fx-rojo"); void el.offsetWidth; el.classList.add("fx-rojo");
      return fallo.apply(this, arguments);
    };
    s.penaliza = function(x, y){ mult = 1; if (P && x != null) P.estalla(x, y, { n: 8, cols: ["#94A3B8", "#E5484D"], v: 200, s: 4, f: "c" }); return pena.apply(this, arguments); };
    var ban = s.banner, ultimo = "";
    s.banner = function(html){ if (html && html !== ultimo) { G.fx("barrido"); var b = el.querySelector(".plxg-ban"); if (b && !mov) { b.classList.remove("fx-entra"); void b.offsetWidth; b.classList.add("fx-entra"); } } ultimo = html || ""; return ban.apply(this, arguments); };
    s.efectos = P;   /* los motores pueden pedir estallidos propios (explosión, disparo…) */
    var des = r.destruye;
    r.destruye = function(){ if (P) P.destruye(); bg.remove(); return des.apply(this, arguments); };
    /* al terminar la partida (la sesión se destruye sola antes de mostrar resultados) */
    var obs = new MutationObserver(function(){ if (el.querySelector(".plxg-res")) { obs.disconnect(); if (P) { P.destruye(); P = null; } bg.remove(); var gana = !!el.querySelector(".plxg-res .plxg-est .on, .plxg-res .on"); G.fx(gana ? "gana" : "pierde"); } });
    obs.observe(el, { childList: true, subtree: true });
    return r;
  };

  var st = document.createElement("style"); st.id = "plx57";
  st.textContent = `
  .fx-cv{position:absolute;inset:0;pointer-events:none;z-index:6}
  .fx-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0}
  .fx-bg i{position:absolute;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--jc,#FFD200) 55%,transparent),transparent 70%);opacity:.22;animation:fxFlota 14s ease-in-out infinite alternate;will-change:transform}
  .fx-bg i:nth-child(1){width:220px;height:220px;left:-60px;top:12%;animation-duration:16s}
  .fx-bg i:nth-child(2){width:140px;height:140px;right:-30px;top:30%;animation-duration:12s;animation-delay:-4s}
  .fx-bg i:nth-child(3){width:90px;height:90px;left:30%;bottom:8%;animation-duration:10s;animation-delay:-2s}
  .fx-bg i:nth-child(4){width:260px;height:260px;right:10%;bottom:-120px;animation-duration:18s;opacity:.15}
  .fx-bg i:nth-child(5){width:40px;height:40px;left:70%;top:14%;animation-duration:8s;opacity:.35}
  .fx-bg i:nth-child(6){width:24px;height:24px;left:14%;top:60%;animation-duration:7s;opacity:.4}
  @keyframes fxFlota{to{transform:translate(40px,-50px) scale(1.25)}}
  .plxg-zona{z-index:1}
  .plxg.fx-rojo::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:7;box-shadow:inset 0 0 120px 30px rgba(229,72,77,.7);animation:fxRojo .6s ease-out forwards}
  @keyframes fxRojo{from{opacity:1}to{opacity:0}}
  .plxg-ban.fx-entra{animation:fxEntra .35s cubic-bezier(.2,1.4,.4,1)}
  @keyframes fxEntra{from{transform:translateY(-14px) scale(.96);opacity:0}}
  .fx-anuncio{position:absolute;left:50%;top:40%;z-index:8;pointer-events:none;display:grid;justify-items:center;transform:translate(-50%,-50%);animation:fxAnuncio 1.3s cubic-bezier(.2,1.3,.4,1) forwards}
  .fx-anuncio small{font:900 16px/1 Poppins,system-ui,sans-serif;letter-spacing:.3em;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.5)}
  .fx-anuncio b{font:900 92px/1 Poppins,system-ui,sans-serif;color:#FFD200;-webkit-text-stroke:3px #081F55;text-shadow:0 8px 0 #081F55,0 0 40px rgba(255,210,0,.8)}
  @keyframes fxAnuncio{0%{transform:translate(-50%,-50%) scale(.2) rotate(-18deg);opacity:0}25%{transform:translate(-50%,-50%) scale(1.15) rotate(4deg);opacity:1}70%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-80%) scale(.9);opacity:0}}
  @media (prefers-reduced-motion:reduce){.fx-bg i,.fx-anuncio,.plxg-ban.fx-entra{animation:none!important}.fx-anuncio{display:none}}
  `;
  document.head.appendChild(st);
})();
