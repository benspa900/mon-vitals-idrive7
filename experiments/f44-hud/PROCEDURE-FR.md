# F44 HUD : paquet expérimental 0.4.900002

Le paquet contient directement le profil `hud_slot = 0x351`, `hud_size = 232x132`, `hud_yield_slots = 0x372`. Après installation il reste à activer HUD dans l'interface Waze. Les valeurs proviennent d'un essai F40 : elles ne sont pas confirmées sur F44. Laisser la voiture à l'arrêt pendant l'essai et arrêter si la vitesse, une indication ou un avertissement BMW disparaît, si le combiné redémarre ou si le garde signale un problème.

## Le Store et votre installation officielle

`cluster-render` est déjà installé chez vous depuis la source officielle. Les identifiants sont globaux : le Store bloque normalement la ligne du même outil venant d'une autre source. Le catalogue expérimental peut donc être visible sans que son bouton d'installation fonctionne. Ne pas supprimer Waze ou le renderer officiel, ne pas modifier `origins.json` ni faire passer ce catalogue pour officiel. Voir [les règles de provenance du Store](https://github.com/robertnisipeanu/mgu-store/blob/main/native/mgu-updater/README.md).

Pour rendre l'installation possible malgré cette limite, la clé contient `install-f44-hud.sh` : il utilise explicitement la commande documentée `mgu-deploy install --other-source`. C'est une installation manuelle avec accès root à la MGU, pas une installation en un clic depuis le Store. Elle ne met pas automatiquement à jour l'origine enregistrée dans le Store. Le script reste à tester sur votre véhicule et peut refuser si sa configuration diffère ; ne pas forcer ses refus. Aucune clé SSH privée ne doit être partagée.

## Préparation, avant toute modification

1. Télécharger l'archive USB de la release expérimentale, extraire **son contenu** à la racine d'une clé lisible par la voiture. Elle contient le paquet expérimental, le paquet officiel 0.4.1 pour le retour et le script. Ne pas appliquer cette procédure si la version installée n'est plus 0.4.1 : il faut d'abord disposer de sa version exacte pour le retour.
2. Établir votre connexion root habituelle à la MGU et confirmer qu'il s'agit de votre voiture, iDrive 7, ainsi que son firmware. Aucun changement sur la voiture avant ces contrôles et la confirmation de la possibilité de retour. Observer les indications BMW, la vitesse et les avertissements. Ne pas continuer en cas d'anomalie.
3. Dans l'interface Waze, désactiver provisoirement l'option HUD. La carte combiné peut rester activée. Il s'agit de la première modification volontaire, après confirmation de l'identité et de la possibilité de retour : cela évite que le nouveau renderer tente le HUD aussitôt installé.
4. Relever les versions, la provenance, le garde et les slots en lecture seule :

```sh
cat /etc/os-release-id-dlt
/var/opt/mgu-deploy/mgu-deploy.sh status --json
readlink /var/opt/cluster-render/current
ls -la /var/opt/cluster-render/versions
cat /var/opt/mgu-updater/state/origins.json
cat /var/opt/cluster-render/cluster-render.local.conf
cat /var/opt/cluster-render/state/guard.txt
cat /var/opt/waze-on-cluster/map.state.conf
/var/opt/cluster-render/current/cluster-render status
tail -200 /var/opt/cluster-render/log/cluster-render.log
```

Un fichier facultatif peut être absent : noter son absence. Vérifier dans la table DCSM que `0x351` existe, est activé et libre ; vérifier aussi que `0x372` est le slot des fenêtres contextuelles BMW sur cette voiture. Si la table ou son interprétation n'est pas claire, ne pas installer. Le script ne peut pas confirmer automatiquement ces observations.

Vérifier aussi le fonctionnement de `mgu-deploy`, les dépendances et la présence de la version officielle exacte à restaurer. Le paquet requiert `mgu-deploy >= 0.4.0`, Waze 0.9.1/0.9.2 requiert `mgu-deploy >= 0.7.11` et `cluster-render >= 0.4.0` ; notre installation explicite avec `--other-source` exige au moins 0.7.17. Le script exige le renderer 0.4.1, iDrive 7, Waze HUD désactivé et une configuration locale sans surcharge des champs expérimentaux ou du garde. Il refuse s'il trouve des événements dans le fichier de garde.

Le garde officiel repart à zéro quand la version du renderer change. S'il y a déjà un strike, une désactivation ou des redémarrages, s'arrêter et conserver les preuves ; ne pas utiliser `guard-reset` pour rendre l'installation possible. Une sauvegarde du garde sert à l'analyse, pas à effacer un événement survenu après l'essai.

## Installation guidée depuis la clé

Après les vérifications précédentes, identifier le vrai point de montage de la clé sous `/media` et, en root, lancer :

```sh
sh '/media/REMPLACER_PAR_LE_NOM_REEL/install-f44-hud.sh'
```

Le script vérifie les empreintes des deux paquets, quelques préconditions et lance `mgu-deploy check`. Il affiche l'état et demande de taper `F44-VERIFIE` uniquement si **vous avez effectivement vérifié** le véhicule, les slots, le fonctionnement des avertissements et la possibilité de retour. Entrée seule annule. Après confirmation, il crée une sauvegarde sous `/var/opt/f44-hud-backup-...` et installe le paquet avec `--other-source`. Conserver une copie de cette sauvegarde hors du véhicule. Le script n'active pas le HUD Waze et n'efface ni ne modifie les fichiers de provenance. Si une étape échoue, s'arrêter et conserver ses messages.

Le Store peut toujours afficher l'origine officielle enregistrée : cela ne prouve pas que les octets installés sont officiels. Vérifier `readlink /var/opt/cluster-render/current`, `status --json` et le manifeste. Version expérimentale attendue : `0.4.900002`, titre `EXPERIMENTAL F44 HUD 0x351`. Le numéro élevé est nécessaire car le Store n'accepte que `x.y.z` et Waze requiert au moins 0.4.0 ; il peut empêcher les mises à jour officielles d'apparaître normalement. Revenir à l'officiel après l'essai.

## Test de la fonction

1. Avec la voiture toujours à l'arrêt, contrôler le service et le statut :

```sh
systemctl status cluster-render.service
/var/opt/cluster-render/current/cluster-render status
tail -100 /var/opt/cluster-render/log/cluster-render.log
```

2. Confirmer que la cible HUD utilise bien le slot `0x351`, la taille `232x132` et la liste de cession `0x372`. Un fichier `cluster-render.local.conf` peut remplacer les valeurs du paquet ; le script refuse plusieurs surcharges pour éviter un essai ambigu. Vérifier les valeurs réellement affichées et le journal.
3. Activer ensuite HUD dans l'interface Waze, connecter le téléphone et démarrer un itinéraire si nécessaire. Vérifier d'abord la carte combiné, puis le HUD. `shown` indique une scène mappée, pas nécessairement une image visible ni des avertissements fonctionnels. Vérifier les affichages BMW et le comportement d'une fenêtre contextuelle, sans provoquer de situation dangereuse. La carte peut se superposer à la navigation BMW.
4. Si la vitesse ou un avertissement est masqué, si un redémarrage ou un strike apparaît, ou au moindre doute : désactiver immédiatement HUD dans Waze et revenir en arrière. Ne pas poursuivre sur route.

## Retour à la version officielle antérieure

Désactiver HUD dans Waze. Conserver les journaux et le garde actuel pour analyse. Le script n'a pas modifié votre configuration locale ; si vous l'avez modifiée vous-même, restaurer précisément son état, son propriétaire et ses permissions à partir de la sauvegarde, ou retirer le fichier seulement s'il n'existait pas auparavant. Ne pas réinjecter le garde pour masquer des événements.

Si `status --json` et `versions/` confirment que 0.4.1 est **l'unique autre version conservée** :

```sh
/var/opt/mgu-deploy/mgu-deploy.sh rollback cluster-render --yes
```

Sinon, depuis la même clé, contrôler la somme puis utiliser le paquet officiel :

```sh
OFFICIEL='/media/REMPLACER_PAR_LE_NOM_REEL/retour-officiel/cluster-render@0.4.1.tgz'
sha256sum "$OFFICIEL"
/var/opt/mgu-deploy/mgu-deploy.sh check --artifact "$OFFICIEL"
/var/opt/mgu-deploy/mgu-deploy.sh install --artifact "$OFFICIEL" --other-source --yes
```

SHA-256 officiel attendu : `508753de8ec3699958e4e6f2a146e422cd2efc9b9a5fe512a214202decc75dad`. Vérifier le code de retour, `current`, `status --json`, l'état du service, la carte au combiné et les fonctions BMW. Contrôler ensuite l'origine dans le Store avant toute mise à jour. Ne pas forcer un échec ni supprimer manuellement les versions.

## Origine et vérification

Sources officielles `cluster-render@0.4.1`, commit `88e8554b1d81593d85f8095b4f0c38213223990d`. Le patch autorise 0x351 en plus de 0x323 ; scène HUD imposée, refus de prise de contrôle BMW pour le HUD et garde à deux événements restent en place. Les patchs CarPlay et Android Auto ne sont pas modifiés. La fonction préexistante de guide hold du combiné est distincte.

Compilation native x86-64 avec l'image Ubuntu 18.04/GCC 7.5 prévue par le projet ; vérification des imports ABI, tests C++ x86, lecture simulée du catalogue USB et empreintes du manifeste réussis. Pas de test sur votre MGU, ses bibliothèques réelles, sa clé, son firmware ou son HUD. Le script d'installation n'a été vérifié qu'en syntaxe ; son fonctionnement sur votre voiture reste à confirmer.
