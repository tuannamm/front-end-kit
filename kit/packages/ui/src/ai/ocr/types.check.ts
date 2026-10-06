// Self-check for normalizeOcr/toBox. Run: npm test -w @dtx/ui
import assert from 'node:assert/strict';
import { normalizeOcr } from './types.ts';
import { toBox } from '../shared/geometry.ts';

assert.deepEqual(toBox([10, 20, 30, 40], 100, 200), { x: .1, y: .1, w: .3, h: .2 });
assert.deepEqual(toBox({ x1: 10, y1: 20, x2: 40, y2: 60 }, 100, 200), { x: .1, y: .1, w: .3, h: .2 });
assert.deepEqual(toBox([[10, 20], [40, 22], [40, 60], [12, 58]], 100, 200), { x: .1, y: .1, w: .3, h: .2 });
const n = normalizeOcr({ image: { src: '', width: 100, height: 200 }, lines: [{ text: 'A', confidence: .987, box: [0, 0, 50, 100] }], fields: [{ key: 'k', value: 'v', confidence: 91 }] });
assert.equal(n.lines[0].id, 'l0');
assert.equal(n.lines[0].confidence, 98.7);
assert.equal(n.fields[0].confidence, 91);
assert.equal(n.fields[0].label, 'k');
assert.throws(() => normalizeOcr({ lines: [] }), /need image/);
console.log('normalizeOcr ok');
