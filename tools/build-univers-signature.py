# Build a hand-drawn gestural signature as editable vector ink, not typeset letters.
from pathlib import Path
import math
import numpy as np
from fontTools.svgLib.path import parse_path
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
root=Path(__file__).resolve().parents[1]
# Each entry represents one actual movement of the pen.
gestures=[
('M490 80 C320 -15 86 90 70 235 C50 380 398 168 435 300 C470 435 216 574 44 565',35,0),
('M315 423 C410 285 655 -44 688 4 C735 70 506 403 500 433 C492 475 631 285 677 301 C722 316 594 425 636 431 C690 438 813 246 827 282 C850 342 725 434 748 447 C779 463 910 215 930 268 C955 332 832 435 876 420 C910 406 1012 274 1049 296',28,.8),
('M520 177 C635 222 783 302 974 358',23,1.3),
('M991 293 C1012 183 1144 71 1192 106 C1253 152 1122 349 1062 331 C1000 314 1148 109 1189 133 C1226 155 1126 386 1077 463',29,2),
('M1316 162 C1238 124 1226 61 1300 32 C1393 -5 1431 91 1348 164 C1299 207 1196 237 1204 313 C1214 408 1376 408 1415 322 C1458 229 1255 199 1316 162',29,2.7),
('M640 517 C826 478 1113 414 1485 352 C1320 415 1129 479 976 502',30,3.3)
]
def sample(d):
 pen=RecordingPen();parse_path(d,pen);pts=[];current=None
 for cmd,args in pen.value:
  if cmd=='moveTo':current=np.array(args[0],dtype=float);pts.append(current)
  elif cmd=='curveTo':
   p0=current;p1,p2,p3=[np.array(p,dtype=float) for p in args]
   n=max(20,int((np.linalg.norm(p1-p0)+np.linalg.norm(p2-p1)+np.linalg.norm(p3-p2))/5))
   for t in np.linspace(0,1,n+1)[1:]:pts.append((1-t)**3*p0+3*(1-t)**2*t*p1+3*(1-t)*t*t*p2+t**3*p3)
   current=p3
  elif cmd=='lineTo':current=np.array(args[0],dtype=float);pts.append(current)
 return np.array(pts)
def ink(d,width,phase):
 pts=sample(d);ds=np.linalg.norm(np.diff(pts,axis=0),axis=1);arc=np.r_[0,np.cumsum(ds)];u=arc/arc[-1]
 tangent=np.gradient(pts,axis=0);tangent/=np.maximum(np.linalg.norm(tangent,axis=1)[:,None],1e-9)
 normal=np.column_stack((-tangent[:,1],tangent[:,0]))
 # Natural pressure: long upstrokes are light; downstrokes carry more ink.
 pressure=.57+.32*np.maximum(tangent[:,1],0)+.10*np.sin(u*math.pi*3+phase)
 taper=np.minimum(1,np.minimum(.14+u*19,.10+(1-u)*17))
 radius=width*.5*pressure*taper
 left=pts+normal*radius[:,None];right=pts-normal*radius[:,None]
 outline=np.vstack([left,right[::-1]])
 return 'M'+' L'.join(f'{x:.3f} {y:.3f}' for x,y in outline)+' Z'
angle=math.radians(-23);rot=(math.cos(angle),math.sin(angle),-math.sin(angle),math.cos(angle),0,0)
pen=BoundsPen(None)
for d,_,_ in gestures:parse_path(d,TransformPen(pen,rot))
a,b,c,e=pen.bounds;padding=30;scale=min((1275-2*padding)/(c-a),(798-2*padding)/(e-b));tx=(1275-(c-a)*scale)/2-a*scale;ty=(798-(e-b)*scale)/2-b*scale
m=[n*scale for n in rot[:4]]+[tx,ty]
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1275 798" data-univers-marker="" style="display:block;width:100%;height:100%" role="img" aria-label="Signature personnelle sXsx98"><title>Signature sXsx98</title><defs>']
for i,(d,w,_) in enumerate(gestures):svg.append(f'<mask id="signature-ink-{i}" maskUnits="userSpaceOnUse" x="-100" y="-100" width="1800" height="900"><path d="{d}" data-signature-guide="{i}" fill="none" stroke="white" stroke-width="{w+26}" stroke-linecap="round" stroke-linejoin="round"/></mask>')
svg.append('</defs><g transform="matrix('+ ' '.join(f'{n:.8f}' for n in m)+')" fill="#38E4B2">')
for i,(d,w,phase) in enumerate(gestures):svg.append(f'<path d="{ink(d,w,phase)}" mask="url(#signature-ink-{i})" data-signature-stroke="{i}"/>')
svg.append('</g></svg>');(root/'dist/assets/sxsx98-marker.svg').write_text(''.join(svg))
