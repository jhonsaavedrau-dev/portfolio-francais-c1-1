/* PLEX PLAY 1.15 — aviso de versión nueva, misiones diarias, diagnóstico personal, ligas, logros nuevos,
   pronunciación y lectura al terminar una lección, y un Inicio más ordenado */
(function(){
  "use strict";
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var q=function(s,r){return (r||document).querySelector(s)};

  /* ---------------- 1. Aviso de versión nueva ---------------- */
  function updBanner(){
    if(q(".plx-upd")) return;
    var d=document.createElement("div"); d.className="plx-upd"; d.setAttribute("role","status");
    d.innerHTML='<span>✨ Hay una versión nueva de PLEX PLAY</span><button data-upd>Actualizar</button><button class="x" data-updx aria-label="Más tarde">✕</button>';
    document.body.appendChild(d); requestAnimationFrame(function(){ d.classList.add("in"); });
  }
  addEventListener("plx-update",updBanner); if(window.__plxUpd) updBanner();
  document.addEventListener("click",function(e){
    if(e.target.closest("[data-upd]")){ try{ if(typeof P!=="undefined"&&P) save(!0); }catch(x){} location.reload(); }
    if(e.target.closest("[data-updx]")){ var b=q(".plx-upd"); b&&b.remove(); }
  });
  function checkUpd(){ try{ window.__plxReg&&window.__plxReg.update(); }catch(e){} }
  setInterval(checkUpd,20*60*1000);
  document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="visible") checkUpd(); });

  /* ---------------- utilidades ---------------- */
  function acts(){ try{ return today().acts||[]; }catch(e){ return []; } }
  function cnt(re){ return acts().filter(function(a){ return re.test(a); }).length; }
  function hash(s){ var h=0; for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return Math.abs(h); }
  function goal(){ try{ return gEnsure().goalXP||100; }catch(e){ return 100; } }

  /* ---------------- 2. Misiones diarias ---------------- */
  var POOL=[
    {id:"les",t:"Completa 1 lección",ic:"📘",n:1,f:function(){ return cnt(/^L:(?!r-)/); },go:'data-view="lecciones"'},
    {id:"les2",t:"Completa 2 lecciones",ic:"📚",n:2,f:function(){ return cnt(/^L:(?!r-)/); },go:'data-view="lecciones"'},
    {id:"rev",t:"Haz el repaso del día",ic:"🔁",n:1,f:function(){ return cnt(/^R:/); },go:'data-p="practice"'},
    {id:"lec",t:"Lee una lectura graduada",ic:"📖",n:1,f:function(){ return cnt(/^L:r-/); },go:'data-am="lecturas"'},
    {id:"dic",t:"Haz un dictado",ic:"🎧",n:1,f:function(){ return cnt(/^D:/); },go:'data-dzgo="dictee"'},
    {id:"ora",t:"Practica expresión oral",ic:"🎙️",n:1,f:function(){ return cnt(/^O:/); },go:'data-am="oral"'},
    {id:"duel",t:"Juega un duelo 1V1",ic:"⚔️",n:1,f:function(){ return cnt(/^1V1/); },go:'data-v1="open"'},
    {id:"voc",t:"Repasa tus palabras",ic:"🗂️",n:1,f:function(){ return cnt(/^V$/); },go:'data-am="palabras"'},
    {id:"atel",t:"Escribe un texto en el taller",ic:"✍️",n:1,f:function(){ return cnt(/^A:/); },go:'data-view="atelier"'}
  ];
  function missions(){
    var k=dkey(), h=hash(k+"plx"), g=goal();
    var xp={id:"xp",t:"Gana "+Math.round(g*.6)+" XP",ic:"⭐",n:Math.round(g*.6),f:function(){ try{ return today().xp||0; }catch(e){ return 0; } },go:'data-view="lecciones"'};
    var pool=POOL.slice(), out=[xp];
    for(var i=0;i<2&&pool.length;i++){ var j=(h>>(i*5))%pool.length; out.push(pool.splice(j,1)[0]); }
    return out;
  }
  function missState(){ var G=gEnsure(); if(!G.miss||G.miss.d!==dkey()) G.miss={d:dkey(),claimed:0}; return G.miss; }
  function missHTML(){
    var M=missions(), st=missState(), done=0;
    var rows=M.map(function(m){ var c=Math.min(m.f(),m.n), ok=c>=m.n; if(ok) done++;
      return '<button class="ms-i'+(ok?" ok":"")+'" '+(ok?"disabled":m.go)+'><span class="ms-ic">'+(ok?"✓":m.ic)+'</span><span class="ms-t"><b>'+esc(m.t)+'</b><span class="ms-b"><i style="width:'+Math.round(c/m.n*100)+'%"></i></span></span><em>'+c+"/"+m.n+"</em></button>"; }).join("");
    var all=done===M.length;
    return '<div class="gcard plx-miss"><div class="ms-h"><b>🎯 Misiones del día</b><small>'+done+'/3 completadas</small></div>'+rows+
      '<button class="ms-chest'+(all&&!st.claimed?" ready":"")+(st.claimed?" got":"")+'" data-chest '+(all&&!st.claimed?"":"disabled")+'><span>'+(st.claimed?"🎉":"🎁")+'</span><b>'+(st.claimed?"¡Cofre abierto! +30 XP":all?"¡Abre tu cofre!":"Completa las 3 misiones para abrir el cofre")+"</b></button></div>";
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-chest]"); if(!b||b.disabled) return;
    var st=missState(); if(st.claimed) return; st.claimed=1;
    try{ addXP(30); save(!0); typeof SFX!=="undefined"&&SFX.done&&SFX.done(); typeof gAfterProgress==="function"&&gAfterProgress(); }catch(x){}
    toast("+30 XP · ¡misiones completadas!"); render();
  });

  /* ---------------- 3. Diagnóstico personal ---------------- */
  var T2L={accord:["accord"],prep:["prep"],conj:["conj"],ortho:["gram","accord"],ponct:["coh"],rep:["coh","registre"],polit:["registre"],consigne:["comp"],registre:["registre"],struct:["coh","comp"],phono:["phono"],co:["comp","phono"],coh:["coh"],synt:["gram"]};
  function diagHTML(){
    var by={}; Object.keys(S.carnet||{}).forEach(function(k){ var t=S.carnet[k].t||"autre"; by[t]=(by[t]||0)+1; });
    var top=Object.keys(by).filter(function(t){ return t!=="autre"; }).sort(function(a,b){ return by[b]-by[a]; });
    var total=Object.keys(S.carnet||{}).length;
    if(total<3||!top.length){
      return '<div class="gcard plx-diag empty"><div class="dg-h"><b>🔍 Tu diagnóstico</b></div><p>Cuando cometas algunos errores en las lecciones, aquí te diré qué reforzar primero y con qué lección.</p></div>';
    }
    var t0=top[0], name=(typeof TYPES!=="undefined"&&TYPES[t0])?TYPES[t0].l:t0, want=T2L[t0]||[];
    var lv=["A1","A2","B1","B2","C1"], my=lv.indexOf((typeof cefr==="function"?cefr().lvl:"A1"));
    var cand=LESSONS.filter(function(l){ return !l.special&&want.indexOf(l.t)>=0&&lv.indexOf(CEFR_OF[l.track]||"A1")<=Math.max(my,1); });
    var rec=cand.find(function(l){ return !(S.lessons[l.id]&&S.lessons[l.id].done); })||cand.sort(function(a,b){ var ma=0,mb=0; try{ ma=lessonMastery(a).pct; mb=lessonMastery(b).pct; }catch(e){} return ma-mb; })[0];
    var max=by[top[0]];
    var bars=top.slice(0,3).map(function(t){ return '<li><span>'+esc((typeof TYPES!=="undefined"&&TYPES[t])?TYPES[t].l:t)+'</span><i><b style="width:'+Math.round(by[t]/max*100)+'%"></b></i><em>'+by[t]+"</em></li>"; }).join("");
    return '<div class="gcard plx-diag"><div class="dg-h"><b>🔍 Tu diagnóstico</b><small>según tus errores</small></div>'+
      '<p class="dg-main">Tu punto a reforzar: <b>'+esc(name)+"</b> ("+by[t0]+" error"+(by[t0]>1?"es":"")+").</p><ul class=\"dg-bars\">"+bars+"</ul>"+
      '<div class="dg-act">'+(rec?'<button class="gbtn sm" data-open="'+rec.id+'">📘 '+esc(rec.title.length>38?rec.title.slice(0,36)+"…":rec.title)+"</button>":"")+'<button class="gbtn ghost sm" data-review>Repasar mis errores</button></div></div>';
  }

  /* ---------------- 4. Ligas semanales ---------------- */
  var LIGAS=[["Bronce","🥉","#b7793e"],["Plata","🥈","#94a3b8"],["Oro","🥇","#f59e0b"],["Zafiro","💠","#2563eb"],["Rubí","♦️","#e11d48"],["Diamante","💎","#06b6d4"]];
  function prevWeek(){ var d=new Date(); d.setDate(d.getDate()-7); return weekKey(d); }
  function leagueCheck(){
    try{
      var G=gEnsure(), wk=weekKey(); if(G.lgWk===wk) return; if(typeof gCloud==="undefined"||!gCloud.ready) return;
      var pw=prevWeek(), myPrev=0, d=new Date(pw+"T12:00:00"); for(var i=0;i<7;i++){ myPrev+=(S.days[dkey(d)]||{}).xp||0; d.setDate(d.getDate()+1); }
      var first=!G.lgWk; G.lgWk=wk; G.lg=G.lg||0;
      if(!first&&myPrev>0){
        var rows=(gCloud.rows||[]).filter(function(r){ return r.wk===pw&&r.wxp>0&&r.id!==gCloud.uid; }).map(function(r){ return r.wxp; });
        rows.push(myPrev); rows.sort(function(a,b){ return b-a; });
        var pos=rows.indexOf(myPrev), n=rows.length, up=Math.max(1,Math.ceil(n*.2)), down=n>=5?Math.floor(n*.8):n;
        if(pos<up&&G.lg<LIGAS.length-1){ G.lg++; setTimeout(function(){ toast(LIGAS[G.lg][1]+" ¡Subiste a la liga "+LIGAS[G.lg][0]+"!"); },1200); }
        else if(pos>=down&&n>=5&&G.lg>0){ G.lg--; }
      }
      save(!0);
    }catch(e){}
  }
  function leagueHead(){
    var G=gEnsure(), L=LIGAS[G.lg||0], nx=LIGAS[(G.lg||0)+1];
    return '<div class="plx-liga" style="--lc:'+L[2]+'"><span class="lg-i">'+L[1]+'</span><div><b>Liga '+L[0]+'</b><small>'+(nx?"El 20 % de arriba sube a la liga "+nx[0]+" el lunes.":"¡Estás en la liga más alta!")+"</small></div></div>";
  }

  /* ---------------- 5. Logros nuevos ---------------- */
  try{
    var NEW=[
      ["lec1","Primera lectura","Lecteur","book","#0EA5E9",function(){ return Object.keys(S.lec||{}).length>=1; }],
      ["lec10","10 lecturas","Grand lecteur","book","#0369A1",function(){ return Object.keys(S.lec||{}).length>=10; }],
      ["voc25","25 palabras guardadas","Collectionneur","star","#EA580C",function(){ return Object.keys(S.vocab||{}).length>=25; }],
      ["oral1","Primera práctica oral","À l'oral","chat","#DB2777",function(){ return Object.keys(S.oralh||{}).length>=1; }],
      ["sim1","Simulacro aprobado","Candidat","trophy","#F59E0B",function(){ var h=S.simh||{}; return Object.keys(h).some(function(k){ return (h[k].best||0)>=50; }); }],
      ["duel1","Primera victoria 1V1","Duelliste","bolt","#7C3AED",function(){ var d=gEnsure().duels||{}; return (d.w||0)>=1; }],
      ["miss7","7 cofres de misiones","Assidu","crown","#16A34A",function(){ return (gEnsure().chests||0)>=7; }]
    ];
    NEW.forEach(function(a){ if(!ACH.some(function(x){ return x[0]===a[0]; })) ACH.push(a); });
    document.addEventListener("click",function(e){ if(e.target.closest&&e.target.closest("[data-chest]")){ var G=gEnsure(); G.chests=(G.chests||0)+1; } },true);
  }catch(e){}

  /* ---------------- 6. Al terminar una lección: pronunciar y leer ---------------- */
  function endExtras(){
    try{
      if(typeof P==="undefined"||!P||P.mode!=="lesson"||P.phase!=="end"||!P.lesson) return;
      var box=q("#player .pbody .wrap")||q("#player"); if(!box||box.querySelector(".plx-endx")) return;
      var l=P.lesson, lvl=CEFR_OF[l.track]||"A1";
      var says=(l.items||[]).map(function(it,i){ return it.k==="listen"&&it.say?{i:i,s:it.say}:null; }).filter(Boolean);
      var lec=(window.__LEC||[]).filter(function(r){ return r.level===lvl; }), rd=lec.find(function(r){ return !(S.lec||{})[r.id]; })||lec[0];
      if(!says.length&&!rd) return;
      var h='<div class="plx-endx"><b>Sigue practicando</b><div class="ex-row">'+
        (says.length?'<button class="ex-c" data-endspeak="'+esc(l.id)+'"><span>🎤</span><b>Pronuncia la lección</b><small>'+says.length+" frase"+(says.length>1?"s":"")+" en voz alta</small></button>":"")+
        (rd?'<button class="ex-c" data-endlec="'+esc(rd.id)+'"><span>'+esc(rd.emoji||"📖")+'</span><b>Lectura '+lvl+'</b><small>'+esc(rd.title)+"</small></button>":"")+"</div></div>";
      var btns=box.querySelector(".end-actions, .btn-row, .pf-end");
      (btns||box.lastElementChild||box).insertAdjacentHTML(btns?"beforebegin":"afterend",h);
    }catch(e){}
  }
  new MutationObserver(function(){ endExtras(); }).observe(document.getElementById("player")||document.body,{childList:true,subtree:true});
  document.addEventListener("click",function(e){
    var s=e.target.closest&&e.target.closest("[data-endspeak]");
    if(s){
      e.preventDefault(); e.stopPropagation();
      var l=LESSONS.find(function(x){ return x.id===s.dataset.endspeak; }); if(!l) return;
      var keys=[]; (l.items||[]).forEach(function(it,i){ if(it.k==="listen"&&it.say){ var k="speakL:"+l.id+":"+i; ITEMS[k]={it:{k:"speak",say:it.say,acc:[it.say],tokens:[it.say],t:"phono",ask:"Escucha el modelo si quieres y luego lee la frase en voz alta.",why:"Frase modelo: <b>"+esc(it.say)+"</b>. Repite despacio las palabras marcadas en rojo."},l:l}; keys.push(k); } });
      try{ closePlayer(); }catch(x){}
      setTimeout(function(){ start({mode:"speak",title:"Pronuncia la lección",eyebrow:"Pronunciación · "+l.title,steps:keys.map(function(k){ return {kind:"item",key:k}; })}); },150);
      return;
    }
    var r=e.target.closest&&e.target.closest("[data-endlec]");
    if(r){ e.preventDefault(); e.stopPropagation(); try{ closePlayer(); }catch(x){} var id=r.dataset.endlec; setTimeout(function(){ var b=document.createElement("button"); b.dataset.lec=id; b.style.display="none"; document.body.appendChild(b); b.click(); b.remove(); },150); }
  },true);

  /* ---------------- 7. Inicio más ordenado + tarjetas nuevas ---------------- */
  function homeLayout(){
    var main=q("#view .ghome .gmain"); if(!main||main.dataset.plx31) return; main.dataset.plx31=1;
    var today=main.querySelector(".am-today"), anchor=today||main.querySelector(".m-course");
    if(anchor){ anchor.insertAdjacentHTML("afterend",missHTML()+diagHTML()); }
    var order=[".greet",".m-course",".am-today",".plx-miss",".plx-diag",".v1-card",".streak-card",".hsum",".pf-home",".plc-card"];
    order.forEach(function(sel){ var el=main.querySelector(sel); if(el) main.appendChild(el); });
    var rest=main.querySelectorAll(":scope > .lvl-card, :scope > .gsec, :scope > .cur-lesson, :scope > .quick"); rest.forEach(function(el){ main.appendChild(el); });
    try{ var anyDone=Object.keys(S.lessons||{}).some(function(k){ return S.lessons[k].done; }); var plc=main.querySelector(".plc-card"); if(plc&&anyDone) plc.classList.add("plx-hide"); }catch(e){}
  }
  function lbLeague(){
    var cards=document.querySelectorAll("#view .lb-card"); cards.forEach(function(c){ if(c.querySelector(".plx-liga")) return; var h=c.querySelector(".lb-h"); if(h) h.insertAdjacentHTML("afterend",leagueHead()); });
  }
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{ leagueCheck(); if(view==="parcours") homeLayout(); if(view==="parcours"||view==="retos"||view==="perfil") lbLeague(); }catch(e){ console.warn(e); }
    return r;
  };

  var css=`
  .plx-upd{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom,0));transform:translate(-50%,40px);opacity:0;z-index:90;display:flex;align-items:center;gap:10px;padding:10px 10px 10px 16px;border-radius:18px;background:#0f1d3d;color:#fff;box-shadow:0 18px 40px -16px rgba(10,18,40,.7);transition:transform .3s,opacity .3s;max-width:calc(100vw - 24px)}
  .plx-upd.in{transform:translate(-50%,0);opacity:1}
  .plx-upd span{font-weight:700;font-size:.9rem}
  .plx-upd button{all:unset;cursor:pointer;padding:8px 14px;border-radius:12px;background:#facc15;color:#1e3a8a;font-weight:900;font-size:.85rem;white-space:nowrap}
  .plx-upd button.x{background:transparent;color:#c7d2fe;padding:8px}
  .plx-miss,.plx-diag{padding:16px!important;display:grid;gap:8px}
  .ms-h,.dg-h{display:flex;align-items:baseline;gap:10px}.ms-h b,.dg-h b{font-size:1.05rem}.ms-h small,.dg-h small{color:var(--stone)}
  .ms-i{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:10px 12px;border-radius:16px;background:var(--surf3)}
  .ms-i:hover:not([disabled]){background:color-mix(in srgb,#2563eb 8%,var(--surf3))}
  .ms-ic{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;font-size:20px;background:var(--raise)}
  .ms-i.ok .ms-ic{background:#22c55e;color:#fff;font-weight:900}
  .ms-t{display:grid;gap:6px;min-width:0}.ms-t b{font-size:.92rem}
  .ms-b{height:7px;border-radius:99px;background:var(--raise);overflow:hidden}.ms-b i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#f59e0b,#facc15)}
  .ms-i.ok .ms-b i{background:linear-gradient(90deg,#16a34a,#4ade80)}
  .ms-i em{font-style:normal;font-weight:800;font-size:.82rem;color:var(--stone)}
  .ms-chest{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:16px;border:2px dashed var(--line);color:var(--stone);font-size:.9rem}
  .ms-chest span{font-size:24px}
  .ms-chest.ready{cursor:pointer;border:0;background:linear-gradient(135deg,#f59e0b,#facc15);color:#422006;animation:msPulse 1.4s ease-in-out infinite}
  .ms-chest.got{border-style:solid;border-color:#86efac;color:#15803d}
  @keyframes msPulse{50%{transform:scale(1.02);box-shadow:0 10px 24px -12px rgba(245,158,11,.8)}}
  .plx-diag p{margin:0;line-height:1.45}.plx-diag.empty p{color:var(--stone)}
  .dg-bars{list-style:none;padding:0;margin:0;display:grid;gap:6px}
  .dg-bars li{display:grid;grid-template-columns:minmax(0,1.3fr) 1fr auto;gap:10px;align-items:center;font-size:.85rem}
  .dg-bars span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .dg-bars i{height:8px;border-radius:99px;background:var(--surf3);overflow:hidden}.dg-bars i b{display:block;height:100%;background:linear-gradient(90deg,#ef4444,#f97316);border-radius:99px}
  .dg-bars em{font-style:normal;font-weight:800;color:var(--stone)}
  .dg-act{display:flex;gap:8px;flex-wrap:wrap}
  .plx-liga{display:flex;align-items:center;gap:10px;margin:8px 0 10px;padding:10px 12px;border-radius:16px;background:color-mix(in srgb,var(--lc) 12%,var(--raise));border:1.5px solid color-mix(in srgb,var(--lc) 35%,transparent)}
  .lg-i{font-size:26px}.plx-liga b{display:block;color:var(--lc)}.plx-liga small{color:var(--stone);font-size:.78rem}
  .plx-endx{margin:14px 0;display:grid;gap:8px;text-align:left}
  .plx-endx>b{font-size:1rem}
  .ex-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .ex-c{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:2px;padding:12px;border-radius:16px;background:var(--raise);border:1.5px solid var(--line)}
  .ex-c:hover{border-color:#93c5fd}.ex-c span{font-size:24px}.ex-c b{font-size:.92rem}.ex-c small{color:var(--stone);font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  @media (max-width:420px){.ex-row{grid-template-columns:1fr}}
  .plx-hide{display:none!important}
  /* accesibilidad: foco visible y objetivos táctiles */
  html.mk :is(button,a,[role=button],select,input,textarea):focus-visible{outline:3px solid #60a5fa!important;outline-offset:2px!important}
  @media (prefers-contrast:more){html.mk{--stone:#374151}}
  `;
  var st=document.createElement("style"); st.id="plx31"; st.textContent=css; document.head.appendChild(st);
  if(typeof view!=="undefined"&&view==="parcours"){ try{ render(); }catch(e){} }
})();
