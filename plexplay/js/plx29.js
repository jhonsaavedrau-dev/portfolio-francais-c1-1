/* PLEX PLAY 1.13 — Mis palabras: guardar vocabulario de las lecturas y repasarlo con tarjetas */
(function(){
  "use strict";
  if(typeof GV==="undefined") return;
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var INT=[0,1,3,7,14,30,60];
  function V(){ if(!S.vocab||typeof S.vocab!=="object") S.vocab={}; return S.vocab; }
  function day(){ return Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5); }
  function due(){ var t=day(), v=V(); return Object.keys(v).filter(function(k){ return (v[k].d||0)<=t; }); }
  var FC={list:[],i:0,show:false,ok:0};

  /* botón «Guardar» dentro de la ayuda de palabra de las lecturas */
  new MutationObserver(function(){
    var tip=document.querySelector(".lw-tip:not([data-sv])"); if(!tip) return;
    tip.dataset.sv=1;
    var w=tip.querySelector("b"), fr=w?w.textContent:"", es=tip.textContent.slice(fr.length);
    var has=!!V()[fr];
    tip.insertAdjacentHTML("beforeend",' <button class="lw-save" data-vsave="'+esc(fr)+'" data-es="'+esc(es)+'" '+(has?"disabled":"")+">"+(has?"✓ Guardada":"＋ Guardar")+"</button>");
  }).observe(document.getElementById("view")||document.body,{childList:true,subtree:true});

  GV.palabras=function(){
    var v=V(), keys=Object.keys(v).sort(function(a,b){ return (v[b].at||0)-(v[a].at||0); }), d=due();
    if(FC.list.length&&FC.i<FC.list.length){
      var k=FC.list[FC.i], it=v[k]||{};
      return '<section class="gview amv">'+'<button class="gback" data-vfc="quit">‹ Mis palabras</button>'+
        '<div class="fc-prog"><i style="width:'+(FC.i/FC.list.length*100)+'%"></i></div><p class="fc-n">'+(FC.i+1)+" / "+FC.list.length+"</p>"+
        '<button class="fc-card'+(FC.show?" flip":"")+'" data-vfc="flip"><span class="fc-front"><small>¿Qué significa?</small><b>'+esc(k)+'</b>'+(it.ctx?'<em>«… '+esc(it.ctx)+' …»</em>':"")+'<span class="fc-hint">Toca para ver la respuesta</span></span><span class="fc-back"><small>'+esc(k)+"</small><b>"+esc(it.es||"")+"</b>"+(it.from?"<em>De: "+esc(it.from)+"</em>":"")+"</span></button>"+
        (FC.show?'<div class="fc-btns"><button class="gbtn ghost" data-vfc="no">😕 No lo sabía</button><button class="gbtn" data-vfc="yes">😎 Lo sabía</button></div>':'<div class="fc-btns"><button class="gbtn wide" data-vfc="flip">Ver respuesta</button></div>')+"</section>";
    }
    if(FC.list.length&&FC.i>=FC.list.length){
      var n=FC.list.length, ok=FC.ok; FC.list=[];
      return '<section class="gview amv"><div class="fc-end"><span>🎉</span><h1>¡Repaso terminado!</h1><p>'+ok+" de "+n+' palabras las sabías. Las que fallaste volverán mañana.</p><button class="gbtn" data-view="palabras">Volver a mis palabras</button></div></section>';
    }
    return '<section class="gview amv">'+'<button class="gback" data-view="retos">‹ Retos</button>'+
      '<div class="am-hero voc"><div><small>Vocabulario</small><h1>Mis palabras</h1><p>Guarda palabras de las lecturas tocando «＋ Guardar» y repásalas con tarjetas: vuelven a los 1, 3, 7, 14 y 30 días.</p></div><div class="am-count"><b>'+keys.length+'</b><span>palabras</span></div></div>'+
      (keys.length?'<div class="am-row"><button class="gbtn" data-vfc="start" '+(d.length?"":"disabled")+">"+(d.length?"Repasar "+d.length+" palabra"+(d.length>1?"s":"")+" →":"Nada que repasar hoy")+'</button><button class="gbtn ghost" data-vfc="all">Repasar todas</button></div>'+
        '<ul class="voc-list">'+keys.map(function(k){ var it=v[k], lvl=Math.min(it.b||0,5); return '<li><div><b>'+esc(k)+"</b><span>"+esc(it.es||"")+'</span></div><i class="voc-lv" title="Dominio">'+"●".repeat(lvl)+"○".repeat(5-lvl)+'</i><button class="voc-del" data-vdel="'+esc(k)+'" aria-label="Quitar">✕</button></li>'; }).join("")+"</ul>":
        '<div class="fc-empty"><span>📖</span><p>Todavía no tienes palabras guardadas. Abre una lectura, toca una palabra subrayada y pulsa <b>＋ Guardar</b>.</p><button class="gbtn" data-am="lecturas">Ir a las lecturas</button></div>')+"</section>";
  };

  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-vsave],[data-vfc],[data-vdel]"); if(!b) return;
    e.preventDefault(); e.stopPropagation();
    var d=b.dataset;
    if(d.vsave){
      var ctx=""; try{ var lw=b.closest(".lw-tip").previousElementSibling, p=lw&&lw.closest("p"); if(p){ var cl=p.cloneNode(true); cl.querySelectorAll(".lw-tip").forEach(function(x){ x.remove(); }); var t=cl.textContent, i=t.indexOf(d.vsave); ctx=t.slice(Math.max(0,i-40),i+d.vsave.length+40).replace(/\s+/g," ").trim(); } }catch(x){}
      var title=""; try{ title=(document.querySelector(".lec-head h1")||{}).textContent||""; }catch(x){}
      V()[d.vsave]={es:d.es.trim(),from:title,ctx:ctx,at:Date.now(),b:0,d:day()};
      save(!0); b.textContent="✓ Guardada"; b.disabled=true; toast("Palabra guardada en «Mis palabras»"); return;
    }
    if(d.vdel){ delete V()[d.vdel]; save(!0); render(); return; }
    var a=d.vfc;
    if(a==="start"||a==="all"){ var keys=a==="all"?Object.keys(V()):due(); keys.sort(function(){ return Math.random()-.5; }); FC={list:keys.slice(0,25),i:0,show:false,ok:0}; render(); scrollTo(0,0); return; }
    if(a==="quit"){ FC.list=[]; render(); return; }
    if(a==="flip"){ FC.show=!FC.show; render(); return; }
    if(a==="yes"||a==="no"){
      var k=FC.list[FC.i], it=V()[k];
      if(it){ if(a==="yes"){ it.b=Math.min((it.b||0)+1,INT.length-1); FC.ok++; } else it.b=0; it.d=day()+INT[Math.max(1,it.b)]; }
      try{ typeof SFX!=="undefined"&&(a==="yes"?SFX.ok&&SFX.ok():SFX.ko&&SFX.ko()); }catch(x){}
      FC.i++; FC.show=false;
      if(FC.i>=FC.list.length){ try{ addXP(5+FC.ok); addAct("V"); save(!0); typeof gAfterProgress==="function"&&gAfterProgress(); }catch(x){} }
      render(); return;
    }
  },true);

  /* acceso desde Retos */
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{
      if(view==="retos"){
        var f=document.querySelector("#view .am-feat");
        if(f&&!f.querySelector(".amf.voc")){ var n=Object.keys(V()).length, du=due().length; f.insertAdjacentHTML("beforeend",'<button class="amf voc" data-am="palabras"><span class="amf-i">🗂️</span><b>Mis palabras</b><small>'+(n?n+" guardadas"+(du?" · "+du+" para hoy":""):"Guarda palabras de las lecturas")+"</small></button>"); }
      }
      if(view==="palabras"){ document.querySelectorAll('#tabbar [data-view="retos"],.nav [data-view="retos"]').forEach(function(x){ x.setAttribute("aria-current","page"); }); }
    }catch(e){}
    return r;
  };

  var css=`
  .am-feat{grid-template-columns:repeat(4,1fr)!important}
  @media (max-width:1100px){.am-feat{grid-template-columns:repeat(2,1fr)!important}}
  @media (max-width:700px){.am-feat{grid-template-columns:1fr!important}}
  .amf.voc{background:linear-gradient(135deg,#ea580c,#f59e0b)}
  .am-hero.voc{background:linear-gradient(120deg,#ea580c,#f59e0b)}
  .lw-save{all:unset;cursor:pointer;margin-left:8px;padding:1px 8px;border-radius:99px;background:rgba(255,255,255,.22);font-weight:800;font-size:.78rem}
  .lw-save[disabled]{opacity:.8;cursor:default}
  .voc-list{list-style:none;padding:0;margin:0;display:grid;gap:8px}
  .voc-list li{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:16px;background:var(--raise);border:1.5px solid var(--line)}
  .voc-list li div{display:grid;flex:1;min-width:0}.voc-list li span{color:var(--stone);font-size:.88rem}
  .voc-lv{font-style:normal;color:#f59e0b;letter-spacing:1px;font-size:.8rem}
  .voc-del{all:unset;cursor:pointer;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;color:var(--stone)}
  .voc-del:hover{background:var(--surf3)}
  .fc-empty,.fc-end{display:grid;justify-items:center;text-align:center;gap:8px;padding:30px 16px;border-radius:24px;background:var(--raise);border:1.5px solid var(--line)}
  .fc-empty span,.fc-end span{font-size:48px}
  .fc-prog{height:10px;border-radius:99px;background:var(--surf3);overflow:hidden;margin:6px 0}.fc-prog i{display:block;height:100%;background:linear-gradient(90deg,#ea580c,#f59e0b);transition:width .3s}
  .fc-n{text-align:center;color:var(--stone);font-weight:800;margin:4px 0 10px}
  .fc-card{all:unset;box-sizing:border-box;cursor:pointer;display:block;width:min(520px,100%);height:260px;margin:0 auto;position:relative;perspective:900px}
  .fc-front,.fc-back{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:8px;text-align:center;padding:20px;border-radius:26px;backface-visibility:hidden;-webkit-backface-visibility:hidden;transition:transform .45s cubic-bezier(.3,.7,.3,1);box-shadow:0 18px 36px -24px rgba(30,58,138,.8)}
  .fc-front{background:var(--raise);border:2px solid var(--line)}
  .fc-back{background:linear-gradient(135deg,#ea580c,#f59e0b);color:#fff;transform:rotateY(180deg)}
  .fc-card.flip .fc-front{transform:rotateY(-180deg)}.fc-card.flip .fc-back{transform:rotateY(0)}
  .fc-front b{font-size:2rem}.fc-back b{font-size:1.5rem}
  .fc-front small,.fc-back small{font-weight:800;opacity:.75}
  .fc-front em,.fc-back em{font-size:.85rem;opacity:.8}
  .fc-hint{font-size:.78rem;color:var(--stone)}
  .fc-btns{display:flex;gap:10px;justify-content:center;margin:16px 0}
  .fc-btns .gbtn{min-width:150px}
  `;
  var st=document.createElement("style"); st.id="plx29"; st.textContent=css; document.head.appendChild(st);
})();
