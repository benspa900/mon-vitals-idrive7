# F44 HUD — version expérimentale 0.8.0

Moteur basé sur cluster-render 0.6.1 avec les adaptations F44 du paquet
0.7.0 : carte Waze plein écran dans le HUD (0x371, 500x210) et luminosité
de la version 0.3.0. Il conserve les modifications officielles de 0.6.1
et n'impose pas la limitation expérimentale à 8 images par seconde.

Requiert cluster-render 0.6.1 et waze-on-cluster 0.10.0. Le lanceur vérifie
l'empreinte du moteur officiel 0.6.1, les versions et les conflits HUD ; en
cas de problème il démarre le moteur officiel. L'option Waze « Keep HUD map
over BMW's pop-ups » doit rester désactivée. Un marqueur de démarrage limite
les redémarrages expérimentaux répétés, sans couvrir toutes les pannes.

Le paquet et le moteur ont été testés hors véhicule ; l'installation, le
rendu et le retour arrière n'ont pas été testés sur cette F44. Après mise à
jour, redémarrer l'iDrive et vérifier à l'arrêt la carte, la vitesse, les
limites et les avertissements. Désinstaller le composant et redémarrer pour
revenir au moteur officiel ; cela retire la carte F44 du HUD.

Sources et licences : sources-f44-hud-0.8.0.tar.gz, basées sur
cluster-render 0.6.1.
