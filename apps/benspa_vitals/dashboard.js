'use strict';
/** Single-page display; null is unavailable, never a fabricated measurement. */
const finite = x => typeof x === 'number' && isFinite(x);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const number = (n, decimals) => finite(n) ? n.toFixed(decimals || 0).replace('.', ',') : '--';

function draw(cv, t, G, d) {
    // Spread the composition down the available page, including the extra full-screen area.
    const bottom = G.pageBottom(cv), Y = n => Math.round(18 + n * (bottom - 34) / 465);
    const white = t.text, dim = t.dim, muted = '#293b48', blue = '#0872e9', light = '#69d4ff', red = '#ec243f';
    const label = (s, x, y, align, size) => cv.text(s, x, Y(y), size || 22, dim, { font:'bold', align:align || 'left', spacing:1 });
    const text = (s, x, y, size, align, color) => cv.text(String(s), x, Y(y), size, color || white, { font:'num', align:align || 'left' });
    const x0 = 28, x1 = 450, c = 800;
    // Consumption: two independently scaled tracks, not two indicators on one line.
    label('CONSOMMATION', x0, 29);
    label('INSTANT.', x0, 61, 'left', 18); text(number(d.instant, 1), 115, 63, 32);
    label('MOY.', 245, 61, 'left', 18); text(number(d.average, 1), 305, 63, 32);
    label('L/100 KM', x0, 85, 'left', 16);
    function thinTrack(y, value, color, min, max, track) {
        cv.fillRect(x0, Y(y), x1-x0, 5, track || muted);
        min = finite(min) ? min : 0; max = finite(max) && max > min ? max : 20;
        if (finite(value)) cv.fillRect(x0, Y(y), (x1-x0)*clamp((value-min)/(max-min),0,1), 5, color);
    }
    thinTrack(97, d.instant, blue); thinTrack(109, d.average, light);
    label('INSTANT.', x0, 133, 'left', 16); label('MOYENNE', 245, 133, 'left', 16);
    cv.fillRect(x0, Y(137), 35, 3, blue); cv.fillRect(245, Y(137), 35, 3, light);
    // Compact line icons help distinguish the three temperature values.
    function tempIcon(i, x, y) {
        const line = (a,b,c,d) => cv.line(x+a,y+b,x+c,y+d,1.8,white);
        if (i === 0) { // oil can
            line(1,9,7,12); line(7,12,9,22); line(9,22,23,22); line(23,22,27,13);
            line(27,13,31,11); line(31,11,32,14); line(7,12,23,12); line(11,9,18,9); line(14,6,14,9);
            cv.circle(x+32,y+19,1.7,white);
        } else if (i === 1) { // gearbox and oil
            cv.arc(x+16,y+15,10,11,0,360,white);
            for (let n=0;n<8;n++) { const a=n*Math.PI/4; line(16+10*Math.cos(a),15+10*Math.sin(a),16+14*Math.cos(a),15+14*Math.sin(a)); }
            cv.arc(x+16,y+17,3,4,0,360,white);
        } else { // thermometer over coolant waves
            line(14,3,14,18); line(18,3,18,18); line(14,3,18,3); cv.arc(x+16,y+20,4,5,0,360,white);
            line(3,28,9,26); line(9,26,15,28); line(15,28,21,26); line(21,26,27,28);
        }
    }
    const scale = d.tempUnit === '°F' ? v => v*9/5+32 : v => v;
    const temperatures = [
        ['HUILE MOTEUR',d.oil,d.oilPeak,170,d.oilWarm],
        ['HUILE BOITE',d.gearbox,d.gearboxPeak,150,d.gearboxWarm],
        ['REFROIDISSEMENT',d.coolant,d.coolantPeak,160,d.coolantWarm],
    ];
    temperatures.forEach((row,i) => {
        const y = 184+i*105;
        tempIcon(i, x0, Y(y)-26);
        label(row[0], x0+41, y, 'left', 19);
        cv.text(number(row[1],0)+' '+d.tempUnit, x1, Y(y+2), 33, finite(row[1]) ? white : dim, {font:'num',align:'right'});
        const cold = finite(row[1]) && finite(row[4]) && row[1] < row[4];
        const currentColor = cold ? '#ff9c28' : blue, peakColor = cold ? '#ffd27a' : light;
        const trackColor = cold ? '#574226' : muted;
        thinTrack(y+20, row[1], currentColor, scale(0), scale(row[3]), trackColor);
        thinTrack(y+32, finite(row[1]) ? row[2] : null, peakColor, scale(0), scale(row[3]), trackColor);
    });
    label('ACTUEL', x0, 451, 'left', 16); label('MAX RECENT', 245, 451, 'left', 16);
    cv.fillRect(x0, Y(455), 35, 3, white); cv.fillRect(245, Y(455), 35, 3, dim);
    // A bent path: the two parallel strokes are current and held peak RPM respectively.
    const rm = finite(d.rpmMax) && d.rpmMax > 0 ? d.rpmMax : 8000;
    function point(side, offset, f) {
        const top = Y(34), mid = Y(244), end = Y(453);
        const xMid = c + side*(276+offset), xEnd = c + side*(176+offset);
        return f <= 0.5 ? [xEnd+(xMid-xEnd)*f*2, end+(mid-end)*f*2]
            : [xMid+(xEnd-xMid)*(f-0.5)*2, mid+(top-mid)*(f-0.5)*2];
    }
    function stroke(side, offset, from, to, color, width) {
        from = clamp(from,0,1); to = clamp(to,0,1); if (to<=from) return;
        const vals = from < 0.5 && to > 0.5 ? [from,0.5,to] : [from,to];
        for (let i=1;i<vals.length;i++) { const a=point(side,offset,vals[i-1]), b=point(side,offset,vals[i]); cv.line(a[0],a[1],b[0],b[1],width,color); }
    }
    // Filled polygon bands give the dial its broad, faceted shape with square ends.
    function band(side, inner, outer, from, to, color) {
        from=clamp(from,0,1); to=clamp(to,0,1); if (to<=from) return;
        const vals=from<0.5 && to>0.5 ? [from,0.5,to] : [from,to];
        for (let i=1;i<vals.length;i++) {
            const a=vals[i-1], b=vals[i];
            cv.quad([point(side,inner,a),point(side,outer,a),point(side,outer,b),point(side,inner,b)],color);
        }
    }
    [-1,1].forEach(side => {
        // Broad grey-silver surround and a blue face that follows the current RPM.
        band(side,-22,22,0,1,'#384b5d');
        band(side,-18,15,0,1,'#131d29');
        const redRpm = finite(d.redline) && d.redline > 0 ? Math.min(d.redline,rm) : rm*0.9;
        const hasGuide = d.warmGuideEnabled && finite(d.warmGuide);
        if (hasGuide && d.warmGuide < redRpm) band(side,-18,15,d.warmGuide/rm,redRpm/rm,'#604417');
        stroke(side,22,0,1,'#c8d4de',2);
        stroke(side,-22,0,1,'#6b8093',2);
        if (finite(d.rpm)) {
            band(side,-16,7,0,d.rpm/rm,blue);
            band(side,-16,-9,0,d.rpm/rm,light);
        }
        if (finite(d.rpm) && finite(d.rpmPeak)) stroke(side,12,0,d.rpmPeak/rm,light,3);
        if (hasGuide && d.warmGuide < redRpm) stroke(side,18,d.warmGuide/rm,redRpm/rm,'#ffb020',3);
        const redFrom = finite(d.redline) && d.redline > 0 ? clamp(d.redline/rm,0,1) : 0.9;
        band(side,-17,12,redFrom,1,'#581522');
        stroke(side,3,redFrom,1,red,6);
        if (finite(d.rpm) && finite(d.rpmPeak)) {
            const p=point(side,0,clamp(d.rpmPeak/rm,0,1));
            cv.line(p[0]-side*18,p[1],p[0]+side*18,p[1],3,white);
        }
        for (let rpm=0; rpm<=rm; rpm+=1000) {
            const p=point(side,-24,rpm/rm);
            cv.line(p[0],p[1],p[0]-side*8,p[1],2,white);
            cv.text(String(rpm/1000),p[0]-side*14,p[1]+6,20,white,{font:'num',align:side<0?'left':'right'});
        }
    });
    const gear = d.gear ? d.gear.letter + d.gear.num : '--';
    cv.text(gear, c, Y(160), 122, white, { font:'gear', align:'center' });
    label(d.gear && d.gear.est ? 'RAPPORT EST.' : 'RAPPORT', c, 187, 'center', 21);
    cv.text(number(d.speed,0), c, Y(275), 62, white, { font:'light', align:'center' });
    label(d.speedUnit || 'km/h', c, 303, 'center', 21);
    cv.text(number(d.rpm,0), c, Y(386), 52, white, { font:'light', align:'center' });
    label('tr/min', c, 414, 'center', 21);
    if (d.warmGuideEnabled) cv.text(finite(d.warmGuide) ? 'REPERE PERSO' : 'HUILE --', c, Y(445), 16, finite(d.warmGuide) ? '#ffb020' : dim, {font:'bold',align:'center'});
    // Use the M Vitals bar renderer, with its current-value cap and held peak.
    function metric(title, value, unit, max, peak, index, decimals) {
        const y=28+index*92, vx=1137, bx=1137, bw=423, by=Y(y+48);
        label(title,vx,y,'left',18);
        const valueWidth = text(number(value,decimals),vx,y+36,37);
        cv.text(' '+unit, vx+valueWidth, Y(y+36), 20, dim);
        max = finite(max) && max > 0 ? max : 1;
        G.bar(cv,t,bx,by,bw,30,{head:false,value,min:0,max,step:max/4,ramp:'hot',peak:finite(value) ? peak : null});
    }
    const p=d.peaks || {};
    metric(d.powerEstimated ? 'PUISSANCE CALC.' : 'PUISSANCE',d.power,d.powerUnit,d.powerMax,p.power,0,0);
    metric('COUPLE',d.torque,d.torqueUnit,d.torqueMax,p.torque,1,0);
    metric('TURBO',d.boost,d.boostUnit,d.boostMax,p.boost,2,2);
    metric('ACCELERATEUR',d.pedal,'%',100,p.pedal,3,0);
    metric('CHARGE MOTEUR',d.engineLoad,'%',100,p.engineLoad,4,0);
    if (d.demo) cv.text('DEMO',c,bottom-4,18,t.warn,{font:'bold',align:'center'});
}
module.exports = { draw };
