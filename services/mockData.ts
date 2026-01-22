import { Case, TodoItem, TodoCategory, TodoStatus } from '../types';

export const MOCK_CASES: Case[] = [
  { id: '1150122-08', patientName: '林○宏', hospital: '台北市新光醫院', status: '待進件', time: '1970-01-01 08:00', careType: '全天' },
  { id: '1150122-07', patientName: '陳○美', hospital: '台中 | 北屯區居家', status: '未派遺', time: '1970-01-01 08:00', careType: '一日' },
  { id: '1150122-06', patientName: '張○銘', hospital: '桃園市楊梅區', status: '待進件', time: '1970-01-01 09:00', careType: '居家' },
  { id: '1150122-05', patientName: '李○華', hospital: '台大癌醫中心', status: '未到班', time: '1970-01-01 08:00', careType: '全天' },
  { id: '1150122-03', patientName: '王○明', hospital: '台北榮總', status: '已派遺', time: '1970-01-01 12:00', careType: '半天' },
];

export const MOCK_TODOS: TodoItem[] = [
  {
    id: 't1',
    caseId: '1150122-07',
    content: '家屬詢問是否可以改為半天照護，待回覆',
    category: TodoCategory.CONTACT,
    status: TodoStatus.PENDING,
    createdAt: '2024-01-22 09:30',
    creatorName: '客服小美',
  },
  {
    id: 't2',
    caseId: '1150122-07',
    content: '確認案主是否有PCR證明',
    category: TodoCategory.RECORD,
    status: TodoStatus.COMPLETED,
    createdAt: '2024-01-21 14:00',
    creatorName: '派遺專員',
  },
  {
    id: 't3',
    caseId: '1150122-08',
    content: '月底前需開立三聯式發票寄給案主公司',
    category: TodoCategory.INVOICE,
    status: TodoStatus.PENDING,
    createdAt: '2024-01-22 10:15',
    creatorName: '會計部',
    dueDate: '2024-01-31'
  },
  {
    id: 't4',
    caseId: '1150122-05',
    content: '照服員反應案主家中有大型寵物，需確認安全',
    category: TodoCategory.RECORD, // Changed from DISPATCH to RECORD
    status: TodoStatus.PENDING,
    createdAt: '2024-01-22 11:00',
    creatorName: '客服小美',
  },
  {
    id: 't5',
    caseId: '1150122-03',
    content: '已收到訂金 3000 元',
    category: TodoCategory.BILLING,
    status: TodoStatus.COMPLETED,
    createdAt: '2024-01-20 16:20',
    creatorName: '會計部',
  },
    {
    id: 't6',
    caseId: '1150122-07',
    content: '家屬來電取消明日上午班次',
    category: TodoCategory.CANCEL,
    status: TodoStatus.PENDING,
    createdAt: '2024-01-22 13:45',
    creatorName: '夜班客服',
  }
];