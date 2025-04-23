
import { JournalEntry } from '@/types/accounting-types';

// Sample mock journal entries
export const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    entryDate: '2025-03-15',
    date: '2025-03-15', // For compatibility
    entryNumber: 'JE-2025-001',
    reference: 'JE-2025-001', // For compatibility
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
    entryDate: '2025-03-16',
    date: '2025-03-16', // For compatibility
    entryNumber: 'JE-2025-002',
    reference: 'JE-2025-002', // For compatibility
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
    entryDate: '2025-03-17',
    date: '2025-03-17', // For compatibility
    entryNumber: 'JE-2025-003',
    reference: 'JE-2025-003', // For compatibility
    description: 'Bank fee payment',
    amount: 25,
    status: 'posted', // Changed from 'reconciled' to match allowed type
    createdBy: 'Jane Smith',
    createdAt: '2025-03-17T10:45:00Z',
    updatedAt: '2025-03-17T10:45:00Z',
    associationId: '123'
  },
  {
    id: '4',
    entryDate: '2025-03-20',
    date: '2025-03-20', // For compatibility
    entryNumber: 'JE-2025-004',
    reference: 'JE-2025-004', // For compatibility
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
    entryDate: '2025-03-21',
    date: '2025-03-21', // For compatibility
    entryNumber: 'JE-2025-005',
    reference: 'JE-2025-005', // For compatibility
    description: 'Insurance premium payment',
    amount: 2500,
    status: 'posted',
    createdBy: 'System Admin',
    createdAt: '2025-03-21T11:30:00Z',
    updatedAt: '2025-03-21T11:30:00Z',
    associationId: '123'
  }
];
