import assert from 'node:assert/strict';
import { test } from 'node:test';
import { connect } from './connect.ts';

const box = { left: 100, right: 200, top: 100, bottom: 120 };

test('connect leaves each end from the facing sides', () => {
  const right = connect({ left: 400, right: 600, top: 300, bottom: 340 }, box)!;   // field list beside the page
  assert.deepEqual([right.from, right.to], [[400, 320], [200, 110]]);
  assert.match(right.d, /^M400\.0 320\.0C300\.0 320\.0 300\.0 110\.0 200\.0 110\.0$/);
  const left = connect({ left: 0, right: 80, top: 100, bottom: 120 }, box)!;       // fields on the left
  assert.deepEqual([left.from, left.to], [[80, 110], [100, 110]]);
  assert.match(left.d, /C104\.0 110\.0 76\.0 110\.0/);                              // short gap: tangents keep 24px
  const below = connect({ left: 120, right: 180, top: 500, bottom: 540 }, box)!;   // stacked on a phone
  assert.deepEqual([below.from, below.to], [[150, 500], [150, 120]]);
});

test('connect gives up when the two overlap', () => {
  assert.equal(connect({ left: 150, right: 250, top: 110, bottom: 130 }, box), null);
});
