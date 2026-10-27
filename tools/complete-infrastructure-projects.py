"""Extend the existing project archive with Sofiane's documented infrastructure work."""
from pathlib import Path
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'

# Factual descriptions from the supplied inventory, MRG report, BTS E5 table,
# HSRP validation report, Nextcloud documentation, Snort TP and VM inventory.
# Wavestone additions, the PSSI project and commercial applications are excluded.
PROJECTS = [
    dict(id='mrg-deploiement', label='MRG TECH · EXPÉRIENCE PROFESSIONNELLE', title='FOG, Ninite & PowerShell',
         intro='Déploiement et maintenance de postes Windows : images système, installation de logiciels et automatisation des tâches récurrentes.',
         tags=['FOG', 'Ninite', 'PowerShell', 'Windows'], summary='Voir les réalisations chez MRG',
         details=[('Déploiement des postes', 'Installation et configuration de FOG pour la réinstallation des machines et la standardisation des environnements Windows. Utilisation de Ninite pour installer les logiciels nécessaires aux utilisateurs.'),
                  ('Automatisation et maintenance', 'Scripts PowerShell pour les installations, les mises à jour et le nettoyage des fichiers temporaires. Le rapport décrit également la configuration DHCP, la segmentation des services et des tests de restauration de données.'),
                  ('Accompagnement', 'Explication des nouveaux outils aux utilisateurs et documentation des interventions. Les interventions sont documentées pour faciliter leur suivi et la reprise par l’équipe.')]),
    dict(id='windows-wds', label='BTS SIO · RÉALISATION RÉFÉRENCÉE EN 2025', title='WDS — déploiement Windows',
         intro='Déploiement de postes Windows avec Windows Deployment Services, référencé parmi mes réalisations professionnelles de seconde année de BTS.',
         tags=['WDS', 'Windows', 'Déploiement', 'BTS SISR'], summary='Voir le périmètre du travail',
         details=[('Service informatique', 'Mise à disposition d’un service de déploiement Windows. Cette réalisation est inscrite dans mon tableau de synthèse E5, aux côtés du déploiement des logiciels métiers avec Ninite.'),
                  ('Compétences mobilisées', 'Gestion du patrimoine, traitement des demandes, travail en mode projet et mise à disposition d’un service informatique. Le tableau E5 rattache ce travail à l’administration du parc et à la mise à disposition de services.')]),
    dict(id='windows-wsus', label='BTS SIO · RÉALISATION RÉFÉRENCÉE EN 2025', title='WSUS — mises à jour centralisées',
         intro='Distribution des mises à jour Windows via WSUS, documentée dans mon bilan des réalisations professionnelles du BTS.',
         tags=['WSUS', 'Windows', 'Mises à jour', 'Exploitation'], summary='Voir le périmètre du travail',
         details=[('Administration Windows', 'Centralisation de la distribution des mises à jour pour les postes Windows. Le tableau E5 référence ce travail dans le périmètre d’exploitation et de mise à disposition des services informatiques.'),
                  ('Contexte', 'Réalisation historique de formation et d’expérience professionnelle en 2025. Le tableau E5 présente cette activité dans le suivi des services et des demandes informatiques.')]),
    dict(id='reseau-hsrp', label='CISCO PACKET TRACER · SIMULATION VALIDÉE', title='HSRP — bascule de passerelle',
         intro='Une passerelle redondante entre le réseau utilisateur et le serveur, avec bascule automatique après la panne du routeur principal.',
         tags=['Cisco 2911', 'Cisco 2960', 'HSRP', 'Haute disponibilité'], summary='Voir la maquette et les tests',
         details=[('Architecture', 'Deux routeurs Cisco 2911, deux commutateurs 2960, un poste et un serveur. Les deux groupes HSRP utilisent des passerelles virtuelles, la préemption et le suivi de l’interface opposée.'),
                  ('Tests réalisés', 'Ping nominal : 4 réponses sur 4. Lors de l’arrêt d’une interface du routeur principal, le secondaire devient actif. Le ping continu relève 107 paquets envoyés, 103 reçus et 4 pertes transitoires ; les réponses reprennent automatiquement.'),
                  ('Retour à l’état nominal', 'La restauration du lien permet au routeur principal de reprendre son rôle grâce à la préemption. L’authentification MD5 n’est pas simulée : cette limite du modèle Packet Tracer est explicitement documentée.')]),
    dict(id='linux-nextcloud', label='BTS SIO · DOCUMENTATION TECHNIQUE', title='Nextcloud — service de fichiers',
         intro='Documentation d’installation d’un service de stockage et de partage de fichiers sur une maquette Debian 11.',
         tags=['Debian', 'Nextcloud', 'Apache', 'MariaDB', 'HTTPS'], summary='Voir le déploiement documenté',
         details=[('Socle Linux', 'Installation d’Apache, PHP et de ses extensions, puis configuration d’une base MariaDB et d’un compte applicatif dédié. Préparation des droits sur les fichiers et du service web.'),
                  ('Accès au service', 'Configuration d’un hôte virtuel Apache et d’un accès HTTPS avec certificat auto-signé de laboratoire. La documentation couvre l’initialisation de Nextcloud depuis le navigateur.'),
                  ('Périmètre', 'Documentation historique de formation, centrée sur la mise à disposition du service dans un environnement de laboratoire.')]),
    dict(id='pfsense-snort', label='LABORATOIRE RÉSEAU · TEST DE DÉTECTION', title='pfSense & Snort IDS',
         intro='Installation de Snort sur pfSense, activation des règles communautaires et observation d’alertes depuis une machine Debian de test.',
         tags=['pfSense', 'Snort', 'IDS', 'Nmap', 'Debian'], summary='Voir la configuration et le test',
         details=[('Mise en place', 'Installation du paquet Snort dans pfSense, activation de l’interface surveillée et envoi des alertes dans les journaux système. Sélection des règles communautaires Snort GPLv2 puis vérification du démarrage.'),
                  ('Validation', 'Génération de trafic de test avec Nmap depuis Debian, puis consultation de Snort Alerts. Le compte rendu relève une alerte « Unknown Traffic (http_inspect) » sur le trafic observé.'),
                  ('Périmètre', 'La validation porte sur le scénario de laboratoire documenté. Elle distingue la configuration de l’IDS, l’alerte effectivement observée et les propriétés qui demanderaient des tests supplémentaires.')]),
    dict(id='enterprise-lab', label='PROJET PERSONNEL · LABORATOIRE DÉPLOYÉ', title='Enterprise Lab Hyper-V',
         intro='Un environnement multi-VM pour pratiquer l’administration Windows, les services de domaine et la segmentation réseau avec un pare-feu FortiGate.',
         tags=['Hyper-V', 'Windows Server', 'Active Directory', 'FortiGate'], summary='Explorer les rôles du laboratoire',
         details=[('Machines et rôles', 'Le laboratoire comprend DC01, FILE01, CLIENT01, CLIENT02, FGT01 et TEST01. Une VM Kali distincte complète les exercices de sécurité. L’inventaire technique confirme la présence des VM et de leurs réseaux virtuels.'),
                  ('Réseaux', 'Commutateurs virtuels dédiés au laboratoire, au management et aux interfaces du pare-feu. Un réseau NAT est réservé aux exercices CTF ; les rôles des zones restent séparés.'),
                  ('Exploitation', 'Utilisation de checkpoints et de baselines pour les essais. La procédure de reprise prévoit un export Hyper-V complet afin de préserver les chaînes de disques différentiels. Ce laboratoire reste distinct d’un cluster de production hautement disponible.')]),
    dict(id='homelab-vpn', label='PROJET PERSONNEL · ACCÈS DISTANT', title='Homelab VPN & accès distant',
         intro='Interconnexion de machines Ubuntu, Windows et macOS pour administrer les systèmes à distance avec WireGuard, Tailscale, RDP et SSH.',
         tags=['WireGuard', 'Tailscale', 'nftables', 'RDP', 'SSH'], summary='Voir le fonctionnement du homelab',
         details=[('Connectivité', 'Travail sur le routage, les règles de pare-feu et le NAT de la machine Ubuntu. Utilisation des VPN pour joindre les machines du laboratoire depuis les différents postes.'),
                  ('Diagnostic', 'Recherche des causes de problèmes d’accès RDP et SSH : routes, écoute des services, règles de filtrage et paramètres d’authentification. Vérification de la connectivité après correction.'),
                  ('Contexte', 'Installation personnelle d’apprentissage et d’administration. L’ECF présente également un cas d’accès distant avec Tailscale, basé sur WireGuard ; les deux contextes ne sont pas confondus.')]),
    dict(id='ctf-automation', label='PROJET PERSONNEL · AUTOMATISATION', title='Préparation & suivi des CTF',
         intro='Des commandes réutilisables pour organiser les fichiers d’un laboratoire, conserver l’état des recherches et réduire le volume des sorties d’outils.',
         tags=['PowerShell', 'Kali', 'Nmap', 'Ollama', 'Documentation'], summary='Voir les outils du workflow',
         details=[('Préparer et reprendre', 'ctf-init prépare l’espace de travail du laboratoire ; ctf-update sert au suivi de son état. Les commandes, notes, résultats de scans et éléments de rapport sont organisés pour permettre la reprise du travail.'),
                  ('Filtrer les résultats', 'oll combine un filtrage déterministe et, selon le mode choisi, une synthèse par modèle local. Il complète le pipeline de filtrage déjà présenté dans les projets personnels.'),
                  ('Suivre les ressources', 'ctx-budget, filter-stats et ctx-audit servent au suivi du contexte et du filtrage. Ces outils accompagnent les exercices autorisés sur les plateformes et dans le laboratoire isolé.')]),
    dict(id='soc-training', label='FORMATION PRATIQUE · CYBERSÉCURITÉ', title='Pratique SOC & investigation',
         intro='Des exercices défensifs sur TryHackMe et HTB Academy, en complément des machines offensives Hack The Box et des challenges Root-Me.',
         tags=['TryHackMe', 'HTB Academy', 'SOC', 'SIEM', 'Journaux'], summary='Voir les thèmes travaillés',
         details=[('Analyser et comprendre', 'Pratique de l’analyse des journaux Windows, des événements de sécurité, de l’investigation et des concepts SIEM. Mise en relation des exercices offensifs avec les traces qu’ils produisent.'),
                  ('Progression', 'Cette rubrique présente une activité de formation et de laboratoire. Les exercices pédagogiques complètent ma pratique des systèmes, du réseau et des plateformes offensives.')]),
]


