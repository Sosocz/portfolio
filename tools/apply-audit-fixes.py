from pathlib import Path
from lxml import html
import re,hashlib,base64,json,shutil
root=Path(__file__).resolve().parents[1];d=root/'dist'
# Original wrapper classes and layouts are deliberately retained.
wire=(d/'index.html').read_text();t=html.fromstring(wire);wire=html.tostring(t.xpath('//*[@data-journey-wireframe]')[0],encoding='unicode');wire=wire.replace('class="journey-wireframe"','class="journey-wireframe" style="width:100%;height:100%;object-fit:contain"')
for f in ['index.html','off-track/index.html','on-track/index.html','calendar/index.html','projets/index.html']:
 p=d/f;s=p.read_text();t=html.fromstring(s)
 for e in t.xpath('//a[@href]'):
  old=html.tostring(e,encoding='unicode');href=e.get('href')
  if href=='/partnerships' or (href=='#' and e.text_content().strip()=='Sign Up'):
   s=s.replace(old,'');continue
  if href=='#' and e.text_content().strip()=='MENTIONS LÉGALES':e.set('href','/mentions-legales/')
  if href.rstrip('/')=='/projets' or f=='projets/index.html' or e.get('href')=='/mentions-legales/':e.set('data-taxi-ignore','')
  if e.get('target')=='_blank':e.set('rel','noopener noreferrer')
  s=s.replace(old,html.tostring(e,encoding='unicode'))
 t=html.fromstring(s)
 for e in t.xpath('//canvas[@data-rive-ln4]'):s=s.replace(html.tostring(e,encoding='unicode'),'')
 for e in t.xpath('//canvas[@data-rive-file="reef"] | //canvas[@data-rive-artboard="race-day"]'):
  s=s.replace(html.tostring(e,encoding='unicode'),wire)
 # Remove the obsolete race-data bank, while retaining the HTB season layout.
 for e in t.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," on-t-stat-track-dash-stats ")]'):
  s=s.replace(html.tostring(e,encoding='unicode'),'')
 for e in t.xpath('//img[contains(@alt,"checkered flags")]'):
  old=html.tostring(e,encoding='unicode');e.set('src','/assets/htb-logo.svg');e.set('alt','Hack The Box');s=s.replace(old,html.tostring(e,encoding='unicode'))
 # Delete the obsolete helmet silhouette overlays, keep custom certification artwork.
 for e in t.xpath('//img[contains(@class,"helmet") and (contains(@src,"site-media") or contains(@src,"home-media"))]'):
  s=s.replace(html.tostring(e,encoding='unicode'),'')
 s=s.replace('aria-label="On Track page"','aria-label="Expérience professionnelle"').replace('aria-label="Off Track Page"','aria-label="Laboratoire cybersécurité"')
 if f=='calendar/index.html':s=s.replace('lang="en"','lang="fr"').replace('<meta name="robots" content="noindex,follow">','')
 if f=='index.html':
  s=s.replace('controls-136','controls-146').replace('interactive-room-host.js?v=136','interactive-room-host.js?v=146')
  s=s.replace('class="impact-content-w is-home"','id="parcours" class="impact-content-w is-home"',1)
 # Navigation semantics do not depend on Rive loading.
 s=s.replace('<button data-nav-ham=""','<button data-nav-ham="" type="button" aria-expanded="false" aria-controls="portfolio-navigation" aria-label="Ouvrir le menu"')
 s=s.replace('<div data-nav-m=""','<div data-nav-m="" id="portfolio-navigation" role="navigation" aria-label="Navigation principale"')
 s=s.replace('<main class="main-w"','<main id="portfolio-main" class="main-w"',1)
 if f=='projets/index.html':s=s.replace('<main>','<main id="portfolio-main">',1)
 if 'portfolio-main' in s:s=s.replace('<body', '<body',1);s=re.sub(r'(<body[^>]*>)',r'\1<a class="portfolio-skip" href="#portfolio-main" data-taxi-ignore>Aller au contenu</a>',s,count=1)
 # A module runs once per document and re-initializes on original route events.
 s=s.replace('</head>','<link rel="stylesheet" href="/assets/portfolio-audit-fixes.css?v=146"><script defer src="/assets/portfolio-accessibility.js?v=146"></script></head>',1)
 if 'data-journey-wireframe' in s and 'src="/assets/journey-wireframe.js"' not in s:s=s.replace('</body>','<script type="module" src="/assets/journey-wireframe.js?v=146"></script></body>',1)
 # Remove duplicate script inclusions.
 seen=set()
 def unique(m):
  text=m.group();src=re.search(r'src="([^"]+)"',text).group(1)
  if src in seen:return ''
  seen.add(src);return text
 s=re.sub(r'<script\b[^>]*src="[^"]+"[^>]*>\s*</script>',unique,s)
 s=re.sub(r'(/portfolio-runtime.js)\?v=\d+',r'\1?v=146',s)
 s=s.replace('/assets/home-signature.js?v=afb93b73fbb5','/assets/home-signature.js?v=146')
 p.write_text(s)
