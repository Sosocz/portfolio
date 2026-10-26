"""Check the shared grid, preserved metadata, responsive images and bounded edit."""
from pathlib import Path
from PIL import Image
import json,re,subprocess,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1];src=root/'source-assets/badge-series';catalog=json.loads((src/'catalog.json').read_text());h=(root/'dist/index.html').read_bytes();old=subprocess.check_output(['git','show','HEAD:dist/index.html'],cwd=root)
assert len(catalog)==16 and [a['n'] for a in catalog]==list(range(1,17))
for a in catalog:
 n=a['n'];svg=ET.parse(src/f'badge-{n:02}.svg').getroot();assert int(svg.attrib['data-title-size'])==a.get('title_size',104);assert svg.attrib['data-subtitle-size']=='65';assert svg.attrib['data-badge-slot']=='1240,140,285,300'
 labels=[e.attrib['aria-label'] for e in svg.iter() if 'aria-label' in e.attrib]
 for label in a['title']+[a['subtitle'],'SOFIANE GHAZAL','CERTIFIÉ '+str(a['year']),f'N° {n:02} / 16']:
  assert label in labels,(n,label)
 if a.get('id'):assert a['id'] in labels
 if a.get('date'):assert 'ÉMIS LE '+a['date'] in labels
 artwork=(src/f'badge-{n:02}.svg').read_text()
 assert all(c in artwork for c in a['palette'])
 assert artwork.count('id="palette-glow-')==len(a['palette']) and 'id="digital-art"' in artwork
 for w in [640,1120,1630]:
  p=root/f'dist/assets/certs/color-series/badge-{n:02}-{w}.webp';im=Image.open(p);assert im.size==(w,round(w*965/1630));assert im.format=='WEBP';assert f'assets/certs/color-series/badge-{n:02}-{w}.webp'.encode() in h
original_pattern=rb'<img\b[^>]*src="assets/certs/color-series/badge-\d\d-1120.webp"[^>]*>'
new_pattern=rb'<img\b[^>]*src="assets/certs/color-series/badge-\d\d-1120.webp"[^>]*>'
assert len(re.findall(new_pattern,h))==16
before=re.sub(original_pattern,b'CARD',old)
after=re.sub(new_pattern,b'CARD',h)
before=before.replace(b'alt="HTB Wanderer \xe2\x80\x94 badge de Sofiane"',b'alt="Microsoft Security Operations Analyst Associate SC-200 \xe2\x80\x94 badge de Sofiane"')
before=before.replace(b'assets/certs/survol/cert-16-microsoft-sc200-survol.webp',b'assets/certs/hover-blur/certificate-hover-16-microsoft.svg')
before=before.replace(b'alt="Certificat HTB Wanderer de Sofiane Ghazal"',b'alt="Certificat Microsoft Security Operations Analyst Associate de Sofiane Ghazal"')
before=before.replace(b'<h3 class="text-title-small-label text"><a href="assets/certs/documents/microsoft-security-operations-analyst-sc200.pdf" target="_blank" rel="noopener" aria-label="Ouvrir le certificat Microsoft SC-200 en PDF" style="color:inherit;text-decoration:none">Microsoft SC-200 \xe2\x86\x97</a></h3>',b'<h3 class="text-title-small-label text">Microsoft SC-200</h3>')
assert before==after,'Unrelated HTML modified'
assert (root/'dist/assets/certs/documents/microsoft-security-operations-analyst-sc200.pdf').is_file()
hover=ET.parse(root/'dist/assets/certs/hover-blur/certificate-hover-16-microsoft.svg').getroot()
assert hover.attrib['width']=='1000' and hover.attrib['height']=='1010'
assert any(e.tag.endswith('feGaussianBlur') for e in hover.iter())
assert b'assets/certs/documents/microsoft-security-operations-analyst-sc200.pdf' not in h
assert len({(src/f'cisco-{n:02}.webp').read_bytes() for n in range(7,14)})==7
assert all(catalog[n-1]['art']==f'cisco-{n:02}' for n in range(7,14))
assert catalog[4]['art']=='fortinet-05' and catalog[13]['art']=='fortinet-14'
assert (src/'fortinet-05.webp').read_bytes()!=(src/'fortinet-14.webp').read_bytes()
assert catalog[2]['title_size']>catalog[1]['title_size']>catalog[0]['title_size']
assert all(c.startswith(('#0','#1','#2','#3')) for c in catalog[15]['palette'])
print('PASS: 16 badges; optical title sizes and clean type; 2 distinct Fortinet scenes; 7 distinct Cisco scenes; Microsoft hover; 48 responsive assets.')
