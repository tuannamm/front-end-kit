import { FileText, Landmark, ShieldCheck, UserRound, Receipt, Truck } from 'lucide-react';
import type { SelectGroup, SelectOption } from '@dtx/ui';

/** Grouped + icon + description: the richest Select shape. */
export const docTypeGroups: SelectGroup[] = [
  { label: 'Tài chính', items: [
    { value: 'vat', label: 'Hoá đơn VAT', description: 'Trích xuất 18 trường', icon: <Receipt />, tone: 'brand' },
    { value: 'bank', label: 'Sao kê ngân hàng', description: 'Bảng giao dịch nhiều trang', icon: <Landmark />, tone: 'brand' },
  ] },
  { label: 'Bảo hiểm', items: [
    { value: 'claim', label: 'Hồ sơ bồi thường', description: 'Hồ sơ nhiều tài liệu, có ảnh', icon: <ShieldCheck />, tone: 'violet' },
    { value: 'policy', label: 'Hợp đồng bảo hiểm', description: 'Sắp ra mắt', icon: <FileText />, tone: 'neutral', disabled: true },
  ] },
  { label: 'Nhân sự & vận tải', items: [
    { value: 'hr', label: 'Hồ sơ nhân sự', description: 'CCCD, bằng cấp, hợp đồng', icon: <UserRound />, tone: 'ok' },
    { value: 'bill', label: 'Vận đơn', icon: <Truck />, tone: 'neutral' },
  ] },
];
/** Plain list: no icons, no groups. */
export const shiftOptions: SelectOption[] = [
  { value: 'am', label: 'Ca sáng' }, { value: 'pm', label: 'Ca chiều' }, { value: 'night', label: 'Ca đêm' },
];
/** Mixed: some options have descriptions, some icons, some neither. */
export const statusOptions: SelectOption[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'qc', label: 'Đang QC', description: 'Chờ kiểm tra chất lượng' },
  { value: 'risk', label: 'Nguy cơ trễ', icon: <ShieldCheck />, tone: 'warn' },
  { value: 'done', label: 'Hoàn tất' },
];