# Keep Windows deployment and patch distribution together in the same archive card.
_wds = next(p for p in PROJECTS if p['id']=='windows-wds')
_wsus = next(p for p in PROJECTS if p['id']=='windows-wsus')
_wds.update(title='WDS & WSUS', intro='Déploiement de postes Windows et distribution centralisée des mises à jour : deux réalisations professionnelles référencées dans mon tableau E5 du BTS.', tags=['WDS','WSUS','Windows','Déploiement'], details=[('Déploiement WDS', _wds['details'][0][1]), ('Distribution WSUS', _wsus['details'][0][1]), ('Contexte', 'Réalisations référencées en seconde année de BTS, en 2025. Elles mobilisent la gestion du patrimoine, le traitement des demandes, le travail en mode projet et la mise à disposition de services informatiques.')])
PROJECTS.remove(_wsus)

def card(p):
    tags = ''.join('<li>'+escape(t)+'</li>' for t in p['tags'])
    detail = ''.join('<h4>'+escape(h)+'</h4><p>'+escape(t)+'</p>' for h,t in p['details'])
    return ('<article id="'+p['id']+'" class="archive-card"><p class="eyebrow">'+escape(p['label'])+'</p>'
            '<h3>'+escape(p['title'])+'</h3><p>'+escape(p['intro'])+'</p><ul class="tags">'+tags+'</ul>'
            '<details><summary>'+escape(p['summary'])+'</summary><div class="detail-body">'+detail+'</div></details></article>')

