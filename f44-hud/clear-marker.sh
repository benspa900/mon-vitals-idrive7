#!/bin/sh
set -eu
rm -f /var/opt/cluster-render/state/f44-hud-bridge.pending
echo '{"reboot":"Redémarrer iDrive pour appliquer le changement du moteur HUD F44."}'
