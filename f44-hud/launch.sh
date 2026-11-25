#!/bin/sh
# F44 experimental: if the tested upstream release or configuration has
# changed, start upstream unchanged. This runs as hmi_5000, not root.
set -eu
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH
BASE=/var/opt/cluster-render/current
SELF=/var/opt/f44-hud-bridge/current
MARK=/var/opt/cluster-render/state/f44-hud-bridge.pending
fallback() {
    echo "f44-hud-bridge: $*; starting the official renderer" >&2
    exec "$BASE/cluster-render" -c "$BASE/cluster-render.conf"
}
[ "$(readlink "$BASE" 2>/dev/null || true)" = versions/0.8.13 ] || fallback "cluster-render version changed"
[ "$(readlink /var/opt/waze-on-cluster/current 2>/dev/null || true)" = versions/0.14.16 ] || fallback "waze-on-cluster version changed"
[ ! -e /var/opt/cluster-render/cluster-render.local.conf ] || fallback "local configuration exists"
[ "$(sha256sum "$BASE/cluster-render-idrive7" 2>/dev/null | awk '{print $1}')" = 588054bdb7999906906f876c4e12ee82ed6cda19fc209f91c93feea0c55b86d8 ] || fallback "official renderer hash differs"
for conf in /var/opt/cluster-render/conf.d/*.conf /var/opt/*/current/cluster-render.d/*.conf; do
    [ -f "$conf" ] || continue
    if grep -Eq '^[[:space:]]*(hud_slot|hud_size|hud_scene_id|hud_content_class|hud_yield_slots|hud_yield_ms|hud_take_over_stock)[[:space:]]*[+]?=' "$conf"; then
        fallback "another configuration changes HUD settings"
    fi
done
[ -x "$SELF/cluster-render-idrive7" ] && [ -r "$SELF/cluster-render.conf" ] || fallback "F44 renderer or configuration unavailable"
[ ! -e "$MARK" ] || fallback "a previous experimental start did not stabilize"
umask 077
echo "$$" > "$MARK" || fallback "cannot create recovery marker"
(
    sleep 120
    if kill -0 "$$" 2>/dev/null; then rm -f "$MARK"; fi
) </dev/null >/dev/null 2>&1 &
echo 'f44-hud-bridge: starting experimental full HUD slot 0x371' >&2
exec "$SELF/cluster-render-idrive7" -c "$SELF/cluster-render.conf"
