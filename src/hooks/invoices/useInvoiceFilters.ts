
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

export function useInvoiceFilters() {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Log for debugging when status filter changes
    console.log(`Invoice status filter changed to: ${statusFilter}`);
  }, [statusFilter]);

  // Filter invoices based on search term
  const applyFilters = <T extends { 
    invoice_number?: string; 
    vendor?: string; 
    description?: string;
    association_name?: string;
    status?: string;
  }>(invoices: T[]) => {
    // First apply status filter if it's not 'all'
    let filteredByStatus = invoices;
    if (statusFilter !== 'all') {
      filteredByStatus = invoices.filter(invoice => invoice.status === statusFilter);
    }
    
    // Then apply search filter if present
    if (!debouncedSearchTerm || debouncedSearchTerm.trim() === '') {
      return filteredByStatus;
    }
    
    // Apply search filter when a search term exists
    const searchLower = debouncedSearchTerm.toLowerCase();
    return filteredByStatus.filter((invoice) => 
      (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(searchLower)) || 
      (invoice.vendor && invoice.vendor.toLowerCase().includes(searchLower)) || 
      (invoice.description && invoice.description.toLowerCase().includes(searchLower)) || 
      (invoice.association_name && invoice.association_name.toLowerCase().includes(searchLower))
    );
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
