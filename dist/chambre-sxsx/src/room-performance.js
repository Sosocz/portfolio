// Preserve every animated transform; fixed nodes only update when a tween changes them.
export function freezeRoomTransforms(scene,root){
 scene.updateMatrix();scene.matrixAutoUpdate=false;
 root.traverse(node=>{node.updateMatrix();node.matrixAutoUpdate=/Computer_Fan_|Chair_Top|Fish_Fourth|Hour_Hand|Minute_Hand/.test(node.name);});
}
// Identical texture/palette combinations share the exact same shader material.
export function roomMaterialFor(cache,texture,palette,create){
 let variants=cache.get(texture);if(!variants){variants=new Map();cache.set(texture,variants);}
 if(!variants.has(palette))variants.set(palette,create());
 return variants.get(palette);
}
export function installRoomResize(renderer,camera){
 let pending=0,width=innerWidth,height=innerHeight;
 const resize=()=>{if(pending)return;pending=requestAnimationFrame(()=>{pending=0;const w=innerWidth,h=innerHeight;if(w===width&&h===height)return;width=w;height=h;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);});};
 addEventListener('resize',resize,{passive:true});
 return ()=>{removeEventListener('resize',resize);if(pending)cancelAnimationFrame(pending);};
}
