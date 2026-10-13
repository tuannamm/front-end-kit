import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextVersion } from './release.mjs';

test('nextVersion bumps like npm version', () => {
  assert.equal(nextVersion('0.1.0', 'alpha'), '0.1.1-alpha.0');        // stable → first alpha of the next patch
  assert.equal(nextVersion('0.1.1-alpha.0', 'alpha'), '0.1.1-alpha.1');
  assert.equal(nextVersion('0.2.0-rc.1', 'alpha'), '0.2.0-alpha.0');   // another pre-release id restarts at alpha.0
  assert.equal(nextVersion('0.1.1-alpha.3', 'patch'), '0.1.1');         // a stable bump finishes the pre-release
  assert.equal(nextVersion('0.1.1', 'patch'), '0.1.2');
  assert.equal(nextVersion('0.2.0-alpha.1', 'minor'), '0.2.0');
  assert.equal(nextVersion('0.1.1-alpha.1', 'minor'), '0.2.0');
  assert.equal(nextVersion('1.0.0-alpha.0', 'major'), '1.0.0');
  assert.equal(nextVersion('0.9.4', 'major'), '1.0.0');
  assert.throws(() => nextVersion('0.1', 'patch'));
  assert.throws(() => nextVersion('0.1.0', 'beta'));
});
