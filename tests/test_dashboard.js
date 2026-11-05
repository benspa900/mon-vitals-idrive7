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
const t={text:'white',dim:'gray',warn:'yellow',hotRamp:['#1f5fd0','#3d9bff','#3d9bff','#c04cdc','#ef2b2d']};
const {ramp,mix}=require('../kit/runtime/canvas');
const G={pageBottom:()=>512,ramp,mix,smooth:(key,value)=>value,segBar(cv,t,x,y,w,h,spec) {bars.push({theme:t,x,y,w,h,spec});}};
const d={rpm:null,rpmPeak:5000,speed:null,speedUnit:'km/h',gear:null,power:null,powerUnit:'kW',powerMax:215,torque:null,torqueUnit:'Nm',torqueMax:900,boost:null,boostUnit:'bar',boostMax:2.5,tempUnit:'°C',peaks:{},pedal:null,engineLoad:null,warmGuideEnabled:true,warmGuide:null};
const Y=n=>Math.round(18+n*(512-34)/465);
dashboard.draw(cv,t,G,d);
assert.ok(seen.some(x=>x.s==='--'));
assert.ok(seen.some(x=>x.s==='HUILE --'));
assert.ok(!lines.some(x=>x[5]==='#ffb020'),'No cold reference without oil');
assert.strictEqual(bars.length,4,'Consumption and three temperature bars on the left');
assert.strictEqual(bars[2].spec.peak,null,'No stale gearbox maximum');
assert.ok(!quads.some(q=>q.pts[0][0]>=1137 && q.color!=='#293b48'),'No invented right-hand value');
seen.length=lines.length=fills.length=bars.length=quads.length=0;
Object.assign(d,{demo:true,speed:96,gear:{letter:'S',num:'3',est:false},rpm:3000,rpmPeak:5000,redline:7000,rpmMax:8000,warmGuide:3500,instant:8,average:6,oil:60,oilPeak:85,oilWarm:80,gearbox:59,gearboxPeak:70,gearboxWarm:60,coolant:79,coolantPeak:85,coolantWarm:80,power:100,powerMax:200,peaks:{power:150},pedal:42,engineLoad:68});
dashboard.draw(cv,t,G,d);
const rpm=seen.find(x=>x.s==='3000'),gear=seen.find(x=>x.s==='S3'),speed=seen.find(x=>x.s==='96');
assert.ok(gear.y<speed.y && speed.y<rpm.y && gear.size>rpm.size && gear.size>speed.size);
assert.ok(gear.font==='gear' && speed.font==='light' && rpm.font==='light');
assert.ok(seen.some(x=>x.s==='Rev Limit') && lines.some(x=>x[5]==='#ffb020'));
assert.strictEqual(lines.filter(x=>x[5]==='#ffd27a').length,2,'A visible warm-up boundary appears on both RPM gauges');
assert.ok(quads.some(q=>q.color==='#98510f'),'Warm-up zone is visible in the RPM gauge');
const rpmColors=quads.filter(q=>q.pts[0][0]<1137 && q.pts[0][0]>400 && Array.isArray(q.color)).map(q=>q.color.join(','));
assert.ok(new Set(rpmColors).size>8,'RPM bands use a continuous colour ramp');
assert.strictEqual(bars.length,4);
assert.strictEqual(bars[0].spec.value,8,'Consumption uses the actual value');
assert.strictEqual(bars[0].spec.ramp,'hot','Consumption uses M Vitals colours');
assert.strictEqual(bars[0].spec.smooth,3.5,'Consumption bar uses gradual motion');
assert.strictEqual(bars[0].spec.step,20/16,'Consumption uses 16 segments');
assert.ok(lines.some(x=>x[5]==='#81c4ff' && x[1]===Y(97)-3),'Average is a distinct consumption marker');
assert.ok(bars.slice(1).every(b=>b.spec.color==='#ff9c28' && b.theme.hang==='#ffd27a'),'Cold temperatures and peaks remain orange');
assert.strictEqual(bars[1].spec.peak,85,'Temperature peak is preserved');
const first=Y(28+48),second=Y(28+60);
const now=quads.filter(q=>q.pts[0][0]>=1137 && q.pts[0][1]===first && q.color!=='#293b48');
const peak=quads.filter(q=>q.pts[0][0]>=1137 && q.pts[0][1]===second && q.color!=='#293b48');
assert.ok(now.length===8 && peak.length===12,'Right current and maximum have independent segmented tracks');
assert.notStrictEqual(now[0].color,now[7].color,'M Vitals gradient changes across the scale');
assert.notStrictEqual(now[0].color,peak[0].color,'Peak track remains distinct');
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
assert.ok(bars.slice(1).every(b=>b.spec.color==='#1f5fd0'),'At threshold gauges return to blue');
// The highlighted boundary moves up as oil warms and disappears when unavailable or fully warm.
function guideMark(guide) {
    lines.length=quads.length=0; d.warmGuide=guide; d.rpm=6500;
    dashboard.draw(cv,t,G,d);
    return lines.filter(x=>x[5]==='#ffd27a');
}
const coldMark=guideMark(3500), warmerMark=guideMark(5300);
assert.strictEqual(coldMark.length,2);
assert.strictEqual(warmerMark.length,2);
assert.ok(warmerMark[0][1]<coldMark[0][1],'Warm boundary moves upward with temperature');
assert.ok(quads.some(q=>q.color==='#ff9e22'),'Current RPM is orange in the warm-up zone');
assert.strictEqual(guideMark(7000).length,0,'No warm-up boundary at the configured redline');
assert.strictEqual(guideMark(null).length,0,'No fabricated boundary without oil data');
// Exercise the real time-based smoother through the dashboard: numbers and maximum stay raw,
// the live bar moves between readings, and missing data removes it immediately.
const realSmooth=require('../kit/runtime/gauges').smooth, realNow=Date.now;
try {
    let clock=100000;
    Date.now=()=>clock;
    G.smooth=realSmooth;
    Object.assign(d,{rpm:null,pedal:0,engineLoad:0,peaks:{pedal:100,engineLoad:100}});
    dashboard.draw(cv,t,G,d);
    seen.length=quads.length=0;
    clock+=16;
    Object.assign(d,{pedal:100,engineLoad:100});
    dashboard.draw(cv,t,G,d);
    const trackY=Y(28+3*92+48);
    const liveFill=()=>quads.filter(q=>q.pts[0][0]>=1137 && q.pts[0][1]===trackY && q.color!=='#293b48')
        .reduce((sum,q)=>sum+q.pts[1][0]-q.pts[0][0],0);
    const startFill=liveFill();
    assert.ok(startFill>0 && startFill<100,'Pedal bar interpolates instead of jumping to 100%');
    assert.ok(seen.some(x=>x.s==='100'),'Displayed value remains the latest measurement');
    for(let i=0;i<100;i++) { clock+=16; quads.length=0; dashboard.draw(cv,t,G,d); }
    assert.ok(liveFill()>startFill+200,'Pedal bar continues toward the actual reading');
    clock+=16; quads.length=0;
    Object.assign(d,{pedal:null,engineLoad:null});
    dashboard.draw(cv,t,G,d);
    assert.strictEqual(liveFill(),0,'Missing pedal data clears the smoothed bar immediately');
} finally { Date.now=realNow; }
console.log('Dashboard: live values, smooth bars, maximums and missing data OK');
