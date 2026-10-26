(()=>{
 const clamp=n=>Math.max(0,Math.min(1,n));
 function frame(progress){
  const host=document.querySelector('[data-room-slot]');if(!host)return;
  const p=clamp(progress||0),scale=1-p*.28;
  host.style.transform=`translate(-50%,-50%) scale(${scale})`;
  host.style.opacity=String(1-p);
  host.style.visibility=p>=.98?'hidden':'visible';
  host.style.pointerEvents=p>.8?'none':'auto';
 }
 window.SXSXRoomHost={frame};
 let roomIsVisible=true;const observedRooms=new WeakSet();
 const syncRoomVisibility=()=>{const iframe=document.querySelector('.sxsx-interactive-room');iframe?.contentWindow?.postMessage({type:'sxsx-room-visibility',visible:roomIsVisible&&!document.hidden},location.origin)};
 const observeRoom=()=>{const iframe=document.querySelector('.sxsx-interactive-room');if(!iframe||observedRooms.has(iframe))return;observedRooms.add(iframe);iframe.addEventListener?.('load',syncRoomVisibility);if('IntersectionObserver' in window)new IntersectionObserver(entries=>{roomIsVisible=entries[0].isIntersecting;syncRoomVisibility()},{threshold:0}).observe(iframe)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeRoom,{once:true});else observeRoom();
 document.addEventListener?.('visibilitychange',syncRoomVisibility);
 window.addEventListener('page-transition-end',observeRoom);

 window.addEventListener('message',event=>{
  const iframe=document.querySelector('.sxsx-interactive-room');
  if(event.origin!==location.origin||event.source!==iframe?.contentWindow)return;
  if(event.data?.type==='sxsx-room-ready'){syncRoomVisibility();return;}
  if(event.data?.type==='sxsx-room-scroll'){
   if(!Number.isFinite(event.data.deltaY))return;
   const delta=Math.max(-innerHeight,Math.min(innerHeight,event.data.deltaY));
   const lenis=window.lenis||window.landoGL?.lenis?.instance;
   if(lenis?.scrollTo){const current=Number.isFinite(lenis.targetScroll)?lenis.targetScroll:window.scrollY;lenis.scrollTo(current+delta,{duration:.45,force:true});}
   else window.scrollBy({top:delta,behavior:'auto'});
   return;
  }
  if(event.data?.type!=='sxsx-room-navigate')return;
  const action=event.data.action;
  if(action==='about'){
   const target=document.querySelector('.impact-content-w.is-home');if(!target)return;
   const lenis=window.lenis||window.landoGL?.lenis?.instance;
   if(lenis?.scrollTo)lenis.scrollTo(target,{offset:-80,force:true});else target.scrollIntoView({behavior:'smooth'});
  }else if(action==='work'){
   const link=document.querySelector('a[href="/projets/"]');if(link)link.click();else location.assign('/projets/');
  }else if(action==='contact'){
   location.assign('mailto:sofiane.ghazal2@gmail.com');
  }
 });
})();
