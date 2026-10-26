"""Stage media/documents for all live routes, then apply same-origin references."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
from concurrent.futures import ThreadPoolExecutor
import re,json,hashlib,subprocess,sys,shutil
root=Path('dist'); stage=Path('/workspace/scratch/83bebcd0a5d2/site-media-stage');stage.mkdir(exist_ok=True)
files=[root/'index.html',*root.glob('*/index.html'),*root.glob('assets/*.css')]
own='https://sofiane-portfolio.cosmicvenus18.chatgpt.site'
mapping={x['source']:x['local'] for x in json.loads(Path('source-assets/home-media-manifest.json').read_text())}
urls=set()
class Assets(HTMLParser):
 def handle_starttag(self,tag,attrs):
  d=dict(attrs);keys=['src','srcset','poster','data-src','style','data-video-urls','data-poster-url']
  if tag=='link' and d.get('rel') in ['icon','shortcut icon','apple-touch-icon','stylesheet','preload']:keys+=['href']
  if tag=='meta' and d.get('property',d.get('name','')) in ['og:image','twitter:image']:keys+=['content']
  if tag=='a' and re.search(r'\.(pdf|zip)(?:\?|$)',d.get('href',''),re.I):keys+=['href']
  for k in keys:
   urls.update(re.findall(r'https?://[^\s,\"\x27<>\)]+',d.get(k,'')))
if '--apply' not in sys.argv:
 for p in files:
  txt=p.read_text()
  if p.suffix=='.html':Assets().feed(txt)
  urls.update(re.findall(r'url\([\x27\"]?(https?[^\)\x27\"]+)',txt))
 urls={u for u in urls if not u.startswith(own+'/')}
 pending=sorted(urls-set(mapping))
 def fetch(u):
  ext=Path(urlsplit(u).path).suffix.lower();assert ext in ['.svg','.webp','.png','.jpg','.jpeg','.pdf','.zip'],u
  name=hashlib.sha256(u.encode()).hexdigest()[:16]+ext;p=stage/name
  download_url='https://d3e54v103j8qbb.cloudfront.net/img/image-placeholder.svg' if u.endswith('placeholder.60f9b1840c.svg') else u
  if not p.exists():subprocess.run(['curl','-fsSL','--retry','1','--max-time','40',download_url,'-o',str(p)],capture_output=True,check=True)
  b=p.read_bytes();assert b and not b.lstrip().lower().startswith((b'<!doctype html',b'<html')),u
  if ext=='.pdf':assert b.startswith(b'%PDF-'),u
  if ext=='.svg':assert b'<svg' in b,u
  return u,'/assets/site-media/'+name,len(b)
 with ThreadPoolExecutor(max_workers=8) as pool:
  for i,(u,local,size) in enumerate(pool.map(fetch,pending),1):
   mapping[u]=local
   if i%20==0 or i==len(pending):print('Downloaded',i,'/',len(pending),flush=True)
 (stage/'mapping.json').write_text(json.dumps(mapping,indent=2))
 print('New assets:',len(pending),'bytes:',sum((stage/Path(mapping[u]).name).stat().st_size for u in pending),flush=True)
else:
 mapping=json.loads((stage/'mapping.json').read_text())
 cv='https://sofiane-infra-lab.lovable.app/documents/CV_Sofiane_Ghazal.pdf'
 cv_path=root/'assets/documents/CV_Sofiane_Ghazal.pdf';cv_path.parent.mkdir(exist_ok=True)
 shutil.copyfile(root/mapping[cv].lstrip('/'),cv_path);mapping[cv]='/assets/documents/CV_Sofiane_Ghazal.pdf'
 for p in files:
  text=p.read_text()
  for u,local in sorted(mapping.items(),key=lambda x:-len(x[0])):text=text.replace(u,local)
  if p.suffix=='.html':
   text=re.sub(r'<link\b(?=[^>]*rel="(?:preconnect|dns-prefetch)")(?=[^>]*href="https?://)[^>]*>\s*','',text)
   text=text.replace('content="/assets/','content="'+own+'/assets/')
  if text!=p.read_text():p.write_text(text)
 Path('source-assets/site-media-manifest.json').write_text(json.dumps([{'source':u,**({'download_source':'https://d3e54v103j8qbb.cloudfront.net/img/image-placeholder.svg'} if u.endswith('placeholder.60f9b1840c.svg') else {}),'local':v,'sha256':hashlib.sha256((root/v.lstrip('/')).read_bytes()).hexdigest()} for u,v in mapping.items()],indent=2)+'\n')
 print('Applied local media URLs across all live pages. External profile/verification links retained.')
