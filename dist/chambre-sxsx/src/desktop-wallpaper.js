import * as THREE from 'three';

// Code-native desktop art: no video, remote media, autoplay or audio.
export function drawDesktopWallpaper(ctx,width,height,time=0){
  const W=1440,H=862;
  ctx.save();ctx.scale(width/W,height/H);
  const background=ctx.createLinearGradient(0,0,W,H);
  background.addColorStop(0,'#07111d');background.addColorStop(.55,'#102936');background.addColorStop(1,'#061018');
  ctx.fillStyle=background;ctx.fillRect(0,0,W,H);
  const glow=ctx.createRadialGradient(720,400,20,720,400,680);
  glow.addColorStop(0,'#296f7255');glow.addColorStop(.5,'#24545f22');glow.addColorStop(1,'#09121c00');
  ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  // Architectural grid and a restrained moving sweep.
  ctx.strokeStyle='#82d1d50b';ctx.lineWidth=1;
  for(let x=40;x<W;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=22;y<H;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  const sweep=70+(time*16)%1270;
  const scan=ctx.createLinearGradient(sweep-170,0,sweep+20,0);
  scan.addColorStop(0,'#4fe0bb00');scan.addColorStop(.9,'#4fe0bb08');scan.addColorStop(1,'#4fe0bb00');
  ctx.fillStyle=scan;ctx.fillRect(sweep-170,0,190,H);
  // Oversized geometric shield, dark metal surfaces and thin mint edges.
  ctx.save();ctx.translate(720,318);
  ctx.beginPath();ctx.moveTo(0,-151);ctx.lineTo(139,-83);ctx.lineTo(119,85);ctx.lineTo(0,159);ctx.lineTo(-119,85);ctx.lineTo(-139,-83);ctx.closePath();
  const metal=ctx.createLinearGradient(-139,-150,139,160);
  metal.addColorStop(0,'#1c3e4b');metal.addColorStop(.5,'#102630');metal.addColorStop(1,'#06121b');
  ctx.fillStyle=metal;ctx.fill();ctx.strokeStyle='#68cdbf';ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-89,-57);ctx.lineTo(0,-102);ctx.lineTo(89,-57);ctx.lineTo(76,56);ctx.lineTo(0,105);ctx.lineTo(-76,56);ctx.closePath();
  ctx.strokeStyle='#6fd8c052';ctx.lineWidth=1;ctx.stroke();
  ctx.font='700 74px ui-monospace, Menlo, monospace';ctx.fillStyle='#b1eddd';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('>_',0,-2);
  ctx.restore();
  // Quiet circuit routes frame the central emblem.
  ctx.lineWidth=2;ctx.strokeStyle='#68b7b83b';
  for(const side of [-1,1])for(let n=0;n<4;n++){
    const x=720+side*(205+n*43),y=225+n*48;
    ctx.beginPath();ctx.moveTo(720+side*155,y);ctx.lineTo(x,y);ctx.lineTo(x+side*50,y+50);ctx.lineTo(720+side*610,y+50);ctx.stroke();
    ctx.beginPath();ctx.arc(x+side*50,y+50,3,0,Math.PI*2);ctx.fillStyle='#85d7c780';ctx.fill();
  }
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.font='800 112px ui-sans-serif, Arial, sans-serif';ctx.fillStyle='#dbece9';ctx.fillText('S X S X',720,602);
  ctx.font='17px ui-monospace, Menlo, monospace';ctx.fillStyle='#83a7b0';ctx.fillText('SYSTEMS  /  NETWORKS  /  CYBERSECURITY',720,649);
  ctx.strokeStyle='#6ca59f38';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(445,690);ctx.lineTo(995,690);ctx.stroke();
  ctx.font='14px ui-monospace, Menlo, monospace';ctx.fillStyle='#68858e';ctx.textAlign='left';ctx.fillText('SXSX  //  PERSONAL WORKSPACE',66,78);
  ctx.textAlign='right';ctx.fillStyle='#87c9bb';ctx.fillText('FOCUS MODE',1374,78);
  ctx.textAlign='left';ctx.fillStyle='#638790';ctx.fillText('01 / INFRASTRUCTURE',66,802);
  ctx.textAlign='right';ctx.fillStyle='#89c4b8';
  const pulse=.65+.2*Math.sin(time*.7);ctx.globalAlpha=pulse;ctx.fillText('●  SYSTEM READY',1374,802);
  ctx.restore();
}

export function createDesktopWallpaper(){
  const canvas=document.createElement('canvas');
  canvas.width=1440;canvas.height=862;
  const context=canvas.getContext('2d');
  if(!context)throw new Error('Desktop canvas unavailable');
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;
  // Normalize the actual monitor face UVs, not its rounded/beveled edges.
  texture.repeat.set(1/.97241265,1/.93683266);
  texture.offset.set(-.00847148/.97241265,-.02752334/.93683266);
  texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
  texture.generateMipmaps=false;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  drawDesktopWallpaper(context,canvas.width,canvas.height,0);
  let previous=0;
  return {texture,update(time){
    if(reducedMotion || document.hidden || time-previous<1/12)return;
    previous=time;drawDesktopWallpaper(context,canvas.width,canvas.height,time);texture.needsUpdate=true;
  }};
}
