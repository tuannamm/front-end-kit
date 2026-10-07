/** Lower case without accents, so "bao hiem" finds "Bảo hiểm" (đ counts as d). */
export const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
