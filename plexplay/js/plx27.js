/* PLEX PLAY 1.12 — Perfil académico: semestre visible y fácil de elegir */
(function(){
  "use strict";
  if(typeof render!=="function"||typeof TRACKS==="undefined") return;
  var N=10;
  function courses(n){ return TRACKS.filter(function(t){ return +t.semN===+n; }); }
  function card(){
    var G=gEnsure(), g=G.grp||"", cs=g?courses(g):[];
    var btns=""; for(var i=1;i<=N;i++){ btns+='<button type="button" data-pgrp="'+i+'" aria-pressed="'+(String(i)===String(g))+'">'+i+"</button>"; }
    return '<div class="gcard plx-acad'+(g?"":" empty")+'"><div class="pa-h"><span class="pa-i">🎓</span><div><h2>Perfil académico</h2><small>Licenciatura en Lenguas Extranjeras</small></div>'+
      (g?'<span class="pa-now">Semestre '+g+"</span>":'<span class="pa-now none">Sin elegir</span>')+"</div>"+
      '<p class="pa-q">'+(g?"Tu semestre actual (tócalo para cambiarlo):":"<b>¿En qué semestre estás?</b> Así apareces en la clasificación de tu semestre y tu docente ve tu avance.")+"</p>"+
      '<div class="pa-grid" role="radiogroup" aria-label="Semestre">'+btns+"</div>"+
      (g?'<div class="pa-c">'+(cs.length?cs.map(function(t){ return '<button type="button" class="pa-course" data-track="'+t.id+'" data-view="lecciones"><small>Tu curso</small><b>'+gh(t.label)+"</b><em>Ir a las lecciones →</em></button>"; }).join(""):'<p class="pa-note">Este semestre no tiene un curso de francés en PLEX PLAY: puedes practicar cualquier curso desde Lecciones.</p>')+
        '<button type="button" class="pa-clear" data-pgrp="">Quitar semestre</button></div>':"")+"</div>";
  }
  function inject(){
    if(view!=="perfil") return;
    var v=document.getElementById("view"), head=v&&v.querySelector(".gperfil .prof-head"); if(!head) return;
    var old=v.querySelector(".plx-acad"); if(old) old.remove();
    head.insertAdjacentHTML("afterend",card());
    var G=gEnsure(), sub=head.querySelector(".ph-sub");
    if(sub&&G.grp&&!sub.querySelector(".pa-chip")) sub.insertAdjacentHTML("beforeend",' <span class="pa-chip">🎓 Semestre '+G.grp+"</span>");
  }
  var _rd=render; render=function(){ var r=_rd.apply(this,arguments); try{ inject(); }catch(e){} return r; };
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-pgrp]"); if(!b) return;
    e.preventDefault();
    var G=gEnsure(), v=b.dataset.pgrp;
    if(String(G.grp||"")===v) return;
    G.grp=v; save(!0); try{ typeof gPush==="function"&&gPush(!0); }catch(x){}
    try{ typeof SFX!=="undefined"&&SFX.ok&&SFX.ok(); }catch(x){}
    toast(v?"Semestre "+v+" guardado":"Semestre quitado"); render();
  });
  /* el curso del semestre también abre su pestaña en Lecciones */
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest(".pa-course"); if(!b) return;
    e.preventDefault(); e.stopPropagation();
    try{ track=b.dataset.track; lsSet("cr-track",track); }catch(x){}
    go("lecciones");
  },true);
  var css=`
  .plx-acad{padding:16px!important;margin:0 0 14px!important;display:grid;gap:10px;border:2px solid transparent}
  .plx-acad.empty{border-color:#facc15;box-shadow:0 0 0 4px rgba(250,204,21,.18),0 14px 30px -22px rgba(30,58,138,.6)!important;animation:paGlow 2.4s ease-in-out infinite}
  @keyframes paGlow{50%{box-shadow:0 0 0 7px rgba(250,204,21,.10),0 14px 30px -22px rgba(30,58,138,.6)}}
  .pa-h{display:flex;align-items:center;gap:12px}
  .pa-i{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;font-size:24px;background:linear-gradient(180deg,#3274f2,#1e3a8a);box-shadow:0 3px 0 #172b6b;flex:none}
  .pa-h h2{margin:0;font-size:1.1rem}.pa-h small{color:var(--stone);font-size:.8rem}
  .pa-now{margin-left:auto;padding:7px 12px;border-radius:999px;background:#facc15;color:#1e3a8a;font-weight:900;font-size:.9rem;box-shadow:0 3px 0 #c9a10c;white-space:nowrap}
  .pa-now.none{background:var(--surf3);color:var(--stone);box-shadow:none}
  .pa-q{margin:0;font-size:.9rem;color:var(--stone);line-height:1.4}.pa-q b{color:var(--ink)}
  .pa-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:6px}
  .pa-grid button{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;padding:10px 0;border-radius:12px;font-weight:900;font-size:1rem;background:var(--surf3);color:var(--stone);border-bottom:3px solid transparent;transition:transform .12s,background .2s}
  .pa-grid button:hover{transform:translateY(-2px)}
  .pa-grid button:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}
  .pa-grid button[aria-pressed=true]{background:linear-gradient(180deg,#3274f2,#2563eb);color:#fff;border-bottom-color:#1e3a8a;transform:translateY(-2px)}
  .pa-c{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .pa-course{all:unset;box-sizing:border-box;cursor:pointer;flex:1 1 220px;display:grid;gap:1px;padding:10px 14px;border-radius:16px;background:#eef4ff;border:1.5px solid #cfe0ff}
  .pa-course small{font-size:.72rem;font-weight:900;letter-spacing:.04em;text-transform:uppercase;color:#2563eb}.pa-course b{font-size:1rem}.pa-course em{font-style:normal;font-size:.8rem;color:#2563eb;font-weight:700}
  .pa-clear{all:unset;cursor:pointer;font-size:.8rem;color:var(--stone);text-decoration:underline;padding:4px}
  .pa-note{margin:0;font-size:.85rem;color:var(--stone)}
  .pa-chip{display:inline-block;margin-left:4px;padding:2px 9px;border-radius:999px;background:#fef3c7;color:#854d0e;font-weight:800;font-size:.8rem;white-space:nowrap}
  html[data-theme=dark] .pa-course{background:#16233d;border-color:#2b3f66}
  html[data-theme=dark] .pa-chip{background:#3a2f0b;color:#fde68a}
  @media (max-width:560px){.pa-grid{grid-template-columns:repeat(5,1fr)}.pa-h h2{font-size:1rem}}
  @media (prefers-reduced-motion:reduce){.plx-acad.empty{animation:none}}
  `;
  var st=document.createElement("style"); st.id="plx27"; st.textContent=css; document.head.appendChild(st);
})();
