'use strict';
// Identifiers from the upstream Live Data DME8FF_R index and the ZF 8HP reader.
// A response from another controller must never be decoded with these layouts.
const DME8 = new Set(['0F2422','0F2424','0F2426','0F2427','0F2428','0F2429','0F242A','0F242C','0F242E','0F2460','0F25A0','0F25A2','0F26B4','0F26B8','0F26BC','0F26E0','0F26E4','0F26E8','0F2930']);
const EGS = new Set(['0F25D0','0F21E0']);
// Standard relative pedal and calculated load, with UDS equivalents.
const PEDAL = [
    { obd:'5A', bytes:1, factor:100/255, min:0, max:100, timeoutMs:1200 },
    { did:'F45A', bytes:1, factor:100/255, min:0, max:100, timeoutMs:1200 },
];
const ENGINE_LOAD = [
    { obd:'04', bytes:1, factor:100/255, min:0, max:100, timeoutMs:1200 },
    { did:'F404', bytes:1, factor:100/255, min:0, max:100, timeoutMs:1200 },
];
function pedalCandidates(id) {
    return DME8.has(id) ? [{ did:'5814', bytes:2, signed:true, factor:0.01220703, min:0, max:100, timeoutMs:1200 }].concat(PEDAL) : PEDAL;
}
function payload(b, a, c, length) {
    return Array.isArray(b) && b.length === 3 + length && b[0] === 0x62 && b[1] === a && b[2] === c ? b.slice(3) : null;
}
function identification(b) {
    const v = payload(b, 0xF1, 0x50, 3);
    return v ? v.map(x => ('0' + x.toString(16).toUpperCase()).slice(-2)).join('') : null;
}
function fuel5656(b) {
    const v = payload(b, 0x56, 0x56, 2);
    if (!v) return null;
    const n = v[0] * 256 + v[1];
    if (n === 65535) return null;
    const lph = n * 0.00119209 * 3.6;
    return lph <= 250 ? lph : null;
}
function temperature(b, did, offset, factor) {
    const v = payload(b, did >> 8, did & 255, 1);
    if (!v || v[0] === 255) return null;
    const n = v[0] * factor + offset;
    return n >= -40 && n <= 150 ? n : null;
}
async function readFuel(link, reader, dmeId, candidates) {
    let n = null, source = null;
    if (DME8.has(dmeId)) {
        n = fuel5656(await link.read(0x12, 0x5656, 1500));
        if (n !== null) source = 'DME 5656';
    }
    if (n === null) {
        n = await reader.value('fuelRate', candidates);
        if (n !== null) source = 'OBD 5E / UDS F45E';
    }
    return { value: n, source };
}
async function readDmeGearbox(link, dmeId) {
    if (!DME8.has(dmeId)) return null;
    return temperature(await link.read(0x12, 0x4650, 1500), 0x4650, -48, 0.75);
}
async function readEgsGearbox(link, egsId) {
    if (!EGS.has(egsId)) return null;
    return temperature(await link.read(0x18, 0x6000, 1500), 0x6000, -40, 1);
}
module.exports = { DME8, EGS, PEDAL, ENGINE_LOAD, pedalCandidates, identification, fuel5656, temperature, readFuel, readDmeGearbox, readEgsGearbox };
