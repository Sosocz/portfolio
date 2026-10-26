"""Restore the retained template layouts using local resources and portfolio content."""
from pathlib import Path
from lxml import html, etree
from copy import deepcopy
import subprocess,re,hashlib,base64
root=Path('dist'); home=html.fromstring((root/'index.html').read_text())
def cls(d,c): return d.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," '+c+' ")]')
def settext(e,text):
 for ch in list(e):e.remove(ch)
 e.text=text

def fragment(e,content):
 for ch in list(e):e.remove(ch)
 e.text=None
 for ch in html.fragments_fromstring(content):
  if isinstance(ch,str):e.text=(e.text or '')+ch
  else:e.append(ch)
nav=cls(home,'nav')[0];footer=cls(home,'is-footer')[0];social=cls(home,'is-callout-socials')[0]
policy=home.xpath('//meta[@http-equiv="Content-Security-Policy"]')[0]
scenes=sorted((root/'assets/character-scenes').glob('*-960.webp'))
for route in ['on-track','off-track','calendar']:
 raw=subprocess.check_output(['git','show',f'0ee7cb2:dist/{route}/index.html']).decode();d=html.fromstring(raw)
 # Current shared navigation and footer, in the retained template structure.
 n=cls(d,'nav')[0];n.getparent().replace(n,deepcopy(nav))
 for old in cls(d,'is-footer'): old.getparent().replace(old,deepcopy(footer))
 for old in cls(d,'is-callout-socials'):old.getparent().replace(old,deepcopy(social))
 for x in d.xpath('//comment()'):
  if x.getparent() is not None:x.getparent().remove(x)
 for attr in ['data-wf-domain','data-wf-site','data-wf-page']:d.attrib.pop(attr,None)
 head=d.find('head');head.insert(0,deepcopy(policy));head.insert(1,html.fromstring('<meta name="referrer" content="no-referrer">'))
 for s in d.xpath('//script[@src]'):
  src=s.get('src');src=src.replace('/lando-custom.js?v=restored-room-136','/portfolio-runtime.js?v=141');s.set('src',src)
  if src.startswith('//') or re.match('https?://',src) or not (root/src.split('?')[0].lstrip('/')).is_file():s.getparent().remove(s);continue
  if 'integrity' in s.attrib:s.set('integrity','sha384-'+base64.b64encode(hashlib.sha384((root/src.split('?')[0].lstrip('/')).read_bytes()).digest()).decode())
 for s in d.xpath('//script[not(@src)]'):
  if any(x in (s.text or '') for x in ['_iub','klaviyo','googletag','google-analytics','dataLayer','WebFont','analytics','webflow.io']):s.getparent().remove(s)
 for x in d.xpath('//link[@rel="canonical"]'):x.getparent().remove(x)
 head.append(html.fromstring(f'<link rel="canonical" href="https://sofiane-portfolio.cosmicvenus18.chatgpt.site/{route}/">'))
 for x in d.xpath('//link[@rel="shortcut icon" or @rel="apple-touch-icon"]'):x.set('href','/assets/sofiane-icon.png')
 # Replace all source signatures with the portfolio SVG signature.
 for x in d.xpath('//canvas[@data-rive-file="signature"]'):
  x.getparent().replace(x,html.fromstring('<img src="/assets/sxsx-signature.svg" alt="Signature sXsx" style="width:100%;height:100%;object-fit:contain">'))
 view=d.xpath('//*[@data-taxi-view]')[0]
 if route=='off-track':
  title=view.xpath('.//h1')[0];fragment(title,'<span class="text-on-t-hero-heading-mona margin">EXP.</span>PRO')
  for x in cls(view,'text-quote'):
   settext(x,'Sofiane Ghazal' if 'Lando' in x.text_content() else 'Systèmes & réseaux')
  for x in cls(view,'text-eyebrow'):
   t=x.text_content().strip()
   replacements={'bringing the fight':'SUPPORT · INFRASTRUCTURE · VISIOCONFÉRENCE','mclaren f1 since 2019':'SUR LE TERRAIN DEPUIS 2025',"When he's away from the track, Lando stays active by playing padel.":'MRG Tech · Bezons · janvier à août 2025','follow lando.jpg':'HELPLINE · MISSION SOCIÉTÉ GÉNÉRALE','with nathan sawaya':'HELPLINE · MISSION WAVESTONE','2006–current':'≈ 80 SALLES · EN AUTONOMIE'}
   if t in replacements:settext(x,replacements[t])
   elif t in ['Miami, 2024','Singapore, 2024','Monaco, 2023','London, 2024','Miami, 2023','australia, 2024','Australia, 2024','Australia 2024']:settext(x,'SYSTÈMES · RÉSEAUX · SUPPORT')
  for x in cls(view,'text-body-lg-mona'):
   if 'Since his F1' in x.text_content():fragment(x,'Technicien <span class="text-body-lg-brier c-green-off-white-2">systèmes et réseaux</span>, je maintiens les équipements, résous les incidents et accompagne les utilisateurs au quotidien.')
   elif 'Challenging' in x.text_content():settext(x,'Diagnostiquer, résoudre, documenter. Un service fiable, au quotidien.')
  for x in view.xpath('.//*[contains(@class,"text-impact-lg-mona")]'):
   if 'Challenging' in x.text_content():fragment(x,'Diagnostiquer.<br><strong>Résoudre.</strong><br>Documenter.')
  for x in cls(view,'text-descriptor'):
   if 'follow lando' in x.text_content():settext(x,'HELPLINE · MISSION SOCIÉTÉ GÉNÉRALE')
  for x in cls(view,'text-body-sm-mona'):
   if 'Recently' in x.text_content():settext(x,'MRG Tech de janvier à août 2025, puis HELPLINE : Société Générale de septembre à décembre 2025 et Wavestone depuis décembre 2025. Support N1/N2, maintenance et visioconférence.')
  for x in view.xpath('.//h2|.//h3'):
   t=' '.join(x.text_content().split()).lower()
   if 'personal' in t:fragment(x,'Expériences<span class="text-title-lg-brier">professionnelles</span>')
   elif 'padel' in t:settext(x,'MRG Tech')
   elif 'photography' in t:fragment(x,'Société<span class="text-title-reg-brier">Générale</span>')
   elif 'lego' in t:fragment(x,'Wavestone<span class="text-title-reg-brier">IT & visio</span>')
   elif 'mastering' in t:fragment(x,'Méthode<span class="text-title-reg-brier">& autonomie</span>')
  summaries=['Support systèmes et réseaux, maintenance des postes Windows et diagnostic des incidents matériels et logiciels.','Support N1/N2 en kiosque IT : assistance utilisateurs, Active Directory, Intune et environnement Microsoft.','Gestion autonome d’environ 80 salles de réunion : maintien en condition opérationnelle, Teams Rooms, Logitech Sync et suivi Jira.','Observer les symptômes, réaliser les tests, résoudre ou escalader, puis documenter la solution et son suivi.']
  for i,x in enumerate(cls(view,'horizontal-item-text')):settext(x,summaries[min(i,3)])
  # Retain original image containers/scroll geometry, populate them with Sofiane's media.
  for i,x in enumerate([x for x in view.xpath('.//img') if '/site-media/' in x.get('src','')]):
   x.set('src','/'+str(scenes[i%len(scenes)]).removeprefix('dist/'));x.attrib.pop('srcset',None);x.set('alt','Sofiane : systèmes, réseaux et support en entreprise')
  for a in view.xpath('.//a'):
   if any(v in a.get('href','') for v in ['instagram','landonorris','tiktok','twitch','youtube']):a.set('href','/projets/')
  titletext='Expérience professionnelle | Sofiane Ghazal';description='MRG Tech, Société Générale et Wavestone : support N1/N2, systèmes, réseaux et visioconférence.'
 elif route=='calendar':
  group=cls(view,'s-group')[0];hero=deepcopy(cls(view,'is-calendar-hero')[0]);result=[x for x in group.xpath('.//section') if 'All Results' in x.text_content()][0];result=deepcopy(result)
  for x in list(view):view.remove(x)
  group=etree.SubElement(view,'div',{'class':'s-group z-10'});group.append(hero);group.append(result);group.append(deepcopy(footer))
  fragment(hero.xpath('.//h1')[0],'Mon parcours<br><span class="text-impact-lg-brier c-grey-on-track">& formations</span>')
  fragment(result.xpath('.//h2')[0],'<span>Formation</span><span class="text-title-lg-brier c-grey-on-track">& progression</span>')
  for p in result.xpath('.//p'):settext(p,'Des bases en gestion à l’infrastructure et à la cybersécurité : apprendre, appliquer et documenter.')
  collection=cls(result,'f1-highlight-collection-w')[0]
  for ch in list(collection):collection.remove(ch)
  rows=[('01','Baccalauréat STMG','2021–2022','Gestion & finance','Lycée Eugène Delacroix'),('02','Licence AES','2023–2024','Économie & société','Université Paris 8'),('03','BTS SIO · SISR','2023–2025','Systèmes & réseaux','Lycée Jean-Jacques Rousseau'),('04','Bachelor cybersécurité','2025–2026','Titre de niveau 6','EPITA'),('05','Cycle ingénieur IRSM','À venir','Réseaux · systèmes','CNAM · CYC9104A')]
  for values in [('ÉTAPE','FORMATION','PÉRIODE','DOMAINE','ÉTABLISSEMENT'),*rows]:
   row=etree.SubElement(collection,'div',{'class':'f1-highlight-grid top' if values[0]=='ÉTAPE' else 'f1-highlight-grid is-previous w-dyn-item'})
   for index,value in enumerate(values):
    cell=etree.SubElement(row,'div',{'class':'f1-highlight-grid-item'});
    if index in (3,4):cell.set('data-hide','m')
    text=etree.SubElement(cell,'div',{'class':'text-eyebrow c-grey-on-track' if values[0]=='ÉTAPE' else 'text-on-t-stat-label-reg'});text.text=value
   if values[0]!='ÉTAPE':etree.SubElement(row,'div',{'class':'f1-highlight-grid-line'})
  titletext='Formation & parcours | Sofiane Ghazal';description='Le parcours de formation de Sofiane Ghazal, du BTS SIO SISR au Bachelor cybersécurité, et son projet de cycle ingénieur CNAM.'
 else:
  titletext='Laboratoire cybersécurité | Sofiane Ghazal';description='Laboratoires systèmes et réseaux, Hack The Box, Root-Me, HTB Academy et notes de résolution de Sofiane Ghazal.'
  h=view.xpath('.//h1')[0];settext(h,'Laboratoire cybersécurité')
  # Preserve all original stats/certification content, adapt remaining generic labels.
 for x in d.xpath('//title'):settext(x,titletext)
 for x in d.xpath('//meta[@name="description" or @property="og:description" or @name="twitter:description"]'):x.set('content',description)
 for x in d.xpath('//meta[@property="og:title" or @name="twitter:title"]'):x.set('content',titletext)
 for x in d.xpath('//meta[@property="og:image" or @name="twitter:image"]'):x.set('content','https://sofiane-portfolio.cosmicvenus18.chatgpt.site/assets/sofiane-og.png')
 for x in d.xpath('//*[@src or @href]'):
  for attr in ['src','href']:
   if (x.get(attr) or '').startswith('assets/'):x.set(attr,'/'+x.get(attr))
 for x in d.xpath('//a[@href="/assets/documents/CV_Sofiane_Ghazal.pdf"]'):x.set('href','/assets/documents/CV_Sofiane_Ghazal.pdf?v=137')
 head.append(html.fromstring('<script src="/assets/home-signature.js?v=afb93b73fbb5" defer></script>'))
 (root/route/'index.html').write_text('<!DOCTYPE html>\n'+html.tostring(d,encoding='unicode',method='html'))
 print('Restored template:',route)
