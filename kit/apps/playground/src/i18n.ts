// Playground UI language. Module-level store so every page re-renders on switch without a provider.
import { useSyncExternalStore } from 'react';

export type Lang = 'vi' | 'en';
/** Both languages at the call site: a missing translation is a type error, never a silent fallback. */
export type Translate = <T>(vi: T, en: T) => T;

const KEY = 'dtx-lang';
const subs = new Set<() => void>();
let lang: Lang = (() => { try { return localStorage.getItem(KEY) === 'en' ? 'en' : 'vi'; } catch { return 'vi'; } })();
document.documentElement.lang = lang;

export function setLang(l: Lang) {
  lang = l;
  document.documentElement.lang = l;
  try { localStorage.setItem(KEY, l); } catch { /* storage blocked */ }
  subs.forEach(f => f());
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const useLang = () => useSyncExternalStore(subscribe, () => lang);
export function useT(): Translate { const l = useLang(); return (vi, en) => (l === 'en' ? en : vi); }
