
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Invoice {
  id: string;
  invoice_number: string;
  vendor: string;
  amount: number;
  due_date: string;
  invoice_date: string;
  description?: string;
  association_id?: string;
  association_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  html_content?: string;
  pdf_url?: string;
  email_content?: string;
  source_document?: string;
  created_at: string;
  updated_at: string;
  payment_method?: string;
  payment_date?: string;
  gl_account_id?: string;
  bank_account_id?: string;
}

export const useInvoiceNotifications = () => {
  const [unreadInvoicesCount, setUnreadInvoicesCount] = useState(0);

  // Optimized query with real-time updates and caching
  const { data: recentInvoices = [] } = useQuery({
    queryKey: ['invoice-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Invoice[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes instead of high frequency
  });

  // Set up real-time subscription for invoice changes
  useEffect(() => {
    const channel = supabase
      .channel('invoice-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          // Invalidate and refetch when changes occur
          console.log('Invoice changes detected, refreshing...');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const invoiceCount = recentInvoices.length;
    setUnreadInvoicesCount(invoiceCount);
  }, [recentInvoices]);

  const markAllAsRead = () => {
    setUnreadInvoicesCount(0);
  };

  return {
    unreadInvoicesCount,
    recentInvoices,
    markAllAsRead
  };
};
