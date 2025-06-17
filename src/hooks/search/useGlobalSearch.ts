
import { useState, useEffect, useMemo } from 'react';
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

export const useGlobalSearch = (query: string) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Data hooks
  const { associations } = useAssociations();
  const { homeownerRequests } = useHomeownerRequests();
  const { leads } = useLeads();
  const { invoices } = useInvoices();

  const searchResults = useMemo(() => {
    if (!query || query.length < 2) return [];

    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // Search associations
    associations?.forEach(association => {
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
      }
    });

    // Search homeowner requests (work orders)
    homeownerRequests?.forEach(request => {
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
      }
    });

    // Search leads
    leads?.forEach(lead => {
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
      }
    });

    // Search invoices
    invoices?.forEach(invoice => {
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
      }
    });

    // Limit results and sort by relevance
    return results.slice(0, 10).sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.title.toLowerCase() === searchTerm;
      const bExact = b.title.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then prioritize starts with
      const aStarts = a.title.toLowerCase().startsWith(searchTerm);
      const bStarts = b.title.toLowerCase().startsWith(searchTerm);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return 0;
    });
  }, [query, associations, homeownerRequests, leads, invoices]);

  const handleResultSelect = (result: SearchResult) => {
    navigate(result.path);
  };

  return {
    results: searchResults,
    isLoading,
    handleResultSelect
  };
};
