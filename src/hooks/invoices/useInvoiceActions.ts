
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useInvoiceActions(refetch: () => Promise<any>) {
  const { toast } = useToast();

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
      
      toast({
        title: "Invoice updated",
        description: `Invoice status has been updated to ${status}.`
      });
      
      return true;
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast({
        title: "Error updating invoice",
        description: "There was an error updating the invoice status.",
        variant: "destructive"
      });
      
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
      
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted successfully."
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error deleting invoice",
        description: "There was an error deleting the invoice.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  return {
    updateInvoiceStatus,
    deleteInvoice
  };
}
