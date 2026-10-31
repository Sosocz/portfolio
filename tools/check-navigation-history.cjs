const fs = require('fs'), vm = require('vm'), assert = require('node:assert/strict');
const source = fs.readFileSync(__dirname + '/../dist/assets/navigation-history.js', 'utf8');
const events = new Map(), frames = new Map(), timers = new Map();
let sequence = 0;
const location = {pathname:'/projets/', search:'', hash:'', href:'https://example.test/projets/'};
const history = {state:null, replaceState(s){this.state=s;}, pushState(s){this.state=s;}};
const memory = new Map();
const document = {documentElement:{scrollHeight:9000}, hidden:false, querySelector:()=>null, addEventListener(){}, getElementById:id=>id==='selection'?{getBoundingClientRect:()=>({top:847-env.scrollY})}:null};
const env = {history, location, document, Map, JSON, Math, Date, Number, crypto:{randomUUID:()=>String(++sequence)}, innerHeight:900,
 sessionStorage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)}, getComputedStyle:()=>({scrollMarginTop:'32px'}),
 requestAnimationFrame:fn=>{const id=++sequence;frames.set(id,fn);return id;}, cancelAnimationFrame:id=>frames.delete(id),
 setTimeout:fn=>{const id=++sequence;timers.set(id,fn);return id;}, clearTimeout:id=>timers.delete(id), scrollY:0,scrollX:0,
 addEventListener:(type,fn)=>{if(!events.has(type))events.set(type,[]);events.get(type).push(fn);},
 scrollTo:({top})=>{env.scrollY=top;}, MutationObserver:class{observe(){}disconnect(){}}};
env.window=env;vm.runInNewContext(source,env);
const emit=(type,event={})=>(events.get(type)||[]).forEach(fn=>fn(event));
const flush=()=>{while(frames.size){const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn());}};
const initialState=history.state;
emit('scroll');[...timers.values()].forEach(fn=>fn());timers.clear();
// Native smooth fragment scrolling can have started before popstate fires.
env.scrollY=185;location.hash='#selection';location.href+='\x23selection';history.state=null;
emit('popstate',{state:null});flush();assert.equal(env.scrollY,815,'new fragment must honour target and scroll margin');
emit('scroll');[...timers.values()].forEach(fn=>fn());timers.clear();
location.hash='';history.state=initialState;emit('popstate',{state:initialState});flush();assert.equal(env.scrollY,0,'back must preserve the departure position, not an intermediate smooth-scroll offset');
console.log('PASS: native fragment destination, scroll margin, and previous history entry restoration.');
