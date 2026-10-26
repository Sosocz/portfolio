/* Room interaction uses the existing Three scene, renderer and animation ticker. */
(()=>{
 const mounted=new WeakMap();
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const urls={
  projects:{label:'Mes projets',href:'/projets/'},
  about:{label:'À propos',href:'#parcours'},
  contact:{label:'Me contacter',href:'mailto:sofiane.ghazal2@gmail.com'},
  github:{label:'GitHub',href:'https://github.com/Sosocz'},
  linkedin:{label:'LinkedIn',href:'https://www.linkedin.com/in/sofiane-ghazal-6b561639a'},
  htb:{label:'Hack The Box',href:'https://app.hackthebox.com/users/3594825?profile-top-tab=machines&ownership-period=1M&profile-bottom-tab=prolabs'}
 };
 function linkFor(name){
  if(/My_Work_Button/.test(name))return urls.projects;
  if(/About_Button/.test(name))return urls.about;
  if(/Contact_Button/.test(name))return urls.contact;
  if(/GitHub_/.test(name))return urls.github;
  if(/Twitter_/.test(name))return urls.linkedin;
  if(/YouTube_|Screen$/.test(name))return urls.htb;
  return null;
 }
 function go(link){
  if(link===urls.about){
   const text=document.querySelector('.impact-content-w.is-home');
   const target=text;
   if(target){const lenis=window.lenis||window.landoGL?.lenis?.instance||window.landoGL?.lenis;if(lenis?.scrollTo)lenis.scrollTo(target,{offset:-Math.min(120,innerHeight*.12),force:true});else target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  }else if(/^https:/.test(link.href))window.open(link.href,'_blank','noopener,noreferrer');
  else{const anchor=[...document.querySelectorAll('.room-controls a')].find(a=>a.getAttribute('href')===link.href);if(anchor)anchor.click();else window.location.assign(link.href);}
 }
 function mount(){
  const host=document.querySelector('.c.home-hero');
  if(!host||mounted.has(host))return host&&mounted.get(host);
  const layer=document.createElement('div');layer.className='room-interaction';layer.tabIndex=0;
  layer.setAttribute('role','group');layer.setAttribute('aria-label','Chambre 3D interactive. Glisser pour tourner, molette ou deux doigts pour zoomer. Flèches pour tourner, plus et moins pour zoomer, touche début pour réinitialiser.');
  const controls=document.createElement('div');controls.className='room-controls';
  for(const key of ['projects','about','contact']){const a=document.createElement('a');a.textContent=urls[key].label;a.href=urls[key].href;a.addEventListener('click',e=>{if(key==='about'){e.preventDefault();e.stopPropagation();go(urls.about);}});controls.append(a);}
  for(const [action,label,text] of [['out','Dézoomer','−'],['in','Zoomer','+'],['reset','Réinitialiser la vue','↺']]){const button=document.createElement('button');button.type='button';button.dataset.roomAction=action;button.textContent=text;button.setAttribute('aria-label',label);controls.append(button);}
  const hint=document.createElement('span');hint.className='room-hint';hint.textContent=matchMedia('(pointer: coarse)').matches?'Glisser pour tourner · Deux doigts pour zoomer':'Glisser pour tourner · Molette pour zoomer';
  const tooltip=document.createElement('span');tooltip.className='room-tooltip';tooltip.setAttribute('role','tooltip');tooltip.hidden=true;
  host.append(layer,controls,hint,tooltip);
  const about=document.querySelector('.impact-content-w.is-home');if(about&&!about.id)about.id='parcours';
  const ui={host,layer,controls,hint,tooltip};mounted.set(host,ui);return ui;
 }
 class RoomController{
  constructor(exp,types,ui){
   this.exp=exp;this.ui=ui;this.types=types;this.abort=new AbortController();this.pointers=new Map();
   this.yaw=0;this.pitch=0;this.zoom=1;this.targetYaw=0;this.targetPitch=0;this.targetZoom=1;
   this.candidates=[];this.ray=new types.Ray();this.hits=[];this.pointer=null;this.dirty=false;this.lastPick=-Infinity;
   exp.room.traverse(node=>{if(node.isMesh&&/Raycaster|Button|Chair_Top|Book_|Screen$/.test(node.name)){node.geometry.computeBoundingBox();this.candidates.push(node);}});
   ui.host.dataset.roomLive='true';
   const on=(target,event,callback,options={})=>target.addEventListener(event,callback,{...options,signal:this.abort.signal});
   on(ui.layer,'pointerdown',e=>this.down(e));on(ui.layer,'pointermove',e=>this.move(e));
   on(ui.layer,'pointerup',e=>this.up(e));on(ui.layer,'pointercancel',e=>this.up(e,true));
   on(ui.layer,'pointerleave',()=>{if(!this.pointers.size){this.pointer=null;this.setHover(null);}});
   on(ui.layer,'wheel',e=>{e.preventDefault();e.stopPropagation();const unit=e.deltaMode===1?16:e.deltaMode===2?innerHeight:1;this.zoomBy(Math.exp(-clamp(e.deltaY*unit,-160,160)*.0018));},{passive:false});
   on(ui.layer,'keydown',e=>{
    const keys={ArrowLeft:()=>this.targetYaw-=.16,ArrowRight:()=>this.targetYaw+=.16,ArrowUp:()=>this.targetPitch=clamp(this.targetPitch-.10,-.45,.45),ArrowDown:()=>this.targetPitch=clamp(this.targetPitch+.10,-.45,.45),'+':()=>this.zoomBy(1.15),'=':()=>this.zoomBy(1.15),'-':()=>this.zoomBy(1/1.15),Home:()=>this.reset()};
    if(keys[e.key]){e.preventDefault();keys[e.key]();this.dirty=true;}
   });
   on(ui.layer,'dblclick',()=>this.reset());
   on(ui.controls,'click',e=>{const action=e.target.closest('[data-room-action]')?.dataset.roomAction;if(action==='reset')this.reset();if(action==='in')this.zoomBy(1.15);if(action==='out')this.zoomBy(1/1.15);});
  }
  zoomBy(factor){this.targetZoom=clamp(this.targetZoom*factor,.72,1.8);this.dirty=true;}
  reset(){this.targetYaw=0;this.targetPitch=0;this.targetZoom=1;this.dirty=true;}
  down(e){
   if(e.button!==0||!this.exp.isRendering)return;
   this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false});
   this.ui.layer.setPointerCapture(e.pointerId);this.ui.layer.classList.add('is-dragging');
   this.pointer={x:e.clientX,y:e.clientY};this.dirty=true;this.pinched=this.pointers.size>1;
   if(this.pinched)this.pinchDistance=this.distance();
   if(e.pointerType==='mouse')e.preventDefault();
  }
  distance(){const [a,b]=this.pointers.values();return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;}
  move(e){
   this.pointer={x:e.clientX,y:e.clientY};this.dirty=true;
   const p=this.pointers.get(e.pointerId);if(!p)return;
   const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
   if(Math.hypot(p.x-p.startX,p.y-p.startY)>6)p.moved=true;
   if(this.pointers.size>1){const distance=this.distance();if(this.pinchDistance>0)this.zoomBy(distance/this.pinchDistance);this.pinchDistance=distance;this.pinched=true;}
   else{this.targetYaw+=dx*.006;this.targetPitch=clamp(this.targetPitch+dy*.004,-.45,.45);}
  }
  up(e,cancelled=false){
   const p=this.pointers.get(e.pointerId);if(!p)return;
   this.pointers.delete(e.pointerId);
   if(this.ui.layer.hasPointerCapture(e.pointerId))this.ui.layer.releasePointerCapture(e.pointerId);
   if(!cancelled&&!p.moved&&!this.pinched){const hit=this.pick(e.clientX,e.clientY);const link=hit&&linkFor(hit.name);if(link)go(link);}
   if(!this.pointers.size){this.ui.layer.classList.remove('is-dragging');this.pinched=false;this.dirty=true;}
  }
  pick(x,y){
   const exp=this.exp,b=exp.renderPlane.bounds;if(!b.width||!b.height)return null;
   exp.defaultScene.updateMatrixWorld(true);
   this.ray.origin.setFromMatrixPosition(exp.camera.matrixWorld);
   this.ray.direction.set((x-b.left)/b.width*2-1,-(y-b.top)/b.height*2+1,.5).unproject(exp.camera).sub(this.ray.origin).normalize();
   this.hits.length=0;const raycaster={ray:this.ray,near:0,far:Infinity,camera:exp.camera,params:{Mesh:{}}};
   for(const node of this.candidates)if(node.visible)node.raycast(raycaster,this.hits);
   let closest=null;for(const hit of this.hits)if(!closest||hit.distance<closest.distance)closest=hit;
   return closest?.object||null;
  }
  setHover(node){
   if(this.hover===node)return;
   this.restoreHover();this.hover=node;this.hoverAmount=0;
   this.hoverScale=node?.scale.clone();this.hoverPosition=node?.position?.clone();this.hoverQuaternion=node?.quaternion?.clone();
   const link=node&&linkFor(node.name);this.ui.layer.dataset.cursor=link?'link':node?'object':'rotate';
   this.ui.tooltip.textContent=link?.label||'';this.ui.tooltip.hidden=!link;
  }
  restoreHover(){if(this.hover&&this.hoverScale){this.hover.scale.copy(this.hoverScale);if(this.hoverPosition)this.hover.position.copy(this.hoverPosition);if(this.hoverQuaternion)this.hover.quaternion.copy(this.hoverQuaternion);}}
  beforeFrame(){this.restoreHover();}
  update(){
   const dt=clamp(this.exp.gl.time.delta/100||1/60,.001,.05),ease=1-Math.exp(-14*dt),reduced=this.exp.roomMotionPreference.matches;
   this.yaw+=(this.targetYaw-this.yaw)*ease;this.pitch+=(this.targetPitch-this.pitch)*ease;this.zoom+=(this.targetZoom-this.zoom)*ease;
   this.exp.room.rotation.y+=this.yaw;this.exp.room.rotation.x+=this.pitch;
   if(this.exp.roomBaseScale)this.exp.room.scale.setScalar(this.exp.roomBaseScale*this.zoom);
   const now=performance.now();
   if(this.pointer&&this.dirty&&!this.pointers.size&&now-this.lastPick>50){this.lastPick=now;this.dirty=false;this.setHover(this.pick(this.pointer.x,this.pointer.y));}
   if(this.hover&&!this.pointers.size&&!reduced){
    this.hoverAmount+=(1-this.hoverAmount)*ease;
    // Preserve this frame's authored animation before adding a small interaction offset.
    this.hoverScale.copy(this.hover.scale);this.hoverPosition?.copy(this.hover.position);this.hoverQuaternion?.copy(this.hover.quaternion);
    this.hover.scale.multiplyScalar(1+.045*this.hoverAmount);
    if(/Keyboard_/.test(this.hover.name)&&this.hover.position)this.hover.position.y-=.025*this.hoverAmount;
    else if(/Flower_|Book_/.test(this.hover.name)&&this.hover.rotateZ)this.hover.rotateZ(Math.sin(this.exp.gl.time.elapsed*4)*.035*this.hoverAmount);
    else if(/Kirby|Boba|Rabbit|Egg_/.test(this.hover.name)&&this.hover.position)this.hover.position.y+=.06*Math.sin(this.hoverAmount*Math.PI);
   }
  }
  destroy(){this.restoreHover();this.abort.abort();this.pointers.clear();this.candidates.length=0;this.hits.length=0;this.hover=null;this.pointer=null;delete this.ui.host.dataset.roomLive;this.ui.tooltip.hidden=true;}
 }
 const api={attach(exp,types){if(exp.roomDisposed)return;const ui=mount();if(!ui)return;exp.roomInput?.destroy();exp.roomInput=new RoomController(exp,types,ui);return exp.roomInput;}};
 window.SXSXRoomInteractions=api;
 document.addEventListener('sxsx-room-ready',event=>{
  if(event.detail?.scene)api.attach(event.detail.scene,event.detail.types);
  document.querySelectorAll('.room-hero-poster').forEach(image=>image.classList.add('is-live'));
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 new MutationObserver(()=>{if(document.querySelector('.c.home-hero'))mount();}).observe(document.documentElement,{childList:true,subtree:true});
})();
