/* PLEX PLAY 1.17 — modo demo, recordatorio en la web, clasificación por clase,
   monitoreo de errores y enlaces legales */
(function(){
  "use strict";
  if(typeof gEnsure==="undefined") return;
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var PC=window.PCB||{};
  var DEMO=!!window.PLX_DEMO;
  var LOCAL_KEYS=/^(carnet-etudes-c11|pc-profiles|pc-active|cr-draft)/;
  function clearLocal(){ try{ Object.keys(localStorage).filter(function(k){return LOCAL_KEYS.test(k)}).forEach(function(k){localStorage.removeItem(k)}); }catch(e){} }
  var ymd=function(d){ d=d||new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };

  /* =========================== 1. MODO DEMO =========================== */
  function demoStart(){
    try{ clearLocal(); localStorage.setItem("plx-demo","1"); localStorage.removeItem("plx-after-demo"); }catch(e){}
    location.reload();
  }
  function demoExit(){
    try{ clearLocal(); localStorage.removeItem("plx-demo"); localStorage.setItem("plx-after-demo","signup"); }catch(e){}
    save=function(){};   // que la demo no vuelva a guardarse al salir
    location.reload();
  }
  function loginDeco(){
    var el=document.querySelector(".pclogin"); if(!el) return;
    // pantalla de bienvenida
    var act=el.querySelector(".pls-act");
    if(act&&!act.querySelector("[data-plx-demo]")){
      var ref=act.querySelector(".pls-foot");
      var b=document.createElement("button"); b.type="button"; b.className="plx-demo-link"; b.dataset.plxDemo="start"; b.textContent="Probar sin cuenta";
      act.insertBefore(b,ref||null);
    }
    // formulario de ingreso o registro (solo estudiantes)
    var box=el.querySelector(".pl-box"), mode=el.getAttribute("data-mode")||"";
    var teacher=(typeof pcLogin!=="undefined"&&pcLogin.role==="teacher");
    var has=box&&box.querySelector(".plx-demo");
    if(box&&(mode==="login"||mode==="signup")&&!teacher){
      if(!has){
        var sw=box.querySelectorAll(".pl-switch"); var last=sw[sw.length-1];
        var d=document.createElement("div"); d.className="plx-demo";
        d.innerHTML='<button type="button" class="plx-demo-btn" data-plx-demo="start">Probar sin cuenta</button><small>Explora PLEX PLAY sin registrarte. Tu progreso se queda solo en este dispositivo.</small>';
        if(last) last.insertAdjacentElement("afterend",d); else box.appendChild(d);
      }
    } else if(has) has.remove();
    // pie: privacidad y términos
    var f=el.querySelector(".pl-foot");
    if(f&&!f.querySelector('a[href*="terminos"]')){
      var a=f.querySelector('a[href*="privacy"]');
      if(a) a.insertAdjacentHTML("afterend",' y los <a href="terminos.html" target="_blank" rel="noopener">términos de uso</a>');
    }
    // al salir de la demo se abre directamente «Crear cuenta»
    try{
      if(localStorage.getItem("plx-after-demo")==="signup"&&typeof pcLogin!=="undefined"&&typeof pcLoginRender==="function"){
        localStorage.removeItem("plx-after-demo");
        pcLogin.intro=false; pcLogin.mode="signup"; pcLogin.step=0; pcLogin.role="student"; pcLoginRender();
      }
    }catch(e){}
  }
  function demoBar(){
    if(!DEMO) return;
    var end=document.querySelector(".topbar-end");
    if(end&&!end.querySelector(".plx-demo-pill")) end.insertAdjacentHTML("afterbegin",'<button type="button" class="plx-demo-pill" data-plx-demo="info" aria-label="Modo demo: más información">Demo</button>');
    if(typeof view!=="undefined"&&view==="inicio"){
      var v=document.getElementById("view");
      if(v&&!v.querySelector(".plx-demo-band")) v.insertAdjacentHTML("afterbegin",'<button type="button" class="plx-demo-band" data-plx-demo="info"><span class="pdb-k">Modo demo</span><span>Tu progreso se queda en este dispositivo.</span><b>Crear mi cuenta ›</b></button>');
    }
  }
  function demoInfo(){
    gModal('<img class="mic-mz" src="img/mz-hola.webp" alt=""><small class="gm-k">Modo demo</small><h2 class="gm-t">Estás probando PLEX PLAY</h2>'+
      '<p class="gm-sub">Puedes hacer lecciones, retos y lecturas. En la demo no hay clasificación, duelos en línea ni corrección con IA, y tu progreso se queda solo en este dispositivo.</p>'+
      '<p class="gm-sub">Para guardar tu avance y usar todo, crea tu cuenta con el correo de la U. El progreso de la demo no se pasa a la cuenta.</p>'+
      '<div class="set-row c"><button class="gbtn ghost" data-g="close" data-autofocus>Seguir probando</button><button class="gbtn" data-plx-demo="exit">Crear mi cuenta</button></div>',"m-demo");
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-plx-demo]"); if(!b) return;
    e.preventDefault(); e.stopPropagation();
    var a=b.dataset.plxDemo;
    if(a==="start") demoStart();
    else if(a==="info") demoInfo();
    else if(a==="exit") demoExit();
  },true);
  if(DEMO){
    // en la demo se evita el 1V1 en línea (necesita cuenta); la práctica con Manzana sigue disponible
    document.addEventListener("click",function(e){
      var b=e.target.closest&&e.target.closest('[data-v1="search"],[data-v1="create"],[data-v1f="join"] button');
      if(!b) return; e.preventDefault(); e.stopPropagation(); toast("En la demo solo puedes practicar con Manzana. Crea tu cuenta para retar a tus compañeros.");
    },true);
    document.addEventListener("submit",function(e){ if(e.target.closest&&e.target.closest('[data-v1f="join"]')){ e.preventDefault(); e.stopPropagation(); } },true);
    setTimeout(function(){ try{ var G=gEnsure(); if(!G.demoHi&&G.name){ G.demoHi=1; save(!0); toast("Modo demo: tu progreso se guarda solo en este dispositivo."); } }catch(e){} },2500);
  }

  /* ====================== 2. RECORDATORIO EN LA WEB ====================== */
  var ANDROID_APP=!!(window.PlexAndroid&&PlexAndroid.setReminder);
  var CAN_NOTIF=("Notification" in window)&&("serviceWorker" in navigator);
  var STATE_URL="__plx/remind";
  function remState(){
    var r=remGet(), G=gEnsure(), done=false;
    try{ done=dayXP(new Date)>=(G.goalXP||100); }catch(e){}
    var st=0; try{ st=streak()|0; }catch(e){}
    return {on:!!r.on,h:r.h|0,m:r.m|0,done:done?ymd():"",streak:st,at:ymd(),name:String(G.name||"")};
  }
  function putState(){
    if(!CAN_NOTIF||!window.caches) return Promise.resolve();
    var s=remState();
    return caches.open("plx-state").then(function(c){
      return c.match(STATE_URL).then(function(old){ return old?old.json():{}; }).catch(function(){return {};}).then(function(o){
        s.notified=o&&o.notified||""; return c.put(STATE_URL,new Response(JSON.stringify(s),{headers:{"Content-Type":"application/json"}}));
      });
    }).catch(function(){});
  }
  var remTimer=0;
  function notifyNow(){
    var s=remState(); if(!s.on||s.done||Notification.permission!=="granted") return;
    navigator.serviceWorker.ready.then(function(reg){
      return caches.open("plx-state").then(function(c){ return c.match(STATE_URL).then(function(o){return o?o.json():{}}).then(function(o){
        if(o.notified===ymd()) return;
        o=Object.assign(o,s,{notified:ymd()});
        return c.put(STATE_URL,new Response(JSON.stringify(o))).then(function(){
          return reg.showNotification(s.streak>0?"¡Tu racha de "+s.streak+" días te espera!":"¡Manzana te espera!",{
            body:s.streak>0?"Haz una lección corta hoy para no perderla. Con 5 minutos basta.":"Haz una lección corta hoy y empieza tu racha.",
            icon:"icons/mz-icon-192.png",badge:"icons/mz-favicon-32.png",tag:"plx-remind",data:{url:"./"}
          });
        });
      }); });
    }).catch(function(){});
  }
  function armTimer(){
    clearTimeout(remTimer); var s=remState(); if(!s.on) return;
    var now=new Date(), t=new Date(); t.setHours(s.h,s.m,0,0);
    var ms=t-now; if(ms<0) return;              // la hora de hoy ya pasó: se encarga el service worker
    remTimer=setTimeout(notifyNow,Math.min(ms,2147483000));
  }
  function webRemSync(){
    var r=remGet();
    if(r.on&&Notification.permission!=="granted"){
      Notification.requestPermission().then(function(p){
        if(p!=="granted"){ var G=gEnsure(); G.remind=Object.assign({},remGet(),{on:false}); save(!0); toast("Sin permiso de notificaciones no podemos recordarte. Actívalo en los ajustes del navegador."); try{qsPaint()}catch(e){} }
        else webRemSync();
      });
      return;
    }
    putState();
    navigator.serviceWorker.ready.then(function(reg){
      if(!("periodicSync" in reg)) return;
      return (r.on?reg.periodicSync.register("plx-remind",{minInterval:3600*1000}):reg.periodicSync.unregister("plx-remind")).catch(function(){});
    }).catch(function(){});
    armTimer();
  }
  if(!ANDROID_APP&&typeof remHTML==="function"){
    remHTML=function(){
      if(!CAN_NOTIF) return '<div class="qs-row"><div><b>Recordatorio diario</b><small>Tu navegador no permite notificaciones. En Android puedes usar la <a href="https://github.com/jhonsaavedrau-dev/plexplay-android/releases/latest/download/PLEX-PLAY.apk">app de PLEX PLAY</a>.</small></div></div>';
      var r=remGet(), opts=[];
      for(var h=6;h<=23;h++) [0,30].forEach(function(m){ opts.push('<option value="'+h+':'+m+'" '+(r.h===h&&r.m===m?"selected":"")+'>'+String(h).padStart(2,"0")+':'+String(m).padStart(2,"0")+'</option>'); });
      var denied=Notification.permission==="denied";
      return '<div class="qs-row"><div><b>Recordatorio diario</b><small>'+(denied?"Las notificaciones están bloqueadas en este navegador: actívalas en sus ajustes.":"Una notificación para no perder tu racha. Funciona mejor con la app instalada.")+'</small></div><button class="qs-sw" role="switch" aria-checked="'+(!!r.on)+'" aria-label="Recordatorio diario" data-qs="remind" '+(denied?"disabled":"")+'><i></i></button></div>'+
        (r.on?'<label class="qs-time">Hora del recordatorio <select id="remTime">'+opts.join("")+'</select></label>':"");
    };
    if(CAN_NOTIF){
      remSync=webRemSync;
      remProgress=function(){ putState(); };
      setTimeout(function(){ if(remGet().on) webRemSync(); },2000);
      document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="visible"){ putState(); armTimer(); } });
    }
  }

  /* ====================== 3. CLASIFICACIÓN POR CLASE ====================== */
  function loadMates(){
    if(!PC.enabled||!PC.sb) return;
    PC.ready.then(function(s){
      if(!s) return;
      return PC.sb.rpc("class_mates").then(function(r){
        if(r.error||!r.data||!r.data.length){ window.PLX_CLS=null; return; }
        var by={}; r.data.forEach(function(x){ (by[x.class_id]=by[x.class_id]||{name:x.class_name,ids:new Set()}).ids.add(x.user_id); });
        var list=Object.keys(by).map(function(k){return by[k]});
        var ids=new Set(); list.forEach(function(c){ c.ids.forEach(function(i){ids.add(i)}); });
        ids.add(s.user.id);
        window.PLX_CLS={name:list.length===1?list[0].name:"Mis clases",ids:ids};
        if(document.querySelector(".lb-scope")) try{ render(); }catch(e){}
      });
    }).catch(function(){});
  }
  loadMates();
  document.addEventListener("click",function(e){
    if(e.target.closest&&e.target.closest('[data-sc="join"],[data-sc="leave"]')) setTimeout(loadMates,2500);
  });

  /* ====================== 4. MONITOREO DE ERRORES ====================== */
  var NOISE=/ResizeObserver loop|^Script error\.?$|Promesa: (offline|cancelled|session_expired|daily_limit|rate_limited|provider_error|http-\d+)$|AbortError|The play\(\) request was interrupted|NotAllowedError|Load failed|Failed to fetch|NetworkError/i;
  var sent={}, nSent=0, errOff=false;
  function flush(){
    var Q=window.__plxErrQ; if(errOff||!Q||!Q.length) return;
    var sb=PC.logSb; if(!sb) { Q.length=0; return; }
    var rows=[];
    Q.splice(0).forEach(function(x){
      if(!x.msg||NOISE.test(x.msg)) return;
      var k=x.msg+"|"+x.src; if(sent[k]||nSent>=8) return; sent[k]=1; nSent++;
      rows.push({msg:x.msg,src:x.src||null,stack:x.stack||null,
        ver:(typeof APP_VERSION!=="undefined"?APP_VERSION:""),view:(typeof view!=="undefined"?String(view):""),
        ua:navigator.userAgent.slice(0,160),demo:DEMO,user_id:(PC.enabled&&PC.uid)||null});
    });
    if(!rows.length) return;
    try{ sb.from("app_errors").insert(rows).then(function(r){ if(r&&r.error&&/42P01|does not exist|schema cache|permission|42501/i.test((r.error.code||"")+" "+(r.error.message||""))) errOff=true; },function(){}); }catch(e){}
  }
  setInterval(flush,5000); setTimeout(flush,1500);

  /* panel del administrador: errores de los últimos 7 días */
  var ERR={rows:null,busy:false,err:""};
  function loadErrs(){
    if(ERR.busy||!PC.sb) return; ERR.busy=true;
    var since=new Date(Date.now()-7*864e5).toISOString();
    PC.sb.from("app_errors").select("id,created_at,msg,src,ver,view,demo").gte("created_at",since).order("created_at",{ascending:false}).limit(300).then(function(r){
      ERR.busy=false; ERR.err=r.error?(/42P01|does not exist|schema cache/i.test((r.error.code||"")+r.error.message)?"Falta instalar la tabla de errores (sql/plx-1.17.sql).":"No se pudieron cargar los errores."):"";
      ERR.rows=r.data||[]; paintErrs();
    },function(){ ERR.busy=false; ERR.err="No se pudieron cargar los errores."; ERR.rows=[]; paintErrs(); });
  }
  function errsHTML(){
    if(ERR.rows==null) return '<p class="lb-empty">Cargando…</p>';
    if(ERR.err) return '<p class="gm-err">'+esc(ERR.err)+'</p>';
    if(!ERR.rows.length) return '<p class="gp-note">Sin errores en los últimos 7 días. 🎉</p>';
    var g={}; ERR.rows.forEach(function(r){ var k=r.msg; var x=g[k]=g[k]||{msg:r.msg,src:r.src,n:0,last:r.created_at,vers:{},views:{}}; x.n++; if(r.ver) x.vers[r.ver]=1; if(r.view) x.views[r.view]=1; });
    var list=Object.keys(g).map(function(k){return g[k]}).sort(function(a,b){return b.n-a.n});
    return '<ol class="plx-errl">'+list.slice(0,20).map(function(x){
      return '<li><div><b>'+esc(x.msg)+'</b><small>'+esc((x.src||"").replace(/^https?:\/\/[^/]+/,""))+'</small><small>Versión '+esc(Object.keys(x.vers).join(", ")||"-")+' · vista '+esc(Object.keys(x.views).join(", ")||"-")+' · último: '+new Date(x.last).toLocaleString("es-CO",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})+'</small></div><span class="plx-errn">'+x.n+'</span><button class="gbtn ghost sm" data-plx-err="del" data-msg="'+esc(x.msg)+'">Resuelto</button></li>';
    }).join("")+'</ol>';
  }
  function paintErrs(){ var c=document.querySelector(".plx-errs .plx-errb"); if(c) c.innerHTML=errsHTML(); }
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-plx-err]"); if(!b) return;
    e.preventDefault();
    if(b.dataset.plxErr==="reload"){ ERR.rows=null; paintErrs(); loadErrs(); return; }
    if(b.dataset.plxErr==="del"){ var m=b.dataset.msg; PC.sb.from("app_errors").delete().eq("msg",m).then(function(r){ if(r.error) return toast("No se pudo marcar como resuelto."); ERR.rows=(ERR.rows||[]).filter(function(x){return x.msg!==m}); paintErrs(); toast("Error marcado como resuelto"); }); }
  });

  /* ====================== enganche con render ====================== */
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{
      demoBar();
      if(typeof view!=="undefined"&&view==="docente"&&typeof isAdmin==="function"&&isAdmin()&&typeof T!=="undefined"&&!T.cls&&!T.sem){
        var sec=document.querySelector("#view .tpanel");
        if(sec&&!sec.querySelector(".plx-errs")){
          sec.insertAdjacentHTML("beforeend",'<div class="gcard plx-errs"><div class="tc-head"><h2>Errores de la app (7 días)</h2><button class="gbtn ghost sm" data-plx-err="reload">Actualizar</button></div><p class="gp-note">Fallos que la app registró en los celulares de los usuarios. Márcalos como resueltos cuando los arregles.</p><div class="plx-errb">'+errsHTML()+'</div></div>');
          if(ERR.rows==null) loadErrs();
        }
      }
      if(typeof view!=="undefined"&&view==="perfil"){
        var v=document.getElementById("view");
        if(v&&!v.querySelector(".plx-legal")) v.insertAdjacentHTML("beforeend",'<p class="plx-legal"><a href="privacy.html" target="_blank" rel="noopener">Política de privacidad</a> · <a href="terminos.html" target="_blank" rel="noopener">Términos de uso</a></p>');
      }
    }catch(e){}
    return r;
  };

  var dq=0; new MutationObserver(function(){ if(dq) return; dq=requestAnimationFrame(function(){ dq=0; loginDeco(); if(DEMO) demoBar(); }); }).observe(document.body,{childList:true,subtree:true});
  loginDeco(); demoBar();

  var css=`
  .plx-demo{display:grid;justify-items:center;gap:6px;margin:16px 0 4px;padding-top:14px;border-top:1px dashed #dfe5f1;text-align:center}
  .plx-demo-btn{all:unset;cursor:pointer;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 22px;border-radius:14px;border:1.5px solid #c7d2fe;background:#eef2ff;color:#1e3a8a;font-weight:800;font-size:1rem}
  .plx-demo-btn:hover{background:#e0e7ff}
  .plx-demo-btn:focus-visible,.plx-demo-link:focus-visible,.plx-demo-pill:focus-visible,.plx-demo-band:focus-visible{outline:3px solid #3b82f6;outline-offset:2px}
  .plx-demo small{color:#5b6b95;font-size:.85rem;max-width:340px;line-height:1.4}
  html[data-theme=dark] .plx-demo{border-color:#2a3350} html[data-theme=dark] .plx-demo-btn{background:#1b2340;border-color:#2f3b66;color:#dbe4ff}
  .plx-demo-link{all:unset;cursor:pointer;display:block;width:100%;text-align:center;margin:10px 0 0;padding:10px;font-weight:800;color:#fff;text-decoration:underline;text-underline-offset:3px}
  .plx-demo-pill{all:unset;cursor:pointer;padding:4px 10px;border-radius:99px;background:#facc15;color:#1e293b;font-weight:800;font-size:.78rem;letter-spacing:.04em;text-transform:uppercase}
  .plx-demo-band{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;width:100%;margin:0 0 12px;padding:10px 14px;border-radius:16px;background:#fef9c3;border:1.5px solid #fde047;color:#422006;font-size:.9rem;line-height:1.3}
  .plx-demo-band .pdb-k{padding:2px 8px;border-radius:99px;background:#facc15;font-weight:800;font-size:.72rem;letter-spacing:.04em;text-transform:uppercase}
  .plx-demo-band b{margin-left:auto;color:#1e3a8a}
  html[data-theme=dark] .plx-demo-band{background:#2a2410;border-color:#6b5a12;color:#fef3c7} html[data-theme=dark] .plx-demo-band b{color:#bfdbfe}
  @media (max-width:520px){.plx-demo-pill{padding:3px 7px;font-size:.68rem}}
  .plx-legal{text-align:center;color:var(--stone);font-size:.85rem;margin:22px 0 8px}
  .plx-legal a{color:inherit}
  .plx-errl{list-style:none;margin:0;padding:0;display:grid;gap:8px}
  .plx-errl li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:8px 10px;padding:12px;border-radius:14px;background:var(--surf2,#f4f6fb);border:1px solid var(--line,#e5e7eb)}
  .plx-errl li>div{min-width:0;display:grid;gap:3px}
  .plx-errl li>.gbtn{grid-column:1/-1;justify-self:start;width:auto!important;min-width:0!important}
  .plx-errs .tc-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
  .plx-errs .tc-head .gbtn{width:auto!important}
  .plx-errl b{font-size:.92rem;word-break:break-word}
  .plx-errl small{color:var(--stone);font-size:.78rem;word-break:break-all}
  .plx-errn{min-width:30px;height:30px;border-radius:99px;display:grid;place-items:center;background:#fee2e2;color:#991b1b;font-weight:800;font-size:.85rem}
  .lb-scope{flex-wrap:wrap}
  `;
  var st=document.createElement("style"); st.id="plx34"; st.textContent=css; document.head.appendChild(st);
})();
