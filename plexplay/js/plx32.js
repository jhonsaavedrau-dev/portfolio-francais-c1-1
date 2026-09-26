/* PLEX PLAY 1.15 — Más gatos: 18 pelajes nuevos (sólidos, atigrados, bicolor, carey, colorpoint, fantasía) y 6 accesorios */
(function(){
  "use strict";
  if(typeof COATS==="undefined"||typeof catSVG!=="function") return;
  var NEW={
    esmoquin:{n:"Esmoquin",c:"#2B2D3A",d:"#1C1D26",b:"#FFFFFF",m:"#FFFFFF",ear:"#7E5B6B",eye:"#9BD06A",st:0,dark:1},
    azul:{n:"Azul ruso",c:"#8E9DB3",d:"#6B7A90",b:"#DCE2EB",m:"#E8ECF2",ear:"#C9A3B3",eye:"#5FC389",st:0},
    crema:{n:"Crema",c:"#F3D9AE",d:"#DDB57C",b:"#FFF6E6",m:"#FFF8EC",ear:"#F6B8A8",eye:null,st:1},
    chocolate:{n:"Chocolate",c:"#86593A",d:"#5A3A25",b:"#CFA98B",m:"#DDBDA2",ear:"#B07F6B",eye:"#E8B44A",st:0},
    lila:{n:"Lila",c:"#CDBDC8",d:"#A895A3",b:"#F1EAEF",m:"#F6F1F4",ear:"#E3A9BD",eye:"#8FB5E8",st:0},
    plateado:{n:"Plateado",c:"#D6DBE3",d:"#5E6675",b:"#F5F7FA",m:"#FFFFFF",ear:"#F4AFBD",eye:"#57B36B",st:1},
    canela:{n:"Canela",c:"#C98150",d:"#9A5530",b:"#F2D3B6",m:"#F6DFC8",ear:"#E89A86",eye:"#D2A93A",st:0,pat:"tick"},
    bombay:{n:"Bombay",c:"#1F2029",d:"#121218",b:"#2C2D38",m:"#2C2D38",ear:"#5C4250",eye:"#E07B2A",st:0,dark:1},
    bicolor:{n:"Naranja y blanco",c:"#F6A24B",d:"#D7772A",b:"#FFFFFF",m:"#FFFFFF",ear:"#F6AE9C",eye:"#8CC152",st:1,pat:"bib"},
    carey:{n:"Carey",c:"#3B302C",d:"#2A211E",b:"#4A3D38",m:"#5A4A42",ear:"#8A5E52",eye:"#E8B44A",st:0,dark:1,pat:"tort"},
    vaca:{n:"Vaquita",c:"#FBFAF7",d:"#2B2D3A",b:"#FFFFFF",m:"#FFFFFF",ear:"#F4AFBD",eye:"#6FA8DC",st:0,pat:"spots"},
    van:{n:"Van turco",c:"#FBFAF7",d:"#E08A3C",b:"#FFFFFF",m:"#FFFFFF",ear:"#F4AFBD",eye:"#E8B44A",st:0,pat:"van"},
    humo:{n:"Humo",c:"#5E6372",d:"#3F4350",b:"#8C91A0",m:"#A0A5B2",ear:"#9C7F8C",eye:"#F2C94C",st:0},
    bengali:{n:"Bengalí",c:"#E8B56C",d:"#6E4320",b:"#FBEBD2",m:"#FFF4E2",ear:"#E9A58E",eye:"#7BC96F",st:0,pat:"ros"},
    sphynx:{n:"Esfinge",c:"#ECC9B7",d:"#D2A08A",b:"#F5DED2",m:"#F7E5DB",ear:"#E7A7A0",eye:"#7FC6C0",st:0,pat:"wrinkle"},
    galaxia:{n:"Galaxia",c:"#4C3799",d:"#2F2168",b:"#7D63D6",m:"#9580E3",ear:"#F0A7D8",eye:"#7DF9FF",st:0,dark:1,pat:"stars",req:{lvl:15}},
    dorado:{n:"Dorado",c:"#F4C95D",d:"#D19A1F",b:"#FFF3C4",m:"#FFF6D6",ear:"#F6B88A",eye:"#3AA7FF",st:1,pat:"gold",req:{streak:14}},
    lava:{n:"Lava",c:"#3A1C1C",d:"#220F0F",b:"#5A2A22",m:"#6B3328",ear:"#B5533A",eye:"#FFB020",st:0,dark:1,pat:"lava",req:{duel:5}}
  };
  Object.keys(NEW).forEach(function(k){ if(!COATS[k]) COATS[k]=NEW[k]; });

  function pattern(k){
    var d=k.d, P={head:"",body:""};
    if(k.pat==="tort"){ P.head='<path d="M40 92 Q46 58 80 50 Q78 72 62 84 Q52 94 40 92Z" fill="#D9782F"/><path d="M118 52 Q140 58 154 80 Q140 84 128 72Z" fill="#E7A04E"/><circle cx="100" cy="60" r="7" fill="#D9782F"/><path d="M132 118 q10 -8 22 -2 q-4 12 -16 12z" fill="#D9782F"/>'; P.body='<path d="M58 150 q14 -14 30 -4 q-2 18 -20 22 q-12 -4 -10 -18z" fill="#D9782F"/><path d="M118 176 q12 -16 28 -6 q2 14 -12 20 q-12 0 -16 -14z" fill="#E7A04E"/>'; }
    if(k.pat==="spots"){ P.head='<ellipse cx="66" cy="66" rx="18" ry="13" fill="'+d+'" transform="rotate(-20 66 66)"/><ellipse cx="136" cy="62" rx="11" ry="8" fill="'+d+'" transform="rotate(15 136 62)"/>'; P.body='<ellipse cx="72" cy="158" rx="15" ry="11" fill="'+d+'"/><ellipse cx="134" cy="170" rx="12" ry="9" fill="'+d+'"/>'; }
    if(k.pat==="van"){ P.head='<path d="M48 78 Q52 50 84 46 Q86 62 72 74 Q60 82 48 78Z" fill="'+d+'"/><path d="M152 78 Q148 50 116 46 Q114 62 128 74 Q140 82 152 78Z" fill="'+d+'"/>'; }
    if(k.pat==="bib"){ P.head='<path d="M100 76 L88 128 Q100 136 112 128 Z" fill="#FFFFFF"/>'; }
    if(k.pat==="ros"){ var r=function(x,y,s){ return '<circle cx="'+x+'" cy="'+y+'" r="'+s+'" fill="#B9793C"/><circle cx="'+x+'" cy="'+y+'" r="'+(s-2.4)+'" fill="none" stroke="'+d+'" stroke-width="2.4"/>'; };
      P.head=r(62,74,6)+r(138,74,6)+r(100,58,5)+r(82,64,4)+r(118,64,4); P.body=r(66,150,7)+r(86,164,6)+r(134,150,7)+r(116,170,6)+r(144,172,5); }
    if(k.pat==="tick"){ P.head='<path d="M88 48 q4 8 0 16 M100 45 v18 M112 48 q-4 8 0 16" stroke="'+d+'" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>'; }
    if(k.pat==="wrinkle"){ P.head='<path d="M82 56 q18 -6 36 0 M86 64 q14 -5 28 0 M90 72 q10 -4 20 0" stroke="'+d+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>'; P.body='<path d="M70 146 q30 -8 60 0" stroke="'+d+'" stroke-width="2.4" fill="none"/>'; }
    if(k.pat==="stars"){ var s=function(x,y,z){ return '<path d="M'+x+' '+(y-z)+' l'+(z*.3)+' '+(z*.7)+' '+(z*.7)+' '+(z*.3)+' -'+(z*.7)+' '+(z*.3)+' -'+(z*.3)+' '+(z*.7)+' -'+(z*.3)+' -'+(z*.7)+' -'+(z*.7)+' -'+(z*.3)+' '+(z*.7)+' -'+(z*.3)+'z" fill="#FFF7C2"/>'; };
      P.head=s(64,66,6)+s(136,70,5)+s(100,54,4)+'<circle cx="118" cy="60" r="1.8" fill="#fff"/><circle cx="80" cy="54" r="1.6" fill="#fff"/><circle cx="148" cy="92" r="1.6" fill="#fff"/>'; P.body=s(70,154,6)+s(132,164,7)+'<circle cx="90" cy="176" r="1.8" fill="#fff"/><circle cx="118" cy="146" r="1.6" fill="#fff"/><circle cx="60" cy="172" r="1.6" fill="#fff"/>'; }
    if(k.pat==="gold"){ P.head='<path d="M58 58 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z M144 60 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#FFFFFF" opacity=".9"/>'; P.body='<path d="M140 150 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFFFFF" opacity=".9"/>'; }
    if(k.pat==="lava"){ var c='stroke="#FF7A1A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"'; P.head='<path d="M52 80 l10 6 -4 8 12 4 M150 78 l-10 8 6 6 -12 6 M96 52 l6 8 -6 6" '+c+'/>'; P.body='<path d="M62 150 l12 6 -2 10 12 4 M140 148 l-10 10 8 6 -10 8" '+c+'/>'; }
    return P;
  }

  var _cs=catSVG;
  catSVG=function(g,o){
    g=g||{}; var k=COATS[g.coat];
    if(!k||!NEW[g.coat]) return _cs(g,o);
    var out;
    if(k.dark){
      var N=COATS.negro, bak={}; Object.keys(N).forEach(function(x){ bak[x]=N[x]; });
      ["c","d","b","m","ear","eye","st"].forEach(function(x){ N[x]=k[x]; });
      try{ out=_cs(Object.assign({},g,{coat:"negro"}),o); } finally{ Object.keys(N).forEach(function(x){ if(!(x in bak)) delete N[x]; }); Object.keys(bak).forEach(function(x){ N[x]=bak[x]; }); }
    } else out=_cs(g,o);
    if(k.pat){
      var P=pattern(k), hs='<ellipse cx="100" cy="96" rx="64" ry="54" fill="'+k.c+'"/>', bs='<ellipse cx="100" cy="158" rx="50" ry="38" fill="'+k.c+'"/>';
      if(P.head) out=out.replace(hs,hs+P.head);
      if(P.body) out=out.replace(bs,bs+P.body);
    }
    return out;
  };

  /* accesorios nuevos */
  var ITEMS2=[
    {id:"lazo",slot:"ears",n:"Lazo"},
    {id:"flor",slot:"ears",n:"Flor",req:{lvl:3}},
    {id:"gorra",slot:"hat",n:"Gorra",req:{lvl:8}},
    {id:"gafassol",slot:"face",n:"Gafas de sol",req:{streak:3}},
    {id:"pajarita",slot:"tie",n:"Pajarita",req:{lvl:12}},
    {id:"birrete",slot:"hat",n:"Birrete",req:{lvl:35}}
  ];
  try{ ITEMS2.forEach(function(it){ if(!GITEMS.some(function(x){ return x.id===it.id; })) GITEMS.push(it); }); }catch(e){}
  var ACC={
    lazo:'<g transform="rotate(-18 150 40)"><path d="M150 40 l-20 -12 v24z M150 40 l20 -12 v24z" fill="#EC6FA5" stroke="#C94F86" stroke-width="2" stroke-linejoin="round"/><circle cx="150" cy="40" r="6" fill="#C94F86"/></g>',
    flor:'<g transform="translate(146 44)"><circle cx="0" cy="-9" r="7" fill="#FDE68A"/><circle cx="9" cy="-2" r="7" fill="#FDE68A"/><circle cx="5" cy="8" r="7" fill="#FDE68A"/><circle cx="-6" cy="8" r="7" fill="#FDE68A"/><circle cx="-9" cy="-2" r="7" fill="#FDE68A"/><circle r="5.5" fill="#F59E0B"/></g>',
    gorra:'<path d="M50 60 Q54 24 100 22 Q146 24 150 60 Z" fill="#2563EB"/><path d="M50 60 Q100 50 150 60 L150 64 Q100 56 50 64Z" fill="#1E40AF"/><path d="M118 60 Q160 56 178 66 Q160 72 128 66Z" fill="#1E3A8A"/><circle cx="100" cy="24" r="4" fill="#1E40AF"/><path d="M92 42 h16" stroke="#FACC15" stroke-width="4" stroke-linecap="round"/>',
    gafassol:'<g fill="#111827"><path d="M54 94 h38 q0 20 -19 20 q-19 0 -19 -20z"/><path d="M108 94 h38 q0 20 -19 20 q-19 0 -19 -20z"/></g><path d="M92 97 Q100 92 108 97 M54 95 L40 90 M146 95 L160 90" stroke="#111827" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M60 99 l10 -3 M114 99 l10 -3" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-linecap="round"/>',
    pajarita:'<path d="M100 146 l-22 -11 v22z M100 146 l22 -11 v22z" fill="#E0463A" stroke="#B42318" stroke-width="2" stroke-linejoin="round"/><rect x="94" y="140" width="12" height="12" rx="3" fill="#B42318"/>',
    birrete:'<path d="M100 20 L164 42 L100 62 L36 42 Z" fill="#1F2937"/><path d="M70 50 V64 Q100 76 130 64 V50 L100 60Z" fill="#111827"/><path d="M160 44 V74" stroke="#FACC15" stroke-width="3"/><circle cx="160" cy="76" r="5" fill="#FACC15"/><circle cx="100" cy="41" r="3" fill="#FACC15"/>'
  };
  var _cs2=catSVG;
  catSVG=function(g,o){
    var a=(g&&g.acc)||{}, add="", gg=g;
    if(a.ears==="lazo"||a.ears==="flor"){ add+=ACC[a.ears]; }
    if(a.hat==="gorra"||a.hat==="birrete"){ add+=ACC[a.hat]; }
    if(a.face==="gafassol"){ add+=ACC.gafassol; }
    if(a.tie==="pajarita"){ add+=ACC.pajarita; }
    var out=_cs2(gg,o); if(!add) return out;
    var i=out.lastIndexOf("</svg>"); return i<0?out:out.slice(0,i)+add+out.slice(i);
  };

  /* pelajes con requisito: candado en el selector */
  function lockCoats(){
    if(typeof view==="undefined"||view!=="perfil") return;
    document.querySelectorAll('#view .ctile[data-g="coat"]').forEach(function(t){
      var k=COATS[t.dataset.arg]; if(!k||!k.req||t.dataset.lk) return; t.dataset.lk=1;
      var ok=false; try{ ok=reqOk(k.req); }catch(e){}
      if(!ok){ t.classList.add("locked"); t.insertAdjacentHTML("beforeend","<em>🔒 "+(typeof reqTxt==="function"?reqTxt(k.req):"")+"</em>"); }
      else t.insertAdjacentHTML("beforeend",'<em class="new">★ especial</em>');
    });
  }
  document.addEventListener("click",function(e){
    var t=e.target.closest&&e.target.closest('.ctile.locked[data-g="coat"]'); if(!t) return;
    e.preventDefault(); e.stopPropagation(); var k=COATS[t.dataset.arg]; toast("Se desbloquea con: "+(typeof reqTxt==="function"?reqTxt(k.req):""));
  },true);
  var _rd=render; render=function(){ var r=_rd.apply(this,arguments); try{ lockCoats(); }catch(e){} return r; };
  var st=document.createElement("style"); st.id="plx32"; st.textContent='.ctile em.new{font-style:normal;font-size:.62rem;font-weight:900;color:#b45309}';
  document.head.appendChild(st);
})();
