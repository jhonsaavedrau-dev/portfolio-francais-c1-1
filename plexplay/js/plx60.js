/* PLEX PLAY 2.3.0 — Avatar que no se pierde y Ranking con la identidad de PLEX PLAY
   Avatar
   - El gato (pelaje, accesorios, fondo y nombre) se guardaba dentro del progreso, y al unir el progreso local con
     el de la nube ganaba entero el más reciente. Si al abrir la app (otro teléfono, app reinstalada, sesión nueva)
     algo se guardaba antes de que llegara el progreso de la nube, el gato por defecto «ganaba» y volvía a
     Manzana. Ahora el gato lleva su propia fecha de cambio (S.game.catAt) y al unir gana el último cambio del
     gato; ante la duda, nunca gana el gato por defecto. El perfil público (rankings) se actualiza al cambiarlo.
   Ranking
   - Pantalla propia con los colores de la app (no la capa oscura del Arcade): tu tarjeta (posición, nivel, XP),
     Unipamplona / Global, Semana / Mes / Histórico, podio del top 3, lista con barra de XP respecto al líder y
     tu fila fija abajo si no estás a la vista. Cuenta regresiva de la semana. Nunca correos: solo apodo, gato,
     nivel y XP (lo que devuelve plx_ranking).
   - La tarjeta de clasificación del Inicio toma el mismo estilo (medallas y tarjetas). */