# Active fallback backgrounds must use Sofiane, never the original driver.
p=d/'assets/portfolio-layout.css';s=p.read_text().replace('/assets/home-media/deaedb85be32aabc.webp','/assets/hover-sofiane/support-v1.webp').replace('/assets/home-media/7a1eb36a4fa52bb7.webp','/assets/character-scenes/06-support-reunion-v2-960.webp');p.write_text(s)
for name in ['deaedb85be32aabc.webp','7a1eb36a4fa52bb7.webp']:(d/'assets/home-media'/name).unlink()
# Runtime fixes: leave backgrounds, GSAP choreography and template renderer enabled.
p=d/'portfolio-runtime.js';s=p.read_text()
a=s.index('function CD(){');b=s.index('function KD()',a);s=s[:a]+'function CD(){}'+s[b:]
s=s.replace('var v$=1000','var v$=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?0:650')
s=s.replace('if(!E){B("❌ Calendar wrapper not found");return}','if(!E)return;')
s=s.replace('touchMultiplier: 1.25, autoResize: true, syncTouch: true','touchMultiplier: 1, autoResize: true, syncTouch: false')
s=s.replace('lerp: 0.1, smoothWheel: true','lerp: 0.1, smoothWheel: !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches')
s=s.replace('function O$(){let A=new Map','function O$(){if(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)return;let A=new Map')
# Preload only the Rive assets used by this document; generic controls are retained.
s=s.replace('function kI(){let A=Object.keys(p6).map((Q)=>cR(Q));','function kI(){let needed=new Set(["btn-ui","mob-landscape"]);document.querySelectorAll("canvas[data-rive-file]").forEach(c=>needed.add(c.getAttribute("data-rive-file")));let A=Object.keys(p6).filter(key=>needed.has(key)).map((Q)=>cR(Q));')
for fn,file in [('nR','logo'),('B4','reef'),('E4','signature'),('I4','circuits'),('K4','phrases')]:
 if f'function {fn}(){{' in s:
  sel='canvas[data-rive-ln4]' if file=='logo' else f'canvas[data-rive-file="{file}"]'
  s=s.replace(f'function {fn}(){{',f'function {fn}(){{if(!document.querySelector(\'{sel}\'))return;',1)
a=s.index('function g8(A){');b=s.index('function HE(A)',a)
s=s[:a]+'function g8(A){KI=A;if(!dK)return;let Q=dK.find(B=>B.name==="close");if(Q)Q.value=A}'+s[b:]
s=s.replace('Close navigation menu','Fermer le menu').replace('Open navigation menu','Ouvrir le menu')
s=s.replace('onStart:()=>{if(window.lenisStop()', 'onStart:()=>{E.setAttribute("aria-expanded","true");E.setAttribute("aria-label","Fermer le menu");if(window.lenisStop()',1)
p.write_text(s)
# Modern compatible jQuery 3.x release, verified against official SRI.
q=Path('/workspace/scratch/30eb22ba7de9/jquery-3.7.1.min.js').read_bytes();assert base64.b64encode(hashlib.sha256(q).digest()).decode()=='/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo='
(d/'assets/vendor/bc2d2832c2e7.js').write_bytes(q)
# Preserve legacy source/provenance in Git, remove only throwaway public test pages.
for folder in ['tests-souris','tests-souris-fluides']:
 p=d/folder
 if p.exists():shutil.rmtree(p)
if (d/'.well-known_security.txt').exists():(d/'.well-known_security.txt').unlink()
(d/'.well-known').mkdir(exist_ok=True);(d/'.well-known/security.txt').write_text('Contact: mailto:sofiane.ghazal2@gmail.com\nExpires: 2027-10-26T00:00:00Z\nPreferred-Languages: fr, en\nCanonical: https://sofiane-portfolio.cosmicvenus18.chatgpt.site/.well-known/security.txt\n')
