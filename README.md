# Mon Vitals — iDrive 7

Application personnelle de tableau de bord sur une seule page, issue du kit et de M Vitals du projet [idrive7-apps](https://github.com/cauliflowermossgrape/idrive7-apps). Cible : unité BMW MGU iDrive 7 (ID7). La compatibilité des signaux, du calculateur et du micrologiciel doit être vérifiée sur chaque voiture ; les nouvelles sources des versions 0.2.0 et 0.3.0 restent à vérifier sur véhicule.

## Affichage

Régime, vitesse et rapport au centre, entourés de jauges doubles de régime et de maximum. À gauche : consommations instantanée et moyenne sur deux traits, forces G et températures d'huile moteur, de boîte et de liquide de refroidissement. À droite : puissance (kW par défaut), couple, turbo, position relative de l'accélérateur et charge moteur calculée. Les données manquantes ou périmées sont affichées `--`.

- La puissance est calculée par défaut à partir du couple et du régime. Il est possible de choisir l'affichage sportif dans les réglages ; sa puissance maximale doit être réglée pour la voiture.
- La consommation instantanée est calculée à partir du débit carburant et de la vitesse, uniquement à partir de 5 km/h. L'application essaie le débit documenté pour le calculateur DME8FF_R reconnu, puis les lectures OBD PID 5E et UDS F45E. Si aucun débit valide n'est disponible, elle affiche `--`. Ces lectures nécessitent validation sur la voiture.
- La moyenne correspond à la moyenne **BC1 de l'ordinateur de bord BMW**, lue seulement si son unité est connue en L/100 km. Sa période dépend des réglages BMW. Ce choix peut être modifié ultérieurement.
- La température de boîte utilise le signal BMW disponible et, en complément, des lectures de diagnostic uniquement pour les calculateurs identifiés dont le décodage est documenté dans le projet d'origine. Elle reste `--` si aucune source valide n'est disponible. Les échelles et unités doivent être comparées aux données de la voiture.
- L'accélérateur utilise le signal de pédale normalisé du DME8FF_R reconnu ou la position relative OBD 5A ; la charge utilise la charge calculée OBD 04. Ces valeurs dépendent des réponses du calculateur et ne sont pas nécessairement disponibles sur toutes les voitures.
- La reconnaissance du panneau de limitation n'est **pas incluse** : son accès n'a pas été identifié. Les températures, le turbo et les autres données disponibles dépendent du modèle. `EST.` indique un rapport estimé.
- Le mode démonstration est désactivé par défaut sur la voiture. Il doit être activé explicitement pour afficher des données fictives, signalées par `DEMO`.

## Installation depuis MGU Store

1. Relier l'iDrive à Internet et ouvrir **MGU Store**.
2. Dans **Settings → Add source**, ajouter `benspa900/mon-vitals-idrive7`, puis choisir la branche `main`.
3. Actualiser la liste et ouvrir **Mon Vitals**, puis sélectionner **Install**.
4. Le Store construit l'application depuis les sources avec le SDK de la voiture. Si nécessaire, il demande ou installe ses dépendances déclarées : moteur graphique compatible, composant de commandes et Python du Store. Les versions du Store et ses dépendances peuvent influencer la procédure.
5. Ouvrir l'application puis vérifier à l'arrêt les unités, les réglages et les valeurs par rapport aux indications BMW. Une donnée non prise en charge reste `--`.

Pour une installation déjà présente, actualiser les sources dans le Store, puis choisir la mise à jour de **Mon Vitals**. La version 0.4.2 met le rapport en évidence et affine la typographie des valeurs centrales. La disponibilité de la pédale et de la charge dépend du calculateur. **Ne pas interpréter une valeur de démonstration comme une mesure.** Le Store permet normalement de retirer l'application.

## Émulateur sur Mac

Sur le Mac où ce projet a été préparé, double-cliquer sur **Ouvrir l-emulateur.command**. Le navigateur ouvre `http://127.0.0.1:8077/`. Le panneau permet de simuler les signaux et de choisir les réglages ; aucune donnée de la voiture n'est lue. Fermer la fenêtre Terminal pour arrêter l'émulateur.

La copie locale de Node est dans `.tools/` et n'est pas publiée. Sur un autre ordinateur, installer Python 3 et Node.js 14 ou plus, puis lancer `node kit/tools/emu.js benspa_vitals`. Sans SDK BMW, l'émulateur utilise `--preview-only`, qui **ne produit pas de paquet installable**. Les temps d'affichage de l'émulateur ne représentent pas les performances de la voiture et les calculateurs ne répondent pas aux requêtes de diagnostic.

## Données et diagnostic

La lecture des calculateurs passe par le filtre `readonly-diag.js`, qui autorise uniquement UDS `22` et OBD `01` / `09` ; aucune commande de codage, d'effacement ou d'actionnement n'est émise par ce lien. Les fonctions et décodages hérités sont décrits en détail dans le projet d'origine. Une absence de réponse ou une valeur périmée n'est pas remplacée par une valeur fictive en mode normal.

## Tests

```sh
node tests/test_values.js
node tests/test_sources.js
node tests/test_dashboard.js
python3 kit/tools/build.py benspa_vitals --preview-only
```

Le catalogue a également été vérifié avec le lecteur du projet MGU Store. Une compilation complète a été exercée dans un répertoire temporaire avec un **faux SDK de test**, puis supprimée ; cela vérifie le conditionnement, pas l'intégration au SDK BMW réel.

## Origine et licences

Base : [cauliflowermossgrape/idrive7-apps](https://github.com/cauliflowermossgrape/idrive7-apps), révision `990c105870edb21bd8f23796fcf95182530790e8`. Les sources originales sont principalement sous licence MIT (voir `LICENSE`). Le moteur graphique `kit/renderd` et son code WebAssembly dans `kit/emu` sont sous GPL-3.0-or-later ; voir leurs licences et mentions respectives. Le SDK BMW n'est pas inclus ni distribué. Le projet n'est pas affilié à BMW.