(function(){
  "use strict";
  var esc = function(x){ return String(x == null ? "" : x).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ======================= avatar ======================= */
  var DEF = JSON.stringify({ coat: "manzana", acc: { hat: "boina", neck: "marino" } });
  var esDef = function(c){ if (!c) return true; try { return JSON.stringify({ coat: c.coat, acc: c.acc || {} }) === DEF; } catch (e) { return true; } };
  var foto = function(){ try { return JSON.stringify((S.game && S.game.cat) || null) + "|" + ((S.game && S.game.name) || ""); } catch (e) { return ""; } };
  var ultimo = foto();
  if (typeof save === "function") {
    var _save = save;
    save = function(){
      try { var f = foto(); if (f !== ultimo) { ultimo = f; if (S.game) S.game.catAt = Date.now(); } } catch (e) {}
      return _save.apply(this, arguments);
    };
  }
  if (typeof mergeState === "function") {
    var _ms = mergeState;
    mergeState = function(a, b){
      var R = _ms.apply(this, arguments);
      try {
        var ga = a && a.game, gb = b && b.game;
        if (R && R.game && ga && gb && ga.cat && gb.cat) {
          var ta = ga.catAt || 0, tb = gb.catAt || 0, gana = null;
          if (ta !== tb) gana = ta > tb ? ga : gb;
          else if (esDef(ga.cat) !== esDef(gb.cat)) gana = esDef(ga.cat) ? gb : ga;
          if (gana) { R.game.cat = JSON.parse(JSON.stringify(gana.cat)); R.game.catAt = gana.catAt || 0; if (gana.name) R.game.name = gana.name; }
        }
      } catch (e) {}
      ultimo = null;   /* la próxima foto se toma después de unir */
      setTimeout(function(){ ultimo = foto(); }, 0);
      return R;
    };
  }

  /* ======================= ranking ======================= */
  var AMB = [["unipamplona", "Unipamplona", "🎓"], ["global", "Global", "🌎"]];
  var PER = [["semana", "Semana"], ["mes", "Mes"], ["total", "Histórico"]];
  var R = { amb: "global", per: "semana", cache: {} };
  var gato = function(av, mood){ try { return catSVG(av && typeof av === "object" ? av : {}, { mood: mood || "happy" }); } catch (e) { return ""; } };
  var sesion = function(){ try { return !!(window.PCB && PCB.uid && PCB.sb); } catch (e) { return false; } };
  var fin = function(){
    var d = new Date(), f;
    if (R.per === "semana") { f = new Date(d); f.setHours(24, 0, 0, 0); while (f.getDay() !== 1) f.setDate(f.getDate() + 1); }
    else if (R.per === "mes") { f = new Date(d.getFullYear(), d.getMonth() + 1, 1); }
    else return "";
    var ms = f - d, dd = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5);
    return (R.per === "semana" ? "La semana termina en " : "El mes termina en ") + (dd ? dd + " d " : "") + hh + " h";
  };
  var datos = function(){
    var k = R.amb + "|" + R.per;
    if (window.__RK_FAKE) { R.cache[k] = { t: Date.now(), filas: window.__RK_FAKE(R.amb, R.per) }; return Promise.resolve(); }
    if (R.cache[k] && !R.cache[k].error && Date.now() - R.cache[k].t < 60000) return Promise.resolve();
    if (!sesion()) { R.cache[k] = { t: Date.now(), error: "sesion" }; return Promise.resolve(); }
    return PCB.sb.rpc("plx_ranking", { ambito: R.amb, periodo: R.per, cuantos: 50 }).then(function(r){ if (r.error) throw r.error; R.cache[k] = { t: Date.now(), filas: r.data || [] }; })
      .catch(function(e){ R.cache[k] = { t: Date.now(), error: navigator.onLine === false ? "Sin conexión: el ranking necesita internet." : /function|does not exist|PGRST202/i.test(String(e && (e.message || e.code))) ? "El ranking se activa cuando se actualice el servidor." : "No se pudo cargar el ranking. Inténtalo de nuevo." }; });
  };
  var MED = ["🥇", "🥈", "🥉"];
  var podio = function(f){
    var orden = [f[1], f[0], f[2]];
    return '<div class="rkx-podio">' + orden.map(function(x, i){
      if (!x) return '<div class="rkx-pd vacio"></div>';
      var p = x.posicion, cl = p === 1 ? "oro" : p === 2 ? "plata" : "bronce";
      return '<div class="rkx-pd ' + cl + (x.soy_yo ? " yo" : "") + '" style="--d:' + (i * 90) + 'ms">' + (p === 1 ? '<span class="rkx-corona" aria-hidden="true">👑</span>' : "") +
        '<span class="rkx-av">' + gato(x.avatar, p === 1 ? "excited" : "happy") + '</span><b>' + esc(x.nick) + (x.soy_yo ? " (tú)" : "") + '</b><small>Nivel ' + esc(x.nivel || "1") + "</small>" +
        '<span class="rkx-base"><em>' + MED[p - 1] + "</em><i>" + Number(x.xp || 0).toLocaleString("es-CO") + " XP</i></span></div>";
    }).join("") + "</div>";
  };
  var fila = function(x, max){
    var pct = max ? Math.max(4, Math.round((x.xp || 0) / max * 100)) : 0;
    return '<li class="rkx-f' + (x.soy_yo ? " yo" : "") + '"><span class="rkx-pos">' + x.posicion + '</span><span class="rkx-av sm">' + gato(x.avatar) + "</span>" +
      '<span class="rkx-n"><b>' + esc(x.nick) + (x.soy_yo ? " <em>tú</em>" : "") + '</b><span class="rkx-bar"><i style="width:' + pct + '%"></i></span></span>' +
      '<span class="rkx-lv">Nv ' + esc(x.nivel || "1") + '</span><span class="rkx-xp">' + Number(x.xp || 0).toLocaleString("es-CO") + "<small>XP</small></span></li>";
  };
  var yoTarjeta = function(filas){
    var yo = (filas || []).filter(function(x){ return x.soy_yo; })[0], G = {}; try { G = gEnsure(); } catch (e) {}
    var lv = 1; try { lv = catLevel(S.xp); } catch (e) {}
    var pos = yo ? yo.posicion : null, sobre = yo && filas ? filas.filter(function(x){ return x.posicion === yo.posicion - 1; })[0] : null;
    var meta = pos === 1 ? "¡Vas primero! Defiende el puesto." : sobre ? "Te faltan " + Math.max(1, (sobre.xp || 0) - (yo.xp || 0) + 1).toLocaleString("es-CO") + " XP para pasar a " + esc(sobre.nick) + "." : "Gana XP en lecciones y juegos para entrar al ranking.";
    return '<div class="rkx-yo"><span class="rkx-av md">' + gato(G.cat, "happy") + '</span><div><small>Tu posición</small><b>' + (pos ? "#" + pos : "—") + '</b><span>' + meta + "</span></div>" +
      '<div class="rkx-yo-x"><b>' + Number(yo ? yo.xp : 0).toLocaleString("es-CO") + '</b><small>XP ' + { semana: "esta semana", mes: "este mes", total: "en total" }[R.per] + "</small><em>Nivel " + lv + "</em></div></div>";
  };
  var pinta = function(el){
    var k = R.amb + "|" + R.per, d = R.cache[k], cuerpo = el.querySelector(".rkx-cuerpo");
    el.querySelectorAll("[data-rkx-amb]").forEach(function(b){ b.setAttribute("aria-selected", String(b.dataset.rkxAmb === R.amb)); });
    el.querySelectorAll("[data-rkx-per]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.dataset.rkxPer === R.per)); });
    el.querySelector(".rkx-fin").textContent = fin();
    if (!d) { cuerpo.innerHTML = '<div class="rkx-cargando"><i></i><i></i><i></i></div>'; return; }
    if (d.error === "sesion") { cuerpo.innerHTML = '<div class="rkx-vacio"><span>' + gato(null, "curious") + '</span><b>Entra con tu cuenta</b><p>El ranking compara tu XP con el de otros estudiantes. Entra con Google o con tu correo para aparecer.</p></div>'; return; }
    if (d.error) { cuerpo.innerHTML = '<div class="rkx-vacio"><span>' + gato(null, "sad") + "</span><b>" + esc(d.error) + '</b><button type="button" class="rkx-btn" data-rkx="otra">Intentar de nuevo</button></div>'; return; }
    var f = d.filas || [];
    if (!f.length) { cuerpo.innerHTML = yoTarjeta(f) + '<div class="rkx-vacio"><span>' + gato(null, "excited") + '</span><b>¡Nadie ha sumado XP aún!</b><p>Haz una lección o un juego y estrena el podio.</p></div>'; return; }
    var top = f.filter(function(x){ return x.posicion <= 50; }), max = top.length ? top[0].xp || 0 : 0, yo = f.filter(function(x){ return x.soy_yo; })[0];
    cuerpo.innerHTML = yoTarjeta(f) + podio(top.slice(0, 3)) + '<ol class="rkx-l">' + top.slice(3).map(function(x){ return fila(x, max); }).join("") + "</ol>" +
      (yo && yo.posicion > 3 ? '<div class="rkx-fijo" aria-hidden="true">' + fila(yo, max) + "</div>" : "");
    var fijo = el.querySelector(".rkx-fijo"), mia = el.querySelector(".rkx-l .rkx-f.yo"), sc = el.querySelector(".rkx-scroll");
    if (fijo) { var mira = function(){ var visible = mia && mia.getBoundingClientRect().bottom < innerHeight - 70 && mia.getBoundingClientRect().top > 60; fijo.classList.toggle("oculto", !!visible); }; sc.onscroll = mira; mira(); }
  };
  var carga = function(el){ pinta(el); datos().then(function(){ if (document.body.contains(el)) pinta(el); }); };
  var capa = null;
  var abre = function(){
    if (!capa) { capa = document.createElement("div"); capa.className = "rkx"; capa.setAttribute("role", "dialog"); capa.setAttribute("aria-modal", "true"); capa.setAttribute("aria-label", "Ranking"); document.body.appendChild(capa); }
    capa.hidden = false; document.documentElement.classList.add("rkx-on");
    capa.innerHTML = '<div class="rkx-scroll"><div class="rkx-wrap">' +
      '<header class="rkx-hero"><button type="button" class="rkx-x" data-rkx="cerrar" aria-label="Cerrar el ranking">✕</button><span class="rkx-trofeo" aria-hidden="true">🏆</span>' +
        '<h1>Ranking</h1><p>Solo se ven apodos, gatos, niveles y XP. Nunca correos.</p><span class="rkx-fin"></span></header>' +
      '<div class="rkx-tabs" role="tablist" aria-label="Ranking">' + AMB.map(function(a){ return '<button type="button" role="tab" data-rkx-amb="' + a[0] + '"><span aria-hidden="true">' + a[2] + "</span>" + a[1] + "</button>"; }).join("") + "</div>" +
      '<div class="rkx-per" role="group" aria-label="Periodo">' + PER.map(function(p){ return '<button type="button" data-rkx-per="' + p[0] + '">' + p[1] + "</button>"; }).join("") + "</div>" +
      '<div class="rkx-cuerpo"></div></div></div>';
    capa.onclick = function(e){
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.rkx === "cerrar") return cierra();
      if (b.dataset.rkx === "otra") { R.cache[R.amb + "|" + R.per] = null; return carga(capa); }
      if (b.dataset.rkxAmb) { R.amb = b.dataset.rkxAmb; carga(capa); }
      if (b.dataset.rkxPer) { R.per = b.dataset.rkxPer; carga(capa); }
    };
    carga(capa);
    try { var q = capa.querySelector(".rkx-x"); q.focus({ preventScroll: true }); } catch (e) {}
  };
  var cierra = function(){ if (!capa) return; capa.hidden = true; capa.innerHTML = ""; document.documentElement.classList.remove("rkx-on"); };
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && capa && !capa.hidden) cierra(); });
  var instala = function(){ if (window.PCB) PCB.rankings = abre; window.PLX_RANKING = abre; };
  instala(); window.addEventListener("load", instala);
  /* «Ver todo» de la tarjeta del Inicio y la pestaña Ranking abren esta pantalla (también sin sesión: explica cómo entrar) */

  var st = document.createElement("style"); st.id = "plx60";
  st.textContent = `
  html.rkx-on,html.rkx-on body{overflow:hidden}
  .rkx{position:fixed;inset:0;z-index:2147482000;background:var(--paper,#F4F6FB);color:var(--ink,#131218);font-family:Inter,system-ui,sans-serif}
  .rkx[hidden]{display:none}
  .rkx-scroll{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
  .rkx-wrap{max-width:620px;margin:0 auto;padding:0 16px calc(96px + env(safe-area-inset-bottom))}
  .rkx-hero{position:relative;margin:0 -16px 14px;padding:calc(22px + env(safe-area-inset-top)) 20px 26px;border-radius:0 0 28px 28px;color:#fff;overflow:hidden;
    background:radial-gradient(120% 90% at 85% -10%,rgba(255,210,0,.35),transparent 55%),linear-gradient(160deg,#0B2D74,#1E5BD7)}
  .rkx-hero::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 20% 120%,rgba(255,255,255,.12),transparent 50%);pointer-events:none}
  .rkx-x{all:unset;cursor:pointer;position:absolute;top:calc(14px + env(safe-area-inset-top));left:14px;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:rgba(255,255,255,.14);font-weight:900}
  .rkx-x:focus-visible,.rkx-tabs button:focus-visible,.rkx-per button:focus-visible,.rkx-btn:focus-visible{outline:3px solid #FFD200;outline-offset:2px}
  .rkx-trofeo{position:absolute;right:18px;top:calc(12px + env(safe-area-inset-top));font-size:64px;filter:drop-shadow(0 8px 14px rgba(0,0,0,.35));animation:rkxTrofeo 3s ease-in-out infinite}
  @keyframes rkxTrofeo{50%{transform:translateY(-6px) rotate(-6deg)}}
  .rkx-hero h1{margin:36px 0 4px;font:900 34px/1 Poppins,system-ui,sans-serif;letter-spacing:-.02em}
  .rkx-hero p{margin:0;color:#DCE6FF;font-size:13px}
  .rkx-fin{display:inline-block;margin-top:12px;padding:6px 12px;border-radius:999px;background:#FFD200;color:#0B2D74;font:800 12px/1 Inter,system-ui,sans-serif}
  .rkx-fin:empty{display:none}
  .rkx-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;border-radius:18px;background:var(--raise,#fff);box-shadow:inset 0 0 0 1px var(--line,#E2E6EF)}
  .rkx-tabs button{all:unset;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border-radius:14px;font:800 15px/1 Poppins,system-ui,sans-serif;color:var(--stone,#5B6B8C)}
  .rkx-tabs button[aria-selected=true]{background:linear-gradient(180deg,#2B6BEA,#1E5BD7);color:#fff;box-shadow:0 8px 16px -10px rgba(30,91,215,.9)}
  .rkx-per{display:flex;justify-content:center;gap:8px;margin:12px 0 14px}
  .rkx-per button{all:unset;cursor:pointer;padding:8px 14px;border-radius:999px;font:700 13px/1 Inter,system-ui,sans-serif;color:var(--stone,#5B6B8C);box-shadow:inset 0 0 0 1.5px var(--line,#D5DCEA)}
  .rkx-per button[aria-pressed=true]{background:#FFD200;color:#0B2D74;box-shadow:none}
  .rkx-yo{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:14px;border-radius:22px;background:var(--raise,#fff);box-shadow:0 14px 30px -22px rgba(11,45,116,.8),inset 0 0 0 2px #FFD200;margin-bottom:18px}
  .rkx-yo small{display:block;font:800 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--stone,#5B6B8C)}
  .rkx-yo>div>b{font:900 28px/1 Poppins,system-ui,sans-serif;color:#1E5BD7}
  .rkx-yo>div>span{display:block;margin-top:4px;font-size:12.5px;color:var(--stone,#5B6B8C)}
  .rkx-yo-x{text-align:right}.rkx-yo-x b{display:block;font:900 22px/1 Poppins,system-ui,sans-serif;color:var(--ink,#131218)}
  .rkx-yo-x em{display:inline-block;margin-top:6px;padding:3px 8px;border-radius:999px;background:rgba(30,91,215,.12);color:#1E5BD7;font:800 11px/1.2 Inter,system-ui,sans-serif;font-style:normal}
  .rkx-av{display:grid;place-items:center;width:72px;height:72px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 35%,#fff,#DCE6FF);box-shadow:0 0 0 3px #fff,0 8px 16px -8px rgba(0,0,0,.4)}
  .rkx-av svg{width:100%;height:100%}.rkx-av.md{width:56px;height:56px}.rkx-av.sm{width:40px;height:40px;box-shadow:0 0 0 2px #fff}
  .rkx-podio{display:grid;grid-template-columns:1fr 1.15fr 1fr;align-items:end;gap:8px;margin:6px 0 18px}
  .rkx-pd{position:relative;display:grid;justify-items:center;gap:4px;text-align:center;animation:rkxSube .6s cubic-bezier(.2,1.3,.4,1) both;animation-delay:var(--d)}
  @keyframes rkxSube{from{transform:translateY(40px);opacity:0}}
  .rkx-pd b{font:800 13px/1.2 Poppins,system-ui,sans-serif;color:var(--ink,#131218);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rkx-pd small{font-size:11px;color:var(--stone,#5B6B8C)}
  .rkx-pd.oro .rkx-av{width:92px;height:92px;box-shadow:0 0 0 4px #FFD200,0 0 30px rgba(255,210,0,.6)}
  .rkx-pd.plata .rkx-av{box-shadow:0 0 0 4px #CBD5E1}.rkx-pd.bronce .rkx-av{box-shadow:0 0 0 4px #D6975B}
  .rkx-pd.yo b{color:#1E5BD7}
  .rkx-corona{position:absolute;top:-24px;font-size:30px;animation:rkxCorona 2s ease-in-out infinite}
  @keyframes rkxCorona{50%{transform:translateY(-4px) rotate(8deg)}}
  .rkx-base{display:grid;justify-items:center;gap:2px;width:100%;padding:10px 4px 12px;border-radius:14px 14px 6px 6px;color:#fff}
  .rkx-base em{font-style:normal;font-size:22px}.rkx-base i{font:800 12px/1 Inter,system-ui,sans-serif;font-style:normal}
  .oro .rkx-base{min-height:96px;background:linear-gradient(180deg,#FFD200,#E0A800);color:#0B2D74}
  .plata .rkx-base{min-height:72px;background:linear-gradient(180deg,#94A3B8,#64748B)}
  .bronce .rkx-base{min-height:56px;background:linear-gradient(180deg,#D6975B,#A86532)}
  .rkx-pd.vacio{visibility:hidden}
  .rkx-l{list-style:none;margin:0;padding:0;display:grid;gap:8px}
  .rkx-f{display:grid;grid-template-columns:32px 40px 1fr auto auto;gap:10px;align-items:center;padding:10px 12px;border-radius:18px;background:var(--raise,#fff);box-shadow:inset 0 0 0 1px var(--line,#E2E6EF);animation:rkxEntra .4s ease-out both}
  @keyframes rkxEntra{from{transform:translateX(-16px);opacity:0}}
  .rkx-f.yo{box-shadow:inset 0 0 0 2px #1E5BD7;background:linear-gradient(90deg,rgba(30,91,215,.08),var(--raise,#fff))}
  .rkx-pos{font:900 16px/1 Poppins,system-ui,sans-serif;color:var(--stone,#5B6B8C);text-align:center}
  .rkx-n{display:grid;gap:6px;min-width:0}.rkx-n b{font:800 14px/1.2 Poppins,system-ui,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rkx-n em{font-style:normal;font-size:11px;padding:2px 6px;border-radius:99px;background:#1E5BD7;color:#fff;margin-left:4px}
  .rkx-bar{display:block;height:6px;border-radius:9px;background:var(--line,#E6EBF5)}.rkx-bar i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#1E5BD7,#60A5FA)}
  .rkx-lv{padding:3px 8px;border-radius:999px;background:rgba(255,210,0,.2);color:#8A6D00;font:800 11px/1.2 Inter,system-ui,sans-serif}
  .rkx-xp{font:900 15px/1 Poppins,system-ui,sans-serif;text-align:right}.rkx-xp small{display:block;font:700 10px/1.4 Inter,system-ui,sans-serif;color:var(--stone,#5B6B8C)}
  .rkx-fijo{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(588px,calc(100% - 32px));list-style:none;z-index:2;transition:transform .25s,opacity .25s}
  .rkx-fijo .rkx-f{background:var(--raise,#fff);box-shadow:0 14px 30px -12px rgba(11,45,116,.7),inset 0 0 0 2px #1E5BD7;animation:none}
  .rkx-fijo.oculto{transform:translate(-50%,120%);opacity:0}
  .rkx-vacio{display:grid;justify-items:center;gap:8px;text-align:center;padding:24px 12px}
  .rkx-vacio span{width:110px;height:110px;display:grid;place-items:center}.rkx-vacio svg{width:100%;height:100%}
  .rkx-vacio b{font:800 18px/1.3 Poppins,system-ui,sans-serif}.rkx-vacio p{margin:0;color:var(--stone,#5B6B8C);max-width:360px}
  .rkx-btn{all:unset;cursor:pointer;padding:12px 18px;border-radius:14px;background:#1E5BD7;color:#fff;font:800 14px/1 Poppins,system-ui,sans-serif}
  .rkx-cargando{display:flex;justify-content:center;gap:8px;padding:40px}.rkx-cargando i{width:12px;height:12px;border-radius:50%;background:#1E5BD7;animation:rkxPunto 1s ease-in-out infinite}
  .rkx-cargando i:nth-child(2){animation-delay:.15s}.rkx-cargando i:nth-child(3){animation-delay:.3s}
  @keyframes rkxPunto{50%{transform:translateY(-10px);opacity:.4}}
  :root[data-theme=dark] .rkx-lv{color:#FFD866}
  @media (prefers-color-scheme:dark){:root:not([data-theme=light]) .rkx-lv{color:#FFD866}}
  /* tarjeta del Inicio con el mismo estilo */
  .plx53-w .rkw-h b{font:800 1.1rem/1.2 Poppins,system-ui,sans-serif}
  .plx53-w .rkw-t,.plx53-w .rkw-s{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
  .plx53-w .rkw-t button,.plx53-w .rkw-s button{all:unset;cursor:pointer;padding:7px 12px;border-radius:999px;font:700 12.5px/1 Inter,system-ui,sans-serif;box-shadow:inset 0 0 0 1.5px var(--line,#D5DCEA);color:var(--stone,#5B6B8C)}
  .plx53-w .rkw-t button[aria-selected=true]{background:#1E5BD7;color:#fff;box-shadow:none}
  .plx53-w .rkw-s button[aria-pressed=true]{background:#FFD200;color:#0B2D74;box-shadow:none}
  .plx53-w .rkw-l{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:6px;counter-reset:rk}
  .plx53-w .rkw-f{display:grid;grid-template-columns:28px 34px 1fr auto;gap:10px;align-items:center;padding:8px 10px;border-radius:14px;background:var(--surf2,#F6F8FC)}
  .plx53-w .rkw-f:nth-child(1) .rkw-p::before{content:"🥇"}.plx53-w .rkw-f:nth-child(2) .rkw-p::before{content:"🥈"}.plx53-w .rkw-f:nth-child(3) .rkw-p::before{content:"🥉"}
  .plx53-w .rkw-f:nth-child(-n+3) .rkw-p{font-size:0}.plx53-w .rkw-f:nth-child(-n+3) .rkw-p::before{font-size:20px}
  .plx53-w .rkw-p{font:900 15px/1 Poppins,system-ui,sans-serif;text-align:center;color:var(--stone,#5B6B8C)}
  .plx53-w .rkw-a{width:34px;height:34px;border-radius:50%;overflow:hidden;background:#fff;display:grid;place-items:center}.plx53-w .rkw-a svg{width:100%;height:100%}
  .plx53-w .rkw-f.yo{box-shadow:inset 0 0 0 2px #1E5BD7}
  .plx53-w .rkw-x{font:800 13px/1 Poppins,system-ui,sans-serif}
  @media (prefers-reduced-motion:reduce){.rkx-trofeo,.rkx-corona,.rkx-pd,.rkx-f,.rkx-cargando i{animation:none!important}}
  `;
  document.head.appendChild(st);
})();
