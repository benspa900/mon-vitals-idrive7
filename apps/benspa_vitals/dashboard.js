'use strict';
/** Single-page dashboard. All inputs are decoded by the caller; null means unavailable. */
const finite = (x) => typeof x === 'number' && isFinite(x);
const text = (x, digits) => finite(x) ? x.toFixed(digits || 0).replace('.', ',') : '--';
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function draw(cv, t, G, d) {
    const left = 28, right = 1124, side = 440, cx = 800;
    // Use the extra space reported by the full-screen renderer; software gets 512.
    const bottom = G.pageBottom(cv);
    const Y = y => Math.round(22 + y * (bottom - 40) / 445);
    const ink = t.text, dim = t.dim, blue = t.accent;
    const label = (s, x, y, align) => cv.text(s, x, y, 25, dim, { font: 'bold', align: align || 'left', spacing: 1 });
    const metricLabel = (s, x, y, align) => {
        const right = align === 'right';
        const tx = right ? x : x + 32;
        const width = cv.textWidth(s, 25, { font: 'bold', spacing: 1 });
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
        G.segBar(cv, t, x, y, w, 28, { panel: false, value: v, min: 0, max, step, ramp: 'hot', limit: max,
            scale: { every: max / 3, decimals: decimals || 0, size: 18, labelY: 21 },
            marks: finite(peak) && (!finite(v) || peak > v) ? [{ value: clamp(peak, 0, max), color: 'warn' }] : [] });
    };
    const peak = d.peaks || {};
    // left column
    metricLabel(d.powerEstimated ? 'PUISSANCE (CALC.)' : 'PUISSANCE', left, Y(22));
    value(d.power, d.powerUnit, left, Y(80), 64);
    bar(left, Y(99), side, d.power, d.powerMax, d.powerMax / 12, peak.power, 0);
    metricLabel('TURBO', left, Y(170));
    value(d.boost, d.boostUnit, left, Y(220), 64, 'left', 2);
    bar(left, Y(238), side, d.boost, d.boostMax, d.boostMax / 10, peak.boost, 1);
    metricLabel('CONSOMMATION', left, Y(310));
    label('INSTANT.', left, Y(354));
    value(d.instant, '', left + 135, Y(357), 38, 'left', 1);
    label('MOY.', left + 245, Y(354));
    value(d.average, '', left + 320, Y(357), 38, 'left', 1);
    label('L/100 KM', left, Y(388));
    // White = instantaneous, yellow = average (not a peak marker on this gauge).
    bar(left, Y(404), side, d.instant, 20, 1, null, 0);
    if (finite(d.average)) {
        const px = left + clamp(d.average / 20, 0, 1) * (side - 18);
        cv.fillRect(px, Y(404) - 7, 4, 37, t.warn);
    }
    // centre: RPM over speed and gear
    label('REGIME MOTEUR', cx, Y(22), 'center');
    centeredValue(d.rpm, 'tr/min', cx, Y(85), 68);
    const rm = finite(d.rpmMax) && d.rpmMax > 0 ? d.rpmMax : 8000;
    G.segBar(cv, t, 510, Y(99), 580, 31, { panel: false, value: d.rpm, min: 0, max: rm, step: 500,
        ramp: 'hot', limit: d.redline, scale: { every: 1000, div: 1000, size: 21, labelY: 31 } });
    cv.line(490, Y(164), 1110, Y(164), 1, dim);
    centeredValue(d.speed, d.speedUnit, 645, Y(255), 84);
    const gear = d.gear ? d.gear.letter + d.gear.num : '--';
    cv.text(gear, 960, Y(255), 90, d.gear ? ink : dim, { font: 'gear', align: 'center' });
    label(d.gear && d.gear.est ? 'RAPPORT EST.' : 'RAPPORT', 960, Y(284), 'center');
    cv.line(cx, Y(184), cx, Y(295), 2, dim);
    cv.line(490, Y(315), 1110, Y(315), 1, dim);
    const tyres = ['AVG', 'AVD', 'ARG', 'ARD'];
    tyres.forEach((name, i) => {
        const x = 510 + i * 150, p = (d.pressures || [])[i] || {};
        label(name, x, Y(355));
        cv.text(text(p.actual, 1), x, Y(395), 42, finite(p.actual) ? ink : dim, { font: 'num' });
        cv.text('CIBLE ' + text(p.target, 1), x, Y(427), 22, dim, { font: 'bold' });
    });
    label(d.pressureUnit || 'bar', 1085, Y(355), 'right');
    // right column (labels and values align right)
    const rx = right + side;
    metricLabel('COUPLE', rx, Y(22), 'right');
    value(d.torque, d.torqueUnit, rx, Y(80), 64, 'right');
    bar(right, Y(99), side, d.torque, d.torqueMax, d.torqueMax / 12, peak.torque, 0);
    metricLabel('LIQUIDE REFROID.', rx, Y(170), 'right');
    value(d.coolant, d.tempUnit, rx, Y(220), 64, 'right');
    G.bar(cv, t, right, Y(238), side, 55, { head: false, value: d.coolant, min: 40, max: 130, step: 30 });
    metricLabel('HUILE MOTEUR', rx - 125, Y(348), 'right');
    value(d.oil, d.tempUnit, rx, Y(352), 43, 'right');
    metricLabel('HUILE DE BOITE', rx - 125, Y(407), 'right');
    value(d.gearbox, d.tempUnit, rx, Y(411), 43, 'right');
    if (d.demo) cv.text('DEMO', cx, bottom - 8, 22, t.warn, { font: 'bold', align: 'center' });
}
module.exports = { draw };
