
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/types/invoice-types';
import { useInvoiceFilters } from './useInvoiceFilters';
import { useInvoiceColumns } from './useInvoiceColumns';
import { useAutoRefresh } from './useAutoRefresh';
import { useInvoiceActions } from './useInvoiceActions';

export const useInvoices = () => {
  const { toast } = useToast();
  const { 
    statusFilter, 
    setStatusFilter, 
    searchTerm, 
    setSearchTerm, 
    debouncedSearchTerm, 
    applyFilters 
  } = useInvoiceFilters();
  
  const { 
    columns, 
    visibleColumnIds, 
    updateVisibleColumns, 
    reorderColumns, 
    resetToDefaults 
  } = useInvoiceColumns();
  
  const { 
    lastRefreshed, 
    updateLastRefreshed, 
    autoRefreshEnabled, 
    toggleAutoRefresh, 
    refreshInterval, 
    setRefreshInterval 
  } = useAutoRefresh();

  // Fetch invoices using react-query with auto-refresh
  const { data: allInvoices = [], isLoading, refetch } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: async () => {
      console.log(`Fetching invoices with status filter: ${statusFilter}`);
      
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
        
      const { data, error } = await query;
        
      if (error) {
        console.error("Error fetching invoices:", error);
        toast({
          title: "Error loading invoices",
          description: "There was a problem fetching the invoice data.",
          variant: "destructive"
        });
        throw error;
      }
      
      console.log("Invoices fetched:", data?.length || 0, "records");
      if (data && data.length > 0) {
        console.log("First few invoices:", data.slice(0, 3));
      } else {
        console.log("No invoices found with current filter");
      }
      
      return data as Invoice[];
    },
    refetchInterval: autoRefreshEnabled ? refreshInterval : false,
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  const { updateInvoiceStatus, deleteInvoice } = useInvoiceActions(refetch);

  // Handler to refresh invoices
  const refreshInvoices = async () => {
    try {
      console.log("Manually refreshing invoices...");
      await refetch();
      updateLastRefreshed();
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

  // Apply search filter to the invoices
  const filteredInvoices = applyFilters(allInvoices || []);

  return {
    invoices: filteredInvoices,
    allInvoices,
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
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    autoRefreshEnabled,
    toggleAutoRefresh,
    refreshInterval,
    setRefreshInterval
  };
};
