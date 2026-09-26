/* PLEX PLAY 1.12 — Taller de escritura: contexto → lectura → pregunta → respuesta */
(function(){
  "use strict";
  if(typeof TASKS==="undefined"||typeof SOURCES==="undefined"||typeof viewAtelier!=="function") return;
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};

  /* ---------- lecturas nuevas (textos de entrenamiento) ---------- */
  var NEW={
    mairie:[{t:"« Un Grand Prix en plein centre-ville ? »",s:"La Gazette de Villeneuve · article d'entraînement",x:
"Le conseil municipal a voté jeudi soir, par 19 voix contre 14, le principe d'une course automobile dans les rues du centre-ville. L'épreuve aurait lieu du 12 au 14 juin prochain, sur un circuit de 3,2 kilomètres tracé entre la place de la Mairie et les quais.\n\nPour l'adjoint aux sports, « ce Grand Prix attirera près de 40 000 visiteurs et donnera un coup de fouet au commerce local ». La ville financerait l'aménagement à hauteur de 1,2 million d'euros.\n\nMais l'opposition s'organise. Une pétition lancée par l'association Centre-Ville Vivant a déjà recueilli 3 500 signatures. Les riverains redoutent le bruit, la pollution et la fermeture de quatorze rues pendant dix jours, montage compris. Plusieurs commerçants craignent au contraire de perdre leur clientèle habituelle.\n\nCertains proposent une autre solution : organiser l'événement sur l'ancien aérodrome, à cinq kilomètres de la ville, déjà accessible en bus. Le maire recevra les courriers des habitants jusqu'à la fin du mois."}],
    radio:[{t:"Reportage : « Les jeunes lisent-ils encore ? »",s:"Transcription d'un reportage radio · texte d'entraînement",x:
"Journaliste : Bonjour à tous. On entend souvent que les jeunes ne lisent plus. Pourtant, selon une enquête publiée en mars 2024 par le Centre national du livre, 81 % des 15-24 ans déclarent avoir lu au moins un livre dans l'année. C'est cinq points de plus qu'en 2019.\n\nLa différence, c'est la manière de lire. Près d'un jeune sur deux lit désormais sur un écran, et les mangas représentent aujourd'hui un livre vendu sur quatre en France. Les réseaux sociaux jouent aussi un rôle : sur TikTok, des lecteurs recommandent des romans à des millions d'abonnés.\n\nÉlodie, bibliothécaire à Lyon : « Depuis deux ans, des adolescents viennent avec une capture d'écran et demandent un titre précis. »\n\nMais l'enquête montre une autre réalité : le temps de lecture diminue. Les jeunes lisent en moyenne 3 heures par semaine, contre 4 h 30 en 2015. Le défi, conclut le sociologue Marc Duval, n'est plus de donner envie de lire, mais de protéger le temps de lecture."}],
    modele:[{t:"Texte modèle — « Le marché du samedi »",s:"Description d'entraînement · observez les groupes nominaux",x:
"Chaque samedi, la petite place pavée qui s'étend derrière l'église se transforme en un marché bruyant et coloré. Sous des parasols rayés de rouge et de blanc, des maraîchers aux mains calleuses disposent avec soin leurs légumes encore couverts de terre. Une vieille dame au chapeau de paille, que tout le monde appelle Mamie Rose, y vend depuis quarante ans des confitures dont elle garde jalousement la recette.\n\nL'air sent le pain chaud, le fromage de chèvre et les fraises des bois. On y croise des familles pressées, des étudiants encore endormis et des touristes qui photographient tout. Vers midi, lorsque les cloches sonnent, les voix se font plus douces : les marchands replient lentement leurs étals, et la place retrouve peu à peu son silence tranquille."}]
  };
  var DOSSIERS=[
    {t:"Dossier — Les devoirs à la maison",x:"En France, les devoirs écrits sont en principe interdits à l'école primaire depuis 1956. Dans les faits, une enquête de 2022 montre que 8 parents sur 10 aident leurs enfants chaque soir, en moyenne 40 minutes. Les enseignants expliquent que les devoirs permettent de consolider les apprentissages. Mais des sociologues observent qu'ils creusent les inégalités : tous les parents n'ont ni le temps ni les connaissances pour accompagner leurs enfants. Certaines écoles proposent désormais des « études du soir » gratuites, encadrées par des étudiants, pour que le travail se fasse en classe plutôt qu'à la maison."},
    {t:"Dossier — Travailler rend-il heureux ?",x:"Selon un baromètre publié en 2023, 62 % des salariés français se disent satisfaits de leur travail, mais 44 % déclarent ressentir une fatigue importante. Pour beaucoup, le travail apporte un revenu, mais aussi des relations sociales, une utilité et une place dans la société. Le psychologue Yves Clot rappelle que « le travail bien fait » est une source de fierté. À l'inverse, de plus en plus de jeunes diplômés quittent un poste bien payé pour un métier qui a plus de sens, et certains pays testent la semaine de quatre jours pour mieux concilier vie professionnelle et vie personnelle."},
    {t:"Dossier — L'université et l'emploi",x:"En France, 88 % des diplômés de master ont un emploi dix-huit mois après leurs études. Les entreprises réclament des compétences directement utiles : langues, outils numériques, gestion de projet. Beaucoup d'universités développent donc les stages et l'alternance. Mais des enseignants-chercheurs défendent une autre mission : former des esprits critiques, capables de s'adapter à des métiers qui n'existent pas encore. Selon une étude de l'OCDE, un étudiant d'aujourd'hui changera plusieurs fois de métier au cours de sa vie. Pour eux, la culture générale et la réflexion restent la meilleure préparation."},
    {t:"Dossier — La télévision a-t-elle encore sa place ?",x:"Les Français regardent encore la télévision environ trois heures par jour en moyenne, mais les 15-24 ans y consacrent moins d'une heure. Ils préfèrent les plateformes de vidéo et les réseaux sociaux, qu'ils consultent sur leur téléphone. Pour ses défenseurs, la télévision reste un moment partagé en famille et une source d'information vérifiée, avec des journalistes professionnels. Ses critiques rappellent qu'elle favorise la passivité et la sédentarité. Quelques familles ont choisi de vivre sans téléviseur : elles disent lire davantage et discuter plus, mais regardent parfois les mêmes programmes… sur un ordinateur."},
    {t:"Dossier — Le télétravail après la crise sanitaire",x:"Avant 2020, environ 4 % des salariés français télétravaillaient régulièrement ; ils sont aujourd'hui près de 25 %, le plus souvent deux jours par semaine. Les salariés apprécient la réduction des trajets et une meilleure concentration. Les entreprises économisent sur les bureaux. Pourtant, une étude de 2023 signale que 30 % des télétravailleurs se sentent isolés, et certains managers craignent une perte d'esprit d'équipe. Par ailleurs, le télétravail ne concerne qu'un tiers des emplois : infirmiers, caissiers ou ouvriers ne peuvent pas travailler depuis chez eux, ce qui crée un sentiment d'injustice."}
  ];
  SOURCES.mairie=NEW.mairie; SOURCES.radio=NEW.radio; SOURCES.modele=NEW.modele;
  DOSSIERS.forEach(function(d,i){ SOURCES["sj"+i]=[{t:d.t,s:"Dossier documentaire · texte d'entraînement",x:d.x}]; });

  if(TASKS.lettre&&!TASKS.lettre.source) TASKS.lettre.source="mairie";
  if(TASKS.restitution){ TASKS.restitution.source="radio"; TASKS.restitution.consigne="Lisez la transcription de ce reportage radio comme si vous l'écoutiez, puis résumez-le en cinq lignes. Notez précisément les chiffres et les dates."; }
  if(TASKS.description&&!TASKS.description.source){ TASKS.description.source="modele"; TASKS.description.modelOnly=true; }
  ["conclusion","paragraphe"].forEach(function(k){ var T=TASKS[k]; if(!T||T.source) return; Object.defineProperty(T,"source",{configurable:true,enumerable:true,get:function(){ return "sj"+(typeof atelier!=="undefined"&&SUJETS[atelier.sujet]?atelier.sujet:0); }}); });

  /* ---------- contexto de cada tarea ---------- */
  var CTX={
    lettre:{sit:"Vives en Villeneuve, una ciudad mediana. El concejo municipal acaba de aprobar una carrera de autos en el centro y el alcalde recibe cartas de los habitantes hasta fin de mes.",who:"El alcalde (registro formal: <i>Monsieur le Maire</i>, vouvoiement).",goal:"Mostrar tu desacuerdo con argumentos y proponer una alternativa realista.",tips:["Usa datos del artículo (fechas, cifras, calles cerradas).","Estructura: objeto → presentación → argumentos → propuesta → fórmula de cortesía.","Conectores: <i>tout d'abord, de plus, en revanche, c'est pourquoi</i>."]},
    conclusion:{sit:"Preparaste una exposición oral sobre el tema elegido y te falta el cierre. El dossier resume las ideas principales del debate.",who:"Tu profesor y tus compañeros de clase.",goal:"Cerrar con una respuesta matizada a la problemática y abrir una nueva pregunta.",tips:["Anuncia el cierre: <i>En définitive…, Au terme de cette réflexion…</i>","Responde con matices: <i>certes… mais…</i>","Termina con una apertura: <i>Reste à savoir si…</i>"]},
    paragraphe:{sit:"En un foro de la universidad se debate el tema elegido. Tienes que defender una idea en un solo párrafo sólido.",who:"Estudiantes y profesores que participan en el foro.",goal:"Defender una idea directriz con dos argumentos y un ejemplo tomado del dossier.",tips:["Primera frase = tu idea directriz.","Un dato del dossier como ejemplo.","Varía los conectores: <i>en effet, par ailleurs, ainsi, pourtant</i>."]},
    restitution:{sit:"En clase de comprensión oral, la profesora pone un reportaje de radio. Aquí tienes la transcripción para leerla como si la escucharas.",who:"Tu profesora, que verifica si entendiste lo esencial.",goal:"Resumir el reportaje en cinco líneas, sin olvidar cifras y fechas.",tips:["Anota primero: tema, cifras, fechas, personas citadas.","No copies frases enteras: reformula.","Sin opinión personal."]},
    resume:{sit:"Tu universidad prepara un boletín con resúmenes de artículos de actualidad para los estudiantes que no tienen tiempo de leerlos completos.",who:"Estudiantes que no leyeron el texto original.",goal:"Reducir el texto a 70 palabras conservando el orden de las ideas y el punto de vista del autor.",tips:["Lee dos veces y subraya la idea de cada párrafo.","Escribe como si fueras el autor (sin nombrarlo).","Reformula: no copies expresiones del texto."]},
    cr:{sit:"Tu profesor te pide un compte rendu del artículo para el dossier del curso.",who:"Tu profesor.",goal:"Presentar el documento y explicar la posición del autor en tercera persona.",tips:["Empieza presentando el documento: tipo, tema, autor si lo hay.","Verbos introductores: <i>l'auteur souligne, dénonce, nuance, conclut</i>.","Unas 100 palabras, sin tu opinión."]},
    synthese:{sit:"Participas en una preparación al DALF C1. Te entregan dos documentos con puntos de vista distintos sobre el teletrabajo.",who:"Un lector que no conoce los documentos.",goal:"Confrontar las ideas de los dos documentos en un texto nuevo, con título.",tips:["Busca los puntos en común y las diferencias.","Organiza por ideas, no documento por documento.","Nada de opinión personal ni información externa."]},
    essaiIA:{sit:"El periódico de tu universidad abre un debate sobre la inteligencia artificial en la educación y publica los mejores artículos de estudiantes.",who:"La comunidad universitaria.",goal:"Defender una tesis matizada apoyándote en el documento y en tus propios ejemplos.",tips:["Título llamativo + introducción con problemática.","Un argumento por párrafo, con ejemplo.","Conclusión con apertura."]},
    description:{sit:"La revista estudiantil de la facultad publica una sección llamada « Mon lieu préféré ». Lee el texto modelo y fíjate en cómo se enriquecen los grupos nominales.",who:"Los lectores de la revista (estudiantes).",goal:"Describir una persona, un lugar o un objeto con grupos nominales ricos y precisos.",tips:["Adjetivos + complemento del nombre: <i>une place pavée, des mains calleuses</i>.","Relativas: <i>que tout le monde appelle…, dont elle garde…</i>","Los cinco sentidos: lo que se ve, se oye, se huele."]},
    essai:{sit:"El periódico de la universidad organiza un debate: ¿el teletrabajo debe convertirse en la norma? Tienes dos documentos como punto de partida.",who:"Estudiantes, profesores y personal administrativo.",goal:"Escribir un artículo argumentativo con una tesis clara, apoyándote en los documentos.",tips:["Usa ideas de los dos documentos, pero con tus palabras.","Plan claro: introducción, 2–3 partes, conclusión.","Ejemplos concretos de tu entorno."]}
  };

  var css=`
  .plx-at{display:grid;gap:12px}
  .plx-st{position:relative;padding:14px 16px 14px 56px;border-radius:20px;background:var(--raise);border:1.5px solid var(--line);box-shadow:0 10px 24px -20px rgba(30,58,138,.5)}
  .plx-st>.n{position:absolute;left:14px;top:14px;width:30px;height:30px;border-radius:10px;display:grid;place-items:center;font-weight:900;color:#fff;background:linear-gradient(180deg,#3274f2,#1e3a8a);box-shadow:0 3px 0 #172b6b}
  .plx-st>h3{margin:2px 0 8px;font-size:1.02rem}
  .plx-st>h3 small{font-weight:700;color:var(--stone);font-size:.78rem;margin-left:6px}
  .plx-st.ctx{background:linear-gradient(180deg,#f3f7ff,var(--raise))}
  .plx-st.read .annot{margin-top:8px!important}
  .plx-st.read details.src>summary{font-weight:800}
  .plx-st.ask .consigne{margin:0}
  .plx-st.ans textarea{width:100%;box-sizing:border-box}
  .plx-ctx dl{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;margin:0}
  .plx-ctx dt{font-weight:900;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:#1e3a8a;padding-top:2px}
  .plx-ctx dd{margin:0;line-height:1.45}
  .plx-ctx ul{margin:8px 0 0;padding-left:18px}.plx-ctx li{margin:3px 0;line-height:1.4}
  .plx-ctx .tt{margin-top:10px;font-weight:900;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:var(--stone)}
  .plx-mark{display:inline-block;margin:6px 0 0;font-size:.8rem;color:var(--stone)}
  html[data-theme=dark] .plx-st.ctx{background:linear-gradient(180deg,#141d34,var(--raise))}
  html[data-theme=dark] .plx-ctx dt{color:#93c5fd}
  @media (max-width:560px){.plx-st{padding:12px 12px 12px 48px}.plx-st>.n{left:10px;width:28px;height:28px}.plx-ctx dl{grid-template-columns:1fr}}
  `;
  var st=document.createElement("style"); st.id="plx26"; st.textContent=css; document.head.appendChild(st);

  function step(n,cls,title,sub,inner){ return '<section class="plx-st '+cls+'"><span class="n">'+n+'</span><h3>'+title+(sub?'<small>'+sub+'</small>':"")+'</h3>'+inner+"</section>"; }

  var _va=viewAtelier;
  viewAtelier=function(){
    var html=_va.apply(this,arguments);
    try{
      var T=TASKS[atelier.task], C=CTX[atelier.task];
      var w=document.createElement("div"); w.innerHTML=html;
      var col=w.querySelector(".cols > .stack"); if(!col) return html;
      var seg=col.querySelector('.seg[aria-label="Tarea"]'), sujet=col.querySelector("#sujet"), sujetL=sujet?sujet.closest("label"):null;
      var cons=col.querySelector("p.consigne"), src=col.querySelector("details.src"), ta=col.querySelector("#atx");
      if(!cons||!ta) return html;
      var rest=[]; var n=ta; while(n){ rest.push(n); n=n.nextElementSibling; }
      var at=document.createElement("div"); at.className="plx-at";
      var h="";
      if(C) h+=step(1,"ctx","Contexto","la situación",'<div class="plx-ctx"><dl><dt>Situación</dt><dd>'+C.sit+'</dd><dt>Quién lee</dt><dd>'+C.who+'</dd><dt>Objetivo</dt><dd>'+C.goal+'</dd></dl><div class="tt">Pistas</div><ul>'+C.tips.map(function(t){return "<li>"+t+"</li>"}).join("")+"</ul></div>");
      var readInner="";
      if(src){ src.open=true; var sm=src.querySelector("summary"); if(sm) sm.textContent=T.modelOnly?"Texto modelo":(SOURCES[T.source]&&SOURCES[T.source].length>1?"Documentos":"Documento"); readInner=src.outerHTML+(T.modelOnly?'<span class="plx-mark">Es solo un modelo: tu texto debe describir otra persona, lugar u objeto.</span>':""); }
      h+=step(2,"read","Lectura",T.modelOnly?"lee el modelo":"lee antes de escribir",readInner||'<p class="note small">Esta tarea no tiene texto de apoyo.</p>');
      h+=step(3,"ask","Pregunta","la consigna",(sujetL?sujetL.outerHTML:"")+cons.outerHTML);
      at.innerHTML=h;
      var ans=document.createElement("section"); ans.className="plx-st ans"; ans.innerHTML='<span class="n">4</span><h3>Respuesta<small>escribe en francés</small></h3>';
      rest.forEach(function(el){ ans.appendChild(el); });
      at.appendChild(ans);
      if(sujetL) sujetL.remove(); cons.remove(); if(src) src.remove();
      col.innerHTML=""; if(seg) col.appendChild(seg); col.appendChild(at);
      return w.innerHTML;
    }catch(e){ return html; }
  };
  /* cambiar de tema actualiza el dossier de lectura */
  document.addEventListener("change",function(e){ if(e.target&&e.target.id==="sujet"&&view==="atelier") setTimeout(function(){ try{ render(); }catch(x){} },0); });
})();
