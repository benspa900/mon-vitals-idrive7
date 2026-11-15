# F44 HUD — version 0.7.0

Cette version rétablit le moteur et la configuration de la version 0.3.0
(également utilisés par la version 0.5.0). Elle retire la limitation à 8 images
par seconde ajoutée en 0.4.0 pour la carte du combiné et conserve la carte Waze
plein écran sur le HUD F44. La fluidité dépend aussi du véhicule et de la charge ;
le scintillement précédemment observé peut revenir. Le HUD peut être plus
lumineux qu'en 0.6.0.

Le lanceur et son mécanisme de repli restent identiques à ceux de 0.3.0.
L'option Waze « Keep HUD map over BMW's pop-ups » doit être désactivée.
Le composant requiert cluster-render 0.6.0 et waze-on-cluster 0.10.0.
Redémarrer l'iDrive après installation. Vérifier à l'arrêt la visibilité de
la vitesse, des limites et des avertissements. Désinstaller le composant puis
redémarrer pour revenir au moteur officiel. Cette version n'a pas été testée
sur le véhicule.

Code source du moteur : sources-f44-hud-0.3.0.tar.gz.
