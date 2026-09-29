/* PLEX PLAY 2.6.0 — Grammar Run como un runner de verdad
   - Manzana corre por el muelle del Sena (París al fondo, con paralaje). Las respuestas llegan por la derecha,
     una por carril; hay que ponerse en el carril de la correcta antes de que llegue.
   - Animaciones de la hoja de sprites: carrera (5 cuadros), salto al acertar, celebración, mareo al fallar.
     Obstáculos y palomas de decoración, monedas que recoge en el carril bueno, polvo, estrellas y combos.
   - Controles: ← → o ↑ ↓ (y W / S) cambian de carril; Espacio acelera (más puntos si aciertas). En el celular:
     tocar un carril, deslizar arriba o abajo, o los botones.
   - Más tiempo por pregunta que antes. Respeta «reducir movimiento». */
(function(){
  "use strict";
  var G = window.PLXG; if (!G || !G.juegos || !G.juegos.gr) return;
  var esc = G.esc, mezcla = G.mezcla, norm = G.norm;
  var IMG = "img/runner/";
  var fx = function(n){ try { if (G.fx) G.fx(n); } catch (e) {} };
  var chispas = function(s, x, y, o){ try { if (s.efectos) s.efectos.estalla(x, y, o); } catch (e) {} };
  var suena = function(t){ if (!t) return; try { var p = speak(t); if (p && p.catch) p.catch(function(){}); } catch (e) {} };
  var calla = function(){ try { if (typeof stopAudio === "function") stopAudio(); } catch (e) {} };
  var entre = function(a, x, b){ return Math.max(a, Math.min(b, x)); };
  var BOCINA = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  var PROPS = ["jardinera", "basura", "paloma", "maletas", "caja", "cono", "valla"];
  var tactil = function(){ try { return matchMedia("(pointer:coarse)").matches; } catch (e) { return false; } };

  function motorRunner(zona, s){
    zona.innerHTML =
      '<div class="x56 rn"><div class="rn-escena">' +
        '<div class="rn-cielo"><i class="rn-nube a"></i><i class="rn-nube b"></i></div><div class="rn-paris"></div>' +
        '<div class="rn-muelle"><div class="rn-losas"></div><div class="rn-carriles"></div></div>' +
        '<div class="rn-capa"></div>' +
        '<div class="rn-gato" aria-hidden="true"><i class="rn-sombra"></i><i class="rn-spr"></i></div>' +
        '<div class="rn-reloj" aria-hidden="true"><span>⏱️</span><b><i></i></b></div>' +
        '<div class="rn-aviso" aria-live="polite"></div>' +
      "</div>" +
      '<div class="rn-mandos"><button type="button" data-rn="-1" aria-label="Carril de arriba">↑</button>' +
        '<p class="x-nota rn-nota"></p>' +
        '<button type="button" data-rn="1" aria-label="Carril de abajo">↓</button>' +
        '<button type="button" class="rn-turbo" data-rn-turbo aria-label="Acelerar">⏩</button></div></div>';
    var raiz = zona.firstChild, esc_ = raiz.querySelector(".rn-escena"), paris = raiz.querySelector(".rn-paris"), losas = raiz.querySelector(".rn-losas"),
      carrilesEl = raiz.querySelector(".rn-carriles"), capa = raiz.querySelector(".rn-capa"), gato = raiz.querySelector(".rn-gato"), spr = raiz.querySelector(".rn-spr"),
      reloj = raiz.querySelector(".rn-reloj i"), aviso = raiz.querySelector(".rn-aviso"), nota = raiz.querySelector(".rn-nota"), muelle = raiz.querySelector(".rn-muelle");
    var reto = null, ops = [], n = 3, carril = 1, T = 0, t = 0, tReal = 0, hecho = false, cierre = -1, turbo = 0, dist = 0;
    var W = 0, H = 0, top0 = 0, hc = 0, gx = 0, cartas = [], props = [], monedas = [], sigProp = 1.2, estadoGato = "corre", tGato = 0, toque = null;

    var mide = function(){
      raiz.style.paddingTop = (s.techo() + 6) + "px";
      W = esc_.clientWidth || 360; H = esc_.clientHeight || 300;
      top0 = Math.round(H * .40); hc = (H - top0) / n;
      var gh = Math.round(entre(52, Math.min(hc * 1.1, W * .2), 118)), gw = Math.round(gh * 1.3);
      gato.style.width = gw + "px"; gato.style.height = gh + "px";
      gx = Math.max(Math.round(W * .17), Math.round(gw / 2) + 6);
      carrilesEl.innerHTML = ""; for (var i = 1; i < n; i++) carrilesEl.insertAdjacentHTML("beforeend", '<i style="top:' + (i / n * 100) + '%"></i>');
      ponGato(true); colocaCartas();
    };
    var yCarril = function(k){ return top0 + hc * (k + .5); };
    var escala = function(k){ return n > 1 ? .84 + .16 * k / (n - 1) : 1; };
    var ponGato = function(sin){
      var y = yCarril(carril), sc = escala(carril);
      if (sin) gato.style.transition = "none";
      gato.style.transform = "translate(" + (gx - gato.offsetWidth / 2) + "px," + Math.round(y - gato.offsetHeight * .82) + "px) scale(" + sc.toFixed(3) + ")";
      gato.style.zIndex = 20 + carril * 2 + 1;
      if (sin) { void gato.offsetWidth; gato.style.transition = ""; }
    };
    var pose = function(p, dur){
      estadoGato = p; tGato = dur || 0;
      spr.className = "rn-spr " + p;
    };
    var ponCarril = function(k){
      if (!reto || hecho || s.estado() !== "juega") return;
      k = entre(0, k, n - 1); if (k === carril) return;
      carril = k; ponGato(); fx("barrido");
      gato.classList.remove("hop"); void gato.offsetWidth; gato.classList.add("hop");
      cartas.forEach(function(c, i){ c.el.classList.toggle("sel", i === carril); });
    };

    /* ---- cartas de respuesta ---- */
    var colocaCartas = function(){
      var p = T ? t / T : 0;
      cartas.forEach(function(c, i){
        /* entran rápido desde fuera y quedan a la vista en el borde derecho; luego avanzan hacia Manzana */
        var cw = c.el.offsetWidth || 120, x0 = W - cw - 10, x1 = gx + 28, entra = Math.max(0, 1 - tReal / .35) * (cw + 40);
        var x = x0 + (x1 - x0) * Math.min(1, p) + entra - (c.sale || 0);
        var y = yCarril(i), sc = escala(i);
        c.el.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y - c.el.offsetHeight / 2) + "px) scale(" + sc.toFixed(3) + ")";
        c.el.style.zIndex = 20 + i * 2;
      });
    };
    var limpiaCartas = function(){ cartas.forEach(function(c){ c.el.remove(); }); cartas = []; };

    /* ---- decoración: props al fondo del muelle y monedas en el carril ---- */
    var nuevoProp = function(){
      var nm = PROPS[Math.floor(Math.random() * PROPS.length)], el = document.createElement("img");
      el.src = IMG + nm + ".webp"; el.alt = ""; el.className = "rn-prop " + nm; el.draggable = false;
      capa.appendChild(el); props.push({ el: el, x: W + 40, nm: nm, vuela: false });
    };
    var nuevasMonedas = function(k){
      for (var i = 0; i < 4; i++) {
        var el = document.createElement("img"); el.src = IMG + (i === 3 ? "estrella" : "moneda") + ".webp"; el.alt = ""; el.className = "rn-moneda"; el.draggable = false;
        capa.appendChild(el); monedas.push({ el: el, x: W + 30 + i * 46, k: k });
      }
    };
    var mueveDeco = function(dx){
      var yb = top0 - 4;
      props = props.filter(function(p){
        p.x -= dx * .92;
        if (p.nm === "paloma" && !p.vuela && p.x < gx + 90) { p.vuela = true; p.el.classList.add("vuela"); }
        if (p.x < -90) { p.el.remove(); return false; }
        p.el.style.transform = "translate(" + Math.round(p.x) + "px," + Math.round(yb - p.el.offsetHeight) + "px)";
        return true;
      });
      monedas = monedas.filter(function(m){
        m.x -= dx;
        var y = yCarril(m.k) - 34;
        if (!m.cogida && m.k === carril && Math.abs(m.x - gx) < 26) {
          m.cogida = true; m.el.classList.add("cogida"); fx("brillo");
          var pm = aSesion(m.x, y + 10); chispas(s, pm.x, pm.y, { n: 8, cols: ["#FFD200", "#fff"], v: 180, s: 3 });
          setTimeout(function(){ m.el.remove(); }, 300);
          return false;
        }
        if (m.x < -40) { m.el.remove(); return false; }
        m.el.style.transform = "translate(" + Math.round(m.x - 14) + "px," + Math.round(y) + "px)";
        m.el.style.zIndex = 20 + m.k * 2;
        return true;
      });
    };
    var polvo = function(){
      if (s.mov) return;
      var d = document.createElement("i"); d.className = "rn-polvo";
      d.style.transform = "translate(" + (gx - 34) + "px," + Math.round(yCarril(carril) - 6) + "px)";
      capa.appendChild(d); setTimeout(function(){ d.remove(); }, 600);
    };

    /* de coordenadas de la escena a coordenadas de la sesión (efectos y puntos) */
    var aSesion = function(x, y){ var a = esc_.getBoundingClientRect(), b = s.el.getBoundingClientRect(); return { x: x + a.left - b.left, y: y + a.top - b.top }; };
    var avisa = function(txt, cls){
      aviso.className = "rn-aviso " + (cls || ""); aviso.textContent = txt;
      void aviso.offsetWidth; aviso.classList.add("on");
    };

    var juzga = function(){
      hecho = true; turbo = 0; raiz.classList.remove("turbo");
      var o = ops[carril], p = aSesion(gx, yCarril(carril) - 40);
      cartas.forEach(function(c, i){ c.el.classList.add(ops[i].ok ? "bien" : "mal"); });
      if (o.ok) {
        pose("salta", .6); fx("atrapa");
        chispas(s, p.x + 30, p.y, { n: 26, cols: ["#FFD200", "#34D399", "#fff"], v: 420, s: 5 });
        s.acierto(reto, { rapidez: Math.max(0, 1 - tReal / T), x: p.x, y: p.y });
        avisa(["Bravo !", "Parfait !", "Excellent !", "Super !"][Math.floor(Math.random() * 4)], "ok");
        nuevasMonedas(carril);
        cierre = .75; return;
      }
      pose("mareo", 1.2); fx("pierde");
      esc_.classList.remove("temblor"); void esc_.offsetWidth; esc_.classList.add("temblor");
      chispas(s, p.x + 20, p.y + 20, { n: 14, cols: ["#E5484D", "#FFB3B8"], v: 260, s: 4 });
      s.fallo(reto, { mal: o.t, etMal: "Ibas por", etiqueta: "Correcta", bien: reto.correcta[0] }).then(function(){ limpia(); s.listo(); });
    };
    var limpia = function(){ reto = null; limpiaCartas(); reloj.style.transform = "scaleX(1)"; if (estadoGato !== "corre") pose("corre"); };

    /* ---- entrada ---- */
    var carrilDeY = function(clientY){ var r = esc_.getBoundingClientRect(), y = clientY - r.top; return y < top0 ? null : entre(0, Math.floor((y - top0) / hc), n - 1); };
    var abajo = function(e){ if (esc_.contains(e.target)) toque = { y: e.clientY, x: e.clientX, id: e.pointerId }; };
    var arriba = function(e){
      if (!toque || e.pointerId !== toque.id) return;
      var dy = e.clientY - toque.y, dx = e.clientX - toque.x; toque = null;
      if (Math.abs(dy) > 28 && Math.abs(dy) > Math.abs(dx)) { ponCarril(carril + (dy > 0 ? 1 : -1)); return; }
      if (Math.abs(dx) > 40 && dx > 0) { acelera(); return; }
      var k = carrilDeY(e.clientY); if (k != null) ponCarril(k);
    };
    var acelera = function(){ if (!reto || hecho || s.estado() !== "juega") return; turbo = .7; raiz.classList.add("turbo"); fx("motor"); };
    var clic = function(e){
      var b = e.target.closest && e.target.closest("[data-rn]");
      if (b) { e.preventDefault(); ponCarril(carril + +b.dataset.rn); return; }
      if (e.target.closest && e.target.closest("[data-rn-turbo]")) { e.preventDefault(); acelera(); }
    };
    var oir = function(e){ var b = e.target.closest && e.target.closest("[data-rn-oir]"); if (b && reto && reto.audio) { e.preventDefault(); suena(reto.audio); } };
    zona.addEventListener("click", clic); esc_.addEventListener("pointerdown", abajo); window.addEventListener("pointerup", arriba);
    s.el.addEventListener("click", oir); window.addEventListener("resize", mide);
    requestAnimationFrame(mide);
    pose("corre");
    nota.textContent = tactil() ? "Toca un carril o desliza ↑ ↓ · ⏩ acelera" : "← → o ↑ ↓ cambian de carril · Espacio acelera";

    return {
      jugar: function(r){
        reto = r; hecho = false; cierre = -1; t = 0; tReal = 0; turbo = 0;
        ops = G.opcionesReto ? G.opcionesReto(r, 3, s.nivel) : mezcla([{ t: r.correcta[0], ok: true }].concat((r.malas || []).slice(0, 2).map(function(x){ return { t: x, ok: false }; })));
        var nNuevo = ops.length; if (nNuevo !== n) { n = nNuevo; mide(); }
        carril = Math.min(carril, n - 1); ponGato(true);
        /* más tiempo que el Grammar Run anterior: hay que leer y moverse */
        T = s.dir.t() * 1.15 + 3.6 + (r.audio ? 1.8 : 0);
        limpiaCartas();
        cartas = ops.map(function(o, i){
          var el = document.createElement("div"); el.className = "rn-carta" + (i === carril ? " sel" : ""); el.setAttribute("lang", "fr");
          el.innerHTML = "<span>" + esc(o.t) + "</span>"; capa.appendChild(el); return { el: el, o: o };
        });
        colocaCartas();
        s.banner('<p class="plxg-ask">' + esc(r.ask || "Elige la respuesta") + "</p>" +
          (r.q ? '<p class="plxg-q" lang="fr">' + esc(r.q).replace(/_{2,}/, '<span class="hueco">___</span>') + "</p>" : "") +
          (r.audio ? '<button type="button" class="x-oir" data-rn-oir aria-label="Escuchar otra vez">' + BOCINA + "<span>Escuchar</span></button>" : ""), { oro: r.oro });
        mide();
        if (r.audio) suena(r.audio);
      },
      tick: function(dt, d){
        var dd = d || dt || 0; if (!dd) return;
        var vel = (turbo > 0 ? 3 : 1);
        var dx = dd * 170 * vel * (s.mov ? .5 : 1);
        dist += dx;
        if (!s.mov) { paris.style.backgroundPositionX = Math.round(-dist * .18) + "px"; losas.style.backgroundPositionX = Math.round(-dist) + "px"; }
        sigProp -= dd; if (sigProp <= 0) { nuevoProp(); sigProp = 1.6 + Math.random() * 2.4; }
        mueveDeco(dx);
        if (Math.random() < dd * 6 * vel) polvo();
        if (tGato > 0) { tGato -= dd; if (tGato <= 0 && estadoGato !== "corre" && !(estadoGato === "mareo" && reto)) pose("corre"); }
        if (!reto) return;
        if (cierre >= 0) {
          cierre -= dd;
          cartas.forEach(function(c){ c.sale = (c.sale || 0) + dx; });
          colocaCartas();
          if (cierre < 0) { limpia(); s.listo(); }
          return;
        }
        if (hecho) return;
        if (turbo > 0) { turbo -= dd; if (turbo <= 0) raiz.classList.remove("turbo"); }
        tReal += dd; t += dd * vel;
        reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        reloj.parentNode.parentNode.classList.toggle("poco", t / T > .72);
        colocaCartas();
        if (t >= T) juzga();
      },
      tecla: function(e){
        var k = e.key;
        if (k === "ArrowLeft" || k === "ArrowUp" || k === "w" || k === "W") { e.preventDefault(); ponCarril(carril - 1); }
        else if (k === "ArrowRight" || k === "ArrowDown" || k === "s" || k === "S") { e.preventDefault(); ponCarril(carril + 1); }
        else if (k === " " || k === "Enter") { e.preventDefault(); acelera(); }
        else if (/^[1-5]$/.test(k)) { e.preventDefault(); ponCarril(+k - 1); }
      },
      pausa: function(){ raiz.classList.add("x-pausa"); calla(); }, sigue: function(){ raiz.classList.remove("x-pausa"); },
      destruye: function(){
        zona.removeEventListener("click", clic); esc_.removeEventListener("pointerdown", abajo); window.removeEventListener("pointerup", arriba);
        s.el.removeEventListener("click", oir); window.removeEventListener("resize", mide); calla();
      },
      depura: function(){ return { carril: carril, n: n, T: T, t: t, ops: ops.map(function(o){ return o.t + (o.ok ? "*" : ""); }) }; }
    };
  }

  var gr = G.juegos.gr;
  gr.montar = function(zona, s){ return motorRunner(zona, s); };
  gr.verbo = "Corre con Manzana por el carril correcto";
  var _reglas = gr.reglas;
  gr.reglas = function(alc){
    var r = _reglas ? _reglas(alc) : [];
    var out = Array.isArray(r) ? r.filter(function(x){ return !/carril|gato corre|puerta/i.test(x); }) : [];
    return out.concat(["Manzana corre sola por el muelle del Sena. Las respuestas llegan por la derecha, una por carril.",
      "Cambia de carril con ← → o ↑ ↓ (en el celular, toca el carril o desliza). Espacio o ⏩ acelera: si aciertas, sumas más.",
      "Si llegas por la respuesta equivocada, Manzana se marea: pierdes una vida y ves la corrección."]);
  };

  var st = document.createElement("style"); st.id = "plx65";
  st.textContent = `
  .x56.rn{max-width:920px}
  .rn-escena{position:relative;flex:1 1 auto;min-height:260px;max-height:520px;border-radius:24px;overflow:hidden;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;
    background:#DCEEFF;box-shadow:0 0 0 2px rgba(255,255,255,.14),0 18px 40px -20px rgba(0,0,0,.6)}
  .rn-cielo{position:absolute;inset:0 0 55% 0;background:linear-gradient(180deg,#A9D3FF 0%,#D8ECFF 55%,#FFF4E0 100%)}
  .rn-nube{position:absolute;width:120px;height:34px;border-radius:40px;background:#fff;opacity:.85;filter:blur(1px);animation:rnNube 38s linear infinite}
  .rn-nube::before{content:"";position:absolute;left:24px;top:-18px;width:58px;height:44px;border-radius:50%;background:inherit}
  .rn-nube.a{top:12%;left:10%}.rn-nube.b{top:24%;left:60%;transform:scale(.7);animation-duration:55s}
  @keyframes rnNube{from{translate:0 0}to{translate:-140vw 0}}
  .rn-paris{position:absolute;left:0;right:0;top:4%;height:37%;background:url(${IMG}paris-tira.webp) repeat-x 0 100%/auto 100%;opacity:.96;filter:saturate(.92)}
  .rn-muelle{position:absolute;left:0;right:0;top:40%;bottom:0;background:linear-gradient(180deg,#D9C3A1 0%,#E8D6B8 35%,#EFE1C7 100%);box-shadow:inset 0 3px 0 #BFA37A,inset 0 8px 14px -6px rgba(90,60,20,.35)}
  .rn-losas{position:absolute;inset:0;opacity:.55;background-image:repeating-linear-gradient(90deg,rgba(150,115,70,.35) 0 2px,transparent 2px 64px);background-size:64px 100%}
  .rn-carriles i{position:absolute;left:0;right:0;height:0;border-top:2px dashed rgba(140,105,60,.35)}
  .rn-capa{position:absolute;inset:0;pointer-events:none}
  .rn-gato{position:absolute;left:0;top:0;transform-origin:50% 85%;transition:transform .16s cubic-bezier(.3,1.4,.5,1);pointer-events:none;will-change:transform}
  .rn-gato.hop .rn-spr{animation:rnHop .22s ease-out}
  @keyframes rnHop{50%{translate:0 -10px}}
  .rn-spr{position:absolute;inset:0;background-repeat:no-repeat;filter:drop-shadow(0 4px 4px rgba(60,40,10,.25))}
  .rn-spr.corre{background-image:url(${IMG}corre.webp);background-size:500% 100%;animation:rnCorre .42s steps(5) infinite}
  @keyframes rnCorre{from{background-position:0 0}to{background-position:125% 0}}
  .rn-spr.salta{background-image:url(${IMG}salta.webp);background-size:400% 100%;animation:rnSalta .6s steps(4,jump-none) forwards,rnArriba .6s ease-out}
  @keyframes rnSalta{from{background-position:0 0}to{background-position:100% 0}}
  @keyframes rnArriba{40%{translate:0 -38%}100%{translate:0 0}}
  .rn-spr.mareo{background-image:url(${IMG}mareo.webp);background-size:contain;background-position:50% 100%;animation:rnMareo .5s ease-out}
  @keyframes rnMareo{0%{rotate:-20deg}60%{rotate:6deg}100%{rotate:0}}
  .rn-spr.celebra{background-image:url(${IMG}celebra.webp);background-size:contain;background-position:50% 100%}
  .rn-sombra{position:absolute;left:22%;right:22%;bottom:4%;height:12%;border-radius:50%;background:rgba(90,60,20,.28);filter:blur(2px)}
  .rn-carta{position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;min-width:120px;max-width:min(44%,240px);min-height:46px;padding:8px 16px;box-sizing:border-box;
    border-radius:16px;background:#FFF8EA;border:2px solid #E3D2B0;box-shadow:0 5px 0 #D5C09A,0 10px 18px -8px rgba(60,40,10,.35);color:#0B2D74;text-align:center;
    font:800 15px/1.2 Poppins,system-ui,sans-serif;overflow-wrap:anywhere;transform-origin:0 50%;will-change:transform;transition:background .2s,border-color .2s,opacity .3s}
  .rn-carta.sel{border-color:#22C55E;box-shadow:0 5px 0 #16A34A,0 0 0 4px rgba(34,197,94,.22),0 10px 22px -8px rgba(22,163,74,.55)}
  .rn-carta.sel::after{content:"";position:absolute;left:-12px;top:50%;margin-top:-8px;border:8px solid transparent;border-right-color:#22C55E}
  .rn-carta.bien{background:#16A34A;border-color:#0E7A36;color:#fff;box-shadow:0 5px 0 #0E6B30}
  .rn-carta.mal{background:#FEE2E2;border-color:#F87171;color:#991B1B;opacity:.75}
  .rn-carta.mal.sel{animation:rnSacude .35s}
  @keyframes rnSacude{25%{translate:-6px 0}75%{translate:6px 0}}
  .rn-prop{position:absolute;left:0;top:0;height:clamp(26px,9%,52px);will-change:transform}
  .rn-prop.paloma{height:clamp(22px,7%,40px)}.rn-prop.charco{height:18px}
  .rn-prop.paloma.vuela{animation:rnVuela .9s ease-in forwards}
  @keyframes rnVuela{to{translate:60px -140px;rotate:-25deg;opacity:0}}
  .rn-moneda{position:absolute;left:0;top:0;width:28px;height:28px;object-fit:contain;animation:rnGira .8s ease-in-out infinite alternate}
  .rn-moneda.cogida{animation:rnCoge .3s ease-out forwards}
  @keyframes rnGira{from{scale:1 1}to{scale:.55 1}}
  @keyframes rnCoge{to{translate:0 -30px;opacity:0;scale:1.4}}
  .rn-polvo{position:absolute;left:0;top:0;width:16px;height:10px;border-radius:50%;background:rgba(200,175,140,.8);animation:rnPolvo .6s ease-out forwards}
  @keyframes rnPolvo{to{translate:-40px -14px;scale:2.2;opacity:0}}
  .rn-reloj{position:absolute;left:12px;right:12px;top:10px;display:flex;align-items:center;gap:6px;z-index:40}
  .rn-reloj span{font-size:20px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.2))}
  .rn-reloj b{flex:1;height:12px;border-radius:99px;background:rgba(11,45,116,.55);overflow:hidden;box-shadow:inset 0 0 0 2px rgba(255,255,255,.5)}
  .rn-reloj i{display:block;height:100%;background:linear-gradient(90deg,#FFD200,#FFB800);transform-origin:left;border-radius:99px}
  .rn-reloj.poco i{background:linear-gradient(90deg,#FF6B6B,#E5484D)}
  .rn-aviso{position:absolute;left:0;right:0;top:22%;text-align:center;z-index:45;pointer-events:none;opacity:0;font:900 clamp(26px,6vw,44px)/1 Poppins,system-ui,sans-serif;color:#fff;
    -webkit-text-stroke:2px #0B2D74;text-shadow:0 4px 0 #0B2D74}
  .rn-aviso.on{animation:rnAviso .9s ease-out}
  .rn-aviso.ok{color:#FFD200}
  @keyframes rnAviso{0%{opacity:0;scale:.5}20%{opacity:1;scale:1.12}70%{opacity:1;scale:1}100%{opacity:0;translate:0 -20px}}
  .rn-escena.temblor{animation:rnTiembla .35s}
  @keyframes rnTiembla{20%{translate:-6px 2px}40%{translate:5px -2px}60%{translate:-4px 1px}80%{translate:3px 0}}
  .rn.turbo .rn-escena::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:30;
    background:repeating-linear-gradient(180deg,transparent 0 22px,rgba(255,255,255,.5) 22px 24px);mask:linear-gradient(90deg,#000,transparent 60%);-webkit-mask:linear-gradient(90deg,#000,transparent 60%);animation:rnViento .25s linear infinite}
  @keyframes rnViento{from{translate:0 0}to{translate:-60px 0}}
  .rn-mandos{display:grid;grid-template-columns:60px 1fr 60px 60px;align-items:center;gap:8px;flex:none}
  .rn-mandos button{all:unset;cursor:pointer;height:54px;border-radius:16px;display:grid;place-items:center;background:#FFD200;color:#0B2D74;font:900 26px/1 Poppins,system-ui,sans-serif;box-shadow:0 4px 0 #C9A400;-webkit-tap-highlight-color:transparent}
  .rn-mandos button:active{translate:0 3px;box-shadow:0 1px 0 #C9A400}
  .rn-mandos .rn-turbo{background:#fff;color:#0B2D74;box-shadow:0 4px 0 #C8D3E8;font-size:22px}
  .rn-mandos button:focus-visible{outline:3px solid #fff;outline-offset:3px}
  .rn-nota{text-align:center;font:600 13px/1.3 Inter,system-ui,sans-serif!important;color:#C9D6F2!important;margin:0}
  .rn.x-pausa *,.rn.x-pausa *::before,.rn.x-pausa *::after{animation-play-state:paused!important}
  @media (min-width:900px){.rn-escena{min-height:340px}.rn-carta{font-size:17px;min-height:54px}.rn-mandos{grid-template-columns:64px 1fr 64px 64px}}
  @media (prefers-reduced-motion:reduce){.rn-spr.corre{animation:none}.rn-nube,.rn-moneda,.rn.turbo .rn-escena::after{animation:none}}
  /* portada de Boss Battle en claro: textos que venían blancos para el fondo oscuro */
  .plxg:not(.plxg-juego) .bb-dt>small{color:#C2410C}
  .plxg:not(.plxg-juego) .bb-dt>b{color:var(--pp-tinta,#14213D)}
  .plxg:not(.plxg-juego) .bb-rpt li{background:#fff;box-shadow:0 0 0 1px var(--pp-linea,#E7DFCF),0 6px 14px -12px rgba(20,33,61,.4)}
  .plxg:not(.plxg-juego) .bb-rn{color:var(--pp-azul,#1E5BD7)}
  .plxg:not(.plxg-juego) .bb-rt b{color:var(--pp-tinta,#14213D)}
  .plxg:not(.plxg-juego) .bb-rt small{color:var(--pp-gris,#5E6678)}
  /* portada de Language Adventure en claro */
  .plxg:not(.plxg-juego) .la-mapa li{background:#fff;box-shadow:0 0 0 1px var(--pp-linea,#E7DFCF);border-radius:14px}
  .plxg:not(.plxg-juego) .la-mapa li.cur{background:#FFF6CC;box-shadow:inset 0 0 0 2px #FFD200}
  .plxg:not(.plxg-juego) .la-mapa b{color:var(--pp-tinta,#14213D)!important}
  .plxg:not(.plxg-juego) .la-mapa small{color:var(--pp-gris,#5E6678)!important}
  /* pistas de Phrase Builder y Sentence Race (plx47) */
  .pb-ctx{margin:0 0 6px!important;font:600 14px/1.35 Inter,system-ui,sans-serif;color:#C9D6F2}
  .pb-ctx span{display:inline-block;margin-right:8px;padding:2px 8px;border-radius:99px;background:rgba(255,210,0,.18);color:#FFD200;font:800 11px/1.4 Poppins,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase}
  .pb-esq{letter-spacing:.02em;word-spacing:.18em}
  .pb-esq .esq{color:rgba(255,255,255,.55)}
  .pb-esq .esq-ok{color:#6BE58E}
  .fx-f.fx-sig{box-shadow:0 0 0 3px #FFD200,0 0 18px rgba(255,210,0,.6)!important;animation:fxSig 1s ease-in-out infinite alternate}
  @keyframes fxSig{to{translate:0 -3px}}
  `;
  document.head.appendChild(st);
})();
