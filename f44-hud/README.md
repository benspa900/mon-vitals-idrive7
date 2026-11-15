# F44 HUD expérimental pour MGU Store

Composant personnel pour la F44 218i, préparé à partir de cluster-render
0.6.0 et de waze-on-cluster 0.10.0. **Non testé sur véhicule.** Il tente de
placer la carte dans le slot HUD `0x351` avec une zone `232x132` et le slot
de repli `0x372`, d'après une expérience sur une F40. Les indications BMW
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
`cluster-render@0.6.0`, licence GPL-3.0-or-later. Le paquet inclut une copie
du binaire iDrive 7 officiel : un octet de la comparaison du slot est
changé et les informations de débogage sont supprimées ; les trois réglages
HUD de sa configuration sont adaptés. Le code source correspondant est dans
`sources-f44-hud.tar.gz` avec les mentions de licence. Le binaire n'a pas été
recompilé à partir de ces sources.

Contrôles effectués hors voiture : intégrité du paquet, octet modifié,
lecture du catalogue avec le parseur MGU Store et simulations du lanceur
(version différente, empreinte différente, option HUD et marqueur d'échec).
La suite complète des tests natifs n'a pas abouti dans cet environnement :
le test de socket a reçu `Operation not permitted`. Ni installation depuis
le Store, ni affichage, ni retour automatique n'ont été testés sur la MGU.
