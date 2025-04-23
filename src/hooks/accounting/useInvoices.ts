
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceFilterOptions } from '@/types/invoice-types';
import { toast } from 'sonner';

interface UseInvoicesOptions {
  associationId?: string;
  filter?: InvoiceFilterOptions;
  limit?: number;
}

export const useInvoices = (options: UseInvoicesOptions = {}) => {
  const { associationId, filter, limit } = options;
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['invoices', associationId, filter],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          invoice_line_items (*)
        `)
        .order('invoice_date', { ascending: false });
      
      if (associationId) {
        query = query.eq('association_id', associationId);
      }
      
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter?.vendor) {
        query = query.ilike('vendor', `%${filter.vendor}%`);
      }
      
      if (filter?.startDate) {
        query = query.gte('invoice_date', filter.startDate);
      }
      
      if (filter?.endDate) {
        query = query.lte('invoice_date', filter.endDate);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!associationId
  });

  const createInvoiceWithLineItems = useMutation({
    mutationFn: async (invoice: Invoice & { line_items: any[] }) => {
      const { line_items, ...invoiceData } = invoice;
      
      // Begin a transaction
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      if (line_items && line_items.length > 0) {
        // Add invoice_id to each line item
        const lineItemsWithInvoiceId = line_items.map(item => ({
          ...item,
          invoice_id: newInvoice.id
        }));
        
        const { error: lineItemsError } = await supabase
          .from('invoice_line_items')
          .insert(lineItemsWithInvoiceId);
        
        if (lineItemsError) throw lineItemsError;
      }
      
      return newInvoice;
    },
    onSuccess: () => {
      toast.success('Invoice created successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    }
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
      toast.success(`Invoice marked as ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error) => {
      toast.error(`Failed to update invoice: ${error.message}`);
    }
  });

  return {
    invoices,
    isLoading,
    error,
    createInvoiceWithLineItems,
    updateInvoiceStatus
  };
};
