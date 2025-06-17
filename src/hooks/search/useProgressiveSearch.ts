
import { useMemo, useCallback } from 'react';
import { SearchResult } from './useOptimizedGlobalSearch';

interface ProgressiveSearchData {
  associations: any[];
  homeownerRequests: any[];
  leads: any[];
  invoices: any[];
}

interface ProgressiveSearchStates {
  associations: boolean;
  homeownerRequests: boolean;
  leads: boolean;
  invoices: boolean;
}

const MAX_RESULTS_PER_TYPE = 10;

export const useProgressiveSearch = (
  query: string,
  searchData: ProgressiveSearchData,
  loadedStates: ProgressiveSearchStates
) => {
  
  // Search functions for each data type
  const searchAssociations = useCallback((searchTerm: string, data: any[]) => {
    if (!data.length) return [];
    
    const results: SearchResult[] = [];
    let count = 0;
    
    for (const association of data) {
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
  }, []);

  const searchRequests = useCallback((searchTerm: string, data: any[]) => {
    if (!data.length) return [];
    
    const results: SearchResult[] = [];
    let count = 0;
    
    for (const request of data) {
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
  }, []);

  const searchLeads = useCallback((searchTerm: string, data: any[]) => {
    if (!data.length) return [];
    
    const results: SearchResult[] = [];
    let count = 0;
    
    for (const lead of data) {
      if (count >= MAX_RESULTS_PER_TYPE) break;
      
      if (
        lead.first_name?.toLowerCase().includes(searchTerm) ||
        lead.last_name?.toLowerCase().includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm) ||
        lead.company?.toLowerCase().includes(searchTerm)
      ) {
        const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
        
        results.push({
          id: lead.id,
          title: fullName || lead.email || 'Unnamed Lead',
          subtitle: lead.company || lead.email,
          type: 'lead',
          path: `/leads/${lead.id}`,
          matchedField: 'lead'
        });
        count++;
      }
    }
    
    return results;
  }, []);

  const searchInvoices = useCallback((searchTerm: string, data: any[]) => {
    if (!data.length) return [];
    
    const results: SearchResult[] = [];
    let count = 0;
    
    for (const invoice of data) {
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
  }, []);

  // Progressive search results
  const progressiveResults = useMemo(() => {
    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    const allResults: SearchResult[] = [];

    // Add results as data becomes available
    if (loadedStates.associations) {
      allResults.push(...searchAssociations(searchTerm, searchData.associations));
    }
    
    if (loadedStates.homeownerRequests) {
      allResults.push(...searchRequests(searchTerm, searchData.homeownerRequests));
    }
    
    if (loadedStates.leads) {
      allResults.push(...searchLeads(searchTerm, searchData.leads));
    }
    
    if (loadedStates.invoices) {
      allResults.push(...searchInvoices(searchTerm, searchData.invoices));
    }

    // Sort by relevance
    return allResults.sort((a, b) => {
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
  }, [query, searchData, loadedStates, searchAssociations, searchRequests, searchLeads, searchInvoices]);

  // Get data loading status for each category
  const getCategoryStatus = useCallback(() => {
    return {
      associations: {
        loaded: loadedStates.associations,
        hasResults: loadedStates.associations && searchData.associations.length > 0
      },
      requests: {
        loaded: loadedStates.homeownerRequests,
        hasResults: loadedStates.homeownerRequests && searchData.homeownerRequests.length > 0
      },
      leads: {
        loaded: loadedStates.leads,
        hasResults: loadedStates.leads && searchData.leads.length > 0
      },
      invoices: {
        loaded: loadedStates.invoices,
        hasResults: loadedStates.invoices && searchData.invoices.length > 0
      }
    };
  }, [loadedStates, searchData]);

  return {
    results: progressiveResults,
    categoryStatus: getCategoryStatus()
  };
};
