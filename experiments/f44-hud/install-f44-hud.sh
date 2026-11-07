#!/bin/sh
# Experimental F44 profile: interactive, never bypass Store origin silently.
set -eu
fail() { printf '\nARRET : %s\n' "$*" >&2; exit 2; }
[ "$(id -u)" = 0 ] || fail 'lancer en root sur la MGU, après les contrôles à l’arrêt'
base=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exp="$base/mgu-repo/f44-hud-experimental/cluster-render@0.4.900002.tgz"
stock="$base/retour-officiel/cluster-render@0.4.1.tgz"
deploy=/var/opt/mgu-deploy/mgu-deploy.sh
[ -x "$deploy" ] || fail 'mgu-deploy absent'
[ -d /usr/lib/oap-mainapp ] && [ ! -d /usr/lib/oap-mainapp21 ] || fail 'iDrive 7 non confirmé'
[ "$(readlink /var/opt/cluster-render/current)" = 'versions/0.4.1' ] || fail 'renderer actuel différent de 0.4.1 : préparer son retour exact'
[ -f "$exp" ] && [ -f "$stock" ] || fail 'archives absentes de la clé'
printf '%s  %s\n' 68e22e067334af22a3838c5d1c1e90a411d115373b7fa36a167df346d53118e9 "$exp" | sha256sum -c - || fail 'paquet expérimental incorrect'
printf '%s  %s\n' 508753de8ec3699958e4e6f2a146e422cd2efc9b9a5fe512a214202decc75dad "$stock" | sha256sum -c - || fail 'paquet officiel incorrect'
node -e 'var f="/var/opt/mgu-deploy/current/component.json"; try { var v=JSON.parse(require("fs").readFileSync(f,"utf8")).version.split(".").map(Number); if (v.length!==3 || v.some(isNaN) || v[0]===0 && (v[1]<7 || v[1]===7 && v[2]<17)) process.exit(1); console.log("mgu-deploy",v.join(".")); } catch(e) { process.exit(1); }' || fail 'mgu-deploy >= 0.7.17 non vérifié'
state=/var/opt/waze-on-cluster/map.state.conf
[ -f "$state" ] && grep -Eq '^[[:space:]]*hud[[:space:]]*=[[:space:]]*0[[:space:]]*(#.*)?$' "$state" || fail 'désactiver HUD dans l’interface Waze et vérifier que ce choix est enregistré'
guard=/var/opt/cluster-render/state/guard.txt
if [ -f "$guard" ] && grep -Ev '^[[:space:]]*(version|boot)[[:space:]]|^[[:space:]]*(#|$)' "$guard" | grep -q .; then
  fail 'événement présent dans le garde : conserver les preuves et examiner avant de changer de version'
fi
conf=/var/opt/cluster-render/cluster-render.local.conf
if [ -f "$conf" ] && grep -Eq '^[[:space:]]*(hud_slot|hud_size|hud_yield_slots|hud_scene_id|hud_take_over_stock|guard_path|local_conf)[[:space:]]*=' "$conf"; then
  fail 'la configuration locale surcharge le profil ou le garde : sauvegarder et examiner avant de poursuivre'
fi
printf '\nÉtat actuel :\n'
"$deploy" status --json
/var/opt/cluster-render/current/cluster-render status
printf '\nVérification des deux paquets :\n'
"$deploy" check --artifact "$exp"
"$deploy" check --artifact "$stock"
printf '\nCette installation utilise --other-source : le Store ne change pas automatiquement son origine.\n'
printf 'Confirmez seulement si la voiture est à l’arrêt, le HUD Waze désactivé, les slots 0x351 et 0x372 vérifiés,\n'
printf 'la vitesse et les avertissements fonctionnels, et le retour à 0.4.1 possible. Le garde change de version.\n'
printf 'Tapez exactement F44-VERIFIE pour installer, ou Entrée pour annuler : '
IFS= read -r reply
[ "$reply" = F44-VERIFIE ] || fail 'installation annulée'
umask 077
backup="/var/opt/f44-hud-backup-$(date +%Y%m%d-%H%M%S)"
mkdir "$backup" || fail 'impossible de créer une sauvegarde distincte'
for p in "$conf" "$guard" "$state" /var/opt/waze-on-cluster/waze-on-cluster.local.conf /var/opt/mgu-updater/state/origins.json; do
  if [ -f "$p" ]; then cp -p "$p" "$backup/$(basename "$p")"; else printf '%s absent\n' "$p" >> "$backup/absents.txt"; fi
done
readlink /var/opt/cluster-render/current > "$backup/current-link.txt"
"$deploy" status --json > "$backup/status-before.json"
printf '\nSauvegarde : %s — conservez-en une copie hors du véhicule.\n' "$backup"
"$deploy" install --artifact "$exp" --other-source --yes
printf '\nVersion installée :\n'
readlink /var/opt/cluster-render/current
"$deploy" status --json
/var/opt/cluster-render/current/cluster-render status
printf '\nHUD Waze toujours désactivé. Lire la procédure avant de l’activer à l’arrêt.\n'
