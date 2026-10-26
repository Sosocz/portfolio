"""Recolor baked UV atlases, retaining illumination and sharp text (host Python)."""
import sys,json
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
from scipy.ndimage import label
folder=Path(sys.argv[1]);data=json.loads((folder/'masks.json').read_text())
for name,regions in data.items():
 path=folder/(name+'.png');im=Image.open(path).convert('RGBA');rgb=np.asarray(im,dtype=np.float32)/255;out=rgb.copy();color=rgb[:,:,:3];hsv=np.asarray(im.convert('HSV'),dtype=np.float32);h=hsv[:,:,0];sat=hsv[:,:,1]/255
 lum=color[:,:,0]*.2126+color[:,:,1]*.7152+color[:,:,2]*.0722
 # Feather the mint range so baked highlights and colored reflections stay natural.
 weight=np.clip((h-77)/10,0,1)*np.clip((145-h)/10,0,1)*np.clip((sat-.045)/.12,0,1)
 sage=np.clip(np.array([.32,.43,.385],np.float32)[None,None,:]*(lum/.84)[:,:,None],0,1)
 # Classify complete UV islands, so curved surfaces have no triangle-shaped borders.
 surface=Image.new('L',im.size);sd=ImageDraw.Draw(surface)
 if name!='Image_6':
  for poly in regions.get('surfaces',[]):sd.polygon([(u*(im.width-1),(1-v)*(im.height-1))for u,v in poly],fill=255)
 islands,count=label(np.asarray(surface)>0)
 valid=(lum>.03).astype('float32')
 total=np.bincount(islands.ravel(),weights=valid.ravel(),minlength=count+1)
 mint=np.bincount(islands.ravel(),weights=(weight*valid).ravel(),minlength=count+1)
 accepted=(mint/np.maximum(total,1)>.30)&(mint>8);accepted[0]=False
 w=accepted[islands].astype('float32')
 w=np.asarray(Image.fromarray((w*255).astype('uint8')).filter(ImageFilter.MaxFilter(5)),dtype=np.float32)/255
 out[:,:,:3]=color*(1-w[:,:,None])+sage*w[:,:,None]
 for kind in ['cabinet','rug']:
  polys=regions.get(kind,[])
  mask=Image.new('L',im.size);draw=ImageDraw.Draw(mask)
  for poly in polys:draw.polygon([(u*(im.width-1),(1-v)*(im.height-1))for u,v in poly],fill=255)
  mask=mask.filter(ImageFilter.MaxFilter(7));m=np.asarray(mask,dtype=np.float32)/255
  if kind=='cabinet':
   gray=np.clip(np.sqrt(lum)*.96,0,1);new=gray[:,:,None]*np.array([1,.99,.975],np.float32)
  else:
   # Rose poudré, not Kirby pink. Existing black WELCOME lettering is preserved.
   new=np.clip(np.array([.66,.50,.55],np.float32)[None,None,:]*(lum/.85)[:,:,None],0,1)
   dark=lum<.20;new[dark]=color[dark]*.55
  out[:,:,:3]=out[:,:,:3]*(1-m[:,:,None])+new*m[:,:,None]
  if kind=='rug':
   ink=Image.fromarray(((lum<.18)&(m>.9)).astype('uint8')*255).filter(ImageFilter.MaxFilter(7));ink=np.asarray(ink,dtype=np.float32)/255*m
   out[:,:,:3]=out[:,:,:3]*(1-ink[:,:,None])+np.array([.07,.055,.065])*ink[:,:,None]
 # Only the two architectural wall panels use the site's accent mint.
 walls=Image.new('L',im.size);wd=ImageDraw.Draw(walls)
 for poly in regions.get('walls',[]):wd.polygon([(u*(im.width-1),(1-v)*(im.height-1))for u,v in poly],fill=255)
 wm=np.asarray(walls.filter(ImageFilter.MaxFilter(5)),dtype=np.float32)/255*w
 wall_color=np.clip(np.array([56,228,178],dtype=np.float32)[None,None,:]/255*(lum/.84)[:,:,None],0,1)
 out[:,:,:3]=out[:,:,:3]*(1-wm[:,:,None])+wall_color*wm[:,:,None]
 Image.fromarray(np.round(np.clip(out,0,1)*255).astype('uint8'),'RGBA').save(path)
 print('Palette updated:',name,{k:len(v)for k,v in regions.items()})
