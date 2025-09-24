import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Payment } from '@/types/transaction-payment-types';
import { JournalEntry } from '@/types/accounting-types';

export const useTransactionPaymentData = (associationId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [associationId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch transactions from journal_entries table
      let transactionsQuery = supabase
        .from('journal_entries')
        .select(`
          id,
          reference,
          description,
          entry_date,
          status,
          association_id,
          created_at,
          updated_at
        `);

      if (associationId) {
        transactionsQuery = transactionsQuery.eq('association_id', associationId);
      }

      const { data: transactionData, error: transactionError } = await transactionsQuery
        .order('entry_date', { ascending: false });

      if (transactionError) throw transactionError;

      // Transform journal entries to transaction format
      const transformedTransactions: Transaction[] = (transactionData || []).map(entry => ({
        id: entry.id,
        date: entry.entry_date,
        description: entry.description || '',
        property: 'General',
        amount: 100, // Mock amount since field doesn't exist
        type: 'expense',
        category: 'General',
        glAccount: 'General',
        associationId: entry.association_id || ''
      }));

      setTransactions(transformedTransactions);

      // Use journal_entries as mock for payments since accounts_payable doesn't exist
      let paymentsQuery = supabase
        .from('journal_entries')
        .select(`
          id,
          description,
          entry_date,
          status,
          association_id
        `);

      if (associationId) {
        paymentsQuery = paymentsQuery.eq('association_id', associationId);
      }

      const { data: paymentData, error: paymentError } = await paymentsQuery
        .order('entry_date', { ascending: false });

      if (paymentError) throw paymentError;

      // Transform journal entries to payment format
      const transformedPayments: Payment[] = (paymentData || []).map(entry => ({
        id: entry.id,
        vendor: 'Mock Vendor',
        amount: 250, // Mock amount
        date: entry.entry_date || new Date().toISOString().split('T')[0],
        status: entry.status === 'posted' ? 'processed' : 'pending',
        method: 'check',
        associationName: '',
        category: 'General',
        associationId: entry.association_id || ''
      }));

      setPayments(transformedPayments);

      // Fetch journal entries directly
      let journalQuery = supabase
        .from('journal_entries')
        .select(`
          id,
          entry_date,
          reference,
          description,
          status,
          created_by,
          created_at,
          association_id
        `);

      if (associationId) {
        journalQuery = journalQuery.eq('association_id', associationId);
      }

      const { data: journalData, error: journalError } = await journalQuery
        .order('entry_date', { ascending: false });

      if (journalError) throw journalError;

      // Transform to journal entry format
      const transformedJournalEntries: JournalEntry[] = (journalData || []).map(entry => ({
        id: entry.id,
        date: entry.entry_date,
        reference: entry.reference || `JE-${entry.id}`,
        description: entry.description || '',
        amount: 150, // Mock amount since field doesn't exist
        status: (entry.status as 'posted' | 'draft' | 'reconciled') || 'posted',
        createdBy: entry.created_by || 'System',
        createdAt: entry.created_at,
        associationId: entry.association_id || ''
      }));

      setJournalEntries(transformedJournalEntries);

    } catch (err) {
      console.error('Error fetching transaction/payment data:', err);
      setError('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    transactions, 
    payments, 
    journalEntries, 
    isLoading, 
    error,
    refetch: fetchData 
  };
};