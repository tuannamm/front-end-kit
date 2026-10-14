// After tsc: ship what the JS loads with new URL('…', import.meta.url) (logos, the pdf.js worker) and fail the build
// when one of those targets is missing from dist, so a published package never points at a file it does not contain.
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

cpSync('src/assets', 'dist/assets', { recursive: true });

const missing = [];
// Create React App runs SVGR on every .svg a module loads, including new URL() logos, and SVGR rejects namespaces JSX
// cannot express (xmlns:serif from Affinity, sodipodi/inkscape…). Those carry editor metadata only, so the shipped copy
// drops each declaration whose prefix is otherwise unused; src/assets keeps the original files, rendering is unchanged.
for (const f of readdirSync('dist/assets', { recursive: true })) {
  if (!f.endsWith('.svg')) continue;
  const file = join('dist/assets', f);
  let svg = readFileSync(file, 'utf8');
  for (const [decl, prefix] of svg.matchAll(/\s+xmlns:([\w.-]+)="[^"]*"/g)) {
    if (prefix === 'xlink') continue;
    if (new RegExp(`[<\\s]${prefix}:`).test(svg.replace(decl, ''))) missing.push(`${file}: namespace ${prefix} is used, SVGR cannot compile it`);
    else svg = svg.replace(decl, '');
  }
  writeFileSync(file, svg);
}
const isFile = p => existsSync(p) && statSync(p).isFile();
// Node ESM and webpack 5 (this is a "type": "module" package) only accept fully specified relative imports, while the
// source writes './ai' and './cx' and tsc keeps them as written. Point every relative import in dist at the file it
// means ('./ai' → './ai/index.js', './cx' → './cx.js'); one that resolves to nothing fails the build.
const fullySpecify = (file, code) =>
  code.replace(/(\b(?:from|import)\s*\(?\s*)(['"])(\.\.?\/[^'"]+)\2/g, (all, head, q, spec) => {
    const target = [spec, `${spec}.js`, `${spec}/index.js`].find(s => isFile(join(dirname(file), s)));
    if (!target) missing.push(`${file} -> ${spec}`);
    return `${head}${q}${target ?? spec}${q}`;
  });

for (const f of readdirSync('dist', { recursive: true })) {
  if (!f.endsWith('.js')) continue;
  const file = join('dist', f);
  // tsc rewrites import specifiers in .js but not URLs ('./pdf.worker.ts') nor .d.ts specifiers: point both at '.js'
  const src = fullySpecify(file, readFileSync(file, 'utf8').replace(/new URL\((['"])(\.\.?\/[^'"]+)\.tsx?\1/g, 'new URL($1$2.js$1'));
  writeFileSync(file, src);
  const dts = file.replace(/\.js$/, '.d.ts');
  if (existsSync(dts)) writeFileSync(dts, fullySpecify(dts, readFileSync(dts, 'utf8').replace(/((?:from|import\()\s*(['"])\.\.?\/[^'"]+)\.tsx?\2/g, '$1.js$2')));
  for (const [, , rel] of src.matchAll(/new URL\((['"])(\.\.?\/[^'"]+)\1,\s*import\.meta\.url/g))
    if (!existsSync(join(dirname(file), rel))) missing.push(`${file} -> ${rel}`);
}
if (missing.length) {
  console.error('dist would not work in an app:\n  ' + missing.join('\n  '));
  process.exit(1);
}
