// Pure helper behind Avatar; no DOM, so initials.check.ts can run it in node.

const firstLetter = (word: string) => word.match(/\p{L}/u)?.[0] ?? '';

/** "Nguyễn Thị Thuận" → "NT": first letter of the first and last word. Words without a letter are skipped; none at all → "". */
export function initials(name: string): string {
  // NFC so a decomposed "Ẩ" (A + marks) still counts as one letter
  const letters = name.normalize('NFC').split(/\s+/).map(firstLetter).filter(Boolean);
  const pick = letters.length > 1 ? letters[0] + letters[letters.length - 1] : letters[0] ?? '';
  return pick.toLocaleUpperCase('vi');
}
