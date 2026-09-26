/* PLEX PLAY 1.14 — Lecciones: portada del curso + unidades en tarjetas (según referencia) */
(function(){
  "use strict";
  if(typeof render!=="function"||typeof TRACKS==="undefined") return;
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var OPEN={};   /* unidades abiertas por curso */
  var ICONS=[
    [/salu|premiers|primeros|présent/i,"👋"],[/vida diaria|quotidien|rutina|routine/i,"☕"],[/gusto|loisir|ocio/i,"🎧"],[/ciudad|ville|lugar/i,"🗺️"],
    [/mundo|famil|personnes/i,"👨‍👩‍👧"],[/pasado|passé|relatar|recuerdo|souvenir/i,"⏳"],[/proyecto|futur|projet/i,"🚀"],[/compar|sustitu/i,"⚖️"],
    [/pronom/i,"🔁"],[/viaje|voyage|consejo/i,"✈️"],[/vocal/i,"🗣️"],[/consonant|grafí/i,"🔤"],[/frase hablada|oral|pronunci/i,"🎙️"],
    [/unir|precisar|matizar|nuanc/i,"🧩"],[/opinar|desear|argument|débat/i,"💬"],[/hipótesis|discurso/i,"🤔"],[/organizar|idea/i,"🗂️"],
    [/escribir|écrire|écrit/i,"✍️"],[/grammaire|gramática/i,"📐"],[/lire|lectura|texte/i,"📖"],[/francophon/i,"🌍"],[/histor|repères/i,"🏛️"],
    [/société|arts/i,"🎭"],[/langue|école|escuela/i,"🏫"],[/classicisme|siècle|littér/i,"📜"],[/théâtre|récit|dissertation|méthode/i,"🎬"],
    [/morpho|genre|accord/i,"🧬"],[/préposition/i,"📍"],[/structure|temps/i,"🧱"],[/cohésion|cohérence|connect/i,"🔗"],[/résumé|synth|compte rendu|réduire/i,"📝"],[/essai|argumentatif/i,"🧠"]
  ];
  function iconFor(t){ for(var i=0;i<ICONS.length;i++) if(ICONS[i][0].test(t)) return ICONS[i][1]; return "📘"; }
  function short(desc){ var s=String(desc||"").split(/(?<=\.)\s/)[0]; if(s.length>120){ s=s.slice(0,117).replace(/\s+\S*$/,"")+"…"; } return s; }


  var TL={gram:"Gramática",conj:"Conjugación",accord:"Concordancia",prep:"Preposiciones",voc:"Vocabulario",registre:"Registro",phono:"Fonética",coh:"Conectores",comp:"Comprensión",cult:"Cultura",lit:"Literatura",ortho:"Ortografía",synt:"Sintaxis"};
  function lessonRows(body){
    body.querySelectorAll("li.pnode").forEach(function(li,i){
      var btn=li.querySelector("[data-arg]"); if(!btn) return;
      var id=btn.dataset.arg, l=LESSONS.find(function(x){ return x.id===id; }); if(!l) return;
      var done=!!(S.lessons[l.id]&&S.lessons[l.id].done), cur=li.classList.contains("cur"), lock=li.classList.contains("lock")&&!done&&!cur;
      var n=(l.items||[]).length||15, min=Math.max(3,Math.round(n*.7)), m=null; try{ m=typeof lessonMastery==="function"?lessonMastery(l):null; }catch(e){}
      var pct=m?m.pct:0, st=done?"done":cur?"cur":lock?"lock":"open";
      var ic=done?'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>':cur?'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z"/></svg>':lock?'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>':"<b>"+(i+1)+"</b>";
      var meta=(TL[l.t]?TL[l.t]+" · ":"")+n+" ejercicios · "+min+" min";
      var bar=done?'<span class="lxl-m"><i><b style="width:'+Math.max(4,pct)+'%"></b></i><em>'+(typeof mLabel==="function"?mLabel(pct):"")+" · "+pct+" %</em></span>":"";
      var cta=done?(m&&m.due?"Repasar":"Otra vez"):cur?"Empezar":lock?"":"Abrir";
      li.className="pnode lxl st-"+st;
      li.innerHTML='<button class="lxl-row" data-g="node" data-arg="'+esc(l.id)+'" aria-label="'+esc(l.title)+(lock?", bloqueada":"")+'"><span class="lxl-ic">'+ic+'</span><span class="lxl-t"><small>Lección '+(i+1)+" · "+esc(meta)+"</small><b>"+esc(l.title)+"</b>"+bar+"</span>"+(cta?'<span class="lxl-cta">'+cta+"</span>":"")+"</button>";
    });
  }
  function transform(){
    var v=document.getElementById("view"), sec=v&&v.querySelector(".gpath"); if(!sec||sec.classList.contains("lx")) return;
    var T=TRACKS.find(function(t){ return t.id===track; })||TRACKS[0];
    var ls=LESSONS.filter(function(l){ return l.track===T.id&&!l.special; }), d=ls.filter(function(l){ return S.lessons[l.id]&&S.lessons[l.id].done; }).length, pct=ls.length?Math.round(d/ls.length*100):0;
    var mk={a1:"c-paris",a2:"c-cafe",fon:"c-fonetica",b11:"c-calle",b12:"c-playa",b21:"c-montana",rem:"c-bandera",prog:"c-libros",c12:"c-noche",lit:"c-teatro"}[T.id]; var bg="url(img/"+(mk||"c-paris")+".webp)";
    var head=sec.querySelector(".gp-head");
    var opts=TRACKS.map(function(t){ return '<option value="'+t.id+'" '+(t.id===T.id?"selected":"")+">Semestre "+esc(t.sem)+" · "+esc(t.label)+"</option>"; }).join("");
    var hero='<div class="lx-hero" style="--bg:'+esc(bg)+'"><div class="lx-art" aria-hidden="true"></div><img class="lx-cat" src="img/mz-hola.webp" alt="" aria-hidden="true"><img class="lx-himg" src="img/u/hero-'+T.id+'.webp" alt="" aria-hidden="true" onload="this.parentNode.classList.add(\'has-img\')" onerror="this.remove()">'+
      '<button class="lx-back" data-view="parcours" aria-label="Volver al inicio">‹</button>'+
      '<div class="lx-txt"><span class="lx-chip">Semestre '+esc(T.sem)+' de la Licenciatura</span><h1>'+esc(T.label)+'</h1><p>'+esc(short(T.desc))+'</p>'+
      '<div class="lx-prog"><span>Tu progreso</span><i><b style="width:'+Math.max(pct,2)+'%"></b></i><em>'+pct+' %</em></div></div></div>'+
      '<div class="lx-bar"><h2>Unidades</h2><button type="button" class="lx-pick" data-lxpick aria-haspopup="dialog"><small>Semestre '+esc(T.sem)+'</small><b>'+esc(T.label)+'</b><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button></div>';
    head.innerHTML=hero;
    var units=sec.querySelectorAll(".psec"), open=OPEN[T.id]||{};
    units.forEach(function(u,i){
      var h=u.querySelector(".psec-h"), title=(h.querySelector("h2")||{}).textContent||"", nn=(h.querySelector(".psec-n")||{}).textContent||"0/0", m=nn.split("/"), p=+m[1]?Math.round(+m[0]/+m[1]*100):0;
      var img='<span class="lx-ic"><span class="lx-emo">'+iconFor(title)+'</span><img src="img/u/'+T.id+"-"+(i+1)+'.webp" alt="" loading="lazy" onerror="this.remove()"></span>';
      var card=document.createElement("button"); card.type="button"; card.className="lx-unit"; card.dataset.lxu=i; card.setAttribute("aria-expanded",!!open[i]);
      card.innerHTML=img+'<span class="lx-n">'+(i+1)+'</span><span class="lx-t"><b>'+esc(title)+'</b><span class="lx-pb"><i style="width:'+p+'%"></i></span></span><span class="lx-c">'+esc(nn)+'</span><span class="lx-ch" aria-hidden="true">›</span>';
      h.replaceWith(card);
      u.classList.add("lx-u"); if(open[i]) u.classList.add("open");
      var body=document.createElement("div"); body.className="lx-body";
      [].slice.call(u.children).forEach(function(c){ if(c!==card) body.appendChild(c); });
      u.appendChild(body);
      try{ lessonRows(body); }catch(e){}
    });
    sec.classList.add("lx");
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-lxu]"); if(!b) return;
    e.preventDefault();
    var u=b.closest(".psec"), i=+b.dataset.lxu, o=OPEN[track]||(OPEN[track]={});
    o[i]=!o[i]; u.classList.toggle("open",o[i]); b.setAttribute("aria-expanded",o[i]);
    if(o[i]) setTimeout(function(){ var r=u.getBoundingClientRect(); if(r.top<70||r.top>innerHeight*.6) scrollBy({top:r.top-80,behavior:"smooth"}); },60);
  });
  document.addEventListener("change",function(e){
    if(e.target&&e.target.id==="lxTrack"){ track=e.target.value; try{ lsSet("cr-track",track); }catch(x){} render(); scrollTo(0,0); }
  });

  var MKB={a1:"c-paris",a2:"c-cafe",fon:"c-fonetica",b11:"c-calle",b12:"c-playa",b21:"c-montana",rem:"c-bandera",prog:"c-libros",c12:"c-noche",lit:"c-teatro"};
  function closeSheet(){ var o=document.querySelector(".lx-sheet"); if(!o) return; o.classList.remove("in"); setTimeout(function(){ o.remove(); },220); document.removeEventListener("keydown",escK); }
  function escK(e){ if(e.key==="Escape") closeSheet(); }
  function openSheet(){
    closeSheet();
    var g=+(gEnsure().grp||0);
    var items=TRACKS.map(function(t){
      var ls=LESSONS.filter(function(l){ return l.track===t.id&&!l.special; }), d=ls.filter(function(l){ return S.lessons[l.id]&&S.lessons[l.id].done; }).length, pct=ls.length?Math.round(d/ls.length*100):0, on=t.id===track, mine=g&&+t.semN===g;
      return '<button class="lxs-i'+(on?" on":"")+'" data-lxset="'+t.id+'" role="option" aria-selected="'+on+'"><span class="lxs-th" style="background-image:url(img/'+(MKB[t.id]||"c-paris")+'.webp)"></span><span class="lxs-t"><small>Semestre '+esc(t.sem)+(mine?' <em>tu semestre</em>':"")+"</small><b>"+esc(t.label)+'</b><span class="lxs-p"><i><b style="width:'+Math.max(pct,0)+'%"></b></i><em>'+d+"/"+ls.length+"</em></span></span>"+(on?'<span class="lxs-ok">✓</span>':"")+"</button>";
    }).join("");
    var o=document.createElement("div"); o.className="lx-sheet"; o.setAttribute("role","dialog"); o.setAttribute("aria-modal","true"); o.setAttribute("aria-label","Elige tu curso");
    o.innerHTML='<div class="lxs-bg" data-lxclose></div><div class="lxs-panel"><span class="lxs-grab"></span><div class="lxs-h"><div><b>Elige tu curso</b><small>Todos los cursos de francés de la Licenciatura</small></div><button class="lxs-x" data-lxclose aria-label="Cerrar">✕</button></div><div class="lxs-list" role="listbox">'+items+"</div></div>";
    document.body.appendChild(o); requestAnimationFrame(function(){ o.classList.add("in"); var c=o.querySelector(".lxs-i.on"); c&&c.scrollIntoView({block:"center"}); c&&c.focus({preventScroll:true}); });
    document.addEventListener("keydown",escK);
  }
  document.addEventListener("click",function(e){
    var t=e.target.closest&&e.target.closest("[data-lxpick],[data-lxset],[data-lxclose]"); if(!t) return;
    e.preventDefault();
    if(t.hasAttribute("data-lxpick")) return openSheet();
    if(t.hasAttribute("data-lxclose")) return closeSheet();
    var id=t.dataset.lxset; closeSheet();
    if(id!==track){ track=id; try{ lsSet("cr-track",track); }catch(x){} render(); scrollTo({top:0,behavior:"smooth"}); }
  });
  var _rd=render; render=function(){ var r=_rd.apply(this,arguments); try{ if(view==="lecciones") transform(); }catch(e){ console.warn(e); } return r; };

  var css=`
  .gpath.lx .gp-head{padding:0!important;background:none!important;border:0!important;box-shadow:none!important;margin:0 0 6px!important}
  .gpath.lx .crs-row,.gpath.lx .crs-info,.gpath.lx .gp-note{display:none!important}
  .lx-hero{position:relative;overflow:hidden;border-radius:28px;min-height:250px;padding:22px 20px;background:linear-gradient(180deg,#eef4ff,#f7f9ff);box-shadow:0 18px 40px -28px rgba(30,58,138,.7);isolation:isolate}
  .lx-art{position:absolute;inset:0 0 0 38%;background:var(--bg) center/cover no-repeat;z-index:-2}
  .lx-hero::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#f4f7ff 0%,#f4f7ff 36%,rgba(244,247,255,.82) 50%,rgba(244,247,255,0) 72%)}
  .lx-cat{position:absolute;right:6px;bottom:-6px;width:150px;height:auto;filter:drop-shadow(0 10px 14px rgba(30,58,138,.25));z-index:0;animation:lxCat 3.6s ease-in-out infinite}
  @keyframes lxCat{50%{transform:translateY(-4px) rotate(-2deg)}}
  .lx-himg{position:absolute;inset:0 0 0 30%;width:70%;height:100%;object-fit:cover;object-position:right center;z-index:-2}
  .lx-hero.has-img .lx-art,.lx-hero.has-img .lx-cat{display:none}
  .lx-back{all:unset;cursor:pointer;position:relative;z-index:1;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.85);color:#1e3a8a;font-size:1.6rem;font-weight:900;line-height:1;box-shadow:0 4px 12px -6px rgba(30,58,138,.5)}
  .lx-txt{position:relative;z-index:1;max-width:46%;margin-top:10px}
  @media (max-width:900px){.lx-txt{max-width:62%}}
  .lx-chip{display:inline-block;padding:5px 10px;border-radius:10px;background:rgba(226,234,255,.95);color:#3b4a74;font-weight:800;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase}
  .lx-txt h1{margin:10px 0 6px;font-size:2.1rem;line-height:1.05;color:#0f1d3d;letter-spacing:-.02em}
  .lx-txt p{margin:0 0 14px;color:#4b5775;font-size:.95rem;line-height:1.4}
  .lx-prog{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:18px;background:rgba(255,255,255,.95);box-shadow:0 8px 20px -14px rgba(30,58,138,.6);max-width:360px}
  .lx-prog span{font-size:.82rem;color:#4b5775;white-space:nowrap}
  .lx-prog i{flex:1;height:8px;border-radius:99px;background:#e6ebf5;overflow:hidden}.lx-prog i b{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#2563eb,#3b82f6)}
  .lx-prog em{font-style:normal;font-weight:800;font-size:.85rem;color:#1e3a8a;white-space:nowrap}
  .lx-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:18px 2px 10px}
  .lx-bar h2{margin:0;font-size:1.45rem;color:var(--ink)}
  .lx-sel select{appearance:none;-webkit-appearance:none;border:1.5px solid var(--line);border-radius:999px;padding:10px 38px 10px 16px;font:inherit;font-weight:700;font-size:.88rem;color:#1e3a8a;background:var(--raise) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231e3a8a' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center;box-shadow:0 6px 16px -12px rgba(30,58,138,.6);max-width:62vw;text-overflow:ellipsis;cursor:pointer}
  .gpath.lx .psec{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;margin:0 0 12px!important}
  .lx-unit{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:grid;grid-template-columns:auto auto 1fr auto auto;align-items:center;gap:14px;padding:12px 16px 12px 12px;border-radius:22px;background:var(--raise);border:1px solid var(--line);box-shadow:0 12px 26px -22px rgba(30,58,138,.7);transition:transform .15s,box-shadow .15s}
  .lx-unit:hover{transform:translateY(-2px);box-shadow:0 16px 30px -20px rgba(30,58,138,.7)}
  .lx-unit:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}
  .lx-ic{position:relative;width:74px;height:62px;display:grid;place-items:center}
  .lx-emo{font-size:44px;line-height:1;filter:drop-shadow(0 6px 8px rgba(0,0,0,.14));transform:rotate(-6deg)}
  .lx-ic img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
  .lx-ic img+.lx-emo,.lx-ic:has(img) .lx-emo{visibility:hidden}
  .lx-n{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;font-weight:900;font-size:1.35rem;color:var(--sc,#2563eb);background:color-mix(in srgb,var(--sc,#2563eb) 13%,transparent)}
  .lx-t{display:grid;gap:10px;min-width:0}.lx-t b{font-size:1.05rem;line-height:1.2;color:var(--ink);overflow:hidden;text-overflow:ellipsis}
  .lx-pb{display:block;height:7px;border-radius:99px;background:#e6ebf5;max-width:260px}.lx-pb i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#1d4ed8,#3b82f6)}
  html[data-theme=dark] .lx-pb,html[data-theme=dark] .lx-prog i{background:#223052}
  .lx-c{align-self:start;margin-top:2px;padding:4px 10px;border-radius:10px;background:color-mix(in srgb,#2563eb 10%,transparent);color:#1e3a8a;font-weight:800;font-size:.85rem}
  html[data-theme=dark] .lx-c{color:#bfdbfe}
  .lx-ch{font-size:1.8rem;line-height:1;color:#2563eb;font-weight:700;transition:transform .2s}
  .lx-unit[aria-expanded=true] .lx-ch{transform:rotate(90deg)}
  .lx-body{display:none;padding:10px 6px 4px}
  .psec.open .lx-body{display:block;animation:plxUp .3s ease both}
  .lx-body .psec-sub{margin:4px 6px 10px!important}
  html[data-theme=dark] .lx-hero{background:linear-gradient(180deg,#17223d,#101a30)}
  html[data-theme=dark] .lx-hero::before{background:linear-gradient(90deg,#131d35 0%,#131d35 36%,rgba(19,29,53,.8) 50%,rgba(19,29,53,0) 72%)}
  html[data-theme=dark] .lx-txt h1{color:#fff}html[data-theme=dark] .lx-txt p,html[data-theme=dark] .lx-prog span{color:#c7d2fe}
  html[data-theme=dark] .lx-prog,html[data-theme=dark] .lx-back{background:rgba(23,34,61,.92)}html[data-theme=dark] .lx-chip{background:#223052;color:#c7d2fe}
  html[data-theme=dark] .lx-prog em,html[data-theme=dark] .lx-back{color:#bfdbfe}
  @media (max-width:560px){
    .lx-hero{min-height:230px;padding:16px}
    .lx-art{inset:0 0 0 30%}
    .lx-txt{max-width:70%}.lx-txt h1{font-size:1.8rem}.lx-txt p{font-size:.86rem}
    .lx-cat{width:118px}
    .lx-prog{padding:8px 10px}.lx-prog span{font-size:.75rem}
    .lx-unit{gap:10px;padding:10px 12px 10px 8px;grid-template-columns:auto auto 1fr auto auto}
    .lx-ic{width:58px;height:52px}.lx-emo{font-size:36px}
    .lx-n{width:38px;height:38px;font-size:1.15rem;border-radius:12px}
    .lx-t b{font-size:.95rem}
    .lx-sel select{font-size:.8rem;padding:9px 34px 9px 12px}
  }
  @media (max-width:380px){.lx-ic{display:none}}
  @media (prefers-reduced-motion:reduce){.lx-cat{animation:none}}
  .lx-pick{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:1fr auto;grid-template-rows:auto auto;column-gap:10px;align-items:center;padding:8px 14px 8px 16px;border-radius:18px;background:var(--raise);border:1.5px solid var(--line);box-shadow:0 8px 18px -14px rgba(30,58,138,.6);max-width:62vw;transition:border-color .15s,transform .15s}
  .lx-pick:hover{border-color:#93c5fd;transform:translateY(-1px)}
  .lx-pick:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}
  .lx-pick small{grid-column:1;font-size:.68rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#2563eb}
  .lx-pick b{grid-column:1;font-size:.92rem;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .lx-pick svg{grid-column:2;grid-row:1/3;color:#1e3a8a;width:30px;height:30px;padding:7px;box-sizing:border-box;border-radius:50%;background:color-mix(in srgb,#2563eb 12%,transparent)}
  html[data-theme=dark] .lx-pick svg{color:#bfdbfe}
  .lx-sheet{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;justify-content:center}
  .lxs-bg{position:absolute;inset:0;background:rgba(10,18,40,.45);opacity:0;transition:opacity .2s}
  .lxs-panel{position:relative;width:min(560px,100%);max-height:82vh;display:flex;flex-direction:column;background:var(--paper,#f5f7fc);border-radius:28px 28px 0 0;box-shadow:0 -20px 40px -20px rgba(10,18,40,.5);transform:translateY(100%);transition:transform .25s cubic-bezier(.2,.8,.3,1);padding:8px 14px calc(14px + env(safe-area-inset-bottom,0))}
  .lx-sheet.in .lxs-bg{opacity:1}.lx-sheet.in .lxs-panel{transform:none}
  .lxs-grab{width:44px;height:5px;border-radius:99px;background:var(--line);margin:4px auto 10px}
  .lxs-h{display:flex;align-items:center;gap:10px;padding:0 4px 10px}.lxs-h>div{display:grid;flex:1}.lxs-h b{font-size:1.2rem;color:var(--ink)}.lxs-h small{color:var(--stone);font-size:.82rem}
  .lxs-x{all:unset;cursor:pointer;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--surf3);color:var(--stone);font-weight:900}
  .lxs-list{overflow-y:auto;display:grid;gap:8px;padding:2px 2px 6px;-webkit-overflow-scrolling:touch}
  .lxs-i{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:8px 12px 8px 8px;border-radius:18px;background:var(--raise);border:1.5px solid var(--line);transition:border-color .15s,transform .15s}
  .lxs-i:hover{border-color:#93c5fd}
  .lxs-i:focus-visible{outline:3px solid #93c5fd;outline-offset:1px}
  .lxs-i.on{border:2px solid #2563eb;background:linear-gradient(90deg,color-mix(in srgb,#2563eb 8%,var(--raise)),var(--raise))}
  .lxs-th{width:64px;height:48px;border-radius:12px;background:#dbe4f5 center/cover no-repeat;flex:none}
  .lxs-t{display:grid;gap:3px;min-width:0}
  .lxs-t small{font-size:.68rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:var(--stone)}
  .lxs-t small em{font-style:normal;margin-left:4px;padding:1px 7px;border-radius:99px;background:#facc15;color:#1e3a8a;letter-spacing:0;text-transform:none}
  .lxs-t>b{font-size:.98rem;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .lxs-p{display:flex;align-items:center;gap:8px}.lxs-p i{flex:1;max-width:180px;height:6px;border-radius:99px;background:#e6ebf5;overflow:hidden}.lxs-p i b{display:block;height:100%;background:linear-gradient(90deg,#1d4ed8,#3b82f6);border-radius:99px}
  html[data-theme=dark] .lxs-p i{background:#223052}
  .lxs-p em{font-style:normal;font-size:.74rem;font-weight:800;color:var(--stone)}
  .lxs-ok{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#2563eb;color:#fff;font-weight:900;font-size:.85rem}
  @media (min-width:700px){.lx-sheet{align-items:center}.lxs-panel{border-radius:28px;max-height:78vh;transform:translateY(24px) scale(.97);opacity:0;transition:transform .22s,opacity .22s}.lx-sheet.in .lxs-panel{transform:none;opacity:1}.lxs-grab{display:none}}
  @media (max-width:560px){.lx-pick{max-width:58vw;padding:7px 10px 7px 12px}.lx-pick b{font-size:.85rem}}

  .gpath.lx .path{list-style:none;margin:0;padding:0 0 0 4px;position:relative;display:grid;gap:10px}
  .gpath.lx .path::before{content:"";position:absolute;left:31px;top:26px;bottom:26px;width:3px;border-radius:3px;background:linear-gradient(var(--line),var(--line))}
  .gpath.lx li.lxl{--x:0!important;transform:none!important;margin:0!important;padding:0!important;position:relative;display:block!important;animation:plxUp .3s ease both;animation-delay:calc(var(--i,0)*40ms)}
  .lxl-row{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;padding:12px 14px 12px 10px;border-radius:20px;background:var(--raise);border:1.5px solid var(--line);box-shadow:0 10px 22px -20px rgba(30,58,138,.7);transition:transform .15s,border-color .15s,box-shadow .15s}
  .lxl-row:hover{transform:translateX(3px);border-color:#bfd3ff}
  .lxl-row:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}
  .lxl-ic{position:relative;z-index:1;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--surf3);color:var(--stone);border:3px solid var(--raise);box-shadow:0 0 0 1.5px var(--line)}
  .lxl-ic b{font-weight:900}
  .lxl-t{display:grid;gap:3px;min-width:0}
  .lxl-t small{font-size:.74rem;color:var(--stone);font-weight:700;letter-spacing:.01em;line-height:1.3}
  .lxl-t>b{font-size:1rem;line-height:1.25;color:var(--ink)}
  .lxl-m{display:flex;align-items:center;gap:8px;margin-top:3px}
  .lxl-m i{flex:0 1 160px;height:6px;border-radius:99px;background:#e6ebf5;overflow:hidden}.lxl-m i b{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#16a34a,#4ade80)}
  html[data-theme=dark] .lxl-m i{background:#223052}
  .lxl-m em{font-style:normal;font-size:.74rem;color:#15803d;font-weight:700;white-space:nowrap}
  .lxl-cta{padding:8px 14px;border-radius:999px;font-weight:900;font-size:.82rem;background:var(--surf3);color:#1e3a8a;white-space:nowrap}
  html[data-theme=dark] .lxl-cta{color:#bfdbfe}
  .st-done .lxl-ic{background:linear-gradient(180deg,#22c55e,#16a34a);color:#fff;box-shadow:0 0 0 1.5px #86efac}
  .st-done .lxl-row{border-color:color-mix(in srgb,#22c55e 30%,var(--line))}
  .st-cur .lxl-row{border:2px solid #3b82f6;background:linear-gradient(90deg,color-mix(in srgb,#3b82f6 8%,var(--raise)),var(--raise));box-shadow:0 14px 28px -18px rgba(37,99,235,.65)}
  .st-cur .lxl-ic{background:linear-gradient(180deg,#3b82f6,#1d4ed8);color:#fff;box-shadow:0 0 0 1.5px #93c5fd;animation:lxPulse 2s ease-out infinite}
  @keyframes lxPulse{0%{box-shadow:0 0 0 0 rgba(59,130,246,.55)}100%{box-shadow:0 0 0 14px rgba(59,130,246,0)}}
  .st-cur .lxl-cta{background:linear-gradient(180deg,#3274f2,#1d4ed8);color:#fff;box-shadow:0 3px 0 #1e3a8a}
  .st-lock .lxl-row{background:transparent;box-shadow:none;border-style:dashed;cursor:default}
  .st-lock .lxl-row:hover{transform:none;border-color:var(--line)}
  .st-lock .lxl-t>b{color:var(--stone);font-weight:600}
  .st-lock .lxl-ic{background:var(--surf3);color:#94a3b8}
  .st-done .lxl-cta{background:color-mix(in srgb,#22c55e 14%,transparent);color:#15803d}
  @media (max-width:560px){.lxl-row{gap:10px;padding:10px 10px 10px 8px}.lxl-ic{width:40px;height:40px}.gpath.lx .path::before{left:27px}.lxl-cta{padding:7px 10px;font-size:.76rem}.lxl-t>b{font-size:.94rem}}
  @media (prefers-reduced-motion:reduce){.st-cur .lxl-ic{animation:none}}

  `;
  var st=document.createElement("style"); st.id="plx30"; st.textContent=css; document.head.appendChild(st);
  if(typeof view!=="undefined"&&view==="lecciones"){ try{ render(); }catch(e){} }
})();
