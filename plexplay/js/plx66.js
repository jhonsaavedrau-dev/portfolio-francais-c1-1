/* PLEX PLAY 2.8.0 — Más lecciones: todos los cursos con la misma cantidad (67)
   - Las lecciones nuevas viven en mas/<curso>.js, una por curso, y se cargan en segundo plano (primero el curso
     actual), así el arranque no se hace más pesado. Al llegar, se suman al final de su curso en secciones nuevas,
     con numeración seguida, y la pantalla que se está viendo se vuelve a pintar.
   - Cada lección trae su teoría (con el formato de siempre) y su explicación sencilla (idea, pasos, ejemplos,
     error frecuente), y ejercicios de todos los tipos. Los juegos las usan igual que las demás lecciones: más
     lecciones = más retos en cada juego.
   - PLXM: funciones cortas para escribir el contenido (C elegir, F completar, M unir, S clasificar, P encontrar el
     error, O ordenar, D dictado, A escuchar y elegir). */
(function(){
  "use strict";
  var M = window.PLXM = window.PLXM || {};
  var esc = function(x){ return String(x == null ? "" : x).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var plano = function(x){ return String(x == null ? "" : x).replace(/<[^>]*>/g, ""); };

  /* ---------------- ejercicios ---------------- */
  var con = function(x, ctx){ if (ctx) x.ctx = ctx; return x; };
  M.C = function(ask, q, o, a, why, ctx){ return con({ k: "choice", ask: ask, q: q, o: o, a: a, why: why }, ctx); };
  M.A = function(ask, say, q, o, a, why){ return { k: "choice", ask: ask, say: say, q: q, o: o, a: a, why: why }; };
  M.F = function(ask, q, acc, why, ctx){ return con({ k: "fill", ask: ask, q: q, acc: Array.isArray(acc) ? acc : [acc], why: why }, ctx); };
  M.M = function(ask, q, pairs, why){ return { k: "match", ask: ask, q: q, pairs: pairs, why: why }; };
  M.S = function(ask, q, cats, items, why){ return { k: "sort", ask: ask, q: q, cats: cats, items: items, why: why }; };
  M.P = function(ask, s, fix, why, ctx){ return con({ k: "spot", ask: ask, s: s, fix: fix, why: why }, ctx); };
  M.O = function(ask, tokens, why, ctx){ return con({ k: "order", ask: ask, tokens: tokens, why: why }, ctx); };
  M.D = function(say, why){
    return { k: "listen", say: say, acc: [say], num: false, dict: true, ask: "Escucha la frase y escríbela completa. Puedes oírla despacio.",
      why: why || "Dictado: la frase era <b>" + esc(say) + "</b>. Revisa los acentos, las letras que no se pronuncian y las concordancias." };
  };

  /* ---------------- teoría y explicación sencilla, desde un mismo objeto ----------------
     { idea, para, regla: [..], tabla: [[cabeceras], [[fila], ...]], ej: [[fr, es], ...], ojo: [mal, bien, nota] } */
  var teoria = function(o){
    var h = "";
    if (o.ojo) h += '<div class="relv"><p>Error frecuente: <span class="rel">' + o.ojo[0] + "</span>. Lo correcto es <b>" + o.ojo[1] + "</b>." + (o.ojo[2] ? " " + o.ojo[2] : "") + "</p></div>";
    h += "<p><b>Para qué sirve</b></p><p>" + (o.para || o.idea) + "</p>";
    if (o.regla && o.regla.length) h += "<p><b>La regla</b></p>" + o.regla.map(function(r, i){ return "<p><b>" + (i + 1) + ".</b> " + r + "</p>"; }).join("");
    if (o.tabla) h += '<div class="tw"><table><tr>' + o.tabla[0].map(function(c){ return "<th>" + c + "</th>"; }).join("") + "</tr>" +
      o.tabla[1].map(function(f){ return "<tr>" + f.map(function(c){ return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</table></div>";
    if (o.ej && o.ej.length) h += "<p><b>Ejemplos</b></p>" + o.ej.map(function(e){ return '<p><i lang="fr">' + e[0] + "</i> — " + e[1] + "</p>"; }).join("");
    return h;
  };
  var explica = function(o){
    return { idea: plano(o.idea || o.para), pasos: (o.regla || []).map(plano).slice(0, 4), ej: (o.ej || []).slice(0, 6).map(function(e){ return [plano(e[0]), plano(e[1])]; }),
      ojo: o.ojo ? [plano(o.ojo[0]), plano(o.ojo[1]), plano(o.ojo[2] || "")] : undefined };
  };
  M.L = function(id, title, t, T, items){
    var l = { id: id, title: title, t: t, theory: teoria(T), items: items };
    try { window.__EXPLICA = window.__EXPLICA || {}; if (!window.__EXPLICA[id]) window.__EXPLICA[id] = explica(T); } catch (e) {}
    return l;
  };
  M.U = function(title, lessons){ return { title: title, lessons: lessons }; };
  M.Sec = function(id, title, sub, units){ return { id: id, title: title, sub: sub || "", units: units }; };
  M.curso = function(track, secciones){ (window.__MAS = window.__MAS || {})[track] = secciones; if (M.registra) M.registra(track); };

  /* ---------------- registro en la app ---------------- */
  if (typeof TRACKS === "undefined" || typeof LESSONS === "undefined" || typeof ITEMS === "undefined") return;
  var V = window.PLX_MAS_V || {}, hechos = {};
  var repinta = 0;
  var pinta = function(){
    if (repinta) return;
    repinta = setTimeout(function(){
      repinta = 0;
      try { if (window.PLXG && PLXG.olvidaCuentas) PLXG.olvidaCuentas(); if (window.PLXG && PLXG.arcadeOlvida) PLXG.arcadeOlvida(); } catch (e) {}
      try {
        var enJuego = document.documentElement.classList.contains("plxg-on"), enLeccion = typeof P !== "undefined" && P;
        if (!enJuego && !enLeccion && typeof render === "function" && /^(parcours|lecciones|retos|perfil)$/.test(typeof view === "string" ? view : "")) render();
      } catch (e) {}
    }, 120);
  };
  M.registra = function(tid){
    var secs = window.__MAS && window.__MAS[tid]; if (!secs || hechos[tid]) return;
    var tr = TRACKS.find(function(t){ return t.id === tid; }); if (!tr) return;
    hechos[tid] = 1;
    var previas = LESSONS.filter(function(l){ return l.track === tid; }), n = previas.length;
    var pos = previas.length ? LESSONS.indexOf(previas[previas.length - 1]) + 1 : LESSONS.length, nuevas = [];
    secs.forEach(function(s){
      tr.course.push(s);
      s.units.forEach(function(u){ u.lessons.forEach(function(l){
        if (ITEMS[l.id + ":0"]) return;   /* id repetido: no pisa una lección que ya existe */
        l.track = tid; l.sec = s.id; l.unit = u.title; l.n = String(++n).padStart(2, "0"); nuevas.push(l);
        l.items.forEach(function(it, i){ it.t = it.t || l.t; ITEMS[l.id + ":" + i] = { it: it, l: l }; });
      }); });
    });
    LESSONS.splice.apply(LESSONS, [pos, 0].concat(nuevas));
    /* 2.9.1: extra generados (explicación y vocabulario) también para las lecciones nuevas */
    try { if (window.PLXG && PLXG.extraLecciones) PLXG.extraLecciones(tid); } catch (e) {}
    pinta();
  };

  /* carga en segundo plano: primero el curso que el estudiante tiene abierto */
  var carga = function(tid){ return new Promise(function(res){ var s = document.createElement("script"); s.src = "mas/" + tid + ".js?v=" + (V[tid] || "1"); s.async = true; s.onload = s.onerror = function(){ res(); }; document.head.appendChild(s); }); };
  var cola = function(){
    var ids = Object.keys(V); if (!ids.length) return;
    var actual = typeof track === "string" ? track : null;
    ids.sort(function(a, b){ return (b === actual) - (a === actual); });
    var sig = function(){ var t = ids.shift(); if (!t) return; carga(t).then(function(){ (window.requestIdleCallback || function(f){ setTimeout(f, 60); })(sig, { timeout: 1200 }); }); };
    sig();
  };
  /* M.cargaYa(tid): para cuando hace falta ya (por ejemplo, al abrir un curso antes de que termine la carga) */
  M.cargaYa = function(tid){ return hechos[tid] || !V[tid] ? Promise.resolve() : carga(tid); };
  if ("requestIdleCallback" in window) requestIdleCallback(cola, { timeout: 2500 }); else setTimeout(cola, 1200);
})();
