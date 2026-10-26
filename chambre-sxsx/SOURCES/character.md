# Personnage fourni par Sofiane

Source originale non modifiée : `/Users/sofiane/Downloads/Sofiane_PNG_MATCH_BACKUP (1).blend`.

`sofiane.glb` est une copie Web : maillage simplifié, couleur des matériaux procéduraux cuite en texture 2048 px, détails de cheveux conservés à une résolution adaptée à une petite figurine. Aucun service payant ni génération Fal.

`sofiane-arms-down.glb` est une variante intermédiaire avec les bras baissés le long du corps. La rotation est progressive autour des épaules sur le maillage Web non riggé ; le fichier Blender original et l’export initial restent intacts. Script reproductible : `tools/pose_desk_character.py`.

La chambre utilise désormais `sofiane-seated.glb` : pose construite sur deux chaînes cuisse/tibia, avec déformation préservant le volume aux genoux. Les cuisses descendent légèrement vers les genoux plutôt que de remonter contre le ventre ; les tibias restent presque verticaux. Les bras et le pull sont préservés. Les genoux et chevilles sont rapprochés progressivement et les pointes des chaussures redressées. Le repère `Sofiane_Seat_Anchor` utilise le niveau du bassin (`z = -0.39` dans Blender), pas le bas du pull. Les pieds restent dans le vide. La taille du corps est conservée par rapport à la version debout. Script : `tools/pose_seated_character.py`.

Intégration : `src/character-replacement.js`. Kirby reste intact, visible et interactif à sa place d’origine. Le personnage est une petite figurine (taille debout de référence : 85 % de la hauteur de Kirby), assise sur l’angle avant du boîtier PC et tournée de trois quarts. La hauteur du support est obtenue par rayon vertical, avec un repère mesuré dans la scène Blender d’origine si la surface manque dans le groupe compressé. Une ombre de contact douce ancre l’assise au support. Les proportions du modèle sont conservées. Ses matériaux utilisent une palette légèrement désaturée et réchauffée, des ombres plus douces, un léger rebond menthe et une lumière définie dans la chambre (indépendante de la caméra), avec adaptation jour/nuit.

L’original utilise certains matériaux procéduraux qui sont simplifiés pour le Web ; ce GLB ne remplace pas le fichier Blender comme source haute résolution.

Contrôle local en gros plan : `/figurine-inspect.html` (Vite), charge le même GLB et le même module de placement que la chambre, avec une caméra dédiée aux jambes et à l’assise.

Pieds : l’axe longitudinal de chaque chaussure est mesuré sur son maillage, puis aligné vers l’avant. Les deux semelles sont au même niveau et à la même profondeur, avec un écart de 0,025 unité source. La correction est progressive au niveau des chevilles et préserve la forme des chaussures.

Posture détendue : bras articulés à l’épaule et au coude, mains près des cuisses, buste légèrement incliné en arrière (4°), tête inclinée de 3°. Les accessoires de tête suivent le même mouvement ; l’assise et les pieds restent inchangés.
