"""Generate the factual, one-page CV from Sofiane's confirmed portfolio timeline."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from xml.sax.saxutils import escape

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'dist/assets/documents/CV_Sofiane_Ghazal.pdf'
OUTPUT.parent.mkdir(parents=True,exist_ok=True)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
pdfmetrics.registerFont(TTFont('CV',FONT));pdfmetrics.registerFont(TTFont('CV-Bold',BOLD))
W,H=A4;M=42;RIGHT=W-M;WIDTH=W-2*M;y=H-42
c=canvas.Canvas(str(OUTPUT),pagesize=A4)
c.setTitle('CV - Sofiane Ghazal');c.setAuthor('Sofiane Ghazal');c.setSubject('Technicien systèmes et réseaux - Support N1/N2')
INK=HexColor('#171c20');MUTED=HexColor('#4a5358');RULE=HexColor('#bcc8c2')
def line(text,size=10.0,bold=False,color=INK,after=3):
 global y
 st=ParagraphStyle('line',fontName='CV-Bold' if bold else 'CV',fontSize=size,leading=size*1.38,textColor=color)
 p=Paragraph(escape(text),st);_,height=p.wrap(WIDTH,1000);p.drawOn(c,M,y-height);y-=height+after

def section(text):
 global y
 y-=9;c.setFillColor(INK);c.setFont('CV-Bold',10);c.drawString(M,y,text.upper());y-=6
 c.setStrokeColor(RULE);c.setLineWidth(.5);c.line(M,y,RIGHT,y);y-=10

def role(name,date,title,bullets):
 global y
 c.setFillColor(INK);c.setFont('CV-Bold',10.3);c.drawString(M,y-10,name)
 c.setFillColor(MUTED);c.setFont('CV',8.6);c.drawRightString(RIGHT,y-10,date);y-=16
 line(title,size=8.8,color=MUTED,after=4)
 for text in bullets:line('- '+text,size=10.0,after=2)
 y-=5

def education(title,date,detail):
 global y
 c.setFillColor(INK);c.setFont('CV-Bold',9.5);c.drawString(M,y-9,title)
 c.setFillColor(MUTED);c.setFont('CV',8.5);c.drawRightString(RIGHT,y-9,date);y-=14
 line(detail,size=9.0,color=MUTED,after=5)

line('SOFIANE GHAZAL',size=22,bold=True,after=3)
line('Technicien systèmes et réseaux | Support N1/N2',size=11.2,bold=True,after=6)
line('Épinay-sur-Seine (93) | Île-de-France | Permis B',size=9.0,color=MUTED,after=1)
line('sofiane.ghazal2@gmail.com | sofiane-portfolio.cosmicvenus18.chatgpt.site',size=8.1,color=MUTED,after=8)
line('Technicien systèmes et réseaux, spécialisé dans le support utilisateurs, le diagnostic technique et le maintien en condition opérationnelle. Gestion autonome d’environ 80 salles de réunion chez Wavestone. Bachelor Administrateur Cybersécurité obtenu en 2026.',size=10.1,after=3)

section('Expériences professionnelles')
role('WAVESTONE - HELPLINE','Depuis décembre 2025','Support IT et visioconférence | La Défense | CDI HELPLINE',[
 'Gestion autonome d’environ 80 salles de réunion et maintien en condition opérationnelle des équipements.',
 'Diagnostic matériel, logiciel et réseau ; maintenance préventive et corrective, documentation et escalade.',
 'Utilisation de Logitech Sync, Teams Rooms et Jira Service Management.'
])
role('SOCIÉTÉ GÉNÉRALE - HELPLINE','Septembre - décembre 2025','Support N1/N2 - Kiosque IT | CDI HELPLINE depuis septembre 2025',[
 'Assistance aux utilisateurs et diagnostic des incidents matériels, logiciels et réseau.',
 'Interventions dans un environnement Windows, Active Directory et Intune.'
])
role('MRG TECH','Janvier - août 2025','Support systèmes et réseaux | Bezons | CDD',[
 'Support utilisateurs, maintenance et diagnostic des postes de travail et de la connectivité réseau.',
 'Environnement Windows et TCP/IP.'
])

section('Compétences')
line('Systèmes et support : Windows, Active Directory, Intune, diagnostic matériel et logiciel.',size=9.6,after=2)
line('Réseaux et exploitation : TCP/IP, diagnostic de connectivité, maintenance préventive et corrective.',size=9.6,after=2)
line('Visioconférence et suivi : Teams Rooms, Logitech Sync, Jira Service Management, documentation.',size=9.6,after=2)
line('Pratique personnelle en cybersécurité : Hack The Box, HTB Academy et Root-Me.',size=9.6,after=2)

section('Formation')
education('Bachelor Administrateur Cybersécurité - Bac+3','2025 - 2026','EPITA - Campus Cyber | Diplôme obtenu en 2026 | Titre de niveau 6')
education('BTS SIO - Option SISR','2023 - 2025','Lycée Jean-Jacques Rousseau, Montmorency | Formation terminée en 2025')
education('Licence AES - Administration économique et sociale','2023 - 2024','Université Paris 8 | Parcours universitaire')
education('Baccalauréat STMG - Gestion et Finance','2021 - 2022','Lycée Eugène Delacroix, Drancy')
line('Projet de formation : cycle ingénieur IRSM au CNAM - Bac+5, à venir.',size=9.6,bold=True,after=2)
line('Informatique, réseaux, systèmes et multimédia - CYC9104A.',size=9.0,color=MUTED,after=0)
assert y>30,f'Content exceeds page: bottom={y}'
c.linkURL('mailto:sofiane.ghazal2@gmail.com',(M,H-125,M+170,H-112),relative=0,thickness=0)
c.linkURL('https://sofiane-portfolio.cosmicvenus18.chatgpt.site',(M+175,H-125,RIGHT,H-112),relative=0,thickness=0)
c.save()
print(f'{OUTPUT}\nBottom margin: {y:.1f} pt')
