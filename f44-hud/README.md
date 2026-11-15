# F44 HUD expérimental pour MGU Store

Version 0.2.0 : les vidéos personnalisées affichées sur le HUD, dont la carte,
sont éclaircies ; les tons proches du noir restent inchangés. La carte du
combiné et les indications BMW ne sont pas modifiées par cet effet. Les
couleurs très claires peuvent saturer. Aucun réglage de luminosité n’est
encore disponible dans le Store.

Composant personnel pour la F44 218i, préparé à partir de cluster-render
0.6.0 et de waze-on-cluster 0.10.0. **La version 0.2.0 n'a pas été testée
sur véhicule.** Elle utilise le slot HUD `0x351` avec une zone `232x132` et
le slot de repli `0x372`, comme la version 0.1.0 qui a affiché la carte sur
la F44. Les indications BMW
peuvent se superposer ; la visibilité des avertissements n'a pas été vérifiée.

L'outil a son propre identifiant `f44-hud-bridge` et ne remplace pas les
fichiers du `cluster-render` officiel. Il installe un drop-in systemd qui,
après redémarrage de l'iDrive, lance une copie expérimentale du moteur. La
désinstallation depuis le Store retire ce drop-in ; redémarrer ensuite
l'iDrive pour revenir au moteur officiel. La suppression et le redémarrage
n'ont pas été vérifiés sur la voiture.

Au démarrage, le lanceur revient au moteur officiel si le moteur installé
n'est pas la version 0.6.0 avec le SHA-256 attendu, si Waze n'est pas en
0.10.0, si une configuration locale existe, si certains réglages HUD sont
écrasés dans un autre fichier de configuration, ou si `Keep HUD map over
BMW's pop-ups` n'est pas désactivé. Il crée un marqueur persistant avant
le démarrage expérimental : si le service redémarre avant 120 secondes de
fonctionnement, le prochain lancement revient au moteur officiel. Cette
protection ne garantit pas la récupération de tous les types de panne.

Avant tout essai, voiture à l'arrêt : désactiver dans Waze la case « Keep
HUD map over BMW's pop-ups », puis choisir Cluster seul ; désinstaller ou
désactiver cluster_info et les autres applications affichant du contenu sur
le HUD. Après installation depuis le Store, redémarrer l'iDrive, réactiver
HUD dans Waze et vérifier à l'arrêt la carte, les avertissements, la vitesse,
la limitation, les menus et les indications BMW. Désinstaller le composant
et redémarrer l'iDrive si un affichage manque ou se comporte anormalement.
Ne pas utiliser le montage en circulation avant validation complète.

Source officielle : <https://github.com/robertnisipeanu/idrive-apps>, tag
`cluster-render@0.6.0`, licence GPL-3.0-or-later. Le binaire a été recompilé depuis les sources modifiées avec la chaîne
Ubuntu 18.04 du projet ; les informations de débogage ont été supprimées.
Le code source correspondant est dans `sources-f44-hud.tar.gz` avec les
mentions de licence.

Contrôles effectués hors voiture : intégrité du paquet, octet modifié,
lecture du catalogue avec le parseur MGU Store et simulations du lanceur
(version différente, empreinte différente, option HUD et marqueur d'échec).
La suite complète des tests natifs n'a pas abouti dans cet environnement :
le test de socket a reçu `Operation not permitted`. Ni installation depuis
le Store, ni affichage, ni retour automatique n'ont été testés sur la MGU.
