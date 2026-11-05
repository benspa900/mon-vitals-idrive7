'use strict';
const assert = require('assert');
const dashboard = require('../apps/benspa_vitals/dashboard');
const seen=[], lines=[], fills=[], bars=[], quads=[];
const cv={
    text(s,x,y,size,color,opts) { seen.push({s,x,y,size,font:opts && opts.font}); return String(s).length*size/2; },
    textWidth(s,n) {return String(s).length*n/2;},
    fillRect(...args) {fills.push(args);}, line(...args) {lines.push(args);},
    quad(pts,color) {quads.push({pts,color});}, arc() {}, circle() {}
};
const t={text:'white',dim:'gray',warn:'yellow'};
const G={pageBottom:()=>512,segBar(cv,t,x,y,w,h,spec) {bars.push({theme:t,x,y,w,h,spec});}};
const d={rpm:null,rpmPeak:5000,speed:null,speedUnit:'km/h',gear:null,power:null,powerUnit:'kW',powerMax:215,torque:null,torqueUnit:'Nm',torqueMax:900,boost:null,boostUnit:'bar',boostMax:2.5,tempUnit:'°C',peaks:{},pedal:null,engineLoad:null,warmGuideEnabled:true,warmGuide:null};
const Y=n=>Math.round(18+n*(512-34)/465);
dashboard.draw(cv,t,G,d);
assert.ok(seen.some(x=>x.s==='--'));
assert.ok(seen.some(x=>x.s==='HUILE --'));
assert.ok(!lines.some(x=>x[5]==='#ffb020'),'No cold reference without oil');
assert.strictEqual(bars.length,4,'Consumption and three temperature bars on the left');
assert.strictEqual(bars[2].spec.peak,null,'No stale gearbox maximum');
assert.ok(!quads.some(q=>q.pts[0][0]>=1137 && (q.color==='#0872e9'||q.color==='#69d4ff')),'No invented right-hand value');
seen.length=lines.length=fills.length=bars.length=quads.length=0;
Object.assign(d,{demo:true,speed:96,gear:{letter:'S',num:'3',est:false},rpm:3000,rpmPeak:5000,redline:7000,rpmMax:8000,warmGuide:3500,instant:8,average:6,oil:60,oilPeak:85,oilWarm:80,gearbox:59,gearboxPeak:70,gearboxWarm:60,coolant:79,coolantPeak:85,coolantWarm:80,power:100,powerMax:200,peaks:{power:150},pedal:42,engineLoad:68});
dashboard.draw(cv,t,G,d);
const rpm=seen.find(x=>x.s==='3000'),gear=seen.find(x=>x.s==='S3'),speed=seen.find(x=>x.s==='96');
assert.ok(gear.y<speed.y && speed.y<rpm.y && gear.size>rpm.size && gear.size>speed.size);
assert.ok(gear.font==='gear' && speed.font==='light' && rpm.font==='light');
assert.ok(seen.some(x=>x.s==='Rev Limit') && lines.some(x=>x[5]==='#ffb020'));
assert.strictEqual(bars.length,4);
assert.strictEqual(bars[0].spec.value,8,'Consumption uses the actual value');
assert.ok(lines.some(x=>x[5]==='#69d4ff' && x[1]===Y(97)-3),'Average is a distinct consumption marker');
assert.ok(bars.slice(1).every(b=>b.spec.color==='#ff9c28' && b.theme.hang==='#ffd27a'),'Cold temperatures and peaks remain orange');
assert.strictEqual(bars[1].spec.peak,85,'Temperature peak is preserved');
const first=Y(28+48),second=Y(28+60);
const now=quads.filter(q=>q.pts[0][0]>=1137 && q.pts[0][1]===first && q.color==='#0872e9');
const peak=quads.filter(q=>q.pts[0][0]>=1137 && q.pts[0][1]===second && q.color==='#69d4ff');
assert.ok(now.length===8 && peak.length===12,'Right current and maximum have independent segmented tracks');
const fractionC=(bars[1].spec.value-bars[1].spec.min)/(bars[1].spec.max-bars[1].spec.min);
bars.length=0;
Object.assign(d,{tempUnit:'°F',oil:140,oilPeak:185,oilWarm:176,gearbox:138.2,gearboxPeak:158,gearboxWarm:140,coolant:174.2,coolantPeak:185,coolantWarm:176});
dashboard.draw(cv,t,G,d);
const fractionF=(bars[1].spec.value-bars[1].spec.min)/(bars[1].spec.max-bars[1].spec.min);
assert.ok(Math.abs(fractionC-fractionF)<1e-6,'Temperature scale consistent across units');
assert.ok(bars.slice(1).every(b=>b.spec.color==='#ff9c28'),'Fahrenheit thresholds correspond');
bars.length=0;
Object.assign(d,{tempUnit:'°C',oil:80,oilWarm:80,gearbox:60,gearboxWarm:60,coolant:80,coolantWarm:80});
dashboard.draw(cv,t,G,d);
assert.ok(bars.slice(1).every(b=>b.spec.color==='#0872e9'),'At threshold gauges return to blue');
console.log('Dashboard: left gauges, right double tracks, temperatures and missing data OK');
