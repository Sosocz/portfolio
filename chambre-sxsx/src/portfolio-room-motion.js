import * as THREE from 'three';
import gsap from 'gsap';

// Reusable equivalents of the original site's idle and pointer animations.
export function createRoomMotion(root,camera,canvas,{onActivate=()=>{},isBlocked=()=>false}={}){
  const fans=[],interactive=[],base=new Map();let chair,fish,hour,minute;
  root.traverse(node=>{
    if(!node.isMesh&&!node.name.includes('Hover'))return;
    if(node.parent?.name.includes('Hover'))return;
    base.set(node,{rotation:node.rotation.clone(),position:node.position.clone(),scale:node.scale.clone()});
    if(node.name.includes('Computer_Fan_'))fans.push(node);
    if(node.name.includes('Chair_Top'))chair=node;
    if(node.name.includes('Fish_Fourth'))fish=node;
    if(node.name.includes('Hour_Hand'))hour=node;
    if(node.name.includes('Minute_Hand'))minute=node;
    if(node.name.includes('Hover')&&!node.name.includes('Key'))interactive.push(node);
  });
  const pointer=new THREE.Vector2(5,5),ray=new THREE.Raycaster();let hovered,down,pointerInside=false,pointerDirty=true,lastPick=-Infinity;
  function pick(event){
    if(event){pointerInside=true;const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);}
    if(!pointerInside||isBlocked())return;
    root.updateMatrixWorld(true);camera.updateMatrixWorld(true);ray.setFromCamera(pointer,camera);
    let target=ray.intersectObjects(interactive,true)[0]?.object;
    while(target&&!interactive.includes(target))target=target.parent;
    return target;
  }
  canvas.addEventListener('pointerdown',event=>{down={x:event.clientX,y:event.clientY,id:event.pointerId,moved:false};});
  canvas.addEventListener('pointercancel',()=>{down=null;});
  canvas.addEventListener('pointerup',event=>{
    if(down&&!down.moved&&down.id===event.pointerId&&Math.hypot(event.clientX-down.x,event.clientY-down.y)<7){const target=pick(event);if(target)onActivate(target);}
    down=null;
  });
  canvas.addEventListener('pointermove',event=>{pointerInside=true;pointerDirty=true;if(down&&Math.hypot(event.clientX-down.x,event.clientY-down.y)>=7)down.moved=true;const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);});
  canvas.addEventListener('pointerleave',()=>{pointerInside=false;pointerDirty=true;pointer.set(5,5);});
  function hover(node,on){
    if(!node)return;const original=base.get(node),factor=on?(node===fish?1.2:1.4):1;
    gsap.to(node.scale,{x:original.scale.x*factor,y:original.scale.y*factor,z:original.scale.z*factor,duration:on?.5:.3,ease:'back.out(2)',overwrite:true});
    if(/About_Button|Contact_Button|My_Work_Button|GitHub|YouTube|Twitter/.test(node.name))gsap.to(node.rotation,{x:original.rotation.x+(on?(node.name.includes('About_Button')?-1:1)*Math.PI/10:0),duration:.5,overwrite:true});
    if(/Boba|sxsx_/.test(node.name))gsap.to(node.position,{y:original.position.y+(on?.2:0),duration:.5,overwrite:true});
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function replay(){
    if(reduced)return;
    const groups=['Hanging_Plank','Button','Frame_','Boba','GitHub','YouTube','Twitter','Flower_','Box_','Lamp_','Slipper_','Egg_','Fish_Fourth'];
    for(const[node,original]of base){
      const i=groups.findIndex(pattern=>node.name.includes(pattern));if(i<0)continue;
      gsap.killTweensOf(node.scale);node.scale.set(0,0,0);
      gsap.to(node.scale,{...original.scale,duration:.8,delay:i*.12,ease:'back.out(1.8)',overwrite:true});
    }
  }
  replay();
  return {replay,update(time){
    if(!reduced){
      for(const fan of fans){const axis=/Fan_[24]_/.test(fan.name)?'x':'y';fan.rotation[axis]=base.get(fan).rotation[axis]-time*2.4;}
      if(chair){const s=Math.sin(time*.5);chair.rotation.y=base.get(chair).rotation.y+Math.PI/8*s*(1-Math.abs(s)*.3);}
      if(fish){const s=Math.sin(time*1.5);fish.position.y=base.get(fish).position.y+.12*s*(1-Math.abs(s)*.1);}
    }
    const now=new Date();if(minute)minute.rotation.x=-(now.getMinutes()+now.getSeconds()/60)*Math.PI*2/60;if(hour)hour.rotation.x=-(now.getHours()%12+now.getMinutes()/60)*Math.PI*2/12;
    const shouldPick=pointerDirty||time-lastPick>=.08;
    if(shouldPick){pointerDirty=false;lastPick=time;}
    const next=shouldPick?pick():hovered;
    if(next!==hovered){hover(hovered,false);hovered=next;hover(hovered,true);canvas.style.cursor=hovered?'pointer':'grab';}
  }};
}
