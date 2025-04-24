
import { JournalEntry } from '@/types/accounting-types';

const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    date: '2025-04-01',
    reference: 'JE-2025-001',
    description: 'Monthly rent revenue recognition',
    amount: 5000,
    status: 'posted',
    createdBy: 'John Smith',
    createdAt: '2025-04-01T10:30:00Z',
    associationId: 'assoc-1'
  },
  {
    id: '2',
    date: '2025-04-02',
    reference: 'JE-2025-002',
    description: 'Office supplies expense',
    amount: 350.75,
    status: 'posted',
    createdBy: 'John Smith',
    createdAt: '2025-04-02T11:15:00Z',
    associationId: 'assoc-1'
  },
  {
    id: '3',
    date: '2025-04-05',
    reference: 'JE-2025-003',
    description: 'Maintenance service payment',
    amount: 1200,
    status: 'reconciled',
    createdBy: 'Jane Doe',
    createdAt: '2025-04-05T14:45:00Z',
    associationId: 'assoc-2'
  },
  {
    id: '4',
    date: '2025-04-08',
    reference: 'JE-2025-004',
    description: 'Adjustment for overpayment of assessment fees',
    amount: 475.25,
    status: 'draft',
    createdBy: 'Jane Doe',
    createdAt: '2025-04-08T09:20:00Z',
    associationId: 'assoc-2'
  },
  {
    id: '5',
    date: '2025-04-09',
    reference: 'JE-2025-005',
    description: 'Transfer to reserve account',
    amount: 2500,
    status: 'posted',
    createdBy: 'John Smith',
    createdAt: '2025-04-09T15:10:00Z',
    associationId: 'assoc-1'
  }
];

export default mockJournalEntries;
