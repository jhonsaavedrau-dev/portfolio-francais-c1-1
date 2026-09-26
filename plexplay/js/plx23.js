
/* PLEX PLAY 1.11 — rendimiento y responsive */
(function(){
  "use strict";
  var css=`
  /* tamaños un poco más compactos (≈6 %) */
  html.mk{font-size:97%}
  @media (max-width:860px){html.mk{font-size:94%}}
  @media (max-width:360px){html.mk{font-size:91%}}
  html.mk .gbtn,html.mk .btn{min-height:44px}
  html.mk .gcard{border-radius:20px}
  @media (max-width:860px){
    html.mk body header#topbar .topbar-in{min-height:54px!important}
    html.mk body header#topbar .pc-mark .mz-logo{width:38px!important;height:38px!important}
    html.mk body header#topbar .theme-btn{width:40px!important;height:40px!important}
    html.mk body nav#tabbar.tabbar button{min-height:50px!important;padding:5px 2px!important}
    html.mk #player .opt,html.mk #player .v1-o,html.mk #player .chipb{min-height:46px}
  }
  /* efectos costosos fuera */
  html.mk body{background-attachment:scroll!important}
  html.mk body nav#tabbar.tabbar,html.mk body header#topbar.top,html.mk .tabbar,html.mk .ph{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
  @media (hover:none),(max-width:860px){
    html.mk .gbar i::after{animation:none!important;display:none}
    .pf-card{animation:none!important}
    html.mk body header#topbar .gpill:first-child svg{animation:none!important}
    html.mk body header#topbar svg.plx-spark path{animation:none!important}
    html.mk .gcard{transition:none!important}
    .plx-enter .gmain>*:nth-child(n+6),.plx-enter .gside>*{animation:none!important}
  }
  /* pintar solo lo visible */
  html.mk .rows>li,html.mk .gpath li,html.mk .guia-list>*,html.mk .lb-list>li{content-visibility:auto;contain-intrinsic-size:auto 72px}
  /* que nada se salga de la pantalla */
  html.mk,html.mk body{overflow-x:hidden;max-width:100%}
  html.mk #view,html.mk #player .pbody .wrap{min-width:0}
  html.mk #view img,html.mk #player img{max-width:100%}
  html.mk .tw,html.mk .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
  html.mk button,html.mk [role=button],html.mk a{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
  html.mk #player .pf .pfa{display:grid!important;grid-auto-flow:column;grid-auto-columns:1fr;gap:10px;min-width:0}
  html.mk #player .pf .pfa .btn{min-width:0!important;width:100%;padding-left:10px!important;padding-right:10px!important}
  html.mk #player .pf .wrap{max-width:100%;box-sizing:border-box}
  @media (max-width:360px){
    html.mk body header#topbar .gpill{padding:4px 8px!important;font-size:.85rem!important}
    html.mk .v1-row,html.mk .deck .deck-row{grid-template-columns:1fr!important}
  }
  `;
  var st=document.createElement("style"); st.id="plx23"; st.textContent=css; document.head.appendChild(st);
  /* imágenes: decodificación asíncrona y carga diferida por defecto */
  function lazy(root){ (root||document).querySelectorAll("img:not([decoding])").forEach(function(i){ i.decoding="async"; if(!i.closest("#topbar")) i.loading="lazy"; }); }
  var pend=0; new MutationObserver(function(){ if(pend) return; pend=requestAnimationFrame(function(){ pend=0; lazy(); }); }).observe(document.body,{childList:true,subtree:true});
  lazy();
})();

