# Chambre SXSX — intégration du portfolio

Le dossier contient le visualiseur directement utilisable, sans commande de préparation pour les visiteurs.

- `index.html` : chambre intégrée à l’accueil ; fond transparent.
- `editable.html` : visualiseur avec commandes de recentrage et de lecture.
- `assets/interactive-room-Chi5jqhe.js` : module de production autonome.
- `src/` : sources de référence des interactions et animations Three.js/GSAP.
- `chambre-sxsx.optimized.gltf`, `chambre-sxsx.bin.gz` et `textures/` : chargement principal, avec géométrie compressée sans perte.
- `chambre-sxsx.gltf` et ses fichiers `.bin` : chargement de secours natif. GitHub conserve deux segments binaires ; Sites conserve un seul fichier. Les textures WebP communes sont identiques aux PNG originaux après décodage RGBA.
- `room-fallback.webp` : aperçu de la même chambre lorsque WebGL est indisponible ; les liens restent accessibles.
- `content/panels.html` : contenu des panneaux interactifs.
- `LICENSE-*.txt` et `SOURCES/` : licences et crédits des ressources, à conserver.

La rotation est limitée à l’avant de la chambre. La caméra garde une marge autour du socle. La molette fait défiler la page du portfolio ; le zoom interactif est désactivé. Les textures, la géométrie, les objets et les animations sont conservés. Le rendu s’arrête hors écran et quand l’onglet est masqué.

GitHub, LinkedIn, Hack The Box et les panneaux Projets / À propos / Contact utilisent les destinations personnelles du portfolio. Un glisser ne déclenche pas de clic.

Le projet livré est statique : il suffit d’héberger tout le contenu de `dist/` en conservant les chemins. Aucune installation npm n’est requise pour l’hébergement ou l’utilisation. Les sources de référence ne constituent pas, à elles seules, un projet npm reproductible ; toute reconstruction du module doit conserver son chargeur optimisé et ses garde-fous.
