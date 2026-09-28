/* PLEX PLAY 2.2.0 — Word Battle y Team Challenge en línea (cada jugador en su teléfono)
   - Tiempo real con los canales de Supabase (broadcast + presencia), como PLEX 1V1: no hacen falta tablas nuevas.
     Nunca se envían correos: solo un id de partida, el apodo y el gato.
   - Word Battle: «Buscar rival» (cola por nivel A1–A2 / B1–B2 / C1), «Jugar con un amigo» (código de 4 letras) o
     «Tengo un código». Un teléfono es el anfitrión: arma los retos (las mismas opciones para los dos), marca el
     ritmo y decide quién acertó primero (por el tiempo que tardó cada uno en su pantalla). Si el rival se va,
     sigue Manzana. Sin conexión: contra Manzana.
   - Team Challenge: «Crear equipo» (código) y «Unirme». De 2 a 4 personas. El anfitrión empieza; cada reto le toca
     a uno (se ve en todos los teléfonos); si falla, lo intenta el siguiente. Meta de aciertos, 3 vidas y 120 s
     para todo el equipo. Reacciones rápidas (👍 🔥 😅 💡) que ven todos.
   - Para probar sin servidor: localStorage «plx-net-local» = "1" usa BroadcastChannel entre pestañas. */
(function(){
  "use strict";
  var G = window.PLXG; if (!G || !G.sesion || !G.registrar) return;
  var esc = G.esc, mezcla = G.mezcla;
  var fx = function(n, x){ try { if (G.fx) G.fx(n, x); } catch (e) {} };

  /* ---------------- yo ---------------- */
  var rid = function(n){ var a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789", s = ""; for (var i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
  var local = function(){ try { return localStorage.getItem("plx-net-local") === "1"; } catch (e) { return false; } };
  var miId = (function(){ var k = "plx-net-id", v = null; try { v = sessionStorage.getItem(k); if (!v) { v = "j" + rid(10); sessionStorage.setItem(k, v); } } catch (e) { v = "j" + rid(10); } return v; })();
  var ME = { get id(){ return (!local() && window.PCB && PCB.uid) || miId; }, get nick(){ try { return (gEnsure().name || "Jugador").slice(0, 18); } catch (e) { return "Jugador"; } }, get cat(){ try { return gEnsure().cat || null; } catch (e) { return null; } } };
  var gato = function(c, mood){ try { return catSVG(c || null, { mood: mood || "happy" }); } catch (e) { return "🐱"; } };
  var hayRed = function(){ if (local()) return true; try { return !!(window.PCB && PCB.sb && PCB.enabled !== false) && navigator.onLine !== false; } catch (e) { return false; } };

  /* ---------------- transporte: canal con mensajes y presencia ---------------- */
  var canalSB = function(nombre, meta, on){
    var lista = [], ch = PCB.sb.channel(nombre, { config: { broadcast: { self: false }, presence: { key: ME.id } } });
    ch.on("broadcast", { event: "m" }, function(m){ var p = m.payload || {}; if (p.to && p.to !== ME.id) return; if (on.msg) on.msg(p.ev, p.d || {}, p.de); });
    ch.on("presence", { event: "sync" }, function(){
      var st = ch.presenceState(); lista = Object.keys(st).map(function(k){ return { id: k, meta: (st[k] && st[k][0]) || {} }; });
      if (on.miembros) on.miembros(lista);
    });
    ch.subscribe(function(estado){
      if (estado === "SUBSCRIBED") { ch.track(Object.assign({ ts: Date.now() }, meta)); if (on.listo) on.listo(); }
      else if ((estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") && on.error) on.error(estado);
    });
    return {
      send: function(ev, d, to){ try { ch.send({ type: "broadcast", event: "m", payload: { ev: ev, d: d || {}, de: ME.id, to: to || null } }); } catch (e) {} },
      miembros: function(){ return lista; },
      cierra: function(){ try { ch.untrack(); } catch (e) {} try { PCB.sb.removeChannel(ch); } catch (e) {} }
    };
  };
  var canalLocal = function(nombre, meta, on){
    var bc = new BroadcastChannel("plxnet:" + nombre), vistos = {}, ts = Date.now(), vivo = true;
    var lista = function(){ var now = Date.now(), l = [{ id: ME.id, meta: Object.assign({ ts: ts }, meta) }]; Object.keys(vistos).forEach(function(k){ if (now - vistos[k].t < 5000) l.push({ id: k, meta: vistos[k].meta }); else delete vistos[k]; }); return l; };
    var avisa = function(){ if (on.miembros) on.miembros(lista()); };
    var hola = function(){ if (vivo) bc.postMessage({ tipo: "hola", id: ME.id, meta: Object.assign({ ts: ts }, meta) }); };
    bc.onmessage = function(e){
      var m = e.data || {};
      if (m.tipo === "hola") { var nuevo = !vistos[m.id]; vistos[m.id] = { t: Date.now(), meta: m.meta }; if (nuevo) { hola(); avisa(); } return; }
      if (m.tipo === "adios") { delete vistos[m.id]; avisa(); return; }
      if (m.tipo === "m" && (!m.to || m.to === ME.id) && on.msg) on.msg(m.ev, m.d || {}, m.de);
    };
    var iv = setInterval(function(){ hola(); var antes = Object.keys(vistos).length; lista(); if (Object.keys(vistos).length !== antes) avisa(); }, 1200);
    setTimeout(function(){ hola(); avisa(); if (on.listo) on.listo(); }, 30);
    return {
      send: function(ev, d, to){ if (vivo) bc.postMessage({ tipo: "m", ev: ev, d: d || {}, de: ME.id, to: to || null }); },
      miembros: lista,
      cierra: function(){ if (!vivo) return; vivo = false; clearInterval(iv); try { bc.postMessage({ tipo: "adios", id: ME.id }); bc.close(); } catch (e) {} }
    };
  };
  var canal = function(nombre, meta, on){ return local() ? canalLocal(nombre, meta, on) : canalSB(nombre, meta, on); };

  /* ---------------- retos compartidos ---------------- */
  var empaqueta = function(alc, jid, n, maxOp){
    var nivel = G.nivel(alc.track), rs = [];
    try { rs = mezcla(G.retosJuego(G.juegos[jid], alc)); } catch (e) {}
    return rs.slice(0, n).map(function(r){
      return { tipo: r.tipo, ask: r.ask, q: r.q, audio: r.audio || null, correcta: r.correcta, malas: r.malas, why: r.why || "", key: r.key || null, hab: r.hab || null,
        ops: G.opcionesReto ? G.opcionesReto(r, Math.min(maxOp, 3 + nivel), nivel) : mezcla([{ t: r.correcta[0], ok: true }].concat(r.malas.slice(0, 2).map(function(x){ return { t: x, ok: false }; }))) };
    });
  };
  var suena = function(t){ if (!t) return; try { var p = speak(t); if (p && p.catch) p.catch(function(){}); } catch (e) {} };
  var BOCINA = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor"/><path d="M13 7a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  var preguntaHTML = function(r){
    return '<small>' + esc(r.ask || "") + "</small>" + (r.q ? '<b lang="fr">' + esc(r.q).replace(/_{2,}/, '<span class="hueco">___</span>') + "</b>" : "") +
      (r.audio ? '<button type="button" class="x-oir" data-net-oir>' + BOCINA + "<span>Escuchar</span></button>" : "");
  };

  /* ---------------- sala de espera ---------------- */
  var CERRAR = '<button type="button" class="plxg-ib" data-net="salir" aria-label="Cerrar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg></button>';
  var marco = function(el, titulo, color, cuerpo){
    el.innerHTML = '<div class="plxg-scroll"><div class="plxg-wrap net" style="--nc:' + color + '"><div class="net-top">' + CERRAR + '<p class="plxg-k">' + esc(titulo) + '</p></div>' + cuerpo + "</div></div>";
  };
  var yoHTML = function(){ return '<div class="net-yo"><span class="net-gato">' + gato(ME.cat, "happy") + "</span><span><small>Juegas como</small><b>" + esc(ME.nick) + "</b></span></div>"; };
  var miembroHTML = function(m, host){ return '<li><span class="net-gato">' + gato(m.meta && m.meta.cat, "happy") + "</span><b>" + esc((m.meta && m.meta.nick) || "Jugador") + "</b>" + (m.id === host ? "<em>Anfitrión</em>" : "") + (m.id === ME.id ? "<em>Tú</em>" : "") + "</li>"; };

  /* ============ arranque de la partida real (después de la sala) ============ */
  var _sesion = G.sesion;
  var arrancar = function(el, alc, juego, acciones, opc, red){
    var st = G.aj.sinTiempo; G.aj.sinTiempo = false;       /* en línea todos juegan con el mismo reloj */
    el.__net = red;
    var r; try { r = _sesion.call(G, el, alc, juego, acciones, Object.assign({ enLinea: true }, opc)); } finally { G.aj.sinTiempo = st; }
    return r;
  };
  var vs = function(el, a, b, color, luego){
    el.innerHTML = '<div class="net-vs" style="--nc:' + color + '"><div class="net-vs-l"><span class="net-gato">' + gato(a.cat, "excited") + "</span><b>" + esc(a.nick) + '</b></div><em>VS</em><div class="net-vs-r"><span class="net-gato">' + gato(b.cat, "excited") + "</span><b>" + esc(b.nick) + "</b></div></div>";
    fx("combo", 3); setTimeout(luego, 1900);
  };

  /* ================= WORD BATTLE ================= */
  var lobbyWB = function(el, alc, juego, acciones, opc, proxy){
    var nivel = G.nivel(alc.track), ch = null, timer = 0, estado = "inicio", sala = null, soyHost = false, empezo = false;
    var limpia = function(){ clearInterval(timer); timer = 0; if (ch) { ch.cierra(); ch = null; } };
    proxy.alCerrar = limpia;
    var inicio = function(msg){
      limpia(); estado = "inicio";
      marco(el, "Word Battle · en línea", juego.color,
        '<h1 class="plxg-h">Word<br>Battle</h1><p class="net-sub">Duelo de francés en tiempo real: gana el punto quien toca primero la respuesta correcta.</p>' + yoHTML() +
        (msg ? '<p class="net-aviso">' + esc(msg) + "</p>" : "") +
        '<div class="net-bts">' +
          '<button type="button" class="plxg-btn net-b" data-net="buscar"' + (hayRed() ? "" : " disabled") + '><span>⚡</span>Buscar rival</button>' +
          '<button type="button" class="plxg-btn line net-b" data-net="crear"' + (hayRed() ? "" : " disabled") + '><span>👥</span>Jugar con un amigo</button>' +
          '<button type="button" class="plxg-btn line net-b" data-net="codigo"' + (hayRed() ? "" : " disabled") + '><span>🔑</span>Tengo un código</button>' +
          '<button type="button" class="plxg-btn line net-b" data-net="bot"><span>🐱</span>Contra Manzana (sin internet)</button>' +
        "</div>" + (hayRed() ? "" : '<p class="net-aviso">Sin conexión: puedes jugar contra Manzana.</p>'));
    };
    var espera = function(txt, extra){
      marco(el, "Word Battle · en línea", juego.color, '<div class="net-radar" aria-hidden="true"><i></i><i></i><i></i><span class="net-gato">' + gato(ME.cat, "curious") + '</span></div><p class="net-busca" aria-live="polite">' + txt + "</p>" + (extra || "") +
        '<button type="button" class="plxg-btn line" data-net="volver">Cancelar</button>');
    };
    var empiezaSala = function(nombre, host, soyCreador){
      if (ch) ch.cierra();
      sala = nombre; soyHost = host === ME.id;
      var rival = null;
      ch = canal(nombre, { nick: ME.nick, cat: ME.cat, lv: nivel }, {
        miembros: function(l){
          if (empezo) return;
          var otros = l.filter(function(m){ return m.id !== ME.id; }).sort(function(a, b){ return (a.meta.ts || 0) - (b.meta.ts || 0); });
          if (otros.length && !rival) {
            rival = otros[0];
            if (soyHost) setTimeout(function(){
              if (empezo || !ch) return;
              var retos = empaqueta(alc, "wb", 40, 4);
              if (retos.length < 4) { inicio("Este tema tiene muy pocos retos para un duelo. Elige otra unidad."); return; }
              ch.send("start", { retos: retos, titulo: alc.titulo, track: alc.track });
              comienza(retos, rival);
            }, 700);
          }
        },
        msg: function(ev, d, de){
          if (ev === "start" && !soyHost && !empezo) { var m = ch.miembros().filter(function(x){ return x.id === de; })[0] || { id: de, meta: {} }; comienza(d.retos, m); }
        },
        error: function(){ inicio("No se pudo conectar. Revisa tu internet."); }
      });
    };
    var comienza = function(retos, rival){
      if (empezo) return; empezo = true; clearInterval(timer);
      var buf = []; if (ch && ch.__on) ch.__on.msg = function(ev, d, de){ buf.push([ev, d, de]); };   /* lo que llegue antes de montar la partida */
      var riv = { id: rival.id, nick: (rival.meta && rival.meta.nick) || "Rival", cat: rival.meta && rival.meta.cat };
      vs(el, ME, riv, juego.color, function(){
        var red = { canal: ch, host: soyHost, rival: riv, retos: retos, buf: buf };
        ch = null;   /* la partida se queda con el canal */
        proxy.real = arrancar(el, { clave: "net:wb", track: alc.track, titulo: "Duelo en línea", sub: "vs " + riv.nick, seg: 90, lecciones: [] }, juego, acciones,
          Object.assign({}, opc, { retos: retos, ordenFijo: true, seg: 90, oro: false }), red);
      });
    };
    var buscar = function(){
      estado = "busca"; var t0 = Date.now(), q = "plx-wb-q-" + nivel;
      espera("Buscando rival de tu nivel…");
      timer = setInterval(function(){ var s = Math.round((Date.now() - t0) / 1000), p = el.querySelector(".net-busca"); if (p) p.textContent = "Buscando rival de tu nivel… " + s + " s"; if (s === 25) { var x = el.querySelector(".net-radar"); if (x) x.insertAdjacentHTML("afterend", '<button type="button" class="plxg-btn net-b" data-net="bot"><span>🐱</span>Jugar contra Manzana mientras tanto</button>'); } }, 1000);
      ch = canal(q, { nick: ME.nick, cat: ME.cat, q: 1 }, {
        miembros: function(l){
          if (estado !== "busca") return;
          var ord = l.slice().sort(function(a, b){ return (a.meta.ts || 0) - (b.meta.ts || 0) || (a.id < b.id ? -1 : 1); }), i = ord.findIndex(function(m){ return m.id === ME.id; });
          if (i < 0) return;
          var par = i % 2 === 0 ? ord[i + 1] : ord[i - 1]; if (!par) return;
          var host = i % 2 === 0 ? ME.id : par.id, otro = host === ME.id ? par.id : ME.id;
          estado = "sala"; var nombre = "plx-wb-r-" + host + "-" + otro;
          ch.cierra(); ch = null; espera("¡Rival encontrado! Conectando…");
          empiezaSala(nombre, host, host === ME.id);
          setTimeout(function(){ if (!empezo && estado === "sala") { estado = "busca"; limpia(); buscar(); } }, 12000);
        },
        error: function(){ inicio("No se pudo conectar. Revisa tu internet."); }
      });
    };
    el.onclick = function(e){
      var b = e.target.closest && e.target.closest("[data-net]"); if (!b || b.disabled) return;
      var a = b.dataset.net; G.despiertaAudio && G.despiertaAudio();
      if (a === "salir") { limpia(); acciones.salir(); return; }
      if (a === "volver") { inicio(); return; }
      if (a === "buscar") { buscar(); return; }
      if (a === "crear") { var c = rid(4); estado = "sala"; espera("Comparte este código con tu amigo:", '<p class="net-codigo">' + c + "</p>"); empiezaSala("plx-wb-c-" + c, ME.id, true); return; }
      if (a === "codigo") {
        marco(el, "Word Battle · en línea", juego.color, '<h2 class="plxg-h2">Código de la sala</h2><input class="net-in" id="netCod" maxlength="4" autocomplete="off" autocapitalize="characters" placeholder="ABCD" aria-label="Código de 4 letras">' +
          '<div class="net-bts"><button type="button" class="plxg-btn" data-net="unir">Unirme</button><button type="button" class="plxg-btn line" data-net="volver">Volver</button></div>');
        var i = el.querySelector("#netCod"); i.focus(); i.onkeydown = function(ev){ if (ev.key === "Enter") el.querySelector("[data-net=unir]").click(); }; return;
      }
      if (a === "unir") { var v = (el.querySelector("#netCod").value || "").trim().toUpperCase(); if (v.length !== 4) return; estado = "sala"; espera("Entrando a la sala " + esc(v) + "…"); empiezaSala("plx-wb-c-" + v, null, false); return; }
      if (a === "bot") { limpia(); empezo = true; el.onclick = null; proxy.real = arrancar(el, alc, juego, acciones, opc, { bot: true, retos: empaqueta(alc, "wb", 40, 4) }); }
    };
    inicio();
  };

  var duelo = { yo: 0, el: 0, rival: "Manzana" };
  function motorDuelo(zona, s){
    var red = s.el.__net || { bot: true, retos: [] }, ch = red.canal || null, bot = !ch, soyHost = bot || !!red.host;
    var retos = red.retos && red.retos.length ? red.retos : [], rival = red.rival || { id: "bot", nick: "Manzana", cat: { coat: "calico" } };
    if (bot) rival = { id: "bot", nick: "Manzana", cat: { coat: "calico" } };
    duelo = { yo: 0, el: 0, rival: rival.nick };
    zona.innerHTML = '<div class="x56 wbn"><div class="wbn-rival"><span class="net-gato">' + gato(rival.cat, "happy") + '</span><span class="wbn-rn"><small>Rival</small><b>' + esc(rival.nick) + '</b></span><span class="wbn-st" aria-live="polite">Pensando…</span><b class="wbn-pr">0</b></div>' +
      '<div class="wbn-q"></div><div class="x-reloj"><i></i></div><p class="x-nota wbn-res" aria-live="polite"></p><div class="x-ops" role="group" aria-label="Respuestas"></div>' +
      '<div class="wbn-yo"><span class="net-gato">' + gato(ME.cat, "happy") + '</span><span class="wbn-rn"><small>Tú</small><b>' + esc(ME.nick) + '</b></span><b class="wbn-py">0</b></div></div>';
    var raiz = zona.firstChild, qEl = raiz.querySelector(".wbn-q"), opsEl = raiz.querySelector(".x-ops"), resEl = raiz.querySelector(".wbn-res"), stEl = raiz.querySelector(".wbn-st"),
      prEl = raiz.querySelector(".wbn-pr"), pyEl = raiz.querySelector(".wbn-py"), reloj = raiz.querySelector(".x-reloj i");
    var latido = 0, k = -1, reto = null, t = 0, T = 8, hecho = false, bloqueado = false, resp = {}, pend = -1, sig = -1, empezado = false, tBot = 0, botOk = true, ultimoRival = Date.now(), cola = [];
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 6) + "px"; };
    var pinta = function(){
      opsEl.innerHTML = (reto ? reto.ops : []).map(function(o, i){
        return '<button type="button" class="x-op' + (o.mal ? " mal" : "") + (o.ok && hecho ? " bien" : "") + '" data-i="' + i + '"' + (o.mal || bloqueado || hecho ? " disabled" : "") + ' lang="fr"><span>' + esc(o.t) + "</span></button>";
      }).join("");
      prEl.textContent = duelo.el; pyEl.textContent = duelo.yo;
    };
    var mostrar = function(n){
      if (n < 0 || n >= retos.length) return;
      k = n; reto = JSON.parse(JSON.stringify(retos[n])); t = 0; hecho = false; bloqueado = false; resp = {}; pend = -1;
      T = s.dir.t() * 1.4 + 4 + (reto.audio ? 1.5 : 0);
      qEl.innerHTML = preguntaHTML(reto); resEl.textContent = ""; stEl.textContent = "Pensando…"; raiz.classList.remove("gano", "perdio");
      s.banner(""); coloca(); pinta(); fx("barrido");
      if (reto.audio) suena(reto.audio);
      if (bot) { tBot = T * (.35 + Math.random() * .45); botOk = Math.random() < [.62, .72, .82][s.nivel]; }
    };
    /* anfitrión: registra respuestas y decide */
    var registra = function(id, ok, tt){
      if (!soyHost || hecho || k < 0) return;
      resp[id] = { ok: ok, t: tt };
      if (id !== ME.id) stEl.textContent = ok ? "¡Respondió!" : "Se equivocó";
      if (ok && pend < 0) pend = .35;   /* espera un poco por si el otro acertó antes en su pantalla */
      var ids = [ME.id, rival.id];
      if (!ok && ids.every(function(x){ return resp[x] && !resp[x].ok; })) resuelve(null);
    };
    var resuelve = function(w){
      if (hecho) return;
      if (w === undefined) { var oks = [ME.id, rival.id].filter(function(x){ return resp[x] && resp[x].ok; }).sort(function(a, b){ return resp[a].t - resp[b].t; }); w = oks[0] || null; }
      if (ch) ch.send("res", { k: k, w: w });
      aplica(k, w);
      sig = 1.5;
    };
    var aplica = function(n, w){
      if (n !== k || hecho) return;
      hecho = true; pinta();
      var c = { x: zona.clientWidth / 2, y: opsEl.offsetTop };
      if (w === ME.id) { duelo.yo++; s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: c.x, y: c.y }); resEl.textContent = "¡Punto para ti!"; raiz.classList.add("gano"); }
      else if (w) { duelo.el++; s.pts.corta(); s.pop(c.x, 80, rival.nick + " +1", "#F472B6"); fx("pierde"); resEl.textContent = rival.nick + " fue más rápido · era «" + reto.correcta[0] + "»"; raiz.classList.add("perdio"); }
      else { resEl.textContent = "Nadie acertó · era «" + reto.correcta[0] + "»"; fx("tictac"); }
      pinta();
    };
    var toca = function(i, b){
      if (!reto || hecho || bloqueado || s.estado() !== "juega") return;
      var o = reto.ops[i]; if (!o) return;
      bloqueado = true;
      if (!o.ok) { o.mal = true; G.sfx("mal"); resEl.textContent = "Fallaste: espera al rival"; }
      else { resEl.textContent = "¡Correcta! Comprobando quién fue primero…"; fx("atrapa"); }
      pinta();
      if (soyHost) registra(ME.id, !!o.ok, t); else if (ch) ch.send("ans", { k: k, ok: !!o.ok, t: t });
    };
    /* mensajes del canal (el canal se creó en la sala; aquí se reemplazan sus manejadores) */
    var alMsg = function(ev, d, de){
      ultimoRival = Date.now();
      if (ev === "k") { if (!empezado || s.estado() === "cuenta") cola.push(d.k); else mostrar(d.k); return; }
      if (ev === "ans" && soyHost && d.k === k) { registra(de, d.ok, d.t); return; }
      if (ev === "res" && !soyHost) { aplica(d.k, d.w); return; }
    };
    if (ch && ch.__on) ch.__on.msg = alMsg;
    (red.buf || []).forEach(function(m){ alMsg(m[0], m[1], m[2]); }); red.buf = [];
    var abandono = function(){
      if (bot) return;
      bot = true; soyHost = true; rival = { id: "bot", nick: "Manzana", cat: { coat: "calico" } }; duelo.rival = "Manzana";
      raiz.querySelector(".wbn-rival .wbn-rn b").textContent = "Manzana (el rival se fue)";
      if (ch) { ch.cierra(); ch = null; }
      if (!hecho && k >= 0) { tBot = t + T * .4; botOk = Math.random() < .7; } else if (k < 0) mostrar(0);
    };
    zona.addEventListener("click", function(e){
      if (e.target.closest && e.target.closest("[data-net-oir]")) { if (reto && reto.audio) suena(reto.audio); return; }
      var b = e.target.closest && e.target.closest("[data-i]"); if (b && opsEl.contains(b)) { e.preventDefault(); toca(+b.dataset.i, b); }
    });
    window.addEventListener("resize", coloca);
    coloca();
    return {
      jugar: function(){
        if (empezado) return; empezado = true;
        if (soyHost) { mostrar(0); if (ch) ch.send("k", { k: 0 }); }
        else if (cola.length) mostrar(cola.pop());
      },
      tick: function(dt){
        if (!dt) return;
        latido += dt; if (ch && latido > 2) { latido = 0; ch.send("hb", {}); }
        if (!bot && Date.now() - ultimoRival > 15000) abandono();
        if (sig >= 0) { sig -= dt; if (sig < 0 && soyHost) { var n = k + 1; if (n >= retos.length) n = 0; if (ch) ch.send("k", { k: n }); mostrar(n); } }
        if (!reto || hecho) return;
        t += dt; reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        if (bot && soyHost && !resp.bot && t >= tBot) registra("bot", botOk, t);
        if (pend >= 0) { pend -= dt; if (pend < 0) resuelve(); }
        if (soyHost && t >= T + .3) resuelve(null);
      },
      tecla: function(e){ if (/^[1-4]$/.test(e.key)) { var b = opsEl.querySelectorAll(".x-op")[+e.key - 1]; if (b && !b.disabled) { e.preventDefault(); toca(+b.dataset.i, b); } } },
      destruye: function(){ window.removeEventListener("resize", coloca); if (ch) { ch.send("bye", {}); ch.cierra(); ch = null; } },
      depura: function(){ return { k: k, host: soyHost, bot: bot, duelo: duelo, T: T, t: t, ops: reto ? reto.ops.map(function(o){ return o.t + (o.ok ? "*" : ""); }) : [] }; }
    };
  }
  var cabezaDuelo = function(){
    var tx = duelo.yo > duelo.el ? "¡Ganaste el duelo!" : duelo.yo === duelo.el ? "¡Empate!" : "¡Ganó " + duelo.rival + "!";
    return '<div class="wb-res"><p>' + esc(tx) + '</p><div><span><small>Tú</small><b>' + duelo.yo + '</b></span><em>VS</em><span><small>' + esc(duelo.rival) + "</small><b>" + duelo.el + "</b></span></div></div>";
  };

  /* ================= TEAM CHALLENGE ================= */
  var COL = ["#FFD200", "#60A5FA", "#F472B6", "#6BE58E"];
  var lobbyTC = function(el, alc, juego, acciones, opc, proxy){
    var nivel = G.nivel(alc.track), meta = [8, 10, 12][nivel], ch = null, soyHost = false, codigo = "", empezo = false, lista = [];
    var limpia = function(){ if (ch) { ch.cierra(); ch = null; } };
    proxy.alCerrar = limpia;
    var inicio = function(msg){
      limpia();
      marco(el, "Team Challenge · en línea", juego.color,
        '<h1 class="plxg-h">Team<br>Challenge</h1><p class="net-sub">De 2 a 4 personas, cada una en su teléfono. Juntos deben lograr ' + meta + ' aciertos antes de que acabe el tiempo.</p>' + yoHTML() +
        (msg ? '<p class="net-aviso">' + esc(msg) + "</p>" : "") +
        '<div class="net-bts"><button type="button" class="plxg-btn net-b" data-net="crear"' + (hayRed() ? "" : " disabled") + '><span>👥</span>Crear equipo</button>' +
        '<button type="button" class="plxg-btn line net-b" data-net="codigo"' + (hayRed() ? "" : " disabled") + '><span>🔑</span>Unirme con código</button>' +
        '<button type="button" class="plxg-btn line net-b" data-net="solo"><span>🎯</span>Practicar solo</button></div>' + (hayRed() ? "" : '<p class="net-aviso">Sin conexión: puedes practicar solo.</p>'));
    };
    var pintaSala = function(){
      var l = lista.slice().sort(function(a, b){ return (a.meta.ts || 0) - (b.meta.ts || 0); }).slice(0, 4), host = soyHost ? ME.id : (l[0] && l[0].id);
      var puede = soyHost && l.length >= 1;
      marco(el, "Team Challenge · sala " + codigo, juego.color,
        '<p class="net-codigo">' + esc(codigo) + '</p><p class="net-sub">' + (soyHost ? "Comparte el código. Empieza cuando estén todos." : "Esperando a que el anfitrión empiece…") + "</p>" +
        '<ul class="net-lista">' + l.map(function(m){ return miembroHTML(m, host); }).join("") + "</ul>" +
        '<div class="net-bts">' + (soyHost ? '<button type="button" class="plxg-btn" data-net="empezar"' + (puede ? "" : " disabled") + ">" + (l.length < 2 ? "Empezar solo" : "¡Empezar con " + l.length + "!") + "</button>" : "") +
        '<button type="button" class="plxg-btn line" data-net="volver">Salir de la sala</button></div>');
    };
    var entra = function(c, host){
      codigo = c; soyHost = host; lista = [];
      ch = canal("plx-tc-" + c, { nick: ME.nick, cat: ME.cat, host: host ? 1 : 0 }, {
        miembros: function(l){ lista = l; if (!empezo) pintaSala(); },
        msg: function(ev, d){ if (ev === "start" && !soyHost && !empezo) comienza(d); },
        error: function(){ inicio("No se pudo conectar. Revisa tu internet."); }
      });
      pintaSala();
    };
    var comienza = function(d){
      empezo = true;
      var buf = []; if (ch && ch.__on) ch.__on.msg = function(ev, dd, de){ buf.push([ev, dd, de]); };
      var red = { canal: ch, host: soyHost, orden: d.orden, nombres: d.nombres, gatos: d.gatos, retos: d.retos, meta: d.meta, buf: buf };
      ch = null;
      fx("combo", 3);
      proxy.real = arrancar(el, { clave: "net:tc", track: alc.track, titulo: "Equipo en línea", sub: d.orden.length + " jugadores", seg: 120, lecciones: [] }, juego, acciones,
        Object.assign({}, opc, { retos: d.retos, ordenFijo: true, seg: 120, oro: false, jefe: { vida: d.meta, nombre: "Meta del equipo · " + d.meta + " aciertos", clase: "tc-hud" } }), red);
    };
    el.onclick = function(e){
      var b = e.target.closest && e.target.closest("[data-net]"); if (!b || b.disabled) return;
      var a = b.dataset.net; G.despiertaAudio && G.despiertaAudio();
      if (a === "salir") { limpia(); acciones.salir(); return; }
      if (a === "volver") { inicio(); return; }
      if (a === "crear") { entra(rid(4), true); return; }
      if (a === "codigo") {
        marco(el, "Team Challenge · en línea", juego.color, '<h2 class="plxg-h2">Código del equipo</h2><input class="net-in" id="netCod" maxlength="4" autocomplete="off" autocapitalize="characters" placeholder="ABCD" aria-label="Código de 4 letras">' +
          '<div class="net-bts"><button type="button" class="plxg-btn" data-net="unir">Unirme</button><button type="button" class="plxg-btn line" data-net="volver">Volver</button></div>');
        var i = el.querySelector("#netCod"); i.focus(); i.onkeydown = function(ev){ if (ev.key === "Enter") el.querySelector("[data-net=unir]").click(); }; return;
      }
      if (a === "unir") { var v = (el.querySelector("#netCod").value || "").trim().toUpperCase(); if (v.length === 4) entra(v, false); return; }
      if (a === "empezar" && soyHost && !empezo) {
        var l = lista.slice().sort(function(x, y){ return (x.meta.ts || 0) - (y.meta.ts || 0); }).slice(0, 4);
        var retos = empaqueta(alc, "tc", 40, 4); if (retos.length < 4) { inicio("Este tema tiene muy pocos retos. Elige otra unidad."); return; }
        var d = { orden: l.map(function(m){ return m.id; }), nombres: l.map(function(m){ return (m.meta && m.meta.nick) || "Jugador"; }), gatos: l.map(function(m){ return m.meta && m.meta.cat; }), retos: retos, meta: meta };
        ch.send("start", d); comienza(d); return;
      }
      if (a === "solo") {
        limpia(); empezo = true; el.onclick = null;
        var rs = empaqueta(alc, "tc", 40, 4);
        proxy.real = arrancar(el, alc, juego, acciones, Object.assign({}, opc, { retos: rs, ordenFijo: true, seg: 120, oro: false, jefe: { vida: meta, nombre: "Meta · " + meta + " aciertos", clase: "tc-hud" } }),
          { solo: true, orden: [ME.id], nombres: [ME.nick], gatos: [ME.cat], retos: rs, meta: meta });
      }
    };
    inicio();
  };

  function motorEquipoRed(zona, s){
    var red = s.el.__net || { solo: true, orden: [ME.id], nombres: [ME.nick], gatos: [ME.cat], retos: [] }, ch = red.canal || null;
    var soyHost = !ch || !!red.host, orden = red.orden.slice(), nombres = red.nombres.slice(), gatos = (red.gatos || []).slice(), retos = red.retos;
    zona.innerHTML = '<div class="x56 tcn"><ul class="tcn-eq"></ul><div class="tcn-turno" aria-live="polite"></div><div class="wbn-q"></div><div class="x-reloj"><i></i></div>' +
      '<p class="x-nota" aria-live="polite"></p><div class="x-ops" role="group" aria-label="Respuestas"></div>' +
      (ch ? '<div class="tcn-emo" role="group" aria-label="Reacciones">' + ["👍", "🔥", "😅", "💡", "🎉"].map(function(e){ return '<button type="button" data-emo="' + e + '">' + e + "</button>"; }).join("") + "</div>" : "") + "</div>";
    var raiz = zona.firstChild, eqEl = raiz.querySelector(".tcn-eq"), turEl = raiz.querySelector(".tcn-turno"), qEl = raiz.querySelector(".wbn-q"), opsEl = raiz.querySelector(".x-ops"), nota = raiz.querySelector(".x-nota"), reloj = raiz.querySelector(".x-reloj i");
    var latido = 0, k = -1, reto = null, turno = 0, intentos = 0, t = 0, T = 10, hecho = false, sig = -1, empezado = false, cola = [], vistos = {};
    var coloca = function(){ raiz.style.paddingTop = (s.techo() + 6) + "px"; };
    var quien = function(){ return orden[turno % orden.length]; };
    var miTurno = function(){ return quien() === ME.id; };
    var pintaEq = function(){
      eqEl.innerHTML = orden.map(function(id, i){ return '<li class="' + (id === quien() ? "cur" : "") + '" style="--c:' + COL[i % 4] + '"><span class="net-gato">' + gato(gatos[i], id === quien() ? "excited" : "happy") + "</span><b>" + esc(id === ME.id ? "Tú" : nombres[i]) + "</b></li>"; }).join("");
      var i = orden.indexOf(quien());
      turEl.innerHTML = miTurno() ? "<b>¡Te toca!</b><span>Responde por el equipo</span>" : "<b>Turno de " + esc(nombres[i] || "tu compañero") + "</b><span>Apóyalo con una reacción</span>";
      raiz.style.setProperty("--tc", COL[i % 4]); raiz.classList.toggle("mio", miTurno());
    };
    var pinta = function(){
      opsEl.innerHTML = (reto ? reto.ops : []).map(function(o, i){
        return '<button type="button" class="x-op' + (o.mal ? " mal" : "") + (o.ok && hecho ? " bien" : "") + '" data-i="' + i + '"' + (o.mal || hecho || !miTurno() ? " disabled" : "") + ' lang="fr"><span>' + esc(o.t) + "</span></button>";
      }).join("");
    };
    var mostrar = function(n, tu){
      if (n < 0 || n >= retos.length) n = n % retos.length;
      k = n; turno = tu; intentos = 0; t = 0; hecho = false; reto = JSON.parse(JSON.stringify(retos[n]));
      T = s.dir.t() * 1.5 + 5 + (reto.audio ? 1.5 : 0);
      qEl.innerHTML = preguntaHTML(reto); nota.textContent = ""; s.banner(""); coloca(); pintaEq(); pinta(); fx("barrido");
      if (reto.audio) suena(reto.audio);
      if (miTurno()) fx("unido");
    };
    var host = function(){ return soyHost; };
    /* el anfitrión decide y avisa a todos */
    var decide = function(de, i){
      if (!host() || hecho || !reto) return;
      if (de !== quien()) return;
      var o = reto.ops[i]; if (!o) return;
      var res;
      if (o.ok) res = { k: k, ok: true, by: de, i: i };
      else { intentos++; res = intentos < Math.min(orden.length, 3) ? { k: k, ok: false, by: de, i: i, turno: turno + 1 } : { k: k, fin: true, by: de, i: i }; }
      if (ch) ch.send("res", res); aplica(res);
    };
    var aplica = function(r){
      if (r.k !== k || hecho) return;
      var c = { x: zona.clientWidth / 2, y: opsEl.offsetTop };
      if (r.ok) {
        hecho = true; pinta(); var i = orden.indexOf(r.by);
        nota.textContent = "¡Punto para el equipo! (" + (r.by === ME.id ? "tú" : nombres[i]) + ")";
        s.acierto(reto, { rapidez: Math.max(0, 1 - t / T), x: c.x, y: c.y }); s.listo();
        if (host()) sig = 1.3; return;
      }
      if (r.ok === false) {
        reto.ops[r.i].mal = true; turno = r.turno; pintaEq(); pinta(); G.sfx("mal");
        nota.textContent = "Ayuda del equipo: ahora lo intenta " + (miTurno() ? "tú" : nombres[orden.indexOf(quien())]); return;
      }
      hecho = true; if (r.i != null) reto.ops[r.i].mal = true; pinta();
      s.fallo(reto, { mal: r.tiempo ? "Se acabó el tiempo" : reto.ops[r.i] ? reto.ops[r.i].t : "", etMal: r.tiempo ? "⏱" : "El equipo eligió", etiqueta: "Correcta", bien: reto.correcta[0], repetir: false });
      if (host()) sig = 3;
    };
    var siguiente = function(){ var n = k + 1, tu = turno + 1; if (ch) ch.send("k", { k: n, turno: tu, orden: orden }); mostrar(n, tu); };
    var alMsg = function(ev, d, de){
      vistos[de] = Date.now();
      if (ev === "k") { orden = d.orden || orden; if (!empezado || s.estado() === "cuenta") cola.push(d); else mostrar(d.k, d.turno); return; }
      if (ev === "ans" && host() && d.k === k) { decide(de, d.i); return; }
      if (ev === "res" && !host()) { aplica(d); return; }
      if (ev === "emo") { var i = orden.indexOf(de); burbuja(d.e, i); return; }
    };
    if (ch && ch.__on) ch.__on.msg = alMsg;
    (red.buf || []).forEach(function(m){ alMsg(m[0], m[1], m[2]); }); red.buf = [];
    var burbuja = function(e, i){
      var li = eqEl.children[i]; if (!li) return;
      var b = document.createElement("span"); b.className = "tcn-bur"; b.textContent = e; li.appendChild(b); setTimeout(function(){ b.remove(); }, 1400); fx("tictac");
    };
    var toca = function(i){
      if (!reto || hecho || !miTurno() || s.estado() !== "juega") return;
      if (host()) decide(ME.id, i); else if (ch) { ch.send("ans", { k: k, i: i }); opsEl.querySelectorAll(".x-op").forEach(function(b){ b.disabled = true; }); }
    };
    zona.addEventListener("click", function(e){
      if (e.target.closest && e.target.closest("[data-net-oir]")) { if (reto && reto.audio) suena(reto.audio); return; }
      var em = e.target.closest && e.target.closest("[data-emo]"); if (em) { if (ch) ch.send("emo", { e: em.dataset.emo }); burbuja(em.dataset.emo, orden.indexOf(ME.id)); return; }
      var b = e.target.closest && e.target.closest("[data-i]"); if (b && opsEl.contains(b)) { e.preventDefault(); toca(+b.dataset.i); }
    });
    window.addEventListener("resize", coloca); coloca(); pintaEq();
    /* alguien se fue: sale del orden; si era el anfitrión, lo reemplaza el primero que queda */
    var arranque = 0;
    var revisa = function(){
      if (!ch) return;
      if (!arranque) arranque = Date.now();
      var now = Date.now(), vivos = orden.filter(function(id){ return id === ME.id || (vistos[id] && now - vistos[id] < 12000) || (!vistos[id] && now - arranque < 12000); });
      if (vivos.length === orden.length) return;
      var hostId = orden[0]; orden = vivos; nombres = red.nombres.filter(function(_, i){ return vivos.indexOf(red.orden[i]) >= 0; }); gatos = (red.gatos || []).filter(function(_, i){ return vivos.indexOf(red.orden[i]) >= 0; });
      if (vivos.indexOf(hostId) < 0 && vivos[0] === ME.id) soyHost = true;
      pintaEq(); pinta();
    };
    return {
      jugar: function(){
        if (empezado) return; empezado = true;
        if (host()) { if (ch) ch.send("k", { k: 0, turno: 0, orden: orden }); mostrar(0, 0); }
        else if (cola.length) { var d = cola.pop(); mostrar(d.k, d.turno); }
        /* en línea, los miembros se oyen con cada mensaje; el anfitrión manda un latido */
      },
      tick: function(dt){
        if (!dt) return;
        if (sig >= 0) { sig -= dt; if (sig < 0 && host()) siguiente(); }
        latido += dt; if (ch && latido > 2) { latido = 0; ch.send("hb", {}); }
        revisa();
        if (!reto || hecho) return;
        t += dt; reloj.style.transform = "scaleX(" + Math.max(0, 1 - t / T).toFixed(3) + ")";
        if (host() && t >= T) { var r = { k: k, fin: true, tiempo: true }; if (ch) ch.send("res", r); aplica(r); }
      },
      tecla: function(e){ if (/^[1-4]$/.test(e.key)) { e.preventDefault(); toca(+e.key - 1); } },
      destruye: function(){ window.removeEventListener("resize", coloca); if (ch) { ch.cierra(); ch = null; } },
      depura: function(){ return { k: k, host: soyHost, orden: orden, turno: turno, mio: miTurno(), ops: reto ? reto.ops.map(function(o){ return o.t + (o.ok ? "*" : ""); }) : [] }; }
    };
  }

  /* ---------------- el canal cambia de manejadores al pasar de la sala a la partida ---------------- */
  var _canal = canal;
  canal = function(nombre, meta, on){ var c = _canal(nombre, meta, on); c.__on = on; return c; };

  /* ---------------- la sala va antes de la partida ---------------- */
  G.sesion = function(el, alc, juego, acciones, opc){
    if (juego && (juego.id === "wb" || juego.id === "tc") && !(opc && opc.enLinea)) {
      var proxy = { real: null, alCerrar: null };
      var out = { destruye: function(){ if (proxy.alCerrar) proxy.alCerrar(); if (proxy.real) proxy.real.destruye(); }, get s(){ return proxy.real && proxy.real.s; } };
      el.classList.remove("plxg-juego");
      (juego.id === "wb" ? lobbyWB : lobbyTC)(el, alc, juego, acciones, opc || {}, proxy);
      return out;
    }
    el.__net = null;
    return _sesion.apply(this, arguments);
  };
  /* el Mystery Challenge y la Aventura no usan estos dos motores (necesitan otra persona) */

  G.registrar({ id: "wb", nombre: "Word Battle", verbo: "Duelo en línea en tiempo real", familia: "Duelo", color: "#EC4899", orden: 58, vocab: true, sinFantasma: true, sinReloj: true, oro: false,
    retos: function(alc){ var n = G.nivel(alc.track); return alc.tema ? G.retosVocab(alc.tema, n, { max: 22 }) : G.retos(alc.lecciones, n, { max: 22 }); },
    apto: function(r){ return r.tipo === "uno" && r.malas && r.malas.length >= 1; },
    deco: function(){ return '<svg viewBox="0 0 72 56" aria-hidden="true"><circle cx="36" cy="28" r="24" fill="#EC4899" opacity=".25"/><circle cx="36" cy="28" r="18" fill="#EC4899"/><text x="36" y="36" text-anchor="middle" font-size="22">⚔️</text></svg>'; },
    aviso: function(){ return "En línea: cada jugador en su teléfono. Busca un rival de tu nivel o invita a un amigo con un código."; },
    reglas: function(){ return ["90 segundos de duelo, cada uno en su teléfono.", "Los dos ven el mismo reto con las mismas opciones: gana el punto quien toca primero la correcta.", "Quien se equivoca queda fuera de ese reto.", "Si tu rival se desconecta, sigue Manzana. Sin internet, puedes jugar contra Manzana."]; },
    opciones: function(){ return { vidas: 3, oro: false, cabeza: cabezaDuelo, titulo: function(){ return duelo.yo > duelo.el ? "¡Ganaste el duelo!" : duelo.yo === duelo.el ? "¡Empate!" : "¡Revancha!"; },
      estrellas: function(){ return duelo.yo > duelo.el ? (duelo.yo >= 2 * Math.max(1, duelo.el) ? 3 : 2) : duelo.yo === duelo.el && duelo.yo ? 1 : 0; } }; },
    montar: function(zona, s){ return motorDuelo(zona, s); } });
  G.registrar({ id: "tc", nombre: "Team Challenge", verbo: "Equipo en línea: cumplan la meta", familia: "Equipo", color: "#22C55E", orden: 60, vocab: true, sinFantasma: true, sinReloj: true, oro: false,
    retos: function(alc){ var n = G.nivel(alc.track); return alc.tema ? G.retosVocab(alc.tema, n, { max: 24 }) : G.retos(alc.lecciones, n, { max: 24 }); },
    apto: function(r){ return r.tipo === "uno" && r.malas && r.malas.length >= 1; },
    deco: function(){ return '<svg viewBox="0 0 72 56" aria-hidden="true"><circle cx="36" cy="28" r="24" fill="#22C55E" opacity=".25"/><circle cx="36" cy="28" r="18" fill="#22C55E"/><text x="36" y="36" text-anchor="middle" font-size="22">🤝</text></svg>'; },
    aviso: function(){ return "En línea: de 2 a 4 personas, cada una en su teléfono. Una crea el equipo y comparte el código."; },
    reglas: function(alc){ var m = [8, 10, 12][G.nivel(alc.track)]; return ["El equipo tiene 3 vidas y 120 segundos para lograr " + m + " aciertos.", "Cada reto le toca a una persona (todos lo ven en su teléfono).", "Si se equivoca, lo intenta la siguiente. Si nadie acierta, el equipo pierde una vida.", "Anímense con reacciones: 👍 🔥 😅 💡 🎉"]; },
    opciones: function(alc){ var m = [8, 10, 12][G.nivel(alc.track)]; return { seg: 120, jefe: { vida: m, nombre: "Meta del equipo · " + m + " aciertos", clase: "tc-hud" },
      estrellas: function(r){ if (!r.jefe || !r.jefe.vencido) return 0; return r.vidas >= 3 ? 3 : r.vidas >= 2 ? 2 : 1; },
      titulo: function(r){ return r.jefe && r.jefe.vencido ? "¡Meta cumplida!" : "¡Casi! Otra vez en equipo"; } }; },
    montar: function(zona, s){ return motorEquipoRed(zona, s); } });

  var st = document.createElement("style"); st.id = "plx58";
  st.textContent = `
  .net{text-align:center}
  .net-top{display:flex;align-items:center;gap:12px;margin-bottom:18px;text-align:left}
  .net-top .plxg-k{margin:0}
  .net .plxg-h{color:var(--nc);text-shadow:0 6px 0 rgba(0,0,0,.35);animation:netTitulo .6s cubic-bezier(.2,1.4,.4,1) both}
  @keyframes netTitulo{from{transform:scale(.6) rotate(-6deg);opacity:0}}
  .net-sub{margin:10px auto 16px;max-width:420px;color:#C9D6F5}
  .net-yo{display:inline-flex;align-items:center;gap:12px;margin:0 auto 18px;padding:10px 18px 10px 10px;border-radius:999px;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 2px rgba(255,255,255,.12);text-align:left}
  .net-yo small{display:block;font:700 11px/1 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#A6B6E0}
  .net-yo b{font:800 17px/1.2 Poppins,system-ui,sans-serif;color:#fff}
  .net-gato{display:inline-grid;place-items:center;width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 50% 35%,#fff,#DCE6FF);overflow:hidden;flex:none}
  .net-gato svg{width:100%;height:100%}
  .net-bts{display:grid;gap:12px;max-width:420px;margin:0 auto}
  .net-b{justify-content:flex-start;gap:12px;text-transform:none}
  .net-b span{font-size:22px}
  .net-aviso{margin:0 auto 14px;max-width:420px;padding:10px 14px;border-radius:12px;background:rgba(255,210,0,.12);color:#FFE58A;font-weight:600}
  .net-radar{position:relative;width:180px;height:180px;margin:26px auto 16px;display:grid;place-items:center}
  .net-radar i{position:absolute;inset:0;border-radius:50%;border:3px solid var(--nc);opacity:0;animation:netOnda 2.4s ease-out infinite}
  .net-radar i:nth-child(2){animation-delay:.8s}.net-radar i:nth-child(3){animation-delay:1.6s}
  .net-radar .net-gato{width:96px;height:96px;box-shadow:0 0 0 6px var(--nc),0 0 40px var(--nc)}
  @keyframes netOnda{from{transform:scale(.4);opacity:.9}to{transform:scale(1.25);opacity:0}}
  .net-busca{font:700 16px/1.4 Poppins,system-ui,sans-serif;color:#fff;margin:0 0 16px}
  .net-codigo{margin:6px 0 16px;font:900 64px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.2em;color:#FFD200;text-shadow:0 6px 0 rgba(0,0,0,.4)}
  .net-in{display:block;width:220px;margin:10px auto 18px;padding:14px;border-radius:16px;border:0;text-align:center;font:900 40px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.3em;text-transform:uppercase;background:#fff;color:#0B2D74}
  .net-lista{list-style:none;margin:0 auto 18px;padding:0;display:grid;gap:10px;max-width:420px}
  .net-lista li{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:18px;background:rgba(255,255,255,.08);text-align:left;animation:netTitulo .4s ease-out both}
  .net-lista b{flex:1;font:800 16px/1.2 Poppins,system-ui,sans-serif;color:#fff}
  .net-lista em{font-style:normal;font:800 11px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:4px 8px;border-radius:99px;background:var(--nc);color:#081F55}
  .net-vs{position:absolute;inset:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;padding:20px;background:linear-gradient(115deg,#1D4ED8 0 49.6%,#fff 49.6% 50.4%,var(--nc) 50.4%)}
  .net-vs>div{display:grid;justify-items:center;gap:10px}
  .net-vs .net-gato{width:120px;height:120px;box-shadow:0 0 0 6px #fff,0 20px 40px rgba(0,0,0,.5)}
  .net-vs b{font:900 20px/1.2 Poppins,system-ui,sans-serif;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.35)}
  .net-vs em{font:900 64px/1 Poppins,system-ui,sans-serif;font-style:italic;color:#FFD200;-webkit-text-stroke:3px #081F55;animation:netVs .6s cubic-bezier(.2,1.6,.4,1) .3s both}
  .net-vs-l{animation:netIzq .5s cubic-bezier(.2,1.3,.4,1) both}.net-vs-r{animation:netDer .5s cubic-bezier(.2,1.3,.4,1) both}
  @keyframes netIzq{from{transform:translateX(-120%)}}@keyframes netDer{from{transform:translateX(120%)}}
  @keyframes netVs{from{transform:scale(4) rotate(-20deg);opacity:0}}
  .wbn{gap:10px}
  .wbn-rival,.wbn-yo{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:18px;background:rgba(236,72,153,.14);box-shadow:inset 0 0 0 2px rgba(236,72,153,.4);flex:none}
  .wbn-yo{background:rgba(96,165,250,.14);box-shadow:inset 0 0 0 2px rgba(96,165,250,.45)}
  .wbn-rival .net-gato,.wbn-yo .net-gato{width:40px;height:40px}
  .wbn-rn{display:grid;flex:1;text-align:left}.wbn-rn small{font:700 10px/1 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#A6B6E0}.wbn-rn b{font:800 15px/1.2 Poppins,system-ui,sans-serif;color:#fff}
  .wbn-st{font:700 12px/1 Inter,system-ui,sans-serif;color:#F9A8D4}
  .wbn-pr,.wbn-py{font:900 30px/1 Poppins,system-ui,sans-serif;color:#F472B6;min-width:36px;text-align:right}.wbn-py{color:#60A5FA}
  .wbn-q{flex:1 1 auto;min-height:0;display:grid;align-content:center;gap:8px;text-align:center;padding:14px;border-radius:20px;background:rgba(255,255,255,.06)}
  .wbn-q small{font:700 13px/1.35 Inter,system-ui,sans-serif;color:#C9D6F5}
  .wbn-q b{font:800 clamp(18px,5vw,24px)/1.3 Poppins,system-ui,sans-serif;color:#fff}
  .wbn-q .hueco{color:#FFD200}
  .wbn-q .x-oir{justify-self:center}
  .wbn.gano .wbn-yo{box-shadow:inset 0 0 0 3px #6BE58E,0 0 30px rgba(107,229,142,.6)}
  .wbn.perdio .wbn-rival{box-shadow:inset 0 0 0 3px #F472B6,0 0 30px rgba(244,114,182,.6)}
  .wbn-res{min-height:20px;font-weight:800}
  .tcn{gap:10px;--tc:#FFD200}
  .tcn-eq{list-style:none;margin:0;padding:0;display:flex;justify-content:center;gap:10px;flex:none}
  .tcn-eq li{position:relative;display:grid;justify-items:center;gap:4px;padding:6px 8px;border-radius:16px;opacity:.6;transition:transform .2s,opacity .2s}
  .tcn-eq li.cur{opacity:1;transform:translateY(-4px) scale(1.08);background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 2px var(--c)}
  .tcn-eq .net-gato{width:44px;height:44px;box-shadow:0 0 0 3px var(--c)}
  .tcn-eq b{font:800 12px/1 Poppins,system-ui,sans-serif;color:#fff}
  .tcn-bur{position:absolute;top:-18px;left:50%;font-size:28px;animation:tcnBur 1.4s ease-out forwards;pointer-events:none}
  @keyframes tcnBur{from{transform:translate(-50%,10px) scale(.4);opacity:0}20%{transform:translate(-50%,0) scale(1.2);opacity:1}to{transform:translate(-50%,-40px) scale(1);opacity:0}}
  .tcn-turno{display:grid;gap:2px;text-align:center;flex:none}
  .tcn-turno b{font:900 20px/1.2 Poppins,system-ui,sans-serif;color:var(--tc)}.tcn-turno span{font:600 12px/1.3 Inter,system-ui,sans-serif;color:#C9D6F5}
  .tcn.mio .tcn-turno b{animation:tcnTurno .8s ease-in-out infinite alternate}
  @keyframes tcnTurno{to{transform:scale(1.12)}}
  .tcn:not(.mio) .x-ops{opacity:.55}
  .tcn .x-op{box-shadow:0 4px 0 var(--tc),0 12px 24px -12px rgba(0,0,0,.7)}
  .tcn-emo{display:flex;justify-content:center;gap:8px;flex:none}
  .tcn-emo button{all:unset;cursor:pointer;width:44px;height:44px;border-radius:14px;display:grid;place-items:center;font-size:22px;background:rgba(255,255,255,.1)}
  .tcn-emo button:active{transform:scale(.9)}
  @media (prefers-reduced-motion:reduce){.net .plxg-h,.net-radar i,.net-vs-l,.net-vs-r,.net-vs em,.tcn-bur,.tcn.mio .tcn-turno b{animation:none!important}}
  `;
  document.head.appendChild(st);
})();
