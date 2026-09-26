/* PLEX PLAY 1.16 — Nuevo diseño de los gatos: ilustración detallada (contorno, sombreado, ojos grandes con brillos,
   mejillas con pelo, orejas con mechones, uniforme PLEX PLAY). Los accesorios existentes se conservan. */
(function(){
  "use strict";
  if(typeof catSVG!=="function"||typeof COATS==="undefined") return;
  var ORIG=catSVG, UID=0;

  /* ---------- color ---------- */
  function hex(h){ h=String(h||"#999").replace("#",""); if(h.length===3) h=h.split("").map(function(x){return x+x}).join(""); var n=parseInt(h,16); return [n>>16&255,n>>8&255,n&255]; }
  function toHex(a){ return "#"+a.map(function(v){ v=Math.max(0,Math.min(255,Math.round(v))); return ("0"+v.toString(16)).slice(-2); }).join(""); }
  function mix(a,b,t){ var A=hex(a),B=hex(b); return toHex([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t]); }
  function lum(h){ var a=hex(h).map(function(v){ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }); return .2126*a[0]+.7152*a[1]+.0722*a[2]; }
  var EYES={gris:"#86B55B",naranja:"#8DBB4E",blanco:"#4F9BE8",calico:"#D9A441",crema:"#86B55B",plateado:"#57B36B"};

  /* ---------- accesorios: se extraen del dibujo anterior comparando con y sin accesorios ---------- */
  var CACHE={};
  function toks(s){ return s.match(/<[^>]+>/g)||[]; }
  function accParts(acc,mood,sparkle){
    var key=JSON.stringify([acc,mood,!!sparkle]); if(CACHE[key]) return CACHE[key];
    var A=Object.assign({},acc); var bodyOff=A.body==="sin";
    var base=toks(ORIG({coat:"blanco",acc:{body:A.body}},{mood:mood})), full=toks(ORIG({coat:"blanco",acc:A},{mood:mood,sparkle:sparkle}));
    var n=base.length,m=full.length, L=[]; for(var i=0;i<=n;i++){ L.push(new Uint16Array(m+1)); }
    for(i=n-1;i>=0;i--) for(var j=m-1;j>=0;j--) L[i][j]=base[i]===full[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
    var bodyIdx=base.findIndex(function(t){ return /<ellipse cx="100" cy="158"/.test(t); });
    var back=[],front=[]; i=0; j=0;
    while(j<m){
      if(i<n&&base[i]===full[j]){ i++; j++; }
      else if(i<n&&L[i+1][j]>=L[i][j+1]){ i++; }
      else { (i<=bodyIdx?back:front).push(full[j]); j++; }
    }
    var r={back:back.join(""),front:front.join("").replace(/<\/svg>/g,"")};
    var ks=Object.keys(CACHE); if(ks.length>300) CACHE={};
    CACHE[key]=r; return r;
  }

  /* ---------- dibujo del gato ---------- */
  var HEAD="M100 42 C 132 42 156 58 162 84 C 164 92 170 98 168 104 C 172 108 166 114 164 116 C 168 120 160 126 156 128 C 146 144 126 152 100 152 C 74 152 54 144 44 128 C 40 126 32 120 36 116 C 34 114 28 108 32 104 C 30 98 36 92 38 84 C 44 58 68 42 100 42 Z";
  var BODY="M60 188 C 52 160 66 132 100 128 C 134 132 148 160 140 188 Z";
  var EARL="M42 86 C 32 58 32 30 46 12 C 52 8 58 9 64 15 C 76 28 88 40 96 52 Z", EARR="M158 86 C 168 58 168 30 154 12 C 148 8 142 9 136 15 C 124 28 112 40 104 52 Z";
  var EARLI="M51 74 C 46 52 47 34 53 24 C 62 30 73 40 84 52 Z", EARRI="M149 74 C 154 52 153 34 147 24 C 138 30 127 40 116 52 Z";

  function drawCat(g,o){
    g=g||{}; o=o||{}; var k=COATS[g.coat]||COATS.gris, a=g.acc||{}, mood=o.mood||"happy", id="c"+(++UID);
    var dark=lum(k.c)<.08, OL=dark?mix(k.c,"#000",.45):mix(k.c,"#3a2a35",.42), FACE=dark?"#F4F1F7":"#2A2330";
    var c=k.c, cl=mix(c,"#FFFFFF",dark?.18:.45), cd=mix(c,"#000000",dark?.35:.16), iris=k.eye||EYES[g.coat]||"#86B55B";
    var patch=k.pts?k.d:null;
    var s='<svg viewBox="0 0 200 200" class="cat '+(o.cls||"")+'" role="img" aria-label="'+(o.label||"Gato")+'" xmlns="http://www.w3.org/2000/svg">';
    s+='<defs>'+
      '<radialGradient id="'+id+'h" cx="42%" cy="34%" r="75%"><stop offset="0" stop-color="'+cl+'"/><stop offset=".55" stop-color="'+c+'"/><stop offset="1" stop-color="'+cd+'"/></radialGradient>'+
      '<radialGradient id="'+id+'b" cx="45%" cy="25%" r="85%"><stop offset="0" stop-color="'+cl+'"/><stop offset=".6" stop-color="'+c+'"/><stop offset="1" stop-color="'+cd+'"/></radialGradient>'+
      '<linearGradient id="'+id+'e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+mix(k.ear,"#fff",.25)+'"/><stop offset="1" stop-color="'+mix(k.ear,"#b0506a",.25)+'"/></linearGradient>'+
      '<radialGradient id="'+id+'i" cx="50%" cy="70%" r="70%"><stop offset="0" stop-color="'+mix(iris,"#fff",.45)+'"/><stop offset=".55" stop-color="'+iris+'"/><stop offset="1" stop-color="'+mix(iris,"#000",.45)+'"/></radialGradient>'+
      '<radialGradient id="'+id+'k"><stop offset="0" stop-color="#FF7F9B" stop-opacity=".7"/><stop offset="1" stop-color="#FF7F9B" stop-opacity="0"/></radialGradient>'+
      '<linearGradient id="'+id+'u" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B3A6B"/><stop offset="1" stop-color="#16203F"/></linearGradient>'+
      (patch?'<radialGradient id="'+id+'p" cx="50%" cy="62%" r="42%"><stop offset="0" stop-color="'+patch+'"/><stop offset=".7" stop-color="'+patch+'" stop-opacity=".85"/><stop offset="1" stop-color="'+patch+'" stop-opacity="0"/></radialGradient>':"")+
      '<clipPath id="'+id+'ch"><path d="'+HEAD+'"/></clipPath><clipPath id="'+id+'cb"><path d="'+BODY+'"/></clipPath>'+
      "</defs>";
    s+='<ellipse cx="100" cy="194" rx="58" ry="6" fill="rgba(30,40,80,.13)"/>';
    /* cola */
    var tail="M140 176 C 176 178 186 140 170 112 C 166 104 172 98 178 102";
    s+='<path d="'+tail+'" fill="none" stroke="'+OL+'" stroke-width="19" stroke-linecap="round"/><path d="'+tail+'" fill="none" stroke="'+(patch||c)+'" stroke-width="14" stroke-linecap="round"/>';
    if(k.st) s+='<path d="M178 150 l9 -3 M180 128 l9 -1 M170 112 l7 -5" stroke="'+k.d+'" stroke-width="4.5" stroke-linecap="round"/>';
    s+='<!--BACK-->';
    /* cuerpo */
    s+='<path d="'+BODY+'" fill="url(#'+id+'b)" stroke="'+OL+'" stroke-width="2.6" stroke-linejoin="round"/>';
    s+='<g clip-path="url(#'+id+'cb)">';
    if(k.st) s+='<path d="M62 150 q10 4 12 16 M138 150 q-10 4 -12 16 M60 168 q10 2 14 12 M140 168 q-10 2 -14 12" stroke="'+k.d+'" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>';
    if(k.cal) s+='<path d="M58 146 q16 -16 34 -6 q-2 22 -24 28 q-14 -6 -10 -22z" fill="#F39A43"/><path d="M118 168 q14 -18 30 -8 q4 16 -12 24 q-14 0 -18 -16z" fill="#3A3A46"/>';
    if(k.mz) s+='<path d="M118 150 q14 -18 30 -8 q6 18 -10 26 q-16 0 -20 -18z" fill="#4A3F38"/>';
    if(k.pat&&window.PLXCatPattern){ var PP=PLXCatPattern(k); s+=PP.body||""; }
    s+='<ellipse cx="100" cy="170" rx="26" ry="22" fill="'+k.b+'" opacity=".95"/>';
    s+="</g>";
    /* uniforme o collar */
    if(a.body!=="sin"){
      /* uniforme original de PLEX PLAY */
      var U="#16171D",UD="#0E0F14";
      s+='<path d="M53 136 Q39 150 42 168 L60 165 Q59 150 66 138 Z" fill="'+U+'"/><path d="M147 136 Q161 150 158 168 L140 165 Q141 150 134 138 Z" fill="'+U+'"/>';
      s+='<path d="M43 160 L60 157" stroke="#FFFFFF" stroke-width="2.6"/><path d="M43 164 L60 161" stroke="#D7263D" stroke-width="2.6"/><path d="M42.5 156 L60.5 153" stroke="#1D3B7A" stroke-width="2.6"/>';
      s+='<path d="M157 160 L140 157" stroke="#FFFFFF" stroke-width="2.6"/><path d="M157 164 L140 161" stroke="#D7263D" stroke-width="2.6"/><path d="M157.5 156 L139.5 153" stroke="#1D3B7A" stroke-width="2.6"/>';
      s+='<path d="M58 134 Q64 124 100 122 Q136 124 142 134 L148 174 Q100 186 52 174 Z" fill="'+U+'"/>';
      s+='<path d="M52 172 Q100 184 148 172 L150 186 Q130 192 112 187 L100 180 L88 187 Q70 192 50 186 Z" fill="'+UD+'"/>';
      s+='<path d="M84 124 L100 144 L116 124" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/><path d="M88 124 L100 139 L112 124" fill="none" stroke="#D7263D" stroke-width="2.4" stroke-linejoin="round"/>';
      s+='<path d="M100 144 V160" stroke="#2A2C36" stroke-width="2"/><circle cx="100" cy="150" r="1.6" fill="#E9E9EE"/><circle cx="100" cy="156" r="1.6" fill="#E9E9EE"/>';
      s+='<image href="img/escudo.webp" x="61" y="153" width="12" height="21" preserveAspectRatio="xMidYMid meet"/>';
    } else {
      s+='<path d="M72 136 Q100 150 128 136" fill="none" stroke="#1F2A4D" stroke-width="7" stroke-linecap="round"/><circle cx="100" cy="148" r="6.5" fill="#F2C94C" stroke="#B7892A" stroke-width="1.5"/><path d="M96 149 h8" stroke="#8A6414" stroke-width="1.5"/>';
    }
    /* patitas */
    var paw=patch||k.b;
    s+='<ellipse cx="80" cy="189" rx="15" ry="9" fill="'+paw+'" stroke="'+OL+'" stroke-width="2.2"/><ellipse cx="120" cy="189" rx="15" ry="9" fill="'+paw+'" stroke="'+OL+'" stroke-width="2.2"/>';
    s+='<path d="M75 186 v5 M80 186 v6 M85 186 v5 M115 186 v5 M120 186 v6 M125 186 v5" stroke="'+OL+'" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>';
    /* orejas */
    var eo=patch||c;
    s+='<path d="'+EARL+'" fill="'+eo+'" stroke="'+OL+'" stroke-width="2.6" stroke-linejoin="round"/><path d="'+EARR+'" fill="'+eo+'" stroke="'+OL+'" stroke-width="2.6" stroke-linejoin="round"/>';
    if(k.cal) s+='<path d="'+EARL+'" fill="#F39A43" stroke="'+OL+'" stroke-width="2.6"/>';
    if(k.mz) s+='<path d="'+EARL+'" fill="#8B7766" stroke="'+OL+'" stroke-width="2.6"/>';
    s+='<path d="'+EARLI+'" fill="url(#'+id+'e)"/><path d="'+EARRI+'" fill="url(#'+id+'e)"/>';
    s+='<path d="M54 70 q2 -12 10 -20 M58 74 q4 -10 12 -16 M62 76 q6 -8 14 -10 M146 70 q-2 -12 -10 -20 M142 74 q-4 -10 -12 -16 M138 76 q-6 -8 -14 -10" stroke="'+mix(k.b,"#fff",.5)+'" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".95"/>';
    /* cabeza */
    s+='<path d="M90 46 Q92 32 97 40 Q100 28 103 40 Q108 32 110 46 Z" fill="'+(k.st?k.d:c)+'" stroke="'+OL+'" stroke-width="2.2" stroke-linejoin="round"/>';
    s+='<path d="'+HEAD+'" fill="url(#'+id+'h)" stroke="'+OL+'" stroke-width="2.6" stroke-linejoin="round"/>';
    s+='<g clip-path="url(#'+id+'ch)">';
    if(k.pts) s+='<ellipse cx="100" cy="112" rx="46" ry="38" fill="url(#'+id+'p)"/>';
    if(k.cal) s+='<path d="M34 92 Q40 50 84 44 Q80 70 60 84 Q46 96 34 92Z" fill="#F39A43"/><path d="M166 96 Q162 62 132 50 Q126 72 142 88 Q154 100 166 96Z" fill="#3A3A46"/>';
    if(k.mz) s+='<path d="M32 100 Q34 50 86 44 Q84 74 64 92 Q48 106 32 100Z" fill="#8B7766"/><path d="M44 70 q10 -6 22 -8 M42 80 q10 -4 20 -4" stroke="#5E4E42" stroke-width="3" fill="none" stroke-linecap="round"/>';
    if(k.st) s+='<path d="M88 46 q6 9 1 19 M100 43 v23 M112 46 q-6 9 -1 19" stroke="'+k.d+'" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M34 96 l15 3 M34 108 l14 0 M166 96 l-15 3 M166 108 l-14 0" stroke="'+k.d+'" stroke-width="4.5" stroke-linecap="round"/>';
    if(k.pat&&window.PLXCatPattern){ var P2=PLXCatPattern(k); s+=P2.head||""; }
    s+='<path d="M40 112 q-4 6 2 12 M160 112 q4 6 -2 12 M44 122 q-2 5 3 9 M156 122 q2 5 -3 9" stroke="'+mix(c,"#fff",.5)+'" stroke-width="2" fill="none" opacity=".6"/>';
    s+='<path d="M56 70 Q70 50 96 46" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity="'+(dark?.18:.45)+'"/>';
    s+='<ellipse cx="100" cy="150" rx="46" ry="8" fill="#000" opacity=".10"/>';
    s+="</g>";
    /* hocico y mejillas */
    var mz=k.m!==k.c?k.m:mix(c,"#fff",.55);
    s+='<ellipse cx="89" cy="121" rx="15" ry="11.5" fill="'+mz+'"/><ellipse cx="111" cy="121" rx="15" ry="11.5" fill="'+mz+'"/><ellipse cx="100" cy="130" rx="10" ry="7" fill="'+mz+'"/>';
    s+='<ellipse cx="55" cy="121" rx="13" ry="8" fill="url(#'+id+'k)"/><ellipse cx="145" cy="121" rx="13" ry="8" fill="url(#'+id+'k)"/>';
    /* ojos */
    function eye(x,open){
      if(!open) return '<path d="M'+(x-13)+' 102 Q'+x+' 88 '+(x+13)+' 102" fill="none" stroke="'+FACE+'" stroke-width="4.6" stroke-linecap="round"/><path d="M'+(x-13)+' 102 l-4 2 M'+(x+13)+' 102 l4 2" stroke="'+FACE+'" stroke-width="2.4" stroke-linecap="round"/>';
      var sad=mood==="sad", cur=mood==="curious"||mood==="excited", ry=sad?13:17.5, pr=cur?7.8:6.2, sd=x<100?-1:1;
      return '<ellipse cx="'+x+'" cy="100" rx="15.5" ry="'+(ry+1.8)+'" fill="#1A1622"/>'+
        '<ellipse cx="'+x+'" cy="100.5" rx="13.4" ry="'+ry+'" fill="url(#'+id+'i)"/>'+
        '<ellipse cx="'+x+'" cy="100.5" rx="13.4" ry="'+ry+'" fill="none" stroke="'+mix(iris,"#000",.35)+'" stroke-width="1.4" opacity=".7"/>'+
        '<ellipse cx="'+x+'" cy="102" rx="'+pr+'" ry="'+(ry-4.5)+'" fill="#120F18"/>'+
        '<ellipse cx="'+(x+4.8)+'" cy="'+(sad?95:92.5)+'" rx="5.4" ry="4.6" fill="#fff"/><circle cx="'+(x-5)+'" cy="'+(sad?104:108)+'" r="2.6" fill="#fff" opacity=".9"/><circle cx="'+(x+7.5)+'" cy="'+(sad?101:103)+'" r="1.3" fill="#fff" opacity=".8"/>'+
        '<path d="M'+(x-10)+' '+(sad?110:112)+' Q'+x+' '+(sad?115:118)+' '+(x+10)+' '+(sad?110:112)+'" fill="none" stroke="#fff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>'+
        '<path d="M'+(x-14.5)+' 92 Q'+x+' '+(sad?88:80)+' '+(x+14.5)+' 92" fill="none" stroke="#1A1622" stroke-width="3" stroke-linecap="round"/>'+
        '<path d="M'+(x+sd*14.5)+' 92 l'+(sd*5)+' -4" stroke="#1A1622" stroke-width="2.6" stroke-linecap="round"/>';
    }
    if(mood==="happy") s+=eye(74,false)+eye(126,false);
    else if(mood==="wink") s+=eye(74,true)+eye(126,false);
    else s+=eye(74,true)+eye(126,true);
    if(mood==="sad") s+='<path d="M60 82 l17 5 M140 82 l-17 5" stroke="'+FACE+'" stroke-width="3.6" stroke-linecap="round"/>';
    /* nariz, boca, bigotes */
    s+='<path d="M93 111 Q100 106 107 111 Q104 117 100 118 Q96 117 93 111 Z" fill="#F07F95" stroke="'+mix("#F07F95","#000",.3)+'" stroke-width="1.2"/><ellipse cx="98" cy="110" rx="2.2" ry="1.3" fill="#fff" opacity=".7"/>';
    var mc=FACE;
    if(mood==="sad") s+='<path d="M100 118 v3 M91 128 Q100 120 109 128" fill="none" stroke="'+mc+'" stroke-width="2.6" stroke-linecap="round"/>';
    else if(mood==="excited"||mood==="wink") s+='<path d="M100 118 v3 M90 121 Q95 127 100 121 Q105 127 110 121" fill="none" stroke="'+mc+'" stroke-width="2.6" stroke-linecap="round"/><path d="M93 124 Q100 138 107 124 Z" fill="#B23A52"/><path d="M96 131 Q100 136 104 131 Q100 128 96 131Z" fill="#F07F95"/>';
    else s+='<path d="M100 118 v3 M90 121 Q95 127 100 121 Q105 127 110 121" fill="none" stroke="'+mc+'" stroke-width="2.6" stroke-linecap="round"/>';
    var wc=dark?"rgba(255,255,255,.55)":"rgba(60,50,70,.35)";
    s+='<path d="M72 118 L40 112 M72 123 L38 124 M72 128 L42 136 M128 118 L160 112 M128 123 L162 124 M128 128 L158 136" stroke="'+wc+'" stroke-width="1.6" stroke-linecap="round"/>';
    s+='<!--FRONT-->';
    return s+"</svg>";
  }

  /* ---------- ilustraciones PNG (si existen en img/gatos/lista.json) ---------- */
  var FILE={azul:"azul-ruso",bicolor:"naranja-blanco",vaca:"vaquita",van:"van-turco",sphynx:"esfinge",calico:"calico",siames:"siames"};
  var AFILE={gafassol:"gafas-sol"};
  var HAVE={g:{},a:{}}, ANY=false;
  function coatFile(k){ return FILE[k]||k; }
  try{ fetch("img/gatos/lista.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).then(function(j){ if(!j) return; var G=j.gatos||[]; if(Array.isArray(G)) G.forEach(function(n){ HAVE.g[n]={m:[109.6,83.4,44.2],u:[114,118.8,185.7,78]}; }); else Object.keys(G).forEach(function(n){ HAVE.g[n]=G[n]; }); (j.accesorios||[]).forEach(function(n){ HAVE.a[n]=1; }); ANY=Object.keys(HAVE.g).length>0; if(ANY) try{ render(); }catch(e){} }).catch(function(){}); }catch(e){}
  var UNIF=function(){
    var U="#16171D",UD="#0E0F14";
    return '<path d="M53 136 Q39 150 42 168 L60 165 Q59 150 66 138 Z" fill="'+U+'"/><path d="M147 136 Q161 150 158 168 L140 165 Q141 150 134 138 Z" fill="'+U+'"/>'+
      '<path d="M43 160 L60 157" stroke="#FFFFFF" stroke-width="2.6"/><path d="M43 164 L60 161" stroke="#D7263D" stroke-width="2.6"/><path d="M42.5 156 L60.5 153" stroke="#1D3B7A" stroke-width="2.6"/>'+
      '<path d="M157 160 L140 157" stroke="#FFFFFF" stroke-width="2.6"/><path d="M157 164 L140 161" stroke="#D7263D" stroke-width="2.6"/><path d="M157.5 156 L139.5 153" stroke="#1D3B7A" stroke-width="2.6"/>'+
      '<path d="M58 134 Q64 124 100 122 Q136 124 142 134 L148 174 Q100 186 52 174 Z" fill="'+U+'"/>'+
      '<path d="M52 172 Q100 184 148 172 L150 186 Q130 192 112 187 L100 180 L88 187 Q70 192 50 186 Z" fill="'+UD+'"/>'+
      '<path d="M84 124 L100 144 L116 124" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/><path d="M88 124 L100 139 L112 124" fill="none" stroke="#D7263D" stroke-width="2.4" stroke-linejoin="round"/>'+
      '<path d="M100 144 V160" stroke="#2A2C36" stroke-width="2"/><circle cx="100" cy="150" r="1.6" fill="#E9E9EE"/><circle cx="100" cy="156" r="1.6" fill="#E9E9EE"/>'+
      '<image href="img/escudo.webp" x="61" y="153" width="12" height="21" preserveAspectRatio="xMidYMid meet"/>';
  };
  /* encuadre de las ilustraciones: ojos en (88.5,85.7) y (130.8,85.7) sobre 200 */
  var T_ACC='translate(24.6 -1.6) scale(.85)', T_UNI='translate(32.75 -1.25) scale(.8125 .984)';
  function rasterCat(g,o){
    var f=coatFile(g.coat||"gris"), mood=o.mood||"happy"; if(!HAVE.g[f]) return null;
    var src=HAVE.g[f+"-"+mood]?f+"-"+mood:f, acc=g.acc||{}, pngOver="", svgAcc={}, C=HAVE.g[f];
    var k=C.m[2]/52, T_ACC="translate("+(C.m[0]-100*k).toFixed(2)+" "+(C.m[1]-100*k).toFixed(2)+") scale("+k.toFixed(4)+")";
    var sx=C.u[3]/96, sy=(C.u[2]-C.u[1])/68, T_UNI="translate("+(C.u[0]-100*sx).toFixed(2)+" "+(C.u[1]-122*sy).toFixed(2)+") scale("+sx.toFixed(4)+" "+sy.toFixed(4)+")";
    Object.keys(acc).forEach(function(slot){ var v=acc[slot]; if(!v||v==="sin"||slot==="body") return; var af=AFILE[v]||v; if(HAVE.a[af]) pngOver+='<image href="img/gatos/accesorios/'+af+'.webp" x="0" y="0" width="200" height="200"/>'; else svgAcc[slot]=v; });
    var P=Object.keys(svgAcc).length||o.sparkle?accParts(svgAcc,mood,o.sparkle):{back:"",front:""};
    var s='<svg viewBox="0 0 200 200" class="cat raster '+(o.cls||"")+'" role="img" aria-label="'+(o.label||"Gato")+'" xmlns="http://www.w3.org/2000/svg">';
    s+='<ellipse cx="'+C.m[0]+'" cy="195" rx="50" ry="5" fill="rgba(30,40,80,.13)"/>';
    if(P.back) s+='<g transform="'+T_ACC+'">'+P.back+'</g>';
    s+='<image href="img/gatos/'+src+'.webp" x="0" y="0" width="200" height="200"/>';
    if(acc.body!=="sin") s+='<g transform="'+T_UNI+'">'+UNIF()+'</g>';
    s+=pngOver+(P.front?'<g transform="'+T_ACC+'">'+P.front+'</g>':"");
    return s+"</svg>";
  }

  catSVG=function(g,o){
    g=g||{}; o=o||{};
    var out;
    try{
      if(ANY){ var r=rasterCat(g,o); if(r) return r; }
      out=drawCat(g,o);
      var acc=g.acc||{}, has=Object.keys(acc).some(function(x){ return acc[x]&&acc[x]!=="sin"&&x!=="body"; })||o.sparkle;
      if(has){ var P=accParts(acc,o.mood||"happy",o.sparkle); out=out.replace("<!--BACK-->",P.back).replace("<!--FRONT-->",P.front); }
      else out=out.replace("<!--BACK-->","").replace("<!--FRONT-->","");
    }catch(e){ return ORIG(g,o); }
    return out;
  };
  window.PLXCatClassic=ORIG;
})();
