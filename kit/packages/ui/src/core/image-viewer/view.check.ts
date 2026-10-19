import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stepZoom } from '../pdf-viewer/view.ts';
import { describeError, fitScale, turned, wheelZoom, zoomStops } from './view.ts';

test('fitScale contains the image and never enlarges it', () => {
  assert.equal(fitScale({ w: 2000, h: 1000 }, { w: 1032, h: 2000 }, 16), 0.5);
  assert.equal(fitScale({ w: 1000, h: 2000 }, { w: 2000, h: 1032 }, 16), 0.5);
  assert.equal(fitScale({ w: 100, h: 100 }, { w: 800, h: 600 }, 16), 1);
  assert.equal(fitScale({ w: 100, h: 100 }, { w: 0, h: 0 }, 16), 1);
  assert.deepEqual(turned({ w: 3, h: 2 }, 90), { w: 2, h: 3 });
  assert.deepEqual(turned({ w: 3, h: 2 }, 180), { w: 3, h: 2 });
});

test('−/+ stop at the fit scale, even below 25%', () => {
  const stops = zoomStops(0.1);
  assert.equal(stepZoom(0.25, -1, stops), 0.1);
  assert.equal(stepZoom(0.1, -1, stops), 0.1);
  assert.equal(stepZoom(0.1, 1, stops), 0.25);
  assert.equal(stepZoom(0.5, 1, zoomStops(0.62)), 0.62);
  assert.equal(stepZoom(4, 1, stops), 4);
});

test('wheelZoom is smooth and bounded', () => {
  assert.ok(wheelZoom(1, -100, 0.25) > 1);
  assert.ok(wheelZoom(1, 100, 0.25) < 1);
  assert.equal(wheelZoom(4, -1000, 0.25), 4);
  assert.equal(wheelZoom(0.3, 1000, 0.1), 0.1);
});

test('describeError names the format, and offers retry only for URLs', () => {
  assert.match(describeError('/a/scan.TIF?v=2').title, /TIFF/);
  assert.match(describeError(new Blob([], { type: 'image/heic' })).title, /HEIC/);
  assert.equal(describeError(new Blob(['x'], { type: 'image/png' })).retry, false);
  assert.equal(describeError('/a/photo.jpg').retry, true);
  assert.match(describeError(new Blob(['x']), 'trang-1.tiff').title, /TIFF/);
});
