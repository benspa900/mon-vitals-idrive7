'use strict';
const assert = require('assert');
const dashboard = require('../apps/benspa_vitals/dashboard');
const seen = [], lines = [], fills = [], dots = [];
const cv = {
    text(s,x,y,size,color,opts) { seen.push({s,x,y,size}); return String(s).length * size / 2; },
    textWidth(s,n) { return String(s).length*n/2; },
    fillRect(...args) { fills.push(args); }, line(...args) { lines.push(args); },
    quad() {}, arc() {}, circle(...args) { dots.push(args); }
};
const t = { text:'white', dim:'gray', warn:'yellow' };
const bars = [];
const G = { pageBottom: () => 512, bar(cv,t,x,y,w,h,spec) { bars.push(spec); } };
const d = { rpm:null, rpmPeak:5000, speed:null, speedUnit:'km/h', gear:null, power:null, powerUnit:'kW', powerMax:215, torque:null, torqueUnit:'Nm', torqueMax:900, boost:null, boostUnit:'bar', boostMax:2.5, tempUnit:'C', peaks:{}, pedal:null, engineLoad:null };
dashboard.draw(cv, t, G, d);
assert.ok(seen.some(x => x.s === '--'), 'Unavailable readings are explicit');
assert.strictEqual(dots.filter(x => x[3] === '#69d4ff').length, 0, 'No fabricated g-force dot');
assert.strictEqual(lines.filter(x => x[5] === '#69d4ff').length, 0, 'A stale RPM peak is not displayed without current RPM');
assert.ok(!seen.some(x => x.s === 'DEMO'), 'Real mode must not claim demo');
seen.length=0; lines.length=0; fills.length=0;
Object.assign(d, {demo:true, speed:96, gear:{letter:'S',num:'3',est:false}, rpm:3000, rpmPeak:5000, instant:8, average:6, gLat:0.1, gLong:0.2, pedal:42, engineLoad:68});
dashboard.draw(cv, t, G, d);
assert.ok(seen.some(x => x.s === 'DEMO'));
assert.ok(seen.some(x => x.s === 'S3'));
const rpm = seen.find(x => x.s === '3000'), gear = seen.find(x => x.s === 'S3'), speed = seen.find(x => x.s === '96');
assert.ok(gear.y < speed.y && speed.y < rpm.y && gear.size > rpm.size && gear.size > speed.size, 'Large gear above speed and RPM');
assert.ok(seen.some(x => x.s === 'ACCELERATEUR') && seen.some(x => x.s === 'CHARGE MOTEUR'));
assert.ok(lines.some(x => x[5] === '#69d4ff'), 'Held RPM uses its own stroke');
assert.ok(fills.some(x => x[4] === '#0872e9') && fills.some(x => x[4] === '#69d4ff'), 'Consumption uses independent tracks');
assert.strictEqual(dots.filter(x => x[3] === '#69d4ff').length, 1, 'A measured g-force dot is rendered');
assert.strictEqual(bars.length, 10, 'Five M Vitals bars per page');
console.log('Dashboard: two RPM and consumption tracks, missing values and g-force OK');
