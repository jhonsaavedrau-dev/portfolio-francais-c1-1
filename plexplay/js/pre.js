/* PLEX PLAY 1.17 — ajustes que deben correr antes del resto de la app */
(function(){
  "use strict";
  /* modo docente visible (Soy estudiante / Soy docente en el ingreso) */
  window.PLX_TEACH = true;
  /* modo demo: la app funciona sin cuenta y sin servidor; el progreso queda en este dispositivo */
  try{ window.PLX_DEMO = localStorage.getItem("plx-demo") === "1"; }catch(e){ window.PLX_DEMO = false; }
  /* sin sesión guardada: no se dibuja la app detrás del ingreso (ahorra datos en la primera carga) */
  try{ var C=window.PC_CONFIG||{}, au=JSON.parse(localStorage.getItem("pc-auth")||"null"); window.PLX_HOLD=!!(C.url&&C.key)&&!window.PLX_DEMO&&!(au&&au.user); }catch(e){ window.PLX_HOLD=false; }
  /* errores tempranos: se guardan hasta que el monitor (plx34) pueda enviarlos */
  var Q = window.__plxErrQ = [];
  function push(msg, src, stack){ if(Q.length < 20) Q.push({ msg:String(msg||"").slice(0,500), src:String(src||"").slice(0,300), stack:String(stack||"").slice(0,2000), t:Date.now() }); }
  window.addEventListener("error", function(e){
    if(!e || (!e.message && !e.error)) return;                 // errores de carga de recursos: se ignoran
    push(e.message || (e.error && e.error.message), (e.filename||"") + ":" + (e.lineno||0) + ":" + (e.colno||0), e.error && e.error.stack);
  });
  window.addEventListener("unhandledrejection", function(e){
    var r = e && e.reason; if(!r) return;
    var m = r.message || r.code || (typeof r === "string" ? r : ""); if(!m) return;
    push("Promesa: " + m, "", r.stack);
  });
})();
