'use strict';
/** Single-page display; null is unavailable, never a fabricated measurement. */
const finite = x => typeof x === 'number' && isFinite(x);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const number = (n, decimals) => finite(n) ? n.toFixed(decimals || 0).replace('.', ',') : '--';

function draw(cv, t, G, d) {
    const bottom = G.pageBottom(cv), Y = n => Math.round(12 + n * (bottom - 26) / 480);
    const white = t.text, dim = t.dim, muted = '#293b48', blue = '#0872e9', light = '#69d4ff', red = '#ec243f';
    const label = (s, x, y, align, size) => cv.text(s, x, Y(y), size || 22, dim, { font:'bold', align:align || 'left', spacing:1 });
    const text = (s, x, y, size, align, color) => cv.text(String(s), x, Y(y), size, color || white, { font:'num', align:align || 'left' });
    const x0 = 28, x1 = 450, c = 800;
    // Consumption: two independently scaled tracks, not two indicators on one line.
    label('CONSOMMATION', x0, 29);
    label('INSTANT.', x0, 61, 'left', 18); text(number(d.instant, 1), 115, 63, 32);
    label('MOY.', 245, 61, 'left', 18); text(number(d.average, 1), 305, 63, 32);
    label('L/100 KM', x0, 85, 'left', 16);
    function thinTrack(y, value, color) {
        cv.fillRect(x0, Y(y), x1-x0, 5, muted);
        if (finite(value)) cv.fillRect(x0, Y(y), (x1-x0)*clamp(value/20,0,1), 5, color);
    }
    thinTrack(97, d.instant, blue); thinTrack(109, d.average, light);
    label('INSTANT.', x0, 133, 'left', 16); label('MOYENNE', 245, 133, 'left', 16);
    cv.fillRect(x0, Y(137), 35, 3, blue); cv.fillRect(245, Y(137), 35, 3, light);
    // Friction circle is only populated if both measured axes are available.
    label('FORCES G', x0, 186);
    const gx = 125, gy = Y(303), gr = Math.min(74, (bottom-26)*0.16);
    [1, 0.66, 0.33].forEach(k => cv.arc(gx, gy, gr*k-1, gr*k, 0, 360, muted));
    cv.line(gx-gr,gy,gx+gr,gy,1,dim); cv.line(gx,gy-gr,gx,gy+gr,1,dim);
    if (finite(d.gLat) && finite(d.gLong)) {
        const a = clamp(d.gLat/1.5,-1,1), b = clamp(d.gLong/1.5,-1,1);
        const norm = Math.max(1, Math.sqrt(a*a+b*b));
        cv.circle(gx+a/norm*gr, gy-b/norm*gr, 6, light);
    }
    text(number(d.gLat,2)+' G', 47, 415, 20); text(number(d.gLong,2)+' G', 147, 415, 20);
    cv.line(240, Y(178), 240, Y(439), 1, muted);
    [['HUILE MOTEUR',d.oil],['HUILE BOITE',d.gearbox],['REFROIDISSEMENT',d.coolant]].forEach((row,i) => {
        const y = 198+i*86; label(row[0], 261, y, 'left', 17);
        text(number(row[1],0)+' '+d.tempUnit, 261, y+37, 33);
        if (i < 2) cv.line(261,Y(y+51),448,Y(y+51),1,muted);
    });
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
    [-1,1].forEach(side => {
        [0,11].forEach(off => stroke(side,off,0,1,muted,4));
        if (finite(d.rpm)) stroke(side,0,0,d.rpm/rm,blue,5);
        if (finite(d.rpm) && finite(d.rpmPeak)) stroke(side,11,0,d.rpmPeak/rm,light,4);
        const redFrom = finite(d.redline) && d.redline > 0 ? clamp(d.redline/rm,0.6,1) : 0.9;
        [0,11].forEach(off => stroke(side,off,redFrom,1,red,3));
    });
    label('REGIME MOTEUR', c, 44, 'center', 21);
    text(number(d.rpm,0), c, 116, 68, 'center'); label('tr/min', c, 144, 'center', 21);
    text(number(d.speed,0), c, 244, 78, 'center'); label(d.speedUnit || 'km/h', c, 273, 'center', 21);
    const gear = d.gear ? d.gear.letter + d.gear.num : '--';
    text(gear, c, 385, 75, 'center'); label(d.gear && d.gear.est ? 'RAPPORT EST.' : 'RAPPORT', c, 414, 'center', 21);
    // Five angled M-style gauges. The numbers retain their actual values above the chosen scale.
    function metric(title, value, unit, max, peak, index, decimals) {
        const y=28+index*92, vx=1137, bx=1137, bw=423, by=Y(y+48), bh=12, sl=10;
        label(title,vx,y,'left',18);
        const valueWidth = text(number(value,decimals),vx,y+36,37);
        cv.text(' '+unit, vx+valueWidth, Y(y+36), 20, dim);
        cv.quad([[bx+sl,by],[bx+bw,by],[bx+bw-sl,by+bh],[bx,by+bh]],muted);
        if (finite(value) && finite(max) && max>0) {
            const w=(bw-sl)*clamp(value/max,0,1);
            if (w>1) cv.quad([[bx+sl,by],[bx+sl+w,by],[bx+w,by+bh],[bx,by+bh]],blue);
        }
        if (finite(value) && finite(peak) && finite(max) && max>0) { const px=bx+sl+(bw-sl)*clamp(peak/max,0,1); cv.line(px,by-5,px,by+bh+5,2,light); }
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
