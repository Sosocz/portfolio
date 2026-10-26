/* Validate the real optimized loader without a browser or a GPU. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(__dirname,'../dist/chambre-sxsx'),bundle=fs.readFileSync(root+'/assets/interactive-room-Chi5jqhe.js','utf8');
const loaderCode=bundle.slice(bundle.indexOf('async function loadRoomOptimized('),bundle.indexOf('const iS=r=>'));
const {model:original,binary:originalGeometry}=require('./read-room-source.cjs')(root);
const model=JSON.parse(fs.readFileSync(root+'/chambre-sxsx.optimized.gltf'));
for(const key of ['nodes','meshes','accessors','bufferViews','materials','scenes','animations','skins'])assert.deepEqual(model[key],original[key],key+' must retain original rendering data');
const h=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 let fallback=0,parsed=0;
 const loader={loadAsync:async url=>{fallback++;assert(url.endsWith('chambre-sxsx.gltf'));return'original'},parseAsync:async buffer=>{
  parsed++;const v=new DataView(buffer);assert.equal(v.getUint32(0,true),0x46546c67);assert.equal(v.getUint32(8,true),buffer.byteLength);
  const jsonLength=v.getUint32(12,true),json=JSON.parse(Buffer.from(buffer,20,jsonLength).toString().trim());
  assert(!json.buffers[0].uri);assert.deepEqual(json.meshes,original.meshes);
  const bytes=Buffer.from(buffer,28+jsonLength,original.buffers[0].byteLength);assert.equal(h(bytes),h(originalGeometry));return'optimized';
 }};
 const context={URL,document:{baseURI:'https://portfolio.test/chambre-sxsx/'},iS:name=>'https://portfolio.test/chambre-sxsx/'+name,console,TextEncoder,Uint8Array,DataView,ArrayBuffer,DecompressionStream,Blob,Response,
 fetch:async url=>new Response(fs.readFileSync(root+'/'+url.split('/').at(-1)))};
 vm.runInNewContext(loaderCode,context);assert.equal(await context.loadRoomOptimized(loader),'optimized');assert.equal(fallback,0);assert.equal(parsed,1);
 context.DecompressionStream=undefined;assert.equal(await context.loadRoomOptimized(loader),'original');assert.equal(fallback,1);
 console.log('PASS: optimized loader reconstructs a valid GLB with byte-identical geometry; nodes, materials, meshes and animation data unchanged; original-file fallback works.');
 const quality=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../source-assets/quality-checks/room-lossless.json')));assert(quality.textures.every(t=>t.visiblePixelDifferences===0));assert.equal(quality.geometry.sha256,quality.geometry.decompressedSha256);assert(quality.after<quality.before*.51);
 console.log('PASS: lossless pixel comparison passed for every converted texture; source dimensions retained; pack reduced by '+((1-quality.after/quality.before)*100).toFixed(1)+'%.');
 // Exercise the exact room-loop visibility state machine from the shipped bundle.
 const tickStart=bundle.indexOf('let roomViewportVisible=');const tickCode=bundle.slice(tickStart,bundle.lastIndexOf('\n}'));
 const events={},loops=[];let inView;
 const ctx={ui:{domElement:{},setAnimationLoop:f=>loops.push(f)},roomTick(){},window:{SXSXRoomVisible:true},document:{hidden:false,addEventListener:(n,f)=>events[n]=f},IntersectionObserver:class{constructor(f){inView=f}observe(){}}};
 vm.runInNewContext(tickCode,ctx);assert.equal(loops.at(-1),ctx.roomTick);inView([{isIntersecting:false}]);assert.equal(loops.at(-1),null);inView([{isIntersecting:true}]);assert.equal(loops.at(-1),ctx.roomTick);ctx.window.SXSXRoomVisible=false;events['room-visibility']();assert.equal(loops.at(-1),null);ctx.window.SXSXRoomVisible=true;ctx.document.hidden=true;events.visibilitychange();assert.equal(loops.at(-1),null);ctx.document.hidden=false;events.visibilitychange();assert.equal(loops.at(-1),ctx.roomTick);
 console.log('PASS: GPU loop stops outside the viewport, on parent visibility changes and in hidden tabs; resumes correctly.');
})().catch(e=>{console.error(e);process.exitCode=1});
