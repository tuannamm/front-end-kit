import assert from 'node:assert/strict';
import { test } from 'node:test';
import { unitOf } from './changelog.ts';

test('unitOf groups a changed file under the component it belongs to', () => {
  assert.equal(unitOf('ui/src/core/select/select.tsx'), 'core/select');        // a core folder is one unit
  assert.equal(unitOf('ui/src/core/select/README.md'), 'core/select');
  assert.equal(unitOf('ui/src/core/button.tsx'), 'core/button');                // flat history, before the folders
  assert.equal(unitOf('ui/src/core/index.ts'), 'core');
  assert.equal(unitOf('ui/src/data/xy-chart.tsx'), 'data/xy-chart');           // flat folder: one unit per file
  assert.equal(unitOf('ui/src/data/xy-scale.check.ts'), 'data/xy-scale');      // a check belongs to what it checks
  assert.equal(unitOf('ui/src/ai/shared/shared.css'), 'ai/shared');            // the folder's own stylesheet, README, index, assets
  assert.equal(unitOf('ui/src/ai/shared/README.md'), 'ai/shared');
  assert.equal(unitOf('ui/src/assets/logo-square.png'), 'assets');
  assert.equal(unitOf('ui/src/styles.css'), '@dgtx/ui-frek');
  assert.equal(unitOf('ui/package.json'), '@dgtx/ui-frek');
  assert.equal(unitOf('tokens/tokens.css'), 'tokens');                        // before tokens moved into ui/
  assert.equal(unitOf('ui/tokens/theme.css'), 'tokens');
});
