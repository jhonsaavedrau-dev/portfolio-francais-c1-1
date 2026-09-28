/* PLEX PLAY 2.4.0 — Un solo lenguaje visual (móvil y PC)
   - Paleta: fondo crema, superficies blancas, tinta azul noche; el azul profundo (#0B2D74 / #1E5BD7) queda para
     acentos (títulos, iconos, un bloque destacado por pantalla) y el amarillo (#FFD200) para la acción principal.
   - Mismas tarjetas en toda la app: radio 20, borde suave y una sola sombra. Mismos botones y títulos de sección.
   - Menús del Arcade (selector, portadas, resultados, salas en línea) y PLEX 1V1 en claro. Durante la partida se
     mantiene un escenario oscuro (los juegos se leen sobre él), más sobrio que el azul intenso anterior.
   - Jugar: jerarquía clara (Juega ahora → Practica y repasa → Aprende más), diseñada para móvil (una columna,
     filas compactas) y para PC (Arcade grande con columna lateral, cuadrículas de 3–4 tarjetas).
   - Arcade en PC: panel lateral fijo (nivel, curso, qué practicar) y los juegos a la derecha; en móvil, en columna. */
(function(){
  "use strict";

  /* ---------- Jugar: columna lateral en PC (1V1 + accesos en línea junto al Arcade) ---------- */
  var reacomoda = function(){
    if (typeof view === "undefined" || view !== "retos") return;
    var top = document.querySelector("#view .jg-top"), rap = document.querySelector("#view .jg-rap"); if (!top || top.querySelector(".jg-side")) return;
    var v1 = top.querySelector(".jg-v1"), lado = document.createElement("div"); lado.className = "jg-side";
    if (v1) lado.appendChild(v1); if (rap) lado.appendChild(rap);
    top.appendChild(lado);
    var rg = document.querySelector("#view .jg-rg");
    /* una sola cuadrícula (venía en grupos de 3, 2, 2… y dejaba huecos) */
    if (rg) { var gs = rg.querySelectorAll(".rgrid"); if (gs.length > 1) { for (var i = 1; i < gs.length; i++) { [].slice.call(gs[i].children).forEach(function(c){ gs[0].appendChild(c); }); gs[i].remove(); } rg.querySelectorAll("h2,h3,.rg-h").forEach(function(h){ h.remove(); }); } }
    if (rg && !(rg.previousElementSibling && rg.previousElementSibling.classList.contains("jg-h"))) { var h = document.createElement("h2"); h.className = "jg-h"; h.textContent = "Practica y repasa"; rg.insertAdjacentElement("beforebegin", h); }
  };
  var _render = typeof render === "function" ? render : null;
  if (_render) render = function(){ var r = _render.apply(this, arguments); try { reacomoda(); } catch (e) {} return r; };

  var st = document.createElement("style"); st.id = "plx63";
  st.textContent = `
  :root{--pp-crema:#FBF7EE;--pp-crema2:#F3EDE0;--pp-tinta:#14213D;--pp-gris:#5E6678;--pp-linea:#E7DFCF;--pp-azul:#1E5BD7;--pp-marino:#0B2D74;--pp-amarillo:#FFD200;
    --pp-sombra:0 1px 2px rgba(20,33,61,.06),0 10px 26px -18px rgba(20,33,61,.35);--pp-r:20px}
  /* ====== base clara ====== */
  :root:not([data-theme=dark]){--paper:var(--pp-crema);--raise:#fff;--line:var(--pp-linea);--ink:var(--pp-tinta);--stone:var(--pp-gris);--surf2:#FFFCF5;--surf3:var(--pp-crema2);--wash:#FFF6D6}
  @media (prefers-color-scheme:dark){:root:not([data-theme=light]){--pp-crema:#0F1424;--pp-crema2:#161C30;--pp-tinta:#EEF1F8;--pp-gris:#A3ABC0;--pp-linea:#262E45;--pp-sombra:0 1px 2px rgba(0,0,0,.4),0 12px 28px -18px rgba(0,0,0,.8)}}
  :root[data-theme=dark]{--pp-crema:#0F1424;--pp-crema2:#161C30;--pp-tinta:#EEF1F8;--pp-gris:#A3ABC0;--pp-linea:#262E45;--pp-sombra:0 1px 2px rgba(0,0,0,.4),0 12px 28px -18px rgba(0,0,0,.8)}
  html.mk body{background:var(--pp-crema)!important}
  html.mk body::before,html.mk body::after{opacity:.35}
  /* tarjetas de toda la app: una sola familia */
  #view .gcard{border-radius:var(--pp-r)!important;border:1px solid var(--pp-linea)!important;box-shadow:var(--pp-sombra)!important;background:var(--raise,#fff)}
  #view h2,#view .gsec,#view .jg-h,#view .av-mh h2,#view .lx-bar h2{font-family:Poppins,system-ui,sans-serif!important;letter-spacing:-.01em;color:var(--pp-tinta)}
  #view .gbtn:not(.ghost):not(.line){border-radius:14px}
  .wrap{--sec-gap:18px}

  /* ====== Jugar ====== */
  .jg{max-width:1180px;margin:0 auto}
  .jg>h1{font:900 clamp(28px,4vw,40px)/1.05 Poppins,system-ui,sans-serif!important;letter-spacing:-.02em;color:var(--pp-tinta)}
  .jg .av-sub{max-width:62ch}
  .jg .jg-h{display:flex;align-items:center;gap:10px;margin:26px 2px 12px!important;font:800 18px/1.2 Poppins,system-ui,sans-serif!important}
  .jg .jg-h::before{content:"";width:6px;height:20px;border-radius:9px;background:var(--pp-amarillo)}
  .jg-top{display:grid!important;grid-template-columns:1fr!important;gap:12px!important}
  .jg-side{display:grid;gap:12px}
  @media (min-width:900px){.jg-top{grid-template-columns:1.55fr 1fr!important;align-items:stretch}.jg .jg-arc{min-height:100%!important}.jg-side{grid-template-rows:auto 1fr}}
  .jg .jg-arc{box-shadow:0 18px 40px -26px rgba(11,45,116,.9)!important}
  .jg-marq i{background:rgba(255,255,255,.12)!important}
  /* PLEX 1V1 y accesos: tarjetas blancas con acento de color */
  .jg .jg-v1{background:var(--raise,#fff)!important;color:var(--pp-tinta)!important;border:1px solid var(--pp-linea)!important;box-shadow:var(--pp-sombra)!important;min-height:0!important;padding:16px!important}
  .jg .jg-v1 *{color:inherit}
  .jg .jg-v1 small,.jg .jg-v1 span{color:var(--pp-gris)!important}
  .jg .jg-v1 .v1-ic,.jg .jg-v1 [class*=ic]{background:linear-gradient(135deg,#EC4899,#8B5CF6)!important;color:#fff!important;border-radius:14px}
  .jg .jg-v1 b{color:var(--pp-tinta)!important;font-family:Poppins,system-ui,sans-serif}
  .jg-rap{margin-top:0!important;grid-template-columns:repeat(3,1fr)!important}
  .jg-mini{border:1px solid var(--pp-linea)!important;box-shadow:var(--pp-sombra)!important;border-radius:18px!important}
  .jg-mini span{width:40px;height:40px;border-radius:12px;display:grid!important;place-items:center;background:var(--pp-crema2)}
  /* Practica y repasa: cuadrícula en PC, filas compactas en móvil */
  .jg .jg-rg .rgrid{display:grid!important;grid-template-columns:1fr!important;gap:10px!important}
  @media (min-width:700px){.jg .jg-rg .rgrid{grid-template-columns:repeat(2,1fr)!important}}
  @media (min-width:1024px){.jg .jg-rg .rgrid{grid-template-columns:repeat(3,1fr)!important}}
  .jg .jg-rg .rcard{margin:0!important;min-height:76px;border-radius:18px!important;border:1px solid var(--pp-linea)!important;box-shadow:var(--pp-sombra)!important;background:var(--raise,#fff)!important;padding:12px 14px!important;align-items:center}
  .jg .jg-rg .rcard .rt b{font:800 15px/1.2 Poppins,system-ui,sans-serif!important;color:var(--pp-tinta)!important}
  .jg .jg-rg .rcard .rt small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:12.5px!important;color:var(--pp-gris)!important}
  .jg .jg-rg .rcard .ri{border-radius:14px!important}
  .jg .jg-rg .rgo{display:none!important}
  .jg .jg-rg h2,.jg .jg-rg h3,.jg .jg-rg .rg-h{display:flex;align-items:center;gap:10px;margin:22px 2px 10px!important;font:800 16px/1.2 Poppins,system-ui,sans-serif!important;color:var(--pp-tinta)!important}
  /* Aprende más: tarjetas blancas con icono de color (sin degradados intensos) */
  .jg .jg-feat>.amf{background:var(--raise,#fff)!important;color:var(--pp-tinta)!important;border:1px solid var(--pp-linea)!important;box-shadow:var(--pp-sombra)!important;min-height:118px!important}
  .jg .jg-feat>.amf::before,.jg .jg-feat>.amf::after{display:none!important}
  .jg .jg-feat>.amf,.jg .jg-feat>.amf *{text-shadow:none!important}
  .jg .jg-feat>.amf b{color:var(--pp-tinta)!important;font:800 15px/1.2 Poppins,system-ui,sans-serif!important}
  .jg .jg-feat>.amf small{color:var(--pp-gris)!important}
  .jg .jg-feat .amf-i{width:44px;height:44px;border-radius:14px;display:grid!important;place-items:center;font-size:24px!important;background:var(--pp-crema2)}
  .jg .jg-feat>.amf:nth-child(4n+1) .amf-i{background:#DCFCE7}.jg .jg-feat>.amf:nth-child(4n+2) .amf-i{background:#EDE9FE}
  .jg .jg-feat>.amf:nth-child(4n+3) .amf-i{background:#DBEAFE}.jg .jg-feat>.amf:nth-child(4n+4) .amf-i{background:#FCE7F3}
  .jg .jg-feat>.amf:hover{transform:translateY(-2px);border-color:var(--pp-azul)!important}

  /* ====== Arcade: menús en claro ====== */
  .plxg:not(.plxg-juego){background:var(--pp-crema)!important;color:var(--pp-tinta)!important}
  .plxg:not(.plxg-juego) .plxg-k{color:var(--pp-azul)!important}
  .plxg:not(.plxg-juego) .plxg-h{color:var(--pp-marino)!important;text-shadow:none!important}
  .plxg:not(.plxg-juego) .plxg-h2{color:var(--pp-tinta)!important}
  .plxg:not(.plxg-juego) .plxg-h2 small{color:var(--pp-gris)!important}
  .plxg:not(.plxg-juego) .plxg-ib{background:var(--raise,#fff)!important;box-shadow:inset 0 0 0 1px var(--pp-linea),var(--pp-sombra)!important}
  .plxg:not(.plxg-juego) .plxg-ib svg{fill:var(--pp-marino)!important}
  .plxg:not(.plxg-juego) .plxg-ib svg path{stroke:var(--pp-marino)!important}
  .plxg:not(.plxg-juego) .plxg-btn.line{color:var(--pp-tinta)!important;box-shadow:inset 0 0 0 2px var(--pp-linea)!important;background:var(--raise,#fff)}
  /* portada del juego */
  .plxg:not(.plxg-juego) .pt-verbo,.plxg:not(.plxg-juego) .pt-u b,.plxg:not(.plxg-juego) .pt-sw b{color:var(--pp-tinta)!important}
  .plxg:not(.plxg-juego) .pt-u span,.plxg:not(.plxg-juego) .pt-sw small,.plxg:not(.plxg-juego) .pt-rec small,.plxg:not(.plxg-juego) .pt-rec p,.plxg:not(.plxg-juego) .hb-lead{color:var(--pp-gris)!important}
  .plxg:not(.plxg-juego) .pt-reglas li{color:var(--pp-tinta)!important}
  .plxg:not(.plxg-juego) .pt-reglas li::before{background:#FFF1B3!important;color:var(--pp-marino)!important}
  .plxg:not(.plxg-juego) .pt-rec,.plxg:not(.plxg-juego) .pt-sw{background:var(--raise,#fff)!important;box-shadow:inset 0 0 0 1px var(--pp-linea)!important;border-color:var(--pp-linea)!important}
  .plxg:not(.plxg-juego) .pt-rec b{color:var(--pp-marino)!important}
  .plxg:not(.plxg-juego) .pt-sw i{background:#CBD2E0!important}
  .plxg:not(.plxg-juego) .pt-sw[aria-checked=true] i{background:#16A34A!important}
  .plxg:not(.plxg-juego) .pt-aviso{background:#FFF6D6!important;color:#7A5B00!important}
  .plxg:not(.plxg-juego) .plxg-wrap hr,.plxg:not(.plxg-juego) [class^="pt-"],.plxg:not(.plxg-juego) [class*=" pt-"]{border-color:var(--pp-linea)!important}
  /* resultados */
  .plxg:not(.plxg-juego) .plxg-big b{color:var(--pp-marino)!important}
  .plxg:not(.plxg-juego) .plxg-big span,.plxg:not(.plxg-juego) .plxg-kv small,.plxg:not(.plxg-juego) .plxg-res small{color:var(--pp-gris)!important}
  .plxg:not(.plxg-juego) .plxg-res b,.plxg:not(.plxg-juego) .plxg-res p,.plxg:not(.plxg-juego) .plxg-res li{color:var(--pp-tinta)}
  .plxg:not(.plxg-juego) .plxg-est svg{fill:#E2DBCB!important}
  .plxg:not(.plxg-juego) .plxg-est i.on svg{fill:#F5B700!important}
  .plxg:not(.plxg-juego) .plxg-errs li{box-shadow:inset 0 0 0 1px var(--pp-linea),var(--pp-sombra)}
  .plxg:not(.plxg-juego) .plxg-kv,.plxg:not(.plxg-juego) .plxg-res [class*=stat]{background:var(--raise,#fff)!important;box-shadow:inset 0 0 0 1px var(--pp-linea)!important}
  .plxg:not(.plxg-juego) .wb-res p{color:var(--pp-marino)!important}.plxg:not(.plxg-juego) .wb-res b{color:var(--pp-tinta)!important}
  /* salas en línea */
  .plxg:not(.plxg-juego) .net .plxg-h{text-shadow:none!important}
  .plxg:not(.plxg-juego) .net-sub,.plxg:not(.plxg-juego) .net-yo small{color:var(--pp-gris)!important}
  .plxg:not(.plxg-juego) .net-yo,.plxg:not(.plxg-juego) .net-lista li{background:var(--raise,#fff)!important;box-shadow:inset 0 0 0 1px var(--pp-linea),var(--pp-sombra)!important}
  .plxg:not(.plxg-juego) .net-yo b,.plxg:not(.plxg-juego) .net-lista b,.plxg:not(.plxg-juego) .net-busca{color:var(--pp-tinta)!important}
  .plxg:not(.plxg-juego) .net-codigo{color:var(--pp-marino)!important;text-shadow:none!important}
  .plxg:not(.plxg-juego) .net-in{box-shadow:inset 0 0 0 2px var(--pp-linea)}
  .plxg:not(.plxg-juego) .net-aviso{background:#FFF6D6!important;color:#7A5B00!important}
  /* durante la partida: escenario oscuro sobrio (antes azul intenso) */
  .plxg.plxg-juego{background:linear-gradient(180deg,#1B2743 0%,#141D35 55%,#10182C 100%)!important}

  /* ====== Arcade (selector) ====== */
  .az{max-width:1180px!important}
  .az-top h1{color:var(--pp-marino)!important;font-size:28px!important}
  .az-tot{background:#FFF1B3!important;color:var(--pp-marino)!important}
  .az-bloque{background:var(--raise,#fff);border-radius:var(--pp-r);padding:14px;box-shadow:inset 0 0 0 1px var(--pp-linea),var(--pp-sombra)}
  .az-bloque h2{color:var(--pp-gris)!important;margin-bottom:10px!important}
  .az-bloque h2 span{background:var(--pp-marino)!important;color:#fff!important}
  .az-niv button,.az-cats button{color:var(--pp-tinta)!important;box-shadow:inset 0 0 0 1.5px var(--pp-linea)!important;background:var(--raise,#fff)}
  .az-niv button[aria-selected=true],.az-cats button[aria-selected=true]{background:var(--pp-marino)!important;color:#fff!important;box-shadow:none!important}
  .az-c{background:var(--pp-crema)!important;box-shadow:inset 0 0 0 1.5px var(--pp-linea)!important;flex-basis:108px!important}
  .az-c b{color:var(--pp-tinta)!important}.az-c small{color:var(--pp-azul)!important}
  .az-c.on{background:#EEF3FF!important;box-shadow:inset 0 0 0 2px var(--pp-azul)!important}
  .az-sel::after{color:var(--pp-azul)!important}
  .az-sel select{background:var(--pp-crema)!important;box-shadow:inset 0 0 0 1.5px var(--pp-linea)!important;color:var(--pp-tinta)!important}
  .az-nota{color:var(--pp-gris)!important}
  .az-j{background:var(--raise,#fff)!important;box-shadow:inset 0 0 0 1px var(--pp-linea),var(--pp-sombra)!important}
  .az-j b{color:var(--pp-tinta)!important}.az-j small{color:var(--pp-gris)!important}.az-j em{color:var(--pp-azul)!important}
  .az-j.on{background:color-mix(in srgb,var(--jc) 10%,#fff)!important;box-shadow:inset 0 0 0 2px var(--jc),0 14px 26px -16px var(--jc)!important}
  .az-est i{color:#E2DBCB!important}.az-est i.on{color:#F5B700!important}
  .az-deco{background:var(--pp-crema2);border-radius:14px;width:max-content;max-width:100%;overflow:hidden!important;padding:4px 8px}
  .az-deco>*{max-width:100%!important}
  .az-pie{background:linear-gradient(0deg,var(--pp-crema) 70%,transparent)!important}
  .az-res small{color:var(--pp-gris)!important}.az-res b{color:var(--pp-tinta)!important}
  /* móvil: todo en columna, compacto */
  .az-bloque+.az-bloque{margin-top:10px!important}
  /* PC: panel lateral fijo y juegos a la derecha */
  @media (min-width:960px){
    .az{display:grid!important;grid-template-columns:340px 1fr;grid-template-rows:auto 1fr;gap:16px 20px;align-items:start;padding-bottom:40px!important}
    .az-top{grid-column:1/-1}
    .az-bloque:nth-of-type(1){grid-column:1;grid-row:2}
    .az-bloque:nth-of-type(2){grid-column:1;grid-row:3;margin-top:0!important}
    .az-jb{grid-column:2;grid-row:2/5;margin-top:0!important}
    .az-cursos{display:grid!important;grid-template-columns:1fr 1fr;overflow-x:hidden!important;overflow-y:auto!important;max-height:min(46vh,380px);padding-right:4px!important;scrollbar-width:thin}
    .az{grid-template-rows:auto auto auto 1fr}
    .az-c{flex-basis:auto!important}
    .az-grid{grid-template-columns:repeat(3,1fr)!important}
    .az-pie{position:sticky!important;grid-column:2;bottom:0;border-radius:var(--pp-r);background:var(--raise,#fff)!important;box-shadow:inset 0 0 0 1px var(--pp-linea),var(--pp-sombra)!important;margin-top:4px;padding:12px 16px!important}
    .az-res{margin-left:0!important}
  }
  @media (min-width:1280px){.az-grid{grid-template-columns:repeat(4,1fr)!important}}

  /* ====== PLEX 1V1 en claro ====== */
  #plx1v1.v1{background:var(--pp-crema)!important;color:var(--pp-tinta)!important}
  #plx1v1 .v1-hero h2,#plx1v1 .v1-hero h1,#plx1v1 .v1-b>h2,#plx1v1 h3.v1-qt{color:var(--pp-tinta)!important}
  #plx1v1 .v1-hero p,#plx1v1 .v1-ask,#plx1v1 .v1-note,#plx1v1 .v1-foot{color:var(--pp-gris)!important}
  #plx1v1 .v1-ctx{background:var(--raise,#fff)!important;border-color:var(--pp-linea)!important;color:var(--pp-tinta)!important}
  #plx1v1 .v1-lv{background:var(--raise,#fff)!important;box-shadow:inset 0 0 0 1px var(--pp-linea)}
  #plx1v1 .v1-lv button{color:var(--pp-tinta)!important}
  #plx1v1 .v1-lv button[aria-pressed=true],#plx1v1 .v1-lv button.on,#plx1v1 .v1-lv button[aria-selected=true]{background:var(--pp-marino)!important;color:#fff!important}
  #plx1v1 .v1-rank{background:var(--raise,#fff)!important;border-color:var(--pp-linea)!important;color:var(--pp-tinta)!important;box-shadow:var(--pp-sombra)}
  #plx1v1 .v1-rw{background:var(--pp-crema)!important}
  #plx1v1 .v1-row button,#plx1v1 .v1-join button{background:var(--raise,#fff)!important;color:var(--pp-tinta)!important;box-shadow:inset 0 0 0 1.5px var(--pp-linea)!important}
  #plx1v1 .v1-join input{box-shadow:inset 0 0 0 1.5px var(--pp-linea)}
  #plx1v1 .v1-top{background:rgba(255,255,255,.88)!important;border-bottom:1px solid var(--pp-linea)!important}
  #plx1v1 .v1-top *{color:var(--pp-tinta)}
  #plx1v1 .v1-sc{color:var(--pp-marino)!important;text-shadow:none}
  #plx1v1 .v1-p.op .v1-sc{color:#BE185D!important}
  #plx1v1 h3.v1-qt{background:var(--raise,#fff)!important;box-shadow:inset 0 0 0 1px var(--pp-linea),var(--pp-sombra)!important}
  #plx1v1 .v1-o{box-shadow:0 4px 0 #C9D6F5,inset 0 0 0 1px var(--pp-linea)!important}
  #plx1v1 .v1-o span{background:var(--pp-marino)!important;color:#FFD200!important}
  #plx1v1 .v1-x{background:var(--raise,#fff)!important;color:var(--pp-tinta)!important;box-shadow:inset 0 0 0 1px var(--pp-linea)}
  :root[data-theme=dark] #plx1v1 .v1-top{background:rgba(22,28,48,.9)!important}
  #plx1v1 .v1-h,#plx1v1 .v1-h *{color:var(--pp-tinta)!important}
  #plx1v1 .v1-h b,#plx1v1 .v1-h strong{color:var(--pp-marino)!important}
  #plx1v1 .v1-h em,#plx1v1 .v1-h span[class*=y],#plx1v1 .v1-h i{color:#E0A800!important}
  :root[data-theme=dark] #plx1v1 .v1-h b,:root[data-theme=dark] #plx1v1 .v1-h strong{color:#fff!important}
  @media (prefers-color-scheme:dark){:root:not([data-theme=light]) #plx1v1 .v1-h b,:root:not([data-theme=light]) #plx1v1 .v1-h strong{color:#fff!important}}
  #plx1v1 .v1-mus{background:var(--raise,#fff)!important;box-shadow:inset 0 0 0 1px var(--pp-linea)}

  /* ====== detalles comunes ====== */
  /* anillo de nivel: el número siempre en blanco sobre el círculo azul (el texto del resumen lo pintaba de tinta) */
  .av-ring b,.av-ph .av-ring b,.av-lv .av-ring b{color:#fff!important;background:var(--pp-marino)!important;font-weight:900!important}
  .av-ring.big{background:conic-gradient(var(--pp-amarillo) calc(var(--p)*1%),var(--pp-linea) 0)!important}
  .av-ring.big b{font-size:1.25rem!important}
  .au-barra{background:rgba(20,29,53,.86)!important}
  @media (min-width:900px){#view .gmain{gap:18px}}
  `;
  document.head.appendChild(st);
  try { if (typeof view !== "undefined" && view === "retos") render(); } catch (e) {}
})();
