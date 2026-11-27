(()=>{
 const clamp=n=>Math.max(0,Math.min(1,n));
 let currentHost=null,lastProgress=null,roomIsVisible=true,roomObserver=null,observedIframe=null,lastMessageFrame=null,lastMessageVisible=null;
 function syncRoomVisibility(force=false){
  const iframe=document.querySelector('.sxsx-interactive-room');
  const visible=roomIsVisible&&!document.hidden&&(lastProgress===null||lastProgress<.98);
  if(!iframe?.contentWindow)return;
  if(!force&&iframe===lastMessageFrame&&visible===lastMessageVisible)return;
  lastMessageFrame=iframe;lastMessageVisible=visible;
  iframe.contentWindow.postMessage({type:'sxsx-room-visibility',visible},location.origin);
 }
 function frame(progress){
  const host=currentHost?.isConnected?currentHost:document.querySelector('[data-room-slot]');if(!host)return;
  const p=clamp(progress||0);if(host===currentHost&&p===lastProgress)return;
  const changed=host!==currentHost||(lastProgress===null||lastProgress<.98)!==(p<.98);
  currentHost=host;lastProgress=p;
  host.style.transform=`translate(-50%,-50%) scale(${1-p*.28})`;
  host.style.opacity=String(1-p);host.style.visibility=p>=.98?'hidden':'visible';host.style.pointerEvents=p>.8?'none':'auto';
  if(changed)syncRoomVisibility();
 }
 window.SXSXRoomHost={frame};
 function observeRoom(){
  const iframe=document.querySelector('.sxsx-interactive-room');if(iframe===observedIframe)return;
  roomObserver?.disconnect();roomObserver=null;observedIframe=iframe;roomIsVisible=true;
  if(document.querySelector('[data-room-slot]')!==currentHost){currentHost=null;lastProgress=null;}
  if(!iframe)return;
  iframe.addEventListener('load',()=>{if(iframe===observedIframe)syncRoomVisibility(true)});
  if('IntersectionObserver' in window){roomObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.target===observedIframe){roomIsVisible=entry.isIntersecting;syncRoomVisibility();}},{threshold:0});roomObserver.observe(iframe);}
  syncRoomVisibility(true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeRoom,{once:true});else observeRoom();
 document.addEventListener('visibilitychange',()=>syncRoomVisibility());
 window.addEventListener('page-transition-end',observeRoom);
 window.addEventListener('message',event=>{
  const iframe=document.querySelector('.sxsx-interactive-room');
  if(event.origin!==location.origin||event.source!==iframe?.contentWindow)return;
  if(event.data?.type==='sxsx-room-ready'){syncRoomVisibility(true);return;}
  if(event.data?.type==='sxsx-room-scroll'){
   if(!Number.isFinite(event.data.deltaY))return;
   const delta=Math.max(-innerHeight,Math.min(innerHeight,event.data.deltaY)),lenis=window.lenis||window.landoGL?.lenis?.instance;
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
   const link=document.querySelector('a[href="/portfolio/projets/"]');if(link)link.click();else location.assign('/portfolio/projets/');
  }else if(action==='contact')location.assign('mailto:sofiane.ghazal2@gmail.com');
 });
})();
