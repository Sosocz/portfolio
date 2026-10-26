# Portfolio de Sofiane

Portfolio complet : pages, animations, chambre 3D, images, documents et sources.

La 3D est directement incluse dans le dépôt et chargée automatiquement par le navigateur. Aucune commande de préparation ni reconstruction de modèle n'est nécessaire.

- `dist/` : site statique prêt à servir.
- `source-assets/` : sources des visuels et de la chambre.
- `tools/` : scripts de contrôle et outils de travail facultatifs.

Les deux fichiers `chambre-sxsx.part1.bin` et `chambre-sxsx.part2.bin` sont des buffers glTF standards, référencés directement par le modèle. Ils contiennent exactement les octets de la géométrie originale, sans réduction ni perte de qualité. La variante optimisée conserve son chargement gzip automatique.

Pour un aperçu local uniquement : `python3 -m http.server 8000 --directory dist`, puis ouvrir http://localhost:8000. Servir le contenu de `dist/` à la racine du domaine. Les fichiers restent immédiatement disponibles après clonage.

Site actuel : https://sofiane-portfolio.cosmicvenus18.chatgpt.site/

Les bibliothèques et ressources tierces conservent leurs licences respectives.
