/* PLEX PLAY 1.12 — dictado: la puntuación cuenta solo si se dicta; corrección completa o por grupos */
(function(){
  "use strict";
  if(typeof dEval!=="function"||typeof dzCheck!=="function") return;
  var q=function(s){return document.querySelector(s)};
  var PREFIX=0, FORCE_FULL=false;

  /* 1) evaluación: prefijo de grupos y puntuación no dictada sin puntos */
  var _ev=dEval;
  dEval=function(ref,hyp,alts){
    var d=dz();
    if(PREFIX&&d){
      if(ref===d.segs.join(" ")) ref=d.segs.slice(0,PREFIX).join(" ");
      else if(d.alt&&ref===d.alt) return {ops:[],errs:[],total:1e9};
    }
    var r=_ev.call(this,ref,hyp,alts);
    if(!DZ.punct&&r&&r.errs){
      var free=0;
      r.errs=r.errs.filter(function(e){ if(e.c==="ponct"){ free++; r.ops[e.k].free=1; return false; } return true; });
      r.total=Math.max(0,r.total-free*DCAT.ponct[1]); r.freePunct=free;
    }
    return r;
  };
  if(_ev.lastSpelled!==undefined) dEval.lastSpelled=_ev.lastSpelled;

  /* ¿hasta qué grupo llega lo escrito? el prefijo con menos errores (empates → el más largo) */
  function coverage(hyp){
    var d=dz(), n=d.segs.length, best=n, bt=Infinity, sv=PREFIX;
    for(var k=1;k<=n;k++){ PREFIX=k; var t=dEval(d.segs.join(" "),hyp,d.alts).total; if(t<=bt){ bt=t; best=k; } }
    PREFIX=sv; return best;
  }

  /* 2) corregir: si solo escribiste una parte, se corrige hasta donde llegaste */
  var _ck=dzCheck;
  dzCheck=function(){
    var d=dz(), ta=q("#dtx"), hyp=ta?ta.value:"", n=d.segs.length;
    if(!hyp.trim()||words(hyp)<3) return _ck.apply(this,arguments);
    var k=FORCE_FULL?n:coverage(hyp); FORCE_FULL=false;
    if(k>=n){ PREFIX=0; var r0=_ck.apply(this,arguments); if(DZ.res) DZ.res.partial=null; return r0; }
    var prev=S.dictees&&S.dictees[d.id]?JSON.parse(JSON.stringify(S.dictees[d.id])):null, xp=S.xp;
    PREFIX=k;
    try{ _ck.apply(this,arguments); } finally{ PREFIX=0; }
    /* una corrección parcial no cuenta como nota del dictado completo */
    S.dictees=S.dictees||{}; if(prev) S.dictees[d.id]=prev; else delete S.dictees[d.id];
    try{ var gain=S.xp-xp; if(gain>3){ S.xp-=gain-3; var t=today(); t.xp-=gain-3; } save(!0); }catch(e){}
    if(DZ.res){ DZ.res.partial={k:k,n:n}; }
    render(); var res=q("#dzres"); res&&res.scrollIntoView({behavior:"smooth",block:"start"});
  };

  /* 3) resultado: aviso de corrección parcial y de puntuación no dictada */
  var _rh=dzResultHTML;
  dzResultHTML=function(){
    var html=_rh.apply(this,arguments), r=DZ.res||{}, add="";
    if(r.partial) add+='<div class="plx-dzp"><b>Corrección por grupos: del 1 al '+r.partial.k+' de '+r.partial.n+'.</b> La nota es solo de lo que escribiste; no se guarda como nota del dictado. <button class="btn line" data-dzx="fullcheck">Corregir como dictado completo</button></div>';
    if(r.freePunct) add+='<div class="plx-dzp soft">Puntuación <b>no dictada</b>: te marcamos '+r.freePunct+' signo(s) como guía, pero no restan puntos.</div>';
    return add+html;
  };

  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest('[data-dzx="fullcheck"]');
    if(b){ e.preventDefault(); FORCE_FULL=true; dzCheck(); return; }
    /* 4) elegir un grupo tocando su punto */
    var i=e.target.closest&&e.target.closest("#dzdots i");
    if(i&&view==="dictee"){ var idx=[].indexOf.call(i.parentNode.children,i); if(idx>=0){ e.preventDefault(); dzSeg(idx); } }
  },true);

  var css=`
  #dzdots i{cursor:pointer;position:relative}
  #dzdots i::after{content:"";position:absolute;inset:-8px}
  #dzdots i:hover{transform:scale(1.35)}
  .plx-dzp{margin:12px 0 0;padding:10px 12px;border-radius:14px;background:#eef4ff;border:1px solid #cfe0ff;color:#23324d;font-size:.9rem;line-height:1.45}
  .plx-dzp.soft{background:#f5f3ff;border-color:#ddd6fe;color:#3b2f6b}
  .plx-dzp .btn{margin-top:8px;display:inline-flex}
  .plx-dzhint{grid-column:1/-1;margin:2px 0 0;font-size:.78rem;color:var(--stone)}
  html[data-theme=dark] .plx-dzp{background:#16233d;border-color:#2b3f66;color:#d6e2ff}
  html[data-theme=dark] .plx-dzp.soft{background:#221c3d;border-color:#3f3470;color:#e4dcff}
  `;
  var st=document.createElement("style"); st.id="plx25"; st.textContent=css; document.head.appendChild(st);

  /* 5) explicación visible junto al ajuste de puntuación */
  function hint(){
    if(view!=="dictee") return;
    var seg=q('#dzset [aria-label="Puntuación"]'); if(!seg) return;
    var row=seg.closest(".setrow"); if(!row) return;
    var p=row.querySelector(".plx-dzhint"); if(!p){ p=document.createElement("p"); p.className="plx-dzhint"; row.appendChild(p); }
    p.textContent=DZ.punct?"Dictada: se leen los signos («virgule», «point»…) y cada signo que falte resta ½ punto.":"No dictada: no se leen los signos y no restan puntos; solo te los mostramos como guía.";
    var dots=q("#dzdots"); if(dots) dots.title="Toca un punto para escuchar ese grupo";
  }
  var _rd=render; render=function(){ var r=_rd.apply(this,arguments); try{ hint(); }catch(e){} return r; };
  document.addEventListener("click",function(e){ if(e.target.closest&&e.target.closest("[data-dzset]")) setTimeout(hint,0); });
})();
