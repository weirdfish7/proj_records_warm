export enum TodoCategory {
  CONTACT = '聯絡',
  RECORD = '紀錄',
  BILLING = '帳務',
  INVOICE = '開發票',
  CANCEL = '取消'
}

export enum TodoStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export interface Case {
  id: string;
  patientName: string;
  hospital: string;
  status: string; // e.g., '待進件', '未派遺', '未到班'
  time: string;
  careType: string; // e.g., '全天', '半天'
}

export interface TodoItem {
  id: string;
  caseId: string;
  content: string;
  category: TodoCategory;
  status: TodoStatus;
  createdAt: string;
  creatorName: string;
  dueDate?: string;
}

export type ViewState = 'CASES' | 'TODOS';