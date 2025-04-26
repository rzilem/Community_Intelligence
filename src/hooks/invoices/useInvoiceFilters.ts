
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export function useInvoiceFilters() {
  // Change default from 'all' to 'pending'
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter invoices based on search term
  const applyFilters = <T extends { 
    invoice_number?: string; 
    vendor?: string; 
    description?: string;
    association_name?: string;
  }>(invoices: T[]) => {
    // If there's no search term, return all invoices unfiltered
    if (!debouncedSearchTerm || debouncedSearchTerm.trim() === '') return invoices;
    
    // Apply search filter when a search term exists
    const searchLower = debouncedSearchTerm.toLowerCase();
    return invoices.filter((invoice) => 
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
