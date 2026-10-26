# Portfolio de Sofiane

Version complète 147 du portfolio, exportée le 26 octobre 2026.

## Contenu

- `dist/` : site statique complet, pages, CSS, JavaScript, images, modèles 3D et documents.
- `source-assets/` : sources des visuels et de la chambre.
- `tools/` : scripts de préparation et de vérification.
- `.openai/hosting.json` : identité du projet Sites et dossier à publier.

## Préparer et lancer

Python 3 suffit, sans dépendances supplémentaires :

```sh
python3 tools/prepare-github-checkout.py
python3 -m http.server 8000 --directory dist
```

Ouvrir http://localhost:8000. Servir le contenu de `dist/` à la racine du domaine, car les URLs des ressources sont absolues.

La géométrie originale `dist/chambre-sxsx/chambre-sxsx.bin` (20 779 984 octets) est conservée sans perte dans `chambre-sxsx.bin.gz`. Le script de préparation reconstruit le fichier original et vérifie son SHA-256. La version optimisée de la chambre utilise directement le fichier gzip dans les navigateurs compatibles. Exécuter la préparation avant tout déploiement indépendant afin de conserver aussi le secours original.

L'import conserve les fichiers de la version publiée, avec les scripts de contrôle et les sources disponibles. Les recommandations du dernier audit réseau ne sont pas appliquées par cet import.

Site publié : https://sofiane-portfolio.cosmicvenus18.chatgpt.site/

Les bibliothèques et ressources tierces conservent leurs licences respectives. Les commits antérieurs du dépôt restent accessibles dans l'historique.
