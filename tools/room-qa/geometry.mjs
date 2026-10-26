import fs from 'node:fs';import assert from 'node:assert/strict';
const {GLTFLoader,Vector3,PerspectiveCamera,Box3,createRoomMotion,Raycaster}=await import(process.argv[2]);
globalThis.self={URL};globalThis.ProgressEvent=class{constructor(type,args){Object.assign(this,{type},args)}};globalThis.matchMedia=()=>({matches:true});
const dir=process.cwd()+'/dist/chambre-sxsx/';
const json=JSON.parse(fs.readFileSync(dir+'chambre-sxsx.gltf'));json.buffers[0].uri='data:application/octet-stream;base64,'+fs.readFileSync(dir+'chambre-sxsx.bin').toString('base64');
const loader=new GLTFLoader();loader.register(()=>({name:'QA_GEOMETRY_ONLY',loadTexture:()=>Promise.resolve(null)}));const {scene:root}=await loader.parseAsync(JSON.stringify(json),'');
const camera=new PerspectiveCamera(40,1,.1,150),center=new Box3().setFromObject(root).getCenter(new Vector3());camera.position.copy(center).add(new Vector3(14,10,17).multiplyScalar(.86));camera.lookAt(center);camera.updateMatrixWorld(true);root.updateMatrixWorld(true);
const events={};const canvas={getBoundingClientRect:()=>({left:0,top:0,width:800,height:800}),addEventListener:(name,fn)=>events[name]=fn,style:{}};const activations=[];
const motion=createRoomMotion(root,camera,canvas,{onActivate:node=>activations.push(node.name)});
for(const name of ['GitHub','Twitter','YouTube','My_Work_Button','About_Button','Contact_Button']){
 const target=root.getObjectByName(json.nodes.find(n=>n.name.includes(name)&&n.mesh!==undefined).name);const meshes=[];target.traverse(n=>{if(n.isMesh)meshes.push(n)});let event;for(const mesh of meshes){if(event)break;const geo=mesh.geometry.attributes.position;
 for(let index=0;index<geo.count&&!event;index+=Math.max(1,Math.floor(geo.count/100))){
  // Interpolate toward triangle interiors rather than testing a logo's empty center.
  const p=new Vector3(geo.getX(index),geo.getY(index),geo.getZ(index)).applyMatrix4(mesh.matrixWorld).project(camera);if(Math.abs(p.x)>1||Math.abs(p.y)>1)continue;const candidate={pointerId:1,clientX:(p.x+1)*400,clientY:(1-p.y)*400};
  events.pointerdown(candidate);events.pointerup(candidate);if(activations.at(-1)===target.name)event=candidate;
 }
 }
 assert(event,'Card must be hit-testable from the default camera: '+name);
 const count=activations.length;events.pointerdown(event);events.pointermove({...event,clientX:event.clientX+80});events.pointermove(event);events.pointerup(event);assert.equal(activations.length,count,'A drag away and back must not open '+name);
 console.log('PASS clickable and drag-safe:',name);
}
console.log('PASS: original GLTF parses; all six 3D destinations can be activated with actual geometry and camera matrices.');
const {OrbitControls}=await import(process.argv[2]);const orbit=new OrbitControls(camera,null);orbit.enablePan=false;orbit.enableZoom=false;const fixedDistance=Math.hypot(14,10,17)*.86;orbit.minDistance=orbit.maxDistance=fixedDistance;orbit.minPolarAngle=.85;orbit.maxPolarAngle=1.35;orbit.minAzimuthAngle=.20;orbit.maxAzimuthAngle=1.15;orbit.target.copy(center);
for(const offset of [[-14,10,-17],[14,10,-17],[-14,-10,17],[100,100,100],[.1,.1,.1]]){camera.position.copy(center).add(new Vector3(...offset));orbit.update();const p=camera.position.clone().sub(center);assert(p.x>0&&p.z>0,'Back of room must be unreachable');assert(Math.abs(p.length()-fixedDistance)<1e-6);assert(orbit.getAzimuthalAngle()>=.2-1e-6&&orbit.getAzimuthalAngle()<=1.15+1e-6);assert(orbit.getPolarAngle()>=.85-1e-6&&orbit.getPolarAngle()<=1.35+1e-6)}
console.log('PASS: front-only rotation and a fixed closer camera distance; zoom disabled.');
