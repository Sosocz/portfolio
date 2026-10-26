"""Render the approved report-card layout as self-contained vector assets.
Run with fontTools and brotli installed; art is kept in source-assets.
All technical text comes from the reviewed cards.json, never from image generation.
"""
from pathlib import Path
import json,base64,html,copy,io,sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from lxml import etree
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'source-assets/resolution-notes'
OUT=SOURCE/'masters';OUT.mkdir(parents=True,exist_ok=True)
base=TTFont(SOURCE/'design/MonaSans.woff2')
fonts={
 'title':instantiateVariableFont(base,{'wdth':75,'wght':900},inplace=False),
 'body':instantiateVariableFont(base,{'wdth':85,'wght':600},inplace=False),
 'small':instantiateVariableFont(base,{'wdth':100,'wght':450},inplace=False),
 'mono':TTFont('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf')
}
MINT='#38E4B2';WHITE='#F4F3EA';GRAY='#91979a'
def esc(x):return html.escape(str(x),quote=True)
def text(value,x,y,size=28,kind='body',color=WHITE,maxwidth=None,tracking=0):
 f=fonts[kind];glyphs=f.getGlyphSet();cmap=f.getBestCmap();units=f['head'].unitsPerEm;scale=size/units
 advance=sum(glyphs[cmap.get(ord(c),'.notdef')].width for c in value)*scale+max(0,len(value)-1)*tracking
 if maxwidth and advance>maxwidth:scale*=maxwidth/advance;tracking*=maxwidth/advance
 pieces=[];cursor=x
 for c in value:
  name=cmap.get(ord(c),'.notdef');pen=SVGPathPen(glyphs);glyphs[name].draw(pen)
  if pen.getCommands():pieces.append(f'<path d="{pen.getCommands()}" transform="translate({cursor:.3f} {y}) scale({scale:.6f} {-scale:.6f})"/>')
  cursor+=glyphs[name].width*scale+tracking
 return f'<g fill="{color}" aria-label="{esc(value)}">'+''.join(pieces)+'</g>'
def line(x1,y1,x2,y2,color='#343a3d',width=1):return f'<path d="M{x1} {y1}H{x2}" stroke="{color}" stroke-width="{width}"/>' if y1==y2 else f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{color}" stroke-width="{width}"/>'
def logo(platform):
 if platform=='HTB':
  e=etree.fromstring((ROOT/'dist/assets/footer-tech/htb.svg').read_bytes());e.set('x','1198');e.set('y','51');e.set('width','273');e.set('height','53');return etree.tostring(e,encoding='unicode')
 e=etree.fromstring((ROOT/'dist/assets/logos/universes/root-me.svg').read_bytes())
 for node in e.iter():
  for a in ['fill','stroke','style']:
   if a in node.attrib:
    for old in ['#000000','#000','black']:node.attrib[a]=node.attrib[a].replace(old,MINT)
 e.set('fill',MINT)
 for node in e.iter():
  if etree.QName(node).localname=='path':node.set('style','fill:'+MINT)
 e.set('x','1247');e.set('y','38');e.set('width','68');e.set('height','68');return etree.tostring(e,encoding='unicode')+text('ROOT-ME',1328,83,34,'body',WHITE,maxwidth=155)
cards=json.loads((SOURCE/'cards.json').read_text())
for c in cards:
 art=SOURCE/'art'/f"{c['art']}.png"
 uri='data:image/png;base64,'+base64.b64encode(art.read_bytes()).decode()
 a=['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1536" height="1024" viewBox="0 0 1536 1024" role="img">',f'<title>{esc(c["title"])} — notes de résolution</title>',f'<desc>{esc(". ".join(c["steps"]))}. Indices : {esc(" ; ".join(c["commands"]))}. Synthèse de sources publiques ; commandes indicatives, pas une capture de session.</desc>','<defs><pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#292f31" stroke-width=".75"/></pattern><linearGradient id="fade"><stop stop-color="#15191a"/><stop offset="1" stop-color="#101213"/></linearGradient></defs>', '<rect width="1536" height="1024" fill="#101213"/><rect x="24" y="24" width="1488" height="976" rx="10" fill="url(#fade)" stroke="#50575a" stroke-width="1.5"/>', '<rect x="868" y="192" width="608" height="720" fill="url(#grid)" opacity=".6"/>']
 a+=[text(f'{c["index"]:02d} / NOTES DE RÉSOLUTION',63,85,25,'mono',MINT,maxwidth=700),text('sXsx98',1006,84,24,'mono',GRAY),logo(c['platform']),line(64,127,1472,127)]
 a+=[text(c['title'],60,266,112,'title',WHITE,maxwidth=810),text(c['subtitle'],65,317,25,'mono',GRAY,maxwidth=800)]
 for i,s in enumerate(c['steps']):
  y=407+i*107
  a+=[text(f'{i+1:02d}',65,y,54,'title',MINT),line(144,y-39,144,y+10),text(s,172,y-4,33,'body',WHITE,maxwidth=665)]
  if i<2:a.append(line(65,y+36,825,y+36))
 a+=['<rect x="64" y="687" width="760" height="190" rx="9" fill="#0e1112" stroke="#454e51"/>']
 for i,color in enumerate(['#e98072','#d8c489','#77bb91']):a.append(f'<circle cx="{89+i*22}" cy="710" r="5" fill="{color}"/>')
 a+=[text('INDICES / LAB',185,718,18,'mono',GRAY),line(65,732,823,732)]
 for i,command in enumerate(c['commands']):
  prefix=c['prompt'];a+=[text(prefix,86,777+i*51,25,'mono',MINT),text(command,86+len(prefix)*16+16,777+i*51,25,'mono',WHITE,maxwidth=704-len(prefix)*16)]
 a+=[text(c['note'],65,901,18,'small',GRAY,maxwidth=765),'<circle cx="86" cy="931" r="20" fill="none" stroke="#38E4B2" stroke-width="3"/><path d="m76 931 7 7 14-16" fill="none" stroke="#38E4B2" stroke-width="3.5"/>',text(c['status'],125,940,25,'mono',WHITE,maxwidth=700)]
 a+=[f'<image x="858" y="235" width="616" height="612" preserveAspectRatio="xMidYMid meet" href="{uri}"/>',text('HACK THE BOX' if c['platform']=='HTB' else 'ROOT-ME',904,901,24,'mono',MINT),text(c['title'],904,941,27,'title',WHITE,maxwidth=500),line(64,960,1472,960),text('SYNTHÈSE · SOURCES PUBLIQUES',65,985,15,'mono',GRAY,maxwidth=650),text(c['source_name'],870,985,15,'mono',GRAY,maxwidth=590),'</svg>']
 (OUT/f"{c['id']}.svg").write_text(''.join(a))
print(f'Rendered {len(cards)} crisp vector report cards; exact typography, commands and logos.')
