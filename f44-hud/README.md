# F44 HUD — version expérimentale 0.11.0

Moteur basé sur cluster-render 0.6.3, avec l'adaptation minimale du HUD F44
au slot 0x371 (500x210). La correction officielle de 0.6.3 concernant la
visibilité des images avant leur premier chargement complet est incluse.

Requiert cluster-render 0.6.3 et waze-on-cluster 0.10.1. L'option Waze
« Keep HUD map over BMW's pop-ups » doit rester désactivée. Le lanceur
contrôle les versions, l'empreinte du moteur officiel et les conflits HUD,
et prévoit un repli vers le moteur officiel en cas d'échec. Le marqueur de
démarrage limite les tentatives répétées sans couvrir toutes les pannes.

Les tests des règles HUD, du compositeur, de l'occlusion et des composites
vidéo ont réussi, ainsi que la compilation pour l'iDrive et les contrôles du
paquet. La version 0.11.0 n'a pas été testée sur véhicule ; les tests hors
voiture ne prouvent pas sa stabilité sur l'iDrive. La correction du plantage
observé sur la version 0.9.0 reste à confirmer en voiture.

Après mise à jour, redémarrer l'iDrive et essayer à l'arrêt. Vérifier la
carte, la vitesse et les avertissements BMW. Si le système ne fonctionne pas
correctement, désinstaller le composant et redémarrer pour revenir au moteur
officiel. Le résultat et le retour arrière restent à valider dans la voiture.

Sources et licences : sources-f44-hud-0.11.0.tar.gz ; adaptation :
f44-hud-0.11.0.patch. Construction : branche work/f44-hud-063.
