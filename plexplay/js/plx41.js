/* PLEX PLAY 1.20 — Computador: Inicio, Lecciones y Perfil aprovechan mejor la pantalla ancha */
(function(){
  "use strict";
  if(typeof render!=="function") return;
  /* los accesos de Sonidos y Vocabulario van lado a lado en pantallas anchas */
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{
      if(view==="lecciones"){
        var a=document.querySelector("#view .snd-banner"), b=document.querySelector("#view .v2-banner");
        var list=[a,b].filter(Boolean);
        if(list.length&&!(list[0].parentNode&&list[0].parentNode.classList.contains("lx-xtra"))){
          var w=document.createElement("div"); w.className="lx-xtra"+(list.length>1?" two":"");
          list[0].parentNode.insertBefore(w,list[0]); list.forEach(function(x){ w.appendChild(x); });
        }
      }
    }catch(e){}
    return r;
  };

  var css=`
  @media (min-width:1000px){
    /* ---------- Inicio ---------- */
    .ghome{max-width:1240px!important;margin-left:auto!important;margin-right:auto!important;grid-template-columns:minmax(0,1fr) 360px!important;gap:24px!important}
    .ghome .gmain{min-width:0}
    .ghome .gmain>.gcard{width:auto!important;max-width:none!important}
    .ghome .gside{position:sticky;top:96px;align-self:start}
    .ghome .greet{padding:22px 24px!important;border-radius:24px!important;background:linear-gradient(120deg,#eef2ff,#fdf2f8 60%,#fefce8)!important;border:1.5px solid #e0e7ff!important;box-shadow:0 18px 34px -30px rgba(30,58,138,.7)!important}
    .ghome .greet h1{font-size:2rem!important}
    html[data-theme=dark] .ghome .greet{background:linear-gradient(120deg,#1b2340,#2a1b33 60%,#2a2614)!important;border-color:#2f3b66!important}
    .ghome .gmain>.gcard,.ghome .gside>.gcard{transition:box-shadow .2s,transform .2s}
    .ghome .gmain>.gcard:hover,.ghome .gside>.gcard:hover{box-shadow:0 22px 40px -30px rgba(30,58,138,.75)}
    .ghome .m-course{min-height:200px}.ghome .m-course .mc-img{min-height:200px}
    .ghome .m-course .mc-t b{font-size:1.45rem}
    .ghome .am-today .amt{min-height:118px;transition:transform .15s}.ghome .am-today .amt:hover{transform:translateY(-2px)}
    .ghome .pf-row{gap:14px!important}

    /* ---------- Lecciones ---------- */
    .gpath.lx{max-width:1240px!important;margin-left:auto!important;margin-right:auto!important}
    .lx-xtra{display:grid;gap:14px;margin:14px 0 4px}.lx-xtra.two{grid-template-columns:1fr 1fr}
    .lx-xtra>button{margin:0!important;height:100%}
    .gpath.lx>.lx-u .lx-unit{min-height:96px;transition:transform .15s,box-shadow .15s}
    .gpath.lx>.lx-u:not(.open) .lx-unit:hover{transform:translateY(-2px);box-shadow:0 18px 30px -24px rgba(30,58,138,.7)}
    
    /* ---------- Perfil ---------- */
    .gperfil{max-width:1240px!important;margin-left:auto!important;margin-right:auto!important}
    .gperfil .plx-acad{width:auto!important;max-width:none!important;display:grid;grid-template-columns:minmax(260px,1fr) minmax(420px,1.3fr);column-gap:24px;align-items:center}
    .gperfil .plx-acad .pa-h{grid-column:1}.gperfil .plx-acad .pa-q{grid-column:1;margin:8px 0 0}
    .gperfil .plx-acad .pa-grid{grid-column:2;grid-row:1/span 2}
    .gperfil .plx-acad>*:not(.pa-h):not(.pa-q):not(.pa-grid){grid-column:1/-1}
    .gperfil .prof-head .ph-stats{max-width:720px;gap:14px!important}
    .gperfil .prof-head .ph-stats>span{padding:14px 10px!important;border-radius:18px!important;transition:transform .15s}
    .gperfil .prof-head .ph-stats>span:hover{transform:translateY(-2px)}
    .gperfil .prof-head .ph-stats b,.gperfil .prof-head .ph-stats strong{font-size:1.5rem!important}
    .gperfil .ptabs button{justify-content:center!important;text-align:center!important;font-size:.95rem!important}
    .gperfil .ptab-body>.gcard{margin-bottom:16px}
  }
  `;
  var st=document.createElement("style"); st.id="plx41"; st.textContent=css; document.head.appendChild(st);
})();
