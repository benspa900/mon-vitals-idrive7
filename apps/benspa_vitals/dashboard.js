'use strict';
/** Single-page dashboard. All inputs are decoded by the caller; null means unavailable. */
const finite = (x) => typeof x === 'number' && isFinite(x);
const text = (x, digits) => finite(x) ? x.toFixed(digits || 0).replace('.', ',') : '--';
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function draw(cv, t, G, d) {
    const left = 28, right = 1124, side = 440, cx = 800;
    const ink = t.text, dim = t.dim, blue = t.accent;
    const label = (s, x, y, align) => cv.text(s, x, y, 22, dim, { font: 'bold', align: align || 'left', spacing: 1 });
    const metricLabel = (s, x, y, align) => {
        const right = align === 'right';
        const tx = right ? x : x + 32;
        const width = cv.textWidth(s, 22, { font: 'bold', spacing: 1 });
        const ix = (right ? x - width : x) - (right ? 30 : 0);
        const colors = ['#81c4ff', '#16588e', '#e7222e'];
        colors.forEach((c, i) => { const q = ix + i * 8; cv.quad([[q + 5,y - 17],[q + 11,y - 17],[q + 6,y - 3],[q,y - 3]], c); });
        label(s, tx, y, align);
    };
    const value = (v, unit, x, y, size, align, decimals) => {
        const s = text(v, decimals), a = align || 'left';
        if (a === 'right') {
            const unitWidth = cv.textWidth(' ' + unit, 24);
            cv.text(s, x - unitWidth, y, size, finite(v) ? ink : dim, { font: 'num', align: 'right' });
            cv.text(' ' + unit, x, y, 24, dim, { align: 'right' });
        } else {
            const w = cv.text(s, x, y, size, finite(v) ? ink : dim, { font: 'num' });
            cv.text(' ' + unit, x + w, y, 24, dim);
        }
    };
    const centeredValue = (v, unit, center, y, size) => {
        const s = text(v, 0), n = cv.textWidth(s, size, { font: 'num' });
        const u = cv.textWidth(' ' + unit, 24);
        value(v, unit, center - (n + u) / 2, y, size);
    };
    const bar = (x, y, w, v, max, step, peak, decimals) => {
        max = finite(max) && max > 0 ? max : 1;
        G.segBar(cv, t, x, y, w, 22, { panel: false, value: v, min: 0, max, step, ramp: 'hot', limit: max,
            scale: { every: max / 3, decimals: decimals || 0, size: 18, labelY: 30 },
            marks: finite(peak) && (!finite(v) || peak > v) ? [{ value: clamp(peak, 0, max), color: 'warn' }] : [] });
    };
    const peak = d.peaks || {};
    // left column
    metricLabel(d.powerEstimated ? 'PUISSANCE (CALC.)' : 'PUISSANCE', left, 30);
    value(d.power, d.powerUnit, left, 76, 54);
    bar(left, 92, side, d.power, d.powerMax, d.powerMax / 12, peak.power, 0);
    metricLabel('TURBO', left, 170);
    value(d.boost, d.boostUnit, left, 216, 54, 'left', 2);
    bar(left, 232, side, d.boost, d.boostMax, d.boostMax / 10, peak.boost, 1);
    metricLabel('CONSOMMATION', left, 310);
    label('INSTANT.', left, 354);
    value(d.instant, '', left + 125, 357, 33, 'left', 1);
    label('MOY.', left + 235, 354);
    value(d.average, '', left + 310, 357, 33, 'left', 1);
    label('L/100 KM', left, 388);
    // White = instantaneous, yellow = average (not a peak marker on this gauge).
    bar(left, 404, side, d.instant, 20, 1, null, 0);
    if (finite(d.average)) {
        const px = left + clamp(d.average / 20, 0, 1) * (side - 18);
        cv.fillRect(px, 397, 4, 31, t.warn);
    }
    // centre: RPM over speed and gear
    label('REGIME MOTEUR', cx, 30, 'center');
    centeredValue(d.rpm, 'tr/min', cx, 78, 62);
    const rm = finite(d.rpmMax) && d.rpmMax > 0 ? d.rpmMax : 8000;
    G.segBar(cv, t, 510, 93, 580, 25, { panel: false, value: d.rpm, min: 0, max: rm, step: 500,
        ramp: 'hot', limit: d.redline, scale: { every: 1000, div: 1000, size: 18, labelY: 29 } });
    cv.line(490, 164, 1110, 164, 1, dim);
    centeredValue(d.speed, d.speedUnit, 645, 255, 70);
    const gear = d.gear ? d.gear.letter + d.gear.num : '--';
    cv.text(gear, 960, 255, 76, d.gear ? ink : dim, { font: 'gear', align: 'center' });
    label(d.gear && d.gear.est ? 'RAPPORT EST.' : 'RAPPORT', 960, 284, 'center');
    cv.line(cx, 184, cx, 295, 2, dim);
    cv.line(490, 315, 1110, 315, 1, dim);
    const tyres = ['AVG', 'AVD', 'ARG', 'ARD'];
    tyres.forEach((name, i) => {
        const x = 510 + i * 150, p = (d.pressures || [])[i] || {};
        label(name, x, 355);
        cv.text(text(p.actual, 1), x, 395, 34, finite(p.actual) ? ink : dim, { font: 'num' });
        cv.text('CIBLE ' + text(p.target, 1), x, 427, 18, dim, { font: 'bold' });
    });
    label(d.pressureUnit || 'bar', 1085, 355, 'right');
    // right column (labels and values align right)
    const rx = right + side;
    metricLabel('COUPLE', rx, 30, 'right');
    value(d.torque, d.torqueUnit, rx, 76, 54, 'right');
    bar(right, 92, side, d.torque, d.torqueMax, d.torqueMax / 12, peak.torque, 0);
    metricLabel('LIQUIDE REFROID.', rx, 170, 'right');
    value(d.coolant, d.tempUnit, rx, 216, 54, 'right');
    G.bar(cv, t, right, 232, side, 55, { head: false, value: d.coolant, min: 40, max: 130, step: 30 });
    metricLabel('HUILE MOTEUR', rx - 120, 348, 'right');
    value(d.oil, d.tempUnit, rx, 352, 36, 'right');
    metricLabel('HUILE DE BOITE', rx - 120, 407, 'right');
    value(d.gearbox, d.tempUnit, rx, 411, 36, 'right');
    if (d.demo) cv.text('DEMO', cx, 488, 22, t.warn, { font: 'bold', align: 'center' });
}
module.exports = { draw };
