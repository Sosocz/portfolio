import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createDesktopWallpaper} from './desktop-wallpaper.js';
import {createRoomMotion} from './portfolio-room-motion.js';
import {createRoomInteractions} from './portfolio-room-interactions.js';
import {createRoomSteam} from './portfolio-room-steam.js';
const base=p=>new URL(p,document.baseURI).href;
const params=new URLSearchParams(location.search);
document.querySelector('#theme')?.remove();
if(params.has('embed'))document.body.classList.add('embed');
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);document.body.append(renderer.domElement);
const scene=new THREE.Scene();scene.background=null;
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,150);
const roomViewOffset=new THREE.Vector3(14,10,17).multiplyScalar(1.02);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.enableZoom=false;controls.minDistance=controls.maxDistance=roomViewOffset.length();controls.minPolarAngle=.85;controls.maxPolarAngle=1.35;controls.minAzimuthAngle=.20;controls.maxAzimuthAngle=1.15;
window.SXSXRoomPageScroll?.bind(controls);
const ambient=new THREE.HemisphereLight(0xdde9e8,0x967557,.9);scene.add(ambient);
const wallpaper=createDesktopWallpaper();let screen,motion,steam;
const ready=new GLTFLoader().loadAsync(base('chambre-sxsx.gltf?v=151')).then(async(asset)=>{
  const root=asset.scene;
  root.traverse(node=>{
    if(!node.isMesh)return;
    if(node.name.includes('Screen')){screen=new THREE.MeshBasicMaterial({map:wallpaper.texture,toneMapped:false});node.material=screen;}
    const label=node.userData.roomTextureSet;
    if(label && node.material.map){
      const day=node.material.map;
        node.material=new THREE.ShaderMaterial({uniforms:{day:{value:day},uRugPalette:{value:node.name==='Third'?1:0}},
          vertexShader:"varying vec2 vUv;varying vec3 vRoomPosition;void main(){vUv=uv;vRoomPosition=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
          fragmentShader:"varying vec2 vUv;varying vec3 vRoomPosition;uniform sampler2D day;uniform float uRugPalette;\nvoid main(){\n vec3 color=pow(texture2D(day,vUv).rgb,vec3(1./2.2));\n bool rug=uRugPalette>.5&&vRoomPosition.x>.45&&vRoomPosition.x<2.45&&vRoomPosition.z> -1.45&&vRoomPosition.z<1.55&&vRoomPosition.y>.50&&vRoomPosition.y<.70;\n if(rug){\n  vec3 mint=vec3(56.,228.,178.)/255.;\n  vec3 rose=vec3(242.,166.,194.)/255.;\n  vec3 tint=vRoomPosition.y>.60425?rose:mint;\n  float shade=clamp(dot(color,vec3(.2126,.7152,.0722))/.80,.20,1.12);\n  color=clamp(tint*shade,0.,1.);\n }\n gl_FragColor=vec4(color,1.);\n}",
        });
    }
  });
  scene.add(root);
  const bounds=new THREE.Box3().setFromObject(root),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
  if(size.x>25||size.z>25||size.y>15)throw new Error('Dimensions du modèle inattendues');
  controls.target.copy(center);camera.position.copy(center).add(roomViewOffset);controls.update();
  const interactions=await createRoomInteractions(controls);
  motion=createRoomMotion(root,camera,renderer.domElement,{onActivate:interactions.activate,isBlocked:interactions.isBlocked});
  steam=await createRoomSteam(root).catch(error=>{console.warn(error);return null;});
  document.querySelector('#replay')?.addEventListener('click',()=>motion.replay());
  document.querySelector('#reset')?.addEventListener('click',()=>{controls.target.copy(center);camera.position.copy(center).add(roomViewOffset);controls.update();});
  document.querySelector('#status').textContent='Chambre SXSX · jour uniquement · fond transparent';
  document.dispatchEvent(new CustomEvent('room-ready'));
  return root;
}).catch(error=>{document.querySelector('#status').textContent=error.message;console.error(error);});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const clock=new THREE.Clock();renderer.setAnimationLoop(()=>{const time=clock.getElapsedTime();wallpaper.update(time);controls.update();motion?.update(time);steam?.update(time);renderer.render(scene,camera);});
