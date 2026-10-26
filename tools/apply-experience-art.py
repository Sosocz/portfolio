"""Place generated portfolio illustrations inside the retained template containers."""
from pathlib import Path
from lxml import html
import re,json,hashlib
root=Path('dist')
def nodes(d,c):return d.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," '+c+' ")]')
assets={
 'mrg-maintenance':{'alt':'Illustration de Sofiane installant une barrette mémoire dans un ordinateur en atelier','position':'48% 50%'},
 'sg-kiosque':{'alt':'Illustration de Sofiane accompagnant une utilisatrice au kiosque de support informatique','position':'48% 50%'},
 'wavestone-av':{'alt':'Illustration de Sofiane préparant la barre de visioconférence d’une salle de réunion à La Défense','position':'62% 45%'}
}
def apply(img,key,hero=False):
 p=f'/assets/experience-art/{key}-v1-'
 img.set('src',p+'960.webp');img.set('srcset',', '.join(p+f'{w}.webp {w}w' for w in [480,960,1536]));img.set('sizes','(max-width: 767px) 90vw, (max-width: 991px) 70vw, 60vw' if hero else '(max-width: 767px) 85vw, 48vw')
 img.set('width','1536');img.set('height','1024');img.set('alt',assets[key]['alt']);img.set('decoding','async');img.set('loading','eager' if hero else 'lazy');img.set('style','object-fit:cover;object-position:'+assets[key]['position'])
 if hero:img.set('fetchpriority','high')
p=root/'off-track/index.html';d=html.fromstring(p.read_text())
hero=nodes(d,'off-t-hero-scroll-meda-img');apply(hero[0],'wavestone-av',True)
# The first panel introduces the timeline, followed by four original template groups.
group='intro';index=0
for panel in nodes(d,'horizontal-item-w'):
 titles=panel.xpath('.//h3')
 if titles:
  title=' '.join(titles[0].text_content().split())
  group='mrg' if 'MRG' in title else 'sg' if 'Société' in title else 'wavestone' if 'Wavestone' in title else 'method';index=0
 images=panel.xpath('.//img')
 for img in images:
  choices={'intro':['mrg-maintenance'],'mrg':['mrg-maintenance',None,None,'mrg-maintenance'],'sg':['sg-kiosque','sg-kiosque',None,None],'wavestone':['wavestone-av','wavestone-av',None,None],'method':['mrg-maintenance',None,'wavestone-av',None]}[group]
  key=choices[min(index,len(choices)-1)]
  if key:apply(img,key)
  index+=1
p.write_text('<!DOCTYPE html>\n'+html.tostring(d,encoding='unicode',method='html'))
# Two fresh scenes in the home carousel, retaining the seven-card template and locations.
p=root/'index.html';text=p.read_text()
for old,key in [('02-helpline-v2','sg-kiosque'),('06-support-reunion-v2','wavestone-av')]:
 pattern=r'<img\b[^>]*src="/assets/character-scenes/'+re.escape(old)+r'-640\.webp"[^>]*>'
 def replace(m):
  img=html.fromstring(m[0]);apply(img,key);img.set('sizes','(max-width: 767px) 224px, (max-width: 991px) 272px, 320px');return html.tostring(img,encoding='unicode',method='html')
 text,n=re.subn(pattern,replace,text);assert n in [0,1]
p.write_text(text)
manifest=[]
for key,info in assets.items():
 files=[]
 for width in [480,960,1536]:
  p=root/f'assets/experience-art/{key}-v1-{width}.webp';files.append({'path':'/'+str(p.relative_to(root)),'width':width,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 manifest.append({'scene':key,'description':info['alt'],'type':'generated conceptual illustration','character_reference':'dist/assets/character/sofiane-footer-v1-1024.webp','files':files})
Path('source-assets/experience-art/manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print('Integrated three original scenes into the experience template and two home carousel images.')
