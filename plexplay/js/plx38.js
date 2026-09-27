/* PLEX PLAY 1.20 — Vocabulario por curso: lista por temas, tarjetas y «¿Qué significa?» */
(function(){
  "use strict";
  if(typeof GV==="undefined") return;
  var VER="651a2c37";
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var LOAD=null;
  function load(){
    if(window.__VOCAB) return Promise.resolve();
    return LOAD||(LOAD=new Promise(function(res,rej){ var s=document.createElement("script"); s.src="vocab.js?v="+VER; s.async=true; s.onload=function(){ res(); }; s.onerror=function(){ LOAD=null; rej(new Error("vocab")); }; document.head.appendChild(s); }));
  }
  var ORDER=["a1","a2","fon","b11","b12","b21","rem","prog","c12","lit"];
  var COL={a1:"#16a34a",a2:"#0891b2",fon:"#7c3aed",b11:"#2563eb",b12:"#1d4ed8",b21:"#db2777",rem:"#ea580c",prog:"#0f766e",c12:"#b45309",lit:"#9333ea"};
  function label(id){ try{ var t=TRACKS.find(function(x){ return x.id===id; }); return t?t.label:id; }catch(e){ return id; } }
  function K(){ if(!S.vk||typeof S.vk!=="object") S.vk={}; return S.vk; }
  function lvl(tr,fr){ return K()[tr+":"+fr]||0; }
  function known(tr,it){ return lvl(tr,it.fr)>=2; }
  function themes(tr){ return ((window.__VOCAB||{})[tr]||{themes:[]}).themes; }
  function all(tr){ var o=[]; themes(tr).forEach(function(t,ti){ t.i.forEach(function(it){ o.push({it:it,ti:ti}); }); }); return o; }
  function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function play(t,slow){ try{ speak(t,slow?.6:1); }catch(e){} }
  function art(it){ return it.g==="m"?"masc.":it.g==="f"?"fem.":it.g==="mf"?"masc./fem.":""; }
  var SPK='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';

  var VS={tr:null,th:null,mode:null,list:[],i:0,show:false,ok:0,ans:null,from:"retos",xp:0};
  function curTrack(){
    if(VS.tr) return VS.tr;
    var t=(typeof track!=="undefined"&&ORDER.indexOf(track)>=0)?track:"a1"; VS.tr=t; return t;
  }

  /* --------------------------- vista principal --------------------------- */
  GV.vocab=function(){
    if(!window.__VOCAB){
      load().then(function(){ if(view==="vocab") render(); },function(){ if(view==="vocab"){ VS.err=1; render(); } });
      return '<section class="gview voc2"><button class="gback" data-view="'+VS.from+'">‹ Volver</button><div class="v2-load">'+(VS.err?"No se pudo cargar el vocabulario. Revisa tu conexión.":"Cargando el vocabulario…")+"</div></section>";
    }
    var tr=curTrack();
    if(VS.mode==="fc") return fcHTML(tr);
    if(VS.mode==="quiz") return quizHTML(tr);
    if(VS.th!=null) return themeHTML(tr,VS.th);
    var A=all(tr), k=A.filter(function(x){ return known(tr,x.it); }).length, pct=A.length?Math.round(k/A.length*100):0;
    return '<section class="gview voc2" style="--c:'+COL[tr]+'">'+'<button class="gback" data-view="'+VS.from+'">‹ Volver</button>'+
      '<div class="v2-hero"><div><small>Vocabulario por curso</small><h1>'+esc(label(tr))+'</h1><p>Las palabras clave de tu curso, por temas, con audio y un ejemplo. Aprende con tarjetas y comprueba con el reto «¿Qué significa?».</p>'+
      '<div class="v2-pb"><i style="width:'+pct+'%"></i></div><small class="v2-pbt">'+k+" de "+A.length+" palabras dominadas</small></div>"+
      '<div class="v2-ring" style="--p:'+pct+'"><b>'+pct+'%</b></div></div>'+
      '<div class="v2-tracks" role="tablist" aria-label="Curso">'+ORDER.filter(function(id){ return (window.__VOCAB||{})[id]; }).map(function(id){ return '<button role="tab" aria-selected="'+(id===tr)+'" class="v2-tr'+(id===tr?" on":"")+'" data-vtr="'+id+'" style="--c:'+COL[id]+'">'+esc(label(id))+"</button>"; }).join("")+"</div>"+
      '<div class="v2-act"><button class="gbtn" data-vgo="fc-all">🃏 Tarjetas del curso</button><button class="gbtn ghost" data-vgo="quiz-all">❓ ¿Qué significa?</button></div>'+
      '<h2 class="v2-h">Temas</h2><div class="v2-grid">'+themes(tr).map(function(t,ti){
        var n=t.i.filter(function(it){ return known(tr,it); }).length, p=Math.round(n/t.i.length*100);
        return '<div class="v2-card"><button class="v2-open" data-vth="'+ti+'"><span class="v2-num">'+(ti+1)+'</span><b>'+esc(t.t)+'</b><small>'+t.i.length+" palabras · "+n+' dominadas</small><span class="v2-bar"><i style="width:'+p+'%"></i></span><span class="v2-peek">'+t.i.slice(0,4).map(function(it){ return esc(it.fr); }).join(" · ")+" …</span></button>"+
          '<div class="v2-cb"><button class="gbtn sm" data-vgo="fc" data-ti="'+ti+'">🃏 Tarjetas</button><button class="gbtn ghost sm" data-vgo="quiz" data-ti="'+ti+'">❓ Reto</button></div></div>';
      }).join("")+"</div></section>";
  };

  function themeHTML(tr,ti){
    var t=themes(tr)[ti]; if(!t){ VS.th=null; return GV.vocab(); }
    var saved=(S.vocab&&typeof S.vocab==="object")?S.vocab:{};
    return '<section class="gview voc2" style="--c:'+COL[tr]+'"><button class="gback" data-vgo="home">‹ '+esc(label(tr))+"</button>"+
      '<div class="v2-th"><span class="v2-num big">'+(ti+1)+'</span><div><small>'+esc(label(tr))+'</small><h1>'+esc(t.t)+'</h1><p>'+t.i.length+' palabras. Toca 🔊 para escuchar la palabra o el ejemplo.</p></div></div>'+
      '<div class="v2-act"><button class="gbtn" data-vgo="fc" data-ti="'+ti+'">🃏 Estudiar con tarjetas</button><button class="gbtn ghost" data-vgo="quiz" data-ti="'+ti+'">❓ ¿Qué significa?</button></div>'+
      '<ul class="v2-list">'+t.i.map(function(it){
        var l=lvl(tr,it.fr), has=!!saved[it.fr];
        return '<li><div class="v2-w"><button class="v2-spk" data-vplay="'+esc(it.fr)+'" aria-label="Escuchar '+esc(it.fr)+'">'+SPK+'</button><div><b>'+esc(it.fr)+"</b>"+(art(it)?' <em class="v2-g">'+art(it)+"</em>":"")+'<span>'+esc(it.es)+'</span></div><i class="v2-lv lv'+l+'" title="'+(l>=2?"Dominada":l?"En camino":"Nueva")+'">'+(l>=2?"✓":l?"◐":"")+"</i></div>"+
          '<div class="v2-ex"><button class="v2-spk sm" data-vplay="'+esc(it.ex)+'" aria-label="Escuchar el ejemplo">'+SPK+'</button><div><span lang="fr">'+esc(it.ex)+"</span><small>"+esc(it.exes)+"</small></div>"+
          '<button class="v2-save" data-vsv="'+esc(it.fr)+'" data-es="'+esc(it.es)+'" '+(has?"disabled":"")+'>'+(has?"✓ En Mis palabras":"＋ Mis palabras")+"</button></div></li>";
      }).join("")+"</ul>"+
      '<div class="v2-nav">'+(ti>0?'<button class="gbtn ghost" data-vth="'+(ti-1)+'">‹ '+esc(themes(tr)[ti-1].t)+"</button>":"<span></span>")+(ti<themes(tr).length-1?'<button class="gbtn ghost" data-vth="'+(ti+1)+'">'+esc(themes(tr)[ti+1].t)+" ›</button>":"")+"</div></section>";
  }

  /* --------------------------- tarjetas --------------------------- */
  function pool(tr,ti,n){
    var src=ti==null?all(tr).map(function(x){ return x.it; }):themes(tr)[ti].i.slice();
    src=shuffle(src).sort(function(a,b){ return lvl(tr,a.fr)-lvl(tr,b.fr); });
    return src.slice(0,n);
  }
  function startFc(tr,ti){ VS.mode="fc"; VS.ti=ti; VS.list=pool(tr,ti,ti==null?12:10); VS.i=0; VS.show=false; VS.ok=0; VS.again=[]; VS.xp=0; render(); scrollTo(0,0); setTimeout(function(){ var c=VS.list[0]; c&&play(c.fr); },350); }
  function fcHTML(tr){
    var back='<button class="gback" data-vgo="'+(VS.ti!=null?"theme":"home")+'">‹ '+(VS.ti!=null?esc(themes(tr)[VS.ti].t):esc(label(tr)))+"</button>";
    if(VS.i>=VS.list.length) return endHTML(tr,back,"Tarjetas terminadas","Te sabías "+VS.ok+" de "+VS.list.length+" a la primera.");
    var it=VS.list[VS.i];
    return '<section class="gview voc2" style="--c:'+COL[tr]+'">'+back+
      '<div class="v2-prog"><i style="width:'+(VS.i/VS.list.length*100)+'%"></i></div><p class="v2-n">'+(VS.i+1)+" / "+VS.list.length+"</p>"+
      '<div class="v2-fc'+(VS.show?" flip":"")+'"><div class="v2-in">'+
        '<div class="v2-front" '+(VS.show?'aria-hidden="true"':"")+'><small>¿Qué significa?</small><b lang="fr">'+esc(it.fr)+"</b>"+(art(it)?'<em class="v2-g">'+art(it)+"</em>":"")+'<button class="v2-spk big" data-vplay="'+esc(it.fr)+'" aria-label="Escuchar">'+SPK+"</button></div>"+
        '<div class="v2-back" '+(VS.show?"":'aria-hidden="true"')+'><small lang="fr">'+esc(it.fr)+"</small><b>"+esc(it.es)+'</b><p><button class="v2-spk sm" data-vplay="'+esc(it.ex)+'" aria-label="Escuchar el ejemplo">'+SPK+'</button><span lang="fr">'+esc(it.ex)+"</span></p><small>"+esc(it.exes)+"</small></div>"+
      "</div></div>"+
      (VS.show?'<div class="v2-btns"><button class="gbtn ghost" data-vgo="no">😕 Otra vez</button><button class="gbtn" data-vgo="yes">😎 Me la sé</button></div>'
              :'<div class="v2-btns"><button class="gbtn wide" data-vgo="flip">Ver el significado</button></div>')+
      '<p class="v2-tip">Piensa la respuesta antes de voltear la tarjeta. Las que marques «Otra vez» vuelven al final.</p></section>';
  }

  /* --------------------------- ¿qué significa? --------------------------- */
  function startQuiz(tr,ti){
    var list=pool(tr,ti,8), everything=all(tr).map(function(x){ return x.it; });
    VS.mode="quiz"; VS.ti=ti; VS.i=0; VS.ok=0; VS.ans=null; VS.xp=0;
    VS.list=list.map(function(it){
      var wrong=shuffle(everything.filter(function(o){ return o.es!==it.es; })).slice(0,3).map(function(o){ return o.es; });
      return {it:it,opts:shuffle(wrong.concat([it.es]))};
    });
    render(); scrollTo(0,0); setTimeout(function(){ var q=VS.list[0]; q&&play(q.it.fr); },350);
  }
  function quizHTML(tr){
    var back='<button class="gback" data-vgo="'+(VS.ti!=null?"theme":"home")+'">‹ '+(VS.ti!=null?esc(themes(tr)[VS.ti].t):esc(label(tr)))+"</button>";
    if(VS.i>=VS.list.length) return endHTML(tr,back,VS.ok>=7?"¡Excelente!":VS.ok>=5?"¡Muy bien!":"¡Sigue practicando!","Acertaste "+VS.ok+" de "+VS.list.length+".");
    var q=VS.list[VS.i], a=VS.ans;
    return '<section class="gview voc2" style="--c:'+COL[tr]+'">'+back+
      '<div class="v2-prog"><i style="width:'+(VS.i/VS.list.length*100)+'%"></i></div><p class="v2-n">'+(VS.i+1)+" / "+VS.list.length+" · "+VS.ok+" aciertos</p>"+
      '<div class="v2-q"><small>¿Qué significa?</small><div class="v2-qw"><b lang="fr">'+esc(q.it.fr)+'</b><button class="v2-spk" data-vplay="'+esc(q.it.fr)+'" aria-label="Escuchar">'+SPK+"</button></div>"+
      '<div class="v2-opts">'+q.opts.map(function(o){ var c=a==null?"":o===q.it.es?" ok":o===a?" ko":""; return '<button class="v2-opt'+c+'" data-vans="'+esc(o)+'" '+(a!=null?"disabled":"")+">"+esc(o)+"</button>"; }).join("")+"</div>"+
      (a!=null?'<div class="v2-fb '+(a===q.it.es?"ok":"ko")+'"><b>'+(a===q.it.es?"¡Correcto!":"Era «"+esc(q.it.es)+"».")+'</b><p><button class="v2-spk sm" data-vplay="'+esc(q.it.ex)+'" aria-label="Escuchar el ejemplo">'+SPK+'</button><span lang="fr">'+esc(q.it.ex)+"</span></p><small>"+esc(q.it.exes)+'</small></div><button class="gbtn wide" data-vgo="qnext">Continuar</button>':"")+
      "</div></section>";
  }
  function endHTML(tr,back,title,msg){
    return '<section class="gview voc2" style="--c:'+COL[tr]+'">'+back+'<div class="v2-end"><img src="img/mz-feliz.webp" alt=""><h1>'+esc(title)+"</h1><p>"+esc(msg)+(VS.xp?" +"+VS.xp+" XP":"")+"</p>"+
      '<div class="set-row c"><button class="gbtn ghost" data-vgo="'+(VS.ti!=null?"theme":"home")+'">Volver</button><button class="gbtn" data-vgo="'+(VS.mode==="quiz"?"quiz":"fc")+'"'+(VS.ti!=null?' data-ti="'+VS.ti+'"':"")+'>Otra ronda</button></div></div></section>';
  }
  function finish(){
    VS.xp=4+VS.ok; try{ addXP(VS.xp); addAct("VOC"); save(!0); typeof gAfterProgress==="function"&&gAfterProgress(); }catch(e){}
  }

  /* --------------------------- eventos --------------------------- */
  function openV(tr,from){ VS.tr=tr||null; VS.th=null; VS.mode=null; VS.from=from||"retos"; go("vocab"); scrollTo(0,0); }
  window.plxVocab=openV;
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-vtr],[data-vth],[data-vgo],[data-vplay],[data-vans],[data-vsv],[data-am='vocab']"); if(!b) return;
    e.preventDefault(); e.stopPropagation();
    var d=b.dataset, tr=VS.tr||curTrack();
    if(d.am==="vocab"){ return openV(d.tr||null,view==="lecciones"?"lecciones":"retos"); }
    if(d.vplay){ play(d.vplay); return; }
    if(d.vtr){ VS.tr=d.vtr; VS.th=null; VS.mode=null; render(); return; }
    if(d.vth!=null){ VS.th=+d.vth; VS.mode=null; render(); scrollTo(0,0); return; }
    if(d.vsv){ S.vocab=(S.vocab&&typeof S.vocab==="object")?S.vocab:{}; if(!S.vocab[d.vsv]){ S.vocab[d.vsv]={es:d.es||"",at:Date.now(),b:0,d:0}; try{ save(!0); toast("Guardada en Mis palabras"); }catch(x){} } b.disabled=true; b.textContent="✓ En Mis palabras"; return; }
    if(d.vans){
      var q=VS.list[VS.i]; if(!q||VS.ans!=null) return;
      VS.ans=d.vans; var ok=d.vans===q.it.es, key=tr+":"+q.it.fr;
      if(ok){ VS.ok++; K()[key]=Math.min(3,(K()[key]||0)+1); try{ SFX.ok&&SFX.ok(); }catch(x){} } else { K()[key]=0; try{ SFX.ko&&SFX.ko(); }catch(x){} }
      render(); return;
    }
    var a=d.vgo, ti=d.ti!=null?+d.ti:(a==="fc-all"||a==="quiz-all"?null:VS.ti);
    if(a==="home"){ VS.th=null; VS.mode=null; render(); scrollTo(0,0); return; }
    if(a==="theme"){ VS.mode=null; VS.th=VS.ti; render(); scrollTo(0,0); return; }
    if(a==="fc"||a==="fc-all") return startFc(tr,ti);
    if(a==="quiz"||a==="quiz-all") return startQuiz(tr,ti);
    if(a==="flip"){ if(!VS.list[VS.i]) return; VS.show=true; render(); return; }
    if(a==="yes"||a==="no"){
      var it=VS.list[VS.i]; if(!it) return; var k2=tr+":"+it.fr;
      if(a==="yes"){ if(VS.again.indexOf(it)<0) VS.ok++; K()[k2]=Math.min(3,(K()[k2]||0)+1); }
      else { K()[k2]=Math.max(0,(K()[k2]||0)-1); if(VS.again.indexOf(it)<0){ VS.again.push(it); VS.list.push(it); } }
      VS.i++; VS.show=false;
      if(VS.i>=VS.list.length) finish(); else setTimeout(function(){ play(VS.list[VS.i].fr); },250);
      render(); return;
    }
    if(a==="qnext"){ VS.i++; VS.ans=null; if(VS.i>=VS.list.length) finish(); else setTimeout(function(){ play(VS.list[VS.i].it.fr); },250); render(); return; }
  },true);

  /* --------------------------- accesos --------------------------- */
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{
      if(view==="retos"){
        var f=document.querySelector("#view .am-feat");
        if(f&&!f.querySelector(".amf.vc2")) f.insertAdjacentHTML("afterbegin",'<button class="amf vc2" data-am="vocab"><span class="amf-i">📚</span><b>Vocabulario por curso</b><small>480 palabras con audio · 10 cursos</small></button>');
      }
      if(view==="lecciones"&&typeof track!=="undefined"&&ORDER.indexOf(track)>=0){
        var bar=document.querySelector("#view .lx-bar");
        if(bar&&!document.querySelector("#view .v2-banner")) bar.insertAdjacentHTML("beforebegin",'<button class="v2-banner" data-am="vocab" data-tr="'+track+'"><span class="vb-i">📚</span><span class="vb-t"><b>Vocabulario de '+esc(label(track))+'</b><small>Palabras clave por temas, con audio y tarjetas</small></span><span class="vb-go">›</span></button>');
      }
      if(view==="vocab"){ document.querySelectorAll('#tabbar [data-view="retos"],.nav [data-view="retos"]').forEach(function(x){ x.setAttribute("aria-current","page"); }); }
    }catch(e){}
    return r;
  };
  /* precarga si el usuario ya abrió el vocabulario alguna vez */
  try{ if(S.vk&&Object.keys(S.vk).length) addEventListener("load",function(){ setTimeout(function(){ load().catch(function(){}); },4000); }); }catch(e){}

  var css=`
  .voc2{--c:#2563eb}
  .v2-load{padding:40px 10px;text-align:center;color:var(--stone);font-weight:700}
  .v2-hero{display:flex;align-items:center;gap:18px;padding:22px 24px;border-radius:26px;color:#fff;margin:6px 0 14px;background:linear-gradient(125deg,color-mix(in srgb,var(--c) 85%,#0f172a),var(--c) 55%,color-mix(in srgb,var(--c) 55%,#facc15));box-shadow:0 22px 40px -28px var(--c)}
  .v2-hero>div:first-child{flex:1;min-width:0}.v2-hero small{font-weight:800;opacity:.9;letter-spacing:.05em;text-transform:uppercase;font-size:.74rem}
  .v2-hero h1{color:#fff!important;margin:4px 0 6px;font-size:1.8rem}.v2-hero p{margin:0 0 12px;opacity:.95;line-height:1.45;max-width:640px}
  .v2-pb{height:10px;border-radius:99px;background:rgba(255,255,255,.25);overflow:hidden;max-width:360px}.v2-pb i{display:block;height:100%;background:#fff;border-radius:99px}
  .v2-pbt{display:block;margin-top:6px;text-transform:none!important;letter-spacing:0!important}
  .v2-ring{flex:none;width:96px;height:96px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#fff calc(var(--p)*1%),rgba(255,255,255,.22) 0)}
  .v2-ring b{width:74px;height:74px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 80%,#0f172a);font-size:1.25rem}
  .v2-tracks{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;margin:0 0 6px;scrollbar-width:thin}
  .v2-tr{all:unset;box-sizing:border-box;cursor:pointer;flex:none;padding:8px 14px;border-radius:99px;background:var(--raise);border:1.5px solid var(--line);font-weight:700;font-size:.88rem;white-space:nowrap}
  .v2-tr.on{background:var(--c);border-color:var(--c);color:#fff}
  .v2-tr:focus-visible,.v2-open:focus-visible,.v2-opt:focus-visible,.v2-spk:focus-visible,.v2-banner:focus-visible{outline:3px solid var(--c,#2563eb);outline-offset:2px}
  .v2-act{display:flex;gap:10px;flex-wrap:wrap;margin:8px 0 4px}.v2-act .gbtn{width:auto;flex:1 1 200px}
  .v2-h{font-size:1.1rem;margin:18px 0 10px}
  .v2-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
  .v2-card{display:flex;flex-direction:column;border-radius:22px;background:var(--raise);border:1.5px solid var(--line);box-shadow:0 12px 24px -20px rgba(30,58,138,.55);overflow:hidden;transition:transform .15s,box-shadow .15s}
  .v2-card:hover{transform:translateY(-2px);box-shadow:0 18px 30px -20px rgba(30,58,138,.65)}
  .v2-open{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:4px;padding:16px 16px 10px;flex:1}
  .v2-open b{font-size:1.05rem;line-height:1.25}.v2-open small{color:var(--stone)}
  .v2-num{width:34px;height:34px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 14%,transparent);color:var(--c);font-weight:900;margin-bottom:4px}
  .v2-num.big{width:64px;height:64px;border-radius:20px;font-size:1.6rem;background:var(--c);color:#fff;flex:none}
  .v2-bar{display:block;height:7px;border-radius:99px;background:var(--surf3);overflow:hidden;margin:6px 0 2px}.v2-bar i{display:block;height:100%;background:var(--c)}
  .v2-peek{color:var(--stone);font-size:.82rem;font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .v2-cb{display:flex;gap:8px;padding:0 14px 14px}.v2-cb .gbtn{flex:1;width:auto}
  .v2-th{display:flex;align-items:center;gap:16px;margin:6px 0 8px}.v2-th h1{margin:2px 0 4px}.v2-th p{margin:0;color:var(--stone)}.v2-th small{font-weight:800;color:var(--c)}
  .v2-list{list-style:none;padding:0;margin:14px 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px}
  .v2-list li{padding:12px 14px;border-radius:18px;background:var(--raise);border:1.5px solid var(--line);display:grid;gap:8px}
  .v2-w{display:flex;align-items:center;gap:10px}.v2-w>div{flex:1;display:grid}.v2-w b{font-size:1.12rem}.v2-w span{color:var(--stone)}
  .v2-g{font-style:normal;font-size:.72rem;font-weight:800;color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent);padding:1px 7px;border-radius:99px;margin-left:4px;vertical-align:2px}
  .v2-ex{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:14px;background:var(--surf2);flex-wrap:wrap}.v2-ex>div{flex:1;min-width:180px;display:grid}.v2-ex small{color:var(--stone)}
  .v2-spk{all:unset;box-sizing:border-box;cursor:pointer;flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--c);color:#fff}
  .v2-spk.sm{width:30px;height:30px;background:color-mix(in srgb,var(--c) 16%,transparent);color:var(--c)}
  .v2-spk.big{width:64px;height:64px;margin-top:8px}.v2-spk.big svg{width:28px;height:28px}
  .v2-lv{font-style:normal;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:.85rem;font-weight:900;border:2px solid var(--line);color:var(--stone)}
  .v2-lv.lv2,.v2-lv.lv3{background:#16a34a;border-color:#16a34a;color:#fff}.v2-lv.lv1{border-color:#f59e0b;color:#f59e0b}
  .v2-save{all:unset;cursor:pointer;font-size:.78rem;font-weight:800;color:var(--c);padding:4px 8px;border-radius:99px;border:1.5px solid color-mix(in srgb,var(--c) 40%,transparent);align-self:center}
  .v2-save[disabled]{opacity:.6;cursor:default}
  .v2-nav{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:18px 0}.v2-nav .gbtn{width:auto}
  .v2-prog{height:10px;border-radius:99px;background:var(--surf3);overflow:hidden;margin:8px auto 4px;max-width:560px}.v2-prog i{display:block;height:100%;background:var(--c);transition:width .3s}
  .v2-n{text-align:center;color:var(--stone);font-weight:700;margin:0 0 10px}
  .v2-fc{max-width:560px;margin:0 auto;perspective:1200px}
  .v2-in{position:relative;min-height:300px;transition:transform .45s;transform-style:preserve-3d}
  .v2-fc.flip .v2-in{transform:rotateY(180deg)}
  .v2-front,.v2-back{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:6px;text-align:center;padding:24px;border-radius:28px;backface-visibility:hidden;-webkit-backface-visibility:hidden;border:1.5px solid var(--line);box-shadow:0 24px 40px -30px rgba(15,23,42,.6)}
  .v2-front{background:var(--raise)}.v2-front b{font-size:2.4rem;line-height:1.1}.v2-front>small,.v2-back>small:first-child{font-weight:800;color:var(--stone);text-transform:uppercase;letter-spacing:.05em;font-size:.75rem}
  .v2-back{transform:rotateY(180deg);background:linear-gradient(160deg,color-mix(in srgb,var(--c) 10%,var(--raise)),var(--raise))}
  .v2-back b{font-size:clamp(1.3rem,4.6vw,1.8rem);line-height:1.15;color:var(--c)}.v2-back p{display:flex;align-items:center;gap:8px;margin:10px 0 0;font-size:1.05rem}.v2-back>small:last-child{color:var(--stone)}
  .v2-btns{display:flex;justify-content:center;gap:10px;margin:16px auto;max-width:560px}.v2-btns .gbtn{flex:1}
  .v2-tip{text-align:center;color:var(--stone);font-size:.85rem;max-width:560px;margin:0 auto}
  .v2-q{display:grid;justify-items:center;gap:10px;text-align:center;padding:22px 18px;border-radius:24px;background:var(--raise);border:1.5px solid var(--line);max-width:600px;margin:0 auto}
  .v2-q>small{font-weight:800;color:var(--stone)}
  .v2-qw{display:flex;align-items:center;gap:12px}.v2-qw b{font-size:2.1rem}
  .v2-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;margin-top:6px}
  .v2-opt{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;padding:14px 10px;border-radius:16px;border:2px solid var(--line);background:var(--surf2);font-weight:700;line-height:1.3}
  .v2-opt:hover:not([disabled]){border-color:var(--c)}
  .v2-opt.ok{border-color:#16a34a;background:#dcfce7;color:#14532d}.v2-opt.ko{border-color:#dc2626;background:#fee2e2;color:#7f1d1d}
  html[data-theme=dark] .v2-opt.ok{background:#12331e;color:#86efac}html[data-theme=dark] .v2-opt.ko{background:#3a161c;color:#fca5a5}
  .v2-fb{width:100%;text-align:left;padding:12px 14px;border-radius:16px;background:var(--surf3)}.v2-fb p{display:flex;align-items:center;gap:8px;margin:6px 0 2px}.v2-fb small{color:var(--stone)}
  .v2-fb.ok b{color:#16a34a}.v2-fb.ko b{color:#dc2626}
  .v2-end{display:grid;justify-items:center;text-align:center;gap:6px;padding:28px 18px;border-radius:24px;background:var(--raise);border:1.5px solid var(--line);max-width:560px;margin:12px auto}
  .v2-end img{width:120px;height:120px;object-fit:cover;border-radius:50%}
  .v2-banner{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:14px;width:100%;margin:10px 0 4px;padding:14px 16px;border-radius:20px;background:linear-gradient(120deg,#ecfdf5,#eff6ff);border:1.5px solid #a7f3d0;color:#1e293b}
  .v2-banner .vb-i{flex:none;width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:#0f766e;font-size:1.3rem}
  .v2-banner .vb-t{flex:1;display:grid}.v2-banner small{color:#475569}.v2-banner .vb-go{font-size:1.6rem;color:#0f766e;font-weight:800}
  html[data-theme=dark] .v2-banner{background:linear-gradient(120deg,#0f2a24,#172342);border-color:#1f5147;color:#e2e8f0}html[data-theme=dark] .v2-banner small{color:#a7f3d0}html[data-theme=dark] .v2-banner .vb-go{color:#6ee7b7}
  .amf.vc2{background:linear-gradient(135deg,#0f766e,#16a34a 60%,#facc15)}
  @media (max-width:640px){.v2-hero{padding:18px}.v2-hero h1{font-size:1.45rem}.v2-ring{width:74px;height:74px}.v2-ring b{width:56px;height:56px;font-size:1rem}.v2-opts{grid-template-columns:1fr}.v2-list{grid-template-columns:1fr}.v2-front b{font-size:2rem}}
  `;
  var st=document.createElement("style"); st.id="plx38"; st.textContent=css; document.head.appendChild(st);
})();
