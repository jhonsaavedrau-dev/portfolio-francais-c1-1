/* PLEX PLAY 2.1.0 — Diez juegos nuevos en el Arcade (y dentro de las lecciones)
   Todos corren en la sesión común de plx45 (puntos, combo, vidas, pausa, momento de aprendizaje, resultados, XP,
   racha y carnet), con los mismos retos de las lecciones y del vocabulario:
   - Bomb Countdown: una bomba con mecha; cada respuesta equivocada la acorta. Si explota, pierdes una vida.
   - Grammar Run: el gato corre solo; en cada puerta hay respuestas por carril y hay que ponerse en la correcta.
   - Target Words: blancos que se mueven; dispara solo a las palabras de la categoría (o a la correcta).
   - Word Catcher: las palabras caen; mueve la canasta para atrapar solo las que cumplen la condición.
   - Sentence Race: arma la frase pieza por pieza; cada pieza correcta hace avanzar tu auto contra dos rivales.
   - Card Chaos: tienes una mano de cartas; juega la que completa el reto. Comodín y manos que se barajan solas.
   - Combo Mode: mini-retos de todos los tipos seguidos (elegir, categoría, ordenar, detective) para subir el multiplicador.
   - Word Battle: dos jugadores en el mismo teléfono (o contra Manzana): gana el punto quien toca primero la correcta.
   - Team Challenge: el equipo se pasa el teléfono por turnos y colabora para cumplir una meta antes de que acabe el tiempo.
   - Language Adventure: un mapa con cinco zonas (vocabulario, escucha, gramática, escritura y voz); cada zona se juega
     con el motor de su habilidad.
   Los motores solo presentan retos; todo lo demás es de PLXG.sesion. */
