// Run: node --experimental-strip-types core/splitter/split.check.ts
import assert from 'node:assert/strict';
import { initialFractions, moveHandle, toPx } from './split.ts';

assert.equal(toPx(240, 1000, 0), 240);
assert.equal(toPx('30%', 1000, 0), 300);
assert.equal(toPx(undefined, 1000, Infinity), Infinity);

assert.deepEqual(initialFractions([240, undefined, '30%'], 1000), [.24, .46, .3]);
assert.deepEqual(initialFractions([undefined, undefined], 800), [.5, .5]);
assert.deepEqual(initialFractions([undefined, undefined], 0), [.5, .5], 'hidden container: equal shares, no NaN');

// A 300 + B 700 = 1000; A min 200 max 600, B min 300
const A = { min: 200, max: 600 }, B = { min: 300 };
assert.equal(moveHandle(300, 700, 450, 1000, A, B), 450);
assert.equal(moveHandle(300, 700, 100, 1000, A, B), 200, 'A min');
assert.equal(moveHandle(300, 700, 900, 1000, A, B), 600, 'A max');
assert.equal(moveHandle(300, 700, 900, 1000, { min: 200 }, B), 700, 'B min');
assert.equal(moveHandle(300, 700, 50, 1000, { min: '20%' }, B), 200, 'percent min');
assert.equal(moveHandle(300, 700, 50, 1000, { ...A, collapsible: true }, B), 0, 'under half the min: collapse');
assert.equal(moveHandle(300, 700, 150, 1000, { ...A, collapsible: true }, B), 200, 'over half the min: held at min');
assert.equal(moveHandle(300, 700, 50, 1000, { ...A, collapsible: true }, B, false), 200, 'keyboard steps do not snap');
assert.equal(moveHandle(300, 700, 900, 1000, {}, { min: 300, collapsible: true }), 1000, 'B collapses');
assert.equal(moveHandle(300, 700, 500, 1000, {}, { max: 400 }), 600, 'B max');
console.log('split ok');
