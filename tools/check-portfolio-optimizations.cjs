const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dist=path.resolve(__dirname,'../dist');
const helpers=fs.readFileSync(path.join(dist,'chambre-sxsx/src/room-performance.js'),'utf8').replaceAll('export function','function');
const events=new Map(),frames=new Map();let serial=0;
const context={Map,innerWidth:1000,innerHeight:800,addEventListener:(n,f)=>events.set(n,f),removeEventListener:(n)=>events.delete(n),requestAnimationFrame:f=>{frames.set(++serial,f);return serial},cancelAnimationFrame:i=>frames.delete(i)};
vm.createContext(context);vm.runInContext(helpers+';this.freeze=freezeRoomTransforms;this.material=roomMaterialFor;this.resize=installRoomResize',context);
const nodes=['Room','Screen','Kirby_Third_Hover_Raycaster','Computer_Fan_1_Fourth_Raycaster','Chair_Top_Fourth','Fish_Fourth_Hover_Raycaster','Hour_Hand_First','Minute_Hand_First'].map(name=>({name,matrixAutoUpdate:true,updates:0,updateMatrix(){this.updates++}}));
const scene={matrixAutoUpdate:true,updateMatrix(){}};context.freeze(scene,{traverse:f=>nodes.forEach(f)});
assert.equal(scene.matrixAutoUpdate,false);assert.equal(nodes[0].matrixAutoUpdate,false);assert.equal(nodes[1].matrixAutoUpdate,false);assert.equal(nodes[2].matrixAutoUpdate,false);assert(nodes.slice(3).every(n=>n.matrixAutoUpdate));assert(nodes.every(n=>n.updates===1));
let creations=0;const cache=new WeakMap(),texture={},another={};const create=()=>({index:++creations});
assert.equal(context.material(cache,texture,0,create),context.material(cache,texture,0,create));assert.notEqual(context.material(cache,texture,1,create),context.material(cache,texture,0,create));context.material(cache,another,0,create);assert.equal(creations,3);
let resizes=0,projections=0;const camera={aspect:1.25,updateProjectionMatrix(){projections++}},renderer={setSize(w,h){resizes++;assert.equal(w,1200);assert.equal(h,900)}};
const cleanup=context.resize(renderer,camera);context.innerWidth=1200;context.innerHeight=900;
for(let i=0;i<100;i++)events.get('resize')();assert.equal(frames.size,1);[...frames.values()][0]();frames.clear();assert.equal(resizes,1);assert.equal(projections,1);assert.equal(camera.aspect,1200/900);events.get('resize')();[...frames.values()][0]();frames.clear();assert.equal(resizes,1);cleanup();assert.equal(events.size,0);
console.log('PASS: fixed transforms frozen; continuous motion retained; identical materials shared; 100 resize events produce one allocation.');

// The iframe stops rendering as soon as the parent hides it, without redundant CSS work.
const documentEvents=new Map(),windowEvents=new Map(),messages=[],observers=[];let writes=0;
const host={isConnected:true,style:new Proxy({}, {set(o,k,v){writes++;o[k]=v;return true}})},iframe={contentWindow:{postMessage(m){messages.push(m)}},addEventListener(){}};
const document={hidden:false,readyState:'complete',querySelector:s=>s==='[data-room-slot]'?host:s==='.sxsx-interactive-room'?iframe:null,addEventListener:(n,f)=>documentEvents.set(n,f)};
const window={addEventListener:(n,f)=>windowEvents.set(n,f),IntersectionObserver:true};
class Observer{constructor(fn){this.fn=fn;observers.push(this)}observe(target){this.target=target}disconnect(){this.disconnected=true}}
const hc={document,window,location:{origin:'https://test.invalid'},Math,Number,IntersectionObserver:Observer,innerHeight:800};vm.createContext(hc);vm.runInContext(fs.readFileSync(path.join(dist,'assets/interactive-room-host.js'),'utf8'),hc);
window.SXSXRoomHost.frame(0);const initial=writes;for(let i=0;i<120;i++)window.SXSXRoomHost.frame(0);assert.equal(writes,initial,'idle frames must not rewrite style');
window.SXSXRoomHost.frame(1);assert.equal(messages.at(-1).visible,false);assert.equal(host.style.visibility,'hidden');
window.SXSXRoomHost.frame(0);assert.equal(messages.at(-1).visible,true);assert.equal(host.style.transform,'translate(-50%,-50%) scale(1)');
document.hidden=true;documentEvents.get('visibilitychange')();assert.equal(messages.at(-1).visible,false);
document.hidden=false;documentEvents.get('visibilitychange')();assert.equal(messages.at(-1).visible,true);
observers[0].fn([{target:iframe,isIntersecting:false}]);assert.equal(messages.at(-1).visible,false);
console.log('PASS: idle CSS writes eliminated; exact framing retained; invisible/hidden/offscreen rooms pause and resume.');

// Original full-resolution certificates wait until near the viewport; hover/focus can prepare them too.
let certObserver,loads=0,decodes=0;
const image={dataset:{certificateSrc:'/cert-original.webp',certificateSrcset:'/cert-original.webp 1000w'},loading:'lazy',decode(){decodes++;return Promise.resolve()}};
const cardEvents=new Map(),card={querySelectorAll:()=>[image],addEventListener:(n,f)=>cardEvents.set(n,f)};
class CertObserver{constructor(fn,options){this.fn=fn;this.options=options;certObserver=this}observe(){}unobserve(){}}
const dc={document:{readyState:'complete',querySelectorAll:()=>[card]},window:{addEventListener(){}},WeakSet,IntersectionObserver:CertObserver};vm.createContext(dc);vm.runInContext(fs.readFileSync(path.join(dist,'assets/certificate-readiness.js'),'utf8'),dc);
assert.equal(image.src,undefined);assert.equal(certObserver.options.rootMargin,'1600px 0px');certObserver.fn([{target:card,isIntersecting:true}]);assert.equal(image.src,'/cert-original.webp');assert.equal(image.srcset,'/cert-original.webp 1000w');assert.equal(decodes,1);cardEvents.get('pointerenter')();assert.equal(decodes,1);
console.log('PASS: no initial high-resolution certificate requests; original pixels decode in advance and prepare only once.');

// No GPU or wallpaper work is performed before the actual room is available.
const bundle=fs.readFileSync(path.join(dist,'chambre-sxsx/assets/interactive-room-Chi5jqhe.js'),'utf8');
const start=bundle.indexOf('const roomTick=now=>'),end=bundle.indexOf('\nlet roomViewportVisible=',start);let renders=0,wallpaper=0;
const rc={Math,Td:{update(){wallpaper++}},Un:{update(){}},As:null,Pa:null,ui:{render(){renders++}},Ka:{},tr:{}};vm.createContext(rc);vm.runInContext('let roomLastFrame=0,roomLastRender=null,roomElapsed=0;'+bundle.slice(start,end)+';this.tick=roomTick',rc);
for(let i=0;i<120;i++)rc.tick(1000+i*1000/60);assert.equal(renders,0);assert.equal(wallpaper,0);rc.As={update(){}};rc.tick(4000);assert.equal(renders,1);assert.equal(wallpaper,1);
assert(bundle.includes('multiplyScalar(1.02)'));assert(bundle.includes('54.002991026967265'));assert(bundle.includes('ui.setPixelRatio(Math.min(devicePixelRatio,2))'));
console.log('PASS: empty-scene GPU work skipped; loaded room renders normally with unchanged framing, pixel ratio and quality.');
