/* PLEX PLAY — service worker (v1.11.0) */
const CORE="pc-core-1.14.1", AUDIO="pc-audio-1";
const PRECACHE=["./", "index.html", "fonts/figtree-latin.woff2", "fonts/figtree-latin-ext.woff2", "fonts/bricolage-latin.woff2", "fonts/bricolage-latin-ext.woff2", "cursos.js", "explica.js", "audio2.js", "extra.js", "carnet.html", "config.js", "backend.js", "vendor/supabase.js", "manifest.webmanifest", "privacy.html", "icons/mz-icon-192.png", "icons/mz-icon-512.png", "icons/mz-maskable-512.png", "icons/mz-apple-touch-icon.png", "icons/mz-favicon-32.png", "img/atras.webp", "img/b-bronce.webp", "img/b-diamante.webp", "img/b-legendario.webp", "img/b-oro.webp", "img/b-plata.webp", "img/bg-biblioteca.webp", "img/bg-cafe.webp", "img/bg-montana.webp", "img/bg-noche.webp", "img/bg-paris.webp", "img/bg-playa.webp", "img/bg-universidad.webp", "img/bloqueado.webp", "img/calendario.webp", "img/card-dia.webp", "img/card-noche.webp", "img/completado.webp", "img/conversacion.webp", "img/crown.webp", "img/d-bench.webp", "img/d-bridge.webp", "img/d-cloud.webp", "img/d-flowers.webp", "img/d-lamp.webp", "img/d-leaves.webp", "img/d-sign.webp", "img/d-sparkle.webp", "img/d-trees.webp", "img/dificil.webp", "img/encurso.webp", "img/escritura.webp", "img/escucha.webp", "img/escudo.webp", "img/estrella.webp", "img/facil.webp", "img/favorito.webp", "img/flame.webp", "img/gear.webp", "img/gem.webp", "img/gramatica.webp", "img/guardar.webp", "img/hito.webp", "img/home.webp", "img/lecciones.webp", "img/lectura.webp", "img/logro.webp", "img/m-actualidad.webp", "img/m-cafe.webp", "img/m-cultura.webp", "img/m-francia.webp", "img/m-inicio.webp", "img/m-trabajo.webp", "img/m-viajes.webp", "img/manzana-icon.webp", "img/mascota.webp", "img/media.webp", "img/music.webp", "img/mz-curioso.webp", "img/mz-duerme.webp", "img/mz-feliz.webp", "img/mz-gafas.webp", "img/mz-hero.webp", "img/mz-hola.webp", "img/mz-juega.webp", "img/mz-lado.webp", "img/mz-vamos.webp", "img/pausa.webp", "img/perfil.webp", "img/regalo.webp", "img/repetir.webp", "img/reto.webp", "img/retos.webp", "img/siguiente.webp", "img/stats.webp", "img/c-paris.webp", "img/c-cafe.webp", "img/c-fonetica.webp", "img/c-calle.webp", "img/c-playa.webp", "img/c-montana.webp", "img/c-bandera.webp", "img/c-libros.webp", "img/c-noche.webp", "img/c-teatro.webp", "img/th-acentos.webp", "img/th-fonetica.webp", "img/th-fundamentos.webp", "img/th-literatura.webp", "img/tienda.webp", "img/vida-off.webp", "img/vida.webp"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CORE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CORE&&k!==AUDIO).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url);
  if(u.origin!==location.origin){   // polices Google : réseau puis cache
    if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) e.respondWith(caches.open(CORE).then(c=>fetch(r).then(res=>{ c.put(r,res.clone()); return res; }).catch(()=>c.match(r))));
    return;
  }
  if(u.pathname.includes("/audio/")){   // audio : cache à la demande (les fichiers ne changent pas)
    if(r.headers.has("range")) return;
    e.respondWith(caches.open(AUDIO).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res.ok) c.put(r,res.clone()); return res; }))));
    return;
  }
  if(r.mode==="navigate"){ e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(CORE).then(c=>c.put(r,cp)); return res; }).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match(u.pathname.endsWith("carnet.html")?"carnet.html":"index.html")))); return; }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r)));
});
