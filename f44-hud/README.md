# F44 HUD et carte combiné — version expérimentale 0.4.0

HUD plein écran F44 : conserve le slot 0x371, la zone 500x210 et la
luminosité sélective, mais réduit le gain de 0.5 à 0.2. Cela modifie les
vidéos du HUD, pas les indications BMW ni le shader de la carte du combiné.

La carte Waze du combiné n'alterne plus entre images exactes et blocs
compressés : le serveur ne l'applique qu'au client waze-on-cluster sur la
cible map et limite ses mises à jour à 8 images par seconde au maximum.
Selon la charge et le budget partagé avec le HUD, le débit peut être plus
bas. L'image peut être moins fluide. Cette mesure vise une cause possible
du clignotement ; elle ne garantit pas de le supprimer. Les autres clients,
le HUD et la cible panel gardent leurs réglages négociés.

Les réglages de position et de taille restent ceux de l'utilisateur. La
0.4.0 n'a pas été essayée sur véhicule. Avant usage, vérifier à l'arrêt la
carte, la vitesse, les limites et les alertes. Désinstaller F44 HUD
experimental et redémarrer ramène au moteur officiel et retire la carte du
HUD F44. Le rollback Store n'a pas été validé sur la voiture.

Lancement conditionné à cluster-render 0.6.0 vérifié par SHA-256,
waze-on-cluster 0.10.0, absence de configuration concurrente et option
Keep HUD map over BMW's pop-ups désactivée. Un marqueur évite les relances
expérimentales répétées en cas d'échec au démarrage ; il ne protège pas de
tous les types d'échec.

Source modifiée et licences : sources-f44-hud-0.4.0.tar.gz, basé sur
cluster-render 0.6.0. Rapport F40 :
https://github.com/robertnisipeanu/idrive-apps/issues/85#issuecomment-6682744344
La compilation et les vérifications ont été réalisées hors voiture.
