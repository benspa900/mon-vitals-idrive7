'use strict';
const assert = require('assert');
const find = require('../apps/f44_traffic_diag/traffic_finder').find;

const db = {
    datatypes: {
        Base: { type: 'struct', members: [{ name: 'quality' }] },
        Sign: { type: 'struct', extends: 'Base', members: [{ name: 'speedLimit', dataRef: 'Cycle' }] },
        Cycle: { type: 'typedef', dataRef: 'Cycle' }
    },
    interfaces: {
        'de.bmw.example.Signs': { fields: {
            status: { dataRef: 'Sign', getter: { id: 5 }, notifier: { id: 1 } },
            unrelated: { dataRef: 'Other' }
        } },
        'de.bmw.example.Other': { events: { trafficLightUpdate: {} } },
        'com.other.Example': { fields: { trafficSign: {} } }
    }
};
const found = find(db);
assert.strictEqual(found.length, 2);
const status = found.filter(function (x) { return x.nom === 'status'; })[0];
assert.deepStrictEqual(status.membres, ['quality', 'speedLimit']);
assert(status.lecture && status.notification);
assert.strictEqual(found.filter(function (x) { return x.nom === 'trafficLightUpdate'; })[0].type, 'events');
assert.throws(function () { find({}); }, /interfaces/);
console.log('Diagnostic panneaux : selection, types imbriques, cycles et catalogue invalide OK');
