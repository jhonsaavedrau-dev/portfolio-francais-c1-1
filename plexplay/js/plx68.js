/* PLEX PLAY 2.9.4 · Widget y notificaciones de la app Android
   Envía a la app (puente PlexAndroid.setWidget, app 2.1+) lo que muestran el widget de la pantalla de inicio
   y los avisos de Manzana: racha, XP de hoy y meta, último día con práctica, curso, siguiente lección
   y la palabra del día. En el navegador no hace nada.
   También atiende los botones de la notificación y del widget: «Practicar» abre la siguiente lección. */
(function(){
  var A = window.PlexAndroid;
  if (!A || !A.setWidget) return;

  var PAL = [
    ["la flânerie", "el paseo sin rumbo", "J'adore la flânerie au bord de la Seine."],
    ["le goûter", "la merienda", "Les enfants prennent leur goûter à quatre heures."],
    ["dépaysant", "que te saca de tu rutina", "Ce voyage a été très dépaysant."],
    ["la veille", "la víspera", "La veille de l'examen, je me couche tôt."],
    ["chaleureux", "cálido, acogedor", "Merci pour cet accueil chaleureux."],
    ["un coup de foudre", "un flechazo", "Ça a été le coup de foudre."],
    ["épanouir (s')", "realizarse, florecer", "Elle s'épanouit dans son travail."],
    ["la rentrée", "la vuelta a clases", "La rentrée est en septembre."],
    ["bouquiner", "leer (familiar)", "Le dimanche, j'aime bouquiner."],
    ["une aubaine", "una ganga, una oportunidad", "Ce billet à vingt euros, c'est une aubaine !"],
    ["flemmard", "perezoso", "Ne sois pas flemmard, on y va !"],
    ["le bouchon", "el trancón", "Il y a un bouchon sur l'autoroute."],
    ["débrouillard", "espabilado, que se las arregla", "Il est très débrouillard."],
    ["la grasse matinée", "quedarse en la cama hasta tarde", "Samedi, je fais la grasse matinée."],
    ["chouette", "genial", "C'est chouette, ton idée !"],
    ["un truc", "una cosa", "Passe-moi ce truc, s'il te plaît."],
    ["épuisé", "agotado", "Après le match, je suis épuisé."],
    ["se régaler", "disfrutar comiendo", "On s'est régalés au restaurant."],
    ["le quotidien", "el día a día", "Le français fait partie de mon quotidien."],
    ["un défi", "un reto", "Apprendre une langue est un beau défi."],
    ["davantage", "más", "Il faut lire davantage."],
    ["désormais", "de ahora en adelante", "Désormais, je pratique chaque jour."],
    ["à peine", "apenas", "Il est à peine huit heures."],
    ["autrement dit", "dicho de otro modo", "Autrement dit, il faut s'entraîner."],
    ["la lueur", "el destello", "Une lueur d'espoir est apparue."],
    ["rigoler", "reírse (familiar)", "On a bien rigolé hier soir."],
    ["le décalage horaire", "la diferencia horaria", "Le décalage horaire me fatigue."],
    ["avoir le cafard", "estar bajoneado", "Le lundi, j'ai un peu le cafard."],
    ["la trouvaille", "el hallazgo", "Ce petit café est une vraie trouvaille."],
    ["s'entraîner", "entrenar, practicar", "Je m'entraîne à parler tous les jours."]
  ];

  var hoyKey = function(){ try { return dkey(new Date()); } catch (e) { return ""; } };
  var diaNum = function(){ return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000); };

  /* palabra del día: primero del vocabulario del curso (si ya se cargó), si no, de la lista propia */
  var palabra = function(tid){
    var n = diaNum(), V = window.__VOCAB && tid && window.__VOCAB[tid];
    if (V && V.themes) {
      var todas = []; V.themes.forEach(function(t){ (t.i || []).forEach(function(w){ if (w.fr && w.es) todas.push(w); }); });
      if (todas.length) { var w = todas[n % todas.length]; return [w.fr, w.es, w.ex || ""]; }
    }
    return PAL[n % PAL.length];
  };

  /* último día con algo de práctica (XP > 0), hasta 60 días atrás */
  var ultimoDia = function(){
    try {
      var d = new Date();
      for (var i = 0; i < 60; i++) { if (dayXP(d) > 0) return dkey(d); d.setDate(d.getDate() - 1); }
    } catch (e) {}
    return "";
  };

  var datos = function(){
    var G = gEnsure(), xp = dayXP(new Date()) | 0, meta = (G.goalXP | 0) || 20;
    var tid = typeof track === "string" ? track : "";
    var tr = tid && typeof TRACKS !== "undefined" ? TRACKS.find(function(t){ return t.id === tid; }) : null;
    var sig = tid && window.PLXRuta ? window.PLXRuta.siguiente(tid) : null;
    var w = palabra(tid);
    return {
      streak: streak() | 0, xp: xp, goal: meta, done: xp >= meta, day: hoyKey(), lastAny: ultimoDia(),
      name: String(G.name || ""), course: tr ? String(tr.label || tr.title || tid) : "",
      next: sig ? String(sig.title || "") : "", nextId: sig ? String(sig.id) : "",
      fr: w[0], es: w[1], ex: w[2]
    };
  };

  var ultimo = "";
  var enviar = function(){
    try {
      var j = JSON.stringify(datos());
      if (j === ultimo) return;
      ultimo = j; A.setWidget(j);
    } catch (e) {}
  };

  /* «Practicar» desde la notificación o el widget: la siguiente lección del curso actual */
  window.__plexPracticar = function(){
    try {
      var tid = typeof track === "string" ? track : "", sig = tid && window.PLXRuta ? window.PLXRuta.siguiente(tid) : null;
      if (sig && typeof openLesson === "function") { openLesson(sig.id); return; }
      if (typeof go === "function") go("lecciones");
    } catch (e) {}
  };

  document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "hidden") enviar(); });
  setInterval(enviar, 30000);
  if (typeof finish === "function") {
    var _finish = finish;
    finish = function(){ var r = _finish.apply(this, arguments); setTimeout(enviar, 300); return r; };
  }
  setTimeout(enviar, 1500);
})();
