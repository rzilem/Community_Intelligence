
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
    queryKey: ['invoices'],
    queryFn: async () => {
      console.log('Fetching all invoices');
      
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching invoices:", error);
          throw error;
        }
        
        console.log("Invoices fetched:", {
          total: data?.length || 0,
          sample: data?.slice(0, 3)
        });
        
        return data as Invoice[];
      } catch (err) {
        console.error("Query execution error:", err);
        toast.error("Failed to fetch invoices");
        return [];
      }
    },
    refetchInterval: autoRefreshEnabled ? refreshInterval : false,
    staleTime: 5000,
  });

  useEffect(() => {
    if (error) {
      console.error("Error in invoice query:", error);
      toast.error("Failed to load invoices");
    }
  }, [error]);

  const { updateInvoiceStatus, deleteInvoice } = useInvoiceActions(refetch);

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

  // Apply filters to all invoices
  const filteredInvoices = applyFilters(allInvoices || []);

  // Debug logging
  useEffect(() => {
    console.log('Invoice hook state:', {
      totalInvoices: allInvoices?.length || 0,
      filteredCount: filteredInvoices.length,
      status: statusFilter,
      search: searchTerm
    });
  }, [allInvoices?.length, filteredInvoices.length, statusFilter, searchTerm]);

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
