
import { useState, useEffect } from 'react';
import { useInvoiceNotifications } from '@/hooks/invoices/useInvoiceNotifications';
import { useLeadNotifications } from '@/hooks/leads/useLeadNotifications';
import { useHomeownerRequestNotifications } from '@/hooks/homeowners/useHomeownerRequestNotifications';
import { useResaleEventNotifications } from '@/hooks/resale/useResaleEventNotifications';

export interface SectionNotifications {
  [key: string]: number;
}

export const useNotifications = () => {
  const [sectionCounts, setSectionCounts] = useState<SectionNotifications>({});
  const { unreadLeadsCount } = useLeadNotifications();
  const { unreadInvoicesCount } = useInvoiceNotifications();
  const { unreadRequestsCount } = useHomeownerRequestNotifications();
  const { unreadEventsCount } = useResaleEventNotifications();
  
  useEffect(() => {
    const counts: SectionNotifications = {
      // Mapping section names to their notification counts
      'lead-management': unreadLeadsCount,
      'accounting': unreadInvoicesCount,
      'community-management': unreadRequestsCount,
      'resale-management': unreadEventsCount,
      'communications': 3 // Keep mock value for communications for now
    };
    
    setSectionCounts(counts);
  }, [unreadLeadsCount, unreadInvoicesCount, unreadRequestsCount, unreadEventsCount]);

  // Get the count for a specific section
  const getCountForSection = (section: string): number => {
    return sectionCounts[section] || 0;
  };
  
  // Get the total count across all sections
  const getTotalCount = (): number => {
    return Object.values(sectionCounts).reduce((total, count) => total + count, 0);
  };

  return {
    sectionCounts,
    getCountForSection,
    getTotalCount
  };
};
