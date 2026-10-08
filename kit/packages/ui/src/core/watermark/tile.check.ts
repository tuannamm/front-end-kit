// Run: node --experimental-strip-types core/watermark/tile.check.ts
import assert from 'node:assert/strict';
import { cellSize } from './tile.ts';

assert.deepEqual(cellSize(120, 20, 0, [100, 80]), { w: 220, h: 100 }, 'no rotation: box plus gap');
const q = cellSize(120, 20, 90, [0, 0]);
assert.ok(Math.abs(q.w - 20) < 1e-9 && Math.abs(q.h - 120) < 1e-9, 'quarter turn swaps the sides');
const a = cellSize(120, 20, -22, [0, 0]), b = cellSize(120, 20, 22, [0, 0]);
assert.ok(Math.abs(a.w - b.w) < 1e-9 && Math.abs(a.h - b.h) < 1e-9, 'either direction needs the same room');
assert.ok(a.w > 111 && a.h > 63, 'rotated box covers the text corners');
console.log('tile ok');
