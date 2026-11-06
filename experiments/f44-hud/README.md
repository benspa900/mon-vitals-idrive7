# Experimental F44 small HUD source patch

This is an **unbuilt, uninstalled source patch**, not a Store catalog or a vehicle-ready package. It is intended for review and development; do not install it in a car as-is.

The F44 logs show the instrument cluster map working while the HUD target waits on locked slot 0x323. The proposed alternative slot 0x351 and 232x132 dimensions were reported working on a different F40 in [upstream issue #85](https://github.com/robertnisipeanu/idrive-apps/issues/85). Their availability and suitability on this F44 have not been verified.

## Patch

Based on upstream idrive-apps commit `88e8554b1d81593d85f8095b4f0c38213223990d` (cluster-render 0.4.1). The patch permits manually selecting slot 0x351 in addition to the unchanged default slot 0x323. It preserves the required HUD scene, refusal of stock takeover, shared budget, and two-strike guard. It does not automatically select or install the profile.

If the car's slot table confirms 0x351 is available and 0x372 is the appropriate popup slot, the hypothetical local test profile, adapted from issue #85, is:

```ini
hud_slot = 0x351
hud_yield_slots = 0x372
hud_size = 232x132
```

These values are hypotheses for the F44, not verified settings. Check other installed apps that use the HUD, and keep a documented rollback to the currently installed build and existing local configuration before any deployment. Stop if warnings or the speed display are obscured, the cluster restarts, or the guard trips.

## Verification

The upstream `holds_test` compiled locally with C++14, warnings as errors, and all checks passed, including tests for the new slot and refusal of stock takeover. A full target build, packaging, on-car slot-table inspection, and vehicle tests remain outstanding. No compiled binary or installation steps are provided.
