# Chambre SXSX — intégration portfolio

La chambre complète est conservée, y compris le socle bleu, ses rochers/plantes, les meubles, la baie serveur, Kirby, la figurine, les cartes sociales, le poster et les lettres « sxsx ».
Le grand décor extérieur vert et son sol ne font pas partie du GLB. Le damier de l’aperçu indique la transparence : il n’est pas une texture du modèle.

## Fichiers

- `chambre-sxsx.glb` : modèle autonome, géométrie complète et textures de jour embarquées. Les atlas du pack web sont limités à 2K pour alléger le chargement ; la géométrie est identique à l’export pleine résolution fourni séparément. Le fond de l’écran est une image fixe dans le GLB, comme pour les modèles glTF ordinaires.
- `index.html` et `assets/` : visualiseur web prêt à intégrer, avec fond transparent, rotation/zoom, éclairage de jour uniquement et fond d’écran SXSX animé. Les ventilateurs tournent, la chaise oscille, le poisson flotte, l’horloge suit l’heure locale et les objets réagissent au survol.
- `src/` : sources du visualiseur, animations et interactions, réutilisables avec Three.js et GSAP (voir package.json).
- `content/panels.html` : contenu Projets, À propos et Contact repris du portfolio local.
- `LICENSE-*.txt`, `SOURCES/` : mentions et provenance à conserver.

Les cartes 3D GitHub, LinkedIn et Hack The Box sont cliquables. Les panneaux 3D My work, About et Contact ouvrent les fenêtres correspondantes. Les mouvements de glisser ne déclenchent pas les liens. Rotation, zoom, tactile, survols, apparition en cascade rejouable, vapeur, ventilateurs, chaise, poisson, horloge et écran animé sont inclus. Le jour reste fixe, sans fond extérieur. Aucun son du piano ni musique automatique n’est ajouté.

Liens personnels existants : GitHub Sosocz et le profil Hack The Box fourni. LinkedIn conserve l’adresse générique du site local (`https://www.linkedin.com/`) faute d’URL personnelle : la remplacer dans `src/portfolio-room-interactions.js` et `editable.html`. Les projets et textes sont repris du site existant, sans validation ni ajout de nouvelles réalisations. Contact conserve les champs e-mail/LinkedIn à compléter et ajoute les liens disponibles.

Le fichier Blender animé est fourni séparément : 480 images à 24 fps (20 secondes), textures embarquées, ventilateurs, chaise, poisson, horloge et balayage de l’écran. Éclairage fixe de jour, sans transition vers la nuit. Espace lance la lecture de la timeline. Le balayage est adapté en nodes Blender, tandis que le pack web utilise le canvas animé original. Les liens et événements de souris restent des fonctions web, pas des données Blender. Le GLB seul ne suffit donc pas : intégrer le dossier web entier.

Pour modifier les sources : `npm install`, puis `npm run dev` et ouvrir `/editable.html`. Le `index.html` compilé est déjà prêt à héberger sans outil de build.

## Voir le résultat

Servir ce dossier par HTTP plutôt que d’ouvrir index.html en file:// :

```sh
python3 -m http.server 8080
```

Puis ouvrir http://localhost:8080/.

## Intégration simple

Copier le dossier sur l’hébergement du portfolio et utiliser, par exemple :

```html
<iframe
  src="/chambre-sxsx/index.html?embed"
  title="Chambre 3D SXSX"
  style="width:100%;height:700px;border:0;background:transparent"
  loading="lazy"
></iframe>
```

`?embed` retire le damier et les boutons du visualiseur. Le modèle apparaît alors sur le fond de la page du portfolio.

Pour importer uniquement le GLB dans un visualiseur existant, charger chambre-sxsx.glb, utiliser un renderer avec alpha:true, scene.background=null et renderer.setClearColor(0,0). Prévoir un éclairage ambiant pour les ajouts PBR ; l’éclairage de la chambre d’origine est déjà intégré aux textures.

Le pack conserve les mentions du projet source fourni ainsi que celles des bibliothèques et des modèles ajoutés. Les marques/logos et le poster restent des éléments tiers ; leur présence n’est pas une revendication de propriété.
