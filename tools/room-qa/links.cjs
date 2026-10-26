const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
(async()=>{
 const source=fs.readFileSync('dist/chambre-sxsx/src/portfolio-room-interactions.js','utf8').replace(/export /g,'');const messages=[],opened=[];
 const parent={postMessage:(...args)=>messages.push(args)};const context={window:{parent,open:(...args)=>opened.push(args)},location:{origin:'https://portfolio.test'}};
 vm.runInNewContext(source+';this.create=createRoomInteractions;',context);const actions=await context.create({});
 for(const name of ['My_Work_Button','About_Button','Contact_Button','GitHub','YouTube','Twitter'])actions.activate({name});
 assert.deepEqual(messages.map(x=>x[0].action),['work','about','contact']);assert(messages.every(x=>x[1]==='https://portfolio.test'));
 assert.equal(opened[0][0],'https://github.com/Sosocz');assert(opened[1][0].includes('/in/sofiane-ghazal-6b561639a'));assert(opened[2][0].includes('hackthebox.com/profile/'));assert(opened.every(x=>x[1]==='_blank'&&x[2]==='noopener,noreferrer'));
 const handlers={},host={style:{}},frame={contentWindow:{}},destinations=[],target={};const origin='https://portfolio.test';
 const ctx={window:{addEventListener:(e,f)=>handlers[e]=f,lenis:{scrollTo:(...args)=>destinations.push(['about',...args])}},document:{querySelector:s=>s==='[data-room-slot]'?host:s==='.sxsx-interactive-room'?frame:s==='.impact-content-w.is-home'?target:s==='a[href="/projets/"]'?{click:()=>destinations.push(['work'])}:null},location:{origin,assign:url=>destinations.push(['url',url])},Math,String};
 vm.runInNewContext(fs.readFileSync('dist/assets/interactive-room-host.js','utf8'),ctx);
 ctx.window.SXSXRoomHost.frame(1);assert.equal(host.style.pointerEvents,'none');assert.equal(host.style.visibility,'hidden');ctx.window.SXSXRoomHost.frame(0);assert.equal(host.style.pointerEvents,'auto');assert.equal(host.style.opacity,'1');
 handlers.message({origin:'https://other.test',source:frame.contentWindow,data:{type:'sxsx-room-navigate',action:'work'}});assert.equal(destinations.length,0);
 for(const action of ['work','about','contact'])handlers.message({origin,source:frame.contentWindow,data:{type:'sxsx-room-navigate',action}});
 assert.deepEqual(destinations.map(x=>x[0]),['work','about','url']);assert.equal(destinations[2][1],'mailto:sofiane.ghazal2@gmail.com');
 console.log('PASS: six real destinations, parent navigation/scroll/contact, strict message origin and frame checks, scroll exit releases pointer control.');
})().catch(e=>{console.error(e);process.exitCode=1});

// Wheel forwarding remains available even before the WebGL viewer is ready.
{
 const handlers={},messages=[],parent={postMessage:(data,origin)=>messages.push({data,origin})};
 const ctx={window:{parent,addEventListener:(name,fn)=>handlers[name]=fn},location:{origin:'https://portfolio.test'},innerHeight:800,Number,Math};
 vm.runInNewContext(fs.readFileSync('dist/chambre-sxsx/scroll-page.js','utf8'),ctx);
 let prevented=0;handlers.wheel({deltaY:3,deltaMode:1,preventDefault:()=>prevented++});assert.equal(prevented,1);assert.equal(messages[0].data.deltaY,48);assert.equal(messages[0].data.type,'sxsx-room-scroll');assert.equal(messages[0].origin,'https://portfolio.test');
 handlers.wheel({deltaY:1,deltaMode:2,preventDefault:()=>prevented++});assert.equal(messages[1].data.deltaY,800);
 const controls={enabled:true};ctx.window.SXSXRoomPageScroll.bind(controls);
 handlers.pointerdown({pointerType:'touch',pointerId:1,clientX:100,clientY:200});handlers.pointermove({pointerId:1,clientX:102,clientY:160,preventDefault(){}});assert.equal(controls.enabled,false);assert.equal(messages.at(-1).data.deltaY,40);handlers.pointerup({pointerId:1});assert.equal(controls.enabled,true);
 const count=messages.length;handlers.pointerdown({pointerType:'touch',pointerId:2,clientX:100,clientY:200});handlers.pointermove({pointerId:2,clientX:140,clientY:202,preventDefault(){}});assert.equal(controls.enabled,true);assert.equal(messages.length,count);handlers.pointercancel({pointerId:2});
 const parentHandlers={},frame={contentWindow:{}},positions=[];
 const parentCtx={window:{scrollY:100,lenis:{targetScroll:150,scrollTo:(...args)=>positions.push(args)},addEventListener:(name,fn)=>parentHandlers[name]=fn},document:{querySelector:s=>s==='.sxsx-interactive-room'?frame:null},location:{origin:'https://portfolio.test'},innerHeight:900,Number,Math,String};
 vm.runInNewContext(fs.readFileSync('dist/assets/interactive-room-host.js','utf8'),parentCtx);
 const send=deltaY=>parentHandlers.message({origin:'https://portfolio.test',source:frame.contentWindow,data:{type:'sxsx-room-scroll',deltaY}});
 send(120);assert.equal(positions[0][0],270);assert.equal(positions[0][1].force,true);send(NaN);assert.equal(positions.length,1);
 console.log('PASS: wheel units transfer to page scrolling; vertical touch scrolls, horizontal touch keeps rotation; invalid deltas ignored.');
}
