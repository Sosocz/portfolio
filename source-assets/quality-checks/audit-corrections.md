# Corrections de l’audit - version 147

Base : version 145, commit 4204230b5da066f1453432fcf10d04b46693505b.

- Navigation native vers et depuis Projets et Mentions, suppression du blocage au retour.
- Chambre : pack optimisé sans perte (47 255 424 -> 23 289 559 octets), géométrie identique par SHA-256, textures aux mêmes dimensions et sans différence de pixel RGBA (petit atlas transparent conservé en PNG original).
- Chargement optimisé avec repli vers les fichiers originaux pour les anciens navigateurs.
- Anticrénelage, ratio maximal de pixels 2, matériaux, animations et caméra conservés.
- Aperçu de la même chambre avec liens utilisables sans WebGL ; échec GPU traité avant la création du renderer.
- Rendu arrêté hors écran et onglet caché ; temps d’animation suspendu pour éviter les sauts à la reprise.
- Gestion sûre des messages parent/iframe conservée.
- Scripts intégrés externalisés ; CSP script sans unsafe-inline ni unsafe-eval ; WebAssembly local conservé.
- jQuery 3.5.1 -> 3.7.1 compatible, empreinte officielle vérifiée et nouveau nom de fichier.
- Identifiants analytics historiques inutilisés retirés ; aucune nouvelle dépendance distante.
- 11 photos résiduelles identifiées du pilote supprimées (2 fonds et 9 photos inutilisées).
- Icônes sportives et casques affichés remplacés par animations techniques ou emblème HTB aux mêmes emplacements ; métadonnées Grand Prix masquées supprimées ; fond WebGL original maintenu.
- Préchargement Rive limité aux ressources utiles, attente événementielle au lieu de scrutation et reprises bornées.
- Transition de route ramenée de 1000 à 650 ms (0 en préférence de mouvement réduit).
- Défilement tactile natif, mouvements continus de la bande désactivés si préférence système de mouvement réduit.
- Menu : état ARIA cohérent, focus, Échap, confinement du clavier, contenu en arrière-plan inert ; lien Aller au contenu.
- Dimensions des images complétées depuis les médias, caches des fichiers modifiés harmonisés, inclusion de script en double retirée.
- Formation : langue française, retrait noindex, signature réduite pour laisser le titre lisible.
- Mentions et confidentialité publiées, liens Sign Up / Partnerships sans fonction retirés.
- Lien de modèle glTF et LinkedIn de la visionneuse corrigés ; pages de tests retirées ; page 404 et security.txt ajoutés.

Validation : contrôles de géométrie/clics, rendu hors écran, intégrité, politique réseau, liens/ancres, performance des contrôleurs, démarrage et navigation réelle au navigateur.

Limites : WebGL désactivé dans le navigateur de test ; aucune mesure de FPS sur GPU ou de Core Web Vitals réels. Pas de certification de sécurité, d’audit juridique ou de validation des en-têtes serveur. Le service d’hébergement détermine le traitement HTTP des en-têtes et de 404.html.
