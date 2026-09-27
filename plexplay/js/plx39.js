/* PLEX PLAY 1.20 — Conversa con Manzana: tutor de conversación escrita con IA, por nivel y con correcciones */
(function(){
  "use strict";
  if(typeof GV==="undefined") return;
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var MAXT=12;
  var LV=["A1","A2","B1","B2","C1"];
  var TR2LV={a1:"A1",a2:"A2",fon:"A2",b11:"B1",b12:"B1",b21:"B2",rem:"B2",prog:"C1",c12:"C1",lit:"C1"};
  var SC=[
    {id:"moi",i:"👋",t:"Preséntate",d:"Nombre, edad, carrera, gustos.",lv:"A1",who:"Manzana, una estudiante de intercambio en Pamplona",open:{A1:"Salut ! Moi, c'est Manzana. Et toi, comment tu t'appelles ?",A2:"Salut ! Je suis Manzana, je viens de Lyon. Tu peux te présenter un peu ?",B1:"Bonjour ! Je suis Manzana, j'arrive de Lyon pour un semestre. Parle-moi un peu de toi : qu'est-ce que tu étudies ?",B2:"Bonjour ! Je viens d'arriver à Pamplona pour un échange. J'aimerais bien te connaître : qu'est-ce qui t'a amené à étudier les langues ?",C1:"Enchantée ! On m'a dit que tu étudiais les langues étrangères. Qu'est-ce qui a motivé ce choix, au fond ?"}},
    {id:"cafe",i:"☕",t:"En el café",d:"Pide algo de tomar y de comer.",lv:"A1",who:"Manzana, mesera de un café en París",open:{A1:"Bonjour ! Qu'est-ce que vous voulez boire ?",A2:"Bonjour et bienvenue ! Vous avez choisi ? Nous avons des croissants tout frais ce matin.",B1:"Bonjour ! Vous êtes combien ? Je vous conseille notre formule du midi, vous voulez que je vous l'explique ?",B2:"Bonjour ! Désolée pour l'attente, il y a du monde aujourd'hui. Qu'est-ce qui vous ferait plaisir ?",C1:"Bonjour ! Je crains que la cuisine ne ferme dans un quart d'heure, mais je peux encore prendre votre commande. Que désirez-vous ?"}},
    {id:"we",i:"🎉",t:"El fin de semana",d:"Cuenta qué hiciste o qué vas a hacer.",lv:"A2",who:"Manzana, tu amiga francesa",open:{A1:"Salut ! Tu fais quoi ce week-end ?",A2:"Salut ! Alors, qu'est-ce que tu as fait le week-end dernier ?",B1:"Coucou ! Tu as passé un bon week-end ? Raconte-moi, j'ai envie de nouvelles !",B2:"Alors, ce week-end ? J'ai l'impression que tu avais prévu quelque chose de spécial, non ?",C1:"Tu as l'air fatigué ! Ton week-end a dû être mouvementé. Raconte-moi tout."}},
    {id:"voyage",i:"✈️",t:"Un viaje",d:"Planea un viaje o cuenta uno.",lv:"A2",who:"Manzana, agente de viajes",open:{A1:"Bonjour ! Vous voulez aller où ?",A2:"Bonjour ! Vous voulez partir en vacances ? Où est-ce que vous aimeriez aller ?",B1:"Bonjour ! Je vous écoute : quel genre de voyage est-ce que vous cherchez, plutôt nature ou plutôt ville ?",B2:"Bonjour ! Pour vous proposer le voyage idéal, dites-moi ce qui compte le plus pour vous quand vous partez.",C1:"Bonjour ! Nos clients recherchent de plus en plus un tourisme responsable. Quelle est votre conception du voyage idéal ?"}},
    {id:"etudes",i:"🎓",t:"Tus estudios",d:"La U, tus clases y tus planes.",lv:"B1",who:"Manzana, orientadora universitaria",open:{A1:"Bonjour ! Tu étudies quoi ?",A2:"Bonjour ! Tu es en quel semestre ? Tu aimes tes cours ?",B1:"Bonjour ! On fait le point sur ton semestre ? Qu'est-ce qui se passe bien et qu'est-ce qui est plus difficile ?",B2:"Bonjour ! Tu approches de la fin de tes études. Quels sont tes projets professionnels ?",C1:"Bonjour ! J'aimerais que tu me présentes ton projet de recherche ou de mémoire, et les raisons de ce choix."}},
    {id:"debat",i:"⚖️",t:"Debate",d:"Opina y defiende tu postura.",lv:"B2",who:"Manzana, compañera de debate",open:{A1:"Tu aimes les réseaux sociaux ? Pourquoi ?",A2:"Moi, je pense qu'on passe trop de temps sur le téléphone. Et toi, qu'est-ce que tu en penses ?",B1:"Aujourd'hui, notre sujet : faut-il interdire les téléphones portables à l'université ? Quelle est ton opinion ?",B2:"Sujet du jour : l'intelligence artificielle est-elle une chance ou une menace pour l'apprentissage des langues ? Je t'écoute.",C1:"Je soutiens que le télétravail isole plus qu'il ne libère. Convaincs-moi du contraire, si tu le peux."}},
    {id:"libre",i:"💬",t:"Tema libre",d:"Habla de lo que quieras.",lv:"A1",who:"Manzana, tu compañera de conversación",open:{A1:"Salut ! De quoi tu veux parler ?",A2:"Salut ! De quoi est-ce que tu as envie de parler aujourd'hui ?",B1:"Salut ! Choisis un sujet et je te suis : cinéma, musique, études, voyages… ?",B2:"Bonjour ! Je te laisse choisir le sujet de notre conversation. Qu'est-ce qui t'intéresse en ce moment ?",C1:"Bonjour ! Quel sujet aimerais-tu approfondir aujourd'hui ? Je suis toute ouïe."}}
  ];
  var byId={}; SC.forEach(function(s){ byId[s.id]=s; });
  var TS={lv:null,sc:null,msgs:[],busy:false,err:"",hint:null,tr:{},ended:false,fixes:0};
  function lvl(){ if(TS.lv) return TS.lv; var t=typeof track!=="undefined"&&TR2LV[track]; return t||"A1"; }
  function turns(){ return TS.msgs.filter(function(m){ return m.me; }).length; }
  function hasVoice(){ try{ if(typeof frVoice!=="undefined"&&frVoice) return true; return !!(window.speechSynthesis&&speechSynthesis.getVoices().some(function(v){ return /^fr/i.test(v.lang); })); }catch(e){ return false; } }
  function play(t,auto){ if(!hasVoice()){ if(!auto) try{ toast("Tu dispositivo no tiene una voz en francés instalada. Actívala en Ajustes → Texto a voz."); }catch(e){} return; } try{ speak(t,1); }catch(e){} }
  var SPK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';
  var SEND='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>';

  async function ai(prompt,text){
    if(window.PLX_DEMO||typeof sample==="undefined"||!sample||!sample.json) throw {code:"no_ai"};
    var kinds=["oral","why","atelier"], last=null;
    for(var i=0;i<kinds.length;i++){
      try{ return await sample.json(prompt,{kind:kinds[i],modelTier:"default",text:text||""}); }
      catch(e){ last=e; var c=e&&e.code; if(["daily_limit","rate_limited","session_expired","offline","cancelled","invalid_json","no_ai"].indexOf(c)>=0) throw e; }
    }
    throw last||{code:"provider_error"};
  }
  function aiErr(e){ var c=e&&e.code; return c==="no_ai"?"Para conversar con la IA necesitas entrar con tu cuenta institucional.":c==="daily_limit"?"Ya usaste tus ayudas de IA de hoy. Mañana se renuevan.":c==="rate_limited"?"Hay muchas solicitudes ahora. Intenta de nuevo en unos minutos.":c==="offline"?"Sin conexión. Revisa tu internet.":c==="session_expired"?"Tu sesión expiró: vuelve a entrar.":"La IA no respondió bien esta vez. Toca «Reintentar»."; }

  function prompt(){
    var s=byId[TS.sc], L=lvl(), last=TS.msgs.slice(-10).map(function(m){ return (m.me?"ESTUDIANTE: ":"TUTORA: ")+m.t; }).join("\n");
    return "Eres "+s.who+". Conversas por escrito en francés con un estudiante colombiano hispanohablante de nivel "+L+" (MCER). Situación: "+s.t+" — "+s.d+"\n"+
      "Reglas: 1) Responde SOLO en francés adaptado estrictamente al nivel "+L+" (A1: frases muy cortas y vocabulario básico en presente; A2: frases simples, passé composé y futur proche; B1: frases conectadas; B2: matices y argumentos; C1: registro rico). "+
      "2) Máximo 2 o 3 frases y termina casi siempre con una pregunta para que la conversación siga. 3) Mantente en el papel y en la situación. 4) Si el estudiante escribe en español, anímalo a intentarlo en francés y dale una frase modelo. "+
      "5) Revisa el ÚLTIMO mensaje del estudiante: si tiene errores de gramática, ortografía, acentos o vocabulario, da la versión corregida completa y una explicación muy breve en español (una o dos frases, tono amable). Ignora mayúsculas y puntuación final. Si está bien, ok=true.\n"+
      "Conversación hasta ahora:\n"+last+"\n\n"+
      'Devuelve SOLO JSON válido con esta forma: {"reply":"tu respuesta en francés","es":"traducción al español de tu respuesta","ok":true|false,"corrected":"versión corregida del último mensaje del estudiante (vacío si ok)","note":"explicación breve en español (vacío si ok)","hint":["idea de respuesta 1 en francés","idea 2"]}';
  }
  async function send(text){
    text=String(text||"").trim().slice(0,400); if(!text||TS.busy) return;
    TS.msgs.push({me:true,t:text}); TS.busy=true; TS.err=""; TS.hint=null; render(); scrollChat();
    await turn();
  }
  async function turn(){
    TS.busy=true; TS.err=""; render(); scrollChat();
    try{
      var r=await ai(prompt(),TS.msgs[TS.msgs.length-1].t);
      if(!r||typeof r!=="object"||!r.reply) throw {code:"invalid_json"};
      var me=TS.msgs[TS.msgs.length-1];
      if(r.ok===false&&r.corrected&&String(r.corrected).trim().toLowerCase()!==me.t.trim().toLowerCase()){ me.fix={c:String(r.corrected).slice(0,500),n:String(r.note||"").slice(0,400)}; TS.fixes++; }
      else me.good=true;
      TS.msgs.push({me:false,t:String(r.reply).slice(0,600),es:String(r.es||"").slice(0,600)});
      TS.hintList=Array.isArray(r.hint)?r.hint.slice(0,3).map(function(x){ return String(x).slice(0,200); }):[];
      TS.busy=false; render(); scrollChat();
      try{ if(!S.muteTut) play(r.reply,true); }catch(e){}
      if(turns()>=MAXT) finish();
    }catch(e){ TS.busy=false; TS.err=aiErr(e); render(); scrollChat(); }
  }
  function finish(){
    if(TS.ended) return; TS.ended=true;
    var n=turns(), xp=Math.min(30,4+n*2);
    TS.xp=xp; S.tutN=(S.tutN||0)+1;
    try{ addXP(xp); addAct("TUT"); save(!0); typeof gAfterProgress==="function"&&gAfterProgress(); }catch(e){}
    render(); scrollChat();
  }
  function scrollChat(){ setTimeout(function(){ var c=document.querySelector(".tu-chat"); if(c) c.scrollTop=c.scrollHeight; var i=document.getElementById("tuIn"); if(i&&!TS.busy&&!TS.ended&&matchMedia("(min-width:900px)").matches) i.focus(); },30); }

  /* ------------------------------ vistas ------------------------------ */
  GV.tutor=function(){
    if(TS.sc) return chatHTML();
    var L=lvl(), demo=!!window.PLX_DEMO;
    return '<section class="gview tut">'+'<button class="gback" data-view="retos">‹ Retos</button>'+
      '<div class="tu-hero"><img src="img/mz-hola.webp" alt=""><div><small>Conversación con IA</small><h1>Conversa con Manzana</h1><p>Escribe en francés como en un chat. Manzana te responde a tu nivel y te corrige con una explicación corta en español.</p></div></div>'+
      (demo?'<div class="tu-warn">🔒 En la demo la IA no está disponible. Crea tu cuenta con el correo de la U para conversar.</div>':"")+
      '<h2 class="tu-h">Tu nivel</h2><div class="tu-lv" role="radiogroup" aria-label="Nivel">'+LV.map(function(l){ return '<button role="radio" aria-checked="'+(l===L)+'" data-tulv="'+l+'" class="'+(l===L?"on":"")+'">'+l+"</button>"; }).join("")+"</div>"+
      '<h2 class="tu-h">Elige una situación</h2><div class="tu-grid">'+SC.map(function(s){ return '<button class="tu-sc" data-tusc="'+s.id+'" '+(demo?"disabled":"")+'><span class="tu-i">'+s.i+"</span><b>"+esc(s.t)+"</b><small>"+esc(s.d)+"</small></button>"; }).join("")+"</div>"+
      '<p class="tu-note">Cada conversación tiene hasta '+MAXT+" mensajes tuyos y usa tus ayudas de IA del día. No compartas datos personales.</p></section>";
  };
  function chatHTML(){
    var s=byId[TS.sc], L=lvl(), n=turns();
    var body=TS.msgs.map(function(m,i){
      if(m.me) return '<div class="tu-row me"><div class="tu-b">'+esc(m.t)+"</div>"+
        (m.fix?'<div class="tu-fix"><b>✏️ Mejor así:</b> <span lang="fr">'+esc(m.fix.c)+"</span>"+(m.fix.n?"<small>"+esc(m.fix.n)+"</small>":"")+"</div>":m.good?'<div class="tu-ok">✓ ¡Bien escrito!</div>':"")+"</div>";
      var open=!!TS.tr[i];
      return '<div class="tu-row mz"><img src="img/mz-hola.webp" alt=""><div><div class="tu-b" lang="fr">'+esc(m.t)+"</div>"+
        '<div class="tu-tools"><button data-tuplay="'+i+'" aria-label="Escuchar">'+SPK+" Escuchar</button>"+(m.es?'<button data-tutr="'+i+'" aria-expanded="'+open+'">'+(open?"Ocultar traducción":"Traducir")+"</button>":"")+"</div>"+
        (open&&m.es?'<div class="tu-es">'+esc(m.es)+"</div>":"")+"</div></div>";
    }).join("");
    if(TS.busy) body+='<div class="tu-row mz"><img src="img/mz-hola.webp" alt=""><div class="tu-b tu-typing" aria-label="Manzana está escribiendo"><i></i><i></i><i></i></div></div>';
    if(TS.err) body+='<div class="tu-err" role="alert">'+esc(TS.err)+' <button class="gbtn ghost sm" data-tugo="retry">Reintentar</button></div>';
    if(TS.ended) body+='<div class="tu-end"><img src="img/mz-feliz.webp" alt=""><div><b>¡Conversación terminada!</b><p>'+n+" mensajes · "+TS.fixes+" corrección"+(TS.fixes===1?"":"es")+" · +"+TS.xp+' XP</p><div class="set-row"><button class="gbtn ghost" data-tugo="menu">Otra situación</button><button class="gbtn" data-tugo="again">Repetir</button></div></div></div>';
    var hints=(TS.hint&&TS.hintList&&TS.hintList.length)?'<div class="tu-hints">'+TS.hintList.map(function(h){ return '<button data-tuhint="'+esc(h)+'">'+esc(h)+"</button>"; }).join("")+"</div>":"";
    return '<section class="gview tut tut-chat">'+
      '<div class="tu-top"><button class="gback" data-tugo="menu">‹ Situaciones</button><div class="tu-ttl"><span>'+s.i+"</span><div><b>"+esc(s.t)+"</b><small>Nivel "+L+" · "+n+"/"+MAXT+' mensajes</small></div></div><button class="tu-end-b" data-tugo="end" '+(TS.ended||!n?"disabled":"")+">Terminar</button></div>"+
      '<div class="tu-chat" aria-live="polite">'+body+"</div>"+
      (TS.ended?"":hints+'<form class="tu-form" data-tuform><button type="button" class="tu-hint-b" data-tugo="hint" aria-label="Ideas para responder" title="Ideas para responder">💡</button><input id="tuIn" lang="fr" autocomplete="off" autocapitalize="sentences" spellcheck="false" maxlength="400" placeholder="Écris en français…" '+(TS.busy?"disabled":"")+'><button class="tu-send" aria-label="Enviar" '+(TS.busy?"disabled":"")+">"+SEND+"</button></form>"+
        '<div class="tu-acc">'+["é","è","à","ç","ê","ô","ù","œ","«","»"].map(function(c){ return '<button type="button" data-tuacc="'+c+'">'+c+"</button>"; }).join("")+"</div>")+
      "</section>";
  }
  function start(id){ TS.sc=id; var s=byId[id]; TS.msgs=[{me:false,t:s.open[lvl()]||s.open.A1,es:""}]; TS.busy=false; TS.err=""; TS.hint=null; TS.hintList=[]; TS.tr={}; TS.ended=false; TS.fixes=0; TS.xp=0; go("tutor"); scrollTo(0,0); scrollChat(); try{ if(!S.muteTut) play(TS.msgs[0].t,true); }catch(e){} }

  document.addEventListener("submit",function(e){ if(!e.target.matches||!e.target.matches("[data-tuform]")) return; e.preventDefault(); var i=document.getElementById("tuIn"); if(i){ var v=i.value; i.value=""; send(v); } },true);
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-tulv],[data-tusc],[data-tugo],[data-tuplay],[data-tutr],[data-tuhint],[data-tuacc],[data-am='tutor']"); if(!b) return;
    if(b.matches("[data-tugo]")&&b.closest("form")&&b.dataset.tugo!=="hint") return;
    e.preventDefault(); e.stopPropagation();
    var d=b.dataset;
    if(d.am==="tutor"){ TS.sc=null; go("tutor"); scrollTo(0,0); return; }
    if(d.tulv){ TS.lv=d.tulv; render(); return; }
    if(d.tusc){ if(window.PLX_DEMO){ try{ toast("En la demo la IA no está disponible."); }catch(x){} return; } return start(d.tusc); }
    if(d.tuplay!=null){ var m=TS.msgs[+d.tuplay]; m&&play(m.t); return; }
    if(d.tutr!=null){ TS.tr[+d.tutr]=!TS.tr[+d.tutr]; render(); return; }
    if(d.tuhint){ var i=document.getElementById("tuIn"); if(i){ i.value=d.tuhint; i.focus(); } return; }
    if(d.tuacc){ var inp=document.getElementById("tuIn"); if(inp){ var p=inp.selectionStart||inp.value.length; inp.value=inp.value.slice(0,p)+d.tuacc+inp.value.slice(inp.selectionEnd||p); inp.focus(); inp.setSelectionRange(p+1,p+1); } return; }
    var a=d.tugo;
    if(a==="menu"){ TS.sc=null; render(); scrollTo(0,0); return; }
    if(a==="again"){ return start(TS.sc); }
    if(a==="end"){ return finish(); }
    if(a==="retry"){ return turn(); }
    if(a==="hint"){ TS.hint=!TS.hint; if(TS.hint&&(!TS.hintList||!TS.hintList.length)){ var L=lvl(); TS.hintList=L==="A1"?["Je m'appelle…","Oui, j'aime ça !","Je ne comprends pas, tu peux répéter ?"]:["Je pense que…","Ça dépend, parce que…","Et toi, qu'est-ce que tu en penses ?"]; } render(); scrollChat(); return; }
  },true);

  /* accesos */
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{
      if(view==="retos"){
        var f=document.querySelector("#view .am-feat");
        if(f&&!f.querySelector(".amf.tut")){ var o=f.querySelector(".amf.oral"); var h='<button class="amf tut" data-am="tutor"><span class="amf-i">💬</span><b>Conversa con Manzana</b><small>Chat en francés con IA · te corrige</small></button>'; o?o.insertAdjacentHTML("afterend",h):f.insertAdjacentHTML("beforeend",h); }
      }
      if(view==="tutor"){ document.querySelectorAll('#tabbar [data-view="retos"],.nav [data-view="retos"]').forEach(function(x){ x.setAttribute("aria-current","page"); }); }
    }catch(e){}
    return r;
  };

  var css=`
  .tu-hero{display:flex;align-items:center;gap:16px;padding:20px 22px;border-radius:24px;color:#fff;margin:6px 0 12px;background:linear-gradient(125deg,#9d174d,#db2777 50%,#f59e0b);box-shadow:0 22px 40px -28px #db2777}
  .tu-hero img{width:96px;height:96px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,.5);flex:none}
  .tu-hero small{font-weight:800;opacity:.9;letter-spacing:.05em;text-transform:uppercase;font-size:.74rem}.tu-hero h1{color:#fff!important;margin:4px 0 6px;font-size:1.8rem}.tu-hero p{margin:0;line-height:1.45;opacity:.95;max-width:620px}
  .tu-warn{padding:12px 14px;border-radius:16px;background:#fff7ed;border:1.5px solid #fed7aa;color:#7c2d12;font-weight:600;margin:0 0 8px}
  html[data-theme=dark] .tu-warn{background:#2e1f0f;border-color:#6b3d12;color:#fed7aa}
  .tu-h{font-size:1.05rem;margin:16px 0 8px}
  .tu-lv{display:flex;gap:8px;flex-wrap:wrap}.tu-lv button{all:unset;cursor:pointer;min-width:52px;text-align:center;padding:9px 12px;border-radius:14px;border:1.5px solid var(--line);background:var(--raise);font-weight:800}
  .tu-lv button.on{background:#db2777;border-color:#db2777;color:#fff}
  .tu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
  .tu-sc{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:3px;padding:16px;border-radius:20px;background:var(--raise);border:1.5px solid var(--line);box-shadow:0 12px 24px -20px rgba(157,23,77,.55);transition:transform .15s}
  .tu-sc:hover:not([disabled]){transform:translateY(-2px);border-color:#f9a8d4}.tu-sc[disabled]{opacity:.55;cursor:not-allowed}
  .tu-sc .tu-i{font-size:28px}.tu-sc small{color:var(--stone)}
  .tu-lv button:focus-visible,.tu-sc:focus-visible,.tu-tools button:focus-visible,.tu-hints button:focus-visible,.tu-acc button:focus-visible{outline:3px solid #db2777;outline-offset:2px}
  .tu-note{color:var(--stone);font-size:.85rem;margin:14px 2px}
  .tut-chat{display:flex;flex-direction:column;max-width:760px;margin:0 auto}
  .tu-top{display:flex;align-items:center;gap:10px;margin:4px 0 8px}.tu-top .gback{margin:0;flex:none}
  .tu-ttl{flex:1;display:flex;align-items:center;gap:8px;min-width:0}.tu-ttl div{min-width:0}.tu-ttl b,.tu-ttl small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tu-ttl>span{font-size:26px}.tu-ttl div{display:grid}.tu-ttl small{color:var(--stone)}
  .tu-end-b{all:unset;flex:none;cursor:pointer;padding:8px 14px;border-radius:99px;border:1.5px solid var(--line);font-weight:800;font-size:.85rem}.tu-end-b[disabled]{opacity:.45;cursor:default}
  .tu-chat{flex:1;min-height:320px;max-height:calc(100dvh - 330px);overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:24px;background:var(--surf2);border:1.5px solid var(--line)}
  .tu-row{display:flex;gap:8px;align-items:flex-end;max-width:88%}
  .tu-row.me{align-self:flex-end;flex-direction:column;align-items:flex-end}
  .tu-row.mz img{width:34px;height:34px;border-radius:50%;object-fit:cover;flex:none}
  .tu-b{padding:10px 14px;border-radius:18px;line-height:1.45;white-space:pre-wrap;word-break:break-word}
  .tu-row.mz .tu-b{background:var(--raise);border:1.5px solid var(--line);border-bottom-left-radius:6px}
  .tu-row.me .tu-b{background:#db2777;color:#fff;border-bottom-right-radius:6px}
  .tu-tools{display:flex;gap:6px;margin:4px 0 0 4px}.tu-tools button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:.78rem;font-weight:800;color:var(--stone);padding:3px 8px;border-radius:99px}
  .tu-tools button:hover{background:var(--surf3)}
  .tu-es{margin:4px 0 0 4px;font-size:.88rem;color:var(--stone);font-style:italic}
  .tu-fix{max-width:100%;padding:8px 12px;border-radius:14px;background:#fff7ed;border:1.5px solid #fed7aa;color:#431407;font-size:.9rem;line-height:1.4}
  .tu-fix small{display:block;color:#7c2d12;margin-top:2px}
  html[data-theme=dark] .tu-fix{background:#2e1f0f;border-color:#6b3d12;color:#fde68a}html[data-theme=dark] .tu-fix small{color:#fed7aa}
  .tu-ok{font-size:.78rem;font-weight:800;color:#16a34a}
  .tu-typing{display:flex;gap:4px;padding:14px 16px}.tu-typing i{width:8px;height:8px;border-radius:50%;background:var(--stone);animation:tuDot 1s infinite}.tu-typing i:nth-child(2){animation-delay:.15s}.tu-typing i:nth-child(3){animation-delay:.3s}
  @keyframes tuDot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
  .tu-err{align-self:center;display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;padding:10px 12px;border-radius:14px;background:#fee2e2;color:#7f1d1d;font-weight:600;font-size:.9rem}
  html[data-theme=dark] .tu-err{background:#3a161c;color:#fca5a5}
  .tu-end{align-self:stretch;display:flex;gap:12px;align-items:center;padding:14px;border-radius:18px;background:var(--raise);border:1.5px solid var(--line)}.tu-end img{width:72px;height:72px;border-radius:50%;object-fit:cover}.tu-end p{margin:2px 0 8px;color:var(--stone)}.tu-end .gbtn{width:auto}
  .tu-hints{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 0}.tu-hints button{all:unset;cursor:pointer;padding:6px 12px;border-radius:99px;background:#fdf2f8;border:1.5px solid #fbcfe8;color:#9d174d;font-weight:700;font-size:.85rem}
  html[data-theme=dark] .tu-hints button{background:#2a1422;border-color:#6b2148;color:#f9a8d4}
  .tu-form{display:flex;gap:8px;margin-top:10px}
  .tu-form input{flex:1;min-width:0;padding:13px 16px;border-radius:99px;border:1.5px solid var(--line);background:var(--raise);color:var(--ink);font:inherit;font-size:1rem}
  .tu-form input:focus{outline:none;border-color:#db2777;box-shadow:0 0 0 3px rgba(219,39,119,.18)}
  .tu-send,.tu-hint-b{all:unset;cursor:pointer;flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center}
  .tu-send{background:#db2777;color:#fff}.tu-send[disabled]{opacity:.5}.tu-hint-b{background:var(--surf3);font-size:1.2rem}
  .tu-acc{display:flex;gap:4px;flex-wrap:wrap;margin:8px 0 4px}.tu-acc button{all:unset;cursor:pointer;min-width:34px;text-align:center;padding:5px 0;border-radius:10px;background:var(--surf3);font-weight:700}
  .amf.tut{background:linear-gradient(135deg,#9d174d,#db2777 60%,#f59e0b)}
  @media (max-width:640px){.tu-hero{padding:16px}.tu-hero img{width:68px;height:68px}.tu-hero h1{font-size:1.4rem}.tu-row{max-width:94%}.tu-chat{max-height:calc(100dvh - 360px);padding:10px}}
  `;
  var st=document.createElement("style"); st.id="plx39"; st.textContent=css; document.head.appendChild(st);
})();
