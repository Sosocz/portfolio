from pathlib import Path
from lxml import html
import re
root=Path('dist')
def nodes(d,c):return d.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," '+c+' ")]')
scenes={
 'mrg':('/assets/experience-art/mrg-maintenance-v1-','Illustration de Sofiane réalisant une maintenance matérielle en atelier',1536,1024,[480,960,1536],'50% 50%'),
 'sg':('/assets/experience-art/sg-kiosque-v1-','Illustration de Sofiane au kiosque de support informatique',1536,1024,[480,960,1536],'48% 50%'),
 'av':('/assets/experience-art/wavestone-av-v1-','Illustration de Sofiane préparant une salle de visioconférence',1536,1024,[480,960,1536],'68% 45%'),
 'franklin':('/assets/character-scenes/01-franklin-v2-','Illustration de Sofiane devant la Tour Franklin',1086,1448,[360,640,960],'50% 50%'),
 'helpline':('/assets/character-scenes/02-helpline-v2-','Illustration de Sofiane devant HELPLINE',1086,1448,[360,640,960],'50% 50%'),
 'sg-place':('/assets/character-scenes/03-societe-generale-v2-','Illustration du parcours de Sofiane chez Société Générale',1086,1448,[360,640,960],'50% 50%'),
 'study':('/assets/character-scenes/04-etudes-v2-','Illustration de Sofiane révisant les systèmes et réseaux',1086,1448,[360,640,960],'50% 50%'),
 'network':('/assets/character-scenes/05-reseau-v3-','Illustration de Sofiane configurant un switch réseau',941,1672,[360,640,960],'50% 50%'),
 'meeting':('/assets/character-scenes/06-support-reunion-v2-','Illustration de Sofiane testant les équipements d’une salle de réunion',941,1672,[360,640,960],'50% 50%'),
 'lab-network':('/assets/personal-lab/network-','Détail de câblage et de ports réseau',960,960,[480,960,1440],'50% 50%'),
 'lab-code':('/assets/personal-lab/code-','Illustration technique : développement et terminal',960,960,[480,960,1440],'50% 50%'),
 'lab-workstation':('/assets/personal-lab/workstation-','Illustration technique : poste de travail de laboratoire',960,960,[480,960,1440],'50% 50%'),
 'lab-setup':('/assets/personal-lab/setup-','Illustration technique : espace de travail informatique',960,960,[480,960,1440],'50% 50%'),
 'pause':('/assets/character-scenes/07-pause-wavestone-','Illustration de Sofiane pendant une pause chez Wavestone',1086,1448,[360,640,960],'45% 50%')
}
def apply(img,key,social=False,hero=False):
 prefix,alt,w,h,widths,pos=scenes[key];size=640 if social and 640 in widths else 960
 img.set('src',prefix+f'{size}.webp');img.set('srcset',', '.join(prefix+f'{n}.webp {n}w' for n in widths));img.set('alt',alt);img.set('width',str(w));img.set('height',str(h));img.set('decoding','async');img.set('loading','eager' if hero else 'lazy');img.set('fetchpriority','high' if hero else 'low');img.set('style','object-fit:cover;object-position:'+pos)
 img.set('sizes','(max-width: 767px) 224px, (max-width: 991px) 272px, 320px' if social else '(max-width: 767px) 90vw, 50vw')
# Each social carousel now tells a different part of the story.
orders={
 'index.html':['franklin','mrg','sg','study','network','av','pause'],
 'off-track/index.html':['helpline','mrg','sg-place','sg','franklin','av','pause'],
 'on-track/index.html':['network','lab-network','study','lab-code','mrg','lab-workstation','lab-setup']
}
for file,order in orders.items():
 p=root/file;d=html.fromstring(p.read_text());cards=nodes(d,'is-social-card')
 assert len(cards)==len(order),(file,len(cards))
 for img,key in zip(cards,order):apply(img,key,True)
 if file=='index.html':
  section=d.xpath('//section[@data-otot-bottom]')[0];section.set('class','s is-otot-end is-sofiane-transition');section.set('id','parcours-transition');section.set('aria-label','Du terrain au laboratoire : le studio de Sofiane')
  img=section.xpath('.//img')[0];img.set('src','/assets/transitions/studio-v1-1100.webp');img.set('srcset',', '.join(f'/assets/transitions/studio-v1-{w}.webp {w}w' for w in [640,1100,1664]));img.set('sizes','100vw');img.set('width','1664');img.set('height','941');img.set('alt','Illustration panoramique de Sofiane à son bureau, entre environnement professionnel et laboratoire systèmes et réseaux');img.attrib.pop('style',None)
  d.xpath('//*[@data-otot-top]')[0].set('id','experience-labo')
  if not d.xpath('//link[contains(@href,"portfolio-imagery.css")]'):d.find('head').append(html.fromstring('<link rel="stylesheet" href="/assets/portfolio-imagery.css?v=143">'))
 if file=='off-track/index.html':
  group='intro';index=0
  choices={'intro':['franklin'],'mrg':['mrg','helpline','network','study'],'sg':['sg','sg-place','helpline','study'],'wavestone':['av','meeting','franklin','pause'],'method':['network','study','mrg','sg']}
  for panel in nodes(d,'horizontal-item-w'):
   titles=panel.xpath('.//h3')
   if titles:
    t=titles[0].text_content();group='mrg' if 'MRG' in t else 'sg' if 'Société' in t else 'wavestone' if 'Wavestone' in t else 'method';index=0
   for img in panel.xpath('.//img'):
    apply(img,choices[group][index%len(choices[group])]);index+=1
 p.write_text('<!DOCTYPE html>\n'+html.tostring(d,encoding='unicode',method='html'))
print('Balanced home, experience and lab carousels; mapped experience panels; replaced and reframed the pre-certification transition.')
