
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const hasShownToast = useRef(false);
  
  // Use localStorage for persistence but keep a ref to the value to avoid re-renders
  const lastCheckedRef = useRef<string>(
    localStorage.getItem('lastInvoiceCheckTimestamp') || new Date().toISOString()
  );

  // Get recent invoices to check for unread ones
  const { data: recentInvoices = [] } = useSupabaseQuery<Invoice[]>(
    'invoices',
    {
      select: '*',
      order: { column: 'created_at', ascending: false },
      filter: [
        { column: 'created_at', operator: 'gt', value: lastCheckedRef.current }
      ]
    }
  );

  // Use a stable effect dependency
  const recentInvoicesLength = recentInvoices.length;

  // Update unread count whenever we get new data
  useEffect(() => {
    if (!recentInvoices) return;
    
    setUnreadInvoicesCount(recentInvoicesLength);
    
    // Show toast only once per session for new invoices
    if (recentInvoicesLength > 0 && !hasShownToast.current) {
      hasShownToast.current = true;
      toast(`${recentInvoicesLength} new invoice${recentInvoicesLength > 1 ? 's' : ''} received`, {
        description: "Check the invoice queue for details",
        action: {
          label: "View",
          onClick: () => {
            window.location.href = '/accounting/invoice-queue';
            markAllAsRead();
          },
        },
      });
    }
  }, [recentInvoicesLength]);

  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem('lastInvoiceCheckTimestamp', now);
    lastCheckedRef.current = now;
    setUnreadInvoicesCount(0);
    hasShownToast.current = false;
  }, []);

  return {
    unreadInvoicesCount,
    markAllAsRead
  };
};
