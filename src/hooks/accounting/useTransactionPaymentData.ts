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
          reference_number,
          description,
          amount,
          entry_date,
          entry_type,
          account_name,
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
        property: 'General', // Could be enhanced with property mapping
        amount: Number(entry.amount) || 0,
        type: entry.entry_type?.toLowerCase() === 'debit' ? 'expense' : 'income',
        category: entry.account_name || 'General',
        glAccount: entry.account_name || 'General',
        associationId: entry.association_id || ''
      }));

      setTransactions(transformedTransactions);

      // Fetch payments from accounts_payable table
      let paymentsQuery = supabase
        .from('accounts_payable')
        .select(`
          id,
          vendor_name,
          original_amount,
          invoice_date,
          status,
          association_id,
          gl_account_code,
          description
        `);

      if (associationId) {
        paymentsQuery = paymentsQuery.eq('association_id', associationId);
      }

      const { data: paymentData, error: paymentError } = await paymentsQuery
        .order('invoice_date', { ascending: false });

      if (paymentError) throw paymentError;

      // Transform accounts payable to payment format
      const transformedPayments: Payment[] = (paymentData || []).map(ap => ({
        id: ap.id,
        vendor: ap.vendor_name || 'Unknown Vendor',
        amount: Number(ap.original_amount) || 0,
        date: ap.invoice_date || new Date().toISOString().split('T')[0],
        status: ap.status === 'paid' ? 'processed' : 
               ap.status === 'approved' ? 'scheduled' : 'pending',
        method: 'check', // Default method
        associationName: '', // Could be fetched from associations table
        category: ap.gl_account_code || 'General',
        associationId: ap.association_id || ''
      }));

      setPayments(transformedPayments);

      // Fetch journal entries directly
      let journalQuery = supabase
        .from('journal_entries')
        .select(`
          id,
          entry_date,
          reference_number,
          description,
          amount,
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
        reference: entry.reference_number || `JE-${entry.id}`,
        description: entry.description || '',
        amount: Number(entry.amount) || 0,
        status: entry.status || 'posted',
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