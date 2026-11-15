# F44 HUD : rétablissement 0.5.0

Cette version rétablit exactement le moteur et la configuration de la
version 0.3.0, dont la carte plein écran avait fonctionné sur la F44. Elle
annule l'atténuation de luminosité et la correction expérimentale de la
carte du combiné introduites en 0.4.0. La luminosité peut donc être trop
forte et le clignotement antérieur peut réapparaître.

Un redémarrage iDrive est nécessaire. Si le HUD reste sur Starting, des
journaux récents sont nécessaires pour diagnostiquer la cause ; le retour
en 0.3.0 ne prouve pas à lui seul l'origine de la panne. La vérification
est à faire à l'arrêt. Le lanceur, les contraintes de version et le
marqueur de récupération sont identiques à la version 0.3.0. La désinstallation
du composant et le redémarrage rétablissent le moteur officiel et retirent
la carte F44 du HUD.

Les sources correspondant au moteur 0.3.0 sont disponibles dans
sources-f44-hud-0.3.0.tar.gz (cluster-render 0.6.0 et licences).
