/* Exercise the retained home scene and asset loader without a GPU. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const code=fs.readFileSync('dist/portfolio-runtime.js','utf8');
class Vector{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}copy(v){Object.assign(this,v);return this}clone(){return new Vector(this.x,this.y,this.z)}set(x,y,z){Object.assign(this,{x,y,z});return this}setScalar(v){return this.set(v,v,v)}}
class Group{constructor(){this.position=new Vector;this.rotation=new Vector;this.scale=new Vector(1,1,1);this.children=[];this.visible=true}add(...items){this.children.push(...items)}}
class Mesh extends Group{constructor(geometry,material){super();Object.assign(this,{geometry,material})}}
class Camera extends Group{updateProjectionMatrix(){}}
class Color{constructor(value){this.value=value}convertLinearToSRGB(){return this}getHex(){return 0}}
class Target{constructor(width,height){Object.assign(this,{width,height,texture:{}})}setSize(){}dispose(){}}
const target={previous:true};let current=target,alpha=.5;const renderer={getRenderTarget:()=>current,setRenderTarget:t=>current=t,getClearAlpha:()=>alpha,getClearColor:c=>c,setClearColor:(c,a)=>alpha=a,clear(){},render(){}};
const eased=()=>({value:{x:.2,y:.1},update(){}});const graphics={isDebug:false,sizes:{width:1280,height:800,pixelRatio:1.25},mouse:{createEasedNormalized:eased,createEasedPace:eased},time:{delta:16,elapsed:1},renderer:{instance:renderer},world:{fluidCursor:{sourceTarget:{texture:{}}},backgroundNoise:{renderTarget:{texture:{}}}},assets:{textures:{noise:{texture:{}}}}};
const context=vm.createContext({console,Promise,window:{innerWidth:1280,SXSXRoomHost:{frame(){}}},document:{querySelector:s=>s==='[data-room-slot]'?{}:{offsetWidth:700,offsetHeight:500},querySelectorAll:()=>[],addEventListener(){}},RQ:class{constructor(){return graphics}},TB:Group,rB:Group,OQ:Mesh,QB:class{},fQ:class{constructor(options){Object.assign(this,options)}},YA:class{constructor(value){this.value=value}},pA:Color,XB:Target,RB:Camera,N9:class{constructor(){this.instance=new Group}},TA:{create(){}},m:{to(){},fromTo(){},registerPlugin(){}},K0:1,DC:2});
const cfgStart=code.indexOf('window.landoGL={reveal:'),cfgEnd=code.indexOf(';if(eR.isWebGL2Available())',cfgStart);
context.vQ='/assets/gl';context.iQ='webp';vm.runInContext(code.slice(cfgStart,cfgEnd),context);
for(const [name,next]of [['W9','var c5='],['F9','var a5='],['O9','var t5=']]){const start=code.indexOf('class '+name+'{'),end=code.indexOf(next,start);vm.runInContext(code.slice(start,end)+';globalThis.'+name+'='+name,context)}
const scene=new context.O9({});scene.isRendering=true;scene.update();scene.resize();scene.renderPipeline();
assert.equal(scene.roomMode,true);assert.equal(scene.headDefault.instance.visible,false);assert.equal(scene.helmet.instance.visible,false);assert.equal(scene.helmet.renderTarget.width,1);assert.equal(alpha,.5,'transparent overlay restores renderer clear state');
assert(code.includes('new RQ({canvas:"canvas.gl"})'),'original renderer entry retained');
assert(!/Norris|BRITISH GP WEEKEND|\/textures\/(?:head|helmet|glass|tracks)\/|\/models\/(?:helmet|tracks)/i.test(code));
const loadStart=code.indexOf('async load(){',code.indexOf('class BZ')),loadEnd=code.indexOf('}}var tM=',loadStart)+1;
const texStart=code.indexOf('setTexturesParams(){'),texEnd=code.indexOf('setHDRIParams(){',texStart);
const Loader=vm.runInContext('(class {'+code.slice(texStart,texEnd)+code.slice(loadStart,loadEnd)+'})',context),loader=new Loader(),urls=[];
loader.fonts={brier:{},mona:{}};loader.textures={noise:{texture:null},head:{diffuse:null}};
loader.customTextureLoader=loader.customFontLoader=loader.customModelLoader=async(url,assign)=>{urls.push(url);assign({isTexture:true})};
(async()=>{await loader.load();assert.equal(urls.length,5);assert(urls.every(u=>/\/fonts\/|\/textures\/noise\//.test(u)));assert(!urls.some(u=>/helmet|tracks|norris|disco|head\//i.test(u)));console.log('PASS: retained head/background composition initializes, updates and resizes without legacy assets; one-pixel transparent layer preserves renderer state; only five local noise/font resources requested.');})().catch(e=>{console.error(e);process.exitCode=1});
