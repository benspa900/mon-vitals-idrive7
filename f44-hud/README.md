# Waze sur le HUD de la BMW F44 · 0.13.0 expérimentale

Ce composant affiche la carte Waze de l’iPhone sur le petit HUD de la F44 via CarPlay. Il reprend l’emplacement d’affichage `0x371` et la taille de 500 × 210 pixels du composant F44 précédent. La vitesse et les avertissements BMW sont à vérifier à l’arrêt lors du premier essai. La version 0.13.0 a été compilée et testée hors véhicule. L’affichage réel, la stabilité après redémarrage et le retour au moteur officiel de Maps on cluster restent à vérifier sur la voiture.

## Installation et premier essai

1. Dans MGU Store, actualiser la source `robertnisipeanu/idrive-apps` en mode **Releases**. Installer ou mettre à jour **Maps on cluster**. Les versions de référence sont l’application **0.6.17**, le service `waze-on-cluster` **0.14.16** et le moteur `cluster-render` **0.8.13**.
2. Dans les sources du Store, sélectionner `benspa900/mon-vitals-idrive7` et le canal **branche main**. Ajouter la source si nécessaire, puis actualiser. Ouvrir **F44 HUD experimental**, vérifier la version **0.13.0**, puis choisir **Mettre à jour** ou **Installer**.
3. Redémarrer iDrive à l’arrêt. Dans les réglages BMW, sélectionner la vue **Carte** dans la zone centrale du combiné. Dans **Maps on cluster → Afficher sur**, choisir **HUD (expérimental)** ou **Combiné et HUD (expérimental)**. Laisser décoché **Garder la carte sur le HUD devant les pop-up BMW**.
4. Connecter l’iPhone en CarPlay et démarrer un itinéraire dans Waze. Vérifier que la carte apparaît sur l’afficheur choisi, que la vitesse BMW reste lisible et que la liste multimédia BMW garde la priorité. Le client amont documente Waze via CarPlay et Google Maps via Android Auto.

## En cas de HUD vide

Vérifier les versions exactes du moteur et du service, le réglage **Afficher sur** du profil conducteur actif et la présence de la carte côté CarPlay. Si la carte fonctionne au combiné mais que le HUD reste en démarrage, ouvrir **Logs** dans Maps on cluster et enregistrer le diagnostic. Le journal de `cluster-render.service` indique si le lanceur F44 est revenu au moteur officiel, avec le motif. Pour revenir au rendu amont, retirer **F44 HUD experimental** dans le Store, puis redémarrer iDrive à l’arrêt.

Le lanceur contrôle les deux versions, l’empreinte du moteur officiel, les conflits de configuration et le marqueur d’un démarrage précédent interrompu. Une future version du moteur ou du service entraîne un repli vers le moteur officiel au démarrage suivant. Le moteur F44 donne la priorité aux pop-up BMW configurés même si le profil conducteur change pendant la session.

## Sources et vérification

Le [moteur officiel 0.8.13](https://github.com/robertnisipeanu/idrive-apps/releases/tag/cluster-render%400.8.13) est la base de compilation. Le [signalement F44](https://github.com/robertnisipeanu/idrive-apps/issues/91) décrit le HUD bloqué sur l’emplacement officiel `0x323`. Les réglages de l’application sont décrits dans le [guide Maps on cluster](https://github.com/robertnisipeanu/idrive-apps/blob/robertn_waze_cluster%400.6.17/apps/robertn_waze_cluster/README.md).

L’archive `sources-f44-hud-0.13.0.tar.gz` contient les sources adaptées et leurs licences. Le fichier `f44-hud-0.13.0.patch` donne les différences par rapport au tag officiel. Depuis le répertoire `native/cluster-render` de ces sources, `make target` construit les exécutables et `make test-x86` lance la suite native dans le conteneur amont. Le paquet fournit le binaire iDrive 7 débarrassé des symboles de débogage.
