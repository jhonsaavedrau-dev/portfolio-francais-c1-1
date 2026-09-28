/* PLEX PLAY 2.3.0 — Arcade nuevo: curso, nivel y juego en una sola pantalla
   - Arriba: nivel (Todos · A1–A2 · B1–B2 · C1) y los cursos en fichas que se deslizan.
   - «Qué practicar»: todo el curso, una unidad o un tema de vocabulario (un selector, sin listas largas).
   - Juegos por categorías (pestañas): Rápidos · Palabras y frases · Escucha y voz · En línea · Especiales, en tarjetas
     de dos columnas con sus estrellas y cuántos retos hay para lo elegido (si hay pocos, la tarjeta lo dice).
   - Botón «Jugar» fijo abajo con el resumen. Se recuerda la última elección. Al cerrar un juego se vuelve aquí.
   - Abre la portada de siempre del juego (reglas y ajustes) con PLXG.arcade(alcance, juego). */
(function(){
  "use strict";
  var G = window.PLXG; if (!G || !G.arcade || !G.alc) return;
  var esc = G.esc;
  var lsG = function(k, d){ try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  var lsS = function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  var CATS = [
    ["todos", "Todos", "🎮", null],
    ["rapidos", "Rápidos", "⚡", ["ff", "bc", "wc", "tw", "gr", "cm"]],
    ["palabras", "Palabras y frases", "🧩", ["pb", "sb", "sr", "mr", "cc", "ld"]],
    ["voz", "Escucha y voz", "🎧", ["ah", "vd", "rq"]],
    ["linea", "En línea", "🌐", ["wb", "tc"]],
    ["especiales", "Especiales", "👑", ["bb", "mc", "la"]]
  ];
  var NIV = [["todos", "Todos"], ["0", "A1–A2"], ["1", "B1–B2"], ["2", "C1"]];
  var EMO = { pp: "🐣", a1: "🗼", a2: "☕", fon: "🎙️", b11: "🏙️", b12: "🏖️", b21: "⛰️", rem: "🇫🇷", prog: "📚", c12: "🌙", lit: "🎭" };
  var H = lsG("plx-hub2", {});
  var cursos = function(){ return TRACKS.filter(function(t){ return LESSONS.some(function(l){ return l.track === t.id && !l.special; }); }); };
  var track = function(){ var ts = cursos(); if (!H.tr || !ts.some(function(t){ return t.id === H.tr; })) { var c = (typeof window.track === "string" && window.track) || (ts[1] || ts[0]).id; H.tr = ts.some(function(t){ return t.id === c; }) ? c : ts[0].id; } return H.tr; };
  var opcionesAlc = function(tr){
    var out = [{ k: "c:" + tr, t: "Todo el curso", a: function(){ return G.alc.todo(tr); } }];
    G.alc.unidades(tr).forEach(function(u, i){ out.push({ k: "u:" + tr + ":" + u, t: "Unidad " + (i + 1) + " · " + u, a: function(){ return G.alc.unidad(tr, u); } }); });
    var th = ((window.__VOCAB || {})[tr] || { themes: [] }).themes;
    th.forEach(function(t, i){ out.push({ k: "v:" + tr + ":" + i, t: "Vocabulario · " + t.t, voc: true, a: function(){ return G.alc.vocab(tr, i); } }); });
    return out;
  };
  var alcSel = function(){ var tr = track(), os = opcionesAlc(tr), o = os.filter(function(x){ return x.k === H.alc; })[0] || os[0]; H.alc = o.k; return o; };
  var juegos = function(){ var cat = CATS.filter(function(c){ return c[0] === (H.cat || "todos"); })[0] || CATS[0]; return G.listaJuegos().filter(function(j){ return !cat[3] || cat[3].indexOf(j.id) >= 0; }); };
  var estrellas = function(n){ n = n || 0; return '<span class="az-est" aria-label="' + n + ' de 3 estrellas">' + [0, 1, 2].map(function(i){ return '<i class="' + (i < n ? "on" : "") + '">★</i>'; }).join("") + "</span>"; };

  var capa = null, volver = false, CNT = {}, cola = [], trabajando = false;
  /* 2.3.1: contar los retos de 20 juegos de golpe tardaba decenas de segundos en el celular. Ahora la pantalla
     sale al instante y cada juego se cuenta después, de a uno, cuando el teléfono está libre (y queda guardado). */
  var MULTI = { bb: 1, mc: 1, la: 1 };
  var clave = function(j, alc){ return j.id + "|" + alc.clave; };
  var cuenta = function(j, alc){ if (alc.tema && !j.vocab) return -1; if (MULTI[j.id]) return -2; var k = clave(j, alc); return CNT[k] == null ? null : CNT[k]; };
  var ocioso = window.requestIdleCallback ? function(f){ requestIdleCallback(f, { timeout: 400 }); } : function(f){ setTimeout(f, 30); };
  var trabaja = function(){
    if (trabajando) return; trabajando = true;
    ocioso(function paso(){
      var x = cola.shift();
      if (!x) { trabajando = false; return; }
      if (CNT[x.k] == null) { try { CNT[x.k] = G.nRetos(x.j, x.alc); } catch (e) { CNT[x.k] = 0; } actualiza(x.j, x.alc); }
      ocioso(paso);
    });
  };
  var etiqueta = function(n){ return n === -1 ? "No usa vocabulario" : n === -2 ? "Varios juegos" : n == null ? "Contando…" : n < G.MIN_RETOS ? "Pocos retos aquí" : n + " retos"; };
  var actualiza = function(j, alc){
    if (!capa) return; var b = capa.querySelector('[data-az-j="' + j.id + '"]'); if (!b) return;
    var n = CNT[clave(j, alc)], off = n != null && n >= 0 && n < G.MIN_RETOS;
    b.classList.toggle("off", off); var em = b.querySelector("em"); if (em) em.textContent = etiqueta(n);
    if (j.id === H.jid) { var go = capa.querySelector(".az-go"); if (go) { go.disabled = off; go.textContent = off ? "Elige otro juego o tema" : "Jugar"; } }
  };
  var pinta = function(){
    var el = capa; if (!el) return;
    cola = [];
    var tr = track(), o = alcSel(), alc = o.a(), T = TRACKS.filter(function(t){ return t.id === tr; })[0] || {}, lv = H.lv || "todos";
    var cs = cursos().filter(function(t){ return lv === "todos" || String(G.nivel(t.id)) === lv; });
    var js = juegos(); if (!H.jid || !G.juegos[H.jid]) H.jid = (js[0] || G.listaJuegos()[0]).id;
    var J = G.juegos[H.jid];
    lsS("plx-hub2", H);
    var est = 0; try { var a = S.arcade && S.arcade.est || {}; for (var k in a) est += a[k] || 0; } catch (e) {}
    el.innerHTML = '<div class="plxg-scroll az-scroll"><div class="az">' +
      '<header class="az-top"><button type="button" class="plxg-ib" data-az="salir" aria-label="Cerrar el Arcade"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg></button>' +
        '<h1>Arcade</h1><span class="az-tot">★ ' + est + "</span></header>" +
      '<section class="az-bloque"><h2><span>1</span>Curso</h2>' +
        '<div class="az-niv" role="tablist" aria-label="Nivel">' + NIV.map(function(n){ return '<button type="button" role="tab" data-az-lv="' + n[0] + '" aria-selected="' + (lv === n[0]) + '">' + n[1] + "</button>"; }).join("") + "</div>" +
        '<div class="az-cursos">' + cs.map(function(t){ return '<button type="button" class="az-c' + (t.id === tr ? " on" : "") + '" data-az-tr="' + esc(t.id) + '" aria-pressed="' + (t.id === tr) + '"><span aria-hidden="true">' + (EMO[t.id] || "📘") + "</span><b>" + esc(t.label) + "</b><small>" + esc(G.DIF[G.nivel(t.id)].nombre) + "</small></button>"; }).join("") + "</div>" +
      "</section>" +
      '<section class="az-bloque"><h2><span>2</span>Qué practicar</h2><label class="az-sel"><select data-az-alc aria-label="Qué practicar">' +
        opcionesAlc(tr).map(function(x){ return '<option value="' + esc(x.k) + '"' + (x.k === o.k ? " selected" : "") + ">" + esc(x.t) + "</option>"; }).join("") + "</select></label>" +
        (window.__VOCAB ? "" : '<p class="az-nota">Cargando los temas de vocabulario…</p>') + "</section>" +
      '<section class="az-bloque az-jb"><h2><span>3</span>Juego</h2>' +
        '<div class="az-cats" role="tablist" aria-label="Categorías">' + CATS.map(function(c){ return '<button type="button" role="tab" data-az-cat="' + c[0] + '" aria-selected="' + ((H.cat || "todos") === c[0]) + '"><span aria-hidden="true">' + c[2] + "</span>" + c[1] + "</button>"; }).join("") + "</div>" +
        '<div class="az-grid">' + js.map(function(j){
          var n = cuenta(j, alc), pocos = n != null && n >= 0 && n < G.MIN_RETOS, no = n === -1, rec = null; try { rec = G.record(j.id, alc); } catch (e) {}
          if (n === null) cola.push({ k: clave(j, alc), j: j, alc: alc });
          var e2 = alc.unit ? G.estrellasUnidad(j.id, alc.track, alc.unit) : rec ? rec.est : 0;
          return '<button type="button" class="az-j' + (j.id === H.jid ? " on" : "") + (pocos || no ? " off" : "") + '" data-az-j="' + esc(j.id) + '" style="--jc:' + esc(j.color) + '" aria-pressed="' + (j.id === H.jid) + '">' +
            '<span class="az-deco" aria-hidden="true">' + (j.deco ? j.deco() : "") + "</span><b>" + esc(j.nombre) + "</b><small>" + esc(j.verbo) + "</small>" + estrellas(e2) +
            '<em>' + etiqueta(n) + "</em></button>";
        }).join("") + "</div></section>" +
      '<div class="az-pie"><div class="az-res"><small>' + esc(T.label || "") + " · " + esc(o.t) + "</small><b>" + esc(J ? J.nombre : "") + '</b></div><button type="button" class="plxg-btn az-go" data-az="jugar">Jugar</button></div>' +
    "</div></div>";
    var c = el.querySelector(".az-c.on"); if (c) c.parentNode.scrollLeft = c.offsetLeft - 16;
    /* primero el juego elegido, luego los visibles */
    cola.sort(function(a, b){ return (b.j.id === H.jid) - (a.j.id === H.jid); }); trabaja();
    var jb = el.querySelector(".az-j.on"), go = el.querySelector(".az-go");
    if (jb && jb.classList.contains("off")) { go.disabled = true; go.textContent = "Elige otro juego o tema"; }
  };
  var abre = function(){
    capa = G.abrir(); volver = false;
    capa.onclick = function(e){
      var b = e.target.closest && e.target.closest("button"); if (!b || b.disabled) return;
      G.despiertaAudio && G.despiertaAudio();
      if (b.dataset.az === "salir") { capa = null; G.cerrar(); return; }
      if (b.dataset.az === "jugar") {
        var o = alcSel(), alc = o.a(); if (!alc) return;
        volver = true; var el = capa; capa = null; el.onclick = null; G.sfx && G.sfx("tic");
        G.arcade(alc, H.jid); return;
      }
      if (b.dataset.azLv) { H.lv = b.dataset.azLv; var ts = cursos().filter(function(t){ return H.lv === "todos" || String(G.nivel(t.id)) === H.lv; }); if (ts.length && !ts.some(function(t){ return t.id === H.tr; })) { H.tr = ts[0].id; H.alc = null; } }
      if (b.dataset.azTr) { H.tr = b.dataset.azTr; H.alc = null; }
      if (b.dataset.azCat) { H.cat = b.dataset.azCat; var js = juegos(); if (!js.some(function(j){ return j.id === H.jid; }) && js[0]) H.jid = js[0].id; }
      if (b.dataset.azJ) { H.jid = b.dataset.azJ; G.sfx && G.sfx("tic"); }
      var y = capa.querySelector(".az-scroll").scrollTop; pinta(); capa.querySelector(".az-scroll").scrollTop = y;
    };
    capa.onchange = function(e){ if (e.target.matches("[data-az-alc]")) { H.alc = e.target.value; pinta(); } };
    pinta();
    if (!window.__VOCAB && G.vocab) Promise.resolve(G.vocab()).then(function(){ if (capa) pinta(); }, function(){});
  };
  /* al cerrar un juego abierto desde aquí, se vuelve al Arcade */
  var _cerrar = G.cerrar;
  G.cerrar = function(){ var r = _cerrar.apply(this, arguments); if (volver) { volver = false; setTimeout(abre, 60); } return r; };
  G.arcadeHub = abre;
  /* la tarjeta «Arcade» (pestaña Jugar) abre esta pantalla */
  document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest("[data-arcade]"); if (!b) return; e.preventDefault(); e.stopImmediatePropagation(); abre(); }, true);

  var st = document.createElement("style"); st.id = "plx61";
  st.textContent = `
  .az{max-width:620px;margin:0 auto;padding:calc(10px + env(safe-area-inset-top)) 16px calc(110px + env(safe-area-inset-bottom))}
  .az-top{display:flex;align-items:center;gap:12px;margin-bottom:8px}
  .az-top h1{flex:1;margin:0;font:900 30px/1 Poppins,system-ui,sans-serif;letter-spacing:-.01em;color:#fff;text-transform:uppercase}
  .az-tot{padding:8px 12px;border-radius:999px;background:rgba(255,210,0,.16);color:#FFD200;font:800 14px/1 Poppins,system-ui,sans-serif}
  .az-bloque{margin:14px 0 0}
  .az-bloque h2{display:flex;align-items:center;gap:8px;margin:0 0 8px;font:800 13px/1 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#A6B6E0}
  .az-bloque h2 span{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#FFD200;color:#081F55;font-size:12px;letter-spacing:0}
  .az-niv,.az-cats{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
  .az-niv::-webkit-scrollbar,.az-cats::-webkit-scrollbar,.az-cursos::-webkit-scrollbar{display:none}
  .az-niv button,.az-cats button{all:unset;cursor:pointer;flex:none;display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;font:700 13px/1 Inter,system-ui,sans-serif;color:#C9D6F5;box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.35)}
  .az-niv button[aria-selected=true],.az-cats button[aria-selected=true]{background:#FFD200;color:#081F55;box-shadow:none}
  .az-cursos{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;margin-top:8px;padding:2px 0 4px}
  .az-c{all:unset;cursor:pointer;flex:0 0 112px;scroll-snap-align:start;display:grid;gap:3px;padding:10px;border-radius:16px;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.1)}
  .az-c span{font-size:22px}.az-c b{font:800 13px/1.2 Poppins,system-ui,sans-serif;color:#fff;min-height:2.4em}.az-c small{font:700 10px/1 Inter,system-ui,sans-serif;color:#93C5FD}
  .az-c.on{background:linear-gradient(160deg,#1E5BD7,#0B2D74);box-shadow:inset 0 0 0 2px #FFD200,0 10px 20px -12px rgba(0,0,0,.8)}
  .az-sel{display:block;position:relative}
  .az-sel::after{content:"▾";position:absolute;right:16px;top:50%;transform:translateY(-50%);color:#FFD200;pointer-events:none;font-size:16px}
  .az-sel select{appearance:none;-webkit-appearance:none;width:100%;min-height:50px;padding:0 40px 0 16px;border-radius:14px;border:0;background:#fff;color:#0B2D74;font:700 15px/1.2 Poppins,system-ui,sans-serif;box-shadow:0 4px 0 #93C5FD}
  .az-nota{margin:6px 0 0;font-size:12px;color:#A6B6E0}
  .az-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px}
  @media (min-width:560px){.az-grid{grid-template-columns:repeat(3,1fr)}}
  .az-j{all:unset;box-sizing:border-box;cursor:pointer;position:relative;display:grid;gap:3px;align-content:start;padding:10px 12px 12px;border-radius:18px;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.1);overflow:hidden;transition:transform .12s}
  .az-j::before{content:"";position:absolute;inset:0 0 auto;height:4px;background:var(--jc)}
  .az-j:active{transform:scale(.97)}
  .az-j.on{background:linear-gradient(160deg,color-mix(in srgb,var(--jc) 35%,#0B2D74),#0B2D74);box-shadow:inset 0 0 0 2px var(--jc),0 12px 24px -14px var(--jc)}
  .az-j.off{opacity:.45}
  .az-deco{height:44px;display:flex;align-items:center;overflow:hidden}.az-deco svg,.az-deco img{height:44px!important;width:auto!important;max-width:84px!important;position:static!important;transform:none!important}
  .az-j b{font:800 14px/1.2 Poppins,system-ui,sans-serif;color:#fff}
  .az-j small{font:600 11.5px/1.3 Inter,system-ui,sans-serif;color:#C9D6F5;min-height:2.6em}
  .az-j em{font-style:normal;font:700 10.5px/1 Inter,system-ui,sans-serif;color:#93C5FD}
  .az-est{display:flex;gap:1px}.az-est i{font-style:normal;color:rgba(255,255,255,.2);font-size:13px}.az-est i.on{color:#FFD200}
  .az-j:focus-visible,.az-c:focus-visible,.az-niv button:focus-visible,.az-cats button:focus-visible,.az-sel select:focus-visible{outline:3px solid #FFD200;outline-offset:2px}
  .az-pie{position:fixed;left:0;right:0;bottom:0;z-index:5;display:flex;align-items:center;gap:12px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:linear-gradient(0deg,#06173F 70%,rgba(6,23,63,0));}
  .az-pie>*{max-width:620px}
  .az-res{flex:1;min-width:0;margin-left:max(0px,calc((100% - 620px) / 2))}
  .az-res small{display:block;font:600 11.5px/1.3 Inter,system-ui,sans-serif;color:#A6B6E0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .az-res b{font:900 18px/1.2 Poppins,system-ui,sans-serif;color:#fff}
  .az-go{min-width:130px}
  `;
  document.head.appendChild(st);
})();
