/* PLEX PLAY 1.25.0 — Phrase Builder y Spell Builder (motor «Construir»)
   - Phrase Builder: las piezas de una frase salen desordenadas abajo; se tocan (o se arrastran) en orden
     para armarla arriba. Retos: los ejercicios «order» y frases completas sacadas de los «choice» y «fill»
     (la frase con la respuesta correcta, partida en piezas naturales: «à l'université», «je suis»…).
   - Spell Builder: se deletrea una palabra con letras sueltas, tildes incluidas. Entre las letras hay
     trampas con la tilde equivocada (é / è / e), así que hay que saber escribirla, no solo reconocerla.
   - Una pieza equivocada rompe el combo y tiembla; la segunda en el mismo reto es un error (vida,
     corrección y carnet). Si se acaba el tiempo del reto, se muestra la respuesta sin quitar vida.
   - Todo el tiempo va por tick (la pausa lo congela). Teclado: 1 a 9 eligen la pieza. */
(function(){
  "use strict";
  var G = window.PLXG; if (!G || !G.sesion) return;
  var esc = G.esc, norm = G.norm, mezcla = G.mezcla, plano = G.plano;

  /* ---------------- retos ---------------- */
  var itemDe = function(key){ try { return key && ITEMS[key] ? ITEMS[key].it : null; } catch (e) { return null; } };
  /* palabras que van pegadas a la siguiente para que las piezas sean naturales */
  var PEGA = /^(le|la|les|l'|un|une|des|du|de|d'|au|aux|à|en|je|j'|tu|il|elle|on|nous|vous|ils|elles|ne|n'|me|m'|te|t'|se|s'|y|qu'|c'|ce|cet|cette|ces|mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leur|leurs|très|plus|pas)$/i;
  /* expresiones que no se parten: van en una sola pieza */
  var FIJAS = ["qu'est-ce que", "parce que", "tout à coup", "tout de suite", "tout le monde", "tout à fait", "tout d'abord", "à cause de", "à côté de", "au lieu de",
    "grâce à", "afin de", "pour que", "alors que", "tandis que", "bien que", "dès que", "pendant que", "depuis que", "avant de", "après que", "il y a", "il y avait",
    "il y aura", "en train de", "de plus en plus", "de moins en moins", "de temps en temps", "au fur et à mesure", "à la fois", "en effet", "par exemple", "en fait",
    "du coup", "quand même", "bien sûr", "à mon avis", "c'est-à-dire", "près de", "loin de", "ainsi que", "plus tard", "tout le temps"];
  /* «¤» pega palabras dentro de una misma pieza (no es espacio: \s no lo parte) */
  var ESCAPA = function(f){ return f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };
  var FIJAS_RE = new RegExp("(^|[\\s,])(" + FIJAS.map(ESCAPA).sort(function(a, b){ return b.length - a.length; }).join("|") + ")(?=[\\s,.!?;:]|$)", "gi");
  var trocea = function(frase){
    frase = frase.replace(FIJAS_RE, function(m, a, f){ return a + f.replace(/\s+/g, "¤"); });
    var ws = frase.replace(/\s+([?!:;»])/g, "¤$1").replace(/(«)\s+/g, "$1¤").split(/\s+/).filter(Boolean), out = [], acum = "";
    ws.forEach(function(w, i){
      acum = acum ? acum + " " + w : w;
      var limpia = w.replace(/[.,!?;:¤»]+$/g, "").toLowerCase();
      if (i < ws.length - 1 && (PEGA.test(limpia) || /'$/.test(limpia))) return;
      out.push(acum); acum = "";
    });
    if (acum) out.push(acum);
    /* máximo 7 piezas: se juntan las más cortas con su vecina */
    while (out.length > 7) {
      var k = 0, min = 1e9;
      for (var i = 0; i < out.length - 1; i++) { var l = out[i].length + out[i + 1].length; if (l < min) { min = l; k = i; } }
      out.splice(k, 2, out[k] + " " + out[k + 1]);
    }
    return out.map(function(p){ return p.replace(/¤/g, " "); });
  };
  /* un reto «uno» de choice o fill → frase completa para armar */
  var aFrase = function(r){
    var it = itemDe(r.key); if (!it || (it.k !== "choice" && it.k !== "fill")) return null;
    var f = G.completa(r.q, r.correcta[0]); if (!f || /\s[,;]\s|…|\.\.\./.test(f)) return null;
    var p = trocea(f); if (p.length < 3 || p.length > 7 || p.some(function(x){ return x.length > 30; })) return null;
    return { tipo: "orden", ask: "Arma la frase", q: plano(it.ctx || ""), correcta: p, malas: [], why: r.why, hab: r.hab, key: r.key, lessonId: r.lessonId, deriv: true, oro: r.oro };
  };
  var retosPB = function(base){
    var out = [], vistos = {};
    base.forEach(function(r){
      var x = r.tipo === "orden" ? Object.assign({}, r, { ask: "Arma la frase" }) : r.tipo === "uno" ? aFrase(r) : null;
      if (!x) return;
      var k = norm(x.correcta.join(" ")); if (vistos[k]) return; vistos[k] = 1;
      out.push(x);
    });
    return out;
  };
  /* Spell Builder: una sola palabra, solo letras (con tildes), de 3 a 12 */
  var palabraOk = function(w){ return /^[a-zàâäçéèêëîïôöùûüÿœæ]{3,12}$/i.test(w || ""); };
  var retosSB = function(base){
    var out = [], vistos = {};
    base.forEach(function(r){
      if (r.tipo !== "uno") return;
      var w = r.correcta[0], it = itemDe(r.key), x = null;
      if (!palabraOk(w)) return;
      if (r.voc) x = { tipo: "letras", ask: "Escribe en francés", q: r.voc.es, correcta: [w], audio: w, why: r.why, hab: "vocab", key: null, lessonId: "", voc: r.voc };
      else if (it && it.k === "fill" && /_{2,}/.test(r.q)) x = { tipo: "letras", ask: plano(it.ask || "") || "Completa la palabra", q: r.q, correcta: [w], why: r.why, hab: r.hab, key: r.key, lessonId: r.lessonId, oro: r.oro };
      if (!x) return;
      var k = norm(w) + "|" + x.q; if (vistos[k]) return; vistos[k] = 1;
      out.push(x);
    });
    return out;
  };
  /* trampas: la misma letra con otra tilde, y alguna letra más según el nivel */
  var PARES = { "é": "eè", "è": "éê", "ê": "eè", "e": "éè", "à": "aâ", "â": "aà", "a": "àâ", "ç": "c", "c": "ç", "î": "iï", "ï": "iî", "i": "î", "ô": "oö", "o": "ô", "ù": "uû", "û": "uù", "u": "ù", "ë": "eé", "œ": "oe" };
  var trampas = function(w, nivel){
    var lw = w.toLowerCase(), out = [], acentos = lw.split("").filter(function(c){ return /[àâçéèêëîïôùû]/.test(c); });
    acentos.forEach(function(c){ var p = PARES[c] || ""; if (p) out.push(p.charAt(Math.floor(Math.random() * p.length))); });
    var n = 1 + nivel;
    var pool = "aeioursntlcdpm".split("").filter(function(c){ return lw.indexOf(c) < 0; });
    if (!acentos.length) { var v = lw.split("").filter(function(c){ return PARES[c] && /[eaicou]/.test(c); }); if (v.length && nivel > 0) out.push(PARES[v[0]].charAt(0)); }
    while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out.slice(0, Math.max(n, acentos.length));
  };

  /* ---------------- motor de fichas (compartido) ---------------- */
  function motorFichas(zona, s, modo){
    var reto = null, fichas = [], paso = 0, malos = 0, T = 0, t = 0, hecho = false, cierre = -1;
    var arrastre = null;
    zona.innerHTML = '<div class="fx"><div class="fx-reloj"><i></i></div><div class="fx-linea" aria-live="polite"></div><div class="fx-bandeja" role="group" aria-label="Piezas"></div></div>';
    s.el.classList.add("fx-on");
    var raiz = zona.querySelector(".fx"), linea = zona.querySelector(".fx-linea"), bandeja = zona.querySelector(".fx-bandeja"), reloj = zona.querySelector(".fx-reloj i");
    var letras = modo === "sb";

    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 10) + "px"; };
    var banner = function(){
      var q;
      if (letras) {
        var hecha = reto.correcta[0].slice(0, paso), resto = reto.correcta[0].length - paso;
        var palabra = '<span class="fx-pal">' + esc(hecha) + '<span class="fx-gu">' + new Array(resto + 1).join("_") + "</span></span>";
        if (reto.voc) q = '<span class="tr">' + esc(reto.q) + "</span>" + palabra + (reto.audio ? ' <button class="plxg-oir" data-fx="oir" aria-label="Escuchar">' + (G.ICONO_OIR || "") + "</button>" : "");
        else q = esc(reto.q).replace(/_{2,}/, palabra);
      } else q = reto.q ? '<span class="tr">' + esc(reto.q) + "</span>" : "";
      s.banner('<p class="plxg-ask">' + esc(reto.ask || "") + "</p>" + (q ? '<p class="plxg-q">' + q + "</p>" : ""), { oro: reto.oro });
      coloca();
    };
    var pintaLinea = function(){
      if (letras) { linea.innerHTML = ""; linea.hidden = true; return; }
      linea.hidden = false;
      linea.innerHTML = reto.correcta.map(function(p, i){ return i < paso ? '<span class="fx-p ok">' + esc(p) + "</span>" : '<span class="fx-p vacio" aria-hidden="true"></span>'; }).join("");
    };
    var pintaBandeja = function(){
      bandeja.classList.toggle("letras", letras);
      bandeja.innerHTML = fichas.map(function(f, i){
        return f.usada ? "" : '<button class="fx-f" data-fx-i="' + i + '" style="--r:' + f.rot + 'deg"><small aria-hidden="true">' + "</small>" + esc(f.t) + "</button>";
      }).join("");
      numera();
    };
    var numera = function(){ bandeja.querySelectorAll(".fx-f small").forEach(function(sm, k){ sm.textContent = k < 9 ? String(k + 1) : ""; }); };

    var jugar = function(r){
      reto = r; paso = 0; malos = 0; t = 0; hecho = false; cierre = -1;
      var piezas = letras ? r.correcta[0].split("") : r.correcta.slice();
      var extra = letras ? trampas(r.correcta[0], s.nivel) : [];
      fichas = mezcla(piezas.map(function(p){ return { t: p, usada: false }; }).concat(extra.map(function(p){ return { t: p, usada: false, trampa: true }; })));
      /* que no salga ya ordenada */
      if (fichas.length > 2 && fichas.every(function(f, i){ return f.t === piezas[i]; })) fichas.push(fichas.shift());
      fichas.forEach(function(f){ f.rot = s.mov ? 0 : Math.round((Math.random() - .5) * 6); });
      T = letras ? s.dir.t() * 1.3 + .75 * piezas.length : s.dir.t() * 1.4 + 1.1 * piezas.length;
      banner(); pintaLinea(); pintaBandeja();
      if (r.audio && letras) try { speak(r.audio); } catch (e) {}
    };
    var centro = function(el){ var a = el.getBoundingClientRect(), b = zona.getBoundingClientRect(); return { x: a.left - b.left + a.width / 2, y: a.top - b.top }; };
    var elige = function(i, el){
      if (!reto || hecho || s.estado() !== "juega") return;
      var f = fichas[i]; if (!f || f.usada) return;
      G.despiertaAudio();
      var esperado = letras ? reto.correcta[0].charAt(paso) : reto.correcta[paso];
      var c = el ? centro(el) : { x: zona.clientWidth / 2, y: zona.clientHeight / 2 };
      var bien = letras ? f.t.toLowerCase() === esperado.toLowerCase() : norm(f.t) === norm(esperado);
      if (bien) {
        f.usada = true; paso++;
        var total = letras ? reto.correcta[0].length : reto.correcta.length;
        if (paso >= total) {
          hecho = true;
          s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: c.x, y: c.y, final: true });
          banner(); pintaLinea(); pintaBandeja();
          linea.classList.add("fx-listo"); raiz.classList.add("fx-listo");
          cierre = .55;
        } else {
          G.sfx("paso", paso); s.extra(letras ? 5 : 15, c.x, c.y);
          banner(); pintaLinea(); pintaBandeja();
        }
        return;
      }
      malos++;
      if (el) { el.classList.remove("fx-mal"); void el.offsetWidth; el.classList.add("fx-mal"); }
      if (malos < 2) { s.penaliza(c.x, c.y); G.vibra(40); return; }
      hecho = true;
      s.fallo(reto, { mal: f.t, etMal: "Tocaste", etiqueta: letras ? "Se escribe" : "La frase", bien: letras ? reto.correcta[0] : reto.correcta.join(" ") })
        .then(function(){ limpia(); s.listo(); });
    };
    var limpia = function(){ reto = null; fichas = []; bandeja.innerHTML = ""; linea.innerHTML = ""; linea.classList.remove("fx-listo"); raiz.classList.remove("fx-listo"); reloj.style.transform = "scaleX(1)"; };

    /* ---- entrada: tocar o arrastrar hacia arriba ---- */
    var abajo = function(e){
      var b = e.target.closest && e.target.closest(".fx-f"); if (!b || s.estado() !== "juega") return;
      e.preventDefault();
      arrastre = { b: b, id: e.pointerId, x0: e.clientX, y0: e.clientY, mov: false };
      try { b.setPointerCapture(e.pointerId); } catch (x) {}
    };
    var mueve = function(e){
      if (!arrastre || e.pointerId !== arrastre.id) return;
      var dx = e.clientX - arrastre.x0, dy = e.clientY - arrastre.y0;
      if (!arrastre.mov && Math.hypot(dx, dy) > 8) { arrastre.mov = true; arrastre.b.classList.add("fx-arr"); }
      if (arrastre.mov) arrastre.b.style.transform = "translate(" + dx + "px," + dy + "px) scale(1.06)";
    };
    var arriba = function(e){
      if (!arrastre || e.pointerId !== arrastre.id) return;
      var a = arrastre; arrastre = null;
      a.b.classList.remove("fx-arr"); a.b.style.transform = "";
      /* un toque, o un arrastre que termina por encima de la bandeja */
      var subio = a.mov && e.clientY < bandeja.getBoundingClientRect().top + 10;
      if (!a.mov || subio) elige(+a.b.getAttribute("data-fx-i"), a.b);
    };
    var cancela = function(){ if (arrastre) { arrastre.b.classList.remove("fx-arr"); arrastre.b.style.transform = ""; arrastre = null; } };
    var oir = function(e){ var b = e.target.closest && e.target.closest("[data-fx=oir]"); if (b && reto && reto.audio) try { speak(reto.audio); } catch (x) {} };
    zona.addEventListener("pointerdown", abajo); zona.addEventListener("pointermove", mueve);
    zona.addEventListener("pointerup", arriba); zona.addEventListener("pointercancel", cancela);
    s.el.addEventListener("click", oir);
    window.addEventListener("resize", coloca);

    return {
      jugar: jugar,
      tick: function(dt){
        if (!reto) return;
        if (cierre >= 0) { cierre -= dt; if (cierre < 0) { limpia(); s.listo(); } return; }
        if (hecho || !dt) return;
        t += dt;
        reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        reloj.parentNode.classList.toggle("poco", t / T > .75);
        if (t >= T) {
          hecho = true;
          s.escapa(reto, { titulo: letras ? "Se acabó el tiempo" : "La frase quedó incompleta", etiqueta: letras ? "Se escribe" : "La frase", bien: letras ? reto.correcta[0] : reto.correcta.join(" ") })
            .then(function(){ limpia(); s.listo(); });
        }
      },
      tecla: function(e){
        if (!/^[1-9]$/.test(e.key)) return;
        var bs = bandeja.querySelectorAll(".fx-f"), b = bs[+e.key - 1];
        if (b) { e.preventDefault(); elige(+b.getAttribute("data-fx-i"), b); }
      },
      pausa: cancela,
      destruye: function(){
        zona.removeEventListener("pointerdown", abajo); zona.removeEventListener("pointermove", mueve);
        zona.removeEventListener("pointerup", arriba); zona.removeEventListener("pointercancel", cancela);
        s.el.removeEventListener("click", oir); window.removeEventListener("resize", coloca);
        s.el.classList.remove("fx-on");
      },
      depura: function(){
        return { reto: reto && { tipo: reto.tipo, correcta: reto.correcta, q: reto.q }, paso: paso, hecho: hecho, t: t, T: T,
          fichas: [].map.call(bandeja.querySelectorAll(".fx-f"), function(b){ var r = b.getBoundingClientRect(); return { t: b.textContent.replace(/^\d/, ""), i: +b.getAttribute("data-fx-i"), x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }) };
      }
    };
  }

  /* ---------------- registro ---------------- */
  var decoPB = function(){
    return '<svg viewBox="0 0 72 56" aria-hidden="true"><rect x="4" y="8" width="30" height="16" rx="8" fill="#fff"/><rect x="38" y="8" width="30" height="16" rx="8" fill="#6BE58E"/>' +
      '<rect x="12" y="32" width="24" height="16" rx="8" fill="#fff" opacity=".85" transform="rotate(-4 24 40)"/><rect x="40" y="32" width="26" height="16" rx="8" fill="#fff" opacity=".85" transform="rotate(3 53 40)"/>' +
      '<rect x="9" y="14" width="18" height="4" rx="2" fill="#0B2D74"/><rect x="43" y="14" width="20" height="4" rx="2" fill="#0B2D74"/></svg>';
  };
  var decoSB = function(){
    return '<svg viewBox="0 0 72 56" aria-hidden="true">' + [["é", 6, "#A78BFA"], ["c", 26, "#fff"], ["o", 46, "#fff"]].map(function(l, i){
      return '<g transform="rotate(' + (i - 1) * 5 + " " + (l[1] + 10) + ' 28)"><rect x="' + l[1] + '" y="14" width="20" height="26" rx="6" fill="' + l[2] + '"/><text x="' + (l[1] + 10) + '" y="33" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-weight="800" font-size="16" fill="#0B2D74">' + l[0] + "</text></g>";
    }).join("") + "</svg>";
  };
  G.registrar({
    id: "pb", nombre: "Phrase Builder", verbo: "Arma la frase", familia: "Construir", color: "#6BE58E", orden: 20, vocab: false,
    retos: function(alc){ return retosPB(G.retosDe(alc, { max: 40, fichas: 8 })); },
    retosCarnet: function(track, nivel){ return retosPB(G.retosCarnet(track, nivel, { max: 40, fichas: 8 })).map(function(r){ r.oro = true; return r; }); },
    apto: function(r){ return r.tipo === "orden"; },
    deco: decoPB,
    reglas: function(alc){
      return [
        (G.aj.sinTiempo ? "Sin tiempo: " + (alc.repaso ? 10 : 15) + " frases" : alc.seg + " segundos") + " y 3 vidas.",
        "Toca las piezas en orden (o arrástralas hacia arriba) para armar la frase.",
        "Una pieza equivocada rompe el combo; la segunda en la misma frase te quita una vida y te muestra la corrección.",
        "Cada frase tiene su tiempo: arma rápido para ganar más puntos."
      ];
    },
    montar: function(zona, s){ return motorFichas(zona, s, "pb"); }
  });
  G.registrar({
    id: "sb", nombre: "Spell Builder", verbo: "Deletrea con tildes", familia: "Construir", color: "#A78BFA", orden: 25, vocab: true,
    retos: function(alc){ return retosSB(G.retosDe(alc)); },
    retosCarnet: function(track, nivel){ return retosSB(G.retosCarnet(track, nivel)).map(function(r){ r.oro = true; return r; }); },
    apto: function(r){ return r.tipo === "letras"; },
    deco: decoSB,
    reglas: function(alc){
      return [
        (G.aj.sinTiempo ? "Sin tiempo: " + (alc.repaso ? 10 : 15) + " palabras" : alc.seg + " segundos") + " y 3 vidas.",
        alc.tema ? "Lee el significado, escucha la palabra y deletréala en francés." : "Completa la palabra que falta, letra por letra.",
        "Ojo con las tildes: entre las letras hay trampas como é, è y e.",
        "Una letra equivocada rompe el combo; la segunda en la misma palabra te quita una vida."
      ];
    },
    montar: function(zona, s){ return motorFichas(zona, s, "sb"); }
  });

  var st = document.createElement("style"); st.id = "plx47";
  st.textContent = `
  .fx{position:absolute;inset:0;display:flex;flex-direction:column;gap:18px;padding:0 16px calc(96px + env(safe-area-inset-bottom));box-sizing:border-box}
  .fx-reloj{height:6px;border-radius:99px;background:rgba(147,197,253,.18);overflow:hidden;flex:none}
  .fx-reloj i{display:block;height:100%;background:#6BE58E;transform-origin:left;border-radius:99px}
  .plxg.fx-on .fx-reloj.poco i{background:#FF8A8F}
  .fx-linea{display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start;min-height:52px;padding:12px;border-radius:18px;background:rgba(8,31,85,.6);box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.25)}
  .fx-linea[hidden]{display:none}
  .fx-p{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:12px;font:700 17px/1.2 Poppins,Inter,system-ui,sans-serif}
  .fx-p.ok{background:#fff;color:#0B2D74;animation:fxEntra .22s ease-out}
  .fx-p.vacio{width:46px;background:rgba(147,197,253,.1);box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.3);border-style:dashed}
  .fx-linea.fx-listo{box-shadow:inset 0 0 0 2px #6BE58E,0 0 28px -6px rgba(107,229,142,.7)}
  .fx-bandeja{margin-top:auto;display:flex;flex-wrap:wrap;justify-content:center;gap:10px;align-content:flex-end;min-height:120px}
  .fx-f{position:relative;display:inline-flex;align-items:center;justify-content:center;text-align:center;min-height:52px;min-width:52px;padding:0 18px;border:0;border-radius:14px;background:#fff;color:#0B2D74;font:700 17px/1.2 Poppins,Inter,system-ui,sans-serif;
    box-shadow:0 4px 0 #93C5FD,0 12px 24px -12px rgba(0,0,0,.7);transform:rotate(var(--r));cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none}
  .fx-f:active{box-shadow:0 1px 0 #93C5FD}
  .fx-f small{position:absolute;top:-7px;left:-7px;width:20px;height:20px;border-radius:50%;background:#0B2D74;color:#FFD200;font:800 11px/20px Poppins,system-ui,sans-serif;display:none}
  @media (pointer:fine){ .fx-f small{display:block} .fx-f small:empty{display:none} }
  .fx-bandeja.letras .fx-f{min-width:54px;padding:0;font-size:24px;text-transform:none}
  .fx-f.fx-arr{z-index:3;transition:none;box-shadow:0 18px 30px -10px rgba(0,0,0,.8)}
  .fx-f.fx-mal{animation:fxMal .35s;background:#FFE1E3}
  .fx-f:focus-visible{outline:3px solid #FFD200;outline-offset:3px}
  .fx-pal{font:800 1.25em/1.2 Poppins,Inter,system-ui,sans-serif;color:#FFD200;letter-spacing:.06em}
  .fx-gu{color:rgba(147,197,253,.7)}
  .fx.fx-listo .fx-pal{color:#6BE58E}
  @keyframes fxEntra{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}
  @keyframes fxMal{0%,100%{translate:0}25%{translate:-7px}75%{translate:7px}}
  @media (prefers-reduced-motion:reduce){ .fx-p.ok,.fx-f.fx-mal{animation:none} }
  `;
  document.head.appendChild(st);
})();
