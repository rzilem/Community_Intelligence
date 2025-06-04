
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';

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
  const [unreadCount, setUnreadCount] = useState(0);

  // Get recent invoices for notifications
  const { data: recentInvoices = [] } = useSupabaseQuery(
    'invoices',
    {
      select: '*',
      filter: [
        {
          column: 'created_at',
          operator: 'gt',
          value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
        }
      ],
      order: { column: 'created_at', ascending: false },
      limit: 10
    }
  );

  useEffect(() => {
    setUnreadCount(recentInvoices.length);
  }, [recentInvoices]);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return {
    unreadCount,
    recentInvoices,
    markAllAsRead
  };
};
