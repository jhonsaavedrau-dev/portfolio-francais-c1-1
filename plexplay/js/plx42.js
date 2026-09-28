/* PLEX PLAY 1.20.1 — Ingreso en celular rediseñado y bienvenida a pantalla completa
   - El panel de ingreso siempre usa la paleta clara: en modo oscuro se mezclaban colores
     (el botón «Soy estudiante» quedaba navy sobre navy y no se leía).
   - Selector estudiante/docente legible, cabecera con Manzana y fondo noche como la landing,
     tarjeta flotante con menos espacio muerto y enlaces más limpios.
   - La bienvenida que sale al entrar ocupa toda la pantalla (antes era una tarjeta con bordes
     negros que recortaba la ilustración) y aparece con una transición suave. */
(function(){
  "use strict";
  var css = `
  /* ---------- paleta fija del ingreso (todas las pantallas, claro u oscuro) ---------- */
  html body .pclogin.m-form{
    --m-bg:#F3F5FA;--m-card:#FFFFFF;--m-ink:#1B2447;--m-mute:#5B6485;--m-edge:#E1E6F0;
    --m-blue-bg:#E8F0FF;--m-sky:#DCEBFF;--m-navy:#1E3A8A;--m-navy-d:#172E6E;--m-blue:#2563EB;
    color-scheme:light;
  }

  /* selector estudiante / docente: igual en celular y computador */
    html body .pclogin.m-form .pl-role{
    display:flex!important;gap:4px!important;padding:4px!important;margin:0 0 18px!important;
    background:#EEF2FF!important;border:0!important;border-radius:16px!important;
  }
  html body .pclogin.m-form .pl-role button{
    flex:1;min-height:44px;border-radius:12px!important;padding:0 8px!important;
    background:transparent!important;color:#5B6485!important;box-shadow:none!important;
    font-weight:700!important;font-size:.95rem!important;transition:background .2s,color .2s,box-shadow .2s;
  }
  html body .pclogin.m-form .pl-role button[aria-checked=true]{
    background:#fff!important;color:#1E3A8A!important;
    box-shadow:0 2px 10px -3px rgba(30,58,138,.35),0 0 0 1px rgba(30,58,138,.06)!important;
  }
  html body .pclogin.m-form .pl-role button::after,html body .pclogin.m-form .pl-role button[aria-checked=true]::after{display:none!important;content:none!important}


  @media (max-width:899px){
    /* fondo noche con brillo, como la landing */
    html body .pclogin.m-form{
      background:
        radial-gradient(520px 360px at 10% 0%, rgba(30,91,215,.95), transparent 70%),
        radial-gradient(420px 380px at 100% 100%, rgba(124,92,255,.35), transparent 70%),
        linear-gradient(175deg,#0B2D74,#081F55) !important;
      min-height:100dvh; padding:0 0 max(24px,env(safe-area-inset-bottom,0px)) !important;
    }
    html body .pclogin.m-form::after,html body .pclogin.m-form::before{display:none!important}  /* la foto borrosa de París del diseño anterior */
    html body .pclogin.m-form .pl-wrap{width:auto!important;margin:0!important;padding:0 16px!important;background:none!important}

    /* cabecera: Manzana saludando + ¡Bonjour! */
    html body .pclogin.m-form .m-lhero{
      background:none!important;border-radius:0!important;box-shadow:none!important;
      padding:max(28px,calc(env(safe-area-inset-top,0px) + 20px)) 24px 30px!important;
      animation:plx42In .45s cubic-bezier(.2,.9,.3,1) both;
    }
    html body .pclogin.m-form .m-lhero::before{
      content:"";display:block;width:92px;height:92px;margin:0 auto 10px;border-radius:50%;
      background:#E8EEFF url("img/mz-hola.webp") center 30%/cover no-repeat;
      border:4px solid rgba(255,255,255,.92);box-shadow:0 14px 30px -12px rgba(0,0,0,.6);
    }
    html body .pclogin.m-form .m-lhero h1{margin:0 0 6px!important;font-size:2.35rem!important}
    html body .pclogin.m-form .m-lhero p{font-size:.98rem!important;font-weight:500!important;color:#DCE6FF!important;max-width:300px!important}
    html body .pclogin.m-form .m-lhero .pd-art,html body .pclogin.m-form .m-lhero .plx-desk{display:none!important}

    /* tarjeta del formulario */
    html body .pclogin.m-form .pl-box,html[data-theme] body .pclogin.m-form .pl-box{
      background:#fff!important;border:0!important;border-radius:28px!important;
      padding:22px 20px 18px!important;margin:0!important;
      box-shadow:0 30px 60px -28px rgba(0,0,0,.65)!important;
      animation:plx42In .5s .05s cubic-bezier(.2,.9,.3,1) both;
    }

    /* campos y botón */
    html body .pclogin.m-form .gfield{margin:0 0 14px!important}
    html body .pclogin.m-form .gfield>span:first-child{font-size:.85rem!important;font-weight:700!important;color:#3B4466!important}
    html body .pclogin.m-form input[type=email],html body .pclogin.m-form input[type=password],html body .pclogin.m-form input[type=text],html body .pclogin.m-form input[inputmode=numeric]{
      height:52px!important;background-color:#F8FAFF!important;color:#14213D!important;border-color:#DCE3F0!important;
    }
    html body .pclogin.m-form input:focus{background-color:#fff!important;border-color:#2563EB!important;box-shadow:0 0 0 4px rgba(37,99,235,.15)!important}
    html body .pclogin.m-form .pl-box .gbtn.wide{height:54px!important;border-radius:16px!important;margin-top:4px}

    /* enlaces */
    html body .pclogin.m-form .pl-links{margin:14px 0 2px!important;text-align:center}
    html body .pclogin.m-form .pl-switch{margin:8px 0 0!important;text-align:center;color:#3B4466!important;font-size:.95rem}
    html body .pclogin.m-form .onb-link{color:#1E5BD7!important;font-weight:700!important;text-decoration:none!important;background:none!important}
    html body .pclogin.m-form .onb-link:hover,html body .pclogin.m-form .onb-link:focus-visible{text-decoration:underline!important;text-underline-offset:3px}

    /* probar sin cuenta */
    html body .pclogin.m-form .plx-demo{margin:16px 0 0!important;padding:16px 0 0!important;border-top:1px solid #E6EAF2!important;display:grid;gap:8px;justify-items:center;text-align:center}
    html body .pclogin.m-form .plx-demo-btn,html[data-theme] body .pclogin.m-form .plx-demo-btn{
      width:100%;min-height:50px;border-radius:16px!important;background:#fff!important;
      border:2px solid #C7D2FE!important;color:#1E3A8A!important;font-weight:800!important;font-size:1rem!important;
    }
    html body .pclogin.m-form .plx-demo small{color:#5B6485!important;font-size:.82rem!important;line-height:1.4}
    html body .pclogin.m-form .pl-foot{margin:14px 0 0!important;padding:0!important;color:#6B7390!important;font-size:.78rem!important;line-height:1.45;text-align:center}
    html body .pclogin.m-form .pl-foot::before{display:none!important}
    html body .pclogin.m-form .pl-foot a{color:#1E5BD7!important;font-weight:700}
    html body .pclogin.m-form .pl-chips,html body .pclogin.m-form .pl-chips-b{display:none!important}

    /* ---------- bienvenida al entrar: pantalla completa, sin recortes ---------- */
    .gonb:has(> .onb-splash){padding:0!important;place-items:stretch!important}
    .gonb{animation:plx42Fade .35s ease both}
    .gonb .onb-splash{
      width:100%!important;min-height:100dvh!important;border-radius:0!important;box-shadow:none!important;
      padding:max(26px,calc(env(safe-area-inset-top,0px) + 18px)) 22px max(24px,calc(env(safe-area-inset-bottom,0px) + 16px))!important;
      animation:plx42In .55s cubic-bezier(.2,.9,.3,1) both;
    }
    .gonb .onb-splash.has-art .onb-scene.full{inset:0!important;width:100%!important;height:100%!important}
    .gonb .onb-splash.has-art::after{height:48%!important;background:linear-gradient(to bottom,transparent,rgba(8,20,60,.88))!important}
    .gonb .onb-splash .onb-cta .gbtn{height:56px;border-radius:16px}
    .gonb>.onb-step{animation:plx42In .4s cubic-bezier(.2,.9,.3,1) both}
  }

  @keyframes plx42In{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes plx42Fade{from{opacity:0}to{opacity:1}}
  @media (prefers-reduced-motion:reduce){
    html body .pclogin.m-form .m-lhero,html body .pclogin.m-form .pl-box,.gonb,.gonb .onb-splash,.gonb>.onb-step{animation:none!important}
  }
  `;
  var st = document.createElement("style"); st.id = "plx42"; st.textContent = css; document.head.appendChild(st);
})();
