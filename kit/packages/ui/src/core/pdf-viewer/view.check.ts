import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ZOOM_MAX, ZOOM_MIN, clampZoom, describeError, pageAt, parsePage, stepZoom } from './view.ts';

test('stepZoom moves to the neighbouring preset', () => {
  assert.equal(stepZoom(1, 1), 1.25);
  assert.equal(stepZoom(1, -1), 0.75);
  assert.equal(stepZoom(0.87, 1), 1);    // a fit-width scale steps to the next preset, not past it
  assert.equal(stepZoom(0.87, -1), 0.75);
  assert.equal(stepZoom(ZOOM_MAX, 1), ZOOM_MAX);
  assert.equal(stepZoom(ZOOM_MIN, -1), ZOOM_MIN);
  assert.equal(clampZoom(9), ZOOM_MAX);
  assert.equal(clampZoom(0.01), ZOOM_MIN);
});

test('pageAt finds the page under a line', () => {
  const tops = [16, 1100, 2184];
  assert.equal(pageAt(tops, 0), 0);
  assert.equal(pageAt(tops, 1099), 0);
  assert.equal(pageAt(tops, 1100), 1);
  assert.equal(pageAt(tops, 99999), 2);
  assert.equal(pageAt([], 50), 0);
});

test('parsePage clamps and rejects', () => {
  assert.equal(parsePage('3', 12), 3);
  assert.equal(parsePage('0', 12), 1);
  assert.equal(parsePage('99', 12), 12);
  assert.equal(parsePage('', 12), null);
  assert.equal(parsePage('abc', 12), null);
  assert.equal(parsePage('2', 0), null);
});

test('describeError says what failed and whether retrying helps', () => {
  assert.equal(describeError({ name: 'PasswordException' }).retry, false);
  assert.equal(describeError({ name: 'InvalidPDFException' }).retry, false);
  assert.match(describeError({ name: 'ResponseException', status: 404 }).title, /404/);
  assert.match(describeError({ name: 'ResponseException', status: 503 }).title, /503/);
  assert.equal(describeError(new TypeError('Failed to fetch')).retry, true);
  assert.equal(describeError(undefined).retry, true);
});