(function(){
  "use strict";
  var G = window.PLXG; if (!G || !G.sesion || !G.registrar) return;
  var esc = G.esc, mezcla = G.mezcla, norm = G.norm;

  /* ---------------- piezas comunes ---------------- */
  var BOCINA = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor"/><path d="M13 7a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  var suena = function(t){ if (!t) return; try { var p = speak(t); if (p && typeof p.catch === "function") p.catch(function(){}); } catch (e) {} };
  var callaVoz = function(){ try { if (typeof stopAudio === "function") stopAudio(); } catch (e) {} try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} };
  var fx = function(n, x){ try { if (G.fx) G.fx(n, x); } catch (e) {} };
  var chispas = function(s, x, y, o){ try { if (s.efectos) s.efectos.estalla(x, y, o); } catch (e) {} };
  var entre = function(a, x, b){ return Math.max(a, Math.min(b, x)); };
  var q = function(r){ return esc(r.q || "").replace(/_{2,}/, '<span class="hueco">___</span>'); };
  /* instrucción + pregunta (con botón para oír si el reto es de audio) */
  var pregunta = function(r, extra){
    return '<p class="plxg-ask">' + esc(r.ask || "") + "</p>" +
      (r.q ? '<p class="plxg-q" lang="fr">' + q(r) + "</p>" : "") +
      (r.audio ? '<button type="button" class="x-oir" data-x-oir aria-label="Escuchar otra vez">' + BOCINA + "<span>Escuchar</span></button>" : "") + (extra || "");
  };
  /* ¿la respuesta está en francés? (solo así tiene sentido una trampa de ortografía) */
  var enFrances = function(r, w){
    if (!w || r.modo === "voc" || r.tipo === "orden" || /[ñ¿¡áíóú]|\d|→/.test(w) || w.length < 3) return false;
    if (/español|en espagnol|significa|traduc/i.test((r.ask || "") + " " + (r.q || ""))) return false;
    return !/\b(el|los|las|una|es|está|y|con|para|muy|pero|qué|cómo|sí)\b/i.test(w);
  };
  /* trampas: la misma palabra mal escrita (tildes, consonantes dobles, letras mudas…), sin palabras reales del curso */
  var trampas = function(r, w, nivel, cuantas){
    if (!G.malEscritas || !enFrances(r, w)) return [];
    try { return G.malEscritas(w, nivel).filter(function(x){ return norm(x) !== norm(w); }).slice(0, cuantas); } catch (e) { return []; }
  };
  /* cuántas opciones: más a mayor nivel (A1 3–4, B1 4–5, C1 5), sin pasar del máximo del juego */
  var cuantas = function(s, max){ return Math.min(max, Math.max(3, s.dir.opciones() + 1 + (s.nivel > 0 ? 1 : 0))); };
  /* opciones de un reto «uno»: la correcta, trampas de ortografía y distractores del ejercicio, mezcladas */
  var opcs = function(r, n, s){
    var ok = r.correcta[0], nv = s ? s.nivel : 0, vistos = {}; vistos[norm(ok)] = 1;
    var tr = trampas(r, ok, nv, nv === 0 ? 1 : 2);
    var m = tr.concat(r.malas || []).filter(function(x){ var k = norm(x); if (vistos[k]) return false; vistos[k] = 1; return true; });
    m = m.slice(0, Math.max(1, n - 1));
    return mezcla([{ t: ok, ok: true }].concat(m.map(function(x){ return { t: x, ok: false }; })));
  };
  /* para el juego en línea (plx58): el anfitrión arma las opciones una vez y las comparte */
  G.opcionesReto = function(r, n, nivel){ return opcs(r, n, { nivel: nivel || 0 }); };
  var centro = function(el, zona){ var a = el.getBoundingClientRect(), b = zona.getBoundingClientRect(); return { x: a.left - b.left + a.width / 2, y: a.top - b.top }; };
  /* escucha los botones «Escuchar» del banner (el banner está fuera de la zona del motor) */
  var oidoBanner = function(s){
    var f = function(e){ var b = e.target.closest && e.target.closest("[data-x-oir]"); if (b && s.reto && s.reto.audio) { G.despiertaAudio(); suena(s.reto.audio); } };
    s.el.addEventListener("click", f);
    return function(){ s.el.removeEventListener("click", f); };
  };
  var botones = function(ops, revela, extra){
    return ops.map(function(o, i){
      return '<button type="button" class="x-op' + (o.mal ? " mal" : "") + (o.ok && revela ? " bien" : "") + '" data-i="' + i + '"' + (o.mal ? ' disabled aria-disabled="true"' : "") + (extra ? " " + extra : "") + ">" +
        '<small aria-hidden="true">' + (i + 1) + '</small><span lang="fr">' + esc(o.t) + "</span></button>";
    }).join("");
  };
  var aptoUno = function(r){ return r.tipo === "uno" && r.correcta && r.correcta.length === 1 && r.malas && r.malas.length >= 1; };
  var aptoVarios = function(r){ return r.tipo === "varios" && r.correcta && r.correcta.length >= 1 && r.malas && r.malas.length >= 1 && r.correcta.length + r.malas.length >= 3; };
  var aptoOrden = function(r){ return r.tipo === "orden" && r.correcta && r.correcta.length >= 3 && r.correcta.length <= 8; };
  var reglasBase = function(alc, extra){ return [(G.aj.sinTiempo ? "Sin tiempo: " + (alc.repaso ? 10 : 15) + " retos" : alc.seg + " segundos") + " y 3 vidas."].concat(extra); };
  var deco = function(emoji, fondo){ return '<svg viewBox="0 0 72 56" aria-hidden="true"><circle cx="36" cy="28" r="24" fill="' + fondo + '" opacity=".25"/><circle cx="36" cy="28" r="18" fill="' + fondo + '"/><text x="36" y="36" text-anchor="middle" font-size="22">' + emoji + "</text></svg>"; };
  /* las palabras de un reto «varios» (o «uno») para juegos de blancos: [correctas, malas] */
  var grupos = function(r, maxOk, maxMal){
    if (r.tipo === "varios") return [mezcla(r.correcta).slice(0, maxOk), mezcla(r.malas).slice(0, maxMal)];
    var ok = r.correcta[0], tr = trampas(r, ok, 1, 2), vistos = {}; vistos[norm(ok)] = 1;
    return [[ok], tr.concat(mezcla(r.malas)).filter(function(x){ var k = norm(x); if (vistos[k]) return false; vistos[k] = 1; return true; }).slice(0, maxMal)];
  };

  /* ================= 1. Bomb Countdown ================= */
  var BOMBA = '<svg viewBox="0 0 120 120" aria-hidden="true"><path class="bc-mecha" pathLength="100" d="M78 30 C 86 14, 100 12, 110 20"/><circle class="bc-chispa" cx="110" cy="20" r="5"/>' +
    '<rect x="62" y="26" width="18" height="14" rx="3" transform="rotate(28 71 33)" fill="#2B3A67"/><circle cx="56" cy="70" r="40" fill="#1B2344"/><circle cx="42" cy="54" r="9" fill="#fff" opacity=".18"/></svg>';
  function motorBomba(zona, s){
    zona.innerHTML = '<div class="x56 bc"><div class="bc-escena"><div class="bc-bomba">' + BOMBA + '<b class="bc-n" aria-hidden="true"></b></div><p class="x-nota" aria-live="polite"></p></div><div class="x-ops" role="group" aria-label="Respuestas"></div></div>';
    var raiz = zona.firstChild, opsEl = raiz.querySelector(".x-ops"), bomba = raiz.querySelector(".bc-bomba"), num = raiz.querySelector(".bc-n"), nota = raiz.querySelector(".x-nota");
    var reto = null, ops = [], T = 0, t = 0, hecho = false, cierre = -1, PEN = 3, quita = oidoBanner(s);
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 8) + "px"; };
    var pinta = function(){ opsEl.innerHTML = botones(ops, hecho); };
    var limpia = function(){ reto = null; ops = []; opsEl.innerHTML = ""; nota.textContent = ""; bomba.classList.remove("boom", "ok", "poco"); };
    var explota = function(){
      hecho = true; bomba.classList.add("boom"); pinta(); fx("boom");
      var bc = centro(bomba, zona); chispas(s, bc.x, bc.y + bomba.offsetHeight / 2, { n: 60, v: 700, cols: ["#FF6B3D", "#FFD200", "#fff", "#3B1D2A"], s: 7, d: 1.2 });
      raiz.classList.remove("bc-flash"); void raiz.offsetWidth; raiz.classList.add("bc-flash");
      s.fallo(reto, { mal: "La bomba explotó", etMal: "💥", etiqueta: "Era", bien: reto.correcta[0] }).then(function(){ limpia(); s.listo(); });
    };
    var elige = function(i, b){
      if (!reto || hecho || s.estado() !== "juega") return;
      var o = ops[i]; if (!o || o.mal) return;
      var p = b ? centro(b, zona) : { x: zona.clientWidth / 2, y: zona.clientHeight / 2 };
      if (o.ok) { hecho = true; cierre = .6; bomba.classList.add("ok"); fx("unido"); s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: p.x, y: p.y }); nota.textContent = "¡Bomba desactivada!"; pinta(); return; }
      o.mal = true; t = Math.min(T, t + PEN); s.penaliza(p.x, p.y); nota.textContent = "−" + PEN + " s: la mecha se acorta"; pinta();
      if (!s.mov) { bomba.classList.remove("sacude"); void bomba.offsetWidth; bomba.classList.add("sacude"); }
      if (t >= T) explota();
    };
    var clic = function(e){ var b = e.target.closest && e.target.closest("[data-i]"); if (b && zona.contains(b)) { e.preventDefault(); elige(+b.dataset.i, b); } };
    zona.addEventListener("click", clic); window.addEventListener("resize", coloca);
    return {
      jugar: function(r){
        reto = r; t = 0; hecho = false; cierre = -1;
        T = s.dir.t() * 1.3 + 3.5 + (r.audio ? 1.5 : 0); PEN = Math.max(2, Math.round(T * .28));
        ops = opcs(r, cuantas(s, 5), s); s.banner(pregunta(r), { oro: r.oro }); coloca(); pinta(); nota.textContent = "";
        bomba.style.setProperty("--m", 1); if (r.audio) suena(r.audio);
      },
      tick: function(dt){
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) { limpia(); s.listo(); } return; }
        if (hecho || !dt) return;
        t += dt; var r = Math.max(0, T - t);
        if (num.textContent !== String(Math.ceil(r))) fx("tictac", r < 3);
        num.textContent = Math.ceil(r); bomba.style.setProperty("--m", (r / T).toFixed(3)); bomba.classList.toggle("poco", r < 3);
        if (t >= T) explota();
      },
      tecla: function(e){ if (/^[1-4]$/.test(e.key)) { var b = opsEl.querySelectorAll(".x-op")[+e.key - 1]; if (b) { e.preventDefault(); elige(+b.dataset.i, b); } } },
      pausa: function(){ raiz.classList.add("x-pausa"); callaVoz(); }, sigue: function(){ raiz.classList.remove("x-pausa"); },
      destruye: function(){ zona.removeEventListener("click", clic); window.removeEventListener("resize", coloca); quita(); callaVoz(); },
      depura: function(){ return { T: T, t: t, ops: ops.map(function(o){ return o.t + (o.ok ? "*" : ""); }) }; }
    };
  }

  /* ================= 2. Grammar Run ================= */
  function motorCarrera(zona, s){
    zona.innerHTML = '<div class="x56 gr"><div class="gr-pista"><div class="gr-suelo"></div><div class="gr-lineas"></div><div class="gr-puerta" hidden></div>' +
      '<div class="gr-corredor" aria-hidden="true"><img src="img/arcade/heroe.webp" alt=""></div></div>' +
      '<div class="gr-mandos"><button type="button" data-gr="-1" aria-label="Carril a la izquierda">‹</button><p class="x-nota" aria-live="polite"></p><button type="button" data-gr="1" aria-label="Carril a la derecha">›</button></div></div>';
    var raiz = zona.firstChild, pista = raiz.querySelector(".gr-pista"), suelo = raiz.querySelector(".gr-suelo"), lineas = raiz.querySelector(".gr-lineas"), puerta = raiz.querySelector(".gr-puerta"),
      corr = raiz.querySelector(".gr-corredor"), nota = raiz.querySelector(".x-nota");
    var reto = null, ops = [], n = 3, carril = 1, T = 0, t = 0, tSel = 0, hecho = false, cierre = -1, fondo = 0, quita = oidoBanner(s);
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 6) + "px"; };
    var ponCarril = function(k){
      if (!reto || hecho || s.estado() !== "juega") return;
      k = entre(0, k, n - 1); if (k === carril) return; carril = k; tSel = t;
      corr.style.left = ((carril + .5) / n * 100) + "%"; fx("barrido");
    };
    var lineasHTML = function(){ var h = ""; for (var i = 1; i < n; i++) h += '<i style="left:' + (i / n * 100) + '%"></i>'; lineas.innerHTML = h; };
    var juzga = function(){
      hecho = true; var o = ops[carril];
      puerta.querySelectorAll("span").forEach(function(sp, i){ sp.classList.add(ops[i].ok ? "bien" : "mal"); });
      var p = { x: pista.clientWidth * (carril + .5) / n, y: pista.clientHeight - 120 };
      if (o.ok) { corr.classList.remove("cae"); corr.classList.add("salta"); cierre = .55; fx("atrapa"); s.acierto(reto, { rapidez: Math.max(0, 1 - tSel / T), x: p.x, y: p.y }); nota.textContent = "¡Pasaste!"; return; }
      corr.classList.add("cae");
      s.fallo(reto, { mal: o.t, etMal: "Ibas por", etiqueta: "Correcta", bien: reto.correcta[0] }).then(function(){ limpia(); s.listo(); });
    };
    var limpia = function(){ reto = null; puerta.hidden = true; puerta.innerHTML = ""; corr.classList.remove("salta", "cae"); nota.textContent = ""; };
    var clic = function(e){
      var b = e.target.closest && e.target.closest("[data-gr]");
      if (b) { e.preventDefault(); ponCarril(carril + +b.dataset.gr); return; }
      if (pista.contains(e.target)) { var r = pista.getBoundingClientRect(); ponCarril(Math.floor((e.clientX - r.left) / r.width * n)); }
    };
    zona.addEventListener("click", clic); window.addEventListener("resize", coloca);
    return {
      jugar: function(r){
        reto = r; hecho = false; cierre = -1; t = 0; tSel = 0;
        ops = opcs(r, 3, s); n = ops.length;
        carril = Math.min(carril, n - 1); corr.style.left = ((carril + .5) / n * 100) + "%";
        T = s.dir.t() * .95 + 2.6 + (r.audio ? 1.5 : 0);
        lineasHTML();
        puerta.innerHTML = ops.map(function(o){ return '<span lang="fr">' + esc(o.t) + "</span>"; }).join("");
        puerta.style.gridTemplateColumns = "repeat(" + n + ",1fr)"; puerta.hidden = false; puerta.style.top = "0%";
        s.banner(pregunta(r), { oro: r.oro }); coloca(); nota.textContent = "Toca un carril o usa ‹ ›";
        if (r.audio) suena(r.audio);
      },
      tick: function(dt, d){
        fondo += (d || 0) * 260; suelo.style.backgroundPositionY = Math.round(fondo % 80) + "px";
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; puerta.style.top = Math.min(100, (t / T) * 78 + (.55 - cierre) * 40) + "%"; if (cierre < 0) { limpia(); s.listo(); } return; }
        if (hecho || !dt) return;
        t += d || dt; puerta.style.top = ((t / T) * 78) + "%";
        if (t >= T) juzga();
      },
      tecla: function(e){
        if (e.key === "ArrowLeft") { e.preventDefault(); ponCarril(carril - 1); }
        else if (e.key === "ArrowRight") { e.preventDefault(); ponCarril(carril + 1); }
        else if (/^[1-3]$/.test(e.key)) { e.preventDefault(); ponCarril(+e.key - 1); }
      },
      pausa: function(){ raiz.classList.add("x-pausa"); callaVoz(); }, sigue: function(){ raiz.classList.remove("x-pausa"); },
      destruye: function(){ zona.removeEventListener("click", clic); window.removeEventListener("resize", coloca); quita(); callaVoz(); },
      depura: function(){ return { carril: carril, n: n, T: T, t: t, ops: ops.map(function(o){ return o.t + (o.ok ? "*" : ""); }) }; }
    };
  }

  /* ================= 3. Target Words ================= */
  function motorDiana(zona, s){
    zona.innerHTML = '<div class="x56 tw"><div class="x-reloj"><i></i></div><div class="tw-campo" role="group" aria-label="Blancos"></div><p class="x-nota" aria-live="polite"></p></div>';
    var raiz = zona.firstChild, campo = raiz.querySelector(".tw-campo"), reloj = raiz.querySelector(".x-reloj i"), nota = raiz.querySelector(".x-nota");
    var reto = null, bl = [], T = 0, t = 0, hecho = false, cierre = -1, malos = 0, faltan = 0, oks = [], quita = oidoBanner(s);
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 8) + "px"; };
    var limpia = function(){ reto = null; bl = []; campo.innerHTML = ""; nota.textContent = ""; };
    var cierraCon = function(p){ hecho = true; return p.then(function(){ limpia(); s.listo(); }); };
    var dispara = function(i, el){
      if (!reto || hecho || s.estado() !== "juega") return;
      var b = bl[i]; if (!b || b.fuera) return;
      var p = centro(el, zona); fx("pew");
      raiz.insertAdjacentHTML("beforeend", '<i class="tw-laser" style="--x:' + p.x.toFixed(0) + 'px;--y:' + (p.y + el.offsetHeight / 2).toFixed(0) + 'px"></i>');
      var lz = raiz.querySelector(".tw-laser:last-of-type"); setTimeout(function(){ if (lz) lz.remove(); }, 260);
      if (b.ok) {
        chispas(s, p.x, p.y + el.offsetHeight / 2, { n: 26, v: 480, cols: ["#F43F5E", "#FFD200", "#fff"], s: 5 });
        b.fuera = true; el.classList.add("boom"); el.disabled = true; faltan--;
        s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: p.x, y: p.y, final: !faltan });
        nota.textContent = faltan ? "Quedan " + faltan : "¡Todos los blancos!";
        if (!faltan) { hecho = true; cierre = .5; }
        return;
      }
      malos++; el.classList.add("mal"); el.disabled = true; b.fuera = true;
      if (malos < 2) { s.penaliza(p.x, p.y); nota.textContent = "Ese no era: cuidado"; return; }
      cierraCon(s.fallo(reto, { mal: b.t, etMal: "Disparaste a", etiqueta: oks.length > 1 ? "Eran" : "Era", bien: oks.join(" · ") }));
    };
    var clic = function(e){ var b = e.target.closest && e.target.closest("[data-i]"); if (b && campo.contains(b)) { e.preventDefault(); dispara(+b.dataset.i, b); } };
    zona.addEventListener("click", clic); window.addEventListener("resize", coloca);
    return {
      jugar: function(r){
        reto = r; hecho = false; cierre = -1; t = 0; malos = 0;
        var g = grupos(r, 4, r.tipo === "varios" ? 5 : cuantas(s, 6)); oks = g[0]; faltan = oks.length;
        T = s.dir.t() * 1.2 + 2.4 * oks.length + 3 + (r.audio ? 1.5 : 0);
        s.banner(pregunta(r, '<p class="tw-meta">' + (oks.length > 1 ? "Dispara a las " + oks.length + " correctas" : "Dispara solo a la correcta") + "</p>"), { oro: r.oro }); coloca();
        var W = campo.clientWidth || 320, H = campo.clientHeight || 360, v = (26 + 16 * s.nivel) / (s.dir.factor || 1);
        bl = mezcla(g[0].map(function(x){ return { t: x, ok: true }; }).concat(g[1].map(function(x){ return { t: x, ok: false }; })));
        campo.innerHTML = bl.map(function(b, i){ return '<button type="button" class="tw-b" data-i="' + i + '" lang="fr"><span>' + esc(b.t) + "</span></button>"; }).join("");
        var els = campo.querySelectorAll(".tw-b");
        bl.forEach(function(b, i){
          var e = els[i], w = e.offsetWidth || 90, h = e.offsetHeight || 44, a = Math.random() * Math.PI * 2;
          b.w = w; b.h = h; b.x = Math.random() * Math.max(1, W - w); b.y = Math.random() * Math.max(1, H - h);
          b.vx = Math.cos(a) * v * (s.mov ? 0 : 1); b.vy = Math.sin(a) * v * (s.mov ? 0 : 1); b.el = e;
          e.style.transform = "translate(" + b.x + "px," + b.y + "px)";
        });
        nota.textContent = ""; reloj.style.transform = "scaleX(1)";
        if (r.audio) suena(r.audio);
      },
      tick: function(dt, d){
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) { limpia(); s.listo(); } return; }
        var W = campo.clientWidth, H = campo.clientHeight;
        bl.forEach(function(b){
          if (b.fuera) return;
          b.x += b.vx * d; b.y += b.vy * d;
          if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); } if (b.x > W - b.w) { b.x = W - b.w; b.vx = -Math.abs(b.vx); }
          if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); } if (b.y > H - b.h) { b.y = H - b.h; b.vy = -Math.abs(b.vy); }
          b.el.style.transform = "translate(" + b.x.toFixed(1) + "px," + b.y.toFixed(1) + "px)";
        });
        if (hecho || !dt) return;
        t += dt; reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        if (t >= T) {
          var quedan = bl.filter(function(b){ return b.ok && !b.fuera; }).map(function(b){ return b.t; });
          cierraCon(s.escapa(reto, { titulo: "Se acabó el tiempo", etiqueta: quedan.length > 1 ? "Faltaron" : "Faltó", bien: quedan.join(" · ") }));
        }
      },
      pausa: function(){ raiz.classList.add("x-pausa"); callaVoz(); }, sigue: function(){ raiz.classList.remove("x-pausa"); },
      destruye: function(){ zona.removeEventListener("click", clic); window.removeEventListener("resize", coloca); quita(); callaVoz(); },
      depura: function(){ return { faltan: faltan, blancos: bl.map(function(b){ return b.t + (b.ok ? "*" : ""); }) }; }
    };
  }

  /* ================= 4. Word Catcher ================= */
  function motorAtrapa(zona, s){
    zona.innerHTML = '<div class="x56 wc"><div class="wc-cielo"><div class="wc-cesta" aria-hidden="true"><span>🧺</span></div></div><p class="x-nota" aria-live="polite"></p></div>';
    var raiz = zona.firstChild, cielo = raiz.querySelector(".wc-cielo"), cesta = raiz.querySelector(".wc-cesta"), nota = raiz.querySelector(".x-nota");
    var reto = null, cola = [], caen = [], oks = [], hechas = 0, malos = 0, prox = 0, gap = 1, vel = 120, bx = -1, hecho = false, cierre = -1, arrastra = false, quita = oidoBanner(s);
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 8) + "px"; };
    var ponCesta = function(x){ var W = cielo.clientWidth; bx = entre(40, x, W - 40); cesta.style.left = bx + "px"; };
    var limpia = function(){ reto = null; cola = []; caen.forEach(function(c){ c.el.remove(); }); caen = []; nota.textContent = ""; };
    var cierraCon = function(p){ hecho = true; return p.then(function(){ limpia(); s.listo(); }); };
    var mover = function(e){ if (!reto || s.estado() !== "juega") return; var r = cielo.getBoundingClientRect(); ponCesta(e.clientX - r.left); };
    var baja = function(e){ if (e.target.closest && e.target.closest("button")) return; arrastra = true; mover(e); };
    var sube = function(){ arrastra = false; };
    var mueve = function(e){ if (arrastra || e.pointerType === "mouse") mover(e); };
    raiz.addEventListener("pointerdown", baja); raiz.addEventListener("pointermove", mueve); window.addEventListener("pointerup", sube); window.addEventListener("resize", coloca);
    var atrapa = function(c){
      c.fuera = true; c.el.classList.add(c.ok ? "bien" : "mal");
      setTimeout(function(){ c.el.remove(); }, 260);
      var p = { x: bx, y: cielo.clientHeight - 60 };
      if (c.ok) { fx("atrapa"); hechas++; s.acierto(reto, { rapidez: .6, x: p.x, y: p.y, final: hechas >= oks.length }); nota.textContent = hechas < oks.length ? "Faltan " + (oks.length - hechas) : "¡Todas!"; return; }
      malos++;
      if (malos < 2) { s.penaliza(p.x, p.y); nota.textContent = "«" + c.t + "» no va"; return; }
      cierraCon(s.fallo(reto, { mal: c.t, etMal: "Atrapaste", etiqueta: "Había que atrapar", bien: oks.join(" · ") }));
    };
    return {
      jugar: function(r){
        reto = r; hecho = false; cierre = -1; hechas = 0; malos = 0; caen = [];
        var g = grupos(r, 4, r.tipo === "varios" ? 5 : cuantas(s, 5)); oks = g[0];
        cola = mezcla(g[0].map(function(x){ return { t: x, ok: true }; }).concat(g[1].map(function(x){ return { t: x, ok: false }; })));
        gap = Math.max(.8, s.dir.t() * .28); prox = .4; vel = Math.max(60, (cielo.clientHeight || 400) / (s.dir.t() * .6 + 2));
        if (bx < 0) ponCesta(cielo.clientWidth / 2);
        s.banner(pregunta(r, '<p class="tw-meta">' + (oks.length > 1 ? "Atrapa las " + oks.length + " que van" : "Atrapa solo la correcta") + "</p>"), { oro: r.oro }); coloca();
        nota.textContent = "Arrastra la canasta"; if (r.audio) suena(r.audio);
      },
      tick: function(dt, d){
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) { limpia(); s.listo(); } return; }
        if (hecho || !dt) return;
        var W = cielo.clientWidth, H = cielo.clientHeight, top = H - 64;
        prox -= d;
        if (prox <= 0 && cola.length) {
          var c = cola.shift(); c.el = document.createElement("span"); c.el.className = "wc-p"; c.el.lang = "fr"; c.el.textContent = c.t; cielo.appendChild(c.el);
          c.w = c.el.offsetWidth || 90; c.x = 8 + Math.random() * Math.max(1, W - c.w - 16); c.y = -40; caen.push(c); prox = gap;
        }
        caen.forEach(function(c){
          if (c.fuera) return;
          c.y += vel * d; c.el.style.transform = "translate(" + c.x.toFixed(1) + "px," + c.y.toFixed(1) + "px)";
          var bajo = c.y + 36;
          if (bajo >= top && bajo <= top + 30 && c.x + c.w > bx - 46 && c.x < bx + 46) { atrapa(c); return; }
          if (c.y > H) { c.fuera = true; c.el.remove(); }
        });
        if (hecho) return;
        caen = caen.filter(function(c){ return !c.fuera; });
        if (hechas >= oks.length) { hecho = true; cierre = .45; return; }
        if (!cola.length && !caen.length) {
          cierraCon(s.escapa(reto, { titulo: "Se te escaparon", etiqueta: "Había que atrapar", bien: oks.join(" · ") }));
        }
      },
      tecla: function(e){ if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); ponCesta(bx + (e.key === "ArrowLeft" ? -48 : 48)); } },
      pausa: function(){ raiz.classList.add("x-pausa"); callaVoz(); }, sigue: function(){ raiz.classList.remove("x-pausa"); },
      destruye: function(){ raiz.removeEventListener("pointerdown", baja); raiz.removeEventListener("pointermove", mueve); window.removeEventListener("pointerup", sube); window.removeEventListener("resize", coloca); quita(); callaVoz(); },
      depura: function(){ return { hechas: hechas, oks: oks, cola: cola.length, caen: caen.length, bx: bx }; }
    };
  }

  /* ================= 5. Sentence Race ================= */
  var RIVALES = [{ n: "Chloé", c: "#F472B6", auto: "🏎️" }, { n: "Hugo", c: "#2DD4BF", auto: "🚙" }];
  function motorRace(zona, s){
    zona.innerHTML = '<div class="x56 sr"><div class="sr-pista" aria-hidden="true"></div><p class="sr-frase" lang="fr" aria-live="polite"></p><p class="x-nota" aria-live="polite"></p><div class="sr-banco" role="group" aria-label="Piezas de la frase"></div></div>';
    var raiz = zona.firstChild, pista = raiz.querySelector(".sr-pista"), frase = raiz.querySelector(".sr-frase"), banco = raiz.querySelector(".sr-banco"), nota = raiz.querySelector(".x-nota");
    var reto = null, toks = [], fichas = [], hechas = 0, malos = 0, riv = [], yo = 0, llegaron = 0, hecho = false, cierre = -1, t = 0;
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 8) + "px"; };
    var carril = function(nombre, x, c, auto, cl){ return '<div class="sr-c ' + (cl || "") + '"><small>' + esc(nombre) + '</small><span class="sr-via"><i class="sr-meta"></i><b class="sr-auto" style="left:calc(' + (x * 100).toFixed(1) + '% - ' + (x * 34).toFixed(1) + 'px);--c:' + c + '">' + auto + "</b></span></div>"; };
    var pintaPista = function(){ pista.innerHTML = carril("Tú", yo, "#FFD200", "🚗", "yo") + riv.map(function(r){ return carril(r.n, Math.min(1, r.x), r.c, r.auto); }).join(""); };
    var pinta = function(){
      frase.innerHTML = toks.slice(0, hechas).map(esc).join(" ") + (hechas < toks.length ? ' <span class="hueco">…</span>' : "");
      banco.innerHTML = fichas.map(function(f, i){ return '<button type="button" class="x-op sr-f' + (f.usada ? " usada" : "") + (f.mal ? " mal" : "") + '" data-i="' + i + '"' + (f.usada ? " disabled" : "") + ' lang="fr"><span>' + esc(f.t) + "</span></button>"; }).join("");
    };
    var limpia = function(){ reto = null; fichas = []; banco.innerHTML = ""; frase.innerHTML = ""; nota.textContent = ""; };
    var cierraCon = function(p){ hecho = true; return p.then(function(){ limpia(); s.listo(); }); };
    var elige = function(i, b){
      if (!reto || hecho || s.estado() !== "juega") return;
      var f = fichas[i]; if (!f || f.usada) return;
      var p = b ? centro(b, zona) : { x: zona.clientWidth / 2, y: zona.clientHeight / 2 };
      fichas.forEach(function(x){ x.mal = false; });
      if (norm(f.t) === norm(toks[hechas])) {
        f.usada = true; hechas++; yo = hechas / toks.length; fx("motor");
        if (hechas >= toks.length) {
          var pos = 1 + llegaron; hecho = true; cierre = .9;
          s.acierto(reto, { rapidez: pos === 1 ? 1 : .35, x: p.x, y: p.y }); nota.textContent = pos === 1 ? "🏆 ¡Primer lugar!" : "🥈 Segundo lugar";
        }
        pinta(); pintaPista(); return;
      }
      malos++; f.mal = true; pinta();
      if (malos < 2) { s.penaliza(p.x, p.y); nota.textContent = "Esa pieza no va ahí"; return; }
      cierraCon(s.fallo(reto, { mal: toks.slice(0, hechas).concat([f.t]).join(" ") + "…", etMal: "Armaste", etiqueta: "La frase", bien: toks.join(" ") }));
    };
    var clic = function(e){ var b = e.target.closest && e.target.closest("[data-i]"); if (b && banco.contains(b)) { e.preventDefault(); elige(+b.dataset.i, b); } };
    zona.addEventListener("click", clic); window.addEventListener("resize", coloca);
    return {
      jugar: function(r){
        reto = r; toks = r.correcta.slice(); hechas = 0; malos = 0; yo = 0; llegaron = 0; hecho = false; cierre = -1; t = 0;
        var ord; do ord = mezcla(toks.map(function(_, i){ return i; })); while (toks.length > 1 && ord.every(function(x, i){ return x === i; }));
        fichas = ord.map(function(i){ return { t: toks[i] }; });
        var base = s.dir.t() * .7 * toks.length + 3;
        riv = RIVALES.map(function(x, k){ return { n: x.n, c: x.c, auto: x.auto, x: 0, T: base * (k ? 1.25 : 1.02) * (.95 + Math.random() * .15), fin: false }; });
        s.banner('<p class="plxg-ask">Arma la frase antes que los rivales</p>' + (r.q ? '<p class="plxg-q">' + esc(r.q) + "</p>" : ""), { oro: r.oro }); coloca();
        pinta(); pintaPista(); nota.textContent = "";
      },
      tick: function(dt){
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) { limpia(); s.listo(); } return; }
        if (hecho || !dt) return;
        t += dt;
        riv.forEach(function(r){ if (r.fin) return; r.x = t / r.T; if (r.x >= 1) { r.fin = true; llegaron++; G.sfx("escapa"); } });
        pintaPista();
        if (llegaron >= riv.length) cierraCon(s.escapa(reto, { titulo: "Te ganaron la carrera", etiqueta: "La frase", bien: toks.join(" ") }));
      },
      tecla: function(e){ if (/^[1-8]$/.test(e.key)) { var b = banco.querySelectorAll(".sr-f")[+e.key - 1]; if (b && !b.disabled) { e.preventDefault(); elige(+b.dataset.i, b); } } },
      pausa: function(){ raiz.classList.add("x-pausa"); }, sigue: function(){ raiz.classList.remove("x-pausa"); },
      destruye: function(){ zona.removeEventListener("click", clic); window.removeEventListener("resize", coloca); },
      depura: function(){ return { toks: toks, hechas: hechas, rivales: riv.map(function(r){ return +r.x.toFixed(2); }) }; }
    };
  }

  /* ================= 6. Card Chaos ================= */
  var PALOS = [["♠", "#0B2D74"], ["♥", "#E5484D"], ["♦", "#F59E0B"], ["♣", "#15803D"]];
  function motorCartas(zona, s){
    zona.innerHTML = '<div class="x56 cc"><div class="x-reloj"><i></i></div><div class="cc-mesa"><div class="cc-reto"></div></div><p class="x-nota" aria-live="polite"></p>' +
      '<div class="cc-mano" role="group" aria-label="Tu mano"></div><button type="button" class="cc-comodin" data-cc-com>🃏 Comodín · <b>2</b></button></div>';
    var raiz = zona.firstChild, mesa = raiz.querySelector(".cc-reto"), mano = raiz.querySelector(".cc-mano"), nota = raiz.querySelector(".x-nota"), reloj = raiz.querySelector(".x-reloj i"), com = raiz.querySelector(".cc-comodin");
    var reto = null, cartas = [], T = 0, t = 0, malos = 0, hecho = false, cierre = -1, usos = 2, ronda = 0, caos = -1, quita = oidoBanner(s);
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 8) + "px"; };
    var pintaMano = function(extra){
      var n = cartas.length;
      mano.innerHTML = cartas.map(function(c, i){
        var giro = n > 1 ? (-10 + 20 * i / (n - 1)) : 0;
        return '<button type="button" class="cc-carta' + (c.mal ? " mal" : "") + (c.fuera ? " fuera" : "") + (c.ok && hecho ? " bien" : "") + (extra || "") + '" data-i="' + i + '"' + (c.mal || c.fuera ? " disabled" : "") +
          ' style="--g:' + giro.toFixed(1) + 'deg;--pc:' + c.palo[1] + ';--i:' + i + '" lang="fr"><i aria-hidden="true">' + c.palo[0] + "</i><span>" + esc(c.t) + '</span><i class="cc-pie" aria-hidden="true">' + c.palo[0] + "</i></button>";
      }).join("");
      com.querySelector("b").textContent = usos; com.disabled = !usos || !reto || hecho;
    };
    var limpia = function(){ reto = null; cartas = []; mano.innerHTML = ""; mesa.innerHTML = ""; nota.textContent = ""; };
    var cierraCon = function(p){ hecho = true; pintaMano(); return p.then(function(){ limpia(); s.listo(); }); };
    var juega = function(i, b){
      if (!reto || hecho || s.estado() !== "juega") return;
      var c = cartas[i]; if (!c || c.mal || c.fuera) return;
      var p = b ? centro(b, zona) : { x: zona.clientWidth / 2, y: zona.clientHeight / 2 };
      if (c.ok) {
        hecho = true; cierre = .7; mesa.classList.add("gana"); fx("carta");
        mesa.insertAdjacentHTML("beforeend", '<span class="cc-jugada" style="--pc:' + c.palo[1] + '" lang="fr">' + c.palo[0] + " " + esc(c.t) + "</span>");
        s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: p.x, y: p.y }); nota.textContent = "¡Jugada perfecta!"; pintaMano(); return;
      }
      malos++; c.mal = true; pintaMano(); chispas(s, p.x, p.y, { n: 14, cols: ["#FF6B3D", "#FFD200", "#3B1D2A"], v: 260, g: -300, d: .8, f: "c" });
      if (malos < 2) { s.penaliza(p.x, p.y); nota.textContent = "🔥 Esa carta se quema"; return; }
      cierraCon(s.fallo(reto, { mal: c.t, etMal: "Jugaste", etiqueta: "La carta era", bien: reto.correcta[0] }));
    };
    var comodin = function(){
      if (!reto || hecho || !usos) return;
      var malas = cartas.filter(function(c){ return !c.ok && !c.mal && !c.fuera; });
      if (malas.length < 2) { nota.textContent = "El comodín no sirve con tan pocas cartas"; return; }
      usos--; mezcla(malas).slice(0, malas.length - 1).forEach(function(c){ c.fuera = true; });
      nota.textContent = "🃏 El comodín descartó cartas"; G.sfx("tic"); pintaMano();
    };
    var clic = function(e){
      if (e.target.closest && e.target.closest("[data-cc-com]")) { e.preventDefault(); comodin(); return; }
      var b = e.target.closest && e.target.closest("[data-i]"); if (b && mano.contains(b)) { e.preventDefault(); juega(+b.dataset.i, b); }
    };
    zona.addEventListener("click", clic); window.addEventListener("resize", coloca);
    return {
      jugar: function(r){
        reto = r; malos = 0; t = 0; hecho = false; cierre = -1; ronda++;
        T = s.dir.t() * 1.5 + 3.5 + (r.audio ? 1.5 : 0);
        var pal = mezcla(PALOS);
        cartas = opcs(r, cuantas(s, 5), s).map(function(o, i){ o.palo = pal[i % 4]; return o; });
        caos = ronda % 3 === 0 ? 1.2 : -1;   /* cada tercera mano, las cartas se barajan solas */
        mesa.classList.remove("gana");
        mesa.innerHTML = '<small>Reto</small>' + (r.q ? '<b lang="fr">' + q(r) + "</b>" : '<b>' + esc(r.ask || "") + "</b>") +
          (r.audio ? '<button type="button" class="x-oir" data-x-oir>' + BOCINA + "<span>Escuchar</span></button>" : "");
        s.banner('<p class="plxg-ask">' + esc(r.ask || "Juega la carta correcta") + "</p>" + (caos > 0 ? '<p class="tw-meta">¡Mano del caos! Las cartas se van a barajar</p>' : ""), { oro: r.oro }); coloca();
        pintaMano(" reparte"); fx("carta"); nota.textContent = ""; reloj.style.transform = "scaleX(1)";
        if (r.audio) suena(r.audio);
      },
      tick: function(dt){
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) { limpia(); s.listo(); } return; }
        if (hecho || !dt) return;
        t += dt; reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        if (caos > 0) { caos -= dt; if (caos <= 0) { cartas = mezcla(cartas); pintaMano(" caos"); G.sfx("tic"); } }
        if (t >= T) cierraCon(s.escapa(reto, { titulo: "Se acabó tu turno", etiqueta: "La carta era", bien: reto.correcta[0] }));
      },
      tecla: function(e){ if (/^[1-5]$/.test(e.key)) { var b = mano.querySelectorAll(".cc-carta")[+e.key - 1]; if (b && !b.disabled) { e.preventDefault(); juega(+b.dataset.i, b); } } else if (e.key === "c" || e.key === "C") { e.preventDefault(); comodin(); } },
      pausa: function(){ raiz.classList.add("x-pausa"); callaVoz(); }, sigue: function(){ raiz.classList.remove("x-pausa"); },
      destruye: function(){ zona.removeEventListener("click", clic); window.removeEventListener("resize", coloca); quita(); callaVoz(); },
      depura: function(){ return { cartas: cartas.map(function(c){ return c.t + (c.ok ? "*" : ""); }), usos: usos }; }
    };
  }

  /* ================= 7. Combo Mode ================= */
  var TIPO_TXT = { uno: "Elige", varios: "Categoría", orden: "Ordena", error: "Detective" };
  function motorCombo(zona, s){
    zona.innerHTML = '<div class="x56 cm"><div class="cm-medidor" aria-live="polite"><b class="cm-x">×1</b><span class="cm-r">0 seguidos</span><span class="cm-tipo"></span></div><div class="x-reloj"><i></i></div><div class="cm-caja"></div><p class="x-nota" aria-live="polite"></p></div>';
    var raiz = zona.firstChild, caja = raiz.querySelector(".cm-caja"), xEl = raiz.querySelector(".cm-x"), rEl = raiz.querySelector(".cm-r"), tipoEl = raiz.querySelector(".cm-tipo"), reloj = raiz.querySelector(".x-reloj i"), nota = raiz.querySelector(".x-nota");
    var reto = null, st = null, T = 0, t = 0, malos = 0, hecho = false, cierre = -1, quita = oidoBanner(s);
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 8) + "px"; };
    var medidor = function(){
      var m = s.pts.mult(), r = s.pts.racha;
      if (xEl.textContent !== "×" + m) { xEl.textContent = "×" + m; if (!s.mov) { xEl.classList.remove("sube"); void xEl.offsetWidth; xEl.classList.add("sube"); } }
      rEl.textContent = r + (r === 1 ? " seguido" : " seguidos") + (r < 3 ? " · ×2 a los 3" : r < 6 ? " · ×3 a los 6" : r < 10 ? " · ×4 a los 10" : " · ¡máximo!");
      raiz.style.setProperty("--calor", Math.min(1, r / 10).toFixed(2));
    };
    var limpia = function(){ reto = null; st = null; caja.innerHTML = ""; nota.textContent = ""; };
    var cierraCon = function(p){ hecho = true; return p.then(function(){ limpia(); s.listo(); }); };
    var bien = function(p){ hecho = true; cierre = .35; s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: p.x, y: p.y }); medidor(); pinta(); };
    var mal = function(p, o){ malos++; if (malos < 2 && !o.directo) { s.penaliza(p.x, p.y); medidor(); nota.textContent = "Cuidado: se rompió el combo"; pinta(); return; } cierraCon(s.fallo(reto, o)); };
    var pinta = function(){
      if (!st) return;
      if (st.k === "uno" || st.k === "error") caja.innerHTML = '<div class="x-ops">' + botones(st.ops, hecho) + "</div>";
      else if (st.k === "varios") caja.innerHTML = '<div class="cm-chips">' + st.ops.map(function(o, i){ return '<button type="button" class="cm-chip' + (o.sel ? " sel" : "") + (hecho && o.ok ? " bien" : "") + '" data-i="' + i + '" aria-pressed="' + !!o.sel + '" lang="fr">' + esc(o.t) + "</button>"; }).join("") + '</div><button type="button" class="plxg-btn cm-listo" data-cm-listo>Listo</button>';
      else caja.innerHTML = '<p class="sr-frase" lang="fr">' + st.toks.slice(0, st.n).map(esc).join(" ") + (st.n < st.toks.length ? ' <span class="hueco">…</span>' : "") + '</p><div class="sr-banco">' +
        st.ops.map(function(f, i){ return '<button type="button" class="x-op sr-f' + (f.usada ? " usada" : "") + (f.mal ? " mal" : "") + '" data-i="' + i + '"' + (f.usada ? " disabled" : "") + ' lang="fr"><span>' + esc(f.t) + "</span></button>"; }).join("") + "</div>";
    };
    var toca = function(i, b){
      if (!reto || hecho || s.estado() !== "juega") return;
      var p = b ? centro(b, zona) : { x: zona.clientWidth / 2, y: zona.clientHeight / 2 }, o = st.ops[i]; if (!o) return;
      if (st.k === "uno" || st.k === "error") {
        if (o.mal) return;
        if (o.ok) return bien(p);
        o.mal = true; return mal(p, { mal: o.t, etMal: st.k === "error" ? "Cortaste" : "Elegiste", etiqueta: st.k === "error" ? "La incorrecta era" : "Correcta", bien: reto.correcta[0] });
      }
      if (st.k === "varios") { o.sel = !o.sel; G.sfx("tic"); pinta(); return; }
      if (o.usada) return;
      st.ops.forEach(function(x){ x.mal = false; });
      if (norm(o.t) === norm(st.toks[st.n])) { o.usada = true; st.n++; G.sfx("tic"); if (st.n >= st.toks.length) return bien(p); pinta(); return; }
      o.mal = true; mal(p, { mal: st.toks.slice(0, st.n).concat([o.t]).join(" ") + "…", etMal: "Armaste", etiqueta: "La frase", bien: st.toks.join(" ") });
    };
    var listo = function(b){
      if (!reto || hecho || st.k !== "varios") return;
      var p = b ? centro(b, zona) : { x: zona.clientWidth / 2, y: zona.clientHeight / 2 };
      var ok = st.ops.every(function(o){ return !!o.sel === o.ok; });
      if (ok) return bien(p);
      mal(p, { directo: true, mal: st.ops.filter(function(o){ return o.sel; }).map(function(o){ return o.t; }).join(" · ") || "(nada)", etMal: "Marcaste", etiqueta: "Iban", bien: reto.correcta.join(" · ") });
    };
    var clic = function(e){
      if (e.target.closest && e.target.closest("[data-cm-listo]")) { e.preventDefault(); listo(e.target.closest("[data-cm-listo]")); return; }
      var b = e.target.closest && e.target.closest("[data-i]"); if (b && caja.contains(b)) { e.preventDefault(); toca(+b.dataset.i, b); }
    };
    zona.addEventListener("click", clic); window.addEventListener("resize", coloca);
    return {
      jugar: function(r){
        reto = r; malos = 0; t = 0; hecho = false; cierre = -1;
        if (r.tipo === "varios") { st = { k: "varios", ops: mezcla(r.correcta.slice(0, 4).map(function(x){ return { t: x, ok: true }; }).concat(r.malas.slice(0, 4).map(function(x){ return { t: x, ok: false }; }))) }; T = s.dir.t() + 1.4 * st.ops.length + 2; }
        else if (r.tipo === "orden") { var ord; do ord = mezcla(r.correcta.map(function(_, i){ return i; })); while (ord.every(function(x, i){ return x === i; })); st = { k: "orden", toks: r.correcta.slice(), n: 0, ops: ord.map(function(i){ return { t: r.correcta[i] }; }) }; T = s.dir.t() * .8 + 1.5 * r.correcta.length + 2; }
        else if (r.tipo === "error") { st = { k: "error", ops: mezcla([{ t: r.correcta[0], ok: true }].concat(r.malas.slice(0, 4).map(function(x){ return { t: x, ok: false }; }))) }; T = s.dir.t() + 4; }
        else { st = { k: "uno", ops: opcs(r, cuantas(s, 5), s) }; T = s.dir.t() + 2.5 + (r.audio ? 1.5 : 0); }
        tipoEl.textContent = TIPO_TXT[st.k];
        s.banner(pregunta(r), { oro: r.oro }); coloca(); pinta(); medidor(); nota.textContent = ""; reloj.style.transform = "scaleX(1)";
        if (r.audio) suena(r.audio);
      },
      tick: function(dt){
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) { limpia(); s.listo(); } return; }
        if (hecho || !dt) return;
        t += dt; reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        if (t >= T) { medidor(); cierraCon(s.escapa(reto, { titulo: "Se acabó el tiempo", etiqueta: st.k === "orden" ? "La frase" : st.k === "varios" ? "Iban" : "Correcta", bien: st.k === "orden" ? st.toks.join(" ") : reto.correcta.join(" · ") })); }
      },
      tecla: function(e){ if (/^[1-8]$/.test(e.key)) { var b = caja.querySelectorAll("[data-i]")[+e.key - 1]; if (b && !b.disabled) { e.preventDefault(); toca(+b.dataset.i, b); } } else if (e.key === "Enter") { var l = caja.querySelector("[data-cm-listo]"); if (l) { e.preventDefault(); listo(l); } } },
      pausa: function(){ raiz.classList.add("x-pausa"); callaVoz(); }, sigue: function(){ raiz.classList.remove("x-pausa"); },
      destruye: function(){ zona.removeEventListener("click", clic); window.removeEventListener("resize", coloca); quita(); callaVoz(); },
      depura: function(){ return { tipo: st && st.k, T: T, t: t }; }
    };
  }

  /* ================= 8. Word Battle (dos jugadores en el mismo teléfono, o contra Manzana) ================= */
  var batalla = { a: 0, b: 0, bot: true };
  function motorBatalla(zona, s){
    batalla = { a: 0, b: 0, bot: true };
    s.el.classList.add("wb-on");   /* sin Manzana en la esquina: taparía el lado de arriba */
    zona.innerHTML = '<div class="x56 wb"><div class="wb-lado wb-arriba" data-l="b"><p class="wb-q"></p><div class="x-ops"></div><p class="wb-quien">🐱 Manzana juega aquí · tócalo para jugar tú</p></div>' +
      '<div class="wb-marcador" aria-live="polite"><span class="wb-pb">0</span><b>VS</b><span class="wb-pa">0</span></div>' +
      '<div class="wb-lado wb-abajo" data-l="a"><p class="wb-q"></p><div class="x-ops"></div><p class="wb-quien">Jugador 1</p></div></div>';
    var raiz = zona.firstChild, lados = { a: raiz.querySelector(".wb-abajo"), b: raiz.querySelector(".wb-arriba") }, pa = raiz.querySelector(".wb-pa"), pb = raiz.querySelector(".wb-pb");
    var reto = null, ops = { a: [], b: [] }, fuera = { a: false, b: false }, T = 0, t = 0, tBot = 0, botOk = true, hecho = false, cierre = -1;
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 4) + "px"; };
    var pinta = function(){
      ["a", "b"].forEach(function(l){
        var el = lados[l];
        el.querySelector(".x-ops").innerHTML = ops[l].map(function(o, i){
          return '<button type="button" class="x-op' + (o.mal ? " mal" : "") + (o.ok && hecho ? " bien" : "") + '" data-i="' + i + '" data-l="' + l + '"' + (o.mal || fuera[l] ? " disabled" : "") + ' lang="fr"><span>' + esc(o.t) + "</span></button>";
        }).join("");
        el.classList.toggle("fuera", fuera[l]);
      });
      pa.textContent = batalla.a; pb.textContent = batalla.b;
    };
    var limpia = function(){ reto = null; ["a", "b"].forEach(function(l){ lados[l].querySelector(".x-ops").innerHTML = ""; lados[l].querySelector(".wb-q").innerHTML = ""; lados[l].classList.remove("gana"); }); };
    var gana = function(l, b){
      hecho = true; cierre = 1; batalla[l]++; lados[l].classList.add("gana");
      var p = b ? centro(b, zona) : { x: zona.clientWidth / 2, y: zona.clientHeight / 2 };
      if (l === "a") s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: p.x, y: p.y });
      else { s.pts.corta(); s.pop(p.x, p.y, batalla.bot ? "Manzana +1" : "J2 +1", "#F472B6"); G.sfx("escapa"); }
      pinta();
    };
    var toca = function(l, i, b){
      if (!reto || hecho || s.estado() !== "juega" || fuera[l]) return;
      var o = ops[l][i]; if (!o || o.mal) return;
      if (o.ok) return gana(l, b);
      o.mal = true; fuera[l] = true; G.sfx("mal"); pinta();
      if (fuera.a && fuera.b) { hecho = true; s.escapa(reto, { titulo: "Nadie acertó", etiqueta: "Correcta", bien: reto.correcta[0] }).then(function(){ limpia(); s.listo(); }); }
    };
    var clic = function(e){
      var b = e.target.closest && e.target.closest("[data-i]");
      if (b && zona.contains(b)) { e.preventDefault(); if (b.dataset.l === "b" && batalla.bot) { batalla.bot = false; lados.b.querySelector(".wb-quien").textContent = "Jugador 2"; } toca(b.dataset.l, +b.dataset.i, b); return; }
      var ar = e.target.closest && e.target.closest(".wb-arriba");
      if (ar && batalla.bot) { batalla.bot = false; lados.b.querySelector(".wb-quien").textContent = "Jugador 2"; }
    };
    zona.addEventListener("click", clic); window.addEventListener("resize", coloca);
    return {
      jugar: function(r){
        reto = r; hecho = false; cierre = -1; t = 0; fuera = { a: false, b: false };
        var base = opcs(r, cuantas(s, 4), s);
        ops.a = mezcla(base.map(function(o){ return { t: o.t, ok: o.ok }; })); ops.b = mezcla(base.map(function(o){ return { t: o.t, ok: o.ok }; }));
        T = s.dir.t() * 1.5 + 3.5 + (r.audio ? 1.5 : 0);
        tBot = T * (.38 + Math.random() * .4); botOk = Math.random() < [.7, .78, .86][s.nivel] ;
        var html = '<small>' + esc(r.ask || "") + "</small>" + (r.q ? '<b lang="fr">' + q(r) + "</b>" : "") + (r.audio ? '<button type="button" class="x-oir" data-x-oir>' + BOCINA + "</button>" : "");
        lados.a.querySelector(".wb-q").innerHTML = html; lados.b.querySelector(".wb-q").innerHTML = html;
        s.banner(""); coloca(); pinta();
        if (r.audio) suena(r.audio);
      },
      tick: function(dt){
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) { limpia(); s.listo(); } return; }
        if (hecho || !dt) return;
        t += dt;
        if (batalla.bot && !fuera.b && t >= tBot) {
          var i = botOk ? ops.b.findIndex(function(o){ return o.ok; }) : ops.b.findIndex(function(o){ return !o.ok && !o.mal; });
          if (i >= 0) toca("b", i, lados.b.querySelectorAll(".x-op")[i]);
        }
        if (!hecho && t >= T) { hecho = true; s.escapa(reto, { titulo: "Se acabó el tiempo", etiqueta: "Correcta", bien: reto.correcta[0] }).then(function(){ limpia(); s.listo(); }); }
      },
      tecla: function(e){ if (/^[1-4]$/.test(e.key)) { var b = lados.a.querySelectorAll(".x-op")[+e.key - 1]; if (b && !b.disabled) { e.preventDefault(); toca("a", +b.dataset.i, b); } } },
      pausa: function(){ raiz.classList.add("x-pausa"); callaVoz(); }, sigue: function(){ raiz.classList.remove("x-pausa"); },
      destruye: function(){ zona.removeEventListener("click", clic); window.removeEventListener("resize", coloca); s.el.classList.remove("wb-on"); callaVoz(); },
      depura: function(){ return { batalla: batalla, t: t, T: T }; }
    };
  }
  var cabezaBatalla = function(){
    var a = batalla.a, b = batalla.b, rival = batalla.bot ? "Manzana" : "Jugador 2";
    var tx = a > b ? "¡Gana el Jugador 1!" : b > a ? "¡Gana " + rival + "!" : "¡Empate!";
    return '<div class="wb-res"><p>' + tx + '</p><div><span><small>Jugador 1</small><b>' + a + '</b></span><em>VS</em><span><small>' + esc(rival) + "</small><b>" + b + "</b></span></div></div>";
  };

  /* ================= 9. Team Challenge (cooperativo, pasando el teléfono) ================= */
  var COLORES = ["#FFD200", "#93C5FD", "#F472B6", "#6BE58E"];
  var equipo = { n: 2, turno: 0, meta: 10 };
  function motorEquipo(zona, s){
    equipo.turno = 0;
    zona.innerHTML = '<div class="x56 tc"><div class="tc-cab"><div class="tc-turno" aria-live="polite"></div><div class="tc-n"><button type="button" data-tc="-1" aria-label="Menos jugadores">−</button><span></span><button type="button" data-tc="1" aria-label="Más jugadores">+</button></div></div>' +
      '<div class="x-reloj"><i></i></div><div class="x-ops" role="group" aria-label="Respuestas"></div><p class="x-nota" aria-live="polite"></p></div>';
    var raiz = zona.firstChild, turnoEl = raiz.querySelector(".tc-turno"), nEl = raiz.querySelector(".tc-n span"), opsEl = raiz.querySelector(".x-ops"), nota = raiz.querySelector(".x-nota"), reloj = raiz.querySelector(".x-reloj i");
    var reto = null, ops = [], T = 0, t = 0, intentos = 0, hecho = false, cierre = -1, quita = oidoBanner(s);
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 8) + "px"; };
    var pintaTurno = function(){
      var k = equipo.turno % equipo.n;
      turnoEl.innerHTML = '<i style="background:' + COLORES[k] + '"></i><span><small>Turno de</small><b>Jugador ' + (k + 1) + "</b></span>";
      raiz.style.setProperty("--tc", COLORES[k]); nEl.textContent = equipo.n + " jugadores";
    };
    var pinta = function(){ opsEl.innerHTML = botones(ops, hecho); };
    var limpia = function(){ reto = null; ops = []; opsEl.innerHTML = ""; nota.textContent = ""; };
    var elige = function(i, b){
      if (!reto || hecho || s.estado() !== "juega") return;
      var o = ops[i]; if (!o || o.mal) return;
      var p = b ? centro(b, zona) : { x: zona.clientWidth / 2, y: zona.clientHeight / 2 };
      if (o.ok) { hecho = true; cierre = .7; s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: p.x, y: p.y }); nota.textContent = "¡Punto para el equipo! Pasa el teléfono"; equipo.turno++; pinta(); return; }
      o.mal = true; intentos++; pinta();
      /* colaborar: si alguien se equivoca, el siguiente del equipo lo intenta con el mismo reto */
      if (intentos < Math.min(equipo.n, 3)) { s.penaliza(p.x, p.y); equipo.turno++; pintaTurno(); nota.textContent = "Ayuda del equipo: ahora lo intenta el siguiente"; return; }
      hecho = true; equipo.turno++;
      s.fallo(reto, { mal: o.t, etMal: "El equipo eligió", etiqueta: "Correcta", bien: reto.correcta[0] }).then(function(){ limpia(); s.listo(); });
    };
    var clic = function(e){
      var n = e.target.closest && e.target.closest("[data-tc]");
      if (n) { e.preventDefault(); equipo.n = entre(2, equipo.n + +n.dataset.tc, 4); pintaTurno(); return; }
      var b = e.target.closest && e.target.closest("[data-i]"); if (b && opsEl.contains(b)) { e.preventDefault(); elige(+b.dataset.i, b); }
    };
    zona.addEventListener("click", clic); window.addEventListener("resize", coloca);
    return {
      jugar: function(r){
        reto = r; t = 0; intentos = 0; hecho = false; cierre = -1;
        T = s.dir.t() * 1.6 + 4 + (r.audio ? 1.5 : 0);
        ops = opcs(r, cuantas(s, 4), s);
        s.banner(pregunta(r), { oro: r.oro }); coloca(); pinta(); pintaTurno(); nota.textContent = ""; reloj.style.transform = "scaleX(1)";
        if (r.audio) suena(r.audio);
      },
      tick: function(dt){
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) { limpia(); s.listo(); } return; }
        if (hecho || !dt) return;
        t += dt; reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        if (t >= T) { hecho = true; equipo.turno++; s.escapa(reto, { titulo: "Se acabó el turno", etiqueta: "Correcta", bien: reto.correcta[0] }).then(function(){ limpia(); s.listo(); }); }
      },
      tecla: function(e){ if (/^[1-4]$/.test(e.key)) { var b = opsEl.querySelectorAll(".x-op")[+e.key - 1]; if (b && !b.disabled) { e.preventDefault(); elige(+b.dataset.i, b); } } },
      pausa: function(){ raiz.classList.add("x-pausa"); callaVoz(); }, sigue: function(){ raiz.classList.remove("x-pausa"); },
      destruye: function(){ zona.removeEventListener("click", clic); window.removeEventListener("resize", coloca); quita(); callaVoz(); },
      depura: function(){ return { equipo: equipo, T: T, t: t }; }
    };
  }

  /* ================= 10. Language Adventure (mapa de zonas; cada zona, un motor de su habilidad) ================= */
  var ZONAS = [
    { id: "voc", nombre: "Bosque del vocabulario", ic: "🌳", motores: ["mr", "tw", "ff"], n: 3 },
    { id: "oido", nombre: "Café de la escucha", ic: "☕", motores: ["ah"], n: 2 },
    { id: "gram", nombre: "Biblioteca de la gramática", ic: "📚", motores: ["ld", "gr", "pb"], n: 3 },
    { id: "ecr", nombre: "Torre de la escritura", ic: "🏰", motores: ["sb", "sr", "pb"], n: 2 },
    { id: "voz", nombre: "Plaza de la voz", ic: "🎭", motores: ["vd", "rq"], n: 2 }
  ];
  var libre = function(id){ var j = G.juegos[id]; return j && j.montar && !(j.oculto && j.oculto()) ? j : null; };
  var planAventura = function(alc){
    var usados = {}, retos = [], ruta = [];
    var clave = function(r){ return r.key ? "k|" + r.key : (r.q || "") + "|" + (r.correcta || []).join(" "); };
    ZONAS.forEach(function(z){
      for (var k = 0; k < z.motores.length; k++) {
        var j = libre(z.motores[k]); if (!j) continue;
        var l; try { l = mezcla(G.retosJuego(j, alc)).filter(function(r){ return !usados[clave(r)]; }); } catch (e) { l = []; }
        if (l.length < 2) continue;
        var tom = l.slice(0, z.n), paso = { k: ruta.length, id: z.id, nombre: z.nombre, ic: z.ic, motor: j.id, juego: j.nombre, n: tom.length };
        tom.forEach(function(r){ usados[clave(r)] = 1; var c = Object.assign({}, r); c.motor = j.id; c.zona = paso.k; retos.push(c); });
        ruta.push(paso); break;
      }
    });
    return { retos: retos, ruta: ruta, seg: Math.max(150, Math.min(420, retos.length * 18 + 30)) };
  };
  var planesLA = {};
  var mapaHTML = function(ruta, actual, hechas){
    return '<ol class="la-mapa">' + ruta.map(function(p){
      var st = p.k < hechas ? "ok" : p.k === actual ? "cur" : "";
      return '<li class="' + st + '"><span class="la-ic" aria-hidden="true">' + (p.k < hechas ? "✓" : p.ic) + "</span><span><b>" + esc(p.nombre) + "</b><small>" + esc(p.juego) + " · " + p.n + (p.n === 1 ? " reto" : " retos") + "</small></span></li>";
    }).join("") + "</ol>";
  };
  function motorAventura(zona, s){
    var ctrl = null, idActual = null, zActual = -1, viaje = 0, pendiente = null, ruta = (s.el.__laRuta || []);
    zona.innerHTML = '<div class="la-sub"></div><div class="la-viaje" hidden></div>';
    var sub = zona.querySelector(".la-sub"), vj = zona.querySelector(".la-viaje");
    var monta = function(id){
      if (idActual === id && ctrl) return;
      if (ctrl) { try { ctrl.destruye(); } catch (e) {} ctrl = null; }
      sub.innerHTML = ""; s.banner("");
      ctrl = (libre(id) || G.juegos.ff).montar(sub, s); idActual = id;
    };
    var muestraViaje = function(k){
      var p = ruta[k] || { nombre: "", ic: "🗺️", juego: "" };
      vj.innerHTML = '<div class="la-card"><small>Zona ' + (k + 1) + " de " + ruta.length + '</small><span class="la-big" aria-hidden="true">' + p.ic + "</span><b>" + esc(p.nombre) + "</b><em>" + esc(p.juego) + "</em>" + mapaHTML(ruta, k, k) + "</div>";
      vj.hidden = false; s.banner(""); viaje = s.mov ? 1.2 : 2.2; G.sfx("frenesi");
    };
    return {
      jugar: function(r){
        if (r.zona !== zActual) { zActual = r.zona; pendiente = r; muestraViaje(r.zona); return; }
        monta(r.motor || "ff"); ctrl.jugar(r);
      },
      tick: function(dt, d, e){
        if (viaje > 0) { viaje -= dt; if (viaje <= 0 && pendiente) { vj.hidden = true; var r = pendiente; pendiente = null; monta(r.motor || "ff"); ctrl.jugar(r); } return; }
        if (ctrl && ctrl.tick) ctrl.tick(dt, d, e);
      },
      tecla: function(e){ if (!viaje && ctrl && ctrl.tecla) ctrl.tecla(e); },
      pausa: function(){ if (ctrl && ctrl.pausa) ctrl.pausa(); },
      sigue: function(){ if (ctrl && ctrl.sigue) ctrl.sigue(); },
      destruye: function(){ if (ctrl) { try { ctrl.destruye(); } catch (e) {} ctrl = null; } zona.innerHTML = ""; },
      depura: function(){ return Object.assign({ motor: idActual, zona: zActual, viaje: viaje }, ctrl && ctrl.depura ? ctrl.depura() : {}); }
    };
  }

  /* ================= registro ================= */
  var retosDe = function(op){ return function(alc){ var n = G.nivel(alc.track); return alc.tema ? G.retosVocab(alc.tema, n, op) : G.retos(alc.lecciones, n, op); }; };
  G.registrar({ id: "bc", nombre: "Bomb Countdown", verbo: "Desactiva la bomba a tiempo", familia: "Contrarreloj", color: "#FF6B3D", orden: 12, vocab: true,
    retos: retosDe({ max: 28 }), apto: aptoUno, deco: function(){ return deco("💣", "#FF6B3D"); },
    reglas: function(alc){ return reglasBase(alc, ["Cada pregunta trae una bomba con mecha: responde antes de que llegue a cero.", "Cada respuesta equivocada acorta la mecha unos segundos y rompe el combo.", "Si la bomba explota, pierdes una vida y ves la respuesta."]); },
    montar: function(zona, s){ return motorBomba(zona, s); } });
  G.registrar({ id: "gr", nombre: "Grammar Run", verbo: "Corre por el carril correcto", familia: "Carrera", color: "#34D399", orden: 22, vocab: false,
    retos: retosDe({ max: 24 }), apto: function(r){ return aptoUno(r) && !r.voc; }, deco: function(){ return deco("🏃", "#34D399"); },
    reglas: function(alc){ return reglasBase(alc, ["Tu gato corre solo. En cada puerta hay una respuesta por carril.", "Toca un carril (o usa ‹ › o las flechas) para ponerte en la respuesta correcta antes de llegar.", "Si pasas por la puerta equivocada, pierdes una vida y ves la corrección."]); },
    montar: function(zona, s){ return motorCarrera(zona, s); } });
  G.registrar({ id: "tw", nombre: "Target Words", verbo: "Dispara a las palabras de la categoría", familia: "Puntería", color: "#F43F5E", orden: 14, vocab: true,
    retos: retosDe({ max: 22 }), apto: function(r){ return aptoVarios(r) || (aptoUno(r) && r.malas.length >= 2); }, deco: function(){ return deco("🎯", "#F43F5E"); },
    reglas: function(alc){ return reglasBase(alc, ["Los blancos se mueven: dispara (toca) solo a las palabras que cumplen la instrucción.", "Un disparo equivocado rompe el combo; el segundo en el mismo reto te quita una vida.", "Si se acaba el tiempo del reto, ves las que faltaron."]); },
    montar: function(zona, s){ return motorDiana(zona, s); } });
  G.registrar({ id: "wc", nombre: "Word Catcher", verbo: "Atrapa solo las palabras que van", familia: "Reflejos", color: "#FB923C", orden: 16, vocab: true,
    retos: retosDe({ max: 20 }), apto: function(r){ return aptoVarios(r) || (aptoUno(r) && r.malas.length >= 2); }, deco: function(){ return deco("🧺", "#FB923C"); },
    reglas: function(alc){ return reglasBase(alc, ["Las palabras caen desde arriba. Arrastra la canasta (o usa las flechas) para atrapar solo las que cumplen la condición.", "Atrapar una que no va rompe el combo; la segunda te quita una vida.", "Si se te escapan las correctas, ves cuáles eran."]); },
    montar: function(zona, s){ return motorAtrapa(zona, s); } });
  G.registrar({ id: "sr", nombre: "Sentence Race", verbo: "Arma la frase y gana la carrera", familia: "Construir", color: "#60A5FA", orden: 24, vocab: false,
    /* las mismas frases de Phrase Builder (armadas también desde los ejercicios de completar y elegir) */
    retos: function(alc){ var pb = G.juegos.pb; return pb && pb.retos ? pb.retos(alc) : retosDe({ max: 22, fichas: 8 })(alc); }, apto: aptoOrden, oro: false, deco: function(){ return deco("🚗", "#60A5FA"); },
    reglas: function(alc){ return reglasBase(alc, ["Toca las piezas en orden para armar la frase: cada pieza correcta hace avanzar tu auto.", "Chloé y Hugo corren contra ti. Si los dos llegan antes, pierdes la carrera (sin perder vida).", "Una pieza equivocada rompe el combo; la segunda en la misma frase te quita una vida."]); },
    montar: function(zona, s){ return motorRace(zona, s); } });
  G.registrar({ id: "cc", nombre: "Card Chaos", verbo: "Juega la carta correcta", familia: "Cartas", color: "#A855F7", orden: 26, vocab: true,
    retos: retosDe({ max: 24 }), apto: aptoUno, deco: function(){ return deco("🃏", "#A855F7"); },
    reglas: function(alc){ return reglasBase(alc, ["En la mesa está el reto; en tu mano, las cartas. Juega la que lo completa.", "Tienes 2 comodines por partida: descartan cartas equivocadas.", "Cada tercera mano es del caos: las cartas se barajan solas.", "Una carta equivocada se quema y rompe el combo; la segunda te quita una vida."]); },
    montar: function(zona, s){ return motorCartas(zona, s); } });
  G.registrar({ id: "cm", nombre: "Combo Mode", verbo: "Mini-retos seguidos: sube el multiplicador", familia: "Combo", color: "#FACC15", orden: 55, vocab: true,
    retos: retosDe({ max: 24, fichas: 8 }), apto: function(r){ return aptoUno(r) || aptoVarios(r) || aptoOrden(r) || (r.tipo === "error" && r.malas && r.malas.length >= 1); },
    deco: function(){ return deco("🔥", "#FACC15"); },
    reglas: function(alc){ return reglasBase(alc, ["Mini-retos de todos los tipos, uno tras otro: elegir, categorías, ordenar frases y encontrar el error.", "3, 6 y 10 aciertos seguidos suben el multiplicador a ×2, ×3 y ×4.", "Un error rompe el combo; el segundo en el mismo reto te quita una vida."]); },
    montar: function(zona, s){ return motorCombo(zona, s); } });
  G.registrar({ id: "wb", nombre: "Word Battle", verbo: "Duelo en el mismo teléfono", familia: "Duelo", color: "#EC4899", orden: 58, vocab: true, sinFantasma: true, oro: false,
    retos: retosDe({ max: 22 }), apto: aptoUno, deco: function(){ return deco("⚔️", "#EC4899"); },
    aviso: function(){ return "Para dos personas frente a frente con el mismo teléfono. Si juegas solo, Manzana juega arriba."; },
    reglas: function(alc){ return [alc.seg + " segundos.", "Jugador 1 abajo; arriba juega Manzana, o el Jugador 2 si toca su lado.", "Los dos ven el mismo reto: gana el punto quien toca primero la respuesta correcta.", "Quien se equivoca queda fuera de ese reto."]; },
    opciones: function(){ return { vidas: 3, oro: false, cabeza: cabezaBatalla, titulo: function(){ return batalla.a > batalla.b ? "¡Ganaste el duelo!" : batalla.a === batalla.b ? "¡Empate!" : "¡Revancha!"; },
      estrellas: function(r){ return batalla.a > batalla.b ? (batalla.a >= 2 * Math.max(1, batalla.b) ? 3 : 2) : batalla.a === batalla.b && batalla.a ? 1 : 0; } }; },
    montar: function(zona, s){ return motorBatalla(zona, s); } });
  G.registrar({ id: "tc", nombre: "Team Challenge", verbo: "El equipo cumple la meta", familia: "Equipo", color: "#22C55E", orden: 60, vocab: true, sinFantasma: true, sinReloj: true,
    retos: retosDe({ max: 24 }), apto: aptoUno, deco: function(){ return deco("🤝", "#22C55E"); },
    aviso: function(){ return "Para jugar en grupo: se pasan el teléfono en cada turno (de 2 a 4 personas)."; },
    reglas: function(alc){ var m = [8, 10, 12][G.nivel(alc.track)]; return ["El equipo tiene 3 vidas y 120 segundos para lograr " + m + " aciertos.", "Cada reto lo responde quien tiene el turno; después se pasa el teléfono.", "Si alguien se equivoca, el siguiente del equipo lo intenta con el mismo reto.", "Si nadie acierta, el equipo pierde una vida y ve la corrección."]; },
    opciones: function(alc){
      var m = [8, 10, 12][G.nivel(alc.track)]; equipo.meta = m;
      return { seg: 120, jefe: { vida: m, nombre: "Meta del equipo · " + m + " aciertos", clase: "tc-hud" },
        estrellas: function(r){ if (!r.jefe || !r.jefe.vencido) return 0; return r.vidas >= 3 ? 3 : r.vidas >= 2 ? 2 : 1; },
        titulo: function(r){ return r.jefe && r.jefe.vencido ? "¡Meta cumplida!" : "¡Casi! Otra vez en equipo"; },
        pista: function(r){ return r.jefe && r.jefe.vencido ? "El equipo lo logró." : "Faltaron " + (r.jefe ? r.jefe.vida : "") + " aciertos para la meta."; } };
    },
    montar: function(zona, s){ return motorEquipo(zona, s); } });
  G.registrar({ id: "la", nombre: "Language Adventure", verbo: "Explora el mapa zona por zona", familia: "Aventura", color: "#10B981", orden: 75, vocab: false, sinFantasma: true, sinReloj: true, oro: false,
    retos: function(alc){ return planAventura(alc).retos; },
    oculto: function(){ return false; },
    deco: function(){ return deco("🗺️", "#10B981"); },
    portadaExtra: function(alc){ var p = planesLA[alc.clave] = planAventura(alc); return '<h2 class="plxg-h2">Tu mapa <small>' + p.ruta.length + " zonas · " + p.retos.length + " retos</small></h2>" + mapaHTML(p.ruta, -1, 0); },
    reglas: function(alc){ return ["Recorre las zonas del mapa en orden: vocabulario, escucha, gramática, escritura y voz (las que tenga esta unidad).", "Cada zona se juega con el juego de su habilidad.", "Completa todas las zonas antes de que se acabe el tiempo. Tienes 3 vidas."]; },
    opciones: function(alc){
      var p = planesLA[alc.clave] || planAventura(alc); delete planesLA[alc.clave];
      return { seg: p.seg, ordenFijo: true, oro: false, retos: p.retos, jefe: { vida: p.retos.length, nombre: "Mapa · " + p.ruta.length + " zonas", clase: "la-hud" }, _ruta: p.ruta,
        estrellas: function(r){ if (!r.jefe || !r.jefe.vencido) return 0; return r.vidas >= 3 ? 3 : r.vidas >= 2 ? 2 : 1; },
        titulo: function(r){ return r.jefe && r.jefe.vencido ? "¡Mapa completo!" : "¡La aventura sigue!"; } };
    },
    montar: function(zona, s){ return motorAventura(zona, s); } });
  /* el motor de la aventura necesita la ruta del plan: se la pasa la sesión por la capa */
  var _sesion = G.sesion;
  G.sesion = function(el, alc, juego, acciones, opc){ el.__laRuta = opc && opc._ruta ? opc._ruta : null; return _sesion.apply(this, arguments); };

  var st = document.createElement("style"); st.id = "plx56";
  st.textContent = `
  .x56{position:absolute;inset:0;display:flex;flex-direction:column;gap:12px;padding:0 16px calc(84px + env(safe-area-inset-bottom));max-width:560px;margin:0 auto;box-sizing:border-box}
  .x56.x-pausa .x-ops,.x56.x-pausa .tw-campo,.x56.x-pausa .wc-cielo,.x56.x-pausa .sr-banco,.x56.x-pausa .cc-mano,.x56.x-pausa .cm-caja,.x56.x-pausa .wb-lado .x-ops{visibility:hidden}
  .x-ops{display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:none}
  .x-op{all:unset;box-sizing:border-box;position:relative;cursor:pointer;display:flex;align-items:center;justify-content:center;text-align:center;min-height:56px;padding:10px 12px;border-radius:16px;background:#fff;color:#0B2D74;
    font:700 16px/1.25 Poppins,Inter,system-ui,sans-serif;overflow-wrap:anywhere;box-shadow:0 4px 0 #93C5FD,0 12px 24px -12px rgba(0,0,0,.7);-webkit-user-select:none;user-select:none;touch-action:manipulation}
  .x-op:active{transform:translateY(3px);box-shadow:0 1px 0 #93C5FD}
  .x-op small{display:none}
  .x-ops>.x-op:last-child:nth-child(odd){grid-column:1/-1}
  .x-op.mal{background:#3B1D2A;color:#FF9AA2;box-shadow:inset 0 0 0 2px #E5484D;cursor:default;text-decoration:line-through}
  .x-op.bien{background:#16A34A;color:#fff;box-shadow:0 4px 0 #0E6B30}
  .x-op:focus-visible,.x-oir:focus-visible,.cc-carta:focus-visible,.tw-b:focus-visible,.cm-chip:focus-visible{outline:3px solid #FFD200;outline-offset:3px}
  .x-nota{margin:0;min-height:18px;text-align:center;font:600 13px/1.35 Inter,system-ui,sans-serif;color:#C9D6F5}
  .x-oir{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin-top:6px;padding:6px 12px;border-radius:99px;background:#FFD200;color:#081F55;font:800 13px/1 Poppins,system-ui,sans-serif}
  .x-oir svg{width:16px;height:16px}
  .x-reloj{height:6px;border-radius:99px;background:rgba(147,197,253,.18);overflow:hidden;flex:none}
  .x-reloj i{display:block;height:100%;background:#93C5FD;transform-origin:left;border-radius:99px}
  .tw-meta{margin:4px 0 0;font:800 12px/1.3 Inter,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#FFD200}
  /* Bomb Countdown */
  .bc-escena{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
  .bc-bomba{--m:1;position:relative;width:min(46vw,180px);aspect-ratio:1}
  .bc-bomba svg{width:100%;height:100%;overflow:visible}
  .bc-mecha{fill:none;stroke:#C8A26B;stroke-width:5;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:calc((1 - var(--m)) * 100)}
  .bc-chispa{fill:#FFD200;filter:drop-shadow(0 0 6px #FF8A00);transform-box:fill-box;transform-origin:center;animation:bcChispa .25s ease-in-out infinite alternate}
  .bc-n{position:absolute;left:46.7%;top:58%;transform:translate(-50%,-50%);font:900 clamp(30px,10vw,46px)/1 Poppins,system-ui,sans-serif;color:#fff;font-variant-numeric:tabular-nums}
  .bc-bomba.poco .bc-n{color:#FF6B78}
  .bc-bomba.poco svg{animation:bcLate .35s ease-in-out infinite}
  .bc-bomba.sacude{animation:bcSacude .3s}
  .bc-bomba.ok .bc-chispa,.bc-bomba.ok .bc-mecha{opacity:0}.bc-bomba.ok .bc-n{color:#6BE58E}
  .bc-bomba.boom svg{animation:bcBoom .5s ease-out forwards}
  @keyframes bcChispa{to{transform:scale(1.5)}}
  @keyframes bcLate{50%{transform:scale(1.06)}}
  @keyframes bcSacude{25%{transform:translateX(-8px) rotate(-4deg)}75%{transform:translateX(8px) rotate(4deg)}}
  @keyframes bcBoom{50%{transform:scale(1.35);filter:brightness(2.2)}100%{transform:scale(.2);opacity:0}}
  /* Grammar Run */
  .gr-pista{position:relative;flex:1 1 auto;min-height:220px;border-radius:22px;overflow:hidden;background:#123A8F;box-shadow:inset 0 0 0 2px rgba(147,197,253,.25);cursor:pointer}
  .gr-suelo{position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(255,255,255,.07) 0 40px,rgba(255,255,255,0) 40px 80px)}
  .gr-lineas i{position:absolute;top:0;bottom:0;width:0;border-left:3px dashed rgba(255,210,0,.45)}
  .gr-puerta{position:absolute;left:0;right:0;display:grid;gap:6px;padding:0 6px}
  .gr-puerta span{display:flex;align-items:center;justify-content:center;text-align:center;min-height:54px;padding:6px;border-radius:12px;background:#fff;color:#0B2D74;font:800 14px/1.2 Poppins,system-ui,sans-serif;overflow-wrap:anywhere;box-shadow:0 5px 0 #93C5FD}
  .gr-puerta span.bien{background:#16A34A;color:#fff;box-shadow:0 5px 0 #0E6B30}.gr-puerta span.mal{background:#E5484D;color:#fff;box-shadow:0 5px 0 #9B1C22}
  .gr-corredor{position:absolute;bottom:14px;width:78px;height:78px;transform:translateX(-50%);transition:left .18s ease;left:50%}
  .gr-corredor img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 8px 10px rgba(0,0,0,.45));animation:grTrote .32s ease-in-out infinite alternate}
  .gr-corredor.salta img{animation:grSalta .5s ease-out}
  .gr-corredor.cae img{animation:none;transform:rotate(80deg) translateY(10px);opacity:.7}
  @keyframes grTrote{to{transform:translateY(-6px)}}
  @keyframes grSalta{50%{transform:translateY(-40px) scale(1.08)}}
  .gr-mandos{display:grid;grid-template-columns:64px 1fr 64px;align-items:center;gap:8px;flex:none}
  .gr-mandos button{all:unset;cursor:pointer;height:56px;border-radius:16px;display:grid;place-items:center;background:#FFD200;color:#081F55;font:900 30px/1 Poppins,system-ui,sans-serif;box-shadow:0 4px 0 #C9A400}
  .gr-mandos button:focus-visible{outline:3px solid #fff;outline-offset:3px}
  /* Target Words */
  .tw-campo{position:relative;flex:1 1 auto;min-height:240px;border-radius:22px;background:radial-gradient(circle at 50% 50%,rgba(244,63,94,.12),rgba(0,0,0,0) 60%),rgba(0,0,0,.18);overflow:hidden;cursor:crosshair}
  .tw-b{all:unset;position:absolute;left:0;top:0;cursor:crosshair;display:grid;place-items:center;min-width:70px;max-width:150px;padding:10px 14px;border-radius:999px;background:#fff;color:#0B2D74;text-align:center;
    font:800 14px/1.2 Poppins,system-ui,sans-serif;box-shadow:0 0 0 4px #F43F5E,0 0 0 8px #fff,0 0 0 11px #F43F5E,0 10px 20px -8px rgba(0,0,0,.6);will-change:transform;touch-action:manipulation}
  .tw-b.boom{animation:twBoom .35s ease-out forwards}
  .tw-b.mal{background:#3B1D2A;color:#FF9AA2;box-shadow:0 0 0 3px #E5484D;opacity:.6}
  @keyframes twBoom{to{opacity:0;scale:1.6}}
  /* Word Catcher */
  .wc-cielo{position:relative;flex:1 1 auto;min-height:260px;border-radius:22px;overflow:hidden;background:linear-gradient(180deg,rgba(147,197,253,.12),rgba(0,0,0,.2));touch-action:none}
  .wc-p{position:absolute;left:0;top:0;padding:8px 12px;border-radius:12px;background:#fff;color:#0B2D74;font:800 14px/1.2 Poppins,system-ui,sans-serif;white-space:nowrap;box-shadow:0 6px 14px -6px rgba(0,0,0,.6);will-change:transform}
  .wc-p.bien{background:#16A34A;color:#fff}.wc-p.mal{background:#E5484D;color:#fff}
  .wc-cesta{position:absolute;bottom:8px;left:50%;z-index:1;width:92px;height:56px;transform:translateX(-50%);display:grid;place-items:center;border-radius:0 0 30px 30px;background:#FB923C;box-shadow:inset 0 6px 0 rgba(255,255,255,.35),0 10px 20px -8px rgba(0,0,0,.6);pointer-events:none}
  .wc-cesta span{font-size:30px}
  /* Sentence Race */
  .sr-pista{display:grid;gap:6px;flex:none}
  .sr-c{display:grid;grid-template-columns:58px 1fr;align-items:center;gap:8px}
  .sr-c small{font:800 11px/1 Inter,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#A6B6E0}
  .sr-c.yo small{color:#FFD200}
  .sr-via{position:relative;height:38px;border-radius:12px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 22px,rgba(255,255,255,0) 22px 44px),rgba(0,0,0,.22)}
  .sr-meta{position:absolute;right:0;top:0;bottom:0;width:10px;background:repeating-linear-gradient(0deg,#fff 0 6px,#111 6px 12px);border-radius:0 12px 12px 0}
  .sr-auto{position:absolute;top:50%;transform:translateY(-50%) scaleX(-1);font-size:26px;transition:left .25s ease;filter:drop-shadow(0 0 6px var(--c))}
  .sr-frase{margin:6px 0 0;min-height:48px;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.08);font:700 18px/1.4 Poppins,system-ui,sans-serif;color:#fff}
  .sr-frase .hueco,.plxg .hueco{color:#FFD200}
  .sr-banco{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:auto}
  .sr-f{min-height:48px;padding:8px 14px;flex:0 1 auto}
  .sr-f.usada{opacity:.25}
  /* Card Chaos */
  .cc-mesa{flex:1 1 auto;min-height:0;display:grid;place-items:center}
  .cc-reto{display:grid;gap:8px;justify-items:center;width:min(100%,380px);padding:18px;border-radius:22px;background:linear-gradient(160deg,#2E1065,#4C1D95);box-shadow:inset 0 0 0 2px rgba(216,180,254,.4),0 16px 30px -18px rgba(0,0,0,.8);text-align:center}
  .cc-reto small{font:800 11px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#D8B4FE}
  .cc-reto b{font:800 19px/1.35 Poppins,system-ui,sans-serif;color:#fff}
  .cc-reto.gana{box-shadow:inset 0 0 0 3px #6BE58E,0 0 40px -6px rgba(107,229,142,.6)}
  .cc-jugada{padding:8px 14px;border-radius:12px;background:#fff;color:var(--pc);font:800 16px/1.2 Poppins,system-ui,sans-serif;animation:ccCae .35s ease-out}
  .cc-mano{display:flex;justify-content:center;align-items:flex-end;gap:0;flex:none;min-height:150px;padding:0 10px}
  .cc-carta{all:unset;box-sizing:border-box;cursor:pointer;position:relative;flex:0 0 auto;width:min(26vw,108px);height:146px;margin:0 -8px;padding:22px 8px;border-radius:14px;background:#FFFDF6;color:#0B2D74;
    display:grid;place-items:center;text-align:center;font:800 14px/1.2 Poppins,system-ui,sans-serif;overflow-wrap:anywhere;transform:rotate(var(--g));transform-origin:50% 120%;
    box-shadow:0 0 0 2px var(--pc),0 12px 22px -10px rgba(0,0,0,.7);transition:transform .2s ease}
  .cc-carta:hover,.cc-carta:focus-visible{transform:rotate(var(--g)) translateY(-14px);z-index:2}
  .cc-carta i{position:absolute;top:6px;left:8px;font-style:normal;color:var(--pc);font-size:18px}
  .cc-carta i.cc-pie{top:auto;left:auto;bottom:6px;right:8px;transform:rotate(180deg)}
  .cc-carta.mal{background:#3B1D2A;color:#FF9AA2;opacity:.55;cursor:default}
  .cc-carta.fuera{opacity:.12;cursor:default}
  .cc-carta.bien{background:#16A34A;color:#fff}
  .cc-carta.reparte{animation:ccReparte .4s ease-out both}
  .cc-carta.caos{animation:ccCaos .5s ease-in-out both}
  @keyframes ccReparte{from{transform:translateY(90px) rotate(0);opacity:0}}
  @keyframes ccCaos{40%{transform:translateY(-30px) rotate(calc(var(--g) * -3))}}
  @keyframes ccCae{from{transform:translateY(40px);opacity:0}}
  .cc-comodin{all:unset;cursor:pointer;align-self:center;padding:8px 16px;border-radius:99px;background:rgba(168,85,247,.25);color:#F3E8FF;font:800 13px/1 Poppins,system-ui,sans-serif;box-shadow:inset 0 0 0 2px #A855F7}
  .cc-comodin[disabled]{opacity:.4;cursor:default}
  /* Combo Mode */
  .cm-medidor{--calor:0;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:14px;align-items:center;padding:10px 14px;border-radius:18px;flex:none;
    background:linear-gradient(90deg,rgba(250,204,21,calc(.12 + var(--calor) * .4)),rgba(239,68,68,calc(var(--calor) * .35)));box-shadow:inset 0 0 0 2px rgba(250,204,21,calc(.3 + var(--calor) * .6))}
  .cm-x{grid-row:1/3;font:900 44px/1 Poppins,system-ui,sans-serif;color:#FACC15;text-shadow:0 0 18px rgba(250,204,21,.6)}
  .cm-x.sube{animation:cmSube .4s ease-out}
  .cm-r{font:800 14px/1.2 Poppins,system-ui,sans-serif;color:#fff}
  .cm-tipo{justify-self:start;padding:3px 10px;border-radius:99px;background:rgba(255,255,255,.14);font:800 11px/1.4 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#FDE68A}
  @keyframes cmSube{40%{transform:scale(1.5) rotate(-6deg)}}
  .cm-caja{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;gap:12px}
  .cm-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
  .cm-chip{all:unset;cursor:pointer;padding:12px 16px;border-radius:14px;background:#fff;color:#0B2D74;font:800 15px/1.2 Poppins,system-ui,sans-serif;box-shadow:0 4px 0 #93C5FD}
  .cm-chip.sel{background:#FACC15;box-shadow:0 4px 0 #B48F00}
  .cm-chip.bien{outline:3px solid #16A34A}
  .cm-listo{align-self:center;min-width:180px}
  /* Word Battle */
  .wb{gap:6px;padding-bottom:calc(10px + env(safe-area-inset-bottom))}
  .wb-lado{flex:1 1 0;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;gap:8px;padding:10px;border-radius:20px;background:rgba(236,72,153,.12);box-shadow:inset 0 0 0 2px rgba(236,72,153,.35)}
  .wb-abajo{background:rgba(96,165,250,.12);box-shadow:inset 0 0 0 2px rgba(96,165,250,.4)}
  .wb-arriba{transform:rotate(180deg)}
  .wb-lado.gana{box-shadow:inset 0 0 0 3px #6BE58E,0 0 30px -6px rgba(107,229,142,.6)}
  .wb-lado.fuera .x-ops{opacity:.35}
  .wb-q{margin:0;display:grid;gap:4px;text-align:center}
  .wb-q small{font:700 12px/1.3 Inter,system-ui,sans-serif;color:#C9D6F5}
  .wb-q b{font:800 17px/1.3 Poppins,system-ui,sans-serif;color:#fff}
  .wb-q .x-oir{justify-self:center;margin:0}
  .wb .x-op{min-height:48px;font-size:15px}
  .wb-quien{margin:0;text-align:center;font:800 11px/1.2 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#A6B6E0}
  .wb-marcador{flex:none;display:flex;align-items:center;justify-content:center;gap:18px;font:900 22px/1 Poppins,system-ui,sans-serif}
  .wb-marcador b{font-size:14px;padding:4px 10px;border-radius:99px;background:#FFD200;color:#081F55}
  .wb-pb{color:#F472B6;transform:rotate(180deg)}.wb-pa{color:#60A5FA}
  .plxg.wb-on .plxg-mz{display:none}
  .wb-res{text-align:center;margin:0 0 12px}
  .wb-res p{margin:0 0 8px;font:900 24px/1.2 Poppins,system-ui,sans-serif;color:#FFD200}
  .wb-res div{display:flex;justify-content:center;align-items:center;gap:18px}
  .wb-res span{display:grid;gap:2px}.wb-res small{font:700 11px/1 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.1em;color:#A6B6E0}
  .wb-res b{font:900 34px/1 Poppins,system-ui,sans-serif;color:#fff}.wb-res em{font-style:normal;font-weight:900;color:#F472B6}
  /* Team Challenge */
  .tc{--tc:#FFD200}
  .tc-cab{display:flex;align-items:center;justify-content:space-between;gap:10px;flex:none}
  .tc-turno{display:flex;align-items:center;gap:10px}
  .tc-turno i{width:40px;height:40px;border-radius:50%;box-shadow:0 0 0 4px rgba(255,255,255,.15)}
  .tc-turno span{display:grid}.tc-turno small{font:700 11px/1.2 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#A6B6E0}
  .tc-turno b{font:900 20px/1.1 Poppins,system-ui,sans-serif;color:var(--tc)}
  .tc-n{display:flex;align-items:center;gap:6px;font:700 12px/1 Inter,system-ui,sans-serif;color:#C9D6F5}
  .tc-n button{all:unset;cursor:pointer;width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:rgba(255,255,255,.12);font:900 18px/1 Poppins,system-ui,sans-serif}
  .tc .x-ops{margin-top:auto}
  .tc .x-op{box-shadow:0 4px 0 var(--tc),0 12px 24px -12px rgba(0,0,0,.7)}
  /* Language Adventure */
  .la-sub{position:absolute;inset:0}
  .la-viaje{position:absolute;inset:0;z-index:4;display:grid;place-items:center;padding:90px 16px 90px;background:rgba(6,23,63,.82);backdrop-filter:blur(3px)}
  .la-viaje[hidden]{display:none}
  .la-card{width:min(100%,420px);display:grid;justify-items:center;gap:6px;padding:20px;border-radius:24px;background:linear-gradient(160deg,#065F46,#0B2D74);box-shadow:inset 0 0 0 2px rgba(110,231,183,.4);text-align:center;animation:ccCae .4s ease-out}
  .la-card small{font:800 11px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#6EE7B7}
  .la-big{font-size:54px;line-height:1.1}
  .la-card b{font:900 22px/1.2 Poppins,system-ui,sans-serif;color:#fff}.la-card em{font-style:normal;color:#FFD200;font-weight:800}
  .la-mapa{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px;width:100%;text-align:left}
  .la-mapa li{display:grid;grid-template-columns:36px 1fr;gap:10px;align-items:center;padding:6px 10px;border-radius:14px;background:rgba(255,255,255,.06)}
  .la-mapa li.cur{background:rgba(255,210,0,.16);box-shadow:inset 0 0 0 2px #FFD200}
  .la-mapa li.ok{opacity:.65}
  .la-ic{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.1);font-size:18px}
  .la-mapa b{display:block;font:800 14px/1.2 Poppins,system-ui,sans-serif;color:#fff}.la-mapa small{font:600 12px/1.3 Inter,system-ui,sans-serif;color:#A6B6E0}
  @media (prefers-reduced-motion:reduce){.bc-bomba svg,.bc-chispa,.gr-corredor img,.cc-carta,.tw-b.boom,.cm-x.sube{animation:none!important}}
  /* ===== 2.2: diseño de juego ===== */
  .bc{background:radial-gradient(circle at 50% 38%,rgba(255,107,61,.22),transparent 58%)}
  .bc-escena{position:relative}
  .bc-escena::after{content:"";position:absolute;left:8%;right:8%;bottom:0;height:12px;border-radius:8px;background:repeating-linear-gradient(-45deg,#FFD200 0 14px,#16161A 14px 28px);opacity:.85;animation:bcCinta 1s linear infinite}
  @keyframes bcCinta{to{background-position:40px 0}}
  .bc-bomba{filter:drop-shadow(0 22px 26px rgba(0,0,0,.65));animation:bcFlota 2.4s ease-in-out infinite alternate}
  @keyframes bcFlota{to{translate:0 -8px}}
  .bc-bomba.poco{filter:drop-shadow(0 0 28px rgba(255,60,60,.95))}
  .bc-bomba.ok{filter:drop-shadow(0 0 30px rgba(107,229,142,.9))}
  .bc.bc-flash::before{content:"";position:absolute;inset:-40%;z-index:5;pointer-events:none;background:radial-gradient(circle at 50% 40%,#fff 0,#FFB020 18%,rgba(255,80,40,.5) 40%,transparent 65%);animation:bcFlash .7s ease-out forwards}
  @keyframes bcFlash{from{opacity:1;transform:scale(.4)}to{opacity:0;transform:scale(1.4)}}
  .bc .x-op{box-shadow:0 4px 0 #FF6B3D,0 12px 24px -12px rgba(0,0,0,.7)}
  .gr-pista{background:linear-gradient(90deg,#166534 0 5%,#22C55E 5% 6%,#2B2F3A 6% 94%,#22C55E 94% 95%,#166534 95%)}
  .gr-suelo{background:repeating-linear-gradient(180deg,rgba(255,255,255,.10) 0 38px,rgba(255,255,255,0) 38px 80px);mix-blend-mode:screen}
  .gr-pista::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(11,45,116,.65),transparent 30%)}
  .gr-puerta span{box-shadow:0 5px 0 #34D399,0 0 22px rgba(52,211,153,.55);border:2px solid #34D399}
  .gr-corredor::after{content:"";position:absolute;left:18%;right:18%;bottom:-6px;height:10px;border-radius:50%;background:rgba(0,0,0,.45);filter:blur(2px);z-index:-1}
  .tw-campo::before{content:"";position:absolute;inset:-60%;background:conic-gradient(from 0deg,rgba(244,63,94,.28),transparent 22%);animation:twRadar 3.2s linear infinite;pointer-events:none}
  .tw-campo::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-radial-gradient(circle at 50% 50%,rgba(255,255,255,.07) 0 1px,transparent 1px 60px),linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px) 0 0/40px 40px,linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px) 0 0/40px 40px}
  @keyframes twRadar{to{transform:rotate(360deg)}}
  .tw-b{z-index:1}
  .tw-b::before{content:"";position:absolute;inset:-9px;border-radius:999px;border:2px dashed rgba(255,255,255,.7);animation:twGira 4s linear infinite;pointer-events:none}
  @keyframes twGira{to{rotate:360deg}}
  .tw-laser{position:absolute;left:var(--x);top:var(--y);width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px #F43F5E,0 0 30px 10px rgba(244,63,94,.8);pointer-events:none;z-index:4;animation:twFlash .26s ease-out forwards}
  @keyframes twFlash{to{transform:scale(3.5);opacity:0}}
  .wc-cielo{background:linear-gradient(180deg,#1D4ED8 0%,#60A5FA 55%,#BFDBFE 84%,#4ADE80 84%,#15803D 100%)}
  .wc-cielo::before,.wc-cielo::after{content:"";position:absolute;top:12%;left:-40%;width:120px;height:40px;border-radius:40px;background:rgba(255,255,255,.85);box-shadow:40px -14px 0 6px rgba(255,255,255,.85),80px 0 0 0 rgba(255,255,255,.85);animation:wcNube 22s linear infinite;pointer-events:none}
  .wc-cielo::after{top:34%;transform:scale(.7);animation-duration:30s;animation-delay:-12s;opacity:.7}
  @keyframes wcNube{to{left:120%}}
  .wc-p{border-radius:999px;border:3px solid #FB923C;padding:8px 14px;animation:wcWob .9s ease-in-out infinite alternate;z-index:1}
  @keyframes wcWob{from{rotate:-5deg}to{rotate:5deg}}
  .wc-p.bien{animation:wcAtrapa .26s ease-out forwards}.wc-p.mal{animation:wcAtrapa .26s ease-out forwards}
  @keyframes wcAtrapa{to{scale:.2;opacity:0}}
  .sr-via{background:linear-gradient(0deg,transparent 46%,#FACC15 46% 54%,transparent 54%) 0 0/32px 100% repeat-x,#1F2937;animation:srVia .5s linear infinite}
  .sr-c.yo .sr-via{box-shadow:inset 0 0 0 2px #FFD200}
  @keyframes srVia{to{background-position:-32px 0,0 0}}
  .sr-auto{animation:srRebote .22s ease-in-out infinite alternate}
  @keyframes srRebote{to{translate:0 -3px}}
  .sr .sr-f{box-shadow:0 4px 0 #60A5FA,0 12px 24px -12px rgba(0,0,0,.7)}
  .cc-mesa{border-radius:28px;padding:14px;background:radial-gradient(ellipse at center,#15803D 0%,#14532D 60%,#052E16 100%);box-shadow:inset 0 0 0 6px #78350F,inset 0 0 0 9px #FBBF24,inset 0 0 70px rgba(0,0,0,.6)}
  .cc-reto{background:linear-gradient(160deg,#2E1065,#4C1D95);box-shadow:inset 0 0 0 3px #FBBF24,0 18px 30px -16px rgba(0,0,0,.9)}
  .cc-carta.reparte{animation:ccReparte .5s cubic-bezier(.2,1.3,.4,1) both;animation-delay:calc(var(--i) * 80ms)}
  @keyframes ccReparte{from{transform:translateY(140px) rotateY(180deg) rotate(0);opacity:0}to{transform:rotate(var(--g))}}
  .cc-carta.mal{animation:ccQuema .5s ease-out}
  @keyframes ccQuema{30%{filter:brightness(2) sepia(1) hue-rotate(-30deg)}}
  .cm{background:radial-gradient(circle at 50% 110%,rgba(250,204,21,calc(var(--calor,0) * .45)),transparent 60%)}
  .cm-medidor{position:relative}
  .cm-medidor::after{content:"🔥";position:absolute;right:12px;top:50%;translate:0 -50%;font-size:calc(18px + var(--calor,0) * 34px);filter:drop-shadow(0 0 calc(var(--calor,0) * 18px) #F97316);animation:cmFuego .5s ease-in-out infinite alternate}
  @keyframes cmFuego{to{scale:1.12 1.2}}
  @media (prefers-reduced-motion:reduce){.bc-bomba,.bc-escena::after,.tw-campo::before,.tw-b::before,.wc-cielo::before,.wc-cielo::after,.wc-p,.sr-via,.sr-auto,.cm-medidor::after{animation:none!important}}
  `;
  document.head.appendChild(st);
})();
