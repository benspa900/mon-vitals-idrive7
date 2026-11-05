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
module.exports = { averageFuel, instantFuel, warmRpm };
