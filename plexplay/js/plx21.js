
/* PLEX PLAY 1.10.1 — panel de acceso */
(function(){
  "use strict";
  var MAIL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235b6b95'%3E%3Cpath d='M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11zm2.2-.3 6.8 5.1 6.8-5.1H5.2z'/%3E%3C/svg%3E";
  var LOCK="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235b6b95'%3E%3Cpath d='M7 10V7.5a5 5 0 0 1 10 0V10h.5A2.5 2.5 0 0 1 20 12.5v7A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-7A2.5 2.5 0 0 1 6.5 10H7zm2 0h6V7.5a3 3 0 0 0-6 0V10zm3 4.2a1.6 1.6 0 0 0-.8 3v1.6h1.6v-1.6a1.6 1.6 0 0 0-.8-3z'/%3E%3C/svg%3E";
  var KEY="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235b6b95'%3E%3Cpath d='M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm3 5a1.2 1.2 0 1 0 0 2.4A1.2 1.2 0 0 0 7 11zm5 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm5 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z'/%3E%3C/svg%3E";
  var PAW="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23b8c3dc'%3E%3Cellipse cx='12' cy='16' rx='5.2' ry='4.4'/%3E%3Cellipse cx='5.5' cy='10.5' rx='2.2' ry='2.8'/%3E%3Cellipse cx='9.3' cy='6.3' rx='2.2' ry='2.9'/%3E%3Cellipse cx='14.7' cy='6.3' rx='2.2' ry='2.9'/%3E%3Cellipse cx='18.5' cy='10.5' rx='2.2' ry='2.8'/%3E%3C/svg%3E";
  var field=function(icon){return "padding-left:68px!important;background:url(\""+icon+"\") 20px center/22px 22px no-repeat,linear-gradient(#e3e8f2,#e3e8f2) 54px center/1px 100% no-repeat,#fff!important"};
  var css=`
  html body .pclogin.m-form{display:flex!important;flex-direction:column;align-items:center;justify-content:flex-start;padding:clamp(16px,4vh,40px) 14px 170px!important;background:
    radial-gradient(900px 420px at 50% -10%,rgba(96,134,255,.14),transparent 65%),#f4f6fb!important;overflow-y:auto}
  html[data-theme=dark] body .pclogin.m-form{background:radial-gradient(900px 420px at 50% -10%,rgba(70,100,255,.22),transparent 65%),#0d0f18!important}
  html body .pclogin.m-form::after{filter:blur(7px) saturate(1.1);opacity:.75!important;height:210px!important;-webkit-mask-image:linear-gradient(to top,#000 45%,transparent);mask-image:linear-gradient(to top,#000 45%,transparent)}
  html body .pclogin.m-form .m-lhero{position:relative;width:min(540px,100%)!important;max-width:none!important;margin:0!important;border-radius:26px 26px 0 0!important;padding:26px 24px 44px!important;text-align:center;color:#fff;
    background:linear-gradient(180deg,#1f47b4 0%,#1e3a8a 100%)!important;box-shadow:0 20px 40px -24px rgba(30,58,138,.55);animation:plxDrop .5s cubic-bezier(.2,.9,.3,1.1) both}
  html body .pclogin.m-form .m-lhero h1{display:inline-flex;align-items:flex-start;gap:4px;margin:6px 0 10px!important;font-size:clamp(2.3rem,7vw,3rem)!important;font-weight:800!important;letter-spacing:-.02em;color:#fff!important}
  html body .pclogin.m-form .m-lhero h1 svg{width:34px;height:34px;margin:-6px 0 0 2px;color:#facc15;flex:none}
  html body .pclogin.m-form .m-lhero h1 svg path{stroke:currentColor;stroke-width:3.4;stroke-linecap:round;animation:plxSpark 2.8s ease-in-out infinite}
  html body .pclogin.m-form .m-lhero p{margin:0 auto!important;max-width:380px;font-size:1.02rem!important;font-weight:600;line-height:1.4;color:#e7ecff!important}
  html body .pclogin.m-form .m-lback2{position:absolute;left:16px;top:16px;width:46px;height:46px;border-radius:14px;border:0;display:grid;place-items:center;background:rgba(255,255,255,.14);color:#fff;cursor:pointer;transition:background .2s,transform .15s}
  html body .pclogin.m-form .m-lback2:hover{background:rgba(255,255,255,.24)}
  html body .pclogin.m-form .m-lback2:active{transform:scale(.94)}
  html body .pclogin.m-form .m-lback2 svg{width:22px;height:22px;stroke:#fff;fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
  html body .pclogin.m-form .pl-wrap{width:min(540px,100%)!important;max-width:none!important;margin:-22px 0 0!important;padding:0!important;display:block!important;position:relative;z-index:1}
  html body .pclogin.m-form .pl-hero,html body .pclogin.m-form .pl-chips-b,html body .pclogin.m-form .pl-role{display:none!important}
  html body .pclogin.m-form .pl-box{width:100%!important;max-width:none!important;margin:0!important;border-radius:24px!important;background:#fff!important;padding:26px 26px 22px!important;border:1px solid rgba(30,58,138,.06)!important;
    box-shadow:0 24px 50px -26px rgba(30,58,138,.45),0 4px 14px -6px rgba(30,58,138,.12)!important;animation:plxUp .55s cubic-bezier(.2,.9,.3,1.05) .08s both;text-align:left}
  html[data-theme=dark] body .pclogin.m-form .pl-box{background:#161a26!important;border-color:rgba(255,255,255,.06)!important}
  html body .pclogin.m-form[data-mode=login] .pl-box>h2,html body .pclogin.m-form[data-mode=login] .pl-box>.onb-p{display:none!important}
  html body .pclogin.m-form .pl-box>h2{font-size:1.25rem!important;margin:0 0 4px!important}
  html body .pclogin.m-form .gfield{display:grid;gap:8px;margin:0 0 18px!important}
  html body .pclogin.m-form .gfield>span:first-child{font-size:.92rem!important;font-weight:600!important;color:#5b6b95!important;text-transform:none!important;letter-spacing:0!important}
  html body .pclogin.m-form input[type=email],html body .pclogin.m-form input[type=password],html body .pclogin.m-form input[type=text],html body .pclogin.m-form input[inputmode=numeric]{height:62px!important;border-radius:16px!important;border:1.5px solid #dfe5f1!important;font-size:1.05rem!important;font-weight:600;color:#14213d!important;box-shadow:none!important;transition:border-color .2s,box-shadow .2s!important}
  html body .pclogin.m-form input[type=email]{${field(MAIL)}}
  html body .pclogin.m-form input[type=password],html body .pclogin.m-form .pl-pwb input[type=text]{${field(LOCK)}}
  html body .pclogin.m-form input[inputmode=numeric],html body .pclogin.m-form input[autocomplete=one-time-code]{${field(KEY)}}
  html body .pclogin.m-form input::placeholder{color:#8f9bb8;font-weight:500}
  html body .pclogin.m-form input:focus{border-color:#3b82f6!important;box-shadow:0 0 0 4px rgba(59,130,246,.16)!important;outline:none}
  html[data-theme=dark] body .pclogin.m-form input{background-color:#0f1320!important;color:#fff!important;border-color:#2a3350!important}
  html body .pclogin.m-form .pl-eye{right:12px!important;color:#5b6b95!important}
  html body .pclogin.m-form.gonb .pl-box .gbtn.gbtn:not(.ghost):not([disabled]){position:relative;width:100%;height:62px;border-radius:16px!important;border:0!important;font-size:1.15rem!important;font-weight:800!important;color:#fff!important;letter-spacing:.01em;
    background:linear-gradient(180deg,#2458d6,#1d45b8)!important;box-shadow:0 4px 0 #173a99,0 16px 28px -14px rgba(29,69,184,.75)!important;transition:transform .15s,box-shadow .15s,filter .2s!important;margin-top:4px;padding:0 58px!important;display:flex!important;align-items:center;justify-content:center;text-align:center;line-height:1.2}
  html body .pclogin.m-form.gonb .pl-box .gbtn.gbtn:not(.ghost):not([disabled])::before{content:"";position:absolute;right:24px;top:50%;width:24px;height:24px;margin-top:-12px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14M13 6l6 6-6 6'/%3E%3C/svg%3E") center/contain no-repeat;transition:transform .2s}
  html body .pclogin.m-form.gonb .pl-box .gbtn.gbtn:not(.ghost):not([disabled]):hover{filter:brightness(1.07)}
  html body .pclogin.m-form.gonb .pl-box .gbtn.gbtn:not(.ghost):not([disabled]):hover::before{transform:translateX(4px)}
  html body .pclogin.m-form.gonb .pl-box .gbtn.gbtn:not(.ghost):not([disabled]):active{transform:translateY(3px);box-shadow:0 1px 0 #173a99!important}
  html body .pclogin.m-form .pl-links{text-align:center;margin:18px 0 8px!important}
  html body .pclogin.m-form .onb-link{color:#1d4ed8!important;font-weight:700!important;text-decoration:underline!important;text-underline-offset:3px;background:none!important;border:0!important}
  html body .pclogin.m-form .pl-switch{text-align:center;margin:10px 0 0!important;font-size:1.02rem;font-weight:600;color:#1f2a44}
  html[data-theme=dark] body .pclogin.m-form .pl-switch{color:#dfe5f1}
  html body .pclogin.m-form .pl-foot{text-align:center;font-size:.85rem!important;line-height:1.5;color:#5b6b95!important;margin:0!important}
  html body .pclogin.m-form .pl-foot::before{content:"";display:block;height:34px;margin:14px 0 12px;background:url("${PAW}") center/30px 30px no-repeat,linear-gradient(#dfe5f1,#dfe5f1) left center/40% 2px no-repeat,linear-gradient(#dfe5f1,#dfe5f1) right center/40% 2px no-repeat}
  html body .pclogin.m-form .pl-foot a{color:#1d4ed8!important;font-weight:700}
  html body .pclogin.m-form .pl-err,html body .pclogin.m-form .gm-err{border-radius:12px}
  html body .pclogin.m-form .m-lhero:has(.m-lback2){padding-top:64px!important}
  @media (max-width:480px){html body .pclogin.m-form.gonb .pl-box .gbtn.gbtn:not(.ghost):not([disabled]){font-size:1.02rem!important;padding:0 50px!important} html body .pclogin.m-form .pl-box{padding:22px 18px 18px!important} html body .pclogin.m-form .m-lhero{padding:24px 18px 42px!important}}
  `;
  var st=document.createElement("style"); st.id="plx21"; st.textContent=css; document.head.appendChild(st);
  var SPARK='<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M9 11 L7 4"/><path d="M15 14 L22 7"/><path d="M17 21 L25 20"/></svg>';
  function deco(){
    var el=document.querySelector(".pclogin.m-form"); if(!el) return;
    var h=el.querySelector(".m-lhero h1"); if(h&&!h.querySelector("svg")) h.insertAdjacentHTML("beforeend",SPARK);
    var hero=el.querySelector(".m-lhero"), mode=el.getAttribute("data-mode")||"";
    var back=hero&&hero.querySelector(".m-lback2");
    if(hero&&mode&&mode!=="login"&&mode!=="setpw"&&!back) hero.insertAdjacentHTML("afterbegin",'<button type="button" class="m-lback2" data-pl="to-login" aria-label="Volver a iniciar sesión"><svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg></button>');
    if(back&&(mode==="login"||mode==="setpw")) back.remove();
    var f=el.querySelector(".pl-foot"); if(f&&!f.dataset.px){ f.dataset.px=1; f.innerHTML=f.innerHTML.replace("usar PLEX PLAY","usar <b>PLEX PLAY</b>"); }
  }
  var dq=0; new MutationObserver(function(){ if(dq) return; dq=requestAnimationFrame(function(){ dq=0; deco(); }); }).observe(document.body,{childList:true,subtree:true});
  deco();
})();

