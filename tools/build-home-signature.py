"""Draw the sXsx signature as rounded marker strokes, with reveal guides."""
from pathlib import Path
import math
import re

ROOT = Path(__file__).resolve().parents[1]
# Separate pen gestures: s, the tall X, its cross stroke, connected sx, finish, swash.
GESTURES = [
    ('M215 124 C249 48 131 38 91 94 C40 166 218 123 177 206 C156 253 77 267 51 227', 13),
    ('M207 263 C255 195 302 64 355 45 C379 35 372 64 358 85 C316 139 251 233 247 272 C244 300 304 238 326 218', 12),
    ('M219 110 C256 134 288 218 333 238 C357 250 383 226 399 210', 9),
    ('M358 225 C389 193 418 148 447 149 C469 152 448 170 423 179 C407 184 425 195 438 207 C460 229 420 257 394 243 C381 238 401 227 419 224 C450 218 473 195 492 168 C515 140 541 119 561 114', 11),
    ('M477 159 C503 173 530 209 554 210 C580 225 623 196 686 178', 8),
    ('M74 300 C245 271 466 262 704 204 C609 241 482 274 362 283', 8),
]

def points(d):
    tokens = re.findall(r'[MC]|-?\d+(?:\.\d+)?', d)
    p = (float(tokens[1]), float(tokens[2])); result = [p]; i = 3
    while i < len(tokens):
        assert tokens[i] == 'C'
        values = list(map(float, tokens[i+1:i+7]))
        a, b, c = tuple(values[:2]), tuple(values[2:4]), tuple(values[4:])
        for step in range(1, 31):
            t = step / 30; u = 1-t
            result.append(tuple(u**3*p[k]+3*u*u*t*a[k]+3*u*t*t*b[k]+t**3*c[k] for k in (0,1)))
        p = c; i += 7
    return result

def ink(d, width):
    pts=points(d); left=[]; right=[]
    for i,(x,y) in enumerate(pts):
        prev=pts[max(0,i-1)]; nxt=pts[min(len(pts)-1,i+1)]
        dx,dy=nxt[0]-prev[0],nxt[1]-prev[1]; length=max(math.hypot(dx,dy),.001)
        u=i/(len(pts)-1)
        pressure=.42+.47*max(dy/length,0)+.08*math.sin(u*math.pi*5)
        taper=min(1,.08+u*22,.07+(1-u)*24)
        r=width*.5*pressure*taper
        left.append((x-dy/length*r,y+dx/length*r));right.append((x+dy/length*r,y-dx/length*r))
    return 'M'+' L'.join(f'{x:.2f} {y:.2f}' for x,y in left+right[::-1])+' Z'

def svg(identifier, mode='play', color='#38E4B2', extra=''):
    # Match the original signature's 133:72 artboard, fitting the visible ink itself.
    # The previous 820:420 viewport included large empty margins around the drawing.
    defs=[]; paths=[]
    bounds=[]
    for i,(d,width) in enumerate(GESTURES):
        mask=f'{identifier}-ink-{i}'
        marker_width=width*1.25
        initial_opacity='1' if mode=='static' else '0'
        defs.append(f'<mask id="{mask}" maskUnits="userSpaceOnUse" x="0" y="0" width="820" height="420"><path d="{d}" data-sxsx-guide="{i}" pathLength="1" style="opacity:{initial_opacity}" fill="none" stroke="white" stroke-width="{marker_width+12}" stroke-linecap="round" stroke-linejoin="round"/></mask>')
        outline=ink(d,marker_width)
        paths.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{marker_width}" stroke-linecap="round" stroke-linejoin="round" mask="url(#{mask})"/>')
        values=list(map(float,re.findall(r'-?\d+(?:\.\d+)?',outline)))
        angle=math.radians(-8)
        for x,y in zip(values[::2],values[1::2]):
            x=x+math.tan(math.radians(-12))*y-390; y=y-180
            bounds.append((12+390+x*math.cos(angle)-y*math.sin(angle),50+180+x*math.sin(angle)+y*math.cos(angle)))
    left=min(x for x,y in bounds);right=max(x for x,y in bounds)
    top=min(y for x,y in bounds);bottom=max(y for x,y in bounds)
    sx=127/(right-left);sy=68/(bottom-top)
    fit=f'matrix({sx:.8f} 0 0 {sy:.8f} {3-left*sx:.8f} {2-top*sy:.8f})'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 133 72" preserveAspectRatio="xMidYMid meet" class="sxsx-signature" data-sxsx-signature="{mode}" role="img" aria-label="Signature manuscrite sXsx" {extra}><title>Signature sXsx</title><defs>{"".join(defs)}</defs><g transform="{fit}"><g transform="translate(12 50) rotate(-8 390 180) skewX(-12)" fill="{color}">{"".join(paths)}</g></g></svg>'

if __name__ == '__main__':
    (ROOT/'dist/assets/sxsx-signature.svg').write_text(svg('sxsx-static', 'static'))
