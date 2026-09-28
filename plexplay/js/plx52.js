/* PLEX PLAY 1.24.0 — Boss Battle y Mystery Challenge: juegos que encadenan los otros motores
   - Boss Battle (por unidad): un jefe con barra de vida. Se le gana por fases: reflejos (Fruit Frenzy),
     construir (Phrase Builder o Spell Builder), escucha (Audio Hunt) y, al final, voz (Voice Duel).
     Cada acierto le quita un punto de vida; cada error te quita una vida a ti. Si una fase no tiene
     retos en esa unidad, se reemplaza por reflejos. Estrellas: ganar (1), ganar con 2 vidas (2), sin perder ninguna (3).
   - Mystery Challenge: una ruleta elige el juego de cada reto entre los motores disponibles.
   - Los dos usan la sesión común (PLXG.sesion) y montan el motor de cada juego dentro de su zona:
     el reto lleva en «motor» el id del juego que lo presenta. */
(function(){
  "use strict";
  var G = window.PLXG; if (!G || !G.sesion) return;
  var esc = G.esc, mezcla = G.mezcla;

  /* reto con el motor que lo presenta (copia: el mismo ítem puede salir en dos juegos) */
  var marca = function(r, id){ var c = Object.assign({}, r); c.motor = id; return c; };
  var disponible = function(id){ var j = G.juegos[id]; return j && j.montar ? j : null; };
  var retosDeMotor = function(id, alc){ var j = disponible(id); if (!j) return []; try { return G.retosJuego(j, alc); } catch (e) { return []; } };

  /* monta y desmonta los motores dentro de la zona del juego contenedor */
  var multimotor = function(zona, s, alCambiar){
    var ctrl = null, idActual = null, sub = null;
    var monta = function(id){
      if (idActual === id && ctrl) return;
      if (ctrl) { try { ctrl.destruye(); } catch (e) {} ctrl = null; }
      zona.innerHTML = '<div class="mm-sub"></div>'; sub = zona.firstChild;
      s.banner("");
      ctrl = (disponible(id) || G.juegos.ff).montar(sub, s); idActual = id;
      if (alCambiar) alCambiar(id);
    };
    return {
      monta: monta,
      actual: function(){ return idActual; },
      jugar: function(r){ monta(r.motor || "ff"); ctrl.jugar(r); },
      tick: function(dt, d, e){ if (ctrl && ctrl.tick) ctrl.tick(dt, d, e); },
      tecla: function(e){ if (ctrl && ctrl.tecla) ctrl.tecla(e); },
      pausa: function(){ if (ctrl && ctrl.pausa) ctrl.pausa(); },
      sigue: function(){ if (ctrl && ctrl.sigue) ctrl.sigue(); },
      destruye: function(){ if (ctrl) { try { ctrl.destruye(); } catch (e) {} ctrl = null; } zona.innerHTML = ""; },
      depura: function(){ return Object.assign({ motor: idActual }, ctrl && ctrl.depura ? ctrl.depura() : {}); }
    };
  };

  /* ---------------- Boss Battle ---------------- */
  var JEFES = {
    a1: "Le Concierge", a2: "La Bibliothécaire", fon: "Le Maître des Sons", b11: "Le Chef de Gare", b12: "La Journaliste",
    b21: "Le Professeur", rem: "L'Inspectrice", prog: "Le Directeur de Thèse", c12: "La Présidente du Jury", lit: "L'Écrivain"
  };
  /* emblema del jefe en SVG: un escudo con la inicial, sin imágenes de terceros */
  var emblema = function(nombre, color){
    var ini = String(nombre || "?").replace(/^(Le |La |L')/, "").charAt(0).toUpperCase();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 4l22 8v18c0 15-9.5 25-22 30C19.5 55 10 45 10 30V12z" fill="#081F55" stroke="' + color + '" stroke-width="3"/>' +
      '<path d="M32 10l16 6v14c0 11-7 19-16 23-9-4-16-12-16-23V16z" fill="' + color + '" opacity=".16"/>' +
      '<text x="32" y="41" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-weight="800" font-size="24" fill="#FFD200">' + ini + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };
  var FASES = [
    { nombre: "Reflejos", motores: ["ff"], n: 4 },
    { nombre: "Construir", motores: ["pb", "sb"], n: 3 },
    { nombre: "Escucha", motores: ["ah"], n: 3 },
    { nombre: "Voz", motores: ["vd"], n: 2 }
  ];
  /* la lista del jefe: fase por fase, con el motor que tenga retos en esta unidad */
  var planJefe = function(alc){
    var usados = {}, out = [];
    FASES.forEach(function(f, k){
      var id = null, lista = [];
      f.motores.some(function(m){ var r = retosDeMotor(m, alc); if (r.length >= f.n) { id = m; lista = r; return true; } return false; });
      if (!id) { id = "ff"; lista = retosDeMotor("ff", alc); }
      /* solo se marcan como usados los que se eligen (si no, la fase siguiente se queda sin retos) */
      var tomados = 0;
      mezcla(lista).forEach(function(r){
        var c = id + "|" + (r.key || r.q || "");
        if (tomados >= f.n || usados[c]) return;
        usados[c] = 1; tomados++;
        var m = marca(r, id); m.fase = k; out.push(m);
      });
    });
    return out;
  };
  var BB = G.registrar({
    id: "bb", nombre: "Boss Battle", verbo: "Derrota al jefe de la unidad", familia: "Jefe", color: "#E5484D", orden: 70, vocab: false,
    sinFantasma: true, sinReloj: true,
    retos: function(alc){ return planJefe(alc); },
    deco: function(){ return '<img src="' + emblema("B", "#E5484D") + '" alt="" style="--i:1;width:52px;height:52px">'; },
    reglas: function(alc){
      /* solo se nombran las fases que esta unidad tiene de verdad (sin motor, una fase se juega con reflejos) */
      var jefe = JEFES[alc.track] || "Le Gardien", plan = planJefe(alc), vistos = {}, fases = [];
      plan.forEach(function(r){ var n = r.motor === "ff" ? "reflejos" : FASES[r.fase].nombre.toLowerCase(); if (!vistos[n]) { vistos[n] = 1; fases.push(n); } });
      var y = fases.length > 1 ? fases.slice(0, -1).join(", ") + " y " + fases[fases.length - 1] : fases[0] || "reflejos";
      var r = [
        jefe + " guarda esta unidad. Tiene " + plan.length + " puntos de vida y tú 3 vidas; hay 150 segundos.",
        "Cada acierto le quita un punto." + (fases.length > 1 ? " Se lucha por fases: " + y + "." : " Se lucha con reflejos: corta la respuesta correcta.")
      ];
      if (vistos.voz) r.push("La voz mide si se entiende lo que dices. Sin micrófono, esa fase se juega de otra forma.");
      r.push("Ganas una estrella por vencerlo, dos si terminas con 2 vidas o más y tres si no pierdes ninguna.");
      return r;
    },
    opciones: function(alc){
      var plan = planJefe(alc), nombre = JEFES[alc.track] || "Le Gardien";
      return {
        seg: 150, ordenFijo: true, retos: plan,
        jefe: { vida: plan.length, nombre: nombre, img: emblema(nombre, "#E5484D") },
        estrellas: function(r){ if (!r.jefe || !r.jefe.vencido) return 0; return r.vidas >= 3 ? 3 : r.vidas >= 2 ? 2 : 1; },
        pista: function(r){ return !r.jefe || !r.jefe.vencido ? "Para ganar estrellas hay que vencer al jefe antes de que se acabe el tiempo." : r.estrellas < 3 ? "Tres estrellas: vencerlo sin perder ninguna vida." : "Victoria perfecta." }
      };
    },
    montar: function(zona, s){
      var faseVista = -1;
      var mm = multimotor(zona, s);
      return Object.assign({}, mm, {
        jugar: function(r){
          if (r.fase != null && r.fase !== faseVista) {
            faseVista = r.fase;
            var f = FASES[r.fase];
            s.mz("frenesi", "Fase " + (r.fase + 1) + ": " + (r.motor === "ff" && f.nombre !== "Reflejos" ? "Reflejos" : f.nombre));
          }
          mm.jugar(r);
        }
      });
    }
  });

  /* ---------------- Mystery Challenge ---------------- */
  var MISTERIO = ["ff", "pb", "sb", "ah", "ld", "mr"];
  var MC = G.registrar({
    id: "mc", nombre: "Mystery Challenge", verbo: "La ruleta elige el juego", familia: "Misterio", color: "#FFD200", orden: 80, vocab: false,
    /* sin al menos tres juegos, la ruleta no tiene sentido */
    oculto: function(){ return MISTERIO.filter(disponible).length < 3; },
    retos: function(alc){
      var out = [];
      MISTERIO.forEach(function(id){ if (id === "mc") return; mezcla(retosDeMotor(id, alc)).slice(0, 8).forEach(function(r){ out.push(marca(r, id)); }); });
      return out;
    },
    deco: function(){
      return '<svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="24" fill="#081F55" stroke="#FFD200" stroke-width="3"/>' +
        [0, 1, 2, 3, 4, 5].map(function(i){ var a = i * Math.PI / 3, b = a + Math.PI / 3; return '<path d="M28 28L' + (28 + 22 * Math.cos(a)).toFixed(1) + " " + (28 + 22 * Math.sin(a)).toFixed(1) + "A22 22 0 0 1 " + (28 + 22 * Math.cos(b)).toFixed(1) + " " + (28 + 22 * Math.sin(b)).toFixed(1) + 'Z" fill="' + ["#FF7A45", "#6BE58E", "#93C5FD", "#A78BFA", "#FFD200", "#F472B6"][i] + '" opacity=".85"/>'; }).join("") +
        '<circle cx="28" cy="28" r="9" fill="#081F55"/><text x="28" y="33" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-weight="800" font-size="14" fill="#FFD200">?</text></svg>';
    },
    reglas: function(alc){
      return [
        (G.aj.sinTiempo ? "Sin tiempo: 15 retos" : "120 segundos") + " y 3 vidas.",
        "Antes de cada reto gira la ruleta: te puede tocar cortar, armar, deletrear, escuchar, investigar o recordar.",
        "Las reglas de cada juego son las de siempre; el combo y el frenesí se mantienen de un juego a otro."
      ];
    },
    opciones: function(){ return { seg: 120 }; },
    montar: function(zona, s){
      var ruleta = null, pendiente = null, t = 0;
      var capa = document.createElement("div"); capa.className = "mc-ruleta"; capa.hidden = true; s.el.appendChild(capa);
      var mm = multimotor(zona, s);
      var nombre = function(id){ var j = G.juegos[id]; return j ? j.nombre : id; };
      var gira = function(r){
        pendiente = r; t = 0;
        var ids = MISTERIO.filter(disponible);
        capa.innerHTML = '<div class="mc-c"><small>La ruleta elige…</small><b>' + esc(nombre(ids[0])) + "</b></div>";
        capa.hidden = false; ruleta = { ids: ids, k: 0, paso: 0 };
        G.sfx("tic");
      };
      return Object.assign({}, mm, {
        jugar: function(r){
          if (s.mov || mm.actual() === (r.motor || "ff")) { mm.jugar(r); return; }
          gira(r);
        },
        tick: function(dt, d, e){
          if (ruleta && e === "juega") {
            t += dt;
            var paso = Math.floor(t / .09);
            if (paso !== ruleta.paso) { ruleta.paso = paso; ruleta.k = (ruleta.k + 1) % ruleta.ids.length; capa.querySelector("b").textContent = nombre(t > .75 ? pendiente.motor : ruleta.ids[ruleta.k]); if (t <= .75) G.sfx("paso", ruleta.k); }
            if (t > 1.05) { ruleta = null; capa.hidden = true; G.sfx("ya"); var r = pendiente; pendiente = null; mm.jugar(r); }
            return;
          }
          mm.tick(dt, d, e);
        },
        destruye: function(){ mm.destruye(); capa.remove(); },
        depura: function(){ return Object.assign({ ruleta: !!ruleta }, mm.depura()); }
      });
    }
  });

  var st = document.createElement("style"); st.id = "plx52";
  st.textContent = `
  .mm-sub{position:absolute;inset:0}
  .mc-ruleta{position:absolute;inset:0;z-index:7;display:grid;place-items:center;background:rgba(4,14,40,.55);pointer-events:none}
  .mc-ruleta[hidden]{display:none}
  .mc-c{display:grid;gap:6px;text-align:center;padding:18px 26px;border-radius:20px;background:#081F55;box-shadow:inset 0 0 0 2px #FFD200,0 20px 40px -18px rgba(0,0,0,.8)}
  .mc-c small{font:700 11px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#93C5FD}
  .mc-c b{font:800 28px/1.1 Poppins,system-ui,sans-serif;text-transform:uppercase;color:#FFD200;min-width:9ch}
  `;
  document.head.appendChild(st);
})();
