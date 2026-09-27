/* PLEX PLAY 1.20 — carga diferida de la teoría y las explicaciones sencillas (primera carga más ligera) */
(function(){
  "use strict";
  if(typeof LESSONS==="undefined") return;
  var V={teoria:"0a357597",explica:"0cad3695"};
  var P1=null,P2=null;
  function load(src){ return new Promise(function(res,rej){ var s=document.createElement("script"); s.src=src; s.async=true; s.onload=function(){ res(); }; s.onerror=function(){ rej(new Error("load "+src)); }; document.head.appendChild(s); }); }
  function applyTeo(){
    var T=window.__TEORIA||{};
    LESSONS.forEach(function(l){ if(!l.theory&&T[l.id]) l.theory=T[l.id]; });
    (window.__MALLA||[]).forEach(function(t){ t.sections.forEach(function(se){ se.units.forEach(function(u){ u.lessons.forEach(function(l){ if(!l.theory&&T[l.id]) l.theory=T[l.id]; }); }); }); });
  }
  window.plxTeoria=function(){ if(window.__TEORIA){ applyTeo(); return Promise.resolve(); } return P1||(P1=load("teoria.js?v="+V.teoria).then(applyTeo,function(e){ P1=null; throw e; })); };
  window.plxExplica=function(){ if(window.__EXPLICA&&Object.keys(window.__EXPLICA).length>50) return Promise.resolve(); return P2||(P2=load("explica.js?v="+V.explica).catch(function(e){ P2=null; throw e; })); };
  function ready(){ return !!window.__TEORIA&&!!window.__EXPLICA&&Object.keys(window.__EXPLICA).length>50; }
  function both(){ return Promise.all([plxTeoria(),plxExplica()]); }

  /* abrir una lección espera a que la teoría esté (casi siempre ya cargó) */
  if(typeof openLesson==="function"){
    var _ol=openLesson;
    openLesson=function(){
      var self=this,a=arguments;
      if(ready()) return _ol.apply(self,a);
      var t=setTimeout(function(){ try{ toast("Cargando la lección…"); }catch(e){} },350);
      both().then(function(){ clearTimeout(t); _ol.apply(self,a); },function(){ clearTimeout(t); try{ toast("Sin conexión: esta lección aún no está guardada en tu celular."); }catch(e){} _ol.apply(self,a); });
    };
  }
  /* la guía busca en la teoría: se vuelve a dibujar cuando llega */
  if(typeof gGuia==="function"){
    var _gg=gGuia;
    gGuia=function(){ if(!window.__TEORIA) plxTeoria().then(function(){ try{ if(view==="guia") render(); }catch(e){} },function(){}); return _gg.apply(this,arguments); };
  }
  /* precarga en segundo plano cuando la app ya se ve */
  function idle(fn){ (window.requestIdleCallback||function(f){ return setTimeout(f,1200); })(fn,{timeout:4000}); }
  function pre(){ idle(function(){ plxExplica().then(function(){ idle(function(){ plxTeoria().catch(function(){}); }); },function(){}); }); }
  if(document.readyState==="complete") setTimeout(pre,800); else addEventListener("load",function(){ setTimeout(pre,800); });

  /* la app se dibuja apenas no hay pantalla de ingreso delante (o si se navega) */
  function release(){ if(!window.PLX_HOLD) return; window.PLX_HOLD=false; try{ render(); }catch(e){} }
  if(typeof go==="function"){ var _go=go; go=function(){ if(window.PLX_HOLD) window.PLX_HOLD=false; return _go.apply(this,arguments); }; }
  if(window.PLX_HOLD){
    var chk=function(){ if(window.PLX_HOLD&&!document.querySelector(".pclogin")) release(); };
    setTimeout(chk,1800);
    try{ new MutationObserver(function(){ if(window.PLX_HOLD&&!document.querySelector(".pclogin")) setTimeout(chk,60); }).observe(document.body,{childList:true}); }catch(e){}
  }

  /* demo: la opción «Ya tengo un perfil» (código de progreso) confunde; se oculta */
  if(window.PLX_DEMO){
    var st=document.createElement("style"); st.id="plx37"; st.textContent='.gonb .onb-cta [data-g="players"]{display:none!important}'; document.head.appendChild(st);
  }
})();
