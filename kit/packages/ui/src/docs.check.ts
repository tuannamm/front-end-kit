// Props documentation is complete and true. Every folder whose .tsx files export a component has a README.md; its
// `## Props` section has a `### Name` block per exported component, each table lists every prop the component reads,
// and every documented prop still appears in the source. Core component folders also hold their own .tsx, .css and
// README. The playground catalog renders these same tables, so `npm test` failing here is the catalog going stale.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { readPropsDocs } from './props-doc.ts';

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

/** Props each exported component (capitalised function, generics allowed) reads: its destructured first parameter, `props.x` when it takes `props` whole, none when it takes nothing. */
function componentProps(src: string) {
  const out = new Map<string, Set<string>>();
  const starts = [...src.matchAll(/^export function ([A-Z]\w*)(?:<[^(]*>)?\(/gm)];
  starts.forEach((m, i) => {
    const body = src.slice(m.index + m[0].length, starts[i + 1]?.index ?? src.length);
    if (body.startsWith('{')) out.set(m[1], new Set(topLevelKeys(body)));
    else if (body.startsWith('props')) out.set(m[1], new Set([
      ...[...body.matchAll(/props(?:\.(\w+)|\['([\w-]+)'\])/g)].map(x => x[1] ?? x[2]),
      ...[...body.matchAll(/(?:const|let) \{([^}]*)\} = props\b/g)].flatMap(x => x[1].split(',').map(k => k.trim().split(/[\s=:]/)[0]).filter(Boolean)),
    ]));
    else out.set(m[1], new Set());
  });
  return out;
}

const HEADER = ['Prop', 'Type', 'Default', 'Description'];
const root = import.meta.dirname;
const walk = (dir: string): string[] => [dir, ...readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).flatMap(d => walk(join(dir, d.name)))];
const problems: string[] = [];
const owner = new Map<string, string>(); // `### Name` → README that documents it; the catalog looks tables up by name

const core = join(root, 'core');
for (const d of readdirSync(core, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)) {
  for (const f of [`${d}.tsx`, `${d}.css`, 'README.md']) if (!existsSync(join(core, d, f))) problems.push(`core/${d}/${f} is missing`);
}

for (const dir of walk(root)) {
  const rel = relative(root, dir) || '.';
  const files = readdirSync(dir).filter(f => /\.tsx?$/.test(f) && !f.endsWith('.check.ts'));
  const src = files.map(f => readFileSync(join(dir, f), 'utf8')).join('\n');
  const components = componentProps(src);
  const readme = join(dir, 'README.md');
  if (!existsSync(readme)) {
    if (components.size) problems.push(`${rel}/README.md is missing (documents ${[...components.keys()].join(', ')})`);
    continue;
  }
  const docs = readPropsDocs(readFileSync(readme, 'utf8'));
  const byName = new Map(docs.map(doc => [doc.name, doc]));
  const exported = new Set([...src.matchAll(/^export (?:function|const|type) (\w+)/gm)].map(m => m[1]));
  for (const [name, props] of components) {
    const doc = byName.get(name);
    if (!doc) { problems.push(`${rel}/README.md: no "### ${name}" props block`); continue; }
    const documented = new Set(doc.rows.map(r => /^`([\w-]+)`$/.exec(r[0])?.[1]));
    for (const p of props) if (!documented.has(p)) problems.push(`${rel}/README.md: ${name} does not document \`${p}\``);
    if (props.size && !doc.rows.length) problems.push(`${rel}/README.md: ${name} has props but no table`);
  }
  for (const doc of docs) {
    const where = `${rel}/README.md: ${doc.name}`;
    if (owner.has(doc.name)) problems.push(`${where} is also documented in ${owner.get(doc.name)}`);
    owner.set(doc.name, `${rel}/README.md`);
    if (!exported.has(doc.name)) problems.push(`${where} is not exported from ${rel}`);
    if (doc.header.length && doc.header.join('|') !== HEADER.join('|')) problems.push(`${where}: table header must be | ${HEADER.join(' | ')} |`);
    for (const r of doc.rows) {
      if (r.length !== HEADER.length) problems.push(`${where}: row "${r[0]}" has ${r.length} cells, not ${HEADER.length}`);
      const p = /^`([\w-]+)`$/.exec(r[0])?.[1];
      if (!p) problems.push(`${where}: first cell "${r[0]}" is not a \`prop\``);
      else if (!new RegExp(`\\b${p}\\b`).test(src)) problems.push(`${where}.${p} no longer appears in the source`);
    }
  }
}
assert.ok(owner.size > 0, 'no Props blocks found');
assert.deepEqual(problems, [], problems.join('\n'));
