/* PLEX PLAY 1.18 — bienvenida, ingreso y primeros pasos con diseño propio para computador */
(function(){
  "use strict";
  var DESK='<div class="plx-desk">'+
    '<small class="pd-k">Bienvenido a PLEX PLAY</small>'+
    '<h2>Aprende francés jugando, a tu ritmo</h2>'+
    '<p>Lecciones cortas alineadas a la malla del Programa de Lenguas Extranjeras, con Manzana como guía.</p>'+
    '<ul>'+
      '<li><span class="pd-i">📚</span><span><b>10 cursos</b> del Semestre I al IX</span></li>'+
      '<li><span class="pd-i">🎧</span><span><b>Audios, lecturas y dictados</b> y simulacros DELF/DALF</span></li>'+
      '<li><span class="pd-i">🔥</span><span><b>Rachas, misiones y duelos 1V1</b> con tus compañeros</span></li>'+
    '</ul></div>';
  function deco(){
    // bienvenida sin cuenta (demo o app sin servidor)
    var sp=document.querySelector(".gonb .onb-splash");
    if(sp&&!sp.querySelector(".plx-desk")){ var cta=sp.querySelector(".onb-cta"); if(cta) cta.insertAdjacentHTML("beforebegin",DESK); }
    var pa=document.querySelector(".pclogin.m-intro .pls-act");
    if(pa&&!pa.querySelector(".plx-desk")) pa.insertAdjacentHTML("afterbegin",DESK);
    // pantalla de ingreso: el panel de la izquierda
    var h=document.querySelector(".pclogin.m-form .m-lhero");
    if(h&&!h.querySelector(".plx-desk")) h.insertAdjacentHTML("beforeend",DESK.replace('<small class="pd-k">Bienvenido a PLEX PLAY</small>','<small class="pd-k">PLEX PLAY</small>'));
    var g=document.querySelector(".gonb"); if(g) document.documentElement.classList.add("plx-onb"); else document.documentElement.classList.remove("plx-onb");
  }
  var q=0; new MutationObserver(function(){ if(q) return; q=requestAnimationFrame(function(){ q=0; deco(); }); }).observe(document.body,{childList:true,subtree:true});
  deco();

  var BG='url("img/bg-noche.webp")';
  var css=`
  .plx-desk{display:none}
  @media (min-width:900px) and (min-height:560px){
    /* fondo común: la ilustración de París de noche, difuminada */
    .gonb{background:#0f1a3d!important;isolation:isolate}
    .gonb::before{content:"";position:fixed;inset:-30px;z-index:-1;background:linear-gradient(rgba(12,20,52,.70),rgba(12,20,52,.86)),${BG} center/cover no-repeat;filter:blur(10px)}
    .plx-desk{display:block}
    .plx-desk .pd-k{display:inline-block;font-weight:800;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:#2458d6;background:#e8efff;padding:5px 10px;border-radius:99px}
    .plx-desk h2{font-family:var(--serif);font-weight:800;font-size:2.1rem;line-height:1.12;letter-spacing:-.02em;margin:14px 0 10px;color:#14213d}
    .plx-desk p{margin:0 0 20px;color:#475569;font-size:1.02rem;line-height:1.5}
    .plx-desk ul{list-style:none;margin:0;padding:0;display:grid;gap:12px}
    .plx-desk li{display:flex;align-items:center;gap:12px;color:#334155;font-size:.98rem;line-height:1.35}
    .plx-desk .pd-i{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:#f1f5ff;font-size:1.25rem}
    .plx-desk b{color:#14213d}

    /* ---- bienvenida (sin cuenta): tarjeta de dos columnas ---- */
    .gonb .onb-splash.has-art{width:min(1060px,94vw);height:min(640px,90vh);min-height:0;border-radius:28px;padding:0;
      grid-template-columns:minmax(0,1.08fr) minmax(0,1fr);grid-template-rows:1fr auto;column-gap:0;
      background:#fff;color:#14213d;box-shadow:0 40px 90px -30px rgba(0,0,0,.6)}
    .gonb .onb-splash.has-art .onb-scene.full{inset:0 auto 0 0!important;width:51.9%!important;height:100%!important}
    .gonb .onb-splash.has-art::after{inset:auto auto 0 0!important;width:51.9%;z-index:0!important;height:45%}
    .gonb .onb-splash.has-art::before{content:"";position:absolute;left:0;top:0;width:51.9%;height:34%;z-index:0;pointer-events:none;background:linear-gradient(rgba(10,16,44,.7),transparent)}
    .gonb .onb-splash .onb-top{grid-column:1;grid-row:1;align-self:start;padding:36px 30px 0;color:#fff;position:relative;z-index:1}
    .gonb .onb-splash .onb-top p{color:#e7ecff}
    .gonb .onb-splash .onb-cat{grid-column:1;grid-row:2}
    .gonb .onb-splash .plx-desk{grid-column:2;grid-row:1;align-self:end;padding:0 56px 8px}
    .gonb .onb-splash .onb-cta{grid-column:2;grid-row:2;align-self:start;padding:18px 56px 48px;display:grid;gap:10px;justify-items:stretch}
    .gonb .onb-splash .onb-cta .gbtn{height:58px;border-radius:16px;font-size:1.1rem}
    .gonb .onb-splash .onb-cta .onb-link{color:#1d4ed8!important;font-weight:700;text-align:center;text-shadow:none}

    /* ---- pasos de la bienvenida: tarjeta blanca centrada ---- */
    .gonb>.onb-step{width:min(560px,92vw);background:var(--raise,#fff);color:var(--ink,#14213d);border-radius:28px;padding:36px 44px 40px;box-shadow:0 40px 90px -30px rgba(0,0,0,.6)}
    .gonb>.onb-step:has(.onb-prev){width:min(980px,94vw);grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);column-gap:36px;align-items:start}
    .gonb>.onb-step:has(.onb-prev)>.onb-prog,.gonb>.onb-step:has(.onb-prev)>h2{grid-column:1/-1}
    .gonb>.onb-step:has(.onb-prev)>.onb-prev{grid-column:1;grid-row:3/span 3;align-self:stretch;min-height:320px}
    .gonb>.onb-step:has(.onb-prev)>.onb-prev>svg{height:100%}
    .gonb>.onb-step:has(.onb-prev)>:not(.onb-prog):not(h2):not(.onb-prev){grid-column:2}
    .gonb>.onb-step .coat-row{max-height:44vh;overflow:auto;padding:2px}
    .gonb>.onb-step .gbtn.wide{height:54px;border-radius:15px}

    /* ---- portada de ingreso (Iniciar sesión / Crear cuenta) ---- */
    html body .pclogin.m-intro .pl-splash{width:min(1060px,94vw)!important;max-width:none!important;height:min(640px,90vh)!important;min-height:0!important;border-radius:28px!important;overflow:hidden;
      display:grid!important;grid-template-columns:minmax(0,1.08fr) minmax(0,1fr);grid-template-rows:1fr;padding:0!important;box-shadow:0 40px 90px -30px rgba(0,0,0,.6);
      background:linear-gradient(rgba(10,16,44,.55),transparent 35%) 0 0/51.9% 100% no-repeat,${BG} 0 60%/51.9% auto no-repeat,#0b1a40!important}
    html body .pclogin.m-intro .pl-splash .pls-logo{grid-column:1;grid-row:1;align-self:start;padding:40px 36px}
    html body .pclogin.m-intro .pl-splash .pls-act{grid-column:2;grid-row:1;align-self:stretch;justify-self:stretch;width:auto!important;text-align:left;overflow:auto;background:#fff;padding:48px 56px!important;margin:0!important;display:flex!important;flex-direction:column;justify-content:center;gap:12px;color:#14213d}
    html body .pclogin.m-intro .pl-splash .pls-act .pls-tag{display:none}
    html body .pclogin.m-intro .pl-splash .pls-act .plx-desk{margin-bottom:10px}
    html body .pclogin.m-intro .pl-splash .pls-act .m-btn{height:56px;border-radius:16px}
    html body .pclogin.m-intro .pl-splash .pls-act .m-btn.outline{color:#1e3a8a!important;border:1.5px solid #c7d2fe!important;background:#fff!important}
    html body .pclogin.m-intro .pl-splash .pls-act .plx-demo-link{color:#1d4ed8;margin:4px 0 0}
    html body .pclogin.m-intro .pl-splash .pls-act .pls-foot{display:none}

    /* ---- pantalla de ingreso: panel izquierdo + formulario ---- */
    html body .pclogin.m-form{display:grid!important;grid-template-columns:min(500px,46vw) min(500px,46vw);justify-content:center;align-content:safe center;align-items:stretch!important;padding:4vh 24px!important}
    html body .pclogin.m-form input[type=email],html body .pclogin.m-form input[type=password],html body .pclogin.m-form input[type=text],html body .pclogin.m-form input[inputmode=numeric]{height:54px!important}
    html body .pclogin.m-form.gonb .pl-box .gbtn.gbtn:not(.ghost):not([disabled]){height:56px}
    html body .pclogin.m-form .gfield{margin:0 0 14px!important}
    html body .pclogin.m-form .pl-foot::before{display:none!important}
    html body .pclogin.m-form .pl-foot{margin-top:10px!important}
    html body .pclogin.m-form .plx-demo{margin:12px 0 2px;padding-top:12px}
    html body .pclogin.m-form::after{display:none!important}
    html body .pclogin.m-form .m-lhero{width:min(500px,46vw)!important;border-radius:28px 0 0 28px!important;padding:44px 44px!important;text-align:left!important;
      display:flex;flex-direction:column;justify-content:flex-start;gap:6px;animation:none!important;
      background:linear-gradient(180deg,rgba(15,30,80,.82),rgba(15,30,80,.72) 40%,rgba(15,30,80,.94)),${BG} center/cover!important;box-shadow:none!important}
    html body .pclogin.m-form .m-lhero h1{justify-content:flex-start}
    html body .pclogin.m-form .m-lhero p{margin:0!important;max-width:none!important;text-align:left}
    html body .pclogin.m-form .m-lhero .plx-desk{margin-top:auto;padding-top:26px}
    html body .pclogin.m-form .m-lhero .plx-desk .pd-k{background:rgba(255,255,255,.14);color:#fde68a}
    html body .pclogin.m-form .m-lhero .plx-desk h2{color:#fff;font-size:1.75rem}
    html body .pclogin.m-form .m-lhero .plx-desk p{color:#dbe4ff}
    html body .pclogin.m-form .m-lhero .plx-desk li,html body .pclogin.m-form .m-lhero .plx-desk b{color:#fff}
    html body .pclogin.m-form .m-lhero .plx-desk .pd-i{background:rgba(255,255,255,.12)}
    html body .pclogin.m-form .m-lhero .m-lback2{position:static!important;margin:0 0 14px}
    html body .pclogin.m-form .m-lhero:has(.m-lback2){padding-top:44px!important}
    html body .pclogin.m-form .pl-wrap{width:auto!important;margin:0!important;display:flex!important}
    html body .pclogin.m-form .m-lhero{width:auto!important}
    html body .pclogin.m-form .pl-box{border-radius:0 28px 28px 0!important;padding:36px 40px 26px!important;display:flex;flex-direction:column;justify-content:center;animation:none!important;
      box-shadow:0 40px 90px -30px rgba(0,0,0,.6)!important}
  }
  @media (min-width:900px) and (min-height:560px) and (max-height:860px){
    html body .pclogin.m-form .m-lhero .plx-desk p{display:none}
    html body .pclogin.m-form .m-lhero .plx-desk h2{font-size:1.45rem;margin:10px 0 14px}
    html body .pclogin.m-form .m-lhero .plx-desk ul{gap:8px}
    html body .pclogin.m-form .m-lhero{padding:34px 40px!important}
    html body .pclogin.m-form{padding:2.5vh 24px!important}
    html body .pclogin.m-form .pl-box{padding:26px 36px 18px!important}
    html body .pclogin.m-form .pl-role{margin:0 0 12px!important}
    html body .pclogin.m-form .gfield{margin:0 0 10px!important;gap:6px!important}
    html body .pclogin.m-form input[type=email],html body .pclogin.m-form input[type=password],html body .pclogin.m-form input[type=text],html body .pclogin.m-form input[inputmode=numeric]{height:50px!important}
    html body .pclogin.m-form.gonb .pl-box .gbtn.gbtn:not(.ghost):not([disabled]){height:52px}
    html body .pclogin.m-form .pl-links{margin:12px 0 4px!important}
    html body .pclogin.m-form .pl-switch{margin:6px 0 0!important}
    html body .pclogin.m-form .plx-demo small{display:none}
    html body .pclogin.m-form .pl-foot{font-size:.78rem!important}
  }
  @media (min-width:900px) and (min-height:560px) and (prefers-reduced-motion:no-preference){
    .gonb .onb-splash.has-art,.gonb>.onb-step,html body .pclogin.m-form .m-lhero,html body .pclogin.m-form .pl-box{animation:plxDeskIn .45s cubic-bezier(.2,.9,.3,1) both!important}
    @keyframes plxDeskIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  }
  `;
  var st=document.createElement("style"); st.id="plx35"; st.textContent=css; document.head.appendChild(st);
})();
