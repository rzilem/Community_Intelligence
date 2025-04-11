
import { Transaction, Payment } from '@/types/transaction-payment-types';

export const useTransactionPaymentData = () => {
  // Mock data for transactions
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      date: '2025-04-05',
      description: 'Monthly Assessment Payment',
      property: 'Property #1234',
      amount: 250.00,
      type: 'income',
      category: 'Assessments',
      glAccount: '1001-00'
    },
    {
      id: '2',
      date: '2025-04-04',
      description: 'Pool Maintenance',
      property: 'Common Area',
      amount: 175.50,
      type: 'expense',
      category: 'Maintenance',
      glAccount: '5001-00'
    },
    {
      id: '3',
      date: '2025-04-03',
      description: 'Violation Fine Payment',
      property: 'Property #5678',
      amount: 100.00,
      type: 'income',
      category: 'Fines',
      glAccount: '3001-00'
    },
    {
      id: '4',
      date: '2025-04-02',
      description: 'Landscaping Services',
      property: 'Common Area',
      amount: 520.75,
      type: 'expense',
      category: 'Landscaping',
      glAccount: '5010-00'
    },
    {
      id: '5',
      date: '2025-04-01',
      description: 'Late Fee Payment',
      property: 'Property #9012',
      amount: 25.00,
      type: 'income',
      category: 'Late Fees',
      glAccount: '3002-00'
    },
    {
      id: '6',
      date: '2025-03-31',
      description: 'Insurance Premium',
      property: 'Association',
      amount: 1250.00,
      type: 'expense',
      category: 'Insurance',
      glAccount: '5050-00'
    },
    {
      id: '7',
      date: '2025-03-30',
      description: 'Special Assessment',
      property: 'Property #3456',
      amount: 500.00,
      type: 'income',
      category: 'Special Assessments',
      glAccount: '1002-00'
    }
  ];

  // Mock data for payments
  const mockPayments: Payment[] = [
    {
      id: 'PAY-1001',
      vendor: 'Sunset Landscaping LLC',
      amount: 2450.00,
      date: '2025-04-10',
      status: 'scheduled',
      method: 'ach',
      associationName: 'Oakridge Estates',
      category: 'Landscaping'
    },
    {
      id: 'PAY-1002',
      vendor: 'Aquatic Pool Services',
      amount: 895.00,
      date: '2025-04-05',
      status: 'processed',
      method: 'check',
      associationName: 'Lakeside Community',
      category: 'Pool Maintenance'
    },
    {
      id: 'PAY-1003',
      vendor: 'Security Systems Inc.',
      amount: 1200.00,
      date: '2025-04-02',
      status: 'processed',
      method: 'credit',
      associationName: 'Highland Towers',
      category: 'Security'
    },
    {
      id: 'PAY-1004',
      vendor: 'Quality Cleaning Co.',
      amount: 750.00,
      date: '2025-04-01',
      status: 'processed',
      method: 'ach',
      associationName: 'Oakridge Estates',
      category: 'Cleaning'
    },
    {
      id: 'PAY-1005',
      vendor: 'Pike Electrical Services',
      amount: 1675.00,
      date: '2025-03-28',
      status: 'processed',
      method: 'check',
      associationName: 'Highland Towers',
      category: 'Repairs'
    },
    {
      id: 'PAY-1006',
      vendor: 'Mountain State Water',
      amount: 2100.00,
      date: '2025-04-15',
      status: 'scheduled',
      method: 'ach',
      associationName: 'Riverside Gardens',
      category: 'Utilities'
    },
    {
      id: 'PAY-1007',
      vendor: 'ABC Insurance Group',
      amount: 3500.00,
      date: '2025-04-08',
      status: 'pending',
      method: 'wire',
      associationName: 'Pine Valley HOA',
      category: 'Insurance'
    }
  ];

  return {
    transactions: mockTransactions,
    payments: mockPayments
  };
};