def main():
    page = DIST/'projets/index.html'
    s = page.read_bytes().decode()
    # Keep the extension repeatable without duplicating sections or navigation.
    section = ('<section id="realisations" class="archive"><p class="eyebrow">03 / DÉPLOIEMENT / RÉSEAU / SÉCURITÉ</p>'
               '<h2>Des services <em>aux systèmes.</em></h2><p class="archive-intro">Déploiement de postes, disponibilité réseau, services Linux et laboratoires personnels. Chaque réalisation précise son contexte et ce qui est effectivement documenté.</p>'
               '<div class="archive-grid">'+''.join(map(card,PROJECTS))+'</div></section>')
    if 'id="realisations"' in s:
        s = re.sub(r'<section id="realisations"[\s\S]*?(?=<section id="ingenierie")', lambda _: section, s, count=1)
    else:
        s = s.replace('<section id="ingenierie"', section+'<section id="ingenierie"',1)
    s = s.replace('03 / APPROFONDISSEMENTS TECHNIQUES','04 / APPROFONDISSEMENTS TECHNIQUES').replace('04 / PROJETS COMPLÉMENTAIRES','05 / PROJETS COMPLÉMENTAIRES')
    if 'href="#realisations"' not in s:
        s = s.replace('<a href="#ingenierie"', '<a href="#realisations" data-taxi-ignore="">Déploiement &amp; sécurité ↓</a><a href="#ingenierie"',1)
    s = s.replace('Mes réalisations du Bachelor Administrateur Cybersécurité et mon ECF, puis mes projets de BTS SIO SISR. Les architectures cibles, les projets d’infrastructure et les laboratoires IA complètent ce parcours.',
                  'Mes réalisations du Bachelor Administrateur Cybersécurité et du BTS SIO SISR, mes déploiements chez MRG et mes laboratoires systèmes, réseaux et cybersécurité. Les architectures cibles et les projets d’automatisation complètent ce parcours.')
    page.write_text(s)

    for name in ['index.html','calendar/index.html']:
        p = DIST/name; s = p.read_bytes().decode();s=s.replace('2023–2024','2022–2023')
        if name=='index.html':
            s=s.replace('FORMATION TERMINÉE EN 2025','DIPLÔME OBTENU EN 2025')
            s=s.replace('MRG Tech · Bezons · CDD · Support et maintenance','MRG Tech · Bezons · CDD · Déploiement et maintenance')
            s=s.replace('WINDOWS · TCP/IP · SUPPORT UTILISATEURS','FOG · NINITE · POWERSHELL')
        p.write_text(s)

    p=DIST/'off-track/index.html';s=p.read_bytes().decode()
    s=s.replace('Support systèmes et réseaux, maintenance des postes Windows et diagnostic des incidents matériels et logiciels.',
                'Déploiement de postes Windows avec FOG et Ninite, scripts PowerShell de maintenance, support systèmes et réseaux et diagnostic des incidents matériels et logiciels.')
    p.write_text(s)
    p=DIST/'on-track/index.html';s=p.read_bytes().decode()
    s=s.replace('je progresse sur Hack The Box, Root-Me et HTB Academy', 'je progresse sur Hack The Box, Root-Me, TryHackMe et HTB Academy')
    p.write_text(s)

    cv=ROOT/'tools/build-cv.py';s=cv.read_text()
    s=s.replace('Formation terminée en 2025','Diplôme obtenu en 2025')
    s=s.replace("education('BTS SIO - Option SISR','2023 - 2025'", "education('BTS SIO - Option SISR','Sept. 2023 - 2025'")
    s=s.replace("education('Licence AES - Administration économique et sociale','2023 - 2024'", "education('Licence AES - Administration économique et sociale','Sept. 2022 - 2023'")
    cv.write_text(s)
    print('Added',len(PROJECTS),'documented project cards; completed MRG and training text; corrected AES/BTS facts.')

if __name__=='__main__':
    main()
