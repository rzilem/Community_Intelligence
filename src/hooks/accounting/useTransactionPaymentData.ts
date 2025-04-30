
import { useState, useEffect } from 'react';
import { Transaction, Payment } from '@/types/transaction-payment-types';
import { JournalEntry } from '@/types/accounting-types';

// Mock transactions data
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

// Mock payments data
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
    associationId: 'assoc-1'
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
    associationId: 'assoc-2'
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
    associationId: 'assoc-1'
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
    associationId: 'assoc-3'
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
    associationId: 'assoc-2'
  }
];

// Mock journal entries
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

export const useTransactionPaymentData = (associationId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    // In a real application, this would be a call to the API to fetch data
    // For now, we're just filtering the mock data
    
    if (associationId) {
      setTransactions(mockTransactions.filter(t => t.associationId === associationId));
      setPayments(mockPayments.filter(p => p.associationId === associationId));
      setJournalEntries(mockJournalEntries.filter(j => j.associationId === associationId));
    } else {
      setTransactions(mockTransactions);
      setPayments(mockPayments);
      setJournalEntries(mockJournalEntries);
    }
  }, [associationId]);

  return { transactions, payments, journalEntries };
};
