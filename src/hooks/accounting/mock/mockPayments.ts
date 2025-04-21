
import { Payment } from '@/types/transaction-payment-types';

const mockPayments: Payment[] = [
  {
    id: 'PAY-001',
    vendor: 'Green Lawn Care',
    amount: 1250.00,
    date: '2025-04-02',
    status: 'processed',
    method: 'ach',
    associationName: 'Oak Terrace HOA',
    category: 'Landscaping',
    associationId: 'assoc-1',
    invoiceId: 'INV-001'
  },
  {
    id: 'PAY-002',
    vendor: 'Crystal Clear Pools',
    amount: 450.00,
    date: '2025-04-03',
    status: 'scheduled',
    method: 'check',
    associationName: 'Pine Ridge HOA',
    category: 'Maintenance',
    associationId: 'assoc-2',
    invoiceId: 'INV-002',
    scheduledDate: '2025-04-08'
  },
  {
    id: 'PAY-003',
    vendor: 'Allied Insurance',
    amount: 3500.00,
    date: '2025-04-10',
    status: 'pending',
    method: 'check',
    associationName: 'Oak Terrace HOA',
    category: 'Insurance',
    associationId: 'assoc-1',
    invoiceId: 'INV-003'
  },
  {
    id: 'PAY-004',
    vendor: 'City Water & Power',
    amount: 875.50,
    date: '2025-04-15',
    status: 'scheduled',
    method: 'ach',
    associationName: 'Maple Court HOA',
    category: 'Utilities',
    associationId: 'assoc-3',
    invoiceId: 'INV-004',
    scheduledDate: '2025-04-15'
  },
  {
    id: 'PAY-005',
    vendor: 'Elite Security Systems',
    amount: 625.00,
    date: '2025-04-18',
    status: 'failed',
    method: 'credit',
    associationName: 'Pine Ridge HOA',
    category: 'Security',
    associationId: 'assoc-2',
    invoiceId: 'INV-005'
  },
  {
    id: 'PAY-006',
    vendor: 'ABC Roofing',
    amount: 7500.00,
    date: '2025-04-20',
    status: 'scheduled',
    method: 'check',
    associationName: 'Oak Terrace HOA',
    category: 'Repairs',
    associationId: 'assoc-1',
    invoiceId: 'INV-006',
    scheduledDate: '2025-04-25'
  },
  {
    id: 'PAY-007',
    vendor: 'XYZ Landscaping',
    amount: 950.00,
    date: '2025-04-21',
    status: 'scheduled',
    method: 'ach',
    associationName: 'Pine Ridge HOA',
    category: 'Landscaping',
    associationId: 'assoc-2',
    invoiceId: 'INV-007',
    scheduledDate: '2025-04-28'
  }
];

export default mockPayments;
