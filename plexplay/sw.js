/* PLEX PLAY se mudó a https://jhonsaavedrau-dev.github.io/plexplay/app/.
   Este service worker reemplaza al viejo: se da de baja y lleva las pestañas abiertas a la dirección nueva.
   No borra cachés: el origen es el mismo y la app nueva usa los mismos nombres (ella limpia las versiones viejas). */
self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(e){
  e.waitUntil((async function(){
    await self.registration.unregister();
    var cs = await self.clients.matchAll({ type: "window" });
    cs.forEach(function(c){ var u = new URL(c.url); c.navigate("https://jhonsaavedrau-dev.github.io/plexplay/app/" + u.search + u.hash); });
  })());
});
