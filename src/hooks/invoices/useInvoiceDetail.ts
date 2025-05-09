
import { useInvoiceData } from './useInvoiceData';
import { useInvoiceLineItems } from './useInvoiceLineItems';
import { useInvoiceSave } from './useInvoiceSave';

/**
 * Main hook for invoice detail functionality
 */
export const useInvoiceDetail = (id: string | undefined) => {
  // Use our extracted hooks
  const {
    invoice,
    handleInvoiceChange,
    isNewInvoice,
    isLoadingInvoice,
    allInvoices,
    isLoadingAllInvoices
  } = useInvoiceData(id);

  const {
    lines,
    setLines,
    lineTotal,
    isBalanced
  } = useInvoiceLineItems(invoice.totalAmount);

  const {
    updateInvoice,
    saveInvoice: saveInvoiceToSupabase
  } = useInvoiceSave();

  // Wrapper for saveInvoice that uses our current invoice state
  const saveInvoice = () => {
    return saveInvoiceToSupabase(invoice);
  };

  return {
    invoice,
    lines,
    setLines,
    handleInvoiceChange,
    lineTotal,
    isBalanced,
    allInvoices,
    isLoadingAllInvoices,
    isLoadingInvoice,
    updateInvoice,
    saveInvoice,
    isNewInvoice
  };
};
