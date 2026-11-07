# F44 petit HUD — expérimental, non testé sur véhicule

Cet essai personnel est basé sur `cluster-render@0.4.1` officiel, commit `88e8554b1d81593d85f8095b4f0c38213223990d`. Le paquet `0.4.900002` est expérimental et ne constitue pas une release officielle. Il inclut le profil F40 `0x351`, `232x132`, `0x372`, dont la compatibilité F44 n'est pas confirmée, et préserve les protections HUD de la version de base. Il faut activer le HUD dans Waze après avoir effectué les contrôles sur la voiture.

Lire la [procédure d'installation, de test et de retour arrière](PROCEDURE-FR.md). La [release expérimentale](https://github.com/benspa900/mon-vitals-idrive7/releases/tag/f44-small-hud-experimental-0.4.900002) contient le paquet, ses sources, le catalogue, les sommes et une archive USB avec l'installateur guidé et le paquet officiel 0.4.1 de retour.

Ce catalogue est une source indépendante. Le Store bloque normalement un renderer expérimental si l'outil est déjà installé depuis la source officielle. L'installateur guidé utilise explicitement `mgu-deploy --other-source` après contrôles ; il faut une connexion root à la MGU. Ne pas modifier ou usurper la provenance enregistrée. Ne pas installer ou tester sans avoir vérifié les slots, le garde et le retour arrière.

Le workflow de cette branche vérifie le patch ; il ne republie pas de paquet sous le même numéro.
