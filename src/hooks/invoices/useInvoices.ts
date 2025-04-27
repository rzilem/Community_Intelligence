
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/types/invoice-types';
import { useInvoiceFilters } from './useInvoiceFilters';
import { useInvoiceColumns } from './useInvoiceColumns';
import { useAutoRefresh } from './useAutoRefresh';
import { useInvoiceActions } from './useInvoiceActions';
import { toast } from 'sonner';

export const useInvoices = () => {
  const { toast: uiToast } = useToast();
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
  const { data: allInvoices = [], isLoading, refetch, error } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: async () => {
      console.log(`Fetching invoices with status filter: ${statusFilter}`);
      
      try {
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
          throw error;
        }
        
        console.log("Invoices fetched:", data?.length || 0, "records");
        if (data && data.length > 0) {
          console.log("First few invoices:", data.slice(0, 3));
        } else {
          console.log("No invoices found with current filter");
        }
        
        return data as Invoice[];
      } catch (err) {
        console.error("Query execution error:", err);
        toast.error("Failed to fetch invoices");
        return [];
      }
    },
    refetchInterval: autoRefreshEnabled ? refreshInterval : false,
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  useEffect(() => {
    if (error) {
      console.error("Error in invoice query:", error);
      toast.error("Failed to load invoices");
    }
  }, [error]);

  const { updateInvoiceStatus, deleteInvoice } = useInvoiceActions(refetch);

  // Handler to refresh invoices
  const refreshInvoices = async () => {
    try {
      console.log("Manually refreshing invoices...");
      await refetch();
      updateLastRefreshed();
      toast.success("Invoices refreshed");
    } catch (error) {
      console.error("Error refreshing invoices:", error);
      toast.error("Failed to refresh invoices");
    }
  };

  // Apply search filter to the invoices
  const filteredInvoices = applyFilters(allInvoices || []);

  // Debug log for filtered invoices
  useEffect(() => {
    console.log(`After filtering: ${filteredInvoices.length} invoices match criteria (${statusFilter}, search: "${searchTerm}")`);
  }, [filteredInvoices.length, statusFilter, searchTerm]);

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
