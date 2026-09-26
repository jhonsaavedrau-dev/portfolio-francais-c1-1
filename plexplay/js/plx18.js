
/* PLEX PLAY 1.8 — ordenar con toques, pantalla estable, explicaciones visuales, lecturas en la práctica, cerrar sesión */
(function(){
  "use strict";
  var q=function(s,r){return (r||document).querySelector(s)};
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var LOGGED=function(){try{return !!(CLOUD&&window.PCB&&PCB.uid)}catch(e){return false}};
  var EXAM_MODES={chrono:1,blanc:1,placement:1};

  /* ---------- estilos ---------- */
  var css=`
  html:not(.plx-teach) .t-switch,html:not(.plx-teach) .sc-box,html:not(.plx-teach) .sc-invite,html:not(.plx-teach) .sc-home,html:not(.plx-teach) [aria-label="Tipo de cuenta"],html:not(.plx-teach) .t-back{display:none!important}
  .ord{margin:4px 0 8px}
  .ord-line{min-height:118px;display:flex;flex-wrap:wrap;align-content:flex-start;gap:8px;padding:10px 2px 14px;margin:0 0 18px;background:repeating-linear-gradient(to bottom,transparent 0 55px,var(--line) 55px 57px);border-bottom:2px solid var(--line)}
  .ord-ph{align-self:center;color:var(--faint);font-size:.95rem;padding:0 6px}
  .ord-bank{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:4px 0}
  .otok{font:inherit;font-weight:700;font-size:17px;line-height:1.2;padding:10px 14px;min-height:47px;border-radius:14px;border:2px solid var(--line);border-bottom-width:4px;background:var(--raise);color:var(--ink);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:transform .12s ease}
  .otok:active{transform:translateY(2px);border-bottom-width:2px}
  .ord-line .otok{animation:plxPop .18s ease both}
  .ord-bank>.otok,.ord-line>.otok{flex:0 0 auto;width:auto!important;display:inline-flex;align-items:center;margin:0}
  .otok.ghost{background:var(--surf3);border-color:var(--surf3);color:transparent;box-shadow:none;cursor:default;pointer-events:none}
  .otok.ok{border-color:#58cc02;background:#d7ffb8;color:#2b6a00}
  .otok.ko{border-color:#ff4b4b;background:#ffdfe0;color:#a8000c}
  .otok[disabled]{cursor:default}
  .ord-hint{font-size:.85rem;color:var(--stone);text-align:center;margin:14px 0 0}
  @keyframes plxPop{from{transform:scale(.85);opacity:.4}to{transform:none;opacity:1}}
  .plx-tools{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin:0 0 8px}
  .plx-tbtn{font:inherit;font-size:.82rem;font-weight:700;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;border:1.5px solid var(--line);background:var(--raise);color:var(--m-navy,#1e3a8a);cursor:pointer}
  .plx-read{margin:0 0 14px;border:1.5px solid #f5d38a;background:#fffaf0;border-radius:16px;overflow:hidden}
  .plx-read>summary{list-style:none;cursor:pointer;padding:11px 14px;font-weight:800;display:flex;align-items:center;gap:8px;color:#8a5a00}
  .plx-read>summary::-webkit-details-marker{display:none}
  .plx-read>summary::after{content:"Mostrar";margin-left:auto;font-size:.78rem;font-weight:700;opacity:.8}
  .plx-read[open]>summary::after{content:"Ocultar"}
  .plx-read-b{padding:0 14px 12px;max-height:46vh;overflow:auto;font-size:.95rem;line-height:1.55;color:var(--ink)}
  .plx-read-b p{margin:0 0 10px}
  [data-theme=dark] .plx-read{background:#2b2210;border-color:#6b5317}
  [data-theme=dark] .plx-read>summary{color:#fbc55a}
  /* explicación visual */
  .plx-ess{border-radius:18px;padding:14px 16px;margin:0 0 12px;background:#e9f9ee;border:2px solid #b7e8c4}
  .plx-ess h4{margin:0 0 8px;font-size:1rem;display:flex;gap:8px;align-items:center;color:#14532d}
  .plx-ess ul{margin:0;padding:0;list-style:none;display:grid;gap:7px}
  .plx-ess li{position:relative;padding-left:26px;line-height:1.45}
  .plx-ess li::before{content:"✓";position:absolute;left:0;top:0;width:19px;height:19px;border-radius:50%;background:#58cc02;color:#fff;font-size:12px;font-weight:900;display:grid;place-items:center;margin-top:2px}
  .plx-prac{border-radius:18px;padding:14px 16px;margin:0 0 16px;background:#eef3ff;border:2px solid #cfdcff}
  .plx-prac h4{margin:0 0 4px;font-size:1rem;color:#1e3a8a}
  .plx-prac p{margin:0 0 10px;font-size:.9rem;color:var(--stone)}
  .plx-kinds{display:flex;flex-wrap:wrap;gap:8px}
  .plx-kind{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:12px;background:var(--raise);border:1.5px solid #cfdcff;font-size:.86rem;font-weight:700}
  .plx-kind b{font-size:.78rem;background:#1e3a8a;color:#fff;border-radius:999px;padding:1px 7px}
  .plx-foc{margin-top:10px;font-size:.88rem}
  .plx-foc span{display:inline-block;margin:3px 4px 0 0;padding:3px 9px;border-radius:999px;background:#fff1c9;color:#7a4b00;font-weight:700;font-size:.8rem}
  [data-theme=dark] .plx-ess{background:#12280f;border-color:#1f5a1a} [data-theme=dark] .plx-ess h4{color:#8ee07e}
  [data-theme=dark] .plx-prac{background:#141c36;border-color:#26335e} [data-theme=dark] .plx-prac h4{color:#b4c6ff}
  [data-theme=dark] .plx-kind{border-color:#26335e} [data-theme=dark] .plx-foc span{background:#3a2c08;color:#fbc55a}
  .tsec{border:1.5px solid var(--line);border-radius:18px;background:var(--raise);margin:0 0 12px;overflow:hidden}
  .tsec-h{all:unset;box-sizing:border-box;width:100%;display:flex;align-items:center;gap:10px;padding:13px 15px;cursor:pointer;font-weight:800;font-size:1rem;color:var(--ink)}
  .tsec-h .ti{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-size:17px;flex:none;background:var(--surf3)}
  .tsec-h .tc{margin-left:auto;transition:transform .2s ease;opacity:.6}
  .tsec.closed .tsec-h .tc{transform:rotate(-90deg)}
  .tsec-b{padding:0 16px 14px}
  .tsec.closed .tsec-b{max-height:0;padding-bottom:0;overflow:hidden}
  .tsec.k-purpose .ti{background:#e0f2fe} .tsec.k-rule .ti{background:#ede9fe} .tsec.k-warn{border-color:#fecaca} .tsec.k-warn .ti{background:#fee2e2} .tsec.k-ex .ti{background:#dcfce7} .tsec.k-method .ti{background:#fef3c7}
  [data-theme=dark] .tsec.k-purpose .ti,[data-theme=dark] .tsec.k-rule .ti,[data-theme=dark] .tsec.k-warn .ti,[data-theme=dark] .tsec.k-ex .ti,[data-theme=dark] .tsec.k-method .ti{background:var(--surf3)}
  .tsec-b .tw{overflow-x:auto}
  .m-theo .gm-card{width:min(680px,100%);text-align:left;justify-items:stretch}
  .m-theo .gm-t{text-align:left}
  .plx-theo{max-height:62vh;overflow:auto;padding-right:2px}
  .plx-theo .theory{font-size:.97rem}
  .theory[data-plx]{background:none!important;border:0!important;box-shadow:none!important;padding:0!important}
  .plx-out-row{display:flex;justify-content:center;margin:18px 0 8px}
  .qs-out{margin-top:6px}
  `;
  var st=document.createElement("style"); st.id="plx18"; st.textContent=css; document.head.appendChild(st);
  try{ if(window.PLX_TEACH) document.documentElement.classList.add("plx-teach"); localStorage.getItem("plx-role")==="teacher"&&!window.PLX_TEACH&&localStorage.setItem("plx-role","student"); }catch(e){}

  /* ---------- lecturas dentro de la práctica ---------- */
  var READ={};
  function readingOf(l){
    if(!l||!l.theory) return "";
    if(READ[l.id]!=null) return READ[l.id];
    var box=document.createElement("div"); box.innerHTML=l.theory;
    var cs=[].slice.call(box.querySelectorAll("p.consigne")).filter(function(p){return p.textContent.trim().length>150});
    return READ[l.id]=cs.map(function(p){return "<p>"+p.innerHTML+"</p>"}).join("");
  }
  var READ_OPEN={"p-resume":1,"p-synth":1};

  /* ---------- explicación visual ---------- */
  var KIND={choice:["Elegir la opción correcta","🔘"],fill:["Escribir la palabra que falta","✏️"],match:["Unir parejas","🔗"],sort:["Clasificar en grupos","🗂️"],spot:["Encontrar el error","🔍"],order:["Ordenar la frase","🧩"],listen:["Escuchar y escribir","🎧"],accent:["Poner los acentos","´"],self:["Autoevaluarte","🙋"]};
  function secKind(t){
    t=t.toLowerCase();
    if(/à retenir|para recordar/.test(t)) return "keep";
    if(/para qué sirve|pourquoi c'est|la situation|ce que vous allez faire/.test(t)) return "purpose";
    if(/ojo|erreur|error|attention|pièges|piège/.test(t)) return "warn";
    if(/exemple|ejemplo/.test(t)) return "ex";
    if(/méthode|método|étape|paso/.test(t)) return "method";
    return "rule";
  }
  var ICON={purpose:"🎯",rule:"📐",warn:"⚠️",ex:"💬",method:"🧭",keep:"✅"};
  var NAME={purpose:"Para qué sirve",warn:"Errores frecuentes",ex:"Ejemplos",method:"Paso a paso"};
  function isHead(n){
    if(n.nodeType!==1||n.tagName!=="P") return false;
    var b=n.firstElementChild; if(!b||n.children.length!==1||b.tagName!=="B") return false;
    var t=n.textContent.trim(); return t===b.textContent.trim()&&t.length>1&&t.length<80;
  }
  function essentialHTML(list){
    return list?'<div class="plx-ess"><h4>✅ Lo esencial</h4>'+list.outerHTML.replace(/^<(ul|ol)[^>]*>/,"<ul>").replace(/<\/(ul|ol)>$/,"</ul>")+"</div>":"";
  }
  function practiceHTML(steps){
    var cnt={},foc={},order=[];
    steps.forEach(function(s){ if(s.kind!=="item") return; var it=getItem(s.key); if(!it) return;
      if(!cnt[it.k]){cnt[it.k]=0;order.push(it.k)} cnt[it.k]++;
      var ty=it.t&&typeof TYPES!=="undefined"&&TYPES[it.t]; if(ty&&ty.l) foc[ty.l]=1; });
    if(!order.length) return "";
    var f=Object.keys(foc).slice(0,5);
    return '<div class="plx-prac"><h4>🎮 Qué vas a practicar</h4><p>Después de leer, harás estos ejercicios. Si dudas en alguno, toca «Ver explicación» y vuelves aquí.</p><div class="plx-kinds">'+
      order.map(function(k){var d=KIND[k]||[k,"•"];return '<span class="plx-kind">'+d[1]+" "+d[0]+" <b>×"+cnt[k]+"</b></span>"}).join("")+"</div>"+
      (f.length?'<div class="plx-foc">Se evalúa: '+f.map(function(x){return "<span>"+esc(x)+"</span>"}).join("")+"</div>":"")+"</div>";
  }
  function restructure(th,opt){
    if(!th||th.dataset.plx) return; th.dataset.plx="1";
    var nodes=[].slice.call(th.childNodes), secs=[], cur={title:null,nodes:[]};
    nodes.forEach(function(n){ if(isHead(n)){ secs.push(cur); cur={title:n.textContent.trim().replace(/[.:]\s*$/,""),nodes:[]}; } else cur.nodes.push(n); });
    secs.push(cur);
    var keep=null, out=document.createDocumentFragment(), heads=secs.filter(function(x){return x.title}).length;
    secs.forEach(function(s){ if(s.title&&secKind(s.title)==="keep"&&!keep){ keep=s.nodes.filter(function(n){return n.nodeType===1&&/^(UL|OL)$/.test(n.tagName)})[0]||null; if(keep) s.used=1; } });
    th.innerHTML="";
    var top=document.createElement("div"); top.innerHTML=essentialHTML(keep)+(opt&&opt.steps?practiceHTML(opt.steps):""); while(top.firstChild) out.appendChild(top.firstChild);
    secs.forEach(function(s,i){
      var real=s.nodes.filter(function(n){return !(n.nodeType===3&&!n.textContent.trim())});
      if(!real.length) return;
      if(!s.title||heads<2){ var d=document.createElement("div"); d.className="tsec-plain"; real.forEach(function(n){d.appendChild(n)}); out.appendChild(d); return; }
      var k=secKind(s.title); if(k==="keep"&&s.used){ var rest=real.filter(function(n){return n!==keep}); if(!rest.length) return; real=rest; }
      var closed=(k==="ex"||k==="method")&&!(opt&&opt.openAll);
      var sec=document.createElement("section"); sec.className="tsec k-"+k+(closed?" closed":"");
      sec.innerHTML='<button type="button" class="tsec-h" aria-expanded="'+(!closed)+'"><span class="ti" aria-hidden="true">'+(ICON[k]||"📘")+"</span><span>"+esc(s.title)+'</span><span class="tc" aria-hidden="true">▾</span></button><div class="tsec-b"></div>';
      var b=sec.querySelector(".tsec-b"); real.forEach(function(n){b.appendChild(n)}); out.appendChild(sec);
    });
    th.appendChild(out);
  }
  document.addEventListener("click",function(e){
    var h=e.target.closest&&e.target.closest(".tsec-h"); if(!h) return;
    var s=h.parentNode, c=s.classList.toggle("closed"); h.setAttribute("aria-expanded",String(!c));
  });

  /* ---------- modal «Ver explicación» ---------- */
  function lessonOf(st){ if(!st||!st.key) return P&&P.lesson; var x=typeof ITEMS!=="undefined"&&ITEMS[st.key]; return x&&x.l||P&&P.lesson; }
  function openTheory(){
    var st0=P&&P.steps[P.i], l=lessonOf(st0); if(!l||!l.theory) return;
    var html='<small class="gm-k">Explicación</small><h2 class="gm-t">'+esc(l.title)+'</h2><div class="plx-theo"><div class="theory" id="plxTheo">'+l.theory+'</div></div><div class="set-row c"><button class="gbtn" data-g="close" data-autofocus>Volver al ejercicio</button></div>';
    gModal(html,"m-theo");
    setTimeout(function(){ restructure(q("#plxTheo"),{openAll:false}); },30);
  }

  /* ---------- ordenar palabras: tocar para armar la frase ---------- */
  var _ih=itemHTML;
  itemHTML=function(it,st){
    if(!it||it.k!=="order"||!P||!st||!st.v||!st.v.bank) return _ih.apply(this,arguments);
    if(!Array.isArray(P.ans)) P.ans=[];
    var html=_ih.apply(this,arguments), a=P.ans, fb=P.phase!=="answer";
    var line=a.length?a.map(function(ti,j){var cls=fb?(it.tokens[ti]===it.tokens[j]?"ok":"ko"):"";return '<button type="button" class="otok '+cls+'" data-unpick="'+j+'" '+(fb?"disabled":"")+' aria-label="Quitar «'+esc(it.tokens[ti])+'»">'+esc(it.tokens[ti])+"</button>"}).join("")
      :'<span class="ord-ph">'+(fb?"Sin respuesta":"Tu frase aparecerá aquí")+"</span>";
    var bank=fb?"":st.v.bank.map(function(ti){return a.indexOf(ti)>=0?'<span class="otok ghost" aria-hidden="true">'+esc(it.tokens[ti])+"</span>":'<button type="button" class="otok" data-pick="'+ti+'">'+esc(it.tokens[ti])+"</button>"}).join("");
    var ui='<div class="ord"><div class="ord-line" aria-label="Tu frase" aria-live="polite">'+line+"</div>"+(fb?"":'<div class="ord-bank" aria-label="Palabras disponibles">'+bank+'</div><p class="ord-hint">Toca las palabras en orden. Si te equivocas, toca la palabra en la frase y vuelve abajo.</p>')+"</div>";
    var okNow=fb&&P.res&&P.res[P.i]&&P.res[P.i].ok;
    html=html.replace(/<p class="dnd-hint">[\s\S]*?<\/p>/,"").replace(/<ol class="dnd"[\s\S]*?<\/ol>/,ui);
    return okNow?html.replace(/<p class="fixline">Orden esperado:[\s\S]*?<\/p>/,""):html;
  };
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-pick],[data-unpick]");
    if(!b||!P||P.phase!=="answer") return;
    e.preventDefault(); e.stopPropagation();
    var a=(Array.isArray(P.ans)?P.ans:[]).slice();
    if(b.dataset.pick!=null){ var ti=+b.dataset.pick; if(a.indexOf(ti)<0) a.push(ti); } else a.splice(+b.dataset.unpick,1);
    P.ans=a; try{ typeof SFX!=="undefined"&&SFX.tick&&SFX.tick(); }catch(x){}
    try{ navigator.vibrate&&navigator.vibrate(8); }catch(x){}
    renderStep();
  },true);
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-plx]"); if(!b) return;
    var a=b.dataset.plx;
    if(a==="theory"){ e.preventDefault(); openTheory(); }
    if(a==="logout"){ e.preventDefault(); var go2=function(){ gModal('<small class="gm-k">Cuenta</small><h2 class="gm-t">¿Cerrar sesión?</h2><p class="gm-sub">Tu progreso está guardado en tu cuenta. Al volver a entrar con tu correo y contraseña lo recuperas en cualquier dispositivo.</p><div class="set-row c"><button class="gbtn ghost" data-g="close" data-autofocus>Cancelar</button><button class="gbtn" data-acct="out-yes">Cerrar sesión</button></div>',"m-out"); };
      if(gOpen){ gCloseModal(); setTimeout(go2,320); } else go2(); }
  },true);

  /* ---------- renderStep: pantalla estable + extras ---------- */
  var lastI=null;
  var _rs=renderStep;
  renderStep=function(){
    var pb=q("#player .pbody"), same=!!(P&&pb&&P.i===lastI), keep=same?pb.scrollTop:null;
    var r=_rs.apply(this,arguments);
    lastI=P?P.i:null;
    if(!P) return r;
    var nb=q("#player .pbody");
    if(nb&&keep!=null){ nb.scrollTop=keep; P.scroll=keep; requestAnimationFrame(function(){ if(P&&P.i===lastI){ nb.scrollTop=keep; P.scroll=keep; } }); }
    try{ decorate(); }catch(e){ console.warn("plx18",e); }
    return r;
  };
  function decorate(){
    var s=P.steps[P.i]; if(!s) return;
    var w=q("#player .pbody .wrap"); if(!w) return;
    if(s.kind==="theory"){ restructure(q("#theory",w),{steps:P.steps}); return; }
    if(s.kind!=="item"||EXAM_MODES[P.mode]||P.phase==="end") return;
    var l=lessonOf(s); if(!l) return;
    if(!w.querySelector(".plx-tools")&&l.theory){
      w.insertAdjacentHTML("afterbegin",'<div class="plx-tools"><button type="button" class="plx-tbtn" data-plx="theory">📖 Ver explicación</button></div>');
    }
    var rd=readingOf(l);
    if(rd&&!w.querySelector(".plx-read")){
      var open=P.__rd!=null?P.__rd:!!READ_OPEN[l.id];
      var d=document.createElement("details"); d.className="plx-read"; if(open) d.open=true;
      d.innerHTML='<summary>📄 Texte de la leçon</summary><div class="plx-read-b">'+rd+"</div>";
      d.addEventListener("toggle",function(){ if(P) P.__rd=d.open; });
      var tools=w.querySelector(".plx-tools"); tools?tools.insertAdjacentElement("afterend",d):w.insertAdjacentElement("afterbegin",d);
    }
  }

  /* ---------- cerrar sesión visible ---------- */
  var _qo=qsOpen;
  qsOpen=function(){
    var r=_qo.apply(this,arguments);
    if(LOGGED()){ setTimeout(function(){ var c=q(".gmodal.m-qs .gm-card .set-row.c"); if(c&&!q(".qs-out")) c.insertAdjacentHTML("beforebegin",'<button type="button" class="gbtn ghost wide qs-out" data-plx="logout">Cerrar sesión</button>'); },0); }
    return r;
  };
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{
      if(view==="perfil"&&LOGGED()){ var g=q("#view .gperfil"); if(g&&!g.querySelector(".plx-out-row")) g.insertAdjacentHTML("beforeend",'<div class="plx-out-row"><button type="button" class="gbtn ghost" data-plx="logout">Cerrar sesión</button></div>'); }
    }catch(e){}
    return r;
  };
})();

