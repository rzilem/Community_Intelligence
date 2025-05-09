
import { useSupabaseUpdate } from '@/hooks/supabase';

/**
 * Hook for handling invoice save operations
 */
export const useInvoiceSave = () => {
  const { mutate: updateInvoice } = useSupabaseUpdate('invoices');

  const saveInvoice = async (invoice: any) => {
    console.group('Saving Invoice');
    console.log("Invoice to save:", {
      vendor: invoice.vendor,
      association_id: invoice.association || null,
      invoice_number: invoice.invoiceNumber,
      invoice_date: invoice.invoiceDate,
      due_date: invoice.dueDate,
      amount: invoice.totalAmount,
      status: invoice.status,
      payment_method: invoice.paymentType,
    });
    
    try {
      // Send the association_id as null if it's an empty string to avoid UUID validation errors
      // This is crucial for proper handling in the database
      const association_id = invoice.association ? invoice.association : null;
      console.log('Final association_id value being sent:', association_id);
      console.log('Final vendor value being sent:', invoice.vendor);
      
      const result = await updateInvoice({
        id: invoice.id,
        data: {
          vendor: invoice.vendor,
          association_id: association_id,
          invoice_number: invoice.invoiceNumber,
          invoice_date: invoice.invoiceDate,
          due_date: invoice.dueDate,
          amount: invoice.totalAmount,
          status: invoice.status,
          payment_method: invoice.paymentType,
        }
      });
      
      console.log('Save result:', result);
      console.groupEnd();
      return result;
    } catch (error) {
      console.error("Error saving invoice:", error);
      console.groupEnd();
      throw error;
    }
  };

  return {
    updateInvoice,
    saveInvoice
  };
};
