
import { JournalEntry } from '@/types/accounting-types';

// Mock journal entries data
export const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    entryNumber: 'JE-20231101-0001',
    entryDate: '2023-11-01',
    date: '2023-11-01', // For compatibility
    reference: 'NOV2023-ASSESS',
    description: 'Monthly assessment revenue',
    status: 'posted',
    amount: 5000,
    associationId: '1',
    createdBy: 'system',
    createdAt: '2023-11-01T08:30:00Z',
    updatedAt: '2023-11-01T08:30:00Z'
  },
  {
    id: '2',
    entryNumber: 'JE-20231102-0002',
    entryDate: '2023-11-02',
    date: '2023-11-02', // For compatibility
    reference: 'INV-LANDS-1102',
    description: 'Landscaping expense',
    status: 'draft',
    amount: 1200,
    associationId: '1',
    createdBy: 'system',
    createdAt: '2023-11-02T09:15:00Z',
    updatedAt: '2023-11-02T09:15:00Z'
  },
  {
    id: '3',
    entryNumber: 'JE-20231105-0003',
    entryDate: '2023-11-05',
    date: '2023-11-05', // For compatibility
    reference: 'INV-LEGAL-1105',
    description: 'Legal services',
    status: 'posted', // Changed from 'reconciled' to valid status
    amount: 800,
    associationId: '1',
    createdBy: 'system',
    createdAt: '2023-11-05T14:45:00Z',
    updatedAt: '2023-11-05T14:45:00Z'
  },
  {
    id: '4',
    entryNumber: 'JE-20231110-0004',
    entryDate: '2023-11-10',
    date: '2023-11-10', // For compatibility
    reference: 'INV-INS-1110',
    description: 'Insurance premium',
    status: 'posted',
    amount: 1500,
    associationId: '1',
    createdBy: 'system',
    createdAt: '2023-11-10T11:30:00Z',
    updatedAt: '2023-11-10T11:30:00Z'
  },
  {
    id: '5',
    entryNumber: 'JE-20231115-0005',
    entryDate: '2023-11-15',
    date: '2023-11-15', // For compatibility
    reference: 'TRANSFER-RES-1115',
    description: 'Transfer to reserve account',
    status: 'draft',
    amount: 3000,
    associationId: '1',
    createdBy: 'system',
    createdAt: '2023-11-15T10:00:00Z',
    updatedAt: '2023-11-15T10:00:00Z'
  }
];
