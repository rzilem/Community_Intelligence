
import { Transaction, Payment } from '@/types/transaction-payment-types';
import { JournalEntry } from '@/hooks/accounting/useJournalEntries';

// Mock transactions data
export const mockTransactions: Transaction[] = [
  { id: '1', date: '2023-11-01', description: 'Assessment Income', property: 'All Properties', amount: 5000, type: 'income', category: 'Dues', glAccount: '4000 - Assessment Income' },
  { id: '2', date: '2023-11-02', description: 'Landscaping Service', property: 'Common Areas', amount: 1200, type: 'expense', category: 'Maintenance', glAccount: '5100 - Landscaping' },
  { id: '3', date: '2023-11-03', description: 'Late Fee Income', property: '123 Main St', amount: 50, type: 'income', category: 'Fees', glAccount: '4100 - Late Fees' },
  { id: '4', date: '2023-11-04', description: 'Pool Maintenance', property: 'Community Pool', amount: 350, type: 'expense', category: 'Maintenance', glAccount: '5200 - Pool Maintenance' },
  { id: '5', date: '2023-11-05', description: 'Legal Services', property: 'Association', amount: 800, type: 'expense', category: 'Professional Fees', glAccount: '5300 - Legal Fees' },
  { id: '6', date: '2023-11-06', description: 'Interest Income', property: 'Reserve Account', amount: 120, type: 'income', category: 'Interest', glAccount: '4200 - Interest Income' },
  { id: '7', date: '2023-11-07', description: 'Clubhouse Cleaning', property: 'Clubhouse', amount: 200, type: 'expense', category: 'Maintenance', glAccount: '5400 - Cleaning' },
  { id: '8', date: '2023-11-08', description: 'Assessment Income', property: 'All Properties', amount: 5000, type: 'income', category: 'Dues', glAccount: '4000 - Assessment Income' },
  { id: '9', date: '2023-11-09', description: 'Electricity Bill', property: 'Common Areas', amount: 450, type: 'expense', category: 'Utilities', glAccount: '5500 - Electricity' },
  { id: '10', date: '2023-11-10', description: 'Insurance Premium', property: 'Association', amount: 1500, type: 'expense', category: 'Insurance', glAccount: '5600 - Insurance' },
];

// Mock payments data
export const mockPayments: Payment[] = [
  { id: '1', vendor: 'Landscaping Services Inc.', amount: 1200, date: '2023-11-15', status: 'scheduled', method: 'check', associationName: 'Sunset HOA', category: 'Maintenance', associationId: '1' },
  { id: '2', vendor: 'ABC Pool Maintenance', amount: 350, date: '2023-11-18', status: 'pending', method: 'ach', associationName: 'Sunset HOA', category: 'Maintenance', associationId: '1' },
  { id: '3', vendor: 'Legal Partners LLP', amount: 800, date: '2023-11-20', status: 'processed', method: 'check', associationName: 'Sunset HOA', category: 'Professional Fees', associationId: '1' },
  { id: '4', vendor: 'CleanPro Janitorial', amount: 200, date: '2023-11-22', status: 'scheduled', method: 'ach', associationName: 'Sunset HOA', category: 'Maintenance', associationId: '1' },
  { id: '5', vendor: 'City Power & Light', amount: 450, date: '2023-11-25', status: 'pending', method: 'ach', associationName: 'Sunset HOA', category: 'Utilities', associationId: '1' },
  { id: '6', vendor: 'HOA Insurance Corp', amount: 1500, date: '2023-11-30', status: 'scheduled', method: 'check', associationName: 'Sunset HOA', category: 'Insurance', associationId: '1' },
  { id: '7', vendor: 'Security Systems Ltd', amount: 600, date: '2023-12-05', status: 'pending', method: 'wire', associationName: 'Sunset HOA', category: 'Security', associationId: '1' },
  { id: '8', vendor: 'Water Works Inc.', amount: 300, date: '2023-12-10', status: 'scheduled', method: 'ach', associationName: 'Sunset HOA', category: 'Utilities', associationId: '1' },
];

// Mock journal entries
export const mockJournalEntries: JournalEntry[] = [
  { 
    id: '1',
    entry_number: 'JE-20231101-0001',
    date: '2023-11-01',
    reference: 'NOV2023-ASSESS',
    description: 'Monthly assessment revenue',
    status: 'posted',
    association_id: '1',
    created_by: 'system',
    createdBy: 'system'
  },
  { 
    id: '2',
    entry_number: 'JE-20231102-0002',
    date: '2023-11-02',
    reference: 'INV-LANDS-1102',
    description: 'Landscaping expense',
    status: 'draft',
    association_id: '1',
    created_by: 'system',
    createdBy: 'system'
  },
  { 
    id: '3',
    entry_number: 'JE-20231105-0003',
    date: '2023-11-05',
    reference: 'INV-LEGAL-1105',
    description: 'Legal services',
    status: 'reconciled',
    association_id: '1',
    created_by: 'system',
    createdBy: 'system'
  },
  { 
    id: '4',
    entry_number: 'JE-20231110-0004',
    date: '2023-11-10',
    reference: 'INV-INS-1110',
    description: 'Insurance premium',
    status: 'posted',
    association_id: '1',
    created_by: 'system',
    createdBy: 'system'
  },
  { 
    id: '5',
    entry_number: 'JE-20231115-0005',
    date: '2023-11-15',
    reference: 'TRANSFER-RES-1115',
    description: 'Transfer to reserve account',
    status: 'draft',
    association_id: '1',
    created_by: 'system',
    createdBy: 'system'
  },
];
