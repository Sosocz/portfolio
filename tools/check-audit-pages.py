from pathlib import Path
from lxml import html
from urllib.parse import urlsplit,unquote
import re
r=Path(__file__).resolve().parents[1]/'dist';count=0
for p in r.rglob('*.html'):
 s=p.read_text();t=html.fromstring(s)
 if '<html' not in s.lower():continue
 policy=t.xpath('//meta[@http-equiv="Content-Security-Policy"]/@content')[0]
 scripts=policy.split('script-src ',1)[1].split(';',1)[0]
 assert "'unsafe-inline'" not in scripts and "'unsafe-eval'" not in scripts,p
 assert not t.xpath('//script[not(@src) and not(@type="application/ld+json")]'),p
 assert not t.xpath('//*[@onclick or @onload or @onerror]'),p
 if p.name=='index.html' and p.parent.name in ['dist','on-track','off-track','calendar','projets']:
  assert t.get('lang')=='fr',p
  assert t.xpath('//*[@id="portfolio-main"]'),p
  if p.parent.name!='projets':assert t.xpath('//a[@href="/mentions-legales/"]'),p
  for e in t.xpath('//a[@href="/projets" or @href="/projets/"]'):assert 'data-taxi-ignore' in e.attrib,p
  for e in t.xpath('//a[@target="_blank"]'):assert 'noopener' in e.get('rel',''),p
 for e in t.xpath('//*[@href]'):
  u=urlsplit(e.get('href'))
  if u.scheme or u.netloc:continue
  f=r/unquote(u.path).lstrip('/') if u.path.startswith('/') else p.parent/unquote(u.path)
  if not u.path:f=p
  if f.is_dir() or not f.suffix:f=f/'index.html'
  assert f.exists(),(p,e.get('href'))
  if u.fragment and f.suffix=='.html':assert html.fromstring(f.read_text()).xpath('//*[@id=$key or @name=$key]',key=unquote(u.fragment)),(p,e.get('href'))
 count+=1
for page in ['index.html','off-track/index.html','on-track/index.html','calendar/index.html']:
 t=html.fromstring((r/page).read_text());assert not t.xpath('//canvas[@data-rive-ln4 or @data-rive-file="reef" or @data-rive-artboard="race-day"]');assert not t.xpath('//a[@href="#" and contains(.,"MENTIONS")]');assert 'google_tags_first_party' not in (r/page).read_text()
assert 'noindex' not in (r/'calendar/index.html').read_text()
# Keep original backgrounds, interactive camera, quality settings, and all template hooks.
s=(r/'portfolio-runtime.js').read_text();assert 'new RQ({canvas:"canvas.gl"})' in s and 'portfolio-no-legacy-3d' not in s
room=(r/'chambre-sxsx/assets/interactive-room-Chi5jqhe.js').read_text();assert 'Math.min(devicePixelRatio,2)' in room and 'antialias:!0' in room and 'multiplyScalar(1.02)' in room
print(f'PASS: {count} documents; strong script CSP, no executable inline scripts or event handlers, internal links and anchors valid, native Projects navigation, French/indexable Formation, no displayed sports Rive, background and 3D render quality preserved.')
