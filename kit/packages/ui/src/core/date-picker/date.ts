// Dates are ISO strings ('2026-10-05'): no time, no timezone, compare with < and >.
const pad = (n: number, w = 2) => String(n).padStart(w, '0');

/** Normalises overflow (day 0, month 12…) the way Date does. */
export function toIso(y: number, m: number, d: number) {
  const t = new Date(Date.UTC(y, m, d));
  return `${pad(t.getUTCFullYear(), 4)}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}
const parts = (iso: string) => [+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)] as const;

export function todayIso() {
  const n = new Date();
  return toIso(n.getFullYear(), n.getMonth(), n.getDate());
}
/** Display pattern: dd / d (day), MM / M (month), yyyy (year), anything else is a literal. e.g. 'yyyy-MM-dd', 'd.M.yyyy'. */
export const DEFAULT_DATE_FORMAT = 'dd/MM/yyyy';
const TOKEN = /yyyy|MM|M|dd|d/g;
type Part = 'y' | 'M' | 'd';
function partsOf(format: string): Part[] {
  const kinds = (format.match(TOKEN) ?? []).map(t => t[0] as Part);
  if (kinds.length !== 3 || new Set(kinds).size !== 3) throw new Error(`Date format needs d, M and yyyy exactly once: "${format}"`);
  return kinds;
}

export function formatDate(iso: string | null | undefined, format = DEFAULT_DATE_FORMAT) {
  partsOf(format);
  if (!iso) return '';
  const [y, m, d] = [iso.slice(0, 4), iso.slice(5, 7), iso.slice(8, 10)];
  return format.replace(TOKEN, t => (t === 'yyyy' ? y : t === 'MM' ? m : t === 'M' ? String(+m) : t === 'dd' ? d : String(+d)));
}

/**
 * Reads the parts in the order the format puts them, with any separator, or all digits run together
 * (ddMMyyyy for 'dd/MM/yyyy'). Four-digit years only (a 2-digit year is ambiguous on birth dates).
 */
export function parseDate(text: string, format = DEFAULT_DATE_FORMAT): string | null {
  const order = partsOf(format), s = text.trim();
  const m = new RegExp(`^${order.map(p => (p === 'y' ? '(\\d{4})' : '(\\d{1,2})')).join('\\D+')}$`).exec(s)
    ?? new RegExp(`^${order.map(p => (p === 'y' ? '(\\d{4})' : '(\\d{2})')).join('')}$`).exec(s);
  if (!m) return null;
  const v = { y: 0, M: 0, d: 0 };
  order.forEach((p, i) => { v[p] = +m[i + 1]; });
  const [d, mo, y] = [v.d, v.M, v.y];
  const iso = toIso(y, mo - 1, d);
  return iso === `${pad(y, 4)}-${pad(mo)}-${pad(d)}` ? iso : null; // rejects 31/02, 00/10, 12/13
}

export const addDays = (iso: string, n: number) => { const [y, m, d] = parts(iso); return toIso(y, m, d + n); };
/** Keeps the day, clamped to the target month's length (31/01 + 1 month = 28/02). */
export function addMonths(iso: string, n: number) {
  const [y, m, d] = parts(iso);
  return toIso(y, m + n, Math.min(d, new Date(Date.UTC(y, m + n + 1, 0)).getUTCDate()));
}
export const clampDate = (iso: string, min?: string, max?: string) => (min && iso < min ? min : max && iso > max ? max : iso);
/** Monday-first weekday index, 0–6. */
export const weekday = (iso: string) => (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;
/** 42 days (6 weeks, Monday first) covering the month, so the grid never changes height. */
export function monthGrid(y: number, m: number) {
  const lead = weekday(toIso(y, m, 1));
  return Array.from({ length: 42 }, (_, i) => toIso(y, m, 1 - lead + i));
}
