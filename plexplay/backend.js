/* =====================================================================
   PLEX PLAY — conexión con el servidor (Supabase)
   Se carga ANTES de la app. Expone window.PCB y un adaptador window.claude
   con la misma forma que usa la app (user · db · sample), para que el
   progreso, la clasificación y la IA funcionen fuera de claude.ai.
   ===================================================================== */
(function(){
  const CFG=window.PC_CONFIG||{};
  const ON=!!(CFG.url&&CFG.key&&window.supabase&&window.supabase.createClient);
  const PCB=window.PCB={enabled:ON,domain:"unipamplona.edu.co"};
  if(!ON) return;

  const AUTH_KEY="pc-auth";
  const sb=supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:AUTH_KEY}});
  PCB.sb=sb;

  // sesión guardada (lectura síncrona, para decidir antes de que arranque la app)
  let stored=null; try{ stored=JSON.parse(localStorage.getItem(AUTH_KEY)||"null"); }catch(e){}
  const hintUser=stored&&stored.user?stored.user:null;
  PCB.loggedHint=!!hintUser;
  PCB.email=hintUser?hintUser.email:"";
  PCB.uid=hintUser?hintUser.id:null;

  // si el dispositivo cambia de cuenta, se limpia el progreso local del anterior
  try{
    const owner=localStorage.getItem("pc-owner");
    if(hintUser&&owner&&owner!==hintUser.id){
      Object.keys(localStorage).filter(k=>/^(carnet-etudes-c11|pc-profiles|pc-active)/.test(k)).forEach(k=>localStorage.removeItem(k));
    }
    if(hintUser) localStorage.setItem("pc-owner",hintUser.id);
  }catch(e){}

  let session=null;
  PCB.ready=sb.auth.getSession().then(r=>{ session=r.data.session||null; if(session){ PCB.uid=session.user.id; PCB.email=session.user.email; PCB.hasPw=!!((session.user.user_metadata||{}).pw); } return session; }).catch(()=>null);
  sb.auth.onAuthStateChange((_ev,s)=>{ session=s||null; });
  const token=async()=>{ const s=(await sb.auth.getSession()).data.session; return s&&s.access_token; };

  /* ---------- perfil propio ---------- */
  PCB.loadMe=async()=>{
    const s=await PCB.ready; if(!s) return null;
    const {data}=await sb.from("profiles").select("id,nick,cat,grp,xp,wxp,wk,streak,lvl,done,ach,is_teacher,at").eq("id",s.user.id).maybeSingle();
    PCB.me=data||null; return PCB.me;
  };

  /* ---------- adaptador de base de datos ---------- */
  const visible=()=>document.visibilityState==="visible";
  function poll(fn,ms){ let stop=false; const run=async()=>{ if(stop) return; if(visible()){ try{ await fn(); }catch(e){} } setTimeout(run,ms); }; run(); return ()=>{ stop=true; }; }
  const PROFILE_COLS="id,nick,cat,grp,xp,wxp,wk,streak,lvl,done,ach,is_teacher,at";

  const DB={
    doc(path){
      const parts=path.split("/");
      if(parts[0]==="data"&&parts[3]==="progress"){
        const uid=parts[2];
        const get=async()=>{ const {data,error}=await sb.from("progress").select("state,updated_at").eq("user_id",uid).maybeSingle(); if(error) throw error; return {exists:!!data,data:()=>({state:data?data.state:null})}; };
        return {
          get,
          async set(obj){ const {error}=await sb.from("progress").upsert({user_id:uid,state:obj.state,updated_at:new Date().toISOString()}); if(error) throw error; },
          onSnapshot(cb,err){ let last=""; return poll(async()=>{ const {data}=await sb.from("progress").select("state,updated_at").eq("user_id",uid).maybeSingle(); if(data&&data.updated_at!==last){ last=data.updated_at; cb({exists:true,data:()=>({state:data.state})}); } },45000); }
        };
      }
      if(parts[0]==="players"){
        const uid=parts[1];
        return { async set(o){
          const extra={};
          try{ const G=window.gEnsure&&gEnsure(); if(G){ extra.grp=G.grp||null; extra.ach=Object.keys(G.ach||{}).length; } if(window.doneCount) extra.done=doneCount(); }catch(e){}
          const row=Object.assign({nick:o.nick,cat:o.cat,xp:o.xp,wxp:o.wxp,wk:o.wk,streak:o.streak,lvl:o.lvl,at:o.at,updated_at:new Date().toISOString()},extra);
          const {error}=await sb.from("profiles").update(row).eq("id",uid); if(error) throw error; } };
      }
      throw new Error("ruta no soportada: "+path);
    },
    collection(name){
      const q={n:60};
      const api={ orderBy(){ return api; }, limit(n){ q.n=n; return api; },
        onSnapshot(cb,err){ return poll(async()=>{ const {data,error}=await sb.from("profiles").select(PROFILE_COLS).not("nick","is",null).order("wxp",{ascending:false}).limit(Math.max(q.n,200)); if(error){ err&&err(error); return; } cb({docs:(data||[]).map(r=>({id:r.id,data:()=>r}))}); },60000); } };
      if(name!=="players") throw new Error("colección no soportada: "+name);
      return api;
    }
  };

  /* ---------- IA (función del servidor) ---------- */
  async function callAI(mode,prompt,opts){
    opts=opts||{};
    const t=await token(); if(!t) throw {code:"session_expired"};
    let r;
    try{
      r=await fetch(CFG.url+"/functions/v1/ai",{method:"POST",signal:opts.signal,
        headers:{"Content-Type":"application/json",Authorization:"Bearer "+t,apikey:CFG.key},
        body:JSON.stringify({kind:opts.kind||"why",mode,prompt,text:opts.text||""})});
    }catch(e){ if(e&&e.name==="AbortError") throw {code:"cancelled"}; throw {code:navigator.onLine?"provider_error":"offline"}; }
    let d={}; try{ d=await r.json(); }catch(e){}
    if(!r.ok){
      if(d.code==="daily_limit"){ if((opts.kind||"why")!=="atelier"&&window.toast) toast("Llegaste al límite de hoy para esta ayuda de IA. Mañana se renueva."); throw {code:"daily_limit",limit:d.limit}; }
      if(d.code==="provider_quota") throw {code:"rate_limited"};
      if(r.status===401) throw {code:"session_expired"};
      throw {code:d.code||"provider_error"};
    }
    PCB.aiLeft=d.left;
    return d.result;
  }
  const SAMPLE=async function(prompt,opts){ const text=String(await callAI("text",prompt,opts)||""); if(opts&&opts.onText) opts.onText({text}); return text; };
  SAMPLE.json=(prompt,opts)=>callAI("json",prompt,opts);

  /* ---------- lo que la app pide con claude.use(...) ---------- */
  window.claude={ use:async name=>{
    const s=await PCB.ready; if(!s) return null;
    if(name==="user") return { id:async()=>s.user.id, me:async()=>{ const m=PCB.me||await PCB.loadMe(); return {name:(m&&m.nick)||s.user.email.split("@")[0]}; } };
    if(name==="db") return DB;
    if(name==="sample") return SAMPLE;
    return null;
  }};

  /* ---------- acceso ---------- */
  PCB.sendCode=async(email,create=true)=>{ const {error}=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:create}}); if(error) throw error; };
  PCB.signIn=async(email,password)=>{ const {data,error}=await sb.auth.signInWithPassword({email,password}); if(error) throw error; try{ localStorage.setItem("plx-known",email); }catch(e){} return data; };
  PCB.setPassword=async password=>{ const {data,error}=await sb.auth.updateUser({password,data:{pw:true}}); if(error) throw error; PCB.hasPw=true; try{ localStorage.setItem("plx-known",PCB.email||""); }catch(e){} return data; };
  PCB.verifyCode=async(email,code)=>{ const {data,error}=await sb.auth.verifyOtp({email,token:code,type:"email"}); if(error) throw error; try{ localStorage.setItem("pc-owner",data.user.id); }catch(e){} PCB.uid=data.user.id; PCB.email=data.user.email; PCB.hasPw=!!((data.user.user_metadata||{}).pw); return data; };
  PCB.signOut=async()=>{ try{ await sb.auth.signOut(); }catch(e){} try{ Object.keys(localStorage).filter(k=>/^(carnet-etudes-c11|pc-|cr-draft)/.test(k)).forEach(k=>localStorage.removeItem(k)); }catch(e){} };
  PCB.deleteAccount=async()=>{ const {error}=await sb.rpc("delete_me"); if(error) throw error; await PCB.signOut(); };
  PCB.report=async r=>{ const {error}=await sb.from("reports").insert({user_id:PCB.uid,item_key:r.key,lesson_id:r.lesson||null,reason:r.reason||"otro",message:(r.message||"").slice(0,1000),prompt:(r.prompt||"").slice(0,600)}); if(error) throw error; };
  PCB.reports=async()=>{ const {data,error}=await sb.from("reports").select("id,item_key,lesson_id,reason,message,prompt,status,created_at").eq("status","open").order("created_at",{ascending:false}).limit(200); if(error) throw error; return data||[]; };
  PCB.closeReports=async ids=>{ const {error}=await sb.from("reports").update({status:"done"}).in("id",ids); if(error) throw error; };
  PCB.roster=async grp=>{ const {data,error}=await sb.rpc("teacher_roster",{p_grp:grp||null}); if(error) throw error; return data||[]; };
  PCB.states=async ids=>{ if(!ids.length) return []; const {data,error}=await sb.from("progress").select("user_id,state,updated_at").in("user_id",ids); if(error) throw error; return data||[]; };
  PCB.profile=async id=>{ const {data}=await sb.from("profiles").select(PROFILE_COLS).eq("id",id).maybeSingle(); return data; };
})();
