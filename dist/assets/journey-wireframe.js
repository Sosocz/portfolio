// Fine wire meshes in the original off-icons frame. No model, font or remote asset.
const line = (a, b, opacity = .8, weight = 1.25) => ({a, b, opacity, weight});

function panel(lines, x0, x1, y0, y1, z, grid = true, opacity = .85) {
  const corners = [[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]];
  corners.forEach((p,i) => lines.push(line(p,corners[(i+1)%4],opacity,1.5)));
  if (grid) {
    for (let i=1;i<9;i++) {
      const x=x0+(x1-x0)*i/9;
      lines.push(line([x,y0,z],[x,y1,z],.25,.9));
    }
    for (let i=1;i<6;i++) {
      const y=y0+(y1-y0)*i/6;
      lines.push(line([x0,y,z],[x1,y,z],.25,.9));
    }
  }
  return corners;
}
function box(lines,x0,x1,y0,y1,z0,z1,grid=true) {
  const back=panel(lines,x0,x1,y0,y1,z0,false,.35);
  const front=panel(lines,x0,x1,y0,y1,z1,grid);
  front.forEach((p,i)=>lines.push(line(p,back[i],.6,1.1)));
}
function terminal() {
  const lines=[];
  box(lines,-1.02,1.02,-.69,.69,-.18,.12);
  lines.push(line([-.98,.43,.13],[.98,.43,.13],.7,1.2));
  // The prompt remains legible against the fine screen grid.
  lines.push(line([-.63,.22,.15],[-.34,-.02,.15],1,2.6));
  lines.push(line([-.34,-.02,.15],[-.63,-.26,.15],1,2.6));
  lines.push(line([-.12,-.26,.15],[.36,-.26,.15],1,2.6));
  return {name:'Terminal',lines,nodes:[]};
}
function network() {
  // Adapted from Lucide's Network icon (ISC):
  // https://github.com/lucide-icons/lucide/blob/main/icons/network.svg
  // Preserve its three-node topology; add a light mesh only within each node.
  const lines=[];
  const point=(x,y,z=.12)=>[(x-12)/10,(12-y)/10,z];
  const segment=(x0,y0,x1,y1,opacity=.9,weight=1.9,z=.12)=>
    lines.push(line(point(x0,y0,z),point(x1,y1,z),opacity,weight));
  function node(x,y) {
    const r=.65;
    const perimeter=[[x+r,y],[x+6-r,y],[x+6,y+r],[x+6,y+6-r],
      [x+6-r,y+6],[x+r,y+6],[x,y+6-r],[x,y+r]];
    perimeter.forEach((p,i)=>{
      const q=perimeter[(i+1)%perimeter.length];
      segment(...p,...q,.95,1.9);
    });
    // A complete shallow rim avoids detached strokes around the mesh.
    perimeter.forEach((p,i)=>{
      const q=perimeter[(i+1)%perimeter.length];
      segment(...p,...q,.22,.8,-.10);
    });
    for(const [cx,cy] of [[x+6-r,y],[x+6,y+r],[x+6,y+6-r],[x+6-r,y+6]]) {
      lines.push(line(point(cx,cy,.12),point(cx,cy,-.10),.35,.9));
    }
    for(let i=1;i<4;i++) {
      segment(x+1.5*i,y+.35,x+1.5*i,y+5.65,.23,.75);
      segment(x+.35,y+1.5*i,x+5.65,y+1.5*i,.23,.75);
    }
  }
  node(9,2);node(2,16);node(16,16);
  segment(12,8,12,12);
  segment(5,16,5,12.65);segment(5,12.65,5.65,12);
  segment(5.65,12,18.35,12);
  segment(18.35,12,19,12.65);segment(19,12.65,19,16);
  return {name:'Réseau',lines,nodes:[]};
}
function computer() {
  const lines=[];
  box(lines,-.96,.96,-.32,.90,-.15,.10);
  panel(lines,-.85,.85,-.20,.78,.12,true,.7);
  box(lines,-.14,.14,-.78,-.33,-.14,.07,false);
  box(lines,-.63,.63,-.89,-.79,-.28,.30,false);
  for(let i=1;i<6;i++) {
    const x=-.63+i*1.26/6;
    lines.push(line([x,-.79,-.28],[x,-.79,.30],.4,.9));
  }
  return {name:'Ordinateur',lines,nodes:[]};
}

