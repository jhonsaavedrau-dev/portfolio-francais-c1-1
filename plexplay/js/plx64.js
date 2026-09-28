/* PLEX PLAY 2.5.0 — Más orden
   Inicio
   - Tres bloques y nada repetido: arriba «Continuar» (tu curso), luego «Hoy» (plan del día, misiones y meta),
     «Tu mapa» y «Para ti» (prueba de nivel, diagnóstico y profesores).
   - Se ocultan las tarjetas que ya viven en otra pestaña: PLEX 1V1 y Retos rápidos (Jugar), mascota y avance
     (Perfil), clasificación (Ranking) y «Lección actual» (es lo mismo que «Continuar»).
   - PC: la columna lateral queda para meta diaria, racha y liga. Móvil: una sola columna, la meta dentro de «Hoy».
   Jugar
   - Pestañas Juegos · Practicar · Aprender: se ve una sección a la vez (se recuerda la última elegida).
   - La práctica vuelve a agruparse: Repasa, Habilidades y Ponte a prueba.
   Solo se mueven los elementos que ya pintan las pantallas: sus botones siguen funcionando igual. */
(function(){
  "use strict";
  var q = function(s, r){ return (r || document).querySelector(s); };
  var qa = function(s, r){ return [].slice.call((r || document).querySelectorAll(s)); };
  var lee = function(k, d){ try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  var guarda = function(k, v){ try { localStorage.setItem(k, v); } catch (e) {} };

  /* ======================= Inicio ======================= */
  var seccion = function(main, cls, titulo, sub){
    var s = q("." + cls, main);
    if (!s) {
      s = document.createElement("section"); s.className = "ix-sec " + cls;
      s.innerHTML = '<div class="ix-h"><h2>' + titulo + "</h2>" + (sub ? "<small>" + sub + "</small>" : "") + '</div><div class="ix-body"></div>';
    }
    return s;
  };
  var ordenaInicio = function(){
    if (typeof view === "undefined" || view !== "parcours") return;
    var home = q("#view .ghome"), main = home && q(".gmain", home), side = home && q(".gside", home); if (!main) return;
    home.classList.add("ix");
    /* lo que ya está en otra pestaña */
    qa(":scope > .v1-card, :scope > .hsum, :scope > .lvl-card, :scope > .cur-lesson, :scope > .quick, :scope > h3.gsec", main).forEach(function(e){ e.classList.add("ix-off"); });
    var hoy = seccion(main, "ix-hoy", "Hoy", "Tu plan, tus misiones y tu meta");
    var para = seccion(main, "ix-para", "Para ti", "Te ayudamos a avanzar");
    var bh = q(".ix-body", hoy), bp = q(".ix-body", para);
    /* meta diaria: en móvil una copia compacta dentro de «Hoy» */
    var meta = side && q(".goal-card", side), copia = q(".ix-meta", bh);
    if (meta) {
      if (!copia) { copia = document.createElement("div"); copia.className = "gcard goal-card ix-meta"; bh.insertBefore(copia, bh.firstChild); }
      copia.innerHTML = meta.innerHTML;
    }
    /* racha: a la columna lateral (en móvil ya está arriba, en la barra y en el saludo) */
    var racha = q(":scope > .streak-card", main), goal = side && q(".goal-card", side);
    if (racha && side) { if (goal) goal.insertAdjacentElement("afterend", racha); else side.insertBefore(racha, side.firstChild); }
    [".am-today", ".plx-miss"].forEach(function(s){ var e = q(s, main); if (e && e.parentNode !== bh) bh.appendChild(e); });
    [".plc-card", ".plx-diag", ".pf-home"].forEach(function(s){ var e = q(s, main); if (e && e.parentNode !== bp) bp.appendChild(e); });
    var diag = q(".plx-diag", bp); if (diag) diag.classList.toggle("ix-off", diag.classList.contains("empty"));
    /* orden: saludo → continuar → primeros pasos → Hoy → mapa → Para ti */
    var ancla = q(":scope > .pp-inv", main) || q(":scope > .m-course", main) || q(":scope > .greet", main);
    var mapa = q(":scope > .av-mapa", main);
    if (ancla) { ancla.insertAdjacentElement("afterend", hoy); } else main.insertBefore(hoy, main.firstChild);
    if (mapa) hoy.insertAdjacentElement("afterend", mapa);
    (mapa || hoy).insertAdjacentElement("afterend", para);
    para.classList.toggle("ix-off", !qa(".ix-body > :not(.ix-off)", para).length);
  };
  var ordenaPronto = function(){ ordenaInicio(); setTimeout(ordenaInicio, 350); setTimeout(ordenaInicio, 1500); };

  /* ======================= Jugar ======================= */
  var GRUPOS = [
    ["Repasa", "Lo que ya viste, para que no se olvide", ["r-srs", "r-review", "r-guia", "r-jour"]],
    ["Habilidades", "Oído, pronunciación y escritura", ["r-speak", "r-dict", "r-acc", "r-atel"]],
    ["Ponte a prueba", "Mide tu nivel", ["r-chrono", "r-plc", "r-exam"]]
  ];
  var TABS = [["juegos", "🎮", "Juegos"], ["practica", "🔁", "Practicar"], ["aprende", "📚", "Aprender"]];
  var agrupa = function(rg){
    if (rg.dataset.ixGrupos) return;
    var todas = qa(".rcard", rg); if (!todas.length) return;
    rg.dataset.ixGrupos = "1";
    var frag = document.createDocumentFragment(), usadas = [];
    GRUPOS.forEach(function(g){
      var items = todas.filter(function(c){ return g[2].some(function(k){ return c.classList.contains(k); }); });
      if (!items.length) return;
      var b = document.createElement("div"); b.className = "ix-grupo";
      b.innerHTML = '<div class="ix-gh"><b>' + g[0] + "</b><small>" + g[1] + '</small></div><div class="rgrid ix-grid"></div>';
      items.forEach(function(c){ q(".ix-grid", b).appendChild(c); usadas.push(c); });
      frag.appendChild(b);
    });
    var resto = todas.filter(function(c){ return usadas.indexOf(c) < 0; });
    if (resto.length) {
      var b = document.createElement("div"); b.className = "ix-grupo";
      b.innerHTML = '<div class="ix-gh"><b>Más</b></div><div class="rgrid ix-grid"></div>';
      resto.forEach(function(c){ q(".ix-grid", b).appendChild(c); }); frag.appendChild(b);
    }
    qa(":scope > *", rg).forEach(function(e){ e.remove(); });
    rg.appendChild(frag);
  };
  var muestra = function(sec, k){
    qa(".ix-tab", sec).forEach(function(b){ var on = b.dataset.ixTab === k; b.classList.toggle("on", on); b.setAttribute("aria-selected", on ? "true" : "false"); });
    qa(".ix-pan", sec).forEach(function(p){ p.hidden = p.dataset.ixPan !== k; });
  };
  var ordenaJugar = function(){
    if (typeof view === "undefined" || view !== "retos") return;
    var sec = q("#view .gretos.jg"); if (!sec) return;
    var hero = q(".jg-hero", sec), feat = q(".jg-feat", sec), rg = q(".jg-rg", sec);
    if (rg) agrupa(rg);
    var tabs = q(".ix-tabs", sec);
    if (!tabs) {
      tabs = document.createElement("div"); tabs.className = "ix-tabs"; tabs.setAttribute("role", "tablist");
      tabs.innerHTML = TABS.map(function(t){ return '<button type="button" role="tab" class="ix-tab" data-ix-tab="' + t[0] + '"><span aria-hidden="true">' + t[1] + "</span>" + t[2] + "</button>"; }).join("");
      (q(".av-sub", sec) || q("h1", sec)).insertAdjacentElement("afterend", tabs);
    }
    var pan = function(k){
      var p = q('.ix-pan[data-ix-pan="' + k + '"]', sec);
      if (!p) { p = document.createElement("div"); p.className = "ix-pan"; p.dataset.ixPan = k; p.setAttribute("role", "tabpanel"); sec.appendChild(p); }
      return p;
    };
    var pj = pan("juegos"), pp = pan("practica"), pa = pan("aprende");
    if (hero && hero.parentNode !== pj) pj.appendChild(hero);
    if (rg && rg.parentNode !== pp) pp.appendChild(rg);
    if (feat && feat.parentNode !== pa) pa.appendChild(feat);
    /* títulos sueltos: la pestaña ya dice dónde estás */
    qa(":scope > h2.jg-h, :scope > h2.rg-h", sec).forEach(function(h){ h.remove(); });
    [pj, pp, pa].reverse().forEach(function(p){ tabs.insertAdjacentElement("afterend", p); });
    muestra(sec, lee("plx-jg-tab", "juegos"));
  };
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest(".ix-tab"); if (!b) return;
    var sec = b.closest(".gretos"); guarda("plx-jg-tab", b.dataset.ixTab); muestra(sec, b.dataset.ixTab);
    var t = q(".ix-tabs", sec); if (t && t.getBoundingClientRect().top < 0) t.scrollIntoView({ block: "start" });
  });

  var _render = typeof render === "function" ? render : null;
  if (_render) render = function(){
    var r = _render.apply(this, arguments);
    try { ordenaPronto(); } catch (e) {}
    try { ordenaJugar(); setTimeout(ordenaJugar, 400); } catch (e) {}
    return r;
  };

  var st = document.createElement("style"); st.id = "plx64";
  st.textContent = `
  .ix-off{display:none!important}
  /* ---- Inicio ---- */
  .ghome.ix .gmain{display:flex;flex-direction:column;gap:14px}
  .ghome.ix .gmain>*{margin-top:0!important;margin-bottom:0!important}
  .ix-sec{display:grid;gap:12px;margin-top:10px}
  .ix-h{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;padding:0 2px}
  .ix-h h2{display:flex;align-items:center;gap:10px;margin:0!important;font:800 19px/1.2 Poppins,system-ui,sans-serif!important;color:var(--pp-tinta)!important}
  .ix-h h2::before{content:"";width:6px;height:20px;border-radius:9px;background:var(--pp-amarillo)}
  .ix-h small{color:var(--pp-gris);font-size:13px}
  .ix-body{display:grid;gap:12px}
  .ix-body>.gcard{margin:0!important}
  .ghome.ix .av-mapa{margin-top:10px!important}
  .ghome.ix .av-mapa .av-mh h2,.ghome.ix .av-mapa h2{font:800 19px/1.2 Poppins,system-ui,sans-serif!important}
  .ix-meta{padding:12px 16px!important}
  .ix-meta .ring{width:52px!important;height:52px!important;flex:none}
  .ghome.ix .av-mh{align-items:baseline!important;justify-content:flex-start!important;gap:10px!important;flex-wrap:wrap;padding:0 2px}
  .ghome.ix .av-mh h2{display:flex;align-items:center;gap:10px;margin:0!important;color:var(--pp-tinta)!important}
  .ghome.ix .av-mh h2::before{content:"";width:6px;height:20px;border-radius:9px;background:var(--pp-amarillo)}
  .ghome.ix .av-mh span{color:var(--pp-gris);font-size:13px}
  .ghome.ix .pf-home{overflow:hidden}
  @media (max-width:899px){
    .ghome.ix .gside{display:none!important}
    .ghome.ix .greet{padding:14px 16px!important}
  }
  @media (min-width:900px){
    .ix-meta{display:none!important}
    .ghome.ix .gside{display:grid;gap:14px}
    .ghome.ix .gside>*{margin:0!important}
    .ix-para .ix-body{grid-template-columns:1fr}
  }
  /* ---- Jugar ---- */
  .ix-tabs{position:sticky;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:5;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:5px;margin:14px 0 6px;
    background:#fff;border:1px solid var(--pp-linea);border-radius:16px;box-shadow:var(--pp-sombra)}
  .ix-tab{display:flex;align-items:center;justify-content:center;gap:7px;min-height:44px;border:0;border-radius:12px;background:transparent;cursor:pointer;
    font:800 14px/1 Poppins,system-ui,sans-serif;color:var(--pp-gris);transition:background .18s,color .18s}
  .ix-tab span{font-size:17px}
  .ix-tab:hover{background:var(--pp-crema)}
  .ix-tab.on{background:var(--pp-marino);color:#fff}
  .ix-tab:focus-visible{outline:3px solid var(--pp-amarillo);outline-offset:2px}
  .ix-pan{animation:ixIn .22s ease both}
  .ix-pan[hidden]{display:none!important}
  .ix-pan .jg-hero>.jg-h{display:none}
  .ix-pan .jg-hero,.ix-pan .jg-feat,.ix-pan .jg-rg{margin-top:12px!important}
  .ix-grupo{display:grid;gap:10px;margin:6px 0 18px}
  .ix-gh{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;padding:0 2px}
  .ix-gh b{font:800 16px/1.2 Poppins,system-ui,sans-serif;color:var(--pp-tinta)}
  .ix-gh small{color:var(--pp-gris);font-size:13px}
  .ix-grid{margin:0!important}
  @media (min-width:700px){.jg .jg-rg .ix-grid{grid-template-columns:repeat(2,1fr)!important}}
  @media (min-width:1024px){.jg .jg-rg .ix-grid{grid-template-columns:repeat(4,1fr)!important}}
  @media (min-width:900px){.ix-tabs{max-width:560px;top:92px}}
  @keyframes ixIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.ix-pan{animation:none}}
  :root[data-theme=dark] .ix-tabs{background:var(--pp-crema2)}
  @media (prefers-color-scheme:dark){:root:not([data-theme=light]) .ix-tabs{background:var(--pp-crema2)}}
  `;
  document.head.appendChild(st);
  try { if (typeof view !== "undefined" && (view === "retos" || view === "parcours")) render(); } catch (e) {}
})();
