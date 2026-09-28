/* PLEX PLAY 1.21.0 — La app con la identidad nueva y el modo oscuro corregido
   - Una sola paleta por tema, la de la identidad de redes: navy noche #0B2D74, royal #1E5BD7 y
     amarillo #FFD200. El modo oscuro tenía cinco juegos de colores encimados de versiones
     anteriores (grises casi negros, violetas, azules) y por eso se veía disparejo.
   - Modo oscuro: fondo navy noche en vez de negro grisáceo; los textos que usaban el navy de la
     marca como color (quedaban oscuros sobre oscuro) pasan a un azul claro legible; los verdes
     oscuros de aciertos pasan a verde claro.
   - Títulos en Poppins, como en la identidad. «PLAY» en amarillo en la bienvenida. */
(function(){
  "use strict";
  if (!document.querySelector('link[data-plx43]')) {
    var l = document.createElement("link");
    l.rel = "stylesheet"; l.setAttribute("data-plx43", "");
    l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap";
    document.head.appendChild(l);
  }

  /* tokens del modo oscuro (se usan igual con data-theme=dark y con el tema del sistema) */
  var OSCURO = `
    --paper:#06173F;--raise:#0E2560;--surf2:#10296A;--surf3:#163275;--line:#1F3A7A;--line-2:#2A4A8E;
    --ink:#EEF3FF;--ink-2:#C9D6F5;--stone:#A6B6E0;--faint:#8B9CCB;--card-edge:#1F3A7A;
    --accent:#6EA0FF;--brand2:#93B8FF;--wash:#132F6E;--brand-ink:#BFD3FF;--pc-blue:#3B7BF0;--pc-blue-d:#2B63E8;
    --good:#4ADE80;--good-bg:#0F3A2A;--good-ink:#86EFAC;--bad:#FF8A8F;--bad-bg:#3A1623;--bad-ink:#FFB1B4;
    --warn:#FFD200;--warn-bg:#33290A;--warn-ink:#FFD866;
    --m-bg:#06173F;--m-card:#0E2560;--m-edge:#1F3A7A;--m-ink:#EEF3FF;--m-mute:#A6B6E0;
    --m-navy:#2B63E8;--m-navy-d:#1E4FC4;--m-navy-2:#3B7BF0;--m-blue:#6EA0FF;--m-blue-bg:#16357A;--m-sky:#16357A;
    --m-green-d:#6BE58E;--m-green-bg:#0F3A2A;--m-red-bg:#3A1623;--m-pink-bg:#3A1630;
    --px-navy:#0B2D74;--px-navy-d:#081F55;--px-chip:#0A2560;--px-blue:#2B63E8;--px-blue2:#3B7BF0;--px-sky:#93C5FD;
    --px-yellow:#FFD200;--px-wash:#132F6E;--px-white:#0E2560;
    --sh-sm:0 1px 2px rgba(0,0,0,.35);--sh:0 10px 26px -12px rgba(0,0,0,.6);--sh-lg:0 24px 48px -20px rgba(0,0,0,.7);
    color-scheme:dark;`;
  /* lo que en oscuro usaba el navy de la marca como color de texto */
  var TEXTO_AZUL = [
    "#player .ctx span", "#player .listen .say", "#player .sp-sent", "#player p.ask .m-n", ".bins .binh",
    ".doc-kpis>div b", ".gbtn.ghost", ".btn.line", ".btn.ghost", ".gbtn.m-soft", ".ghome .greet h1 span",
    ".gpath .crs.on .crs-chev", ".m-course .mc-go", ".m-quote", ".opt[aria-pressed=true] .k",
    ".streak-card .m-skt", ".tok[aria-pressed=true]", ".chipb[aria-pressed=true]", ".mbtn[aria-pressed=true]", ".dtok.sel",
    "nav#tabbar button[aria-current=page]", ".plx-tbtn", ".lx-pick small", ".lb-n em", ".pf-say b"
  ];
  var VERDE = [".ps-ojo em", ".or-err em", ".lxl-m em", ".gretos .r-atel .ri", ".m-chips .c2"];
  var pref = function(sel, antes){ return sel.map(function(s){ return antes + " " + s; }).join(","); };
  var reglasOscuras = function(r){ return `
    ${r}{${OSCURO}}
    ${r} body{background-color:#06173F}
    ${pref(TEXTO_AZUL, r)}{color:#A9C4FF!important}
    ${pref(VERDE, r)}{color:#6BE58E!important}
    ${r} .gretos .r-atel .ri,${r} .m-chips .c2{background:#0F3A2A!important}
    ${r} .pclogin:not(.m-form) .onb-link{color:#A9C4FF}
    ${r} body{background-color:#06173F!important}
    ${r} body nav#tabbar,html.mk:root[data-theme=dark] body nav#tabbar.tabbar{background:rgba(8,24,70,.94)!important;border-color:#1F3A7A!important}
    ${r} .ps-ojo s,${r} .or-err s{color:#FF9EA2!important}
    ${r} .m-ill .m-bub{background:#fff!important;color:#0B2D74!important;}
    ${r} .opt.ok .k{background:#15803D!important;border-color:#15803D!important;color:#fff!important}
    ${r} .plx-liga b{color:color-mix(in srgb,var(--lc) 55%,#fff)!important}
  `; };

  var css = `
  /* ---------- identidad: tokens del tema claro ---------- */
  html:root{
    --px-navy:#0B2D74;--px-navy-d:#081F55;--px-chip:#0A2560;--px-blue:#1E5BD7;--px-blue2:#3B7BF0;--px-sky:#93C5FD;
    --px-yellow:#FFD200;--px-wash:#EAF1FF;--px-white:#F7F9FF;
    --m-navy:#0B2D74;--m-navy-d:#081F55;--m-navy-2:#1E5BD7;--m-blue:#1E5BD7;--m-blue-bg:#E8F0FF;--m-sky:#DCEBFF;
    --accent:#1E5BD7;--brand2:#3B7BF0;--wash:#EAF1FF;--brand-ink:#0B2D74;--pc-blue:#1E5BD7;--pc-blue-d:#0B2D74;
    --m-coral:#D93A48;--m-coral-d:#B82E3B;  /* coral más profundo: el texto blanco de «Empezar» se lee */
    --serif:"Poppins","Plus Jakarta Sans","Segoe UI",system-ui,sans-serif;
  }
  h1,h2,h3,.onb-logo,.gm-t{font-family:"Poppins","Plus Jakarta Sans","Segoe UI",system-ui,sans-serif;letter-spacing:-.015em}

  /* ---------- modo oscuro ---------- */
  ${reglasOscuras("html:root[data-theme=dark]")}
  @media (prefers-color-scheme:dark){ ${reglasOscuras("html:root:not([data-theme=light]):not([data-theme=dark])")} }

  /* nombre de la liga: su color, un poco más oscuro para que se lea sobre blanco */
  .plx-liga b{color:color-mix(in srgb,var(--lc) 72%,#000)}

  /* tarjetas de color de Retos: el texto blanco necesita apoyo sobre los tonos claros del degradado */
  .am-feat .amf{text-shadow:0 1px 2px rgba(0,0,0,.35);box-shadow:inset 0 0 0 999px rgba(0,0,0,.12)!important}
  .am-feat .amf.vc2{background:linear-gradient(135deg,#0F766E,#15803D 70%,#3F7F1C)!important}
  .am-feat .amf.voc{background:linear-gradient(135deg,#C2410C,#D97706)!important}

  /* «PLAY» en amarillo sobre la ilustración de la bienvenida (celular) */
  @media (max-width:899px){ .gonb .onb-splash .onb-logo em{color:#FFD200!important} }
  `;
  var st = document.createElement("style"); st.id = "plx43"; st.textContent = css; document.head.appendChild(st);

  /* Tema «automático»: la app dejaba data-theme vacío y seguía al celular solo con algunas reglas.
     Otras (fondos de burbujas y recuadros) solo cambiaban con data-theme="dark", y en el modo oscuro
     del sistema quedaban blancas con texto claro. Aquí se marca el tema real según el celular. */
  var html = document.documentElement, mq = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
  var automatico = function(){ var p = ""; try { p = localStorage.getItem("cr-theme") || ""; } catch (e) {} return p !== "dark" && p !== "light"; };
  var sincroniza = function(){
    if (!automatico() || !mq) return;
    var t = mq.matches ? "dark" : "light";
    if (html.getAttribute("data-theme") !== t) html.setAttribute("data-theme", t);
  };
  sincroniza();
  if (mq && mq.addEventListener) mq.addEventListener("change", sincroniza);
  new MutationObserver(function(){ if (!html.hasAttribute("data-theme")) sincroniza(); }).observe(html, { attributes: true, attributeFilter: ["data-theme"] });
})();
