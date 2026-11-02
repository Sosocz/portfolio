# Point de retour avant optimisation de la chambre et des survols

Version Sites : **163**, source `d62336ea92f7b774d6ac5454eb43be3bf1901b2c`.
Version enregistrée : `appgprj_6acd4c8f2bd88191af9b23231c99340b~appgver_7fca585ee9948191a50bd8eb0891c6bc`.
Repère Git local : `rollback-before-performance-v163`.

Pour un retour demandé : republier cette version Sites, puis restaurer le contenu GitHub correspondant dans un nouveau commit, sans réécrire son historique.

Cette optimisation conserve la géométrie, les textures, les couleurs, le cadrage, le pixel ratio et les styles de survol. Elle prépare les 16 images de certificats avant leur ouverture, évite le rendu du casque caché sur l’accueil, évite les raycasts hors du canvas et réduit les raycasts au repos. La chambre reste à sa résolution d’origine ; son rendu est plafonné à 60 Hz sur les écrans plus rapides. La fréquence des interactions n’est pas limitée par l’intervalle de contrôle du pointeur stationnaire.

Vérification : tests de la fonction source et du bundle publié, clic, premier mouvement, sortie du pointeur, cadence simulée à 60/120/144 Hz, passe du casque désactivée uniquement dans le mode chambre, contrôles CSP/ressources/liens. Vérification navigateur : 16/16 certificats chargés avant tout survol et ouverture au premier passage. Le navigateur de contrôle ne fournit pas de contexte WebGL : aucun chiffre FPS réel n’est revendiqué. Le poids initial des fichiers 3D reste inchangé.
