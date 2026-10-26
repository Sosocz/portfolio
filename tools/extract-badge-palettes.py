from pathlib import Path
from PIL import Image
import numpy as np,json,colorsys
root=Path(__file__).resolve().parents[1];source=root/'dist/assets/certs/survol';out=root/'source-assets/badge-series';result={}
for n in range(1,17):
 ps=list(source.glob(f'cert-{n:02}-*.webp'));ps=[p for p in ps if 'xen' not in p.name];p=ps[0]
 im=Image.open(p).convert('RGB');w,h=im.size
 # Pro Lab palette: the colored title banner, excluding the holographic seal.
 if n in [1,2,3,4]:im=im.crop((int(w*.08),int(h*.23),int(w*.9),int(h*.37)))
 elif n==16:im=im.crop((int(w*.02),int(h*.13),int(w*.98),int(h*.36)))
 pixels=np.asarray(im).reshape(-1,3);mx=pixels.max(1);mn=pixels.min(1);sat=(mx-mn)/np.maximum(mx,1);mask=(sat>.22)&(mx>65)&(mn<210);pixels=pixels[mask]
 # Count 16-step RGB bins, retain source pixel averages, and select distinct hues.
 buckets={}
 for rgb in pixels[::max(1,len(pixels)//100000)]:
  key=tuple((rgb//16).tolist());buckets.setdefault(key,[]).append(rgb)
 ranked=sorted(buckets.values(),key=len,reverse=True);chosen=[]
 for group in ranked:
  rgb=np.asarray(group).mean(0).round().astype(int).tolist();hsv=colorsys.rgb_to_hsv(*(x/255 for x in rgb))
  if all(abs(hsv[0]-c[1][0])>.065 or abs(hsv[2]-c[1][2])>.28 for c in chosen):chosen.append((rgb,hsv,len(group)))
  if len(chosen)==5:break
 result[str(n)]={'source':str(p.relative_to(root)),'colors':[{'rgb':c[0],'hex':'#'+''.join(f'{v:02X}' for v in c[0]),'samples':c[2]} for c in chosen]}
(out/'extracted-palettes.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
