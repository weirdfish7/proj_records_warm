import { TodoCategory } from './types';
import { 
  Phone, 
  FileText, 
  DollarSign, 
  FileSpreadsheet, 
  XCircle
} from 'lucide-react';

export const CATEGORY_CONFIG = {
  [TodoCategory.CONTACT]: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Phone,
    label: '聯絡'
  },
  [TodoCategory.RECORD]: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: FileText,
    label: '紀錄'
  },
  [TodoCategory.BILLING]: {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: DollarSign,
    label: '帳務'
  },
  [TodoCategory.INVOICE]: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: FileSpreadsheet,
    label: '發票'
  },
  [TodoCategory.CANCEL]: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    label: '取消'
  }
};