'use strict';
const assert = require('assert');
const dashboard = require('../apps/benspa_vitals/dashboard');
const seen = [], lines = [], fills = [], dots = [];
const cv = {
    text(s,x,y,size,color,opts) { seen.push({s,x,y,size,font:opts && opts.font}); return String(s).length * size / 2; },
    textWidth(s,n) { return String(s).length*n/2; },
    fillRect(...args) { fills.push(args); }, line(...args) { lines.push(args); },
    quad() {}, arc() {}, circle(...args) { dots.push(args); }
};
const t = { text:'white', dim:'gray', warn:'yellow' };
const bars = [];
const G = { pageBottom: () => 512, bar(cv,t,x,y,w,h,spec) { bars.push(spec); } };
const d = { rpm:null, rpmPeak:5000, speed:null, speedUnit:'km/h', gear:null, power:null, powerUnit:'kW', powerMax:215, torque:null, torqueUnit:'Nm', torqueMax:900, boost:null, boostUnit:'bar', boostMax:2.5, tempUnit:'C', peaks:{}, pedal:null, engineLoad:null };
d.warmGuideEnabled = true; d.warmGuide = null;
dashboard.draw(cv, t, G, d);
assert.ok(seen.some(x => x.s === '--'), 'Unavailable readings are explicit');
assert.ok(!seen.some(x => x.s === 'FORCES G'), 'G-force graph has been removed');
assert.ok(seen.some(x => x.s === 'HUILE MOTEUR') && seen.some(x => x.s === 'HUILE BOITE') && seen.some(x => x.s === 'REFROIDISSEMENT'));
assert.strictEqual(lines.filter(x => x[5] === '#69d4ff').length, 0, 'A stale RPM peak is not displayed without current RPM');
assert.ok(!seen.some(x => x.s === 'DEMO'), 'Real mode must not claim demo');
assert.ok(seen.some(x => x.s === 'HUILE --'), 'Missing oil is explicit');
assert.ok(!lines.some(x => x[5] === '#ffb020'), 'Missing oil does not invent a warm-up guide');
seen.length=0; lines.length=0; fills.length=0;
Object.assign(d, {demo:true, speed:96, gear:{letter:'S',num:'3',est:false}, rpm:3000, rpmPeak:5000, redline:7000, rpmMax:8000, warmGuide:3500, instant:8, average:6, oil:85, oilPeak:100, gearbox:null, gearboxPeak:90, coolant:80, coolantPeak:90, tempUnit:'°C', pedal:42, engineLoad:68});
dashboard.draw(cv, t, G, d);
assert.ok(seen.some(x => x.s === 'DEMO'));
assert.ok(seen.some(x => x.s === 'S3'));
const rpm = seen.find(x => x.s === '3000'), gear = seen.find(x => x.s === 'S3'), speed = seen.find(x => x.s === '96');
assert.ok(gear.y < speed.y && speed.y < rpm.y && gear.size > rpm.size && gear.size > speed.size, 'Large gear above speed and RPM');
assert.ok(gear.font === 'gear' && speed.font === 'light' && rpm.font === 'light', 'Bold gear and lighter speed and RPM');
assert.ok(seen.some(x => x.s === 'ACCELERATEUR') && seen.some(x => x.s === 'CHARGE MOTEUR'));
assert.ok(lines.some(x => x[5] === '#69d4ff'), 'Held RPM uses its own stroke');
assert.ok(lines.some(x => x[5] === '#ffb020') && seen.some(x => x.s === 'REPERE PERSO'), 'Cold oil reference is identified and displayed');
assert.ok(fills.some(x => x[4] === '#0872e9') && fills.some(x => x[4] === '#69d4ff'), 'Consumption uses independent tracks');
const Y = n => Math.round(18 + n * (512 - 34) / 465);
const oilNow = fills.find(x => x[1] === Y(204) && x[4] === '#0872e9');
const oilPeak = fills.find(x => x[1] === Y(216) && x[4] === '#69d4ff');
assert.ok(oilNow && oilPeak && oilPeak[2] > oilNow[2], 'Temperature tracks show current and recent maximum');
assert.ok(!fills.some(x => x[1] === Y(321) && x[4] === '#69d4ff'), 'No stale peak when gearbox temperature is unavailable');
const oilWidthC = oilNow[2];
fills.length=0;
Object.assign(d, {tempUnit:'°F', oil:185, oilPeak:212});
dashboard.draw(cv,t,G,d);
const oilWidthF = fills.find(x => x[1] === Y(204) && x[4] === '#0872e9')[2];
assert.ok(Math.abs(oilWidthC-oilWidthF) < 1e-6, 'Celsius and Fahrenheit use the same gauge fraction');
assert.strictEqual(bars.length, 15, 'Five M Vitals bars per page');
console.log('Dashboard: temperature tracks, unit conversion and unavailable readings OK');
