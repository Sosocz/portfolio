const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const dist=path.join(__dirname,'../dist');
const compiled=fs.readFileSync(path.join(dist,'chambre-sxsx/assets/interactive-room-Chi5jqhe.js'),'utf8');
const authored=fs.readFileSync(path.join(dist,'chambre-sxsx/src/portfolio-room-motion.js'),'utf8');
class Vector {constructor(x=1,y=1,z=1){Object.assign(this,{x,y,z});}clone(){return new Vector(this.x,this.y,this.z);}set(x,y,z){Object.assign(this,{x,y,z});return this;}copy(v){Object.assign(this,v);return this;}}
function verifyMotion(source,compiledVersion){
 let rays=0,matrixUpdates=0,activations=0;
 const target={updateMatrix(){matrixUpdates++;},name:'About_Button_Raycaster_Hover',isMesh:true,parent:{name:'Root'},rotation:new Vector(0,0,0),position:new Vector(0,0,0),scale:new Vector};
 class Raycaster {setFromCamera(){}intersectObjects(){rays++;return[{object:target}];}}
 const events=new Map(),canvas={style:{},getBoundingClientRect:()=>({left:0,top:0,width:100,height:100}),addEventListener:(t,f)=>events.set(t,f)};
 const root={traverse:f=>f(target),updateMatrixWorld:()=>matrixUpdates++},camera={updateMatrixWorld(){}};
 const tween={to(target,options){options.onUpdate?.();},killTweensOf(){}};
 const context={THREE:{Vector2:Vector,Raycaster},gsap:tween,Ee:Vector,e_:Raycaster,br:tween,Date,Math,Map,matchMedia:()=>({matches:false})};
 vm.createContext(context);
 vm.runInContext(source+';globalThis.createMotion='+(compiledVersion?'eS':'createRoomMotion')+';',context);
 const motion=context.createMotion(root,camera,canvas,{onActivate:()=>activations++});
 for(let n=0;n<120;n++)motion.update(n/60);
 assert.equal(rays,0,'no expensive ray test before the pointer enters');
 const event={clientX:40,clientY:40,pointerId:1};
 events.get('pointermove')(event);motion.update(2);assert.equal(rays,1,'first pointer position tested immediately');
 const start=rays;for(let n=1;n<=144;n++)motion.update(2+n/144);
 assert(rays-start<=13,'stationary pointer must not raycast at display frame rate');
 const beforeMove=rays;events.get('pointermove')({...event,clientX:41});motion.update(3.001);assert.equal(rays,beforeMove+1,'a new movement must not wait for the periodic check');
 events.get('pointerdown')(event);events.get('pointerup')(event);assert.equal(activations,1,'click always performs its own exact hit test');
 events.get('pointerleave')();motion.update(3.002);assert.equal(canvas.style.cursor,'grab','leave clears hover immediately');
 const afterLeave=rays;for(let n=1;n<120;n++)motion.update(4+n/60);assert.equal(rays,afterLeave,'no raycasts while pointer is outside');
 console.log('PASS:',compiledVersion?'published bundle':'authored motion','first hover, periodic stationary checks, exact click, pointer leave.');
}
verifyMotion(authored.replace(/^import .*;$/gm,'').replace('export function','function'),false);
verifyMotion(compiled.slice(compiled.indexOf('function eS('),compiled.indexOf('const Uu=',compiled.indexOf('function eS('))),true);
// Run the exact production scheduling block at representative refresh rates.
const tick=compiled.slice(compiled.indexOf('const roomTick=now=>'),compiled.indexOf('\nlet roomViewportVisible=',compiled.indexOf('const roomTick=now=>')));
for(const hz of [60,120,144]){
 let renders=0;const context={Math,Td:{update(){}},Un:{update(){}},As:{update(){}},Pa:null,ui:{render(){renders++;}},Ka:{},tr:{}};
 vm.createContext(context);vm.runInContext('let roomLastFrame=0,roomLastRender=null,roomElapsed=0;'+tick+';globalThis.tick=roomTick;',context);
 for(let n=0;n<hz;n++)context.tick(1000+n*1000/hz);
 assert(renders>=59&&renders<=61,`60 Hz output expected on ${hz} Hz, got ${renders}`);
 console.log(`PASS: ${hz} Hz display -> ${renders} renders in one second.`);
}
// The hidden legacy helmet no longer renders while the iframe room is active.
const runtime=fs.readFileSync(path.join(dist,'portfolio-runtime.js'),'utf8');
let start=runtime.indexOf('update(){if(!this.isRendering)',runtime.indexOf('class O9'));
const method=runtime.slice(start,runtime.indexOf('var t5=',start)).slice(0,-1);
let head=0,helmet=0,host=0;
const context={window:{landoGL:{reveal:1},SXSXRoomHost:{frame(){host++;}}},Math};vm.createContext(context);
const prototype=vm.runInContext('(class {'+method+'}).prototype',context);
const uniforms=Object.fromEntries(['uTime','uReveal','tHelmet','tCursorEffect','tBackgroundNoise'].map(k=>[k,{value:null}]));
const state={isRendering:true,roomMode:true,headDefault:{update(){head++;},instance:{rotation:new Vector}},helmet:{update(){helmet++;},renderTarget:{texture:{}},instance:{visible:false,rotation:new Vector},wireframeMesh:{visible:false}},easedMouse:{normalized:{update(){}},pace:{update(){}}},gl:{isDebug:true,time:{delta:.016,elapsed:1},world:{fluidCursor:{sourceTarget:{texture:{}}},backgroundNoise:{renderTarget:{texture:{}}}}},renderPlane:{mesh:{material:{uniforms}}}};
prototype.update.call(state);assert.equal(head,0);assert.equal(helmet,0);assert.equal(host,1);
state.roomMode=false;prototype.update.call(state);assert.equal(head,1);assert.equal(helmet,1);
console.log('PASS: hidden legacy helmet pass skipped for room; original other-page behavior retained.');
for(const page of ['index.html','on-track/index.html']){
 const html=fs.readFileSync(path.join(dist,page),'utf8');
 const images=[...html.matchAll(/<img\b[^>]*class="[^"]*helmet-grid-item-reveal-img[^"]*"[^>]*>/g)];
 assert.equal(images.length,16);assert(images.every(m=>m[0].includes('loading="lazy"')&&m[0].includes('data-certificate-src="')));assert(html.includes('certificate-readiness.js'));
}
console.log('PASS: all 16 original certificate reveal images deferred and prepared before hover on both pages.');
