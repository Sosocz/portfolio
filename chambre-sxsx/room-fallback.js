/* Progressive enhancement: the same room remains visible without a GPU. */
(()=>{
 const fallback=()=>document.getElementById('room-fallback');
 const notify=(type,data={})=>{if(parent!==window)parent.postMessage({type,...data},location.origin)};
 window.SXSXRoomVisible=true;
 addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='sxsx-room-visibility')return;window.SXSXRoomVisible=e.data.visible===true;document.dispatchEvent(new Event('room-visibility'))});
 document.addEventListener('room-ready',()=>{fallback()?.setAttribute('hidden','');notify('sxsx-room-ready')});
 document.addEventListener('room-error',()=>{fallback()?.removeAttribute('hidden');const s=document.querySelector('[data-fallback-status]');if(s)s.textContent='Aperçu de la chambre · les liens restent accessibles.'});
 document.addEventListener('webglcontextlost',()=>document.dispatchEvent(new Event('room-error')),true);
 document.addEventListener('click',e=>{const link=e.target.closest('[data-room-action]');if(!link||parent===window)return;e.preventDefault();notify('sxsx-room-navigate',{action:link.dataset.roomAction})});
})();
