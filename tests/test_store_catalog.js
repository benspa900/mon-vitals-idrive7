'use strict';
const assert = require('assert');
const path = require('path');
const sources = require(process.argv[2]);
const root = path.resolve(__dirname, '..');
sources.reader({ type:'file', path:root }, {}).catalog().then(c => {
    assert.deepStrictEqual(c.skipped, []);
    assert.strictEqual(c.components.length, 1);
    const app = c.components[0];
    assert.strictEqual(app.id, 'benspa_vitals');
    assert.strictEqual(app.uninstallable, true);
    assert.deepStrictEqual(app.mguHmi, ['ID7']);
    assert.strictEqual(app.script.sdk, 'oap-sdk');
    assert.strictEqual(app.script.output, 'dist/benspa_vitals@0.9.5.tgz');
    console.log('MGU Store catalog: one ID7 app, build and SDK configuration OK');
}).catch(e => { console.error(e); process.exit(1); });
