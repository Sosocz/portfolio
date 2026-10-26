const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname+'/../',source=fs.readFileSync(root+'dist/portfolio-runtime.js','utf8');
const raw=fs.readFileSync(root+'dist/assets/chambre-sxsx-mint-walls.glb');
assert.equal(raw.toString('ascii',0,4),'glTF');
assert.equal(raw.readUInt32LE(8),raw.length);
const gltf=JSON.parse(raw.toString('utf8',20,20+raw.readUInt32LE(12)));
assert.equal(gltf.animations.length,9);assert.equal(gltf.cameras.length,1);
for(const clip of gltf.animations)for(const channel of clip.channels){assert(gltf.nodes[channel.target.node]);const sampler=clip.samplers[channel.sampler];assert(gltf.accessors[sampler.input].count>1);assert(gltf.accessors[sampler.output].count>1);}
assert(gltf.extensionsRequired.includes('EXT_texture_webp'));
for(const image of gltf.images)assert.equal(image.mimeType,'image/webp');
const methods=source.slice(source.indexOf('fitRoom(){'),source.indexOf('setIsRendering(){',source.indexOf('fitRoom(){')));
const impl=vm.runInNewContext('(class {'+methods+'}).prototype');
for(const aspect of [390/844,768/1024,1363/936,2560/1440]){
 let scale,pos;const state={camera:{fov:15,position:{z:aspect<1?3.75:3},aspect},roomSize:{x:10,y:10},room:{scale:{setScalar:s=>scale=s},position:{set:(...v)=>pos=v}}};
 impl.fitRoom.call(state);const height=2*Math.tan(15*Math.PI/360)*state.camera.position.z;
 assert(scale*10<=height*.82+1e-9);assert(scale*10<=height*aspect*.86+1e-9);assert(pos.every(Number.isFinite));
}
let tick;const state={room:{rotation:{}},roomMotionPreference:{matches:false},gl:{time:{elapsed:2.5}},roomTracks:[{duration:2,curve:{evaluate:t=>(tick=t,[0,0,1,0])},target:{quaternion:{fromArray:a=>assert.equal(a.length,4)}},property:'quaternion'}],easedMouse:{normalized:{value:{x:1,y:-1}}}};
impl.updateRoom.call(state);assert.equal(tick,.5);assert.equal(state.room.rotation.y,.065);assert.equal(state.room.rotation.x,.035);
state.roomMotionPreference.matches=true;tick=null;impl.updateRoom.call(state);assert.equal(tick,null);assert.equal(state.room.rotation.y,0);assert.equal(state.room.rotation.x,0);
console.log('PASS: GLB, nine animated node tracks, WebP textures, desktop/tablet/mobile fit, looping playback, pointer response and reduced motion.');
const pixelMethod=source.slice(source.indexOf('roomPixelRatio(){'),source.indexOf('\nfitRoom(){'));
const pixel=vm.runInNewContext('(class {'+pixelMethod+'}).prototype',{window:{devicePixelRatio:2}});
assert.equal(pixel.roomPixelRatio.call({gl:{sizes:{width:1363,height:936}}}),2);
const large=pixel.roomPixelRatio.call({gl:{sizes:{width:3840,height:2160}}});
assert(large<=2);assert(large*large*3840*2160<=6000001);
const rendererUpdate=source.match(/update\(\)\{const room=this\.gl\.world\.scenes\.find[\s\S]*?this\.instance\.render\(this\.gl\.scene,this\.gl\.camera\.instance\)\}/)[0];
const render=vm.runInNewContext('(class {'+rendererUpdate+'}).prototype');let ratio=1.25,changes=0;
const active={room:{},isRendering:true,roomPixelRatio:()=>2,renderPipeline:()=>{}};
const renderer={gl:{world:{scenes:[active]},sizes:{width:1363,height:936,pixelRatio:1.25},camera:{}},instance:{getPixelRatio:()=>ratio,setPixelRatio:r=>{ratio=r;changes++},setSize:()=>{},clear:()=>{},setRenderTarget:()=>{},render:()=>{}}};
render.update.call(renderer);assert.equal(ratio,2);render.update.call(renderer);assert.equal(changes,1);
active.isRendering=false;render.update.call(renderer);assert.equal(ratio,1.25);assert.equal(changes,2);
console.log('PASS: Retina room rendering, six-million-pixel budget, no repeated canvas resizing, original resolution restored outside room.');
