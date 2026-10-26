const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync('dist/portfolio-runtime.js','utf8');
const a=code.indexOf('loadAssetAttempt(loader,'),b=code.indexOf('customTextureLoader(A,Q){',a);
let scheduled=new Map(),serial=0;
const ctx={Promise,Error,setTimeout:fn=>{scheduled.set(++serial,fn);return serial},clearTimeout:id=>scheduled.delete(id)};
const C=vm.runInNewContext('(class {'+code.slice(a,b)+'})',ctx);
(async()=>{
 const c=new C(); let calls=0,assigned=0;
 await c.loadAsset({load(u,ok,p,fail){++calls;if(calls===1)fail(new Error('network'));else ok(42)}},'/texture',v=>assigned=v);
 assert.equal(calls,2);assert.equal(assigned,42);assert.equal(scheduled.size,0);
 await assert.rejects(c.loadAsset({load(u,ok,p,fail){fail(new Error('offline'))}},'/missing',()=>{}),/offline/);
 let callbacks=[]; const pending=c.loadAsset({load(u,ok){callbacks.push(ok)}},'/slow',v=>assigned=v);
 [...scheduled.values()][0](); // first request timeout -> retry
 callbacks[0](99); // stale success must not overwrite the retried asset
 assert.equal(assigned,42);callbacks[1](55);await pending;assert.equal(assigned,55);
 // Read actual desktop/mobile config; every texture, decoder, environment and font is bundled.
 const start=code.indexOf('window.landoGL={reveal:'),end=code.indexOf(';if(eR.isWebGL2Available())',start);
 for(const iQ of ['webp','ktx2']){
  const cfg={window:{},vQ:'/assets/gl',iQ};vm.runInNewContext(code.slice(start,end),cfg);
  function check(x){if(typeof x==='string'){assert.ok(x.startsWith('/assets/gl/'));assert.ok(fs.existsSync('dist'+x),x)}else Object.values(x).forEach(check)}check(cfg.window.landoGL.assets);
 }
 for(const f of ['index.html','on-track/index.html','off-track/index.html','calendar/index.html']){
  const html=fs.readFileSync('dist/'+f,'utf8'); assert.match(html, /src="(?:\.\/|\/)portfolio-runtime.js\?v=/);
 }
 // Exercise the renderer against real call order and offscreen gating.
 const ra=code.indexOf('update(){for(let A in this.gl.world.scenes)'),rb=code.indexOf('resize(){',ra);
 const Render=vm.runInNewContext('(class {'+code.slice(ra,rb)+'})');
 const events=[],target={};const renderer=new Render();renderer.gl={world:{scenes:[{defaultRenderTarget:target,isRendering:true,renderPipeline(){events.push('draw')}},{isRendering:false,renderPipeline(){throw Error('offscreen')}}]},scene:{},camera:{instance:{}}};renderer.instance={setRenderTarget(t){events.push(t?'target':'screen')},clear(){events.push('clear')},render(){events.push('compose')}};renderer.update();assert.deepEqual(events,['target','clear','draw','screen','clear','compose']);
 // Duplicate texture variants share one load and still fill both material slots.
 let downloads=0,one,two;const loader={load(u,ok){downloads++;ok(7)}};
 await Promise.all([c.loadAsset(loader,'/alias',v=>one=v),c.loadAsset(loader,'/alias',v=>two=v)]);assert.equal(downloads,1);assert.equal(one,7);assert.equal(two,7);
 // Startup must initialize the page while 3D and Rive are unresolved.
 const calls2=[];const boot=code.slice(code.indexOf('async function c_(){'),code.indexOf('}c_();')+1);
 const bootctx={document:{fonts:{status:"loaded"}},eM:()=>new Promise(()=>{}),BL:()=>new Promise(()=>{}),m_:()=>new Promise(()=>{}),EV:()=>calls2.push('scroll'),aL:()=>calls2.push('page'),CD:()=>{}};
 vm.runInNewContext(boot+';c_()',bootctx);assert.deepEqual(calls2,['scroll','page']);
 // A navigation during download invalidates the old world request; mount current page once.
 let ready;const pendingGraphics=new Promise(resolve=>ready=resolve);let initialized=0,added=0;
 const wa=code.indexOf('async function syncPortfolioWorld()'),wb=code.indexOf('var vQ=',wa);
 const worldctx={portfolioGraphicsReady:pendingGraphics,portfolioWorldGeneration:0,bI:{isLoaded:false,init(){this.isLoaded=true;initialized++},world:{add(){added++},destroy(){}},renderer:{add(){}}},queuePortfolioRefresh(){},document:{documentElement:{classList:{remove(){},add(){}}}},console};
 vm.runInNewContext(code.slice(wa,wb),worldctx);
 const oldWorld=worldctx.AL();worldctx.QL();const newWorld=worldctx.yU();ready();await Promise.all([oldWorld,newWorld]);assert.equal(initialized,1);assert.equal(added,0);
 // Even if the engine never signals readiness, the loader releases at 2.5 seconds.
 let hidden=false;const timers=[];const overlay={style:{}};
 const loaderctx={performance:{now:()=>0},setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length},clearTimeout(){},document:{querySelector:()=>overlay},window:{matchMedia:()=>({matches:false})}};
 vm.runInNewContext(fs.readFileSync('dist/assets/portfolio-loader.js','utf8'),loaderctx);
 const escape=timers.find(t=>t.ms===2500);assert.ok(escape);escape.fn();assert.equal(overlay.style.visibility,'hidden');
 console.log('PASS: non-blocking startup, 2.5s loader escape, one world after mid-load navigation, shared texture decoding, retry, terminal rejection, timeout/stale-callback protection, complete desktop/mobile local dependencies, common runtime on all entry routes, clear-before-render and offscreen skip.');
})().catch(e=>{console.error(e);process.exitCode=1});
