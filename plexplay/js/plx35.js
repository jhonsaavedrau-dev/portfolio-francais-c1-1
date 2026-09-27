/* PLEX PLAY 1.18.1 — bienvenida, ingreso y primeros pasos con diseño propio para computador */
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
    if(h&&!h.querySelector(".plx-desk")) h.insertAdjacentHTML("beforeend",'<div class="pd-art" role="img" aria-label="París de día"></div>'+DESK);
    var g=document.querySelector(".gonb"); if(g) document.documentElement.classList.add("plx-onb"); else document.documentElement.classList.remove("plx-onb");
  }
  var q=0; new MutationObserver(function(){ if(q) return; q=requestAnimationFrame(function(){ q=0; deco(); }); }).observe(document.body,{childList:true,subtree:true});
  deco();

  var ART='url("img/c-paris.webp")';
  var css=`
  .plx-desk,.pd-art{display:none}
  @media (min-width:900px) and (min-height:560px){
    /* fondo claro común con manchas de color suaves y puntitos */
    .gonb,html body .pclogin.m-form,html body .pclogin.m-intro{background:#f3f6fd!important;isolation:isolate}
    .gonb::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;
      background:radial-gradient(640px 440px at 6% 8%,rgba(59,130,246,.20),transparent 70%),
        radial-gradient(560px 420px at 94% 92%,rgba(250,204,21,.26),transparent 70%),
        radial-gradient(460px 340px at 92% 6%,rgba(244,114,182,.16),transparent 70%),
        radial-gradient(420px 320px at 4% 96%,rgba(166,25,46,.10),transparent 70%),
        radial-gradient(rgba(30,58,138,.09) 1.2px,transparent 1.4px) 0 0/22px 22px,#f3f6fd}
    .gonb::after{display:none!important}
    /* en computador estas pantallas siempre van en claro, también con el tema oscuro */
    .gonb{--paper:#f3f6fd;--raise:#fff;--ink:#14213d;--ink-2:#334155;--stone:#64748b;--faint:#7c879c;--line:#e2e8f0;--line-2:#d5dde9;--surf2:#f6f8fc;--surf3:#eef2f8;--wash:#eef2ff;--accent:#2458d6;color-scheme:light;color:#14213d}
    html body .gonb .pl-wrap .pl-box h2,html body .gonb .pl-wrap .pl-box>h2{color:#14213d!important;opacity:1!important}
    .gonb>.onb-step input{background:#fff!important;color:#14213d!important;border-color:#d5dde9!important}
    .gonb>.onb-step .coat{background:#f6f8fc}
    .plx-desk{display:block}
    .plx-desk .pd-k{display:inline-block;font-weight:800;font-size:.76rem;letter-spacing:.08em;text-transform:uppercase;color:#2458d6;background:#e3ebff;padding:5px 10px;border-radius:99px}
    .plx-desk h2{font-family:var(--serif);font-weight:800;font-size:2.05rem;line-height:1.12;letter-spacing:-.02em;margin:14px 0 10px;color:#14213d}
    .plx-desk p{margin:0 0 18px;color:#475569;font-size:1.02rem;line-height:1.5}
    .plx-desk ul{list-style:none;margin:0;padding:0;display:grid;gap:12px}
    .plx-desk li{display:flex;align-items:center;gap:12px;color:#334155;font-size:.98rem;line-height:1.35}
    .plx-desk .pd-i{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:#fff;box-shadow:0 4px 12px -6px rgba(30,58,138,.35);font-size:1.2rem}
    .plx-desk b{color:#14213d}
    .gonb .gcard-shadow,.plx-shadow{box-shadow:0 34px 80px -34px rgba(30,58,138,.45),0 8px 24px -12px rgba(30,58,138,.18)}

    /* ---- bienvenida sin cuenta: izquierda clara con ilustración, derecha el texto ---- */
    .gonb .onb-splash.has-art{width:min(1060px,94vw);height:min(640px,90vh);min-height:0;border-radius:28px;padding:0;
      grid-template-columns:minmax(0,1.08fr) minmax(0,1fr);grid-template-rows:auto 1fr auto;column-gap:0;color:#14213d;
      background:linear-gradient(90deg,#eaf1ff 0,#f5f8ff 51.9%,#fff 51.9%)!important;
      box-shadow:0 34px 80px -34px rgba(30,58,138,.45),0 8px 24px -12px rgba(30,58,138,.18)}
    .gonb .onb-splash.has-art .onb-scene.full,.gonb .onb-splash.has-art::after{display:none!important}
    .gonb .onb-splash.has-art::before{content:"";position:absolute;left:40px;top:150px;bottom:44px;width:calc(51.9% - 80px);border-radius:22px;z-index:0;
      background:${ART} center/cover no-repeat;box-shadow:0 18px 40px -22px rgba(30,58,138,.55)}
    .gonb .onb-splash .onb-top{grid-column:1;grid-row:1;align-self:start;padding:40px 40px 0;text-align:left;text-shadow:none!important;position:relative;z-index:1}
    .gonb .onb-splash .onb-logo{justify-content:flex-start;color:#14213d;text-shadow:none!important}
    .gonb .onb-splash .onb-logo em{color:#e11d48}
    .gonb .onb-splash .onb-top p{color:#475569;opacity:1}
    .gonb .onb-splash .onb-cat{display:none}
    .gonb .onb-splash .plx-desk{grid-column:2;grid-row:1/span 2;align-self:end;padding:0 56px 8px}
    .gonb .onb-splash .onb-cta{grid-column:2;grid-row:3;align-self:start;padding:18px 56px 48px;display:grid;gap:10px;justify-items:stretch}
    .gonb .onb-splash .onb-cta .gbtn{height:58px;border-radius:16px;font-size:1.1rem}
    .gonb .onb-splash .onb-cta .onb-link{color:#1d4ed8!important;font-weight:700;text-align:center;text-shadow:none}

    /* ---- pasos de la bienvenida ---- */
    .gonb>.onb-step{width:min(560px,92vw);background:#fff;color:#14213d;border-radius:28px;padding:36px 44px 40px;
      box-shadow:0 34px 80px -34px rgba(30,58,138,.45),0 8px 24px -12px rgba(30,58,138,.18)}
    .gonb>.onb-step:has(.onb-prev){width:min(980px,94vw);grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);column-gap:36px;align-items:start}
    .gonb>.onb-step:has(.onb-prev)>.onb-prog,.gonb>.onb-step:has(.onb-prev)>h2{grid-column:1/-1}
    .gonb>.onb-step:has(.onb-prev)>.onb-prev{grid-column:1;grid-row:3/span 3;align-self:stretch;min-height:320px}
    .gonb>.onb-step:has(.onb-prev)>.onb-prev>svg{height:100%}
    .gonb>.onb-step:has(.onb-prev)>:not(.onb-prog):not(h2):not(.onb-prev){grid-column:2}
    .gonb>.onb-step .coat-row{max-height:44vh;overflow:auto;padding:2px}
    .gonb>.onb-step .gbtn.wide{height:54px;border-radius:15px}

    /* ---- portada de ingreso (Iniciar sesión / Crear cuenta) ---- */
    html body .pclogin.m-intro .pl-splash{width:min(1060px,94vw)!important;max-width:none!important;height:min(640px,90vh)!important;min-height:0!important;border-radius:28px!important;overflow:hidden;
      display:grid!important;grid-template-columns:minmax(0,1.08fr) minmax(0,1fr);grid-template-rows:1fr;padding:0!important;
      box-shadow:0 34px 80px -34px rgba(30,58,138,.45),0 8px 24px -12px rgba(30,58,138,.18);
      background:linear-gradient(90deg,#eaf1ff 0,#f5f8ff 51.9%,#fff 51.9%)!important}
    html body .pclogin.m-intro .pl-splash::before{content:"";position:absolute;left:40px;top:170px;bottom:44px;width:calc(51.9% - 80px);border-radius:22px;
      background:${ART} center/cover no-repeat;box-shadow:0 18px 40px -22px rgba(30,58,138,.55)}
    html body .pclogin.m-intro .pl-splash::after{display:none!important}
    html body .pclogin.m-intro .pl-splash .pls-logo{grid-column:1;grid-row:1;align-self:start;padding:40px;color:#14213d!important;text-shadow:none!important;position:relative;z-index:1}
    html body .pclogin.m-intro .pl-splash .pls-logo *{color:inherit;text-shadow:none!important}
    html body .pclogin.m-intro .pl-splash .pls-logo em{color:#e11d48!important}
    html body .pclogin.m-intro .pl-splash .pls-act{grid-column:2;grid-row:1;align-self:stretch;justify-self:stretch;width:auto!important;text-align:left;overflow:auto;background:#fff;padding:48px 56px!important;margin:0!important;display:flex!important;flex-direction:column;justify-content:center;gap:12px;color:#14213d}
    html body .pclogin.m-intro .pl-splash .pls-act .pls-tag,html body .pclogin.m-intro .pl-splash .pls-act .pls-foot{display:none}
    html body .pclogin.m-intro .pl-splash .pls-act .plx-desk{margin-bottom:10px}
    html body .pclogin.m-intro .pl-splash .pls-act .m-btn{height:56px;border-radius:16px}
    html body .pclogin.m-intro .pl-splash .pls-act .m-btn.coral{background:linear-gradient(180deg,#2458d6,#1d45b8)!important;border:0!important;color:#fff!important;box-shadow:0 4px 0 #173a99!important}
    html body .pclogin.m-intro .pl-splash .pls-act .m-btn.outline{color:#1e3a8a!important;border:1.5px solid #c7d2fe!important;background:#fff!important}
    html body .pclogin.m-intro .pl-splash .pls-act .plx-demo-link{color:#1d4ed8;margin:4px 0 0}

    /* ---- pantalla de ingreso: panel claro a la izquierda + formulario ---- */
    html body .pclogin.m-form{display:grid!important;grid-template-columns:min(500px,46vw) min(500px,46vw);justify-content:center;align-content:safe center;align-items:stretch!important;padding:4vh 24px!important}
    html body .pclogin.m-form::after{display:none!important}
    html body .pclogin.m-form .m-lhero{width:auto!important;border-radius:28px 0 0 28px!important;padding:40px 44px!important;text-align:left!important;
      display:flex;flex-direction:column;justify-content:flex-start;gap:6px;animation:none!important;color:#14213d!important;
      background:linear-gradient(160deg,#e6eeff 0%,#f4f7ff 60%,#fff8e1 100%)!important;
      box-shadow:0 34px 80px -34px rgba(30,58,138,.45)!important}
    html body .pclogin.m-form .m-lhero h1{justify-content:flex-start;color:#14213d!important;text-shadow:none!important}
    html body .pclogin.m-form .m-lhero p{margin:0!important;max-width:none!important;text-align:left;color:#475569!important}
    html body .pclogin.m-form .m-lhero .pd-art{display:block;flex:1 1 auto;min-height:120px;max-height:260px;margin:18px 0 4px;border-radius:20px;background:${ART} center/cover no-repeat;box-shadow:0 16px 34px -20px rgba(30,58,138,.55)}
    html body .pclogin.m-form .m-lhero .plx-desk{margin-top:14px}
    html body .pclogin.m-form .m-lhero .plx-desk .pd-k{display:none}
    html body .pclogin.m-form .m-lhero .plx-desk h2{font-size:1.45rem;margin:0 0 12px}
    html body .pclogin.m-form .m-lhero .plx-desk p{display:none}
    html body .pclogin.m-form .m-lhero .m-lback2{position:static!important;margin:0 0 14px;background:#fff!important;box-shadow:0 4px 12px -6px rgba(30,58,138,.4)}
    html body .pclogin.m-form .m-lhero .m-lback2 svg{stroke:#1e3a8a!important}
    html body .pclogin.m-form .m-lhero:has(.m-lback2){padding-top:40px!important}
    html body .pclogin.m-form .pl-wrap{width:auto!important;margin:0!important;display:flex!important}
    html body .pclogin.m-form .pl-box,html[data-theme] body .pclogin.m-form .pl-box{background:#fff!important;border-radius:0 28px 28px 0!important;padding:36px 40px 26px!important;display:flex;flex-direction:column;justify-content:center;animation:none!important;
      border:0!important;box-shadow:0 34px 80px -34px rgba(30,58,138,.45)!important}
    html[data-theme] body .pclogin.m-form input,html body .pclogin.m-form input{background-color:#fff!important;color:#14213d!important;border-color:#dfe5f1!important}
    html[data-theme] body .pclogin.m-form .pl-box h2,html[data-theme] body .pclogin.m-form .pl-switch{color:#14213d!important}
    html[data-theme] body .pclogin.m-form .pl-box .onb-p{color:#475569!important}
    html body .pclogin.m-form input[type=email],html body .pclogin.m-form input[type=password],html body .pclogin.m-form input[type=text],html body .pclogin.m-form input[inputmode=numeric]{height:54px!important}
    html body .pclogin.m-form.gonb .pl-box .gbtn.gbtn:not(.ghost):not([disabled]){height:56px}
    html body .pclogin.m-form .gfield{margin:0 0 14px!important}
    html body .pclogin.m-form .pl-foot::before{display:none!important}
    html body .pclogin.m-form .pl-foot{margin-top:10px!important}
    html body .pclogin.m-form .plx-demo{margin:12px 0 2px;padding-top:12px;border-color:#e2e8f0!important}
    html[data-theme] body .pclogin.m-form .plx-demo-btn{background:#eef2ff!important;border-color:#c7d2fe!important;color:#1e3a8a!important}
    /* selector estudiante/docente legible */
    html body .pclogin.m-form .pl-role{background:#f1f5f9!important;padding:4px!important;border-radius:14px!important}
    html body .pclogin.m-form .pl-role button{color:#64748b!important;background:transparent!important}
    html body .pclogin.m-form .pl-role button[aria-checked=true]{color:#1e3a8a!important;background:#fff!important;box-shadow:0 2px 8px -3px rgba(30,58,138,.35)!important}
  }
  @media (min-width:900px) and (min-height:560px) and (max-height:860px){
    html body .pclogin.m-form .m-lhero{padding:30px 40px!important}
    html body .pclogin.m-form .m-lhero .pd-art{max-height:170px;margin:12px 0 2px}
    html body .pclogin.m-form .m-lhero .plx-desk h2{font-size:1.3rem;margin:0 0 10px}
    html body .pclogin.m-form .m-lhero .plx-desk ul{gap:8px}
    html body .pclogin.m-form{padding:2.5vh 24px!important}
    html body .pclogin.m-form .pl-box,html[data-theme] body .pclogin.m-form .pl-box{padding:26px 36px 18px!important}
    html body .pclogin.m-form .pl-role{margin:0 0 12px!important}
    html body .pclogin.m-form .gfield{margin:0 0 10px!important;gap:6px!important}
    html body .pclogin.m-form input[type=email],html body .pclogin.m-form input[type=password],html body .pclogin.m-form input[type=text],html body .pclogin.m-form input[inputmode=numeric]{height:50px!important}
    html body .pclogin.m-form.gonb .pl-box .gbtn.gbtn:not(.ghost):not([disabled]){height:52px}
    html body .pclogin.m-form .pl-links{margin:12px 0 4px!important}
    html body .pclogin.m-form .pl-switch{margin:6px 0 0!important}
    html body .pclogin.m-form .plx-demo small{display:none}
    html body .pclogin.m-form .pl-foot{font-size:.78rem!important}
    .gonb .onb-splash.has-art::before{top:130px}
  }
  @media (min-width:900px) and (min-height:560px) and (prefers-reduced-motion:no-preference){
    .gonb .onb-splash.has-art,.gonb>.onb-step,html body .pclogin.m-form .m-lhero,html body .pclogin.m-form .pl-box,html body .pclogin.m-intro .pl-splash{animation:plxDeskIn .45s cubic-bezier(.2,.9,.3,1) both!important}
    @keyframes plxDeskIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  }
  `;
  var st=document.createElement("style"); st.id="plx35"; st.textContent=css; document.head.appendChild(st);
})();
