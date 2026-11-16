'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const finder = require('../apps/f44_traffic_diag/traffic_finder');
const source = fs.readFileSync('apps/f44_traffic_diag/main.js', 'utf8');
const catalog = { interfaces: { 'de.bmw.test': { fields: { trafficSign: {}, trafficLight: {} } } } };
const buttons = {}, labels = [];
let start, draw;
const cv = { clear: function () { return this; }, text: function (s) { labels.push(s); } };
const ctx = { ui: { image: function () {}, onClick: function (n, cb) { buttons[n] = cb; } },
    theme: function () { return { bg: '#000', text: '#fff', dim: '#888' }; },
    canvas: function () { return cv; }, loop: function (_, __, cb) { draw = cb; } };
function fakeRequire(id) {
    if (id === 'fs') return { readFileSync: function () { return JSON.stringify(catalog); } };
    if (id === './kit/mgu') return { run: function (spec) { start = spec.start; } };
    if (id === './traffic_finder') return finder;
    throw new Error(id);
}
vm.runInNewContext(source, { require: fakeRequire, console: console });
(async function () {
    await start(ctx);
    await draw();
    assert(labels.some(function (x) { return /Page 1 \/ 2/.test(x); }));
    labels.length = 0;
    await buttons.BTN_NEXT();
    assert(labels.some(function (x) { return /Page 2 \/ 2/.test(x); }));
    labels.length = 0;
    await buttons.BTN_REFRESH();
    assert(labels.some(function (x) { return /Page 1 \/ 2/.test(x); }));
    console.log('Interface diagnostic : affichage et navigation OK');
})().catch(function (e) { console.error(e); process.exitCode = 1; });
