// Theme lint: component CSS must take colours from tokens so it works in light AND dark.
// Allowed without a token (theme-agnostic by design): black/white alpha (shadows, highlights)
// and DIGI-TEXX Blue alpha tints. Anything else needs `/* theme-fixed: <reason> */` on the same line,
// e.g. a paper document that is always white whatever the theme.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.css') ? [p] : []; });
const LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch)\((?!\s*var\()/gi;
const AGNOSTIC = /^(?:rgba?\(\s*(?:0 0 0|255 255 255|37 130 215)\s*\/)/i;
// Brand constants do not change with the theme. As text colour, or as a neutral surface, they are a
// hard-coded colour in disguise (this is how an always-dark tooltip slipped through). Solid brand fills
// (blue, blue-strong, red, amber, lime, violet) carrying white/ink text are fine: they read the same in both themes.
const CONST_TEXT = /(?:^|[;{\s])color:\s*[^;]*var\(--dtx-(?:blue|blue-strong|blue-hover|red|red-hover|amber|lime|violet|ink|gray|navy|ocean|sky|light|ice|canvas-dark|panel)\)/;
const CONST_SURFACE = /background(?:-color)?:\s*[^;]*var\(--dtx-(?:ink|gray|navy|ocean|sky|light|ice|canvas-dark|panel)\)/;
const bad = [];
for (const file of walk(new URL('./src', import.meta.url).pathname)) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/theme-fixed:/.test(line)) return;
    const code = line.replace(/\/\*.*?\*\//g, '');            // comments may mention hex values
    if (CONST_TEXT.test(code) || CONST_SURFACE.test(code))
      bad.push(`${file.split('/src/')[1]}:${i + 1}  fixed brand constant used as text/surface  →  use a semantic token, or mark /* theme-fixed: why */`);
    for (const m of code.matchAll(LITERAL)) {
      if (AGNOSTIC.test(code.slice(m.index))) continue;
      bad.push(`${file.split('/src/')[1]}:${i + 1}  ${m[0]}…  →  use a --dtx-* token, or mark /* theme-fixed: why */`);
    }
  });
}
if (bad.length) { console.error(`Theme lint: ${bad.length} hard-coded colour(s)\n  ` + bad.join('\n  ')); process.exit(1); }
console.log('theme lint ok: no hard-coded colours outside tokens');
