'use strict';

// Read only the unit's interface catalogue; this does not subscribe to the car.
// Node 8 compatible, so it can also be run on an iDrive 7 head unit.
const fs = require('fs');
const DEFAULT_CATALOG = '/etc/oap/someip/someip-interfaces.json';
const MATCH = /traffic.?sign|road.?sign|speed.?limit|limit.?speed|traffic.?light|traffic.?signal|traffic.?lamp|foresight|sign.?recognition|verkehrszeichen|ampel|kafas/i;

function describe(db, ref, seen, depth) {
    if (!ref || depth > 4 || seen[ref]) return [];
    const t = (db.datatypes || {})[ref];
    if (!t) return [];
    const visited = Object.assign({}, seen); visited[ref] = true;
    let out = [];
    if (t.extends) out = out.concat(describe(db, t.extends, visited, depth + 1));
    (t.members || []).forEach(function (m) {
        if (m && m.name) out.push(m.name);
        if (m && m.dataRef) out = out.concat(describe(db, m.dataRef, visited, depth + 1));
    });
    if (t.dataRef || t.baseType || t.elementDataRef)
        out = out.concat(describe(db, t.dataRef || t.baseType || t.elementDataRef, visited, depth + 1));
    return out.filter(function (name, i) { return out.indexOf(name) === i; });
}

function find(db) {
    if (!db || !db.interfaces || typeof db.interfaces !== 'object') throw new Error('Catalogue invalide : interfaces absentes');
    const out = [];
    Object.keys(db.interfaces).sort().forEach(function (iface) {
        if (!/^de\.bmw\./.test(iface)) return;
        const item = db.interfaces[iface] || {};
        ['fields', 'events', 'broadcasts'].forEach(function (group) {
            const entries = item[group] || {};
            Object.keys(entries).sort().forEach(function (name) {
                const entry = entries[name] || {};
                let members = describe(db, entry.dataRef, {}, 0);
                (Array.isArray(entry.parameters) ? entry.parameters : []).forEach(function (p) {
                    if (p.name) members.push(p.name);
                    members = members.concat(describe(db, p.dataRef, {}, 0));
                });
                members = members.filter(function (v, i) { return members.indexOf(v) === i; });
                if (!MATCH.test(iface + ' ' + name + ' ' + members.join(' '))) return;
                out.push({ interface: iface, type: group, nom: name,
                    lecture: !!(entry.getter && entry.getter.id),
                    notification: !!entry.notifier, membres: members });
            });
        });
    });
    return out;
}

function main() {
    const file = process.argv[2] || DEFAULT_CATALOG;
    try {
        const matches = find(JSON.parse(fs.readFileSync(file, 'utf8')));
        console.log(JSON.stringify({ diagnostic: 'catalogue uniquement, aucune donnee en direct', candidats: matches }, null, 2));
    } catch (e) {
        console.error('Impossible de lire le catalogue : ' + e.message);
        process.exitCode = 1;
    }
}
if (require.main === module) main();
module.exports = { find: find };
