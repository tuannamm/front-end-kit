/** One `### Name` block of a README's `## Props` section: table rows (Prop, Type, Default, Description) and the text around them. */
export type PropsDoc = { name: string; header: string[]; rows: string[][]; note: string };

const cells = (line: string) => line.trim().slice(1, -1).split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|'));

/** Parses the Props tables of a component README. Shared by `docs.check.ts` and the playground catalog, so both read the same thing. */
export function readPropsDocs(md: string): PropsDoc[] {
  const section = md.split(/^## Props$/m)[1]?.split(/^## /m)[0] ?? '';
  return section.split(/^### /m).slice(1).map(block => {
    const [head, ...lines] = block.split('\n');
    const table = lines.filter(l => l.startsWith('|')).map(cells);
    return {
      name: head.trim(),
      header: table[0] ?? [],
      rows: table.slice(2),
      note: lines.filter(l => l.trim() && !l.startsWith('|')).join(' ').trim(),
    };
  });
}
