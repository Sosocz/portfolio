const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(__dirname+'/../dist/assets/room-hero.js','utf8');
const main=fs.readFileSync(__dirname+'/../dist/portfolio-runtime.js','utf8');
class Vector{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}clone(){return new Vector(this.x,this.y,this.z)}copy(v){Object.assign(this,{x:v.x,y:v.y,z:v.z});return this}multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this}set(x,y,z){Object.assign(this,{x,y,z});return this}setScalar(s){return this.set(s,s,s)}setFromMatrixPosition(m){return this.copy(m.position)}unproject(){return this}sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this}normalize(){return this.multiplyScalar(1/Math.hypot(this.x,this.y,this.z))}}
class Ray{constructor(){this.origin=new Vector;this.direction=new Vector}}
class Element{constructor(){this.events=new Map;this.dataset={};this.captures=new Set;this.classList={add(){},remove(){}};}addEventListener(name,cb,options={}){this.events.set(name,cb);options.signal?.addEventListener('abort',()=>this.events.delete(name));}setPointerCapture(id){this.captures.add(id)}hasPointerCapture(id){return this.captures.has(id)}releasePointerCapture(id){this.captures.delete(id)}}
const navigations=[];const context={WeakMap,Math,Map,AbortController,performance:{now:()=>1000},innerHeight:900,window:{location:{assign:href=>navigations.push(href)},open:href=>navigations.push(href)},document:{querySelector:()=>null}};
const prefix=source.slice(source.indexOf(' const mounted='),source.indexOf(' const api='));
vm.runInNewContext(prefix+';globalThis.Controller=RoomController;globalThis.link=linkFor;globalThis.go=go;globalThis.links=urls;',context);
const nodes=['My_Work_Button_Third_Raycaster_Pointer_Hover','Chair_Top_Fourth','Screen','First'].map((name,i)=>({name,isMesh:true,visible:true,geometry:{computeBoundingBox(){}},scale:new Vector(1,1,1),raycast(r,hits){hits.push({distance:5-i,object:this})}}));
const ui={host:new Element,layer:new Element,controls:new Element,tooltip:{hidden:true,textContent:''}};
const exp={isRendering:true,room:{traverse:f=>nodes.forEach(f),rotation:{x:0,y:0},scale:new Vector},roomMotionPreference:{matches:false},roomBaseScale:2,gl:{time:{delta:1.6,elapsed:1}},renderPlane:{bounds:{left:0,top:0,width:1000,height:800}},defaultScene:{updateMatrixWorld(){}},camera:{matrixWorld:{position:new Vector}}};
const c=new context.Controller(exp,{Ray,Vector3:Vector},ui);
assert.equal(c.candidates.length,3);assert.equal(c.pick(500,400).name,'Screen');assert.equal(context.link(nodes[0].name).href,'/projets/');assert(context.link('Twitter_Fourth').href.includes('linkedin.com'));
c.zoomBy(100);assert.equal(c.targetZoom,1.8);c.zoomBy(.001);assert.equal(c.targetZoom,.72);c.reset();assert.equal(c.targetZoom,1);
const event=(id,x,y)=>({pointerId:id,clientX:x,clientY:y,button:0,pointerType:'mouse',preventDefault(){}});
c.down(event(1,500,400));c.move(event(1,550,800));assert.equal(c.targetYaw,.3);assert.equal(c.targetPitch,.45);c.up(event(1,550,800));assert.equal(navigations.length,0,'drag must not follow a link');
c.reset();c.down(event(1,400,400));c.down(event(2,600,400));c.move(event(2,700,400));assert.equal(c.targetZoom,1.5);c.up(event(2,700,400));c.up(event(1,400,400));assert.equal(navigations.length,0,'pinch must not follow a link');
c.down(event(1,500,400));c.up(event(1,500,400));assert(navigations[0].includes('hackthebox.com'));
c.setHover(nodes[1]);c.pointer=null;c.update();assert(nodes[1].scale.x>1&&nodes[1].scale.x<=1.045);c.beforeFrame();assert.equal(nodes[1].scale.x,1);c.update();c.destroy();assert.equal(nodes[1].scale.x,1);assert.equal(ui.layer.events.size,0);assert.equal(ui.controls.events.size,0);
const methods=main.slice(main.indexOf('releaseRoomAsset(root){'),main.indexOf('setIsRendering(){',main.indexOf('releaseRoomAsset(root){')));
let geometryDisposals=0,materialDisposals=0,textureDisposals=0,targetDisposals=0,listenerRemovals=0;
const geometry={dispose(){geometryDisposals++}},texture={isTexture:true,dispose(){textureDisposals++}},material={map:texture,dispose(){materialDisposals++}};
const dispose=vm.runInNewContext('(class {'+methods+'}).prototype',{document:{removeEventListener(){listenerRemovals++}}});
const state={room:{traverse:f=>{f({isMesh:true,geometry,material});f({isMesh:true,geometry,material})}},roomInput:{destroy(){}},defaultScene:{remove(){}},defaultRenderTarget:{dispose(){targetDisposals++}},roomDiscoHandler:()=>{}};state.releaseRoomAsset=dispose.releaseRoomAsset;
dispose.disposeRoom.call(state);dispose.disposeRoom.call(state);assert.deepEqual([geometryDisposals,materialDisposals,textureDisposals,targetDisposals,listenerRemovals],[1,1,1,1,1]);
const rendererMethod=main.match(/update\(\)\{const room=this\.gl\.world\.scenes\.find[\s\S]*?this\.instance\.render\(this\.gl\.scene,this\.gl\.camera\.instance\)\}/)[0];
const renderer=vm.runInNewContext('(class {'+rendererMethod+'}).prototype');const log=[];let target=null;
const scene=id=>({isRendering:true,defaultRenderTarget:id,renderPipeline(){assert.equal(target,id);assert.equal(log.at(-1),'clear:'+id);log.push('draw:'+id)}});
const active=scene('room');active.room={};active.roomPixelRatio=()=>2;const offscreen=scene('off');offscreen.isRendering=false;
const r={gl:{world:{scenes:[active,offscreen,scene('background')]},sizes:{pixelRatio:1.25},scene:{},camera:{}},instance:{getPixelRatio:()=>2,setRenderTarget:v=>{target=v;log.push('target:'+v)},clear:()=>log.push('clear:'+target),render:()=>log.push('screen')}};
renderer.update.call(r);assert(!log.some(s=>s.includes('off')));assert.deepEqual(log.slice(-3),['target:null','clear:null','screen']);assert(!log.includes('clear:room',log.indexOf('draw:room')),'rendered room texture must never be cleared after drawing');
assert(main.includes('this.mouse.update(),this.world.update(),this.renderer.update()'));
console.log('PASS: native ray picking, actual profile links, rotation, zoom limits, pinch, drag/click separation, hover restoration, input cleanup and idempotent GPU disposal.');
console.log('PASS: scene buffers cleared before drawing, hidden scenes skipped, current input reaches the same rendered frame.');

let aboutScroll;const aboutTarget={};context.document.querySelector=()=>aboutTarget;context.window.lenis={scrollTo:(target,options)=>aboutScroll={target,options}};context.go(context.links.about);assert.equal(aboutScroll.target,aboutTarget);assert.equal(aboutScroll.options.offset,-108);assert.equal(aboutScroll.options.force,true);console.log('PASS: About uses the native Lenis instance instead of competing with its scroll ticker.');

const key={name:'Keyboard_1_Fourth_Raycaster_Hover',scale:new Vector(1,1,1),position:new Vector};const k=new context.Controller(exp,{Ray,Vector3:Vector},{host:new Element,layer:new Element,controls:new Element,tooltip:{}});k.setHover(key);k.update();assert(key.position.y<0);k.beforeFrame();assert.equal(key.position.y,0);k.destroy();console.log('PASS: key press offsets are restored each frame, without changing authored object transforms.');
