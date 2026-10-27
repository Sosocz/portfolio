# Portfolio de Sofiane Ghazal

Portfolio statique : parcours, expérience, projets, certifications et chambre 3D interactive.

## Publication

Le contenu public est dans `dist/`. Les fichiers `tools/` et `source-assets/` servent à la maintenance et ne sont pas des ressources du site.

- Version Sites : https://sofiane-portfolio.cosmicvenus18.chatgpt.site/
- GitHub Pages : https://sosocz.github.io/
- Sur GitHub Pages, la branche `gh-pages` contient directement les fichiers de `dist/` à sa racine, avec `.nojekyll`.
- La branche `main` conserve les sources et outils. Mettre à jour `main` seul ne republie pas la branche `gh-pages`.
- La copie GitHub utilise deux segments de géométrie 3D ; ne pas remplacer ce manifeste par le manifeste monofichier de Sites sans conserver ses segments.

Aucune commande npm n’est nécessaire pour consulter ou héberger le site. Les liens canoniques, le sitemap, `robots.txt` et `security.txt` doivent correspondre au domaine de chaque publication.

## Vérifications

Depuis la racine, avec Python 3 et Node.js :

```sh
python tools/check-audit-pages.py
python tools/check-network-isolation.py
python tools/check-badge-series.py
node tools/check-startup.cjs
node tools/check-runtime-performance.cjs
node tools/check-audit-corrections.cjs
node tools/check-interactive-room.cjs
node tools/check-finishing.cjs
```

Les contrôles Python utilisent Pillow, lxml et fontTools. Les SVG intermédiaires des badges sont reconstruits temporairement par leur test. Les tests de géométrie, de chargement et d’interaction fonctionnent sans GPU ; le rendu visuel WebGL doit aussi être vérifié sur un navigateur compatible.

Les modèles, textures, fonds animés et compositions de la template sont conservés. Les mentions et licences tierces restent applicables. GitHub Pages fixe ses propres en-têtes HTTP : une directive CSP placée en balise meta ne remplace pas un en-tête `frame-ancestors`.
