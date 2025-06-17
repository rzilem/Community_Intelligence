
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Invoice } from '@/types/invoice-types';

interface UseInvoiceActionsProps {
  invoice: Invoice;
  onInvoiceUpdate?: (updatedInvoice: Invoice) => void;
}

export const useInvoiceActions = ({ invoice, onInvoiceUpdate }: UseInvoiceActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual approval logic
      toast.success('Invoice approved successfully');
      onInvoiceUpdate?.({ ...invoice, status: 'approved' });
    } catch (error) {
      toast.error('Failed to approve invoice');
      console.error('Approval error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [invoice, onInvoiceUpdate]);

  const handleReject = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual rejection logic
      toast.success('Invoice rejected');
      onInvoiceUpdate?.({ ...invoice, status: 'rejected' });
    } catch (error) {
      toast.error('Failed to reject invoice');
      console.error('Rejection error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [invoice, onInvoiceUpdate]);

  const handleDownload = useCallback(() => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    } else {
      toast.error('No PDF available for download');
    }
  }, [invoice.pdf_url]);

  const handleSend = useCallback(() => {
    // TODO: Implement send functionality
    toast.info('Send functionality not yet implemented');
  }, []);

  return {
    isLoading,
    handleApprove,
    handleReject,
    handleDownload,
    handleSend
  };
};
