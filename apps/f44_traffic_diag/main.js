'use strict';

const fs = require('fs');
const mgu = require('./kit/mgu');
const finder = require('./traffic_finder');
const CATALOG = '/etc/oap/someip/someip-interfaces.json';

mgu.run({
    async start(ctx) {
        const ui = ctx.ui;
        let results = [], pages = [], error = null, page = 0;
        function scan() {
            try {
                results = finder.find(JSON.parse(fs.readFileSync(CATALOG, 'utf8')));
                pages = [];
                results.forEach(function (s) {
                    const text = s.membres.join(', ') || '-';
                    const count = Math.max(1, Math.ceil(text.length / 400));
                    for (let i = 0; i < count; i++) pages.push({ signal: s, members: text.slice(i * 400, (i + 1) * 400), part: i + 1, parts: count });
                });
                error = null;
            } catch (e) {
                results = [];
                pages = [];
                error = e.message;
            }
            page = 0;
        }
        function lines(text, size, max) {
            const s = String(text || '');
            const out = [];
            for (let i = 0; i < s.length && out.length < max; i += size) out.push(s.slice(i, i + size));
            return out;
        }
        async function render() {
            const t = ctx.theme();
            const cv = ctx.canvas(1600, 520).clear(t.bg);
            cv.text('Diagnostic panneaux et feux', 48, 48, 30, t.text, { font: 'bold', literal: true });
            cv.text('Catalogue uniquement : ne confirme pas la reception des donnees.', 48, 88, 22, t.dim, { literal: true });
            if (error) {
                cv.text('Catalogue inaccessible ou invalide :', 48, 150, 24, t.text, { literal: true });
                lines(error, 90, 3).forEach((s, i) => cv.text(s, 48, 190 + i * 30, 20, t.text, { literal: true }));
            } else if (!results.length) {
                cv.text('Aucun signal candidat trouve dans le catalogue.', 48, 160, 24, t.text, { literal: true });
            } else {
                const part = pages[page], s = part.signal;
                cv.text('Page ' + (page + 1) + ' / ' + pages.length + ' - photographier chaque page', 48, 135, 22, t.text, { literal: true });
                lines(s.interface, 90, 2).forEach((v, i) => cv.text(v, 48, 180 + i * 26, 20, t.text, { literal: true }));
                cv.text(s.type + ' : ' + s.nom, 48, 245, 20, t.text, { literal: true });
                cv.text('Lecture : ' + (s.lecture ? 'oui' : 'non') + '   Notification : ' + (s.notification ? 'oui' : 'non'), 48, 277, 18, t.dim, { literal: true });
                lines('Membres (' + part.part + '/' + part.parts + ') : ' + part.members, 100, 5).forEach((v, i) => cv.text(v, 48, 314 + i * 26, 18, t.text, { literal: true }));
                cv.text('Suivant : autre candidat. Actualiser : relire le catalogue.', 48, 485, 18, t.dim, { literal: true });
            }
            await ui.image('MAIN_GFX', cv);
        }
        scan();
        ui.onClick('BTN_NEXT', () => { if (pages.length) page = (page + 1) % pages.length; return render(); });
        ui.onClick('BTN_REFRESH', () => { scan(); return render(); });
        ctx.loop('MAIN', 1, render);
    }
});
