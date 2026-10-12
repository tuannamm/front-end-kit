/** Built by changelog.ts from git: every commit that touched kit/packages/, newest first. null when the build had no git history. */
declare module 'virtual:changelog' {
  /** A component folder or file (`core/select`, `data/xy-chart`) and the PascalCase names it exports today. */
  export type ChangeUnit = { label: string; names: string[] };
  export type Commit = { hash: string; /** ISO */ date: string; subject: string; units: ChangeUnit[] };
  export const changelog: Commit[] | null;
}
