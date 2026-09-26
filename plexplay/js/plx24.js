/* PLEX PLAY 1.12 — códigos de acceso: sin envíos duplicados, espera visible y verificación rápida */
(function(){
  "use strict";
  if(typeof pcLoginAct!=="function"||typeof pcLoginRender!=="function") return;
  var CD=60, KEY="plx-otp", inflight=false, tick=0;
  function all(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}")||{}; }catch(e){ return {}; } }
  function save(o){ try{ localStorage.setItem(KEY,JSON.stringify(o)); }catch(e){} }
  function nrm(e){ return String(e||"").trim().toLowerCase(); }
  function mark(email,at){ var o=all(), now=Date.now(); Object.keys(o).forEach(function(k){ if(now-o[k]>3600e3) delete o[k]; }); o[nrm(email)]=at||now; save(o); }
  function sentAt(email){ return all()[nrm(email)]||0; }
  function wait(email){ var t=sentAt(email); if(!t) return 0; var s=CD-Math.floor((Date.now()-t)/1000); return s>0?s:0; }
  function hhmm(t){ var d=new Date(t); return ("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2); }
  function mmss(s){ return Math.floor(s/60)+":"+("0"+(s%60)).slice(-2); }

  var css=`
  .pclogin .plx-otp{margin:10px 0 4px;padding:10px 12px;border-radius:14px;background:#eef4ff;border:1px solid #cfe0ff;color:#23324d;font-size:.86rem;line-height:1.4;text-align:left}
  .pclogin .plx-otp b{color:#10244a}
  .pclogin .plx-otp ul{margin:6px 0 0;padding-left:18px}
  .pclogin .plx-otp li{margin:2px 0}
  .pclogin .plx-otp a{color:#1c5fd6;font-weight:700}
  .pclogin .plx-otp .t{display:flex;align-items:center;gap:6px;font-weight:700}
  .pclogin [data-pl=resend][disabled]{opacity:.55;cursor:default;text-decoration:none}
  html[data-theme=dark] .pclogin .plx-otp{background:#16233d;border-color:#2b3f66;color:#d6e2ff}
  html[data-theme=dark] .pclogin .plx-otp b{color:#fff}
  html[data-theme=dark] .pclogin .plx-otp a{color:#8db7ff}
  `;
  var st=document.createElement("style"); st.id="plx24"; st.textContent=css; document.head.appendChild(st);

  function friendly(m){
    m=String(m||"");
    var s=m.match(/after (\d+) seconds?/i);
    if(s) return {wait:+s[1], msg:"Ya pediste un código hace muy poco. Usa el que llegó y espera "+s[1]+" s para pedir otro."};
    if(/email rate limit|over_email_send_rate_limit/i.test(m)) return {wait:CD, msg:"Se enviaron muchos códigos en poco tiempo. Espera unos minutos e inténtalo de nuevo."};
    return null;
  }

  var orig=pcLoginAct;
  window.pcLoginAct=pcLoginAct=async function(a,arg){
    var L=pcLogin;
    var guarded=a==="send"||a==="resend"||a==="verify"||a==="login"||a==="setpw";
    if(guarded&&(L.busy||inflight)) return;               /* evita dobles clics y Enter repetido */
    if(a==="send"||a==="resend"){
      if(a==="send"&&!plMail()) return pcLoginRender();
      var em=L.email, w=wait(em);
      if(w>0){                                            /* no volver a enviar: el correo ya va en camino */
        L.step=1; L.busy=false;
        L.err=a==="resend"?"Espera "+w+" s para pedir otro código. Mientras tanto usa el que ya te enviamos.":"";
        L.ok=a==="send"?"Ya te enviamos un código hace un momento: revisa tu correo.":"";
        return pcLoginRender();
      }
      inflight=true; L.ok="";
      var t0=Date.now();
      try{ await orig(a,arg); } finally{ inflight=false; }
      if(!L.err&&L.step===1){ mark(em,t0); L.ok=""; var ci=document.getElementById("plCode"), cv=ci?ci.value:""; pcLoginRender(); var c2=document.getElementById("plCode"); if(c2&&cv) c2.value=cv; }
      else if(L.err){
        /* recuperar el mensaje original del servidor si fue límite de frecuencia */
        var f=friendly(L.__raw||"");
        if(/Espera un minuto/.test(L.err)){ f=f||{wait:CD,msg:"Ya pediste un código hace muy poco. Usa el último que llegó o espera un minuto para pedir otro."}; }
        if(f){ mark(em,Date.now()-(CD-f.wait)*1000); L.err=f.msg; L.step=1; pcLoginRender(); }
      }
      return;
    }
    if(a==="verify"){
      var inp=document.getElementById("plCode"); if(inp) inp.value=inp.value.replace(/\D/g,"");
      inflight=true;
      try{ await orig(a,arg); } finally{ inflight=false; }
      if(L.err&&/incorrecto|vencido/i.test(L.err)){
        L.err="Ese código no funciona. Usa el del correo más reciente: cada vez que pides uno nuevo, los anteriores dejan de valer.";
        pcLoginRender();
        var i2=document.getElementById("plCode"); if(i2){ i2.value=""; i2.focus(); }
      } else if(!L.err){ var o=all(); delete o[nrm(L.email)]; save(o); }
      return;
    }
    if(a==="back"||a.indexOf("to-")===0) L.ok="";
    return orig(a,arg);
  };

  /* guardar el texto crudo del error de Supabase para distinguir casos */
  if(window.PCB&&PCB.sendCode&&!PCB.sendCode.__plx){
    var sc=PCB.sendCode;
    PCB.sendCode=async function(email,create){ try{ pcLogin.__raw=""; return await sc(email,create); }catch(e){ pcLogin.__raw=String(e&&e.message||e||""); throw e; } };
    PCB.sendCode.__plx=1;
  }

  function paintResend(){
    var L=pcLogin, b=document.querySelector('.pclogin [data-pl="resend"]');
    if(!b) { clearInterval(tick); tick=0; return; }
    var w=wait(L.email);
    if(w>0){ b.disabled=true; b.textContent="Reenviar en "+mmss(w); }
    else{ b.disabled=false; b.textContent="Reenviar código"; clearInterval(tick); tick=0; }
  }
  var origR=pcLoginRender;
  window.pcLoginRender=pcLoginRender=function(){
    var r=origR.apply(this,arguments), L=pcLogin;
    try{
      if(L.step===1&&L.mode!=="setpw"){
        var box=document.querySelector(".pclogin .pl-box")||document.querySelector(".pclogin");
        var btn=box&&box.querySelector('[data-pl="verify"]');
        if(btn&&!box.querySelector(".plx-otp")){
          var t=sentAt(L.email), d=document.createElement("div"); d.className="plx-otp"; d.setAttribute("role","note");
          d.innerHTML=(L.ok?'<div class="t">✅ '+gh(L.ok)+'</div>':'')+
            (t?'<div>Enviado a las <b>'+hhmm(t)+'</b>. Solo vale el código del <b>correo más reciente</b>.</div>':'<div>Solo vale el código del <b>correo más reciente</b>.</div>')+
            '<ul><li>Suele llegar en menos de un minuto; a veces el correo de la U lo retrasa un poco.</li>'+
            '<li>En Outlook mira también <b>«Otros»</b> y <b>«Correo no deseado»</b> (<a href="https://outlook.office.com/mail/junkemail" target="_blank" rel="noopener">abrir</a>).</li>'+
            '<li>Pega o escribe el código: se confirma solo al completarlo.</li></ul>';
          btn.parentNode.insertBefore(d,btn);
          var okp=box.querySelector(".pl-ok"); if(okp&&L.ok) okp.remove();
        }
        paintResend(); if(!tick&&wait(L.email)>0) tick=setInterval(paintResend,1000);
        var c=document.getElementById("plCode");
        if(c&&!c.__plx){ c.__plx=1;
          c.addEventListener("input",function(){ var v=c.value.replace(/\D/g,""); if(v!==c.value) c.value=v; if(v.length>=8&&!pcLogin.busy&&!inflight) pcLoginAct("verify"); });
          setTimeout(function(){ try{ c.focus(); }catch(e){} },60);
        }
      }
    }catch(e){}
    return r;
  };
  if(document.querySelector(".pclogin")) try{ pcLoginRender(); }catch(e){}
})();
