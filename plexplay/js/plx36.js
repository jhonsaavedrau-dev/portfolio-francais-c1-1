/* PLEX PLAY 1.19 — Sonidos del francés: los 12 sonidos que no existen en español
   Escuchar · repetir con el micrófono · distinguir pares mínimos */
(function(){
  "use strict";
  if(typeof GV==="undefined") return;
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};

  /* w: palabras [francés, español] · p: pares [con el sonido, sin él] · s: frases */
  var SND=[
    {id:"u",ipa:"y",name:"La u francesa",ex:"tu",c:"#2563eb",sp:["u","û"],
     how:"Pon la boca para decir «i» y, sin mover la lengua, redondea los labios como para silbar. La punta de la lengua se queda abajo, pegada a los dientes.",
     ojo:"No existe en español. Si dices una «u» española, suena ou: dirías «tout» (todo) en vez de «tu» (tú).",
     w:[["tu","tú"],["une","una"],["rue","calle"],["lune","luna"],["jupe","falda"],["musique","música"],["bus","bus"],["sur","sobre"]],
     p:[["tu","tout"],["rue","roue"],["vu","vous"],["pur","pour"],["dessus","dessous"]],
     ot:"[u], que se escribe ou y suena como la u española",
     s:[["Tu as vu la lune ?","¿Viste la luna?"],["Il y a un bus dans la rue.","Hay un bus en la calle."]]},
    {id:"eu",ipa:"ø · œ",name:"La eu francesa",ex:"deux",c:"#7c3aed",sp:["eu","œu","œ"],
     how:"Pon la boca para decir «e» y redondea los labios. En «deux» la boca está más cerrada [ø]; en «peur», un poco más abierta [œ].",
     ojo:"El español no tiene esta vocal. No digas «deux» como «de» ni «peur» como «per»: los labios siempre van redondos.",
     w:[["deux","dos"],["bleu","azul"],["jeu","juego"],["cheveux","cabello"],["heure","hora"],["fleur","flor"],["sœur","hermana"],["professeur","profesor"]],
     p:[["deux","des"],["bleu","blé"],["jeu","j'ai"],["peur","père"],["heure","air"]],
     ot:"una e con los labios estirados",
     s:[["Ma sœur a les yeux bleus.","Mi hermana tiene los ojos azules."],["Il est deux heures.","Son las dos."]]},
    {id:"e",ipa:"ə",name:"La e débil",ex:"le",c:"#0891b2",sp:["e al final de sílaba: le, je, me","e en medio: petit, demain"],
     how:"Es una vocal corta y relajada: boca entreabierta y labios un poco redondeados, sin fuerza. A veces casi desaparece: «petit» suena «p'tit».",
     ojo:"No la pronuncies como la «e» española de «que». En «le» y «je» suena parecida a eu. Y no la confundas con les, des, ces, mes, que suenan [e].",
     w:[["le","el"],["je","yo"],["me","me"],["de","de"],["ce","este"],["petit","pequeño"],["demain","mañana"],["regarder","mirar"]],
     p:[["le","les"],["de","des"],["ce","ces"],["me","mes"]],
     ot:"[e], con los labios estirados (son plurales)",
     s:[["Je regarde le petit chat.","Miro el gatito."],["Demain, je te le dis.","Mañana te lo digo."]]},
    {id:"an",ipa:"ɑ̃",name:"La nasal an / en",ex:"enfant",c:"#ea580c",sp:["an","am","en","em"],
     how:"Abre la boca como para decir «a» y deja salir el aire también por la nariz. La lengua no toca el paladar: no hay «n» al final.",
     ojo:"En español «an» termina con una n que se oye. En francés esa n no se pronuncia: solo queda la vocal nasal.",
     w:[["enfant","niño"],["blanc","blanco"],["maman","mamá"],["chambre","habitación"],["temps","tiempo"],["France","Francia"],["dans","en, dentro de"],["vent","viento"]],
     p:[["vent","vont"],["blanc","blond"],["temps","ton"],["banc","bon"],["lent","long"]],
     ot:"otra vocal: [ɔ̃], con los labios redondos",
     s:[["Mon enfant a une chambre blanche.","Mi hijo tiene una habitación blanca."],["Il fait du vent en France.","Hace viento en Francia."]]},
    {id:"on",ipa:"ɔ̃",name:"La nasal on",ex:"bonjour",c:"#db2777",sp:["on","om"],
     how:"Redondea los labios como para decir «o» y deja salir el aire también por la nariz, sin cerrar con «n».",
     ojo:"No digas «bon» con n final. Pero cuidado: en «bonne» la n sí suena, porque va seguida de vocal.",
     w:[["bonjour","hola"],["maison","casa"],["nom","nombre"],["onze","once"],["pont","puente"],["garçon","chico"],["bonbon","dulce"],["mon","mi"]],
     p:[["bon","bonne"],["son","sonne"],["vont","vent"],["long","lent"],["ton","temps"]],
     ot:"otra cosa: una n que sí suena (bonne, sonne) o la nasal [ɑ̃] (vent, lent, temps)",
     s:[["Bonjour, mon nom est Léon.","Hola, mi nombre es León."],["Le garçon a onze bonbons.","El chico tiene once dulces."]]},
    {id:"in",ipa:"ɛ̃",name:"La nasal in / ain",ex:"vin",c:"#16a34a",sp:["in","im","ain","ein","un","(i)en"],
     how:"Pon la boca como para una «e» abierta, sonriendo un poco, y deja salir el aire también por la nariz, sin «n» final.",
     ojo:"«vin» no se dice como el «vin» de «vinagre»: no hay i ni n. Hoy «un» suena casi igual que in.",
     w:[["vin","vino"],["pain","pan"],["main","mano"],["cinq","cinco"],["lundi","lunes"],["jardin","jardín"],["chien","perro"],["un","un"]],
     p:[["vin","vent"],["bain","banc"],["pain","pont"],["main","mon"],["plein","plan"]],
     ot:"otra nasal: [ɑ̃] u [ɔ̃]",
     s:[["Lundi, je mange du pain.","El lunes como pan."],["Le chien est dans le jardin.","El perro está en el jardín."]]},
    {id:"r",ipa:"ʁ",name:"La r francesa",ex:"rouge",c:"#dc2626",sp:["r","rr"],
     how:"Se hace atrás, en la garganta. La punta de la lengua se queda abajo, detrás de los dientes, y el aire roza el fondo de la boca, como un gargarismo suave.",
     ojo:"No es la «r» ni la «rr» española: no vibres la punta de la lengua. Se parece a una «j» suave pero con voz.",
     w:[["rouge","rojo"],["Paris","París"],["frère","hermano"],["trois","tres"],["merci","gracias"],["restaurant","restaurante"],["rire","reír"],["rue","calle"]],
     p:[["pour","pou"],["mer","mais"],["sur","su"],["cour","cou"],["dort","dos"]],
     ot:"no tiene r al final",
     s:[["Mon frère aime le rouge.","A mi hermano le gusta el rojo."],["Merci pour le restaurant !","¡Gracias por el restaurante!"]]},
    {id:"z",ipa:"z",name:"La s que zumba",ex:"rose",c:"#ca8a04",sp:["z","s entre vocales","liaison: les amis"],
     how:"Pon la boca como para decir «s» y haz vibrar la garganta, como el zumbido de una abeja: zzz. Pon la mano en el cuello: tiene que vibrar.",
     ojo:"En español la s nunca vibra. En francés, la z y la s entre dos vocales suenan [z]: «poison» (veneno) no es «poisson» (pez).",
     w:[["rose","rosa"],["maison","casa"],["douze","doce"],["zéro","cero"],["chaise","silla"],["cousine","prima"],["valise","maleta"],["zoo","zoológico"]],
     p:[["poison","poisson"],["désert","dessert"],["cousin","coussin"],["ils ont","ils sont"]],
     ot:"[s], como la s española, que no vibra",
     s:[["Ma cousine a douze roses.","Mi prima tiene doce rosas."],["Les amis sont à la maison.","Los amigos están en la casa."]]},
    {id:"j",ipa:"ʒ",name:"La j francesa",ex:"jour",c:"#0d9488",sp:["j","g + e, i, y","ge + a, o"],
     how:"Pon la boca como para pedir silencio («shh») y haz vibrar la garganta. Suena como la «y» o «ll» de Argentina: «yo».",
     ojo:"No es la «j» española, que es fuerte y sale de la garganta, ni la «y» colombiana. Es suave y vibra.",
     w:[["jour","día"],["jaune","amarillo"],["âge","edad"],["manger","comer"],["girafe","jirafa"],["orange","naranja"],["déjà","ya"],["voyage","viaje"]],
     p:[["joue","chou"],["bouger","boucher"],["âge","hache"],["gens","chant"]],
     ot:"[ʃ], el «shh» sin vibración",
     s:[["Bonjour, j'ai une jupe jaune.","Hola, tengo una falda amarilla."],["Je mange une orange.","Me como una naranja."]]},
    {id:"ch",ipa:"ʃ",name:"La ch francesa",ex:"chat",c:"#9333ea",sp:["ch","sh"],
     how:"Adelanta y redondea los labios y sopla como cuando pides silencio: «shhh». La lengua no golpea el paladar.",
     ojo:"No es la «ch» de «chocolate» en español, que empieza con un golpe de t. En francés es solo el soplo: «shhh».",
     w:[["chat","gato"],["chocolat","chocolate"],["chaud","caliente"],["douche","ducha"],["poche","bolsillo"],["marché","mercado"],["chemise","camisa"],["acheter","comprar"]],
     p:[["chat","ça"],["chou","sous"],["cache","casse"],["chou","joue"]],
     ot:"[s] o [ʒ]",
     s:[["J'achète une chemise au marché.","Compro una camisa en el mercado."],["Le chocolat est chaud.","El chocolate está caliente."]]},
    {id:"v",ipa:"v",name:"La v de verdad",ex:"vous",c:"#4f46e5",sp:["v","w en algunas palabras: wagon"],
     how:"Apoya los dientes de arriba sobre el labio de abajo y deja pasar el aire haciendo vibrar la garganta: vvv.",
     ojo:"En español b y v suenan igual. En francés no: «vin» (vino) y «bain» (baño) son palabras distintas.",
     w:[["vous","usted, ustedes"],["voiture","carro"],["vingt","veinte"],["livre","libro"],["avion","avión"],["ville","ciudad"],["venir","venir"],["vélo","bicicleta"]],
     p:[["vin","bain"],["vous","bout"],["vol","bol"],["vent","banc"]],
     ot:"[b], que se hace con los dos labios",
     s:[["Vous avez vingt livres ?","¿Tiene veinte libros?"],["Je vais en ville à vélo.","Voy a la ciudad en bicicleta."]]},
    {id:"ui",ipa:"ɥ",name:"La ui francesa",ex:"huit",c:"#e11d48",sp:["ui","ua, ue en pocas palabras"],
     how:"Empieza con la u francesa de «tu» y deslízala muy rápido hacia «i», en un solo golpe: [ɥi].",
     ojo:"No digas «ui» como en «fui» ni como el «oui» de sí: los labios empiezan como en «tu», no como en «tout».",
     w:[["huit","ocho"],["nuit","noche"],["lui","él"],["cuisine","cocina"],["pluie","lluvia"],["suis","soy, estoy"],["juillet","julio"],["fruit","fruta"]],
     p:[["lui","Louis"],["nuit","nous"],["suis","sous"]],
     ot:"ou, con los labios como en «tout»",
     s:[["Il est huit heures, il fait nuit.","Son las ocho, es de noche."],["En juillet, je mange des fruits.","En julio como frutas."]]}
  ];
  window.__SND=SND;
  var byId={}; SND.forEach(function(x){ byId[x.id]=x; });

  function D(){ if(!S.snd||typeof S.snd!=="object") S.snd={}; return S.snd; }
  function stars(id){ var b=(D()[id]||{}).best; if(b==null) return 0; return b>=8?3:b>=6?2:b>=4?1:0; }
  function starHTML(n){ return '<span class="snd-st" aria-label="'+n+' de 3 estrellas">'+"★".repeat(n)+'<i>'+"★".repeat(3-n)+"</i></span>"; }
  function play(t,slow){ try{ speak(t,slow?.6:1); }catch(e){} }
  var norm=function(t){ return String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[’']/g," ").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim(); };
  function heard(target,alts){
    var t=norm(target), tw=t.split(" ");
    var best={ok:false,said:(alts&&alts[0])||"",ratio:0};
    (alts||[]).forEach(function(a){
      var n=norm(a), words=n.split(" ");
      var hit=tw.filter(function(w){ return words.indexOf(w)>=0; }).length/tw.length;
      if(n===t) hit=1;
      if(hit>best.ratio) best={ok:false,said:a,ratio:hit};
    });
    best.ok=tw.length===1?best.ratio===1:best.ratio>=.75;
    return best;
  }

  var ST={mode:null,i:0,list:[],ok:0,ans:null,res:null,busy:false,err:"",xp:0};
  function reset(){ ST={mode:null,i:0,list:[],ok:0,ans:null,res:null,busy:false,err:"",xp:0}; }
  var CUR=null;
  function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function backBtn(to,label){ return '<button class="gback" data-view="'+to+'">'+(typeof IC!=="undefined"&&IC.back?IC.back:"‹")+" "+label+"</button>"; }
  var SPK='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  var MIC='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';

  /* ------------------------------ lista ------------------------------ */
  GV.sonidos=function(){
    reset();
    var done=SND.filter(function(x){ return stars(x.id)>0; }).length;
    return '<section class="gview snd">'+backBtn("retos","Retos")+
      '<div class="snd-hero"><div><small>Pronunciación · A1</small><h1>Sonidos del francés</h1><p>Los 12 sonidos del francés que no existen en español. Escúchalos, repítelos con el micrófono y entrena el oído con palabras que solo cambian en ese sonido.</p>'+
      '<div class="snd-pb"><i style="width:'+Math.round(done/SND.length*100)+'%"></i></div><small class="snd-pbt">'+done+" de "+SND.length+" sonidos practicados</small></div>"+
      '<img src="img/mz-gafas.webp" alt="" class="snd-mz"></div>'+
      '<div class="snd-grid">'+SND.map(function(x){ var n=stars(x.id);
        return '<button class="snd-card" data-snd="'+x.id+'" style="--c:'+x.c+'"><span class="snd-ipa">['+esc(x.ipa)+']</span><b>'+esc(x.name)+'</b><small>como en <i>'+esc(x.ex)+"</i></small>"+starHTML(n)+"</button>"; }).join("")+"</div>"+
      '<p class="snd-note">Consejo: usa audífonos y practica cada sonido unos minutos al día. Primero escucha, luego repite y al final pon a prueba tu oído.</p></section>';
  };

  /* ------------------------------ detalle ------------------------------ */
  GV.sonido=function(){
    var x=CUR&&byId[CUR]; if(!x){ return GV.sonidos(); }
    if(ST.mode==="quiz") return quizHTML(x);
    if(ST.mode==="rep") return repHTML(x);
    return '<section class="gview snd" style="--c:'+x.c+'">'+backBtn("sonidos","Sonidos")+
      '<div class="snd-head"><span class="snd-big">['+esc(x.ipa)+']</span><div><h1>'+esc(x.name)+'</h1><p>Se escribe: '+x.sp.map(function(s){ return '<span class="snd-chip">'+esc(s)+"</span>"; }).join(" ")+'</p>'+starHTML(stars(x.id))+"</div></div>"+
      '<div class="snd-how"><div><h2>Cómo se hace</h2><p>'+esc(x.how)+'</p></div><div class="snd-ojo"><h2>Ojo, hispanohablantes</h2><p>'+esc(x.ojo)+"</p></div></div>"+
      '<h2 class="snd-h">1. Escucha</h2><p class="snd-sub">Toca cada palabra para oírla. Toca la tortuga 🐢 para oírla despacio.</p>'+
      '<div class="snd-words">'+x.w.map(function(w,i){ return '<div class="snd-w"><button class="snd-wb" data-sndplay="'+esc(w[0])+'"><span class="snd-wi">'+SPK+'</span><b>'+esc(w[0])+'</b><small>'+esc(w[1])+'</small></button><button class="snd-slow" data-sndslow="'+esc(w[0])+'" aria-label="Escuchar despacio">🐢</button></div>'; }).join("")+"</div>"+
      '<h2 class="snd-h">2. Repite</h2><p class="snd-sub">Di cada palabra en voz alta y te digo qué entendí.</p>'+
      '<button class="gbtn wide snd-go" data-sndgo="rep">🎙️ Repetir 6 palabras</button>'+
      '<h2 class="snd-h">3. ¿Cuál oíste?</h2><p class="snd-sub">Oirás una de dos palabras que solo cambian en este sonido. ¿Puedes distinguirlas?</p>'+
      '<div class="snd-pairs">'+x.p.map(function(p){ return '<div class="snd-pair"><button data-sndplay="'+esc(p[0])+'">'+esc(p[0])+'</button><span>≠</span><button data-sndplay="'+esc(p[1])+'">'+esc(p[1])+"</button></div>"; }).join("")+"</div>"+
      '<button class="gbtn wide snd-go" data-sndgo="quiz">👂 Entrenar el oído · 8 rondas</button>'+
      '<h2 class="snd-h">4. En frases</h2>'+
      '<div class="snd-sents">'+x.s.map(function(s,i){ return '<div class="snd-sent"><div><b>'+esc(s[0])+'</b><small>'+esc(s[1])+'</small></div><button class="snd-ic" data-sndplay="'+esc(s[0])+'" aria-label="Escuchar">'+SPK+'</button><button class="snd-ic" data-sndslow="'+esc(s[0])+'" aria-label="Escuchar despacio">🐢</button></div>'; }).join("")+"</div>"+
      nav(x)+"</section>";
  };
  function nav(x){
    var i=SND.indexOf(x), a=SND[i-1], b=SND[i+1];
    return '<div class="snd-nav">'+(a?'<button class="gbtn ghost" data-snd="'+a.id+'">‹ ['+esc(a.ipa)+'] '+esc(a.name)+"</button>":"<span></span>")+(b?'<button class="gbtn ghost" data-snd="'+b.id+'">['+esc(b.ipa)+'] '+esc(b.name)+" ›</button>":"")+"</div>";
  }

  /* ------------------------------ repetir ------------------------------ */
  function repHTML(x){
    if(ST.i>=ST.list.length){
      var n=ST.list.length; return '<section class="gview snd" style="--c:'+x.c+'"><div class="snd-end"><img src="img/mz-feliz.webp" alt=""><h1>¡Bien hecho!</h1><p>Te entendí '+ST.ok+" de "+n+" palabras.</p>"+
        (ST.ok<n?'<p class="snd-sub">Si alguna no salió, vuelve a escucharla despacio y fíjate en la posición de la boca.</p>':"")+
        '<div class="set-row c"><button class="gbtn ghost" data-sndgo="back">Volver al sonido</button><button class="gbtn" data-sndgo="quiz">👂 Entrenar el oído</button></div></div></section>';
    }
    var w=ST.list[ST.i], r=ST.res;
    return '<section class="gview snd" style="--c:'+x.c+'"><button class="gback" data-sndgo="back">‹ '+esc(x.name)+"</button>"+
      '<div class="snd-prog"><i style="width:'+(ST.i/ST.list.length*100)+'%"></i></div><p class="snd-n">'+(ST.i+1)+" / "+ST.list.length+"</p>"+
      '<div class="snd-rep"><small>Escucha y repite</small><b>'+esc(w[0])+'</b><span>'+esc(w[1])+"</span>"+
      '<div class="snd-rep-a"><button class="snd-ic" data-sndplay="'+esc(w[0])+'" aria-label="Escuchar">'+SPK+'</button><button class="snd-ic" data-sndslow="'+esc(w[0])+'" aria-label="Escuchar despacio">🐢</button></div>'+
      '<button class="snd-mic sp-mic'+(ST.busy?" on":"")+'" data-sndmic '+(ST.busy?"disabled":"")+' aria-label="Hablar">'+MIC+"</button>"+
      '<p class="snd-status sp-status" role="status">'+(ST.busy?"Te escucho…":ST.err?esc(ST.err):r?(r.ok?"✅ ¡Perfecto! Entendí «"+esc(r.said)+"».":"🤔 Entendí «"+esc(r.said||"…")+"». Escúchala otra vez y repite."):"Toca el micrófono y di la palabra.")+"</p>"+
      "</div>"+
      '<div class="snd-btns">'+(r&&!r.ok?'<button class="gbtn ghost" data-sndgo="retry">Intentar otra vez</button>':"")+(ST.err&&!r?'<button class="gbtn ghost" data-sndgo="selfok">La dije bien</button>':"")+'<button class="gbtn" data-sndgo="next">'+(r||ST.err?"Siguiente":"Saltar")+"</button></div></section>";
  }

  /* ------------------------------ ¿cuál oíste? ------------------------------ */
  function quizHTML(x){
    if(ST.i>=ST.list.length){
      var n=ST.list.length, s=ST.ok>=8?3:ST.ok>=6?2:ST.ok>=4?1:0;
      return '<section class="gview snd" style="--c:'+x.c+'"><div class="snd-end"><img src="img/'+(s>=2?"mz-feliz":"mz-gafas")+'.webp" alt=""><h1>'+(s===3?"¡Oído de francés!":s===2?"¡Muy bien!":"¡Sigue practicando!")+'</h1>'+starHTML(s)+'<p>Acertaste '+ST.ok+" de "+n+". +"+ST.xp+" XP</p>"+
        (s<3?'<p class="snd-sub">Pista: '+esc(x.how)+"</p>":"")+
        '<div class="set-row c"><button class="gbtn ghost" data-sndgo="back">Volver al sonido</button><button class="gbtn" data-sndgo="quiz">Otra vez</button></div></div></section>';
    }
    var q=ST.list[ST.i], a=ST.ans;
    return '<section class="gview snd" style="--c:'+x.c+'"><button class="gback" data-sndgo="back">‹ '+esc(x.name)+"</button>"+
      '<div class="snd-prog"><i style="width:'+(ST.i/ST.list.length*100)+'%"></i></div><p class="snd-n">'+(ST.i+1)+" / "+ST.list.length+" · "+ST.ok+" aciertos</p>"+
      '<div class="snd-q"><small>¿Cuál oíste?</small><div class="snd-rep-a"><button class="snd-ic big" data-sndq="play" aria-label="Escuchar otra vez">'+SPK+'</button><button class="snd-ic" data-sndq="slow" aria-label="Escuchar despacio">🐢</button></div>'+
      '<div class="snd-opts">'+q.opts.map(function(o){ var cls=a==null?"":o===q.say?" ok":o===a?" ko":""; return '<button class="snd-opt'+cls+'" data-sndans="'+esc(o)+'" '+(a!=null?"disabled":"")+">"+esc(o)+"</button>"; }).join("")+"</div>"+
      (a!=null?'<div class="snd-fb '+(a===q.say?"ok":"ko")+'"><b>'+(a===q.say?"¡Exacto!":"Era «"+esc(q.say)+"».")+'</b><p>«'+esc(q.t)+"» tiene ["+esc(x.ipa)+"]; «"+esc(q.o)+"» tiene "+esc(x.ot)+'.</p><div class="snd-rep-a">'+q.opts.map(function(o){ return '<button class="gbtn ghost sm" data-sndplay="'+esc(o)+'">🔊 '+esc(o)+"</button>"; }).join("")+'</div></div><button class="gbtn wide" data-sndgo="qnext">Continuar</button>':"")+
      "</div></section>";
  }
  function startQuiz(x){
    var rounds=[]; for(var k=0;k<8;k++){ var p=x.p[k%x.p.length]; var say=Math.random()<.5?p[0]:p[1]; rounds.push({say:say,t:p[0],o:p[1],opts:Math.random()<.5?[p[0],p[1]]:[p[1],p[0]]}); }
    ST={mode:"quiz",i:0,list:shuffle(rounds),ok:0,ans:null,res:null,busy:false,err:"",xp:0};
    go("sonido"); setTimeout(function(){ play(ST.list[0].say); },450);
  }
  function startRep(x){
    ST={mode:"rep",i:0,list:shuffle(x.w).slice(0,6),ok:0,ans:null,res:null,busy:false,err:"",xp:0};
    go("sonido"); setTimeout(function(){ play(ST.list[0][0]); },450);
  }
  function listen(){
    var w=ST.list[ST.i]; if(!w||ST.busy) return;
    ST.busy=true; ST.err=""; ST.res=null; render();
    var p; try{ p=speechListen(w[0]); }catch(e){ p=Promise.reject(e); }
    p.then(function(alts){
      ST.busy=false; ST.res=heard(w[0],alts); if(ST.res.ok){ ST.ok++; try{ SFX.ok&&SFX.ok(); }catch(e){} } else { try{ SFX.ko&&SFX.ko(); }catch(e){} }
      render();
    },function(e){
      ST.busy=false; var m=String(e&&e.message||e||"");
      ST.err=/no-speech|timeout/.test(m)?"No te oí. Acércate al micrófono e inténtalo otra vez.":/unsupported|login/.test(m)?"Este navegador no reconoce la voz. Escucha la palabra, repítela en voz alta y marca si la dijiste bien.":(typeof spErrText==="function"?spErrText(m).t:"No pude usar el micrófono.");
      render();
    });
  }

  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-snd],[data-sndplay],[data-sndslow],[data-sndgo],[data-sndq],[data-sndans],[data-sndmic],[data-am='sonidos']"); if(!b) return;
    e.preventDefault(); e.stopPropagation();
    var d=b.dataset, x=CUR&&byId[CUR];
    if(d.am==="sonidos"){ reset(); go("sonidos"); scrollTo(0,0); return; }
    if(d.snd){ CUR=d.snd; reset(); go("sonido"); scrollTo(0,0); return; }
    if(d.sndplay){ play(d.sndplay); return; }
    if(d.sndslow){ play(d.sndslow,true); return; }
    if(d.sndmic!=null){ listen(); return; }
    if(d.sndq){ var q=ST.list[ST.i]; if(q) play(q.say,d.sndq==="slow"); return; }
    if(d.sndans){
      var q2=ST.list[ST.i]; if(!q2||ST.ans!=null) return;
      ST.ans=d.sndans; if(d.sndans===q2.say){ ST.ok++; try{ SFX.ok&&SFX.ok(); }catch(e2){} } else { try{ SFX.ko&&SFX.ko(); }catch(e2){} }
      render(); return;
    }
    var a=d.sndgo; if(!x) return;
    if(a==="quiz") return startQuiz(x);
    if(a==="rep") return startRep(x);
    if(a==="back"){ reset(); go("sonido"); scrollTo(0,0); return; }
    if(a==="retry"){ ST.res=null; ST.err=""; render(); play(ST.list[ST.i][0]); return; }
    if(a==="selfok"){ ST.ok++; ST.err=""; ST.i++; ST.res=null; nextRep(x); return; }
    if(a==="next"){ ST.i++; ST.res=null; ST.err=""; nextRep(x); return; }
    if(a==="qnext"){
      ST.i++; ST.ans=null;
      if(ST.i>=ST.list.length){
        ST.xp=5+ST.ok; var rec=D()[x.id]=D()[x.id]||{}; rec.best=Math.max(rec.best||0,ST.ok); rec.at=Date.now();
        try{ addXP(ST.xp); addAct("SND"); save(!0); typeof gAfterProgress==="function"&&gAfterProgress(); }catch(e3){}
        render(); return;
      }
      render(); setTimeout(function(){ play(ST.list[ST.i].say); },250); return;
    }
  },true);
  function nextRep(x){
    if(ST.i>=ST.list.length){ var rec=D()[x.id]=D()[x.id]||{}; rec.rep=Math.max(rec.rep||0,ST.ok); try{ addXP(ST.ok); save(!0); }catch(e){} render(); return; }
    render(); setTimeout(function(){ play(ST.list[ST.i][0]); },250);
  }

  /* ------------------------------ accesos ------------------------------ */
  var BANNER=function(){ var done=SND.filter(function(x){ return stars(x.id)>0; }).length;
    return '<button class="snd-banner" data-am="sonidos"><span class="sb-ipa">[y] [ɑ̃] [ʁ]</span><span class="sb-t"><b>Sonidos del francés</b><small>Los 12 sonidos que no existen en español · '+done+"/"+SND.length+" practicados</small></span><span class=\"sb-go\">›</span></button>"; };
  var _rd=render;
  render=function(){
    var r=_rd.apply(this,arguments);
    try{
      if(view==="retos"){
        var f=document.querySelector("#view .am-feat");
        if(f&&!f.querySelector(".amf.snd")) f.insertAdjacentHTML("afterbegin",'<button class="amf snd" data-am="sonidos"><span class="amf-i">🗣️</span><b>Sonidos del francés</b><small>12 sonidos que no existen en español</small></button>');
      }
      if(view==="lecciones"&&typeof track!=="undefined"&&/^(a1|a2|fon)$/.test(track)){
        var bar=document.querySelector("#view .lx-bar");
        if(bar&&!document.querySelector("#view .snd-banner")) bar.insertAdjacentHTML("beforebegin",BANNER());
      }
      if(view==="sonidos"||view==="sonido"){ document.querySelectorAll('#tabbar [data-view="retos"],.nav [data-view="retos"]').forEach(function(x){ x.setAttribute("aria-current","page"); }); }
    }catch(e){}
    return r;
  };

  var css=`
  .snd{--c:#2563eb}
  .snd-hero{display:flex;align-items:center;gap:16px;padding:20px 22px;border-radius:24px;background:linear-gradient(120deg,#1e3a8a,#2563eb 60%,#7c3aed);color:#fff;margin:6px 0 16px;overflow:hidden}
  .snd-hero>div{flex:1;min-width:0}.snd-hero small{font-weight:800;opacity:.85;letter-spacing:.04em;text-transform:uppercase;font-size:.75rem}
  .snd-hero h1{color:#fff!important;margin:4px 0 6px;font-size:1.9rem}.snd-hero p{margin:0 0 12px;opacity:.95;line-height:1.45}
  .snd-mz{width:110px;height:110px;object-fit:cover;border-radius:50%;border:4px solid rgba(255,255,255,.5);flex:none}
  .snd-pb{height:10px;border-radius:99px;background:rgba(255,255,255,.25);overflow:hidden;max-width:360px}.snd-pb i{display:block;height:100%;background:#facc15;border-radius:99px}
  .snd-pbt{display:block;margin-top:6px;text-transform:none!important;letter-spacing:0!important}
  .snd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
  .snd-card{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:4px;padding:16px;border-radius:20px;background:var(--raise);border:1.5px solid var(--line);box-shadow:0 10px 22px -18px rgba(30,58,138,.6);transition:transform .15s,box-shadow .15s}
  .snd-card:hover{transform:translateY(-2px);box-shadow:0 16px 28px -18px rgba(30,58,138,.7)}
  .snd-card:focus-visible{outline:3px solid var(--c);outline-offset:2px}
  .snd-ipa{font-size:1.7rem;font-weight:800;color:var(--c);font-family:"Segoe UI","Noto Sans","DejaVu Sans",sans-serif}
  .snd-card small{color:var(--stone)}
  .snd-st{color:#f59e0b;letter-spacing:2px;font-size:.95rem}.snd-st i{font-style:normal;color:var(--line-2,#d6d3d1)}
  .snd-note{color:var(--stone);font-size:.9rem;margin:16px 2px}
  .snd-head{display:flex;align-items:center;gap:16px;margin:6px 0 14px}
  .snd-big{flex:none;min-width:92px;height:92px;padding:0 12px;border-radius:24px;display:grid;place-items:center;background:var(--c);color:#fff;font-size:2.3rem;font-weight:800;font-family:"Segoe UI","Noto Sans","DejaVu Sans",sans-serif;box-shadow:0 14px 26px -16px var(--c)}
  .snd-head h1{margin:0 0 6px}.snd-head p{margin:0 0 4px;color:var(--stone);line-height:1.8}
  .snd-chip{display:inline-block;padding:1px 9px;border-radius:99px;background:var(--surf3);color:var(--ink);font-weight:700;font-size:.85rem}
  .snd-how{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 8px}
  .snd-how>div{padding:14px 16px;border-radius:18px;background:var(--raise);border:1.5px solid var(--line)}
  .snd-how h2{font-size:1rem;margin:0 0 6px}.snd-how p{margin:0;line-height:1.5}
  .snd-ojo{background:#fff7ed!important;border-color:#fed7aa!important}html[data-theme=dark] .snd-ojo{background:#2e1f0f!important;border-color:#6b3d12!important}
  @media (max-width:640px){.snd-how{grid-template-columns:1fr}.snd-mz{width:78px;height:78px}.snd-hero h1{font-size:1.5rem}}
  .snd-h{font-size:1.15rem;margin:22px 0 2px}.snd-sub{color:var(--stone);margin:0 0 10px;font-size:.92rem}
  .snd-words{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
  .snd-w{display:flex;gap:6px}
  .snd-wb{all:unset;box-sizing:border-box;cursor:pointer;flex:1;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:10px;align-items:center;padding:10px 12px;border-radius:16px;background:var(--raise);border:1.5px solid var(--line)}
  .snd-wb .snd-wi{grid-row:1/span 2;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--c);color:#fff}
  .snd-wb b{font-size:1.05rem}.snd-wb small{color:var(--stone);font-size:.8rem}
  .snd-wb:active{transform:scale(.98)}
  .snd-slow,.snd-ic{all:unset;box-sizing:border-box;cursor:pointer;width:42px;min-height:42px;border-radius:14px;display:grid;place-items:center;background:var(--surf3);color:var(--ink);font-size:1.1rem}
  .snd-ic.big{width:72px;height:72px;border-radius:50%;background:var(--c);color:#fff}.snd-ic.big svg{width:32px;height:32px}
  .snd-slow:focus-visible,.snd-ic:focus-visible,.snd-wb:focus-visible,.snd-opt:focus-visible,.snd-mic:focus-visible,.snd-banner:focus-visible{outline:3px solid var(--c,#2563eb);outline-offset:2px}
  .snd-go{margin:6px 0 0}
  .snd-pairs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 10px}
  .snd-pair{display:flex;align-items:center;gap:6px;padding:6px;border-radius:14px;background:var(--surf3)}
  .snd-pair button{all:unset;cursor:pointer;padding:6px 12px;border-radius:10px;background:var(--raise);font-weight:700}
  .snd-pair span{color:var(--stone);font-weight:800}
  .snd-sents{display:grid;gap:8px}
  .snd-sent{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:16px;background:var(--raise);border:1.5px solid var(--line)}
  .snd-sent>div{flex:1;display:grid}.snd-sent small{color:var(--stone)}
  .snd-nav{display:flex;justify-content:space-between;gap:10px;margin:24px 0 8px;flex-wrap:wrap}.snd-nav .gbtn{width:auto}
  .snd-prog{height:10px;border-radius:99px;background:var(--surf3);overflow:hidden;margin:8px 0 4px}.snd-prog i{display:block;height:100%;background:var(--c);transition:width .3s}
  .snd-n{text-align:center;color:var(--stone);font-weight:700;margin:0 0 10px}
  .snd-rep,.snd-q{display:grid;justify-items:center;gap:10px;text-align:center;padding:24px 18px;border-radius:24px;background:var(--raise);border:1.5px solid var(--line);max-width:560px;margin:0 auto}
  .snd-rep>small,.snd-q>small{font-weight:800;color:var(--stone)}
  .snd-rep>b{font-size:2.4rem;line-height:1.1}.snd-rep>span{color:var(--stone)}
  .snd-rep-a{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
  .snd-mic{all:unset;cursor:pointer;width:84px;height:84px;border-radius:50%;display:grid;place-items:center;background:var(--c);color:#fff;box-shadow:0 0 0 calc(var(--lvl,0) * 18px) color-mix(in srgb,var(--c) 25%,transparent);transition:box-shadow .15s}
  .snd-mic.on{animation:sndPulse 1.2s ease-in-out infinite}
  @keyframes sndPulse{50%{box-shadow:0 0 0 14px color-mix(in srgb,var(--c) 22%,transparent)}}
  .snd-status{margin:4px 0 0;min-height:1.4em;font-weight:600}
  .snd-btns{display:flex;justify-content:center;gap:10px;margin:14px 0}.snd-btns .gbtn{min-width:150px;width:auto}
  .snd-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;margin-top:6px}
  .snd-opt{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;padding:18px 10px;border-radius:18px;border:2px solid var(--line);background:var(--surf2);font-size:1.5rem;font-weight:800}
  .snd-opt:hover:not([disabled]){border-color:var(--c)}
  .snd-opt.ok{border-color:#16a34a;background:#dcfce7;color:#14532d}.snd-opt.ko{border-color:#dc2626;background:#fee2e2;color:#7f1d1d}
  html[data-theme=dark] .snd-opt.ok{background:#12331e;color:#86efac}html[data-theme=dark] .snd-opt.ko{background:#3a161c;color:#fca5a5}
  .snd-fb{width:100%;text-align:left;padding:12px 14px;border-radius:16px;background:var(--surf3)}.snd-fb p{margin:4px 0 8px;line-height:1.45}
  .snd-fb.ok b{color:#16a34a}.snd-fb.ko b{color:#dc2626}
  .snd-end{display:grid;justify-items:center;text-align:center;gap:6px;padding:28px 18px;border-radius:24px;background:var(--raise);border:1.5px solid var(--line);max-width:560px;margin:12px auto}
  .snd-end img{width:120px;height:120px;object-fit:cover;border-radius:50%}
  .snd-end .snd-st{font-size:1.6rem}
  .snd-banner{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:14px;width:100%;margin:12px 0 4px;padding:14px 16px;border-radius:20px;background:linear-gradient(120deg,#eef2ff,#fdf2f8);border:1.5px solid #c7d2fe;color:#1e293b}
  .snd-banner .sb-ipa{flex:none;padding:8px 10px;border-radius:14px;background:#1e3a8a;color:#fff;font-weight:800;font-family:"Segoe UI","Noto Sans","DejaVu Sans",sans-serif;font-size:.95rem}
  .snd-banner .sb-t{flex:1;display:grid}.snd-banner small{color:#475569}.snd-banner .sb-go{font-size:1.6rem;color:#1e3a8a;font-weight:800}
  html[data-theme=dark] .snd-banner{background:linear-gradient(120deg,#1b2340,#2a1b33);border-color:#2f3b66;color:#e2e8f0}html[data-theme=dark] .snd-banner small{color:#c7d2fe}html[data-theme=dark] .snd-banner .sb-go{color:#bfdbfe}
  .amf.snd{background:linear-gradient(135deg,#1e3a8a,#7c3aed)}
  `;
  var st=document.createElement("style"); st.id="plx36"; st.textContent=css; document.head.appendChild(st);
})();
