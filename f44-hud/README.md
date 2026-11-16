# F44 HUD — version expérimentale 0.12.0

Moteur basé sur cluster-render 0.6.4, avec l'adaptation minimale du HUD F44
au slot 0x371 (500x210). Les corrections officielles du renderer 0.6.4 sont incluses.

Requiert cluster-render 0.6.4 et waze-on-cluster 0.10.3. L'option Waze
« Keep HUD map over BMW's pop-ups » doit rester désactivée. Le lanceur
contrôle les versions, l'empreinte du moteur officiel et les conflits HUD,
et prévoit un repli vers le moteur officiel en cas d'échec. Le marqueur de
démarrage limite les tentatives répétées sans couvrir toutes les pannes.

La compilation pour l'iDrive a réussi ; les tests hors véhicule ne remplacent pas un essai sur la voiture. La version 0.12.0 n'a pas été testée sur véhicule ; les tests hors
voiture ne prouvent pas sa stabilité sur l'iDrive. La correction du plantage
observé sur la version 0.9.0 reste à confirmer en voiture.

Après mise à jour, redémarrer l'iDrive et essayer à l'arrêt. Vérifier la
carte, la vitesse et les avertissements BMW. Si le système ne fonctionne pas
correctement, désinstaller le composant et redémarrer pour revenir au moteur
officiel. Le résultat et le retour arrière restent à valider dans la voiture.

Sources et licences : sources-f44-hud-0.12.0.tar.gz ; adaptation :
f44-hud-0.12.0.patch. Construction : sources cluster-render 0.6.4 et adaptation F44.
