/* PLEX PLAY 1.26.0 — Entrar con Google y rankings
   - Login: botón «Continuar con Google» en la pantalla de acceso, para cualquier cuenta de Google (no solo
     @unipamplona). El perfil (gato, XP, nivel, racha y estadísticas) se crea como con cualquier cuenta nueva.
     Al volver de Google, la sesión llega en la dirección (#access_token… o ?code=…): aquí se guarda y se
     recarga la app ya con la sesión puesta (backend.js tiene detectSessionInUrl:false).
     En la app de Android (WebView) Google no deja iniciar sesión dentro de la app: ahí el botón no aparece
     hasta que la app de Android abra el acceso en el navegador.
   - Una sola vez, a quien no es de Unipamplona se le pregunta si es estudiante (para el ranking de estudiantes).
   - Rankings (pestaña Retos): Universidad de Pamplona, Estudiantes y Global; semana, mes e histórico. Muestra
     posición, gato, apodo, nivel y XP. Los datos salen de la función plx_ranking del servidor
     (herramientas/supabase/02-rankings.sql), que nunca devuelve correos ni ids.
   - Si el servidor todavía no tiene esas funciones, la app lo dice y sigue funcionando igual. */
(function(){
  "use strict";
  if (!window.PCB || !PCB.enabled || !PCB.sb) return;
  var sb = PCB.sb;
  var esc = function(x){ return String(x == null ? "" : x).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var EN_WEBVIEW = /; wv\)|PlexPlayAndroid/.test(navigator.userAgent);
  var limpia = function(){ return location.origin + location.pathname; };

  /* ---------------- vuelta desde Google ---------------- */
  (function(){
    var h = new URLSearchParams(location.hash.replace(/^#/, "")), q = new URLSearchParams(location.search);
    var fin = function(){ try { history.replaceState(null, "", limpia()); } catch (e) {} location.replace(limpia()); };
    if (h.get("access_token") && h.get("refresh_token")) {
      sb.auth.setSession({ access_token: h.get("access_token"), refresh_token: h.get("refresh_token") }).then(fin, fin);
    } else if (q.get("code") && sb.auth.exchangeCodeForSession) {
      sb.auth.exchangeCodeForSession(q.get("code")).then(fin, fin);
    } else if (h.get("error_description") || q.get("error_description")) {
      var m = h.get("error_description") || q.get("error_description");
      try { history.replaceState(null, "", limpia()); } catch (e) {}
      setTimeout(function(){ try { toast(/Solo se admiten|Database error/i.test(m) ? "Tu cuenta de Google todavía no está habilitada. Pide que se active el acceso con Google." : "No se pudo entrar con Google. Inténtalo de nuevo."); } catch (e) {} }, 800);
    }
  })();

  PCB.google = function(){
    return sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: limpia(), queryParams: { prompt: "select_account" } } });
  };

  /* ---------------- botón en la pantalla de acceso ---------------- */
  var G_LOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-16.7z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.4-5.7c-2 1.4-4.7 2.3-7.8 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>';
  var ponBoton = function(){
    var box = document.querySelector(".pclogin .pl-box") || document.querySelector(".pclogin");
    /* Manzana es el gato (la descripción de la imagen decía «la gata») */
    document.querySelectorAll('.pclogin img[alt*="la gata"]').forEach(function(i){ i.alt = i.alt.replace("la gata", "el gato"); });
    if (!box || box.querySelector(".plx53-g") || EN_WEBVIEW) return;
    document.querySelectorAll(".pclogin p, .pclogin h2, .pclogin span").forEach(function(p){
      if (p.children.length === 0 && /^Ingresa con tu correo institucional/.test(p.textContent.trim())) p.textContent = "Entra con tu cuenta de Google o con tu correo institucional.";
    });
    var form = box.querySelector("form") || box.querySelector(".gfield");
    var html = '<div class="plx53-g"><button type="button" class="plx53-gb" data-plx53="google">' + G_LOGO + "<span>Continuar con Google</span></button>" +
      '<p class="plx53-gn">Cualquier cuenta de Google. Con el correo @unipamplona también entras al ranking de la universidad.</p>' +
      '<p class="plx53-o"><span>o con tu correo institucional</span></p></div>';
    if (form) (form.closest("label") || form).insertAdjacentHTML("beforebegin", html);
    else box.insertAdjacentHTML("afterbegin", html);
  };
  new MutationObserver(ponBoton).observe(document.body, { childList: true, subtree: true });
  ponBoton();
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-plx53=google]"); if (!b) return;
    e.preventDefault(); e.stopPropagation(); b.disabled = true;
    PCB.google().then(function(r){ if (r && r.error) throw r.error; }).catch(function(){ b.disabled = false; try { toast("No se pudo abrir Google. Revisa tu conexión."); } catch (x) {} });
  }, true);

  /* ---------------- ¿es estudiante? (una vez) ---------------- */
  var ambito = null;
  var miAmbito = function(){
    if (ambito) return Promise.resolve(ambito);
    return sb.rpc("plx_mi_ambito").then(function(r){ if (r.error) throw r.error; ambito = (r.data && r.data[0]) || { unipamplona: false, estudiante: null }; return ambito; });
  };
  var pregunta = function(){
    if (!PCB.uid) return;
    try { if (localStorage.getItem("plx53-est-" + PCB.uid)) return; } catch (e) {}
    miAmbito().then(function(a){
      if (a.unipamplona || a.estudiante !== null && a.estudiante !== undefined) return;
      var m = document.createElement("div"); m.className = "plx53-m"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true");
      m.innerHTML = '<div class="plx53-mc"><h2>¿Eres estudiante?</h2><p>Para el ranking de estudiantes (de cualquier institución). Solo se guarda sí o no.</p>' +
        '<div class="plx53-mb"><button data-plx53="est-si">Sí, estudio</button><button data-plx53="est-no" class="no">No</button></div></div>';
      document.body.appendChild(m);
      m.addEventListener("click", function(e){
        var b = e.target.closest("[data-plx53]"); if (!b) return;
        var si = b.dataset.plx53 === "est-si";
        sb.rpc("plx_soy_estudiante", { si: si }).then(function(){ ambito.estudiante = si; });
        try { localStorage.setItem("plx53-est-" + PCB.uid, "1"); } catch (x) {}
        m.remove();
      });
    }).catch(function(){ /* el servidor aún no tiene las funciones nuevas */ });
  };
  (PCB.ready || Promise.resolve()).then(function(s){ if (s) setTimeout(pregunta, 2500); });

  /* ---------------- rankings ---------------- */
  var AMB = [["unipamplona", "Unipamplona"], ["estudiantes", "Estudiantes"], ["global", "Global"]];
  var PER = [["semana", "Semana"], ["mes", "Mes"], ["total", "Histórico"]];
  var R = { amb: "global", per: "semana", cache: {} };
  var gato = function(av){ try { if (typeof catSVG === "function") return catSVG(av && typeof av === "object" ? av : {}, { mood: "happy" }); } catch (e) {} return ""; };
  var fila = function(x){
    return '<li class="rk-f' + (x.soy_yo ? " yo" : "") + '"><span class="rk-p">' + x.posicion + '</span><span class="rk-a" aria-hidden="true">' + gato(x.avatar) + "</span>" +
      '<span class="rk-n"><b>' + esc(x.nick) + (x.soy_yo ? " <em>tú</em>" : "") + "</b><small>Nivel " + esc(x.nivel || "1") + "</small></span>" +
      '<span class="rk-x">' + Number(x.xp || 0).toLocaleString("es-CO") + "<small>XP</small></span></li>";
  };
  var pinta = function(el){
    var k = R.amb + "|" + R.per, d = R.cache[k], lista = el.querySelector(".rk-l");
    el.querySelectorAll("[data-plx53-amb]").forEach(function(b){ b.setAttribute("aria-selected", String(b.dataset.plx53Amb === R.amb)); });
    el.querySelectorAll("[data-plx53-per]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.dataset.plx53Per === R.per)); });
    var nota = { unipamplona: "Solo cuentas @unipamplona.edu.co.", estudiantes: "Estudiantes de cualquier institución.", global: "Todos los usuarios de PLEX PLAY." }[R.amb] +
      " " + { semana: "XP ganado desde el lunes.", mes: "XP ganado este mes.", total: "XP de siempre." }[R.per];
    el.querySelector(".rk-nota").textContent = nota;
    if (!d) { lista.innerHTML = '<li class="rk-v">Cargando…</li>'; return; }
    if (d.error) { lista.innerHTML = '<li class="rk-v">' + esc(d.error) + "</li>"; return; }
    if (!d.filas.length) { lista.innerHTML = '<li class="rk-v">Todavía nadie tiene XP en este ranking. ¡Sé el primero!</li>'; return; }
    var top = d.filas.filter(function(x){ return x.posicion <= 50; }), yo = d.filas.filter(function(x){ return x.soy_yo && x.posicion > 50; });
    lista.innerHTML = top.map(fila).join("") + (yo.length ? '<li class="rk-sep" aria-hidden="true">···</li>' + yo.map(fila).join("") : "");
  };
  var carga = function(el){
    var k = R.amb + "|" + R.per; pinta(el);
    if (R.cache[k] && !R.cache[k].error && Date.now() - R.cache[k].t < 60000) return;
    sb.rpc("plx_ranking", { ambito: R.amb, periodo: R.per, cuantos: 50 }).then(function(r){
      if (r.error) throw r.error;
      R.cache[k] = { t: Date.now(), filas: r.data || [] };
    }).catch(function(e){
      R.cache[k] = { t: Date.now(), error: /function|does not exist|404|PGRST202/i.test(String(e && (e.message || e.code))) ?
        "Los rankings se activan cuando se actualice el servidor. Pronto." : navigator.onLine === false ? "Sin conexión: los rankings necesitan internet." : "No se pudo cargar el ranking. Inténtalo de nuevo." };
    }).then(function(){ if (document.body.contains(el)) pinta(el); });
  };
  var abre = function(){
    var el = window.PLXG && PLXG.abrir ? PLXG.abrir() : null; if (!el) return;
    el.innerHTML = '<div class="plxg-scroll"><div class="plxg-wrap rk">' +
      '<div class="hb-top"><button class="plxg-ib" data-plx53="cerrar" aria-label="Cerrar los rankings"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg></button><span class="plxg-k">PLEX PLAY</span></div>' +
      '<h1 class="plxg-h">Rankings</h1><p class="hb-lead">Solo se ven apodos, gatos, niveles y XP. Nunca correos ni nombres completos.</p>' +
      '<div class="rk-t" role="tablist" aria-label="Ranking">' + AMB.map(function(a){ return '<button role="tab" data-plx53-amb="' + a[0] + '">' + a[1] + "</button>"; }).join("") + "</div>" +
      '<div class="rk-s" role="group" aria-label="Periodo">' + PER.map(function(p){ return '<button data-plx53-per="' + p[0] + '">' + p[1] + "</button>"; }).join("") + "</div>" +
      '<p class="rk-nota"></p><ol class="rk-l"></ol></div></div>';
    el.onclick = function(e){
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.plx53 === "cerrar") return PLXG.cerrar();
      if (b.dataset.plx53Amb) { R.amb = b.dataset.plx53Amb; carga(el); }
      if (b.dataset.plx53Per) { R.per = b.dataset.plx53Per; carga(el); }
    };
    miAmbito().then(function(a){ if (a.unipamplona && R.amb === "global" && !R.visto) { R.amb = "unipamplona"; R.visto = 1; carga(el); } }).catch(function(){});
    carga(el);
  };
  PCB.rankings = abre;

  /* tarjeta en Retos, debajo del Arcade */
  var tarjeta = function(){
    var v = document.getElementById("view"), sec = v && v.querySelector(".gretos"); if (!sec || sec.querySelector(".plx53-rk")) return;
    var ar = sec.querySelector(".plx46-arc");
    var html = '<button class="plx53-rk" data-plx53="rankings"><span class="k-i" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M8 34h24M12 34V22h6v12M18 34V12h6v22M24 34V17h6v17" stroke="#FFD200" stroke-width="2.4" fill="none" stroke-linejoin="round"/></svg></span>' +
      '<span class="k-t"><b>Rankings</b><span>Unipamplona · Estudiantes · Global · semana, mes e histórico</span></span><span class="k-go" aria-hidden="true">›</span></button>';
    if (ar) ar.insertAdjacentHTML("afterend", html);
  };
  if (typeof render === "function") { var _r = render; render = function(){ var x = _r.apply(this, arguments); try { if (view === "retos") tarjeta(); } catch (e) {} return x; }; }
  document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest("[data-plx53=rankings]"); if (!b) return; e.preventDefault(); abre(); });
  var repinta = function(){ try { if (view === "retos") tarjeta(); } catch (e) {} };
  if (document.readyState === "complete") repinta(); else window.addEventListener("load", repinta);

  var st = document.createElement("style"); st.id = "plx53";
  st.textContent = `
  .plx53-g{display:grid;gap:8px;margin:0 0 14px}
  .plx53-gb{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;min-height:50px;padding:0 18px;border-radius:14px;
    background:#fff;color:#1F1F1F;font:600 16px/1 Inter,system-ui,sans-serif;box-shadow:inset 0 0 0 1.5px #D0D7E4}
  .plx53-gb svg{width:22px;height:22px}
  .plx53-gb:focus-visible{outline:3px solid #1E5BD7;outline-offset:2px}
  .plx53-gb[disabled]{opacity:.6}
  .plx53-gn{margin:0;font-size:12.5px;line-height:1.4;color:#4B5E8C;text-align:center}
  .plx53-o{margin:6px 0 0;display:flex;align-items:center;gap:10px;font-size:12px;color:#6B7A9E}
  .plx53-o::before,.plx53-o::after{content:"";flex:1;height:1px;background:#D0D7E4}
  .plx53-m{position:fixed;inset:0;z-index:2147483100;display:grid;place-items:center;padding:16px;background:rgba(4,14,40,.6)}
  .plx53-mc{width:min(380px,100%);background:#fff;color:#0B2D74;border-radius:20px;padding:22px 20px;box-shadow:0 24px 50px -18px rgba(0,0,0,.6)}
  .plx53-mc h2{margin:0 0 6px;font:800 22px/1.2 Poppins,system-ui,sans-serif}
  .plx53-mc p{margin:0 0 16px;color:#34456E;font-size:14.5px;line-height:1.45}
  .plx53-mb{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .plx53-mb button{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;min-height:48px;border-radius:12px;background:#0B2D74;color:#fff;font:700 15px/48px Poppins,system-ui,sans-serif}
  .plx53-mb button.no{background:#EAF1FF;color:#0B2D74}
  .plx53-rk{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;width:100%;margin:6px 0 6px;padding:14px 18px;border-radius:22px;
    background:#081F55;color:#fff;box-shadow:inset 0 0 0 1px rgba(147,197,253,.28)}
  .plx53-rk:focus-visible{outline:3px solid #FFD200;outline-offset:3px}
  .plx53-rk .k-i svg{width:40px;height:40px;display:block}
  .plx53-rk .k-t{display:grid;gap:3px;min-width:0}
  .plx53-rk b{font:800 20px/1 Poppins,system-ui,sans-serif;text-transform:uppercase;color:#fff}
  .plx53-rk .k-t>span{font-size:13px;line-height:1.4;color:#DCE6FF}
  .plx53-rk .k-go{font:800 26px/1 Poppins,system-ui,sans-serif;color:#FFD200}
  .rk-t{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:16px 0 10px;padding:4px;border-radius:14px;background:rgba(255,255,255,.06)}
  .rk-t button,.rk-s button{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;min-height:44px;border-radius:11px;font:700 14px/44px Inter,system-ui,sans-serif;color:#C9D6F5}
  .rk-t button[aria-selected=true]{background:#FFD200;color:#081F55}
  .rk-s{display:flex;gap:8px}
  .rk-s button{flex:1;min-height:38px;line-height:38px;font-size:13px;box-shadow:inset 0 0 0 1.5px #2A4A8E}
  .rk-s button[aria-pressed=true]{background:#1E5BD7;color:#fff;box-shadow:none}
  .rk-t button:focus-visible,.rk-s button:focus-visible{outline:3px solid #93C5FD;outline-offset:2px}
  .rk-nota{margin:12px 0 8px;font-size:13px;color:#A6B6E0}
  .rk-l{list-style:none;margin:0;padding:0;display:grid;gap:6px}
  .rk-f{display:grid;grid-template-columns:34px 44px 1fr auto;align-items:center;gap:10px;padding:8px 12px;border-radius:14px;background:rgba(255,255,255,.06)}
  .rk-f:nth-child(1) .rk-p{color:#FFD200}.rk-f:nth-child(2) .rk-p{color:#DCE6FF}.rk-f:nth-child(3) .rk-p{color:#FFB077}
  .rk-f.yo{background:rgba(255,210,0,.14);box-shadow:inset 0 0 0 1.5px #FFD200}
  .rk-p{font:800 18px/1 Poppins,system-ui,sans-serif;text-align:center;color:#fff}
  .rk-a{width:44px;height:44px;border-radius:50%;overflow:hidden;background:#0E2560;display:block}
  .rk-a svg{width:100%;height:100%;display:block}
  .rk-n{display:grid;gap:2px;min-width:0}
  .rk-n b{font:700 15px/1.25 Poppins,system-ui,sans-serif;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rk-n em{font-style:normal;font-size:11px;color:#081F55;background:#FFD200;border-radius:6px;padding:1px 6px;margin-left:4px;vertical-align:2px}
  .rk-n small{font-size:12px;color:#A6B6E0}
  .rk-x{font:800 16px/1 Poppins,system-ui,sans-serif;color:#FFD200;text-align:right;font-variant-numeric:tabular-nums}
  .rk-x small{display:block;font:600 10px/1.4 Inter,system-ui,sans-serif;letter-spacing:.1em;color:#A6B6E0}
  .rk-v{padding:18px 12px;text-align:center;color:#C9D6F5;background:rgba(255,255,255,.05);border-radius:14px}
  .rk-sep{text-align:center;color:#6B7A9E;letter-spacing:.3em}
  `;
  document.head.appendChild(st);
})();
