/* PLEX PLAY 2.3.1 — Pestaña Jugar ordenada y PLEX 1V1 con efectos
   Jugar
   - «Juega ahora»: el Arcade en grande (con los juegos pasando) y PLEX 1V1 al lado; accesos a Duelo en línea,
     Equipo en línea y Ranking. Después «Aprende más» en una cuadrícula pareja y la práctica diaria en listas compactas.
     La clasificación semanal vieja ya no se repite aquí (está en la pestaña Ranking).
   - Solo se reordenan y reestilizan los elementos que la pestaña ya pinta: sus botones siguen funcionando igual.
   PLEX 1V1
   - Cada sonido del duelo (V1AUD.fx) trae su efecto: confeti al acertar, esquirlas y sacudida al fallar, anuncio
     de combo, «¡YA!» al empezar, choque del VS, pulso cuando responde el rival, lluvia de confeti al ganar.
   - Opciones con pulsación y brillo, reloj que late en los últimos segundos. Respeta «reducir movimiento». */
(function(){
  "use strict";
  var G = window.PLXG || null;
  var esc = function(x){ return String(x == null ? "" : x).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var reduce = function(){ try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

  /* ======================= Jugar ======================= */
  var ICONOS = ["🍎", "💣", "🎯", "🧺", "🏃", "🃏", "🧩", "🎧", "🧠", "🕵️", "🗣️", "🚀", "⚔️", "👹", "🗺️", "🎰", "🔥", "🤝"];
  var arma = function(arc){
    var est = 0; try { var a = S.arcade && S.arcade.est || {}; for (var k in a) est += a[k] || 0; } catch (e) {}
    var n = G ? G.listaJuegos().length : 20;
    arc.classList.add("jg-arc");
    arc.innerHTML = '<span class="jg-marq" aria-hidden="true"><i>' + ICONOS.concat(ICONOS).join("</i><i>") + "</i></span>" +
      '<span class="jg-arc-t"><small>' + n + " juegos · A1 a C1</small><b>Arcade</b><span>Elige curso y juego en segundos</span></span>" +
      '<span class="jg-arc-p"><em>★ ' + est + "</em><i>Jugar</i></span>";
  };
  var ordena = function(){
    if (typeof view === "undefined" || view !== "retos") return;
    var sec = document.querySelector("#view .gretos"); if (!sec) return;
    if (sec.dataset.jgListo) {   /* plx46 puede volver a insertar su tarjeta al terminar de cargar: se reacomoda */
      var suelta = sec.querySelector(".plx46-arc:not(.jg-arc)"), t = sec.querySelector(".jg-top");
      if (suelta && t) { var vieja = t.querySelector(".jg-arc"); if (vieja) vieja.remove(); arma(suelta); t.insertBefore(suelta, t.firstChild); }
      sec.querySelectorAll("h2.rg-h").forEach(function(h){ h.remove(); });
      return;
    }
    sec.dataset.jgListo = "1"; sec.classList.add("jg");
    var v1 = sec.querySelector(".v1-card"), arc = sec.querySelector(".plx46-arc"), feat = sec.querySelector(".am-feat"), rg = sec.querySelector(".rg-wrap"), lb = sec.querySelector(".lb-card");
    sec.querySelectorAll("h2.rg-h").forEach(function(h){ h.remove(); });
    if (lb) lb.remove();
    var est = 0; try { var a = S.arcade && S.arcade.est || {}; for (var k in a) est += a[k] || 0; } catch (e) {}
    var n = G ? G.listaJuegos().length : 20;
    var hero = document.createElement("section"); hero.className = "jg-hero";
    hero.innerHTML = '<h2 class="jg-h">Juega ahora</h2><div class="jg-top"></div>' +
      '<div class="jg-rap"><button type="button" class="jg-mini" data-jg="wb"><span aria-hidden="true">⚔️</span><b>Duelo en línea</b><small>Word Battle</small></button>' +
      '<button type="button" class="jg-mini" data-jg="tc"><span aria-hidden="true">🤝</span><b>Equipo en línea</b><small>Team Challenge</small></button>' +
      '<button type="button" class="jg-mini" data-jg="rank"><span aria-hidden="true">🏆</span><b>Ranking</b><small>Tu posición</small></button></div>';
    var top = hero.querySelector(".jg-top");
    if (arc) { arma(arc); top.appendChild(arc); }
    if (v1) { v1.classList.add("jg-v1"); top.appendChild(v1); }
    var sub = sec.querySelector(".av-sub");
    (sub || sec.querySelector("h1")).insertAdjacentElement("afterend", hero);
    if (feat) { var h = document.createElement("h2"); h.className = "jg-h"; h.textContent = "Aprende más"; feat.insertAdjacentElement("beforebegin", h); feat.classList.add("jg-feat"); }
    if (rg) rg.classList.add("jg-rg");
  };
  var _render = typeof render === "function" ? render : null;
  if (_render) render = function(){ var r = _render.apply(this, arguments); try { ordena(); } catch (e) {} return r; };
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-jg]"); if (!b) return;
    e.preventDefault();
    var k = b.dataset.jg;
    if (k === "rank") { if (window.PLX_RANKING) window.PLX_RANKING(); return; }
    if (G && G.arcade) { var tr = typeof track === "string" ? track : "a1"; try { G.arcade(G.alc.todo(tr), k); } catch (x) {} }
  });

  /* ======================= PLEX 1V1 con efectos ======================= */
  var raiz = function(){ return document.getElementById("plx1v1"); };
  var lienzo = null, ctx2 = null, ps = [], raf = 0;
  var prepara = function(){
    if (lienzo && document.body.contains(lienzo)) return true;
    lienzo = document.createElement("canvas"); lienzo.className = "v1fx-cv"; lienzo.setAttribute("aria-hidden", "true"); document.body.appendChild(lienzo);
    ctx2 = lienzo.getContext("2d"); mide(); return true;
  };
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var mide = function(){ if (!lienzo) return; lienzo.width = innerWidth * dpr; lienzo.height = innerHeight * dpr; ctx2.setTransform(dpr, 0, 0, dpr, 0, 0); };
  window.addEventListener("resize", mide);
  var paso = function(){
    raf = 0; ctx2.clearRect(0, 0, innerWidth, innerHeight);
    ps = ps.filter(function(p){
      p.t += 1 / 60; if (p.t >= p.d) return false;
      p.vy += p.g / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.a += p.va / 60;
      var k = 1 - p.t / p.d; ctx2.save(); ctx2.globalAlpha = Math.min(1, k * 1.5); ctx2.translate(p.x, p.y); ctx2.rotate(p.a); ctx2.fillStyle = p.c;
      if (p.f) ctx2.fillRect(-p.s, -p.s * .45, p.s * 2, p.s * .9); else { ctx2.beginPath(); ctx2.arc(0, 0, p.s, 0, Math.PI * 2); ctx2.fill(); }
      ctx2.restore(); return true;
    });
    if (ps.length) raf = requestAnimationFrame(paso);
  };
  var estalla = function(x, y, o){
    if (reduce() || !prepara()) return; o = o || {};
    var n = o.n || 22, cols = o.cols || ["#FFD200", "#22C55E", "#fff", "#60A5FA"];
    for (var i = 0; i < n; i++) {
      var a = o.lluvia ? Math.PI / 2 + (Math.random() - .5) * .6 : Math.random() * Math.PI * 2, v = (o.v || 380) * (.35 + Math.random() * .8);
      ps.push({ x: o.lluvia ? Math.random() * innerWidth : x, y: o.lluvia ? -20 - Math.random() * 200 : y, vx: Math.cos(a) * v * (o.lluvia ? .3 : 1), vy: Math.sin(a) * v, g: o.g == null ? 650 : o.g,
        a: Math.random() * 6, va: (Math.random() - .5) * 12, s: (o.s || 5) * (.6 + Math.random() * .8), c: cols[i % cols.length], f: i % 2 === 0, t: 0, d: (o.d || 1) * (.7 + Math.random() * .6) });
    }
    if (!raf) raf = requestAnimationFrame(paso);
  };
  var centro = function(el){ if (!el) return { x: innerWidth / 2, y: innerHeight / 2 }; var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  var anuncio = function(html, cl){
    var r = raiz(); if (!r || reduce()) return;
    var d = document.createElement("div"); d.className = "v1fx-an " + (cl || ""); d.innerHTML = html; document.body.appendChild(d);
    setTimeout(function(){ d.remove(); }, 1300);
  };
  var clase = function(c, ms){ var r = raiz(); if (!r || reduce()) return; r.classList.remove(c); void r.offsetWidth; r.classList.add(c); setTimeout(function(){ r.classList.remove(c); }, ms || 600); };
  var elegida = function(){ var r = raiz(); return r && (r.querySelector(".v1-o.sel") || r.querySelector(".v1-o.ok") || r.querySelector(".v1-o.ko")); };
  var EFECTO = {
    ok: function(){ var c = centro(elegida()); estalla(c.x, c.y, { n: 26 }); clase("v1fx-bien", 500); },
    ko: function(){ var c = centro(elegida()); estalla(c.x, c.y, { n: 14, cols: ["#EF4444", "#FCA5A5", "#7F1D1D"], v: 260 }); clase("v1fx-mal", 500); },
    combo: function(n){ if ((n || 0) >= 2) anuncio("<small>COMBO</small><b>×" + n + "</b>", "combo"); if (n >= 3) estalla(innerWidth / 2, innerHeight * .4, { n: 40, v: 520, cols: ["#FFD200", "#F472B6", "#60A5FA", "#fff"] }); },
    go: function(){ anuncio("<b>¡YA!</b>", "ya"); clase("v1fx-flash", 450); },
    slam: function(){ setTimeout(function(){ clase("v1fx-choque", 600); estalla(innerWidth / 2, innerHeight * .42, { n: 36, v: 600, cols: ["#FFD200", "#fff", "#EF4444"] }); }, 550); },
    opp: function(){ clase("v1fx-rival", 450); },
    tick: function(){ clase("v1fx-tic", 300); },
    round: function(){ clase("v1fx-ronda", 500); },
    win: function(){ estalla(0, 0, { n: 90, lluvia: true, g: 260, v: 180, d: 2.6, cols: ["#FFD200", "#22C55E", "#60A5FA", "#F472B6", "#fff"] }); anuncio("<b>🏆</b><small>¡VICTORIA!</small>", "win"); },
    lose: function(){ clase("v1fx-mal", 600); },
    draw: function(){ anuncio("<b>🤝</b><small>EMPATE</small>", "win"); }
  };
  var engancha = function(){
    if (!window.V1AUD || window.V1AUD.__fx) return !!window.V1AUD;
    var f = window.V1AUD.fx;
    window.V1AUD.fx = function(k, x){ try { if (EFECTO[k]) EFECTO[k](x); } catch (e) {} return f.apply(this, arguments); };
    window.V1AUD.__fx = 1; return true;
  };
  if (!engancha()) window.addEventListener("load", engancha);

  var st = document.createElement("style"); st.id = "plx62";
  st.textContent = `
  /* ---------- Jugar ---------- */
  .jg .jg-h{margin:22px 2px 10px;font:800 1.15rem/1.2 Poppins,system-ui,sans-serif;color:var(--ink)}
  .jg-hero .jg-h{margin-top:4px}
  .jg-top{display:grid;grid-template-columns:1fr;gap:12px}
  @media (min-width:760px){.jg-top{grid-template-columns:1.4fr 1fr}}
  .jg .jg-arc{all:unset;box-sizing:border-box;cursor:pointer;position:relative;overflow:hidden;display:grid;grid-template-rows:auto 1fr;min-height:190px;padding:0 0 18px;border-radius:26px;color:#fff;
    background:radial-gradient(120% 90% at 100% 0%,rgba(255,210,0,.3),transparent 55%),linear-gradient(150deg,#0B2D74 0%,#1E5BD7 70%,#3B82F6 100%);box-shadow:0 18px 36px -20px rgba(11,45,116,.9)}
  .jg .jg-arc:hover{transform:translateY(-2px)}
  .jg-marq{display:flex;overflow:hidden;padding:14px 0 6px;mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}
  .jg-marq i{flex:none;display:grid;place-items:center;width:52px;height:52px;margin-right:10px;border-radius:16px;background:rgba(255,255,255,.14);font-style:normal;font-size:26px;animation:jgMarq 18s linear infinite}
  @keyframes jgMarq{to{transform:translateX(calc(-62px * 18))}}
  .jg-arc-t{display:grid;gap:2px;padding:6px 20px 0}
  .jg-arc-t small{font:800 11px/1.3 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#FFD200}
  .jg-arc-t b{font:900 34px/1 Poppins,system-ui,sans-serif;letter-spacing:-.01em;text-transform:uppercase}
  .jg-arc-t span{color:#DCE6FF;font-size:14px}
  .jg-arc-p{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 16px 0}
  @media (min-width:760px){.jg-arc-p{position:absolute;right:16px;bottom:16px;padding:0}}
  .jg-arc-p em{font-style:normal;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,.22);font:800 13px/1 Poppins,system-ui,sans-serif;color:#FFD200}
  .jg-arc-p i{font-style:normal;padding:12px 18px;border-radius:14px;background:#FFD200;color:#0B2D74;font:900 15px/1 Poppins,system-ui,sans-serif;text-transform:uppercase;box-shadow:0 5px 0 #C9A400}
  .jg .jg-v1{margin:0!important;min-height:120px;border-radius:26px!important}
  .jg-rap{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}
  .jg-mini{all:unset;box-sizing:border-box;cursor:pointer;display:grid;justify-items:start;gap:2px;padding:12px;border-radius:18px;background:var(--raise,#fff);box-shadow:inset 0 0 0 1px var(--line,#E2E6EF),0 10px 22px -18px rgba(11,45,116,.6)}
  .jg-mini span{font-size:24px}.jg-mini b{font:800 13.5px/1.2 Poppins,system-ui,sans-serif;color:var(--ink)}.jg-mini small{font-size:11.5px;color:var(--stone,#5B6B8C)}
  .jg-mini:active,.jg .jg-arc:active{transform:scale(.98)}
  .jg-mini:focus-visible,.jg .jg-arc:focus-visible{outline:3px solid #FFD200;outline-offset:3px}
  .jg .jg-feat{display:grid!important;grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
  @media (min-width:760px){.jg .jg-feat{grid-template-columns:repeat(4,1fr)!important}}
  .jg .jg-feat>*{min-height:112px!important;height:auto!important;margin:0!important;border-radius:20px!important;padding:14px!important;
    display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:flex-start!important;gap:6px!important;text-align:left!important}
  .jg .jg-feat>*>*{position:static!important;margin:0!important;max-width:100%!important}
  .jg .jg-feat>*::after,.jg .jg-feat>*::before{opacity:.35}
  .jg .jg-feat b,.jg .jg-feat strong{font-size:15px!important;line-height:1.2!important}
  .jg .jg-feat small,.jg .jg-feat span:not(:first-child){font-size:12px!important}
  .jg .jg-rg h2,.jg .jg-rg h3{margin:22px 2px 10px!important;font:800 1.15rem/1.2 Poppins,system-ui,sans-serif!important}
  .jg .jg-rg a,.jg .jg-rg button{border-radius:18px!important}
  @media (prefers-reduced-motion:reduce){.jg-marq i{animation:none}}
  /* ---------- PLEX 1V1 ---------- */
  .v1fx-cv{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483646}
  .v1fx-an{position:fixed;left:50%;top:42%;z-index:2147483647;pointer-events:none;display:grid;justify-items:center;transform:translate(-50%,-50%);animation:v1fxAn 1.3s cubic-bezier(.2,1.3,.4,1) forwards}
  .v1fx-an b{font:900 88px/1 Poppins,system-ui,sans-serif;color:#FFD200;-webkit-text-stroke:3px #0B2D74;text-shadow:0 8px 0 #0B2D74,0 0 40px rgba(255,210,0,.8)}
  .v1fx-an small{font:900 18px/1 Poppins,system-ui,sans-serif;letter-spacing:.3em;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6)}
  .v1fx-an.win b{font-size:96px;-webkit-text-stroke:0;text-shadow:0 10px 30px rgba(0,0,0,.4)}
  @keyframes v1fxAn{0%{transform:translate(-50%,-50%) scale(.2) rotate(-14deg);opacity:0}25%{transform:translate(-50%,-50%) scale(1.15) rotate(3deg);opacity:1}70%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-75%) scale(.9);opacity:0}}
  #plx1v1.v1fx-mal{animation:v1fxSacude .45s}
  @keyframes v1fxSacude{20%{transform:translateX(-10px)}40%{transform:translateX(9px)}60%{transform:translateX(-6px)}80%{transform:translateX(4px)}}
  #plx1v1.v1fx-choque{animation:v1fxChoque .6s}
  @keyframes v1fxChoque{10%{transform:scale(1.04)}30%{transform:scale(.98) translateX(-6px)}50%{transform:translateX(6px)}100%{transform:none}}
  #plx1v1::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0}
  #plx1v1.v1fx-bien::after{box-shadow:inset 0 0 120px 20px rgba(34,197,94,.55);animation:v1fxBorde .5s ease-out}
  #plx1v1.v1fx-mal::after{box-shadow:inset 0 0 120px 30px rgba(239,68,68,.6);animation:v1fxBorde .55s ease-out}
  #plx1v1.v1fx-flash::after{background:rgba(255,255,255,.7);animation:v1fxBorde .45s ease-out}
  #plx1v1.v1fx-rival::after{box-shadow:inset 0 90px 90px -60px rgba(244,114,182,.7);animation:v1fxBorde .45s ease-out}
  @keyframes v1fxBorde{from{opacity:1}to{opacity:0}}
  #plx1v1.v1fx-tic .v1-timer{animation:v1fxTic .3s}
  @keyframes v1fxTic{50%{transform:scale(1.08);filter:drop-shadow(0 0 10px #EF4444)}}
  #plx1v1.v1fx-ronda .v1-qt,#plx1v1.v1fx-ronda .v1-opts{animation:v1fxRonda .45s cubic-bezier(.2,1.2,.4,1)}
  @keyframes v1fxRonda{from{transform:translateX(40px);opacity:0}}
  #plx1v1 .v1-o{transition:transform .12s,box-shadow .2s}
  #plx1v1 .v1-o:hover{transform:translateY(-2px)}
  #plx1v1 .v1-o.ok{animation:v1fxOk .6s cubic-bezier(.2,1.4,.4,1);box-shadow:0 0 0 3px #22C55E,0 0 26px rgba(34,197,94,.55)}
  #plx1v1 .v1-o.ko{animation:v1fxKo .45s}
  @keyframes v1fxOk{40%{transform:scale(1.06)}}
  @keyframes v1fxKo{25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-3px)}}
  #plx1v1 .v1-bigvs,#plx1v1 .v1-vs{animation:v1fxVs .7s cubic-bezier(.2,1.6,.4,1) both}
  @keyframes v1fxVs{from{transform:scale(3) rotate(-15deg);opacity:0}}
  #plx1v1 .v1-crown{animation:v1fxCorona 2s ease-in-out infinite}
  @keyframes v1fxCorona{50%{transform:translateY(-4px) rotate(8deg)}}
  /* diseño de arena: azul noche de PLEX PLAY, marcador de cristal y opciones como botones de juego */
  #plx1v1.v1{background:radial-gradient(120% 70% at 50% 0%,#1B4FC0 0%,#0B2D74 45%,#06173F 100%)!important;color:#EEF3FF!important}
  #plx1v1 .v1-h{background:transparent!important;border:0!important}
  #plx1v1 .v1-hero h2,#plx1v1 .v1-hero h1,#plx1v1 .v1-b>h2,#plx1v1 h3.v1-qt{color:#fff!important}
  #plx1v1 .v1-hero p,#plx1v1 .v1-ask,#plx1v1 .v1-ctx,#plx1v1 .v1-note{color:#C9D6F5!important}
  #plx1v1 .v1-lv{background:rgba(255,255,255,.08)!important}
  #plx1v1 .v1-lv button{color:#C9D6F5!important}
  #plx1v1 .v1-lv button[aria-pressed=true],#plx1v1 .v1-lv button.on,#plx1v1 .v1-lv button[aria-selected=true]{background:#FFD200!important;color:#0B2D74!important}
  #plx1v1 .v1-rank{background:rgba(255,255,255,.07)!important;border-color:rgba(255,210,0,.5)!important;color:#EEF3FF!important}
  #plx1v1 .v1-rank *{color:inherit}
  #plx1v1 .v1-rw{background:rgba(255,255,255,.06)!important}
  #plx1v1 .v1-main{background:#FFD200!important;color:#0B2D74!important;box-shadow:0 6px 0 #C9A400,0 16px 30px -12px rgba(255,210,0,.6)!important;font-weight:900!important;text-transform:uppercase}
  #plx1v1 .v1-row button,#plx1v1 .v1-join button{background:rgba(255,255,255,.1)!important;color:#fff!important;box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.35)!important}
  #plx1v1 .v1-join input{background:#fff!important;color:#0B2D74!important}
  #plx1v1 .v1-vs{filter:drop-shadow(0 12px 20px rgba(0,0,0,.4))}
  #plx1v1 .v1-top{background:rgba(6,23,63,.55)!important;backdrop-filter:blur(6px);border-bottom:1px solid rgba(255,255,255,.12)!important}
  #plx1v1 .v1-top *{color:#EEF3FF}
  #plx1v1 .v1-sc{color:#FFD200!important;font-weight:900!important;text-shadow:0 2px 10px rgba(255,210,0,.35)}
  #plx1v1 .v1-p.op .v1-sc{color:#F9A8D4!important}
  #plx1v1 .v1-cat{border-radius:50%;background:radial-gradient(circle at 50% 35%,#fff,#DCE6FF);box-shadow:0 0 0 3px #60A5FA}
  #plx1v1 .v1-p.op .v1-cat{box-shadow:0 0 0 3px #F472B6}
  #plx1v1 .v1-timer{filter:drop-shadow(0 0 10px rgba(96,165,250,.6))}
  #plx1v1 .v1-q{background:transparent!important}
  #plx1v1 h3.v1-qt{font:900 clamp(20px,5.4vw,28px)/1.3 Poppins,system-ui,sans-serif!important;padding:18px;border-radius:22px;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
  #plx1v1 .v1-o{background:#fff!important;color:#0B2D74!important;border:0!important;border-radius:16px!important;box-shadow:0 5px 0 #93C5FD,0 14px 24px -14px rgba(0,0,0,.8)!important;font-weight:800!important}
  #plx1v1 .v1-o span{background:#0B2D74!important;color:#FFD200!important}
  #plx1v1 .v1-o:active{transform:translateY(4px)!important;box-shadow:0 1px 0 #93C5FD!important}
  #plx1v1 .v1-o.sel{box-shadow:0 5px 0 #1E5BD7,0 0 0 3px #60A5FA,0 0 26px rgba(96,165,250,.6)!important}
  #plx1v1 .v1-o.ok{background:#16A34A!important;color:#fff!important;box-shadow:0 5px 0 #0E6B30,0 0 26px rgba(34,197,94,.6)!important}
  #plx1v1 .v1-o.ko{background:#E5484D!important;color:#fff!important;box-shadow:0 5px 0 #9B1C22!important}
  #plx1v1 .v1-o.dim{opacity:.45}
  #plx1v1 .v1-foot{color:#C9D6F5!important}
  #plx1v1 .v1-ctx{background:rgba(255,255,255,.08)!important;border-color:rgba(255,255,255,.14)!important;color:#DCE6FF!important}
  #plx1v1 .v1-chip{box-shadow:0 0 18px rgba(255,255,255,.25)}
  @media (prefers-reduced-motion:reduce){#plx1v1 *,#plx1v1{animation:none!important}.v1fx-an{display:none}}
  `;
  document.head.appendChild(st);
  try { if (typeof view !== "undefined" && view === "retos") render(); } catch (e) {}
})();
