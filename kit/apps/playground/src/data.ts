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

export type Batch = { id: string; type: string; client: string; pages: number; accuracy: number; status: 'qc' | 'risk' | 'done' | 'error'; sla: string };
export const batches: Batch[] = [
  { id: 'BH-2210', type: 'Hồ sơ bồi thường', client: 'Bảo hiểm Sao Việt (mẫu)', pages: 1240, accuracy: 99.71, status: 'qc', sla: '14:30' },
  { id: 'HD-5517', type: 'Hoá đơn VAT', client: 'Chuỗi bán lẻ Phương Nam (mẫu)', pages: 3860, accuracy: 99.48, status: 'risk', sla: '16:15' },
  { id: 'TD-0931', type: 'Hợp đồng tín dụng', client: 'Ngân hàng Đông Á Mới (mẫu)', pages: 610, accuracy: 99.9, status: 'qc', sla: '18:00' },
  { id: 'NS-0418', type: 'Hồ sơ nhân sự', client: 'Tập đoàn Thành Đạt (mẫu)', pages: 2105, accuracy: 99.83, status: 'done', sla: '11:00' },
  { id: 'VC-7702', type: 'Vận đơn', client: 'Logistics Cửu Long (mẫu)', pages: 980, accuracy: 97.12, status: 'error', sla: '10:30' },
];

export const hours = ['7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h'];
export const aiThroughput = [2100, 3900, 5200, 5800, 6100, 3400, 5600, 6300, 5900, 4700];
export const manualThroughput = [420, 610, 760, 820, 790, 450, 700, 840, 810, 620];
