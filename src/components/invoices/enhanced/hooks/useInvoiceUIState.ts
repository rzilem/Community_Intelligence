
import { useState, useMemo } from 'react';
import { Invoice } from '@/types/invoice-types';

interface UseInvoiceUIStateProps {
  invoice: Invoice;
  showPreview?: boolean;
}

export const useInvoiceUIState = ({ invoice, showPreview = true }: UseInvoiceUIStateProps) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const layoutConfig = useMemo(() => ({
    showPreview,
    hasPreview: !!(invoice.pdf_url || invoice.html_content || invoice.email_content),
    isFullWidth: !showPreview
  }), [showPreview, invoice.pdf_url, invoice.html_content, invoice.email_content]);

  const toggleEditMode = () => setIsEditMode(prev => !prev);

  return {
    isEditMode,
    layoutConfig,
    toggleEditMode,
    setIsEditMode
  };
};
