/* PLEX PLAY 1.13 — Aprende más: lecturas graduadas, simulacros DELF/DALF y expresión oral con IA */
(function(){
  "use strict";
  if(typeof GV==="undefined"||typeof render!=="function") return;
  var LEC=window.__LEC||[], SIM=window.__SIM||[], ORAL=window.__ORAL||[], XLOAD=null;
  function loadExtra(){
    if(LEC.length) return Promise.resolve();
    if(XLOAD) return XLOAD;
    XLOAD=new Promise(function(res){ var sc=document.createElement("script"); sc.src="extra.js?v=114c"; sc.onload=function(){ LEC=window.__LEC||[]; SIM=window.__SIM||[]; ORAL=window.__ORAL||[]; res(); }; sc.onerror=function(){ XLOAD=null; res(); }; document.head.appendChild(sc); });
    return XLOAD;
  }
  window.PLXLoadExtra=loadExtra;
  function needData(){ if(LEC.length) return ""; loadExtra().then(function(){ if(AMV[view]) render(); }); return '<section class="gview amv"><div class="or-wait"><div class="spin"></div><p>Cargando…</p></div></section>'; }
  (window.requestIdleCallback||function(f){ setTimeout(f,2500); })(function(){ loadExtra().then(function(){ if(view==="parcours"||view==="retos"){ try{ render(); }catch(e){} } }); },{timeout:4000});
  var LV=["A1","A2","B1","B2","C1"];
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var q=function(s,r){return (r||document).querySelector(s)};
  function st(k){ if(!S[k]||typeof S[k]!=="object") S[k]={}; return S[k]; }
  function wc(t){ return (String(t||"").trim().match(/[^\s'’]+/g)||[]).length; }
  function mmss(s){ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+":"+("0"+s%60).slice(-2); }
  function recLevel(){
    var a=0; try{ var c=cefr().lvl; a=LV.indexOf(c); }catch(e){}
    var g=+(gEnsure().grp||0), b=g?[0,0,1,2,2,3,3,4,4,4,4][g]:0;
    return LV[Math.max(a<0?0:a,b)];
  }
  function reward(xp,act){ try{ addXP(xp); act&&addAct(act); save(!0); typeof gAfterProgress==="function"&&gAfterProgress(); }catch(e){} }
  function back(to,label){ return '<button class="gback" data-view="'+to+'">'+(typeof IC!=="undefined"&&IC.back?IC.back:"‹")+" "+label+"</button>"; }
  var BADGE={A1:"#16a34a",A2:"#0d9488",B1:"#2563eb",B2:"#7c3aed",C1:"#db2777"};
  function lvlChip(l){ return '<span class="am-lv" style="--c:'+(BADGE[l]||"#475569")+'">'+l+"</span>"; }
  function filterBar(cur,attr){ return '<div class="am-filter" role="group" aria-label="Nivel">'+["all"].concat(LV).map(function(l){ return '<button '+attr+'="'+l+'" aria-pressed="'+(cur===l)+'">'+(l==="all"?"Todos":l)+"</button>"; }).join("")+"</div>"; }

  /* ---------- IA: prueba varios tipos por compatibilidad con el servidor ---------- */
  async function aiJSON(prompt,text){
    if(typeof sample==="undefined"||!sample||!sample.json) throw {code:"no_ai"};
    var kinds=["oral","why","atelier"], last=null;
    for(var i=0;i<kinds.length;i++){
      try{ return await sample.json(prompt,{kind:kinds[i],modelTier:"default",text:text||""}); }
      catch(e){ last=e; var c=e&&e.code; if(["daily_limit","rate_limited","session_expired","offline","cancelled","invalid_json"].indexOf(c)>=0) throw e; }
    }
    throw last||{code:"provider_error"};
  }
  function aiErr(e){ var c=e&&e.code; return c==="no_ai"?"Inicia sesión con tu correo institucional para recibir comentarios de la IA.":c==="daily_limit"?"Ya usaste tus ayudas de IA de hoy. Mañana se renuevan.":c==="rate_limited"?"Hay muchas solicitudes ahora. Intenta de nuevo en unos minutos.":c==="offline"?"Sin conexión. Revisa tu internet.":c==="session_expired"?"Tu sesión expiró: vuelve a entrar.":"La IA no respondió bien esta vez. Inténtalo de nuevo."; }

  /* =====================================================================
     LECTURAS GRADUADAS
     ===================================================================== */
  var LS={lv:null,id:null,ans:{},tip:null};
  function lecDone(id){ return st("lec")[id]; }
  GV.lecturas=function(){ var _w=needData(); if(_w) return _w;
    if(!LS.lv) LS.lv=recLevel();
    var list=LEC.filter(function(r){ return LS.lv==="all"||r.level===LS.lv; });
    var done=Object.keys(st("lec")).length;
    return '<section class="gview amv">'+back("retos","Retos")+
      '<div class="am-hero lec"><div><small>Aprende más</small><h1>Lecturas graduadas</h1><p>Textos cortos por nivel con audio, palabras clave que se tocan para ver su traducción y preguntas de comprensión.</p></div><div class="am-count"><b>'+done+"/"+LEC.length+'</b><span>leídas</span></div></div>'+
      filterBar(LS.lv,"data-lecf")+
      '<div class="am-grid">'+list.map(function(r){
        var d=lecDone(r.id), min=Math.max(1,Math.round(wc(r.text)/110));
        return '<button class="am-card" data-lec="'+r.id+'"><span class="am-emo">'+esc(r.emoji||"📖")+"</span>"+lvlChip(r.level)+'<b>'+esc(r.title)+'</b><small>'+esc(r.theme)+" · "+min+" min · "+r.questions.length+" preguntas</small>"+(d?'<em class="am-ok">✓ '+d.ok+"/"+d.n+"</em>":'<em class="am-go">Leer →</em>')+"</button>";
      }).join("")+"</div></section>";
  };
  function glossHTML(r){
    var text=r.text, G=(r.gloss||[]).slice().sort(function(a,b){ return b[0].length-a[0].length; });
    return text.split(/\n\n+/).map(function(p){
      var parts=[{t:p}];
      G.forEach(function(g){
        var gi=r.gloss.indexOf(g);
        parts=parts.reduce(function(acc,x){
          if(x.g!=null){ acc.push(x); return acc; }
          var s=x.t, k=s.indexOf(g[0]);
          if(k<0){ acc.push(x); return acc; }
          if(k>0) acc.push({t:s.slice(0,k)});
          acc.push({t:g[0],g:gi});
          if(k+g[0].length<s.length) acc.push({t:s.slice(k+g[0].length)});
          return acc;
        },[]);
      });
      return "<p>"+parts.map(function(x){ return x.g!=null?'<button class="lw" data-lw="'+x.g+'">'+esc(x.t)+"</button>":esc(x.t); }).join("")+"</p>";
    }).join("");
  }
  GV.lectura=function(){ var _w=needData(); if(_w) return _w;
    var r=LEC.find(function(x){ return x.id===LS.id; }); if(!r){ return GV.lecturas(); }
    var n=r.questions.length, answered=Object.keys(LS.ans).length, ok=Object.keys(LS.ans).filter(function(k){ return LS.ans[k]===r.questions[k].a; }).length;
    var qs=r.questions.map(function(qq,i){
      var a=LS.ans[i], has=a!=null;
      return '<div class="lq'+(has?(a===qq.a?" ok":" ko"):"")+'"><p class="lq-q"><span>'+(i+1)+"</span>"+esc(qq.q)+'</p><div class="lq-o">'+qq.o.map(function(o,j){
        var c=has?(j===qq.a?"ok":j===a?"ko":"dim"):"";
        return '<button class="'+c+'" data-lqa="'+i+'" data-j="'+j+'" '+(has?"disabled":"")+">"+esc(o)+"</button>";
      }).join("")+"</div>"+(has?'<p class="lq-why">'+(a===qq.a?"✅ ":"❌ ")+qq.why+"</p>":"")+"</div>";
    }).join("");
    var hasAudio=typeof AUDIO!=="undefined"&&AUDIO["lec:"+r.id];
    return '<section class="gview amv lecv">'+back("lecturas","Lecturas")+
      '<article class="lec-card"><div class="lec-head"><span class="am-emo big">'+esc(r.emoji||"📖")+"</span><div>"+lvlChip(r.level)+' <small class="lec-th">'+esc(r.theme)+'</small><h1>'+esc(r.title)+'</h1><p class="lec-intro">'+esc(r.intro)+"</p></div></div>"+
      '<div class="lec-audio"><button class="gbtn sm" data-lecplay>'+(hasAudio?"▶ Escuchar el texto":"▶ Escuchar (voz del dispositivo)")+'</button><button class="gbtn ghost sm" data-lecslow>🐢 Más despacio</button><span class="lec-tipnote">Toca las palabras <u>subrayadas</u> para ver qué significan.</span></div>'+
      '<div class="lec-text">'+glossHTML(r)+"</div>"+
      '<details class="lec-voc"><summary>Vocabulario del texto ('+r.gloss.length+")</summary><ul>"+r.gloss.map(function(g){ return "<li><b>"+esc(g[0])+"</b><span>"+esc(g[1])+"</span></li>"; }).join("")+"</ul></details></article>"+
      '<div class="lec-quiz"><h2>Comprensión <small>'+answered+"/"+n+"</small></h2>"+qs+
      (answered===n?'<div class="lec-res"><b>'+ok+"/"+n+"</b><span>"+(ok===n?"¡Perfecto! Entendiste todo.":ok>=n*.6?"¡Bien! Revisa las explicaciones de lo que fallaste.":"Vuelve a leer el texto con calma y usa el vocabulario.")+'</span><div class="am-row"><button class="gbtn" data-lecnext>Siguiente lectura →</button><button class="gbtn ghost" data-lecagain>Repetir</button></div></div>':"")+
      "</div></section>";
  };
  function lecAnswer(i,j){
    var r=LEC.find(function(x){ return x.id===LS.id; }); if(!r||LS.ans[i]!=null) return;
    LS.ans[i]=j; var ok=j===r.questions[i].a;
    try{ typeof SFX!=="undefined"&&(ok?SFX.ok&&SFX.ok():SFX.ko&&SFX.ko()); }catch(e){}
    var n=r.questions.length;
    if(Object.keys(LS.ans).length===n){
      var good=Object.keys(LS.ans).filter(function(k){ return LS.ans[k]===r.questions[k].a; }).length, prev=lecDone(r.id);
      st("lec")[r.id]={ok:Math.max(good,prev?prev.ok:0),n:n,at:Date.now()};
      reward(prev?5:10+good*3,"L:"+r.id);
      setTimeout(function(){ toast(prev?"+5 XP":"+"+(10+good*3)+" XP · lectura completada"); },200);
    }
    var y=scrollY; render(); scrollTo(0,y);
  }

  /* =====================================================================
     GRABACIÓN Y TRANSCRIPCIÓN (expresión oral y simulacro)
     ===================================================================== */
  var REC=null;
  function recMode(){
    if(typeof IS_CHROME_SPEECH!=="undefined"&&IS_CHROME_SPEECH) return "live";
    if(typeof CLOUD_SPEECH==="function"&&CLOUD_SPEECH()) return "cloud";
    return "none";
  }
  function recStart(onUpdate){
    var mode=recMode(); REC={mode:mode,text:"",interim:"",t0:Date.now(),on:true,onUpdate:onUpdate};
    if(mode==="live"){
      var SR=window.SpeechRecognition||window.webkitSpeechRecognition, rec=new SR();
      rec.lang="fr-FR"; rec.continuous=true; rec.interimResults=true;
      rec.onresult=function(e){ var fin="",it=""; for(var i=e.resultIndex;i<e.results.length;i++){ var t=e.results[i][0].transcript; if(e.results[i].isFinal) fin+=t+" "; else it+=t; } if(fin) REC.text+=fin; REC.interim=it; onUpdate&&onUpdate(); };
      rec.onerror=function(e){ if(e.error==="not-allowed"||e.error==="service-not-allowed"){ REC.err="Permite el micrófono en tu navegador para grabar."; REC.on=false; onUpdate&&onUpdate(); } };
      rec.onend=function(){ if(REC&&REC.on){ try{ rec.start(); }catch(x){} } };
      try{ rec.start(); }catch(x){}
      REC.sr=rec; return Promise.resolve();
    }
    if(mode==="cloud"){
      return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(function(stream){
        var AC=window.AudioContext||window.webkitAudioContext, ac; try{ ac=new AC({sampleRate:16000}); }catch(x){ ac=new AC(); }
        var src=ac.createMediaStreamSource(stream), proc=ac.createScriptProcessor(4096,1,1);
        REC.bufs=[]; REC.rate=ac.sampleRate; REC.stream=stream; REC.ac=ac; REC.proc=proc; REC.src=src;
        proc.onaudioprocess=function(e){ if(REC&&REC.on) REC.bufs.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
        src.connect(proc); proc.connect(ac.destination);
      }).catch(function(){ REC.err="No pudimos usar el micrófono. Revisa los permisos."; REC.on=false; onUpdate&&onUpdate(); });
    }
    REC.err="Este navegador no puede transcribir tu voz. Usa Chrome, o inicia sesión para usar la transcripción en la nube. También puedes escribir lo que dijiste."; REC.on=false;
    return Promise.resolve();
  }
  async function recStop(){
    if(!REC) return {text:"",secs:0};
    var R=REC; R.on=false; var secs=(Date.now()-R.t0)/1000;
    if(R.mode==="live"){ try{ R.sr.stop(); }catch(e){} await new Promise(function(r){ setTimeout(r,700); }); return {text:(R.text+" "+(R.interim||"")).trim(),secs:secs}; }
    if(R.mode==="cloud"&&R.bufs){
      try{ R.proc.disconnect(); R.src.disconnect(); R.stream.getTracks().forEach(function(t){ t.stop(); }); R.ac.close(); }catch(e){}
      if(!R.bufs.length) return {text:"",secs:secs,err:"No se grabó nada."};
      var b64=wavB64(R.bufs,R.rate), url=null;
      try{ var bin=atob(b64), u8=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) u8[i]=bin.charCodeAt(i); url=URL.createObjectURL(new Blob([u8],{type:"audio/wav"})); }catch(e){}
      try{ var txt=await PCB.transcribe(b64,"audio/wav",""); return {text:String(txt||"").replace(/^["«\s]+|["»\s]+$/g,""),secs:secs,url:url}; }
      catch(e){ return {text:"",secs:secs,url:url,err:e&&e.code==="daily_limit"?"Llegaste al límite de transcripciones de hoy. Escribe lo que dijiste.":"No se pudo transcribir. Escribe lo que dijiste para recibir comentarios."}; }
    }
    return {text:"",secs:secs,err:R.err};
  }
  var CONNECT=["d'abord","tout d'abord","ensuite","puis","enfin","finalement","premièrement","deuxièmement","de plus","en outre","par ailleurs","cependant","pourtant","toutefois","néanmoins","en revanche","par contre","mais","donc","alors","c'est pourquoi","ainsi","en effet","car","parce que","puisque","par exemple","notamment","en conclusion","pour conclure","bref","à mon avis","selon moi","je pense que","il me semble que","d'une part","d'autre part","bien que","même si","alors que"];
  function metrics(text,secs){
    var t=" "+String(text||"").toLowerCase().replace(/[’]/g,"'")+" ", w=wc(text), words=(t.match(/[a-zàâçéèêëîïôûùüÿœæ']+/g)||[]);
    var uniq={}; words.forEach(function(x){ uniq[x]=1; });
    var found=CONNECT.filter(function(c){ return t.indexOf(" "+c+" ")>=0||t.indexOf(" "+c+",")>=0; });
    return {w:w,wpm:secs>5?Math.round(w/(secs/60)):0,var:words.length?Math.round(Object.keys(uniq).length/words.length*100):0,con:found,secs:secs};
  }
  function metricsHTML(m,target){
    return '<div class="or-m"><div><b>'+mmss(m.secs)+'</b><span>duración'+(target?" (meta "+mmss(target)+")":"")+'</span></div><div><b>'+m.w+'</b><span>palabras</span></div><div><b>'+(m.wpm||"–")+'</b><span>palabras/min</span></div><div><b>'+m.var+'%</b><span>variedad léxica</span></div></div>'+
      '<p class="or-con">'+(m.con.length?"Conectores que usaste: "+m.con.map(function(c){ return "<em>"+esc(c)+"</em>"; }).join(" "):"No detectamos conectores: prueba con <em>d'abord, ensuite, par exemple, en conclusion</em>.")+"</p>";
  }
  function oralPrompt(p,text,m){
    return "Tu es examinateur du DELF/DALF et professeur de FLE. L'apprenant est hispanophone (Colombie), niveau visé "+p.level+".\n"+
      "Tâche orale ("+p.type+") : "+p.prompt+(p.doc?"\nDocument déclencheur : \"\"\""+p.doc+"\"\"\"":"")+
      "\nDurée de parole : "+Math.round(m.secs)+" s (attendue ≈ "+p.talk_s+" s). Nombre de mots : "+m.w+".\n"+
      "Transcription automatique de sa production orale (elle peut contenir des erreurs de reconnaissance ; ne sanctionne pas la ponctuation) :\n\"\"\"\n"+String(text).slice(0,6000)+"\n\"\"\"\n"+
      "Réponds uniquement avec un objet JSON :\n{\"note\":<0 à 20>,\"bilan\":\"deux phrases en espagnol, bienveillantes et précises\",\"forts\":[\"2 à 3 points forts, en espagnol\"],\"ameliorer\":[\"2 à 4 conseils concrets, en espagnol\"],\"erreurs\":[{\"extrait\":\"segment exact de la transcription\",\"correction\":\"forme correcte\",\"explication\":\"une phrase en espagnol\"}],\"version\":\"une version améliorée de sa production en français, au même niveau + un cran, en gardant ses idées\"}\n"+
      "Critères : adéquation à la consigne, cohérence et connecteurs, étendue du lexique, correction grammaticale, aisance (longueur). Maximum 8 erreurs, les plus importantes. N'invente pas d'erreurs.";
  }
  function aiFbHTML(r){
    if(!r) return "";
    return '<div class="or-ai"><div class="or-note"><b>'+Math.max(0,Math.min(20,+r.note||0))+'</b><span>/20</span></div><p class="or-bilan">'+esc(r.bilan||"")+"</p>"+
      (r.forts&&r.forts.length?'<h4>Lo que hiciste bien</h4><ul class="ok">'+r.forts.map(function(x){ return "<li>"+esc(x)+"</li>"; }).join("")+"</ul>":"")+
      (r.ameliorer&&r.ameliorer.length?'<h4>Para mejorar</h4><ul>'+r.ameliorer.map(function(x){ return "<li>"+esc(x)+"</li>"; }).join("")+"</ul>":"")+
      (r.erreurs&&r.erreurs.length?'<h4>Correcciones</h4><ol class="or-err">'+r.erreurs.map(function(e){ return "<li><s>"+esc(e.extrait)+"</s> → <em>"+esc(e.correction)+"</em><small>"+esc(e.explication||"")+"</small></li>"; }).join("")+"</ol>":"")+
      (r.version?'<details class="or-ver"><summary>Versión mejorada</summary><p>'+esc(r.version)+"</p></details>":"")+"</div>";
  }

  /* =====================================================================
     EXPRESIÓN ORAL CON IA
     ===================================================================== */
  var OS={lv:null,id:null,phase:"brief",t:0,tick:0,res:null,ai:null,busy:false,err:""};
  GV.oral=function(){ var _w=needData(); if(_w) return _w;
    if(!OS.lv) OS.lv=recLevel();
    var list=ORAL.filter(function(p){ return OS.lv==="all"||p.level===OS.lv; }), H=st("oralh");
    var mode=recMode();
    return '<section class="gview amv">'+back("retos","Retos")+
      '<div class="am-hero oral"><div><small>Aprende más</small><h1>Expresión oral con IA</h1><p>Elige un tema, prepárate, habla en voz alta y recibe una nota orientativa sobre 20 con correcciones y una versión mejorada.</p></div><div class="am-count"><b>'+Object.keys(H).length+"/"+ORAL.length+'</b><span>temas</span></div></div>'+
      (mode==="none"?'<p class="am-warn">Tu navegador no transcribe la voz. Usa Chrome o inicia sesión; también puedes escribir lo que dijiste.</p>':"")+
      filterBar(OS.lv,"data-orf")+
      '<div class="am-grid">'+list.map(function(p){ var h=H[p.id]; return '<button class="am-card" data-oral="'+p.id+'"><span class="am-emo">🎙️</span>'+lvlChip(p.level)+"<b>"+esc(p.title)+"</b><small>"+esc(p.type)+" · "+mmss(p.talk_s)+" para hablar</small>"+(h?'<em class="am-ok">Mejor nota: '+h.best+"/20</em>":'<em class="am-go">Practicar →</em>')+"</button>"; }).join("")+"</div></section>";
  };
  GV.oralp=function(){ var _w=needData(); if(_w) return _w;
    var p=ORAL.find(function(x){ return x.id===OS.id; }); if(!p) return GV.oral();
    var body="";
    var head='<div class="or-head">'+lvlChip(p.level)+' <small>'+esc(p.type)+'</small><h1>'+esc(p.title)+'</h1><p class="or-prompt">'+esc(p.prompt)+'</p><p class="or-es">'+esc(p.prompt_es)+"</p>"+(p.doc?'<blockquote class="or-doc">'+esc(p.doc)+"</blockquote>":"")+"</div>";
    var help='<div class="or-help"><div><h4>Expresiones útiles</h4><ul class="or-useful">'+p.useful.map(function(u){ return "<li>"+esc(u)+"</li>"; }).join("")+'</ul></div><div><h4>Consejos</h4><ul>'+p.tips.map(function(u){ return "<li>"+esc(u)+"</li>"; }).join("")+"</ul></div></div>";
    if(OS.phase==="brief"){
      body=head+help+'<div class="or-cta"><button class="gbtn wide" data-orgo="prep">⏱ Preparar ('+mmss(p.prep_s)+')</button><button class="gbtn ghost wide" data-orgo="talk">🎙️ Hablar ya</button></div>';
    } else if(OS.phase==="prep"){
      body=head+'<div class="or-timer prep"><b id="ortime">'+mmss(p.prep_s-OS.t)+'</b><span>de preparación · toma notas de tus ideas</span></div>'+help+'<div class="or-cta"><button class="gbtn wide" data-orgo="talk">🎙️ Empezar a hablar</button></div>';
    } else if(OS.phase==="talk"){
      body='<div class="or-head compact">'+lvlChip(p.level)+"<h1>"+esc(p.title)+'</h1><p class="or-prompt">'+esc(p.prompt)+'</p></div><div class="or-rec"><button class="or-mic on" data-orgo="stop" aria-label="Terminar"><span></span></button><b id="ortime">'+mmss(OS.t)+'</b><small>Meta: '+mmss(p.talk_s)+' · toca para terminar</small><div class="or-bar"><i id="orbar" style="width:'+Math.min(100,OS.t/p.talk_s*100)+'%"></i></div><p class="or-live" id="orlive">'+(REC&&REC.mode==="live"?"Te escucho…":"Grabando…")+"</p></div>"+'<details class="or-mini"><summary>Ver expresiones útiles</summary><ul class="or-useful">'+p.useful.map(function(u){ return "<li>"+esc(u)+"</li>"; }).join("")+"</ul></details>";
    } else if(OS.phase==="wait"){
      body='<div class="or-wait"><div class="spin"></div><p>Procesando tu grabación…</p></div>';
    } else if(OS.phase==="result"){
      var R=OS.res||{text:"",secs:0}, m=metrics(R.text,R.secs);
      body='<div class="or-head compact">'+lvlChip(p.level)+"<h1>"+esc(p.title)+"</h1></div>"+
        (R.url?'<div class="or-play"><span>Tu grabación</span><audio controls src="'+R.url+'"></audio></div>':"")+
        (R.err?'<p class="am-warn">'+esc(R.err)+"</p>":"")+
        '<label class="or-tx"><span>Lo que dijiste (puedes corregir errores de reconocimiento)</span><textarea id="ortext" rows="6" placeholder="Escribe aquí lo que dijiste en francés…">'+esc(R.text)+"</textarea></label>"+
        metricsHTML(m,p.talk_s)+
        (OS.ai?aiFbHTML(OS.ai):'<div class="or-cta"><button class="gbtn wide" data-orgo="ai" '+(OS.busy?"disabled":"")+">"+(OS.busy?"La IA está escuchando…":"✨ Pedir comentarios a la IA")+"</button></div>")+
        (OS.err?'<p class="am-warn">'+esc(OS.err)+"</p>":"")+
        '<div class="am-row"><button class="gbtn ghost" data-orgo="again">🔁 Intentar de nuevo</button><button class="gbtn ghost" data-view="oral">Otro tema</button></div>';
    }
    return '<section class="gview amv orv">'+back("oral","Temas")+'<div class="or-card">'+body+"</div></section>";
  };
  function orTick(){
    clearInterval(OS.tick);
    OS.tick=setInterval(function(){
      if(view!=="oralp"){ clearInterval(OS.tick); if(REC&&REC.on) recStop(); return; }
      var p=ORAL.find(function(x){ return x.id===OS.id; }); OS.t++;
      var el=q("#ortime");
      if(OS.phase==="prep"){ if(el) el.textContent=mmss(p.prep_s-OS.t); if(OS.t>=p.prep_s) orGo("talk"); }
      else if(OS.phase==="talk"){
        if(el) el.textContent=mmss(OS.t); var b=q("#orbar"); if(b) b.style.width=Math.min(100,OS.t/p.talk_s*100)+"%";
        if(OS.t===p.talk_s){ try{ typeof SFX!=="undefined"&&SFX.ok&&SFX.ok(); }catch(e){} toast("¡Llegaste a la meta de tiempo! Puedes terminar."); }
        if(OS.t>=p.talk_s*1.6) orGo("stop");
      }
    },1000);
  }
  async function orGo(a){
    var p=ORAL.find(function(x){ return x.id===OS.id; });
    if(a==="prep"){ OS.phase="prep"; OS.t=0; render(); orTick(); return; }
    if(a==="talk"){
      OS.phase="talk"; OS.t=0; render(); orTick();
      await recStart(function(){ var l=q("#orlive"); if(l&&REC) l.innerHTML=REC.err?esc(REC.err):esc((REC.text+" "+(REC.interim||"")).trim().slice(-220)||"Te escucho…"); });
      if(REC&&REC.err&&REC.mode==="none"){ clearInterval(OS.tick); OS.phase="result"; OS.res={text:"",secs:0,err:REC.err}; render(); }
      return;
    }
    if(a==="stop"){
      clearInterval(OS.tick); OS.phase="wait"; render();
      OS.res=await recStop(); OS.ai=null; OS.err=""; OS.phase="result"; render();
      reward(8,"O:"+p.id); return;
    }
    if(a==="ai"){
      var ta=q("#ortext"), text=ta?ta.value.trim():""; if(OS.res) OS.res.text=text;
      if(wc(text)<8){ OS.err="Necesitamos al menos unas frases (8 palabras) para comentar tu producción."; render(); return; }
      OS.busy=true; OS.err=""; render();
      try{
        var r=await aiJSON(oralPrompt(p,text,metrics(text,OS.res?OS.res.secs:0)),text);
        if(!r||typeof r!=="object") throw {code:"invalid_json"};
        OS.ai=r; var H=st("oralh"), note=Math.max(0,Math.min(20,+r.note||0)), prev=H[p.id];
        H[p.id]={best:Math.max(note,prev?prev.best:0),last:note,at:Date.now()};
        reward(12,"OA:"+p.id);
      }catch(e){ OS.err=aiErr(e); }
      OS.busy=false; render(); return;
    }
    if(a==="again"){ OS.phase="brief"; OS.res=null; OS.ai=null; OS.err=""; render(); }
  }

  /* =====================================================================
     SIMULACROS DELF / DALF
     ===================================================================== */
  var XS={id:null,part:"intro",ans:{},plays:{},pe:"",peAI:null,peSelf:null,po:null,poAI:null,poSelf:null,busy:false,err:"",t0:0,tick:0};
  var PARTS=[["co","Comprensión oral","🎧"],["ce","Comprensión escrita","📄"],["pe","Producción escrita","✍️"],["po","Producción oral","🎙️"]];
  GV.simulacros=function(){ var _w=needData(); if(_w) return _w;
    var H=st("simh");
    return '<section class="gview amv">'+back("retos","Retos")+
      '<div class="am-hero sim"><div><small>Aprende más</small><h1>Simulacros DELF / DALF</h1><p>Exámenes de práctica con las cuatro pruebas: comprensión oral y escrita, producción escrita y oral. Cada parte vale 25 puntos; se aprueba con 50/100 y al menos 5 en cada parte.</p></div></div>'+
      '<div class="sim-list">'+SIM.map(function(s){ var h=H[s.id];
        return '<button class="sim-card" data-sim="'+s.id+'"><div class="sim-top">'+lvlChip(s.level)+"<b>"+esc(s.title)+"</b></div><p>"+esc(s.desc)+'</p><div class="sim-parts">'+PARTS.map(function(x){ return "<span>"+x[2]+" "+x[1]+"</span>"; }).join("")+"</div>"+(h?'<em class="am-ok">Mejor resultado: '+h.best+"/100"+(h.best>=50?" · aprobado":"")+"</em>":'<em class="am-go">Empezar →</em>')+"</button>"; }).join("")+"</div></section>";
  };
  function simQHTML(qs,pre){
    return qs.map(function(qq,i){ var k=pre+i, a=XS.ans[k], has=a!=null;
      return '<div class="lq'+(has&&XS.part==="review"?(a===qq.a?" ok":" ko"):"")+'"><p class="lq-q"><span>'+(i+1)+"</span>"+esc(qq.q)+'</p><div class="lq-o">'+qq.o.map(function(o,j){ var c=has&&a===j?"sel":""; return '<button class="'+c+'" data-sqa="'+k+'" data-j="'+j+'">'+esc(o)+"</button>"; }).join("")+"</div></div>";
    }).join("");
  }
  function scoreMC(prefix,docs){
    var tot=0,ok=0; docs.forEach(function(d,di){ d.questions.forEach(function(qq,i){ tot++; if(XS.ans[prefix+di+"-"+i]===qq.a) ok++; }); });
    return {ok:ok,tot:tot,pts:tot?Math.round(ok/tot*25*2)/2:0};
  }
  var SELF=[["Respondí exactamente a la consigna",5],["Mi texto/discurso tiene introducción, desarrollo y conclusión",5],["Usé conectores variados",5],["Usé vocabulario preciso y variado",5],["Cometí pocos errores de gramática",5]];
  function selfHTML(key,val){
    return '<div class="sim-self"><p>Autoevaluación (si no tienes IA): marca lo que cumpliste.</p>'+SELF.map(function(x,i){ return '<label><input type="checkbox" data-self="'+key+'" data-i="'+i+'" '+(val&&val[i]?"checked":"")+"> "+x[0]+"</label>"; }).join("")+"</div>";
  }
  function selfPts(val){ var p=0; (val||[]).forEach(function(v,i){ if(v) p+=SELF[i][1]; }); return p; }
  function simTimer(){ return '<span class="sim-clock" id="simclock">⏱ '+mmss((Date.now()-XS.t0)/1000)+"</span>"; }
  GV.simulacro=function(){ var _w=needData(); if(_w) return _w;
    var s=SIM.find(function(x){ return x.id===XS.id; }); if(!s) return GV.simulacros();
    var idx=PARTS.map(function(x){ return x[0]; }).indexOf(XS.part);
    var steps='<ol class="sim-steps">'+PARTS.map(function(x,i){ return '<li class="'+(i<idx||XS.part==="result"?"done":i===idx?"on":"")+'">'+x[2]+"<span>"+x[1]+"</span></li>"; }).join("")+"</ol>";
    var body="";
    if(XS.part==="intro"){
      body='<div class="sim-intro"><h2>Antes de empezar</h2><ul><li>🎧 <b>Comprensión oral</b>: '+s.co.length+" grabaciones. Puedes escuchar cada una <b>dos veces</b>, como en el examen.</li><li>📄 <b>Comprensión escrita</b>: "+s.ce.length+" texto(s) con preguntas.</li><li>✍️ <b>Producción escrita</b>: "+s.pe.min+"–"+s.pe.max+" palabras.</li><li>🎙️ <b>Producción oral</b>: preparación y exposición.</li></ul><p>Tómalo con calma: puedes saltar una parte y ver tu resultado al final.</p><button class=\"gbtn wide\" data-sgo=\"co\">Empezar el simulacro</button></div>";
    } else if(XS.part==="co"){
      body=s.co.map(function(d,di){ var k="co"+di, n=XS.plays[k]||0;
        return '<div class="sim-doc"><h3>'+esc(d.title)+"</h3><p class=\"sim-in\">"+esc(d.intro)+'</p><button class="gbtn sm" data-splay="'+di+'" '+(n>=2?"disabled":"")+">"+(n>=2?"Ya escuchaste dos veces":"▶ Escuchar ("+(2-n)+" "+(2-n===1?"vez":"veces")+")")+"</button>"+simQHTML(d.questions,"co"+di+"-")+"</div>"; }).join("")+
        '<div class="am-row"><button class="gbtn" data-sgo="ce">Siguiente: comprensión escrita →</button></div>';
    } else if(XS.part==="ce"){
      body=s.ce.map(function(d,di){ return '<div class="sim-doc"><h3>'+esc(d.title)+'</h3><small class="sim-src">'+esc(d.source||"")+'</small><div class="sim-text">'+d.text.split(/\n\n+/).map(function(p){ return "<p>"+esc(p)+"</p>"; }).join("")+"</div>"+simQHTML(d.questions,"ce"+di+"-")+"</div>"; }).join("")+
        '<div class="am-row"><button class="gbtn" data-sgo="pe">Siguiente: producción escrita →</button></div>';
    } else if(XS.part==="pe"){
      var w=wc(XS.pe);
      body='<div class="sim-doc"><h3>'+esc(s.pe.title)+'</h3><p class="sim-in">'+esc(s.pe.context)+'</p><p class="consigne">'+esc(s.pe.consigne)+'</p><textarea id="simpe" rows="12" placeholder="Escribe tu texto en francés…">'+esc(XS.pe)+'</textarea><p class="sim-wc" id="simwc">'+w+" palabras · entre "+s.pe.min+" y "+s.pe.max+"</p>"+
        (XS.peAI?aiFbHTML(XS.peAI):'<div class="am-row"><button class="gbtn" data-sgo="peai" '+(XS.busy?"disabled":"")+">"+(XS.busy?"Corrigiendo…":"✨ Corregir con IA")+"</button></div>"+selfHTML("pe",XS.peSelf))+
        (XS.err?'<p class="am-warn">'+esc(XS.err)+"</p>":"")+'</div><div class="am-row"><button class="gbtn" data-sgo="po">Siguiente: producción oral →</button></div>';
    } else if(XS.part==="po"){
      var P=s.po, R=XS.po;
      body='<div class="sim-doc"><h3>'+esc(P.title)+'</h3><p class="consigne">'+esc(P.consigne)+'</p><p class="sim-in">'+esc(P.consigne_es)+"</p>"+(P.doc?'<blockquote class="or-doc">'+esc(P.doc)+"</blockquote>":"")+'<ul class="sim-tips">'+P.tips.map(function(t){ return "<li>"+esc(t)+"</li>"; }).join("")+"</ul>"+
        (XS.rec?'<div class="or-rec"><button class="or-mic on" data-sgo="postop"><span></span></button><b id="simrt">'+mmss((Date.now()-XS.rec)/1000)+'</b><small>Meta: '+mmss(P.talk_s)+' · toca para terminar</small><p class="or-live" id="orlive">Te escucho…</p></div>':
          R?('<label class="or-tx"><span>Lo que dijiste</span><textarea id="simpo" rows="6">'+esc(R.text)+"</textarea></label>"+(R.url?'<audio controls src="'+R.url+'"></audio>':"")+metricsHTML(metrics(R.text,R.secs),P.talk_s)+(XS.poAI?aiFbHTML(XS.poAI):'<div class="am-row"><button class="gbtn" data-sgo="poai" '+(XS.busy?"disabled":"")+">"+(XS.busy?"Evaluando…":"✨ Evaluar con IA")+"</button></div>"+selfHTML("po",XS.poSelf))):
          '<p class="sim-in">Prepárate unos minutos (en el examen tienes '+mmss(P.prep_s)+") y luego habla unos "+mmss(P.talk_s)+'.</p><div class="am-row"><button class="gbtn" data-sgo="porec">🎙️ Empezar a hablar</button></div>')+
        (XS.err?'<p class="am-warn">'+esc(XS.err)+"</p>":"")+'</div><div class="am-row"><button class="gbtn" data-sgo="result">Ver mi resultado →</button></div>';
    } else if(XS.part==="result"){
      var co=scoreMC("co",s.co), ce=scoreMC("ce",s.ce);
      var pe=XS.peAI?Math.round((+XS.peAI.note||0)/20*25*2)/2:selfPts(XS.peSelf);
      var po=XS.poAI?Math.round((+XS.poAI.note||0)/20*25*2)/2:selfPts(XS.poSelf);
      var tot=co.pts+ce.pts+pe+po, pass=tot>=50&&[co.pts,ce.pts,pe,po].every(function(x){ return x>=5; });
      if(!XS.saved){ XS.saved=1; var H=st("simh"), prev=H[s.id]; H[s.id]={best:Math.max(tot,prev?prev.best:0),last:tot,at:Date.now()}; reward(30,"X:"+s.id); }
      body='<div class="sim-res '+(pass?"pass":"fail")+'"><div class="sim-total"><b>'+tot+'</b><span>/100</span></div><h2>'+(pass?"¡Aprobarías!":"Todavía no, pero vas en camino")+'</h2><p>'+(pass?"Superas los 50 puntos y el mínimo en cada prueba.":"Se necesitan 50/100 y al menos 5/25 en cada prueba.")+'</p>'+
        '<div class="sim-bars">'+[["🎧 Comprensión oral",co.pts,co.ok+"/"+co.tot],["📄 Comprensión escrita",ce.pts,ce.ok+"/"+ce.tot],["✍️ Producción escrita",pe,XS.peAI?"IA":"autoevaluación"],["🎙️ Producción oral",po,XS.poAI?"IA":"autoevaluación"]].map(function(x){ return '<div><span>'+x[0]+"</span><i><b style=\"width:"+(x[1]/25*100)+'%"></b></i><em>'+x[1]+"/25 <small>"+x[2]+"</small></em></div>"; }).join("")+"</div>"+
        '<div class="am-row"><button class="gbtn" data-sgo="review">Ver respuestas y explicaciones</button><button class="gbtn ghost" data-view="simulacros">Volver</button></div></div>';
    } else if(XS.part==="review"){
      body=[["co",s.co],["ce",s.ce]].map(function(pair){ return pair[1].map(function(d,di){ return '<div class="sim-doc"><h3>'+esc(d.title)+"</h3>"+d.questions.map(function(qq,i){ var a=XS.ans[pair[0]+di+"-"+i]; return '<div class="lq '+(a===qq.a?"ok":"ko")+'"><p class="lq-q"><span>'+(i+1)+"</span>"+esc(qq.q)+'</p><p class="lq-why">'+(a===qq.a?"✅ ":"❌ ")+"<b>"+esc(qq.o[qq.a])+"</b> — "+qq.why+"</p></div>"; }).join("")+(pair[0]==="co"?'<details class="sim-script"><summary>Ver la transcripción</summary>'+d.script.map(function(l){ return "<p><b>"+(l[0]==="F"?"Elle":"Lui")+" :</b> "+esc(l[1])+"</p>"; }).join("")+"</details>":"")+"</div>"; }).join(""); }).join("")+
        '<div class="am-row"><button class="gbtn ghost" data-view="simulacros">Volver a los simulacros</button></div>';
    }
    return '<section class="gview amv simv">'+back("simulacros","Simulacros")+'<div class="sim-head">'+lvlChip(s.level)+"<h1>"+esc(s.title)+"</h1>"+(XS.part!=="intro"&&XS.part!=="result"&&XS.part!=="review"?simTimer():"")+"</div>"+steps+body+"</section>";
  };
  async function simGo(a){
    var s=SIM.find(function(x){ return x.id===XS.id; });
    var ta=q("#simpe"); if(ta) XS.pe=ta.value;
    var tp=q("#simpo"); if(tp&&XS.po) XS.po.text=tp.value;
    if(["co","ce","pe","po","result","review"].indexOf(a)>=0){
      if(a==="co"&&!XS.t0){ XS.t0=Date.now(); clearInterval(XS.tick); XS.tick=setInterval(function(){ if(view!=="simulacro"){ clearInterval(XS.tick); return; } var c=q("#simclock"); if(c) c.textContent="⏱ "+mmss((Date.now()-XS.t0)/1000); var r=q("#simrt"); if(r&&XS.rec) r.textContent=mmss((Date.now()-XS.rec)/1000); },1000); }
      try{ stopAudio(); }catch(e){}
      XS.part=a; XS.err=""; render(); scrollTo(0,0); return;
    }
    if(a==="peai"){
      if(wc(XS.pe)<40){ XS.err="Escribe al menos 40 palabras antes de corregir."; render(); return; }
      XS.busy=true; XS.err=""; render();
      var pr="Tu es correcteur du "+s.title.replace("Simulacro ","")+". L'apprenant est hispanophone (Colombie).\nConsigne : "+s.pe.consigne+"\nLongueur attendue : "+s.pe.min+"–"+s.pe.max+" mots ; longueur réelle : "+wc(XS.pe)+".\nTexte :\n\"\"\"\n"+XS.pe.slice(0,8000)+"\n\"\"\"\nRéponds uniquement avec un objet JSON : {\"note\":<0 à 20>,\"bilan\":\"deux phrases en espagnol\",\"forts\":[\"en espagnol\"],\"ameliorer\":[\"conseils concrets en espagnol\"],\"erreurs\":[{\"extrait\":\"segment exact\",\"correction\":\"…\",\"explication\":\"en espagnol\"}],\"version\":\"version corrigée du texte\"}. Barème DELF/DALF (respect de la consigne, cohérence, lexique, morphosyntaxe). Maximum 10 erreurs.";
      try{ var r=await aiJSON(pr,XS.pe); if(!r||typeof r!=="object") throw {code:"invalid_json"}; XS.peAI=r; }catch(e){ XS.err=aiErr(e); }
      XS.busy=false; render(); return;
    }
    if(a==="porec"){
      XS.rec=Date.now(); XS.err=""; render();
      await recStart(function(){ var l=q("#orlive"); if(l&&REC) l.textContent=REC.err||((REC.text+" "+(REC.interim||"")).trim().slice(-200)||"Te escucho…"); });
      if(REC&&REC.err&&REC.mode==="none"){ XS.rec=0; XS.po={text:"",secs:0}; XS.err=REC.err; render(); }
      return;
    }
    if(a==="postop"){ var secs=(Date.now()-XS.rec)/1000; XS.rec=0; render(); var res=await recStop(); res.secs=res.secs||secs; XS.po=res; if(res.err) XS.err=res.err; render(); return; }
    if(a==="poai"){
      var text=XS.po?XS.po.text:""; if(wc(text)<8){ XS.err="Necesitamos al menos unas frases para evaluar."; render(); return; }
      XS.busy=true; XS.err=""; render();
      try{ var r2=await aiJSON(oralPrompt({level:s.level,type:s.po.title,prompt:s.po.consigne,doc:s.po.doc,talk_s:s.po.talk_s},text,metrics(text,XS.po.secs)),text); if(!r2||typeof r2!=="object") throw {code:"invalid_json"}; XS.poAI=r2; }catch(e){ XS.err=aiErr(e); }
      XS.busy=false; render(); return;
    }
  }

  /* =====================================================================
     EVENTOS
     ===================================================================== */
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-lec],[data-lecf],[data-lw],[data-lqa],[data-lecplay],[data-lecslow],[data-lecnext],[data-lecagain],[data-oral],[data-orf],[data-orgo],[data-sim],[data-sgo],[data-splay],[data-sqa],[data-am]");
    if(!b) return; var d=b.dataset;
    if(d.am){ e.preventDefault(); return go(d.am); }
    if(d.lecf){ LS.lv=d.lecf; return render(); }
    if(d.lec){ LS.id=d.lec; LS.ans={}; try{ stopAudio(); }catch(x){} go("lectura"); scrollTo(0,0); return; }
    if(d.lw!=null){
      var r=LEC.find(function(x){ return x.id===LS.id; }), g=r&&r.gloss[+d.lw]; if(!g) return;
      var old=q(".lw-tip"); if(old){ var same=old.dataset.for===d.lw; old.remove(); document.querySelectorAll(".lw.on").forEach(function(x){ x.classList.remove("on"); }); if(same) return; }
      b.classList.add("on");
      var tip=document.createElement("span"); tip.className="lw-tip"; tip.dataset.for=d.lw; tip.innerHTML="<b>"+esc(g[0])+"</b>"+esc(g[1]); b.insertAdjacentElement("afterend",tip); return;
    }
    if(d.lqa!=null) return lecAnswer(+d.lqa,+d.j);
    if(d.lecplay!=null||d.lecslow!=null){
      var r2=LEC.find(function(x){ return x.id===LS.id; }); if(!r2) return;
      if(typeof player!=="undefined"&&!player.paused&&curKeyIs("lec:"+r2.id)){ stopAudio(); b.textContent="▶ Escuchar el texto"; return; }
      playKey("lec:"+r2.id,r2.text.replace(/\n\n/g," "),d.lecslow!=null);
      try{ if(d.lecslow!=null&&typeof player!=="undefined") setTimeout(function(){ player.playbackRate=.8; },300); }catch(x){}
      if(d.lecplay!=null) b.textContent="⏸ Pausar"; return;
    }
    if(d.lecagain!=null){ LS.ans={}; render(); return; }
    if(d.lecnext!=null){ var i=LEC.findIndex(function(x){ return x.id===LS.id; }), nx=LEC.slice(i+1).concat(LEC.slice(0,i)).find(function(x){ return !lecDone(x.id); })||LEC[(i+1)%LEC.length]; LS.id=nx.id; LS.ans={}; try{ stopAudio(); }catch(x){} render(); scrollTo(0,0); return; }
    if(d.orf){ OS.lv=d.orf; return render(); }
    if(d.oral){ OS.id=d.oral; OS.phase="brief"; OS.res=null; OS.ai=null; OS.err=""; go("oralp"); scrollTo(0,0); return; }
    if(d.orgo){ e.preventDefault(); return orGo(d.orgo); }
    if(d.sim){ XS={id:d.sim,part:"intro",ans:{},plays:{},pe:"",peAI:null,peSelf:null,po:null,poAI:null,poSelf:null,busy:false,err:"",t0:0,tick:0}; go("simulacro"); scrollTo(0,0); return; }
    if(d.sgo){ e.preventDefault(); return simGo(d.sgo); }
    if(d.splay!=null){ var s=SIM.find(function(x){ return x.id===XS.id; }), di=+d.splay, k="co"+di; if((XS.plays[k]||0)>=2) return; XS.plays[k]=(XS.plays[k]||0)+1; var doc=s.co[di]; playKey("sim:"+s.id+":co"+di,doc.script.map(function(l){ return l[1]; }).join(" ")); var y=scrollY; render(); scrollTo(0,y); return; }
    if(d.sqa!=null){ XS.ans[d.sqa]=+d.j; var y2=scrollY; render(); scrollTo(0,y2); return; }
  });
  function curKeyIs(k){ try{ return typeof curKey!=="undefined"&&curKey===k; }catch(e){ return false; } }
  document.addEventListener("change",function(e){
    var c=e.target; if(!c.dataset||c.dataset.self==null) return;
    var key=c.dataset.self==="pe"?"peSelf":"poSelf"; XS[key]=XS[key]||[]; XS[key][+c.dataset.i]=c.checked;
  });
  document.addEventListener("input",function(e){
    if(e.target&&e.target.id==="simpe"){ XS.pe=e.target.value; var s=SIM.find(function(x){ return x.id===XS.id; }), w=q("#simwc"); if(w&&s) w.textContent=wc(XS.pe)+" palabras · entre "+s.pe.min+" y "+s.pe.max; }
  });

  /* =====================================================================
     RETOS reorganizado + INICIO
     ===================================================================== */
  function dueCount(){ try{ return (typeof practiceKeys==="function"?practiceKeys():[]).length; }catch(e){ return 0; } }
  function amCards(){
    var ld=Object.keys(st("lec")).length, sh=st("simh"), best=Object.keys(sh).reduce(function(m,k){ return Math.max(m,sh[k].best||0); },0), oh=Object.keys(st("oralh")).length;
    return '<div class="am-feat">'+
      '<button class="amf lec" data-am="lecturas"><span class="amf-i">📖</span><b>Lecturas graduadas</b><small>'+LEC.length+" textos con audio · "+ld+" leídos</small></button>"+
      '<button class="amf oral" data-am="oral"><span class="amf-i">🎙️</span><b>Expresión oral con IA</b><small>'+ORAL.length+" temas · nota sobre 20"+(oh?" · "+oh+" practicados":"")+"</small></button>"+
      '<button class="amf sim" data-am="simulacros"><span class="amf-i">🏅</span><b>Simulacros DELF/DALF</b><small>B1 · B2 · C1'+(best?" · mejor "+best+"/100":"")+"</small></button>"+
      "</div>";
  }
  var GROUPS=[["Practica cada día",["r-srs","r-review","r-speak","r-dict","r-acc"]],["Escribe y consulta",["r-atel","r-guia"]],["Ponte a prueba",["r-chrono","r-plc","r-exam"]],["Tu progreso",["r-jour"]]];
  function regroupRetos(){
    var v=document.getElementById("view"), sec=v&&v.querySelector(".gretos"), grid=sec&&sec.querySelector(".rgrid");
    if(!grid||sec.querySelector(".am-feat")) return;
    var h1=sec.querySelector("h1"), card=sec.querySelector(".v1-card");
    (card||h1).insertAdjacentHTML("afterend",'<h2 class="rg-h">Aprende más <span class="am-new">Nuevo</span></h2>'+amCards());
    var frag=document.createElement("div"); frag.className="rg-wrap";
    GROUPS.forEach(function(g){
      var items=[]; g[1].forEach(function(c){ grid.querySelectorAll(".rcard."+c).forEach(function(x){ items.push(x); }); });
      if(!items.length) return;
      var h=document.createElement("h2"); h.className="rg-h"; h.textContent=g[0]; frag.appendChild(h);
      var gg=document.createElement("div"); gg.className="rgrid rg2"; items.forEach(function(x){ gg.appendChild(x); }); frag.appendChild(gg);
    });
    [].slice.call(grid.children).forEach(function(x){ if(x.classList&&x.classList.contains("rcard")){ if(!frag.querySelector(".rg-rest")){ var h=document.createElement("h2"); h.className="rg-h"; h.textContent="Más"; frag.appendChild(h); var gg=document.createElement("div"); gg.className="rgrid rg2 rg-rest"; frag.appendChild(gg); } frag.querySelector(".rg-rest").appendChild(x); } });
    grid.replaceWith(frag);
    var srs=frag.querySelector(".r-srs"); if(srs){ var n=dueCount(); if(n){ srs.disabled=false; var sm=srs.querySelector("small"); if(sm) sm.innerHTML="<b>"+n+" ejercicios</b> te esperan hoy · 1, 3, 7, 14 y 30 días"; } }
  }
  function homeToday(){
    var v=document.getElementById("view"), main=v&&v.querySelector(".ghome .gmain"); if(!main||main.querySelector(".am-today")) return;
    var n=dueCount(), rl=recLevel(), nextLec=LEC.find(function(r){ return r.level===rl&&!lecDone(r.id); })||LEC.find(function(r){ return !lecDone(r.id); });
    var html='<div class="gcard am-today"><div class="amt-h"><b>Tu plan de hoy</b><small>Nivel sugerido: '+rl+"</small></div><div class=\"amt-row\">"+
      '<button class="amt '+(n?"hot":"")+'" data-p="practice" '+(n?"":"disabled")+'><span>🔁</span><b>Repaso del día</b><small>'+(n?n+" ejercicios":"Nada pendiente")+"</small></button>"+
      (nextLec?'<button class="amt" data-lec="'+nextLec.id+'"><span>'+esc(nextLec.emoji||"📖")+"</span><b>Lectura</b><small>"+esc(nextLec.title)+"</small></button>":"")+
      '<button class="amt" data-am="oral"><span>🎙️</span><b>Habla 2 min</b><small>Expresión oral con IA</small></button>'+
      "</div></div>";
    var anchor=main.querySelector(".v1-card")||main.querySelector(".mcard,.cur-lesson");
    if(anchor) anchor.insertAdjacentHTML("afterend",html); else main.insertAdjacentHTML("afterbegin",html);
  }
  var AMV={lecturas:1,lectura:1,oral:1,oralp:1,simulacros:1,simulacro:1};
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{
      if(view==="retos") regroupRetos();
      if(view==="parcours") homeToday();
      if(AMV[view]){ document.querySelectorAll('#tabbar [data-view="retos"],#nav [data-view="retos"],.nav [data-view="retos"]').forEach(function(x){ x.setAttribute("aria-current","page"); x.classList.add("on"); }); }
    }catch(e){}
    return r;
  };

  var css=`
  .amv{max-width:980px;margin:0 auto}
  .am-hero{display:flex;gap:16px;align-items:center;padding:20px 22px;border-radius:24px;color:#fff;margin:6px 0 14px;box-shadow:0 18px 36px -24px rgba(30,58,138,.8)}
  .am-hero.lec{background:linear-gradient(120deg,#0f766e,#0ea5e9)}.am-hero.oral{background:linear-gradient(120deg,#7c3aed,#db2777)}.am-hero.sim{background:linear-gradient(120deg,#1e3a8a,#2563eb 60%,#f59e0b)}
  .am-hero small{font-weight:900;letter-spacing:.06em;text-transform:uppercase;opacity:.85;font-size:.75rem}
  .am-hero h1{margin:2px 0 6px;font-size:1.6rem;color:#fff}.am-hero p{margin:0;opacity:.92;line-height:1.45;max-width:640px}
  .am-count{margin-left:auto;display:grid;justify-items:center;padding:10px 14px;border-radius:18px;background:rgba(255,255,255,.16);flex:none}
  .am-count b{font-size:1.5rem}.am-count span{font-size:.75rem;opacity:.9}
  .am-filter{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}
  .am-filter button{all:unset;cursor:pointer;padding:7px 14px;border-radius:999px;font-weight:800;font-size:.88rem;background:var(--surf3);color:var(--stone)}
  .am-filter button[aria-pressed=true]{background:#1e3a8a;color:#fff}
  .am-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
  .am-card{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:6px;align-content:start;padding:16px;border-radius:20px;background:var(--raise);border:1.5px solid var(--line);box-shadow:0 10px 24px -22px rgba(30,58,138,.7);transition:transform .15s,box-shadow .15s}
  .am-card:hover{transform:translateY(-3px);box-shadow:0 16px 30px -20px rgba(30,58,138,.7)}
  .am-card b{font-size:1.02rem;line-height:1.25}.am-card small{color:var(--stone);font-size:.8rem}
  .am-emo{font-size:30px;line-height:1}.am-emo.big{font-size:46px}
  .am-lv{justify-self:start;display:inline-block;padding:2px 9px;border-radius:999px;background:var(--c);color:#fff;font-weight:900;font-size:.72rem}
  .am-ok{font-style:normal;font-weight:800;font-size:.82rem;color:#16a34a}.am-go{font-style:normal;font-weight:800;font-size:.82rem;color:#2563eb}
  .am-row{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}
  .am-warn{padding:10px 12px;border-radius:12px;background:#fef3c7;color:#92400e;font-size:.9rem}
  html[data-theme=dark] .am-warn{background:#3a2f0b;color:#fde68a}
  /* lectura */
  .lec-card{padding:20px;border-radius:24px;background:var(--raise);border:1.5px solid var(--line)}
  .lec-head{display:flex;gap:14px;align-items:flex-start}.lec-head h1{margin:4px 0;font-size:1.5rem}.lec-th{color:var(--stone);font-weight:700}
  .lec-intro{margin:0;color:var(--stone)}
  .lec-audio{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:14px 0 6px}
  .lec-tipnote{font-size:.8rem;color:var(--stone)}
  .lec-text{font-size:1.12rem;line-height:1.85;font-family:Georgia,"Times New Roman",serif;color:var(--ink)}
  .lec-text p{margin:0 0 14px}
  .lw{all:unset;cursor:pointer;border-bottom:2px dotted #0ea5e9;color:inherit;font:inherit;padding:0 1px}
  .lw.on{background:#e0f2fe;border-radius:4px}
  html[data-theme=dark] .lw.on{background:#0c3a52}
  .lw-tip{display:inline-block;margin:0 4px;padding:3px 10px;border-radius:10px;background:#0f766e;color:#fff;font-family:system-ui,sans-serif;font-size:.85rem;line-height:1.4;animation:plxUp .2s ease both;vertical-align:middle}
  .lw-tip b{margin-right:6px}
  .lec-voc summary{cursor:pointer;font-weight:800;color:#0f766e;margin-top:6px}
  .lec-voc ul{list-style:none;padding:0;margin:8px 0 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px}
  .lec-voc li{display:grid;padding:8px 10px;border-radius:12px;background:var(--surf3)}.lec-voc li span{font-size:.85rem;color:var(--stone)}
  .lec-quiz{margin-top:16px}.lec-quiz h2 small{font-size:.9rem;color:var(--stone);margin-left:6px}
  .lq{padding:14px;border-radius:18px;background:var(--raise);border:1.5px solid var(--line);margin:0 0 10px}
  .lq.ok{border-color:#86efac}.lq.ko{border-color:#fca5a5}
  .lq-q{margin:0 0 10px;font-weight:700;display:flex;gap:8px}.lq-q span{flex:none;width:24px;height:24px;border-radius:8px;display:grid;place-items:center;background:#1e3a8a;color:#fff;font-size:.8rem}
  .lq-o{display:grid;gap:6px}
  .lq-o button{all:unset;box-sizing:border-box;cursor:pointer;padding:10px 12px;border-radius:14px;border:2px solid var(--line);border-bottom-width:3px;background:var(--raise);font-weight:600}
  .lq-o button:hover:not([disabled]){border-color:#93c5fd}
  .lq-o button.sel{border-color:#3b82f6;background:#eff6ff}
  .lq-o button.ok{border-color:#22c55e;background:#dcfce7;color:#14532d}.lq-o button.ko{border-color:#ef4444;background:#fee2e2;color:#7f1d1d}.lq-o button.dim{opacity:.55}
  html[data-theme=dark] .lq-o button.sel{background:#1e2a4d}html[data-theme=dark] .lq-o button.ok{background:#12280f;color:#bbf7d0}html[data-theme=dark] .lq-o button.ko{background:#2e1515;color:#fecaca}
  .lq-why{margin:10px 0 0;font-size:.9rem;line-height:1.45;color:var(--stone)}
  .lec-res{display:grid;justify-items:center;text-align:center;gap:6px;padding:20px;border-radius:22px;background:linear-gradient(180deg,#ecfeff,var(--raise));border:1.5px solid #a5f3fc}
  .lec-res>b{font-size:2.4rem;color:#0f766e}
  html[data-theme=dark] .lec-res{background:linear-gradient(180deg,#0c2a33,var(--raise));border-color:#155e75}
  /* oral */
  .or-card{padding:20px;border-radius:24px;background:var(--raise);border:1.5px solid var(--line)}
  .or-head h1{margin:6px 0;font-size:1.45rem}.or-head.compact h1{font-size:1.2rem}
  .or-prompt{font-size:1.05rem;font-weight:600;margin:6px 0}.or-es{color:var(--stone);margin:0 0 8px}
  .or-doc{margin:10px 0;padding:12px 14px;border-left:4px solid #7c3aed;border-radius:0 14px 14px 0;background:var(--surf3);font-family:Georgia,serif;line-height:1.6}
  .or-help{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}
  .or-help h4{margin:0 0 6px}.or-help ul{margin:0;padding-left:18px}.or-help li{margin:3px 0}
  .or-useful li{font-style:italic}
  .or-cta{display:grid;gap:8px;margin-top:12px}
  .or-timer{display:grid;justify-items:center;padding:18px;border-radius:20px;background:#f5f3ff;margin:12px 0}.or-timer b{font-size:2.6rem;color:#7c3aed}
  html[data-theme=dark] .or-timer{background:#221c3d}
  .or-rec{display:grid;justify-items:center;gap:6px;padding:18px 0}
  .or-mic{all:unset;cursor:pointer;width:96px;height:96px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(180deg,#ef4444,#b91c1c);box-shadow:0 0 0 0 rgba(239,68,68,.5);animation:orPulse 1.4s ease-out infinite}
  .or-mic span{width:28px;height:28px;border-radius:6px;background:#fff}
  @keyframes orPulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}100%{box-shadow:0 0 0 26px rgba(239,68,68,0)}}
  .or-rec b{font-size:2rem}.or-rec small{color:var(--stone)}
  .or-bar{width:min(360px,100%);height:8px;border-radius:99px;background:var(--surf3);overflow:hidden}.or-bar i{display:block;height:100%;background:linear-gradient(90deg,#7c3aed,#db2777);transition:width 1s linear}
  .or-live{max-width:560px;text-align:center;color:var(--stone);font-style:italic;min-height:1.5em}
  .or-wait{display:grid;justify-items:center;padding:40px 0}.spin{width:44px;height:44px;border-radius:50%;border:4px solid var(--surf3);border-top-color:#7c3aed;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  .or-tx{display:grid;gap:6px;margin:10px 0}.or-tx span{font-weight:700;font-size:.9rem}.or-tx textarea{width:100%;box-sizing:border-box;border-radius:14px;border:1.5px solid var(--line);padding:10px;font:inherit;background:var(--raise);color:var(--ink)}
  .or-play{display:flex;align-items:center;gap:10px;margin:10px 0}.or-play audio{flex:1;max-width:100%}
  .or-m{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0}
  .or-m div{display:grid;justify-items:center;padding:10px 4px;border-radius:14px;background:var(--surf3);text-align:center}.or-m b{font-size:1.15rem}.or-m span{font-size:.7rem;color:var(--stone)}
  .or-con{font-size:.9rem;color:var(--stone)}.or-con em{font-style:normal;display:inline-block;margin:2px;padding:1px 8px;border-radius:99px;background:#ede9fe;color:#5b21b6;font-weight:700}
  .or-ai{margin-top:12px;padding:16px;border-radius:20px;background:linear-gradient(180deg,#faf5ff,var(--raise));border:1.5px solid #ddd6fe}
  html[data-theme=dark] .or-ai{background:linear-gradient(180deg,#221c3d,var(--raise));border-color:#3f3470}
  .or-note{display:flex;align-items:baseline;gap:4px}.or-note b{font-size:2.4rem;color:#7c3aed}.or-note span{color:var(--stone);font-weight:800}
  .or-bilan{margin:4px 0 8px;line-height:1.5}
  .or-ai h4{margin:10px 0 4px}.or-ai ul{margin:0;padding-left:18px}.or-ai ul.ok li::marker{content:"✓ ";color:#16a34a}
  .or-err{padding-left:18px}.or-err li{margin:6px 0}.or-err s{color:#b91c1c}.or-err em{color:#15803d;font-style:normal;font-weight:700}.or-err small{display:block;color:var(--stone)}
  .or-ver summary{cursor:pointer;font-weight:800;color:#7c3aed;margin-top:8px}.or-ver p{font-family:Georgia,serif;line-height:1.6}
  @media (max-width:640px){.or-help{grid-template-columns:1fr}.or-m{grid-template-columns:repeat(2,1fr)}}
  /* simulacros */
  .sim-list{display:grid;gap:12px}
  .sim-card{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:8px;padding:18px;border-radius:22px;background:var(--raise);border:1.5px solid var(--line);box-shadow:0 10px 24px -22px rgba(30,58,138,.7)}
  .sim-card:hover{border-color:#93c5fd}
  .sim-top{display:flex;gap:8px;align-items:center}.sim-top b{font-size:1.1rem}.sim-card p{margin:0;color:var(--stone)}
  .sim-parts{display:flex;gap:6px;flex-wrap:wrap}.sim-parts span{padding:3px 10px;border-radius:99px;background:var(--surf3);font-size:.78rem;font-weight:700}
  .sim-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.sim-head h1{margin:6px 0;font-size:1.4rem}
  .sim-clock{margin-left:auto;padding:5px 12px;border-radius:99px;background:#1e3a8a;color:#fff;font-weight:800;font-variant-numeric:tabular-nums}
  .sim-steps{list-style:none;padding:0;margin:8px 0 14px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
  .sim-steps li{display:grid;justify-items:center;gap:2px;padding:8px 4px;border-radius:14px;background:var(--surf3);font-size:1.1rem;text-align:center}
  .sim-steps li span{font-size:.7rem;font-weight:800;color:var(--stone)}
  .sim-steps li.on{background:#1e3a8a;color:#fff}.sim-steps li.on span{color:#fff}.sim-steps li.done{background:#dcfce7}
  html[data-theme=dark] .sim-steps li.done{background:#12280f}
  .sim-intro,.sim-doc{padding:18px;border-radius:22px;background:var(--raise);border:1.5px solid var(--line);margin:0 0 12px}
  .sim-intro ul{padding-left:4px;list-style:none}.sim-intro li{margin:8px 0}
  .sim-doc h3{margin:0 0 4px}.sim-in{color:var(--stone);margin:4px 0 10px}.sim-src{color:var(--stone);font-weight:700}
  .sim-text{font-family:Georgia,serif;line-height:1.75;font-size:1.04rem;margin:10px 0 14px}
  .sim-doc textarea{width:100%;box-sizing:border-box;border-radius:14px;border:1.5px solid var(--line);padding:12px;font:inherit;background:var(--raise);color:var(--ink);line-height:1.5}
  .sim-wc{font-size:.85rem;color:var(--stone)}
  .sim-self{margin-top:12px;padding:12px;border-radius:14px;background:var(--surf3)}.sim-self p{margin:0 0 6px;font-weight:700;font-size:.9rem}.sim-self label{display:block;margin:5px 0;font-size:.9rem}
  .sim-tips{padding-left:18px;color:var(--stone)}
  .sim-res{display:grid;justify-items:center;text-align:center;padding:22px;border-radius:24px;background:var(--raise);border:2px solid var(--line)}
  .sim-res.pass{border-color:#86efac;background:linear-gradient(180deg,#f0fdf4,var(--raise))}
  html[data-theme=dark] .sim-res.pass{background:linear-gradient(180deg,#0f2a1a,var(--raise))}
  .sim-total{display:flex;align-items:baseline;gap:4px}.sim-total b{font-size:3.4rem;color:#1e3a8a}.sim-total span{font-weight:800;color:var(--stone)}
  html[data-theme=dark] .sim-total b{color:#93c5fd}
  .sim-bars{display:grid;gap:10px;width:min(560px,100%);margin:12px 0;text-align:left}
  .sim-bars div{display:grid;grid-template-columns:1fr 1.2fr auto;gap:10px;align-items:center}
  .sim-bars i{height:10px;border-radius:99px;background:var(--surf3);overflow:hidden}.sim-bars i b{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#16a34a)}
  .sim-bars em{font-style:normal;font-weight:800;white-space:nowrap}.sim-bars small{color:var(--stone);font-weight:600}
  .sim-script summary{cursor:pointer;font-weight:800;color:#2563eb}.sim-script p{margin:6px 0;line-height:1.5}
  @media (max-width:560px){.sim-bars div{grid-template-columns:1fr auto}.sim-bars i{grid-column:1/-1;grid-row:2}.am-hero{flex-direction:column;align-items:flex-start}.am-count{margin-left:0}}
  /* retos e inicio */
  .rg-h{margin:20px 0 10px;font-size:1.05rem;display:flex;align-items:center;gap:8px}
  .am-new{padding:2px 8px;border-radius:99px;background:#facc15;color:#1e3a8a;font-size:.7rem;font-weight:900;letter-spacing:.04em;text-transform:uppercase}
  .am-feat{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .amf{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:4px;align-content:start;padding:16px;border-radius:22px;color:#fff;min-height:132px;position:relative;overflow:hidden;box-shadow:0 16px 30px -22px rgba(30,58,138,.9);transition:transform .15s}
  .amf:hover{transform:translateY(-3px)}
  .amf::after{content:"";position:absolute;right:-30px;bottom:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.12)}
  .amf.lec{background:linear-gradient(135deg,#0f766e,#0ea5e9)}.amf.oral{background:linear-gradient(135deg,#7c3aed,#db2777)}.amf.sim{background:linear-gradient(135deg,#1e3a8a,#2563eb 60%,#f59e0b)}
  .amf-i{font-size:30px}.amf b{font-size:1.05rem}.amf small{opacity:.9;font-size:.8rem}
  @media (min-width:900px){.rg2{display:grid!important;grid-template-columns:1fr 1fr;gap:10px}.rg2 .rcard{margin:0!important}}
  @media (max-width:700px){.am-feat{grid-template-columns:1fr;gap:10px}.amf{min-height:0;grid-template-columns:auto 1fr;column-gap:14px;align-items:center;padding:14px 16px}.amf-i{grid-row:span 2;font-size:34px}}
  .lec-audio .gbtn{width:auto!important;flex:none}
  .am-today{padding:16px!important}
  .amt-h{display:flex;align-items:baseline;gap:10px;margin-bottom:10px}.amt-h b{font-size:1.05rem}.amt-h small{color:var(--stone)}
  .amt-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .amt{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:2px;padding:12px;border-radius:16px;background:var(--surf3);min-width:0}
  .amt span{font-size:22px}.amt b{font-size:.92rem}.amt small{color:var(--stone);font-size:.76rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .amt.hot{background:linear-gradient(135deg,#dcfce7,#bbf7d0)}.amt[disabled]{opacity:.6;cursor:default}
  html[data-theme=dark] .amt.hot{background:linear-gradient(135deg,#12280f,#14532d)}
  @media (max-width:520px){.amt-row{grid-template-columns:1fr}.amt{grid-template-columns:auto 1fr;column-gap:10px;align-items:center}.amt span{grid-row:span 2}}
  `;
  var stl=document.createElement("style"); stl.id="plx28"; stl.textContent=css; document.head.appendChild(stl);
  if(AMV[view]){ try{ render(); }catch(e){} }
})();
