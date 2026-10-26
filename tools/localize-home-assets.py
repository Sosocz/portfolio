"""Copy the homepage's remaining remote media without changing its appearance."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
from concurrent.futures import ThreadPoolExecutor
import subprocess, re, json, hashlib
root=Path('dist'); home=root/'index.html'; html=home.read_text(); urls=set()
css_files=list((root/'assets').glob('*.css'))
class Assets(HTMLParser):
 def handle_starttag(self, tag, attrs):
  d=dict(attrs)
  keys=['src','srcset','poster','data-src','style']
  if tag=='link' and d.get('rel') in ['shortcut icon','icon','apple-touch-icon','stylesheet','preload']:keys+=['href']
  if tag=='meta' and d.get('property',d.get('name','')) in ['og:image','twitter:image']:keys+=['content']
  for key in keys:
   for u in re.findall(r'https?://[^\s,\"\x27<>\)]+', d.get(key,'')):urls.add(u)
Assets().feed(html)
for text in [html,*[p.read_text() for p in css_files]]:
 urls.update(re.findall(r'url\([\x27\"]?(https?[^\)\x27\"]+)',text))
# The normal WASM is already local; retain the official compatible fallback locally as well.
urls={u for u in urls if not u.startswith('https://sofiane-portfolio.cosmicvenus18.chatgpt.site/')}
urls.add('https://cdn.jsdelivr.net/npm/@rive-app/canvas-lite@2.26.4/rive_fallback.wasm')
mapping={}
def download(u):
 ext=Path(urlsplit(u).path).suffix
 assert ext in ['.webp','.png','.jpg','.jpeg','.svg','.wasm'],u
 target=root/'assets'/'home-media'/(hashlib.sha256(u.encode()).hexdigest()[:16]+ext)
 target.parent.mkdir(parents=True,exist_ok=True)
 subprocess.run(['curl','-fsSL','--retry','1','--max-time','40',u,'-o',str(target)],check=True,capture_output=True)
 assert target.stat().st_size>0
 return u,'/'+str(target.relative_to(root)),target.stat().st_size
with ThreadPoolExecutor(max_workers=8) as pool:
 for u,local,size in pool.map(download,sorted(urls)):
  mapping[u]=local;print(local,size,flush=True)
for p in [home,*css_files]:
 text=p.read_text()
 for u,local in sorted(mapping.items(),key=lambda x:-len(x[0])):text=text.replace(u,local)
 if p==home:
  text=re.sub(r'<link\b(?=[^>]*rel="(?:preconnect|dns-prefetch)")(?=[^>]*href="https?://)[^>]*>\s*','',text)
  text=text.replace('content="/assets/home-media/','content="https://sofiane-portfolio.cosmicvenus18.chatgpt.site/assets/home-media/')
  # Social cards require an absolute image URL; it now points at this portfolio.
  text=re.sub(r'(<meta\b[^>]*(?:property|name)="(?:og:image|twitter:image)"[^>]*content=")(/assets/[^\"]+)',r'\1https://sofiane-portfolio.cosmicvenus18.chatgpt.site\2',text)
 if text!=p.read_text():p.write_text(text)
p=root/'lando-custom.js';text=p.read_text().replace('pR="https://assets.itsoffbrand.io/lando/rive/"','pR="/assets/"')
old='"https://cdn.jsdelivr.net/npm/".concat(C.name,"@").concat(C.version,"/rive_fallback.wasm")'
assert old in text;text=text.replace(old,json.dumps(mapping['https://cdn.jsdelivr.net/npm/@rive-app/canvas-lite@2.26.4/rive_fallback.wasm']));p.write_text(text)
# Invalidate the shared stylesheet/runtime consistently on every route that uses them.
for p in [home,*root.glob('*/index.html')]:
 text=p.read_text()
 for asset in ['assets/portfolio-layout.css','lando-custom.js']:
  digest=hashlib.sha256((root/asset).read_bytes()).hexdigest()[:12]
  text=re.sub(re.escape(asset)+r'(?:\?v=[^"\s]+)?',asset+'?v='+digest,text)
 if text!=p.read_text():p.write_text(text)
Path('source-assets/home-media-manifest.json').write_text(json.dumps([{'source':u,'local':v,'sha256':hashlib.sha256((root/v.lstrip('/')).read_bytes()).hexdigest()} for u,v in mapping.items()],indent=2)+'\n')
print('Localized',len(mapping),'homepage media/CSS/fallback files',flush=True)
