'use strict';
/** The vehicle's BC1 average is trusted only with a known L/100 km unit. */
function averageFuel(v) {
    const unit = v && v.statusUnitOfMeasurementConsumptionBC;
    const raw = v && v.consumptionAverage1BC1;
    return (unit === 1 || unit === 'VERBRAUCH_IN_L_S_100KM') && typeof raw === 'number' && isFinite(raw) && raw >= 0 && raw < 65535 ? raw * 0.1 : null;
}
/** OBD PID 5E reports litres/hour; L/100 km is meaningless at a standstill. */
function instantFuel(lph, speed) {
    if (typeof lph !== 'number' || !isFinite(lph) || lph < 0 || typeof speed !== 'number' || !isFinite(speed) || speed < 5) return null;
    return lph * 100 / speed;
}
/** Custom warm-up reference, derived from the upstream Warm-Up app, never an OEM limit. */
function warmRpm(oilC, redline, cold, warmC) {
    if (![oilC,redline,cold,warmC].every(x => typeof x === 'number' && isFinite(x)) || redline <= 0 || cold <= 0 || warmC <= 30) return null;
    cold = Math.min(cold, redline);
    const fraction = Math.max(0, Math.min(1, (oilC - 30) / (warmC - 30)));
    return Math.min(redline, Math.round((cold + (redline-cold)*fraction)/100)*100);
}
/** Stable, session-local scale: expand for actual/held values; never infer missing readings. */
function expandScale(state, key, base, current, peak, step) {
    const finite = x => typeof x === 'number' && isFinite(x);
    if (!finite(base) || base <= 0 || !finite(step) || step <= 0) return null;
    const needed = finite(current) ? Math.max(0, current, finite(peak) ? peak : 0) : 0;
    const expanded = Math.ceil((needed - 1e-9) / step) * step;
    const max = Math.max(base, state[key] || 0, expanded);
    state[key] = Math.round(max * 1000) / 1000;
    return state[key];
}
module.exports = { averageFuel, instantFuel, warmRpm, expandScale };
