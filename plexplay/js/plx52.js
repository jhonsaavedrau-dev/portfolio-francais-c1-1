/* PLEX PLAY 1.25.0 — Boss Battle y Mystery Challenge: juegos que encadenan los otros motores
   - Boss Battle (por unidad): el villano del curso (un gato hechicero con nombre en francés) guarda la unidad.
     Se le gana por fases de habilidad, como en un juego de jefes: 1 Vocabulario (Memory Rush o Fruit Frenzy),
     2 Escucha (Audio Hunt), 3 Gramática (Language Detective o Phrase Builder), 4 Escritura (Spell Builder) y
     5 Pronunciación (Voice Duel). Si una fase no tiene motor o retos suficientes en esa unidad, se juega con
     reflejos (Fruit Frenzy) y la ruta lo muestra así. Un reto resuelto = un punto de vida del jefe (los aciertos
     parciales no cuentan); un error te quita una vida y el jefe se burla (en francés, con la traducción).
     Estrellas: ganar (1), ganar con 2 vidas (2), sin perder ninguna (3).
     Pantalla: arriba el héroe (vidas) frente al jefe (barra de vida) y la ruta de fases; fondo de escenario por
     fase; antes de cada fase, una tarjeta con el reto del jefe. Efectos: tajo del héroe al acertar, rayo del jefe
     al fallar (sin animación con «reducir movimiento»). Todo el tiempo va por tick (la pausa lo congela).
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
  var IMG = "img/arcade/";
  /* francés: espacio fino sin corte antes de ? ! : ; » y después de « */
  var fr = function(t){ return String(t).replace(/ (?=[?!:;»])/g, " ").replace(/« /g, "« "); };
  /* tres dibujos base; «cara»: punto de la cara (0–1) y zoom para el retrato en círculo */
  var ARTES = {
    noir: { src: "jefe-noir.webp", cara: [.36, .34, 2.1], gestos: true },
    mago: { src: "jefe-mago.webp", cara: [.33, .30, 2.2], gestos: true },
    rey:  { src: "jefe-rey.webp",  cara: [.46, .40, 2.0], gestos: false }
  };
  var HEROE = { src: "heroe.webp", cara: [.6, .3, 2.15] };
  /* las expresiones sueltas tienen otro encuadre */
  var CARA_DE = { "jefe-derrota.webp": [.66, .62, 1.7] };
  /* un villano por curso: dibujo, color (filtro sobre el retrato), nombre y su presentación (francés · español) */
  var JEFES = {
    a1:   { arte: "noir", f: "",                                  nombre: "Professeur Chat Noir", hola: ["Ha, ha, ha… Tu crois pouvoir me battre ?", "Ja, ja, ja… ¿Crees que puedes vencerme?"] },
    a2:   { arte: "mago", f: "",                                  nombre: "Le Mage Minuit",       hola: ["À minuit, ton français va disparaître !", "A medianoche, ¡tu francés va a desaparecer!"] },
    fon:  { arte: "rey",  f: "hue-rotate(-28deg) saturate(1.1)",  nombre: "Le Roi des Échos",     hola: ["Ici, chaque son m'obéit.", "Aquí, cada sonido me obedece."] },
    b11:  { arte: "noir", f: "hue-rotate(-62deg) saturate(1.25)", nombre: "Le Comte Grimoire",    hola: ["Mon grimoire connaît toutes les réponses.", "Mi libro de hechizos conoce todas las respuestas."] },
    b12:  { arte: "mago", f: "hue-rotate(150deg) saturate(1.15)", nombre: "Le Sorcier Brumeux",   hola: ["Dans ma brume, tu vas te perdre.", "En mi niebla, te vas a perder."] },
    b21:  { arte: "rey",  f: "",                                  nombre: "Le Roi Sorcier",       hola: ["À genoux ! Ici, le roi, c'est moi.", "¡De rodillas! Aquí el rey soy yo."] },
    rem:  { arte: "noir", f: "hue-rotate(170deg) saturate(1.2)",  nombre: "Le Baron Rature",      hola: ["Je vois déjà toutes tes fautes.", "Ya veo todos tus errores."] },
    prog: { arte: "mago", f: "hue-rotate(-70deg) saturate(1.3)",  nombre: "Le Grand Archiviste",  hola: ["Ton texte ne passera pas.", "Tu texto no pasará."] },
    c12:  { arte: "rey",  f: "hue-rotate(205deg) saturate(1.1)",  nombre: "Le Roi des Nuances",   hola: ["Tu confonds encore les nuances ?", "¿Todavía confundes los matices?"] },
    lit:  { arte: "noir", f: "hue-rotate(95deg) saturate(1.15)",  nombre: "Le Duc des Lettres",   hola: ["Les grands auteurs sont de mon côté.", "Los grandes autores están de mi lado."] }
  };
  var jefeDe = function(track){ return JEFES[track] || JEFES.a1; };
  /* burlas cortas del jefe (francés · español) */
  var BURLA_FASE = {
    voc:  ["Tu connais au moins trois mots ?", "¿Al menos sabes tres palabras?"],
    oido: ["Écoute bien… si tu peux !", "Escucha bien… ¡si puedes!"],
    gram: ["Ma grammaire est un labyrinthe.", "Mi gramática es un laberinto."],
    ecr:  ["Une seule faute et tu tombes !", "¡Una sola falta y caes!"],
    pro:  ["Parle plus fort, je n'entends rien !", "¡Habla más fuerte, no oigo nada!"],
    ref:  ["Trop lent pour moi !", "¡Demasiado lento para mí!"]
  };
  var BURLA_FALLO = [
    ["Ha ! Trop facile.", "¡Ja! Demasiado fácil."],
    ["Raté ! Encore un effort.", "¡Fallaste! Un esfuerzo más."],
    ["Presque… mais non !", "Casi… ¡pero no!"],
    ["C'est tout ?", "¿Eso es todo?"]
  ];
  var BURLA_GANA = ["Ha, ha, ha ! Reviens t'entraîner.", "¡Ja, ja, ja! Vuelve a entrenar."];
  var BURLA_PIERDE = ["Non… Ce n'est pas possible !", "No… ¡No puede ser!"];

  /* íconos de las fases (trazo propio, sin emojis) */
  var ICO = {
    libro: '<path d="M12 6.5C10.3 5 7.9 4.5 4 4.6v13c3.9-.1 6.3.4 8 1.9 1.7-1.5 4.1-2 8-1.9v-13c-3.9-.1-6.3.4-8 1.9zM12 6.5v13"/>',
    audio: '<path d="M4.5 15.5V12a7.5 7.5 0 0 1 15 0v3.5"/><rect x="3" y="13.5" width="4.6" height="7" rx="2"/><rect x="16.4" y="13.5" width="4.6" height="7" rx="2"/>',
    engranaje: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21M5.6 5.6l1.9 1.9M16.5 16.5l1.9 1.9M5.6 18.4l1.9-1.9M16.5 7.5l1.9-1.9"/><circle cx="12" cy="12" r="6.4"/>',
    lapiz: '<path d="M4.5 19.5l1-4.4L15.6 5a2.1 2.1 0 0 1 3 0l.4.4a2.1 2.1 0 0 1 0 3L8.9 18.5z"/><path d="M13.6 7l3.4 3.4"/>',
    micro: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.6 11.2a6.4 6.4 0 0 0 12.8 0M12 17.6V21M8.6 21h6.8"/>',
    rayo: '<path d="M13.2 2.8L5.6 13.4h5.6l-1 7.8 7.6-10.6h-5.6z" fill="currentColor"/>'
  };
  var icono = function(k){ return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (ICO[k] || ICO.rayo) + "</svg>"; };

  /* retrato: la imagen trae su propio fondo, así que siempre va dentro de un marco con aro */
  var foco = function(c){ var z = c[2], p = function(u){ return ((z * u - .5) / (z - 1) * 100).toFixed(1) + "%"; }; return "background-size:" + (z * 100) + "%;background-position:" + p(c[0]) + " " + p(c[1]); };
  var retrato = function(arte, filtro, clase, src){
    return '<span class="bb-av ' + clase + '" aria-hidden="true"><i style="background-image:url(' + IMG + (src || arte.src) + ");" + foco(CARA_DE[src] || arte.cara) + (filtro ? ";filter:" + filtro : "") + '"></i></span>';
  };

  /* fases por habilidad: [motor, máximo de retos, mínimo para elegirlo]; si ninguno alcanza, reflejos (ff) */
  var FASES = [
    { id: "voc",  nombre: "Vocabulario",   ic: "libro",     fondo: "bg-paris",       n: 3, motores: [["mr", 2, 2], ["ff", 3, 3]] },
    { id: "oido", nombre: "Escucha",       ic: "audio",     fondo: "bg-cafe",        n: 3, motores: [["ah", 3, 3]] },
    { id: "gram", nombre: "Gramática",     ic: "engranaje", fondo: "bg-biblioteca",  n: 3, motores: [["ld", 3, 3], ["pb", 3, 3]] },
    { id: "ecr",  nombre: "Escritura",     ic: "lapiz",     fondo: "bg-universidad", n: 3, motores: [["sb", 3, 2]] },
    { id: "pro",  nombre: "Pronunciación", ic: "micro",     fondo: "bg-noche",       n: 2, motores: [["vd", 2, 2]] }
  ];
  /* segundos que suele tomar un reto de cada motor (para el reloj total de la batalla) */
  var EST = { ff: 8, mr: 28, ah: 11, pb: 16, ld: 16, sb: 14, vd: 14 };
  var nombreJuego = function(id){ var j = G.juegos[id]; return j ? j.nombre : id; };
  /* Fruit Frenzy en la fase de vocabulario: primero las parejas (match) y las categorías (sort) */
  var lexico = function(r){ return r.tipo === "varios" || / →$/.test(r.q || "") || !!r.voc; };

  /* el plan de la batalla: fase por fase, con el motor que tenga retos en esta unidad.
     Un mismo ejercicio no se repite en dos fases. */
  var planJefe = function(alc){
    var usados = {}, retos = [], ruta = [];
    /* un ejercicio (clave del carnet) sale una sola vez; solo Memory Rush puede traer dos tableros del mismo ejercicio grande
       (con parejas distintas), y eso se decide dentro de su fase */
    var clave = function(id, r){ return r.key ? "k|" + r.key : id + "|" + (r.q || "") + "|" + (r.correcta || []).join(" "); };
    var libres = function(id){ return retosDeMotor(id, alc).filter(function(r){ return !usados[clave(id, r)]; }); };
    var toma = function(id, lista, n){
      var tomados = [], deFase = {};
      lista.forEach(function(r){ if (tomados.length >= n) return; var c = clave(id, r); if (usados[c] && !(deFase[c] && r.tipo === "parejas")) return; usados[c] = deFase[c] = 1; tomados.push(r); });
      return tomados;
    };
    /* 1.ª pasada: los motores propios de cada fase, empezando por las habilidades con menos ejercicios
       (escritura, pronunciación, escucha…), para que otra fase no les quite los pocos que hay.
       2.ª pasada: Fruit Frenzy donde haga falta (en vocabulario, primero parejas y categorías). */
    var elegidos = {};
    ["ecr", "pro", "oido", "gram", "voc"].forEach(function(fid){
      var f = FASES.filter(function(x){ return x.id === fid; })[0];
      f.motores.some(function(m){
        if (m[0] === "ff") return false;
        var l = libres(m[0]); if (l.length < m[2]) return false;
        elegidos[fid] = { id: m[0], retos: toma(m[0], mezcla(l), m[1]), reflejos: false }; return true;
      });
    });
    FASES.forEach(function(f){
      if (elegidos[f.id]) return;
      var lista = mezcla(libres("ff"));
      if (f.id === "voc") lista = lista.filter(lexico).concat(lista.filter(function(r){ return !lexico(r); }));
      elegidos[f.id] = { id: "ff", retos: toma("ff", lista, f.n), reflejos: !f.motores.some(function(m){ return m[0] === "ff"; }) };
    });
    FASES.forEach(function(f){
      var el = elegidos[f.id]; if (!el || !el.retos.length) return;
      var paso = { k: ruta.length, id: el.reflejos ? "ref" : f.id, fase: f.nombre, nombre: el.reflejos ? "Reflejos" : f.nombre, ic: el.reflejos ? "rayo" : f.ic, fondo: f.fondo,
        motor: el.id, juego: nombreJuego(el.id), reflejos: el.reflejos, n: el.retos.length };
      ruta.push(paso);
      el.retos.forEach(function(r){ var m = marca(r, el.id); m.fase = paso.k; m.bb = paso; retos.push(m); });
    });
    ruta.forEach(function(p){ p.total = ruta.length; });
    var seg = 20 + retos.reduce(function(a, r){ return a + (EST[r.motor] || 12); }, 0) + 3 * ruta.length;
    seg = Math.max(120, Math.min(300, Math.ceil(seg * (G.aj.sinTiempo ? 1.5 : 1) / 10) * 10));
    return { retos: retos, ruta: ruta, seg: seg };
  };
  /* el plan que se ve en la portada es el que se juega */
  var planes = {};
  var planDe = function(alc, nuevo){ var k = alc.clave; if (nuevo || !planes[k]) planes[k] = planJefe(alc); return planes[k]; };
  var usaPlan = function(alc){ var k = alc.clave, p = planes[k] || planJefe(alc); delete planes[k]; return p; };

  var rutaHUD = function(ruta){
    return '<ol class="bb-ruta" aria-label="Fases del combate">' + ruta.map(function(p){
      return '<li class="bb-rp' + (p.reflejos ? " ref" : "") + '" data-bb-f="' + p.k + '" aria-label="Fase ' + (p.k + 1) + ": " + esc(p.nombre) + '"><span>' + icono(p.ic) + "</span></li>";
    }).join("") + "</ol>";
  };
  var arena = function(alc, plan){
    var J = jefeDe(alc.track), A = ARTES[J.arte];
    return '<div class="bb-arena" data-bb-vida="' + plan.retos.length + '">' +
      '<div class="bb-lado bb-lh">' + retrato(HEROE, "", "bb-av-h") + '<span class="plxg-vidas bb-vidas" aria-label="3 vidas"></span></div>' +
      '<div class="bb-centro"><p class="bb-fila"><b>' + esc(J.nombre) + '</b><span class="plxg-jn">' + plan.retos.length + "/" + plan.retos.length + "</span></p>" +
        '<span class="plxg-jv"><i></i></span>' + rutaHUD(plan.ruta) +
        '<p class="bb-burla" hidden><b lang="fr"></b><small></small></p></div>' +
      '<div class="bb-lado bb-lj">' + retrato(A, J.f, "bb-av-j") + "</div>" +
      '<svg class="bb-fx" aria-hidden="true"><defs><linearGradient id="bbTajoG" x1="0" x2="1"><stop offset="0" stop-color="#FFD200"/><stop offset=".6" stop-color="#FFF6B0"/><stop offset="1" stop-color="#93C5FD"/></linearGradient></defs>' +
        '<path class="bb-tajo" pathLength="100" d="M0 0"/><polyline class="bb-rayo" pathLength="100" points="0,0"/></svg>' +
    "</div>";
  };
  /* portada: logo, el jefe del curso con su presentación y la ruta de fases */
  var portadaExtra = function(alc){
    var J = jefeDe(alc.track), A = ARTES[J.arte], plan = planDe(alc);
    return '<div class="bb-pt">' +
      '<div class="bb-logo"><img src="' + IMG + 'bb-logo.webp" alt="Boss Battle · PLEX PLAY" width="306" height="250"></div>' +
      '<div class="bb-duelo"><span class="bb-carta" aria-hidden="true"><img src="' + IMG + A.src + '" alt=""' + (J.f ? ' style="filter:' + J.f + '"' : "") + "></span>" +
        '<div class="bb-dt"><small>El jefe de este curso</small><b lang="fr">' + esc(J.nombre) + "</b>" +
        '<p class="bb-globo"><span lang="fr">' + esc(fr(J.hola[0])) + "</span><small>" + esc(J.hola[1]) + "</small></p></div></div>" +
      '<h2 class="plxg-h2">Ruta del combate <small>' + plan.ruta.length + (plan.ruta.length === 1 ? " fase" : " fases") + " · " + plan.retos.length + " puntos de vida</small></h2>" +
      '<ol class="bb-rpt">' + plan.ruta.map(function(p){
        return '<li class="' + (p.reflejos ? "ref" : "") + '"><span class="bb-rn">' + (p.k + 1) + '</span><span class="bb-ri">' + icono(p.ic) + "</span>" +
          '<span class="bb-rt"><b>' + esc(p.nombre) + "</b><small>" + (p.reflejos ? "En lugar de " + esc(p.fase.toLowerCase()) + " · pocos ejercicios aquí" : esc(p.juego) + " · " + p.n + (p.n === 1 ? " reto" : " retos")) + "</small></span></li>";
      }).join("") + "</ol></div>";
  };
  /* resultados: el héroe con la victoria o el jefe que se burla */
  var cabeza = function(alc, r){
    var J = jefeDe(alc.track), A = ARTES[J.arte], gana = r.jefe && r.jefe.vencido;
    if (gana) return '<div class="bb-res gana"><span class="bb-rh" aria-hidden="true"><img src="' + IMG + 'heroe.webp" alt=""></span>' +
      '<div class="bb-rd"><p class="bb-rko">' + retrato(A, J.f, "bb-av-j bb-ko", A.gestos ? "jefe-derrota.webp" : "") + '<b lang="fr">' + esc(J.nombre) + "</b></p>" +
      '<p class="bb-globo"><span lang="fr">' + esc(fr(BURLA_PIERDE[0])) + "</span><small>" + esc(BURLA_PIERDE[1]) + "</small></p></div></div>";
    return '<div class="bb-res pierde"><span class="bb-rj" aria-hidden="true"><img src="' + IMG + (A.gestos && J.arte === "noir" ? "jefe-ataque.webp" : A.src) + '" alt=""' + (J.f ? ' style="filter:' + J.f + '"' : "") + "></span>" +
      '<div class="bb-rd"><b lang="fr">' + esc(J.nombre) + '</b><p class="bb-globo"><span lang="fr">' + esc(fr(BURLA_GANA[0])) + "</span><small>" + esc(BURLA_GANA[1]) + "</small></p></div></div>";
  };
  var decoBB = function(){
    return '<svg viewBox="0 0 72 56" aria-hidden="true">' +
      '<path d="M8 50L40 14" stroke="#93C5FD" stroke-width="5" stroke-linecap="round"/><path d="M8 50L40 14" stroke="#EAF3FF" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M6 40l12 11" stroke="#FFD200" stroke-width="4" stroke-linecap="round"/><circle cx="6" cy="53" r="2.6" fill="#FFD200"/>' +
      '<circle cx="48" cy="30" r="20" fill="#1A0F2E" stroke="#E5484D" stroke-width="3"/>' +
      '<path d="M34 26l3-12 8 8M62 26l-3-12-8 8" fill="#0E0818"/><ellipse cx="48" cy="33" rx="13" ry="11" fill="#0E0818"/>' +
      '<path d="M40 30.5q2.6-2.4 5.2 0q-2.6 2.4-5.2 0zM50.8 30.5q2.6-2.4 5.2 0q-2.6 2.4-5.2 0z" fill="#FFD200"/>' +
      '<path d="M35 22q13-9 26 0q-13-4-26 0z" fill="#2B1B4F"/></svg>';
  };

  var BB = G.registrar({
    id: "bb", nombre: "Boss Battle", verbo: "Derrota al jefe de la unidad", familia: "Jefe", color: "#E5484D", orden: 70, vocab: false,
    sinFantasma: true, sinReloj: true, oro: false,
    retos: function(alc){ return planJefe(alc).retos; },
    deco: decoBB,
    portadaExtra: portadaExtra,
    reglas: function(alc){
      /* solo se nombran las fases que esta unidad tiene de verdad (sin retos, una fase se juega con reflejos) */
      var J = jefeDe(alc.track), plan = planDe(alc, true), vistos = {}, fases = [];
      plan.ruta.forEach(function(p){ var n = p.nombre.toLowerCase(); if (!vistos[n]) { vistos[n] = 1; fases.push(n); } });
      var y = fases.length > 1 ? fases.slice(0, -1).join(", ") + " y " + fases[fases.length - 1] : fases[0] || "reflejos";
      var r = [
        J.nombre + " guarda esta unidad: tiene " + plan.retos.length + " puntos de vida. Tú tienes 3 vidas y " + plan.seg + " segundos.",
        "Cada reto que resuelves le quita un punto de vida. Cada error te quita una vida y te muestra la corrección.",
        fases.length > 1 ? "Se lucha por fases, en orden: " + y + ". Antes de cada una, el jefe te reta en francés." : "Se lucha con reflejos: corta la respuesta correcta."
      ];
      if (vistos.reflejos) r.push("Las fases con pocos ejercicios en esta unidad se juegan con reflejos: corta la respuesta correcta.");
      if (vistos["pronunciación"]) r.push("En pronunciación se mide si se entiende lo que dices. Sin micrófono, esa fase se juega de otra forma.");
      r.push("Ganas una estrella por vencerlo, dos si terminas con 2 vidas o más y tres si no pierdes ninguna.");
      return r;
    },
    opciones: function(alc){
      var plan = usaPlan(alc), J = jefeDe(alc.track);
      return {
        seg: plan.seg, ordenFijo: true, oro: false, retos: plan.retos,
        jefe: { vida: plan.retos.length, nombre: J.nombre, html: arena(alc, plan), clase: "bb-hud" },
        estrellas: function(r){ if (!r.jefe || !r.jefe.vencido) return 0; return r.vidas >= 3 ? 3 : r.vidas >= 2 ? 2 : 1; },
        titulo: function(r){ return r.jefe && r.jefe.vencido ? "¡Victoria!" : "¡Inténtalo de nuevo!"; },
        cabeza: function(r){ return cabeza(alc, r); },
        pista: function(r){ return !r.jefe || !r.jefe.vencido ? (r.porVidas ? "Te quedaste sin vidas. " : "Se acabó el tiempo. ") + "Para ganar estrellas hay que vencer al jefe." : r.estrellas < 3 ? "Tres estrellas: vencerlo sin perder ninguna vida." : "Victoria perfecta." }
      };
    },
    montar: function(zona, s){ return motorJefe(zona, s); }
  });

  function motorJefe(zona, s){
    var el = s.el, ar = el.querySelector(".bb-arena");
    var vida = ar ? +ar.getAttribute("data-bb-vida") || 0 : 0;
    var faseMax = -1, faseAhora = -1, fondoK = "", intro = null, burla = null, nFallo = 0, resueltos = {}, porFase = {};
    var q = function(sel){ return ar ? ar.querySelector(sel) : null; };
    el.classList.add("bb-on");
    var fondo = document.createElement("div"); fondo.className = "bb-fondo"; fondo.setAttribute("aria-hidden", "true"); el.insertBefore(fondo, el.firstChild);
    var capa = document.createElement("div"); capa.className = "bb-intro"; capa.hidden = true; el.appendChild(capa);

    /* efectos: se reinicia la animación quitando y poniendo la clase (nada con «reducir movimiento») */
    var anima = function(nodo, clase){ if (!nodo || s.mov) return; nodo.classList.remove(clase); void nodo.getBoundingClientRect(); nodo.classList.add(clase); };
    var centro = function(n, base){ var a = n.getBoundingClientRect(); return { x: a.left - base.left + a.width / 2, y: a.top - base.top + a.height / 2 }; };
    var trazo = function(){
      var svg = q(".bb-fx"), h = q(".bb-av-h"), j = q(".bb-av-j"); if (!svg || !h || !j) return null;
      var b = ar.getBoundingClientRect(); svg.setAttribute("viewBox", "0 0 " + Math.round(b.width) + " " + Math.round(b.height));
      return { svg: svg, a: centro(h, b), b: centro(j, b) };
    };
    var golpe = function(){
      if (s.mov) return;
      var t = trazo(); if (!t) return;
      var m = (t.a.x + t.b.x) / 2;
      t.svg.querySelector(".bb-tajo").setAttribute("d", "M" + (t.a.x + 18) + " " + (t.a.y + 10) + " Q" + m + " " + (t.a.y - 34) + " " + (t.b.x + 4) + " " + (t.b.y - 2));
      anima(t.svg.querySelector(".bb-tajo"), "va"); anima(q(".bb-av-h"), "bb-ataca"); anima(q(".bb-av-j"), "bb-dano");
    };
    var rayo = function(){
      if (s.mov) return;
      var t = trazo(); if (!t) return;
      var n = 7, pts = [];
      for (var i = 0; i <= n; i++) { var k = i / n; pts.push((t.b.x - 20 + (t.a.x + 20 - t.b.x + 20) * k).toFixed(1) + "," + (t.b.y + (t.a.y - t.b.y) * k + (i % 2 ? -1 : 1) * (i && i < n ? 9 : 0)).toFixed(1)); }
      t.svg.querySelector(".bb-rayo").setAttribute("points", pts.join(" "));
      anima(t.svg.querySelector(".bb-rayo"), "va"); anima(q(".bb-av-h"), "bb-herido"); anima(q(".bb-av-j"), "bb-lanza");
    };
    var dice = function(par, seg){
      var b = q(".bb-burla"); if (!b) return;
      b.querySelector("b").textContent = fr(par[0]); b.querySelector("small").textContent = par[1];
      b.hidden = false; burla = { t: seg || 2.6 }; el.classList.add("bb-ataque");
    };
    var calla = function(){ var b = q(".bb-burla"); if (b) b.hidden = true; burla = null; el.classList.remove("bb-ataque"); };

    /* la sesión que ven los motores: la misma, con el golpe al jefe y el rayo del jefe */
    var s2 = Object.create(s);
    s2.acierto = function(r, o){
      o = Object.assign({}, o);
      if (o.dano == null) o.dano = o.final === false ? 0 : 1;   /* una pieza de varias no le quita vida */
      var res = s.acierto(r, o);
      if (o.dano && s.estado() !== "fin") {
        vida = Math.max(0, vida - o.dano); golpe();
        if (r && r.fase != null) { resueltos[r.fase] = (resueltos[r.fase] || 0) + 1; marcaRuta(); }
        if (!vida) { var j = q(".bb-av-j"); if (j) j.classList.add("bb-ko"); }
      }
      return res;
    };
    s2.fallo = function(r, o){
      o = Object.assign({}, o);
      if (!o.etMal && mm.actual() === "ff") o.etMal = "Cortaste";
      if (s.estado() !== "fin") { rayo(); dice(BURLA_FALLO[nFallo++ % BURLA_FALLO.length], 2.8); }
      return s.fallo(r, o);
    };
    var mm = multimotor(zona, s2);

    /* ruta: «hecha» cuando todos los retos de la fase están resueltos (un reto fallado vuelve más tarde),
       «ahora» la fase del reto en juego */
    var marcaRuta = function(){
      if (!ar) return;
      ar.querySelectorAll(".bb-rp").forEach(function(li){ var i = +li.getAttribute("data-bb-f");
        li.classList.toggle("hecha", i !== faseAhora && (resueltos[i] || 0) >= (porFase[i] || 1)); li.classList.toggle("ahora", i === faseAhora); });
    };
    var ponFondo = function(p){
      if (!p || p.fondo === fondoK) return;
      fondoK = p.fondo; fondo.style.backgroundImage = "url(img/" + p.fondo + ".webp)";
    };
    var abreIntro = function(r){
      var p = r.bb, J = jefeDe(s.alc.track), A = ARTES[J.arte], par = BURLA_FASE[p.id] || BURLA_FASE.ref;
      s.banner("");
      capa.innerHTML = '<div class="bb-ic" role="status"><p class="bb-ic-k">Fase ' + (p.k + 1) + " de " + p.total + "</p>" +
        '<p class="bb-ic-t"><span class="bb-ri">' + icono(p.ic) + "</span><b>" + esc(p.nombre) + "</b></p>" +
        '<p class="bb-ic-m">' + (p.reflejos ? "Pocos ejercicios de " + esc(p.fase.toLowerCase()) + " aquí: reflejos con " + esc(p.juego) : esc(p.juego) + " · " + esc((G.juegos[p.motor] || {}).verbo || "")) + "</p>" +
        '<div class="bb-ic-dice">' + retrato(A, J.f, "bb-av-j") + '<p class="bb-globo"><span lang="fr">' + esc(fr(par[0])) + "</span><small>" + esc(par[1]) + "</small></p></div>" +
        '<button class="plxg-btn bb-ic-go" data-bb-go="1">¡A luchar!</button><span class="bb-ic-bar"><i></i></span></div>';
      capa.style.top = (s.techo() + 10) + "px";
      capa.hidden = false; el.classList.add("bb-entre");
      intro = { r: r, t: 0, T: 2.8 };
      s.mz("frenesi");   /* sin globo: la tarjeta ya dice la fase y el globo taparía el pie del motor */
      G.sfx("paso", p.k);
    };
    var cierraIntro = function(){
      if (!intro) return;
      var r = intro.r; intro = null; capa.hidden = true; capa.innerHTML = ""; el.classList.remove("bb-entre");
      mm.jugar(r);
    };
    var clicCapa = function(e){ var b = e.target.closest && e.target.closest("[data-bb-go]"); if (b && intro && s.estado() === "juega") { e.preventDefault(); cierraIntro(); } };
    capa.addEventListener("click", clicCapa);
    var recoloca = function(){ if (intro) capa.style.top = (s.techo() + 10) + "px"; };
    window.addEventListener("resize", recoloca);

    return {
      jugar: function(r){
        var p = r.bb;
        if (p) { porFase[r.fase] = p.n; faseAhora = r.fase; marcaRuta(); }
        if (p && r.fase > faseMax) { faseMax = r.fase; ponFondo(p); abreIntro(r); return; }
        mm.jugar(r);
      },
      tick: function(dt, d, e){
        if (burla) { burla.t -= e === "momento" ? d * 2 : dt; if (burla.t <= 0) calla(); }
        if (intro) {
          if (dt) { intro.t += dt; var bar = capa.querySelector(".bb-ic-bar i"); if (bar) bar.style.transform = "scaleX(" + Math.max(0, 1 - intro.t / intro.T).toFixed(3) + ")"; }
          if (intro.t >= intro.T) cierraIntro();
          return;
        }
        mm.tick(dt, d, e);
      },
      tecla: function(e){
        if (intro) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cierraIntro(); } return; }
        mm.tecla(e);
      },
      pausa: function(){ mm.pausa(); },
      sigue: function(){ mm.sigue(); },
      destruye: function(){
        mm.destruye();
        capa.removeEventListener("click", clicCapa); window.removeEventListener("resize", recoloca);
        capa.remove(); fondo.remove();
        el.classList.remove("bb-on", "bb-ataque", "bb-entre");
      },
      depura: function(){
        var go = intro && capa.querySelector("[data-bb-go]"), pos = function(n){ if (!n) return null; var b = n.getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), w: Math.round(b.width), h: Math.round(b.height) }; };
        var bu = q(".bb-burla");
        return Object.assign(mm.depura(), {
          bb: { fase: faseMax, ahora: faseAhora, intro: !!intro, introT: intro ? intro.t : null, go: pos(go), vida: vida, fondo: fondoK, burla: bu && !bu.hidden ? bu.textContent : "",
            ruta: ar ? [].map.call(ar.querySelectorAll(".bb-rp"), function(li){ return li.classList.contains("hecha") ? "hecha" : li.classList.contains("ahora") ? "ahora" : "pendiente"; }) : [],
            reflejos: ar ? [].map.call(ar.querySelectorAll(".bb-rp"), function(li){ return li.classList.contains("ref"); }) : [] }
        });
      }
    };
  }

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

  /* Boss Battle: escenario (fondo oscurecido para que el texto conserve el contraste) */
  .bb-fondo{position:absolute;inset:0;z-index:0;background:#06173F center/cover no-repeat;pointer-events:none;overflow:hidden}
  .bb-fondo::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,23,63,.86) 0%,rgba(8,31,85,.8) 45%,rgba(6,23,63,.93) 100%)}
  /* barra del jefe: pausa · combo · tiempo · puntos, y abajo el héroe frente al jefe con la ruta */
  .plxg-hud.bb-hud{grid-template-columns:40px minmax(0,1fr) auto auto;row-gap:8px}
  .bb-hud>.plxg-vidas{display:none}
  .bb-hud>.plxg-ib{grid-row:1;grid-column:1}
  .bb-hud>.plxg-sub{grid-row:1;grid-column:2;min-height:0;min-width:0;justify-content:flex-start;overflow:hidden}
  .bb-hud>.plxg-tiempo{grid-row:1;grid-column:3}
  .bb-hud>.plxg-pts{grid-row:1;grid-column:4}
  .bb-hud>.plxg-barra{grid-row:2}
  .bb-hud .plxg-combo{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
  .bb-hud .plxg-fan{display:none}
  .bb-arena{grid-row:3;grid-column:1/-1;position:relative;display:grid;grid-template-columns:50px minmax(0,1fr) 54px;gap:10px;align-items:center;padding:8px 10px;border-radius:16px;
    background:rgba(4,14,40,.62);box-shadow:inset 0 0 0 1px rgba(147,197,253,.22)}
  .bb-lado{display:grid;justify-items:center;gap:4px}
  .bb-av{position:relative;display:block;flex:none;border-radius:50%;overflow:hidden;background:#081F55}
  .bb-av i{position:absolute;inset:0;background-repeat:no-repeat}
  .bb-av::after{content:"";position:absolute;inset:0;border-radius:50%;opacity:0;pointer-events:none}
  .bb-av-h{width:44px;height:44px;box-shadow:0 0 0 2.5px #FFD200,0 0 14px -3px rgba(255,210,0,.7)}
  .bb-av-j{width:52px;height:52px;box-shadow:0 0 0 2.5px #E5484D,0 0 16px -3px rgba(229,72,77,.8)}
  .bb-av-h::after{background:rgba(167,139,250,.75)}
  .bb-av-j::after{background:rgba(229,72,77,.7)}
  .bb-vidas{gap:3px}
  .bb-vidas i{width:14px;height:13px}
  .bb-centro{position:relative;min-width:0;display:grid;gap:5px}
  .bb-fila{margin:0;display:flex;justify-content:space-between;align-items:baseline;gap:8px;min-width:0}
  .bb-fila b{min-width:0;font:800 11.5px/1.15 Poppins,system-ui,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#FFB1B4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bb-fila .plxg-jn{flex:none;font:800 12.5px/1 Poppins,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#fff}
  .bb-ruta{list-style:none;margin:2px 0 0;padding:0;display:flex;justify-content:space-between;align-items:center}
  .bb-rp{position:relative;flex:1;display:flex;justify-content:center}
  .bb-rp+.bb-rp::before{content:"";position:absolute;right:calc(50% + 14px);left:calc(-50% + 14px);top:50%;height:2px;border-radius:2px;background:rgba(147,197,253,.28)}
  .bb-rp.hecha::before,.bb-rp.ahora::before{background:#FFD200}
  .bb-rp span{position:relative;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;color:#93C5FD;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1.5px rgba(147,197,253,.4)}
  .bb-rp svg{width:15px;height:15px}
  .bb-rp.hecha span{background:#1E5BD7;color:#fff;box-shadow:inset 0 0 0 1.5px #93C5FD}
  .bb-rp.ahora span{background:#FFD200;color:#081F55;box-shadow:0 0 0 3px rgba(255,210,0,.3),0 0 14px rgba(255,210,0,.55)}
  .bb-rp.ref:not(.ahora):not(.hecha) span{color:#FFB38A;box-shadow:inset 0 0 0 1.5px rgba(255,122,69,.5)}
  /* la burla tapa solo el centro de la barra del jefe, unos segundos */
  .bb-burla{position:absolute;inset:-4px -2px;z-index:2;margin:0;display:grid;align-content:center;gap:1px;padding:4px 12px;border-radius:12px 12px 4px 12px;background:#fff;color:#0B2D74;
    box-shadow:0 10px 22px -10px rgba(0,0,0,.8),inset 0 0 0 2px #A78BFA}
  .bb-burla[hidden]{display:none}
  .bb-burla b{font:800 15px/1.2 Poppins,system-ui,sans-serif;color:#3B0F6E;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bb-burla small{font:600 12px/1.25 Inter,system-ui,sans-serif;color:#4B5E8C;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bb-burla::after{content:"";position:absolute;right:-7px;top:50%;margin-top:-6px;border:6px solid transparent;border-left-color:#fff;border-right:0}
  /* mientras el jefe ataca, su barra queda sobre la corrección (sin recibir toques) */
  .plxg.bb-ataque .plxg-hud{z-index:11}
  .plxg.bb-ataque .bb-arena{pointer-events:none}
  .bb-fx{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:3}
  .bb-tajo,.bb-rayo{fill:none;stroke-linecap:round;stroke-linejoin:round;opacity:0}
  .bb-tajo{stroke:url(#bbTajoG);stroke-width:7;filter:drop-shadow(0 0 6px rgba(255,210,0,.9))}
  .bb-rayo{stroke:#D8B4FE;stroke-width:4;filter:drop-shadow(0 0 5px #A855F7) drop-shadow(0 0 2px #7C3AED)}
  .bb-tajo.va{animation:bbTajo .5s ease-out forwards}
  .bb-rayo.va{animation:bbRayo .55s linear forwards}
  .bb-av-j.bb-dano{animation:bbTiembla .42s}
  .bb-av-j.bb-dano::after{animation:bbDestello .42s}
  .bb-av-h.bb-herido{animation:bbTiembla .42s .12s}
  .bb-av-h.bb-herido::after{animation:bbDestello .45s .12s}
  .bb-av-h.bb-ataca{animation:bbEmbiste .36s}
  .bb-av-j.bb-lanza{animation:bbEmbisteI .36s}
  .bb-av-j.bb-ko i{filter:grayscale(.85) brightness(.75)!important}
  @keyframes bbTajo{0%{opacity:1;stroke-dasharray:0 100;stroke-dashoffset:0}55%{opacity:1;stroke-dasharray:70 100;stroke-dashoffset:-10}100%{opacity:0;stroke-dasharray:10 100;stroke-dashoffset:-95}}
  @keyframes bbRayo{0%{opacity:1;stroke-dasharray:0 100}35%{opacity:1;stroke-dasharray:100 0}50%{opacity:.3}65%{opacity:1}100%{opacity:0;stroke-dasharray:100 0}}
  @keyframes bbTiembla{0%,100%{transform:none}20%{transform:translate(-4px,1px) rotate(-4deg)}45%{transform:translate(4px,-1px) rotate(3deg)}70%{transform:translate(-2px,0)}}
  @keyframes bbDestello{0%{opacity:0}25%{opacity:1}100%{opacity:0}}
  @keyframes bbEmbiste{0%,100%{transform:none}40%{transform:translateX(6px) scale(1.06)}}
  @keyframes bbEmbisteI{0%,100%{transform:none}40%{transform:translateX(-6px) scale(1.06)}}
  /* tarjeta de fase: el jefe reta antes de cada fase (toca para empezar antes) */
  .bb-intro{position:absolute;left:12px;right:12px;bottom:calc(88px + env(safe-area-inset-bottom));z-index:4;display:grid;align-items:center;justify-items:center;pointer-events:none}
  .bb-intro[hidden]{display:none}
  .bb-ic{pointer-events:auto;width:min(420px,100%);display:grid;gap:10px;justify-items:center;text-align:center;padding:16px 16px 14px;border-radius:22px;
    background:#081F55;box-shadow:inset 0 0 0 2px rgba(255,210,0,.55),0 24px 44px -20px rgba(0,0,0,.9)}
  /* entre fases no se ve lo que dejó el motor anterior */
  .plxg.bb-entre .plxg-zona,.plxg.bb-entre .plxg-ban{visibility:hidden}
  .bb-ic p{margin:0}
  .bb-ic-k{font:700 11px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#93C5FD}
  .bb-ic-t{display:flex;align-items:center;gap:10px}
  .bb-ic-t b{font:800 clamp(24px,7.4vw,30px)/1 Poppins,system-ui,sans-serif;text-transform:uppercase;letter-spacing:-.01em;color:#FFD200}
  .bb-ri{width:34px;height:34px;flex:none;border-radius:50%;display:grid;place-items:center;background:#FFD200;color:#081F55}
  .bb-ri svg{width:19px;height:19px}
  .bb-ic-m{font:600 14px/1.35 Inter,system-ui,sans-serif;color:#DCE6FF}
  .bb-ic-dice{display:flex;align-items:center;gap:12px;text-align:left;width:100%}
  .bb-ic-go{width:100%;min-height:50px}
  .bb-ic-bar{display:block;width:100%;height:4px;border-radius:4px;background:rgba(147,197,253,.18);overflow:hidden}
  .bb-ic-bar i{display:block;height:100%;background:#FFD200;transform-origin:left}
  .bb-globo{position:relative;flex:1;min-width:0;margin:0;padding:9px 12px;border-radius:14px 14px 14px 4px;background:#fff;color:#0B2D74;display:grid;gap:3px;text-align:left;box-shadow:inset 0 0 0 2px #A78BFA}
  .bb-globo span{font:700 15px/1.3 Poppins,system-ui,sans-serif;color:#3B0F6E}
  .bb-globo small{font:600 12.5px/1.35 Inter,system-ui,sans-serif;color:#4B5E8C}
  /* portada */
  .pt-bb .pt-fr{display:none}
  .pt-bb .pt-h{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .pt-bb .pt-verbo{margin-top:18px}
  .bb-pt{display:grid;gap:14px}
  .bb-logo{justify-self:center;width:min(250px,72%);border-radius:22px;overflow:hidden;background:#0B2D74;box-shadow:0 0 0 2px rgba(255,210,0,.55),0 18px 36px -18px rgba(0,0,0,.9)}
  .bb-logo img{display:block;width:100%;height:auto}
  .bb-duelo{display:grid;grid-template-columns:auto minmax(0,1fr);gap:14px;align-items:center}
  .bb-carta{width:112px;height:112px;border-radius:20px;overflow:hidden;background:#1A0F2E;box-shadow:0 0 0 3px #E5484D,0 0 26px -6px rgba(229,72,77,.8)}
  .bb-carta img{display:block;width:100%;height:100%;object-fit:cover;object-position:40% 30%}
  .bb-dt{display:grid;gap:4px;min-width:0}
  .bb-dt>small{font:700 10.5px/1.3 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#FFB1B4}
  .bb-dt>b{font:800 19px/1.15 Poppins,system-ui,sans-serif;color:#fff}
  .bb-dt .bb-globo{margin-top:4px}
  .bb-pt .plxg-h2{margin:6px 0 0}
  .bb-rpt{list-style:none;margin:0;padding:0;display:grid;gap:6px}
  .bb-rpt li{display:grid;grid-template-columns:22px 34px minmax(0,1fr);gap:10px;align-items:center;min-height:48px;padding:6px 12px;border-radius:14px;background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(147,197,253,.16)}
  .bb-rn{font:800 14px/1 Poppins,system-ui,sans-serif;color:#93C5FD;text-align:center}
  .bb-rt{display:grid;gap:1px;min-width:0}
  .bb-rt b{font:700 15px/1.25 Poppins,system-ui,sans-serif;color:#fff}
  .bb-rt small{font-size:12.5px;line-height:1.3;color:#A6B6E0}
  .bb-rpt li.ref .bb-ri{background:#FF7A45;color:#1A0B00}
  /* resultados */
  .bb-res{display:flex;align-items:flex-end;gap:14px;margin:14px 0 16px}
  .bb-rh,.bb-rj{flex:none;width:132px;height:132px;border-radius:24px;overflow:hidden;background:#0B2D74}
  .bb-rh{box-shadow:0 0 0 3px #FFD200,0 0 30px -6px rgba(255,210,0,.75)}
  .bb-rj{box-shadow:0 0 0 3px #E5484D,0 0 30px -6px rgba(229,72,77,.8);background:#1A0F2E}
  .bb-rh img,.bb-rj img{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 30%}
  .bb-rd{flex:1;min-width:0;display:grid;gap:8px;justify-items:start}
  .bb-rd>b{font:800 14px/1.2 Poppins,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#FFB1B4}
  .bb-rko{margin:0;display:flex;align-items:center;gap:10px;min-width:0}
  .bb-rko .bb-av-j{width:40px;height:40px}
  .bb-rko b{min-width:0;font:800 13px/1.2 Poppins,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#FFB1B4}
  @media (max-width:380px){ .bb-rh,.bb-rj{width:112px;height:112px} .bb-carta{width:100px;height:100px} }
  @media (prefers-reduced-motion:reduce){ .bb-fx{display:none} .bb-av,.bb-av::after{animation:none!important} }
  `;
  document.head.appendChild(st);
})();
