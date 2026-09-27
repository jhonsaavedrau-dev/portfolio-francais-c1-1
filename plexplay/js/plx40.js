/* PLEX PLAY 1.20 — Panel docente rediseñado: más claro, con prioridades del día y lista de estudiantes legible en celular */
(function(){
  "use strict";
  if(typeof tView!=="function"||typeof tStudentsHTML!=="function") return;
  var esc=function(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var PAL=["#2563eb","#db2777","#0f766e","#7c3aed","#ea580c","#0891b2","#16a34a","#b45309"];
  function hue(s){ var h=0; s=String(s||""); for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return PAL[h%PAL.length]; }
  function ini(s){ s=String(s||"?").replace(/@.*/,"").replace(/[._-]+/g," ").trim(); var p=s.split(/\s+/); return ((p[0]||"?")[0]+((p[1]||"")[0]||"")).toUpperCase(); }
  function lvlOf(c){ var m=String(c.name||"").match(/\b([ABC][12](?:\.[12])?)\b/i)||String(courseLabel(c.course)||"").match(/([ABC][12](?:\.[12])?)/); return m?m[1].toUpperCase():(String(c.name||"?").slice(0,2).toUpperCase()); }
  var I={
    cls:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M7 9v5c0 1.7 2.2 3 5 3s5-1.3 5-3V9"/></svg>',
    users:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.2 2.5 3.6 5.2"/></svg>',
    bolt:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
    flag:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4h11l-2 4 2 4H5"/></svg>',
    chart:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    target:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    arrow:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    plus:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
  };
  function kpi(icon,val,lab,c,sub){ return '<div class="tp2-kpi" style="--k:'+c+'"><span class="tp2-ki">'+icon+"</span><div><b>"+val+"</b><span>"+lab+"</span>"+(sub?"<small>"+sub+"</small>":"")+"</div></div>"; }
  function today(){ try{ var s=new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"}); return s.charAt(0).toUpperCase()+s.slice(1); }catch(e){ return ""; } }

  /* ------------------------------ inicio del panel ------------------------------ */
  var _tView=tView;
  tView=function(){
    if(!isTeacher()||T.sem||T.cls) return _tView.apply(this,arguments);
    if(T.classes==null&&!T.busy) setTimeout(tLoadClasses,0);
    var C2=(T.classes||[]).filter(function(c){ return !c.archived; }), A=(T.classes||[]).filter(function(c){ return c.archived; }), G=gEnsure();
    var stu=C2.reduce(function(a,c){ return a+(c.students||0); },0), act=C2.reduce(function(a,c){ return a+(c.active||0); },0), rep=(teach.reports||[]).length, idle=Math.max(0,stu-act);
    var todo=[];
    if(!C2.length&&!(T.busy&&T.classes==null)) todo.push({c:"#2563eb",i:I.plus,t:"Crea tu primera clase",d:"Te damos un código de 6 letras para tus estudiantes.",a:'data-tc="new"',b:"Crear clase"});
    C2.filter(function(c){ return !c.students; }).slice(0,2).forEach(function(c){ todo.push({c:"#7c3aed",i:I.users,t:esc(c.name)+" aún no tiene estudiantes",d:"Comparte el código <b>"+esc(c.code)+"</b> en clase o por WhatsApp.",a:'data-tc="open" data-id="'+c.id+'"',b:"Abrir clase"}); });
    if(idle>0) todo.push({c:"#ea580c",i:I.bolt,t:idle+" estudiante"+(idle>1?"s":"")+" sin practicar esta semana",d:"Ábrelos en cada clase y mándales un aviso para animarlos.",a:C2.length===1?'data-tc="open" data-id="'+C2[0].id+'"':'data-tp2="scroll" data-to="tp2-classes"',b:"Ver clases"});
    if(rep>0) todo.push({c:"#dc2626",i:I.flag,t:rep+" reporte"+(rep>1?"s":"")+" de ejercicios",d:"Estudiantes marcaron ejercicios con posible error.",a:'data-tp2="scroll" data-to="tp2-reports"',b:"Revisar"});
    var loading=T.busy&&T.classes==null;
    return '<section class="gview tpanel tp2">'+
      '<div class="tp2-hero"><div class="tp2-hl"><small>'+esc(today())+'</small><h1>Hola, '+esc(G.name||"profe")+'</h1><p>Aquí ves tus clases, quién avanza, quién necesita un empujón y qué revisar hoy.</p>'+
        '<div class="tp2-cta"><button class="tp2-btn pri tc-new" data-tc="new">'+I.plus+' Nueva clase</button>'+(C2.length?'<button class="tp2-btn" data-tp2="scroll" data-to="tp2-classes">Mis clases '+I.arrow+"</button>":"")+"</div></div>"+
        '<img src="img/mz-gafas.webp" alt=""></div>'+
      (T.err?'<p class="gm-err" role="alert">'+esc(T.err)+"</p>":"")+
      '<div class="tp2-kpis t-kpis">'+kpi(I.cls,C2.length,"clases activas","#2563eb")+kpi(I.users,stu,"estudiantes","#7c3aed")+kpi(I.bolt,act,"activos esta semana","#16a34a",stu?Math.round(act/stu*100)+" % del total":"")+kpi(I.flag,rep,"reportes por revisar",rep?"#dc2626":"#64748b")+"</div>"+
      (todo.length?'<h2 class="tp2-h">Para hoy</h2><div class="tp2-todo">'+todo.slice(0,3).map(function(x){ return '<div class="tp2-td" style="--k:'+x.c+'"><span class="tp2-ki">'+x.i+'</span><div><b>'+x.t+"</b><p>"+x.d+'</p></div><button class="tp2-go" '+x.a+">"+x.b+" "+I.arrow+"</button></div>"; }).join("")+"</div>"
        :(C2.length?'<div class="tp2-allok"><span>✅</span><div><b>Todo en orden</b><p>Tus estudiantes están practicando y no hay reportes pendientes.</p></div></div>':""))+
      '<div class="tp2-sh" id="tp2-classes"><h2 class="tp2-h">Mis clases</h2>'+(C2.length?'<button class="gbtn ghost sm" data-tc="new">'+I.plus+" Nueva</button>":"")+"</div>"+
      (loading?'<div class="tp2-grid"><div class="tp2-sk"></div><div class="tp2-sk"></div></div>':
       C2.length?'<div class="tp2-grid">'+C2.map(function(c){
          var n=c.students||0, a=c.active||0, p=n?Math.round(a/n*100):0, col=hue(c.code||c.name);
          return '<button class="tp2-cls" data-tc="open" data-id="'+c.id+'" style="--k:'+col+'">'+
            '<span class="tp2-ct"><span class="tp2-av">'+esc(lvlOf(c))+'</span><span class="tp2-cn"><b>'+esc(c.name)+"</b><small>"+esc(courseLabel(c.course))+(c.grp?" · Semestre "+esc(c.grp):"")+'</small></span><span class="tp2-code" title="Código para unirse">'+esc(c.code)+"</span></span>"+
            '<span class="tp2-cs"><span><b>'+n+"</b> estudiante"+(n===1?"":"s")+'</span><span><b>'+a+"</b> activo"+(a===1?"":"s")+" esta semana</span></span>"+
            '<span class="tp2-meter" role="img" aria-label="'+p+' % activos"><i style="width:'+Math.max(p,n?3:0)+'%"></i></span>'+
            '<span class="tp2-open">'+(n?"Ver estudiantes":"Compartir código")+" "+I.arrow+"</span></button>";
        }).join("")+'<button class="tp2-cls tp2-add" data-tc="new"><span>'+I.plus+"</span><b>Nueva clase</b><small>Un código para cada grupo</small></button></div>"
       :'<div class="tp2-empty"><img src="img/mz-curioso.webp" alt=""><div><b>Crea tu primera clase</b><p>Te daremos un código de 6 letras. Tus estudiantes lo escriben en <b>Perfil → Mis clases</b> y aparecen aquí con su avance.</p><button class="tp2-btn pri" data-tc="new">'+I.plus+" Nueva clase</button></div></div>")+
      (A.length?'<details class="gcard t-arch"><summary>Clases archivadas ('+A.length+")</summary><ul>"+A.map(function(c){ return "<li><span>"+esc(c.name)+" · "+esc(courseLabel(c.course))+'</span><button class="gbtn ghost sm" data-tc="unarch" data-id="'+c.id+'">Reactivar</button></li>'; }).join("")+"</ul></details>":"")+
      '<div id="tp2-reports" class="tp2-sec">'+docReportsHTML()+"</div>"+
      (isAdmin()?'<div class="tp2-sec">'+tAdminHTML()+"</div>":"")+
    "</section>";
  };
  if(typeof GV!=="undefined") GV.docente=tView;

  /* ------------------------------ lista de estudiantes ------------------------------ */
  var FL={f:"all",q:""};
  var _tSt=tStudentsHTML;
  tStudentsHTML=function(c,D){
    if(!D.rows.length) return _tSt.apply(this,arguments);
    var old=_tSt.apply(this,arguments), csvM=old.match(/href="(data:text\/csv[^"]*)"\s+download="([^"]*)"/);
    var R=tRows(c,D), wk=weekKey();
    var act=R.filter(function(x){ return x.r.at&&Date.now()-x.r.at<7*864e5; }).length, avgP=Math.round(R.reduce(function(a,x){ return a+x.pct; },0)/R.length);
    var accs=R.map(function(x){ return x.acc; }).filter(function(x){ return x!=null; }), avgA=accs.length?Math.round(accs.reduce(function(a,b){ return a+b; },0)/accs.length):null;
    var cnt={ok:0,help:0,idle:0,"new":0}; R.forEach(function(x){ cnt[x.status]++; });
    var need=cnt.help+cnt.idle;
    var list=R.filter(function(x){ if(FL.f==="need"&&!(x.status==="help"||x.status==="idle")) return false; if(FL.f!=="all"&&FL.f!=="need"&&x.status!==FL.f) return false; if(FL.q){ var q=FL.q.toLowerCase(); if(String(x.r.nick||"").toLowerCase().indexOf(q)<0&&String(x.r.email||"").toLowerCase().indexOf(q)<0) return false; } return true; });
    var chips=[["all","Todos",R.length],["need","Necesitan atención",need],["ok","Al día",cnt.ok],["new","Sin empezar",cnt["new"]]];
    var accC=function(a){ return a==null?"":a>=80?"g":a>=60?"y":"r"; };
    return '<div class="tp2-kpis">'+kpi(I.users,R.length,"estudiantes","#2563eb")+kpi(I.bolt,act,"activos 7 días","#16a34a",Math.round(act/R.length*100)+" % de la clase")+kpi(I.chart,avgP+" %","avance medio del curso","#7c3aed")+kpi(I.target,avgA==null?"–":avgA+" %","precisión media",avgA==null?"#64748b":avgA>=80?"#16a34a":avgA>=60?"#d97706":"#dc2626")+"</div>"+
      (need?'<div class="tp2-alert"><span class="tp2-ki">'+I.flag+'</span><div><b>'+need+" estudiante"+(need>1?"s necesitan":" necesita")+' atención</b><p>'+(cnt.idle?cnt.idle+" sin practicar hace más de 7 días":"")+(cnt.idle&&cnt.help?" · ":"")+(cnt.help?cnt.help+" con precisión menor al 60 %":"")+'. Envía un aviso a la clase o revisa su detalle.</p></div><button class="tp2-go" data-tsub="avisos">Enviar aviso '+I.arrow+"</button></div>":"")+
      '<div class="tp2-tools"><div class="tp2-chips" role="group" aria-label="Filtrar">'+chips.map(function(k){ return '<button data-tp2f="'+k[0]+'" aria-pressed="'+(FL.f===k[0])+'">'+k[1]+" <i>"+k[2]+"</i></button>"; }).join("")+"</div>"+
        '<div class="tp2-tr"><input id="tp2Q" type="search" placeholder="Buscar estudiante…" value="'+esc(FL.q)+'" aria-label="Buscar estudiante">'+
        '<label class="tp2-sort"><span>Ordenar</span><select id="tSort">'+[["name","Nombre"],["prog","Avance"],["acc","Precisión (menor primero)"],["last","Última actividad"],["streak","Racha"]].map(function(o){ return '<option value="'+o[0]+'" '+(T.sort===o[0]?"selected":"")+">"+o[1]+"</option>"; }).join("")+"</select></label>"+
        (csvM?'<a class="gbtn ghost sm" href="'+csvM[1]+'" download="'+csvM[2]+'">CSV</a>':"")+"</div></div>"+
      '<div class="tp2-list" role="list">'+
        '<div class="tp2-row tp2-hd" aria-hidden="true"><span>Estudiante</span><span>Avance del curso</span><span class="n">Precisión</span><span class="n">XP semana</span><span class="n">Racha</span><span class="n">Última vez</span><span>Estado</span></div>'+
        (list.length?list.map(function(x){
          var nm=x.r.nick||String(x.r.email||"").replace(/@.*/,""), acc=x.acc;
          return '<div class="tp2-row" role="listitem button" data-tc="stu" data-id="'+x.r.id+'" tabindex="0" aria-label="Ver detalle de '+esc(nm)+'">'+
            '<span class="tp2-who"><span class="tp2-avs" style="--k:'+hue(x.r.email)+'">'+esc(ini(nm))+'</span><span><b>'+esc(nm)+"</b><small>"+esc(x.r.email)+"</small></span></span>"+
            '<span class="tp2-pg"><span class="tp2-bar"><i style="width:'+Math.max(2,x.pct)+'%"></i></span><small>'+x.pct+" % · "+x.done+"/"+x.total+"</small></span>"+
            '<span class="n tp2-acc '+accC(acc)+'" data-l="Precisión">'+(acc==null?"–":acc+" %")+"</span>"+
            '<span class="n" data-l="XP semana">'+(x.r.wk===wk?x.r.wxp:0)+"</span>"+
            '<span class="n" data-l="Racha">🔥 '+(x.r.streak||0)+"</span>"+
            '<span class="n" data-l="Última vez">'+esc(tAgo(x.r.at))+"</span>"+
            '<span class="tp2-st"><span class="t-chip '+ST_LBL[x.status][1]+'">'+ST_LBL[x.status][0]+"</span></span></div>";
        }).join(""):'<p class="tp2-none">Nadie coincide con este filtro.</p>')+"</div>"+
      '<p class="set-note">Toca un estudiante para ver su actividad, las lecciones que más le cuestan y sus errores frecuentes.</p>';
  };

  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-tp2],[data-tp2f]"); if(!b) return;
    e.preventDefault();
    if(b.dataset.tp2f){ FL.f=b.dataset.tp2f; render(); return; }
    if(b.dataset.tp2==="scroll"){ var t=document.getElementById(b.dataset.to); if(t) t.scrollIntoView({behavior:"smooth",block:"start"}); }
  });
  var qT=null;
  document.addEventListener("input",function(e){ if(e.target.id!=="tp2Q") return; FL.q=e.target.value; clearTimeout(qT); qT=setTimeout(function(){ var pos=e.target.selectionStart; render(); var n=document.getElementById("tp2Q"); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(x){} } },200); });
  document.addEventListener("keydown",function(e){ if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches('.tp2-row[data-tc="stu"]')){ e.preventDefault(); tStudentModal(e.target.dataset.id); } });

  var css=`
  .tp2{--tp-ink:#0f172a}
  .tp2-hero{position:relative;display:flex;align-items:center;gap:18px;padding:24px 26px;border-radius:28px;color:#fff;margin:6px 0 16px;overflow:hidden;background:radial-gradient(600px 300px at 100% 0%,rgba(250,204,21,.35),transparent 60%),linear-gradient(125deg,#172554,#1e3a8a 45%,#4338ca);box-shadow:0 26px 50px -32px rgba(30,58,138,.9)}
  .tp2-hl{flex:1;min-width:0}.tp2-hl small{font-weight:800;opacity:.85;font-size:.8rem;letter-spacing:.03em}
  .tp2-hl h1{color:#fff!important;margin:4px 0 6px;font-size:2rem}.tp2-hl p{margin:0 0 14px;opacity:.92;line-height:1.45;max-width:560px}
  .tp2-hero img{width:120px;height:120px;object-fit:cover;border-radius:50%;border:4px solid rgba(255,255,255,.35);flex:none}
  .tp2-cta{display:flex;gap:10px;flex-wrap:wrap}
  .tp2-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:14px;font-weight:800;background:rgba(255,255,255,.14);color:#fff;border:1.5px solid rgba(255,255,255,.3)}
  .tp2-btn:hover{background:rgba(255,255,255,.22)}
  .tp2-btn.pri{background:#facc15;color:#1e1b4b;border-color:#facc15}.tp2-btn.pri:hover{background:#fde047}
  .tp2-empty .tp2-btn.pri{margin-top:6px}
  .tp2-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 6px}
  .tp2-kpi{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:20px;background:var(--raise);border:1.5px solid var(--line);box-shadow:0 12px 26px -22px rgba(15,23,42,.5)}
  .tp2-ki{flex:none;width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:var(--k);background:color-mix(in srgb,var(--k) 13%,transparent)}
  .tp2-kpi>div{display:grid;min-width:0}.tp2-kpi b{font-size:1.6rem;line-height:1.05;color:var(--ink)}.tp2-kpi span:not(.tp2-ki){color:var(--stone);font-size:.84rem;font-weight:600}.tp2-kpi small{color:var(--k);font-weight:800;font-size:.75rem}
  .tp2-h{font-size:1.12rem;margin:20px 0 10px}
  .tp2-sh{display:flex;align-items:center;justify-content:space-between;gap:10px}.tp2-sh .gbtn{width:auto}
  .tp2-todo{display:grid;gap:10px}
  .tp2-td,.tp2-alert{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:20px;background:color-mix(in srgb,var(--k) 7%,var(--raise));border:1.5px solid color-mix(in srgb,var(--k) 28%,var(--line))}
  .tp2-td>div,.tp2-alert>div{flex:1;min-width:0}.tp2-td b,.tp2-alert b{display:block}.tp2-td p,.tp2-alert p{margin:2px 0 0;color:var(--stone);font-size:.9rem;line-height:1.4}
  .tp2-alert{--k:#ea580c;margin:12px 0 4px}
  .tp2-go{all:unset;box-sizing:border-box;cursor:pointer;flex:none;display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:12px;background:var(--k);color:#fff;font-weight:800;font-size:.88rem;white-space:nowrap}
  .tp2-go:hover{filter:brightness(1.08)}
  .tp2-allok{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:20px;background:#f0fdf4;border:1.5px solid #bbf7d0;margin-top:14px}.tp2-allok span{font-size:1.6rem}.tp2-allok p{margin:2px 0 0;color:#166534}
  html[data-theme=dark] .tp2-allok{background:#0f2a1a;border-color:#1f5134}html[data-theme=dark] .tp2-allok p{color:#86efac}
  .tp2-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px}
  .tp2-cls{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:12px;padding:18px;border-radius:24px;background:var(--raise);border:1.5px solid var(--line);box-shadow:0 16px 30px -24px rgba(15,23,42,.55);transition:transform .15s,box-shadow .15s,border-color .15s;position:relative;overflow:hidden}
  .tp2-cls::before{content:"";position:absolute;right:0;bottom:0;width:140px;height:140px;border-radius:50%;transform:translate(45%,45%);pointer-events:none;background:color-mix(in srgb,var(--k) 12%,transparent)}
  .tp2-cls:hover{transform:translateY(-3px);border-color:color-mix(in srgb,var(--k) 45%,var(--line));box-shadow:0 22px 36px -24px color-mix(in srgb,var(--k) 70%,transparent)}
  .tp2-cls:focus-visible,.tp2-go:focus-visible,.tp2-btn:focus-visible,.tp2-row:focus-visible,.tp2-chips button:focus-visible{outline:3px solid #2563eb;outline-offset:2px}
  .tp2-ct{display:flex;align-items:center;gap:12px;position:relative}
  .tp2-av{flex:none;width:52px;height:52px;border-radius:16px;display:grid;place-items:center;font-weight:900;color:#fff;background:linear-gradient(135deg,var(--k),color-mix(in srgb,var(--k) 55%,#0f172a));font-size:1rem}
  .tp2-cn{flex:1;min-width:0;display:grid}.tp2-cn b{font-size:1.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tp2-cn small{color:var(--stone)}
  .tp2-code{flex:none;align-self:flex-start;font-family:ui-monospace,monospace;font-weight:900;letter-spacing:.12em;font-size:.8rem;padding:4px 8px;border-radius:8px;background:var(--surf3);color:var(--ink)}
  .tp2-cs{display:flex;justify-content:space-between;gap:10px;color:var(--stone);font-size:.88rem;flex-wrap:wrap}.tp2-cs b{color:var(--ink);font-size:1.05rem}
  .tp2-meter{display:block;height:9px;border-radius:99px;background:var(--surf3);overflow:hidden}.tp2-meter i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--k),color-mix(in srgb,var(--k) 60%,#facc15))}
  .tp2-open{display:inline-flex;align-items:center;gap:6px;font-weight:800;color:var(--k)}
  .tp2-add{border-style:dashed;border-width:2px;place-content:center;justify-items:center;text-align:center;gap:4px;min-height:170px;color:var(--stone)}
  .tp2-add::before{display:none}.tp2-add>span{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:var(--surf3);color:var(--ink)}.tp2-add b{color:var(--ink)}
  .tp2-sk{height:170px;border-radius:24px;background:linear-gradient(90deg,var(--surf2),var(--surf3),var(--surf2));background-size:200% 100%;animation:tp2Sk 1.2s infinite}
  @keyframes tp2Sk{to{background-position:-200% 0}}
  .tp2-empty{display:flex;align-items:center;gap:18px;padding:22px;border-radius:24px;background:var(--raise);border:2px dashed var(--line)}.tp2-empty img{width:110px;height:110px;border-radius:50%;object-fit:cover}.tp2-empty p{margin:4px 0 8px;color:var(--stone)}
  .tp2-sec{margin-top:16px}.tp2-sec>.gcard{margin:0}
  /* vista de la clase */
  .tclass .tcl-head{padding:20px 22px;border-radius:26px;background:linear-gradient(125deg,#172554,#1e3a8a 50%,#4338ca);color:#fff;align-items:center!important}
  .tclass .tcl-head h1{color:#fff!important}.tclass .tcl-head .gp-note{color:#c7d2fe!important}
  .tclass .tcl-code{background:rgba(255,255,255,.1)!important;border:1.5px solid rgba(255,255,255,.25)!important;color:#fff}
  .tclass .tcl-code small{color:#c7d2fe!important}.tclass .tcl-code b{color:#facc15!important}
  .tclass .tcl-code .gbtn{background:rgba(255,255,255,.14)!important;color:#fff!important;border-color:transparent!important}
  .tclass .t-tabs{background:var(--surf3);padding:5px;border-radius:18px;gap:4px;margin:14px 0}
  .tclass .t-tabs button{border-radius:14px!important}
  .tclass .t-tabs button[aria-selected="true"]{background:var(--raise)!important;color:#1e3a8a!important;box-shadow:0 6px 14px -8px rgba(15,23,42,.45)}
  html[data-theme=dark] .tclass .t-tabs button[aria-selected="true"]{color:#bfdbfe!important}
  .tp2-tools{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:14px 0 10px}
  .tp2-chips{display:flex;gap:6px;flex-wrap:wrap}
  .tp2-chips button{all:unset;cursor:pointer;padding:8px 12px;border-radius:99px;background:var(--raise);border:1.5px solid var(--line);font-weight:700;font-size:.86rem}
  .tp2-chips button i{font-style:normal;margin-left:4px;padding:0 7px;border-radius:99px;background:var(--surf3);font-size:.78rem}
  .tp2-chips button[aria-pressed="true"]{background:#1e3a8a;border-color:#1e3a8a;color:#fff}.tp2-chips button[aria-pressed="true"] i{background:rgba(255,255,255,.2)}
  .tp2-tr{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.tp2-tr .gbtn{width:auto}
  .tp2-tr input{padding:9px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--raise);color:var(--ink);font:inherit;min-width:190px}
  .tp2-sort{display:flex;align-items:center;gap:6px;font-size:.85rem;color:var(--stone);font-weight:700}
  .tp2-sort select{padding:9px 10px;border-radius:12px;border:1.5px solid var(--line);background:var(--raise);color:var(--ink);font:inherit;font-size:.9rem}
  .tp2-list{border-radius:22px;background:var(--raise);border:1.5px solid var(--line);overflow:hidden;box-shadow:0 16px 30px -26px rgba(15,23,42,.5)}
  .tp2-row{display:grid;grid-template-columns:minmax(220px,2.2fr) minmax(150px,1.6fr) .8fr .8fr .7fr .9fr 1.1fr;gap:12px;align-items:center;padding:12px 16px;border-top:1px solid var(--line);cursor:pointer}
  .tp2-row:first-child{border-top:0}.tp2-row:not(.tp2-hd):hover{background:var(--surf2)}
  .tp2-hd{cursor:default;background:var(--surf2);font-size:.72rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--stone)}
  .tp2-row .n{text-align:right;font-variant-numeric:tabular-nums}
  .tp2-who{display:flex;align-items:center;gap:10px;min-width:0}.tp2-who>span:last-child{display:grid;min-width:0}.tp2-who b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tp2-who small{color:var(--stone);font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tp2-avs{flex:none;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:.85rem;color:#fff;background:var(--k)}
  .tp2-pg{display:grid;gap:4px}.tp2-pg small{color:var(--stone);font-size:.76rem}
  .tp2-bar{display:block;height:8px;border-radius:99px;background:var(--surf3);overflow:hidden}.tp2-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#2563eb,#7c3aed)}
  .tp2-acc{font-weight:800}.tp2-acc.g{color:#16a34a}.tp2-acc.y{color:#d97706}.tp2-acc.r{color:#dc2626}
  .tp2-st{display:flex;justify-content:flex-start}
  .tp2-none{padding:20px;text-align:center;color:var(--stone);margin:0}
  @media (max-width:980px){.tp2-kpis{grid-template-columns:repeat(2,1fr)}}
  @media (max-width:860px){
    .tp2-hd{display:none}
    .tp2-row{grid-template-columns:1fr 1fr 1fr;grid-template-areas:"who who st" "pg pg pg" "a b c";row-gap:8px;padding:14px}
    .tp2-who{grid-area:who}.tp2-st{grid-area:st;justify-content:flex-end}.tp2-pg{grid-area:pg}
    .tp2-row>.n{text-align:left;display:grid;font-size:.9rem}.tp2-row>.n::before{content:attr(data-l);font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--stone)}
    .tp2-row>.n:nth-of-type(4){display:none}
    .tp2-tr{width:100%}.tp2-tr input{flex:1;min-width:0}
  }
  @media (max-width:640px){.tp2-hero{padding:18px}.tp2-hero img{width:76px;height:76px;align-self:flex-start}.tp2-hl h1{font-size:1.5rem}.tp2-kpi{padding:12px}.tp2-kpi b{font-size:1.3rem}.tp2-ki{width:38px;height:38px}
    .tp2-td,.tp2-alert{flex-wrap:wrap}.tp2-td .tp2-go,.tp2-alert .tp2-go{width:100%;justify-content:center}
    .tclass .tcl-head{padding:16px}}
  `;
  var st=document.createElement("style"); st.id="plx40"; st.textContent=css; document.head.appendChild(st);
})();
