
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssociations } from '@/hooks/associations/useAssociations';
import { useHomeownerRequests } from '@/hooks/homeowners/useHomeownerRequests';
import { useLeads } from '@/hooks/leads/useLeads';
import { useInvoices } from '@/hooks/invoices/useInvoices';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'association' | 'owner' | 'lead' | 'invoice' | 'request' | 'property';
  path: string;
  matchedField?: string;
}

const SEARCH_DEBOUNCE_MS = 300;
const MAX_RESULTS_PER_TYPE = 10;
const MAX_TOTAL_RESULTS = 50;
const MIN_SEARCH_LENGTH = 2;

export const useOptimizedGlobalSearch = (query: string) => {
  const navigate = useNavigate();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    if (query !== debouncedQuery) {
      setIsSearching(true);
    }

    return () => clearTimeout(timer);
  }, [query, debouncedQuery]);

  // Only load data when we have a search query (lazy loading)
  const shouldLoadData = debouncedQuery.length >= MIN_SEARCH_LENGTH;
  
  // Data hooks with conditional loading
  const { associations } = useAssociations();
  const { homeownerRequests } = useHomeownerRequests();
  const { leads } = useLeads();
  const { invoices } = useInvoices();

  // Memoized search function for associations
  const searchAssociations = useCallback((searchTerm: string) => {
    if (!associations || !shouldLoadData) return [];
    
    const results: SearchResult[] = [];
    let count = 0;
    
    for (const association of associations) {
      if (count >= MAX_RESULTS_PER_TYPE) break;
      
      if (
        association.name?.toLowerCase().includes(searchTerm) ||
        association.address?.toLowerCase().includes(searchTerm) ||
        association.city?.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: association.id,
          title: association.name,
          subtitle: association.address || association.city,
          type: 'association',
          path: `/associations/${association.id}`,
          matchedField: association.name?.toLowerCase().includes(searchTerm) ? 'name' : 'address'
        });
        count++;
      }
    }
    
    return results;
  }, [associations, shouldLoadData]);

  // Memoized search function for homeowner requests
  const searchRequests = useCallback((searchTerm: string) => {
    if (!homeownerRequests || !shouldLoadData) return [];
    
    const results: SearchResult[] = [];
    let count = 0;
    
    for (const request of homeownerRequests) {
      if (count >= MAX_RESULTS_PER_TYPE) break;
      
      if (
        request.title?.toLowerCase().includes(searchTerm) ||
        request.description?.toLowerCase().includes(searchTerm) ||
        request.tracking_number?.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: request.id,
          title: request.title || `Request #${request.id.slice(-6)}`,
          subtitle: request.tracking_number || request.description?.slice(0, 50),
          type: 'request',
          path: `/homeowners/requests/${request.id}`,
          matchedField: 'request'
        });
        count++;
      }
    }
    
    return results;
  }, [homeownerRequests, shouldLoadData]);

  // Memoized search function for leads
  const searchLeads = useCallback((searchTerm: string) => {
    if (!leads || !shouldLoadData) return [];
    
    const results: SearchResult[] = [];
    let count = 0;
    
    for (const lead of leads) {
      if (count >= MAX_RESULTS_PER_TYPE) break;
      
      if (
        lead.first_name?.toLowerCase().includes(searchTerm) ||
        lead.last_name?.toLowerCase().includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm) ||
        lead.company?.toLowerCase().includes(searchTerm) ||
        lead.street_address?.toLowerCase().includes(searchTerm) ||
        lead.city?.toLowerCase().includes(searchTerm)
      ) {
        const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
        const addressParts = [lead.street_address, lead.city, lead.state].filter(Boolean);
        const address = addressParts.length > 0 ? addressParts.join(', ') : '';
        
        results.push({
          id: lead.id,
          title: fullName || lead.email || 'Unnamed Lead',
          subtitle: lead.company || address || lead.email,
          type: 'lead',
          path: `/leads/${lead.id}`,
          matchedField: 'lead'
        });
        count++;
      }
    }
    
    return results;
  }, [leads, shouldLoadData]);

  // Memoized search function for invoices
  const searchInvoices = useCallback((searchTerm: string) => {
    if (!invoices || !shouldLoadData) return [];
    
    const results: SearchResult[] = [];
    let count = 0;
    
    for (const invoice of invoices) {
      if (count >= MAX_RESULTS_PER_TYPE) break;
      
      if (
        invoice.invoice_number?.toLowerCase().includes(searchTerm) ||
        invoice.vendor?.toLowerCase().includes(searchTerm) ||
        invoice.description?.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: invoice.id,
          title: invoice.invoice_number || `Invoice #${invoice.id.slice(-6)}`,
          subtitle: `${invoice.vendor || 'Unknown Vendor'} - $${invoice.amount || '0'}`,
          type: 'invoice',
          path: `/invoices/${invoice.id}`,
          matchedField: 'invoice'
        });
        count++;
      }
    }
    
    return results;
  }, [invoices, shouldLoadData]);

  // Optimized search results with early returns and memoization
  const searchResults = useMemo(() => {
    // Early return for short queries
    if (!debouncedQuery || debouncedQuery.length < MIN_SEARCH_LENGTH) {
      return [];
    }

    const searchTerm = debouncedQuery.toLowerCase();
    
    // Get results from each category
    const associationResults = searchAssociations(searchTerm);
    const requestResults = searchRequests(searchTerm);
    const leadResults = searchLeads(searchTerm);
    const invoiceResults = searchInvoices(searchTerm);
    
    // Combine and limit total results
    const allResults = [
      ...associationResults,
      ...requestResults,
      ...leadResults,
      ...invoiceResults
    ];

    // Sort by relevance (exact matches first, then starts with)
    const sortedResults = allResults.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchTerm;
      const bExact = b.title.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      const aStarts = a.title.toLowerCase().startsWith(searchTerm);
      const bStarts = b.title.toLowerCase().startsWith(searchTerm);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return 0;
    });

    // Limit total results for performance
    return sortedResults.slice(0, MAX_TOTAL_RESULTS);
  }, [debouncedQuery, searchAssociations, searchRequests, searchLeads, searchInvoices]);

  const handleResultSelect = useCallback((result: SearchResult) => {
    navigate(result.path);
  }, [navigate]);

  return {
    results: searchResults,
    isLoading: isSearching,
    handleResultSelect,
    isDebouncing: query !== debouncedQuery,
    hasMinLength: debouncedQuery.length >= MIN_SEARCH_LENGTH
  };
};
