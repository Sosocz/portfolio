"""Compose every badge from one grid. All type is outlined from one font family.
Generated illustrations are separate from fixed logos, typography and authentic emblems.
Run this script, then tools/render-badge-series.cjs to rebuild optimized web assets.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
import re,base64,json,math,html,io
from PIL import Image
from functools import lru_cache
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'source-assets/badge-series'
FONTS={k:TTFont(SOURCE/('NimbusSans-'+v+'.otf')) for k,v in [('bold','Bold'),('regular','Regular')]}
GLYPHS={k:f.getGlyphSet() for k,f in FONTS.items()}
LAYOUT={'width':1630,'height':965,'titleSize':104,'titleX':115,'titleBaselines':[465,580],'subtitleSize':65,'subtitleY':690,'ownerSize':43,'ownerY':843,'badgeSlot':[1240,140,285,300],'logoSlot':[115,150,680,160]}
COLORS={'cisco':'#00BCEB','htb':'#9FEF00','fortinet':'#EE3124','oracle':'#F80000','microsoft':'#3B9ADD'}
ALL=json.loads((SOURCE/'catalog.json').read_text())
@lru_cache(maxsize=40)
def uri(path,mime):
 buffer=io.BytesIO();Image.open(path).save(buffer,format='PNG')
 return 'data:image/png;base64,'+base64.b64encode(buffer.getvalue()).decode()
def width(text,size,weight='regular'):
 f=FONTS[weight];cm=f.getBestCmap();return sum(f['hmtx'][cm.get(ord(c),'space')][0] for c in text)*size/f['head'].unitsPerEm

def text(label,x,y,size,weight='regular',fill='#eeeeee',anchor='start',emboss=False):
 f=FONTS[weight];gs=GLYPHS[weight];cm=f.getBestCmap();scale=size/f['head'].unitsPerEm
 if anchor=='end':x-=width(label,size,weight)
 if anchor=='middle':x-=width(label,size,weight)/2
 paths=[];advance=0
 for ch in label:
  name=cm.get(ord(ch),'space');pen=SVGPathPen(gs);gs[name].draw(pen);d=pen.getCommands()
  if d:paths.append(f'<path transform="translate({advance} 0)" d="{d}"/>')
  advance+=f['hmtx'][name][0]
 attrs=' stroke="#cfd4da" stroke-width="1.2" paint-order="stroke fill"' if emboss else ''
 return f'<g aria-label="{html.escape(label,quote=True)}" transform="translate({x:.3f} {y}) scale({scale:.8f} {-scale:.8f})" fill="{fill}"{attrs}>'+''.join(paths)+'</g>'

def logo(brand,color):
 if brand=='microsoft':
  squares=''.join(f'<rect x="{x}" y="{y}" width="52" height="52" fill="{c}"/>' for x,y,c in [(115,174,'#f25022'),(170,174,'#7fba00'),(115,229,'#00a4ef'),(170,229,'#ffb900')])
  return '<g>'+squares+text('Microsoft',242,266,90,'regular','#f0f3f6')+'</g>'
 if brand=='htb':
  cube='<path d="M0 40 70 0 140 40 140 120 70 160 0 120Z M0 40 70 80 140 40 M70 80V160" fill="none" stroke="'+color+'" stroke-width="11" stroke-linejoin="round"/>'
  return '<g transform="translate(118 146)">'+cube+'</g>'+text('HACK',295,210,58,'bold',color,emboss=True)+text('THE BOX',295,275,58,'bold',color,emboss=True)
 path=ROOT/f'dist/assets/footer-tech/{brand}.svg';s=path.read_text(encoding='utf-8-sig');s=s[s.index('<svg'):];s=re.sub(r'<\?xml.*?\?>','',s)
 s=s.replace('#38E4B2',color)
 s=re.sub(r'<metadata>.*?</metadata>','',s,flags=re.S)
 # All logos occupy the same header slot; aspect ratio is preserved.
 if brand=='cisco':x,y,w,h=115,155,250,132
 else:x,y,w,h=115,174,625,100
 s=re.sub(r'<svg\b',f'<svg x="{x}" y="{y}"',s,count=1)
 s=re.sub(r'\bwidth=[\"\x27][^\"\x27]+[\"\x27]',f'width="{w}"',s,count=1)
 s=re.sub(r'\bheight=[\"\x27][^\"\x27]+[\"\x27]',f'height="{h}"',s,count=1)
 if brand!='cisco':s=s.replace('<svg ',f'<svg fill="{color}" ',1)
 if brand=='fortinet':s=re.sub(r'fill:\s*#[0-9a-fA-F]+',f'fill:{color}',s)
 extra=''
 if brand=='cisco':extra='<path d="M400 151V296" stroke="#babfc5" stroke-width="2"/>'+text('Networking',434,210,48)+text('Academy',434,270,48)
 return '<g>'+s+'</g>'+extra

def mesh(color):
 # Two crossing line families form the exact same fine woven ribbon on every card.
 parts=[]
 def curve(points):return '<polyline points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in points)+'"/>'
 def bottom(u,v):return 60+1510*u,867+v*25+13*math.sin(u*math.pi*13+v*2)
 def left(u,v):return 45+v*22+12*math.sin(u*math.pi*8+v*2),65+815*u
 def corner(u,v):return 62+465*u,45+(1-u)*(v*30+22*math.sin(u*math.pi*4+v*2))
 for fn in [bottom,left,corner]:
  for j in range(17):parts.append(curve([fn(k/160,j/16) for k in range(161)]))
  for j in range(87):parts.append(curve([fn(j/86,k/16) for k in range(17)]))
 original=''.join(parts)
 return f'<g fill="none" stroke="#b8bec4" stroke-width=".7" opacity=".40">{original}<g transform="translate(1630 0) scale(-1 1)">{original}</g></g>'

def emblem(a):
 # Show the original small issuer emblem, without regenerating its lettering.
 original=SOURCE/f'original-{a["n"]:02}.webp';x,y,w,h=a['badge'];slot=LAYOUT['badgeSlot'];sx,sy,sw,sh=slot
 scale=min(sw/w,sh/h);ow=w*scale;oh=h*scale;ox=sx+(sw-ow)/2;oy=sy+(sh-oh)/2
 clip=f'<defs><clipPath id="emblem-{a["n"]}"><circle cx="{x+w/2}" cy="{y+h/2}" r="{min(w,h)/2}"/></clipPath></defs>' if a['brand'] in ['htb','oracle'] else ''
 if a['brand']=='microsoft':
  # Follow the actual shield and ribbon silhouette so the certificate's white paper never becomes a rectangle on the dark card.
  outline='M1047 861 C1026 861 965 881 932 892 Q920 899 920 919 L920 987 L897 989 Q872 991 873 1015 L884 1091 Q888 1112 913 1111 C935 1168 1001 1204 1047 1220 C1094 1204 1160 1168 1182 1111 Q1207 1112 1211 1091 L1222 1015 Q1223 991 1198 989 L1174 987 L1174 919 Q1174 899 1162 892 C1129 881 1068 861 1047 861 Z'
  clip=f'<defs><clipPath id="emblem-{a["n"]}"><path d="{outline}"/></clipPath></defs>'
 clipped=f' clip-path="url(#emblem-{a["n"]})"' if clip else ''
 source_size=a.get('original_size',[1630,965])
 return f'<svg x="{ox}" y="{oy}" width="{ow}" height="{oh}" viewBox="{x} {y} {w} {h}" overflow="hidden">{clip}<image width="{source_size[0]}" height="{source_size[1]}"{clipped} xlink:href="{uri(original,"image/webp")}"/></svg>'

def palette_glow(a):
 # Retain every certificate color, but confine the colored light to the art.
 defs=[];shapes=[]
 positions=[(1100,580),(1390,400),(970,760),(1280,740),(1450,670),(1060,320)]
 for i,c in enumerate(a['palette']):
  ident=f'palette-glow-{i}'
  defs.append(f'<radialGradient id="{ident}"><stop stop-color="{c}" stop-opacity=".10"/><stop offset="1" stop-color="{c}" stop-opacity="0"/></radialGradient>')
  x,y=positions[i%len(positions)]
  shapes.append(f'<ellipse cx="{x}" cy="{y}" rx="260" ry="190" fill="url(#{ident})"/>')
 return '<defs>'+''.join(defs)+'</defs>'+''.join(shapes)

def compose(a):
 n=a['n'];color=COLORS[a['brand']];art=SOURCE/(a['art']+'.webp');title=' '.join(a['title']);title_size=a.get('title_size',LAYOUT['titleSize'])
 for line in a['title']:assert width(line,title_size,'bold')<1060,(n,line,width(line,title_size,'bold'))
 s=[f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1630" height="965" viewBox="0 0 1630 965" role="img" aria-label="{html.escape(title)} — Sofiane Ghazal" data-series="metal-color-v1" data-number="{n}" data-title-size="{title_size}" data-subtitle-size="65" data-badge-slot="1240,140,285,300"><title>{html.escape(title)} — Sofiane Ghazal</title><defs>',
 '<clipPath id="card"><rect x="12" y="12" width="1606" height="941" rx="68"/></clipPath>',
 '<linearGradient id="silver" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fafafa"/><stop offset=".44" stop-color="#c6cbd0"/><stop offset=".50" stop-color="#899097"/><stop offset=".55" stop-color="#e1e4e7"/><stop offset="1" stop-color="#a4aab0"/></linearGradient>',
 '<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset=".2" stop-color="#a4a8ad"/><stop offset=".45" stop-color="#f8faff"/><stop offset=".6" stop-color="#747a81"/><stop offset="1" stop-color="#f7f9fb"/></linearGradient>',
 '<linearGradient id="scrim"><stop stop-color="#06080a" stop-opacity=".30"/><stop offset=".50" stop-color="#06080a" stop-opacity=".25"/><stop offset=".76" stop-color="#06080a" stop-opacity="0"/></linearGradient>',
 '<filter id="digital-art" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="1.10"/><feComponentTransfer><feFuncR type="linear" slope="1.25" intercept="-.07"/><feFuncG type="linear" slope="1.25" intercept="-.07"/><feFuncB type="linear" slope="1.25" intercept="-.07"/></feComponentTransfer></filter>',
 '<filter id="bevel" x="-5%" y="-10%" width="110%" height="130%"><feDropShadow dx="0" dy="-12" stdDeviation="0" flood-color="#000000" flood-opacity=".65"/><feDropShadow dx="0" dy="2" stdDeviation="0" flood-color="#ffffff" flood-opacity=".15"/></filter>',
 '<filter id="logo-bevel" x="-5%" y="-10%" width="110%" height="130%"><feDropShadow dx="0" dy="2" stdDeviation="1" flood-opacity=".85"/></filter></defs>',
 '<g clip-path="url(#card)"><rect width="1630" height="965" fill="#06080a"/>',
 f'<image x="0" y="0" width="1630" height="965" preserveAspectRatio="none" filter="url(#digital-art)" xlink:href="{uri(art,"image/webp")}"/>',
 palette_glow(a),'<rect x="0" y="0" width="1630" height="965" fill="url(#scrim)"/>',mesh(color),logo(a['brand'],color),emblem(a)]
 # One sober family throughout; only short titles gain optical size. Avoid faux chrome/emboss on type.
 for line,y in zip(a['title'],([535] if len(a['title'])==1 else LAYOUT['titleBaselines'])):s.append(text(line,115,y,title_size,'bold','#edf0f2'))
 s.append(text(a['subtitle'],115,690,65,'regular','#e0e3e7'))
 s.append(text(f'N° {n:02} / 16',1515,87,29,'regular','#ededed',anchor='end'))
 # Aligned metadata; all original dates and verification identifiers retained.
 if a.get('id'):s.append(text(a['id'],1382.5,482,19,'regular','#cfd4db',anchor='middle'))
 if a.get('date'):s.append(text('ÉMIS LE '+a['date'],1382.5,515,21,'regular','#e2e6eb',anchor='middle'))
 s.append(text('SOFIANE GHAZAL',115,843,43,'bold','#dce1e5'))
 s.append('<path d="M625 808V854" stroke="#d5dae1" stroke-width="3"/>')
 s.append(text('CERTIFIÉ '+str(a['year']),660,843,43,'bold','#dce1e5'))
 # Identical frame and fine-print baseline across all 16.
 s.append('<path d="M65 897H1565" stroke="#999ea6" stroke-width="1"/>')
 footer='SOFIANE GHAZAL   •   '+{'htb':'HACK THE BOX   •   PRO LAB','cisco':'CISCO   •   NETACAD','oracle':'ORACLE   •   OCI','fortinet':'FORTINET   •   '+a['subtitle'],'microsoft':'MICROSOFT   •   SC-200'}[a['brand']]+'   •   '
 s.append(text((footer*4).strip(),815,929,17,'regular','#c0c5cc',anchor='middle'))
 s.append('</g>')
 for inset,stroke,sw in [(10,'#050607',16),(12,'url(#chrome)',6),(23,'#06080a',6),(29,'url(#chrome)',2),(38,'#a7adb4',.9)]:
  s.append(f'<rect x="{inset}" y="{inset}" width="{1630-inset*2}" height="{965-inset*2}" rx="{75-inset*.5}" fill="none" stroke="{stroke}" stroke-width="{sw}"/>')
 s.append('</svg>');out=SOURCE/f'badge-{n:02}.svg';out.write_text(''.join(s));return out
if __name__=='__main__':
 (SOURCE/'layout.json').write_text(json.dumps(LAYOUT,indent=2))
 for a in ALL:print(compose(a).relative_to(ROOT))
