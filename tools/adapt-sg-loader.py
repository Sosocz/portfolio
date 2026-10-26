# Adapt the original Rive export without altering its state machines or easing curves.
# Run: python tools/adapt-sg-loader.py
from pathlib import Path
import re,struct
root=Path(__file__).resolve().parents[1]
field={13: 'Double', 7: 'Double', 8: 'Double', 494: 'Uint', 4: 'String', 5: 'Id', 14: 'Double', 16: 'Double', 17: 'Double', 197: 'Uint', 198: 'Uint', 237: 'Uint', 92: 'Id', 128: 'Uint', 32: 'Bool', 24: 'Double', 25: 'Double', 86: 'Double', 87: 'Double', 84: 'Double', 85: 'Double', 37: 'Color', 613: 'Uint', 614: 'Uint', 615: 'Uint', 616: 'Uint', 617: 'Uint', 618: 'Uint', 619: 'Uint', 620: 'Uint', 625: 'Uint', 626: 'Uint', 63: 'Double', 65: 'Double', 64: 'Double', 55: 'String', 57: 'Uint', 51: 'Id', 53: 'Uint', 68: 'Uint', 69: 'Id', 70: 'Double', 67: 'Uint', 138: 'String', 149: 'Id', 392: 'Uint', 151: 'Id', 152: 'Uint', 160: 'Uint', 155: 'Id', 224: 'Uint', 225: 'Uint', 399: 'Uint', 227: 'Uint', 228: 'Uint', 236: 'Uint', 26: 'Double', 115: 'Double', 117: 'Uint', 299: 'Double', 301: 'Uint', 47: 'Double', 49: 'Uint', 66: 'Double', 88: 'Color', 59: 'Uint', 60: 'Uint', 61: 'Uint', 62: 'Bool', 292: 'Double'}
types={}
b=(root/'source-assets/page-transition-original.riv').read_bytes();p=4

def var():
 global p
 v=0;s=0
 while True:
  n=b[p];p+=1;v|=(n&127)<<s
  if not n&128:return v
  s+=7
print('header',var(),var(),var());toc=[]
while True:
 k=var()
 if k==0:break
 toc.append(k)
for i in range(0,len(toc),4):
 bits=struct.unpack_from('<I',b,p)[0];p+=4
 for q,k in enumerate(toc[i:i+4]):field[k]=['Uint','String','Double','Color'][(bits>>(q*2))&3]
header=b[:p];objects=[]
try:
 while p<len(b):
  start=p;t=var();o={'type':t,'name':types.get(t,'?'),'props':{},'start':start,'rawprops':{}}
  while True:
   k=var()
   if not k:break
   a=p;f=field.get(k)
   if f in ['Uint','Id','Int']:v=var()
   elif f=='String':size=var();v=b[p:p+size].decode();p+=size
   elif f=='Double':v=struct.unpack_from('<f',b,p)[0];p+=4
   elif f=='Color':v=struct.unpack_from('<I',b,p)[0];p+=4
   elif f=='Bool':v=bool(b[p]);p+=1
   else:raise Exception(f'unknown field {k} type {t} at {p}')
   o['props'][k]=v;o['rawprops'][k]=[a,p];
  o['end']=p;objects.append(o)
except Exception as e:print('ERR',e)
from copy import deepcopy
original=deepcopy(objects)
svg=(root/'dist/assets/sg-logo.svg').read_text()
contours=[]
for d in re.findall(r'<path\b[^>]*d="([^"]+)"',svg):
 pts=[]
 for cmd,x,y in re.findall(r'([ML])\s*(-?[\d.]+)[ ,]+(-?[\d.]+)',d):pts.append((float(x),float(y)))
 contours.append(pts)
assert len(contours)==2 and all(len(c)>30 for c in contours)
def vu(n):
 out=bytearray()
 while n>127:out.append((n&127)|128);n>>=7
 out.append(n);return bytes(out)
def encode(t,props):
 out=vu(t)
 for k,v in props.items():
  f=field[k];out+=vu(k)
  if f in ('Uint','Id','Int'):out+=vu(v)
  elif f=='Double':out+=struct.pack('<f',v)
  elif f=='Color':out+=struct.pack('<I',v)
  elif f=='Bool':out+=bytes([bool(v)])
  elif f=='String':q=v.encode();out+=vu(len(q))+q
 return out+b'\0'
changes={};extra1=[];extra2=[]
def replace_path(begin,end,pathid,pts,extra):
 old=[i for i in range(begin,end) if objects[i]['type'] in (5,6) and objects[i]['props'].get(5)==pathid]
 assert old
 for n,i in enumerate(old):
  x,y=pts[min(n,len(pts)-1)];changes[i]=encode(5,{5:pathid,24:x,25:y})
 for x,y in pts[len(old):]:extra.append(encode(5,{5:pathid,24:x,25:y}))
def coords(pts,scale,ox=0,oy=0):return [((x-15.5)*scale-ox,(y-17)*scale-oy) for x,y in pts]
# Two contours connected with a zero-area bridge retain a single Rive path.
joined=contours[0]+[contours[0][0]]+contours[1]+[contours[1][0],contours[0][0]]
for pathid in (15,42):replace_path(0,78,pathid,coords(joined if pathid==15 else list(reversed(joined)),90/34),extra1)
# Original two independently drawn strokes and their clipping silhouettes.
replace_path(213,304,26,coords(contours[1],23.5,146.1518440246582,75.24667072296143),extra2)
replace_path(213,304,57,coords(contours[0],23.5,-174.8483648300171,-19.98827075958252),extra2)
gline=[(27.5,6.34),(18.3,6.34),(12.9,31.75),(22.0,31.75),(24.5,21.25),(20.2,21.25)]
sline=[(13.3,2.25),(8.99,2.25),(5.9,14.95),(10.7,14.95),(7.7,27.64),(3.1,27.64)]
replace_path(213,304,7,coords(gline,23.5,141.83202958106995,100.35672569274902),extra2)
replace_path(213,304,16,coords(sline,23.5,-138.3431568145752,-77.20852088928223),extra2)
for i,o in enumerate(objects):
 props=o['props'].copy();changed=False
 for k,v in props.items():
  if field[k]=='Color':
   if v==0xffd2ff00:props[k]=0xff38e4b2;changed=True
   elif v==0xff282c20:props[k]=0xff23252b;changed=True
 # The larger magnification covers the viewport through SG's narrower stroke.
 if i<213 and o['type']==30 and abs(props.get(70,0)-63.4)<.001:props[70]=300.;changed=True
 if i==215:props[14]=45.;changed=True
 if i in (295,296):props[47]=23.5*5.1;changed=True
 if i in (226,234):props[115]=1.;changed=True
 if i>=304 and o['type']==30 and 70 in props:
  if any(abs(props[70]-v)<.0001 for v in (.9575,.96,.9325,.935)):props[70]=1.;changed=True
  elif abs(props[70]-.0775)<.0001:props[70]=0.;changed=True
 if changed:changes[i]=encode(o['type'],props)
parts=[header]
for i,o in enumerate(objects):
 if i==78:parts.extend(extra1)
 if i==304:parts.extend(extra2)
 parts.append(changes.get(i,b[o['start']:o['end']]))
p=root/'dist/assets/sg-page-transition.riv';p.write_bytes(b''.join(parts))
print('Adapted Rive:',p.stat().st_size,'bytes; original animation records retained; appended SG vertices:',len(extra1),len(extra2))
