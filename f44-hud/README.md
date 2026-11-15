# F44 HUD — version expérimentale 0.10.0

Variante minimale du moteur cluster-render 0.6.2 : adaptation du HUD F44 au
slot 0x371 (500x210), sans les effets de luminosité supplémentaires de la
version 0.9.0. La luminosité peut donc changer.

La 0.9.0 a subi un SIGSEGV immédiat au démarrage sur la voiture. Cette
variante est une tentative de correction ; la cause exacte n'est pas encore
prouvée et la 0.10.0 n'a pas été testée sur véhicule. Le test des règles HUD
et la compilation avec la chaîne prévue pour l'iDrive ont réussi hors véhicule.

Requiert cluster-render 0.6.2 et waze-on-cluster 0.10.1. L'option Waze
« Keep HUD map over BMW's pop-ups » doit rester désactivée. Le lanceur
contrôle les versions, l'empreinte du moteur officiel et les conflits HUD,
et prévoit un repli vers le moteur officiel en cas d'échec. Le marqueur de
démarrage limite les tentatives répétées sans couvrir toutes les pannes.

Après mise à jour, redémarrer l'iDrive et essayer à l'arrêt. Vérifier la
carte, la vitesse et les avertissements BMW. Si le système ne fonctionne pas
correctement, désinstaller le composant et redémarrer pour revenir au moteur
officiel. Le résultat et le retour arrière restent à valider dans la voiture.

Sources : sources-f44-hud-0.9.0.tar.gz et
cluster-render-0.9-to-minimal.patch. Compilation : branche
work/f44-hud-062-minimal, workflow F44 HUD experimental build.
