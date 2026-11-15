# F44 HUD plein écran — version expérimentale 0.3.0

Cette version remplace la zone de navigation 0x351 (232x132) par la zone
0x371 (500x210), sur la base du compte rendu F40 :
https://github.com/robertnisipeanu/idrive-apps/issues/85#issuecomment-6682744344
Elle conserve l'éclaircissement HUD de la version 0.2.0 et l'affichage du
combiné. La vitesse et les limitations restaient sur la carte lors du test
F40 ; la navigation BMW native était masquée et les bords de la carte coupés.
Il n'y a pas de validation de ce comportement sur cette F44 : essayer à
l'arrêt et vérifier vitesse, limites et avertissements avant utilisation.
Le scintillement intermittent de la carte du combiné n'est pas corrigé ici.

Les choix de taille et position Waze de l'utilisateur restent inchangés.
Le HUD est plus grand et peut nécessiter un repositionnement depuis l'app.
Le rendu du HUD est plus grand et peut consommer davantage de ressources.

Le moteur modifié est le binaire 0.2.0 avec un seul octet changé dans
hud_rules (slot 0x351 vers 0x371). Les shaders sont identiques à la 0.2.0.
Code source du moteur : sources-f44-hud-0.3.0.tar.gz, basé sur
cluster-render 0.6.0. L'outil ne remplace pas les fichiers officiels : un
drop-in systemd lance la copie expérimentale. Désinstaller le composant
et redémarrer l'iDrive retire le drop-in et ramène le moteur officiel,
ce qui retire aussi la carte F44 du HUD. Une version antérieure est
conservée sur GitHub. Le retour n'a pas été validé sur la voiture.

Le lanceur conserve les contrôles de version et d'empreinte 0.2.0, refuse
les configurations HUD concurrentes ou Keep HUD map over BMW's pop-ups,
et revient au moteur officiel si un redémarrage intervient durant les
120 secondes suivant un démarrage expérimental. Ceci ne garantit pas la
récupération de tous les types d'erreurs. Tests faits hors voiture : règle
de slot, isolation de l'éclaircissement HUD, empreintes, structure du
paquet et parsing Store ; aucun test sur la F44 ni installation réelle.
