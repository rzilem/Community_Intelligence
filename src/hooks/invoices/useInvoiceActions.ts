
import { showToast } from '@/utils/toast-helpers';
import { supabase } from '@/integrations/supabase/client';

export function useInvoiceActions(refetch: () => Promise<any>) {
  // Function to update invoice status
  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh data
      await refetch();
      
      showToast.success(`Invoice updated`, `Invoice status has been updated to ${status}.`);
      
      return true;
    } catch (error) {
      console.error("Error updating invoice status:", error);
      showToast.error(`Error updating invoice`, `There was an error updating the invoice status.`);
      
      return false;
    }
  };

  // Function to delete invoice
  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh data
      await refetch();
      
      showToast.success(`Invoice deleted`, `The invoice has been deleted successfully.`);
      
      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      showToast.error(`Error deleting invoice`, `There was an error deleting the invoice.`);
      
      return false;
    }
  };

  return {
    updateInvoiceStatus,
    deleteInvoice
  };
}
