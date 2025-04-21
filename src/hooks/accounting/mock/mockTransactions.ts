
import { Transaction } from '@/types/transaction-payment-types';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-04-01',
    description: 'Monthly assessment payment',
    property: 'Oak Terrace #101',
    amount: 350.00,
    type: 'income',
    category: 'Assessment',
    glAccount: 'Assessment Income',
    associationId: 'assoc-1'
  },
  {
    id: '2',
    date: '2025-04-02',
    description: 'Lawn maintenance',
    property: 'Common Area',
    amount: 1250.00,
    type: 'expense',
    category: 'Landscaping',
    glAccount: 'Landscaping Expenses',
    associationId: 'assoc-1'
  },
  {
    id: '3',
    date: '2025-04-03',
    description: 'Pool service',
    property: 'Common Area',
    amount: 450.00,
    type: 'expense',
    category: 'Maintenance',
    glAccount: 'Pool Expenses',
    associationId: 'assoc-2'
  },
  {
    id: '4',
    date: '2025-04-04',
    description: 'Late fee payment',
    property: 'Pine Ridge #205',
    amount: 25.00,
    type: 'income',
    category: 'Late Fees',
    glAccount: 'Late Fee Income',
    associationId: 'assoc-2'
  },
  {
    id: '5',
    date: '2025-04-05',
    description: 'Special assessment payment',
    property: 'Maple Court #302',
    amount: 200.00,
    type: 'income',
    category: 'Special Assessment',
    glAccount: 'Special Assessment Income',
    associationId: 'assoc-1'
  }
];

export default mockTransactions;
