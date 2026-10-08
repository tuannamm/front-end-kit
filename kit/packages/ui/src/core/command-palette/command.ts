import { fold } from '../select/fold.ts';

type Searchable = { label: string; description?: string; group?: string; keywords?: string[] };

/** Every word of the query appears somewhere in the label, description, group or keywords, in any order; accents never matter. */
export function matchCommand(c: Searchable, query: string) {
  const text = fold([c.label, c.description, c.group, ...(c.keywords ?? [])].join(' '));
  return fold(query).split(/\s+/).every(w => text.includes(w));
}

/** Items under their `group` heading; groups, and items inside them, keep the order they first appear in. */
export function groupCommands<T extends { group?: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const c of items) {
    const list = groups.get(c.group ?? '');
    if (list) list.push(c); else groups.set(c.group ?? '', [c]);
  }
  return [...groups].map(([label, items]) => ({ label, items }));
}
