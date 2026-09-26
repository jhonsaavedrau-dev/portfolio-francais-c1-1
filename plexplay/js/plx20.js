
/* PLEX PLAY 1.10 — barra superior nueva, animaciones e iluminación */
(function(){
  "use strict";
  var q=function(s,r){return (r||document).querySelector(s)};
  var css=`
  /* ---------- fondo con luz ---------- */
  html.mk body{background:
    radial-gradient(1100px 520px at 8% -8%,rgba(96,134,255,.20),transparent 62%),
    radial-gradient(900px 520px at 105% 4%,rgba(255,170,200,.18),transparent 58%),
    radial-gradient(900px 700px at 50% 115%,rgba(255,214,140,.16),transparent 60%),
    var(--paper)!important;background-attachment:fixed!important}
  html.mk[data-theme=dark] body{background:
    radial-gradient(1100px 520px at 8% -8%,rgba(70,100,255,.22),transparent 62%),
    radial-gradient(900px 520px at 105% 4%,rgba(180,80,160,.16),transparent 58%),
    var(--paper)!important}
  @media (prefers-color-scheme:dark){html.mk:not([data-theme=light]) body{background:
    radial-gradient(1100px 520px at 8% -8%,rgba(70,100,255,.22),transparent 62%),
    radial-gradient(900px 520px at 105% 4%,rgba(180,80,160,.16),transparent 58%),
    var(--paper)!important}}

  /* ---------- barra superior ---------- */
  html.mk body header#topbar.top{background:transparent!important;box-shadow:none!important;border:0!important;padding:10px 12px 4px!important;height:auto!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
  html.mk body header#topbar .topbar-in{position:relative;max-width:1480px!important;margin:0 auto!important;min-height:66px;padding:9px 10px 9px 9px!important;border-radius:26px;display:flex!important;align-items:center;gap:12px;
    background:linear-gradient(180deg,#2c4fb8 0%,#1f3f9c 48%,#1a3689 100%)!important;
    box-shadow:0 14px 34px -14px rgba(22,44,120,.65),0 2px 6px rgba(22,44,120,.18),inset 0 1px 0 rgba(255,255,255,.22),inset 0 -1px 0 rgba(0,0,0,.18);overflow:hidden;animation:plxDrop .6s cubic-bezier(.2,.9,.3,1.1) both}
  html.mk body header#topbar .topbar-in::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(420px 90px at 18% -30%,rgba(255,255,255,.22),transparent 70%),radial-gradient(300px 80px at 85% 130%,rgba(120,160,255,.25),transparent 70%)}
  html.mk body header#topbar .pc-mark{position:relative;display:flex!important;align-items:center;gap:12px;color:#fff!important;font-weight:900!important;font-size:1.45rem!important;letter-spacing:.01em;padding-right:14px;white-space:nowrap}
  html.mk body header#topbar .pc-mark .mz-logo{width:48px!important;height:48px!important;margin:0!important;border-radius:15px;object-fit:cover;border:2.5px solid #4f7dff;box-shadow:0 0 0 3px rgba(79,125,255,.25),0 6px 14px -6px rgba(0,0,0,.5);transition:transform .35s cubic-bezier(.2,.9,.3,1.3)}
  html.mk body header#topbar .pc-mark:hover .mz-logo{transform:rotate(-6deg) scale(1.06)}
  html.mk body header#topbar .pc-mark em{color:#fcc419!important;font-style:normal;text-shadow:0 0 18px rgba(252,196,25,.35)}
  html.mk body header#topbar svg.plx-spark{width:30px!important;height:30px!important;margin:-18px 0 0 -4px!important;flex:none;color:#fcc419;overflow:visible;background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;padding:0!important}
  .plx-spark path{stroke:currentColor;stroke-width:3.4;stroke-linecap:round;animation:plxSpark 2.8s ease-in-out infinite}
  .plx-spark path:nth-child(2){animation-delay:.15s}.plx-spark path:nth-child(3){animation-delay:.3s}
  html.mk body header#topbar #nav{display:flex;align-items:center;gap:6px;padding:0 14px;margin:0!important;border-left:1px solid rgba(255,255,255,.16);border-right:1px solid rgba(255,255,255,.16);min-height:44px}
  html.mk body header#topbar #nav button{display:flex!important;align-items:center;gap:9px;padding:11px 18px!important;border-radius:18px!important;color:#e3eaff!important;font-weight:700!important;font-size:1rem!important;background:transparent!important;border:0!important;box-shadow:none!important;transition:background .25s,transform .2s,color .2s}
  html.mk body header#topbar #nav button svg{width:22px!important;height:22px!important;flex:none}
  html.mk body header#topbar #nav button:hover{background:rgba(255,255,255,.10)!important;transform:translateY(-1px)}
  html.mk body header#topbar #nav button[aria-current=page]{color:#fff!important;background:linear-gradient(180deg,#4c7bff,#3461ea)!important;box-shadow:0 8px 18px -8px rgba(60,110,255,.9),inset 0 1px 0 rgba(255,255,255,.3)!important}
  html.mk body header#topbar #nav button[aria-current=page] svg{fill:#fff;stroke:#fff}
  html.mk body header#topbar .topbar-end{display:flex!important;align-items:center;gap:10px;margin-left:auto}
  html.mk body header#topbar #stats{display:flex!important;align-items:center;gap:10px}
  html.mk body header#topbar .gpill{display:inline-flex!important;align-items:center;gap:8px;padding:8px 16px!important;border-radius:999px!important;background:rgba(9,22,72,.55)!important;border:1px solid rgba(255,255,255,.08)!important;color:#fff!important;font-weight:900;font-size:1.15rem;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
  html.mk body header#topbar .gpill b{color:#fff!important}
  html.mk body header#topbar .gpill svg{width:24px;height:24px}
  html.mk body header#topbar .gpill:first-child svg{color:#ff6b2c;fill:#ff6b2c;filter:drop-shadow(0 0 6px rgba(255,120,40,.6));animation:plxFlame 1.8s ease-in-out infinite;transform-origin:50% 90%}
  html.mk body header#topbar .gpill:nth-child(2) svg{color:#fcc419;fill:#fcc419;filter:drop-shadow(0 0 6px rgba(252,196,25,.5))}
  html.mk body header#topbar .gpill.plx-bump{animation:plxBump .5s cubic-bezier(.2,.9,.3,1.4)}
  html.mk body header#topbar .gavatar{display:inline-flex!important;align-items:center;gap:6px;padding:3px 10px 3px 3px!important;border-radius:999px!important;background:rgba(255,255,255,.12)!important;border:0!important;color:#fff!important;width:auto!important;height:auto!important}
  html.mk body header#topbar .gavatar>svg:first-child,html.mk body header#topbar .gavatar>img:first-child{width:46px!important;height:46px!important;border-radius:50%;background:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.6)}
  html.mk body header#topbar .gavatar .plx-chev{width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2.6;transition:transform .2s}
  html.mk body header#topbar .gavatar:hover .plx-chev{transform:translateY(2px)}
  html.mk body header#topbar .theme-btn{width:48px!important;height:48px!important;padding:0!important;border-radius:50%!important;display:grid!important;place-items:center;background:rgba(255,255,255,.13)!important;border:0!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)!important;transition:transform .2s cubic-bezier(.2,.9,.3,1.4),background .2s}
  html.mk body header#topbar .theme-btn span{display:none!important}
  html.mk body header#topbar .theme-btn svg{width:22px!important;height:22px!important}
  html.mk body header#topbar .theme-btn:hover{background:rgba(255,255,255,.22)!important;transform:translateY(-2px)}
  html.mk body header#topbar .theme-btn:active{transform:scale(.92)}
  html.mk body header#topbar #qsBtn svg{transition:transform .5s ease}
  html.mk body header#topbar #qsBtn:hover svg{transform:rotate(90deg)}
  html.mk body header#topbar .fr-l{display:none!important}
  @media (max-width:1440px){html.mk body header#topbar .topbar-in{gap:8px} html.mk body header#topbar #nav{padding:0 8px;gap:2px} html.mk body header#topbar #nav button{padding:10px 13px!important;font-size:.95rem!important} html.mk body header#topbar .theme-btn{width:44px!important;height:44px!important} html.mk body header#topbar .topbar-end{gap:7px} html.mk body header#topbar .gpill{padding:7px 13px!important;font-size:1.05rem} html.mk body header#topbar .pc-mark{font-size:1.3rem!important;padding-right:6px}}
  @media (max-width:1100px){html.mk body header#topbar #nav button{padding:10px 12px!important} html.mk body header#topbar #musicBtn,html.mk body header#topbar #sfxBtn,html.mk body header#topbar #themeBtn{display:none!important}}
  @media (max-width:860px){
    html.mk body header#topbar.top{padding:8px 8px 2px!important}
    html.mk body header#topbar .topbar-in{min-height:58px;border-radius:22px;padding:7px 8px 7px 7px!important;gap:8px}
    html.mk body header#topbar #nav{display:none!important}
    html.mk body header#topbar .pc-mark{font-size:1.15rem!important;gap:9px;padding-right:0}
    html.mk body header#topbar .pc-mark .mz-logo{width:40px!important;height:40px!important;border-radius:12px}
    html.mk body header#topbar svg.plx-spark{width:22px!important;height:22px!important;margin-top:-14px!important}
    html.mk body header#topbar #stats{display:flex!important;gap:6px}
    html.mk body header#topbar .gpill{padding:6px 10px!important;font-size:.98rem;gap:5px}
    html.mk body header#topbar .gpill svg{width:19px;height:19px}
    html.mk body header#topbar .gpill.hide-xs{display:inline-flex!important}
    html.mk body header#topbar .gavatar{display:none!important}
    html.mk body header#topbar .theme-btn{width:42px!important;height:42px!important}
  }
  @media (max-width:480px){html.mk body header#topbar svg.plx-spark{display:none!important} html.mk body header#topbar .pc-mark{font-size:1.05rem!important} html.mk body header#topbar .gpill{padding:5px 9px!important;font-size:.92rem}}
  @media (max-width:360px){html.mk body header#topbar .pc-mark .plx-name{display:none}}

  /* ---------- barra inferior (celular) ---------- */
  @media (max-width:860px){
    html.mk body nav#tabbar.tabbar{left:10px!important;right:10px!important;bottom:calc(8px + env(safe-area-inset-bottom,0px))!important;border-radius:24px!important;border:1px solid rgba(30,58,138,.08)!important;padding:6px!important;background:rgba(255,255,255,.92)!important;box-shadow:0 14px 34px -14px rgba(22,44,120,.45),0 2px 6px rgba(22,44,120,.1)!important}
    html.mk[data-theme=dark] body nav#tabbar.tabbar{background:rgba(22,22,28,.9)!important;border-color:rgba(255,255,255,.08)!important}
    html.mk body nav#tabbar.tabbar button{border-radius:18px!important;transition:transform .2s cubic-bezier(.2,.9,.3,1.4),background .25s,color .2s}
    html.mk body nav#tabbar.tabbar button:active{transform:scale(.92)}
    html.mk body nav#tabbar.tabbar button[aria-current=page]{background:linear-gradient(180deg,#4c7bff,#3461ea)!important;color:#fff!important;box-shadow:0 8px 18px -8px rgba(60,110,255,.9)!important}
    html.mk body nav#tabbar.tabbar button[aria-current=page] svg{background:transparent!important;color:#fff!important;animation:plxHop .45s cubic-bezier(.2,.9,.3,1.4)}
    html.mk #view{padding-bottom:96px}
  }

  /* ---------- tarjetas, botones, detalles ---------- */
  html.mk .gcard{border-color:rgba(30,58,138,.08)!important;box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 12px 30px -20px rgba(30,58,138,.45),0 2px 6px -2px rgba(30,58,138,.08)!important;transition:transform .3s cubic-bezier(.2,.9,.3,1.2),box-shadow .3s}
  html.mk[data-theme=dark] .gcard{border-color:rgba(255,255,255,.06)!important;box-shadow:0 1px 0 rgba(255,255,255,.05) inset,0 16px 34px -20px rgba(0,0,0,.8)!important}
  @media (hover:hover){html.mk button.gcard:hover,html.mk .gcard.m-course:hover,html.mk .crs:hover,html.mk .rcard:hover{transform:translateY(-3px);box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 22px 40px -22px rgba(30,58,138,.55)!important}}
  html.mk .crs-th,html.mk .m-course img,html.mk .m-hero{transition:transform .6s cubic-bezier(.2,.8,.2,1)}
  @media (hover:hover){html.mk .crs:hover .crs-th,html.mk .m-course:hover img{transform:scale(1.06)}}
  html.mk .gbtn,html.mk .btn{position:relative;overflow:hidden;transition:transform .15s ease,box-shadow .25s,filter .2s}
  html.mk .gbtn:not(.ghost)::after,html.mk .btn:not(.line)::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.18),transparent 55%);pointer-events:none}
  html.mk .gbtn:active,html.mk .btn:active{transform:translateY(2px) scale(.985)}
  @media (hover:hover){html.mk .gbtn:not(.ghost):hover,html.mk .btn:not(.line):hover{filter:brightness(1.06)}}
  html.mk .gbar i,html.mk .t-prog .gbar i{position:relative;overflow:hidden;transition:width .9s cubic-bezier(.2,.8,.2,1)}
  html.mk .gbar i::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%);transform:translateX(-100%);animation:plxShine 2.8s ease-in-out 1s infinite}



  /* ---------- NAVBAR · componentes según la hoja de referencia ---------- */
  :root{--px-navy:#1E3A8A;--px-navy-d:#172f73;--px-chip:#152c6b;--px-blue:#2563EB;--px-blue2:#3B82F6;--px-sky:#60A5FA;--px-yellow:#FACC15;--px-orange:#F97316;--px-wash:#E8EEFF;--px-white:#F8FAFF;--px-shadow:0 4px 16px rgba(37,99,235,.15)}
  html.mk body header#topbar .topbar-in{background:linear-gradient(180deg,#2446a6 0%,var(--px-navy) 55%,#1b3582 100%)!important;border-radius:28px!important;border:1px solid rgba(96,165,250,.28)!important;box-shadow:var(--px-shadow),0 18px 36px -18px rgba(23,47,115,.75),inset 0 1px 0 rgba(255,255,255,.18)!important}
  html.mk body header#topbar .pc-mark{font-family:"Plus Jakarta Sans","Poppins","Inter",system-ui,sans-serif!important;font-weight:800!important}
  html.mk body header#topbar .pc-mark .mz-logo{border:3px solid var(--px-blue2)!important;border-radius:16px!important;box-shadow:0 0 0 1px rgba(255,255,255,.12),0 6px 14px -6px rgba(0,0,0,.55)!important;background:#2b4fae}
  html.mk body header#topbar .pc-mark em{color:var(--px-yellow)!important}
  html.mk body header#topbar svg.plx-spark{color:var(--px-yellow)!important}
  /* botones de navegación */
  html.mk body header#topbar .px-navbtn{font-family:"Inter",system-ui,sans-serif!important;font-weight:600!important;color:#fff!important;border-radius:18px!important;background:transparent!important;outline:none}
  html.mk body header#topbar .px-navbtn svg{stroke:#fff!important;stroke-width:2!important;opacity:.95}
  html.mk body header#topbar .px-navbtn:hover{background:rgba(59,130,246,.45)!important;transform:none}
  html.mk body header#topbar .px-navbtn:active{transform:scale(.97)}
  html.mk body header#topbar .px-navbtn[aria-current=page]{background:linear-gradient(180deg,#3274f2,var(--px-blue))!important;box-shadow:0 6px 16px -6px rgba(37,99,235,.9),inset 0 1px 0 rgba(255,255,255,.28)!important}
  html.mk body header#topbar .px-navbtn[aria-current=page] svg{fill:#fff!important}
  html.mk body header#topbar .px-navbtn[aria-current=page] svg [fill=none]{fill:#fff}
  html.mk body header#topbar .px-navbtn:focus-visible,html.mk body header#topbar .px-iconbtn:focus-visible,html.mk body header#topbar .px-avatar:focus-visible,html.mk body header#topbar .pc-mark:focus-visible{outline:3px solid var(--px-yellow)!important;outline-offset:2px}
  html.mk body header#topbar .px-navbtn:disabled,html.mk body header#topbar .px-navbtn[aria-disabled=true]{opacity:.45;pointer-events:none}
  /* chips de racha y coronas */
  html.mk body header#topbar .px-chip{background:var(--px-chip)!important;border:1px solid rgba(96,165,250,.18)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -2px 0 rgba(0,0,0,.18)!important;font-family:"Plus Jakarta Sans","Inter",system-ui,sans-serif!important;font-weight:800!important}
  html.mk body header#topbar .px-chip.px-fire svg{color:var(--px-orange)!important;fill:var(--px-orange)!important;stroke:#ffb36b!important}
  html.mk body header#topbar .px-chip.px-crown svg{color:var(--px-yellow)!important;fill:var(--px-yellow)!important;stroke:#ffe27a!important}
  /* avatar */
  html.mk body header#topbar .px-avatar{background:rgba(96,165,250,.16)!important;border:1px solid rgba(96,165,250,.22)!important}
  html.mk body header#topbar .px-avatar>svg:first-child,html.mk body header#topbar .px-avatar>img:first-child{box-shadow:0 0 0 3px var(--px-wash)!important}
  html.mk body header#topbar .px-avatar .plx-chev{width:26px!important;height:26px!important;padding:5px;border-radius:50%;background:rgba(255,255,255,.14)}
  html.mk body header#topbar .px-avatar:hover{background:rgba(59,130,246,.35)!important}
  /* botones de acción */
  html.mk body header#topbar .px-iconbtn{background:#2a4bb0!important;border:1px solid rgba(96,165,250,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 2px 6px -2px rgba(0,0,0,.35)!important}
  html.mk body header#topbar .px-iconbtn svg{stroke:#fff!important}
  html.mk body header#topbar .px-iconbtn:hover{background:var(--px-blue2)!important;transform:translateY(-1px)}
  html.mk body header#topbar .px-iconbtn:active,html.mk body header#topbar .px-iconbtn[aria-pressed=true]:active{background:var(--px-blue)!important;transform:scale(.92)}
  html.mk body header#topbar .px-iconbtn:disabled,html.mk body header#topbar .px-iconbtn[aria-disabled=true]{background:var(--px-wash)!important;border-color:transparent!important;pointer-events:none}
  html.mk body header#topbar .px-iconbtn:disabled svg{stroke:#9aa6c7!important}
  html.mk body header#topbar .px-iconbtn.px-off{background:rgba(255,255,255,.08)!important}
  html.mk body header#topbar .px-iconbtn.px-off svg{opacity:.7}
  /* variante compacta */
  @media (max-width:1600px){
    html.mk body header#topbar .topbar-in{min-height:58px;border-radius:24px!important}
    html.mk body header#topbar .px-navbtn{padding:9px 12px!important;font-size:.9rem!important;gap:7px}
    html.mk body header#topbar .px-navbtn svg{width:19px!important;height:19px!important}
    html.mk body header#topbar .px-chip{padding:6px 12px!important;font-size:1rem}
    html.mk body header#topbar .px-iconbtn{width:40px!important;height:40px!important}
    html.mk body header#topbar .px-iconbtn svg{width:19px!important;height:19px!important}
    html.mk body header#topbar .px-avatar>svg:first-child{width:40px!important;height:40px!important}
    html.mk body header#topbar .pc-mark .mz-logo{width:42px!important;height:42px!important}
  }
  html.mk body nav#tabbar.tabbar button[aria-current=page]{background:linear-gradient(180deg,#3274f2,var(--px-blue))!important}
  /* ---------- dictado: controles ---------- */
  html.mk body .deck{border-radius:22px!important;overflow:hidden}
  html.mk body .deck .deck-top{display:grid!important;grid-template-columns:1fr!important;justify-items:center;gap:12px;padding:18px 16px 8px!important;text-align:center}
  html.mk body .deck .transport{display:flex!important;align-items:center;justify-content:center;gap:14px}
  html.mk body .deck .tbtn{width:52px!important;height:52px!important;border-radius:50%!important;display:grid!important;place-items:center;background:var(--raise)!important;color:var(--m-navy,#1e3a8a)!important;border:2px solid var(--line)!important;border-bottom-width:4px!important;box-shadow:none!important;transition:transform .15s ease,border-bottom-width .15s}
  html.mk body .deck .tbtn svg{width:22px!important;height:22px!important}
  html.mk body .deck .tbtn:active{transform:translateY(2px);border-bottom-width:2px!important}
  html.mk body .deck .tbtn.main{width:72px!important;height:72px!important;background:linear-gradient(180deg,#4c7bff,#3461ea)!important;color:#fff!important;border:0!important;box-shadow:0 5px 0 #1f3f9c,0 12px 24px -10px rgba(52,97,234,.7)!important}
  html.mk body .deck .tbtn.main svg{width:30px!important;height:30px!important}
  html.mk body .deck .tbtn.main:active{transform:translateY(4px);box-shadow:0 1px 0 #1f3f9c!important}
  html.mk body .deck .deck-info{display:grid!important;justify-items:center;gap:8px;width:100%}
  html.mk body .deck #dzstat{font-family:inherit!important;text-transform:none!important;letter-spacing:0!important;font-size:.92rem!important;font-weight:700;color:var(--ink)!important;text-align:center}
  html.mk body .deck .dots{display:flex!important;justify-content:center;flex-wrap:wrap;gap:5px}
  html.mk body .deck .dots i{width:16px!important;height:6px!important;border-radius:99px!important;transition:background .3s,transform .3s}
  html.mk body .deck .deck-row{display:grid!important;grid-template-columns:1fr 1fr;gap:10px;padding:10px 16px 16px!important}
  html.mk body .deck .deck-row .btn{width:100%;justify-content:center;text-align:center;border-radius:16px!important;border:2px solid var(--line)!important;border-bottom-width:4px!important;background:var(--raise)!important;color:var(--m-navy,#1e3a8a)!important;font-weight:800!important;min-height:50px}
  html.mk body .deck .deck-row .btn:active{transform:translateY(2px);border-bottom-width:2px!important}
  html.mk body #dzset{border-top:1px solid var(--line)}
  html.mk body #dzset>summary{display:flex!important;align-items:center;gap:10px;padding:14px 16px!important;list-style:none;cursor:pointer;font-weight:800}
  html.mk body #dzset>summary::-webkit-details-marker{display:none}
  html.mk body #dzset>summary::before{content:"⚙️";font-size:1rem}
  html.mk body #dzset>summary .mono{font-family:inherit!important;text-transform:none!important;letter-spacing:0!important;font-size:.95rem!important}
  html.mk body #dzset>summary .muted{margin-left:auto;font-size:.8rem!important;font-weight:600;opacity:.8}
  html.mk body #dzset .setrow{display:grid!important;grid-template-columns:1fr!important;gap:6px;padding:4px 16px 12px!important;align-items:start}
  html.mk body #dzset .setrow>.mono{font-family:inherit!important;text-transform:none!important;letter-spacing:0!important;font-size:.85rem!important;font-weight:800;color:var(--ink)!important}
  html.mk body #dzset .seg{display:grid!important;grid-auto-flow:column;grid-auto-columns:1fr;gap:6px;padding:4px!important;border-radius:16px!important;background:var(--surf3)!important;width:100%}
  html.mk body #dzset .seg button{justify-content:center!important;text-align:center!important;display:flex!important;align-items:center;border-radius:12px!important;min-height:42px;padding:6px 4px!important;font-weight:700!important;color:var(--stone)!important;background:transparent!important;border:0!important;transition:background .2s,color .2s,transform .15s}
  html.mk body #dzset .seg button[aria-pressed=true]{background:linear-gradient(180deg,#4c7bff,#3461ea)!important;color:#fff!important;box-shadow:0 3px 0 #1f3f9c!important}
  html.mk body #dzset .seg button:active{transform:scale(.96)}
  html.mk body #dzset .dz-note{margin:2px 0 0}
  html.mk body .bar-row .btn{border-radius:16px!important;min-height:48px}
  /* ---------- entrada de cada vista ---------- */
  .plx-enter>*{animation:plxUp .55s cubic-bezier(.2,.9,.3,1.05) both;animation-delay:calc(var(--pi,0) * 60ms)}
  .plx-enter .gmain>*,.plx-enter .gside>*{animation:plxUp .55s cubic-bezier(.2,.9,.3,1.05) both;animation-delay:calc(var(--pi,0) * 55ms)}
  .pf-card{animation:plxFloat 4s ease-in-out infinite}
  .pf-card:nth-child(2){animation-delay:-1s}.pf-card:nth-child(3){animation-delay:-2s}.pf-card:nth-child(4){animation-delay:-3s}
  @media (hover:hover){.pf-card:hover .pf-img{transform:translateY(-4px) rotate(-2deg) scale(1.04)}}
  .pf-card .pf-img{transition:transform .35s cubic-bezier(.2,.9,.3,1.3)}

  /* ---------- ejercicios ---------- */
  html.mk #player .opts>*,html.mk #player .ord-bank>.otok,html.mk #player .pool>*,html.mk #player .toks>*{animation:plxUp .4s cubic-bezier(.2,.9,.3,1.1) both}
  html.mk #player .opts>*:nth-child(2){animation-delay:.05s}html.mk #player .opts>*:nth-child(3){animation-delay:.1s}html.mk #player .opts>*:nth-child(4){animation-delay:.15s}
  html.mk #player .pf.good,html.mk #player .pf.bad{animation:plxSheet .38s cubic-bezier(.2,.9,.3,1.1) both}
  html.mk #player .pf-fbp .pf-img{animation:plxPopIn .45s cubic-bezier(.2,.9,.3,1.5) both}
  html.mk #player .plx-simple,html.mk #player .tsec,html.mk #player .plx-ess,html.mk #player .plx-prac{animation:plxUp .5s cubic-bezier(.2,.9,.3,1.05) both}
  html.mk #player .pf-end{animation:plxPopIn .6s cubic-bezier(.2,.9,.3,1.3) .25s both}
  html.mk .gmodal.in .gm-card{animation:plxModal .45s cubic-bezier(.2,.9,.3,1.25) both}

  @keyframes plxUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes plxDrop{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
  @keyframes plxPopIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:none}}
  @keyframes plxModal{from{opacity:0;transform:translateY(24px) scale(.94)}to{opacity:1;transform:none}}
  @keyframes plxSheet{from{transform:translateY(40px);opacity:.3}to{transform:none;opacity:1}}
  @keyframes plxBump{0%{transform:scale(1)}40%{transform:scale(1.18)}100%{transform:scale(1)}}
  @keyframes plxFlame{0%,100%{transform:scale(1) rotate(-2deg)}50%{transform:scale(1.08) rotate(3deg)}}
  @keyframes plxSpark{0%,100%{opacity:1;transform:none}50%{opacity:.55;transform:translateY(-1px)}}
  @keyframes plxShine{0%{transform:translateX(-100%)}60%,100%{transform:translateX(120%)}}
  @keyframes plxFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
  @keyframes plxHop{0%{transform:translateY(0)}40%{transform:translateY(-5px)}100%{transform:none}}
  @media (prefers-reduced-motion:reduce){html *,html *::before,html *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
  html.pc-rm *,html.pc-rm *::before,html.pc-rm *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  `;
  var st=document.createElement("style"); st.id="plx20"; st.textContent=css; document.head.appendChild(st);

  /* ---------- detalles de la barra ---------- */
  function decorateTop(){
    var m=q("#topbar .pc-mark");
    if(m&&!q(".plx-spark",m)){
      var em=m.querySelector("em");
      if(em&&!q(".plx-name",m)){ var span=document.createElement("span"); span.className="plx-name"; var node=em.previousSibling; span.appendChild(document.createTextNode("PLEX ")); if(node&&node.nodeType===3) node.remove(); em.parentNode.insertBefore(span,em); span.appendChild(em); }
      m.insertAdjacentHTML("beforeend",'<svg class="plx-spark" viewBox="0 0 30 30" aria-hidden="true"><path d="M9 11 L7 4"/><path d="M15 14 L22 7"/><path d="M17 21 L25 20"/></svg>');
    }
    [].forEach.call(document.querySelectorAll("#topbar #nav button"),function(b){b.classList.add("px-navbtn")});
    var pills=document.querySelectorAll("#topbar #stats .gpill"); if(pills[0]) pills[0].classList.add("px-chip","px-fire"); if(pills[1]) pills[1].classList.add("px-chip","px-crown");
    [].forEach.call(document.querySelectorAll("#topbar .theme-btn"),function(b){b.classList.add("px-iconbtn")});
    var mb=q("#musicBtn"); if(mb) mb.classList.toggle("px-off",mb.getAttribute("aria-pressed")!=="true");
    var sb=q("#sfxBtn"); if(sb) sb.classList.toggle("px-off",sb.getAttribute("aria-pressed")==="false");
    var ga=q("#topbar .gavatar"); if(ga) ga.classList.add("px-avatar");
    var av=q("#topbar .gavatar");
    if(av&&!q(".plx-chev",av)) av.insertAdjacentHTML("beforeend",'<svg class="plx-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
  }
  var lastStats="";
  function watchStats(){
    var s=q("#stats"); if(!s) return;
    var now=[].map.call(s.querySelectorAll(".gpill b"),function(b){return b.textContent}).join("|");
    if(lastStats&&now!==lastStats){ s.querySelectorAll(".gpill").forEach(function(p,i){ var o=lastStats.split("|")[i], n=p.querySelector("b"); if(n&&o!==n.textContent){ p.classList.remove("plx-bump"); void p.offsetWidth; p.classList.add("plx-bump"); } }); }
    lastStats=now;
  }
  var lastView=null;
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{
      decorateTop(); watchStats();
      var v=q("#view");
      if(v&&view!==lastView){
        lastView=view;
        v.classList.remove("plx-enter");
        [].forEach.call(v.children,function(c,i){ c.style.setProperty("--pi",Math.min(i,8)); });
        [].forEach.call(v.querySelectorAll(".gmain>*,.gside>*"),function(c,i){ c.style.setProperty("--pi",Math.min(i,10)); });
        void v.offsetWidth; v.classList.add("plx-enter");
        setTimeout(function(){ v.classList.remove("plx-enter"); },1400);
      }
    }catch(e){ console.warn("plx20",e); }
    return r;
  };
  decorateTop();
  document.addEventListener("click",function(e){ if(e.target.closest&&e.target.closest("#musicBtn,#sfxBtn,#themeBtn")) setTimeout(decorateTop,60); });
  var so=q("#stats"); if(so) new MutationObserver(watchStats).observe(so,{childList:true,subtree:true,characterData:true});
})();

