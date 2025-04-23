
import { JournalEntry } from '@/types/accounting-types';

// Sample mock journal entries
export const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    date: '2025-03-15',
    entryDate: '2025-03-15',
    reference: 'JE-2025-001',
    entryNumber: 'JE-2025-001',
    description: 'Monthly utility expense',
    amount: 1500,
    status: 'posted',
    createdBy: 'System Admin',
    createdAt: '2025-03-15T08:30:00Z',
    updatedAt: '2025-03-15T08:30:00Z',
    associationId: '123'
  },
  {
    id: '2',
    date: '2025-03-16',
    entryDate: '2025-03-16',
    reference: 'JE-2025-002',
    entryNumber: 'JE-2025-002',
    description: 'Assessment revenue recognition',
    amount: 12000,
    status: 'posted',
    createdBy: 'John Doe',
    createdAt: '2025-03-16T09:15:00Z',
    updatedAt: '2025-03-16T09:15:00Z',
    associationId: '123'
  },
  {
    id: '3',
    date: '2025-03-17',
    entryDate: '2025-03-17',
    reference: 'JE-2025-003',
    entryNumber: 'JE-2025-003',
    description: 'Bank fee payment',
    amount: 25,
    status: 'reconciled',
    createdBy: 'Jane Smith',
    createdAt: '2025-03-17T10:45:00Z',
    updatedAt: '2025-03-17T10:45:00Z',
    associationId: '123'
  },
  {
    id: '4',
    date: '2025-03-20',
    entryDate: '2025-03-20',
    reference: 'JE-2025-004',
    entryNumber: 'JE-2025-004',
    description: 'Office supplies expense',
    amount: 350,
    status: 'draft',
    createdBy: 'Jane Smith',
    createdAt: '2025-03-20T14:45:00Z',
    updatedAt: '2025-03-20T14:45:00Z',
    associationId: '123'
  },
  {
    id: '5',
    date: '2025-03-21',
    entryDate: '2025-03-21',
    reference: 'JE-2025-005',
    entryNumber: 'JE-2025-005',
    description: 'Insurance premium payment',
    amount: 2500,
    status: 'posted',
    createdBy: 'System Admin',
    createdAt: '2025-03-21T11:30:00Z',
    updatedAt: '2025-03-21T11:30:00Z',
    associationId: '123'
  }
];
