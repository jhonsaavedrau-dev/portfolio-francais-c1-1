
/* PLEX PLAY 1.9 — profesores, explicación sencilla, dictado claro, logo → Inicio */
(function(){
  "use strict";
  var q=function(s,r){return (r||document).querySelector(s)};
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};

  /* ================= PROFESORES ================= */
  var PROFS={
    antoine:{name:"Prof. Antoine",lang:"Investigación",tag:"INV",tone:"serio",color:"#dcfce7",ink:"#14532d",
      bio:"Profesor de investigación. Exigente y preciso: te enseña a argumentar, citar y revisar cada detalle.",
      exp:{serio:1,enojo:2,piensa:3,esceptico:4,desaprueba:5,molesto:6},ges:{explica:1,lee:2,duda:3,cafe:4,libro:5,piensa:6},
      ok:["Correct. Continuons.","Bien. C'est exactement ça.","Voilà. Rigoureux, comme il faut."],ko:["Non, non… Revisa la regla.","Mmm. Eso no es correcto.","Otra vez. Con atención."],mid:"Más o menos… puedes hacerlo mejor.",
      tip:["Lee la regla con calma. Los detalles importan.","Primero la regla, después los ejercicios.","Fíjate bien en los ejemplos."],hi:"Bonjour. Aquí se trabaja con rigor."},
    sofia:{name:"Prof. Sofia",lang:"Francés",tag:"FR",tone:"alegre",color:"#ffe4e6",ink:"#9f1239",
      bio:"Alegre y paciente. Explica con ejemplos de la vida diaria y celebra cada avance.",
      exp:{sonrie:1,guino:2,feliz:3,sorpresa:4,risa:5,asombro:6},ges:{explica:1,libro:2,idea:3,celebra:4,portatil:5,senala:6},
      ok:["Excellent ! ¡Lo lograste!","¡Muy bien! Sigue así.","Parfait ! Me encanta."],ko:["¡Casi! Mira la explicación.","No pasa nada, vuelve a intentarlo.","Ups, uno más y lo tienes."],mid:"¡Vas bien! Repasa lo que fallaste.",
      tip:["¡Vamos paso a paso, tú puedes!","Mira los ejemplos: ahí está el truco.","Lee en voz alta los ejemplos."],hi:"¡Hola! Aprender idiomas es un juego."},
    marcus:{name:"Prof. Marcus",lang:"Francés",tag:"FR",tone:"tranquilo",color:"#dbeafe",ink:"#1e3a8a",
      bio:"Tranquilo y elegante. Te ayuda a pensar antes de responder y a entender el porqué.",
      exp:{sonrie:1,neutral:2,piensa:3,feliz:4,risa:5,esceptico:6},ges:{presenta:1,senala:2,piensa:3,tablet:4,pulgar:5,idea:6},
      ok:["Très bien. Bien pensado.","Correcto. Buen razonamiento.","Exacto. Así se hace."],ko:["Tranquilo, piénsalo otra vez.","Casi. Revisa el contexto.","Mira de nuevo la regla, sin prisa."],mid:"Buen trabajo, pero se puede pulir.",
      tip:["Observa los ejemplos antes de empezar.","Pregúntate siempre: ¿por qué es así?","Piensa, luego responde."],hi:"Bienvenido. Vamos a entender, no a memorizar."},
    dante:{name:"Prof. Dante",lang:"Inglés",tag:"EN",tone:"rockero",color:"#ede9fe",ink:"#5b21b6",
      bio:"Rockero de corazón. Cree que los idiomas se aprenden con ritmo y un poco de actitud.",
      exp:{cool:1,sonrie:2,molesto:3,risa:4,rock:5,aburrido:6},ges:{hombros:1,brazos:2,cuernos:3,pulgar:4,piensa:5,libro:6},
      ok:["¡Eso es rock! Bien hecho.","¡Brutal! Siguiente.","Suena perfecto."],ko:["Mmm… desafinaste. Otra vez.","Esa nota no era. Revisa.","Nada grave, repite el riff."],mid:"No está mal… pero le falta ritmo.",
      tip:["Esto va a sonar increíble. ¡Dale!","Repite los ejemplos como una canción.","Ritmo y práctica: así se aprende."],hi:"¡Hey! Aquí los idiomas suenan fuerte."}
  };
  var PID=["antoine","sofia","marcus","dante"];
  var HAPPY={antoine:["g",1],sofia:["e",3],marcus:["g",5],dante:["g",4]};
  var SAD={antoine:["e",5],sofia:["e",6],marcus:["e",6],dante:["e",3]};
  var EXPL={antoine:["g",1],sofia:["g",1],marcus:["g",1],dante:["g",5]};
  function pImg(id,k,n,cls,alt){return '<img class="pf-img '+(cls||"")+'" src="img/prof/pf-'+id+"-"+k+n+'.webp" alt="'+esc(alt||"")+'" loading="lazy" decoding="async">'}
  function pFull(id,cls){return '<img class="pf-img '+(cls||"")+'" src="img/prof/pf-'+id+'-full.webp" alt="'+esc(PROFS[id].name)+'" loading="lazy" decoding="async">'}
  function profFor(key){ key=String(key||"x"); var s=0; for(var i=0;i<key.length;i++) s=(s+key.charCodeAt(i)*(i+1))%9973; return PID[s%4]; }
  var pick=function(a){return a[Math.floor(Math.random()*a.length)]};
  window.PROF={list:PROFS,ids:PID,img:pImg,full:pFull,forKey:profFor};

  var css=`
  .pf-img{display:block;object-fit:contain}
  .pf-home{padding:16px 14px 12px}
  .pf-home h3{margin:0 0 4px;font-size:1.05rem}
  .pf-home p{margin:0 0 10px;font-size:.86rem;color:var(--stone)}
  .pf-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .pf-card{all:unset;box-sizing:border-box;cursor:pointer;border-radius:16px;padding:8px 4px 8px;text-align:center;display:grid;justify-items:center;gap:2px;border:2px solid transparent;transition:transform .15s ease}
  .pf-card:active{transform:scale(.97)}
  .pf-card .pf-img{height:118px;width:auto}
  .pf-card b{font-size:.78rem;line-height:1.15}
  .pf-card small{font-size:.68rem;font-weight:800;letter-spacing:.04em;padding:1px 7px;border-radius:999px;background:rgba(255,255,255,.7)}
  .m-pf .gm-card{text-align:left;justify-items:stretch}
  .pf-modal{display:grid;grid-template-columns:110px 1fr;gap:12px;align-items:center}
  .pf-modal .pf-img{height:200px;width:auto;justify-self:center}
  .pf-exps{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-top:8px}
  .pf-exps .pf-img{width:100%;height:auto;border-radius:10px;background:var(--surf3)}
  .gtheory-cat.pf-th{display:flex;align-items:center;gap:10px}
  .gtheory-cat.pf-th>.pf-img{height:96px;width:auto;flex:none}
  .gtheory-cat.pf-th>svg.cat{display:none}
  .pf-say{background:#fff;border:2px solid var(--line);border-radius:16px 16px 16px 4px;padding:9px 12px;font-size:.92rem;line-height:1.4;color:var(--ink)}
  [data-theme=dark] .pf-say{background:var(--raise)}
  .pf-say b{display:block;font-size:.78rem;color:var(--m-navy,#1e3a8a)}
  .pf-fbp{display:flex;align-items:center;gap:10px;margin:0 0 8px}
  .pf-fbp .pf-img{height:56px;width:56px;border-radius:50%;object-fit:cover;object-position:50% 20%;background:#fff;border:2.5px solid #58cc02;flex:none}
  .pf-fbp.ko .pf-img{border-color:#ff4b4b}
  .pf-fbp span{font-size:.92rem;line-height:1.35}
  .pf-fbp b{display:block;font-size:.78rem;opacity:.8}
  .fb-cat.pf-fb .pf-img{height:52px;width:52px;border-radius:50%;object-fit:cover;object-position:top;background:#fff;border:2px solid currentColor;flex:none}
  .pf-end{display:flex;align-items:center;gap:12px;margin:14px 0 4px;padding:12px;border-radius:18px;border:2px solid var(--line);background:var(--raise)}
  .pf-end .pf-img{height:92px;width:auto;flex:none}
  .pf-end p{margin:0;font-size:.95rem}
  .pf-end b{display:block;font-size:.8rem;color:var(--stone)}
  .m-ill.pf-ill img{height:92px}
  /* explicación sencilla */
  .plx-simple{border-radius:20px;padding:14px 14px 12px;margin:0 0 14px;background:linear-gradient(180deg,#fff7ed,#fff);border:2px solid #fed7aa}
  [data-theme=dark] .plx-simple{background:#2a1a0d;border-color:#6b3d12}
  .ps-top{display:flex;gap:10px;align-items:flex-start}
  .ps-top .pf-img{height:84px;width:auto;flex:none;margin-top:-4px}
  .ps-top h4{margin:0 0 4px;font-size:1rem;color:#9a3412}
  [data-theme=dark] .ps-top h4{color:#fdba74}
  .ps-top p{margin:0;font-size:.98rem;line-height:1.5}
  .ps-steps{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px;counter-reset:ps}
  .ps-steps li{counter-increment:ps;display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:start;line-height:1.45;font-size:.95rem}
  .ps-steps li::before{content:counter(ps);width:26px;height:26px;border-radius:50%;background:#f97316;color:#fff;font-weight:900;font-size:.85rem;display:grid;place-items:center}
  .ps-ex{margin:12px 0 0;display:grid;gap:7px}
  .ps-ex div{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;background:var(--raise);border:1.5px solid var(--line);border-radius:14px;padding:7px 10px}
  .ps-ex button{all:unset;cursor:pointer;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#e0e7ff;color:#1e3a8a;font-size:14px}
  .ps-ex b{display:block;font-size:.95rem}
  .ps-ex small{display:block;color:var(--stone);font-size:.85rem}
  .ps-ojo{margin:12px 0 0;border-radius:14px;padding:9px 12px;background:#fff1f2;border:1.5px solid #fecdd3;font-size:.92rem;line-height:1.5}
  [data-theme=dark] .ps-ojo{background:#2e1515;border-color:#7f1d1d}
  .ps-ojo s{color:#b91c1c;text-decoration-thickness:2px}
  .ps-ojo em{color:#15803d;font-style:normal;font-weight:800}
  .ps-listen{all:unset;cursor:pointer;margin-top:10px;display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:.85rem;color:#9a3412;padding:6px 12px;border-radius:999px;background:#ffedd5}
  [data-theme=dark] .ps-listen{background:#431407;color:#fdba74}
  .pc-mark{cursor:pointer}
  /* dictado */
  .dz-how{border-radius:18px;border:2px solid #cfdcff;background:#eef3ff;padding:12px 14px;margin:0 0 14px}
  [data-theme=dark] .dz-how{background:#141c36;border-color:#26335e}
  .dz-how h3{margin:0 0 6px;font-size:1rem}
  .dz-how ol{margin:0;padding-left:20px;display:grid;gap:4px;font-size:.92rem;line-height:1.45}
  .dz-legend{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}
  .dz-legend span{font-size:.8rem;background:var(--raise);border:1.5px solid var(--line);border-radius:10px;padding:3px 8px}
  .dz-legend b{font-family:var(--mono);margin-left:4px}
  .dz-note{font-size:.82rem;color:var(--stone);margin:4px 0 0}
  .dz-live{margin:8px 0 0;padding:9px 12px;border-radius:14px;font-size:.9rem;line-height:1.45;border:1.5px solid var(--line);background:var(--raise)}
  .dz-live.ok{border-color:#86efac;background:#f0fdf4} .dz-live.bad{border-color:#fecaca;background:#fff1f2}
  [data-theme=dark] .dz-live.ok{background:#12280f} [data-theme=dark] .dz-live.bad{background:#2e1515}
  .deck-set[open] summary,.deck-set summary{font-weight:800}
  `;
  var st=document.createElement("style"); st.id="plx19"; st.textContent=css; document.head.appendChild(st);

  /* ---------- Logo → Inicio ---------- */
  document.addEventListener("click",function(e){
    var m=e.target.closest&&e.target.closest(".pc-mark"); if(!m) return;
    e.preventDefault();
    try{ if(typeof gOpen!=="undefined"&&gOpen) gCloseModal(); }catch(x){}
    try{ if(typeof P!=="undefined"&&P) closePlayer(); }catch(x){}
    try{ go("parcours"); }catch(x){}
    scrollTo({top:0,behavior:"smooth"});
  },true);
  (function(){ var m=q(".pc-mark"); if(m){ m.setAttribute("role","link"); m.setAttribute("tabindex","0"); m.setAttribute("aria-label","Ir al inicio"); m.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); m.click(); } }); } })();

  /* ---------- explicación sencilla ---------- */
  function simpleHTML(l){
    var X=window.__EXPLICA&&window.__EXPLICA[l.id]; if(!X) return "";
    var pid=profFor(l.id), P0=PROFS[pid], g=EXPL[pid];
    var hasA=typeof AUDIO!=="undefined"&&AUDIO["e:"+l.id];
    return '<div class="plx-simple" data-pf="'+pid+'"><div class="ps-top">'+pImg(pid,g[0],g[1],"",P0.name)+'<div><h4>'+esc(P0.name)+' te lo explica fácil</h4><p>'+esc(X.idea)+"</p>"+
      (hasA?'<button type="button" class="ps-listen" data-pxa="'+esc(l.id)+'">🔊 Escuchar esta explicación</button>':"")+"</div></div>"+
      '<ol class="ps-steps">'+X.pasos.map(function(s){return "<li><span>"+esc(s)+"</span></li>"}).join("")+"</ol>"+
      '<div class="ps-ex">'+X.ej.map(function(e){return '<div><button type="button" data-psay="'+esc(sayOf(e[0]))+'" aria-label="Escuchar">🔊</button><span><b lang="fr">'+esc(e[0])+"</b><small>"+esc(e[1])+"</small></span></div>"}).join("")+"</div>"+
      '<div class="ps-ojo">⚠️ No digas <s lang="fr">'+esc(X.ojo[0])+'</s> → di <em lang="fr">'+esc(X.ojo[1])+"</em>. "+esc(X.ojo[2])+"</div></div>";
  }
  function sayOf(t){return String(t).replace(/\[[^\]]*\]/g,"").replace(/\s*(→|=|≠)\s*/g,", ").replace(/\s+/g," ").replace(/(,\s*)+/g,", ").replace(/^[,\s]+|[,\s]+$/g,"").trim()}
  window.plxSayOf=sayOf;
  window.plxSimpleHTML=simpleHTML;
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-psay]"); if(!b) return;
    e.preventDefault(); e.stopPropagation(); speak(b.dataset.psay);
  },true);
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-pxa]"); if(!b) return;
    e.preventDefault(); e.stopPropagation();
    var k="e:"+b.dataset.pxa;
    if(typeof curKey!=="undefined"&&curKey===k){ stopAudio(); b.innerHTML="🔊 Escuchar esta explicación"; return; }
    if(AUDIO[k]){ playSpec(AUDIO[k],function(){ b.innerHTML="🔊 Escuchar esta explicación"; }); try{ curKey=k; }catch(x){} b.innerHTML="⏹ Detener"; }
  },true);

  /* ---------- renderStep: profesores + explicación ---------- */
  var _rs=renderStep;
  renderStep=function(){
    var r=_rs.apply(this,arguments);
    try{ profDecorate(); }catch(e){ console.warn("plx19",e); }
    requestAnimationFrame(function(){ try{ profDecorate(true); }catch(e){} });
    return r;
  };
  function lessonOfStep(s){ if(!s||!s.key) return P&&P.lesson; var x=typeof ITEMS!=="undefined"&&ITEMS[s.key]; return x&&x.l||P&&P.lesson; }
  function profDecorate(late){
    if(!P) return;
    var box=q("#player"); if(!box) return;
    var s=P.steps[P.i], l=lessonOfStep(s)||P.lesson, pid=profFor(l?l.id:(P.title||P.mode)), P0=PROFS[pid];
    if(s&&s.kind==="theory"&&P.phase!=="end"){
      var th=q("#theory",box);
      if(th&&!q(".plx-simple",th)&&l){ var h=simpleHTML(l); if(h) th.insertAdjacentHTML("afterbegin",h); }
      if(l&&typeof AUDIO!=="undefined"&&!AUDIO["t:"+l.id]){ box.querySelectorAll(".listen").forEach(function(x){ if(x.querySelector("[data-read]")) x.remove(); }); }
      var tc=q(".gtheory-cat",box);
      if(tc&&!tc.classList.contains("pf-th")){
        tc.classList.add("pf-th");
        tc.innerHTML=pImg(pid,EXPL[pid][0],EXPL[pid][1],"m-tcat",P0.name)+'<div class="pf-say"><b>'+esc(P0.name)+" · "+esc(P0.lang)+"</b>"+esc(pick(P0.tip))+"</div>";
      }
    }
    if(P.phase==="feedback"){
      var fbx=q(".pf .fb",box);
      if(fbx&&!q(".pf-fbp",fbx)&&s&&s.kind==="item"){
        var ok=(P.res[P.i]||{}).ok, e=ok?HAPPY[pid]:SAD[pid];
        fbx.insertAdjacentHTML("afterbegin",'<div class="pf-fbp '+(ok?"ok":"ko")+'">'+pImg(pid,e[0],e[1],"",P0.name)+"<span><b>"+esc(P0.name)+"</b>"+esc(pick(ok?P0.ok:P0.ko))+"</span></div>");
      }
    }
    if(late&&s&&s.kind==="item"&&P.phase!=="end"){
      var ill=q(".pbody .m-ill:not(.m-ill-sp)",box);
      if(ill&&!ill.classList.contains("pf-ill")){
        var n=P.steps.slice(0,P.i+1).filter(function(x){return x.kind==="item"}).length;
        if(n%5===0){ ill.classList.add("pf-ill"); var im=ill.querySelector("img"); if(im){ var g=PROFS[pid].ges; var keys=Object.keys(g); im.src="img/prof/pf-"+pid+"-g"+g[keys[n%keys.length]]+".webp"; } var bb=ill.querySelector(".m-bub"); if(bb) bb.textContent=pick(P0.tip).split(".")[0]; }
      }
    }
    var px=q(".pxr",box);
    if(px&&!q(".pf-end",px)&&P.phase==="end"){
      var tot=P.firstTotal||0, acc=tot?Math.round((P.first||0)/tot*100):100, fig, msg, who=pid;
      if(P.mode==="blanc"||P.mode==="chrono"||P.mode==="placement"||P.mode==="speak") { /* también */ }
      if(acc>=80){ fig=pImg(pid,HAPPY[pid][0],HAPPY[pid][1]); msg=pick(PROFS[pid].ok); }
      else if(acc>=50){ who="antoine"; fig=pImg("antoine","e",5); msg=PROFS.antoine.mid; }
      else { who="antoine"; fig=pImg("antoine","e",2); msg="Hay que repasar. Vuelve a la explicación y repite la lección."; }
      var stats=q(".pxr-stats",px);
      var html='<div class="pf-end">'+fig+"<p><b>"+esc(PROFS[who].name)+" · "+acc+" % al primer intento</b>"+esc(msg)+"</p></div>";
      stats?stats.insertAdjacentHTML("afterend",html):px.insertAdjacentHTML("beforeend",html);
    }
  }

  if(typeof finish==="function"){ var _fin=finish; finish=function(){ var r=_fin.apply(this,arguments); try{ profDecorate(); }catch(e){} setTimeout(function(){ try{ profDecorate(true); }catch(e){} },60); return r; }; }
  /* ---------- «Ver explicación» también con la versión sencilla ---------- */
  var _gm=gModal;
  gModal=function(html,cls){
    if(cls==="m-theo"&&typeof P!=="undefined"&&P){
      var s=P.steps[P.i], l=lessonOfStep(s);
      if(l){ var sh=simpleHTML(l); if(sh) html=html.replace('<div class="plx-theo">','<div class="plx-theo">'+sh); }
    }
    return _gm.call(this,html,cls);
  };

  /* ---------- Inicio: tarjeta «Tus profesores» ---------- */
  function profModal(id){
    var P0=PROFS[id], ex=Object.keys(P0.exp).map(function(k){return pImg(id,"e",P0.exp[k],"",k)}).join("");
    gModal('<small class="gm-k">'+esc(P0.lang)+'</small><div class="pf-modal">'+pFull(id)+'<div><h2 class="gm-t" style="text-align:left">'+esc(P0.name)+'</h2><p class="gm-sub" style="text-align:left">'+esc(P0.bio)+'</p><p style="margin:8px 0 0"><i>«'+esc(P0.hi)+'»</i></p></div></div><div class="pf-exps">'+ex+'</div><div class="set-row c"><button class="gbtn" data-g="close" data-autofocus>¡Vamos!</button></div>',"m-pf");
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-pf-open]"); if(!b) return;
    e.preventDefault(); profModal(b.dataset.pfOpen);
  });
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{
      if(view==="parcours"&&(typeof P==="undefined"||!P)){
        var m=q("#view .ghome .gmain");
        if(m&&!q(".pf-home",m)){
          var anchor=q(".streak-card",m)||q(".hsum",m);
          var html='<div class="gcard pf-home"><h3>Tus profesores</h3><p>Te acompañan en las lecciones. Toca uno para conocerlo.</p><div class="pf-row">'+PID.map(function(id){var P0=PROFS[id];return '<button type="button" class="pf-card" data-pf-open="'+id+'" style="background:'+P0.color+';color:'+P0.ink+'">'+pFull(id)+"<b>"+esc(P0.name.replace("Prof. ",""))+"</b><small>"+P0.tag+"</small></button>"}).join("")+"</div></div>";
          anchor?anchor.insertAdjacentHTML("beforebegin",html):m.insertAdjacentHTML("beforeend",html);
        }
      }
      if(view==="dictee") dzEnhance();
    }catch(e){ console.warn("plx19 render",e); }
    return r;
  };

  /* ================= DICTADO ================= */
  var PWORDS=[[/\bpoint[- ]virgule\b/gi,";"],[/\bdeux[- ]points\b/gi,":"],[/\bpoints? de suspension\b/gi,"…"],[/\bpoint d'interrogation\b/gi,"?"],[/\bpoint d'exclamation\b/gi,"!"],[/\bouvre[zr]? les guillemets\b/gi,"«"],[/\bferme[zr]? les guillemets\b/gi,"»"],[/\bouvre[zr]? la parenthèse\b/gi,"("],[/\bferme[zr]? la parenthèse\b/gi,")"],[/\bà la ligne\b/gi,"\n"],[/\bvirgule\b/gi,","],[/\bpoint\b/gi,"."]];
  function spelled(hyp,ref){
    var out=hyp, changed=false, refL=(ref||"").toLowerCase();
    PWORDS.forEach(function(p){
      var word=p[0].source.replace(/\\b/g,"").replace(/\[- \]/g," ").toLowerCase();
      if(/^point$/.test(word)&&/\bpoint\b/.test(refL)) return;
      if(/virgule/.test(word)&&/virgule/.test(refL)) return;
      var nx=out.replace(p[0],function(){ changed=true; return p[1]; }); out=nx;
    });
    if(changed) out=out.replace(/\s+([,.…)])/g,"$1").replace(/\s*([;:?!»])/g," $1").replace(/«\s*/g,"« ").replace(/[ \t]{2,}/g," ");
    return {text:out,changed:changed};
  }
  if(typeof dEval==="function"){
    var _dEval=dEval;
    dEval=function(ref,hyp,alts){
      var s=spelled(hyp||"",ref); if(s.changed) dEval.lastSpelled=true;
      return _dEval.call(this,ref,s.text,alts);
    };
  }
  if(typeof dzCheck==="function"){
    var _dzCheck=dzCheck;
    dzCheck=function(){ dEval.lastSpelled=false; var r=_dzCheck.apply(this,arguments); if(dEval.lastSpelled) setTimeout(function(){ toast("Convertimos «virgule», «point»… en signos de puntuación."); },400); return r; };
  }
  function dzUpTo(){
    var d=dz(), ta=q("#dtx"), hyp=ta?ta.value:""; if(!hyp.trim()){ return {msg:"Todavía no has escrito nada.",cls:""}; }
    var hyp2=spelled(hyp,d.segs.join(" ")).text, n=words(hyp2), acc=0, upto=0;
    for(var i=0;i<d.segs.length;i++){ acc+=words(d.segs[i]); if(acc<=n+1) upto=i; else break; }
    var ref=d.segs.slice(0,upto+1).join(" "), r=dEval(ref,hyp,d.alts);
    if(!r.errs.length) return {msg:"✓ Vas muy bien: sin errores hasta el grupo "+(upto+1)+".",cls:"ok"};
    var e=r.errs[0], o=r.ops[e.k];
    return {msg:"Hasta el grupo "+(upto+1)+" hay "+r.errs.length+" posible(s) error(es). El primero: «"+(o.h||"—")+"» ("+(DCAT[e.c]?DCAT[e.c][0]:e.c)+"). Revisa antes de seguir.",cls:"bad"};
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-dzx]"); if(!b) return;
    e.preventDefault();
    if(b.dataset.dzx==="upto"){ var r=dzUpTo(), live=q("#dzlive"); if(live){ live.className="dz-live "+r.cls; live.textContent=r.msg; live.hidden=false; } }
  });
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-dzset]"); if(!b) return;
    var v=b.dataset.dzset, msg={"punct:1":"Puntuación dictada: la voz dirá «virgule», «point»…","punct:0":"Puntuación no dictada: tendrás que deducirla por la entonación.","twice:1":"Cada grupo se leerá dos veces.","twice:0":"Cada grupo se leerá una sola vez."}[v];
    if(msg) setTimeout(function(){ toast(msg); },60);
  },true);
  function dzEnhance(){
    var dtx=q("#dtx"); if(!dtx||q(".dz-how")) return;
    var deck=q(".deck"); if(!deck) return;
    deck.insertAdjacentHTML("beforebegin",'<div class="dz-how"><h3>Cómo funciona</h3><ol><li><b>Escucha</b> la lectura completa sin escribir (botón «Lectura completa»).</li><li><b>Escribe grupo por grupo</b> con ▶. '+(DZ.punct?"La voz dicta la puntuación en francés:":"La puntuación no se dicta: dedúcela por las pausas.")+'</li><li><b>Revisa</b> con «¿Voy bien?» cuando quieras y, al final, pulsa «Corregir mi dictado».</li></ol>'+(DZ.punct?'<div class="dz-legend"><span>virgule<b>,</b></span><span>point<b>.</b></span><span>point-virgule<b>;</b></span><span>deux-points<b>:</b></span><span>point d\'interrogation<b>?</b></span><span>point d\'exclamation<b>!</b></span><span>ouvrez / fermez les guillemets<b>« »</b></span><span>à la ligne<b>↵</b></span></div><p class="dz-note">Si escribes la palabra («virgule»), la app la convierte en el signo al corregir.</p>':"")+"</div>");
    var set=q("#dzset"); if(set){ set.open=true; var rows=set.querySelectorAll(".setrow"); if(rows[1]) rows[1].insertAdjacentHTML("beforeend",'<p class="dz-note">'+(DZ.punct?"Ahora: la voz dice los signos («virgule»…).":"Ahora: la voz no dice los signos.")+"</p>"); if(rows[2]) rows[2].insertAdjacentHTML("beforeend",'<p class="dz-note">'+(DZ.twice?"Ahora: cada grupo suena dos veces.":"Ahora: cada grupo suena una vez.")+"</p>"); }
    var bar=dtx.parentNode.querySelector(".bar-row span:last-child");
    if(bar&&!q("[data-dzx=upto]")) bar.insertAdjacentHTML("afterbegin",'<button class="btn line" data-dzx="upto">¿Voy bien?</button>');
    var br=dtx.parentNode.querySelector(".bar-row"); if(br&&!q("#dzlive")) br.insertAdjacentHTML("afterend",'<div class="dz-live" id="dzlive" hidden aria-live="polite"></div>');
  }

  /* ---------- audio: mensaje claro si falta ---------- */
  if(typeof deviceSpeak==="function"){
    var _ds=deviceSpeak;
    deviceSpeak=function(text,slow){
      try{ if(typeof synth!=="undefined"&&synth&&!frVoice&&speechSynthesis.getVoices().length){ var v=speechSynthesis.getVoices().find(function(x){return /^fr/i.test(x.lang)}); if(v) frVoice=v; } }catch(e){}
      if(typeof synth==="undefined"||!synth||!frVoice){ toast("Este audio aún no está en la app. Avísanos con «Reportar un error»."); return false; }
      return _ds.apply(this,arguments);
    };
  }
})();

