
import { useState, useEffect } from 'react';
import { Transaction, Payment } from '@/types/transaction-payment-types';
import { JournalEntry } from '@/types/accounting-types';
import mockTransactions from './mock/mockTransactions';
import mockPayments from './mock/mockPayments';
import { mockJournalEntries } from './mock/mockJournalEntries';

/**
 * A hook to provide transaction, payment, and journal entry data for accounting dashboard.
 * Filters by associationId if provided.
 */
export const useTransactionPaymentData = (associationId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
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

  // Function to handle updating payment status
  const updatePaymentStatus = (paymentId: string, status: Payment['status']) => {
    setPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === paymentId 
          ? { 
              ...payment, 
              status, 
              processedDate: status === 'processed' ? new Date().toISOString() : payment.processedDate 
            } 
          : payment
      )
    );
    // In a real app, this would update the database and potentially the related invoice
    console.log(`Payment ${paymentId} status updated to ${status}`);
  };

  // Function to create a new payment from an approved invoice
  const createPaymentFromInvoice = (invoice: any) => {
    const newPayment: Payment = {
      id: `PAY-${Math.floor(Math.random() * 1000)}`,
      vendor: invoice.vendor,
      amount: invoice.amount,
      date: new Date().toISOString(),
      status: 'scheduled',
      method: invoice.payment_method || 'check',
      associationName: invoice.association_name || 'Unknown Association',
      category: 'Vendor Payment',
      associationId: invoice.association_id,
      invoiceId: invoice.id,
      scheduledDate: invoice.due_date
    };

    setPayments(prev => [newPayment, ...prev]);
    return newPayment;
  };

  return { 
    transactions, 
    payments, 
    journalEntries,
    updatePaymentStatus,
    createPaymentFromInvoice
  };
};
