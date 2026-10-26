"""Prepare the user supplied Microsoft certificate for the existing card system.

The PDF is an exact image-only rendering of the supplied JPEG, not an issuer PDF.
"""
from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
import base64

root = Path(__file__).resolve().parents[1]
source = root / 'source-assets/badge-series/original-16.jpeg'
badge_image = root / 'source-assets/badge-series/original-16.webp'
hover = root / 'dist/assets/certs/hover-blur/certificate-hover-16-microsoft.svg'
pdf = root / 'dist/assets/certs/documents/microsoft-security-operations-analyst-sc200.pdf'
hover.parent.mkdir(parents=True, exist_ok=True)
pdf.parent.mkdir(parents=True, exist_ok=True)

with Image.open(source) as image:
    assert image.size == (2048, 1411)
    image.save(badge_image, 'WEBP', quality=94, method=6)
    width, height = image.size
    document = canvas.Canvas(str(pdf), pagesize=(width / 2, height / 2), pageCompression=1)
    document.drawImage(str(source), 0, 0, width=width / 2, height=height / 2)
    document.showPage()
    document.save()

# Match the existing hover gallery: square 1000 x 1010, blurred full-canvas
# certificate behind an 860 px centered, sharp copy with soft drop shadow.
uri = 'data:image/jpeg;base64,' + base64.b64encode(source.read_bytes()).decode('ascii')
hover.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="1010" viewBox="0 0 1000 1010" data-badge-number="16"><defs><filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="30"/><feColorMatrix type="saturate" values="1.15"/></filter><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="18" result="soft"/><feOffset in="soft" dy="12" result="offset"/><feFlood flood-color="#000" flood-opacity=".5"/><feComposite in2="offset" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter><clipPath id="certificate"><rect x="70" y="159" width="860" height="593" rx="12"/></clipPath></defs><rect width="1000" height="1010" fill="#101010"/><image x="-234" y="0" width="1468" height="1010" preserveAspectRatio="none" filter="url(#blur)" xlink:href="{uri}"/><rect width="1000" height="1010" fill="#000" opacity=".7"/><g filter="url(#shadow)"><g clip-path="url(#certificate)"><image x="70" y="159" width="860" height="593" preserveAspectRatio="xMidYMid meet" xlink:href="{uri}"/></g></g></svg>''')

print(f'{badge_image.relative_to(root)}; {hover.relative_to(root)}; {pdf.relative_to(root)}')
