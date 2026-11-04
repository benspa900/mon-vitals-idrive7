'use strict';
const assert = require('assert');
const { check } = require('../kit/runtime/readonly-diag');
assert.doesNotThrow(() => check(0x12, 0x01, [0x5e], false));
assert.doesNotThrow(() => check(0x12, 0x22, [0xf4, 0x5c], false));
[0x10, 0x11, 0x14, 0x27, 0x2e, 0x2f, 0x31, 0x3e].forEach(sid =>
    assert.throws(() => check(0x12, sid, [0, 0], false)));
console.log('Diagnostic: read-only requests allowed; reset, write and control blocked');
