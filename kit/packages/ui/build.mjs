// After tsc: ship what the JS loads with new URL('…', import.meta.url) (logos, the pdf.js worker) and fail the build
// when one of those targets is missing from dist, so a published package never points at a file it does not contain.
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

cpSync('src/assets', 'dist/assets', { recursive: true });

const missing = [];
for (const f of readdirSync('dist', { recursive: true })) {
  if (!f.endsWith('.js')) continue;
  const file = join('dist', f);
  // tsc rewrites import specifiers in .js but not URLs ('./pdf.worker.ts') nor .d.ts specifiers: point both at '.js'
  const src = readFileSync(file, 'utf8').replace(/new URL\((['"])(\.\.?\/[^'"]+)\.tsx?\1/g, 'new URL($1$2.js$1');
  writeFileSync(file, src);
  const dts = file.replace(/\.js$/, '.d.ts');
  if (existsSync(dts)) writeFileSync(dts, readFileSync(dts, 'utf8').replace(/((?:from|import\()\s*(['"])\.\.?\/[^'"]+)\.tsx?\2/g, '$1.js$2'));
  for (const [, , rel] of src.matchAll(/new URL\((['"])(\.\.?\/[^'"]+)\1,\s*import\.meta\.url/g))
    if (!existsSync(join(dirname(file), rel))) missing.push(`${file} -> ${rel}`);
}
if (missing.length) {
  console.error('dist is missing URL targets:\n  ' + missing.join('\n  '));
  process.exit(1);
}
