
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/types/invoice-types';
import { toast } from 'sonner';

export const useInvoiceDetails = (invoiceId?: string) => {
  const queryClient = useQueryClient();

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_line_items (*)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      return data || null;
    },
    enabled: !!invoiceId
  });

  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: (data) => {
      toast.success(`Invoice status updated to ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error) => {
      toast.error(`Failed to update invoice status: ${error}`);
    }
  });

  const addInvoiceLineItem = useMutation({
    mutationFn: async (lineItem: any) => {
      const { error } = await supabase
        .from('invoice_line_items')
        .insert({ ...lineItem, invoice_id: invoiceId });

      if (error) throw error;
      return lineItem;
    },
    onSuccess: () => {
      toast.success('Line item added to invoice');
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
    },
    onError: (error) => {
      toast.error(`Failed to add line item: ${error}`);
    }
  });

  const deleteInvoiceLineItem = useMutation({
    mutationFn: async (lineItemId: string) => {
      const { error } = await supabase
        .from('invoice_line_items')
        .delete()
        .eq('id', lineItemId);

      if (error) throw error;
      return lineItemId;
    },
    onSuccess: () => {
      toast.success('Line item removed from invoice');
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
    },
    onError: (error) => {
      toast.error(`Failed to remove line item: ${error}`);
    }
  });

  return {
    invoice,
    isLoading,
    error,
    updateInvoiceStatus,
    addInvoiceLineItem,
    deleteInvoiceLineItem
  };
};
