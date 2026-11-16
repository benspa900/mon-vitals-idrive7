#!/bin/sh
# F44 experimental: if the tested upstream release or configuration has
# changed, start upstream unchanged. This runs as hmi_5000, not root.
set -eu
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH
BASE=/var/opt/cluster-render/current
WSTATE=/var/opt/waze-on-cluster/map.state.conf
SELF=/var/opt/f44-hud-bridge/current
MARK=/var/opt/cluster-render/state/f44-hud-bridge.pending
fallback() {
    echo "f44-hud-bridge: $*; starting the official renderer" >&2
    exec "$BASE/cluster-render" -c "$BASE/cluster-render.conf"
}
[ "$(readlink "$BASE" 2>/dev/null || true)" = versions/0.6.4 ] || fallback "cluster-render version changed"
[ "$(readlink /var/opt/waze-on-cluster/current 2>/dev/null || true)" = versions/0.10.3 ] || fallback "waze-on-cluster version changed"
[ ! -e /var/opt/cluster-render/cluster-render.local.conf ] || fallback "local configuration exists"
[ -r "$WSTATE" ] || fallback "Waze HUD settings unavailable"
grep -Eq '^[[:space:]]*hud_keep_shown[[:space:]]*=[[:space:]]*0[[:space:]]*$' "$WSTATE" || fallback "HUD-over-popups is enabled or unavailable"
[ "$(sha256sum "$BASE/cluster-render-idrive7" 2>/dev/null | awk '{print $1}')" = a04d35d6504516740df74063f00f72a3bd6a37533ba290905932b2a08a709bc6 ] || fallback "official renderer hash differs"
for conf in /var/opt/cluster-render/conf.d/*.conf /var/opt/*/current/cluster-render.d/*.conf; do
    [ -f "$conf" ] || continue
    if grep -Eq '^[[:space:]]*(hud_slot|hud_size|hud_scene_id|hud_yield_slots|hud_take_over_stock)[[:space:]]*=' "$conf"; then
        fallback "another configuration changes HUD settings"
    fi
done
[ ! -e "$MARK" ] || fallback "a previous experimental start did not stabilize"
umask 077
echo "$$" > "$MARK" || fallback "cannot create recovery marker"
(
    sleep 120
    if kill -0 "$$" 2>/dev/null; then rm -f "$MARK"; fi
) </dev/null >/dev/null 2>&1 &
echo 'f44-hud-bridge: starting experimental full HUD slot 0x371' >&2
exec "$SELF/cluster-render-idrive7" -c "$SELF/cluster-render.conf"
