// Sample data for the demos. Not real customers or figures.
import type { ScanField, ScanRow } from '@dtx/ui';

export const invoiceRows: ScanRow[] = [
  { label: 'Số hoá đơn', value: '0000347', field: 'invoice_no' },
  { label: 'Ngày', value: '02/10/2026', field: 'issue_date' },
  { label: 'Đơn vị bán', value: 'Công ty TNHH Minh Phát', field: 'seller' },
  { label: 'Địa chỉ', value: 'Q.7, TP. Hồ Chí Minh' },
  { rule: true },
  { label: 'Giấy in A4 (thùng)', value: '12' },
  { label: 'Mực in laser', value: '4' },
  { rule: true },
  { label: 'Thuế GTGT 8%', value: '1.152.000', field: 'vat_amount' },
  { label: 'Tổng cộng', value: '15.552.000 ₫', field: 'total', strong: true },
];
export const invoiceFields: ScanField[] = [
  { key: 'invoice_no', value: '0000347', confidence: 99.8 },
  { key: 'issue_date', value: '2026-10-02', confidence: 99.6 },
  { key: 'seller', value: 'Công ty TNHH Minh Phát', confidence: 98.9 },
  { key: 'vat_amount', value: '1,152,000', confidence: 94.2 },
  { key: 'total', value: '15,552,000 VND', confidence: 99.7 },
];

export type Batch = { id: string; type: [vi: string, en: string]; client: string; /** unknown until processed */ pages?: number; accuracy?: number; status: 'processing' | 'qc' | 'risk' | 'done' | 'error'; /** uploaded files, for a batch still processing */ files?: number; sla: string; /** ISO */ received: string };
export const batches: Batch[] = [
  { id: 'BH-2210', type: ['Hồ sơ bồi thường', 'Claim file'], client: 'Bảo hiểm Sao Việt', pages: 1240, accuracy: 99.71, status: 'qc', sla: '14:30', received: '2026-10-05' },
  { id: 'HD-5517', type: ['Hoá đơn VAT', 'VAT invoice'], client: 'Chuỗi bán lẻ Phương Nam', pages: 3860, accuracy: 99.48, status: 'risk', sla: '16:15', received: '2026-10-03' },
  { id: 'TD-0931', type: ['Hợp đồng tín dụng', 'Credit agreement'], client: 'Ngân hàng Đông Á Mới', pages: 610, accuracy: 99.9, status: 'qc', sla: '18:00', received: '2026-10-02' },
  { id: 'NS-0418', type: ['Hồ sơ nhân sự', 'HR file'], client: 'Tập đoàn Thành Đạt', pages: 2105, accuracy: 99.83, status: 'done', sla: '11:00', received: '2026-09-28' },
  { id: 'VC-7702', type: ['Vận đơn', 'Bill of lading'], client: 'Logistics Cửu Long', pages: 980, accuracy: 97.12, status: 'error', sla: '10:30', received: '2026-09-24' },
];

/** Older batches, generated so the App table has pages to go through. Deterministic, invented like the rest. */
export const olderBatches: Batch[] = Array.from({ length: 43 }, (_, i) => {
  const k = i % 5;
  return {
    id: `${batches[k].id.slice(0, 2)}-${1000 + (i * 7919) % 9000}`, type: batches[k].type, client: batches[(i * 3) % 5].client,
    pages: 300 + (i * 997) % 3500, accuracy: +(98.6 + ((i * 37) % 140) / 100).toFixed(2),
    status: (['done', 'done', 'qc', 'done', 'error', 'done', 'done', 'qc', 'done', 'risk'] as const)[i % 10],
    sla: `${String(8 + (i % 10)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`,
    received: new Date(Date.UTC(2026, 8, 23 - Math.floor(i / 2))).toISOString().slice(0, 10),
  };
});

export const hours = ['7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h'];
export const aiThroughput = [2100, 3900, 5200, 5800, 6100, 3400, 5600, 6300, 5900, 4700];
export const manualThroughput = [420, 610, 760, 820, 790, 450, 700, 840, 810, 620];
