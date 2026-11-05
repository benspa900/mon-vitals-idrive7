'use strict';
/** Single-page display; null is unavailable, never a fabricated measurement. */
const finite = x => typeof x === 'number' && isFinite(x);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const number = (n, decimals) => finite(n) ? n.toFixed(decimals || 0).replace('.', ',') : '--';

function draw(cv, t, G, d) {
    // Spread the composition down the available page, including the extra full-screen area.
    const bottom = G.pageBottom(cv), Y = n => Math.round(18 + n * (bottom - 34) / 465);
    const white = t.text, dim = t.dim, muted = '#293b48', blue = '#1f5fd0', light = '#81c4ff', red = '#ec243f';
    const label = (s, x, y, align, size) => cv.text(s, x, Y(y), size || 22, dim, { font:'bold', align:align || 'left', spacing:1 });
    const text = (s, x, y, size, align, color) => cv.text(String(s), x, Y(y), size, color || white, { font:'num', align:align || 'left' });
    const x0 = 28, x1 = 450, c = 800;
    // Segmented M-style bar: current consumption, BC1 average as a separate marker.
    label('CONSOMMATION', x0, 29);
    label('INSTANT.', x0, 61, 'left', 18); text(number(d.instant, 1), 115, 63, 32);
    label('MOY.', 245, 61, 'left', 18); text(number(d.average, 1), 305, 63, 32);
    label('L/100 KM', x0, 85, 'left', 16);
    const leftWidth = x1-x0, consoY=Y(97);
    G.segBar(cv,t,x0,consoY,leftWidth,22,{panel:false,value:d.instant,min:0,max:20,step:20/16,ramp:'hot',smooth:3.5});
    if (finite(d.average)) {
        const p=x0+(leftWidth-18)*clamp(d.average/20,0,1);
        cv.line(p+18,consoY-3,p,consoY+25,3,light);
    }
    label('TRAIT BLEU CLAIR : MOYENNE', x0, 144, 'left', 15);
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
        const min=scale(0), max=scale(row[3]);
        const theme=Object.assign({},t,{hang:peakColor,track:trackColor});
        G.segBar(cv,theme,x0,Y(y+20),leftWidth,22,{
            panel:false,value:row[1],min,max,step:(max-min)/16,color:currentColor,
            peak:finite(row[1]) ? row[2] : null,hangTop:false,
        });
    });
    label('TRAIT CLAIR : MAX RECENT', x0, 451, 'left', 15);
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
            // The M Vitals colour ramp follows the existing solid, unsegmented shape.
            const end=clamp(d.rpm/rm,0,1), resolution=64;
            for (let i=0;i<resolution && i/resolution<end;i++) {
                const from=i/resolution, to=Math.min(end,(i+1)/resolution);
                const color=G.ramp(t.hotRamp || t.ramp,clamp((from+to)*0.5*rm/redRpm,0,1));
                // Slight overlap prevents antialiasing seams between adjacent colours.
                const edge=Math.min(end,to+0.003);
                band(side,-16,7,from,edge,color);
                band(side,-16,-9,from,edge,G.mix(color,'#ffffff',0.4));
            }
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
    if (d.warmGuideEnabled) cv.text(finite(d.warmGuide) ? 'Rev Limit' : 'HUILE --', c, Y(445), 16, finite(d.warmGuide) ? '#ffb020' : dim, {font:'bold',align:'center'});
    // Right side: separate tracks for the current value and the held maximum.
    function segmentedTrack(x,y,w,h,value,max,peak) {
        const count=16, slant=5, step=(w-slant)/count, gap=2;
        const progress=finite(value) ? clamp(value/max,0,1)*count : 0;
        for (let i=0;i<count;i++) {
            const x0=x+i*step, length=step-gap;
            const segment=(width,col) => cv.quad([[x0+slant,y],[x0+slant+width,y],[x0+width,y+h],[x0,y+h]],col);
            segment(length,muted);
            const amount=clamp(progress-i,0,1);
            if (amount>0) {
                const color=G.ramp(t.hotRamp || t.ramp,(i+0.5)/count);
                segment(length*amount,peak ? G.mix(color,'#ffffff',0.35) : color);
            }
        }
    }
    function metric(title, value, unit, max, peak, index, decimals) {
        const y=28+index*92, vx=1137, bx=1137, bw=423;
        label(title,vx,y,'left',18);
        const valueWidth = text(number(value,decimals),vx,y+36,37);
        cv.text(' '+unit, vx+valueWidth, Y(y+36), 20, dim);
        max = finite(max) && max > 0 ? max : 1;
        // Keep the numerical value and peak real; interpolate only the live pedal/load bar.
        const live = index >= 3 ? G.smooth('dashboard-metric-'+index, value, 3.5) : value;
        [live,finite(value) ? peak : null].forEach((reading,i) => {
            const yTrack=Y(y+48+i*12);
            segmentedTrack(bx,yTrack,bw,6,reading,max,i===1);
        });
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
