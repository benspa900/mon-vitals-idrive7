# F44 HUD et carte combiné — version expérimentale 0.6.0

Cette version reprend le moteur, la configuration et le lanceur de 0.4.0.
Le blocage constaté après installation de 0.4.0 n'a pas exécuté ce moteur :
les journaux indiquent que l'option Waze « Keep HUD map over BMW's pop-ups »
était active au démarrage et le lanceur a pris son chemin de repli officiel.
Cette option a été désactivée ensuite. La version 0.6.0 remet à disposition
les modifications de la 0.4.0, qui n'ont pas encore été validées en voiture.
Pour que le lanceur expérimental démarre, garder cette option désactivée
avant de redémarrer l'iDrive.

Le HUD plein écran F44 conserve le slot 0x371, la zone 500x210 et un gain
réduit de 0.5 à 0.2. Les indications BMW et le shader du combiné ne sont
pas éclaircis. La carte Waze sur la cible map n'alterne plus entre images
exactes et blocs compressés et est limitée à 8 images/seconde maximum : elle
peut être moins fluide, et la suppression du clignotement n'est pas garantie.
Cette règle ne concerne que le client waze-on-cluster sur la cible map.

Vérifier le fonctionnement à l'arrêt et conserver la visibilité des
indications et avertissements BMW. La désinstallation suivie d'un redémarrage
rétablit le moteur officiel et retire la carte F44 du HUD. Le lanceur refuse
les conflits de configuration et les versions non vérifiées, et utilise un
marqueur de démarrage ; cette protection ne couvre pas toutes les pannes.
Le retour en 0.5.0 et les versions précédentes sont conservés sur GitHub.
Source du moteur : sources-f44-hud-0.4.0.tar.gz (cluster-render 0.6.0).
