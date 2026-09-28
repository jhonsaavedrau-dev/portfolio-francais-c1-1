/* PLEX PLAY 2.0.0 — Una sola aventura
   Todo lo que ya existe (lecciones, Arcade, XP, niveles, rachas, rankings) se conecta en un mismo recorrido:
   - Navegación: Inicio · Aprender · Jugar · Ranking · Perfil. «Jugar» es la pestaña de retos con el Arcade arriba;
     «Ranking» abre los rankings (Unipamplona y Global) sin salir de donde estás.
   - Barra superior: además de racha y XP, el nivel con su barra de avance, siempre visible.
   - Inicio: el mapa de mundos (Primeros pasos → A1 → … → C1) con el avance de cada uno.
   - Cada lección es una aventura de 5 pasos: 1 Explicación · 2 Práctica · 3 Mini-juego · 4 Reto · 5 Cofre.
     El mini-juego sale de la habilidad de la lección (vocabulario → Memory Rush, escucha → Audio Hunt,
     gramática → Language Detective, frases → Phrase Builder, ortografía → Spell Builder) y el reto trabaja
     otra habilidad (voz, escritura o escucha). Con los dos hechos se abre el cofre: XP extra.
     Los mini-juegos dan XP con addXP (plx45), así que todo suma al mismo nivel, racha y ranking.
   - En la lista de lecciones, cada lección muestra su recorrido (5 puntos) y el trofeo si está completa.
   El avance de la aventura se guarda en S.adv[idLección] = { j: estrellas, r: estrellas, cofre: 1 }. */
