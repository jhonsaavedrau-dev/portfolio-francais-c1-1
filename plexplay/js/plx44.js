/* PLEX PLAY 1.22.1 — Portadas de los cursos con fotos reales
   - Las portadas de los cursos (lista de cursos, inicio y encabezado del curso) son ahora fotos
     reales: img/c-*.webp. Son de Wikimedia Commons, con licencias libres.
   - La cabecera de cada lección sigue con su ilustración de siempre, que ahora vive en img/ilus/.
   - Debajo de la lista de cursos hay un enlace a los créditos de las fotos (autor y licencia),
     como piden las licencias.
   - Se genera con plexplay/fotos-unidades/armar_plx44.py. */
(function(){
  "use strict";
  /* cabecera de la lección: la ilustración del curso, no la foto */
  var ilustracion = function(h){
    h.dataset.plx44 = "1";
    var bg = h.getAttribute("style") || "";
    if (/img\/c-[a-z]+\.webp/.test(bg)) h.style.backgroundImage = "url(" + bg.match(/img\/c-[a-z]+\.webp/)[0].replace("img/", "img/ilus/") + ")";
  };
  /* créditos de las fotos al pie de la lista de cursos */
  var creditos = function(){
    document.querySelectorAll(".lxs-i").forEach(function(b){
      var lista = b.parentElement;
      if (!lista || lista.querySelector(".plx44-cr")) return;
      lista.insertAdjacentHTML("beforeend", '<a class="plx44-cr" href="creditos-fotos.html" target="_blank" rel="noopener">Fotos de portada: Wikimedia Commons · ver créditos</a>');
    });
  };
  var revisa = function(){ document.querySelectorAll(".m-hero:not([data-plx44])").forEach(ilustracion); creditos(); };
  new MutationObserver(revisa).observe(document.body, { childList: true, subtree: true });
  revisa();

  var st = document.createElement("style"); st.id = "plx44";
  st.textContent = `
  .plx44-cr{display:block;text-align:center;margin:10px 0 2px;font:500 11px/1.4 Inter,system-ui,sans-serif;color:var(--stone,#64748b)!important;text-decoration:none}
  .plx44-cr:hover{text-decoration:underline}
  `;
  document.head.appendChild(st);
})();
