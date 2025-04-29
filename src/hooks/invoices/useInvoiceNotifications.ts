
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';

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
  created_at: string;
  updated_at: string;
}

export const useInvoiceNotifications = () => {
  const [unreadInvoicesCount, setUnreadInvoicesCount] = useState<number>(0);
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<string>(
    localStorage.getItem('lastInvoiceCheckTimestamp') || new Date().toISOString()
  );

  // Get recent pending invoices to check for unread ones
  const { data: recentInvoices = [] } = useSupabaseQuery<Invoice[]>(
    'invoices',
    {
      select: '*',
      order: { column: 'created_at', ascending: false },
      filter: [
        { column: 'created_at', operator: 'gt', value: lastCheckedTimestamp },
        { column: 'status', operator: 'eq', value: 'pending' }
      ]
    }
  );

  // Update unread count whenever we get new data
  useEffect(() => {
    setUnreadInvoicesCount(recentInvoices.length);
    
    // If we have new invoices, show a toast
    if (recentInvoices.length > 0) {
      toast(`${recentInvoices.length} new pending invoice${recentInvoices.length > 1 ? 's' : ''}`, {
        description: "Check the invoice queue for review",
        action: {
          label: "View",
          onClick: () => {
            window.location.href = '/accounting/invoice-queue';
            markAllAsRead();
          },
        },
      });
    }
  }, [recentInvoices]);

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem('lastInvoiceCheckTimestamp', now);
    setLastCheckedTimestamp(now);
    setUnreadInvoicesCount(0);
  };

  return {
    unreadInvoicesCount,
    markAllAsRead,
    recentInvoices
  };
};