(function(){
  "use strict";
  if (typeof render !== "function" || typeof TRACKS === "undefined" || typeof LESSONS === "undefined") return;
  var G = window.PLXG || null;
  var esc = function(x){ return String(x == null ? "" : x).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var COFRE_XP = 25;

  /* ---------------- avance de la aventura ---------------- */
  var ADV = function(){ if (!S.adv || typeof S.adv !== "object") S.adv = {}; return S.adv; };
  var av = function(id){ return ADV()[id] || {}; };
  var hecha = function(id){ return !!(S.lessons[id] && S.lessons[id].done); };
  var ELIGE = {};
  var pasos = function(id){
    var a = av(id), h = hecha(id), l = LESSONS.find(function(x){ return x.id === id; });
    var e = l ? (ELIGE[id] || (ELIGE[id] = elige(l))) : null, sinJ = !!(e && !e.j), sinR = !!(e && !e.r);
    var j = !!a.j || (sinJ && h), r = !!a.r || (sinR && j);
    return [h, h, j, r, !!a.cofre || (sinJ && h)];
  };

  /* ---------------- qué juego va con cada habilidad ---------------- */
  var HAB = { voc: "vocab", cult: "vocab", phono: "oido", comp: "oido", gram: "gram", conj: "gram", accord: "gram", synt: "gram", prep: "gram",
    ortho: "escritura", registre: "frases", coh: "frases", lit: "frases" };
  var HAB_TXT = { vocab: "Vocabulario", oido: "Escucha", gram: "Gramática", escritura: "Escritura", frases: "Frases", voz: "Voz", mixto: "Mixto" };
  /* 2.1: cada habilidad tiene varios juegos; lecciones seguidas alternan entre los que sirven */
  var JUEGO = { vocab: ["mr", "tw", "wc", "ff", "ah"], oido: ["ah", "bc", "ff", "mr"], gram: ["ld", "gr", "cc", "pb", "ff"], escritura: ["sb", "sr", "ld", "ff"], frases: ["pb", "sr", "cc", "ld", "ff"] };
  var RETO = { vocab: ["bc", "sb", "ah", "vd", "cm"], oido: ["vd", "bc", "sb", "pb", "cm"], gram: ["bc", "sb", "ah", "vd", "cm"], escritura: ["ah", "vd", "bc", "cm"], frases: ["vd", "ah", "bc", "cm"] };
  var FAM_HAB = { Reflejos: "vocab", Construir: "frases", Escucha: "oido", Memoria: "vocab", Detective: "gram", Voz: "voz",
    Contrarreloj: "mixto", Carrera: "gram", "Puntería": "vocab", Cartas: "gram", Combo: "mixto" };
  var sirve = function(jid, alc){
    try {
      var j = G && G.juegos[jid]; if (!j || !j.montar || (j.oculto && j.oculto())) return false;
      return G.nRetos(j, alc) >= G.MIN_RETOS;
    } catch (e) { return false; }
  };
  /* alcance de respaldo: la lección y las anteriores de su unidad (cuenta igual para la aventura de la lección) */
  var ampliado = function(l){
    var base = G.alc.leccion(l), us = LESSONS.filter(function(x){ return x.track === l.track && x.unit === l.unit; }), i = us.indexOf(l);
    return Object.assign({}, base, { clave: "l:" + l.id + "+u", sub: base.guiado ? base.sub : "Esta lección y las anteriores de la unidad", lecciones: i > 0 ? us.slice(0, i + 1) : us });
  };
  var elige = function(l){
    if (!G || !G.alc) return null;
    var alc = G.alc.leccion(l), ext = null, h = HAB[l.t] || "vocab";
    var vuelta = Math.max(0, LESSONS.filter(function(x){ return x.track === l.track; }).indexOf(l));
    var busca = function(lista, sin){
      /* los que sirven con la lección sola; entre los dos primeros se alterna según la lección */
      var ok = lista.filter(function(id){ return id !== sin && sirve(id, alc); });
      if (ok.length) { var top = ok.slice(0, Math.min(2, ok.length)); return { id: top[vuelta % top.length], alc: alc }; }
      ext = ext || ampliado(l);
      for (var k = 0; k < lista.length; k++) if (lista[k] !== sin && sirve(lista[k], ext)) return { id: lista[k], alc: ext };
      return null;
    };
    var j = busca((l.juego ? [l.juego] : []).concat(JUEGO[h]), null);
    var r = busca(RETO[h].concat(["ah", "pb", "sb", "mr", "ff"]), j && j.id);
    return { alc: alc, hab: h, j: j && j.id, jAlc: j && j.alc, r: r && r.id, rAlc: r && r.alc };
  };
  window.PLX_AV = { elige: elige, pasos: pasos };

  /* un mini-juego terminado dentro de una lección cuenta como paso de su aventura */
  if (G && G.premiar) {
    var _premiar = G.premiar;
    G.premiar = function(jid, alc, r){
      var out = _premiar.apply(this, arguments);
      try {
        var m = /^l:([^+]+)/.exec(alc && alc.clave || ""); if (!m || !r || !(r.aciertos > 0)) return out;
        var l = LESSONS.find(function(x){ return x.id === m[1]; }); if (!l) return out;
        var e = elige(l), a = ADV()[l.id] || (ADV()[l.id] = {}), est = Math.max(1, r.estrellas || 0);
        if (e && jid === e.j) a.j = Math.max(a.j || 0, est);
        else if (e && jid === e.r) a.r = Math.max(a.r || 0, est);
        else if (!a.j) a.j = est; else if (!a.r) a.r = est;
        save(!0);
      } catch (x) {}
      return out;
    };
  }
  if (G && G.cerrar) {
    var _cerrar = G.cerrar;
    G.cerrar = function(){ var r = _cerrar.apply(this, arguments); setTimeout(function(){ try { pintaFin(true); renderStats(); } catch (e) {} }, 30); return r; };
  }

  /* ---------------- la ruta (5 pasos) ---------------- */
  var NOMBRES = ["Explicación", "Práctica", "Mini-juego", "Reto", "Cofre"];
  var ICO = ["📖", "✍️", "🎮", "⚡", "🎁"];
  var ruta = function(l, actual){
    var p = pasos(l.id);
    return '<ol class="av-ruta" aria-label="Tu aventura en esta lección">' + NOMBRES.map(function(n, i){
      var st = p[i] ? "ok" : i === actual ? "cur" : "";
      return '<li class="' + st + '"' + (i === actual ? ' aria-current="step"' : "") + '><i aria-hidden="true">' + (p[i] ? "✓" : ICO[i]) + "</i><span>" + n + "</span></li>";
    }).join("") + "</ol>";
  };

  /* pantalla de teoría: la ruta debajo de los chips */
  var pintaTeoria = function(){
    var pl = document.getElementById("player"); if (!pl || pl.hidden || typeof P === "undefined" || !P || P.mode !== "lesson" || !P.lesson) return;
    var st = P.steps && P.steps[P.i]; if (!st || st.kind !== "theory" || pl.querySelector(".av-ruta")) return;
    var e = elige(P.lesson); if (!e || !e.j) return;   /* exámenes y proyectos: sin mini-juegos, sin ruta */
    var ancla = pl.querySelector(".pbody .m-chips") || pl.querySelector(".pbody .disp"); if (!ancla) return;
    ancla.insertAdjacentHTML("afterend", ruta(P.lesson, 0));
  };

  /* final de la lección: los pasos 3, 4 y 5 */
  var tarjetaJuego = function(paso, jid, hecho, l, e){
    var j = G.juegos[jid]; if (!j) return "";
    var hab = paso === 2 ? HAB_TXT[e.hab] : HAB_TXT[FAM_HAB[j.familia] || "vocab"];
    return '<button class="av-paso' + (hecho ? " ok" : "") + '" data-av-jugar="' + esc(jid) + '" data-av-l="' + esc(l.id) + '" style="--ac:' + esc(j.color) + '">' +
      '<span class="av-n">' + (hecho ? "✓" : paso + 1) + "</span>" +
      '<span class="av-tx"><small>Paso ' + (paso + 1) + " · " + NOMBRES[paso] + " · " + esc(hab) + "</small><b>" + esc(j.nombre) + "</b><span>" + esc(j.verbo) + "</span></span>" +
      '<span class="av-go">' + (hecho ? "Otra vez" : "Jugar") + "</span></button>";
  };
  var pintaFin = function(forzar){
    var pl = document.getElementById("player"); if (!pl || pl.hidden || typeof P === "undefined" || !P || P.mode !== "lesson" || !P.lesson || P.phase !== "end") return;
    var viejo = pl.querySelector(".av-fin"); if (viejo && !forzar) return;
    var l = P.lesson, e = elige(l); if (!e || !e.j) return;
    var a = av(l.id), listo = !!(a.j && (a.r || !e.r)), abierto = !!a.cofre;
    var cofre = '<button class="av-cofre' + (abierto ? " abierto" : listo ? " listo" : "") + '" data-av-cofre="' + esc(l.id) + '"' + (listo && !abierto ? "" : " disabled") + ">" +
      '<span class="av-n">' + (abierto ? "✓" : "5") + '</span><span class="av-c" aria-hidden="true">' + (abierto ? "🏆" : "🎁") + "</span>" +
      '<span class="av-tx"><small>Paso 5 · Cofre</small><b>' + (abierto ? "¡Aventura completa!" : listo ? "Abre tu cofre" : "Cofre cerrado") + "</b><span>" +
      (abierto ? "+" + COFRE_XP + " XP ganados. Sigue con la próxima lección." : listo ? "+" + COFRE_XP + " XP de premio" : "Termina el mini-juego" + (e.r ? " y el reto" : "") + " para abrirlo") + "</span></span></button>";
    var html = '<section class="av-fin"><h3>Tu aventura</h3>' + ruta(l, !a.j ? 2 : !a.r && e.r ? 3 : 4) +
      tarjetaJuego(2, e.j, !!a.j, l, e) + (e.r ? tarjetaJuego(3, e.r, !!a.r, l, e) : "") + cofre + "</section>";
    if (viejo) { viejo.outerHTML = html; return; }
    var ex = pl.querySelector(".plx-endx"), stats = pl.querySelector(".pxr-stats"), pfe = pl.querySelector(".pf-end");
    if (ex) ex.insertAdjacentHTML("beforebegin", html);
    else if (stats) stats.insertAdjacentHTML("afterend", html);
    else if (pfe) pfe.insertAdjacentHTML("beforebegin", html);
  };
  var vigila = function(){ try { pintaTeoria(); pintaFin(false); } catch (e) {} };
  var plEl = document.getElementById("player");
  if (plEl) new MutationObserver(vigila).observe(plEl, { childList: true, subtree: true });

  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-av-jugar]");
    if (b) {
      ev.preventDefault(); ev.stopPropagation();
      var l = LESSONS.find(function(x){ return x.id === b.dataset.avL; }); if (!l || !G || !G.arcade) return;
      var e = elige(l), jid = b.dataset.avJugar, a = e && (jid === e.j ? e.jAlc : jid === e.r ? e.rAlc : null);
      G.arcade(a || G.alc.leccion(l), jid); return;
    }
    var c = ev.target.closest && ev.target.closest("[data-av-cofre]");
    if (c && !c.disabled) {
      ev.preventDefault(); ev.stopPropagation();
      var a = ADV()[c.dataset.avCofre] || (ADV()[c.dataset.avCofre] = {}); if (a.cofre) return;
      a.cofre = 1; addXP(COFRE_XP); save(!0);
      c.classList.add("abre");
      try { if (typeof SFX !== "undefined" && SFX.ok) SFX.ok(); } catch (x) {}
      try { toast("¡Cofre abierto! +" + COFRE_XP + " XP"); } catch (x) {}
      setTimeout(function(){ pintaFin(true); try { renderStats(); gAfterProgress(); } catch (x) {} }, 650);
    }
  }, true);

  /* ---------------- lista de lecciones: el recorrido de cada una ---------------- */
  var marcaFilas = function(){
    document.querySelectorAll("#view .lxl-row[data-arg]").forEach(function(b){
      if (b.querySelector(".av-dots")) return;
      var id = b.dataset.arg, p = pasos(id), n = p.filter(Boolean).length; if (!n) return;
      var t = b.querySelector(".lxl-t small"); if (!t) return;
      t.insertAdjacentHTML("afterend", '<span class="av-dots" title="Aventura: ' + n + ' de 5 pasos">' +
        p.map(function(x){ return "<i" + (x ? ' class="ok"' : "") + "></i>"; }).join("") + (p[4] ? '<em aria-label="Aventura completa">🏆</em>' : "") + "</span>");
    });
  };

  /* ---------------- Inicio: el mapa de mundos ---------------- */
  var MUNDO = { pp: "🐣", a1: "🗼", a2: "☕", fon: "🎙️", b11: "🏙️", b12: "🏖️", b21: "⛰️", rem: "🇫🇷", prog: "📚", c12: "🌙", lit: "🎭" };
  var avance = function(t){
    var ls = LESSONS.filter(function(l){ return l.track === t.id && !l.special; });
    var d = ls.filter(function(l){ return hecha(l.id); }).length;
    return { n: ls.length, d: d, pct: ls.length ? Math.round(d / ls.length * 100) : 0 };
  };
  var mapa = function(){
    if (view !== "parcours") return;
    var main = document.querySelector("#view .gmain"); if (!main || main.querySelector(".av-mapa")) return;
    var ts = TRACKS.slice().sort(function(a, b){ return (+a.semN || 0) - (+b.semN || 0); });
    var html = '<section class="av-mapa" aria-label="Mapa de mundos"><div class="av-mh"><h2>Tu mapa</h2><span>Del primer «bonjour» al C1</span></div><div class="av-ms">' +
      ts.map(function(t, i){
        var x = avance(t), cur = t.id === track;
        return '<button class="av-mu' + (cur ? " cur" : "") + (x.pct === 100 ? " ok" : "") + '" data-av-mundo="' + esc(t.id) + '"' + (cur ? ' aria-current="true"' : "") + ">" +
          '<span class="av-me" aria-hidden="true">' + (MUNDO[t.id] || "📘") + "</span><small>" + (t.id === "pp" ? "Inicio" : "Mundo " + i) + "</small><b>" + esc(t.label) + "</b>" +
          '<span class="av-mb"><i style="width:' + Math.max(x.pct, x.d ? 4 : 0) + '%"></i></span><em>' + x.d + "/" + x.n + "</em></button>";
      }).join("") + "</div></section>";
    /* orden del Inicio: saludo → «Primeros pasos» (si aplica) → curso actual → mapa → plan de hoy → misiones → lo demás */
    var greet = main.querySelector(".greet"), inv = main.querySelector(".pp-inv"), curso = main.querySelector(".m-course");
    if (curso && inv) curso.insertAdjacentElement("beforebegin", inv);
    else if (greet && inv) greet.insertAdjacentElement("afterend", inv);
    var ancla = curso || inv || greet;
    if (ancla) ancla.insertAdjacentHTML("afterend", html); else main.insertAdjacentHTML("afterbegin", html);
    var c = main.querySelector(".av-mu.cur"); if (c) { var s = c.parentNode; s.scrollLeft = c.offsetLeft - 16; }
  };
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-av-mundo]"); if (!b) return;
    ev.preventDefault();
    track = b.dataset.avMundo; try { localStorage.setItem("cr-track", track); } catch (x) {}
    view = "lecciones"; render(); scrollTo(0, 0);
  });

  /* ---------------- navegación: Inicio · Aprender · Jugar · Ranking · Perfil ---------------- */
  var SVG = {
    jugar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.5 7h9a5 5 0 0 1 4.9 6l-.8 3.6a2.4 2.4 0 0 1-4.2 1L15 16H9l-1.4 1.6a2.4 2.4 0 0 1-4.2-1L2.6 13A5 5 0 0 1 7.5 7Zm0 3v1.3H6.2v1.4h1.3V14h1.4v-1.3h1.3v-1.4H8.9V10Zm8.3.4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-1.9 1.9a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>',
    ranking: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V17h3v4H8v-4h3v-2.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3V3Zm0 4H6v1a2 2 0 0 0 1 1.7V7Zm10 0v2.7A2 2 0 0 0 18 8V7h-1Z"/></svg>'
  };
  var TABS = [["parcours", "Inicio"], ["lecciones", "Aprender"], ["retos", "Jugar"], ["ranking", "Ranking"], ["perfil", "Perfil"]];
  var _nav = typeof renderNav === "function" ? renderNav : null;
  if (_nav) {
    renderNav = function(){
      var r = _nav.apply(this, arguments);
      try {
        var cur = { dictee: "retos", carnet: "retos", atelier: "retos", journal: "retos" }[view] || view;
        ["#nav", "#tabbar"].forEach(function(sel){
          var box = document.querySelector(sel); if (!box) return;
          var viejos = {}; box.querySelectorAll("button[data-view]").forEach(function(b){ viejos[b.dataset.view] = b; });
          if (!viejos.parcours) return;   /* otra barra (panel docente): no se toca */
          box.innerHTML = TABS.map(function(t){
            var v = viejos[t[0]], ic = SVG[t[0] === "retos" ? "jugar" : t[0]] || (v && v.querySelector("svg") ? v.querySelector("svg").outerHTML : "");
            var attr = t[0] === "ranking" ? 'data-av-rank="1"' : 'data-view="' + t[0] + '"' + (cur === t[0] ? ' aria-current="page"' : "");
            return '<button ' + attr + ' class="px-navbtn">' + ic + '<span class="label">' + t[1] + "</span></button>";
          }).join("");
        });
      } catch (e) {}
      return r;
    };
  }
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-av-rank]"); if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    if (window.PLX_RANKING) { window.PLX_RANKING(); return; }   /* 2.3: pantalla propia del ranking (plx60) */
    var logged = false; try { logged = !!(CLOUD && window.PCB && PCB.uid); } catch (x) {}
    if (logged && window.PCB && typeof PCB.rankings === "function") { PCB.rankings(); return; }
    if (view !== "parcours") { view = "parcours"; render(); }
    setTimeout(function(){
      var w = document.querySelector("#view .rkw, #view [class*=rkw]");
      if (w) w.scrollIntoView({ behavior: "smooth", block: "center" });
      try { toast("Entra con tu cuenta para ver los rankings Unipamplona y Global"); } catch (x) {}
    }, 80);
  }, true);

  /* ---------------- barra superior: nivel con su avance ---------------- */
  var _stats = typeof renderStats === "function" ? renderStats : null;
  if (_stats && typeof catLevel === "function" && typeof xpFor === "function") {
    renderStats = function(){
      var r = _stats.apply(this, arguments);
      try {
        var box = document.getElementById("stats"); if (!box || box.querySelector(".av-lv")) return r;
        var lv = catLevel(S.xp), a = xpFor(lv), b = xpFor(lv + 1), p = b > a ? Math.round((S.xp - a) / (b - a) * 100) : 100;
        box.insertAdjacentHTML("afterbegin", '<button class="gpill av-lv" data-view="perfil" title="Nivel ' + lv + " · " + (b - S.xp) + ' XP para el siguiente" aria-label="Nivel ' + lv + '"><span class="av-ring" style="--p:' + p + '"><b>' + lv + "</b></span><span class=\"av-lt\">" + S.xp.toLocaleString("es-CO") + " XP</span></button>");
      } catch (e) {}
      return r;
    };
  }

  /* ---------------- títulos comunes y el Arcade arriba en Jugar ---------------- */
  var ordenaJugar = function(){
    if (view !== "retos") return;
    var sec = document.querySelector("#view .gretos"); if (!sec || sec.dataset.av) return;
    sec.dataset.av = "1";
    var h1 = sec.querySelector("h1"); if (h1 && /^\s*Retos\s*$/.test(h1.textContent)) h1.textContent = "Jugar";
    if (h1 && !sec.querySelector(".av-sub")) h1.insertAdjacentHTML("afterend", '<p class="av-sub">Juega libre con cualquier curso o unidad. Todo lo que ganas aquí suma a tu nivel, tu racha y el ranking.</p>');
  };

  /* ---------------- Perfil: todo el avance en un solo resumen ---------------- */
  var resumen = function(){
    if (view !== "perfil") return;
    var head = document.querySelector("#view .prof-head"); if (!head || document.querySelector("#view .av-prog")) return;
    var hechas = LESSONS.filter(function(l){ return hecha(l.id); }).length, adv = ADV(), aventuras = 0, cofres = 0;
    Object.keys(adv).forEach(function(k){ if (adv[k].cofre) cofres++; if (adv[k].j) aventuras++; });
    var lv = catLevel(S.xp), a = xpFor(lv), b = xpFor(lv + 1), pct = b > a ? Math.round((S.xp - a) / (b - a) * 100) : 100, rach = 0;
    try { rach = streak(); } catch (e) {}
    var t = function(n, l, ic){ return '<div><i aria-hidden="true">' + ic + "</i><b>" + n + "</b><span>" + l + "</span></div>"; };
    head.insertAdjacentHTML("afterend", '<section class="gcard av-prog" aria-label="Tu progreso"><div class="av-ph"><span class="av-ring big" style="--p:' + pct + '"><b>' + lv + '</b></span><div><small>Tu progreso</small><b>Nivel ' + lv + " · " + S.xp.toLocaleString("es-CO") + " XP</b><span>" + Math.max(0, b - S.xp) + " XP para el nivel " + (lv + 1) + "</span></div></div>" +
      '<div class="av-pg">' + t(hechas, "lecciones", "📚") + t(aventuras, "mini-juegos en lecciones", "🎮") + t(cofres, "cofres abiertos", "🎁") + t(rach, "días de racha", "🔥") + "</div></section>");
  };

  var _render = render;
  render = function(){
    var r = _render.apply(this, arguments);
    try { mapa(); } catch (e) {}
    try { if (view === "lecciones") marcaFilas(); } catch (e) {}
    try { ordenaJugar(); } catch (e) {}
    try { resumen(); } catch (e) {}
    return r;
  };
  /* las filas de lecciones se pintan cuando se abre una unidad */
  document.addEventListener("click", function(ev){ if (ev.target.closest && ev.target.closest("[data-lxu]")) setTimeout(marcaFilas, 30); });

  var st = document.createElement("style"); st.id = "plx55";
  st.textContent = `
  /* ruta de la aventura */
  .av-ruta{list-style:none;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:14px 0 6px;padding:0;counter-reset:av}
  .av-ruta li{position:relative;display:grid;justify-items:center;gap:4px;text-align:center;font:700 .68rem/1.2 Inter,system-ui,sans-serif;color:var(--stone,#5B6B8C)}
  .av-ruta li::before{content:"";position:absolute;top:17px;left:-50%;width:100%;height:3px;background:var(--line,#DDE3EE);z-index:0}
  .av-ruta li:first-child::before{display:none}
  .av-ruta li.ok::before,.av-ruta li.cur::before{background:#1E5BD7}
  .av-ruta i{position:relative;z-index:1;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:1rem;background:var(--raise,#fff);box-shadow:inset 0 0 0 2px var(--line,#DDE3EE)}
  .av-ruta li.ok i{background:#1E5BD7;color:#fff;box-shadow:none;font-weight:900}
  .av-ruta li.cur i{box-shadow:inset 0 0 0 3px #FFD200,0 0 0 4px rgba(255,210,0,.25)}
  .av-ruta li.cur span{color:var(--ink)}
  /* final de la lección */
  .av-fin{margin:18px 0 8px;display:grid;gap:10px}
  /* «Jugar el repaso» (plx46) queda dentro de la aventura: se oculta, no se quita (plx46 lo volvería a poner) */
  .av-fin~.plx-endx .plx46-rep,#player:has(.av-fin) .plx46-rep{display:none!important}
  .av-fin h3{margin:0;font:800 1.15rem/1.2 Poppins,system-ui,sans-serif;color:var(--ink)}
  .av-fin .av-ruta{margin:0 0 4px}
  .av-paso,.av-cofre{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:40px 1fr auto;gap:12px;align-items:center;width:100%;padding:14px 14px 14px 12px;border-radius:20px;color:#fff;
    background:linear-gradient(135deg,#0B2D74,#1E5BD7);box-shadow:0 14px 28px -18px rgba(11,45,116,.9),inset 0 0 0 1px rgba(255,255,255,.12)}
  .av-paso{border-left:6px solid var(--ac,#FFD200)}
  .av-paso:hover,.av-cofre.listo:hover{transform:translateY(-1px)}
  .av-paso:focus-visible,.av-cofre:focus-visible,.av-mu:focus-visible,.av-lv:focus-visible{outline:3px solid #FFD200;outline-offset:3px}
  .av-n{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;font:900 1.05rem/1 Poppins,system-ui,sans-serif;background:rgba(255,255,255,.14);color:#FFD200}
  .av-paso.ok .av-n,.av-cofre.abierto .av-n{background:#FFD200;color:#0B2D74}
  .av-tx{display:grid;gap:2px;min-width:0}
  .av-tx small{font:800 .66rem/1.3 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#FFD200}
  .av-tx b{font:800 1.05rem/1.2 Poppins,system-ui,sans-serif}
  .av-tx span{font-size:.84rem;color:#DCE6FF}
  .av-go{padding:8px 14px;border-radius:999px;background:#FFD200;color:#0B2D74;font:800 .85rem/1 Inter,system-ui,sans-serif}
  .av-paso.ok .av-go{background:rgba(255,255,255,.16);color:#fff}
  .av-cofre{grid-template-columns:40px auto 1fr;background:var(--raise,#fff);color:var(--ink);box-shadow:inset 0 0 0 2px var(--line,#DDE3EE)}
  .av-cofre .av-n{background:var(--surf3,#EEF1F7);color:var(--stone,#5B6B8C)}
  .av-cofre .av-tx small{color:var(--stone,#5B6B8C)}.av-cofre .av-tx span{color:var(--stone,#5B6B8C)}
  .av-cofre[disabled]{cursor:default;opacity:.85}
  .av-c{font-size:2rem;line-height:1;filter:grayscale(.6)}
  .av-cofre.listo{background:linear-gradient(135deg,#FFD200,#FFB400);color:#0B2D74;box-shadow:0 14px 30px -16px rgba(255,180,0,.9);animation:avLate 1.6s ease-in-out infinite}
  .av-cofre.listo .av-c,.av-cofre.abierto .av-c{filter:none}
  .av-cofre.listo .av-tx small,.av-cofre.listo .av-tx span{color:#0B2D74}
  .av-cofre.abierto{box-shadow:inset 0 0 0 2px #FFD200}
  .av-cofre.abre .av-c{animation:avAbre .6s ease both}
  @keyframes avLate{50%{transform:scale(1.02)}}
  @keyframes avAbre{40%{transform:scale(1.5) rotate(-12deg)}100%{transform:scale(1)}}
  /* puntos del recorrido en la lista */
  .av-dots{display:flex;align-items:center;gap:3px;margin:2px 0}
  .av-dots i{width:14px;height:5px;border-radius:9px;background:var(--line,#DDE3EE)}
  .av-dots i.ok{background:#1E5BD7}
  .av-dots em{font-style:normal;font-size:.8rem;margin-left:4px}
  /* mapa de mundos */
  .av-mapa{margin:16px 0}
  #view .gmain>.pp-inv{margin:14px 0}
  .av-mh{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:0 2px 8px}
  .av-mh h2{margin:0;font:800 1.2rem/1.2 Poppins,system-ui,sans-serif;color:var(--ink)}
  .av-mh span{font-size:.8rem;color:var(--stone,#5B6B8C)}
  .av-ms{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 10px;scrollbar-width:none}
  .av-ms::-webkit-scrollbar{display:none}
  .av-mu{all:unset;box-sizing:border-box;cursor:pointer;scroll-snap-align:start;flex:0 0 132px;display:grid;gap:4px;padding:12px;border-radius:20px;background:var(--raise,#fff);box-shadow:inset 0 0 0 1px var(--line,#DDE3EE),0 10px 22px -18px rgba(11,45,116,.6)}
  .av-mu.cur{background:linear-gradient(160deg,#0B2D74,#1E5BD7);color:#fff;box-shadow:0 14px 26px -16px rgba(11,45,116,.9)}
  .av-me{font-size:1.7rem;line-height:1}
  .av-mu small{font:800 .64rem/1.2 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--stone,#5B6B8C)}
  .av-mu.cur small{color:#FFD200}
  .av-mu b{font:800 .9rem/1.2 Poppins,system-ui,sans-serif;color:inherit;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.4em}
  .av-mu:not(.cur) b{color:var(--ink)}
  .av-mb{display:block;height:6px;border-radius:9px;background:var(--line,#E6EBF5)}
  .av-mu.cur .av-mb{background:rgba(255,255,255,.22)}
  .av-mb i{display:block;height:100%;border-radius:9px;background:#FFD200}
  .av-mu:not(.cur) .av-mb i{background:#1E5BD7}
  .av-mu em{font:700 .72rem/1 Inter,system-ui,sans-serif;font-style:normal;color:var(--stone,#5B6B8C)}
  .av-mu.cur em{color:#DCE6FF}
  .av-mu.ok:not(.cur){box-shadow:inset 0 0 0 2px #FFD200}
  /* nivel en la barra superior */
  .av-lv{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex!important;align-items:center;gap:6px;padding:3px 10px 3px 3px!important}
  .av-ring{--p:0;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#FFD200 calc(var(--p)*1%),rgba(255,255,255,.22) 0)}
  .av-ring b{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#0B2D74;color:#fff;font:800 .72rem/1 Inter,system-ui,sans-serif}
  .av-lt{font:700 .78rem/1 Inter,system-ui,sans-serif;color:#fff}
  .av-lt{display:none}.av-lv{padding:3px!important}
  @media (min-width:861px){#stats .av-lt{display:inline}#stats .av-lv{padding:3px 10px 3px 3px!important}#stats .av-lv~.gpill.hide-xs{display:none!important}}
  @media (min-width:861px) and (max-width:1440px){html body header#topbar nav#nav button.px-navbtn{padding:8px 8px!important;gap:5px!important;font-size:.84rem!important}html body header#topbar nav#nav button.px-navbtn svg{width:17px!important;height:17px!important}}
  @media (min-width:861px) and (max-width:1230px){html body header#topbar nav#nav button.px-navbtn .label{display:none}}
  .av-prog{display:grid;gap:14px;padding:16px!important}
  .av-ph{display:flex;align-items:center;gap:14px}
  .av-ph>div{display:grid;gap:2px}
  .av-ph small{font:800 .66rem/1.3 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--stone,#5B6B8C)}
  .av-ph b{font:800 1.1rem/1.2 Poppins,system-ui,sans-serif;color:var(--ink)}
  .av-ph span{font-size:.85rem;color:var(--stone,#5B6B8C)}
  .av-ring.big{width:58px;height:58px;flex:none;background:conic-gradient(#1E5BD7 calc(var(--p)*1%),var(--line,#E6EBF5) 0)}
  .av-ring.big b{width:46px;height:46px;font-size:1.2rem}
  .av-pg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .av-pg div{display:grid;justify-items:center;gap:2px;padding:10px 4px;border-radius:14px;background:var(--surf2,#F4F6FB);text-align:center}
  .av-pg i{font-style:normal;font-size:1.2rem}
  .av-pg b{font:800 1.15rem/1 Poppins,system-ui,sans-serif;color:var(--ink)}
  .av-pg span{font-size:.7rem;line-height:1.2;color:var(--stone,#5B6B8C)}
  .av-sub{margin:-4px 0 16px;color:var(--stone,#5B6B8C);line-height:1.5}
  /* 5 pestañas: etiquetas más compactas */
  #tabbar .px-navbtn .label,#tabbar button .label{font-size:.72rem}
  @media (prefers-reduced-motion:reduce){.av-cofre.listo,.av-cofre.abre .av-c{animation:none}}
  `;
  document.head.appendChild(st);
  try { renderNav(); renderStats(); render(); } catch (e) {}
})();
