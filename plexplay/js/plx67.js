/* PLEX PLAY 2.9.3 · Tu ruta en cada curso
   - «Continúa aquí»: la siguiente lección pendiente (respeta el resultado de la prueba de ubicación).
   - Prueba de ubicación del curso: 2 preguntas por sección → recomienda en qué sección empezar.
   - Simulacro de examen: 30 preguntas del curso repartidas en 4 competencias, sin segunda oportunidad,
     con nota por competencia y un veredicto (modo «blanc» de la app: temporizador y balance incluidos).
   Se engancha a render() y finish() como los demás módulos; no cambia los datos de las lecciones. */
(function(){
  if (typeof start !== "function" || typeof finish !== "function" || typeof render !== "function") return;
  var esc = function(x){ return String(x == null ? "" : x).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var mezcla = function(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var lsG = function(k, d){ try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  var lsS = function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  var COMP = { oral: "Comprensión oral", gram: "Gramática y corrección", lex: "Léxico y comprensión", frase: "Construcción de frases" };
  var CUOTA = { oral: 6, gram: 9, lex: 9, frase: 6 };
  var comp = function(it){ if (it.k === "listen" || it.say) return "oral"; if (it.k === "fill" || it.k === "spot") return "gram"; if (it.k === "order") return "frase"; return "lex"; };

  var trackDe = function(tid){ return (typeof TRACKS !== "undefined" ? TRACKS : []).find(function(t){ return t.id === tid; }); };
  var secciones = function(tid){ var tr = trackDe(tid); return tr && tr.course ? tr.course : []; };
  var leccionesDe = function(tid){ return LESSONS.filter(function(l){ return l.track === tid && !l.special; }); };
  var hecho = function(l){ return S.lessons[l.id] && S.lessons[l.id].done; };

  /* ítems propios de la lección (no los generados): lo que el curso enseña de verdad */
  var itemsCurso = function(tid){
    var out = [];
    leccionesDe(tid).forEach(function(l){ (l.items || []).forEach(function(it, i){ var k = l.id + ":" + i; if (ITEMS[k]) out.push({ key: k, it: it, l: l }); }); });
    return out;
  };

  /* ---------- «Continúa aquí» ---------- */
  var claveRuta = function(tid){ return "plx-ruta-" + tid; };
  var siguiente = function(tid){
    var ls = leccionesDe(tid), r = lsG(claveRuta(tid), null), secs = secciones(tid);
    if (r && r.sec != null && secs[r.sec]) {
      var ids = {}; secs.slice(r.sec).forEach(function(s){ s.units.forEach(function(u){ u.lessons.forEach(function(l){ ids[l.id] = 1; }); }); });
      var x = ls.find(function(l){ return ids[l.id] && !hecho(l); });
      if (x) return x;
    }
    return ls.find(function(l){ return !hecho(l); }) || null;
  };

  /* ---------- prueba de ubicación ---------- */
  var ubicacion = function(tid){
    var pool = itemsCurso(tid).filter(function(o){ return o.it.k === "choice" || o.it.k === "fill"; }), steps = [];
    secciones(tid).forEach(function(s, si){
      var ids = {}; s.units.forEach(function(u){ u.lessons.forEach(function(l){ ids[l.id] = 1; }); });
      mezcla(pool.filter(function(o){ return ids[o.l.id]; })).slice(0, 2).forEach(function(o){ steps.push({ kind: "item", key: o.key, sec: si }); });
    });
    if (!steps.length) return;
    start({ mode: "blanc", title: "Prueba de ubicación", eyebrow: "Prueba de ubicación · 2 preguntas por sección · responde lo que sepas",
      lesson: { id: tid + "-ubica", track: tid, special: "ubica", title: "Prueba de ubicación" }, steps: steps });
  };

  /* ---------- simulacro ---------- */
  var simulacro = function(tid){
    var pool = mezcla(itemsCurso(tid)), porComp = { oral: [], gram: [], lex: [], frase: [] }, usadas = {}, steps = [];
    pool.forEach(function(o){ porComp[comp(o.it)].push(o); });
    Object.keys(CUOTA).forEach(function(c){
      /* repartir entre lecciones distintas: una por lección antes de repetir */
      var lista = porComp[c], toma = [], vistas = {};
      lista.forEach(function(o){ if (toma.length < CUOTA[c] && !vistas[o.l.id]) { vistas[o.l.id] = 1; toma.push(o); } });
      lista.forEach(function(o){ if (toma.length < CUOTA[c] && toma.indexOf(o) < 0) toma.push(o); });
      toma.forEach(function(o){ if (!usadas[o.key]) { usadas[o.key] = 1; steps.push({ kind: "item", key: o.key, comp: c }); } });
    });
    if (!steps.length) return;
    var orden = ["oral", "lex", "gram", "frase"];
    steps.sort(function(a, b){ return orden.indexOf(a.comp) - orden.indexOf(b.comp); });
    start({ mode: "blanc", title: "Simulacro de examen", eyebrow: "Simulacro · " + steps.length + " preguntas · sin segunda oportunidad",
      lesson: { id: tid + "-simu", track: tid, special: "simu", title: "Simulacro de examen" }, steps: steps });
  };

  /* ---------- resultados ---------- */
  var ok = function(i){ return P.res && P.res[i] && P.res[i].ok; };
  var bloqueSimu = function(){
    var t = {}; P.steps.forEach(function(s, i){ if (!s.comp) return; var b = t[s.comp] || (t[s.comp] = { n: 0, ok: 0 }); b.n++; if (ok(i)) b.ok++; });
    var n = 0, k = 0; Object.keys(t).forEach(function(c){ n += t[c].n; k += t[c].ok; });
    var nota = n ? Math.round(k / n * 100) : 0, flojas = Object.keys(t).filter(function(c){ return t[c].ok / t[c].n < .5; });
    var ver = nota >= 80 ? ["✅", "Nivel del curso alcanzado", "Estás listo para pasar al siguiente curso o para presentar el examen."]
      : nota >= 50 ? ["🟡", "Aprobado justo", "Refuerza las competencias más débiles antes del examen oficial."]
      : ["🔴", "Todavía no", "Repasa las lecciones del curso y vuelve a intentarlo: el simulacro cambia cada vez."];
    lsS("plx-simu-" + P.lesson.track, { best: Math.max(nota, (lsG("plx-simu-" + P.lesson.track, {}) || {}).best || 0), last: nota });
    return '<div class="plx-veredicto"><p class="plx-v-t">' + ver[0] + " <b>" + esc(ver[1]) + "</b> · nota " + nota + "/100</p><p>" + esc(ver[2]) + "</p>" +
      '<table class="tbl"><thead><tr><th>Competencia</th><th class="n">Aciertos</th></tr></thead><tbody>' +
      Object.keys(COMP).filter(function(c){ return t[c]; }).map(function(c){ return "<tr><td>" + esc(COMP[c]) + "</td><td class=\"n\">" + t[c].ok + "/" + t[c].n + "</td></tr>"; }).join("") +
      "</tbody></table>" + (flojas.length ? "<p>Para practicar: <b>" + flojas.map(function(c){ return esc(COMP[c]); }).join(", ") + "</b>. El carnet guarda tus errores para el repaso.</p>" : "") + "</div>";
  };
  var bloqueUbica = function(){
    var secs = secciones(P.lesson.track), t = {};
    P.steps.forEach(function(s, i){ if (s.sec == null) return; var b = t[s.sec] || (t[s.sec] = { n: 0, ok: 0 }); b.n++; if (ok(i)) b.ok++; });
    var idx = Object.keys(t).map(Number).sort(function(a, b){ return a - b; }), ini = idx.find(function(i){ return t[i].ok < t[i].n; });
    if (ini == null) ini = idx.length ? idx[idx.length - 1] : 0;
    lsS(claveRuta(P.lesson.track), { sec: ini, at: Date.now() });
    var s = secs[ini] || {}, sig = siguiente(P.lesson.track);
    return '<div class="plx-veredicto"><p class="plx-v-t">🧭 <b>Empieza en la sección ' + (ini + 1) + "</b> · " + esc(s.title || "") + "</p>" +
      "<p>Dominas lo anterior (dos aciertos por sección). Las lecciones previas siguen abiertas por si quieres repasarlas.</p>" +
      (sig ? '<p><button class="btn" data-open="' + esc(sig.id) + '">Empezar · ' + esc(sig.title) + "</button></p>" : "") + "</div>";
  };
  var _finish = finish;
  finish = function(){
    var esp = P && P.lesson && P.lesson.special, html = "";
    try { if (esp === "simu") html = bloqueSimu(); else if (esp === "ubica") html = bloqueUbica(); } catch (e) { html = ""; }
    var r = _finish.apply(this, arguments);
    if (html) try { var kv = document.querySelector("#player .pxr-stats") || document.querySelector("#player .pbody .kv"); if (kv) kv.insertAdjacentHTML("afterend", html); } catch (e) {}
    return r;
  };

  /* ---------- la tarjeta en la vista del curso ---------- */
  var tarjeta = function(){
    if (typeof view === "undefined" || view !== "lecciones" || typeof track !== "string") return;
    var hero = document.querySelector(".lx-hero"); if (!hero || document.querySelector(".plx-ruta")) return;
    var tid = track, sig = siguiente(tid), simu = lsG("plx-simu-" + tid, null), r = lsG(claveRuta(tid), null), secs = secciones(tid);
    var hechas = leccionesDe(tid).filter(hecho).length, total = leccionesDe(tid).length;
    var h = '<section class="plx-ruta"><p class="plx-r-t">Tu ruta · ' + hechas + "/" + total + " lecciones</p>" +
      (sig ? '<button class="btn" data-open="' + esc(sig.id) + '">▶ Continúa aquí · ' + esc(sig.title) + "</button>" : '<p>🎉 Completaste todas las lecciones del curso.</p>') +
      '<div class="plx-r-b"><button class="btn line" data-plxruta="ubica">🧭 Prueba de ubicación</button>' +
      '<button class="btn line" data-plxruta="simu">📝 Simulacro de examen</button></div>' +
      '<p class="plx-r-n">' + (r && secs[r.sec] ? "Ubicación: empiezas en la sección " + (r.sec + 1) + ". " : "¿Ya sabes algo? La prueba te dice por dónde empezar. ") +
      (simu ? "Simulacro: mejor nota " + simu.best + "/100." : "Simulacro: 30 preguntas de todo el curso.") + "</p></section>";
    hero.insertAdjacentHTML("afterend", h);
  };
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-plxruta]"); if (!b || typeof track !== "string") return;
    if (b.dataset.plxruta === "ubica") ubicacion(track); else simulacro(track);
  });
  var _render = render;
  render = function(){ var x = _render.apply(this, arguments); try { tarjeta(); } catch (e) {} return x; };

  var css = document.createElement("style");
  css.textContent = ".plx-ruta{margin:16px 0;padding:16px;border-radius:20px;background:var(--surface,#fff);border:1px solid rgba(0,0,0,.08);box-shadow:0 6px 18px rgba(0,0,0,.06);display:grid;gap:10px}" +
    ".plx-ruta .btn{width:100%;justify-content:center;white-space:normal;text-align:center}.plx-r-t{margin:0;font-weight:800;font-size:15px}" +
    ".plx-r-b{display:grid;grid-template-columns:1fr 1fr;gap:8px}.plx-r-n{margin:0;font-size:13px;opacity:.75}" +
    "@media (max-width:380px){.plx-r-b{grid-template-columns:1fr}}" +
    ".plx-veredicto{margin:14px 0;padding:14px;border-radius:16px;background:var(--wash,rgba(0,0,0,.04))}.plx-veredicto p{margin:6px 0}.plx-v-t{font-size:17px}";
  document.head.appendChild(css);

  window.PLXRuta = { siguiente: siguiente, ubicacion: ubicacion, simulacro: simulacro };
})();
