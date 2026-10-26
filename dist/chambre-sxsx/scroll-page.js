/* Keep page scrolling available over the embedded room. */
(()=>{
 if(window.parent===window)return;
 const send=deltaY=>{if(Number.isFinite(deltaY)&&deltaY)window.parent.postMessage({type:'sxsx-room-scroll',deltaY},location.origin)};
 window.addEventListener('wheel',event=>{
  if(event.ctrlKey)return;
  event.preventDefault();
  send(event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1));
 },{capture:true,passive:false});
 window.SXSXRoomPageScroll={bind(controls){
  let gesture=null;
  window.addEventListener('pointerdown',event=>{
   if(event.pointerType==='touch'&&!gesture)gesture={id:event.pointerId,x:event.clientX,y:event.clientY,lastY:event.clientY,mode:null,enabled:controls.enabled};
  },true);
  window.addEventListener('pointermove',event=>{
   if(!gesture||event.pointerId!==gesture.id)return;
   const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
   if(!gesture.mode&&Math.hypot(dx,dy)>8)gesture.mode=Math.abs(dy)>Math.abs(dx)?'scroll':'rotate';
   if(gesture.mode==='scroll'){controls.enabled=false;event.preventDefault();send(gesture.lastY-event.clientY);}
   gesture.lastY=event.clientY;
  },{capture:true,passive:false});
  const end=event=>{if(gesture&&event.pointerId===gesture.id){controls.enabled=gesture.enabled;gesture=null}};
  window.addEventListener('pointerup',end,true);window.addEventListener('pointercancel',end,true);
 }};
})();
