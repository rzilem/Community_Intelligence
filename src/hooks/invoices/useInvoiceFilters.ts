
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

export function useInvoiceFilters() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    console.log(`Invoice filter state:`, {
      status: statusFilter,
      search: searchTerm,
      debouncedSearch: debouncedSearchTerm
    });
  }, [statusFilter, searchTerm, debouncedSearchTerm]);

  const applyFilters = <T extends { 
    invoice_number?: string; 
    vendor?: string; 
    description?: string;
    association_name?: string;
    status?: string;
  }>(invoices: T[]) => {
    console.log('Applying filters to invoices:', {
      totalInvoices: invoices.length,
      statusFilter,
      searchTerm: debouncedSearchTerm
    });

    // First apply status filter if it's not 'all'
    let filteredByStatus = invoices;
    if (statusFilter !== 'all') {
      filteredByStatus = invoices.filter(invoice => invoice.status === statusFilter);
      console.log(`After status filter (${statusFilter}):`, filteredByStatus.length);
    }
    
    // Then apply search filter if present
    if (!debouncedSearchTerm || debouncedSearchTerm.trim() === '') {
      return filteredByStatus;
    }
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    const filtered = filteredByStatus.filter((invoice) => 
      (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(searchLower)) || 
      (invoice.vendor && invoice.vendor.toLowerCase().includes(searchLower)) || 
      (invoice.description && invoice.description.toLowerCase().includes(searchLower)) || 
      (invoice.association_name && invoice.association_name.toLowerCase().includes(searchLower))
    );

    console.log('After search filter:', {
      searchTerm: searchLower,
      matchingInvoices: filtered.length
    });

    return filtered;
  };

  return {
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    applyFilters
  };
}
