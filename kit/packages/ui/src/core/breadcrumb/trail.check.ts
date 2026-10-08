import assert from 'node:assert/strict';
import { visibleCrumbs } from './trail.ts';

assert.deepEqual(visibleCrumbs(0, 4), [], 'empty trail');
assert.deepEqual(visibleCrumbs(3, 4), [0, 1, 2], 'fits: all shown');
assert.deepEqual(visibleCrumbs(4, 4), [0, 1, 2, 3], 'exactly max: all shown');
assert.deepEqual(visibleCrumbs(7, 4), [0, null, 4, 5, 6], 'first, gap, last max-1');
assert.deepEqual(visibleCrumbs(5, 1), [0, null, 4], 'max under 2 still keeps first and current');
assert.deepEqual(visibleCrumbs(5, 2), [0, null, 4], 'max 2: root and current');
console.log('trail ok');
