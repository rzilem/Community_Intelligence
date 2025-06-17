
import { useState, useMemo } from 'react';
import { Invoice } from '@/types/invoice-types';

interface UseEnhancedInvoiceDataProps {
  invoice: Invoice;
}

export const useEnhancedInvoiceData = ({ invoice }: UseEnhancedInvoiceDataProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized calculations
  const invoiceMetadata = useMemo(() => {
    const daysUntilDue = Math.ceil(
      (new Date(invoice.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const isOverdue = daysUntilDue < 0;
    const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;
    
    return {
      daysUntilDue,
      isOverdue,
      isDueSoon,
      formattedAmount: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(invoice.amount),
      hasAttachments: !!(invoice.pdf_url || invoice.html_content),
      hasAIData: !!(invoice.email_content)
    };
  }, [invoice]);

  const clearError = () => setError(null);

  return {
    isLoading,
    setIsLoading,
    error,
    setError,
    clearError,
    invoiceMetadata
  };
};
