// Every core component folder has its component, its CSS and its README, and the README's Props tables match the
// source: each exported component has a `### Name` table listing every prop it reads, and every documented prop
// still appears in the source. `npm test` fails on any gap.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Keys of a destructuring pattern `{ a, b = 1, 'aria-label': x, ...rest }` at the start of `s`. */
function topLevelKeys(s: string) {
  const items: string[] = [];
  let depth = 1, quote = '', item = '';
  for (const c of s.slice(1)) {
    if (quote) { if (c === quote) quote = ''; item += c; continue; }
    if ('\'"`'.includes(c)) quote = c;
    else if ('{(['.includes(c)) depth++;
    else if ('})]'.includes(c) && --depth === 0) break;
    if (depth === 1 && c === ',') { items.push(item); item = ''; } else item += c;
  }
  items.push(item);
  return items.map(k => k.trim()).filter(k => k && !k.startsWith('...')).map(k => /^'([^']+)'|^(\w+)/.exec(k)!).map(m => m[1] ?? m[2]);
}

/** Props each exported component reads: its destructured first parameter, or `props.x` when it takes `props` whole. */
function componentProps(src: string) {
  const out = new Map<string, Set<string>>();
  const starts = [...src.matchAll(/^export function (\w+)\(/gm)];
  starts.forEach((m, i) => {
    const body = src.slice(m.index + m[0].length, starts[i + 1]?.index ?? src.length);
    if (body.startsWith('{')) out.set(m[1], new Set(topLevelKeys(body)));
    else if (body.startsWith('props')) out.set(m[1], new Set([
      ...[...body.matchAll(/props(?:\.(\w+)|\['([\w-]+)'\])/g)].map(x => x[1] ?? x[2]),
      ...[...body.matchAll(/(?:const|let) \{([^}]*)\} = props\b/g)].flatMap(x => x[1].split(',').map(k => k.trim().split(/[\s=:]/)[0]).filter(Boolean)),
    ]));
  });
  return out;
}

/** `### Name` → prop names in the first column of its table, inside the README's `## Props` section. */
function propsTables(md: string) {
  const section = md.split(/^## Props$/m)[1]?.split(/^## /m)[0] ?? '';
  return new Map(section.split(/^### /m).slice(1).map(block => {
    const [head, ...lines] = block.split('\n');
    return [head.trim(), new Set(lines.flatMap(l => /^\| `([\w-]+)` \|/.exec(l)?.[1] ?? []))] as const;
  }));
}

const core = import.meta.dirname;
const dirs = readdirSync(core, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
assert.ok(dirs.length > 0, 'no component folders found in core/');
const problems: string[] = [];
for (const d of dirs) {
  const dir = join(core, d);
  for (const f of [`${d}.tsx`, `${d}.css`, 'README.md']) if (!existsSync(join(dir, f))) problems.push(`core/${d}/${f} is missing`);
  if (!existsSync(join(dir, 'README.md'))) continue;
  const src = readdirSync(dir).filter(f => /\.tsx?$/.test(f) && !f.endsWith('.check.ts')).map(f => readFileSync(join(dir, f), 'utf8')).join('\n');
  const docs = propsTables(readFileSync(join(dir, 'README.md'), 'utf8'));
  const exported = new Set([...src.matchAll(/^export (?:function|const|type) (\w+)/gm)].map(m => m[1]));
  for (const [name, props] of componentProps(src)) {
    const doc = docs.get(name);
    if (!doc) { problems.push(`core/${d}/README.md: no "### ${name}" props table`); continue; }
    for (const p of props) if (!doc.has(p)) problems.push(`core/${d}/README.md: ${name} does not document \`${p}\``);
  }
  for (const [name, props] of docs) {
    if (!exported.has(name)) problems.push(`core/${d}/README.md: documents ${name}, which core/${d} does not export`);
    for (const p of props) if (!new RegExp(`\\b${p}\\b`).test(src)) problems.push(`core/${d}/README.md: ${name}.${p} no longer appears in the source`);
  }
}
assert.deepEqual(problems, [], problems.join('\n'));
