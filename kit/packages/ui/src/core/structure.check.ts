// Every core component folder has its component, its CSS and its README: `npm test` fails when one is missing.
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const core = import.meta.dirname;
const dirs = readdirSync(core, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
assert.ok(dirs.length > 0, 'no component folders found in core/');
const missing = dirs.flatMap(d => [`${d}.tsx`, `${d}.css`, 'README.md'].filter(f => !existsSync(join(core, d, f))).map(f => `core/${d}/${f}`));
assert.deepEqual(missing, [], `missing: ${missing.join(', ')}`);
