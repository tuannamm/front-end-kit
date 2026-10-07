// Pure helpers behind NotificationList; no DOM, so time.check.ts can run them in node.

const rel = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
const day = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' });
const clock = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });
const midnight = (t: number) => new Date(t).setHours(0, 0, 0, 0);

/**
 * "Vừa xong", "5 phút trước", "3 giờ trước", then calendar days ("Hôm qua", "Hôm kia", "6 ngày trước"), then "03/09/2026".
 * A time in the future (clock skew) reads "Vừa xong"; an invalid one gives "".
 */
export function relativeTime(when: string | Date, now = Date.now()): string {
  const t = new Date(when).getTime();
  if (Number.isNaN(t)) return '';
  const s = (now - t) / 1000;
  if (s < 60) return 'Vừa xong';
  if (s < 3600) return rel.format(-Math.floor(s / 60), 'minute');
  if (s < 86400) return rel.format(-Math.floor(s / 3600), 'hour');
  // calendar days, not 24h blocks: 30 hours ago at 03:00 two days back is "Hôm kia", not "Hôm qua"
  const days = Math.round((midnight(now) - midnight(t)) / 86400000);
  return days < 7 ? rel.format(-days, 'day') : day.format(t);
}

/** "17:05 · Thứ Năm, 03/09/2026": the exact time, for the tooltip next to a relative one. */
export function fullTime(when: string | Date): string {
  const d = new Date(when);
  return Number.isNaN(d.getTime()) ? '' : `${clock.format(d)} · ${weekday.format(d).replace(/^./, c => c.toUpperCase())}, ${day.format(d)}`;
}
