/* PLEX PLAY 1.11 — PLEX 1V1: duelos de francés en tiempo real */
(function(){
  "use strict";
  var q=function(s,r){return (r||document).querySelector(s)};
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var rich=function(x){ return esc(x).replace(/&lt;(\/?)(i|b|em|strong)&gt;/g,"<$1$2>"); };
  var ROUNDS=8, ROUND_MS=12000, REVEAL_MS=1900, COUNT_MS=5400, GRACE_MS=12000;
  var BUCKETS={A:{label:"A1–A2",tracks:["a1","a2","fon"]},B1:{label:"B1",tracks:["b11","b12"]},B2:{label:"B2",tracks:["b21","rem"]},C1:{label:"C1",tracks:["prog","c12","lit"]}};
  var CATS={voc:["Vocabulario","#0e9384"],gram:["Gramática","#2563eb"],comp:["Comprensión","#7c3aed"],trad:["Traducción","#ea580c"]};
  var PLAN=["voc","gram","comp","trad","gram","voc","trad","comp"];
  var sfx=function(k,x){ try{ if(window.V1AUD&&V1AUD.fx(k,x)) return; typeof SFX!=="undefined"&&SFX[k]&&SFX[k](); }catch(e){} };
  var myCatSVG=function(o){ try{ return catSVG(gEnsure().cat,o); }catch(e){ return ""; } };
  var catOf=function(c,o){ try{ return c?catSVG(c,o):catSVG(gEnsure().cat,o); }catch(e){ return ""; } };
  function myLevel(){ try{ var l=cefr().lvl; return l==="A1"||l==="A2"?"A":l; }catch(e){ return "A"; } }
  function rid(n){ var a="ABCDEFGHJKMNPQRSTUVWXYZ23456789", s=""; for(var i=0;i<n;i++) s+=a[Math.floor(Math.random()*a.length)]; return s; }
  var ME={id:(window.PCB&&PCB.uid)||("g-"+rid(8)),get nick(){ try{ return gEnsure().name||"Tú"; }catch(e){ return "Tú"; } },get cat(){ try{ return gEnsure().cat; }catch(e){ return null; } }};

  /* ---------- preguntas ---------- */
  function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function shuf(arr,rnd){ arr=arr.slice(); for(var i=arr.length-1;i>0;i--){ var j=Math.floor(rnd()*(i+1)); var t=arr[i]; arr[i]=arr[j]; arr[j]=t; } return arr; }
  function catOfItem(it,l){
    var t=(l.title+" "+(it.ask||"")).toLowerCase();
    if(it.ctx&&it.ctx.length>70) return "comp";
    if(/vocab|article|genre|nombres|mot|palabra|signif|sens|lexique|faux amis|pays|lieu|heure|jours|goûts/.test(t)) return "voc";
    return "gram";
  }
  function buildQuestions(bucket){
    var rnd=mulberry(Math.floor(Math.random()*1e9)), tr=BUCKETS[bucket].tracks, pools={voc:[],gram:[],comp:[],trad:[]};
    Object.keys(ITEMS).forEach(function(k){ var x=ITEMS[k], it=x.it, l=x.l; if(!l||tr.indexOf(l.track)<0||it.k!=="choice"||!it.o||it.o.length<2||it.o.length>4) return; if(/<img|<audio/.test(it.q||"")) return; pools[catOfItem(it,l)].push(k); });
    var EX=window.__EXPLICA||{}, frs=[];
    LESSONS.forEach(function(l){ if(tr.indexOf(l.track)<0||!EX[l.id]) return; EX[l.id].ej.forEach(function(e){ if(/[→≠=\[]/.test(e[0])||e[0].length>60||e[1].length<6) return; frs.push({fr:e[0],es:e[1]}); }); });
    frs.forEach(function(x,i){ pools.trad.push("t:"+i); });
    var used={}, out=[];
    PLAN.forEach(function(c){
      var pool=pools[c].length?pools[c]:(pools.gram.length?pools.gram:pools.voc);
      var cand=shuf(pool,rnd).filter(function(k){return !used[k]})[0]; if(!cand) return; used[cand]=1;
      if(cand.indexOf("t:")===0){
        var x=frs[+cand.slice(2)], wrong=shuf(frs.filter(function(y){return y.fr!==x.fr}),rnd).slice(0,2).map(function(y){return y.fr});
        var opts=shuf([x.fr].concat(wrong),rnd);
        out.push({c:"trad",q:"¿Cómo se dice en francés? «"+x.es+"»",ctx:"",o:opts,a:opts.indexOf(x.fr)});
      } else {
        var it=ITEMS[cand].it, idx=shuf(it.o.map(function(_,i){return i}),rnd);
        out.push({c:pool===pools[c]?c:"gram",q:it.q,ask:it.ask||"",ctx:it.ctx||"",o:idx.map(function(i){return it.o[i]}),a:idx.indexOf(it.a),why:it.why||""});
      }
    });
    return out;
  }

  /* ---------- red: Supabase Realtime o bot ---------- */
  var S0=null; // estado del duelo
  function netOK(){ return !!(window.PCB&&PCB.sb&&PCB.sb.channel); }
  function leaveAll(){
    try{ if(S0&&S0.room) PCB.sb.removeChannel(S0.room); }catch(e){}
    try{ if(S0&&S0.lobby) PCB.sb.removeChannel(S0.lobby); }catch(e){}
    if(S0){ clearTimeout(S0.t1); clearTimeout(S0.t2); clearInterval(S0.tick); clearTimeout(S0.botT); clearTimeout(S0.graceT); clearTimeout(S0.mmT); }
  }
  function send(ev,payload){ if(!S0||S0.bot||!S0.room) return; try{ S0.room.send({type:"broadcast",event:ev,payload:payload}); }catch(e){} }

  function joinRoom(code,host){
    S0.code=code; S0.host=host; S0.stage=host&&!S0.mm?"wait":"connecting"; paint();
    var ch=PCB.sb.channel("plx1v1-r-"+code,{config:{broadcast:{self:false},presence:{key:ME.id}}});
    S0.room=ch;
    ch.on("presence",{event:"sync"},function(){
      var st=ch.presenceState(), ids=Object.keys(st).filter(function(k){return k!==ME.id});
      if(ids.length){
        var m=st[ids[0]][0]||{};
        var wasGone=S0.oppGone;
        S0.opp={id:ids[0],nick:m.nick||"Rival",cat:m.cat||null,lvl:m.lvl||"",tr:m.tr||0};
        if(wasGone){ S0.oppGone=0; clearTimeout(S0.graceT); toast(S0.opp.nick+" volvió"); if(S0.host&&S0.stage!=="end") send("sync",{qs:S0.qs,t0:S0.t0,now:Date.now(),scores:S0.score,round:S0.round,bucket:S0.bucket}); }
        if(S0.host&&(S0.stage==="wait"||S0.stage==="connecting")&&!S0.qs) startMatch();
        else if(!S0.host&&S0.stage==="connecting") { S0.stage="wait"; paint(); }
      } else if(S0.opp&&S0.stage!=="end"&&S0.stage!=="lobby"){
        if(!S0.oppGone){ S0.oppGone=Date.now(); paint(); S0.graceT=setTimeout(function(){ if(S0&&S0.oppGone) finish("forfeit"); },GRACE_MS); }
      }
    });
    ch.on("broadcast",{event:"start"},function(m){ var p=m.payload; beginFrom(p); });
    ch.on("broadcast",{event:"sync"},function(m){ var p=m.payload; if(S0.stage==="match"||S0.stage==="count") return; beginFrom(p); });
    ch.on("broadcast",{event:"ans"},function(m){ var p=m.payload; if(!S0.oppAns) S0.oppAns={}; S0.oppAns[p.r]=p; S0.score.opp=p.total; S0.oppStreak=p.streak; if(S0.stage==="match"&&p.r===S0.round&&S0.phase==="q") sfx("opp"); paintLive(); checkBoth(); });
    ch.on("broadcast",{event:"skip"},function(m){ var p=m.payload; applySkip(p.r,p.t0-p.now+Date.now()); });
    ch.on("broadcast",{event:"rematch"},function(){ S0.oppRematch=true; if(S0.myRematch&&S0.host) startMatch(); paint(); });
    ch.on("broadcast",{event:"bye"},function(){ if(S0.stage!=="end") finish("forfeit"); });
    ch.subscribe(function(status){
      if(status==="SUBSCRIBED"){ ch.track({nick:ME.nick,cat:ME.cat,lvl:S0.bucket,tr:trophies(),ts:Date.now()}); }
      else if(status==="CHANNEL_ERROR"||status==="TIMED_OUT"){ toast("Conexión inestable: reintentando…"); }
    });
  }
  function startMatch(){
    S0.qs=buildQuestions(S0.bucket); S0.t0=Date.now()+COUNT_MS; S0.myRematch=S0.oppRematch=false;
    send("start",{qs:S0.qs,t0:S0.t0,now:Date.now(),bucket:S0.bucket});
    beginFrom({qs:S0.qs,t0:S0.t0,now:Date.now(),bucket:S0.bucket},true);
  }
  /* ---------- fin anticipado: si ambos respondieron, la ronda termina ya ---------- */
  function checkBoth(){
    if(!S0||!S0.host||S0.stage!=="match"||S0.phase!=="q") return;
    var r=S0.round; if(S0.ans[r]==null||!(S0.oppAns||{})[r]) return;
    var st=roundAt(Date.now()); if(st.r!==r||st.phase!=="q"||st.left<700) return;
    var nt0=S0.t0-(st.left-450);
    send("skip",{r:r,t0:nt0,now:Date.now()});
    applySkip(r,nt0);
  }
  function applySkip(r,nt0){
    if(!S0||S0.stage!=="match"||S0.round!==r||nt0>=S0.t0) return;
    S0.t0=nt0; S0.skipped=(S0.skipped||0)+1;
    var f=q("#v1opp")||q("#plx1v1 .v1-foot"); if(f) f.insertAdjacentHTML("beforeend",'<b class="v1-both">⚡ ¡Ambos respondieron!</b>');
  }
  function beginFrom(p,local){
    var off=local?0:(p.now-Date.now());
    S0.qs=p.qs; S0.t0=p.t0-off; S0.bucket=p.bucket||S0.bucket;
    S0.ans={}; S0.oppAns={}; S0.score={me:0,opp:p.scores?p.scores.opp||0:0}; if(p.scores&&!local){ S0.score={me:p.scores.opp||0,opp:p.scores.me||0}; }
    S0.streak=0; S0.best=0; S0.oppStreak=0; S0.myRematch=S0.oppRematch=false; S0.result=null;
    S0.stage="count"; S0.cd=0; S0.skipped=0; paint(); loop(); try{ V1AUD.music(true); V1AUD.fx("slam"); }catch(e){}
  }

  /* ---------- reloj de la partida ---------- */
  function roundAt(t){ var e=t-S0.t0; if(e<0) return {r:-1,left:-e}; var slot=ROUND_MS+REVEAL_MS, r=Math.floor(e/slot), inR=e-r*slot; return {r:r,phase:inR<ROUND_MS?"q":"rev",left:inR<ROUND_MS?ROUND_MS-inR:slot-inR,el:inR}; }
  function loop(){
    clearInterval(S0.tick);
    S0.tick=setInterval(function(){
      if(!S0) return;
      var now=Date.now(), st=roundAt(now);
      if(st.r<0){ var n=Math.ceil(st.left/1000); if(S0.cd!==n){ S0.cd=n; var cd=q("#plx1v1 .v1-cd"); if(n<=3){ sfx("cd",n); if(cd){ cd.textContent=n; cd.classList.remove("go"); void cd.offsetWidth; cd.classList.add("go"); } } else if(!cd) paint(); } return; }
      if(st.r>=S0.qs.length){ clearInterval(S0.tick); finish(); return; }
      if(S0.stage!=="match"||S0.round!==st.r||S0.phase!==st.phase){
        var prevPhase=S0.phase, prevRound=S0.round;
        if(S0.stage==="count") sfx("go"); else if(st.phase==="q") sfx("round");
        S0.stage="match"; S0.round=st.r; S0.phase=st.phase;
        try{ V1AUD.intensity(st.r>=S0.qs.length-2?2:st.r>=3?1:0); }catch(e){}
        if(st.phase==="rev"&&S0.ans[st.r]==null){ S0.ans[st.r]={i:-1,ok:false,pts:0,ms:ROUND_MS}; S0.streak=0; send("ans",{r:st.r,ok:false,pts:0,total:S0.score.me,streak:0}); }
        if(st.phase==="q"&&S0.bot) botPlay(st.r);
        paint();
      }
      paintTimer(st);
    },100);
  }
  function answer(i){
    var st=roundAt(Date.now()); if(S0.stage!=="match"||st.phase!=="q"||S0.ans[st.r]!=null) return;
    var qq=S0.qs[st.r], ok=i===qq.a, ms=st.el, pts=0;
    if(ok){ S0.streak++; S0.best=Math.max(S0.best,S0.streak); pts=100+Math.round(50*(ROUND_MS-ms)/ROUND_MS)+Math.min(60,20*(S0.streak-1)); }
    else S0.streak=0;
    S0.score.me+=pts; S0.ans[st.r]={i:i,ok:ok,pts:pts,ms:ms};
    sfx(ok?"ok":"ko"); if(ok&&S0.streak>=2) setTimeout(function(){ sfx("combo",S0.streak); },160); try{ navigator.vibrate&&navigator.vibrate(ok?12:[20,30,20]); }catch(e){}
    send("ans",{r:st.r,ok:ok,pts:pts,total:S0.score.me,streak:S0.streak,ms:ms});
    paint(); if(ok) pop(pts,S0.streak);
    checkBoth();
  }
  function botPlay(r){
    clearTimeout(S0.botT);
    var qq=S0.qs[r], acc={A:.72,B1:.66,B2:.62,C1:.58}[S0.bucket]||.65, delay=2500+Math.random()*7000;
    S0.botT=setTimeout(function(){
      if(!S0||S0.round!==r) return;
      var ok=Math.random()<acc, pts=0;
      if(ok){ S0.oppStreak=(S0.oppStreak||0)+1; pts=100+Math.round(50*(ROUND_MS-delay)/ROUND_MS)+Math.min(60,20*(S0.oppStreak-1)); } else S0.oppStreak=0;
      S0.score.opp+=pts; S0.oppAns[r]={r:r,ok:ok,pts:pts};
      sfx("opp"); paintLive(); checkBoth();
    },delay);
  }
  function finish(reason){
    if(!S0||S0.stage==="end") return;
    clearInterval(S0.tick); clearTimeout(S0.botT); clearTimeout(S0.graceT);
    var me=S0.score.me, op=S0.score.opp, res=reason==="forfeit"?"win":me>op?"win":me<op?"lose":"draw";
    var okN=Object.keys(S0.ans).filter(function(k){return S0.ans[k].ok}).length, ms=Object.keys(S0.ans).map(function(k){return S0.ans[k].ms}).filter(function(x){return x<ROUND_MS});
    var avg=ms.length?Math.round(ms.reduce(function(a,b){return a+b},0)/ms.length/100)/10:0;
    var xp=(res==="win"?40:res==="draw"?25:15)+okN*2;
    S0.result={res:res,forfeit:reason==="forfeit",okN:okN,avg:avg,xp:xp,oppOk:Object.keys(S0.oppAns||{}).filter(function(k){return S0.oppAns[k].ok}).length};
    S0.stage="end";
    try{
      addXP(xp); var G=gEnsure(); G.duels=G.duels||{w:0,l:0,d:0}; G.duels[res==="win"?"w":res==="lose"?"l":"d"]++; try{ addAct("1V1"); }catch(x){}
      if(!S0.bot){
        var before=trophies(), unlockedBefore=V1ITEMS.filter(function(it){return reqOk(it.req)}).map(function(it){return it.id});
        var dt=res==="win"?(S0.result.forfeit?15:25+Math.min(10,Math.round(Math.max(0,(S0.opp&&S0.opp.tr||0)-before)/20))):res==="draw"?5:-10;
        G.duels.tr=Math.max(0,before+dt); G.duels.ow=(G.duels.ow||0)+(res==="win"?1:0); G.duels.best=Math.max(G.duels.best||0,S0.best);
        S0.result.dt=G.duels.tr-before; S0.result.rankUp=rankOf(G.duels.tr).n!==rankOf(before).n&&dt>0;
        S0.result.newItems=V1ITEMS.filter(function(it){return reqOk(it.req)&&unlockedBefore.indexOf(it.id)<0});
      }
      save(!0); typeof gAfterProgress==="function"&&gAfterProgress();
    }catch(e){}
    try{ V1AUD.music(false); }catch(e){}
    sfx(res==="win"?"win":res==="draw"?"draw":"lose");
    paint();
  }

  /* ---------- matchmaking ---------- */
  function search(){
    if(!netOK()){ toast("Inicia sesión para jugar en línea. Mientras tanto, prueba contra Manzana."); return; }
    S0.stage="search"; S0.mm=true; S0.t=Date.now(); paint();
    var myTs=Date.now(), ch=PCB.sb.channel("plx1v1-q-"+S0.bucket,{config:{broadcast:{self:false},presence:{key:ME.id}}});
    S0.lobby=ch; var tried={};
    function tryPair(){
      if(!S0||S0.stage!=="search") return;
      var st=ch.presenceState(), others=Object.keys(st).filter(function(k){return k!==ME.id}).map(function(k){return {id:k,m:st[k][0]||{}}}).filter(function(x){return x.m.q&&!tried[x.id]}).sort(function(a,b){return a.m.ts-b.m.ts});
      var oldest=others[0]; if(!oldest||oldest.m.ts>myTs) return;
      tried[oldest.id]=1; var code=rid(5);
      ch.send({type:"broadcast",event:"inv",payload:{to:oldest.id,from:ME.id,code:code}});
      S0.pending=code; clearTimeout(S0.mmT); S0.mmT=setTimeout(function(){ S0.pending=null; tryPair(); },3500);
    }
    ch.on("presence",{event:"sync"},tryPair);
    ch.on("broadcast",{event:"inv"},function(m){ var p=m.payload; if(p.to!==ME.id||!S0||S0.stage!=="search") return; S0.stage="pair"; ch.send({type:"broadcast",event:"ok",payload:{to:p.from,code:p.code}}); setTimeout(function(){ try{PCB.sb.removeChannel(ch);}catch(e){} S0.lobby=null; joinRoom(p.code,true); },250); });
    ch.on("broadcast",{event:"ok"},function(m){ var p=m.payload; if(p.to!==ME.id||p.code!==S0.pending||S0.stage!=="search") return; S0.stage="pair"; clearTimeout(S0.mmT); setTimeout(function(){ try{PCB.sb.removeChannel(ch);}catch(e){} S0.lobby=null; joinRoom(p.code,false); },250); });
    ch.subscribe(function(s){ if(s==="SUBSCRIBED") ch.track({q:1,ts:myTs,nick:ME.nick}); });
    S0.t2=setTimeout(function(){ if(S0&&S0.stage==="search"){ S0.noOne=true; paint(); } },40000);
  }

  /* ---------- rangos, copas y premios exclusivos 1V1 ---------- */
  var RANKS=[[0,"Bronce","🥉","#b7793e"],[100,"Plata","🥈","#94a3b8"],[250,"Oro","🥇","#f59e0b"],[450,"Platino","💠","#14b8a6"],[700,"Diamante","💎","#3b82f6"],[1000,"Leyenda","👑","#a855f7"]];
  function trophies(){ try{ return (gEnsure().duels||{}).tr||0; }catch(e){ return 0; } }
  function rankOf(t){ var r=RANKS[0], nx=null; for(var i=0;i<RANKS.length;i++){ if(t>=RANKS[i][0]){ r=RANKS[i]; nx=RANKS[i+1]||null; } } return {min:r[0],n:r[1],i:r[2],c:r[3],next:nx}; }
  var V1ITEMS=[
    {id:"medalla1v1",slot:"medal",n:"Medalla 1V1",req:{duel:1}},
    {id:"cinta1v1",slot:"hat",n:"Cinta de duelista",req:{duel:5}},
    {id:"laurel1v1",slot:"hat",n:"Laurel de campeón",req:{duelTr:250}},
    {id:"rayo1v1",slot:"aura",n:"Aura relámpago",req:{duelTr:700}}
  ];
  try{
    V1ITEMS.forEach(function(it){ if(!GITEMS.some(function(x){return x.id===it.id})) GITEMS.push(it); });
    var _ro=reqOk; reqOk=function(r,f){ if(r&&(r.duel||r.duelTr)){ var d=(gEnsure().duels||{}); return r.duel?(d.ow||0)>=r.duel:(d.tr||0)>=r.duelTr; } return _ro(r,f); };
    var _rt=reqTxt; reqTxt=function(r){ if(r&&r.duel) return r.duel===1?"1 victoria en 1V1":r.duel+" victorias en 1V1"; if(r&&r.duelTr) return "Rango "+rankOf(r.duelTr).n+" en 1V1"; return _rt(r); };
    var _cs=catSVG; catSVG=function(g,o){
      var out=_cs(g,o), a=(g&&g.acc)||{}, x="";
      if(a.aura==="rayo1v1") x+='<g fill="#FACC15" stroke="#CA8A04" stroke-width="2" stroke-linejoin="round"><path d="M24 44 l12 -2 -6 12 10 -1 -18 22 5 -16 -9 1 z"/><path d="M168 36 l10 -1 -5 10 9 0 -16 19 4 -14 -8 0 z"/><path d="M16 132 l9 -1 -4 9 8 0 -14 16 3 -12 -7 0 z"/><path d="M178 128 l9 -1 -4 9 8 0 -14 16 3 -12 -7 0 z"/></g><g fill="#FDE68A"><circle cx="46" cy="30" r="3"/><circle cx="156" cy="70" r="2.5"/><circle cx="30" cy="104" r="2.5"/><circle cx="182" cy="104" r="3"/></g>';
      if(a.hat==="cinta1v1") x+='<path d="M54 70 Q100 46 146 70 L146 83 Q100 60 54 83 Z" fill="#E0463A" stroke="#B42318" stroke-width="2"/><path d="M144 72 l24 -10 -3 15 z M144 79 l21 9 -12 7 z" fill="#E0463A" stroke="#B42318" stroke-width="2" stroke-linejoin="round"/><path d="M103 53 l-8 12 h7 l-5 10 12 -14 h-7 l5 -8 z" fill="#FACC15" stroke="#A16207" stroke-width="1.5" stroke-linejoin="round"/>';
      if(a.hat==="laurel1v1"){ var lv=function(cx,cy,r){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="9" ry="4.5" transform="rotate('+r+' '+cx+' '+cy+')"/>'; };
        x+='<g fill="#F2B72F" stroke="#B7791F" stroke-width="1.6"><path d="M62 78 Q66 44 96 34" fill="none" stroke-width="3"/><path d="M138 78 Q134 44 104 34" fill="none" stroke-width="3"/>'+lv(64,70,-70)+lv(67,58,-55)+lv(74,47,-40)+lv(84,39,-25)+lv(94,35,-10)+lv(136,70,70)+lv(133,58,55)+lv(126,47,40)+lv(116,39,25)+lv(106,35,10)+'</g><circle cx="100" cy="34" r="4" fill="#EF4444"/>'; }
      if(a.medal==="medalla1v1") x+='<path d="M86 134 L100 164 L114 134 L106 134 L100 150 L94 134 Z" fill="#2563EB"/><path d="M94 134 L100 150 L106 134 Z" fill="#E0463A"/><circle cx="100" cy="170" r="13" fill="#FACC15" stroke="#CA8A04" stroke-width="3"/><path d="M100 162 l2.6 5.4 5.9 .8 -4.3 4.1 1 5.8 -5.2 -2.8 -5.2 2.8 1 -5.8 -4.3 -4.1 5.9 -.8 z" fill="#FFF7D6"/>';
      if(!x) return out; var k=out.lastIndexOf("</svg>"); return k<0?out:out.slice(0,k)+x+out.slice(k);
    };
  }catch(e){}
  function rankCard(){
    var t=trophies(), r=rankOf(t), d={}; try{ d=gEnsure().duels||{}; }catch(e){}
    var pc=r.next?Math.round(100*(t-r.min)/(r.next[0]-r.min)):100;
    var items=V1ITEMS.map(function(it){ var ok=false; try{ ok=reqOk(it.req); }catch(e){} var a={}; a[it.slot]=it.id; return '<div class="v1-rw '+(ok?"ok":"")+'" title="'+esc(it.n)+'"><span>'+catOf({coat:"blanco",acc:a},{mood:"happy"})+'</span><small>'+(ok?esc(it.n):"🔒 "+esc(reqTxt(it.req)))+"</small></div>"; }).join("");
    return '<div class="v1-rank" style="--rk:'+r.c+'"><div class="v1-rh"><span class="v1-ri">'+r.i+'</span><div><b>'+r.n+'</b><small>'+t+" copas"+(r.next?" · "+(r.next[0]-t)+" para "+r.next[1]:" · rango máximo")+'</small><div class="v1-rb"><i style="width:'+pc+'%"></i></div></div><em>'+(d.ow||0)+' victorias<br>en línea</em></div><p class="v1-rt">Premios exclusivos 1V1</p><div class="v1-rws">'+items+"</div></div>";
  }
  function introCard(side){
    var me=side==="me", o=S0.opp||{}, nick=me?ME.nick:(o.nick||"Rival"), rk=rankOf(me?trophies():(o.tr||0));
    var cat=me?myCatSVG({mood:"excited"}):catOf(o.cat,{mood:"excited"});
    var sub=(me||o.id!=="bot")?'<i class="v1-rk" style="--rk:'+rk.c+'">'+rk.i+" "+rk.n+"</i>":'<i class="v1-rk">🤖 Práctica</i>';
    return '<div class="v1-ic '+(me?"me":"op")+'"><div class="v1-icat">'+cat+'</div><b>'+esc(nick)+"</b>"+sub+"</div>";
  }
  function pop(pts,streak){
    var el=q("#plx1v1"); if(!el) return;
    var d=document.createElement("div"); d.className="v1-pop"; d.innerHTML="+"+pts+(streak>=2?"<small>🔥 Combo x"+streak+"</small>":"");
    el.appendChild(d); setTimeout(function(){ d.remove(); },1000);
  }

  /* ---------- música y efectos exclusivos del duelo (Web Audio, sin archivos) ---------- */
  window.V1AUD=(function(){
    var ctx=null, mus=null, fxg=null, noiseBuf=null, timer=null, nextT=0, step=0, lvl=0, heldMain=false;
    var on=(function(){ try{ return localStorage.getItem("plx-v1-mus")!=="0"; }catch(e){ return true; } })();
    function sfxOn(){ try{ return localStorage.getItem("cr-sfx")!=="0"; }catch(e){ return true; } }
    function ac(){
      try{
        if(!ctx){ var C=window.AudioContext||window.webkitAudioContext; if(!C) return null; ctx=new C();
          var comp=ctx.createDynamicsCompressor(); comp.connect(ctx.destination);
          mus=ctx.createGain(); mus.gain.value=0.0001; mus.connect(comp);
          fxg=ctx.createGain(); fxg.gain.value=0.5; fxg.connect(comp);
          noiseBuf=ctx.createBuffer(1,ctx.sampleRate*0.5,ctx.sampleRate); var d=noiseBuf.getChannelData(0); for(var i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
        if(ctx.state==="suspended") ctx.resume();
        return ctx;
      }catch(e){ return null; }
    }
    function tone(f,t,dur,vol,type,dest,f2){ var o=ctx.createOscillator(), g=ctx.createGain(); o.type=type||"sine"; o.frequency.setValueAtTime(f,t); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+dur); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.008); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(dest||fxg); o.start(t); o.stop(t+dur+0.02); }
    function noise(t,dur,vol,type,freq,dest,f2){ var s=ctx.createBufferSource(), f=ctx.createBiquadFilter(), g=ctx.createGain(); s.buffer=noiseBuf; f.type=type||"highpass"; f.frequency.setValueAtTime(freq||6000,t); if(f2) f.frequency.exponentialRampToValueAtTime(f2,t+dur); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); s.connect(f); f.connect(g); g.connect(dest||fxg); s.start(t); s.stop(t+dur+0.02); }
    var m2f=function(m){ return 440*Math.pow(2,(m-69)/12); };
    var CH=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]], BASS=[33,29,36,31];
    function sched(t,i){
      var bar=Math.floor(i/16)%4, s=i%16, ch=CH[bar];
      if(s%4===0) tone(150,t,0.22,0.9,"sine",mus,40);
      if(s===4||s===12) noise(t,0.14,0.35,"bandpass",1800,mus);
      if(s%2===1||lvl>=1) noise(t,0.035,s%2?0.12:0.06,"highpass",7000,mus);
      if(s%4===2||(lvl>=2&&s%4===3)){ var b=ctx.createOscillator(), lp=ctx.createBiquadFilter(), g=ctx.createGain(); b.type="sawtooth"; b.frequency.value=m2f(BASS[bar]+12); lp.type="lowpass"; lp.frequency.value=lvl>=2?900:520; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.35,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+0.2); b.connect(lp); lp.connect(g); g.connect(mus); b.start(t); b.stop(t+0.22); }
      var every=lvl>=2?1:lvl>=1?2:4;
      if(s%every===0){ var n=ch[(s/every)%3]+12+(lvl>=2&&s%2?12:0); tone(m2f(n),t,0.12,0.13,"triangle",mus); }
      if(lvl>=2&&s===14) noise(t,0.12,0.2,"bandpass",2400,mus);
    }
    function loop(){ if(!ctx) return; var spb=60/(lvl>=2?140:132)/4; while(nextT<ctx.currentTime+0.15){ sched(nextT,step); nextT+=spb; step++; } }
    function music(v){
      if(v&&on){ if(!ac()) return; if(timer) return; nextT=ctx.currentTime+0.06; step=0; mus.gain.cancelScheduledValues(ctx.currentTime); mus.gain.setValueAtTime(0.0001,ctx.currentTime); mus.gain.exponentialRampToValueAtTime(0.22,ctx.currentTime+0.8); timer=setInterval(loop,25); }
      else if(ctx&&timer){ var t=ctx.currentTime, tm=timer; timer=null; mus.gain.cancelScheduledValues(t); mus.gain.setValueAtTime(Math.max(mus.gain.value,0.0001),t); mus.gain.exponentialRampToValueAtTime(0.0001,t+0.45); setTimeout(function(){ clearInterval(tm); },500); lvl=0; }
    }
    var FX={
      cd:function(t,n){ tone(n===1?988:740,t,0.16,0.5,"square"); tone(n===1?1976:1480,t,0.08,0.12,"sine"); },
      go:function(t){ [880,1109,1319].forEach(function(f){ tone(f,t,0.4,0.22,"sawtooth"); }); tone(110,t,0.35,0.8,"sine",null,40); noise(t,0.25,0.3,"lowpass",3000); },
      slam:function(t){ tone(95,t+0.55,0.6,1,"sine",null,32); noise(t+0.55,0.35,0.5,"lowpass",2500,null,200); noise(t+0.05,0.5,0.12,"bandpass",800,null,5000); },
      round:function(t){ noise(t,0.25,0.18,"bandpass",600,null,4000); },
      ok:function(t){ tone(988,t,0.13,0.35,"sine"); tone(1319,t+0.08,0.2,0.35,"sine"); },
      ko:function(t){ tone(220,t,0.3,0.3,"sawtooth",null,98); },
      opp:function(t){ tone(520,t,0.08,0.12,"triangle",null,640); },
      combo:function(t,n){ var k=Math.min(n||2,5), base=[660,784,988,1175,1319]; for(var i=0;i<k;i++) tone(base[i],t+i*0.055,0.1,0.22,"triangle"); if(n>=3) noise(t,0.35,0.2,"bandpass",500,null,6000); },
      tick:function(t){ tone(1250,t,0.035,0.18,"square"); },
      win:function(t){ [523,659,784,1047].forEach(function(f,i){ tone(f,t+i*0.12,0.16,0.3,"square"); }); [523,659,784,1047].forEach(function(f){ tone(f,t+0.5,0.8,0.14,"sawtooth"); }); },
      lose:function(t){ [523,440,349].forEach(function(f,i){ tone(f,t+i*0.16,0.2,0.26,"triangle"); }); },
      draw:function(t){ tone(659,t,0.18,0.25,"triangle"); tone(659,t+0.2,0.25,0.25,"triangle"); }
    };
    return {
      get on(){ return on; },
      toggle:function(){ on=!on; try{ localStorage.setItem("plx-v1-mus",on?"1":"0"); }catch(e){} var S=window.PLX1V1&&PLX1V1.stage&&PLX1V1.stage(); if(!on) music(false); else if(S==="match"||S==="count") music(true); return on; },
      music:music,
      intensity:function(n){ lvl=n; },
      hold:function(){ try{ if(typeof MUSIC!=="undefined"&&MUSIC.on){ heldMain=true; MUSIC.set(false); } }catch(e){} },
      release:function(){ try{ if(heldMain){ heldMain=false; MUSIC.set(true); } }catch(e){} },
      fx:function(k,x){ if(!FX[k]) return false; if(!sfxOn()) return true; if(!ac()) return true; try{ FX[k](ctx.currentTime+0.01,x); }catch(e){} return true; }
    };
  })();

  /* ---------- UI ---------- */
  function box(){ var el=q("#plx1v1"); if(!el){ el=document.createElement("div"); el.id="plx1v1"; el.className="v1"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); el.setAttribute("aria-label","PLEX 1V1"); document.body.appendChild(el); } return el; }
  function open(){ leaveAll(); S0={stage:"lobby",bucket:myLevel(),score:{me:0,opp:0}}; document.body.style.overflow="hidden"; try{ V1AUD.hold(); }catch(e){} paint(); sfx("open"); }
  function close(){ try{ V1AUD.music(false); V1AUD.release(); }catch(e){} if(S0&&S0.room&&S0.stage!=="end"&&S0.opp) send("bye",{}); leaveAll(); S0=null; var el=q("#plx1v1"); if(el) el.remove(); document.body.style.overflow=""; try{ render(); }catch(e){} }
  function head(t){ var on=window.V1AUD?V1AUD.on:true; return '<div class="v1-h"><button class="v1-x" data-v1="close" aria-label="Salir">✕</button><b>PLEX <em>1V1</em></b><span>'+(t||"")+'</span><button class="v1-x v1-mus" data-v1="mus" aria-pressed="'+on+'" aria-label="Música del duelo">'+(on?"🎵":"🔇")+"</button></div>"; }
  function player(side){
    var me=side==="me", sc=me?S0.score.me:S0.score.opp, nick=me?ME.nick:(S0.opp?S0.opp.nick:"Rival"), cat=me?myCatSVG({mood:"happy"}):catOf(S0.opp&&S0.opp.cat,{mood:"happy"});
    var dots=(S0.qs||[]).map(function(_,i){ var a=me?S0.ans[i]:(S0.oppAns||{})[i]; return '<i class="'+(a?a.ok?"ok":"ko":i===S0.round?"cur":"")+'"></i>'; }).join("");
    var stt=me?S0.streak:S0.oppStreak;
    var rk=rankOf(me?trophies():(S0.opp&&S0.opp.tr)||0), badge=(me||(S0.opp&&S0.opp.id!=="bot"))?'<i class="v1-rk" style="--rk:'+rk.c+'" title="'+rk.n+'">'+rk.i+"</i>":"";
    return '<div class="v1-p '+(me?"me":"op")+'"><div class="v1-cat">'+cat+'</div><div class="v1-pi"><b>'+badge+esc(nick)+'</b><span class="v1-sc" data-sc="'+side+'">'+sc+'</span>'+(stt>=2?'<small class="v1-st'+(stt>=3?" hot":"")+'">🔥 '+stt+"</small>":"")+'<div class="v1-dots">'+dots+"</div></div></div>";
  }
  function paint(){
    if(!S0) return; var el=box(), s=S0.stage, html="";
    if(s==="lobby"){
      html=head("Duelos de francés")+'<div class="v1-b"><div class="v1-hero"><div class="v1-vs"><span class="v1-c1">'+myCatSVG({mood:"happy"})+'</span><b>VS</b><span class="v1-c2">'+catOf(null,{mood:"excited"})+'</span></div><h2>Reta a otro estudiante</h2><p>8 rondas de vocabulario, gramática, comprensión y traducción. 12 segundos por pregunta; más rápido y en racha, más puntos.</p></div>'+
        '<div class="v1-lv" role="group" aria-label="Nivel">'+Object.keys(BUCKETS).map(function(k){return '<button data-v1="lvl" data-a="'+k+'" aria-pressed="'+(S0.bucket===k)+'">'+BUCKETS[k].label+"</button>"}).join("")+"</div>"+
        rankCard()+
        '<button class="gbtn wide v1-main" data-v1="search">⚡ Buscar rival</button>'+
        '<div class="v1-row"><button class="gbtn ghost" data-v1="create">Crear sala con código</button><button class="gbtn ghost" data-v1="bot">Practicar con Manzana</button></div>'+
        '<form class="v1-join" data-v1f="join"><input id="v1code" maxlength="5" autocomplete="off" autocapitalize="characters" placeholder="Código de sala" aria-label="Código de sala"><button class="gbtn" type="submit">Unirme</button></form>'+
        (function(){ try{ var d=gEnsure().duels; return d?'<p class="v1-rec">Tu récord: <b>'+d.w+"</b> victorias · "+d.d+" empates · "+d.l+" derrotas</p>":""; }catch(e){ return ""; } })()+"</div>";
    } else if(s==="search"||s==="pair"||s==="connecting"){
      html=head("Nivel "+BUCKETS[S0.bucket].label)+'<div class="v1-b v1-center"><div class="v1-radar">'+myCatSVG({mood:"curious"})+'</div><h2>'+(s==="search"?"Buscando rival…":"¡Rival encontrado! Conectando…")+'</h2><p>'+(s==="search"?"Te emparejamos con alguien de tu nivel.":"Preparando las preguntas.")+"</p>"+
        (S0.noOne?'<p class="v1-note">No hay nadie buscando ahora mismo. Invita a un compañero con un código o practica con Manzana.</p><div class="v1-row"><button class="gbtn ghost" data-v1="create">Crear sala</button><button class="gbtn ghost" data-v1="bot">Jugar con Manzana</button></div>':"")+
        '<button class="gbtn ghost" data-v1="back">Cancelar</button></div>';
    } else if(s==="wait"){
      html=head("Sala privada")+'<div class="v1-b v1-center">'+(S0.host?'<p>Comparte este código con tu rival:</p><div class="v1-code">'+esc(S0.code)+'</div><div class="v1-row"><button class="gbtn ghost" data-v1="copy">Copiar</button><button class="gbtn ghost" data-v1="share">Compartir</button></div>':'<div class="v1-code sm">'+esc(S0.code)+"</div>")+'<div class="v1-radar">'+myCatSVG({mood:"curious"})+'</div><p class="v1-note">'+(S0.opp?"¡"+esc(S0.opp.nick)+" está aquí! Empezando…":"Esperando a tu rival…")+'</p><button class="gbtn ghost" data-v1="back">Cancelar</button></div>';
    } else if(s==="count"){
      html=head("Nivel "+BUCKETS[S0.bucket].label)+'<div class="v1-intro"><div class="v1-bolt"></div>'+introCard("me")+'<div class="v1-bigvs"><b>VS</b></div>'+introCard("op")+'<p class="v1-rules">8 rondas · 12 s · ⚡ velocidad y 🔥 racha dan más puntos</p><div class="v1-cd" aria-live="assertive"></div></div>';
    } else if(s==="match"){
      var r=S0.round, qq=S0.qs[r], my=S0.ans[r], rev=S0.phase==="rev", op=(S0.oppAns||{})[r], C=CATS[qq.c]||CATS.gram;
      var opts=qq.o.map(function(o,i){ var cls=""; if(rev){ cls=i===qq.a?"ok":my&&my.i===i?"ko":"dim"; } else if(my&&my.i===i) cls="sel"; return '<button class="v1-o '+cls+'" data-v1="ans" data-a="'+i+'" '+(my||rev?"disabled":"")+'><span>'+"ABCD"[i]+"</span>"+(typeof qHTML==="function"?qHTML(o):esc(o))+"</button>"; }).join("");
      html='<div class="v1-top">'+player("me")+'<div class="v1-mid"><small>Ronda '+(r+1)+"/"+S0.qs.length+'</small><div class="v1-timer"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" class="bg"/><circle cx="22" cy="22" r="19" class="fg" id="v1arc"/></svg><b id="v1sec">12</b></div></div>'+player("op")+"</div>"+
        (S0.oppGone?'<div class="v1-warn">'+esc(S0.opp?S0.opp.nick:"Tu rival")+" se desconectó. Si no vuelve en unos segundos, ganas por abandono.</div>":"")+
        '<div class="v1-b v1-q"><span class="v1-chip" style="--c:'+C[1]+'">'+C[0]+"</span>"+(qq.ask?'<p class="v1-ask">'+rich(qq.ask)+"</p>":"")+(qq.ctx?'<p class="v1-ctx">'+rich(qq.ctx)+"</p>":"")+'<h3 class="v1-qt">'+(typeof qHTML==="function"?qHTML(qq.q):esc(qq.q))+'</h3><div class="v1-opts">'+opts+"</div>"+
        '<div class="v1-foot">'+(rev?(my&&my.ok?'<b class="good">+'+my.pts+" puntos</b>":'<b class="bad">'+(my&&my.i>=0?"Incorrecto":"Se acabó el tiempo")+"</b>")+' · '+esc(S0.opp?S0.opp.nick:"Rival")+(op?op.ok?" acertó":" falló":" no respondió"):my?(my.ok?'<b class="good">¡Correcto! +'+my.pts+"</b>":'<b class="bad">Incorrecto</b>')+' · esperando a '+esc(S0.opp?S0.opp.nick:"tu rival")+'…':'<span id="v1opp">'+(op?esc(S0.opp?S0.opp.nick:"Rival")+" ya respondió":"")+"</span>")+"</div></div>";
    } else if(s==="end"){
      var R=S0.result, win=R.res==="win", draw=R.res==="draw";
      html=head("Resultado")+'<div class="v1-b v1-center v1-end"><div class="v1-ban '+R.res+'">'+(win?"¡Ganaste!":draw?"¡Empate!":"Ganó "+esc(S0.opp?S0.opp.nick:"tu rival"))+"</div>"+(R.forfeit?'<p class="v1-note">Tu rival abandonó la partida.</p>':"")+
        '<div class="v1-duo end"><div class="v1-p me '+(win?"win":"")+'"><div class="v1-cat">'+(win?'<span class="v1-crown">👑</span>':"")+myCatSVG({mood:win||draw?"excited":"sad"})+'</div><b>'+esc(ME.nick)+'</b><span class="v1-sc">'+S0.score.me+'</span></div><b class="v1-vsb">VS</b><div class="v1-p op '+(R.res==="lose"?"win":"")+'"><div class="v1-cat">'+(R.res==="lose"?'<span class="v1-crown">👑</span>':"")+catOf(S0.opp&&S0.opp.cat,{mood:R.res==="lose"||draw?"excited":"sad"})+'</div><b>'+esc(S0.opp?S0.opp.nick:"Rival")+'</b><span class="v1-sc">'+S0.score.opp+"</span></div></div>"+
        (R.dt!=null?'<div class="v1-trd '+(R.dt>=0?"up":"down")+'">🏆 '+(R.dt>=0?"+":"")+R.dt+' copas · <b>'+rankOf(trophies()).i+" "+rankOf(trophies()).n+"</b>"+(R.rankUp?' <em>¡Subiste de rango!</em>':"")+"</div>":(S0.bot?'<p class="v1-note">Las partidas con Manzana dan XP, pero las copas y los premios 1V1 solo se ganan contra otros estudiantes.</p>':""))+
        (R.newItems&&R.newItems.length?'<div class="v1-new">'+R.newItems.map(function(it){ var a={}; a[it.slot]=it.id; return '<div><span>'+catOf({coat:(ME.cat&&ME.cat.coat)||"manzana",acc:a},{mood:"excited"})+'</span><b>¡Nuevo! '+esc(it.n)+'</b><small>Póntelo en Perfil → Accesorios</small></div>'; }).join("")+"</div>":"")+
        '<div class="v1-stats"><div><b>'+R.okN+"/"+S0.qs.length+'</b><span>aciertos</span></div><div><b>'+(R.avg||"–")+' s</b><span>tiempo medio</span></div><div><b>'+S0.best+'</b><span>mejor racha</span></div><div class="xp"><b>+'+R.xp+'</b><span>XP ganada</span></div></div>'+
        '<div class="v1-row"><button class="gbtn" data-v1="rematch">'+(S0.myRematch?"Esperando al rival…":"Revancha")+(S0.oppRematch&&!S0.myRematch?" (¡te la pidió!)":"")+'</button><button class="gbtn ghost" data-v1="close">Salir</button></div></div>';
    }
    el.innerHTML=html; el.dataset.stage=s;
    if(s==="match") paintTimer(roundAt(Date.now()));
  }
  function paintLive(){
    if(!S0||S0.stage!=="match") return;
    var sc=q('#plx1v1 [data-sc=opp]'); if(sc){ sc.textContent=S0.score.opp; sc.classList.remove("bump"); void sc.offsetWidth; sc.classList.add("bump"); }
    var op=(S0.oppAns||{})[S0.round], o=q("#v1opp"); if(o&&op&&S0.phase==="q") o.textContent=(S0.opp?S0.opp.nick:"Rival")+" ya respondió";
    var d=document.querySelectorAll("#plx1v1 .v1-p.op .v1-dots i"); if(d[S0.round]&&op){ d[S0.round].className=op.ok?"ok":"ko"; }
  }
  function paintTimer(st){
    var arc=q("#v1arc"), sec=q("#v1sec"); if(!arc||!sec) return;
    var left=st.phase==="q"?st.left:0, f=left/ROUND_MS, L=2*Math.PI*19;
    arc.style.strokeDasharray=L; arc.style.strokeDashoffset=L*(1-f);
    arc.classList.toggle("hot",left<4000&&left>0);
    var n=Math.ceil(left/1000); if(sec.textContent!==String(n)){ sec.textContent=n; if(n<=3&&n>0&&!S0.ans[S0.round]) sfx("tick"); }
  }

  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-v1]"); if(!b) return;
    var a=b.dataset.v1; e.preventDefault();
    if(a==="open") return open();
    if(!S0) return;
    if(a==="close") return close();
    if(a==="lvl"){ S0.bucket=b.dataset.a; return paint(); }
    if(a==="mus"){ var on=V1AUD.toggle(); b.setAttribute("aria-pressed",on); b.textContent=on?"🎵":"🔇"; return; }
    if(a==="search") return search();
    if(a==="create"){ if(!netOK()){ toast("Inicia sesión para crear salas en línea."); return; } leaveAll(); S0.mm=false; S0.noOne=false; return joinRoom(rid(5),true); }
    if(a==="bot"){ leaveAll(); S0.bot=true; S0.opp={id:"bot",nick:"Manzana",cat:null}; S0.host=true; return startMatch(); }
    if(a==="back"){ var bk=S0.bucket; leaveAll(); try{ V1AUD.music(false); }catch(e){} S0={stage:"lobby",bucket:bk,score:{me:0,opp:0}}; return paint(); }
    if(a==="copy"){ try{ navigator.clipboard.writeText(S0.code); toast("Código copiado"); }catch(x){} return; }
    if(a==="share"){ var t="¡Te reto a un duelo de francés en PLEX PLAY! Código: "+S0.code+" "+location.href.split("?")[0]; if(navigator.share) navigator.share({text:t}).catch(function(){}); else { try{ navigator.clipboard.writeText(t); toast("Invitación copiada"); }catch(x){} } return; }
    if(a==="ans") return answer(+b.dataset.a);
    if(a==="rematch"){
      if(S0.bot){ S0.oppStreak=0; return startMatch(); }
      if(!S0.opp||S0.oppGone){ toast("Tu rival ya no está en la sala."); return; }
      S0.myRematch=true; send("rematch",{}); if(S0.oppRematch&&S0.host) startMatch(); return paint();
    }
  });
  document.addEventListener("submit",function(e){
    var f=e.target.closest&&e.target.closest("[data-v1f=join]"); if(!f) return; e.preventDefault();
    var c=(q("#v1code").value||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(c.length!==5){ toast("El código tiene 5 letras o números."); return; }
    if(!netOK()){ toast("Inicia sesión para jugar en línea."); return; }
    leaveAll(); S0.mm=false; joinRoom(c,false);
  });
  document.addEventListener("keydown",function(e){
    if(!S0) return;
    if(e.key==="Escape"){ close(); return; }
    if(S0.stage==="match"&&/^[1-4]$/.test(e.key)&&e.target.tagName!=="INPUT") answer(+e.key-1);
  });
  window.addEventListener("pagehide",function(){ if(S0&&S0.room&&S0.opp&&S0.stage==="match") send("bye",{}); });

  /* ---------- entrada desde Retos e Inicio ---------- */
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{
      if(view==="retos"&&!q("#view .v1-card")){
        var h=q("#view .gretos h1")||q("#view h1");
        var card='<button class="gcard v1-card" data-v1="open"><span class="v1-ci">⚔️</span><span class="v1-ct"><b>PLEX 1V1</b><small>'+(function(){ var r=rankOf(trophies()); return r.i+' '+r.n+' · '+trophies()+' copas · reta a otro estudiante'; })()+'</small></span><span class="v1-go">Jugar</span></button>';
        if(h) h.insertAdjacentHTML("afterend",card);
      }
      if(view==="parcours"&&!q("#view .v1-card")){
        var m=q("#view .ghome .gmain .pf-home")||q("#view .ghome .gmain .streak-card");
        if(m) m.insertAdjacentHTML("beforebegin",'<button class="gcard v1-card" data-v1="open"><span class="v1-ci">⚔️</span><span class="v1-ct"><b>PLEX 1V1</b><small>'+(function(){ var r=rankOf(trophies()); return r.i+' '+r.n+' · duelos de francés en tiempo real'; })()+'</small></span><span class="v1-go">Jugar</span></button>');
      }
    }catch(e){}
    return r;
  };

  var css=`
  .v1-card{all:unset;box-sizing:border-box;cursor:pointer;display:flex!important;align-items:center;gap:12px;width:100%;padding:14px 16px!important;margin:0 0 14px;border-radius:20px;background:linear-gradient(120deg,#1e3a8a,#2563eb 60%,#7c3aed)!important;color:#fff!important;border:0!important;box-shadow:0 12px 26px -14px rgba(37,99,235,.8)!important}
  .v1-ci{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-size:24px;background:rgba(255,255,255,.16);flex:none}
  .v1-ct{display:grid;gap:2px;flex:1;min-width:0}.v1-ct b{font-size:1.05rem;letter-spacing:.02em}.v1-ct small{opacity:.85;font-size:.82rem}
  .v1-go{padding:8px 14px;border-radius:999px;background:#facc15;color:#1e3a8a;font-weight:900;font-size:.85rem;box-shadow:0 3px 0 #c9a10c}
  .v1{position:fixed;inset:0;z-index:60;background:radial-gradient(700px 360px at 50% -10%,rgba(96,134,255,.18),transparent 65%),var(--paper);display:flex;flex-direction:column;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom,0);animation:plxUp .35s ease both}
  .v1-h{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;padding:10px 12px;background:linear-gradient(180deg,#2446a6,#1e3a8a);color:#fff}
  .v1-h b{font-weight:900;font-size:1.1rem}.v1-h em{color:#facc15;font-style:normal}.v1-h span{margin-left:auto;font-size:.82rem;opacity:.85}
  .v1-x{all:unset;cursor:pointer;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:rgba(255,255,255,.14);font-weight:900}
  .v1-b{width:min(640px,100%);margin:0 auto;padding:16px 14px 28px;box-sizing:border-box}
  .v1-center{text-align:center;display:grid;justify-items:center;gap:10px}
  .v1-hero{text-align:center}.v1-hero h2{margin:6px 0 4px;font-size:1.35rem}.v1-hero p{margin:0 auto;max-width:460px;color:var(--stone);font-size:.92rem;line-height:1.45}
  .v1-vs{display:flex;align-items:center;justify-content:center;gap:10px}.v1-vs .cat{width:92px;height:92px}.v1-vs b{font-size:1.6rem;font-weight:900;color:#ea580c;text-shadow:0 2px 0 #fde68a}
  .v1-c2 .cat{transform:scaleX(-1)}
  .v1-lv{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:16px 0 12px;padding:4px;border-radius:16px;background:var(--surf3)}
  .v1-lv button{all:unset;cursor:pointer;text-align:center;padding:9px 4px;border-radius:12px;font-weight:800;font-size:.9rem;color:var(--stone)}
  .v1-lv button[aria-pressed=true]{background:linear-gradient(180deg,#3274f2,#2563eb);color:#fff;box-shadow:0 3px 0 #1e3a8a}
  .v1-main{width:100%;min-height:54px;font-size:1.05rem!important}
  .v1-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;width:100%}
  .v1-join{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:10px}
  .v1-join input{height:48px;border-radius:14px;border:1.5px solid var(--line);padding:0 14px;font:inherit;font-weight:800;letter-spacing:.2em;text-transform:uppercase;background:var(--raise);color:var(--ink)}
  .v1-rec{margin:14px 0 0;text-align:center;font-size:.85rem;color:var(--stone)}
  .v1-radar{width:120px;height:120px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#dbeafe 0 55%,transparent 56%);position:relative}
  .v1-radar::before,.v1-radar::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid #60a5fa;animation:v1ping 1.8s ease-out infinite}
  .v1-radar::after{animation-delay:.9s}.v1-radar .cat{width:84px;height:84px}
  @keyframes v1ping{from{transform:scale(.7);opacity:.9}to{transform:scale(1.35);opacity:0}}
  .v1-code{font-family:var(--mono);font-size:2.4rem;font-weight:800;letter-spacing:.3em;padding:10px 18px 10px 26px;border-radius:18px;background:var(--raise);border:2px dashed #93c5fd;color:#1e3a8a}
  .v1-code.sm{font-size:1.2rem}
  .v1-note{color:var(--stone);font-size:.9rem;margin:4px 0}
  .v1-top{display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center;padding:10px 10px 8px;background:var(--raise);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:2}
  .v1-p{display:flex;align-items:center;gap:8px;min-width:0}.v1-p.op{flex-direction:row-reverse;text-align:right}
  .v1-cat{width:46px;height:46px;flex:none;position:relative}.v1-cat .cat{width:100%;height:100%}
  .v1-p.op .v1-cat .cat{transform:scaleX(-1)}
  .v1-pi{display:grid;gap:1px;min-width:0}.v1-pi b{font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px}
  .v1-sc{font-weight:900;font-size:1.25rem;color:#1e3a8a;display:inline-block}[data-theme=dark] .v1-sc{color:#93c5fd}
  .v1-sc.bump{animation:plxBump .45s ease}
  .v1-st{font-size:.72rem;font-weight:800;color:#ea580c}
  .v1-dots{display:flex;gap:3px}.v1-p.op .v1-dots{justify-content:flex-end}
  .v1-dots i{width:8px;height:8px;border-radius:50%;background:var(--line)}.v1-dots i.cur{background:#93c5fd}.v1-dots i.ok{background:#22c55e}.v1-dots i.ko{background:#ef4444}
  .v1-mid{display:grid;justify-items:center;gap:2px}.v1-mid small{font-size:.72rem;font-weight:800;color:var(--stone)}
  .v1-timer{position:relative;width:54px;height:54px}.v1-timer svg{width:100%;height:100%;transform:rotate(-90deg)}
  .v1-timer circle{fill:none;stroke-width:4.5}.v1-timer .bg{stroke:var(--line)}.v1-timer .fg{stroke:#2563eb;stroke-linecap:round;transition:stroke-dashoffset .1s linear,stroke .3s}.v1-timer .fg.hot{stroke:#ef4444}
  .v1-timer b{position:absolute;inset:0;display:grid;place-items:center;font-weight:900;font-size:1.1rem}
  .v1-warn{margin:8px 12px 0;padding:8px 12px;border-radius:12px;background:#fef3c7;color:#92400e;font-size:.85rem;text-align:center}
  .v1-q{display:grid;gap:8px}
  .v1-chip{justify-self:start;padding:4px 10px;border-radius:999px;font-size:.75rem;font-weight:900;color:#fff;background:var(--c)}
  .v1-ask{margin:0;color:var(--stone);font-size:.88rem}.v1-ctx{margin:0;padding:8px 10px;border-radius:12px;background:#eef3ff;font-size:.85rem}
  [data-theme=dark] .v1-ctx{background:#141c36}
  .v1-qt{margin:4px 0 6px;font-size:1.12rem;line-height:1.35}
  .v1-opts{display:grid;gap:8px}
  .v1-o{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:10px;min-height:52px;padding:10px 12px;border-radius:16px;background:var(--raise);border:2px solid var(--line);border-bottom-width:4px;font-weight:700;animation:plxUp .3s ease both;transition:transform .12s,border-color .2s,background .2s}
  .v1-o:nth-child(2){animation-delay:.04s}.v1-o:nth-child(3){animation-delay:.08s}.v1-o:nth-child(4){animation-delay:.12s}
  .v1-o span{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;flex:none;font-size:.8rem;font-weight:900;background:var(--surf3);color:var(--stone)}
  .v1-o:active{transform:translateY(2px);border-bottom-width:2px}
  .v1-o.sel{border-color:#3b82f6;background:#eff6ff}.v1-o.ok{border-color:#22c55e;background:#dcfce7;color:#14532d}.v1-o.ko{border-color:#ef4444;background:#fee2e2;color:#7f1d1d;animation:v1shake .35s}.v1-o.dim{opacity:.55}
  [data-theme=dark] .v1-o.sel{background:#1e2a4d}[data-theme=dark] .v1-o.ok{background:#12280f;color:#bbf7d0}[data-theme=dark] .v1-o.ko{background:#2e1515;color:#fecaca}
  .v1-o[disabled]{cursor:default}
  @keyframes v1shake{0%,100%{transform:none}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
  .v1-foot{min-height:24px;text-align:center;font-size:.9rem;color:var(--stone);margin-top:4px}.v1-foot .good{color:#16a34a}.v1-foot .bad{color:#dc2626}
  .v1-duo{display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0}
  .v1-duo .v1-p{flex-direction:column;text-align:center}.v1-duo .v1-cat{width:84px;height:84px}
  .v1-vsb{font-size:1.4rem;font-weight:900;color:#ea580c}
  .v1-cd{font-size:4.5rem;font-weight:900;color:#2563eb;animation:plxPopIn .5s cubic-bezier(.2,.9,.3,1.5) both}
  .v1-ban{font-size:1.8rem;font-weight:900;padding:10px 22px;border-radius:18px;color:#fff;background:linear-gradient(180deg,#3274f2,#1e3a8a);animation:plxPopIn .5s cubic-bezier(.2,.9,.3,1.5) both}
  .v1-ban.win{background:linear-gradient(180deg,#facc15,#f59e0b);color:#422006}.v1-ban.lose{background:linear-gradient(180deg,#94a3b8,#475569)}
  .v1-p.win .v1-cat{filter:drop-shadow(0 6px 12px rgba(250,204,21,.6))}
  .v1-crown{position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:24px;animation:plxPopIn .6s .3s both}
  .v1-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;width:100%;margin:6px 0}
  .v1-stats div{display:grid;gap:2px;padding:10px 4px;border-radius:14px;background:var(--raise);border:1px solid var(--line)}
  .v1-stats b{font-size:1.1rem}.v1-stats span{font-size:.7rem;color:var(--stone)}.v1-stats .xp b{color:#16a34a}
  @media (max-width:380px){.v1-pi b{max-width:70px}.v1-cat{width:38px;height:38px}.v1-stats{grid-template-columns:repeat(2,1fr)}}

  /* 1.12: intro VS, rangos, premios, combos */
  .v1-h .v1-mus{margin-left:8px}
  .v1-intro{position:relative;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;align-content:center;gap:10px;width:min(700px,100%);margin:0 auto;padding:26px 14px 30px;min-height:calc(100vh - 64px);min-height:calc(100dvh - 64px);box-sizing:border-box;overflow:hidden;animation:v1quake .35s .72s both}
  .v1-bolt{position:absolute;inset:-20%;pointer-events:none;background:linear-gradient(115deg,transparent 46%,rgba(250,204,21,.35) 49.2%,rgba(255,255,255,.85) 50%,rgba(250,204,21,.35) 50.8%,transparent 54%);opacity:0;animation:v1flash 1s .55s ease-out both}
  .v1-ic{position:relative;z-index:1;display:grid;justify-items:center;gap:6px;padding:16px 8px 14px;border-radius:24px;background:var(--raise);border:3px solid #3b82f6;box-shadow:0 18px 34px -20px rgba(37,99,235,.9);animation:v1inL .6s cubic-bezier(.2,.9,.3,1.25) both;min-width:0}
  .v1-ic.op{border-color:#ef4444;box-shadow:0 18px 34px -20px rgba(239,68,68,.9);animation-name:v1inR;animation-delay:.12s}
  .v1-icat{width:118px;height:118px}.v1-icat .cat{width:100%;height:100%}.v1-ic.op .v1-icat .cat{transform:scaleX(-1)}
  .v1-ic b{font-size:1.05rem;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .v1-rk{font-style:normal;font-size:.78rem;font-weight:800;color:var(--rk,#64748b)}
  .v1-pi .v1-rk{margin-right:3px}
  .v1-bigvs{position:relative;z-index:2}
  .v1-bigvs b{display:block;font-size:3.8rem;font-weight:900;line-height:1;color:#facc15;-webkit-text-stroke:3px #1e3a8a;text-shadow:0 6px 0 #1e3a8a,0 0 30px rgba(250,204,21,.6);animation:v1slam .55s .5s cubic-bezier(.2,.9,.3,1.4) both}
  .v1-rules{grid-column:1/-1;margin:6px 0 0;text-align:center;color:var(--stone);font-weight:700;font-size:.9rem;animation:plxUp .4s 1.1s both}
  .v1-intro .v1-cd{grid-column:1/-1;justify-self:center;min-height:5.2rem;font-size:4.8rem;line-height:1;color:#2563eb;animation:none;opacity:0}
  .v1-intro .v1-cd.go{animation:v1cd .95s ease both}
  @keyframes v1inL{from{transform:translateX(-120%) rotate(-8deg);opacity:0}to{transform:none;opacity:1}}
  @keyframes v1inR{from{transform:translateX(120%) rotate(8deg);opacity:0}to{transform:none;opacity:1}}
  @keyframes v1slam{0%{transform:scale(3.2) rotate(-14deg);opacity:0}60%{transform:scale(.88) rotate(4deg);opacity:1}100%{transform:scale(1) rotate(-4deg);opacity:1}}
  @keyframes v1flash{0%{opacity:0}15%{opacity:1}100%{opacity:.18}}
  @keyframes v1quake{0%,100%{transform:none}20%{transform:translate(-5px,3px)}40%{transform:translate(5px,-3px)}60%{transform:translate(-3px,2px)}80%{transform:translate(3px,-1px)}}
  @keyframes v1cd{0%{transform:scale(2.3);opacity:0}25%{transform:scale(1);opacity:1}80%{opacity:1}100%{transform:scale(.7);opacity:0}}
  @media (max-width:520px){.v1-icat{width:84px;height:84px}.v1-bigvs b{font-size:2.6rem;-webkit-text-stroke:2px #1e3a8a}.v1-ic{padding:12px 6px}}
  .v1-pop{position:fixed;left:14px;top:84px;z-index:70;font-weight:900;font-size:1.35rem;color:#16a34a;pointer-events:none;text-shadow:0 2px 0 #fff;animation:v1pop 1s ease-out both}
  .v1-pop small{display:block;font-size:.9rem;color:#ea580c}
  @keyframes v1pop{0%{transform:translateY(12px) scale(.6);opacity:0}20%{transform:none;opacity:1}100%{transform:translateY(-42px);opacity:0}}
  .v1-st.hot{display:inline-block;animation:v1flame .6s ease-in-out infinite alternate}
  @keyframes v1flame{from{transform:scale(1)}to{transform:scale(1.18);filter:drop-shadow(0 0 4px #fb923c)}}
  .v1-both{display:block;margin-top:4px;color:#7c3aed;font-size:.85rem;animation:plxPopIn .35s both}
  .v1-rank{margin:14px 0 12px;padding:12px 14px;border-radius:20px;background:var(--raise);border:1.5px solid var(--line);box-shadow:inset 0 3px 0 var(--rk)}
  .v1-rh{display:flex;align-items:center;gap:12px}.v1-rh>div{flex:1;min-width:0;display:grid;gap:3px}
  .v1-ri{width:48px;height:48px;border-radius:16px;display:grid;place-items:center;font-size:28px;background:color-mix(in srgb,var(--rk) 18%,transparent);flex:none}
  .v1-rh b{font-size:1.05rem;color:var(--rk)}.v1-rh small{color:var(--stone);font-size:.8rem}
  .v1-rh em{font-style:normal;font-size:.75rem;font-weight:800;color:var(--stone);text-align:right}
  .v1-rb{height:8px;border-radius:99px;background:var(--surf3);overflow:hidden}.v1-rb i{display:block;height:100%;border-radius:99px;background:var(--rk)}
  .v1-rt{margin:10px 0 6px;font-size:.78rem;font-weight:900;letter-spacing:.04em;text-transform:uppercase;color:var(--stone)}
  .v1-rws{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
  .v1-rw{display:grid;justify-items:center;gap:2px;padding:6px 4px;border-radius:14px;background:var(--surf3);text-align:center}
  .v1-rw span{width:52px;height:52px}.v1-rw .cat{width:100%;height:100%}.v1-rw:not(.ok) span{filter:grayscale(1);opacity:.55}
  .v1-rw small{font-size:.66rem;line-height:1.2;color:var(--stone);font-weight:700}.v1-rw.ok small{color:#16a34a}
  .v1-trd{font-weight:800;padding:8px 14px;border-radius:999px;background:#fef9c3;color:#854d0e;animation:plxPopIn .5s .3s both}
  .v1-trd.down{background:var(--surf3);color:var(--stone)}.v1-trd em{font-style:normal;color:#16a34a;display:block}
  [data-theme=dark] .v1-trd{background:#3a2f0b;color:#fde68a}
  .v1-new{display:grid;gap:8px;width:100%}
  .v1-new>div{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:18px;background:linear-gradient(120deg,#fef3c7,#fde68a);color:#422006;text-align:left;animation:plxPopIn .5s .5s both}
  .v1-new span{width:60px;height:60px;flex:none}.v1-new .cat{width:100%;height:100%}.v1-new b{display:block}.v1-new small{font-size:.78rem}
  @media (max-width:380px){.v1-rws{grid-template-columns:repeat(2,1fr)}}
  @media (prefers-reduced-motion:reduce){.v1-intro,.v1-ic,.v1-bigvs b,.v1-bolt{animation-duration:.01s!important;animation-delay:0s!important}}
  `;
  var st=document.createElement("style"); st.id="plx22"; st.textContent=css; document.head.appendChild(st);
  window.PLX1V1={open:open,stage:function(){ return S0&&S0.stage; }};
})();
