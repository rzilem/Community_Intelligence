
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from './useInvoiceNotifications';

// Column configuration type
export type InvoiceColumn = {
  id: string;
  label: string;
  accessorKey: string;
  sortable: boolean;
};

export const useInvoices = () => {
  const { toast } = useToast();
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    JSON.parse(localStorage.getItem('invoiceColumnsVisible') || 'null') || 
    ['invoice_number', 'vendor', 'association_name', 'invoice_date', 'amount', 'due_date', 'status']
  );
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Define columns for the invoices table
  const columns: InvoiceColumn[] = [
    { id: 'invoice_number', label: 'Invoice #', accessorKey: 'invoice_number', sortable: true },
    { id: 'vendor', label: 'Vendor', accessorKey: 'vendor', sortable: true },
    { id: 'association_name', label: 'HOA', accessorKey: 'association_name', sortable: true },
    { id: 'invoice_date', label: 'Invoice Date', accessorKey: 'invoice_date', sortable: true },
    { id: 'amount', label: 'Amount', accessorKey: 'amount', sortable: true },
    { id: 'due_date', label: 'Due Date', accessorKey: 'due_date', sortable: true },
    { id: 'status', label: 'Status', accessorKey: 'status', sortable: true },
    { id: 'description', label: 'Description', accessorKey: 'description', sortable: false },
  ];

  // Fetch invoices using react-query directly
  const { data: invoices = [], isLoading, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      console.log("Fetching invoices...");
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching invoices:", error);
        throw error;
      }
      
      console.log("Invoices fetched:", data?.length || 0, "records");
      console.log("First few invoices:", data?.slice(0, 3));
      
      return data as Invoice[];
    },
    // Increase polling frequency to detect new invoices faster
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Update visible columns in local storage
  useEffect(() => {
    localStorage.setItem('invoiceColumnsVisible', JSON.stringify(visibleColumnIds));
  }, [visibleColumnIds]);

  // Handler to update visible columns
  const updateVisibleColumns = (selectedColumns: string[]) => {
    setVisibleColumnIds(selectedColumns);
  };

  // Handler to reorder columns
  const reorderColumns = (startIndex: number, endIndex: number) => {
    const result = Array.from(visibleColumnIds);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setVisibleColumnIds(result);
  };

  // Handler to reset columns to defaults
  const resetToDefaults = () => {
    setVisibleColumnIds([
      'invoice_number', 'vendor', 'association_name', 'invoice_date', 'amount', 'due_date', 'status'
    ]);
  };

  // Handler to refresh invoices
  const refreshInvoices = async () => {
    try {
      console.log("Manually refreshing invoices...");
      await refetch();
      setLastRefreshed(new Date());
      toast({
        title: "Invoices refreshed",
        description: "The invoice list has been updated."
      });
    } catch (error) {
      console.error("Error refreshing invoices:", error);
      toast({
        title: "Error refreshing invoices",
        description: "There was an error refreshing the invoice list.",
        variant: "destructive"
      });
    }
  };

  // Function to update invoice status
  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh data
      await refetch();
      
      toast({
        title: "Invoice updated",
        description: `Invoice status has been updated to ${status}.`
      });
      
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast({
        title: "Error updating invoice",
        description: "There was an error updating the invoice status.",
        variant: "destructive"
      });
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
      
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error deleting invoice",
        description: "There was an error deleting the invoice.",
        variant: "destructive"
      });
    }
  };

  return {
    invoices,
    isLoading,
    refreshInvoices,
    updateInvoiceStatus,
    deleteInvoice,
    columns,
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults,
    lastRefreshed,
    statusFilter,
    setStatusFilter
  };
};