export const shapes = [terminal(),network(),computer()];
// Source reef.riv / off-icons: "icon changer" keys at frames 0,10,20,30,
// 60 fps, animation-state playback speed 0.45. Runtime-verified step: 370.37 ms.
const ICON_STEP_MS = 1000 * 10 / (60 * .45);
export function project(p,yaw=-.28,pitch=.18) {
  const x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw);
  const z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);
  const y=p[1]*Math.cos(pitch)-z*Math.sin(pitch);
  const depth=p[1]*Math.sin(pitch)+z*Math.cos(pitch);
  const scale=51*4.5/(4.5+depth);
  return [64+x*scale,64-y*scale];
}
function lineMarkup(item) {
  const a=project(item.a),b=project(item.b);
  return `<line x1="${a[0].toFixed(2)}" y1="${a[1].toFixed(2)}" x2="${b[0].toFixed(2)}" y2="${b[1].toFixed(2)}" opacity="${item.opacity}" stroke-width="${item.weight}"/>`;
}
export function markup() {
  const groups=shapes.map((shape,index)=>`<g data-wire-shape="${index}" opacity="${index===0?1:0}">${shape.lines.map(lineMarkup).join('')}${shape.nodes.map(p=>{const v=project(p);return `<circle cx="${v[0].toFixed(2)}" cy="${v[1].toFixed(2)}" r="1.9" fill="currentColor" stroke="none"/>`}).join('')}</g>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="journey-wireframe" data-journey-wireframe="" role="img" aria-label="Terminal, réseau et ordinateur en animation filaire"><title>Terminal, réseau et ordinateur</title><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${groups.join('')}</g></svg>`;
}

const wireCleanups=new Map();
function initOne(svg) {
  if(wireCleanups.has(svg))return;
  const groups=[...svg.querySelectorAll('[data-wire-shape]')];
  const views=groups.map(group=>({group,lines:[...group.querySelectorAll('line')],nodes:[...group.querySelectorAll('circle')]}));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let inView=false,frame=0,elapsed=0,last=0,lastDraw=0,lastIcon=-1;
  function drawShape(index,yaw,pitch) {
    const shape=shapes[index],view=views[index];
    shape.lines.forEach((item,i)=>{
      const a=project(item.a,yaw,pitch),b=project(item.b,yaw,pitch),el=view.lines[i];
      [['x1',a[0]],['y1',a[1]],['x2',b[0]],['y2',b[1]]].forEach(([key,value])=>el.setAttribute(key,value.toFixed(2)));
    });
    shape.nodes.forEach((p,i)=>{
      const v=project(p,yaw,pitch);view.nodes[i].setAttribute('cx',v[0].toFixed(2));view.nodes[i].setAttribute('cy',v[1].toFixed(2));
    });
  }
  function tick(now) {
    frame=0;
    if(!inView||document.hidden||reduced.matches){last=0;return;}
    if(last)elapsed+=now-last;
    last=now;
    const index=Math.floor(elapsed/ICON_STEP_MS)%shapes.length;
    const changed=index!==lastIcon;
    if(changed) {
      views.forEach((view,i)=>view.group.setAttribute('opacity',i===index?'1':'0'));
      lastIcon=index;
    }
    if(now-lastDraw>=50||changed) {
      lastDraw=now;
      const yaw=-.28+Math.sin(elapsed/3500)*.12,pitch=.18+Math.sin(elapsed/4700)*.035;
      drawShape(index,yaw,pitch);
    }
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    if(frame)cancelAnimationFrame(frame);
    frame=0;last=0;lastIcon=-1;
    if(reduced.matches)views.forEach((view,i)=>view.group.setAttribute('opacity',i===0?'1':'0'));
    else if(inView&&!document.hidden)frame=requestAnimationFrame(tick);
  }
  let observer;
  if('IntersectionObserver' in window) {
    observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{rootMargin:'80px'});
    observer.observe(svg);
  }else{inView=true;sync();}
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  wireCleanups.set(svg,()=>{if(frame)cancelAnimationFrame(frame);observer?.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync)});
}
function init(){for(const [svg,cleanup] of wireCleanups)if(!svg.isConnected){cleanup();wireCleanups.delete(svg)};document.querySelectorAll('[data-journey-wireframe]').forEach(initOne)}
if(typeof document!=='undefined') {
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  window.addEventListener('page-transition-end',init);
}
